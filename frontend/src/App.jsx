import Navbar from './components/Navbar'
import Hero from './components/Hero'
import './App.css'
import BookingForm from './components/Bookingform'
import Footer from './components/Footer'
import Bookingpage from './pages/Bookingpage'
import Adminpage from './pages/Adminpage'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Bookingpage />} />
        <Route path="/admin" element={<Adminpage />} />
      </Routes>
    </>
  )
}

export default App
