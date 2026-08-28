import React from 'react'

export default function Header() {
  return (
    <header className="w-full px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#12322B] text-white flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <span className="text-xs font-extrabold tracking-widest text-[#12322B] uppercase">
          AROGYA <span className="font-light text-[#5F7D74]">LINK</span>
        </span>
      </div>

      {/* Center Segment Indicators */}
      <div className="hidden sm:flex items-center gap-3 opacity-60">
        <div className="w-8 h-0.5 bg-[#12322B] rounded-full" />
        <div className="w-8 h-0.5 bg-[#12322B]/30 rounded-full" />
        <div className="w-8 h-0.5 bg-[#12322B]/30 rounded-full" />
      </div>

      {/* Top Right Status Indicators */}
      <div className="flex items-center gap-5 text-xs text-[#5F7D74] font-medium">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#12322B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Private</span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#12322B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>Connected</span>
        </div>
      </div>

    </header>
  )
}
