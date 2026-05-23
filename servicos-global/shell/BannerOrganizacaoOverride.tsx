/**
 * BannerOrganizacaoOverride — Pendência #4 (Org switcher admin).
 *
 * Faixa âmbar fixa no topo da viewport, exibida APENAS quando admin Gravity
 * (SUPER_ADMIN/ADMIN) ativou override de organização via menu 🔑 "Trocar
 * Organização". Sinaliza visualmente que o admin está visualizando dados de
 * uma organização que NÃO é a sua nativa.
 *
 * Conteúdo:
 *  - Ícone 🔑 (chave).
 *  - Texto "Visualizando como **{nomeOrganizacao}**".
 *  - Botão "Voltar para Gravity" (limpa override + navega `/hub`).
 *
 * Estado é lido via `useOrganizacaoOverride()` do ShellStore. Quando override
 * é `null`, retorna `null` (não renderiza nada).
 *
 * Combinado com a classe `.layout--override-ativo` aplicada no `shell-layout`
 * raiz (vide `shell.css`), forma a marca visual completa do modo override:
 * banner âmbar no topo + borda dourada inset ao redor da tela.
 */

import React from 'react'
import { Key, ArrowUUpLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
import './banner-organizacao-override.css'

export function BannerOrganizacaoOverride(): JSX.Element | null {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { override, limparOverride } = useOrganizacaoOverride()

  if (override === null) return null

  function aoVoltar(): void {
    limparOverride()
    navigate('/hub')
  }

  return (
    <div
      className="banner-override"
      role="status"
      aria-live="polite"
      aria-label={t('banner_override.aria_label', 'Modo de visualização cross-organização ativo')}
    >
      <div className="banner-override__content">
        <Key weight="duotone" size={18} className="banner-override__icon" />
        <span className="banner-override__text">
          {t('banner_override.visualizando_como', 'Visualizando como')}{' '}
          <strong className="banner-override__org-nome">{override.nomeOrganizacao}</strong>
        </span>
      </div>

      <button
        type="button"
        className="banner-override__btn-voltar"
        onClick={aoVoltar}
        aria-label={t('banner_override.btn_voltar_aria', 'Voltar para a organização Gravity')}
      >
        <ArrowUUpLeft weight="duotone" size={14} />
        {t('banner_override.btn_voltar', 'Voltar para Gravity')}
      </button>
    </div>
  )
}
