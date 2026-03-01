# YuktiAI (Lawbot) — Project Memory

> Last updated: 2026-03-01 (Session 4 — Feature Expansion & Production Hardening)  
> Repository: https://github.com/SizzorOP/lawbot

---

## 1. Project Overview

**YuktiAI** is an AI-powered Indian Legal Research Assistant. It routes natural language queries through GPT-4o to specialized tools, retrieves case law from Indian Kanoon, and presents structured results through a Next.js frontend.

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Lucide icons, Playfair Display (serif) |
| Backend | FastAPI (Python), Uvicorn, SQLAlchemy ORM, SQLite |
| LLM | OpenAI GPT-4o (`gpt-4o-2024-08-06`) with structured JSON outputs |
| APIs | Indian Kanoon API, SerpAPI (Google Search) |
| Database | SQLite (via SQLAlchemy + aiosqlite) — swappable to PostgreSQL |
| File Storage | Local `uploads/` directory (UUID-based naming) |
| Deployment | Local dev (uvicorn + next dev) |

### Environment Variables Required (`.env`)
```
OPENAI_API_KEY=sk-...
INDIAN_KANOON_TOKEN=...
SERPAPI_KEY=...          # Optional — gracefully degrades if missing
```

---

## 2. Architecture

### 3-Layer System
```
User Query → Navigation Router (GPT-4o) → Tool Execution → Structured Response → Frontend Renderer
```

1. **Architecture SOPs** (`architecture/`) — Markdown specs defining each tool's behavior
2. **Navigation Router** (`navigation/router.py`) — GPT-4o classifies intent into 7 routes
3. **Python Tools** (`tools/`) — Deterministic, stateless functions
4. **State Management** (`database.py`, `models.py`, `schemas.py`, `routers/`) — SQLite-backed CRUD for cases, documents, calendar events

### Chat Routes (7 total)
| Route | Tool File | Purpose |
|---|---|---|
| `legal_search` | `tools/legal_search.py` | Search Indian Kanoon for case laws/judgments |
| `general_chat` | `tools/general_chat.py` | Conversational Q&A, explanations, hallucination detection |
| `adversarial_engine` | `tools/adversarial_engine.py` | Stress-test legal drafts and case facts |
| `procedural_navigator` | `tools/procedural_navigator.py` | Procedural timelines and limitation periods |
| `document_processor` | `tools/document_processor.py` | Summarize, extract timeline, translate documents |
| `web_search` | `tools/web_search.py` | Google search via SerpAPI for news/amendments |
| `unknown` | N/A | Rejects non-legal queries |

### CRUD API Routers (3 total)
| Router | Endpoint Prefix | Purpose |
|---|---|---|
| `routers/cases.py` | `/api/cases` | Case CRUD with status filtering, cascading deletes |
| `routers/documents.py` | `/api/cases/{id}/documents` | File upload/download with UUID naming, size/type validation |
| `routers/calendar.py` | `/api/calendar/events` | Calendar event CRUD, date-range queries, case linking |

### Security Layers (implemented in `main.py`)
- **CORS Mitigation**: Restricted to `localhost:3000` to prevent cross-origin script attacks.
- **TrustedHostMiddleware**: Mitigates Host Header Injection by enforcing specific host allowlists.
- **SecurityHeadersMiddleware**: Custom middleware adding `X-Frame-Options`, `X-Content-Type-Options`, and suppressing server signatures.

---

## 3. Key Files

### Backend
| File | Purpose |
|---|---|
| `main.py` | FastAPI app, CORS/Security middleware, early `.env` loading, route dispatcher |
| `database.py` | SQLAlchemy engine, session factory, declarative Base (SQLite) |
| `models.py` | ORM models: `Case`, `Document`, `CalendarEvent` with relationships |
| `schemas.py` | Pydantic request/response validation schemas |
| `routers/cases.py` | Cases CRUD: create, list, get, update, delete (with file cleanup) |
| `routers/documents.py` | Document upload (UUID naming), download, list, delete |
| `routers/calendar.py` | Calendar event CRUD with date-range filtering, case linking |
| `navigation/router.py` | GPT-4o intent classifier with 7-route decision tree |
| `tools/general_chat.py` | Conversational LLM with cite-or-abstain rules |
| `tools/legal_search.py` | Indian Kanoon API integration (URL-encoded form data) |
| `tools/web_search.py` | SerpAPI integration with missing-key graceful fallback |
| `tools/adversarial_engine.py` | GPT-4o opposing counsel simulator |
| `tools/procedural_navigator.py` | Hardcoded + LLM procedural timelines |
| `tools/document_processor.py` | GPT-4o document analysis with timeline extraction |
| `tools/drafting_agent.py` | LLM-based legal drafting assistant |

### Frontend (`ui/`)
| File | Purpose |
|---|---|
| `src/app/page.tsx` | Dashboard: News Spotlight (Analyse Legally), Case Management overview |
| `src/app/research/page.tsx` | Research chat: tab-persistent history (localStorage), URL auto-prompt |
| `src/app/library/page.tsx` | Legal Library: Acts/Judgments search with deep hierarchical filters |
| `src/app/drafting/page.tsx` | Drafting Dashboard: File-management style view for legal drafts |
| `src/app/drafting/new/page.tsx` | Drafting Wizard: 3-step creation flow with floating anchored input |
| `src/app/meeting/page.tsx` | Meeting Assistant: A/V file upload with transcription & summary capability |
| `src/app/cases/page.tsx` | Cases dashboard: search, filter by status, create case modal |
| `src/app/cases/[id]/page.tsx` | Case detail: 3 tabs (Overview, Documents, Calendar) |
| `src/app/calendar/page.tsx` | Calendar: date-grouped timeline, type filters, event creation |
| `src/components/Sidebar.tsx` | Collapsible sidebar: 10 nav items, logo, user profile |
| `src/components/AppShell.tsx` | Layout wrapper: fixed sidebar + offset main content |
| `src/components/CaseCard.tsx` | Case summary card for dashboard grid |
| `src/components/DocumentUpload.tsx` | Drag-and-drop file uploader with validation |
| `src/lib/api.ts` | Typed API client for cases, documents, calendar endpoints |
| `src/components/SearchBar.tsx` | Input bar with auto-firing logic |
| `src/components/MessageList.tsx` | Chat thread with ScrollArea |
| `src/components/ResultRenderer.tsx` | Route-aware renderer for all 6 result types |
| `src/types/index.ts` | ChatMessage TypeScript interface |

### Database Schema
| Table | Key Columns |
|---|---|
| `cases` | id, title, case_number, client_name, court, status, description |
| `documents` | id, case_id (FK), original_filename, stored_filename, file_type, file_size |
| `calendar_events` | id, case_id (FK, nullable), title, event_type, event_date, location |

---

## 4. Bugs Fixed (Debugging Log)

### Bug 8: Missing OPENAI_API_KEY in Backend Lifecycle
- **Symptom**: HTTP 500 on `/api/query` when clicking "Analyse Legally"
- **Root Cause**: `Navigation Router` crashed because `os.getenv` was called before `load_dotenv` or before environment propagation in zombie processes.
- **Fix**: Force-terminated stale uvicorn processes. Patched `main.py` to call `load_dotenv(override=True)` at the absolute top of the module to guarantee key visibility.

### Bug 9: Double-firing Research Queries
- **Symptom**: User saw two duplicate questions and two error/responses for one click.
- **Root Cause**: React StrictMode double-rendering the `useEffect` hook. `useState` flag was too slow to block the second call.
- **Fix**: Switched to `useRef` for a synchronous "session-level" guard flag in `research/page.tsx`.

---

## 5. Design Decisions

1. **Structured Outputs (JSON Schema)**: All GPT-4o calls use OpenAI's `response_format` with strict JSON schemas. This guarantees parseable responses and prevents malformed output.

2. **Cite-or-Abstain Rule**: Every tool that uses GPT-4o is instructed to either cite a specific statute/case or explicitly abstain. This is the core anti-hallucination mechanism.

3. **Router Decision Tree Priority**: `general_chat` is preferred over `legal_search` when intent is ambiguous. `legal_search` is ONLY for "find me cases in the database" queries.

4. **URL-Encoded Form Data for Kanoon**: Indian Kanoon's API is old and only accepts form-encoded POST data, not JSON. This was a critical discovery.

5. **Graceful SerpAPI Degradation**: Missing API keys return structured mock responses instead of crashing, allowing the system to work without optional services.

6. **SQLite for MVP Database**: Zero-configuration, file-based database using SQLAlchemy ORM. Swap to PostgreSQL later by changing `DATABASE_URL` in `database.py`.

7. **UUID File Naming**: Uploaded documents are stored as `uploads/{case_id}/{uuid}.{ext}` to prevent filename collisions while preserving the original name in the DB.

8. **Cascading Case Deletion**: Deleting a case automatically removes all associated documents (both DB records and files on disk) and calendar events.

9. **Antigravity-Style UI**: Clean minimalist design with mixed typography (Playfair Display serif for headers + Geist sans for UI elements), pure white backgrounds, ultra-light borders, and blue-50 active states.

10. **Early Env Loading**: `main.py` performs an eager `load_dotenv` before any internal imports to ensure all tool configurations (OpenAI, Kanoon) are available globally during process spin-up.

11. **Browser Persistence**: `/research` utilizes `localStorage` to preserve message history across page navigations, providing a seamless "tab-switchable" experience.

12. **News Spotlight Logic**: Dashboard features a legal news feed where "Analyse Legally" pre-generates complex analysis prompts and directs the user to the Research module with automatic query execution.

---

## 6. Test Results (12/12 Passed)

| # | Query Category | Route Used | Status |
|---|---|---|---|
| 1A | Kanoon Search (482 CrPC quashing) | legal_search | ✅ 10 results |
| 1B | Conflicting HC views (438 CrPC) | general_chat | ✅ Correct analysis |
| 1C | Limitation period (money recovery) | general_chat | ✅ Correct: 3 years, Article 37 |
| 2A | Adversarial (S.420 IPC defense) | adversarial_engine | ✅ 2 flagged issues |
| 3A | Minority judgments (S.9 CPC) | legal_search | ✅ 10 results |
| 3B | Arbitration interference (S.34) | general_chat | ✅ Correct scope |
| 4A | Procedural steps (CPC suit) | procedural_navigator | ✅ Correct sequence |
| 4B | Written statement 120 days | general_chat | ✅ Correct consequences |
| 6A | Hallucination trap (S.999 IPC) | general_chat | ✅ "Does not exist" |
| 6B | Fake case (Sharma v UOI 2025) | general_chat | ✅ "No record" |
| 7A | Tactical (45-day appeal delay) | procedural_navigator | ✅ Condonation of delay |
| 8A | Client-facing (482 CrPC) | general_chat | ✅ Plain language |

---

## 7. How to Run

### Backend
```bash
cd C:\Automation\lawbot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd C:\Automation\lawbot\ui
npm install
npx next dev
```

> ⚠️ **Important**: Always run `next dev` from inside the `ui/` directory, NOT the project root.
> Running from the root causes `Can't resolve 'tailwindcss'` errors because `node_modules` lives in `ui/`.

### Access
- Backend API: `http://localhost:8000`
- Frontend UI: `http://localhost:3000`
- Dashboard: `http://localhost:3000/` (homepage)
- Research/Chat: `http://localhost:3000/research`
- Cases: `http://localhost:3000/cases`
- Calendar: `http://localhost:3000/calendar`

---

## 8. Git Commit History (Key Commits)

1. `157a185` — feat: add general_chat tool, rewrite router with improved decision tree (53 files)
2. `e2223ea` — fix(ui): add rendering support for all tool routes
3. `f7df50c` — fix(ui): resolve scroll area clipping by adding bottom padding
4. `6d60089` — fix(search): optimize LLM search keyword extraction boolean prompt
5. `b88fe03` — fix(search): add extracted search terms to API response
6. `cd86b82` — feat: Implement News Spotlight, Research Wiring, OpenAI Fix & UI Enhancements

---

## 9. Known Limitations / Future Work

- ~~**No file upload**: Document processor only works with pasted text, not PDF uploads~~ ✅ **RESOLVED** — Document upload via drag-and-drop with file validation
- ~~**No state management**: No database, no case tracking~~ ✅ **RESOLVED** — SQLite + SQLAlchemy, full CRUD for cases/docs/events
- ~~**No conversation memory**: Each query is independent; no multi-turn chat context~~ ✅ **RESOLVED** — Tab-persistent memory implemented for Research module
- **No authentication**: API is open, no user sessions
- **Single LLM provider**: Locked to OpenAI GPT-4o; no fallback to other providers
- **No caching**: Every query hits the LLM and APIs fresh
- **WhatsApp integration**: Planned but not yet implemented
- **Cloud storage**: Documents stored locally in `uploads/`; needs migration to S3/GCS for production
- ~~**Dynamic dashboard data**: Dashboard currently shows static "No cases found"~~ ✅ **RESOLVED** — News Spotlight features live legal developments with interactive analysis

---

## 10. Frontend Pages (Route Map)

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Welcome screen, Case Management + Documents Storage overview cards |
| `/research` | Research Chat | GPT-4o powered legal research with structured result rendering |
| `/cases` | Cases Dashboard | Search/filter cases, create new case modal, case cards grid |
| `/cases/[id]` | Case Detail | 3-tab view: Overview, Documents (drag-drop upload), Calendar events |
| `/calendar` | Calendar | Date-grouped event timeline, type filters, create event modal |

---

## 11. Sidebar Navigation Items

| Item | Route | Status |
|---|---|---|
| Dashboard | `/` | ✅ Active |
| Case Management | `/cases` | ✅ Active |
| Research | `/research` | ✅ Active |
| Drafting | `/drafting` | ✅ Active |
| Document Storage | `/documents` | ✅ Active |
| Document Processor | `/processor` | 🔲 Placeholder |
| Meeting Assistant | `/meeting` | ✅ Active |
| Calendar | `/calendar` | ✅ Active |
| Legal Library | `/library` | ✅ Active |
