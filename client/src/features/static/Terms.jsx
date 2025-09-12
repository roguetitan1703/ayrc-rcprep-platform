import content from '../../content/static.json'
import StaticPage from '../../components/layout/StaticPage'

export default function Terms(){
  const t = content.tos
  return (
    <StaticPage title={t.title}>
      <p className="whitespace-pre-wrap">{t.body}</p>
      <h2>Key Points</h2>
      <ul>
        <li>ARC is a pilot; features may change.</li>
        <li>Content must not be redistributed.</li>
        <li>Contact details are in the README.</li>
      </ul>
    </StaticPage>
  )
}
