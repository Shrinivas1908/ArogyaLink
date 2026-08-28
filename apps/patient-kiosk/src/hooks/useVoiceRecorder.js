/**
 * ArogyaLink — hooks/useVoiceRecorder.js
 * ========================================
 * Real browser voice recording using the Web Speech API (SpeechRecognition).
 * Works natively in Chrome & Edge — no API key required.
 * Designed so a real Bhashini / Google STT API can be swapped in later.
 *
 * Usage:
 *   const { isListening, transcript, error, startListening, stopListening, isSupported } =
 *     useVoiceRecorder({ lang: 'hi-IN', onResult: (text) => setTextInput(text) })
 */

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * @param {object} opts
 * @param {string}   opts.lang        BCP-47 speech code e.g. 'hi-IN', 'bn-IN'
 * @param {function} opts.onResult    Called with the final transcript string
 * @param {function} [opts.onError]   Called with an error message string
 */
export function useVoiceRecorder({ lang = 'en-IN', onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  // Check support once on mount
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'SpeechRecognition is not supported in this browser.'
      setError(msg)
      if (onError) onError(msg)
      return
    }

    // Abort any existing session
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false        // stop after first phrase
    recognition.interimResults = true     // show live text while speaking
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      // Show interim live, commit final
      setTranscript(final || interim)
      if (final && onResult) {
        onResult(final.trim())
      }
    }

    recognition.onerror = (event) => {
      let msg = 'Voice recognition error.'
      switch (event.error) {
        case 'not-allowed':
          msg = 'Microphone permission denied. Please allow microphone access.'
          break
        case 'no-speech':
          msg = 'No speech detected. Please speak clearly into the microphone.'
          break
        case 'network':
          msg = 'Network error during voice recognition. Check your connection.'
          break
        case 'audio-capture':
          msg = 'No microphone found. Please connect a microphone.'
          break
        default:
          msg = `Voice error: ${event.error}`
      }
      setError(msg)
      setIsListening(false)
      if (onError) onError(msg)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, lang, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  }
}
