import React, { useEffect, useState } from 'react'
import api from '../api'

const emptyForm = { name: '', contact_email: '', phone: '', address: '' }

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('suppliers/')
      const list = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : []
      setSuppliers(list)
    } catch (e) {
      setError('Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (editing) {
        await api.put(`suppliers/${editing}/`, form)
      } else {
        await api.post('suppliers/', form)
      }
      setForm(emptyForm)
      setEditing(null)
      load()
    } catch (e) {
      const details = e?.response?.data ? ` Details: ${JSON.stringify(e.response.data)}` : ''
      setError(`Failed to save supplier.${details}`)
    }
  }

  const onEdit = (item) => {
    setEditing(item.id)
    setForm({ name: item.name, contact_email: item.contact_email, phone: item.phone, address: item.address })
  }

  const onDelete = async (id) => {
    if (confirm('Delete this supplier?')) {
      await api.delete(`suppliers/${id}/`)
      load()
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      {/* Background gradient to match new theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Suppliers</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search suppliers..."
                className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm rounded ${viewMode==='list'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>List</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm rounded ${viewMode==='grid'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>Grid</button>
            <button onClick={() => setShowForm(v=>!v)} className="px-3 py-2 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600">{showForm ? 'Close' : 'Add supplier'}</button>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-100 bg-red-500/60 border border-red-300/60 rounded px-3 py-2">{error}</div>
        )}

        {/* Form card */}
        {showForm && (
          <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur rounded-lg shadow p-3 border border-white/60 grid grid-cols-1 gap-3 mb-5 max-w-3xl">
            <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="border rounded px-3 py-1.5 text-sm" required />
            <input name="contact_email" type="email" value={form.contact_email} onChange={onChange} placeholder="Email" className="border rounded px-3 py-1.5 text-sm" required />
            <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" className="border rounded px-3 py-1.5 text-sm" />
            <input name="address" value={form.address} onChange={onChange} placeholder="Address" className="border rounded px-3 py-1.5 text-sm" />
            <div className="mt-1">
              <button className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded hover:bg-rose-600">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm) }} className="ml-2 px-3 py-1.5 text-sm bg-gray-100 rounded border">Cancel</button>}
            </div>
          </form>
        )}

        {/* Supplier list/grid */}
        {(() => {
          const filtered = suppliers.filter(s => {
            const q = query.toLowerCase().trim()
            if (!q) return true
            return (
              s.name?.toLowerCase().includes(q) ||
              s.contact_email?.toLowerCase().includes(q) ||
              s.phone?.toLowerCase().includes(q) ||
              s.address?.toLowerCase().includes(q)
            )
          })
          if (viewMode === 'list') {
            return (
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Address</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium">{s.name}</td>
                        <td className="px-4 py-2">{s.contact_email}</td>
                        <td className="px-4 py-2">{s.phone}</td>
                        <td className="px-4 py-2">{s.address}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onEdit(s)} className="px-2.5 py-1 text-xs rounded bg-amber-500 text-white hover:bg-amber-600">Edit</button>
                            <button onClick={() => onDelete(s.id)} className="px-2.5 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>No suppliers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
          // grid mode
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(s => (
                <div key={s.id} className="bg-white rounded-lg shadow border border-gray-100 p-3 text-sm">
                  <div className="font-semibold text-gray-900 text-base">{s.name}</div>
                  <div className="mt-1 text-gray-600 break-words">{s.contact_email}</div>
                  <div className="text-gray-600">{s.phone}</div>
                  <div className="text-gray-600">{s.address}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => onEdit(s)} className="px-2.5 py-1 text-xs rounded bg-amber-500 text-white hover:bg-amber-600">Edit</button>
                    <button onClick={() => onDelete(s.id)} className="px-2.5 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default Suppliers
