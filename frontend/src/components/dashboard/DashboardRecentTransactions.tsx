export function DashboardRecentTransactions() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182C10.536 7.88 11.304 7.66 12 7.66c.768 0 1.536.22 2.121.659l.879.659"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800">Todas las transacciones recientes</h3>
      </div>
      <div className="relative flex min-h-[160px] items-center justify-center p-8">
        <svg
          className="pointer-events-none absolute h-24 w-24 text-slate-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={0.8}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.172-.879-1.172-2.303 0-3.182C10.536 7.88 11.304 7.66 12 7.66c.768 0 1.536.22 2.121.659l.879.659"
          />
        </svg>
        <p className="relative text-sm text-slate-500">No hay transacciones para mostrar</p>
      </div>
    </article>
  )
}
