const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    discount: {
      type: { type: String, enum: ["percentage", "fixed"] },
      value: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "KES",
    },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    paymentTerms: {
      type: String,
      enum: ["net-7", "net-15", "net-30", "net-60", "immediate"],
      default: "net-30",
    },
    paymentMethod: {
      type: String,
      enum: ["bank-transfer", "mpesa", "cash", "cheque", "card"],
    },
    paymentDetails: {
      paidAmount: { type: Number, default: 0 },
      paidDate: Date,
      transactionReference: String,
      paymentNotes: String,
    },
    reminders: [
      {
        sentDate: { type: Date, default: Date.now },
        type: { type: String, enum: ["first", "second", "final", "overdue"] },
        method: { type: String, enum: ["email", "sms", "whatsapp"] },
      },
    ],
    notes: String,
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate invoice number
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(4, "0")}`;
  }
  next();
});

// Index for efficient searching
invoiceSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
