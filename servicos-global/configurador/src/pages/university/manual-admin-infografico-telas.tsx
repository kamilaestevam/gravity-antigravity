import React from 'react'
import {
  Buildings,
  Users,
  Receipt,
  Desktop,
  CloudArrowUp,
  Pulse,
  ShieldCheck,
  ArrowsClockwise,
  Certificate,
  Database,
  CurrencyCircleDollar,
  Bug,
  Crown,
  ShoppingBagOpen,
} from '@phosphor-icons/react'
import { MANUAL_TITULO_INFOGRAFICO_ESTILO } from './manual-tipografia'

const GRUPOS = [
  {
    titulo: 'Clientes e operação',
    itens: [
      { icone: Crown, cor: '#fbbf24', titulo: 'Visão geral', desc: 'Dados da org Gravity HQ' },
      { icone: Buildings, cor: '#34d399', titulo: 'Organizações', desc: 'Tenants, status e planos' },
      { icone: Users, cor: '#60a5fa', titulo: 'Usuários globais', desc: 'Todas as contas da plataforma' },
      { icone: Receipt, cor: '#a78bfa', titulo: 'Financeiro', desc: 'Faturas e receita consolidada' },
      { icone: Desktop, cor: '#94a3b8', titulo: 'Histórico global', desc: 'Auditoria cross-tenant' },
    ],
  },
  {
    titulo: 'Plataforma e saúde',
    itens: [
      { icone: ShoppingBagOpen, cor: '#818cf8', titulo: 'Produtos Gravity', desc: 'Catálogo e contratos' },
      { icone: CloudArrowUp, cor: '#38bdf8', titulo: 'Deploy Railway', desc: 'Releases e rollback' },
      { icone: Pulse, cor: '#22d3ee', titulo: 'API Cockpit', desc: 'Saúde dos serviços (30s)' },
      { icone: ShieldCheck, cor: '#f87171', titulo: 'Segurança', desc: 'Audit trail e impersonações' },
    ],
  },
  {
    titulo: 'Integrações e cadastros',
    itens: [
      { icone: ArrowsClockwise, cor: '#4ade80', titulo: 'NCM Siscomex', desc: 'Sync e agendamento' },
      { icone: Certificate, cor: '#fb923c', titulo: 'Certificados digitais', desc: 'Upload e ativação' },
      { icone: Database, cor: '#c084fc', titulo: 'Cadastros globais', desc: 'Empresa, moeda, NCM…' },
      { icone: CurrencyCircleDollar, cor: '#2dd4bf', titulo: 'Taxas de moeda', desc: 'PTAX / Focus' },
      { icone: Bug, cor: '#f472b6', titulo: 'Log de testes', desc: 'Runner e agendamentos' },
    ],
  },
] as const

/** Mapa mental — menu lateral do Painel Admin Gravity */
export function ManualInfograficoAdminTelas() {
  return (
    <div style={{
      background: 'rgba(148,163,184,.04)',
      border: '1px solid rgba(148,163,184,.14)',
      borderRadius: 14,
      padding: '16px 18px 18px',
    }}>
      <p style={MANUAL_TITULO_INFOGRAFICO_ESTILO}>
        Mapa mental: áreas do Painel Admin
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo}>
            <p style={{
              fontSize: '.72rem', fontWeight: 700, color: '#818cf8', margin: '0 0 8px',
              letterSpacing: '.04em', textTransform: 'uppercase',
            }}>
              {grupo.titulo}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 8,
            }}>
              {grupo.itens.map((item) => {
                const Icone = item.icone
                return (
                  <div
                    key={item.titulo}
                    style={{
                      borderRadius: 10,
                      padding: '10px 12px',
                      background: 'rgba(148,163,184,.05)',
                      border: '1px solid rgba(148,163,184,.12)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Icone size={16} weight="duotone" color={item.cor} />
                      <span style={{ fontWeight: 600, fontSize: '.78rem', color: 'var(--ws-text,#f1f5f9)' }}>
                        {item.titulo}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '.68rem', lineHeight: 1.4, color: 'rgba(226,232,240,.65)' }}>
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
