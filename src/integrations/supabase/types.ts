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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          created_at: string
          deleted_at: string | null
          end_time: number | null
          html_script: string
          id: string
          javascript_script: string
          name: string
          start_time: number | null
          updated_at: string
          user_id: string
          video_type: string
          video_url: string | null
          youtube_title: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          end_time?: number | null
          html_script: string
          id?: string
          javascript_script: string
          name: string
          start_time?: number | null
          updated_at?: string
          user_id: string
          video_type: string
          video_url?: string | null
          youtube_title?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          end_time?: number | null
          html_script?: string
          id?: string
          javascript_script?: string
          name?: string
          start_time?: number | null
          updated_at?: string
          user_id?: string
          video_type?: string
          video_url?: string | null
          youtube_title?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          button_delay: number | null
          button_enabled: boolean | null
          button_text: string | null
          button_url: string | null
          created_at: string
          headline: string
          id: string
          is_published: boolean | null
          slug: string
          sub_headline: string | null
          title: string
          updated_at: string
          user_id: string
          video_type: string
          video_url: string | null
        }
        Insert: {
          button_delay?: number | null
          button_enabled?: boolean | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          headline: string
          id?: string
          is_published?: boolean | null
          slug: string
          sub_headline?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_type?: string
          video_url?: string | null
        }
        Update: {
          button_delay?: number | null
          button_enabled?: boolean | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          headline?: string
          id?: string
          is_published?: boolean | null
          slug?: string
          sub_headline?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_type?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      sp_characters: {
        Row: {
          age: string | null
          anchor_string: string | null
          created_at: string
          gender: string | null
          hair: string | null
          id: string
          name: string
          outfit: string | null
          project_id: string | null
          skin_tone: string | null
          updated_at: string
          user_id: string
          vibe: string | null
        }
        Insert: {
          age?: string | null
          anchor_string?: string | null
          created_at?: string
          gender?: string | null
          hair?: string | null
          id?: string
          name: string
          outfit?: string | null
          project_id?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id: string
          vibe?: string | null
        }
        Update: {
          age?: string | null
          anchor_string?: string | null
          created_at?: string
          gender?: string | null
          hair?: string | null
          id?: string
          name?: string
          outfit?: string | null
          project_id?: string | null
          skin_tone?: string | null
          updated_at?: string
          user_id?: string
          vibe?: string | null
        }
        Relationships: []
      }
      sp_projects: {
        Row: {
          created_at: string
          default_character_id: string | null
          id: string
          reference_text: string | null
          source_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_character_id?: string | null
          id?: string
          reference_text?: string | null
          source_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_character_id?: string | null
          id?: string
          reference_text?: string | null
          source_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sp_segments: {
        Row: {
          character_anchor: string | null
          character_id: string | null
          character_snapshot: Json | null
          created_at: string
          emotion: string | null
          end_word: number
          id: string
          image_path: string | null
          image_url: string | null
          order_index: number
          project_id: string
          prompt: string | null
          start_word: number
          status: string
          text: string
          updated_at: string
        }
        Insert: {
          character_anchor?: string | null
          character_id?: string | null
          character_snapshot?: Json | null
          created_at?: string
          emotion?: string | null
          end_word?: number
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_index?: number
          project_id: string
          prompt?: string | null
          start_word?: number
          status?: string
          text: string
          updated_at?: string
        }
        Update: {
          character_anchor?: string | null
          character_id?: string | null
          character_snapshot?: Json | null
          created_at?: string
          emotion?: string | null
          end_word?: number
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_index?: number
          project_id?: string
          prompt?: string | null
          start_word?: number
          status?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      sp_user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_role: {
        Args: { _new_role: string; _user_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
        }
      }
      cleanup_deleted_campaigns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_sp_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
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
