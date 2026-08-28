import React from 'react'

export default function PatientQueue({
  encounters,
  selectedId,
  onSelect,
  filterSeverity,
  onFilterChange,
}) {
  return (
    <div className="bg-[#FAF7F2] rounded-[24px] p-6 border border-[#EFE8DE] shadow-sm space-y-4">
      {/* Header & Filter */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
            ACTIVE WORKFLOW
          </span>
          <h3 className="text-xl font-serif text-[#2E1B15] mt-0.5">
            Patient queue
          </h3>
        </div>

        {/* Dropdown Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE] text-[#2E1B15] outline-none shadow-sm cursor-pointer"
        >
          <option value="ALL">All ▾</option>
          <option value="CRITICAL">Critical</option>
          <option value="URGENT">Urgent</option>
          <option value="ROUTINE">Routine</option>
        </select>
      </div>

      {/* Queue Items */}
      <div className="space-y-2 pt-2">
        {encounters.map((enc) => {
          const isSelected = selectedId === enc.id
          const sev = (enc.triage_level || 'ROUTINE').toUpperCase()
          const isCrit = sev === 'CRITICAL'
          const isUrg = sev === 'URGENT'

          return (
            <div
              key={enc.id}
              onClick={() => onSelect(enc.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-[#F2E5D5] border border-[#E0D0BE] shadow-sm'
                  : 'bg-transparent hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Colored status dot */}
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isCrit
                      ? 'bg-[#E04F36]'
                      : isUrg
                      ? 'bg-[#E88C38]'
                      : 'bg-[#38A169]'
                  }`}
                />
                <div>
                  <h4 className="text-sm font-bold text-[#2E1B15]">
                    {enc.patient_name || 'Patient'}
                  </h4>
                  <p className="text-xs text-[#7C6C62]">
                    {enc.age || 54} yrs • {enc.chief_complaint || 'General intake'}
                  </p>
                </div>
              </div>

              <span className="text-xs text-[#8C7A70] font-medium shrink-0">
                {enc.time || 'Now'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
