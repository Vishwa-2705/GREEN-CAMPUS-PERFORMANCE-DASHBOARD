import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserWaste.css";

const UserWaste = () => {
  const { wasteData, wasteTotal, wastePreviousTotal, wasteChange } = useDashboard();

  return (
    <div className="user-waste-dashboard">
      <div className="waste-header">
        <h1>🗑 Waste Management Dashboard</h1>
        <p>View waste generation trends and analytics</p>
      </div>

      {/* Statistics */}
      <div className="waste-stats">
        <div className="stat-card">
          <h3>Current Month Total</h3>
          <p className="stat-value">{wasteTotal} kg</p>
        </div>
        <div className="stat-card">
          <h3>Previous Month Total</h3>
          <p className="stat-value">{wastePreviousTotal} kg</p>
        </div>
        <div className={`stat-card ${wasteChange > 0 ? "increase" : "decrease"}`}>
          <h3>Change</h3>
          <p className="stat-value">{wasteChange}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={wasteData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#FF5722" name="Current Month" />
            <Bar dataKey="previous" fill="#FFB74D" name="Previous Month" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table - Read Only */}
      <div className="data-table">
        <h2>Weekly Waste Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (kg)</th>
              <th>Previous Month (kg)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {wasteData.map((item, index) => (
              <tr key={index}>
                <td>{item.week}</td>
                <td>{item.current}</td>
                <td>{item.previous}</td>
                <td className={item.current > item.previous ? "increase" : "decrease"}>
                  {((item.current - item.previous) / item.previous * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-message">
        <p>📝 Note: This is a read-only view. Contact administrators for data modifications.</p>
      </div>
    </div>
  );
};

export default UserWaste;
