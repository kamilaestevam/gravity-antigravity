import React, { useState, useEffect } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Package,
  CheckCircle,
  FloppyDisk,
} from '@phosphor-icons/react'
import { useUser } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { ModalSelectGlobal } from '@nucleo/modal-campo-select-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'

type DadosMae = {
  nome:         string
  cnpj:         string
  estado:       string
  cidade:       string
  segmento:     string
  tipo_empresa: string
  plano:        string
  subdominio:   string
  criadaEm:     string
}

const dadosVazios: DadosMae = {
  nome:         '',
  cnpj:         '',
  estado:       '',
  cidade:       '',
  segmento:     '',
  tipo_empresa: '',
  plano:        'Starter',
  subdominio:   '',
  criadaEm:     '',
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

const TIPOS_EMPRESA = [
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

const OPCOES_TIPOS_EMPRESA: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...TIPOS_EMPRESA.map(t => ({ valor: t, rotulo: t }))
]

// As opções de workspaces serão carregadas dinamicamente dentro do componente

/** Chave do localStorage vinculada ao usuário */
function storageKey(userId: string | undefined) {
  return `gravity:workspace-ativo:${userId ?? 'anon'}`
}

export function Organizacao() {
  const { t } = useTranslation()
  const { user, isLoaded: userLoaded } = useUser()
  const addNotification = useShellStore((state) => state.addNotification)

  // Workspaces (empresas filhas) carregados da API
  const [espacosLocais, setEspacosLocais] = useState<{ id: string; nome: string; subdominio: string }[]>([])

  const OPCOES_ESPACOS: SelectOpcao[] = espacosLocais.map(f => ({
    valor:   f.id,
    rotulo:  f.nome,
    descricao: f.subdominio ? `${f.subdominio}.gravity.com.br` : '',
  }))

  // dados editáveis diretamente — sem modo "editando"
  const [dadosIniciaisLocal, setDadosIniciaisLocal] = useState<DadosMae>(dadosVazios)
  const [dados, setDados] = useState<DadosMae>(dadosVazios)
  const [carregando, setCarregando] = useState(true)

  // ── Carregar dados reais do tenant e companies da API ───────────────────
  useEffect(() => {
    if (!userLoaded) return

    async function fetchDados() {
      try {
        setCarregando(true)
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }

        // Pega token do Clerk se disponível
        if (user) {
          try {
            const session = await (window as any).Clerk?.session
            const token = session ? await session.getToken() : null
            if (token) headers['Authorization'] = `Bearer ${token}`
          } catch { /* sem token — backend tentará DEMO_MODE */ }
        }

        // Busca tenant e companies em paralelo
        const [tenantRes, companiesRes] = await Promise.all([
          fetch('/api/v1/tenants/me', { headers }),
          fetch('/api/v1/tenants/companies', { headers }),
        ])

        if (tenantRes.ok) {
          const { tenant } = await tenantRes.json()
          const sub = tenant.subscriptions?.[0]
          const planMap: Record<string, string> = {
            STARTER: 'Starter', PROFESSIONAL: 'Professional', ENTERPRISE: 'Enterprise'
          }
          const dadosApi: DadosMae = {
            nome:       tenant.name ?? '',
            cnpj:       tenant.cnpj ?? '',
            estado:     tenant.state ?? '',
            cidade:     tenant.city ?? '',
            segmento:     tenant.segment ?? '',
            tipo_empresa: tenant.tipo_empresa ?? '',
            plano:      planMap[sub?.plan] ?? sub?.plan ?? 'Starter',
            subdominio: tenant.slug ?? '',
            criadaEm:   tenant.created_at
              ? new Date(tenant.created_at).toLocaleDateString('pt-BR')
              : '',
          }
          setDadosIniciaisLocal(dadosApi)
          setDados(dadosApi)
        }

        if (companiesRes.ok) {
          const { companies } = await companiesRes.json()
          setEspacosLocais(
            companies.map((c: any) => ({
              id: c.id,
              nome: c.name,
              subdominio: c.subdomain ?? '',
            }))
          )
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

  // workspace selecionado para acesso operacional
  const [espacoInicial, setFilhaInicial] = useState<string>('')
  const [espacoAtivoId, setFilhaAtivaId] = useState<string>('')
  
  const { dirty: dirtyEspaco, resetDirty: resetEspaco } = useDirty(espacoInicial, espacoAtivoId)
  const isDirty = dirty || dirtyEspaco

  // Status de salvamento inline
  const [salvando, setSalvando] = useState(false)

  // lista de cidades do estado
  const [cidades, setCidades] = useState<SelectOpcao[]>([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

  // ── Carregar Cidades do IBGE ─────────────────────────────────────────────
  useEffect(() => {
    if (!dados.estado) {
      setCidades([])
      return
    }
    setCarregandoCidades(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${dados.estado}/municipios`)
      .then(res => res.json())
      .then(data => {
        const opcoes = data.map((c: any) => ({
          valor: c.nome,
          rotulo: c.nome
        }))
        opcoes.sort((a: SelectOpcao, b: SelectOpcao) => a.rotulo.localeCompare(b.rotulo))
        setCidades(opcoes)
      })
      .catch(err => {
        console.error("Erro ao buscar cidades do IBGE:", err)
        setCidades([])
      })
      .finally(() => setCarregandoCidades(false))
  }, [dados.estado])

  // ── Restaurar preferência salva ao montar ────────────────────────────────
  useEffect(() => {
    const chave = storageKey(user?.id)
    const salvoId = localStorage.getItem(chave) || ''
    setFilhaInicial(salvoId)
    setFilhaAtivaId(salvoId)
    resetEspaco(salvoId)
  }, [user?.id, resetEspaco])

  function set(key: keyof DadosMae, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  // ── Salvar todos os dados da página ──────────────────────────────────────
  async function handleSalvar() {
    try {
      setSalvando(true)

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) {
        try {
          const session = await (window as any).Clerk?.session
          const token = session ? await session.getToken() : null
          if (token) headers['Authorization'] = `Bearer ${token}`
        } catch { /* sem token */ }
      }

      const res = await fetch('/api/v1/tenants/me', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: dados.nome,
          cnpj: dados.cnpj,
          state: dados.estado,
          city: dados.cidade,
          segment: dados.segmento,
          tipo_empresa: dados.tipo_empresa,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: { message: 'Erro ao salvar' } }))
        throw new Error(body?.error?.message ?? body?.message ?? 'Erro ao salvar')
      }

      setDadosIniciaisLocal(dados)
      resetDirty(dados)

      // Persistir preferência local de workspace ativo
      const chave = storageKey(user?.id)
      if (espacoAtivoId) {
        localStorage.setItem(chave, espacoAtivoId)
      } else {
        localStorage.removeItem(chave)
      }
      resetEspaco(espacoAtivoId)

      addNotification({
        type: 'success',
        message: t('workspace.organization.msg_sucesso')
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : t('workspace.organization.msg_erro')
      })
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelar() {
    // Restaura dados da página
    setDados(dadosIniciaisLocal)
    resetDirty(dadosIniciaisLocal)

    // Restaura preferência local
    setFilhaAtivaId(espacoInicial)
    resetEspaco()
  }

  const espacoAtivo = espacosLocais.find(f => f.id === espacoAtivoId)

  if (carregando) {
    return (
      <PaginaGlobal
        layout="formulario"
        cabecalho={
          <CabecalhoGlobal
            icone={<Crown weight="duotone" size={22} />}
            titulo={t('workspace.organization.titulo')}
            subtitulo={t('workspace.organization.subtitulo_carregando')}
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
          titulo={t('workspace.organization.titulo')}
          subtitulo={t('workspace.organization.subtitulo')}
        />
      }
    >

      {/* ── Identity card — atualiza em tempo real conforme edição ─────── */}
      <div className="em-identity ws-fade-up">
        <div className="em-identity__hero">
          <div className="em-identity__avatar">{dados.nome.charAt(0) || '?'}</div>
          <div className="em-identity__text">
            <TooltipGlobal titulo="Hierarquia de Contas" descricao="Organização é a matriz gerencial, os workspaces são as várias empresas operadas dentro dela">
              <span className="em-identity__badge">{t('workspace.organization.badge_organizacao')}</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome || <span style={{ opacity: 0.4 }}>Nome da empresa</span>}</h2>
            <p className="em-identity__sub">
              <TooltipGlobal titulo="Plano Atual" descricao="Define os limites de uso e funcionalidades do seu sistema">
                <span className="em-tag">{dados.plano}</span>
              </TooltipGlobal>
              <span className="em-identity__sep">·</span>
              {dados.subdominio}.gravity.com.br
            </p>
          </div>
        </div>
      </div>

      {/* ── Dados Básicos — sempre editáveis ────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d1">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo={t('workspace.organization.secao_dados_basicos')} descricao="Informações principais da sua empresa usadas em toda a plataforma">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
              {t('workspace.organization.secao_dados_basicos')}
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-grid">
          <GeralCampoGlobal
            label={t('workspace.organization.campo_nome')}
            obrigatorio
            tooltipTitulo={t('workspace.organization.campo_nome')}
            tooltipDescricao="Razão social que aparece nos documentos e relatórios"
          >
            <div className="ws-input-icon-wrap">
              <Buildings size={16} />
              <input
                value={dados.nome}
                placeholder="Ex: Acme Corporation Ltda."
                onChange={e => set('nome', e.target.value)}
              />
            </div>
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('workspace.organization.campo_cnpj')}
            tooltipTitulo={t('workspace.organization.campo_cnpj')}
            tooltipDescricao="Aparece em notas fiscais e documentos gerados na plataforma"
          >
            <div className="ws-input-icon-wrap">
              <IdentificationCard size={16} />
              <input
                value={dados.cnpj}
                placeholder="Ex: 00.000.000/0001-00"
                onChange={e => set('cnpj', e.target.value)}
              />
            </div>
          </GeralCampoGlobal>
        </div>
        <div className="em-grid em-grid--4">
          <GeralCampoGlobal
            label={t('workspace.organization.campo_estado')}
            tooltipTitulo={t('workspace.organization.campo_estado')}
            tooltipDescricao="Estado onde a empresa tem sua sede principal"
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={OPCOES_ESTADOS}
              valor={dados.estado}
              aoMudarValor={v => {
                set('estado', String(v ?? ''))
                set('cidade', '')
              }}
              placeholder="Selecione..."
              buscavel
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('workspace.organization.campo_cidade')}
            tooltipTitulo={t('workspace.organization.campo_cidade')}
            tooltipDescricao="A lista de cidades aparece após você escolher o estado"
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={dados.cidade || null}
              aoMudarValor={v => set('cidade', String(v ?? ''))}
              placeholder={dados.estado ? "Selecione a cidade..." : t('workspace.organization.aguardando_estado')}
              buscavel
              desabilitado={!dados.estado}
              carregando={carregandoCidades}
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('workspace.organization.campo_segmento')}
            tooltipTitulo={t('workspace.organization.campo_segmento')}
            tooltipDescricao="Usado para categorizar a empresa nos relatórios da plataforma"
          >
            <SelectGlobal
              iconeEsquerda={<Package size={16} />}
              opcoes={OPCOES_SEGMENTOS}
              valor={dados.segmento}
              aoMudarValor={v => set('segmento', String(v ?? ''))}
              placeholder="Selecione..."
              buscavel
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('workspace.organization.campo_tipo_empresa')}
            tooltipTitulo={t('workspace.organization.campo_tipo_empresa')}
            tooltipDescricao="Categoria que define a atuação da empresa no comércio exterior"
          >
            <SelectGlobal
              iconeEsquerda={<Buildings size={16} />}
              opcoes={OPCOES_TIPOS_EMPRESA}
              valor={dados.tipo_empresa}
              aoMudarValor={v => set('tipo_empresa', String(v ?? ''))}
              placeholder="Selecione..."
            />
          </GeralCampoGlobal>
        </div>
      </div>


      {/* ── Workspace Padrão ──────────────────────────────────── */}
      <ModalSelectGlobal
        icone={<CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />}
        titulo={
          <TooltipGlobal titulo="Workspace Padrão" descricao="A empresa que será aberta automaticamente sempre que você acessar a plataforma">
            <span>{t('workspace.organization.acesso_padrao')}</span>
          </TooltipGlobal>
        }
        descricao={t('workspace.organization.acesso_padrao_desc')}
        labelContext={
          <TooltipGlobal titulo="Ambiente Padrão" descricao="Escolha o workspace que será seu ambiente principal ao entrar no sistema">
            <span>{t('workspace.organization.acesso_padrao_label')}</span>
          </TooltipGlobal>
        }
        selectElement={
          <SelectGlobal
            iconeEsquerda={<Buildings size={16} />}
            opcoes={OPCOES_ESPACOS}
            valor={espacoAtivoId || null}
            aoMudarValor={v => setFilhaAtivaId(v != null ? String(v) : '')}
            placeholder="Selecione..."
            buscavel
          />
        }
        itemAtivo={espacoAtivo ? {
          icone: <CheckCircle weight="fill" size={16} color="#34d399" />,
          texto: <>Acessando como&nbsp;<strong>{espacoAtivo.nome}</strong></>,
          subtexto: `(${espacoAtivo.subdominio}.gravity.com.br)`
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
