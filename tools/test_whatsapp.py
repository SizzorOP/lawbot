import os
import requests
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN")

def test_whatsapp_connection():
    if not WHATSAPP_API_TOKEN:
        print("ERROR: WHATSAPP_API_TOKEN is not set in the environment.")
        return

    print("Verifying WhatsApp Business API Connection...")
    
    # We use a generic GET request to graph.facebook.com to verify if the token is 
    # recognized by Meta's Graph API. Without a phone_number_id, we can just ping the 'me' endpoint
    url = "https://graph.facebook.com/v18.0/me"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS! WhatsApp API token is valid (Meta Graph API responded 200 OK).")
            data = response.json()
            print(f"Meta Graph ME Data: {data}")
        elif response.status_code in [400, 401, 403]:
            print("ERROR: Authorization failed or token is invalid. Check your API token.")
            print(f"Details: {response.text}")
        else:
            print(f"ERROR: Received unexpected response: {response.text}")
            
    except Exception as e:
        print(f"ERROR: Failed to connect to WhatsApp API. Details: {str(e)}")

if __name__ == "__main__":
    test_whatsapp_connection()
