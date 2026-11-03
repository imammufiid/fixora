import { useState } from 'react'
import { List, ChartGantt } from 'lucide-react'
import { cx, Pill } from './ui'

// Timeline proses (gaya Gantt) untuk order/work order.
// Sumber data: `steps` = [[status, waktu]] yang dicatat setiap kali status berubah.
// `stages` = [{ key, label, bar, optional }] urutan tahap yang punya durasi; status lain (selesai/batal) dianggap titik akhir.

const M = 6e4
const H = 36e5
const D = 864e5
const num = (n) => n.toLocaleString('id-ID', { maximumFractionDigits: 1 })
export const fmtDur = (ms) => (ms < H ? `${Math.max(1, Math.round(ms / M))} mnt` : ms < D ? `${num(ms / H)} jam` : `${num(ms / D)} hari`)
const tick = (t, span) =>
  new Date(t).toLocaleString('id-ID', span < D ? { hour: '2-digit', minute: '2-digit' } : span < 7 * D ? { weekday: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' })

const STRIPES = { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px)' }

export function segments(steps = [], stages, now = Date.now()) {
  const keys = new Set(stages.map((s) => s.key))
  return steps.flatMap(([key, start], i) => {
    if (!keys.has(key)) return []
    const next = steps[i + 1]
    return [{ key, start, end: next ? next[1] : now, running: !next }]
  })
}

// Durasi total per tahap untuk satu order (tahap bisa terjadi lebih dari sekali)
const perStage = (segs) => segs.reduce((m, s) => ({ ...m, [s.key]: { ms: (m[s.key]?.ms || 0) + s.end - s.start, running: m[s.key]?.running || s.running } }), {})

// Rata-rata per tahap; tahap yang masih berjalan tidak dihitung agar angka tidak bias ke bawah
export function stageStats(list, stages, now = Date.now()) {
  const per = list.map((steps) => perStage(segments(steps, stages, now)))
  const out = {}
  for (const s of stages) {
    const done = per.map((p) => p[s.key]).filter((x) => x && !x.running).map((x) => x.ms).sort((a, b) => a - b)
    const running = per.filter((p) => p[s.key]?.running).length
    out[s.key] = done.length
      ? { avg: done.reduce((a, b) => a + b, 0) / done.length, median: done[Math.floor(done.length / 2)], max: done.at(-1), n: done.length, running }
      : { n: 0, running }
  }
  return out
}

const leadTime = (list, stages) => {
  const keys = new Set(stages.map((s) => s.key))
  const done = list.filter((st) => st.length > 1 && !keys.has(st.at(-1)[0])).map((st) => st.at(-1)[1] - st[0][1])
  return done.length ? done.reduce((a, b) => a + b, 0) / done.length : null
}

// Grup pertama selalu keseluruhan, sisanya diurutkan dari jumlah order terbanyak
export function groupSteps(rows, keyFn, allLabel) {
  const m = {}
  rows.forEach((r) => (m[keyFn(r)] ||= []).push(r.steps || []))
  return [{ key: '_all', label: allLabel, list: rows.map((r) => r.steps || []) }, ...Object.entries(m).sort((a, b) => b[1].length - a[1].length).map(([k, list]) => ({ key: k, label: k, list }))]
}

export const Legend = ({ stages }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-500">
    {stages.map((s) => (
      <span key={s.key} className="flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', s.bar)} />{s.label}</span>
    ))}
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-slate-400" style={STRIPES} />Sedang berjalan</span>
  </div>
)

function Axis({ from, span, n = 5 }) {
  return (
    <div className="relative h-5 text-[10px] font-semibold tabular-nums text-slate-400">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={cx('absolute top-0 whitespace-nowrap', i === 0 ? '' : i === n - 1 ? '-translate-x-full' : '-translate-x-1/2')} style={{ left: `${(i / (n - 1)) * 100}%` }}>
          {from === 0 ? (i ? fmtDur((span * i) / (n - 1)) : '0') : tick(from + (span * i) / (n - 1), span)}
        </span>
      ))}
    </div>
  )
}

const Grid = ({ n = 5 }) => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: n }, (_, i) => <span key={i} className="absolute bottom-0 top-0 w-px bg-slate-100" style={{ left: `${(i / (n - 1)) * 100}%` }} />)}
  </div>
)

// ---------- per order: satu baris per tahap, sumbu waktu nyata ----------
export function OrderTimeline({ steps, stages, avg, avgLabel = 'rata-rata' }) {
  const now = Date.now()
  const segs = segments(steps, stages, now)
  if (!segs.length) return <div className="text-[13px] text-slate-400">Belum ada riwayat status untuk ditampilkan.</div>
  const from = segs[0].start
  const to = Math.max(...segs.map((s) => s.end))
  const span = Math.max(to - from, M)
  const per = perStage(segs)
  const rows = stages.filter((s) => !s.optional || per[s.key])
  const current = segs.find((s) => s.running)
  const finished = !current
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
        <span className="text-slate-500">Total {finished ? 'proses' : 'berjalan'} <b className="text-slate-900">{fmtDur(span)}</b></span>
        {current && <span className="text-slate-500">Saat ini di tahap <b className="text-slate-900">{stages.find((s) => s.key === current.key).label}</b> · {fmtDur(now - current.start)}</span>}
        {finished && <Pill tone="emerald" dot>Proses selesai</Pill>}
      </div>
      <div className="grid grid-cols-[176px_1fr_104px] items-center gap-x-4 gap-y-2.5">
        <span />
        <Axis from={from} span={span} />
        <span className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Durasi</span>
        {rows.map((s) => {
          const mine = segs.filter((x) => x.key === s.key)
          const d = per[s.key]
          const a = avg?.[s.key]?.avg
          const slow = d && !d.running && a && d.ms > a * 1.25
          return [
            <div key={s.key + 'l'} className={cx('flex items-center gap-2 text-[13px] font-semibold', !d && 'text-slate-300')}>
              <span className={cx('h-2.5 w-2.5 shrink-0 rounded-sm', d ? s.bar : 'bg-slate-200')} />{s.label}
            </div>,
            <div key={s.key + 't'} className="relative h-7 rounded-lg bg-slate-50">
              <Grid />
              {mine.map((x, i) => (
                <span
                  key={i}
                  title={`${s.label}: ${fmtDur(x.end - x.start)}${x.running ? ' (berjalan)' : ''}`}
                  className={cx('absolute bottom-1 top-1 rounded-md', s.bar, x.running && 'animate-pulse')}
                  style={{ left: `${((x.start - from) / span) * 100}%`, width: `max(4px, ${((x.end - x.start) / span) * 100}%)`, ...(x.running ? STRIPES : {}) }}
                />
              ))}
            </div>,
            <div key={s.key + 'd'} className="text-right">
              <div className={cx('text-[13px] font-bold tabular-nums', !d ? 'text-slate-300' : slow ? 'text-rose-600' : 'text-slate-800')}>{d ? fmtDur(d.ms) : '—'}</div>
              {a && <div className="text-[10px] text-slate-400">{avgLabel} {fmtDur(a)}</div>}
            </div>,
          ]
        })}
      </div>
      <Legend stages={rows} />
    </div>
  )
}

// ---------- ringkasan: rata-rata per tahap, keseluruhan atau per grup ----------
// groups = [{ key, label, list: [steps, ...] }], grup pertama = keseluruhan
export function ProcessSummary({ groups, stages, unit = 'order' }) {
  const stats = groups.map((g) => ({ ...g, s: stageStats(g.list, stages), lead: leadTime(g.list, stages) }))
  const all = stats[0]
  const shown = stages.filter((s) => !s.optional || all.s[s.key].n || all.s[s.key].running)
  const bottleneck = shown.reduce((b, s) => ((all.s[s.key].avg || 0) > (all.s[b]?.avg || 0) ? s.key : b), null)
  const total = (s) => shown.reduce((a, x) => a + (s[x.key].avg || 0), 0)
  const max = Math.max(M, ...stats.map((g) => total(g.s)))
  return (
    <div className="space-y-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}>
        {shown.map((s) => {
          const x = all.s[s.key]
          return (
            <div key={s.key} className={cx('rounded-xl p-3.5 ring-1', s.key === bottleneck ? 'bg-rose-50/60 ring-rose-200' : 'bg-slate-50 ring-slate-200/70')}>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500"><span className={cx('h-2 w-2 rounded-sm', s.bar)} /><span className="truncate">{s.label}</span></div>
              <div className="mt-1.5 text-lg font-extrabold tabular-nums">{x.n ? fmtDur(x.avg) : '—'}</div>
              <div className="text-[11px] text-slate-400">{x.n ? `median ${fmtDur(x.median)} · maks ${fmtDur(x.max)}` : 'belum ada data selesai'}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="text-[10px] font-semibold text-slate-400">{x.n} {unit}{x.running > 0 && ` · ${x.running} berjalan`}</span>
                {s.key === bottleneck && <Pill tone="rose" className="!px-1.5 !text-[10px]">Paling lama</Pill>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-[176px_1fr_120px] items-center gap-x-4 gap-y-2.5">
        <span />
        <Axis from={0} span={max} />
        <span className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead time</span>
        {stats.map((g, gi) => {
          let off = 0
          return [
            <div key={g.key + 'l'} className="min-w-0">
              <div className={cx('truncate text-[13px]', gi === 0 ? 'font-extrabold' : 'font-semibold')}>{g.label}</div>
              <div className="text-[10px] text-slate-400">{g.list.length} {unit}</div>
            </div>,
            <div key={g.key + 't'} className={cx('relative h-7 rounded-lg', gi === 0 ? 'bg-brand-50/50' : 'bg-slate-50')}>
              <Grid />
              {shown.map((s) => {
                const a = g.s[s.key].avg
                if (!a) return null
                const left = off
                off += a
                return (
                  <span key={s.key} title={`${s.label}: rata-rata ${fmtDur(a)} (${g.s[s.key].n} ${unit})`} className={cx('absolute bottom-1 top-1 rounded-md ring-2 ring-white', s.bar)} style={{ left: `${(left / max) * 100}%`, width: `max(4px, ${(a / max) * 100}%)` }} />
                )
              })}
            </div>,
            <div key={g.key + 'd'} className="text-right">
              <div className="text-[13px] font-bold tabular-nums">{g.lead ? fmtDur(g.lead) : '—'}</div>
              <div className="text-[10px] text-slate-400">{total(g.s) ? `Σ tahap ${fmtDur(total(g.s))}` : 'belum ada data'}</div>
            </div>,
          ]
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Legend stages={shown} />
        <span className="text-[11px] text-slate-400">Rata-rata hanya dari tahap yang sudah selesai. Tahap opsional dihitung dari {unit} yang melewatinya saja.</span>
      </div>
    </div>
  )
}

// ---------- daftar order sebagai Gantt ----------
// rows = [{ id, title, sub, steps, right }]
export function GanttList({ rows, stages, onOpen }) {
  const [mode, setMode] = useState('relative')
  const now = Date.now()
  const data = rows.map((r) => ({ ...r, segs: segments(r.steps, stages, now) })).filter((r) => r.segs.length)
  if (!data.length) return <div className="px-5 py-10 text-center text-[13px] text-slate-400">Tidak ada data proses untuk filter ini.</div>
  const starts = data.map((r) => r.segs[0].start)
  const ends = data.map((r) => Math.max(...r.segs.map((s) => s.end)))
  const from = mode === 'relative' ? 0 : Math.min(...starts)
  const span = Math.max(M, mode === 'relative' ? Math.max(...data.map((_, i) => ends[i] - starts[i])) : Math.max(...ends) - from)
  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3">
        <Legend stages={stages} />
        <div className="flex shrink-0 rounded-lg bg-slate-100 p-0.5">
          {[['relative', 'Sejak dibuat'], ['calendar', 'Kalender']].map(([v, l]) => (
            <button key={v} onClick={() => setMode(v)} className={cx('rounded-md px-2.5 py-1 text-[12px] font-semibold transition', mode === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(200px,260px)_1fr_96px] items-center gap-x-4 px-5 pb-2 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order</span>
        <Axis from={from} span={span} />
        <span className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
      </div>
      {data.map((r, i) => {
        const base = mode === 'relative' ? starts[i] : from
        const cur = r.segs.find((s) => s.running)
        return (
          <div key={r.id} onClick={() => onOpen?.(r.id)} className="group grid cursor-pointer grid-cols-[minmax(200px,260px)_1fr_96px] items-center gap-x-4 border-t border-slate-100 px-5 py-2.5 transition hover:bg-brand-50/40">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{r.title}</div>
              <div className="truncate font-mono text-[11px] text-slate-400">{r.sub}</div>
            </div>
            <div className="relative h-6 rounded-md bg-slate-50">
              <Grid />
              {r.segs.map((s, j) => {
                const st = stages.find((x) => x.key === s.key)
                return (
                  <span
                    key={j}
                    title={`${st.label}: ${fmtDur(s.end - s.start)}${s.running ? ' (berjalan)' : ''}`}
                    className={cx('absolute bottom-1 top-1 rounded ring-1 ring-white', st.bar, s.running && 'animate-pulse')}
                    style={{ left: `${((s.start - base) / span) * 100}%`, width: `max(3px, ${((s.end - s.start) / span) * 100}%)`, ...(s.running ? STRIPES : {}) }}
                  />
                )
              })}
            </div>
            <div className="text-right">
              <div className="text-[13px] font-bold tabular-nums">{fmtDur(ends[i] - starts[i])}</div>
              <div className="truncate text-[10px] text-slate-400">{cur ? stages.find((x) => x.key === cur.key).label : r.end || 'selesai'}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const ViewToggle = ({ value, onChange }) => (
  <div className="flex rounded-xl bg-slate-100 p-1">
    {[['list', List, 'Daftar'], ['timeline', ChartGantt, 'Timeline proses']].map(([v, I, l]) => (
      <button key={v} onClick={() => onChange(v)} className={cx('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition', value === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}><I size={15} />{l}</button>
    ))}
  </div>
)
