import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

export const rp = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID')
export const fmtTime = (t) => new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
export const fmtDate = (t) => new Date(t).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const dayAt = (d, h) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  x.setHours(h, 0, 0, 0)
  return x.getTime()
}

export const SERVICES = [
  { id: 'ac', icon: '❄️', name: 'AC Service', desc: 'Cuci AC, cek freon, perbaikan ringan', param: { label: 'Jumlah unit AC', unit: 'unit', max: 5, extraRate: 0.8 }, checklist: ['Cek tekanan freon', 'Cuci filter & evaporator', 'Cek saluran drainase', 'Tes suhu output'] },
  { id: 'plumb', icon: '🚰', name: 'Plumbing', desc: 'Pipa bocor, keran, saluran mampet', checklist: ['Identifikasi sumber masalah', 'Perbaikan', 'Tes aliran & kebocoran'] },
  { id: 'elec', icon: '⚡', name: 'Electrical', desc: 'Stop kontak, MCB, instalasi lampu', checklist: ['Matikan MCB', 'Perbaikan', 'Tes beban & grounding'] },
  { id: 'handy', icon: '🔨', name: 'Handyman', desc: 'Pasang rak, perbaikan pintu, dll', param: { label: 'Estimasi durasi', unit: 'jam', max: 4, extraRate: 1 }, checklist: ['Konfirmasi lingkup kerja', 'Pengerjaan', 'Bersihkan area kerja'] },
]
export const svcOf = (id) => SERVICES.find((s) => s.id === id)

export const AREAS = [
  { id: 'kby', name: 'Kebayoran Baru', city: 'Jakarta Selatan' },
  { id: 'tbt', name: 'Tebet', city: 'Jakarta Selatan' },
  { id: 'bks', name: 'Bekasi Barat', city: 'Bekasi' },
]
export const areaOf = (id) => AREAS.find((a) => a.id === id)

export const SERVICE_FEE = 10000
export const ME = 'w1'
export const CUSTOMER = 'Rina Maharani'

export const STATUS = {
  pending_payment: ['Menunggu Pembayaran', 'bg-slate-100 text-slate-700'],
  searching: ['Mencari Teknisi', 'bg-amber-100 text-amber-800'],
  assigned: ['Teknisi Ditugaskan', 'bg-blue-100 text-blue-700'],
  on_the_way: ['Dalam Perjalanan', 'bg-blue-100 text-blue-700'],
  arrived: ['Teknisi Tiba', 'bg-blue-100 text-blue-700'],
  in_progress: ['Sedang Dikerjakan', 'bg-indigo-100 text-indigo-700'],
  waiting_confirmation: ['Menunggu Konfirmasi', 'bg-purple-100 text-purple-700'],
  completed: ['Selesai', 'bg-emerald-100 text-emerald-700'],
  cancelled: ['Dibatalkan', 'bg-slate-200 text-slate-600'],
  disputed: ['Dalam Komplain', 'bg-red-100 text-red-700'],
}
export const ACTIVE = ['pending_payment', 'searching', 'assigned', 'on_the_way', 'arrived', 'in_progress', 'waiting_confirmation']
export const FLOW = ['assigned', 'on_the_way', 'arrived', 'in_progress', 'waiting_confirmation']

// Prioritas harga: zone → city → tidak tersedia (PRD §7)
export function resolvePrice(prices, svc, areaId) {
  const a = areaOf(areaId)
  return (
    prices.find((p) => p.svc === svc && p.level === 'zone' && p.region === a.id) ||
    prices.find((p) => p.svc === svc && p.level === 'city' && p.region === a.city) ||
    null
  )
}
export function calcPrice(rule, svc, qty) {
  const s = svcOf(svc)
  const mult = s.param ? 1 + (qty - 1) * s.param.extraRate : 1
  return {
    base: rule.price * mult,
    payout: rule.payout * mult,
    fee: SERVICE_FEE,
    level: rule.level,
    region: rule.level === 'zone' ? areaOf(rule.region).name : rule.region,
    version: rule.version,
  }
}
export const extrasTotal = (b) => b.extras.filter((e) => e.status === 'approved').reduce((s, e) => s + e.amount, 0)
export const totalOf = (b) => b.price.base + b.price.fee + extrasTotal(b)

// Bobot matching awal (PRD §9). Worker baru diberi rating netral agar tetap mendapat kesempatan.
export function scoreWorker(w, b) {
  const skill = w.skills.includes(b.svc) ? 35 : 0
  const dist = Math.max(0, 25 - w.dist[b.area] * 3)
  const rating = ((w.ratingCount ? w.rating : 4.5) / 5) * 20
  const avail = w.online ? 10 : 0
  const hist = Math.min(10, w.jobs / 15)
  return Math.round(skill + dist + rating + avail + hist)
}
export function candidates(state, b) {
  return state.workers
    .filter((w) => w.verified === 'verified' && w.skills.includes(b.svc) && w.areas.includes(areaOf(b.area).city))
    .map((w) => ({ w, score: scoreWorker(w, b), eligible: w.online && !b.tried.includes(w.id) }))
    .sort((a, c) => c.score - a.score)
}

const PRICES = [
  { id: 'p1', svc: 'ac', level: 'zone', region: 'kby', price: 150000, payout: 127500, version: 2, from: dayAt(-30, 0) },
  { id: 'p2', svc: 'ac', level: 'city', region: 'Jakarta Selatan', price: 140000, payout: 119000, version: 1, from: dayAt(-90, 0) },
  { id: 'p3', svc: 'plumb', level: 'city', region: 'Jakarta Selatan', price: 200000, payout: 170000, version: 1, from: dayAt(-90, 0) },
  { id: 'p4', svc: 'elec', level: 'zone', region: 'kby', price: 175000, payout: 148750, version: 1, from: dayAt(-90, 0) },
  { id: 'p5', svc: 'handy', level: 'city', region: 'Jakarta Selatan', price: 125000, payout: 106250, version: 1, from: dayAt(-90, 0) },
  { id: 'p6', svc: 'ac', level: 'city', region: 'Bekasi', price: 120000, payout: 102000, version: 1, from: dayAt(-14, 0) },
]

const WORKERS = [
  { id: 'w1', name: 'Budi Santoso', phone: '0812-1111-2222', skills: ['ac', 'elec'], areas: ['Jakarta Selatan'], verified: 'verified', online: true, rating: 4.8, ratingCount: 132, jobs: 132, dist: { kby: 2.3, tbt: 5.1, bks: 20 } },
  { id: 'w2', name: 'Rudi Hartono', phone: '0813-2222-3333', skills: ['ac', 'handy'], areas: ['Jakarta Selatan'], verified: 'verified', online: true, rating: 4.6, ratingCount: 87, jobs: 87, dist: { kby: 4, tbt: 2, bks: 18 } },
  { id: 'w3', name: 'Andi Pratama', phone: '0815-3333-4444', skills: ['plumb', 'handy'], areas: ['Jakarta Selatan'], verified: 'verified', online: false, rating: 4.7, ratingCount: 54, jobs: 54, dist: { kby: 3.5, tbt: 1.2, bks: 17 } },
  { id: 'w4', name: 'Sari Wulandari', phone: '0817-4444-5555', skills: ['plumb'], areas: ['Jakarta Selatan'], verified: 'pending', online: false, rating: 0, ratingCount: 0, jobs: 0, dist: { kby: 1.8, tbt: 3, bks: 19 }, docs: ['KTP', 'SKCK', 'Sertifikat Plumbing'] },
  { id: 'w5', name: 'Dodi Kurnia', phone: '0819-5555-6666', skills: ['elec'], areas: ['Jakarta Selatan', 'Bekasi'], verified: 'pending', online: false, rating: 0, ratingCount: 0, jobs: 0, dist: { kby: 6, tbt: 4, bks: 3 }, docs: ['KTP'] },
]

function initState() {
  const now = Date.now()
  const lg = (t, actor, text) => ({ t, actor, text })
  const mk = (id, svc, area, qty, extra) => ({
    id, svc, area, qty, customer: CUSTOMER, address: 'Jl. Melawai Raya No. 12, Kebayoran Baru', photos: [], payMethod: 'QRIS',
    price: calcPrice(resolvePrice(PRICES, svc, area), svc, qty), extras: [], tried: [], offer: null, needsAdmin: false, workerId: null, ...extra,
  })
  const d2 = dayAt(-2, 10)
  return {
    prices: PRICES,
    workers: WORKERS,
    notifs: [],
    bookings: [
      mk('FX-1003', 'plumb', 'tbt', 1, {
        customer: 'Dewi Lestari', address: 'Jl. Tebet Raya No. 45', detail: 'Pipa di bawah wastafel bocor', schedule: dayAt(1, 10),
        status: 'searching', needsAdmin: true, createdAt: now - 600e3, changedAt: now - 300e3,
        log: [lg(now - 600e3, 'Customer', 'Booking dibuat'), lg(now - 300e3, 'Sistem', 'Tidak ada worker tersedia — perlu intervensi admin')],
      }),
      mk('FX-1002', 'handy', 'kby', 2, {
        detail: 'Pasang 3 rak dinding di dapur', schedule: dayAt(-1, 13), status: 'disputed', workerId: 'w2', createdAt: dayAt(-2, 9), changedAt: now - 3600e3,
        complaint: { text: 'Salah satu rak miring dan goyang setelah 1 hari dipakai', photos: [], status: 'open', t: now - 3600e3 },
        log: [lg(dayAt(-2, 9), 'Customer', 'Booking dibuat'), lg(dayAt(-1, 15), 'Customer', 'Customer mengonfirmasi pekerjaan selesai'), lg(now - 3600e3, 'Customer', 'Mengajukan komplain')],
      }),
      mk('FX-1001', 'ac', 'kby', 2, {
        detail: 'AC kamar tidak dingin', schedule: d2, status: 'completed', workerId: 'w1', rating: 5, review: 'Cepat dan rapi!', createdAt: d2 - 86400e3, changedAt: d2 + 7200e3,
        extras: [{ id: 1, item: 'Isi freon R32', amount: 150000, reason: 'Tekanan freon rendah', status: 'approved' }],
        log: [lg(d2 - 86400e3, 'Customer', 'Booking dibuat'), lg(d2 + 7200e3, 'Customer', 'Customer mengonfirmasi pekerjaan selesai')],
      }),
    ],
  }
}

function reducer(s, a) {
  const now = Date.now()
  const b = s.bookings.find((x) => x.id === a.id)
  const wName = (id) => s.workers.find((w) => w.id === id)?.name
  const note = (st, role, text) => ({ ...st, notifs: [{ id: now + Math.random(), role, text, t: now, read: false }, ...st.notifs] })
  const patch = (st, fn) => ({ ...st, bookings: st.bookings.map((x) => (x.id === a.id ? fn(x) : x)) })
  const log = (x, actor, text, extra = {}) => ({ ...x, ...extra, changedAt: now, log: [...x.log, { t: now, actor, text }] })
  let s2

  switch (a.type) {
    case 'book': {
      const nb = {
        ...a.data, id: a.id, customer: CUSTOMER, status: 'searching', extras: [], tried: [], offer: null, needsAdmin: false, workerId: null, createdAt: now, changedAt: now,
        log: [{ t: now, actor: 'Customer', text: 'Booking dibuat' }, { t: now, actor: 'Sistem', text: `Pembayaran ${rp(a.data.price.base + a.data.price.fee)} via ${a.data.payMethod} berhasil` }],
      }
      return note({ ...s, bookings: [nb, ...s.bookings] }, 'admin', `Booking baru ${a.id} — ${svcOf(nb.svc).name}`)
    }
    case 'offer':
      s2 = patch(s, (x) => log(x, 'Sistem', `Job offer dikirim ke ${wName(a.workerId)} (skor ${a.score})`, { offer: { workerId: a.workerId, at: now, expiresAt: now + 30000 } }))
      return a.workerId === ME ? note(s2, 'worker', `Job offer baru: ${svcOf(b.svc).name} di ${areaOf(b.area).name}`) : s2
    case 'noWorker':
      return note(patch(s, (x) => log(x, 'Sistem', 'Tidak ada worker tersedia — perlu intervensi admin', { needsAdmin: true })), 'admin', `${a.id} butuh penugasan manual`)
    case 'accept':
      s2 = patch(s, (x) => log(x, a.actor, a.actor === 'Admin' ? `Admin menugaskan ${wName(a.workerId)}` : `${wName(a.workerId)} menerima pekerjaan`, { status: 'assigned', workerId: a.workerId, offer: null, needsAdmin: false }))
      s2 = note(s2, 'customer', `${wName(a.workerId)} akan menangani pesanan ${a.id}`)
      return a.actor === 'Admin' && a.workerId === ME ? note(s2, 'worker', `Admin menugaskan ${a.id} kepadamu`) : s2
    case 'decline':
      return patch(s, (x) => log(x, a.reason === 'timeout' ? 'Sistem' : 'Worker', `${wName(a.workerId)} ${a.reason === 'timeout' ? 'tidak merespons (timeout)' : 'menolak offer'}`, { offer: null, tried: [...x.tried, a.workerId] }))
    case 'advance':
      s2 = patch(s, (x) => log(x, a.actor, STATUS[a.status][0], { status: a.status, ...a.extra }))
      return note(s2, 'customer', a.status === 'waiting_confirmation' ? `Pekerjaan ${a.id} selesai — mohon konfirmasi hasilnya` : `${a.id}: ${STATUS[a.status][0]}`)
    case 'requestExtra':
      s2 = patch(s, (x) => log(x, 'Worker', `Mengajukan biaya tambahan: ${a.extra.item} ${rp(a.extra.amount)}`, { extras: [...x.extras, { ...a.extra, id: now, status: 'pending' }] }))
      return note(s2, 'customer', `Persetujuan dibutuhkan: biaya tambahan ${rp(a.extra.amount)}`)
    case 'decideExtra': {
      const e = b.extras.find((x) => x.id === a.extraId)
      s2 = patch(s, (x) => log(x, 'Customer', `${a.ok ? 'Menyetujui' : 'Menolak'} biaya tambahan ${e.item}`, { extras: x.extras.map((y) => (y.id === a.extraId ? { ...y, status: a.ok ? 'approved' : 'rejected' } : y)) }))
      return b.workerId === ME ? note(s2, 'worker', `Customer ${a.ok ? 'menyetujui' : 'menolak'} biaya tambahan ${e.item}`) : s2
    }
    case 'confirm':
      s2 = patch(s, (x) => log(x, 'Customer', 'Customer mengonfirmasi pekerjaan selesai', { status: 'completed' }))
      s2 = { ...s2, workers: s2.workers.map((w) => (w.id === b.workerId ? { ...w, jobs: w.jobs + 1 } : w)) }
      return b.workerId === ME ? note(s2, 'worker', `${a.id} dikonfirmasi. ${rp(b.price.payout + extrasTotal(b))} masuk saldo`) : s2
    case 'rate':
      s2 = patch(s, (x) => log(x, 'Customer', `Memberi rating ${a.stars}★`, { rating: a.stars, review: a.review }))
      return { ...s2, workers: s2.workers.map((w) => (w.id === b.workerId ? { ...w, rating: (w.rating * w.ratingCount + a.stars) / (w.ratingCount + 1), ratingCount: w.ratingCount + 1 } : w)) }
    case 'complain':
      s2 = patch(s, (x) => log(x, 'Customer', 'Mengajukan komplain', { status: 'disputed', complaint: { text: a.text, photos: a.photos, status: 'open', t: now } }))
      return note(s2, 'admin', `Komplain baru pada ${a.id}`)
    case 'resolve': {
      const label = { rework: `Rework gratis dijadwalkan (${a.newId})`, refund: `Refund ${rp(totalOf(b))} diproses`, reject: 'Komplain ditolak setelah peninjauan' }[a.resolution]
      s2 = patch(s, (x) => log(x, 'Admin', label, { status: 'completed', complaint: { ...x.complaint, status: 'resolved', resolution: label }, refund: a.resolution === 'refund' ? totalOf(x) : x.refund }))
      if (a.resolution === 'rework') {
        const nb = {
          ...b, id: a.newId, rework: b.id, status: 'searching', workerId: null, offer: null, tried: [], needsAdmin: false, extras: [], rating: null, review: null, complaint: null,
          beforePhotos: null, afterPhotos: null, price: { ...b.price, base: 0, fee: 0 }, createdAt: now, changedAt: now, log: [{ t: now, actor: 'Admin', text: `Rework dari ${b.id}` }],
        }
        s2 = { ...s2, bookings: [nb, ...s2.bookings] }
      }
      return note(s2, 'customer', `Komplain ${a.id}: ${label}`)
    }
    case 'cancel':
      s2 = patch(s, (x) => log(x, a.actor, `Dibatalkan: ${a.reason}`, { status: 'cancelled', offer: null, refund: a.refund }))
      return note(s2, a.actor === 'Admin' ? 'customer' : 'admin', `${a.id} dibatalkan`)
    case 'verify':
      return { ...s, workers: s.workers.map((w) => (w.id === a.workerId ? { ...w, verified: a.decision, note: a.note, online: a.decision === 'verified' } : w)) }
    case 'setPrice':
      return { ...s, prices: s.prices.map((p) => (p.id === a.pid ? { ...p, price: a.price, payout: a.payout, version: p.version + 1, from: now } : p)) }
    case 'toggleOnline':
      return { ...s, workers: s.workers.map((w) => (w.id === a.workerId ? { ...w, online: !w.online } : w)) }
    case 'read':
      return { ...s, notifs: s.notifs.map((n) => (n.role === a.role ? { ...n, read: true } : n)) }
    default:
      return s
  }
}

const Ctx = createContext()
let seq = 1004

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initState)
  const [now, setNow] = useState(Date.now())

  const act = useMemo(() => {
    const mk = (type, ...keys) => (...args) => dispatch({ type, ...Object.fromEntries(keys.map((k, i) => [k, args[i]])) })
    return {
      book: (data) => {
        const id = 'FX-' + seq++
        dispatch({ type: 'book', id, data })
        return id
      },
      resolve: (id, resolution) => dispatch({ type: 'resolve', id, resolution, newId: 'FX-' + seq++ }),
      offer: mk('offer', 'id', 'workerId', 'score'),
      noWorker: mk('noWorker', 'id'),
      accept: mk('accept', 'id', 'workerId', 'actor'),
      decline: mk('decline', 'id', 'workerId', 'reason'),
      advance: mk('advance', 'id', 'status', 'actor', 'extra'),
      requestExtra: mk('requestExtra', 'id', 'extra'),
      decideExtra: mk('decideExtra', 'id', 'extraId', 'ok'),
      confirm: mk('confirm', 'id'),
      rate: mk('rate', 'id', 'stars', 'review'),
      complain: mk('complain', 'id', 'text', 'photos'),
      cancel: mk('cancel', 'id', 'reason', 'refund', 'actor'),
      verify: mk('verify', 'workerId', 'decision', 'note'),
      setPrice: mk('setPrice', 'pid', 'price', 'payout'),
      toggleOnline: mk('toggleOnline', 'workerId'),
      read: mk('read', 'role'),
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Simulasi backend: matching, timeout offer, dan worker lain yang bekerja otomatis
  useEffect(() => {
    for (const b of state.bookings) {
      if (b.offer) {
        if (now > b.offer.expiresAt) act.decline(b.id, b.offer.workerId, 'timeout')
        else if (b.offer.workerId !== ME && now - b.offer.at > 3000) act.accept(b.id, b.offer.workerId, 'Worker')
      } else if (b.status === 'searching' && !b.needsAdmin && now - b.changedAt > 2000) {
        const c = candidates(state, b).find((c) => c.eligible)
        c ? act.offer(b.id, c.w.id, c.score) : act.noWorker(b.id)
      } else if (b.workerId && b.workerId !== ME && FLOW.includes(b.status) && b.status !== 'waiting_confirmation' && now - b.changedAt > 5000) {
        act.advance(b.id, FLOW[FLOW.indexOf(b.status) + 1], 'Worker', {})
      }
    }
  }, [now])

  return <Ctx.Provider value={{ state, now, act }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
