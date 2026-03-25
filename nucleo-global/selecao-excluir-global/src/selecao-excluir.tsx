import React from 'react'
import { Warning, Trash } from '@phosphor-icons/react'
import { ModalGlobal } from '@nucleo/modal-global'
import { SelecaoExcluirProps } from './tipos'

export function SelecaoExcluirGlobal({
  aberto,
  titulo,
  descricao,
  nomeItem,
  aoConfirmar,
  aoCancelar
}: SelecaoExcluirProps) {
  return (
    <ModalGlobal
      aberto={aberto}
      aoFechar={aoCancelar}
      tamanho="md"
      titulo=""
      cabecalhoPersonalizado={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center', 
          padding: '2rem 2rem 0.75rem', 
          gap: '1rem' 
        }}>
          {/* Ícone Refinado */}
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%', 
            background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)', 
            border: '1px solid rgba(239, 68, 68, 0.15)',
            boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.03), inset 0 2px 8px rgba(239, 68, 68, 0.1)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ef4444',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />
            <Warning size={28} weight="duotone" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 700, 
              color: 'var(--text-primary, #f1f5f9)', 
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {titulo}
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary, #94a3b8)', 
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '480px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              {descricao}
            </p>
            
            {nomeItem && (
              <div style={{ 
                marginTop: '0.25rem', 
                padding: '0.75rem 1rem', 
                background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: '8px', 
                color: '#f87171', 
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.4,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
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
          justifyContent: 'center',
          gap: '0.75rem', 
          width: '100%', 
          padding: '0 2rem 2rem', 
          background: 'transparent'
        }}>
          {/* Botão Cancelar */}
          <button 
            type="button"
            style={{ 
              width: '180px', 
              height: '38px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid transparent',
              borderRadius: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onClick={aoCancelar}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Cancelar
          </button>
          
          {/* Botão Excluir */}
          <button 
            type="button"
            style={{ 
              width: '180px', 
              height: '38px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)', 
              color: '#ffffff', 
              border: '1px solid #b91c1c', 
              borderTopColor: '#ef4444',
              borderRadius: '8px', 
              fontWeight: 600, 
              fontSize: '0.875rem',
              cursor: 'pointer', 
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
            onClick={aoConfirmar}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Trash size={16} weight="bold" />
            Excluir
          </button>
        </div>
      )}
    >
      <div style={{ display: 'none' }} />
    </ModalGlobal>
  )
}
