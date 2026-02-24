"""Tool functions for LawBOT runtime.

This package exposes concrete tool implementations that correspond to
skills defined in the agent workspaces.  Each tool function takes
python arguments and returns structured data; the agent class calls
these functions based on skill names.

Tools implemented:

* ``legal_search`` – perform a legal database search via the Indian
  Kanoon API. Returns a list of normalized results. Requires an API
  token set in the ``INDIAN_KANOON_TOKEN`` environment variable.
  If the API call fails, the function returns an empty list.

* ``summarize_doc`` – produce a very simple summary of a document by
  extracting the opening sentences from each of the first few
  paragraphs.  This avoids hallucination by relying entirely on the
  provided input; no additional information is invented.  The
  returned structure has sections for facts, issues, arguments,
  precedents and reasoning.

* ``citation_checker`` – validate a list of citation strings.  This
  implementation uses a basic heuristic: it checks for common Indian
  citation formats (e.g. ``AIR YEAR SC PAGE`` or ``(YEAR) SCALE``).
  It flags unrecognised patterns and does not fabricate missing
  details.  Future versions could call the legal database to verify
  citations.

* ``document_fill`` – fill in a template string using Python
  ``str.format`` style with variables supplied in a dictionary.

* ``transcribe_audio`` – placeholder for speech‑to‑text; it returns
  ``NotImplementedError`` to avoid hallucinating transcription output.

* ``case_status`` – placeholder for court status lookup; returns
  ``NotImplementedError``.

These tools prioritise correctness over creativity.  They should
return plain data or raise clear errors rather than fabricate
results.  Agents can wrap the returned data into user‑facing
responses.

"""

import os
import re
import json
from typing import List, Dict, Any, Optional

import requests
import html

_TAG_RE = re.compile(r"<[^>]+>")

def _strip_html(s: str) -> str:
    if not s:
        return ""
    # decode entities then strip tags then collapse whitespace
    s = html.unescape(s)
    s = _TAG_RE.sub("", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

__all__ = [
    "legal_search",
    "get_document",
    "get_origdoc",
    "doc_fragment",
    "doc_meta",
    "summarize_doc",
    "citation_checker",
    "document_fill",
    "transcribe_audio",
    "case_status",
]


def _ik_headers() -> Dict[str, str]:
    """
    Indian Kanoon API:
    - Uses Authorization: Token <token>
    - Returns JSON/XML depending on Accept header
    - In many environments, endpoints respond with 405 to GET, so we use POST.
    """
    token = os.environ.get("INDIAN_KANOON_TOKEN", "").strip()
    if not token:
        raise RuntimeError(
            "INDIAN_KANOON_TOKEN is not set. Set it in your environment to a valid Indian Kanoon API token."
        )
    return {
        "Authorization": f"Token {token}",
        "Accept": "application/json",
        "User-Agent": "LawBOT/0.1",
        # for form-encoded POST bodies
        "Content-Type": "application/x-www-form-urlencoded",
    }


def _ik_post(url: str, data: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Internal helper to call Indian Kanoon API using POST (GET may return 405).
    - data: sent as application/x-www-form-urlencoded (requests does this by default for dict)
    - params: querystring params
    """
    resp = requests.post(url, headers=_ik_headers(), data=data or {}, params=params or {}, timeout=30)
    resp.raise_for_status()
    return resp.json()


def legal_search(
    query: str,
    *,
    pagenum: int = 0,
    maxpages: int = 1,
    doctypes: Optional[str] = None,
    fromdate: Optional[str] = None,
    todate: Optional[str] = None,
    title: Optional[str] = None,
    cite: Optional[str] = None,
    author: Optional[str] = None,
    bench: Optional[str] = None,
    maxcites: Optional[int] = None,
    max_results: int = 10,
) -> List[Dict[str, Any]]:
    """
    Search Indian Kanoon using POST.

    Official endpoint:
      https://api.indiankanoon.org/search/

    Required fields:
      formInput, pagenum (0-indexed)

    Optional params:
      maxpages, doctypes, fromdate, todate, title, cite, author, bench, maxcites
    """
    # Indian Kanoon expects formInput and pagenum.
    data: Dict[str, Any] = {
        "formInput": query,
        "pagenum": int(pagenum),
    }

    # Most filters are query parameters (works fine with POST too).
    params: Dict[str, Any] = {}
    if maxpages is not None:
        params["maxpages"] = int(maxpages)
    if doctypes:
        params["doctypes"] = doctypes
    if fromdate:
        params["fromdate"] = fromdate
    if todate:
        params["todate"] = todate
    if title:
        params["title"] = title
    if cite:
        params["cite"] = cite
    if author:
        params["author"] = author
    if bench:
        params["bench"] = bench
    if maxcites is not None:
        params["maxcites"] = int(maxcites)

    url = "https://api.indiankanoon.org/search/"

    try:
        data_json = _ik_post(url, data=data, params=params)
    except Exception:
        return []

    docs = data_json.get("docs") or []
    out: List[Dict[str, Any]] = []
    for d in docs[:max_results]:
        tid = d.get("tid")
        out.append(
            {
                "doc_id": tid,
                "title": _strip_html(d.get("title", "")),
                "snippet": _strip_html(d.get("headline", "")),
                "docsource": d.get("docsource", ""),
                "docsize": d.get("docsize"),
                "link": f"https://indiankanoon.org/doc/{tid}/" if tid else None,
                "cites": d.get("cites"),
            }
        )
    return out


def get_document(docid: str, *, maxcites: Optional[int] = None, maxcitedby: Optional[int] = None) -> Dict[str, Any]:
    """
    Fetch a full document from Indian Kanoon (/doc/<docid>/) using POST.
    """
    params: Dict[str, Any] = {}
    if maxcites is not None:
        params["maxcites"] = int(maxcites)
    if maxcitedby is not None:
        params["maxcitedby"] = int(maxcitedby)

    url = f"https://api.indiankanoon.org/doc/{docid}/"
    return _ik_post(url, data={}, params=params)


def get_origdoc(docid: str) -> Dict[str, Any]:
    """
    Fetch original/court-copy from /origdoc/<docid>/ using POST.
    """
    url = f"https://api.indiankanoon.org/origdoc/{docid}/"
    return _ik_post(url, data={}, params={})


def doc_fragment(docid: str, query: str) -> Dict[str, Any]:
    """
    Fetch document fragments matching query from /docfragment/<docid>/ using POST.
    """
    url = f"https://api.indiankanoon.org/docfragment/{docid}/"
    # docfragment expects formInput
    data = {"formInput": query}
    return _ik_post(url, data=data, params={})


def doc_meta(docid: str) -> Dict[str, Any]:
    """
    Fetch document metadata from /docmeta/<docid>/ using POST.
    """
    url = f"https://api.indiankanoon.org/docmeta/{docid}/"
    return _ik_post(url, data={}, params={})