-- Create the fraud_patterns table
CREATE TABLE IF NOT EXISTS fraud_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  indicators JSONB NOT NULL,
  detection_rules JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT NOT NULL,
  references JSONB NOT NULL,
  examples JSONB NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fraud_patterns_category ON fraud_patterns(category);
CREATE INDEX IF NOT EXISTS idx_fraud_patterns_severity ON fraud_patterns(severity);
