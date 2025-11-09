#!/bin/bash
set -e -E

GEMINI_API_KEY="AIzaSyAsMx_FkEUukIHX2tlZwqhj2cNy18LUXog"
MODEL_ID="gemini-2.5-flash-image"
GENERATE_CONTENT_API="streamGenerateContent"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "매콤한 양념으로 볶아낸 닭갈비와 신선한 채소가 가득! 30분 이내 빠른 배달."
          },
        ]
      },
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE", "TEXT", ],
      "imageConfig": {
        "image_size": "1K"
      },
    },
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'
