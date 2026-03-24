import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="admin-layout">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
