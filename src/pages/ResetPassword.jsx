import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'

const ResetPassword = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
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
    const uid = params.get('uid')
    const token = params.get('token')
    if (!uid || !token) { setError('Invalid or missing reset link.'); return }
    setLoading(true)
    try {
      await api.post('auth/password-reset-confirm/', { uid, token, password })
      setMessage('Password has been reset. You can now login.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (e) {
      const details = e?.response?.data?.detail || 'Reset failed. Link may be expired.'
      setError(details)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
          {message && <div className="mb-3 p-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded">{message}</div>}
          {error && <div className="mb-3 p-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">New Password</label>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
              <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" className="w-full border rounded px-3 py-2" required />
            </div>
            <button disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-60">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
