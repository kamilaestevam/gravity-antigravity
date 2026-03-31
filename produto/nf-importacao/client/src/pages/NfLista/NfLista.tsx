import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { FileText } from '@phosphor-icons/react'

export default function NfLista() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo="Notas Fiscais"
          subtitulo="Lista de notas fiscais de importacao"
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <FileText weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}
