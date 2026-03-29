import React, { useState, useRef, useEffect } from 'react'
import { CaretDown, ShieldCheck, Gear, Buildings, Storefront, Moon, Sun, Robot, Sparkle, SignOut, Crown } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './usuario-global.css'

export interface UsuarioGlobalProps {
  userName: string
  userEmail: string
  userInitials: string
  userRole: string
  isLight: boolean
  onToggleTheme: () => void
  onNavigateOrganizacao: () => void
  onNavigateMarketPlace: () => void
  onSignOut: () => void
  isAdmin?: boolean
  isAdminPanel?: boolean
  onNavigateAdmin?: () => void
  onNavigateConfigurador?: () => void
}

export function UsuarioGlobal({
  userName,
  userEmail,
  userInitials,
  userRole,
  isLight,
  onToggleTheme,
  onNavigateOrganizacao,
  onNavigateMarketPlace,
  onSignOut,
  isAdmin,
  isAdminPanel,
  onNavigateAdmin,
  onNavigateConfigurador,
}: UsuarioGlobalProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // ── Inteligência de Identidade ──────────────────────────────────────────
  // Centralizamos aqui quem é Super Admin da plataforma Gravity
  const SUPER_ADMIN_EMAILS = ['dmmltda@gmail.com', 'admin@gravity.com.br']
  const isSuperAdminUser = SUPER_ADMIN_EMAILS.includes(userEmail)
  
  // O papel exibido e o acesso administrativo são calculados aqui
  const displayRole = isSuperAdminUser ? 'Super Admin' : userRole
  const hasAdminPrivileges = isSuperAdminUser || isAdmin

  // Estilos específicos para Super Admin (Verde Platinum)
  // Caso contrário, mantemos os estilos padrão (Master/Violet/Muted)
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
      <TooltipGlobal titulo="Perfil e Conta" descricao="Gerencie preferências de acesso e encerre sua sessão">
        <button 
          className={`ws-global-user ${isSuperAdminUser ? 'ws-global-user--super-admin' : ''}`} 
          type="button"
          onClick={() => setIsProfileOpen(v => !v)}
          aria-expanded={isProfileOpen}
        >
          <div className="ws-global-user__avatar">{userInitials}</div>
          <div className="ws-global-user__info">
            <span className="ws-global-user__name">{userName}</span>
            <span className="ws-global-user__role">{displayRole}</span>
          </div>
          <CaretDown weight="bold" size={14} className="ws-global-caret" />
        </button>
      </TooltipGlobal>

      {isProfileOpen && (
        <div className={`ws-profile-dropdown ${isSuperAdminUser ? 'ws-profile-dropdown--super-admin' : ''}`}>
          <div className="ws-profile-header">
            <div className="ws-profile-avatar-lg">{userInitials}</div>
            <div className="ws-profile-details">
              <span className="ws-profile-name" title={userName}>{userName}</span>
              <span className="ws-profile-email" title={userEmail}>{userEmail}</span>
              <span className="ws-profile-badge">{displayRole}</span>
            </div>
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            <button 
              className="ws-profile-item" 
              type="button"
              disabled
            > 
              <ShieldCheck weight="duotone" size={16} /> Segurança e Acesso
              <span className="ws-profile-badge-soon">Em breve</span>
            </button>
            <button 
              className="ws-profile-item" 
              type="button"
              disabled
            > 
              <Gear weight="duotone" size={16} /> Preferências
              <span className="ws-profile-badge-soon">Em breve</span>
            </button>
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            {!isAdminPanel && (
              <>
                {displayRole !== 'Master' && !isSuperAdminUser ? (
                  <TooltipGlobal titulo="Acesso Restrito" descricao="Apenas usuários Master podem gerenciar a organização.">
                    <button 
                      className="ws-profile-item disabled-item" 
                      type="button"
                      style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
                    > 
                      <Buildings weight="duotone" size={16} /> Gerenciar Organização
                    </button>
                  </TooltipGlobal>
                ) : (
                  <button 
                    className="ws-profile-item" 
                    type="button"
                    onClick={() => {
                      onNavigateOrganizacao()
                      setIsProfileOpen(false)
                    }}
                  > 
                    <Buildings weight="duotone" size={16} /> Gerenciar Organização
                  </button>
                )}

                <button
                  className="ws-profile-item"
                  type="button"
                  style={{ marginTop: '0.125rem' }}
                  onClick={() => {
                    onNavigateMarketPlace()
                    setIsProfileOpen(false)
                  }}
                >
                  <Storefront weight="duotone" size={16} /> Ir para Market Place
                </button>
              </>
            )}

            {hasAdminPrivileges && !isAdminPanel && (
              <button 
                className="ws-profile-item ws-profile-item--admin" 
                type="button"
                style={{ marginTop: '0.125rem' }}
                onClick={() => {
                  if (onNavigateAdmin) onNavigateAdmin()
                  setIsProfileOpen(false)
                }}
              > 
                <Crown weight="duotone" size={16} /> Acesso ao Admin
              </button>
            )}

            {hasAdminPrivileges && isAdminPanel && (
              <button 
                className="ws-profile-item ws-profile-item--configurador" 
                type="button"
                style={{ marginTop: '0.125rem' }}
                onClick={() => {
                  if (onNavigateConfigurador) onNavigateConfigurador()
                  setIsProfileOpen(false)
                }}
              > 
                <Gear weight="duotone" size={16} /> Acesso ao Configurador
              </button>
            )}
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            <button 
              className="ws-profile-item" 
              type="button"
              onClick={() => {
                onToggleTheme()
                setIsProfileOpen(false)
              }}
            > 
              {isLight ? <Moon weight="duotone" size={16} /> : <Sun weight="duotone" size={16} />} 
              Alternar para Tema {isLight ? 'Escuro' : 'Claro'}
            </button>
            <button 
              className="ws-profile-item" 
              type="button"
              disabled
            > 
              <Robot weight="duotone" size={16} /> Central de Ajuda
              <span className="ws-profile-badge-soon">Em breve</span>
            </button>
            <button 
              className="ws-profile-item" 
              type="button"
              disabled
            > 
              <Sparkle weight="duotone" size={16} /> Novidades
              <span className="ws-profile-badge-soon">Em breve</span>
            </button>
          </div>

          <div className="ws-profile-separator" />

          <div className="ws-profile-section">
            <button 
              className="ws-profile-item ws-profile-item--danger" 
              type="button"
              onClick={onSignOut}
            > 
              <SignOut weight="duotone" size={16} /> Sair do Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
