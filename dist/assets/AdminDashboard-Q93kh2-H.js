import{g as q,b as T,r as p,c as U,_ as A,d as v,e as F,j as r,s as k,f as K,h as b,i as E,k as B,l as X,m as G,n as L,a as H,B as h,T as i,o as J,P as y,p as w}from"./index-C_28ZubP.js";import{K as $}from"./KpiCard-BHJz4G9V.js";import{G as c}from"./Grid-65cBzuRw.js";function Y(e){return q("MuiLinearProgress",e)}T("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const Q=["className","color","value","valueBuffer","variant"];let g=e=>e,D,S,O,N,W,z;const _=4,V=L(D||(D=g`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`)),Z=L(S||(S=g`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`)),ee=L(O||(O=g`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`)),re=e=>{const{classes:a,variant:t,color:n}=e,x={root:["root",`color${b(n)}`,t],dashed:["dashed",`dashedColor${b(n)}`],bar1:["bar",`barColor${b(n)}`,(t==="indeterminate"||t==="query")&&"bar1Indeterminate",t==="determinate"&&"bar1Determinate",t==="buffer"&&"bar1Buffer"],bar2:["bar",t!=="buffer"&&`barColor${b(n)}`,t==="buffer"&&`color${b(n)}`,(t==="indeterminate"||t==="query")&&"bar2Indeterminate",t==="buffer"&&"bar2Buffer"]};return E(x,Y,a)},M=(e,a)=>a==="inherit"?"currentColor":e.vars?e.vars.palette.LinearProgress[`${a}Bg`]:e.palette.mode==="light"?X(e.palette[a].main,.62):G(e.palette[a].main,.5),ae=k("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(e,a)=>{const{ownerState:t}=e;return[a.root,a[`color${b(t.color)}`],a[t.variant]]}})(({ownerState:e,theme:a})=>v({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:M(a,e.color)},e.color==="inherit"&&e.variant!=="buffer"&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},e.variant==="buffer"&&{backgroundColor:"transparent"},e.variant==="query"&&{transform:"rotate(180deg)"})),te=k("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(e,a)=>{const{ownerState:t}=e;return[a.dashed,a[`dashedColor${b(t.color)}`]]}})(({ownerState:e,theme:a})=>{const t=M(a,e.color);return v({position:"absolute",marginTop:0,height:"100%",width:"100%"},e.color==="inherit"&&{opacity:.3},{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},B(N||(N=g`
    animation: ${0} 3s infinite linear;
  `),ee)),ie=k("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(e,a)=>{const{ownerState:t}=e;return[a.bar,a[`barColor${b(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&a.bar1Indeterminate,t.variant==="determinate"&&a.bar1Determinate,t.variant==="buffer"&&a.bar1Buffer]}})(({ownerState:e,theme:a})=>v({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:e.color==="inherit"?"currentColor":(a.vars||a).palette[e.color].main},e.variant==="determinate"&&{transition:`transform .${_}s linear`},e.variant==="buffer"&&{zIndex:1,transition:`transform .${_}s linear`}),({ownerState:e})=>(e.variant==="indeterminate"||e.variant==="query")&&B(W||(W=g`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),V)),ne=k("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(e,a)=>{const{ownerState:t}=e;return[a.bar,a[`barColor${b(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&a.bar2Indeterminate,t.variant==="buffer"&&a.bar2Buffer]}})(({ownerState:e,theme:a})=>v({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},e.variant!=="buffer"&&{backgroundColor:e.color==="inherit"?"currentColor":(a.vars||a).palette[e.color].main},e.color==="inherit"&&{opacity:.3},e.variant==="buffer"&&{backgroundColor:M(a,e.color),transition:`transform .${_}s linear`}),({ownerState:e})=>(e.variant==="indeterminate"||e.variant==="query")&&B(z||(z=g`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),Z)),oe=p.forwardRef(function(a,t){const n=U({props:a,name:"MuiLinearProgress"}),{className:x,color:s="primary",value:l,valueBuffer:d,variant:o="indeterminate"}=n,u=A(n,Q),f=v({},n,{color:s,variant:o}),j=re(f),I=F(),C={},P={bar1:{},bar2:{}};if((o==="determinate"||o==="buffer")&&l!==void 0){C["aria-valuenow"]=Math.round(l),C["aria-valuemin"]=0,C["aria-valuemax"]=100;let m=l-100;I&&(m=-m),P.bar1.transform=`translateX(${m}%)`}if(o==="buffer"&&d!==void 0){let m=(d||0)-100;I&&(m=-m),P.bar2.transform=`translateX(${m}%)`}return r.jsxs(ae,v({className:K(j.root,x),ownerState:f,role:"progressbar"},C,{ref:t},u,{children:[o==="buffer"?r.jsx(te,{className:j.dashed,ownerState:f}):null,r.jsx(ie,{className:j.bar1,ownerState:f,style:P.bar1}),o==="determinate"?null:r.jsx(ne,{className:j.bar2,ownerState:f,style:P.bar2})]}))}),se=({data:e,height:a=220})=>{const t=Math.max(1,...e.map(l=>l.value)),n=38,x=18,s=e.length*n+(e.length-1)*x;return r.jsx("svg",{width:s,height:a,className:"overflow-visible",children:e.map((l,d)=>{const o=Math.round(l.value/t*(a-40)),u=d*(n+x),f=a-o-20;return r.jsxs("g",{children:[r.jsx("rect",{x:u,y:f,width:n,height:o,rx:8,fill:"#7c3aed"}),r.jsx("text",{x:u+n/2,y:a-4,textAnchor:"middle",fontSize:"11",fill:"#475569",children:l.label})]},l.label)})})},R=({label:e,value:a,color:t})=>r.jsxs(h,{sx:{display:"flex",justifyContent:"space-between",gap:2,p:1.5,bgcolor:"background.default",borderRadius:2,border:1,borderColor:"divider"},children:[r.jsx(i,{variant:"body2",color:"text.secondary",children:e}),r.jsx(i,{variant:"subtitle2",sx:{color:t},children:a})]}),ue=()=>{const[e,a]=p.useState(null),[t,n]=p.useState([]),x=H();p.useEffect(()=>{(async()=>{try{const[u,f]=await Promise.all([w.get("dashboard/admin/"),w.get("sales/")]);a(u.data),n(f.data.results??f.data)}catch{a({})}})()},[]);const s=p.useMemo(()=>({dailyProduction:(e==null?void 0:e.daily_production)??1240,yarnStock:(e==null?void 0:e.yarn_stock)??1540,fabricStock:(e==null?void 0:e.fabric_stock)??820,pendingOrders:(e==null?void 0:e.pending_orders)??18,revenue:(e==null?void 0:e.total_revenue)??36e4,efficiency:(e==null?void 0:e.production_efficiency)??84,defectRate:(e==null?void 0:e.defect_rate)??1.6}),[e]),l=p.useMemo(()=>[{label:"Jan",value:12e4},{label:"Feb",value:138e3},{label:"Mar",value:151e3},{label:"Apr",value:163e3},{label:"May",value:184e3},{label:"Jun",value:198e3}],[]),d=p.useMemo(()=>{const o={ordered:0,shipped:0,delivered:0,cancelled:0};return t.forEach(u=>{o[u.status]!==void 0&&(o[u.status]+=1)}),o},[t]);return e?r.jsxs(h,{sx:{width:"100%",maxWidth:1440,mx:"auto",py:3,px:{xs:2,md:4}},children:[r.jsxs(h,{sx:{mb:3,display:"flex",flexDirection:{xs:"column",md:"row"},justifyContent:"space-between",gap:2,alignItems:"flex-start"},children:[r.jsxs(h,{children:[r.jsx(i,{variant:"h4",sx:{fontWeight:700,mb:1},children:"Production Control Center"}),r.jsx(i,{variant:"body2",color:"text.secondary",children:"Real-time textile factory overview, KPI status, and production insights."})]}),r.jsx(J,{variant:"contained",color:"secondary",onClick:()=>x("/admin/sales"),children:"Open Sales Control"})]}),r.jsxs(c,{container:!0,spacing:2,sx:{mb:2},children:[r.jsx(c,{item:!0,xs:12,sm:6,md:3,children:r.jsx($,{title:"Daily Production",value:`${s.dailyProduction} m`,subtitle:"Meterage produced"})}),r.jsx(c,{item:!0,xs:12,sm:6,md:3,children:r.jsx($,{title:"Yarn Stock",value:`${s.yarnStock} kg`,subtitle:"Available raw material"})}),r.jsx(c,{item:!0,xs:12,sm:6,md:3,children:r.jsx($,{title:"Fabric Stock",value:`${s.fabricStock} pcs`,subtitle:"Finished inventory"})})]}),r.jsxs(c,{container:!0,spacing:2,sx:{mb:3},children:[r.jsx(c,{item:!0,xs:12,md:7,children:r.jsxs(y,{sx:{p:3,height:"100%"},children:[r.jsxs(h,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[r.jsx(i,{variant:"h6",sx:{fontWeight:700},children:"Revenue Trend"}),r.jsx(i,{variant:"body2",color:"text.secondary",children:"Last 6 months"})]}),r.jsx(h,{sx:{overflowX:"auto",minHeight:250},children:r.jsx(se,{data:l})})]})}),r.jsx(c,{item:!0,xs:12,md:5,children:r.jsxs(y,{sx:{p:3,display:"flex",flexDirection:"column",gap:2,height:"100%"},children:[r.jsx(i,{variant:"h6",sx:{fontWeight:700},children:"Operational Health"}),r.jsx(R,{label:"Pending Orders",value:`${s.pendingOrders}`,color:"#1d4ed8"}),r.jsx(R,{label:"Machine Utilization",value:`${s.efficiency}%`,color:"#059669"}),r.jsx(R,{label:"Defect Rate",value:`${s.defectRate}%`,color:"#dc2626"}),r.jsx(i,{variant:"body2",color:"text.secondary",children:"Factory efficiency is stable when the defect rate stays below 2%. Use the dashboard actions to resolve priority orders."})]})})]}),r.jsxs(c,{container:!0,spacing:2,children:[r.jsx(c,{item:!0,xs:12,md:4,children:r.jsxs(y,{sx:{p:3},children:[r.jsx(i,{variant:"h6",sx:{fontWeight:700,mb:2},children:"Order Workflow"}),r.jsx(oe,{variant:"determinate",value:Math.min(100,d.ordered+d.shipped+d.delivered||0),sx:{height:10,borderRadius:5,mb:2}}),r.jsx(i,{variant:"body2",color:"text.secondary",children:"Use this view to prioritize sales and order fulfillment."})]})}),r.jsx(c,{item:!0,xs:12,md:4,children:r.jsxs(y,{sx:{p:3},children:[r.jsx(i,{variant:"h6",sx:{fontWeight:700,mb:1},children:"Order Status"}),r.jsx(i,{variant:"subtitle2",children:"Ordered"}),r.jsx(i,{variant:"h5",sx:{mb:1},children:d.ordered}),r.jsx(i,{variant:"subtitle2",children:"Delivered"}),r.jsx(i,{variant:"h5",sx:{color:"success.main"},children:d.delivered})]})}),r.jsx(c,{item:!0,xs:12,md:4,children:r.jsxs(y,{sx:{p:3},children:[r.jsx(i,{variant:"h6",sx:{fontWeight:700,mb:1},children:"Backlog Priority"}),r.jsx(i,{variant:"body2",color:"text.secondary",children:"Focus on the highest value textile lines and dye batches."}),r.jsxs(h,{sx:{mt:2},children:[r.jsxs(i,{variant:"h5",sx:{mb:.5},children:[s.fabricStock," PCS"]}),r.jsx(i,{variant:"caption",color:"text.secondary",children:"Fabric inventory ready for dispatch"})]})]})})]})]}):r.jsx(h,{sx:{p:4},children:"Loading..."})};export{ue as default};
