import { useState } from 'react'
import {
  Pencil, Phone as PhoneIcon, Mail, MapPin, CreditCard, Bell, HelpCircle, FileText, ShieldCheck, LogOut, Wrench,
  Star, CheckCircle2, CalendarDays, BadgeCheck, Landmark, Hourglass, XCircle, QrCode, Wallet, Check, MessageCircle,
} from 'lucide-react'
import { useStore, useMe, svcOf, totalOf } from './store'
import { Screen, Btn, Card, Field, Sheet, Avatar, Pill, SvcIcon, Menu, MenuItem, Toggle, inputCls, cx } from './ui'

const since = (t) => new Date(t).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

// ---------- shared ----------
function EditSheet({ role, me, open, onClose }) {
  const { act } = useStore()
  const [f, setF] = useState({ name: me.name, email: me.email || '' })
  const [err, setErr] = useState('')
  const save = () => {
    if (f.name.trim().length < 3) return setErr('Nama minimal 3 karakter')
    act.updateProfile(role, me.id, { name: f.name.trim(), email: f.email })
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="Edit profil">
      <div className="flex justify-center">
        <div className="relative">
          <Avatar name={f.name || me.name} size="lg" className="!h-20 !w-20 !text-2xl" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white ring-4 ring-white"><Pencil size={12} /></span>
        </div>
      </div>
      <Field label="Nama lengkap" error={err}><input value={f.name} onChange={(e) => { setErr(''); setF({ ...f, name: e.target.value }) }} className={inputCls} /></Field>
      <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nama@email.com" className={inputCls} /></Field>
      <Field label="Nomor HP" hint="Hubungi CS untuk mengganti nomor HP."><input value={me.phone} disabled className={cx(inputCls, 'bg-slate-50 text-slate-500')} /></Field>
      <Btn size="lg" className="w-full" onClick={save}>Simpan perubahan</Btn>
    </Sheet>
  )
}

function LogoutSheet({ role, open, onClose }) {
  const { act } = useStore()
  return (
    <Sheet open={open} onClose={onClose} title="Keluar dari akun?" subtitle="Kamu perlu verifikasi OTP lagi untuk masuk.">
      <div className="flex gap-2">
        <Btn size="lg" variant="secondary" className="flex-1" onClick={onClose}>Batal</Btn>
        <Btn size="lg" variant="danger" className="flex-1" icon={LogOut} onClick={() => act.logout(role)}>Keluar</Btn>
      </div>
    </Sheet>
  )
}

const Stat = ({ icon: I, label, value, dark }) => (
  <div className={cx('rounded-2xl px-3 py-2.5', dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white/10 ring-1 ring-white/15')}>
    <div className={cx('flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider', dark ? 'text-slate-400' : 'text-brand-100')}><I size={11} /> {label}</div>
    <div className="mt-0.5 text-[15px] font-extrabold">{value}</div>
  </div>
)

// ---------- customer ----------
export function CustomerProfile({ bell }) {
  const { state, act } = useStore()
  const me = useMe('customer')
  const [sheet, setSheet] = useState(null)
  const [notif, setNotif] = useState({ push: true, promo: false })
  const [addr, setAddr] = useState(me.address || '')
  const mine = state.bookings.filter((b) => b.customer === me.name)
  const done = mine.filter((b) => b.status === 'completed')
  const spent = done.reduce((s, b) => s + totalOf(b), 0)

  return (
    <div className="pb-6">
      <div className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-brand-700 to-brand-600 px-5 pb-6 pt-4 text-white">
        <div className="pointer-events-none absolute -right-16 -top-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <span className="font-bold">Akun</span>
          {bell}
        </div>
        <div className="relative mt-4 flex items-center gap-3.5">
          <Avatar name={me.name} size="lg" className="!h-16 !w-16 !bg-white/20 !text-xl !text-white ring-2 ring-white/30" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold">{me.name}</div>
            <div className="text-xs text-brand-100">{me.phone}</div>
            <div className="mt-0.5 text-[11px] text-brand-200">Member sejak {since(me.joined)}</div>
          </div>
          <button onClick={() => setSheet('edit')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"><Pencil size={16} /></button>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Stat icon={CalendarDays} label="Pesanan" value={mine.length} />
          <Stat icon={CheckCircle2} label="Selesai" value={done.length} />
          <Stat icon={Wallet} label="Total" value={spent >= 1e6 ? `${(spent / 1e6).toFixed(1).replace('.', ',')}jt` : `${Math.round(spent / 1e3)}rb`} />
        </div>
      </div>

      <div className="space-y-5 px-4 pt-5">
        <Menu title="Akun">
          <MenuItem icon={Mail} label="Email" value={me.email || 'Belum diisi'} onClick={() => setSheet('edit')} />
          <MenuItem icon={MapPin} label="Alamat tersimpan" value={me.address || 'Belum ada alamat'} onClick={() => setSheet('addr')} />
          <MenuItem icon={CreditCard} label="Metode pembayaran" value="QRIS, Virtual Account, e-Wallet" onClick={() => setSheet('pay')} />
        </Menu>
        <Menu title="Notifikasi">
          <MenuItem icon={Bell} label="Status pesanan" value="Push & WhatsApp" right={<Toggle on={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />} onClick={() => setNotif({ ...notif, push: !notif.push })} />
          <MenuItem icon={Mail} label="Promo & info" value="Email mingguan" right={<Toggle on={notif.promo} onChange={(v) => setNotif({ ...notif, promo: v })} />} onClick={() => setNotif({ ...notif, promo: !notif.promo })} />
        </Menu>
        <Menu title="Bantuan">
          <MenuItem icon={MessageCircle} label="Hubungi CS" value="Respons < 5 menit, 07.00–22.00" />
          <MenuItem icon={HelpCircle} label="Pusat bantuan" />
          <MenuItem icon={FileText} label="Syarat & ketentuan" />
          <MenuItem icon={ShieldCheck} label="Kebijakan privasi" />
        </Menu>
        <Menu>
          <MenuItem icon={LogOut} label="Keluar" danger onClick={() => setSheet('logout')} />
        </Menu>
        <div className="text-center text-[11px] text-slate-400">Fixora v1.0.0 (pilot)</div>
      </div>

      {sheet === 'edit' && <EditSheet role="customer" me={me} open onClose={() => setSheet(null)} />}
      <LogoutSheet role="customer" open={sheet === 'logout'} onClose={() => setSheet(null)} />
      <Sheet open={sheet === 'addr'} onClose={() => setSheet(null)} title="Alamat utama" subtitle="Dipakai otomatis saat membuat pesanan.">
        <Field label="Alamat lengkap"><textarea rows={3} value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Jl. ..., Kebayoran Baru" className={inputCls} /></Field>
        <Btn size="lg" className="w-full" onClick={() => { act.updateProfile('customer', me.id, { address: addr.trim() }); setSheet(null) }}>Simpan alamat</Btn>
      </Sheet>
      <Sheet open={sheet === 'pay'} onClose={() => setSheet(null)} title="Metode pembayaran" subtitle="Dipilih saat checkout. Tidak ada kartu yang disimpan.">
        <div className="space-y-2">
          {[[QrCode, 'QRIS', 'Semua e-wallet & m-banking'], [Landmark, 'Virtual Account', 'BCA, Mandiri, BNI, BRI'], [Wallet, 'e-Wallet', 'GoPay, OVO, DANA, ShopeePay']].map(([I, t, d]) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><I size={18} /></span>
              <div className="flex-1"><div className="text-sm font-bold">{t}</div><div className="text-xs text-slate-500">{d}</div></div>
              <Check size={16} className="text-emerald-500" />
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  )
}

// ---------- mitra ----------
export function WorkerProfile({ bell }) {
  const { state } = useStore()
  const me = useMe('worker')
  const [sheet, setSheet] = useState(null)
  const earned = state.bookings.filter((b) => b.workerId === me.id && b.status === 'completed').length

  return (
    <div className="pb-6">
      <div className="relative overflow-hidden rounded-b-[32px] bg-slate-900 px-5 pb-6 pt-4 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <span className="font-bold">Akun Mitra</span>
          {bell}
        </div>
        <div className="relative mt-4 flex items-center gap-3.5">
          <Avatar name={me.name} src={me.photo} size="lg" className="!h-16 !w-16 !text-xl ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-extrabold">{me.name}</div>
            <div className="flex items-center gap-1 text-xs text-brand-300"><BadgeCheck size={13} /> Mitra terverifikasi</div>
            <div className="mt-0.5 text-[11px] text-slate-400">{me.phone} · sejak {since(me.joined)}</div>
          </div>
          <button onClick={() => setSheet('edit')} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><Pencil size={16} /></button>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Stat dark icon={Star} label="Rating" value={me.rating.toFixed(2)} />
          <Stat dark icon={CheckCircle2} label="Selesai" value={me.jobs} />
          <Stat dark icon={MessageCircle} label="Ulasan" value={me.ratingCount} />
        </div>
      </div>

      <div className="space-y-5 px-4 pt-5">
        <div>
          <div className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Keahlian & area</div>
          <Card className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {me.skills.map((s) => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-slate-50 py-1 pl-1 pr-3 text-[13px] font-semibold ring-1 ring-slate-200">
                  <SvcIcon id={s} size="sm" /> {svcOf(s).name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-[13px] text-slate-600">
              <MapPin size={15} className="text-slate-400" /> {me.areas.join(', ')}
            </div>
          </Card>
        </div>
        <Menu title="Dokumen verifikasi">
          {['KTP', 'SKCK', 'Sertifikat keahlian'].map((d) => (
            <MenuItem key={d} icon={FileText} label={d} value="Diverifikasi tim Fixora" right={<Pill tone="emerald"><Check size={11} strokeWidth={3} /> Valid</Pill>} />
          ))}
        </Menu>
        <Menu title="Akun">
          <MenuItem icon={PhoneIcon} label="Nomor HP" value={me.phone} />
          <MenuItem icon={Mail} label="Email" value={me.email || 'Belum diisi'} onClick={() => setSheet('edit')} />
          <MenuItem icon={Landmark} label="Rekening payout" value={me.bank || 'Belum diatur'} />
        </Menu>
        <Menu title="Bantuan">
          <MenuItem icon={MessageCircle} label="Hubungi tim mitra" value="Senin–Sabtu, 08.00–20.00" />
          <MenuItem icon={FileText} label="Kode etik mitra" />
        </Menu>
        <Menu>
          <MenuItem icon={LogOut} label="Keluar" danger onClick={() => setSheet('logout')} />
        </Menu>
        <div className="text-center text-[11px] text-slate-400">Fixora Mitra v1.0.0 (pilot) · {earned} pekerjaan selesai di demo ini</div>
      </div>

      {sheet === 'edit' && <EditSheet role="worker" me={me} open onClose={() => setSheet(null)} />}
      <LogoutSheet role="worker" open={sheet === 'logout'} onClose={() => setSheet(null)} />
    </div>
  )
}

// Mitra yang baru mendaftar: belum bisa menerima pekerjaan sampai diverifikasi admin
export function WorkerPending() {
  const { act } = useStore()
  const me = useMe('worker')
  const [logout, setLogout] = useState(false)
  const st = {
    pending: [Hourglass, 'bg-amber-500', 'Pendaftaran sedang ditinjau', 'Tim kami memverifikasi dokumenmu dalam 1–2 hari kerja. Kami kabari via WhatsApp.'],
    revision: [FileText, 'bg-amber-500', 'Dokumen perlu diperbaiki', me.note || 'Tim kami meminta perbaikan dokumen. Unggah ulang di bawah.'],
    rejected: [XCircle, 'bg-rose-500', 'Pendaftaran belum disetujui', me.note || 'Dokumen belum memenuhi syarat. Silakan daftar ulang dengan dokumen yang valid.'],
  }[me.verified] || []
  const [I, tone, title, text] = st
  const steps = [['Data & dokumen dikirim', true], ['Verifikasi dokumen', !['pending', 'revision'].includes(me.verified)], ['Akun aktif', me.verified === 'verified']]

  return (
    <Screen role="worker" immersive="bg-slate-900">
      {(bell) => (
        <div className="pb-6">
          <div className="relative overflow-hidden rounded-b-[32px] bg-slate-900 px-5 pb-8 pt-4 text-white">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <Avatar name={me.name} src={me.photo} size="md" className="ring-2 ring-white/20" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{me.name}</div>
                <div className="text-[11px] text-slate-400">{me.phone}</div>
              </div>
              {bell}
            </div>
            <div className="relative mt-8 flex flex-col items-center text-center">
              <span className={cx('flex h-16 w-16 animate-pop items-center justify-center rounded-full text-white shadow-lg', tone)}><I size={30} /></span>
              <div className="mt-4 text-lg font-extrabold">{title}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-slate-400">{text}</div>
            </div>
          </div>
          <div className="space-y-5 px-4 pt-5">
            <Card>
              <ol className="space-y-3">
                {steps.map(([l, ok], i) => (
                  <li key={l} className="flex items-center gap-3 text-sm">
                    <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold', ok ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400')}>{ok ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
                    <span className={ok ? 'font-semibold' : 'text-slate-500'}>{l}</span>
                  </li>
                ))}
              </ol>
            </Card>
            {me.verified === 'revision' && <ResubmitDocs me={me} />}
            {/* Pintasan demo: verifikasi asli dilakukan admin di Admin Ops → Mitra */}
            {me.verified === 'pending' && (
              <Card className="space-y-2.5 !border-dashed !border-brand-300 !bg-brand-50/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Mode demo</div>
                <div className="text-[13px] text-slate-600">Lewati antrean verifikasi untuk mencoba aplikasi mitra, atau setujui dari Admin Ops → Mitra.</div>
                <Btn className="w-full" icon={BadgeCheck} onClick={() => act.verify(me.id, 'verified', null)}>Setujui verifikasi (demo)</Btn>
              </Card>
            )}
            <Menu title="Data pendaftaran">
              <MenuItem icon={Wrench} label="Keahlian" value={me.skills.map((s) => svcOf(s).name).join(', ')} right={false} />
              <MenuItem icon={MapPin} label="Area" value={me.areas.join(', ')} right={false} />
              <MenuItem icon={FileText} label="Dokumen" value={me.docs?.join(', ')} right={false} />
            </Menu>
            <Menu>
              <MenuItem icon={LogOut} label="Keluar" danger onClick={() => setLogout(true)} />
            </Menu>
          </div>
          <LogoutSheet role="worker" open={logout} onClose={() => setLogout(false)} />
        </div>
      )}
    </Screen>
  )
}

// Mitra yang diminta revisi mengunggah ulang dokumen, lalu kembali ke antrean verifikasi (FR-012)
function ResubmitDocs({ me }) {
  const { act } = useStore()
  const [docs, setDocs] = useState([])
  const list = ['KTP', 'SKCK', 'Sertifikat keahlian']
  return (
    <Card className="space-y-3 !border-amber-200">
      <div className="text-sm font-bold">Unggah ulang dokumen</div>
      <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Catatan admin: “{me.note}”</div>
      {list.map((d) => {
        const on = docs.includes(d)
        return (
          <label key={d} className={cx('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition', on ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-300 bg-slate-50 hover:border-brand-400')}>
            <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', on ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200')}>{on ? <Check size={15} strokeWidth={3} /> : <FileText size={15} />}</span>
            <span className="flex-1">{d}</span>
            <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => e.target.files.length && !on && setDocs([...docs, d])} />
          </label>
        )
      })}
      <Btn size="lg" className="w-full" disabled={!docs.length} onClick={() => act.resubmitDocs(me.id, [...new Set([...(me.docs || []), ...docs])])}>Kirim ulang untuk verifikasi</Btn>
    </Card>
  )
}
