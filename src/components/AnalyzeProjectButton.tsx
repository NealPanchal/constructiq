'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AnalyzeProjectButtonProps {
  projectId: string
}

export default function AnalyzeProjectButton({ projectId }: AnalyzeProjectButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    setLoading(true)
    const toastId = toast.loading('Initiating AI Strategic Analysis...')

    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Strategic Reasoning Persistent Layer Updated', { id: toastId })
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Intelligence Protocol Failure', { id: toastId })
      }
    } catch (error) {
      toast.error('Network Integrity Breach: Protocol Aborted', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className={`group flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest italic rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:grayscale border-2 border-black`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Play className="w-3 h-3 fill-current group-hover:scale-125 transition-transform" />
      )}
      {loading ? 'CALIBRATING...' : 'RUN STRATEGIC ANALYSIS'}
    </button>
  )
}
