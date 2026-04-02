import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db, initializeSystem } from "@/lib/db";
import Link from 'next/link';
import FileUpload from "@/components/FileUpload";
import ApprovalWizard from "@/components/ApprovalWizard";
import AnalyzeProjectButton from "@/components/AnalyzeProjectButton";
import ProjectActions from "@/components/ProjectActions";
import { History as HistoryIcon } from "lucide-react";
import { logger } from "@/lib/logger";

/**
 * PRODUCTION SAAS PROJECT DETAIL PAGE
 * Strictly enforces user isolation and persistent diagnostic data.
 */
export default async function ProjectPage({ params }: { params: { id: string } }) {
  await initializeSystem();

  const { userId: clerkId } = auth();
  const user = await currentUser();

  if (!clerkId || !user) {
    redirect("/sign-in");
  }

  // 1. Fetch User and Project with Pure Persistence
  let localUser;
  let project: any = null;
  let dbError = false;

  try {
    localUser = await db.user.findUnique({ where: { clerkId } });
    if (!localUser) {
      redirect("/dashboard");
    }

    project = await db.project.findUnique({
      where: { id: params.id, userId: localUser.id }, // Strict user isolation
      include: {
        user: true,
        files: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
        complianceChecks: { include: { violations: true }, orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!project) return notFound();
  } catch (error) {
    logger.error(`[PROJECT_PAGE] Database detached or project ${params.id} unreachable.`);
    dbError = true;
  }

  // 2. DATABASE OFFLINE INTERFACE (Transparent Failure)
  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-12 text-black">
        <div className="max-w-md w-full bg-white border-8 border-black p-16 rounded-[64px] shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-full h-4 bg-red-600 animate-pulse`}></div>
           <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none text-red-600">
              Link Severed
           </h2>
           <p className="text-gray-500 font-bold text-sm mb-12 leading-relaxed">
              The project data cluster is temporarily unreachable. Persistent engineering diagnostics are unavailable for this sector.
           </p>
           <Link href="/dashboard" className="w-full flex items-center justify-center gap-4 bg-black text-white px-10 py-5 rounded-[24px] font-black uppercase italic tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              Return to Hub
           </Link>
        </div>
      </div>
    );
  }

  const riskColor = project.complianceStatus === 'FAIL' ? 'bg-red-600' : 'bg-green-500';
  const materials = project.materialBreakdown as any || {};

  return (
    <div className="min-h-screen bg-white flex flex-col pb-40 text-black">
      {/* 1. SaaS Command Header */}
      <header className="bg-black text-white px-12 py-20 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-1/2 h-full ${riskColor} opacity-5 -translate-y-1/2 translate-x-1/2 rotate-12`}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="flex-1">
              <nav className="flex gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">
                 <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Strategic Hub</Link>
                 <span>/</span>
                 <span className="text-white decoration-2 underline decoration-blue-600 underline-offset-8 uppercase">{project.name}</span>
              </nav>
              <div className="flex flex-wrap items-center gap-8 mb-6">
                 <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">{project.name}</h1>
                 <div className={`px-6 py-2 border-4 border-white rounded-full text-[11px] font-black uppercase tracking-widest ${riskColor} shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]`}>
                    {project.complianceStatus} STATUS
                 </div>
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] italic">Protocol ID: {project.id} • Sector: {project.location || project.city || "Central"}</p>
            </div>
            
            <div className="flex gap-4">
               <ProjectActions project={project} />
            </div>
          </div>

          {/* AI Strategic Intelligence Brief (Persistent) */}
          <div className="mt-16 bg-white text-black border-8 border-white p-12 rounded-[56px] shadow-[16px_16px_0px_0px_rgba(59,130,246,0.3)] relative group">
             <div className="absolute top-8 right-12 flex items-center gap-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Persistent Reasoner v5.2</div>
                <AnalyzeProjectButton projectId={project.id} />
             </div>
             <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-sm rotate-45"></div>
                Strategic Intelligence Report
             </h2>
             <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic">
                {project.aiReport ? (
                   <p className="text-2xl font-bold font-serif leading-relaxed italic text-gray-800">
                      "{(project.aiReport as any).content}"
                   </p>
                ) : (
                   <p className="text-xl font-bold text-gray-400 italic">Intelligence Protocol Awaiting Execution. Click 'Run Analysis' to generate strategic reasoning.</p>
                )}
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-20">
            
            {/* Engineering Diagnostics (Persistent) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="bg-gray-50 border-4 border-black p-12 rounded-[48px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all group">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-3 italic font-mono">Structural Identity (FSI)</p>
                  <h3 className="text-6xl font-black italic tracking-tighter truncate">
                    {project.builtUpArea && project.plotArea ? (project.builtUpArea / project.plotArea).toFixed(2) : "0.00"}
                  </h3>
                  <div className={`mt-10 px-6 py-2 text-[11px] font-black uppercase border-4 border-black rounded-full inline-block ${project.complianceStatus === 'PASS' ? 'bg-green-500' : 'bg-red-600 text-white'}`}>
                    Regulatory Protocol: {project.complianceStatus}
                  </div>
               </div>
               
               <div className="bg-gray-50 border-4 border-black p-12 rounded-[48px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all group">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-3 italic font-mono">Operational Pipeline</p>
                    <span className="text-5xl font-black italic tracking-tighter">{project.siteProgress}%</span>
                  </div>
                  <div className="mt-12 h-10 bg-gray-100 border-4 border-black rounded-full overflow-hidden p-1.5 shadow-inner">
                     <div className={`h-full ${riskColor} transition-all duration-1000 border-r-4 border-black rounded-full shadow-[4px_0px_0px_0px_rgba(255,255,255,0.3)]`} style={{ width: `${project.siteProgress}%` }}></div>
                  </div>
                  <p className="mt-6 text-[10px] font-black text-gray-400 uppercase italic">Inferred telemetry based on site update frequency.</p>
               </div>
            </section>

            {/* Material Logistics (Persistent) */}
            <section className="bg-white border-4 border-black p-12 rounded-[48px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex justify-between items-center mb-12">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Material Requirements</h2>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase opacity-40">Phase 1 Capital Allocation</p>
                     <p className="text-4xl font-black italic text-yellow-600">₹{(project.costEstimate / 100000).toFixed(1)}L</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Cement', val: materials.cement?.toFixed(0), unit: 'Bags', color: 'bg-gray-100' },
                    { label: 'Steel', val: materials.steel?.toFixed(1), unit: 'Tons', color: 'bg-blue-50' },
                    { label: 'Bricks', val: (materials.bricks / 1000).toFixed(1), unit: 'k-Units', color: 'bg-red-50' },
                    { label: 'Sand', val: materials.sand?.toFixed(0), unit: 'Cu.Ft', color: 'bg-yellow-50' }
                  ].map((m, i) => (
                    <div key={i} className={`p-6 border-4 border-black rounded-3xl group hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none`}>
                       <p className="text-[9px] font-black uppercase opacity-40 mb-2">{m.label}</p>
                       <h5 className="text-2xl font-black italic">{m.val || '0'}</h5>
                       <p className="text-[8px] font-bold opacity-60 uppercase">{m.unit}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* Municipal Protocol Execution */}
            <section>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black italic text-xl shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">M</div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Municipal Command Workflow</h2>
               </div>
               <ApprovalWizard projectId={project.id} />
            </section>

          </div>

          {/* Sidebar Strategic Manifest */}
          <div className="lg:col-span-4 space-y-20">
             
             {/* System Activity Stream (Persistent) */}
             <section className="bg-white border-4 border-black p-10 rounded-[48px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-black border-b-4 border-black pb-4 flex items-center gap-3">
                   <HistoryIcon className="w-4 h-4" /> Activity Feed
                </h3>
                <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                   {project.activityLogs.map((log) => (
                     <div key={log.id} className="relative pl-6 border-l-2 border-black/10 last:border-0 pb-8">
                        <div className="absolute top-0 -left-1.5 w-3 h-3 bg-black rounded-full"></div>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1">{new Date(log.createdAt).toLocaleTimeString()}</p>
                        <p className="text-[11px] font-bold leading-relaxed">{log.message}</p>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-white border-4 border-black p-10 rounded-[48px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-black border-b-4 border-black pb-4">Asset Repository</h3>
               <div className="space-y-6">
                  {project.files.map((file) => (
                    <div key={file.id} className="flex items-start gap-6 pb-6 border-b-2 border-gray-100 last:border-0 group">
                       <div className="p-4 bg-gray-50 border-4 border-black rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none">
                          <span className="text-[12px] font-black italic">{file.type || 'IQ'}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <a href={file.url} target="_blank" className="text-xs font-black uppercase truncate block hover:underline text-black decoration-2">{file.name}</a>
                          <span className="text-[9px] font-black text-blue-600 uppercase italic opacity-60">v{file.version} • Verified</span>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-12 pt-12 border-t-4 border-black border-dashed">
                  <FileUpload projectId={project.id} onUploadSuccess={() => {}} />
               </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
