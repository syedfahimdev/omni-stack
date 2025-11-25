import requests
from langchain_core.tools import tool
import os

@tool
def trigger_n8n(webhook_path: str, payload: dict) -> str:
    """
    Trigger an n8n automation workflow via webhook.
    
    Args:
        webhook_path (str): The path of the webhook (e.g., "my-workflow").
                            Do NOT include the full URL, just the path.
        payload (dict): The JSON payload to send to the workflow.
    """
    # Internal Docker DNS for n8n
    n8n_host = "http://n8n:5678"
    url = f"{n8n_host}/webhook/{webhook_path}"
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return f"Successfully triggered n8n workflow '{webhook_path}'. Response: {response.text}"
    except requests.exceptions.RequestException as e:
        return f"Failed to trigger n8n workflow: {str(e)}"
