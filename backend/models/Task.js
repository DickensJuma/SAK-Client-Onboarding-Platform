const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "onboarding",
        "client-management",
        "sales",
        "hr",
        "marketing",
        "finance",
        "operations",
        "general",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "checklist-item",
        "follow-up",
        "meeting",
        "document-upload",
        "media-content",
        "visit-log",
        "assessment",
      ],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled", "overdue"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    dueDate: Date,
    completedAt: Date,
    estimatedHours: Number,
    actualHours: Number,
    checklist: [
      {
        item: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        notes: String,
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        cloudinaryId: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reminders: [
      {
        date: Date,
        message: String,
        sent: { type: Boolean, default: false },
      },
    ],
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "quarterly"],
      },
      nextDue: Date,
    },
    tags: [String],
    location: String,
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model("Task", taskSchema);
