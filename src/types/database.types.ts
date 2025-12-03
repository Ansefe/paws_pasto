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
  }
}

// Tipos de conveniencia para usar en la app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Foundation = Database['public']['Tables']['foundations']['Row']
export type Pet = Database['public']['Tables']['pets']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Adoption = Database['public']['Tables']['adoptions']['Row']

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
