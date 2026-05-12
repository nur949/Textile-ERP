import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { formatBDT, formatBDDateTime } from '../utils/format'
import KpiCard from '../components/ui/KpiCard'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const statusStyles = {
  ordered: { label: 'Ordered', color: 'warning' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

const headCells = [
  { id: 'id', label: 'Sale ID', sortable: true },
  { id: 'user_name', label: 'Customer', sortable: true },
  { id: 'textile_name', label: 'Product', sortable: true },
  { id: 'quantity', label: 'Qty', sortable: true },
  { id: 'total_price', label: 'Total', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
]

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1
  if (b[orderBy] > a[orderBy]) return 1
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

const Sales = () => {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState([])
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('id')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dense, setDense] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('sales/')
        setSales(data.results ?? data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredSales = useMemo(() => {
    const searchTerm = query.toLowerCase().trim()
    return sales.filter((sale) => {
      if (filterStatus !== 'all' && sale.status !== filterStatus) return false
      if (!searchTerm) return true
      return [sale.id, sale.user_name, sale.textile_name, sale.status]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(searchTerm))
    })
  }, [sales, query, filterStatus])

  const sortedSales = useMemo(() => stableSort(filteredSales, getComparator(order, orderBy)), [filteredSales, order, orderBy])

  const pageRows = useMemo(() => {
    const start = page * rowsPerPage
    return sortedSales.slice(start, start + rowsPerPage)
  }, [sortedSales, page, rowsPerPage])

  const stats = useMemo(() => {
    const totalOrders = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_price || 0), 0)
    const averageOrder = totalOrders ? totalRevenue / totalOrders : 0
    const pending = sales.filter((sale) => sale.status === 'ordered').length
    const shipped = sales.filter((sale) => sale.status === 'shipped').length
    const delivered = sales.filter((sale) => sale.status === 'delivered').length
    return { totalOrders, totalRevenue, averageOrder, pending, shipped, delivered }
  }, [sales])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(pageRows.map((n) => n.id))
      return
    }
    setSelected([])
  }

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }

    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = (id) => selected.indexOf(id) !== -1

  const handleBulkMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleBulkMenuClose = () => {
    setAnchorEl(null)
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`sales/${id}/`, { status })
      setSales((current) => current.map((sale) => (sale.id === id ? { ...sale, status } : sale)))
    } catch (err) {
      console.error(err)
    }
  }

  const applyBulkStatus = async (status) => {
    if (!selected.length) return
    handleBulkMenuClose()
    try {
      await Promise.all(selected.map((id) => api.patch(`sales/${id}/`, { status })))
      setSales((current) => current.map((sale) => (selected.includes(sale.id) ? { ...sale, status } : sale)))
      setSelected([])
    } catch (err) {
      console.error(err)
    }
  }

  const downloadCsv = () => {
    if (!filteredSales.length) return
    const rows = filteredSales.map((sale) => ({
      id: sale.id,
      customer: sale.user_name || '',
      product: sale.textile_name || '',
      quantity: sale.quantity,
      total: sale.total_price,
      status: sale.status,
      created_at: sale.created_at || '',
    }))
    const header = Object.keys(rows[0] || {}).join(',')
    const csv = [header, ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sales-export-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPdf = async () => {
    if (!filteredSales.length) return
    setExporting(true)
    try {
      const jsPDF = await ensureJsPDF()
      const now = new Date()
      const fileName = `sales-report-${now.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.pdf`
      const rows = filteredSales.map((sale) => [
        sale.id,
        sale.user_name || '-',
        sale.textile_name || '-',
        sale.quantity,
        formatBDT(Number(sale.total_price || 0)),
        sale.status,
      ])
      const doc = new jsPDF('p', 'pt', 'a4')
      doc.setFontSize(18)
      doc.text('Sales Report', 40, 40)
      doc.setFontSize(11)
      doc.text(`Generated by ${user?.username || 'Admin'} on ${formatBDDateTime(now)}`, 40, 60)
      doc.autoTable({
        startY: 80,
        head: [[ 'Sale ID', 'Customer', 'Product', 'Qty', 'Total', 'Status' ]],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [33, 37, 41], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })
      doc.save(fileName)
    } catch (err) {
      console.error(err)
      alert('Unable to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const ensureJsPDF = async () => {
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF
    await new Promise((resolve, reject) => {
      const s1 = document.createElement('script')
      s1.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
      s1.onload = resolve
      s1.onerror = reject
      document.body.appendChild(s1)
    })
    await new Promise((resolve, reject) => {
      const s2 = document.createElement('script')
      s2.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.29/dist/jspdf.plugin.autotable.min.js'
      s2.onload = resolve
      s2.onerror = reject
      document.body.appendChild(s2)
    })
    return window.jspdf.jsPDF
  }

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading sales data...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Sales Operations</Typography>
          <Typography variant="body2" color="text.secondary">Manage all sales orders, status workflows and performance metrics from one enterprise control plane.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={downloadCsv}>Export CSV</Button>
          <Button variant="outlined" onClick={exportPdf} disabled={exporting}>Export PDF</Button>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Orders" value={stats.totalOrders} subtitle="Sales order count" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Revenue" value={formatBDT(stats.totalRevenue)} subtitle="Total invoiced" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Avg. Order" value={formatBDT(stats.averageOrder)} subtitle="Average order value" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pending Orders" value={stats.pending} subtitle="Waiting fulfillment" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Search sales"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(0) }}
              size="small"
              sx={{ minWidth: 260 }}
            />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(event) => { setFilterStatus(event.target.value); setPage(0) }}
              SelectProps={{ native: true }}
              size="small"
              sx={{ width: 160 }}
            >
              <option value="all">All statuses</option>
              <option value="ordered">Ordered</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Toggle dense table">
              <IconButton size="small" onClick={() => setDense((prev) => !prev)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bulk actions">
              <IconButton size="small" onClick={handleBulkMenuOpen} disabled={!selected.length}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleBulkMenuClose}>
              <MenuItem onClick={() => applyBulkStatus('shipped')}>Mark shipped</MenuItem>
              <MenuItem onClick={() => applyBulkStatus('delivered')}>Mark delivered</MenuItem>
              <MenuItem onClick={() => applyBulkStatus('cancelled')}>Mark cancelled</MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <TableContainer>
          <Table size={dense ? 'small' : 'medium'} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < pageRows.length}
                    checked={pageRows.length > 0 && selected.length === pageRows.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all sales' }}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row) => {
                const isItemSelected = isSelected(row.id)
                return (
                  <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row.id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} onChange={(event) => handleClick(event, row.id)} />
                    </TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.user_name || '-'}</TableCell>
                    <TableCell>{row.textile_name}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{formatBDT(Number(row.total_price || 0))}</TableCell>
                    <TableCell>
                      <Chip label={statusStyles[row.status]?.label || row.status} color={statusStyles[row.status]?.color || 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => updateStatus(row.id, 'shipped')}>
                          Ship
                        </Button>
                        <Button size="small" onClick={() => updateStatus(row.id, 'delivered')}>
                          Delivered
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sortedSales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}

export default Sales
'''
path.write_text(content, encoding='utf-8')
print('written')
