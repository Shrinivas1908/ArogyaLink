export default function HealthPassWidget() {
  return (
    <section id="digital-health" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold px-3 py-1 bg-purple-900/40 border border-purple-700/50 text-purple-300 rounded-full uppercase tracking-widest">
            ABDM & Interoperability
          </span>
          <h2 className="text-3xl font-bold text-white">Digital Health Identity & ABHA Card Integration</h2>
          <p className="text-slate-400 text-sm">
            Seamless portability across Indian health systems. Link encounters, export FHIR-compliant JSON records, and issue digital health passes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* ABHA Card Mockup */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center font-extrabold text-slate-950 text-sm">
                  AB
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ABHA Digital Health Pass</h3>
                  <p className="text-[10px] text-indigo-300 uppercase tracking-widest">National Health Authority</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-teal-400/20 text-teal-300 px-2 py-1 rounded">VERIFIED</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-indigo-300 font-mono">ABHA Number</p>
              <p className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider">91-4820-9182-3491</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-indigo-300 block">Name</span>
                <span className="font-semibold text-white">Aarav Sharma</span>
              </div>
              <div>
                <span className="text-indigo-300 block">Gender / Age</span>
                <span className="font-semibold text-white">Male / 34 yrs</span>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
              <span>FHIR R4 Compatible</span>
              <span>Encounters Linked: 03</span>
            </div>
          </div>

          {/* Electronic Prescription Preview */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">E-Prescription & Medicine Reminder</h4>
                <p className="text-xs text-slate-400">Doctor Verified Output</p>
              </div>
              <span className="text-xs text-teal-400 font-mono">Phase 14 Ready</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Tab. Paracetamol 500mg</p>
                  <p className="text-slate-400 text-[11px]">1 tablet after meals (Morning & Evening) · 3 days</p>
                </div>
                <span className="text-xs font-semibold text-teal-400 bg-teal-950 px-2 py-1 rounded">Active</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Syr. Amoxicillin 250mg</p>
                  <p className="text-slate-400 text-[11px]">5ml twice daily after meals · 5 days</p>
                </div>
                <span className="text-xs font-semibold text-teal-400 bg-teal-950 px-2 py-1 rounded">Active</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Verified by: Dr. Ananya Roy</span>
              <span className="text-indigo-400 hover:underline cursor-pointer">Download FHIR JSON →</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
