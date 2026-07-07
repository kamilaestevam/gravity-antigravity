import React from 'react'
import { ArrowRight, CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function CelulaMetrica({
  rotulo,
  valor,
  destaque = false,
  cor = '#38bdf8',
}: {
  rotulo: string
  valor: string
  destaque?: boolean
  cor?: string
}) {
  return (
    <div style={{
      borderRadius: 10,
      padding: '10px 12px',
      background: destaque ? 'rgba(56,189,248,.1)' : 'rgba(8,12,24,.28)',
      border: `1px solid ${destaque ? 'rgba(56,189,248,.35)' : 'rgba(148,163,184,.14)'}`,
      minWidth: 0,
    }}>
      <p style={{
        margin: 0,
        fontSize: '.58rem',
        fontWeight: 800,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        lineHeight: 1.3,
      }}>
        {rotulo}
      </p>
      <p style={{
        margin: '5px 0 0',
        fontSize: destaque ? '1.05rem' : '.92rem',
        fontWeight: 800,
        color: destaque ? cor : '#e2e8f0',
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {valor}
      </p>
    </div>
  )
}

function PainelResumo({
  titulo,
  cor,
  borda,
  fundo,
  children,
}: {
  titulo: string
  cor: string
  borda: string
  fundo: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      borderRadius: 12,
      padding: '12px 12px 10px',
      background: fundo,
      border: `1px solid ${borda}`,
      minWidth: 0,
    }}>
      <p style={{
        margin: '0 0 10px',
        fontSize: '.68rem',
        fontWeight: 800,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: cor,
      }}>
        {titulo}
      </p>
      {children}
    </div>
  )
}

/** Manual BID Frete § Nova cotação — resultado esperado na Lista após envio aos fornecedores. */
export function ManualInfograficoBidFreteNovaCotacaoResultadoEsperado() {
  return (
    <div
      role="group"
      aria-label="Resultado esperado na Lista após Nova cotação avulsa manual"
      style={{
        background: 'linear-gradient(165deg, rgba(56,189,248,.08) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginBottom: 12,
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        margin: '0 0 4px',
      }}>
        Resultado esperado
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        Após confirmar o envio — o que conferir na Lista
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.64rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        <ManualInfograficoRichText texto="Exemplo ilustrativo — substitua pelo **número da cotação** e **status** reais do seu workspace." />
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 12,
      }}>
        <CelulaMetrica rotulo="Número da cotação" valor="COT-2026-0142" />
        <CelulaMetrica rotulo="Fornecedores" valor="3" destaque cor="#34d399" />
        <CelulaMetrica rotulo="Status" valor="Solicitação enviada" destaque cor="#38bdf8" />
        <CelulaMetrica rotulo="Prazo" valor="12/07/2026 18:00" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
      }}>
        <PainelResumo
          titulo="Wizard concluído"
          cor="#bae6fd"
          borda="rgba(56,189,248,.32)"
          fundo="rgba(56,189,248,.08)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.68rem', color: CORPO_70 }}>
              <CheckCircle size={14} weight="duotone" color="#34d399" aria-hidden />
              <ManualInfograficoRichText texto="Aviso **cotação gerada** no passo 6" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.68rem', color: CORPO_70 }}>
              <PaperPlaneTilt size={14} weight="duotone" color="#38bdf8" aria-hidden />
              <ManualInfograficoRichText texto="E-mails/disparo registrados aos **fornecedores** selecionados" />
            </div>
          </div>
        </PainelResumo>
        <PainelResumo
          titulo="Lista — linha da cotação"
          cor="#6ee7b7"
          borda="rgba(52,211,153,.32)"
          fundo="rgba(52,211,153,.08)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.68rem', color: CORPO_70 }}>
              <ArrowRight size={14} weight="bold" color="#34d399" aria-hidden />
              <ManualInfograficoRichText texto="Nova linha visível na **Lista** com modal e rotas preenchidos" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.68rem', color: CORPO_70 }}>
              <ArrowRight size={14} weight="bold" color="#34d399" aria-hidden />
              <ManualInfograficoRichText texto="Status **Aguardando resposta** ou equivalente configurado no workspace" />
            </div>
          </div>
        </PainelResumo>
      </div>
    </div>
  )
}
