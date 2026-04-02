import { auth, currentUser } from "@clerk/nextjs/server";
import { createUser } from "@/lib/createUser";
import { redirect } from "next/navigation";
import { db, initializeSystem } from "@/lib/db";
import { logger } from "@/lib/logger";
import Link from 'next/link';
import CreateProjectModal from "@/components/CreateProjectModal";
import { Zap, AlertTriangle, CheckCircle2, TrendingUp, IndianRupee, HardHat, PlusCircle, LayoutDashboard, History, Database, RefreshCw, LogOut } from 'lucide-react';
import { SignedIn, SignOutButton } from "@clerk/nextjs";

/**
 * PURE PRODUCTION DASHBOARD
 * Strictly enforces real-time database connectivity and user isolation.
 * No Safe Mode, Mock Data, or Fallback simulations allowed.
 */
export default async function DashboardPage() {
  const prisma = await initializeSystem();
  logger.info("[PAGE LOAD] Protocol DASHBOARD (PURE_PRODUCTION)");

  const { userId: clerkId } = auth();
  const user = await currentUser();

  if (!clerkId || !user) {
    redirect("/sign-in");
  }

  // 1. Fetch User and Isolated Project Context (Pure Persistence)
  let localUser;
  let projects: any[] = [];
  let dbError = false;
  
  try {
    localUser = await createUser(clerkId, user.emailAddresses[0].emailAddress);
    
    if (!localUser) {
      dbError = true;
    } else {
      projects = await db.project.findMany({
        where: { userId: localUser.id }, // Strict user isolation
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    logger.error("[DASHBOARD ERROR] Database cluster detached.");
    dbError = true;
  }

  // 2. Dashboard Shell (Header/Navigation) - Always render shell for interactivity
  const renderShell = (content: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 text-black">
      <div className="max-w-7xl mx-auto w-full px-12 pt-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">
               Strategic <span className="text-gray-300">Hub</span>
            </h1>
            <div className="flex items-center gap-4">
               <div className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest italic rounded-full shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">PURE-PROD V5.2</div>
               <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em] italic">
                 Identity: {user.firstName || "Commander"} • Sector Isolation: Verified
               </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             {!dbError && <CreateProjectModal userId={clerkId} />}
             <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <SignOutButton>
                   <LogOut className="w-6 h-6 cursor-pointer" />
                </SignOutButton>
             </div>
          </div>
        </header>
        {content}
      </div>
    </div>
  );

  // 3. DATABASE OFFLINE INTERFACE (Transparent Failure)
  if (dbError) {
    return renderShell(
      <div className="flex flex-col items-center justify-center py-40">
        <div className="max-w-md w-full bg-white border-8 border-black p-16 rounded-[64px] shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-full h-4 bg-red-600 animate-pulse`}></div>
           <div className="w-24 h-24 bg-red-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-10">
              <Database className="w-10 h-10 text-red-600" />
           </div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none text-red-600">
              Database Offline
           </h2>
           <p className="text-gray-500 font-bold text-sm mb-12 leading-relaxed">
              Connectivity to the primary database cluster has been lost. System records and persistence services are currently restricted.
           </p>
           
           <Link href="/dashboard" className="w-full flex items-center justify-center gap-4 bg-black text-white px-10 py-5 rounded-[24px] font-black uppercase italic tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Reconnect Protocol
           </Link>
           
           <p className="mt-12 text-[9px] font-black uppercase tracking-[0.3em] opacity-20 italic">
              Network Interruption Detected • PURE PRODUCTION MODE
           </p>
        </div>
      </div>
    );
  }

  // 4. Performance-Optimized Aggregates (O(1) from persistent fields)
  const stats = {
    totalProjects: projects.length,
    highRisk: projects.filter(p => p.complianceStatus === 'FAIL').length,
    activeSites: projects.filter(p => p.status === 'active').length,
    portfolioCapital: projects.reduce((acc, p) => acc + (p.costEstimate || 0), 0)
  };

  // 5. Handle Empty State
  if (projects.length === 0) {
    return renderShell(
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-xl w-full bg-white border-8 border-black p-20 rounded-[64px] shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden text-black transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
           <div className="w-32 h-32 bg-blue-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-12">
              <PlusCircle className="w-12 h-12 text-blue-600" />
           </div>
           <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 leading-none text-black">Portfolio Empty</h2>
           <p className="text-gray-500 font-bold text-sm mb-12 leading-relaxed opacity-60">
              No active sectors detected under your command. Initialize a new project phase to establish the baseline records.
           </p>
           <CreateProjectModal userId={clerkId} />
           <p className="mt-16 text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic">Awaiting Initialization • v5.2 Production</p>
        </div>
      </div>
    );
  }

  // 6. DASHBOARD CONTENT (REAL DATA ONLY)
  return renderShell(
    <>
      {/* Global Strategic Metrics (Persistent) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
         <div className="bg-white border-4 border-black p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all group overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 italic font-mono">Managed Units</p>
            <h4 className="text-5xl font-black italic tracking-tighter">{stats.totalProjects}</h4>
            <TrendingUp className="w-6 h-6 mt-6 text-blue-600 group-hover:text-blue-400" />
         </div>
         <div className={`bg-white border-4 border-black p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all group ${stats.highRisk > 0 ? 'border-b-[12px] border-b-red-600' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 italic font-mono">Breach Frequency</p>
            <h4 className={`text-5xl font-black italic tracking-tighter ${stats.highRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.highRisk}
            </h4>
            <AlertTriangle className={`w-6 h-6 mt-6 ${stats.highRisk > 0 ? 'text-red-600' : 'text-green-600'}`} />
         </div>
         <div className="bg-white border-4 border-black p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all group">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 italic font-mono">Active Protocols</p>
            <h4 className="text-5xl font-black italic tracking-tighter">{stats.activeSites}</h4>
            <CheckCircle2 className="w-6 h-6 mt-6 text-green-600" />
         </div>
         <div className="bg-white border-4 border-black p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all group border-b-[12px] border-b-yellow-400">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 italic font-mono">Portfolio Value</p>
            <h4 className="text-4xl font-black italic tracking-tighter">₹{(stats.portfolioCapital / 1000000).toFixed(1)}M</h4>
            <IndianRupee className="w-6 h-6 mt-6 text-yellow-600" />
         </div>
      </section>

      {/* Portfolio Unit Feed (Persistent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {projects.map((project) => {
          const riskColor = project.complianceStatus === 'FAIL' ? 'bg-red-600' : 'bg-green-500';

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="group bg-white border-8 border-black p-12 rounded-[64px] shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all cursor-pointer flex flex-col h-full relative overflow-hidden">
                
                {/* Status Indicator (Persistent) */}
                <div className={`absolute top-12 right-12 flex items-center gap-3 bg-gray-50 border-4 border-black px-4 py-1.5 rounded-full`}>
                   <div className={`w-3 h-3 rounded-full ${riskColor} ${project.complianceStatus === 'FAIL' ? 'animate-pulse' : ''}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{project.complianceStatus} STATUS</span>
                </div>

                <div className="mb-12">
                  <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] italic decoration-4 underline decoration-gray-100 underline-offset-8">
                    Sector: {project.location || project.city || "Chennai"}
                  </p>
                </div>

                <div className="flex-1 flex flex-col gap-12">
                  {/* Site Timeline Telemetry (Persistent) */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-end">
                        <p className="text-[12px] font-black uppercase tracking-widest text-black flex items-center gap-3">
                           <HardHat className="w-5 h-5" /> Site Progress
                        </p>
                        <span className="text-4xl font-black italic leading-none">{project.siteProgress || 0}%</span>
                     </div>
                     <div className="h-10 bg-gray-100 border-4 border-black rounded-[20px] overflow-hidden p-1.5 shadow-inner">
                        <div 
                           className={`h-full ${riskColor} transition-all duration-1000 rounded-[12px] border-r-4 border-black shadow-[4px_0px_0px_0px_rgba(255,255,255,0.3)]`}
                           style={{ width: `${project.siteProgress || 0}%` }}
                        ></div>
                     </div>
                  </div>

                  {/* Operational Budget (Persistent) */}
                  <div className="bg-gray-50 border-4 border-black p-8 rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] border-dashed transition-colors group-hover:border-black">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase opacity-40">Engineering Valuation</span>
                        <span className="text-xl font-black italic">₹{(project.costEstimate / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="w-full h-1 bg-black opacity-10 rounded-full"></div>
                  </div>

                  {/* AI Strategic Intelligence (Persistent) */}
                  <div className="p-8 bg-black text-white rounded-[40px] shadow-[8px_8px_0px_0px_rgba(59,130,246,0.1)] relative min-h-[140px] flex items-center italic group-hover:bg-blue-600 transition-colors">
                     <div className="absolute -top-4 -right-4 bg-white text-black w-14 h-14 rounded-full border-4 border-black flex items-center justify-center text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">🤖</div>
                     <p className="text-[11px] font-bold leading-relaxed opacity-90 px-4">
                       {project.aiReport ? (project.aiReport as any).content?.slice(0, 150) + "..." : "Awaiting strategic reasoning command to evaluate this sector."}
                     </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
