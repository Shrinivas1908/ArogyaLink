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
            <p className="font-bold text-[#12322B]">ArogyaLink Clinical Ecosystem</p>
            <p className="text-[10px] text-[#5F7D74]">Intelligent Healthcare Triage & Review Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-semibold">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-[#12322B] transition">API Documentation</a>
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="hover:text-[#12322B] transition">Patient Kiosk (5173)</a>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="hover:text-[#12322B] transition">Doctor Workspace (5174)</a>
        </div>

        <div className="text-[11px] text-[#5F7D74] font-medium">
          Built with React 19, FastAPI, PostgreSQL, Supabase & Gemini
        </div>
      </div>
    </footer>
  )
}
