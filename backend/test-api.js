const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testCustomer = {
  firstName: 'Test',
  lastName: 'Customer',
  email: 'test.supabase@example.com',
  phone: '+46701234567',
  address: {
    street: 'Test Street 123',
    city: 'Stockholm',
    postalCode: '12345'
  },
  vehicleInfo: {
    make: 'Yamaha',
    model: 'YZF-R6',
    year: 2021,
    licensePlate: 'TEST123'
  }
};

const testJob = {
  jobType: 'service',
  description: 'Test maintenance service',
  priority: 'medium',
  scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  estimatedDuration: 2
};

async function testAPI() {
  console.log('🧪 Testing TMS Backend API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test customer creation
    console.log('\n2. Testing customer creation...');
    const customerResponse = await axios.post(`${BASE_URL}/customers`, testCustomer);
    const customerId = customerResponse.data._id;
    console.log('✅ Customer created:', customerResponse.data._id);

    // Test customer retrieval
    console.log('\n3. Testing customer retrieval...');
    const getCustomerResponse = await axios.get(`${BASE_URL}/customers/${customerId}`);
    console.log('✅ Customer retrieved:', getCustomerResponse.data.firstName, getCustomerResponse.data.lastName);

    // Test customer search
    console.log('\n4. Testing customer search...');
    const searchResponse = await axios.get(`${BASE_URL}/customers?search=test&limit=5`);
    console.log('✅ Customer search:', searchResponse.data.totalCustomers, 'customers found');

    // Test job creation
    console.log('\n5. Testing job creation...');
    const jobData = { ...testJob, customer: customerId };
    const jobResponse = await axios.post(`${BASE_URL}/jobs`, jobData);
    const jobId = jobResponse.data._id;
    console.log('✅ Job created:', jobResponse.data._id);

    // Test job retrieval
    console.log('\n6. Testing job retrieval...');
    const getJobResponse = await axios.get(`${BASE_URL}/jobs/${jobId}`);
    console.log('✅ Job retrieved:', getJobResponse.data.description);

    // Test jobs by customer
    console.log('\n7. Testing jobs by customer...');
    const jobsByCustomerResponse = await axios.get(`${BASE_URL}/jobs/customer/${customerId}`);
    console.log('✅ Jobs by customer:', jobsByCustomerResponse.data.length, 'jobs found');

    // Test job status update
    console.log('\n8. Testing job status update...');
    const statusUpdateResponse = await axios.patch(`${BASE_URL}/jobs/${jobId}/status`, { status: 'in_progress' });
    console.log('✅ Job status updated:', statusUpdateResponse.data.status);

    // Test customer update
    console.log('\n9. Testing customer update...');
    const updateResponse = await axios.patch(`${BASE_URL}/customers/${customerId}`, { notes: 'Updated test customer' });
    console.log('✅ Customer updated:', updateResponse.data.notes);

    // Test pagination
    console.log('\n10. Testing pagination...');
    const paginationResponse = await axios.get(`${BASE_URL}/customers?page=1&limit=5`);
    console.log('✅ Pagination:', `Page ${paginationResponse.data.currentPage} of ${paginationResponse.data.totalPages}`);

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   - Customer ID: ${customerId}`);
    console.log(`   - Job ID: ${jobId}`);
    console.log(`   - API Base URL: ${BASE_URL}`);

  } catch (error) {
    console.error('\n❌ API test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
