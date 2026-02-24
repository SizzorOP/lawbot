import re
from typing import Dict, Any, List


def summarize_doc(text: str, *, max_sentences_per_section: int = 2) -> Dict[str, Any]:
    """
    Deterministic summarizer (no hallucinations):
    - Splits into paragraphs
    - Extracts sentences in order
    - Allocates sequential sentences into fixed sections

    NOTE: This does not "interpret". It only slices from the given text.
    """
    if not text:
        return {"facts": [], "issues": [], "arguments": [], "precedents": [], "reasoning": []}

    paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    sentences: List[str] = []

    for para in paragraphs:
        parts = re.split(r"(?<=[.!?])\s+", para)
        for part in parts:
            s = part.strip()
            if s:
                sentences.append(s)

    def take(start: int) -> List[str]:
        return sentences[start : start + max_sentences_per_section]

    return {
        "facts": take(0),
        "issues": take(max_sentences_per_section),
        "arguments": take(max_sentences_per_section * 2),
        "precedents": take(max_sentences_per_section * 3),
        "reasoning": take(max_sentences_per_section * 4),
    }