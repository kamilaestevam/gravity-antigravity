/**
 * EtapaPreview.tsx — Etapa 3 do Smart Import
 * Mostra cada pedido que sera criado com:
 *  - Numero do pedido editavel pelo usuario
 *  - Todos os campos detectados do arquivo
 *  - Status ok/aviso/erro com alertas expandiveis
 */

import React, { useState, useMemo } from 'react'
import {
  CheckCircle,
  Warning,
  XCircle,
  CaretDown,
  CaretRight,
  PencilSimple,
  Check,
} from '@phosphor-icons/react'
import type { SmartImportLinha, DecisaoDuplicata } from '../../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaPreviewProps {
  linhas: SmartImportLinha[]
  linhasSelecionadas: Set<number>
  decisoesDuplicatas: Record<string, DecisaoDuplicata>
  numerosEditados: Record<number, string>
  onSelecaoChange: (linhas: Set<number>) => void
  onDecisaoDuplicata: (numeroPedido: string, decisao: DecisaoDuplicata) => void
  onNumeroEditado: (linhaArquivo: number, numero: string) => void
}

type FiltroPreview = 'todos' | 'ok' | 'aviso' | 'erro'

// ── Rotulos legíveis para os campos ──────────────────────────────────────────

const ROTULOS_CAMPO: Record<string, string> = {
  numero_pedido:       'Nº Pedido',
  exportador:          'Exportador (Shipper)',
  fabricante:          'Fabricante',
  incoterm:            'Incoterm',
  moeda_pedido:        'Moeda',
  data_emissao_pedido: 'Data Emissão',
  data_embarque:       'Data Embarque',
  part_number:         'Part Number',
  ncm:                 'NCM',
  descricao_item:      'Descrição do Item',
  quantidade_inicial_pedido:  'Quantidade',
  unidade:             'Unidade',
  valor_por_unidade_item:   'Valor do Item',
  valor_total_item:   'Valor Total',
}

function rotulo(campo: string): string {
  return ROTULOS_CAMPO[campo] ?? campo.replace(/_/g, ' ')
}

// ── Componente de status ──────────────────────────────────────────────────────

function IconeStatus({ status }: { status: SmartImportLinha['status'] }) {
  if (status === 'ok')    return <CheckCircle size={16} weight="fill" className="smart-import__status-ok"    aria-label="Ok"    />
  if (status === 'aviso') return <Warning     size={16} weight="fill" className="smart-import__status-aviso" aria-label="Aviso" />
  return                         <XCircle     size={16} weight="fill" className="smart-import__status-erro"  aria-label="Erro"  />
}

// ── Card de pedido ────────────────────────────────────────────────────────────

function CardPedido({
  linha,
  selecionada,
  decisao,
  numeroEditado,
  onToggle,
  onDecisao,
  onNumeroEditado,
}: {
  linha: SmartImportLinha
  selecionada: boolean
  decisao: DecisaoDuplicata | undefined
  numeroEditado: string | undefined
  onToggle: () => void
  onDecisao: (d: DecisaoDuplicata) => void
  onNumeroEditado: (v: string) => void
}) {
  const [expandidoAlertas, setExpandidoAlertas] = useState(false)
  const [expandidoCampos, setExpandidoCampos]   = useState(false)
  const [editandoNumero, setEditandoNumero]      = useState(false)
  const [numeroTemp, setNumeroTemp]              = useState('')

  const temDuplicata = linha.alertas.some(a => a.tipo === 'duplicado_sistema')
  const numeroAtual  = numeroEditado ?? linha.numero_pedido ?? '—'

  const camposVisiveis = Object.entries(linha.dados)
    .filter(([k]) => k !== 'numero_pedido')
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')

  function iniciarEdicao() {
    setNumeroTemp(numeroAtual)
    setEditandoNumero(true)
  }

  function confirmarEdicao() {
    if (numeroTemp.trim()) onNumeroEditado(numeroTemp.trim())
    setEditandoNumero(false)
  }

  return (
    <div
      className={`smart-import__card-pedido${selecionada ? ' smart-import__card-pedido--selecionado' : ' smart-import__card-pedido--desmarcado'}`}
      aria-selected={selecionada}
    >
      {/* Linha de cabeçalho do card */}
      <div className="smart-import__card-header">
        <input
          type="checkbox"
          checked={selecionada}
          onChange={onToggle}
          aria-label={`Selecionar pedido da linha ${linha.linha_arquivo}`}
          style={{ flexShrink: 0 }}
        />

        {/* Badge novo pedido */}
        {linha.status === 'ok' && !linha.alertas.some(a => a.tipo === 'duplicado_sistema') && (
          <span style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            NOVO PEDIDO
          </span>
        )}

        {/* Badge aviso — sera criado mas tem alertas */}
        {linha.status === 'aviso' && !temDuplicata && (
          <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM AVISO
          </span>
        )}

        {/* Badge erro — nao sera criado */}
        {linha.status === 'erro' && (
          <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '9999px', flexShrink: 0 }}>
            COM ERRO
          </span>
        )}

        {/* Número do pedido editável */}
        <div className="smart-import__numero-pedido-wrapper">
          {editandoNumero ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                className="smart-import__numero-input"
                value={numeroTemp}
                onChange={e => setNumeroTemp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmarEdicao(); if (e.key === 'Escape') setEditandoNumero(false) }}
                autoFocus
                aria-label="Numero do pedido"
              />
              <button type="button" className="smart-import__btn-icone" onClick={confirmarEdicao} aria-label="Confirmar">
                <Check size={14} weight="bold" />
              </button>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Enter ✓ · Esc ✕
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="smart-import__numero-pedido">{numeroAtual}</span>
              {linha.status !== 'erro' && (
                <button
                  type="button"
                  className="smart-import__btn-icone"
                  onClick={iniciarEdicao}
                  aria-label="Editar numero do pedido"
                  title="Editar número (Enter para confirmar, Esc para cancelar)"
                >
                  <PencilSimple size={13} weight="bold" />
                </button>
              )}
              {numeroEditado && (
                <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>editado</span>
              )}
            </div>
          )}
        </div>

        <IconeStatus status={linha.status} />

        {/* Exportador em destaque */}
        {linha.dados.exportador && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', flexShrink: 0 }}>
            {String(linha.dados.exportador)}
          </span>
        )}

        {/* Linha bruta */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginLeft: 'auto', flexShrink: 0 }}>
          linha {linha.linha_arquivo}
        </span>
      </div>

      {/* Decisão duplicata */}
      {temDuplicata && (
        <div className="smart-import__duplicata-aviso">
          <Warning size={13} weight="fill" style={{ color: '#f59e0b' }} aria-hidden="true" />
          <span>Pedido já existe no sistema.</span>
          <select
            className="drawer-pedido__select"
            style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem' }}
            value={decisao ?? 'pular'}
            onChange={e => onDecisao(e.target.value as DecisaoDuplicata)}
            aria-label="Decisao para pedido duplicado"
          >
            <option value="sobrescrever">Sobrescrever</option>
            <option value="criar">Criar mesmo assim</option>
            <option value="pular">Pular</option>
          </select>
        </div>
      )}

      {/* Diff preview ao sobrescrever */}
      {temDuplicata && decisao === 'sobrescrever' && (
        <div style={{
          marginTop: '0.375rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
        }}>
          <p style={{ margin: '0 0 0.375rem', fontWeight: 600, color: 'var(--accent, #6366f1)' }}>
            Campos que serão atualizados:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 0.75rem' }}>
            {Object.entries(linha.dados)
              .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
              .slice(0, 8)
              .map(([campo, valor]) => (
                <React.Fragment key={campo}>
                  <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{rotulo(campo)}:</span>
                  <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(valor)}</span>
                </React.Fragment>
              ))
            }
          </div>
          {Object.keys(linha.dados).length > 8 && (
            <p style={{ margin: '0.375rem 0 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              + {Object.keys(linha.dados).length - 8} outros campos
            </p>
          )}
        </div>
      )}

      {/* Campos detectados */}
      {camposVisiveis.length > 0 && (
        <div className="smart-import__campos-detectados">
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoCampos(v => !v)}
            aria-expanded={expandidoCampos}
          >
            {expandidoCampos
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {expandidoCampos
              ? 'Ocultar campos'
              : `Ver ${camposVisiveis.length} campo(s) detectado(s)`}
          </button>

          {expandidoCampos && (
            <div className="smart-import__campos-grid">
              {camposVisiveis.map(([campo, valor]) => (
                <div key={campo} className="smart-import__campo-item">
                  <span className="smart-import__campo-label">{rotulo(campo)}</span>
                  <span className="smart-import__campo-valor">{String(valor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      {linha.alertas.length > 0 && (
        <div>
          <button
            type="button"
            className="smart-import__expandir-campos"
            onClick={() => setExpandidoAlertas(v => !v)}
            aria-expanded={expandidoAlertas}
            style={{ color: linha.status === 'erro' ? '#ef4444' : '#f59e0b' }}
          >
            {expandidoAlertas
              ? <CaretDown size={11} aria-hidden="true" />
              : <CaretRight size={11} aria-hidden="true" />}
            {linha.alertas.length} alerta(s)
          </button>

          {expandidoAlertas && (
            <ul style={{ margin: '0.375rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
              {linha.alertas.map((a, i) => (
                <li key={i} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: a.nivel === 'erro' ? '#ef4444' : '#f59e0b', marginBottom: '0.25rem' }}>
                  {a.nivel === 'erro'
                    ? <XCircle size={12} weight="fill" aria-hidden="true" />
                    : <Warning size={12} weight="fill" aria-hidden="true" />}
                  <strong>{rotulo(a.campo)}:</strong> {a.mensagem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EtapaPreview({
  linhas,
  linhasSelecionadas,
  decisoesDuplicatas,
  numerosEditados,
  onSelecaoChange,
  onDecisaoDuplicata,
  onNumeroEditado,
}: EtapaPreviewProps) {
  const [filtro, setFiltro] = useState<FiltroPreview>('todos')
  const [filtroVisible, setFiltroVisible] = useState(true)

  const linhasFiltradas = useMemo(() => {
    if (filtro === 'todos') return linhas
    return linhas.filter(l => l.status === filtro)
  }, [linhas, filtro])

  function aplicarFiltro(novoFiltro: FiltroPreview) {
    setFiltroVisible(false)
    setTimeout(() => {
      setFiltro(novoFiltro)
      setFiltroVisible(true)
    }, 100)
  }

  const contadores = useMemo(() => ({
    ok:    linhas.filter(l => l.status === 'ok').length,
    aviso: linhas.filter(l => l.status === 'aviso').length,
    erro:  linhas.filter(l => l.status === 'erro').length,
  }), [linhas])

  const pedidosUnicosTotal = useMemo(() => {
    return new Set(linhas.map(l => l.numero_pedido).filter(Boolean)).size
  }, [linhas])

  const pedidosUnicosSelecionados = useMemo(() => {
    return new Set(
      linhas.filter(l => linhasSelecionadas.has(l.linha_arquivo)).map(l => l.numero_pedido).filter(Boolean)
    ).size
  }, [linhas, linhasSelecionadas])

  const duplicatas  = linhas.filter(l => l.alertas.some(a => a.tipo === 'duplicado_sistema'))
  const atualizados = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'sobrescrever').length
  const pulados     = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'pular').length
  const criados     = linhasSelecionadas.size

  function toggleLinha(linhaNum: number) {
    const novo = new Set(linhasSelecionadas)
    if (novo.has(linhaNum)) novo.delete(linhaNum)
    else novo.add(linhaNum)
    onSelecaoChange(novo)
  }

  function selecionarTodasValidas() {
    onSelecaoChange(new Set(linhas.filter(l => l.status === 'ok').map(l => l.linha_arquivo)))
  }

  function selecionarTodas() {
    onSelecaoChange(new Set(linhas.map(l => l.linha_arquivo)))
  }

  function desselecionarTodas() {
    onSelecaoChange(new Set())
  }

  return (
    <div>
      {/* Contador de resumo */}
      <div className="smart-import__contador" role="status">
        <span><strong>{pedidosUnicosSelecionados}</strong> pedido(s) de <strong>{pedidosUnicosTotal}</strong> únicos</span>
        <span>·</span>
        <span><strong>{criados}</strong> linha(s) incluídas</span>
        <span><strong>{atualizados}</strong> atualiz.</span>
        <span><strong>{pulados}</strong> pulados</span>
        {contadores.erro > 0 && (
          <span style={{ color: '#ef4444' }}><strong>{contadores.erro}</strong> com erro</span>
        )}
      </div>

      {/* Filtros + ações */}
      <div className="smart-import__filtros" role="group" aria-label="Filtrar pedidos">
        {(['todos', 'ok', 'aviso', 'erro'] as FiltroPreview[]).map(f => (
          <button
            key={f}
            className={`smart-import__filtro-btn${filtro === f ? ' smart-import__filtro-btn--ativo' : ''}`}
            onClick={() => aplicarFiltro(f)}
            aria-pressed={filtro === f}
          >
            {f === 'todos' && `Todos (${linhas.length})`}
            {f === 'ok'    && `Ok (${contadores.ok})`}
            {f === 'aviso' && `Aviso (${contadores.aviso})`}
            {f === 'erro'  && `Erro (${contadores.erro})`}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="smart-import__filtro-btn" onClick={selecionarTodasValidas}>
            Selecionar validas
          </button>
          <button className="smart-import__filtro-btn" onClick={() => {
            onSelecaoChange(new Set([
              ...Array.from(linhasSelecionadas),
              ...linhas.filter(l => l.status === 'aviso').map(l => l.linha_arquivo)
            ]))
          }}>
            + Incluir avisos
          </button>
          <button className="smart-import__filtro-btn" onClick={selecionarTodas}>
            Selecionar todas
          </button>
          <button className="smart-import__filtro-btn" onClick={desselecionarTodas}>
            Limpar selecao
          </button>
        </div>
      </div>

      {/* Cards de pedidos */}
      <div className="smart-import__cards-lista" style={{ transition: 'opacity 0.15s ease', opacity: filtroVisible ? 1 : 0 }}>
        {linhasFiltradas.map(linha => (
          <CardPedido
            key={linha.linha_arquivo}
            linha={linha}
            selecionada={linhasSelecionadas.has(linha.linha_arquivo)}
            decisao={decisoesDuplicatas[linha.numero_pedido ?? '']}
            numeroEditado={numerosEditados[linha.linha_arquivo]}
            onToggle={() => toggleLinha(linha.linha_arquivo)}
            onDecisao={d => onDecisaoDuplicata(linha.numero_pedido ?? '', d)}
            onNumeroEditado={v => onNumeroEditado(linha.linha_arquivo, v)}
          />
        ))}
      </div>
    </div>
  )
}
