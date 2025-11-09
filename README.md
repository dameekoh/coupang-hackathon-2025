# Voice-Controlled Shopping Assistant

This project is a web application that serves as a voice-controlled shopping assistant. Users can speak to the application to search for products, view recommendations, and add items to a shopping cart.

## Features

- **Voice-to-Text:** Utilizes the browser's Web Speech API to transcribe user voice commands.
- **AI-Powered Recommendations:** Sends transcribed text to a backend service that uses a Large Language Model (LLM) to find the best product match from an inventory.
- **Interactive UI:** A modern, responsive interface built with React, featuring animations and real-time updates.
- **Shopping Cart:** Fully functional cart to add, update, and view items.
- **Infrastructure as Code:** All cloud infrastructure is defined and managed using Terraform for automated and repeatable deployments.

## Tech Stack

### Frontend

| Tech          | Description                               |
|---------------|-------------------------------------------|
| **React**     | A JavaScript library for building user interfaces. |
| **TypeScript**| Typed superset of JavaScript.             |
| **Vite**      | Next-generation frontend tooling for fast development. |
| **Zustand**   | A small, fast, and scalable state management solution. |
| **Tailwind CSS**| A utility-first CSS framework for rapid UI development. |
| **Framer Motion**| A production-ready motion library for React. |

### Backend

| Tech          | Description                               |
|---------------|-------------------------------------------|
| **Go**        | A statically typed, compiled language.    |
| **net/http**  | Go's standard library for building HTTP servers. |
| **OpenAI API**| Used for natural language understanding and product recommendation. |

### Infrastructure

| Tech          | Description                               |
|---------------|-------------------------------------------|
| **AWS**       | Amazon Web Services, the cloud provider.  |
| **Terraform** | An open-source infrastructure as code software tool. |
| **Caddy**     | A modern, open-source web server with automatic HTTPS. |


## Implementation Details

### Frontend

The frontend is a single-page application built with React and TypeScript.

- **Voice Recognition:** The `useVoiceRecorder.ts` hook encapsulates the logic for interacting with the browser's Web Speech API (`SpeechRecognition`). It manages the recording state, handles transcription (both interim and final results), and detects simple commands ("yes", "add", "cart").
- **State Management:** Global state, such as the contents of the shopping cart, is managed using Zustand (`cartStore.ts`). This provides a simple and effective way to share state between components without prop drilling.
- **API Communication:** The `services/api.ts` file handles communication with the backend. It sends the user's transcribed message to the API and receives product recommendations. The live frontend is configured to call a deployed endpoint at `https://hungryai.asmirabdimazhit.com/chat`.
- **Component Structure:** The UI is broken down into reusable components for displaying products (`ProductCard.tsx`), managing the cart (`CartPage.tsx`, `CartItem.tsx`), and handling voice input (`VoiceButton.tsx`).

### Backend

The backend is a simple Go application that serves a single API endpoint.

- **Server:** It uses the standard `net/http` package to create an HTTP server on port `:8080`. It includes CORS middleware to allow requests from the frontend.
- **Endpoint:** A single `/chat` endpoint accepts POST requests containing a user's message and a `session_id`.
- **AI Integration:** The backend uses the OpenAI API (specifically, the `gpt-4o-mini` model) to process the user's message.
- **Prompt Engineering:** It uses a carefully crafted system prompt to instruct the AI model. The prompt includes a list of available products from a hardcoded inventory and forces the model to respond with a JSON object matching a specific schema. This ensures the output is predictable and easy to parse.
- **Session Management:** The server maintains a simple in-memory map of sessions to store conversation history. This allows the AI to have context for follow-up questions within the same session.
- **Inventory:** The current implementation uses a small, hardcoded map of products (`defaultFoodOptions`). When the AI returns a product title, the backend validates it against this inventory and attaches the correct image URL before sending the response to the frontend.

## Infrastructure (AWS & Terraform)

The entire cloud infrastructure is managed using Terraform, located in the `cloud/` directory. This allows for automated, repeatable, and version-controlled deployments on AWS.

- **Networking:** A new VPC (`aws_vpc`) is created with a public subnet, an internet gateway, and a route table to ensure the infrastructure is isolated and has access to the internet.
- **Compute:** A `t3.micro` EC2 instance (`aws_instance`) is launched using the latest Amazon Linux 2 AMI. An Elastic IP (`aws_eip`) is attached to provide a static public IP address.
- **DNS:** An AWS Route 53 (`aws_route53_record`) `A` record is created to point the domain `hungryai.asmirabdimazhit.com` to the EC2 instance's Elastic IP.
- **Provisioning:** The EC2 instance is provisioned at launch using the `user-data.sh` script. This script installs Go and the Caddy web server.
- **Web Server & HTTPS:** Caddy is configured as a reverse proxy that listens for traffic on the domain `hungryai.asmirabdimazhit.com` and forwards it to the Go backend application running on `localhost:8080`. Caddy automatically handles obtaining and renewing SSL/TLS certificates, enabling HTTPS.

## How to Run

### Frontend

1.  Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Start the development server:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Backend

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2.  **Important:** The backend uses an OpenAI API key which is currently hardcoded in `main.go`. Replace the placeholder with your actual key.
3.  Run the server:
    ```sh
    go run main.go
    ```
    The server will start on `http://localhost:8080`.

### Infrastructure Deployment

1.  **Prerequisites:** Ensure you have the [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli) and [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured with your AWS credentials.
2.  Navigate to the `cloud` directory:
    ```sh
    cd cloud
    ```
3.  Initialize Terraform:
    ```sh
    terraform init
    ```
4.  Apply the configuration:
    ```sh
    terraform apply
    ```
    Terraform will show you a plan and ask for confirmation before creating the resources in your AWS account.

## Future Improvements

- **Secure API Key Management:** The hardcoded OpenAI API key should be replaced with a more secure method, such as environment variables or a secret management service.
- **Database Integration:** The hardcoded product inventory should be moved to a database to allow for a larger, more dynamic catalog of products.
- **Automated Backend Deployment:** The `user-data.sh` script could be enhanced to automatically clone the application repository and run the backend service, creating a fully automated deployment pipeline.
- **Expanded Voice Commands:** The voice command detection could be made more robust and expanded to support more complex queries (e.g., "remove the last item", "show me laptops under $500").
