import React, { useState } from 'react';
import { 
  PaymentElement, 
  ExpressCheckoutElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

// Use a generic type for the confirm event
type ExpressCheckoutConfirmEventType = {
  paymentMethod?: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
};

const PaymentPage: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  
  const handleExpressCheckoutConfirm = async (event: ExpressCheckoutConfirmEventType): Promise<void> => {
    setPaymentProcessing(true);
    console.log('Express payment confirmed', event);
    // Add your success handling logic here
    setPaymentProcessing(false);
  };

  const handleCardSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setPaymentProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://your-site.com/payment-success',
      },
      redirect: 'if_required'
    });
    
    if (result.error) {
      console.log(result.error.message);
      // Show error to your customer
    } else {
      // Handle successful payment
      console.log('Payment succeeded');
    }
    
    setPaymentProcessing(false);
  };

  return (
    <div className="payment-container">
      <h2>Complete your payment</h2>
      
      {/* Express Checkout Options (Apple Pay, Google Pay) */}
      <div className="express-checkout-section" style={{marginBottom: "30px"}}>
        <h4>Quick Payment</h4>
        <div style={{minHeight: "50px"}}>
          <ExpressCheckoutElement onConfirm={handleExpressCheckoutConfirm} />
        </div>
      </div>
      
      {/* Separator */}
      <div style={{margin: "20px 0", textAlign: "center", position: "relative"}}>
        <span style={{backgroundColor: "#fff", padding: "0 10px", position: "relative", zIndex: 1}}>
          Or pay with card
        </span>
        <hr style={{margin: "-10px 0 0 0"}} />
      </div>
      
      {/* Card Payment Form */}
      <form onSubmit={handleCardSubmit}>
        <PaymentElement />
        <button 
          type="submit" 
          disabled={!stripe || paymentProcessing} 
          style={{marginTop: "16px", width: "100%", padding: "10px"}}
        >
          {paymentProcessing ? "Processing..." : "Pay now"}
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;