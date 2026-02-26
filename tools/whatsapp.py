import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class WhatsAppError(Exception):
    """Raised when WhatsApp API returns an error."""
    pass

class AuthError(Exception):
    """Raised when WhatsApp token is invalid."""
    pass


def send_whatsapp_message(to_phone_number_id: str, recipient_phone: str, message_text: str) -> Dict[str, Any]:
    """
    Send a text message via WhatsApp Business API (Meta Graph API).
    
    Args:
        to_phone_number_id (str): The sender's phone number ID registered in Meta App.
        recipient_phone (str): The recipient's phone number with country code.
        message_text (str): The text message to send.
        
    Returns:
        Dict: The JSON response from Meta.
        
    Raises:
        AuthError: If WHATSAPP_API_TOKEN is missing or invalid.
        WhatsAppError: For other API or network issues.
    """
    token = os.getenv("WHATSAPP_API_TOKEN")
    if not token:
        raise AuthError("WHATSAPP_API_TOKEN is not set in the environment.")

    # Using v18.0 as per the SOP
    url = f"https://graph.facebook.com/v18.0/{to_phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code in [200, 201]:
            return response.json()
            
        elif response.status_code in [401, 403]:
            raise AuthError(f"Authorization failed. Verify your WhatsApp token. Meta responded: {response.text}")
            
        else:
            raise WhatsAppError(f"Unexpected response from Meta API (Status {response.status_code}): {response.text}")
            
    except requests.exceptions.Timeout:
        raise WhatsAppError("The WhatsApp API request timed out after 10 seconds.")
    except requests.exceptions.RequestException as e:
        raise WhatsAppError(f"A network error occurred while sending WhatsApp message: {str(e)}")


def parse_incoming_webhook(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parse the incoming webhook payload from Meta Graph API.
    Extracts the sender phone, message type, and content to route to the NL engine.
    
    Args:
        payload (Dict): The raw JSON payload from Meta webhook.
        
    Returns:
        Dict: Parsed data containing 'sender', 'text', 'type', 'media_id'. Returns None if unparseable.
    """
    try:
        # Standard WhatsApp webhook structure
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])
        
        if not messages:
            return None # e.g., a status update, not a message
            
        message = messages[0]
        sender_phone = message.get("from")
        msg_type = message.get("type")
        
        result = {
            "sender": sender_phone,
            "type": msg_type,
            "text": None,
            "media_id": None
        }
        
        if msg_type == "text":
            result["text"] = message.get("text", {}).get("body")
        elif msg_type in ["document", "audio", "image"]:
            result["media_id"] = message.get(msg_type, {}).get("id")
            
        return result
        
    except (IndexError, KeyError, TypeError):
        # Malformed payload
        return None


if __name__ == "__main__":
    # Self-test for webhook parsing
    sample_payload = {
      "entry": [{
        "changes": [{
          "value": {
            "messages": [
              {
                "from": "919999999999",
                "id": "wamid.HBgL...",
                "text": {
                  "body": "Find cases on section 482 crpc"
                },
                "type": "text"
              }
            ]
          }
        }]
      }]
    }
    
    parsed = parse_incoming_webhook(sample_payload)
    print("Test Webhook Parse:")
    print(parsed)
