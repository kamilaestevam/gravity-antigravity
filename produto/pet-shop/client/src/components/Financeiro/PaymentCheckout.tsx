import React, { useState } from 'react';
import './Financeiro.css';
import { CartItem } from './Cart';

interface PaymentCheckoutProps {
  items: CartItem[];
  onBackToCart: () => void;
  onSuccess: () => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ items, onBackToCart, onSuccess }) => {
  const [method, setMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states for credit card
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call and processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card glass-panel">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Pagamento Aprovado!</h2>
          <p>Obrigado por comprar conosco. Seu pet vai adorar!</p>
          <div className="success-receipt">
            <div className="receipt-row">
              <span>Valor Pago:</span>
              <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</strong>
            </div>
            <div className="receipt-row">
              <span>Método:</span>
              <span>{method === 'pix' ? 'PIX' : 'Cartão de Crédito'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-card glass-panel">
        <div className="checkout-header">
          <button className="back-btn" onClick={onBackToCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Voltar
          </button>
          <h2>Pagamento</h2>
        </div>

        <div className="checkout-summary">
          <span>Total a pagar:</span>
          <span className="checkout-total">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
        </div>

        <div className="payment-methods">
          <button
            type="button"
            className={`method-btn ${method === 'credit_card' ? 'active' : ''}`}
            onClick={() => setMethod('credit_card')}
          >
            💳 Cartão de Crédito
          </button>
          <button
            type="button"
            className={`method-btn ${method === 'pix' ? 'active' : ''}`}
            onClick={() => setMethod('pix')}
          >
            💠 PIX
          </button>
        </div>

        <form onSubmit={handleCheckout} className="payment-form">
          {method === 'credit_card' && (
            <div className="credit-card-fields animate-fade-in">
              <div className="form-group">
                <label>Nome no Cartão</label>
                <input
                  type="text"
                  required
                  placeholder="Nome impresso no cartão"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Número do Cartão</label>
                <input
                  type="text"
                  required
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Validade</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label>CVV</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'pix' && (
            <div className="pix-fields animate-fade-in">
              <div className="pix-qr-mock">
                 <div className="qr-code-placeholder">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                     <rect x="7" y="7" width="3" height="3"></rect>
                     <rect x="14" y="7" width="3" height="3"></rect>
                     <rect x="7" y="14" width="3" height="3"></rect>
                     <rect x="14" y="14" width="3" height="3"></rect>
                   </svg>
                 </div>
                 <p>Escaneie o QR Code ou copie o código abaixo</p>
                 <div className="pix-copy-paste">
                   <input type="text" readOnly value="00020126580014br.gov.bcb.pix0136..." />
                   <button type="button" onClick={() => alert('Código copiado!')}>Copiar</button>
                 </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`checkout-submit-btn ${isProcessing ? 'processing' : ''}`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : `Pagar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`}
          </button>
        </form>
      </div>
    </div>
  );
};
