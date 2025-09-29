const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { 
  vehicleTable, 
  validateVehicle, 
  transformToSupabase, 
  transformFromSupabase 
} = require('../models/Vehicle');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/vehicles - Get all vehicles with optional search
router.get('/', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from(vehicleTable)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search functionality
    if (search) {
      query = query.or(`vehicle_make.ilike.%${search}%,vehicle_model.ilike.%${search}%,vehicle_license_plate.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
      return res.status(500).json({ error: 'Failed to fetch vehicles' });
    }

    // Transform data to camelCase
    const vehicles = data.map(transformFromSupabase);

    res.json({
      vehicles,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error in GET /vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vehicles/:id - Get a specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(vehicleTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      console.error('Error fetching vehicle:', error);
      return res.status(500).json({ error: 'Failed to fetch vehicle' });
    }

    res.json(transformFromSupabase(data));
  } catch (error) {
    console.error('Error in GET /vehicles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vehicles - Create a new vehicle
router.post('/', async (req, res) => {
  try {
    const vehicleData = req.body;

    // Validate vehicle data
    const validationErrors = validateVehicle(vehicleData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Transform data for Supabase
    const supabaseData = transformToSupabase(vehicleData);

    const { data, error } = await supabase
      .from(vehicleTable)
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Vehicle with this license plate already exists' });
      }
      return res.status(500).json({ error: 'Failed to create vehicle' });
    }

    res.status(201).json(transformFromSupabase(data));
  } catch (error) {
    console.error('Error in POST /vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/vehicles/:id - Update a vehicle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;

    // Validate vehicle data
    const validationErrors = validateVehicle(vehicleData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Transform data for Supabase
    const supabaseData = transformToSupabase(vehicleData);

    const { data, error } = await supabase
      .from(vehicleTable)
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Vehicle with this license plate already exists' });
      }
      console.error('Error updating vehicle:', error);
      return res.status(500).json({ error: 'Failed to update vehicle' });
    }

    res.json(transformFromSupabase(data));
  } catch (error) {
    console.error('Error in PUT /vehicles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from(vehicleTable)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return res.status(500).json({ error: 'Failed to delete vehicle' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /vehicles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/vehicles/search/:licensePlate - Search vehicle by license plate
router.get('/search/:licensePlate', async (req, res) => {
  try {
    const { licensePlate } = req.params;

    const { data, error } = await supabase
      .from(vehicleTable)
      .select('*')
      .eq('vehicle_license_plate', licensePlate.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      console.error('Error searching vehicle:', error);
      return res.status(500).json({ error: 'Failed to search vehicle' });
    }

    res.json(transformFromSupabase(data));
  } catch (error) {
    console.error('Error in GET /vehicles/search/:licensePlate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
