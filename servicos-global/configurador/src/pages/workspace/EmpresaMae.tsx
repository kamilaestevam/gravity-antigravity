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
  const [filhaInicial, setFilhaInicial] = useState<string>('')
  const [filhaAtivaId, setFilhaAtivaId] = useState<string>('')
  
  const { dirty: dirtyFilha, resetDirty: resetFilha } = useDirty(filhaInicial, filhaAtivaId)
  const isDirty = dirty || dirtyFilha

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
    resetFilha(salvoId)
  }, [user?.id, resetFilha])

  function set(key: keyof DadosMae, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  // ── Salvar todos os dados da página ──────────────────────────────────────
  function handleSalvar() {
    // TODO: persistir `dados` via API
    resetDirty(dados)

    // Persistir preferência local de empresa filha ativa
    const chave = storageKey(user?.id)
    if (filhaAtivaId) {
      localStorage.setItem(chave, filhaAtivaId)
    } else {
      localStorage.removeItem(chave)
    }
    resetFilha(filhaAtivaId)
  }

  function handleCancelar() {
    // Restaura dados da página
    setDados(dadosIniciais)
    resetDirty()

    // Restaura preferência local
    setFilhaAtivaId(filhaInicial)
    resetFilha()
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
            <TooltipGlobal titulo="Tipo de Conta" descricao="Nível hierárquico principal da sua estrutura na plataforma">
              <span className="em-identity__badge" style={{ cursor: 'help' }}>Empresa Mãe</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome || <span style={{ opacity: 0.4 }}>Nome da empresa</span>}</h2>
            <p className="em-identity__sub">
              <TooltipGlobal titulo="Plano Atual" descricao="Define os limites de uso e funcionalidades do seu sistema">
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
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo="Dados Básicos" descricao="Informações principais da sua empresa usadas em toda a plataforma">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
              <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
              Dados Básicos
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-grid">
          <div className="ws-field">
            <label>
              <TooltipGlobal titulo="Nome da Empresa" descricao="Razão social que aparece nos documentos e relatórios">
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
              <TooltipGlobal titulo="CNPJ" descricao="Aparece em notas fiscais e documentos gerados na plataforma">
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
              <TooltipGlobal titulo="Estado" descricao="Estado onde a empresa tem sua sede principal">
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
              <TooltipGlobal titulo="Cidade" descricao="A lista de cidades aparece após você escolher o estado">
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
              <TooltipGlobal titulo="Segmento" descricao="Usado para categorizar a empresa nos relatórios da plataforma">
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
              <TooltipGlobal titulo="Site" descricao="Endereço público da empresa, exibido no perfil">
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
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo="Plano Contratado" descricao="Resumo das configurações de cobrança e limites do seu plano atual">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
              <Package weight="duotone" size={14} color="var(--ws-accent)" />
              Plano Contratado
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-plan-row">
          <div className="em-plan-info">
            <div className="em-plan-icon"><Package weight="duotone" size={22} /></div>
            <div>
              <TooltipGlobal titulo="Plano Atual" descricao="Define os limites de uso e funcionalidades do seu sistema">
                <div style={{ cursor: 'help' }}>
                  <p className="em-plan-label">Plano atual</p>
                  <p className="em-plan-name">{dados.plano}</p>
                </div>
              </TooltipGlobal>
            </div>
          </div>
          <div className="em-plan-meta">
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Subdomínio" descricao="Endereço exclusivo da sua conta — não pode ser alterado">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={14} weight="duotone" />
                  <span>{dados.subdominio}.gravity.com.br</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Cliente Desde" descricao="Data de ativação da conta na plataforma">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CalendarBlank size={14} weight="duotone" />
                  <span>Cliente desde {dados.criadaEm}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="Localização" descricao="Cidade e estado da sede principal da empresa">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} weight="duotone" />
                  <span>{dados.cidade}{dados.estado ? `, ${dados.estado}` : ''}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal titulo="CNPJ" descricao="Aparece em notas fiscais e documentos gerados na plataforma">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IdentificationCard size={14} weight="duotone" />
                  <span>{dados.cnpj}</span>
                </span>
              </TooltipGlobal>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empresa Filha Padrão ──────────────────────────────────── */}
      <div className="em-section em-filha-section ws-fade-up ws-fade-up-d3">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo="Empresa Filha Padrão" descricao="A empresa que será aberta automaticamente sempre que você acessar a plataforma">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
              <CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />
              Empresa Filha de Acesso Padrão
            </span>
          </TooltipGlobal>
        </p>
        <p className="em-filha-desc">
          Sempre que você acessar a plataforma você precisa operar em uma empresa filha. 
          Escolha aqui qual será sua empresa de acesso padrão (se você possui apenas uma, pode deixá-la salva).
        </p>

        <div className="em-filha-select-row">
          <div className="ws-field" style={{ flex: 1, overflow: 'visible' }}>
            <label>
              <TooltipGlobal titulo="Empresa Filha Padrão" descricao="Escolha a empresa filha que será seu ambiente de trabalho principal ao entrar no sistema">
                <span>Empresa filha padrão</span>
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
        dirty={isDirty}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
        alinhamento="direita"
      />
    </div>
  )
}
