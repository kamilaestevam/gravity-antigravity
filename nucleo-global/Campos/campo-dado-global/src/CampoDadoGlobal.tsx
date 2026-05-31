import React, { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Lock, PencilSimple } from '@phosphor-icons/react'
import './campo-dado-global.css'

export type ModoCampoDadoGlobal = 'editavel' | 'somente_leitura' | 'bloqueado'

export type StatusPreenchimentoCampoDadoGlobal = 'preenchido' | 'vazio-opc' | 'vazio-obrig'

export interface CampoDadoGlobalProps {
  label: string
  modo: ModoCampoDadoGlobal
  icone?: ReactNode
  valor?: string | null
  obrigatorio?: boolean
  /** Texto auxiliar (ex.: motivo do bloqueio). */
  motivo?: string
  /** Conteúdo customizado no corpo (ex.: popover de data). */
  children?: ReactNode
  statusPreenchimento?: StatusPreenchimentoCampoDadoGlobal
  className?: string
  /** Ocupa as duas colunas do grid pai. */
  spanDuasColunas?: boolean
}

function textoExibicao(valor: string | null | undefined): string | null {
  if (valor == null) return null
  const t = valor.trim()
  if (t === '' || t === '—') return null
  return t
}

export function CampoDadoGlobal({
  label,
  modo,
  icone,
  valor,
  obrigatorio = false,
  motivo,
  children,
  statusPreenchimento = 'preenchido',
  className = '',
  spanDuasColunas = false,
}: CampoDadoGlobalProps) {
  const { t } = useTranslation()
  const texto = textoExibicao(valor)

  const badgeModo =
    modo === 'editavel'
      ? t('comum.campo_modo_editavel', 'Editável')
      : modo === 'bloqueado'
        ? t('comum.campo_modo_bloqueado', 'Bloqueado')
        : t('comum.campo_modo_somente_leitura', 'Somente leitura')

  const IconeModo =
    modo === 'editavel' ? PencilSimple : modo === 'bloqueado' ? Lock : Eye

  const classes = [
    'cdado',
    `cdado--${modo.replaceAll('_', '-')}`,
    `cdado--${statusPreenchimento}`,
    spanDuasColunas ? 'cdado--span-2' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="cdado-status" aria-hidden />

      <div className="cdado-head">
        {icone != null && <span className="cdado-icon" aria-hidden>{icone}</span>}
        <span className="cdado-label">{label}</span>
        {obrigatorio && (
          <span className="cdado-required" title={t('comum.obrigatorio', 'Obrigatório')}>
            *
          </span>
        )}
        <span className="cdado-modo-badge">
          <IconeModo weight="bold" size={10} aria-hidden />
          {badgeModo}
        </span>
      </div>

      <div className="cdado-body">
        {children ?? (
          <div className="cdado-valor">
            {texto != null ? (
              <span className="cdado-texto">{texto}</span>
            ) : (
              <span className="cdado-vazio">—</span>
            )}
            {modo === 'editavel' && (
              <PencilSimple
                weight="duotone"
                size={14}
                className="cdado-icone-acao"
                aria-hidden
              />
            )}
          </div>
        )}
      </div>

      {motivo != null && motivo.trim() !== '' && (
        <p className="cdado-motivo" role="note">
          {motivo}
        </p>
      )}
    </div>
  )
}
