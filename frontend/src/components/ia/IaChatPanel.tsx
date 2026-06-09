import type { RefObject } from 'react'
import type { IaMensaje } from './iaTypes'
import { IaChatInput } from './IaChatInput'
import { IaMessageList } from './IaMessageList'

type IaChatPanelProps = {
  mensajes: IaMensaje[]
  input: string
  estaCargando: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function IaChatPanel({
  mensajes,
  input,
  estaCargando,
  chatEndRef,
  onInputChange,
  onSubmit,
}: IaChatPanelProps) {
  return (
    <article className="flex h-[min(65vh,640px)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <IaMessageList mensajes={mensajes} estaCargando={estaCargando} chatEndRef={chatEndRef} />
      <IaChatInput
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={estaCargando}
      />
    </article>
  )
}
