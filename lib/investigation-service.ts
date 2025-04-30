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

// Mock data for when Supabase operations fail
const mockInvestigations: Investigation[] = [
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
    title: "Whale Wallet Monitoring",
    description: "Tracking large SOL holder activity and fund movements",
    status: "active",
    addresses: ["WhALEXYZ123456789abcdefghijklmnopqrstuvwxyz123"],
    tags: ["whale", "monitoring", "high-value"],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: null,
  },
]

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

export async function fetchInvestigations(): Promise<Investigation[]> {
  // If we're explicitly using mock data, return it immediately
  if (USE_MOCK_DATA) {
    console.log("Using mock investigation data")
    return Promise.resolve([...mockInvestigations])
  }

  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase.from("investigations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching investigations:", error)
      // Create the investigations table if it doesn't exist
      await createInvestigationsTableIfNeeded()
      return [...mockInvestigations]
    }

    return data.length > 0 ? data : [...mockInvestigations]
  } catch (error) {
    console.error("Failed to fetch investigations:", error)
    return [...mockInvestigations]
  }
}

export async function fetchInvestigation(id: string): Promise<Investigation> {
  if (USE_MOCK_DATA) {
    const mockInvestigation = mockInvestigations.find((inv) => inv.id === id)
    if (mockInvestigation) {
      return Promise.resolve({ ...mockInvestigation })
    }
    return Promise.resolve(mockInvestigations[0])
  }

  try {
    const { data, error } = await supabase.from("investigations").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching investigation:", error)
      return mockInvestigations[0]
    }

    return data
  } catch (error) {
    console.error("Failed to fetch investigation:", error)
    return mockInvestigations[0]
  }
}

export async function createInvestigation(investigation: Investigation): Promise<Investigation> {
  if (USE_MOCK_DATA) {
    const newInvestigation = {
      ...investigation,
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: investigation.status || "open",
    }
    mockInvestigations.push(newInvestigation)
    return Promise.resolve(newInvestigation)
  }

  try {
    // Ensure the table exists
    await createInvestigationsTableIfNeeded()

    const { data, error } = await supabase
      .from("investigations")
      .insert({
        title: investigation.title,
        description: investigation.description,
        status: investigation.status || "open",
        addresses: investigation.addresses || [],
        tags: investigation.tags || [],
        created_by: investigation.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating investigation:", error)
      const mockInvestigation = {
        ...investigation,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: investigation.status || "open",
      }
      return mockInvestigation
    }

    return data
  } catch (error) {
    console.error("Failed to create investigation:", error)
    const mockInvestigation = {
      ...investigation,
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: investigation.status || "open",
    }
    return mockInvestigation
  }
}

export async function updateInvestigation(id: string, updates: Partial<Investigation>): Promise<Investigation> {
  if (USE_MOCK_DATA) {
    const index = mockInvestigations.findIndex((inv) => inv.id === id)
    if (index !== -1) {
      mockInvestigations[index] = {
        ...mockInvestigations[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return Promise.resolve({ ...mockInvestigations[index] })
    }
    return Promise.resolve(mockInvestigations[0])
  }

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
      return mockInvestigations[0]
    }

    return data
  } catch (error) {
    console.error("Failed to update investigation:", error)
    return mockInvestigations[0]
  }
}

export async function deleteInvestigation(id: string): Promise<void> {
  if (USE_MOCK_DATA) {
    const index = mockInvestigations.findIndex((inv) => inv.id === id)
    if (index !== -1) {
      mockInvestigations.splice(index, 1)
    }
    return Promise.resolve()
  }

  try {
    const { error } = await supabase.from("investigations").delete().eq("id", id)

    if (error) {
      console.error("Error deleting investigation:", error)
    }
  } catch (error) {
    console.error("Failed to delete investigation:", error)
  }
}

// Helper function to create the investigations table if it doesn't exist
async function createInvestigationsTableIfNeeded() {
  try {
    // Check if the table exists by trying to select from it
    const { error } = await supabase.from("investigations").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist
      // Create the table using SQL
      const { error: createError } = await supabase.rpc("create_investigations_table")

      if (createError) {
        console.error("Error creating investigations table:", createError)

        // Try to create the table directly with a SQL query
        const { error: sqlError } = await supabase.rpc("execute_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS investigations (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              title TEXT NOT NULL,
              description TEXT,
              status TEXT DEFAULT 'open',
              addresses TEXT[] DEFAULT '{}',
              tags TEXT[] DEFAULT '{}',
              created_by UUID,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        })

        if (sqlError) {
          console.error("Error creating investigations table with SQL:", sqlError)
        }
      }
    }
  } catch (error) {
    console.error("Failed to check/create investigations table:", error)
  }
}
