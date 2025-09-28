import React from 'react'

export default function CustomerList({ customers, loading, error, currentPage, totalPages, onPageChange, onSearch, onSelect }) {
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    const id = setTimeout(() => {
      onSearch?.(search)
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  return (
    <div className="bg-white border border-black/10 rounded-md overflow-hidden">
      <div className="p-4 border-b border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or license plate..."
            className="w-full px-3 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Vehicle(s)</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t border-black/10"><td className="px-4 py-3" colSpan="5">Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr className="border-t border-black/10"><td className="px-4 py-3 text-black/60" colSpan="5">No customers</td></tr>
            ) : customers.map(c => (
              <tr key={c.id} className="border-t border-black/10 hover:bg-black/5">
                <td className="px-4 py-3">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '-'}</td>
                <td className="px-4 py-3">{c.email || '-'}</td>
                <td className="px-4 py-3">{c.phone || '-'}</td>
                <td className="px-4 py-3">
                  {(() => {
                    const vehicles = Array.isArray(c.vehicles) && c.vehicles.length > 0
                      ? c.vehicles
                      : (c.vehicleInfo ? [c.vehicleInfo] : [])
                    if (vehicles.length === 0) return '-'
                    const primary = vehicles[0]
                    const label = `${primary.make || ''} ${primary.model || ''}`.trim() || '-'
                    const extra = vehicles.length > 1 ? ` +${vehicles.length - 1} more` : ''
                    return (
                      <span>{label}{extra}</span>
                    )
                  })()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelect?.(c)}
                    className="text-xs px-2 py-1 border border-black/20 rounded hover:bg-black/5"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-black/10 flex items-center justify-between">
          <div className="text-sm text-black/60">Page {currentPage} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-black/20 rounded text-sm disabled:opacity-50 hover:bg-black/5"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-black/20 rounded text-sm disabled:opacity-50 hover:bg-black/5"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


