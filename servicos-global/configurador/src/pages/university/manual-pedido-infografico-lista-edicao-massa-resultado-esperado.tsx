import React from 'react'
import { ArrowRight, PencilSimpleLine, CheckCircle } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

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
      <span style={{ fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>{valor}</span>
    </div>
  )
}

/** Manual Pedido § Edição em massa — resultado após confirmar (passo 3 do modal). */
export function ManualInfograficoPedidoListaEdicaoMassaResultadoEsperado({
  embutido = false,
}: {
  embutido?: boolean
}) {
  const paineis = (
    <>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        Após confirmar: o que muda na Lista
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.28)',
        }}>
          <p style={{
            margin: '0 0 10px', fontSize: '.68rem', fontWeight: 800,
            letterSpacing: '.05em', textTransform: 'uppercase', color: '#34d399',
          }}>
            Registros atualizados
          </p>
          <LinhaMetrica rotulo="Pedidos" valor="Contagem do resumo verde" />
          <LinhaMetrica rotulo="Itens" valor="Itens afetados na seleção" />
          <LinhaMetrica rotulo="Campos" valor="Lista campo → valor aplicado" />
          <LinhaMetrica rotulo="Na Lista" valor="Valores refletidos ao fechar o modal" />
        </div>

        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.28)',
        }}>
          <p style={{
            margin: '0 0 10px', fontSize: '.68rem', fontWeight: 800,
            letterSpacing: '.05em', textTransform: 'uppercase', color: '#f87171',
          }}>
            Se houver falha parcial
          </p>
          <LinhaMetrica rotulo="Banner" valor="Amarelo: sucessos + erros" />
          <LinhaMetrica rotulo="Detalhe" valor="PO com motivo do erro" />
          <LinhaMetrica rotulo="Demais POs" valor="Gravados normalmente" />
          <LinhaMetrica rotulo="Auditoria" valor="Histórico registra a operação" />
        </div>
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
        <PencilSimpleLine size={14} color="#818cf8" aria-hidden />
        <span>Ex.: 5 POs · 3 campos</span>
        <ArrowRight size={12} color="#64748b" aria-hidden />
        <CheckCircle size={14} color="#34d399" aria-hidden />
        <span><strong style={{ color: '#cbd5e1' }}>Valores novos</strong> visíveis na Lista</span>
      </div>
    </>
  )

  if (embutido) {
    return (
      <div role="group" aria-label="O que muda na Lista após edição em massa">
        {paineis}
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label="Resultado esperado após edição em massa"
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
