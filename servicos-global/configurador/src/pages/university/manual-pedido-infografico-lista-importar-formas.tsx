import React from 'react'
import {
  ArrowsLeftRight,
  PencilSimple,
  Plus,
  Sparkle,
  UploadSimple,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type PilarFormaImportar = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const PILARES: PilarFormaImportar[] = [
  {
    num: '01',
    rotulo: 'Importar via planilha',
    descricao:
      '**Smart Import** — template `.xlsx` oficial (**disponível**) ou planilha do fornecedor (**em breve**). Upload, mapeamento, **preview** e confirmação.',
    icone: UploadSimple,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    num: '02',
    rotulo: 'Importar via API',
    descricao:
      'Integração via **API Cockpit** ou **ERP** — tokens, webhooks e conectores disparam pedidos e itens sem planilha.',
    icone: ArrowsLeftRight,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    num: '03',
    rotulo: 'Importar via Smart Read',
    descricao:
      'Leitura assistida por **IA** em PDFs e imagens — extração documental sem montar planilha. **Em breve** no menu **Novo**.',
    icone: Sparkle,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    num: '04',
    rotulo: 'Importar Manual',
    descricao:
      'Wizard em **dois passos**: cabeçalho do pedido e **itens** um a um. Melhor para POs avulsos ou ajustes pontuais.',
    icone: PencilSimple,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardPilar({ pilar }: { pilar: PilarFormaImportar }) {
  const Icone = pilar.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 13px',
      background: pilar.fundo,
      border: `1px solid ${pilar.borda}`,
      height: '100%',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0,
        width: 34,
        height: 34,
        borderRadius: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8,12,24,.35)',
        border: `1px solid ${pilar.borda}`,
      }}>
        <Icone size={18} weight="duotone" color={pilar.cor} aria-hidden />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '.68rem',
          fontWeight: 800,
          letterSpacing: '.06em',
          color: pilar.cor,
        }}>
          {pilar.num}
        </p>
        <p style={{
          margin: '4px 0 0',
          fontSize: '.78rem',
          fontWeight: 800,
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {pilar.rotulo}
        </p>
        <p style={{
          margin: '7px 0 0',
          fontSize: '.72rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          {renderizarNegrito(pilar.descricao)}
        </p>
      </div>
    </div>
  )
}

function MarcadorPassoDetalhadoImportarPlanilha({ pilar }: { pilar: PilarFormaImportar }) {
  const Icone = pilar.icone
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 8,
      background: 'rgba(52,211,153,.06)',
      border: `1px dashed ${pilar.borda}`,
    }}>
      <div
        title="Passo 01"
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: `1px solid ${pilar.borda}`,
          background: pilar.fundo,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '.5rem', fontWeight: 800, color: pilar.cor, lineHeight: 1, letterSpacing: '.04em' }}>
          01
        </span>
        <Icone size={13} weight="duotone" color={pilar.cor} aria-hidden />
      </div>
      <p style={{
        margin: 0,
        fontSize: '12.5px',
        fontWeight: 700,
        color: '#818cf8',
        letterSpacing: '.04em',
        lineHeight: 1.35,
      }}>
        01 · Importar via planilha
      </p>
    </div>
  )
}

/** Manual Pedido §05 — mapa das 4 formas de criar via Novo (paridade visual com §05 Customizar) */
export function ManualInfograficoPedidoListaImportarFormas() {
  return (
    <div
      role="group"
      aria-label="Quatro formas de incluir pedidos ou itens pelo menu Novo na Lista"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Plus size={18} weight="duotone" color="#818cf8" aria-hidden />
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
              <Sparkle size={12} weight="fill" aria-hidden />
              4 formas de incluir
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
            Quatro caminhos para criar pedidos e itens
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            No menu <strong style={{ color: '#cbd5e1' }}>Novo</strong>, escolha{' '}
            <strong style={{ color: '#cbd5e1' }}>Novo pedido</strong> ou{' '}
            <strong style={{ color: '#cbd5e1' }}>Novo item</strong> — cada opção abre uma das vias abaixo.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        alignItems: 'start',
      }}>
        {PILARES.map((pilar) => (
          <CardPilar key={pilar.num} pilar={pilar} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
        marginTop: 10,
        marginBottom: 14,
      }}>
        <MarcadorPassoDetalhadoImportarPlanilha pilar={PILARES[0]} />
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
        <p style={{ margin: 0, fontWeight: 800, color: '#a5b4fc', fontSize: '.72rem', lineHeight: 1.4 }}>
          Importar via planilha + Importar via API + Importar via Smart Read + Importar Manual = inclusão completa no workspace
        </p>
        <p style={{ margin: '6px 0 0' }}>
          Abaixo, o passo a passo do caminho <strong style={{ color: '#cbd5e1' }}>template oficial</strong> (homologado). Prints do caminho <strong style={{ color: '#cbd5e1' }}>planilha do usuário</strong> estão marcados <strong style={{ color: '#cbd5e1' }}>Em breve</strong>.
        </p>
      </div>
    </div>
  )
}
