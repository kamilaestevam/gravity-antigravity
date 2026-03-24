import React, { useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Buildings,
  CheckCircle,
} from '@phosphor-icons/react'

interface Empresa {
  id: string
  nome: string
  cnpj: string
  plano: string
  cor: string
  iniciais: string
}

const mockEmpresas: Empresa[] = [
  { id: 'e1', nome: 'Acme Corporation',  cnpj: '12.345.678/0001-90', plano: 'Enterprise',   cor: '#818cf8', iniciais: 'AC' },
  { id: 'e2', nome: 'Importex SA',       cnpj: '96.765.432/0001-10', plano: 'Profissional', cor: '#818cf8', iniciais: 'IS' },
  { id: 'e3', nome: 'TradeFlow Comex',   cnpj: '55.123.000/0001-44', plano: 'Básico',       cor: '#34d399', iniciais: 'TF' },
]

const planoBadgeColor: Record<string, string> = {
  Enterprise:   '#818cf8',
  Profissional: '#818cf8',
  Básico:       '#94a3b8',
}

export function SelecionarWorkspace() {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [selecionando, setSelecionando] = useState<string | null>(null)

  function handleSelect(empresa: Empresa) {
    setSelecionando(empresa.id)
    // Simula carregamento breve antes de entrar no workspace
    setTimeout(() => navigate('/workspace'), 600)
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
            Escolha a empresa que deseja acessar.<br />
            Cada workspace tem seus próprios produtos e usuários.
          </p>
        </div>

        {/* Lista de empresas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {mockEmpresas.map(emp => (
            <button
              key={emp.id}
              id={`sw-empresa-${emp.id}`}
              type="button"
              onClick={() => handleSelect(emp)}
              disabled={selecionando !== null}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: selecionando === emp.id
                  ? 'rgba(129,140,248,0.1)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selecionando === emp.id
                  ? 'rgba(129,140,248,0.35)'
                  : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '12px',
                cursor: selecionando !== null ? 'default' : 'pointer',
                textAlign: 'left', width: '100%',
                fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!selecionando) {
                  e.currentTarget.style.background = 'rgba(129,140,248,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)'
                }
              }}
              onMouseLeave={e => {
                if (selecionando !== emp.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, minWidth: 40,
                borderRadius: '10px',
                background: `${emp.cor}18`,
                border: `1px solid ${emp.cor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Buildings weight="duotone" size={18} color={emp.cor} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: '0.9375rem',
                  color: '#f1f5f9', margin: '0 0 0.175rem',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {emp.nome}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                  {emp.cnpj}
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem', fontWeight: 700,
                    background: `${planoBadgeColor[emp.plano] ?? '#94a3b8'}15`,
                    color: planoBadgeColor[emp.plano] ?? '#94a3b8',
                    border: `1px solid ${planoBadgeColor[emp.plano] ?? '#94a3b8'}25`,
                  }}>
                    {emp.plano}
                  </span>
                </p>
              </div>

              {/* Check ao selecionar */}
              {selecionando === emp.id && (
                <CheckCircle weight="fill" size={20} color="#818cf8" />
              )}
            </button>
          ))}
        </div>

        {/* Linha divisória */}
        <div style={{
          height: '1px',
          background: 'rgba(129,140,248,0.08)',
          marginBottom: '1.25rem',
        }} />

        {/* Criar nova empresa */}
        <button
          id="sw-criar-empresa"
          type="button"
          onClick={() => navigate('/trial')}
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

      <style>{`
        @keyframes swFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
