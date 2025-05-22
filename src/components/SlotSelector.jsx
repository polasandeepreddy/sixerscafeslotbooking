"use client"

import { useBooking } from "../context/BookingContext"

function formatTimeTo12Hour(time24) {
  const [hourStr, minStr] = time24.split(":")
  let hour = Number.parseInt(hourStr, 10)
  const minutes = minStr
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

function parseSlotTime(time12h, dateStr) {
  const [time, meridiem] = time12h.split(" ")
  const [hourStr, minuteStr] = time.split(":")
  let hour = Number.parseInt(hourStr, 10)
  const minutes = Number.parseInt(minuteStr || "0", 10)

  if (meridiem === "PM" && hour !== 12) {
    hour += 12
  } else if (meridiem === "AM" && hour === 12) {
    hour = 0
  }

  const date = new Date(dateStr)
  date.setHours(hour, minutes, 0, 0)
  return date
}

function isPastSlot(slotTime12h, selectedDate) {
  const now = new Date()
  const selectedDateObj = new Date(selectedDate)
  if (selectedDateObj.toDateString() !== now.toDateString()) return false

  const slotStart = parseSlotTime(slotTime12h, selectedDate)
  const slotEnd = new Date(slotStart)
  slotEnd.setHours(slotEnd.getHours() + 1)
  return now >= slotEnd
}

const SlotSelector = ({ className = "" }) => {
  const { slots, formData, selectSlot, deselectSlot } = useBooking()

  const isSlotSelected = (slotId) => formData.selectedSlots.some((slot) => slot.id === slotId)

  const visibleSlots = slots.filter((slot) => {
    const slotTime12h = formatTimeTo12Hour(slot.time)
    return !isPastSlot(slotTime12h, formData.date)
  })

  return (
    <div className={className}>
      <h3 className="text-base font-medium mb-2 text-gray-700">Select Time Slot(s)</h3>

      {visibleSlots.length === 0 ? (
        <p className="text-sm text-gray-500">No available slots for the selected date.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {visibleSlots.map((slot) => {
            const selected = isSlotSelected(slot.id)
            const time12h = formatTimeTo12Hour(slot.time)
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => (selected ? deselectSlot(slot.id) : selectSlot(slot))}
                disabled={!slot.isAvailable && !selected}
                className={`p-2 rounded-md text-sm font-medium transition-colors ${
                  selected
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : slot.isAvailable
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {time12h}
              </button>
            )
          })}
        </div>
      )}

      {formData.selectedSlots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Slots:</h4>
          <div className="flex flex-wrap gap-2">
            {formData.selectedSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"
              >
                <span>{formatTimeTo12Hour(slot.time)}</span>
                <button
                  type="button"
                  onClick={() => deselectSlot(slot.id)}
                  className="ml-1 text-green-600 hover:text-green-800"
                  aria-label={`Remove ${formatTimeTo12Hour(slot.time)} slot`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">Total: ₹{formData.selectedSlots.length * 600} (₹600 per slot)</p>
        </div>
      )}
    </div>
  )
}

export default SlotSelector
