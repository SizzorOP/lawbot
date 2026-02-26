import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the Kanoon API token from the environment
INDIAN_KANOON_TOKEN = os.getenv("INDIAN_KANOON_TOKEN")

def test_kanoon_connection():
    if not INDIAN_KANOON_TOKEN:
        print("ERROR: INDIAN_KANOON_TOKEN is not set in the environment.")
        return

    print("Verifying Indian Kanoon API Connection...")
    
    # Endpoint for a simple search to verify the token
    url = "https://api.indiankanoon.org/search/"
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # A simple query to test if we get a 200 OK
    params = {
        "formInput": "section 482 crpc",
        "pagenum": 0
    }

    try:
        response = requests.post(url, headers=headers, json=params, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS! API Connection is valid.")
            data = response.json()
            if "docs" in data and len(data["docs"]) > 0:
                print(f"Sample response: Retrieved {len(data['docs'])} documents.")
                print(f"First doc title: {data['docs'][0].get('title', 'N/A')}")
            else:
                print("Connection successful, but no documents returned for this query.")
        elif response.status_code == 403:
            print("ERROR: Authorization failed. Check your API token.")
        else:
            print(f"ERROR: Received unexpected response: {response.text}")
            
    except Exception as e:
        print(f"ERROR: Failed to connect to Indian Kanoon API. Details: {str(e)}")

if __name__ == "__main__":
    test_kanoon_connection()
