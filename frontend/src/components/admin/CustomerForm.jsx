import React from 'react'

export default function CustomerForm({ onSubmit, onClose, saving = false, initial = {} }) {
  const [formData, setFormData] = React.useState({
    firstName: initial.firstName || '',
    lastName: initial.lastName || '',
    email: initial.email || '',
    phone: initial.phone || '',
    addressStreet: initial.address?.street || '',
    addressCity: initial.address?.city || '',
    addressPostalCode: initial.address?.postalCode || '',
    vehicles: Array.isArray(initial.vehicles) && initial.vehicles.length > 0
      ? initial.vehicles
      : [initial.vehicleInfo || { make: '', model: '', year: '', licensePlate: '' }]
  })

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

  const handleVehicleChange = (idx, key, value) => {
    setFormData(prev => {
      const vehicles = [...(prev.vehicles || [])]
      vehicles[idx] = { ...vehicles[idx], [key]: value }
      return { ...prev, vehicles }
    })
  }

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), { make: '', model: '', year: '', licensePlate: '' }]
    }))
  }

  const removeVehicle = (idx) => {
    setFormData(prev => ({
      ...prev,
      vehicles: (prev.vehicles || []).filter((_, i) => i !== idx)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      // First create the customer
      const customerPayload = {
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        address: {
          street: formData.addressStreet?.trim(),
          city: formData.addressCity?.trim(),
          postalCode: formData.addressPostalCode?.trim()
        },
        vehicleIds: [] // Start with empty array
      }
      
      // Create customer
      const customerResponse = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload)
      })
      
      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }
      
      const newCustomer = await customerResponse.json()
      
      // Create vehicles and add them to customer
      for (const vehicle of formData.vehicles || []) {
        if (vehicle.make?.trim() && vehicle.model?.trim() && vehicle.year?.trim() && vehicle.licensePlate?.trim()) {
          const vehicleData = {
            make: vehicle.make.trim(),
            model: vehicle.model.trim(),
            year: vehicle.year.toString().trim(),
            licensePlate: vehicle.licensePlate.toUpperCase().trim()
          }
          
          try {
            const vehicleResponse = await fetch(`${baseUrl}/customers/${newCustomer.id}/vehicles`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(vehicleData)
            })
            
            if (!vehicleResponse.ok) {
              console.warn('Failed to add vehicle to customer:', vehicleData)
            }
          } catch (vehicleError) {
            console.warn('Error adding vehicle to customer:', vehicleError)
          }
        }
      }
      
      onSubmit?.(newCustomer)
    } catch (error) {
      console.error('Error creating customer with vehicles:', error)
      alert('Failed to create customer: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{initial.id ? 'Edit' : 'Create'} Customer</h3>
            <button onClick={onClose} className="text-black/60 hover:text-black">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="+46xxxxxxxxx"
                  className="w-full px-3 py-2 border border-black/20 rounded" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Street</label>
                <input name="addressStreet" value={formData.addressStreet} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">City</label>
                <input name="addressCity" value={formData.addressCity} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Postal Code</label>
                <input name="addressPostalCode" value={formData.addressPostalCode} onChange={handleChange} required className="w-full px-3 py-2 border border-black/20 rounded" />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Vehicles</label>
                  <button type="button" onClick={addVehicle} className="text-sm underline">+ Add vehicle</button>
                </div>
                <div className="space-y-3">
                  {(formData.vehicles || []).map((v, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border border-black/10 rounded p-3">
                      <div>
                        <label className="block text-xs mb-1">Make</label>
                        <input value={v.make} onChange={(e) => handleVehicleChange(idx, 'make', e.target.value)} className="w-full px-3 py-2 border border-black/20 rounded" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Model</label>
                        <input value={v.model} onChange={(e) => handleVehicleChange(idx, 'model', e.target.value)} className="w-full px-3 py-2 border border-black/20 rounded" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Year</label>
                        <input value={v.year} onChange={(e) => handleVehicleChange(idx, 'year', e.target.value)} className="w-full px-3 py-2 border border-black/20 rounded" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">License Plate</label>
                        <div className="flex items-center gap-2">
                          <input value={v.licensePlate} onChange={(e) => handleVehicleChange(idx, 'licensePlate', e.target.value)} className="w-full px-3 py-2 border border-black/20 rounded" />
                          {(formData.vehicles || []).length > 1 && (
                            <button type="button" onClick={() => removeVehicle(idx)} className="text-xs px-2 py-1 border border-black/20 rounded">Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-black/60 mt-1">All vehicles will be created and associated with the customer.</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-black/20 rounded hover:bg-black/5">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


