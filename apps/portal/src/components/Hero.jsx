import React from 'react'

export default function Hero() {
  return (
    <section className="relative pt-12 pb-20 px-6 overflow-hidden bg-[#FAF7F2]">
      {/* Background Soft Organic Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#BFD8D2]/30 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[350px] bg-[#F5EFEB] blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E4EDE9] text-[#12322B] text-xs font-bold tracking-widest uppercase shadow-sm">
            <span>✦</span>
            <span>INTELLIGENT HEALTHCARE PLATFORM</span>
          </div>

          {/* Main Title in Editorial Serif */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#12322B] leading-[1.08] tracking-tight">
            Healthcare designed for <br />
            <span className="italic font-normal text-[#1A4D43]">real clinical trust</span> & clarity.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#5F7D74] max-w-2xl mx-auto leading-relaxed font-normal">
            Bridging rural kiosks and urban clinicians with adaptive intake, zero-hallucination deterministic red-flag safety, multilingual speech, and instant doctor decision-support.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={import.meta.env.VITE_KIOSK_URL || "http://localhost:5173"}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#12322B] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#1C453C] hover:-translate-y-0.5 transition flex items-center justify-center gap-3"
            >
              <span>Launch Patient Kiosk App</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Launch ➔</span>
            </a>

            <a
              href={import.meta.env.VITE_DOCTOR_URL || "http://localhost:5174"}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#12322B] border border-[#E4EDE9] font-bold text-xs uppercase tracking-wider hover:bg-[#FAF7F2] hover:border-[#BFD8D2] transition flex items-center justify-center gap-3 shadow-sm"
            >
              <span>Open Doctor Dashboard</span>
              <span className="text-[10px] bg-[#FAF7F2] px-2 py-0.5 rounded-full font-mono text-[#5F7D74]">Launch ➔</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] shadow-sm text-center">
              <div className="text-3xl font-serif text-[#12322B]">100%</div>
              <div className="text-[11px] text-[#5F7D74] font-semibold mt-1">Deterministic Triage Safety</div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] shadow-sm text-center">
              <div className="text-3xl font-serif text-[#12322B]">7+</div>
              <div className="text-[11px] text-[#5F7D74] font-semibold mt-1">Indian Languages Voice</div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] shadow-sm text-center">
              <div className="text-3xl font-serif text-[#12322B]">&lt; 2s</div>
              <div className="text-[11px] text-[#5F7D74] font-semibold mt-1">Real-time Emergency Escalations</div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] shadow-sm text-center">
              <div className="text-3xl font-serif text-[#12322B]">ABHA</div>
              <div className="text-[11px] text-[#5F7D74] font-semibold mt-1">HL7 FHIR Interoperability</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
