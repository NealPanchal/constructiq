'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, FileCheck, FileText, Settings, UserCircle } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Approvals', href: '/dashboard/approvals', icon: FileCheck },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-black italic">IQ</div>
          ConstructIQ
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-black shadow-sm'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
          <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarImg: 'rounded-md' } }} />
          <div className="flex flex-col min-w-0">
             <span className="text-xs font-bold truncate">Project Hub</span>
             <span className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest italic">V5 Pulse Ready</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
