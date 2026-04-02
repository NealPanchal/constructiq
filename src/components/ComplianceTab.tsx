'use client'

import { useState, useEffect } from 'react'

interface Violation {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface ComplianceCheck {
  id: string;
  result: 'pass' | 'fail';
  inputData: any;
  violations: Violation[];
  createdAt: string;
}

export default function ComplianceTab({ projectId }: { projectId: string }) {
  const [plotSize, setPlotSize] = useState('1000')
  const [floors, setFloors] = useState('3')
  const [height, setHeight] = useState('15')
  const [city, setCity] = useState('Mumbai')
  const [history, setHistory] = useState<ComplianceCheck[]>([])
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<ComplianceCheck | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [projectId])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/compliance/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          plotSize,
          floors,
          buildingHeight: height,
          city
        })
      })

      if (response.ok) {
        const data = await response.json()
        setLastCheck(data.check)
        fetchHistory() // Refresh the list
      }
    } catch (err) {
      console.error('Check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-12">
      
      {/* 1. Input Form Section */}
      <section className="bg-white border-4 border-black p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-2">
           <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
           Compliance Validator
        </h2>
        
        <form onSubmit={handleCheck} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plot Size (sq.m)</label>
            <input 
              type="number" 
              value={plotSize} 
              onChange={(e) => setPlotSize(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black p-3 rounded-xl font-bold focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Floors</label>
            <input 
              type="number" 
              value={floors} 
              onChange={(e) => setFloors(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black p-3 rounded-xl font-bold focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Height (m)</label>
            <input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black p-3 rounded-xl font-bold focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Region</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-gray-50 border-2 border-black p-3 rounded-xl font-bold focus:bg-white focus:outline-none transition-colors"
            >
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
          
          <div className="md:col-span-2 lg:col-span-4 mt-4">
             <button 
               disabled={checking}
               className="w-full py-4 bg-black text-white font-black uppercase italic rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
             >
               {checking ? 'Evaluating Protocols...' : 'Run Compliance Scan ⚡'}
             </button>
          </div>
        </form>
      </section>

      {/* 2. Instant Result Section */}
      {lastCheck && (
        <section className={`p-8 border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${lastCheck.result === 'pass' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black uppercase italic tracking-tighter">Scan Analysis: {lastCheck.result}</h3>
             <span className={`px-4 py-1 rounded-full font-black uppercase text-xs border-2 border-black ${lastCheck.result === 'pass' ? 'bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                {lastCheck.result === 'pass' ? 'PROTOCOLS CLEAR' : 'VIOLATION DETECTED'}
             </span>
          </div>

          {lastCheck.violations.length > 0 ? (
            <div className="space-y-4">
               {lastCheck.violations.map((v) => (
                 <div key={v.id} className="flex gap-4 p-4 bg-white border-2 border-black rounded-2xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${v.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                       {v.severity === 'critical' ? '!' : '?'}
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{v.severity}</p>
                       <p className="font-bold">{v.message}</p>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-center py-8 font-bold italic">Building parameters are within local regulatory bounds.</p>
          )}
        </section>
      )}

      {/* 3. History Feed */}
      <section>
        <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
           <span className="w-2 h-2 bg-black rounded-full"></span>
           Validation History
        </h2>
        <div className="space-y-6">
          {history.length > 0 ? (
            history.map((check) => (
              <div key={check.id} className="bg-white border-2 border-black p-6 rounded-2xl flex justify-between items-center">
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{new Date(check.createdAt).toLocaleString()}</p>
                    <h4 className="font-bold mt-1">Scan for {check.inputData.city} — {check.inputData.buildingHeight}m Height</h4>
                 </div>
                 <span className={`px-4 py-1 rounded-full font-black uppercase text-[10px] border-2 border-black ${check.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {check.result}
                 </span>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
               <p className="text-gray-400 font-bold uppercase italic">No history available.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
