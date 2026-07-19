/**
 * pagina-carregando-estimativa-custo — spinner central padrão do produto.
 * Paridade pagina-carregando-bid-frete-internacional: GravityLoader orbital.
 */
import { GravityLoader } from '@nucleo/gravity-loader-global'
import './pagina-carregando-estimativa-custo.css'

export function ConteudoCarregandoEstimativaCusto() {
  return (
    <div className="ec-pagina-carregando" role="status" aria-live="polite" aria-busy="true">
      <GravityLoader tamanho="md" />
    </div>
  )
}
