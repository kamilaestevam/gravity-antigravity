/**
 * DadosTecnicos.tsx — Formulario de Dados Tecnicos do Processo
 *
 * Secoes: Importador, Exportador, Transporte Internacional, Despacho Aduaneiro, Seguro.
 * Melhorias: pill tabs, CardGraficoGlobal (gauge de preenchimento), CampoLocalizarExpandidoGlobal.
 */

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GearSix,
  Buildings,
  Airplane,
  Scales,
  ShieldCheck,
  IdentificationCard,
  MapPin,
  Globe,
  Anchor,
  FileText,
  CurrencyDollar,
  ChartPieSlice,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { BotoesSalvarGlobal, useDirty } from '@nucleo/botoes-salvar-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CardGraficoGlobal } from '@nucleo/card-global'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { useShellStore } from '@gravity/shell'
import './DadosTecnicos.css'

// ── Opcoes dos selects ────────────────────────────────────────────────────────

const OPCOES_VIA_TRANSPORTE: SelectOpcao[] = [
  { valor: 'maritima',    rotulo: 'Maritima' },
  { valor: 'aerea',       rotulo: 'Aerea' },
  { valor: 'terrestre',   rotulo: 'Terrestre' },
  { valor: 'multimodal',  rotulo: 'Multimodal' },
  { valor: 'fluvial',     rotulo: 'Fluvial' },
  { valor: 'ferroviaria', rotulo: 'Ferroviaria' },
]

const OPCOES_TIPO_CARGA: SelectOpcao[] = [
  { valor: 'container',       rotulo: 'Container' },
  { valor: 'granel_solido',   rotulo: 'Granel Solido' },
  { valor: 'granel_liquido',  rotulo: 'Granel Liquido' },
  { valor: 'carga_geral',     rotulo: 'Carga Geral' },
  { valor: 'carga_solta',     rotulo: 'Carga Solta' },
  { valor: 'ro_ro',           rotulo: 'RO-RO' },
]

const OPCOES_INCOTERM: SelectOpcao[] = [
  { valor: 'EXW', rotulo: 'EXW - Ex Works' },
  { valor: 'FOB', rotulo: 'FOB - Free On Board' },
  { valor: 'FCA', rotulo: 'FCA - Free Carrier' },
  { valor: 'CFR', rotulo: 'CFR - Cost and Freight' },
  { valor: 'CIF', rotulo: 'CIF - Cost, Insurance and Freight' },
  { valor: 'CPT', rotulo: 'CPT - Carriage Paid To' },
  { valor: 'CIP', rotulo: 'CIP - Carriage and Insurance Paid To' },
  { valor: 'DDP', rotulo: 'DDP - Delivered Duty Paid' },
  { valor: 'DAP', rotulo: 'DAP - Delivered At Place' },
  { valor: 'DPU', rotulo: 'DPU - Delivered at Place Unloaded' },
]

const OPCOES_CANAL: SelectOpcao[] = [
  { valor: 'verde',    rotulo: 'Verde' },
  { valor: 'amarelo',  rotulo: 'Amarelo' },
  { valor: 'vermelho', rotulo: 'Vermelho' },
  { valor: 'cinza',    rotulo: 'Cinza' },
]

const OPCOES_REGIME: SelectOpcao[] = [
  { valor: 'comum',                rotulo: 'Comum' },
  { valor: 'simplificado',         rotulo: 'Simplificado' },
  { valor: 'drawback',             rotulo: 'Drawback' },
  { valor: 'admissao_temporaria',  rotulo: 'Admissao Temporaria' },
  { valor: 'entreposto',           rotulo: 'Entreposto Aduaneiro' },
  { valor: 'recof',                rotulo: 'RECOF' },
]

// ── Tipo do formulario ────────────────────────────────────────────────────────

interface DadosTecnicosForm {
  importador_nome: string
  importador_cnpj: string
  importador_endereco: string
  importador_cidade: string
  importador_uf: string
  exportador_nome: string
  exportador_endereco: string
  exportador_cidade: string
  exportador_pais: string
  via_transporte: string
  tipo_carga: string
  porto_embarque: string
  porto_destino: string
  companhia_transporte: string
  numero_bl_awb: string
  incoterm: string
  canal: string
  regime_tributario: string
  recinto_alfandegado: string
  urfa: string
  seguradora: string
  numero_apolice: string
  valor_segurado: string
  moeda_seguro: string
}

const dadosIniciais: DadosTecnicosForm = {
  importador_nome: 'Acme Importacoes Ltda.',
  importador_cnpj: '12.345.678/0001-99',
  importador_endereco: 'Av. Paulista, 1000',
  importador_cidade: 'Sao Paulo',
  importador_uf: 'SP',
  exportador_nome: 'Shanghai Electronics Co.',
  exportador_endereco: '88 Nanjing Road',
  exportador_cidade: 'Shanghai',
  exportador_pais: 'CN',
  via_transporte: 'maritima',
  tipo_carga: 'container',
  porto_embarque: 'Shanghai',
  porto_destino: 'Santos',
  companhia_transporte: 'Maersk Line',
  numero_bl_awb: 'MSKU1234567',
  incoterm: 'CIF',
  canal: 'verde',
  regime_tributario: 'comum',
  recinto_alfandegado: 'Santos Brasil',
  urfa: 'ALF/Santos',
  seguradora: 'Tokio Marine',
  numero_apolice: 'AP-2026-001234',
  valor_segurado: '108050.00',
  moeda_seguro: 'USD',
}

// ── Abas ──────────────────────────────────────────────────────────────────────

type AbaId = 'partes' | 'transporte' | 'despacho' | 'seguro'

const ABAS: { id: AbaId; rotulo: string }[] = [
  { id: 'partes',     rotulo: 'Partes' },
  { id: 'transporte', rotulo: 'Transporte' },
  { id: 'despacho',   rotulo: 'Despacho' },
  { id: 'seguro',     rotulo: 'Seguro' },
]

// Campos por aba (para calculo do gauge de preenchimento)
const CAMPOS_POR_ABA: Record<AbaId, (keyof DadosTecnicosForm)[]> = {
  partes: [
    'importador_nome', 'importador_cnpj', 'importador_endereco', 'importador_cidade', 'importador_uf',
    'exportador_nome', 'exportador_endereco', 'exportador_cidade', 'exportador_pais',
  ],
  transporte: [
    'via_transporte', 'tipo_carga', 'porto_embarque', 'porto_destino', 'companhia_transporte', 'numero_bl_awb',
  ],
  despacho: [
    'incoterm', 'canal', 'regime_tributario', 'recinto_alfandegado', 'urfa',
  ],
  seguro: [
    'seguradora', 'numero_apolice', 'valor_segurado', 'moeda_seguro',
  ],
}

const TODOS_CAMPOS = Object.values(CAMPOS_POR_ABA).flat()

// ── Componente ────────────────────────────────────────────────────────────────

export default function DadosTecnicos() {
  const { t } = useTranslation()
  const addNotification = useShellStore((state) => state.addNotification)

  const [dadosIniciaisLocal, setDadosIniciaisLocal] = useState<DadosTecnicosForm>(dadosIniciais)
  const [dados, setDados] = useState<DadosTecnicosForm>(dadosIniciais)
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<AbaId>('partes')

  const { dirty, resetDirty } = useDirty(dadosIniciaisLocal, dados)

  function set(key: keyof DadosTecnicosForm, value: string) {
    setDados(p => ({ ...p, [key]: value }))
  }

  // ── Gauge de preenchimento ──────────────────────────────────────────────
  const { preenchidos, vazios, total } = useMemo(() => {
    let filled = 0
    for (const campo of TODOS_CAMPOS) {
      if (dados[campo].trim() !== '') filled++
    }
    return { preenchidos: filled, vazios: TODOS_CAMPOS.length - filled, total: TODOS_CAMPOS.length }
  }, [dados])

  // ── Handlers ────────────────────────────────────────────────────────────
  async function handleSalvar() {
    try {
      setSalvando(true)
      await new Promise(res => setTimeout(res, 1200))

      localStorage.setItem('gravity:dados-tecnicos', JSON.stringify(dados))
      setDadosIniciaisLocal(dados)
      resetDirty(dados)

      addNotification({
        type: 'success',
        message: 'Dados tecnicos salvos com sucesso!',
      })
    } catch {
      addNotification({
        type: 'error',
        message: 'Nao foi possivel salvar os dados tecnicos. Tente novamente.',
      })
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelar() {
    setDados(dadosIniciaisLocal)
    resetDirty(dadosIniciaisLocal)
  }

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="formulario"
      cabecalho={
        <CabecalhoGlobal
          icone={<GearSix weight="duotone" size={22} />}
          titulo={t('processo.menu.dados_tecnicos')}
          subtitulo={t('processo.dados_tecnicos.subtitulo')}
        />
      }
    >

      {/* ── Top bar: Gauge + Search + Tabs ─────────────────────────────────── */}
      <div className="dt-top-bar ws-fade-up">
        <CardGraficoGlobal
          titulo={t('processo.dados_tecnicos.preenchimento')}
          icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
          total={total}
          valorPrincipal={preenchidos}
          corGauge={preenchidos === total ? '#34d399' : preenchidos >= total * 0.5 ? '#fbbf24' : '#f87171'}
          legenda={[
            { label: t('processo.dados_tecnicos.preenchidos'), valor: preenchidos, cor: 'green' },
            { label: t('processo.dados_tecnicos.vazios'),      valor: vazios,      cor: 'red' },
          ]}
          tooltip={
            <>
              <div className="cg-tooltip__row">
                <span>{t('processo.dados_tecnicos.preenchidos')}</span>
                <strong style={{ color: '#34d399' }}>{preenchidos}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>{t('processo.dados_tecnicos.vazios')}</span>
                <strong style={{ color: '#f87171' }}>{vazios}</strong>
              </div>
              <div className="cg-tooltip__row">
                <span>Total de campos</span>
                <strong>{total}</strong>
              </div>
            </>
          }
        />

        <div className="dt-top-right">
          <div className="dt-search-row">
            <CampoLocalizarExpandidoGlobal
              placeholder={t('processo.dados_tecnicos.buscar')}
              disableGlobalDOMFilter={false}
            />
          </div>

          <div className="dt-tabs">
            {ABAS.map(aba => (
              <button
                key={aba.id}
                type="button"
                className={`dt-tab${abaAtiva === aba.id ? ' active' : ''}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Aba: Partes (Importador + Exportador) ─────────────────────────── */}
      {abaAtiva === 'partes' && (
        <>
          {/* Importador */}
          <div className="dt-section ws-fade-up ws-fade-up-d1">
            <p className="ws-section-title" style={{ width: 'max-content' }}>
              <TooltipGlobal titulo={t('processo.dados_tecnicos.importador')} descricao={t('processo.dados_tecnicos.importador_desc')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Buildings weight="duotone" size={14} color="var(--ws-accent)" />
                  {t('processo.dados_tecnicos.importador')}
                </span>
              </TooltipGlobal>
            </p>
            <div className="em-grid">
              <CampoGeralGlobal
                label="Razao Social"
                obrigatorio
                tooltipTitulo="Razao Social"
                tooltipDescricao="Nome legal do importador usado nos documentos oficiais"
              >
                <div className="ws-input-icon-wrap">
                  <Buildings size={16} />
                  <input
                    value={dados.importador_nome}
                    placeholder="Ex: Acme Importacoes Ltda."
                    onChange={e => set('importador_nome', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
              <CampoGeralGlobal
                label="CNPJ"
                obrigatorio
                tooltipTitulo="CNPJ"
                tooltipDescricao="Cadastro nacional usado na DI e demais documentos aduaneiros"
              >
                <div className="ws-input-icon-wrap">
                  <IdentificationCard size={16} />
                  <input
                    value={dados.importador_cnpj}
                    placeholder="00.000.000/0000-00"
                    onChange={e => set('importador_cnpj', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
            </div>
            <div className="em-grid em-grid--3">
              <CampoGeralGlobal
                label="Endereco"
                tooltipTitulo="Endereco"
                tooltipDescricao="Endereco fiscal do importador conforme cadastro na Receita Federal"
              >
                <div className="ws-input-icon-wrap">
                  <MapPin size={16} />
                  <input
                    value={dados.importador_endereco}
                    placeholder="Rua, numero"
                    onChange={e => set('importador_endereco', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
              <CampoGeralGlobal
                label="Cidade"
                tooltipTitulo="Cidade"
                tooltipDescricao="Municipio sede do importador informado na documentacao"
              >
                <div className="ws-input-icon-wrap">
                  <MapPin size={16} />
                  <input
                    value={dados.importador_cidade}
                    placeholder="Sao Paulo"
                    onChange={e => set('importador_cidade', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
              <CampoGeralGlobal
                label="UF"
                tooltipTitulo="Unidade Federativa"
                tooltipDescricao="Estado do importador exigido no registro da DI"
              >
                <div className="ws-input-icon-wrap">
                  <MapPin size={16} />
                  <input
                    value={dados.importador_uf}
                    placeholder="SP"
                    maxLength={2}
                    onChange={e => set('importador_uf', e.target.value.toUpperCase())}
                  />
                </div>
              </CampoGeralGlobal>
            </div>
          </div>

          {/* Exportador */}
          <div className="dt-section ws-fade-up ws-fade-up-d1">
            <p className="ws-section-title" style={{ width: 'max-content' }}>
              <TooltipGlobal titulo={t('processo.dados_tecnicos.exportador')} descricao={t('processo.dados_tecnicos.exportador_desc')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Globe weight="duotone" size={14} color="var(--ws-accent)" />
                  {t('processo.dados_tecnicos.exportador')}
                </span>
              </TooltipGlobal>
            </p>
            <div className="em-grid">
              <CampoGeralGlobal
                label="Nome / Razao Social"
                obrigatorio
                tooltipTitulo="Nome do Exportador"
                tooltipDescricao="Razao social do fornecedor conforme a fatura comercial"
              >
                <div className="ws-input-icon-wrap">
                  <Buildings size={16} />
                  <input
                    value={dados.exportador_nome}
                    placeholder="Nome do exportador"
                    onChange={e => set('exportador_nome', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
              <CampoGeralGlobal
                label="Pais"
                tooltipTitulo="Pais de Origem"
                tooltipDescricao="Codigo ISO do pais de origem da mercadoria para fins fiscais"
              >
                <div className="ws-input-icon-wrap">
                  <Globe size={16} />
                  <input
                    value={dados.exportador_pais}
                    placeholder="CN"
                    maxLength={2}
                    onChange={e => set('exportador_pais', e.target.value.toUpperCase())}
                  />
                </div>
              </CampoGeralGlobal>
            </div>
            <div className="em-grid">
              <CampoGeralGlobal
                label="Endereco"
                tooltipTitulo="Endereco do Exportador"
                tooltipDescricao="Endereco comercial do exportador conforme invoice"
              >
                <div className="ws-input-icon-wrap">
                  <MapPin size={16} />
                  <input
                    value={dados.exportador_endereco}
                    placeholder="Endereco do exportador"
                    onChange={e => set('exportador_endereco', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
              <CampoGeralGlobal
                label="Cidade"
                tooltipTitulo="Cidade do Exportador"
                tooltipDescricao="Cidade sede do exportador informada nos documentos de embarque"
              >
                <div className="ws-input-icon-wrap">
                  <MapPin size={16} />
                  <input
                    value={dados.exportador_cidade}
                    placeholder="Cidade do exportador"
                    onChange={e => set('exportador_cidade', e.target.value)}
                  />
                </div>
              </CampoGeralGlobal>
            </div>
          </div>
        </>
      )}

      {/* ── Aba: Transporte Internacional ──────────────────────────────────── */}
      {abaAtiva === 'transporte' && (
        <div className="dt-section ws-fade-up ws-fade-up-d1">
          <p className="ws-section-title" style={{ width: 'max-content' }}>
            <TooltipGlobal titulo={t('processo.dados_tecnicos.transporte')} descricao={t('processo.dados_tecnicos.transporte_desc')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Airplane weight="duotone" size={14} color="var(--ws-accent)" />
                {t('processo.dados_tecnicos.transporte')}
              </span>
            </TooltipGlobal>
          </p>
          <div className="em-grid em-grid--3">
            <CampoGeralGlobal
              label="Via de Transporte"
              tooltipTitulo="Via de Transporte"
              tooltipDescricao="Modal utilizado para o transporte internacional da carga"
            >
              <SelectGlobal
                iconeEsquerda={<Airplane size={16} />}
                opcoes={OPCOES_VIA_TRANSPORTE}
                valor={dados.via_transporte}
                aoMudarValor={v => set('via_transporte', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Tipo de Carga"
              tooltipTitulo="Tipo de Carga"
              tooltipDescricao="Classificacao da carga para calculo de frete e manuseio"
            >
              <SelectGlobal
                iconeEsquerda={<Scales size={16} />}
                opcoes={OPCOES_TIPO_CARGA}
                valor={dados.tipo_carga}
                aoMudarValor={v => set('tipo_carga', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Companhia de Transporte"
              tooltipTitulo="Companhia de Transporte"
              tooltipDescricao="Transportadora responsavel pelo frete internacional"
            >
              <div className="ws-input-icon-wrap">
                <Airplane size={16} />
                <input
                  value={dados.companhia_transporte}
                  placeholder="Nome da companhia"
                  onChange={e => set('companhia_transporte', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
          </div>
          <div className="em-grid em-grid--3">
            <CampoGeralGlobal
              label="Porto de Embarque"
              tooltipTitulo="Porto de Embarque"
              tooltipDescricao="Local de partida da mercadoria no pais de origem"
            >
              <div className="ws-input-icon-wrap">
                <Anchor size={16} />
                <input
                  value={dados.porto_embarque}
                  placeholder="Ex: Shanghai"
                  onChange={e => set('porto_embarque', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Porto de Destino"
              tooltipTitulo="Porto de Destino"
              tooltipDescricao="Local de chegada da mercadoria no territorio brasileiro"
            >
              <div className="ws-input-icon-wrap">
                <Anchor size={16} />
                <input
                  value={dados.porto_destino}
                  placeholder="Ex: Santos"
                  onChange={e => set('porto_destino', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Numero BL / AWB"
              tooltipTitulo="Conhecimento de Embarque"
              tooltipDescricao="Numero do BL ou AWB que comprova o embarque da mercadoria"
            >
              <div className="ws-input-icon-wrap">
                <FileText size={16} />
                <input
                  value={dados.numero_bl_awb}
                  placeholder="Numero do conhecimento"
                  onChange={e => set('numero_bl_awb', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
          </div>
        </div>
      )}

      {/* ── Aba: Despacho Aduaneiro ────────────────────────────────────────── */}
      {abaAtiva === 'despacho' && (
        <div className="dt-section ws-fade-up ws-fade-up-d1">
          <p className="ws-section-title" style={{ width: 'max-content' }}>
            <TooltipGlobal titulo={t('processo.dados_tecnicos.despacho')} descricao={t('processo.dados_tecnicos.despacho_desc')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Scales weight="duotone" size={14} color="var(--ws-accent)" />
                {t('processo.dados_tecnicos.despacho')}
              </span>
            </TooltipGlobal>
          </p>
          <div className="em-grid em-grid--3">
            <CampoGeralGlobal
              label="Incoterm"
              tooltipTitulo="Incoterm"
              tooltipDescricao="Termo de comercio que define as responsabilidades entre as partes"
            >
              <SelectGlobal
                iconeEsquerda={<Globe size={16} />}
                opcoes={OPCOES_INCOTERM}
                valor={dados.incoterm}
                aoMudarValor={v => set('incoterm', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Canal"
              tooltipTitulo="Canal de Parametrizacao"
              tooltipDescricao="Canal definido pela Receita Federal para conferencia da DI"
            >
              <SelectGlobal
                iconeEsquerda={<ShieldCheck size={16} />}
                opcoes={OPCOES_CANAL}
                valor={dados.canal}
                aoMudarValor={v => set('canal', String(v ?? ''))}
                placeholder="Selecione..."
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Regime Tributario"
              tooltipTitulo="Regime Tributario"
              tooltipDescricao="Regime fiscal aplicado a importacao para calculo de tributos"
            >
              <SelectGlobal
                iconeEsquerda={<Scales size={16} />}
                opcoes={OPCOES_REGIME}
                valor={dados.regime_tributario}
                aoMudarValor={v => set('regime_tributario', String(v ?? ''))}
                placeholder="Selecione..."
                buscavel
              />
            </CampoGeralGlobal>
          </div>
          <div className="em-grid">
            <CampoGeralGlobal
              label="Recinto Alfandegado"
              tooltipTitulo="Recinto Alfandegado"
              tooltipDescricao="Local autorizado pela Receita para armazenagem e conferencia"
            >
              <div className="ws-input-icon-wrap">
                <Buildings size={16} />
                <input
                  value={dados.recinto_alfandegado}
                  placeholder="Nome do recinto"
                  onChange={e => set('recinto_alfandegado', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="URFA"
              tooltipTitulo="URFA"
              tooltipDescricao="Unidade da Receita Federal responsavel pelo despacho da DI"
            >
              <div className="ws-input-icon-wrap">
                <ShieldCheck size={16} />
                <input
                  value={dados.urfa}
                  placeholder="Unidade da Receita Federal"
                  onChange={e => set('urfa', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
          </div>
        </div>
      )}

      {/* ── Aba: Seguro ────────────────────────────────────────────────────── */}
      {abaAtiva === 'seguro' && (
        <div className="dt-section ws-fade-up ws-fade-up-d1">
          <p className="ws-section-title" style={{ width: 'max-content' }}>
            <TooltipGlobal titulo={t('processo.dados_tecnicos.seguro')} descricao={t('processo.dados_tecnicos.seguro_desc')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ShieldCheck weight="duotone" size={14} color="var(--ws-accent)" />
                {t('processo.dados_tecnicos.seguro')}
              </span>
            </TooltipGlobal>
          </p>
          <div className="em-grid">
            <CampoGeralGlobal
              label="Seguradora"
              tooltipTitulo="Seguradora"
              tooltipDescricao="Empresa responsavel pela cobertura do seguro de transporte"
            >
              <div className="ws-input-icon-wrap">
                <ShieldCheck size={16} />
                <input
                  value={dados.seguradora}
                  placeholder="Nome da seguradora"
                  onChange={e => set('seguradora', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Numero da Apolice"
              tooltipTitulo="Numero da Apolice"
              tooltipDescricao="Identificador da apolice de seguro vinculada ao embarque"
            >
              <div className="ws-input-icon-wrap">
                <FileText size={16} />
                <input
                  value={dados.numero_apolice}
                  placeholder="Numero da apolice"
                  onChange={e => set('numero_apolice', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
          </div>
          <div className="em-grid">
            <CampoGeralGlobal
              label="Valor Segurado"
              tooltipTitulo="Valor Segurado"
              tooltipDescricao="Montante total coberto pelo seguro em caso de sinistro"
            >
              <div className="ws-input-icon-wrap">
                <CurrencyDollar size={16} />
                <input
                  type="number"
                  value={dados.valor_segurado}
                  placeholder="0.00"
                  onChange={e => set('valor_segurado', e.target.value)}
                />
              </div>
            </CampoGeralGlobal>
            <CampoGeralGlobal
              label="Moeda do Seguro"
              tooltipTitulo="Moeda do Seguro"
              tooltipDescricao="Moeda na qual o valor segurado esta denominado"
            >
              <div className="ws-input-icon-wrap">
                <CurrencyDollar size={16} />
                <input
                  value={dados.moeda_seguro}
                  placeholder="Selecionar moeda"
                  maxLength={3}
                  onChange={e => set('moeda_seguro', e.target.value.toUpperCase())}
                />
              </div>
            </CampoGeralGlobal>
          </div>
        </div>
      )}

      {/* ── Salvar / Cancelar ──────────────────────────────────────────────── */}
      <BotoesSalvarGlobal
        dirty={dirty}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
        alinhamento="direita"
      />
    </PaginaGlobal>
  )
}
