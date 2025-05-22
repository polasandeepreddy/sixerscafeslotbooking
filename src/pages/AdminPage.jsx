"use client"

import { useState } from "react"
import { formatDisplayDate } from "../utils/dateUtils"
import LoadingSpinner from "../components/LoadingSpinner"
import { useBooking } from "../context/BookingContext"

const ITEMS_PER_PAGE = 10

export default function AdminDashboard() {
  const {
    bookings,
    removeBooking,
    updateBookingStatus,
    fetchBookings,
    isLoading: contextLoading,
    useLocalStorage,
    setUseLocalStorage,
  } = useBooking()

  const [selectedScreenshot, setSelectedScreenshot] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [activeTab, setActiveTab] = useState("today")
  const [currentPage, setCurrentPage] = useState(1)

  const today = new Date()
  const todayISO = today.toISOString().split("T")[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().split("T")[0]

  const sortBookingsByTime = (list) =>
    [...list].sort((a, b) => {
      const timeA = a.slots[0]?.time || ""
      const timeB = b.slots[0]?.time || ""
      return timeA.localeCompare(timeB)
    })

  const todayBookings = bookings.filter((b) => b.date === todayISO)
  const tomorrowBookings = bookings.filter((b) => b.date === tomorrowISO)

  const sortedToday = sortBookingsByTime(todayBookings)
  const sortedTomorrow = sortBookingsByTime(tomorrowBookings)
  const sortedAll = sortBookingsByTime(bookings)

  const displayedBookings =
    activeTab === "today"
      ? sortedToday
      : activeTab === "tomorrow"
      ? sortedTomorrow
      : sortedAll

  const paginatedBookings = displayedBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(displayedBookings.length / ITEMS_PER_PAGE)

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this booking?")) {
      await removeBooking(id)
      fetchBookings()
    }
  }

  const handleUpdateStatus = async (id, status) => {
    await updateBookingStatus(id, status)
    fetchBookings()
  }

  const handleSwitchToLocalStorage = () => {
    setUseLocalStorage(true)
    setFetchError(null)
  }

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" className="mb-4" />
        <p>Loading bookings...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-red-600 text-xl font-semibold mb-4">Connection Error</h2>
          <p className="mb-4">{fetchError}</p>
          <button
            onClick={handleSwitchToLocalStorage}
            className="bg-green-600 text-white py-2 px-4 rounded mb-2 w-full"
          >
            Use Local Storage
          </button>
          <button
            onClick={() => fetchBookings()}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Booking Management</h1>
          <div>
            <span className="text-sm mr-2">
              Using: {useLocalStorage ? "Local Storage" : "Database"}
            </span>
            <button
              onClick={() => setUseLocalStorage(!useLocalStorage)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Switch
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {["today", "tomorrow", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setCurrentPage(1)
              }}
              className={`py-2 px-4 rounded ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {tab === "today"
                ? `Today (${formatDisplayDate(todayISO)})`
                : tab === "tomorrow"
                ? `Tomorrow (${formatDisplayDate(tomorrowISO)})`
                : "All"}
            </button>
          ))}
        </div>

        <div className="overflow-auto rounded border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left text-xs text-gray-500">Name</th>
                <th className="p-2 text-left text-xs text-gray-500">Mobile</th>
                <th className="p-2 text-left text-xs text-gray-500">Date</th>
                <th className="p-2 text-left text-xs text-gray-500">Slots</th>
                <th className="p-2 text-left text-xs text-gray-500">Amount</th>
                <th className="p-2 text-left text-xs text-gray-500">Status</th>
                <th className="p-2 text-left text-xs text-gray-500">Proof</th>
                <th className="p-2 text-left text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="p-2 text-sm">{booking.fullName}</td>
                    <td className="p-2 text-sm">{booking.mobileNumber}</td>
                    <td className="p-2 text-sm">{formatDisplayDate(booking.date)}</td>
                    <td className="p-2 text-sm">
                      {booking.slots.map((s) => (
                        <span
                          key={s.id}
                          className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs mr-1"
                        >
                          {s.time}
                        </span>
                      ))}
                    </td>
                    <td className="p-2 text-sm">₹{booking.totalAmount}</td>
                    <td className="p-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.paymentStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : booking.paymentStatus === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="p-2">
                      {booking.paymentScreenshot && (
                        <button
                          onClick={() => setSelectedScreenshot(booking.paymentScreenshot)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </button>
                      )}
                    </td>
                    <td className="p-2 text-sm space-x-1">
                      {booking.paymentStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "approved")}
                            className="bg-green-500 text-white px-2 py-1 text-xs rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "rejected")}
                            className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleRemove(booking.id)}
                        className="bg-gray-500 text-white px-2 py-1 text-xs rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 p-4">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full">
            <img
              src={selectedScreenshot}
              alt="Payment Screenshot"
              className="w-full rounded"
            />
            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
