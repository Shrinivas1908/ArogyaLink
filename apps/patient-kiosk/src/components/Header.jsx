import React, { useState } from 'react'

export default function Header() {
  const [showRecordsModal, setShowRecordsModal] = useState(false)

  return (
    <>
      <header className="w-full px-8 py-6 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#12322B] text-white flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="text-xs font-extrabold tracking-widest text-[#12322B] uppercase">
            AROGYA <span className="font-light text-[#5F7D74]">SETU</span>
          </span>
        </div>

        {/* Center Button: My Records */}
        <button
          onClick={() => setShowRecordsModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E4EDE9] text-[#12322B] hover:bg-[#FAF7F2] text-xs font-bold transition shadow-sm"
        >
          <span>📁</span>
          <span>My Health Records & ABHA</span>
        </button>

        {/* Top Right Status Indicators */}
        <div className="flex items-center gap-5 text-xs text-[#5F7D74] font-medium">
          <button
            onClick={() => setShowRecordsModal(true)}
            className="sm:hidden text-xs font-bold text-[#12322B] bg-white px-3 py-1 rounded-full border border-[#E4EDE9]"
          >
            📁 Records
          </button>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#12322B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>DPDP Safe</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#12322B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>Live Sync</span>
          </div>
        </div>

      </header>

      {/* Patient Health Records Modal */}
      {showRecordsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E4EDE9] space-y-6 text-left animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#12322B] text-white flex items-center justify-center text-lg font-bold">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#12322B]">Patient Health Locker & Records</h3>
                  <p className="text-xs text-[#5F7D74]">Linked via Ayushman Bharat Digital Mission (ABDM)</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordsModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#12322B] flex items-center justify-center font-bold hover:bg-[#E4EDE9]"
              >
                ✕
              </button>
            </div>

            {/* Past Visits List */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F7D74]">Recent Consultations & Intake History:</span>
              
              <div className="space-y-2">
                {[
                  { id: 'ENC-20260828', date: '28 Aug 2026 (Today)', doctor: 'Dr. Alok Verma (Cardiology)', complaint: 'Severe chest discomfort & dyspnea', status: 'Triaged • In Queue' },
                  { id: 'ENC-20260714', date: '14 Jul 2026', doctor: 'Dr. Sunita Rao (General Medicine)', complaint: 'Fever, sore throat & viral infection', status: 'Completed • Prescribed' },
                  { id: 'ENC-20260520', date: '20 May 2026', doctor: 'Dr. K. Nair (AYUSH OPD)', complaint: 'Vata-Pitta Prakriti evaluation & wellness', status: 'AYUSH Certified' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4EDE9] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#12322B]">{item.doctor}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E4EDE9] text-[#12322B]">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F7D74]">{item.complaint}</p>
                    <div className="pt-2 flex items-center justify-between text-[10px] text-[#5F7D74]">
                      <span>{item.date} • {item.id}</span>
                      <button
                        onClick={() => window.print()}
                        className="text-[#12322B] font-bold hover:underline"
                      >
                        🖨 Print Summary
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ABDM & Privacy Notice */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-[#5F7D74] leading-relaxed">
                Health records are encrypted under <strong>DPDP Act 2023</strong> and synced with your ABHA ID.
              </p>
            </div>

            <button
              onClick={() => setShowRecordsModal(false)}
              className="w-full py-3.5 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1C453C] transition shadow-md"
            >
              Close Records
            </button>
          </div>
        </div>
      )}
    </>
  )
}
