import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, ClipboardList, UserCheck, Tags, MessageSquareWarning, Search, Bell, TrendingUp, Coins, Activity, CircleCheck, Users, AlertTriangle,
  ChevronRight, ChevronLeft, FileText, Star, Pencil, ShieldAlert, UserPlus, RotateCcw, Ban, Check, MapPin, CalendarDays, ArrowRight, ArrowLeft, Download,
  PanelLeftClose, PanelLeftOpen, LogOut, Settings, User, HelpCircle, Phone as PhoneIcon, CreditCard, Clock, Inbox, CheckCheck,
  Wallet, Landmark, Layers, Contact, Lock, Plus, History, Power,
} from 'lucide-react'
import { useStore, SERVICES, AREAS, ACTIVE, RADIUS, svcOf, areaOf, resolvePrice, candidates, rp, fmtDate, fmtTime, totalOf, extrasTotal, unpaid, held, payoutOf } from './store'
import { Btn, Badge, Card, Row, Empty, SvcIcon, Avatar, Pill, Thumbs, inputCls, cx } from './ui'
import { navigate } from './router'
import { AdminAuthProvider, useAdminAuth, canOpen } from './adminAuth'
import { Login, VerifyEmail } from './AuthPages'
import AdminProfile from './AdminProfile'

const NAV = [
  ['Operasional', [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['bookings', ClipboardList, 'Booking'],
    ['complaints', MessageSquareWarning, 'Komplain'],
  ]],
  ['Pengguna', [
    ['verify', UserCheck, 'Verifikasi Mitra'],
    ['customers', Contact, 'Customer'],
  ]],
  ['Keuangan', [['finance', Wallet, 'Transaksi & Payout']]],
  ['Konfigurasi', [
    ['services', Layers, 'Katalog Layanan'],
    ['pricing', Tags, 'Harga Regional'],
  ]],
]
const TITLES = { dashboard: 'Dashboard', bookings: 'Booking', complaints: 'Komplain', verify: 'Verifikasi Mitra', customers: 'Customer', finance: 'Transaksi & Payout', services: 'Katalog Layanan', pricing: 'Harga Regional', profile: 'Profil saya' }
const AUTH_PAGES = ['login', 'verify-email']

const to = (page, extra = '') => navigate(`/admin/${page}${extra}`)
const openBooking = (id) => to('bookings', `/${id}`)

// Tutup dropdown saat klik di luar elemen
function useOutside(onOut) {
  const ref = useRef()
  useEffect(() => {
    const f = (e) => ref.current && !ref.current.contains(e.target) && onOut()
    document.addEventListener('mousedown', f)
    return () => document.removeEventListener('mousedown', f)
  }, [])
  return ref
}

export default function Admin({ route }) {
  return (
    <AdminAuthProvider>
      <AuthGate route={route} />
    </AdminAuthProvider>
  )
}

// Arahkan ke login / verifikasi email sesuai status sesi, simpan tujuan awal di ?next=
function AuthGate({ route }) {
  const { session, toast, loggedOut } = useAdminAuth()
  const sub = route.parts[1]
  const target = !session ? 'login' : session.status === 'pending' ? 'verify-email' : null

  useEffect(() => {
    if (target && sub !== target) {
      const next = loggedOut ? '' : route.query.next || (sub && !AUTH_PAGES.includes(sub) ? route.path : '')
      navigate(`/admin/${target}${next ? `?next=${encodeURIComponent(next)}` : ''}`, { replace: true })
    } else if (!target && (!sub || AUTH_PAGES.includes(sub))) {
      navigate(route.query.next || '/admin/dashboard', { replace: true })
    }
    if (target) document.title = `${target === 'login' ? 'Masuk' : 'Verifikasi email'} · Fixora Admin`
  }, [target, sub])

  return (
    <>
      {target === 'login' ? <Login /> : target === 'verify-email' ? <VerifyEmail /> : !AUTH_PAGES.includes(sub) && <AdminConsole route={route} />}
      {toast && (
        <div key={toast.id} className="fixed left-1/2 top-5 z-[80] flex -translate-x-1/2 animate-slide-down items-center gap-2.5 rounded-2xl bg-slate-900 py-2.5 pl-3 pr-4 font-semibold text-white shadow-lift">
          <span className={cx('flex h-6 w-6 items-center justify-center rounded-full', toast.tone === 'info' ? 'bg-sky-500' : 'bg-emerald-500')}>{toast.tone === 'info' ? <Bell size={13} /> : <Check size={14} strokeWidth={3} />}</span>
          {toast.text}
        </div>
      )}
    </>
  )
}

function AdminConsole({ route }) {
  const { state, now } = useStore()
  const { user } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)
  const page = TITLES[route.parts[1]] ? route.parts[1] : 'dashboard'
  const detailId = page === 'bookings' && route.parts[2]
  const counts = {
    bookings: state.bookings.filter((b) => b.needsAdmin && b.status === 'searching').length,
    verify: state.workers.filter((w) => w.verified === 'pending').length,
    complaints: state.bookings.filter((b) => b.complaint?.status === 'open').length,
    finance: state.workers.filter((w) => unpaid(state, w.id).length).length,
  }
  const allowed = canOpen(user.role, page)
  const toast = state.notifs.find((n) => n.role === 'admin' && now - n.t < 4000)
  const mainRef = useRef()

  useEffect(() => {
    document.title = `${detailId || TITLES[page]} · Fixora Admin`
    mainRef.current?.scrollTo(0, 0)
  }, [page, detailId])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-sm">
      <aside className={cx('flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cx('flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100', collapsed ? 'justify-center' : 'px-5')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-base font-extrabold text-white shadow-md shadow-brand-600/30">F</span>
          {!collapsed && (
            <div>
              <div className="font-extrabold leading-tight">Fixora</div>
              <div className="text-[11px] font-medium text-slate-400">Admin Console</div>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5 scrollbar-none">
          {NAV.map(([group, all]) => [group, all.filter(([id]) => canOpen(user.role, id))]).filter(([, items]) => items.length).map(([group, items]) => (
            <div key={group}>
              {!collapsed && <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</div>}
              <div className="space-y-0.5">
                {items.map(([id, I, label]) => {
                  const active = page === id
                  return (
                    <a
                      key={id}
                      href={`#/admin/${id}`}
                      title={collapsed ? label : undefined}
                      className={cx('relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition', collapsed && 'justify-center', active ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}
                    >
                      {active && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-brand-600" />}
                      <I size={18} strokeWidth={active ? 2.4 : 2} />
                      {!collapsed && <span className="flex-1">{label}</span>}
                      {counts[id] > 0 && (collapsed ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /> : <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{counts[id]}</span>)}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button onClick={() => setCollapsed(!collapsed)} className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800', collapsed && 'justify-center')}>
            {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> Ciutkan menu</>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar page={page} detailId={detailId} />
        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div key={page + detailId} className="mx-auto max-w-7xl animate-fade-in space-y-6 px-8 pb-24 pt-8">
            {!allowed ? (
              <Card><Empty icon={Lock} title="Akses terbatas" text={`Halaman ${TITLES[page]} tidak tersedia untuk peran ${user.role}.`} /></Card>
            ) : detailId ? (
              <BookingDetail id={detailId} />
            ) : (
              <>
                {page === 'profile' && <AdminProfile tab={route.query.tab} />}
                {page === 'dashboard' && <Dashboard />}
                {page === 'bookings' && <Bookings initialQ={route.query.q || ''} />}
                {page === 'verify' && <Verify />}
                {page === 'pricing' && <Pricing />}
                {page === 'complaints' && <Complaints />}
                {page === 'customers' && <Customers />}
                {page === 'finance' && <Finance />}
                {page === 'services' && <Services />}
              </>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div key={toast.id} className="fixed bottom-20 right-5 z-50 flex animate-slide-up items-center gap-3 rounded-2xl bg-slate-900 py-3 pl-3 pr-5 text-white shadow-lift">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><Bell size={16} /></span>
          <span className="font-medium">{toast.text}</span>
        </div>
      )}
    </div>
  )
}

function Topbar({ page, detailId }) {
  const { state, act } = useStore()
  const { user, logout, flash } = useAdminAuth()
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(null)
  const close = () => setMenu(null)
  // Masing-masing hanya menutup dropdown miliknya sendiri
  const notifRef = useOutside(() => setMenu((m) => (m === 'notif' ? null : m)))
  const userRef = useOutside(() => setMenu((m) => (m === 'user' ? null : m)))
  const inputRef = useRef()
  const notifs = state.notifs.filter((n) => n.role === 'admin')
  const unread = notifs.filter((n) => !n.read).length

  useEffect(() => {
    const f = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    addEventListener('keydown', f)
    return () => removeEventListener('keydown', f)
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-8">
      <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
        <a href="#/admin/dashboard" className="hover:text-slate-700">Admin</a>
        <ChevronRight size={14} />
        {detailId ? (
          <>
            <a href={`#/admin/${page}`} className="hover:text-slate-700">{TITLES[page]}</a>
            <ChevronRight size={14} />
            <span className="font-mono font-semibold text-slate-900">{detailId}</span>
          </>
        ) : (
          <span className="font-semibold text-slate-900">{TITLES[page]}</span>
        )}
      </div>

      <form
        className="relative ml-auto w-80"
        onSubmit={(e) => {
          e.preventDefault()
          to('bookings', q ? `?q=${encodeURIComponent(q)}` : '')
          setQ('')
          inputRef.current.blur()
        }}
      >
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari booking, customer, layanan…" className="h-10 w-full rounded-xl bg-slate-100 pl-9 pr-12 text-[13px] outline-none ring-brand-500/20 transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-offset-0 focus:outline-1 focus:outline-brand-500" />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-white px-1.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">⌘K</kbd>
      </form>

      <div ref={notifRef} className="relative">
        <button
          onClick={() => {
            setMenu(menu === 'notif' ? null : 'notif')
            act.read('admin')
          }}
          className={cx('relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100', menu === 'notif' && 'bg-slate-100')}
        >
          <Bell size={18} />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unread}</span>}
        </button>
        {menu === 'notif' && (
          <div className="absolute right-0 top-12 z-40 w-96 animate-slide-down overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-bold">Notifikasi</span>
              <span className="flex items-center gap-1 text-xs text-slate-400"><CheckCheck size={14} /> Semua dibaca</span>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {notifs.length === 0 && <Empty icon={Inbox} title="Belum ada notifikasi" text="Aktivitas booking baru, komplain, dan matching akan muncul di sini." />}
              {notifs.map((n) => {
                const id = n.text.match(/FX-\d+/)?.[0]
                return (
                  <button key={n.id} onClick={() => { id && openBooking(id); close() }} className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span className="flex-1">
                      <span className="block text-[13px] leading-snug">{n.text}</span>
                      <span className="text-[11px] text-slate-400">{fmtTime(n.t)}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div ref={userRef} className="relative border-l border-slate-200 pl-4">
        <button onClick={() => setMenu(menu === 'user' ? null : 'user')} className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-100">
          <Avatar name={user.name} src={user.photo} size="sm" />
          <div className="text-left leading-tight">
            <div className="text-[13px] font-bold">{user.name}</div>
            <div className="text-[11px] text-slate-400">{user.role}</div>
          </div>
          <ChevronRight size={14} className={cx('text-slate-400 transition', menu === 'user' ? '-rotate-90' : 'rotate-90')} />
        </button>
        {menu === 'user' && (
          <div className="absolute right-0 top-12 z-40 w-60 animate-slide-down overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lift">
            <div className="px-3 py-2.5">
              <div className="font-bold">{user.name}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
            <div className="my-1 h-px bg-slate-100" />
            {[[User, 'Profil saya', () => to('profile')], [Settings, 'Keamanan akun', () => to('profile', '?tab=keamanan')], [HelpCircle, 'Bantuan']].map(([I, l, go]) => (
              <button key={l} onClick={() => { go?.(); close() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-slate-600 hover:bg-slate-50"><I size={16} /> {l}</button>
            ))}
            <div className="my-1 h-px bg-slate-100" />
            <button onClick={() => { close(); logout(); flash('Kamu telah keluar', 'info') }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-rose-600 hover:bg-rose-50"><LogOut size={16} /> Keluar</button>
          </div>
        )}
      </div>
    </header>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'
}

const H1 = ({ children, sub, right }) => (
  <div className="flex items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{children}</h1>
      {sub && <p className="mt-1 text-slate-500">{sub}</p>}
    </div>
    {right && <div className="flex items-center gap-2">{right}</div>}
  </div>
)

const TH = ({ children, className = '' }) => <th className={cx('px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400', className)}>{children}</th>

const CardHead = ({ title, sub, right }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
    <div>
      <div className="font-bold">{title}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
    {right}
  </div>
)

function WorkerCell({ id }) {
  const { state } = useStore()
  const w = state.workers.find((x) => x.id === id)
  if (!w) return <span className="text-slate-300">Belum ada</span>
  return (
    <span className="flex items-center gap-2">
      <Avatar name={w.name} size="xs" /> {w.name}
    </span>
  )
}

function BookingTable({ rows }) {
  if (!rows.length) return <Empty icon={ClipboardList} title="Tidak ada booking" text="Coba ubah filter atau kata kunci pencarian." />
  return (
    <table className="w-full text-left">
      <thead className="border-b border-slate-100 bg-slate-50/70">
        <tr>{['Booking', 'Customer', 'Area', 'Jadwal', 'Mitra', 'Total', 'Status'].map((h) => <TH key={h}>{h}</TH>)}<TH /></tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id} onClick={() => openBooking(b.id)} className="group cursor-pointer border-t border-slate-100 transition first:border-0 hover:bg-brand-50/40">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <SvcIcon id={b.svc} size="sm" />
                <div>
                  <div className="font-semibold">{svcOf(b.svc).name}{b.rework && <span className="text-slate-400"> · rework</span>}</div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    {b.id}
                    {b.needsAdmin && b.status === 'searching' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 font-medium">{b.customer}</td>
            <td className="px-4 text-slate-600">{areaOf(b.area).name}</td>
            <td className="px-4 text-xs text-slate-600">{fmtDate(b.schedule)}</td>
            <td className="px-4"><WorkerCell id={b.workerId} /></td>
            <td className="px-4 font-semibold tabular-nums">{rp(totalOf(b))}</td>
            <td className="px-4"><Badge status={b.status} /></td>
            <td className="px-4 text-slate-300 group-hover:text-brand-600"><ChevronRight size={16} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Dashboard() {
  const { state } = useStore()
  const { user } = useAdminAuth()
  const bs = state.bookings
  const done = bs.filter((b) => b.status === 'completed')
  const closed = bs.filter((b) => ['completed', 'cancelled', 'disputed'].includes(b.status))
  const gmv = done.reduce((s, b) => s + totalOf(b), 0)
  const commission = done.reduce((s, b) => s + b.price.base - b.price.payout + b.price.fee, 0)
  const online = state.workers.filter((w) => w.online && w.verified === 'verified')
  const alerts = [
    ...bs.filter((b) => b.needsAdmin && b.status === 'searching').map((b) => ({ tone: 'rose', I: ShieldAlert, title: `${b.id} belum mendapat mitra`, text: `${svcOf(b.svc).name} di ${areaOf(b.area).name} · ${b.customer}`, action: 'Tugaskan', onClick: () => openBooking(b.id) })),
    ...bs.filter((b) => b.complaint?.status === 'open').map((b) => ({ tone: 'amber', I: MessageSquareWarning, title: `Komplain terbuka pada ${b.id}`, text: `“${b.complaint.text}”`, action: 'Tinjau', onClick: () => openBooking(b.id) })),
    ...state.workers.filter((w) => w.verified === 'pending').map((w) => ({ tone: 'sky', I: UserPlus, title: `${w.name} menunggu verifikasi`, text: `${w.docs.length} dokumen · ${w.skills.map((s) => svcOf(s).name).join(', ')}`, action: 'Verifikasi', onClick: () => to('verify') })),
  ]
  const kpis = [
    [TrendingUp, 'GMV', rp(gmv), `${done.length} booking selesai`, 'brand'],
    [Coins, 'Komisi + service fee', rp(commission), gmv ? `${Math.round((commission / gmv) * 100)}% take rate` : '—', 'emerald'],
    [Activity, 'Booking aktif', bs.filter((b) => ACTIVE.includes(b.status)).length, 'sedang berjalan', 'sky'],
    [CircleCheck, 'Completion rate', closed.length ? Math.round((done.length / closed.length) * 100) + '%' : '—', `dari ${closed.length} booking ditutup`, 'violet'],
    [Users, 'Mitra online', online.length, `dari ${state.workers.filter((w) => w.verified === 'verified').length} terverifikasi`, 'amber'],
  ]
  const ICON_TONE = { brand: 'bg-brand-50 text-brand-600', emerald: 'bg-emerald-50 text-emerald-600', sky: 'bg-sky-50 text-sky-600', violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600' }
  const ALERT_TONE = { rose: 'bg-rose-50 text-rose-600', amber: 'bg-amber-50 text-amber-600', sky: 'bg-sky-50 text-sky-600' }
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <H1 sub={`${today} · Jakarta Selatan (pilot)`} right={<Pill tone="emerald" dot>Live</Pill>}>{greeting()}, {user.name.split(' ')[0]}</H1>
      <div className="grid grid-cols-5 gap-4">
        {kpis.map(([I, k, v, sub, tone]) => (
          <Card key={k} className="!p-5">
            <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', ICON_TONE[tone])}><I size={20} /></span>
            <div className="mt-4 text-xs font-semibold text-slate-500">{k}</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">{v}</div>
            <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 !p-0">
          <CardHead
            title={<span className="flex items-center gap-2">Perlu tindakan {alerts.length > 0 && <span className="rounded-full bg-rose-500 px-2 text-[11px] font-bold text-white">{alerts.length}</span>}</span>}
            right={<span className="text-xs text-slate-400">Diperbarui realtime</span>}
          />
          {alerts.length === 0 && <Empty icon={CircleCheck} title="Semua aman" text="Tidak ada item yang butuh perhatian." />}
          <div className="divide-y divide-slate-100">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ALERT_TONE[a.tone])}><a.I size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{a.title}</div>
                  <div className="truncate text-xs text-slate-500">{a.text}</div>
                </div>
                <Btn variant="secondary" size="sm" onClick={a.onClick}>{a.action} <ArrowRight size={13} /></Btn>
              </div>
            ))}
          </div>
        </Card>
        <Card className="!p-0">
          <CardHead title="Mitra online" right={<span className="text-xs text-slate-400">{online.length} aktif</span>} />
          {online.length === 0 && <Empty icon={Users} title="Tidak ada mitra online" />}
          <div className="divide-y divide-slate-100">
            {online.map((w) => {
              const busy = state.bookings.find((b) => b.workerId === w.id && ACTIVE.includes(b.status))
              return (
                <div key={w.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative">
                    <Avatar name={w.name} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{w.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500"><Star size={10} className="fill-amber-400 text-amber-400" />{w.rating.toFixed(1)} · {w.skills.map((s) => svcOf(s).name).join(', ')}</div>
                  </div>
                  {busy ? <Pill tone="violet">Bertugas</Pill> : <Pill tone="emerald">Siap</Pill>}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden !p-0">
        <CardHead title="Booking terbaru" right={<Btn variant="ghost" size="sm" onClick={() => to('bookings')}>Lihat semua <ArrowRight size={13} /></Btn>} />
        <BookingTable rows={bs.slice(0, 5)} />
      </Card>
    </>
  )
}

const FILTERS = [
  ['all', 'Semua', () => true],
  ['action', 'Perlu tindakan', (b) => (b.needsAdmin && b.status === 'searching') || b.status === 'disputed'],
  ['active', 'Aktif', (b) => ACTIVE.includes(b.status)],
  ['completed', 'Selesai', (b) => b.status === 'completed'],
  ['cancelled', 'Dibatalkan', (b) => b.status === 'cancelled'],
]
const PAGE_SIZE = 8

function exportCsv(rows, workers) {
  const head = ['ID', 'Layanan', 'Customer', 'Area', 'Jadwal', 'Mitra', 'Status', 'Harga', 'Biaya layanan', 'Biaya tambahan', 'Total']
  const lines = rows.map((b) => [b.id, svcOf(b.svc).name, b.customer, areaOf(b.area).name, new Date(b.schedule).toISOString(), workers.find((w) => w.id === b.workerId)?.name || '', b.status, b.price.base, b.price.fee, extrasTotal(b), totalOf(b)])
  const csv = [head, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `fixora-booking-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

function Bookings({ initialQ }) {
  const { state } = useStore()
  const [f, setF] = useState('all')
  const [svc, setSvc] = useState('')
  const [q, setQ] = useState(initialQ)
  const [pg, setPg] = useState(0)
  useEffect(() => setQ(initialQ), [initialQ])
  useEffect(() => setPg(0), [f, svc, q])
  const fn = FILTERS.find((x) => x[0] === f)[2]
  const rows = state.bookings
    .filter(fn)
    .filter((b) => !svc || b.svc === svc)
    .filter((b) => !q || `${b.id} ${b.customer} ${svcOf(b.svc).name} ${areaOf(b.area).name}`.toLowerCase().includes(q.toLowerCase()))
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const shown = rows.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE)
  return (
    <>
      <H1 sub="Pantau seluruh booking, intervensi matching, dan tinjau audit log" right={<Btn variant="secondary" icon={Download} onClick={() => exportCsv(rows, state.workers)}>Export CSV</Btn>}>Booking</H1>
      <Card className="overflow-hidden !p-0">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {FILTERS.map(([id, label, filter]) => (
              <button key={id} onClick={() => setF(id)} className={cx('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', f === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {label}
                <span className={cx('rounded-md px-1.5 text-[10px]', f === id ? 'bg-slate-100' : 'bg-slate-200/70')}>{state.bookings.filter(filter).length}</span>
              </button>
            ))}
          </div>
          <select value={svc} onChange={(e) => setSvc(e.target.value)} className={cx(inputCls, '!w-44 ml-auto')}>
            <option value="">Semua layanan</option>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={cx(inputCls, 'pl-9')} placeholder="Cari ID, customer, area…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <BookingTable rows={shown} />
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Menampilkan <b className="text-slate-700">{rows.length ? pg * PAGE_SIZE + 1 : 0}–{pg * PAGE_SIZE + shown.length}</b> dari <b className="text-slate-700">{rows.length}</b> booking
          </span>
          <div className="flex items-center gap-1">
            <button disabled={pg === 0} onClick={() => setPg(pg - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:text-slate-300"><ChevronLeft size={16} /></button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPg(i)} className={cx('h-8 min-w-8 rounded-lg px-2 font-semibold', i === pg ? 'bg-brand-600 text-white' : 'hover:bg-slate-100')}>{i + 1}</button>
            ))}
            <button disabled={pg >= pages - 1} onClick={() => setPg(pg + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:text-slate-300"><ChevronRight size={16} /></button>
          </div>
        </div>
      </Card>
    </>
  )
}

function BookingDetail({ id }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const [pick, setPick] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  if (!b)
    return (
      <Card>
        <Empty icon={ClipboardList} title={`Booking ${id} tidak ditemukan`} text="Booking mungkin sudah dihapus atau ID salah." />
        <div className="flex justify-center pb-4"><Btn variant="secondary" icon={ArrowLeft} onClick={() => to('bookings')}>Kembali ke daftar</Btn></div>
      </Card>
    )
  const svc = svcOf(b.svc)
  const w = state.workers.find((x) => x.id === b.workerId)
  const cands = candidates(state, b)
  const assignable = state.workers.filter((x) => x.verified === 'verified' && x.skills.includes(b.svc))
  const commission = b.price.base - b.price.payout
  const maxScore = Math.max(100, ...cands.map((c) => c.score))
  const cancellable = ['searching', 'assigned', 'on_the_way'].includes(b.status)

  return (
    <>
      <a href="#/admin/bookings" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={15} /> Semua booking</a>
      <div className="flex items-start gap-4">
        <SvcIcon id={b.svc} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">{svc.name}{svc.param && <span className="text-slate-400"> · {b.qty} {svc.param.unit}</span>}</h1>
            <Badge status={b.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-slate-500">
            <span className="font-mono">{b.id}</span>·<span>dibuat {fmtDate(b.createdAt)}</span>
            {b.rework && <>· <a href={`#/admin/bookings/${b.rework}`} className="font-semibold text-brand-700 hover:underline">rework dari {b.rework}</a></>}
          </div>
        </div>
        {cancellable && !confirmCancel && <Btn variant="danger-soft" icon={Ban} onClick={() => setConfirmCancel(true)}>Batalkan booking</Btn>}
        {confirmCancel && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 py-1.5 pl-3 pr-1.5 ring-1 ring-rose-200">
            <span className="text-[13px] font-semibold text-rose-700">Refund penuh {rp(totalOf(b))}?</span>
            <Btn size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>Tidak</Btn>
            <Btn size="sm" variant="danger" onClick={() => { act.cancel(b.id, 'Dibatalkan oleh admin', totalOf(b), 'Admin'); setConfirmCancel(false) }}>Ya, batalkan</Btn>
          </div>
        )}
      </div>

      {b.needsAdmin && b.status === 'searching' && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-rose-800">
          <ShieldAlert size={20} className="shrink-0" />
          <div className="flex-1 text-[13px]"><b>Matching otomatis gagal.</b> Tidak ada mitra eligible yang menerima offer. Tugaskan mitra secara manual di bagian kandidat matching.</div>
        </div>
      )}

      <div className="grid grid-cols-3 items-start gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="!p-0">
            <CardHead title="Detail pekerjaan" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              {[
                [CalendarDays, 'Jadwal kunjungan', fmtDate(b.schedule)],
                [MapPin, 'Alamat', `${b.address} · ${areaOf(b.area).name}, ${areaOf(b.area).city}`],
                [CreditCard, 'Pembayaran', `${b.payMethod} · ${rp(b.price.base + b.price.fee)}`],
                [Clock, 'Update terakhir', fmtDate(b.changedAt)],
              ].map(([I, l, v]) => (
                <div key={l} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><I size={17} /></span>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">{l}</div>
                    <div className="mt-0.5 font-medium">{v}</div>
                  </div>
                </div>
              ))}
              <div className="col-span-2">
                <div className="text-xs font-semibold text-slate-400">Deskripsi masalah</div>
                <div className="mt-1.5 rounded-xl bg-slate-50 px-4 py-3 text-slate-700">“{b.detail}”</div>
              </div>
              {(b.photos?.length > 0 || b.beforePhotos?.length > 0 || b.afterPhotos?.length > 0) && (
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  {[['Foto customer', b.photos], ['Sebelum', b.beforePhotos], ['Sesudah', b.afterPhotos]].map(([l, u]) => (
                    <div key={l}>
                      <div className="mb-1.5 text-xs font-semibold text-slate-400">{l}</div>
                      {u?.length ? <Thumbs urls={u} /> : <span className="text-xs text-slate-300">—</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {b.complaint && (
            <Card className={cx('!p-0', b.complaint.status === 'open' && '!border-rose-200')}>
              <CardHead title="Komplain" sub={`Diajukan ${fmtDate(b.complaint.t)}`} right={<Pill tone={b.complaint.status === 'open' ? 'rose' : 'emerald'} dot>{b.complaint.status === 'open' ? 'Terbuka' : 'Selesai'}</Pill>} />
              <div className="space-y-4 p-5">
                <blockquote className="rounded-xl border-l-4 border-rose-300 bg-slate-50 px-4 py-3 text-slate-700">“{b.complaint.text}”</blockquote>
                <Thumbs urls={b.complaint.photos} />
                {b.complaint.status === 'open' ? (
                  <div className="flex gap-2">
                    <Btn icon={RotateCcw} onClick={() => act.resolve(b.id, 'rework')}>Rework gratis</Btn>
                    <Btn variant="secondary" icon={Coins} onClick={() => act.resolve(b.id, 'refund')}>Refund {rp(totalOf(b))}</Btn>
                    <Btn variant="danger-soft" icon={Ban} onClick={() => act.resolve(b.id, 'reject')}>Tolak komplain</Btn>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-semibold text-emerald-700"><CircleCheck size={16} /> {b.complaint.resolution}</div>
                )}
              </div>
            </Card>
          )}

          <Card className="!p-0">
            <CardHead title="Kandidat matching" sub="Skor = skill 35 · jarak 25 · rating 20 · availability 10 · histori 10" right={<Pill tone="sky">Radius {b.radius || RADIUS[0]} km</Pill>} />
            <div className="p-5">
              {cands.length === 0 && <div className="rounded-xl bg-slate-50 p-4 text-[13px] text-slate-500">Tidak ada mitra terverifikasi dengan skill & area yang sesuai.</div>}
              <table className="w-full text-left">
                {cands.length > 0 && (
                  <thead>
                    <tr><TH className="!px-0">Mitra</TH><TH>Jarak</TH><TH>Rating</TH><TH className="w-56">Skor</TH><TH>Status</TH></tr>
                  </thead>
                )}
                <tbody>
                  {cands.map(({ w: c, score, eligible, inRadius }) => {
                    const st = b.workerId === c.id ? ['brand', 'Ditugaskan'] : !c.online ? ['slate', 'Offline'] : b.tried.includes(c.id) ? ['rose', 'Menolak/timeout'] : !inRadius ? ['amber', 'Di luar radius'] : eligible ? ['emerald', 'Eligible'] : ['slate', '—']
                    return (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="py-3"><span className="flex items-center gap-2.5 font-semibold"><Avatar name={c.name} size="sm" />{c.name}</span></td>
                        <td className="px-4 tabular-nums text-slate-600">{c.dist[b.area]} km</td>
                        <td className="px-4">{c.ratingCount ? <span className="inline-flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{c.rating.toFixed(1)}</span> : 'Baru'}</td>
                        <td className="px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(score / maxScore) * 100}%` }} /></div>
                            <span className="w-6 text-right text-xs font-extrabold tabular-nums">{score}</span>
                          </div>
                        </td>
                        <td className="px-4"><Pill tone={st[0]}>{st[1]}</Pill></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {b.status === 'searching' && (
                <div className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3">
                  <select className={inputCls} value={pick} onChange={(e) => setPick(e.target.value)}>
                    <option value="">Pilih mitra untuk ditugaskan manual…</option>
                    {assignable.map((x) => <option key={x.id} value={x.id}>{x.name} {x.online ? '' : '(offline)'} · {x.areas.join(', ')}</option>)}
                  </select>
                  <Btn disabled={!pick} icon={UserPlus} onClick={() => act.accept(b.id, pick, 'Admin')}>Tugaskan</Btn>
                </div>
              )}
            </div>
          </Card>

          <Card className="!p-0">
            <CardHead title="Audit log" sub={`${b.log.length} aktivitas tercatat`} />
            <ol className="p-5">
              {[...b.log].reverse().map((l, i, arr) => (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < arr.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />}
                  <span className={cx('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-[3px] ring-white', i === 0 ? 'bg-brand-500' : 'bg-slate-300')} />
                  <div className="flex flex-1 justify-between gap-4">
                    <div>
                      <span className="mr-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">{l.actor}</span>
                      <span className="text-slate-700">{l.text}</span>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{fmtTime(l.t)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="!p-0">
            <CardHead title="Snapshot harga" right={<Pill tone="brand">{b.price.level} · v{b.price.version}</Pill>} />
            <div className="space-y-2.5 p-5">
              <Row label="Harga layanan">{rp(b.price.base)}</Row>
              <Row label="Payout mitra">{rp(b.price.payout)}</Row>
              <Row label="Komisi platform">{rp(commission)} <span className="text-slate-400">({b.price.base ? Math.round((commission / b.price.base) * 100) : 0}%)</span></Row>
              <Row label="Biaya layanan">{rp(b.price.fee)}</Row>
              {b.extras.map((e) => (
                <Row key={e.id} label={e.item}>
                  {e.status === 'approved' ? rp(e.amount) : e.status === 'rejected' ? <s className="text-slate-400">{rp(e.amount)}</s> : <Pill tone="amber">menunggu</Pill>}
                </Row>
              ))}
              <Row label={<span className="font-bold text-slate-900">Total customer</span>} className="border-t border-slate-100 pt-3"><span className="text-lg font-extrabold">{rp(totalOf(b))}</span></Row>
              {b.refund > 0 && <Row label="Refund">{rp(b.refund)}</Row>}
              <div className="pt-1 text-[11px] text-slate-400">Wilayah harga: {b.price.region}</div>
            </div>
          </Card>

          <Card className="!p-0">
            <CardHead title="Customer" />
            <div className="flex items-center gap-3 p-5">
              <Avatar name={b.customer} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-bold">{b.customer}</div>
                <div className="text-xs text-slate-500">{areaOf(b.area).name}</div>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"><PhoneIcon size={16} /></button>
            </div>
            {b.rating && (
              <div className="border-t border-slate-100 px-5 py-4">
                <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className={i <= b.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />)}</div>
                {b.review && <div className="mt-1.5 text-[13px] text-slate-600">“{b.review}”</div>}
              </div>
            )}
          </Card>

          <Card className="!p-0">
            <CardHead title="Mitra" />
            {w ? (
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={w.name} size="lg" />
                  <div className="flex-1">
                    <div className="font-bold">{w.name}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500"><Star size={11} className="fill-amber-400 text-amber-400" />{w.rating.toFixed(1)} · {w.jobs} pekerjaan</div>
                  </div>
                  {w.online ? <Pill tone="emerald" dot>Online</Pill> : <Pill dot>Offline</Pill>}
                </div>
                <Row label="Telepon">{w.phone}</Row>
                <Row label="Payout booking ini">{rp(b.price.payout + extrasTotal(b))}</Row>
              </div>
            ) : (
              <Empty icon={UserPlus} title="Belum ada mitra" text={b.status === 'searching' ? 'Sistem sedang mencari, atau tugaskan manual.' : undefined} />
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

function Verify() {
  const { state, act } = useStore()
  const [notes, setNotes] = useState({})
  const pending = state.workers.filter((w) => ['pending', 'revision'].includes(w.verified))
  const verified = state.workers.filter((w) => w.verified === 'verified')
  const skills = (w) => w.skills.map((s) => svcOf(s).name).join(', ')
  return (
    <>
      <H1 sub="Mitra hanya menerima job offer setelah dokumen terverifikasi">Verifikasi Mitra</H1>
      <div className="flex items-center gap-2 text-base font-bold">Antrean verifikasi {pending.length > 0 && <span className="rounded-full bg-rose-500 px-2 text-[11px] text-white">{pending.length}</span>}</div>
      {pending.length === 0 && <Card><Empty icon={UserCheck} title="Antrean kosong" text="Tidak ada mitra yang menunggu verifikasi." /></Card>}
      <div className="grid grid-cols-2 gap-4">
        {pending.map((w) => (
          <Card key={w.id} className="space-y-4 !p-5">
            <div className="flex items-start gap-3">
              <Avatar name={w.name} size="lg" />
              <div className="flex-1">
                <div className="text-base font-bold">{w.name}</div>
                <div className="text-xs text-slate-500">{w.phone} · {w.areas.join(', ')}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">{w.skills.map((s) => <Pill key={s} tone="brand">{svcOf(s).name}</Pill>)}</div>
              </div>
              <Pill tone={w.verified === 'revision' ? 'amber' : 'sky'} dot>{w.verified === 'revision' ? 'Menunggu revisi' : 'Pendaftar baru'}</Pill>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {w.docs.map((d) => (
                <button key={d} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-left text-xs font-semibold transition hover:border-brand-300 hover:bg-brand-50/50">
                  <FileText size={16} className="shrink-0 text-brand-600" /> <span className="truncate">{d}</span>
                </button>
              ))}
            </div>
            {w.docs.length < 2 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                <AlertTriangle size={14} /> Dokumen kompetensi belum lengkap untuk kategori {skills(w)}
              </div>
            )}
            <input className={inputCls} placeholder="Catatan untuk mitra (wajib jika revisi/tolak)" value={notes[w.id] || ''} onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })} />
            <div className="flex gap-2">
              <Btn className="flex-1" icon={Check} onClick={() => act.verify(w.id, 'verified')}>Setujui</Btn>
              <Btn variant="secondary" className="flex-1" icon={RotateCcw} disabled={!notes[w.id]} onClick={() => act.verify(w.id, 'revision', notes[w.id])}>Minta revisi</Btn>
              <Btn variant="danger-soft" className="flex-1" icon={Ban} disabled={!notes[w.id]} onClick={() => act.verify(w.id, 'rejected', notes[w.id])}>Tolak</Btn>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden !p-0">
        <CardHead title="Mitra terverifikasi" sub={`${verified.length} mitra aktif di platform`} />
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr>{['Mitra', 'Keahlian', 'Area', 'Rating', 'Pekerjaan', 'Status'].map((h) => <TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {verified.map((w) => (
              <tr key={w.id} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5"><Avatar name={w.name} size="sm" /><div><div className="font-semibold">{w.name}</div><div className="text-[11px] text-slate-400">{w.phone}</div></div></div>
                </td>
                <td className="px-4"><div className="flex gap-1">{w.skills.map((s) => <SvcIcon key={s} id={s} size="sm" />)}</div></td>
                <td className="px-4 text-slate-600">{w.areas.join(', ')}</td>
                <td className="px-4">{w.ratingCount ? <span className="inline-flex items-center gap-1 font-semibold"><Star size={13} className="fill-amber-400 text-amber-400" />{w.rating.toFixed(1)} <span className="font-normal text-slate-400">({w.ratingCount})</span></span> : <Pill tone="sky">Baru</Pill>}</td>
                <td className="px-4 font-semibold tabular-nums">{w.jobs}</td>
                <td className="px-4">{w.online ? <Pill tone="emerald" dot>Online</Pill> : <Pill tone="slate" dot>Offline</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

const CITIES = [...new Set(AREAS.map((a) => a.city))]
const EMPTY_RULE = { svc: 'plumb', level: 'city', region: 'Bekasi', price: '', payout: '' }

function Pricing() {
  const { state, act } = useStore()
  const [edit, setEdit] = useState(null)
  const [add, setAdd] = useState(null)
  const [hist, setHist] = useState(null)
  const regions = add?.level === 'zone' ? AREAS.map((a) => [a.id, `${a.name} (${a.city})`]) : CITIES.map((c) => [c, c])
  const dup = add && state.prices.some((p) => p.svc === add.svc && p.level === add.level && p.region === add.region)
  const addInvalid = !add || dup || !(Number(add.price) > 0) || !(Number(add.payout) > 0) || Number(add.payout) >= Number(add.price)
  return (
    <>
      <H1 sub="Prioritas resolusi: harga zona → harga kota → layanan tidak tersedia">Harga Regional</H1>
      <Card className="overflow-hidden !p-0">
        <CardHead title="Cakupan harga per area" sub="Harga yang dilihat customer di aplikasi" right={<div className="flex gap-2"><Pill tone="brand">zone</Pill><Pill tone="slate">city</Pill></div>} />
        <table className="w-full text-left">
          <thead className="bg-slate-50/70">
            <tr><TH>Area</TH>{SERVICES.map((s) => <TH key={s.id}><span className="inline-flex items-center gap-2 normal-case tracking-normal"><SvcIcon id={s.id} size="sm" /> <span className="text-xs text-slate-600">{s.name}</span></span></TH>)}</tr>
          </thead>
          <tbody>
            {AREAS.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-3.5"><div className="font-semibold">{a.name}</div><div className="text-[11px] text-slate-400">{a.city}</div></td>
                {SERVICES.map((s) => {
                  const r = resolvePrice(state.prices, s.id, a.id)
                  return (
                    <td key={s.id} className="px-4">
                      {r ? <span className="inline-flex items-center gap-2 font-semibold tabular-nums">{rp(r.price)} <Pill tone={r.level === 'zone' ? 'brand' : 'slate'}>{r.level}</Pill></span> : <span className="text-xs font-semibold text-rose-500">Tidak tersedia</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-hidden !p-0">
        <CardHead title="Aturan harga" sub="Perubahan hanya berlaku untuk booking baru — booking terkonfirmasi memakai snapshot." right={!add && <Btn size="sm" icon={Plus} onClick={() => setAdd(EMPTY_RULE)}>Tambah aturan</Btn>} />
        {add && (
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-brand-50/40 px-5 py-4">
            {[
              ['Layanan', 'svc', SERVICES.map((x) => [x.id, x.name])],
              ['Level', 'level', [['city', 'city'], ['zone', 'zone']]],
              ['Wilayah', 'region', regions],
            ].map(([l, k, opts]) => (
              <label key={k} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{l}</span>
                <select className={cx(inputCls, '!w-48 !py-1.5')} value={add[k]} onChange={(e) => setAdd({ ...add, [k]: e.target.value, ...(k === 'level' && { region: e.target.value === 'zone' ? AREAS[0].id : CITIES[0] }) })}>
                  {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </label>
            ))}
            {[['Harga', 'price'], ['Payout mitra', 'payout']].map(([l, k]) => (
              <label key={k} className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{l}</span>
                <input type="number" className={cx(inputCls, '!w-32 !py-1.5')} value={add[k]} onChange={(e) => setAdd({ ...add, [k]: e.target.value })} />
              </label>
            ))}
            <div className="ml-auto flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => setAdd(null)}>Batal</Btn>
              <Btn size="sm" disabled={addInvalid} onClick={() => { act.addPrice({ svc: add.svc, level: add.level, region: add.region, price: Number(add.price), payout: Number(add.payout) }); setAdd(null) }}>Simpan v1</Btn>
            </div>
            {dup && <div className="w-full text-xs font-medium text-rose-600">Aturan untuk layanan & wilayah ini sudah ada — ubah aturan yang ada untuk membuat versi baru.</div>}
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-slate-50/70">
            <tr>{['Layanan', 'Level', 'Wilayah', 'Harga', 'Payout mitra', 'Komisi', 'Versi', 'Berlaku sejak', ''].map((h) => <TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {state.prices.map((p) => {
              const e = edit?.id === p.id
              const price = e ? Number(edit.price) : p.price
              const payout = e ? Number(edit.payout) : p.payout
              const invalid = e && (!(price > 0) || !(payout > 0) || payout >= price)
              const pct = price > 0 ? Math.round(((price - payout) / price) * 100) : 0
              return [
                <tr key={p.id} className={cx('border-t border-slate-100', e && 'bg-brand-50/40')}>
                  <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-semibold"><SvcIcon id={p.svc} size="sm" />{svcOf(p.svc).name}</span></td>
                  <td className="px-4"><Pill tone={p.level === 'zone' ? 'brand' : 'slate'}>{p.level}</Pill></td>
                  <td className="px-4 text-slate-600">{p.level === 'zone' ? areaOf(p.region).name : p.region}</td>
                  <td className="px-4 font-semibold tabular-nums">{e ? <input type="number" className={cx(inputCls, '!w-28 !py-1.5')} value={edit.price} onChange={(ev) => setEdit({ ...edit, price: ev.target.value })} /> : rp(p.price)}</td>
                  <td className="px-4 tabular-nums">{e ? <input type="number" className={cx(inputCls, '!w-28 !py-1.5')} value={edit.payout} onChange={(ev) => setEdit({ ...edit, payout: ev.target.value })} /> : rp(p.payout)}</td>
                  <td className={cx('px-4 font-semibold tabular-nums', invalid ? 'text-rose-600' : 'text-slate-600')}>{pct}%</td>
                  <td className="px-4"><span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold">v{p.version}</span></td>
                  <td className="px-4 text-xs text-slate-500">{new Date(p.from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-4 text-right">
                    {e ? (
                      <span className="inline-flex gap-2">
                        <Btn variant="ghost" size="sm" onClick={() => setEdit(null)}>Batal</Btn>
                        <Btn size="sm" disabled={invalid} onClick={() => { act.setPrice(p.id, price, payout); setEdit(null) }}>Simpan v{p.version + 1}</Btn>
                      </span>
                    ) : (
                      <span className="inline-flex gap-1">
                        {p.history?.length > 0 && <Btn variant="ghost" size="sm" icon={History} onClick={() => setHist(hist === p.id ? null : p.id)}>Riwayat</Btn>}
                        <Btn variant="ghost" size="sm" icon={Pencil} onClick={() => setEdit({ id: p.id, price: p.price, payout: p.payout })}>Ubah</Btn>
                      </span>
                    )}
                  </td>
                </tr>,
                hist === p.id &&
                  p.history.map((h) => (
                    <tr key={p.id + h.version} className="bg-slate-50/70 text-xs text-slate-500">
                      <td className="px-4 py-2 pl-14" colSpan={3}>Versi sebelumnya</td>
                      <td className="px-4 tabular-nums line-through">{rp(h.price)}</td>
                      <td className="px-4 tabular-nums line-through">{rp(h.payout)}</td>
                      <td className="px-4 tabular-nums">{Math.round(((h.price - h.payout) / h.price) * 100)}%</td>
                      <td className="px-4"><span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold">v{h.version}</span></td>
                      <td className="px-4" colSpan={2}>{new Date(h.from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – {new Date(h.to).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  )),
              ]
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

function Complaints() {
  const { state, act } = useStore()
  const [f, setF] = useState('open')
  const all = state.bookings.filter((b) => b.complaint)
  const list = all.filter((b) => f === 'all' || (f === 'open') === (b.complaint.status === 'open'))
  return (
    <>
      <H1 sub="Tentukan penyelesaian: rework gratis, refund, atau tolak komplain">Komplain</H1>
      <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
        {[['open', 'Terbuka'], ['resolved', 'Selesai'], ['all', 'Semua']].map(([id, l]) => (
          <button key={id} onClick={() => setF(id)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', f === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{l}</button>
        ))}
      </div>
      {list.length === 0 && <Card><Empty icon={MessageSquareWarning} title={f === 'open' ? 'Tidak ada komplain terbuka' : 'Belum ada komplain'} /></Card>}
      <div className="space-y-4">
        {list.map((b) => {
          const w = state.workers.find((x) => x.id === b.workerId)
          const isOpen = b.complaint.status === 'open'
          return (
            <Card key={b.id} className={cx('space-y-4 !p-5', isOpen && '!border-rose-200')}>
              <div className="flex items-start gap-4">
                <SvcIcon id={b.svc} size="lg" />
                <div className="flex-1">
                  <a href={`#/admin/bookings/${b.id}`} className="font-mono text-[11px] font-semibold text-brand-700 hover:underline">{b.id} →</a>
                  <div className="text-base font-bold">{svcOf(b.svc).name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Avatar name={b.customer} size="xs" />{b.customer}</span>
                    <ArrowRight size={12} />
                    <span className="flex items-center gap-1.5">{w && <Avatar name={w.name} size="xs" />}{w?.name}</span>
                    <span>· diajukan {fmtDate(b.complaint.t)}</span>
                  </div>
                </div>
                <Pill tone={isOpen ? 'rose' : 'emerald'} dot>{isOpen ? 'Terbuka' : 'Selesai'}</Pill>
              </div>
              <blockquote className="rounded-2xl border-l-4 border-rose-300 bg-slate-50 px-4 py-3 text-[13px] text-slate-700">“{b.complaint.text}”</blockquote>
              {isOpen ? (
                <div className="flex gap-2">
                  <Btn icon={RotateCcw} onClick={() => act.resolve(b.id, 'rework')}>Rework gratis</Btn>
                  <Btn variant="secondary" icon={Coins} onClick={() => act.resolve(b.id, 'refund')}>Refund {rp(totalOf(b))}</Btn>
                  <Btn variant="danger-soft" icon={Ban} onClick={() => act.resolve(b.id, 'reject')}>Tolak komplain</Btn>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-semibold text-emerald-700"><CircleCheck size={16} /> {b.complaint.resolution}</div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}

function Customers() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const rows = state.customers
    .map((c) => {
      const bs = state.bookings.filter((b) => b.customer === c.name)
      return { c, count: bs.length, spent: bs.filter((b) => b.status === 'completed').reduce((t, b) => t + totalOf(b), 0), open: bs.filter((b) => b.complaint?.status === 'open').length, last: bs[0] }
    })
    .filter(({ c }) => !q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <H1 sub="Data kontak hanya untuk keperluan layanan — akses tercatat di audit log">Customer</H1>
      <Card className="overflow-hidden !p-0">
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <div className="relative ml-auto w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={cx(inputCls, 'pl-9')} placeholder="Cari nama, HP, email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {rows.length === 0 ? (
          <Empty icon={Contact} title="Tidak ada customer" />
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr>{['Customer', 'Kontak', 'Bergabung', 'Pesanan', 'Total belanja', 'Pesanan terakhir', ''].map((h) => <TH key={h}>{h}</TH>)}</tr>
            </thead>
            <tbody>
              {rows.map(({ c, count, spent, open, last }) => (
                <tr key={c.id} className="border-t border-slate-100 first:border-0">
                  <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-semibold"><Avatar name={c.name} size="sm" />{c.name}</span></td>
                  <td className="px-4 text-xs text-slate-600"><div>{c.phone}</div><div className="text-slate-400">{c.email || '—'}</div></td>
                  <td className="px-4 text-xs text-slate-500">{new Date(c.joined).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 font-semibold tabular-nums">{count}</td>
                  <td className="px-4 font-semibold tabular-nums">{rp(spent)}</td>
                  <td className="px-4">{last ? <a href={`#/admin/bookings/${last.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">{last.id}</a> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4">{open > 0 && <Pill tone="rose" dot>{open} komplain</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}

function Services() {
  const { state, act } = useStore()
  return (
    <>
      <H1 sub="Layanan nonaktif tidak tampil di aplikasi customer dan tidak menerima booking baru">Katalog Layanan</H1>
      <div className="grid grid-cols-2 gap-4">
        {SERVICES.map((s) => {
          const off = state.svcOff.includes(s.id)
          const rules = state.prices.filter((p) => p.svc === s.id)
          const workers = state.workers.filter((w) => w.verified === 'verified' && w.skills.includes(s.id)).length
          return (
            <Card key={s.id} className={cx('space-y-4 !p-5', off && 'opacity-70')}>
              <div className="flex items-start gap-3">
                <SvcIcon id={s.id} size="lg" />
                <div className="flex-1">
                  <div className="text-base font-bold">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.desc}</div>
                </div>
                <Btn size="sm" variant={off ? 'soft' : 'secondary'} icon={Power} onClick={() => act.toggleService(s.id)}>{off ? 'Aktifkan' : 'Nonaktifkan'}</Btn>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ['Model harga', s.param ? `Variabel · per ${s.param.unit}` : 'Fixed'],
                  ['Aturan harga', `${rules.length} wilayah`],
                  ['Mitra terverifikasi', workers],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{l}</div>
                    <div className="mt-0.5 font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              {s.param && <div className="text-xs text-slate-500">Parameter: <b>{s.param.label}</b> (maks. {s.param.max} {s.param.unit}) · unit tambahan dikenakan {Math.round(s.param.extraRate * 100)}% dari harga dasar</div>}
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Checklist wajib mitra</div>
                <div className="flex flex-wrap gap-1.5">{s.checklist.map((c) => <Pill key={c}>{c}</Pill>)}</div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Status</span>
                {off ? <Pill tone="slate" dot>Nonaktif</Pill> : <Pill tone="emerald" dot>Aktif</Pill>}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function Finance() {
  const { state, act } = useStore()
  const [confirm, setConfirm] = useState(false)
  const bs = state.bookings.filter((b) => b.status !== 'pending_payment')
  const tx = bs
    .flatMap((b) => [
      !b.rework && { id: `PAY-${b.id}`, b, type: 'Pembayaran', method: b.payMethod, amount: b.price.base + b.price.fee, t: b.createdAt },
      ...b.extras.filter((e) => e.status === 'approved').map((e) => ({ id: `ADD-${b.id}-${e.id}`, b, type: 'Biaya tambahan', method: b.payMethod, amount: e.amount, t: b.changedAt })),
      b.refund > 0 && { id: `RFD-${b.id}`, b, type: 'Refund', method: b.payMethod, amount: -b.refund, t: b.changedAt },
    ])
    .filter(Boolean)
    .sort((a, c) => c.t - a.t)
  const done = bs.filter((b) => b.status === 'completed')
  const received = tx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const refunds = -tx.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const revenue = done.reduce((s, b) => s + b.price.base - b.price.payout + b.price.fee, 0)
  const pend = state.workers.map((w) => ({ w, list: unpaid(state, w.id), hold: held(state, w.id) })).filter((x) => x.list.length || x.hold.length)
  const pendingTotal = pend.reduce((s, x) => s + x.list.reduce((t, b) => t + payoutOf(b), 0), 0)
  const wName = (id) => state.workers.find((w) => w.id === id)?.name
  const TX_TONE = { Pembayaran: 'emerald', 'Biaya tambahan': 'sky', Refund: 'rose' }

  return (
    <>
      <H1 sub="Rekonsiliasi pembayaran customer, refund, dan payout mitra">Transaksi & Payout</H1>
      <div className="grid grid-cols-4 gap-4">
        {[
          [CreditCard, 'Dana masuk', rp(received), `${tx.filter((t) => t.amount > 0).length} transaksi`],
          [RotateCcw, 'Refund', rp(refunds), `${tx.filter((t) => t.amount < 0).length} transaksi`],
          [Coins, 'Pendapatan platform', rp(revenue), 'komisi + biaya layanan'],
          [Landmark, 'Payout tertunda', rp(pendingTotal), `${pend.filter((x) => x.list.length).length} mitra`],
        ].map(([I, l, v, sub]) => (
          <Card key={l} className="!p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><I size={20} /></span>
            <div className="mt-4 text-xs font-semibold text-slate-500">{l}</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">{v}</div>
            <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden !p-0">
        <CardHead
          title="Payout mitra"
          sub="Dibayar mingguan setiap Senin. Booking dalam komplain ditahan sampai diselesaikan."
          right={
            confirm ? (
              <span className="flex items-center gap-2 rounded-xl bg-brand-50 py-1.5 pl-3 pr-1.5 ring-1 ring-brand-200">
                <span className="text-[13px] font-semibold text-brand-800">Kirim {rp(pendingTotal)}?</span>
                <Btn size="sm" variant="ghost" onClick={() => setConfirm(false)}>Batal</Btn>
                <Btn size="sm" onClick={() => { act.runPayout(); setConfirm(false) }}>Ya, proses</Btn>
              </span>
            ) : (
              <Btn size="sm" icon={Landmark} disabled={!pendingTotal} onClick={() => setConfirm(true)}>Proses payout</Btn>
            )
          }
        />
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr>{['Mitra', 'Rekening', 'Booking siap bayar', 'Nominal', 'Ditahan'].map((h) => <TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {pend.length === 0 && <tr><td colSpan={5}><Empty icon={CircleCheck} title="Tidak ada payout tertunda" /></td></tr>}
            {pend.map(({ w, list, hold }) => (
              <tr key={w.id} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3"><span className="flex items-center gap-2.5 font-semibold"><Avatar name={w.name} size="sm" />{w.name}</span></td>
                <td className="px-4 font-mono text-xs text-slate-500">{w.bank || '—'}</td>
                <td className="px-4 text-xs">{list.map((b) => <a key={b.id} href={`#/admin/bookings/${b.id}`} className="mr-2 font-mono font-semibold text-brand-700 hover:underline">{b.id}</a>)}{!list.length && '—'}</td>
                <td className="px-4 font-semibold tabular-nums">{rp(list.reduce((t, b) => t + payoutOf(b), 0))}</td>
                <td className="px-4">{hold.length ? <Pill tone="rose">{rp(hold.reduce((t, b) => t + payoutOf(b), 0))} · {hold.map((b) => b.id).join(', ')}</Pill> : <span className="text-slate-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Riwayat payout</div>
          <div className="divide-y divide-slate-100">
            {state.payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 py-2.5 text-[13px]">
                <span className="w-20 font-mono font-semibold">{p.id}</span>
                <span className="flex-1">{wName(p.workerId)} · {p.count} booking</span>
                <span className="font-mono text-xs text-slate-400">{p.ref}</span>
                <span className="w-32 text-xs text-slate-500">{fmtDate(p.t)}</span>
                <span className="w-28 text-right font-semibold tabular-nums">{rp(p.amount)}</span>
                <Pill tone="emerald" dot>Berhasil</Pill>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden !p-0">
        <CardHead title="Transaksi customer" sub="Setiap transaksi memiliki referensi yang dapat ditelusuri ke booking (NFR-055)" />
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr>{['Referensi', 'Jenis', 'Booking', 'Customer', 'Metode', 'Waktu', 'Nominal'].map((h) => <TH key={h}>{h}</TH>)}</tr>
          </thead>
          <tbody>
            {tx.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{t.id}</td>
                <td className="px-4"><Pill tone={TX_TONE[t.type]}>{t.type}</Pill></td>
                <td className="px-4"><a href={`#/admin/bookings/${t.b.id}`} className="font-mono text-xs font-semibold text-brand-700 hover:underline">{t.b.id}</a></td>
                <td className="px-4">{t.b.customer}</td>
                <td className="px-4 text-xs text-slate-600">{t.method}</td>
                <td className="px-4 text-xs text-slate-500">{fmtDate(t.t)}</td>
                <td className={cx('px-4 font-semibold tabular-nums', t.amount < 0 && 'text-rose-600')}>{t.amount < 0 ? '−' + rp(-t.amount) : rp(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
