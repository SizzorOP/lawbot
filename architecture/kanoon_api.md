# Technical SOP: Indian Kanoon API

## Goal
Retrieve case law and statutory text from the Indian Kanoon database based on a user's natural language query.

## Inputs
*   `query` (string): The search term (e.g., "section 482 crpc").
*   `pagenum` (int, default=0): Pagination index.

## Tool Logic
1.  **Validation:** Ensure `INDIAN_KANOON_TOKEN` is present in the environment (`.env`).
2.  **Request Construction:**
    *   Endpoint: `https://api.indiankanoon.org/search/`
    *   Headers: `Authorization: Token <TOKEN>`, `Content-Type: application/json`
    *   Payload: `{"formInput": query, "pagenum": pagenum}`
3.  **Execution:** Send POST request.
4.  **Response Handling:**
    *   **200 OK:** Parse JSON. Extract the `docs` array.
    *   **403 Forbidden:** Raise `AuthError` (API key invalid or expired).
    *   **Other:** Raise `APIError` with status code and message.
5.  **Output Formatting:** Return a list of dictionaries, each containing:
    *   `title`: Case title
    *   `doc_id`: Unique identifier on Kanoon
    *   `snippet`: Highlighted text matching the query
    *   `url`: Full link to the document

## Edge Cases to Handle
*   **Empty Results:** If the query returns 0 documents, return an explicit empty list `[]`. Do not attempt to hallucinate an answer.
*   **Rate Limiting:** If the API returns a 429 Too Many Requests, implement a basic exponential backoff retry (max 3 times).
*   **Timeout:** If the request takes > 15 seconds, timeout and return an error indicating the service is unavailable.

## Strict Rules
*   Never cache sensitive user queries.
*   The exact `doc_id` must be passed downstream to the LLM reasoning layer to enforce the "Cite-or-Abstain" rule.
