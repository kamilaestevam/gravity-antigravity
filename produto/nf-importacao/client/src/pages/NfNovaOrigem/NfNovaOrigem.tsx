import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Plus,
  FileCode,
  FileSearch,
  Globe,
  Link,
  Database,
  PencilLine,
} from '@phosphor-icons/react'
import type { ComponentType } from 'react'

interface CanalOrigem {
  icone: ComponentType<{ weight: string; size: number }>
  titulo: string
  descricao: string
}

const canais: CanalOrigem[] = [
  {
    icone: FileCode,
    titulo: 'XML',
    descricao: 'Importar XML da nota fiscal eletronica',
  },
  {
    icone: FileSearch,
    titulo: 'PDF (Smart Read)',
    descricao: 'Extrair dados automaticamente de um PDF',
  },
  {
    icone: Globe,
    titulo: 'Portal Unico',
    descricao: 'Importar dados direto do Portal Unico Siscomex',
  },
  {
    icone: Link,
    titulo: 'Processo Gravity',
    descricao: 'Vincular a um processo existente no Gravity',
  },
  {
    icone: Database,
    titulo: 'ERP / API',
    descricao: 'Receber dados via integracao com seu ERP',
  },
  {
    icone: PencilLine,
    titulo: 'Manual',
    descricao: 'Preencher todos os campos manualmente',
  },
]

export default function NfNovaOrigem() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Plus weight="duotone" size={22} />}
          titulo="Nova NF Importacao"
          subtitulo="Selecione a origem dos dados"
        />
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
          padding: '1.5rem',
        }}
      >
        {canais.map((canal) => {
          const Icone = canal.icone
          return (
            <button
              key={canal.titulo}
              type="button"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.5rem 1rem',
                background: 'var(--ws-bg-card, var(--ws-surface))',
                border: '1px solid var(--ws-border)',
                borderRadius: 'var(--ws-radius, 8px)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                textAlign: 'center',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ws-accent)'
                e.currentTarget.style.boxShadow = '0 0 0 1px var(--ws-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ws-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Icone weight="duotone" size={32} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{canal.titulo}</p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--ws-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  {canal.descricao}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </PaginaGlobal>
  )
}
