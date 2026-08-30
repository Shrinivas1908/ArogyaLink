import React from 'react'

export default function LiveEscalationsView({ alert, onOpenEncounter }) {
  return (
    <div className="space-y-6">
      {/* Real-time Monitor Main Card */}
      <div className="bg-[#FAF7F2] rounded-[24px] p-8 sm:p-10 border border-[#EFE8DE] shadow-sm space-y-6">
        {/* Header */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
            REAL-TIME MONITOR
          </span>
          <h3 className="text-2xl font-serif text-[#2E1B15] mt-1 flex items-center gap-2">
            <span className="text-xl">⚠️</span> Live escalations
          </h3>
        </div>

        {/* Critical Escalation Card or Clean State */}
        {alert ? (
          <div className="bg-[#FDF0ED] border border-[#F9D5CD] rounded-2xl p-6 space-y-3 animate-fadeIn">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D9383A] block">
              CRITICAL • {alert.encounter_id || 'AL-NEW'}
            </span>

            <h4 className="text-base font-bold text-[#2E1B15]">
              Critical safety signal detected ({alert.patient_name || 'Patient'})
            </h4>

            <p className="text-xs text-[#7C6C62]">
              {alert.symptoms || 'Severe clinical safety rule triggered.'}
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenEncounter}
                className="px-5 py-2.5 rounded-full bg-[#2E1B15] text-[#FAF6F0] text-xs font-bold hover:bg-[#3D251D] transition shadow-sm active:scale-95"
              >
                Open encounter
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[#EFE8DE] text-center space-y-3">
            <span className="text-3xl block">🛡️</span>
            <h4 className="text-sm font-bold text-[#2E1B15]">All Safety Signals Normal</h4>
            <p className="text-xs text-[#7C6C62] max-w-sm mx-auto">
              No active red-flag escalations in the queue. Incoming emergency escalations from the kiosk will stream here instantly over WebSockets.
            </p>
          </div>
        )}

        {/* Bottom Subtext */}
        <div className="pt-4 text-center text-xs text-[#8C7A70]">
          WebSocket live telemetry active • SHA-256 encrypted emergency alerting stream.
        </div>
      </div>
    </div>
  )
}
