import { useState } from 'react'

export default function TeleConsultationWidget() {
  const [specialization, setSpecialization] = useState('General Medicine')
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Ananya Roy')
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM Today')
  const [patientName, setPatientName] = useState('')
  const [symptoms, setSymptoms] = useState(['Fever', 'Cough'])
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
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Column: Descriptions */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              Tele-Consultation & Appointment Booking
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Connect Remote Patients with Specialist Doctors Instantly
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Patients at rural kiosks or on mobile devices can generate a digital consultation token, select their preferred clinical department, and share pre-intake symptom records directly with verifying doctors.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">✓</div>
                <span>Automated Symptom Pre-Intake attached to booking token</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">✓</div>
                <span>Integrative AYUSH and Allopathic specialty routing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">✓</div>
                <span>Instant QR-code digital prescription dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget Form */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-700/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Book Doctor Consultation</h3>
                <p className="text-xs text-slate-400">Select department, doctor, and slot</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-900/60 text-teal-300 rounded-full border border-teal-700/50">
                Live Interactive Widget
              </span>
            </div>

            {!bookedToken ? (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
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
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${
                          specialization === dept
                            ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-semibold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Select Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm outline-none focus:border-teal-400"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Consultation Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-xl text-xs text-center border transition ${
                          selectedSlot === slot
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 font-semibold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm outline-none focus:border-teal-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition"
                >
                  Generate Tele-Consultation Token →
                </button>
              </form>
            ) : (
              <div className="bg-slate-900 border border-teal-500/40 p-6 rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-mono text-teal-400 uppercase tracking-widest block">
                    Digital Token Created
                  </span>
                  <h4 className="text-3xl font-extrabold text-white font-mono mt-1">{bookedToken.token}</h4>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-800">
                  <p><strong className="text-slate-400">Doctor:</strong> <span className="text-slate-200">{bookedToken.doctor}</span></p>
                  <p><strong className="text-slate-400">Department:</strong> <span className="text-slate-200">{bookedToken.specialization}</span></p>
                  <p><strong className="text-slate-400">Patient:</strong> <span className="text-slate-200">{bookedToken.patient}</span></p>
                  <p><strong className="text-slate-400">Slot:</strong> <span className="text-teal-300 font-semibold">{bookedToken.slot}</span></p>
                </div>

                <button
                  onClick={() => setBookedToken(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
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
