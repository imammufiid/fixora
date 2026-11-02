import { useState } from 'react'
import {
  Home as HomeIcon, ClipboardList, MapPin, ChevronDown, ChevronRight, Search, ShieldCheck, BadgeCheck, Wallet, Sparkles, Clock, CalendarDays,
  QrCode, Landmark, Minus, Plus, Check, MessageCircle, Phone as PhoneIcon, Star, AlertTriangle, CircleCheck, Info, Bike, House, Receipt, History, FileText, XCircle, CircleUser, RotateCcw,
} from 'lucide-react'
import { useStore, useMe, SERVICES, AREAS, svcOf, areaOf, resolvePrice, calcPrice, rp, fmtDate, fmtTime, dayAt, STATUS, ACTIVE, totalOf } from './store'
import { CustomerProfile } from './Profile'
import { Screen, Btn, Badge, Card, Field, Row, Sheet, Segment, Empty, Spinner, PhotoInput, Thumbs, Stars, SvcIcon, Avatar, SectionTitle, Pill, inputCls, cx } from './ui'

const TABS = [
  { id: 'home', icon: HomeIcon, label: 'Beranda' },
  { id: 'orders', icon: ClipboardList, label: 'Pesanan' },
  { id: 'profile', icon: CircleUser, label: 'Akun' },
]

// Tahapan yang terlihat oleh customer
const TRACK = [
  ['searching', 'Dicari'],
  ['assigned', 'Ditugaskan'],
  ['on_the_way', 'Menuju'],
  ['in_progress', 'Dikerjakan'],
  ['waiting_confirmation', 'Selesai'],
]
const trackIdx = (s) => (s === 'arrived' ? 2 : s === 'completed' ? 5 : TRACK.findIndex(([k]) => k === s))

export default function Customer() {
  const [tab, setTab] = useState('home')
  const [screen, setScreen] = useState(null)
  const [area, setArea] = useState('kby')
  const open = (id) => setScreen({ name: 'detail', id })

  if (screen?.name === 'book') return <BookingFlow svcId={screen.svc} area={screen.prefill?.area || area} prefill={screen.prefill} onBack={() => setScreen(null)} onDone={open} />
  if (screen?.name === 'detail') return <BookingDetail id={screen.id} onBack={() => { setScreen(null); setTab('orders') }} onRebook={(b) => setScreen({ name: 'book', svc: b.svc, prefill: b })} />
  if (tab === 'orders')
    return (
      <Screen role="customer" title="Pesanan Saya" tabs={TABS} tab={tab} onTab={setTab}>
        <Orders onOpen={open} />
      </Screen>
    )
  if (tab === 'profile')
    return (
      <Screen role="customer" immersive="bg-brand-700" tabs={TABS} tab={tab} onTab={setTab}>
        {(bell) => <CustomerProfile bell={bell} />}
      </Screen>
    )
  return (
    <Screen role="customer" immersive="bg-brand-700" tabs={TABS} tab={tab} onTab={setTab}>
      {(bell) => <Home area={area} setArea={setArea} bell={bell} onBook={(svc) => setScreen({ name: 'book', svc })} onOpen={open} />}
    </Screen>
  )
}

function Home({ area, setArea, bell, onBook, onOpen }) {
  const { state } = useStore()
  const me = useMe('customer')
  const active = state.bookings.filter((b) => b.customer === me.name && ACTIVE.includes(b.status))
  const a = areaOf(area)
  return (
    <div className="pb-6">
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-brand-700 to-brand-600 px-5 pb-20 pt-4 text-white">
        <div className="pointer-events-none absolute -right-16 -top-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-brand-400/20" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={me.name} size="md" className="!bg-white/20 !text-white ring-2 ring-white/30" />
            <div>
              <div className="text-xs text-brand-100">Selamat datang kembali</div>
              <div className="font-bold">Halo, {me.name.split(' ')[0]} 👋</div>
            </div>
          </div>
          {bell}
        </div>
        <label className="relative mt-5 flex cursor-pointer items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 ring-1 ring-white/15 transition hover:bg-white/15">
          <MapPin size={18} className="text-brand-200" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">Lokasi layanan</div>
            <div className="truncate text-sm font-semibold">{a.name}, {a.city}</div>
          </div>
          <ChevronDown size={18} className="text-brand-200" />
          <select value={area} onChange={(e) => setArea(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
            {AREAS.map((x) => <option key={x.id} value={x.id}>{x.name}, {x.city}</option>)}
          </select>
        </label>
      </div>

      <div className="relative -mt-14 space-y-5 px-4">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-sm text-slate-400 shadow-lift">
          <Search size={18} />
          Cari layanan, mis. “AC tidak dingin”
        </div>

        {active.map((b) => <ActiveCard key={b.id} b={b} onOpen={onOpen} />)}

        <div>
          <SectionTitle>Butuh perbaikan apa?</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {SERVICES.map((s) => {
              const off = state.svcOff.includes(s.id)
              const rule = !off && resolvePrice(state.prices, s.id, area)
              return (
                <button
                  key={s.id}
                  disabled={!rule}
                  onClick={() => onBook(s.id)}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-3.5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift disabled:translate-y-0 disabled:opacity-55 disabled:hover:border-slate-200/70 disabled:hover:shadow-soft"
                >
                  <SvcIcon id={s.id} size="lg" />
                  <div className="mt-3 text-sm font-bold">{s.name}</div>
                  <div className="mt-0.5 line-clamp-2 h-8 text-[11px] leading-4 text-slate-500">{s.desc}</div>
                  <div className={cx('mt-2.5 text-xs font-bold', rule ? 'text-brand-700' : 'text-slate-400')}>
                    {rule ? <>Mulai {rp(rule.price)}</> : off ? 'Sementara tidak tersedia' : 'Belum tersedia di area ini'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-4 text-white">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-500/30 blur-xl" />
          <Pill tone="brand" className="!bg-brand-500/20 !text-brand-200 !ring-brand-400/30">
            <Sparkles size={11} /> Garansi Fixora
          </Pill>
          <div className="mt-2 text-[15px] font-bold leading-snug">Hasil kurang memuaskan? Rework gratis dalam 7 hari.</div>
          <div className="mt-1 text-xs text-slate-400">Berlaku untuk semua layanan di area pilot Jakarta Selatan.</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            [BadgeCheck, 'Teknisi terverifikasi'],
            [Receipt, 'Harga transparan'],
            [ShieldCheck, 'Pembayaran aman'],
          ].map(([I, t]) => (
            <div key={t} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center shadow-soft">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><I size={18} /></span>
              <span className="text-[11px] font-semibold leading-tight text-slate-600">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActiveCard({ b, onOpen }) {
  const { state } = useStore()
  const svc = svcOf(b.svc)
  const w = state.workers.find((x) => x.id === b.workerId)
  const idx = trackIdx(b.status)
  const needsAction = b.status === 'waiting_confirmation' || b.extras.some((e) => e.status === 'pending')
  return (
    <button onClick={() => onOpen(b.id)} className="w-full animate-slide-up rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-lift transition hover:border-brand-300">
      <div className="flex items-center gap-3">
        <SvcIcon id={b.svc} solid />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            PESANAN AKTIF · {b.id}
            {needsAction && <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />}
          </div>
          <div className="truncate text-sm font-bold">{svc.name}{b.rework && ' · Rework'}</div>
        </div>
        <ChevronRight size={18} className="text-slate-300" />
      </div>
      <div className="mt-3 flex gap-1">
        {TRACK.map(([k], i) => <div key={k} className={cx('h-1.5 flex-1 rounded-full', i < idx ? 'bg-brand-500' : i === idx ? 'bg-brand-300' : 'bg-slate-100')} />)}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-brand-700">{needsAction ? 'Butuh tindakanmu' : STATUS[b.status][0]}</span>
        <span className="text-slate-500">{w ? w.name : fmtDate(b.schedule)}</span>
      </div>
    </button>
  )
}

function Orders({ onOpen }) {
  const { state } = useStore()
  const me = useMe('customer')
  const [f, setF] = useState('active')
  const list = state.bookings.filter((b) => b.customer === me.name && (f === 'active') === ACTIVE.includes(b.status))
  return (
    <>
      <Segment value={f} onChange={setF} options={[['active', 'Aktif'], ['history', 'Riwayat']]} />
      {list.length === 0 && <Empty icon={ClipboardList} title="Belum ada pesanan" text={f === 'active' ? 'Pesanan yang sedang berjalan akan muncul di sini.' : 'Riwayat pesananmu akan muncul di sini.'} />}
      {list.map((b) => (
        <Card key={b.id} onClick={() => onOpen(b.id)} className="animate-slide-up cursor-pointer space-y-3 transition hover:border-brand-300">
          <div className="flex items-start gap-3">
            <SvcIcon id={b.svc} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{svcOf(b.svc).name}{b.rework && ' (Rework)'}</div>
              <div className="mt-0.5 text-xs text-slate-500">{b.id} · {fmtDate(b.schedule)}</div>
            </div>
            <Badge status={b.status} />
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-sm">
            <span className="text-slate-500">Total pembayaran</span>
            <span className="font-bold">{rp(totalOf(b))}</span>
          </div>
        </Card>
      ))}
    </>
  )
}

const SLOTS = [8, 10, 13, 15, 17]
const METHODS = [
  ['QRIS', QrCode, 'Scan dari aplikasi bank/e-wallet'],
  ['Virtual Account BCA', Landmark, 'Transfer via m-BCA atau ATM'],
  ['GoPay', Wallet, 'Saldo GoPay terhubung'],
]
const STEP_LABEL = ['Detail', 'Jadwal', 'Bayar']

function BookingFlow({ svcId, area, prefill, onBack, onDone }) {
  const { state, now, act } = useStore()
  const me = useMe('customer')
  const svc = svcOf(svcId)
  const [step, setStep] = useState(1)
  const [touched, setTouched] = useState(false)
  const [paying, setPaying] = useState(null)
  // Repeat booking: salin alamat, detail, dan jumlah unit dari pesanan sebelumnya (FR-040)
  const [f, setF] = useState({ address: prefill?.address || me.address || '', detail: prefill?.detail || '', qty: prefill?.qty || 1, photos: [], day: null, slot: null, method: null })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const price = calcPrice(resolvePrice(state.prices, svcId, area), svcId, f.qty)
  const total = price.base + price.fee
  const errors = {
    address: f.address.trim().length < 10 && 'Alamat terlalu singkat',
    detail: f.detail.trim().length < 10 && 'Ceritakan masalahnya minimal 10 karakter',
    schedule: (f.day === null || f.slot === null) && 'Pilih tanggal dan jam kedatangan',
    method: !f.method && 'Pilih metode pembayaran',
  }
  const valid = { 1: !errors.address && !errors.detail, 2: !errors.schedule, 3: !errors.method }[step]

  const next = () => {
    if (!valid) return setTouched(true)
    setTouched(false)
    if (step < 3) return setStep(step + 1)
    setPaying('processing')
    setTimeout(() => setPaying('success'), 1400)
    setTimeout(() => {
      onDone(act.book({ customer: me.name, svc: svcId, area, qty: f.qty, address: f.address, detail: f.detail, photos: f.photos, schedule: dayAt(f.day, f.slot), payMethod: f.method, price }))
    }, 2400)
  }
  const slotFull = (d, h) => (d === 0 && h <= new Date(now).getHours() + 1) || (d + h) % 4 === 1

  return (
    <Screen
      role="customer"
      title={svc.name}
      subtitle={`Langkah ${step} dari 3 · ${['Detail pekerjaan', 'Pilih jadwal', 'Ringkasan & pembayaran'][step - 1]}`}
      onBack={step === 1 ? onBack : () => setStep(step - 1)}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[11px] font-medium text-slate-500">Total estimasi</div>
            <div className="text-lg font-extrabold leading-tight">{rp(total)}</div>
          </div>
          <Btn size="lg" onClick={next} className="flex-[1.3]">{step < 3 ? 'Lanjut' : 'Bayar sekarang'}</Btn>
        </div>
      }
    >
      <div className="flex items-center gap-2 px-1 pb-1">
        {STEP_LABEL.map((l, i) => (
          <div key={l} className="flex flex-1 items-center gap-2">
            <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition', i + 1 < step ? 'bg-brand-600 text-white' : i + 1 === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-200 text-slate-500')}>
              {i + 1 < step ? <Check size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={cx('text-xs font-semibold', i + 1 <= step ? 'text-slate-900' : 'text-slate-400')}>{l}</span>
            {i < 2 && <span className={cx('h-0.5 flex-1 rounded-full', i + 1 < step ? 'bg-brand-500' : 'bg-slate-200')} />}
          </div>
        ))}
      </div>

      <div key={step} className="animate-slide-left space-y-4">
        {step === 1 && (
          <>
            <Card className="flex items-center gap-3 !p-3">
              <SvcIcon id={svc.id} size="lg" />
              <div className="flex-1">
                <div className="text-sm font-bold">{svc.name}</div>
                <div className="text-xs text-slate-500">{svc.desc}</div>
              </div>
            </Card>
            <Field label="Alamat lengkap" error={touched && errors.address}>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea rows={2} className={cx(inputCls, 'resize-none pl-9')} value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Nama jalan, nomor rumah, patokan" />
              </div>
            </Field>
            <Field label="Ceritakan masalahnya" error={touched && errors.detail} hint={`${f.detail.length}/300 karakter`}>
              <textarea rows={3} maxLength={300} className={cx(inputCls, 'resize-none')} value={f.detail} onChange={(e) => set('detail', e.target.value)} placeholder="Contoh: AC tidak dingin dan meneteskan air" />
            </Field>
            {svc.param && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                <div>
                  <div className="text-[13px] font-semibold">{svc.param.label}</div>
                  <div className="text-[11px] text-slate-400">Maks. {svc.param.max} {svc.param.unit}</div>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                  <button disabled={f.qty <= 1} onClick={() => set('qty', f.qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm disabled:text-slate-300 disabled:shadow-none"><Minus size={16} /></button>
                  <span className="w-14 text-center text-sm font-bold">{f.qty} {svc.param.unit}</span>
                  <button disabled={f.qty >= svc.param.max} onClick={() => set('qty', f.qty + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm disabled:text-slate-300 disabled:shadow-none"><Plus size={16} /></button>
                </div>
              </div>
            )}
            <Field label="Foto kondisi (opsional)" hint="Membantu teknisi menyiapkan alat & material">
              <PhotoInput value={f.photos} onChange={(v) => set('photos', v)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold"><CalendarDays size={16} className="text-brand-600" /> Tanggal kedatangan</div>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
                {[0, 1, 2, 3, 4].map((d) => {
                  const t = new Date(dayAt(d, 0))
                  const on = f.day === d
                  return (
                    <button key={d} onClick={() => setF((p) => ({ ...p, day: d, slot: null }))} className={cx('w-[60px] shrink-0 rounded-2xl border py-2.5 text-center transition', on ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'border-slate-200 bg-white hover:border-brand-300')}>
                      <div className={cx('text-[10px] font-semibold', on ? 'text-brand-100' : 'text-slate-400')}>{d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : t.toLocaleDateString('id-ID', { weekday: 'short' })}</div>
                      <div className="text-lg font-extrabold leading-tight">{t.getDate()}</div>
                      <div className={cx('text-[10px]', on ? 'text-brand-100' : 'text-slate-400')}>{t.toLocaleDateString('id-ID', { month: 'short' })}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            {f.day !== null && (
              <div className="animate-fade-in">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold"><Clock size={16} className="text-brand-600" /> Jam kedatangan</div>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((h) => {
                    const full = slotFull(f.day, h)
                    const on = f.slot === h
                    return (
                      <button key={h} disabled={full} onClick={() => set('slot', h)} className={cx('rounded-xl border py-2.5 text-sm font-bold transition disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300', on ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/30' : 'border-slate-200 bg-white hover:border-brand-300')}>
                        {String(h).padStart(2, '0')}:00
                        <div className="text-[10px] font-medium">{full ? 'Penuh' : `s.d. ${String(h + 2).padStart(2, '0')}:00`}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {touched && errors.schedule && <div className="text-xs font-medium text-rose-600">{errors.schedule}</div>}
            <div className="flex gap-2.5 rounded-2xl bg-sky-50 p-3 text-xs text-sky-800">
              <Info size={16} className="shrink-0" />
              Teknisi akan tiba dalam rentang 2 jam dari waktu yang dipilih. Kamu akan menerima notifikasi saat teknisi berangkat.
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Card className="space-y-3">
              <div className="flex items-center gap-3">
                <SvcIcon id={svc.id} size="sm" />
                <span className="text-sm font-bold">{svc.name}{svc.param && ` · ${f.qty} ${svc.param.unit}`}</span>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                <div className="flex gap-2.5"><CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />{fmtDate(dayAt(f.day, f.slot))}</div>
                <div className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" /><span className="line-clamp-2">{f.address}</span></div>
              </div>
            </Card>
            <Card className="space-y-2.5">
              <div className="text-sm font-bold">Rincian biaya</div>
              <Row label={`${svc.name}${svc.param ? ` × ${f.qty} ${svc.param.unit}` : ''}`}>{rp(price.base)}</Row>
              <Row label="Biaya layanan">{rp(price.fee)}</Row>
              <Row label={<span className="font-bold text-slate-900">Total</span>} className="border-t border-dashed border-slate-200 pt-2.5">
                <span className="text-base font-extrabold text-brand-700">{rp(total)}</span>
              </Row>
              <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">
                Harga {price.level === 'zone' ? 'zona' : 'kota'} {price.region}. Biaya tambahan (material/part) hanya berlaku setelah kamu setujui di aplikasi.
              </div>
            </Card>
            <div className="space-y-2">
              <div className="text-[13px] font-semibold">Metode pembayaran</div>
              {METHODS.map(([m, I, d]) => {
                const on = f.method === m
                return (
                  <button key={m} onClick={() => set('method', m)} className={cx('flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition', on ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300')}>
                    <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}><I size={20} /></span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{m}</div>
                      <div className="text-[11px] text-slate-500">{d}</div>
                    </div>
                    <span className={cx('flex h-5 w-5 items-center justify-center rounded-full border-2', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>{on && <Check size={12} strokeWidth={3} />}</span>
                  </button>
                )
              })}
            </div>
            {touched && errors.method && <div className="text-xs font-medium text-rose-600">{errors.method}</div>}
            <div className="flex gap-2.5 text-[11px] text-slate-500">
              <ShieldCheck size={16} className="shrink-0 text-brand-600" />
              Pembatalan gratis sebelum teknisi ditugaskan. Setelah itu dikenakan biaya {rp(25000)}.
            </div>
          </>
        )}
      </div>

      {paying && (
        <div className="absolute inset-0 z-50 flex animate-fade-in flex-col items-center justify-center gap-4 bg-white px-8 text-center">
          {paying === 'processing' ? (
            <>
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-brand-100" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Spinner size={30} /></span>
              </div>
              <div>
                <div className="font-bold">Memproses pembayaran</div>
                <div className="mt-1 text-sm text-slate-500">via {f.method} · {rp(total)}</div>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"><Check size={40} strokeWidth={3} /></span>
              <div className="animate-slide-up">
                <div className="text-lg font-extrabold">Pembayaran berhasil</div>
                <div className="mt-1 text-sm text-slate-500">Kami sedang mencarikan teknisi terbaik di sekitarmu.</div>
              </div>
            </>
          )}
        </div>
      )}
    </Screen>
  )
}

function StatusHero({ b, w }) {
  const svc = svcOf(b.svc)
  const idx = trackIdx(b.status)
  const showTrack = ACTIVE.includes(b.status)

  const msg = {
    searching: b.needsAdmin ? ['Tim kami sedang membantu', 'Belum ada teknisi tersedia. Tim operasional mencarikan secara manual.'] : ['Mencari teknisi terbaik', 'Mencocokkan keahlian, jarak, dan rating di sekitarmu…'],
    assigned: ['Teknisi ditugaskan', `${w?.name} akan datang ${fmtDate(b.schedule)}`],
    on_the_way: ['Teknisi dalam perjalanan', 'Estimasi tiba dalam 15 menit'],
    arrived: ['Teknisi sudah tiba', 'Teknisi sedang memeriksa kondisi di lokasi'],
    in_progress: ['Pekerjaan berlangsung', `${w?.name} sedang mengerjakan ${svc.name}`],
    waiting_confirmation: ['Pekerjaan selesai', 'Periksa hasilnya lalu konfirmasi di bawah.'],
    completed: ['Pesanan selesai', b.refund ? `Refund ${rp(b.refund)} diproses ke metode pembayaranmu.` : 'Terima kasih! Garansi berlaku 7 hari.'],
    cancelled: ['Pesanan dibatalkan', b.refund ? `Refund ${rp(b.refund)} diproses dalam 1–3 hari kerja.` : 'Pesanan ini telah dibatalkan.'],
    disputed: ['Komplain ditinjau', 'Tim kami akan merespons maksimal 2×24 jam.'],
  }[b.status]

  return (
    <Card className="overflow-hidden !p-0">
      {b.status === 'on_the_way' ? (
        <RouteMap />
      ) : b.status === 'searching' && !b.needsAdmin ? (
        <div className="flex h-36 items-center justify-center bg-gradient-to-b from-brand-50 to-white">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 animate-ping-slow rounded-full bg-brand-200/60" />
            <span className="absolute inset-3 animate-ping-slow rounded-full bg-brand-200/80 [animation-delay:0.6s]" />
            <SvcIcon id={b.svc} size="xl" solid className="relative shadow-lg" />
          </div>
        </div>
      ) : null}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">{msg[0]}</div>
            <div className="mt-0.5 text-[13px] text-slate-500">{msg[1]}</div>
          </div>
          {b.status === 'completed' && <CircleCheck className="shrink-0 text-emerald-500" size={28} />}
          {b.status === 'cancelled' && <XCircle className="shrink-0 text-slate-400" size={28} />}
          {b.status === 'disputed' && <AlertTriangle className="shrink-0 text-rose-500" size={26} />}
        </div>
        {showTrack && (
          <div className="flex items-start pt-1">
            {TRACK.map(([k, l], i) => (
              <div key={k} className="relative flex flex-1 flex-col items-center gap-1.5">
                {i > 0 && <span className={cx('absolute right-1/2 top-[9px] h-0.5 w-full', i <= idx ? 'bg-brand-500' : 'bg-slate-200')} />}
                <span className={cx('relative flex h-5 w-5 items-center justify-center rounded-full text-white transition', i < idx ? 'bg-brand-500' : i === idx ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-slate-200')}>
                  {i < idx ? <Check size={11} strokeWidth={3.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className={cx('text-[10px] font-semibold', i === idx ? 'text-brand-700' : i < idx ? 'text-slate-600' : 'text-slate-400')}>{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function RouteMap() {
  const route = 'M 40 118 C 90 118, 90 60, 150 62 S 230 100, 296 38'
  return (
    <div className="relative h-[150px] w-full overflow-hidden bg-[#eef3ef]">
      <svg width="100%" height="150" className="absolute inset-0">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#dfe7e1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="150" fill="url(#grid)" />
        <path d="M -10 90 L 350 70" stroke="#fff" strokeWidth="14" />
        <path d="M 120 -10 L 180 160" stroke="#fff" strokeWidth="10" />
        <path d="M 250 -10 L 230 160" stroke="#fff" strokeWidth="8" />
        <rect x="18" y="12" width="70" height="44" rx="8" fill="#d6ead9" />
        <rect x="200" y="100" width="80" height="40" rx="8" fill="#d6ead9" />
        <path d={route} fill="none" stroke="#0b8877" strokeOpacity="0.25" strokeWidth="9" strokeLinecap="round" />
        <path d={route} fill="none" stroke="#0b8877" strokeWidth="3.5" strokeDasharray="1 8" strokeLinecap="round" />
      </svg>
      <span className="absolute left-[296px] top-[38px] -translate-x-1/2 -translate-y-full">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-white"><House size={16} /></span>
      </span>
      <span className="absolute left-0 top-0 animate-ride" style={{ offsetPath: `path('${route}')`, offsetRotate: '0deg' }}>
        <span className="flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white"><Bike size={17} /></span>
      </span>
      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">± 15 mnt · 2,3 km</span>
    </div>
  )
}

function BookingDetail({ id, onBack, onRebook }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const svc = svcOf(b.svc)
  const w = state.workers.find((x) => x.id === b.workerId)
  const [sheet, setSheet] = useState(null)
  const canCancel = ['searching', 'assigned'].includes(b.status)
  const canRebook = ['completed', 'cancelled'].includes(b.status) && !state.svcOff.includes(b.svc) && resolvePrice(state.prices, b.svc, b.area)
  const pending = b.extras.filter((e) => e.status === 'pending')

  return (
    <Screen role="customer" title={svc.name} subtitle={`${b.id} · ${fmtDate(b.schedule)}`} onBack={onBack} right={<Badge status={b.status} className="mr-1" />}>
      <StatusHero b={b} w={w} />

      {w && (
        <Card className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={w.name} size="lg" />
            <BadgeCheck size={18} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white fill-brand-500 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{w.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Star size={12} className="fill-amber-400 text-amber-400" /> <b className="text-slate-700">{w.rating.toFixed(1)}</b> · {w.jobs} pekerjaan
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100"><MessageCircle size={18} /></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100"><PhoneIcon size={18} /></button>
        </Card>
      )}

      {pending.map((e) => (
        <div key={e.id} className="animate-slide-up space-y-3 rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle size={17} /></span>
            <div>
              <div className="text-sm font-bold">Persetujuan biaya tambahan</div>
              <div className="text-[11px] text-slate-500">Diajukan oleh {w?.name}</div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{e.item}</span>
              <span className="text-base font-extrabold">{rp(e.amount)}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">“{e.reason}”</div>
            {e.photos?.length > 0 && <div className="mt-2"><Thumbs urls={e.photos} size="h-14 w-14" /></div>}
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" className="flex-1" onClick={() => act.decideExtra(b.id, e.id, false)}>Tolak</Btn>
            <Btn className="flex-1" onClick={() => act.decideExtra(b.id, e.id, true)}>Setujui {rp(e.amount)}</Btn>
          </div>
        </div>
      ))}

      {b.status === 'waiting_confirmation' && (
        <Card className="animate-slide-up space-y-3 !border-brand-200">
          <div className="text-sm font-bold">Hasil pekerjaan</div>
          {b.afterPhotos?.length ? <Thumbs urls={b.afterPhotos} size="h-20 w-20" /> : <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-400">Teknisi tidak melampirkan foto.</div>}
          <Btn size="lg" icon={CircleCheck} className="w-full" onClick={() => act.confirm(b.id)}>Konfirmasi pekerjaan selesai</Btn>
          <Btn variant="ghost" className="w-full" onClick={() => setSheet('complaint')}>Ada masalah dengan hasilnya</Btn>
        </Card>
      )}

      {b.status === 'completed' && !b.rating && !b.rework && <RatingForm b={b} w={w} />}
      {b.rating && (
        <Card className="space-y-2">
          <div className="text-sm font-bold">Ulasanmu</div>
          <Stars value={b.rating} size={18} />
          {b.review && <div className="text-sm text-slate-600">“{b.review}”</div>}
        </Card>
      )}
      {b.complaint && (
        <Card className="space-y-2 !border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Komplain</span>
            <Pill tone={b.complaint.status === 'open' ? 'rose' : 'emerald'} dot>{b.complaint.status === 'open' ? 'Ditinjau' : 'Selesai'}</Pill>
          </div>
          <div className="text-sm text-slate-600">“{b.complaint.text}”</div>
          {b.complaint.resolution && <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CircleCheck size={16} /> {b.complaint.resolution}</div>}
        </Card>
      )}

      <Card className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold"><Receipt size={16} className="text-slate-400" /> Rincian biaya</div>
        <Row label={`${svc.name}${svc.param ? ` × ${b.qty} ${svc.param.unit}` : ''}`}>{rp(b.price.base)}</Row>
        <Row label="Biaya layanan">{rp(b.price.fee)}</Row>
        {b.extras.map((e) => (
          <Row key={e.id} label={e.item}>
            {e.status === 'approved' ? rp(e.amount) : e.status === 'rejected' ? <s className="text-slate-400">{rp(e.amount)}</s> : <Pill tone="amber">menunggu</Pill>}
          </Row>
        ))}
        <Row label={<span className="font-bold text-slate-900">Total</span>} className="border-t border-dashed border-slate-200 pt-2.5">
          <span className="text-base font-extrabold">{rp(totalOf(b))}</span>
        </Row>
        <div className="text-[11px] text-slate-400">{b.rework ? `Rework gratis dari ${b.rework}` : `Harga terkunci saat booking · dibayar via ${b.payMethod}`}</div>
      </Card>

      <Card className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold"><FileText size={16} className="text-slate-400" /> Detail pesanan</div>
        <div className="flex gap-2.5 text-sm"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />{b.address}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">“{b.detail}”</div>
        <Thumbs urls={b.photos} />
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2 text-sm font-bold"><History size={16} className="text-slate-400" /> Riwayat</div>
        <ol className="space-y-3">
          {[...b.log].reverse().filter((l) => l.actor !== 'Sistem' || !l.text.startsWith('Job offer')).map((l, i, arr) => (
            <li key={i} className="relative flex gap-3 text-[13px]">
              {i < arr.length - 1 && <span className="absolute left-[5px] top-4 h-[calc(100%+4px)] w-px bg-slate-200" />}
              <span className={cx('relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full ring-[3px]', i === 0 ? 'bg-brand-500 ring-brand-100' : 'bg-slate-300 ring-white')} />
              <div className="flex-1">
                <div className={i === 0 ? 'font-semibold' : 'text-slate-600'}>{l.text}</div>
                <div className="text-[11px] text-slate-400">{fmtTime(l.t)}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {canCancel && <Btn variant="danger-soft" className="w-full" onClick={() => setSheet('cancel')}>Batalkan pesanan</Btn>}
      {canRebook && <Btn variant="soft" icon={RotateCcw} className="w-full" onClick={() => onRebook(b)}>Pesan lagi</Btn>}
      {b.status === 'completed' && !b.complaint && !b.rework && (
        <button onClick={() => setSheet('complaint')} className="w-full py-1 text-xs font-semibold text-slate-500 hover:text-slate-700">Ada masalah dengan hasil pekerjaan?</button>
      )}

      <CancelSheet open={sheet === 'cancel'} b={b} onClose={() => setSheet(null)} />
      <ComplaintSheet open={sheet === 'complaint'} b={b} onClose={() => setSheet(null)} />
    </Screen>
  )
}

const RATING_TAGS = ['Tepat waktu', 'Rapi', 'Ramah', 'Komunikatif', 'Profesional']

function RatingForm({ b, w }) {
  const { act } = useStore()
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [tags, setTags] = useState([])
  const label = ['', 'Sangat buruk', 'Kurang', 'Cukup', 'Bagus', 'Luar biasa!'][stars]
  return (
    <Card className="animate-slide-up space-y-3 text-center">
      <Avatar name={w?.name} size="lg" className="mx-auto" />
      <div>
        <div className="text-sm font-bold">Bagaimana pekerjaan {w?.name.split(' ')[0]}?</div>
        <div className="mt-0.5 h-4 text-xs font-semibold text-amber-600">{label}</div>
      </div>
      <div className="flex justify-center"><Stars value={stars} onChange={setStars} size={32} /></div>
      {stars > 0 && (
        <div className="animate-fade-in space-y-3">
          <div className="flex flex-wrap justify-center gap-1.5">
            {RATING_TAGS.map((t) => (
              <button key={t} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} className={cx('rounded-full border px-3 py-1 text-xs font-semibold transition', tags.includes(t) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                {t}
              </button>
            ))}
          </div>
          <textarea rows={2} className={cx(inputCls, 'resize-none')} placeholder="Tulis ulasan (opsional)" value={review} onChange={(e) => setReview(e.target.value)} />
          <Btn className="w-full" onClick={() => act.rate(b.id, stars, [tags.join(', '), review].filter(Boolean).join(' — '))}>Kirim ulasan</Btn>
        </div>
      )}
    </Card>
  )
}

const REASONS = ['Jadwal berubah', 'Salah pilih layanan', 'Masalah sudah teratasi', 'Lainnya']

function CancelSheet({ open, b, onClose }) {
  const { act } = useStore()
  const [reason, setReason] = useState(null)
  const fee = b.status === 'assigned' ? 25000 : 0
  const refund = totalOf(b) - fee
  return (
    <Sheet open={open} title="Batalkan pesanan?" subtitle="Pilih alasan pembatalan" onClose={onClose}>
      <div className="space-y-2">
        {REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={cx('flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-medium transition', reason === r ? 'border-brand-600 bg-brand-50/50' : 'border-slate-200 hover:border-slate-300')}>
            {r}
            <span className={cx('flex h-5 w-5 items-center justify-center rounded-full border-2', reason === r ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>{reason === r && <Check size={12} strokeWidth={3} />}</span>
          </button>
        ))}
      </div>
      <div className="space-y-1.5 rounded-2xl bg-slate-50 p-3.5">
        <Row label="Biaya pembatalan">{fee ? rp(fee) : 'Gratis'}</Row>
        <Row label="Dana dikembalikan"><span className="font-extrabold text-brand-700">{rp(refund)}</span></Row>
        {fee > 0 && <div className="pt-1 text-xs text-slate-500">Teknisi sudah ditugaskan, sebagian biaya menjadi kompensasi teknisi.</div>}
      </div>
      <Btn variant="danger" size="lg" className="w-full" disabled={!reason} onClick={() => { act.cancel(b.id, reason, refund, 'Customer'); onClose() }}>Ya, batalkan pesanan</Btn>
    </Sheet>
  )
}

function ComplaintSheet({ open, b, onClose }) {
  const { act } = useStore()
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  return (
    <Sheet open={open} title="Ajukan komplain" subtitle="Ditinjau maksimal 2×24 jam dalam masa garansi 7 hari" onClose={onClose}>
      <Field label="Apa masalahnya?" hint="Minimal 10 karakter">
        <textarea rows={3} className={cx(inputCls, 'resize-none')} value={text} onChange={(e) => setText(e.target.value)} placeholder="Jelaskan kondisi saat ini" />
      </Field>
      <Field label="Bukti foto"><PhotoInput value={photos} onChange={setPhotos} /></Field>
      <Btn size="lg" className="w-full" disabled={text.trim().length < 10} onClick={() => { act.complain(b.id, text, photos); onClose() }}>Kirim komplain</Btn>
    </Sheet>
  )
}
