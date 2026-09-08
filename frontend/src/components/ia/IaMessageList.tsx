import type { RefObject } from 'react'
import type { IaMensaje } from './iaTypes'
import { IaMessageBubble } from './IaMessageBubble'
import { IaTypingIndicator } from './IaTypingIndicator'

type IaMessageListProps = {
  mensajes: IaMensaje[]
  estaCargando: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
  userFoto?: string | null
  userInitial?: string
}

export function IaMessageList({
  mensajes,
  estaCargando,
  chatEndRef,
  userFoto,
  userInitial,
}: IaMessageListProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 dark:bg-slate-950/40">
      {mensajes.map((mensaje) => (
        <IaMessageBubble
          key={mensaje.id}
          mensaje={mensaje}
          userFoto={userFoto}
          userInitial={userInitial}
        />
      ))}
      {estaCargando && <IaTypingIndicator />}
      <div ref={chatEndRef} />
    </div>
  )
}
