import StaticPage from '../../components/layout/StaticPage'
import content from '../../content/static.json'
import { RotateCcw } from 'lucide-react'

export default function Refund() {
  const c = content.refund
  return (
    <StaticPage>
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
          <RotateCcw className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-6 text-text-primary">{c.title}</h1>
      <p className="whitespace-pre-wrap text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
        {c.body}
      </p>

      {/* Policy Details (rendered from static.json) */}

      <div className="text-left mt-12 space-y-6 max-w-4xl mx-auto ">
        {c.sections.map((sec, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-semibold">{sec.heading}</h2>
            {sec.points ? (
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                {sec.points.map((p, pi) => (
                  <li key={pi} className="text-text-secondary">{p}</li>
                ))}
              </ul>
            ) : (
              <p className="text-text-secondary">{sec.body}</p>
            )}
          </div>
        ))}

        <p className='text-text-secondary'>
          To request a refund, contact us at <a href={`mailto:${content.contact.supportEmail}`} className="text-info-blue hover:text-primary">{content.contact.supportEmail}</a> or call <strong>{content.contact.supportPhone}</strong>.
        </p>
      </div>
    </StaticPage>
  )
}
