import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ShieldCheck, BadgeCheck, Receipt, Wallet, Briefcase, Clock, Check, FileText, Upload, Sparkles, Zap, Search, X, Camera } from 'lucide-react'
import { useStore, useMe, OTP_CODE, AREAS, SERVICE_CITIES, groupByCat, matchSvc, digits, fmtPhone } from './store'
import { Screen, Btn, Field, SvcIcon, Spinner, inputCls, cx } from './ui'

const THEME = {
  customer: {
    app: 'Fixora',
    hero: 'bg-gradient-to-b from-brand-700 to-brand-600',
    safe: 'bg-brand-700',
    logo: 'bg-white text-brand-700',
    title: 'Rumah beres, tanpa ribet.',
    text: 'Pesan teknisi AC, plumbing, listrik, dan handyman terverifikasi dengan harga transparan.',
    perks: [[BadgeCheck, 'Teknisi terverifikasi'], [Receipt, 'Harga transparan di awal'], [ShieldCheck, 'Garansi rework 7 hari']],
    demo: { phone: '0812-3456-7890', name: 'Rina Maharani' },
  },
  worker: {
    app: 'Fixora Mitra',
    hero: 'bg-slate-900',
    safe: 'bg-slate-900',
    logo: 'bg-brand-500 text-white',
    title: 'Dapat order rutin, bayaran pasti.',
    text: 'Bergabung sebagai mitra teknisi Fixora dan terima pekerjaan di sekitar lokasimu.',
    perks: [[Briefcase, 'Job offer sesuai keahlian'], [Wallet, 'Payout otomatis tiap Senin'], [Clock, 'Atur jam kerja sendiri']],
    demo: { phone: '0812-1111-2222', name: 'Budi Santoso' },
  },
}

// Bandingkan nomor tanpa awalan 0 / 62
const norm = (p) => digits(p).replace(/^(62|0)/, '')

export function AuthGate({ role, children }) {
  const me = useMe(role)
  return me ? children : <AuthFlow role={role} />
}

function AuthFlow({ role }) {
  const { state, act } = useStore()
  const t = THEME[role]
  const [step, setStep] = useState('welcome')
  const [mode, setMode] = useState('login')
  const [phone, setPhone] = useState('')
  const users = role === 'worker' ? state.workers : state.customers
  const found = users.find((u) => norm(u.phone) === norm(phone))

  const start = (m) => {
    setMode(m)
    setStep('phone')
  }
  const demoLogin = () => act.login(role, users.find((u) => norm(u.phone) === norm(t.demo.phone)).id)
  const verified = () => (found ? act.login(role, found.id) : setStep('register'))
  const back = { phone: 'welcome', otp: 'phone', register: 'phone' }[step]

  if (step === 'welcome') return <Welcome role={role} onStart={start} onDemo={demoLogin} />
  return (
    <Screen immersive="bg-white" bg="bg-white">
      <div className="flex min-h-full flex-col px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-3">
        <button onClick={() => setStep(back)} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">
          <ChevronLeft size={24} />
        </button>
        <div key={step} className="flex flex-1 animate-slide-left flex-col">
          {step === 'phone' && <PhoneStep role={role} mode={mode} phone={phone} setPhone={setPhone} onNext={() => setStep('otp')} onSwitch={() => setMode(mode === 'login' ? 'register' : 'login')} />}
          {step === 'otp' && <OtpStep phone={phone} onVerified={verified} />}
          {step === 'register' && (role === 'worker' ? <RegisterWorker phone={phone} /> : <RegisterCustomer phone={phone} />)}
        </div>
      </div>
    </Screen>
  )
}

function Welcome({ role, onStart, onDemo }) {
  const { state } = useStore()
  const t = THEME[role]
  return (
    <Screen immersive={t.safe} bg="bg-white">
      <div className="flex min-h-full flex-col">
        <div className={cx('relative overflow-hidden rounded-b-[36px] px-6 pb-10 pt-8 text-white', t.hero)}>
          <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-12 h-40 w-40 rounded-full bg-brand-400/20 blur-xl" />
          <div className="relative flex items-center gap-2.5">
            <span className={cx('flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-extrabold shadow-lg', t.logo)}>F</span>
            <span className="text-lg font-extrabold tracking-tight">{t.app}</span>
          </div>
          <div className="relative mt-10 flex gap-2">
            {state.services.slice(0, 5).map((s, i) => (
              <span key={s.id} className="animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
                <SvcIcon id={s.id} size="lg" solid className="shadow-lg ring-4 ring-white/10" />
              </span>
            ))}
          </div>
          <h1 className="relative mt-6 text-[28px] font-extrabold leading-tight tracking-tight">{t.title}</h1>
          <p className="relative mt-2 text-sm leading-relaxed text-white/70">{t.text}</p>
        </div>

        <div className="flex flex-1 flex-col px-6 pt-7">
          <ul className="space-y-3.5">
            {t.perks.map(([I, l]) => (
              <li key={l} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><I size={18} /></span>
                {l}
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-2.5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-8">
            <Btn size="lg" className="w-full" onClick={() => onStart('login')}>Masuk</Btn>
            <Btn size="lg" variant="secondary" className="w-full" onClick={() => onStart('register')}>{role === 'worker' ? 'Daftar jadi mitra' : 'Buat akun baru'}</Btn>
            <button onClick={onDemo} className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-500 hover:text-brand-700">
              <Zap size={13} /> Masuk cepat sebagai akun demo ({t.demo.name})
            </button>
          </div>
        </div>
      </div>
    </Screen>
  )
}

function PhoneStep({ role, mode, phone, setPhone, onNext, onSwitch }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const t = THEME[role]
  const submit = (e) => {
    e.preventDefault()
    const n = norm(phone)
    if (!/^8\d{8,11}$/.test(n)) return setErr('Masukkan nomor HP yang valid, mis. 812 3456 7890')
    setErr('')
    setBusy(true)
    setTimeout(onNext, 700)
  }
  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{mode === 'login' ? 'Masuk ke akunmu' : role === 'worker' ? 'Daftar jadi mitra' : 'Buat akun Fixora'}</h1>
      <p className="mt-1.5 text-sm text-slate-500">Kami akan mengirim kode verifikasi via SMS/WhatsApp ke nomormu.</p>
      <div className="mt-7">
        <Field label="Nomor HP" error={err} hint={`Akun demo: ${t.demo.phone}`}>
          <div className="flex gap-2">
            <span className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-600">🇮🇩 +62</span>
            <input autoFocus inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="812 3456 7890" className={inputCls} />
          </div>
        </Field>
      </div>
      <div className="mt-auto space-y-3 pt-8">
        <Btn size="lg" className="w-full" disabled={busy || !phone}>{busy ? <Spinner size={18} /> : 'Kirim kode OTP'}</Btn>
        <p className="text-center text-xs text-slate-500">
          {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button type="button" onClick={onSwitch} className="font-bold text-brand-700">{mode === 'login' ? 'Daftar' : 'Masuk'}</button>
        </p>
        <p className="text-center text-[11px] leading-relaxed text-slate-400">Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan serta Kebijakan Privasi Fixora.</p>
      </div>
    </form>
  )
}

function OtpStep({ phone, onVerified }) {
  const { now } = useStore()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentAt, setSentAt] = useState(Date.now())
  const ref = useRef()
  const wait = Math.max(0, 30 - Math.floor((now - sentAt) / 1000))

  useEffect(() => {
    if (code.length < 6) return
    if (code !== OTP_CODE) {
      setErr('Kode salah. Coba lagi.')
      return
    }
    setBusy(true)
    const id = setTimeout(onVerified, 600)
    return () => clearTimeout(id)
  }, [code])

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Masukkan kode OTP</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Kode 6 digit dikirim ke <span className="font-semibold text-slate-800">+62 {norm(phone).replace(/^(\d{3})(\d{4})(\d+)$/, '$1-$2-$3')}</span>
      </p>
      <label className="relative mt-8 grid grid-cols-6 gap-2" onClick={() => ref.current?.focus()}>
        {[...Array(6)].map((_, i) => (
          <span key={i} className={cx('flex h-14 items-center justify-center rounded-2xl border-2 text-xl font-extrabold transition', err ? 'border-rose-300 bg-rose-50 text-rose-600' : busy ? 'border-brand-500 bg-brand-50 text-brand-700' : i === code.length ? 'border-brand-500 bg-white' : code[i] ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50')}>
            {code[i] || ''}
          </span>
        ))}
        <input
          ref={ref}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => {
            setErr('')
            setCode(digits(e.target.value).slice(0, 6))
          }}
          className="absolute inset-0 opacity-0"
        />
      </label>
      <div className="mt-3 min-h-5 text-center text-xs font-medium">
        {err ? <span className="text-rose-600">{err}</span> : busy ? <span className="inline-flex items-center gap-1.5 text-brand-700"><Spinner size={13} /> Memverifikasi…</span> : <span className="text-slate-400">Kode demo: <b className="text-slate-600">{OTP_CODE}</b></span>}
      </div>
      <div className="mt-auto pt-8 text-center text-sm text-slate-500">
        {wait > 0 ? (
          <>Kirim ulang kode dalam <b className="tabular-nums text-slate-800">00:{String(wait).padStart(2, '0')}</b></>
        ) : (
          <button onClick={() => { setSentAt(Date.now()); setCode('') }} className="font-bold text-brand-700">Kirim ulang kode</button>
        )}
      </div>
    </div>
  )
}

function RegisterCustomer({ phone }) {
  const { act } = useStore()
  const [f, setF] = useState({ name: '', email: '', address: '' })
  const [err, setErr] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 3) er.name = 'Nama minimal 3 karakter'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Format email tidak valid'
    setErr(er)
    if (!Object.keys(er).length) act.registerCustomer({ ...f, name: f.name.trim(), phone: fmtPhone('0' + norm(phone)) })
  }
  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Lengkapi profilmu</h1>
      <p className="mt-1.5 text-sm text-slate-500">Nomor terverifikasi. Sedikit lagi, akunmu siap dipakai.</p>
      <div className="mt-6 space-y-4">
        <Field label="Nama lengkap" error={err.name}><input autoFocus value={f.name} onChange={set('name')} placeholder="mis. Rina Maharani" className={inputCls} /></Field>
        <Field label="Email (opsional)" error={err.email} hint="Untuk menerima invoice pesanan."><input type="email" value={f.email} onChange={set('email')} placeholder="nama@email.com" className={inputCls} /></Field>
        <Field label="Alamat utama (opsional)"><textarea rows={2} value={f.address} onChange={set('address')} placeholder="Jl. ..., Kebayoran Baru" className={inputCls} /></Field>
      </div>
      <div className="mt-auto pt-8">
        <Btn size="lg" className="w-full">Buat akun</Btn>
      </div>
    </form>
  )
}

const LIVE_CITIES = new Set(AREAS.map((a) => a.city))
const DOCS = [['KTP', 'Wajib'], ['SKCK', 'Wajib'], ['Sertifikat keahlian', 'Opsional']]

function RegisterWorker({ phone }) {
  const { state, act } = useStore()
  const [sq, setSq] = useState('')
  const [aq, setAq] = useState('')
  const [f, setF] = useState({ name: '', email: '', skills: [], areas: ['Jakarta Selatan'], docs: [], photo: null })
  const [err, setErr] = useState({})
  const [step, setStep] = useState(1)
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] })
  const next = () => {
    const er = {}
    if (step === 1) {
      if (f.name.trim().length < 3) er.name = 'Nama minimal 3 karakter'
      if (!f.skills.length) er.skills = 'Pilih minimal 1 keahlian'
      if (!f.areas.length) er.areas = 'Pilih minimal 1 area'
    } else {
      if (!f.photo) er.photo = 'Foto diri wajib diunggah'
      if (!['KTP', 'SKCK'].every((d) => f.docs.includes(d))) er.docs = 'KTP dan SKCK wajib diunggah'
    }
    setErr(er)
    if (Object.keys(er).length) return
    if (step === 1) setStep(2)
    else act.registerWorker({ name: f.name.trim(), email: f.email, skills: f.skills, areas: f.areas, docs: f.docs, photo: f.photo, phone: fmtPhone('0' + norm(phone)) })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-2 flex gap-1.5">
        {[1, 2].map((i) => <span key={i} className={cx('h-1 flex-1 rounded-full transition', i <= step ? 'bg-brand-500' : 'bg-slate-200')} />)}
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{step === 1 ? 'Data mitra' : 'Unggah dokumen'}</h1>
      <p className="mt-1.5 text-sm text-slate-500">{step === 1 ? 'Ceritakan keahlian dan area kerjamu.' : 'Dokumen dipakai tim kami untuk verifikasi (1–2 hari kerja).'}</p>

      <div key={step} className="mt-6 animate-slide-left space-y-5">
        {step === 1 ? (
          <>
            <Field label="Nama lengkap (sesuai KTP)" error={err.name}><input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="mis. Budi Santoso" className={inputCls} /></Field>
            <Field label="Email (opsional)"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nama@email.com" className={inputCls} /></Field>
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-slate-700">Keahlian</div>
              {/* Katalog bisa panjang: cari + kelompokkan per kategori. Layanan tanpa mitra ditandai agar calon mitra tahu peluangnya. */}
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
                <Search size={16} className="text-slate-400" />
                <input value={sq} onChange={(e) => setSq(e.target.value)} placeholder="Cari keahlian, mis. kulkas" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
                {sq && <button type="button" onClick={() => setSq('')} className="text-slate-400"><X size={15} /></button>}
              </label>
              {f.skills.length > 0 && <div className="text-xs font-semibold text-brand-700">{f.skills.length} keahlian dipilih</div>}
              <div className="max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {groupByCat(state.categories, state.services.filter((s) => !state.svcOff.includes(s.id) && matchSvc(s, sq))).map((g) => (
                  <div key={g.id} className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {g.items.map((s) => {
                        const on = f.skills.includes(s.id)
                        const needed = !state.workers.some((w) => w.verified === 'verified' && w.skills.includes(s.id))
                        return (
                          <button key={s.id} type="button" onClick={() => toggle('skills', s.id)} className={cx('flex items-center gap-2.5 rounded-2xl border p-2.5 text-left text-sm font-semibold transition', on ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/15' : 'border-slate-200 bg-white hover:border-slate-300')}>
                            <SvcIcon id={s.id} size="sm" />
                            <span className="min-w-0 flex-1 leading-tight">
                              <span className="block truncate">{s.name}</span>
                              {needed && <span className="text-[10px] font-bold text-amber-600">Dibutuhkan</span>}
                            </span>
                            {on && <Check size={15} className="shrink-0 text-brand-600" strokeWidth={3} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!state.services.some((s) => matchSvc(s, sq)) && <div className="py-4 text-center text-xs text-slate-400">Keahlian tidak ditemukan</div>}
              </div>
              {err.skills && <div className="text-xs font-medium text-rose-600">{err.skills}</div>}
            </div>
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-slate-700">Area layanan</div>
              {/* Daftar kota panjang: cari + kelompokkan per provinsi. Kota yang sudah beroperasi ditandai. */}
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
                <Search size={16} className="text-slate-400" />
                <input value={aq} onChange={(e) => setAq(e.target.value)} placeholder="Cari kota, mis. Depok" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
                {aq && <button type="button" onClick={() => setAq('')} className="text-slate-400"><X size={15} /></button>}
              </label>
              {f.areas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {f.areas.map((c) => (
                    <button key={c} type="button" onClick={() => toggle('areas', c)} className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                      {c} <X size={12} />
                    </button>
                  ))}
                </div>
              )}
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
                {SERVICE_CITIES.map((g) => ({ ...g, cities: g.cities.filter((c) => `${c} ${g.region}`.toLowerCase().includes(aq.trim().toLowerCase())) })).filter((g) => g.cities.length).map((g) => (
                  <div key={g.region} className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.region}</div>
                    <div className="flex flex-wrap gap-2">
                      {g.cities.map((c) => (
                        <button key={c} type="button" onClick={() => toggle('areas', c)} className={cx('flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ring-1 transition', f.areas.includes(c) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300')}>
                          {c}
                          {LIVE_CITIES.has(c) && <span className={cx('h-1.5 w-1.5 rounded-full', f.areas.includes(c) ? 'bg-white' : 'bg-emerald-500')} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!SERVICE_CITIES.some((g) => g.cities.some((c) => `${c} ${g.region}`.toLowerCase().includes(aq.trim().toLowerCase()))) && <div className="py-4 text-center text-xs text-slate-400">Kota tidak ditemukan</div>}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sudah beroperasi · kota lain dibuka bertahap</div>
              {err.areas && <div className="text-xs font-medium text-rose-600">{err.areas}</div>}
            </div>
          </>
        ) : (
          <div className="space-y-2.5">
            {/* Foto diri dicocokkan admin dengan foto KTP, lalu jadi foto profil yang dilihat customer */}
            <label className={cx('flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition', f.photo ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50 hover:border-brand-400')}>
              {f.photo
                ? <img src={f.photo} className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white" />
                : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200"><Camera size={22} /></span>}
              <div className="flex-1">
                <div className="text-sm font-bold">Foto diri</div>
                <div className="text-xs text-slate-500">{f.photo ? 'Terunggah · ketuk untuk ganti' : 'Wajib · wajah jelas, tanpa masker/kacamata hitam'}</div>
              </div>
              {!f.photo && <Upload size={17} className="text-slate-400" />}
              <input type="file" accept="image/*" capture="user" hidden onChange={(e) => e.target.files.length && setF({ ...f, photo: URL.createObjectURL(e.target.files[0]) })} />
            </label>
            {err.photo && <div className="text-xs font-medium text-rose-600">{err.photo}</div>}
            {DOCS.map(([d, req]) => {
              const on = f.docs.includes(d)
              return (
                <label key={d} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition', on ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50 hover:border-brand-400')}>
                  <span className={cx('flex h-10 w-10 items-center justify-center rounded-xl', on ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200')}>{on ? <Check size={18} strokeWidth={3} /> : <FileText size={18} />}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{d}</div>
                    <div className="text-xs text-slate-500">{on ? 'Terunggah · ketuk untuk ganti' : req}</div>
                  </div>
                  {!on && <Upload size={17} className="text-slate-400" />}
                  <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => e.target.files.length && !on && toggle('docs', d)} />
                </label>
              )
            })}
            {err.docs && <div className="text-xs font-medium text-rose-600">{err.docs}</div>}
            <div className="flex gap-2.5 rounded-2xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
              <Sparkles size={15} className="shrink-0 text-brand-600" />
              Demo: pilih file gambar apa saja. Setelah submit, pendaftaranmu muncul di Admin Ops → Verifikasi Mitra.
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-8">
        {step === 2 && <Btn size="lg" variant="secondary" onClick={() => setStep(1)}>Kembali</Btn>}
        <Btn size="lg" className="flex-1" onClick={next}>{step === 1 ? 'Lanjut' : 'Kirim pendaftaran'}</Btn>
      </div>
    </div>
  )
}
