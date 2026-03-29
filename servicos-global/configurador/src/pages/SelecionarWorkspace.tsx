import React, { useState } from 'react'
import { useClerk, useUser, useAuth } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { WorkspaceSelecaoGlobal, type Empresa } from '@nucleo/modal-workspace-inicial-global'

const mockEmpresas: Empresa[] = [
  { id: 'e1', nome: 'Acme Corporation',  cnpj: '12.345.678/0001-90', plano: 'Enterprise',   cor: '#818cf8', iniciais: 'AC' },
  { id: 'e2', nome: 'Importex SA',       cnpj: '96.765.432/0001-10', plano: 'Profissional', cor: '#818cf8', iniciais: 'IS' },
  { id: 'e3', nome: 'TradeFlow Comex',   cnpj: '55.123.000/0001-44', plano: 'Básico',       cor: '#34d399', iniciais: 'TF' },
]

export function SelecionarWorkspace() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [selecionando, setSelecionando] = useState<string | null>(null)

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        const token = await getToken()
        const response = await fetch('/api/v1/tenants/companies', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // User sem tenant no DB → redireciona para onboarding
        if (response.status === 401) {
          navigate('/trial')
          return
        }

        const data = await response.json()

        if (data.companies) {
          // Mapeia o formato do banco para o formato do componente visual
          const mapeadas = data.companies.map((c: any) => ({
            id: c.id,
            nome: c.name,
            cnpj: c.cnpj || 'Sob consulta',
            plano: 'Empresarial',
            cor: '#818cf8',
            iniciais: c.name.substring(0, 2).toUpperCase()
          }))
          setEmpresas(mapeadas)
        }
      } catch (err) {
        console.error('Erro ao carregar empresas do Railway:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregarEmpresas()
  }, [getToken])

  const isAdmin = user?.publicMetadata?.role === 'gravity_admin'

  function handleSelect(empresa: Empresa) {
    setSelecionando(empresa.id)
    // Salva o workspace selecionado no sessionStorage para uso no Hub e produtos
    sessionStorage.setItem('gravity_company_id', empresa.id)
    sessionStorage.setItem('gravity_company_name', empresa.nome)
    setTimeout(() => navigate('/hub'), 600)
  }

  function handleVoltar() {
    signOut(() => navigate('/'))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font)',
      padding: '1.5rem',
      position: 'relative',
    }}>

      {/* Gradient orbs de fundo */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 70%)',
        }} />
      </div>

      {/* Card central */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(129,140,248,0.12)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'swFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        {/* Botão Voltar */}
        <TooltipGlobal descricao="Sair da sessão atual e voltar para a tela de login">
          <button
            id="sw-voltar"
            type="button"
            onClick={handleVoltar}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500,
              fontFamily: 'var(--font)', marginBottom: '2rem',
              padding: '0', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            <ArrowLeft weight="bold" size={16} />
            Voltar
          </button>
        </TooltipGlobal>

        {/* Logo + título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: '14px',
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
            marginBottom: '1.25rem',
          }}>
            <LogoGlobal iconOnly iconSize={28} iconColor="#818cf8" />
          </div>

          <h1 style={{
            fontSize: '1.5rem', fontWeight: 700,
            color: '#f1f5f9', marginBottom: '0.5rem', letterSpacing: '-0.02em',
          }}>
            Selecionar workspace
          </h1>
          <p style={{
            fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6,
            maxWidth: '300px', margin: '0 auto',
          }}>
            Escolha a empresa que deseja acessar<br />
            Cada workspace tem seus próprios produtos e usuários.
          </p>
        </div>

        {/* Lista de empresas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {carregando ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
                <LogoGlobal iconOnly iconSize={24} className="ws-rotate" iconColor="rgba(129,140,248,0.3)" />
                <p style={{ marginTop: '0.5rem' }}>Buscando workspaces no Railway...</p>
             </div>
          ) : empresas.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
                <p>Nenhuma empresa encontrada no seu tenant de Staging.</p>
             </div>
          ) : (
            empresas.map(emp => (
              <TooltipGlobal key={emp.id} titulo="AMBIENTE DE TRABALHO" descricao={`Acesse o ecossistema exclusivo da ${emp.nome} com seus próprios dados e módulos`}>
                <div style={{ width: '100%' }}>
                  <WorkspaceSelecaoGlobal
                    empresa={emp}
                    selecionando={selecionando === emp.id}
                    onClick={() => handleSelect(emp)}
                    disabled={selecionando !== null}
                  />
                </div>
              </TooltipGlobal>
            ))
          )}
        </div>

        {/* Linha divisória */}
        <div style={{
          height: '1px',
          background: 'rgba(129,140,248,0.08)',
          marginBottom: '1.25rem',
        }} />

        {/* Criar nova empresa */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <TooltipGlobal titulo="EXPANDIR OPERAÇÃO" descricao="Registre uma nova organização e provisione um banco de dados isolado">
            <div style={{ width: '100%' }}>
              <button
                id="sw-criar-empresa"
                type="button"
                onClick={() => navigate('/workspace/workspaces')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', width: '100%',
                  padding: '0.8125rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(129,140,248,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)'
                  e.currentTarget.style.color = '#818cf8'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = '#94a3b8'
                }}
              >
                <Plus weight="bold" size={16} />
                Criar nova empresa
              </button>
            </div>
          </TooltipGlobal>
        </div>

        {/* Acesso Admin */}
        {isAdmin && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(129,140,248,0.08)' }}>
            <TooltipGlobal titulo="MODO ARQUITETURA" descricao="Acesso exclusivo para administradores gerenciarem instâncias e clusters">
              <button
                id="sw-admin-panel"
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.8125rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  color: '#10b981', fontSize: '0.875rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font)',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <ShieldCheck weight="duotone" size={20} />
                Acessar Painel Admin (Gravity)
              </button>
            </TooltipGlobal>
          </div>
        )}
      </div>

      <style>{`
        @keyframes swFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
