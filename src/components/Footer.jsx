import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mt: 8, py: 4 }}>
    <Box sx={{ mx: 'auto', px: 3, maxWidth: 1200, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Textile E-commerce. All rights reserved.
      </Typography>
    </Box>
  </Box>
)

export default Footer
