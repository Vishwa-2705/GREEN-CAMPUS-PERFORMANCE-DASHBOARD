import React from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaBolt, FaWater, FaTrash, FaCloud, FaLeaf, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-title">
        🌿 Green Campus
      </div>
      <span className="admin-badge">👨‍💼 Admin</span>
      <ul>
        <li><Link to="/admin/overall"><FaTachometerAlt /> Dashboard</Link></li>
        <li><Link to="/admin/energy"><FaBolt /> Energy</Link></li>
        <li><Link to="/admin/water"><FaWater /> Water</Link></li>
        <li><Link to="/admin/waste"><FaTrash /> Waste</Link></li>
        <li><Link to="/admin/carbon"><FaCloud /> Carbon</Link></li>
        <li><Link to="/admin/greenscore"><FaLeaf /> Green Score</Link></li>
        <li><Link to="/admin/contact"><FaEnvelope /> Contact Us</Link></li>
      </ul>
      <button className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
