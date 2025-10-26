import StaticPage from '../../components/layout/StaticPage'
import React from 'react'
import content from '../../content/static.json'

export default function ShippingPolicy() {
  return (
    <StaticPage title={content.shipping.title} subtitle={content.shipping.subtitle}>
      <section className="max-w-3xl mx-auto text-left space-y-6">
        {content.shipping.sections.map((s, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <p className="text-text-secondary">{s.body}</p>
          </div>
        ))}

        <div className="pt-4">
          <p className="text-text-secondary">If you need help, contact us at{' '}
            <a href={`mailto:${content.contact.supportEmail}`} className="text-info-blue hover:text-primary">{content.contact.supportEmail}</a>
            {' '}or call <strong>{content.contact.supportPhone}</strong>.</p>
        </div>
      </section>
    </StaticPage>
  )
}
