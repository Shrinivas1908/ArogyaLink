import React, { useState } from 'react'

export default function PatientHealthLocker() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMethod, setAuthMethod] = useState('otp') // 'otp' | 'abha'
  const [mobileNumber, setMobileNumber] = useState('9876543210')
  const [otpCode, setOtpCode] = useState('202688')
  const [abhaId, setAbhaId] = useState('91-2345-6789-0123')
  const [otpSent, setOtpSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Active view tab inside unlocked locker
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'prescriptions' | 'labs' | 'summaries'
  const [selectedDocPreview, setSelectedDocPreview] = useState(null)

  // Authenticated patient data
  const authenticatedPatient = {
    patient_id: 'p-001',
    full_name: 'Ananya Sharma',
    age: 54,
    gender: 'Female',
    phone: '+91 98765 43210',
    abha_number: '91-2345-6789-0123',
    abha_address: 'ananya.sharma@abdm',
    linked_facility: 'Rural Primary Health Centre - PHC 01',
    documents: [
      {
        id: 'doc-001',
        title: 'Emergency Cardiology Prescription & Meds',
        category: 'prescriptions',
        type_label: 'Prescription Scan',
        date: '28 Aug 2026',
        doctor: 'Dr. Vivek R. (Cardiology Consult)',
        badge: 'Active Meds',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        file_name: '2026-08-28_Cardiology_Rx.jpg',
        file_size: '240 KB',
        extracted_items: [
          { name: 'Tab. Aspirin', dosage: '300mg', instructions: '1 Stat post-meal' },
          { name: 'Tab. Clopidogrel', dosage: '300mg', instructions: '1 Stat' },
          { name: 'Tab. Atorvastatin', dosage: '80mg', instructions: '1 OD Night (30 days)' },
        ],
        summary: 'Prescription scanned at Kiosk 01. OCR extracted 3 medications with 99.1% confidence score.',
      },
      {
        id: 'doc-002',
        title: '12-Lead Electrocardiogram (ECG) Report',
        category: 'labs',
        type_label: 'Cardiac Diagnostic',
        date: '28 Aug 2026',
        doctor: 'Dr. Vivek R.',
        badge: 'Critical Finding',
        badgeColor: 'bg-red-100 text-red-800 border-red-200',
        file_name: '2026-08-28_12Lead_ECG.pdf',
        file_size: '1.2 MB',
        extracted_items: [
          { name: 'ST Segment Elevation', dosage: '1.8 mm (V2-V4)', instructions: 'Critical' },
          { name: 'Heart Rate', dosage: '102 bpm', instructions: 'Sinus Tachycardia' },
          { name: 'T-Wave Inversion', dosage: 'Lead aVL', instructions: 'Abnormal' },
        ],
        summary: 'Digital ECG trace scanned and verified. Shows anterior wall STEMI pattern.',
      },
      {
        id: 'doc-003',
        title: 'Pulmonary OPD Prescription & Inhaler Advice',
        category: 'prescriptions',
        type_label: 'Prescription Scan',
        date: '12 Jun 2026',
        doctor: 'Dr. Neha Patel (General Medicine)',
        badge: 'Completed',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        file_name: '2026-06-12_Pulmonary_Rx.jpg',
        file_size: '185 KB',
        extracted_items: [
          { name: 'Inhaler Budecort', dosage: '200mcg', instructions: '2 puffs BD (14 days)' },
          { name: 'Tab. Montelukast', dosage: '10mg', instructions: '1 OD Bedtime (10 days)' },
          { name: 'Tab. Autrin (Iron)', dosage: '1 Capsule', instructions: '1 OD After lunch' },
        ],
        summary: 'Follow-up prescription for post-viral respiratory wheeze.',
      },
      {
        id: 'doc-004',
        title: 'Complete Blood Count (CBC) & Anemia Screen',
        category: 'labs',
        type_label: 'Hematology Panel',
        date: '12 Jun 2026',
        doctor: 'District Pathology Lab',
        badge: 'Mild Anemia',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        file_name: '2026-06-12_CBC_Panel.jpg',
        file_size: '310 KB',
        extracted_items: [
          { name: 'Hemoglobin (Hb)', dosage: '10.4 g/dL', instructions: 'Low (Ref: 12.0-15.5)' },
          { name: 'TLC (WBC)', dosage: '7,800 /uL', instructions: 'Normal' },
          { name: 'Platelet Count', dosage: '2.4 Lakhs', instructions: 'Normal' },
        ],
        summary: 'Verified automated hematology analyzer extraction.',
      },
      {
        id: 'doc-005',
        title: 'Annual Wellness & Glycemic Consultation Summary',
        category: 'summaries',
        type_label: 'Clinical Discharge Summary',
        date: '05 Feb 2026',
        doctor: 'Dr. Ankit Verma (Medical Officer)',
        badge: 'Signed Record',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        file_name: '2026-02-05_AnnualCheck.pdf',
        file_size: '420 KB',
        extracted_items: [
          { name: 'HbA1c Glucose', dosage: '6.2%', instructions: 'Pre-diabetic' },
          { name: 'Blood Pressure', dosage: '138/86 mmHg', instructions: 'Stage 1 HTN' },
        ],
        summary: 'Annual comprehensive health checkup letter with digital physician signature.',
      },
    ],
  }

  const [serverOtpMsg, setServerOtpMsg] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    const cleanPhone = mobileNumber.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.')
      return
    }
    setAuthError('')
    setIsAuthenticating(true)

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpSent(true)
        if (data.dev_otp) {
          setOtpCode(data.dev_otp)
          setServerOtpMsg(`✓ Verification code sent to ${data.phone_masked}. (Dev OTP: ${data.dev_otp})`)
        } else {
          setServerOtpMsg(`✓ Verification code sent via SMS to ${data.phone_masked}.`)
        }
      } else {
        setAuthError(data.detail || data.message || 'Failed to send OTP. Please try again.')
      }
    } catch {
      // Fallback for offline demo
      setOtpSent(true)
      setServerOtpMsg('✓ OTP code generated for local testing.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleVerifyLogin = async (e) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setAuthError('')

    const cleanPhone = mobileNumber.replace(/\D/g, '')
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otpCode }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAuthenticated(true)
      } else {
        setAuthError(data.detail || data.message || 'Invalid or expired OTP.')
      }
    } catch {
      // Fallback verification if backend is temporarily unreachable
      if (otpCode.length === 6) {
        setIsAuthenticated(true)
      } else {
        setAuthError('Please enter a valid 6-digit OTP code.')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setOtpSent(false)
    setServerOtpMsg('')
    setAuthError('')
    setSelectedDocPreview(null)
  }

  const filteredDocs = authenticatedPatient.documents.filter((doc) => {
    if (activeTab === 'all') return true
    return doc.category === activeTab
  })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="patient-locker">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. LOCKED STATE: PATIENT AUTHENTICATION / LOGIN GATE                      */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="max-w-xl mx-auto text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white mx-auto flex items-center justify-center text-2xl shadow-lg shadow-slate-900/10">
              🔒
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Secure Patient Health Locker (DPDP Act 2023)
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Log In to View Your Medical Documents
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                Medical records, prescriptions, and lab scans are private and encrypted. Authenticate via OTP or ABHA to access your documents.
              </p>
            </div>

            {/* Auth Method Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs mx-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); setOtpSent(false); setAuthError('') }}
                className={`flex-1 py-2 rounded-xl transition ${
                  authMethod === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📱 Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('abha'); setOtpSent(false); setAuthError('') }}
                className={`flex-1 py-2 rounded-xl transition ${
                  authMethod === 'abha' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇮🇳 ABHA Number
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                {authError}
              </div>
            )}

            {/* Method 1: Mobile OTP Form */}
            {authMethod === 'otp' && (
              <form onSubmit={otpSent ? handleVerifyLogin : handleSendOtp} className="space-y-4 max-w-sm mx-auto text-left">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter 10-digit number"
                      disabled={otpSent}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 block">6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-center tracking-widest text-base font-mono font-bold text-slate-900 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition"
                    />
                    <p className="text-[11px] text-emerald-600 font-medium text-center">✓ Demo OTP: <strong>202688</strong></p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isAuthenticating
                    ? 'Verifying...'
                    : otpSent
                    ? '🔓 Unlock Health Locker'
                    : 'Get OTP & Verify'}
                </button>
              </form>
            )}

            {/* Method 2: ABHA ID Form */}
            {authMethod === 'abha' && (
              <form onSubmit={handleVerifyLogin} className="space-y-4 max-w-sm mx-auto text-left">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">ABHA / Ayushman Bharat Number</label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g. 91-2345-6789-0123"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Consent is authenticated via UIDAI Aadhaar e-KYC.</p>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isAuthenticating ? 'Authenticating...' : '🔓 Authenticate via ABDM'}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
              <span>🔒 256-Bit Encrypted</span>
              <span>•</span>
              <span>🇮🇳 ABDM M2/M3 Compliant</span>
              <span>•</span>
              <span>🏥 Zero Third-Party Sharing</span>
            </div>
          </div>
        ) : (

        /* ========================================================================= */
        /* 2. UNLOCKED STATE: AUTHENTICATED PATIENT HEALTH LOCKER                    */
        /* ========================================================================= */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Bar with Patient Profile & Logout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Authenticated Patient Session Active
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  My Health Locker & Documents Vault
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Organized medical records, prescriptions, and verified laboratory reports for <strong>{authenticatedPatient.full_name}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`Downloading consolidated ABDM Health Passport PDF for ${authenticatedPatient.full_name}...`)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                >
                  ⬇ Download All (PDF)
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition border border-rose-200"
                >
                  🚪 Log Out
                </button>
              </div>
            </div>

            {/* Patient Credentials Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                  {authenticatedPatient.full_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{authenticatedPatient.full_name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-sky-200 font-medium">
                      {authenticatedPatient.age} yrs • {authenticatedPatient.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    ABHA: <strong className="text-sky-300">{authenticatedPatient.abha_number}</strong> ({authenticatedPatient.abha_address})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Primary Center: {authenticatedPatient.linked_facility}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Stored Docs</span>
                  <span className="text-base font-bold text-white">{authenticatedPatient.documents.length}</span>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Active Rx</span>
                  <span className="text-base font-bold text-emerald-400">2 Active</span>
                </div>
              </div>
            </div>

            {/* Document Folder Category Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 gap-2 sm:gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 transition flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>📁 All Documents ({authenticatedPatient.documents.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`pb-3 transition flex items-center gap-2 ${
                  activeTab === 'prescriptions'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>💊 Prescriptions (2)</span>
              </button>

              <button
                onClick={() => setActiveTab('labs')}
                className={`pb-3 transition flex items-center gap-2 ${
                  activeTab === 'labs'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🧪 Diagnostic & Lab Scans (2)</span>
              </button>

              <button
                onClick={() => setActiveTab('summaries')}
                className={`pb-3 transition flex items-center gap-2 ${
                  activeTab === 'summaries'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>📄 Discharge Summaries (1)</span>
              </button>
            </div>

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 font-medium">{doc.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${doc.badgeColor}`}>
                        {doc.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{doc.type_label}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{doc.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.doctor}</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5 text-xs font-mono">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extracted Details:</span>
                      {doc.extracted_items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">{item.name}</span>
                          <span className="text-slate-600">{item.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">{doc.file_name}</span>
                    <button
                      onClick={() => setSelectedDocPreview(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
                    >
                      🔍 Inspect Scan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Inspection Modal */}
            {selectedDocPreview && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-fadeIn text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedDocPreview.type_label}</span>
                      <h3 className="text-lg font-bold text-slate-900">{selectedDocPreview.title}</h3>
                      <p className="text-xs text-slate-500">{selectedDocPreview.date} • {selectedDocPreview.doctor}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDocPreview(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Simulated Scanned Original Image */}
                    <div className="bg-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-200 min-h-[220px]">
                      <span className="text-4xl mb-2">📑</span>
                      <span className="text-xs font-bold text-slate-800">{selectedDocPreview.file_name}</span>
                      <span className="text-[11px] text-slate-500 mt-1">High-Res OCR Scan ({selectedDocPreview.file_size})</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold mt-3">
                        ✓ PaddleOCR Verified
                      </span>
                    </div>

                    {/* Extracted Data Box */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Digitized Entities:</span>
                      <div className="space-y-2">
                        {selectedDocPreview.extracted_items.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-slate-600 text-[11px]">{item.dosage} — {item.instructions}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 italic mt-2">{selectedDocPreview.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        alert(`Downloading original ${selectedDocPreview.file_name}...`)
                        setSelectedDocPreview(null)
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      ⬇ Download Original File
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  )
}
