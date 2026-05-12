import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import StorefrontIcon from '@mui/icons-material/Storefront'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import PaletteIcon from '@mui/icons-material/Palette'
import Badge from '@mui/material/Badge'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: <HomeIcon />, section: 'Core' },
  { path: '/admin/customers', label: 'Customers', icon: <PeopleIcon />, section: 'Core' },
  { path: '/admin/suppliers', label: 'Suppliers', icon: <StorefrontIcon />, section: 'Core' },
  { path: '/admin/textiles', label: 'Textiles', icon: <InventoryIcon />, section: 'Inventory' },
  { path: '/admin/dyes', label: 'Dyes', icon: <PaletteIcon />, section: 'Inventory' },
  { path: '/admin/orders', label: 'Orders', icon: <LocalShippingIcon />, section: 'Operations' },
  { path: '/admin/sales', label: 'Sales', icon: <MonetizationOnIcon />, section: 'Operations' },
  { path: '/admin/payments', label: 'Payments', icon: <MonetizationOnIcon />, section: 'Operations' },
]

const Sidebar = ({ open, onClose, variant = 'temporary', user }) => {
  const location = useLocation()

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 280, borderRight: 1, borderColor: 'divider' } }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', px: 2, py: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Textile ERP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise inventory & production platform
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Navigation
          </Typography>
        </Box>

        <List sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={active}
                onClick={onClose}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>
                  {active ? <Badge color="secondary" variant="dot">{item.icon}</Badge> : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle2">Branch</Typography>
          <Typography variant="body2" color="text.secondary">
            Central Mill - Zone 1
          </Typography>
        </Box>
        {user && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2">{(user.first_name || user.username) ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'ERP User'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role?.toUpperCase()}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default Sidebar
