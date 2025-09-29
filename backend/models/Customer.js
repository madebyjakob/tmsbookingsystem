// Customer model for Supabase
// This file defines the table structure and validation rules

const customerTable = 'customers';

// Table structure (for reference and documentation)
const customerStructure = {
  id: 'uuid', // Primary key, auto-generated
  first_name: 'text', // Required, max 50 chars
  last_name: 'text', // Required, max 50 chars
  email: 'text', // Required, unique, valid email
  phone: 'text', // Required, valid phone format
  address_street: 'text', // Required
  address_city: 'text', // Required
  address_postal_code: 'text', // Required
  vehicle_ids: 'uuid[]', // Array of vehicle UUIDs
  notes: 'text', // Optional, max 500 chars
  created_at: 'timestamp with time zone', // Auto-generated
  updated_at: 'timestamp with time zone' // Auto-updated
};

// Validation functions
const validateCustomer = (customerData) => {
  const errors = [];

  // Required fields
  if (!customerData.first_name?.trim()) {
    errors.push('First name is required');
  } else if (customerData.first_name.length > 50) {
    errors.push('First name cannot exceed 50 characters');
  }

  if (!customerData.last_name?.trim()) {
    errors.push('Last name is required');
  } else if (customerData.last_name.length > 50) {
    errors.push('Last name cannot exceed 50 characters');
  }

  if (!customerData.email?.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push('Please enter a valid email');
    }
  }

  if (!customerData.phone?.trim()) {
    errors.push('Phone number is required');
  } else {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(customerData.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
  }

  if (!customerData.address_street?.trim()) {
    errors.push('Street address is required');
  }

  if (!customerData.address_city?.trim()) {
    errors.push('City is required');
  }

  if (!customerData.address_postal_code?.trim()) {
    errors.push('Postal code is required');
  }

  if (customerData.notes && customerData.notes.length > 500) {
    errors.push('Notes cannot exceed 500 characters');
  }

  return errors;
};

// Transform data for Supabase (camelCase to snake_case)
const transformToSupabase = (customerData) => {
  return {
    first_name: customerData.firstName,
    last_name: customerData.lastName,
    email: customerData.email?.toLowerCase().trim(),
    phone: customerData.phone?.trim(),
    address_street: customerData.address?.street?.trim(),
    address_city: customerData.address?.city?.trim(),
    address_postal_code: customerData.address?.postalCode?.trim(),
    vehicle_ids: customerData.vehicleIds || [],
    notes: customerData.notes?.trim()
  };
};

// Transform data from Supabase (snake_case to camelCase)
const transformFromSupabase = (customerData) => {
  return {
    id: customerData.id,
    firstName: customerData.first_name,
    lastName: customerData.last_name,
    email: customerData.email,
    phone: customerData.phone,
    address: {
      street: customerData.address_street,
      city: customerData.address_city,
      postalCode: customerData.address_postal_code
    },
    vehicleIds: customerData.vehicle_ids || [],
    notes: customerData.notes,
    createdAt: customerData.created_at,
    updatedAt: customerData.updated_at,
    // Virtual fields
    fullName: `${customerData.first_name} ${customerData.last_name}`
  };
};

module.exports = {
  customerTable,
  customerStructure,
  validateCustomer,
  transformToSupabase,
  transformFromSupabase
};
