import { createClient } from '@/lib/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Profile {
  user_id: string
  first_name: string | null
  last_name: string | null
  mobile: string | null
  zipcode: string | null
  birth_year: number | null
  display_name: string | null
  avatar_url: string | null
  handle: string | null
  is_complete: boolean
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  mobile?: string
  zipcode?: string
  birth_year?: number
  display_name?: string
  avatar_url?: string
}

async function getAuthHeaders() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

export const api = {
  async getProfile(): Promise<Profile> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/profile`, { headers })
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    
    return response.json()
  },
  
  async updateProfile(data: ProfileUpdate): Promise<Profile> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    
    return response.json()
  },
}
