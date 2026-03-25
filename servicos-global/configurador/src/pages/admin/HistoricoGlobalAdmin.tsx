import React, { useState } from 'react'
import { Desktop, User, Robot, Export, DownloadSimple, HardDrives } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'

type DiffObj = {
  campo: string
  antes: string
  depois: string
}

type LogHistorico = {
  id: string
  quando: string // ISO date pra sorting se precisar, ou texto amigável pra exibição direta
  quemNome: string
  quemTipo: 'user' | 'gabi' | 'system'
  acao: string
  oQueFoiFeito: string
  entidade: string
  diff?: DiffObj[]
}

const mockLogs: LogHistorico[] = [
  {
    id: 'l1',
    quando: '2026-03-24T15:40:00',
    quemNome: 'Daniel Martins',
    quemTipo: 'user',
    acao: 'ALTERAÇÃO',
    oQueFoiFeito: 'Alterou configurações da Gabi: GEMINI_API_KEY atualizada',
    entidade: 'Configurações da Gabi AI',
    diff: [
      { campo: 'GEMINI_API_KEY', antes: 'undefined', depois: 'sk-antigravity...' }
    ]
  },
  {
    id: 'l2',
    quando: '2026-03-20T15:42:00',
    quemNome: 'Daniel Martins',
    quemTipo: 'user',
    acao: 'ALTERAÇÃO',
    oQueFoiFeito: 'Alterou configurações da Gabi: GEMINI_API_KEY atualizada',
    entidade: 'Configurações da Gabi AI',
    diff: [
      { campo: 'GEMINI_API_KEY', antes: 'undefined', depois: 'sk-antigravity...' }
    ]
  },
  {
    id: 'l3',
    quando: '2026-03-18T21:47:00',
    quemNome: 'Daniel Martins',
    quemTipo: 'user',
    acao: 'ALTERAÇÃO',
    oQueFoiFeito: 'Alterou configurações da Gabi: GEMINI_API_KEY atualizada',
    entidade: 'Configurações da Gabi AI',
    diff: [
      { campo: 'GEMINI_API_KEY', antes: 'undefined', depois: 'sk-antigravity...' }
    ]
  },
  {
    id: 'l4',
    quando: '2026-03-15T10:15:00',
    quemNome: 'Gabi AI',
    quemTipo: 'gabi',
    acao: 'IA',
    oQueFoiFeito: 'Gerou relatório de performance de acessos do tenant Gravity HQ',
    entidade: 'Relatórios Inteligentes',
    diff: []
  },
  {
    id: 'l5',
    quando: '2026-03-10T08:00:00',
    quemNome: 'Sistema',
    quemTipo: 'system',
    acao: 'EXPORTAÇÃO',
    oQueFoiFeito: 'Backup semanal da base de dados concluído',
    entidade: 'Backup Global',
    diff: []
  }
]

const corAcao: Record<string, { bg: string, text: string, border: string }> = {
  'CRIAÇÃO': { bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)' },
  'ALTERAÇÃO': { bg: 'rgba(129,140,248,0.12)', text: '#818cf8', border: 'rgba(129,140,248,0.3)' },
  'EXCLUSÃO': { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
  'ENVIO': { bg: 'rgba(192,132,252,0.12)', text: '#c084fc', border: 'rgba(192,132,252,0.3)' },
  'RECEBIMENTO': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  'EXPORTAÇÃO': { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  'LOGIN': { bg: 'rgba(45,212,191,0.12)', text: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
  'CONFIGURAÇÃO': { bg: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
  'IA': { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function renderDiffTable(diffs: DiffObj[]) {
  if (!diffs || diffs.length === 0) {
    return (
     <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>
       Nenhum detalhe de campo alterado registrado para essa ação.
     </div>
    )
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '20%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Campo</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '40%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Antes</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '40%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Depois</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((d, i) => (
            <tr key={i} style={{ borderBottom: i < diffs.length - 1 ? '1px solid rgba(129,140,248,0.06)' : 'none' }}>
              <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 500 }}>{d.campo}</td>
              <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}>{d.antes || <span style={{ color: '#64748b', fontStyle: 'italic' }}>vazio</span>}</td>
              <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}>{d.depois || <span style={{ color: '#64748b', fontStyle: 'italic' }}>vazio</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HistoricoGlobalAdmin() {
  const COLUNAS: TabelaGlobalColuna<LogHistorico>[] = [
    {
      key: 'quando', label: 'QUANDO', tipo: 'periodo',
      tooltipTitulo: 'Timestamp (UTC)', tooltipDescricao: 'Registro de data/hora (ISO-8601) em que o evento foi gravado na tabela de auditoria.',
      render: (v) => <span style={{ color: '#cbd5e1' }}>{formatDate(v)}</span>
    },
    {
      key: 'quemNome', label: 'QUEM', tipo: 'texto',
      tooltipTitulo: 'Identity Context', tooltipDescricao: 'Usuário autenticado (actor_id), script nativo ou modelo IA que originou o request.',
      render: (v, item) => {
        let ico = <User size={14} weight="bold" />
        if (item.quemTipo === 'gabi') ico = <Robot size={14} weight="bold" />
        else if (item.quemTipo === 'system') ico = <HardDrives size={14} weight="bold" />

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{ico}</div>
            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v}</span>
          </div>
        )
      }
    },
    {
      key: 'acao', label: 'AÇÃO', tipo: 'texto',
      tooltipTitulo: 'Event Type / CRUD', tooltipDescricao: 'Taxonomia da operação tratada e distribuída no barramento de eventos (message broker).',
      render: (v) => {
        const cor = corAcao[v as string] || corAcao['CRIAÇÃO']
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: cor.bg, color: cor.text, border: `1px solid ${cor.border}`
          }}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'oQueFoiFeito', label: 'O QUE FOI FEITO', tipo: 'texto',
      tooltipTitulo: 'Event Payload / State Diff', tooltipDescricao: 'Dados imutáveis estruturados detalhando as entradas modificadas pelo controlador.',
      render: (v, item) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8',
              }}>
                {item.entidade === 'Configurações da Gabi AI' ? 'gabi_settings' : item.entidade.toLowerCase().replace(/ /g, '_')}
              </span>
              <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.8125rem' }}>{v}</span>
            </div>
            {item.diff && item.diff.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                : <span style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{item.diff[0].antes}</span>
                <span>→</span>
                <span style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{item.diff[0].depois}</span>
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'entidade', label: 'ENTIDADE', tipo: 'texto',
      tooltipTitulo: 'Target Table/Entity', tooltipDescricao: 'Referência ao escopo isolado no schema de dados que sofreu as mutações.',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v}</span>
    }
  ]

  const acoesExportacao: TabelaExportAcao<LogHistorico>[] = [
    { label: 'Exportar CSV', icone: <Export size={14} />, onClick: () => {} },
    { label: 'Exportar Backup Log (.json)', icone: <DownloadSimple size={14} />, onClick: () => {} }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Desktop weight="duotone" size={22} />}
          titulo="Histórico Global"
          subtitulo="Registro cronológico completo de todas as alterações feitas na plataforma Gravity"
        />
      }
    >
      <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10, marginTop: '32px' }}>
        <TabelaGlobal<LogHistorico>
          dados={mockLogs}
          colunas={COLUNAS}
          acoesExportacao={acoesExportacao}
          mensagemVazio="Nenhuma alteração encontrada para estes filtros."
          mensagemSemFiltro="Nenhuma atividade registrada no histórico global."
          renderExpandido={(item) => renderDiffTable(item.diff || [])}
        />
      </div>
    </PaginaGlobal>
  )
}
