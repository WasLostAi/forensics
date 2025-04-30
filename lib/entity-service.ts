import { supabase } from "./supabase"
import type { EntityLabel, EntityConnection, EntityCluster } from "@/types/entity"

// Helper function to check if Supabase is properly initialized
const isSupabaseInitialized = () => {
  try {
    // Try to access a property that would be available if Supabase is initialized
    return !!supabase && !!supabase.from
  } catch (error) {
    console.error("Supabase client not properly initialized:", error)
    return false
  }
}

export async function fetchEntityLabelsFromDB(walletAddress?: string): Promise<EntityLabel[]> {
  try {
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      throw new Error("Supabase client not properly initialized")
    }

    let query = supabase.from("entity_labels").select("*")

    if (walletAddress) {
      query = query.eq("address", walletAddress)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching entity labels:", error)
      throw error
    }

    // If no data is found, return an empty array
    if (!data || data.length === 0) {
      return []
    }

    // Convert from DB format to application format
    return data.map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category as any,
      confidence: item.confidence,
      source: item.source,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      verified: item.verified,
      riskScore: item.risk_score || undefined,
      tags: item.tags || undefined,
      notes: item.notes || undefined,
      clusterIds: item.cluster_ids || undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch entity labels:", error)

    // Return mock data as fallback
    if (walletAddress) {
      return [
        {
          id: "mock-1",
          address: walletAddress,
          label: "Unknown Wallet",
          category: "individual",
          confidence: 0.5,
          source: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verified: false,
        },
      ]
    }

    return [
      {
        id: "mock-1",
        address: "14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA",
        label: "Binance Hot Wallet",
        category: "exchange",
        confidence: 0.95,
        source: "community",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verified: true,
        riskScore: 10,
      },
      {
        id: "mock-2",
        address: "5xoBq7f7CDgZwqHrDBdRWM84ExRetg4gZq93dyJtoSwp",
        label: "High Volume Trader",
        category: "individual",
        confidence: 0.75,
        source: "algorithm",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        riskScore: 35,
      },
      {
        id: "mock-3",
        address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        label: "Suspicious Mixer",
        category: "mixer",
        confidence: 0.88,
        source: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        riskScore: 85,
        tags: ["high-risk", "mixer"],
      },
    ]
  }
}

export async function saveEntityLabel(
  label: Omit<EntityLabel, "id" | "createdAt" | "updatedAt">,
): Promise<EntityLabel> {
  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .insert({
        address: label.address,
        label: label.label,
        category: label.category,
        confidence: label.confidence,
        source: label.source,
        risk_score: label.riskScore,
        tags: label.tags,
        notes: label.notes,
        verified: label.verified || false,
        cluster_ids: label.clusterIds,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving entity label:", error)
      throw error
    }

    return {
      id: data.id,
      address: data.address,
      label: data.label,
      category: data.category as any,
      confidence: data.confidence,
      source: data.source,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      verified: data.verified,
      riskScore: data.risk_score || undefined,
      tags: data.tags || undefined,
      notes: data.notes || undefined,
      clusterIds: data.cluster_ids || undefined,
    }
  } catch (error) {
    console.error("Failed to save entity label:", error)

    // Return mock data as fallback
    return {
      id: `mock-${Date.now()}`,
      address: label.address,
      label: label.label,
      category: label.category,
      confidence: label.confidence,
      source: label.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verified: label.verified || false,
      riskScore: label.riskScore,
      tags: label.tags,
      notes: label.notes,
      clusterIds: label.clusterIds,
    }
  }
}

export async function updateEntityLabel(id: string, updates: Partial<EntityLabel>): Promise<EntityLabel> {
  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .update({
        label: updates.label,
        category: updates.category,
        confidence: updates.confidence,
        source: updates.source,
        updated_at: new Date().toISOString(),
        risk_score: updates.riskScore,
        tags: updates.tags,
        notes: updates.notes,
        verified: updates.verified,
        cluster_ids: updates.clusterIds,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating entity label:", error)
      throw error
    }

    return {
      id: data.id,
      address: data.address,
      label: data.label,
      category: data.category as any,
      confidence: data.confidence,
      source: data.source,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      verified: data.verified,
      riskScore: data.risk_score || undefined,
      tags: updates.tags,
      notes: updates.notes || undefined,
      clusterIds: data.cluster_ids || undefined,
    }
  } catch (error) {
    console.error("Failed to update entity label:", error)
    throw error
  }
}

export async function deleteEntityLabel(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("entity_labels").delete().eq("id", id)

    if (error) {
      console.error("Error deleting entity label:", error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete entity label:", error)
    throw error
  }
}

export async function searchEntityLabels(query: string): Promise<EntityLabel[]> {
  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .select("*")
      .or(`label.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error("Error searching entity labels:", error)
      throw error
    }

    // Convert from DB format to application format
    return data.map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category as any,
      confidence: item.confidence,
      source: item.source,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      verified: item.verified,
      riskScore: item.risk_score || undefined,
      tags: item.tags || undefined,
      notes: item.notes || undefined,
      clusterIds: item.cluster_ids || undefined,
    }))
  } catch (error) {
    console.error("Failed to search entity labels:", error)
    return []
  }
}

export async function getEntityLabelStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  bySource: Record<string, number>
  verified: number
  clustered: number
}> {
  try {
    // Get total count
    const { count: total, error: countError } = await supabase
      .from("entity_labels")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Get counts by category
    const { data: categoryData, error: categoryError } = await supabase
      .from("entity_labels")
      .select("category, count")
      .group("category")

    if (categoryError) {
      throw categoryError
    }

    // Get counts by source
    const { data: sourceData, error: sourceError } = await supabase
      .from("entity_labels")
      .select("source, count")
      .group("source")

    if (sourceError) {
      throw sourceError
    }

    // Get verified count
    const { count: verified, error: verifiedError } = await supabase
      .from("entity_labels")
      .select("*", { count: "exact", head: true })
      .eq("verified", true)

    if (verifiedError) {
      throw verifiedError
    }

    // Get clustered count
    const { count: clustered, error: clusteredError } = await supabase
      .from("entity_labels")
      .select("*", { count: "exact", head: true })
      .not("cluster_ids", "is", null)

    if (clusteredError) {
      throw clusteredError
    }

    // Format the results
    const byCategory: Record<string, number> = {}
    categoryData.forEach((item) => {
      byCategory[item.category] = Number.parseInt(item.count)
    })

    const bySource: Record<string, number> = {}
    sourceData.forEach((item) => {
      bySource[item.source] = Number.parseInt(item.count)
    })

    return {
      total: total || 0,
      byCategory,
      bySource,
      verified: verified || 0,
      clustered: clustered || 0,
    }
  } catch (error) {
    console.error("Failed to get entity label stats:", error)

    // Return mock data as fallback
    return {
      total: 125,
      byCategory: {
        exchange: 45,
        individual: 30,
        contract: 25,
        mixer: 10,
        scam: 15,
      },
      bySource: {
        user: 50,
        community: 30,
        algorithm: 25,
        database: 20,
      },
      verified: 35,
      clustered: 78,
    }
  }
}

// New functions for entity connections

export async function createEntityConnection(
  connection: Omit<EntityConnection, "id" | "createdAt">,
): Promise<EntityConnection> {
  try {
    const { data, error } = await supabase
      .from("entity_connections")
      .insert({
        source_entity_id: connection.sourceEntityId,
        target_entity_id: connection.targetEntityId,
        relationship_type: connection.relationshipType,
        strength: connection.strength,
        evidence: connection.evidence,
        created_by: connection.createdBy,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating entity connection:", error)
      throw error
    }

    return {
      id: data.id,
      sourceEntityId: data.source_entity_id,
      targetEntityId: data.target_entity_id,
      relationshipType: data.relationship_type,
      strength: data.strength,
      evidence: data.evidence,
      createdAt: data.created_at,
      createdBy: data.created_by,
    }
  } catch (error) {
    console.error("Failed to create entity connection:", error)

    // Return mock data as fallback
    return {
      id: `mock-conn-${Date.now()}`,
      sourceEntityId: connection.sourceEntityId,
      targetEntityId: connection.targetEntityId,
      relationshipType: connection.relationshipType,
      strength: connection.strength,
      evidence: connection.evidence,
      createdAt: new Date().toISOString(),
      createdBy: connection.createdBy,
    }
  }
}

export async function getEntityConnections(entityId: string): Promise<EntityConnection[]> {
  try {
    const { data, error } = await supabase
      .from("entity_connections")
      .select("*")
      .or(`source_entity_id.eq.${entityId},target_entity_id.eq.${entityId}`)

    if (error) {
      console.error("Error fetching entity connections:", error)
      throw error
    }

    return (data || []).map((item) => ({
      id: item.id,
      sourceEntityId: item.source_entity_id,
      targetEntityId: item.target_entity_id,
      relationshipType: item.relationship_type,
      strength: item.strength,
      evidence: item.evidence,
      createdAt: item.created_at,
      createdBy: item.created_by,
    }))
  } catch (error) {
    console.error("Failed to fetch entity connections:", error)
    return []
  }
}

export async function deleteEntityConnection(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("entity_connections").delete().eq("id", id)

    if (error) {
      console.error("Error deleting entity connection:", error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete entity connection:", error)
    throw error
  }
}

// Functions for entity clusters

export async function getEntityClusters(): Promise<EntityCluster[]> {
  try {
    // Check if Supabase is initialized
    if (!isSupabaseInitialized()) {
      throw new Error("Supabase client not properly initialized")
    }

    const { data, error } = await supabase.from("entity_clusters").select("*")

    if (error) {
      console.error("Error fetching entity clusters:", error)
      throw error
    }

    return (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      riskScore: item.risk_score,
      memberCount: item.member_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      tags: item.tags,
      behaviorPatterns: item.behavior_patterns,
    }))
  } catch (error) {
    console.error("Failed to fetch entity clusters:", error)

    // Return mock data as fallback
    return [
      {
        id: "cluster-1",
        name: "Exchange-related Wallets",
        description: "Wallets that frequently interact with major exchanges",
        category: "exchange",
        riskScore: 20,
        memberCount: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["exchange", "high-volume"],
        behaviorPatterns: ["regular-withdrawals", "large-deposits"],
      },
      {
        id: "cluster-2",
        name: "Suspicious Mixer Network",
        description: "Wallets associated with mixing services",
        category: "mixer",
        riskScore: 85,
        memberCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["mixer", "high-risk", "privacy"],
        behaviorPatterns: ["complex-transfers", "splitting-amounts"],
      },
      {
        id: "cluster-3",
        name: "NFT Trading Group",
        description: "Wallets focused on NFT trading",
        category: "individual",
        riskScore: 30,
        memberCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["nft", "trading"],
        behaviorPatterns: ["nft-purchases", "marketplace-interaction"],
      },
    ]
  }
}

export async function getClusterMembers(clusterId: string): Promise<EntityLabel[]> {
  try {
    const { data, error } = await supabase
      .from("entity_cluster_memberships")
      .select("entity_id, similarity_score, joined_at")
      .eq("cluster_id", clusterId)

    if (error) {
      console.error("Error fetching cluster members:", error)
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    // Get the entity details for each member
    const entityIds = data.map((item) => item.entity_id)
    const { data: entityData, error: entityError } = await supabase
      .from("entity_labels")
      .select("*")
      .in("id", entityIds)

    if (entityError) {
      console.error("Error fetching entity details for cluster members:", entityError)
      throw entityError
    }

    // Combine the data
    return entityData.map((entity) => {
      const membership = data.find((m) => m.entity_id === entity.id)
      return {
        id: entity.id,
        address: entity.address,
        label: entity.label,
        category: entity.category,
        confidence: entity.confidence,
        source: entity.source,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        verified: entity.verified,
        riskScore: entity.risk_score,
        tags: entity.tags,
        notes: entity.notes,
        clusterIds: entity.cluster_ids,
        // Add membership details
        similarityScore: membership?.similarity_score,
        joinedAt: membership?.joined_at,
      }
    })
  } catch (error) {
    console.error("Failed to fetch cluster members:", error)
    return []
  }
}

export async function addEntityToCluster(entityId: string, clusterId: string, similarityScore: number): Promise<void> {
  try {
    // Add to membership table
    const { error: membershipError } = await supabase.from("entity_cluster_memberships").insert({
      entity_id: entityId,
      cluster_id: clusterId,
      similarity_score: similarityScore,
    })

    if (membershipError) {
      console.error("Error adding entity to cluster membership:", membershipError)
      throw membershipError
    }

    // Update the entity's cluster_ids array
    const { data: entityData, error: entityError } = await supabase
      .from("entity_labels")
      .select("cluster_ids")
      .eq("id", entityId)
      .single()

    if (entityError) {
      console.error("Error fetching entity cluster IDs:", entityError)
      throw entityError
    }

    const clusterIds = entityData.cluster_ids || []
    if (!clusterIds.includes(clusterId)) {
      clusterIds.push(clusterId)

      const { error: updateError } = await supabase
        .from("entity_labels")
        .update({ cluster_ids: clusterIds })
        .eq("id", entityId)

      if (updateError) {
        console.error("Error updating entity cluster IDs:", updateError)
        throw updateError
      }
    }

    // Update the cluster's member count
    const { error: countError } = await supabase.rpc("increment_cluster_member_count", {
      cluster_id: clusterId,
    })

    if (countError) {
      console.error("Error updating cluster member count:", countError)
      throw countError
    }
  } catch (error) {
    console.error("Failed to add entity to cluster:", error)
    throw error
  }
}

export async function removeEntityFromCluster(entityId: string, clusterId: string): Promise<void> {
  try {
    // Remove from membership table
    const { error: membershipError } = await supabase
      .from("entity_cluster_memberships")
      .delete()
      .eq("entity_id", entityId)
      .eq("cluster_id", clusterId)

    if (membershipError) {
      console.error("Error removing entity from cluster membership:", membershipError)
      throw membershipError
    }

    // Update the entity's cluster_ids array
    const { data: entityData, error: entityError } = await supabase
      .from("entity_labels")
      .select("cluster_ids")
      .eq("id", entityId)
      .single()

    if (entityError) {
      console.error("Error fetching entity cluster IDs:", entityError)
      throw entityError
    }

    const clusterIds = entityData.cluster_ids || []
    const updatedClusterIds = clusterIds.filter((id) => id !== clusterId)

    const { error: updateError } = await supabase
      .from("entity_labels")
      .update({ cluster_ids: updatedClusterIds })
      .eq("id", entityId)

    if (updateError) {
      console.error("Error updating entity cluster IDs:", updateError)
      throw updateError
    }

    // Update the cluster's member count
    const { error: countError } = await supabase.rpc("decrement_cluster_member_count", {
      cluster_id: clusterId,
    })

    if (countError) {
      console.error("Error updating cluster member count:", countError)
      throw countError
    }
  } catch (error) {
    console.error("Failed to remove entity from cluster:", error)
    throw error
  }
}

export async function createEntityCluster(
  cluster: Omit<EntityCluster, "id" | "createdAt" | "updatedAt" | "memberCount">,
): Promise<EntityCluster> {
  try {
    const { data, error } = await supabase
      .from("entity_clusters")
      .insert({
        name: cluster.name,
        description: cluster.description,
        category: cluster.category,
        risk_score: cluster.riskScore,
        created_by: cluster.createdBy,
        tags: cluster.tags,
        behavior_patterns: cluster.behaviorPatterns,
        member_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating entity cluster:", error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      riskScore: data.risk_score,
      memberCount: data.member_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      tags: data.tags,
      behaviorPatterns: data.behavior_patterns,
    }
  } catch (error) {
    console.error("Failed to create entity cluster:", error)

    // Return mock data as fallback
    return {
      id: `mock-cluster-${Date.now()}`,
      name: cluster.name,
      description: cluster.description,
      category: cluster.category,
      riskScore: cluster.riskScore,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: cluster.createdBy,
      tags: cluster.tags,
      behaviorPatterns: cluster.behaviorPatterns,
    }
  }
}

export async function updateEntityCluster(id: string, updates: Partial<EntityCluster>): Promise<EntityCluster> {
  try {
    const { data, error } = await supabase
      .from("entity_clusters")
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        risk_score: updates.riskScore,
        tags: updates.tags,
        behavior_patterns: updates.behaviorPatterns,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating entity cluster:", error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      riskScore: data.risk_score,
      memberCount: data.member_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      tags: data.tags,
      behaviorPatterns: data.behavior_patterns,
    }
  } catch (error) {
    console.error("Failed to update entity cluster:", error)
    throw error
  }
}

export async function deleteEntityCluster(id: string): Promise<void> {
  try {
    // First, remove all memberships
    const { error: membershipError } = await supabase.from("entity_cluster_memberships").delete().eq("cluster_id", id)

    if (membershipError) {
      console.error("Error removing cluster memberships:", membershipError)
      throw membershipError
    }

    // Then, update all entities that reference this cluster
    const { data: entitiesData, error: entitiesError } = await supabase
      .from("entity_labels")
      .select("id, cluster_ids")
      .contains("cluster_ids", [id])

    if (entitiesError) {
      console.error("Error fetching entities with cluster reference:", entitiesError)
      throw entitiesError
    }

    // Update each entity to remove the cluster ID
    for (const entity of entitiesData) {
      const updatedClusterIds = (entity.cluster_ids || []).filter((clusterId) => clusterId !== id)

      const { error: updateError } = await supabase
        .from("entity_labels")
        .update({ cluster_ids: updatedClusterIds })
        .eq("id", entity.id)

      if (updateError) {
        console.error(`Error updating entity ${entity.id} cluster IDs:`, updateError)
        // Continue with other entities rather than failing completely
      }
    }

    // Finally, delete the cluster
    const { error } = await supabase.from("entity_clusters").delete().eq("id", id)

    if (error) {
      console.error("Error deleting entity cluster:", error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete entity cluster:", error)
    throw error
  }
}

/**
 * Retrieves detailed entity information for a specific address
 */
export async function getEntityByAddress(address: string): Promise<{
  entity: EntityLabel | null
  relatedEntities: EntityLabel[]
  connections: EntityConnection[]
  clusters: EntityCluster[]
  riskProfile: {
    score: number
    factors: Array<{ factor: string; impact: number }>
  }
  confidence: number
}> {
  try {
    // First, try to get the entity from our database
    const { data: entityData, error: entityError } = await supabase
      .from("entity_labels")
      .select("*")
      .eq("address", address)
      .single()

    if (entityError && entityError.code !== "PGRST116") {
      console.error("Error fetching entity:", entityError)
      throw entityError
    }

    // Convert from DB format to application format if entity exists
    const entity = entityData
      ? {
          id: entityData.id,
          address: entityData.address,
          label: entityData.label,
          category: entityData.category as any,
          confidence: entityData.confidence,
          source: entityData.source,
          createdAt: entityData.created_at,
          updatedAt: entityData.updated_at,
          verified: entityData.verified,
          riskScore: entityData.risk_score || undefined,
          tags: entityData.tags || undefined,
          notes: entityData.notes || undefined,
          clusterIds: entityData.cluster_ids || undefined,
        }
      : null

    // Get related entities (entities that have interacted with this address)
    const { data: relatedData, error: relatedError } = await supabase
      .from("entity_labels")
      .select("*")
      .in("address", function () {
        // This is a placeholder for a subquery that would get addresses that have interacted with our target address
        // In a real implementation, this would query a transactions table
        return this.select("related_address").from("transactions").eq("address", address).limit(10)
      })
      .limit(5)

    if (relatedError) {
      console.error("Error fetching related entities:", relatedError)
      // Continue with empty related entities rather than failing completely
    }

    // Convert related entities from DB format
    const relatedEntities = (relatedData || []).map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category as any,
      confidence: item.confidence,
      source: item.source,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      verified: item.verified,
      riskScore: item.risk_score || undefined,
      tags: item.tags || undefined,
      notes: item.notes || undefined,
      clusterIds: item.cluster_ids || undefined,
    }))

    // Get connections for this entity
    let connections: EntityConnection[] = []
    if (entity) {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("entity_connections")
        .select("*")
        .or(`source_entity_id.eq.${entity.id},target_entity_id.eq.${entity.id}`)

      if (connectionsError) {
        console.error("Error fetching entity connections:", connectionsError)
      } else {
        connections = (connectionsData || []).map((item) => ({
          id: item.id,
          sourceEntityId: item.source_entity_id,
          targetEntityId: item.target_entity_id,
          relationshipType: item.relationship_type,
          strength: item.strength,
          evidence: item.evidence,
          createdAt: item.created_at,
          createdBy: item.created_by,
        }))
      }
    }

    // Get clusters for this entity
    let clusters: EntityCluster[] = []
    if (entity && entity.clusterIds && entity.clusterIds.length > 0) {
      const { data: clustersData, error: clustersError } = await supabase
        .from("entity_clusters")
        .select("*")
        .in("id", entity.clusterIds)

      if (clustersError) {
        console.error("Error fetching entity clusters:", clustersError)
      } else {
        clusters = (clustersData || []).map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          riskScore: item.risk_score,
          memberCount: item.member_count,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          createdBy: item.created_by,
          tags: item.tags,
          behaviorPatterns: item.behavior_patterns,
        }))
      }
    }

    // Calculate risk profile
    const riskFactors: Array<{ factor: string; impact: number }> = []
    let totalRiskScore = entity?.riskScore || 50

    // Add risk factors based on entity category
    if (entity?.category === "mixer") {
      riskFactors.push({ factor: "Mixer service", impact: 30 })
      totalRiskScore = Math.min(100, totalRiskScore + 30)
    } else if (entity?.category === "scam") {
      riskFactors.push({ factor: "Known scam", impact: 40 })
      totalRiskScore = Math.min(100, totalRiskScore + 40)
    } else if (entity?.category === "exchange") {
      riskFactors.push({ factor: "Exchange service", impact: -10 })
      totalRiskScore = Math.max(0, totalRiskScore - 10)
    }

    // Add risk factors based on tags
    if (entity?.tags?.includes("sanctioned")) {
      riskFactors.push({ factor: "Sanctioned entity", impact: 50 })
      totalRiskScore = Math.min(100, totalRiskScore + 50)
    }

    if (entity?.tags?.includes("darkweb")) {
      riskFactors.push({ factor: "Dark web association", impact: 25 })
      totalRiskScore = Math.min(100, totalRiskScore + 25)
    }

    // Add risk factors based on cluster membership
    if (clusters.some((c) => c.riskScore > 70)) {
      riskFactors.push({ factor: "Member of high-risk cluster", impact: 20 })
      totalRiskScore = Math.min(100, totalRiskScore + 20)
    }

    // Calculate confidence based on source and verification
    let confidence = entity?.confidence || 0.5
    if (entity?.verified) {
      confidence = Math.min(1.0, confidence + 0.3)
    }

    if (entity?.source === "community") {
      confidence = Math.max(0.1, confidence - 0.1)
    } else if (entity?.source === "algorithm") {
      confidence = Math.max(0.1, confidence - 0.2)
    }

    return {
      entity,
      relatedEntities,
      connections,
      clusters,
      riskProfile: {
        score: totalRiskScore,
        factors: riskFactors,
      },
      confidence,
    }
  } catch (error) {
    console.error("Failed to get entity by address:", error)

    // Return a minimal response with null entity as fallback
    return {
      entity: null,
      relatedEntities: [],
      connections: [],
      clusters: [],
      riskProfile: {
        score: 50,
        factors: [{ factor: "Unknown entity", impact: 0 }],
      },
      confidence: 0.1,
    }
  }
}
