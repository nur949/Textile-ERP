import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    if (password !== confirm) { setError("Passwords don't match"); return }
    setLoading(true)
    try {
      await api.post('auth/password-reset-direct/', { username, password })
      setMessage('Password has been reset. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (e) {
      const details = e?.response?.data?.detail || 'Reset failed.'
      const errs = Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(' ') : ''
      setError(errs ? `${details} — ${errs}` : details)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
          <p className="text-sm text-gray-600 mb-4">Enter your username and a new password.</p>
          {message && <div className="mb-3 p-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded">{message}</div>}
          {error && <div className="mb-3 p-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded">{error}</div>}
          <div className="text-xs text-gray-500 mb-2">Password must be at least 8 characters, not common, and not numeric only.</div>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Username</label>
              <input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">New Password</label>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
              <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" className="w-full border rounded px-3 py-2" required />
            </div>
            <button disabled={loading} className="w-full py-2 bg-emerald-600 text-white rounded disabled:opacity-60">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
