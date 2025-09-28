import React, { useState } from 'react'

export default function BookingForm() {
  const [formData, setFormData] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    phone: '+46701234567',
    addressStreet: 'Testgatan 1',
    addressCity: 'Teststad',
    addressPostalCode: '12345',
    vehicleMake: 'Yamaha',
    vehicleModel: 'Aerox',
    vehicleYear: '2022',
    vehicleLicensePlate: 'ABC123',
    serviceType: 'repair',
    scheduledDate: '2025-09-30',
    estimatedDuration: 2.5, // For testing
    description: 'Testbokning för service och reparation.'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [adminMode, setAdminMode] = useState(false)

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
  const estimateDurationWithAI = async (serviceType, description, vehicleInfo) => {
    // TODO: Implement OpenAI integration
    // This is a placeholder that returns a reasonable default based on service type
    
    console.log('AI Duration Estimation - Service:', serviceType)
    console.log('AI Duration Estimation - Description:', description)
    console.log('AI Duration Estimation - Vehicle:', vehicleInfo)
    
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
      
      let customer
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
        vehicleInfo: {
          make: formData.vehicleMake.trim(),
          model: formData.vehicleModel.trim(),
          year: formData.vehicleYear ? parseInt(formData.vehicleYear, 10) : undefined,
          licensePlate: formData.vehicleLicensePlate.toUpperCase().trim()
        }
      }

      try {
        const customerResponse = await fetch(`${baseUrl}/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(customerData)
        })
        if (!customerResponse.ok) {
          // Try to parse backend error
          const errorData = await customerResponse.json()
          if (errorData.error && errorData.error.includes('already exists')) {
            // Fetch the customer by email using the search endpoint
            const existingCustomerResponse = await fetch(`${baseUrl}/customers?search=${encodeURIComponent(formData.email)}`)
            if (existingCustomerResponse.ok) {
              const data = await existingCustomerResponse.json()
              if (data.customers && data.customers.length > 0) {
                customer = data.customers.find(c => c.email.toLowerCase() === formData.email.trim().toLowerCase()) || data.customers[0]
              }
            }
            if (!customer) throw new Error('Customer with this email already exists')
          } else {
            throw new Error(errorData.error || 'Failed to create customer')
          }
        } else {
          customer = await customerResponse.json()
        }
      } catch (error) {
        throw error
      }
      
      // Estimate duration using AI (placeholder implementation)
      const vehicleInfo = {
        make: formData.vehicleMake.trim(),
        model: formData.vehicleModel.trim(),
        year: formData.vehicleYear
      }
      
      const estimatedDuration = await estimateDurationWithAI(
        formData.serviceType,
        formData.description.trim(),
        vehicleInfo
      )
      
      // Create job
      const jobData = {
        customer: customer.id,
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
        throw new Error('Failed to create job')
      }
      
      setIsSubmitting(false)
      setIsSubmitted(true)
      
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
    </div>
  )
}