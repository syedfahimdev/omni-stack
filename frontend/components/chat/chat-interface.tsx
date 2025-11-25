"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ChevronDown, Phone, Brain } from "lucide-react";
import VoiceMode from "./voice-mode";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Agent {
    id: string;
    name: string;
    slug: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentSlug, setSelectedAgentSlug] = useState<string>("general");
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isAutoPilot, setIsAutoPilot] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            // Use Caddy routed HTTPS URL
            const response = await fetch("https://api.localhost/api/agents");
            if (response.ok) {
                const data = await response.json();
                setAgents(data);
                if (data.length > 0) {
                    // Default to general if exists, else first one
                    const general = data.find((a: Agent) => a.slug === "general");
                    setSelectedAgentSlug(general ? "general" : data[0].slug);
                }
            }
        } catch (error) {
            console.error("Failed to fetch agents:", error);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: inputValue,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Use Caddy routed HTTPS URL
            const response = await fetch("https://api.localhost/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    agent_slug: isAutoPilot ? "auto" : selectedAgentSlug,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to get response");
            }

            const data = await response.json();
            const assistantMessage: Message = {
                role: "assistant",
                content: data.response,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: `Error: ${error instanceof Error ? error.message : "Failed to get response. Please check your API key."}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800/50 bg-slate-950/50 p-4 backdrop-blur-xl">
                <div className="mb-6">
                    <h2 className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-2xl font-bold text-transparent">
                        Omni-Stack
                    </h2>
                    <p className="text-sm text-slate-500">AI Chat</p>
                </div>

                <div className="mb-6 space-y-4">
                    {/* Auto-Pilot Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-300 uppercase">Auto-Pilot</span>
                            <span className="text-[10px] text-slate-500">Smart Routing</span>
                        </div>
                        <button
                            onClick={() => setIsAutoPilot(!isAutoPilot)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isAutoPilot ? 'bg-blue-600' : 'bg-slate-700'
                                }`}
                        >
                            <span
                                className={`${isAutoPilot ? 'translate-x-5' : 'translate-x-1'
                                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>

                    {isAutoPilot ? (
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Brain className="h-4 w-4" />
                                <span className="text-sm font-medium">Orchestrator Active</span>
                            </div>
                            <p className="mt-1 text-xs text-blue-300/70 leading-relaxed">
                                Requests will be automatically routed to the best agent based on your query.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase">Select Agent</label>
                            <div className="relative">
                                <select
                                    value={selectedAgentSlug}
                                    onChange={(e) => {
                                        setSelectedAgentSlug(e.target.value);
                                        setMessages([]); // Clear chat on agent switch
                                    }}
                                    className="w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 outline-none transition-all hover:border-slate-700 focus:border-blue-600/50"
                                >
                                    {agents.map((agent) => (
                                        <option key={agent.id} value={agent.slug}>
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <button
                        onClick={() => setMessages([])}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800/50"
                    >
                        New Chat
                    </button>
                    <button
                        onClick={() => setIsVoiceMode(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-800 bg-blue-900/30 px-4 py-2 text-sm text-blue-300 transition-all hover:border-blue-700 hover:bg-blue-800/50"
                    >
                        <Phone className="h-4 w-4" />
                        Voice Mode
                    </button>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/50">
                    <a href="/agent-builder" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                        <Bot className="h-4 w-4" />
                        <span>Agent Builder</span>
                    </a>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {message.role === "assistant" && (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-700/50">
                                            <Bot className="h-5 w-5 text-slate-300" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                            : "bg-slate-800/80 text-slate-100 ring-1 ring-slate-700/50"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>

                                    {message.role === "user" && (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-500/50">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-700/50">
                                    <Bot className="h-5 w-5 text-slate-300" />
                                </div>
                                <div className="flex items-center gap-1 rounded-2xl bg-slate-800/80 px-4 py-3 ring-1 ring-slate-700/50">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-800/50 bg-slate-950/50 p-4 backdrop-blur-xl">
                    <div className="mx-auto max-w-3xl">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-0 transition-all focus:border-blue-600/50 focus:bg-slate-900 disabled:opacity-50"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white transition-all hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voice Mode Overlay */}
            {isVoiceMode && (
                <VoiceMode
                    agentSlug={selectedAgentSlug}
                    onDisconnect={() => setIsVoiceMode(false)}
                />
            )}
        </div>
    );
}
