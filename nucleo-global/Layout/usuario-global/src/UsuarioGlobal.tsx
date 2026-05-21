import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CaretDown, Gear, Sliders, Storefront, Moon, Sun, Sparkle, SignOut, Crown } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './usuario-global.css'

export interface UsuarioGlobalProps {
  userName: string
  userEmail: string
  userInitials: string
  userRole: string
  avatarUrl?: string
  isLight: boolean
  onToggleTheme: () => void
  onNavigateWorkspace: () => void
  onNavigateMarketPlace: () => void
  onSignOut: () => void
  isAdmin?: boolean
  isAdminPanel?: boolean
  onNavigateAdmin?: () => void
  onNavigateConfigurador?: () => void
  /** Modo compacto — exibe apenas o avatar no trigger, sem nome/role/caret */
  compact?: boolean
}

export function UsuarioGlobal({
  userName,
  userEmail,
  userInitials,
  userRole,
  avatarUrl,
  isLight,
  onToggleTheme,
  onNavigateWorkspace,
  onNavigateMarketPlace,
  onSignOut,
  isAdmin,
  isAdminPanel,
  onNavigateAdmin,
  onNavigateConfigurador,
  compact = false,
}: UsuarioGlobalProps) {
  const { t } = useTranslation()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const normalizedRole = userRole.toLowerCase().replace(/_/g, ' ')
  const isSuperAdmin = normalizedRole === 'super admin'
  const displayRole = userRole
  const hasAdminPrivileges = !!isAdmin
  const canAccessWorkspace = normalizedRole === 'master' || !!isAdmin

  const roleSlug: Record<string, string> = {
    'super admin': 'super-admin',
    'admin':       'admin',
    'master':      'master',
    'standard':    'standard',
    'fornecedor':  'fornecedor',
    'supplier':    'fornecedor',
    'membro':      'standard',
    'member':      'standard',
  }
  const roleClass = `ws-global-user__role--${roleSlug[normalizedRole] ?? 'default'}`

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="ws-global-user-wrap" ref={profileRef}>
      <TooltipGlobal titulo={t('usuario.perfil_conta')} descricao={t('usuario.perfil_conta_desc')}>
        <button
          className={`ws-global-user ${isSuperAdmin ? 'ws-global-user--super-admin' : ''} ${compact ? 'ws-global-user--compact' : ''}`}
          type="button"
          onClick={() => setIsProfileOpen(v => !v)}
          aria-expanded={isProfileOpen}
        >
          <div className="ws-global-user__avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt={userName} className="ws-global-user__avatar-img" />
              : userInitials}
          </div>
          {!compact && (
            <>
              <div className="ws-global-user__info">
                <span className="ws-global-user__name">{userName}</span>
                <span className={`ws-global-user__role ${roleClass}`}>{displayRole}</span>
              </div>
              <CaretDown weight="bold" size={14} className="ws-global-caret" />
            </>
          )}
        </button>
      </TooltipGlobal>

      {isProfileOpen && (
        <div className={`ws-profile-dropdown ${isSuperAdmin ? 'ws-profile-dropdown--super-admin' : ''}`}>
          <div className="ws-profile-header">
            <div className="ws-profile-avatar-lg">
              {avatarUrl
                ? <img src={avatarUrl} alt={userName} className="ws-profile-avatar-lg-img" />
                : userInitials}
            </div>
            <div className="ws-profile-details">
              <span className="ws-profile-name" title={userName}>{userName}</span>
              <span className="ws-profile-email" title={userEmail}>{userEmail}</span>
              <span className={`ws-profile-badge ws-profile-badge--${isSuperAdmin ? 'super-admin' : (roleSlug[normalizedRole] ?? 'standard')}`}>
                {displayRole}
              </span>
            </div>
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            {!isAdminPanel && (
              <>
                {canAccessWorkspace ? (
                  <button
                    className="ws-profile-item"
                    type="button"
                    onClick={() => { onNavigateWorkspace(); setIsProfileOpen(false) }}
                  >
                    <Sliders weight="duotone" size={16} /> {t('usuario.gerenciar_organizacao')}
                  </button>
                ) : (
                  <TooltipGlobal titulo={t('usuario.acesso_restrito')} descricao={t('usuario.apenas_master_org')}>
                    <button className="ws-profile-item disabled-item" type="button">
                      <Sliders weight="duotone" size={16} /> {t('usuario.gerenciar_organizacao')}
                    </button>
                  </TooltipGlobal>
                )}

                <button
                  className="ws-profile-item"
                  type="button"
                  onClick={() => { onNavigateMarketPlace(); setIsProfileOpen(false) }}
                >
                  <Storefront weight="duotone" size={16} /> {t('usuario.ir_marketplace', 'Ir para Gravity Store')}
                </button>

                {hasAdminPrivileges && (
                  <button
                    className="ws-profile-item ws-profile-item--admin"
                    type="button"
                    onClick={() => { if (onNavigateAdmin) onNavigateAdmin(); setIsProfileOpen(false) }}
                  >
                    <Crown weight="duotone" size={16} /> {t('usuario.acesso_admin')}
                  </button>
                )}
              </>
            )}

            {isAdminPanel && hasAdminPrivileges && (
              <button
                className="ws-profile-item ws-profile-item--configurador"
                type="button"
                onClick={() => { if (onNavigateConfigurador) onNavigateConfigurador(); setIsProfileOpen(false) }}
              >
                <Gear weight="duotone" size={16} /> {t('usuario.acesso_configurador')}
              </button>
            )}
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            <button
              className="ws-profile-item"
              type="button"
              onClick={() => { onToggleTheme(); setIsProfileOpen(false) }}
            >
              {isLight ? <Moon weight="duotone" size={16} /> : <Sun weight="duotone" size={16} />}
              {t('usuario.alternar_tema', { tema: isLight ? t('shell.label_tema_escuro') : t('shell.label_tema_claro') })}
            </button>
            <button className="ws-profile-item" type="button" disabled>
              <Sparkle weight="duotone" size={16} /> {t('usuario.novidades', 'Novidades')}
              <span className="ws-profile-badge-soon">{t('comum.em_breve')}</span>
            </button>
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            <button
              className="ws-profile-item ws-profile-item--danger"
              type="button"
              onClick={onSignOut}
            >
              <SignOut weight="duotone" size={16} /> {t('usuario.sair', 'Sair do Sistema')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
