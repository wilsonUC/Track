import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getAccessToken } from '../api/auth'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { GastosPage } from '../pages/GastosPage'
import { IngresosPage } from '../pages/IngresosPage'
import { LoginPage } from '../pages/LoginPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { RegisterPage } from '../pages/RegisterPage'

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function GuestOnly({ children }: { children: ReactNode }) {
  if (getAccessToken()) {
    return <Navigate to="/" replace />
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="ingresos" element={<IngresosPage />} />
        <Route path="gastos" element={<GastosPage />} />
        <Route path="presupuestos" element={<PlaceholderPage section="presupuestos" />} />
        <Route path="metas" element={<PlaceholderPage section="metas" />} />
        <Route path="recurrentes" element={<PlaceholderPage section="recurrentes" />} />
        <Route path="reportes" element={<PlaceholderPage section="reportes" />} />
        <Route path="consejos" element={<PlaceholderPage section="consejos" />} />
        <Route path="ia" element={<PlaceholderPage section="ia" />} />
        <Route path="configuracion" element={<PlaceholderPage section="configuracion" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
