import React, { useState } from 'react'
import { Link as RouterLink, NavLink as RouterNavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useColorMode } from '../context/ColorModeContext'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LogoutIcon from '@mui/icons-material/Logout'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import NotificationsIcon from '@mui/icons-material/Notifications'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import StorefrontIcon from '@mui/icons-material/Storefront'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import PaletteIcon from '@mui/icons-material/Palette'
import ReportIcon from '@mui/icons-material/Report'

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: <HomeIcon /> },
  { path: '/admin/customers', label: 'Customers', icon: <PeopleIcon /> },
  { path: '/admin/suppliers', label: 'Suppliers', icon: <StorefrontIcon /> },
  { path: '/admin/textiles', label: 'Textiles', icon: <InventoryIcon /> },
  { path: '/admin/dyes', label: 'Dyes', icon: <PaletteIcon /> },
  { path: '/admin/orders', label: 'Orders', icon: <LocalShippingIcon /> },
  { path: '/admin/sales', label: 'Sales', icon: <MonetizationOnIcon /> },
  { path: '/admin/payments', label: 'Payments', icon: <MonetizationOnIcon /> },
  { path: '/admin/reports', label: 'Reports', icon: <ReportIcon /> },
]

const customerLinks = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/profile', label: 'Profile', icon: <PeopleIcon /> },
  { path: '/my-orders', label: 'My Orders', icon: <LocalShippingIcon /> },
]

const Navbar = () => {
  const { user, logout } = useAuth()
  const { totalCount } = useCart() || { totalCount: 0 }
  const { count: favCount } = useFavorites() || { count: 0 }
  const { mode, compact, toggleColorMode, toggleCompactMode } = useColorMode()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = user?.role === 'admin' ? adminLinks : customerLinks

  const handleProfileOpen = (event) => setAnchorEl(event.currentTarget)
  const handleProfileClose = () => setAnchorEl(null)

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: { xs: 1, md: 1.25 }, gap: 1, flexWrap: 'wrap' }}>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)} aria-label="open sidebar" sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box component={RouterLink} to={user?.role === 'admin' ? '/admin' : '/'} sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Bangladesh Textile ERP
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterNavLink}
                to={item.path}
                color="inherit"
                sx={{ textTransform: 'none', borderRadius: 2, px: 2, py: 1, fontSize: '0.95rem' }}
                style={({ isActive }) => ({
                  fontWeight: isActive ? 700 : 500,
                  opacity: isActive ? 1 : 0.75,
                })}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search commands, orders, products..."
              size="small"
              variant="outlined"
              sx={{ width: { xs: 180, md: 320 }, bgcolor: 'background.paper', borderRadius: 2 }}
              inputProps={{ 'aria-label': 'global search' }}
            />

            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton color="inherit" onClick={toggleColorMode}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={compact ? 'Ultra compact mode' : 'Compact mode'}>
              <IconButton color="inherit" onClick={toggleCompactMode}>
                <DensityMediumIcon />
              </IconButton>
            </Tooltip>

            <Button
              onClick={handleProfileOpen}
              startIcon={<Avatar sx={{ width: 32, height: 32 }}>{user?.first_name?.[0] || user?.username?.[0] || 'U'}</Avatar>}
              sx={{ textTransform: 'none' }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ lineHeight: 1 }}>{user?.first_name || user?.username || 'Guest'}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{user?.role || 'Visitor'}</Typography>
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileClose}>
        <MenuItem component={RouterLink} to="/profile" onClick={handleProfileClose}>Profile</MenuItem>
        <MenuItem onClick={() => { handleProfileClose(); handleLogout() }}>Logout</MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260, borderRight: 1, borderColor: 'divider' } }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Textile ERP</Typography>
            <Typography variant="body2" color="text.secondary">Enterprise dashboard</Typography>
          </Box>

          <Divider />

          <List sx={{ flex: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          <Divider />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar>{user?.first_name?.[0] || user?.username?.[0] || 'U'}</Avatar>
            <Box>
              <Typography variant="subtitle2">{user?.first_name || user?.username || 'ERP User'}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role?.toUpperCase() || 'Visitor'}</Typography>
            </Box>
          </Box>

          <Button fullWidth variant="contained" color="secondary" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  )
}

export default Navbar
