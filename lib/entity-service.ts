import { supabase } from "./supabase"
import type { EntityLabel } from "@/types/entity"

export async function fetchEntityLabelsFromDB(walletAddress: string): Promise<EntityLabel[]> {
  try {
    const { data, error } = await supabase.from("entity_labels").select("*").eq("address", walletAddress)

    if (error) {
      console.error("Error fetching entity labels:", error)
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
    console.error("Failed to fetch entity labels:", error)
    throw error
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
    throw error
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
