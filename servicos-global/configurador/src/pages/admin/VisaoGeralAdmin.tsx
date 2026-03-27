import React, { useState, useEffect } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Globe,
  Package,
  CalendarBlank,
  RocketLaunch,
} from '@phosphor-icons/react'
import { useUser } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'

import '../workspace/workspace.css'

type DadosAdmin = {
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

const dadosIniciais: DadosAdmin = {
  nome:       'Gravity Headquarters',
  cnpj:       '00.000.000/0001-00',
  estado:     'SP',
  cidade:     'São Paulo',
  segmento:   'Tecnologia',
  site:       'https://gravity.com.br',
  plano:      'Núcleo Central',
  subdominio: 'admin',
  criadaEm:   '01/01/2026',
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
  'Tecnologia', 'SaaS', 'Plataforma B2B', 'Cloud Infrastructure'
]

const OPCOES_SEGMENTOS: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...SEGMENTOS.map(s => ({ valor: s, rotulo: s }))
]

export function VisaoGeralAdmin() {
  const { user } = useUser()
  const addNotification = useShellStore((state) => state.addNotification)

  const [dados, setDados] = useState<DadosAdmin>(dadosIniciais)
  const { dirty, resetDirty } = useDirty(dadosIniciais, dados)
  
  const [salvando, setSalvando] = useState(false)

  const [cidades, setCidades] = useState<SelectOpcao[]>([])
  const [carregandoCidades, setCarregandoCidades] = useState(false)

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
        console.error("Erro ao buscar cidades:", err)
        setCidades([])
      })
      .finally(() => setCarregandoCidades(false))
  }, [dados.estado])

  function set(key: keyof DadosAdmin, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  async function handleSalvar() {
    try {
      setSalvando(true)
      await new Promise(res => setTimeout(res, 1200))

      resetDirty(dados)
      addNotification({
        type: 'success',
        message: 'Configurações globais salvas com sucesso!'
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Falha ao salvar. Tente novamente.'
      })
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelar() {
    setDados(dadosIniciais)
    resetDirty()
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<Crown weight="duotone" size={22} />}
          titulo="Visão Geral da Plataforma"
          subtitulo="Informações globais do Núcleo Gravity"
        />
      }
    >
      {/* ── Identity card ─────── */}
      <div className="em-identity ws-fade-up">
        <div className="em-identity__hero">
          <div className="em-identity__avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <RocketLaunch weight="duotone" size={32} />
          </div>
          <div className="em-identity__text">
            <TooltipGlobal titulo="Nível Super" descricao="Permissão irrestrita e abrangência em todos os tenants">
              <span className="em-identity__badge" style={{ cursor: 'help', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>HQ Owner</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome}</h2>
            <p className="em-identity__sub">
              <TooltipGlobal titulo="Plano do Backend" descricao="Status de operação Master">
                <span className="em-tag" style={{ cursor: 'help', borderColor: '#10b981', color: '#10b981' }}>{dados.plano}</span>
              </TooltipGlobal>
              <span className="em-identity__sep">·</span>
              {dados.subdominio}.gravity.com.br
            </p>
          </div>
        </div>
      </div>

      {/* ── Dados Básicos ── */}
      <div className="em-section ws-fade-up ws-fade-up-d1">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <TooltipGlobal titulo="Dados Registrados" descricao="Identidade fiscal master da plataforma">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
              <Buildings weight="duotone" size={14} color="#10b981" />
              Institucional Base
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-grid">
          <GeralCampoGlobal 
            label="Nome da Empresa" obrigatorio
            tooltipTitulo="Identidade da Organização"
            tooltipDescricao="Nome oficial da organização que detém o controle master da plataforma Gravity."
          >
            <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#10b981' } as React.CSSProperties}>
              <Buildings size={16} />
              <input value={dados.nome} onChange={e => set('nome', e.target.value)} />
            </div>
          </GeralCampoGlobal>
          <GeralCampoGlobal 
            label="CNPJ"
            tooltipTitulo="Registro Fiscal"
            tooltipDescricao="Cadastro Nacional da Pessoa Jurídica da empresa proprietária do Núcleo Central."
          >
            <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#10b981' } as React.CSSProperties}>
              <IdentificationCard size={16} />
              <input value={dados.cnpj} onChange={e => set('cnpj', e.target.value)} />
            </div>
          </GeralCampoGlobal>
        </div>
        <div className="em-grid em-grid--4">
          <GeralCampoGlobal 
            label="Estado"
            tooltipTitulo="Localização Estadual"
            tooltipDescricao="Unidade federativa onde a sede da organização está registrada para fins fiscais."
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={OPCOES_ESTADOS}
              valor={dados.estado}
              aoMudarValor={v => { set('estado', String(v ?? '')); set('cidade', '') }}
              buscavel
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal 
            label="Cidade"
            tooltipTitulo="Sede Municipal"
            tooltipDescricao="Cidade onde a instância master está fisicamente baseada ou legalmente sediada."
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={dados.cidade || null}
              aoMudarValor={v => set('cidade', String(v ?? ''))}
              placeholder={dados.estado ? "Selecione..." : "Aguardando estado"}
              buscavel desabilitado={!dados.estado} carregando={carregandoCidades}
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal 
            label="Segmento"
            tooltipTitulo="Vertical de Negócio"
            tooltipDescricao="Ramo de atuação principal da organização para personalização de temas e recursos."
          >
            <SelectGlobal
              iconeEsquerda={<Package size={16} />}
              opcoes={OPCOES_SEGMENTOS}
              valor={dados.segmento}
              aoMudarValor={v => set('segmento', String(v ?? ''))}
              buscavel
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal 
            label="Site"
            tooltipTitulo="Página Oficial"
            tooltipDescricao="Endereço da página institucional da organização proprietária do núcleo."
          >
            <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#10b981' } as React.CSSProperties}>
              <Globe size={16} />
              <input value={dados.site} onChange={e => set('site', e.target.value)} />
            </div>
          </GeralCampoGlobal>
        </div>
      </div>

      {/* ── Dados do Plano ── */}
      <div className="em-section ws-fade-up ws-fade-up-d2">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
            <Package weight="duotone" size={14} color="#10b981" />
            Infraestrutura
          </span>
        </p>
        <div className="em-plan-row">
          <div className="em-plan-info">
            <TooltipGlobal descricao="O Núcleo Central é o ambiente master de gestão de todos os recursos da rede.">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="em-plan-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Package weight="duotone" size={22} /></div>
                <div>
                  <p className="em-plan-label">Instância atual</p>
                  <p className="em-plan-name">{dados.plano}</p>
                </div>
              </div>
            </TooltipGlobal>
          </div>
          <div className="em-plan-meta">
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao="URL base para acesso aos serviços administrativos globais">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}>
                  <Globe size={14} weight="duotone" /> <span>{dados.subdominio}.gravity.com.br</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao="Data histórica de ativação desta infraestrutura master">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}>
                  <CalendarBlank size={14} weight="duotone" /> <span>Operando desde {dados.criadaEm}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao="Região e cidade onde o registro master está localizado">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}>
                  <MapPin size={14} weight="duotone" /> <span>{dados.cidade}, {dados.estado}</span>
                </span>
              </TooltipGlobal>
            </div>
          </div>
        </div>
      </div>

      <BotoesSalvarGlobal dirty={dirty} onSalvar={handleSalvar} onCancelar={handleCancelar} alinhamento="direita" />
    </PaginaGlobal>
  )
}
