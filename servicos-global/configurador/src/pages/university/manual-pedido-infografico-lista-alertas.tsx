import React from 'react'
import {
  Warning,
  CaretDown,
  Rows,
  GitBranch,
  Scales,
  Copy,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CenarioAlerta = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const CENARIOS: CenarioAlerta[] = [
  {
    num: '01',
    rotulo: 'Pedido colapsado',
    descricao: 'Alguns alertas aparecem na **linha mãe** antes de expandir: ex.: **Status** divergente ou totais que não agregam por **moeda/unidade** distinta.',
    icone: Rows,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.35)',
    fundo: 'rgba(245,158,11,.1)',
  },
  {
    num: '02',
    rotulo: 'Pedido expandido',
    descricao: 'O **⚠** marca a célula exata: valor do **pedido** ≠ **item**, ou **itens** com valores distintos entre si na mesma coluna.',
    icone: CaretDown,
    cor: '#f87171',
    borda: 'rgba(248,113,113,.35)',
    fundo: 'rgba(239,68,68,.08)',
  },
  {
    num: '03',
    rotulo: 'Homogeneidade',
    descricao: 'Moedas ou unidades **diferentes entre itens** impedem somar totais no pedido: o alerta indica por que Valor Total, Saldo ou Qtd. ficam vazios.',
    icone: Scales,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.35)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '04',
    rotulo: 'Part Number repetido',
    descricao: 'Dois ou mais **itens** com o mesmo Part Number acendem **⚠** na coluna **Nº Pedido / Nº Item** da linha do pedido.',
    icone: Copy,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.35)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function MiniLinha({
  rotulo,
  tipo,
  alerta,
  indent,
}: {
  rotulo: string
  tipo: 'pedido' | 'item'
  alerta?: boolean
  indent?: boolean
}) {
  const corLinha = tipo === 'pedido' ? '#fde68a' : '#a7f3d0'
  const fundo = tipo === 'pedido' ? 'rgba(245,158,11,.12)' : 'rgba(52,211,153,.08)'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginLeft: indent ? 22 : 0,
      marginTop: indent ? 6 : 0,
      padding: '7px 10px',
      borderRadius: 8,
      background: fundo,
      border: `1px solid ${tipo === 'pedido' ? 'rgba(245,158,11,.28)' : 'rgba(52,211,153,.22)'}`,
    }}>
      <span style={{
        fontSize: '.58rem',
        fontWeight: 800,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: corLinha,
        minWidth: 44,
      }}>
        {tipo === 'pedido' ? 'Pedido' : 'Item'}
      </span>
      <span style={{ flex: 1, fontSize: '.72rem', color: '#e2e8f0', fontWeight: 600 }}>
        {rotulo}
      </span>
      {alerta ? (
        <Warning size={16} weight="fill" color="#fbbf24" aria-label="Alerta" />
      ) : (
        <span style={{ width: 16 }} />
      )}
    </div>
  )
}

/** Manual Pedido §05 — relação pedido × itens e alertas na Lista */
export function ManualInfograficoPedidoListaAlertas() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(251,191,36,.1) 0%, rgba(148,163,184,.04) 42%, rgba(248,113,113,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 20,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <GitBranch size={18} weight="duotone" color="#fbbf24" />
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#fde68a',
          background: 'rgba(251,191,36,.12)',
          border: '1px solid rgba(251,191,36,.32)',
          borderRadius: 999,
          padding: '4px 10px',
        }}>
          Pedido × Itens
        </span>
      </div>
      <p style={{
        margin: '0 0 14px',
        fontSize: '.9rem',
        fontWeight: 800,
        color: '#f1f5f9',
        lineHeight: 1.35,
      }}>
        Quando a Lista exibe o alerta âmbar (⚠)
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 14,
        marginBottom: 14,
        alignItems: 'stretch',
      }}>
        <div style={{
          borderRadius: 12,
          padding: '14px 14px 12px',
          background: 'rgba(8,12,24,.32)',
          border: '1px solid rgba(148,163,184,.14)',
        }}>
          <p style={{
            margin: '0 0 10px',
            fontSize: '.68rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}>
            Hierarquia na tabela
          </p>
          <MiniLinha rotulo="PO-2026-0042 · Status ⚠" tipo="pedido" alerta />
          <MiniLinha rotulo="Item A · Incoterm FOB" tipo="item" indent />
          <MiniLinha rotulo="Item B · Incoterm CIF ⚠" tipo="item" alerta indent />
          <p style={{
            margin: '10px 0 0',
            fontSize: '.68rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            A linha **pedido** agrega visão; cada **item** tem valores próprios. O sistema compara os dois níveis após expandir (ou infere na linha mãe quando aplicável).
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {CENARIOS.map((c) => {
            const Icone = c.icone
            return (
              <div key={c.num} style={{
                borderRadius: 10,
                padding: '11px 11px 10px',
                background: c.fundo,
                border: `1px solid ${c.borda}`,
                height: '100%',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <Icone size={15} weight="duotone" color={c.cor} />
                  <span style={{ fontSize: '.62rem', fontWeight: 800, color: c.cor }}>{c.num}</span>
                </div>
                <p style={{ margin: 0, fontSize: '.74rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.35 }}>
                  {c.rotulo}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '.68rem', lineHeight: 1.45, color: CORPO_70 }}>
                  {renderizarNegrito(c.descricao)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: '#fde68a', fontSize: '.72rem' }}>
          Sem alerta de divergência: Workspace e Tipo de operação (replicam automaticamente para todos os itens).
        </p>
        <p style={{ margin: '6px 0 0' }}>
          A tabela abaixo lista **todas as colunas** com alerta e a condição exata de acionamento.
        </p>
      </div>
    </div>
  )
}
