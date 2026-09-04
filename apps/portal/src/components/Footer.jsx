import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-[#E4EDE9] bg-[#FAF7F2] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#5F7D74]">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#12322B] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            AL
          </div>
          <div>
            <p className="font-bold text-[#12322B]">ArogyaSetu Clinical Ecosystem</p>
            <p className="text-[10px] text-[#5F7D74]">Intelligent Healthcare Triage & Review Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-semibold">
          <a href={import.meta.env.VITE_DOCS_URL || "/api/docs"} target="_blank" rel="noreferrer" className="hover:text-[#12322B] transition">API Documentation</a>
          <a
            href={import.meta.env.VITE_KIOSK_URL || "#kiosk"}
            onClick={(e) => {
              if (!import.meta.env.VITE_KIOSK_URL) {
                e.preventDefault()
                window.location.hash = '#kiosk'
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="hover:text-[#12322B] transition cursor-pointer"
          >
            Patient Kiosk
          </a>
          <a
            href={import.meta.env.VITE_DOCTOR_URL || "#doctor"}
            onClick={(e) => {
              if (!import.meta.env.VITE_DOCTOR_URL) {
                e.preventDefault()
                window.location.hash = '#doctor'
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="hover:text-[#12322B] transition cursor-pointer"
          >
            Doctor Workspace
          </a>
        </div>

        <div className="text-[11px] text-[#5F7D74] font-medium">
          Built with React 19, FastAPI, PostgreSQL, Supabase & Gemini
        </div>
      </div>
    </footer>
  )
}
