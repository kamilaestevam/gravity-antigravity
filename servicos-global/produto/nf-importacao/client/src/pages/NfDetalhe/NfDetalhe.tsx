import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FileText } from '@phosphor-icons/react'

export default function NfDetalhe() {
  const { t } = useTranslation()
  const abas = [
    { id: 'itens', label: t('nf_importacao.abas.itens') },
    { id: 'despesas', label: t('nf_importacao.abas.despesas') },
    { id: 'rateio', label: t('nf_importacao.abas.rateio') },
    { id: 'fiscal', label: t('nf_importacao.abas.fiscal') },
    { id: 'exportacao', label: t('nf_importacao.abas.exportacao') },
    { id: 'historico', label: t('nf_importacao.abas.historico') },
  ]
  const [abaAtiva, setAbaAtiva] = useState<string>(abas[0].id)

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={t('nf_importacao.detalhe_titulo')}
          subtitulo={t('nf_importacao.detalhe_subtitulo')}
        />
      }
    >
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              type="button"
              onClick={() => setAbaAtiva(aba.id)}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: abaAtiva === aba.id ? 600 : 400,
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: abaAtiva === aba.id ? 'var(--ws-accent)' : 'var(--ws-border)',
                background: abaAtiva === aba.id ? 'var(--ws-accent)' : 'transparent',
                color: abaAtiva === aba.id ? 'var(--ws-bg, #fff)' : 'var(--ws-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
          <FileText weight="duotone" size={48} style={{ opacity: 0.4 }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            {abas.find(a => a.id === abaAtiva)?.label} — {t('nf_importacao.em_desenvolvimento')}
          </p>
        </div>
      </div>
    </PaginaGlobal>
  )
}
