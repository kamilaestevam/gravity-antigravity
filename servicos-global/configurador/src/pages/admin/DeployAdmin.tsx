import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CloudArrowUp, User, GitCommit, CheckCircle, XCircle,
  ArrowUUpLeft, Clock, Plus, Trash, Buildings,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { ModalExclusao } from '../workspace/ModalConfirmarExclusao'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useHistoricoLogger } from '../../hooks/useHistoricoLogger'
import {
  adminDeploysApi,
  setAuthTokenProvider,
  type DeployApi,
  type DeployEnvironment,
  type DeployStatus,
} from '../../services/apiClient'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'
import { extractCatchError } from '../../utils/extractApiError'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Áreas canônicas do Gravity — enum fonte-de-verdade
const AREAS_GRAVITY = [
  'configurador',
  'nucleo-global',
  'pedido',
  'bid-frete',
  'bid-cambio',
  'simula-custo',
  'nf-importacao',
  'lpco',
  'financeiro-comex',
  'historico-global',
  'email',
  'dashboard',
  'gabi',
  'notificacoes',
  'whatsapp',
  'devops',
  'infraestrutura',
] as const

const AREA_LABELS: Record<string, string> = {
  configurador: 'Configurador',
  'nucleo-global': 'Núcleo Global',
  pedido: 'Pedido',
  'bid-frete': 'Bid Frete',
  'bid-cambio': 'Bid Câmbio',
  'simula-custo': 'Simula Custo',
  'nf-importacao': 'NF Importação',
  lpco: 'LPCO',
  'financeiro-comex': 'Financeiro COMEX',
  'historico-global': 'Histórico Global',
  email: 'Email',
  dashboard: 'Dashboard',
  gabi: 'Gabi',
  notificacoes: 'Notificações',
  whatsapp: 'WhatsApp',
  devops: 'DevOps',
  infraestrutura: 'Infraestrutura',
}

function areaBadgeColors(area: string): { bg: string; text: string; border: string } {
  // Palette por grupo — agrupamento pragmático
  const infra = ['devops', 'infraestrutura']
  const core = ['configurador', 'nucleo-global', 'historico-global']
  const produto = ['pedido', 'bid-frete', 'bid-cambio', 'simula-custo', 'nf-importacao', 'lpco', 'financeiro-comex']
  const servico = ['email', 'dashboard', 'gabi', 'notificacoes', 'whatsapp']

  if (infra.includes(area)) return { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)' }
  if (core.includes(area)) return { bg: 'rgba(129,140,248,0.12)', text: '#818cf8', border: 'rgba(129,140,248,0.3)' }
  if (produto.includes(area)) return { bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }
  if (servico.includes(area)) return { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
  return { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
}

const ENVIRONMENT_LABEL: Record<DeployEnvironment, string> = {
  DESENVOLVIMENTO: 'DEV',
  HOMOLOGACAO: 'HOMOLOGAÇÃO',
  PRODUCAO: 'PRODUÇÃO',
  TODOS: 'TODOS',
}

function envBadgeColors(env: DeployEnvironment): { bg: string; text: string; border: string } {
  switch (env) {
    case 'PRODUCAO': return { bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }
    case 'HOMOLOGACAO': return { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
    case 'DESENVOLVIMENTO': return { bg: 'rgba(129,140,248,0.12)', text: '#818cf8', border: 'rgba(129,140,248,0.3)' }
    case 'TODOS': return { bg: 'rgba(192,132,252,0.12)', text: '#c084fc', border: 'rgba(192,132,252,0.3)' }
  }
}

const STATUS_LABEL: Record<DeployStatus, string> = {
  SUCESSO: 'Concluído',
  FALHOU: 'Falhado',
  REVERTIDO: 'Revertido',
  EM_ANDAMENTO: 'Em andamento',
}

function statusVisual(status: DeployStatus): { icone: React.ReactNode; bg: string; text: string; border: string } {
  switch (status) {
    case 'SUCESSO':
      return { icone: <CheckCircle size={14} weight="bold" />, bg: 'rgba(52,211,153,0.12)', text: '#34d399', border: 'rgba(52,211,153,0.3)' }
    case 'FALHOU':
      return { icone: <XCircle size={14} weight="bold" />, bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)' }
    case 'REVERTIDO':
      return { icone: <ArrowUUpLeft size={14} weight="bold" />, bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
    case 'EM_ANDAMENTO':
      return { icone: <Clock size={14} weight="bold" />, bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' }
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function DeployAdmin() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore(s => s.addNotification)
  const { logEvent } = useHistoricoLogger()

  const [deploys, setDeploys] = useState<DeployApi[]>([])
  const [carregando, setCarregando] = useState(true)

  // Paginação
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalDeploys, setTotalDeploys] = useState(0)
  const LIMITE = 50

  const carregarDados = useCallback(async () => {
    setAuthTokenProvider(() => getToken())
    setCarregando(true)
    try {
      const res = await adminDeploysApi.list({ page: pagina, limit: LIMITE })
      setDeploys(res.deploys)
      setTotalPaginas(res.pagination.pages)
      setTotalDeploys(res.pagination.total)
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, t('admin.deploy.msg_erro_carregar') ?? 'Falha ao carregar histórico de deploys.'),
      })
    } finally {
      setCarregando(false)
    }
  }, [getToken, pagina, addNotification, t])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ─── Estado do modal Registrar Deploy ────────────────────────────────────

  const [modalAberto, setModalAberto] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [formArea, setFormArea] = useState<string | null>(null)
  const [formVersion, setFormVersion] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEnvironment, setFormEnvironment] = useState<DeployEnvironment>('PRODUCAO')
  const [formStatus, setFormStatus] = useState<DeployStatus>('SUCESSO')
  const [salvando, setSalvando] = useState(false)

  const [deployParaExcluir, setDeployParaExcluir] = useState<DeployApi | null>(null)

  const resetForm = () => {
    setFormDirty(false)
    setFormArea(null)
    setFormVersion('')
    setFormDescription('')
    setFormEnvironment('PRODUCAO')
    setFormStatus('SUCESSO')
  }

  const abrirModal = () => {
    resetForm()
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    resetForm()
  }

  const handleSalvar = async () => {
    if (!formArea || !formVersion.trim() || !formDescription.trim()) {
      addNotification({
        type: 'error',
        message: t('admin.deploy.modal_validacao') ?? 'Preencha área, versão e descrição',
      })
      return
    }

    setSalvando(true)
    try {
      const { deploy } = await adminDeploysApi.create({
        area: formArea,
        version: formVersion.trim(),
        description: formDescription.trim(),
        environment: formEnvironment,
        status: formStatus,
      })

      fecharModal()
      addNotification({
        type: 'success',
        message: t('admin.deploy.msg_registrado', { version: deploy.version }) ?? `Deploy ${deploy.version} registrado`,
      })

      logEvent({
        action: 'CRIAÇÃO',
        module: 'deploy',
        resource_type: 'Deploy',
        resource_id: deploy.id,
        action_detail: `Deploy registrado: ${deploy.area} ${deploy.version} em ${deploy.environment}`,
      })

      carregarDados()
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, t('admin.deploy.modal_falha_salvar') ?? 'Falha ao registrar deploy'),
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async () => {
    if (!deployParaExcluir) return
    const id = deployParaExcluir.id
    const version = deployParaExcluir.version
    try {
      await adminDeploysApi.delete(id)
      setDeployParaExcluir(null)
      addNotification({
        type: 'success',
        message: t('admin.deploy.msg_excluido', { version }) ?? `Deploy ${version} removido`,
      })
      logEvent({
        action: 'EXCLUSÃO',
        module: 'deploy',
        resource_type: 'Deploy',
        resource_id: id,
        action_detail: `Deploy ${version} (${deployParaExcluir.area}) removido do histórico`,
      })
      carregarDados()
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, t('admin.deploy.msg_erro_excluir') ?? 'Falha ao excluir deploy'),
      })
    }
  }

  // ─── Colunas memoizadas ──────────────────────────────────────────────────

  const COLUNAS = useMemo<TabelaGlobalColuna<DeployApi>[]>(() => [
    {
      key: 'deploy_number',
      label: '#',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Número Sequencial',
      tooltipDescricao: 'Identificador legível atribuído automaticamente a cada deploy.',
      render: (v) => (
        <code style={{
          fontSize: '0.75rem', color: '#818cf8',
          background: 'rgba(129,140,248,0.08)',
          padding: '0.125rem 0.4rem', borderRadius: '4px',
        }}>
          #{String(v).padStart(4, '0')}
        </code>
      ),
    },
    {
      key: 'deployed_at',
      label: t('admin.deploy.tabela.quando') ?? 'Quando',
      tipo: 'periodo',
      tooltipTitulo: 'Momento do Deploy',
      tooltipDescricao: 'Timestamp em que o deploy foi efetivado.',
      render: (v) => <span style={{ color: '#cbd5e1' }}>{formatDate(v as string)}</span>,
    },
    {
      key: 'deployed_by',
      label: t('admin.deploy.tabela.quem') ?? 'Quem',
      tipo: 'texto',
      tooltipTitulo: 'Responsável',
      tooltipDescricao: 'Admin Gravity que registrou o deploy.',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} weight="bold" color="#94a3b8" />
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v as string}</span>
        </div>
      ),
    },
    {
      key: 'area',
      label: t('admin.deploy.tabela.area') ?? 'Área',
      tipo: 'texto',
      tooltipTitulo: 'Módulo Afetado',
      tooltipDescricao: 'Produto, serviço ou infra do Gravity que foi atualizado.',
      render: (v) => {
        const area = v as string
        const colors = areaBadgeColors(area)
        const label = AREA_LABELS[area] ?? area
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '4px',
            fontSize: '0.6875rem', fontWeight: 600,
            background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
          }}>
            {label}
          </span>
        )
      },
    },
    {
      key: 'version',
      label: t('admin.deploy.tabela.versao') ?? 'Versão',
      tipo: 'texto',
      tooltipTitulo: 'Tag ou Hash',
      tooltipDescricao: 'Identificador da versão (semver ou git SHA).',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c084fc' }}>
          <GitCommit size={14} weight="bold" />
          <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{v as string}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descrição',
      tipo: 'texto',
      tooltipTitulo: 'O Que Foi Alterado',
      tooltipDescricao: 'Resumo das mudanças introduzidas neste deploy.',
      render: (v) => (
        <span style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>{v as string}</span>
      ),
    },
    {
      key: 'environment',
      label: 'Ambiente',
      tipo: 'texto',
      align: 'center',
      tooltipTitulo: 'Ambiente de Destino',
      tooltipDescricao: 'Onde o deploy foi aplicado (dev, staging, produção, todos).',
      render: (v) => {
        const env = v as DeployEnvironment
        const colors = envBadgeColors(env)
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '4px',
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
            background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
          }}>
            {ENVIRONMENT_LABEL[env]}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: t('admin.deploy.tabela.status') ?? 'Status',
      tipo: 'texto',
      tooltipTitulo: 'Resultado',
      tooltipDescricao: 'Se o deploy foi concluído, falhou, foi revertido ou está em andamento.',
      render: (v) => {
        const st = v as DeployStatus
        const visual = statusVisual(st)
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.25rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 600,
            background: visual.bg, color: visual.text, border: `1px solid ${visual.border}`,
          }}>
            {visual.icone}
            {STATUS_LABEL[st]}
          </span>
        )
      },
    },
  ], [t])

  const ACOES: TabelaGlobalAcao<DeployApi>[] = [
    {
      id: 'excluir',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Remover do histórico',
      onClick: (item) => setDeployParaExcluir(item),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); setDeployParaExcluir(item) }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%', background: 'transparent',
            border: '1px solid transparent', color: '#64748b', cursor: 'pointer',
            transition: 'all 0.15s', flexShrink: 0,
          }}
          onMouseEnter={ev => {
            ev.currentTarget.style.background = 'rgba(239,68,68,0.12)'
            ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
            ev.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={ev => {
            ev.currentTarget.style.background = 'transparent'
            ev.currentTarget.style.borderColor = 'transparent'
            ev.currentTarget.style.color = '#64748b'
          }}
        >
          <Trash size={16} weight="bold" />
        </button>
      ),
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────

  const areaOptions = useMemo(
    () => AREAS_GRAVITY.map(a => ({ valor: a, rotulo: AREA_LABELS[a] ?? a })),
    [],
  )

  return (
    <>
      <PaginaGlobal
        className="ws-fade-up"
        layout="lista"
        cabecalho={
          <CabecalhoGlobal
            icone={<CloudArrowUp weight="duotone" size={22} color="#818cf8" />}
            titulo={t('admin.deploy.titulo') ?? 'Deploy Railway'}
            subtitulo={t('admin.deploy.subtitulo') ?? 'Histórico de versões, status de implantação e controle de CI/CD em todos os ambientes'}
            acoes={
              <BotaoGlobal
                icone={<Plus weight="bold" />}
                variante="primario"
                onClick={abrirModal}
              >
                {t('admin.deploy.btn_registrar') ?? 'Registrar Deploy'}
              </BotaoGlobal>
            }
          />
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p className="ws-section-title" style={{ margin: 0 }}>
            <CloudArrowUp weight="duotone" size={14} color="#818cf8" />
            {t('admin.deploy.secao_historico') ?? 'Histórico de Deploys'}
            {carregando && (
              <span style={{ marginLeft: 12, fontSize: '0.75rem', color: 'var(--ws-muted)', fontWeight: 400 }}>
                {t('admin.deploy.carregando') ?? 'Carregando...'}
              </span>
            )}
          </p>
        </div>

        <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10 }}>
          <TabelaGlobal<DeployApi>
            id="admin-deploys-log"
            dados={deploys}
            colunas={COLUNAS}
            acoes={ACOES}
            mensagemVazio={t('admin.deploy.vazio_filtros') ?? 'Nenhum histórico de deploy registrado ainda.'}
            mensagemSemFiltro={t('admin.deploy.vazio_sem_filtro') ?? 'Nenhum registro.'}
            tooltipBusca={t('admin.deploy.tooltip_busca') ?? 'Buscar por versão, descrição ou autor'}
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'deploy_history', 'Histórico de Deploys Gravity')}
          />

          {totalPaginas > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 16, padding: '0 8px', fontSize: '0.8125rem', color: 'var(--ws-muted)',
            }}>
              <span>{totalDeploys} deploy(s) no total</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina <= 1 || carregando}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                    color: 'var(--ws-text)',
                    cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
                    opacity: pagina <= 1 ? 0.4 : 1,
                  }}
                >
                  ← Anterior
                </button>
                <span style={{ minWidth: 80, textAlign: 'center' }}>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas || carregando}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                    color: 'var(--ws-text)',
                    cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer',
                    opacity: pagina >= totalPaginas ? 0.4 : 1,
                  }}
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Registrar Deploy ─────────────────────────────────────── */}
        <ModalFormularioAbasGlobal
          aberto={modalAberto}
          aoFechar={fecharModal}
          aoSalvar={handleSalvar}
          icone={<CloudArrowUp weight="duotone" size={24} />}
          titulo={t('admin.deploy.modal_titulo') ?? 'Registrar Deploy'}
          subtitulo={t('admin.deploy.modal_subtitulo') ?? 'Adicione uma entrada ao histórico de deploys do Gravity'}
          tamanho="lg"
          dirty={formDirty}
          podesSalvar={
            formDirty
            && !!formArea
            && !!formVersion.trim()
            && !!formDescription.trim()
            && !salvando
          }
          abas={[
            {
              id: 'dados',
              rotulo: 'Dados do Deploy',
              conteudo: (
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <SecaoFormulario titulo="Identificação" icone={<Buildings size={16} />} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <CampoGeralGlobal label="Área afetada" obrigatorio>
                      <SelectGlobal
                        opcoes={areaOptions}
                        valor={formArea}
                        aoMudarValor={v => { setFormArea(v ? String(v) : null); setFormDirty(true) }}
                        iconeEsquerda={<Buildings size={16} />}
                        placeholder="Selecionar área..."
                        buscavel
                      />
                    </CampoGeralGlobal>

                    <CampoGeralGlobal label="Versão" obrigatorio>
                      <div className="ws-input-icon-wrap">
                        <GitCommit size={16} />
                        <input
                          type="text"
                          className="ws-input"
                          value={formVersion}
                          onChange={e => { setFormVersion(e.target.value); setFormDirty(true) }}
                          placeholder="v1.2.3 ou 8f3a1c2"
                          maxLength={100}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </CampoGeralGlobal>
                  </div>

                  <CampoGeralGlobal label="O que foi alterado" obrigatorio>
                    <textarea
                      className="ws-input"
                      value={formDescription}
                      onChange={e => { setFormDescription(e.target.value); setFormDirty(true) }}
                      placeholder="Ex: Correção do bug de paginação na lista de pedidos + refactor do módulo de autenticação"
                      maxLength={500}
                      rows={3}
                      style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </CampoGeralGlobal>

                  <SecaoFormulario titulo="Destino e Resultado" icone={<CloudArrowUp size={16} />} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <CampoGeralGlobal label="Ambiente">
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', flexWrap: 'wrap' }}>
                        {(['DESENVOLVIMENTO', 'HOMOLOGACAO', 'PRODUCAO', 'TODOS'] as const).map(env => (
                          <button
                            key={env}
                            type="button"
                            onClick={() => { setFormEnvironment(env); setFormDirty(true) }}
                            style={{
                              padding: '0.375rem 0.875rem', borderRadius: '9999px',
                              cursor: 'pointer', fontSize: '0.75rem',
                              fontWeight: formEnvironment === env ? 700 : 500,
                              border: `1px solid ${formEnvironment === env ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
                              background: formEnvironment === env ? 'rgba(16,185,129,0.15)' : 'transparent',
                              color: formEnvironment === env ? 'var(--color-primary)' : 'var(--ws-muted)',
                            }}
                          >
                            {ENVIRONMENT_LABEL[env]}
                          </button>
                        ))}
                      </div>
                    </CampoGeralGlobal>

                    <CampoGeralGlobal label="Status">
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', flexWrap: 'wrap' }}>
                        {(['SUCESSO', 'EM_ANDAMENTO', 'FALHOU', 'REVERTIDO'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => { setFormStatus(st); setFormDirty(true) }}
                            style={{
                              padding: '0.375rem 0.875rem', borderRadius: '9999px',
                              cursor: 'pointer', fontSize: '0.75rem',
                              fontWeight: formStatus === st ? 700 : 500,
                              border: `1px solid ${formStatus === st ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
                              background: formStatus === st ? 'rgba(16,185,129,0.15)' : 'transparent',
                              color: formStatus === st ? 'var(--color-primary)' : 'var(--ws-muted)',
                            }}
                          >
                            {STATUS_LABEL[st]}
                          </button>
                        ))}
                      </div>
                    </CampoGeralGlobal>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* Modal Exclusão ─────────────────────────────────────────────── */}
        <ModalExclusao
          aberto={!!deployParaExcluir}
          titulo="Remover do histórico"
          descricao={
            <>
              Você está prestes a remover o deploy{' '}
              <strong>#{String(deployParaExcluir?.deploy_number ?? '').padStart(4, '0')}</strong>
              {' '}({deployParaExcluir?.area} {deployParaExcluir?.version}).
              <br /><br />
              Essa ação remove apenas o <strong>registro histórico</strong> — não reverte o deploy em si.
              O evento de remoção fica no Histórico Global para auditoria.
            </>
          }
          nomeItem={`#${String(deployParaExcluir?.deploy_number ?? '').padStart(4, '0')} — ${deployParaExcluir?.version ?? ''}`}
          aoConfirmar={handleExcluir}
          aoCancelar={() => setDeployParaExcluir(null)}
        />
      </PaginaGlobal>
    </>
  )
}
