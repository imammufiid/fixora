import { useState } from 'react'
import { useStore, ME, FLOW, STATUS, svcOf, areaOf, rp, fmtDate, extrasTotal } from './store'
import { Phone, Btn, Badge, Card, Field, Row, Sheet, Empty, PhotoInput, Thumbs, inputCls } from './ui'

const TABS = [{ id: 'jobs', icon: '🧰', label: 'Pekerjaan' }, { id: 'earn', icon: '💰', label: 'Pendapatan' }]

export default function Worker() {
  const { state, act } = useStore()
  const me = state.workers.find((w) => w.id === ME)
  const [tab, setTab] = useState('jobs')
  const [open, setOpen] = useState(null)
  if (open) return <JobDetail id={open} onBack={() => setOpen(null)} />

  const toggle = (
    <button onClick={() => act.toggleOnline(ME)} className={`text-xs px-3 py-1 rounded-full font-medium ${me.online ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
      {me.online ? '● Online' : '○ Offline'}
    </button>
  )
  return (
    <Phone role="worker" title={tab === 'jobs' ? 'Fixora Partner' : 'Pendapatan'} right={toggle} tabs={TABS} tab={tab} onTab={setTab}>
      {tab === 'jobs' ? <Jobs me={me} onOpen={setOpen} /> : <Earnings />}
    </Phone>
  )
}

function Jobs({ me, onOpen }) {
  const { state } = useStore()
  const offers = state.bookings.filter((b) => b.offer?.workerId === ME)
  const active = state.bookings.filter((b) => b.workerId === ME && FLOW.includes(b.status)).sort((a, b) => a.schedule - b.schedule)
  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Card className="!p-2"><div className="text-[10px] text-slate-500">Rating</div><div className="font-bold">⭐ {me.rating.toFixed(1)}</div></Card>
        <Card className="!p-2"><div className="text-[10px] text-slate-500">Selesai</div><div className="font-bold">{me.jobs}</div></Card>
        <Card className="!p-2"><div className="text-[10px] text-slate-500">Area</div><div className="font-bold text-xs leading-5">Jaksel</div></Card>
      </div>
      {!me.online && <div className="bg-slate-200 text-slate-600 text-sm rounded-lg p-3">Kamu sedang offline dan tidak akan menerima job offer.</div>}
      {offers.map((b) => <OfferCard key={b.id} b={b} />)}
      <div className="font-semibold text-sm pt-1">Pekerjaan aktif</div>
      {active.length === 0 && <Empty text={me.online ? 'Belum ada pekerjaan. Tetap online untuk menerima job offer.' : 'Tidak ada pekerjaan aktif.'} />}
      {active.map((b) => (
        <Card key={b.id} onClick={() => onOpen(b.id)} className="cursor-pointer hover:border-teal-500 space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold text-sm">{svcOf(b.svc).icon} {svcOf(b.svc).name}{b.rework && ' · Rework'}</span>
            <Badge status={b.status} />
          </div>
          <div className="text-xs text-slate-500">{b.id} · {fmtDate(b.schedule)}</div>
          <div className="text-xs text-slate-500">📍 {b.address}</div>
          {b.extras.some((e) => e.status === 'pending') && <div className="text-xs text-amber-700">⏳ Menunggu persetujuan biaya tambahan</div>}
        </Card>
      ))}
    </>
  )
}

function OfferCard({ b }) {
  const { state, now, act } = useStore()
  const me = state.workers.find((w) => w.id === ME)
  const svc = svcOf(b.svc)
  const left = Math.max(0, Math.ceil((b.offer.expiresAt - now) / 1000))
  return (
    <Card className="border-2 !border-teal-500 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Job offer baru</span>
        <span className="font-mono text-sm text-red-600">00:{String(left).padStart(2, '0')}</span>
      </div>
      <div className="h-1 bg-slate-100 rounded"><div className="h-1 bg-red-500 rounded transition-all duration-1000" style={{ width: `${(left / 30) * 100}%` }} /></div>
      <div className="flex gap-3">
        <span className="text-3xl">{svc.icon}</span>
        <div className="text-sm">
          <div className="font-semibold">{svc.name}{svc.param && ` · ${b.qty} ${svc.param.unit}`}</div>
          <div className="text-xs text-slate-500">📍 {areaOf(b.area).name} · {me.dist[b.area]} km dari kamu</div>
          <div className="text-xs text-slate-500">🗓️ {fmtDate(b.schedule)}</div>
        </div>
      </div>
      <div className="text-sm bg-slate-50 rounded-lg p-2 text-slate-600">"{b.detail}"</div>
      <Row label="Pendapatan kamu"><b className="text-base">{rp(b.price.payout)}</b></Row>
      <div className="flex gap-2">
        <Btn variant="secondary" className="flex-1" onClick={() => act.decline(b.id, ME, 'ditolak')}>Tolak</Btn>
        <Btn className="flex-1" onClick={() => act.accept(b.id, ME, 'Worker')}>Terima</Btn>
      </div>
    </Card>
  )
}

function Earnings() {
  const { state } = useStore()
  const done = state.bookings.filter((b) => b.workerId === ME && ['completed', 'disputed'].includes(b.status))
  const total = done.reduce((s, b) => s + b.price.payout + extrasTotal(b), 0)
  return (
    <>
      <Card className="bg-teal-600 !border-teal-600 text-white">
        <div className="text-xs opacity-80">Saldo menunggu payout</div>
        <div className="text-2xl font-bold">{rp(total)}</div>
        <div className="text-xs opacity-80 mt-1">Payout otomatis setiap Senin ke BCA •••• 4321</div>
      </Card>
      <div className="font-semibold text-sm">Riwayat pekerjaan</div>
      {done.length === 0 && <Empty text="Belum ada pekerjaan selesai" />}
      {done.map((b) => (
        <Card key={b.id} className="space-y-1">
          <div className="flex justify-between text-sm"><span className="font-semibold">{svcOf(b.svc).name}</span><span className="font-semibold">{rp(b.price.payout + extrasTotal(b))}</span></div>
          <div className="text-xs text-slate-500">{b.id} · {fmtDate(b.schedule)}{b.rating && ` · ⭐ ${b.rating}`}</div>
          {extrasTotal(b) > 0 && <div className="text-xs text-slate-500">Termasuk biaya tambahan {rp(extrasTotal(b))}</div>}
        </Card>
      ))}
    </>
  )
}

const NEXT = {
  assigned: ['on_the_way', 'Mulai Perjalanan'],
  on_the_way: ['arrived', 'Saya Sudah Tiba'],
  arrived: ['in_progress', 'Mulai Pekerjaan'],
  in_progress: ['waiting_confirmation', 'Selesaikan Pekerjaan'],
}

function JobDetail({ id, onBack }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const svc = svcOf(b.svc)
  const [before, setBefore] = useState(b.beforePhotos || [])
  const [after, setAfter] = useState([])
  const [checks, setChecks] = useState([])
  const [extraOpen, setExtraOpen] = useState(false)
  const step = NEXT[b.status]
  const idx = FLOW.indexOf(b.status)

  let block = null
  if (b.status === 'arrived' && !before.length) block = 'Unggah foto kondisi sebelum pekerjaan'
  if (b.status === 'in_progress') {
    if (b.extras.some((e) => e.status === 'pending')) block = 'Menunggu customer menyetujui biaya tambahan'
    else if (checks.length < svc.checklist.length) block = 'Lengkapi checklist pekerjaan'
    else if (!after.length) block = 'Unggah foto hasil pekerjaan'
  }

  const footer = step ? (
    <div className="space-y-2">
      {block && <div className="text-xs text-amber-700">⚠️ {block}</div>}
      <Btn className="w-full" disabled={!!block} onClick={() => act.advance(b.id, step[0], 'Worker', { beforePhotos: before, afterPhotos: after })}>{step[1]}</Btn>
    </div>
  ) : b.status === 'waiting_confirmation' ? (
    <div className="text-sm text-center text-slate-500 py-2">Menunggu konfirmasi customer…</div>
  ) : null

  return (
    <Phone role="worker" title={b.id} onBack={onBack} footer={footer}>
      <div className="flex items-center">
        {FLOW.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${i <= idx ? 'bg-teal-600' : 'bg-slate-300'}`} />
            <div className={`text-[9px] text-center leading-tight ${i === idx ? 'font-semibold text-teal-700' : 'text-slate-400'}`}>{STATUS[s][0]}</div>
          </div>
        ))}
      </div>

      <Card className="space-y-2">
        <div className="flex justify-between"><span className="font-semibold text-sm">{b.customer}</span><span className="text-xs text-slate-500">{fmtDate(b.schedule)}</span></div>
        <div className="text-sm text-slate-600">📍 {b.address}</div>
        <div className="flex gap-2">
          <Btn variant="secondary" className="flex-1 !py-1.5">🗺️ Buka Maps</Btn>
          <Btn variant="secondary" className="flex-1 !py-1.5">📞 Hubungi</Btn>
        </div>
      </Card>

      <Card className="space-y-2">
        <div className="font-semibold text-sm">{svc.icon} {svc.name}{svc.param && ` · ${b.qty} ${svc.param.unit}`}</div>
        <div className="text-sm text-slate-600">"{b.detail}"</div>
        <Thumbs urls={b.photos} />
      </Card>

      {['arrived', 'in_progress'].includes(b.status) && (
        <Card className="space-y-2">
          <div className="font-semibold text-sm">Foto sebelum pekerjaan</div>
          {b.status === 'arrived' ? <PhotoInput value={before} onChange={setBefore} label="Sebelum" /> : <Thumbs urls={b.beforePhotos} />}
        </Card>
      )}

      {b.status === 'in_progress' && (
        <>
          <Card className="space-y-2">
            <div className="font-semibold text-sm">Checklist {svc.name}</div>
            {svc.checklist.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-teal-600 w-4 h-4" checked={checks.includes(c)} onChange={() => setChecks(checks.includes(c) ? checks.filter((x) => x !== c) : [...checks, c])} />
                {c}
              </label>
            ))}
          </Card>
          <Card className="space-y-2">
            <div className="font-semibold text-sm">Foto hasil pekerjaan</div>
            <PhotoInput value={after} onChange={setAfter} label="Sesudah" />
          </Card>
        </>
      )}

      {(['arrived', 'in_progress'].includes(b.status) || b.extras.length > 0) && (
        <Card className="space-y-2">
          <div className="font-semibold text-sm">Biaya tambahan</div>
          {b.extras.length === 0 && <div className="text-xs text-slate-400">Belum ada. Ajukan jika butuh material/part di luar lingkup awal.</div>}
          {b.extras.map((e) => (
            <Row key={e.id} label={e.item}>
              {rp(e.amount)}{' '}
              <span className={`text-xs ${e.status === 'approved' ? 'text-emerald-600' : e.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                ({{ pending: 'menunggu', approved: 'disetujui', rejected: 'ditolak' }[e.status]})
              </span>
            </Row>
          ))}
          {['arrived', 'in_progress'].includes(b.status) && <Btn variant="secondary" className="w-full" onClick={() => setExtraOpen(true)}>+ Ajukan biaya tambahan</Btn>}
        </Card>
      )}

      <Card>
        <Row label="Pendapatan kamu"><b>{rp(b.price.payout + extrasTotal(b))}</b></Row>
      </Card>

      <ExtraSheet open={extraOpen} b={b} onClose={() => setExtraOpen(false)} />
    </Phone>
  )
}

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
    <Sheet open={open} title="Ajukan biaya tambahan" onClose={onClose}>
      <Field label="Item / pekerjaan"><input className={inputCls} value={f.item} onChange={(e) => set('item', e.target.value)} placeholder="Contoh: Ganti kapasitor" /></Field>
      <Field label="Nominal (Rp)"><input type="number" className={inputCls} value={f.amount} onChange={(e) => set('amount', e.target.value)} placeholder="85000" /></Field>
      <Field label="Alasan"><textarea rows={2} className={inputCls} value={f.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Jelaskan kenapa dibutuhkan" /></Field>
      <Field label="Bukti foto"><PhotoInput value={f.photos} onChange={(v) => set('photos', v)} /></Field>
      <div className="text-xs text-slate-500">Customer harus menyetujui sebelum pekerjaan bisa diselesaikan.</div>
      <Btn className="w-full" disabled={!valid} onClick={submit}>Kirim ke customer</Btn>
    </Sheet>
  )
}
