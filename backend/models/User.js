const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "management", "hr", "sales", "director", "client"],
      default: "sales",
    },
    userType: {
      type: String,
      enum: ["staff", "client"],
      default: "staff",
    },
    department: {
      type: String,
      enum: ["management", "hr", "sales", "admin", "operations", "finance"],
    },
    permissions: [
      {
        module: {
          type: String,
          enum: [
            "dashboard",
            "clients",
            "tasks",
            "staff",
            "leads",
            "meetings",
            "invoices",
            "reports",
            "settings",
            "analytics",
            "documents",
          ],
        },
        actions: [
          {
            type: String,
            enum: [
              "create",
              "read",
              "update",
              "delete",
              "approve",
              "assign",
              "share",
            ],
          },
        ],
        level: {
          type: String,
          enum: ["none", "view", "edit", "full"],
          default: "view",
        },
      },
    ],
    avatar: String,
    phone: String,
    position: String,
    managedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    // For client users - link to their client record
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    // For staff users - additional info
    employeeId: String,
    hireDate: Date,
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      timezone: { type: String, default: "Africa/Nairobi" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user has permission for a specific module and action
userSchema.methods.hasPermission = function (module, action) {
  // Admin has all permissions
  if (this.role === "admin") return true;

  // Client users can only access their own data
  if (this.userType === "client") {
    return module === "clients" && ["read"].includes(action);
  }

  // Check specific permissions
  const permission = this.permissions.find((p) => p.module === module);
  if (!permission) return false;

  return permission.actions.includes(action) || permission.level === "full";
};

// Get user's accessible modules
userSchema.methods.getAccessibleModules = function () {
  if (this.role === "admin") {
    return [
      "dashboard",
      "clients",
      "tasks",
      "staff",
      "leads",
      "meetings",
      "invoices",
      "reports",
      "settings",
      "analytics",
      "documents",
    ];
  }

  if (this.userType === "client") {
    return ["dashboard", "clients", "documents"];
  }

  return this.permissions
    .filter((p) => p.level !== "none")
    .map((p) => p.module);
};

module.exports = mongoose.model("User", userSchema);
