import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import EnrollForm from '../../components/EnrollForm/EnrollForm.jsx'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

export default function EnrollFormPage({ type = 'course' }) {
  const navigate = useNavigate()
  const formDataRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (data) => {
    formDataRef.current = data
    setLoading(true)
    setError('')

    try {
      // STEP 1 — Save lead to Google Sheet
      await fetch(`${BACKEND_URL}/api/payment/save-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type }),
      })

      // STEP 2 — Create Razorpay order
      const amount = type === 'course' ? 9999 : 24999
      const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type }),
      })
      const orderData = await orderRes.json()

      if (!orderData.success) {
        setError('Failed to create payment order. Please try again.')
        setLoading(false)
        return
      }

      // STEP 3 — Load Razorpay
      const loaded = await loadRazorpay()
      if (!loaded) {
        setError('Failed to load payment gateway. Check your internet connection.')
        setLoading(false)
        return
      }

      // STEP 4 — Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'AskAkashSharma',
        description: type === 'course'
          ? 'Stock Market Mastery Programme'
          : '1-on-1 Trading Session',
        order_id: orderData.order.id,
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          type,
        },
        theme: {
          color: '#C9A84C',
        },
        handler: async function(response) {
          // Close Razorpay modal first
          setLoading(true)
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name: formDataRef.current?.name || data.name,
                email: formDataRef.current?.email || data.email,
                phone: formDataRef.current?.phone || data.phone,
                type,
              }),
            })
            const verifyData = await verifyRes.json()
            console.log('Verify response:', verifyData)

            // Always redirect on payment success
            // Backend handles everything else
            navigate(type === 'course' ? '/success/course' : '/success/1on1')

          } catch (err) {
            console.error('Verify error:', err)
            // Still redirect — payment hua hai
            navigate(type === 'course' ? '/success/course' : '/success/1on1')
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            setError('Payment cancelled. Try again when ready.')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function(response) {
        setError(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      console.error('Payment error:', err)
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100svh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px 40px',
      background: 'var(--bg-primary)'
    }}>
      {error && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#FCEBEB',
          border: '1px solid #E24B4A',
          color: '#E24B4A',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 14,
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {error}
        </div>
      )}
      <EnrollForm
        type={type}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </main>
  )
}
