import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { Columns } from '@phosphor-icons/react'

export default function ExportLayout() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Columns weight="duotone" size={22} />}
          titulo="Layouts de Exportacao"
          subtitulo="Configure o formato de saida para seu ERP"
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <Columns weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}
