// Job model for Supabase
// This file defines the table structure and validation rules

const jobTable = 'jobs';

// Table structure (for reference and documentation)
const jobStructure = {
  id: 'uuid', // Primary key, auto-generated
  customer_id: 'uuid', // Foreign key to customers table, required
  job_type: 'text', // Required, enum: service, repair, inspection, maintenance, other
  description: 'text', // Required, max 1000 chars
  status: 'text', // Required, enum: pending, in_progress, completed, cancelled
  priority: 'text', // Required, enum: low, medium, high, urgent
  scheduled_date: 'timestamp with time zone', // Required
  estimated_duration: 'numeric', // Required, in hours, 0.5-24
  actual_duration: 'numeric', // Optional, in hours, >= 0
  cost_labor: 'numeric', // Optional, >= 0
  cost_parts: 'numeric', // Optional, >= 0
  cost_total: 'numeric', // Auto-calculated
  technician: 'text', // Optional
  notes: 'text', // Optional, max 1000 chars
  completed_date: 'timestamp with time zone', // Optional
  customer_signature: 'text', // Optional
  created_at: 'timestamp with time zone', // Auto-generated
  updated_at: 'timestamp with time zone' // Auto-updated
};

// Validation functions
const validateJob = (jobData) => {
  const errors = [];

  // Required fields
  if (!jobData.customer_id) {
    errors.push('Customer reference is required');
  }

  if (!jobData.job_type) {
    errors.push('Job type is required');
  } else {
    const validJobTypes = ['service', 'repair', 'inspection', 'maintenance', 'other'];
    if (!validJobTypes.includes(jobData.job_type)) {
      errors.push('Invalid job type');
    }
  }

  if (!jobData.description?.trim()) {
    errors.push('Job description is required');
  } else if (jobData.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  if (!jobData.status) {
    errors.push('Job status is required');
  } else {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(jobData.status)) {
      errors.push('Invalid job status');
    }
  }

  if (!jobData.priority) {
    errors.push('Priority level is required');
  } else {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(jobData.priority)) {
      errors.push('Invalid priority level');
    }
  }

  if (!jobData.scheduled_date) {
    errors.push('Scheduled date is required');
  }

  if (!jobData.estimated_duration) {
    errors.push('Estimated duration is required');
  } else {
    const duration = parseFloat(jobData.estimated_duration);
    if (isNaN(duration) || duration < 0.5 || duration > 24) {
      errors.push('Estimated duration must be between 0.5 and 24 hours');
    }
  }

  // Optional field validations
  if (jobData.actual_duration !== undefined && jobData.actual_duration !== null) {
    const actualDuration = parseFloat(jobData.actual_duration);
    if (isNaN(actualDuration) || actualDuration < 0) {
      errors.push('Actual duration cannot be negative');
    }
  }

  if (jobData.cost_labor !== undefined && jobData.cost_labor !== null) {
    const laborCost = parseFloat(jobData.cost_labor);
    if (isNaN(laborCost) || laborCost < 0) {
      errors.push('Labor cost cannot be negative');
    }
  }

  if (jobData.cost_parts !== undefined && jobData.cost_parts !== null) {
    const partsCost = parseFloat(jobData.cost_parts);
    if (isNaN(partsCost) || partsCost < 0) {
      errors.push('Parts cost cannot be negative');
    }
  }

  if (jobData.notes && jobData.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }

  return errors;
};

// Transform data for Supabase (camelCase to snake_case)
const transformToSupabase = (jobData) => {
  return {
    customer_id: jobData.customer,
    job_type: jobData.jobType,
    description: jobData.description?.trim(),
    status: jobData.status,
    priority: jobData.priority,
    scheduled_date: jobData.scheduledDate,
    estimated_duration: jobData.estimatedDuration,
    actual_duration: jobData.actualDuration,
    cost_labor: jobData.cost?.labor,
    cost_parts: jobData.cost?.parts,
    technician: jobData.technician?.trim(),
    notes: jobData.notes?.trim(),
    completed_date: jobData.completedDate,
    customer_signature: jobData.customerSignature?.trim()
  };
};

// Transform data from Supabase (snake_case to camelCase)
const transformFromSupabase = (jobData) => {
  const cost = {
    labor: jobData.cost_labor || 0,
    parts: jobData.cost_parts || 0,
    total: jobData.cost_total || 0
  };

  return {
    id: jobData.id,
    customer: jobData.customer_id,
    jobType: jobData.job_type,
    description: jobData.description,
    status: jobData.status,
    priority: jobData.priority,
    scheduledDate: jobData.scheduled_date,
    estimatedDuration: jobData.estimated_duration,
    actualDuration: jobData.actual_duration,
    cost,
    technician: jobData.technician,
    notes: jobData.notes,
    completedDate: jobData.completed_date,
    customerSignature: jobData.customer_signature,
    createdAt: jobData.created_at,
    updatedAt: jobData.updated_at,
    // Virtual fields
    isOverdue: jobData.status !== 'completed' && new Date() > new Date(jobData.scheduled_date),
    formattedCost: {
      labor: `$${cost.labor.toFixed(2)}`,
      parts: `$${cost.parts.toFixed(2)}`,
      total: `$${cost.total.toFixed(2)}`
    }
  };
};

module.exports = {
  jobTable,
  jobStructure,
  validateJob,
  transformToSupabase,
  transformFromSupabase
};
