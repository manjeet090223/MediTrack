import React, { useState, useEffect, useRef, useCallback } from "react";
import { uploadReport } from "../api/axios";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUploadCloud,
  FiFile,
  FiImage,
  FiTrash2,
  FiEye,
  FiDownload,
  FiX,
  FiLoader,
  FiInbox,
  FiPlus,
  FiCheckCircle
} from "react-icons/fi";
import "./UploadReport.css";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports/my-reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Fetch Reports Error:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // File selection
  const handleFileSelect = (selectedFile) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(selectedFile.type)) {
      toast.error("Unsupported file type. Use PDF, JPG, or PNG.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  // Drag & Drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Upload
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);

    try {
      setUploading(true);
      await uploadReport(formData);
      toast.success("Report uploaded successfully");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchReports();
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.delete(`/api/reports/${id}`);
      toast.success("Report deleted");
      fetchReports();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Helpers
  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (name) => {
    if (!name) return <FiFile size={18} />;
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return <FiImage size={18} />;
    return <FiFile size={18} />;
  };

  const getFileType = (name) => {
    if (!name) return "File";
    const ext = name.split(".").pop()?.toUpperCase();
    return ext || "File";
  };

  return (
    <div className="page-wrapper">
      <Sidebar />

      <main className="page-main">
        <div className="page-container">
          {/* Page Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="page-header-text">
              <h1 className="page-title">Medical Reports</h1>
              <p className="page-subtitle">Upload and manage your medical documents</p>
            </div>
          </motion.div>

          {/* Upload Card */}
          <motion.div
            className="upload-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Drop Zone */}
            <div
              className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="file-input-hidden"
              />

              {!file ? (
                <div className="drop-zone-content">
                  <div className="drop-icon">
                    <FiUploadCloud size={36} />
                  </div>
                  <h3>Drag & drop your file here</h3>
                  <p>or <span className="drop-browse">click to browse</span></p>
                  <div className="drop-formats">
                    <span className="format-badge">PDF</span>
                    <span className="format-badge">JPG</span>
                    <span className="format-badge">PNG</span>
                    <span className="format-limit">Max 10MB</span>
                  </div>
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-preview-icon">
                    {getFileIcon(file.name)}
                  </div>
                  <div className="file-preview-info">
                    <span className="file-preview-name">{file.name}</span>
                    <span className="file-preview-meta">
                      {getFileType(file.name)} • {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    className="file-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    title="Remove file"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && (
              <button
                className="btn-upload-action"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <FiLoader size={18} className="spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={18} />
                    <span>Upload Report</span>
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Reports Section */}
          <motion.div
            className="reports-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="reports-header">
              <h2>Your Reports</h2>
              <span className="reports-count">{reports.length} file{reports.length !== 1 ? "s" : ""}</span>
            </div>

            {reports.length === 0 ? (
              <div className="reports-empty">
                <div className="reports-empty-icon">
                  <FiInbox size={44} />
                </div>
                <h3>No reports uploaded yet</h3>
                <p>Upload your medical documents to keep them organized and easily accessible.</p>
                <button
                  className="btn-upload-first"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPlus size={16} />
                  <span>Upload your first report</span>
                </button>
              </div>
            ) : (
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th className="th-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id}>
                        <td>
                          <div className="report-file-cell">
                            <div className={`report-file-icon ${getFileType(r.originalName || r.filename) === "PDF" ? "type-pdf" : "type-img"}`}>
                              {getFileIcon(r.originalName || r.filename)}
                            </div>
                            <span className="report-file-name">
                              {r.originalName || r.filename}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`type-badge ${getFileType(r.originalName || r.filename) === "PDF" ? "badge-pdf" : "badge-img"}`}>
                            {getFileType(r.originalName || r.filename)}
                          </span>
                        </td>
                        <td className="td-date">
                          {new Date(r.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>
                        <td className="td-actions">
                          <div className="report-actions">
                            <a
                              href={`http://localhost:3000/${r.path?.replace("\\", "/")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-btn action-view"
                              title="View"
                            >
                              <FiEye size={15} />
                            </a>
                            <a
                              href={`http://localhost:3000/${r.path?.replace("\\", "/")}`}
                              download
                              className="action-btn action-download"
                              title="Download"
                            >
                              <FiDownload size={15} />
                            </a>
                            <button
                              className="action-btn action-delete"
                              onClick={() => handleDelete(r._id)}
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
