import { useTranslation } from 'react-i18next'
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
  tituloKey: string
  descricaoKey: string
}

const canais: CanalOrigem[] = [
  { icone: FileCode, tituloKey: 'nf_importacao.origem.xml', descricaoKey: 'nf_importacao.origem.xml_desc' },
  { icone: FileSearch, tituloKey: 'nf_importacao.origem.pdf', descricaoKey: 'nf_importacao.origem.pdf_desc' },
  { icone: Globe, tituloKey: 'nf_importacao.origem.portal', descricaoKey: 'nf_importacao.origem.portal_desc' },
  { icone: Link, tituloKey: 'nf_importacao.origem.processo', descricaoKey: 'nf_importacao.origem.processo_desc' },
  { icone: Database, tituloKey: 'nf_importacao.origem.erp', descricaoKey: 'nf_importacao.origem.erp_desc' },
  { icone: PencilLine, tituloKey: 'nf_importacao.origem.manual', descricaoKey: 'nf_importacao.origem.manual_desc' },
]

export default function NfNovaOrigem() {
  const { t } = useTranslation()
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Plus weight="duotone" size={22} />}
          titulo={t('nf_importacao.nova_nf')}
          subtitulo={t('nf_importacao.selecione_origem')}
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
              key={canal.tituloKey}
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
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t(canal.tituloKey)}</p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--ws-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  {t(canal.descricaoKey)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </PaginaGlobal>
  )
}
