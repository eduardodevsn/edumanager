import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Plus, Pencil, Trash2, X, Search, AlertTriangle,
  TrendingUp, BarChart2, CheckCircle, ArrowUpRight, LogOut,
} from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login    from './Login'
import Register from './Register'

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS — injected once on mount
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: #000;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #111; }
  ::-webkit-scrollbar-thumb { background: #00FF87; border-radius: 3px; }
  ::selection { background: #00FF87; color: #000; }
  input, select, button, textarea { font-family: 'Poppins', sans-serif; }

  /* ── Animations ───────────────────────────────────── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
  }
  @keyframes toastIn  { from { opacity: 0; transform: translateX(110%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity: 1; transform: translateX(0); }    to { opacity: 0; transform: translateX(110%); } }
  @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

  .anim-view  { animation: fadeUp .38s ease both; }
  .anim-card  { animation: fadeUp .4s ease both; }
  .anim-card:nth-child(1) { animation-delay: .04s }
  .anim-card:nth-child(2) { animation-delay: .09s }
  .anim-card:nth-child(3) { animation-delay: .14s }
  .anim-card:nth-child(4) { animation-delay: .19s }
  .anim-modal  { animation: modalIn .22s ease both; }
  .toast-enter { animation: toastIn  .3s ease both; }
  .toast-exit  { animation: toastOut .3s ease both; }

  /* ── Table ─────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left; padding: 10px 14px;
    font-size: .68rem; font-weight: 600;
    letter-spacing: .09em; text-transform: uppercase;
    color: rgba(255,255,255,.38);
    border-bottom: 1px solid rgba(255,255,255,.06);
    white-space: nowrap;
  }
  tbody td {
    padding: 13px 14px; font-size: .875rem;
    border-bottom: 1px solid rgba(255,255,255,.04);
    vertical-align: middle; white-space: nowrap;
  }
  tbody tr { transition: background .15s; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: rgba(0,255,135,.04); }
  .table-wrap { overflow-x: auto; }

  /* ── Form inputs ────────────────────────────────────── */
  .fi {
    background: #0d0d0d;
    border: 1.5px solid rgba(255,255,255,.09);
    border-radius: 10px;
    padding: 10px 14px;
    color: #fff;
    font-size: .875rem;
    outline: none;
    transition: border-color .2s;
    width: 100%;
  }
  .fi:focus { border-color: rgba(0,255,135,.45); }
  .fi::placeholder { color: rgba(255,255,255,.22); }
  select.fi option { background: #1a1a1a; }

  /* ── Buttons ────────────────────────────────────────── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    font-size: .85rem; font-weight: 600;
    border: none; cursor: pointer; transition: all .2s;
    white-space: nowrap;
  }
  .btn-sm  { padding: 6px 13px; font-size: .78rem; border-radius: 8px; }
  .btn-ico { padding: 7px; border-radius: 8px; background: none; border: none; cursor: pointer; }
  .btn-p   { background: #00FF87; color: #000; }
  .btn-p:hover { background: #00e87a; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,255,135,.35); }
  .btn-g   { background: rgba(255,255,255,.06); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.1); }
  .btn-g:hover { background: rgba(255,255,255,.11); color: #fff; }
  .btn-d   { background: rgba(255,68,68,.12); color: #FF4444; border: 1px solid rgba(255,68,68,.25); }
  .btn-d:hover { background: rgba(255,68,68,.22); }

  /* ── Badges ─────────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 50px;
    font-size: .7rem; font-weight: 600;
  }
  .b-green  { background: rgba(0,255,135,.1);  color: #00FF87;  border: 1px solid rgba(0,255,135,.22); }
  .b-red    { background: rgba(255,68,68,.1);  color: #FF4444;  border: 1px solid rgba(255,68,68,.22); }
  .b-yellow { background: rgba(255,184,0,.1);  color: #FFB800;  border: 1px solid rgba(255,184,0,.22); }
  .b-gray   { background: rgba(255,255,255,.05); color: rgba(255,255,255,.45); border: 1px solid rgba(255,255,255,.1); }
  .b-purple { background: rgba(124,131,253,.1); color: #7C83FD; border: 1px solid rgba(124,131,253,.25); }

  /* ── Card ───────────────────────────────────────────── */
  .card { background: #111; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; }

  /* ── Sidebar nav item ───────────────────────────────── */
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px;
    font-size: .875rem; font-weight: 500;
    color: rgba(255,255,255,.5);
    border: 1.5px solid transparent;
    background: none; width: 100%; text-align: left;
    cursor: pointer; transition: all .2s;
  }
  .nav-item:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.9); }
  .nav-item.active {
    background: rgba(0,255,135,.1);
    color: #00FF87;
    border-color: rgba(0,255,135,.2);
  }

  /* ── Modal overlay ──────────────────────────────────── */
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.78);
    backdrop-filter: blur(6px);
    z-index: 900;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
`

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt    = (n) => new Intl.NumberFormat('es-PY').format(Math.round(n))
const fmtGs  = (n) => fmt(n) + ' Gs'
const fmtShort = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
const todayStr = () => new Date().toLocaleDateString('es-PY', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const INIT_PRODUCTS = []
const INIT_CLIENTS  = []
const INIT_SALES    = []

function buildWeeklyChart(sales) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const ventas  = sales.filter(s => s.date === dateStr).reduce((a, s) => a + s.total, 0)
    return { day: days[d.getDay()], ventas }
  })
}

/* ═══════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'success') => {
    const id = uid()
    setToasts(p => [...p, { id, message, type, exiting: false }])
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 320)
    }, 3000)
  }, [])

  const remove = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 320)
  }, [])

  return { toasts, add, remove }
}

function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={t.exiting ? 'toast-exit' : 'toast-enter'}
          style={{
            background: t.type === 'error' ? '#180808' : '#081410',
            border: `1px solid ${t.type === 'error' ? 'rgba(255,68,68,.35)' : 'rgba(0,255,135,.3)'}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 260, maxWidth: 340,
            boxShadow: '0 8px 32px rgba(0,0,0,.6)',
          }}
        >
          <span style={{ color: t.type === 'error' ? '#FF4444' : '#00FF87', fontSize: '1rem', flexShrink: 0 }}>
            {t.type === 'error' ? '✕' : '✓'}
          </span>
          <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.88)', flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} className="btn-ico" style={{ color: 'rgba(255,255,255,.35)', fontSize: '.85rem' }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */
function Modal({ title, onClose, children, width = 480 }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="anim-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid rgba(255,255,255,.09)',
          borderRadius: 20, width: '100%', maxWidth: width,
          padding: '28px 32px', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
          <button className="btn btn-ico btn-g" onClick={onClose}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, iconColor = '#00FF87', label, value, sub, subPositive }) {
  return (
    <div className="card anim-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '.78rem', fontWeight: 500, color: 'rgba(255,255,255,.45)' }}>{label}</span>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${iconColor}1a`, border: `1px solid ${iconColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={iconColor} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.15 }}>{value}</div>
        {sub && (
          <div style={{ fontSize: '.73rem', color: subPositive ? '#00FF87' : 'rgba(255,255,255,.4)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
            {subPositive && <ArrowUpRight size={12} />}
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '.83rem', color: 'rgba(255,255,255,.4)', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════════════════ */
function DashboardView({ products, clients, sales }) {
  const today        = daysAgo(0)
  const todaySales   = sales.filter(s => s.date === today)
  const todayRevenue = todaySales.reduce((a, s) => a + s.total, 0)
  const monthRevenue = sales.reduce((a, s) => a + s.total, 0)
  const totalStock   = products.reduce((a, p) => a + p.stock, 0)
  const lowStock     = products.filter(p => p.stock > 0 && p.stock < 5)
  const weeklyChart  = buildWeeklyChart(sales)

  const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(0,255,135,.25)', borderRadius: 10, padding: '10px 14px' }}>
        <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', marginBottom: 3 }}>{payload[0].payload.day}</div>
        <div style={{ fontWeight: 700, color: '#00FF87' }}>{fmtGs(payload[0].value)}</div>
      </div>
    )
  }

  return (
    <div className="anim-view">
      <SectionHeader title="Dashboard" subtitle={`Hoy — ${todayStr()}`} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          icon={ShoppingCart} label="Ventas del día"
          value={todaySales.length}
          sub={fmtGs(todayRevenue)} subPositive
        />
        <StatCard
          icon={Package} iconColor="#FFB800" label="Productos en stock"
          value={fmt(totalStock)}
          sub={`${lowStock.length} con stock bajo`}
        />
        <StatCard
          icon={Users} iconColor="#7C83FD" label="Clientes totales"
          value={clients.length}
          sub={`${clients.filter(c => c.status === 'activo').length} activos`}
        />
        <StatCard
          icon={TrendingUp} label="Ingresos del mes"
          value={fmtShort(monthRevenue) + ' Gs'}
          sub="+12% vs mes anterior" subPositive
        />
      </div>

      {/* Chart + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 24 }}>

        {/* Area chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Ventas semanales</div>
              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.38)', marginTop: 2 }}>Últimos 7 días</div>
            </div>
            <span className="badge b-green">Esta semana</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={weeklyChart} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00FF87" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,.38)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,255,255,.38)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="ventas"
                stroke="#00FF87" strokeWidth={2.5}
                fill="url(#gGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#00FF87', stroke: '#000', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Alertas de stock</div>
          <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.38)', marginBottom: 16 }}>Requieren reposición</div>
          {lowStock.length === 0
            ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.28)', fontSize: '.85rem' }}>Sin alertas activas</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                {lowStock.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px',
                    background: 'rgba(255,184,0,.06)', border: '1px solid rgba(255,184,0,.16)',
                    borderRadius: 10,
                  }}>
                    <div>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{p.category}</div>
                    </div>
                    <span className="badge b-yellow"><AlertTriangle size={10} />{p.stock}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Recent sales */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Ventas recientes</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Total</th></tr>
            </thead>
            <tbody>
              {sales.slice(0, 6).map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'rgba(255,255,255,.42)', fontSize: '.8rem' }}>{s.date}</td>
                  <td style={{ fontWeight: 600 }}>{s.client}</td>
                  <td style={{ color: 'rgba(255,255,255,.6)' }}>{s.product}</td>
                  <td style={{ textAlign: 'center' }}>{s.qty}</td>
                  <td><span style={{ color: '#00FF87', fontWeight: 700 }}>{fmtGs(s.total)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   INVENTORY VIEW
═══════════════════════════════════════════════════════════ */
function InventoryView({ products, setProducts, toast }) {
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('all')
  const [modal, setModal]       = useState(null)   // null | 'add' | product
  const [deleteTarget, setDel]  = useState(null)
  const [form, setForm]         = useState({})

  const categories = [...new Set(products.map(p => p.category))].sort()

  const filtered = products.filter(p => {
    const matchQ   = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.category === catFilter
    return matchQ && matchCat
  })

  const openAdd  = () => { setForm({ name: '', category: '', stock: '', price: '', status: 'activo' }); setModal('add') }
  const openEdit = (p) => { setForm({ ...p, stock: String(p.stock), price: String(p.price) }); setModal(p) }
  const close    = () => setModal(null)

  const save = () => {
    if (!form.name.trim() || !form.category.trim() || form.stock === '' || form.price === '') return
    const entry = { ...form, stock: +form.stock, price: +form.price }
    if (modal === 'add') {
      setProducts(p => [...p, { ...entry, id: uid() }])
      toast('Producto agregado correctamente')
    } else {
      setProducts(p => p.map(x => x.id === modal.id ? { ...entry, id: x.id } : x))
      toast('Producto actualizado')
    }
    close()
  }

  const doDelete = () => {
    setProducts(p => p.filter(x => x.id !== deleteTarget.id))
    toast('Producto eliminado')
    setDel(null)
  }

  const StockBadge = ({ n }) => {
    if (n === 0) return <span className="badge b-red">Sin stock</span>
    if (n < 5)   return <span className="badge b-yellow"><AlertTriangle size={10} /> Bajo ({n})</span>
    return <span className="badge b-green">{n} uds</span>
  }

  return (
    <div className="anim-view">
      <SectionHeader
        title="Inventario"
        subtitle={`${products.length} productos · ${products.filter(p => p.status === 'activo').length} activos`}
        action={<button className="btn btn-p" onClick={openAdd}><Plus size={15} /> Agregar producto</button>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)' }} />
          <input className="fi" style={{ paddingLeft: 36 }} placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="fi" style={{ width: 200 }} value={catFilter} onChange={e => setCat(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Alert banner */}
      {products.some(p => p.stock > 0 && p.stock < 5) && (
        <div style={{
          background: 'rgba(255,184,0,.07)', border: '1px solid rgba(255,184,0,.2)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '.82rem', color: '#FFB800',
        }}>
          <AlertTriangle size={15} />
          {products.filter(p => p.stock > 0 && p.stock < 5).length} producto(s) con stock bajo. Considerá reabastecer el inventario.
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '36px' }}>Sin resultados</td></tr>
                : filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="badge b-gray">{p.category}</span></td>
                    <td><StockBadge n={p.stock} /></td>
                    <td style={{ color: '#00FF87', fontWeight: 700 }}>{fmtGs(p.price)}</td>
                    <td><span className={`badge ${p.status === 'activo' ? 'b-green' : 'b-gray'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ico btn-g" onClick={() => openEdit(p)} style={{ color: 'rgba(255,255,255,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }}><Pencil size={14} /></button>
                        <button className="btn btn-ico btn-d" onClick={() => setDel(p)} style={{ color: '#FF4444', background: 'rgba(255,68,68,.1)', border: '1px solid rgba(255,68,68,.22)', borderRadius: 8 }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modal !== null && (
        <Modal title={modal === 'add' ? 'Agregar producto' : 'Editar producto'} onClose={close}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Nombre del producto">
              <input className="fi" placeholder="Ej: Laptop Dell XPS 15" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Categoría">
                <input className="fi" placeholder="Ej: Electrónica" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </Field>
              <Field label="Estado">
                <select className="fi" value={form.status || 'activo'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Stock (unidades)">
                <input className="fi" type="number" min="0" placeholder="0" value={form.stock ?? ''} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </Field>
              <Field label="Precio (Gs)">
                <input className="fi" type="number" min="0" placeholder="0" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn btn-g" onClick={close}>Cancelar</button>
              <button className="btn btn-p" onClick={save}><CheckCircle size={14} />{modal === 'add' ? 'Agregar' : 'Guardar cambios'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal title="Eliminar producto" onClose={() => setDel(null)} width={380}>
          <p style={{ color: 'rgba(255,255,255,.62)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 24 }}>
            ¿Estás seguro de eliminar <strong style={{ color: '#fff' }}>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-g" onClick={() => setDel(null)}>Cancelar</button>
            <button className="btn btn-d" onClick={doDelete}><Trash2 size={14} /> Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SALES VIEW
═══════════════════════════════════════════════════════════ */
function SalesView({ sales, setSales, products, clients, toast }) {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch]       = useState('')
  const [form, setForm]           = useState({ client: '', product: '', qty: 1 })

  const today        = daysAgo(0)
  const todayTotal   = sales.filter(s => s.date === today).reduce((a, s) => a + s.total, 0)
  const monthTotal   = sales.reduce((a, s) => a + s.total, 0)
  const avgTicket    = monthTotal / (sales.length || 1)

  const filtered = sales.filter(s =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.product.toLowerCase().includes(search.toLowerCase())
  )

  const selProduct  = products.find(p => p.name === form.product)
  const saleTotal   = selProduct ? selProduct.price * (+form.qty || 1) : 0

  const addSale = () => {
    if (!form.client || !form.product || !form.qty) return
    setSales(p => [{ id: uid(), date: today, client: form.client, product: form.product, qty: +form.qty, total: saleTotal }, ...p])
    setShowModal(false)
    setForm({ client: '', product: '', qty: 1 })
    toast('Venta registrada correctamente')
  }

  return (
    <div className="anim-view">
      <SectionHeader
        title="Ventas"
        subtitle={`${sales.length} ventas registradas`}
        action={<button className="btn btn-p" onClick={() => setShowModal(true)}><Plus size={15} /> Nueva venta</button>}
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={ShoppingCart} label="Ventas hoy"      value={sales.filter(s => s.date === today).length} sub={fmtGs(todayTotal)} subPositive />
        <StatCard icon={TrendingUp}   label="Total del mes"   value={fmtShort(monthTotal) + ' Gs'} sub={`${sales.length} ventas`} subPositive />
        <StatCard icon={BarChart2}    label="Ticket promedio" iconColor="#7C83FD" value={fmtShort(avgTicket) + ' Gs'} />
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)' }} />
        <input className="fi" style={{ paddingLeft: 36 }} placeholder="Buscar cliente o producto..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Total</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '36px' }}>Sin resultados</td></tr>
                : filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>{s.date}</td>
                    <td style={{ fontWeight: 600 }}>{s.client}</td>
                    <td style={{ color: 'rgba(255,255,255,.6)' }}>{s.product}</td>
                    <td style={{ textAlign: 'center' }}>{s.qty}</td>
                    <td><span style={{ color: '#00FF87', fontWeight: 700 }}>{fmtGs(s.total)}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* New sale modal */}
      {showModal && (
        <Modal title="Registrar nueva venta" onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Cliente">
              <select className="fi" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}>
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Producto">
              <select className="fi" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value, qty: 1 }))}>
                <option value="">Seleccionar producto</option>
                {products.filter(p => p.stock > 0 && p.status === 'activo').map(p => (
                  <option key={p.id} value={p.name}>{p.name} — {fmtGs(p.price)}</option>
                ))}
              </select>
            </Field>
            <Field label={`Cantidad${selProduct ? ` (máx. ${selProduct.stock})` : ''}`}>
              <input className="fi" type="number" min="1" max={selProduct?.stock ?? 99} value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
            </Field>
            {saleTotal > 0 && (
              <div style={{
                background: 'rgba(0,255,135,.07)', border: '1px solid rgba(0,255,135,.2)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.55)' }}>Total:</span>
                <span style={{ color: '#00FF87', fontWeight: 800, fontSize: '1.1rem' }}>{fmtGs(saleTotal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn btn-g" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-p" onClick={addSale}><CheckCircle size={14} /> Registrar venta</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CLIENTS VIEW
═══════════════════════════════════════════════════════════ */
function ClientsView({ clients, setClients, toast }) {
  const [search, setSearch]   = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [delTarget, setDel]   = useState(null)
  const [form, setForm]       = useState({ name: '', email: '', phone: '', status: 'activo' })

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const addClient = () => {
    if (!form.name.trim() || !form.email.trim()) return
    setClients(p => [...p, { ...form, id: uid(), totalPurchases: 0, since: daysAgo(0) }])
    setShowAdd(false)
    setForm({ name: '', email: '', phone: '', status: 'activo' })
    toast('Cliente agregado correctamente')
  }

  const doDelete = () => {
    setClients(p => p.filter(c => c.id !== delTarget.id))
    toast('Cliente eliminado')
    setDel(null)
  }

  return (
    <div className="anim-view">
      <SectionHeader
        title="Clientes"
        subtitle={`${clients.length} clientes · ${clients.filter(c => c.status === 'activo').length} activos`}
        action={<button className="btn btn-p" onClick={() => setShowAdd(true)}><Plus size={15} /> Agregar cliente</button>}
      />

      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)' }} />
        <input className="fi" style={{ paddingLeft: 36 }} placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Cliente</th><th>Email</th><th>Teléfono</th><th>Total compras</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: '36px' }}>Sin resultados</td></tr>
                : filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                          background: 'rgba(0,255,135,.1)', border: '1px solid rgba(0,255,135,.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.85rem', fontWeight: 800, color: '#00FF87',
                        }}>
                          {c.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,.5)', fontSize: '.83rem' }}>{c.email}</td>
                    <td style={{ color: 'rgba(255,255,255,.5)', fontSize: '.83rem' }}>{c.phone}</td>
                    <td><span style={{ color: '#00FF87', fontWeight: 700 }}>{fmtGs(c.totalPurchases)}</span></td>
                    <td><span className={`badge ${c.status === 'activo' ? 'b-green' : 'b-gray'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ico btn-d" onClick={() => setDel(c)} style={{ color: '#FF4444', background: 'rgba(255,68,68,.1)', border: '1px solid rgba(255,68,68,.22)', borderRadius: 8 }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Agregar cliente" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Nombre completo">
              <input className="fi" placeholder="Ej: Carlos Martínez" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className="fi" type="email" placeholder="email@ejemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Teléfono">
              <input className="fi" placeholder="+595 981 000 000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </Field>
            <Field label="Estado">
              <select className="fi" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn btn-g" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="btn btn-p" onClick={addClient}><CheckCircle size={14} /> Agregar cliente</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {delTarget && (
        <Modal title="Eliminar cliente" onClose={() => setDel(null)} width={380}>
          <p style={{ color: 'rgba(255,255,255,.62)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 24 }}>
            ¿Seguro que deseas eliminar a <strong style={{ color: '#fff' }}>{delTarget.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-g" onClick={() => setDel(null)}>Cancelar</button>
            <button className="btn btn-d" onClick={doDelete}><Trash2 size={14} /> Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
const SIDEBAR_W = 232

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'inventario', label: 'Inventario', icon: Package          },
  { id: 'ventas',     label: 'Ventas',     icon: ShoppingCart     },
  { id: 'clientes',   label: 'Clientes',   icon: Users            },
]

function Sidebar({ active, setActive, user }) {
  return (
    <aside style={{
      width: SIDEBAR_W, minWidth: SIDEBAR_W,
      background: '#080808',
      borderRight: '1px solid rgba(255,255,255,.055)',
      padding: '24px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 200, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '6px 10px 24px', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 8 }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-.025em' }}>
          Edu<span style={{ color: '#00FF87' }}>.dev</span>
        </div>
        <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)', marginTop: 3, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Manager
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 4 }}>
        Menú
      </div>

      {/* Nav */}
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item${active === id ? ' active' : ''}`}
          onClick={() => setActive(id)}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}

      {/* Footer / user */}
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,.03)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'rgba(0,255,135,.12)', border: '1px solid rgba(0,255,135,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.82rem', fontWeight: 800, color: '#00FF87',
          }}>{user?.email?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email ?? ''}</div>
            <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.3)' }}>Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
const HEADER_H = 56

export default function App() {
  const [active,      setActive]      = useState('dashboard')
  const [products,    setProducts]    = useState(INIT_PRODUCTS)
  const [clients,     setClients]     = useState(INIT_CLIENTS)
  const [sales,       setSales]       = useState(INIT_SALES)
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authScreen,  setAuthScreen]  = useState('login')
  const { toasts, add: toast, remove } = useToast()

  // Inject global styles once
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = GLOBAL_CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // Listen Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.35)' }}>Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return authScreen === 'login'
      ? <Login    onGoRegister={() => setAuthScreen('register')} />
      : <Register onGoLogin={() => setAuthScreen('login')} />
  }

  const views = {
    dashboard:  <DashboardView  products={products} clients={clients} sales={sales} />,
    inventario: <InventoryView  products={products} setProducts={setProducts} toast={toast} />,
    ventas:     <SalesView      sales={sales} setSales={setSales} products={products} clients={clients} toast={toast} />,
    clientes:   <ClientsView    clients={clients} setClients={setClients} toast={toast} />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={active} setActive={setActive} user={user} />

      {/* Top header */}
      <header style={{
        position: 'fixed',
        top: 0, left: SIDEBAR_W, right: 0,
        height: HEADER_H,
        background: 'rgba(0,0,0,.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,.055)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingInline: 28,
        gap: 14,
        zIndex: 100,
      }}>
        <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.45)' }}>
          {user.email}
        </span>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 9, padding: '7px 13px',
            color: 'rgba(255,255,255,.7)', fontSize: '.8rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,68,68,.1)'; e.currentTarget.style.color = '#FF6B6B'; e.currentTarget.style.borderColor = 'rgba(255,68,68,.25)' }}
          onMouseOut={e  => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </header>

      <main style={{
        marginLeft: SIDEBAR_W,
        flex: 1,
        paddingTop: HEADER_H + 36,
        padding: `${HEADER_H + 36}px 36px 56px`,
        background: '#000',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        {/* Re-key forces remount → triggers fade animation on view change */}
        <div key={active}>{views[active]}</div>
      </main>

      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  )
}
