import React from 'react'

export default function MetricStats({ stats }) {
  const defaultMetrics = [
    {
      title: 'OPEN ENCOUNTERS',
      delta: '+6 since morning',
      value: stats?.open || '24',
    },
    {
      title: 'REQUIRES ATTENTION',
      delta: '3 awaiting review',
      value: stats?.attention || '07',
    },
    {
      title: 'CRITICAL TODAY',
      delta: '1 live escalation',
      value: stats?.critical || '02',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {defaultMetrics.map((m, idx) => (
        <div key={idx} className="bg-[#FAF7F2] rounded-[24px] p-6 border border-[#EFE8DE] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A70]">
              {m.title}
            </span>
            <span className="text-xs font-semibold text-[#2D7A4D]">
              {m.delta}
            </span>
          </div>
          <div className="text-4xl font-serif text-[#2E1B15]">
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
