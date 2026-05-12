import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('customers/')
      setCustomers(data.results ?? data)
    } catch (e) {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Keep hooks order stable
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return customers
    return customers.filter(c => (
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ))
  }, [customers, query])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Customers</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search customers..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={()=>setViewMode('list')} className={`px-3 py-2 text-sm rounded ${viewMode==='list'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>List</button>
            <button onClick={()=>setViewMode('grid')} className={`px-3 py-2 text-sm rounded ${viewMode==='grid'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>Grid</button>
          </div>
        </div>

        {error && (<div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>)}

        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{c.username}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-4 py-2">{c.phone || '-'}</td>
                    <td className="px-4 py-2">{new Date(c.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white rounded-lg shadow border border-gray-100 p-3 text-sm">
                <div className="font-semibold text-gray-900 text-base">{c.username}</div>
                <div className="mt-1 text-gray-600 break-words">{c.email}</div>
                <div className="text-gray-600">{[c.first_name, c.last_name].filter(Boolean).join(' ') || '-'}</div>
                <div className="text-gray-600">{c.phone || '-'}</div>
                <div className="text-gray-400 text-xs">Joined {new Date(c.date_joined).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Customers
