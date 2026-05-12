import { lazy } from 'react'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Textiles = lazy(() => import('./pages/Textiles'))
const Orders = lazy(() => import('./pages/Orders'))
const Sales = lazy(() => import('./pages/Sales'))
const Payments = lazy(() => import('./pages/Payments'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Customers = lazy(() => import('./pages/Customers'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const Cart = lazy(() => import('./pages/Cart'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Dyes = lazy(() => import('./pages/Dyes'))
const Reports = lazy(() => import('./pages/Reports'))

const routes = {
  public: [
    { path: '/login', element: Login },
    { path: '/register', element: Register },
    { path: '/forgot-password', element: ForgotPassword },
    { path: '/reset-password', element: ResetPassword },
  ],
  customer: {
    Home: CustomerDashboard,
  },
  customerRoutes: [
    { path: '/profile', element: Profile },
    { path: '/favorites', element: Favorites },
    { path: '/cart', element: Cart },
    { path: '/my-orders', element: MyOrders },
    { path: '/checkout/:id', element: Checkout },
  ],
  adminRoutes: [
    { path: '/admin', element: AdminDashboard },
    { path: '/admin/customers', element: Customers },
    { path: '/admin/suppliers', element: Suppliers },
    { path: '/admin/textiles', element: Textiles },
    { path: '/admin/dyes', element: Dyes },
    { path: '/admin/orders', element: Orders },
    { path: '/admin/sales', element: Sales },
    { path: '/admin/payments', element: Payments },
    { path: '/admin/reports', element: Reports },
  ],
}

export default routes
