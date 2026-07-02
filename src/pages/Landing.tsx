import { Link } from 'react-router'
import { pl } from '../i18n/pl'

const props = [
  { title: pl.landing.propGpsTitle, text: pl.landing.propGpsText },
  { title: pl.landing.propReachTitle, text: pl.landing.propReachText },
  { title: pl.landing.propReportsTitle, text: pl.landing.propReportsText },
]

export function Landing() {
  return (
    <div>
      <header className="bg-brand px-6 pt-14 pb-10 text-white">
        <p className="text-sm font-semibold tracking-wide uppercase opacity-80">{pl.appName}</p>
        <h1 className="mt-3 text-3xl leading-tight font-bold">{pl.landing.heroTitle}</h1>
        <p className="mt-3 text-base leading-relaxed opacity-90">{pl.landing.heroSubtitle}</p>
        <Link
          to="/zamow"
          className="mt-6 inline-block rounded-full bg-cta px-7 py-3 text-base font-semibold text-white shadow-card transition-colors hover:bg-cta-strong"
        >
          {pl.landing.cta}
        </Link>
      </header>

      <section className="space-y-4 px-4 py-6">
        {props.map((p) => (
          <article key={p.title} className="rounded-card bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{p.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
