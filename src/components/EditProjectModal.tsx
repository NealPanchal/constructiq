'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, Loader2, Ruler, Building2, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function EditProjectModal({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    location: project.location || '',
    city: project.city || 'Chennai',
    plotArea: project.plotArea?.toString() || '',
    builtUpArea: project.builtUpArea?.toString() || '',
    type: project.type?.toLowerCase() || 'residential'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Synchronizing Engineering Telemetry...')

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Protocol Recalibration Successful', { id: toastId })
        setIsOpen(false)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Protocol Failure: Could not recalibrate.', { id: toastId })
      }
    } catch (error) {
      toast.error('Network Breach: Recalibration Aborted', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-4 bg-white border-4 border-black text-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        <Zap className="w-5 h-5 fill-current" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-6 text-black">
      <div className="bg-white border-8 border-black rounded-[64px] p-12 w-full max-w-xl shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-12 right-12 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="mb-12">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">Recalibrate Protocol</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Phase: Re-Configuration • Project: {project.id}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-4 border-black rounded-2xl font-bold text-lg focus:bg-white transition-colors"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Plot Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={formData.plotArea}
                  onChange={e => setFormData({ ...formData, plotArea: e.target.value })}
                  className="w-full px-6 py-4 border-4 border-black rounded-2xl font-bold"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Built-Up (Sq.Ft)</label>
                <input
                  type="number"
                  value={formData.builtUpArea}
                  onChange={e => setFormData({ ...formData, builtUpArea: e.target.value })}
                  className="w-full px-6 py-4 border-4 border-black rounded-2xl font-bold"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-8 py-5 border-4 border-black rounded-2xl font-black uppercase text-[10px] hover:bg-gray-50 transition-all font-mono"
              disabled={loading}
            >
              Abort
            </button>
            <button
              type="submit"
              className="flex-2 bg-black text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 border-4 border-black"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
