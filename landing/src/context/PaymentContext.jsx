/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

export const PaymentContext = createContext();

export function usePayment() {
  return useContext(PaymentContext);
}

export function PaymentProvider({ children }) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  return (
    <PaymentContext.Provider value={{ paymentSuccess, setPaymentSuccess }}>
      {children}
    </PaymentContext.Provider>
  );
}
