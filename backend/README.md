# SAK Business Platform - Comprehensive Backend

## 🎯 Platform Overview

The SAK Business Platform is a comprehensive business management solution designed to streamline operations, client onboarding, and communication across different departments and user roles (Management, HR, Admin, Sales, and Directors). The platform provides visibility and accountability for tasks, leads, client satisfaction, and business growth.

## 🚀 Features

### Core Modules

1. **Client Management**

   - Complete client onboarding with progress tracking
   - Business type categorization (salon, barbershop, spa)
   - Service package management
   - Satisfaction tracking and feedback
   - Visit logs and KPI tracking

2. **Task Management**

   - Comprehensive task assignment and tracking
   - Multiple task types and categories
   - Priority levels and status tracking
   - Checklist functionality
   - Comments and collaboration
   - Recurring tasks support

3. **Staff Management**

   - Employee profile management
   - Attendance tracking (clock in/out)
   - Performance reviews and ratings
   - Document management
   - Skills and training tracking

4. **Lead Management**

   - Sales pipeline tracking
   - Lead qualification and scoring
   - Interaction history
   - Conversion tracking
   - Follow-up management

5. **Meeting Management**

   - Meeting scheduling and calendar integration
   - Virtual meeting support
   - Agenda and minutes tracking
   - Action items assignment
   - Recurring meetings

6. **Invoice Management**

   - Invoice generation and tracking
   - Payment recording
   - Automated reminders
   - Financial reporting
   - Multiple payment methods

7. **Analytics & Reporting**
   - Executive dashboard
   - Client performance reports
   - Staff performance metrics
   - Sales pipeline analytics
   - Financial reports

### Role-Based Access Control

- **Directors**: Full access to all modules and analytics
- **Management**: Operations oversight, client management, staff tracking
- **HR**: Staff management, recruitment, performance tracking
- **Sales**: Lead management, client acquisition, proposal tracking
- **Admin**: Meeting scheduling, communication, document management

## 🛠️ Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **SMS/WhatsApp**: Twilio

## 📁 Project Structure

```
backend/
├── models/
│   ├── User.js          # User authentication and roles
│   ├── Client.js        # Client management
│   ├── Task.js          # Task management
│   ├── Staff.js         # Staff management
│   ├── Lead.js          # Lead management
│   ├── Meeting.js       # Meeting management
│   └── Invoice.js       # Invoice management
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── clients.js       # Client management routes
│   ├── tasks.js         # Task management routes
│   ├── staff.js         # Staff management routes
│   ├── leads.js         # Lead management routes
│   ├── meetings.js      # Meeting management routes
│   ├── invoices.js      # Invoice management routes
│   └── reports.js       # Analytics and reporting routes
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   ├── rbac.js          # Role-based access control
│   └── validation.js    # Request validation middleware
├── .env                 # Environment variables
├── server.js           # Main application server
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sak-platform/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and configure your environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the following variables:

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/business-platform
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Twilio (for SMS/WhatsApp)
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

4. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
http://localhost:3001/api
```

### Client Management Endpoints

#### Get All Clients

```http
GET /api/clients
Query Parameters:
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 10)
- status (string): Filter by onboarding status
- businessType (string): Filter by business type
- search (string): Search clients by name
```

#### Create Client

```http
POST /api/clients
Body:
{
  "businessName": "Beauty Salon ABC",
  "businessType": "salon",
  "contactPerson": {
    "name": "Jane Doe",
    "phone": "+254712345678",
    "email": "jane@salon.com",
    "position": "Manager"
  },
  "address": {
    "street": "123 Main St",
    "city": "Nairobi",
    "state": "Nairobi County",
    "zipCode": "00100",
    "country": "Kenya"
  }
}
```

#### Update Onboarding Checklist

```http
PUT /api/clients/:id/onboarding
Body:
{
  "checklistItem": "brandingMaterials",
  "completed": true,
  "notes": "Logo and signage completed"
}
```

#### Add Visit Log

```http
POST /api/clients/:id/visit-logs
Body:
{
  "visitType": "consultation",
  "notes": "Initial consultation completed"
}
```

### Task Management Endpoints

#### Get All Tasks

```http
GET /api/tasks
Query Parameters:
- page, limit, status, type, priority, assignedTo, client, search, dueDate
```

#### Create Task

```http
POST /api/tasks
Body:
{
  "title": "Complete client onboarding",
  "description": "Finalize all onboarding requirements",
  "type": "onboarding",
  "priority": "high",
  "assignedTo": "user_id",
  "client": "client_id",
  "dueDate": "2024-07-15T10:00:00Z",
  "checklist": [
    {
      "item": "Verify documents",
      "completed": false
    }
  ]
}
```

### Staff Management Endpoints

#### Get All Staff

```http
GET /api/staff
Query Parameters:
- page, limit, position, client, status, search
```

#### Create Staff Member

```http
POST /api/staff
Body:
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "phone": "+254712345678"
  },
  "employmentDetails": {
    "position": "stylist",
    "startDate": "2024-07-01",
    "salary": 50000,
    "employmentType": "full-time"
  },
  "assignedClient": "client_id"
}
```

#### Clock In/Out

```http
POST /api/staff/:id/attendance
Body:
{
  "type": "in"  // or "out"
}
```

### Lead Management Endpoints

#### Get All Leads

```http
GET /api/leads
Query Parameters:
- page, limit, status, source, assignedTo, search
```

#### Create Lead

```http
POST /api/leads
Body:
{
  "businessName": "New Salon Lead",
  "businessType": "salon",
  "contactPerson": {
    "name": "Mary Smith",
    "phone": "+254723456789",
    "email": "mary@newsalon.com"
  },
  "leadSource": "website",
  "estimatedValue": 100000,
  "probability": 50,
  "interestLevel": "high"
}
```

#### Convert Lead to Client

```http
POST /api/leads/:id/convert
```

### Meeting Management Endpoints

#### Get All Meetings

```http
GET /api/meetings
Query Parameters:
- page, limit, type, status, date, client
```

#### Create Meeting

```http
POST /api/meetings
Body:
{
  "title": "Client Consultation",
  "description": "Initial consultation meeting",
  "type": "consultation",
  "startDate": "2024-07-10T10:00:00Z",
  "endDate": "2024-07-10T11:00:00Z",
  "location": "Office Conference Room",
  "attendees": [
    {
      "user": "user_id",
      "role": "required"
    }
  ],
  "client": "client_id"
}
```

### Invoice Management Endpoints

#### Get All Invoices

```http
GET /api/invoices
Query Parameters:
- page, limit, status, client, dateFrom, dateTo, search
```

#### Create Invoice

```http
POST /api/invoices
Body:
{
  "client": "client_id",
  "dueDate": "2024-07-31",
  "items": [
    {
      "description": "Monthly Service Package",
      "quantity": 1,
      "unitPrice": 50000,
      "total": 50000
    }
  ],
  "subtotal": 50000,
  "totalAmount": 50000,
  "paymentTerms": "net-30"
}
```

#### Record Payment

```http
POST /api/invoices/:id/payment
Body:
{
  "amount": 50000,
  "method": "mpesa",
  "transactionReference": "ABC123456789",
  "notes": "Payment received via M-Pesa"
}
```

### Analytics & Reporting Endpoints

#### Executive Dashboard

```http
GET /api/reports/dashboard
Query Parameters:
- dateFrom (ISO date): Start date filter
- dateTo (ISO date): End date filter
```

#### Client Performance Report

```http
GET /api/reports/client-performance
Query Parameters:
- clientId (string): Specific client ID
- dateFrom, dateTo: Date range filters
```

#### Sales Pipeline Report

```http
GET /api/reports/sales-pipeline
Query Parameters:
- assignedTo (string): Sales agent ID
- dateFrom, dateTo: Date range filters
```

#### Financial Report

```http
GET /api/reports/financial
Query Parameters:
- dateFrom, dateTo: Date range filters
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Request rate limiting
- Data validation with Joi
- Secure headers with Helmet
- CORS configuration
- Password hashing with bcrypt

## 📊 User Journey Implementation

### Management (Claire, Eddie)

- **Client Onboarding**: Complete onboarding checklist tracking
- **Operational Oversight**: Staff attendance, KPI tracking, performance reviews
- **Client Retention**: Visit logs, satisfaction tracking, analytics

### HR Manager (Joseph)

- **Staff Sourcing**: Recruitment pipeline (integrated with Lead management)
- **Onboarding Process**: Staff document management, role assignments
- **Performance Management**: Reviews, ratings, goal tracking

### Admin (Mercy)

- **Scheduling**: Meeting management with calendar integration
- **Client Communication**: CRM functionality, interaction tracking
- **Finance Admin**: Invoice management, payment tracking
- **Marketing**: Content planning and campaign coordination

### Sales Agent (Diana)

- **Lead Management**: Complete sales pipeline tracking
- **Document Handling**: Proposal management, deadline tracking
- **Follow-up System**: Automated reminders and task assignments

### Directors (Pauline/Peter)

- **Growth Analytics**: Comprehensive reporting and KPI dashboards
- **Strategic Oversight**: Executive dashboard with key metrics
- **Governance**: Approval workflows and risk monitoring

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
```

### Recommended Hosting

- **Backend**: Heroku, AWS, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Email**: SendGrid, Mailgun
- **SMS**: Twilio

## 📈 Performance Considerations

- Database indexing for efficient queries
- Pagination for large datasets
- Caching strategies for frequently accessed data
- File upload optimization
- API rate limiting

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:

- Email: support@sakplatform.com
- Documentation: [API Docs](https://api.sakplatform.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for streamlined business operations**
