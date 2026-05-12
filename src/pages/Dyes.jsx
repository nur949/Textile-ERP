import React, { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { formatBDT } from '../utils/format'
import { useNavigate } from 'react-router-dom'

const emptyForm = { name: '', color_code: '#000000', dye_type: 'reactive', supplier: '', quantity: '', cost_per_kg: '', description: '' }

const Dyes = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dyes, setDyes] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [d, s] = await Promise.all([
        api.get('dyes/'),
        api.get('suppliers/'),
      ])
      setDyes(d.data.results ?? d.data)
      setSuppliers(s.data.results ?? s.data)
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      console.error('Failed to load dyes/suppliers:', e)
      setError(`Failed to fetch data: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (user?.role !== 'admin') {
        setError('Only admins can create or update dyes.')
        return
      }

      const quantityNum = Number.parseFloat(form.quantity)
      const costNum = Number.parseFloat(form.cost_per_kg)
      if (!Number.isFinite(quantityNum) || quantityNum < 0) {
        setError('Quantity must be a valid number ≥ 0')
        return
      }
      if (!Number.isFinite(costNum) || costNum < 0.01) {
        setError('Cost per kg must be a valid number ≥ 0.01')
        return
      }
      if (!form.supplier) {
        setError('Please select a supplier')
        return
      }

      const payload = {
        name: form.name?.trim(),
        color_code: form.color_code,
        dye_type: form.dye_type,
        supplier: form.supplier ? parseInt(form.supplier, 10) : null,
        quantity: quantityNum,
        cost_per_kg: costNum,
        description: form.description?.trim() ? form.description.trim() : null,
      }

      console.log('Submitting dye payload:', payload)

      if (editing) {
        await api.put(`dyes/${editing}/`, payload)
      } else {
        await api.post('dyes/', payload)
      }

      setForm(emptyForm)
      setEditing(null)
      load()
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      console.error('Failed to save dye:', e)
      setError(`Failed to save: ${msg}`)
    }
  }

  const onEdit = (item) => {
    setEditing(item.id)
    setForm({ name: item.name, color_code: item.color_code, dye_type: item.dye_type, supplier: item.supplier, quantity: item.quantity, cost_per_kg: item.cost_per_kg, description: item.description || '' })
  }

  const onDelete = async (id) => {
    if (confirm('Delete this dye?')) {
      await api.delete(`dyes/${id}/`)
      load()
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-pink-400 to-orange-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Dyes</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search dyes..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            {user?.role === 'admin' && (
              <button onClick={()=>setShowForm(v=>!v)} className="px-3 py-2 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600">{showForm ? 'Close' : 'Add dye'}</button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        {showForm && user?.role === 'admin' && (
          <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur rounded-lg shadow p-3 border border-white/60 grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="border rounded px-3 py-1.5 text-sm" required />
            <input name="color_code" type="color" value={form.color_code} onChange={onChange} className="border rounded px-3 py-1.5 text-sm h-9" required />
            <select name="dye_type" value={form.dye_type} onChange={onChange} className="border rounded px-3 py-1.5 text-sm">
              {['reactive','direct','acid','basic','disperse','vat','sulfur','pigment','other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input name="quantity" type="number" step="0.1" value={form.quantity} onChange={onChange} placeholder="Quantity (kg)" className="border rounded px-3 py-1.5 text-sm" required />
            <input name="cost_per_kg" type="number" step="0.01" value={form.cost_per_kg} onChange={onChange} placeholder="Cost per kg" className="border rounded px-3 py-1.5 text-sm" required />
            <select name="supplier" value={form.supplier} onChange={onChange} className="border rounded px-3 py-1.5 text-sm" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="description" value={form.description} onChange={onChange} placeholder="Description" className="border rounded px-3 py-1.5 text-sm md:col-span-2" />
            <div className="md:col-span-3">
              <button className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded hover:bg-rose-600">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={()=>{setEditing(null); setForm(emptyForm)}} className="ml-2 px-3 py-1.5 text-sm bg-gray-100 rounded border">Cancel</button>}
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Color</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Qty (kg)</th>
                <th className="px-4 py-2 text-left">Cost/kg</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                {user?.role === 'admin' && <th className="px-4 py-2 text-left">Action</th>}
              </tr>
            </thead>
            <tbody>
              {dyes.filter(x => !query || x.name?.toLowerCase().includes(query.toLowerCase()) || x.supplier_name?.toLowerCase().includes(query.toLowerCase())).map((x, idx) => (
                <tr key={x.id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{x.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: x.color_code }}></div>
                      {x.color_code}
                    </div>
                  </td>
                  <td className="px-4 py-2 capitalize">{x.dye_type}</td>
                  <td className="px-4 py-2">{x.quantity}</td>
                  <td className="px-4 py-2">{formatBDT(x.cost_per_kg)}</td>
                  <td className="px-4 py-2">{x.supplier_name}</td>
                  {user?.role === 'admin' && (
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>onEdit(x)} className="px-2.5 py-1 text-xs rounded bg-amber-500 text-white hover:bg-amber-600">Edit</button>
                        <button onClick={()=>onDelete(x.id)} className="px-2.5 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {dyes.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>No dyes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dyes