import React from 'react'
import CustomerList from './CustomerList'
import CustomerDetail from './CustomerDetail'
import CustomerForm from './CustomerForm'

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [selected, setSelected] = React.useState(null)
  const [showCreate, setShowCreate] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const itemsPerPage = 10

  React.useEffect(() => {
    loadCustomers()
  }, [currentPage, search])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError('')

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      if (search) params.append('search', search)

      const res = await fetch(`${baseUrl}/customers?${params}`)
      if (!res.ok) throw new Error('Failed to load customers')
      const data = await res.json()
      setCustomers(data.customers || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (payload) => {
    try {
      setSaving(true)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      console.log('Payload being sent:', payload);
      const res = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to create customer')
      }
      setShowCreate(false)
      await loadCustomers()
    } catch (err) {
      setError(err.message || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-black">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Customers</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-black text-white rounded hover:bg-black/80">+ Create Customer</button>
          <a href="/admin" className="text-sm underline">← Back to Dashboard</a>
        </div>
      </div>

      <CustomerList
        customers={customers}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearch={(v) => { setCurrentPage(1); setSearch(v) }}
        onSelect={setSelected}
      />

      {selected && (
        <CustomerDetail customer={selected} onClose={() => setSelected(null)} />
      )}

      {showCreate && (
        <CustomerForm onSubmit={createCustomer} onClose={() => setShowCreate(false)} saving={saving} />
      )}
    </div>
  )
}


