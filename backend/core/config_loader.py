import os
from supabase import create_client, Client
from functools import lru_cache
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL", "http://localhost:8000") # Default to local Kong if not set
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# In a real production setup, you might want to handle connection errors gracefully
try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Warning: Failed to initialize Supabase client: {e}")
    supabase = None

def get_all_agents() -> List[Dict]:
    """
    Fetch all active agents for the UI dropdown.
    Returns a list of dicts with id, name, slug.
    """
    if not supabase:
        return []
    
    try:
        response = supabase.table("agent_configs")\
            .select("id, name, slug")\
            .eq("is_active", True)\
            .execute()
        return response.data
    except Exception as e:
        print(f"Error fetching agents: {e}")
        return []

@lru_cache(maxsize=100)
def get_agent_config(slug: str) -> Optional[Dict]:
    """
    Fetch a specific agent's configuration by slug.
    Cached to avoid hitting DB on every chat message.
    """
    if not supabase:
        # Fallback for when DB is not ready or for 'general' if not found
        if slug == "general":
            return {
                "name": "General Assistant",
                "system_prompt": "You are a helpful AI assistant.",
                "model_provider": "openai",
                "model_name": "gpt-3.5-turbo"
            }
        return None

    try:
        response = supabase.table("agent_configs")\
            .select("*")\
            .eq("slug", slug)\
            .single()\
            .execute()
        agent_config = response.data
        
        # Check for Vault secret
        if agent_config.get("model_api_key_id"):
            try:
                secret_response = supabase.rpc(
                    "get_decrypted_secret", 
                    {"secret_id": agent_config["model_api_key_id"]}
                ).execute()
                if secret_response.data:
                    # Inject into config (in memory only)
                    agent_config["model_api_key"] = secret_response.data
            except Exception as e:
                print(f"Error fetching vault secret for {slug}: {e}")
                
        return agent_config
    except Exception as e:
        print(f"Error fetching agent config for {slug}: {e}")
        # Fallback for general if DB fails
        if slug == "general":
            return {
                "name": "General Assistant",
                "system_prompt": "You are a helpful AI assistant.",
                "model_provider": "openai",
                "model_name": "gpt-3.5-turbo"
            }
        return None

def clear_agent_cache(slug: str):
    """
    Clear the cache for a specific agent (call this when updating config).
    Note: lru_cache doesn't support clearing specific keys easily, 
    so we might need a different caching strategy if updates are frequent.
    For now, we can just clear the whole cache or rely on TTL if we implemented it.
    """
    get_agent_config.cache_clear()
