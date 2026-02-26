from typing import Dict, Any
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class RoutingError(Exception):
    pass

def map_intent_to_tool(user_query: str) -> Dict[str, Any]:
    """
    Layer 2 Navigation Router: Maps a raw user query from WhatsApp or Web to the correct tool.
    Uses OpenAI to classify intent and extract required arguments reliably.
    
    Args:
        user_query (str): The raw text from the user.
        
    Returns:
        Dict: Contains 'target_tool' and 'extracted_kwargs'.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RoutingError("OPENAI_API_KEY is missing for Navigation Router.")

    client = OpenAI(api_key=api_key)

    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "intent_routing",
            "schema": {
                "type": "object",
                "properties": {
                    "target_tool": {
                        "type": "string",
                        "enum": [
                            "legal_search", 
                            "web_search", 
                            "adversarial_engine", 
                            "procedural_navigator",
                            "document_processor",
                            "unknown"
                        ],
                        "description": "The specific tool this query should be routed to."
                    },
                    "extracted_kwargs": {
                        "type": "object",
                        "description": "Key-value pairs extracted from the query needed by the target tool.",
                        "properties": {
                            "query": {"type": "string"},
                            "case_stage": {"type": "string"},
                            "law_code": {"type": "string"}
                        },
                        "required": ["query", "case_stage", "law_code"],
                        "additionalProperties": False
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Brief explanation of why this route was chosen."
                    }
                },
                "required": ["target_tool", "extracted_kwargs", "reasoning"],
                "additionalProperties": False
            },
            "strict": True
        }
    }

    system_prompt = """
    You are the central Navigation Router for YuktiAI (an Indian Legal Assistant).
    Your job is to strictly classify the user's intent into one of the available tools 
    and extract the minimum necessary parameters.
    
    Tools Details:
    1. 'legal_search': For finding case laws, judgments, or sections on Indian Kanoon. (Requires 'query' to be a CONCISE boolean keyword string. Use ONLY the core legal concepts like sections, acts, and core legal issues. Example: Section 438 CrPC economic offence anticipatory bail. Never include conversational words or intents like find, judgments, conflicting, views, recent, etc.)
    2. 'web_search': For general legal news or recent amendments not on Kanoon. (Requires 'query')
    3. 'procedural_navigator': For asking about timelines, limitation periods, or next steps (Requires 'case_stage' and 'law_code').
    4. 'adversarial_engine': For stress-testing documents. 
    5. 'document_processor': For processing, summarizing, translating, or extracting timelines from uploaded legal documents or raw text logs. (Requires 'query' to hold the document text).
    6. 'unknown': If it's conversational filler or outside legal scope.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            temperature=0.0,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"User query: '{user_query}'"}
            ],
            response_format=response_format
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        raise RoutingError(f"Router LLM execution failed: {str(e)}")

if __name__ == "__main__":
    test_queries = [
        "Find me judgments on Section 138 NI Act with compounding",
        "What is the limitation limit for filing a written statement in a commercial suit under CPC?",
        "Fetch the latest news on Bharatiya Nyaya Sanhita amendments"
    ]
    
    print("Testing Router Logic...")
    for q in test_queries:
        print(f"\nQuery: {q}")
        try:
            res = map_intent_to_tool(q)
            print(json.dumps(res, indent=2))
        except Exception as e:
            print(f"Error: {e}")
