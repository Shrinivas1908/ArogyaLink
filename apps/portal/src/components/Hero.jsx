export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 px-6 overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide uppercase shadow-lg">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            SIH 2026 Innovation · Rural & Urban Healthcare Platform
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            Intelligent Doctor-Patient <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
              Healthcare Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Bridging rural kiosks and urban hospitals with adaptive intake, zero-hallucination deterministic red-flag triage, multilingual voice, and instant doctor decision-support.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition flex items-center justify-center gap-3"
            >
              <span>Launch Patient Kiosk App</span>
              <span className="text-xs bg-teal-900/50 px-2 py-0.5 rounded font-mono">Port 5173</span>
            </a>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-bold text-base hover:bg-slate-800 hover:border-slate-600 transition flex items-center justify-center gap-3"
            >
              <span>Open Doctor Dashboard</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">Port 5174</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-teal-400">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Deterministic Triage Safety</div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-indigo-400">12+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Indian Languages (Bhashini STT)</div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-emerald-400">&lt; 2s</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Real-time Emergency Alert</div>
            </div>

            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-purple-400">ABHA</div>
              <div className="text-xs text-slate-400 font-medium mt-1">FHIR Ready Interoperability</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
