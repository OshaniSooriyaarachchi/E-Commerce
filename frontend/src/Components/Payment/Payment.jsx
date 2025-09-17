import React, { useState, useContext } from 'react';
import './Payment.css';
import { ShopContext } from '../../Context/ShopContext';
import { backend_url } from '../../App';

const Payment = () => {
  const { getTotalCartAmount, cartItems } = useContext(ShopContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!localStorage.getItem('auth-token')) {
      alert('Please login to continue');
      return;
    }

    setIsProcessing(true);
    try {
      // Create payment intent
      const paymentResponse = await fetch(`${backend_url}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token'),
        },
        body: JSON.stringify({
          amount: getTotalCartAmount(),
          currency: 'lkr'
        }),
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        // Simulate payment processing (in real implementation, you'd use Stripe's frontend SDK)
        setTimeout(async () => {
          // Confirm payment
          const confirmResponse = await fetch(`${backend_url}/confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': localStorage.getItem('auth-token'),
            },
            body: JSON.stringify({
              paymentIntentId: paymentData.paymentIntentId,
              orderDetails: cartItems
            }),
          });

          const confirmData = await confirmResponse.json();
          
          if (confirmData.success) {
            setPaymentSuccess(true);
            alert('Payment successful! Your order has been placed.');
          } else {
            alert('Payment failed. Please try again.');
          }
          setIsProcessing(false);
        }, 3000);
      } else {
        alert('Failed to initialize payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2>Complete Your Payment</h2>
      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>LKR {getTotalCartAmount()}</span>
        </div>
        <div className="summary-item">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>LKR {getTotalCartAmount()}</span>
        </div>
      </div>
      
      <div className="payment-form">
        <div className="payment-note">
          <p>🔒 This is a demo payment system. No real charges will be made.</p>
          <p>In a real implementation, this would integrate with Stripe's secure payment forms.</p>
        </div>
        
        <button 
          className="pay-button"
          onClick={handlePayment}
          disabled={isProcessing || getTotalCartAmount() === 0}
        >
          {isProcessing ? 'Processing...' : `Pay LKR ${getTotalCartAmount()}`}
        </button>
      </div>
    </div>
  );
};

export default Payment;
