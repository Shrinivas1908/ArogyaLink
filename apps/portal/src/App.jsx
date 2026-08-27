import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import RoleShowcase from './components/RoleShowcase'
import TeleConsultationWidget from './components/TeleConsultationWidget'
import SymptomTriageWidget from './components/SymptomTriageWidget'
import HealthPassWidget from './components/HealthPassWidget'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-sky-50/50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Header />
      <main className="flex-1 space-y-12">
        <Hero />
        <RoleShowcase />
        <TeleConsultationWidget />
        <SymptomTriageWidget />
        <HealthPassWidget />
      </main>
      <Footer />
    </div>
  )
}
