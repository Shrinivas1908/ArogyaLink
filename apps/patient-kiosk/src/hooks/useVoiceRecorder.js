/**
 * ArogyaSetu — hooks/useVoiceRecorder.js
 * ========================================
 * Real browser voice recording using the Web Speech API (SpeechRecognition).
 * Supports 7 Indian languages with continuous audio streaming, live transcript,
 * and smart speech matching for clinical kiosk questions.
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export function useVoiceRecorder({ lang = 'en-IN', onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Microphone API not supported by this browser. Use Voice Presets below.'
      setError(msg)
      if (onError) onError(msg)
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {}
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      const recognition = new SpeechRecognition()
      recognition.lang = lang
      recognition.continuous = true
      recognition.interimResults = true
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
        const currentText = final || interim
        setTranscript(currentText)
        if (currentText && onResult) {
          onResult(currentText.trim())
        }
      }

      recognition.onerror = (event) => {
        let msg = 'Voice recognition error.'
        switch (event.error) {
          case 'not-allowed':
            msg = 'Microphone access blocked. Click Allow in browser address bar.'
            break
          case 'no-speech':
            msg = 'No voice detected. Please speak clearly into your mic.'
            break
          case 'network':
            msg = 'Network connection issue during voice processing.'
            break
          case 'audio-capture':
            msg = 'No microphone device found.'
            break
          default:
            msg = `Voice notice: ${event.error}`
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
    } catch (err) {
      setError('Could not start microphone: ' + err.message)
      setIsListening(false)
      if (onError) onError(err.message)
    }
  }, [isSupported, lang, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
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
