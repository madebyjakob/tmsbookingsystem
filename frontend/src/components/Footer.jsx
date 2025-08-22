import React from 'react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#00BFEC]">Täby Mopedservice</h3>
            <p className="text-gray-300 leading-relaxed">
              Din lokala specialverkstad för mopeder i Täby. Kvalitet, service
              och passion sedan 2025.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                aria-label="Facebook"
                className="text-gray-400 hover:text-[#00BFEC] transition-colors duration-300 text-xl"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="#" 
                aria-label="Instagram"
                className="text-gray-400 hover:text-[#00BFEC] transition-colors duration-300 text-xl"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="#" 
                aria-label="YouTube"
                className="text-gray-400 hover:text-[#00BFEC] transition-colors duration-300 text-xl"
              >
                <i className="fab fa-youtube"></i>
              </a>
              <a 
                href="#" 
                aria-label="TikTok"
                className="text-gray-400 hover:text-[#00BFEC] transition-colors duration-300 text-xl"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#00BFEC]">Kontakt</h4>
            <div className="space-y-3">
              <p className="flex items-start space-x-3 text-gray-300">
                <i className="fas fa-map-marker-alt text-[#00BFEC] mt-1 flex-shrink-0"></i>
                <span>Lövängsvägen 55, 187 30 Täby</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300">
                <i className="fas fa-phone text-[#00BFEC]"></i>
                <span>072 889-77 58</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-300">
                <i className="fas fa-envelope text-[#00BFEC]"></i>
                <span>info@tabymopedservice.se</span>
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#00BFEC]">Öppettider</h4>
            <div className="space-y-3">
              <p className="text-gray-300 font-semibold">
                Endast bokad tid - inga drop-in besök
              </p>
              <p className="text-gray-300">
                All service måste bokas i förväg
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#00BFEC]">Snabb Länkar</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#home" 
                  className="text-gray-300 hover:text-[#00BFEC] transition-colors duration-300 hover:underline"
                >
                  Hem
                </a>
              </li>
              <li>
                <a 
                  href="#services" 
                  className="text-gray-300 hover:text-[#00BFEC] transition-colors duration-300 hover:underline"
                >
                  Tjänster
                </a>
              </li>
              <li>
                <a 
                  href="prices.html" 
                  className="text-gray-300 hover:text-[#00BFEC] transition-colors duration-300 hover:underline"
                >
                  Priser
                </a>
              </li>
              <li>
                <a 
                  href="booking.html" 
                  className="text-gray-300 hover:text-[#00BFEC] transition-colors duration-300 hover:underline"
                >
                  Boka Service
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-300 hover:text-[#00BFEC] transition-colors duration-300 hover:underline"
                >
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400">
            © 2024 Täby Mopedservice. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  )
}

