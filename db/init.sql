-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entity_labels table if it doesn't exist
CREATE TABLE IF NOT EXISTS entity_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 1.0,
  source TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction_clusters table if it doesn't exist
CREATE TABLE IF NOT EXISTS transaction_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  risk_score FLOAT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cluster_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS cluster_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES transaction_clusters(id) ON DELETE CASCADE,
  transaction_signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigations table if it doesn't exist
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investigation_entities table if it doesn't exist
CREATE TABLE IF NOT EXISTS investigation_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_entities ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for entity_labels
CREATE POLICY "Anyone can view entity labels" 
  ON entity_labels FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create entity labels" 
  ON entity_labels FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can update their own entity labels" 
  ON entity_labels FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Create policies for investigations
CREATE POLICY "Users can view their own investigations" 
  ON investigations FOR SELECT 
  TO authenticated 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create investigations" 
  ON investigations FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own investigations" 
  ON investigations FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS entity_labels_address_idx ON entity_labels(address);
CREATE INDEX IF NOT EXISTS cluster_transactions_cluster_id_idx ON cluster_transactions(cluster_id);
CREATE INDEX IF NOT EXISTS investigation_entities_investigation_id_idx ON investigation_entities(investigation_id);
