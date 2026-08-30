import React, { useState } from 'react'

export default function VoiceHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('hi') // 'en' | 'hi' | 'mr' | 'bn' | 'ta'
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [assistantReply, setAssistantReply] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const languages = [
    { code: 'hi', label: 'हिन्दी (Hindi)', greeting: 'नमस्ते! मैं आरोग्यमित्र AI हूँ। आप अपने लक्षण बोलकर बता सकते हैं।' },
    { code: 'mr', label: 'मराठी (Marathi)', greeting: 'नमस्कार! मी आरोग्यमित्र AI आहे. आपली तब्येत कशी आहे ते सांगा.' },
    { code: 'bn', label: 'বাংলা (Bengali)', greeting: 'নমস্কার! আমি আরোগ্যমিত্র এআই। আপনার কি শারীরিক সমস্যা?' },
    { code: 'ta', label: 'தமிழ் (Tamil)', greeting: 'வணக்கம்! நான் ஆரோக்கியமித்ரா AI. உங்கள் உடல்நலம் பற்றி கூறுங்கள்.' },
    { code: 'en', label: 'English', greeting: 'Hello! I am ArogyaMitra AI. Tell me about your symptoms or medical questions.' },
  ]

  const currentLangMeta = languages.find((l) => l.code === selectedLanguage) || languages[0]

  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true)
      setTranscript(selectedLanguage === 'hi' ? 'मुझे 3 दिन से बुखार और सीने में भारीपन है...' : 'I have high fever and chest discomfort for 3 days...')
      setTimeout(() => {
        setIsListening(false)
        if (selectedLanguage === 'hi') {
          setAssistantReply('⚠️ आपके लक्षणों के अनुसार, कृपया नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से ईसीजी और बुखार की जांच तुरंत कराएं। आपातकाल के लिए 108 डायल करें।')
        } else if (selectedLanguage === 'mr') {
          setAssistantReply('⚠️ आपल्या लक्षणांनुसार, कृपया त्वरित जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) जाऊन तपासणी करून घ्या.')
        } else {
          setAssistantReply('⚠️ Based on your reported symptoms of chest discomfort and fever, please visit your nearest Primary Health Centre (PHC) for an ECG and vitals evaluation.')
        }
      }, 2500)
    } else {
      setIsListening(false)
    }
  }

  const handleSpeakAudio = () => {
    setIsSpeaking(true)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(assistantReply || currentLangMeta.greeting)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsSpeaking(false), 2000)
    }
  }

  return (
    <>
      {/* Floating AI Voice Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition active:scale-95 flex items-center gap-3 border-2 border-white"
          title="Open Multilingual AI Health Assistant"
        >
          <span className="text-xl">🎙️</span>
          <span className="text-xs font-bold hidden sm:inline">ArogyaMitra AI Assistant</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
        </button>
      </div>

      {/* Floating Chat & Voice Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ArogyaMitra · Bhashini AI</h4>
                <p className="text-[10px] text-emerald-300">National Health Language Model</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Language Selector */}
          <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-500">भाषा (Language):</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                setTranscript('')
                setAssistantReply('')
              }}
              className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conversation Body */}
          <div className="p-4 space-y-3 min-h-[180px] max-h-[280px] overflow-y-auto text-xs">
            {/* Assistant Greeting */}
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                ArogyaMitra AI:
              </span>
              <p className="leading-relaxed font-medium">{currentLangMeta.greeting}</p>
            </div>

            {/* Patient Speech Transcript */}
            {transcript && (
              <div className="p-3 rounded-2xl bg-slate-900 text-white text-right space-y-1 ml-6 animate-fadeIn">
                <span className="text-[10px] text-slate-400 font-semibold block">You (Voice Input):</span>
                <p className="leading-relaxed font-sans">{transcript}</p>
              </div>
            )}

            {/* AI Clinical Navigation Response */}
            {assistantReply && (
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Clinical Guidance:
                  </span>
                  <button
                    onClick={handleSpeakAudio}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200"
                  >
                    {isSpeaking ? '🔊 Speaking...' : '🔊 Read Out Aloud'}
                  </button>
                </div>
                <p className="leading-relaxed font-semibold">{assistantReply}</p>
              </div>
            )}
          </div>

          {/* Voice Input & Controls Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={handleToggleVoice}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <span>{isListening ? '🛑 Recording Voice...' : '🎙️ Speak Symptoms (बोलें)'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
