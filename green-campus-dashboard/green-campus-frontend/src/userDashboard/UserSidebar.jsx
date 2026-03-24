import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaBolt, FaWater, FaTrash, FaCloud, FaLeaf, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import "./UserSidebar.css";

const UserSidebar = ({ onLogout }) => {
  return (
    <div className="user-sidebar">
      <div className="sidebar-title">
        🌿 Green Campus
      </div>
      <span className="user-badge">👤 User</span>
      <ul>
        <li><Link to="/user/overall"><FaTachometerAlt /> Dashboard</Link></li>
        <li><Link to="/user/energy"><FaBolt /> Energy</Link></li>
        <li><Link to="/user/water"><FaWater /> Water</Link></li>
        <li><Link to="/user/waste"><FaTrash /> Waste</Link></li>
        <li><Link to="/user/carbon"><FaCloud /> Carbon</Link></li>
        <li><Link to="/user/greenscore"><FaLeaf /> Green Score</Link></li>
        <li><Link to="/user/contact"><FaEnvelope /> Contact Us</Link></li>
      </ul>
      <button className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default UserSidebar;
