import { useState } from 'react'
import { Camera, BadgeCheck, Mail, Phone, MapPin, Briefcase, Lock, Eye, EyeOff, ShieldCheck, Smartphone, Monitor, LogOut, Bell, History, User, Check, Trash2 } from 'lucide-react'
import { useAdminAuth } from './adminAuth'
import { useStore, AREAS, fmtDate } from './store'
import { Btn, Card, Pill, Avatar, Empty, inputCls, cx } from './ui'
import { GoogleLogo } from './AuthPages'
import { navigate } from './router'

const TABS = [
  ['profil', User, 'Profil'],
  ['keamanan', ShieldCheck, 'Keamanan'],
  ['notifikasi', Bell, 'Notifikasi'],
  ['aktivitas', History, 'Aktivitas'],
]
const ZONES = ['Semua wilayah', ...new Set(AREAS.map((a) => a.city))]

const Switch = ({ on, onChange }) => (
  <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cx('relative h-6 w-11 shrink-0 rounded-full transition', on ? 'bg-brand-600' : 'bg-slate-300')}>
    <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
  </button>
)

const Section = ({ title, sub, children, footer }) => (
  <Card className="!p-0">
    <div className="border-b border-slate-100 px-6 py-4">
      <div className="font-bold">{title}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
    <div className="p-6">{children}</div>
    {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3">{footer}</div>}
  </Card>
)

const FieldRow = ({ label, hint, children }) => (
  <div className="grid grid-cols-3 gap-6 border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0">
    <div>
      <div className="font-semibold text-slate-700">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
    <div className="col-span-2">{children}</div>
  </div>
)

export default function AdminProfile({ tab = 'profil' }) {
  const { user, session, updateUser, flash } = useAdminAuth()
  const active = TABS.some((t) => t[0] === tab) ? tab : 'profil'

  const onPhoto = (e) => {
    const f = e.target.files[0]
    if (!f) return
    updateUser({ photo: URL.createObjectURL(f) }, 'Foto profil diperbarui')
    flash('Foto profil diperbarui')
  }

  return (
    <>
      <Card className="overflow-hidden !p-0">
        <div className="relative h-32 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900">
          <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>
        <div className="flex items-end gap-5 px-8 pb-6">
          <div className="relative -mt-12">
            <Avatar name={user.name} src={user.photo} size="xl" className="ring-4 ring-white" />
            <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-2 ring-white transition hover:bg-slate-700" title="Ganti foto">
              <Camera size={15} />
              <input type="file" accept="image/*" hidden onChange={onPhoto} />
            </label>
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
              <Pill tone="brand">{user.role}</Pill>
            </div>
            <div className="mt-1 flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email} <BadgeCheck size={15} className="fill-emerald-500 text-white" /></span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {user.zone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">
            {session.method === 'google' ? <GoogleLogo size={14} /> : <Lock size={14} />}
            Login terakhir via {session.method === 'google' ? 'Google' : 'email + verifikasi'}
          </div>
        </div>
        <div className="flex gap-1 border-t border-slate-100 px-6">
          {TABS.map(([id, I, l]) => (
            <a key={id} href={`#/admin/profile?tab=${id}`} className={cx('relative flex items-center gap-2 px-3 py-3.5 font-semibold transition', active === id ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800')}>
              <I size={16} /> {l}
              {active === id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" />}
            </a>
          ))}
        </div>
      </Card>

      <div key={active} className="animate-fade-in space-y-6">
        {active === 'profil' && <ProfileTab />}
        {active === 'keamanan' && <SecurityTab />}
        {active === 'notifikasi' && <NotifTab />}
        {active === 'aktivitas' && <ActivityTab />}
      </div>
    </>
  )
}

function ProfileTab() {
  const { user, updateUser, flash } = useAdminAuth()
  const init = { name: user.name, phone: user.phone, zone: user.zone }
  const [f, setF] = useState(init)
  const [err, setErr] = useState({})
  const dirty = Object.keys(init).some((k) => init[k] !== f[k])
  const set = (k, v) => {
    setF({ ...f, [k]: v })
    setErr({})
  }
  const save = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'Nama minimal 3 karakter.'
    if (!/^0\d{2,3}-?\d{3,4}-?\d{3,5}$/.test(f.phone.trim())) e.phone = 'Format nomor tidak valid, contoh 0812-3456-7890.'
    if (Object.keys(e).length) return setErr(e)
    updateUser({ ...f, name: f.name.trim(), phone: f.phone.trim() }, 'Informasi profil diperbarui')
    flash('Perubahan profil disimpan')
  }
  return (
    <Section
      title="Informasi pribadi"
      sub="Nama dan foto terlihat oleh admin lain di audit log."
      footer={
        <>
          <Btn variant="ghost" disabled={!dirty} onClick={() => { setF(init); setErr({}) }}>Batal</Btn>
          <Btn disabled={!dirty} icon={Check} onClick={save}>Simpan perubahan</Btn>
        </>
      }
    >
      <FieldRow label="Nama lengkap">
        <input className={cx(inputCls, 'max-w-md', err.name && '!border-rose-400')} value={f.name} onChange={(e) => set('name', e.target.value)} />
        {err.name && <div className="mt-1 text-xs font-medium text-rose-600">{err.name}</div>}
      </FieldRow>
      <FieldRow label="Email kerja" hint="Dikelola oleh Super Admin">
        <div className="flex max-w-md items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-slate-500 ring-1 ring-slate-200">
          <Mail size={16} /> <span className="flex-1">{user.email}</span> <Pill tone="emerald" dot>Terverifikasi</Pill>
        </div>
      </FieldRow>
      <FieldRow label="Nomor telepon" hint="Untuk eskalasi darurat">
        <div className="relative max-w-md">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={cx(inputCls, 'pl-10', err.phone && '!border-rose-400')} value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        {err.phone && <div className="mt-1 text-xs font-medium text-rose-600">{err.phone}</div>}
      </FieldRow>
      <FieldRow label="Peran">
        <div className="flex max-w-md items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-slate-500 ring-1 ring-slate-200"><Briefcase size={16} /> {user.role}</div>
      </FieldRow>
      <FieldRow label="Wilayah kerja" hint="Menentukan booking yang muncul di dashboard">
        <select className={cx(inputCls, 'max-w-md')} value={f.zone} onChange={(e) => set('zone', e.target.value)}>
          {ZONES.map((z) => <option key={z}>{z}</option>)}
        </select>
      </FieldRow>
    </Section>
  )
}

const strength = (p) => [p.length >= 8, /[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length

function SecurityTab() {
  const { user, session, updateUser, changePassword, revokeSession, flash } = useAdminAuth()
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [err, setErr] = useState(null)
  const s = strength(pw.next)
  const ready = pw.current && pw.next && pw.confirm

  const submit = () => {
    if (pw.next.length < 8) return setErr('Password baru minimal 8 karakter.')
    if (pw.next !== pw.confirm) return setErr('Konfirmasi password tidak sama.')
    if (pw.next === pw.current) return setErr('Password baru harus berbeda dari password saat ini.')
    const e = changePassword(pw.current, pw.next)
    if (e) return setErr(e)
    setPw({ current: '', next: '', confirm: '' })
    flash('Password berhasil diubah')
  }

  const pwInput = (k, ph) => (
    <div className="relative max-w-md">
      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type={show ? 'text' : 'password'} className={cx(inputCls, 'pl-10 pr-10')} placeholder={ph} value={pw[k]} onChange={(e) => { setPw({ ...pw, [k]: e.target.value }); setErr(null) }} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </div>
  )

  return (
    <>
      <Section title="Ubah password" sub="Gunakan minimal 8 karakter dengan kombinasi huruf besar, angka, dan simbol." footer={<Btn disabled={!ready} onClick={submit}>Perbarui password</Btn>}>
        <FieldRow label="Password saat ini">{pwInput('current', 'Password saat ini')}</FieldRow>
        <FieldRow label="Password baru">
          {pwInput('next', 'Minimal 8 karakter')}
          {pw.next && (
            <div className="mt-2 flex max-w-md items-center gap-3">
              <div className="flex flex-1 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full transition', i < s ? ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'][s - 1] : 'bg-slate-200')} />)}</div>
              <span className="w-14 text-xs font-semibold text-slate-500">{['Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat'][s]}</span>
            </div>
          )}
        </FieldRow>
        <FieldRow label="Konfirmasi password">{pwInput('confirm', 'Ulangi password baru')}</FieldRow>
        {err && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">{err}</div>}
      </Section>

      <Section title="Verifikasi dua langkah" sub="Lapisan keamanan tambahan saat login dari perangkat baru.">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Smartphone size={20} /></span>
          <div className="flex-1">
            <div className="font-semibold">Aplikasi authenticator</div>
            <div className="text-xs text-slate-500">{user.twoFA ? 'Aktif — kode diminta setiap login dari perangkat baru.' : 'Nonaktif — login hanya memakai password + verifikasi email.'}</div>
          </div>
          <Switch on={user.twoFA} onChange={(v) => { updateUser({ twoFA: v }, v ? 'Verifikasi dua langkah diaktifkan' : 'Verifikasi dua langkah dinonaktifkan'); flash(v ? 'Verifikasi dua langkah aktif' : 'Verifikasi dua langkah dinonaktifkan', v ? 'success' : 'info') }} />
        </div>
      </Section>

      <Section title="Akun terhubung" sub="Masuk lebih cepat tanpa password.">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200"><GoogleLogo size={20} /></span>
          <div className="flex-1">
            <div className="font-semibold">Google</div>
            <div className="text-xs text-slate-500">{user.google ? user.email : 'Belum terhubung'}</div>
          </div>
          {user.google ? (
            <Btn variant="secondary" size="sm" disabled={session.method === 'google'} title={session.method === 'google' ? 'Sedang dipakai untuk sesi ini' : undefined} onClick={() => { updateUser({ google: false }, 'Akun Google diputuskan'); flash('Akun Google diputuskan', 'info') }}>Putuskan</Btn>
          ) : (
            <Btn variant="soft" size="sm" onClick={() => { updateUser({ google: true }, 'Akun Google dihubungkan'); flash('Akun Google terhubung') }}>Hubungkan</Btn>
          )}
        </div>
      </Section>

      <Section title="Sesi aktif" sub="Perangkat yang sedang login ke akun ini.">
        <div className="divide-y divide-slate-100">
          {session.sessions.map((x) => (
            <div key={x.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">{x.device.includes('iPhone') ? <Smartphone size={20} /> : <Monitor size={20} />}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 font-semibold">{x.device} {x.current && <Pill tone="emerald" dot>Sesi ini</Pill>}</div>
                <div className="text-xs text-slate-500">{x.place} · {x.current ? 'aktif sekarang' : `terakhir aktif ${fmtDate(x.t)}`}</div>
              </div>
              {!x.current && <Btn variant="ghost" size="sm" icon={Trash2} onClick={() => { revokeSession(x.id); flash(`${x.device} dikeluarkan`, 'info') }}>Keluarkan</Btn>}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const NOTIF = [
  ['booking', 'Booking butuh penugasan manual', 'Saat matching otomatis gagal menemukan mitra'],
  ['complaint', 'Komplain baru', 'Saat customer mengajukan komplain'],
  ['verify', 'Pendaftar mitra baru', 'Saat ada dokumen mitra menunggu verifikasi'],
  ['digest', 'Ringkasan harian via email', 'Rekap GMV, booking, dan komplain setiap pukul 07.00'],
]

function NotifTab() {
  const { user, updateUser, flash } = useAdminAuth()
  return (
    <Section title="Preferensi notifikasi" sub="Pilih aktivitas yang ingin kamu terima di konsol dan email.">
      <div className="divide-y divide-slate-100">
        {NOTIF.map(([k, t, d]) => (
          <div key={k} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex-1">
              <div className="font-semibold">{t}</div>
              <div className="text-xs text-slate-500">{d}</div>
            </div>
            <Switch on={user.notif[k]} onChange={(v) => { updateUser({ notif: { ...user.notif, [k]: v } }); flash('Preferensi notifikasi disimpan') }} />
          </div>
        ))}
      </div>
    </Section>
  )
}

function ActivityTab() {
  const { session } = useAdminAuth()
  const { state } = useStore()
  const ops = state.bookings.flatMap((b) => b.log.filter((l) => l.actor === 'Admin').map((l) => ({ t: l.t, text: l.text, ref: b.id })))
  const items = [...session.history.map((h) => ({ ...h, kind: 'akun' })), ...ops.map((o) => ({ ...o, kind: 'operasional' }))].sort((a, b) => b.t - a.t)
  return (
    <Section title="Riwayat aktivitas" sub="Aktivitas akun dan tindakan operasional kamu di sesi ini.">
      {items.length === 0 && <Empty icon={History} title="Belum ada aktivitas" />}
      <ol>
        {items.map((it, i) => (
          <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
            {i < items.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />}
            <span className={cx('relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-[3px] ring-white', it.kind === 'akun' ? 'bg-brand-500' : 'bg-violet-500')} />
            <div className="flex flex-1 justify-between gap-4">
              <div>
                <span className="text-slate-700">{it.text}</span>
                {it.ref && <button onClick={() => navigate(`/admin/bookings/${it.ref}`)} className="ml-2 font-mono text-xs font-semibold text-brand-700 hover:underline">{it.ref}</button>}
                <div className="mt-0.5"><Pill tone={it.kind === 'akun' ? 'brand' : 'violet'}>{it.kind}</Pill></div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{fmtDate(it.t)}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
