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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          birth_name: string | null
          birth_place: string | null
          company_address: string | null
          company_name: string | null
          created_at: string | null
          dealership_id: string
          email: string | null
          entity_type: string
          full_name: string | null
          id: string
          id_number: string | null
          id_type: string | null
          mothers_name: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          registration_number: string | null
          representative_name: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          birth_name?: string | null
          birth_place?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string | null
          dealership_id: string
          email?: string | null
          entity_type?: string
          full_name?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          mothers_name?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          registration_number?: string | null
          representative_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          birth_name?: string | null
          birth_place?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string | null
          dealership_id?: string
          email?: string | null
          entity_type?: string
          full_name?: string | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          mothers_name?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          registration_number?: string | null
          representative_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          address: string
          company_name: string | null
          created_at: string | null
          email: string | null
          entity_type: string
          id: string
          logo_url: string | null
          name: string
          owner_birth_date: string | null
          owner_birth_name: string | null
          owner_birth_place: string | null
          owner_id_number: string | null
          owner_id_type: string | null
          owner_mothers_name: string | null
          owner_name: string | null
          owner_nationality: string | null
          phone: string | null
          registration_number: string | null
          representative_name: string | null
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          entity_type?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_birth_date?: string | null
          owner_birth_name?: string | null
          owner_birth_place?: string | null
          owner_id_number?: string | null
          owner_id_type?: string | null
          owner_mothers_name?: string | null
          owner_name?: string | null
          owner_nationality?: string | null
          phone?: string | null
          registration_number?: string | null
          representative_name?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          entity_type?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_birth_date?: string | null
          owner_birth_name?: string | null
          owner_birth_place?: string | null
          owner_id_number?: string | null
          owner_id_type?: string | null
          owner_mothers_name?: string | null
          owner_name?: string | null
          owner_nationality?: string | null
          phone?: string | null
          registration_number?: string | null
          representative_name?: string | null
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          dealership_id: string
          doc_type: string
          file_url: string | null
          generated_at: string | null
          id: string
          sale_id: string
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          dealership_id: string
          doc_type: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          sale_id: string
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          dealership_id?: string
          doc_type?: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          sale_id?: string
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          dealership_id: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          dealership_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          dealership_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          customer_id: string
          dealership_id: string
          doc_handover_date: string | null
          id: string
          mileage_at_sale: number | null
          notes: string | null
          operator_id: string | null
          operator_same_as_buyer: boolean | null
          ownership_transfer_date: string | null
          payment_date: string | null
          payment_method: string | null
          possession_date: string | null
          possession_time: string | null
          sale_price: number
          sale_price_text: string | null
          status: string | null
          trust_management: boolean | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          dealership_id: string
          doc_handover_date?: string | null
          id?: string
          mileage_at_sale?: number | null
          notes?: string | null
          operator_id?: string | null
          operator_same_as_buyer?: boolean | null
          ownership_transfer_date?: string | null
          payment_date?: string | null
          payment_method?: string | null
          possession_date?: string | null
          possession_time?: string | null
          sale_price: number
          sale_price_text?: string | null
          status?: string | null
          trust_management?: boolean | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          dealership_id?: string
          doc_handover_date?: string | null
          id?: string
          mileage_at_sale?: number | null
          notes?: string | null
          operator_id?: string | null
          operator_same_as_buyer?: boolean | null
          ownership_transfer_date?: string | null
          payment_date?: string | null
          payment_method?: string | null
          possession_date?: string | null
          possession_time?: string | null
          sale_price?: number
          sale_price_text?: string | null
          status?: string | null
          trust_management?: boolean | null
          updated_at?: string | null
          vehicle_id?: string
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
            foreignKeyName: "sales_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          sort_order: number | null
          url: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          sort_order?: number | null
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_status_log: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          vehicle_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          vehicle_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_status_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_status_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          color: string | null
          condition: string | null
          created_at: string | null
          dealership_id: string
          description: string | null
          engine_number: string | null
          fuel_type: string | null
          id: string
          license_plate: string | null
          mileage: number | null
          model: string
          notes: string | null
          purchase_price: number | null
          registration_doc_number: string | null
          selling_price: number | null
          status: string | null
          updated_at: string | null
          vehicle_log_number: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          brand: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          dealership_id: string
          description?: string | null
          engine_number?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage?: number | null
          model: string
          notes?: string | null
          purchase_price?: number | null
          registration_doc_number?: string | null
          selling_price?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_log_number?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          brand?: string
          color?: string | null
          condition?: string | null
          created_at?: string | null
          dealership_id?: string
          description?: string | null
          engine_number?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          mileage?: number | null
          model?: string
          notes?: string | null
          purchase_price?: number | null
          registration_doc_number?: string | null
          selling_price?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_log_number?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      witnesses: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string
          id: string
          id_number: string | null
          id_type: string | null
          sale_id: string
          witness_number: number
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          sale_id: string
          witness_number: number
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          id_type?: string | null
          sale_id?: string
          witness_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "witnesses_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_dealership_id: { Args: never; Returns: string }
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
