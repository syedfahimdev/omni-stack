import os
from typing import List, Optional
from supabase import create_client, Client
from litellm import completion

class Orchestrator:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set for Orchestrator")
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)

    def route_request(self, user_message: str) -> str:
        if not self.supabase:
            return "general"

        # 1. Fetch all agents
        try:
            response = self.supabase.table("agent_configs").select("name, slug, description, system_prompt").execute()
            agents = response.data
        except Exception as e:
            print(f"Orchestrator DB Error: {e}")
            return "general"
        
        if not agents:
            return "general"

        # 2. Construct prompt
        agent_descriptions = ""
        for agent in agents:
            desc = agent.get("description")
            # Fallback to system prompt snippet if description is empty
            if not desc:
                 desc = (agent.get("system_prompt") or "")[:150].replace("\n", " ") + "..."
            
            agent_descriptions += f"- {agent['name']} (slug: {agent['slug']}): {desc}\n"

        prompt = f"""
You are the Orchestrator. Your job is to route the user's request to the most suitable AI agent based on their description.

Available Agents:
{agent_descriptions}

User Request: "{user_message}"

Instructions:
- Analyze the user's request.
- Select the single best agent slug from the list above.
- If the request is ambiguous or doesn't match a specific agent, return 'general'.
- Return ONLY the slug of the chosen agent. Do not add any explanation or punctuation.
"""

        # 3. Call LLM
        try:
            # Using gpt-4o-mini for speed and cost
            response = completion(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0
            )
            selected_slug = response.choices[0].message.content.strip()
            
            # Clean up response (remove quotes if any)
            selected_slug = selected_slug.replace("'", "").replace('"', "")
            
            # Validate slug exists
            valid_slugs = [a['slug'] for a in agents]
            if selected_slug not in valid_slugs:
                print(f"Orchestrator returned invalid slug '{selected_slug}', defaulting to 'general'")
                return "general"
            
            print(f"✈️ Auto-Pilot routed to: {selected_slug}")
            return selected_slug
            
        except Exception as e:
            print(f"Orchestrator LLM Error: {e}")
            return "general"
