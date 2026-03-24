import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserWater.css";

const UserWater = () => {
  const { waterData, waterTotal, waterPreviousTotal, waterChange } = useDashboard();

  return (
    <div className="user-water-dashboard">
      <div className="water-header">
        <h1>💧 Water Usage Dashboard</h1>
        <p>View water consumption trends and analytics</p>
      </div>

      {/* Statistics */}
      <div className="water-stats">
        <div className="stat-card">
          <h3>Current Month Total</h3>
          <p className="stat-value">{waterTotal} L</p>
        </div>
        <div className="stat-card">
          <h3>Previous Month Total</h3>
          <p className="stat-value">{waterPreviousTotal} L</p>
        </div>
        <div className={`stat-card ${waterChange > 0 ? "increase" : "decrease"}`}>
          <h3>Change</h3>
          <p className="stat-value">{waterChange}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={waterData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#2196F3" name="Current Month" />
            <Bar dataKey="previous" fill="#81C784" name="Previous Month" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table - Read Only */}
      <div className="data-table">
        <h2>Weekly Water Usage Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (L)</th>
              <th>Previous Month (L)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {waterData.map((item, index) => (
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

export default UserWater;
