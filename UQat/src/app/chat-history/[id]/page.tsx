"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { FaFolderOpen, FaFileDownload } from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";

// API base URL
const API_BASE_URL = "http://localhost:8000";

type Message = {
  id?: number;
  text: string;
  sender: "user" | "bot" | "assistant";
  details?: {
    answer?: string;
    confidence?: number;
    source?: string;
    justification?: string;
    topChunk?: string;
  };
  expanded?: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

type ChatHistory = {
  id: number;
  user_id: number;
  title: string;
  chat_data: Message[];
};

const ChatHistoryPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!chatId) {
        setError("No chat ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/chat-history`);

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`);
        }

        const allChats: ChatHistory[] = await response.json();

        // Find the specific chat with the matching ID
        const selectedChat = allChats.find(
          (chat) => chat.id === parseInt(chatId)
        );

        if (!selectedChat) {
          throw new Error(`Chat with ID ${chatId} not found`);
        }

        setMessages(selectedChat.chat_data);
        setTitle(selectedChat.title);
      } catch (err: any) {
        console.error("Error fetching chat history:", err);
        setError(err.message || "Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleExpand = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, expanded: !msg.expanded } : msg
      )
    );
  };

  const downloadChatAsJSON = () => {
    const chatData = {
      id: parseInt(chatId ?? "0"),
      user_id: 1, // Using default user_id since we don't have that info
      title: title,
      chat_data: messages,
    };
    const jsonContent = JSON.stringify(chatData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "chat-history"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goBack = () => {
    router.push("/");
  };

  return (
    <div className="max-w-7xl mt-6 gap-6 mx-auto flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image
            src="/askyeti.svg"
            alt="logo"
            width={100}
            height={100}
            className=""
          />
          <h1 className="text-2xl font-bold">{title || "Chat History"}</h1>
        </div>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back to Chat
        </button>
      </div>

      <div className="w-full h-[calc(100vh-250px)] flex flex-col justify-end rounded-lg border border-gray-200 shadow-sm">
        <div className="h-full flex flex-col space-y-4 p-6 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-main border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">
                Loading chat history...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
              No messages found in this chat history
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] shadow-sm ${
                    message.sender === "user"
                      ? "bg-main text-white"
                      : message.isError
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>

                  {(message.sender === "bot" ||
                    message.sender === "assistant") &&
                    message.details &&
                    Object.keys(message.details).length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleExpand(index)}
                          className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {message.expanded ? (
                            <FiChevronDown className="mr-1" />
                          ) : (
                            <FiChevronRight className="mr-1" />
                          )}
                          {message.expanded
                            ? "Hide details"
                            : "Show RAG details"}
                        </button>

                        {message.expanded &&
                          message.details.confidence !== undefined && (
                            <div className="mt-3 text-sm text-gray-600 border-t pt-2 border-gray-200">
                              <div className="flex items-center mb-1">
                                <span className="font-medium mr-2">
                                  Confidence:
                                </span>
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-600 rounded-full"
                                      style={{
                                        width: `${
                                          message.details.confidence * 100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                  <span className="ml-2">
                                    {Math.round(
                                      message.details.confidence * 100
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                              {message.details.source && (
                                <div className="mb-1">
                                  <span className="font-medium">Source:</span>{" "}
                                  <span className="text-blue-600">
                                    {message.details.source}
                                  </span>
                                </div>
                              )}
                              {message.details.answer && (
                                <div className="mb-2">
                                  <span className="font-medium">
                                    Knowledge Base Answer:
                                  </span>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {message.details.answer}
                                  </div>
                                </div>
                              )}
                              {message.details.justification && (
                                <div className="mb-1">
                                  <span className="font-medium">
                                    Justification:
                                  </span>
                                  <div className="mt-1 text-xs text-gray-600">
                                    {message.details.justification}
                                  </div>
                                </div>
                              )}
                              {message.details.topChunk && (
                                <div className="mb-1">
                                  <span className="font-medium">
                                    Top Retrieved Chunk:
                                  </span>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs max-h-28 overflow-y-auto">
                                    {message.details.topChunk}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex w-full justify-end items-center text-sm pb-4">
        <button
          onClick={downloadChatAsJSON}
          className="inline-flex items-center gap-2 bg-transparent text-main cursor-pointer px-4 py-2 text-sm transition-all ease-in-out duration-300"
          disabled={loading || messages.length === 0}
        >
          <FaFileDownload />
          Download Chat as JSON
        </button>
      </div>
    </div>
  );
};

export default ChatHistoryPage;
