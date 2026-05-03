import React, { useState, useEffect } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Package,
  CheckCircle,
} from '@phosphor-icons/react'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { ModalSelectGlobal } from '@nucleo/modal-campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'
import {
  meResponseSchema,
  workspacesResponseSchema,
  type WorkspaceItem,
} from '../../services/apiClient'

type DadosOrganizacao = {
  nome_organizacao:         string
  cnpj_organizacao:         string
  estado_organizacao:       string
  cidade_organizacao:       string
  segmento_organizacao:     string
  tipo_organizacao:         string
  subdominio_organizacao:   string
  data_criacao_organizacao: string
}

const dadosVazios: DadosOrganizacao = {
  nome_organizacao:         '',
  cnpj_organizacao:         '',
  estado_organizacao:       '',
  cidade_organizacao:       '',
  segmento_organizacao:     '',
  tipo_organizacao:         '',
  subdominio_organizacao:   '',
  data_criacao_organizacao: '',
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

const OPCOES_ESTADOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...ESTADOS_BR.map(uf => ({ valor: uf, rotulo: uf }))
]

const SEGMENTOS = [
  'Agronegócio', 'Alimentos e Bebidas', 'Armazenagem', 'Automotivo',
  'Calçados', 'Cosméticos', 'Despacho Aduaneiro', 'Eletrodomésticos',
  'Eletrônicos', 'Embalagens', 'Energia e Gás', 'Farmacêutico',
  'Ferramentas', 'Ferroviário', 'Financeiro', 'Higiene',
  'Hospitalar', 'Logística', 'Maquinário', 'Metalurgia',
  'Mineração', 'Papel', 'Químico', 'Seguro',
  'Têxtil', 'Trading', 'Transporte',
]

const OPCOES_SEGMENTOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...SEGMENTOS.map(s => ({ valor: s, rotulo: s }))
]

const TIPOS_ORGANIZACAO = [
  'Importador',
  'Exportador',
  'Importador e Exportador',
  'Despachante Aduaneiro',
  'Agente de Carga',
  'Trading',
  'Transportadora Rodoviária',
  'Seguradora Internacional',
  'Corretora de Câmbio',
]

const OPCOES_TIPOS_ORGANIZACAO: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...TIPOS_ORGANIZACAO.map(t => ({ valor: t, rotulo: t }))
]

/** Chave do localStorage do workspace preferido vinculada ao usuário. */
const STORAGE_KEY_NEW = 'gravity:workspace-preferido'
const STORAGE_KEY_LEGACY = 'gravity:workspace-ativo'
function storageKey(id_usuario: string | undefined) {
  return `${STORAGE_KEY_NEW}:${id_usuario ?? 'anon'}`
}
function legacyStorageKey(id_usuario: string | undefined) {
  return `${STORAGE_KEY_LEGACY}:${id_usuario ?? 'anon'}`
}
/** Lê do storage novo, com fallback para a chave legada (migração). */
function readPreferredFromStorage(id_usuario: string | undefined): string {
  const novo = localStorage.getItem(storageKey(id_usuario))
  if (novo) return novo
  const legado = localStorage.getItem(legacyStorageKey(id_usuario))
  if (legado) {
    // Migra valor para a chave nova; remove a antiga.
    localStorage.setItem(storageKey(id_usuario), legado)
    localStorage.removeItem(legacyStorageKey(id_usuario))
    return legado
  }
  return ''
}

export function Organizacao() {
  const { t } = useTranslation()
  const { user, isLoaded: userLoaded } = useUser()
  const addNotification = useShellStore((state) => state.addNotification)

  // Workspaces da organização carregados da API
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])

  const OPCOES_WORKSPACES: SelectOpcao[] = workspaces.map(w => ({
    valor:     w.id_workspace,
    rotulo:    w.nome_workspace,
    descricao: w.subdominio_workspace ? `${w.subdominio_workspace}.gravity.com.br` : '',
  }))

  // Dados editáveis diretamente — sem modo "editando"
  const [dadosIniciaisLocal, setDadosIniciaisLocal] = useState<DadosOrganizacao>(dadosVazios)
  const [dados, setDados] = useState<DadosOrganizacao>(dadosVazios)
  const [carregando, setCarregando] = useState(true)

  // ── Carregar dados reais da organização e workspaces da API ────────────────
  useEffect(() => {
    if (!userLoaded) return

    async function fetchDados() {
      try {
        setCarregando(true)
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }

        // Pega token do Clerk se disponível
        if (user) {
          try {
            const session = await (window as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk?.session
            const token = session ? await session.getToken() : null
            if (token) headers['Authorization'] = `Bearer ${token}`
          } catch { /* sem token — backend tentará DEMO_MODE */ }
        }

        const [orgRes, workspacesRes] = await Promise.all([
          fetch('/api/v1/organizacoes/me', { headers }),
          fetch('/api/v1/me/workspaces', { headers }),
        ])

        if (orgRes.ok) {
          const raw = await orgRes.json()
          const parsed = meResponseSchema.parse(raw)
          const o = parsed.organizacao
          const dadosApi: DadosOrganizacao = {
            nome_organizacao:         o.nome_organizacao,
            cnpj_organizacao:         o.cnpj_organizacao ?? '',
            estado_organizacao:       o.estado_organizacao ?? '',
            cidade_organizacao:       o.cidade_organizacao ?? '',
            segmento_organizacao:     o.segmento_organizacao ?? '',
            tipo_organizacao:         o.tipo_organizacao ?? '',
            subdominio_organizacao:   o.subdominio_organizacao,
            data_criacao_organizacao: o.data_criacao_organizacao
              ? new Date(o.data_criacao_organizacao).toLocaleDateString('pt-BR')
              : '',
          }
          setDadosIniciaisLocal(dadosApi)
          setDados(dadosApi)
        }

        if (workspacesRes.ok) {
          const raw = await workspacesRes.json()
          const parsed = workspacesResponseSchema.parse(raw)
          setWorkspaces(parsed.workspaces)
        }
      } catch (err) {
        console.error('Erro ao carregar dados da organização:', err)
        addNotification({ type: 'error', message: 'Erro ao carregar dados da organização' })
      } finally {
        setCarregando(false)
      }
    }

    fetchDados()
  }, [userLoaded])

  // detecção de alterações para habilitar Salvar / Cancelar
  const { dirty, resetDirty } = useDirty(dadosIniciaisLocal, dados)

  // Workspace preferido para acesso operacional
  const [workspacePreferidoInicial, setWorkspacePreferidoInicial] = useState<string>('')
  const [idWorkspacePreferido, setIdWorkspacePreferido] = useState<string>('')

  const { dirty: dirtyWorkspace, resetDirty: resetWorkspace } = useDirty(workspacePreferidoInicial, idWorkspacePreferido)
  const isDirty = dirty || dirtyWorkspace

  // lista de cidades do estado (hook compartilhado com cache por UF)
  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(dados.estado_organizacao)

  // ── Restaurar preferência salva ao montar ────────────────────────────────
  useEffect(() => {
    const salvoId = readPreferredFromStorage(user?.id)
    setWorkspacePreferidoInicial(salvoId)
    setIdWorkspacePreferido(salvoId)
    resetWorkspace(salvoId)
  }, [user?.id, resetWorkspace])

  function set(key: keyof DadosOrganizacao, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  // ── Salvar todos os dados da página ──────────────────────────────────────
  async function handleSalvar() {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) {
        try {
          const session = await (window as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk?.session
          const token = session ? await session.getToken() : null
          if (token) headers['Authorization'] = `Bearer ${token}`
        } catch { /* sem token */ }
      }

      const res = await fetch('/api/v1/organizacoes/me', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          nome_organizacao:     dados.nome_organizacao,
          cnpj_organizacao:     dados.cnpj_organizacao,
          estado_organizacao:   dados.estado_organizacao,
          cidade_organizacao:   dados.cidade_organizacao,
          segmento_organizacao: dados.segmento_organizacao,
          tipo_organizacao:     dados.tipo_organizacao,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: { message: 'Erro ao salvar' } }))
        throw new Error(body?.error?.message ?? body?.message ?? 'Erro ao salvar')
      }

      setDadosIniciaisLocal(dados)
      resetDirty(dados)

      // Persistir preferência local de workspace preferido
      const chave = storageKey(user?.id)
      if (idWorkspacePreferido) {
        localStorage.setItem(chave, idWorkspacePreferido)
      } else {
        localStorage.removeItem(chave)
      }
      resetWorkspace(idWorkspacePreferido)

      addNotification({
        type: 'success',
        message: t('workspace.organizacao.msg_sucesso')
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : t('workspace.organizacao.msg_erro')
      })
    }
  }

  function handleCancelar() {
    // Restaura dados da página
    setDados(dadosIniciaisLocal)
    resetDirty(dadosIniciaisLocal)

    // Restaura preferência local
    setIdWorkspacePreferido(workspacePreferidoInicial)
    resetWorkspace()
  }

  const workspacePreferido = workspaces.find(w => w.id_workspace === idWorkspacePreferido)

  if (carregando) {
    return (
      <PaginaGlobal
        layout="formulario"
        cabecalho={
          <CabecalhoGlobal
            icone={<Crown weight="duotone" size={22} />}
            titulo={t('workspace.organizacao.titulo')}
            subtitulo={t('workspace.organizacao.subtitulo_carregando')}
          />
        }
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: 'var(--color-text-muted)' }}>
          Carregando...
        </div>
      </PaginaGlobal>
    )
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<Crown weight="duotone" size={22} />}
          titulo={t('workspace.organizacao.titulo')}
          subtitulo={t('workspace.organizacao.subtitulo')}
        />
      }
    >

      {/* ── Identity card — atualiza em tempo real conforme edição ─────── */}
      <div className="em-identity ws-fade-up">
        <div className="em-identity__hero">
          <div className="em-identity__avatar">{dados.nome_organizacao.charAt(0) || '?'}</div>
          <div className="em-identity__text">
            <TooltipGlobal titulo="Hierarquia de Contas" descricao="Organização é a matriz gerencial, os workspaces são as várias empresas operadas dentro dela">
              <span className="em-identity__badge">{t('workspace.organizacao.badge_organizacao')}</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome_organizacao || <span style={{ opacity: 0.4 }}>Nome da empresa</span>}</h2>
            <p className="em-identity__sub">
              {dados.subdominio_organizacao}.gravity.com.br
            </p>
          </div>
        </div>
      </div>

      {/* ── Dados Básicos — sempre editáveis ────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d1">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo={t('workspace.organizacao.secao_dados_basicos')} descricao="Informações principais da sua empresa usadas em toda a plataforma">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
              {t('workspace.organizacao.secao_dados_basicos')}
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-grid">
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_nome')}
            obrigatorio
            tooltipTitulo={t('workspace.organizacao.campo_nome')}
            tooltipDescricao="Razão social que aparece nos documentos e relatórios"
          >
            <div className="ws-input-icon-wrap">
              <Buildings size={16} />
              <input
                value={dados.nome_organizacao}
                placeholder="Ex: Acme Corporation Ltda."
                onChange={e => set('nome_organizacao', e.target.value)}
              />
            </div>
          </CampoGeralGlobal>
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_cnpj')}
            tooltipTitulo={t('workspace.organizacao.campo_cnpj')}
            tooltipDescricao="Aparece em notas fiscais e documentos gerados na plataforma"
          >
            <div className="ws-input-icon-wrap">
              <IdentificationCard size={16} />
              <input
                value={dados.cnpj_organizacao}
                placeholder="Ex: 00.000.000/0001-00"
                onChange={e => set('cnpj_organizacao', e.target.value)}
              />
            </div>
          </CampoGeralGlobal>
        </div>
        <div className="em-grid em-grid--4">
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_estado')}
            tooltipTitulo={t('workspace.organizacao.campo_estado')}
            tooltipDescricao="Estado onde a empresa tem sua sede principal"
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={OPCOES_ESTADOS}
              valor={dados.estado_organizacao}
              aoMudarValor={v => {
                set('estado_organizacao', String(v ?? ''))
                set('cidade_organizacao', '')
              }}
              placeholder="Selecione..."
              buscavel
            />
          </CampoGeralGlobal>
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_cidade')}
            tooltipTitulo={t('workspace.organizacao.campo_cidade')}
            tooltipDescricao="A lista de cidades aparece após você escolher o estado"
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={dados.cidade_organizacao || null}
              aoMudarValor={v => set('cidade_organizacao', String(v ?? ''))}
              placeholder={dados.estado_organizacao ? "Selecione a cidade..." : t('workspace.organizacao.aguardando_estado')}
              buscavel
              desabilitado={!dados.estado_organizacao}
              carregando={carregandoCidades}
            />
          </CampoGeralGlobal>
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_segmento')}
            tooltipTitulo={t('workspace.organizacao.campo_segmento')}
            tooltipDescricao="Usado para categorizar a empresa nos relatórios da plataforma"
          >
            <SelectGlobal
              iconeEsquerda={<Package size={16} />}
              opcoes={OPCOES_SEGMENTOS}
              valor={dados.segmento_organizacao}
              aoMudarValor={v => set('segmento_organizacao', String(v ?? ''))}
              placeholder="Selecione..."
              buscavel
            />
          </CampoGeralGlobal>
          <CampoGeralGlobal
            label={t('workspace.organizacao.campo_tipo_empresa')}
            tooltipTitulo={t('workspace.organizacao.campo_tipo_empresa')}
            tooltipDescricao="Categoria que define a atuação da empresa no comércio exterior"
          >
            <SelectGlobal
              iconeEsquerda={<Buildings size={16} />}
              opcoes={OPCOES_TIPOS_ORGANIZACAO}
              valor={dados.tipo_organizacao}
              aoMudarValor={v => set('tipo_organizacao', String(v ?? ''))}
              placeholder="Selecione..."
            />
          </CampoGeralGlobal>
        </div>
      </div>


      {/* ── Workspace Preferido ──────────────────────────────────── */}
      <ModalSelectGlobal
        icone={<CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />}
        titulo={
          <TooltipGlobal titulo="Workspace Preferido" descricao="A empresa que será aberta automaticamente sempre que você acessar a plataforma">
            <span>{t('workspace.organizacao.workspace_preferido')}</span>
          </TooltipGlobal>
        }
        descricao={t('workspace.organizacao.workspace_preferido_desc')}
        labelContext={
          <TooltipGlobal titulo="Workspace Preferido" descricao="Escolha o workspace que será seu ambiente principal ao entrar no sistema">
            <span>{t('workspace.organizacao.workspace_preferido_label')}</span>
          </TooltipGlobal>
        }
        selectElement={
          <SelectGlobal
            iconeEsquerda={<Buildings size={16} />}
            opcoes={OPCOES_WORKSPACES}
            valor={idWorkspacePreferido || null}
            aoMudarValor={v => setIdWorkspacePreferido(v != null ? String(v) : '')}
            placeholder="Selecione..."
            buscavel
          />
        }
        itemAtivo={workspacePreferido ? {
          icone: <CheckCircle weight="fill" size={16} color="#34d399" />,
          texto: <>Acessando como&nbsp;<strong>{workspacePreferido.nome_workspace}</strong></>,
          subtexto: workspacePreferido.subdominio_workspace ? `(${workspacePreferido.subdominio_workspace}.gravity.com.br)` : ''
        } : null}
        className="ws-fade-up ws-fade-up-d3"
      />

      {/* ── Salvar / Cancelar ──────────────────────────────────────────────── */}
      <BotoesSalvarGlobal
        dirty={isDirty}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
        alinhamento="direita"
      />
    </PaginaGlobal>
  )
}
