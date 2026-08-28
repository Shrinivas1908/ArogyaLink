import React from 'react'

export default function EscalationToast({ alert, onOpen, onClose }) {
  if (!alert) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl p-4 shadow-2xl border border-[#EFE8DE] flex items-center gap-4 max-w-sm animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-[#FDF0ED] flex items-center justify-center text-[#D9383A] text-lg shrink-0">
        ⚠️
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#D9383A] block">
          LIVE ESCALATION
        </span>
        <h5 className="text-xs font-bold text-[#2E1B15] truncate">
          Critical safety signal detected
        </h5>
        <p className="text-[11px] text-[#7C6C62] truncate">
          {alert.symptoms || 'Severe discomfort + breathing difficulty + radiating pain'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpen}
          className="w-8 h-8 rounded-full bg-[#2E1B15] text-[#FAF6F0] flex items-center justify-center text-xs hover:bg-[#3D251D] transition shadow-sm"
          title="Open encounter"
        >
          →
        </button>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full text-[#8C7A70] hover:text-[#2E1B15] flex items-center justify-center text-xs transition"
          title="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
