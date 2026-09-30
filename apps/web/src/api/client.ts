import axios from 'axios'
import type { Experience, Itinerary, POI } from '../types'

export const api = axios.create({ baseURL: '/api', timeout: 12000 })

export async function getExperiences(params?: Record<string, string | number>) {
  const { data } = await api.get<Experience[]>('/experiences', { params })
  return data
}

export async function getPOIs() {
  const { data } = await api.get<POI[]>('/pois')
  return data
}

export async function createItinerary(payload: {
  start_at: string; end_at: string; group_size: number; budget_vnd: number
  transport_mode: string; intent_weights: Record<string, number>; locked_experience_ids: string[]
}) {
  const { data } = await api.post<Itinerary>('/itineraries/plan', payload)
  return data
}

export async function getItinerary(id: string) {
  const { data } = await api.get<Itinerary>(`/itineraries/${id}`)
  return data
}

export function apiErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { error?: { message?: string } } } }).response
    return response?.data?.error?.message ?? 'Không thể kết nối API. Hãy kiểm tra backend đang chạy.'
  }
  return 'Không thể kết nối API. Hãy kiểm tra backend đang chạy.'
}
