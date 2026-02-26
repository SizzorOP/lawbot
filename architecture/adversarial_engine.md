# Technical SOP: Adversarial Engine & Draft Stress Test

## Goal
Simulate an opposing counsel examining a legal draft (e.g., Written Statement, Bail App). Identify logical gaps, missing statutory citations, and formulate the strongest objections. 

## Inputs
*   `draft_text` (string): The raw text of the document being analyzed.
*   `document_type` (string): The type of document (e.g., "written_statement", "bail_application").
*   `jurisdiction` (string): The applicable high court or jurisdiction (e.g., "Delhi High Court").

## Tool Logic
1.  **Validation:** Ensure the LLM API token is present in `.env`. Ensure the `draft_text` is not empty.
2.  **Context Assembly:**
    *   No external RAG is performed at this step unless specifically requested. The LLM must rely ONLY on its trained corpus of Indian Law + the provided document context.
3.  **Prompt Construction (Strict Guardrails):**
    *   **System Prompt:** "You are a Senior Litigator in India reviewing a {document_type} in {jurisdiction}. Your goal is to find its weakest points, missing precedents, and logical contradictions. You MUST adhere to the 'Cite-or-Abstain' rule. If you claim a precedent is missing, you must cite the specific section of the applicable Indian Act (e.g., IPC, CrPC/BNSS, CPC, Evidence Act)."
4.  **Execution:** Call the LLM API with strict JSON mode enabled.
5.  **Response Handling & Output Formatting:**
    *   Return a structured JSON object:
        ```json
        {
          "confidence_score": 7,
          "flagged_issues": [
            {
              "type": "missing_citation | logical_gap | contradiction | maintainability_objection",
              "line_snippet": "exact quote from the draft",
              "recommendation": "Cite leading case..."
            }
          ],
          "abstentions": ["Topics the LLM avoided due to lack of certainty"]
        }
        ```

## Edge Cases to Handle
*   **Irrelevant Documents:** If a user uploads a grocery list, the system must immediately reject it with: `"status": "error", "message": "Document does not appear to be a legal draft."`
*   **LLM Hallucinations:** The prompt must explicitly command: `"DO NOT invent case names. If you cannot remember the exact Supreme Court case name, merely suggest referencing the applicable statute section."`

## Strict Rules (Golden Rule of NyayAssist)
*   **The System MUST NEVER suggest altering facts, evading summons, or hiding evidence.** Any detection of such intent in the draft must trigger an immediate refusal.
*   Must be deterministic in the API call (Temperature = 0.2 to minimize creative hallucination, preferring strict analytical logic).
