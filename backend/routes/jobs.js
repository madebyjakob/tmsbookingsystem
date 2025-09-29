const express = require('express');
const { supabase } = require('../config/supabase');
const { 
  jobTable, 
  validateJob, 
  transformToSupabase, 
  transformFromSupabase 
} = require('../models/Job');

const router = express.Router();

// Helper function to transform customer data with vehicles
const transformCustomerWithVehicles = async (customerData) => {
  const customer = {
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
    vehicleIds: customerData.vehicle_ids || []
  };
  
  // Fetch vehicles for this customer if they exist
  if (customerData.vehicle_ids && customerData.vehicle_ids.length > 0) {
    try {
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', customerData.vehicle_ids);
      
      if (!vehiclesError && vehicles && vehicles.length > 0) {
        const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
        customer.vehicles = vehicles.map(transformVehicle);
        // For backward compatibility, set the first vehicle as vehicleInfo
        customer.vehicleInfo = transformVehicle(vehicles[0]);
      }
    } catch (error) {
      console.error('Error fetching vehicles for customer:', error);
    }
  }
  
  return customer;
};

// GET all jobs with pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 15, 
      search = '', 
      status = '', 
      priority = '',
      jobType = '',
      sortBy = 'scheduled_date', 
      sortOrder = 'asc' 
    } = req.query;
    
    let query = supabase
      .from(jobTable)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `, { count: 'exact' });

    // Add filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (jobType) query = query.eq('job_type', jobType);
    
    // Add search functionality
    if (search) {
      query = query.or(`description.ilike.%${search}%,technician.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: jobs, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform data back to camelCase and format customer info
    const transformedJobs = await Promise.all(jobs.map(async (job) => {
      const transformedJob = transformFromSupabase(job);
      
      // Add customer info in the expected format
      transformedJob.customer = {
        id: job.customers.id,
        firstName: job.customers.first_name,
        lastName: job.customers.last_name,
        email: job.customers.email,
        phone: job.customers.phone,
        address: {
          street: job.customers.address_street,
          city: job.customers.address_city,
          postalCode: job.customers.address_postal_code
        },
        vehicleIds: job.customers.vehicle_ids || []
      };
      
      // Fetch vehicles for this customer if they exist
      if (job.customers.vehicle_ids && job.customers.vehicle_ids.length > 0) {
        try {
          const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*')
            .in('id', job.customers.vehicle_ids);
          
          if (!vehiclesError && vehicles && vehicles.length > 0) {
            const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
            transformedJob.customer.vehicles = vehicles.map(transformVehicle);
            // For backward compatibility, set the first vehicle as vehicleInfo
            transformedJob.customer.vehicleInfo = transformVehicle(vehicles[0]);
          }
        } catch (error) {
          console.error('Error fetching vehicles for job:', error);
        }
      }
      
      return transformedJob;
    }));

    res.json({
      jobs: transformedJobs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalJobs: count
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET job by ID with populated customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from(jobTable)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Transform data and format customer info
    const transformedJob = transformFromSupabase(job);
    transformedJob.customer = {
      id: job.customers.id,
      firstName: job.customers.first_name,
      lastName: job.customers.last_name,
      email: job.customers.email,
      phone: job.customers.phone,
      address: {
        street: job.customers.address_street,
        city: job.customers.address_city,
        postalCode: job.customers.address_postal_code
      },
      vehicleIds: job.customers.vehicle_ids || []
    };
    
    // Fetch vehicles for this customer if they exist
    if (job.customers.vehicle_ids && job.customers.vehicle_ids.length > 0) {
      try {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', job.customers.vehicle_ids);
        
        if (!vehiclesError && vehicles && vehicles.length > 0) {
          const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
          transformedJob.customer.vehicles = vehicles.map(transformVehicle);
          // For backward compatibility, set the first vehicle as vehicleInfo
          transformedJob.customer.vehicleInfo = transformVehicle(vehicles[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles for job:', error);
      }
    }

    res.json(transformedJob);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new job
router.post('/', async (req, res) => {
  try {
    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', req.body.customer)
      .single();

    if (customerError || !customer) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Transform data to snake_case for Supabase
    const supabaseData = transformToSupabase(req.body);
    
    // Validate data
    const validationErrors = validateJob(supabaseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Calculate total cost
    const laborCost = supabaseData.cost_labor || 0;
    const partsCost = supabaseData.cost_parts || 0;
    supabaseData.cost_total = laborCost + partsCost;

    const { data: job, error } = await supabase
      .from(jobTable)
      .insert([supabaseData])
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Transform and format response
    const transformedJob = transformFromSupabase(job);
    transformedJob.customer = await transformCustomerWithVehicles(job.customers);

    res.status(201).json(transformedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update job (full update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If customer is being updated, verify it exists
    if (req.body.customer) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', req.body.customer)
        .single();

      if (customerError || !customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    // Transform data to snake_case for Supabase
    const supabaseData = transformToSupabase(req.body);
    
    // Validate data
    const validationErrors = validateJob(supabaseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Calculate total cost if cost fields are being updated
    if (supabaseData.cost_labor !== undefined || supabaseData.cost_parts !== undefined) {
      const currentJob = await supabase
        .from(jobTable)
        .select('cost_labor, cost_parts')
        .eq('id', id)
        .single();
      
      if (currentJob.data) {
        const laborCost = supabaseData.cost_labor ?? currentJob.data.cost_labor ?? 0;
        const partsCost = supabaseData.cost_parts ?? currentJob.data.cost_parts ?? 0;
        supabaseData.cost_total = laborCost + partsCost;
      }
    }

    const { data: job, error } = await supabase
      .from(jobTable)
      .update(supabaseData)
      .eq('id', id)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Transform and format response
    const transformedJob = transformFromSupabase(job);
    transformedJob.customer = {
      id: job.customers.id,
      firstName: job.customers.first_name,
      lastName: job.customers.last_name,
      email: job.customers.email,
      phone: job.customers.phone,
      address: {
        street: job.customers.address_street,
        city: job.customers.address_city,
        postalCode: job.customers.address_postal_code
      },
      vehicleIds: job.customers.vehicle_ids || []
    };
    
    // Fetch vehicles for this customer if they exist
    if (job.customers.vehicle_ids && job.customers.vehicle_ids.length > 0) {
      try {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', job.customers.vehicle_ids);
        
        if (!vehiclesError && vehicles && vehicles.length > 0) {
          const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
          transformedJob.customer.vehicles = vehicles.map(transformVehicle);
          // For backward compatibility, set the first vehicle as vehicleInfo
          transformedJob.customer.vehicleInfo = transformVehicle(vehicles[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles for job:', error);
      }
    }

    res.json(transformedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH partial update job
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // If customer is being updated, verify it exists
    if (req.body.customer) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', req.body.customer)
        .single();

      if (customerError || !customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    // Transform data to snake_case for Supabase
    const supabaseData = transformToSupabase(req.body);
    
    // For partial updates, only validate fields that are being updated
    const fieldsToValidate = {};
    Object.keys(supabaseData).forEach(key => {
      if (supabaseData[key] !== undefined && supabaseData[key] !== null) {
        fieldsToValidate[key] = supabaseData[key];
      }
    });
    
    if (Object.keys(fieldsToValidate).length > 0) {
      const validationErrors = validateJob(fieldsToValidate);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
    }

    // Calculate total cost if cost fields are being updated
    if (supabaseData.cost_labor !== undefined || supabaseData.cost_parts !== undefined) {
      const currentJob = await supabase
        .from(jobTable)
        .select('cost_labor, cost_parts')
        .eq('id', id)
        .single();
      
      if (currentJob.data) {
        const laborCost = supabaseData.cost_labor ?? currentJob.data.cost_labor ?? 0;
        const partsCost = supabaseData.cost_parts ?? currentJob.data.cost_parts ?? 0;
        supabaseData.cost_total = laborCost + partsCost;
      }
    }

    const { data: job, error } = await supabase
      .from(jobTable)
      .update(supabaseData)
      .eq('id', id)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Transform and format response
    const transformedJob = transformFromSupabase(job);
    transformedJob.customer = {
      id: job.customers.id,
      firstName: job.customers.first_name,
      lastName: job.customers.last_name,
      email: job.customers.email,
      phone: job.customers.phone,
      address: {
        street: job.customers.address_street,
        city: job.customers.address_city,
        postalCode: job.customers.address_postal_code
      },
      vehicleIds: job.customers.vehicle_ids || []
    };
    
    // Fetch vehicles for this customer if they exist
    if (job.customers.vehicle_ids && job.customers.vehicle_ids.length > 0) {
      try {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', job.customers.vehicle_ids);
        
        if (!vehiclesError && vehicles && vehicles.length > 0) {
          const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
          transformedJob.customer.vehicles = vehicles.map(transformVehicle);
          // For backward compatibility, set the first vehicle as vehicleInfo
          transformedJob.customer.vehicleInfo = transformVehicle(vehicles[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles for job:', error);
      }
    }

    res.json(transformedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from(jobTable)
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET jobs by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const { data: jobs, error } = await supabase
      .from(jobTable)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .eq('customer_id', customerId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform and format response
    const transformedJobs = jobs.map(job => {
      const transformedJob = transformFromSupabase(job);
      transformedJob.customer = {
        id: job.customers.id,
        firstName: job.customers.first_name,
        lastName: job.customers.last_name,
        email: job.customers.email,
        phone: job.customers.phone,
        vehicleIds: job.customers.vehicle_ids || []
      };
      return transformedJob;
    });

    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs by customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET jobs by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from(jobTable)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `, { count: 'exact' })
      .eq('status', status)
      .order('scheduled_date', { ascending: true });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: jobs, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform and format response
    const transformedJobs = jobs.map(job => {
      const transformedJob = transformFromSupabase(job);
      transformedJob.customer = {
        id: job.customers.id,
        firstName: job.customers.first_name,
        lastName: job.customers.last_name,
        email: job.customers.email,
        phone: job.customers.phone,
        vehicleIds: job.customers.vehicle_ids || []
      };
      return transformedJob;
    });

    res.json({
      jobs: transformedJobs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalJobs: count
    });
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH update job status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updateData = { status };
    
    // If completing the job, set completed date
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
    }

    const { data: job, error } = await supabase
      .from(jobTable)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Transform and format response
    const transformedJob = transformFromSupabase(job);
    transformedJob.customer = {
      id: job.customers.id,
      firstName: job.customers.first_name,
      lastName: job.customers.last_name,
      email: job.customers.email,
      phone: job.customers.phone,
      address: {
        street: job.customers.address_street,
        city: job.customers.address_city,
        postalCode: job.customers.address_postal_code
      },
      vehicleIds: job.customers.vehicle_ids || []
    };
    
    // Fetch vehicles for this customer if they exist
    if (job.customers.vehicle_ids && job.customers.vehicle_ids.length > 0) {
      try {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', job.customers.vehicle_ids);
        
        if (!vehiclesError && vehicles && vehicles.length > 0) {
          const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
          transformedJob.customer.vehicles = vehicles.map(transformVehicle);
          // For backward compatibility, set the first vehicle as vehicleInfo
          transformedJob.customer.vehicleInfo = transformVehicle(vehicles[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles for job:', error);
      }
    }

    res.json(transformedJob);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET overdue jobs
router.get('/overdue/all', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from(jobTable)
      .select(`
        *,
        customers!inner(
          id,
          first_name,
          last_name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          vehicle_ids
        )
      `)
      .lt('scheduled_date', new Date().toISOString())
      .not('status', 'in', '(completed,cancelled)')
      .order('scheduled_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform and format response
    const transformedJobs = jobs.map(job => {
      const transformedJob = transformFromSupabase(job);
      transformedJob.customer = {
        id: job.customers.id,
        firstName: job.customers.first_name,
        lastName: job.customers.last_name,
        email: job.customers.email,
        phone: job.customers.phone,
        vehicleIds: job.customers.vehicle_ids || []
      };
      return transformedJob;
    });

    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching overdue jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
