import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserEnergy.css";

const UserEnergy = () => {
  const { energyData, energyTotal, energyPreviousTotal, energyChange } = useDashboard();

  return (
    <div className="user-energy-dashboard">
      <div className="energy-header">
        <h1>⚡ Energy Consumption Dashboard</h1>
        <p>View energy consumption trends and analytics</p>
      </div>

      {/* Statistics */}
      <div className="energy-stats">
        <div className="stat-card">
          <h3>Current Month Total</h3>
          <p className="stat-value">{energyTotal} kWh</p>
        </div>
        <div className="stat-card">
          <h3>Previous Month Total</h3>
          <p className="stat-value">{energyPreviousTotal} kWh</p>
        </div>
        <div className={`stat-card ${energyChange > 0 ? "increase" : "decrease"}`}>
          <h3>Change</h3>
          <p className="stat-value">{energyChange}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={energyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#FFA500" name="Current Month" />
            <Bar dataKey="previous" fill="#8884d8" name="Previous Month" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table - Read Only */}
      <div className="data-table">
        <h2>Weekly Energy Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (kWh)</th>
              <th>Previous Month (kWh)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {energyData.map((item, index) => (
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

export default UserEnergy;
