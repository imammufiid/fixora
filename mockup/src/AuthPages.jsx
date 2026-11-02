import { useEffect, useRef, useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, ClipboardList, UserCheck, Tags, MailCheck, Inbox, X, CircleCheck, KeyRound } from 'lucide-react'
import { useAdminAuth as useAuth, ACCOUNTS, DEMO_PASSWORD, maskEmail } from './adminAuth'
import { Btn, Spinner, Avatar, inputCls, cx } from './ui'
import { useStore } from './store'

export const GoogleLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
)

function Shell({ children }) {
  const { state } = useStore()
  const verified = state.workers.filter((w) => w.verified === 'verified').length
  return (
    <div className="flex h-screen w-full bg-white">
      <div className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-brand-700">F</span>
          <span className="text-xl font-extrabold">Fixora <span className="font-medium text-brand-200">Admin</span></span>
        </div>
        <div className="relative my-auto max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">Kelola operasional maintenance dalam satu konsol.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-100/80">Pantau booking, tangani komplain, verifikasi mitra, dan atur harga regional — semuanya realtime.</p>
          <div className="mt-10 space-y-4">
            {[
              [ClipboardList, 'Intervensi matching', 'Tugaskan mitra saat matching otomatis gagal'],
              [UserCheck, 'Verifikasi mitra', `${verified} mitra terverifikasi di area pilot`],
              [Tags, 'Harga regional', 'Harga zona & kota dengan versioning snapshot'],
            ].map(([I, t, d]) => (
              <div key={t} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><I size={20} /></span>
                <div>
                  <div className="font-bold">{t}</div>
                  <div className="text-sm text-brand-100/70">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center justify-between text-xs text-brand-200/70">
          <span>© 2026 Fixora · Make property maintenance easier</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Koneksi terenkripsi</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-[400px] animate-slide-up">{children}</div>
      </div>
    </div>
  )
}

function GooglePicker({ onClose }) {
  const { loginGoogle } = useAuth()
  const [busy, setBusy] = useState(null)
  const pick = (email) => {
    setBusy(email)
    loginGoogle(email)
  }
  return (
    <div className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => !busy && onClose()}>
      <div className="w-full max-w-[420px] animate-pop overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 border-b border-slate-100 p-6">
          <GoogleLogo size={24} />
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500">Masuk dengan Google</div>
            <div className="mt-1 text-lg font-bold">Pilih akun</div>
            <div className="text-sm text-slate-500">untuk melanjutkan ke <b className="text-brand-700">Fixora Admin</b></div>
          </div>
          {!busy && <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"><X size={16} /></button>}
        </div>
        <div className="p-2">
          {ACCOUNTS.map((a) => (
            <button key={a.email} disabled={!!busy} onClick={() => pick(a.email)} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-slate-50 disabled:hover:bg-transparent">
              <Avatar name={a.name} />
              <div className="flex-1">
                <div className="text-sm font-semibold">{a.name}</div>
                <div className="text-xs text-slate-500">{a.email}</div>
              </div>
              {busy === a.email && <Spinner className="text-brand-600" />}
            </button>
          ))}
          <div className="mx-4 my-1 h-px bg-slate-100" />
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Mail size={16} /></span>
            Hanya akun Google Workspace @fixora.id yang diizinkan
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 text-[11px] leading-relaxed text-slate-500">Untuk melanjutkan, Google akan membagikan nama, alamat email, dan foto profil kamu dengan Fixora.</div>
      </div>
    </div>
  )
}

export function Login() {
  const { loginPassword } = useAuth()
  const [f, setF] = useState({ email: '', password: '', remember: true })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})
  const [google, setGoogle] = useState(false)
  const [forgot, setForgot] = useState(null)
  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }))
    setErr({})
  }

  const submit = (e) => {
    e.preventDefault()
    const v = {}
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email = 'Masukkan alamat email yang valid.'
    if (f.password.length < 8) v.password = 'Password minimal 8 karakter.'
    if (Object.keys(v).length) return setErr(v)
    setBusy(true)
    loginPassword(f.email, f.password, f.remember).catch((x) => {
      setErr({ [x.field]: x.message })
      setBusy(false)
    })
  }

  if (forgot) return <Forgot initial={forgot} onBack={() => setForgot(null)} />

  return (
    <>
    <Shell>
      <h2 className="text-3xl font-extrabold tracking-tight">Masuk</h2>
      <p className="mt-2 text-slate-500">Selamat datang kembali! Masuk ke konsol admin Fixora.</p>

      <button onClick={() => setGoogle(true)} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white text-[15px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-[0.99]">
        <GoogleLogo /> Masuk dengan Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> atau dengan email <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block space-y-1.5">
          <span className="text-[13px] font-semibold text-slate-700">Email kerja</span>
          <div className="relative">
            <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" autoComplete="email" autoFocus value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="nama@fixora.id" className={cx(inputCls, 'h-12 pl-10', err.email && '!border-rose-400 !ring-rose-500/15')} />
          </div>
          {err.email && <span className="block text-xs font-medium text-rose-600">{err.email}</span>}
        </label>
        <label className="block space-y-1.5">
          <span className="flex items-center justify-between text-[13px] font-semibold text-slate-700">
            Password
            <button type="button" onClick={() => setForgot(f.email || ' ')} className="font-semibold text-brand-700 hover:underline">Lupa password?</button>
          </span>
          <div className="relative">
            <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type={show ? 'text' : 'password'} autoComplete="current-password" value={f.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" className={cx(inputCls, 'h-12 pl-10 pr-11', err.password && '!border-rose-400 !ring-rose-500/15')} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          {err.password && <span className="block text-xs font-medium text-rose-600">{err.password}</span>}
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
          <input type="checkbox" checked={f.remember} onChange={(e) => set('remember', e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Ingat saya di perangkat ini
        </label>
        <Btn size="lg" type="submit" disabled={busy} className="w-full">{busy ? <><Spinner /> Memeriksa…</> : 'Masuk'}</Btn>
      </form>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
        <div className="mb-1.5 flex items-center gap-1.5 font-bold text-slate-700"><KeyRound size={14} /> Akun demo · password <span className="font-mono">{DEMO_PASSWORD}</span></div>
        <div className="space-y-1">
          {ACCOUNTS.map((a) => (
            <button key={a.email} onClick={() => setF({ ...f, email: a.email, password: DEMO_PASSWORD })} className="block text-left hover:text-slate-800">
              <span className="font-mono">{a.email}</span> · {a.role} <span className="font-semibold text-brand-700">— isi otomatis</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">Belum punya akses? Hubungi Super Admin tim operasional.</p>

    </Shell>
    {/* Di luar Shell: container beranimasi transform membuat posisi fixed terkurung */}
    {google && <GooglePicker onClose={() => setGoogle(false)} />}
    </>
  )
}

function Forgot({ initial, onBack }) {
  const [email, setEmail] = useState(initial.trim())
  const [state, setState] = useState(null)
  const valid = /^\S+@\S+\.\S+$/.test(email)
  const send = (e) => {
    e.preventDefault()
    if (!valid) return
    setState('sending')
    setTimeout(() => setState('sent'), 900)
  }
  return (
    <Shell>
      <button onClick={onBack} className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Kembali ke login</button>
      {state === 'sent' ? (
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck size={30} /></span>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight">Cek email kamu</h2>
          <p className="mt-2 text-slate-500">Jika <b className="text-slate-700">{email}</b> terdaftar, kami telah mengirim tautan untuk mengatur ulang password. Tautan berlaku 30 menit.</p>
          <Btn variant="secondary" size="lg" className="mt-8 w-full" onClick={onBack}>Kembali ke login</Btn>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-extrabold tracking-tight">Lupa password?</h2>
          <p className="mt-2 text-slate-500">Masukkan email kerja kamu. Kami akan mengirim tautan untuk membuat password baru.</p>
          <form onSubmit={send} className="mt-8 space-y-4">
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@fixora.id" className={cx(inputCls, 'h-12 pl-10')} />
            </div>
            <Btn size="lg" type="submit" disabled={!valid || state === 'sending'} className="w-full">{state === 'sending' ? <><Spinner /> Mengirim…</> : 'Kirim tautan reset'}</Btn>
          </form>
        </>
      )}
    </Shell>
  )
}

const RESEND_AFTER = 60

export function VerifyEmail() {
  const { session, verifyOtp, resendOtp, logout } = useAuth()
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [now, setNow] = useState(Date.now())
  const refs = useRef([])
  const wait = Math.max(0, RESEND_AFTER - Math.floor((now - session.sentAt) / 1000))

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    refs.current[0]?.focus()
    return () => clearInterval(t)
  }, [])

  const submit = (code) => {
    setBusy(true)
    setErr(null)
    verifyOtp(code)
      .then(() => setDone(true))
      .catch((m) => {
        setErr(m)
        setBusy(false)
        setDigits(Array(6).fill(''))
        refs.current[0]?.focus()
      })
  }

  const fill = (i, val) => {
    const chars = val.replace(/\D/g, '').split('')
    if (!chars.length) return
    const next = [...digits]
    chars.slice(0, 6 - i).forEach((c, k) => (next[i + k] = c))
    setDigits(next)
    setErr(null)
    const last = Math.min(5, i + chars.length)
    refs.current[last]?.focus()
    if (next.every(Boolean)) submit(next.join(''))
  }

  const onKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[i]) next[i] = ''
      else if (i > 0) {
        next[i - 1] = ''
        refs.current[i - 1].focus()
      }
      setDigits(next)
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1].focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1].focus()
  }

  return (
    <Shell>
      <button onClick={logout} className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Gunakan akun lain</button>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{done ? <CircleCheck size={28} className="animate-pop" /> : <MailCheck size={28} />}</span>
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{done ? 'Email terverifikasi' : 'Verifikasi email'}</h2>
      <p className="mt-2 text-slate-500">
        {done ? 'Mengalihkan ke dashboard…' : <>Kami mengirim kode 6 digit ke <b className="text-slate-700">{maskEmail(session.user.email)}</b>. Masukkan kode untuk melanjutkan.</>}
      </p>

      <div className={cx('mt-8 flex gap-2.5', err && 'animate-shake')}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            inputMode="numeric"
            maxLength={6}
            disabled={busy || done}
            onChange={(e) => fill(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={(e) => {
              e.preventDefault()
              fill(0, e.clipboardData.getData('text'))
            }}
            className={cx(
              'h-14 w-full rounded-2xl border bg-white text-center text-2xl font-extrabold tabular-nums outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:bg-slate-50',
              err ? 'border-rose-400' : done ? 'border-emerald-400 text-emerald-600' : d ? 'border-slate-300' : 'border-slate-200',
            )}
          />
        ))}
      </div>
      {err && <div className="mt-3 text-sm font-medium text-rose-600">{err}</div>}
      {busy && !done && <div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Spinner size={14} /> Memverifikasi…</div>}

      {!done && (
        <div className="mt-6 text-sm text-slate-500">
          Tidak menerima kode?{' '}
          {wait > 0 ? (
            <span>Kirim ulang dalam <b className="tabular-nums text-slate-700">0:{String(wait).padStart(2, '0')}</b></span>
          ) : (
            <button onClick={() => { resendOtp(); setNow(Date.now()); setErr(null) }} className="font-semibold text-brand-700 hover:underline">Kirim ulang kode</button>
          )}
        </div>
      )}

      {/* Inbox simulasi — pengganti email sungguhan untuk keperluan demo */}
      {!done && (
        <div key={session.otp} className="mt-10 animate-slide-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400"><Inbox size={13} /> Inbox demo</div>
          <div className="flex gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">F</span>
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="flex justify-between"><b>Fixora Security</b><span className="text-[11px] text-slate-400">baru saja</span></div>
              <div className="font-semibold text-slate-700">Kode verifikasi login kamu</div>
              <div className="mt-1 text-slate-500">
                Gunakan kode <button onClick={() => fill(0, session.otp)} className="rounded-md bg-brand-50 px-1.5 font-mono text-sm font-extrabold tracking-widest text-brand-700 hover:bg-brand-100">{session.otp}</button> untuk masuk. Berlaku 10 menit.
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
