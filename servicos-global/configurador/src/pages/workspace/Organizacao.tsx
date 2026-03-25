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
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal } from '@nucleo/select-global'
import type { SelectOpcao } from '@nucleo/select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { ModalSelectGlobal } from '@nucleo/modal-select-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'

// ── Mock — substituir por contexto real de tenant ──────────────────────────
const ESPACOS_TRABALHO_MOCK = [
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

const OPCOES_ESPACOS: SelectOpcao[] = [
  ...ESPACOS_TRABALHO_MOCK.map(f => ({
    valor:   f.id,
    rotulo:  f.nome,
    descricao: `${f.subdominio}.gravity.com.br`,
  }))
]

/** Chave do localStorage vinculada ao usuário */
function storageKey(userId: string | undefined) {
  return `gravity:espaco-trabalho-ativo:${userId ?? 'anon'}`
}

export function Organizacao() {
  const { user } = useUser()
  const addNotification = useShellStore((state) => state.addNotification)

  // dados editáveis diretamente — sem modo "editando"
  const [dados, setDados] = useState<DadosMae>(dadosIniciais)

  // detecção de alterações para habilitar Salvar / Cancelar
  const { dirty, resetDirty } = useDirty(dadosIniciais, dados)

  // espaço de trabalho selecionada para acesso operacional
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
      
      // fake delay
      await new Promise(res => setTimeout(res, 1200))

      // TODO: persistir `dados` via API
      resetDirty(dados)

      // Persistir preferência local de espaço de trabalho ativa
      const chave = storageKey(user?.id)
      if (espacoAtivoId) {
        localStorage.setItem(chave, espacoAtivoId)
      } else {
        localStorage.removeItem(chave)
      }
      resetEspaco(espacoAtivoId)

      addNotification({
        type: 'success',
        message: 'Organização salva com sucesso!'
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Não foi possível salvar a organização. Tente novamente.'
      })
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelar() {
    // Restaura dados da página
    setDados(dadosIniciais)
    resetDirty()

    // Restaura preferência local
    setFilhaAtivaId(espacoInicial)
    resetEspaco()
  }

  const espacoAtivo = ESPACOS_TRABALHO_MOCK.find(f => f.id === espacoAtivoId)

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<Crown weight="duotone" size={22} />}
          titulo="Organização"
          subtitulo="Dados da empresa que contratou a plataforma Gravity"
        />
      }
    >

      {/* ── Identity card — atualiza em tempo real conforme edição ─────── */}
      <div className="em-identity ws-fade-up">
        <div className="em-identity__hero">
          <div className="em-identity__avatar">{dados.nome.charAt(0) || '?'}</div>
          <div className="em-identity__text">
            <TooltipGlobal titulo="Hierarquia de Contas" descricao="Organização é a matriz gerencial, os espaços são as várias empresas operadas dentro dela">
              <span className="em-identity__badge" style={{ cursor: 'help' }}>Organização</span>
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
          <GeralCampoGlobal
            label="Nome da Empresa"
            obrigatorio
            tooltipTitulo="Nome da Empresa"
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
            label="CNPJ"
            tooltipTitulo="CNPJ"
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
            label="Estado"
            tooltipTitulo="Estado"
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
            label="Cidade"
            tooltipTitulo="Cidade"
            tooltipDescricao="A lista de cidades aparece após você escolher o estado"
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={dados.cidade || null}
              aoMudarValor={v => set('cidade', String(v ?? ''))}
              placeholder={dados.estado ? "Selecione a cidade..." : "Selecione o estado..."}
              buscavel
              desabilitado={!dados.estado}
              carregando={carregandoCidades}
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label="Segmento"
            tooltipTitulo="Segmento"
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
            label="Site"
            tooltipTitulo="Site"
            tooltipDescricao="Endereço público da empresa, exibido no perfil"
          >
            <div className="ws-input-icon-wrap">
              <Globe size={16} />
              <input
                value={dados.site}
                placeholder="https://..."
                onChange={e => set('site', e.target.value)}
              />
            </div>
          </GeralCampoGlobal>
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

      {/* ── Espaço de Trabalho Padrão ──────────────────────────────────── */}
      <ModalSelectGlobal
        icone={<CheckCircle weight="duotone" size={14} color="var(--ws-accent)" />}
        titulo={
          <TooltipGlobal titulo="Espaço de Trabalho Padrão" descricao="A empresa que será aberta automaticamente sempre que você acessar a plataforma">
            <span style={{ cursor: 'help' }}>Acesso Padrão</span>
          </TooltipGlobal>
        }
        descricao="Defina qual ambiente será carregado automaticamente ao entrar na plataforma."
        labelContext={
          <TooltipGlobal titulo="Ambiente Padrão" descricao="Escolha o espaço de trabalho que será seu ambiente principal ao entrar no sistema">
            <span>Espaço de Trabalho</span>
          </TooltipGlobal>
        }
        selectElement={
          <SelectGlobal
            iconeEsquerda={<Buildings size={16} />}
            opcoes={OPCOES_ESPACOS}
            valor={espacoAtivoId || null}
            aoMudarValor={v => setFilhaAtivaId(v != null ? String(v) : '')}
            placeholder="— Selecione uma opção —"
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
