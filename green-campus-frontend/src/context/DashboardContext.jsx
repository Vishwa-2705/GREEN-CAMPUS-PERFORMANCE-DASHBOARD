import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import * as apiService from "../api/apiService";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  // Energy data
  const [energyData, setEnergyData] = useState([
    { week: "Week 1", current: 120, previous: 100 },
    { week: "Week 2", current: 130, previous: 110 },
    { week: "Week 3", current: 115, previous: 105 },
    { week: "Week 4", current: 140, previous: 120 },
  ]);

  // Water data
  const [waterData, setWaterData] = useState([
    { week: "Week 1", current: 200, previous: 180 },
    { week: "Week 2", current: 210, previous: 190 },
    { week: "Week 3", current: 195, previous: 175 },
    { week: "Week 4", current: 220, previous: 200 },
  ]);

  // Waste data
  const [wasteData, setWasteData] = useState([
    { week: "Week 1", current: 80, previous: 75 },
    { week: "Week 2", current: 85, previous: 80 },
    { week: "Week 3", current: 78, previous: 72 },
    { week: "Week 4", current: 90, previous: 85 },
  ]);

  // Carbon data
  const [carbonData, setCarbonData] = useState([
    { week: "Week 1", current: 52, previous: 58 },
    { week: "Week 2", current: 49, previous: 54 },
    { week: "Week 3", current: 47, previous: 51 },
    { week: "Week 4", current: 55, previous: 60 },
  ]);

  // Calculate totals
  const energyTotal = energyData.reduce((sum, item) => sum + item.current, 0);
  const waterTotal = waterData.reduce((sum, item) => sum + item.current, 0);
  const wasteTotal = wasteData.reduce((sum, item) => sum + item.current, 0);
  const carbonTotal = carbonData.reduce((sum, item) => sum + item.current, 0);

  const energyPreviousTotal = energyData.reduce((sum, item) => sum + item.previous, 0);
  const waterPreviousTotal = waterData.reduce((sum, item) => sum + item.previous, 0);
  const wastePreviousTotal = wasteData.reduce((sum, item) => sum + item.previous, 0);
  const carbonPreviousTotal = carbonData.reduce((sum, item) => sum + item.previous, 0);

  const calculateChange = (currentTotal, previousTotal) => {
    if (previousTotal === 0) {
      return currentTotal === 0 ? "0.00" : "100.00";
    }
    return (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(2);
  };

  // Calculate percentage changes
  const energyChange = calculateChange(energyTotal, energyPreviousTotal);
  const waterChange = calculateChange(waterTotal, waterPreviousTotal);
  const wasteChange = calculateChange(wasteTotal, wastePreviousTotal);
  const carbonChange = calculateChange(carbonTotal, carbonPreviousTotal);

  // Green Score calculation (0-100 scale, lower is better for consumption)
  // Average of inverse scores (so lower consumption = higher score)
  const calculateGreenScore = () => {
    const energyScore = Math.max(0, 100 - (energyTotal - energyPreviousTotal));
    const waterScore = Math.max(0, 100 - (waterTotal - waterPreviousTotal));
    const wasteScore = Math.max(0, 100 - (wasteTotal - wastePreviousTotal));
    const carbonScore = Math.max(0, 100 - (carbonTotal - carbonPreviousTotal));
    const avgScore = Math.round((energyScore + waterScore + wasteScore + carbonScore) / 4);
    return Math.min(100, Math.max(0, avgScore));
  };

  const greenScore = calculateGreenScore();

  const value = {
    // Energy
    energyData,
    setEnergyData,
    energyTotal,
    energyPreviousTotal,
    energyChange,

    // Water
    waterData,
    setWaterData,
    waterTotal,
    waterPreviousTotal,
    waterChange,

    // Waste
    wasteData,
    setWasteData,
    wasteTotal,
    wastePreviousTotal,
    wasteChange,

    // Carbon
    carbonData,
    setCarbonData,
    carbonTotal,
    carbonPreviousTotal,
    carbonChange,

    // Overall
    greenScore,
  };

  // Load persisted dashboard from backend on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await apiService.getDashboard();
      if (res.success && res.data && mounted) {
        const data = res.data;
        if (Array.isArray(data.energyData) && data.energyData.length) setEnergyData(data.energyData);
        if (Array.isArray(data.waterData) && data.waterData.length) setWaterData(data.waterData);
        if (Array.isArray(data.wasteData) && data.wasteData.length) setWasteData(data.wasteData);
        if (Array.isArray(data.carbonData) && data.carbonData.length) setCarbonData(data.carbonData);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Persist dashboard when admin updates values
  const didInitRef = useRef(false);
  useEffect(() => {
    // Skip first run which may be initial state
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    const persist = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return;
        const user = JSON.parse(userInfo);
        if (user.role && user.role.toLowerCase() === 'admin') {
          await apiService.updateDashboard({ energyData, waterData, wasteData, carbonData });
        }
      } catch (e) {
        console.error('Error persisting dashboard:', e);
      }
    };

    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyData, waterData, wasteData, carbonData]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

  // Fetch persisted dashboard on mount
  // Note: placed after provider return would be unreachable; instead use effect before return

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export default DashboardContext;
