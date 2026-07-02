import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TopBar } from '../components/ui/TopBar'
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
    <div>
      <TopBar title="Dodaj naczepę" backTo="/flota" />
      <form onSubmit={onSubmit} className="space-y-4 px-4 pb-8">
        <Card className="space-y-4 p-5">
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Numer rejestracyjny</span>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="np. WA 12345"
              autoFocus
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-base font-medium text-ink uppercase placeholder:normal-case placeholder:text-ink-muted focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-muted">Trasa</span>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-base font-medium text-ink focus:border-brand focus:outline-none"
            >
              {ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </Card>

        <p className="px-1 text-xs text-ink-muted">
          Nowa naczepa od razu pojawi się na mapie na żywo i w Twojej flocie.
        </p>

        <Button type="submit" variant="cta" full disabled={!valid}>
          Dodaj naczepę
        </Button>
      </form>
    </div>
  )
}
