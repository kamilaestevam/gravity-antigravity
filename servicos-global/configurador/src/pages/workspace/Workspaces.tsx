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
import { ModalEditarWorkspace } from './ModalEditarWorkspace'
import { ModalExclusao } from './ModalConfirmarExclusao'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/export-service'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { extractCatchError } from '../../utils/extract-api-error'
import { useShellStore } from '@gravity/shell'
import { workspaceApi } from '../../services/api-client'

// Status canonical em DDD: valor do enum no banco é PT-UPPER (ATIVO/INATIVO),
// dívida documentada para migração futura para EN UPPER_SNAKE (REGRA 7).
export type WorkspaceStatus = 'ATIVO' | 'INATIVO'

export interface Workspace {
  id_workspace: string
  nome_workspace: string
  subdominio_workspace: string
  quantidade_usuarios_workspace: number
  status_workspace: WorkspaceStatus
  data_criacao_workspace: string
  cnpj_workspace?: string
  estado_workspace?: string
  cidade_workspace?: string
  segmento_workspace?: string
  site_workspace?: string
  nome_organizacao?: string
}

function rotuloStatus(s: WorkspaceStatus): 'Ativa' | 'Suspensa' {
  return s === 'ATIVO' ? 'Ativa' : 'Suspensa'
}

export function Workspaces() {
  const { t } = useTranslation()
  const { isLoaded: userLoaded } = useUser()
  const addNotification = useShellStore((s) => s.addNotification)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [carregando, setCarregando] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [workspaceEditando, setWorkspaceEditando] = useState<Workspace | null>(null)
  const [workspaceParaExcluir, setWorkspaceParaExcluir] = useState<Workspace | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // Carrega workspaces da API (Zod parse via workspaceApi — Mand. 06 + 09)
  useEffect(() => {
    if (!userLoaded) return
    let cancelado = false
    async function carregarWorkspaces() {
      try {
        setCarregando(true)
        const { workspaces: lista } = await workspaceApi.getWorkspaces()
        if (cancelado) return
        setWorkspaces(lista.map<Workspace>((w) => ({
          id_workspace: w.id_workspace,
          nome_workspace: w.nome_workspace,
          subdominio_workspace: w.subdominio_workspace ?? '',
          quantidade_usuarios_workspace: w.quantidade_usuarios_workspace ?? w._count?.vinculos_workspace ?? 0,
          status_workspace: (w.status_workspace === 'ATIVO' ? 'ATIVO' : 'INATIVO') as WorkspaceStatus,
          data_criacao_workspace: typeof w.data_criacao_workspace === 'string'
            ? new Date(w.data_criacao_workspace).toLocaleDateString('pt-BR')
            : w.data_criacao_workspace.toLocaleDateString('pt-BR'),
          cnpj_workspace: w.cnpj_workspace ?? undefined,
        })))
      } catch (err) {
        if (!cancelado) {
          addNotification({ type: 'error', message: extractCatchError(err, 'Falha ao carregar workspaces.') })
        }
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }
    carregarWorkspaces()
    return () => { cancelado = true }
  }, [userLoaded])

  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && workspaces.length > 0) {
      const cleanId = idParam.replace(/^(f|ws_)/, '').split('_')[0]
      const encontrado = workspaces.find(w => w.id_workspace === cleanId || w.id_workspace === idParam)
      if (encontrado) {
        setWorkspaceEditando(encontrado)
        setShowForm(true)
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('id')
        setSearchParams(newParams, { replace: true })
      }
    }
  }, [searchParams, workspaces])

  const ativos = workspaces.filter(w => w.status_workspace === 'ATIVO').length
  const suspensos = workspaces.filter(w => w.status_workspace === 'INATIVO').length

  async function handleAdd(dados: Partial<Workspace>) {
    try {
      const { workspace } = await workspaceApi.createWorkspace({
        nome_workspace: dados.nome_workspace ?? '',
        subdominio_workspace: dados.subdominio_workspace,
        cnpj_workspace: dados.cnpj_workspace,
      })
      const novo: Workspace = {
        id_workspace: workspace.id_workspace,
        nome_workspace: workspace.nome_workspace,
        subdominio_workspace: workspace.subdominio_workspace ?? dados.subdominio_workspace ?? '',
        quantidade_usuarios_workspace: workspace.quantidade_usuarios_workspace ?? 0,
        status_workspace: (workspace.status_workspace === 'ATIVO' ? 'ATIVO' : 'INATIVO') as WorkspaceStatus,
        data_criacao_workspace: typeof workspace.data_criacao_workspace === 'string'
          ? new Date(workspace.data_criacao_workspace).toLocaleDateString('pt-BR')
          : new Date().toLocaleDateString('pt-BR'),
        cnpj_workspace: workspace.cnpj_workspace ?? undefined,
      }
      setWorkspaces(prev => [...prev, novo])
      addNotification({ type: 'success', message: `Workspace "${novo.nome_workspace}" criado com sucesso!` })
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao criar workspace. Verifique sua conexão.') })
    }
    setShowForm(false)
  }

  async function handleUpdate(dados: Partial<Workspace>) {
    if (!workspaceEditando) return
    try {
      // Subdomínio é IMUTÁVEL após criação (decisão 2026-05-03 / ADR 0002).
      // Backend rejeita `subdominio_workspace` no PATCH via Zod `.strict()`.
      await workspaceApi.updateWorkspace(workspaceEditando.id_workspace, {
        nome_workspace: dados.nome_workspace,
        cnpj_workspace: dados.cnpj_workspace,
      })
      setWorkspaces(prev =>
        prev.map(w => w.id_workspace === workspaceEditando.id_workspace ? { ...w, ...dados } : w)
      )
      addNotification({ type: 'success', message: `Workspace "${dados.nome_workspace ?? workspaceEditando.nome_workspace}" atualizado com sucesso!` })
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao atualizar workspace. Verifique sua conexão.') })
    }
    setShowForm(false)
    setWorkspaceEditando(null)
  }

  async function handleSuspend(linha: Workspace) {
    const novoStatus: WorkspaceStatus = linha.status_workspace === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      await workspaceApi.updateWorkspace(linha.id_workspace, { status_workspace: novoStatus })
      setWorkspaces(prev =>
        prev.map(w => w.id_workspace === linha.id_workspace ? { ...w, status_workspace: novoStatus } : w)
      )
      addNotification({
        type: novoStatus === 'INATIVO' ? 'warning' : 'success',
        message: `Workspace "${linha.nome_workspace}" ${novoStatus === 'INATIVO' ? 'suspenso' : 'reativado'} com sucesso.`,
      })
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Erro ao alterar status. Verifique sua conexão.') })
    }
  }

  // Abre o modal de confirmação. A exclusão real só roda no aoConfirmar do modal.
  function handleDelete(linha: Workspace) {
    setWorkspaceParaExcluir(linha)
  }

  async function confirmarExclusao() {
    if (!workspaceParaExcluir) return
    const linha = workspaceParaExcluir
    try {
      await workspaceApi.deleteWorkspace(linha.id_workspace)
      setWorkspaces(prev => prev.filter(w => w.id_workspace !== linha.id_workspace))
      addNotification({ type: 'success', message: `Workspace "${linha.nome_workspace}" excluído com sucesso.` })
    } catch (err) {
      const msg = extractCatchError(err, 'Erro ao excluir workspace. Verifique sua conexão.')
      // Backend devolve 404 'Workspace não encontrado' quando o registro já não
      // existe no banco (ex.: removido em outra aba). Tratamos como "já removido"
      // — filtra da UI igualmente para o usuário ver o estado correto.
      if (/n.o\s+encontrado|not\s+found/i.test(msg)) {
        setWorkspaces(prev => prev.filter(w => w.id_workspace !== linha.id_workspace))
        addNotification({ type: 'warning', message: `Workspace "${linha.nome_workspace}" já estava removido. Lista atualizada.` })
      } else {
        addNotification({ type: 'error', message: msg })
      }
    } finally {
      setWorkspaceParaExcluir(null)
    }
  }

  function handleEdit(linha: Workspace) {
    setWorkspaceEditando(linha)
    setShowForm(true)
  }

  const COLUNAS: TabelaGlobalColuna<Workspace>[] = [
    {
      key: 'nome_workspace', label: t('workspace.workspaces.tabela.workspace'), tipo: 'texto',
      tooltipTitulo: t('workspace.workspaces.tabela.workspace'),
      tooltipDescricao: t('workspace.workspaces.tabela.workspace_desc'),
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8' }}>
            {item.nome_workspace.charAt(0)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome_workspace}</span>
        </div>
      )
    },
    {
      key: 'subdominio_workspace', label: t('workspace.workspaces.tabela.subdominio'), tipo: 'texto',
      tooltipTitulo: 'Subdomínio', tooltipDescricao: 'Endereço exclusivo deste workspace na plataforma',
      render: (_v, item) => (
        <a href={`https://${item.subdominio_workspace}.usegravity.com.br`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }} onClick={ev => ev.stopPropagation()}>
          <code className="ws-subdominio-code"
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.subdominio_workspace}.usegravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'quantidade_usuarios_workspace', label: t('workspace.workspaces.tabela.usuarios'), tipo: 'numero', align: 'center',
      tooltipTitulo: 'Usuários Ativos', tooltipDescricao: 'Total de usuários com acesso habilitado neste workspace',
      render: (v) => <span style={{ fontWeight: 600 }}>{String(v ?? 0)}</span>
    },
    {
      key: 'status_workspace', label: t('workspace.workspaces.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o workspace está operando ou com acesso suspenso',
      render: (v) => {
        const ativo = v === 'ATIVO'
        const rotulo = ativo ? 'Ativa' : 'Suspensa'
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: ativo ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: ativo ? '#34d399' : '#f87171', border: `1px solid ${ativo ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
            {rotulo}
          </span>
        )
      }
    },
    {
      key: 'data_criacao_workspace', label: t('workspace.workspaces.tabela.data_criacao'), tipo: 'texto',
      tooltipTitulo: 'Data de Criação', tooltipDescricao: 'Data em que o workspace foi cadastrado no sistema',
      render: (v) => <span style={{ color: '#94a3b8' }}>{String(v ?? '')}</span>
    }
  ]

  const ACOES: TabelaGlobalAcao<Workspace>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />,
      tooltip: 'Suspender',
      onClick: handleSuspend,
      renderCustom: (item) => {
        const ativo = item.status_workspace === 'ATIVO'
        return (
          <TooltipGlobal descricao={ativo ? 'Todo acesso deste workspace será bloqueado imediatamente' : 'Reativar acesso para este workspace'}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(item); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
              onMouseEnter={ev => { ev.currentTarget.style.background = ativo ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = ativo ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = ativo ? '#fbbf24' : '#34d399' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
            >
              {ativo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
            </button>
          </TooltipGlobal>
        )
      }
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
    { header: 'Nome',        key: 'nome_workspace'                 },
    { header: 'Subdomínio',  key: 'subdominio_workspace'           },
    { header: 'Usuários',    key: 'quantidade_usuarios_workspace'  },
    { header: 'Status',      key: 'status_workspace'               },
    { header: 'Criado em',   key: 'data_criacao_workspace'         },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'workspaces', titulo: 'Workspaces' }

  const ACOES_EXPORT: TabelaExportAcao<Workspace>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados.map(d => ({ ...d, subdominio_workspace: `${d.subdominio_workspace}.usegravity.com.br`, status_workspace: rotuloStatus(d.status_workspace) })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
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
            valor={workspaces.length}
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
                  <strong>{workspaces.length}</strong>
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
            valor={ativos}
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
                  <strong style={{ color: '#34d399' }}>{ativos}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#f87171' }}>{suspensos}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{workspaces.length ? Math.round(ativos / workspaces.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('workspace.workspaces.status_dos')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
            total={workspaces.length}
            valorPrincipal={ativos}
            corGauge="#34d399"
            legenda={[
              { label: t('workspace.workspaces.ativas'),    valor: ativos,    cor: 'green'  },
              { label: t('workspace.workspaces.suspensas'), valor: suspensos, cor: 'yellow' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong style={{ color: '#34d399' }}>{ativos}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#fbbf24' }}>{suspensos}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Total</span>
                  <strong>{workspaces.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{workspaces.length ? Math.round(ativos / workspaces.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
        </>
      }
      acoes={
        <TooltipGlobal descricao={showForm && !workspaceEditando ? "Cancelar criação" : "Cadastrar um novo workspace na organização"}>
          <BotaoGlobal
            variante={showForm && !workspaceEditando ? 'fantasma' : 'primario'}
            icone={showForm && !workspaceEditando ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
            onClick={() => { setWorkspaceEditando(null); setShowForm(true); }}
          >
            {showForm && !workspaceEditando ? t('workspace.workspaces.cancelar') : t('workspace.workspaces.novo_workspace')}
          </BotaoGlobal>
        </TooltipGlobal>
      }
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<Workspace>
          id="workspace-list"
          dados={workspaces}
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
      workspace={workspaceEditando}
      aoFechar={() => { setShowForm(false); setWorkspaceEditando(null); }}
      aoSalvar={(dados) => {
        if (workspaceEditando) {
          handleUpdate(dados)
        } else {
          handleAdd(dados)
        }
      }}
    />

    <ModalExclusao
      aberto={!!workspaceParaExcluir}
      titulo="Excluir Workspace"
      descricao={
        <>
          Tem certeza de que deseja excluir o workspace <strong>{workspaceParaExcluir?.nome_workspace}</strong>?
        </>
      }
      nomeItem="Esta ação é irreversível. O subdomínio será liberado e todos os vínculos de usuários serão removidos."
      aoConfirmar={confirmarExclusao}
      aoCancelar={() => setWorkspaceParaExcluir(null)}
    />
    </>
  )
}
