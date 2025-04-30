export interface EntityNode {
  id: string
  label: string
  category: string
  riskScore: number
  group: number
  size: number
}

export interface EntityRelationship {
  source: string
  target: string
  value: number
  type: string
  timestamp: string
}

export interface EntityGraph {
  nodes: EntityNode[]
  links: EntityRelationship[]
}
