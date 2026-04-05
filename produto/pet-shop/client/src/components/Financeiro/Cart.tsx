import React, { useState } from 'react';
import './Financeiro.css';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, onRemoveItem, onUpdateQuantity, onCheckout, isOpen, onClose }) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Seu Carrinho</h2>
          <button className="cart-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Seu carrinho está vazio.</p>
              <p className="cart-empty-sub">Adicione alguns mimos para o seu pet!</p>
            </div>
          ) : (
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </span>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => onRemoveItem(item.id)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
            </div>
            <button className="cart-checkout-btn" onClick={onCheckout}>
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
