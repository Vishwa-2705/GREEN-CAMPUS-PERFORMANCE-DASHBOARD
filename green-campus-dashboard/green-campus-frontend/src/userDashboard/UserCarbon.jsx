import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserCarbon.css";

const UserCarbon = () => {
  const { carbonData, carbonTotal, carbonPreviousTotal, carbonChange } = useDashboard();

  return (
    <div className="user-carbon-dashboard">
      <div className="carbon-header">
        <h1>Carbon Emissions Dashboard</h1>
        <p>View carbon emission trends and analytics</p>
      </div>

      <div className="carbon-stats">
        <div className="stat-card">
          <h3>Current Month Total</h3>
          <p className="stat-value">{carbonTotal} kg CO2</p>
        </div>
        <div className="stat-card">
          <h3>Previous Month Total</h3>
          <p className="stat-value">{carbonPreviousTotal} kg CO2</p>
        </div>
        <div className={`stat-card ${carbonChange > 0 ? "increase" : "decrease"}`}>
          <h3>Change</h3>
          <p className="stat-value">{carbonChange}%</p>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#607D8B" name="Current Month" />
            <Bar dataKey="previous" fill="#B0BEC5" name="Previous Month" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table">
        <h2>Weekly Carbon Emissions Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (kg CO2)</th>
              <th>Previous Month (kg CO2)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {carbonData.map((item, index) => (
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
        <p>Note: This is a read-only view. Contact administrators for carbon data modifications.</p>
      </div>
    </div>
  );
};

export default UserCarbon;
