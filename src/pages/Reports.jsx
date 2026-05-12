import React, { useMemo, useState } from 'react'
import { useNotification } from '../context/NotificationContext'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

const reportSections = {
  Production: {
    summary: [
      { metric: 'Output (m)', value: 1860 },
      { metric: 'Efficiency', value: '92%' },
      { metric: 'Machine Uptime', value: '97%' },
    ],
    details: [
      { label: 'Dye line capacity', value: '1350 m/day' },
      { label: 'Yarn consumption', value: '1240 kg' },
      { label: 'Fabric waste', value: '1.4%' },
    ],
  },
  Inventory: {
    summary: [
      { metric: 'Textiles in stock', value: 4200 },
      { metric: 'Yarn stock', value: '3.2T' },
      { metric: 'Dye inventory', value: '520 L' },
    ],
    details: [
      { label: 'Aging stock', value: '18%' },
      { label: 'Fast-moving lines', value: '28' },
      { label: 'Reorder alerts', value: '6' },
    ],
  },
  Sales: {
    summary: [
      { metric: 'Revenue', value: '৳1.24M' },
      { metric: 'Orders', value: 187 },
      { metric: 'On-time delivery', value: '94%' },
    ],
    details: [
      { label: 'Avg. order value', value: '৳6,640' },
      { label: 'Pending invoices', value: 14 },
      { label: 'Top customer', value: 'Skyline Textiles' },
    ],
  },
  Quality: {
    summary: [
      { metric: 'Pass rate', value: '98.3%' },
      { metric: 'Defects found', value: 17 },
      { metric: 'Return rate', value: '0.9%' },
    ],
    details: [
      { label: 'Critical issues', value: 2 },
      { label: 'Quality audits', value: 11 },
      { label: 'Improved lines', value: 4 },
    ],
  },
}

const Reports = () => {
  const { notify } = useNotification()
  const [activeSection, setActiveSection] = useState('Production')
  const [dateRange, setDateRange] = useState('last30')

  const report = useMemo(() => reportSections[activeSection], [activeSection])
  const dateLabel = useMemo(() => {
    if (dateRange === 'last7') return 'Last 7 days'
    if (dateRange === 'last30') return 'Last 30 days'
    return 'Year to date'
  }, [dateRange])

  const exportReport = (type) => {
    notify(`${activeSection} report exported as ${type.toUpperCase()}`, 'success')
  }

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Enterprise Reporting</Typography>
          <Typography variant="body2" color="text.secondary">Complete textile analytics, executive scorecards, stock intelligence and export tools in one governance view.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" onClick={() => exportReport('pdf')}>Export PDF</Button>
          <Button variant="outlined" onClick={() => exportReport('csv')}>Export CSV</Button>
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 3 }}>
        {Object.keys(reportSections).map((section) => (
          <Chip
            key={section}
            label={section}
            clickable
            color={section === activeSection ? 'secondary' : 'default'}
            onClick={() => setActiveSection(section)}
            sx={{ textTransform: 'none', fontWeight: section === activeSection ? 700 : 500 }}
          />
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">Date range</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant={dateRange === 'last7' ? 'contained' : 'outlined'} onClick={() => setDateRange('last7')}>Last 7 days</Button>
          <Button variant={dateRange === 'last30' ? 'contained' : 'outlined'} onClick={() => setDateRange('last30')}>Last 30 days</Button>
          <Button variant={dateRange === 'ytd' ? 'contained' : 'outlined'} onClick={() => setDateRange('ytd')}>YTD</Button>
        </Stack>
        <Typography variant="body2" color="text.secondary">{dateLabel}</Typography>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {report.summary.map((metric) => (
          <Grid item xs={12} md={4} key={metric.metric}>
            <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{metric.metric}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{metric.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{activeSection} Performance</Typography>
            <Stack spacing={2}>
              {report.details.map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Report overview</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Use this page to share board-ready summaries with executive teams across production, inventory, sales and quality.</Typography>
            <TextField
              label="Notes for stakeholders"
              multiline
              rows={4}
              fullWidth
              placeholder="Add a brief analysis or action items for the report"
            />
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => notify('Report notes saved to workspace', 'success')}>Save notes</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports
