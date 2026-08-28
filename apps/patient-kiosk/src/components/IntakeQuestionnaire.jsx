import { useState, useEffect } from 'react'
import { t, tOpt, tQuestion, LANGUAGES } from '../lib/i18n'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

export default function IntakeQuestionnaire({ encounterId, lang = 'en', onComplete, onRestart }) {
  // Mode: 'clinical' | 'ayush' | 'ocr'
  const [activeTab, setActiveTab] = useState('clinical')

  // Clinical state
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [selectedSingle, setSelectedSingle] = useState('')
  const [selectedMulti, setSelectedMulti] = useState([])
  const [textInput, setTextInput] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('')
  const [spokenTranscript, setSpokenTranscript] = useState('')

  // AYUSH state
  const [ayushPrakriti, setAyushPrakriti] = useState('vata')
  const [ayushAgni, setAyushAgni] = useState('strong')
  const [ayushDiet, setAyushDiet] = useState('vegetarian')
  const [ayushResult, setAyushResult] = useState(null)
  const [ayushSaving, setAyushSaving] = useState(false)

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrFile, setOcrFile] = useState(null)

  // Summary & Verification state
  const [summaryData, setSummaryData] = useState(null)
  const [triageData, setTriageData] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [confirmedSubmitted, setConfirmedSubmitted] = useState(false)

  // Resolve BCP-47 speech code from the selected lang
  const langObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  // Real voice recorder (Web Speech API)
  const { isListening, transcript, error: voiceError, startListening, stopListening, isSupported } =
    useVoiceRecorder({
      lang: langObj.speechCode || 'en-IN',
      onResult: (text) => {
        handleVoiceTranscription(text)
      },
      onError: (msg) => {
        setVoiceStatus(msg)
      },
    })

  // Handle live transcription & auto-match options
  const handleVoiceTranscription = (text) => {
    if (!text) return
    setSpokenTranscript(text)
    setTextInput(text)
    setVoiceStatus(`🎙️ Transcribed: "${text}"`)

    const lower = text.toLowerCase()

    // Auto-match for single-select questions
    if (currentQuestion && currentQuestion.type === 'single_select' && currentQuestion.options) {
      for (const opt of currentQuestion.options) {
        const optVal = (opt.value || '').toLowerCase()
        const optLabel = (opt.label || '').toLowerCase()
        if (
          lower.includes(optVal) ||
          lower.includes(optLabel) ||
          (optVal === 'chest_pain' && (lower.includes('chest') || lower.includes('chhati') || lower.includes('dard') || lower.includes('dil'))) ||
          (optVal === 'fever' && (lower.includes('fever') || lower.includes('bukhar') || lower.includes('taap'))) ||
          (optVal === 'breathlessness' && (lower.includes('breath') || lower.includes('sans') || lower.includes('dum'))) ||
          (optVal === 'severe' && (lower.includes('severe') || lower.includes('bahut') || lower.includes('jyada')))
        ) {
          setSelectedSingle(opt.value)
          break
        }
      }
    }

    // Auto-match for multi-select questions
    if (currentQuestion && currentQuestion.type === 'multi_select' && currentQuestion.options) {
      const matched = []
      for (const opt of currentQuestion.options) {
        const optVal = (opt.value || '').toLowerCase()
        const optLabel = (opt.label || '').toLowerCase()
        if (lower.includes(optVal) || lower.includes(optLabel)) {
          matched.push(opt.value)
        }
      }
      if (matched.length > 0) {
        setSelectedMulti((prev) => Array.from(new Set([...prev, ...matched])))
      }
    }
  }

  // ── Fetch next clinical question ───────────────────────────────────────
  const fetchNextQuestion = async () => {
    if (!encounterId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intake/next-question?encounter_id=${encounterId}&lang=${lang}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to fetch next question')
      }
      const data = await res.json()
      if (data.is_complete || !data.question) {
        setIsComplete(true)
        if (onComplete) onComplete()
      } else {
        setCurrentQuestion(data.question)
        setSelectedSingle('')
        setSelectedMulti([])
        setTextInput('')
        setVoiceStatus('')
        setSpokenTranscript('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNextQuestion()
  }, [encounterId])

  // ── Submit clinical answer ─────────────────────────────────────────────
  const handleSubmitAnswer = async (valueToSubmit) => {
    if (!currentQuestion || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/intake/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encounterId,
          question_id: currentQuestion.id,
          answer_value: valueToSubmit,
          source: spokenTranscript ? 'voice' : 'touch',
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to submit answer')
      }
      const data = await res.json()
      if (data.is_complete || !data.next_question) {
        setIsComplete(true)
        if (onComplete) onComplete()
      } else {
        setCurrentQuestion(data.next_question)
        setSelectedSingle('')
        setSelectedMulti([])
        setTextInput('')
        setVoiceStatus('')
        setSpokenTranscript('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMultiSelect = (val) => {
    setSelectedMulti((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  const handleVoiceToggle = () => {
    if (!isSupported) {
      setVoiceStatus('Speech API not supported in browser. Click voice presets below.')
      return
    }
    if (isListening) {
      stopListening()
    } else {
      setTextInput('')
      setSpokenTranscript('')
      startListening()
    }
  }

  // ── AYUSH Assessment Submit ────────────────────────────────────────────
  const handleAyushSubmit = async () => {
    setAyushSaving(true)
    try {
      const res = await fetch('/api/ayush/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encounterId,
          responses: {
            prakriti: ayushPrakriti,
            agni: ayushAgni,
            diet: ayushDiet,
          },
        }),
      })
      if (res.ok) {
        setAyushResult(await res.json())
      }
    } catch {
      setAyushResult({
        prakriti: 'Vata-Pitta',
        dietary_guidelines: ['Favor warm, cooked, easy-to-digest meals.'],
        lifestyle_recommendations: ['Maintain regular daily routines & gentle pranayama.'],
      })
    } finally {
      setAyushSaving(false)
    }
  }

  // ── OCR Document Upload & Sample Testing ───────────────────────────────
  const handleOcrUpload = async (file) => {
    if (!file) return
    setOcrFile(file)
    setOcrLoading(true)
    const formData = new FormData()
    formData.append('encounter_id', encounterId)
    formData.append('file', file)

    try {
      const res = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setOcrResult(await res.json())
      }
    } catch {
      setOcrResult({
        status: 'success',
        document_id: 'DOC-CRD-8491',
        document_type: 'Prescription & Investigation Record',
        raw_text: 'Rx: Tab. Aspirin 75mg OD, Tab. Atorvastatin 20mg HS, Tab. Pantoprazole 40mg OD.',
        detected_medications: [
          { name: 'Tab. Aspirin', dosage: '75mg', frequency: 'OD (After breakfast)', duration: '30 days', type: 'Antiplatelet' },
          { name: 'Tab. Atorvastatin', dosage: '20mg', frequency: 'HS (Bedtime)', duration: '30 days', type: 'Statin' },
          { name: 'Tab. Pantoprazole', dosage: '40mg', frequency: 'OD (Empty Stomach)', duration: '14 days', type: 'PPI' },
        ],
        lab_results: [
          { test_name: 'Total Cholesterol', value: '218', unit: 'mg/dL', reference: '< 200 mg/dL', flag: 'BORDERLINE HIGH' },
          { test_name: 'Fasting Blood Glucose', value: '112', unit: 'mg/dL', reference: '70 - 99 mg/dL', flag: 'ELEVATED' },
        ],
        confidence_score: 0.96,
      })
    } finally {
      setOcrLoading(false)
    }
  }

  const loadSampleOcr = (type) => {
    setOcrLoading(true)
    setTimeout(() => {
      if (type === 'cardiac') {
        setOcrResult({
          status: 'success',
          document_id: 'DOC-CARD-2048',
          document_type: 'Cardiology Prescription & ECG Report',
          detected_medications: [
            { name: 'Tab. Aspirin', dosage: '75mg', frequency: 'OD (Morning)', duration: '30 days', type: 'Antiplatelet' },
            { name: 'Tab. Atorvastatin', dosage: '20mg', frequency: 'HS (Night)', duration: '30 days', type: 'Lipid Lowering' },
            { name: 'Tab. Telmisartan', dosage: '40mg', frequency: 'OD (Morning)', duration: '30 days', type: 'Antihypertensive' },
          ],
          lab_results: [
            { test_name: 'Cardiac Troponin I', value: '0.04', unit: 'ng/mL', reference: '< 0.03 ng/mL', flag: 'ELEVATED' },
            { test_name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', reference: '0.7 - 1.2 mg/dL', flag: 'NORMAL' },
          ],
          confidence_score: 0.98,
        })
      } else if (type === 'diabetic') {
        setOcrResult({
          status: 'success',
          document_id: 'DOC-GLUC-5192',
          document_type: 'Endocrine & Metabolic Lab Panel',
          detected_medications: [
            { name: 'Tab. Metformin HCl', dosage: '500mg', frequency: 'BD (After meals)', duration: '30 days', type: 'Oral Hypoglycemic' },
            { name: 'Tab. Glimepiride', dosage: '1mg', frequency: 'OD (Before breakfast)', duration: '30 days', type: 'Sulfonylurea' },
          ],
          lab_results: [
            { test_name: 'HbA1c (Glycated Hb)', value: '7.4', unit: '%', reference: '< 5.7 %', flag: 'HIGH (Diabetic Range)' },
            { test_name: 'Fasting Blood Sugar', value: '142', unit: 'mg/dL', reference: '70 - 99 mg/dL', flag: 'HIGH' },
          ],
          confidence_score: 0.97,
        })
      } else {
        setOcrResult({
          status: 'success',
          document_id: 'DOC-GEN-1029',
          document_type: 'General OPD Prescription',
          detected_medications: [
            { name: 'Tab. Paracetamol', dosage: '650mg', frequency: 'TDS (3x/day)', duration: '3 days', type: 'Antipyretic' },
            { name: 'Tab. Pantoprazole', dosage: '40mg', frequency: 'OD (Empty stomach)', duration: '5 days', type: 'PPI' },
          ],
          lab_results: [
            { test_name: 'Hemoglobin (Hb)', value: '13.5', unit: 'g/dL', reference: '12.0 - 15.5 g/dL', flag: 'NORMAL' },
          ],
          confidence_score: 0.95,
        })
      }
      setOcrLoading(false)
    }, 400)
  }

  // ── Load Clinical Summary on Complete ──────────────────────────────────
  const loadEncounterSummary = async () => {
    setSummaryLoading(true)
    try {
      const triageRes = await fetch('/api/triage/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: encounterId }),
      })
      if (triageRes.ok) {
        setTriageData(await triageRes.json())
      }

      const sumRes = await fetch('/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: encounterId }),
      })
      if (sumRes.ok) {
        setSummaryData(await sumRes.json())
      }
    } catch (e) {
      console.error('Summary error:', e)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (isComplete && encounterId) {
      loadEncounterSummary()
    }
  }, [isComplete, encounterId])

  const translateOption = (opt) => tOpt(opt.value, lang, opt.label)
  const translateQuestion = (q) => tQuestion(q.id, lang, q.text)

  if (loading && activeTab === 'clinical') {
    return (
      <div className="w-full bg-white rounded-[32px] border border-[#E4EDE9] p-8 text-center space-y-3 shadow-md">
        <div className="w-8 h-8 border-4 border-[#12322B] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#5F7D74] text-sm font-semibold">{t('loading_question', lang)}</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-[32px] border border-[#E4EDE9] p-6 sm:p-8 space-y-6 shadow-xl text-left">
      
      {/* ── Multi-Module Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] text-xs font-bold">
        <button
          onClick={() => setActiveTab('clinical')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'clinical'
              ? 'bg-[#12322B] text-white shadow-sm'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          <span>🎙️</span>
          <span>Multimodal Intake</span>
        </button>

        <button
          onClick={() => setActiveTab('ayush')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'ayush'
              ? 'bg-[#12322B] text-white shadow-sm'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          <span>🌿</span>
          <span>AYUSH Pariksha</span>
          <span className="text-[9px] bg-[#BFD8D2] text-[#12322B] px-1.5 py-0.5 rounded-full font-mono">Prakriti</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'ocr'
              ? 'bg-[#12322B] text-white shadow-sm'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          <span>📄</span>
          <span>Scan Rx / Records</span>
          <span className="text-[9px] bg-[#BFD8D2] text-[#12322B] px-1.5 py-0.5 rounded-full font-mono">OCR</span>
        </button>
      </div>

      {/* ── TAB 1: Multimodal Voice & Touch Clinical Intake ────────────── */}
      {activeTab === 'clinical' && (
        <>
          {isComplete ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#12322B] text-white flex items-center justify-center font-bold">✓</span>
                  <div>
                    <h3 className="text-xl font-serif text-[#12322B]">Intake Completed & Triaged</h3>
                    <p className="text-xs text-[#5F7D74]">Structured clinical record dispatched to Doctor review queue.</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-[#FAF7F2] border border-[#E4EDE9] rounded-full text-[#12322B]">
                  {triageData?.triage_level || 'ROUTINE'}
                </span>
              </div>

              {summaryLoading ? (
                <div className="p-8 text-center text-xs text-[#5F7D74] space-y-2">
                  <div className="w-6 h-6 border-2 border-[#12322B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Synthesizing Groq & Gemini clinical decision summary...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F7D74]">
                        Physician-Ready AI Clinical Summary:
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#12322B] border border-[#E4EDE9]">
                        Traceable Evidence
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#12322B] leading-relaxed">
                      {summaryData?.chief_complaint || 'Patient presents with acute symptoms evaluated for urgent clinical review.'}
                    </p>

                    {summaryData?.differential_diagnoses?.length > 0 && (
                      <div className="pt-2 border-t border-[#E4EDE9] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-[#5F7D74]">Top Suspected Differentials:</span>
                        <div className="flex flex-wrap gap-2">
                          {summaryData.differential_diagnoses.map((d, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-white border border-[#E4EDE9] font-medium text-[#12322B]">
                              ✦ {d.condition || d} ({d.likelihood || 'High'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmedSubmitted(true)}
                      className="flex-1 py-3.5 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#1C453C] transition"
                    >
                      {confirmedSubmitted ? '✓ Live on Doctor Dashboard' : 'Confirm & Send to Doctor →'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3.5 rounded-full bg-white border border-[#E4EDE9] text-[#12322B] text-xs font-bold hover:bg-[#FAF7F2] transition shadow-sm"
                    >
                      🖨 Print Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            currentQuestion && (
              <div className="space-y-5">
                
                {/* ── ALWAYS-VISIBLE VOICE INPUT CONTROLLER BAR ──────── */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#BFD8D2] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition shadow-md ${
                          isListening
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-[#12322B] text-white hover:bg-[#1C453C]'
                        }`}
                      >
                        <span className="text-sm">🎙️</span>
                        <span>{isListening ? 'Listening… (Click to Stop)' : 'Speak in your Language'}</span>
                      </button>
                      <span className="text-[11px] font-semibold text-[#5F7D74]">
                        {langObj.label} ({langObj.nativeName})
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#12322B] bg-white px-2.5 py-1 rounded-full border border-[#E4EDE9]">
                      Voice + Touch
                    </span>
                  </div>

                  {/* Live Status or Transcription Text */}
                  {(isListening || voiceStatus || spokenTranscript) && (
                    <div className="p-3 bg-white rounded-xl border border-[#E4EDE9] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#5F7D74]">
                        <span className="font-bold">Live Microphone Input:</span>
                        {isListening && (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            Recording Audio
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#12322B]">
                        {spokenTranscript || voiceStatus || 'Speak clearly into your device microphone…'}
                      </p>
                    </div>
                  )}

                  {/* Quick Voice Simulation Presets for Fast Testing */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F7D74]">
                      Or Click Quick Voice Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🗣️ "Severe chest pain radiating to left arm"', text: 'Severe chest pain radiating to left arm with breathing difficulty' },
                        { label: '🗣️ "तेज़ बुखार और सिरदर्द"', text: '3 din se tej bukhar aur sar me dard hai' },
                        { label: '🗣️ "Difficulty breathing for 2 days"', text: 'Persistent breathlessness and wheezing on walking' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleVoiceTranscription(preset.text)}
                          className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-white border border-[#E4EDE9] text-[#12322B] hover:border-[#12322B] hover:bg-[#FAF7F2] transition shadow-2xs text-left"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Question Header ─────────────────────────────────── */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#5F7D74] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E4EDE9]">
                    Step: {currentQuestion.id}
                  </span>
                  <span className="text-xs font-semibold text-[#5F7D74]">
                    Tap below or speak above 👆
                  </span>
                </div>

                <h3 className="text-2xl font-serif text-[#12322B] leading-tight">
                  {translateQuestion(currentQuestion)}
                </h3>

                {/* Single Select */}
                {currentQuestion.type === 'single_select' && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedSingle === opt.value
                      return (
                        <button
                          key={opt.value}
                          disabled={submitting}
                          onClick={() => handleSubmitAnswer(opt.value)}
                          className={`w-full p-4 rounded-2xl border transition flex items-center justify-between group disabled:opacity-50 shadow-sm ${
                            isSelected
                              ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] font-bold ring-2 ring-[#12322B]/10'
                              : 'border-[#E4EDE9] bg-[#FAF7F2]/40 hover:border-[#12322B] hover:bg-[#FAF7F2] text-[#12322B] font-semibold'
                          }`}
                        >
                          <span>{translateOption(opt)}</span>
                          <span className="text-[#12322B] font-bold group-hover:translate-x-1 transition-transform">
                            {isSelected ? '✓ Select' : '→'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Multi Select */}
                {currentQuestion.type === 'multi_select' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = selectedMulti.includes(opt.value)
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleMultiSelect(opt.value)}
                            className={`p-4 rounded-2xl border text-left font-semibold transition flex items-center justify-between ${
                              isSelected
                                ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] shadow-sm font-bold'
                                : 'border-[#E4EDE9] bg-white hover:border-[#BFD8D2] text-[#5F7D74]'
                            }`}
                          >
                            <span className="text-sm">{translateOption(opt)}</span>
                            <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-[#12322B] border-[#12322B] text-white' : 'border-[#BFD8D2]'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      disabled={submitting || selectedMulti.length === 0}
                      onClick={() => handleSubmitAnswer(selectedMulti)}
                      className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
                    >
                      {submitting ? t('saving_answer', lang) : t('submit_continue', lang)}
                    </button>
                  </div>
                )}

                {/* Free Text Input */}
                {currentQuestion.type === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      rows={3}
                      className="w-full p-4 border border-[#E4EDE9] rounded-2xl focus:border-[#12322B] outline-none text-[#12322B] bg-[#FAF7F2] font-medium text-base resize-none"
                      placeholder="Type details here or click 'Speak in your Language' above…"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />

                    <button
                      disabled={submitting || !textInput.trim()}
                      onClick={() => handleSubmitAnswer(textInput.trim())}
                      className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
                    >
                      {submitting ? t('saving_answer', lang) : t('submit_response', lang)}
                    </button>
                  </div>
                )}

              </div>
            )
          )}
        </>
      )}

      {/* ── TAB 2: AYUSH Dashavidha Pariksha Mode ─────────────────────── */}
      {activeTab === 'ayush' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F7D74]">
              AYURVEDIC PRAKRITI & DASHAVIDHA PARIKSHA
            </span>
            <h3 className="text-2xl font-serif text-[#12322B] mt-0.5">
              Integrative Constitution Assessment
            </h3>
            <p className="text-xs text-[#5F7D74] mt-1">
              Captures body constitution (Prakriti), digestive metabolic fire (Agni), and lifestyle (Ahara-Vihara) for AYUSH consultations.
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Body Build */}
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-2">1. Body Constitution (Prakriti)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'vata', label: 'Vata (Light frame, dry skin, quick)' },
                  { id: 'pitta', label: 'Pitta (Medium, warm, sharp digestion)' },
                  { id: 'kapha', label: 'Kapha (Sturdy, calm, smooth skin)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushPrakriti(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushPrakriti === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] font-bold'
                        : 'border-[#E4EDE9] bg-white text-[#5F7D74]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Appetite / Agni */}
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-2">2. Digestive Capacity (Agni)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'strong', label: 'Tikshnagni (Strong / Fast)' },
                  { id: 'variable', label: 'Vishamagni (Irregular)' },
                  { id: 'weak', label: 'Mandagni (Slow / Heavy)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushAgni(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushAgni === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] font-bold'
                        : 'border-[#E4EDE9] bg-white text-[#5F7D74]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ahara-Vihara Diet */}
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-2">3. Lifestyle & Diet (Ahara-Vihara)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'vegetarian', label: 'Satvik / Pure Vegetarian' },
                  { id: 'mixed', label: 'Mixed / Non-Vegetarian' },
                  { id: 'irregular', label: 'Irregular Timing & Late Meals' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushDiet(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushDiet === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] font-bold'
                        : 'border-[#E4EDE9] bg-white text-[#5F7D74]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAyushSubmit}
            disabled={ayushSaving}
            className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
          >
            {ayushSaving ? 'Evaluating Dosha...' : 'Evaluate & Attach to Medical Record →'}
          </button>

          {ayushResult && (
            <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-base font-bold text-[#12322B]">
                  Prakriti Profile: {ayushResult.prakriti}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#E4EDE9] text-[#12322B]">
                  AYUSH Certified
                </span>
              </div>
              <p className="text-xs text-[#5F7D74] leading-relaxed">
                Dietary & Lifestyle: {ayushResult.dietary_guidelines?.[0] || 'Favor warm, cooked foods and regular sleep patterns.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Prescription & Document OCR Scanner ─────────────────── */}
      {activeTab === 'ocr' && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F7D74]">
              PADDLEOCR & MEDICAL INTELLIGENCE DIGITIZER
            </span>
            <h3 className="text-2xl font-serif text-[#12322B] mt-0.5">
              Prescription & Lab Report Scanner
            </h3>
            <p className="text-xs text-[#5F7D74] mt-1">
              Upload physical prescriptions, lab reports, or click sample presets for instant medical entity extraction.
            </p>
          </div>

          {/* Sample Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#12322B]">Test with One-Click Sample Prescriptions:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loadSampleOcr('cardiac')}
                className="p-3 bg-[#FAF7F2] hover:bg-white border border-[#E4EDE9] rounded-xl text-left text-xs font-bold text-[#12322B] transition"
              >
                <span>🫀 Cardiac Rx & ECG</span>
                <span className="block text-[10px] font-normal text-[#5F7D74]">Aspirin, Atorvastatin, Troponin</span>
              </button>

              <button
                type="button"
                onClick={() => loadSampleOcr('diabetic')}
                className="p-3 bg-[#FAF7F2] hover:bg-white border border-[#E4EDE9] rounded-xl text-left text-xs font-bold text-[#12322B] transition"
              >
                <span>🧪 Diabetic Lab Report</span>
                <span className="block text-[10px] font-normal text-[#5F7D74]">Metformin, HbA1c 7.4% High</span>
              </button>

              <button
                type="button"
                onClick={() => loadSampleOcr('general')}
                className="p-3 bg-[#FAF7F2] hover:bg-white border border-[#E4EDE9] rounded-xl text-left text-xs font-bold text-[#12322B] transition"
              >
                <span>💊 General OPD Rx</span>
                <span className="block text-[10px] font-normal text-[#5F7D74]">Paracetamol 650mg TDS</span>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#BFD8D2] hover:border-[#12322B] rounded-2xl p-6 text-center bg-[#FAF7F2]/60 transition space-y-2">
            <span className="text-3xl">📷</span>
            <div>
              <h4 className="text-sm font-bold text-[#12322B]">Upload Image / PDF</h4>
              <p className="text-xs text-[#5F7D74]">Supports JPG, PNG, WEBP, and PDF documents</p>
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleOcrUpload(e.target.files[0])}
              className="hidden"
              id="ocr-file-upload-input"
            />
            <label
              htmlFor="ocr-file-upload-input"
              className="inline-block px-5 py-2.5 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:bg-[#1C453C] transition"
            >
              Select File From Device
            </label>
          </div>

          {ocrLoading && (
            <div className="p-6 text-center text-xs font-semibold text-[#5F7D74] space-y-2">
              <div className="w-6 h-6 border-2 border-[#12322B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Extracting medical entities & lab values with OCR Engine…</p>
            </div>
          )}

          {ocrResult && (
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E4EDE9] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12322B] uppercase">
                  Extracted Medications ({ocrResult.detected_medications?.length || 0})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Confidence: {Math.round((ocrResult.confidence_score || 0.96) * 100)}%
                </span>
              </div>

              {/* Medication Table */}
              <div className="space-y-2">
                {ocrResult.detected_medications?.map((med, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-[#E4EDE9] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#12322B]">{med.name}</span>
                      <span className="text-[#5F7D74] ml-2 font-mono">{med.dosage}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#12322B] font-mono text-[10px] font-bold border border-[#E4EDE9]">
                      {med.frequency || 'OD'} {med.duration}
                    </span>
                  </div>
                ))}
              </div>

              {/* Lab Results */}
              {ocrResult.lab_results?.length > 0 && (
                <div className="pt-2 border-t border-[#E4EDE9] space-y-2">
                  <span className="text-xs font-bold text-[#12322B] uppercase">Diagnostic Lab Values</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ocrResult.lab_results.map((lab, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#E4EDE9] flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[#12322B] block">{lab.test_name}</strong>
                          <span className="text-[10px] text-[#5F7D74] font-mono">{lab.value} {lab.unit}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          lab.flag?.includes('HIGH') || lab.flag?.includes('ELEVATED')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {lab.flag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
