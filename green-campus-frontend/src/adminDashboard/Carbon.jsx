import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboard } from "../context/DashboardContext";
import "./Carbon.css";

const Carbon = () => {
  const { carbonData, setCarbonData, carbonTotal, carbonPreviousTotal, carbonChange } = useDashboard();

  const [formData, setFormData] = useState({ week: "", current: "", previous: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setFormData({ week: "", current: "", previous: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    if (formData.week && formData.current && formData.previous) {
      setCarbonData([
        ...carbonData,
        {
          ...formData,
          current: parseFloat(formData.current),
          previous: parseFloat(formData.previous),
        },
      ]);
      resetForm();
    }
  };

  const handleEdit = (index) => {
    setFormData(carbonData[index]);
    setEditingId(index);
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (editingId !== null && formData.week && formData.current && formData.previous) {
      const updated = [...carbonData];
      updated[editingId] = {
        ...formData,
        current: parseFloat(formData.current),
        previous: parseFloat(formData.previous),
      };
      setCarbonData(updated);
      resetForm();
    }
  };

  const handleDelete = (index) => {
    setCarbonData(carbonData.filter((_, i) => i !== index));
  };

  return (
    <div className="carbon-dashboard">
      <div className="carbon-header">
        <h1>Carbon Management Dashboard</h1>
        <p>Monitor and manage weekly carbon emissions across campus</p>
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

      <button
        className="add-btn"
        onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            resetForm();
          } else {
            setEditingId(null);
            setFormData({ week: "", current: "", previous: "" });
          }
        }}
      >
        {showForm ? "Cancel" : "+ Add Entry"}
      </button>

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
              placeholder="Current Month (kg CO2)"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
            />
            <input
              type="number"
              placeholder="Previous Month (kg CO2)"
              value={formData.previous}
              onChange={(e) => setFormData({ ...formData, previous: e.target.value })}
            />
            <button className="submit-btn" onClick={editingId !== null ? handleUpdate : handleAdd}>
              {editingId !== null ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </div>
      )}

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
              <th>Actions</th>
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
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEdit(index)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Carbon;
