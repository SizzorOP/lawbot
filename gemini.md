# LawBOT Constitution (gemini.md)

## 1. The "Data-First" Rule & Schemas
*(Confirmed via Discovery phase)*

### Proposed Data Schemas
**Input Payload (Example for General Request):**
```json
{
  "request_id": "req_123",
  "source_channel": "web_dashboard | whatsapp",
  "intent": "research | drafting | document_processing | meeting_intelligence | calendar | case_management",
  "query_or_instruction": "Find judgments on section 482 CrPC",
  "context_documents": [
    {"doc_id": "local_pdf_1", "text": "...", "type": "FIR"}
  ],
  "jurisdiction": "Delhi High Court"
}
```

**Output Payload (Example for Response):**
```json
{
  "request_id": "req_123",
  "status": "success | error | abstain",
  "confidence_score": 9,
  "response_text": "...",
  "citations": [
    {
      "source": "Indian Kanoon | Web Search | Local PDF",
      "title": "State vs...",
      "snippet": "...",
      "link": "..."
    }
  ],
  "action_items": [],
  "abstentions": []
}
```

## 2. Behavioral Rules
- **Strict Obedience:** The system must not act on its own; it must ALWAYS follow the user's explicit commands.
- **Zero Hallucination Tolerance:** AVOID HALLUCINATIONS AT ALL CONDITIONS. If unsure or if data is not in the source of truth, abstain.
- **Cite-Or-Abstain:** Output only citations that explicitly exist in the provided context (Local PDFs), verified API index (Indian Kanoon), or verified Web Search. If none exist, output "Insufficient authority."
- **Ethical Boundary:** Do not assist with evasion, evidence tampering, or illegal behavior.
- **Tone:** Professional, direct, auxiliary (partner/assistant).

## 3. Architectural Invariants
- 3-Layer Structure (Architecture SOPs -> Navigation/Routing -> Python Tools).
- All tools must be in `tools/` and purely deterministic.
- External logic updates must modify `architecture/` first.

## 4. Maintenance / Learning Log
- *(To be updated as the system repairs/anneals itself)*
