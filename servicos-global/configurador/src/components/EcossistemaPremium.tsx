import React from 'react';
import './premium-ecosystem-puzzle.css';

/**
 * EcossistemaPremium
 * Componente premium que visualiza a integração dos módulos do Gravity.
 * Representa um "quebra-cabeça" onde as peças se encaixam e desencaixam.
 */
export function EcossistemaPremium() {
  return (
    <div className="puzzle-ecosystem-container" 
         title="Ecosistema Gravity: Módulos conectados em uma única plataforma.">
      <div className="puzzle-glow"></div>
      <div className="puzzle-canvas">
        {/* Peça 1: Top-Left (Logística) */}
        <div className="puzzle-piece p1">
          <svg viewBox="0 0 100 100">
            <path d="M100 50 C100 65 85 65 85 50 C85 35 100 35 100 50 M100 0 L0 0 L0 100 L50 100 C35 100 35 85 50 85 C65 85 65 100 80 100 L100 100 Z" fill="url(#p1-grad)" />
            <defs>
              <linearGradient id="p1-grad" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#4de8b0" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="piece-icon">🚢</div>
        </div>

        {/* Peça 2: Top-Right (Financeiro) */}
        <div className="puzzle-piece p2">
          <svg viewBox="0 0 100 100">
            <path d="M0 50 C0 65 15 65 15 50 C15 35 0 35 0 50 M0 0 L100 0 L100 100 L50 100 C65 100 65 85 50 85 C35 85 35 100 20 100 L0 100 Z" fill="url(#p2-grad)" />
            <defs>
              <linearGradient id="p2-grad" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <div className="piece-icon">💰</div>
        </div>

        {/* Peça 3: Bottom-Right (Fiscal) */}
        <div className="puzzle-piece p3">
          <svg viewBox="0 0 100 100">
            <path d="M0 50 C0 35 15 35 15 50 C15 65 0 65 0 50 M0 100 L100 100 L100 0 L50 0 C65 0 65 15 50 15 C35 15 35 0 20 0 L0 0 Z" fill="url(#p3-grad)" />
            <defs>
              <linearGradient id="p3-grad" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
          <div className="piece-icon">📄</div>
        </div>

        {/* Peça 4: Bottom-Left (AI) */}
        <div className="puzzle-piece p4">
          <svg viewBox="0 0 100 100">
            <path d="M100 50 C100 35 85 35 85 50 C85 65 100 65 100 50 M100 100 L0 100 L0 0 L50 0 C35 0 35 15 50 15 C65 15 65 0 80 0 L100 0 Z" fill="url(#p4-grad)" />
            <defs>
              <linearGradient id="p4-grad" x1="0" y1="0" x2="100" y2="100">
                <stop stopColor="#a78bfa" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className="piece-icon">✨</div>
        </div>
      </div>
      <div className="puzzle-text">
        <span className="premium-label">GRAVITY</span>
        <span className="ecosystem-title">ECOSYSTEM</span>
      </div>
    </div>
  );
}
