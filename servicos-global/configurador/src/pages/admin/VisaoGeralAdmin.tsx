import React, { useState, useEffect } from 'react'
import {
  Crown,
  Buildings,
  IdentificationCard,
  MapPin,
  Package,
  CalendarBlank,
  RocketLaunch,
  Globe,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useShellStore } from '@gravity/shell'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { adminPlatformApi } from '../../services/apiClient'
import { useCidadesIBGE } from '../../hooks/useCidadesIBGE'

import '../workspace/workspace.css'

type DadosAdmin = {
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

const dadosVazios: DadosAdmin = {
  nome:         '',
  cnpj:         '',
  estado:       '',
  cidade:       '',
  segmento:     '',
  tipo_empresa: '',
  plano:        '',
  subdominio:   '',
  criadaEm:     '',
}

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
  const { t } = useTranslation()
  const { user } = useUser()
  const addNotification = useShellStore((state) => state.addNotification)

  const [dados, setDados] = useState<DadosAdmin>(dadosVazios)
  const [dadosIniciais, setDadosIniciais] = useState<DadosAdmin>(dadosVazios)
  const { dirty, resetDirty } = useDirty(dadosIniciais, dados)

  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const { cidades, carregando: carregandoCidades } = useCidadesIBGE(dados.estado)

  // Carregar dados da plataforma do backend
  useEffect(() => {
    async function loadConfig() {
      try {
        setCarregando(true)
        const res = await adminPlatformApi.getConfig()
        if (res.config) {
          const c = res.config
          const loaded: DadosAdmin = {
            nome: c.name || '',
            cnpj: c.cnpj || '',
            estado: c.estado_organizacao || '',
            cidade: c.cidade_organizacao || '',
            segmento: c.segmento_organizacao || '',
            tipo_empresa: c.tipo_empresa || '',
            plano: c.subscriptions?.[0]?.plan || 'N/A',
            subdominio: c.slug || '',
            criadaEm: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '',
          }
          setDados(loaded)
          setDadosIniciais(loaded)
          resetDirty(loaded)
        }
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('admin.visao-geral.msg_erro_carregar') })
      } finally {
        setCarregando(false)
      }
    }
    loadConfig()
  }, [])


  function set(key: keyof DadosAdmin, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  async function handleSalvar() {
    try {
      setSalvando(true)
      await adminPlatformApi.updateConfig({
        name: dados.nome,
        cnpj: dados.cnpj,
        estado_organizacao: dados.estado,
        cidade_organizacao: dados.cidade,
        segmento_organizacao: dados.segmento,
        tipo_empresa: dados.tipo_empresa,
      })

      setDadosIniciais(dados)
      resetDirty(dados)
      addNotification({
        type: 'success',
        message: t('admin.visao-geral.msg_sucesso')
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : t('admin.visao-geral.msg_erro')
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
          titulo={t('admin.visao-geral.titulo')}
          subtitulo={t('admin.visao-geral.subtitulo')}
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
            <TooltipGlobal titulo={t('admin.visao-geral.badge_nivel_super')} descricao={t('admin.visao-geral.badge_nivel_super_desc')}>
              <span className="em-identity__badge" style={{ cursor: 'help', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>{t('admin.visao-geral.badge_hq_owner')}</span>
            </TooltipGlobal>
            <h2 className="em-identity__nome">{dados.nome}</h2>
            <p className="em-identity__sub">
              <TooltipGlobal titulo={t('admin.visao-geral.badge_plano')} descricao={t('admin.visao-geral.badge_status_master')}>
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
          <TooltipGlobal titulo={t('admin.visao-geral.dados_registrados')} descricao={t('admin.visao-geral.dados_registrados_desc')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
              <Buildings weight="duotone" size={14} color="#10b981" />
              {t('admin.visao-geral.secao_institucional')}
            </span>
          </TooltipGlobal>
        </p>
        <div className="em-grid">
          <GeralCampoGlobal
            label={t('admin.visao-geral.campo_empresa')} obrigatorio
            tooltipTitulo={t('admin.visao-geral.campo_empresa_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_empresa_desc')}
          >
            <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#10b981' } as React.CSSProperties}>
              <Buildings size={16} />
              <input value={dados.nome} onChange={e => set('nome', e.target.value)} />
            </div>
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('admin.visao-geral.campo_cnpj')}
            tooltipTitulo={t('admin.visao-geral.campo_cnpj_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_cnpj_desc')}
          >
            <div className="ws-input-icon-wrap" style={{ '--ws-focus-ring': '#10b981' } as React.CSSProperties}>
              <IdentificationCard size={16} />
              <input value={dados.cnpj} onChange={e => set('cnpj', e.target.value)} />
            </div>
          </GeralCampoGlobal>
        </div>
        <div className="em-grid em-grid--4">
          <GeralCampoGlobal
            label={t('admin.visao-geral.campo_estado')}
            tooltipTitulo={t('admin.visao-geral.campo_estado_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_estado_desc')}
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
            label={t('admin.visao-geral.campo_cidade')}
            tooltipTitulo={t('admin.visao-geral.campo_cidade_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_cidade_desc')}
          >
            <SelectGlobal
              iconeEsquerda={<MapPin size={16} />}
              opcoes={cidades}
              valor={dados.cidade || null}
              aoMudarValor={v => set('cidade', String(v ?? ''))}
              placeholder={dados.estado ? t('comum.selecione') : t('admin.visao-geral.aguardando_estado')}
              buscavel desabilitado={!dados.estado} carregando={carregandoCidades}
            />
          </GeralCampoGlobal>
          <GeralCampoGlobal
            label={t('admin.visao-geral.campo_segmento')}
            tooltipTitulo={t('admin.visao-geral.campo_segmento_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_segmento_desc')}
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
            label={t('admin.visao-geral.campo_tipo_empresa')}
            tooltipTitulo={t('admin.visao-geral.campo_tipo_empresa_tooltip')}
            tooltipDescricao={t('admin.visao-geral.campo_tipo_empresa_desc')}
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

      {/* ── Dados do Plano ── */}
      <div className="em-section ws-fade-up ws-fade-up-d2">
        <p className="ws-section-title" style={{ width: 'max-content' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
            <Package weight="duotone" size={14} color="#10b981" />
            {t('admin.visao-geral.secao_infra')}
          </span>
        </p>
        <div className="em-plan-row">
          <div className="em-plan-info">
            <TooltipGlobal descricao={t('admin.visao-geral.infra_nucleo_desc')}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="em-plan-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Package weight="duotone" size={22} /></div>
                <div>
                  <p className="em-plan-label">{t('admin.visao-geral.instancia_atual')}</p>
                  <p className="em-plan-name">{dados.plano}</p>
                </div>
              </div>
            </TooltipGlobal>
          </div>
          <div className="em-plan-meta">
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao={t('admin.visao-geral.infra_url_desc')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}>
                  <Globe size={14} weight="duotone" /> <span>{dados.subdominio}.gravity.com.br</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao={t('admin.visao-geral.infra_data_desc')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'help' }}>
                  <CalendarBlank size={14} weight="duotone" /> <span>{t('admin.visao-geral.operando_desde')} {dados.criadaEm}</span>
                </span>
              </TooltipGlobal>
            </div>
            <div className="em-plan-meta-item">
              <TooltipGlobal descricao={t('admin.visao-geral.infra_regiao_desc')}>
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
