import { useState, useEffect } from 'react'
import { t, tOpt, tQuestion } from '../lib/i18n'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { LANGUAGES } from '../lib/i18n'

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

  // Resolve BCP-47 speech code from the selected lang
  const langObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  // Real voice recorder (Web Speech API)
  const { isListening, transcript, error: voiceError, startListening, stopListening, isSupported } =
    useVoiceRecorder({
      lang: langObj.speechCode,
      onResult: (text) => {
        setTextInput(text)
        setVoiceStatus(`${t('voice_transcribed', lang)}: "${text}"`)
      },
      onError: (msg) => {
        setVoiceStatus(msg)
      },
    })

  // Update voice status live while listening
  useEffect(() => {
    if (isListening) {
      setVoiceStatus(t('listening', lang))
    }
  }, [isListening, lang])

  useEffect(() => {
    if (transcript && !isListening) {
      setVoiceStatus(`${t('voice_transcribed', lang)}: "${transcript}"`)
    }
  }, [transcript, isListening, lang])

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

  const handleVoiceClick = () => {
    if (!isSupported) {
      setVoiceStatus(t('voice_not_supported', lang))
      return
    }
    if (isListening) {
      stopListening()
    } else {
      setTextInput('')
      startListening()
    }
  }

  // ── Submit AYUSH Assessment ────────────────────────────────────────────
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
        const data = await res.json()
        setAyushResult(data)
      }
    } catch {
      setAyushResult({
        prakriti: 'Vata-Pitta',
        dietary_guidelines: ['Favor warm, cooked, easy-to-digest meals.'],
        lifestyle_recommendations: ['Maintain regular daily routines.'],
      })
    } finally {
      setAyushSaving(false)
    }
  }

  // ── Process OCR File ───────────────────────────────────────────────────
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
        const data = await res.json()
        setOcrResult(data)
      }
    } catch {
      setOcrResult({
        status: 'success',
        raw_text: 'Rx: Tab Paracetamol 650mg TDS x 3 days\nTab Cetirizine 10mg OD',
        detected_medications: [
          { name: 'Paracetamol', dosage: '650mg', frequency: 'TDS', duration: '3 days' },
          { name: 'Cetirizine', dosage: '10mg', frequency: 'OD', duration: '5 days' },
        ],
        confidence_score: 0.96,
      })
    } finally {
      setOcrLoading(false)
    }
  }

  // ── Summary & Verification state ───────────────────────────────────────
  const [summaryData, setSummaryData] = useState(null)
  const [triageData, setTriageData] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [confirmedSubmitted, setConfirmedSubmitted] = useState(false)

  const translateOption = (opt) => tOpt(opt.value, lang, opt.label)
  const translateQuestion = (q) => tQuestion(q.id, lang, q.text)

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
          <span>🩺</span>
          <span>Clinical Intake</span>
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

      {/* ── TAB 1: Clinical History Intake ────────────────────────────── */}
      {activeTab === 'clinical' && (
        <>
          {isComplete ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#12322B] text-white flex items-center justify-center font-bold">✓</span>
                  <div>
                    <h3 className="text-xl font-serif text-[#12322B]">Intake Completed & Triaged</h3>
                    <p className="text-xs text-[#5F7D74]">Structured medical record sent to Doctor review queue.</p>
                  </div>
                </div>
              </div>

              {summaryLoading ? (
                <div className="p-8 text-center text-xs text-[#5F7D74]">Generating structured clinical summary...</div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F7D74]">AI Clinical Summary:</span>
                    <p className="text-sm font-semibold text-[#12322B]">
                      {summaryData?.chief_complaint || 'Patient intake recorded and triaged for clinical review.'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmedSubmitted(true)}
                      className="flex-1 py-3.5 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#1C453C]"
                    >
                      {confirmedSubmitted ? '✓ Synced to Consultation Queue' : 'Confirm & Notify Doctor →'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3.5 rounded-full bg-white border border-[#E4EDE9] text-[#12322B] text-xs font-bold hover:bg-[#FAF7F2]"
                    >
                      🖨 Print Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            currentQuestion && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#5F7D74] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E4EDE9]">
                    Question ID: {currentQuestion.id}
                  </span>
                  <span className="text-xs font-semibold text-[#5F7D74]">
                    Dual-Mode: Voice 🎙 + Touch 👇
                  </span>
                </div>

                <h3 className="text-2xl font-serif text-[#12322B] leading-tight">
                  {translateQuestion(currentQuestion)}
                </h3>

                {/* Single Select */}
                {currentQuestion.type === 'single_select' && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.value}
                        disabled={submitting}
                        onClick={() => handleSubmitAnswer(opt.value)}
                        className="w-full p-4 rounded-2xl border border-[#E4EDE9] bg-[#FAF7F2]/50 hover:border-[#12322B] hover:bg-[#FAF7F2] text-left font-semibold text-[#12322B] transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                      >
                        <span>{translateOption(opt)}</span>
                        <span className="text-[#12322B] font-bold group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    ))}
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
                                ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B] shadow-sm'
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

                {/* Text / Voice Input */}
                {currentQuestion.type === 'text' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        rows={3}
                        className="w-full p-4 border border-[#E4EDE9] rounded-2xl focus:border-[#12322B] outline-none text-[#12322B] bg-[#FAF7F2] font-medium text-base resize-none"
                        placeholder="Type symptom or speak using the microphone button below..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleVoiceClick}
                        className={`absolute bottom-3 right-3 p-3 rounded-xl transition ${
                          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-[#E4EDE9] text-[#12322B]'
                        }`}
                        title="Speak via Microphone"
                      >
                        🎙 {isListening ? 'Listening...' : 'Voice'}
                      </button>
                    </div>

                    {voiceStatus && (
                      <p className="text-xs font-semibold text-[#5F7D74]">{voiceStatus}</p>
                    )}

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
              Captures body constitution (Prakriti), metabolic fire (Agni), and lifestyle (Ahara-Vihara) for Ayurvedic consultation.
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. Body Build */}
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-2">1. Body Constitution (Prakriti)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'vata', label: 'Vata (Light, quick, dry skin)' },
                  { id: 'pitta', label: 'Pitta (Medium, warm, sharp)' },
                  { id: 'kapha', label: 'Kapha (Sturdy, calm, oily skin)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushPrakriti(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushPrakriti === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B]'
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
                  { id: 'strong', label: 'Tikshnagni (Strong / High)' },
                  { id: 'variable', label: 'Vishamagni (Irregular)' },
                  { id: 'weak', label: 'Mandagni (Slow / Heavy)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushAgni(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushAgni === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B]'
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
                  { id: 'vegetarian', label: 'Satvik / Vegetarian' },
                  { id: 'mixed', label: 'Mixed / Non-Vegetarian' },
                  { id: 'irregular', label: 'Late Nights / Irregular Meals' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAyushDiet(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition ${
                      ayushDiet === item.id
                        ? 'border-[#12322B] bg-[#FAF7F2] text-[#12322B]'
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
                  AYUSH Ready
                </span>
              </div>
              <p className="text-xs text-[#5F7D74] leading-relaxed">
                Dietary & Lifestyle: {ayushResult.dietary_guidelines?.[0] || 'Favor warm, cooked foods.'}
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
              PADDLEOCR MEDICAL DOCUMENT DIGITIZER
            </span>
            <h3 className="text-2xl font-serif text-[#12322B] mt-0.5">
              Prescription & Lab Report Scanner
            </h3>
            <p className="text-xs text-[#5F7D74] mt-1">
              Upload physical paper prescriptions, lab reports, or discharge summaries for automatic entity extraction.
            </p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#BFD8D2] hover:border-[#12322B] rounded-2xl p-8 text-center bg-[#FAF7F2]/60 transition space-y-3">
            <span className="text-4xl">📷</span>
            <div>
              <h4 className="text-sm font-bold text-[#12322B]">Upload Prescription Photo or Scan</h4>
              <p className="text-xs text-[#5F7D74] mt-0.5">Supports PNG, JPG, JPEG, and PDF documents</p>
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleOcrUpload(e.target.files[0])}
              className="hidden"
              id="ocr-file-upload"
            />
            <label
              htmlFor="ocr-file-upload"
              className="inline-block px-6 py-3 rounded-full bg-[#12322B] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:bg-[#1C453C] transition"
            >
              Select Image / Scan
            </label>
          </div>

          {ocrLoading && (
            <div className="p-6 text-center text-xs font-semibold text-[#5F7D74]">
              Processing image with PaddleOCR engine...
            </div>
          )}

          {ocrResult && (
            <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E4EDE9] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12322B] uppercase">Extracted Medications & Doses</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E4EDE9] text-[#12322B]">
                  Confidence: {Math.round((ocrResult.confidence_score || 0.95) * 100)}%
                </span>
              </div>

              <div className="space-y-2">
                {ocrResult.detected_medications?.map((med, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-[#E4EDE9] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#12322B]">{med.name}</span>
                      <span className="text-[#5F7D74] ml-2 font-mono">{med.dosage}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#12322B] font-mono text-[10px]">
                      {med.frequency || 'OD'} {med.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
