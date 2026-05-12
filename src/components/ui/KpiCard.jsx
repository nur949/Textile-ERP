import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const KpiCard = ({ title, value, subtitle, color = 'primary.main', onClick }) => {
  const clickable = Boolean(onClick)
  return (
    <Card
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': clickable ? { transform: 'translateY(-2px)', boxShadow: 6 } : {},
        minWidth: 220,
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
      </CardContent>
    </Card>
  )
}

export default KpiCard
