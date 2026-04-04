/**
 * EtapaMapeamento.tsx — Etapa 2 do Smart Import
 * Tabela de mapeamento: coluna do arquivo → campo do sistema
 * Com nivel de confianca visual (verde/amarelo/cinza), exemplo do valor real e visualizacao do documento
 */

import React, { useState } from 'react'
import {
  CheckCircle,
  Warning,
  Question,
  Brain,
  Table,
  X,
} from '@phosphor-icons/react'
import type { ColunaMapeada, SmartImportLinhaRaw } from '../../shared/types'

// ── Campos disponiveis no sistema ─────────────────────────────────────────────

const CAMPOS_SISTEMA = [
  { valor: 'numero_pedido',        rotulo: 'Numero do Pedido'    },
  { valor: 'tipo_operacao',        rotulo: 'Tipo de Operacao'    },
  { valor: 'exportador',           rotulo: 'Exportador (Shipper)'},
  { valor: 'fabricante',           rotulo: 'Fabricante'          },
  { valor: 'incoterm',             rotulo: 'Incoterm'            },
  { valor: 'moeda_pedido',         rotulo: 'Moeda'               },
  { valor: 'data_emissao_pedido',  rotulo: 'Data de Emissao'     },
  { valor: 'data_embarque',        rotulo: 'Data de Embarque'    },
  { valor: 'part_number',          rotulo: 'Part Number'         },
  { valor: 'ncm',                  rotulo: 'NCM'                 },
  { valor: 'descricao',            rotulo: 'Descricao'           },
  { valor: 'quantidade_inicial',   rotulo: 'Quantidade'          },
  { valor: 'unidade',              rotulo: 'Unidade'             },
  { valor: 'valor_unitario',       rotulo: 'Valor Unitario'      },
  { valor: 'valor_item',           rotulo: 'Valor Total Item'    },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface EtapaMapeamentoProps {
  mapeamento: ColunaMapeada[]
  memoriaAplicada: boolean
  lembrarMapeamento: boolean
  dadosBrutos?: SmartImportLinhaRaw[]
  onMapeamentoChange: (novo: ColunaMapeada[]) => void
  onLembrarChange: (valor: boolean) => void
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

// ── Modal de visualização do documento ───────────────────────────────────────

function ModalDocumento({
  dadosBrutos,
  mapeamento,
  onFechar,
}: {
  dadosBrutos: SmartImportLinhaRaw[]
  mapeamento: ColunaMapeada[]
  onFechar: () => void
}) {
  const colunas = mapeamento.map(m => m.coluna_arquivo)

  return (
    <div className="smart-import__overlay" onClick={e => { if (e.target === e.currentTarget) onFechar() }} style={{ zIndex: 1100 }}>
      <div className="smart-import__container" style={{ maxWidth: 900, maxHeight: '80vh' }}>
        <div className="smart-import__header">
          <h2 className="smart-import__titulo">
            <Table size={18} weight="duotone" aria-hidden="true" />
            Documento importado
          </h2>
          <button className="smart-import__fechar" onClick={onFechar} type="button" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(80vh - 80px)', padding: '1rem' }}>
          <table className="smart-import__tabela" style={{ minWidth: 'max-content' }}>
            <thead>
              <tr>
                <th style={{ color: 'var(--text-muted)', width: 40 }}>#</th>
                {colunas.map(col => (
                  <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosBrutos.map(row => (
                <tr key={row.linha}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.linha}</td>
                  {colunas.map(col => (
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
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaMapeamento({
  mapeamento,
  memoriaAplicada,
  lembrarMapeamento,
  dadosBrutos,
  onMapeamentoChange,
  onLembrarChange,
}: EtapaMapeamentoProps) {
  const [verDocumento, setVerDocumento] = useState(false)

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

  return (
    <div>
      <div className="smart-import__mapa-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {mapeamento.length} colunas detectadas no arquivo
          </p>
          {memoriaAplicada && (
            <span className="smart-import__badge-memoria">
              <Brain size={11} aria-hidden="true" /> Memoria aplicada
            </span>
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

      <div style={{ overflowX: 'auto' }}>
        <table className="smart-import__tabela" aria-label="Mapeamento de colunas">
          <thead>
            <tr>
              <th scope="col">Coluna do Arquivo</th>
              <th scope="col" style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Exemplo do valor</th>
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
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {col.exemplo_valor
                    ? <span title={col.exemplo_valor}>{col.exemplo_valor}</span>
                    : <span style={{ opacity: 0.4 }}>—</span>
                  }
                </td>
                <td>
                  <select
                    className="drawer-pedido__select"
                    value={col.campo_sistema ?? ''}
                    onChange={e => atualizarCampo(index, e.target.value || null)}
                    aria-label={`Campo sistema para ${col.coluna_arquivo}`}
                    style={{ minWidth: '200px' }}
                  >
                    <option value="">— Ignorar —</option>
                    {CAMPOS_SISTEMA.map(c => (
                      <option key={c.valor} value={c.valor}>{c.rotulo}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <BadgeConfianca confianca={col.confianca} nivel={col.nivel} />
                    {col.exemplo_valor && (
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
                        &ldquo;{col.exemplo_valor}&rdquo;
                      </span>
                    )}
                  </div>
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
        <ModalDocumento
          dadosBrutos={dadosBrutos}
          mapeamento={mapeamento}
          onFechar={() => setVerDocumento(false)}
        />
      )}
    </div>
  )
}
