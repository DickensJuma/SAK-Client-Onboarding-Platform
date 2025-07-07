const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

// Define a simple Reminder schema for general reminders
const reminderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ["follow-up", "meeting", "deadline", "review", "custom"],
      default: "custom",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    isSmartGenerated: { type: Boolean, default: false },
    onboardingId: { type: mongoose.Schema.Types.ObjectId, ref: "Onboarding" },
    companyName: String,
    stage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

// GET /api/reminders - Get all reminders for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const { status = "pending", limit = 50 } = req.query;

    const filter = { createdBy: req.user.id };

    if (status === "pending") {
      filter.isCompleted = false;
    } else if (status === "completed") {
      filter.isCompleted = true;
    }

    const reminders = await Reminder.find(filter)
      .populate("onboardingId", "businessInfo.companyName")
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reminders - Create a new reminder
router.post("/", auth, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      createdBy: req.user.id,
      isSmartGenerated: false,
    };

    const reminder = new Reminder(reminderData);
    await reminder.save();

    await reminder.populate("onboardingId", "businessInfo.companyName");

    res.status(201).json(reminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/reminders/:id/complete - Mark a reminder as completed
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      {
        isCompleted: true,
        completedAt: new Date(),
      },
      { new: true }
    ).populate("onboardingId", "businessInfo.companyName");

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json(reminder);
  } catch (error) {
    console.error("Error completing reminder:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/reminders/:id - Delete a reminder
router.delete("/:id", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reminders/stats - Get reminder statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user.id;

    const stats = await Reminder.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$isCompleted", false] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isCompleted", false] },
                    { $lt: ["$dueDate", now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          dueToday: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isCompleted", false] },
                    {
                      $and: [
                        {
                          $gte: [
                            "$dueDate",
                            new Date(now.setHours(0, 0, 0, 0)),
                          ],
                        },
                        {
                          $lt: [
                            "$dueDate",
                            new Date(now.setHours(23, 59, 59, 999)),
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      dueToday: 0,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching reminder stats:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
