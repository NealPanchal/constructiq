'use client'

import { useState } from 'react'

export default function FileUpload({ projectId, onUploadSuccess }: { projectId: string, onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    
    // In a real environment, we would use UploadThing or Supabase Storage.
    // Here we simulate the metadata registration in Prisma.
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: file.name,
          url: `https://mock-storage.constructiq.io/${file.name}`,
          type: file.name.split('.').pop()?.toUpperCase() || 'RAW'
        })
      })

      if (response.ok) {
        setFile(null)
        onUploadSuccess()
      }
    } catch (err) {
      console.error('Simulated upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="relative group border-4 border-dashed border-gray-200 p-8 rounded-3xl hover:border-black transition-all bg-gray-50 flex flex-col items-center justify-center text-center">
        <label className="cursor-pointer">
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="space-y-2">
            <span className="text-3xl">📁</span>
            <p className="text-xs font-black uppercase text-gray-400 group-hover:text-black">
              {file ? file.name : 'Select Archive Package'}
            </p>
          </div>
        </label>
      </div>
      
      {file && (
        <button 
          disabled={uploading}
          className="w-full py-4 bg-blue-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all border-2 border-black"
        >
          {uploading ? 'Registering Assets...' : 'Initialize Asset Upload ⚡'}
        </button>
      )}
    </form>
  )
}
