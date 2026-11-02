import { useState } from 'react'
import { useStore, SERVICES, AREAS, CUSTOMER, svcOf, areaOf, resolvePrice, calcPrice, rp, fmtDate, fmtTime, dayAt, STATUS, ACTIVE, totalOf } from './store'
import { Phone, Btn, Badge, Card, Field, Row, Sheet, Segment, Empty, Spinner, PhotoInput, Thumbs, Stars, inputCls } from './ui'

const TABS = [{ id: 'home', icon: '🏠', label: 'Beranda' }, { id: 'orders', icon: '📋', label: 'Pesanan' }]

export default function Customer() {
  const [tab, setTab] = useState('home')
  const [screen, setScreen] = useState(null)
  const [area, setArea] = useState('kby')
  const open = (id) => setScreen({ name: 'detail', id })

  if (screen?.name === 'book') return <BookingFlow svcId={screen.svc} area={area} onBack={() => setScreen(null)} onDone={open} />
  if (screen?.name === 'detail') return <BookingDetail id={screen.id} onBack={() => { setScreen(null); setTab('orders') }} />
  return (
    <Phone role="customer" title={tab === 'home' ? 'Fixora' : 'Pesanan Saya'} tabs={TABS} tab={tab} onTab={setTab}>
      {tab === 'home' ? <Home area={area} setArea={setArea} onBook={(svc) => setScreen({ name: 'book', svc })} onOpen={open} /> : <Orders onOpen={open} />}
    </Phone>
  )
}

function Home({ area, setArea, onBook, onOpen }) {
  const { state } = useStore()
  const active = state.bookings.filter((b) => b.customer === CUSTOMER && ACTIVE.includes(b.status))
  return (
    <>
      <div>
        <div className="text-xs text-slate-500">Halo, {CUSTOMER.split(' ')[0]} 👋 · Lokasi layanan</div>
        <select value={area} onChange={(e) => setArea(e.target.value)} className="font-semibold bg-transparent -ml-1 focus:outline-none">
          {AREAS.map((a) => <option key={a.id} value={a.id}>📍 {a.name}, {a.city}</option>)}
        </select>
      </div>
      {active.map((b) => (
        <button key={b.id} onClick={() => onOpen(b.id)} className="w-full text-left bg-teal-600 text-white rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{svcOf(b.svc).icon}</span>
          <div className="flex-1">
            <div className="text-xs opacity-80">Pesanan aktif · {b.id}</div>
            <div className="font-semibold text-sm">{STATUS[b.status][0]}</div>
          </div>
          <span>›</span>
        </button>
      ))}
      <h2 className="font-bold text-lg pt-1">Butuh perbaikan apa?</h2>
      <div className="grid grid-cols-2 gap-3">
        {SERVICES.map((s) => {
          const rule = resolvePrice(state.prices, s.id, area)
          return (
            <button key={s.id} disabled={!rule} onClick={() => onBook(s.id)} className="text-left bg-white p-3 rounded-xl border border-slate-200 hover:border-teal-500 disabled:opacity-50 disabled:hover:border-slate-200">
              <div className="text-2xl">{s.icon}</div>
              <div className="font-semibold text-sm mt-1">{s.name}</div>
              <div className="text-xs text-slate-500 h-8">{s.desc}</div>
              <div className={`text-xs font-medium mt-2 ${rule ? 'text-teal-700' : 'text-slate-400'}`}>{rule ? `Mulai ${rp(rule.price)}` : 'Belum tersedia di area ini'}</div>
            </button>
          )
        })}
      </div>
      <Card className="text-xs text-slate-600 space-y-1">
        <div>✅ Teknisi terverifikasi</div>
        <div>💰 Harga transparan — biaya tambahan butuh persetujuanmu</div>
        <div>🛡️ Garansi pekerjaan 7 hari</div>
      </Card>
    </>
  )
}

function Orders({ onOpen }) {
  const { state } = useStore()
  const [f, setF] = useState('active')
  const list = state.bookings.filter((b) => b.customer === CUSTOMER && (f === 'active') === ACTIVE.includes(b.status))
  return (
    <>
      <Segment value={f} onChange={setF} options={[['active', 'Aktif'], ['history', 'Riwayat']]} />
      {list.length === 0 && <Empty text="Belum ada pesanan" />}
      {list.map((b) => (
        <Card key={b.id} onClick={() => onOpen(b.id)} className="cursor-pointer hover:border-teal-500 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <span className="text-2xl">{svcOf(b.svc).icon}</span>
              <div>
                <div className="font-semibold text-sm">{svcOf(b.svc).name}{b.rework && ' (Rework)'}</div>
                <div className="text-xs text-slate-500">{b.id} · {fmtDate(b.schedule)}</div>
              </div>
            </div>
            <Badge status={b.status} />
          </div>
          <div className="text-sm font-semibold text-right">{rp(totalOf(b))}</div>
        </Card>
      ))}
    </>
  )
}

const SLOTS = [8, 10, 13, 15, 17]
const METHODS = ['QRIS', 'Virtual Account BCA', 'GoPay']

function BookingFlow({ svcId, area, onBack, onDone }) {
  const { state, now, act } = useStore()
  const svc = svcOf(svcId)
  const [step, setStep] = useState(1)
  const [touched, setTouched] = useState(false)
  const [paying, setPaying] = useState(false)
  const [f, setF] = useState({ address: area === 'kby' ? 'Jl. Melawai Raya No. 12, Kebayoran Baru' : '', detail: '', qty: 1, photos: [], day: null, slot: null, method: null })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const price = calcPrice(resolvePrice(state.prices, svcId, area), svcId, f.qty)
  const total = price.base + price.fee
  const errors = {
    address: f.address.trim().length < 10 && 'Alamat terlalu singkat',
    detail: f.detail.trim().length < 10 && 'Ceritakan masalahnya minimal 10 karakter',
    schedule: (f.day === null || f.slot === null) && 'Pilih tanggal dan jam',
    method: !f.method && 'Pilih metode pembayaran',
  }
  const valid = { 1: !errors.address && !errors.detail, 2: !errors.schedule, 3: !errors.method }[step]

  const next = () => {
    if (!valid) return setTouched(true)
    setTouched(false)
    if (step < 3) return setStep(step + 1)
    setPaying(true)
    setTimeout(() => {
      onDone(act.book({ svc: svcId, area, qty: f.qty, address: f.address, detail: f.detail, photos: f.photos, schedule: dayAt(f.day, f.slot), payMethod: f.method, price }))
    }, 1800)
  }
  const slotFull = (d, h) => (d === 0 && h <= new Date(now).getHours() + 1) || (d + h) % 4 === 1

  return (
    <Phone
      role="customer"
      title={svc.name}
      onBack={step === 1 ? onBack : () => setStep(step - 1)}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-slate-500">Total estimasi</div>
            <div className="font-bold">{rp(total)}</div>
          </div>
          <Btn onClick={next} className="flex-1">{step < 3 ? 'Lanjut' : `Bayar ${rp(total)}`}</Btn>
        </div>
      }
    >
      <div className="flex gap-1">{[1, 2, 3].map((i) => <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-teal-600' : 'bg-slate-200'}`} />)}</div>
      <div className="text-xs text-slate-500">Langkah {step} dari 3 · {['Detail pekerjaan', 'Pilih jadwal', 'Ringkasan & pembayaran'][step - 1]}</div>

      {step === 1 && (
        <>
          <Field label="Alamat lengkap" error={touched && errors.address}>
            <textarea rows={2} className={inputCls} value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Nama jalan, nomor rumah, patokan" />
          </Field>
          <Field label="Ceritakan masalahnya" error={touched && errors.detail} hint={`${f.detail.length}/300`}>
            <textarea rows={3} maxLength={300} className={inputCls} value={f.detail} onChange={(e) => set('detail', e.target.value)} placeholder="Contoh: AC tidak dingin dan meneteskan air" />
          </Field>
          {svc.param && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{svc.param.label}</span>
              <div className="flex items-center gap-3">
                <Btn variant="secondary" className="!px-3 !py-1" disabled={f.qty <= 1} onClick={() => set('qty', f.qty - 1)}>−</Btn>
                <span className="w-12 text-center text-sm">{f.qty} {svc.param.unit}</span>
                <Btn variant="secondary" className="!px-3 !py-1" disabled={f.qty >= svc.param.max} onClick={() => set('qty', f.qty + 1)}>+</Btn>
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
          <div className="text-sm font-medium">Tanggal</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[0, 1, 2, 3, 4].map((d) => {
              const t = new Date(dayAt(d, 0))
              return (
                <button key={d} onClick={() => setF((p) => ({ ...p, day: d, slot: null }))} className={`shrink-0 w-16 py-2 rounded-lg border text-center ${f.day === d ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-300'}`}>
                  <div className="text-[10px]">{d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : t.toLocaleDateString('id-ID', { weekday: 'short' })}</div>
                  <div className="font-bold">{t.getDate()}</div>
                </button>
              )
            })}
          </div>
          {f.day !== null && (
            <>
              <div className="text-sm font-medium">Jam kedatangan</div>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((h) => {
                  const full = slotFull(f.day, h)
                  return (
                    <button key={h} disabled={full} onClick={() => set('slot', h)} className={`py-2 rounded-lg border text-sm disabled:bg-slate-100 disabled:text-slate-400 ${f.slot === h ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-300'}`}>
                      {String(h).padStart(2, '0')}:00
                      {full && <div className="text-[10px]">Penuh</div>}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {touched && errors.schedule && <div className="text-xs text-red-600">{errors.schedule}</div>}
        </>
      )}

      {step === 3 && (
        <>
          <Card className="space-y-2">
            <Row label="Layanan">{svc.icon} {svc.name}</Row>
            <Row label="Jadwal">{fmtDate(dayAt(f.day, f.slot))}</Row>
            <Row label="Alamat"><span className="line-clamp-2">{f.address}</span></Row>
          </Card>
          <Card className="space-y-2">
            <div className="font-semibold text-sm">Rincian biaya</div>
            <Row label={`${svc.name}${svc.param ? ` × ${f.qty} ${svc.param.unit}` : ''}`}>{rp(price.base)}</Row>
            <Row label="Biaya layanan">{rp(price.fee)}</Row>
            <Row label={<b className="text-slate-900">Total</b>} className="border-t pt-2"><b>{rp(total)}</b></Row>
            <div className="text-xs text-slate-500">Harga {price.level === 'zone' ? 'zona' : 'kota'} {price.region}. Biaya tambahan (material/part) hanya berlaku setelah kamu setujui di aplikasi.</div>
          </Card>
          <div className="text-sm font-medium">Metode pembayaran</div>
          {METHODS.map((m) => (
            <label key={m} className={`flex items-center gap-3 p-3 rounded-lg border bg-white cursor-pointer ${f.method === m ? 'border-teal-600 ring-1 ring-teal-600' : 'border-slate-300'}`}>
              <input type="radio" checked={f.method === m} onChange={() => set('method', m)} className="accent-teal-600" />
              <span className="text-sm">{m}</span>
            </label>
          ))}
          {touched && errors.method && <div className="text-xs text-red-600">{errors.method}</div>}
          <div className="text-xs text-slate-500">Pembatalan gratis sebelum teknisi ditugaskan. Setelah itu dikenakan biaya {rp(25000)}.</div>
        </>
      )}

      {paying && (
        <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center gap-3 text-teal-700">
          <Spinner />
          <div className="text-sm">Memproses pembayaran via {f.method}…</div>
        </div>
      )}
    </Phone>
  )
}

function BookingDetail({ id, onBack }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const svc = svcOf(b.svc)
  const w = state.workers.find((x) => x.id === b.workerId)
  const [sheet, setSheet] = useState(null)
  const canCancel = ['searching', 'assigned'].includes(b.status)

  const msg = {
    searching: b.needsAdmin ? 'Belum ada teknisi tersedia. Tim operasional sedang membantu mencarikan.' : 'Mencari teknisi terbaik di sekitarmu…',
    assigned: `${w?.name} akan datang ${fmtDate(b.schedule)}`,
    on_the_way: 'Teknisi sedang menuju lokasimu · estimasi tiba 15 menit',
    arrived: 'Teknisi sudah tiba di lokasi',
    in_progress: 'Pekerjaan sedang berlangsung',
    waiting_confirmation: 'Pekerjaan selesai. Periksa hasilnya lalu konfirmasi.',
    completed: b.refund ? `Refund ${rp(b.refund)} diproses ke metode pembayaranmu.` : 'Terima kasih! Garansi berlaku 7 hari.',
    cancelled: b.refund ? `Refund ${rp(b.refund)} diproses dalam 1–3 hari kerja.` : 'Pesanan dibatalkan.',
    disputed: 'Komplain sedang ditinjau tim kami (maks. 2×24 jam).',
  }[b.status]

  return (
    <Phone role="customer" title={`Pesanan ${b.id}`} onBack={onBack}>
      <Card className="space-y-2">
        <Badge status={b.status} />
        <div className="font-semibold flex items-center gap-2">{b.status === 'searching' && !b.needsAdmin && <span className="text-teal-600"><Spinner /></span>}{msg}</div>
        {b.status === 'on_the_way' && (
          <div className="h-28 rounded-lg bg-gradient-to-br from-emerald-100 to-sky-100 relative overflow-hidden">
            <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-teal-500" />
            <span className="absolute left-1/3 top-1/2 -translate-y-1/2 text-2xl">🛵</span>
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl">🏠</span>
          </div>
        )}
      </Card>

      {w && (
        <Card className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center">{w.name.split(' ').map((s) => s[0]).join('')}</div>
          <div className="flex-1 text-sm">
            <div className="font-semibold">{w.name} <span className="text-emerald-600 text-xs">✔ Terverifikasi</span></div>
            <div className="text-xs text-slate-500">⭐ {w.rating.toFixed(1)} · {w.jobs} pekerjaan</div>
          </div>
          <Btn variant="secondary" className="!px-3">💬</Btn>
          <Btn variant="secondary" className="!px-3">📞</Btn>
        </Card>
      )}

      {b.extras.filter((e) => e.status === 'pending').map((e) => (
        <Card key={e.id} className="border-amber-300 bg-amber-50 space-y-2">
          <div className="font-semibold text-sm">⚠️ Persetujuan biaya tambahan</div>
          <Row label={e.item}><b>{rp(e.amount)}</b></Row>
          <div className="text-xs text-slate-600">Alasan teknisi: {e.reason}</div>
          <Thumbs urls={e.photos} />
          <div className="flex gap-2">
            <Btn variant="secondary" className="flex-1" onClick={() => act.decideExtra(b.id, e.id, false)}>Tolak</Btn>
            <Btn className="flex-1" onClick={() => act.decideExtra(b.id, e.id, true)}>Setujui</Btn>
          </div>
        </Card>
      ))}

      {b.status === 'waiting_confirmation' && (
        <Card className="space-y-3">
          <div className="font-semibold text-sm">Hasil pekerjaan</div>
          {b.afterPhotos?.length ? <Thumbs urls={b.afterPhotos} /> : <div className="text-xs text-slate-400">Teknisi tidak melampirkan foto.</div>}
          <Btn className="w-full" onClick={() => act.confirm(b.id)}>Konfirmasi pekerjaan selesai</Btn>
          <Btn variant="secondary" className="w-full" onClick={() => setSheet('complaint')}>Ada masalah</Btn>
        </Card>
      )}

      {b.status === 'completed' && !b.rating && !b.rework && <RatingForm b={b} w={w} />}
      {b.rating && (
        <Card className="space-y-1">
          <div className="text-sm font-semibold">Ulasanmu</div>
          <Stars value={b.rating} size="text-lg" />
          {b.review && <div className="text-sm text-slate-600">"{b.review}"</div>}
        </Card>
      )}
      {b.complaint && (
        <Card className="space-y-1 border-red-200">
          <div className="text-sm font-semibold">Komplain · {b.complaint.status === 'open' ? 'Ditinjau' : 'Selesai'}</div>
          <div className="text-sm text-slate-600">"{b.complaint.text}"</div>
          {b.complaint.resolution && <div className="text-sm text-emerald-700">✔ {b.complaint.resolution}</div>}
        </Card>
      )}

      <Card className="space-y-2">
        <div className="font-semibold text-sm">Rincian biaya</div>
        <Row label={`${svc.name}${svc.param ? ` × ${b.qty} ${svc.param.unit}` : ''}`}>{rp(b.price.base)}</Row>
        <Row label="Biaya layanan">{rp(b.price.fee)}</Row>
        {b.extras.map((e) => (
          <Row key={e.id} label={e.item}>
            {e.status === 'approved' ? rp(e.amount) : <span className="text-xs text-slate-400">{e.status === 'rejected' ? <s>{rp(e.amount)}</s> : 'menunggu persetujuan'}</span>}
          </Row>
        ))}
        <Row label={<b className="text-slate-900">Total</b>} className="border-t pt-2"><b>{rp(totalOf(b))}</b></Row>
        <div className="text-[11px] text-slate-400">{b.rework ? `Rework gratis dari ${b.rework}` : `Harga terkunci saat booking · ${b.price.level} ${b.price.region} v${b.price.version} · dibayar via ${b.payMethod}`}</div>
      </Card>

      <Card className="space-y-2">
        <div className="font-semibold text-sm">Detail pesanan</div>
        <Row label="Jadwal">{fmtDate(b.schedule)}</Row>
        <Row label="Alamat">{b.address}</Row>
        <Row label="Masalah">{b.detail}</Row>
        <Thumbs urls={b.photos} />
      </Card>

      <Card>
        <div className="font-semibold text-sm mb-2">Riwayat</div>
        <ol className="border-l-2 border-slate-200 ml-1 space-y-2">
          {[...b.log].reverse().filter((l) => l.actor !== 'Sistem' || !l.text.startsWith('Job offer')).map((l, i) => (
            <li key={i} className="pl-3 relative text-sm">
              <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${i === 0 ? 'bg-teal-600' : 'bg-slate-300'}`} />
              {l.text}
              <div className="text-[10px] text-slate-400">{fmtTime(l.t)}</div>
            </li>
          ))}
        </ol>
      </Card>

      {canCancel && <Btn variant="secondary" className="w-full !text-red-600" onClick={() => setSheet('cancel')}>Batalkan pesanan</Btn>}
      {b.status === 'completed' && !b.complaint && !b.rework && (
        <button onClick={() => setSheet('complaint')} className="text-sm text-slate-500 underline w-full">Ada masalah dengan hasil pekerjaan?</button>
      )}

      <CancelSheet open={sheet === 'cancel'} b={b} onClose={() => setSheet(null)} />
      <ComplaintSheet open={sheet === 'complaint'} b={b} onClose={() => setSheet(null)} />
    </Phone>
  )
}

function RatingForm({ b, w }) {
  const { act } = useStore()
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  return (
    <Card className="space-y-3 text-center">
      <div className="text-sm font-semibold">Bagaimana pekerjaan {w?.name}?</div>
      <div className="flex justify-center"><Stars value={stars} onChange={setStars} size="text-3xl" /></div>
      {stars > 0 && (
        <>
          <textarea rows={2} className={inputCls} placeholder="Tulis ulasan (opsional)" value={review} onChange={(e) => setReview(e.target.value)} />
          <Btn className="w-full" onClick={() => act.rate(b.id, stars, review)}>Kirim ulasan</Btn>
        </>
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
    <Sheet open={open} title="Batalkan pesanan?" onClose={onClose}>
      {REASONS.map((r) => (
        <label key={r} className="flex items-center gap-3 text-sm">
          <input type="radio" checked={reason === r} onChange={() => setReason(r)} className="accent-teal-600" />
          {r}
        </label>
      ))}
      <div className="bg-slate-50 rounded-lg p-3 space-y-1">
        <Row label="Biaya pembatalan">{fee ? rp(fee) : 'Gratis'}</Row>
        <Row label="Dana dikembalikan"><b>{rp(refund)}</b></Row>
        {fee > 0 && <div className="text-xs text-slate-500">Teknisi sudah ditugaskan, sebagian biaya menjadi kompensasi teknisi.</div>}
      </div>
      <Btn variant="danger" className="w-full" disabled={!reason} onClick={() => { act.cancel(b.id, reason, refund, 'Customer'); onClose() }}>Ya, batalkan</Btn>
    </Sheet>
  )
}

function ComplaintSheet({ open, b, onClose }) {
  const { act } = useStore()
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  return (
    <Sheet open={open} title="Ajukan komplain" onClose={onClose}>
      <div className="text-xs text-slate-500">Komplain dalam masa garansi 7 hari akan ditinjau maksimal 2×24 jam.</div>
      <Field label="Apa masalahnya?">
        <textarea rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Jelaskan kondisi saat ini" />
      </Field>
      <Field label="Bukti foto"><PhotoInput value={photos} onChange={setPhotos} /></Field>
      <Btn className="w-full" disabled={text.trim().length < 10} onClick={() => { act.complain(b.id, text, photos); onClose() }}>Kirim komplain</Btn>
    </Sheet>
  )
}
