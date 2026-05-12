import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { formatBDT, formatBDDate, formatBDDateTime } from '../utils/format'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const formatINR = formatBDT

  const statusChip = (status) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
    const map = {
      ordered: 'bg-blue-50 text-blue-700 border border-blue-200',
      shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border border-green-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200',
    }
    return <span className={`${base} ${map[status] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>{status?.charAt(0).toUpperCase()+status?.slice(1)}</span>
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('sales/my_orders/')
      setOrders(data)
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        // Not authenticated -> go to login
        navigate('/login')
        return
      }
      if (status === 403) {
        setError('Access denied. My Orders is available only for customer accounts. Please log in as a customer.')
      } else {
        setError('Failed to load orders. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Keep hooks order stable; compute filtered before early return
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return orders
    return orders.filter(o => (
      String(o.id).includes(q) ||
      o.textile_name?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    ))
  }, [orders, query])

  // Ascending order by ID
  const rows = useMemo(() => [...filtered].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)), [filtered])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-5xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">My Orders</h1>
          <div className="relative">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search my orders..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
          <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 font-medium text-gray-700">#</th>
              <th className="px-4 py-2 font-medium text-gray-700">Textile</th>
              <th className="px-4 py-2 font-medium text-gray-700">Qty</th>
              <th className="px-4 py-2 font-medium text-gray-700">Total</th>
              <th className="px-4 py-2 font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 font-medium text-gray-700">Date</th>
              <th className="px-4 py-2 font-medium text-gray-700">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">No orders found.</td>
              </tr>
            ) : (
              rows.map(o => (
                <tr key={o.id} className="hover:bg-gray-100/60">
                  <td className="px-4 py-2 text-gray-700">{o.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{o.textile_name}</td>
                  <td className="px-4 py-2 text-gray-700">{o.quantity}</td>
                  <td className="px-4 py-2 text-gray-900">{formatINR(o.total_price)}</td>
                  <td className="px-4 py-2">{statusChip(o.status)}</td>
                  <td className="px-4 py-2 text-gray-700">{formatBDDateTime(o.sale_date)}</td>
                  <td className="px-4 py-2 text-gray-700">{o.delivery_date ? formatBDDate(o.delivery_date) : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MyOrders
