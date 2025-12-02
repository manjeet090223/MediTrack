// components/dashboard/HoverCard.jsx
import React from "react";
import { motion } from "framer-motion";
import "./HoverCard.css";

export default function HoverCard({ icon, title, description }) {
  return (
    <motion.div 
      className="hover-card"
      whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}
    >
      <div className="card-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.div>
  );
}
