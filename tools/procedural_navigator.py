import os
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class APIKeyError(Exception):
    pass

class LLMExecutionError(Exception):
    pass


# MVP Hardcoded Logic Core for common Indian procedural steps
PROCEDURAL_MAP = {
    "cpc": {
        "summons received": {
            "current_stage": "Summons received",
            "next_procedural_step": "Filing of Written Statement",
            "timeline_days": 30,
            "max_extension_days": 120,
            "statutory_reference": "Order VIII Rule 1, Civil Procedure Code (CPC)",
            "confidence": "High (Hardcoded)"
        },
        "issues framed": {
            "current_stage": "Issues framed by Court",
            "next_procedural_step": "Filing list of witnesses & Evidence Affidavits",
            "timeline_days": 15,
            "max_extension_days": 15,
            "statutory_reference": "Order XVI Rule 1, Civil Procedure Code (CPC)",
            "confidence": "High (Hardcoded)"
        }
    },
    "crpc": {
        "fir registered": {
            "current_stage": "FIR Registered",
            "next_procedural_step": "Investigation by Police and Filing of Charge Sheet",
            "timeline_days": 60,
            "max_extension_days": 90, # 90 for severe offenses
            "statutory_reference": "Section 167(2), Code of Criminal Procedure (CrPC)",
            "confidence": "High (Hardcoded)"
        }
    }
}


def get_procedural_timeline(case_stage: str, law_code: str) -> Dict[str, Any]:
    """
    Map out procedural timelines and limitations under Indian Law.
    
    Args:
        case_stage (str): The current event (e.g., "Summons received").
        law_code (str): The applicable code ("CPC", "CrPC", "BNSS", etc).
        
    Returns:
        Dict: A structured procedural mapping.
    """
    
    # 1. Check Hardcoded Core first (Deterministic Safety)
    law_code_key = law_code.lower()
    stage_key = case_stage.lower()
    
    if law_code_key in PROCEDURAL_MAP:
        for known_stage, details in PROCEDURAL_MAP[law_code_key].items():
            if known_stage in stage_key or stage_key in known_stage:
                return details

    # 2. If not found, use LLM augmentation
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise APIKeyError("OPENAI_API_KEY is not set in the environment.")
        
    client = OpenAI(api_key=api_key)

    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "procedural_timeline",
            "schema": {
                "type": "object",
                "properties": {
                    "current_stage": {"type": "string"},
                    "next_procedural_step": {"type": "string"},
                    "timeline_days": {"type": "integer"},
                    "max_extension_days": {"type": "integer"},
                    "statutory_reference": {"type": "string"},
                    "confidence": {"type": "string", "enum": ["Medium (LLM Generated)", "Abstain (LLM Unsure)"]}
                },
                "required": ["current_stage", "next_procedural_step", "timeline_days", "max_extension_days", "statutory_reference", "confidence"],
                "additionalProperties": False
            },
            "strict": True
        }
    }

    system_prompt = f"""
    You are an Indian Procedural Law expert. 
    Provide the exact timeline and next step for the given case stage '{case_stage}' under '{law_code}'. 
    You MUST cite the exact CPC, CrPC, BNSS, or Limitation Act section. 
    If you are unsure of the exact timeline, output 'Abstain (LLM Unsure)' for confidence and 0 for timeline_days.
    Never guess a limitation period. Limitation errors are fatal.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            temperature=0.0, # Zero creativity required here
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"What is the limitation/timeline and next step for: {case_stage}?"}
            ],
            response_format=response_format
        )
        
        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        raise LLMExecutionError(f"Failed to execute Procedural LLM: {str(e)}")


if __name__ == "__main__":
    # Self-test logic
    try:
        print("Testing Hardcoded CPC Summons...")
        cpc_res = get_procedural_timeline("summons received", "CPC")
        print(json.dumps(cpc_res, indent=2))
        
        print("\nTesting LLM Fallback (Arbitration Section 34)...")
        arb_res = get_procedural_timeline("Arbitration Award Passed", "Arbitration and Conciliation Act")
        print(json.dumps(arb_res, indent=2))
        
    except Exception as e:
        print(f"Test failed. Error: {e}")
