import React, { useState, useEffect } from 'react'

export default function BookingForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleLicensePlate: '',
    serviceType: '',
    scheduledDate: '',
    estimatedDuration: null,
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [existingCustomer, setExistingCustomer] = useState(null)
  const [credentialMismatch, setCredentialMismatch] = useState(null)
  const [showCustomerOptions, setShowCustomerOptions] = useState(false)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [useRandomData, setUseRandomData] = useState(false)

  // Fetch existing customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${baseUrl}/customers?limit=100`)
        if (response.ok) {
          const data = await response.json()
          setCustomers(data.customers || [])
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  // Generate random data for testing
  const generateRandomData = () => {
    const firstNames = ['Anna', 'Erik', 'Maria', 'Lars', 'Sofia', 'Johan', 'Emma', 'Anders', 'Lisa', 'Mikael']
    const lastNames = ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson']
    const cities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping']
    const streets = ['Storgatan', 'Vasagatan', 'Drottninggatan', 'Kungsgatan', 'Birger Jarlsgatan', 'Hamngatan', 'Sveavägen', 'Odengatan', 'Götgatan', 'Kungsportsavenyn']
    const makes = ['Yamaha', 'Honda', 'KTM', 'Kawasaki', 'Suzuki', 'Aprilia', 'Ducati', 'BMW', 'Triumph', 'Harley-Davidson']
    const models = ['Aerox', 'PCX', 'Duke', 'Ninja', 'GSX-R', 'RSV4', 'Monster', 'S1000RR', 'Street Triple', 'Sportster']
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const randomCity = cities[Math.floor(Math.random() * cities.length)]
    const randomStreet = streets[Math.floor(Math.random() * streets.length)]
    const randomMake = makes[Math.floor(Math.random() * makes.length)]
    const randomModel = models[Math.floor(Math.random() * models.length)]
    
    const randomData = {
      firstName: randomFirstName,
      lastName: randomLastName,
      email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
      phone: `+46${Math.floor(Math.random() * 900000000) + 100000000}`,
      addressStreet: `${randomStreet} ${Math.floor(Math.random() * 200) + 1}`,
      addressCity: randomCity,
      addressPostalCode: `${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 90) + 10}`,
      vehicleMake: randomMake,
      vehicleModel: randomModel,
      vehicleYear: (2020 + Math.floor(Math.random() * 5)).toString(),
      vehicleLicensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900) + 100}`,
      serviceType: ['repair', 'maintenance', 'inspection', 'other'][Math.floor(Math.random() * 4)],
      scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Automatiskt genererad testbokning för utveckling och testning.'
    }
    
    setFormData(randomData)
    setUseRandomData(true)
  }

  // Populate form with selected customer data
  const populateFormWithCustomer = (customer) => {
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      addressStreet: customer.address?.street || '',
      addressCity: customer.address?.city || '',
      addressPostalCode: customer.address?.postalCode || '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleLicensePlate: '',
      serviceType: '',
      scheduledDate: '',
      estimatedDuration: null,
      description: ''
    })
    setSelectedCustomer(customer)
    setShowCustomerOptions(false)
  }

  // Clear form and reset selections
  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressStreet: '',
      addressCity: '',
      addressPostalCode: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleLicensePlate: '',
      serviceType: '',
      scheduledDate: '',
      estimatedDuration: null,
      description: ''
    })
    setSelectedCustomer(null)
    setUseRandomData(false)
  }

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.firstName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  )

  // Function to check if credentials match between form and existing customer
  const checkCredentialsMatch = (formData, existingCustomer, matchType) => {
    const mismatches = []
    
    // Check name
    if (formData.firstName?.trim().toLowerCase() !== existingCustomer.firstName?.toLowerCase() ||
        formData.lastName?.trim().toLowerCase() !== existingCustomer.lastName?.toLowerCase()) {
      mismatches.push('name')
    }
    
    // Check phone (normalize both for comparison)
    const formPhone = formData.phone?.replace(/\D/g, '')
    const existingPhone = existingCustomer.phone?.replace(/\D/g, '')
    if (formPhone !== existingPhone) {
      mismatches.push('phone')
    }
    
    // Check address
    if (formData.addressStreet?.trim().toLowerCase() !== existingCustomer.address?.street?.toLowerCase() ||
        formData.addressCity?.trim().toLowerCase() !== existingCustomer.address?.city?.toLowerCase() ||
        formData.addressPostalCode?.trim() !== existingCustomer.address?.postalCode) {
      mismatches.push('address')
    }
    
    // Add the match type to mismatches for display purposes
    mismatches.push(matchType)
    
    return {
      matches: mismatches.length === 1, // Only the match type should be present
      mismatches: mismatches
    }
  }

  // Handle confirmation modal responses
  const handleCancelMismatch = () => {
    setShowConfirmationModal(false)
    setExistingCustomer(null)
    setCredentialMismatch(null)
    setIsSubmitting(false)
  }

  // Function to proceed with booking after confirmation
  const proceedWithBooking = async (customerToUse) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      // Only create vehicle if vehicle fields are filled
      let vehicleId = null
      const hasVehicleData = formData.vehicleMake.trim() && formData.vehicleModel.trim() && formData.vehicleYear.trim() && formData.vehicleLicensePlate.trim()
      
      if (hasVehicleData) {
        // First, check if vehicle already exists by license plate
        const licensePlate = formData.vehicleLicensePlate.toUpperCase().trim()
        try {
          const vehicleSearchResponse = await fetch(`${baseUrl}/vehicles/search/${encodeURIComponent(licensePlate)}`)
          if (vehicleSearchResponse.ok) {
            const existingVehicle = await vehicleSearchResponse.json()
            vehicleId = existingVehicle.id
          }
        } catch {
          // No existing vehicle found, will create new one
        }
        
        // If vehicle doesn't exist, create it
        if (!vehicleId) {
          const vehicleData = {
            make: formData.vehicleMake.trim(),
            model: formData.vehicleModel.trim(),
            year: formData.vehicleYear.toString().trim(),
            licensePlate: formData.vehicleLicensePlate.toUpperCase().trim()
          }
          
          const vehicleResponse = await fetch(`${baseUrl}/vehicles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
          })
          
          if (!vehicleResponse.ok) {
            const errorData = await vehicleResponse.json()
            throw new Error(`Failed to create vehicle: ${JSON.stringify(errorData)}`)
          }
          
          const newVehicle = await vehicleResponse.json()
          vehicleId = newVehicle.id
          
          // Add vehicle to customer
          const addVehicleResponse = await fetch(`${baseUrl}/customers/${customerToUse.id}/vehicles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
          })
          
          if (!addVehicleResponse.ok) {
            console.warn('Failed to add vehicle to customer, but continuing with booking')
          }
        }
      }
      
      // Estimate duration using AI (placeholder implementation)
      const estimatedDuration = await estimateDurationWithAI(
        formData.serviceType
      )
      
      // Create job
      const jobData = {
        customer: customerToUse.id,
        description: formData.description.trim(),
        jobType: formData.serviceType,
        priority: 'medium',
        scheduledDate: formData.scheduledDate,
        estimatedDuration: estimatedDuration,
        status: 'pending'
      }
      
      const jobResponse = await fetch(`${baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      })
      
      if (!jobResponse.ok) {
        const errorData = await jobResponse.json()
        throw new Error(`Failed to create job: ${JSON.stringify(errorData)}`)
      }
      
      setIsSubmitting(false)
      setIsSubmitted(true)
      
      // Show success message
      
      // Reset form after showing success message
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          addressStreet: '',
          addressCity: '',
          addressPostalCode: '',
          vehicleMake: '',
          vehicleModel: '',
          vehicleYear: '',
          vehicleLicensePlate: '',
          serviceType: '',
          scheduledDate: '',
          estimatedDuration: null,
          description: ''
        })
      }, 3000)
      
    } catch (error) {
      console.error('Booking error:', error)
      setIsSubmitting(false)
      alert('Ett fel uppstod vid bokningen. Försök igen eller kontakta oss direkt.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      // Format phone number as +46xxxxxxxxx
      const cleaned = value.replace(/\D/g, '') // Remove all non-digits
      let formatted = cleaned
      
      if (cleaned.length > 0) {
        if (cleaned.startsWith('46')) {
          // Already has country code
          formatted = '+' + cleaned
        } else if (cleaned.startsWith('0')) {
          // Remove leading 0 and add +46
          formatted = '+46' + cleaned.substring(1)
        } else if (cleaned.length >= 9) {
          // Add +46 prefix
          formatted = '+46' + cleaned
        } else {
          // Keep as is for partial input
          formatted = cleaned
        }
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // AI Duration Estimation Function (placeholder for future implementation)
  const estimateDurationWithAI = async (serviceType) => {
    // TODO: Implement OpenAI integration
    // This is a placeholder that returns a reasonable default based on service type
    
    const durationMap = {
      'repair': 2.5, // Repairs typically take 2-3 hours
      'maintenance': 1.5, // Regular maintenance 1-2 hours
      'inspection': 1, // Inspections usually 1 hour
      'other': 2 // Default for other services
    }
    
    // For now, return a default duration based on service type
    // In the future, this will call OpenAI with the description and vehicle info
    return durationMap[serviceType] || 2
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        // First, check if customer already exists by email OR phone
        
        // Search by email
        const emailSearchResponse = await fetch(`${baseUrl}/customers?search=${encodeURIComponent(formData.email.trim())}`)
        let existingCustomerByEmail = null
        if (emailSearchResponse.ok) {
          const emailData = await emailSearchResponse.json()
          existingCustomerByEmail = emailData.customers?.find(c => 
            c.email.toLowerCase() === formData.email.trim().toLowerCase()
          )
        }
        
        // Search by phone (normalize phone numbers for comparison)
        const normalizedFormPhone = formData.phone.replace(/\D/g, '')
        const allCustomersResponse = await fetch(`${baseUrl}/customers?limit=1000`)
        let existingCustomerByPhone = null
        if (allCustomersResponse.ok) {
          const allData = await allCustomersResponse.json()
          existingCustomerByPhone = allData.customers?.find(c => {
            const normalizedCustomerPhone = c.phone?.replace(/\D/g, '')
            return normalizedCustomerPhone === normalizedFormPhone
          })
        }
        
        // Check if we found any existing customer
        const existingCustomer = existingCustomerByEmail || existingCustomerByPhone
        const matchType = existingCustomerByEmail ? 'email' : 'phone'
        
        if (existingCustomer) {
          // Check if credentials match
          const credentialCheck = checkCredentialsMatch(formData, existingCustomer, matchType)
          
          if (!credentialCheck.matches) {
            // Credentials don't match - show confirmation modal
            setExistingCustomer(existingCustomer)
            setCredentialMismatch(credentialCheck.mismatches)
            setShowConfirmationModal(true)
            setIsSubmitting(false)
            return // Stop here, wait for user confirmation
          }
          
          // Credentials match - proceed with booking (vehicle will be created/added separately)
          await proceedWithBooking(existingCustomer)
          return
        }
        
        // No existing customer found - create new one
        const customerData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: {
            street: formData.addressStreet.trim(),
            city: formData.addressCity.trim(),
            postalCode: formData.addressPostalCode.trim()
          },
          vehicleIds: [] // Start with empty vehicle array
        }

        const customerResponse = await fetch(`${baseUrl}/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData)
        })
        
        if (!customerResponse.ok) {
          const errorData = await customerResponse.json()
          throw new Error(errorData.error || 'Failed to create customer')
        }
        
        const newCustomer = await customerResponse.json()
        
        // Proceed with booking using new customer
        await proceedWithBooking(newCustomer)
      
    } catch (error) {
      console.error('Booking error:', error)
      setIsSubmitting(false)
      alert(`Ett fel uppstod vid bokningen: ${error.message}. Försök igen eller kontakta oss direkt.`)
    }
  }


  if (isSubmitted) {
    return (
      <div className='bg-gray-900 py-16 px-5 animate-fadeIn'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-green-900/20 border border-green-500/30 rounded-lg p-8 animate-bounceIn'>
            <div className='text-green-400 text-6xl mb-4'>✓</div>
            <h3 className='text-2xl font-bold text-green-400 mb-4'>Bokning mottagen!</h3>
            <p className='text-green-300'>
              Tack för din bokning! Vi kontaktar dig inom 24 timmar för att bekräfta din tid.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-900 py-16 px-5'>
      <div className='max-w-2xl mx-auto'>
        {adminMode && (
            <div className="text-center mb-4">
              <button 
                onClick={() => window.location.href = '/admin'}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Admin Dashboard
              </button>
            </div>
          )}
        <h2 className='text-3xl font-bold bg-gradient-to-r from-[#00BFEC] to-[#00AFDF] text-transparent bg-clip-text text-center mb-8 animate-fadeInDown'
        onDoubleClick={() => setAdminMode(!adminMode)}>
          Boka Service
        </h2>

        {/* Customer Options Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <button
              type="button"
              onClick={() => setShowCustomerOptions(!showCustomerOptions)}
              className={`px-4 py-2 rounded transition-all duration-300 ${
                showCustomerOptions 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {showCustomerOptions ? 'Dölj befintliga kunder' : 'Välj befintlig kund'}
            </button>
            
            <button
              type="button"
              onClick={generateRandomData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              Generera slumpmässig data
            </button>
            
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-all duration-300"
            >
              Rensa formulär
            </button>
          </div>

          {/* Selected Customer Display */}
          {(selectedCustomer || useRandomData) && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-sm">
                <strong>Vald kund:</strong> {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName} (${selectedCustomer.email})` : 'Slumpmässig data genererad'}
              </p>
            </div>
          )}

          {/* Customer Selection Dropdown */}
          {showCustomerOptions && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Sök kunder..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-[#00BFEC] focus:outline-none"
              />
              
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => populateFormWithCustomer(customer)}
                      className="bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-pointer transition-colors duration-200 border border-gray-600 hover:border-[#00BFEC]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-gray-300 text-sm">{customer.email}</p>
                          <p className="text-gray-400 text-xs">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">
                            {customer.address?.city}, {customer.address?.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    {customerSearchTerm ? 'Inga kunder hittades' : 'Inga kunder tillgängliga'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className='space-y-6 animate-fadeInUp'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideInLeft'>
            <input
              type='text'
              name='firstName'
              placeholder='Förnamn *'
              value={formData.firstName}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='lastName'
              placeholder='Efternamn *'
              value={formData.lastName}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideInRight'>
            <input
              type='email'
              name='email'
              placeholder='E-post *'
              value={formData.email}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='tel'
              name='phone'
              placeholder='Telefon * (+46xxxxxxxxx)'
              value={formData.phone}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideInLeft'>
            <input
              type='text'
              name='addressStreet'
              placeholder='Gatuadress *'
              value={formData.addressStreet}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='addressCity'
              placeholder='Stad *'
              value={formData.addressCity}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='addressPostalCode'
              placeholder='Postnummer *'
              value={formData.addressPostalCode}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideInRight'>
            <input
              type='text'
              name='vehicleMake'
              placeholder='Märke *'
              value={formData.vehicleMake}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='vehicleModel'
              placeholder='Modell *'
              value={formData.vehicleModel}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='number'
              name='vehicleYear'
              placeholder='Årsmodell *'
              value={formData.vehicleYear}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='vehicleLicensePlate'
              placeholder='Registreringsnummer *'
              value={formData.vehicleLicensePlate}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideInLeft'>
            <select
              name='serviceType'
              value={formData.serviceType}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            >
              <option value=''>Typ av service *</option>
              <option value='repair'>Reparation</option>
              <option value='maintenance'>Årlig service</option>
              <option value='inspection'>Besiktning</option>
              <option value='other'>Övrigt</option>
            </select>
            <div>
              <label className='block text-gray-300 text-sm mb-2 animate-fadeIn'>Önskad datum *</label>
              <input
                type='date'
                name='scheduledDate'
                value={formData.scheduledDate}
                onChange={handleChange}
                className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none w-full transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
                title='Önskad datum (vi kontaktar dig för bekräftelse)'
                required
              />
            </div>
          </div>
          
          <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 animate-pulse animate-once'>
            <p className='text-blue-300 text-sm text-center'>
              <strong>AI-estimering:</strong> Vi använder AI för att automatiskt uppskatta servicetiden baserat på din beskrivning och fordonstyp. Datum och tid är endast önskemål - vi kontaktar dig inom 24 timmar för att bekräfta tillgänglighet.
            </p>
          </div>

          <textarea
            name='description'
            placeholder='Beskriv problemet eller önskad service med så stor detalj som möjligt *'
            value={formData.description}
            onChange={handleChange}
            rows='4'
            className='w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105 animate-slideInUp'
            required
          />
          
          <p className='text-gray-400 text-sm text-center animate-fadeIn'>
            * Obligatoriska fält. Vi kontaktar dig inom 24 timmar för att bekräfta din bokning.
          </p>

          <button
            type='submit'
            disabled={isSubmitting}
            className={`w-full font-bold py-3 px-6 rounded transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isSubmitting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#00BFEC] to-[#00AFDF] hover:from-[#00AFDF] hover:to-[#00BFEC]'
            } text-white animate-bounceIn`}
          >
            {isSubmitting ? (
              <div className='flex items-center justify-center space-x-2'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                <span>Skickar...</span>
              </div>
            ) : (
              'Boka Service'
            )}
          </button>
        </form>
      </div>

      {/* Confirmation Modal for Credential Mismatch */}
      {showConfirmationModal && existingCustomer && credentialMismatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Bekräfta kunduppgifter
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                En kund med denna {credentialMismatch.includes('email') ? 'e-postadress' : 'telefonnummer'} finns redan i systemet:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">Matchande identifierare:</p>
                <div className="text-sm text-gray-700">
                  {credentialMismatch.includes('email') ? (
                    <p><strong>E-post:</strong> {existingCustomer.email}</p>
                  ) : (
                    <p><strong>Telefon:</strong> {existingCustomer.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Dina uppgifter:</p>
                <div className="text-sm text-gray-700">
                  <p><strong>Namn:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>E-post:</strong> {formData.email}</p>
                  <p><strong>Telefon:</strong> {formData.phone}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Detta kan bero på att:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                <li>Du redan har ett konto med denna {credentialMismatch.includes('email') ? 'e-postadress' : 'telefonnummer'}</li>
                <li>Du har använt en annan persons {credentialMismatch.includes('email') ? 'e-postadress' : 'telefonnummer'}</li>
                <li>Det finns ett skrivfel i dina uppgifter</li>
              </ul>
              
              <p className="text-sm text-gray-600">
                Kontrollera dina uppgifter och försök igen med rätt information.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleCancelMismatch}
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
              >
                Stäng och kontrollera uppgifterna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}