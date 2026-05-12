import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { ColorModeProvider } from './context/ColorModeContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import routes from './routes'

const RoleRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
}

const AppContent = () => {
  const CustomerHome = routes.customer.Home

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default', color: 'text.primary' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 } }}>
        <Suspense fallback={<Box sx={{ p: 6, textAlign: 'center', fontSize: '0.95rem', color: 'text.secondary' }}>Loading dashboard...</Box>}>
          <Routes>
            {routes.public.map(({ path, element: Element }, idx) => (
              <Route key={idx} path={path} element={<Element />} />
            ))}

            <Route
              path="/"
              element={
                <ProtectedRoute allowRoles={["customer"]}>
                  <CustomerHome />
                </ProtectedRoute>
              }
            />

          {/* Customer routes */}
          {routes.customerRoutes.map(({ path, element: Element }, idx) => (
            <Route
              key={idx}
              path={path}
              element={
                <ProtectedRoute allowRoles={["customer"]}>
                  <Element />
                </ProtectedRoute>
              }
            />
          ))}

          {/* Admin routes */}
          {routes.adminRoutes.map(({ path, element: Element }, idx) => (
            <Route
              key={idx}
              path={path}
              element={
                <ProtectedRoute allowRoles={["admin"]}>
                  <Element />
                </ProtectedRoute>
              }
            />
          ))}

          <Route path="/redirect" element={<RoleRedirect />} />

          <Route path="*" element={<Navigate to="/redirect" replace />} />
        </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  )
}

const App = () => (
  <ColorModeProvider>
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  </ColorModeProvider>
)

export default App
