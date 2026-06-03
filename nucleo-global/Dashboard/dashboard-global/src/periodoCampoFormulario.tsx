/**
 * PeriodoCampoFormulario — PeriodDropdown em formulários (modal editar / construtor).
 * Mesma lista e UX da barra do dashboard (inclui Tudo + personalizado).
 */

import React from 'react'
import { CaretDown, CaretUp, CalendarBlank } from '@phosphor-icons/react'
import { PeriodDropdown, type PeriodOption } from './DashboardBarraFerramentas/DashboardBarraFerramentas.js'

import './DashboardConstrutorConsulta/dashboard-construtor-consulta.css'
import './DashboardBarraFerramentas/dashboard-barra-integrado.css'

export function PeriodoCampoFormulario({
  value,
  options,
  onChange,
}: {
  value: string
  options: PeriodOption[]
  onChange: (value: string) => void
}) {
  return (
    <div className="dq-periodo-campo db-no-drag">
      <PeriodDropdown
        value={value}
        options={options}
        onChange={onChange}
        alinharPainel="esquerda"
        painelClassName="dq-periodo-painel"
        renderGatilho={({ open, selectedLabel, isCustom, onToggle }) => (
          <button
            type="button"
            className="db-no-drag dq-form__periodo-trigger"
            onClick={onToggle}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="dq-form__periodo-trigger__texto">
              {isCustom && <CalendarBlank size={14} weight="bold" aria-hidden />}
              <span className="dq-form__periodo-trigger__label">{selectedLabel}</span>
            </span>
            {open
              ? <CaretUp size={14} weight="bold" className="dq-form__periodo-trigger__caret" aria-hidden />
              : <CaretDown size={14} weight="bold" className="dq-form__periodo-trigger__caret" aria-hidden />}
          </button>
        )}
      />
    </div>
  )
}
