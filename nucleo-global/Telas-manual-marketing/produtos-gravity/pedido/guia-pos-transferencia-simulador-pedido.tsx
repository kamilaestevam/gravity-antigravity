import React, { type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowSquareIn,
  ArrowSquareOut,
  ChartBar,
  ListBullets,
  Scales,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  fmtQuantidadeSimulador,
  rotuloPedidoGuiaPosTransferencia,
  totalPassosGuiaPosTransferenciaSimulador,
  type PassoGuiaPosTransferenciaSimulador,
  type ResumoTransferenciaListaSimulador,
} from './transferir-lista-simulador-pedido'
import './guia-pos-transferencia-simulador-pedido.css'

type Props = {
  passo: PassoGuiaPosTransferenciaSimulador
  resumo: ResumoTransferenciaListaSimulador
  onProximo: () => void
  onConcluir: () => void
}

function resolverNumeroPedidoDestino(resumo: ResumoTransferenciaListaSimulador): string {
  return (resumo.pedidoNovoNumero ?? resumo.pedidosDestinoNumeros.find((n) => n.trim()) ?? '').trim()
}

type LinhaPedidoGuiaProps = {
  tipo: 'origem' | 'destino'
  children: ReactNode
}

function LinhaPedidoGuia({ tipo, children }: LinhaPedidoGuiaProps) {
  const Icone = tipo === 'origem' ? ArrowSquareOut : ArrowSquareIn
  return (
    <p className={`pds-transf-guia__linha-pedido pds-transf-guia__linha-pedido--${tipo}`}>
      <Icone size={14} weight="duotone" aria-hidden className="pds-transf-guia__linha-pedido-icone" />
      <span>{children}</span>
    </p>
  )
}

function LegendaDestaquesLista() {
  return (
    <p className="pds-transf-guia__legenda">
      Na lista: destaque <span className="pds-transf-guia__legenda-origem">laranja</span> = origem (saída) ·
      {' '}<span className="pds-transf-guia__legenda-destino">verde</span> = destino (entrada).
    </p>
  )
}

export function GuiaPosTransferenciaSimuladorPedido({ passo, resumo, onProximo, onConcluir }: Props) {
  const qtyOperacao = fmtQuantidadeSimulador(resumo.quantidadeTotal)
  const qtyTransferidaOrigem = fmtQuantidadeSimulador(
    resumo.quantidadeTransferidaAcumuladaOrigem ?? resumo.quantidadeTotal,
  )
  const qtyAnteriorOrigem = fmtQuantidadeSimulador(resumo.quantidadeTransferidaAnteriorOrigem ?? 0)
  const saldoOrigemAntes = fmtQuantidadeSimulador(resumo.saldoItemOrigemAntes ?? 0)
  const inicialOrigem = fmtQuantidadeSimulador(resumo.quantidadeInicialItemOrigem ?? 0)
  const inicialDestino = fmtQuantidadeSimulador(resumo.quantidadeInicialItemDestino ?? resumo.quantidadeTotal)
  const saldoOrigem = fmtQuantidadeSimulador(resumo.saldoItemOrigemApos ?? 0)
  const saldoDestino = fmtQuantidadeSimulador(resumo.saldoItemDestinoApos ?? resumo.quantidadeTotal)
  const destino = resolverNumeroPedidoDestino(resumo)
  const origem = resumo.pedidoOrigemNumero
  const rotuloOrigem = rotuloPedidoGuiaPosTransferencia(origem)
  const rotuloDestino = rotuloPedidoGuiaPosTransferencia(destino)
  const totalPassos = totalPassosGuiaPosTransferenciaSimulador()
  const tinhaTransferenciaAnterior = (resumo.quantidadeTransferidaAnteriorOrigem ?? 0) > 0

  return (
    <aside className="pds-transf-guia" aria-label="Guia pós-transferência">
      <div className="pds-transf-guia__cabecalho">
        <p className="pds-transf-guia__meta">Pós-transferência · passo {passo} de {totalPassos}</p>
        <div className="pds-transf-guia__progresso" aria-hidden>
          {Array.from({ length: totalPassos }, (_, i) => (
            <span key={i} className={passo >= i + 1 ? 'pds-transf-guia__progresso-item--ativo' : ''} />
          ))}
        </div>
      </div>

      {passo === 1 && (
        <div className="pds-transf-guia__card">
          <p className="pds-transf-guia__secao">
            <ListBullets size={13} weight="duotone" aria-hidden />
            Qtd. inicial
          </p>
          <p className="pds-transf-guia__intro">
            A <strong>qtd. inicial</strong> é definida quando o item nasce e <strong>fica congelada</strong> — transferências não alteram esse número; só o <strong>saldo</strong> muda depois.
          </p>
          <LegendaDestaquesLista />
          <div className="pds-transf-guia__linhas">
            {resumo.cenario === 'reducao_simples' ? (
              <LinhaPedidoGuia tipo="origem">
                No <strong>{rotuloOrigem}</strong>, a qtd. inicial do item permanece a mesma; só o saldo muda nos próximos passos.
              </LinhaPedidoGuia>
            ) : (
              <>
                <LinhaPedidoGuia tipo="origem">
                  <strong>{rotuloOrigem}</strong> (destaque laranja): qtd. inicial permanece <strong>{inicialOrigem}</strong> — igual a antes da transferência.
                </LinhaPedidoGuia>
                <LinhaPedidoGuia tipo="destino">
                  <strong>{rotuloDestino}</strong> (destaque verde): qtd. inicial é <strong>{inicialDestino}</strong> — o item nasceu com o que você transferiu agora (<strong>{qtyOperacao}</strong> un.).
                </LinhaPedidoGuia>
              </>
            )}
          </div>
          <BotaoGlobal variante="primario" tamanho="pequeno" iconeDireita={<ArrowRight size={14} weight="bold" />} onClick={onProximo}>
            Próximo: qtd. transferida
          </BotaoGlobal>
        </div>
      )}

      {passo === 2 && (
        <div className="pds-transf-guia__card">
          <p className="pds-transf-guia__secao">
            <ChartBar size={13} weight="duotone" aria-hidden />
            Qtd. transferida
          </p>
          <p className="pds-transf-guia__intro">
            Atenção: são <strong>dois conceitos diferentes</strong>. Nesta operação você transferiu <strong>{qtyOperacao} un.</strong> A coluna na origem, porém, mostra o <strong>total acumulado</strong> de todas as transferências já feitas naquele item.
          </p>
          <LegendaDestaquesLista />
          <div className="pds-transf-guia__linhas">
            {resumo.cenario === 'reducao_simples' ? (
              <LinhaPedidoGuia tipo="origem">
                No <strong>{rotuloOrigem}</strong>, a coluna mostra <strong>{qtyOperacao}</strong> un. transferidas nesta operação.
              </LinhaPedidoGuia>
            ) : (
              <>
                <LinhaPedidoGuia tipo="destino">
                  <strong>{rotuloDestino}</strong> (verde): qtd. transferida <strong>zero</strong> — o item acabou de chegar e ainda não transferiu nada para outro pedido.
                </LinhaPedidoGuia>
                <LinhaPedidoGuia tipo="origem">
                  <strong>{rotuloOrigem}</strong> (laranja): na coluna aparece <strong>{qtyTransferidaOrigem}</strong> no total
                  {tinhaTransferenciaAnterior ? (
                    <>
                      {' '}= <strong>{qtyAnteriorOrigem}</strong> de transferências <em>anteriores</em> + <strong>{qtyOperacao}</strong> <em>desta vez</em>.
                      {' '}Por isso o número pode ser maior do que o que você digitou agora.
                    </>
                  ) : (
                    <> — tudo veio só desta operação.</>
                  )}
                </LinhaPedidoGuia>
              </>
            )}
          </div>
          <BotaoGlobal variante="primario" tamanho="pequeno" iconeDireita={<ArrowRight size={14} weight="bold" />} onClick={onProximo}>
            Próximo: saldo
          </BotaoGlobal>
        </div>
      )}

      {passo === 3 && (
        <div className="pds-transf-guia__card pds-transf-guia__card--saldos">
          <p className="pds-transf-guia__secao">
            <Scales size={13} weight="duotone" aria-hidden />
            Saldo
          </p>
          <p className="pds-transf-guia__intro">
            O <strong>saldo</strong> é o que ainda resta disponível no item. Ele cai só com o que saiu <em>nesta</em> operação (<strong>{qtyOperacao} un.</strong>). A qtd. inicial (<strong>{inicialOrigem}</strong> na origem) continua congelada.
          </p>
          <LegendaDestaquesLista />
          <div className="pds-transf-guia__linhas">
            {resumo.cenario === 'reducao_simples' ? (
              <LinhaPedidoGuia tipo="origem">
                No <strong>{rotuloOrigem}</strong>, o saldo caiu para <strong>{saldoOrigem}</strong> após a saída de <strong>{qtyOperacao}</strong> un.
              </LinhaPedidoGuia>
            ) : (
              <>
                <LinhaPedidoGuia tipo="destino">
                  <strong>{rotuloDestino}</strong> (verde): saldo <strong>{saldoDestino}</strong> — igual à qtd. inicial, porque tudo que chegou ainda está disponível.
                </LinhaPedidoGuia>
                <LinhaPedidoGuia tipo="origem">
                  <strong>{rotuloOrigem}</strong> (laranja): saldo caiu de <strong>{saldoOrigemAntes}</strong> para <strong>{saldoOrigem}</strong> (−<strong>{qtyOperacao}</strong> nesta operação).
                  {' '}Isso é independente do total <strong>{qtyTransferidaOrigem}</strong> na coluna de qtd. transferida (que soma o histórico).
                </LinhaPedidoGuia>
              </>
            )}
          </div>
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onConcluir}>
            Concluir
          </BotaoGlobal>
        </div>
      )}
    </aside>
  )
}
