'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * CONSTRUCTIQ GLOBAL ERROR BOUNDARY
 * Prevents application crashes and provides a recovery interface.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL UI ERROR CAUGHT BY BOUNDARY:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border-8 border-black p-12 rounded-[64px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="w-24 h-24 bg-red-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
               <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">
               System Unstable
            </h1>
            
            <p className="text-gray-500 font-bold text-sm mb-10 leading-relaxed">
               Intelligence Protocol interrupted. We are attempting to re-establish a secure baseline.
            </p>

            <button
               onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
               }}
               className="w-full bg-black text-white px-10 py-5 rounded-[24px] font-black uppercase italic tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
            >
               <RefreshCcw className="w-5 h-5" />
               Re-establish
            </button>
            
            <p className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] opacity-20">
               ConstructIQ Recovery Protocol • Phase 5 Intelligence
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
