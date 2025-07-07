const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
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
        "consultation",
        "follow-up",
        "review",
        "training",
        "team-meeting",
        "client-meeting",
        "other",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: String,
    isVirtual: { type: Boolean, default: false },
    meetingLink: String,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["invited", "accepted", "declined", "tentative"],
          default: "invited",
        },
        role: { type: String, enum: ["required", "optional"] },
      },
    ],
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    agenda: [String],
    minutes: {
      keyPoints: [String],
      decisions: [String],
      actionItems: [
        {
          task: String,
          assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          dueDate: Date,
          status: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
          },
        },
      ],
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    reminders: [
      {
        time: { type: Number, enum: [5, 15, 30, 60, 1440] }, // minutes before meeting
        sent: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    recurrence: {
      isRecurring: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
      endDate: Date,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
meetingSchema.index({ startDate: 1, organizer: 1 });
meetingSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Meeting", meetingSchema);
