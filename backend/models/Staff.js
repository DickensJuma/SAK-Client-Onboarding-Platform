const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      nationalId: String,
      dateOfBirth: Date,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
    employmentDetails: {
      employeeId: { type: String, unique: true },
      position: {
        type: String,
        enum: [
          "receptionist",
          "stylist",
          "manager",
          "cleaner",
          "security",
          "other",
        ],
        required: true,
      },
      department: String,
      startDate: { type: Date, required: true },
      endDate: Date,
      salary: Number,
      employmentType: {
        type: String,
        enum: ["full-time", "part-time", "contract", "intern"],
        default: "full-time",
      },
    },
    assignedClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    documents: [
      {
        type: {
          type: String,
          enum: ["id", "contract", "photo", "certificate", "other"],
        },
        name: String,
        url: String,
        cloudinaryId: String,
        uploadedAt: { type: Date, default: Date.now },
        reviewStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        reviewNotes: String,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: Date,
      },
    ],
    attendance: [
      {
        date: { type: Date, default: Date.now },
        clockIn: Date,
        clockOut: Date,
        hoursWorked: Number,
        status: {
          type: String,
          enum: ["present", "absent", "late", "half-day"],
          default: "present",
        },
      },
    ],
    performance: {
      lastReviewDate: Date,
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      goals: [String],
    },
    skills: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated", "on-leave"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient searching
staffSchema.index({
  "personalInfo.firstName": "text",
  "personalInfo.lastName": "text",
});

module.exports = mongoose.model("Staff", staffSchema);
