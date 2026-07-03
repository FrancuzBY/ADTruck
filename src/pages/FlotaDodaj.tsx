import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '../data/routes'
import { useFleetStore } from '../store/fleet'

export function FlotaDodaj() {
  const navigate = useNavigate()
  const addTruck = useFleetStore((s) => s.addTruck)
  const [plate, setPlate] = useState('')
  const [routeId, setRouteId] = useState(ROUTES[0].id)

  const valid = plate.trim().length >= 3

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    addTruck({ plate, routeId })
    navigate('/flota')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0e14]">
      <button
        type="button"
        aria-label="Zamknij"
        onClick={() => navigate('/flota')}
        className="min-h-[120px] flex-1 bg-[radial-gradient(120%_60%_at_50%_40%,rgb(34_211_238_/_0.05),transparent_70%)]"
      />
      <form
        onSubmit={onSubmit}
        className="rounded-t-[30px] bg-white px-[22px] pt-3.5 pb-24 shadow-[0_-24px_60px_-20px_rgb(0_0_0_/_0.7)]"
      >
        <div className="mx-auto mb-5 h-[5px] w-10 rounded-full bg-[#d6deec]" />
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-[#0b1220]">Dodaj naczepę</h1>
          <button
            type="button"
            onClick={() => navigate('/flota')}
            aria-label="Zamknij"
            className="grid size-[34px] place-items-center rounded-full border border-[#e6eaf2] bg-[#f5f7fb] text-[#5b6472]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-[17px]">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-[12.5px] font-semibold text-[#5b6472]">Numer rejestracyjny</span>
          <input
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="np. WA 12345"
            autoFocus
            className="w-full rounded-[14px] border-[1.5px] border-[#e6eaf2] bg-[#f5f7fb] px-4 py-3.5 font-mono text-base text-[#0b1220] uppercase placeholder:normal-case placeholder:text-[#9da2ad] focus:border-brand focus:shadow-[0_0_0_3px_rgb(30_58_138_/_0.12)] focus:outline-none"
          />
        </label>

        <label className="mt-3.5 block">
          <span className="mb-2 block text-[12.5px] font-semibold text-[#5b6472]">Trasa</span>
          <div className="relative">
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full appearance-none rounded-[14px] border-[1.5px] border-[#e6eaf2] bg-[#f5f7fb] px-4 py-3.5 text-[15px] text-[#0b1220] focus:border-brand focus:outline-none"
            >
              {ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="#9da2ad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </label>

        <p className="mt-3.5 px-0.5 text-[12.5px] leading-relaxed text-[#8a94a6]">
          Nowa naczepa od razu pojawi się na mapie na żywo i w Twojej flocie.
        </p>

        <button
          type="submit"
          disabled={!valid}
          className="mt-4 w-full rounded-full py-4 text-base font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed enabled:bg-cta enabled:text-white enabled:shadow-[0_12px_28px_-12px_rgb(22_163_74_/_0.5)] disabled:bg-[#e4e9f1] disabled:text-[#9da2ad]"
        >
          Dodaj naczepę
        </button>
      </form>
    </div>
  )
}
