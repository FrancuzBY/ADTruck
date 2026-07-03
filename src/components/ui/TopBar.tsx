import { useNavigate } from 'react-router'

interface TopBarProps {
  title: string
  /** Текущий шаг визарда (1-based) и всего шагов — для сегментов прогресса. */
  step?: number
  totalSteps?: number
  /** Куда вести «назад»; по умолчанию history.back(). */
  backTo?: string
}

export function TopBar({ title, step, totalSteps = 3, backTo }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-10 bg-canvas/85 px-5 pt-14 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Wstecz"
          className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink shadow-card transition-colors hover:bg-brand-soft"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-display text-[21px] font-bold tracking-tight text-ink">{title}</h1>
      </div>
      {step && (
        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-[5px] rounded-full transition-all ${
                i < step ? 'w-6 bg-brand' : 'w-2.5 bg-line'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
