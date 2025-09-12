import content from '../../content/static.json'
import StaticPage from '../../components/layout/StaticPage'

export default function About(){
  const c = content.about
  const feats = content.features
  return (
    <StaticPage title={c.title} subtitle={c.subtitle}>
      <p>{c.body}</p>
      <h2>Key Features</h2>
      <ul>
        {feats.map((f,i)=> <li key={i}>{f}</li>)}
      </ul>
    </StaticPage>
  )
}
