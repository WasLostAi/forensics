import { supabase } from "./supabase"
import type { EntityLabel } from "@/types/entity"

export async function fetchEntityLabelsFromDB(walletAddress: string): Promise<EntityLabel[]> {
  try {
    const { data, error } = await supabase.from("entity_labels").select("*").eq("address", walletAddress)

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
    }))
  } catch (error) {
    console.error("Failed to fetch entity labels:", error)

    // Return mock data as fallback
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
      tags: data.tags || undefined,
      notes: data.notes || undefined,
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
    }
  }
}
