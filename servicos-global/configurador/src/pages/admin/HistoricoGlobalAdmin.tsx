import React, { useState, useEffect } from 'react'
import { Desktop, User, Robot, Export, DownloadSimple, HardDrives, Info, Funnel } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


type DiffObj = {
  campo: string
  antes: string
  depois: string
}

type LogHistorico = {
  id: string
  quando: string // ISO date
  quemNome: string
  quemTipo: 'user' | 'gabi' | 'system'
  acao: string
  oQueFoiFeito: string
  entidade: string
  diff?: DiffObj[]
}

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
  const [logs, setLogs] = useState<LogHistorico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true)
        const res = await fetch('/api/tenant/historico-global/logs')
        if (res.ok) {
           const result = await res.json()
           // Mapeamento DB -> Frontend
           const mappedLogs: LogHistorico[] = (result.data || []).map((dbLog: any) => ({
             id: dbLog.id,
             quando: dbLog.created_at,
             quemNome: dbLog.actor_id,
             quemTipo: dbLog.actor_type === 'GABI_IA' ? 'gabi' : dbLog.actor_type === 'SYSTEM' ? 'system' : 'user',
             acao: dbLog.action,
             oQueFoiFeito: dbLog.metadata?.oQueFoiFeito || dbLog.action,
             entidade: dbLog.metadata?.entidade || dbLog.product_id || 'Sistema',
             diff: dbLog.metadata?.diff || []
           }))
           setLogs(mappedLogs)
        }
      } catch (err) {
        console.warn("Falha ao carregar registros do histórico:", err)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

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

  const opcoesResponsavel = [
    { valor: 'todos', rotulo: 'Todos os Responsáveis' },
    { valor: 'user', rotulo: 'Usuários Administrativos' },
    { valor: 'gabi', rotulo: 'Gabi AI' },
    { valor: 'system', rotulo: 'Sistema / Rotinas' },
  ]

  const opcoesAcao = [
    { valor: 'todas', rotulo: 'Todas as Ações' },
    { valor: 'alteracao', rotulo: 'Alterações' },
    { valor: 'criacao', rotulo: 'Criações' },
    { valor: 'exclusao', rotulo: 'Exclusões' },
    { valor: 'login', rotulo: 'Logins / Acessos' },
  ]

  const [filtroResponsavel, setFiltroResponsavel] = useState<string | null>('todos')
  const [filtroAcao, setFiltroAcao] = useState<string | null>('todas')

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Desktop weight="duotone" size={22} />}
          titulo="Histórico Global"
          subtitulo="Registro cronológico completo de todas as alterações feitas na plataforma Gravity"
          acoes={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TooltipGlobal 
                titulo="Processamento Descentralizado" 
                descricao="Registros recentes podem levar alguns instantes para constar no histórico devido ao processamento assíncrono e análise temporal."
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px', cursor: 'help' }}>
                  <Info size={18} weight="duotone" color="#3b82f6" />
                </div>
              </TooltipGlobal>
            </div>
          }
        />
      }
    >
      <div className="ws-fade-up" style={{ display: 'flex', flexDirection: 'column', marginTop: '16px', position: 'relative', zIndex: 10 }}>
        {/* Toolbar de Filtros - UX 10 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px',
          background: 'none', 
          padding: '0',
          border: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginRight: '4px' }}>
            <Funnel size={14} weight="bold" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filtrar</span>
          </div>

          <div style={{ width: '220px' }}>
            <SelectGlobal 
              opcoes={opcoesResponsavel} 
              valor={filtroResponsavel} 
              aoMudarValor={(v) => setFiltroResponsavel(v as string)} 
              placeholder="Responsável..." 
            />
          </div>

          <div style={{ width: '200px' }}>
            <SelectGlobal 
              opcoes={opcoesAcao} 
              valor={filtroAcao} 
              aoMudarValor={(v) => setFiltroAcao(v as string)} 
              placeholder="Ação..." 
            />
          </div>

          <div style={{ width: '220px' }}>
            <CalendarioCampoGlobal
              placeholder="Filtrar por data..."
            />
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <TabelaGlobal<LogHistorico>
            id="admin-historico-global"
            dados={logs}
            colunas={COLUNAS}
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
            mensagemVazio={loading ? "Carregando registros..." : "Nenhuma alteração encontrada para estes filtros."}
            mensagemSemFiltro="Nenhuma atividade registrada no histórico global."
            tooltipBusca="Localizar registro por nome do responsável ou descrição da ação"
            tooltipExpandir="Ver detalhes técnicos da alteração (diff do estado)"
            tooltipRecolher="Recolher detalhes técnicos"
            renderExpandido={(item) => renderDiffTable(item.diff || [])}
          />
      </div>
      </div>
    </PaginaGlobal>
  )
}

