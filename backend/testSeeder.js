const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Just create a simple user to test
    const User = require("./models/User");

    // Clear users first
    await User.deleteMany({});

    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 12),
      role: "admin",
    });

    await testUser.save();
    console.log("✅ Created test user");

    // Test client creation
    const Client = require("./models/Client");
    await Client.deleteMany({});

    const testClient = new Client({
      businessName: "Test Business",
      businessType: "salon",
      contactPerson: {
        name: "Test Contact",
        phone: "+254700000000",
        email: "contact@test.com",
      },
    });

    await testClient.save();
    console.log("✅ Created test client");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed");
  }
}

testConnection();
