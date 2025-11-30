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
      ai_prompt_config: {
        Row: {
          created_at: string
          id: string
          prompt_text: string
          prompt_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_text: string
          prompt_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_text?: string
          prompt_type?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      landing_leads: {
        Row: {
          consent_given: boolean
          created_at: string
          email: string
          id: string
        }
        Insert: {
          consent_given?: boolean
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          consent_given?: boolean
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          consent_given: boolean
          created_at: string
          email: string | null
          id: string
          name: string | null
          page_id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          consent_given?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          page_id: string
          phone?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          page_id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          button_bg_color: string | null
          button_delay: number | null
          button_enabled: boolean | null
          button_text: string | null
          button_text_color: string | null
          button_url: string | null
          copyright_text: string | null
          created_at: string
          earnings_disclaimer_text: string | null
          earnings_disclaimer_url: string | null
          end_time: number | null
          fake_progress_color: string | null
          fake_progress_enabled: boolean | null
          fake_progress_thickness: number | null
          footer_enabled: boolean | null
          headline: string
          headline_color: string | null
          headline_font_size: number | null
          id: string
          is_published: boolean | null
          lead_optin_button_bg_color: string | null
          lead_optin_button_text: string | null
          lead_optin_button_text_color: string | null
          lead_optin_description: string | null
          lead_optin_email_enabled: boolean | null
          lead_optin_email_required: boolean | null
          lead_optin_enabled: boolean | null
          lead_optin_headline: string | null
          lead_optin_mandatory: boolean | null
          lead_optin_name_enabled: boolean | null
          lead_optin_name_required: boolean | null
          lead_optin_phone_enabled: boolean | null
          lead_optin_phone_required: boolean | null
          legal_disclaimer_text: string | null
          mobile_fullscreen_enabled: boolean | null
          privacy_policy_url: string | null
          slug: string
          start_time: number | null
          sub_headline: string | null
          sub_headline_color: string | null
          sub_headline_font_size: number | null
          terms_conditions_url: string | null
          text_bold: string | null
          text_highlight: string | null
          text_highlight_color: string | null
          text_italic: string | null
          text_underline: string | null
          title: string
          updated_at: string
          user_id: string
          video_type: string
          video_url: string | null
        }
        Insert: {
          button_bg_color?: string | null
          button_delay?: number | null
          button_enabled?: boolean | null
          button_text?: string | null
          button_text_color?: string | null
          button_url?: string | null
          copyright_text?: string | null
          created_at?: string
          earnings_disclaimer_text?: string | null
          earnings_disclaimer_url?: string | null
          end_time?: number | null
          fake_progress_color?: string | null
          fake_progress_enabled?: boolean | null
          fake_progress_thickness?: number | null
          footer_enabled?: boolean | null
          headline: string
          headline_color?: string | null
          headline_font_size?: number | null
          id?: string
          is_published?: boolean | null
          lead_optin_button_bg_color?: string | null
          lead_optin_button_text?: string | null
          lead_optin_button_text_color?: string | null
          lead_optin_description?: string | null
          lead_optin_email_enabled?: boolean | null
          lead_optin_email_required?: boolean | null
          lead_optin_enabled?: boolean | null
          lead_optin_headline?: string | null
          lead_optin_mandatory?: boolean | null
          lead_optin_name_enabled?: boolean | null
          lead_optin_name_required?: boolean | null
          lead_optin_phone_enabled?: boolean | null
          lead_optin_phone_required?: boolean | null
          legal_disclaimer_text?: string | null
          mobile_fullscreen_enabled?: boolean | null
          privacy_policy_url?: string | null
          slug: string
          start_time?: number | null
          sub_headline?: string | null
          sub_headline_color?: string | null
          sub_headline_font_size?: number | null
          terms_conditions_url?: string | null
          text_bold?: string | null
          text_highlight?: string | null
          text_highlight_color?: string | null
          text_italic?: string | null
          text_underline?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_type?: string
          video_url?: string | null
        }
        Update: {
          button_bg_color?: string | null
          button_delay?: number | null
          button_enabled?: boolean | null
          button_text?: string | null
          button_text_color?: string | null
          button_url?: string | null
          copyright_text?: string | null
          created_at?: string
          earnings_disclaimer_text?: string | null
          earnings_disclaimer_url?: string | null
          end_time?: number | null
          fake_progress_color?: string | null
          fake_progress_enabled?: boolean | null
          fake_progress_thickness?: number | null
          footer_enabled?: boolean | null
          headline?: string
          headline_color?: string | null
          headline_font_size?: number | null
          id?: string
          is_published?: boolean | null
          lead_optin_button_bg_color?: string | null
          lead_optin_button_text?: string | null
          lead_optin_button_text_color?: string | null
          lead_optin_description?: string | null
          lead_optin_email_enabled?: boolean | null
          lead_optin_email_required?: boolean | null
          lead_optin_enabled?: boolean | null
          lead_optin_headline?: string | null
          lead_optin_mandatory?: boolean | null
          lead_optin_name_enabled?: boolean | null
          lead_optin_name_required?: boolean | null
          lead_optin_phone_enabled?: boolean | null
          lead_optin_phone_required?: boolean | null
          legal_disclaimer_text?: string | null
          mobile_fullscreen_enabled?: boolean | null
          privacy_policy_url?: string | null
          slug?: string
          start_time?: number | null
          sub_headline?: string | null
          sub_headline_color?: string | null
          sub_headline_font_size?: number | null
          terms_conditions_url?: string | null
          text_bold?: string | null
          text_highlight?: string | null
          text_highlight_color?: string | null
          text_italic?: string | null
          text_underline?: string | null
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
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
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
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          trial_ends_at: string | null
          trial_started_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_create_campaign: {
        Args: { campaign_type: string; user_id: string }
        Returns: boolean
      }
      cleanup_deleted_campaigns: { Args: never; Returns: undefined }
      get_trial_info: {
        Args: { user_id: string }
        Returns: {
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          trial_ends_at: string
          trial_started_at: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_sp_admin: { Args: { _user_id: string }; Returns: boolean }
      is_trial_active: { Args: { user_id: string }; Returns: boolean }
      suspend_expired_trials: { Args: never; Returns: number }
    }
    Enums: {
      user_role: "TRIAL" | "UNLIMITED" | "SUSPENDED" | "admin"
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
      user_role: ["TRIAL", "UNLIMITED", "SUSPENDED", "admin"],
    },
  },
} as const
