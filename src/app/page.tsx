import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Zap, BarChart3, ChevronRight, Lock } from 'lucide-react'

export default function LandingPage() {
  const { userId } = auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans antialiased overflow-hidden selection:bg-black selection:text-white">
      {/* 🔮 Hero Section */}
      <nav className="flex items-center justify-between px-12 py-8 border-b border-gray-100 backdrop-blur-md bg-white/80 sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-sm font-black italic shadow-lg">IQ</div>
           <span className="text-xl font-black uppercase tracking-tighter italic">ConstructIQ</span>
        </div>
        <div className="flex gap-8 items-center">
           <Link href="/sign-in" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors">Commander Login</Link>
           <Link href="/sign-up" className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">Initialize Phase 1</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-12 pt-32 pb-64 relative">
        <div className="max-w-4xl space-y-12 relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Zap className="w-3 h-3 fill-current" />
              Intelligence Layer Phase 5 Active
           </div>
           
           <h1 className="text-[120px] font-black tracking-tighter leading-[0.8] uppercase italic animate-in fade-in slide-in-from-left-4 duration-700">
             Build <br /> <span className="text-gray-200">Without</span> <br /> Friction.
           </h1>

           <p className="text-2xl font-medium text-gray-500 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
             ConstructIQ is the production-grade AI layer for construction intelligence. Automate municipal approvals, monitor project integrity, and streamline multi-sector collaboration.
           </p>

           <div className="flex gap-6 pt-8 animate-in fade-in zoom-in duration-1000 delay-300">
              <Link href="/sign-up" className="px-12 py-6 bg-black text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-blue-600 transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-4px] hover:translate-y-0 flex items-center gap-3">
                 Start Command <ChevronRight className="w-5 h-5" />
              </Link>
              <div className="px-12 py-6 border-4 border-black text-black text-sm font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-gray-50 transition-all flex items-center gap-3">
                 View Documentation <BarChart3 className="w-5 h-5" />
              </div>
           </div>
        </div>

        {/* 📐 Abstract Geometric Background */}
        <div className="absolute top-0 right-0 w-[800px] h-full overflow-hidden opacity-10 -z-0 select-none pointer-events-none">
           <div className="absolute top-0 right-0 w-full h-[200%] border-[20px] border-black rounded-full rotate-[15deg] translate-x-1/2 -translate-y-1/4"></div>
           <div className="absolute top-[20%] right-0 w-full h-[150%] border-[4px] border-dashed border-black rounded-full rotate-[-10deg] translate-x-1/3"></div>
        </div>
      </main>

      <section className="bg-black text-white py-32 px-12 relative overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
            <div className="space-y-6">
               <ShieldCheck className="w-12 h-12 text-blue-400" />
               <h3 className="text-2xl font-black uppercase tracking-tighter italic">Integrity Protocol</h3>
               <p className="text-gray-400 text-sm font-medium leading-relaxed uppercase">AI document verification for municipal structural compliance. 99% accuracy on regulatory scanning.</p>
            </div>
            <div className="space-y-6">
               <BarChart3 className="w-12 h-12 text-green-400" />
               <h3 className="text-2xl font-black uppercase tracking-tighter italic">Real-Time Intel</h3>
               <p className="text-gray-400 text-sm font-medium leading-relaxed uppercase">Live dashboard monitoring risk scores across your entire portfolio. Direct Prisma integration.</p>
            </div>
            <div className="space-y-6">
               <Lock className="w-12 h-12 text-red-400" />
               <h3 className="text-2xl font-black uppercase tracking-tighter italic">Goverment Secure</h3>
               <p className="text-gray-400 text-sm font-medium leading-relaxed uppercase">Encrypted asset repository with automated approval PDF generation for municipal submissions.</p>
            </div>
         </div>
      </section>

      <footer className="px-12 py-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">© 2026 ConstructIQ Intelligence Systems</div>
         <div className="flex gap-12">
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black">Privacy</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black">Terms</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black">Support</Link>
         </div>
      </footer>
    </div>
  )
}
