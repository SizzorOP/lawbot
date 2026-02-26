import requests
import json
import time

API_URL = "http://127.0.0.1:8000/api/query"

def test_query(query_text):
    print(f"\n--- Testing Query: '{query_text}' ---")
    payload = {"query": query_text}
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        print("Response Code:", response.status_code)
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print("Response body:", e.response.text)

if __name__ == "__main__":
    test_queries = [
        "What are the latest judgments on Section 482 of CrPC?",
        "What is the limitation period for filing a written statement under CPC?",
        "My client received summons today from the commercial court. Draft a response saying we need more time."
    ]
    
    for q in test_queries:
        test_query(q)
        time.sleep(1) # Rate limiting buffer
