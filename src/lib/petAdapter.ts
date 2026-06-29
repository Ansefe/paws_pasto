import type { PetWithFoundation } from "@/types/database.types"
import type { PetForModal } from "@/components/PetDetailModal"

// Adapta una mascota de la BD (con su fundación) al formato que espera el modal.
export function adaptPetForModal(pet: PetWithFoundation): PetForModal {
  return {
    id: pet.id,
    foundationId: pet.foundation.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed || "Mestizo",
    age_approx: pet.age_approx || "Desconocida",
    gender: pet.gender,
    size: pet.size,
    description_story: pet.description_story || "",
    main_photo_url: pet.main_photo_url || "",
    gallery_urls: pet.gallery_urls || undefined,
    status: pet.status as "available" | "in_process" | "adopted",
    is_vaccinated: pet.is_vaccinated,
    is_sterilized: pet.is_sterilized,
    is_dewormed: pet.is_dewormed,
    good_with_kids: pet.good_with_kids ?? undefined,
    good_with_pets: pet.good_with_pets ?? undefined,
    special_needs: pet.special_needs ?? undefined,
    foundation: {
      name: pet.foundation.foundation_name,
      location: pet.foundation.location_city,
      whatsapp: pet.foundation.whatsapp_number ?? undefined,
    },
  }
}
