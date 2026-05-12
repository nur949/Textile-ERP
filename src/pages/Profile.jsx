import React, { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// Prefer updating these if your backend expects a specific endpoint/method
const PROFILE_UPDATE_ENDPOINTS = [
  { method: 'post', url: 'auth/profile/' },
  { method: 'put', url: 'auth/profile/' },
  { method: 'patch', url: 'auth/profile/' },
  { method: 'put', url: 'auth/profile/update/' },
  { method: 'post', url: 'auth/profile/update/' },
  { method: 'patch', url: 'auth/profile/update/' },
  { method: 'put', url: 'users/me/' },
  { method: 'patch', url: 'users/me/' },
]

const Profile = () => {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [userId, setUserId] = useState(null)

  const load = async () => {
    try {
      setError('')
      const { data } = await api.get('auth/profile/')
      setForm({
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
      })
      if (data?.id) setUserId(data.id)
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      setError(`Failed to load profile: ${msg}`)
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const { username, city, state, pincode, ...raw } = form // exclude non-editable or unsupported fields
      // Whitelist fields supported by backend UserSerializer
      const allowed = ['email','first_name','last_name','phone','address']
      const payload = Object.fromEntries(
        Object.entries(raw)
          .filter(([k, v]) => allowed.includes(k) && v !== undefined && v !== null && String(v).trim() !== '')
      )

      // Try multiple server patterns; stop on first success
      const attempts = [
        ...PROFILE_UPDATE_ENDPOINTS,
        ...(userId ? [
          { method: 'put', url: `auth/profile/${userId}/` },
          { method: 'patch', url: `auth/profile/${userId}/` },
          { method: 'post', url: `auth/profile/${userId}/` },
          { method: 'put', url: `users/${userId}/` },
          { method: 'patch', url: `users/${userId}/` },
        ] : []),
      ]

      let saved = false
      let lastError = null
      for (const a of attempts) {
        try {
          /* eslint-disable no-await-in-loop */
          await api[a.method](a.url, payload)
          saved = true
          break
        } catch (err) {
          lastError = err
          const status = err?.response?.status
          if (status === 405) {
            // Method Not Allowed: try next pattern
            continue
          }
          // Other errors: stop early
          break
        }
      }

      if (!saved) {
        const allow = lastError?.response?.headers?.allow
        const dataMsg = lastError?.response?.data ? JSON.stringify(lastError.response.data) : ''
        const msg = `${dataMsg}${allow ? ` | Allow: ${allow}` : ''}` || (lastError?.message || 'Unknown error')
        throw new Error(msg)
      }

      setSuccess('Profile saved successfully')
      setEditMode(false)
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      setError(`Failed to save: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-white/95">My Profile</h1>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="px-3 py-2 text-sm rounded bg-white text-gray-800">Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="px-3 py-2 text-sm rounded bg-white/30 text-white/90">Cancel</button>
              <button form="profile-form" type="submit" className="px-3 py-2 text-sm rounded bg-emerald-500 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          )}
        </div>

        {error && <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="mb-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>}

        <form id="profile-form" onSubmit={onSave} className="bg-white/90 backdrop-blur rounded-lg shadow p-4 border border-white/60 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Username</label>
            <input name="username" value={form.username} onChange={onChange} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input name="email" value={form.email} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">First name</label>
            <input name="first_name" value={form.first_name} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Last name</label>
            <input name="last_name" value={form.last_name} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            <input name="address" value={form.address} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">City</label>
            <input name="city" value={form.city} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">State</label>
            <input name="state" value={form.state} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pincode</label>
            <input name="pincode" value={form.pincode} onChange={onChange} disabled={!editMode} className="w-full border rounded px-3 py-2" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
