import { createOrder } from './subs'
import content from '../content/static.json'


function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'))
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    script.onload = () => resolve(true)
    document.body.appendChild(script)
  })
}

export async function startCheckout({ plan, user, onSuccess, onError } = {}) {
  if (!plan || !plan.raw || !plan.raw._id) {
    throw new Error('Invalid plan')
  }

  try {
    const order = await createOrder({ planId: plan.raw._id })
    await loadRazorpayScript()

    const key = import.meta.env.VITE_RAZORPAY_KEY_PROD

    const options = {
      key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: content.platformName || 'AYRC',
      description: `${plan.name} Subscription`,
      image: import.meta.env.VITE_APP_LOGO || undefined,
      order_id: order.id,
      handler: (response) => {
        if (onSuccess) onSuccess(response)
      },
      prefill: {
        name: user?.name || '',
        email: user?.username || '',
        contact: user?.phone || '',
      },
      theme: { color: '#D33F49' },
    }

    console.log('key:', key)
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      console.log('razorpay response:', response)
      console.log('razorpay key:', key)
      if (onError) onError(response)
    })
    rzp.open()
    return order
  } catch (err) {
    if (onError) onError(err)
    throw err
  }
}

export default { startCheckout }
