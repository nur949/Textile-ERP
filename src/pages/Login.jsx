import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Single HD textile background image (change URL if you prefer another)
  const backgroundUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1920&auto=format&fit=crop&v=tx-fixed'
  
  // Input change handler
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const username = String(form.username || '').trim()
      const password = String(form.password || '')
      const user = await login(username, password)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      const backend = err?.response?.data
      const msg = (backend && (backend.detail || backend.error || backend.message)) || err?.message || 'Invalid credentials'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-6">
            <span className="text-white text-2xl">👤</span>
          </div>
          <h1 className="sr-only">Login</h1>

          {error && (
            <div className="mb-4 text-sm text-red-100 bg-red-500/60 border border-red-300/60 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center text-white/90">🔒</span>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                className="w-full pl-11 rounded bg-white/50 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Username"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center text-white/90">🔑</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                className="w-full pl-11 rounded bg-white/50 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm text-white/90">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-rose-300/90" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="hover:underline">Forgot Password?</Link>
            </div>

            <button
              disabled={loading}
              className="mt-2 w-full py-3 rounded bg-rose-300/90 text-white font-semibold tracking-wide shadow-xl hover:bg-rose-400/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
