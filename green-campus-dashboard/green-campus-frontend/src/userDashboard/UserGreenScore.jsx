import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./UserGreenScore.css";

const UserGreenScore = () => {
  const { greenScore, energyChange, waterChange, wasteChange, carbonChange } = useDashboard();

  const monthlyData = [
    { month: "January", energy: 88, water: 75, waste: 80, carbon: 77, overall: 80 },
    { month: "February", energy: 85, water: 78, waste: 82, carbon: 79, overall: 81 },
    { month: "March", energy: 92, water: 85, waste: 88, carbon: 84, overall: 87 },
    { month: "April", energy: 94, water: 88, waste: 90, carbon: 86, overall: 90 },
    { month: "May", energy: 89, water: 80, waste: 85, carbon: 82, overall: 84 },
    { month: "June", energy: 96, water: 92, waste: 95, carbon: 90, overall: 93 },
  ];

  const metrics = [
    { label: "Energy", change: energyChange, positiveText: "Energy consumption increased", negativeText: "Energy consumption decreased", category: "energy" },
    { label: "Water", change: waterChange, positiveText: "Water consumption increased", negativeText: "Water consumption decreased", category: "water" },
    { label: "Waste", change: wasteChange, positiveText: "Waste generation increased", negativeText: "Waste generation decreased", category: "waste" },
    { label: "Carbon", change: carbonChange, positiveText: "Carbon emissions increased", negativeText: "Carbon emissions decreased", category: "carbon" },
  ];

  const alerts = metrics.map((metric) => ({
    type: metric.change > 0 ? "warning" : "success",
    message: `${metric.change > 0 ? metric.positiveText : metric.negativeText} by ${Math.abs(metric.change)}%!`,
    category: metric.category,
  }));

  const scoreData = metrics.map((metric) => ({
    metric: metric.label,
    current: Number(metric.change),
  }));

  return (
    <div className="user-greenscore-dashboard">
      <div className="greenscore-header">
        <h1>Green Score Analytics</h1>
        <p>Comprehensive sustainability performance analysis</p>
      </div>

      <div className="overall-score-container">
        <div className="score-card main-score">
          <h2>Overall Green Score</h2>
          <div className="score-circle">
            <span className="score-value">{greenScore}</span>
            <span className="score-max">/100</span>
          </div>
          <p className={`score-change ${greenScore < 50 ? "increase" : "decrease"}`}>
            Dynamic score based on current consumption
            <br />
            <span className="comparison">Higher values indicate better sustainability</span>
          </p>
        </div>

        {metrics.map((metric) => (
          <div key={metric.label} className={`score-card ${metric.category}-score`}>
            <h3>{metric.label} Change</h3>
            <p className="metric-value">{metric.change}%</p>
            <p className={`metric-change ${metric.change > 0 ? "increase" : "decrease"}`}>
              {metric.change > 0 ? "Up" : "Down"} {Math.abs(metric.change)}%
            </p>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <h2>Consumption Change Comparison</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#27ae60" name="% Change" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Score Trend Over Months</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="energy" stroke="#FFA500" strokeWidth={2} name="Energy" />
            <Line type="monotone" dataKey="water" stroke="#2196F3" strokeWidth={2} name="Water" />
            <Line type="monotone" dataKey="waste" stroke="#FF5722" strokeWidth={2} name="Waste" />
            <Line type="monotone" dataKey="carbon" stroke="#607D8B" strokeWidth={2} name="Carbon" />
            <Line type="monotone" dataKey="overall" stroke="#27ae60" strokeWidth={3} name="Overall" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="alerts-container">
        <h2>Performance Alerts</h2>
        <div className="alerts-grid">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>
      </div>

      <div className="summary-container">
        <h2>Score Summary</h2>
        <div className="summary-content">
          <p>
            <strong>Current Overall Score:</strong> {greenScore}/100
          </p>
          <p>
            <strong>Score Status:</strong> {greenScore >= 70 ? "Excellent" : greenScore >= 50 ? "Good" : "Needs Improvement"}
          </p>
          <p>
            Energy Change: {energyChange > 0 ? "+" : ""}{energyChange}% | Water Change: {waterChange > 0 ? "+" : ""}{waterChange}% | Waste Change: {wasteChange > 0 ? "+" : ""}{wasteChange}% | Carbon Change: {carbonChange > 0 ? "+" : ""}{carbonChange}%
          </p>
          <p className={greenScore >= 50 ? "decrease" : "increase"}>
            {greenScore >= 50
              ? "Score is maintainable. Keep working towards sustainability goals."
              : "Focus on reducing consumption to improve your green score."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGreenScore;
