import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import KpiCard from '../components/ui/KpiCard'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'

const BarChart = ({ data, height = 220 }) => {
  const max = Math.max(1, ...data.map((d) => d.value))
  const barW = 38
  const gap = 18
  const width = data.length * barW + (data.length - 1) * gap
  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((d, i) => {
        const h = Math.round((d.value / max) * (height - 40))
        const x = i * (barW + gap)
        const y = height - h - 20
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} rx={8} fill="#7c3aed" />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="#475569">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

const StatusChip = ({ label, value, color }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="subtitle2" sx={{ color }}>{value}</Typography>
  </Box>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [sales, setSales] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, salesRes] = await Promise.all([
          api.get('dashboard/admin/'),
          api.get('sales/'),
        ])
        setStats(dashboardRes.data)
        setSales(salesRes.data.results ?? salesRes.data)
      } catch (error) {
        setStats({})
      }
    }
    load()
  }, [])

  const summary = useMemo(() => {
    return {
      dailyProduction: stats?.daily_production ?? 1240,
      yarnStock: stats?.yarn_stock ?? 1540,
      fabricStock: stats?.fabric_stock ?? 820,
      pendingOrders: stats?.pending_orders ?? 18,
      revenue: stats?.total_revenue ?? 360000,
      efficiency: stats?.production_efficiency ?? 84,
      defectRate: stats?.defect_rate ?? 1.6,
    }
  }, [stats])

  const revenueTrend = useMemo(
    () => [
      { label: 'Jan', value: 120000 },
      { label: 'Feb', value: 138000 },
      { label: 'Mar', value: 151000 },
      { label: 'Apr', value: 163000 },
      { label: 'May', value: 184000 },
      { label: 'Jun', value: 198000 },
    ],
    []
  )

  const statusCounts = useMemo(() => {
    const counts = { ordered: 0, shipped: 0, delivered: 0, cancelled: 0 }
    sales.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status] += 1
    })
    return counts
  }, [sales])

  if (!stats) return <Box sx={{ p: 4 }}>Loading...</Box>

  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Production Control Center</Typography>
          <Typography variant="body2" color="text.secondary">Real-time textile factory overview, KPI status, and production insights.</Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={() => navigate('/admin/sales')}>Open Sales Control</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Daily Production" value={`${summary.dailyProduction} m`} subtitle="Meterage produced" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Yarn Stock" value={`${summary.yarnStock} kg`} subtitle="Available raw material" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Fabric Stock" value={`${summary.fabricStock} pcs`} subtitle="Finished inventory" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue Trend</Typography>
              <Typography variant="body2" color="text.secondary">Last 6 months</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto', minHeight: 250 }}>
              <BarChart data={revenueTrend} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Operational Health</Typography>
            <StatusChip label="Pending Orders" value={`${summary.pendingOrders}`} color="#1d4ed8" />
            <StatusChip label="Machine Utilization" value={`${summary.efficiency}%`} color="#059669" />
            <StatusChip label="Defect Rate" value={`${summary.defectRate}%`} color="#dc2626" />
            <Typography variant="body2" color="text.secondary">Factory efficiency is stable when the defect rate stays below 2%. Use the dashboard actions to resolve priority orders.</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Order Workflow</Typography>
            <LinearProgress variant="determinate" value={Math.min(100, (statusCounts.ordered + statusCounts.shipped + statusCounts.delivered) || 0)} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Use this view to prioritize sales and order fulfillment.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Order Status</Typography>
            <Typography variant="subtitle2">Ordered</Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>{statusCounts.ordered}</Typography>
            <Typography variant="subtitle2">Delivered</Typography>
            <Typography variant="h5" sx={{ color: 'success.main' }}>{statusCounts.delivered}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Backlog Priority</Typography>
            <Typography variant="body2" color="text.secondary">Focus on the highest value textile lines and dye batches.</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>{summary.fabricStock} PCS</Typography>
              <Typography variant="caption" color="text.secondary">Fabric inventory ready for dispatch</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard
