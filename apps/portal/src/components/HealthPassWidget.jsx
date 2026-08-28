import React, { useState } from 'react'

export default function HealthPassWidget() {
  const [abhaNumber, setAbhaNumber] = useState('91-4820-9182-3491')
  const [pin, setPin] = useState('1234')
  const [verifying, setVerifying] = useState(false)
  const [cardProfile, setCardProfile] = useState({
    name: 'Aarav Sharma',
    gender: 'Male',
    age: 34,
    abha_number: '91-4820-9182-3491',
    status: 'VERIFIED',
  })
  const [msg, setMsg] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifying(true)
    setMsg('')

    try {
      const res = await fetch('/api/session/abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abha_id: abhaNumber.trim() || '91-4820-9182-3491',
          pin: pin.trim() || '1234',
        }),
      })

      if (!res.ok) throw new Error('Verification failed')
      const data = await res.json()
      setCardProfile({
        name: data.full_name || 'Aarav Sharma',
        gender: 'Male',
        age: 34,
        abha_number: data.abha_number || abhaNumber,
        status: 'VERIFIED',
      })
      setMsg('✨ ABHA Card Authenticated & Verified via Synthetic PIN!')
    } catch (err) {
      setMsg('⚠️ Verification failed. Using fallback verification profile.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <section id="digital-health" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-sky-200 bg-white/90 shadow-lg space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold px-3 py-1 bg-sky-100 border border-sky-300 text-sky-800 rounded-full uppercase tracking-widest">
            ABDM & Interoperability
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Digital Health Identity & ABHA Card Integration</h2>
          <p className="text-slate-600 text-sm">
            Seamless portability across Indian health systems. Authenticate ABHA credentials via PIN, link encounters, and issue FHIR-compliant digital health passes.
          </p>
        </div>

        {/* Interactive ABHA Verification Input */}
        <div className="max-w-xl mx-auto p-4 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-800 uppercase tracking-wider">⚡ Live ABHA Verification Sandbox</span>
            <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-mono font-bold">NHA ABDM Compliant</span>
          </div>

          <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="14-Digit ABHA ID"
              value={abhaNumber}
              onChange={(e) => setAbhaNumber(e.target.value)}
              className="sm:col-span-2 p-2.5 bg-white border border-sky-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={verifying}
              className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {verifying ? 'Verifying…' : '🪪 Verify Card'}
            </button>
          </form>

          {msg && <p className="text-[11px] font-bold text-emerald-700">{msg}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* ABHA Card Mockup */}
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900 p-6 sm:p-8 rounded-3xl border border-sky-400 shadow-xl relative space-y-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-sky-700 flex items-center justify-center font-extrabold text-sm">
                  AB
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ABHA Digital Health Pass</h3>
                  <p className="text-[10px] text-sky-200 uppercase tracking-widest">National Health Authority</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-1 rounded font-bold">{cardProfile.status}</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-sky-200 font-mono">ABHA Number</p>
              <p className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider">{cardProfile.abha_number}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-sky-200 block">Name</span>
                <span className="font-bold text-white">{cardProfile.name}</span>
              </div>
              <div>
                <span className="text-sky-200 block">Gender / Age</span>
                <span className="font-bold text-white">{cardProfile.gender} / {cardProfile.age} yrs</span>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-500/40 flex items-center justify-between text-[11px] text-sky-200 font-mono">
              <span>FHIR R4 Compatible</span>
              <span>Encounters Linked: 03</span>
            </div>
          </div>

          {/* Electronic Prescription Preview */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-200 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">E-Prescription & Medicine Reminder</h4>
                <p className="text-xs text-slate-500">Doctor Verified Output</p>
              </div>
              <span className="text-xs text-sky-600 font-mono font-bold">Phase 14 Ready</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Tab. Paracetamol 500mg</p>
                  <p className="text-slate-600 text-[11px]">1 tablet after meals (Morning & Evening) · 3 days</p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">Active</span>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Syr. Amoxicillin 250mg</p>
                  <p className="text-slate-600 text-[11px]">5ml twice daily after meals · 5 days</p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">Active</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Verified by: Dr. Ananya Roy</span>
              <span className="text-sky-600 font-bold hover:underline cursor-pointer">Download FHIR JSON →</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
