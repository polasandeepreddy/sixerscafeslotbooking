import React, { useState } from "react"
import { Menu, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Book Slot", path: "/booking" },
    { label: "Admin", path: "/admin" },
  ]

  return (
    <header className="bg-white shadow-md z-20 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3">
          <img src="/cricket-logo.png" alt="Sixers Cafe" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gray-800">Sixers Cafe</span>
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-8 w-8 text-gray-600" /> : <Menu className="h-8 w-8 text-gray-600" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-10">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`text-lg ${
                pathname === path ? "text-green-600" : "text-gray-600 hover:text-green-600"
              } transition-colors`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white py-4 px-4 border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col space-y-4">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg ${
                  pathname === path ? "text-green-600" : "text-gray-600 hover:text-green-600"
                } transition-colors`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
