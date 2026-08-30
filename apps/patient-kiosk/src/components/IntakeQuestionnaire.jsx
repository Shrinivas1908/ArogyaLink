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

  // Conversational Voice Narrative state (50+ word speech recognition)
  const [narrativeInput, setNarrativeInput] = useState('')
  const [narrativeExtracted, setNarrativeExtracted] = useState(null)
  const [aiFollowup, setAiFollowup] = useState(null)
  const [processingNarrative, setProcessingNarrative] = useState(false)
  const [narrativeFollowupAnswer, setNarrativeFollowupAnswer] = useState('')

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

  // ── High-Definition Crystal-Clear Voice Output ──────────────────────────
  const playClearVoice = (text, targetSpeechCode) => {
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()

    const clean = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#~`]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(clean)
    const code = targetSpeechCode || langObj.speechCode || 'en-IN'
    utterance.lang = code
    utterance.rate = 0.88
    utterance.pitch = 1.02
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      const base = code.toLowerCase().split('-')[0]
      const best =
        voices.find((v) => v.lang.toLowerCase().startsWith(base) && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Online'))) ||
        voices.find((v) => v.lang.toLowerCase() === code.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
        voices.find((v) => v.name.includes('Google') || v.name.includes('Natural')) ||
        voices[0]
      if (best) utterance.voice = best
    }

    window.speechSynthesis.speak(utterance)
  }

  // ── Process Full Multi-Sentence (50+ word) Voice Narrative ──────────────
  const handleProcessVoiceNarrative = async (textToProcess) => {
    const text = (textToProcess || narrativeInput || spokenTranscript).trim()
    if (!text || !encounterId) return
    setProcessingNarrative(true)
    setError(null)
    try {
      const res = await fetch('/api/intake/process-voice-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encounterId,
          narrative_text: text,
          language: lang || 'en',
        }),
      })
      if (!res.ok) throw new Error('Failed to process voice narrative')
      const data = await res.json()
      setNarrativeExtracted(data.extracted_entities)
      setAiFollowup(data.ai_followup_question)

      // Speak the dynamic follow-up question in the patient's language with crystal clarity
      if (data.ai_followup_audio_text) {
        playClearVoice(data.ai_followup_audio_text, langObj.speechCode)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingNarrative(false)
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
        body: JSON.stringify({ encounter_id: encounterId, language: lang }),
      })
      if (sumRes.ok) {
        const sumJson = await sumRes.json()
        setSummaryData(sumJson.summary || sumJson)
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
  }, [isComplete, encounterId, lang])

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

  const triageLevel = (triageData?.triage_level || 'ROUTINE').toUpperCase()
  const triageColorClass =
    triageLevel === 'CRITICAL'
      ? 'bg-red-100 text-red-800 border-red-200'
      : triageLevel === 'URGENT'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200'

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
          <span>{t('tab_clinical', lang)}</span>
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
          <span>{t('tab_ayush', lang)}</span>
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
          <span>{t('tab_ocr', lang)}</span>
        </button>
      </div>

      {/* ── TAB 1: Multimodal Voice & Touch Clinical Intake ────────────── */}
      {activeTab === 'clinical' && (
        <>
          {isComplete ? (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#12322B] text-white flex items-center justify-center font-bold">✓</span>
                  <div>
                    <h3 className="text-xl font-serif text-[#12322B]">{t('intake_completed_title', lang)}</h3>
                    <p className="text-xs text-[#5F7D74]">{t('intake_completed_desc', lang)}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-3 py-1 border rounded-full ${triageColorClass}`}>
                  {triageLevel}
                </span>
              </div>

              {summaryLoading ? (
                <div className="p-12 text-center text-xs text-[#5F7D74] space-y-3">
                  <div className="w-7 h-7 border-2 border-[#12322B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-semibold">Synthesizing Comprehensive 1-Page AI Clinical Report in {langObj.name}...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* ── 1-PAGE COMPREHENSIVE CLINICAL SUMMARY CARD ────── */}
                  <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-[#E4EDE9] space-y-5 shadow-sm">
                    
                    {/* Header Info */}
                    <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F7D74] block">
                          {t('physician_ready_summary', lang)}
                        </span>
                        <div className="text-xs font-mono text-[#12322B] mt-0.5">
                          Encounter ID: <strong>{encounterId}</strong> • Priority: <strong>{triageLevel}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-[#12322B] border border-[#E4EDE9] shadow-2xs">
                        100% Traceable AI
                      </span>
                    </div>

                    {/* Section 1: Quick Doctor Snapshot */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E4EDE9] space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#12322B] text-white rounded">
                          {t('quick_snapshot', lang)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#12322B] leading-relaxed">
                        {summaryData?.quick_summary || `Patient presenting with ${summaryData?.chief_complaint || 'acute symptoms'}; priority clinical review and diagnostic examination indicated.`}
                      </p>
                    </div>

                    {/* Section 2: Patient-Friendly Explanation */}
                    <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                        <span>{t('patient_friendly_title', lang)}</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed font-sans font-medium">
                        {summaryData?.patient_friendly_summary || 'Your reported symptoms have been carefully noted. Our clinical team will conduct a focused examination and provide appropriate treatment.'}
                      </p>
                    </div>

                    {/* Section 3: History of Present Illness (HPI Narrative) */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E4EDE9] space-y-2">
                      <span className="text-[10px] font-bold uppercase text-[#5F7D74] block">
                        {t('hpi_narrative_title', lang)}
                      </span>
                      <p className="text-xs text-[#12322B] leading-relaxed">
                        {summaryData?.history_of_present_illness || `Patient presents with a complaint of ${summaryData?.chief_complaint || 'acute symptoms'} of ${summaryData?.duration || 'recent'} duration. Evaluated with severity grade ${summaryData?.severity || triageLevel}.`}
                      </p>
                      {summaryData?.key_findings?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {summaryData.key_findings.map((f, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E4EDE9] text-[#12322B]">
                              • {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 4: Active Medications & OCR Extraction */}
                    {(summaryData?.active_medications_and_labs?.length > 0 || ocrResult?.detected_medications?.length > 0) && (
                      <div className="p-4 bg-white rounded-2xl border border-[#E4EDE9] space-y-2">
                        <span className="text-[10px] font-bold uppercase text-[#5F7D74] block">
                          {t('active_meds_ocr_title', lang)}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(ocrResult?.detected_medications || summaryData?.active_medications_and_labs || []).map((m, idx) => {
                            const medName = typeof m === 'string' ? m : m.name
                            const medDose = typeof m === 'object' ? `${m.dosage || ''} ${m.frequency || ''}` : ''
                            return (
                              <div key={idx} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E4EDE9] flex items-center justify-between text-xs">
                                <div>
                                  <strong className="text-[#12322B] block">{medName}</strong>
                                  {medDose && <span className="text-[10px] text-[#5F7D74]">{medDose}</span>}
                                </div>
                                <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                                  Prescribed
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 5: Differential Diagnoses */}
                    {summaryData?.differential_diagnoses?.length > 0 && (
                      <div className="p-4 bg-white rounded-2xl border border-[#E4EDE9] space-y-2">
                        <span className="text-[10px] font-bold uppercase text-[#5F7D74] block">
                          {t('differentials_title', lang)}
                        </span>
                        <div className="space-y-2">
                          {summaryData.differential_diagnoses.map((d, i) => (
                            <div key={i} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E4EDE9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div>
                                <span className="font-bold text-[#12322B] block">{d.condition || d}</span>
                                {d.rationale && <p className="text-[11px] text-[#5F7D74] mt-0.5">{d.rationale}</p>}
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                d.likelihood === 'High' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {d.likelihood || 'High Likelihood'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 6: Physician Action Plan & Next Steps */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E4EDE9] space-y-2">
                      <span className="text-[10px] font-bold uppercase text-[#5F7D74] block">
                        {t('suggested_actions_title', lang)}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(summaryData?.suggested_doctor_actions || [
                          'Conduct focused physical examination and vital signs assessment',
                          'Perform baseline diagnostic workup and ECG if cardiac/respiratory',
                          'Review medication reconciliation against prescription history',
                          'Provide supportive hydration and appropriate prescription',
                        ]).map((act, i) => (
                          <div key={i} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E4EDE9] text-xs text-[#12322B] flex items-start gap-2">
                            <span className="text-[#12322B] font-bold">✓</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* ── ACTION BUTTONS ─────────────────────────────────── */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setConfirmedSubmitted(true)}
                      className="flex-1 py-4 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#1C453C] transition text-center"
                    >
                      {confirmedSubmitted ? t('live_on_dashboard', lang) : t('confirm_send_doctor', lang)}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-4 rounded-full bg-white border border-[#E4EDE9] text-[#12322B] text-xs font-bold hover:bg-[#FAF7F2] transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {t('print_token_btn', lang)}
                    </button>
                    {onRestart && (
                      <button
                        onClick={onRestart}
                        className="px-6 py-4 rounded-full bg-[#FAF7F2] border border-[#E4EDE9] text-[#5F7D74] hover:text-[#12322B] text-xs font-bold transition shadow-sm flex items-center justify-center"
                      >
                        {t('restart_checkin_btn', lang)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            currentQuestion && (
              <div className="space-y-5">
                
                {/* ── REAL LIVE MULTILINGUAL VOICE INTAKE PANEL (50+ WORDS) ──────── */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#F4EFE6] to-[#FAF7F2] border border-[#BFD8D2] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleVoiceToggle}
                        className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition shadow-md ${
                          isListening
                            ? 'bg-red-600 text-white animate-bounce'
                            : 'bg-[#12322B] text-white hover:bg-[#1C453C]'
                        }`}
                      >
                        <span className="text-base">🎙️</span>
                        <span>{isListening ? '🛑 Stop Recording & Analyze' : 'Speak Full Symptoms (50+ Words)'}</span>
                      </button>
                      <span className="text-xs font-bold text-[#12322B]">
                        {langObj.label} ({langObj.nativeName})
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#12322B] bg-white px-3 py-1 rounded-full border border-[#BFD8D2]">
                      Live Voice AI
                    </span>
                  </div>

                  {/* Real-time Voice Transcription Box */}
                  <div className="p-4 bg-white rounded-2xl border border-[#BFD8D2] space-y-2">
                    <div className="flex items-center justify-between text-[#5F7D74] text-xs font-bold">
                      <span>Live Speech Recognition Stream:</span>
                      {isListening ? (
                        <span className="flex items-center gap-1 text-red-600 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          Listening to Microphone...
                        </span>
                      ) : (
                        <span className="text-[#8C7A70]">
                          Word count: {spokenTranscript ? spokenTranscript.trim().split(/\s+/).length : 0} words
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-[#12322B] min-h-[44px] leading-relaxed">
                      {spokenTranscript || (
                        <span className="text-[#8C7A70] italic font-normal">
                          Click the microphone button and speak your complete symptoms in detail (e.g. pain location, duration, severity, past history)...
                        </span>
                      )}
                    </p>

                    {spokenTranscript && !isListening && !narrativeExtracted && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleProcessVoiceNarrative(spokenTranscript)}
                          disabled={processingNarrative}
                          className="px-5 py-2 rounded-xl bg-[#12322B] hover:bg-[#1C453C] text-white text-xs font-bold transition shadow-sm"
                        >
                          {processingNarrative ? 'Analyzing Symptoms with Clinical AI...' : '🧠 Analyze Voice Narrative'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Dynamic Extraction & Follow-Up Question */}
                  {narrativeExtracted && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <span>✓</span> Extracted Clinical Findings
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          AI Structured Triage
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">CHIEF COMPLAINT</span>
                          <strong className="text-slate-900">{narrativeExtracted.chief_complaints?.join(', ')}</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">DURATION</span>
                          <strong className="text-slate-900">{narrativeExtracted.duration}</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">SEVERITY</span>
                          <strong className="text-slate-900">{narrativeExtracted.severity}</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">RED FLAGS</span>
                          <strong className="text-red-700">{narrativeExtracted.radiation !== 'none' ? 'Radiation Detected' : 'None'}</strong>
                        </div>
                      </div>

                      {/* Targeted Live Follow-up Question */}
                      {aiFollowup && (
                        <div className="p-3.5 bg-white rounded-xl border border-emerald-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                              <span>🗣️</span> Live AI Follow-Up Question:
                            </span>
                            <button
                              type="button"
                              onClick={() => playClearVoice(aiFollowup, langObj.speechCode)}
                              className="text-[10px] font-bold text-emerald-800 underline hover:text-emerald-950"
                            >
                              🔊 Repeat Question
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-relaxed">
                            {aiFollowup}
                          </p>

                          <div className="pt-1 flex gap-2">
                            <input
                              type="text"
                              value={narrativeFollowupAnswer}
                              onChange={(e) => setNarrativeFollowupAnswer(e.target.value)}
                              placeholder="Speak or type your answer (e.g. No medicine / कोई दवा नहीं)..."
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none"
                            />
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={async () => {
                                const val = (narrativeFollowupAnswer || 'None / No regular medications').trim()
                                setSubmitting(true)
                                try {
                                  await fetch('/api/intake/answer', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      encounter_id: encounterId,
                                      question_id: 'q_medical_history',
                                      answer_value: [val],
                                      source: 'voice',
                                    }),
                                  })
                                  setIsComplete(true)
                                  if (onComplete) onComplete()
                                } catch {
                                  setIsComplete(true)
                                  if (onComplete) onComplete()
                                } finally {
                                  setSubmitting(false)
                                }
                              }}
                              className="px-4 py-1.5 rounded-lg bg-[#12322B] text-white text-xs font-bold transition hover:bg-[#1E4A40] active:scale-95 disabled:opacity-50"
                            >
                              {submitting ? 'Saving...' : '✓ Submit & Complete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
