-- Entity Labels Table
CREATE TABLE IF NOT EXISTS entity_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  risk_score INTEGER,
  tags TEXT[],
  notes TEXT,
  cluster_ids TEXT[]
);

-- Create index on address for faster lookups
CREATE INDEX IF NOT EXISTS idx_entity_labels_address ON entity_labels(address);
CREATE INDEX IF NOT EXISTS idx_entity_labels_category ON entity_labels(category);
CREATE INDEX IF NOT EXISTS idx_entity_labels_source ON entity_labels(source);

-- Entity Connections Table
CREATE TABLE IF NOT EXISTS entity_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_entity_id UUID NOT NULL REFERENCES entity_labels(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES entity_labels(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  strength FLOAT NOT NULL DEFAULT 0.5,
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_entity_connections_source ON entity_connections(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_connections_target ON entity_connections(target_entity_id);

-- Entity Clusters Table
CREATE TABLE IF NOT EXISTS entity_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 50,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  tags TEXT[],
  behavior_patterns TEXT[]
);

-- Entity Cluster Memberships Table
CREATE TABLE IF NOT EXISTS entity_cluster_memberships (
  entity_id UUID NOT NULL REFERENCES entity_labels(id) ON DELETE CASCADE,
  cluster_id UUID NOT NULL REFERENCES entity_clusters(id) ON DELETE CASCADE,
  similarity_score FLOAT NOT NULL DEFAULT 0.5,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (entity_id, cluster_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_entity_cluster_memberships_entity ON entity_cluster_memberships(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_cluster_memberships_cluster ON entity_cluster_memberships(cluster_id);

-- Function to increment cluster member count
CREATE OR REPLACE FUNCTION increment_cluster_member_count(cluster_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE entity_clusters
  SET member_count = member_count + 1
  WHERE id = cluster_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement cluster member count
CREATE OR REPLACE FUNCTION decrement_cluster_member_count(cluster_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE entity_clusters
  SET member_count = GREATEST(0, member_count - 1)
  WHERE id = cluster_id;
END;
$$ LANGUAGE plpgsql;
