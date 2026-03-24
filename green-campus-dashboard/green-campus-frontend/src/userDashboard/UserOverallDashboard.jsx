import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserOverallDashboard.css";

const UserOverallDashboard = () => {
  const {
    energyTotal,
    waterTotal,
    wasteTotal,
    carbonTotal,
    energyChange,
    waterChange,
    wasteChange,
    carbonChange,
    greenScore,
  } = useDashboard();

  const data = [
    { name: "Energy", value: energyTotal },
    { name: "Water", value: waterTotal },
    { name: "Waste", value: wasteTotal },
    { name: "Carbon", value: carbonTotal },
  ];

  const colors = ["#FFA500", "#2196F3", "#FF5722", "#607D8B"];

  return (
    <div className="user-overall-dashboard">
      <div className="top-content">
        <h1>Welcome to Green Campus Dashboard</h1>
        <p>Monitor campus sustainability performance!</p>
      </div>

      <div className="dashboard-main">
        <div className="values-panel">
          <div className="value-card energy">
            <h2>Energy</h2>
            <p>Consumption: {energyTotal} kWh</p>
            <p>Month Change: {energyChange}%</p>
          </div>

          <div className="value-card water">
            <h2>Water</h2>
            <p>Usage: {waterTotal} L</p>
            <p>Month Change: {waterChange}%</p>
          </div>

          <div className="value-card waste">
            <h2>Waste</h2>
            <p>Generated: {wasteTotal} kg</p>
            <p>Month Change: {wasteChange}%</p>
          </div>

          <div className="value-card carbon">
            <h2>Carbon</h2>
            <p>Emissions: {carbonTotal} kg CO2</p>
            <p>Month Change: {carbonChange}%</p>
          </div>

          <div className="value-card green-score">
            <h2>Green Score</h2>
            <p>Score: {greenScore}</p>
            <p>Status: {greenScore >= 75 ? "Excellent" : greenScore >= 50 ? "Good" : "Needs Improvement"}</p>
          </div>
        </div>

        <div className="chart-panel">
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={140} dataKey="value" label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="alert-section">
        <div className={`alert ${energyChange > 0 ? "energy-alert" : "success-alert"}`}>
          {energyChange > 0 ? "Warning" : "Good"} Energy: {energyChange > 0 ? "increased" : "decreased"} by {Math.abs(energyChange)}%
        </div>
        <div className={`alert ${waterChange > 0 ? "water-alert" : "success-alert"}`}>
          {waterChange > 0 ? "Warning" : "Good"} Water: {waterChange > 0 ? "increased" : "decreased"} by {Math.abs(waterChange)}%
        </div>
        <div className={`alert ${wasteChange > 0 ? "waste-alert" : "success-alert"}`}>
          {wasteChange > 0 ? "Warning" : "Good"} Waste: {wasteChange > 0 ? "increased" : "decreased"} by {Math.abs(wasteChange)}%
        </div>
        <div className="alert carbon-alert">
          {carbonChange > 0 ? "Warning" : "Good"} Carbon: {carbonChange > 0 ? "increased" : "decreased"} by {Math.abs(carbonChange)}%
        </div>
      </div>
    </div>
  );
};

export default UserOverallDashboard;
