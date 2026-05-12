import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(x => x.product.id === product.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }
        return copy
      }
      return [...prev, { id: `${product.id}`, product, qty }]
    })
  }

  const updateQty = (id, qty) => {
    setItems(prev => prev.map(x => x.id === String(id) ? { ...x, qty: Math.max(1, qty) } : x))
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(x => x.id !== String(id)))
  }

  const clear = () => setItems([])

  const totalCount = useMemo(() => items.reduce((s, x) => s + (x.qty || 0), 0), [items])
  const totalPrice = useMemo(() => items.reduce((s, x) => s + Number(x.product.price) * (x.qty || 0), 0), [items])

  const value = useMemo(() => ({ items, addItem, updateQty, removeItem, clear, totalCount, totalPrice }), [items, totalCount, totalPrice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
