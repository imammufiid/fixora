import { useState } from 'react'
import { useStore, SERVICES, AREAS, ACTIVE, svcOf, areaOf, resolvePrice, candidates, rp, fmtDate, fmtTime, totalOf, extrasTotal } from './store'
import { Btn, Badge, Card, Row, Empty, inputCls } from './ui'

const NAV = [
  ['dash', '📊', 'Dashboard'],
  ['bookings', '📋', 'Booking'],
  ['verify', '🪪', 'Verifikasi Worker'],
  ['pricing', '💰', 'Harga Regional'],
  ['complaints', '⚠️', 'Komplain'],
]

export default function Admin() {
  const { state, now } = useStore()
  const [page, setPage] = useState('dash')
  const [sel, setSel] = useState(null)
  const counts = {
    bookings: state.bookings.filter((b) => b.needsAdmin && b.status === 'searching').length,
    verify: state.workers.filter((w) => w.verified === 'pending').length,
    complaints: state.bookings.filter((b) => b.complaint?.status === 'open').length,
  }
  const toast = state.notifs.find((n) => n.role === 'admin' && now - n.t < 4000)

  return (
    <div className="w-full max-w-6xl h-[760px] bg-white rounded-xl shadow-xl overflow-hidden flex text-sm relative">
      <aside className="w-52 shrink-0 bg-slate-900 text-slate-300 p-3 flex flex-col gap-1">
        <div className="text-white font-bold px-3 py-2 mb-2">Fixora <span className="text-xs font-normal text-slate-400">Ops Console</span></div>
        {NAV.map(([id, icon, label]) => (
          <button key={id} onClick={() => setPage(id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left ${page === id ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`}>
            <span>{icon}</span>
            <span className="flex-1">{label}</span>
            {counts[id] > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{counts[id]}</span>}
          </button>
        ))}
        <div className="mt-auto px-3 text-xs text-slate-500">Masuk sebagai Operations Admin</div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-5">
        {page === 'dash' && <Dashboard go={setPage} open={setSel} />}
        {page === 'bookings' && <Bookings open={setSel} />}
        {page === 'verify' && <Verify />}
        {page === 'pricing' && <Pricing />}
        {page === 'complaints' && <Complaints open={setSel} />}
      </main>
      {sel && <BookingDrawer id={sel} onClose={() => setSel(null)} />}
      {toast && <div className="absolute bottom-4 right-4 z-50 bg-slate-900 text-white rounded-lg px-4 py-3 shadow-lg">🔔 {toast.text}</div>}
    </div>
  )
}

const H1 = ({ children, sub }) => (
  <div>
    <h1 className="text-xl font-bold">{children}</h1>
    {sub && <p className="text-slate-500">{sub}</p>}
  </div>
)

function BookingTable({ rows, open }) {
  const { state } = useStore()
  if (!rows.length) return <Empty text="Tidak ada data" />
  return (
    <Card className="!p-0 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase">
          <tr>{['ID', 'Layanan', 'Customer', 'Area', 'Jadwal', 'Worker', 'Total', 'Status'].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} onClick={() => open(b.id)} className="border-t border-slate-100 hover:bg-teal-50 cursor-pointer">
              <td className="px-4 py-2.5 font-mono text-xs">{b.id}{b.needsAdmin && b.status === 'searching' && ' 🔴'}</td>
              <td className="px-4">{svcOf(b.svc).icon} {svcOf(b.svc).name}</td>
              <td className="px-4">{b.customer}</td>
              <td className="px-4">{areaOf(b.area).name}</td>
              <td className="px-4 text-xs">{fmtDate(b.schedule)}</td>
              <td className="px-4">{state.workers.find((w) => w.id === b.workerId)?.name || <span className="text-slate-400">—</span>}</td>
              <td className="px-4">{rp(totalOf(b))}</td>
              <td className="px-4"><Badge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function Dashboard({ go, open }) {
  const { state } = useStore()
  const bs = state.bookings
  const done = bs.filter((b) => b.status === 'completed')
  const closed = bs.filter((b) => ['completed', 'cancelled', 'disputed'].includes(b.status))
  const gmv = done.reduce((s, b) => s + totalOf(b), 0)
  const commission = done.reduce((s, b) => s + b.price.base - b.price.payout + b.price.fee, 0)
  const alerts = [
    ...bs.filter((b) => b.needsAdmin && b.status === 'searching').map((b) => ({ text: `${b.id} — ${svcOf(b.svc).name} di ${areaOf(b.area).name} belum mendapat worker`, action: 'Tugaskan', onClick: () => open(b.id) })),
    ...bs.filter((b) => b.complaint?.status === 'open').map((b) => ({ text: `Komplain terbuka pada ${b.id}: "${b.complaint.text}"`, action: 'Tinjau', onClick: () => go('complaints') })),
    ...state.workers.filter((w) => w.verified === 'pending').map((w) => ({ text: `${w.name} menunggu verifikasi dokumen`, action: 'Verifikasi', onClick: () => go('verify') })),
  ]
  const kpis = [
    ['GMV', rp(gmv)],
    ['Komisi + service fee', rp(commission)],
    ['Booking aktif', bs.filter((b) => ACTIVE.includes(b.status)).length],
    ['Completion rate', closed.length ? Math.round((done.length / closed.length) * 100) + '%' : '—'],
    ['Worker online', state.workers.filter((w) => w.online && w.verified === 'verified').length],
  ]
  return (
    <>
      <H1 sub="Ringkasan operasional hari ini · Jakarta Selatan (pilot)">Dashboard</H1>
      <div className="grid grid-cols-5 gap-3">
        {kpis.map(([k, v]) => (
          <Card key={k}><div className="text-xs text-slate-500">{k}</div><div className="text-xl font-bold mt-1">{v}</div></Card>
        ))}
      </div>
      <Card className="space-y-2">
        <div className="font-semibold">Perlu tindakan ({alerts.length})</div>
        {alerts.length === 0 && <div className="text-slate-400">Semua aman 🎉</div>}
        {alerts.map((a, i) => (
          <div key={i} className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <span>{a.text}</span>
            <Btn variant="secondary" className="!py-1" onClick={a.onClick}>{a.action}</Btn>
          </div>
        ))}
      </Card>
      <div className="font-semibold">Booking terbaru</div>
      <BookingTable rows={bs.slice(0, 6)} open={open} />
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

function Bookings({ open }) {
  const { state } = useStore()
  const [f, setF] = useState('all')
  const [q, setQ] = useState('')
  const fn = FILTERS.find((x) => x[0] === f)[2]
  const rows = state.bookings.filter(fn).filter((b) => !q || `${b.id} ${b.customer} ${svcOf(b.svc).name}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <H1 sub="Klik baris untuk melihat detail, matching, dan audit log">Booking</H1>
      <div className="flex gap-3 items-center">
        <div className="flex gap-1">
          {FILTERS.map(([id, label]) => (
            <button key={id} onClick={() => setF(id)} className={`px-3 py-1.5 rounded-full border ${f === id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300'}`}>{label}</button>
          ))}
        </div>
        <input className={`${inputCls} !w-64 ml-auto`} placeholder="Cari ID, customer, layanan…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <BookingTable rows={rows} open={open} />
    </>
  )
}

function BookingDrawer({ id, onClose }) {
  const { state, act } = useStore()
  const b = state.bookings.find((x) => x.id === id)
  const [pick, setPick] = useState('')
  const cands = candidates(state, b)
  const assignable = state.workers.filter((w) => w.verified === 'verified' && w.skills.includes(b.svc))
  const commission = b.price.base - b.price.payout
  return (
    <>
      <div className="absolute inset-0 bg-black/30 z-10" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[460px] bg-white z-20 shadow-2xl overflow-y-auto p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-xs text-slate-500">{b.id}{b.rework && ` · rework dari ${b.rework}`}</div>
            <div className="text-lg font-bold">{svcOf(b.svc).icon} {svcOf(b.svc).name}</div>
          </div>
          <div className="flex items-center gap-3"><Badge status={b.status} /><button onClick={onClose} className="text-xl text-slate-400">×</button></div>
        </div>

        <div className="space-y-1.5">
          <Row label="Customer">{b.customer}</Row>
          <Row label="Alamat">{b.address}</Row>
          <Row label="Jadwal">{fmtDate(b.schedule)}</Row>
          <Row label="Masalah">{b.detail}</Row>
          <Row label="Worker">{state.workers.find((w) => w.id === b.workerId)?.name || '—'}</Row>
        </div>

        <Card className="space-y-1.5 bg-slate-50">
          <div className="font-semibold">Snapshot harga <span className="text-xs font-normal text-slate-500">({b.price.level} {b.price.region} · v{b.price.version})</span></div>
          <Row label="Harga layanan">{rp(b.price.base)}</Row>
          <Row label="Payout worker">{rp(b.price.payout)}</Row>
          <Row label="Komisi platform">{rp(commission)} ({b.price.base ? Math.round((commission / b.price.base) * 100) : 0}%)</Row>
          <Row label="Biaya layanan">{rp(b.price.fee)}</Row>
          <Row label="Biaya tambahan disetujui">{rp(extrasTotal(b))}</Row>
          <Row label={<b className="text-slate-900">Total customer</b>}><b>{rp(totalOf(b))}</b></Row>
        </Card>

        <div className="space-y-2">
          <div className="font-semibold">Kandidat matching</div>
          {cands.length === 0 && <div className="text-slate-400">Tidak ada worker terverifikasi dengan skill & area yang sesuai.</div>}
          {cands.map(({ w, score, eligible }) => (
            <div key={w.id} className="flex justify-between items-center border rounded-lg px-3 py-2">
              <span>{w.name}</span>
              <span className="text-xs text-slate-500">
                skor <b className="text-slate-900">{score}</b> · {!w.online ? 'offline' : b.tried.includes(w.id) ? 'menolak/timeout' : eligible ? 'eligible' : ''}
              </span>
            </div>
          ))}
          {b.status === 'searching' && (
            <div className="flex gap-2 pt-1">
              <select className={inputCls} value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Pilih worker untuk ditugaskan manual…</option>
                {assignable.map((w) => <option key={w.id} value={w.id}>{w.name} {w.online ? '' : '(offline)'} · {w.areas.join(', ')}</option>)}
              </select>
              <Btn disabled={!pick} onClick={() => act.accept(b.id, pick, 'Admin')}>Tugaskan</Btn>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="font-semibold">Audit log</div>
          {[...b.log].reverse().map((l, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="text-slate-400 w-12 shrink-0">{fmtTime(l.t)}</span>
              <span className="w-16 shrink-0 font-medium">{l.actor}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>

        {['searching', 'assigned', 'on_the_way'].includes(b.status) && (
          <Btn variant="secondary" className="w-full !text-red-600" onClick={() => act.cancel(b.id, 'Dibatalkan oleh admin', totalOf(b), 'Admin')}>Batalkan & refund penuh</Btn>
        )}
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
      <H1 sub="Worker hanya menerima job offer setelah terverifikasi">Verifikasi Worker</H1>
      {pending.length === 0 && <Empty text="Tidak ada antrean verifikasi" />}
      <div className="grid grid-cols-2 gap-4">
        {pending.map((w) => (
          <Card key={w.id} className="space-y-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{w.name}</div>
                <div className="text-xs text-slate-500">{w.phone} · {w.areas.join(', ')}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full h-fit ${w.verified === 'revision' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}>{w.verified === 'revision' ? 'Menunggu revisi' : 'Baru'}</span>
            </div>
            <Row label="Keahlian">{skills(w)}</Row>
            <div className="flex gap-2 flex-wrap">{w.docs.map((d) => <span key={d} className="border rounded-lg px-2 py-1 text-xs bg-slate-50 cursor-pointer hover:bg-slate-100">📄 {d}</span>)}</div>
            {w.docs.length < 2 && <div className="text-xs text-amber-700">⚠️ Dokumen kompetensi belum lengkap untuk kategori {skills(w)}</div>}
            <input className={inputCls} placeholder="Catatan untuk worker (wajib jika revisi/tolak)" value={notes[w.id] || ''} onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })} />
            <div className="flex gap-2">
              <Btn className="flex-1" onClick={() => act.verify(w.id, 'verified')}>Setujui</Btn>
              <Btn variant="secondary" className="flex-1" disabled={!notes[w.id]} onClick={() => act.verify(w.id, 'revision', notes[w.id])}>Minta revisi</Btn>
              <Btn variant="secondary" className="flex-1 !text-red-600" disabled={!notes[w.id]} onClick={() => act.verify(w.id, 'rejected', notes[w.id])}>Tolak</Btn>
            </div>
          </Card>
        ))}
      </div>
      <div className="font-semibold">Worker terverifikasi</div>
      <Card className="!p-0">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase">
            <tr>{['Nama', 'Keahlian', 'Area', 'Rating', 'Pekerjaan', 'Status'].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {verified.map((w) => (
              <tr key={w.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5">{w.name}</td>
                <td className="px-4">{skills(w)}</td>
                <td className="px-4">{w.areas.join(', ')}</td>
                <td className="px-4">{w.ratingCount ? `⭐ ${w.rating.toFixed(1)}` : 'Baru'}</td>
                <td className="px-4">{w.jobs}</td>
                <td className="px-4">{w.online ? <span className="text-emerald-600">● Online</span> : <span className="text-slate-400">○ Offline</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

function Pricing() {
  const { state, act } = useStore()
  const [edit, setEdit] = useState(null)
  return (
    <>
      <H1 sub="Prioritas: harga zona → harga kota → layanan tidak tersedia">Harga Regional</H1>
      <Card className="!p-0">
        <div className="px-4 py-3 font-semibold border-b">Cakupan harga per area (harga yang dilihat customer)</div>
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase">
            <tr><th className="px-4 py-2 font-medium">Area</th>{SERVICES.map((s) => <th key={s.id} className="px-4 font-medium">{s.icon} {s.name}</th>)}</tr>
          </thead>
          <tbody>
            {AREAS.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5">{a.name}<div className="text-xs text-slate-400">{a.city}</div></td>
                {SERVICES.map((s) => {
                  const r = resolvePrice(state.prices, s.id, a.id)
                  return (
                    <td key={s.id} className="px-4">
                      {r ? <>{rp(r.price)} <span className={`text-[10px] px-1.5 rounded ${r.level === 'zone' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100'}`}>{r.level}</span></> : <span className="text-red-500 text-xs">Tidak tersedia</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="!p-0">
        <div className="px-4 py-3 font-semibold border-b flex justify-between">
          Aturan harga
          <span className="text-xs font-normal text-slate-500">Perubahan hanya berlaku untuk booking baru — booking terkonfirmasi memakai snapshot.</span>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-slate-500 text-xs uppercase">
            <tr>{['Layanan', 'Level', 'Wilayah', 'Harga', 'Payout worker', 'Komisi', 'Versi', 'Berlaku sejak', ''].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {state.prices.map((p) => {
              const e = edit?.id === p.id
              const price = e ? Number(edit.price) : p.price
              const payout = e ? Number(edit.payout) : p.payout
              const invalid = e && (!(price > 0) || !(payout > 0) || payout >= price)
              return (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5">{svcOf(p.svc).name}</td>
                  <td className="px-4">{p.level}</td>
                  <td className="px-4">{p.level === 'zone' ? areaOf(p.region).name : p.region}</td>
                  <td className="px-4">{e ? <input type="number" className={`${inputCls} !w-28 !py-1`} value={edit.price} onChange={(ev) => setEdit({ ...edit, price: ev.target.value })} /> : rp(p.price)}</td>
                  <td className="px-4">{e ? <input type="number" className={`${inputCls} !w-28 !py-1`} value={edit.payout} onChange={(ev) => setEdit({ ...edit, payout: ev.target.value })} /> : rp(p.payout)}</td>
                  <td className={`px-4 ${invalid ? 'text-red-600' : ''}`}>{price > 0 ? Math.round(((price - payout) / price) * 100) : 0}%</td>
                  <td className="px-4">v{p.version}</td>
                  <td className="px-4 text-xs">{new Date(p.from).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 text-right whitespace-nowrap">
                    {e ? (
                      <>
                        <button className="text-slate-500 mr-3" onClick={() => setEdit(null)}>Batal</button>
                        <Btn className="!py-1" disabled={invalid} onClick={() => { act.setPrice(p.id, price, payout); setEdit(null) }}>Simpan v{p.version + 1}</Btn>
                      </>
                    ) : (
                      <button className="text-teal-700 font-medium" onClick={() => setEdit({ id: p.id, price: p.price, payout: p.payout })}>Ubah</button>
                    )}
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

function Complaints({ open }) {
  const { state, act } = useStore()
  const list = state.bookings.filter((b) => b.complaint).sort((a, b) => (a.complaint.status === 'open' ? -1 : 1) - (b.complaint.status === 'open' ? -1 : 1))
  return (
    <>
      <H1 sub="Tentukan penyelesaian: rework gratis, refund, atau tolak">Komplain</H1>
      {list.length === 0 && <Empty text="Belum ada komplain" />}
      {list.map((b) => (
        <Card key={b.id} className="space-y-3">
          <div className="flex justify-between">
            <div>
              <button className="font-mono text-xs text-teal-700 underline" onClick={() => open(b.id)}>{b.id}</button>
              <div className="font-semibold">{svcOf(b.svc).name} · {b.customer} → {state.workers.find((w) => w.id === b.workerId)?.name}</div>
              <div className="text-xs text-slate-500">Diajukan {fmtDate(b.complaint.t)}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full h-fit ${b.complaint.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{b.complaint.status === 'open' ? 'Terbuka' : 'Selesai'}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">"{b.complaint.text}"</div>
          {b.complaint.status === 'open' ? (
            <div className="flex gap-2">
              <Btn onClick={() => act.resolve(b.id, 'rework')}>Rework gratis</Btn>
              <Btn variant="secondary" onClick={() => act.resolve(b.id, 'refund')}>Refund {rp(totalOf(b))}</Btn>
              <Btn variant="secondary" className="!text-red-600" onClick={() => act.resolve(b.id, 'reject')}>Tolak komplain</Btn>
            </div>
          ) : (
            <div className="text-emerald-700">✔ {b.complaint.resolution}</div>
          )}
        </Card>
      ))}
    </>
  )
}
