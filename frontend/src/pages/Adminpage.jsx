import React from 'react'
import Admindashboard from '../components/admin/Admindashboard'
import Jobspage from '../components/admin/Jobspage'
import CustomersPage from '../components/admin/CustomersPage'
import Adminnavbar from '../components/admin/Adminnavbar'
import AIConfigPage from '../components/admin/AIConfigPage'

export default function Adminpage() {
  const [currentView, setCurrentView] = React.useState('dashboard')

  React.useEffect(() => {
    // Check URL hash for routing
    const hash = window.location.hash
    if (hash === '#jobs') {
      setCurrentView('jobs')
    } else if (hash === '#customers') {
      setCurrentView('customers')
    } else if (hash === '#ai-config') {
      setCurrentView('ai-config')
    } else {
      setCurrentView('dashboard')
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash
      if (newHash === '#jobs') {
        setCurrentView('jobs')
      } else if (newHash === '#customers') {
        setCurrentView('customers')
      } else if (newHash === '#ai-config') {
        setCurrentView('ai-config')
      } else {
        setCurrentView('dashboard')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderContent = () => {
    switch (currentView) {
      case 'jobs':
        return <Jobspage />
      case 'customers':
        return <CustomersPage />
      case 'ai-config':
        return <AIConfigPage />
      default:
        return <Admindashboard />
    }
  }

  return (
    <>
    <Adminnavbar />
    {renderContent()}
    </>
  )
}