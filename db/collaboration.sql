-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT false
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(team_id, user_id)
);

-- Shared investigations table
CREATE TABLE IF NOT EXISTS shared_investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permission VARCHAR(50) NOT NULL DEFAULT 'view', -- 'view', 'edit', 'manage'
  UNIQUE(investigation_id, team_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT false
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(255),
  wallet_address VARCHAR(255),
  coordinates JSONB, -- For visual annotations on graphs
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'comment', 'share', 'mention', 'system'
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_id UUID, -- Generic reference to the source (investigation, comment, etc.)
  source_type VARCHAR(50) -- Type of the source
);

-- Add RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Team creators can manage their teams" ON teams
  FOR ALL USING (auth.uid() = created_by);
  
CREATE POLICY "Team members can view teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Team members policies
CREATE POLICY "Team admins can manage members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = team_members.team_id 
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );
  
CREATE POLICY "Users can view their team memberships" ON team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Shared investigations policies
CREATE POLICY "Investigation owners can manage sharing" ON shared_investigations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM investigations 
      WHERE investigations.id = shared_investigations.investigation_id 
      AND investigations.created_by = auth.uid()
    )
  );
  
CREATE POLICY "Team members can view shared investigations" ON shared_investigations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = shared_investigations.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Comment creators can manage their comments" ON comments
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can view comments on shared investigations" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_investigations 
      WHERE shared_investigations.investigation_id = comments.investigation_id
      AND EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_members.team_id = shared_investigations.team_id 
        AND team_members.user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM investigations 
      WHERE investigations.id = comments.investigation_id 
      AND investigations.created_by = auth.uid()
    )
  );

-- Annotations policies
CREATE POLICY "Annotation creators can manage their annotations" ON annotations
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can view annotations on shared investigations" ON annotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_investigations 
      WHERE shared_investigations.investigation_id = annotations.investigation_id
      AND EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_members.team_id = shared_investigations.team_id 
        AND team_members.user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM investigations 
      WHERE investigations.id = annotations.investigation_id 
      AND investigations.created_by = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can manage their notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
