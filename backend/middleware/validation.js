const Joi = require("joi");

// Client validation schemas
const clientSchema = Joi.object({
  businessName: Joi.string().required().trim().min(2).max(100),
  businessType: Joi.string()
    .valid("salon", "barbershop", "spa", "other")
    .required(),
  contactPerson: Joi.object({
    name: Joi.string().required().trim().min(2).max(50),
    phone: Joi.string()
      .required()
      .pattern(/^[0-9+\-\s()]+$/),
    email: Joi.string().email().required(),
    position: Joi.string().optional().max(50),
  }).required(),
  address: Joi.object({
    street: Joi.string().optional().max(100),
    city: Joi.string().optional().max(50),
    state: Joi.string().optional().max(50),
    zipCode: Joi.string().optional().max(20),
    country: Joi.string().optional().max(50),
  }).optional(),
  servicePackages: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().max(500),
        price: Joi.number().positive().optional(),
        duration: Joi.string().optional().max(50),
      })
    )
    .optional(),
  contractDetails: Joi.object({
    startDate: Joi.date().optional(),
    duration: Joi.string().optional().max(50),
    monthlyFee: Joi.number().positive().optional(),
    setupFee: Joi.number().positive().optional(),
    status: Joi.string().valid("draft", "signed", "expired").optional(),
  }).optional(),
  referralSource: Joi.string()
    .valid(
      "walk-in",
      "online",
      "referral",
      "social-media",
      "partnership",
      "other"
    )
    .optional(),
});

// Task validation schemas
const taskSchema = Joi.object({
  title: Joi.string().required().trim().min(3).max(200),
  description: Joi.string().optional().max(1000),
  type: Joi.string()
    .valid(
      "onboarding",
      "client-management",
      "sales",
      "hr",
      "marketing",
      "finance",
      "operations",
      "general"
    )
    .required(),
  category: Joi.string()
    .valid(
      "checklist-item",
      "follow-up",
      "meeting",
      "document-upload",
      "media-content",
      "visit-log",
      "assessment"
    )
    .optional(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  client: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  dueDate: Joi.date().optional(),
  estimatedHours: Joi.number().positive().optional(),
  checklist: Joi.array()
    .items(
      Joi.object({
        item: Joi.string().required().max(200),
        completed: Joi.boolean().optional(),
        notes: Joi.string().optional().max(500),
      })
    )
    .optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  location: Joi.string().optional().max(100),
});

// Staff validation schemas
const staffSchema = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().required().trim().min(2).max(50),
    lastName: Joi.string().required().trim().min(2).max(50),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .required()
      .pattern(/^[0-9+\-\s()]+$/),
    nationalId: Joi.string().optional().max(20),
    dateOfBirth: Joi.date().optional(),
    address: Joi.object({
      street: Joi.string().optional().max(100),
      city: Joi.string().optional().max(50),
      state: Joi.string().optional().max(50),
      zipCode: Joi.string().optional().max(20),
    }).optional(),
  }).required(),
  employmentDetails: Joi.object({
    position: Joi.string()
      .valid(
        "receptionist",
        "stylist",
        "manager",
        "cleaner",
        "security",
        "other"
      )
      .required(),
    department: Joi.string().optional().max(50),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    salary: Joi.number().positive().optional(),
    employmentType: Joi.string()
      .valid("full-time", "part-time", "contract", "intern")
      .optional(),
  }).required(),
  assignedClient: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  skills: Joi.array().items(Joi.string().max(50)).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().optional().max(50),
    relationship: Joi.string().optional().max(30),
    phone: Joi.string()
      .optional()
      .pattern(/^[0-9+\-\s()]+$/),
  }).optional(),
});

// Lead validation schemas
const leadSchema = Joi.object({
  businessName: Joi.string().required().trim().min(2).max(100),
  businessType: Joi.string()
    .valid("salon", "barbershop", "spa", "other")
    .optional(),
  contactPerson: Joi.object({
    name: Joi.string().required().trim().min(2).max(50),
    phone: Joi.string()
      .required()
      .pattern(/^[0-9+\-\s()]+$/),
    email: Joi.string().email().required(),
    position: Joi.string().optional().max(50),
  }).required(),
  leadSource: Joi.string()
    .valid(
      "website",
      "referral",
      "cold-call",
      "social-media",
      "event",
      "walk-in",
      "other"
    )
    .required(),
  estimatedValue: Joi.number().positive().optional(),
  probability: Joi.number().min(0).max(100).optional(),
  expectedCloseDate: Joi.date().optional(),
  interestLevel: Joi.string().valid("low", "medium", "high").optional(),
  notes: Joi.string().optional().max(1000),
  requirements: Joi.object({
    services: Joi.array().items(Joi.string().max(100)).optional(),
    budget: Joi.object({
      min: Joi.number().positive().optional(),
      max: Joi.number().positive().optional(),
    }).optional(),
    timeline: Joi.string().optional().max(100),
    decisionMakers: Joi.array().items(Joi.string().max(100)).optional(),
  }).optional(),
  competitors: Joi.array().items(Joi.string().max(100)).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
});

// Meeting validation schemas
const meetingSchema = Joi.object({
  title: Joi.string().required().trim().min(3).max(200),
  description: Joi.string().optional().max(1000),
  type: Joi.string()
    .valid(
      "consultation",
      "follow-up",
      "review",
      "training",
      "team-meeting",
      "client-meeting",
      "other"
    )
    .required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref("startDate")),
  location: Joi.string().optional().max(200),
  isVirtual: Joi.boolean().optional(),
  meetingLink: Joi.string().uri().optional(),
  attendees: Joi.array()
    .items(
      Joi.object({
        user: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        role: Joi.string().valid("required", "optional").optional(),
      })
    )
    .optional(),
  client: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  agenda: Joi.array().items(Joi.string().max(200)).optional(),
  reminders: Joi.array()
    .items(
      Joi.object({
        time: Joi.number().valid(5, 15, 30, 60, 1440).required(),
      })
    )
    .optional(),
  recurrence: Joi.object({
    isRecurring: Joi.boolean().optional(),
    frequency: Joi.string().valid("daily", "weekly", "monthly").optional(),
    endDate: Joi.date().optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
});

// Invoice validation schemas
const invoiceSchema = Joi.object({
  client: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  dueDate: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().required().max(200),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().positive().required(),
        total: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
  subtotal: Joi.number().positive().required(),
  tax: Joi.object({
    rate: Joi.number().min(0).max(100).optional(),
    amount: Joi.number().min(0).optional(),
  }).optional(),
  discount: Joi.object({
    type: Joi.string().valid("percentage", "fixed").optional(),
    value: Joi.number().min(0).optional(),
    amount: Joi.number().min(0).optional(),
  }).optional(),
  totalAmount: Joi.number().positive().required(),
  currency: Joi.string().length(3).optional(),
  paymentTerms: Joi.string()
    .valid("net-7", "net-15", "net-30", "net-60", "immediate")
    .optional(),
  notes: Joi.string().optional().max(500),
});

// Middleware function to validate request body
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    next();
  };
};

module.exports = {
  validate,
  schemas: {
    client: clientSchema,
    task: taskSchema,
    staff: staffSchema,
    lead: leadSchema,
    meeting: meetingSchema,
    invoice: invoiceSchema,
  },
};
