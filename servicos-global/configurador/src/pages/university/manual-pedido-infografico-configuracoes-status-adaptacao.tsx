import React from 'react'
import {
  ArrowsDownUp,
  FlowArrow,
  Kanban,
  ListBullets,
  Sparkle,
  type Icon,
} from '@phosphor-icons/react'
import { ManualPedidoAccordionCatalogoStatusLista } from './manual-pedido-accordion-status-lista'
import {
  TOTAL_STATUS_SISTEMA_PEDIDO,
} from './manual-pedido-catalogo-status-pedido-dados'
import {
  MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX,
  MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const ALTURA_ROTULO_LINHA_PX = 14
const ALTURA_HERO_PX = 28
const ALTURA_DESCRICAO_CARD_PX = 63

const ESTILO_CAIXA_INFOGRAFICO: React.CSSProperties = {
  borderRadius: 14,
  padding: '18px 18px 16px',
  marginTop: 0,
  boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
}

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function LinhaBeneficio({ icone: Icone, rotulo, descricao, cor }: {
  icone: Icon
  rotulo: string
  descricao: string
  cor: string
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8,12,24,.35)',
        border: `1px solid ${cor}40`,
      }}>
        <Icone size={15} weight="duotone" color={cor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 800, color: '#e2e8f0' }}>
          {rotulo}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '.68rem', lineHeight: 1.45, color: CORPO_70 }}>
          {renderizarNegrito(descricao)}
        </p>
      </div>
    </div>
  )
}

function CabecalhoCard({
  rotulo,
  hero,
  descricao,
  corRotulo,
  corHero,
}: {
  rotulo: string
  hero: React.ReactNode
  descricao: React.ReactNode
  corRotulo: string
  corHero: string
}) {
  return (
    <>
      <p style={{
        margin: 0,
        height: ALTURA_ROTULO_LINHA_PX,
        fontSize: '.58rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: corRotulo,
        lineHeight: `${ALTURA_ROTULO_LINHA_PX}px`,
      }}>
        {rotulo}
      </p>
      <div style={{
        marginTop: 6,
        height: ALTURA_HERO_PX,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: corHero,
        lineHeight: 1,
      }}>
        {hero}
      </div>
      <p style={{
        margin: '4px 0 12px',
        minHeight: ALTURA_DESCRICAO_CARD_PX,
        fontSize: '.68rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        {descricao}
      </p>
    </>
  )
}

function CelulaFormula({
  children,
  background,
  border,
  color,
}: {
  children: React.ReactNode
  background: string
  border: string
  color: string
}) {
  return (
    <div style={{
      borderRadius: 10,
      padding: '8px 12px',
      background,
      border,
      fontSize: '.66rem',
      fontWeight: 700,
      color,
      textAlign: 'center',
      minWidth: 0,
    }}>
      {children}
    </div>
  )
}

/** Manual Pedido §08 Configurações — rotina de sistema + status do workspace. */
export function ManualInfograficoPedidoConfiguracoesStatusAdaptacao() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX }}>
      <div style={{
        ...ESTILO_CAIXA_INFOGRAFICO,
        background: 'linear-gradient(165deg, rgba(99,102,241,.1) 0%, rgba(148,163,184,.04) 38%, rgba(52,211,153,.07) 100%)',
        border: '1px solid rgba(148,163,184,.2)',
      }}>
      <div style={{ marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
          flexWrap: 'wrap',
        }}>
          <FlowArrow size={18} weight="duotone" color="#818cf8" />
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
            <Sparkle size={12} weight="fill" />
            Rotina COMEX
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: '.92rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          Status de sistema + etapas do workspace = fluxo alinhado à sua operação
        </p>
        <p style={{
          margin: `${MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX}px 0 0`,
          fontSize: '.74rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito('**Status de sistema** mantêm a rotina de importação, transferência e encerramento; **status próprios** espelham o processo do workspace.')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: MANUAL_ESPACO_PARAGRAFO_PX,
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
        alignItems: 'stretch',
      }}>
        <div style={{
          borderRadius: 12,
          padding: '14px 14px 13px',
          background: 'rgba(251,191,36,.08)',
          border: '1px solid rgba(251,191,36,.28)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}>
          <CabecalhoCard
            rotulo="Status de sistema"
            corRotulo="#fde68a"
            corHero="#fef3c7"
            hero={TOTAL_STATUS_SISTEMA_PEDIDO}
            descricao={renderizarNegrito('**Rascunho**, **Aberto**, **Transferido**, **Consolidado** e **Cancelado**.')}
          />
        </div>

        <div style={{
          borderRadius: 12,
          padding: '14px 14px 13px',
          background: 'rgba(139,92,246,.08)',
          border: '1px solid rgba(167,139,250,.28)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}>
          <CabecalhoCard
            rotulo="Status do workspace"
            corRotulo="#c4b5fd"
            corHero="#ddd6fe"
            hero={renderizarNegrito('**+ Novo Status**')}
            descricao={renderizarNegrito('**Em Andamento** e **Aprovado** já vêm no catálogo — edite **cor**, **nome** e **ordem** ou crie etapas com **+ Novo Status**.')}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
            marginTop: 'auto',
          }}>
            {['Em Andamento', 'Aprovado', 'Seu status'].map((label) => (
              <span key={label} style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '.62rem',
                fontWeight: 700,
                color: '#ddd6fe',
                background: 'rgba(139,92,246,.14)',
                border: '1px solid rgba(167,139,250,.32)',
                borderRadius: 999,
                padding: '4px 9px',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr',
        gap: 8,
        alignItems: 'center',
        marginBottom: MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX,
      }}>
        <CelulaFormula
          background="rgba(251,191,36,.1)"
          border="1px solid rgba(251,191,36,.22)"
          color="#fef3c7"
        >
          {TOTAL_STATUS_SISTEMA_PEDIDO} de sistema
        </CelulaFormula>
        <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>+</span>
        <CelulaFormula
          background="rgba(139,92,246,.1)"
          border="1px solid rgba(167,139,250,.22)"
          color="#ddd6fe"
        >
          Suas etapas
        </CelulaFormula>
        <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>=</span>
        <CelulaFormula
          background="rgba(52,211,153,.1)"
          border="1px solid rgba(52,211,153,.28)"
          color="#a7f3d0"
        >
          Fluxo adaptado
        </CelulaFormula>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '11px 12px',
        background: 'rgba(8,12,24,.28)',
        border: '1px solid rgba(148,163,184,.14)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
      }}>
        <LinhaBeneficio
          icone={Kanban}
          cor="#60a5fa"
          rotulo="Kanban alinhado"
          descricao="A **ordem** salva aqui vira colunas no board."
        />
        <LinhaBeneficio
          icone={ListBullets}
          cor="#34d399"
          rotulo="Lista e filtros"
          descricao="Painéis e filtros seguem a sequência configurada."
        />
        <LinhaBeneficio
          icone={ArrowsDownUp}
          cor="#a78bfa"
          rotulo="Arraste para reordenar"
          descricao="**Arraste** e **Salvar** — reflete na **Lista** e no **Kanban**."
        />
      </div>
      </div>

      <ManualPedidoAccordionCatalogoStatusLista />
    </div>
  )
}
