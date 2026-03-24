import React, { useState, useRef, useEffect } from 'react'
import { CaretDown, ShieldCheck, Gear, Buildings, CreditCard, Moon, Sun, Robot, Sparkle, SignOut } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface UsuarioGlobalProps {
  userName: string
  userEmail: string
  userInitials: string
  userRole: string
  isLight: boolean
  onToggleTheme: () => void
  onNavigateOrganizacao: () => void
  onNavigateAssinaturas: () => void
  onSignOut: () => void
}

export function UsuarioGlobal({
  userName,
  userEmail,
  userInitials,
  userRole,
  isLight,
  onToggleTheme,
  onNavigateOrganizacao,
  onNavigateAssinaturas,
  onSignOut,
}: UsuarioGlobalProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

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
          className="ws-global-user" 
          type="button"
          onClick={() => setIsProfileOpen(v => !v)}
          aria-expanded={isProfileOpen}
        >
          <div className="ws-global-user__avatar">{userInitials}</div>
          <div className="ws-global-user__info">
            <span className="ws-global-user__name">{userName}</span>
            <span className="ws-global-user__role">{userRole}</span>
          </div>
          <CaretDown weight="bold" size={14} className="ws-global-caret" />
        </button>
      </TooltipGlobal>

      {isProfileOpen && (
        <div className="ws-profile-dropdown">
          <div className="ws-profile-header">
            <div className="ws-profile-avatar-lg">{userInitials}</div>
            <div className="ws-profile-details">
              <span className="ws-profile-name" title={userName}>{userName}</span>
              <span className="ws-profile-email" title={userEmail}>{userEmail}</span>
              <span className="ws-profile-badge">{userRole}</span>
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
            {userRole !== 'Master' ? (
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

            {userRole !== 'Master' ? (
              <TooltipGlobal titulo="Acesso Restrito" descricao="Apenas usuários Master podem gerenciar assinaturas.">
                <button 
                  className="ws-profile-item disabled-item" 
                  type="button"
                  style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed', marginTop: '0.125rem' }}
                > 
                  <CreditCard weight="duotone" size={16} /> Assinaturas e Recibos
                </button>
              </TooltipGlobal>
            ) : (
              <button 
                className="ws-profile-item" 
                type="button"
                style={{ marginTop: '0.125rem' }}
                onClick={() => {
                  onNavigateAssinaturas()
                  setIsProfileOpen(false)
                }}
              > 
                <CreditCard weight="duotone" size={16} /> Assinaturas e Recibos
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
