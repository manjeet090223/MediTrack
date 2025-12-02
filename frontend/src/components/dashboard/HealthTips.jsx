// components/dashboard/HealthTips.jsx
import React, { useEffect, useState } from "react";
import "./HealthTips.css";

const tipsList = [
  "Drink 8 glasses of water daily 💧",
  "Take a 30-min walk every day 🚶",
  "Eat more fruits & vegetables 🍎🥦",
  "Get at least 7 hours of sleep 🛌",
  "Practice mindfulness or meditation 🧘",
];

export default function HealthTips() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tipsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-tips-banner">
      <p>{tipsList[currentTip]}</p>
    </div>
  );
}
