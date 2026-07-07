import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  fetchPreferencias,
  updatePreferencias,
  type PreferenciasUpdate,
  type PreferenciasUsuario,
  type TemaPreferencia,
} from '../api/preferencias'
import { setFormatPreferences } from '../utils/financeFormat'

type PreferencesContextValue = {
  preferences: PreferenciasUsuario | null
  loading: boolean
  saving: boolean
  savePreferences: (data: PreferenciasUpdate) => Promise<PreferenciasUsuario>
  refreshPreferences: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function resolveDarkMode(tema: TemaPreferencia): boolean {
  if (tema === 'oscuro') return true
  if (tema === 'claro') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyPreferencesToDom(prefs: PreferenciasUsuario) {
  const root = document.documentElement
  root.classList.toggle('dark', resolveDarkMode(prefs.tema))
  root.dataset.compact = prefs.vista_compacta ? 'true' : 'false'
  setFormatPreferences({ showDecimals: prefs.mostrar_decimales })
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferenciasUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refreshPreferences = useCallback(async () => {
    const prefs = await fetchPreferencias()
    setPreferences(prefs)
    applyPreferencesToDom(prefs)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPreferencias()
      .then((prefs) => {
        if (cancelled) return
        setPreferences(prefs)
        applyPreferencesToDom(prefs)
      })
      .catch(() => {
        if (!cancelled) setPreferences(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!preferences || preferences.tema !== 'sistema') return undefined

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyPreferencesToDom(preferences)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preferences])

  const savePreferences = useCallback(async (data: PreferenciasUpdate) => {
    setSaving(true)
    try {
      const updated = await updatePreferencias(data)
      setPreferences(updated)
      applyPreferencesToDom(updated)
      return updated
    } finally {
      setSaving(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      loading,
      saving,
      savePreferences,
      refreshPreferences,
    }),
    [preferences, loading, saving, savePreferences, refreshPreferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences debe usarse dentro de PreferencesProvider')
  }
  return ctx
}
