import React from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import "./UserLayout.css";

const UserLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="user-layout">
      <UserSidebar onLogout={handleLogout} />
      <div className="user-main-content">
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
