const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ["salon", "barbershop", "spa", "other"],
      required: true,
    },
    logo: {
      url: String,
      publicId: String,
      uploadedAt: Date,
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
      country: { type: String, default: "Kenya" },
    },
    onboardingStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "on-hold"],
      default: "pending",
    },
    onboardingChecklist: {
      brandingMaterials: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
      wifiSetup: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
      staffHiring: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
      inventoryAssigned: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
      beveragesAvailable: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
      cleanlinessCheck: {
        completed: { type: Boolean, default: false },
        notes: String,
      },
    },
    servicePackages: [
      {
        name: String,
        description: String,
        price: Number,
        duration: String,
      },
    ],
    assignedSalesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contractDetails: {
      startDate: Date,
      duration: String,
      monthlyFee: Number,
      setupFee: Number,
      status: {
        type: String,
        enum: ["draft", "signed", "expired"],
        default: "draft",
      },
    },
    satisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      lastUpdated: Date,
    },
    referralSource: {
      type: String,
      enum: [
        "walk-in",
        "online",
        "referral",
        "social-media",
        "partnership",
        "other",
      ],
    },
    visitLogs: [
      {
        date: { type: Date, default: Date.now },
        visitType: {
          type: String,
          enum: ["consultation", "follow-up", "maintenance", "training"],
        },
        notes: String,
        visitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    documents: [
      {
        name: String,
        type: String,
        url: String,
        cloudinaryId: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        reviewNotes: String,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
        shares: [
          {
            sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            sharedAt: { type: Date, default: Date.now },
            message: String,
            recipients: [String],
          },
        ],
      },
    ],
    socialMedia: {
      facebook: String,
      instagram: String,
      tiktok: String,
      googleMyBusiness: String,
    },
    mediaContent: [
      {
        platform: {
          type: String,
          enum: ["instagram", "tiktok", "facebook", "google"],
        },
        content: String,
        mediaUrl: String,
        scheduledDate: Date,
        status: {
          type: String,
          enum: ["draft", "scheduled", "published"],
          default: "draft",
        },
        assignedInfluencer: String,
      },
    ],
    kpis: {
      walkIns: { type: Number, default: 0 },
      onlineBookings: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
      weeklyVisits: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
clientSchema.index({ businessName: "text", "contactPerson.name": "text" });

module.exports = mongoose.model("Client", clientSchema);
