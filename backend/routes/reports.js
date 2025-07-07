const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Task = require("../models/Task");
const Lead = require("../models/Lead");
const Staff = require("../models/Staff");
const Meeting = require("../models/Meeting");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

// GET /api/reports/dashboard - Executive dashboard
router.get("/dashboard", auth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dateFilter = {};

    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Client metrics
    const totalClients = await Client.countDocuments({
      isActive: true,
      ...dateFilter,
    });
    const newClientsThisMonth = await Client.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    const clientsByType = await Client.aggregate([
      { $match: { isActive: true, ...dateFilter } },
      { $group: { _id: "$businessType", count: { $sum: 1 } } },
    ]);

    const onboardingProgress = await Client.aggregate([
      { $match: { isActive: true, ...dateFilter } },
      { $group: { _id: "$onboardingStatus", count: { $sum: 1 } } },
    ]);

    // Revenue metrics
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: "paid", ...dateFilter } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const monthlyRecurringRevenue = await Client.aggregate([
      {
        $match: {
          isActive: true,
          "contractDetails.status": "signed",
        },
      },
      { $group: { _id: null, total: { $sum: "$contractDetails.monthlyFee" } } },
    ]);

    // Task completion metrics
    const taskMetrics = await Task.aggregate([
      { $match: { isArchived: false, ...dateFilter } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Sales pipeline
    const leadMetrics = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$leadStatus",
          count: { $sum: 1 },
          value: { $sum: "$estimatedValue" },
        },
      },
    ]);

    // Staff metrics
    const activeStaff = await Staff.countDocuments({ status: "active" });
    const staffUtilization = await Staff.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "clients",
          localField: "assignedClient",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: [{ $size: "$client" }, 0] },
              "assigned",
              "unassigned",
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Visit analytics
    const visitStats = await Client.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$visitLogs" },
      {
        $match: {
          "visitLogs.date": dateFilter.createdAt || { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$visitLogs.date" },
            year: { $year: "$visitLogs.date" },
          },
          totalVisits: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Satisfaction metrics
    const satisfactionStats = await Client.aggregate([
      {
        $match: {
          isActive: true,
          "satisfaction.rating": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$satisfaction.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    res.json({
      clientMetrics: {
        total: totalClients,
        newThisMonth: newClientsThisMonth,
        byType: clientsByType,
        onboardingProgress,
      },
      revenueMetrics: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRecurringRevenue: monthlyRecurringRevenue[0]?.total || 0,
      },
      taskMetrics,
      leadMetrics,
      staffMetrics: {
        active: activeStaff,
        utilization: staffUtilization,
      },
      visitStats,
      satisfactionStats: satisfactionStats[0] || {
        avgRating: 0,
        totalRatings: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/client-performance - Client performance report
router.get("/client-performance", auth, async (req, res) => {
  try {
    const { clientId, dateFrom, dateTo } = req.query;

    const filter = clientId ? { _id: clientId } : { isActive: true };

    const clientPerformance = await Client.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "client",
          as: "tasks",
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "client",
          as: "invoices",
        },
      },
      {
        $project: {
          businessName: 1,
          businessType: 1,
          onboardingStatus: 1,
          satisfaction: 1,
          visitLogs: 1,
          kpis: 1,
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                cond: { $eq: ["$$this.status", "completed"] },
              },
            },
          },
          totalInvoiced: {
            $sum: {
              $map: {
                input: "$invoices",
                as: "invoice",
                in: "$$invoice.totalAmount",
              },
            },
          },
          totalPaid: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$invoices",
                    cond: { $eq: ["$$this.status", "paid"] },
                  },
                },
                as: "invoice",
                in: "$$invoice.totalAmount",
              },
            },
          },
          monthlyVisits: { $size: "$visitLogs" },
        },
      },
    ]);

    res.json(clientPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/staff-performance - Staff performance report
router.get("/staff-performance", auth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const staffPerformance = await Staff.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          as: "tasks",
        },
      },
      {
        $project: {
          personalInfo: 1,
          employmentDetails: 1,
          assignedClient: 1,
          performance: 1,
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                cond: { $eq: ["$$this.status", "completed"] },
              },
            },
          },
          averageAttendance: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: "$attendance",
                    cond: { $eq: ["$$this.status", "present"] },
                  },
                },
                as: "att",
                in: 1,
              },
            },
          },
        },
      },
    ]);

    res.json(staffPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/sales-pipeline - Sales pipeline report
router.get("/sales-pipeline", auth, async (req, res) => {
  try {
    const { assignedTo, dateFrom, dateTo } = req.query;

    const filter = {};
    if (assignedTo) filter.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const pipelineReport = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$leadStatus",
          count: { $sum: 1 },
          totalValue: { $sum: "$estimatedValue" },
          avgProbability: { $avg: "$probability" },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Conversion funnel
    const conversionFunnel = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          new: { $sum: { $cond: [{ $eq: ["$leadStatus", "new"] }, 1, 0] } },
          contacted: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "contacted"] }, 1, 0] },
          },
          qualified: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "qualified"] }, 1, 0] },
          },
          proposal: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "proposal-sent"] }, 1, 0] },
          },
          negotiation: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "negotiation"] }, 1, 0] },
          },
          won: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "closed-won"] }, 1, 0] },
          },
          lost: {
            $sum: { $cond: [{ $eq: ["$leadStatus", "closed-lost"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      pipelineByStatus: pipelineReport,
      conversionFunnel: conversionFunnel[0] || {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/financial - Financial report
router.get("/financial", auth, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.issueDate = {};
      if (dateFrom) dateFilter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.issueDate.$lte = new Date(dateTo);
    }

    // Revenue analysis
    const revenueAnalysis = await Invoice.aggregate([
      { $match: { status: "paid", ...dateFilter } },
      {
        $group: {
          _id: {
            month: { $month: "$issueDate" },
            year: { $year: "$issueDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Outstanding receivables
    const receivables = await Invoice.aggregate([
      {
        $match: {
          status: { $nin: ["paid", "cancelled"] },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$status",
          totalAmount: {
            $sum: { $subtract: ["$totalAmount", "$paymentDetails.paidAmount"] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Payment methods analysis
    const paymentMethods = await Invoice.aggregate([
      { $match: { status: "paid", ...dateFilter } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      revenueAnalysis,
      receivables,
      paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
