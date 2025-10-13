export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          amount: number | null
          buyer_address: string | null
          chain_tx_id: string | null
          created_at: string | null
          creator: string | null
          currency: string | null
          id: string
          invoice_id: string | null
          seller_address: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          buyer_address?: string | null
          chain_tx_id?: string | null
          created_at?: string | null
          creator?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string | null
          seller_address?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          buyer_address?: string | null
          chain_tx_id?: string | null
          created_at?: string | null
          creator?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string | null
          seller_address?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          line_total: number | null
          qty: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          line_total?: number | null
          qty?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          buyer_name: string | null
          created_at: string | null
          currency: string | null
          date: string | null
          discount: number | null
          id: string
          invoice_number: string | null
          owner: string | null
          parsed: Json | null
          parser_confidence: number | null
          status: string | null
          storage_path: string | null
          tax: number | null
          total_amount: number | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          buyer_name?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          discount?: number | null
          id?: string
          invoice_number?: string | null
          owner?: string | null
          parsed?: Json | null
          parser_confidence?: number | null
          status?: string | null
          storage_path?: string | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          buyer_name?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          discount?: number | null
          id?: string
          invoice_number?: string | null
          owner?: string | null
          parsed?: Json | null
          parser_confidence?: number | null
          status?: string | null
          storage_path?: string | null
          tax?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      parser_feedback: {
        Row: {
          corrected_json: Json | null
          created_at: string | null
          id: string
          invoice_id: string | null
          note: string | null
          original_json: Json | null
          user_id: string | null
        }
        Insert: {
          corrected_json?: Json | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          note?: string | null
          original_json?: Json | null
          user_id?: string | null
        }
        Update: {
          corrected_json?: Json | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          note?: string | null
          original_json?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parser_feedback_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          deals_id: string | null
          id: string
          meta: Json | null
          provider: string | null
          status: string | null
          tx_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deals_id?: string | null
          id?: string
          meta?: Json | null
          provider?: string | null
          status?: string | null
          tx_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deals_id?: string | null
          id?: string
          meta?: Json | null
          provider?: string | null
          status?: string | null
          tx_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_deals_id_fkey"
            columns: ["deals_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
