import React from 'react'

export default function LandingHero({ onStart, lang, setLang, languages, langMenuOpen, setLangMenuOpen }) {
  const selectedLang = languages.find((l) => l.code === lang) || languages[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center py-6">
      
      {/* Left Hero Text & Actions */}
      <div className="lg:col-span-7 space-y-8">
        {/* Tag */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#12322B]/70">
          <span>✦</span>
          <span>THOUGHTFUL HEALTHCARE</span>
        </div>

        {/* Huge Editorial Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#12322B] leading-[1.08] tracking-tight">
          Healthcare <br />
          that <span className="italic font-normal text-[#1A4D43]">listens</span> to <br />
          you.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#5F7D74] max-w-xl leading-relaxed font-normal">
          Share what you're experiencing in a simple, guided way. We'll help your care team see what matters.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-5 pt-2">
          <button
            id="begin-checkin-btn"
            onClick={onStart}
            className="px-8 py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs tracking-wider uppercase flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>START HEALTH CHECK</span>
            <span className="text-sm">➔</span>
          </button>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-full text-xs font-semibold text-[#12322B] hover:bg-black/5 transition"
            >
              <span>文A</span>
              <span>{selectedLang.name}</span>
              <span className="text-[10px] text-[#5F7D74]">▾</span>
            </button>

            {langMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E4EDE9] p-2 z-50 space-y-1">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code)
                      setLangMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      lang === l.code
                        ? 'bg-[#12322B] text-white font-bold'
                        : 'text-[#12322B] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] opacity-70">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step counter */}
        <div className="pt-8 flex items-center gap-3 text-xs font-mono text-[#5F7D74]">
          <span className="font-bold text-[#12322B]">01</span>
          <span className="w-12 h-px bg-[#12322B]/20" />
          <span>04</span>
        </div>
      </div>

      {/* Right Hero Visual Card */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="w-full max-w-md aspect-square bg-[#BFD8D2] rounded-[40px] relative overflow-hidden flex items-center justify-center p-8 shadow-sm">
          {/* Organic Circles */}
          <div className="w-72 h-72 rounded-full bg-[#F5EFEB] absolute -top-8 -right-8 pointer-events-none" />
          <div className="w-48 h-48 rounded-full bg-[#9CBFB5]/40 absolute -bottom-10 -left-10 pointer-events-none" />

          {/* Floating Card */}
          <div className="relative z-10 bg-[#FAF7F2]/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/80 max-w-[300px] w-full space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A4D43]">
              <span className="text-xs">⚡</span>
              <span>CONNECTED CARE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#12322B] leading-tight">
              One clear picture of your health.
            </h3>
          </div>

          <div className="absolute bottom-6 right-6 z-10 px-4 py-2 rounded-full bg-[#12322B] text-white text-[11px] font-medium shadow-md">
            Safe • Private • Guided
          </div>
        </div>
      </div>

    </div>
  )
}
