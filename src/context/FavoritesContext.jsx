import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const FavoritesContext = createContext(null)

export const FavoritesProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(items))
  }, [items])

  const add = (product) => {
    setItems(prev => {
      if (prev.find(x => x.id === product.id)) return prev
      return [...prev, { id: product.id, product }]
    })
  }

  const remove = (productId) => {
    setItems(prev => prev.filter(x => x.id !== productId))
  }

  const toggle = (product) => {
    setItems(prev => prev.find(x => x.id === product.id)
      ? prev.filter(x => x.id !== product.id)
      : [...prev, { id: product.id, product }])
  }

  const isFavorite = (productId) => items.some(x => x.id === productId)
  const count = items.length

  const value = useMemo(() => ({ items, add, remove, toggle, isFavorite, count }), [items, count])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => useContext(FavoritesContext)
