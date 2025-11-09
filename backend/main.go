package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	openai "github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

const apiKey = "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"

// -------- Inventory (acts as your product DB) --------
var defaultFoodOptions = map[string]string{
	"rice":                  "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/d094/34fde360b47caa5fc49658cd730ed49e764c46c08a4dedbe00c0a8e10b06.jpg",
	"kimchi stew with pork": "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/63802549765540-0420b1d6-40b4-4ace-ae0b-f1adb362f3a7.png",
	"seoul milk":            "https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/vendor_inventory/73de/eb09fc89efab772c29e42ef61622b7589f43cc0867597d5000ec61b966eb.jpg",
}

// Precompute a case-insensitive lookup to be tolerant to capitalization
var invKeyCI map[string]string

func init() {
	invKeyCI = make(map[string]string, len(defaultFoodOptions))
	for k := range defaultFoodOptions {
		invKeyCI[strings.ToLower(k)] = k
	}
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only set CORS headers when the request actually has an Origin (i.e., browser)
		origin := r.Header.Get("Origin")
		if origin != "" {
			// Wildcard = allow all domains (works only when you DO NOT use credentials)
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			// Keep Allowed-Headers in sync with what your frontend sends
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			// Cache preflight for a day (adjust as needed)
			w.Header().Set("Access-Control-Max-Age", "86400")
		}

		// Short-circuit CORS preflight
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// For actual requests
		next.ServeHTTP(w, r)
	})
}

// -------- JSON contract (updated) --------
type FoodOption struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`        // MUST match one of the inventory keys exactly
	Description  string   `json:"description"`  // 1–2 sentences
	Brand        string   `json:"brand"`        // fabricated ok
	MainFeatures []string `json:"mainFeatures"` // noun phrases
	Tags         []string `json:"tags,omitempty"`
	PriceKRW     int      `json:"priceKRW"`
	DeliveryDays int      `json:"deliveryDays"` // integer days
	Category     string   `json:"category"`
	ImageURL     string   `json:"imageUrl,omitempty"` // attached server-side after parsing
}

// -------- HTTP payload --------
type ChatRequest struct {
	SessionID string `json:"session_id"`
	Message   string `json:"message"`
}

// -------- Session store (in-mem) --------
type Session struct {
	mu       sync.Mutex
	messages []openai.ChatCompletionMessageParamUnion
}

var (
	sessions   = map[string]*Session{}
	sessionsMu sync.Mutex
)

// Build a deterministic, strict system prompt that:
//   - Shows inventory keys
//   - Forces titles to be exactly one of those keys
//   - Forces valid schema and “Coupang-like” style
func buildSystemPrompt() string {
	keys := make([]string, 0, len(defaultFoodOptions))
	for k := range defaultFoodOptions {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	inventoryJSON, _ := json.Marshal(keys)

	return fmt.Sprintf(`
You are a product selector for a small catalog.

AVAILABLE_INVENTORY (product titles):
%s

RULES:
1) Output ONE JSON array only (no markdown, no prose).
2) Use EXACTLY this schema for each element:
[
  {
    "id":"string",
    "title":"string",          // MUST be exactly one of AVAILABLE_INVENTORY
    "description":"string",    // 1–2 sentences, Coupang tone
    "brand":"string",          // fabricate if needed
    "mainFeatures":["string"], // 3–6 concise noun phrases
    "tags":["string"],         // optional
    "priceKRW":0,              // realistic pricing in KRW
    "deliveryDays":0,          // integer, prefer fast delivery
    "category":"string"        // e.g., "staple", "soup", "dairy"
  }
]
3) Return 1 item only in the array. Do NOT invent titles outside AVAILABLE_INVENTORY.
4) Titles: 3–8 words and MUST equal an AVAILABLE_INVENTORY item (case-sensitive match).
5) Be helpful to the user intent, but if unclear, pick two generally appealing items.
`, string(inventoryJSON))
}

func getSession(id string) *Session {
	sessionsMu.Lock()
	defer sessionsMu.Unlock()
	if s, ok := sessions[id]; ok {
		return s
	}
	s := &Session{}
	s.messages = []openai.ChatCompletionMessageParamUnion{
		openai.SystemMessage(buildSystemPrompt()),
	}
	sessions[id] = s
	return s
}

// -------- Model call --------
func callModel(ctx context.Context, client openai.Client, msgs []openai.ChatCompletionMessageParamUnion) ([]FoodOption, error) {
	resp, err := client.Chat.Completions.New(
		ctx,
		openai.ChatCompletionNewParams{
			Model:       openai.ChatModelGPT4oMini,
			Messages:    msgs,
			Temperature: openai.Float(0.2),
		},
	)
	if err != nil {
		return nil, err
	}
	if len(resp.Choices) == 0 {
		return nil, errors.New("no choices")
	}

	var arr []FoodOption

	// Safety: try to extract the first JSON array even if the model wraps it accidentally
	content := strings.TrimSpace(resp.Choices[0].Message.Content)
	jsonArray := firstJSONArray(content)
	if jsonArray == "" {
		jsonArray = content
	}
	if err := json.Unmarshal([]byte(jsonArray), &arr); err != nil {
		return nil, fmt.Errorf("parse error: %w\nraw: %s", err, content)
	}
	if len(arr) == 0 {
		return nil, errors.New("zero options from model")
	}

	// Enforce inventory mapping (case-insensitive title lookup; then attach image URL)
	for i := range arr {
		// normalize & validate title against inventory
		titleCI := strings.ToLower(strings.TrimSpace(arr[i].Title))
		if canonical, ok := invKeyCI[titleCI]; ok {
			arr[i].Title = canonical // normalize capitalization to canonical key
			arr[i].ImageURL = defaultFoodOptions[canonical]
		} else {
			// If model violated the rule, drop image and mark invalid title (optional hard fail)
			// You can choose to hard fail instead:
			// return nil, fmt.Errorf("model returned unknown title %q (not in inventory)", arr[i].Title)
			arr[i].ImageURL = ""
		}
	}

	return arr, nil
}

// Extracts the first JSON array substring if the model accidentally adds prose
var jsonArrayRe = regexp.MustCompile(`(?s)\[\s*\{.*?\}\s*\]`)

func firstJSONArray(s string) string {
	m := jsonArrayRe.FindString(s)
	return m
}

// -------- HTTP handler --------
func chatHandler(client openai.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("chat request v2")
		ctx := r.Context()
		var req ChatRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "bad request: "+err.Error(), http.StatusBadRequest)
			return
		}
		if req.SessionID == "" || req.Message == "" {
			http.Error(w, "session_id and message required", http.StatusBadRequest)
			return
		}

		s := getSession(req.SessionID)

		// Append user message → call model
		s.mu.Lock()
		s.messages = append(s.messages, openai.UserMessage(req.Message))
		msgs := make([]openai.ChatCompletionMessageParamUnion, len(s.messages))
		copy(msgs, s.messages)
		s.mu.Unlock()

		out, err := callModel(ctx, client, msgs)
		if err != nil {
			http.Error(w, "model error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Persist assistant JSON output (steers subsequent turns)
		if b, _ := json.Marshal(out); len(b) > 0 {
			s.mu.Lock()
			s.messages = append(s.messages, openai.AssistantMessage(string(b)))
			s.mu.Unlock()
		}

		// Return the JSON directly (no envelope)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(out)
	}
}

func main() {
	// Provide your key via env var or secret management
	client := openai.NewClient(option.WithAPIKey(apiKey))

	mux := http.NewServeMux()
	mux.Handle("/chat", chatHandler(client))

	handler := cors(mux)

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 20 * time.Second,
	}
	log.Println("listening on :8080")
	log.Fatal(srv.ListenAndServe())
}
