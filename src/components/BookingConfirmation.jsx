import { Link } from "react-router-dom"
import { CheckCircle, Calendar, Clock, User, Phone } from "lucide-react"
import { useBooking } from "../context/BookingContext"
import { formatDisplayDate } from "../utils/dateUtils"

const BookingConfirmation = ({ bookingId }) => {
  const { bookings } = useBooking()
  const booking = bookings.find((b) => b.id === bookingId) || null

  const formatTime = (time) => {
    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour, 10)
    const ampm = hourNum >= 12 ? "PM" : "AM"
    const hour12 = hourNum % 12 || 12
    return `${hour12}:${minute} ${ampm}`
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-green-600 p-6 text-white text-center">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-green-100">Your cricket box slot has been booked successfully.</p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Booking Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{booking ? formatDisplayDate(booking.date) : "Loading..."}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Time Slots</p>
                  <div className="font-medium">
                    {booking ? (
                      <div className="flex flex-wrap gap-1">
                        {booking.slots.map((slot) => (
                          <span
                            key={slot.id}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            {formatTime(slot.time)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "Loading..."
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{booking ? booking.fullName : "Loading..."}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{booking ? booking.mobileNumber : "Loading..."}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{bookingId}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-green-700">₹{booking ? booking.totalAmount : "Loading..."}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Payment Status:</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">
                  {booking ? booking.paymentStatus : "Loading..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your booking is pending admin verification. You will receive a confirmation once your payment is
                approved.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg text-center transition-colors"
          >
            Return to Home
          </Link>
          <Link
            to="/booking"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-center transition-colors"
          >
            Book Another Slot
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
