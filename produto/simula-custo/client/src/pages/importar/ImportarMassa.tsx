/**
 * ImportarMassa.tsx — Tela de Importação em Massa
 * Fase 2 do produto — usa PaginaGlobal + CabecalhoGlobal.
 */
import React from 'react'
import { Upload } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

export default function ImportarMassa() {
  return (
    <PaginaGlobal
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          titulo="Importar em Massa"
          subtitulo="Carregue múltiplas simulações via planilha Excel ou CSV"
          icone={<Upload weight="duotone" size={22} />}
        />
      }
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'var(--ws-muted, #94a3b8)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        <Upload weight="duotone" size={48} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: '0.9375rem', maxWidth: 400 }}>
          Funcionalidade disponível na <strong style={{ color: 'var(--ws-accent, #818cf8)' }}>Fase 2</strong> do SimulaCusto.
        </p>
      </div>
    </PaginaGlobal>
  )
}
