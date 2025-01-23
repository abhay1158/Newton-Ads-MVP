import { useEffect } from 'react';

export function RazorpayButton() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pp-YDEH2YT8CZHN6 {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 2.5rem;
        padding: 0 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 0.375rem;
        background-color: #2563eb;
        color: white;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
        border: none;
        cursor: pointer;
        line-height: 1;
      }
      .pp-YDEH2YT8CZHN6:hover {
        background-color: #1d4ed8;
      }
      .payment-section {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
      }
      .payment-section img {
        height: 0.625rem;
        margin-top: 0.25rem;
      }
      .payment-section section {
        font-size: 0.625rem;
        color: #6B7280;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.125rem;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="payment-section">
      <form 
        action="https://www.paypal.com/ncp/payment/YDEH2YT8CZHN6" 
        method="post" 
        target="_top"
      >
        <input className="pp-YDEH2YT8CZHN6" type="submit" value="Add Funds" />
      </form>
      <section>
        via <img 
          src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" 
          alt="paypal" 
        />
      </section>
    </div>
  );
}