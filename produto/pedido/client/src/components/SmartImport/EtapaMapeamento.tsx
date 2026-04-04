/**
 * EtapaMapeamento.tsx — Etapa 2 do Smart Import
 * Tabela de mapeamento: coluna do arquivo → campo do sistema
 * Com nivel de confianca visual (verde/amarelo/cinza) e badge de memoria
 */

import React from 'react'
import {
  CheckCircle,
  Warning,
  Question,
  Brain,
} from '@phosphor-icons/react'
import type { ColunaMapeada } from '../../shared/types'

// ── Campos disponiveis no sistema ─────────────────────────────────────────────

const CAMPOS_SISTEMA = [
  { valor: 'numero_pedido',        rotulo: 'Numero do Pedido'    },
  { valor: 'tipo_operacao',        rotulo: 'Tipo de Operacao'    },
  { valor: 'exportador',           rotulo: 'Exportador'          },
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

// ── Componente ────────────────────────────────────────────────────────────────

export function EtapaMapeamento({
  mapeamento,
  memoriaAplicada,
  lembrarMapeamento,
  onMapeamentoChange,
  onLembrarChange,
}: EtapaMapeamentoProps) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)' }}>
            {mapeamento.length} colunas detectadas no arquivo
          </p>
          {memoriaAplicada && (
            <span className="smart-import__badge-memoria">
              <Brain size={11} aria-hidden="true" /> Memoria aplicada
            </span>
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
                <td>
                  <select
                    className="drawer-pedido__select"
                    value={col.campo_sistema ?? ''}
                    onChange={e => atualizarCampo(index, e.target.value || null)}
                    aria-label={`Campo sistema para ${col.coluna_arquivo}`}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="">— Ignorar —</option>
                    {CAMPOS_SISTEMA.map(c => (
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
    </div>
  )
}
