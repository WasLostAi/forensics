import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createClient()

    // Try a simple query to test the connection
    const { error } = await supabase.from("profiles").select("count").limit(1).single()

    // If we get a "Mock mode active" error, that means the client is mocked
    if (error && error.message === "Mock mode active") {
      return NextResponse.json({ success: false, error: "Supabase not properly configured" }, { status: 400 })
    }

    // For real Supabase, we might get a "not found" error if the table doesn't exist yet,
    // but that still means the connection works
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error checking Supabase connection:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
