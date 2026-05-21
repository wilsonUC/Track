type AmountCardProps = {
  title: string
  amount: string
  accent: string
}

export function AmountCard({ title, amount, accent }: AmountCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>{amount}</p>
    </article>
  )
}
