import React from 'react'
import { ArrowRight, GitMerge, Package } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function Painel({
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
      padding: '12px 14px',
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

function LinhaMetrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      fontSize: '.68rem',
      lineHeight: 1.45,
      color: CORPO_70,
      padding: '4px 0',
      borderBottom: '1px solid rgba(148,163,184,.1)',
    }}>
      <span>{rotulo}</span>
      <span style={{ fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{valor}</span>
    </div>
  )
}

/** Manual Pedido § Consolidar — resultado na Lista após confirmar (origens arquivadas + 1 PO novo). */
export function ManualInfograficoPedidoListaConsolidarResultadoEsperado({
  embutido = false,
}: {
  /** Sem moldura externa — para bloco unificado com prints 05–06. */
  embutido?: boolean
}) {
  const paineis = (
    <>
      <p style={{
        margin: embutido ? '0 0 12px' : '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        Após confirmar, o que muda na Lista
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <Painel titulo="Pedidos de origem" cor="#f87171" borda="rgba(248,113,113,.28)" fundo="rgba(248,113,113,.06)">
          <LinhaMetrica rotulo="Status na Lista" valor="Saem da visão ativa" />
          <LinhaMetrica rotulo="No banco" valor="Soft delete + status consolidado" />
          <LinhaMetrica rotulo="Itens" valor="Permanecem no histórico" />
          <p style={{ margin: '8px 0 0', fontSize: '.64rem', color: CORPO_70 }}>
            {renderizarNegrito('Rastreio em **Histórico**: audit trail registra a operação.')}
          </p>
        </Painel>

        <Painel titulo="PO consolidado (novo)" cor="#34d399" borda="rgba(52,211,153,.28)" fundo="rgba(52,211,153,.06)">
          <LinhaMetrica rotulo="Número" valor="Definido no passo 1" />
          <LinhaMetrica rotulo="Valor total" valor="Soma dos POs origem" />
          <LinhaMetrica rotulo="Itens" valor="Cópia ou fundidos (part number)" />
          <LinhaMetrica rotulo="Campos" valor="Iguais + escolhas do passo 2" />
          <LinhaMetrica rotulo="Rastreabilidade" valor="ids_origem_consolidacao_pedido" />
        </Painel>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px 12px',
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.66rem',
        color: CORPO_70,
      }}>
        <Package size={14} color="#94a3b8" aria-hidden />
        <span>Ex.: 3 POs selecionados</span>
        <ArrowRight size={12} color="#64748b" aria-hidden />
        <GitMerge size={14} color="#818cf8" aria-hidden />
        <span><strong style={{ color: '#cbd5e1' }}>1 PO novo</strong> na Lista</span>
        <ArrowRight size={12} color="#64748b" aria-hidden />
        <span>3 origens arquivadas</span>
      </div>
    </>
  )

  if (embutido) {
    return (
      <div role="group" aria-label="O que muda na Lista após consolidar">
        {paineis}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Resultado esperado após consolidar pedidos"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 48%, rgba(52,211,153,.05) 100%)',
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
      {paineis}
    </div>
  )
}
