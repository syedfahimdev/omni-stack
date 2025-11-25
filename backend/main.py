from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import litellm
import os
from dotenv import load_dotenv
from core.config_loader import get_agent_config, get_all_agents

# Load environment variables
load_dotenv()

app = FastAPI(title="Omni-Stack 5.0 Backend API")

# CORS configuration for Caddy setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://app.localhost",
        "https://app.localhost",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set OpenAI API key for LiteLLM
litellm.api_key = os.getenv("OPENAI_API_KEY")

# Request/Response models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = None # Optional now, as agent config overrides it
    agent_slug: str = "general" # Default to general agent

class ChatResponse(BaseModel):
    response: str

class HealthResponse(BaseModel):
    status: str

class Agent(BaseModel):
    id: str
    name: str
    slug: str

# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/api/agents", response_model=List[Agent])
async def get_agents():
    """Fetch all available agents"""
    agents = get_all_agents()
    return agents

from langchain_community.chat_models import ChatLiteLLM
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage
from core.tool_factory import get_agent_tools, get_custom_tools
from core.orchestrator import Orchestrator
import json

# Initialize Orchestrator
orchestrator = Orchestrator()

# ... (imports remain the same)

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint using LangChain + LiteLLM for unified LLM access with Tooling.
    """
    try:
        print(f"DEBUG: Incoming request agent_slug: {request.agent_slug}")
        # Handle Auto-Pilot
        if request.agent_slug == "auto" or not request.agent_slug:
            # Get the last user message
            last_user_message = next((m.content for m in reversed(request.messages) if m.role == "user"), "")
            print(f"DEBUG: Last user message: '{last_user_message}'")
            
            if last_user_message:
                selected_slug = orchestrator.route_request(last_user_message)
                print(f"🤖 Auto-Pilot routed request to: {selected_slug}")
                request.agent_slug = selected_slug
            else:
                print("DEBUG: No user message found, defaulting to general")
                request.agent_slug = "general"
        
        print(f"DEBUG: Final agent_slug: {request.agent_slug}")

        # Get agent configuration
        agent_config = get_agent_config(request.agent_slug)
        
        if not agent_config:
            raise HTTPException(status_code=404, detail=f"Agent '{request.agent_slug}' not found")

        # 1. Setup Tools
        # Standard tools
        tools_list = agent_config.get("tools", [])
        standard_tools = get_agent_tools(tools_list)
        
        # Custom tools
        custom_tools_config = agent_config.get("custom_tools", [])
        custom_tools = get_custom_tools(custom_tools_config)
        
        # Combine all tools
        tools = standard_tools + custom_tools
        
        print(f"DEBUG: Agent Config: {agent_config}")
        print(f"DEBUG: Standard Tools: {[t.name for t in standard_tools]}")
        print(f"DEBUG: Custom Tools: {[t.name for t in custom_tools]}")
        
        # 2. Setup LLM
        model_name = request.model or agent_config.get("model_name", "gpt-3.5-turbo")
        temperature = agent_config.get("temperature", 0.7)
        
        llm = ChatLiteLLM(
            model=model_name,
            temperature=temperature,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Bind tools if available
        if tools:
            llm_with_tools = llm.bind_tools(tools)
        else:
            llm_with_tools = llm

        # 3. Prepare Messages
        system_prompt = agent_config.get("system_prompt", "You are a helpful AI assistant.")
        messages = [SystemMessage(content=system_prompt)]
        
        # Convert request messages to LangChain format
        for msg in request.messages:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))
        
        # 4. ReAct Loop (Execute Tools)
        # First call to LLM
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        # Loop while the LLM wants to call tools
        while response.tool_calls:
            for tool_call in response.tool_calls:
                # Find the matching tool function
                selected_tool = next((t for t in tools if t.name == tool_call["name"]), None)
                
                if selected_tool:
                    print(f"Executing tool: {tool_call['name']} with args: {tool_call['args']}")
                    # Execute tool
                    tool_result = selected_tool.invoke(tool_call["args"])
                    
                    # Append result to messages
                    messages.append(ToolMessage(
                        tool_call_id=tool_call["id"],
                        name=tool_call["name"],
                        content=str(tool_result)
                    ))
                else:
                    # Handle missing tool
                    messages.append(ToolMessage(
                        tool_call_id=tool_call["id"],
                        name=tool_call["name"],
                        content=f"Error: Tool {tool_call['name']} not found."
                    ))
            
            # Call LLM again with tool outputs
            response = llm_with_tools.invoke(messages)
            messages.append(response)

        return {"response": response.content}
        
    except Exception as e:
        # Handle errors
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/token")
async def get_voice_token(agent_slug: str = "general"):
    """
    Generate a LiveKit access token for voice communication.
    """
    try:
        from livekit import api
        
        # Get LiveKit credentials from environment
        livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
        api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
        api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")
        
        # Create access token
        token = api.AccessToken(api_key, api_secret)
        token.with_identity(f"user-{agent_slug}")
        token.with_name("User")
        token.with_grants(
            api.VideoGrants(
                room_join=True,
                room=f"chat-{agent_slug}",
            )
        )
        
        # Add agent slug as metadata for the voice worker
        token.with_metadata(f'{{"agent_slug": "{agent_slug}"}}')
        
        jwt_token = token.to_jwt()
        
        return {
            "token": jwt_token,
            "serverUrl": livekit_url
        }
        
    except Exception as e:
        print(f"Error generating voice token: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
