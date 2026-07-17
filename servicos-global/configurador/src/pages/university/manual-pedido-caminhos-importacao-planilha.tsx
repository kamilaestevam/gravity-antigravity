import React from 'react'
import { ArrowDown, FileXls, UploadSimple } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type CaminhoImportacao = {
  titulo: string
  badge: string
  badgeCor: string
  badgeBorda: string
  badgeFundo: string
  icone: React.ReactNode
  cor: string
  borda: string
  fundo: string
  descricao: React.ReactNode
}

const CAMINHOS: CaminhoImportacao[] = [
  {
    titulo: 'Planilha modelo Gravity',
    badge: 'Disponível',
    badgeCor: '#34d399',
    badgeBorda: 'rgba(52,211,153,.35)',
    badgeFundo: 'rgba(52,211,153,.12)',
    icone: <FileXls size={22} weight="duotone" color="#34d399" aria-hidden />,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    descricao: (
      <>
        **Baixar template** na etapa Upload → preencher o <strong style={{ color: '#cbd5e1' }}>.xlsx</strong>{' '}
        oficial (colunas do workspace + exemplos na linha 3) → reenviar. Fluxo documentado abaixo.
      </>
    ),
  },
  {
    titulo: 'Planilha do usuário',
    badge: 'Em breve',
    badgeCor: '#fbbf24',
    badgeBorda: 'rgba(251,191,36,.35)',
    badgeFundo: 'rgba(245,158,11,.12)',
    icone: <UploadSimple size={22} weight="duotone" color="#fbbf24" aria-hidden />,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    descricao: (
      <>
        Upload de planilha ou invoice do fornecedor (<strong style={{ color: '#cbd5e1' }}>Excel, CSV, PDF, XML, JSON, TXT</strong>)
        com mapeamento automático por IA: ainda <strong style={{ color: '#cbd5e1' }}>em homologação</strong>.
        Use o template oficial por enquanto.
      </>
    ),
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardCaminho({
  caminho,
  destaqueHomologado,
  inativo,
}: {
  caminho: CaminhoImportacao
  destaqueHomologado?: boolean
  inativo?: boolean
}) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: caminho.fundo,
      border: `1px solid ${destaqueHomologado ? 'rgba(52,211,153,.55)' : caminho.borda}`,
      boxShadow: destaqueHomologado
        ? '0 0 0 1px rgba(52,211,153,.22), 0 12px 32px rgba(52,211,153,.08)'
        : undefined,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: inativo ? 0.72 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${caminho.borda}`,
          flexShrink: 0,
        }}>
          {caminho.icone}
        </div>
        <span style={{
          fontSize: '.58rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: caminho.badgeCor,
          background: caminho.badgeFundo,
          border: `1px solid ${caminho.badgeBorda}`,
          borderRadius: 999,
          padding: '3px 8px',
          flexShrink: 0,
        }}>
          {caminho.badge}
        </span>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.82rem',
        fontWeight: 800,
        color: '#e2e8f0',
        lineHeight: 1.35,
      }}>
        {caminho.titulo}
      </p>
      <p style={{
        margin: 0,
        fontSize: '.72rem',
        lineHeight: 1.55,
        color: CORPO_70,
      }}>
        {typeof caminho.descricao === 'string'
          ? renderizarNegrito(caminho.descricao)
          : caminho.descricao}
      </p>
    </div>
  )
}

function ManualSetaFluxoTemplateGravity() {
  return (
    <div
      aria-hidden
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
        marginTop: 4,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '2px 0 0',
      }}>
        <div style={{
          width: 2,
          height: 22,
          borderRadius: 999,
          background: 'linear-gradient(180deg, rgba(52,211,153,.75) 0%, rgba(52,211,153,.15) 100%)',
        }} />
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 12px',
          borderRadius: 999,
          background: 'rgba(52,211,153,.1)',
          border: '1px solid rgba(52,211,153,.35)',
          boxShadow: '0 4px 18px rgba(52,211,153,.12)',
        }}>
          <ArrowDown size={14} weight="bold" color="#34d399" />
          <span style={{
            fontSize: '.64rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#6ee7b7',
          }}>
            Passo a passo: planilha modelo Gravity
          </span>
        </div>
        <ArrowDown size={18} weight="bold" color="#34d399" style={{ marginTop: 2 }} />
      </div>
      <div aria-hidden style={{ minHeight: 1 }} />
    </div>
  )
}

/** Manual Pedido §05 — dois caminhos do Smart Import (template vs planilha própria) */
export function ManualPedidoCaminhosImportacaoPlanilha() {
  return (
    <div
      role="group"
      aria-label="Dois caminhos de importação via planilha no Smart Import"
      style={{
        margin: '14px 0 6px',
        padding: '16px 18px 10px',
        borderRadius: 14,
        border: '1px solid rgba(148,163,184,.14)',
        background: 'rgba(8,12,24,.35)',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
        <CardCaminho caminho={CAMINHOS[0]} destaqueHomologado />
        <CardCaminho caminho={CAMINHOS[1]} inativo />
      </div>
      <ManualSetaFluxoTemplateGravity />
    </div>
  )
}
