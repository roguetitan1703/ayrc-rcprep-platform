import StaticPage from '../../components/layout/StaticPage'
import content from '../../content/static.json'

export default function Contact() {
  const c = content.contact
  return (
    <StaticPage title={c.title} subtitle={c.subtitle}>
      <p className="whitespace-pre-wrap">{c.body}</p>
    </StaticPage>
  )
}
