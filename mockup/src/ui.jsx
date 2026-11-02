import { useState } from 'react'
import { STATUS, fmtTime, useStore } from './store'

export const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500'

export function Btn({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-slate-300',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300',
  }[variant]
  return <button {...p} className={`rounded-lg font-medium text-sm px-4 py-2.5 transition disabled:cursor-not-allowed ${v} ${className}`} />
}

export const Badge = ({ status }) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS[status][1]}`}>{STATUS[status][0]}</span>
export const Card = ({ className = '', ...p }) => <div {...p} className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`} />
export const Row = ({ label, children, className = '' }) => (
  <div className={`flex justify-between gap-3 text-sm ${className}`}>
    <span className="text-slate-500">{label}</span>
    <span className="text-right">{children}</span>
  </div>
)
export const Spinner = () => <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
export const Empty = ({ text }) => <div className="text-center text-sm text-slate-400 py-10">{text}</div>

export function Field({ label, error, hint, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function Segment({ value, onChange, options }) {
  return (
    <div className="flex bg-slate-200 rounded-lg p-1">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 text-sm py-1.5 rounded-md ${value === v ? 'bg-white shadow-sm font-medium' : 'text-slate-500'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

export const Stars = ({ value, onChange, size = 'text-2xl' }) => (
  <div className={`flex gap-1 ${size}`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i)} className={i <= value ? 'text-amber-400' : 'text-slate-300'}>★</button>
    ))}
  </div>
)

export function PhotoInput({ value, onChange, label = 'Foto' }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {value.map((u, i) => (
        <div key={i} className="relative">
          <img src={u} className="w-16 h-16 object-cover rounded-lg border" />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full w-5 h-5 text-xs">×</button>
        </div>
      ))}
      <label className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-500 cursor-pointer hover:border-teal-500">
        📷<span>{label}</span>
        <input type="file" accept="image/*" multiple hidden onChange={(e) => onChange([...value, ...[...e.target.files].map((f) => URL.createObjectURL(f))])} />
      </label>
    </div>
  )
}
export const Thumbs = ({ urls }) =>
  urls?.length ? <div className="flex gap-2 flex-wrap">{urls.map((u, i) => <img key={i} src={u} className="w-14 h-14 object-cover rounded-lg border" />)}</div> : null

export function Sheet({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 bg-black/40 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl p-4 space-y-3 max-h-[85%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-slate-400 text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Phone({ role, title, onBack, right, tabs, tab, onTab, footer, children }) {
  const { state, now, act } = useStore()
  const [bell, setBell] = useState(false)
  const notifs = state.notifs.filter((n) => n.role === role)
  const unread = notifs.filter((n) => !n.read).length
  const toast = notifs.find((n) => now - n.t < 4000)
  return (
    <div className="relative w-[375px] h-[760px] bg-slate-50 rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden flex flex-col shrink-0">
      <div className="h-6 bg-white flex justify-between items-center px-6 text-[10px] font-semibold">
        <span>{fmtTime(now)}</span>
        <span>●●● 🔋</span>
      </div>
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-2 shrink-0">
        {onBack && <button onClick={onBack} className="text-xl -ml-1 px-1">←</button>}
        <div className="font-semibold flex-1 truncate">{title}</div>
        {right}
        <button onClick={() => { setBell(!bell); act.read(role) }} className="relative text-lg">
          🔔
          {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
        </button>
      </header>
      {bell && (
        <div className="absolute top-20 right-3 left-3 z-30 bg-white rounded-xl shadow-xl border max-h-80 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 border-b">Notifikasi</div>
          {notifs.length === 0 && <Empty text="Belum ada notifikasi" />}
          {notifs.map((n) => (
            <div key={n.id} className="px-4 py-2 border-b last:border-0 text-sm">
              {n.text}
              <div className="text-[10px] text-slate-400">{fmtTime(n.t)}</div>
            </div>
          ))}
        </div>
      )}
      {toast && !bell && <div className="absolute top-[5.5rem] left-3 right-3 z-30 bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg">🔔 {toast.text}</div>}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">{children}</main>
      {footer && <div className="bg-white border-t border-slate-200 p-3">{footer}</div>}
      {tabs && (
        <nav className="bg-white border-t border-slate-200 flex">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => onTab(t.id)} className={`flex-1 py-2 text-xs flex flex-col items-center ${tab === t.id ? 'text-teal-600 font-semibold' : 'text-slate-400'}`}>
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
