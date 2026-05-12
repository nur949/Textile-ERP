import React from 'react'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import { formatBDT } from '../utils/format'

const Favorites = () => {
  const { items, remove } = useFavorites()
  const { addItem } = useCart()

  const addToCart = (product) => {
    addItem(product, 1)
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Favorites</h1>

      {(!items || items.length === 0) && (
        <div className="bg-white rounded border shadow p-6 text-gray-600">No favorites yet. Click the heart on any product to add it here.</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items?.map(({ id, product }) => (
          <div key={id} className="bg-white rounded shadow flex flex-col overflow-hidden">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="h-28 w-full object-cover" />
            )}
            <div className="p-4">
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm text-gray-500 capitalize">{product.type}</div>
              <div className="mt-2">Price: {formatBDT(product.price)}</div>
            </div>
            <div className="flex gap-2 m-4 mt-auto">
              <button onClick={() => addToCart(product)} className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Add to Cart</button>
              <button onClick={() => remove(product.id)} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Favorites
