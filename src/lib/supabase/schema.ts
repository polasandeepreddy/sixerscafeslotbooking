export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cricket_bookings: {
        Row: {
          id: string
          full_name: string
          mobile_number: string
          date: string
          created_at: string
          payment_status: "pending" | "approved" | "rejected"
          payment_screenshot: string | null
          total_amount: number
          slots: Json // Array of slot objects
        }
        Insert: {
          id?: string
          full_name: string
          mobile_number: string
          date: string
          created_at?: string
          payment_status?: "pending" | "approved" | "rejected"
          payment_screenshot?: string | null
          total_amount: number
          slots: Json
        }
        Update: {
          id?: string
          full_name?: string
          mobile_number?: string
          date?: string
          created_at?: string
          payment_status?: "pending" | "approved" | "rejected"
          payment_screenshot?: string | null
          total_amount?: number
          slots?: Json
        }
      }
    }
  }
}
