# LawBOT Setup Requirements

This document describes how to set up a development environment to run the **LawBOT** multi‑agent system.  The architecture is inspired by OpenClaw but implemented independently in this repository.

## Prerequisites

The following software must be installed on your machine:

- **Python**: Version 3.11 or higher.
 - **Git**: For version control and cloning the repository.
 - **Indian Kanoon API Token**: Required for the legal research tools.  Set this as the environment variable `INDIAN_KANOON_TOKEN`.
 - **FastAPI** and **Uvicorn**: These are Python packages used to expose the HTTP API; they will be installed via `pip`.

Optional tools:

 - **Docker**: To containerise components and simplify deployment.  You can build a container that runs both the API and the front‑end.

## Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/SizzorOP/lawbot.git
   cd lawbot
   ```

2. **Create and activate a Python virtual environment**

   ```bash
   python3 -m venv venv
   # On Unix/macOS
   source venv/bin/activate
   # On Windows use:
   # venv\Scripts\activate
   ```

3. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**

   Export your Indian Kanoon token and any other secrets before running the system.  On Unix:

   ```bash
   export INDIAN_KANOON_TOKEN=your_token_here
   ```

   On Windows PowerShell:

   ```powershell
   setx INDIAN_KANOON_TOKEN "your_token_here"
   ```

   If you integrate Supabase or other services, set those credentials similarly.

5. **Run the backend API server**

   Once dependencies are installed and the `INDIAN_KANOON_TOKEN` is set, you can start the FastAPI server to expose the legal search and summarisation endpoints:

   ```bash
   uvicorn lawbot.backend.app:app --reload
   ```

   By default the API listens on `http://127.0.0.1:8000`.  The front‑end will call `/api/search`, `/api/summarize` and `/api/citations` relative to this base.

6. **Serve the front‑end**

   The front‑end is a simple static site located in `lawbot/frontend`.  You can open `index.html` directly in your browser or serve it with a lightweight HTTP server.  For example, from the repository root:

   ```bash
   cd lawbot/frontend
   python -m http.server 8080
   ```

   Then navigate to `http://localhost:8080` in your browser.  The UI provides a text box to enter queries and buttons to search, summarise or check citations.

## Repository Structure

- `lawbot/` — Contains agent templates and individual agent workspaces (e.g., `research_agent`, `drafting_agent`) as well as the new front‑end and back‑end directories.  The front‑end lives in `lawbot/frontend` and the FastAPI server lives in `lawbot/backend`.
- `lawbot_runtime/` — Minimal runtime for loading agents and executing skills.  This is not a full OpenClaw runtime but follows similar concepts.
- `docs/` — Documentation, including this requirements file.
- `package.json` — Node project metadata for any frontend components.
- `requirements.txt` — Python dependencies list.

---

Adjust paths and commands based on your operating system and specific configuration.  Contributions should respect the per‑agent isolation strategy and ethical guidelines described elsewhere in the project.