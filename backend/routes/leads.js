const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

// GET /api/leads - Get all leads with filtering
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      assignedTo,
      search,
    } = req.query;

    const filter = {};

    // Role-based filtering
    if (req.user.role === "sales") {
      filter.assignedTo = req.user.id;
    }

    if (status) filter.leadStatus = status;
    if (source) filter.leadSource = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { "contactPerson.name": { $regex: search, $options: "i" } },
        { "contactPerson.email": { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leads - Create new lead
router.post("/", auth, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: req.user.role === "sales" ? req.user.id : req.body.assignedTo,
    };

    const lead = new Lead(leadData);
    await lead.save();

    await lead.populate("assignedTo", "name email");

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/leads/:id - Get specific lead
router.get("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedTo",
      "name email phone"
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check authorization
    if (
      req.user.role === "sales" &&
      lead.assignedTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/leads/:id - Update lead
router.put("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Check authorization
    if (
      req.user.role === "sales" &&
      lead.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/leads/:id/interactions - Add interaction
router.post("/:id/interactions", auth, async (req, res) => {
  try {
    const { type, notes, outcome, followUpRequired, followUpDate } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    lead.interactions.push({
      type,
      notes,
      outcome,
      followUpRequired,
      followUpDate,
    });

    // Update last contact date
    lead.lastContactDate = new Date();
    if (followUpRequired && followUpDate) {
      lead.nextFollowUpDate = followUpDate;
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/leads/:id/status - Update lead status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, probability } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        leadStatus: status,
        probability: probability || lead.probability,
      },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/leads/analytics/dashboard - Leads analytics
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    const filter = {};

    // Role-based filtering
    if (req.user.role === "sales") {
      filter.assignedTo = req.user.id;
    }

    const totalLeads = await Lead.countDocuments(filter);
    const qualifiedLeads = await Lead.countDocuments({
      ...filter,
      leadStatus: "qualified",
    });
    const closedWon = await Lead.countDocuments({
      ...filter,
      leadStatus: "closed-won",
    });
    const closedLost = await Lead.countDocuments({
      ...filter,
      leadStatus: "closed-lost",
    });

    const leadsByStatus = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: "$leadStatus", count: { $sum: 1 } } },
    ]);

    const leadsBySource = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: "$leadSource", count: { $sum: 1 } } },
    ]);

    const conversionRate =
      totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : 0;

    // Pipeline value
    const pipelineValue = await Lead.aggregate([
      {
        $match: {
          ...filter,
          leadStatus: { $nin: ["closed-won", "closed-lost"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
    ]);

    // Hot leads (high probability, follow-up needed)
    const hotLeads = await Lead.find({
      ...filter,
      probability: { $gte: 70 },
      leadStatus: { $nin: ["closed-won", "closed-lost"] },
    })
      .populate("assignedTo", "name")
      .sort({ probability: -1 })
      .limit(10);

    res.json({
      totalLeads,
      qualifiedLeads,
      closedWon,
      closedLost,
      conversionRate,
      leadsByStatus,
      leadsBySource,
      pipelineValue: pipelineValue[0]?.total || 0,
      hotLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leads/:id/convert - Convert lead to client
router.post("/:id/convert", auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const Client = require("../models/Client");

    // Create new client from lead data
    const clientData = {
      businessName: lead.businessName,
      businessType: lead.businessType,
      contactPerson: lead.contactPerson,
      address: lead.address,
      assignedSalesAgent: lead.assignedTo,
      referralSource: lead.leadSource === "referral" ? "referral" : "other",
      onboardingStatus: "pending",
    };

    const client = new Client(clientData);
    await client.save();

    // Update lead status
    lead.leadStatus = "closed-won";
    await lead.save();

    res.json({ client, message: "Lead converted to client successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
