-- Entity Labels Table
CREATE TABLE IF NOT EXISTS entity_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL,
  risk_score INTEGER,
  tags TEXT[],
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on address for faster lookups
CREATE INDEX IF NOT EXISTS idx_entity_labels_address ON entity_labels(address);
CREATE INDEX IF NOT EXISTS idx_entity_labels_label ON entity_labels(label);

-- Investigations Table
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  addresses TEXT[],
  tags TEXT[],
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction History Table
CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signature TEXT NOT NULL UNIQUE,
  block_time BIGINT,
  status TEXT,
  fee FLOAT,
  amount FLOAT,
  type TEXT,
  source TEXT,
  destination TEXT,
  program TEXT,
  cluster TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on transaction signature
CREATE INDEX IF NOT EXISTS idx_transaction_history_signature ON transaction_history(signature);
CREATE INDEX IF NOT EXISTS idx_transaction_history_source ON transaction_history(source);
CREATE INDEX IF NOT EXISTS idx_transaction_history_destination ON transaction_history(destination);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  use_mock_data BOOLEAN DEFAULT TRUE,
  rpc_url TEXT,
  selected_rpc_name TEXT,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for entity labels
INSERT INTO entity_labels (address, label, category, confidence, source, risk_score, tags, verified)
VALUES
  ('DefcyKc4yAjRsCLZjdxWuSUzVohXtLna9g22y3pBCm2z', 'Binance Hot Wallet', 'exchange', 0.95, 'community', 10, ARRAY['exchange', 'verified'], TRUE),
  ('5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp', 'High Volume Trader', 'individual', 0.75, 'algorithm', 35, ARRAY['high-volume'], FALSE),
  ('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'Suspicious Mixer', 'mixer', 0.88, 'user', 85, ARRAY['high-risk', 'mixer'], FALSE),
  ('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5', 'Solana Foundation', 'contract', 1.0, 'database', 5, ARRAY['verified', 'foundation'], TRUE),
  ('3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR', 'Phishing Contract', 'scam', 0.92, 'community', 95, ARRAY['phishing', 'scam', 'high-risk'], FALSE);
