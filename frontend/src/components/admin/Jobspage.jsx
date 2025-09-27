import React from 'react'

export default function Jobspage() {
  const [jobs, setJobs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [editingJob, setEditingJob] = React.useState(null)
  const [updating, setUpdating] = React.useState(false)
  const [selectedJob, setSelectedJob] = React.useState(null)
  const [showJobDetail, setShowJobDetail] = React.useState(false)
  const [showCreateJob, setShowCreateJob] = React.useState(false)
  const [customers, setCustomers] = React.useState([])
  const [loadingCustomers, setLoadingCustomers] = React.useState(false)
  const [creatingJob, setCreatingJob] = React.useState(false)

  const statusOptions = ['', 'pending', 'in_progress', 'completed', 'cancelled']
  const itemsPerPage = 10

  React.useEffect(() => {
    loadJobs()
  }, [currentPage, statusFilter, searchTerm])

  React.useEffect(() => {
    if (showCreateJob) {
      loadCustomers()
    }
  }, [showCreateJob])

  const loadJobs = async () => {
    try {
      setLoading(true)
      setError('')
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'scheduled_date',
        sortOrder: 'desc'
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${baseUrl}/jobs?${params}`)
      if (!response.ok) throw new Error('Failed to load jobs')
      
      const data = await response.json()
      setJobs(data.jobs || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/customers?limit=100&sortBy=first_name&sortOrder=asc`)
      if (!response.ok) throw new Error('Failed to load customers')
      
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (err) {
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const viewJobDetail = async (jobId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/jobs/${jobId}`)
      if (!response.ok) throw new Error('Failed to load job details')
      
      const job = await response.json()
      setSelectedJob(job)
      setShowJobDetail(true)
    } catch (err) {
      setError(err.message || 'Failed to load job details')
    }
  }

  const acceptJob = async (jobId) => {
    try {
      setUpdating(true)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${baseUrl}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'in_progress' })
      })
      
      if (!response.ok) throw new Error('Failed to accept job')
      
      await loadJobs()
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, status: 'in_progress' })
      }
    } catch (err) {
      setError(err.message || 'Failed to accept job')
    } finally {
      setUpdating(false)
    }
  }

  const createJob = async (jobData) => {
    try {
      setCreatingJob(true)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job')
      }
      
      await loadJobs()
      setShowCreateJob(false)
    } catch (err) {
      setError(err.message || 'Failed to create job')
    } finally {
      setCreatingJob(false)
    }
  }

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      setUpdating(true)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${baseUrl}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update job status')
      
      // Reload jobs to reflect changes
      await loadJobs()
    } catch (err) {
      setError(err.message || 'Failed to update job status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('sv-SE')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-black">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Jobs Management</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateJob(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/80 transition-colors"
          >
            + Create Job
          </button>
          <a href="/admin" className="text-sm underline">← Back to Dashboard</a>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-400 text-red-700 rounded-md p-3 bg-white">{error}</div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white border border-black/10 rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-black/10 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-black/10">
                  <td className="px-4 py-4 text-center" colSpan="7">Loading...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr className="border-t border-black/10">
                  <td className="px-4 py-4 text-center text-black/60" colSpan="7">No jobs found</td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.id} className="border-t border-black/10 hover:bg-black/5">
                    <td className="px-4 py-4">
                      <div className="font-medium">{formatDate(job.scheduledDate)}</div>
                      {job.completedDate && (
                        <div className="text-xs text-black/60">Completed: {formatDate(job.completedDate)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : '-'}
                      </div>
                      <div className="text-xs text-black/60">{job.customer?.email || '-'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        {job.customer?.vehicleInfo ? 
                          `${job.customer.vehicleInfo.make || ''} ${job.customer.vehicleInfo.model || ''}`.trim() || '-' 
                          : '-'
                        }
                      </div>
                      <div className="text-xs text-black/60">
                        {job.customer?.vehicleInfo?.licensePlate || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="truncate" title={job.description}>
                        {job.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 border rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{formatCurrency(job.costTotal)}</div>
                      {(job.costLabor || job.costParts) && (
                        <div className="text-xs text-black/60">
                          L: {formatCurrency(job.costLabor)} | P: {formatCurrency(job.costParts)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewJobDetail(job.id)}
                          className="text-xs px-2 py-1 border border-black/20 rounded hover:bg-black/5 transition-colors"
                        >
                          View
                        </button>
                        <select
                          value={job.status || ''}
                          onChange={(e) => updateJobStatus(job.id, e.target.value)}
                          disabled={updating}
                          className="text-xs px-2 py-1 border border-black/20 rounded focus:outline-none focus:ring-1 focus:ring-black/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-black/10 flex items-center justify-between">
            <div className="text-sm text-black/60">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-black/20 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-black/20 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {showJobDetail && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Job Details</h3>
                <button
                  onClick={() => setShowJobDetail(false)}
                  className="text-black/60 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Information */}
                <div>
                  <h4 className="font-medium mb-3">Job Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedJob.id}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 border rounded text-xs ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Priority:</span> {selectedJob.priority || '-'}</div>
                    <div><span className="font-medium">Job Type:</span> {selectedJob.jobType || '-'}</div>
                    <div><span className="font-medium">Scheduled Date:</span> {formatDate(selectedJob.scheduledDate)}</div>
                    <div><span className="font-medium">Completed Date:</span> {formatDate(selectedJob.completedDate)}</div>
                    <div><span className="font-medium">Technician:</span> {selectedJob.technician || '-'}</div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-medium mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedJob.customer ? `${selectedJob.customer.firstName} ${selectedJob.customer.lastName}` : '-'}</div>
                    <div><span className="font-medium">Email:</span> {selectedJob.customer?.email || '-'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedJob.customer?.phone || '-'}</div>
                    <div><span className="font-medium">Address:</span> {selectedJob.customer?.address ? `${selectedJob.customer.address.street}, ${selectedJob.customer.address.city} ${selectedJob.customer.address.postalCode}` : '-'}</div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h4 className="font-medium mb-3">Vehicle Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Make:</span> {selectedJob.customer?.vehicleInfo?.make || '-'}</div>
                    <div><span className="font-medium">Model:</span> {selectedJob.customer?.vehicleInfo?.model || '-'}</div>
                    <div><span className="font-medium">Year:</span> {selectedJob.customer?.vehicleInfo?.year || '-'}</div>
                    <div><span className="font-medium">License Plate:</span> {selectedJob.customer?.vehicleInfo?.licensePlate || '-'}</div>
                  </div>
                </div>

                {/* Cost Information */}
                <div>
                  <h4 className="font-medium mb-3">Cost Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Labor Cost:</span> {formatCurrency(selectedJob.costLabor)}</div>
                    <div><span className="font-medium">Parts Cost:</span> {formatCurrency(selectedJob.costParts)}</div>
                    <div><span className="font-medium">Total Cost:</span> <span className="font-semibold">{formatCurrency(selectedJob.costTotal)}</span></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Description</h4>
                <div className="text-sm bg-black/5 p-3 rounded border">
                  {selectedJob.description || 'No description provided'}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                {selectedJob.status === 'pending' && (
                  <button
                    onClick={() => acceptJob(selectedJob.id)}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? 'Accepting...' : 'Accept Job'}
                  </button>
                )}
                <button
                  onClick={() => setShowJobDetail(false)}
                  className="px-4 py-2 border border-black/20 rounded hover:bg-black/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobForm
          customers={customers}
          loadingCustomers={loadingCustomers}
          creatingJob={creatingJob}
          onCreateJob={createJob}
          onClose={() => setShowCreateJob(false)}
        />
      )}
    </div>
  )
}

// Create Job Form Component
function CreateJobForm({ customers, loadingCustomers, creatingJob, onCreateJob, onClose }) {
  const [formData, setFormData] = React.useState({
    customer: '',
    description: '',
    jobType: '',
    priority: 'medium',
    scheduledDate: '',
    technician: '',
    costLabor: '',
    costParts: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert form data to API format
    const jobData = {
      customer: parseInt(formData.customer),
      description: formData.description,
      job_type: formData.jobType,
      priority: formData.priority,
      scheduled_date: formData.scheduledDate,
      technician: formData.technician,
      cost_labor: parseFloat(formData.costLabor) || 0,
      cost_parts: parseFloat(formData.costParts) || 0,
      status: 'pending'
    }

    onCreateJob(jobData)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Create New Job</h3>
            <button
              onClick={onClose}
              className="text-black/60 hover:text-black"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer *</label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                  disabled={loadingCustomers}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="">Select customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} - {customer.vehicleMake} {customer.vehicleModel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="">Select type...</option>
                  <option value="repair">Repair</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Technician</label>
                <input
                  type="text"
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Labor Cost (SEK)</label>
                <input
                  type="number"
                  step="0.01"
                  name="costLabor"
                  value={formData.costLabor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parts Cost (SEK)</label>
                <input
                  type="number"
                  step="0.01"
                  name="costParts"
                  value={formData.costParts}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-black/20 rounded focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Describe the work to be performed..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={creatingJob || loadingCustomers}
                className="px-4 py-2 bg-black text-white rounded hover:bg-black/80 disabled:opacity-50"
              >
                {creatingJob ? 'Creating...' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-black/20 rounded hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
