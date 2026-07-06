import React from 'react'
import { CheckCircle, MinusCircle, FunnelSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

/** Manual Pedido § Edição em massa — regras do passo 2 (Revisão DE/PARA). */
export function ManualInfograficoPedidoListaEdicaoMassaPasso2Regras() {
  return (
    <div
      role="group"
      aria-label="Regras do passo 2 — revisar alterações na edição em massa"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 48%, rgba(251,191,36,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginBottom: 12,
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: '0 0 4px',
      }}>
        Passo 2 — Revisão
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        Confira o DE/PARA por pedido antes de aplicar.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(99,102,241,.08)', border: '1px solid rgba(129,140,248,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FunnelSimple size={16} weight="fill" color="#818cf8" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Todos</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Lista **completa** de pedidos/itens no preview — inclusive linhas **sem efeito**.')}
          </p>
        </div>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(245,158,11,.08)', border: '1px solid rgba(251,191,36,.32)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={16} weight="fill" color="#fbbf24" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Alterados</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Só registros onde o **valor muda** de fato — badge **será alterado**.')}
          </p>
        </div>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(71,85,105,.12)', border: '1px solid rgba(100,116,139,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MinusCircle size={16} weight="fill" color="#64748b" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Sem efeito</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Valor novo **igual ao atual** — não grava no banco; badge **sem alteração**.')}
          </p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '.66rem', lineHeight: 1.45, color: CORPO_70 }}>
        {renderizarNegrito('Com **2+ pedidos**, use o filtro por **PO** para focar um pedido. Banners avisam **tipos de operação mistos**, **auto-fill de CNPJ** ao trocar import/export, **workspace sem CNPJ** e **status crítico** antes de confirmar.')}
      </p>
    </div>
  )
}
