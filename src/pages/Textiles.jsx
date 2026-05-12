import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatBDT } from '../utils/format'

const emptyForm = { name: '', type: 'cotton', price: '', quantity: 0, supplier: '', description: '', image_url: '' }

const Textiles = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [textiles, setTextiles] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [rowForm, setRowForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [lowOnly, setLowOnly] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [t, s] = await Promise.all([
        api.get('textiles/'),
        api.get('suppliers/'),
      ])
      setTextiles(t.data.results ?? t.data)
      setSuppliers(s.data.results ?? s.data)
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      console.error('Failed to load textiles/suppliers:', e)
      setError(`Failed to fetch data: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Read stock=low from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const low = params.get('stock') === 'low'
    setLowOnly(low)
  }, [location.search])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    setImageFile(file || null)
    if (file) setImagePreview(URL.createObjectURL(file))
    else setImagePreview('')
  }

  // Convert selected image file to base64 data URL
  const fileToDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (user?.role !== 'admin') {
        setError('Only admins can create or update textiles.')
        return
      }

      // Build payload with optional base64 image
      let imageDataUrl = null
      if (imageFile) {
        try { imageDataUrl = await fileToDataURL(imageFile) } catch { imageDataUrl = null }
      }
      // Basic client-side validation to avoid 400s
      const priceNum = Number.parseFloat(form.price)
      if (!Number.isFinite(priceNum) || priceNum < 0.01) {
        setError('Price must be a valid number ≥ 0.01')
        return
      }
      if (!form.supplier) {
        setError('Please select a supplier')
        return
      }

      const payload = {
        name: form.name?.trim(),
        type: form.type,
        price: priceNum,
        quantity: parseInt(form.quantity || 0, 10),
        supplier: form.supplier ? parseInt(form.supplier, 10) : null,
        description: form.description?.trim() ? form.description.trim() : null,
        image_url: imageDataUrl ?? (form.image_url?.trim() ? form.image_url.trim() : null),
      }

      console.log('Submitting textile payload:', payload)

      if (editing) {
        await api.put(`textiles/${editing}/`, payload)
      } else {
        await api.post('textiles/', payload)
      }

      setForm(emptyForm)
      setImageFile(null)
      setImagePreview('')
      setEditing(null)
      load()
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      console.error('Failed to save textile:', e)
      setError(`Failed to save: ${msg}`)
    }
  }

  const onEditRow = (item) => {
    setEditingRow(item.id)
    setRowForm({ name: item.name, type: item.type, price: item.price, quantity: item.quantity, supplier: item.supplier, description: item.description || '' })
  }

  const onSaveRow = async (id) => {
    try {
      setError('')
      if (user?.role !== 'admin') {
        setError('Only admins can update textiles.')
        return
      }

      const priceNum = Number.parseFloat(rowForm.price)
      if (!Number.isFinite(priceNum) || priceNum < 0.01) {
        setError('Price must be a valid number ≥ 0.01')
        return
      }
      if (!rowForm.supplier) {
        setError('Please select a supplier')
        return
      }

      const payload = {
        name: rowForm.name?.trim(),
        type: rowForm.type,
        price: priceNum,
        quantity: parseInt(rowForm.quantity || 0, 10),
        supplier: rowForm.supplier ? parseInt(rowForm.supplier, 10) : null,
        description: rowForm.description?.trim() ? rowForm.description.trim() : null,
      }

      await api.put(`textiles/${id}/`, payload)
      setEditingRow(null)
      setRowForm({})
      load()
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message
      console.error('Failed to update textile:', e)
      setError(`Failed to update: ${msg}`)
    }
  }

  const onCancelRow = () => {
    setEditingRow(null)
    setRowForm({})
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-pink-400 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/10 to-black/10 mix-blend-overlay" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-white/95">Textiles</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search textiles..." className="rounded-full bg-white/90 px-4 py-2 pr-8 text-sm shadow border border-white/60" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={()=>setLowOnly(true)} className={`px-3 py-2 text-sm rounded ${lowOnly?'bg-rose-600 text-white':'bg-white/30 text-white/90'}`}>Low Stock</button>
            {lowOnly && (
              <button onClick={()=>{ setLowOnly(false); navigate('/admin/textiles', { replace:true }) }} className="px-3 py-2 text-sm rounded bg-white text-gray-800">Clear</button>
            )}
            <button onClick={()=>setViewMode('list')} className={`px-3 py-2 text-sm rounded ${viewMode==='list'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>List</button>
            <button onClick={()=>setViewMode('grid')} className={`px-3 py-2 text-sm rounded ${viewMode==='grid'?'bg-white text-gray-800':'bg-white/30 text-white/90'}`}>Grid</button>
            {user?.role === 'admin' && (
              <button onClick={()=>setShowForm(v=>!v)} className="px-3 py-2 text-sm rounded bg-emerald-500 text-white hover:bg-emerald-600">{showForm ? 'Close' : 'Add textile'}</button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        {showForm && user?.role === 'admin' && (
          <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur rounded-lg shadow p-3 border border-white/60 grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="border rounded px-3 py-1.5 text-sm" required />
            <select name="type" value={form.type} onChange={onChange} className="border rounded px-3 py-1.5 text-sm">
              {['cotton','silk','wool','linen','polyester','nylon','rayon','denim','other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} placeholder="Price" className="border rounded px-3 py-1.5 text-sm" required />
            <input name="quantity" type="number" value={form.quantity} onChange={onChange} placeholder="Quantity" className="border rounded px-3 py-1.5 text-sm" />
            <select name="supplier" value={form.supplier} onChange={onChange} className="border rounded px-3 py-1.5 text-sm" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="description" value={form.description} onChange={onChange} placeholder="Description" className="border rounded px-3 py-1.5 text-sm md:col-span-2" />
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Image (optional)</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm text-gray-700" />
              {imagePreview && (<img src={imagePreview} alt="Preview" className="mt-2 h-28 w-28 object-cover rounded" />)}
            </div>
            <div className="md:col-span-3">
              <button className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded hover:bg-rose-600">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={()=>{setEditing(null); setForm(emptyForm)}} className="ml-2 px-3 py-1.5 text-sm bg-gray-100 rounded border">Cancel</button>}
            </div>
          </form>
        )}

        {(() => {
          const q = query.toLowerCase().trim()
          const base = textiles.filter(x => !q || x.name?.toLowerCase().includes(q) || x.type?.toLowerCase().includes(q) || x.supplier_name?.toLowerCase().includes(q))
          const filtered = lowOnly ? base.filter(x => (x.quantity ?? 0) < 10) : base
          if (viewMode === 'list') {
            return (
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Qty</th>
                      <th className="px-4 py-2 text-left">Supplier</th>
                      {user?.role === 'admin' && <th className="px-4 py-2 text-left">Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x, idx) => (
                      <tr key={x.id} className="border-t">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">
                          {editingRow === x.id ? (
                            <input value={rowForm.name || ''} onChange={(e)=>setRowForm({...rowForm, name: e.target.value})} className="border rounded px-2 py-1 text-sm w-full" />
                          ) : (
                            <span className="font-medium">{x.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRow === x.id ? (
                            <select value={rowForm.type || ''} onChange={(e)=>setRowForm({...rowForm, type: e.target.value})} className="border rounded px-2 py-1 text-sm w-full">
                              {['cotton','silk','wool','linen','polyester','nylon','rayon','denim','other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          ) : (
                            <span className="capitalize">{x.type}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRow === x.id ? (
                            <input type="number" step="0.01" value={rowForm.price || ''} onChange={(e)=>setRowForm({...rowForm, price: e.target.value})} className="border rounded px-2 py-1 text-sm w-full" />
                          ) : (
                            <span>{formatBDT(x.price)}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRow === x.id ? (
                            <input type="number" value={rowForm.quantity || ''} onChange={(e)=>setRowForm({...rowForm, quantity: e.target.value})} className="border rounded px-2 py-1 text-sm w-full" />
                          ) : (
                            <span>{x.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {editingRow === x.id ? (
                            <select value={rowForm.supplier || ''} onChange={(e)=>setRowForm({...rowForm, supplier: e.target.value})} className="border rounded px-2 py-1 text-sm w-full">
                              <option value="">Select Supplier</option>
                              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          ) : (
                            <span>{x.supplier_name}</span>
                          )}
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {editingRow === x.id ? (
                                <>
                                  <button onClick={()=>onSaveRow(x.id)} className="px-2.5 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600">Save</button>
                                  <button onClick={onCancelRow} className="px-2.5 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600">Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={()=>onEditRow(x)} className="px-2.5 py-1 text-xs rounded bg-amber-500 text-white hover:bg-amber-600">Edit</button>
                                  <button onClick={()=>onDelete(x.id)} className="px-2.5 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No textiles found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(x => (
                <div key={x.id} className="bg-white rounded shadow border border-gray-100 overflow-hidden">
                  {x.image_url && (<img src={x.image_url} alt={x.name} className="h-40 w-full object-cover" />)}
                  <div className="p-4">
                    <div className="font-semibold">{x.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{x.type}</div>
                    <div className="mt-2">Price: {formatBDT(x.price)}</div>
                    <div className="text-sm text-gray-500">Stock: {x.quantity}</div>
                    <div className="text-sm text-gray-500">Supplier: {x.supplier_name}</div>
                    {user?.role === 'admin' && (
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>onEdit(x)} className="px-3 py-1 bg-amber-500 text-white rounded">Edit</button>
                        <button onClick={()=>onDelete(x.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    )}
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

export default Textiles
