# Technical SOP: Document Processor

## Goal
Process incoming raw text from legal documents (e.g., FIRs, Agreements, Notices) to generate an English translation/summary and extract a chronological timeline of events.

## Inputs
*   `document_text` (string): The raw text extracted from the document.
*   `document_type` (string, optional): A hint about what kind of document this is (e.g., "FIR", "contract"). Default: "legal_document".

## Tool Logic
1.  **Validation:** Ensure the LLM API token is present in `.env`. Ensure `document_text` is not empty.
2.  **Context Assembly:**
    *   The LLM must rely ONLY on the provided `document_text`. External referencing is strictly forbidden for chronological event extraction to prevent hallucinations.
3.  **Prompt Construction (Strict Guardrails):**
    *   **System Prompt:** "You are an expert Legal Assistant in India analyzing a {document_type}. Your task is to process the provided text and output a structured JSON response. You must provide a concise English summary/translation of the core issue. Then, extract a chronological timeline of material events explicitly mentioned in the text. You MUST adhere to the 'Cite-or-Abstain' rule. Every event in the timeline must be grounded in the text. Do not invent any dates or facts. If a date is approximate in the text, note it as such."
4.  **Execution:** Call the OpenAI API with `gpt-4o-2024-08-06` (or later) using strict JSON Schema mode.
5.  **Response Handling & Output Formatting:**
    *   Return a structured JSON object:
        ```json
        {
          "summary": "English translation and summary of the document...",
          "timeline": [
            {
              "date": "2023-10-15 (or 'Unknown/Approximate')",
              "event": "Description of the event",
              "page_or_para_reference": "Any internal reference found in the text, else null"
            }
          ],
          "confidence_score": 9,
          "abstentions": ["Topics unclear due to poor OCR or missing pages"]
        }
        ```

## Edge Cases to Handle
*   **Irrelevant/Non-Legal Text:** If the text is clearly not a document requiring legal timeline extraction, default to a polite error message in the summary and an empty timeline.
*   **LLM Hallucinations:** The schema structure enforcement and explicit "do not invent dates" prompt should minimize this.
*   **Excessive Length:** (Future MVP Phase) If text exceeds context window, it will need chunking. For this MVP, we assume the text fits within a 128k context window.

## Strict Rules
*   Never invent facts. The timeline must only reflect what is written.
*   Retain the original spelling of names/places as much as possible while translating the procedural context to English.
