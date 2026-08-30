import React, { useState, useEffect, useRef } from 'react'

export default function VoiceHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('hi') // 'hi' | 'mr' | 'bn' | 'ta' | 'en'
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')
  const [conversation, setConversation] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [micError, setMicError] = useState('')

  const recognitionRef = useRef(null)

  const languages = [
    { code: 'hi', label: 'हिन्दी (Hindi)', speechCode: 'hi-IN', greeting: 'नमस्ते! मैं आरोग्यमित्र AI हूँ। आप अपने लक्षण बोलकर या लिखकर पूछ सकते हैं।' },
    { code: 'mr', label: 'मराठी (Marathi)', speechCode: 'mr-IN', greeting: 'नमस्कार! मी आरोग्यमित्र AI आहे. आपली तब्येत कशी आहे ते सांगा.' },
    { code: 'bn', label: 'বাংলা (Bengali)', speechCode: 'bn-IN', greeting: 'নমস্কার! আমি আরোগ্যমিত্র এআই। আপনার কি শারীরিক সমস্যা?' },
    { code: 'ta', label: 'தமிழ் (Tamil)', speechCode: 'ta-IN', greeting: 'வணக்கம்! நான் ஆரோக்கியமித்ரா AI. உங்கள் உடல்நலம் பற்றி கூறுங்கள்.' },
    { code: 'en', label: 'English', speechCode: 'en-IN', greeting: 'Hello! I am ArogyaMitra AI. You can speak or type your symptoms for clinical guidance.' },
  ]

  const currentLangMeta = languages.find((l) => l.code === selectedLanguage) || languages[0]

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = currentLangMeta.speechCode

      recognition.onstart = () => {
        setIsListening(true)
        setMicError('')
      }

      recognition.onresult = (event) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setInputText(currentTranscript)
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission blocked. Please allow mic in browser settings, or type below.')
        } else {
          setMicError(`Voice capture error (${event.error}). You can type your query below.`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setMicError('Live voice recognition not supported by browser. Please type below.')
    }
  }, [selectedLanguage, currentLangMeta.speechCode])

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setMicError('Microphone not available in this browser. Please type your query.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        setMicError('')
        recognitionRef.current.lang = currentLangMeta.speechCode
        recognitionRef.current.start()
      } catch (err) {
        console.error('Speech recognition start error:', err)
      }
    }
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    const query = inputText.trim()
    if (!query) return

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    // Add user message to conversation
    const userMsg = { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setConversation((prev) => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          language: selectedLanguage,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg = {
          role: 'assistant',
          text: data.reply,
          is_emergency: data.is_emergency,
          model: data.model_used,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setConversation((prev) => [...prev, aiMsg])
        speakText(data.reply)
      } else {
        throw new Error('API failed')
      }
    } catch {
      const fallbackAiMsg = {
        role: 'assistant',
        text: `⚠️ Based on your input ("${query}"), please visit your nearest Primary Health Centre (PHC) for a direct consultation and vitals check.`,
        is_emergency: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setConversation((prev) => [...prev, fallbackAiMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Preload high-definition voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    // Clean text of emojis and markdown so speech synthesizer pronounces clearly
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#~`]/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = currentLangMeta.speechCode
    utterance.rate = 0.88 // Comfortable, clear pacing
    utterance.pitch = 1.02 // Natural acoustic pitch
    utterance.volume = 1.0

    // Intelligent Neural / Natural Voice Selection
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      const targetLang = currentLangMeta.speechCode.toLowerCase()
      const baseLang = targetLang.split('-')[0]

      // Prioritize High-Quality Neural/Natural Indian Voices (Google / Microsoft Natural)
      const bestVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(baseLang) && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Online'))) ||
        voices.find((v) => v.lang.toLowerCase() === targetLang) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(baseLang)) ||
        voices.find((v) => v.name.includes('Google') || v.name.includes('Natural')) ||
        voices[0]

      if (bestVoice) {
        utterance.voice = bestVoice
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition active:scale-95 flex items-center gap-3 border-2 border-white"
          title="Open Real AI Voice & Triage Assistant"
        >
          <span className="text-xl">🎙️</span>
          <span className="text-xs font-bold hidden sm:inline">ArogyaMitra AI Assistant</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
        </button>
      </div>

      {/* Floating Chat & Voice Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ArogyaMitra · Real AI Assistant</h4>
                <p className="text-[10px] text-emerald-300">Live Voice & Clinical Triage</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isListening && recognitionRef.current) recognitionRef.current.stop()
                if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                setIsOpen(false)
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Language Selector */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-600">भाषा (Language):</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                setConversation([])
              }}
              className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-none shadow-sm"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mic Status / Error Warning */}
          {micError && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800 font-medium">
              ⚠️ {micError}
            </div>
          )}

          {/* Conversation Body */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-[220px] max-h-[360px] text-xs">
            {/* Default Greeting */}
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                ArogyaMitra AI:
              </span>
              <p className="leading-relaxed font-medium">{currentLangMeta.greeting}</p>
            </div>

            {/* Render Real Conversation Messages */}
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl space-y-1 animate-fadeIn ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white ml-8 text-right'
                    : msg.is_emergency
                    ? 'bg-red-50 text-red-950 border border-red-200 mr-4'
                    : 'bg-teal-50 text-teal-950 border border-teal-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold opacity-75">
                    {msg.role === 'user' ? 'You (Real Speech / Input)' : 'ArogyaMitra AI Clinical Advice'}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="font-bold underline text-emerald-700 hover:text-emerald-900 ml-2"
                    >
                      🔊 Listen
                    </button>
                  )}
                </div>

                <p className="leading-relaxed font-sans text-xs">{msg.text}</p>
                <span className="text-[9px] opacity-60 block mt-1">{msg.time}</span>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 mr-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="text-xs font-semibold">AI is analyzing symptoms...</span>
              </div>
            )}
          </div>

          {/* Real Speech & Text Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
            {isListening && (
              <div className="flex items-center justify-between bg-red-100 px-3 py-1.5 rounded-xl text-red-800 text-[11px] font-bold animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Listening to your microphone in {currentLangMeta.label}... Speak now!
                </span>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px]"
                >
                  Stop
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl transition shadow-sm flex items-center justify-center ${
                  isListening
                    ? 'bg-red-600 text-white animate-bounce'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Start speaking (Real Mic)'}
              >
                <span className="text-base">🎙️</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Speak or type symptoms in ${currentLangMeta.label}...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-40 transition active:scale-95"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
