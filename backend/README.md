# TMS Backend API

A robust Express.js backend for the TMS (Täbymopedservice) Booking System with Supabase integration.

## Features

- **Customer Management**: Full CRUD operations for customer data
- **Job Management**: Complete job/service tracking system
- **Supabase Integration**: PostgreSQL-based backend-as-a-service with real-time capabilities
- **RESTful API**: Clean, consistent API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Helmet.js for security headers, CORS support
- **Logging**: Morgan for HTTP request logging

## Prerequisites

- Node.js (v14 or higher)
- Supabase account and project
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up Supabase database:**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the contents of `supabase-setup.sql` to create tables and sample data

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers (with pagination & search) |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer (full update) |
| PATCH | `/api/customers/:id` | Update customer (partial update) |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/customers/vehicle/:make/:model` | Get customers by vehicle make/model |

**Query Parameters for GET /api/customers:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name, email, license plate
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc/desc (default: desc)

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filtering & pagination) |
| GET | `/api/jobs/:id` | Get job by ID |
| POST | `/api/jobs` | Create new job |
| PUT | `/api/jobs/:id` | Update job (full update) |
| PATCH | `/api/jobs/:id` | Update job (partial update) |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs/customer/:customerId` | Get jobs by customer ID |
| GET | `/api/jobs/status/:status` | Get jobs by status |
| PATCH | `/api/jobs/:id/status` | Update job status |
| GET | `/api/jobs/overdue/all` | Get all overdue jobs |

**Query Parameters for GET /api/jobs:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in description, technician
- `status`: Filter by status
- `priority`: Filter by priority
- `jobType`: Filter by job type
- `sortBy`: Sort field (default: scheduledDate)
- `sortOrder`: asc/desc (default: asc)

## Data Models

### Customer Schema
```javascript
{
  id: UUID (auto-generated),
  firstName: String (required, max 50 chars),
  lastName: String (required, max 50 chars),
  email: String (required, unique, valid email),
  phone: String (required, valid phone format),
  address: {
    street: String (required),
    city: String (required),
    postalCode: String (required)
  },
  vehicleInfo: {
    make: String (required),
    model: String (required),
    year: Number (required, 1900-current year),
    licensePlate: String (required, unique)
  },
  notes: String (max 500 chars),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Job Schema
```javascript
{
  id: UUID (auto-generated),
  customer: UUID (ref: Customer, required),
  jobType: String (enum: service, repair, inspection, maintenance, other),
  description: String (required, max 1000 chars),
  status: String (enum: pending, in_progress, completed, cancelled),
  priority: String (enum: low, medium, high, urgent),
  scheduledDate: Timestamp (required),
  estimatedDuration: Number (hours, required, 0.5-24),
  actualDuration: Number (hours, >= 0),
  cost: {
    labor: Number (>= 0),
    parts: Number (>= 0),
    total: Number (auto-calculated)
  },
  technician: String,
  notes: String (max 1000 chars),
  completedDate: Timestamp,
  customerSignature: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Example API Usage

### Create a Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+46701234567",
    "address": {
      "street": "Main Street 123",
      "city": "Stockholm",
      "postalCode": "12345"
    },
    "vehicleInfo": {
      "make": "Honda",
      "model": "CBR600RR",
      "year": 2020,
      "licensePlate": "ABC123"
    }
  }'
```

### Create a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "customer_id_here",
    "jobType": "service",
    "description": "Regular maintenance service",
    "priority": "medium",
    "scheduledDate": "2024-01-15T10:00:00.000Z",
    "estimatedDuration": 2
  }'
```

### Get Customers with Search
```bash
curl "http://localhost:5000/api/customers?search=john&page=1&limit=5"
```

### Get Jobs by Status
```bash
curl "http://localhost:5000/api/jobs/status/pending?page=1&limit=10"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/customers",
  "method": "POST"
}
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── Customer.js          # Customer Mongoose model
│   └── Job.js              # Job Mongoose model
├── routes/
│   ├── customers.js         # Customer API routes
│   └── jobs.js             # Job API routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### Available Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (to be implemented)

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Mongoose schema validation
- **Error Sanitization**: No sensitive information in error responses

## Database Features

The Supabase database includes:
- **Automatic UUID generation** for all primary keys
- **Data validation** with PostgreSQL CHECK constraints
- **Automatic timestamps** (created_at, updated_at)
- **Cost calculation** triggers for automatic total cost computation
- **Row Level Security (RLS)** for data protection
- **Performance indexes** on frequently queried fields
- **Foreign key constraints** with cascade delete
- **Database views** for complex queries

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Update documentation for new features

## License

ISC License
