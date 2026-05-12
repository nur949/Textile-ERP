// import React from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider, useAuth } from './context/AuthContext'
// import Navbar from './components/Navbar'
// import Footer from './components/Footer'
// import ProtectedRoute from './components/ProtectedRoute'
// import routes from './routes'

// const RoleRedirect = () => {
//   const { user } = useAuth()
//   if (!user) return <Navigate to="/login" replace />
//   return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
// }

// const AppContent = () => (
//   <div className="min-h-screen flex flex-col bg-gray-50">
//     <Navbar />
//     <main className="flex-1">
//       <Routes>
//         {routes.public.map(({ path, element: Element }, idx) => (
//           <Route key={idx} path={path} element={<Element />} />
//         ))}

//         <Route
//           path="/"
//           element={
//             <ProtectedRoute allowRoles={["customer"]}>
//               <routes.customer.Home />
//             </ProtectedRoute>
//           }
//         />

//         {/* Customer routes */}
//         {routes.customerRoutes.map(({ path, element: Element }, idx) => (
//           <Route
//             key={idx}
//             path={path}
//             element={
//               <ProtectedRoute allowRoles={["customer"]}>
//                 <Element />
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         {/* Admin routes */}
//         {routes.adminRoutes.map(({ path, element: Element }, idx) => (
//           <Route
//             key={idx}
//             path={path}
//             element={
//               <ProtectedRoute allowRoles={["admin"]}>
//                 <Element />
//               </ProtectedRoute>
//             }
//           />
//         ))}

//         <Route path="/redirect" element={<RoleRedirect />} />

//         <Route path="*" element={<Navigate to="/redirect" replace />} />
//       </Routes>
//     </main>
//     <Footer />
//   </div>
// )

// const App = () => (
//   <AuthProvider>
//     <AppContent />
//   </AuthProvider>
// )

// export default App


import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
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
  const CustomerHome = routes.customer.Home;   // ✅ Fix added here

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {routes.public.map(({ path, element: Element }, idx) => (
            <Route key={idx} path={path} element={<Element />} />
          ))}

          <Route
            path="/"
            element={
              <ProtectedRoute allowRoles={["customer"]}>
                <CustomerHome />   {/* ✅ Fixed here */}
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
      </main>
      <Footer />
    </div>
  )
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
