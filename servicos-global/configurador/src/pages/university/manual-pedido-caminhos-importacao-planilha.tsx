import React from 'react'
import { FileXls, UploadSimple } from '@phosphor-icons/react'

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
        com mapeamento automático por IA — ainda <strong style={{ color: '#cbd5e1' }}>em homologação</strong>.
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

function CardCaminho({ caminho }: { caminho: CaminhoImportacao }) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: caminho.fundo,
      border: `1px solid ${caminho.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
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

/** Manual Pedido §05 — dois caminhos do Smart Import (template vs planilha própria) */
export function ManualPedidoCaminhosImportacaoPlanilha() {
  return (
    <div
      role="group"
      aria-label="Dois caminhos de importação via planilha no Smart Import"
      style={{
        margin: '14px 0 18px',
        padding: '16px 18px 14px',
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
        {CAMINHOS.map((caminho) => (
          <CardCaminho key={caminho.titulo} caminho={caminho} />
        ))}
      </div>
    </div>
  )
}
