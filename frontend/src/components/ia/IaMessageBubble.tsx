import { Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { IaMensaje } from './iaTypes'

type IaMessageBubbleProps = {
  mensaje: IaMensaje
}

export function IaMessageBubble({ mensaje }: IaMessageBubbleProps) {
  const isUser = mensaje.remitente === 'USER'

  return (
    <div
      className={`flex max-w-[90%] sm:max-w-[85%] items-start gap-3.5 ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      <div
        className={`shrink-0 rounded-xl p-2.5 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'border border-slate-100 bg-white text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400'
        }`}
      >
        {isUser ? <User className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
      </div>

      <div className="max-w-full space-y-1 overflow-hidden">
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-none bg-indigo-600 font-medium text-white'
              : 'rounded-tl-none border border-slate-100/80 bg-white text-slate-800 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-200'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{mensaje.texto}</div>
          ) : (
            <div className="space-y-2 overflow-x-auto text-xs leading-relaxed sm:text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ ...props }) => (
                    <div className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 shadow-xs dark:border-slate-800">
                      <table className="w-full border-collapse text-left text-xs" {...props} />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead
                      className="bg-slate-100/80 font-bold text-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                      {...props}
                    />
                  ),
                  th: ({ ...props }) => (
                    <th
                      className="border-b border-slate-200 px-3 py-2 font-bold dark:border-slate-800"
                      {...props}
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800/60 dark:text-slate-300"
                      {...props}
                    />
                  ),
                  tr: ({ ...props }) => (
                    <tr
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      {...props}
                    />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="my-1.5 list-disc space-y-1 pl-4" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="my-1.5 list-decimal space-y-1 pl-4" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="my-1.5 leading-relaxed" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong
                      className="font-bold text-indigo-700 dark:text-indigo-400"
                      {...props}
                    />
                  ),
                  code: ({ ...props }) => (
                    <code
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-indigo-600 dark:bg-slate-800 dark:text-indigo-300"
                      {...props}
                    />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="my-2 border-l-4 border-indigo-400 pl-3 italic text-slate-600 dark:text-slate-400"
                      {...props}
                    />
                  ),
                }}
              >
                {mensaje.texto}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span
          className={`block text-[10px] font-semibold text-slate-400 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {mensaje.fecha}
        </span>
      </div>
    </div>
  )
}
