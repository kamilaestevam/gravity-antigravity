import React from 'react'
import {
  ArrowsLeftRight,
  CheckCircle,
  ListChecks,
  MinusCircle,
  Package,
  Plus,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type RamoTransferir = {
  num: string
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  passos: string[]
}

const PASSOS_COMUNS = [
  'Selecionar item na Lista',
  'Clicar em Transferir',
  'Escolher o tipo no modal',
  'Informar quantidade',
  'Revisar e confirmar',
  'Conferir saldo na Lista',
]

const RAMOS: RamoTransferir[] = [
  {
    num: 'A',
    rotulo: 'Novo pedido',
    descricao:
      'Abre um **PO novo** no workspace: a quantidade transferida vira linha no pedido recém-criado. Ideal quando a entrega real virou um pedido separado.',
    icone: Plus,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
    passos: ['Definir número do novo PO', 'Confirmar criação', 'Ver pedido na Lista com saldo de entrada'],
  },
  {
    num: 'B',
    rotulo: 'Pedido existente',
    descricao:
      'Move a quantidade para um **pedido que já existe**: busque pelo número ou selecione na lista do modal. O saldo do item de origem diminui; o destino aumenta.',
    icone: Package,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
    passos: ['Buscar/selecionar PO destino', 'Informar quantidade', 'Confirmar transferência', 'Conferir origem e destino na Lista'],
  },
  {
    num: 'C',
    rotulo: 'Redução simples',
    descricao:
      '**Reduz o saldo** do item selecionado sem criar pedido nem mover para outro PO: quando a entrega real foi menor que a prevista e o excedente deve sair do saldo aberto.',
    icone: MinusCircle,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(245,158,11,.1)',
    passos: ['Informar quantidade a reduzir', 'Revisar impacto no saldo', 'Confirmar redução', 'Ver saldo atualizado na Lista'],
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardRamo({ ramo }: { ramo: RamoTransferir }) {
  const Icone = ramo.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '14px 14px 12px',
      background: ramo.fundo,
      border: `1px solid ${ramo.borda}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
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
          border: `1px solid ${ramo.borda}`,
        }}>
          <Icone size={20} weight="bold" color={ramo.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: ramo.cor,
            }}>
              {ramo.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {ramo.rotulo}
            </p>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.68rem',
            lineHeight: 1.45,
            color: CORPO_70,
          }}>
            {renderizarNegrito(ramo.descricao)}
          </p>
        </div>
      </div>
      <ul style={{
        margin: 0,
        padding: '0 0 0 16px',
        fontSize: '.64rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        {ramo.passos.map((passo) => (
          <li key={passo} style={{ marginBottom: 3 }}>{passo}</li>
        ))}
      </ul>
    </div>
  )
}

/** Manual Pedido § Transferir — mapa mental dos 3 tipos (Novo PO, Existente, Redução) com passos compartilhados. */
export function ManualInfograficoPedidoListaTransferirFluxo() {
  return (
    <div
      role="group"
      aria-label="Mapa mental do fluxo Transferir: três tipos com passos em comum"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.09) 0%, rgba(148,163,184,.04) 42%, rgba(52,211,153,.05) 100%)',
        border: '1px solid rgba(148,163,184,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        marginTop: 20,
        marginBottom: 24,
        boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 14,
        flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ArrowsLeftRight size={18} weight="duotone" color="#818cf8" aria-hidden />
            <span style={{
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
              3 destinos · 1 assistente
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '.9rem',
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.35,
          }}>
            Mesmo modal, três caminhos: telas parecidas
          </p>
          <p style={{
            margin: '8px 0 0',
            fontSize: '.74rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            Todos começam igual na <strong style={{ color: '#cbd5e1' }}>Lista</strong>. Depois do tipo escolhido,
            o assistente repete a lógica <strong style={{ color: '#cbd5e1' }}>quantidade → destino → revisão → confirmar</strong>: 
            só muda o destino final.
          </p>
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ListChecks size={14} weight="duotone" color="#94a3b8" aria-hidden />
          <span style={{
            fontSize: '.62rem',
            fontWeight: 800,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: '#94a3b8',
          }}>
            Trilha comum (todos os tipos)
          </span>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
        }}>
          {PASSOS_COMUNS.map((passo, idx) => (
            <React.Fragment key={passo}>
              <span style={{
                fontSize: '.62rem',
                fontWeight: 700,
                color: '#cbd5e1',
                background: 'rgba(148,163,184,.1)',
                border: '1px solid rgba(148,163,184,.2)',
                borderRadius: 999,
                padding: '4px 10px',
              }}>
                {passo}
              </span>
              {idx < PASSOS_COMUNS.length - 1 ? (
                <span style={{ color: '#64748b', fontSize: '.7rem' }} aria-hidden>→</span>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 12,
        marginBottom: 14,
      }}>
        {RAMOS.map((ramo) => (
          <CardRamo key={ramo.num} ramo={ramo} />
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
          <strong style={{ color: '#cbd5e1' }}>Novo pedido</strong> +{' '}
          <strong style={{ color: '#cbd5e1' }}>Pedido existente</strong> +{' '}
          <strong style={{ color: '#cbd5e1' }}>Redução</strong> = controle completo quando exportadores
          alteram entregas entre previstas e reais. O saldo do item de origem sempre reflete o que saiu.
        </p>
      </div>
    </div>
  )
}
