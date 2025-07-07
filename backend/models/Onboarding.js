const mongoose = require("mongoose");

// Define the Onboarding schema
const onboardingSchema = new mongoose.Schema(
  {
    // Business Information
    businessInfo: {
      companyName: { type: String, required: true },
      businessType: { type: String, required: true },
      physicalAddress: { type: String, required: true },
      poBox: String,
      contactPersonTitle: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      emailAddress: { type: String, required: true },
      websiteSocialMedia: String,
      numberOfEmployees: { type: Number, required: true },
      operatingHours: { type: String, required: true },
    },

    // Pre-onboarding checklist
    preOnboarding: {
      initialContactChecklist: [String],
      meetingPrepChecklist: [String],
      initialContactDate: Date,
      firstMeetingDate: Date,
    },

    // Needs Assessment
    needsAssessment: {
      currentArrangements: String,
      currentProvider: String,
      employeeGroomingHandling: String,
      satisfactionWithCurrent: String,
      servicesNeeded: [String],
      otherServices: String,
      preferredDays: [String],
      preferredTimeSlots: [String],
      advanceNotice: String,
      monthlyBudget: String,
      paymentMethod: String,
      paymentAuthorizer: String,
    },

    // Service Proposal
    serviceProposal: {
      recommendedPackage: String,
      proposedFrequency: String,
      proposedServices: String,
      serviceDuration: String,
      serviceLocation: String,
      proposedPricing: String,
    },

    // Follow-up and Contract
    followUp: {
      immediateActions: [String],
      proposalSubmission: [String],
      proposalSubmissionDate: Date,
      followUpDay3: Date,
      followUpDay7: Date,
      contractStatus: String,
    },

    // Feedback and Review
    feedback: {
      satisfactionRating: Number,
      wouldRecommend: String,
      mostLiked: String,
      improvementAreas: String,
      additionalComments: String,
      internalReview: [String],
      assignedStaffMember: String,
      completionDate: Date,
      meetingNotes: String,
      nextSteps: String,
    },

    // Metadata
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled", "overdue"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    stageDeadlines: {
      businessInfo: Date,
      preOnboarding: Date,
      needsAssessment: Date,
      serviceProposal: Date,
      followUp: Date,
      feedback: Date,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: Date,
    tags: [String], // For categorization and filtering
    notes: [
      {
        content: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate progress based on completed steps with weighted scoring
onboardingSchema.methods.calculateProgress = function () {
  let totalScore = 0;
  const maxScore = 100;

  // Business Info (20 points) - Basic requirement
  if (this.businessInfo && this.businessInfo.companyName) {
    let businessScore = 10; // Base score
    if (this.businessInfo.phoneNumber) businessScore += 3;
    if (this.businessInfo.emailAddress) businessScore += 3;
    if (this.businessInfo.physicalAddress) businessScore += 2;
    if (this.businessInfo.numberOfEmployees) businessScore += 2;
    totalScore += businessScore;
  }

  // Pre-onboarding (15 points) - Preparation phase
  if (this.preOnboarding) {
    let preScore = 0;
    if (this.preOnboarding.initialContactChecklist?.length > 0) preScore += 8;
    if (this.preOnboarding.meetingPrepChecklist?.length > 0) preScore += 4;
    if (this.preOnboarding.initialContactDate) preScore += 2;
    if (this.preOnboarding.firstMeetingDate) preScore += 1;
    totalScore += preScore;
  }

  // Needs Assessment (20 points) - Critical discovery
  if (this.needsAssessment) {
    let needsScore = 0;
    if (this.needsAssessment.currentArrangements) needsScore += 5;
    if (this.needsAssessment.servicesNeeded?.length > 0) needsScore += 8;
    if (this.needsAssessment.preferredDays?.length > 0) needsScore += 3;
    if (this.needsAssessment.monthlyBudget) needsScore += 4;
    totalScore += needsScore;
  }

  // Service Proposal (20 points) - Solution design
  if (this.serviceProposal) {
    let proposalScore = 0;
    if (this.serviceProposal.recommendedPackage) proposalScore += 8;
    if (this.serviceProposal.proposedFrequency) proposalScore += 4;
    if (this.serviceProposal.serviceDuration) proposalScore += 4;
    if (this.serviceProposal.proposedPricing) proposalScore += 4;
    totalScore += proposalScore;
  }

  // Follow-up (15 points) - Implementation
  if (this.followUp) {
    let followScore = 0;
    if (this.followUp.contractStatus) followScore += 8;
    if (this.followUp.immediateActions?.length > 0) followScore += 4;
    if (this.followUp.proposalSubmissionDate) followScore += 3;
    totalScore += followScore;
  }

  // Feedback (10 points) - Completion
  if (this.feedback) {
    let feedbackScore = 0;
    if (this.feedback.satisfactionRating) feedbackScore += 5;
    if (this.feedback.assignedStaffMember) feedbackScore += 3;
    if (this.feedback.completionDate) feedbackScore += 2;
    totalScore += feedbackScore;
  }

  return Math.min(100, Math.round(totalScore));
};

// Get detailed progress breakdown for each stage
onboardingSchema.methods.getStageProgress = function () {
  return {
    businessInfo: this.businessInfo?.companyName ? 100 : 0,
    preOnboarding:
      this.preOnboarding?.initialContactChecklist?.length > 0 ? 100 : 0,
    needsAssessment: this.needsAssessment?.currentArrangements ? 100 : 0,
    serviceProposal: this.serviceProposal?.recommendedPackage ? 100 : 0,
    followUp: this.followUp?.contractStatus ? 100 : 0,
    feedback: this.feedback?.satisfactionRating ? 100 : 0,
  };
};

// Get next recommended action
onboardingSchema.methods.getNextAction = function () {
  if (!this.businessInfo?.companyName) {
    return {
      stage: "businessInfo",
      action: "Complete business information",
      priority: "high",
    };
  }
  if (!this.preOnboarding?.initialContactChecklist?.length) {
    return {
      stage: "preOnboarding",
      action: "Schedule initial contact",
      priority: "high",
    };
  }
  if (!this.needsAssessment?.currentArrangements) {
    return {
      stage: "needsAssessment",
      action: "Conduct needs assessment",
      priority: "medium",
    };
  }
  if (!this.serviceProposal?.recommendedPackage) {
    return {
      stage: "serviceProposal",
      action: "Prepare service proposal",
      priority: "medium",
    };
  }
  if (!this.followUp?.contractStatus) {
    return {
      stage: "followUp",
      action: "Follow up on proposal",
      priority: "high",
    };
  }
  if (!this.feedback?.satisfactionRating) {
    return { stage: "feedback", action: "Collect feedback", priority: "low" };
  }
  return {
    stage: "completed",
    action: "Onboarding complete",
    priority: "none",
  };
};

// Update progress and status before saving
onboardingSchema.pre("save", function (next) {
  this.progress = this.calculateProgress();

  // Auto-update status based on progress and deadlines
  if (this.progress === 100) {
    this.status = "completed";
    this.actualCompletionDate = new Date();
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else if (this.progress > 0 && this.progress < 100) {
    // Check if overdue
    const now = new Date();
    if (this.estimatedCompletionDate && now > this.estimatedCompletionDate) {
      this.status = "overdue";
    } else {
      this.status = "in-progress";
    }
  }

  // Auto-set estimated completion date if not set (30 days from creation for new records)
  if (this.isNew && !this.estimatedCompletionDate) {
    this.estimatedCompletionDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );
  }

  next();
});

// Virtual field for days remaining
onboardingSchema.virtual("daysRemaining").get(function () {
  if (!this.estimatedCompletionDate || this.status === "completed") return null;
  const now = new Date();
  const diffTime = this.estimatedCompletionDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual field for urgency level
onboardingSchema.virtual("urgencyLevel").get(function () {
  const daysRemaining = this.daysRemaining;
  if (daysRemaining === null) return "none";
  if (daysRemaining < 0) return "overdue";
  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "high";
  if (daysRemaining <= 14) return "medium";
  return "low";
});

module.exports = mongoose.model("Onboarding", onboardingSchema);
