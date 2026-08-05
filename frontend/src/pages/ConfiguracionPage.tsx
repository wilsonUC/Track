import {
  Bell,
  Brain,
  CheckCircle2,
  Coins,
  ExternalLink,
  LayoutGrid,
  Loader2,
  Save,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TemaPreferencia } from '../api/preferencias'
import { ConfigRow, ConfigSegmented, ConfigSelect, ConfigToggle } from '../components/configuracion/ConfigControls'
import { ConfigSection } from '../components/configuracion/ConfigSection'
import { cuentaPath } from '../constants/routes'
import { usePreferences } from '../context/PreferencesContext'

export function ConfiguracionPage() {
  const { preferences, loading, saving, savePreferences } = usePreferences()

  const [tema, setTema] = useState<TemaPreferencia>('claro')
  const [vistaCompacta, setVistaCompacta] = useState(false)
  const [moneda, setMoneda] = useState('PEN')
  const [mostrarDecimales, setMostrarDecimales] = useState(true)
  const [limitarSaldoNegativo, setLimitarSaldoNegativo] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!preferences) return
    setTema(preferences.tema)
    setVistaCompacta(preferences.vista_compacta)
    setMoneda(preferences.moneda)
    setMostrarDecimales(preferences.mostrar_decimales)
    setLimitarSaldoNegativo(preferences.limitar_saldo_negativo ?? false)
  }, [preferences])

  async function handleSave() {
    setSaveMessage('')
    setSaveError('')
    try {
      await savePreferences({
        tema,
        vista_compacta: vistaCompacta,
        moneda,
        mostrar_decimales: mostrarDecimales,
        limitar_saldo_negativo: limitarSaldoNegativo,
      })
      setSaveMessage('Preferencias guardadas correctamente.')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudieron guardar las preferencias.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <ConfigSection
          icon={LayoutGrid}
          iconClass="bg-slate-100 text-slate-600"
          title="Apariencia"
          subtitle="Cómo se ve la aplicación en tu dispositivo."
        >
          <ConfigRow label="Tema" hint="Claro, oscuro o según el sistema operativo.">
            <ConfigSegmented
              value={tema}
              onChange={(v) => setTema(v as TemaPreferencia)}
              options={[
                { value: 'claro', label: 'Claro' },
                { value: 'oscuro', label: 'Oscuro' },
                { value: 'sistema', label: 'Sistema' },
              ]}
            />
          </ConfigRow>
          <ConfigRow
            label="Listas compactas"
            hint="Menos espacio entre filas en ingresos, gastos y dashboard."
          >
            <ConfigToggle
              checked={vistaCompacta}
              onChange={setVistaCompacta}
              label="Listas compactas"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Coins}
          iconClass="bg-emerald-50 text-emerald-600"
          title="Finanzas"
          subtitle="Moneda usada para mostrar tus montos."
        >
          <ConfigRow label="Moneda principal" hint="Todos los montos se muestran en esta moneda.">
            <ConfigSelect
              value={moneda}
              onChange={setMoneda}
              options={[
                { value: 'PEN', label: 'Soles peruanos (S/)' },
                { value: 'USD', label: 'Dólares (US$) — próximamente' },
              ]}
              disabled
            />
          </ConfigRow>
          <ConfigRow
            label="Evitar saldo negativo"
            hint="Impide registrar gastos o recurrentes si superan tus ingresos disponibles actuales."
          >
            <ConfigToggle
              checked={limitarSaldoNegativo}
              onChange={setLimitarSaldoNegativo}
              label="Evitar saldo negativo"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Bell}
          iconClass="bg-amber-50 text-amber-600"
          title="Notificaciones"
          subtitle="Alertas y recordatorios por correo o en la app."
          badge="Próximamente"
        >
          <ConfigRow
            label="Presupuestos superados"
            hint="Aviso cuando un gasto supere el límite mensual."
            disabled
          >
            <ConfigToggle checked disabled onChange={() => undefined} label="Presupuestos superados" />
          </ConfigRow>
          <ConfigRow
            label="Recurrentes pendientes"
            hint="Recordatorio si un pago o cobro del mes no está registrado."
            disabled
          >
            <ConfigToggle checked disabled onChange={() => undefined} label="Recurrentes pendientes" />
          </ConfigRow>
          <ConfigRow
            label="Resumen semanal"
            hint="Email con ingresos, gastos y balance de la semana."
            disabled
          >
            <ConfigToggle checked={false} disabled onChange={() => undefined} label="Resumen semanal" />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Brain}
          iconClass="bg-violet-50 text-violet-600"
          title="IA y consejos"
          subtitle="Comportamiento del asistente y sugerencias automáticas."
          badge="Próximamente"
        >
          <ConfigRow
            label="Consejos automáticos (24 h)"
            hint="Regenerar consejos una vez al día con tus datos actualizados."
            disabled
          >
            <ConfigToggle checked disabled onChange={() => undefined} label="Consejos automáticos" />
          </ConfigRow>
          <ConfigRow
            label="Cantidad de consejos"
            hint="La IA elige entre 4 y 6 según tus hallazgos."
            disabled
          >
            <ConfigSelect
              value="auto"
              onChange={() => undefined}
              disabled
              options={[
                { value: 'auto', label: 'Automático (4–6)' },
                { value: '4', label: 'Siempre 4' },
                { value: '6', label: 'Siempre 6' },
              ]}
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Sparkles}
          iconClass="bg-indigo-50 text-indigo-600"
          title="Dashboard y listas"
          subtitle="Qué datos destacar en el resumen principal."
        >
          <ConfigRow label="Mostrar decimales" hint="Ej.: S/ 1,250.50 en lugar de S/ 1,251.">
            <ConfigToggle
              checked={mostrarDecimales}
              onChange={setMostrarDecimales}
              label="Mostrar decimales"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Shield}
          iconClass="bg-rose-50 text-rose-600"
          title="Cuenta y datos"
          subtitle="Perfil, seguridad y exportación."
        >
          <ConfigRow
            label="Mi perfil y contraseña"
            hint="Nombre, correo, teléfono y cambio de contraseña."
          >
            <Link
              to={cuentaPath}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            >
              Ir a Mi Cuenta
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </ConfigRow>
          <ConfigRow
            label="Exportar mis datos"
            hint="Descargar transacciones y reportes en CSV o PDF."
            disabled
          >
            <button
              type="button"
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 sm:min-w-[200px]"
            >
              Exportar — próximamente
            </button>
          </ConfigRow>
          <ConfigRow
            label="Comenzar desde cero"
            hint="Borrar transacciones, presupuestos, metas y más."
          >
            <Link
              to={cuentaPath}
              className="inline-flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 sm:min-w-[200px]"
            >
              Gestionar en Mi Cuenta
            </Link>
          </ConfigRow>
        </ConfigSection>
      </div>

      <div className="flex flex-col items-stretch justify-end gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          {saveMessage && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              {saveMessage}
            </p>
          )}
          {saveError && <p className="text-xs text-rose-600">{saveError}</p>}
          {!saveMessage && !saveError && (
            <p className="text-xs text-slate-500">
              Los cambios se guardan en tu cuenta y se aplican en toda la app.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          {saving ? 'Guardando…' : 'Guardar preferencias'}
        </button>
      </div>
    </section>
  )
}
