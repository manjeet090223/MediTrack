import React, { useState } from "react";
import { uploadReport } from "../api/axios"; // API helper
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import "./UploadReport.css";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      const res = await uploadReport(formData); // Axios POST request
      toast.success("Report uploaded successfully");
      setFile(null); // reset file input
      console.log("Uploaded report:", res.data.report);
    } catch (err) {
      console.error(err);
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
      </div>
    </div>
  );
}
