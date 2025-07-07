const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for different document types
const createCloudinaryStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "pdf",
        "doc",
        "docx",
        "txt",
        "xlsx",
        "xls",
      ],
      resource_type: "auto",
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    },
  });
};

// Create Cloudinary storage for client logos with specific transformations
const createLogoStorage = () => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "sak-platform/client-logos",
      allowed_formats: ["jpg", "jpeg", "png"],
      resource_type: "image",
      transformation: [
        { width: 300, height: 300, crop: "fit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    },
  });
};

// Storage configurations for different entities
const storageConfigs = {
  staff: createCloudinaryStorage("sak-platform/staff-documents"),
  clients: createCloudinaryStorage("sak-platform/client-documents"),
  clientLogos: createLogoStorage(),
  tasks: createCloudinaryStorage("sak-platform/task-attachments"),
  meetings: createCloudinaryStorage("sak-platform/meeting-attachments"),
  invoices: createCloudinaryStorage("sak-platform/invoice-attachments"),
};

// Create multer instances for different upload types
const createUploadMiddleware = (entityType, maxFiles = 5) => {
  return multer({
    storage: storageConfigs[entityType],
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      // Allow common document and image types
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only images, PDFs, and documents are allowed."
          ),
          false
        );
      }
    },
  });
};

// Create logo-specific upload middleware
const createLogoUploadMiddleware = () => {
  return multer({
    storage: storageConfigs.clientLogos,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit for logos
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      // Only allow image types for logos
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only JPEG and PNG images are allowed for logos."
          ),
          false
        );
      }
    },
  });
};

// Export upload middlewares for different entities
const uploadMiddlewares = {
  staff: createUploadMiddleware("staff"),
  clients: createUploadMiddleware("clients"),
  clientLogos: createLogoUploadMiddleware(),
  tasks: createUploadMiddleware("tasks"),
  meetings: createUploadMiddleware("meetings"),
  invoices: createUploadMiddleware("invoices"),
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: "Too many files. Maximum is 5 files." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
};

module.exports = {
  uploadMiddlewares,
  handleUploadError,
  deleteFromCloudinary,
  cloudinary,
};
