import StaticPage from '../../components/layout/StaticPage'
import content from '../../content/static.json'

export default function Pricing() {
  const c = content.pricing
  return (
    <StaticPage title={c.title} subtitle={c.subtitle}>
      <p className="whitespace-pre-wrap">{c.body}</p>
      <h2>Plans</h2>
      <ul>
        {(c.plans || []).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </StaticPage>
  )
}
