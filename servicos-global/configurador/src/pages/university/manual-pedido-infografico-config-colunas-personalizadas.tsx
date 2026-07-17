import React from 'react'
import {
  Article,
  Calculator,
  CalendarBlank,
  CheckSquare,
  Function,
  ListBullets,
  Percent,
  Sparkle,
  TextT,
  type Icon,
} from '@phosphor-icons/react'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type TipoColunaPersonalizada = {
  rotulo: string
  descricao: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
}

const TIPOS_COLUNA: TipoColunaPersonalizada[] = [
  {
    rotulo: 'Texto',
    descricao: 'Campo livre para anotações, códigos ou descrições curtas.',
    icone: TextT,
    cor: '#93c5fd',
    borda: 'rgba(147,197,253,.32)',
    fundo: 'rgba(59,130,246,.08)',
  },
  {
    rotulo: 'Número',
    descricao: 'Valores quantitativos: quantidades, totais ou métricas operacionais.',
    icone: Calculator,
    cor: '#6ee7b7',
    borda: 'rgba(110,231,183,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    rotulo: 'Data',
    descricao: 'Datas de follow-up, entrega ou marcos do pedido na Lista.',
    icone: CalendarBlank,
    cor: '#fcd34d',
    borda: 'rgba(252,211,77,.32)',
    fundo: 'rgba(245,158,11,.08)',
  },
  {
    rotulo: 'Percentual',
    descricao: 'Indicadores em %: margem, participação ou progresso.',
    icone: Percent,
    cor: '#f9a8d4',
    borda: 'rgba(249,168,212,.32)',
    fundo: 'rgba(236,72,153,.08)',
  },
  {
    rotulo: 'Lista',
    descricao: 'Opções fixas para padronizar escolhas do time na tabela.',
    icone: ListBullets,
    cor: '#a5b4fc',
    borda: 'rgba(165,180,252,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    rotulo: 'Checkbox',
    descricao: 'Flags sim/não: conferido, urgente ou etapa concluída.',
    icone: CheckSquare,
    cor: '#86efac',
    borda: 'rgba(134,239,172,.32)',
    fundo: 'rgba(34,197,94,.08)',
  },
  {
    rotulo: 'Tipo Documento',
    descricao: 'Classifica anexos e documentos vinculados ao pedido.',
    icone: Article,
    cor: '#fdba74',
    borda: 'rgba(253,186,116,.32)',
    fundo: 'rgba(249,115,22,.08)',
  },
  {
    rotulo: 'Fórmula',
    descricao: 'Valor calculado a partir de outros campos do pedido ou item.',
    icone: Function,
    cor: '#c4b5fd',
    borda: 'rgba(196,181,253,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
]

function CardTipoColuna({ tipo }: { tipo: TipoColunaPersonalizada }) {
  const Icone = tipo.icone
  return (
    <div style={{
      borderRadius: 12,
      padding: '12px 12px 11px',
      background: tipo.fundo,
      border: `1px solid ${tipo.borda}`,
      height: '100%',
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(8,12,24,.35)',
        border: `1px solid ${tipo.borda}`,
      }}>
        <Icone size={16} weight="duotone" color={tipo.cor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '.76rem',
          fontWeight: 800,
          color: '#e2e8f0',
          lineHeight: 1.35,
        }}>
          {tipo.rotulo}
        </p>
        <p style={{
          margin: '5px 0 0',
          fontSize: '.68rem',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          {tipo.descricao}
        </p>
      </div>
    </div>
  )
}

/** Manual Pedido §08 Configurações — tipos de coluna em Personalizadas */
export function ManualInfograficoPedidoConfigColunasPersonalizadas({
  margemSuperiorPx = 0,
}: {
  margemSuperiorPx?: number
}) {
  return (
    <div style={{
      background: 'linear-gradient(165deg, rgba(139,92,246,.09) 0%, rgba(148,163,184,.04) 42%, rgba(99,102,241,.06) 100%)',
      border: '1px solid rgba(148,163,184,.18)',
      borderRadius: 14,
      padding: '18px 18px 16px',
      marginTop: margemSuperiorPx,
      boxShadow: '0 10px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.04)',
    }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '.62rem',
          fontWeight: 800,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: '#c4b5fd',
          background: 'rgba(139,92,246,.12)',
          border: '1px solid rgba(167,139,250,.32)',
          borderRadius: 999,
          padding: '4px 10px',
          marginBottom: 8,
        }}>
          <Sparkle size={12} weight="fill" />
          Personalize a Lista
        </span>
        <p style={{
          margin: 0,
          fontSize: '.9rem',
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.35,
          letterSpacing: '-.01em',
        }}>
          Oito tipos para montar a tabela do seu jeito
        </p>
        <p style={{
          margin: '8px 0 0',
          fontSize: '.74rem',
          lineHeight: 1.5,
          color: CORPO_70,
        }}>
          Cada tipo vira uma coluna nova na <strong style={{ color: '#cbd5e1' }}>Lista</strong>: combine os que sua operação precisa acompanhar em cada pedido.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
        marginBottom: 12,
      }}>
        {TIPOS_COLUNA.map((tipo) => (
          <CardTipoColuna key={tipo.rotulo} tipo={tipo} />
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
      }}>
        <p style={{ margin: 0, fontWeight: 800, color: '#c4b5fd', fontSize: '.72rem', lineHeight: 1.4 }}>
          Texto + Número + Data + % + Lista + Checkbox + Documento + Fórmula = Lista sob medida
        </p>
      </div>
    </div>
  )
}
