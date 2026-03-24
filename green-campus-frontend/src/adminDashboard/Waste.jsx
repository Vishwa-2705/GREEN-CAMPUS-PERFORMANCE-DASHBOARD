import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./Waste.css";

const Waste = () => {
  const { wasteData, setWasteData, wasteTotal, wastePreviousTotal, wasteChange } = useDashboard();

  const [formData, setFormData] = useState({ week: "", current: "", previous: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (formData.week && formData.current && formData.previous) {
      const newData = [...wasteData, { ...formData, current: parseFloat(formData.current), previous: parseFloat(formData.previous) }];
      setWasteData(newData);
      setFormData({ week: "", current: "", previous: "" });
      setShowForm(false);
    }
  };

  const handleEdit = (index) => {
    setFormData(wasteData[index]);
    setEditingId(index);
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (editingId !== null && formData.week && formData.current && formData.previous) {
      const updated = [...wasteData];
      updated[editingId] = { ...formData, current: parseFloat(formData.current), previous: parseFloat(formData.previous) };
      setWasteData(updated);
      setFormData({ week: "", current: "", previous: "" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleDelete = (index) => {
    setWasteData(wasteData.filter((_, i) => i !== index));
  };

  return (
    <div className="waste-dashboard">
      <div className="waste-header">
        <h1>🗑 Waste Management Dashboard</h1>
        <p>Monitor and manage waste generation on a weekly basis</p>
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

      {/* Add Button */}
      <button className="add-btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ week: "", current: "", previous: "" }); }}>
        {showForm ? "Cancel" : "➕ Add Entry"}
      </button>

      {/* Form */}
      {showForm && (
        <div className="form-container">
          <div className="form">
            <input
              type="text"
              placeholder="Week (e.g., Week 1)"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: e.target.value })}
            />
            <input
              type="number"
              placeholder="Current Month (kg)"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
            />
            <input
              type="number"
              placeholder="Previous Month (kg)"
              value={formData.previous}
              onChange={(e) => setFormData({ ...formData, previous: e.target.value })}
            />
            <button onClick={editingId !== null ? handleUpdate : handleAdd} className="submit-btn">
              {editingId !== null ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </div>
      )}

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

      {/* Data Table */}
      <div className="data-table">
        <h2>Weekly Waste Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (kg)</th>
              <th>Previous Month (kg)</th>
              <th>Change</th>
              <th>Actions</th>
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
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>✏️ Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Waste;
