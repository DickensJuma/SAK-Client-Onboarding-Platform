const express = require("express");
const User = require("../models/User");
const Client = require("../models/Client");
const auth = require("../middleware/auth");
const { authorize, checkPermission } = require("../middleware/rbac");

const router = express.Router();

// Get all users (staff and clients) - Admin only
router.get("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { userType, role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (userType) query.userType = userType;
    if (role) query.role = role;

    const users = await User.find(query)
      .populate("clientId", "businessName contactPerson")
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID
router.get("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("clientId", "businessName contactPerson")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role and permissions - Admin only
router.put("/:id/permissions", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { role, permissions, userType, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (role) user.role = role;
    if (userType) user.userType = userType;
    if (permissions) user.permissions = permissions;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(req.params.id)
      .populate("clientId", "businessName contactPerson")
      .select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user permissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create client user account
router.post("/client-account", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { clientId, email, password, name } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create client user
    const clientUser = new User({
      name: name || client.contactPerson?.name,
      email,
      password,
      role: "client",
      userType: "client",
      clientId: clientId,
      permissions: [
        {
          module: "dashboard",
          actions: ["read"],
          level: "view",
        },
        {
          module: "clients",
          actions: ["read"],
          level: "view",
        },
        {
          module: "documents",
          actions: ["read", "create"],
          level: "edit",
        },
      ],
    });

    await clientUser.save();

    const newUser = await User.findById(clientUser._id)
      .populate("clientId", "businessName contactPerson")
      .select("-password");

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating client account:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available permissions and modules
router.get("/config/permissions", auth, authorize(["admin"]), (req, res) => {
  const modules = [
    {
      value: "dashboard",
      label: "Dashboard",
      description: "Main dashboard view",
    },
    { value: "clients", label: "Clients", description: "Client management" },
    { value: "tasks", label: "Tasks", description: "Task management" },
    { value: "staff", label: "Staff", description: "Staff management" },
    { value: "leads", label: "Leads", description: "Lead management" },
    { value: "meetings", label: "Meetings", description: "Meeting management" },
    { value: "invoices", label: "Invoices", description: "Invoice management" },
    {
      value: "reports",
      label: "Reports",
      description: "Reports and analytics",
    },
    { value: "settings", label: "Settings", description: "System settings" },
    {
      value: "analytics",
      label: "Analytics",
      description: "Advanced analytics",
    },
    {
      value: "documents",
      label: "Documents",
      description: "Document management",
    },
  ];

  const actions = [
    { value: "create", label: "Create", description: "Create new records" },
    { value: "read", label: "Read", description: "View records" },
    { value: "update", label: "Update", description: "Edit records" },
    { value: "delete", label: "Delete", description: "Delete records" },
    { value: "approve", label: "Approve", description: "Approve requests" },
    { value: "assign", label: "Assign", description: "Assign tasks/clients" },
    { value: "share", label: "Share", description: "Share documents" },
  ];

  const levels = [
    { value: "none", label: "No Access", description: "No access to module" },
    { value: "view", label: "View Only", description: "Can only view data" },
    { value: "edit", label: "Edit", description: "Can view and edit data" },
    {
      value: "full",
      label: "Full Access",
      description: "Complete access to module",
    },
  ];

  const roles = [
    {
      value: "admin",
      label: "Administrator",
      description: "Full system access",
    },
    {
      value: "management",
      label: "Management",
      description: "Management level access",
    },
    {
      value: "hr",
      label: "Human Resources",
      description: "HR department access",
    },
    { value: "sales", label: "Sales", description: "Sales team access" },
    {
      value: "director",
      label: "Director",
      description: "Director level access",
    },
    { value: "client", label: "Client", description: "Client portal access" },
  ];

  res.json({ modules, actions, levels, roles });
});

// Get user's own profile and permissions
router.get("/profile/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("clientId", "businessName contactPerson")
      .select("-password");

    const accessibleModules = user.getAccessibleModules();

    res.json({
      user,
      accessibleModules,
      permissions: user.permissions,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
