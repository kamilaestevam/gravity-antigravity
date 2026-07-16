import {
  ArrowRight,
  GitMerge,
  ListChecks,
  Package,
  Scales,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  rotuloPedidoGuiaPosConsolidacao,
  totalPassosGuiaPosConsolidacaoSimulador,
  type PassoGuiaPosConsolidacaoSimulador,
  type ResumoConsolidacaoListaSimulador,
} from './consolidar-lista-simulador-pedido'
import './guia-pos-consolidacao-simulador-pedido.css'

type Props = {
  passo: PassoGuiaPosConsolidacaoSimulador
  resumo: ResumoConsolidacaoListaSimulador
  onProximo: () => void
  onConcluir: () => void
  dataTutorialAlvo?: string
}

export function GuiaPosConsolidacaoSimuladorPedido({
  passo,
  resumo,
  onProximo,
  onConcluir,
  dataTutorialAlvo,
}: Props) {
  const totalPassos = totalPassosGuiaPosConsolidacaoSimulador()
  const rotuloConsolidado = rotuloPedidoGuiaPosConsolidacao(resumo.numeroConsolidado)

  return (
    <aside
      className="pds-cons-guia"
      aria-label="Guia pós-consolidação"
      {...(dataTutorialAlvo ? { 'data-sds-tutorial-alvo': dataTutorialAlvo } : {})}
    >
      <div className="pds-cons-guia__cabecalho">
        <p className="pds-cons-guia__meta">Pós-consolidação · passo {passo} de {totalPassos}</p>
        <div className="pds-cons-guia__progresso" aria-hidden>
          {Array.from({ length: totalPassos }, (_, i) => (
            <span key={i} className={passo >= i + 1 ? 'pds-cons-guia__progresso-item--ativo' : ''} />
          ))}
        </div>
      </div>

      {passo === 1 && (
        <div className="pds-cons-guia__card">
          <p className="pds-cons-guia__secao">
            <GitMerge size={13} weight="duotone" aria-hidden />
            Pedido consolidado
          </p>
          <p className="pds-cons-guia__intro">
            O <strong>{rotuloConsolidado}</strong> é o novo pedido único. Na lista ele aparece com destaque{' '}
            <span className="pds-cons-guia__legenda-consolidado">índigo</span> e status{' '}
            <strong>CONSOLIDADO</strong> — veja as colunas <strong>Nº pedido</strong> e <strong>Status</strong> destacadas.
          </p>
          <p className="pds-cons-guia__legenda">
            Uniu <strong>{resumo.pedidosOrigem}</strong> pedido{resumo.pedidosOrigem !== 1 ? 's' : ''} de origem em um só registro.
          </p>
          <BotaoGlobal variante="primario" tamanho="pequeno" iconeDireita={<ArrowRight size={14} weight="bold" />} onClick={onProximo}>
            Próximo: itens reunidos
          </BotaoGlobal>
        </div>
      )}

      {passo === 2 && (
        <div className="pds-cons-guia__card">
          <p className="pds-cons-guia__secao">
            <ListChecks size={13} weight="duotone" aria-hidden />
            Itens reunidos
          </p>
          <p className="pds-cons-guia__intro">
            Expanda o pedido (seta à esquerda) para ver os <strong>{resumo.itensConsolidados} itens</strong> que vieram dos pedidos de origem.
            Cada linha filha mantém seu número de item e também fica com status <strong>CONSOLIDADO</strong>.
          </p>
          <p className="pds-cons-guia__legenda">
            As colunas <strong>Nº Pedido / Nº Item</strong> e <strong>Status</strong> estão destacadas nas linhas filhas.
          </p>
          <BotaoGlobal variante="primario" tamanho="pequeno" iconeDireita={<ArrowRight size={14} weight="bold" />} onClick={onProximo}>
            Próximo: o que mudou
          </BotaoGlobal>
        </div>
      )}

      {passo === 3 && (
        <div className="pds-cons-guia__card pds-cons-guia__card--final">
          <p className="pds-cons-guia__secao">
            <Scales size={13} weight="duotone" aria-hidden />
            Valor e origens
          </p>
          <p className="pds-cons-guia__intro">
            O <strong>valor total</strong> do consolidado soma os pedidos de origem. Os pedidos abaixo{' '}
            <strong>saíram da lista</strong> (foram arquivados na consolidação):
          </p>
          <ul className="pds-cons-guia__lista-origem">
            {resumo.numerosPedidosOrigem.map((num) => (
              <li key={num}>{num}</li>
            ))}
          </ul>
          <p className="pds-cons-guia__legenda">
            <Package size={12} weight="duotone" style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Filtre por <strong>Consolidado</strong> nas pills de status para ver só pedidos unificados.
          </p>
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onConcluir}>
            Concluir
          </BotaoGlobal>
        </div>
      )}
    </aside>
  )
}
