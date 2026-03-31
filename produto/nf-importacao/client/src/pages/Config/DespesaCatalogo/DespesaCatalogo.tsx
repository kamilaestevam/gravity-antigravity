import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { Package } from '@phosphor-icons/react'

export default function DespesaCatalogo() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Package weight="duotone" size={22} />}
          titulo="Catalogo de Despesas"
          subtitulo="Gerencie o catalogo de despesas da empresa"
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <Package weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}
