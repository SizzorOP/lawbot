# North Star & Constraints
1. **North Star:** Build the best partner/assistant for a Lawyer in India.
2. **Integrations:** Indian Kanoon API, WhatsApp API, Web Search API.
3. **Source of Truth:** Local PDFs, Indian Kanoon, Web Search.
4. **Delivery Payload:** Centralised command centre (Dashboard), WhatsApp messages, and structured document outputs.
5. **Behavioral Rules:** Never act independently, strictly follow user commands, AVOID HALLUCINATIONS AT ALL CONDITIONS (Cite-or-Abstain).

---

# NyayAssist Blueprint

## A) ICP + Use Cases
* **Primary Users:** Litigating lawyers, legal professionals, and law students in India.
* **Top Workflows (The Core Features):**
  1. **Case Management:** Centralised tracking of active cases and operations.
  2. **Research:** Fast, accurate, citation-backed case law research using Kanoon and Web.
  3. **Drafting:** Generating structured legal drafts, version control, and refinement.
  4. **Document Storage & Processing:** Extraction of events chronologically, visual summaries, translation into 8+ languages.
  5. **Meeting Intelligence:** Audio transcription, summarisation, and checklists generation.
  6. **Calendar & WhatsApp Bot:** Auto-synced court dates, intelligent alerts, and WhatsApp integration for dictation/docs.
* **Pain Points:** Information scatter across apps, time-consuming manual drafting, missing court deadlines, language barriers in local documents.
* **Success Metrics:** Consolidation of workflow into one app, zero hallucinations in research, high adoption rate for WhatsApp interface.

## B) Product Scope (MVP vs Later)
* **MVP:** 
  1. Indian Kanoon + Web Search Research tool with hallucination prevention.
  2. Document Processor (Summaries, translation, chronological extraction) for uploaded Local PDFs.
  3. Drafting assistant (structured templates).
  4. WhatsApp Bot (send docs, query research).
* **Exclude (for MVP if necessary due to bandwidth, else include):** Full Court Calendar scraping (unless straightforward API exists), Complex Meeting Intelligence (require robust STT pipeline - can do basic).
* **Definition of Done for MVP:** Zero hallucinations on citations. Fully responsive WhatsApp bot.

## C) System Design
* **Components:**
  1. **Ingestion API:** Handles PDF uploads from Web and WhatsApp.
  2. **Processor Engine (NLP):** 8+ language translation, timeline extraction via LLM with strict JSON schema.
  3. **Research Retrieval Layer:** Hybrid Search across Indian Kanoon API and Web Search API.
  4. **Drafting & Reasoning LLM:** Strict Prompting, Cite-or-Abstain guardrails.
  5. **Meeting Intelligence Module:** ASR (Whisper/Deepgram) -> Summarisation LLM.
  6. **WhatsApp Webhook Listener:** Standard interface connecting user messages to the navigation layer.
* **Storage:** PostgreSQL for robust case management; Vector DB for document embedding; Object Storage for PDFs.
* **Prompt Strategy:** Structured outputs (JSON). Strict rule: "If the requested fact/citation is not in the search results or local PDF, you MUST output 'Not found'. AVOID HALLUCINATIONS."

## D) Data Strategy
* **MVP Approach:** Indian Kanoon API (Primary case law) + Verified Web Search + User's Local uploaded PDFs.
* **Metadata Requirements:** Every extracted fact or citation must have `source_url`, `doc_name`, `page_number`.

## E) Safety + Trust Requirements
* **Zero Hallucination Policy:** Strict "Cite-or-Abstain".
* **Obedience:** System tools require explicit user triggering or clear router intention. No autonomous cron actions unless explicitly configured (like Calendar alerts).
* **Confidence Scoring:** Every research answer returns a confidence score.

## F) UX / Product Experience
* **Platform:** Centralised Command Centre (Web) + WhatsApp.
* **Feature: WhatsApp Bot**
  * Input: Voice note or PDF.
  * Output: Transcribed checklist or Document Summary.
* **Feature: Document Processor**
  * Input: 50-page vernacular PDF.
  * Output: Chronological timeline of events + English translation.

## G) Validation Plan
* **Metrics:** Hallucination rate (must be 0%). User engagement on WhatsApp.
* **Pricing Test:** Tiered for professionals vs students.

## H) Execution Plan (Engineering)
* **Tech Stack:** Python FastAPI (Backend), Next.js (Frontend), Twilio/Meta API (WhatsApp), Kanoon/Tavily/SerpAPI (Search).
* **Observability:** Track every generated citation against the Kanoon/Web DB. If mismatched, log as critical hallucination failure.

## I) Competitive Differentiation
* **Why this wins:** Comprehensive all-in-one suite (NyayAssist) compared to fragmented tools. The integration of a WhatsApp bot + strict Zero-Hallucination guarantee sets it apart for Indian practitioners.
