'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, FilePlus, Zap, CreditCard, Download, Loader2 } from 'lucide-react'
import FileUpload from './FileUpload'

export default function ApprovalWizard({ projectId }: { projectId: string }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending')

  const runAIAnalysis = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const data = await resp.json()
      setAnalysis(data)
      setStep(3)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    // Simulate Razorpay Checkout
    setTimeout(() => {
      setPaymentStatus('success')
      setLoading(false)
      setStep(4)
    }, 2000)
  }

  const downloadPDF = async () => {
    window.open(`/api/approvals/generate?projectId=${projectId}`, '_blank')
  }

  return (
    <div className="bg-white border-4 border-black rounded-[48px] p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      {/* 🚀 Stepper Component */}
      <div className="flex justify-between items-center mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center font-black z-10 transition-all ${
              step >= s ? 'bg-black text-white' : 'bg-white text-gray-300'
            }`}
          >
            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      {/* 🧩 Step 1: Project Intel Verification */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">Step 1: Intelligence Verification</h3>
          <p className="text-gray-400 font-bold text-sm leading-relaxed">
            Ensure project metadata (Classification: COMMERCIAL / Sector: CHENNAI) is accurate before initiating municipal protocol. 
          </p>
          <button 
            onClick={() => setStep(2)}
            className="px-8 py-4 bg-black text-white font-black uppercase text-xs rounded-2xl border-4 border-black hover:bg-blue-600 transition-all"
          >
            Confirm Project Intel →
          </button>
        </div>
      )}

      {/* 📄 Step 2: Digital Asset Repository */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
             Step 2: Upload Digital Assets <FilePlus className="w-8 h-8" />
          </h3>
          <p className="text-gray-400 font-bold text-sm">Required: Structural Blueprint (PDF) & Fire NOC.</p>
          <FileUpload projectId={projectId} onUploadSuccess={() => {}} />
          <div className="pt-8 border-t-2 border-dashed border-gray-100 flex gap-4">
             <button 
                onClick={() => setStep(1)}
                className="px-8 py-4 border-4 border-black font-black uppercase text-xs rounded-2xl hover:bg-gray-50 transition-all"
             >
                Back
             </button>
             <button 
                onClick={runAIAnalysis}
                className="flex-1 px-8 py-4 bg-black text-white font-black uppercase text-xs rounded-2xl border-4 border-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                disabled={loading}
             >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Initiate AI Compliance Scan
             </button>
          </div>
        </div>
      )}

      {/* 🧠 Step 3: AI Integrity Brief */}
      {step === 3 && analysis && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">Step 3: AI Integrity Brief</h3>
          <div className="bg-gray-50 border-4 border-black p-8 rounded-[32px] flex items-center gap-8">
            <div className="w-24 h-24 border-8 border-black rounded-full flex items-center justify-center text-3xl font-black italic">
               {analysis.complianceScore}%
            </div>
            <p className="flex-1 font-bold italic text-sm text-gray-600 leading-relaxed">
               "{analysis.aiSummary}"
            </p>
          </div>
          
          <div className="space-y-4">
             {analysis.risks.map((r: string, index: number) => (
                <div key={index} className="flex gap-4 items-start bg-red-50 p-4 border-2 border-red-600 rounded-2xl text-red-600 font-bold text-xs italic">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   {r}
                </div>
             ))}
          </div>

          <div className="pt-8 border-t-2 border-dashed border-gray-100 flex gap-4">
             <button 
                onClick={() => setStep(2)}
                className="px-8 py-4 border-4 border-black font-black uppercase text-xs rounded-2xl hover:bg-gray-50 transition-all"
             >
                Refine Assets
             </button>
             <button 
                onClick={handlePayment}
                className="flex-1 px-8 py-4 bg-blue-600 text-white font-black uppercase text-xs rounded-2xl border-4 border-black hover:bg-black transition-all flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                disabled={loading}
             >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pay ₹999 & Generate Permit
             </button>
          </div>
        </div>
      )}

      {/* ✨ Step 4: Final Asset Generation */}
      {step === 4 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center py-12">
          <div className="w-24 h-24 bg-green-100 text-green-600 border-4 border-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
             <CheckCircle className="w-12 h-12" />
          </div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter">Protocol Finalized</h3>
          <p className="text-gray-400 font-bold text-sm max-w-sm mx-auto">
             Compliance permit has been generated successfully and archived in the asset repository.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
             <button 
                onClick={downloadPDF}
                className="px-12 py-5 bg-black text-white font-black uppercase text-xs rounded-2xl border-4 border-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
             >
                <Download className="w-5 h-5" />
                Download Permission PDF
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
