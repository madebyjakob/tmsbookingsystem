import Navbar from './components/Navbar'
import Hero from './components/Hero'
import './App.css'
import BookingForm from './components/Bookingform'
import Footer from './components/Footer'

function App() {


  return (
    <>
    <div className="bg-[#0A0A0A]">
      <Navbar />
      <Hero/>
      <BookingForm/>
      <Footer/>
    </div>
    </>
  )
}

export default App
