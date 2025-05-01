// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";

// interface ChatItem {
//   id: number;
//   title: string;
// }

// export default function ChatHistoryModal({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   const [chats, setChats] = useState<ChatItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchChatHistory = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/chat-history");
//         if (!res.ok) throw new Error("Failed to fetch chat history");
//         const data = await res.json();
//         const extracted = data.map((chat: any) => ({
//           id: chat.id,
//           title: chat.title,
//         }));
//         setChats(extracted);
//         setLoading(false);
//       } catch (err: any) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchChatHistory();
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Previous Chats</h2>
//           <button onClick={onClose} className="text-gray-600 hover:text-black">
//             &times;
//           </button>
//         </div>
//         {loading ? (
//           <p>Loading...</p>
//         ) : error ? (
//           <p className="text-red-500">{error}</p>
//         ) : (
//           <ul className="text-lg space-y-2">
//             {chats.map((chat) => (
//               <li key={chat.id}>
//                 <Link
//                   href={`/chat/${chat.id}`}
//                   className="text-blue-600 hover:underline"
//                 >
//                   {chat.title}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// API base URL
const API_BASE_URL = "http://localhost:8000";

type ChatHistory = {
  id: number;
  user_id: number;
  title: string;
  chat_data: any[];
};
interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/chat-history`);

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }

      const data = await response.json();
      setChatHistory(data);
    } catch (err: any) {
      console.error("Error fetching chat history:", err);
      setError(err.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const getMessageCount = (chat: ChatHistory) => {
    return chat.chat_data?.length || 0;
  };

  const handleChatSelect = (chatId: number) => {
    router.push(`/chat/${chatId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chat History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-main border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : chatHistory.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No previous chat history found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="py-4 px-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium text-main">{chat.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getMessageCount(chat)} messages
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
