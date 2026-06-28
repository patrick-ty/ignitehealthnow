// Copied from web/lib/api/client.ts — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.
import { authClient } from '@/lib/auth/client'

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

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSource {
  source_uri: string
  source_type: string
  score: number
}

export interface ChatReply {
  reply: string
  sources: ChatSource[]
}

async function getAuthHeaders() {
  const token = await authClient.getToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  return {
    'Authorization': `Bearer ${token}`,
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

  async chat(messages: ChatMessage[]): Promise<ChatReply> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    })
    if (!response.ok) {
      throw new Error('The assistant is unavailable right now.')
    }
    return response.json()
  },
}
