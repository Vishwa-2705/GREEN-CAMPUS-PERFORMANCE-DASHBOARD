import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./Energy.css";

const Energy = () => {
  const {
    energyData,
    setEnergyData,
    energyTotal,
    energyPreviousTotal,
    energyChange,
  } = useDashboard();

  const [formData, setFormData] = useState({
    week: "",
    current: "",
    previous: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (formData.week && formData.current && formData.previous) {
      setEnergyData([
        ...energyData,
        {
          ...formData,
          current: Number(formData.current),
          previous: Number(formData.previous),
        },
      ]);
      setFormData({ week: "", current: "", previous: "" });
      setShowForm(false);
    }
  };

  const handleEdit = (index) => {
    setFormData(energyData[index]);
    setEditingId(index);
    setShowForm(true);
  };

  const handleUpdate = () => {
    const updated = [...energyData];
    updated[editingId] = {
      ...formData,
      current: Number(formData.current),
      previous: Number(formData.previous),
    };
    setEnergyData(updated);
    setEditingId(null);
    setShowForm(false);
    setFormData({ week: "", current: "", previous: "" });
  };

  const handleDelete = (index) => {
    setEnergyData(energyData.filter((_, i) => i !== index));
  };

  return (
    <div className="energy-dashboard">
      {/* Header */}
      <div className="energy-header">
        <h1>⚡ Energy Management Dashboard</h1>
        <p>Monitor and manage energy consumption on a weekly basis</p>
      </div>

      {/* Stats */}
      <div className="energy-stats">
        <div className="stat-card">
          <h3>Current Month Total</h3>
          <p className="stat-value">{energyTotal} kWh</p>
        </div>

        <div className="stat-card">
          <h3>Previous Month Total</h3>
          <p className="stat-value">{energyPreviousTotal} kWh</p>
        </div>

        <div
          className={`stat-card ${
            energyChange >= 0 ? "increase" : "decrease"
          }`}
        >
          <h3>Change</h3>
          <p className="stat-value">{energyChange}%</p>
        </div>
      </div>

      {/* Add Button */}
      <button
        className="add-btn"
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ week: "", current: "", previous: "" });
        }}
      >
        {showForm ? "Cancel" : "➕ Add Entry"}
      </button>

      {/* Form */}
      {showForm && (
        <div className="form-container">
          <div className="form">
            <input
              type="text"
              placeholder="Week (Week 1)"
              value={formData.week}
              onChange={(e) =>
                setFormData({ ...formData, week: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Current Month (kWh)"
              value={formData.current}
              onChange={(e) =>
                setFormData({ ...formData, current: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Previous Month (kWh)"
              value={formData.previous}
              onChange={(e) =>
                setFormData({ ...formData, previous: e.target.value })
              }
            />
            <button
              className="submit-btn"
              onClick={editingId !== null ? handleUpdate : handleAdd}
            >
              {editingId !== null ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
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

      {/* Table */}
      <div className="data-table">
        <h2>Weekly Energy Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current (kWh)</th>
              <th>Previous (kWh)</th>
              <th>Change</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {energyData.map((item, index) => (
              <tr key={index}>
                <td>{item.week}</td>
                <td>{item.current}</td>
                <td>{item.previous}</td>
                <td
                  className={
                    item.current >= item.previous ? "increase" : "decrease"
                  }
                >
                  {(
                    ((item.current - item.previous) / item.previous) *
                    100
                  ).toFixed(1)}
                  %
                </td>
                <td className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(index)}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(index)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Energy;
