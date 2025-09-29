const express = require('express');
const { supabase } = require('../config/supabase');
const { 
  customerTable, 
  validateCustomer, 
  transformToSupabase, 
  transformFromSupabase 
} = require('../models/Customer');

const router = express.Router();

// GET all customers with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    let query = supabase
      .from(customerTable)
      .select('*', { count: 'exact' });

    // Add search functionality
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: customers, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform data back to camelCase and fetch vehicles for each customer
    const transformedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const transformedCustomer = transformFromSupabase(customer);
        
        // Fetch vehicles for this customer
        if (customer.vehicle_ids && customer.vehicle_ids.length > 0) {
          try {
            const { data: vehicles, error: vehiclesError } = await supabase
              .from('vehicles')
              .select('*')
              .in('id', customer.vehicle_ids);
            
            if (!vehiclesError && vehicles) {
              const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
              transformedCustomer.vehicles = vehicles.map(transformVehicle);
            }
          } catch (error) {
            console.error('Error fetching vehicles for customer:', error);
          }
        }
        
        return transformedCustomer;
      })
    );

    res.json({
      customers: transformedCustomers,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCustomers: count
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: customer, error } = await supabase
      .from(customerTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transformedCustomer = transformFromSupabase(customer);
    
    // Fetch vehicles for this customer
    if (customer.vehicle_ids && customer.vehicle_ids.length > 0) {
      try {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', customer.vehicle_ids);
        
        if (!vehiclesError && vehicles) {
          const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
          transformedCustomer.vehicles = vehicles.map(transformVehicle);
        }
      } catch (error) {
        console.error('Error fetching vehicles for customer:', error);
      }
    }
    
    res.json(transformedCustomer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  try {
    // Transform data to snake_case for Supabase
    const supabaseData = transformToSupabase(req.body);
    
    // Validate data
    const validationErrors = validateCustomer(supabaseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { data: customer, error } = await supabase
      .from(customerTable)
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          error: 'Customer with this email already exists' 
        });
      }
      throw error;
    }

    const transformedCustomer = transformFromSupabase(customer);
    res.status(201).json(transformedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update customer (full update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Transform data to snake_case for Supabase
    const supabaseData = transformToSupabase(req.body);
    
    // Validate data
    const validationErrors = validateCustomer(supabaseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { data: customer, error } = await supabase
      .from(customerTable)
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          error: 'Customer with this email already exists' 
        });
      }
      throw error;
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transformedCustomer = transformFromSupabase(customer);
    res.json(transformedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH partial update customer
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
      const validationErrors = validateCustomer(fieldsToValidate);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
    }

    const { data: customer, error } = await supabase
      .from(customerTable)
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          error: 'Customer with this email already exists' 
        });
      }
      throw error;
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transformedCustomer = transformFromSupabase(customer);
    res.json(transformedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from(customerTable)
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw error;
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET customers with their vehicles
router.get('/:id/vehicles', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get customer with vehicle details
    const { data: customer, error: customerError } = await supabase
      .from(customerTable)
      .select('*')
      .eq('id', id)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Customer not found' });
      }
      throw customerError;
    }

    if (!customer.vehicle_ids || customer.vehicle_ids.length === 0) {
      return res.json({ vehicles: [] });
    }

    // Get vehicle details
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .in('id', customer.vehicle_ids);

    if (vehiclesError) {
      throw vehiclesError;
    }

    // Transform vehicle data
    const { transformFromSupabase: transformVehicle } = require('../models/Vehicle');
    const transformedVehicles = vehicles.map(transformVehicle);

    res.json({ vehicles: transformedVehicles });
  } catch (error) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST add vehicle to customer
router.post('/:id/vehicles', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;

    // Validate vehicle data
    const { validateVehicle, transformToSupabase: transformVehicle } = require('../models/Vehicle');
    const validationErrors = validateVehicle(vehicleData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Create vehicle
    const supabaseVehicleData = transformVehicle(vehicleData);
    const { data: newVehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert([supabaseVehicleData])
      .select()
      .single();

    if (vehicleError) {
      if (vehicleError.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Vehicle with this license plate already exists' });
      }
      throw vehicleError;
    }

    // Add vehicle ID to customer's vehicle_ids array
    const { data: customer, error: customerError } = await supabase
      .from(customerTable)
      .select('vehicle_ids')
      .eq('id', id)
      .single();

    if (customerError) {
      throw customerError;
    }

    const updatedVehicleIds = [...(customer.vehicle_ids || []), newVehicle.id];
    
    const { error: updateError } = await supabase
      .from(customerTable)
      .update({ vehicle_ids: updatedVehicleIds })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Transform and return the new vehicle
    const { transformFromSupabase: transformVehicleFromSupabase } = require('../models/Vehicle');
    res.status(201).json(transformVehicleFromSupabase(newVehicle));
  } catch (error) {
    console.error('Error adding vehicle to customer:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
