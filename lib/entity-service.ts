"use server"
import { createClient } from "@/lib/supabase"
import type { EntityLabel } from "@/types/entity"

const supabase = createClient()

export async function updateEntityLabel(id: string, updates: Partial<EntityLabel>): Promise<EntityLabel> {
  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .update({
        label: updates.label,
        category: updates.category,
        confidence: updates.confidence,
        source: updates.source,
        notes: updates.notes,
        tags: updates.tags,
        risk_score: updates.riskScore,
        verified: updates.verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating entity label:", error)
      throw error
    }

    return data as EntityLabel
  } catch (error) {
    console.error("Failed to update entity label:", error)
    throw error
  }
}

export async function getEntityLabel(address: string): Promise<string | undefined> {
  try {
    const { data, error } = await supabase.from("entity_labels").select("label").eq("address", address).single()

    if (error) {
      // If no results are found, it's not an error, just return undefined
      if (error.code === "PGRST116") {
        return undefined
      }
      console.error("Error fetching entity label:", error)
      return undefined // Or throw error if appropriate for your use case
    }

    return data.label
  } catch (error) {
    console.error("Failed to fetch entity label:", error)
    return undefined
  }
}

export async function fetchEntityLabelsFromDB(walletAddress: string): Promise<EntityLabel[]> {
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

    return data as EntityLabel[]
  } catch (error) {
    console.error("Failed to fetch entity labels:", error)
    throw error
  }
}

export async function saveEntityLabel(label: {
  address: string
  label: string
  category: string
  confidence: number
  source: string
  notes?: string
  tags?: string[]
  riskScore?: number
  verified?: boolean
}): Promise<EntityLabel> {
  try {
    const { data, error } = await supabase
      .from("entity_labels")
      .insert([
        {
          address: label.address,
          label: label.label,
          category: label.category,
          confidence: label.confidence,
          source: label.source,
          notes: label.notes,
          tags: label.tags,
          risk_score: label.riskScore,
          verified: label.verified,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving entity label:", error)
      throw error
    }

    return data as EntityLabel
  } catch (error) {
    console.error("Failed to save entity label:", error)
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
