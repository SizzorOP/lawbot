import requests
import json

API_URL = "http://127.0.0.1:8000/api/query"

def test_document_processor():
    test_doc = """
    IN THE COURT OF CHIEF METROPOLITAN MAGISTRATE, NEW DELHI
    FIR No. 123/2023
    Date: 15-10-2023
    
    On 12th October 2023 around 4 PM, I was walking near the market when my bag was stolen by two unknown persons on a bike.
    I immediately went to the nearby police booth but it was closed. 
    The next day (13-10-2023), I visited the concerned Police Station and submitted a written complaint. 
    Today, 15-10-2023, this FIR has been formally registered.
    """
    
    print("\n--- Testing Document Processor via API ---")
    # Tell the router to route to document processor
    payload = {
        "query": f"Process this document and give me a timeline: {test_doc}",
        "document_type": "FIR"
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        print("Response Code:", response.status_code)
        
        data = response.json()
        print("Route Identified:", data.get("route"))
        print("\nProcessed Result:")
        print(json.dumps(data.get("result"), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print("Response body:", e.response.text)

if __name__ == "__main__":
    test_document_processor()
