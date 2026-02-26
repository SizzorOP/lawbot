import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

class APIKeyError(Exception):
    """Raised when the OpenAI API key is missing."""
    pass

class LLMExecutionError(Exception):
    """Raised when the LLM service fails."""
    pass

def analyze_draft(draft_text: str, document_type: str, jurisdiction: str) -> Dict[str, Any]:
    """
    Simulates an opposing counsel examining a legal draft.
    Uses OpenAI's structured outputs to guarantee the response format.
    
    Args:
        draft_text (str): The raw text of the document.
        document_type (str): Type of document (e.g., 'written_statement').
        jurisdiction (str): Applicable jurisdiction (e.g., 'Delhi High Court').
        
    Returns:
        Dict: A structured dictionary containing confidence score, flagged issues, and abstentions.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise APIKeyError("OPENAI_API_KEY is not set in the environment.")

    if not draft_text or len(draft_text.strip()) == 0:
        return {
            "status": "error",
            "message": "Document text is empty."
        }
        
    if len(draft_text) < 50: # Basic heuristic for a grocery list vs real legal draft
        return {
            "status": "error",
            "message": "Document does not appear to be a legal draft."
        }

    client = OpenAI(api_key=api_key)

    # Define the strict JSON schema for the expected output
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "adversarial_analysis",
            "schema": {
                "type": "object",
                "properties": {
                    "confidence_score": {
                        "type": "integer",
                        "description": "Confidence in the analysis from 1 to 10."
                    },
                    "flagged_issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string",
                                    "enum": ["missing_citation", "logical_gap", "contradiction", "maintainability_objection"]
                                },
                                "line_snippet": {
                                    "type": "string",
                                    "description": "Exact quote from the draft where the issue occurs."
                                },
                                "recommendation": {
                                    "type": "string",
                                    "description": "Specific recommendation, citing Indian law/statutes if applicable."
                                }
                            },
                            "required": ["type", "line_snippet", "recommendation"],
                            "additionalProperties": False
                        }
                    },
                    "abstentions": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "Topics the LLM avoided due to lack of certainty."
                    }
                },
                "required": ["confidence_score", "flagged_issues", "abstentions"],
                "additionalProperties": False
            },
            "strict": True
        }
    }

    system_prompt = f"""
    You are a Senior Litigator in India reviewing a '{document_type}' in '{jurisdiction}'.
    Your goal is to find its weakest points, missing precedents, and logical contradictions. 
    You MUST adhere to the 'Cite-or-Abstain' rule. If you claim a precedent is missing, 
    you must cite the specific section of the applicable Indian Act (e.g., IPC, CrPC/BNSS, CPC, Evidence Act).
    
    DO NOT invent case names. If you cannot remember the exact Supreme Court/High Court case name, 
    merely suggest referencing the applicable statute section and add to 'abstentions'.
    
    The System MUST NEVER suggest altering facts, evading summons, or hiding evidence. 
    Any detection of such intent in the draft must trigger an immediate refusal (put it in flagged_issues).
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06", # Structured outputs supported
            temperature=0.2, # Low temperature for deterministic analysis
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please review the following draft:\n\n{draft_text}"}
            ],
            response_format=response_format
        )
        
        # The response is guaranteed to match our schema
        json_response = json.loads(response.choices[0].message.content)
        return json_response

    except Exception as e:
        raise LLMExecutionError(f"Failed to execute LLM analysis: {str(e)}")


if __name__ == "__main__":
    # Self-test logic
    test_draft = "The plaintiff claims the contract was breached on Jan 1st. However, we state it was never signed. Also, the limitation period for this money recovery suit is 5 years from the breach."
    
    try:
        print("Running Adversarial Engine Test...")
        result = analyze_draft(
            draft_text=test_draft,
            document_type="Written Statement",
            jurisdiction="Delhi High Court"
        )
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Test failed. Error: {e}")
