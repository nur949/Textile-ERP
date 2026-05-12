import{R as M,a as R,u as E,r as a,j as t,p as v}from"./index-C_28ZubP.js";import{f as u,a as P}from"./format-DTvI6e2h.js";const Y=()=>{const{id:x}=M(),S=R(),{user:o}=E(),[s,I]=a.useState(null),[n,f]=a.useState(1),[l,D]=a.useState("Online"),[A,g]=a.useState(!0),[b,p]=a.useState(!1),[Q,c]=a.useState(""),[r,F]=a.useState(null);a.useEffect(()=>{(async()=>{g(!0),c("");try{const{data:e}=await v.get(`textiles/${x}/`);I(e),f(1)}catch{c("Failed to load product")}finally{g(!1)}})()},[x]);const h=(d,e)=>{try{const i=Number(s.price)*Number(n),y=new Date,k=`${s.name} (${s.type})`,w=u(s.price),O=String(n),j=u(i),$=(((o==null?void 0:o.first_name)||"")+" "+((o==null?void 0:o.last_name)||"")).trim()||(o==null?void 0:o.username)||"-",N=(o==null?void 0:o.phone)||"-",z=`<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice #${d.id}</title>
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
          <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"><\/script>
          <script src="https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.29/dist/jspdf.plugin.autotable.min.js"><\/script>
        </head>
        <body>
          <div id="invoice-root">
          <div class="header">
            <div class="brand">Shoppling</div>
            <div class="title">Invoice</div>
          </div>
          <div class="meta">Invoice #: ${d.id} &nbsp; | &nbsp; Payment #: ${(e==null?void 0:e.id)||"-"} &nbsp; | &nbsp; Date: ${P(y)}</div>
          <div class="card">
            <div class="row"><div class="muted">Customer</div><div>${$}</div></div>
            <div class="row"><div class="muted">Mobile</div><div>${N}</div></div>
            <div class="row"><div class="muted">Payment Method</div><div>${l}</div></div>
            <div class="row"><div class="muted">Status</div><div>${l==="Online"?"Paid":(e==null?void 0:e.status)||"Pending"}</div></div>
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
                  <td>${s.name} (${s.type})</td>
                  <td>${w}</td>
                  <td>${n}</td>
                  <td>${j}</td>
                </tr>
              </tbody>
            </table>
            <div class="totals">
              <div>
                <div class="row"><div class="muted">Subtotal</div><div>${formatINR(i)}</div></div>
                <div class="row"><div class="muted">Tax</div><div>${formatINR(0)}</div></div>
                <div class="row bold"><div>Total</div><div>${formatINR(i)}</div></div>
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
                doc.text('Invoice #${d.id}', left, y)
                y += 24
                doc.setFont('helvetica','normal')
                doc.setFontSize(11)
                doc.text('Date: ${P(y)}', left, y)
                y += 16
                doc.text('Payment #: ${(e==null?void 0:e.id)||"-"}', left, y)
                y += 16
                doc.text('Payment Method: ${l}', left, y)
                y += 16
                doc.text('Status: ${l==="Online"?"Paid":(e==null?void 0:e.status)||"Pending"}', left, y)
                y += 16
                doc.text('Customer: ${$}', left, y)
                y += 16
                doc.text('Mobile: ${N}', left, y)
                y += 20

                // Items table
                const head = [[ '#', 'Item', 'Price', 'Qty', 'Total' ]]
                const body = [[ '1', '${k}', '${w}', '${O}', '${j}' ]]
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
                doc.text('Subtotal: ${formatINR(i)}', right, y, { align: 'right' })
                y += 16
                doc.text('Tax: ${formatINR(0)}', right, y, { align: 'right' })
                y += 16
                doc.setFont('helvetica','bold')
                doc.text('Total: ${formatINR(i)}', right, y, { align: 'right' })
                doc.setFont('helvetica','normal')

                // Footer
                y += 30
                doc.setFontSize(10)
                doc.text('Thank you for your purchase! — Shoppling', left, y)

                // Save and close
                doc.save('invoice-${d.id}.pdf')
                setTimeout(() => window.close(), 300)
              } catch (e) {
                console.error('PDF gen failed', e)
              }
            })
          <\/script>
        </body>
        </html>`,m=window.open("","_blank");m&&(m.document.open(),m.document.write(z),m.document.close(),m.focus())}catch(i){console.error("Failed to generate invoice:",i)}},T=()=>{h({id:"preview"},{id:"-",status:"Pending"})},C=async()=>{var d;if(s){p(!0),c("");try{if(n<1){c("Quantity must be at least 1"),p(!1);return}const{data:e}=await v.post("sales/",{textile:s.id,quantity:n}),{data:i}=await v.post("payments/",{sale:e.id,method:l});l==="Online"&&await v.patch(`payments/${i.id}/`,{status:"completed"}),h(e,i),F({sale:e,payment:i}),p(!1)}catch(e){const i=(d=e==null?void 0:e.response)!=null&&d.data?` Details: ${JSON.stringify(e.response.data)}`:"";c(`Payment failed.${i}`),p(!1)}}};return s?t.jsxs("div",{className:"max-w-3xl mx-auto p-4",children:[t.jsx("h1",{className:"text-2xl font-semibold mb-4",children:"Checkout"}),t.jsxs("div",{className:"bg-white rounded shadow p-4 flex gap-4",children:[s.image_url&&t.jsx("img",{src:s.image_url,alt:s.name,className:"h-32 w-32 object-cover rounded"}),t.jsxs("div",{className:"flex-1",children:[t.jsx("div",{className:"text-lg font-semibold",children:s.name}),t.jsx("div",{className:"text-sm text-gray-500 capitalize",children:s.type}),t.jsxs("div",{className:"mt-1",children:["Price: ",u(s.price)]}),t.jsxs("div",{className:"text-sm text-gray-500",children:["Available: ",s.quantity]}),t.jsxs("div",{className:"mt-4 grid grid-cols-1 md:grid-cols-3 gap-4",children:[t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm text-gray-600 mb-1",children:"Quantity"}),t.jsx("input",{type:"number",min:1,max:Math.max(1,s.quantity||1),value:n,onChange:d=>f(parseInt(d.target.value||"1",10)),className:"w-full border rounded px-3 py-2"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm text-gray-600 mb-1",children:"Payment Method"}),t.jsxs("select",{value:l,onChange:d=>D(d.target.value),className:"w-full border rounded px-3 py-2",children:[t.jsx("option",{value:"Online",children:"Online"}),t.jsx("option",{value:"COD",children:"Cash on Delivery"})]})]}),t.jsxs("div",{className:"flex items-end gap-2",children:[t.jsx("button",{type:"button",onClick:T,className:"px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300",children:"Preview Invoice"}),t.jsx("button",{onClick:C,disabled:b||!!r,className:`w-full md:w-auto px-4 py-2 text-white rounded disabled:opacity-60 ${r?"bg-green-600":"bg-indigo-600"}`,children:b?"Processing...":r?"Paid":`Pay ${u(Number(s.price)*Number(n||1))}`})]})]})]})]}),r&&t.jsxs("div",{className:"mt-4 bg-green-50 border border-green-200 text-green-800 rounded p-3 flex flex-col gap-2",children:[t.jsxs("div",{children:["Payment recorded for Order #",r.sale.id,". You can download/print the invoice or go to My Orders."]}),t.jsxs("div",{className:"flex gap-2",children:[t.jsx("button",{onClick:()=>h(r.sale,r.payment),className:"px-3 py-1.5 bg-emerald-600 text-white rounded",children:"Download Invoice"}),t.jsx("button",{onClick:()=>S("/my-orders"),className:"px-3 py-1.5 bg-indigo-600 text-white rounded",children:"Go to My Orders"})]}),t.jsx("div",{className:"text-xs text-green-700",children:"If your browser blocks pop-ups, allow pop-ups for this site to open the invoice window."})]})]}):t.jsx("div",{className:"p-6",children:"Product not found."})};export{Y as default};
