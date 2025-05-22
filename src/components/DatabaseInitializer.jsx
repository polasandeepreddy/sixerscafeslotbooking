"use client"

import { useState, useEffect } from "react"
import { useBooking } from "../context/BookingContext"

export default function DatabaseInitializer() {
  const { databaseInitialized, initializeDatabase, useLocalStorage, setUseLocalStorage } = useBooking()
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  // For Cloudflare deployment, automatically use local storage
  useEffect(() => {
    // Only show the dialog if not initialized and not using local storage
    if (!databaseInitialized && !useLocalStorage) {
      setShowDialog(true)
    }
  }, [databaseInitialized, useLocalStorage])

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)
    try {
      await initializeDatabase()
      setSuccess(true)
    } catch (err) {
      console.error("Error in handleInitialize:", err)
      setError(String(err))
    } finally {
      setIsInitializing(false)
    }
  }

  const handleUseLocalStorage = () => {
    setUseLocalStorage(true)
    setSuccess(true)
    setShowDialog(false)
  }

  // If database is initialized or using local storage, don't show anything
  if (!showDialog) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Choose Storage Option</h2>
        <p className="mb-4">
          Choose how you want to store data for the cricket box booking system. For Cloudflare deployment, we recommend
          using local storage.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleUseLocalStorage}
            className="w-full py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors"
          >
            Use Local Storage (Recommended for Cloudflare)
          </button>

          <p className="text-sm text-gray-600 text-center">
            Local storage is quick to set up and works immediately. Data will be stored in your browser.
          </p>

          <div className="my-4 text-center">
            <span className="text-gray-500">- OR -</span>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Manual Database Setup</h3>
            <p className="text-sm mb-3">
              For persistent storage, you can set up the database table manually in Supabase:
            </p>

            <button
              onClick={() => setShowManualInstructions(!showManualInstructions)}
              className="text-blue-600 underline hover:text-blue-800 text-sm mb-2"
            >
              {showManualInstructions ? "Hide instructions" : "Show instructions"}
            </button>

            {showManualInstructions && (
              <div className="mt-2">
                <ol className="list-decimal pl-5 mb-2 space-y-1 text-sm">
                  <li>Go to your Supabase dashboard</li>
                  <li>Click on "SQL Editor" in the left sidebar</li>
                  <li>Create a new query and paste the following SQL:</li>
                </ol>
                <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-auto mb-2">
                  {`-- Create a single table for cricket bookings
CREATE TABLE IF NOT EXISTS cricket_bookings (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  payment_screenshot TEXT,
  total_amount INTEGER NOT NULL,
  slots JSONB NOT NULL -- Store slots as a JSON array
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cricket_bookings_date ON cricket_bookings(date);`}
                </pre>
                <p className="text-sm">After running the SQL, click the button below:</p>
              </div>
            )}

            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className={`w-full mt-2 py-2 rounded-lg text-white font-semibold ${
                isInitializing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition-colors"
              }`}
            >
              {isInitializing ? "Checking Database..." : "I've Set Up the Database"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <p className="mt-2">
              We recommend using local storage instead. The database setup may require additional configuration.
            </p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4" role="alert">
            <p className="font-bold">Success!</p>
            <p>Storage option set successfully. Please refresh the page to continue.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
