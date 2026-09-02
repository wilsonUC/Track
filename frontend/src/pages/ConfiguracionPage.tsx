import {
  Bell,
  Brain,
  Coins,
  ExternalLink,
  Loader2,
  Palette,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TemaPreferencia } from '../api/preferencias'
import { ConfigRow, ConfigSelect, ConfigToggle } from '../components/configuracion/ConfigControls'
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
  const [descontarAhorrosBalance, setDescontarAhorrosBalance] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!preferences) return
    setTema(preferences.tema)
    setVistaCompacta(preferences.vista_compacta)
    setMoneda(preferences.moneda)
    setMostrarDecimales(preferences.mostrar_decimales)
    setLimitarSaldoNegativo(preferences.limitar_saldo_negativo ?? false)
    setDescontarAhorrosBalance(preferences.descontar_ahorros_balance ?? false)
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
        descontar_ahorros_balance: descontarAhorrosBalance,
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

  const hasUnsavedChanges =
    Boolean(preferences) &&
    (tema !== preferences?.tema ||
      vistaCompacta !== preferences?.vista_compacta ||
      moneda !== preferences?.moneda ||
      mostrarDecimales !== preferences?.mostrar_decimales ||
      limitarSaldoNegativo !== (preferences?.limitar_saldo_negativo ?? false) ||
      descontarAhorrosBalance !== (preferences?.descontar_ahorros_balance ?? false))

  return (
    <section className="space-y-6">
      {/* Barra superior de guardado */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Preferencias del sistema
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el tema, vista y reglas de saldo en tu cuenta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {saveMessage && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
              {saveMessage}
            </p>
          )}
          {saveError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 animate-fade-in">
              {saveError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:shadow-indigo-950/40"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <ConfigSection
          icon={Palette}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
          title="Aspecto"
          subtitle="Tema visual y densidad de la interfaz."
        >
          <ConfigRow
            label="Tema de la aplicación"
            hint="Elige si prefieres el tema claro, oscuro o sincronizado con tu sistema operativo."
          >
            <ConfigSelect
              value={tema}
              onChange={(v) => {
                setTema(v as 'claro' | 'oscuro' | 'sistema')
                setSaveMessage('')
              }}
              options={[
                { value: 'claro', label: 'Claro' },
                { value: 'oscuro', label: 'Oscuro' },
                { value: 'sistema', label: 'Sincronizar con el sistema' },
              ]}
            />
          </ConfigRow>
          <ConfigRow
            label="Vista compacta"
            hint="Reduce el espaciado en tablas y listas para ver más elementos a la vez."
          >
            <ConfigToggle
              checked={vistaCompacta}
              onChange={(v) => {
                setVistaCompacta(v)
                setSaveMessage('')
              }}
              label="Vista compacta"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Coins}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          title="Finanzas y moneda"
          subtitle="Formato de importes y reglas de saldo."
        >
          <ConfigRow
            label="Mostrar decimales"
            hint="Muestra los céntimos en todos los montos de la aplicación (ej. S/ 1,250.00)."
          >
            <ConfigToggle
              checked={mostrarDecimales}
              onChange={(v) => {
                setMostrarDecimales(v)
                setSaveMessage('')
              }}
              label="Mostrar decimales"
            />
          </ConfigRow>
          <ConfigRow
            label="Moneda principal"
            hint="Moneda en la que se calculan y muestran todos tus registros."
          >
            <ConfigSelect
              value={moneda}
              onChange={(v) => {
                setMoneda(v as 'PEN' | 'USD')
                setSaveMessage('')
              }}
              options={[
                { value: 'PEN', label: 'Soles (S/)' },
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
              onChange={(v) => {
                setLimitarSaldoNegativo(v)
                setSaveMessage('')
              }}
              label="Evitar saldo negativo"
            />
          </ConfigRow>
          <ConfigRow
            label="Restar ahorros de mi balance"
            hint="Descuenta los ahorros apartados para ver en el Dashboard tu saldo líquido real disponible para gastar."
          >
            <ConfigToggle
              checked={descontarAhorrosBalance}
              onChange={(v) => {
                setDescontarAhorrosBalance(v)
                setSaveMessage('')
              }}
              label="Restar ahorros de mi balance"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Bell}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
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
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
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
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
          title="Dashboard y listas"
          subtitle="Qué datos destacar en el resumen principal."
        >
          <ConfigRow label="Mostrar decimales" hint="Ej.: S/ 1,250.50 en lugar de S/ 1,251.">
            <ConfigToggle
              checked={mostrarDecimales}
              onChange={(v) => {
                setMostrarDecimales(v)
                setSaveMessage('')
              }}
              label="Mostrar decimales"
            />
          </ConfigRow>
        </ConfigSection>

        <ConfigSection
          icon={Shield}
          iconClass="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          title="Cuenta y datos"
          subtitle="Perfil, seguridad y exportación."
        >
          <ConfigRow
            label="Mi perfil y contraseña"
            hint="Nombre, correo, teléfono y cambio de contraseña."
          >
            <Link
              to={cuentaPath}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 sm:w-auto"
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
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 sm:min-w-[200px]"
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
              className="inline-flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 sm:min-w-[200px]"
            >
              Gestionar en Mi Cuenta
            </Link>
          </ConfigRow>
        </ConfigSection>
      </div>
    </section>
  )
}
