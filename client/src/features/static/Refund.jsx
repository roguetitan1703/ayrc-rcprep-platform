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

      {/* Policy Details */}

      <div className="text-left mt-12 space-y-6 max-w-4xl mx-auto ">
        <h2 className="text-2xl font-semibold">Eligibility for Refunds</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            Refunds are only applicable within <strong>7 days of payment</strong>.
          </li>
          <li>No refunds for partially used subscription periods.</li>
          <li>Special promotional offers are non-refundable.</li>
        </ul>

        <h2 className="text-2xl font-semibold">Cancellation Policy</h2>
        <p className='text-text-secondary'>
          You may cancel your subscription anytime from your account dashboard. Cancellations take
          effect from the next billing cycle.
        </p>

        <h2 className="text-2xl font-semibold">Processing</h2>
        <p className='text-text-secondary'>
          Approved refunds will be processed to the original payment method within{' '}
          <strong>5–7 business days</strong>.
        </p>
      </div>
    </StaticPage>
  )
}
