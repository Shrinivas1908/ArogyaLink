export default function Footer() {
  return (
    <footer className="border-t border-sky-200 bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-600">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
            AL
          </div>
          <div>
            <p className="font-bold text-slate-900">ArogyaLink Platform</p>
            <p className="text-xs text-slate-500">Smart Patient Intake & Doctor Clinical Review · SIH 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-sky-600 transition">FastAPI Swagger Docs</a>
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="hover:text-sky-600 transition">Patient Kiosk (5173)</a>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="hover:text-sky-600 transition">Doctor Dashboard (5174)</a>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Built with React 19, FastAPI, PostgreSQL, Supabase & Gemini
        </div>
      </div>
    </footer>
  )
}
