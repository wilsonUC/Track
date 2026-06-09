import { Loader2, Terminal } from 'lucide-react'

export function IaTypingIndicator() {
  return (
    <div className="mr-auto flex max-w-[80%] animate-pulse items-center gap-4">
      <div className="rounded-xl border border-slate-100 bg-white p-2.5 text-indigo-600 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-hidden />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-slate-100 bg-white px-5 py-3.5 text-sm font-medium italic text-indigo-600/80 shadow-sm">
        <Terminal className="h-3.5 w-3.5 animate-pulse text-indigo-500" aria-hidden />
        <span>Analizando tus finanzas…</span>
      </div>
    </div>
  )
}
