import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { DownloadSimple } from '@phosphor-icons/react'

export default function NfNovaExportacao() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<DownloadSimple weight="duotone" size={22} />}
          titulo="Exportacao"
          subtitulo="Revise e exporte a nota fiscal"
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <DownloadSimple weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}
