import React from 'react'
import {
  ArrowsOutLineVertical,
  Columns,
  Eye,
  Sparkle,
  UserCircle,
  type Icon,
} from '@phosphor-icons/react'
import { TOTAL_COLUNAS_CATALOGO_PEDIDO } from './manual-pedido-catalogo-colunas-dados'
import {
  MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX,
  MANUAL_ESPACO_PARAGRAFO_PX,
} from './manual-tipografia'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const ALTURA_ROTULO_LINHA_PX = 14
const ALTURA_HERO_PX = 28
const ALTURA_DESCRICAO_PX = 42

const TIPOS_COLUNA_PERSONALIZADA = [
  'Texto',
  'Data',
  'Numérico',
  'Percentual',
  'Lista',
  'Checkbox',
  'Tipo Documento',
  'Fórmula',
] as const

type AcaoNativa = {
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
}

const ACOES_NATIVAS: AcaoNativa[] = [
  {
    rotulo: '',
    descricao: '**Exibir / ocultar:** habilite só os campos nativos que importam no menu **Colunas** da **Lista**.',
    icone: Eye,
    cor: '#34d399',
  },
  {
    rotulo: 'Arrastar',
    descricao: 'Reordene colunas de pedido e item; a sequência fica no painel ativo.',
    icone: ArrowsOutLineVertical,
    cor: '#60a5fa',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function ChipTipo({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '.62rem',
      fontWeight: 700,
      letterSpacing: '.03em',
      color: '#ddd6fe',
      background: 'rgba(139,92,246,.14)',
      border: '1px solid rgba(167,139,250,.32)',
      borderRadius: 999,
      padding: '4px 9px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function IconeAcao({ icone: Icone, cor, borda }: { icone: Icon; cor: string; borda: string }) {
  return (
    <div style={{
      flexShrink: 0,
      width: 28,
      height: 28,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(8,12,24,.35)',
      border: `1px solid ${borda}`,
    }}>
      <Icone size={15} weight="duotone" color={cor} />
    </div>
  )
}

function LinhaAcao({ acao }: { acao: AcaoNativa }) {
  const Icone = acao.icone
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <IconeAcao icone={Icone} cor={acao.cor} borda="rgba(96,165,250,.25)" />
      <div style={{ minWidth: 0 }}>
        {acao.rotulo ? (
          <p style={{ margin: 0, fontSize: '.72rem', fontWeight: 800, color: '#e2e8f0' }}>
            {acao.rotulo}
          </p>
        ) : null}
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          lineHeight: 1.45,
          color: CORPO_70,
          ...(acao.rotulo ? { marginTop: 4 } : {}),
        }}>
          {renderizarNegrito(acao.descricao)}
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
        height: ALTURA_DESCRICAO_PX,
        fontSize: '.68rem',
        lineHeight: 1.45,
        color: CORPO_70,
        overflow: 'hidden',
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

/** Manual Pedido §08 Configurações — adaptabilidade nativas + personalizadas. */
export function ManualInfograficoPedidoConfiguracoesColunasAdaptacao() {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(99,102,241,.1) 0%, rgba(148,163,184,.04) 38%, rgba(52,211,153,.07) 100%)',
      border: '1px solid rgba(148,163,184,.2)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: 0,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: MANUAL_ESPACO_APOS_TITULO_INFOGRAFICO_GUIA_PX }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <Columns size={18} weight="duotone" color="#818cf8" />
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
            Adaptabilidade
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
          Nativas + personalizadas = a Lista do jeito que você precisa
        </p>
        <p style={{
          margin: `${MANUAL_ESPACO_PARAGRAFO_PX}px 0 0`,
          fontSize: '.74rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          Comece com o catálogo nativo; complemente com campos próprios do workspace. Cada usuário salva o que vê e como ordena.
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
          background: 'rgba(96,165,250,.08)',
          border: '1px solid rgba(96,165,250,.28)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}>
          <CabecalhoCard
            rotulo="Colunas nativas"
            corRotulo="#93c5fd"
            corHero="#bfdbfe"
            hero={TOTAL_COLUNAS_CATALOGO_PEDIDO}
            descricao={renderizarNegrito('Campos de **pedido** e **item** já previstos na plataforma.')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            {ACOES_NATIVAS.map((acao) => (
              <LinhaAcao key={acao.rotulo} acao={acao} />
            ))}
          </div>
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
            rotulo="Colunas personalizadas"
            corRotulo="#c4b5fd"
            corHero="#ddd6fe"
            hero={renderizarNegrito('**+ Criar Coluna**')}
            descricao={renderizarNegrito('Defina campos extras do **workspace** — **arraste**, **olho** e **Salvar** na lista abaixo.')}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 'auto',
            justifyContent: 'center',
          }}>
            {TIPOS_COLUNA_PERSONALIZADA.map((tipo) => (
              <ChipTipo key={tipo} label={tipo} />
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr',
        gap: 8,
        alignItems: 'center',
        marginBottom: MANUAL_ESPACO_PARAGRAFO_PX,
      }}>
        <CelulaFormula
          background="rgba(96,165,250,.1)"
          border="1px solid rgba(96,165,250,.22)"
          color="#bfdbfe"
        >
          {TOTAL_COLUNAS_CATALOGO_PEDIDO} nativas
        </CelulaFormula>
        <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>+</span>
        <CelulaFormula
          background="rgba(139,92,246,.1)"
          border="1px solid rgba(167,139,250,.22)"
          color="#ddd6fe"
        >
          Suas colunas
        </CelulaFormula>
        <span style={{ fontSize: '.85rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>=</span>
        <CelulaFormula
          background="rgba(52,211,153,.1)"
          border="1px solid rgba(52,211,153,.28)"
          color="#a7f3d0"
        >
          Lista adaptada
        </CelulaFormula>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '11px 12px',
        background: 'rgba(8,12,24,.28)',
        border: '1px solid rgba(148,163,184,.14)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}>
        <div style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <UserCircle size={20} weight="duotone" color="#fbbf24" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '.72rem',
            fontWeight: 800,
            color: '#fde68a',
            lineHeight: `${ALTURA_ROTULO_LINHA_PX}px`,
            height: ALTURA_ROTULO_LINHA_PX,
            display: 'flex',
            alignItems: 'center',
          }}>
            Preferências salvas por usuário
          </p>
          <p style={{
            margin: '5px 0 0',
            fontSize: '.68rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            {renderizarNegrito(
              'Colunas **visíveis**, **ordem** e **largura** na **Lista** ficam gravadas no painel ativo de cada **usuário** — ao voltar, a grade abre do seu jeito. Definições de colunas personalizadas são do **workspace**; quem vê cada campo segue a preferência individual na **Lista**.',
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
