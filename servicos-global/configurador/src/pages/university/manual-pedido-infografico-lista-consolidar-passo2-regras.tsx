import React from 'react'
import { CheckCircle, MinusCircle, Warning } from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

const GRUPOS_CAMPO = [
  'Comercial', 'Exportador', 'Contato Exportador', 'Importador', 'Fabricante',
  'OPE', 'Câmbio', 'Documentos', 'Logística', 'Configuração',
  'Datas', 'Datas Etapa', 'Datas Rascunho', 'Datas Proforma', 'Datas Invoice',
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardBadge({
  icone: Icone,
  titulo,
  cor,
  borda,
  fundo,
  children,
}: {
  icone: React.ComponentType<{ size?: number; weight?: 'fill' | 'bold' | 'duotone'; color?: string }>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icone size={16} weight="fill" color={cor} aria-hidden />
        <p style={{ margin: 0, fontSize: '.76rem', fontWeight: 800, color: '#e2e8f0' }}>{titulo}</p>
      </div>
      <div style={{ fontSize: '.68rem', lineHeight: 1.5, color: CORPO_70 }}>{children}</div>
    </div>
  )
}

/** Manual Pedido § Consolidar — regras do passo 2 (comparação DE/PARA), alinhado ao modal real. */
export function ManualInfograficoPedidoListaConsolidarPasso2Regras() {
  return (
    <div
      role="group"
      aria-label="Regras de negócio do passo 2, comparar campos na consolidação"
      style={{
        background: 'linear-gradient(165deg, rgba(99,102,241,.08) 0%, rgba(148,163,184,.04) 48%, rgba(251,191,36,.05) 100%)',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 14,
        padding: '16px 16px 14px',
        marginBottom: 12,
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.04)',
      }}
    >
      <p style={{
        margin: '0 0 12px',
        fontSize: '.78rem',
        fontWeight: 700,
        color: '#e2e8f0',
        lineHeight: 1.4,
      }}>
        DE/PARA de cabeçalho do PO. O Gravity cruza dezenas de campos (Comercial, Exportador, Logística, Datas…) entre os pedidos selecionados.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        <CardBadge
          icone={Warning}
          titulo="Divergente"
          cor="#fbbf24"
          borda="rgba(251,191,36,.32)"
          fundo="rgba(245,158,11,.08)"
        >
          {renderizarNegrito('Valores **diferentes** entre origens. **Dropdown**: você escolhe qual prevalece no PO consolidado (ex.: Incoterm FOB vs CIF). Badge laranja + tooltip com valor por PO.')}
        </CardBadge>
        <CardBadge
          icone={CheckCircle}
          titulo="Igual"
          cor="#34d399"
          borda="rgba(52,211,153,.32)"
          fundo="rgba(52,211,153,.06)"
        >
          {renderizarNegrito('**Mesmo valor** em todos os pedidos, entra **automaticamente** no consolidado. Somente leitura; badge verde **igual**.')}
        </CardBadge>
        <CardBadge
          icone={MinusCircle}
          titulo="Vazio"
          cor="#64748b"
          borda="rgba(100,116,139,.28)"
          fundo="rgba(71,85,105,.12)"
        >
          {renderizarNegrito('Campo **sem dado** nas origens, permanece vazio no novo PO. Badge cinza; não exige ação.')}
        </CardBadge>
      </div>

      <div style={{
        borderRadius: 10,
        padding: '10px 12px',
        background: 'rgba(8,12,24,.25)',
        border: '1px solid rgba(148,163,184,.12)',
        marginBottom: 10,
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '.68rem', fontWeight: 700, color: '#cbd5e1' }}>
          Grupos colapsáveis (ordem na UI)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {GRUPOS_CAMPO.map((g) => (
            <span key={g} style={{
              fontSize: '.6rem',
              fontWeight: 600,
              color: '#94a3b8',
              background: 'rgba(148,163,184,.1)',
              border: '1px solid rgba(148,163,184,.18)',
              borderRadius: 999,
              padding: '3px 8px',
            }}>
              {g}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 10,
        fontSize: '.66rem',
        lineHeight: 1.45,
        color: CORPO_70,
      }}>
        <p style={{ margin: 0 }}>
          {renderizarNegrito('**Filtros:** Todos · Divergentes · Iguais · Vazios, e filtro por **pedido de origem** para focar conflitos de um PO específico.')}
        </p>
        <p style={{ margin: 0 }}>
          {renderizarNegrito('**Como fica o novo PO:** campos iguais + escolhas do passo 2 + base do **primeiro pedido** da seleção; **valor total** = soma dos origens; **itens** copiados (ou **fundidos** por **part number** se marcou no passo 1).')}
        </p>
      </div>
    </div>
  )
}
