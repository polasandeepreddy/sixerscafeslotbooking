"use client"

import { useBooking } from "../context/BookingContext"
import SlotSelector from "./SlotSelector"
import { User, Smartphone, CalendarDays } from "lucide-react"

const BookingForm = ({ className = "", onSubmit }) => {
  const { formData, updateFormData, availableDates, isLoading } = useBooking()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.selectedSlots.length === 0) {
      alert("Please select at least one slot")
      return
    }
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-md p-6 space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold text-green-700 text-center">Book Cricket Slot</h2>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="text-sm text-gray-700 flex items-center gap-1 mb-1">
          <User size={14} />
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          required
          placeholder="Enter your full name"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* Mobile Number */}
      <div>
        <label htmlFor="mobileNumber" className="text-sm text-gray-700 flex items-center gap-1 mb-1">
          <Smartphone size={14} />
          Mobile Number
        </label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleInputChange}
          required
          pattern="[0-9]{10}"
          placeholder="10-digit mobile number"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* Date Selection */}
      <div>
        <label htmlFor="date" className="text-sm text-gray-700 flex items-center gap-1 mb-1">
          <CalendarDays size={14} />
          Select Date
        </label>
        <select
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
        >
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Slot Selector */}
      {isLoading ? (
        <div className="py-4 text-center text-gray-500">Loading available slots...</div>
      ) : (
        <SlotSelector className="pt-2" />
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-md transition-colors duration-200"
        disabled={isLoading}
      >
        Book Slots
      </button>
    </form>
  )
}

export default BookingForm
