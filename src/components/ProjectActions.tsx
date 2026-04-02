'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit3, Loader2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import EditProjectModal from './EditProjectModal'

interface ProjectActionsProps {
  project: any
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const toastId = toast.loading('Decommissioning Project Protocol...')

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Project Protocol Terminated', { id: toastId })
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error('Termination Failure: Restricted Access', { id: toastId })
      }
    } catch (error) {
      toast.error('Network Breach: Termination Aborted', { id: toastId })
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="flex gap-4">
      {/* 1. RECALIBRATE PROTOCOL */}
      <EditProjectModal project={project} />

      {/* 2. DECOMMISSION PROTOCOL */}
      <button 
        onClick={() => setShowConfirm(true)}
        className="p-4 bg-white border-4 border-black text-red-600 rounded-2xl shadow-[6px_6px_0px_0px_rgba(255,0,0,0.1)] hover:bg-red-600 hover:text-white transition-all group"
      >
        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-6">
           <div className="bg-white border-8 border-black p-12 rounded-[64px] max-w-md w-full shadow-[32px_32px_0px_0px_rgba(0,0,0,0.4)] animate-in zoom-in fade-in duration-200">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-8 mx-auto border-4 border-black rotate-12">
                 <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black uppercase italic text-center tracking-tighter mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 font-bold text-sm text-center mb-10 leading-relaxed">
                 You are about to permanently decommission Protocol <span className="text-black">{project.name}</span>. This operational layer is irreversible.
              </p>
              
              <div className="flex gap-6">
                 <button 
                   onClick={() => setShowConfirm(false)}
                   className="flex-1 px-8 py-4 border-4 border-black rounded-2xl font-black uppercase text-[10px] hover:bg-gray-50 transition-all font-mono"
                   disabled={isDeleting}
                 >
                   Abort
                 </button>
                 <button 
                   onClick={handleDelete}
                   className="flex-1 px-8 py-4 bg-red-600 text-white border-4 border-black rounded-2xl font-black uppercase text-[10px] hover:bg-black transition-all shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                   disabled={isDeleting}
                 >
                   {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
