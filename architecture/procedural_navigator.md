# Technical SOP: Procedural Navigator

## Goal
Map out the procedural timelines, limitations, and standard routing for different case stages under Indian Law (e.g., CPC, CrPC/BNSS). 

## Inputs
*   `case_stage` (string): The current event in the case (e.g., "Summons received", "FIR registered").
*   `law_code` (string): The applicable code (e.g., "CPC", "CrPC", "BNSS").

## Tool Logic
1.  **Validation:** Ensure inputs are provided.
2.  **Hardcoded Logic Core (Deterministic):**
    *   To avoid hallucination on critical timelines, this tool MUST rely heavily on pre-defined standard mappings for the MVP.
    *   Example: If `case_stage` == "Summons received" and `law_code` == "CPC":
        *   -> Return "30 days to file Written Statement (Order VIII Rule 1 CPC). Maximum extension to 120 days at court's discretion."
    *   Example: If `case_stage` == "FIR registered":
        *   -> Return "Charge sheet must be filed within 60 days (for lesser offenses) or 90 days (for offenses punishable with death/life imprisonment) under Section 167(2) CrPC/BNSS."
3.  **LLM Augmentation (Optional/Edge Cases):**
    *   If the exact string is not in the hardcoded mapping, the LLM can be triggered via OpenAI.
    *   **Strict System Prompt:** "You are an Indian Procedural Law expert. Provide the exact timeline and next step for the given case stage. You MUST cite the exact CPC, CrPC, or Limitation Act section. If you are unsure, output 'ABSTAIN: Timeline requires specific statutory lookup'."
4.  **Output Formatting:** Return structured JSON mapping.
    ```json
    {
       "current_stage": "Summons received",
       "next_procedural_step": "Filing of Written Statement",
       "timeline_days": 30,
       "max_extension_days": 120,
       "statutory_reference": "Order VIII Rule 1, CPC",
       "confidence": "High (Hardcoded) | Medium (LLM Generated)"
    }
    ```

## Edge Cases to Handle
*   **Commercial Courts Act:** If the jurisdiction involves a Commercial Court, the 120 days rule for Written Statement is mandatory and unforgivable. 
*   **Unclear Stages:** If the user sends "Case is going on", return an error asking for specific procedural terminology.

## Strict Rules
*   Never guess a limitation period. Limitation errors are fatal in Indian courts. If the system is not 100% sure, it MUST abstain.
