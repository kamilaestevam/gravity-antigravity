/**
 * lista-processos-core.tsx — dossiês COMEX no painel /core (infra Core, não produto).
 */

import React from 'react'
import { Plus } from '@phosphor-icons/react'

export type StatusChipPluginProcesso = 'ok' | 'warn' | 'pendente'

export interface ChipPluginProcesso {
  key: string
  label: string
  status: StatusChipPluginProcesso
}

export interface ProcessoCoreResumo {
  id: string
  num: string
  name: string
  sub: string
  badge: string
  badgeCls: string
  etapas: number[]
  plugins: ChipPluginProcesso[]
}

export interface ListaProcessosCoreProps {
  processos: ProcessoCoreResumo[]
  onAbrirProcesso: (id: string) => void
  onNovoProcesso?: () => void
  t: (key: string, defaultValue?: string) => string
}

export function ListaProcessosCore({
  processos,
  onAbrirProcesso,
  onNovoProcesso,
  t,
}: ListaProcessosCoreProps) {
  return (
    <div className="hb-proc-hero">
      <div className="hb-section-actions hb-proc-hero-head">
        <div>
          <span className="hb-section-heading hb-proc-hero-title">
            {t('hub.seus_processos', 'Seus processos')}
          </span>
          <p className="hb-proc-hero-desc">
            {t(
              'hub.seus_processos_desc',
              'Dossiês COMEX — pedidos, frete, NF e financeiro consolidados por operação.',
            )}
          </p>
        </div>
        <div className="hb-proc-hero-actions">
          {onNovoProcesso && (
            <button className="hb-proc-novo-btn" type="button" onClick={onNovoProcesso}>
              <Plus weight="bold" size={14} />
              {t('hub.novo_processo', 'Novo processo')}
            </button>
          )}
        </div>
      </div>

      <div className="hb-proc-list hb-proc-list--hero">
        {processos.map(p => (
          <div
            key={p.id}
            className="hb-proc-item hb-proc-item--hero"
            onClick={() => onAbrirProcesso(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onAbrirProcesso(p.id)
              }
            }}
          >
            <div className="hb-proc-item-main">
              <div className="hb-proc-item-top">
                <div className="hb-proc-num">{p.num}</div>
                <span className={`hb-proc-badge ${p.badgeCls}`}>{p.badge}</span>
              </div>
              <div className="hb-proc-info">
                <div className="hb-proc-name">{p.name}</div>
                <div className="hb-proc-sub">{p.sub}</div>
              </div>
              <div className="hb-proc-plugins">
                {p.plugins.map(chip => (
                  <span
                    key={chip.key}
                    className={`hb-proc-plugin hb-proc-plugin--${chip.status}`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="hb-etapas hb-etapas--hero" aria-hidden>
              {p.etapas.map((e, i) => (
                <div
                  key={i}
                  className={`hb-etapa ${e === 1 ? 'hb-etapa--done' : e === 2 ? 'hb-etapa--cur' : 'hb-etapa--pend'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
