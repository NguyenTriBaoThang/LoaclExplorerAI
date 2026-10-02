export type DataMode = 'real' | 'simulated' | 'replay'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  role: 'traveler' | 'provider' | 'admin'
  provider_id: string | null
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface POI {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  category: string
  address: string
  verification_status: string
  district?: string | null
  data_mode?: DataMode
}

export interface Slot {
  id: string
  start_at: string
  end_at: string
  capacity_total: number | null
  available_reported: number | null
  status: string
  version: number
  data_mode?: DataMode
}

export interface Experience {
  id: string
  poi_id: string
  provider_id: string
  name: string
  description: string
  intent_tags: string[]
  duration_min: number
  indoor: boolean
  price_basis: string
  price_vnd: number
  verification_status: string
  poi: POI
  slots: Slot[]
  data_mode?: DataMode
}

export interface RouteLeg {
  from_experience_id: string | null
  to_experience_id: string | null
  from_label?: string | null
  to_label?: string | null
  distance_m: number
  duration_min: number
  provider: string
  is_realtime: boolean
}

export interface ItineraryStop {
  id: string
  experience_id: string
  slot_id: string
  position: number
  name: string
  category: string
  arrival_at: string
  start_at: string
  end_at: string
  duration_min: number
  cost_vnd: number
  locked: boolean
  availability_status: string
  availability_known: boolean
  poi: POI
}

export interface Itinerary {
  request_id: string
  itinerary_id: string
  data_mode: DataMode
  data_as_of: string
  feasibility_status: string
  estimated_cost_vnd: number
  total_travel_min: number
  start_at?: string
  return_deadline?: string
  estimated_return_at?: string
  stops: ItineraryStop[]
  routes: RouteLeg[]
  explanation: {
    preserved_intents: string[]
    lost_intents: string[]
    reason_codes: string[]
    evidence_refs: string[]
    uncertainty: string[]
  }
}
