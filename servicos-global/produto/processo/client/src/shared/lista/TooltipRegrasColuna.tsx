/**
 * TooltipRegrasColuna.tsx — Tooltip padronizado com pílulas (ícone + cor + texto).
 */

import React from 'react'
import type { TFunction } from 'i18next'
import {
  PencilSimple,
  Lock,
  Copy,
  Warning,
  Sigma,
  Gear,
  Prohibit,
  ArrowsLeftRight,
  Paperclip,
  Sparkle,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { RegraPillId } from './pillsTooltipColunaLista'
import { MAX_PILLS_POR_BLOCO } from './pillsTooltipColunaLista'

const URL_FORMULA = '/produto/pedido/configuracoes?tab=colunas-campos-calculados'

type PillDef = {
  Icon: Icon
  color: string
  bg: string
}

const PILL_DEFS: Record<RegraPillId, PillDef> = {
  editavel_pedido:   { Icon: PencilSimple,     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  editavel_pedido_numero: { Icon: PencilSimple, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  editavel_item:     { Icon: PencilSimple,     color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  somente_leitura:   { Icon: Lock,             color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  replica_itens:     { Icon: Copy,             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  replica_itens_auto:{ Icon: Copy,             color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  alerta_divergencia:{ Icon: Warning,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  calculado_pedido:  { Icon: Sigma,            color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  formula_config:    { Icon: Gear,             color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  so_operacao:       { Icon: Prohibit,         color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  cond_import_export:{ Icon: ArrowsLeftRight,  color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  anexo:             { Icon: Paperclip,        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  coluna_personalizada: { Icon: Sparkle,      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
}

function RegraPill({
  id,
  t,
  subtexto,
}: {
  id: RegraPillId
  t: TFunction
  subtexto?: string
}) {
  const def = PILL_DEFS[id]
  const label = t(`pedido.lista.regras_pill.${id}`)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 6,
        background: def.bg,
        border: `1px solid ${def.color}33`,
        fontSize: 11,
        lineHeight: 1.25,
        color: 'var(--text-primary, #e2e8f0)',
        whiteSpace: 'nowrap',
      }}
    >
      <def.Icon size={12} weight="duotone" color={def.color} style={{ flexShrink: 0 }} />
      <span>
        {label}
        {subtexto ? (
          <span style={{ opacity: 0.75, fontSize: 10 }}> · {subtexto}</span>
        ) : null}
      </span>
    </span>
  )
}

function BlocoPills({
  rotulo,
  pills,
  t,
  ghostSemCheckbox,
  numeroUnicoOrg,
  omitidos,
}: {
  rotulo?: string
  pills: RegraPillId[]
  t: TFunction
  ghostSemCheckbox?: boolean
  numeroUnicoOrg?: boolean
  omitidos: number
}) {
  if (pills.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      {rotulo ? (
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.65 }}>
          {rotulo}
        </span>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
        {pills.map(id => (
          <RegraPill
            key={id}
            id={id}
            t={t}
            subtexto={
              id === 'editavel_pedido' && ghostSemCheckbox
                ? t('pedido.lista.regras_pill.ghost_sem_checkbox')
                : id === 'editavel_pedido' && numeroUnicoOrg
                  ? t('pedido.lista.regras_pill.numero_unico_org')
                  : undefined
            }
          />
        ))}
      </div>
      {omitidos > 0 ? (
        <span style={{ fontSize: 10, opacity: 0.6 }}>
          {t('pedido.lista.regras_pill.mais_regras', { count: omitidos })}
        </span>
      ) : null}
    </div>
  )
}

export type TooltipRegrasColunaProps = {
  t: TFunction
  pillsPedido?: RegraPillId[]
  pillsItem?: RegraPillId[]
  dual?: boolean
  aviso?: React.ReactNode
  descricaoExtra?: string
  linkFormula?: boolean
  ghostSemCheckbox?: boolean
  numeroUnicoOrg?: boolean
}

export function TooltipRegrasColuna({
  t,
  pillsPedido = [],
  pillsItem = [],
  dual = false,
  aviso,
  descricaoExtra,
  linkFormula = false,
  ghostSemCheckbox = false,
  numeroUnicoOrg = false,
}: TooltipRegrasColunaProps) {
  const omitPedido = 0
  const omitItem = 0

  const temFormulaLink = linkFormula || pillsPedido.includes('formula_config') || pillsItem.includes('formula_config')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320, textAlign: 'left' }}>
      {aviso ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            color: '#F59E0B',
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          <Warning size={14} weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{aviso}</span>
        </div>
      ) : null}

      {descricaoExtra ? (
        <span style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.4 }}>{descricaoExtra}</span>
      ) : null}

      {dual ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 10,
            rowGap: 4,
            alignItems: 'start',
          }}
        >
          <BlocoPills
            rotulo={t('pedido.lista.regras_pill.rotulo_pedido')}
            pills={pillsPedido}
            t={t}
            ghostSemCheckbox={ghostSemCheckbox}
            numeroUnicoOrg={false}
            omitidos={omitPedido}
          />
          <BlocoPills
            rotulo={t('pedido.lista.regras_pill.rotulo_item')}
            pills={pillsItem}
            t={t}
            omitidos={omitItem}
          />
        </div>
      ) : (
        <BlocoPills
          pills={pillsPedido.length > 0 ? pillsPedido : pillsItem}
          t={t}
          ghostSemCheckbox={ghostSemCheckbox}
          numeroUnicoOrg={numeroUnicoOrg}
          omitidos={0}
        />
      )}

      {temFormulaLink ? (
        <a
          href={URL_FORMULA}
          style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'underline' }}
        >
          {t('pedido.lista.regras_pill.link_configurador')}
        </a>
      ) : null}
    </div>
  )
}
