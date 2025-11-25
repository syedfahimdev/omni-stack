#!/usr/bin/env python3
"""
LiveKit Voice Agent Worker (v1.0+ with Agent/AgentSession)
Handles real-time voice conversations with AI agents.
"""

import asyncio
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.llm import ChatContext, ChatMessage

# --- LiveKit v1.0+ IMPORTS ---
from livekit.agents import Agent, AgentSession
from livekit.plugins import openai, deepgram, silero

# Import your config loader to fetch the system prompt
from core.config_loader import get_agent_config

load_dotenv()


async def entrypoint(ctx: JobContext):
    """Main entrypoint for voice agent using Agent + AgentSession pattern"""
    
    # 1. Connect to the Room
    print(f"🔌 Connecting to room {ctx.room.name}...")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # 2. Wait for the user to join
    participant = await ctx.wait_for_participant()
    print(f"👤 User {participant.identity} joined.")
    
    # 3. Determine Agent Personality (from Room Name or attributes)
    # Extract agent slug from room name (format: chat-{agent_slug})
    room_name = ctx.room.name
    agent_slug = room_name.replace("chat-", "") if room_name.startswith("chat-") else "general"
    
    # Fallback: Check participant attributes
    if not agent_slug or agent_slug == ctx.room.name:
        agent_slug = participant.attributes.get("agent_slug", "general")
    
    # 4. Fetch System Prompt from Supabase
    try:
        config = get_agent_config(agent_slug)
        system_prompt = config.get("system_prompt", "You are a helpful assistant.")
        agent_name = config.get("name", "AI Assistant")
        print(f"✅ Loaded config for: {agent_name}")
    except Exception as e:
        print(f"⚠️  Could not load config for {agent_slug}, using default. Error: {e}")
        system_prompt = "You are a helpful assistant."
        agent_name = "AI Assistant"
    
    print(f"🎤 Starting Voice Agent: {agent_slug}")
    
    # 5. Initialize the Agent Logic (The "Brain")
    # This holds the instructions and conversation state
    agent_logic = Agent(
        instructions=system_prompt,
        # tools=[...]  # You can inject tools here later
    )
    
    # 6. Initialize the Session (The "Body")
    # This manages the STT -> LLM -> TTS pipeline
    session = AgentSession(
        vad=silero.VAD.load(),              # Voice Activity Detection
        stt=deepgram.STT(),                 # Deepgram for Speech-to-Text (fastest!)
        llm=openai.LLM(model="gpt-3.5-turbo"),  # OpenAI for Language Model
        tts=openai.TTS(voice="alloy"),      # OpenAI for Text-to-Speech
    )
    
    # 7. Event Listeners (Optional Debugging)
    @session.on("user_speech_committed")
    def on_user_speech(msg):
        print(f"👤 User: {msg.content}")
    
    @session.on("agent_speech_committed")
    def on_agent_speech(msg):
        print(f"🤖 Agent: {msg.content}")
    
    # 8. Start the Agent
    # This wires the Brain (agent_logic) to the Body (session) and the Room
    print(f"🚀 Starting session for {agent_name}...")
    await session.start(agent=agent_logic, room=ctx.room)
    
    # 9. Say Hello
    await session.generate_reply(instructions="Say a brief, friendly greeting.")
    print(f"✨ Voice session is live!")


if __name__ == "__main__":
    # Set LIVEKIT_URL for internal Docker networking
    os.environ["LIVEKIT_URL"] = "ws://livekit:7880"
    
    # Run the worker
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
