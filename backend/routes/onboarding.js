const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");
const Onboarding = require("../models/Onboarding");

// GET /api/onboarding/smart-reminders - Generate smart reminders (must come before /:id)
router.get("/smart-reminders", auth, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find onboardings that need attention
    const onboardings = await Onboarding.find({
      status: { $in: ["pending", "in-progress"] },
      $or: [
        { estimatedCompletionDate: { $lte: threeDaysFromNow } },
        {
          updatedAt: {
            $lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    }).populate("assignedTo createdBy");

    const reminders = [];

    for (const onboarding of onboardings) {
      const nextAction = onboarding.getNextAction();

      if (nextAction.stage !== "completed") {
        let priority = "medium";
        let reminderType = "follow-up";

        // Determine priority based on days remaining
        if (onboarding.daysRemaining < 0) {
          priority = "urgent";
          reminderType = "overdue";
        } else if (onboarding.daysRemaining <= 3) {
          priority = "high";
          reminderType = "deadline";
        }

        reminders.push({
          _id: `smart-${onboarding._id}-${nextAction.stage}`,
          title: nextAction.action,
          description: `${onboarding.businessInfo.companyName} - ${nextAction.stage}`,
          type: reminderType,
          priority: priority,
          dueDate:
            onboarding.estimatedCompletionDate ||
            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          onboardingId: onboarding._id,
          companyName: onboarding.businessInfo.companyName,
          stage: nextAction.stage,
          isCompleted: false,
          isSmartGenerated: true,
          createdAt: now,
        });
      }
    }

    res.json(reminders);
  } catch (error) {
    console.error("Error generating smart reminders:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/onboarding/stats - Get onboarding statistics (must come before /:id)
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Onboarding.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching onboarding stats:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/onboarding - Get all onboarding records
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      businessType,
      assignedTo,
      search,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (businessType) filter["businessInfo.businessType"] = businessType;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { "businessInfo.companyName": { $regex: search, $options: "i" } },
        {
          "businessInfo.contactPersonTitle": { $regex: search, $options: "i" },
        },
        { "businessInfo.emailAddress": { $regex: search, $options: "i" } },
      ];
    }

    const onboardingRecords = await Onboarding.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Onboarding.countDocuments(filter);

    res.json({
      onboardingRecords,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching onboarding records:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/onboarding/:id - Get specific onboarding record
router.get("/:id", auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email");

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    res.json(onboarding);
  } catch (error) {
    console.error("Error fetching onboarding record:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/onboarding - Create new onboarding record
router.post("/", auth, async (req, res) => {
  try {
    const onboardingData = {
      ...req.body,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id,
    };

    const onboarding = new Onboarding(onboardingData);
    await onboarding.save();

    await onboarding.populate("createdBy", "name email");
    await onboarding.populate("lastUpdatedBy", "name email");

    res.status(201).json(onboarding);
  } catch (error) {
    console.error("Error creating onboarding record:", error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/onboarding/:id - Update onboarding record
router.put("/:id", auth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.id,
    };

    const onboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email");

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    res.json(onboarding);
  } catch (error) {
    console.error("Error updating onboarding record:", error);
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/onboarding/:id/stage - Update specific stage of onboarding record
router.patch("/:id/stage", auth, async (req, res) => {
  try {
    const { stage, data } = req.body;

    if (!stage || !data) {
      return res.status(400).json({ message: "Stage and data are required" });
    }

    const validStages = [
      "businessInfo",
      "preOnboarding",
      "needsAssessment",
      "serviceProposal",
      "followUp",
      "feedback",
    ];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage specified" });
    }

    const updateData = {
      [`${stage}`]: data,
      lastUpdatedBy: req.user.id,
    };

    const onboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email");

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    res.json(onboarding);
  } catch (error) {
    console.error("Error updating onboarding stage:", error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/onboarding/:id - Delete onboarding record
router.delete("/:id", auth, async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndDelete(req.params.id);

    if (!onboarding) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }

    res.json({ message: "Onboarding record deleted successfully" });
  } catch (error) {
    console.error("Error deleting onboarding record:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
