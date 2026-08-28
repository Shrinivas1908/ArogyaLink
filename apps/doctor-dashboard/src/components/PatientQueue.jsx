import React, { useState, useMemo } from 'react'

export default function PatientQueue({
  encounters,
  selectedId,
  onSelect,
  filterSeverity,
  onFilterChange,
}) {
  // Folder grouping mode: 'date' (Year/Month/Date) | 'severity' (Critical/Urgent/Routine) | 'time' (Hourly slots)
  const [folderView, setFolderView] = useState('date')
  const [collapsedFolders, setCollapsedFolders] = useState({})
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('ALL')

  // Helper to format date & time nicely
  const formatEncounterDateTime = (created_at) => {
    if (!created_at) return { dateStr: 'Today, 28 Aug 2026', timeStr: 'Just now', year: '2026', month: 'Aug 2026', day: '28 Aug' }
    try {
      const d = new Date(created_at)
      if (isNaN(d.getTime())) return { dateStr: 'Today, 28 Aug 2026', timeStr: 'Just now', year: '2026', month: 'Aug 2026', day: '28 Aug' }
      
      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const dateStr = isToday ? `Today, ${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}` : d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
      const year = d.getFullYear().toString()
      const month = d.toLocaleDateString([], { month: 'short', year: 'numeric' })
      const day = d.toLocaleDateString([], { day: 'numeric', month: 'short' })

      return { dateStr, timeStr, year, month, day }
    } catch {
      return { dateStr: 'Today, 28 Aug 2026', timeStr: 'Just now', year: '2026', month: 'Aug 2026', day: '28 Aug' }
    }
  }

  // Toggle collapsing of folder
  const toggleFolder = (folderName) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }))
  }

  // Group encounters into folders based on selected view mode
  const folderGroups = useMemo(() => {
    const groups = {}

    encounters.forEach((enc) => {
      const dt = formatEncounterDateTime(enc.created_at)
      let folderKey = ''
      let folderLabel = ''
      let folderIcon = '📁'

      if (folderView === 'date') {
        folderKey = dt.dateStr
        folderLabel = dt.dateStr
        folderIcon = '📅'
      } else if (folderView === 'severity') {
        const sev = (enc.triage_level || 'ROUTINE').toUpperCase()
        folderKey = sev
        folderLabel = sev === 'CRITICAL' ? 'Critical Escalations' : sev === 'URGENT' ? 'Urgent Attention' : 'Routine Intake'
        folderIcon = sev === 'CRITICAL' ? '🚨' : sev === 'URGENT' ? '⏳' : '📋'
      } else if (folderView === 'year_month') {
        folderKey = `${dt.year} / ${dt.month}`
        folderLabel = `${dt.month} (${dt.year})`
        folderIcon = '🗂'
      } else {
        // Hourly time slots
        folderKey = dt.timeStr.includes(':') ? `${dt.timeStr.split(':')[0]}:00 Slot` : 'Recent Intake'
        folderLabel = `Time Window: ${folderKey}`
        folderIcon = '🕒'
      }

      if (!groups[folderKey]) {
        groups[folderKey] = {
          key: folderKey,
          label: folderLabel,
          icon: folderIcon,
          items: [],
        }
      }

      groups[folderKey].items.push({ ...enc, formattedDt: dt })
    })

    return Object.values(groups)
  }, [encounters, folderView])

  const totalCount = encounters.length

  return (
    <div className="bg-[#FAF7F2] rounded-[24px] p-6 border border-[#EFE8DE] shadow-sm space-y-4">
      
      {/* Header & Folder Controls */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
            PATIENT ARCHIVE & QUEUE
          </span>
          <h3 className="text-xl font-serif text-[#2E1B15] mt-0.5">
            Folder Directory ({totalCount})
          </h3>
        </div>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => onFilterChange(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE] text-[#2E1B15] outline-none shadow-sm cursor-pointer"
        >
          <option value="ALL">All Triage ▾</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="URGENT">Urgent Only</option>
          <option value="ROUTINE">Routine Only</option>
        </select>
      </div>

      {/* Folder View Switcher Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#EFE8DE] text-[11px] font-semibold">
        <button
          onClick={() => setFolderView('date')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            folderView === 'date'
              ? 'bg-[#2E1B15] text-[#FAF6F0] shadow-sm font-bold'
              : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          <span>📅</span>
          <span>By Date</span>
        </button>

        <button
          onClick={() => setFolderView('year_month')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            folderView === 'year_month'
              ? 'bg-[#2E1B15] text-[#FAF6F0] shadow-sm font-bold'
              : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          <span>🗂</span>
          <span>Year / Month</span>
        </button>

        <button
          onClick={() => setFolderView('severity')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            folderView === 'severity'
              ? 'bg-[#2E1B15] text-[#FAF6F0] shadow-sm font-bold'
              : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          <span>📁</span>
          <span>Triage Category</span>
        </button>
      </div>

      {/* Folder Tree & Collapsible Encounters */}
      <div className="space-y-3 pt-1 max-h-[600px] overflow-y-auto pr-1">
        {folderGroups.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#EFE8DE] text-xs text-[#8C7A70]">
            No patient records match the selected folder filter.
          </div>
        ) : (
          folderGroups.map((group) => {
            const isCollapsed = collapsedFolders[group.key]

            return (
              <div
                key={group.key}
                className="bg-white/80 rounded-2xl border border-[#EFE8DE] overflow-hidden shadow-sm transition"
              >
                {/* Folder Header Banner */}
                <div
                  onClick={() => toggleFolder(group.key)}
                  className="px-4 py-2.5 bg-[#F7F2EB] flex items-center justify-between cursor-pointer select-none hover:bg-[#EFE8DE]/60 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{group.icon}</span>
                    <span className="text-xs font-bold text-[#2E1B15]">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white border border-[#EFE8DE] text-[#7C6C62]">
                      {group.items.length} records
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8C7A70] font-mono">
                      {isCollapsed ? 'Expand ▼' : 'Collapse ▲'}
                    </span>
                  </div>
                </div>

                {/* Folder Content: Encounters in this folder */}
                {!isCollapsed && (
                  <div className="p-2 space-y-1.5 bg-white">
                    {group.items.map((enc) => {
                      const isSelected = selectedId === enc.id
                      const sev = (enc.triage_level || 'ROUTINE').toUpperCase()
                      const isCrit = sev === 'CRITICAL'
                      const isUrg = sev === 'URGENT'

                      return (
                        <div
                          key={enc.id}
                          onClick={() => onSelect(enc.id)}
                          className={`p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#F2E5D5] border border-[#E0D0BE] shadow-sm'
                              : 'bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Status Dot */}
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
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-[#2E1B15]">
                                  {enc.patient_name || 'Patient'}
                                </h4>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-[#EFE8DE] text-[#8C7A70]">
                                  #{enc.id?.slice(0, 8)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#7C6C62] mt-0.5">
                                {enc.age || 54} yrs • {enc.chief_complaint || 'General intake'}
                              </p>
                            </div>
                          </div>

                          {/* Time Stamp & Badges */}
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-semibold text-[#2E1B15] block">
                              {enc.formattedDt?.timeStr || enc.time || '11:00 AM'}
                            </span>
                            <span className="text-[9px] text-[#8C7A70] block">
                              {enc.formattedDt?.day || '28 Aug'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
