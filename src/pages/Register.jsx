import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '', first_name: '', last_name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/login', { replace: true })
    } catch (err) {
      // Extract detailed validation errors from backend
      let msg = 'Registration failed. Check inputs.'
      const data = err?.response?.data
      if (data) {
        if (typeof data === 'string') {
          msg = data
        } else if (data.detail) {
          msg = data.detail
        } else {
          try {
            msg = Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
              .join(' | ')
          } catch (_) {
            msg = 'Registration failed.'
          }
        }
      }
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 border border-gray-200">
          <h1 className="text-2xl font-semibold text-white/95 mb-4">Register</h1>
          {error && <div className="mb-3 text-sm text-red-100 bg-red-500/60 border border-red-300/60 rounded px-3 py-2">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input name="username" value={form.username} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Username" required />
            </div>
            <div>
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Email" required />
            </div>
            <div>
              <input name="first_name" value={form.first_name} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="First Name" />
            </div>
            <div>
              <input name="last_name" value={form.last_name} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Last Name" />
            </div>
            <div>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Phone" />
            </div>
            <div>
              <input name="address" value={form.address} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Address" />
            </div>
            <div>
              <input type="password" name="password" value={form.password} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Password" required />
            </div>
            <div>
              <input type="password" name="password_confirm" value={form.password_confirm} onChange={onChange} className="w-full rounded bg-white/60 text-gray-900 placeholder-gray-600 px-3 py-2 border border-white/40" placeholder="Confirm Password" required />
            </div>
            <div className="md:col-span-2">
              <button disabled={loading} className="w-full py-3 rounded bg-rose-300/90 text-white font-semibold tracking-wide shadow-xl hover:bg-rose-400/90 transition disabled:opacity-60">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
          <p className="mt-4 text-sm text-white/90 text-center">Already have an account? <Link className="font-medium underline-offset-2 hover:underline" to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register
