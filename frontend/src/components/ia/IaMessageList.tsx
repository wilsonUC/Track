import type { RefObject } from 'react'
import type { IaMensaje } from './iaTypes'
import { IaMessageBubble } from './IaMessageBubble'
import { IaTypingIndicator } from './IaTypingIndicator'

type IaMessageListProps = {
  mensajes: IaMensaje[]
  estaCargando: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
}

export function IaMessageList({ mensajes, estaCargando, chatEndRef }: IaMessageListProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
      {mensajes.map((mensaje) => (
        <IaMessageBubble key={mensaje.id} mensaje={mensaje} />
      ))}
      {estaCargando && <IaTypingIndicator />}
      <div ref={chatEndRef} />
    </div>
  )
}
