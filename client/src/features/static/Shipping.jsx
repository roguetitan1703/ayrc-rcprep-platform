import StaticPage from '../../components/layout/StaticPage'
import React from 'react'
import content from '../../content/static.json'
import { Container } from 'lucide-react'

export default function ShippingPolicy() {
  const c = content.shipping
  return (
    <StaticPage>
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md">
          <Container className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold mt-6 text-text-primary">{c.title}</h1>
      <p className="whitespace-pre-wrap text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
        {c.body}
      </p>
      <div className="text-left space-y-6 mt-16 max-w-4xl mx-auto">
        {c.sections &&
          c.sections.map((sec, i) => (
            <div key={i}>
              <h2 className="text-2xl font-semibold text-text-primary">{sec.heading}</h2>
              <p className="text-text-secondary">{sec.body}</p>
            </div>
          ))}
      </div>
    </StaticPage>
  )
}
