/**
 * EtapaMapeamento.tsx — Etapa 2 do Smart Import
 * Tabela de mapeamento: coluna do arquivo → campo do sistema
 * Com nivel de confianca visual (verde/amarelo/cinza), exemplo do valor real e visualizacao do documento
 */

import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  Warning,
  Question,
  Brain,
  Table,
} from '@phosphor-icons/react'
import type { ColunaMapeada, SmartImportLinhaRaw } from '../../shared/types'

// ── Campos disponiveis no sistema (fallback hardcoded) ────────────────────────

const CAMPOS_SISTEMA_FALLBACK = [
  { valor: 'numero_pedido',        rotulo: 'Numero do Pedido'    },
  { valor: 'tipo_operacao',        rotulo: 'Tipo de Operacao'    },
  { valor: 'exportador',           rotulo: 'Exportador (Shipper)'},
  { valor: 'fabricante',           rotulo: 'Fabricante'          },
  { valor: 'incoterm',             rotulo: 'Incoterm'            },
  { valor: 'moeda_pedido',         rotulo: 'Moeda'               },
  { valor: 'data_emissao_pedido',  rotulo: 'Data Emissão do Pedido' },
  { valor: 'data_embarque',        rotulo: 'Data de Embarque'    },
  { valor: 'part_number',          rotulo: 'Part Number'         },
  { valor: 'ncm',                  rotulo: 'NCM'                 },
  { valor: 'descricao_item',        rotulo: 'Descricao do Item'   },
  { valor: 'quantidade_inicial_item_pedido',   rotulo: 'Quantidade'          },
  { valor: 'unidade_comercializada_item', rotulo: 'Unidade'      },
  { valor: 'valor_unitario_item',    rotulo: 'Valor por Unidade'   },
  { valor: 'valor_total_itens',    rotulo: 'Valor Total Item'    },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaMapeamentoProps {
  mapeamento: ColunaMapeada[]
  memoriaAplicada: boolean
  lembrarMapeamento: boolean
  dadosBrutos?: SmartImportLinhaRaw[]
  onMapeamentoChange: (novo: ColunaMapeada[]) => void
  onLembrarChange: (valor: boolean) => void
  onVoltar?: () => void
  onResetarMapeamento?: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function BadgeConfianca({ confianca, nivel }: { confianca: number; nivel: ColunaMapeada['nivel'] }) {
  if (nivel === 'ignorado') {
    return <span className="smart-import__conf-cinza"><Question size={14} aria-hidden="true" /> —</span>
  }
  if (confianca >= 90) {
    return <span className="smart-import__conf-verde"><CheckCircle size={14} aria-hidden="true" /> {confianca}%</span>
  }
  if (confianca >= 50) {
    return <span className="smart-import__conf-amarelo"><Warning size={14} aria-hidden="true" /> {confianca}%</span>
  }
  return <span className="smart-import__conf-cinza"><Question size={14} aria-hidden="true" /> {confianca}%</span>
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaMapeamento({
  mapeamento,
  memoriaAplicada,
  lembrarMapeamento,
  dadosBrutos,
  onMapeamentoChange,
  onLembrarChange,
  onVoltar,
  onResetarMapeamento,
}: EtapaMapeamentoProps) {
  const [verDocumento, setVerDocumento] = useState(false)
  const [camposSistema, setCamposSistema] = useState<{ valor: string; rotulo: string }[]>(CAMPOS_SISTEMA_FALLBACK)

  useEffect(() => {
    fetch('/api/v1/pedidos/smart-import/campos', {
      headers: { 'x-tenant-id': '', 'x-internal-key': '' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setCamposSistema(data) })
      .catch(() => { /* usa fallback */ })
  }, [])

  function atualizarCampo(index: number, campo_sistema: string | null) {
    const novo = mapeamento.map((col, i) => {
      if (i !== index) return col
      return {
        ...col,
        campo_sistema,
        nivel: 'usuario' as const,
        inferido_por: 'usuario' as const,
      }
    })
    onMapeamentoChange(novo)
  }

  const mapeadas = mapeamento.filter(m => m.campo_sistema !== null).length
  const total = mapeamento.length

  return (
    <div style={{ position: 'relative' }}>
      {onVoltar && (
        <button
          type="button"
          className="smart-import__filtro-btn"
          onClick={onVoltar}
          style={{ marginBottom: '0.75rem' }}
        >
          ← Trocar arquivo
        </button>
      )}

      <div className="smart-import__mapa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {mapeadas} de {total} colunas mapeadas
            {mapeadas < total && (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                ({total - mapeadas} ignoradas)
              </span>
            )}
          </p>
          {memoriaAplicada && (
            <>
              <span className="smart-import__badge-memoria">
                <Brain size={11} aria-hidden="true" /> Memoria aplicada
              </span>
              {onResetarMapeamento && (
                <button
                  type="button"
                  className="smart-import__filtro-btn"
                  onClick={onResetarMapeamento}
                  style={{ fontSize: '0.6875rem' }}
                  title="Ignorar memória e remapear manualmente"
                >
                  Remapear
                </button>
              )}
            </>
          )}
          {dadosBrutos && dadosBrutos.length > 0 && (
            <button
              type="button"
              className="smart-import__filtro-btn"
              onClick={() => setVerDocumento(true)}
              style={{ marginLeft: '0.5rem' }}
            >
              <Table size={13} weight="duotone" aria-hidden="true" />
              Ver documento
            </button>
          )}
        </div>
        <label className="smart-import__lembrar">
          <input
            type="checkbox"
            checked={lembrarMapeamento}
            onChange={e => onLembrarChange(e.target.checked)}
            aria-label="Lembrar este mapeamento para proximas importacoes"
          />
          Lembrar este mapeamento
        </label>
      </div>

      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Campos obrigatórios: <strong>Número do Pedido</strong> e <strong>Part Number</strong>
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label="Mapeamento de colunas">
          <thead>
            <tr>
              <th scope="col">Coluna do Arquivo</th>
              <th scope="col">Valor Extraído</th>
              <th scope="col">Campo no Sistema</th>
              <th scope="col">Confianca</th>
              <th scope="col">Inferido Por</th>
            </tr>
          </thead>
          <tbody>
            {mapeamento.map((col, index) => (
              <tr key={`${col.coluna_arquivo}-${index}`}>
                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
                  {col.coluna_arquivo}
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {col.exemplo_valor
                    ? <span title={col.exemplo_valor}>{col.exemplo_valor}</span>
                    : <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>
                  }
                </td>
                <td>
                  <select
                    style={{
                      minWidth: '200px',
                      padding: '0.375rem 0.625rem',
                      borderRadius: '6px',
                      border: '1px solid var(--bg-elevated, #334155)',
                      background: 'var(--bg-surface, #1e293b)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    value={col.campo_sistema ?? ''}
                    onChange={e => atualizarCampo(index, e.target.value || null)}
                    aria-label={`Campo sistema para ${col.coluna_arquivo}`}
                  >
                    <option value="">— Ignorar —</option>
                    {camposSistema.map(c => (
                      <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <BadgeConfianca confianca={col.confianca} nivel={col.nivel} />
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                  {col.inferido_por === 'memoria'  && 'Memoria'}
                  {col.inferido_por === 'ia'       && 'IA'}
                  {col.inferido_por === 'dados'    && 'Dados'}
                  {col.inferido_por === 'usuario'  && 'Usuario'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verDocumento && dadosBrutos && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-base)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-default, rgba(255,255,255,0.08))' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Documento importado
            </span>
            <button type="button" onClick={() => setVerDocumento(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
              ✕
            </button>
          </div>
          <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '1rem' }}>
            <table className="smart-import__tabela" style={{ minWidth: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--text-muted)', width: 40 }}>#</th>
                  {mapeamento.map(m => m.coluna_arquivo).map(col => <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {dadosBrutos.map(row => (
                  <tr key={row.linha}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.linha}</td>
                    {mapeamento.map(m => m.coluna_arquivo).map(col => (
                      <td key={col} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {row.valores[col] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
