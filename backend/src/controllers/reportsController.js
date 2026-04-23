const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Report = require("../models/Report"); 

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "src/uploads/reports");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter 
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Only PDF or Image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 5MB

// Upload report
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const report = new Report({
      patient: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date(),
    });

    await report.save();

    return res.status(201).json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (err) {
    console.error("Upload Report Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.uploadMiddleware = upload.single("report");

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check ownership
    if (report.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), "src/uploads/reports", report.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(req.params.id);

    return res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete Report Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
