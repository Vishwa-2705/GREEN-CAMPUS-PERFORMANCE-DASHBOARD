import React, { useState, useContext, useEffect } from "react";
import { MessagesContext } from "../context/MessagesContext";
import "./Messages.css";

const Messages = () => {
  const { messages, loading, addReply, deleteMessage, markAsRead, fetchMessages } =
    useContext(MessagesContext);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = async (message) => {
    if (message.status === "unread") {
      await markAsRead(message._id);
    }
    setSelectedMessage(message);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (replyText.trim() && selectedMessage) {
      setReplying(true);
      const success = await addReply(selectedMessage._id, replyText);
      if (success) {
        setReplyText("");
        // Refresh selected message
        const updatedMessage = messages.find((m) => m._id === selectedMessage._id);
        setSelectedMessage(updatedMessage);
      }
      setReplying(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      const success = await deleteMessage(messageId);
      if (success) {
        setSelectedMessage(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="messages-dashboard">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="messages-dashboard">
      <div className="messages-header">
        <h1>📬 User Messages</h1>
        <p>Manage and respond to user inquiries</p>
      </div>

      <div className="messages-container">
        {/* Messages List */}
        <div className="messages-list">
          <h2>Messages ({messages.length})</h2>
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet</p>
          ) : (
            <ul>
              {messages.map((message) => (
                <li
                  key={message._id}
                  className={`message-item ${message.status} ${
                    selectedMessage?._id === message._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="message-header">
                    <h3>{message.subject}</h3>
                    <span className={`status-badge ${message.status}`}>
                      {message.status === "unread" ? "🔴 New" : message.status === "replied" ? "✓ Replied" : "✓ Read"}
                    </span>
                  </div>
                  <p className="message-from">From: {message.user_name}</p>
                  <p className="message-preview">{message.message.substring(0, 50)}...</p>
                  <p className="message-time">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message Detail */}
        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="detail-header">
                <h2>{selectedMessage.subject}</h2>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  🗑️ Delete
                </button>
              </div>
              <div className="sender-info">
                <p>
                  <strong>From:</strong> {selectedMessage.user_name}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${selectedMessage.user_email}`}>
                    {selectedMessage.user_email}
                  </a>
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>

              <div className="message-content">
                <h3>User Message</h3>
                <p>{selectedMessage.message}</p>
              </div>

              {/* Replies */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="replies-section">
                  <h3>Conversation</h3>
                  {selectedMessage.replies.map((reply, index) => (
                    <div key={index} className="reply">
                      <div className="reply-header">
                        <strong>{reply.sender}</strong>
                        <span className="reply-time">
                          {new Date(reply.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p>{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <div className="reply-input-section">
                <h3>Your Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="5"
                />
                <button
                  className="send-reply-btn"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || replying}
                >
                  {replying ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
