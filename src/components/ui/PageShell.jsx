import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const PageShell = ({ title, subtitle, actions, helpText, children }) => (
  <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {actions ? <Stack direction="row" spacing={1} flexWrap="wrap">{actions}</Stack> : null}
      </Stack>
      {helpText ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {helpText}
        </Typography>
      ) : null}
    </Paper>
    {children}
  </Box>
)

export default PageShell
