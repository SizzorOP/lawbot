# Technical SOP: WhatsApp API Incoming & Outgoing

## Goal
Provide a seamless interface for lawyers to query NyayAssist or upload documents via WhatsApp.

## Inputs
*   `payload` (JSON): The incoming webhook payload from Meta Graph API. Contains sender phone number, message type (text/document/audio), and content.

## Tool Logic
1.  **Validation:** Ensure `WHATSAPP_API_TOKEN` is present in the environment (`.env`) for sending replies.
2.  **Webhook Listening (Navigation Layer):** The FastAPI backend must expose a `/webhook` endpoint to receive POST requests from WhatsApp.
3.  **Message Parsing:**
    *   Extract sender's WhatsApp ID.
    *   Determine message type:
        *   **Text:** Route to NLP Research/Drafting Intent engine.
        *   **Audio:** Route to Audio Transcription tool (e.g., Whisper) -> Intent Engine.
        *   **Document (PDF/Image):** Download via media URL -> Route to Document Processor.
4.  **Outgoing Message Execution:**
    *   Endpoint: `https://graph.facebook.com/v18.0/<PHONE_NUMBER_ID>/messages`
    *   Headers: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
    *   Payload: Construct text/markdown response or media link based on the intended output payload.
5.  **Output Formatting:** Format research citations clearly for a mobile screen (bullet points, short summaries).

## Edge Cases to Handle
*   **Message Delivery Delays:** If a research task takes > 10 seconds, immediately send an acknowledgment ("Processing your request, finding citations..."). Send the actual result as a follow-up message to ensure the user doesn't think the bot crashed.
*   **Media Downloading Limits:** Check media size limits. If a 100MB PDF is sent, gracefully reject it with instructions on max file sizes.
*   **Authentication Expiration:** Ensure the Graph Token is a permanent system user token, not a temporary interactive token.

## Strict Rules
*   Do not spam groups. 
*   Always ensure the sender is an authenticated/allowed user in the DB before processing complex or expensive LLM tasks.
