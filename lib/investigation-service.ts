import { supabase } from "./supabase"

interface Investigation {
  id?: string
  title: string
  description?: string
  status?: string
  addresses?: string[]
  tags?: string[]
  created_by?: string
}

export async function fetchInvestigations(): Promise<Investigation[]> {
  try {
    const { data, error } = await supabase.from("investigations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching investigations:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to fetch investigations:", error)
    throw error
  }
}

export async function fetchInvestigation(id: string): Promise<Investigation> {
  try {
    const { data, error } = await supabase.from("investigations").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching investigation:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to fetch investigation:", error)
    throw error
  }
}

export async function createInvestigation(investigation: Investigation): Promise<Investigation> {
  try {
    const { data, error } = await supabase
      .from("investigations")
      .insert({
        title: investigation.title,
        description: investigation.description,
        status: investigation.status || "open",
        addresses: investigation.addresses || [],
        tags: investigation.tags || [],
        created_by: investigation.created_by,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating investigation:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to create investigation:", error)
    throw error
  }
}

export async function updateInvestigation(id: string, updates: Partial<Investigation>): Promise<Investigation> {
  try {
    const { data, error } = await supabase
      .from("investigations")
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        addresses: updates.addresses,
        tags: updates.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating investigation:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to update investigation:", error)
    throw error
  }
}

export async function deleteInvestigation(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("investigations").delete().eq("id", id)

    if (error) {
      console.error("Error deleting investigation:", error)
      throw error
    }
  } catch (error) {
    console.error("Failed to delete investigation:", error)
    throw error
  }
}
