import React, { useState, useEffect } from "react";
import { uploadReport } from "../api/axios"; 
import api from "../api/axios"; 
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import "./UploadReport.css";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState([]);


  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports/my-reports"); 
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Fetch Reports Error:", err);
      toast.error("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);

    try {
      setUploading(true);
      const res = await uploadReport(formData);
      toast.success("Report uploaded successfully");
      setFile(null);
      console.log("Uploaded report:", res.data.report);
      fetchReports(); 
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <Sidebar />
      <div className="upload-container">
        <h2>Upload Medical Report</h2>

        <div className="upload-box">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {file && <p className="file-name">Selected: {file.name}</p>}

          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </button>
        </div>

   
        <div className="uploaded-reports">
          <h3 style={{ marginTop: "40px", color: "#0b6a3a" }}>Your Reports</h3>
          {reports.length === 0 && <p>No reports uploaded yet.</p>}
          <ul>
            {reports.map((r) => (
              <li key={r._id} className="report-item">
                <a
                  href={`http://localhost:3000/${r.path.replace("\\", "/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.originalName || r.filename}
                </a>{" "}
                <span style={{ fontSize: "12px", color: "#666" }}>
                  ({new Date(r.uploadedAt).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
