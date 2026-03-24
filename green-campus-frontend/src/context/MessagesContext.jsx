import React, { useState, createContext, useEffect } from "react";
import * as apiService from "../api/apiService";

export const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch messages from backend
  const fetchMessages = async () => {
    setLoading(true);
    const result = await apiService.getAllMessages();
    if (result.success) {
      setMessages(result.data || []);
    }
    setLoading(false);
  };

  // Send message to backend
  const sendMessage = async (name, email, subject, message) => {
    const result = await apiService.sendMessage(name, email, subject, message);
    if (result.success) {
      // Message sent successfully to backend
      return true;
    }
    return false;
  };

  // Add reply to backend
  const addReply = async (messageId, adminReply) => {
    const result = await apiService.replyToMessage(messageId, adminReply);
    if (result.success) {
      // Update local state
      setMessages(
        messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    sender: "Admin",
                    text: adminReply,
                    timestamp: new Date().toLocaleString(),
                  },
                ],
                status: "replied",
              }
            : msg
        )
      );
      return true;
    }
    return false;
  };

  // Delete message from backend
  const deleteMessage = async (messageId) => {
    const result = await apiService.deleteMessage(messageId);
    if (result.success) {
      setMessages(messages.filter((msg) => msg._id !== messageId));
      return true;
    }
    return false;
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    const result = await apiService.markMessageAsRead(messageId);
    if (result.success) {
      setMessages(
        messages.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg
        )
      );
    }
  };

  // Fetch messages on component mount if user is admin
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'admin') {
        fetchMessages();
      }
    }
  }, []);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        loading,
        sendMessage,
        addReply,
        deleteMessage,
        markAsRead,
        fetchMessages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
