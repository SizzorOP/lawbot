import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def test_serpapi_connection():
    if not SERPAPI_KEY:
        print("ERROR: SERPAPI_KEY is not set in the environment.")
        return

    print("Verifying Web Search (SerpAPI) API Connection...")
    
    url = "https://serpapi.com/search"
    
    params = {
        "engine": "google",
        "q": "Indian penal code latest amendments",
        "api_key": SERPAPI_KEY,
        "num": 2  # limit to 2 results for test
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS! SerpAPI Connection is valid.")
            data = response.json()
            if "organic_results" in data and len(data["organic_results"]) > 0:
                print(f"Sample response: Retrieved {len(data['organic_results'])} organic web results.")
                print(f"First result title: {data['organic_results'][0].get('title', 'N/A')}")
                print(f"First result link: {data['organic_results'][0].get('link', 'N/A')}")
            else:
                print("Connection successful, but no organic results returned for this query.")
        elif response.status_code in [401, 403]:
            print("ERROR: Authorization failed. Check your API key.")
            print(f"Details: {response.text}")
        else:
            print(f"ERROR: Received unexpected response: {response.text}")
            
    except Exception as e:
        print(f"ERROR: Failed to connect to SerpAPI. Details: {str(e)}")

if __name__ == "__main__":
    test_serpapi_connection()
