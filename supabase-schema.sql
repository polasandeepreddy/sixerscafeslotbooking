-- Create a single table for cricket bookings
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
CREATE INDEX IF NOT EXISTS idx_cricket_bookings_date ON cricket_bookings(date);
