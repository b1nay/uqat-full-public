"use client";
import { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import ChatHistoryModal from "../test/ChatHistoryModal";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FaMagic } from "react-icons/fa";
import Image from "next/image";
import { FaFolderOpen, FaFileDownload } from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";

type Message = {
  id?: number;
  text: string;
  sender: "user" | "bot";
  details?: {
    answer: string;
    confidence: number;
    source: string;
    justification: string;
    topChunk: string;
  };
  expanded?: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

interface TitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  defaultTitle?: string;
}

const TitleModal = ({
  isOpen,
  onClose,
  onSave,
  defaultTitle = "",
}: TitleModalProps) => {
  const [title, setTitle] = useState(defaultTitle);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Save Conversation</h2>
        <div className="mb-4">
          <label
            htmlFor="chat-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Enter a title for this conversation:
          </label>
          <input
            type="text"
            id="chat-title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter conversation title"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title)}
            className="px-4 py-2 bg-main text-white rounded-md hover:bg-main/80"
            disabled={!title.trim()}
          >
            Save Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

// API base URL - can be easily changed for different environments
const API_BASE_URL = "http://localhost:8000";

const ChatPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useLLM, setUseLLM] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ##JSONIFY

  const downloadChatAsJSON = () => {
    const jsonContent = JSON.stringify(messages, null, 2); // Pretty print with 2-space indentation
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-conversation.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to open the modal when Save Chat is clicked
  const handleOpenSaveModal = () => {
    setIsModalOpen(true);
  };

  // // Updated function to save chat with the provided title and all bot details
  // const saveChatToDatabase = async (chatTitle) => {
  const saveChatToDatabase = async (chatTitle: string): Promise<void> => {
    try {
      setIsSaving(true);
      // Hardcoded userId and local_kw
      const userId = 1; // Hardcoded for now
      const local_kw = "test"; // Hardcoded as per the curl example

      // Prepare the chat data with the title from modal
      const chatHistory = {
        title: chatTitle, // Using the title from modal instead of hardcoded value
        messages: messages.map((message, index): Message => {
          // Create base message object
          const messageObj: Message = {
            id: index + 1, // Incrementing the ID (ensure it's unique)
            text: message.text,
            sender: message.sender === "user" ? "user" : "bot", // Use "bot" to match the original sender type
            expanded: message.expanded || false,
            isLoading: message.isLoading || false,
            isError: message.isError || false,
          };

          // If it's a bot message with details, include all the detailed information
          if (message.sender === "bot" && message.details) {
            messageObj.details = {
              answer: message.details.answer,
              confidence: message.details.confidence,
              source: message.details.source,
              justification: message.details.justification,
              topChunk: message.details.topChunk,
            };
          }

          return messageObj;
        }),
        timestamp: new Date().toISOString(), // Unique timestamp for each request
      };
      const response = await fetch(
        `${API_BASE_URL}/api/save_chat?user_id=${userId}&local_kw=${local_kw}&timestamp=${chatHistory.timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chatHistory), // Send the chat history object
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save chat to database.");
      }

      const result = await response.json();
      console.log("Chat saved successfully:", result);
      alert("Chat saved to database successfully!");
    } catch (err) {
      console.error("Error saving chat:", err);
      alert("Failed to save chat to database.");
    } finally {
      setIsSaving(false);
      setIsModalOpen(false); // Close modal after save attempt
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleExpand = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, expanded: !msg.expanded } : msg
      )
    );
  };

  // Function to fetch with timeout
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 100000
  ) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user's message to chat
    const userMessage: Message = {
      id: Date.now(),
      text: question,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add a placeholder for the bot's response
    const tempBotMessageId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: tempBotMessageId,
        text: "Yeti is climbing the moutains to get your answer...",
        sender: "bot",
        isLoading: true,
      },
    ]);

    setLoading(true);
    setError("");

    try {
      console.log(`Sending request to ${API_BASE_URL}/api/ask`);
      console.log("Request payload:", { question, use_llm: useLLM });

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            use_llm: useLLM,
          }),
        },
        60000 // 60 second timeout
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch response: ${response.status} ${response.statusText}`
        );
      }

      console.log("Converting response to JSON...");
      const data = await response.json();
      console.log("API response data:", data);

      // Update the temporary bot message with the actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? {
                id: tempBotMessageId,
                text: data.llm_response || data.answer,
                sender: "bot",
                isLoading: false,
                details: {
                  answer: data.answer,
                  confidence: data.confidence,
                  source: data.source,
                  justification: `This answer is derived from ${
                    data.source
                  } with a confidence of ${data.confidence.toFixed(2)}.`,
                  topChunk: data.context,
                },
                expanded: false,
              }
            : msg
        )
      );
    } catch (err: any) {
      console.error("Error details:", err);

      // Update the temporary bot message to show the error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? {
                id: tempBotMessageId,
                text: `Sorry, I encountered an error: ${
                  err.name === "AbortError" ? "Request timed out" : err.message
                }. Please try again.`,
                sender: "bot",
                isLoading: false,
                isError: true,
              }
            : msg
        )
      );

      if (err.name === "AbortError") {
        setError(
          "Request timed out. The server may be busy processing your question."
        );
      } else {
        setError(`Error: ${err.message || "Unknown error occurred"}`);
      }
    } finally {
      setLoading(false);
      setQuestion(""); // Clear input field after submission
    }
  };

  // Health check on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          const data = await response.json();
          console.log("API health check:", data);
        } else {
          console.error("API health check failed:", response.status);
          setError("API service may be unavailable. Check server connection.");
        }
      } catch (err) {
        console.error("Error connecting to API:", err);
        setError("Cannot connect to API server. Please ensure it's running.");
      }
    };

    checkApiHealth();
  }, []);

  const toggleLLM = () => {
    setUseLLM(!useLLM);
  };

  return (
    <div className="max-w-7xl mt-6 gap-6 mx-auto flex flex-col">
      <span className="w-full flex gap-4 items-center justify-center">
        <Image
          src="/askyeti.svg"
          alt="logo"
          width={150}
          height={150}
          className=""
        />
      </span>
      <div className="w-full h-[calc(100vh-250px)] flex flex-col justify-end rounded-lg border border-gray-200 shadow-sm">
        <div className="h-full flex flex-col space-y-4 p-6 overflow-y-auto bg-gray-50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
              Start a conversation by asking a security-related question
            </div>
          )}

          {messages.map((message, index) => (
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
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    <span>{message.text}</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.text}</div>
                )}

                {message.sender === "bot" &&
                  message.details &&
                  !message.isLoading && (
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
                        {message.expanded ? "Hide details" : "Show RAG details"}
                      </button>

                      {message.expanded && (
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
                                {Math.round(message.details.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">Source:</span>{" "}
                            <span className="text-blue-600">
                              {message.details.source}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium">
                              Knowledge Base Answer:
                            </span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                              {message.details.answer}
                            </div>
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">Justification:</span>
                            <div className="mt-1 text-xs text-gray-600">
                              {message.details.justification}
                            </div>
                          </div>
                          <div className="mb-1">
                            <span className="font-medium">
                              Top Retrieved Chunk:
                            </span>
                            <div className="mt-1 p-2 bg-gray-100 rounded text-xs max-h-28 overflow-y-auto">
                              {message.details.topChunk}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-4 border-t border-gray-200 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about security policies..."
              className="h-12 w-full focus:outline-none text-lg px-4 border rounded-full focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleLLM}
              title={
                useLLM
                  ? "Using AI enhanced responses"
                  : "Using direct knowledge base answers"
              }
              className={`p-3 rounded-full cursor-pointer ${
                useLLM
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              } hover:bg-opacity-80 transition-colors`}
              disabled={loading}
            >
              <FaMagic className="text-xl" />
            </button>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="p-3 bg-main text-white rounded-full hover:bg-main/80 transition-colors disabled:bg-main cursor-pointer"
            >
              <IoSend className="text-xl" />
            </button>
          </form>

          <div className="flex justify-between mt-2 px-2">
            <div className="text-xs text-gray-500">
              {useLLM
                ? "Using AI enhanced responses"
                : "Using direct knowledge base answers"}
            </div>
            <div className="text-xs text-gray-500">Press Enter to send</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg">
          {error}
        </div>
      )}

      <div className="flex w-full justify-between items-center text-sm pb-4">
        <div
          className="py-4 px-2 inline-flex gap-2 items-center cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          {" "}
          <FaFolderOpen /> Load Previous Chat
        </div>
        <ChatHistoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <div className="flex justify-end">
          <button
            onClick={downloadChatAsJSON}
            className="inline-flex items-center gap-2 bg-transparent text-main cursor-pointer px-4 py-2 text-sm  transition-all ease-in-out duration-300"
          >
            {" "}
            <FaFileDownload />
            Download Chat as JSON
          </button>
          <button
            onClick={handleOpenSaveModal} // Changed to open modal instead of directly saving
            className="p-3 inline-flex gap-2 items-center text-white bg-main hover:bg-main/80 cursor-pointer transition-colors"
            disabled={isSaving || messages.length === 0}
          >
            <FaFolder />
            {isSaving ? "Saving..." : "Save Chat"}
          </button>
        </div>
      </div>

      {/* Title Modal */}
      <TitleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveChatToDatabase}
        defaultTitle={`Security Chat ${new Date().toLocaleDateString()}`} // Default title with date
      />
    </div>
  );
};

export default ChatPage;
