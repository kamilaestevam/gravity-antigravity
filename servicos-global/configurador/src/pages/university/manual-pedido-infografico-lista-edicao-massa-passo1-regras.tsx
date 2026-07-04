import React from 'react'
import { Package, ListChecks, CubeTransparent, PencilSimpleLine } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

/** Manual Pedido § Edição em massa — regras do passo 1 (Campos), alinhado ao modal real. */
export function ManualInfograficoPedidoListaEdicaoMassaPasso1Regras() {
  return (
    <div
      role="group"
      aria-label="Regras do passo 1, selecionar campos na edição em massa"
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
        Passo 1 · Campos
      </p>
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        {renderizarNegrito('Defina, em cada linha, o **nível**, o **campo**, a **operação** e o **valor**. Use **+ Adicionar campo** para incluir mais alterações no mesmo lote.')}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(99,102,241,.08)', border: '1px solid rgba(129,140,248,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={16} weight="fill" color="#818cf8" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Pedido</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Edição campos do **Pedido**.')}
          </p>
        </div>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.28)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ListChecks size={16} weight="fill" color="#34d399" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Item</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Edição de campos do **Item**.')}
          </p>
        </div>
        <div style={{
          borderRadius: 12, padding: '12px 14px',
          background: 'rgba(148,163,184,.08)', border: '1px solid rgba(148,163,184,.22)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CubeTransparent size={16} weight="fill" color="#94a3b8" aria-hidden />
            <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>Combinado</p>
          </div>
          <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>
            {renderizarNegrito('Campos de **Pedidos** e **Itens** na mesma tela.')}
          </p>
        </div>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        fontSize: '.66rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <PencilSimpleLine size={14} color="#818cf8" aria-hidden />
          <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Operações por tipo</span>
        </div>
        <p style={{ margin: 0 }}>
          {renderizarNegrito('**Texto / select / NCM:** substituir · **Número:** substituir, somar, subtrair, percentual · **Data:** substituir, avançar/recuar dias. Campos **calculados**, **somente leitura** e **únicos** (ex.: **Nº do Pedido**) com vários pedidos selecionados ficam bloqueados. **Colunas criadas pelo usuário** também são editáveis.')}
        </p>
      </div>
    </div>
  )
}
