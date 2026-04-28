import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import { Buildings, TreeStructure, CheckCircle, ChartPieSlice, FileXls, FileCsv, FileText, FilePdf, Code, PauseCircle, PlayCircle, PencilSimple, Trash, Plus, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalEditarWorkspace } from './ModalWorkspaceEditar'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'
import { extractApiError, extractCatchError } from '../../utils/extractApiError'
import { useShellStore } from '@gravity/shell'


export type EmpresaStatus = 'Ativa' | 'Suspensa'

export interface Empresa {
  id: string
  nome: string
  subdominio: string
  usuarios: number
  status: EmpresaStatus
  criadaEm: string
  cnpj?: string
  estado?: string
  cidade?: string
  segmento?: string
  site?: string
  organizacao?: string
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as any).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* sem token */ }
  return headers
}

export function Workspaces() {
  const { t } = useTranslation()
  const { isLoaded: userLoaded } = useUser()
  const addNotification = useShellStore((s) => s.addNotification)
  const [empresas, setWorkspaces] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)

  // Carregar workspaces da API real
  useEffect(() => {
    if (!userLoaded) return
    async function fetchWorkspaces() {
      try {
        setCarregando(true)
        const headers = await getAuthHeaders()
        const res = await fetch('/api/v1/organizacoes/me/workspaces', { headers })
        if (res.ok) {
          const { companies } = await res.json()
          setWorkspaces(companies.map((c: Record<string, unknown>) => ({
            id: c.id,
            nome: c.name,
            subdominio: c.subdomain ?? '',
            usuarios: c._count?.memberships ?? 0,
            status: c.status === 'ATIVO' ? 'Ativa' : 'Suspensa',
            criadaEm: c.created_at
              ? new Date(c.created_at).toLocaleDateString('pt-BR')
              : '',
          })))
        }
      } catch (err) {
        addNotification({ type: 'error', message: extractCatchError(err, 'Falha ao carregar workspaces.') })
      } finally {
        setCarregando(false)
      }
    }
    fetchWorkspaces()
  }, [userLoaded])
  const [showForm, setShowForm]    = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && empresas.length > 0) {
      // Tenta encontrar por ID (removendo prefixos f ou ws_ se necessário)
      const cleanId = idParam.replace(/^(f|ws_)/, '').split('_')[0]
      const encontrada = empresas.find(e => e.id === cleanId || e.id === idParam)
      
      if (encontrada) {
        setEmpresaEditando(encontrada)
        setShowForm(true)
        // Limpa o param para não reabrir se o usuário fechar
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('id')
        setSearchParams(newParams, { replace: true })
      }
    }
  }, [searchParams, empresas])

  const ativas = empresas.filter(e => e.status === 'Ativa').length
  const suspensas = empresas.filter(e => e.status === 'Suspensa').length


  async function handleAdd(dados: { nome: string; subdominio: string }) {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/v1/organizacoes/me/workspaces', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: dados.nome, subdomain: dados.subdominio }),
      })
      if (res.ok) {
        const company = await res.json()
        const nova: Empresa = {
          id: company.id,
          nome: company.name ?? dados.nome,
          subdominio: company.subdomain ?? dados.subdominio,
          usuarios: 0,
          status: 'Ativa',
          criadaEm: new Date().toLocaleDateString('pt-BR'),
        }
        setWorkspaces(prev => [...prev, nova])
        addNotification({ type: 'success', message: `Workspace "${dados.nome}" criado com sucesso!` })
      } else {
        let msg = 'Falha ao criar workspace. Tente novamente.'
        try {
          const body = await res.json()
          if (body?.error?.message) msg = body.error.message
        } catch { /* resposta não é JSON */ }
        addNotification({ type: 'error', message: msg })
      }
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao criar workspace. Verifique sua conexão.') })
    }
    setShowForm(false)
  }

  async function handleUpdate(dados: Partial<Empresa>) {
    if (!empresaEditando) return
    try {
      const headers = await getAuthHeaders()
      const body: Record<string, string> = {}
      if (dados.nome) body.name = dados.nome
      if (dados.subdominio) body.subdomain = dados.subdominio
      if (dados.cnpj) body.cnpj = dados.cnpj

      const res = await fetch(`/api/v1/organizacoes/me/workspaces/${empresaEditando.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setWorkspaces(prev =>
          prev.map(e => e.id === empresaEditando.id ? { ...e, ...dados } : e)
        )
        addNotification({ type: 'success', message: `Workspace "${dados.nome ?? empresaEditando.nome}" atualizado com sucesso!` })
      } else {
        const msg = await extractApiError(res, 'Falha ao atualizar workspace.')
        addNotification({ type: 'error', message: msg })
      }
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao atualizar workspace. Verifique sua conexão.') })
    }
    setShowForm(false)
    setEmpresaEditando(null)
  }

  async function handleSuspend(linha: Empresa) {
    const novoStatus = linha.status === 'Ativa' ? 'INATIVO' : 'ATIVO'
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/v1/organizacoes/me/workspaces/${linha.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: novoStatus }),
      })
      if (res.ok) {
        const statusLabel = novoStatus === 'INATIVO' ? 'Suspensa' : 'Ativa'
        setWorkspaces(prev =>
          prev.map(e => e.id === linha.id ? { ...e, status: statusLabel } : e)
        )
        addNotification({
          type: novoStatus === 'INATIVO' ? 'warning' : 'success',
          message: `Workspace "${linha.nome}" ${novoStatus === 'INATIVO' ? 'suspenso' : 'reativado'} com sucesso.`,
        })
      } else {
        const msg = await extractApiError(res, 'Falha ao alterar status do workspace.')
        addNotification({ type: 'error', message: msg })
      }
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao alterar status. Verifique sua conexão.') })
    }
  }

  async function handleDelete(linha: Empresa) {
    if (!confirm(`Tem certeza que deseja excluir "${linha.nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/v1/organizacoes/me/workspaces/${linha.id}`, {
        method: 'DELETE',
        headers,
      })
      if (res.ok || res.status === 204) {
        setWorkspaces(prev => prev.filter(e => e.id !== linha.id))
        addNotification({ type: 'success', message: `Workspace "${linha.nome}" excluído com sucesso.` })
      } else {
        const msg = await extractApiError(res, 'Falha ao excluir workspace.')
        addNotification({ type: 'error', message: msg })
      }
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao excluir workspace. Verifique sua conexão.') })
    }
  }

  function handleEdit(linha: Empresa) {
    setEmpresaEditando(linha)
    setShowForm(true)
  }

  const COLUNAS: TabelaGlobalColuna<Empresa>[] = [
    {
      key: 'nome', label: t('workspace.workspaces.tabela.workspace'), tipo: 'texto',
      tooltipTitulo: t('workspace.workspaces.tabela.workspace'),
      tooltipDescricao: t('workspace.workspaces.tabela.workspace_desc'),
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8' }}>
            {item.nome.charAt(0)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'subdominio', label: t('workspace.workspaces.tabela.subdominio'), tipo: 'texto',
      tooltipTitulo: 'Subdomínio', tooltipDescricao: 'Endereço exclusivo deste workspace na plataforma',
      render: (v, item) => (
        <a href={`https://${item.subdominio}.gravity.com.br`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }} onClick={ev => ev.stopPropagation()}>
          <code className="ws-subdominio-code"
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.subdominio}.gravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'usuarios', label: t('workspace.workspaces.tabela.usuarios'), tipo: 'numero', align: 'center',
      tooltipTitulo: 'Usuários Ativos', tooltipDescricao: 'Total de usuários com acesso habilitado neste workspace',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'status', label: t('workspace.workspaces.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o workspace está operando ou com acesso suspenso',
      render: (v) => (
        <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: v === 'Ativa' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativa' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativa' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
          {v}
        </span>
      )
    },
    {
      key: 'criadaEm', label: t('workspace.workspaces.tabela.data_criacao'), tipo: 'texto',
      tooltipTitulo: 'Data de Criação', tooltipDescricao: 'Data em que o workspace foi cadastrado no sistema',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v}</span>
    }
  ]

  const ACOES: TabelaGlobalAcao<Empresa>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />, // Será atualizado condicionalmente embaixo
      tooltip: 'Suspender',
      onClick: handleSuspend,
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'Ativa' ? 'Todo acesso deste workspace será bloqueado imediatamente' : 'Reativar acesso para este workspace'}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(item); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativa' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativa' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativa' ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {item.status === 'Ativa' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar',
      onClick: handleEdit,
    },
    {
      id: 'delete',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Excluir',
      onClick: handleDelete,
      renderCustom: (item) => (
        <TooltipGlobal descricao="Excluir permanentemente este workspace">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(248,113,113,0.12)'; ev.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; ev.currentTarget.style.color = '#f87171' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            <Trash size={15} weight="bold" />
          </button>
        </TooltipGlobal>
      )
    }
  ]

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome',        key: 'nome'       },
    { header: 'Subdomínio',  key: 'subdominio' },
    { header: 'Usuários',    key: 'usuarios'   },
    { header: 'Status',      key: 'status'     },
    { header: 'Criado em',   key: 'criadaEm'   },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'workspaces', titulo: 'Workspaces' }

  const ACOES_EXPORT: TabelaExportAcao<Empresa>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  return (
    <>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Buildings weight="duotone" size={22} />}
          titulo={t('workspace.workspaces.titulo')}
          subtitulo={t('workspace.workspaces.subtitulo')}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('workspace.workspaces.total')}
            icone={<TreeStructure weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={empresas.length}
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up',     descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+3',  direcao: 'up',     descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+12', direcao: 'up',     descricao: 'vs semestre anterior'},
              { periodo: '1a',  rotulo: '1 ano',   valor: '+30', direcao: 'up',     descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Visão Geral</p>
                <div className="cg-tooltip__row">
                  <span>Total cadastradas</span>
                  <strong>{empresas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Adicionadas hoje</span>
                  <strong>0</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('workspace.workspaces.ativos')}
            icone={<CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={ativas}
            variante="sucesso"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up',     descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+2',  direcao: 'up',     descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+8',  direcao: 'up',     descricao: 'vs semestre anterior'},
              { periodo: '1a',  rotulo: '1 ano',   valor: '-1',  direcao: 'down',   descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Atividade</p>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong style={{ color: '#34d399' }}>{ativas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#f87171' }}>{suspensas}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{empresas.length ? Math.round(ativas / empresas.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('workspace.workspaces.status_dos')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
            total={empresas.length}
            valorPrincipal={ativas}
            corGauge="#34d399"
            legenda={[
              { label: t('workspace.workspaces.ativas'),    valor: ativas,    cor: 'green'  },
              { label: t('workspace.workspaces.suspensas'), valor: suspensas, cor: 'yellow' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong style={{ color: '#34d399' }}>{ativas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#fbbf24' }}>{suspensas}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Total</span>
                  <strong>{empresas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{empresas.length ? Math.round(ativas / empresas.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
        </>
      }
      acoes={
        <TooltipGlobal descricao={showForm && !empresaEditando ? "Cancelar criação" : "Cadastrar um novo workspace na organização"}>
          <BotaoGlobal
            variante={showForm && !empresaEditando ? 'fantasma' : 'primario'}
            icone={showForm && !empresaEditando ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
            onClick={() => { setEmpresaEditando(null); setShowForm(true); }}
          >
            {showForm && !empresaEditando ? t('workspace.workspaces.cancelar') : t('workspace.workspaces.novo_workspace')}
          </BotaoGlobal>
        </TooltipGlobal>
      }
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<Empresa>
          id="workspace-list"
          dados={empresas}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio="Nenhum resultado na busca."
          mensagemSemFiltro="Nenhum workspace cadastrado."
          tooltipBusca="Localizar workspace por nome ou subdomínio"
        />
      </div>
    </PaginaGlobal>

    <ModalEditarWorkspace
      aberto={showForm}
      empresa={empresaEditando}
      aoFechar={() => { setShowForm(false); setEmpresaEditando(null); }}
      aoSalvar={(dados) => {
        if (empresaEditando) {
          handleUpdate(dados)
        } else {
          handleAdd(dados as any)
        }
      }}
    />
    </>
  )
}

