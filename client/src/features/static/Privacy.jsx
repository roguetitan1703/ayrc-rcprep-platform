import StaticPage from '../../components/layout/StaticPage'
import content from '../../content/static.json'
import { Shield } from "lucide-react";

export default function Privacy() {
  const c = content.privacy
  return (
    <StaticPage title={c.title} subtitle={c.subtitle}>
     <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-left space-y-6 mt-16 max-w-4xl mx-auto">
          {c.sections && c.sections.map((sec, i) => (
            <div key={i}>
              <h2 className="text-2xl font-semibold text-text-primary">{sec.heading}</h2>
              <p className='text-text-secondary'>{sec.body}</p>
            </div>
          ))}
        </div>
    </StaticPage>
  )
}
