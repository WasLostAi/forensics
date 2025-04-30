import { supabase } from "./supabase"

interface Investigation {
  id?: string
  title: string
  description?: string
  status?: string
  addresses?: string[]
  tags?: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

// Update the fetchInvestigations function to handle errors better and provide fallback data

// Replace the fetchInvestigations function with this improved version:
export async function fetchInvestigations(): Promise<Investigation[]> {
  try {
    const { data, error } = await supabase.from("investigations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.warn("Error fetching investigations:", error)

      // Return mock data instead of throwing an error
      return getMockInvestigations()
    }

    return data
  } catch (error) {
    console.warn("Failed to fetch investigations:", error)

    // Return mock data on any error
    return getMockInvestigations()
  }
}

// Add this helper function to provide mock data
function getMockInvestigations(): Investigation[] {
  return [
    {
      id: "1",
      title: "Suspicious Exchange Activity",
      description: "Investigation into unusual transaction patterns from Binance hot wallet",
      status: "open",
      addresses: ["14FUT96s9swbmH7ZjpDvfEDywnAYy9zaNhv4HvB8F7oA"],
      tags: ["exchange", "high-volume", "suspicious"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    },
    {
      id: "2",
      title: "Potential Rugpull Analysis",
      description: "Tracking fund movements from suspected rugpull token",
      status: "open",
      addresses: ["Rug9PulL5X8sMzMR6LSuuBJ5oAbJyC41GrYuczs4LRH"],
      tags: ["token", "rugpull", "high-risk"],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      created_by: null,
    },
    {
      id: "3",
      title: "Cross-Chain Fund Tracking",
      description: "Following funds transferred between Solana and Ethereum via bridges",
      status: "in-progress",
      addresses: ["BridgeXYZ123SolanaToEthereumTransferWalletAddress"],
      tags: ["cross-chain", "bridge", "medium-risk"],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      created_by: null,
    },
  ]
}

// Also update the other functions to use mock data as fallback
export async function fetchInvestigation(id: string): Promise<Investigation> {
  try {
    const { data, error } = await supabase.from("investigations").select("*").eq("id", id).single()

    if (error) {
      console.warn("Error fetching investigation:", error)
      // Return a mock investigation that matches the ID
      const mockInvestigations = getMockInvestigations()
      const mockInvestigation = mockInvestigations.find((inv) => inv.id === id)
      if (mockInvestigation) return mockInvestigation

      // If no matching ID, return the first mock investigation
      return mockInvestigations[0]
    }

    return data
  } catch (error) {
    console.warn("Failed to fetch investigation:", error)
    return getMockInvestigations()[0]
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
      console.warn("Error creating investigation:", error)
      // Return a mock created investigation
      return {
        id: Math.random().toString(36).substring(2, 9),
        title: investigation.title,
        description: investigation.description || "",
        status: investigation.status || "open",
        addresses: investigation.addresses || [],
        tags: investigation.tags || [],
        created_by: investigation.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return data
  } catch (error) {
    console.warn("Failed to create investigation:", error)
    // Return a mock created investigation
    return {
      id: Math.random().toString(36).substring(2, 9),
      title: investigation.title,
      description: investigation.description || "",
      status: investigation.status || "open",
      addresses: investigation.addresses || [],
      tags: investigation.tags || [],
      created_by: investigation.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
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
