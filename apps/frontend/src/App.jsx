import { useEffect, useState } from 'react'
import { Smartphone, Wrench, LayoutDashboard, LayoutGrid, Store, RotateCcw, Check, ListChecks, ChevronDown, ChevronRight } from 'lucide-react'
import { StoreProvider, useStore, useMe } from './store'
import Customer from './Customer'
import Worker from './Worker'
import Admin from './Admin'
import Business from './Business'
import { Screen, Avatar, cx } from './ui'
import { AuthGate } from './Auth'
import { useRoute, navigate } from './router'

const VIEWS = [
  ['home', 'Menu demo', LayoutGrid, '/'],
  ['customer', 'Customer', Smartphone, '/customer'],
  ['worker', 'Mitra', Wrench, '/worker'],
  ['admin', 'Admin Ops', LayoutDashboard, '/admin/dashboard'],
  ['business', 'Business Portal', Store, '/business/dashboard'],
]
const SEEDED = ['FX-1001', 'FX-1002', 'FX-1003']

// Langkah demo yang dicentang otomatis berdasarkan state booking
const STEPS = [
  ['Pesan AC Service di Kebayoran Baru', 'Customer → pilih layanan, jadwal, bayar', (b) => !!b],
  ['Terima job offer dalam 30 detik', 'Mitra → kartu job offer', (b, me) => !!me && b?.workerId === me],
  ['Jalankan status sampai dikerjakan', 'Mitra → perjalanan, tiba, foto sebelum', (b) => ['in_progress', 'waiting_confirmation', 'completed', 'disputed'].includes(b?.status)],
  ['Ajukan biaya tambahan', 'Mitra → mis. isi freon R32', (b) => b?.extras.length > 0],
  ['Setujui biaya tambahan', 'Customer → kartu persetujuan', (b) => b?.extras.some((e) => e.status !== 'pending')],
  ['Selesaikan & konfirmasi', 'Mitra → checklist + foto, Customer → konfirmasi', (b) => ['completed', 'disputed'].includes(b?.status)],
  ['Beri rating', 'Customer → bintang & ulasan', (b) => !!b?.rating],
]

function DemoGuide() {
  const { state } = useStore()
  const me = state.auth.worker
  const [open, setOpen] = useState(true)
  const demo = [...state.bookings].reverse().find((b) => !SEEDED.includes(b.id) && !b.rework)
  const done = STEPS.filter(([, , fn]) => fn(demo, me)).length
  const current = STEPS.findIndex(([, , fn]) => !fn(demo, me))
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><ListChecks size={17} /></span>
        <div className="flex-1">
          <div className="text-sm font-bold">Skenario demo</div>
          <div className="text-[11px] text-slate-400">{done}/{STEPS.length} langkah selesai</div>
        </div>
        <ChevronDown size={16} className={cx('text-slate-400 transition', !open && '-rotate-90')} />
      </button>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${(done / STEPS.length) * 100}%` }} />
      </div>
      {open && (
        <ol className="mt-4 space-y-3">
          {STEPS.map(([t, d, fn], i) => {
            const ok = fn(demo, me)
            const now = i === current
            return (
              <li key={t} className="flex gap-3">
                <span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition', ok ? 'bg-brand-500 text-white' : now ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-500' : 'bg-slate-100 text-slate-400')}>
                  {ok ? <Check size={12} strokeWidth={3.5} /> : i + 1}
                </span>
                <div>
                  <div className={cx('text-[13px] font-semibold leading-snug', ok ? 'text-slate-400 line-through' : now ? 'text-slate-900' : 'text-slate-600')}>{t}</div>
                  <div className="text-[11px] text-slate-400">{d}</div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {done === STEPS.length && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">Alur selesai! Buka Admin Ops untuk melihat GMV, audit log, dan snapshot harga.</div>}
    </div>
  )
}

const APPS = [
  ['customer', 'Aplikasi Customer', 'Pesan & pantau layanan', Smartphone, 'bg-brand-600 text-white'],
  ['worker', 'Aplikasi Mitra', 'Terima & kerjakan job offer', Wrench, 'bg-slate-900 text-white'],
]

// Halaman awal: pilih aplikasi + panduan skenario demo
function Launcher() {
  const customer = useMe('customer')
  const worker = useMe('worker')
  const who = { customer, worker }
  return (
    <Screen immersive="bg-slate-50">
      <div className="space-y-5 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-6">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white shadow-md shadow-brand-600/30">F</span>
          <div className="flex-1">
            <div className="text-lg font-extrabold leading-tight tracking-tight">Fixora</div>
            <div className="text-[11px] font-semibold text-slate-400">Interactive demo</div>
          </div>
          <button onClick={() => location.reload()} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-200/60 hover:text-slate-800">
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="space-y-2.5">
          {APPS.map(([id, title, desc, I, tone]) => (
            <a key={id} href={`#/${id}`} className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className={cx('flex h-12 w-12 items-center justify-center rounded-2xl', tone)}><I size={22} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold">{title}</div>
                <div className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                  {who[id] ? <><Avatar name={who[id].name} size="xs" /> Masuk sebagai {who[id].name}</> : desc}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </a>
          ))}
          <a href="#/admin/dashboard" className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><LayoutDashboard size={22} /></span>
            <div className="flex-1">
              <div className="text-[15px] font-bold">Admin Ops</div>
              <div className="text-xs text-slate-500">Dashboard desktop · verifikasi, harga, komplain</div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </a>
          <a href="#/business/dashboard" className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Store size={22} /></span>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[15px] font-bold">Business Portal <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Preview · Phase 3</span></div>
              <div className="text-xs text-slate-500">B2B · outlet, aset, work order, persetujuan</div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </a>
        </div>

        <DemoGuide />
        <p className="px-2 text-center text-[11px] leading-relaxed text-slate-400">
          Kode OTP demo: <b>123456</b>. Data tersimpan selama tab ini terbuka.
        </p>
      </div>
    </Screen>
  )
}

// Switcher kecil di pojok saat berada di Admin, agar tetap bisa kembali ke demo HP
function DemoSwitcher() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      {open && (
        <div className="mb-2 w-52 animate-slide-up overflow-hidden rounded-2xl bg-slate-900 p-1.5 text-white shadow-lift">
          {VIEWS.map(([id, label, I, path]) => (
            <button key={id} onClick={() => { navigate(path); setOpen(false) }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
              <I size={15} /> {label}
            </button>
          ))}
          <div className="my-1 h-px bg-white/10" />
          <button onClick={() => location.reload()} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><RotateCcw size={15} /> Reset demo</button>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full bg-slate-900/90 py-2 pl-2 pr-3.5 text-xs font-bold text-white shadow-lift ring-1 ring-white/10 backdrop-blur transition hover:bg-slate-900">
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-slate-900">Demo</span> Ganti tampilan
      </button>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const p = route.parts[0]
  const view = p === 'admin' ? 'admin' : p === 'business' ? 'business' : p === 'customer' ? 'customer' : p === 'worker' || p === 'mitra' ? 'worker' : 'home'
  useEffect(() => {
    if (view !== 'admin' && view !== 'business') document.title = { home: 'Fixora — Interactive Demo', customer: 'Fixora', worker: 'Fixora Mitra' }[view]
  }, [view])
  return (
    <StoreProvider>
      {view === 'admin' && (
        <>
          <Admin route={route} />
          <DemoSwitcher />
        </>
      )}
      {view === 'business' && (
        <>
          <Business route={route} />
          <DemoSwitcher />
        </>
      )}
      {view === 'home' && <Launcher />}
      {/* Tetap ter-mount agar state layar tidak hilang saat berpindah aplikasi */}
      <div className={view === 'customer' ? '' : 'hidden'}><AuthGate role="customer"><Customer /></AuthGate></div>
      <div className={view === 'worker' ? '' : 'hidden'}><AuthGate role="worker"><Worker /></AuthGate></div>
    </StoreProvider>
  )
}
