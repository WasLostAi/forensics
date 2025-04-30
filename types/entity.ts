export interface EntityLabel {
  id: string
  address: string
  label: string
  category: string
  confidence: number
  source: string
  createdAt: string
  updatedAt: string
  verified?: boolean
  riskScore?: number
  tags?: string[]
  notes?: string
  connections?: EntityConnection[]
  clusterIds?: string[]
}

export interface EntityConnection {
  id: string
  sourceEntityId: string
  targetEntityId: string
  relationshipType: string
  strength: number
  evidence: string
  createdAt: string
  createdBy: string
}

export interface EntityClusterMembership {
  entityId: string
  clusterId: string
  similarityScore: number
  joinedAt: string
}

export interface EntityCluster {
  id: string
  name: string
  description?: string
  category: string
  riskScore: number
  memberCount: number
  createdAt: string
  updatedAt?: string
  createdBy?: string
  tags?: string[]
  behaviorPatterns?: string[]
}

export type Entity = {
  type: string
  name: string
  address: string
  category: string
  confidence: number
  tags?: string[]
  riskScore?: number
  description?: string
}
