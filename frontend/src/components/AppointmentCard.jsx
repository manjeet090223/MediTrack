import React from "react";

export default function AppointmentCard({ data, onCancel }) {
  return (
    <div
      style={{
        border: "1px solid gray",
        margin: "10px 0",
        padding: "10px",
        borderRadius: "6px",
      }}
    >
      <p><strong>ID:</strong> {data._id}</p>
      <p><strong>Doctor:</strong> {data.doctor?.name || data.doctor}</p>
      <p><strong>Date:</strong> {new Date(data.date).toLocaleString()}</p>
      <p><strong>Status:</strong> {data.status || "Scheduled"}</p>

      {data.status !== "Cancelled" && (
        <button onClick={onCancel} style={{ marginTop: "5px" }}>
          Cancel
        </button>
      )}
    </div>
  );
}
