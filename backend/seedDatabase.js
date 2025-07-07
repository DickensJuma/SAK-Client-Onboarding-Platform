const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Client = require("./models/Client");
const Task = require("./models/Task");
const Staff = require("./models/Staff");
const Lead = require("./models/Lead");
const Meeting = require("./models/Meeting");
const Invoice = require("./models/Invoice");

// Sample data
const sampleUsers = [
  {
    name: "Claire Management",
    email: "claire@sakplatform.com",
    password: "password123",
    role: "management",
    department: "management",
    phone: "+254701234567",
    position: "Operations Manager",
  },
  {
    name: "Eddie Management",
    email: "eddie@sakplatform.com",
    password: "password123",
    role: "management",
    department: "management",
    phone: "+254701234568",
    position: "Quality Manager",
  },
  {
    name: "Joseph HR",
    email: "joseph@sakplatform.com",
    password: "password123",
    role: "hr",
    department: "hr",
    phone: "+254701234569",
    position: "HR Manager",
  },
  {
    name: "Mercy Admin",
    email: "mercy@sakplatform.com",
    password: "password123",
    role: "admin",
    department: "admin",
    phone: "+254701234570",
    position: "Administrative Manager",
  },
  {
    name: "Diana Sales",
    email: "diana@sakplatform.com",
    password: "password123",
    role: "sales",
    department: "sales",
    phone: "+254701234571",
    position: "Sales Agent",
  },
  {
    name: "Pauline Director",
    email: "pauline@sakplatform.com",
    password: "password123",
    role: "director",
    department: "operations",
    phone: "+254701234572",
    position: "Director",
  },
  {
    name: "Peter Director",
    email: "peter@sakplatform.com",
    password: "password123",
    role: "director",
    department: "operations",
    phone: "+254701234573",
    position: "Co-Director",
  },
];

const sampleClients = [
  {
    businessName: "Elegance Beauty Salon",
    businessType: "salon",
    contactPerson: {
      name: "Sarah Wilson",
      phone: "+254712345678",
      email: "sarah@elegancesalon.com",
      position: "Owner",
    },
    address: {
      street: "123 Kimathi Street",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00100",
      country: "Kenya",
    },
    onboardingStatus: "completed",
    onboardingChecklist: {
      brandingMaterials: {
        completed: true,
        notes: "Logo and signage completed",
      },
      wifiSetup: { completed: true, notes: "WiFi installed and configured" },
      staffHiring: { completed: true, notes: "3 stylists hired" },
      inventoryAssigned: {
        completed: true,
        notes: "Initial inventory delivered",
      },
      beveragesAvailable: {
        completed: true,
        notes: "Coffee machine installed",
      },
      cleanlinessCheck: {
        completed: true,
        notes: "All cleanliness standards met",
      },
    },
    contractDetails: {
      startDate: new Date("2024-01-15"),
      duration: "12 months",
      monthlyFee: 45000,
      setupFee: 25000,
      status: "signed",
    },
    satisfaction: {
      rating: 5,
      feedback: "Excellent service and support",
      lastUpdated: new Date(),
    },
    referralSource: "referral",
    kpis: {
      walkIns: 45,
      onlineBookings: 78,
      referrals: 12,
      weeklyVisits: 8,
      monthlyRevenue: 150000,
    },
  },
  {
    businessName: "Gentlemen's Barbershop",
    businessType: "barbershop",
    contactPerson: {
      name: "John Kamau",
      phone: "+254723456789",
      email: "john@gentlemens.com",
      position: "Manager",
    },
    address: {
      street: "456 Moi Avenue",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00200",
      country: "Kenya",
    },
    onboardingStatus: "in-progress",
    onboardingChecklist: {
      brandingMaterials: { completed: true, notes: "Branding complete" },
      wifiSetup: { completed: true, notes: "WiFi setup done" },
      staffHiring: {
        completed: false,
        notes: "Still looking for 1 more barber",
      },
      inventoryAssigned: { completed: true, notes: "Equipment delivered" },
      beveragesAvailable: { completed: false, notes: "Pending coffee machine" },
      cleanlinessCheck: { completed: false, notes: "Final inspection pending" },
    },
    contractDetails: {
      startDate: new Date("2024-06-01"),
      duration: "12 months",
      monthlyFee: 35000,
      setupFee: 20000,
      status: "signed",
    },
    referralSource: "online",
    kpis: {
      walkIns: 30,
      onlineBookings: 25,
      referrals: 5,
      weeklyVisits: 6,
      monthlyRevenue: 85000,
    },
  },
  {
    businessName: "Serenity Spa & Wellness",
    businessType: "spa",
    contactPerson: {
      name: "Mary Wanjiku",
      phone: "+254734567890",
      email: "mary@serenityspa.com",
      position: "Owner",
    },
    address: {
      street: "789 Westlands Road",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00600",
      country: "Kenya",
    },
    onboardingStatus: "pending",
    contractDetails: {
      startDate: new Date("2024-07-15"),
      duration: "12 months",
      monthlyFee: 55000,
      setupFee: 30000,
      status: "draft",
    },
    referralSource: "social-media",
  },
];

const sampleLeads = [
  {
    businessName: "Modern Hair Studio",
    businessType: "salon",
    contactPerson: {
      name: "Grace Mutindi",
      phone: "+254745678901",
      email: "grace@modernhair.com",
      position: "Owner",
    },
    leadSource: "website",
    leadStatus: "qualified",
    estimatedValue: 120000,
    probability: 75,
    expectedCloseDate: new Date("2024-07-30"),
    interestLevel: "high",
    notes: "Very interested in our premium package",
    requirements: {
      services: ["Branding", "Staff Training", "Inventory Management"],
      budget: { min: 100000, max: 150000 },
      timeline: "2 months",
      decisionMakers: ["Grace Mutindi", "Peter Kiprotich"],
    },
  },
  {
    businessName: "Urban Cuts Barbershop",
    businessType: "barbershop",
    contactPerson: {
      name: "David Otieno",
      phone: "+254756789012",
      email: "david@urbancuts.com",
      position: "Manager",
    },
    leadSource: "referral",
    leadStatus: "proposal-sent",
    estimatedValue: 80000,
    probability: 60,
    expectedCloseDate: new Date("2024-08-15"),
    interestLevel: "medium",
    notes: "Proposal sent, waiting for response",
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (only if collections exist)
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
    }
    console.log("Cleared existing data");

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      users.push(await user.save());
    }
    console.log("Created sample users");

    // Find specific users for assignments
    const salesAgent = users.find((u) => u.role === "sales");
    const hrManager = users.find((u) => u.role === "hr");
    const managementUser = users.find((u) => u.role === "management");

    // Create clients with assigned users
    const clients = [];
    for (const clientData of sampleClients) {
      const client = new Client({
        ...clientData,
        assignedSalesAgent: salesAgent._id,
        assignedManager: managementUser._id,
      });
      clients.push(await client.save());
    }
    console.log("Created sample clients");

    // Create leads
    const leads = [];
    for (const leadData of sampleLeads) {
      const lead = new Lead({
        ...leadData,
        assignedTo: salesAgent._id,
      });
      leads.push(await lead.save());
    }
    console.log("Created sample leads");

    // Create sample tasks
    const sampleTasks = [
      {
        title: "Complete client onboarding checklist",
        description:
          "Finalize all onboarding requirements for Elegance Beauty Salon",
        type: "onboarding",
        category: "checklist-item",
        priority: "high",
        status: "in-progress",
        assignedTo: managementUser._id,
        assignedBy: salesAgent._id,
        client: clients[0]._id,
        dueDate: new Date("2024-07-15"),
        checklist: [
          {
            item: "Verify all documents",
            completed: true,
            completedAt: new Date(),
          },
          { item: "Final quality check", completed: false },
        ],
      },
      {
        title: "Staff hiring for Gentlemen's Barbershop",
        description: "Find and hire one additional experienced barber",
        type: "hr",
        category: "follow-up",
        priority: "medium",
        status: "pending",
        assignedTo: hrManager._id,
        assignedBy: managementUser._id,
        client: clients[1]._id,
        dueDate: new Date("2024-07-20"),
      },
      {
        title: "Follow up with Modern Hair Studio lead",
        description: "Schedule demo and send detailed proposal",
        type: "sales",
        category: "follow-up",
        priority: "high",
        status: "pending",
        assignedTo: salesAgent._id,
        assignedBy: salesAgent._id,
        dueDate: new Date("2024-07-12"),
      },
    ];

    for (const taskData of sampleTasks) {
      const task = new Task(taskData);
      await task.save();
    }
    console.log("Created sample tasks");

    // Create sample staff
    const sampleStaff = [
      {
        personalInfo: {
          firstName: "Jane",
          lastName: "Mwangi",
          email: "jane.mwangi@elegancesalon.com",
          phone: "+254787654321",
          nationalId: "ID123456789",
        },
        employmentDetails: {
          employeeId: "EMP0001",
          position: "stylist",
          startDate: new Date("2024-02-01"),
          salary: 35000,
          employmentType: "full-time",
        },
        assignedClient: clients[0]._id,
        skills: ["Hair styling", "Hair coloring", "Customer service"],
        performance: {
          lastReviewDate: new Date("2024-06-01"),
          rating: 4,
          feedback: "Excellent performance and customer feedback",
        },
      },
      {
        personalInfo: {
          firstName: "Michael",
          lastName: "Ochieng",
          email: "michael.ochieng@gentlemens.com",
          phone: "+254798765432",
          nationalId: "ID987654321",
        },
        employmentDetails: {
          employeeId: "EMP0002",
          position: "receptionist",
          startDate: new Date("2024-06-15"),
          salary: 25000,
          employmentType: "full-time",
        },
        assignedClient: clients[1]._id,
        skills: ["Customer service", "Appointment scheduling", "Cash handling"],
      },
    ];

    for (const staffData of sampleStaff) {
      const staff = new Staff(staffData);
      await staff.save();
    }
    console.log("Created sample staff");

    // Create sample invoice
    const sampleInvoice = new Invoice({
      invoiceNumber: "INV-2024-001",
      client: clients[0]._id,
      issuedBy: salesAgent._id,
      dueDate: new Date("2024-08-15"),
      items: [
        {
          description: "Monthly Service Package - July 2024",
          quantity: 1,
          unitPrice: 45000,
          total: 45000,
        },
        {
          description: "Additional Training Session",
          quantity: 2,
          unitPrice: 5000,
          total: 10000,
        },
      ],
      subtotal: 55000,
      tax: { rate: 16, amount: 8800 },
      totalAmount: 63800,
      status: "sent",
      paymentTerms: "net-30",
    });
    await sampleInvoice.save();
    console.log("Created sample invoice");

    // Create sample meeting
    const sampleMeeting = new Meeting({
      title: "Monthly Review - Elegance Beauty Salon",
      description: "Monthly performance review and planning session",
      type: "review",
      startDate: new Date("2024-07-15T10:00:00Z"),
      endDate: new Date("2024-07-15T11:30:00Z"),
      location: "Client Location",
      organizer: managementUser._id,
      attendees: [
        { user: salesAgent._id, role: "required" },
        { user: hrManager._id, role: "optional" },
      ],
      client: clients[0]._id,
      agenda: [
        "Review monthly KPIs",
        "Discuss staff performance",
        "Plan next month activities",
      ],
      status: "scheduled",
    });
    await sampleMeeting.save();
    console.log("Created sample meeting");

    console.log("✅ Database seeded successfully!");
    console.log("\n📧 Sample Login Credentials:");
    console.log("Management: claire@sakplatform.com / password123");
    console.log("HR: joseph@sakplatform.com / password123");
    console.log("Admin: mercy@sakplatform.com / password123");
    console.log("Sales: diana@sakplatform.com / password123");
    console.log("Director: pauline@sakplatform.com / password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
