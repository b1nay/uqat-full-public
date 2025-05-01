"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ChatMessage = {
  id: number;
  text: string;
  sender: string;
  details: {
    answer?: string;
    confidence?: number;
    source?: string;
    justification?: string;
    topChunk?: string;
    [key: string]: any;
  } | null;
  expanded: boolean;
  isLoading: boolean;
  isError: boolean;
};

type Chat = {
  id: number;
  user_id: number;
  title: string;
  chat_data: ChatMessage[];
};

export default function ChatPage() {
  const params = useParams();
  const id = Number(params.id);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch("http://localhost:8000/chat-history");
        const data: Chat[] = await response.json();
        const chatMatch = data.find((item) => item.id === id);
        if (chatMatch) {
          setChat(chatMatch);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error || !chat)
    return <p className="p-4 text-red-600">Chat not found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{chat.title}</h1>
      <div className="space-y-4">
        {chat.chat_data.map((msg) => (
          <div
            key={msg.id}
            className="border p-4 rounded-md shadow-sm bg-white"
          >
            <p className="font-semibold text-blue-700">{msg.sender}:</p>
            <p className="mb-2">{msg.text}</p>

            {msg.isError && <p className="text-red-600">Error occurred.</p>}
            {msg.isLoading && <p className="text-blue-500">Thinking...</p>}

            {msg.details && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 space-y-1">
                {msg.details.answer && (
                  <p>
                    <strong>Answer:</strong> {msg.details.answer}
                  </p>
                )}
                {msg.details.confidence !== undefined && (
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {(msg.details.confidence * 100).toFixed(2)}%
                  </p>
                )}
                {msg.details.source && (
                  <p>
                    <strong>Source:</strong> {msg.details.source}
                  </p>
                )}
                {msg.details.justification && (
                  <p>
                    <strong>Justification:</strong> {msg.details.justification}
                  </p>
                )}
                {msg.details.topChunk && (
                  <p>
                    <strong>Top Chunk:</strong> {msg.details.topChunk}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
