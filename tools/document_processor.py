import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

class ProcessorError(Exception):
    """Raised when the Document Processor fails."""
    pass

def process_legal_document(document_text: str, document_type: str = "legal_document") -> dict:
    """
    Process raw text from a legal document to extract a timeline and English summary.
    Strictly follows the Cite-or-Abstain rule to prevent hallucinations.
    
    Args:
        document_text (str): The raw text of the document.
        document_type (str): Optional hint about the document type.
        
    Returns:
        dict: A structured JSON containing 'summary', 'timeline', 'confidence_score', and 'abstentions'.
    """
    if not document_text or not document_text.strip():
         return {
            "summary": "Error: Provided document text is empty.",
            "timeline": [],
            "confidence_score": 0,
            "abstentions": ["Empty input"]
         }

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ProcessorError("OPENAI_API_KEY is missing for Document Processor.")

    client = OpenAI(api_key=api_key)

    # Define the strict JSON schema for the output
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "document_analysis",
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {
                        "type": "string",
                        "description": "Clear English translation and summary of the document's core issue."
                    },
                    "timeline": {
                        "type": "array",
                        "description": "Chronological list of material events explicitly mentioned in the text.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "date": {
                                    "type": "string",
                                    "description": "The exact date of the event, or 'Approximate/Unknown' if not stated."
                                },
                                "event": {
                                    "type": "string",
                                    "description": "Description of what happened."
                                },
                                "exact_quote": {
                                      "type": "string",
                                      "description": "A short exact quote from the text proving this event."
                                }
                            },
                            "required": ["date", "event", "exact_quote"],
                            "additionalProperties": False
                        }
                    },
                    "confidence_score": {
                        "type": "integer",
                        "description": "Confidence out of 10 that all stated facts are strictly derived from the text without hallucination."
                    },
                    "abstentions": {
                        "type": "array",
                        "description": "List of things that were unclear, unreadable, or omitted to prevent hallucination.",
                        "items": {"type": "string"}
                    }
                },
                "required": ["summary", "timeline", "confidence_score", "abstentions"],
                "additionalProperties": False
            },
            "strict": True
        }
    }

    system_prompt = f"""
    You are an expert Legal Assistant in India analyzing a {document_type}.
    Your task is to process the provided text and output a structured JSON response.
    
    1. Provide a concise English summary/translation of the core issue.
    2. Extract a chronological timeline of material events explicitly mentioned in the text.
    
    STRICT RULES (CITE-OR-ABSTAIN):
    - Every event in the timeline MUST be grounded in the text.
    - Provide a short 'exact_quote' for every event to prove you read it.
    - DO NOT invent any dates, names, or facts. 
    - If a date is missing, write 'Unknown'.
    - If the text is not a legal or material document, state so in the summary.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            temperature=0.0, # Zero creativity to prevent hallucinations
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Document Text to Analyze:\n\n{document_text}"}
            ],
            response_format=response_format
        )
        
        raw_output = response.choices[0].message.content
        return json.loads(raw_output)
        
    except Exception as e:
        raise ProcessorError(f"LLM processing failed: {str(e)}")

if __name__ == "__main__":
    # Internal Test
    test_doc = """
    IN THE COURT OF CHIEF METROPOLITAN MAGISTRATE, NEW DELHI
    FIR No. 123/2023
    Date: 15-10-2023
    
    On 12th October 2023 around 4 PM, I was walking near the market when my bag was stolen by two unknown persons on a bike.
    I immediately went to the nearby police booth but it was closed. 
    The next day (13-10-2023), I visited the concerned Police Station and submitted a written complaint. 
    Today, 15-10-2023, this FIR has been formally registered.
    """
    
    print("Testing Document Processor...")
    try:
        res = process_legal_document(test_doc, "FIR")
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Error: {e}")
