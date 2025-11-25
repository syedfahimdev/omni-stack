import asyncio
from core.config_loader import get_all_agents, supabase

async def test_db():
    print("Fetching agents...")
    agents = get_all_agents()
    print(f"Agents found: {agents}")
    
    print("Inserting Pirate Bot...")
    try:
        data = supabase.table("agent_configs").insert({
            "name": "Pirate Bot",
            "slug": "pirate",
            "system_prompt": "You are a pirate. Always speak like a pirate.",
            "model_provider": "openai",
            "model_name": "gpt-3.5-turbo"
        }).execute()
        print("Insert successful!")
    except Exception as e:
        print(f"Insert failed: {e}")

    print("Fetching agents again...")
    agents = get_all_agents()
    print(f"Agents found: {agents}")

if __name__ == "__main__":
    asyncio.run(test_db())
