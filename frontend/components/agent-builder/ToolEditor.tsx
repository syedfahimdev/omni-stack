import { useState, useEffect, useRef, useMemo } from "react";
import { Trash2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface ToolArgument {
    name: string;
    type: "string" | "integer" | "boolean";
    description: string;
}

interface JsonSchemaProperty {
    type: "string" | "integer" | "boolean";
    description?: string;
}

export interface CustomTool {
    name: string;
    description: string;
    webhook_url: string;
    auth_header_name?: string;
    auth_header_value?: string;
    arguments: Record<string, JsonSchemaProperty>; // JSON Schema properties
}

interface ToolEditorProps {
    tool: CustomTool;
    onChange: (tool: CustomTool) => void;
    onDelete: () => void;
    index: number;
}

export default function ToolEditor({ tool, onChange, onDelete, index }: ToolEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const isInternalUpdate = useRef(false);

    // Convert JSON Schema properties back to list for editing - use useMemo to derive state
    const argsListFromProps = useMemo(() => {
        if (tool.arguments && Object.keys(tool.arguments).length > 0) {
            return Object.entries(tool.arguments).map(([key, value]: [string, JsonSchemaProperty]) => ({
                name: key,
                type: value.type || "string",
                description: value.description || "",
            }));
        }
        return [];
    }, [tool.arguments]);

    // Initialize state from props, use key to reset when tool changes externally
    const [argsList, setArgsList] = useState<ToolArgument[]>(() => argsListFromProps);

    // Sync props to local state only when props change externally (not from internal updates)
    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        // Use setTimeout to avoid synchronous setState in effect
        const timeoutId = setTimeout(() => {
            setArgsList(argsListFromProps);
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [argsListFromProps]);

    const updateTool = (updates: Partial<CustomTool>) => {
        onChange({ ...tool, ...updates });
    };

    const updateArguments = (newArgsList: ToolArgument[]) => {
        // Convert list back to JSON Schema properties
        const properties: Record<string, JsonSchemaProperty> = {};
        newArgsList.forEach((arg) => {
            if (arg.name) {
                properties[arg.name] = {
                    type: arg.type,
                    description: arg.description,
                };
            }
        });

        // We update the parent state directly. 
        // Note: This might cause the useEffect above to re-run if we aren't careful, 
        // but since we are mapping *from* props, it should be stable enough if values match.
        // To avoid cycles, we could separate "internal edit state" from "prop state", 
        // but for now let's trust the parent update.
        isInternalUpdate.current = true;
        updateTool({ arguments: properties });
    };

    const addArgument = () => {
        const newArgs = [...argsList, { name: "", type: "string" as const, description: "" }];
        setArgsList(newArgs); // Update local UI immediately
        updateArguments(newArgs); // Sync to parent
    };

    const removeArgument = (idx: number) => {
        const newArgs = [...argsList];
        newArgs.splice(idx, 1);
        setArgsList(newArgs);
        updateArguments(newArgs);
    };

    const updateArgumentRow = (idx: number, field: keyof ToolArgument, value: string) => {
        const newArgs = [...argsList];
        newArgs[idx] = { ...newArgs[idx], [field]: value };
        setArgsList(newArgs);
        updateArguments(newArgs);
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50">
            <div
                className="flex cursor-pointer items-center justify-between border-b border-zinc-800/50 p-3"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">Tool #{index + 1}</span>
                    <span className="text-sm font-medium text-zinc-200">{tool.name || "Untitled Tool"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="rounded p-1 text-zinc-500 hover:bg-red-900/20 hover:text-red-400"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 p-4">
                    {/* Basic Info */}
                    <div className="grid gap-3">
                        <div>
                            <label className="mb-1 block text-xs text-zinc-500">Name (snake_case)</label>
                            <input
                                type="text"
                                placeholder="e.g. create_ticket"
                                value={tool.name}
                                onChange={(e) => updateTool({ name: e.target.value })}
                                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-zinc-500">Description</label>
                            <input
                                type="text"
                                placeholder="What does this tool do?"
                                value={tool.description}
                                onChange={(e) => updateTool({ description: e.target.value })}
                                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-zinc-500">Webhook URL</label>
                            <input
                                type="text"
                                placeholder="http://n8n:5678/webhook/..."
                                value={tool.webhook_url}
                                onChange={(e) => updateTool({ webhook_url: e.target.value })}
                                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Auth Section */}
                    <div className="rounded border border-zinc-800/50 bg-zinc-900/30 p-3">
                        <h4 className="mb-2 text-xs font-medium text-zinc-400">Authentication (Optional)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs text-zinc-500">Header Name</label>
                                <input
                                    type="text"
                                    placeholder="x-n8n-secret"
                                    value={tool.auth_header_name || ""}
                                    onChange={(e) => updateTool({ auth_header_name: e.target.value })}
                                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-zinc-500">Header Value</label>
                                <input
                                    type="password"
                                    placeholder="secret-value"
                                    value={tool.auth_header_value || ""}
                                    onChange={(e) => updateTool({ auth_header_value: e.target.value })}
                                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Arguments Builder */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium text-zinc-400">Arguments</label>
                            <button
                                onClick={addArgument}
                                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-400 hover:bg-blue-900/20"
                            >
                                <Plus className="h-3 w-3" /> Add Argument
                            </button>
                        </div>

                        <div className="space-y-2">
                            {argsList.length === 0 && (
                                <p className="text-xs italic text-zinc-600">No arguments defined.</p>
                            )}
                            {argsList.map((arg, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <input
                                        type="text"
                                        placeholder="name"
                                        value={arg.name}
                                        onChange={(e) => updateArgumentRow(idx, "name", e.target.value)}
                                        className="w-1/4 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                    />
                                    <select
                                        value={arg.type}
                                        onChange={(e) => updateArgumentRow(idx, "type", e.target.value)}
                                        className="w-1/4 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                    >
                                        <option value="string">String</option>
                                        <option value="integer">Integer</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="description"
                                        value={arg.description}
                                        onChange={(e) => updateArgumentRow(idx, "description", e.target.value)}
                                        className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => removeArgument(idx)}
                                        className="p-1 text-zinc-500 hover:text-red-400"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
