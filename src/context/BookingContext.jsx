"use client"

import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { generateSlotsForDate, generateAvailableDates } from "../utils/mockData"
import { format } from "../utils/dateUtils"
import { getSupabase } from "../lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { v4 as uuidv4 } from 'uuid';


// Local storage keys
const LOCAL_STORAGE_KEYS = {
  BOOKINGS: "cricket-box-bookings",
  SLOTS: "cricket-box-slots",
  USE_LOCAL_STORAGE: "cricket-box-use-local-storage",
}

const BookingContext = createContext(undefined)

export const BookingProvider = ({ children }) => {
  const [availableDates] = useState(generateAvailableDates())
  const initialDate = availableDates[0]
  const [rawSlots, setRawSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [databaseInitialized, setDatabaseInitialized] = useState(false)
  const [useLocalStorage, setUseLocalStorage] = useState(() => {
    // Default to true for Cloudflare deployment
    if (typeof window !== "undefined") {
      const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEYS.USE_LOCAL_STORAGE)
      return savedPreference === "false" ? false : true
    }
    return true
  })

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    date: initialDate,
    selectedSlots: [],
  })

  const totalAmount = formData.selectedSlots.length * 600

  // Save local storage preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USE_LOCAL_STORAGE, String(useLocalStorage))
      } catch (error) {
        console.error("Error saving local storage preference:", error)
      }
    }
  }, [useLocalStorage])

  // Initialize local storage
  const initializeLocalStorage = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      // Check if slots exist in local storage
      const storedSlots = localStorage.getItem(LOCAL_STORAGE_KEYS.SLOTS)
      if (!storedSlots) {
        // Initialize with empty array
        localStorage.setItem(LOCAL_STORAGE_KEYS.SLOTS, JSON.stringify([]))
      }

      // Check if bookings exist in local storage
      const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
      if (!storedBookings) {
        // Initialize with empty array
        localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, JSON.stringify([]))
      }
    } catch (error) {
      console.error("Error initializing local storage:", error)
    }
  }, [])

  // Fetch slots from local storage
  const fetchSlotsFromLocalStorage = useCallback((date) => {
    if (typeof window === "undefined") {
      setRawSlots(generateSlotsForDate(date))
      return
    }

    try {
      const storedSlots = localStorage.getItem(LOCAL_STORAGE_KEYS.SLOTS)
      const allSlots = storedSlots ? JSON.parse(storedSlots) : []

      // Filter slots for the selected date
      const slotsForDate = allSlots.filter((slot) => slot.date === date)

      if (slotsForDate.length > 0) {
        setRawSlots(slotsForDate)
      } else {
        // Generate new slots for this date
        const generatedSlots = generateSlotsForDate(date)

        // Add to all slots
        const updatedSlots = [...allSlots, ...generatedSlots]
        localStorage.setItem(LOCAL_STORAGE_KEYS.SLOTS, JSON.stringify(updatedSlots))

        setRawSlots(generatedSlots)
      }
    } catch (error) {
      console.error("Error fetching slots from local storage:", error)
      const generatedSlots = generateSlotsForDate(date)
      setRawSlots(generatedSlots)
    }
  }, [])

  // Fetch bookings from local storage
  const fetchBookingsFromLocalStorage = useCallback(() => {
    if (typeof window === "undefined") {
      setBookings([])
      return
    }

    try {
      const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
      const bookings = storedBookings ? JSON.parse(storedBookings) : []
      setBookings(bookings)
    } catch (error) {
      console.error("Error fetching bookings from local storage:", error)
      setBookings([])
    }
  }, [])

  // Check if database is initialized
  const checkDatabaseInitialized = useCallback(async () => {
    if (useLocalStorage || typeof window === "undefined") {
      return false
    }

    try {
      // Try to query the cricket_bookings table to see if it exists
      const { data, error } = await getSupabase().from("cricket_bookings").select("id").limit(1)

      // If there's no error, the table exists
      if (!error) {
        setDatabaseInitialized(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking database:", error)
      return false
    }
  }, [useLocalStorage])

  // Initialize database
  const initializeDatabaseWrapper = useCallback(async () => {
    if (useLocalStorage || typeof window === "undefined") {
      // Initialize local storage
      initializeLocalStorage()
      return
    }

    setIsLoading(true)
    try {
      // Just check if the table exists
      const { data, error } = await getSupabase().from("cricket_bookings").select("id").limit(1)

      if (error) {
        throw new Error(`Database table not found. Please create it manually: ${JSON.stringify(error)}`)
      }

      setDatabaseInitialized(true)
      await fetchSlotsForDate(formData.date)
      await fetchBookings()
    } catch (error) {
      console.error("Error initializing database:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [useLocalStorage, initializeLocalStorage, formData.date])


  // Fetch slots for date
  const fetchSlotsForDate = useCallback(
    async (date) => {
      if (useLocalStorage || typeof window === "undefined") {
        fetchSlotsFromLocalStorage(date)
        return
      }

      if (!databaseInitialized) {
        setRawSlots(generateSlotsForDate(date))
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Get all bookings for this date to determine which slots are booked
        const { data: bookingsData, error: bookingsError } = await getSupabase()
          .from("cricket_bookings")
          .select("slots")
          .eq("date", date)
          .neq("payment_status", "rejected")

        if (bookingsError) {
          console.error("Error fetching bookings for slots:", bookingsError)
          setRawSlots(generateSlotsForDate(date))
          setIsLoading(false)
          return
        }

        // Generate all slots for this date
        const generatedSlots = generateSlotsForDate(date)

        // Mark slots as unavailable if they're booked
        if (bookingsData && bookingsData.length > 0) {
          // Collect all booked slot IDs
          const bookedSlotIds = new Set()
          bookingsData.forEach((booking) => {
            const slots = booking.slots
            slots.forEach((slot) => bookedSlotIds.add(slot.id))
          })

          // Mark booked slots as unavailable
          const updatedSlots = generatedSlots.map((slot) => ({
            ...slot,
            isAvailable: !bookedSlotIds.has(slot.id),
          }))

          setRawSlots(updatedSlots)
        } else {
          setRawSlots(generatedSlots)
        }
      } catch (error) {
        console.error("Error fetching slots:", error)
        // Fallback to generated slots if there's an error
        setRawSlots(generateSlotsForDate(date))
      } finally {
        setIsLoading(false)
      }
    },
    [useLocalStorage, databaseInitialized, fetchSlotsFromLocalStorage],
  )

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    // Always check if we should use local storage first
    if (useLocalStorage || typeof window === "undefined") {
      fetchBookingsFromLocalStorage()
      return
    }

    // If database is not initialized, use empty array
    if (!databaseInitialized) {
      setBookings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Check if Supabase URL and key are available
      const supabase = getSupabase()
      if (!supabase) {
        console.error("Supabase client not available")
        // Fallback to local storage
        console.log("Falling back to local storage for bookings")
        fetchBookingsFromLocalStorage()
        return
      }

      // Fetch all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("cricket_bookings")
        .select("*")
        .order("created_at", { ascending: false })

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError)
        // Fallback to local storage
        console.log("Falling back to local storage for bookings due to error")
        fetchBookingsFromLocalStorage()
        return
      }

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([])
        setIsLoading(false)
        return
      }

      // Map the database bookings to our Booking type
      const mappedBookings = bookingsData.map((booking) => ({
        id: booking.id,
        fullName: booking.full_name,
        mobileNumber: booking.mobile_number,
        date: booking.date,
        slots: booking.slots,
        createdAt: booking.created_at,
        paymentStatus: booking.payment_status,
        paymentScreenshot: booking.payment_screenshot,
        totalAmount: booking.total_amount,
      }))

      setBookings(mappedBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      // If there's any error, fall back to local storage
      console.log("Falling back to local storage for bookings due to exception")
      fetchBookingsFromLocalStorage()
    } finally {
      setIsLoading(false)
    }
  }, [useLocalStorage, databaseInitialized, fetchBookingsFromLocalStorage])

  // Fetch bookings for date
  const fetchBookingsForDate = useCallback(
    async (date, limit = 50) => {
      if (useLocalStorage || typeof window === "undefined") {
        try {
          if (typeof window === "undefined") return []

          const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
          const allBookings = storedBookings ? JSON.parse(storedBookings) : []

          // Filter by date if provided
          const filteredBookings = date ? allBookings.filter((booking) => booking.date === date) : allBookings

          // Sort by created date, newest first
          const sortedBookings = filteredBookings.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )

          // Limit results
          return sortedBookings.slice(0, limit)
        } catch (error) {
          console.error("Error fetching bookings from local storage:", error)
          return []
        }
      }

      if (!databaseInitialized) {
        return []
      }

      try {
        let query = getSupabase()
          .from("cricket_bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit)

        if (date) {
          query = query.eq("date", date)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching bookings:", error)
          return []
        }

        // Map the database bookings to our Booking type
        return data.map((booking) => ({
          id: booking.id,
          fullName: booking.full_name,
          mobileNumber: booking.mobile_number,
          date: booking.date,
          slots: booking.slots,
          createdAt: booking.created_at,
          paymentStatus: booking.payment_status,
          paymentScreenshot: booking.payment_screenshot,
          totalAmount: booking.total_amount,
        }))
      } catch (error) {
        console.error("Error fetching bookings:", error)
        return []
      }
    },
    [useLocalStorage, databaseInitialized],
  )

  // Fetch bookings with pagination
  const fetchBookingsWithPagination = useCallback(
    async (page, limit, dateFilter) => {
      if (useLocalStorage || typeof window === "undefined") {
        try {
          if (typeof window === "undefined") return { bookings: [], totalCount: 0 }

          const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
          const allBookings = storedBookings ? JSON.parse(storedBookings) : []

          // Filter by date if provided
          const filteredBookings = dateFilter
            ? allBookings.filter((booking) => booking.date === dateFilter)
            : allBookings

          // Sort by created date, newest first
          const sortedBookings = filteredBookings.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )

          // Calculate pagination
          const startIndex = (page - 1) * limit
          const paginatedBookings = sortedBookings.slice(startIndex, startIndex + limit)

          return {
            bookings: paginatedBookings,
            totalCount: filteredBookings.length,
          }
        } catch (error) {
          console.error("Error fetching bookings from local storage:", error)
          return { bookings: [], totalCount: 0 }
        }
      }

      if (!databaseInitialized) {
        return { bookings: [], totalCount: 0 }
      }

      try {
        // First, get the count of all matching records
        let countQuery = getSupabase().from("cricket_bookings").select("id", { count: "exact" })

        if (dateFilter) {
          countQuery = countQuery.eq("date", dateFilter)
        }

        const { count, error: countError } = await countQuery

        if (countError) {
          console.error("Error counting bookings:", countError)
          return { bookings: [], totalCount: 0 }
        }

        // Then, get the paginated data
        let dataQuery = getSupabase()
          .from("cricket_bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        if (dateFilter) {
          dataQuery = dataQuery.eq("date", dateFilter)
        }

        const { data, error: dataError } = await dataQuery

        if (dataError) {
          console.error("Error fetching bookings:", dataError)
          return { bookings: [], totalCount: 0 }
        }

        // Map the database bookings to our Booking type
        const mappedBookings = data.map((booking) => ({
          id: booking.id,
          fullName: booking.full_name,
          mobileNumber: booking.mobile_number,
          date: booking.date,
          slots: booking.slots,
          createdAt: booking.created_at,
          paymentStatus: booking.payment_status,
          paymentScreenshot: booking.payment_screenshot,
          totalAmount: booking.total_amount,
        }))

        return {
          bookings: mappedBookings,
          totalCount: count || 0,
        }
      } catch (error) {
        console.error("Error fetching bookings with pagination:", error)
        return { bookings: [], totalCount: 0 }
      }
    },
    [useLocalStorage, databaseInitialized],
  )

  // Update form data
  const updateFormData = useCallback((data) => {
    setFormData((prev) => {
      const updated = { ...prev, ...data }
      if (data.date && data.date !== prev.date) {
        return { ...updated, selectedSlots: [] }
      }
      return updated
    })
  }, [])

  // Dynamic slots based on current bookings
  const slots = rawSlots.map((slot) => {
    const isBooked = bookings.some(
      (booking) =>
        booking.date === formData.date &&
        booking.slots.some((bookedSlot) => bookedSlot.id === slot.id) &&
        booking.paymentStatus !== "rejected",
    )
    return { ...slot, isAvailable: !isBooked }
  })

  // Select slot
  const selectSlot = useCallback((slot) => {
    if (!slot.isAvailable) return
    setFormData((prev) => ({
      ...prev,
      selectedSlots: [...prev.selectedSlots, slot],
    }))
  }, [])

  // Deselect slot
  const deselectSlot = useCallback((slotId) => {
    setFormData((prev) => ({
      ...prev,
      selectedSlots: prev.selectedSlots.filter((slot) => slot.id !== slotId),
    }))
  }, [])

  // Reset booking
  const resetBooking = useCallback(() => {
    const today = format(new Date())
    setFormData({ fullName: "", mobileNumber: "", date: today, selectedSlots: [] })
  }, [])

  // Add booking
  const addBooking = useCallback(
    async (bookingParams) => {
      if (useLocalStorage || typeof window === "undefined") {
        const bookingId = uuidv4()
        const newBooking = {
          id: bookingId,
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          date: formData.date,
          slots: formData.selectedSlots,
          createdAt: new Date().toISOString(),
          paymentStatus: "pending",
          paymentScreenshot: bookingParams.paymentScreenshot || null,
          totalAmount: totalAmount,
        }

        try {
          if (typeof window !== "undefined") {
            // Add booking to local storage
            const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
            const bookings = storedBookings ? JSON.parse(storedBookings) : []
            bookings.push(newBooking)
            localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings))

            // Update slots in local storage
            const storedSlots = localStorage.getItem(LOCAL_STORAGE_KEYS.SLOTS)
            const allSlots = storedSlots ? JSON.parse(storedSlots) : []
            const updatedSlots = allSlots.map((slot) => {
              if (formData.selectedSlots.some((selectedSlot) => selectedSlot.id === slot.id)) {
                return { ...slot, isAvailable: false }
              }
              return slot
            })
            localStorage.setItem(LOCAL_STORAGE_KEYS.SLOTS, JSON.stringify(updatedSlots))

            // Update state
            setBookings(bookings)
          }

          resetBooking()
          return bookingId
        } catch (error) {
          console.error("Error adding booking to local storage:", error)
          throw error
        }
      }

      if (!databaseInitialized) {
        // If database is not initialized, use mock data
        const bookingId = uuidv4()
        console.log("Database not initialized, using mock data for booking:", bookingId)
        resetBooking()
        return bookingId
      }

      try {
        const bookingId = uuidv4()
        console.log("Adding booking with ID:", bookingId)

        // Insert the booking with slots directly in the booking record
        const { data: insertedBooking, error: bookingError } = await getSupabase()
          .from("cricket_bookings")
          .insert({
            id: bookingId,
            full_name: formData.fullName,
            mobile_number: formData.mobileNumber,
            date: formData.date,
            created_at: new Date().toISOString(),
            payment_status: "pending",
            payment_screenshot: bookingParams?.paymentScreenshot || null,
            total_amount: totalAmount,
            slots: formData.selectedSlots, // Store slots directly as JSON
          })
          .select()

        if (bookingError) {
          console.error("Error inserting booking:", bookingError)
          throw bookingError
        }

        console.log("Booking inserted successfully:", insertedBooking)

        // Refresh bookings
        await fetchBookings()
        resetBooking()

        return bookingId
      } catch (error) {
        console.error("Error adding booking:", error)
        throw error
      }
    },
    [
      useLocalStorage,
      formData.fullName,
      formData.mobileNumber,
      formData.date,
      formData.selectedSlots,
      totalAmount,
      databaseInitialized,
      fetchBookings,
      resetBooking,
    ],
  )

  // Update booking status
  const updateBookingStatus = useCallback(
    async (bookingId, status) => {
      if (useLocalStorage || typeof window === "undefined") {
        try {
          if (typeof window === "undefined") return

          const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings)
            const updatedBookings = bookings.map((booking) => {
              if (booking.id === bookingId) {
                return { ...booking, paymentStatus: status }
              }
              return booking
            })
            localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings))
            setBookings(updatedBookings)

            // If rejected, make the slots available again
            if (status === "rejected") {
              const booking = bookings.find((b) => b.id === bookingId)
              if (booking) {
                const storedSlots = localStorage.getItem(LOCAL_STORAGE_KEYS.SLOTS)
                if (storedSlots) {
                  const allSlots = JSON.parse(storedSlots)
                  const updatedSlots = allSlots.map((slot) => {
                    if (booking.slots.some((bookedSlot) => bookedSlot.id === slot.id)) {
                      return { ...slot, isAvailable: true }
                    }
                    return slot
                  })
                  localStorage.setItem(LOCAL_STORAGE_KEYS.SLOTS, JSON.stringify(updatedSlots))
                }
              }
            }
          }
        } catch (error) {
          console.error("Error updating booking status in local storage:", error)
        }
        return
      }

      if (!databaseInitialized) {
        return
      }

      try {
        const { error } = await getSupabase()
          .from("cricket_bookings")
          .update({ payment_status: status })
          .eq("id", bookingId)

        if (error) throw error

        await fetchBookings()

        // If the status was changed to rejected, we need to refresh the slots
        if (status === "rejected") {
          await fetchSlotsForDate(formData.date)
        }
      } catch (error) {
        console.error("Error updating booking status:", error)
      }
    },
    [useLocalStorage, databaseInitialized, fetchBookings, fetchSlotsForDate, formData.date],
  )

  // Remove booking
  const removeBooking = useCallback(
    async (bookingId) => {
      if (useLocalStorage || typeof window === "undefined") {
        try {
          if (typeof window === "undefined") return

          const storedBookings = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKINGS)
          if (storedBookings) {
            const bookings = JSON.parse(storedBookings)
            const booking = bookings.find((b) => b.id === bookingId)
            const updatedBookings = bookings.filter((b) => b.id !== bookingId)
            localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings))
            setBookings(updatedBookings)

            // Make the slots available again
            if (booking) {
              const storedSlots = localStorage.getItem(LOCAL_STORAGE_KEYS.SLOTS)
              if (storedSlots) {
                const allSlots = JSON.parse(storedSlots)
                const updatedSlots = allSlots.map((slot) => {
                  if (booking.slots.some((bookedSlot) => bookedSlot.id === slot.id)) {
                    return { ...slot, isAvailable: true }
                  }
                  return slot
                })
                localStorage.setItem(LOCAL_STORAGE_KEYS.SLOTS, JSON.stringify(updatedSlots))
              }
            }
          }
        } catch (error) {
          console.error("Error removing booking from local storage:", error)
        }
        return
      }

      if (!databaseInitialized) {
        return
      }

      try {
        // Delete the booking
        const { error: deleteBookingError } = await getSupabase().from("cricket_bookings").delete().eq("id", bookingId)

        if (deleteBookingError) throw deleteBookingError

        await fetchBookings()
        await fetchSlotsForDate(formData.date)
      } catch (error) {
        console.error("Error removing booking:", error)
      }
    },
    [useLocalStorage, databaseInitialized, fetchBookings, fetchSlotsForDate, formData.date],
  )

  // Load data when component mounts or dependencies change
  useEffect(() => {
    // For Cloudflare, prefer local storage by default
    if (useLocalStorage) {
      // Initialize local storage if needed
      initializeLocalStorage()
      fetchSlotsFromLocalStorage(formData.date)
      fetchBookingsFromLocalStorage()
      setIsLoading(false)
    } else {
      // Check if database is initialized
      checkDatabaseInitialized().then((initialized) => {
        if (initialized) {
          fetchSlotsForDate(formData.date)
          fetchBookings()
        } else {
          // Use mock data if database is not initialized
          setRawSlots(generateSlotsForDate(formData.date))
          setIsLoading(false)
        }
      })
    }
  }, [
    formData.date,
    useLocalStorage,
    databaseInitialized,
    initializeLocalStorage,
    fetchSlotsFromLocalStorage,
    fetchBookingsFromLocalStorage,
    checkDatabaseInitialized,
  ])

  return (
    <BookingContext.Provider
      value={{
        formData,
        availableDates,
        slots,
        bookings,
        totalAmount,
        isLoading,
        updateFormData,
        selectSlot,
        deselectSlot,
        resetBooking,
        addBooking,
        updateBookingStatus,
        removeBooking,
        fetchBookings,
        fetchBookingsForDate,
        fetchBookingsWithPagination,
        databaseInitialized,
        initializeDatabase: initializeDatabaseWrapper,
        useLocalStorage,
        setUseLocalStorage,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}
