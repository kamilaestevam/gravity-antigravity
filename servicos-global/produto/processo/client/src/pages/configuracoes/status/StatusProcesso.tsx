/**
 * StatusProcesso — Configuracao dos status do processo + rule builder.
 *
 * Cada status tem:
 * - nome, cor, ordem (definem a linha do tempo)
 * - regras automaticas: condicoes em cima de campos (Dados do Processo
 *   ou Pedido) que determinam quando esse status se aplica
 * - operador: AND (todas as regras) ou OR (qualquer uma)
 *
 * O sistema avalia as regras e atribui automaticamente o status ao
 * processo. A ordem define a sequencia da timeline na Visao Geral.
 */

import React, { useState } from 'react'
import {
  Plus, Trash, DotsSixVertical, CaretDown, Funnel, X,
  WarningCircle, CheckCircle, FloppyDisk, PencilSimple,
} from '@phosphor-icons/react'
import './StatusProcesso.css'

// ── Tipos ──────────────────────────────────────────────────────────────────

type FieldSource = 'dados_processo' | 'pedido'

type CondicaoTipo =
  | 'vazio' | 'preenchido'
  | 'igual' | 'diferente'
  | 'maior_que' | 'menor_que'
  | 'contem'

interface CampoOpcao {
  key: string
  label: string
  tipo: 'texto' | 'numero' | 'data' | 'select'
}

interface Regra {
  id: string
  origem: FieldSource
  campo: string
  condicao: CondicaoTipo
  valor?: string
}

interface StatusConfig {
  id: string
  nome: string
  cor: string
  ordem: number
  operador: 'AND' | 'OR'
  regras: Regra[]
}

// ── Catalogo de campos disponiveis para regras ─────────────────────────────

const CAMPOS_DADOS_PROCESSO: CampoOpcao[] = [
  { key: 'numero_processo',  label: 'Número do Processo',  tipo: 'texto' },
  { key: 'data_abertura',    label: 'Data de Abertura',    tipo: 'data' },
  { key: 'data_embarque',    label: 'Data de Embarque',    tipo: 'data' },
  { key: 'data_chegada',     label: 'Data de Chegada',     tipo: 'data' },
  { key: 'ref_cliente',      label: 'Referência Cliente',  tipo: 'texto' },
  { key: 'responsavel',      label: 'Responsável',         tipo: 'texto' },
  { key: 'despachante',      label: 'Despachante',         tipo: 'texto' },
  { key: 'incoterm',         label: 'Incoterm',            tipo: 'texto' },
  { key: 'canal',            label: 'Canal',               tipo: 'select' },
  { key: 'tipo_decl',        label: 'Tipo de Declaração',  tipo: 'select' },
  { key: 'bl_awb',           label: 'BL / AWB',            tipo: 'texto' },
  { key: 'di_numero',        label: 'DI Nº',               tipo: 'texto' },
  { key: 'li_numero',        label: 'LI Nº',               tipo: 'texto' },
]

const CAMPOS_PEDIDO: CampoOpcao[] = [
  { key: 'numero_pedido',    label: 'Número do Pedido',    tipo: 'texto' },
  { key: 'status_pedido',    label: 'Status do Pedido',    tipo: 'select' },
  { key: 'valor_fob',        label: 'Valor FOB',           tipo: 'numero' },
  { key: 'peso_bruto',       label: 'Peso Bruto',          tipo: 'numero' },
  { key: 'data_pedido',      label: 'Data do Pedido',      tipo: 'data' },
  { key: 'data_emb_prev',    label: 'Data Embarque Prev.', tipo: 'data' },
]

function camposPara(origem: FieldSource): CampoOpcao[] {
  return origem === 'dados_processo' ? CAMPOS_DADOS_PROCESSO : CAMPOS_PEDIDO
}

const ROTULO_CONDICAO: Record<CondicaoTipo, string> = {
  vazio:       'é vazio',
  preenchido:  'está preenchido',
  igual:       'é igual a',
  diferente:   'é diferente de',
  maior_que:   'é maior que',
  menor_que:   'é menor que',
  contem:      'contém',
}

function precisaValor(c: CondicaoTipo): boolean {
  return c !== 'vazio' && c !== 'preenchido'
}

// ── Cores predefinidas ────────────────────────────────────────────────────

const CORES = [
  '#94a3b8', '#60a5fa', '#34d399', '#fbbf24',
  '#a78bfa', '#f472b6', '#fb923c', '#f87171',
]

// ── Mock inicial: status padrao do processo ───────────────────────────────

let _seq = 0
const novoId = () => `r${Date.now()}-${++_seq}`

const STATUS_INICIAIS: StatusConfig[] = [
  {
    id: 's1', nome: 'Rascunho', cor: '#94a3b8', ordem: 1, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'numero_processo', condicao: 'vazio' },
    ],
  },
  {
    id: 's2', nome: 'Aberto', cor: '#60a5fa', ordem: 2, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'numero_processo', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'data_embarque',   condicao: 'vazio' },
    ],
  },
  {
    id: 's3', nome: 'Em Embarque', cor: '#a78bfa', ordem: 3, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'data_embarque', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'data_chegada',  condicao: 'vazio' },
    ],
  },
  {
    id: 's4', nome: 'Em Desembaraço', cor: '#fbbf24', ordem: 4, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'data_chegada', condicao: 'preenchido' },
      { id: novoId(), origem: 'dados_processo', campo: 'di_numero',    condicao: 'vazio' },
    ],
  },
  {
    id: 's5', nome: 'Concluído', cor: '#34d399', ordem: 5, operador: 'AND',
    regras: [
      { id: novoId(), origem: 'dados_processo', campo: 'di_numero', condicao: 'preenchido' },
    ],
  },
]

// ── Componente principal ───────────────────────────────────────────────────

export default function StatusProcesso() {
  const [statuses, setStatuses] = useState<StatusConfig[]>(STATUS_INICIAIS)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [dirty, setDirty] = useState(false)

  function toggleExpand(id: string) {
    setExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id); else novo.add(id)
      return novo
    })
  }

  function updateStatus(id: string, patch: Partial<StatusConfig>) {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
    setDirty(true)
  }

  function adicionarRegra(statusId: string) {
    setStatuses(prev => prev.map(s => s.id === statusId ? {
      ...s,
      regras: [...s.regras, {
        id: novoId(), origem: 'dados_processo', campo: 'numero_processo', condicao: 'preenchido',
      }],
    } : s))
    setDirty(true)
  }

  function removerRegra(statusId: string, regraId: string) {
    setStatuses(prev => prev.map(s => s.id === statusId ? {
      ...s,
      regras: s.regras.filter(r => r.id !== regraId),
    } : s))
    setDirty(true)
  }

  function updateRegra(statusId: string, regraId: string, patch: Partial<Regra>) {
    setStatuses(prev => prev.map(s => s.id === statusId ? {
      ...s,
      regras: s.regras.map(r => r.id === regraId ? { ...r, ...patch } : r),
    } : s))
    setDirty(true)
  }

  function novoStatus() {
    const id = `s${Date.now()}`
    setStatuses(prev => [...prev, {
      id, nome: 'Novo Status', cor: CORES[prev.length % CORES.length],
      ordem: prev.length + 1, operador: 'AND', regras: [],
    }])
    setExpandidos(prev => new Set(prev).add(id))
    setDirty(true)
  }

  function removerStatus(id: string) {
    setStatuses(prev => prev.filter(s => s.id !== id))
    setDirty(true)
  }

  function salvar() {
    // TODO: chamar API quando back estiver pronto
    console.log('Salvar:', statuses)
    setDirty(false)
  }

  function restaurarPadrao() {
    setStatuses(STATUS_INICIAIS)
    setDirty(false)
  }

  return (
    <div className="sp-pagina">
      {/* Header */}
      <div className="sp-header">
        <div>
          <h2>Status do Processo</h2>
          <p>
            Defina os status do processo e as regras que os disparam automaticamente.
            A <strong>ordem</strong> dos status determina a sequência da linha do tempo (Visão Geral).
          </p>
        </div>
        <button type="button" className="sp-btn sp-btn--primario" onClick={novoStatus}>
          <Plus size={14} weight="bold" /> Novo Status
        </button>
      </div>

      {/* Lista de status */}
      <div className="sp-lista">
        {statuses.map((status, idx) => {
          const expandido = expandidos.has(status.id)
          const semRegras = status.regras.length === 0
          return (
            <article key={status.id} className={`sp-status ${expandido ? 'sp-status--aberta' : ''}`}>
              <header className="sp-status-cabecalho">
                <DotsSixVertical size={16} weight="bold" className="sp-status-arrastar" />
                <span className="sp-status-ordem">{idx + 1}</span>
                <button
                  type="button"
                  className="sp-status-cor"
                  style={{ background: status.cor }}
                  title="Mudar cor"
                  onClick={() => {
                    // Cicla pra proxima cor da paleta
                    const i = CORES.indexOf(status.cor)
                    updateStatus(status.id, { cor: CORES[(i + 1) % CORES.length] })
                  }}
                />
                <input
                  type="text"
                  className="sp-status-nome"
                  value={status.nome}
                  onChange={e => updateStatus(status.id, { nome: e.target.value })}
                />

                <span className={`sp-status-pill ${semRegras ? 'sp-status-pill--vazia' : ''}`}>
                  {semRegras ? (
                    <><WarningCircle size={12} weight="fill" /> sem regras</>
                  ) : (
                    <><Funnel size={12} weight="duotone" /> {status.regras.length} {status.regras.length === 1 ? 'regra' : 'regras'}</>
                  )}
                </span>

                {/* Acoes inline: edit (lapis) + delete (lixo), padrao Pedido */}
                <div className="sp-status-acoes">
                  <button
                    type="button"
                    className={`sp-icone-btn ${expandido ? 'sp-icone-btn--ativa' : ''}`}
                    onClick={() => toggleExpand(status.id)}
                    title={expandido ? 'Fechar editor de regras' : 'Editar regras'}
                    aria-label={expandido ? 'Fechar editor de regras' : 'Editar regras'}
                  >
                    {expandido
                      ? <CaretDown size={14} weight="bold" />
                      : <PencilSimple size={14} weight="duotone" />}
                  </button>
                  <button
                    type="button"
                    className="sp-icone-btn sp-icone-btn--perigo"
                    onClick={() => removerStatus(status.id)}
                    title="Remover status"
                    aria-label="Remover status"
                  >
                    <Trash size={14} weight="duotone" />
                  </button>
                </div>
              </header>

              {expandido && (
                <div className="sp-regras">
                  <div className="sp-regras-cabecalho">
                    <span className="sp-regras-titulo">
                      Combinar regras com:
                    </span>
                    <div className="sp-toggle-operador">
                      {(['AND', 'OR'] as const).map(op => (
                        <button
                          key={op}
                          type="button"
                          className={`sp-toggle-btn ${status.operador === op ? 'sp-toggle-btn--ativa' : ''}`}
                          onClick={() => updateStatus(status.id, { operador: op })}
                        >
                          {op === 'AND' ? 'E (todas)' : 'OU (qualquer uma)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {status.regras.length === 0 ? (
                    <div className="sp-regras-vazio">
                      <WarningCircle weight="duotone" size={24} />
                      <p>Status sem regras nunca é disparado automaticamente. Adicione ao menos uma regra.</p>
                    </div>
                  ) : (
                    <div className="sp-regras-lista">
                      {status.regras.map((regra, idxRegra) => (
                        <div key={regra.id} className="sp-regra">
                          {idxRegra > 0 && (
                            <span className="sp-regra-operador">{status.operador === 'AND' ? 'E' : 'OU'}</span>
                          )}
                          {idxRegra === 0 && <span className="sp-regra-prefixo">se</span>}
                          <select
                            value={regra.origem}
                            onChange={e => {
                              const nova = e.target.value as FieldSource
                              updateRegra(status.id, regra.id, {
                                origem: nova,
                                campo: camposPara(nova)[0].key,
                              })
                            }}
                          >
                            <option value="dados_processo">Dados do Processo</option>
                            <option value="pedido">Pedido</option>
                          </select>
                          <span className="sp-regra-conector">›</span>
                          <select
                            value={regra.campo}
                            onChange={e => updateRegra(status.id, regra.id, { campo: e.target.value })}
                          >
                            {camposPara(regra.origem).map(c => (
                              <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                          </select>
                          <select
                            value={regra.condicao}
                            onChange={e => updateRegra(status.id, regra.id, { condicao: e.target.value as CondicaoTipo })}
                          >
                            {(Object.keys(ROTULO_CONDICAO) as CondicaoTipo[]).map(c => (
                              <option key={c} value={c}>{ROTULO_CONDICAO[c]}</option>
                            ))}
                          </select>
                          {precisaValor(regra.condicao) && (
                            <input
                              type="text"
                              className="sp-regra-valor"
                              placeholder="valor"
                              value={regra.valor ?? ''}
                              onChange={e => updateRegra(status.id, regra.id, { valor: e.target.value })}
                            />
                          )}
                          <button
                            type="button"
                            className="sp-regra-remover"
                            onClick={() => removerRegra(status.id, regra.id)}
                            title="Remover regra"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="sp-btn sp-btn--secundario sp-adicionar-regra"
                    onClick={() => adicionarRegra(status.id)}
                  >
                    <Plus size={12} weight="bold" /> Adicionar regra
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Barra de salvar */}
      {dirty && (
        <div className="sp-barra-salvar">
          <span><CheckCircle size={14} weight="duotone" /> Alterações não salvas</span>
          <div className="sp-barra-acoes">
            <button type="button" className="sp-btn sp-btn--secundario" onClick={restaurarPadrao}>
              Restaurar padrão
            </button>
            <button type="button" className="sp-btn sp-btn--primario" onClick={salvar}>
              <FloppyDisk size={14} weight="bold" /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
