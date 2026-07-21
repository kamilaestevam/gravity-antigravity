/**
 * pagina-carregando-simula-custo — spinner central padrão do produto.
 * Paridade pagina-carregando-bid-frete-internacional: GravityLoader orbital.
 */
import { GravityLoader } from '@nucleo/gravity-loader-global'
import './pagina-carregando-simula-custo.css'

export function ConteudoCarregandoSimulaCusto() {
  return (
    <div className="ec-pagina-carregando" role="status" aria-live="polite" aria-busy="true">
      <GravityLoader tamanho="md" />
    </div>
  )
}
