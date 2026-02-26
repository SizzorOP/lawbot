import os
import time
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AuthError(Exception):
    """Raised when API authorization fails."""
    pass

class APIError(Exception):
    """Raised when the API returns an unexpected error."""
    pass

def legal_search(query: str, pagenum: int = 0) -> List[Dict[str, Any]]:
    """
    Search Indian Kanoon for legal documents based on a query.
    
    Args:
        query (str): The search term (e.g., "section 482 crpc").
        pagenum (int): Pagination index (default=0).
        
    Returns:
        List[Dict]: A list of documents containing title, doc_id, snippet, and url.
        
    Raises:
        AuthError: If the INDIAN_KANOON_TOKEN is missing or invalid.
        APIError: If the API returns an unexpected error or times out.
    """
    token = os.getenv("INDIAN_KANOON_TOKEN")
    if not token:
        raise AuthError("INDIAN_KANOON_TOKEN is not set in the environment.")

    url = "https://api.indiankanoon.org/search/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "formInput": query,
        "pagenum": pagenum
    }

    max_retries = 3
    retry_delay = 1 # Initial delay for exponential backoff

    for attempt in range(max_retries):
        try:
            # 15 second timeout as per SOP
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                docs = data.get("docs", [])
                
                # Format output explicitly as per SOP
                results = []
                for doc in docs:
                    results.append({
                        "title": doc.get("title", ""),
                        "doc_id": doc.get("docid", ""), 
                        "snippet": doc.get("snippet", ""),
                        "url": f"https://indiankanoon.org/doc/{doc.get('docid')}/" if doc.get("docid") else ""
                    })
                return results

            elif response.status_code == 403:
                raise AuthError("Authorization failed. Ensure your Kanoon API token is valid.")
            
            elif response.status_code == 429:
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    raise APIError("Rate limit exceeded (429) and max retries reached.")
            
            else:
                raise APIError(f"Unexpected API response {response.status_code}: {response.text}")

        except requests.exceptions.Timeout:
            raise APIError("The Indian Kanoon API request timed out after 15 seconds.")
        except requests.exceptions.RequestException as e:
            raise APIError(f"A network error occurred: {str(e)}")

    return []

if __name__ == "__main__":
    # Simple self-test
    try:
        results = legal_search("habeas corpus")
        print(f"Found {len(results)} results.")
        if results:
            print(results[0])
    except Exception as e:
        print(f"Error: {e}")
