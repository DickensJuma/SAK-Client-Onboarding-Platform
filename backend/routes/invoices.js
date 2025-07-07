const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

// GET /api/invoices - Get all invoices with filtering
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      client,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "items.description": { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(filter)
      .populate("client", "businessName contactPerson")
      .populate("issuedBy", "name email")
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(filter);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invoices - Create new invoice
router.post("/", auth, async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      issuedBy: req.user.id,
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    await invoice.populate("client", "businessName contactPerson");
    await invoice.populate("issuedBy", "name email");

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/invoices/:id - Get specific invoice
router.get("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("client", "businessName contactPerson address")
      .populate("issuedBy", "name email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/invoices/:id - Update invoice
router.put("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("client", "businessName contactPerson")
      .populate("issuedBy", "name email");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/invoices/:id/status - Update invoice status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("client", "businessName");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/invoices/:id/payment - Record payment
router.post("/:id/payment", auth, async (req, res) => {
  try {
    const { amount, method, transactionReference, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.paymentDetails.paidAmount += amount;
    invoice.paymentDetails.paidDate = new Date();
    invoice.paymentDetails.transactionReference = transactionReference;
    invoice.paymentDetails.paymentNotes = notes;
    invoice.paymentMethod = method;

    // Update status based on payment
    if (invoice.paymentDetails.paidAmount >= invoice.totalAmount) {
      invoice.status = "paid";
    }

    await invoice.save();

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/invoices/:id/reminder - Send payment reminder
router.post("/:id/reminder", auth, async (req, res) => {
  try {
    const { type, method } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.reminders.push({
      type,
      method,
      sentDate: new Date(),
    });

    await invoice.save();

    // Here you would integrate with email/SMS service
    // For now, we'll just return success

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/invoices/analytics/dashboard - Invoice analytics
router.get("/analytics/dashboard", auth, async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: "paid" });
    const overdueInvoices = await Invoice.countDocuments({
      status: { $nin: ["paid", "cancelled"] },
      dueDate: { $lt: new Date() },
    });

    // Revenue analytics
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          status: "paid",
          "paymentDetails.paidDate": {
            $gte: new Date(new Date().setDate(1)), // Start of current month
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const outstandingAmount = await Invoice.aggregate([
      {
        $match: {
          status: { $nin: ["paid", "cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $subtract: ["$totalAmount", "$paymentDetails.paidAmount"] },
          },
        },
      },
    ]);

    const invoicesByStatus = await Invoice.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Recent invoices
    const recentInvoices = await Invoice.find()
      .populate("client", "businessName")
      .sort({ issueDate: -1 })
      .limit(5);

    res.json({
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      collectionRate:
        totalInvoices > 0
          ? ((paidInvoices / totalInvoices) * 100).toFixed(1)
          : 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      outstandingAmount: outstandingAmount[0]?.total || 0,
      invoicesByStatus,
      recentInvoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invoices/overdue - Get overdue invoices
router.get("/overdue", auth, async (req, res) => {
  try {
    const overdueInvoices = await Invoice.find({
      status: { $nin: ["paid", "cancelled"] },
      dueDate: { $lt: new Date() },
    })
      .populate("client", "businessName contactPerson")
      .sort({ dueDate: 1 });

    res.json(overdueInvoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
