import React, { useState } from 'react'

export default function HealthPassWidget() {
  return (
    <section id="digital-health" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-sky-200 bg-white/90 shadow-lg space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold px-3 py-1 bg-sky-100 border border-sky-300 text-sky-800 rounded-full uppercase tracking-widest">
            ABDM & Interoperability
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Digital Health Identity & ABHA Card Integration</h2>
          <p className="text-slate-600 text-sm">
            Seamless portability across Indian health systems. Link encounters, export FHIR-compliant JSON records, and issue digital health passes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* ABHA Card Mockup */}
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900 p-6 sm:p-8 rounded-3xl border border-sky-400 shadow-xl relative space-y-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-sky-700 flex items-center justify-center font-extrabold text-sm">
                  AB
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ABHA Digital Health Pass</h3>
                  <p className="text-[10px] text-sky-200 uppercase tracking-widest">National Health Authority</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-1 rounded font-bold">VERIFIED</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-sky-200 font-mono">ABHA Number</p>
              <p className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wider">91-4820-9182-3491</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-sky-200 block">Name</span>
                <span className="font-bold text-white">Aarav Sharma</span>
              </div>
              <div>
                <span className="text-sky-200 block">Gender / Age</span>
                <span className="font-bold text-white">Male / 34 yrs</span>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-500/40 flex items-center justify-between text-[11px] text-sky-200 font-mono">
              <span>FHIR R4 Compatible</span>
              <span>Encounters Linked: 03</span>
            </div>
          </div>

          {/* Electronic Prescription Preview */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-200 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">E-Prescription & Medicine Reminder</h4>
                <p className="text-xs text-slate-500">Doctor Verified Output</p>
              </div>
              <span className="text-xs text-sky-600 font-mono font-bold">Phase 14 Ready</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Tab. Paracetamol 500mg</p>
                  <p className="text-slate-600 text-[11px]">1 tablet after meals (Morning & Evening) · 3 days</p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">Active</span>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Syr. Amoxicillin 250mg</p>
                  <p className="text-slate-600 text-[11px]">5ml twice daily after meals · 5 days</p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded">Active</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Verified by: Dr. Ananya Roy</span>
              <span className="text-sky-600 font-bold hover:underline cursor-pointer">Download FHIR JSON →</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
