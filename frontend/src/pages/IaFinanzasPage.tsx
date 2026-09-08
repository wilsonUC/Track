import { useEffect } from 'react'
import { useLocation, useOutletContext } from 'react-router-dom'
import type { UserProfile } from '../api/auth'
import { IaChatPanel } from '../components/ia/IaChatPanel'
import { IaChatToolbar } from '../components/ia/IaChatToolbar'
import { useIaChat } from '../hooks/useIaChat'

type IaLocationState = {
  preguntaSugerida?: string
}

type IaOutletContext = {
  userFoto?: string | null
  userInitial?: string
  profile?: UserProfile | null
}

export function IaFinanzasPage() {
  const location = useLocation()
  const outletCtx = useOutletContext<IaOutletContext | undefined>()
  const userFoto = outletCtx?.userFoto ?? outletCtx?.profile?.foto
  const userInitial = outletCtx?.userInitial

  const {
    mensajes,
    input,
    setInput,
    estaCargando,
    chatEndRef,
    limpiarChat,
    manejarEnviar,
  } = useIaChat()

  useEffect(() => {
    const pregunta = (location.state as IaLocationState | null)?.preguntaSugerida?.trim()
    if (pregunta) {
      setInput(pregunta)
    }
  }, [location.state, setInput])

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <IaChatToolbar onClear={limpiarChat} disabled={estaCargando} />
      <IaChatPanel
        mensajes={mensajes}
        input={input}
        estaCargando={estaCargando}
        chatEndRef={chatEndRef}
        onInputChange={setInput}
        onSubmit={manejarEnviar}
        userFoto={userFoto}
        userInitial={userInitial}
      />
    </section>
  )
}
