"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, BarVisualizer, useVoiceAssistant } from "@livekit/components-react";
import { Phone, PhoneOff } from "lucide-react";

interface VoiceModeProps {
    agentSlug: string;
    onDisconnect: () => void;
}

function VoiceAssistantUI() {
    const { state, audioTrack } = useVoiceAssistant();

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            {/* Status */}
            <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${state === "listening" ? "bg-green-500 animate-pulse" :
                        state === "thinking" ? "bg-yellow-500 animate-pulse" :
                            state === "speaking" ? "bg-blue-500 animate-pulse" :
                                "bg-zinc-600"
                        }`} />
                    <span className="ml-2 text-sm text-zinc-400 capitalize">{state || "connecting"}</span>
                </div>
            </div>

            {/* Visualizer */}
            {audioTrack && (
                <div className="w-full max-w-md">
                    <BarVisualizer
                        state={state}
                        barCount={30}
                        trackRef={audioTrack}
                        className="h-32"
                    />
                </div>
            )}

            {/* Instructions */}
            <div className="text-center text-sm text-zinc-500">
                <p>Speak naturally. The AI will respond to your voice.</p>
            </div>
        </div>
    );
}

export default function VoiceMode({ agentSlug, onDisconnect }: VoiceModeProps) {
    const [token, setToken] = useState<string>("");
    const [serverUrl, setServerUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.localhost'}/api/voice/token?agent_slug=${agentSlug}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch voice token");
                }

                const data = await response.json();
                setToken(data.token);
                setServerUrl(data.serverUrl);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching voice token:", err);
                setError(err instanceof Error ? err.message : "Failed to connect");
                setIsLoading(false);
            }
        };

        fetchToken();
    }, [agentSlug]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-zinc-400">Connecting to voice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
                <div className="rounded-lg bg-zinc-900 p-8 text-center">
                    <p className="mb-4 text-red-400">{error}</p>
                    <button
                        onClick={onDisconnect}
                        className="rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-white">Voice Mode</h2>
                </div>
                <button
                    onClick={onDisconnect}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    <PhoneOff className="h-4 w-4" />
                    Disconnect
                </button>
            </div>

            {/* Voice Room */}
            <div className="flex flex-1 items-center justify-center p-8">
                <LiveKitRoom
                    token={token}
                    serverUrl={serverUrl}
                    connect={true}
                    audio={true}
                    video={false}
                    className="w-full max-w-2xl"
                >
                    <VoiceAssistantUI />
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </div>
        </div>
    );
}
