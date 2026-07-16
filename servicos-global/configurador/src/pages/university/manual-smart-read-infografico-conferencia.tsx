import React from 'react'
import {
  ArrowsLeftRight,
  ClipboardText,
  EnvelopeSimple,
  ShieldWarning,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX, MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type AbaConferencia = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const ABAS: AbaConferencia[] = [
  {
    num: '01',
    rotulo: 'Conferência de Campos',
    descricao:
      'Revise e corrija os **campos extraídos** por documento. Filtre **vazios** e **alterados**; marque o que já conferiu antes de concluir.',
    icone: ClipboardText,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.1)',
  },
  {
    num: '02',
    rotulo: 'Consultor Inteligente',
    descricao:
      'Converse com a **IA** sobre a leitura: conflitos, resumos e perguntas livres com contexto dos documentos.',
    icone: Sparkle,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '03',
    rotulo: 'Análise de Riscos',
    descricao:
      'Veja **alertas aduaneiros** por severidade, evidências no documento e correções sugeridas; abra o campo direto na conferência.',
    icone: ShieldWarning,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    num: '04',
    rotulo: 'Comunicação com Fornecedor',
    descricao:
      'Monte o e-mail ao exportador com **riscos** e **campos corrigidos** que você selecionar para alinhar pendências.',
    icone: EnvelopeSimple,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
]

const ABA_COMPARATIVO: AbaConferencia = {
  num: '05',
  rotulo: 'Comparar arquivo',
  descricao:
    'Cruze **campo a campo** a leitura atual com um **segundo PDF**. A tabela destaca **iguais**, **divergentes**, campos **só em um documento** e **vazios em ambos**. Edite o documento atual direto no painel esquerdo.',
  icone: ArrowsLeftRight,
  cor: '#38bdf8',
  borda: 'rgba(56,189,248,.32)',
  fundo: 'rgba(56,189,248,.08)',
}

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardAba({ aba }: { aba: AbaConferencia }) {
  const Icone = aba.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: aba.fundo,
      border: `1px solid ${aba.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: MANUAL_ESPACO_PARAGRAFO_PX,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.1em',
          color: aba.cor,
          opacity: 0.9,
        }}>
          {aba.num}
        </span>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${aba.borda}`,
        }}>
          <Icone size={18} weight="duotone" color={aba.cor} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX }}>
        <p style={{
          margin: 0,
          fontWeight: 800,
          fontSize: '.78rem',
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {aba.rotulo}
        </p>
        <p style={{
          margin: 0,
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito(aba.descricao)}
        </p>
      </div>
    </div>
  )
}

/** Manual Smart Docs — mapa das abas e do comparativo do passo Conferência */
export function ManualInfograficoSmartDocsConferencia({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: margemSuperiorPx,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ClipboardText size={18} weight="duotone" color="#818cf8" />
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: '#c7d2fe',
            background: 'rgba(99,102,241,.14)',
            border: '1px solid rgba(129,140,248,.32)',
            borderRadius: 999,
            padding: '4px 10px',
          }}>
            Passo 3 · Conferência
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: '.9rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          Quatro abas e o comparativo de documentos
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
      }}>
        {ABAS.map((aba) => (
          <CardAba key={aba.num} aba={aba} />
        ))}
      </div>

      <div style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
        <CardAba aba={ABA_COMPARATIVO} />
      </div>
    </div>
  )
}
