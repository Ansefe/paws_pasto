// Tipos generados para la base de datos de Supabase
// Basados en el schema de HogarPeludo

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums de la base de datos
export type UserRole = 'adopter' | 'foundation' | 'admin'
export type PetSpecies = 'dog' | 'cat'
export type PetGender = 'male' | 'female'
export type PetSize = 'small' | 'medium' | 'large'
export type PetStatus = 'available' | 'in_process' | 'adopted' | 'paused'
export type AdoptionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type ApplicantType = 'foundation' | 'rescuer'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      foundations: {
        Row: {
          id: string
          profile_id: string
          foundation_name: string
          description: string | null
          logo_url: string | null
          location_city: string
          location_address: string | null
          whatsapp_number: string | null
          email: string | null
          is_verified: boolean
          verified_at: string | null
          donation_link: string | null
          instagram_url: string | null
          facebook_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          foundation_name: string
          description?: string | null
          logo_url?: string | null
          location_city: string
          location_address?: string | null
          whatsapp_number?: string | null
          email?: string | null
          is_verified?: boolean
          verified_at?: string | null
          donation_link?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          foundation_name?: string
          description?: string | null
          logo_url?: string | null
          location_city?: string
          location_address?: string | null
          whatsapp_number?: string | null
          email?: string | null
          is_verified?: boolean
          verified_at?: string | null
          donation_link?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foundations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pets: {
        Row: {
          id: string
          foundation_id: string
          name: string
          species: PetSpecies
          breed: string | null
          age_approx: string | null
          gender: PetGender
          size: PetSize
          description_story: string | null
          is_vaccinated: boolean
          is_sterilized: boolean
          is_dewormed: boolean
          good_with_kids: boolean | null
          good_with_pets: boolean | null
          special_needs: string | null
          main_photo_url: string | null
          gallery_urls: string[] | null
          status: PetStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          foundation_id: string
          name: string
          species: PetSpecies
          breed?: string | null
          age_approx?: string | null
          gender: PetGender
          size: PetSize
          description_story?: string | null
          is_vaccinated?: boolean
          is_sterilized?: boolean
          is_dewormed?: boolean
          good_with_kids?: boolean | null
          good_with_pets?: boolean | null
          special_needs?: string | null
          main_photo_url?: string | null
          gallery_urls?: string[] | null
          status?: PetStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          foundation_id?: string
          name?: string
          species?: PetSpecies
          breed?: string | null
          age_approx?: string | null
          gender?: PetGender
          size?: PetSize
          description_story?: string | null
          is_vaccinated?: boolean
          is_sterilized?: boolean
          is_dewormed?: boolean
          good_with_kids?: boolean | null
          good_with_pets?: boolean | null
          special_needs?: string | null
          main_photo_url?: string | null
          gallery_urls?: string[] | null
          status?: PetStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          profile_id: string
          pet_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          pet_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          pet_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          }
        ]
      }
      adoptions: {
        Row: {
          id: string
          pet_id: string
          adopter_id: string
          foundation_id: string
          status: AdoptionStatus
          adopter_message: string | null
          foundation_notes: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          pet_id: string
          adopter_id: string
          foundation_id: string
          status?: AdoptionStatus
          adopter_message?: string | null
          foundation_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          pet_id?: string
          adopter_id?: string
          foundation_id?: string
          status?: AdoptionStatus
          adopter_message?: string | null
          foundation_notes?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adoptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoptions_adopter_id_fkey"
            columns: ["adopter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoptions_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          }
        ]
      }
      applications: {
        Row: {
          id: string
          type: ApplicantType
          organization_name: string
          contact_name: string
          email: string
          phone: string
          city: string
          address: string | null
          description: string | null
          experience: string | null
          instagram: string | null
          facebook: string | null
          website: string | null
          references_info: string | null
          status: ApplicationStatus
          review_notes: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          type: ApplicantType
          organization_name: string
          contact_name: string
          email: string
          phone: string
          city: string
          address?: string | null
          description?: string | null
          experience?: string | null
          instagram?: string | null
          facebook?: string | null
          website?: string | null
          references_info?: string | null
          status?: ApplicationStatus
          review_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          type?: ApplicantType
          organization_name?: string
          contact_name?: string
          email?: string
          phone?: string
          city?: string
          address?: string | null
          description?: string | null
          experience?: string | null
          instagram?: string | null
          facebook?: string | null
          website?: string | null
          references_info?: string | null
          status?: ApplicationStatus
          review_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_complete: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      mark_pet_in_process: {
        Args: { pet_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: UserRole
      pet_species: PetSpecies
      pet_gender: PetGender
      pet_size: PetSize
      pet_status: PetStatus
      adoption_status: AdoptionStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia para usar en la app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Foundation = Database['public']['Tables']['foundations']['Row']
export type FoundationInsert = Database['public']['Tables']['foundations']['Insert']
export type FoundationUpdate = Database['public']['Tables']['foundations']['Update']
export type Pet = Database['public']['Tables']['pets']['Row']
export type PetInsert = Database['public']['Tables']['pets']['Insert']
export type PetUpdate = Database['public']['Tables']['pets']['Update']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Adoption = Database['public']['Tables']['adoptions']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']

// Adopción con datos relacionados (mascota, adoptante, fundación)
export type AdoptionWithRelations = Adoption & {
  pet: Pick<Pet, 'id' | 'name' | 'main_photo_url' | 'species'> | null
  adopter: Pick<Profile, 'id' | 'full_name' | 'phone'> | null
  foundation: Pick<Foundation, 'id' | 'foundation_name'> | null
}

// Tipo extendido de Pet con información de la fundación
export type PetWithFoundation = Pet & {
  foundation: Pick<Foundation, 'id' | 'foundation_name' | 'location_city' | 'whatsapp_number'>
}

// Tipo extendido de Foundation con conteo de mascotas
export type FoundationWithPetCount = Foundation & {
  pet_count: number
}

// Tipo para la configuración del sitio
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']

// Interface para la configuración completa del sitio
export interface SiteConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  email: string
  phone: string
  whatsapp: string
  address: string
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
  termsAndConditions: string
  privacyPolicy: string
}
