import prisma from '@/lib/prisma'

export default async function Page() {
  // 1. Fetch via Prisma ONLY (Verified Production Setup)
  let prismaUsers = []
  let prismaError = null
  let connectionStatus = "Connecting..."

  try {
    prismaUsers = await prisma.user.findMany({ take: 5 })
    connectionStatus = "Connected Successful!"
  } catch (e: any) {
    prismaError = e.message
    connectionStatus = "Connection Failed"
  }

  return (
    <div className="p-12 max-w-2xl mx-auto font-sans">
      <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase italic">
          Database Verify
        </h1>
        <p className="text-gray-600 mb-8 font-medium">Finalizing Prisma + Supabase Pooler</p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className={`w-4 h-4 rounded-full ${prismaError ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
             <span className="font-bold text-lg uppercase">{connectionStatus}</span>
          </div>

          {prismaError ? (
             <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700">
                <p className="font-bold mb-2 uppercase text-xs tracking-widest text-red-500">Error Report</p>
                <code className="text-sm break-all font-mono leading-tight">
                  {prismaError}
                </code>
             </div>
          ) : (
            <div className="p-6 bg-gray-50 border-2 border-black rounded-2xl">
               <p className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Table: User (Sample)</p>
               <ul className="space-y-3">
                 {prismaUsers && prismaUsers.length > 0 ? (
                   prismaUsers.map((user: any) => (
                     <li key={user.id} className="font-medium text-sm flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                       {user.email}
                     </li>
                   ))
                 ) : (
                   <p className="text-gray-400 italic text-sm">
                     Prisma connected, but User table is currently empty.
                   </p>
                 )}
               </ul>
            </div>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
           <span>ConstructIQ Architecture</span>
           <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )
}
