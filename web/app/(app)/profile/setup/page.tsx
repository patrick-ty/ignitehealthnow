/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, type ProfileUpdate } from '@/lib/api/client'
import { getDefaultAvatarUrl } from '@/components/layout/AppShell'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ProfileUpdate>({
    first_name: '',
    last_name: '',
    mobile: '',
    zipcode: '',
    birth_year: undefined,
    display_name: '',
    avatar_url: '',
  })
  const [selectedAvatar, setSelectedAvatar] = useState('')

  const avatarOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => `/avatars/system/avatar-${index}.png`),
    [],
  )

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const profile = await api.getProfile()
        const matchesSystem = avatarOptions.includes(profile.avatar_url || '')
        const defaultAvatar = profile.user_id
          ? getDefaultAvatarUrl(profile.user_id)
          : '/avatars/system/avatar-0.png'
        const initialAvatar = matchesSystem ? profile.avatar_url || '' : defaultAvatar

        if (isMounted) {
          setSelectedAvatar(initialAvatar)
          setFormData((prev) => ({
            ...prev,
            avatar_url: initialAvatar,
            display_name: prev.display_name || profile.display_name || '',
            first_name: prev.first_name || profile.first_name || '',
            last_name: prev.last_name || profile.last_name || '',
            mobile: prev.mobile || profile.mobile || '',
            zipcode: prev.zipcode || profile.zipcode || '',
            birth_year: prev.birth_year ?? profile.birth_year ?? undefined,
          }))
        }
      } catch {
        const fallback = '/avatars/system/avatar-0.png'
        if (isMounted) {
          setSelectedAvatar(fallback)
          setFormData((prev) => ({ ...prev, avatar_url: fallback }))
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [avatarOptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.mobile || 
          !formData.zipcode || !formData.birth_year) {
        throw new Error('Please fill in all required fields')
      }

      const profile = await api.updateProfile({
        ...formData,
        avatar_url: selectedAvatar || formData.avatar_url,
      })

      if (!profile.is_complete) {
        setError('Profile incomplete. Please check all fields.')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="flex flex-col gap-6 rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#007ACC]/10 text-lg font-semibold text-[#007ACC]">
            IH
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#212121]">Profile setup</h2>
            <p className="mt-1 text-sm text-[#9E9E9E]">
              Complete these details to unlock your personalized dashboard.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-4 py-3 text-sm text-[#212121]">
          Required fields are marked with <span className="text-[#9E9E9E]">*</span>.
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#212121]">Personal details</h3>
              <p className="mt-1 text-sm text-[#9E9E9E]">
                Tell us a bit about you. We keep this private.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-[#9E9E9E]/40 bg-[#FFFFFF] px-4 py-3 text-sm text-[#212121]">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#212121]">Choose an avatar</h4>
                  <p className="mt-1 text-xs text-[#9E9E9E]">
                    Pick one of our system avatars. You can update this later.
                  </p>
                </div>
                {loadingProfile && (
                  <span className="text-xs text-[#9E9E9E]">Loading...</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {avatarOptions.map((avatar) => {
                  const active = selectedAvatar === avatar
                  return (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatar)
                        setFormData((prev) => ({ ...prev, avatar_url: avatar }))
                      }}
                      className={`flex items-center justify-center rounded-xl border p-2 transition ${
                        active
                          ? 'border-[#007ACC] ring-2 ring-[#007ACC]/30'
                          : 'border-[#9E9E9E]/40 hover:border-[#007ACC]/60'
                      }`}
                      aria-pressed={active}
                    >
                      <img
                        src={avatar}
                        alt="System avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[#212121]">
                  First Name <span className="text-[#9E9E9E]">*</span>
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[#212121]">
                  Last Name <span className="text-[#9E9E9E]">*</span>
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-[#212121]">
                  Mobile Phone <span className="text-[#9E9E9E]">*</span>
                </label>
                <input
                  id="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                  placeholder="555-123-4567"
                />
              </div>

              <div>
                <label htmlFor="zipcode" className="block text-sm font-medium text-[#212121]">
                  ZIP Code <span className="text-[#9E9E9E]">*</span>
                </label>
                <input
                  id="zipcode"
                  type="text"
                  required
                  value={formData.zipcode}
                  onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                  placeholder="12345"
                />
              </div>

              <div>
                <label htmlFor="birth_year" className="block text-sm font-medium text-[#212121]">
                  Birth Year <span className="text-[#9E9E9E]">*</span>
                </label>
                <select
                  id="birth_year"
                  required
                  value={formData.birth_year || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_year: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 bg-[#FFFFFF] px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="display_name" className="block text-sm font-medium text-[#212121]">
                  Display Name (optional)
                </label>
                <input
                  id="display_name"
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] shadow-sm focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
                  placeholder="Leave blank to use your handle"
                />
                <p className="mt-1 text-xs text-[#9E9E9E]">
                  This is how you&apos;ll appear in the community.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#007ACC] px-4 py-3 text-sm font-medium text-[#FFFFFF] shadow-sm transition hover:bg-[#0064A5] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/40 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-[#212121]">Profile checklist</h4>
            <p className="mt-2 text-sm text-[#9E9E9E]">
              Complete the required fields to generate your handle and finish setup.
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-[#212121]">
                <span className="h-2 w-2 rounded-full bg-[#9E9E9E]" />
                Name & contact
              </li>
              <li className="flex items-center gap-2 text-[#212121]">
                <span className="h-2 w-2 rounded-full bg-[#9E9E9E]" />
                Birth year
              </li>
              <li className="flex items-center gap-2 text-[#212121]">
                <span className="h-2 w-2 rounded-full bg-[#9E9E9E]" />
                Display name (optional)
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-6 text-sm text-[#9E9E9E] shadow-sm">
            Handles are generated automatically once your profile is complete. You can edit your
            display name later.
          </div>
        </aside>
      </div>
    </div>
  )
}
