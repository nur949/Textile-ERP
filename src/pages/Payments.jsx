import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const Payments = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await api.get('payments/')
    setPayments(data.results ?? data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`payments/${id}/`, { status })
    load()
  }

  // Compute filtered BEFORE any early return to keep hook order stable
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    const base = q
      ? payments.filter(p => (
          String(p.id).includes(q) ||
          String(p.sale_id).includes(q) ||
          p.customer_name?.toLowerCase().includes(q) ||
          p.method?.toLowerCase().includes(q) ||
          p.status?.toLowerCase().includes(q)
        ))
      : payments
    // Always sort ascending by id
    return [...base].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))
  }, [payments, query])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Payments</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search payments..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={()=>setViewMode('list')} className={`px-3 py-2 text-sm rounded ${viewMode==='list'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>List</button>
            <button onClick={()=>setViewMode('grid')} className={`px-3 py-2 text-sm rounded ${viewMode==='grid'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>Grid</button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-sm">
                  <th className="px-4 py-2">#</th>
                  {user?.role === 'admin' && <th className="px-4 py-2">Customer</th>}
                  <th className="px-4 py-2">Sale</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Status</th>
                  {user?.role === 'admin' && <th className="px-4 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.id}</td>
                    {user?.role === 'admin' && <td className="px-4 py-2">{p.customer_name || ''}</td>}
                    <td className="px-4 py-2">{p.sale_id}</td>
                    <td className="px-4 py-2">{p.method}</td>
                    <td className="px-4 py-2 capitalize">{p.status}</td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {['pending','completed','failed'].map(st => (
                            <button key={st} onClick={() => updateStatus(p.id, st)} className={`px-2.5 py-1 text-xs rounded text-white ${st==='completed'?'bg-green-600':st==='failed'?'bg-red-600':'bg-gray-600'}`}>{st}</button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded shadow border border-gray-100 p-4">
                <div className="font-semibold">Payment #{p.id}</div>
                {user?.role === 'admin' && <div className="text-sm text-gray-600">Customer: {p.customer_name || ''}</div>}
                <div className="text-sm text-gray-600">Sale: {p.sale_id}</div>
                <div className="text-sm text-gray-600">Method: {p.method}</div>
                <div className="text-sm text-gray-600 capitalize">Status: {p.status}</div>
                {user?.role === 'admin' && (
                  <div className="mt-3 flex gap-2">
                    {['pending','completed','failed'].map(st => (
                      <button key={st} onClick={() => updateStatus(p.id, st)} className={`px-2.5 py-1 text-xs rounded text-white ${st==='completed'?'bg-green-600':st==='failed'?'bg-red-600':'bg-gray-600'}`}>{st}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Payments
