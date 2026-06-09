import { Bot, User } from 'lucide-react'
import type { IaMensaje } from './iaTypes'

type IaMessageBubbleProps = {
  mensaje: IaMensaje
}

export function IaMessageBubble({ mensaje }: IaMessageBubbleProps) {
  const isUser = mensaje.remitente === 'USER'

  return (
    <div
      className={`flex max-w-[85%] items-start gap-3.5 ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      <div
        className={`shrink-0 rounded-xl p-2.5 shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'border border-slate-100 bg-white text-indigo-600'
        }`}
      >
        {isUser ? <User className="h-4 w-4" aria-hidden /> : <Bot className="h-4 w-4" aria-hidden />}
      </div>

      <div className="max-w-full space-y-1">
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-none bg-indigo-600 font-medium text-white'
              : 'rounded-tl-none border border-slate-100/80 bg-white text-slate-800'
          }`}
        >
          {mensaje.texto}
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
