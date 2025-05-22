export interface Slot {
  id: string
  time: string
  isAvailable: boolean
  price: number
  date: string
}

export interface BookingFormData {
  fullName: string
  mobileNumber: string
  date: string
  selectedSlots: Slot[]
}

export interface PaymentDetails {
  amount: number
  currency: string
  description: string
}

export interface Booking {
  id: string
  fullName: string
  mobileNumber: string
  date: string
  slots: Slot[]
  createdAt: string
  paymentStatus: "pending" | "approved" | "rejected"
  paymentScreenshot: string | null
  totalAmount: number
}
