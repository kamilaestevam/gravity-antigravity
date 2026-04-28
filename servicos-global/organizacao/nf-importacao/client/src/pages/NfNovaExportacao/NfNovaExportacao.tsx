import { PaginaGlobal } from '@nucleo/pagina-global'
import { useTranslation } from 'react-i18next'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { DownloadSimple } from '@phosphor-icons/react'

export default function NfNovaExportacao() {
  const { t } = useTranslation()
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<DownloadSimple weight="duotone" size={22} />}
          titulo={t('nf_importacao.exportacao.titulo')}
          subtitulo={t('nf_importacao.exportacao.subtitulo')}
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <DownloadSimple weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>{t('nf_importacao.em_desenvolvimento')}</p>
      </div>
    </PaginaGlobal>
  )
}
