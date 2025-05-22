import { Phone, Mail, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/cricket-logo.png" alt="Sixers Cafe" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold">Sixers Cafe</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Premium cricket box facility with state-of-the-art amenities for cricket enthusiasts. Book your slot today
              and experience the thrill of the game!
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-green-400 transition-colors">
                  Book a Slot
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-300 hover:text-green-400 transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
                <span className="text-gray-300">
                  Giddalur Cumbum Road, Near Kothapalle, Giddalur, Prakasam, Andhra Pradesh, India - 523357
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">+91 7893746706</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">info@sixerscafe.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sixers Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
