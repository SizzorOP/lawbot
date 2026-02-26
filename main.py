from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import router and tools
from navigation.router import map_intent_to_tool
from tools.legal_search import legal_search
from tools.web_search import web_search
from tools.adversarial_engine import analyze_draft
from tools.procedural_navigator import get_procedural_timeline
from tools.document_processor import process_legal_document

app = FastAPI(title="NyayAssist API", description="Backend for the Lawbot Assistant")

class QueryRequest(BaseModel):
    query: str
    document_type: str = None  # Optional context for adversarial engine
    jurisdiction: str = None   # Optional context for adversarial engine

@app.get("/")
def read_root():
    return {"status": "online", "message": "NyayAssist API is running."}

@app.post("/api/query")
def process_query(request: QueryRequest):
    """
    Main endpoint to process a natural language query.
    Routes the query to the appropriate tool using the Navigation Router.
    """
    raw_query = request.query
    if not raw_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # Step 1: Map Intent
        route_info = map_intent_to_tool(raw_query)
        target_tool = route_info.get("target_tool")
        kwargs = route_info.get("extracted_kwargs", {})
        
        # Step 2: Execute Corresponding Tool
        if target_tool == "legal_search":
            search_term = kwargs.get("query", raw_query)
            result = legal_search(search_term)
            return {"route": "legal_search", "result": result}
            
        elif target_tool == "web_search":
            search_term = kwargs.get("query", raw_query)
            result = web_search(search_term)
            return {"route": "web_search", "result": result}
            
        elif target_tool == "adversarial_engine":
            # For testing via simple text input. In a real scenario, the document would be passed explicitly.
            draft_text = kwargs.get("query", raw_query)
            doc_type = request.document_type or "Legal Document"
            jurisdiction = request.jurisdiction or "Indian Court"
            result = analyze_draft(draft_text, doc_type, jurisdiction)
            return {"route": "adversarial_engine", "result": result}
            
        elif target_tool == "procedural_navigator":
            stage = kwargs.get("case_stage")
            code = kwargs.get("law_code")
            if not stage or not code:
                 return {"route": "procedural_navigator", "error": "Could not extract case stage or law code from the query. Please be more specific."}
            result = get_procedural_timeline(stage, code)
            return {"route": "procedural_navigator", "result": result}
            
        elif target_tool == "document_processor":
            document_text = kwargs.get("query", raw_query)
            doc_type = request.document_type or "legal_document"
            result = process_legal_document(document_text, doc_type)
            return {"route": "document_processor", "result": result}
            
        elif target_tool == "unknown":
            return {"route": "unknown", "message": "I am an AI Legal Assistant. The query seems outside my scope or unclear. Please rephrase."}
            
        else:
            raise HTTPException(status_code=500, detail=f"Unrecognized routing logic target: {target_tool}")

    except Exception as e:
        # Catch-all for API errors, LLM execution errors, or Kanoon/SerpAPI failures
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the request: {str(e)}")

if __name__ == "__main__":
    print("Starting NyayAssist API Server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
