# Technical SOP: SerpAPI Web Search

## Goal
Perform a general web search using Google (via SerpAPI) to retrieve recent legal news, articles, or supplementary information that might not be explicitly indexed in Indian Kanoon yet.

## Inputs
*   `query` (string): The search term.
*   `num_results` (int, default=3): Number of organic results to retrieve limit token usage.

## Tool Logic
1.  **Validation:** Ensure `SERPAPI_KEY` is present in the environment (`.env`).
2.  **Request Construction:**
    *   Endpoint: `https://serpapi.com/search`
    *   Method: GET
    *   Params: `engine="google"`, `q=query`, `api_key=SERPAPI_KEY`, `num=num_results`
3.  **Execution:** Send GET request.
4.  **Response Handling:**
    *   **200 OK:** Parse JSON. Extract the `organic_results` array.
    *   **401/403:** Raise `AuthError` (API key invalid or expired).
    *   **Other:** Raise `APIError` with status code.
5.  **Output Formatting:** Return a list of dictionaries containing:
    *   `title`: Page title
    *   `link`: URL
    *   `snippet`: Brief description

## Edge Cases to Handle
*   **Irrelevant Search Results (Hallucination Risk):** Web search results are notoriously noisy. The downstream LLM reasoning layer MUST evaluate the `snippet` and `title` to confirm they relate to Indian law before presenting them to the user.
*   **Network Errors:** Implement a 10-second timeout.

## Strict Rules
*   Web Search is secondary to Indian Kanoon. If Kanoon has the answer, prefer Kanoon citations. Web search should be explicitly labeled as a "Web Source" in the final UI payload.
