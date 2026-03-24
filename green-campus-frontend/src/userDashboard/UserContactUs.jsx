import React, { useState, useEffect } from "react";
import { sendMessage, getAllMessages } from "../api/apiService";
import "./UserContactUs.css";

const UserContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Get user email from localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserEmail(user.email);
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, []);

  // Fetch messages sent by this user
  const fetchUserMessages = async () => {
    if (!userEmail) return;
    
    setLoadingMessages(true);
    try {
      const result = await getAllMessages();
      if (result.success) {
        // Filter messages by user email
        const userMessages = (result.data || []).filter(
          msg => msg.user_email === userEmail
        );
        setSentMessages(userMessages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
    setLoadingMessages(false);
  };

  // Fetch messages when component mounts or user email changes
  useEffect(() => {
    if (userEmail) {
      fetchUserMessages();
    }
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.name && formData.email && formData.subject && formData.message) {
      const result = await sendMessage(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      if (result.success) {
        setSubmitted(true);
        setFormData({ ...formData, name: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
        // Refresh messages
        await fetchUserMessages();
      } else {
        setError(result.error || "Failed to send message");
      }
    } else {
      setError("Please fill in all fields");
    }
    setLoading(false);
  };

  return (
    <div className="user-contactus-dashboard">
      <div className="contactus-header">
        <h1>📧 Contact Us</h1>
        <p>Get in touch with the Green Campus Team</p>
      </div>

      <div className="contact-container">
        {/* Contact Info Card */}
        <div className="contact-card">
          <div className="card-icon">👤</div>
          <h2>Project Lead</h2>
          <p className="contact-detail">
            <strong>Name:</strong> S.Vishwa
          </p>
          <p className="contact-detail">
            <strong>Email:</strong> <a href="mailto:vishwa.it23@bitsathy.ac.in">vishwa.it23@bitsathy.ac.in</a>
          </p>
          <p className="contact-detail">
            <strong>Phone:</strong> <a href="tel:+919361312898">+91 9361312898</a>
          </p>
        </div>

        {/* About Section */}
        <div className="about-section">
          <div className="about-card">
            <h2>🌍 About Green Campus Dashboard</h2>
            <p>
              The Green Campus Performance Dashboard is a comprehensive platform designed to monitor and 
              manage sustainability metrics across campus facilities. Our mission is to help educational 
              institutions track their environmental impact and work towards carbon neutrality.
            </p>
          </div>

          <div className="about-card">
            <h2>🎯 Our Mission</h2>
            <p>
              To provide real-time insights into campus energy consumption, water usage, and waste generation, 
              enabling data-driven decisions for sustainable operations and fostering environmental awareness 
              among stakeholders.
            </p>
          </div>

          <div className="about-card">
            <h2>📊 Key Features</h2>
            <ul>
              <li>✓ Real-time monitoring of energy consumption</li>
              <li>✓ Water usage tracking and analytics</li>
              <li>✓ Waste management and reduction insights</li>
              <li>✓ Green Score calculation and tracking</li>
              <li>✓ Month-over-month performance comparison</li>
              <li>✓ Admin and User dashboard access levels</li>
              <li>✓ Automated alert system for anomalies</li>
              <li>✓ Historical trend analysis</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>🤝 Support</h2>
            <p>
              For technical support, feature requests, or general inquiries about the Green Campus Dashboard, 
              please reach out to our team using the contact information provided above. We are committed to 
              helping you make the most of this platform.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-section">
          <h2>📝 Send us a Message</h2>
          {submitted && (
            <div className="success-message">
              ✓ Thank you for your message! The admin will get back to you soon via email.
            </div>
          )}
          {error && (
            <div className="error-message-box">
              ❌ {error}
            </div>
          )}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Messages Sent & Replies Section */}
        <div className="messages-section">
          <h2>📨 Your Messages & Replies</h2>
          {loadingMessages ? (
            <p className="loading-message">Loading your messages...</p>
          ) : sentMessages.length === 0 ? (
            <p className="no-messages-text">No messages sent yet</p>
          ) : (
            <div className="messages-list">
              {sentMessages.map((message) => (
                <div key={message._id} className="message-card">
                  <div className="message-header-user">
                    <h3>{message.subject}</h3>
                    <span className={`status-badge ${message.status}`}>
                      {message.status === "unread" ? "🔴 Pending" : message.status === "replied" ? "✓ Replied" : "✓ Read"}
                    </span>
                  </div>
                  <p className="message-date">
                    Sent: {new Date(message.created_at).toLocaleString()}
                  </p>
                  <div className="message-body">
                    <p>{message.message}</p>
                  </div>

                  {message.replies && message.replies.length > 0 && (
                    <div className="replies-container">
                      <h4>Admin Replies:</h4>
                      {message.replies.map((reply, idx) => (
                        <div key={idx} className="reply-item">
                          <div className="reply-header-user">
                            <strong>{reply.sender}</strong>
                            <span className="reply-date">
                              {new Date(reply.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserContactUs;
