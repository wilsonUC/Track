import { IaChatPanel } from '../components/ia/IaChatPanel'
import { IaChatToolbar } from '../components/ia/IaChatToolbar'
import { useIaChat } from '../hooks/useIaChat'

export function IaFinanzasPage() {
  const {
    mensajes,
    input,
    setInput,
    estaCargando,
    chatEndRef,
    limpiarChat,
    manejarEnviar,
  } = useIaChat()

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
      />
    </section>
  )
}
