import {
  Bell,
  Brain,
  Coins,
  ExternalLink,
  Info,
  LayoutGrid,
  Save,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfigRow, ConfigSegmented, ConfigSelect, ConfigToggle } from '../components/configuracion/ConfigControls'
import { ConfigSection } from '../components/configuracion/ConfigSection'
import { cuentaPath } from '../constants/routes'

export function ConfiguracionPage() {
  const [tema, setTema] = useState('claro')
  const [vistaCompacta, setVistaCompacta] = useState(false)
  const [moneda, setMoneda] = useState('PEN')
  const [diaInicioMes, setDiaInicioMes] = useState('1')
  const [inicioSemana, setInicioSemana] = useState('lunes')
  const [alertasPresupuesto, setAlertasPresupuesto] = useState(true)
  const [recordatorioRecurrentes, setRecordatorioRecurrentes] = useState(true)
  const [resumenSemanal, setResumenSemanal] = useState(false)
  const [consejosAuto, setConsejosAuto] = useState(true)
  const [incluirAhorrosBalance, setIncluirAhorrosBalance] = useState(true)
  const [mostrarDecimales, setMostrarDecimales] = useState(true)

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-slate-50 px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Info className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">Vista previa de configuración</p>
            <p className="mt-1 text-sm text-indigo-800/80">
              Puedes explorar y cambiar estas opciones en pantalla, pero{' '}
              <span className="font-medium">aún no se guardan</span>. Más adelante conectaremos cada
              preferencia con tu cuenta.
            </p>
          </div>
        </div>
      </div>

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
              onChange={setTema}
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
          subtitle="Moneda y criterios para reportes y filtros."
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
            label="Inicio del mes personal"
            hint="Para reportes y metas si tu ciclo no empieza el día 1."
          >
            <ConfigSelect
              value={diaInicioMes}
              onChange={setDiaInicioMes}
              options={Array.from({ length: 28 }, (_, i) => ({
                value: String(i + 1),
                label: `Día ${i + 1} de cada mes`,
              }))}
            />
          </ConfigRow>
          <ConfigRow label="La semana empieza en" hint="Afecta el filtro «Semana» del dashboard.">
            <ConfigSegmented
              value={inicioSemana}
              onChange={setInicioSemana}
              options={[
                { value: 'lunes', label: 'Lunes' },
                { value: 'domingo', label: 'Domingo' },
              ]}
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
            <ConfigToggle
              checked={alertasPresupuesto}
              onChange={setAlertasPresupuesto}
              disabled
              label="Presupuestos superados"
            />
          </ConfigRow>
          <ConfigRow
            label="Recurrentes pendientes"
            hint="Recordatorio si un pago o cobro del mes no está registrado."
            disabled
          >
            <ConfigToggle
              checked={recordatorioRecurrentes}
              onChange={setRecordatorioRecurrentes}
              disabled
              label="Recurrentes pendientes"
            />
          </ConfigRow>
          <ConfigRow
            label="Resumen semanal"
            hint="Email con ingresos, gastos y balance de la semana."
            disabled
          >
            <ConfigToggle
              checked={resumenSemanal}
              onChange={setResumenSemanal}
              disabled
              label="Resumen semanal"
            />
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
            <ConfigToggle
              checked={consejosAuto}
              onChange={setConsejosAuto}
              disabled
              label="Consejos automáticos"
            />
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
          <ConfigRow
            label="Descontar ahorros del balance"
            hint="Balance = ingresos − gastos − aportes a metas."
          >
            <ConfigToggle
              checked={incluirAhorrosBalance}
              onChange={setIncluirAhorrosBalance}
              label="Descontar ahorros del balance"
            />
          </ConfigRow>
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

      <div className="flex flex-col items-stretch justify-end gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-slate-500">
          Los cambios de esta pantalla son solo de demostración y se pierden al recargar.
        </p>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
        >
          <Save className="h-4 w-4" aria-hidden />
          Guardar preferencias
        </button>
      </div>
    </section>
  )
}
