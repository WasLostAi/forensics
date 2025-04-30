export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      entity_labels: {
        Row: {
          id: string
          address: string
          label: string
          category: string
          confidence: number
          source: string
          created_at: string
          updated_at: string
          created_by: string | null
          notes: string | null
          risk_score: number | null
          tags: string[] | null
          verified: boolean
        }
        Insert: {
          id?: string
          address: string
          label: string
          category: string
          confidence: number
          source: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          notes?: string | null
          risk_score?: number | null
          tags?: string[] | null
          verified?: boolean
        }
        Update: {
          id?: string
          address?: string
          label?: string
          category?: string
          confidence?: number
          source?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          notes?: string | null
          risk_score?: number | null
          tags?: string[] | null
          verified?: boolean
        }
      }
      transaction_flows: {
        Row: {
          id: string
          source_address: string
          destination_address: string
          amount: number
          token: string | null
          timestamp: string
          transaction_hash: string
          block_number: number | null
          notes: string | null
          risk_score: number | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          source_address: string
          destination_address: string
          amount: number
          token?: string | null
          timestamp: string
          transaction_hash: string
          block_number?: number | null
          notes?: string | null
          risk_score?: number | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          source_address?: string
          destination_address?: string
          amount?: number
          token?: string | null
          timestamp?: string
          transaction_hash?: string
          block_number?: number | null
          notes?: string | null
          risk_score?: number | null
          tags?: string[] | null
          created_at?: string
        }
      }
      investigations: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string | null
          addresses: string[] | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          addresses?: string[] | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          addresses?: string[] | null
          tags?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
