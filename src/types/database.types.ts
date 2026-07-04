export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          location: string | null
          admin_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          admin_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          admin_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          full_name: string | null
          phone: string | null
          role: 'super_admin' | 'org_admin'
          theme_preference: 'light' | 'dark'
          created_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'super_admin' | 'org_admin'
          theme_preference?: 'light' | 'dark'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'super_admin' | 'org_admin'
          theme_preference?: 'light' | 'dark'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedSchema: "auth"
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedSchema: "public"
          }
        ]
      }
      students: {
        Row: {
          id: string
          organization_id: string
          name: string
          place: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          place?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          place?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedSchema: "public"
          }
        ]
      }
      attendance: {
        Row: {
          id: string
          organization_id: string
          student_id: string
          attendance_date: string
          status: 'present' | 'absent' | 'excused'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          student_id: string
          attendance_date: string
          status: 'present' | 'absent' | 'excused'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          student_id?: string
          attendance_date?: string
          status?: 'present' | 'absent' | 'excused'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedSchema: "public"
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
