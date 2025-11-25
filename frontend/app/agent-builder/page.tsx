"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Plus, Save, Bot, Settings, Trash2 } from "lucide-react";

import ToolEditor, { CustomTool } from "@/components/agent-builder/ToolEditor";

interface AgentConfig {
    id?: string;
    name: string;
    slug: string;
    system_prompt: string;
    model_provider: string;
    model_name: string;
    temperature: number;
    is_active: boolean;
    tools?: string[];
    custom_tools?: CustomTool[];
}

const DEFAULT_AGENT: AgentConfig = {
    name: "",
    slug: "",
    system_prompt: "You are a helpful AI assistant.",
    model_provider: "openai",
    model_name: "gpt-4o",
    temperature: 0.7,
    is_active: true,
    tools: [],
    custom_tools: [],
};

export default function AgentBuilder() {
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig>(DEFAULT_AGENT);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAgents = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("agent_configs")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching agents:", error);
        } else {
            setAgents(data || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const handleSave = async () => {
        setIsSaving(true);

        // Auto-generate slug if empty
        const agentToSave = { ...selectedAgent };
        if (!agentToSave.slug) {
            agentToSave.slug = agentToSave.name.toLowerCase().replace(/\s+/g, "-");
        }

        const { data, error } = await supabase
            .from("agent_configs")
            .upsert(agentToSave)
            .select()
            .single();

        if (error) {
            alert(`Error saving agent: ${error.message}`);
        } else {
            // Update local state
            if (selectedAgent.id) {
                setAgents(agents.map((a) => (a.id === data.id ? data : a)));
            } else {
                setAgents([...agents, data]);
            }
            setSelectedAgent(data);
            alert("Agent saved successfully!");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;

        const { error } = await supabase.from("agent_configs").delete().eq("id", id);

        if (error) {
            alert(`Error deleting agent: ${error.message}`);
        } else {
            setAgents(agents.filter((a) => a.id !== id));
            if (selectedAgent.id === id) {
                setSelectedAgent(DEFAULT_AGENT);
            }
        }
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100">
            {/* Sidebar */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-100">Agents</h2>
                    <button
                        onClick={() => setSelectedAgent(DEFAULT_AGENT)}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        <p className="text-sm text-zinc-500">Loading...</p>
                    ) : (
                        agents.map((agent) => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${selectedAgent.id === agent.id
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4" />
                                    <span className="truncate">{agent.name}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            {selectedAgent.id ? "Edit Agent" : "Create New Agent"}
                        </h1>
                        {selectedAgent.id && (
                            <button
                                onClick={() => handleDelete(selectedAgent.id!)}
                                className="rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30"
                            >
                                <Trash2 className="mr-2 inline h-4 w-4" />
                                Delete
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Name</label>
                                <input
                                    type="text"
                                    value={selectedAgent.name}
                                    onChange={(e) =>
                                        setSelectedAgent({ ...selectedAgent, name: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 focus:border-blue-600 focus:outline-none"
                                    placeholder="e.g. Pirate Bot"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Slug</label>
                                <input
                                    type="text"
                                    value={selectedAgent.slug}
                                    onChange={(e) =>
                                        setSelectedAgent({ ...selectedAgent, slug: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 focus:border-blue-600 focus:outline-none"
                                    placeholder="e.g. pirate-bot"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Provider</label>
                                <select
                                    value={selectedAgent.model_provider}
                                    onChange={(e) =>
                                        setSelectedAgent({
                                            ...selectedAgent,
                                            model_provider: e.target.value,
                                            model_name: "", // Reset model when provider changes
                                        })
                                    }
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 focus:border-blue-600 focus:outline-none"
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="ollama">Ollama</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Model Name</label>
                                <select
                                    value={selectedAgent.model_name}
                                    onChange={(e) =>
                                        setSelectedAgent({
                                            ...selectedAgent,
                                            model_name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 focus:border-blue-600 focus:outline-none"
                                >
                                    <option value="" disabled>Select a model</option>
                                    {selectedAgent.model_provider === "openai" && (
                                        <>
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </>
                                    )}
                                    {selectedAgent.model_provider === "anthropic" && (
                                        <>
                                            <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                                            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                                        </>
                                    )}
                                    {selectedAgent.model_provider === "ollama" && (
                                        <>
                                            <option value="llama3">Llama 3</option>
                                            <option value="mistral">Mistral</option>
                                            <option value="gemma">Gemma</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">
                                System Prompt
                            </label>
                            <textarea
                                value={selectedAgent.system_prompt}
                                onChange={(e) =>
                                    setSelectedAgent({
                                        ...selectedAgent,
                                        system_prompt: e.target.value,
                                    })
                                }
                                rows={10}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 focus:border-blue-600 focus:outline-none"
                                placeholder="You are a helpful assistant..."
                            />
                        </div>

                        {/* Toolbox Section */}
                        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-blue-400" />
                                <h3 className="font-medium text-zinc-200">Toolbox</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedAgent.tools?.includes("web_search") || false}
                                        onChange={(e) => {
                                            const tools = selectedAgent.tools || [];
                                            if (e.target.checked) {
                                                setSelectedAgent({ ...selectedAgent, tools: [...tools, "web_search"] });
                                            } else {
                                                setSelectedAgent({
                                                    ...selectedAgent,
                                                    tools: tools.filter((t) => t !== "web_search"),
                                                });
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-600"
                                    />
                                    <span className="text-sm text-zinc-300">Web Search (SearXNG)</span>
                                </label>

                                <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedAgent.tools?.includes("web_scraper") || false}
                                        onChange={(e) => {
                                            const tools = selectedAgent.tools || [];
                                            if (e.target.checked) {
                                                setSelectedAgent({ ...selectedAgent, tools: [...tools, "web_scraper"] });
                                            } else {
                                                setSelectedAgent({
                                                    ...selectedAgent,
                                                    tools: tools.filter((t) => t !== "web_scraper"),
                                                });
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-600"
                                    />
                                    <span className="text-sm text-zinc-300">Web Scraper (Smart Scrape)</span>
                                </label>
                            </div>

                            {/* Custom Tools Section */}
                            <div className="mt-4 border-t border-zinc-800 pt-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-zinc-300">Custom Tools (n8n Webhooks)</h4>
                                    <button
                                        onClick={() => {
                                            const currentCustomTools = selectedAgent.custom_tools || [];
                                            setSelectedAgent({
                                                ...selectedAgent,
                                                custom_tools: [
                                                    ...currentCustomTools,
                                                    {
                                                        name: "",
                                                        description: "",
                                                        webhook_url: "",
                                                        arguments: {},
                                                        auth_header_name: "x-n8n-secret",
                                                        auth_header_value: ""
                                                    },
                                                ],
                                            });
                                        }}
                                        className="rounded bg-zinc-800 px-2 py-1 text-xs text-blue-400 hover:bg-zinc-700"
                                    >
                                        + Add Tool
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {selectedAgent.custom_tools?.map((tool, index) => (
                                        <ToolEditor
                                            key={index}
                                            index={index}
                                            tool={tool}
                                            onChange={(updatedTool) => {
                                                const newTools = [...(selectedAgent.custom_tools || [])];
                                                newTools[index] = updatedTool;
                                                setSelectedAgent({ ...selectedAgent, custom_tools: newTools });
                                            }}
                                            onDelete={() => {
                                                const newTools = [...(selectedAgent.custom_tools || [])];
                                                newTools.splice(index, 1);
                                                setSelectedAgent({ ...selectedAgent, custom_tools: newTools });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Agent"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
