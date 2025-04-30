import { createClient } from "@/lib/supabase"
import type { EntityLabel } from "@/types/entity"

// Get all entity labels
export async function fetchEntityLabelsFromDB(walletAddress: string): Promise<EntityLabel[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .select("*")
      .eq("address", walletAddress)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching entity labels:", error)
      throw error
    }

    // Convert from DB format to application format
    return (data || []).map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category,
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
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}

// Get entity label by address
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
    return null
  }
}

// Create a new entity label
export async function saveEntityLabel(
  label: Omit<EntityLabel, "id" | "createdAt" | "updatedAt">,
): Promise<EntityLabel> {
  const supabase = createClient()

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
    console.error("Failed to save entity label:", error)
    throw error
  }
}

// Update an existing entity label
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

// Delete an entity label
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

// Get entity labels by category
export async function getEntityLabelsByCategory(category: string): Promise<EntityLabel[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching entity labels by category:", error)
      throw error
    }

    return (data || []).map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category,
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
    console.error("Failed to fetch entity labels by category:", error)
    return []
  }
}

// Search entity labels
export async function searchEntityLabels(query: string): Promise<EntityLabel[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .select("*")
      .or(`label.ilike.%${query}%,address.ilike.%${query}%,notes.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error searching entity labels:", error)
      throw error
    }

    return (data || []).map((item) => ({
      id: item.id,
      address: item.address,
      label: item.label,
      category: item.category,
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
