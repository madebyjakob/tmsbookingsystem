import React from 'react'

export default function CustomerDetail({ customer, onClose }) {
  if (!customer) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Customer Details</h3>
            <button onClick={onClose} className="text-black/60 hover:text-black">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Personal</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '-'}</div>
                <div><span className="font-medium">Email:</span> {customer.email || '-'}</div>
                <div><span className="font-medium">Phone:</span> {customer.phone || '-'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Address</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Street:</span> {customer.address?.street || '-'}</div>
                <div><span className="font-medium">City:</span> {customer.address?.city || '-'}</div>
                <div><span className="font-medium">Postal Code:</span> {customer.address?.postalCode || '-'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Vehicles</h4>
              {(() => {
                const vehicles = Array.isArray(customer.vehicles) && customer.vehicles.length > 0
                  ? customer.vehicles
                  : (customer.vehicleInfo ? [customer.vehicleInfo] : [])
                if (vehicles.length === 0) return <div className="text-sm">-</div>
                return (
                  <div className="space-y-3 text-sm">
                    {vehicles.map((v, idx) => (
                      <div key={idx} className="border border-black/10 rounded p-2">
                        <div><span className="font-medium">Make:</span> {v.make || '-'}</div>
                        <div><span className="font-medium">Model:</span> {v.model || '-'}</div>
                        <div><span className="font-medium">Year:</span> {v.year || '-'}</div>
                        <div><span className="font-medium">Plate:</span> {v.licensePlate || '-'}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


