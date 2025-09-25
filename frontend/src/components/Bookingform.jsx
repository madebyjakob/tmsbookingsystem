import React, { useState } from 'react'

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mopedBrand: '',
    mopedModel: '',
    registrationNumber: '',
    serviceType: '',
    date: '',
    time: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [adminMode, setAdminMode] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Booking data:', formData)
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after showing success message
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        mopedBrand: '',
        mopedModel: '',
        registrationNumber: '',
        serviceType: '',
        date: '',
        time: '',
        description: ''
      })
    }, 3000)
  }

  const getAvailableTimes = () => {
    if (!formData.date) return []
    const selectedDate = new Date(formData.date)
    const dayOfWeek = selectedDate.getDay()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      return ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    } else { // Weekday
      return ['17:00', '18:00', '19:00', '20:00']
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
              name='name'
              placeholder='Namn *'
              value={formData.name}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='email'
              name='email'
              placeholder='E-post *'
              value={formData.email}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideInRight'>
            <input
              type='tel'
              name='phone'
              placeholder='Telefon *'
              value={formData.phone}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='mopedBrand'
              placeholder='Märke *'
              value={formData.mopedBrand}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideInLeft'>
            <input
              type='text'
              name='mopedModel'
              placeholder='Modell *'
              value={formData.mopedModel}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            />
            <input
              type='text'
              name='registrationNumber'
              placeholder='Registreringsnummer'
              value={formData.registrationNumber}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
            />
            <select
              name='serviceType'
              value={formData.serviceType}
              onChange={handleChange}
              className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
              required
            >
              <option value=''>Typ av service *</option>
              <option value='Årlig service'>Årlig service</option>
              <option value='Storservice'>Storservice</option>
              <option value='Reparation'>Reparation</option>
              <option value='Övrigt'>Övrigt</option>
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideInRight'>
            <div>
              <label className='block text-gray-300 text-sm mb-2 animate-fadeIn'>Önskad datum *</label>
              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleChange}
                className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none w-full transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
                title='Önskad datum (vi kontaktar dig för bekräftelse)'
                required
              />
            </div>
            <div>
              <label className='block text-gray-300 text-sm mb-2 animate-fadeIn'>Önskad tid *</label>
              <select
                name='time'
                value={formData.time}
                onChange={handleChange}
                className='bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-[#00BFEC] focus:outline-none w-full transition-all duration-300 hover:bg-gray-750 hover:scale-105 focus:scale-105'
                required
              >
                <option value=''>Välj önskad tid</option>
                {getAvailableTimes().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 animate-pulse animate-once'>
            <p className='text-blue-300 text-sm text-center'>
              <strong>Viktigt:</strong> Datum och tid är endast önskemål. Vi kontaktar dig inom 24 timmar för att bekräfta tillgänglighet och boka din faktiska tid.
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