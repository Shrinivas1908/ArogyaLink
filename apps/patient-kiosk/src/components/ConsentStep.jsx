import React from 'react'
import { t } from '../lib/i18n'

export default function ConsentStep({ lang, onConsent }) {
  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-[32px] p-8 sm:p-10 border border-[#E4EDE9] shadow-xl space-y-6 text-center">
      <div className="w-12 h-12 bg-[#BFD8D2] text-[#12322B] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
        🔒
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F7D74]">
          STEP 03 OF 04
        </span>
        <h2 className="text-2xl font-serif text-[#12322B] mt-0.5">
          {t('digital_consent', lang)}
        </h2>
        <p className="text-xs text-[#5F7D74] max-w-md mx-auto mt-1">
          {t('consent_desc', lang)}
        </p>
      </div>

      <div className="p-5 bg-[#FAF7F2] border border-[#E4EDE9] rounded-2xl text-xs text-[#12322B] text-left space-y-2.5">
        <p>{t('consent_bullet1', lang)}</p>
        <p>{t('consent_bullet2', lang)}</p>
        <p>{t('consent_bullet3', lang)}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onConsent(false)}
          className="flex-1 py-3.5 rounded-full border border-[#E4EDE9] text-[#5F7D74] hover:bg-[#FAF7F2] font-bold text-xs tracking-wider uppercase transition"
        >
          {t('decline', lang)}
        </button>
        <button
          id="consent-accept-btn"
          onClick={() => onConsent(true)}
          className="flex-1 py-3.5 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs tracking-wider uppercase shadow-md transition"
        >
          {t('accept_begin', lang)}
        </button>
      </div>
    </div>
  )
}
