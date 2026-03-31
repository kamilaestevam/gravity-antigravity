import { useState } from 'react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FileText } from '@phosphor-icons/react'

const abas = ['Itens', 'Despesas', 'Rateio', 'Fiscal', 'Exportacao', 'Historico'] as const

export default function NfDetalhe() {
  const [abaAtiva, setAbaAtiva] = useState<string>(abas[0])

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo="Detalhe da NF"
          subtitulo="Visualize todos os dados da nota fiscal"
        />
      }
    >
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {abas.map((aba) => (
            <button
              key={aba}
              type="button"
              onClick={() => setAbaAtiva(aba)}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: abaAtiva === aba ? 600 : 400,
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: abaAtiva === aba ? 'var(--ws-accent)' : 'var(--ws-border)',
                background: abaAtiva === aba ? 'var(--ws-accent)' : 'transparent',
                color: abaAtiva === aba ? 'var(--ws-bg, #fff)' : 'var(--ws-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {aba}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
          <FileText weight="duotone" size={48} style={{ opacity: 0.4 }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            {abaAtiva} — Em desenvolvimento
          </p>
        </div>
      </div>
    </PaginaGlobal>
  )
}
