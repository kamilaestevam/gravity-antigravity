/**
 * TodosProcessosKanban — visualizacao KANBAN dos processos do workspace,
 * com colunas por etapa do workflow (Abertura > Pedido > LI > Embarque >
 * Desembaraco > Entrega > Concluido).
 *
 * Cada card mostra: numero, importador/exportador, valor, peso,
 * responsavel, dias decorridos.
 */

import React, { useState, useMemo } from 'react'
import {
  Briefcase, Kanban, Plus, MagnifyingGlass, X, CurrencyDollar,
  Package, User, CalendarBlank, Globe, ArrowRight,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TodosProcessosTabs } from './TodosProcessosTabs'
import {
  MOCK_PROCESSOS, ORDEM_ETAPAS, ETAPAS_LABEL, ETAPAS_COR,
  fmtMoeda, fmtPeso,
  type EtapaProcesso, type ProcessoLinha,
} from './_mocks'
import './TodosProcessos.css'

function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default function TodosProcessosKanban({ embedTabs = true }: { embedTabs?: boolean }) {
  const [busca, setBusca] = useState('')

  const buscaNorm = busca.trim().toLowerCase()
  const processosFiltrados = useMemo(() => {
    if (!buscaNorm) return MOCK_PROCESSOS
    return MOCK_PROCESSOS.filter(p =>
      p.numero.toLowerCase().includes(buscaNorm)
      || p.importador.toLowerCase().includes(buscaNorm)
      || p.exportador.toLowerCase().includes(buscaNorm)
      || p.responsavel.toLowerCase().includes(buscaNorm)
    )
  }, [buscaNorm])

  // Agrupa processos por etapa
  const porEtapa = useMemo(() => {
    const mapa: Record<EtapaProcesso, ProcessoLinha[]> = {
      abertura: [], pedido: [], li: [], embarque: [],
      desembaraco: [], entrega: [], concluido: [],
    }
    for (const p of processosFiltrados) {
      mapa[p.etapa_atual].push(p)
    }
    return mapa
  }, [processosFiltrados])

  function abrirProcesso(p: ProcessoLinha) {
    window.location.href = `/acesso-processos/${p.id}/workflow`
  }

  return (
    <PaginaGlobal
      className="ws-fade-up processo-kanban-page"
      layout="lista"
      cabecalho={
        embedTabs ? (
          <CabecalhoGlobal
            icone={<Kanban weight="duotone" size={22} />}
            titulo="Kanban"
            subtitulo="Processos do workspace agrupados por etapa"
          />
        ) : undefined
      }
      toolbar={embedTabs ? <TodosProcessosTabs /> : undefined}
    >
      {/* Toolbar */}
      <div className="tp-kb-toolbar">
        <div className="tp-kb-busca">
          <MagnifyingGlass weight="duotone" size={14} />
          <input
            type="text"
            placeholder="Buscar processo…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          {busca && (
            <button type="button" onClick={() => setBusca('')} title="Limpar">
              <X size={12} weight="bold" />
            </button>
          )}
        </div>
        <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
          Novo Processo
        </BotaoGlobal>
      </div>

      {/* Kanban: 7 colunas, scroll horizontal */}
      <div className="tp-kb-board">
        {ORDEM_ETAPAS.map(etapa => {
          const processos = porEtapa[etapa]
          const cor = ETAPAS_COR[etapa]
          return (
            <div key={etapa} className="tp-kb-coluna">
              <header className="tp-kb-coluna-head" style={{ borderTopColor: cor }}>
                <span className="tp-kb-coluna-dot" style={{ background: cor }} />
                <h3 style={{ color: cor }}>{ETAPAS_LABEL[etapa]}</h3>
                <span className="tp-kb-coluna-contagem">{processos.length}</span>
              </header>

              <div className="tp-kb-cards">
                {processos.length === 0 ? (
                  <div className="tp-kb-vazio">Nenhum processo</div>
                ) : (
                  processos.map(p => (
                    <article
                      key={p.id}
                      className="tp-kb-card"
                      onClick={() => abrirProcesso(p)}
                      style={{ borderLeftColor: cor }}
                    >
                      <div className="tp-kb-card-num">
                        {p.numero}
                        <ArrowRight weight="bold" size={11} className="tp-kb-card-arrow" />
                      </div>
                      <div className="tp-kb-card-clientes">
                        <div title={p.importador}>{p.importador}</div>
                        <div className="tp-kb-card-exportador" title={p.exportador}>
                          ← {p.exportador}
                        </div>
                      </div>
                      <div className="tp-kb-card-meta">
                        <span className="tp-kb-card-meta-item" title="Origem">
                          <Globe weight="duotone" size={11} /> {p.pais_origem}
                        </span>
                        <span className="tp-kb-card-meta-item" title="Incoterm">
                          {p.incoterm}
                        </span>
                        <span className="tp-kb-card-meta-item" title="Via">
                          {p.via_transporte}
                        </span>
                      </div>
                      <div className="tp-kb-card-valores">
                        <span><CurrencyDollar weight="duotone" size={11} /> {fmtMoeda(p.valor_fob, p.moeda)}</span>
                        <span><Package weight="duotone" size={11} /> {fmtPeso(p.peso_bruto)}</span>
                      </div>
                      <footer className="tp-kb-card-footer">
                        <span className="tp-kb-card-resp" title={`Responsável: ${p.responsavel}`}>
                          <User weight="duotone" size={11} /> {p.responsavel.split(' ')[0]}
                        </span>
                        <span className="tp-kb-card-dias" title="Dias desde abertura">
                          <CalendarBlank weight="duotone" size={11} /> {diasDesde(p.data_abertura)}d
                        </span>
                      </footer>
                    </article>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </PaginaGlobal>
  )
}
