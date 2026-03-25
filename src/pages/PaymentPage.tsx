import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAppDispatch } from '../store/hooks'
import { clearCart } from '../store/cartSlice'

const PaymentPage = () => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get clientSecret from CheckoutPage navigation state
  const clientSecret = (location.state as any)?.clientSecret

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please refresh and try again.')
      setProcessing(false)
      return
    }

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Use confirmCardPayment with clientSecret
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer',
          },
        },
      })

      if (result.error) {
        setError(`Payment failed: ${result.error.message}`)
        navigate('/payment/failure', { state: { error: result.error.message } })
      } else if (result.paymentIntent?.status === 'succeeded') {
        dispatch(clearCart())
        navigate('/payment/success', { state: { paymentIntent: result.paymentIntent } })
      }
    } catch (err) {
      setError(`Payment error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-6 font-display">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl p-6 border border-[#e6e0db] dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-text-dark dark:text-white mb-6">Fizetés</h2>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-error dark:text-error-text text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-zinc-200 mb-2">
              Kártyaadatok
            </label>
            <div className="p-3 border border-[#e6e0db] dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800">
              <CardElement
                options={{
                  style: {
                    base: {
                      color: '#1f2937',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '14px',
                    },
                    invalid: {
                      color: '#dc2626',
                    },
                  },
                  hidePostalCode: true,
                }}
              />
            </div>
          </div>

          <button
            disabled={!stripe || processing || !clientSecret}
            type="submit"
            className="w-full h-12 bg-primary hover:bg-[#e07b1a] disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white disabled:text-gray-600 dark:disabled:text-zinc-400 rounded-xl text-base font-bold transition-all"
          >
            {processing ? 'Feldolgozás...' : 'Fizetés'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PaymentPage