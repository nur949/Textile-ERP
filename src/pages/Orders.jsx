import React, { useEffect, useMemo, useState } from 'react'
import { useNotification } from '../context/NotificationContext'
import api from '../api'

const Orders = () => {
  const { notify } = useNotification()
  const [orders, setOrders] = useState([])
  const [textiles, setTextiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ textile: '', quantity: 1 })
  const [viewMode, setViewMode] = useState('list')
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [o, t] = await Promise.all([
        api.get('orders/'),
        api.get('textiles/'),
      ])
      setOrders(o.data.results ?? o.data)
      setTextiles(t.data.results ?? t.data)
    } catch (e) {
      const status = e?.response?.status
      const message = status === 403
        ? 'Access denied. Inventory orders are available only to admin users.'
        : 'Failed to load orders. Please try again later.'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`orders/${id}/`, { status })
      await load()
      notify('Order status updated successfully', 'success')
    } catch (e) {
      notify('Failed to update order status', 'error')
    }
  }

  const onCreate = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      setError('')
      const payload = { textile: parseInt(form.textile, 10), quantity: parseInt(form.quantity, 10) }
      await api.post('orders/', payload)
      setForm({ textile: '', quantity: 1 })
      await load()
      notify('Order created successfully', 'success')
    } catch (e) {
      const details = e?.response?.data ? ` Details: ${JSON.stringify(e.response.data)}` : ''
      const message = `Failed to create order.${details}`
      setError(message)
      notify(message, 'error')
    } finally {
      setCreating(false)
    }
  }

  // Compute filtered BEFORE any early return to keep hook order stable
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return orders
    return orders.filter(o => (
      String(o.id).includes(q) ||
      o.textile_name?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    ))
  }, [orders, query])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Inventory Orders</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search orders..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={()=>setViewMode('list')} className={`px-3 py-2 text-sm rounded ${viewMode==='list'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>List</button>
            <button onClick={()=>setViewMode('grid')} className={`px-3 py-2 text-sm rounded ${viewMode==='grid'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>Grid</button>
            <button onClick={()=>setShowForm(v=>!v)} className="px-3 py-2 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600">{showForm?'Close':'Create order'}</button>
          </div>
        </div>

        {error && (<div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>)}

        {showForm && (
          <form onSubmit={onCreate} className="bg-white/90 backdrop-blur rounded-lg shadow p-3 border border-white/60 grid grid-cols-1 md:grid-cols-4 gap-3 mb-5 max-w-4xl">
            <select value={form.textile} onChange={(e)=>setForm({ ...form, textile: e.target.value })} className="border rounded px-3 py-1.5 text-sm" required>
              <option value="">Select Textile</option>
              {textiles.map(t => (<option key={t.id} value={t.id}>{t.name} ({t.type})</option>))}
            </select>
            <input type="number" min={1} value={form.quantity} onChange={(e)=>setForm({ ...form, quantity: e.target.value })} className="border rounded px-3 py-1.5 text-sm" placeholder="Quantity" required />
            <div className="md:col-span-2">
              <button disabled={creating} className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded disabled:opacity-60">{creating?'Creating...':'Create Order'}</button>
            </div>
          </form>
        )}

        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Textile</th>
                  <th className="px-4 py-2 text-left">Qty</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No inventory orders found.</td></tr>
                ) : (
                  filtered.map(o => (
                    <tr key={o.id} className="border-t">
                      <td className="px-4 py-2">{o.id}</td>
                      <td className="px-4 py-2">{o.textile_name}</td>
                      <td className="px-4 py-2">{o.quantity}</td>
                      <td className="px-4 py-2 capitalize">{o.status}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          {['pending','shipped','received','cancelled'].map(s => (
                            <button key={s} onClick={() => updateStatus(o.id, s)} className={`px-2.5 py-1 text-xs rounded text-white ${s==='received'?'bg-green-600':s==='shipped'?'bg-blue-600':s==='cancelled'?'bg-red-600':'bg-gray-600'}`}>{s}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(o => (
              <div key={o.id} className="bg-white rounded shadow border border-gray-100 p-4">
                <div className="font-semibold">Order #{o.id}</div>
                <div className="text-sm text-gray-600">Textile: {o.textile_name}</div>
                <div className="text-sm text-gray-600">Qty: {o.quantity}</div>
                <div className="text-sm text-gray-600 capitalize">Status: {o.status}</div>
                <div className="mt-3 flex gap-2">
                  {['pending','shipped','received','cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(o.id, s)} className={`px-2.5 py-1 text-xs rounded text-white ${s==='received'?'bg-green-600':s==='shipped'?'bg-blue-600':s==='cancelled'?'bg-red-600':'bg-gray-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
