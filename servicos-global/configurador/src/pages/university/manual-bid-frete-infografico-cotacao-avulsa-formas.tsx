import React from 'react'
import {
  ArrowsLeftRight,
  CheckCircle,
  PencilSimple,
  Sparkle,
  UploadSimple,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type FormaCotacaoAvulsa = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  disponivel: boolean
  detalhe: string
}

const FORMAS: FormaCotacaoAvulsa[] = [
  {
    num: '01',
    rotulo: 'Manual',
    descricao: 'Preencher o **formulário** passo a passo no assistente: **disponível hoje**.',
    icone: PencilSimple,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.08)',
    disponivel: true,
    detalhe: 'Wizard com fluxo único até o modal',
  },
  {
    num: '02',
    rotulo: 'Via planilha',
    descricao: 'Importar **Excel**, **CSV** ou **XML** para gerar a cotação.',
    icone: UploadSimple,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.06)',
    disponivel: false,
    detalhe: 'Em breve no produto',
  },
  {
    num: '03',
    rotulo: 'Por API',
    descricao: 'Integrar via **API Cockpit** ou **ERP** para criar cotações avulsas.',
    icone: ArrowsLeftRight,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.06)',
    disponivel: false,
    detalhe: 'Em breve no produto',
  },
  {
    num: '04',
    rotulo: 'Via Smart Docs',
    descricao: 'A **IA** extrai dados do documento comercial e pré-preenche a cotação.',
    icone: Sparkle,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.06)',
    disponivel: false,
    detalhe: 'Em breve no produto',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardForma({ forma }: { forma: FormaCotacaoAvulsa }) {
  const Icone = forma.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: forma.fundo,
      border: `1px ${forma.disponivel ? 'solid' : 'dashed'} ${forma.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: forma.disponivel ? 1 : 0.88,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${forma.borda}`,
        }}>
          <Icone size={20} weight="duotone" color={forma.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 4,
          }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: forma.cor,
            }}>
              {forma.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {forma.rotulo}
            </p>
            <span style={{
              fontSize: '.56rem',
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: forma.disponivel ? '#6ee7b7' : '#64748b',
              background: forma.disponivel ? 'rgba(52,211,153,.12)' : 'rgba(148,163,184,.1)',
              border: `1px solid ${forma.disponivel ? 'rgba(52,211,153,.28)' : 'rgba(148,163,184,.18)'}`,
              borderRadius: 999,
              padding: '2px 8px',
            }}>
              {forma.disponivel ? 'Disponível' : 'Em breve'}
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.68rem',
            lineHeight: 1.45,
            color: CORPO_70,
          }}>
            {renderizarNegrito(forma.descricao)}
          </p>
        </div>
      </div>
      <p style={{
        margin: 0,
        fontSize: '.62rem',
        lineHeight: 1.4,
        color: '#64748b',
        paddingLeft: 48,
      }}>
        {forma.detalhe}
      </p>
    </div>
  )
}

/** Manual BID Frete §4.02 — mapa das quatro formas de criar cotação avulsa. */
export function ManualInfograficoBidFreteCotacaoAvulsaFormas() {
  return (
    <div
      role="group"
      aria-label="Formas de criar cotação avulsa: Manual, planilha, API e Smart Docs"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(56,189,248,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {FORMAS.map((forma) => (
          <CardForma key={forma.num} forma={forma} />
        ))}
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.68rem',
        lineHeight: 1.5,
        color: CORPO_70,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <CheckCircle size={16} weight="duotone" color="#34d399" aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#cbd5e1' }}>Manual</strong> abre o wizard na tela.
          <strong style={{ color: '#cbd5e1' }}> Planilha</strong>,{' '}
          <strong style={{ color: '#cbd5e1' }}>API</strong> e{' '}
          <strong style={{ color: '#cbd5e1' }}>Smart Docs</strong> aparecem no menu com badge{' '}
          <strong style={{ color: '#cbd5e1' }}>Em breve</strong>: use os subtópicos deste capítulo quando
          estiverem disponíveis.
        </p>
      </div>
    </div>
  )
}
