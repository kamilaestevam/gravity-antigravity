import React from 'react'
import { Warning, Trash } from '@phosphor-icons/react'
import { ModalGlobal } from '@nucleo/modal-global'

export interface ModalExclusaoProps {
  aberto: boolean
  titulo: string
  descricao: string | React.ReactNode
  nomeItem?: string
  aoConfirmar: () => void
  aoCancelar: () => void
}

export function ModalExclusao({
  aberto,
  titulo,
  descricao,
  nomeItem,
  aoConfirmar,
  aoCancelar
}: ModalExclusaoProps) {
  return (
    <ModalGlobal
      aberto={aberto}
      aoFechar={aoCancelar}
      tamanho="sm"
      titulo=""
      cabecalhoPersonalizado={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          padding: '2rem 1.5rem 0', 
          gap: '1.25rem' 
        }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '8px solid rgba(239, 68, 68, 0.03)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ef4444' 
          }}>
            <Warning size={32} weight="regular" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: 'var(--text-primary, #f8fafc)', 
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              {titulo}
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary, #94a3b8)', 
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '320px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              {descricao}
            </p>
            {nomeItem && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.875rem 1rem', 
                background: 'rgba(239, 68, 68, 0.05)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px', 
                color: '#ef4444', 
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.5
              }}>
                {nomeItem}
              </div>
            )}
          </div>
        </div>
      }
      renderizarFooter={() => (
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          width: '100%', 
          padding: '1.5rem', 
          background: 'transparent',
          marginTop: '0.5rem'
        }}>
          <button 
            type="button"
            style={{ 
              flex: 1, 
              height: '44px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              fontWeight: 600,
              background: 'var(--bg-elevated, rgba(255,255,255,0.05))',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={aoCancelar}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.1))'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated, rgba(255,255,255,0.05))'}
          >
            Cancelar
          </button>
          <button 
            type="button"
            style={{ 
              flex: 1, 
              height: '44px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: '#ef4444', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
            }}
            onClick={aoConfirmar}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.39)';
            }}
          >
            <Trash size={18} weight="bold" />
            Excluir
          </button>
        </div>
      )}
    >
      <div style={{ display: 'none' }} />
    </ModalGlobal>
  )
}
