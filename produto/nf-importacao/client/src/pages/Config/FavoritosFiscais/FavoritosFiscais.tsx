import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { Star } from '@phosphor-icons/react'

export default function FavoritosFiscais() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Star weight="duotone" size={22} />}
          titulo="Favoritos Fiscais"
          subtitulo="Presets de CFOP e CSTs por NCM"
        />
      }
    >
      <div style={{ padding: '2rem', color: 'var(--ws-muted)', textAlign: 'center' }}>
        <Star weight="duotone" size={48} style={{ opacity: 0.4 }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}
