export function MetricCards({ metrics }) {
  return (
    <section
      className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4"
      aria-label="Leaderboard summary"
    >
      {metrics.map((metric, index) => (
        <article
          className="surface-card rounded-2xl p-3 sm:rounded-[28px] sm:p-6"
          key={metric.label}
        >
          <div
            className={`mb-2 h-1 w-10 rounded-full sm:mb-5 sm:h-1.5 sm:w-16 ${
              index === 0
                ? 'bg-[#F8D978]'
                : index === 1
                  ? 'bg-emerald-400'
                  : index === 2
                    ? 'bg-slate-200'
                    : 'bg-amber-700'
            }`}
          />
          <span className="block text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#F8D978] sm:text-xs sm:tracking-[0.22em]">
            {metric.label}
          </span>
          <strong className="mt-2 block font-display text-xl font-semibold tracking-[-0.04em] text-white sm:mt-4 sm:text-3xl md:text-4xl md:tracking-[-0.05em]">
            {metric.value}
          </strong>
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-slate-400 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-7">
            {metric.hint}
          </p>
        </article>
      ))}
    </section>
  )
}
