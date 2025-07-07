const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const {
  uploadMiddlewares,
  handleUploadError,
  deleteFromCloudinary,
} = require("../middleware/upload");

// GET /api/tasks - Get all tasks with filtering and pagination
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      assignedTo,
      client,
      search,
      dueDate,
    } = req.query;

    const filter = { isArchived: false };

    // Role-based filtering
    if (req.user.role !== "director" && req.user.role !== "admin") {
      filter.$or = [{ assignedTo: req.user.id }, { assignedBy: req.user.id }];
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (client) filter.client = client;
    if (search) {
      filter.$text = { $search: search };
    }
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("client", "businessName contactPerson")
      .sort({ dueDate: 1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks - Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.user.id,
    };

    const task = new Task(taskData);
    await task.save();

    await task.populate("assignedTo", "name email");
    await task.populate("client", "businessName");

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email phone")
      .populate("assignedBy", "name email")
      .populate("client", "businessName contactPerson")
      .populate("comments.user", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization
    if (
      req.user.role !== "director" &&
      req.user.role !== "admin" &&
      task.assignedTo._id.toString() !== req.user.id &&
      task.assignedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check authorization
    if (
      req.user.role !== "director" &&
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id &&
      task.assignedBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If status is being changed to completed, set completedAt
    if (req.body.status === "completed" && task.status !== "completed") {
      req.body.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("client", "businessName");

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/tasks/:id/comments - Add comment to task
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.comments.push({
      user: req.user.id,
      text,
    });

    await task.save();
    await task.populate("comments.user", "name");

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/tasks/:id/checklist/:itemId - Update checklist item
router.put("/:id/checklist/:itemId", auth, async (req, res) => {
  try {
    const { completed, notes } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const checklistItem = task.checklist.id(req.params.itemId);
    if (!checklistItem) {
      return res.status(404).json({ message: "Checklist item not found" });
    }

    checklistItem.completed = completed;
    checklistItem.notes = notes;
    if (completed) {
      checklistItem.completedAt = new Date();
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/tasks/analytics/dashboard - Get tasks analytics
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    const filter = { isArchived: false };

    // Role-based filtering
    if (req.user.role !== "director" && req.user.role !== "admin") {
      filter.$or = [{ assignedTo: req.user.id }, { assignedBy: req.user.id }];
    }

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed",
    });
    const overdueTasks = await Task.countDocuments({
      ...filter,
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() },
    });

    const tasksByStatus = await Task.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const upcomingTasks = await Task.find({
      ...filter,
      status: { $ne: "completed" },
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
    })
      .populate("assignedTo", "name")
      .populate("client", "businessName")
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      tasksByStatus,
      tasksByPriority,
      upcomingTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id - Archive a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task archived successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks/:id/attachments - Upload task attachments
router.post(
  "/:id/attachments",
  auth,
  uploadMiddlewares.tasks.array("attachments", 5),
  handleUploadError,
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedAttachments = req.files.map((file) => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        cloudinaryId: file.filename,
        uploadedAt: new Date(),
        uploadedBy: req.user.id,
      }));

      task.attachments.push(...uploadedAttachments);
      await task.save();

      res.json({
        message: "Attachments uploaded successfully",
        attachments: uploadedAttachments,
        task: task,
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

// GET /api/tasks/:id/attachments - Get task attachments
router.get("/:id/attachments", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .select("attachments title")
      .populate("attachments.uploadedBy", "name");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      taskTitle: task.title,
      attachments: task.attachments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id/attachments/:attachmentId - Delete task attachment
router.delete("/:id/attachments/:attachmentId", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Delete from Cloudinary
    if (attachment.cloudinaryId) {
      await deleteFromCloudinary(attachment.cloudinaryId);
    }

    // Remove from database
    attachment.deleteOne();
    await task.save();

    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
