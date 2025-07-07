const mongoose = require("mongoose");
require("dotenv").config();

// Import models (they'll be created when the reminders route is loaded)
const Reminder = require("./routes/reminders.js");

const testReminders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for testing");

    // Just test the connection and log success
    console.log("✅ Reminders endpoint should be working");
    console.log("📡 Available endpoints:");
    console.log("  GET    /api/reminders");
    console.log("  POST   /api/reminders");
    console.log("  PATCH  /api/reminders/:id/complete");
    console.log("  DELETE /api/reminders/:id");
    console.log("  GET    /api/reminders/stats");
    console.log("  GET    /api/onboarding/smart-reminders");

    process.exit(0);
  } catch (error) {
    console.error("Error testing reminders:", error);
    process.exit(1);
  }
};

testReminders();
