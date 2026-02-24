# LawBOT

LawBOT is a multi-agent legal intelligence system designed for Indian litigation practice.

It follows an OpenClaw-style architecture with specialized agents, deterministic tools, and hallucination-safe design principles.

---

## Architecture

LawBOT uses:

- Multi-agent workspaces
- Skill-based execution
- Deterministic tool layer
- Strict citation validation
- No fabricated legal content

Agents:

- Research Agent
- Drafting Agent
- Case Management Agent

---

## MVP Scope (Litigation Intelligence Core)

Current implemented tools:

- legal_search (Indian Kanoon API integration)
- summarize_doc (structured document summarization)
- citation_checker (format validation)
- document_fill (template engine)

Planned:

- Adversarial strategy simulation
- SCC Online / Manupatra licensed integration
- Full orchestration gateway

---

## Hallucination Prevention Strategy

LawBOT does NOT fabricate:

- Case citations
- Legal facts
- Court status
- Transcriptions

If data cannot be verified:
- It returns empty results
- Or raises explicit errors

Current hallucination risk score: 1/10

To set up a new attorney agent, copy the `attorney_template` directory into a new folder (e.g. `attorney_jane_doe`) and customise `USER.md` with the attorney's details.  Each attorney gets an isolated workspace with its own memory and skills.

This template includes:

- `AGENTS.md` – high‑level agent instructions and responsibilities.
- `SOUL.md` – defines the agent's personality and tone.
- `USER.md` – stores attorney‑specific details and jurisdictional limits.
- `MEMORY.md` – curated long‑term memory file.
- `skills/` – a collection of skills that teach the agent how to perform tasks such as research, drafting and case management.

Use the attorney template as the starting point for each attorney agent in your LawBOT deployment.  Each attorney gets an isolated workspace with its own memory and skills.  Make sure to configure API keys and environment variables required by the skills (e.g. `INDIAN_KANOON_TOKEN`) in the agent's environment.

## API and Front‑End

In addition to the agent templates, this repository now includes a minimal HTTP API and front‑end:

- `lawbot/backend/app.py` — A [FastAPI](https://fastapi.tiangolo.com/) server exposing endpoints for legal search, document summarisation and citation checking.  Run it with `uvicorn lawbot.backend.app:app --reload` to start the API on `http://127.0.0.1:8000`.
- `lawbot/frontend/index.html` and `styles.css` — A static web interface that lets you enter queries, summarise text and validate citations.  Serve these files with a static file server (e.g. `python -m http.server`) or open `index.html` directly in your browser.  The front‑end expects the API to be served from the same origin at `/api/...`.

These additions make LawBOT usable end‑to‑end without requiring any Node.js build tooling.

---

## Running Locally

```bash
cd lawbot_runtime
python main.py research_agent legal-research --query "habeas corpus"
