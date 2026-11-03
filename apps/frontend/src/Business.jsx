import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, ClipboardList, Store, Boxes, CalendarClock, ShieldCheck, ChartColumn, Users, ChevronRight, ChevronDown, Plus, Search, Check, X, Clock,
  AlertTriangle, MapPin, Timer, Coins, CircleCheck, Eye, FlaskConical, Pause, Play, Mail, Download, Phone, Hourglass, Lock, Bell, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { rp, fmtDate } from './store'
import { Btn, Card, Pill, Empty, Avatar, SvcIcon, inputCls, cx } from './ui'
import { navigate } from './router'
import { OrderTimeline, ProcessSummary, GanttList, ViewToggle, stageStats, groupSteps } from './Gantt'

// ---------- data contoh (Phase 3 preview, tidak tersambung ke store demo B2C) ----------
const H = 36e5
const D = 24 * H
const ago = (d, h = 0) => Date.now() - d * D - h * H

const ORG = { name: 'PT Kopi Senja Nusantara', plan: 'Pilot · Maintenance contract', id: 'ORG-0001' }
// Contoh threshold — angka final menunggu DEC-028
const THRESHOLD = 1500000

const BRANCHES = [
  { id: 'snp', name: 'Outlet Senopati', city: 'Jakarta Selatan', address: 'Jl. Senopati No. 41', pic: 'Rina Hapsari', phone: '0812-1100-2041', hours: '07.00–22.00' },
  { id: 'kmg', name: 'Outlet Kemang', city: 'Jakarta Selatan', address: 'Jl. Kemang Raya No. 12', pic: 'Dimas Pratama', phone: '0812-1100-2042', hours: '07.00–23.00' },
  { id: 'gdc', name: 'Outlet Gandaria City', city: 'Jakarta Selatan', address: 'Gandaria City Mall LG-07', pic: 'Sari Wulandari', phone: '0812-1100-2043', hours: '10.00–22.00 (jam mal)' },
  { id: 'bsd', name: 'Outlet BSD', city: 'Tangerang Selatan', address: 'Jl. Pahlawan Seribu, BSD', pic: 'Yoga Saputra', phone: '0812-1100-2044', hours: '07.00–22.00' },
]
const branchOf = (id) => BRANCHES.find((b) => b.id === id)

const CATS = { ac: ['AC', 'Snowflake'], chiller: ['Chiller & kulkas', 'Refrigerator'], pump: ['Pompa air', 'Droplets'], panel: ['Panel listrik', 'Zap'], exhaust: ['Exhaust & ventilasi', 'Fan'], plumb: ['Plumbing & grease trap', 'Wrench'] }
const ASSET_ST = { ok: ['Normal', 'emerald'], attention: ['Perlu perhatian', 'amber'], down: ['Rusak', 'rose'], retired: ['Tidak aktif', 'slate'] }

const ASSETS0 = [
  { id: 'AST-0101', name: 'AC Split Daikin 2PK · area depan', cat: 'ac', branch: 'snp', installed: 'Mar 2023', warranty: 'Habis', status: 'ok' },
  { id: 'AST-0102', name: 'AC Split Daikin 2PK · area belakang', cat: 'ac', branch: 'snp', installed: 'Mar 2023', warranty: 'Habis', status: 'attention' },
  { id: 'AST-0103', name: 'Chiller display Modena', cat: 'chiller', branch: 'snp', installed: 'Jan 2024', warranty: 'Jan 2027', status: 'ok' },
  { id: 'AST-0104', name: 'Grease trap dapur', cat: 'plumb', branch: 'snp', installed: 'Mar 2023', warranty: '—', status: 'ok' },
  { id: 'AST-0201', name: 'AC Cassette Panasonic 3PK', cat: 'ac', branch: 'kmg', installed: 'Agu 2022', warranty: 'Habis', status: 'down' },
  { id: 'AST-0202', name: 'Pompa air Shimizu PS-135', cat: 'pump', branch: 'kmg', installed: 'Agu 2022', warranty: 'Habis', status: 'ok' },
  { id: 'AST-0203', name: 'Exhaust dapur 16"', cat: 'exhaust', branch: 'kmg', installed: 'Agu 2022', warranty: '—', status: 'attention' },
  { id: 'AST-0301', name: 'AC Split LG 1.5PK', cat: 'ac', branch: 'gdc', installed: 'Mei 2024', warranty: 'Mei 2027', status: 'ok' },
  { id: 'AST-0302', name: 'Kulkas undercounter Polytron', cat: 'chiller', branch: 'gdc', installed: 'Mei 2024', warranty: 'Habis', status: 'ok' },
  { id: 'AST-0401', name: 'AC Split Sharp 2PK', cat: 'ac', branch: 'bsd', installed: 'Feb 2025', warranty: 'Feb 2028', status: 'ok' },
  { id: 'AST-0402', name: 'Panel listrik utama', cat: 'panel', branch: 'bsd', installed: 'Feb 2025', warranty: '—', status: 'ok' },
  { id: 'AST-0403', name: 'Pompa air Panasonic GP-129', cat: 'pump', branch: 'bsd', installed: 'Feb 2025', warranty: 'Habis', status: 'retired' },
]

const WO_ST = { approval: ['Menunggu persetujuan', 'amber'], open: ['Menunggu teknisi', 'slate'], assigned: ['Teknisi ditugaskan', 'sky'], progress: ['Dikerjakan', 'violet'], done: ['Selesai', 'emerald'], rejected: ['Ditolak', 'rose'] }
const FLOW = ['open', 'assigned', 'progress', 'done']
// Target SLA contoh per prioritas, dalam jam [respons, penyelesaian] — definisi final: DEC-060
const PRIO = { urgent: ['Darurat', 'rose', 4, 24], high: ['Tinggi', 'amber', 8, 48], normal: ['Normal', 'sky', 24, 72], low: ['Rendah', 'slate', 48, 168] }
const TYPE = { corrective: 'Corrective', preventive: 'Preventive' }
const VENDORS = ['Budi Santoso', 'Andi Wijaya', 'CV Sejuk Teknik', 'Hendra Kusuma']

const wo = (id, o) => ({ id, log: [], steps: [], est: 0, desc: '', ...o })
// steps = riwayat status [[status, t]] untuk timeline proses
const toStatus = (w, status) => ({ ...w, status, steps: [...w.steps, [status, Date.now()]] })

const WO_STAGES = [
  { key: 'approval', label: 'Persetujuan biaya', bar: 'bg-amber-400', optional: true },
  { key: 'open', label: 'Menunggu teknisi', bar: 'bg-slate-300' },
  { key: 'assigned', label: 'Penjadwalan', bar: 'bg-sky-400' },
  { key: 'progress', label: 'Pengerjaan', bar: 'bg-violet-500' },
]
const WOS0 = [
  wo('WO-2048', { steps: [['open', ago(0, 3)], ['approval', ago(0, 2)]], title: 'AC cassette tidak dingin, keluar air', branch: 'kmg', asset: 'AST-0201', type: 'corrective', prio: 'urgent', status: 'approval', created: ago(0, 3), est: 2850000, by: 'Dimas Pratama', desc: 'Kompresor bunyi kasar sejak pagi. Area duduk lantai 1 panas, pelanggan komplain.', log: [[ago(0, 3), 'Work order dibuat', 'Dimas Pratama'], [ago(0, 2), 'Inspeksi awal: kompresor perlu ganti kapasitor & isi freon. Estimasi Rp2.850.000', 'Budi Santoso']], vendor: 'Budi Santoso', responded: ago(0, 2) }),
  wo('WO-2047', { steps: [['open', ago(1, 2)], ['approval', ago(1, 0)]], title: 'Exhaust dapur bergetar & berisik', branch: 'kmg', asset: 'AST-0203', type: 'corrective', prio: 'normal', status: 'approval', created: ago(1, 2), est: 1750000, by: 'Dimas Pratama', desc: 'Getaran terasa sampai area bar.', log: [[ago(1, 2), 'Work order dibuat', 'Dimas Pratama'], [ago(1, 0), 'Bearing aus, perlu penggantian motor. Estimasi Rp1.750.000', 'Hendra Kusuma']], vendor: 'Hendra Kusuma', responded: ago(1, 0) }),
  wo('WO-2046', { steps: [['open', ago(1, 6)], ['assigned', ago(1, 3)], ['progress', ago(0, 1)]], title: 'Cuci AC berkala · Q4', branch: 'snp', asset: 'AST-0102', type: 'preventive', prio: 'normal', status: 'progress', created: ago(1, 6), est: 300000, by: 'Sistem (jadwal)', vendor: 'Andi Wijaya', responded: ago(1, 3), log: [[ago(1, 6), 'Dibuat otomatis dari jadwal "Cuci AC semua outlet"', 'Sistem'], [ago(1, 3), 'Teknisi ditugaskan: Andi Wijaya', 'Fixora Ops'], [ago(0, 1), 'Teknisi tiba di lokasi', 'Andi Wijaya']] }),
  wo('WO-2045', { steps: [['open', ago(0, 5)], ['assigned', ago(0, 4)]], title: 'Wastafel bar mampet', branch: 'gdc', type: 'corrective', prio: 'high', status: 'assigned', created: ago(0, 5), est: 450000, by: 'Sari Wulandari', vendor: 'Hendra Kusuma', responded: ago(0, 4), log: [[ago(0, 5), 'Work order dibuat', 'Sari Wulandari'], [ago(0, 4), 'Teknisi ditugaskan: Hendra Kusuma', 'Fixora Ops']] }),
  wo('WO-2044', { steps: [['open', ago(0, 9)]], title: 'Lampu signage depan mati sebagian', branch: 'bsd', type: 'corrective', prio: 'low', status: 'open', created: ago(0, 9), est: 350000, by: 'Yoga Saputra', log: [[ago(0, 9), 'Work order dibuat', 'Yoga Saputra']] }),
  wo('WO-2043', { steps: [['open', ago(6)], ['assigned', ago(5, 20)], ['progress', ago(5, 4)], ['done', ago(5, 2)]], title: 'Servis grease trap', branch: 'snp', asset: 'AST-0104', type: 'preventive', prio: 'normal', status: 'done', created: ago(6), est: 400000, by: 'Sistem (jadwal)', vendor: 'Hendra Kusuma', responded: ago(5, 20), resolved: ago(5, 2), log: [[ago(6), 'Dibuat otomatis dari jadwal', 'Sistem'], [ago(5, 2), 'Pekerjaan selesai, foto sebelum/sesudah terlampir', 'Hendra Kusuma']] }),
  wo('WO-2042', { steps: [['open', ago(9)], ['assigned', ago(8, 17)], ['progress', ago(7, 4)], ['done', ago(7, 1)]], title: 'Chiller display suhu tidak stabil', branch: 'snp', asset: 'AST-0103', type: 'corrective', prio: 'high', status: 'done', created: ago(9), est: 950000, by: 'Rina Hapsari', vendor: 'CV Sejuk Teknik', responded: ago(8, 17), resolved: ago(7, 1), log: [[ago(9), 'Work order dibuat', 'Rina Hapsari'], [ago(7, 1), 'Thermostat diganti', 'CV Sejuk Teknik']] }),
  wo('WO-2041', { steps: [['open', ago(12)], ['approval', ago(11, 21)], ['open', ago(11, 20)], ['assigned', ago(11, 19)], ['progress', ago(11, 6)], ['done', ago(11, 2)]], title: 'Pompa air mati total', branch: 'bsd', asset: 'AST-0403', type: 'corrective', prio: 'urgent', status: 'done', created: ago(12), est: 3200000, by: 'Yoga Saputra', vendor: 'Budi Santoso', responded: ago(11, 21), resolved: ago(11, 2), approval: { by: 'Lestari Anggraini', t: ago(11, 20), ok: true }, log: [[ago(12), 'Work order dibuat', 'Yoga Saputra'], [ago(11, 20), 'Disetujui: Rp3.200.000', 'Lestari Anggraini'], [ago(11, 2), 'Pompa diganti unit baru', 'Budi Santoso']] }),
  wo('WO-2040', { steps: [['open', ago(15)], ['assigned', ago(14, 20)], ['progress', ago(14, 3)], ['done', ago(14, 1)]], title: 'Cuci AC berkala · Q4', branch: 'gdc', asset: 'AST-0301', type: 'preventive', prio: 'normal', status: 'done', created: ago(15), est: 300000, by: 'Sistem (jadwal)', vendor: 'Andi Wijaya', responded: ago(14, 20), resolved: ago(14, 1), log: [] }),
  wo('WO-2039', { steps: [['open', ago(20)], ['assigned', ago(19, 17)], ['progress', ago(18, 14)], ['done', ago(18, 10)]], title: 'Stop kontak bar korslet', branch: 'kmg', type: 'corrective', prio: 'urgent', status: 'done', created: ago(20), est: 600000, by: 'Dimas Pratama', vendor: 'Hendra Kusuma', responded: ago(19, 17), resolved: ago(18, 10), log: [] }),
  wo('WO-2038', { steps: [['approval', ago(22)], ['rejected', ago(21)]], title: 'Penggantian filter air', branch: 'bsd', type: 'preventive', prio: 'low', status: 'rejected', created: ago(22), est: 1900000, by: 'Yoga Saputra', approval: { by: 'Lestari Anggraini', t: ago(21), ok: false, note: 'Masih dalam garansi vendor filter, klaim ke vendor dulu.' }, log: [] }),
]

const PLANS0 = [
  { id: 'PM-01', name: 'Cuci AC semua outlet', cat: 'ac', every: 'Tiap 3 bulan', scope: 5, next: ago(-12), active: true },
  { id: 'PM-02', name: 'Servis grease trap', cat: 'plumb', every: 'Tiap bulan', scope: 1, next: ago(-24), active: true },
  { id: 'PM-03', name: 'Pengecekan panel listrik', cat: 'panel', every: 'Tiap 6 bulan', scope: 1, next: ago(3), active: true },
  { id: 'PM-04', name: 'Servis pompa air', cat: 'pump', every: 'Tiap 6 bulan', scope: 2, next: ago(-60), active: false },
]

const MEMBERS0 = [
  { name: 'Lestari Anggraini', email: 'lestari@kopisenja.id', role: 'approver', scope: 'Semua outlet', title: 'Head of Operations' },
  { name: 'Arief Nugroho', email: 'arief@kopisenja.id', role: 'admin', scope: 'Semua outlet', title: 'Facility Manager' },
  { name: 'Rina Hapsari', email: 'rina@kopisenja.id', role: 'requester', scope: 'Outlet Senopati', title: 'Store Manager' },
  { name: 'Dimas Pratama', email: 'dimas@kopisenja.id', role: 'requester', scope: 'Outlet Kemang', title: 'Store Manager' },
  { name: 'Sari Wulandari', email: 'sari@kopisenja.id', role: 'requester', scope: 'Outlet Gandaria City', title: 'Store Manager' },
  { name: 'Yoga Saputra', email: 'yoga@kopisenja.id', role: 'requester', scope: 'Outlet BSD', title: 'Store Manager' },
  { name: 'Maya Kartika', email: 'maya@kopisenja.id', role: 'viewer', scope: 'Semua outlet', title: 'Finance' },
]

// Role sesuai FRD §2; "requester" = Business User yang membuat work order
const ROLES = {
  admin: { label: 'Business Admin', user: 'Arief Nugroho', can: ['create', 'manage'] },
  approver: { label: 'Business Approver', user: 'Lestari Anggraini', can: ['create', 'approve'] },
  requester: { label: 'Business User', user: 'Rina Hapsari', can: ['create'] },
  viewer: { label: 'Business Viewer', user: 'Maya Kartika', can: [] },
}

const NAV = [
  ['Operasional', [['dashboard', LayoutDashboard, 'Ringkasan'], ['workorders', ClipboardList, 'Work Order'], ['approvals', ShieldCheck, 'Persetujuan']]],
  ['Properti', [['locations', Store, 'Outlet & Lokasi'], ['assets', Boxes, 'Aset'], ['preventive', CalendarClock, 'Jadwal Preventive']]],
  ['Organisasi', [['reports', ChartColumn, 'Laporan'], ['team', Users, 'Tim & Akses']]],
]
const TITLES = { dashboard: 'Ringkasan', workorders: 'Work Order', approvals: 'Persetujuan', locations: 'Outlet & Lokasi', assets: 'Aset', preventive: 'Jadwal Preventive', reports: 'Laporan', team: 'Tim & Akses' }
const go = (page, extra = '') => navigate(`/business/${page}${extra}`)

// ---------- helpers ----------
const durH = (ms) => (ms < H ? `${Math.max(1, Math.round(ms / 6e4))} mnt` : ms < 2 * D ? `${Math.round(ms / H)} jam` : `${Math.round(ms / D)} hari`)
// Status SLA satu tahap: met / breach / running / risk (sisa < 25%)
function slaOf(w, kind) {
  const [, , resp, res] = PRIO[w.prio]
  const due = w.created + (kind === 'response' ? resp : res) * H
  const at = kind === 'response' ? w.responded : w.resolved
  if (w.status === 'rejected' || w.status === 'approval' && kind === 'resolution') return { state: 'paused', due }
  if (at) return { state: at <= due ? 'met' : 'breach', due, at }
  const left = due - Date.now()
  return { state: left < 0 ? 'breach' : left < (due - w.created) / 4 ? 'risk' : 'running', due, left }
}
const SLA_TONE = { met: ['Tercapai', 'emerald'], breach: ['Terlewat', 'rose'], running: ['Berjalan', 'sky'], risk: ['Hampir lewat', 'amber'], paused: ['Ditahan', 'slate'] }
const slaPct = (rows) => {
  const done = rows.filter((w) => w.status === 'done')
  return done.length ? Math.round((done.filter((w) => slaOf(w, 'resolution').state === 'met').length / done.length) * 100) : null
}

function useOutside(onOut) {
  const ref = useRef()
  useEffect(() => {
    const f = (e) => ref.current && !ref.current.contains(e.target) && onOut()
    document.addEventListener('mousedown', f)
    return () => document.removeEventListener('mousedown', f)
  }, [])
  return ref
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
const StatusPill = ({ s }) => <Pill tone={WO_ST[s][1]} dot>{WO_ST[s][0]}</Pill>
const PrioPill = ({ p }) => <Pill tone={PRIO[p][1]}>{PRIO[p][0]}</Pill>
const Select = ({ value, onChange, children, className = '' }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={cx(className ? inputCls.replace('w-full ', '') : inputCls, 'h-10 py-0', className)}>{children}</select>
)

// ---------- shell ----------
export default function Business({ route }) {
  const [assets, setAssets] = useState(ASSETS0)
  const [wos, setWos] = useState(WOS0)
  const [plans, setPlans] = useState(PLANS0)
  const [members, setMembers] = useState(MEMBERS0)
  const [role, setRole] = useState('admin')
  const [toast, setToast] = useState(null)
  const [creating, setCreating] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const mainRef = useRef()

  const page = TITLES[route.parts[1]] ? route.parts[1] : 'dashboard'
  const detailId = page === 'workorders' && route.parts[2]
  const me = ROLES[role]
  const can = (x) => me.can.includes(x)
  const flash = (text) => {
    setToast({ text, id: Date.now() })
    setTimeout(() => setToast(null), 2600)
  }
  const log = (w, text, by = me.user) => ({ ...w, log: [...w.log, [Date.now(), text, by]] })
  const update = (id, fn) => setWos((all) => all.map((w) => (w.id === id ? fn(w) : w)))

  const ctx = {
    assets, setAssets, wos, setWos, plans, setPlans, members, setMembers, role, me, can, flash, log, update,
    create: (f) => {
      const id = `WO-${2049 + wos.length - WOS0.length}`
      const needs = f.est > THRESHOLD
      setWos((all) => [{ id, ...f, status: needs ? 'approval' : 'open', steps: [[needs ? 'approval' : 'open', Date.now()]], created: Date.now(), by: me.user, log: [[Date.now(), 'Work order dibuat', me.user], ...(needs ? [[Date.now(), `Estimasi di atas ${rp(THRESHOLD)}, menunggu persetujuan`, 'Sistem']] : [])] }, ...all])
      flash(needs ? `${id} dibuat, menunggu persetujuan` : `${id} dibuat dan diteruskan ke Fixora`)
      return id
    },
    decide: (id, ok, note = '') => {
      update(id, (w) => log({ ...toStatus(w, ok ? 'open' : 'rejected'), approval: { by: me.user, t: Date.now(), ok, note } }, ok ? `Disetujui: ${rp(w.est)}` : `Ditolak${note ? `: ${note}` : ''}`))
      flash(ok ? `${id} disetujui` : `${id} ditolak`)
    },
  }
  const pending = wos.filter((w) => w.status === 'approval').length

  useEffect(() => {
    document.title = `${detailId || TITLES[page]} · Fixora Business`
    mainRef.current?.scrollTo(0, 0)
  }, [page, detailId])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-sm">
      <aside className={cx('flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cx('flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100', collapsed ? 'justify-center' : 'px-5')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-base font-extrabold text-white">F</span>
          {!collapsed && (
            <div>
              <div className="font-extrabold leading-tight">Fixora <span className="text-brand-600">Business</span></div>
              <div className="text-[11px] font-medium text-slate-400">Maintenance portal</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mx-3 mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-xs font-extrabold text-amber-800">KS</span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold">{ORG.name}</div>
                <div className="text-[11px] text-slate-400">{BRANCHES.length} outlet · {ORG.plan}</div>
              </div>
            </div>
          </div>
        )}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5 scrollbar-none">
          {NAV.map(([group, items]) => (
            <div key={group}>
              {!collapsed && <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</div>}
              <div className="space-y-0.5">
                {items.map(([id, I, label]) => {
                  const active = page === id
                  const n = id === 'approvals' ? pending : 0
                  return (
                    <a key={id} href={`#/business/${id}`} title={collapsed ? label : undefined} className={cx('relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition', collapsed && 'justify-center', active ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800')}>
                      {active && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-brand-600" />}
                      <I size={18} strokeWidth={active ? 2.4 : 2} />
                      {!collapsed && <span className="flex-1">{label}</span>}
                      {n > 0 && (collapsed ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" /> : <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">{n}</span>)}
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
        <div className="flex items-center justify-center gap-2 bg-violet-600 px-4 py-1.5 text-[12px] font-semibold text-white">
          <FlaskConical size={14} /> Preview Phase 3 (B2B). Semua data di halaman ini contoh dan tidak terhubung ke demo B2C.
        </div>
        <Topbar page={page} detailId={detailId} role={role} setRole={setRole} onCreate={can('create') ? () => setCreating(true) : null} />
        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div key={page + detailId} className="animate-fade-in space-y-6 px-6 pb-24 pt-6">
            {detailId ? <WorkOrderDetail id={detailId} ctx={ctx} /> : (
              <>
                {page === 'dashboard' && <Dashboard ctx={ctx} />}
                {page === 'workorders' && <WorkOrders ctx={ctx} onCreate={() => setCreating(true)} />}
                {page === 'approvals' && <Approvals ctx={ctx} />}
                {page === 'locations' && <Locations ctx={ctx} />}
                {page === 'assets' && <Assets ctx={ctx} />}
                {page === 'preventive' && <Preventive ctx={ctx} />}
                {page === 'reports' && <Reports ctx={ctx} />}
                {page === 'team' && <Team ctx={ctx} />}
              </>
            )}
          </div>
        </main>
      </div>

      {creating && <CreateWorkOrder ctx={ctx} onClose={() => setCreating(false)} />}
      {toast && (
        <div key={toast.id} className="fixed left-1/2 top-12 z-[80] flex -translate-x-1/2 animate-slide-down items-center gap-2.5 rounded-2xl bg-slate-900 py-2.5 pl-3 pr-4 font-semibold text-white shadow-lift">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500"><Check size={14} strokeWidth={3} /></span>
          {toast.text}
        </div>
      )}
    </div>
  )
}

function Topbar({ page, detailId, role, setRole, onCreate }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const me = ROLES[role]
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
        <a href="#/business/dashboard" className="hover:text-slate-700">Business</a>
        <ChevronRight size={14} />
        {detailId ? (
          <>
            <a href="#/business/workorders" className="hover:text-slate-700">Work Order</a>
            <ChevronRight size={14} />
            <span className="font-mono font-semibold text-slate-900">{detailId}</span>
          </>
        ) : <span className="font-semibold text-slate-900">{TITLES[page]}</span>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {onCreate && <Btn icon={Plus} onClick={onCreate}>Buat work order</Btn>}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><Bell size={18} /></button>
        <div ref={ref} className="relative border-l border-slate-200 pl-4">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-100">
            <Avatar name={me.user} size="sm" />
            <div className="text-left leading-tight">
              <div className="text-[13px] font-bold">{me.user}</div>
              <div className="text-[11px] text-slate-400">{me.label}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-40 w-72 animate-slide-down overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lift">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Demo · lihat sebagai</div>
              {Object.entries(ROLES).map(([id, r]) => (
                <button key={id} onClick={() => { setRole(id); setOpen(false) }} className={cx('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-slate-50', role === id && 'bg-brand-50')}>
                  <Avatar name={r.user} size="xs" />
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold">{r.label}</span>
                    <span className="block text-[11px] text-slate-400">{r.user} · {r.can.length ? r.can.map((c) => ({ create: 'buat WO', manage: 'kelola data', approve: 'setujui biaya' })[c]).join(', ') : 'hanya lihat'}</span>
                  </span>
                  {role === id && <Check size={15} className="text-brand-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ---------- tabel work order ----------
function WoTable({ rows, compact }) {
  if (!rows.length) return <Empty icon={ClipboardList} title="Tidak ada work order" text="Coba ubah filter." />
  return (
    <table className="w-full text-left">
      <thead className="border-b border-slate-100 bg-slate-50/70">
        <tr>{['Work order', 'Outlet', !compact && 'Tipe', 'Prioritas', 'SLA', !compact && 'Estimasi', 'Status'].filter(Boolean).map((h) => <TH key={h}>{h}</TH>)}<TH /></tr>
      </thead>
      <tbody>
        {rows.map((w) => {
          const s = slaOf(w, w.responded ? 'resolution' : 'response')
          return (
            <tr key={w.id} onClick={() => go('workorders', `/${w.id}`)} className="group cursor-pointer border-t border-slate-100 transition first:border-0 hover:bg-brand-50/40">
              <td className="px-4 py-3">
                <div className="font-semibold">{w.title}</div>
                <div className="font-mono text-[11px] text-slate-400">{w.id} · {fmtDate(w.created)}</div>
              </td>
              <td className="px-4 text-slate-600">{branchOf(w.branch).name.replace('Outlet ', '')}</td>
              {!compact && <td className="px-4 text-slate-600">{TYPE[w.type]}</td>}
              <td className="px-4"><PrioPill p={w.prio} /></td>
              <td className="px-4"><Pill tone={SLA_TONE[s.state][1]}>{SLA_TONE[s.state][0]}</Pill></td>
              {!compact && <td className="px-4 font-semibold tabular-nums">{w.est ? rp(w.est) : '—'}</td>}
              <td className="px-4"><StatusPill s={w.status} /></td>
              <td className="px-4 text-slate-300 group-hover:text-brand-600"><ChevronRight size={16} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ---------- ringkasan ----------
function Stat({ icon: I, label, value, sub, tone = 'bg-brand-50 text-brand-600' }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
        <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', tone)}><I size={16} /></span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </Card>
  )
}

function Dashboard({ ctx }) {
  const { wos, assets, plans, me } = ctx
  const active = wos.filter((w) => !['done', 'rejected'].includes(w.status))
  const month = wos.filter((w) => w.created > ago(30) && w.status !== 'rejected')
  const pending = wos.filter((w) => w.status === 'approval')
  const pct = slaPct(wos)
  const atRisk = active.filter((w) => ['risk', 'breach'].includes(slaOf(w, w.responded ? 'resolution' : 'response').state))
  const upcoming = [...plans].filter((p) => p.active).sort((a, b) => a.next - b.next)
  return (
    <>
      <H1 sub={`${ORG.name} · ${BRANCHES.length} outlet · ${assets.filter((a) => a.status !== 'retired').length} aset aktif`}>Halo, {me.user.split(' ')[0]}</H1>
      <div className="grid grid-cols-4 gap-4">
        <Stat icon={ClipboardList} label="Work order aktif" value={active.length} sub={`${atRisk.length} mendekati / melewati SLA`} />
        <Stat icon={ShieldCheck} label="Menunggu persetujuan" value={pending.length} sub={rp(pending.reduce((a, w) => a + w.est, 0))} tone="bg-amber-50 text-amber-600" />
        <Stat icon={Timer} label="SLA penyelesaian" value={pct == null ? '—' : `${pct}%`} sub="WO selesai, 30 hari terakhir" tone="bg-sky-50 text-sky-600" />
        <Stat icon={Coins} label="Biaya maintenance" value={rp(month.reduce((a, w) => a + w.est, 0))} sub="30 hari terakhir" tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 overflow-hidden p-0">
          <CardHead title="Perlu perhatian" sub="Menunggu persetujuan atau mendekati batas SLA" right={<Btn variant="ghost" size="sm" onClick={() => go('workorders')}>Semua work order</Btn>} />
          <WoTable compact rows={[...new Set([...pending, ...atRisk])].slice(0, 6)} />
        </Card>
        <Card className="overflow-hidden p-0">
          <CardHead title="Jadwal preventive" sub="Akan datang" right={<Btn variant="ghost" size="sm" onClick={() => go('preventive')}>Kelola</Btn>} />
          <div className="divide-y divide-slate-100">
            {upcoming.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <SvcIcon icon={CATS[p.cat][1]} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.every} · {p.scope} aset</div>
                </div>
                <NextDue t={p.next} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <CardHead title="Status per outlet" />
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {BRANCHES.map((b) => {
            const rows = wos.filter((w) => w.branch === b.id)
            const open = rows.filter((w) => !['done', 'rejected'].includes(w.status)).length
            const down = assets.filter((a) => a.branch === b.id && a.status === 'down').length
            return (
              <button key={b.id} onClick={() => go('workorders', `?branch=${b.id}`)} className="p-5 text-left transition hover:bg-slate-50">
                <div className="font-bold">{b.name.replace('Outlet ', '')}</div>
                <div className="text-[11px] text-slate-400">{b.pic}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Pill tone={open ? 'sky' : 'slate'}>{open} WO aktif</Pill>
                  {down > 0 && <Pill tone="rose" dot>{down} aset rusak</Pill>}
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </>
  )
}

const NextDue = ({ t }) => {
  const d = Math.round((t - Date.now()) / D)
  return d < 0 ? <Pill tone="rose" dot>Terlambat {-d} hari</Pill> : <span className="text-xs font-semibold text-slate-500">{d === 0 ? 'Hari ini' : `${d} hari lagi`}</span>
}

// ---------- daftar work order ----------
const WO_GROUPS = [
  ['type', 'Tipe', () => (w) => TYPE[w.type]],
  ['prio', 'Prioritas', () => (w) => PRIO[w.prio][0]],
  ['branch', 'Outlet', () => (w) => branchOf(w.branch).name.replace('Outlet ', '')],
  ['cat', 'Kategori aset', (assets) => (w) => CATS[assets.find((a) => a.id === w.asset)?.cat]?.[0] || 'Tanpa aset'],
]
const FILTERS = [['active', 'Aktif'], ['approval', 'Persetujuan'], ['done', 'Selesai'], ['all', 'Semua']]

function WorkOrders({ ctx, onCreate }) {
  const { wos, assets, can } = ctx
  const q0 = new URLSearchParams(location.hash.split('?')[1] || '')
  const [f, setF] = useState('active')
  const [branch, setBranch] = useState(q0.get('branch') || 'all')
  const [type, setType] = useState('all')
  const [q, setQ] = useState('')
  const [view, setView] = useState('list')
  const [grp, setGrp] = useState('type')
  // Ringkasan rata-rata tidak ikut tab status, supaya WO yang sudah selesai tetap terhitung
  const base = wos.filter((w) =>
    (branch === 'all' || w.branch === branch) && (type === 'all' || w.type === type) &&
    (!q || `${w.id} ${w.title}`.toLowerCase().includes(q.toLowerCase())))
  const rows = base.filter((w) => f === 'all' || (f === 'active' ? !['done', 'rejected'].includes(w.status) : w.status === f))
  return (
    <>
      <H1 sub="Permintaan perbaikan & pekerjaan berkala di semua outlet" right={<><ViewToggle value={view} onChange={setView} />{can('create') && <Btn icon={Plus} onClick={onCreate}>Buat work order</Btn>}</>}>Work Order</H1>
      {view === 'timeline' && (
        <Card className="p-0">
          <CardHead
            title="Rata-rata durasi per tahap"
            sub={`Dari ${base.length} work order (semua status) sesuai filter outlet, tipe & pencarian`}
            right={
              <div className="flex rounded-xl bg-slate-100 p-1">
                {WO_GROUPS.map(([v, l]) => (
                  <button key={v} onClick={() => setGrp(v)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', grp === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{l}</button>
                ))}
              </div>
            }
          />
          <div className="p-5"><ProcessSummary groups={groupSteps(base, WO_GROUPS.find((g) => g[0] === grp)[2](assets), 'Keseluruhan')} stages={WO_STAGES} unit="WO" /></div>
        </Card>
      )}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
          <div className="flex rounded-xl bg-slate-100 p-1">
            {FILTERS.map(([v, l]) => (
              <button key={v} onClick={() => setF(v)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', f === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{l}</button>
            ))}
          </div>
          <Select value={branch} onChange={setBranch} className="w-48"><option value="all">Semua outlet</option>{BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Select value={type} onChange={setType} className="w-40"><option value="all">Semua tipe</option>{Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
          <div className="relative ml-auto w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID atau judul…" className={cx(inputCls, 'h-10 pl-9')} />
          </div>
        </div>
        {view === 'list' ? <WoTable rows={rows} /> : (
          <GanttList
            rows={rows.map((w) => ({ id: w.id, title: w.title, sub: `${w.id} · ${branchOf(w.branch).name.replace('Outlet ', '')}`, steps: w.steps, end: WO_ST[w.status][0] }))}
            stages={WO_STAGES}
            onOpen={(id) => go('workorders', `/${id}`)}
          />
        )}
      </Card>
    </>
  )
}

// ---------- detail work order ----------
function SlaBox({ w, kind }) {
  const s = slaOf(w, kind)
  const [, , resp, res] = PRIO[w.prio]
  const [label, tone] = SLA_TONE[s.state]
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-slate-500">{kind === 'response' ? 'Waktu respons' : 'Waktu penyelesaian'}</span>
        <Pill tone={tone} dot>{label}</Pill>
      </div>
      <div className="mt-2 text-lg font-extrabold tabular-nums">
        {s.at ? durH(s.at - w.created) : s.state === 'paused' ? '—' : s.left < 0 ? `Lewat ${durH(-s.left)}` : `Sisa ${durH(s.left)}`}
      </div>
      <div className="text-[11px] text-slate-400">Target {kind === 'response' ? resp : res} jam ({PRIO[w.prio][0]}) · batas {fmtDate(s.due)}</div>
    </div>
  )
}

function WorkOrderDetail({ id, ctx }) {
  const { wos, assets, can, decide, update, log, flash, me } = ctx
  const w = wos.find((x) => x.id === id)
  const [note, setNote] = useState('')
  if (!w) return <Card><Empty icon={ClipboardList} title="Work order tidak ditemukan" text={id} /></Card>
  const asset = assets.find((a) => a.id === w.asset)
  const b = branchOf(w.branch)
  const step = FLOW.indexOf(w.status)

  // Di produk nyata progres diisi Fixora Ops & teknisi; tombol ini hanya untuk demo
  const advance = () => {
    const next = FLOW[step + 1]
    const vendor = w.vendor || VENDORS[0]
    update(w.id, (x) => log({
      ...toStatus(x, next), vendor,
      responded: x.responded || (next === 'assigned' ? Date.now() : x.responded),
      resolved: next === 'done' ? Date.now() : x.resolved,
    }, { assigned: `Teknisi ditugaskan: ${vendor}`, progress: 'Teknisi mulai mengerjakan', done: 'Pekerjaan selesai, bukti foto terlampir' }[next], next === 'assigned' ? 'Fixora Ops' : vendor))
    flash(`${w.id}: ${WO_ST[next][0]}`)
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-400">{w.id}</span>
            <StatusPill s={w.status} />
            <PrioPill p={w.prio} />
            <Pill>{TYPE[w.type]}</Pill>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight">{w.title}</h1>
          <p className="mt-1 text-slate-500">Dibuat {fmtDate(w.created)} oleh {w.by}</p>
        </div>
        {step >= 0 && step < FLOW.length - 1 && (
          <Btn variant="secondary" icon={Play} onClick={advance} title="Simulasi update dari Fixora Ops / teknisi">Simulasikan: {WO_ST[FLOW[step + 1]][0]}</Btn>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {w.status === 'approval' && (
            <Card className="border-amber-200 bg-amber-50/60 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><ShieldCheck size={18} /></span>
                <div className="flex-1">
                  <div className="font-bold">Butuh persetujuan biaya</div>
                  <div className="mt-0.5 text-[13px] text-slate-600">Estimasi <b>{rp(w.est)}</b> di atas batas {rp(THRESHOLD)}. Teknisi baru dijadwalkan setelah disetujui. SLA penyelesaian ditahan selama menunggu.</div>
                  {can('approve') ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (wajib jika ditolak)" className={cx(inputCls, 'h-10 flex-1 bg-white')} />
                      <Btn variant="danger-soft" icon={X} disabled={!note.trim()} onClick={() => decide(w.id, false, note.trim())}>Tolak</Btn>
                      <Btn icon={Check} onClick={() => decide(w.id, true, note.trim())}>Setujui</Btn>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Lock size={13} /> Hanya Business Approver yang dapat menyetujui. Saat ini kamu masuk sebagai {me.label}.</div>
                  )}
                </div>
              </div>
            </Card>
          )}
          {w.approval && (
            <Card className="flex items-start gap-3 p-5">
              <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', w.approval.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>{w.approval.ok ? <CircleCheck size={18} /> : <X size={18} />}</span>
              <div>
                <div className="font-bold">{w.approval.ok ? 'Disetujui' : 'Ditolak'} oleh {w.approval.by}</div>
                <div className="text-xs text-slate-400">{fmtDate(w.approval.t)}</div>
                {w.approval.note && <div className="mt-1.5 text-[13px] text-slate-600">“{w.approval.note}”</div>}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="mb-4 font-bold">SLA</div>
            <div className="grid grid-cols-2 gap-4"><SlaBox w={w} kind="response" /><SlaBox w={w} kind="resolution" /></div>
          </Card>

          <Card className="p-5">
            <div className="mb-1 font-bold">Timeline proses</div>
            <div className="mb-4 text-xs text-slate-500">Durasi tiap tahap dibandingkan rata-rata work order {TYPE[w.type].toLowerCase()}</div>
            <OrderTimeline steps={w.steps} stages={WO_STAGES} avg={stageStats(wos.filter((x) => x.type === w.type && x.id !== w.id).map((x) => x.steps), WO_STAGES)} />
          </Card>

          <Card className="p-5">
            <div className="mb-1 font-bold">Deskripsi</div>
            <p className="text-slate-600">{w.desc || 'Tidak ada deskripsi.'}</p>
          </Card>

          <Card className="p-5">
            <div className="mb-4 font-bold">Riwayat</div>
            {w.log.length === 0 ? <div className="text-slate-400">Belum ada riwayat tercatat.</div> : (
              <ol className="space-y-4">
                {[...w.log].reverse().map(([t, text, by], i) => (
                  <li key={i} className="flex gap-3">
                    <span className={cx('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', i === 0 ? 'bg-brand-500 ring-4 ring-brand-100' : 'bg-slate-300')} />
                    <div>
                      <div className="font-medium">{text}</div>
                      <div className="text-[11px] text-slate-400">{by} · {fmtDate(t)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3 p-5">
            <div className="font-bold">Detail</div>
            {[
              ['Outlet', b.name], ['Alamat', b.address], ['PIC outlet', b.pic],
              ['Aset', asset ? <a href="#/business/assets" className="text-brand-700 hover:underline">{asset.name}</a> : '—'],
              ['Teknisi / vendor', w.vendor || 'Belum ditugaskan'],
              ['Estimasi biaya', w.est ? rp(w.est) : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-slate-500">{l}</span>
                <span className="text-right font-medium">{v}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5 text-[13px] text-slate-500">
            <div className="mb-1 flex items-center gap-1.5 font-bold text-slate-700"><Eye size={15} /> Siapa yang mengerjakan?</div>
            Work order diteruskan ke tim Fixora Ops, yang menugaskan mitra terverifikasi sesuai kontrak. Status dan bukti pekerjaan masuk otomatis ke sini.
          </Card>
        </div>
      </div>
    </>
  )
}

// ---------- modal buat work order ----------
function CreateWorkOrder({ ctx, onClose }) {
  const { assets, create } = ctx
  const [f, setF] = useState({ title: '', branch: 'snp', asset: '', type: 'corrective', prio: 'normal', desc: '', est: '' })
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v, ...(k === 'branch' ? { asset: '' } : {}) }))
  const est = Number(String(f.est).replace(/\D/g, '')) || 0
  const submit = (e) => {
    e.preventDefault()
    const id = create({ ...f, est, asset: f.asset || undefined })
    onClose()
    go('workorders', `/${id}`)
  }
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-950/40 p-6 backdrop-blur-[2px]" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl animate-slide-up space-y-4 rounded-3xl bg-white p-6 shadow-lift">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-bold">Buat work order</div>
            <div className="text-xs text-slate-500">Diteruskan ke Fixora Ops untuk penugasan teknisi</div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <Lbl label="Judul masalah"><input autoFocus required value={f.title} onChange={(e) => set('title')(e.target.value)} placeholder="mis. AC area kasir tidak dingin" className={inputCls} /></Lbl>
        <div className="grid grid-cols-2 gap-3">
          <Lbl label="Outlet"><Select value={f.branch} onChange={set('branch')}>{BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Lbl>
          <Lbl label="Aset (opsional)">
            <Select value={f.asset} onChange={set('asset')}>
              <option value="">Tidak terkait aset</option>
              {assets.filter((a) => a.branch === f.branch && a.status !== 'retired').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Lbl>
          <Lbl label="Tipe"><Select value={f.type} onChange={set('type')}>{Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Lbl>
          <Lbl label="Prioritas">
            <Select value={f.prio} onChange={set('prio')}>{Object.entries(PRIO).map(([k, [l, , r, s]]) => <option key={k} value={k}>{l} · respons {r} jam, selesai {s} jam</option>)}</Select>
          </Lbl>
        </div>
        <Lbl label="Deskripsi"><textarea rows={3} value={f.desc} onChange={(e) => set('desc')(e.target.value)} placeholder="Gejala, lokasi persis, jam operasional yang aman untuk dikerjakan…" className={inputCls} /></Lbl>
        <Lbl label="Perkiraan biaya (opsional)">
          <input inputMode="numeric" value={est ? est.toLocaleString('id-ID') : ''} onChange={(e) => set('est')(e.target.value)} placeholder="Rp0" className={inputCls} />
        </Lbl>
        <div className={cx('flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium', est > THRESHOLD ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-500')}>
          {est > THRESHOLD ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
          {est > THRESHOLD ? `Di atas ${rp(THRESHOLD)}. Butuh persetujuan Business Approver sebelum dijadwalkan.` : `Di bawah ${rp(THRESHOLD)} langsung diteruskan tanpa persetujuan.`}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn type="button" variant="ghost" onClick={onClose}>Batal</Btn>
          <Btn type="submit" disabled={!f.title.trim()}>Kirim work order</Btn>
        </div>
      </form>
    </div>
  )
}
const Lbl = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="text-[13px] font-semibold text-slate-700">{label}</span>
    {children}
  </label>
)

// ---------- persetujuan ----------
function Approvals({ ctx }) {
  const { wos, can, decide, me } = ctx
  const pending = wos.filter((w) => w.status === 'approval')
  const history = wos.filter((w) => w.approval).sort((a, b) => b.approval.t - a.approval.t)
  return (
    <>
      <H1 sub={`Work order dengan estimasi di atas ${rp(THRESHOLD)} butuh persetujuan sebelum dikerjakan`}>Persetujuan</H1>
      {!can('approve') && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-[13px] font-medium text-slate-600"><Lock size={15} /> Kamu masuk sebagai {me.label}, jadi hanya bisa melihat. Ganti ke Business Approver lewat menu profil untuk mencoba alur persetujuan.</div>
      )}
      <Card className="overflow-hidden p-0">
        <CardHead title="Menunggu keputusan" sub={`${pending.length} work order · ${rp(pending.reduce((a, w) => a + w.est, 0))}`} />
        {pending.length === 0 ? <Empty icon={CircleCheck} title="Semua sudah diputuskan" text="Tidak ada work order yang menunggu persetujuan." /> : (
          <div className="divide-y divide-slate-100">
            {pending.map((w) => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => go('workorders', `/${w.id}`)}>
                  <div className="flex items-center gap-2"><span className="font-semibold hover:text-brand-700">{w.title}</span><PrioPill p={w.prio} /></div>
                  <div className="text-[11px] text-slate-400"><span className="font-mono">{w.id}</span> · {branchOf(w.branch).name} · diajukan {w.by} · {durH(Date.now() - w.created)} lalu</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold tabular-nums">{rp(w.est)}</div>
                  <div className="text-[11px] text-slate-400">estimasi {w.vendor}</div>
                </div>
                {can('approve') && (
                  <div className="flex gap-2">
                    <Btn variant="secondary" size="sm" onClick={() => go('workorders', `/${w.id}`)}>Tinjau</Btn>
                    <Btn size="sm" icon={Check} onClick={() => decide(w.id, true)}>Setujui</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="overflow-hidden p-0">
        <CardHead title="Riwayat keputusan" sub="Tercatat siapa, kapan, dan hasilnya (FR-112)" />
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70"><tr>{['Work order', 'Nilai', 'Keputusan', 'Oleh', 'Waktu', 'Catatan'].map((h) => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {history.map((w) => (
              <tr key={w.id} onClick={() => go('workorders', `/${w.id}`)} className="cursor-pointer border-t border-slate-100 first:border-0 hover:bg-brand-50/40">
                <td className="px-4 py-3"><div className="font-semibold">{w.title}</div><div className="font-mono text-[11px] text-slate-400">{w.id}</div></td>
                <td className="px-4 font-semibold tabular-nums">{rp(w.est)}</td>
                <td className="px-4"><Pill tone={w.approval.ok ? 'emerald' : 'rose'} dot>{w.approval.ok ? 'Disetujui' : 'Ditolak'}</Pill></td>
                <td className="px-4">{w.approval.by}</td>
                <td className="px-4 text-xs text-slate-500">{fmtDate(w.approval.t)}</td>
                <td className="max-w-xs truncate px-4 text-slate-500">{w.approval.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

// ---------- outlet ----------
function Locations({ ctx }) {
  const { assets, wos, can, flash } = ctx
  return (
    <>
      <H1 sub="Outlet dan kontak operasional yang dipakai teknisi saat datang" right={can('manage') && <Btn icon={Plus} onClick={() => flash('Form tambah outlet belum ada di preview')}>Tambah outlet</Btn>}>Outlet & Lokasi</H1>
      <div className="grid grid-cols-2 gap-4">
        {BRANCHES.map((b) => {
          const a = assets.filter((x) => x.branch === b.id && x.status !== 'retired')
          const w = wos.filter((x) => x.branch === b.id)
          return (
            <Card key={b.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[15px] font-bold">{b.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {b.address}, {b.city}</div>
                </div>
                {can('manage') && <Btn variant="ghost" size="sm">Ubah</Btn>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                {[['Aset', a.length], ['WO aktif', w.filter((x) => !['done', 'rejected'].includes(x.status)).length], ['SLA', slaPct(w) == null ? '—' : `${slaPct(w)}%`]].map(([l, v]) => (
                  <div key={l}><div className="text-lg font-extrabold tabular-nums">{v}</div><div className="text-[11px] text-slate-400">{l}</div></div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 text-[13px]">
                <div className="flex items-center gap-2 text-slate-600"><Avatar name={b.pic} size="xs" /> {b.pic} <span className="text-slate-400">· PIC</span></div>
                <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {b.phone}</div>
                <div className="flex items-center gap-2 text-slate-600"><Clock size={14} className="text-slate-400" /> Akses teknisi {b.hours}</div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

// ---------- aset ----------
function Assets({ ctx }) {
  const { assets, setAssets, wos, can, flash } = ctx
  const [branch, setBranch] = useState('all')
  const [cat, setCat] = useState('all')
  const rows = assets.filter((a) => (branch === 'all' || a.branch === branch) && (cat === 'all' || a.cat === cat))
  return (
    <>
      <H1 sub="Registri aset per outlet beserta garansi dan riwayat maintenance" right={can('manage') && <Btn icon={Plus} onClick={() => flash('Form tambah aset belum ada di preview')}>Tambah aset</Btn>}>Aset</H1>
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
          <Select value={branch} onChange={setBranch} className="w-48"><option value="all">Semua outlet</option>{BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Select value={cat} onChange={setCat} className="w-52"><option value="all">Semua kategori</option>{Object.entries(CATS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</Select>
          <span className="ml-auto text-xs text-slate-400">{rows.length} aset</span>
        </div>
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70"><tr>{['Aset', 'Outlet', 'Dipasang', 'Garansi', 'Maintenance terakhir', 'Status'].map((h) => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {rows.map((a) => {
              const last = wos.filter((w) => w.asset === a.id && w.resolved).sort((x, y) => y.resolved - x.resolved)[0]
              return (
                <tr key={a.id} className="border-t border-slate-100 first:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SvcIcon icon={CATS[a.cat][1]} size="sm" />
                      <div><div className="font-semibold">{a.name}</div><div className="font-mono text-[11px] text-slate-400">{a.id} · {CATS[a.cat][0]}</div></div>
                    </div>
                  </td>
                  <td className="px-4 text-slate-600">{branchOf(a.branch).name.replace('Outlet ', '')}</td>
                  <td className="px-4 text-slate-600">{a.installed}</td>
                  <td className="px-4"><span className={cx(a.warranty === 'Habis' ? 'text-rose-600' : 'text-slate-600')}>{a.warranty}</span></td>
                  <td className="px-4 text-xs">{last ? <a href={`#/business/workorders/${last.id}`} className="text-brand-700 hover:underline">{last.id} · {durH(Date.now() - last.resolved)} lalu</a> : <span className="text-slate-400">Belum ada</span>}</td>
                  <td className="px-4">
                    {can('manage') ? (
                      <select value={a.status} onChange={(e) => { setAssets((all) => all.map((x) => (x.id === a.id ? { ...x, status: e.target.value } : x))); flash(`Status ${a.id} diperbarui`) }} className={cx('rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none ring-1 ring-inset', `${({ emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200', amber: 'bg-amber-50 text-amber-700 ring-amber-200', rose: 'bg-rose-50 text-rose-700 ring-rose-200', slate: 'bg-slate-100 text-slate-600 ring-slate-200' })[ASSET_ST[a.status][1]]}`)}>
                        {Object.entries(ASSET_ST).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    ) : <Pill tone={ASSET_ST[a.status][1]} dot>{ASSET_ST[a.status][0]}</Pill>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}

// ---------- preventive ----------
function Preventive({ ctx }) {
  const { plans, setPlans, assets, can, create } = ctx
  const generate = (p) => {
    const a = assets.find((x) => x.cat === p.cat && x.status !== 'retired')
    create({ title: `${p.name} (dari jadwal)`, branch: a?.branch || 'snp', asset: a?.id, type: 'preventive', prio: 'normal', desc: `Dibuat dari jadwal ${p.id} · ${p.every}`, est: 0 })
    setPlans((all) => all.map((x) => (x.id === p.id ? { ...x, next: x.next + 90 * D } : x)))
  }
  return (
    <>
      <H1 sub="Work order dibuat otomatis sesuai jadwal, dengan pengingat H-3 ke PIC outlet" right={can('manage') && <Btn icon={Plus}>Jadwal baru</Btn>}>Jadwal Preventive</H1>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70"><tr>{['Jadwal', 'Frekuensi', 'Cakupan', 'Berikutnya', 'Status'].map((h) => <TH key={h}>{h}</TH>)}<TH /></tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <SvcIcon icon={CATS[p.cat][1]} size="sm" />
                    <div><div className="font-semibold">{p.name}</div><div className="font-mono text-[11px] text-slate-400">{p.id}</div></div>
                  </div>
                </td>
                <td className="px-4 text-slate-600">{p.every}</td>
                <td className="px-4 text-slate-600">{p.scope} aset · {CATS[p.cat][0]}</td>
                <td className="px-4">{p.active ? <NextDue t={p.next} /> : <span className="text-slate-400">—</span>}</td>
                <td className="px-4"><Pill tone={p.active ? 'emerald' : 'slate'} dot>{p.active ? 'Aktif' : 'Dijeda'}</Pill></td>
                <td className="px-4 text-right">
                  {can('manage') && (
                    <div className="flex justify-end gap-1.5">
                      {p.active && <Btn variant="soft" size="sm" onClick={() => generate(p)}>Buat WO sekarang</Btn>}
                      <Btn variant="ghost" size="sm" icon={p.active ? Pause : Play} onClick={() => setPlans((all) => all.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)))}>{p.active ? 'Jeda' : 'Aktifkan'}</Btn>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

// ---------- laporan ----------
// Dua seri: preventive (brand) & corrective (amber); amber < 3:1 vs surface, jadi nilai selalu ditulis sebagai label
const SERIES = [['preventive', 'Preventive', 'bg-brand-600'], ['corrective', 'Corrective', 'bg-amber-500']]

function Reports({ ctx }) {
  const { wos } = ctx
  const [range, setRange] = useState(90)
  const rows = wos.filter((w) => w.created > ago(range) && w.status !== 'rejected')
  const cost = BRANCHES.map((b) => ({ b, ...Object.fromEntries(SERIES.map(([k]) => [k, rows.filter((w) => w.branch === b.id && w.type === k).reduce((a, w) => a + w.est, 0)])) }))
  const max = Math.max(1, ...cost.map((c) => c.preventive + c.corrective))
  const total = cost.reduce((a, c) => a + c.preventive + c.corrective, 0)
  const vendors = [...new Set(rows.filter((w) => w.vendor).map((w) => w.vendor))].map((v) => {
    const r = rows.filter((w) => w.vendor === v)
    const resp = r.filter((w) => w.responded).map((w) => w.responded - w.created)
    return { v, n: r.length, done: r.filter((w) => w.status === 'done').length, sla: slaPct(r), resp: resp.length ? resp.reduce((a, x) => a + x, 0) / resp.length : null }
  })
  return (
    <>
      <H1 sub="Biaya, SLA, dan performa vendor" right={<><div className="flex rounded-xl bg-slate-100 p-1">{[[30, '30 hari'], [90, '90 hari']].map(([v, l]) => <button key={v} onClick={() => setRange(v)} className={cx('rounded-lg px-3 py-1.5 text-[13px] font-semibold', range === v ? 'bg-white shadow-sm' : 'text-slate-500')}>{l}</button>)}</div><Btn variant="secondary" icon={Download}>Export</Btn></>}>Laporan</H1>
      <div className="grid grid-cols-4 gap-4">
        <Stat icon={Coins} label="Total biaya" value={rp(total)} sub={`${range} hari terakhir`} tone="bg-violet-50 text-violet-600" />
        <Stat icon={ClipboardList} label="Work order" value={rows.length} sub={`${rows.filter((w) => w.type === 'preventive').length} preventive · ${rows.filter((w) => w.type === 'corrective').length} corrective`} />
        <Stat icon={Timer} label="SLA penyelesaian" value={slaPct(rows) == null ? '—' : `${slaPct(rows)}%`} sub="dari WO selesai" tone="bg-sky-50 text-sky-600" />
        <Stat icon={Hourglass} label="Rata-rata respons" value={(() => { const r = rows.filter((w) => w.responded); return r.length ? durH(r.reduce((a, w) => a + w.responded - w.created, 0) / r.length) : '—' })()} sub="sejak WO dibuat" tone="bg-amber-50 text-amber-600" />
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold">Biaya maintenance per outlet</div>
            <div className="text-xs text-slate-500">Estimasi biaya WO, {range} hari terakhir</div>
          </div>
          <div className="flex gap-4 text-xs font-medium text-slate-600">
            {SERIES.map(([k, l, c]) => <span key={k} className="flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', c)} />{l}</span>)}
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {cost.map((c) => (
            <div key={c.b.id} className="grid grid-cols-[140px_1fr_120px] items-center gap-4">
              <div className="truncate text-[13px] font-semibold text-slate-700">{c.b.name.replace('Outlet ', '')}</div>
              <div className="flex h-5 gap-0.5">
                {SERIES.map(([k, l, col]) => c[k] > 0 && (
                  <div key={k} title={`${l}: ${rp(c[k])}`} style={{ width: `${(c[k] / max) * 100}%` }} className={cx('h-full cursor-default transition first:rounded-l last:rounded-r hover:opacity-80', col)} />
                ))}
              </div>
              <div className="text-right text-[13px] font-semibold tabular-nums text-slate-700">{rp(c.preventive + c.corrective)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHead title="Performa vendor & teknisi" sub="Histori dari work order yang ditugaskan (FR-116)" />
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70"><tr>{['Vendor / teknisi', 'Work order', 'Selesai', 'Rata-rata respons', 'SLA penyelesaian'].map((h) => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {vendors.map((x) => (
              <tr key={x.v} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={x.v} size="sm" /><span className="font-semibold">{x.v}</span></div></td>
                <td className="px-4 tabular-nums">{x.n}</td>
                <td className="px-4 tabular-nums">{x.done}</td>
                <td className="px-4 tabular-nums">{x.resp ? durH(x.resp) : '—'}</td>
                <td className="px-4">{x.sla == null ? <span className="text-slate-400">—</span> : <Pill tone={x.sla >= 90 ? 'emerald' : x.sla >= 70 ? 'amber' : 'rose'}>{x.sla}%</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

// ---------- tim ----------
function Team({ ctx }) {
  const { members, setMembers, can, flash } = ctx
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('requester')
  const [scope, setScope] = useState('Semua outlet')
  const invite = (e) => {
    e.preventDefault()
    setMembers((all) => [...all, { name: email.split('@')[0], email, role, scope, title: 'Undangan terkirim', invited: true }])
    flash(`Undangan dikirim ke ${email}`)
    setEmail('')
  }
  return (
    <>
      <H1 sub="Anggota organisasi, peran, dan cakupan outlet (FR-007, FR-091)">Tim & Akses</H1>
      {can('manage') && (
        <Card className="p-5">
          <div className="mb-3 font-bold">Undang anggota</div>
          <form onSubmit={invite} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@kopisenja.id" className={cx(inputCls, 'h-10 pl-9')} />
            </div>
            <Select value={role} onChange={setRole} className="w-48">{Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</Select>
            <Select value={scope} onChange={setScope} className="w-52"><option>Semua outlet</option>{BRANCHES.map((b) => <option key={b.id}>{b.name}</option>)}</Select>
            <Btn type="submit">Kirim undangan</Btn>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50/70"><tr>{['Anggota', 'Peran', 'Cakupan', 'Izin'].map((h) => <TH key={h}>{h}</TH>)}</tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-t border-slate-100 first:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="sm" />
                    <div><div className="font-semibold">{m.name}{m.invited && <Pill tone="amber" className="ml-2">Diundang</Pill>}</div><div className="text-[11px] text-slate-400">{m.email} · {m.title}</div></div>
                  </div>
                </td>
                <td className="px-4 font-medium">{ROLES[m.role].label}</td>
                <td className="px-4 text-slate-600">{m.scope}</td>
                <td className="px-4">
                  <div className="flex flex-wrap gap-1">
                    {ROLES[m.role].can.length ? ROLES[m.role].can.map((c) => <Pill key={c}>{({ create: 'Buat WO', manage: 'Kelola data', approve: 'Setujui biaya' })[c]}</Pill>) : <Pill>Lihat saja</Pill>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
