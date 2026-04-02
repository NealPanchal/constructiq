'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import { useUser } from '@clerk/nextjs'
import { Send, Loader2, Bot, User as UserIcon, AlertTriangle } from 'lucide-react'

interface Message {
  id: string
  content: string
  userId: string
  projectId: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ChatBoxProps {
  projectId: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ChatBox({ projectId }: ChatBoxProps) {
  const { user } = useUser()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data, mutate } = useSWR(
    `/api/chat?projectId=${projectId}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const messages = data?.messages || []
  const error = data?.error || (data === null ? null : undefined) // Simple error detection

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!text.trim() || sending) return

    const optimisticMessage = {
      id: Math.random().toString(),
      content: text.trim(),
      userId: user?.id || 'temp',
      projectId,
      createdAt: new Date().toISOString(),
      user: {
        id: user?.id || 'temp',
        name: user?.fullName || 'User',
        email: user?.primaryEmailAddress?.emailAddress || ''
      }
    }

    setSending(true)
    setText('')

    // OPTIMISTIC UPDATE: Update UI before server confirms
    mutate({ messages: [...messages, optimisticMessage] }, false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content: optimisticMessage.content }),
      })

      if (!response.ok) throw new Error('API Protocol Failure')
      
      mutate() // Re-fetch for server-verifiable truth
    } catch (error) {
      console.error('Chat Protocol failure:', error)
      mutate() // Revert to server state on error
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border-4 border-black rounded-[32px] bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* 🚀 AI Chat Header */}
      <div className="bg-black p-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black italic">IQ</div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] italic">Intelligence Comms</h3>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Protocol Active</span>
         </div>
      </div>

      {/* 🗨️ Message Stream (No-Reload State) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-red-600 bg-red-50/50 p-8 rounded-[32px] border-4 border-dashed border-red-200">
             <AlertTriangle className="w-12 h-12" />
             <p className="text-[10px] font-black uppercase tracking-widest italic">Intelligence Layer Offline</p>
             <p className="text-xs font-bold leading-tight uppercase opacity-60">Critical Protocol Failure: Unable to establish link to Secure Command.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 grayscale">
             <Bot className="w-12 h-12" />
             <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Secure Intelligence Command...</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isUser = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                   <div className={`w-8 h-8 shrink-0 rounded-full border-2 border-black flex items-center justify-center ${isUser ? 'bg-black text-white' : 'bg-white text-black'} text-[10px] font-black italic`}>
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                   </div>
                   <div className={`p-4 border-4 border-black rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isUser ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}>
                      <div className="text-[9px] font-black uppercase opacity-60 mb-2 truncate">
                         {isUser ? 'Commander Ident' : 'AI Intel Protocol'} • {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                      <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* 🧩 Input Interface */}
      <form onSubmit={sendMessage} className="p-6 border-t-4 border-black bg-white flex gap-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border-4 border-black rounded-2xl px-6 py-4 focus:outline-none focus:bg-gray-50 transition-colors font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          placeholder="DISPATCH COMMAND..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-black text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-2px] hover:translate-y-0"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span className="font-black uppercase text-[10px] tracking-widest italic">Send</span>
        </button>
      </form>
    </div>
  )
}
