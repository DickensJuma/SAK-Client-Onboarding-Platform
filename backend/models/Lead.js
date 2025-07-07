const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ["salon", "barbershop", "spa", "other"],
    },
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      position: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    leadSource: {
      type: String,
      enum: [
        "website",
        "referral",
        "cold-call",
        "social-media",
        "event",
        "walk-in",
        "other",
      ],
      required: true,
    },
    leadStatus: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal-sent",
        "negotiation",
        "closed-won",
        "closed-lost",
      ],
      default: "new",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    estimatedValue: Number,
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    expectedCloseDate: Date,
    lastContactDate: Date,
    nextFollowUpDate: Date,
    interestLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: String,
    interactions: [
      {
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["call", "email", "meeting", "proposal", "demo"],
        },
        notes: String,
        outcome: String,
        followUpRequired: Boolean,
        followUpDate: Date,
      },
    ],
    documents: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    requirements: {
      services: [String],
      budget: {
        min: Number,
        max: Number,
      },
      timeline: String,
      decisionMakers: [String],
    },
    competitors: [String],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
leadSchema.index({ businessName: "text", "contactPerson.name": "text" });
leadSchema.index({ leadStatus: 1, assignedTo: 1 });

module.exports = mongoose.model("Lead", leadSchema);
