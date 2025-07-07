const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const auth = require("../middleware/auth");
const {
  checkPermission,
  ensureOwnData,
  checkModuleAccess,
} = require("../middleware/rbac");
const {
  uploadMiddlewares,
  handleUploadError,
  deleteFromCloudinary,
} = require("../middleware/upload");

// GET /api/clients - Get all clients with filtering and pagination
router.get("/", auth, checkModuleAccess("clients"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      businessType,
      assignedTo,
      search,
    } = req.query;

    const filter = { isActive: true };

    // Client users can only see their own data
    if (req.user.userType === "client") {
      filter._id = req.user.clientId;
    }

    if (status) filter.onboardingStatus = status;
    if (businessType) filter.businessType = businessType;
    if (assignedTo) filter.assignedSalesAgent = assignedTo;
    if (search) {
      filter.$text = { $search: search };
    }

    const clients = await Client.find(filter)
      .populate("assignedSalesAgent", "name email")
      .populate("assignedManager", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(filter);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/clients - Create a new client
router.post(
  "/",
  auth,
  checkPermission("clients", "create"),
  uploadMiddlewares.clientLogos.single("logo"),
  async (req, res) => {
    console.log("client creation request received", req.body, req.file);
    try {
      const clientData = {
        ...req.body,
        assignedSalesAgent: req.user.id,
      };

      // Handle logo upload
      if (req.file) {
        clientData.logo = {
          url: req.file.secure_url,
          publicId: req.file.public_id,
          uploadedAt: new Date(),
        };
      }

      const client = new Client(clientData);
      await client.save();

      await client.populate("assignedSalesAgent", "name email");

      res.status(201).json(client);
    } catch (error) {
      console.error("Client creation error:", error);
      handleUploadError(error, req, res, () => {
        res.status(400).json({
          message: error.message,
          details: error.name === "ValidationError" ? error.errors : undefined,
        });
      });
    }
  }
);

// GET /api/clients/:id - Get a specific client
router.get(
  "/:id",
  auth,
  checkModuleAccess("clients"),
  ensureOwnData,
  async (req, res) => {
    try {
      const client = await Client.findById(req.params.id)
        .populate("assignedSalesAgent", "name email phone")
        .populate("assignedManager", "name email phone")
        .populate("visitLogs.visitedBy", "name");

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /api/clients/:id - Update a client
router.put(
  "/:id",
  auth,
  checkPermission("clients", "update"),
  uploadMiddlewares.clientLogos.single("logo"),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      // Handle logo upload
      if (req.file) {
        // If updating logo, delete the old one from Cloudinary
        const existingClient = await Client.findById(req.params.id);
        if (
          existingClient &&
          existingClient.logo &&
          existingClient.logo.publicId
        ) {
          await deleteFromCloudinary(existingClient.logo.publicId);
        }
        updateData.logo = {
          url: req.file.secure_url,
          publicId: req.file.public_id,
          uploadedAt: new Date(),
        };
      }

      const client = await Client.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      }).populate("assignedSalesAgent", "name email");

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      handleUploadError(error, req, res, () => {
        res.status(400).json({ message: error.message });
      });
    }
  }
);

// PUT /api/clients/:id/onboarding - Update onboarding checklist
router.put("/:id/onboarding", auth, async (req, res) => {
  try {
    const { checklistItem, completed, notes } = req.body;

    const updatePath = `onboardingChecklist.${checklistItem}`;
    const update = {
      [`${updatePath}.completed`]: completed,
      [`${updatePath}.notes`]: notes,
    };

    const client = await Client.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if all checklist items are completed
    const checklist = client.onboardingChecklist;
    const allCompleted = Object.values(checklist).every(
      (item) => item.completed
    );

    if (allCompleted && client.onboardingStatus !== "completed") {
      client.onboardingStatus = "completed";
      await client.save();
    }

    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/clients/:id/visit-logs - Add visit log
router.post("/:id/visit-logs", auth, async (req, res) => {
  try {
    const { visitType, notes } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.visitLogs.push({
      visitType,
      notes,
      visitedBy: req.user.id,
    });

    await client.save();
    await client.populate("visitLogs.visitedBy", "name");

    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/clients/:id/satisfaction - Update satisfaction rating
router.put("/:id/satisfaction", auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        "satisfaction.rating": rating,
        "satisfaction.feedback": feedback,
        "satisfaction.lastUpdated": new Date(),
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/clients/analytics/dashboard - Get clients analytics for dashboard
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({ isActive: true });
    const newClientsThisMonth = await Client.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    const clientsByStatus = await Client.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$onboardingStatus", count: { $sum: 1 } } },
    ]);

    const clientsByType = await Client.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$businessType", count: { $sum: 1 } } },
    ]);

    const averageSatisfaction = await Client.aggregate([
      { $match: { isActive: true, "satisfaction.rating": { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: "$satisfaction.rating" } } },
    ]);

    res.json({
      totalClients,
      newClientsThisMonth,
      clientsByStatus,
      clientsByType,
      averageSatisfaction: averageSatisfaction[0]?.avgRating || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/clients/:id - Soft delete a client
router.delete("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/clients/:id/documents - Upload client documents
router.post(
  "/:id/documents",
  auth,
  uploadMiddlewares.clients.array("documents", 5),
  handleUploadError,
  async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedDocuments = req.files.map((file) => ({
        type: req.body.type || "other",
        name: file.originalname,
        url: file.path,
        cloudinaryId: file.filename,
        uploadedAt: new Date(),
        uploadedBy: req.user.id,
      }));

      client.documents.push(...uploadedDocuments);
      await client.save();

      res.json({
        message: "Documents uploaded successfully",
        documents: uploadedDocuments,
        client: client,
      });
    } catch (error) {
      // Clean up uploaded files if database save fails
      if (req.files) {
        req.files.forEach((file) => {
          deleteFromCloudinary(file.filename);
        });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

// GET /api/clients/:id/documents - Get client documents
router.get("/:id/documents", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select("documents businessName")
      .populate("documents.uploadedBy", "name")
      .populate("documents.reviewedBy", "name");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      clientName: client.businessName,
      documents: client.documents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/clients/:id/documents/:documentId - Delete client document
router.delete("/:id/documents/:documentId", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const document = client.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }

    // Remove from database
    document.deleteOne();
    await client.save();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/clients/:id/documents/:documentId/review - Review client document
router.put("/:id/documents/:documentId/review", auth, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const document = client.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.reviewStatus = status;
    document.reviewNotes = reviewNotes;
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();

    await client.save();
    await client.populate("documents.reviewedBy", "name");

    res.json({
      message: "Document review updated successfully",
      document: document,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/clients/:id/documents/:documentId/share - Share document with client
router.post("/:id/documents/:documentId/share", auth, async (req, res) => {
  try {
    const { message: shareMessage, recipients } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const document = client.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Add sharing record to document
    if (!document.shares) {
      document.shares = [];
    }

    document.shares.push({
      sharedBy: req.user.id,
      sharedAt: new Date(),
      message: shareMessage,
      recipients: recipients || [client.contactPerson.email],
    });

    await client.save();

    // Here you would integrate with email service to send document
    // For now, we'll just return success

    res.json({
      message: "Document shared successfully",
      document: document,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
