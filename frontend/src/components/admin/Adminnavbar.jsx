import React from 'react'

export default function Adminnavbar() {
  return (
    <>
    <div className="sticky top-0 z-50 bg-white/90 text-black border-b border-black/10 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Täby Mopedservice AdminPanel</h1>
        <nav className="text-sm">
          <ul className="flex items-center gap-6">
            <li><a href="#dashboard" className="hover:underline">Dashboard</a></li>
            <li><a href="#jobs" className="hover:underline">Jobs</a></li>
            <li><a href="#customers" className="hover:underline">Customers</a></li>
          </ul>
        </nav>
      </div>
    </div>
    </>
  )
}