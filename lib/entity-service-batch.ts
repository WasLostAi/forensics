import { supabase } from "./supabase"
import type { EntityLabel } from "@/types/entity"

/**
 * Batch save entity labels
 * @param labels Array of entity labels to save
 * @returns Object with success and failure counts and details
 */
export async function batchSaveEntityLabels(
  labels: Array<Omit<EntityLabel, "id" | "createdAt" | "updatedAt">>,
): Promise<{
  success: EntityLabel[]
  failed: Array<{ index: number; address: string; error: string }>
}> {
  const results = {
    success: [] as EntityLabel[],
    failed: [] as Array<{ index: number; address: string; error: string }>,
  }

  // Process in batches of 10 to avoid overwhelming the database
  const batchSize = 10
  for (let i = 0; i < labels.length; i += batchSize) {
    const batch = labels.slice(i, i + batchSize)

    // Convert to database format
    const dbBatch = batch.map((label) => ({
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
    }))

    try {
      const { data, error } = await supabase.from("entity_labels").insert(dbBatch).select()

      if (error) {
        // If batch insert fails, try individual inserts
        for (let j = 0; j < batch.length; j++) {
          const label = batch[j]
          try {
            const { data: singleData, error: singleError } = await supabase
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

            if (singleError) {
              results.failed.push({
                index: i + j,
                address: label.address,
                error: singleError.message,
              })
            } else {
              results.success.push({
                id: singleData.id,
                address: singleData.address,
                label: singleData.label,
                category: singleData.category,
                confidence: singleData.confidence,
                source: singleData.source,
                createdAt: singleData.created_at,
                updatedAt: singleData.updated_at,
                verified: singleData.verified,
                riskScore: singleData.risk_score || undefined,
                tags: singleData.tags || undefined,
                notes: singleData.notes || undefined,
                clusterIds: singleData.cluster_ids || undefined,
              })
            }
          } catch (err) {
            results.failed.push({
              index: i + j,
              address: label.address,
              error: (err as Error).message || "Unknown error",
            })
          }
        }
      } else if (data) {
        // Convert from DB format to application format
        const successLabels = data.map((item) => ({
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

        results.success.push(...successLabels)
      }
    } catch (error) {
      // If the entire batch fails, mark all as failed
      for (let j = 0; j < batch.length; j++) {
        results.failed.push({
          index: i + j,
          address: batch[j].address,
          error: (error as Error).message || "Unknown error",
        })
      }
    }

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return results
}

/**
 * Batch update entity labels
 * @param updates Array of entity label updates
 * @returns Object with success and failure counts and details
 */
export async function batchUpdateEntityLabels(updates: Array<{ id: string; updates: Partial<EntityLabel> }>): Promise<{
  success: EntityLabel[]
  failed: Array<{ index: number; id: string; error: string }>
}> {
  const results = {
    success: [] as EntityLabel[],
    failed: [] as Array<{ index: number; id: string; error: string }>,
  }

  // Process updates one by one to ensure accuracy
  for (let i = 0; i < updates.length; i++) {
    const { id, updates: labelUpdates } = updates[i]

    try {
      const { data, error } = await supabase
        .from("entity_labels")
        .update({
          label: labelUpdates.label,
          category: labelUpdates.category,
          confidence: labelUpdates.confidence,
          source: labelUpdates.source,
          updated_at: new Date().toISOString(),
          risk_score: labelUpdates.riskScore,
          tags: labelUpdates.tags,
          notes: labelUpdates.notes,
          verified: labelUpdates.verified,
          cluster_ids: labelUpdates.clusterIds,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        results.failed.push({
          index: i,
          id,
          error: error.message,
        })
      } else {
        results.success.push({
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
        })
      }
    } catch (err) {
      results.failed.push({
        index: i,
        id,
        error: (err as Error).message || "Unknown error",
      })
    }

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Batch delete entity labels
 * @param ids Array of entity label IDs to delete
 * @returns Object with success and failure counts and details
 */
export async function batchDeleteEntityLabels(ids: string[]): Promise<{
  success: string[]
  failed: Array<{ index: number; id: string; error: string }>
}> {
  const results = {
    success: [] as string[],
    failed: [] as Array<{ index: number; id: string; error: string }>,
  }

  // Process in batches of 20 to avoid overwhelming the database
  const batchSize = 20
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)

    try {
      const { error } = await supabase.from("entity_labels").delete().in("id", batch)

      if (error) {
        // If batch delete fails, try individual deletes
        for (let j = 0; j < batch.length; j++) {
          const id = batch[j]
          try {
            const { error: singleError } = await supabase.from("entity_labels").delete().eq("id", id)

            if (singleError) {
              results.failed.push({
                index: i + j,
                id,
                error: singleError.message,
              })
            } else {
              results.success.push(id)
            }
          } catch (err) {
            results.failed.push({
              index: i + j,
              id,
              error: (err as Error).message || "Unknown error",
            })
          }
        }
      } else {
        // All succeeded
        results.success.push(...batch)
      }
    } catch (error) {
      // If the entire batch fails, mark all as failed
      for (let j = 0; j < batch.length; j++) {
        results.failed.push({
          index: i + j,
          id: batch[j],
          error: (error as Error).message || "Unknown error",
        })
      }
    }

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return results
}

/**
 * Find duplicate entities based on address or similar labels
 * @returns Array of potential duplicate groups
 */
export async function findDuplicateEntities(): Promise<
  Array<{
    type: "address" | "label" | "similarity"
    entities: EntityLabel[]
  }>
> {
  const duplicates: Array<{
    type: "address" | "label" | "similarity"
    entities: EntityLabel[]
  }> = []

  try {
    // Find entities with the same address
    const { data: addressDuplicates, error: addressError } = await supabase.rpc("find_duplicate_addresses")

    if (!addressError && addressDuplicates) {
      for (const group of addressDuplicates) {
        const { data: entities, error } = await supabase.from("entity_labels").select("*").eq("address", group.address)

        if (!error && entities && entities.length > 1) {
          duplicates.push({
            type: "address",
            entities: entities.map((item) => ({
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
            })),
          })
        }
      }
    }

    // Find entities with the exact same label
    const { data: labelDuplicates, error: labelError } = await supabase.rpc("find_duplicate_labels")

    if (!labelError && labelDuplicates) {
      for (const group of labelDuplicates) {
        const { data: entities, error } = await supabase.from("entity_labels").select("*").eq("label", group.label)

        if (!error && entities && entities.length > 1) {
          duplicates.push({
            type: "label",
            entities: entities.map((item) => ({
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
            })),
          })
        }
      }
    }

    // In a real implementation, you would also find similar labels using fuzzy matching
    // This is a simplified mock implementation
  } catch (error) {
    console.error("Error finding duplicate entities:", error)
  }

  return duplicates
}
