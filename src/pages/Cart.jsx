import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { formatBDT, formatBDDateTime } from '../utils/format'

const Cart = () => {
  const { items, updateQty, removeItem, clear, totalPrice } = useCart()
  const { user } = useAuth()
  const [method, setMethod] = useState('Online')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null) // { sales: [], payments: [] }
  const navigate = useNavigate()

  const canCheckout = useMemo(() => (items || []).length > 0 && !submitting, [items, submitting])

  // Load jsPDF once if not present (for in-page preview download)
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

  const openInvoice = ({ sales, payments, items, method, total, preview = false }) => {
    try {
      const formatINR = formatBDT
      const now = new Date()
      const custName = ((user?.first_name || '') + ' ' + (user?.last_name || '')).trim() || user?.username || '-'
      const custPhone = user?.phone || '-'

      const fileName = `invoice-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}.pdf`

      const rows = items.map((en, idx) => {
        const t = en.product; const qty = Number(en.qty||1); const lt = Number(t.price)*qty;
        return [String(idx+1), `${t.name} (${t.type})`, formatINR(t.price), String(qty), formatINR(lt)]
      })

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice</title>
        <style>
          body{font-family:Arial, sans-serif; padding:24px; color:#1f2937}
          .header{display:flex; justify-content:space-between; align-items:center; margin-bottom:16px}
          .brand{font-size:20px; font-weight:700; color:#4f46e5}
          .title{font-size:18px; font-weight:600}
          .meta{font-size:12px; color:#6b7280}
          table{width:100%; border-collapse:collapse; margin-top:12px}
          th,td{padding:8px; border-bottom:1px solid #e5e7eb; text-align:left}
          th{background:#f9fafb}
          .actions{margin-top:16px}
          .btn{display:inline-block; padding:8px 12px; border-radius:6px; border:1px solid #e5e7eb; margin-right:8px; cursor:pointer}
          .primary{background:#4f46e5; color:#fff; border-color:#4338ca}
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.29/dist/jspdf.plugin.autotable.min.js"></script>
      </head><body>
        <div class="header"><div class="brand">Shoppling</div><div class="title">Invoice</div></div>
        <div class="meta">Date: ${formatBDDateTime(now)} &nbsp; | &nbsp; Payment Method: ${method} &nbsp; | &nbsp; Status: ${method === 'Online' ? 'Paid' : 'Pending'}</div>
        <div class="meta">Customer: ${custName} &nbsp; | &nbsp; Mobile: ${custPhone}</div>
        <table><thead><tr><th style="width:48px">#</th><th>Item</th><th style="width:120px">Price</th><th style="width:80px">Qty</th><th style="width:140px">Total</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style="text-align:right; margin-top:12px; font-weight:700">Grand Total: ${formatINR(total)}</div>
        <div class="actions">
          <button class="btn" onclick="window.print()">Print</button>
          <button class="btn primary" id="downloadBtn">Download PDF</button>
        </div>
        <script>
          document.getElementById('downloadBtn').addEventListener('click', function(){
            const { jsPDF } = window.jspdf || {};
            if (!jsPDF) return;
            const doc = new jsPDF('p','pt','a4');
            const left = 40; let y = 40;
            doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('Invoice', left, y); y += 24;
            doc.setFont('helvetica','normal'); doc.setFontSize(11);
            doc.text('Date: ${formatBDDateTime(now)}', left, y); y += 16;
            doc.text('Payment Method: ${method}', left, y); y += 16;
            doc.text('Status: ${method === 'Online' ? 'Paid' : 'Pending'}', left, y); y += 16;
            doc.text('Customer: ${custName}', left, y); y += 16;
            doc.text('Mobile: ${custPhone}', left, y); y += 20;
            const head = [[ '#', 'Item', 'Price', 'Qty', 'Total' ]];
            const body = ${JSON.stringify(rows)};
            doc.autoTable({ head, body, startY: y, theme: 'grid', styles: { fontSize: 11, cellPadding: 6 }, headStyles: { fillColor: [249,250,251], textColor: [55,65,81] } });
            y = doc.lastAutoTable.finalY + 12; const right = 520;
            doc.setFont('helvetica','bold'); doc.text('Total: ${formatINR(total)}', right, y, { align: 'right' });
            doc.save('${fileName}');
          });
        </script>
      </body></html>`

      const w = window.open('', '_blank');
      if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    } catch (e) { console.error('Invoice generation failed', e) }
  }

  const previewInvoice = async () => {
    if (!items?.length) return
    // Generate a preview PDF without creating sales or payments, no popups
    try {
      const jsPDF = await ensureJsPDF()
      const formatINR = formatBDT
      const now = new Date()
      const custName = ((user?.first_name || '') + ' ' + (user?.last_name || '')).trim() || user?.username || '-'
      const custPhone = user?.phone || '-'

      const doc = new jsPDF('p','pt','a4')
      const left = 40
      let y = 40
      doc.setFont('helvetica','bold'); doc.setFontSize(18)
      doc.text('Invoice (Preview)', left, y); y += 24
      doc.setFont('helvetica','normal'); doc.setFontSize(11)
      doc.text(`Date: ${formatBDDateTime(now)}`, left, y); y += 16
      doc.text(`Payment Method: ${method}`, left, y); y += 16
      doc.text(`Status: ${method === 'Online' ? 'Paid' : 'Pending'}`, left, y); y += 16
      doc.text(`Customer: ${custName}`, left, y); y += 16
      doc.text(`Mobile: ${custPhone}`, left, y); y += 20

      const head = [[ '#', 'Item', 'Price', 'Qty', 'Total' ]]
      const body = items.map((en, idx) => {
        const t = en.product; const qty = Number(en.qty||1); const lt = Number(t.price)*qty
        return [String(idx+1), `${t.name} (${t.type})`, formatINR(t.price), String(qty), formatINR(lt)]
      })
      doc.autoTable({ head, body, startY: y, theme: 'grid', styles: { fontSize: 11, cellPadding: 6 }, headStyles: { fillColor: [249,250,251], textColor: [55,65,81] } })
      y = doc.lastAutoTable.finalY + 12
      const right = 520
      doc.setFont('helvetica','bold')
      doc.text(`Total: ${formatINR(totalPrice)}`, right, y, { align: 'right' })
      const fname = `invoice-preview-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}.pdf`
      doc.save(fname)
    } catch (e) {
      console.error('Preview invoice failed', e)
      setError('Failed to generate preview invoice. Please allow downloads/popups and try again.')
    }
  }

  const onCheckout = async () => {
    if (!items?.length) return
    setSubmitting(true)
    setError('')
    setSuccess(null)
    try {
      // Keep a snapshot for invoice re-download and success panel
      const itemsSnapshot = items.map(it => ({ ...it }))
      const sales = []
      const payments = []
      for (const entry of items) {
        const qty = Math.max(1, Number(entry.qty || 1))
        // 1) Create sale for each product
        const { data: sale } = await api.post('sales/', { textile: entry.product.id, quantity: qty })
        sales.push(sale)
        // 2) Create payment
        const { data: payment } = await api.post('payments/', { sale: sale.id, method })
        payments.push(payment)
        if (method === 'Online') {
          await api.patch(`payments/${payment.id}/`, { status: 'completed' })
        }
      }
      setSuccess({ sales, payments, items: itemsSnapshot, method, total: totalPrice })
      // Open consolidated invoice before clearing cart (auto-download on payment flow)
      openInvoice({ sales, payments, items: itemsSnapshot, method, total: totalPrice })
      clear()
    } catch (e) {
      const details = e?.response?.data ? ` Details: ${JSON.stringify(e.response.data)}` : ''
      setError(`Checkout failed.${details}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Cart</h1>

      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
      {success && (
        <div className="mb-3 rounded border border-green-200 bg-green-50 text-green-800 px-3 py-2 text-sm">
          Checkout complete. View your orders in My Orders.
        </div>
      )}

      <div className="bg-white rounded shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Qty</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map(({ id, product, qty }) => (
              <tr key={id} className="border-t">
                <td className="px-4 py-2 flex items-center gap-3">
                  {product.image_url && <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded" />}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{product.type}</div>
                  </div>
                </td>
                <td className="px-4 py-2">{formatBDT(product.price)}</td>
                <td className="px-4 py-2">
                  <input type="number" min={1} value={qty}
                    onChange={(e)=>updateQty(id, parseInt(e.target.value || '1', 10))}
                    className="w-20 border rounded px-2 py-1" />
                </td>
                <td className="px-4 py-2">{formatBDT(Number(product.price) * Number(qty || 1))}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={()=>removeItem(id)} className="px-2.5 py-1 text-xs rounded bg-red-600 text-white">Remove</button>
                </td>
              </tr>
            ))}
            {!items?.length && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>Your cart is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Payment Method</label>
          <select value={method} onChange={(e)=>setMethod(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="Online">Online</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">Total: {formatBDT(totalPrice)}</div>
          <button disabled={!canCheckout} onClick={previewInvoice} className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-60">Preview Invoice</button>
          <button disabled={!canCheckout || !!success} onClick={onCheckout} className={`px-4 py-2 text-white rounded disabled:opacity-60 ${success ? 'bg-green-600' : 'bg-indigo-600'}`}>
            {submitting ? 'Processing...' : success ? 'Paid' : 'Payment'}
          </button>
          <button disabled={!items?.length} onClick={()=>clear()} className="px-4 py-2 bg-gray-100 rounded border disabled:opacity-60">Clear</button>
          <button onClick={()=>navigate('/')} className="px-4 py-2 bg-white rounded border">Continue Shopping</button>
        </div>
      </div>

      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded p-3 flex flex-col gap-2">
          <div>Payment recorded for your items. You can download/print the invoice or go to My Orders.</div>
          <div className="flex gap-2">
            <button onClick={() => openInvoice(success)} className="px-3 py-1.5 bg-emerald-600 text-white rounded">Download Invoice</button>
            <button onClick={() => navigate('/my-orders')} className="px-3 py-1.5 bg-indigo-600 text-white rounded">Go to My Orders</button>
          </div>
          <div className="text-xs text-green-700">If your browser blocks downloads, allow downloads for this site.</div>
        </div>
      )}
    </div>
  )
}

export default Cart
