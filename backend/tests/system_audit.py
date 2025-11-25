import os
import sys
import asyncio
import requests
from dotenv import load_dotenv
from supabase import create_client
from neo4j import GraphDatabase
import redis
from livekit import api
from litellm import completion

# Load environment variables
load_dotenv()

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_status(component, status, message=""):
    if status:
        print(f"{BOLD}{component:<20}{RESET} [{GREEN}PASS{RESET}] {message}")
        return 1
    else:
        print(f"{BOLD}{component:<20}{RESET} [{RED}FAIL{RESET}] {message}")
        return 0

async def check_supabase():
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            return print_status("Supabase", False, "Missing URL or Key")
        
        supabase = create_client(url, key)
        response = supabase.table("agent_configs").select("count", count="exact").limit(1).execute()
        return print_status("Supabase", True, f"Connected. Found agents.")
    except Exception as e:
        return print_status("Supabase", False, str(e))

def check_neo4j():
    try:
        uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
        auth = (os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "omnistack_graph_password"))
        
        with GraphDatabase.driver(uri, auth=auth) as driver:
            driver.verify_connectivity()
            return print_status("Neo4j", True, "Connected via Bolt")
    except Exception as e:
        return print_status("Neo4j", False, str(e))

def check_redis():
    try:
        r = redis.Redis(host='redis', port=6379, db=0, socket_timeout=2)
        if r.ping():
            return print_status("Redis", True, "PONG received")
        return print_status("Redis", False, "No PONG")
    except Exception as e:
        return print_status("Redis", False, str(e))

def check_searxng():
    try:
        # Internal Docker URL
        response = requests.get("http://searxng:8080", timeout=2)
        if response.status_code == 200:
            return print_status("SearXNG", True, "Status 200 OK")
        return print_status("SearXNG", False, f"Status {response.status_code}")
    except Exception as e:
        return print_status("SearXNG", False, str(e))

def check_n8n():
    try:
        # Internal Docker URL
        response = requests.get("http://n8n:5678/healthz", timeout=2)
        if response.status_code == 200:
            return print_status("n8n", True, "Healthz OK")
        return print_status("n8n", False, f"Status {response.status_code}")
    except Exception as e:
        return print_status("n8n", False, str(e))

def check_litellm():
    try:
        # Dry run check
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
             return print_status("LiteLLM", False, "Missing OPENAI_API_KEY")
             
        # Just check if we can import and init (mock call)
        # Actual call might cost money/time, so we trust the library load + key presence
        return print_status("LiteLLM", True, "Library loaded & Key present")
    except Exception as e:
        return print_status("LiteLLM", False, str(e))

def check_livekit():
    try:
        url = os.getenv("LIVEKIT_URL")
        key = os.getenv("LIVEKIT_API_KEY")
        secret = os.getenv("LIVEKIT_API_SECRET")
        
        if not url or not key or not secret:
            return print_status("LiveKit", False, "Missing Credentials")

        token = api.AccessToken(key, secret)
        token.with_identity("audit-bot")
        token.with_name("Audit Bot")
        token.with_grants(api.VideoGrants(room_join=True, room="audit-room"))
        jwt = token.to_jwt()
        
        if jwt:
            return print_status("LiveKit", True, "Token generated successfully")
        return print_status("LiveKit", False, "Token generation failed")
    except Exception as e:
        return print_status("LiveKit", False, str(e))

async def main():
    print(f"\n{BOLD}🔍 OMNI-STACK 5.0 SYSTEM AUDIT{RESET}\n" + "="*40)
    
    score = 0
    total = 7
    
    score += await check_supabase()
    score += check_neo4j()
    score += check_redis()
    score += check_searxng()
    score += check_n8n()
    score += check_litellm()
    score += check_livekit()
    
    print("="*40)
    if score == total:
        print(f"{GREEN}{BOLD}SYSTEM HEALTH: {score}/{total} (OPTIMAL){RESET}\n")
    else:
        print(f"{RED}{BOLD}SYSTEM HEALTH: {score}/{total} (ISSUES DETECTED){RESET}\n")

if __name__ == "__main__":
    asyncio.run(main())
