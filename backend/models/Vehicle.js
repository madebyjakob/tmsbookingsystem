// Vehicle model for Supabase
// This file defines the table structure and validation rules

const vehicleTable = 'vehicles';

// Table structure (for reference and documentation)
const vehicleStructure = {
  id: 'uuid', // Primary key, auto-generated
  vehicle_make: 'text', // Required
  vehicle_model: 'text', // Required
  vehicle_year: 'text', // Required
  vehicle_license_plate: 'text', // Required, unique
  created_at: 'timestamp with time zone' // Auto-generated
};

// Validation functions
const validateVehicle = (vehicleData) => {
  const errors = [];

  // Required fields
  if (!vehicleData.vehicle_make?.trim()) {
    errors.push('Vehicle make is required');
  }

  if (!vehicleData.vehicle_model?.trim()) {
    errors.push('Vehicle model is required');
  }

  if (!vehicleData.vehicle_year?.trim()) {
    errors.push('Vehicle year is required');
  } else {
    const year = parseInt(vehicleData.vehicle_year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      errors.push(`Vehicle year must be between 1900 and ${currentYear + 1}`);
    }
  }

  if (!vehicleData.vehicle_license_plate?.trim()) {
    errors.push('License plate is required');
  }

  return errors;
};

// Transform data for Supabase (camelCase to snake_case)
const transformToSupabase = (vehicleData) => {
  return {
    vehicle_make: vehicleData.make?.trim(),
    vehicle_model: vehicleData.model?.trim(),
    vehicle_year: vehicleData.year?.toString().trim(),
    vehicle_license_plate: vehicleData.licensePlate?.toUpperCase().trim()
  };
};

// Transform data from Supabase (snake_case to camelCase)
const transformFromSupabase = (vehicleData) => {
  return {
    id: vehicleData.id,
    make: vehicleData.vehicle_make,
    model: vehicleData.vehicle_model,
    year: vehicleData.vehicle_year,
    licensePlate: vehicleData.vehicle_license_plate,
    createdAt: vehicleData.created_at
  };
};

module.exports = {
  vehicleTable,
  vehicleStructure,
  validateVehicle,
  transformToSupabase,
  transformFromSupabase
};
