import type { RefObject } from 'react'
import type { IaCuota, IaMensaje } from './iaTypes'
import { IaChatInput } from './IaChatInput'
import { IaMessageList } from './IaMessageList'

type IaChatPanelProps = {
  mensajes: IaMensaje[]
  input: string
  estaCargando: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  userFoto?: string | null
  userInitial?: string
  cuota?: IaCuota | null
}

export function IaChatPanel({
  mensajes,
  input,
  estaCargando,
  chatEndRef,
  onInputChange,
  onSubmit,
  userFoto,
  userInitial,
  cuota,
}: IaChatPanelProps) {
  return (
    <article className="flex h-[min(65vh,640px)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <IaMessageList
        mensajes={mensajes}
        estaCargando={estaCargando}
        chatEndRef={chatEndRef}
        userFoto={userFoto}
        userInitial={userInitial}
      />
      <IaChatInput
        value={input}
        onChange={onInputChange}
        onSubmit={onSubmit}
        disabled={estaCargando}
        cuota={cuota}
      />
    </article>
  )
}

