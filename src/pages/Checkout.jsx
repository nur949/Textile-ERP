import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { formatBDT, formatBDDateTime } from '../utils/format'

const Checkout = () => {
  const { id } = useParams() // textile id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [textile, setTextile] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [method, setMethod] = useState('Online')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null) // { sale, payment }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`textiles/${id}/`)
        setTextile(data)
        setQuantity(1)
      } catch (e) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const openInvoice = (sale, payment) => {
    try {
      const total = Number(textile.price) * Number(quantity)
      const now = new Date()
      const itemName = `${textile.name} (${textile.type})`
      const priceStr = formatBDT(textile.price)
      const qtyStr = String(quantity)
      const totalStr = formatBDT(total)
      const custName = ((user?.first_name || '') + ' ' + (user?.last_name || '')).trim() || user?.username || '-'
      const custPhone = user?.phone || '-'
      const invoiceHtml = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice #${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            .header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; }
            .brand { font-size: 20px; font-weight: 700; color: #4f46e5; }
            .title { font-size: 18px; font-weight: 600; }
            .meta { font-size: 12px; color:#6b7280; }
            .card { border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-top:16px; }
            table { width:100%; border-collapse: collapse; margin-top: 8px; }
            th, td { text-align:left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
            th { background:#f9fafb; color:#374151; font-weight:600; }
            .totals { margin-top: 12px; display:flex; justify-content:flex-end; }
            .totals div { min-width: 240px; }
            .row { display:flex; justify-content:space-between; margin: 4px 0; }
            .muted { color:#6b7280; }
            .bold { font-weight: 700; }
            .footer { margin-top: 24px; font-size: 12px; color:#6b7280; }
            @media print { .no-print { display:none } }
          </style>
          <!-- jsPDF & AutoTable for precise PDF generation -->
          <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.29/dist/jspdf.plugin.autotable.min.js"></script>
        </head>
        <body>
          <div id="invoice-root">
          <div class="header">
            <div class="brand">Shoppling</div>
            <div class="title">Invoice</div>
          </div>
          <div class="meta">Invoice #: ${sale.id} &nbsp; | &nbsp; Payment #: ${payment?.id || '-'} &nbsp; | &nbsp; Date: ${formatBDDateTime(now)}</div>
          <div class="card">
            <div class="row"><div class="muted">Customer</div><div>${custName}</div></div>
            <div class="row"><div class="muted">Mobile</div><div>${custPhone}</div></div>
            <div class="row"><div class="muted">Payment Method</div><div>${method}</div></div>
            <div class="row"><div class="muted">Status</div><div>${method === 'Online' ? 'Paid' : (payment?.status || 'Pending')}</div></div>
          </div>
          <div class="card">
            <table>
              <thead>
                <tr>
                  <th style="width:48px">#</th>
                  <th>Item</th>
                  <th style="width:120px">Price</th>
                  <th style="width:80px">Qty</th>
                  <th style="width:140px">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>${textile.name} (${textile.type})</td>
                  <td>${priceStr}</td>
                  <td>${quantity}</td>
                  <td>${totalStr}</td>
                </tr>
              </tbody>
            </table>
            <div class="totals">
              <div>
                <div class="row"><div class="muted">Subtotal</div><div>${formatINR(total)}</div></div>
                <div class="row"><div class="muted">Tax</div><div>${formatINR(0)}</div></div>
                <div class="row bold"><div>Total</div><div>${formatINR(total)}</div></div>
              </div>
            </div>
          </div>
          <div class="footer">Thank you for your purchase!</div>
          </div>
          <script>
            window.addEventListener('load', function(){
              try {
                const { jsPDF } = window.jspdf || {}
                if (!jsPDF || !window.jspdf || !window.jspdf.jsPDF) return
                const doc = new jsPDF('p','pt','a4')
                const left = 40
                let y = 40
                doc.setFont('helvetica','bold')
                doc.setFontSize(18)
                doc.text('Invoice #${sale.id}', left, y)
                y += 24
                doc.setFont('helvetica','normal')
                doc.setFontSize(11)
                doc.text('Date: ${formatBDDateTime(now)}', left, y)
                y += 16
                doc.text('Payment #: ${payment?.id || '-'}', left, y)
                y += 16
                doc.text('Payment Method: ${method}', left, y)
                y += 16
                doc.text('Status: ${method === 'Online' ? 'Paid' : (payment?.status || 'Pending')}', left, y)
                y += 16
                doc.text('Customer: ${custName}', left, y)
                y += 16
                doc.text('Mobile: ${custPhone}', left, y)
                y += 20

                // Items table
                const head = [[ '#', 'Item', 'Price', 'Qty', 'Total' ]]
                const body = [[ '1', '${itemName}', '${priceStr}', '${qtyStr}', '${totalStr}' ]]
                doc.autoTable({
                  head,
                  body,
                  startY: y,
                  theme: 'grid',
                  styles: { fontSize: 11, cellPadding: 6 },
                  headStyles: { fillColor: [249,250,251], textColor: [55,65,81] },
                })
                y = doc.lastAutoTable.finalY + 12

                // Totals
                const right = 520
                doc.text('Subtotal: ${formatINR(total)}', right, y, { align: 'right' })
                y += 16
                doc.text('Tax: ${formatINR(0)}', right, y, { align: 'right' })
                y += 16
                doc.setFont('helvetica','bold')
                doc.text('Total: ${formatINR(total)}', right, y, { align: 'right' })
                doc.setFont('helvetica','normal')

                // Footer
                y += 30
                doc.setFontSize(10)
                doc.text('Thank you for your purchase! — Shoppling', left, y)

                // Save and close
                doc.save('invoice-${sale.id}.pdf')
                setTimeout(() => window.close(), 300)
              } catch (e) {
                console.error('PDF gen failed', e)
              }
            })
          </script>
        </body>
        </html>`

      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(invoiceHtml)
        w.document.close()
        w.focus()
      }
    } catch (e) {
      console.error('Failed to generate invoice:', e)
    }
  }

  const openInvoicePreview = () => {
    // Lightweight preview without creating a sale; marks as Pending/Preview
    openInvoice({ id: 'preview' }, { id: '-', status: 'Pending' })
  }

  const onPay = async () => {
    if (!textile) return
    setSubmitting(true)
    setError('')
    try {
      if (quantity < 1) {
        setError('Quantity must be at least 1')
        setSubmitting(false)
        return
      }
      // 1) Create sale
      const { data: sale } = await api.post('sales/', { textile: textile.id, quantity })

      // 2) Create payment with selected method
      const { data: payment } = await api.post('payments/', { sale: sale.id, method })

      // 3) Mark payment as completed for Online method to simulate success and trigger email
      if (method === 'Online') {
        await api.patch(`payments/${payment.id}/`, { status: 'completed' })
      }

      // 4) Generate invoice window and show success actions
      openInvoice(sale, payment)
      setSuccess({ sale, payment })
      // Clear processing state after success
      setSubmitting(false)

      // Do not auto-navigate; show success panel with buttons
    } catch (e) {
      const details = e?.response?.data ? ` Details: ${JSON.stringify(e.response.data)}` : ''
      setError(`Payment failed.${details}`)
      setSubmitting(false)
    }
  }
  if (!textile) return <div className="p-6">Product not found.</div>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      <div className="bg-white rounded shadow p-4 flex gap-4">
        {textile.image_url && (
          <img src={textile.image_url} alt={textile.name} className="h-32 w-32 object-cover rounded" />
        )}
        <div className="flex-1">
          <div className="text-lg font-semibold">{textile.name}</div>
          <div className="text-sm text-gray-500 capitalize">{textile.type}</div>
          <div className="mt-1">Price: {formatBDT(textile.price)}</div>
          <div className="text-sm text-gray-500">Available: {textile.quantity}</div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={Math.max(1, textile.quantity || 1)}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
              <select value={method} onChange={(e)=>setMethod(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="Online">Online</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={openInvoicePreview}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Preview Invoice
              </button>
              <button
                onClick={onPay}
                disabled={submitting || !!success}
                className={`w-full md:w-auto px-4 py-2 text-white rounded disabled:opacity-60 ${success ? 'bg-green-600' : 'bg-indigo-600'}`}
              >
                {submitting ? 'Processing...' : success ? 'Paid' : `Pay ${formatBDT(Number(textile.price) * Number(quantity || 1))}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded p-3 flex flex-col gap-2">
          <div>Payment recorded for Order #{success.sale.id}. You can download/print the invoice or go to My Orders.</div>
          <div className="flex gap-2">
            <button onClick={() => openInvoice(success.sale, success.payment)} className="px-3 py-1.5 bg-emerald-600 text-white rounded">Download Invoice</button>
            <button onClick={() => navigate('/my-orders')} className="px-3 py-1.5 bg-indigo-600 text-white rounded">Go to My Orders</button>
          </div>
          <div className="text-xs text-green-700">If your browser blocks pop-ups, allow pop-ups for this site to open the invoice window.</div>
        </div>
      )}
    </div>
  )
}

export default Checkout
