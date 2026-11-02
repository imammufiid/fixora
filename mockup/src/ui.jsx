import { useState } from 'react'
import { Snowflake, Droplets, Zap, Hammer, Bell, ChevronLeft, ChevronRight, X, Camera, Star, Inbox, LoaderCircle } from 'lucide-react'
import { STATUS, fmtTime, useStore } from './store'

export const cx = (...c) => c.filter(Boolean).join(' ')

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15'

// ---------- tones ----------
export const TONE = {
  slate: { soft: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400', solid: 'bg-slate-600' },
  amber: { soft: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500', solid: 'bg-amber-500' },
  sky: { soft: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', solid: 'bg-sky-500' },
  violet: { soft: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500', solid: 'bg-violet-500' },
  fuchsia: { soft: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200', dot: 'bg-fuchsia-500', solid: 'bg-fuchsia-500' },
  emerald: { soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', solid: 'bg-emerald-500' },
  rose: { soft: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', solid: 'bg-rose-500' },
  brand: { soft: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500', solid: 'bg-brand-600' },
}

export const SVC_STYLE = {
  ac: { Icon: Snowflake, tile: 'bg-sky-50 text-sky-600', solid: 'from-sky-400 to-sky-600' },
  plumb: { Icon: Droplets, tile: 'bg-cyan-50 text-cyan-600', solid: 'from-cyan-400 to-teal-600' },
  elec: { Icon: Zap, tile: 'bg-amber-50 text-amber-600', solid: 'from-amber-400 to-orange-500' },
  handy: { Icon: Hammer, tile: 'bg-orange-50 text-orange-600', solid: 'from-orange-400 to-rose-500' },
}

export function SvcIcon({ id, size = 'md', solid = false, className = '' }) {
  const s = SVC_STYLE[id]
  const dim = { sm: 'w-8 h-8 rounded-lg', md: 'w-10 h-10 rounded-xl', lg: 'w-12 h-12 rounded-2xl', xl: 'w-14 h-14 rounded-2xl' }[size]
  const ic = { sm: 16, md: 20, lg: 24, xl: 28 }[size]
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center', dim, solid ? `bg-gradient-to-br text-white ${s.solid}` : s.tile, className)}>
      <s.Icon size={ic} strokeWidth={2.2} />
    </span>
  )
}

const AVATAR_TONES = ['bg-brand-100 text-brand-700', 'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
export function Avatar({ name = '?', src, size = 'md', className = '' }) {
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('')
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length]
  const dim = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-24 h-24 text-3xl' }[size]
  if (src) return <img src={src} className={cx('shrink-0 rounded-full object-cover', dim, className)} />
  return <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-bold', dim, tone, className)}>{initials}</span>
}

// ---------- primitives ----------
export function Btn({ variant = 'primary', size = 'md', icon: Icon, className = '', children, ...p }) {
  const v = {
    primary: 'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400',
    'danger-soft': 'bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50',
  }[variant]
  const s = { sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg', md: 'h-10 px-4 text-sm gap-2 rounded-xl', lg: 'h-12 px-5 text-[15px] gap-2 rounded-2xl' }[size]
  return (
    <button {...p} className={cx('inline-flex items-center justify-center font-semibold whitespace-nowrap transition active:scale-[0.98] disabled:active:scale-100', s, v, className)}>
      {Icon && <Icon size={size === 'sm' ? 14 : 18} strokeWidth={2.2} />}
      {children}
    </button>
  )
}

export function Pill({ tone = 'slate', dot, className = '', children }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', TONE[tone].soft, className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', TONE[tone].dot)} />}
      {children}
    </span>
  )
}

export const Badge = ({ status, className }) => (
  <Pill tone={STATUS[status][1]} dot className={className}>
    {STATUS[status][0]}
  </Pill>
)

export const Card = ({ className = '', ...p }) => <div {...p} className={cx('rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft', className)} />

export const Row = ({ label, children, className = '' }) => (
  <div className={cx('flex justify-between gap-4 text-sm', className)}>
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-800">{children}</span>
  </div>
)

export const Spinner = ({ size = 16, className = '' }) => <LoaderCircle size={size} className={cx('animate-spin', className)} />

export function Empty({ icon: Icon = Inbox, title, text }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={22} />
      </span>
      {title && <div className="text-sm font-semibold text-slate-700">{title}</div>}
      {text && <div className="mt-1 text-xs text-slate-400">{text}</div>}
    </div>
  )
}

export const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between pt-1">
    <h3 className="text-[15px] font-bold text-slate-900">{children}</h3>
    {action}
  </div>
)

export function Field({ label, error, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-rose-600">{error}</span> : hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

export function Segment({ value, onChange, options }) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={cx('flex-1 rounded-lg py-1.5 text-sm font-semibold transition', value === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          {l}
        </button>
      ))}
    </div>
  )
}

export function Stars({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={!onChange} onMouseEnter={() => onChange && setHover(i)} onClick={() => onChange?.(i)} className={cx('transition disabled:cursor-default', onChange && 'hover:scale-110')}>
          <Star size={size} className={i <= shown ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'} />
        </button>
      ))}
    </div>
  )
}

export function PhotoInput({ value, onChange, label = 'Foto' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {value.map((u, i) => (
        <div key={i} className="relative animate-pop">
          <img src={u} className="h-[72px] w-[72px] rounded-xl object-cover ring-1 ring-slate-200" />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow">
            <X size={12} />
          </button>
        </div>
      ))}
      <label className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
        <Camera size={18} />
        <span>{label}</span>
        <input type="file" accept="image/*" multiple hidden onChange={(e) => onChange([...value, ...[...e.target.files].map((f) => URL.createObjectURL(f))])} />
      </label>
    </div>
  )
}

export const Thumbs = ({ urls, size = 'h-16 w-16' }) =>
  urls?.length ? (
    <div className="flex flex-wrap gap-2">
      {urls.map((u, i) => (
        <img key={i} src={u} className={cx(size, 'rounded-xl object-cover ring-1 ring-slate-200')} />
      ))}
    </div>
  ) : null

export function Sheet({ open, title, subtitle, onClose, children }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40 flex animate-fade-in items-end bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="max-h-[88%] w-full animate-slide-up space-y-4 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-3 scrollbar-none" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold">{title}</div>
            {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ---------- app screen (full-height, lebar mobile) ----------
export function Screen({ role, title, subtitle, onBack, right, tabs, tab, onTab, footer, immersive, bg = 'bg-slate-50', children }) {
  const { state, now, act } = useStore()
  const [bell, setBell] = useState(false)
  const notifs = state.notifs.filter((n) => n.role === role)
  const unread = notifs.filter((n) => !n.read).length
  const toast = notifs.find((n) => now - n.t < 4000)
  const appName = role === 'worker' ? 'Fixora Mitra' : 'Fixora'

  const bellBtn = (
    <button
      onClick={() => {
        setBell(!bell)
        act.read(role)
      }}
      className={cx('relative flex h-9 w-9 items-center justify-center rounded-full transition', immersive ? 'bg-white/15 text-white hover:bg-white/25' : 'text-slate-600 hover:bg-slate-100')}
    >
      <Bell size={18} />
      {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">{unread}</span>}
    </button>
  )

  return (
    <div className={cx('relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden shadow-[0_0_60px_-15px_rgb(15_23_42/0.25)]', bg)}>
      {/* safe area (notch) */}
      <div className={cx('shrink-0 pt-[env(safe-area-inset-top)]', immersive || 'bg-white')} />
      {!immersive && role && (
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-100 bg-white px-3">
          {onBack && (
            <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">
              <ChevronLeft size={22} />
            </button>
          )}
          <div className={cx('min-w-0 flex-1', !onBack && 'pl-2')}>
            <div className="truncate text-[15px] font-bold leading-tight">{title}</div>
            {subtitle && <div className="truncate text-[11px] text-slate-500">{subtitle}</div>}
          </div>
          {right}
          {bellBtn}
        </header>
      )}

      {bell && (
        <div className="absolute left-3 right-3 top-16 z-30 max-h-96 animate-slide-down overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-lift scrollbar-none">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold">Notifikasi</span>
            <button onClick={() => setBell(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          {notifs.length === 0 && <Empty icon={Bell} title="Belum ada notifikasi" />}
          {notifs.map((n) => (
            <div key={n.id} className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              <div className="text-[13px] leading-snug">
                {n.text}
                <div className="mt-0.5 text-[11px] text-slate-400">{fmtTime(n.t)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {role && toast && !bell && (
        <div key={toast.id} className="absolute left-2.5 right-2.5 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex animate-slide-down items-start gap-3 rounded-[22px] bg-white/90 p-3 shadow-lift ring-1 ring-slate-900/5 backdrop-blur-xl">
          <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white', role === 'worker' ? 'bg-slate-900' : 'bg-brand-600')}>F</span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>{appName.toUpperCase()}</span>
              <span>sekarang</span>
            </div>
            <div className="text-[13px] font-medium leading-snug text-slate-900">{toast.text}</div>
          </div>
        </div>
      )}

      <main className={cx('relative flex-1 overflow-y-auto scrollbar-none', !immersive && 'space-y-3 p-4')}>{typeof children === 'function' ? children(bellBtn) : children}</main>
      {footer && <div className="border-t border-slate-100 bg-white px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">{footer}</div>}
      {tabs && (
        <nav className="flex border-t border-slate-100 bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => onTab(t.id)} className={cx('flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold transition', active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600')}>
                <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition', active && 'bg-brand-50')}>
                  <t.icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                {t.label}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

// ---------- profile helpers ----------
export function Menu({ title, children }) {
  return (
    <div>
      {title && <div className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</div>}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft">{children}</div>
    </div>
  )
}

export function MenuItem({ icon: Icon, label, value, onClick, danger, tone = 'bg-slate-100 text-slate-600', right }) {
  return (
    <button onClick={onClick} className={cx('flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50', danger && 'text-rose-600')}>
      <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', danger ? 'bg-rose-50 text-rose-600' : tone)}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {value && <span className="block truncate text-xs text-slate-500">{value}</span>}
      </span>
      {right ?? (!danger && <ChevronRight size={16} className="text-slate-300" />)}
    </button>
  )
}

export const Toggle = ({ on, onChange }) => (
  <span role="switch" aria-checked={on} onClick={(e) => { e.stopPropagation(); onChange(!on) }} className={cx('relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition', on ? 'bg-brand-500' : 'bg-slate-300')}>
    <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
  </span>
)
