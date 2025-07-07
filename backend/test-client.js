// Test script for client creation
const mongoose = require("mongoose");
const Client = require("./models/Client");
require("dotenv").config();

async function testClientCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test client data
    const testClientData = {
      businessName: "Test Salon",
      businessType: "salon",
      contactPerson: {
        name: "John Doe",
        phone: "+1234567890",
        email: "john@testsalon.com",
        position: "Owner",
      },
      address: {
        street: "123 Main St",
        city: "Nairobi",
        state: "Nairobi",
        zipCode: "00100",
        country: "Kenya",
      },
      logo: {
        url: "https://example.com/logo.jpg",
        publicId: "test_logo_123",
        uploadedAt: new Date(),
      },
    };

    // Create client
    const client = new Client(testClientData);

    // Explicitly set logo
    client.logo = {
      url: "https://example.com/logo.jpg",
      publicId: "test_logo_123",
      uploadedAt: new Date(),
    };

    await client.save();

    console.log("✅ Client created successfully:", client._id);
    console.log(
      "✅ Logo structure is valid:",
      JSON.stringify(client.logo, null, 2)
    );
    console.log(
      "✅ Full client data:",
      JSON.stringify(client.toObject(), null, 2)
    );

    // Clean up
    await Client.findByIdAndDelete(client._id);
    console.log("✅ Test client cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testClientCreation();
