import { createContext, useContext, useEffect, useState } from 'react'

// Simulasi backend autentikasi admin — semua di sisi FE.
export const ACCOUNTS = [
  { email: 'nadia.putri@fixora.id', password: 'fixora123', name: 'Nadia Putri', role: 'Operations Admin', phone: '0812-7788-9900', zone: 'Jakarta Selatan' },
  { email: 'fajar.ramadhan@fixora.id', password: 'fixora123', name: 'Fajar Ramadhan', role: 'Super Admin', phone: '0813-4455-6677', zone: 'Semua wilayah' },
  { email: 'sinta.wijaya@fixora.id', password: 'fixora123', name: 'Sinta Wijaya', role: 'Finance Admin', phone: '0811-2233-4455', zone: 'Semua wilayah' },
]

// Halaman konsol yang boleh dibuka per peran (FR-005, NFR-018 least privilege)
export const ACCESS = {
  'Super Admin': null,
  'Operations Admin': ['dashboard', 'bookings', 'complaints', 'verify', 'customers', 'services', 'pricing'],
  'Finance Admin': ['dashboard', 'bookings', 'customers', 'finance'],
}
export const canOpen = (role, page) => page === 'profile' || !ACCESS[role] || ACCESS[role].includes(page)
export const DEMO_PASSWORD = 'fixora123'
const KEY = 'fixora-admin-session'
const MAX_ATTEMPTS = 5

const newCode = () => String(Math.floor(100000 + Math.random() * 900000))
export const maskEmail = (e) => e.replace(/^(.{2})[^@]*/, (_, a) => a + '•••••')
const log = (text) => ({ t: Date.now(), text })

const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY))
    // Foto berupa blob URL yang mati setelah reload
    if (s?.user?.photo && performance.getEntriesByType('navigation')[0]?.type === 'reload') s.user.photo = null
    return s
  } catch {
    return null
  }
}

const Ctx = createContext()

export function AdminAuthProvider({ children }) {
  // session: { status: 'pending' | 'active', method, remember, user, otp?, sentAt?, history, sessions }
  const [session, setSession] = useState(load)
  const [attempts, setAttempts] = useState({})
  const [toast, setToast] = useState(null)
  // true setelah logout manual: halaman login tidak perlu menyimpan ?next=
  const [loggedOut, setLoggedOut] = useState(false)

  useEffect(() => {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
    if (session) (session.remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session))
  }, [session])

  const flash = (text, tone = 'success') => {
    const id = Date.now()
    setToast({ id, text, tone })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3500)
  }

  const start = (acc, method, remember, extra) => {
    const { password, ...user } = acc
    return {
      method,
      remember,
      user: { ...user, google: method === 'google', twoFA: false, photo: null, notif: { booking: true, complaint: true, verify: true, digest: false } },
      history: [log(method === 'google' ? 'Masuk dengan Google' : 'Masuk dengan email & password')],
      sessions: [
        { id: 'this', device: 'Chrome · macOS', place: 'Jakarta, Indonesia', t: Date.now(), current: true },
        { id: 's2', device: 'Safari · iPhone 15', place: 'Jakarta, Indonesia', t: Date.now() - 2 * 86400e3 },
        { id: 's3', device: 'Edge · Windows', place: 'Bekasi, Indonesia', t: Date.now() - 6 * 86400e3 },
      ],
      ...extra,
    }
  }

  const api = {
    session,
    user: session?.status === 'active' ? session.user : null,
    toast,
    flash,
    loggedOut,

    // Promise + delay agar UI menampilkan loading seperti request jaringan
    loginPassword: (email, password, remember) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          const acc = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase())
          if (!acc) return reject({ field: 'email', message: 'Email tidak terdaftar sebagai admin Fixora.' })
          const n = attempts[acc.email] || 0
          if (n >= MAX_ATTEMPTS) return reject({ field: 'password', message: 'Akun dikunci sementara karena terlalu banyak percobaan.' })
          if (password !== acc.password) {
            setAttempts({ ...attempts, [acc.email]: n + 1 })
            return reject({ field: 'password', message: `Password salah. Sisa ${MAX_ATTEMPTS - n - 1} percobaan.` })
          }
          setAttempts({ ...attempts, [acc.email]: 0 })
          setSession(start(acc, 'password', remember, { status: 'pending', otp: newCode(), sentAt: Date.now() }))
          resolve()
        }, 900),
      ),

    loginGoogle: (email) =>
      new Promise((resolve) =>
        setTimeout(() => {
          setSession(start(ACCOUNTS.find((a) => a.email === email), 'google', true, { status: 'active' }))
          resolve()
        }, 1100),
      ),

    verifyOtp: (code) =>
      new Promise((resolve, reject) =>
        setTimeout(() => {
          if (code !== session.otp) return reject('Kode verifikasi salah. Periksa kembali email kamu.')
          resolve()
          // Beri jeda agar layar "terverifikasi" sempat terlihat
          setTimeout(() => setSession((s) => ({ ...s, status: 'active', otp: null, history: [log('Email terverifikasi dengan kode OTP'), ...s.history] })), 1200)
        }, 700),
      ),

    resendOtp: () => setSession((s) => ({ ...s, otp: newCode(), sentAt: Date.now() })),

    logout: () => {
      setLoggedOut(true)
      setSession(null)
    },

    updateUser: (patch, note) => setSession((s) => ({ ...s, user: { ...s.user, ...patch }, history: note ? [log(note), ...s.history] : s.history })),

    changePassword: (current, next) => {
      const acc = ACCOUNTS.find((a) => a.email === session.user.email)
      if (current !== acc.password) return 'Password saat ini salah.'
      acc.password = next
      setSession((s) => ({ ...s, history: [log('Password diubah'), ...s.history] }))
      return null
    },

    revokeSession: (id) =>
      setSession((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id), history: [log(`Sesi ${s.sessions.find((x) => x.id === id).device} dikeluarkan`), ...s.history] })),
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useAdminAuth = () => useContext(Ctx)
