const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const auth = require("../middleware/auth");

// GET /api/meetings - Get all meetings with filtering
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, date, client } = req.query;

    const filter = {};

    // Role-based filtering - show meetings where user is organizer or attendee
    filter.$or = [
      { organizer: req.user.id },
      { "attendees.user": req.user.id },
    ];

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (date) {
      const searchDate = new Date(date);
      filter.startDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }

    const meetings = await Meeting.find(filter)
      .populate("organizer", "name email")
      .populate("attendees.user", "name email")
      .populate("client", "businessName contactPerson")
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(filter);

    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/meetings - Create new meeting
router.post("/", auth, async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      organizer: req.user.id,
    };

    const meeting = new Meeting(meetingData);
    await meeting.save();

    await meeting.populate("organizer", "name email");
    await meeting.populate("attendees.user", "name email");
    await meeting.populate("client", "businessName");

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/meetings/:id - Get specific meeting
router.get("/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("organizer", "name email phone")
      .populate("attendees.user", "name email phone")
      .populate("client", "businessName contactPerson")
      .populate("minutes.actionItems.assignedTo", "name email")
      .populate("minutes.recordedBy", "name");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check authorization
    const isAuthorized =
      meeting.organizer._id.toString() === req.user.id ||
      meeting.attendees.some((att) => att.user._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/meetings/:id - Update meeting
router.put("/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check authorization - only organizer can update
    if (meeting.organizer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only organizer can update meeting" });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("organizer", "name email")
      .populate("attendees.user", "name email");

    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/meetings/:id/attendance - Update attendance status
router.put("/:id/attendance", auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted', 'declined', 'tentative'

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const attendee = meeting.attendees.find(
      (att) => att.user.toString() === req.user.id
    );

    if (!attendee) {
      return res
        .status(404)
        .json({ message: "You are not invited to this meeting" });
    }

    attendee.status = status;
    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/meetings/:id/minutes - Add/update meeting minutes
router.put("/:id/minutes", auth, async (req, res) => {
  try {
    const { keyPoints, decisions, actionItems } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      {
        "minutes.keyPoints": keyPoints,
        "minutes.decisions": decisions,
        "minutes.actionItems": actionItems,
        "minutes.recordedBy": req.user.id,
      },
      { new: true }
    )
      .populate("minutes.actionItems.assignedTo", "name email")
      .populate("minutes.recordedBy", "name");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/meetings/calendar/:date - Get meetings for specific date
router.get("/calendar/:date", auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const meetings = await Meeting.find({
      $or: [{ organizer: req.user.id }, { "attendees.user": req.user.id }],
      startDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("organizer", "name")
      .populate("client", "businessName")
      .sort({ startDate: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/meetings/upcoming - Get upcoming meetings
router.get("/upcoming", auth, async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Meeting.find({
      $or: [{ organizer: req.user.id }, { "attendees.user": req.user.id }],
      startDate: { $gte: now },
      status: { $in: ["scheduled", "in-progress"] },
    })
      .populate("organizer", "name")
      .populate("client", "businessName")
      .sort({ startDate: 1 })
      .limit(10);

    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
