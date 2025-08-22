-- Supabase Database Setup for TMS Booking System
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL CHECK (length(first_name) <= 50),
    last_name TEXT NOT NULL CHECK (length(last_name) <= 50),
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone TEXT NOT NULL CHECK (phone ~* '^[\+]?[1-9][\d]{0,15}$'),
    address_street TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_postal_code TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER NOT NULL CHECK (vehicle_year >= 1900 AND vehicle_year <= EXTRACT(YEAR FROM NOW()) + 1),
    vehicle_license_plate TEXT UNIQUE NOT NULL,
    notes TEXT CHECK (length(notes) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('service', 'repair', 'inspection', 'maintenance', 'other')),
    description TEXT NOT NULL CHECK (length(description) <= 1000),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration NUMERIC(4,1) NOT NULL CHECK (estimated_duration >= 0.5 AND estimated_duration <= 24),
    actual_duration NUMERIC(4,1) CHECK (actual_duration >= 0),
    cost_labor NUMERIC(10,2) DEFAULT 0 CHECK (cost_labor >= 0),
    cost_parts NUMERIC(10,2) DEFAULT 0 CHECK (cost_parts >= 0),
    cost_total NUMERIC(10,2) DEFAULT 0 CHECK (cost_total >= 0),
    technician TEXT,
    notes TEXT CHECK (length(notes) <= 1000),
    completed_date TIMESTAMP WITH TIME ZONE,
    customer_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_customers_license_plate ON customers(vehicle_license_plate);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate cost_total
CREATE OR REPLACE FUNCTION calculate_job_cost_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.cost_total = COALESCE(NEW.cost_labor, 0) + COALESCE(NEW.cost_parts, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically calculate cost_total
CREATE TRIGGER calculate_job_cost_total_trigger
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION calculate_job_cost_total();

-- Create RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for customers table (allow all operations for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL USING (true);

-- Policy for jobs table (allow all operations for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on jobs" ON jobs
    FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO customers (
    first_name, 
    last_name, 
    email, 
    phone, 
    address_street, 
    address_city, 
    address_postal_code, 
    vehicle_make, 
    vehicle_model, 
    vehicle_year, 
    vehicle_license_plate
) VALUES 
    ('John', 'Doe', 'john.doe@example.com', '+46701234567', 'Main Street 123', 'Stockholm', '12345', 'Honda', 'CBR600RR', 2020, 'ABC123'),
    ('Jane', 'Smith', 'jane.smith@example.com', '+46701234568', 'Oak Avenue 456', 'Gothenburg', '54321', 'Yamaha', 'YZF-R6', 2021, 'DEF456')
ON CONFLICT (email) DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (
    customer_id,
    job_type,
    description,
    priority,
    scheduled_date,
    estimated_duration,
    technician
) VALUES 
    ((SELECT id FROM customers WHERE email = 'john.doe@example.com'), 'service', 'Regular maintenance service', 'medium', NOW() + INTERVAL '1 day', 2, 'Mike Johnson'),
    ((SELECT id FROM customers WHERE email = 'jane.smith@example.com'), 'repair', 'Brake system repair', 'high', NOW() + INTERVAL '2 days', 3, 'Sarah Wilson')
ON CONFLICT DO NOTHING;

-- Create a view for jobs with customer information
CREATE OR REPLACE VIEW jobs_with_customers AS
SELECT 
    j.*,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.address_street,
    c.address_city,
    c.address_postal_code,
    c.vehicle_make,
    c.vehicle_model,
    c.vehicle_year,
    c.vehicle_license_plate
FROM jobs j
JOIN customers c ON j.customer_id = c.id;

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These are typically handled automatically by Supabase


