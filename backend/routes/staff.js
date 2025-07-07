const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");
const auth = require("../middleware/auth");
const {
  uploadMiddlewares,
  handleUploadError,
  deleteFromCloudinary,
} = require("../middleware/upload");

// GET /api/staff - Get all staff with filtering
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      position,
      client,
      status,
      search,
    } = req.query;

    const filter = {};

    if (position) filter["employmentDetails.position"] = position;
    if (client) filter.assignedClient = client;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const staff = await Staff.find(filter)
      .populate("assignedClient", "businessName")
      .sort({ "employmentDetails.startDate": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Staff.countDocuments(filter);

    res.json({
      staff,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/staff - Create new staff member
router.post("/", auth, async (req, res) => {
  try {
    // Generate employee ID
    const count = await Staff.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, "0")}`;

    const staffData = {
      ...req.body,
      "employmentDetails.employeeId": employeeId,
    };

    const staff = new Staff(staffData);
    await staff.save();

    await staff.populate("assignedClient", "businessName");

    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/staff/:id - Get specific staff member
router.get("/:id", auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate(
      "assignedClient",
      "businessName contactPerson"
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/staff/:id - Update staff member
router.put("/:id", auth, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedClient", "businessName");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/staff/:id/attendance - Clock in/out
router.post("/:id/attendance", auth, async (req, res) => {
  try {
    const { type } = req.body; // 'in' or 'out'

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todaysAttendance = staff.attendance.find(
      (att) => att.date.getTime() === today.getTime()
    );

    if (!todaysAttendance) {
      todaysAttendance = {
        date: today,
        status: "present",
      };
      staff.attendance.push(todaysAttendance);
    }

    if (type === "in") {
      todaysAttendance.clockIn = new Date();
    } else if (type === "out") {
      todaysAttendance.clockOut = new Date();

      // Calculate hours worked
      if (todaysAttendance.clockIn) {
        const hoursWorked =
          (todaysAttendance.clockOut - todaysAttendance.clockIn) /
          (1000 * 60 * 60);
        todaysAttendance.hoursWorked = Math.round(hoursWorked * 100) / 100;
      }
    }

    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/staff/:id/performance - Update performance review
router.put("/:id/performance", auth, async (req, res) => {
  try {
    const { rating, feedback, goals } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        "performance.lastReviewDate": new Date(),
        "performance.rating": rating,
        "performance.feedback": feedback,
        "performance.goals": goals,
      },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/staff/analytics/dashboard - Staff analytics
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments({ status: "active" });
    const staffByPosition = await Staff.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$employmentDetails.position", count: { $sum: 1 } } },
    ]);

    const staffByClient = await Staff.aggregate([
      { $match: { status: "active", assignedClient: { $exists: true } } },
      {
        $lookup: {
          from: "clients",
          localField: "assignedClient",
          foreignField: "_id",
          as: "client",
        },
      },
      { $group: { _id: "$client.businessName", count: { $sum: 1 } } },
    ]);

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceToday = await Staff.aggregate([
      { $match: { status: "active" } },
      { $unwind: "$attendance" },
      { $match: { "attendance.date": today } },
      { $group: { _id: "$attendance.status", count: { $sum: 1 } } },
    ]);

    res.json({
      totalStaff,
      staffByPosition,
      staffByClient,
      attendanceToday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/staff/:id/documents - Upload staff documents
router.post(
  "/:id/documents",
  auth,
  uploadMiddlewares.staff.array("documents", 5),
  handleUploadError,
  async (req, res) => {
    try {
      const staff = await Staff.findById(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
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
      }));

      staff.documents.push(...uploadedDocuments);
      await staff.save();

      res.json({
        message: "Documents uploaded successfully",
        documents: uploadedDocuments,
        staff: staff,
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

// GET /api/staff/:id/documents - Get staff documents
router.get("/:id/documents", auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select(
      "documents personalInfo.firstName personalInfo.lastName"
    );
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({
      staffName: `${staff.personalInfo.firstName} ${staff.personalInfo.lastName}`,
      documents: staff.documents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/staff/:id/documents/:documentId - Delete staff document
router.delete("/:id/documents/:documentId", auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const document = staff.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete from Cloudinary
    if (document.cloudinaryId) {
      await deleteFromCloudinary(document.cloudinaryId);
    }

    // Remove from database
    document.deleteOne();
    await staff.save();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/staff/:id/documents/:documentId/review - Review/approve document
router.put("/:id/documents/:documentId/review", auth, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body; // status: 'approved', 'rejected', 'pending'

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const document = staff.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.reviewStatus = status;
    document.reviewNotes = reviewNotes;
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();

    await staff.save();
    await staff.populate("documents.reviewedBy", "name");

    res.json({
      message: "Document review updated successfully",
      document: document,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
