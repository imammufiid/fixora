import { useState } from 'react'
import { StoreProvider } from './store'
import Customer from './Customer'
import Worker from './Worker'
import Admin from './Admin'

const VIEWS = [
  ['split', 'Customer + Worker'],
  ['customer', 'Customer'],
  ['worker', 'Worker'],
  ['admin', 'Admin Ops'],
]

export default function App() {
  const [view, setView] = useState('split')
  const show = (...v) => (v.includes(view) ? '' : 'hidden')
  return (
    <StoreProvider>
      <div className="min-h-screen p-6 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <span className="font-bold text-teal-700">Fixora · Mockup</span>
          <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm">
            {VIEWS.map(([id, label]) => (
              <button key={id} onClick={() => setView(id)} className={`px-3 py-1.5 rounded-md text-sm ${view === id ? 'bg-teal-600 text-white' : 'text-slate-600'}`}>{label}</button>
            ))}
          </div>
          <button onClick={() => location.reload()} className="text-xs text-slate-500 underline">Reset demo</button>
        </div>
        <p className="text-xs text-slate-500 text-center max-w-2xl">
          Coba: pesan AC Service di Kebayoran Baru → terima offer di Worker (30 detik) → jalankan status → ajukan biaya tambahan → setujui dari Customer → konfirmasi & beri rating. Pantau semuanya di Admin Ops.
        </p>
        <div className="flex gap-10 flex-wrap justify-center w-full">
          <div className={show('split', 'customer')}><Customer /></div>
          <div className={show('split', 'worker')}><Worker /></div>
          <div className={`w-full flex justify-center ${show('admin')}`}><Admin /></div>
        </div>
      </div>
    </StoreProvider>
  )
}
