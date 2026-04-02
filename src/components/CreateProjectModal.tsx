'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, Loader2, Ruler, Building2, MapPin } from 'lucide-react'

export default function CreateProjectModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: 'Chennai',
    plotArea: '',
    builtUpArea: '',
    type: 'residential'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Strict Engineering Validation
    if (!formData.name.trim() || !formData.location.trim() || !formData.plotArea || !formData.builtUpArea) {
      setError('Operational requirement: [Name, Location, Plot, Built-up] are mandatory.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setIsOpen(false)
        setFormData({ name: '', location: '', city: 'Chennai', plotArea: '', builtUpArea: '', type: 'residential' })
        router.refresh()
        router.push(`/projects/${data.project.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Protocol Failure: Could not initiate project.')
      }
    } catch (error) {
      setError('Network Integrity Breach: Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto px-8 py-5 bg-black text-white font-black uppercase text-[10px] rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all border-2 border-black flex items-center gap-2"
      >
        Initiate New Phase <Zap className="w-3 h-3 fill-current" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
      <div className="bg-white border-4 border-black rounded-[40px] p-10 w-full max-w-xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">Internal Phase Initialization</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic font-mono">Status: Awaiting Engineering Telemetry • Commander: {userId.slice(0,8)}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                Project Handle
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-4 border-black rounded-2xl focus:outline-none focus:ring-0 focus:bg-white transition-colors font-bold text-lg"
                placeholder="SKYLINE RESIDENTIAL..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-6 py-3 bg-gray-50 border-2 border-black rounded-xl focus:bg-white transition-all font-bold"
                  placeholder="Gachibowli..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">City Jurisdiction</label>
                <select 
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-6 py-3 bg-gray-50 border-2 border-black rounded-xl transition-all font-black uppercase text-xs"
                >
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>
            </div>

            {/* Engineering Dimensions */}
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-black border-dashed space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black">Engineering Telemetry (Sq.Ft)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Plot Area</label>
                  <input
                    type="number"
                    value={formData.plotArea}
                    onChange={e => setFormData({ ...formData, plotArea: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold bg-white"
                    placeholder="2400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Built-up Area</label>
                  <input
                    type="number"
                    value={formData.builtUpArea}
                    onChange={e => setFormData({ ...formData, builtUpArea: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-xl font-bold bg-white"
                    placeholder="4800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Sector Class</label>
              <div className="grid grid-cols-2 gap-4">
                {['residential', 'commercial'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`px-6 py-4 border-2 border-black rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${
                      formData.type === t 
                        ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] translate-y-[-2px]' 
                        : 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]'
                    }`}
                  >
                    {t === 'residential' ? <Building2 className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-4 border-black p-4 rounded-2xl text-red-600 text-[10px] font-black uppercase italic flex items-center gap-3">
               <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center not-italic">!</div>
               {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-8 py-5 border-4 border-black rounded-2xl font-black uppercase text-[10px] hover:bg-gray-50 transition-all font-mono"
              disabled={loading}
            >
              Abort Phase
            </button>
            <button
              type="submit"
              className="flex-3 bg-black text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 border-4 border-black group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Establishing Link...
                </>
              ) : (
                <>
                  Commit Protocol <Zap className="w-3 h-3 fill-current group-hover:text-yellow-400" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
