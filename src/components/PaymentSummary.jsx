"use client"

import { useState } from "react"
import { useBooking } from "../context/BookingContext"
import { formatDisplayDate } from "../utils/dateUtils"
import { QRCodeSVG } from "qrcode.react"

const PaymentSummary = ({ className = "", onPaymentComplete }) => {
  const { formData, totalAmount } = useBooking()
  const { selectedSlots, date } = formData
  const [screenshot, setScreenshot] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!screenshot) {
      alert("Please upload payment screenshot")
      return
    }
    onPaymentComplete(screenshot)
  }

  const upiDetails = {
    payeeName: "Sixers Cafe",
    upiId: "sixers-cafe@upi",
    amount: totalAmount,
    note: `Booking for ${formatDisplayDate(date)}`,
  }

  const upiUri = `upi://pay?pa=${upiDetails.upiId}&pn=${encodeURIComponent(upiDetails.payeeName)}&am=${upiDetails.amount}&tn=${encodeURIComponent(upiDetails.note)}`

  if (selectedSlots.length === 0) {
    return (
      <div className={`max-w-md mx-auto p-6 bg-gray-50 rounded-xl shadow-md text-center ${className}`}>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Summary</h2>
        <p className="text-gray-500 text-sm">Please select at least one slot to view payment details.</p>
      </div>
    )
  }

  return (
    <div
      className={`max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}
    >
      {/* Left side - Booking details */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Booking Details</h2>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Date</h3>
          <p className="text-base font-medium text-gray-900">{formatDisplayDate(date)}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Slots</h3>
          <div className="flex flex-wrap gap-2 max-w-full overflow-auto">
            {selectedSlots.map((slot) => (
              <span
                key={slot.id}
                className="bg-indigo-100 text-indigo-800 px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-gray-700">
          <div className="flex justify-between font-medium text-sm">
            <span>Number of Slots</span>
            <span>{selectedSlots.length}</span>
          </div>
          <div className="flex justify-between font-medium text-sm">
            <span>Price per Slot</span>
            <span>₹600</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-indigo-700 border-t border-gray-300 pt-3">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      </section>

      {/* Right side - Payment and Upload */}
      <section className="space-y-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 w-full text-center">Payment</h2>

        <p className="text-gray-600 text-center font-semibold uppercase tracking-wide mb-3 text-sm">Scan to Pay</p>

        <div className="bg-indigo-50 rounded-xl p-4 shadow-md">
          <QRCodeSVG value={upiUri} size={200} className="block mx-auto" />
        </div>

        <div className="text-center text-gray-700 space-y-1 text-sm">
          <p>
            <span className="font-semibold">UPI ID:</span> {upiDetails.upiId}
          </p>
          <p>
            <span className="font-semibold">Amount:</span> ₹{upiDetails.amount}
          </p>
        </div>

        <div className="w-full">
          <label htmlFor="payment-screenshot" className="block text-gray-700 font-semibold mb-1 text-sm">
            Upload Payment Screenshot
          </label>
          <input
            id="payment-screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-1.5 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <div className="w-full text-center">
            <p className="text-indigo-600 font-semibold mb-2 text-sm">Uploading screenshot...</p>
          </div>
        )}

        {screenshot && !isUploading && (
          <div className="w-full text-center">
            <p className="text-green-600 font-semibold mb-2 text-sm">Screenshot uploaded successfully!</p>
            <img
              src={screenshot || "/placeholder.svg"}
              alt="Payment screenshot"
              className="mx-auto max-h-36 rounded-lg object-contain"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!screenshot || isUploading}
          className={`w-full py-2 mt-auto rounded-lg text-white font-semibold transition-colors duration-300 text-sm
            ${screenshot && !isUploading ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"}
          `}
        >
          Confirm Payment
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Please ensure the screenshot clearly shows the transaction details. Your booking will be confirmed after admin
          verification.
        </p>
      </section>
    </div>
  )
}

export default PaymentSummary
