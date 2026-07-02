import React from 'react'
import { Columns, LockSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type ColunaPadraoLista = {
  ordem: number
  coluna: string
  descricao: string
  fixa?: boolean
}

/** SSOT — colunas iniciais visíveis na Lista (`_COLUNAS_PADRAO_SEQUENCIA` em Pedidos.tsx). */
const COLUNAS_PADRAO_LISTA_PEDIDO: ColunaPadraoLista[] = [
  {
    ordem: 1,
    coluna: 'Nº pedido',
    descricao: 'Identificador do PO; **link** abre o drawer de edição do pedido.',
    fixa: true,
  },
  {
    ordem: 2,
    coluna: 'Tipo de operação',
    descricao: 'Pill **Importação** ou **Exportação**.',
  },
  {
    ordem: 3,
    coluna: 'Status',
    descricao: 'Pill com o status configurado do pedido (Aberto, Em andamento, etc.).',
  },
  {
    ordem: 4,
    coluna: 'Workspace',
    descricao: 'Filial à qual o pedido pertence.',
  },
  {
    ordem: 5,
    coluna: 'Importador',
    descricao: 'Nome do importador no cabeçalho do pedido.',
  },
  {
    ordem: 6,
    coluna: 'Exportador',
    descricao: 'Nome do exportador no cabeçalho do pedido.',
  },
  {
    ordem: 7,
    coluna: 'Referência importador',
    descricao: 'Referência comercial do lado importador.',
  },
  {
    ordem: 8,
    coluna: 'Incoterm',
    descricao: 'Termo comercial (FOB, CIF, etc.).',
  },
  {
    ordem: 9,
    coluna: 'Porto origem',
    descricao: 'Porto de embarque do pedido.',
  },
  {
    ordem: 10,
    coluna: 'Porto destino',
    descricao: 'Porto de desembarque do pedido.',
  },
  {
    ordem: 11,
    coluna: 'Descrição item',
    descricao: 'Descrição da linha de produto (visível nas linhas filhas).',
  },
  {
    ordem: 12,
    coluna: 'NCM',
    descricao: 'Nomenclatura do item na linha filha.',
  },
  {
    ordem: 13,
    coluna: 'Moeda',
    descricao: 'Moeda do pedido (ex.: USD, BRL).',
  },
  {
    ordem: 14,
    coluna: 'Valor total',
    descricao: 'Valor total do PO na moeda informada.',
  },
  {
    ordem: 15,
    coluna: 'Saldo itens',
    descricao: 'Quantidade ainda em aberto nos itens do pedido.',
  },
]

function renderizarTextoComNegrito(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

export function ManualPedidoTabelaColunasPadraoLista() {
  const thBase: React.CSSProperties = {
    padding: '11px 14px',
    textAlign: 'left',
    fontSize: '.66rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(148,163,184,.15)',
  }

  const tdBase: React.CSSProperties = {
    padding: '11px 14px',
    fontSize: '.76rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop: 20,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(245,158,11,.06) 0%, rgba(148,163,184,.04) 50%, rgba(129,140,248,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <p style={{
        fontSize: '.68rem',
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: 0,
        padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Columns size={16} weight="duotone" color="#f59e0b" />
        Colunas padrão da Lista
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '8%' }}>#</th>
              <th style={{
                ...thBase,
                color: '#fcd34d',
                background: 'rgba(245,158,11,.08)',
                width: '28%',
              }}>
                Coluna
              </th>
              <th style={{ ...thBase, color: '#94a3b8', width: '64%' }}>O que mostra</th>
            </tr>
          </thead>
          <tbody>
            {COLUNAS_PADRAO_LISTA_PEDIDO.map((linha, i) => (
              <tr
                key={linha.coluna}
                style={{
                  background: i % 2 === 0 ? 'rgba(8,12,24,.15)' : 'transparent',
                }}
              >
                <td style={{ ...tdBase, color: '#64748b', fontWeight: 600, textAlign: 'center' }}>
                  {String(linha.ordem).padStart(2, '0')}
                </td>
                <td style={{
                  ...tdBase,
                  fontWeight: 600,
                  color: '#e2e8f0',
                  background: 'rgba(245,158,11,.04)',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {linha.coluna}
                    {linha.fixa && (
                      <LockSimple size={12} weight="duotone" color="#94a3b8" aria-label="Coluna fixa" />
                    )}
                  </span>
                </td>
                <td style={{ ...tdBase, color: CORPO_70 }}>
                  {renderizarTextoComNegrito(linha.descricao)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{
        margin: 0,
        padding: '12px 18px 14px',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
        borderTop: '1px solid rgba(148,163,184,.1)',
      }}>
        O catálogo completo inclui dezenas de campos de pedido e item. Oculte, reordene ou crie colunas customizadas no menu <strong style={{ color: '#cbd5e1' }}>Colunas</strong>.
      </p>
    </div>
  )
}
