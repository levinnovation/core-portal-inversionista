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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          agent: string
          content: string
          created_at: string
          id: string
          role: string
          tokens: number | null
          user_id: string
        }
        Insert: {
          agent?: string
          content: string
          created_at?: string
          id?: string
          role: string
          tokens?: number | null
          user_id: string
        }
        Update: {
          agent?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      distributions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          distribution_date: string
          id: string
          investment_id: string
          type: Database["public"]["Enums"]["distribution_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          distribution_date: string
          id?: string
          investment_id: string
          type?: Database["public"]["Enums"]["distribution_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          distribution_date?: string
          id?: string
          investment_id?: string
          type?: Database["public"]["Enums"]["distribution_type"]
        }
        Relationships: [
          {
            foreignKeyName: "distributions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          doc_type: string
          entity_id: string
          entity_type: string
          file_url: string
          id: string
          indexed_at: string | null
          name: string | null
          text_content: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: string
          entity_id: string
          entity_type: string
          file_url: string
          id?: string
          indexed_at?: string | null
          name?: string | null
          text_content?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          entity_id?: string
          entity_type?: string
          file_url?: string
          id?: string
          indexed_at?: string | null
          name?: string | null
          text_content?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string
          id: string
          investment_date: string
          investment_type: Database["public"]["Enums"]["investment_type"]
          investor_id: string
          ownership_percentage: number | null
          project_id: string
          status: string
        }
        Insert: {
          amount_invested: number
          created_at?: string
          id?: string
          investment_date: string
          investment_type?: Database["public"]["Enums"]["investment_type"]
          investor_id: string
          ownership_percentage?: number | null
          project_id: string
          status?: string
        }
        Update: {
          amount_invested?: number
          created_at?: string
          id?: string
          investment_date?: string
          investment_type?: Database["public"]["Enums"]["investment_type"]
          investor_id?: string
          ownership_percentage?: number | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          accreditation_status: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          kyc_status: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          accreditation_status?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          kyc_status?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          accreditation_status?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          kyc_status?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_date: string | null
          payment_method: string | null
          quickbase_record_id: string | null
          sale_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          quickbase_record_id?: string | null
          sale_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          quickbase_record_id?: string | null
          sale_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_phases: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          completion_percentage: number
          estimated_end: string | null
          estimated_start: string | null
          id: string
          order_index: number
          phase_name: string
          photos: string[] | null
          project_id: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number
          estimated_end?: string | null
          estimated_start?: string | null
          id?: string
          order_index?: number
          phase_name: string
          photos?: string[] | null
          project_id: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          completion_percentage?: number
          estimated_end?: string | null
          estimated_start?: string | null
          id?: string
          order_index?: number
          phase_name?: string
          photos?: string[] | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_total: number | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          estimated_delivery: string | null
          id: string
          location: string | null
          name: string
          quickbase_record_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          total_sqft: number | null
          total_units: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          budget_total?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_delivery?: string | null
          id?: string
          location?: string | null
          name: string
          quickbase_record_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_sqft?: number | null
          total_units?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          budget_total?: number | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_delivery?: string | null
          id?: string
          location?: string | null
          name?: string
          quickbase_record_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          total_sqft?: number | null
          total_units?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string
          financing_amount: number | null
          financing_bank: string | null
          id: string
          payment_plan: Json | null
          price_agreed: number
          sale_date: string
          status: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          financing_amount?: number | null
          financing_bank?: string | null
          id?: string
          payment_plan?: Json | null
          price_agreed: number
          sale_date: string
          status?: string
          unit_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          financing_amount?: number | null
          financing_bank?: string | null
          id?: string
          payment_plan?: Json | null
          price_agreed?: number
          sale_date?: string
          status?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          direction: string
          entity_type: string | null
          error_details: Json | null
          id: string
          initiated_by: string | null
          records_failed: number | null
          records_processed: number | null
          source: string
        }
        Insert: {
          created_at?: string
          direction: string
          entity_type?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          records_failed?: number | null
          records_processed?: number | null
          source: string
        }
        Update: {
          created_at?: string
          direction?: string
          entity_type?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          records_failed?: number | null
          records_processed?: number | null
          source?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          floor: number | null
          id: string
          price_total: number | null
          project_id: string
          sqft: number | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor?: number | null
          id?: string
          price_total?: number | null
          project_id: string
          sqft?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor?: number | null
          id?: string
          price_total?: number | null
          project_id?: string
          sqft?: number | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_document_chunks: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          chunk_id: string
          content: string
          document_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "investor" | "customer"
      distribution_type:
        | "preferred_return"
        | "catch_up"
        | "carried_interest"
        | "return_of_capital"
      investment_type: "equity" | "debt" | "preferred"
      payment_status: "pending" | "paid" | "overdue"
      project_status:
        | "planning"
        | "pre_construction"
        | "construction"
        | "completed"
      unit_status: "available" | "reserved" | "sold"
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
    Enums: {
      app_role: ["admin", "investor", "customer"],
      distribution_type: [
        "preferred_return",
        "catch_up",
        "carried_interest",
        "return_of_capital",
      ],
      investment_type: ["equity", "debt", "preferred"],
      payment_status: ["pending", "paid", "overdue"],
      project_status: [
        "planning",
        "pre_construction",
        "construction",
        "completed",
      ],
      unit_status: ["available", "reserved", "sold"],
    },
  },
} as const
