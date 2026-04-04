/**
 * EtapaPreview.tsx — Etapa 3 do Smart Import
 * Tabela de preview linha a linha com status ok/aviso/erro
 * Seleção em massa, filtros e decisao por duplicata
 */

import React, { useState, useMemo } from 'react'
import {
  CheckCircle,
  Warning,
  XCircle,
  CaretDown,
  CaretRight,
} from '@phosphor-icons/react'
import type { SmartImportLinha, DecisaoDuplicata } from '../../shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaPreviewProps {
  linhas: SmartImportLinha[]
  linhasSelecionadas: Set<number>
  decisoesDuplicatas: Record<string, DecisaoDuplicata>
  onSelecaoChange: (linhas: Set<number>) => void
  onDecisaoDuplicata: (numeroPedido: string, decisao: DecisaoDuplicata) => void
}

type FiltroPreview = 'todos' | 'ok' | 'aviso' | 'erro'

// ── Componente de status ──────────────────────────────────────────────────────

function IconeStatus({ status }: { status: SmartImportLinha['status'] }) {
  if (status === 'ok')    return <CheckCircle size={16} weight="fill" className="smart-import__status-ok"    aria-label="Ok"    />
  if (status === 'aviso') return <Warning     size={16} weight="fill" className="smart-import__status-aviso" aria-label="Aviso" />
  return                         <XCircle     size={16} weight="fill" className="smart-import__status-erro"  aria-label="Erro"  />
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EtapaPreview({
  linhas,
  linhasSelecionadas,
  decisoesDuplicatas,
  onSelecaoChange,
  onDecisaoDuplicata,
}: EtapaPreviewProps) {
  const [filtro, setFiltro]           = useState<FiltroPreview>('todos')
  const [expandidas, setExpandidas]   = useState<Set<number>>(new Set())

  const linhasFiltradas = useMemo(() => {
    if (filtro === 'todos') return linhas
    return linhas.filter(l => l.status === filtro)
  }, [linhas, filtro])

  const contadores = useMemo(() => ({
    ok:    linhas.filter(l => l.status === 'ok').length,
    aviso: linhas.filter(l => l.status === 'aviso').length,
    erro:  linhas.filter(l => l.status === 'erro').length,
  }), [linhas])

  const criados     = linhasSelecionadas.size
  const duplicatas  = linhas.filter(l => l.alertas.some(a => a.tipo === 'duplicado_sistema'))
  const atualizados = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'sobrescrever').length
  const pulados     = duplicatas.filter(l => decisoesDuplicatas[l.numero_pedido ?? ''] === 'pular').length

  function toggleExpandir(linhaNum: number) {
    setExpandidas(prev => {
      const novo = new Set(prev)
      if (novo.has(linhaNum)) novo.delete(linhaNum)
      else novo.add(linhaNum)
      return novo
    })
  }

  function toggleLinha(linhaNum: number) {
    const novo = new Set(linhasSelecionadas)
    if (novo.has(linhaNum)) novo.delete(linhaNum)
    else novo.add(linhaNum)
    onSelecaoChange(novo)
  }

  function selecionarTodasValidas() {
    const validas = new Set(linhas.filter(l => l.status === 'ok').map(l => l.linha_arquivo))
    onSelecaoChange(validas)
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
        <span><strong>{criados}</strong> serao criados</span>
        <span><strong>{atualizados}</strong> serao atualizados</span>
        <span><strong>{pulados}</strong> serao pulados</span>
        <span style={{ color: contadores.erro > 0 ? '#ef4444' : undefined }}>
          <strong>{contadores.erro}</strong> com erro
        </span>
      </div>

      {/* Filtros */}
      <div className="smart-import__filtros" role="group" aria-label="Filtrar linhas">
        {(['todos', 'ok', 'aviso', 'erro'] as FiltroPreview[]).map(f => (
          <button
            key={f}
            className={`smart-import__filtro-btn${filtro === f ? ' smart-import__filtro-btn--ativo' : ''}`}
            onClick={() => setFiltro(f)}
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
          <button className="smart-import__filtro-btn" onClick={selecionarTodas}>
            Selecionar todas
          </button>
          <button className="smart-import__filtro-btn" onClick={desselecionarTodas}>
            Limpar selecao
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label="Preview das linhas importadas">
          <thead>
            <tr>
              <th scope="col" style={{ width: 36 }} aria-label="Selecionar"></th>
              <th scope="col" style={{ width: 36 }}></th>
              <th scope="col">Linha</th>
              <th scope="col">Pedido</th>
              <th scope="col">Status</th>
              <th scope="col">Alertas</th>
              <th scope="col">Decisao (duplicata)</th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map(linha => {
              const estaExpandida  = expandidas.has(linha.linha_arquivo)
              const estaSelecionada = linhasSelecionadas.has(linha.linha_arquivo)
              const temDuplicata   = linha.alertas.some(a => a.tipo === 'duplicado_sistema')
              const numeroPedido   = linha.numero_pedido ?? ''

              return (
                <React.Fragment key={linha.linha_arquivo}>
                  <tr style={{ opacity: estaSelecionada ? 1 : 0.5 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={estaSelecionada}
                        onChange={() => toggleLinha(linha.linha_arquivo)}
                        aria-label={`Selecionar linha ${linha.linha_arquivo}`}
                      />
                    </td>
                    <td>
                      {linha.alertas.length > 0 && (
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem', color: 'var(--text-muted)' }}
                          onClick={() => toggleExpandir(linha.linha_arquivo)}
                          aria-expanded={estaExpandida}
                          aria-label={`${estaExpandida ? 'Ocultar' : 'Expandir'} alertas da linha ${linha.linha_arquivo}`}
                        >
                          {estaExpandida
                            ? <CaretDown size={12} aria-hidden="true" />
                            : <CaretRight size={12} aria-hidden="true" />}
                        </button>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      {linha.linha_arquivo}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
                      {linha.numero_pedido ?? '—'}
                    </td>
                    <td>
                      <IconeStatus status={linha.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                      {linha.alertas.length > 0
                        ? `${linha.alertas.length} alerta(s)`
                        : '—'}
                    </td>
                    <td>
                      {temDuplicata && (
                        <select
                          className="drawer-pedido__select"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          value={decisoesDuplicatas[numeroPedido] ?? 'pular'}
                          onChange={e => onDecisaoDuplicata(numeroPedido, e.target.value as DecisaoDuplicata)}
                          aria-label={`Decisao para duplicata do pedido ${numeroPedido}`}
                        >
                          <option value="sobrescrever">Sobrescrever</option>
                          <option value="criar">Criar mesmo assim</option>
                          <option value="pular">Pular</option>
                        </select>
                      )}
                    </td>
                  </tr>

                  {/* Alertas expandidos */}
                  {estaExpandida && linha.alertas.map((alerta, ai) => (
                    <tr key={ai} style={{ background: 'rgba(0,0,0,0.15)' }}>
                      <td colSpan={2}></td>
                      <td colSpan={5} style={{ fontSize: '0.75rem', paddingLeft: '1.5rem' }}>
                        <span
                          style={{
                            color: alerta.nivel === 'erro' ? '#ef4444' : '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                          }}
                        >
                          {alerta.nivel === 'erro'
                            ? <XCircle size={12} weight="fill" aria-hidden="true" />
                            : <Warning size={12} weight="fill" aria-hidden="true" />}
                          <strong>{alerta.campo}:</strong> {alerta.mensagem}
                        </span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
