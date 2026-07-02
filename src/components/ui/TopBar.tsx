import { useNavigate } from 'react-router'

interface TopBarProps {
  title: string
  /** Текущий шаг визарда (1-based) и всего шагов — для точек прогресса. */
  step?: number
  totalSteps?: number
  /** Куда вести «назад»; по умолчанию history.back(). */
  backTo?: string
}

export function TopBar({ title, step, totalSteps = 3, backTo }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-10 bg-canvas/90 px-4 pt-12 pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Wstecz"
          className="grid size-9 place-items-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-brand-soft"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      {step && (
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? 'bg-brand' : 'bg-line'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
