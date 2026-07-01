import React from 'react'
import { Columns, LockSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type ColunaPadraoLista = {
  ordem: number
  coluna: string
  descricao: string
  fixa?: boolean
}

/** SSOT alinhado a `COLUNAS_PADRAO_VISIVEIS_LISTA_LEITURA_SMART_READ` (smart-read). */
const COLUNAS_PADRAO_LISTA_SMART_READ: ColunaPadraoLista[] = [
  {
    ordem: 1,
    coluna: 'Nome da leitura',
    descricao: 'Identificador da leitura; **link** que abre no passo atual (retomar).',
    fixa: true,
  },
  {
    ordem: 2,
    coluna: 'Tipo de documento',
    descricao: 'Tipos consolidados na leitura (ex.: Invoice, Bill of Lading, Packing List).',
  },
  {
    ordem: 3,
    coluna: 'Nº documento',
    descricao: 'Números dos documentos vinculados à leitura.',
  },
  {
    ordem: 4,
    coluna: 'Status',
    descricao: 'Pill com o status da leitura (Concluída, Em andamento, Erro, etc.).',
  },
  {
    ordem: 5,
    coluna: 'Arquivos',
    descricao: 'Quantidade de arquivos anexados no envio.',
  },
  {
    ordem: 6,
    coluna: 'Documentos',
    descricao: 'Quantidade de documentos extraídos pela IA.',
  },
  {
    ordem: 7,
    coluna: 'Campos extraídos',
    descricao: 'Total de campos preenchidos pela IA na leitura.',
  },
  {
    ordem: 8,
    coluna: 'Campos corretos',
    descricao: 'Campos **não** alterados na conferência.',
  },
  {
    ordem: 9,
    coluna: 'Campos errados',
    descricao: 'Campos **editados** na conferência.',
  },
  {
    ordem: 10,
    coluna: 'Média de acertos',
    descricao: 'Percentual de acerto da leitura.',
  },
  {
    ordem: 11,
    coluna: 'Tempo extração (IA)',
    descricao: 'Duração do processamento da IA.',
  },
  {
    ordem: 12,
    coluna: 'Tempo processo total',
    descricao: 'Cronômetro total do fluxo (envio até conclusão).',
  },
  {
    ordem: 13,
    coluna: 'Saving (horas)',
    descricao: 'Tempo economizado vs. digitação manual.',
  },
  {
    ordem: 14,
    coluna: 'Saving (valor)',
    descricao: 'Valor estimado da economia (BRL).',
  },
  {
    ordem: 15,
    coluna: 'Data de envio',
    descricao: 'Data em que a leitura foi enviada.',
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

export function ManualSmartReadTabelaColunasPadraoLista() {
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
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
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
        <Columns size={16} weight="duotone" color="#818cf8" />
        Colunas padrão da Lista
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, color: '#94a3b8', width: '8%' }}>#</th>
              <th style={{
                ...thBase,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,.08)',
                width: '28%',
              }}>
                Coluna
              </th>
              <th style={{ ...thBase, color: '#94a3b8', width: '64%' }}>O que mostra</th>
            </tr>
          </thead>
          <tbody>
            {COLUNAS_PADRAO_LISTA_SMART_READ.map((linha, i) => (
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
                  background: 'rgba(99,102,241,.04)',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {linha.coluna}
                    {linha.fixa && (
                      <LockSimple
                        size={13}
                        weight="duotone"
                        color="#818cf8"
                        aria-label="Coluna fixa — não pode ser ocultada"
                      />
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
    </div>
  )
}
