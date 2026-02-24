"""FastAPI backend for the LawBOT system.

This module exposes HTTP endpoints that wrap the core lawbot runtime
tools.  It allows a simple front‑end to query legal search results,
generate document summaries and validate citations via REST APIs.

To run the backend during development:

    uvicorn lawbot.backend.app:app --reload

Ensure that the environment variable ``INDIAN_KANOON_TOKEN`` is set
with your API key for Indian Kanoon searches before starting the
server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from lawbot_runtime.tools import legal_search, summarize_doc, citation_checker


app = FastAPI(title="LawBOT API")

# Allow all origins during development.  In production you should
# restrict this to your front‑end domain for better security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str
    page: int | None = 0
    max_results: int | None = 10


class SummarizeRequest(BaseModel):
    text: str
    max_sentences_per_section: int | None = 2


class CitationRequest(BaseModel):
    citations: List[str]


@app.post("/api/search")
async def api_search(req: SearchRequest) -> Dict[str, Any]:
    """Search Indian Kanoon for the given query.

    Returns a JSON object with a list of results.  If the search
    cannot be performed (e.g. missing API token) the list will be
    empty.
    """
    results = legal_search(req.query, page=req.page or 0, max_results=req.max_results or 10)
    return {"results": results}


@app.post("/api/summarize")
async def api_summarize(req: SummarizeRequest) -> Dict[str, Any]:
    """Produce a deterministic summary of the input text.

    The summariser extracts the first few sentences of the first few
    paragraphs; it does not hallucinate content.
    """
    summary = summarize_doc(req.text, max_sentences_per_section=req.max_sentences_per_section or 2)
    return {"summary": summary}


@app.post("/api/citations")
async def api_citations(req: CitationRequest) -> Dict[str, Any]:
    """Validate a list of citation strings.

    Each citation is checked for simple pattern conformity.  Unknown
    patterns are flagged but no citations are invented.
    """
    checked = citation_checker(req.citations)
    return {"citations": checked}


@app.get("/ping")
async def ping() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}