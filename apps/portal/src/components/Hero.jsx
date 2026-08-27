export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 px-6 overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-sky-50/30">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-200/50 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-sky-100/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-sky-300 text-sky-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            SIH 2026 Innovation · Rural & Urban Healthcare Platform
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-none">
            Intelligent Doctor-Patient <br />
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent">
              Healthcare Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bridging rural kiosks and urban hospitals with adaptive intake, zero-hallucination deterministic red-flag triage, multilingual voice, and instant doctor decision-support.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sky-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 hover:bg-sky-600 hover:-translate-y-0.5 transition flex items-center justify-center gap-3"
            >
              <span>Launch Patient Kiosk App</span>
              <span className="text-xs bg-sky-700/60 px-2 py-0.5 rounded font-mono">Port 5173</span>
            </a>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-sky-800 border-2 border-sky-200 font-bold text-base hover:bg-sky-50 hover:border-sky-300 transition flex items-center justify-center gap-3 shadow-sm"
            >
              <span>Open Doctor Dashboard</span>
              <span className="text-xs bg-sky-100 px-2 py-0.5 rounded font-mono text-sky-700">Port 5174</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="glass-card p-5 rounded-2xl text-center bg-white/90">
              <div className="text-3xl font-extrabold text-sky-600">100%</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Deterministic Triage Safety</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center bg-white/90">
              <div className="text-3xl font-extrabold text-sky-600">12+</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Indian Languages (Bhashini STT)</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center bg-white/90">
              <div className="text-3xl font-extrabold text-sky-600">&lt; 2s</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Real-time Emergency Alert</div>
            </div>

            <div className="glass-card p-5 rounded-2xl text-center bg-white/90">
              <div className="text-3xl font-extrabold text-sky-600">ABHA</div>
              <div className="text-xs text-slate-500 font-bold mt-1">FHIR Ready Interoperability</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
