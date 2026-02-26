import os
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

def web_search(query: str, num_results: int = 3) -> List[Dict[str, str]]:
    """
    Perform a general web search using Google (via SerpAPI).
    
    Args:
        query (str): The search term.
        num_results (int): Number of organic results to retrieve (default=3).
        
    Returns:
        List[Dict]: A list of results containing title, link, and snippet.
        
    Raises:
        AuthError: If the SERPAPI_KEY is missing or invalid.
        APIError: If the API returns an unexpected error or times out.
    """
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        return [
            {
                "title": "Search Unavailable",
                "link": "",
                "snippet": "SerpAPI key is missing in the environment. Web search is currently disabled."
            }
        ]

    url = "https://serpapi.com/search"
    params = {
        "engine": "google",
        "q": query,
        "api_key": api_key,
        "num": num_results
    }

    try:
        # 10 second timeout as per SOP
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            organic_results = data.get("organic_results", [])
            
            # Format output explicitly as per SOP
            results = []
            for item in organic_results:
                results.append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", "")
                })
            return results

        elif response.status_code in [401, 403]:
            raise AuthError("Authorization failed. Ensure your SerpAPI key is valid.")
        
        else:
            raise APIError(f"Unexpected API response {response.status_code}: {response.text}")

    except requests.exceptions.Timeout:
        raise APIError("The SerpAPI request timed out after 10 seconds.")
    except requests.exceptions.RequestException as e:
        raise APIError(f"A network error occurred: {str(e)}")

if __name__ == "__main__":
    # Simple self-test
    try:
        results = web_search("Indian penal code latest amendments")
        print(f"Found {len(results)} results.")
        if results:
            print(results[0])
    except Exception as e:
        print(f"Error: {e}")
