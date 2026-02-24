import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from lawbot_runtime.tools import legal_search, doc_fragment, doc_meta, get_document
from lawbot_runtime.tools.summarize_doc import summarize_doc
from lawbot_runtime.tools.citation_checker import citation_checker

app = FastAPI(title="LawBOT API", version="0.1")

# Dev-friendly CORS (tighten for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocRequest(BaseModel):
    docid: str
    maxcites: int | None = None
    maxcitedby: int | None = None

class SummarizeRequest(BaseModel):
    text: str
    max_sentences_per_section: int = 2

class SearchRequest(BaseModel):
    query: str
    pagenum: int = 0
    maxpages: int = 1
    doctypes: str | None = None
    fromdate: str | None = None
    todate: str | None = None
    title: str | None = None
    cite: str | None = None
    author: str | None = None
    bench: str | None = None
    maxcites: int | None = None

class FragmentRequest(BaseModel):
    docid: str
    query: str

class MetaRequest(BaseModel):
    docid: str

class CitationRequest(BaseModel):
    citations: str

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.post("/api/search")
def api_search(req: SearchRequest):
    try:
        filters = {
            "doctypes": req.doctypes,
            "fromdate": req.fromdate,
            "todate": req.todate,
            "title": req.title,
            "cite": req.cite,
            "author": req.author,
            "bench": req.bench,
            "maxcites": req.maxcites,
            "maxpages": req.maxpages,
        }
        # legal_search in tools currently returns {"found":..., "results":[...]} OR API-shaped dict,
        # so we support both styles.
        out = legal_search(
            req.query,
            pagenum=req.pagenum,
            maxpages=req.maxpages,
            doctypes=req.doctypes,
            fromdate=req.fromdate,
            todate=req.todate,
            title=req.title,
            cite=req.cite,
            author=req.author,
            bench=req.bench,
            maxcites=req.maxcites,
            max_results=10,
        )
        return out
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")

@app.post("/api/fragment")
def api_fragment(req: FragmentRequest):
    try:
        return doc_fragment(req.docid, req.query)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fragment fetch failed: {e}")

@app.post("/api/meta")
def api_meta(req: MetaRequest):
    try:
        return doc_meta(req.docid)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Meta fetch failed: {e}")

@app.post("/api/citations")
def api_citations(req: CitationRequest):
    try:
        return citation_checker(req.citations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation check failed: {e}")
@app.post("/api/doc")
def api_doc(req: DocRequest):
    try:
        return get_document(req.docid, maxcites=req.maxcites, maxcitedby=req.maxcitedby)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Doc fetch failed: {e}")


@app.post("/api/summarize")
def api_summarize(req: SummarizeRequest):
    try:
        return summarize_doc(req.text, max_sentences_per_section=req.max_sentences_per_section)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarize failed: {e}")