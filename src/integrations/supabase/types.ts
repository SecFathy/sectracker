export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bugs: {
        Row: {
          bounty_amount: number | null
          created_at: string | null
          description: string | null
          id: string
          impact_description: string | null
          poc_steps: string | null
          program_id: string | null
          remediation_suggestion: string | null
          resolution_date: string | null
          severity: Database["public"]["Enums"]["bug_severity"]
          status: Database["public"]["Enums"]["bug_status"]
          submission_date: string | null
          title: string
          updated_at: string | null
          user_id: string
          vulnerability_type: string | null
        }
        Insert: {
          bounty_amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          poc_steps?: string | null
          program_id?: string | null
          remediation_suggestion?: string | null
          resolution_date?: string | null
          severity: Database["public"]["Enums"]["bug_severity"]
          status?: Database["public"]["Enums"]["bug_status"]
          submission_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          vulnerability_type?: string | null
        }
        Update: {
          bounty_amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          poc_steps?: string | null
          program_id?: string | null
          remediation_suggestion?: string | null
          resolution_date?: string | null
          severity?: Database["public"]["Enums"]["bug_severity"]
          status?: Database["public"]["Enums"]["bug_status"]
          submission_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vulnerability_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bugs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          order_index: number | null
          text: string
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          text: string
        }
        Update: {
          checklist_id?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          order_index?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "security_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      link_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          company: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_bounty: number | null
          min_bounty: number | null
          name: string
          platform_id: string | null
          program_url: string | null
          scope: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_bounty?: number | null
          min_bounty?: number | null
          name: string
          platform_id?: string | null
          program_url?: string | null
          scope: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_bounty?: number | null
          min_bounty?: number | null
          name?: string
          platform_id?: string | null
          program_url?: string | null
          scope?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_list: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          priority: number | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          priority?: number | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          priority?: number | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      security_checklists: {
        Row: {
          checklist_type: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checklist_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checklist_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_tips: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      useful_links: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_platform_profiles: {
        Row: {
          bugs_accepted: number | null
          bugs_submitted: number | null
          created_at: string | null
          id: string
          platform_id: string | null
          profile_url: string | null
          rank_position: string | null
          reputation_points: number | null
          total_bounties_earned: number | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          bugs_accepted?: number | null
          bugs_submitted?: number | null
          created_at?: string | null
          id?: string
          platform_id?: string | null
          profile_url?: string | null
          rank_position?: string | null
          reputation_points?: number | null
          total_bounties_earned?: number | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          bugs_accepted?: number | null
          bugs_submitted?: number | null
          created_at?: string | null
          id?: string
          platform_id?: string | null
          profile_url?: string | null
          rank_position?: string | null
          reputation_points?: number | null
          total_bounties_earned?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_platform_profiles_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
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
      bug_severity: "Critical" | "High" | "Medium" | "Low" | "Informational"
      bug_status:
        | "Draft"
        | "Submitted"
        | "Triaged"
        | "Accepted"
        | "Duplicate"
        | "Not Applicable"
        | "Resolved"
        | "Bounty Awarded"
      platform_type: "bug_bounty" | "vdp" | "private" | "ctf"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bug_severity: ["Critical", "High", "Medium", "Low", "Informational"],
      bug_status: [
        "Draft",
        "Submitted",
        "Triaged",
        "Accepted",
        "Duplicate",
        "Not Applicable",
        "Resolved",
        "Bounty Awarded",
      ],
      platform_type: ["bug_bounty", "vdp", "private", "ctf"],
    },
  },
} as const
