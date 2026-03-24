import React, { useState, useEffect } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Globe,
  Package,
  CalendarBlank,
  CheckCircle,
  FloppyDisk,
} from '@phosphor-icons/react'
import { useUser } from '@clerk/clerk-react'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/select-global'
import type { SelectOpcao } from '@nucleo/select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

// ── Mock — substituir por contexto real de tenant ──────────────────────────
const EMPRESAS_FILHAS_MOCK = [
  { id: '1', nome: 'Acme Logística',       subdominio: 'acme-log'    },
  { id: '2', nome: 'Acme Importações',     subdominio: 'acme-import' },
  { id: '3', nome: 'Acme Distribuição',    subdominio: 'acme-dist'   },
  { id: '4', nome: 'Brasilcom Tecnologia', subdominio: 'brasilcom'   },
]

type DadosMae = {
  nome:       string
  cnpj:       string
  estado:     string
  cidade:     string
  segmento:   string
  site:       string
  plano:      string
  subdominio: string
  criadaEm:   string
}

const dadosIniciais: DadosMae = {
  nome:       'Acme Corporation Ltda.',
  cnpj:       '12.345.678/0001-99',
  estado:     'SP',
  cidade:     'São Paulo',
  segmento:   'Logística',
  site:       'https://www.acme.com.br',
  plano:      'Enterprise',
  subdominio: 'acme',
  criadaEm:   '01/01/2024',
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

const OPCOES_FILHAS: SelectOpcao[] = [
  ...EMPRESAS_FILHAS_MOCK.map(f => ({
    valor:   f.id,
    rotulo:  f.nome,
    descricao: `${f.subdominio}.gravity.com.br`,
  }))
]

/** Chave do localStorage vinculada ao usuário */
function storageKey(userId: string | undefined) {
  return `gravity:empresa-filha-ativa:${userId ?? 'anon'}`
}

export function EmpresaMae() {
  const { user } = useUser()

  // dados editáveis diretamente — sem modo "editando"
  const [dados, setDados] = useState<DadosMae>(dadosIniciais)

  // detecção de alterações para habilitar Salvar / Cancelar
  const { dirty, resetDirty } = useDirty(dadosIniciais, dados)

  // empresa filha selecionada para acesso operacional
  const [filhaAtivaId, setFilhaAtivaId] = useState<string>('')
  const [filhaSalva, setFilhaSalva] = useState(false)

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
    const salvoId = localStorage.getItem(chave)
    if (salvoId) setFilhaAtivaId(salvoId)
  }, [user?.id])

  function set(key: keyof DadosMae, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  // ── Salvar dados básicos ─────────────────────────────────────────────────
  function handleSalvar() {
    // TODO: persistir via API
    resetDirty(dados)
  }

  function handleCancelar() {
    setDados(dadosIniciais)
    resetDirty()
  }

  // ── Salvar preferência de empresa filha ──────────────────────────────────
  function handleAplicarSelecao() {
    const chave = storageKey(user?.id)
    if (filhaAtivaId) {
      localStorage.setItem(chave, filhaAtivaId)
    } else {
      localStorage.removeItem(chave)
    }
    setFilhaSalva(true)
    setTimeout(() => setFilhaSalva(false), 2500)
  }

  const filhaAtiva = EMPRESAS_FILHAS_MOCK.find(f => f.id === filhaAtivaId)

  return (
    <div className="ws-fade-up">
      <CabecalhoGlobal
        icone={<Crown weight="duotone" size={22} />}
        titulo="Empresa Mãe"
        subtitulo="Dados da empresa que contratou a plataforma Gravity."
      />

      {/* ── Identity card — atualiza em tempo real conforme edição ─────── */}
      <div className="em-identity ws-fade-up">
        <div className="em-identity__hero">
          <div className="em-identity__avatar">{dados.nome.charAt(0) || '?'}</div>
          <div className="em-identity__text">
            <TooltipGlobal titulo="Tipo de Conta" descricao="Conta administradora de onde derivam todas as empresas filhas.">
              <span className="em-identity__badge" style={{ cursor: 'help' }}>Empresa Mãe</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome || <span style={{ opacity: 0.4 }}>Nome da empresa</span>}</h2>
            <p className="em-identity__sub">
              <TooltipGlobal titulo="Plano Atual" descricao="Define os limites de uso, usuários e funcionalidades disponíveis.">
                <span className="em-tag" style={{ cursor: 'help' }}>{dados.plano}</span>
              </TooltipGlobal>
              <span className="em-identity__sep">·</span>
              {dados.subdominio}.gravity.com.br
            </p>
          </div>
        </div>
      </div>

      {/* ── Dados Básicos — sempre editáveis ────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d1">
        <p className="ws-section-title">
          <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
          Dados Básicos
        </p>
        <div className="em-grid">
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Nome da Empresa" descricao="Razão social completa, conforme constante no CNPJ.">
                <span>Nome da Empresa *</span>
              </TooltipGlobal>
            </label>
            <div className="ws-input-icon-wrap">
              <Buildings size={16} />
              <input
                value={dados.nome}
                placeholder="Ex: Acme Corporation Ltda."
                onChange={e => set('nome', e.target.value)}
              />
            </div>
          </div>
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="CNPJ" descricao="Cadastro Nacional da Pessoa Jurídica. Utilizado para emissão de documentos fiscais.">
                <span>CNPJ</span>
              </TooltipGlobal>
            </label>
            <div className="ws-input-icon-wrap">
              <IdentificationCard size={16} />
              <input
                value={dados.cnpj}
                placeholder="Ex: 00.000.000/0001-00"
                onChange={e => set('cnpj', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="em-grid em-grid--4">
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Estado" descricao="Estado da sede principal da empresa. Afeta cálculos fiscais e localidade padrão.">
                <span>Estado</span>
              </TooltipGlobal>
            </label>
            <SelectGlobal
              opcoes={OPCOES_ESTADOS}
              valor={dados.estado}
              aoMudarValor={v => {
                set('estado', String(v ?? ''))
                set('cidade', '')
              }}
              placeholder="Selecione..."
              buscavel
            />
          </div>
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Cidade" descricao="Município sede. Carregado via API do IBGE com base no estado selecionado.">
                <span>Cidade</span>
              </TooltipGlobal>
            </label>
            <SelectGlobal
              opcoes={cidades}
              valor={dados.cidade || null}
              aoMudarValor={v => set('cidade', String(v ?? ''))}
              placeholder={dados.estado ? "Selecione a cidade..." : "Selecione o estado..."}
              buscavel
              desabilitado={!dados.estado}
              carregando={carregandoCidades}
            />
          </div>
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Segmento" descricao="Setor econômico de atuação. Utilizado para personalização de relatórios e categorização na plataforma.">
                <span>Segmento</span>
              </TooltipGlobal>
            </label>
            <SelectGlobal
              opcoes={OPCOES_SEGMENTOS}
              valor={dados.segmento}
              aoMudarValor={v => set('segmento', String(v ?? ''))}
              placeholder="Selecione..."
              buscavel
            />
          </div>
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Site" descricao="URL pública da empresa. Exibida no perfil e nos documentos gerados pela plataforma.">
                <span>Site</span>
              </TooltipGlobal>
            </label>
            <div className="ws-input-icon-wrap">
              <Globe size={16} />
              <input
                value={dados.site}
                placeholder="https://..."
                onChange={e => set('site', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>


      {/* ── Dados do Plano ────────────────────────────────────────────────── */}
      <div className="em-section ws-fade-up ws-fade-up-d2">
        <p className="ws-section-title">
          <Package weight="duotone" size={14} color="var(--ws-accent)" />
          Plano Contratado
        </p>
        <div className="em-plan-row">
          <div className="em-plan-info">
            <div className="em-plan-icon"><Package weight="duotone" size={22} /></div>
            <div>
              <p className="em-plan-label">Plano atual</p>
              <p className="em-plan-name">{dados.plano}</p>
            </div>
          </div>
          <div className="em-plan-meta">
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Subdomínio" descricao="Endereço exclusivo desta conta na plataforma Gravity. Não pode ser alterado após a criação.">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={14} weight="duotone" />
                  <span>{dados.subdominio}.gravity.com.br</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Data de Início" descricao="Data em que a conta foi criada na plataforma. Utilizada no cálculo de aniversidade do contrato.">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CalendarBlank size={14} weight="duotone" />
                  <span>Cliente desde {dados.criadaEm}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Localização" descricao="Cidade e estado da sede principal. Define fuso horário e timezone padrão para agendamentos.">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} weight="duotone" />
                  <span>{dados.cidade}{dados.estado ? `, ${dados.estado}` : ''}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="CNPJ" descricao="Número do Cadastro Nacional da Pessoa Jurídica. Exibido em documentos e notas emitidas pela plataforma.">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IdentificationCard size={14} weight="duotone" />
                  <span>{dados.cnpj}</span>
                </span>
              </TooltipGlobal>
            </div>
          </div>
        </div>
      </div>

      {/* ── Utilizar como empresa filha ──────────────────────────────────── */}
      <div className="em-section em-filha-section ws-fade-up ws-fade-up-d3">
        <p className="ws-section-title">
          <CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />
          Utilizar essa empresa como filha
        </p>
        <p className="em-filha-desc">
          Selecione a empresa filha que deseja utilizar como contexto operacional
          ao acessar a plataforma. O acesso e os dados exibidos serão referentes
          à empresa selecionada.
        </p>

        <div className="em-filha-select-row">
          <div className="ws-field" style={{ flex: 1, overflow: 'visible' }}>
            <label>
              <TooltipGlobal titulo="Empresa Filha Ativa" descricao="Define qual empresa filha é o contexto operacional da sua sessão. Afeta dados, relatórios e filtros exibidos na plataforma.">
                <span>Empresa filha ativa</span>
              </TooltipGlobal>
            </label>
            <SelectGlobal
              opcoes={OPCOES_FILHAS}
              valor={filhaAtivaId || null}
              aoMudarValor={v => setFilhaAtivaId(v != null ? String(v) : '')}
              placeholder="— Selecione uma empresa filha —"
              buscavel
            />
          </div>
          <div style={{ paddingTop: '1.375rem' }}>
            <TooltipGlobal titulo="Aplicar Empresa Filha" descricao="Você precisará atualizar ou recarregar as páginas abertas para que o contexto entre em vigor.">
              <BotaoGlobal
                variante="primario"
                disabled={!filhaAtivaId}
                onClick={handleAplicarSelecao}
              >
                {filhaSalva
                  ? <><FloppyDisk size={15} weight="bold" /> Salvo!</>
                  : <><CheckCircle size={15} weight="bold" /> Aplicar seleção</>}
              </BotaoGlobal>
            </TooltipGlobal>
          </div>
        </div>

        {filhaAtiva && (
          <div className="em-filha-active ws-fade-up">
            <CheckCircle weight="fill" size={16} color="#34d399" />
            <span>
              Acessando como&nbsp;<strong>{filhaAtiva.nome}</strong>&nbsp;
              <span className="em-filha-active__sub">
                ({filhaAtiva.subdominio}.gravity.com.br)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* ── Salvar / Cancelar ──────────────────────────────────────────────── */}
      <BotoesSalvarGlobal
        dirty={dirty}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
        alinhamento="direita"
      />
    </div>
  )
}
