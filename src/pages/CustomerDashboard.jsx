import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { formatBDT } from '../utils/format'

const CustomerDashboard = () => {
  const [stats, setStats] = useState(null)
  const [textiles, setTextiles] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { addItem } = useCart() || { addItem: () => {} }
  const { toggle: toggleFav, isFavorite } = useFavorites() || { toggle: ()=>{}, isFavorite: ()=>false }

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, sl] = await Promise.all([
          api.get('dashboard/customer/'),
          api.get('textiles/?in_stock=true'),
          api.get('sales/'), // current user's sales (CustomerSaleSerializer)
        ])
        setStats(s.data)
        {
          const list = t.data.results ?? t.data
          // Extra safety: only keep items with quantity > 0
          setTextiles(Array.isArray(list) ? list.filter(item => (item.quantity ?? 0) > 0) : [])
        }
        setSales(sl.data.results ?? sl.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const purchase = (textileId) => {
    setMessage('')
    navigate(`/checkout/${textileId}`)
  }

  const addToCart = (item) => {
    setMessage('')
    addItem(item, 1)
    setMessage(`${item.name} added to cart`)
    // Navigate to cart so user can see items immediately
    navigate('/cart')
  }

  // (Charts removed) We only show available textiles on this page now

  const availableTextiles = useMemo(
    () => textiles.filter(t => (t?.is_in_stock === true) || ((t?.quantity ?? 0) > 0)),
    [textiles]
  )

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Available Textiles</h1>
      {message && (
        <div className="mb-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{message}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
        {availableTextiles.map((item) => (
          <div key={item.id} className="bg-white rounded shadow flex flex-col overflow-hidden">
            <div className="relative">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="h-28 w-full object-cover" />
              )}
              <button
                title={isFavorite(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                onClick={() => toggleFav(item)}
                className={`absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center shadow ${isFavorite(item.id) ? 'bg-rose-600 text-white' : 'bg-white text-rose-600'}`}
              >
                {isFavorite(item.id) ? '❤' : '♡'}
              </button>
            </div>
            <div className="p-4">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-500 capitalize">{item.type}</div>
              <div className="mt-2">Price: {formatBDT(item.price)}</div>
              <div className="text-sm text-gray-500">Stock: {item.quantity}</div>
            </div>
            <div className="flex gap-2 m-4 mt-auto">
              <button onClick={() => addToCart(item)} className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Add to Cart</button>
              <button onClick={() => purchase(item.id)} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CustomerDashboard
