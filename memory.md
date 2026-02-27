# YuktiAI (Lawbot) — Project Memory

> Last updated: 2026-02-27 (Session 3 — State Management & UI Redesign)  
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

---

## 3. Key Files

### Backend
| File | Purpose |
|---|---|
| `main.py` | FastAPI app, CORS middleware, route dispatcher, DB init |
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

### Frontend (`ui/`)
| File | Purpose |
|---|---|
| `src/app/page.tsx` | Dashboard: Welcome card, Case Management, Documents Storage |
| `src/app/research/page.tsx` | Research chat: Glean-style search → chat transition |
| `src/app/cases/page.tsx` | Cases dashboard: search, filter by status, create case modal |
| `src/app/cases/[id]/page.tsx` | Case detail: 3 tabs (Overview, Documents, Calendar) |
| `src/app/calendar/page.tsx` | Calendar: date-grouped timeline, type filters, event creation |
| `src/components/Sidebar.tsx` | Collapsible sidebar: 10 nav items, logo, user profile |
| `src/components/AppShell.tsx` | Layout wrapper: fixed sidebar + offset main content |
| `src/components/CaseCard.tsx` | Case summary card for dashboard grid |
| `src/components/DocumentUpload.tsx` | Drag-and-drop file uploader with validation |
| `src/lib/api.ts` | Typed API client for cases, documents, calendar endpoints |
| `src/components/SearchBar.tsx` | Input bar with Enter-to-search |
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

### Bug 1: Router Schema Validation Error
- **Symptom**: OpenAI returned `400 Invalid schema`
- **Root Cause**: Nested `extracted_kwargs` object lacked a `"required"` array
- **Fix**: Added `"required": ["query", "case_stage", "law_code"]` to the JSON schema in `router.py`

### Bug 2: Indian Kanoon Returning 0 Results
- **Symptom**: All Kanoon searches returned empty arrays
- **Root Cause**: API expects `application/x-www-form-urlencoded` data, not `application/json`
- **Fix**: Changed `requests.post(url, json=...)` → `requests.post(url, data=...)` in `legal_search.py`
- **Also Fixed**: Remapped response keys: `tid` → `doc_id`, `headline` → `snippet`, added `docsource`

### Bug 3: LLM Generating Verbose Search Queries
- **Symptom**: Router sent full sentences like "Find Supreme Court judgments on..." to Kanoon
- **Root Cause**: System prompt wasn't strict enough about keyword extraction
- **Fix**: Rewrote router prompt to enforce boolean keyword-only extraction

### Bug 4: Backend Crash on Missing SerpAPI Key
- **Symptom**: HTTP 500 when web_search fallback triggered without SERPAPI_KEY
- **Root Cause**: `web_search.py` raised an exception instead of gracefully handling missing key
- **Fix**: Return a mock "Search Unavailable" result object instead of crashing

### Bug 5: No Conversational Brain
- **Symptom**: Questions like "Explain Section 482 CrPC" returned raw Kanoon results or got rejected as "unknown"
- **Root Cause**: System had no tool for conversational Q&A — only API-based search tools
- **Fix**: Created `tools/general_chat.py` and added `general_chat` route to router

### Bug 6: Frontend Not Rendering New Routes
- **Symptom**: All new routes showed "Here are your results:" with no content
- **Root Cause**: `ResultRenderer.tsx` only had UI logic for `legal_search` arrays
- **Fix**: Rewrote ResultRenderer with dedicated UI components for all 6 route types

### Bug 7: Content Cut Off Below Scroll Reach
- **Symptom**: Long chat responses were hidden behind the fixed search bar
- **Root Cause**: Insufficient bottom padding in the ScrollArea and flex container
- **Fix**: Added `pb-32`, `mb-32` to MessageList and `mb-24` to page container

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

9. **Antigravity-Style UI**: Clean minimalist design with mixed typography (Playfair Display serif for headers + Geist sans for UI elements), pure white backgrounds, ultra-light borders, and blue-50 active states. Matching the reference design from nyayassist.

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

---

## 9. Known Limitations / Future Work

- ~~**No file upload**: Document processor only works with pasted text, not PDF uploads~~ ✅ **RESOLVED** — Document upload via drag-and-drop with file validation
- ~~**No state management**: No database, no case tracking~~ ✅ **RESOLVED** — SQLite + SQLAlchemy, full CRUD for cases/docs/events
- **No conversation memory**: Each query is independent; no multi-turn chat context
- **No authentication**: API is open, no user sessions
- **Single LLM provider**: Locked to OpenAI GPT-4o; no fallback to other providers
- **No caching**: Every query hits the LLM and APIs fresh
- **WhatsApp integration**: Planned but not yet implemented
- **Cloud storage**: Documents stored locally in `uploads/`; needs migration to S3/GCS for production
- **Dynamic dashboard data**: Dashboard currently shows static "No cases found" — needs API integration to show real counts

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
| Drafting | `#` | 🔲 Placeholder |
| Document Storage | `#` | 🔲 Placeholder |
| Document Processor | `#` | 🔲 Placeholder |
| Meeting Assistant | `#` | 🔲 Placeholder |
| Calendar | `/calendar` | ✅ Active |
| Legal Library | `#` | 🔲 Placeholder |
