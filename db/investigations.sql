-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create investigations table if it doesn't exist
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  addresses TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a stored procedure to create the investigations table
CREATE OR REPLACE FUNCTION create_investigations_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    addresses TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data if the table is empty
INSERT INTO investigations (title, description, status, addresses, tags)
SELECT 
  'Suspicious Exchange Activity',
  'Investigation into unusual transaction patterns from Binance hot wallet',
  'open',
  ARRAY['14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA'],
  ARRAY['exchange', 'high-volume', 'suspicious']
WHERE NOT EXISTS (SELECT 1 FROM investigations LIMIT 1);

INSERT INTO investigations (title, description, status, addresses, tags)
SELECT 
  'Potential Rugpull Analysis',
  'Tracking fund movements from suspected rugpull token',
  'open',
  ARRAY['Rug9PulL5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH'],
  ARRAY['token', 'rugpull', 'high-risk']
WHERE NOT EXISTS (SELECT 1 FROM investigations LIMIT 1);

INSERT INTO investigations (title, description, status, addresses, tags)
SELECT 
  'Whale Wallet Monitoring',
  'Tracking large SOL holder activity and fund movements',
  'active',
  ARRAY['WhALEXYZ123456789abcdefghijklmnopqrstuvwxyz123'],
  ARRAY['whale', 'monitoring', 'high-value']
WHERE NOT EXISTS (SELECT 1 FROM investigations LIMIT 1);
