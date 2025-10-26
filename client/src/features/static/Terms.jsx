import content from '../../content/static.json'
import StaticPage from '../../components/layout/StaticPage'
import { FileText } from "lucide-react";

export default function Terms(){
  const t = content.tos
  return (
    <StaticPage title={t.title} subtitle={t.body}>
       <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
      <div className="text-left space-y-6 max-w-4xl mx-auto mt-16">
        {t.sections && t.sections.map((sec, i) => (
          <div key={i}>
            <h2 className="text-2xl font-semibold text-text-primary">{sec.heading}</h2>
            <p className='text-text-secondary'>{sec.body}</p>
          </div>
        ))}

        <div>
          <p className='text-text-secondary'>For any queries or issues, please contact our support team at{' '}
            <a href={`mailto:${content.contact.supportEmail}`} className="text-info-blue hover:text-primary">{content.contact.supportEmail}</a>
            {' '}or visit the <a href="/contact" className="text-info-blue hover:text-primary">Contact page</a>.</p>
        </div>
      </div>
    </StaticPage>
  )
}
