import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./Water.css";

const Water = () => {
  const { waterData, setWaterData, waterTotal, waterPreviousTotal, waterChange } = useDashboard();

  const [formData, setFormData] = useState({ week: "", current: "", previous: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (formData.week && formData.current && formData.previous) {
      const newData = [...waterData, { ...formData, current: parseFloat(formData.current), previous: parseFloat(formData.previous) }];
      setWaterData(newData);
      setFormData({ week: "", current: "", previous: "" });
      setShowForm(false);
    }
  };

  const handleEdit = (index) => {
    setFormData(waterData[index]);
    setEditingId(index);
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (editingId !== null && formData.week && formData.current && formData.previous) {
      const updated = [...waterData];
      updated[editingId] = { ...formData, current: parseFloat(formData.current), previous: parseFloat(formData.previous) };
      setWaterData(updated);
      setFormData({ week: "", current: "", previous: "" });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleDelete = (index) => {
    setWaterData(waterData.filter((_, i) => i !== index));
  };

  return (
    <div className="water-dashboard">
      <div className="water-header">
        <h1>💧 Water Management Dashboard</h1>
        <p>Monitor and manage water usage on a weekly basis</p>
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
              placeholder="Current Month (L)"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
            />
            <input
              type="number"
              placeholder="Previous Month (L)"
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

      {/* Data Table */}
      <div className="data-table">
        <h2>Weekly Water Usage Data</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Month (L)</th>
              <th>Previous Month (L)</th>
              <th>Change</th>
              <th>Actions</th>
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

export default Water;
