import React, { useState } from 'react'

export default function TeleConsultationWidget() {
  const [specialization, setSpecialization] = useState('General Medicine')
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Ananya Roy')
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM Today')
  const [patientName, setPatientName] = useState('')
  const [bookedToken, setBookedToken] = useState(null)

  const doctors = {
    'General Medicine': [
      { name: 'Dr. Ananya Roy', qualification: 'MBBS, MD (Internal Medicine)', rating: '4.9 ★', exp: '12 yrs' },
      { name: 'Dr. Vikram Sethi', qualification: 'MBBS, DNB', rating: '4.8 ★', exp: '9 yrs' },
    ],
    'Cardiology': [
      { name: 'Dr. Rajesh Sharma', qualification: 'DM (Cardiology), FACC', rating: '5.0 ★', exp: '18 yrs' },
    ],
    'Pediatrics': [
      { name: 'Dr. Sunita Rao', qualification: 'MD (Pediatrics)', rating: '4.9 ★', exp: '14 yrs' },
    ],
    'AYUSH Integrative': [
      { name: 'Vaidya Ramesh Shastri', qualification: 'BAMS, MD (Ayurveda)', rating: '4.9 ★', exp: '15 yrs' },
    ],
  }

  const slots = ['10:30 AM Today', '11:15 AM Today', '02:00 PM Today', '04:30 PM Today']

  const handleBookAppointment = (e) => {
    e.preventDefault()
    const token = 'AL-' + Math.floor(100000 + Math.random() * 900000)
    setBookedToken({
      token,
      doctor: selectedDoctor,
      specialization,
      slot: selectedSlot,
      patient: patientName || 'Aarav Sharma',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  return (
    <section id="teleconsult" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-sky-200 bg-white/90 shadow-lg relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Column: Descriptions */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-bold uppercase tracking-wider">
              Tele-Consultation & Appointment Booking
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Connect Remote Patients with Specialist Doctors Instantly
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Patients at rural kiosks or on mobile devices can generate a digital consultation token, select their preferred clinical department, and share pre-intake symptom records directly with verifying doctors.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <span>Automated Symptom Pre-Intake attached to booking token</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <span>Integrative AYUSH and Allopathic specialty routing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                <span>Instant QR-code digital prescription dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget Form */}
          <div className="bg-sky-50/60 p-6 sm:p-8 rounded-2xl border border-sky-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Book Doctor Consultation</h3>
                <p className="text-xs text-slate-500">Select department, doctor, and slot</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-sky-200 text-sky-800 rounded-full border border-sky-300">
                Live Interactive Widget
              </span>
            </div>

            {!bookedToken ? (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Department
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(doctors).map((dept) => (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => {
                          setSpecialization(dept)
                          setSelectedDoctor(doctors[dept][0].name)
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                          specialization === dept
                            ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                            : 'bg-white border-sky-200 text-slate-700 hover:border-sky-300'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Select Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 text-slate-800 text-sm outline-none focus:border-sky-500 font-medium shadow-sm"
                  >
                    {doctors[specialization].map((doc) => (
                      <option key={doc.name} value={doc.name}>
                        {doc.name} — {doc.qualification} ({doc.rating})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slot Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Consultation Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-xl text-xs text-center font-semibold border transition ${
                          selectedSlot === slot
                            ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                            : 'bg-white border-sky-200 text-slate-700 hover:border-sky-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-200 text-slate-800 text-sm outline-none focus:border-sky-500 font-medium shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition"
                >
                  Generate Tele-Consultation Token →
                </button>
              </form>
            ) : (
              <div className="bg-white border border-sky-300 p-6 rounded-2xl space-y-4 text-center shadow-md">
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest block">
                    Digital Token Created
                  </span>
                  <h4 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{bookedToken.token}</h4>
                </div>

                <div className="bg-sky-50 p-4 rounded-xl text-left text-xs space-y-2 border border-sky-200">
                  <p><strong className="text-slate-600">Doctor:</strong> <span className="text-slate-900 font-semibold">{bookedToken.doctor}</span></p>
                  <p><strong className="text-slate-600">Department:</strong> <span className="text-slate-900 font-semibold">{bookedToken.specialization}</span></p>
                  <p><strong className="text-slate-600">Patient:</strong> <span className="text-slate-900 font-semibold">{bookedToken.patient}</span></p>
                  <p><strong className="text-slate-600">Slot:</strong> <span className="text-sky-700 font-bold">{bookedToken.slot}</span></p>
                </div>

                <button
                  onClick={() => setBookedToken(null)}
                  className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl text-xs font-bold transition"
                >
                  Book Another Appointment
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  )
}
