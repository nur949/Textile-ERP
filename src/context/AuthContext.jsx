import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || 'null')
        if (tokens?.access) {
          const { data } = await api.get('auth/profile/')
          setUser(data)
        }
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('auth/login/', { username, password })
    localStorage.setItem('tokens', JSON.stringify({ access: data.access, refresh: data.refresh }))
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    await api.post('auth/register/', payload)
    // Do not auto-login on register; user should login explicitly
    return true
  }

  const logout = () => {
    localStorage.removeItem('tokens')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
