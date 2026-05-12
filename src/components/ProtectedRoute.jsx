import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowRoles && !allowRoles.includes(user.role)) return <Navigate to="/redirect" replace />

  return children
}

export default ProtectedRoute
