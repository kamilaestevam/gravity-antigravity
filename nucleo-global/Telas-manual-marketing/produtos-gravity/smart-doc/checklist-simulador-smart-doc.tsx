import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { CaretDown, ClipboardText, X } from '@phosphor-icons/react'
import type { TipoDocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  agruparChecklistPorSecao,
  montarResumoSecoesChecklistSimulador,
  obterChecklistPorRiscoSimulador,
  obterItensChecklistSimulador,
  vereditoSecaoChecklistSimulador,
  type ItemChecklistSimulador,
  type SecaoChecklistSimulador,
} from './dados-checklist-simulador-smart-doc'
import { calcularPercentualChecklistVerde, obterContagemChecklistSimulador } from './dados-riscos-simulador-smart-doc'
import './checklist-simulador-smart-doc.css'

function classeVeredito(veredito: string): string {
  switch (veredito) {
    case 'CONFORME':
      return 'sds-chk-veredito--verde'
    case 'ATENÇÃO':
      return 'sds-chk-veredito--amarelo'
    case 'FALHA':
      return 'sds-chk-veredito--vermelho'
    default:
      return 'sds-chk-veredito--pendente'
  }
}

export function BarraStatusChecklistSimulador({
  verde,
  amarelo,
  vermelho,
  pendente,
  total,
  classe = '',
}: {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  total: number
  classe?: string
}) {
  if (total <= 0) return null
  return (
    <div className={`sds-chk-barra-status${classe ? ` ${classe}` : ''}`} aria-hidden>
      {vermelho > 0 && <span className="sds-chk-barra--vermelho" style={{ width: `${(vermelho / total) * 100}%` }} />}
      {amarelo > 0 && <span className="sds-chk-barra--amarelo" style={{ width: `${(amarelo / total) * 100}%` }} />}
      {pendente > 0 && <span className="sds-chk-barra--pendente" style={{ width: `${(pendente / total) * 100}%` }} />}
      {verde > 0 && <span className="sds-chk-barra--verde" style={{ width: `${(verde / total) * 100}%` }} />}
    </div>
  )
}

function ResumoContagemChecklistSimulador({
  verde,
  amarelo,
  vermelho,
  pendente,
  classe = '',
}: {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  classe?: string
}) {
  return (
    <div className={`sds-chk-contagem${classe ? ` ${classe}` : ''}`} aria-label="Resumo do checklist">
      <span className="sds-chk-contagem-pill sds-chk-contagem-pill--verde">{verde} ok</span>
      <span className="sds-chk-contagem-pill sds-chk-contagem-pill--amarelo">{amarelo} atenção</span>
      <span className="sds-chk-contagem-pill sds-chk-contagem-pill--vermelho">{vermelho} falha</span>
      <span className="sds-chk-contagem-pill sds-chk-contagem-pill--pendente">{pendente} pendente</span>
    </div>
  )
}

function TabelaChecklistSimulador({
  itens,
  idPrefixo,
  idTabela,
}: {
  itens: ItemChecklistSimulador[]
  idPrefixo: string
  idTabela?: string
}) {
  return (
    <div className="sr-conf-chk-tabela-wrap">
      <table id={idTabela} className="sr-conf-chk-tabela">
        <thead>
          <tr>
            <th scope="col" className="sr-conf-chk-col-check">
              <span className="sr-conf-chk-th-check">✓</span>
            </th>
            <th scope="col" className="sr-conf-chk-col-regra">
              Regra
            </th>
            <th scope="col" className="sr-conf-chk-col-item">
              Item verificado
            </th>
            <th scope="col" className="sr-conf-chk-col-resultado">
              Resultado
            </th>
            <th scope="col" className="sr-conf-chk-col-status">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {itens.map((linha) => (
            <tr key={`${idPrefixo}-${linha.id}`} className={`sr-conf-chk-linha sr-conf-chk-linha--${linha.status}`}>
              <td className="sr-conf-chk-col-check">
                <input type="checkbox" className="sr-conf-chk-checkbox" disabled aria-hidden tabIndex={-1} />
              </td>
              <td className="sr-conf-chk-col-regra">
                <span className="sr-conf-chk-regra-id">{linha.id}</span>
              </td>
              <td className="sr-conf-chk-col-item">
                <span className="sr-conf-chk-item-nome">{linha.item}</span>
                <span className="sr-conf-chk-item-motor">{linha.motor}</span>
              </td>
              <td className="sr-conf-chk-col-resultado">
                <span className="sr-conf-chk-resultado">{linha.resultado}</span>
              </td>
              <td className="sr-conf-chk-col-status">
                <span className={`sr-conf-chk-veredito sds-chk-veredito ${classeVeredito(linha.rotuloStatus)}`}>
                  {linha.rotuloStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SecaoChecklistSimulador({
  secao,
  aberta,
  onToggle,
  idPrefixo,
  secaoRef,
  cabecalhoFixo = false,
}: {
  secao: SecaoChecklistSimulador
  aberta: boolean
  onToggle: () => void
  idPrefixo: string
  secaoRef?: (el: HTMLElement | null) => void
  cabecalhoFixo?: boolean
}) {
  const veredito = vereditoSecaoChecklistSimulador(secao.itens)
  const contagem = {
    verde: secao.itens.filter((i) => i.status === 'verde').length,
    amarelo: secao.itens.filter((i) => i.status === 'amarelo').length,
    vermelho: secao.itens.filter((i) => i.status === 'vermelho').length,
    pendente: secao.itens.filter((i) => i.status === 'pendente').length,
    total: secao.itens.length,
  }
  const falhas = secao.itens.filter((i) => i.status === 'vermelho' || i.status === 'amarelo').length
  const expandida = cabecalhoFixo || aberta

  const cabecalhoConteudo = (
    <>
      {!cabecalhoFixo && (
        <CaretDown
          weight="bold"
          size={12}
          className={`dt-caret${expandida ? '' : ' dt-caret--colapsado'}`}
          aria-hidden
        />
      )}
      <span className="sr-conf-checklist-secao-titulo">{secao.rotulo}</span>
      <BarraStatusChecklistSimulador
        verde={contagem.verde}
        amarelo={contagem.amarelo}
        vermelho={contagem.vermelho}
        pendente={contagem.pendente}
        total={contagem.total}
        classe="sr-conf-checklist-secao-barra"
      />
      <span className={`sr-conf-chk-veredito-secao sds-chk-veredito ${classeVeredito(veredito)}`}>{veredito}</span>
      {falhas > 0 && <span className="sr-conf-checklist-secao-falhas">{falhas} item(ns)</span>}
    </>
  )

  return (
    <section
      ref={secaoRef}
      id={`${idPrefixo}-secao-${secao.secao}`}
      className={`sr-conf-checklist-secao${expandida ? '' : ' sr-conf-checklist-secao--colapsada'}`}
    >
      {cabecalhoFixo ? (
        <div className="sr-conf-checklist-secao-header sr-conf-checklist-secao-header--fixo sr-conf-checklist-secao-header--com-barra">
          {cabecalhoConteudo}
        </div>
      ) : (
        <button
          type="button"
          className="sr-conf-checklist-secao-header sr-conf-checklist-secao-header--com-barra"
          onClick={onToggle}
          aria-expanded={expandida}
          aria-controls={`${idPrefixo}-secao-${secao.secao}-tabela`}
        >
          {cabecalhoConteudo}
        </button>
      )}
      {expandida && (
        <TabelaChecklistSimulador
          itens={secao.itens}
          idPrefixo={`${idPrefixo}-${secao.secao}`}
          idTabela={`${idPrefixo}-secao-${secao.secao}-tabela`}
        />
      )}
    </section>
  )
}

function secoesComProblema(secoes: SecaoChecklistSimulador[]): Set<string> {
  return new Set(
    secoes
      .filter((s) => vereditoSecaoChecklistSimulador(s.itens) !== 'CONFORME')
      .map((s) => s.secao),
  )
}

export function ChecklistCorpoSimuladorSmartDoc({
  tipo,
  idPrefixo = 'sds-chk',
  classeCorpo = 'sr-chk-modal-checklist-corpo',
  filtroRiscoId,
  secoesAbertasInicial,
  secaoFoco,
  todasSecoesAbertas = false,
}: {
  tipo: TipoDocumentoSimulador
  idPrefixo?: string
  classeCorpo?: string
  filtroRiscoId?: string
  secoesAbertasInicial?: Set<string>
  secaoFoco?: string | null
  todasSecoesAbertas?: boolean
}) {
  const secoes = useMemo(() => {
    if (filtroRiscoId) {
      return obterChecklistPorRiscoSimulador(tipo, filtroRiscoId)
    }
    return agruparChecklistPorSecao(obterItensChecklistSimulador(tipo))
  }, [tipo, filtroRiscoId])

  const [abertas, setAbertas] = useState<Set<string>>(() => secoesAbertasInicial ?? secoesComProblema(secoes))

  useEffect(() => {
    setAbertas(secoesAbertasInicial ?? secoesComProblema(secoes))
  }, [secoes, secoesAbertasInicial])

  useEffect(() => {
    if (!secaoFoco) return
    const el = document.getElementById(`${idPrefixo}-secao-${secaoFoco}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [secaoFoco, idPrefixo])

  if (secoes.length === 0) return null

  return (
    <div className={classeCorpo}>
      {secoes.map((secao) => (
        <SecaoChecklistSimulador
          key={secao.secao}
          secao={secao}
          aberta={todasSecoesAbertas || abertas.has(secao.secao)}
          cabecalhoFixo={todasSecoesAbertas}
          idPrefixo={idPrefixo}
          onToggle={() =>
            setAbertas((prev) => {
              const next = new Set(prev)
              if (next.has(secao.secao)) next.delete(secao.secao)
              else next.add(secao.secao)
              return next
            })
          }
        />
      ))}
    </div>
  )
}

export function ChecklistLinhaRiscoSimuladorSmartDoc({
  tipo,
  riscoId,
  anchorRef,
}: {
  tipo: TipoDocumentoSimulador
  riscoId: string
  anchorRef?: RefObject<HTMLDivElement | null>
}) {
  const secoes = obterChecklistPorRiscoSimulador(tipo, riscoId)
  if (secoes.length === 0) return null

  return (
    <div
      ref={anchorRef}
      id={`sds-risco-chk-inline-${riscoId}`}
      className="sr-risco-inline-checklist-anchor"
    >
      <ChecklistCorpoSimuladorSmartDoc
        tipo={tipo}
        filtroRiscoId={riscoId}
        todasSecoesAbertas
        idPrefixo={`sds-risco-chk-${riscoId}`}
        classeCorpo="sr-risco-inline-checklist-corpo"
      />
    </div>
  )
}

const VALOR_TODAS = '__todas__'

export function ModalChecklistSimuladorSmartDoc({
  aberto,
  onFechar,
  tipo,
  rotuloDocumento,
  nomeArquivo,
}: {
  aberto: boolean
  onFechar: () => void
  tipo: TipoDocumentoSimulador
  rotuloDocumento: string
  nomeArquivo: string
}) {
  const [filtro, setFiltro] = useState<string>(VALOR_TODAS)
  const [secaoFoco, setSecaoFoco] = useState<string | null>(null)
  const detalheRef = useRef<HTMLDivElement>(null)

  const itens = useMemo(() => obterItensChecklistSimulador(tipo), [tipo])
  const contagem = useMemo(() => obterContagemChecklistSimulador(tipo), [tipo])
  const percentual = calcularPercentualChecklistVerde(contagem)
  const resumoSecoes = useMemo(() => montarResumoSecoesChecklistSimulador(tipo), [tipo])
  const secoesDetalhe = useMemo(() => agruparChecklistPorSecao(itens), [itens])

  const mostrarDetalhe = filtro !== VALOR_TODAS
  const secoesAbertasDetalhe = useMemo(() => secoesComProblema(secoesDetalhe), [secoesDetalhe])
  const secoesAbertasComFoco = useMemo(() => {
    if (!secaoFoco) return secoesAbertasDetalhe
    return new Set([secaoFoco, ...secoesAbertasDetalhe])
  }, [secaoFoco, secoesAbertasDetalhe])

  useEffect(() => {
    if (aberto) {
      setFiltro(rotuloDocumento)
      setSecaoFoco(null)
    }
  }, [aberto, rotuloDocumento, tipo])

  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', onKey)
    }
  }, [aberto, onFechar])

  function abrirDetalheInvoice(secaoDestaque?: string) {
    setFiltro(rotuloDocumento)
    setSecaoFoco(secaoDestaque ?? null)
    if (secaoDestaque) {
      window.setTimeout(() => {
        document.getElementById(`sds-chk-modal-secao-${secaoDestaque}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } else {
      window.setTimeout(() => detalheRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }

  if (!aberto) return null

  const vereditoGeral =
    contagem.vermelho > 0 ? 'FALHA' : contagem.amarelo > 0 ? 'ATENÇÃO' : contagem.pendente > 0 ? 'PENDENTE' : 'CONFORME'

  return createPortal(
    <div
      className="sds-chk-modal-overlay"
      role="dialog"
      aria-modal
      aria-label="Checklist de conferência completo"
      onClick={onFechar}
    >
      <div className="sds-chk-modal-painel" onClick={(e) => e.stopPropagation()}>
        <header className="sds-chk-modal-cabecalho">
          <div className="sds-chk-modal-cabecalho-esq">
            <ClipboardText size={22} weight="duotone" className="sds-chk-modal-icone" aria-hidden />
            <div>
              <strong className="sds-chk-modal-titulo">Checklist de Conferência</strong>
              <p className="sds-chk-modal-subtitulo">
                1 documento · {itens.length} avaliações · {percentual}% conforme
              </p>
            </div>
          </div>
          <ResumoContagemChecklistSimulador
            verde={contagem.verde}
            amarelo={contagem.amarelo}
            vermelho={contagem.vermelho}
            pendente={contagem.pendente}
            classe="sds-chk-contagem--cabecalho"
          />
          <button type="button" className="sds-chk-modal-fechar" onClick={onFechar} aria-label="Fechar checklist">
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="sds-chk-modal-corpo">
          <section className="sds-chk-info-card-unificado" aria-label="Resumo geral do checklist">
            <div className="sds-chk-info-card-unificado-corpo">
              <div className="sds-chk-info-topo-dir">
                <div className="sds-chk-info-invoice-topo-esq">
                  <button
                    type="button"
                    className={`sds-chk-info-invoice-card${mostrarDetalhe ? ' sds-chk-info-invoice-card--ativo' : ''}`}
                    onClick={() => abrirDetalheInvoice()}
                  >
                    <div className="sds-chk-info-invoice-topo">
                      <strong className="sds-chk-info-invoice-nome">{rotuloDocumento}</strong>
                      <span className={`sds-chk-info-veredito ${classeVeredito(vereditoGeral)}`}>{vereditoGeral}</span>
                    </div>
                    <span className="sds-chk-info-invoice-arquivo">{nomeArquivo}</span>
                    <span className="sds-chk-info-invoice-pct">{percentual}% conforme</span>
                    <BarraStatusChecklistSimulador
                      verde={contagem.verde}
                      amarelo={contagem.amarelo}
                      vermelho={contagem.vermelho}
                      pendente={contagem.pendente}
                      total={itens.length}
                      classe="sds-chk-info-invoice-barra"
                    />
                  </button>
                </div>

                <label className="sds-chk-select-label">
                  <span className="sds-chk-select-rotulo">Visão</span>
                  <select
                    className="sds-chk-select"
                    value={filtro}
                    onChange={(e) => {
                      const valor = e.target.value
                      setFiltro(valor)
                      setSecaoFoco(null)
                      if (valor !== VALOR_TODAS) {
                        window.setTimeout(() => detalheRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
                      }
                    }}
                    aria-label="Selecionar visão do checklist"
                  >
                    <option value={VALOR_TODAS}>Todas as seções</option>
                    <option value={rotuloDocumento}>{rotuloDocumento}</option>
                  </select>
                </label>
              </div>
            </div>

            {!mostrarDetalhe && (
              <>
                <div className="sds-chk-info-divisor" role="presentation" />
                <div className="sds-chk-secoes-resumo">
                  {resumoSecoes.map((secao) => (
                    <button
                      key={secao.secao}
                      type="button"
                      className="sds-chk-secao-resumo-card"
                      onClick={() => abrirDetalheInvoice(secao.secao)}
                    >
                      <div className="sds-chk-secao-resumo-topo">
                        <span className="sds-chk-secao-resumo-rotulo">{secao.rotulo}</span>
                        <span className={`sds-chk-veredito sr-conf-chk-veredito ${classeVeredito(secao.veredito)}`}>
                          {secao.veredito}
                        </span>
                      </div>
                      <BarraStatusChecklistSimulador
                        verde={secao.contagem.verde}
                        amarelo={secao.contagem.amarelo}
                        vermelho={secao.contagem.vermelho}
                        pendente={secao.contagem.pendente}
                        total={secao.contagem.total}
                        classe="sds-chk-secao-resumo-barra"
                      />
                      <span className="sds-chk-secao-resumo-contagem">
                        {secao.contagem.verde} ok · {secao.contagem.amarelo} atenção · {secao.contagem.vermelho} falha
                        {secao.contagem.pendente > 0 ? ` · ${secao.contagem.pendente} pendente` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          {mostrarDetalhe && (
            <div ref={detalheRef} className="sr-chk-info-detalhe-invoice">
              <ChecklistCorpoSimuladorSmartDoc
                tipo={tipo}
                idPrefixo="sds-chk-modal"
                secoesAbertasInicial={secoesAbertasComFoco}
                secaoFoco={secaoFoco}
              />
              <ResumoContagemChecklistSimulador
                verde={contagem.verde}
                amarelo={contagem.amarelo}
                vermelho={contagem.vermelho}
                pendente={contagem.pendente}
                classe="sds-chk-contagem--rodape"
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
