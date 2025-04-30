import { createClient } from "@/lib/supabase"
import type { EntityLabel } from "@/types/entity"

// Mock entity database for testing
const KNOWN_ENTITIES = [
  {
    address: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    name: "Serum DEX",
    category: "exchange",
    riskLevel: "low",
  },
  {
    address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
    name: "Serum Token",
    category: "token",
    riskLevel: "low",
  },
]

// Lookup entity in the mock database
function lookupEntity(address: string) {
  return KNOWN_ENTITIES.find((entity) => entity.address === address)
}

// Get entity label by address - MISSING EXPORT
export async function getEntityLabel(address: string, labelName?: string): Promise<EntityLabel | null> {
  const supabase = createClient()

  try {
    let query = supabase.from("entity_labels").select("*").eq("address", address)

    if (labelName) {
      query = query.eq("label", labelName)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null
      }
      console.error("Error fetching entity label:", error)
      throw error
    }

    if (!data) return null

    // Convert from DB format to application format
    return {
      id: data.id,
      address: data.address,
      label: data.label,
      category: data.category,
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
    console.error("Failed to fetch entity label:", error)
    throw error
  }
}

// Fetch entity labels from database
export async function fetchEntityLabelsFromDB(walletAddress: string): Promise<EntityLabel[]> {
  try {
    if (!walletAddress || typeof walletAddress !== "string") {
      throw new Error("Invalid wallet address")
    }

    const supabase = createClient()

    const { data, error } = await supabase.from("entity_labels").select("*").eq("address", walletAddress)

    if (error) throw error

    // If no custom label exists, check the known entities database
    if (!data || data.length === 0) {
      const knownEntity = lookupEntity(walletAddress)
      if (knownEntity) {
        return [
          {
            id: `known-${walletAddress}`,
            address: walletAddress,
            label: knownEntity.name,
            category: knownEntity.category,
            confidence: 100,
            source: "system",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      }
      return []
    }

    return data.map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label || item.name,
      category: item.category || item.type,
      confidence: item.confidence || 100,
      source: item.source || "user",
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      verified: item.verified || false,
      riskScore: item.risk_score,
      tags: item.tags,
      notes: item.notes,
    }))
  } catch (error) {
    console.error("Error fetching entity labels:", error)
    return []
  }
}

// Save entity label with proper validation
export async function saveEntityLabel(
  label: Omit<EntityLabel, "id" | "createdAt" | "updatedAt">,
): Promise<EntityLabel> {
  try {
    const supabase = createClient()

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
      category: data.category,
      confidence: data.confidence,
      source: data.source,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      verified: data.verified,
      riskScore: data.risk_score,
      tags: data.tags,
      notes: data.notes,
    }
  } catch (error) {
    console.error("Failed to save entity label:", error)
    throw error
  }
}

// Update an existing entity label - MISSING EXPORT
export async function updateEntityLabel(id: string, updates: Partial<EntityLabel>): Promise<EntityLabel> {
  const supabase = createClient()

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
      category: data.category,
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

// Delete an entity label - MISSING EXPORT
export async function deleteEntityLabel(id: string): Promise<void> {
  const supabase = createClient()

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
