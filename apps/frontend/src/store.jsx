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

// Katalog awal. Admin bisa menambah kategori & layanan baru sesuai demand — sumber kebenaran ada di state.
export const CATEGORIES = [
  { id: 'repair', name: 'Perbaikan Rumah' },
  { id: 'appliance', name: 'Elektronik & Perangkat' },
  { id: 'clean', name: 'Kebersihan' },
  { id: 'outdoor', name: 'Taman & Hama' },
]
export const SERVICES = [
  { id: 'ac', cat: 'appliance', icon: 'Snowflake', name: 'AC Service', desc: 'Cuci AC, cek freon, perbaikan ringan', keywords: 'ac tidak dingin bocor freon cuci', param: { label: 'Jumlah unit AC', unit: 'unit', max: 5, extraRate: 0.8 }, checklist: ['Cek tekanan freon', 'Cuci filter & evaporator', 'Cek saluran drainase', 'Tes suhu output'] },
  { id: 'plumb', cat: 'repair', icon: 'Droplets', name: 'Plumbing', desc: 'Pipa bocor, keran, saluran mampet', keywords: 'pipa bocor keran wastafel mampet toilet air', checklist: ['Identifikasi sumber masalah', 'Perbaikan', 'Tes aliran & kebocoran'] },
  { id: 'elec', cat: 'repair', icon: 'Zap', name: 'Electrical', desc: 'Stop kontak, MCB, instalasi lampu', keywords: 'listrik korslet mcb lampu stop kontak saklar', checklist: ['Matikan MCB', 'Perbaikan', 'Tes beban & grounding'] },
  { id: 'handy', cat: 'repair', icon: 'Hammer', name: 'Handyman', desc: 'Pasang rak, perbaikan pintu, dll', keywords: 'rak pintu engsel gorden tukang pasang', param: { label: 'Estimasi durasi', unit: 'jam', max: 4, extraRate: 1 }, checklist: ['Konfirmasi lingkup kerja', 'Pengerjaan', 'Bersihkan area kerja'] },
  { id: 'paint', cat: 'repair', icon: 'PaintRoller', name: 'Pengecatan', desc: 'Cat ulang dinding & plafon', keywords: 'cat dinding tembok plafon', param: { label: 'Jumlah ruangan', unit: 'ruang', max: 6, extraRate: 0.9 }, checklist: ['Lindungi furnitur & lantai', 'Amplas & dempul', 'Pengecatan 2 lapis', 'Bersihkan area kerja'] },
  { id: 'wash', cat: 'appliance', icon: 'WashingMachine', name: 'Servis Mesin Cuci', desc: 'Tidak berputar, bocor, error', keywords: 'mesin cuci tidak berputar bocor error pengering', checklist: ['Diagnosa error', 'Perbaikan', 'Tes siklus cuci'] },
  { id: 'fridge', cat: 'appliance', icon: 'Refrigerator', name: 'Servis Kulkas', desc: 'Tidak dingin, bunyi, bocor air', keywords: 'kulkas lemari es freezer tidak dingin', checklist: ['Cek kompresor & freon', 'Perbaikan', 'Tes suhu'] },
  { id: 'clean', cat: 'clean', icon: 'Sparkles', name: 'Deep Cleaning', desc: 'Bersih menyeluruh rumah/apartemen', keywords: 'bersih rumah apartemen kamar mandi dapur', param: { label: 'Estimasi durasi', unit: 'jam', max: 6, extraRate: 0.7 }, checklist: ['Konfirmasi area', 'Pembersihan', 'Cek akhir bersama customer'] },
  { id: 'sofa', cat: 'clean', icon: 'Sofa', name: 'Cuci Sofa & Kasur', desc: 'Vakum, shampoo, hilangkan noda', keywords: 'sofa kasur karpet noda tungau', checklist: ['Vakum debu', 'Shampoo & ekstraksi', 'Cek noda tersisa'] },
  { id: 'pest', cat: 'outdoor', icon: 'Bug', name: 'Pest Control', desc: 'Rayap, kecoa, semut, nyamuk', keywords: 'rayap kecoa semut nyamuk tikus hama', checklist: ['Inspeksi titik hama', 'Penyemprotan', 'Edukasi pencegahan'] },
  { id: 'garden', cat: 'outdoor', icon: 'Sprout', name: 'Perawatan Taman', desc: 'Potong rumput, pangkas tanaman', keywords: 'taman rumput tanaman pangkas', checklist: ['Potong rumput', 'Pangkas tanaman', 'Angkut sampah hijau'] },
]
// svcOf/catOf dipakai di banyak tempat di luar React; StoreProvider menyinkronkan katalog ini setiap render.
const catalog = { services: SERVICES, categories: CATEGORIES }
export const svcOf = (id) => catalog.services.find((s) => s.id === id)
export const catOf = (id) => catalog.categories.find((c) => c.id === id)

// Layanan bisa dipesan di area: aktif + punya aturan harga
export const svcAvailable = (state, svc, areaId) => !state.svcOff.includes(svc) && !!resolvePrice(state.prices, svc, areaId)
// Kelompokkan layanan per kategori, urut sesuai daftar kategori; kategori kosong dibuang
export const groupByCat = (categories, services) =>
  categories.map((c) => ({ ...c, items: services.filter((s) => s.cat === c.id) })).filter((g) => g.items.length)
export const matchSvc = (s, q) => !q || `${s.name} ${s.desc} ${s.keywords || ''} ${catOf(s.cat)?.name || ''}`.toLowerCase().includes(q.trim().toLowerCase())

export const AREAS = [
  { id: 'kby', name: 'Kebayoran Baru', city: 'Jakarta Selatan' },
  { id: 'tbt', name: 'Tebet', city: 'Jakarta Selatan' },
  { id: 'bks', name: 'Bekasi Barat', city: 'Bekasi' },
]
export const areaOf = (id) => AREAS.find((a) => a.id === id)

// Kota/kabupaten yang bisa dipilih mitra sebagai area layanan, dikelompokkan per provinsi.
// Kota di luar AREAS belum punya zona aktif — pilihan mitra jadi sinyal ekspansi.
export const SERVICE_CITIES = [
  { region: 'DKI Jakarta', cities: ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'] },
  { region: 'Jawa Barat', cities: ['Bekasi', 'Kabupaten Bekasi', 'Depok', 'Bogor', 'Kabupaten Bogor', 'Bandung', 'Cimahi', 'Karawang', 'Cirebon', 'Sukabumi', 'Tasikmalaya'] },
  { region: 'Banten', cities: ['Tangerang', 'Tangerang Selatan', 'Kabupaten Tangerang', 'Serang', 'Cilegon'] },
  { region: 'Jawa Tengah & DIY', cities: ['Semarang', 'Solo', 'Yogyakarta', 'Sleman', 'Bantul', 'Magelang', 'Purwokerto', 'Tegal', 'Pekalongan'] },
  { region: 'Jawa Timur', cities: ['Surabaya', 'Sidoarjo', 'Gresik', 'Malang', 'Kediri', 'Madiun', 'Jember', 'Banyuwangi'] },
  { region: 'Bali & Nusa Tenggara', cities: ['Denpasar', 'Badung', 'Gianyar', 'Mataram', 'Kupang'] },
  { region: 'Sumatra', cities: ['Medan', 'Palembang', 'Pekanbaru', 'Padang', 'Batam', 'Bandar Lampung', 'Jambi', 'Bengkulu', 'Banda Aceh', 'Pangkal Pinang'] },
  { region: 'Kalimantan', cities: ['Balikpapan', 'Samarinda', 'Banjarmasin', 'Pontianak', 'Palangka Raya'] },
  { region: 'Sulawesi', cities: ['Makassar', 'Manado', 'Kendari', 'Palu', 'Gorontalo'] },
  { region: 'Maluku & Papua', cities: ['Ambon', 'Ternate', 'Jayapura', 'Sorong'] },
]

export const SERVICE_FEE = 10000
// Radius pencarian mitra (km): mulai dari radius awal, diperluas sebelum eskalasi ke admin (FR-047)
export const RADIUS = [5, 10]
export const ME = 'w1'
export const CUSTOMER = 'Rina Maharani'
export const OTP_CODE = '123456'
export const digits = (p = '') => p.replace(/\D/g, '')
export const fmtPhone = (p) => digits(p).replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3')

export const STATUS = {
  pending_payment: ['Menunggu Pembayaran', 'slate'],
  searching: ['Mencari Teknisi', 'amber'],
  assigned: ['Teknisi Ditugaskan', 'sky'],
  on_the_way: ['Dalam Perjalanan', 'sky'],
  arrived: ['Teknisi Tiba', 'sky'],
  in_progress: ['Sedang Dikerjakan', 'violet'],
  waiting_confirmation: ['Menunggu Konfirmasi', 'fuchsia'],
  completed: ['Selesai', 'emerald'],
  cancelled: ['Dibatalkan', 'slate'],
  disputed: ['Dalam Komplain', 'rose'],
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

// Payout mitra: booking selesai yang belum dibayar. Booking dalam komplain ditahan.
export const payoutOf = (b) => b.price.payout + extrasTotal(b)
export const unpaid = (state, workerId) => state.bookings.filter((b) => b.workerId === workerId && b.status === 'completed' && !b.paidOut)
export const held = (state, workerId) => state.bookings.filter((b) => b.workerId === workerId && b.status === 'disputed')

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
    .map((w) => {
      const inRadius = w.dist[b.area] <= (b.radius || RADIUS[0])
      return { w, score: scoreWorker(w, b), inRadius, eligible: w.online && inRadius && !b.tried.includes(w.id) }
    })
    .sort((a, c) => c.score - a.score)
}

const PRICES = [
  { id: 'p1', svc: 'ac', level: 'zone', region: 'kby', price: 150000, payout: 127500, version: 2, from: dayAt(-30, 0) },
  { id: 'p2', svc: 'ac', level: 'city', region: 'Jakarta Selatan', price: 140000, payout: 119000, version: 1, from: dayAt(-90, 0) },
  { id: 'p3', svc: 'plumb', level: 'city', region: 'Jakarta Selatan', price: 200000, payout: 170000, version: 1, from: dayAt(-90, 0) },
  { id: 'p4', svc: 'elec', level: 'zone', region: 'kby', price: 175000, payout: 148750, version: 1, from: dayAt(-90, 0) },
  { id: 'p5', svc: 'handy', level: 'city', region: 'Jakarta Selatan', price: 125000, payout: 106250, version: 1, from: dayAt(-90, 0) },
  { id: 'p6', svc: 'ac', level: 'city', region: 'Bekasi', price: 120000, payout: 102000, version: 1, from: dayAt(-14, 0) },
  { id: 'p7', svc: 'wash', level: 'city', region: 'Jakarta Selatan', price: 160000, payout: 136000, version: 1, from: dayAt(-20, 0) },
  { id: 'p8', svc: 'clean', level: 'city', region: 'Jakarta Selatan', price: 250000, payout: 212500, version: 1, from: dayAt(-10, 0) },
  { id: 'p9', svc: 'sofa', level: 'zone', region: 'kby', price: 220000, payout: 187000, version: 1, from: dayAt(-7, 0) },
]

// Permintaan customer untuk layanan yang belum tersedia di areanya — sinyal demand untuk ekspansi katalog
const req = (svc, area, customer, d) => ({ id: `${svc}-${area}-${customer}`, svc, area, customer, t: dayAt(-d, 9) })
const REQUESTS = [
  ...['Dewi Lestari', 'Agus Salim', 'Maya Putri', 'Fajar Nugroho', 'Lina Marlina'].map((c, i) => req('paint', 'kby', c, i)),
  ...['Hendra Wijaya', 'Sinta Dewi', 'Rizky Ramadhan'].map((c, i) => req('pest', 'tbt', c, i + 1)),
  ...['Yusuf Hakim', 'Nadia Safitri'].map((c, i) => req('fridge', 'kby', c, i + 2)),
  req('plumb', 'bks', 'Bayu Saputra', 1),
]

const CUSTOMERS = [
  { id: 'c1', name: CUSTOMER, phone: '0812-3456-7890', email: 'rina.maharani@gmail.com', address: 'Jl. Melawai Raya No. 12, Kebayoran Baru', joined: dayAt(-140, 0) },
]

const WORKERS = [
  { id: 'w1', name: 'Budi Santoso', phone: '0812-1111-2222', email: 'budi.santoso@gmail.com', joined: dayAt(-400, 0), bank: 'BCA •••• 4321', skills: ['ac', 'elec', 'wash'], areas: ['Jakarta Selatan'], verified: 'verified', online: true, rating: 4.8, ratingCount: 132, jobs: 132, dist: { kby: 2.3, tbt: 5.1, bks: 20 } },
  { id: 'w2', name: 'Rudi Hartono', phone: '0813-2222-3333', skills: ['ac', 'handy'], areas: ['Jakarta Selatan'], verified: 'verified', online: true, rating: 4.6, ratingCount: 87, jobs: 87, dist: { kby: 4, tbt: 2, bks: 18 } },
  { id: 'w3', name: 'Andi Pratama', phone: '0815-3333-4444', skills: ['plumb', 'handy', 'clean', 'sofa'], areas: ['Jakarta Selatan'], verified: 'verified', online: false, rating: 4.7, ratingCount: 54, jobs: 54, dist: { kby: 3.5, tbt: 1.2, bks: 17 } },
  { id: 'w4', name: 'Sari Wulandari', phone: '0817-4444-5555', skills: ['plumb'], areas: ['Jakarta Selatan'], verified: 'pending', online: false, rating: 0, ratingCount: 0, jobs: 0, dist: { kby: 1.8, tbt: 3, bks: 19 }, docs: ['KTP', 'SKCK', 'Sertifikat Plumbing'] },
  { id: 'w5', name: 'Dodi Kurnia', phone: '0819-5555-6666', skills: ['elec'], areas: ['Jakarta Selatan', 'Bekasi'], verified: 'pending', online: false, rating: 0, ratingCount: 0, jobs: 0, dist: { kby: 6, tbt: 4, bks: 3 }, docs: ['KTP'] },
]

function initState() {
  const now = Date.now()
  const lg = (t, actor, text) => ({ t, actor, text })
  const m = 6e4
  const mk = (id, svc, area, qty, extra) => ({
    id, svc, area, qty, customer: CUSTOMER, address: 'Jl. Melawai Raya No. 12, Kebayoran Baru', photos: [], payMethod: 'QRIS',
    price: calcPrice(resolvePrice(PRICES, svc, area), svc, qty), extras: [], tried: [], offer: null, needsAdmin: false, workerId: null, ...extra,
  })
  const d2 = dayAt(-2, 10)
  return {
    prices: PRICES,
    categories: CATEGORIES,
    services: SERVICES,
    requests: REQUESTS,
    workers: WORKERS,
    customers: CUSTOMERS,
    svcOff: [],
    payouts: [
      { id: 'PO-0412', workerId: 'w1', amount: 1840000, count: 11, t: dayAt(-6, 9), ref: 'BCA-7781203' },
      { id: 'PO-0413', workerId: 'w2', amount: 1275000, count: 9, t: dayAt(-6, 9), ref: 'MDR-5510932' },
    ],
    auth: { customer: null, worker: null },
    notifs: [],
    bookings: [
      // Pesanan aktif Rina — status dipilih yang tidak dimajukan otomatis oleh simulasi (mitra = akun demo, atau menunggu konfirmasi)
      mk('FX-0999', 'wash', 'kby', 1, {
        detail: 'Mesin cuci tidak mau berputar saat mode spin', schedule: dayAt(1, 10), status: 'assigned', workerId: 'w1', createdAt: now - 7200e3, changedAt: now - 5400e3,
        steps: [['searching', now - 7200e3], ['assigned', now - 5400e3]],
        log: [lg(now - 7200e3, 'Customer', 'Booking dibuat'), lg(now - 7200e3, 'Sistem', 'Pembayaran Rp170.000 via QRIS berhasil'), lg(now - 5400e3, 'Worker', 'Budi Santoso menerima pekerjaan')],
      }),
      mk('FX-0998', 'sofa', 'kby', 1, {
        detail: 'Sofa 3 dudukan ada noda kopi', schedule: dayAt(0, 9), status: 'waiting_confirmation', workerId: 'w3', payMethod: 'GoPay', createdAt: dayAt(-1, 19), changedAt: now - 1200e3,
        steps: [['searching', dayAt(-1, 19)], ['assigned', dayAt(-1, 20)], ['on_the_way', dayAt(0, 9) - 40 * m], ['arrived', dayAt(0, 9) - 5 * m], ['in_progress', dayAt(0, 9)], ['waiting_confirmation', now - 1200e3]],
        log: [lg(dayAt(-1, 19), 'Customer', 'Booking dibuat'), lg(dayAt(-1, 20), 'Worker', 'Andi Pratama menerima pekerjaan'), lg(dayAt(0, 9), 'Worker', 'Sedang Dikerjakan'), lg(now - 1200e3, 'Worker', 'Menunggu Konfirmasi')],
      }),
      mk('FX-1003', 'plumb', 'tbt', 1, {
        customer: 'Dewi Lestari', address: 'Jl. Tebet Raya No. 45', detail: 'Pipa di bawah wastafel bocor', schedule: dayAt(1, 10),
        status: 'searching', needsAdmin: true, createdAt: now - 600e3, changedAt: now - 300e3,
        steps: [['searching', now - 600e3]],
        log: [lg(now - 600e3, 'Customer', 'Booking dibuat'), lg(now - 300e3, 'Sistem', 'Tidak ada worker tersedia — perlu intervensi admin')],
      }),
      mk('FX-1002', 'handy', 'kby', 2, {
        detail: 'Pasang 3 rak dinding di dapur', schedule: dayAt(-1, 13), status: 'disputed', workerId: 'w2', createdAt: dayAt(-2, 9), changedAt: now - 3600e3,
        complaint: { text: 'Salah satu rak miring dan goyang setelah 1 hari dipakai', photos: [], status: 'open', t: now - 3600e3 },
        steps: [['searching', dayAt(-2, 9)], ['assigned', dayAt(-2, 9) + 25 * m], ['on_the_way', dayAt(-1, 12) + 15 * m], ['arrived', dayAt(-1, 13) - 5 * m], ['in_progress', dayAt(-1, 13)], ['waiting_confirmation', dayAt(-1, 14) + 40 * m], ['completed', dayAt(-1, 15)], ['disputed', now - 3600e3]],
        log: [lg(dayAt(-2, 9), 'Customer', 'Booking dibuat'), lg(dayAt(-1, 15), 'Customer', 'Customer mengonfirmasi pekerjaan selesai'), lg(now - 3600e3, 'Customer', 'Mengajukan komplain')],
      }),
      mk('FX-1001', 'ac', 'kby', 2, {
        detail: 'AC kamar tidak dingin', schedule: d2, status: 'completed', workerId: 'w1', rating: 5, review: 'Cepat dan rapi!', createdAt: d2 - 86400e3, changedAt: d2 + 7200e3,
        extras: [{ id: 1, item: 'Isi freon R32', amount: 150000, reason: 'Tekanan freon rendah', status: 'approved' }],
        steps: [['searching', d2 - 86400e3], ['assigned', d2 - 86400e3 + 12 * m], ['on_the_way', d2 - 35 * m], ['arrived', d2 - 2 * m], ['in_progress', d2 + 3 * m], ['waiting_confirmation', d2 + 100 * m], ['completed', d2 + 120 * m]],
        log: [lg(d2 - 86400e3, 'Customer', 'Booking dibuat'), lg(d2 + 7200e3, 'Customer', 'Customer mengonfirmasi pekerjaan selesai')],
      }),
      // Riwayat Rina
      mk('FX-0997', 'elec', 'kby', 1, {
        detail: 'Stop kontak dapur berbunyi dan panas', schedule: dayAt(-9, 13), status: 'completed', workerId: 'w1', rating: 4, review: 'Rapi, tapi datang agak telat', paidOut: 'PO-0412', createdAt: dayAt(-10, 8), changedAt: dayAt(-9, 15),
        steps: [['searching', dayAt(-10, 8)], ['assigned', dayAt(-10, 8) + 40 * m], ['on_the_way', dayAt(-9, 12) + 20 * m], ['arrived', dayAt(-9, 13) + 20 * m], ['in_progress', dayAt(-9, 13) + 25 * m], ['waiting_confirmation', dayAt(-9, 14) + 30 * m], ['completed', dayAt(-9, 15)]],
        log: [lg(dayAt(-10, 8), 'Customer', 'Booking dibuat'), lg(dayAt(-9, 15), 'Customer', 'Customer mengonfirmasi pekerjaan selesai')],
      }),
      mk('FX-0996', 'clean', 'kby', 2, {
        detail: 'Bersih-bersih apartemen 2 kamar sebelum pindahan', schedule: dayAt(-15, 9), status: 'cancelled', refund: 435000, payMethod: 'Virtual Account BCA', createdAt: dayAt(-17, 20), changedAt: dayAt(-16, 10),
        steps: [['searching', dayAt(-17, 20)], ['cancelled', dayAt(-16, 10)]],
        log: [lg(dayAt(-17, 20), 'Customer', 'Booking dibuat'), lg(dayAt(-16, 10), 'Customer', 'Dibatalkan: Jadwal berubah')],
      }),
      mk('FX-0995', 'plumb', 'kby', 1, {
        detail: 'Keran kamar mandi menetes terus', schedule: dayAt(-21, 10), status: 'completed', workerId: 'w3', rating: 5, review: 'Cepat, penjelasannya jelas', paidOut: 'PO-0411', createdAt: dayAt(-22, 7), changedAt: dayAt(-21, 12),
        steps: [['searching', dayAt(-22, 7)], ['assigned', dayAt(-22, 7) + 8 * m], ['on_the_way', dayAt(-21, 9) + 30 * m], ['arrived', dayAt(-21, 9) + 55 * m], ['in_progress', dayAt(-21, 10)], ['waiting_confirmation', dayAt(-21, 11) + 20 * m], ['completed', dayAt(-21, 12)]],
        log: [lg(dayAt(-22, 7), 'Customer', 'Booking dibuat'), lg(dayAt(-21, 12), 'Customer', 'Customer mengonfirmasi pekerjaan selesai')],
      }),
      mk('FX-0994', 'ac', 'kby', 1, {
        detail: 'Cuci AC rutin ruang tamu', schedule: dayAt(-40, 8), status: 'completed', workerId: 'w2', rating: 5, review: 'Teknisi ramah dan bersih', paidOut: 'PO-0413', createdAt: dayAt(-41, 18), changedAt: dayAt(-40, 10),
        steps: [['searching', dayAt(-41, 18)], ['assigned', dayAt(-41, 18) + 20 * m], ['on_the_way', dayAt(-40, 7) + 25 * m], ['arrived', dayAt(-40, 7) + 58 * m], ['in_progress', dayAt(-40, 8) + 2 * m], ['waiting_confirmation', dayAt(-40, 9) + 30 * m], ['completed', dayAt(-40, 10)]],
        log: [lg(dayAt(-41, 18), 'Customer', 'Booking dibuat'), lg(dayAt(-40, 10), 'Customer', 'Customer mengonfirmasi pekerjaan selesai')],
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
  // steps = riwayat perubahan status [[status, t]], dasar timeline proses di admin
  const log = (x, actor, text, extra = {}) => ({
    ...x, ...extra, changedAt: now, log: [...x.log, { t: now, actor, text }],
    steps: extra.status && extra.status !== x.status ? [...(x.steps || []), [extra.status, now]] : x.steps,
  })
  let s2

  switch (a.type) {
    case 'book': {
      const nb = {
        customer: CUSTOMER, ...a.data, id: a.id, status: 'searching', extras: [], tried: [], offer: null, needsAdmin: false, workerId: null, createdAt: now, changedAt: now, steps: [['searching', now]],
        log: [{ t: now, actor: 'Customer', text: 'Booking dibuat' }, { t: now, actor: 'Sistem', text: `Pembayaran ${rp(a.data.price.base + a.data.price.fee)} via ${a.data.payMethod} berhasil` }],
      }
      return note({ ...s, bookings: [nb, ...s.bookings] }, 'admin', `Booking baru ${a.id} — ${svcOf(nb.svc).name}`)
    }
    case 'offer':
      s2 = patch(s, (x) => log(x, 'Sistem', `Job offer dikirim ke ${wName(a.workerId)} (skor ${a.score})`, { offer: { workerId: a.workerId, at: now, expiresAt: now + 30000 } }))
      return a.workerId === s.auth.worker ? note(s2, 'worker', `Job offer baru: ${svcOf(b.svc).name} di ${areaOf(b.area).name}`) : s2
    case 'expand': {
      const r = b.radius || RADIUS[0]
      const next = RADIUS[RADIUS.indexOf(r) + 1]
      return patch(s, (x) => log(x, 'Sistem', `Tidak ada mitra tersedia dalam ${r} km — radius diperluas ke ${next} km`, { radius: next }))
    }
    case 'noWorker':
      return note(patch(s, (x) => log(x, 'Sistem', 'Tidak ada worker tersedia — perlu intervensi admin', { needsAdmin: true })), 'admin', `${a.id} butuh penugasan manual`)
    case 'accept':
      s2 = patch(s, (x) => log(x, a.actor, a.actor === 'Admin' ? `Admin menugaskan ${wName(a.workerId)}` : `${wName(a.workerId)} menerima pekerjaan`, { status: 'assigned', workerId: a.workerId, offer: null, needsAdmin: false }))
      s2 = note(s2, 'customer', `${wName(a.workerId)} akan menangani pesanan ${a.id}`)
      return a.actor === 'Admin' && a.workerId === s.auth.worker ? note(s2, 'worker', `Admin menugaskan ${a.id} kepadamu`) : s2
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
      return b.workerId === s.auth.worker ? note(s2, 'worker', `Customer ${a.ok ? 'menyetujui' : 'menolak'} biaya tambahan ${e.item}`) : s2
    }
    case 'confirm':
      s2 = patch(s, (x) => log(x, 'Customer', 'Customer mengonfirmasi pekerjaan selesai', { status: 'completed' }))
      s2 = { ...s2, workers: s2.workers.map((w) => (w.id === b.workerId ? { ...w, jobs: w.jobs + 1 } : w)) }
      return b.workerId === s.auth.worker ? note(s2, 'worker', `${a.id} dikonfirmasi. ${rp(b.price.payout + extrasTotal(b))} masuk saldo`) : s2
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
          beforePhotos: null, afterPhotos: null, price: { ...b.price, base: 0, fee: 0 }, createdAt: now, changedAt: now, steps: [['searching', now]], log: [{ t: now, actor: 'Admin', text: `Rework dari ${b.id}` }],
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
      return {
        ...s,
        prices: s.prices.map((p) =>
          p.id === a.pid ? { ...p, price: a.price, payout: a.payout, version: p.version + 1, from: now, history: [{ version: p.version, price: p.price, payout: p.payout, from: p.from, to: now }, ...(p.history || [])] } : p,
        ),
      }
    case 'addPrice':
      return { ...s, prices: [...s.prices, { ...a.rule, id: 'p' + now, version: 1, from: now }] }
    case 'toggleService':
      return { ...s, svcOff: s.svcOff.includes(a.svc) ? s.svcOff.filter((x) => x !== a.svc) : [...s.svcOff, a.svc] }
    case 'addCategory':
      return { ...s, categories: [...s.categories, a.cat] }
    case 'addService':
      return { ...s, services: [...s.services, a.svc] }
    case 'requestService':
      if (s.requests.some((r) => r.svc === a.svc && r.area === a.area && r.customer === a.customer)) return s
      return { ...s, requests: [{ id: `${a.svc}-${a.area}-${a.customer}`, svc: a.svc, area: a.area, customer: a.customer, t: now }, ...s.requests] }
    case 'runPayout': {
      const batch = s.workers
        .map((w) => ({ w, list: unpaid(s, w.id) }))
        .filter((x) => x.list.length)
        .map(({ w, list }, i) => ({ id: `PO-${String(414 + s.payouts.length + i).padStart(4, '0')}`, workerId: w.id, amount: list.reduce((t, b) => t + payoutOf(b), 0), count: list.length, t: now, ref: `TRF-${String(now).slice(-7)}${i}`, ids: list.map((b) => b.id) }))
      const paid = Object.fromEntries(batch.flatMap((p) => p.ids.map((id) => [id, p.id])))
      s2 = { ...s, payouts: [...batch, ...s.payouts], bookings: s.bookings.map((b) => (paid[b.id] ? { ...b, paidOut: paid[b.id] } : b)) }
      return batch.some((p) => p.workerId === s.auth.worker) ? note(s2, 'worker', `Payout ${rp(batch.find((p) => p.workerId === s.auth.worker).amount)} dikirim ke rekeningmu`) : s2
    }
    case 'resubmitDocs':
      return note({ ...s, workers: s.workers.map((w) => (w.id === a.workerId ? { ...w, docs: a.docs, verified: 'pending', note: null } : w)) }, 'admin', `${wName(a.workerId)} mengirim ulang dokumen verifikasi`)
    case 'toggleOnline':
      return { ...s, workers: s.workers.map((w) => (w.id === a.workerId ? { ...w, online: !w.online } : w)) }
    case 'login':
      return { ...s, auth: { ...s.auth, [a.role]: a.userId } }
    case 'logout':
      return { ...s, auth: { ...s.auth, [a.role]: null } }
    case 'registerCustomer':
      return { ...s, customers: [...s.customers, { ...a.data, id: a.userId, joined: now }], auth: { ...s.auth, customer: a.userId } }
    case 'registerWorker': {
      const w = { ...a.data, id: a.userId, joined: now, verified: 'pending', online: false, rating: 0, ratingCount: 0, jobs: 0, dist: { kby: 3, tbt: 3, bks: 15 } }
      return note({ ...s, workers: [...s.workers, w], auth: { ...s.auth, worker: a.userId } }, 'admin', `Pendaftaran mitra baru: ${w.name}`)
    }
    case 'updateProfile': {
      const key = a.role === 'worker' ? 'workers' : 'customers'
      const old = s[key].find((u) => u.id === a.userId)
      s2 = { ...s, [key]: s[key].map((u) => (u.id === a.userId ? { ...u, ...a.data } : u)) }
      // Nama customer disalin ke booking, jadi ikut diperbarui
      return a.role === 'customer' && a.data.name ? { ...s2, bookings: s2.bookings.map((b) => (b.customer === old.name ? { ...b, customer: a.data.name } : b)) } : s2
    }
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
  catalog.services = state.services
  catalog.categories = state.categories
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
      expand: mk('expand', 'id'),
      addPrice: mk('addPrice', 'rule'),
      toggleService: mk('toggleService', 'svc'),
      addCategory: mk('addCategory', 'cat'),
      addService: mk('addService', 'svc'),
      requestService: mk('requestService', 'svc', 'area', 'customer'),
      runPayout: mk('runPayout'),
      resubmitDocs: mk('resubmitDocs', 'workerId', 'docs'),
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
      login: mk('login', 'role', 'userId'),
      logout: mk('logout', 'role'),
      updateProfile: mk('updateProfile', 'role', 'userId', 'data'),
      registerCustomer: (data) => dispatch({ type: 'registerCustomer', userId: 'c' + seq++, data }),
      registerWorker: (data) => dispatch({ type: 'registerWorker', userId: 'w' + seq++, data }),
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
        else if (b.offer.workerId !== state.auth.worker && now - b.offer.at > 3000) act.accept(b.id, b.offer.workerId, 'Worker')
      } else if (b.status === 'searching' && !b.needsAdmin && now - b.changedAt > 2000) {
        const c = candidates(state, b).find((c) => c.eligible)
        if (c) act.offer(b.id, c.w.id, c.score)
        else if ((b.radius || RADIUS[0]) < RADIUS.at(-1)) act.expand(b.id)
        else act.noWorker(b.id)
      } else if (b.workerId && b.workerId !== state.auth.worker && FLOW.includes(b.status) && b.status !== 'waiting_confirmation' && now - b.changedAt > 5000) {
        act.advance(b.id, FLOW[FLOW.indexOf(b.status) + 1], 'Worker', {})
      }
    }
  }, [now])

  return <Ctx.Provider value={{ state, now, act }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

// Akun yang sedang login untuk role tertentu
export function useMe(role) {
  const { state } = useStore()
  const id = state.auth[role]
  return (role === 'worker' ? state.workers : state.customers).find((u) => u.id === id) || null
}
