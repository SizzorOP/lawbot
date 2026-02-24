import re
from typing import List, Dict, Optional


_AIR_RE = re.compile(r"^AIR\s+\d{4}\s+[A-Z]{1,4}\s+\d+$")
_SCC_RE = re.compile(r"^\(\d{4}\)\s*\d+\s*SCC\s*\d+$")


def _split_citations(text: str) -> List[str]:
    """
    Split a user-provided citations string into clean citation chunks.

    Accepts separators:
    - semicolon ;
    - newline
    - comma (only if user uses commas)
    """
    if not text:
        return []
    # normalize newlines
    s = text.replace("\r\n", "\n").replace("\r", "\n")
    # primary split on semicolons/newlines
    parts = re.split(r"[;\n]+", s)
    cleaned = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        cleaned.append(p)
    return cleaned


def citation_checker(citations_list: str) -> List[Dict[str, Optional[str]]]:
    """
    Validate citation formats (format-level only; not database verification).
    Input: a single string containing one or more citations.
    Output: list of {citation, valid, corrected, message}
    """
    citations = _split_citations(citations_list)

    out: List[Dict[str, Optional[str]]] = []
    for c in citations:
        c_norm = " ".join(c.split())  # collapse multiple spaces
        valid = bool(_AIR_RE.match(c_norm) or _SCC_RE.match(c_norm))

        out.append(
            {
                "citation": c_norm,
                "valid": valid,
                "corrected": None,
                "message": "Citation appears to match a known format."
                if valid
                else "Unrecognised citation format; cannot verify.",
            }
        )
    return out