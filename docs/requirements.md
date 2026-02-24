# LawBOT – Environment & Setup Requirements

This repo contains:
- `lawbot_runtime/` – a minimal OpenClaw-like runtime (CLI) that loads agent workspaces from `lawbot/`.
- `lawbot/` – agent workspaces (`research_agent`, `drafting_agent`, `case_agent`) and skill definitions.

## Prerequisites

- Python **3.10+** (recommended 3.11)
- `pip` (comes with Python)

## Install

From the repository root:

```bash
python -m venv .venv
```

### Windows (Command Prompt)

```bat
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Windows (PowerShell)

If you get an “execution policy” error when activating the venv:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then:

```powershell
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### macOS / Linux

```bash
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Indian Kanoon API Token (Required for legal research)

The `legal_search` tool calls the Indian Kanoon API and requires a token.

Set this environment variable **before** running any legal research:

```bash
export INDIAN_KANOON_TOKEN="YOUR_TOKEN_HERE"
```

On Windows (Command Prompt):

```bat
set INDIAN_KANOON_TOKEN=YOUR_TOKEN_HERE
```

On Windows (PowerShell):

```powershell
$env:INDIAN_KANOON_TOKEN="YOUR_TOKEN_HERE"
```

> Keep your token private. Do **not** commit it to GitHub.

Optional: create a `.env` file (not committed) and load it in your shell manually.
A sample file is provided as `.env.example`.

## Run

### Citation checker

```bash
python lawbot_runtime/main.py drafting_agent citation_checker --citations "AIR 1967 SC 1643; (1973) 4 SCC 225; random text"
```

### Legal research

```bash
python lawbot_runtime/main.py research_agent legal-research --query "section 482 crpc inherent powers"
```

If your token is set correctly, you should see a list of results with `doc_id`, `title`, and `link`.

## Troubleshooting

- If you see `RuntimeError: INDIAN_KANOON_TOKEN is not set`, set the env var as shown above.
- If `pip install -r requirements.txt` fails, ensure you are in the repo root (same folder as `requirements.txt`).
- If PowerShell blocks activation, use the execution-policy command shown above.
