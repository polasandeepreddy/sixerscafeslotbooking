"use client"

import { useState } from "react"
import BookingForm from "../components/BookingForm"
import BookingConfirmation from "../components/BookingConfirmation"
import PaymentSummary from "../components/PaymentSummary"
import { useBooking } from "../context/BookingContext"
import LoadingSpinner from "../components/LoadingSpinner"

export default function BookingPage() {
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingId, setBookingId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const { formData, addBooking, databaseInitialized, initializeDatabase } = useBooking()

  const handleBookingSubmit = () => {
    setShowPayment(true)
  }

  const handlePaymentComplete = async (screenshot) => {
    setError(null)
    setIsProcessing(true)
    try {
      // Check if database is initialized
      if (!databaseInitialized) {
        await initializeDatabase()
      }

      // Create new booking with payment screenshot
      const newBookingId = await addBooking({
        paymentScreenshot: screenshot,
      })

      setBookingId(newBookingId)
      setBookingConfirmed(true)
    } catch (error) {
      console.error("Error completing payment:", error)
      setError("There was an error processing your booking. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Your Booking</h2>
          <p className="text-gray-600">Please wait while we process your booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        {!bookingConfirmed ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-10">Book Your Cricket Slot</h1>
            {error && (
              <div className="max-w-2xl mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <div className="max-w-2xl mx-auto">
              {!showPayment ? (
                <BookingForm onSubmit={handleBookingSubmit} />
              ) : (
                <PaymentSummary onPaymentComplete={handlePaymentComplete} />
              )}
            </div>
          </>
        ) : (
          <BookingConfirmation bookingId={bookingId} />
        )}
      </div>
    </div>
  )
}
