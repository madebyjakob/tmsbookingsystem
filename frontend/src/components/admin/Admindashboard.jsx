import React from 'react'

export default function Admindashboard() {
  const [stats, setStats] = React.useState({ totalJobs: 0, totalCustomers: 0, jobsToday: 0, overdue: 0 })
  const [latestJobs, setLatestJobs] = React.useState([])
  const [latestCustomers, setLatestCustomers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

        const jobsReq = fetch(`${baseUrl}/jobs?limit=5&sortBy=scheduled_date&sortOrder=desc&page=1`, { signal: controller.signal })
        const customersReq = fetch(`${baseUrl}/customers?limit=5&sortBy=created_at&sortOrder=desc&page=1`, { signal: controller.signal })
        const overdueReq = fetch(`${baseUrl}/jobs/overdue/all`, { signal: controller.signal })

        const [jobsRes, customersRes, overdueRes] = await Promise.all([jobsReq, customersReq, overdueReq])

        if (!jobsRes.ok) throw new Error('Failed to load jobs')
        if (!customersRes.ok) throw new Error('Failed to load customers')
        if (!overdueRes.ok) throw new Error('Failed to load overdue jobs')

        const jobsJson = await jobsRes.json()
        const customersJson = await customersRes.json()
        const overdueJson = await overdueRes.json()

        const jobs = jobsJson.jobs || []
        const customers = customersJson.customers || []

        // Jobs today count
        const todayStr = new Date().toISOString().slice(0, 10)
        const jobsTodayCount = jobs.filter(j => (j.scheduledDate || '').slice(0, 10) === todayStr).length

        setStats({
          totalJobs: jobsJson.totalJobs || 0,
          totalCustomers: customersJson.totalCustomers || 0,
          jobsToday: jobsTodayCount,
          overdue: Array.isArray(overdueJson) ? overdueJson.length : 0,
        })

        setLatestJobs(jobs.slice(0, 5))
        setLatestCustomers(customers.slice(0, 5))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load dashboard')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
    return () => controller.abort()
  }, [])

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 py-8 text-black">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h2>

      {error && (
        <div className="mb-4 border border-red-400 text-red-700 rounded-md p-3 bg-white">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-black/10 rounded-md p-4 bg-white">
          <div className="text-sm text-black/60">Total Jobs</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '…' : stats.totalJobs}</div>
        </div>
        <div className="border border-black/10 rounded-md p-4 bg-white">
          <div className="text-sm text-black/60">Total Customers</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '…' : stats.totalCustomers}</div>
        </div>
        <div className="border border-black/10 rounded-md p-4 bg-white">
          <div className="text-sm text-black/60">Jobs Today</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '…' : stats.jobsToday}</div>
        </div>
        <div className="border border-black/10 rounded-md p-4 bg-white">
          <div className="text-sm text-black/60">Overdue</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '…' : stats.overdue}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-black/10 rounded-md bg-white">
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <h3 className="text-base font-medium">Latest Jobs</h3>
            <a href="/admin/jobs" className="text-sm underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Customer</th>
                  <th className="px-4 py-2 font-medium">Vehicle</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-black/10"><td className="px-4 py-2" colSpan="4">Loading…</td></tr>
                ) : latestJobs.length === 0 ? (
                  <tr className="border-t border-black/10"><td className="px-4 py-2 text-black/60" colSpan="4">No data</td></tr>
                ) : (
                  latestJobs.map(job => (
                    <tr key={job.id} className="border-t border-black/10">
                      <td className="px-4 py-2">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : '-'}</td>
                      <td className="px-4 py-2">{job.customer?.vehicleInfo ? `${job.customer.vehicleInfo.make || ''} ${job.customer.vehicleInfo.model || ''}`.trim() : '-'}</td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-0.5 border border-black/20 rounded text-xs">
                          {job.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-black/10 rounded-md bg-white">
          <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
            <h3 className="text-base font-medium">Latest Customers</h3>
            <a href="/admin/customers" className="text-sm underline">View all</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/5 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Vehicle</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-black/10"><td className="px-4 py-2" colSpan="4">Loading…</td></tr>
                ) : latestCustomers.length === 0 ? (
                  <tr className="border-t border-black/10"><td className="px-4 py-2 text-black/60" colSpan="4">No data</td></tr>
                ) : (
                  latestCustomers.map(c => (
                    <tr key={c.id} className="border-t border-black/10">
                      <td className="px-4 py-2">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '-'}</td>
                      <td className="px-4 py-2">{c.email || '-'}</td>
                      <td className="px-4 py-2">{c.phone || '-'}</td>
                      <td className="px-4 py-2">{`${c.vehicleMake || ''} ${c.vehicleModel || ''}`.trim() || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    </>
  )
}