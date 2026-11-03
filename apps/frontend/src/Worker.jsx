import { useState } from 'react'
import { Briefcase, Wallet, Star, CheckCircle2, MapPin, CalendarDays, Navigation, Phone as PhoneIcon, Check, Plus, Clock, Power, BadgeCheck, ChevronRight, Hourglass, Landmark, TrendingUp, Camera, ListChecks, Receipt, AlertTriangle, CircleUser } from 'lucide-react'
import { useStore, useMe, FLOW, STATUS, svcOf, areaOf, rp, fmtDate, extrasTotal, unpaid, held } from './store'
import { WorkerProfile, WorkerPending } from './Profile'
import { Screen, Btn, Badge, Card, Field, Row, Sheet, Empty, PhotoInput, Thumbs, SvcIcon, Avatar, SectionTitle, Pill, inputCls, cx } from './ui'

const TABS = [
  { id: 'jobs', icon: Briefcase, label: 'Pekerjaan' },
  { id: 'earn', icon: Wallet, label: 'Pendapatan' },
  { id: 'profile', icon: CircleUser, label: 'Akun' },
]
const OFFER_SECONDS = 30

const earnOf = (b) => b.price.payout + extrasTotal(b)

export default function Worker() {
  const [tab, setTab] = useState('jobs')
  const [open, setOpen] = useState(null)
  const me = useMe('worker')
  // Mitra yang belum terverifikasi hanya melihat status pendaftarannya
  if (me.verified !== 'verified') return <WorkerPending />
  if (open) return <JobDetail id={open} onBack={() => setOpen(null)} />
  return (
    <Screen role="worker" immersive="bg-slate-900" tabs={TABS} tab={tab} onTab={setTab}>
      {(bell) => (tab === 'jobs' ? <Jobs bell={bell} onOpen={setOpen} /> : tab === 'earn' ? <Earnings bell={bell} /> : <WorkerProfile bell={bell} />)}
    </Screen>
  )
}

function Header({ bell, children }) {
  const { state, act } = useStore()
  const me = useMe('worker')
  return (
    <div className="relative overflow-hidden rounded-b-[32px] bg-slate-900 px-5 pb-6 pt-4 text-white">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <Avatar name={me.name} src={me.photo} size="md" className="ring-2 ring-white/20" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{me.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-brand-300"><BadgeCheck size={12} /> Mitra terverifikasi</div>
        </div>
        {bell}
      </div>
      <button
        onClick={() => act.toggleOnline(me.id)}
        className={cx('relative mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition', me.online ? 'bg-emerald-500/15 ring-emerald-400/30' : 'bg-white/5 ring-white/10')}
      >
        <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl', me.online ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400')}><Power size={18} /></span>
        <div className="flex-1">
          <div className="text-sm font-bold">{me.online ? 'Kamu sedang online' : 'Kamu sedang offline'}</div>
          <div className="text-[11px] text-slate-400">{me.online ? `Siap menerima job offer di ${me.areas.join(', ')}` : 'Aktifkan untuk mulai menerima pekerjaan'}</div>
        </div>
        <span className={cx('relative h-6 w-11 rounded-full transition', me.online ? 'bg-emerald-500' : 'bg-slate-600')}>
          <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', me.online ? 'left-[22px]' : 'left-0.5')} />
        </span>
      </button>
      {children}
    </div>
  )
}

function Jobs({ bell, onOpen }) {
  const { state } = useStore()
  const me = useMe('worker')
  const offers = state.bookings.filter((b) => b.offer?.workerId === me.id)
  const active = state.bookings.filter((b) => b.workerId === me.id && FLOW.includes(b.status)).sort((a, b) => a.schedule - b.schedule)
  const stats = [
    [Star, 'Rating', me.rating.toFixed(2)],
    [CheckCircle2, 'Selesai', me.jobs],
    [MapPin, 'Area', me.areas.length > 1 ? `${me.areas.length} kota` : me.areas[0]],
  ]
  return (
    <div className="pb-6">
      <Header bell={bell}>
        <div className="relative mt-3 grid grid-cols-3 gap-2">
          {stats.map(([I, l, v]) => (
            <div key={l} className="rounded-2xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><I size={11} /> {l}</div>
              <div className="mt-0.5 text-[15px] font-extrabold">{v}</div>
            </div>
          ))}
        </div>
      </Header>

      <div className="space-y-3 px-4 pt-4">
        {offers.map((b) => <OfferCard key={b.id} b={b} />)}
        <SectionTitle action={active.length > 0 && <span className="text-xs font-semibold text-slate-400">{active.length} pekerjaan</span>}>Pekerjaan aktif</SectionTitle>
        {active.length === 0 && offers.length === 0 && (
          <Card>
            <Empty icon={me.online ? Hourglass : Power} title={me.online ? 'Menunggu job offer' : 'Tidak ada pekerjaan aktif'} text={me.online ? 'Tetap online — job offer baru akan muncul di sini.' : 'Aktifkan status online untuk menerima pekerjaan.'} />
          </Card>
        )}
        {active.map((b) => {
          const svc = svcOf(b.svc)
          return (
            <Card key={b.id} onClick={() => onOpen(b.id)} className="animate-slide-up cursor-pointer space-y-3 transition hover:border-brand-300">
              <div className="flex items-start gap-3">
                <SvcIcon id={b.svc} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{svc.name}{b.rework && ' · Rework'}</div>
                  <div className="text-xs text-slate-500">{b.customer} · {b.id}</div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" /> {fmtDate(b.schedule)}</div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> <span className="truncate">{b.address}</span></div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <Badge status={b.status} />
                {b.extras.some((e) => e.status === 'pending') ? <Pill tone="amber"><Clock size={11} /> Menunggu persetujuan</Pill> : <span className="text-sm font-extrabold">{rp(earnOf(b))}</span>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Countdown({ left }) {
  const r = 22
  const c = 2 * Math.PI * r
  const urgent = left <= 10
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/15" />
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / OFFER_SECONDS)} className={cx('transition-all duration-1000 ease-linear', urgent ? 'text-rose-400' : 'text-white')} />
      </svg>
      <span className={cx('absolute inset-0 flex items-center justify-center text-base font-extrabold tabular-nums', urgent && 'text-rose-300')}>{left}</span>
    </div>
  )
}

function OfferCard({ b }) {
  const { state, now, act } = useStore()
  const me = useMe('worker')
  const svc = svcOf(b.svc)
  const left = Math.min(OFFER_SECONDS, Math.max(0, Math.ceil((b.offer.expiresAt - now) / 1000)))
  return (
    <div className="animate-pop overflow-hidden rounded-3xl bg-white shadow-lift ring-2 ring-brand-500">
      <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-white">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Job offer baru
          </div>
          <div className="text-2xl font-extrabold">{rp(b.price.payout)}</div>
          <div className="text-[11px] text-brand-100">Pendapatan bersih kamu</div>
        </div>
        <Countdown left={left} />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <SvcIcon id={b.svc} size="lg" />
          <div>
            <div className="text-sm font-bold">{svc.name}{svc.param && ` · ${b.qty} ${svc.param.unit}`}</div>
            <div className="text-xs text-slate-500">{b.customer}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400"><Navigation size={11} /> Jarak</div>
            <div className="mt-0.5 font-bold">{me.dist[b.area]} km · {areaOf(b.area).name}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400"><CalendarDays size={11} /> Jadwal</div>
            <div className="mt-0.5 font-bold">{fmtDate(b.schedule)}</div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 p-3 text-[13px] text-slate-600">“{b.detail}”</div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="lg" className="flex-1" onClick={() => act.decline(b.id, me.id, 'ditolak')}>Tolak</Btn>
          <Btn size="lg" className="flex-[2]" icon={Check} onClick={() => act.accept(b.id, me.id, 'Worker')}>Terima pekerjaan</Btn>
        </div>
      </div>
    </div>
  )
}

function Earnings({ bell }) {
  const { state } = useStore()
  const me = useMe('worker')
  const done = state.bookings.filter((b) => b.workerId === me.id && ['completed', 'disputed'].includes(b.status))
  const total = unpaid(state, me.id).reduce((s, b) => s + earnOf(b), 0)
  const onHold = held(state, me.id).reduce((s, b) => s + earnOf(b), 0)
  const extras = done.reduce((s, b) => s + extrasTotal(b), 0)
  const payouts = state.payouts.filter((p) => p.workerId === me.id)
  return (
    <div className="pb-6">
      <div className="relative overflow-hidden rounded-b-[32px] bg-slate-900 px-5 pb-6 pt-4 text-white">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <span className="font-bold">Pendapatan</span>
          {bell}
        </div>
        <div className="relative mt-4 text-xs text-slate-400">Saldo menunggu payout</div>
        <div className="relative text-3xl font-extrabold tracking-tight">{rp(total)}</div>
        <div className="relative mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[11px] text-slate-300 ring-1 ring-white/10">
          <Landmark size={14} className="text-brand-300" /> Payout otomatis setiap Senin ke BCA •••• 4321
        </div>
        {onHold > 0 && (
          <div className="relative mt-2 flex items-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-[11px] text-rose-200 ring-1 ring-rose-400/30">
            <AlertTriangle size={14} /> {rp(onHold)} ditahan sampai komplain diselesaikan
          </div>
        )}
      </div>
      <div className="space-y-3 px-4 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Card className="!p-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400"><Briefcase size={12} /> Pekerjaan</div>
            <div className="mt-1 text-lg font-extrabold">{done.length}</div>
          </Card>
          <Card className="!p-3">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400"><TrendingUp size={12} /> Biaya tambahan</div>
            <div className="mt-1 text-lg font-extrabold">{rp(extras)}</div>
          </Card>
        </div>
        <SectionTitle>Riwayat pekerjaan</SectionTitle>
        {done.length === 0 && <Card><Empty icon={Receipt} title="Belum ada pekerjaan selesai" /></Card>}
        {done.map((b) => (
          <Card key={b.id} className="flex items-center gap-3 !p-3.5">
            <SvcIcon id={b.svc} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{svcOf(b.svc).name}</div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                {b.id} · {fmtDate(b.schedule)}
                {b.rating && <><span>·</span><Star size={10} className="fill-amber-400 text-amber-400" />{b.rating}</>}
              </div>
            </div>
            <div className="text-right">
              <div className={cx('text-sm font-extrabold', b.status === 'disputed' ? 'text-slate-400' : 'text-emerald-600')}>+{rp(earnOf(b))}</div>
              <div className="text-[10px] text-slate-400">{b.status === 'disputed' ? 'ditahan' : b.paidOut ? `dibayar · ${b.paidOut}` : 'menunggu payout'}</div>
            </div>
          </Card>
        ))}
        {payouts.length > 0 && <SectionTitle>Riwayat payout</SectionTitle>}
        {payouts.map((p) => (
          <Card key={p.id} className="flex items-center gap-3 !p-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Landmark size={16} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{p.id} · {p.count} pekerjaan</div>
              <div className="text-[11px] text-slate-500">{fmtDate(p.t)} · ref {p.ref}</div>
            </div>
            <div className="text-sm font-extrabold">{rp(p.amount)}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const NEXT = {
  assigned: ['on_the_way', 'Mulai perjalanan', Navigation],
  on_the_way: ['arrived', 'Saya sudah tiba', MapPin],
  arrived: ['in_progress', 'Mulai pekerjaan', Briefcase],
  in_progress: ['waiting_confirmation', 'Selesaikan pekerjaan', CheckCircle2],
}
const SHORT = { assigned: 'Diterima', on_the_way: 'Jalan', arrived: 'Tiba', in_progress: 'Kerja', waiting_confirmation: 'Selesai' }

function JobDetail({ id, onBack }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const svc = svcOf(b.svc)
  const [before, setBefore] = useState(b.beforePhotos || [])
  const [after, setAfter] = useState([])
  const [checks, setChecks] = useState([])
  const [extraOpen, setExtraOpen] = useState(false)
  const step = NEXT[b.status]
  const idx = ['completed', 'disputed'].includes(b.status) ? FLOW.length : FLOW.indexOf(b.status)
  const working = ['arrived', 'in_progress'].includes(b.status)

  let block = null
  if (b.status === 'arrived' && !before.length) block = 'Unggah foto kondisi sebelum pekerjaan'
  if (b.status === 'in_progress') {
    if (b.extras.some((e) => e.status === 'pending')) block = 'Menunggu customer menyetujui biaya tambahan'
    else if (checks.length < svc.checklist.length) block = `Lengkapi checklist (${checks.length}/${svc.checklist.length})`
    else if (!after.length) block = 'Unggah foto hasil pekerjaan'
  }

  const footer = step ? (
    <div className="space-y-2">
      {block && <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700"><AlertTriangle size={13} /> {block}</div>}
      <Btn size="lg" icon={step[2]} className="w-full" disabled={!!block} onClick={() => act.advance(b.id, step[0], 'Worker', { beforePhotos: before, afterPhotos: after })}>{step[1]}</Btn>
    </div>
  ) : b.status === 'waiting_confirmation' ? (
    <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500"><Hourglass size={16} /> Menunggu konfirmasi customer…</div>
  ) : null

  return (
    <Screen role="worker" title={`${svc.name}${b.rework ? ' · Rework' : ''}`} subtitle={b.id} onBack={onBack} footer={footer} right={<Badge status={b.status} className="mr-1" />}>
      <Card className="!px-3 !py-3.5">
        <div className="flex items-start">
          {FLOW.map((s, i) => (
            <div key={s} className="relative flex flex-1 flex-col items-center gap-1.5">
              {i > 0 && <span className={cx('absolute right-1/2 top-[11px] h-0.5 w-full', i <= idx ? 'bg-brand-500' : 'bg-slate-200')} />}
              <span className={cx('relative flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold', i < idx ? 'bg-brand-500 text-white' : i === idx ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-400')}>
                {i < idx ? <Check size={12} strokeWidth={3.5} /> : i + 1}
              </span>
              <span className={cx('text-[10px] font-semibold', i === idx ? 'text-brand-700' : 'text-slate-400')}>{SHORT[s]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar name={b.customer} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{b.customer}</div>
            <div className="text-xs text-slate-500">{fmtDate(b.schedule)}</div>
          </div>
        </div>
        <div className="flex gap-2.5 rounded-xl bg-slate-50 p-3 text-[13px] text-slate-700"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />{b.address}</div>
        <div className="flex gap-2">
          <Btn variant="soft" icon={Navigation} className="flex-1">Buka Maps</Btn>
          <Btn variant="soft" icon={PhoneIcon} className="flex-1">Hubungi</Btn>
        </div>
      </Card>

      <Card className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <SvcIcon id={b.svc} size="sm" />
          <span className="text-sm font-bold">{svc.name}{svc.param && ` · ${b.qty} ${svc.param.unit}`}</span>
        </div>
        <div className="text-[13px] text-slate-600">“{b.detail}”</div>
        <Thumbs urls={b.photos} />
      </Card>

      {working && (
        <Card className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold"><Camera size={16} className="text-slate-400" /> Foto sebelum</span>
            {(b.status === 'arrived' ? before : b.beforePhotos)?.length > 0 && <CheckCircle2 size={18} className="text-emerald-500" />}
          </div>
          {b.status === 'arrived' ? <PhotoInput value={before} onChange={setBefore} label="Sebelum" /> : <Thumbs urls={b.beforePhotos} />}
        </Card>
      )}

      {b.status === 'in_progress' && (
        <>
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold"><ListChecks size={16} className="text-slate-400" /> Checklist {svc.name}</span>
              <span className="text-xs font-bold text-slate-400">{checks.length}/{svc.checklist.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(checks.length / svc.checklist.length) * 100}%` }} /></div>
            {svc.checklist.map((c) => {
              const on = checks.includes(c)
              return (
                <button key={c} onClick={() => setChecks(on ? checks.filter((x) => x !== c) : [...checks, c])} className={cx('flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[13px] transition hover:bg-slate-50', on && 'text-slate-400 line-through')}>
                  <span className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>{on && <Check size={12} strokeWidth={3.5} />}</span>
                  {c}
                </button>
              )
            })}
          </Card>
          <Card className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold"><Camera size={16} className="text-slate-400" /> Foto hasil pekerjaan</span>
              {after.length > 0 && <CheckCircle2 size={18} className="text-emerald-500" />}
            </div>
            <PhotoInput value={after} onChange={setAfter} label="Sesudah" />
          </Card>
        </>
      )}

      {(working || b.extras.length > 0) && (
        <Card className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold"><Receipt size={16} className="text-slate-400" /> Biaya tambahan</div>
          {b.extras.length === 0 && <div className="text-xs text-slate-400">Ajukan jika butuh material/part di luar lingkup awal. Customer wajib menyetujui.</div>}
          {b.extras.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
              <div>
                <div className="font-semibold">{e.item}</div>
                <div className="text-xs text-slate-500">{rp(e.amount)}</div>
              </div>
              <Pill tone={{ pending: 'amber', approved: 'emerald', rejected: 'rose' }[e.status]} dot>{{ pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }[e.status]}</Pill>
            </div>
          ))}
          {working && <Btn variant="secondary" icon={Plus} className="w-full" onClick={() => setExtraOpen(true)}>Ajukan biaya tambahan</Btn>}
        </Card>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-white">
        <span className="text-xs text-slate-400">Pendapatan dari pekerjaan ini</span>
        <span className="text-lg font-extrabold">{rp(earnOf(b))}</span>
      </div>

      <ExtraSheet open={extraOpen} b={b} onClose={() => setExtraOpen(false)} />
    </Screen>
  )
}

const EXTRA_PRESETS = [
  ['Isi freon R32', 150000, 'Tekanan freon rendah, perlu isi ulang'],
  ['Ganti kapasitor', 85000, 'Kapasitor kembung, kompresor tidak mau start'],
]

function ExtraSheet({ open, b, onClose }) {
  const { act } = useStore()
  const [f, setF] = useState({ item: '', amount: '', reason: '', photos: [] })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const valid = f.item.trim() && Number(f.amount) > 0 && f.reason.trim().length >= 5
  const submit = () => {
    act.requestExtra(b.id, { item: f.item, amount: Number(f.amount), reason: f.reason, photos: f.photos })
    setF({ item: '', amount: '', reason: '', photos: [] })
    onClose()
  }
  return (
    <Sheet open={open} title="Ajukan biaya tambahan" subtitle="Customer harus menyetujui sebelum pekerjaan bisa diselesaikan" onClose={onClose}>
      {b.svc === 'ac' && (
        <div className="flex flex-wrap gap-1.5">
          {EXTRA_PRESETS.map(([item, amount, reason]) => (
            <button key={item} onClick={() => setF((p) => ({ ...p, item, amount: String(amount), reason }))} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-700">
              {item}
            </button>
          ))}
        </div>
      )}
      <Field label="Item / pekerjaan"><input className={inputCls} value={f.item} onChange={(e) => set('item', e.target.value)} placeholder="Contoh: Ganti kapasitor" /></Field>
      <Field label="Nominal">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
          <input type="number" className={cx(inputCls, 'pl-10')} value={f.amount} onChange={(e) => set('amount', e.target.value)} placeholder="85000" />
        </div>
      </Field>
      <Field label="Alasan"><textarea rows={2} className={cx(inputCls, 'resize-none')} value={f.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Jelaskan kenapa dibutuhkan" /></Field>
      <Field label="Bukti foto"><PhotoInput value={f.photos} onChange={(v) => set('photos', v)} /></Field>
      <Btn size="lg" className="w-full" disabled={!valid} onClick={submit}>Kirim ke customer</Btn>
    </Sheet>
  )
}
