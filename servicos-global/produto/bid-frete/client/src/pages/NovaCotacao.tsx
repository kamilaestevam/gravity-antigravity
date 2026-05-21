/**
 * NovaCotacao.tsx — Wizard de Nova Cotação (T7)
 * Redesenhado para UX 10/10 com visual premium, glassmorphism, micro-animações,
 * cards ricos em descrição, painel inteligente de Incoterms e resumo visual avançado.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  Check,
  Anchor,
  AirplaneTilt,
  Van,
  Package,
  MapPin,
  Scales,
  Users,
  FileText,
  CheckCircle,
  Warning,
  Info,
  X,
} from '@phosphor-icons/react'

import { StepperPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { criarCotacao } from '../shared/api'
import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  Visibilidade,
} from '../shared/types'
import {
  OPERACAO_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
  INCOTERMS,
} from '../shared/types'

// ─── Passos do wizard ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem',           icone: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Destino',          icone: <MapPin weight="duotone" size={16} /> },
  { id: 4, label: 'Carga',            icone: <Package weight="duotone" size={16} /> },
  { id: 5, label: 'Incoterm',         icone: <Scales weight="duotone" size={16} /> },
  { id: 6, label: 'Fornecedores',     icone: <Users weight="duotone" size={16} /> },
  { id: 7, label: 'Resumo',           icone: <FileText weight="duotone" size={16} /> },
]

// ─── Form State ──────────────────────────────────────────────────────────────
interface FormState {
  tipo_operacao: TipoOperacao | ''
  modal: ModalFrete | ''
  modalidade: ModalidadeCarga | ''
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm: string
  quantidade: number
  tipo_container: string
  peso_kg: string
  cubagem_m3: string
  incoterm: string
  cep_destino: string
  prazo_resposta: string
  visibilidade: Visibilidade
  anonima: boolean
  valor_alvo: string
  moeda_alvo: string
}

const INITIAL_FORM: FormState = {
  tipo_operacao: '',
  modal: '',
  modalidade: '',
  origem_codigo: '',
  origem_nome: '',
  origem_pais: '',
  destino_codigo: '',
  destino_nome: '',
  destino_pais: '',
  descricao_mercadoria: '',
  ncm: '',
  quantidade: 1,
  tipo_container: '',
  peso_kg: '',
  cubagem_m3: '',
  incoterm: '',
  cep_destino: '',
  prazo_resposta: '',
  visibilidade: 'DIRECIONADA',
  anonima: false,
  valor_alvo: '',
  moeda_alvo: 'USD',
}

// ─── Descrições Enriquecidas de Opções ──────────────────────────────────────
const OPERACAO_DESCS: Record<TipoOperacao, string> = {
  IMPORTACAO: 'Trazer cargas de outros países para o território nacional.',
  EXPORTACAO: 'Enviar produtos nacionais para compradores internacionais.',
}

const MODAL_DESCS: Record<ModalFrete, string> = {
  MARITIMO: 'Grandes volumes por vias oceânicas com custo altamente otimizado.',
  AEREO: 'Agilidade máxima e trânsito expresso para mercadorias críticas.',
  RODOVIARIO: 'Transporte flexível, direto e porta-a-porta por rodovias.',
}

const MODALIDADE_DESCS: Record<ModalidadeCarga, string> = {
  FCL: 'Container completo e exclusivo para acomodar suas mercadorias.',
  LCL: 'Carga fracionada. Pague somente pelo volume que ocupar no container.',
  AEREO_GERAL: 'Envio aéreo padrão para cargas gerais em compartimentos dedicados.',
  RODOVIARIO_FTL: 'Caminhão inteiro e exclusivo dedicado para a sua logística.',
  RODOVIARIO_LTL: 'Carga rodoviária fracionada consolidada com outros embarques.',
}

// ─── Dicionário de Incoterms (UX Helper) ──────────────────────────────────
const INCOTERM_EXPLANATIONS: Record<string, { title: string; desc: string; responsabilidade: string }> = {
  EXW: {
    title: 'EXW — Ex Works (Na Origem)',
    desc: 'O comprador assume todos os custos e riscos a partir do estabelecimento do vendedor (coleta, porto de origem, frete internacional e taxas).',
    responsabilidade: 'Comprador assume 100% da cadeia logística.'
  },
  FCA: {
    title: 'FCA — Free Carrier (Franco Transportador)',
    desc: 'O vendedor realiza o desembaraço de exportação e entrega a carga no local/transportador indicado na origem pelo comprador.',
    responsabilidade: 'Vendedor desembaraça na origem; comprador assume a partir da entrega ao transportador.'
  },
  CPT: {
    title: 'CPT — Carriage Paid To (Transporte Pago Até)',
    desc: 'O vendedor contrata e paga o frete principal até o ponto acordado. Porém, os riscos passam ao comprador na entrega ao primeiro transportador.',
    responsabilidade: 'Custos com o vendedor; riscos de perda ou dano com o comprador durante o transporte.'
  },
  CIP: {
    title: 'CIP — Carriage and Insurance Paid To (Transporte e Seguro Pagos Até)',
    desc: 'Idêntico ao CPT, mas o vendedor é responsável por contratar e pagar um seguro de transporte contra perda ou dano da carga.',
    responsabilidade: 'Custos e seguro com o vendedor; riscos com o comprador a partir da origem.'
  },
  DAP: {
    title: 'DAP — Delivered At Place (Entregue no Local)',
    desc: 'O vendedor assume riscos e fretes até a chegada no local de destino acordado (antes da descarga). O comprador faz a importação e descarga.',
    responsabilidade: 'Vendedor assume frete internacional até o destino; comprador faz desembaraço de importação.'
  },
  DPU: {
    title: 'DPU — Delivered at Place Unloaded (Entregue no Local Descarregado)',
    desc: 'O vendedor entrega a mercadoria descarregada do meio de transporte no local indicado. Substitui o antigo DAT.',
    responsabilidade: 'Vendedor assume o transporte e a descarga no destino; comprador faz o desembaraço.'
  },
  DDP: {
    title: 'DDP — Delivered Duty Paid (Entregue com Direitos Pagos)',
    desc: 'O vendedor assume todos os custos e riscos da operação até a entrega no destino do comprador, incluindo tarifas alfandegárias de importação.',
    responsabilidade: 'Vendedor assume 100% da logística e impostos de importação.'
  },
  FAS: {
    title: 'FAS — Free Alongside Ship (Livre ao Lado do Navio)',
    desc: 'O vendedor coloca a mercadoria ao lado do navio do comprador no porto de embarque indicado. Risco passa na linha de cais.',
    responsabilidade: 'Exclusivo para modal marítimo/fluvial. Comprador contrata frete internacional.'
  },
  FOB: {
    title: 'FOB — Free On Board (Livre a Bordo)',
    desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
    responsabilidade: 'Exclusivo para modal marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.'
  },
  CFR: {
    title: 'CFR — Cost and Freight (Custo e Frete)',
    desc: 'O vendedor paga os custos e frete marítimo até o porto de destino. Os riscos de perda são transferidos ao comprador no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete pago pelo vendedor; seguro internacional é opcional do comprador.'
  },
  CIF: {
    title: 'CIF — Cost, Insurance and Freight (Custo, Seguro e Frete)',
    desc: 'O vendedor paga custos, frete internacional e contrata seguro marítimo até o porto de destino designado. Riscos transferem no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete e seguro básico com o vendedor; riscos com o comprador.'
  }
}

// ─── Premium Option Button ──────────────────────────────────────────────────
function OptionButton({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      className={`nc-option-btn ${selected ? 'nc-option-btn--selected' : ''}`}
      onClick={onClick}
    >
      <span className="nc-option-icon">{icon}</span>
      <div className="nc-option-text">
        <span className="nc-option-label">{label}</span>
        {description && <span className="nc-option-desc">{description}</span>}
      </div>
    </button>
  )
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="nc-field">
      <label className="nc-field-label">
        {label}
        {required && <span style={{ color: 'var(--danger, #ef4444)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function NovaCotacao() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [cotacaoId, setCotacaoId] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.tipo_operacao && !!form.modal && !!form.modalidade
      case 2: return !!form.origem_codigo && !!form.origem_nome
      case 3: return !!form.destino_codigo && !!form.destino_nome
      case 4: return !!form.descricao_mercadoria && form.quantidade > 0
      case 5: return !!form.incoterm
      case 6: return true
      case 7: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSalvando(true)
    try {
      const cotacao = await criarCotacao({
        tipo_operacao: form.tipo_operacao as TipoOperacao,
        modal: form.modal as ModalFrete,
        modalidade: form.modalidade as ModalidadeCarga,
        origem_codigo: form.origem_codigo,
        origem_nome: form.origem_nome,
        origem_pais: form.origem_pais,
        destino_codigo: form.destino_codigo,
        destino_nome: form.destino_nome,
        destino_pais: form.destino_pais,
        descricao_mercadoria: form.descricao_mercadoria,
        ncm: form.ncm || undefined,
        quantidade: form.quantidade,
        tipo_container: form.tipo_container || undefined,
        peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : undefined,
        cubagem_m3: form.cubagem_m3 ? parseFloat(form.cubagem_m3) : undefined,
        incoterm: form.incoterm,
        cep_destino: form.cep_destino || undefined,
        visibilidade: form.visibilidade,
        anonima: form.anonima,
        valor_alvo: form.valor_alvo ? parseFloat(form.valor_alvo) : undefined,
        moeda_alvo: form.moeda_alvo,
      })
      setCotacaoId(cotacao.id)
      setSucesso(true)
    } catch {
      // erro tratado
    } finally {
      setSalvando(false)
    }
  }

  // ─── Step Content ─────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // STEP 1 — Modal e Operação
      case 1:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.tipo_operacao')}</h3>
            <div className="nc-options-grid-2">
              {(['IMPORTACAO', 'EXPORTACAO'] as TipoOperacao[]).map(op => (
                <OptionButton
                  key={op}
                  selected={form.tipo_operacao === op}
                  onClick={() => {
                    set('tipo_operacao', op)
                  }}
                  icon={op === 'IMPORTACAO' ? <ArrowLeft weight="duotone" size={24} /> : <ArrowRight weight="duotone" size={24} />}
                  label={OPERACAO_LABELS[op]}
                  description={OPERACAO_DESCS[op]}
                />
              ))}
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modal_frete')}</h3>
            <div className="nc-options-grid-3">
              <OptionButton
                selected={form.modal === 'MARITIMO'}
                onClick={() => {
                  set('modal', 'MARITIMO')
                  set('modalidade', '') // reseta para forçar escolha limpa
                }}
                icon={<Anchor weight="duotone" size={28} />}
                label="Marítimo"
                description={MODAL_DESCS.MARITIMO}
              />
              <OptionButton
                selected={form.modal === 'AEREO'}
                onClick={() => {
                  set('modal', 'AEREO')
                  set('modalidade', '')
                }}
                icon={<AirplaneTilt weight="duotone" size={28} />}
                label="Aéreo"
                description={MODAL_DESCS.AEREO}
              />
              <OptionButton
                selected={form.modal === 'RODOVIARIO'}
                onClick={() => {
                  set('modal', 'RODOVIARIO')
                  set('modalidade', '')
                }}
                icon={<Van weight="duotone" size={28} />}
                label="Rodoviário"
                description={MODAL_DESCS.RODOVIARIO}
              />
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modalidade')}</h3>
            <div className="nc-options-grid-2">
              {form.modal === 'MARITIMO' && (
                <>
                  <OptionButton selected={form.modalidade === 'FCL'} onClick={() => set('modalidade', 'FCL')} icon={<Package weight="duotone" size={22} />} label="FCL — Container Completo" description={MODALIDADE_DESCS.FCL} />
                  <OptionButton selected={form.modalidade === 'LCL'} onClick={() => set('modalidade', 'LCL')} icon={<Package weight="duotone" size={22} />} label="LCL — Carga Fracionada" description={MODALIDADE_DESCS.LCL} />
                </>
              )}
              {form.modal === 'AEREO' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <OptionButton selected={form.modalidade === 'AEREO_GERAL'} onClick={() => set('modalidade', 'AEREO_GERAL')} icon={<AirplaneTilt weight="duotone" size={22} />} label="Aéreo Geral" description={MODALIDADE_DESCS.AEREO_GERAL} />
                </div>
              )}
              {form.modal === 'RODOVIARIO' && (
                <>
                  <OptionButton selected={form.modalidade === 'RODOVIARIO_FTL'} onClick={() => set('modalidade', 'RODOVIARIO_FTL')} icon={<Van weight="duotone" size={22} />} label="FTL — Carga Completa" description={MODALIDADE_DESCS.RODOVIARIO_FTL} />
                  <OptionButton selected={form.modalidade === 'RODOVIARIO_LTL'} onClick={() => set('modalidade', 'RODOVIARIO_LTL')} icon={<Van weight="duotone" size={22} />} label="LTL — Carga Fracionada" description={MODALIDADE_DESCS.RODOVIARIO_LTL} />
                </>
              )}
              {!form.modal && (
                <div className="nc-empty-hint">
                  <Info size={18} weight="duotone" />
                  <p>{t('bidfrete.nova_cotacao.selecionar_modal_primeiro')}</p>
                </div>
              )}
            </div>
          </div>
        )

      // STEP 2 — Origem
      case 2:
        return (
          <div className="nc-step-content">
            <div className="nc-location-visual-card nc-location-visual-card--origin">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{t('bidfrete.nova_cotacao.porto_origem')}</h4>
                  <p>Informe o local de coleta ou porto de origem de partida internacional.</p>
                </div>
              </div>
              
              <div className="nc-fields-grid nc-fields-grid--location">
                <Field label={t('bidfrete.nova_cotacao.codigo_locode')} required>
                  <input className="nc-input" placeholder="Ex: CNSHA" value={form.origem_codigo} onChange={e => set('origem_codigo', e.target.value.toUpperCase())} />
                </Field>
                <Field label={t('bidfrete.nova_cotacao.nome')} required>
                  <input className="nc-input" placeholder="Ex: Shanghai" value={form.origem_nome} onChange={e => set('origem_nome', e.target.value)} />
                </Field>
                <Field label={t('bidfrete.nova_cotacao.pais')}>
                  <input className="nc-input" placeholder="Ex: China" value={form.origem_pais} onChange={e => set('origem_pais', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        )

      // STEP 3 — Destino
      case 3:
        return (
          <div className="nc-step-content">
            <div className="nc-location-visual-card nc-location-visual-card--destination">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon-dest" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{t('bidfrete.nova_cotacao.porto_destino')}</h4>
                  <p>Defina o local de entrega final ou porto de destino de chegada.</p>
                </div>
              </div>
              
              <div className="nc-fields-grid nc-fields-grid--location">
                <Field label={t('bidfrete.nova_cotacao.codigo_locode')} required>
                  <input className="nc-input" placeholder="Ex: BRSSZ" value={form.destino_codigo} onChange={e => set('destino_codigo', e.target.value.toUpperCase())} />
                </Field>
                <Field label={t('bidfrete.nova_cotacao.nome')} required>
                  <input className="nc-input" placeholder="Ex: Santos" value={form.destino_nome} onChange={e => set('destino_nome', e.target.value)} />
                </Field>
                <Field label={t('bidfrete.nova_cotacao.pais')}>
                  <input className="nc-input" placeholder="Ex: Brasil" value={form.destino_pais} onChange={e => set('destino_pais', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        )

      // STEP 4 — Carga
      case 4:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.dados_mercadoria')}</h3>
            <div className="nc-fields-grid nc-fields-grid--cargo">
              <div style={{ gridColumn: 'span 2' }}>
                <Field label={t('bidfrete.nova_cotacao.descricao_mercadoria')} required>
                  <input className="nc-input" placeholder="Ex: Peças automotivas, eletrônicos industriais..." value={form.descricao_mercadoria} onChange={e => set('descricao_mercadoria', e.target.value)} />
                </Field>
              </div>
              <Field label={t('bidfrete.nova_cotacao.ncm')}>
                <input className="nc-input" placeholder="Ex: 87089990" value={form.ncm} onChange={e => set('ncm', e.target.value.replace(/\D/g, '').slice(0, 8))} />
              </Field>
              
              <Field label={t('bidfrete.nova_cotacao.quantidade')} required>
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" min={1} value={form.quantidade} onChange={e => set('quantidade', parseInt(e.target.value) || 1)} />
                  <span className="nc-input-suffix">un</span>
                </div>
              </Field>

              {form.modal === 'MARITIMO' && (
                <Field label={t('bidfrete.nova_cotacao.tipo_container')}>
                  <input className="nc-input" placeholder="Ex: 40' HC" value={form.tipo_container} onChange={e => set('tipo_container', e.target.value)} />
                </Field>
              )}
              
              <Field label={t('bidfrete.nova_cotacao.peso_kg')}>
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 12000" value={form.peso_kg} onChange={e => set('peso_kg', e.target.value)} />
                  <span className="nc-input-suffix">Kg</span>
                </div>
              </Field>
              
              <Field label={t('bidfrete.nova_cotacao.cubagem_m3')}>
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 33.2" value={form.cubagem_m3} onChange={e => set('cubagem_m3', e.target.value)} />
                  <span className="nc-input-suffix">m³</span>
                </div>
              </Field>
            </div>
          </div>
        )

      // STEP 5 — Incoterm
      case 5: {
        const explanation = form.incoterm ? INCOTERM_EXPLANATIONS[form.incoterm] : null

        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.incoterm')}</h3>
            <div className="nc-incoterm-grid">
              {INCOTERMS.map(inc => (
                <button
                  key={inc}
                  type="button"
                  className={`nc-incoterm-btn ${form.incoterm === inc ? 'nc-incoterm-btn--selected' : ''}`}
                  onClick={() => set('incoterm', inc)}
                >
                  {inc}
                </button>
              ))}
            </div>

            {/* UX Helper: Painel Explicativo Dinâmico do Incoterm */}
            {explanation && (
              <div className="nc-incoterm-helper-card nc-fade-in">
                <div className="nc-helper-header">
                  <Scales size={20} weight="duotone" className="nc-helper-icon" />
                  <h4>{explanation.title}</h4>
                </div>
                <p className="nc-helper-desc">{explanation.desc}</p>
                <div className="nc-helper-footer">
                  <strong>Responsabilidade:</strong> {explanation.responsabilidade}
                </div>
              </div>
            )}

            {form.incoterm === 'EXW' && (
              <div style={{ marginTop: '1.25rem' }} className="nc-fade-in">
                <Field label={t('bidfrete.nova_cotacao.cep_coleta')} required>
                  <input className="nc-input" placeholder="Ex: 01310-100" value={form.cep_destino} onChange={e => set('cep_destino', e.target.value)} />
                </Field>
              </div>
            )}
            
            <div className="nc-fields-grid" style={{ marginTop: '1.5rem' }}>
              <Field label={t('bidfrete.nova_cotacao.prazo_respostas')}>
                <input className="nc-input nc-input--date" type="datetime-local" value={form.prazo_resposta} onChange={e => set('prazo_resposta', e.target.value)} />
              </Field>
            </div>
          </div>
        )
      }

      // STEP 6 — Fornecedores
      case 6:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.visibilidade')}</h3>
            
            <div className="nc-visibilidade-grid">
              <button
                type="button"
                className={`nc-vis-card ${form.visibilidade === 'DIRECIONADA' ? 'nc-vis-card--selected' : ''}`}
                onClick={() => set('visibilidade', 'DIRECIONADA')}
              >
                <div className="nc-vis-icon-wrap">
                  <Users weight="duotone" size={24} />
                </div>
                <div className="nc-vis-info">
                  <span className="nc-vis-title">{t('bidfrete.nova_cotacao.direcionada_label')}</span>
                  <span className="nc-vis-desc">{t('bidfrete.nova_cotacao.hint_direcionada')}</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`nc-vis-card ${form.visibilidade === 'ABERTA' ? 'nc-vis-card--selected' : ''}`}
                onClick={() => set('visibilidade', 'ABERTA')}
              >
                <div className="nc-vis-icon-wrap">
                  <Users weight="duotone" size={24} />
                </div>
                <div className="nc-vis-info">
                  <span className="nc-vis-title">{t('bidfrete.nova_cotacao.aberta_label')}</span>
                  <span className="nc-vis-desc">{t('bidfrete.nova_cotacao.hint_aberta')}</span>
                </div>
              </button>
            </div>

            {/* Custom Premium Alternator Switch para Anônima */}
            <div className="nc-switch-row">
              <label className="nc-switch-label">
                <div className="nc-switch-text">
                  <span className="nc-switch-title">{t('bidfrete.nova_cotacao.anonima_label')}</span>
                  <span className="nc-switch-desc">Ocultar o nome da sua empresa no mercado inicial de lances para total confidencialidade.</span>
                </div>
                <div className="nc-switch">
                  <input type="checkbox" checked={form.anonima} onChange={e => set('anonima', e.target.checked)} />
                  <span className="nc-switch-slider"></span>
                </div>
              </label>
            </div>
          </div>
        )

      // STEP 7 — Resumo
      case 7:
        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.resumo_cotacao')}</h3>

            <div className="nc-fields-grid nc-fields-grid--summary-inputs">
              <Field label={t('bidfrete.nova_cotacao.valor_alvo')}>
                <input className="nc-input" type="number" placeholder="Ex: 5000" value={form.valor_alvo} onChange={e => set('valor_alvo', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.moeda')}>
                <select className="nc-input" value={form.moeda_alvo} onChange={e => set('moeda_alvo', e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
            </div>

            {/* Receipt Premium Layout de Resumo de Embarque */}
            <div className="nc-receipt-card">
              <div className="nc-receipt-header">
                <span className="nc-receipt-badge">{form.tipo_operacao ? OPERACAO_LABELS[form.tipo_operacao as TipoOperacao] : '—'}</span>
                <span className="nc-receipt-modal">
                  {form.modal ? MODAL_LABELS[form.modal as ModalFrete] : '—'} / {form.modalidade ? MODALIDADE_LABELS[form.modalidade as ModalidadeCarga] : '—'}
                </span>
              </div>

              {/* Linha do tempo da rota visual */}
              <div className="nc-route-timeline">
                <div className="nc-timeline-node">
                  <div className="nc-node-dot nc-node-dot--origin"></div>
                  <div className="nc-node-text">
                    <span className="nc-node-code">{form.origem_codigo || '—'}</span>
                    <span className="nc-node-name">{form.origem_nome || '—'}{form.origem_pais ? `, ${form.origem_pais}` : ''}</span>
                  </div>
                </div>

                <div className="nc-timeline-line">
                  <div className="nc-timeline-icon-wrap">
                    {form.modal === 'MARITIMO' && <Anchor weight="duotone" size={16} />}
                    {form.modal === 'AEREO' && <AirplaneTilt weight="duotone" size={16} />}
                    {form.modal === 'RODOVIARIO' && <Van weight="duotone" size={16} />}
                    {!form.modal && <Truck weight="duotone" size={16} />}
                  </div>
                  <div className="nc-timeline-line-fill"></div>
                </div>

                <div className="nc-timeline-node">
                  <div className="nc-node-dot nc-node-dot--destination"></div>
                  <div className="nc-node-text">
                    <span className="nc-node-code">{form.destino_codigo || '—'}</span>
                    <span className="nc-node-name">{form.destino_nome || '—'}{form.destino_pais ? `, ${form.destino_pais}` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="nc-receipt-details">
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_mercadoria')}</span>
                  <span className="nc-receipt-value">{form.descricao_mercadoria || '—'}</span>
                </div>
                {form.ncm && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_ncm')}</span>
                    <span className="nc-receipt-value font-mono">{form.ncm}</span>
                  </div>
                )}
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_qtd_peso')}</span>
                  <span className="nc-receipt-value">
                    {form.quantidade} un {form.peso_kg ? `| ${form.peso_kg} Kg` : ''} {form.cubagem_m3 ? `| ${form.cubagem_m3} m³` : ''}
                  </span>
                </div>
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_incoterm')}</span>
                  <span className="nc-receipt-value nc-receipt-value--incoterm">{form.incoterm || '—'}</span>
                </div>
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_visibilidade')}</span>
                  <span className="nc-receipt-value">
                    {form.visibilidade === 'ABERTA' ? 'Aberta' : 'Direcionada'}{form.anonima ? ' (Anônima)' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────
  if (sucesso) {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        navigate('/cotacoes')
      }
    }
    return (
      <div className="nc-modal-overlay" onClick={handleOverlayClick}>
        <div className="nc-modal-container nc-fade-in" style={{ maxWidth: '520px', padding: '3rem 2rem' }} onClick={e => e.stopPropagation()}>
          <button className="nc-modal-close" onClick={() => navigate('/cotacoes')} aria-label="Fechar">
            <X weight="bold" size={20} />
          </button>
          <div className="nc-sucesso nc-fade-in">
            <div className="nc-sucesso-badge">
              <CheckCircle weight="duotone" size={72} style={{ color: 'var(--success, #10b981)' }} />
            </div>
            <h2 className="nc-sucesso-title">{t('bidfrete.nova_cotacao.criado_sucesso')}</h2>
            <p className="nc-sucesso-desc">{t('bidfrete.nova_cotacao.criado_desc')}</p>
            <div className="nc-sucesso-actions">
              <button className="nc-btn nc-btn--secondary" onClick={() => navigate('/cotacoes')}>{t('bidfrete.nova_cotacao.ver_cotacoes')}</button>
              {cotacaoId && <button className="nc-btn nc-btn--primary" onClick={() => navigate(`/cotacoes/${cotacaoId}`)}>{t('bidfrete.nova_cotacao.ver_detalhes')}</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      navigate('/cotacoes')
    }
  }

  // ─── Render principal ──────────────────────────────────────────────────
  return (
    <div className="nc-modal-overlay" onClick={handleOverlayClick}>
      <div className="nc-modal-container nc-fade-in" onClick={e => e.stopPropagation()}>
        <button className="nc-modal-close" onClick={() => navigate('/cotacoes')} aria-label="Fechar">
          <X weight="bold" size={20} />
        </button>

        <div className="nc-subheader">
          <div className="nc-subheader-left">
            <span className="nc-subheader-step">Etapa {step} de 7</span>
            <span className="nc-subheader-separator">•</span>
            <span className="nc-subheader-name">{STEPS[step - 1].label}</span>
          </div>
        </div>

        <div className="nc-stepper-container">
          <StepperPassoPassoGlobal passos={STEPS} passoAtual={step} />
        </div>

        <div className="nc-modal-body">
          {/* Usar a chave no passo atual força a montagem do container disparando a animação .nc-fade-in */}
          <div className="nc-step-wrapper nc-fade-in" key={step}>
            {renderStep()}
          </div>
        </div>

        {/* Footer de navegação */}
        <div className="nc-footer">
          <button
            className="nc-btn nc-btn--secondary nc-btn--navigation"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
          >
            <ArrowLeft weight="bold" size={14} /> {t('comum.anterior')}
          </button>
          <div className="nc-footer-spacer" />
          {step < 7 ? (
            <button
              className="nc-btn nc-btn--primary nc-btn--navigation"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              {t('comum.proximo')} <ArrowRight weight="bold" size={14} />
            </button>
          ) : (
            <button
              className="nc-btn nc-btn--primary nc-btn--navigation nc-btn--cta"
              disabled={salvando}
              onClick={handleSubmit}
            >
              {salvando ? t('bidfrete.nova_cotacao.criando') : t('bidfrete.nova_cotacao.criar')} <Check weight="bold" size={14} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* ── Modal Layout ── */
        .nc-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 20, 0.7);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 2rem 1.5rem;
        }

        .nc-modal-container {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 920px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
          position: relative;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: nc-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 90vh;
        }

        @keyframes nc-modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .nc-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .nc-modal-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary, #f8fafc);
        }

        .nc-modal-body {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .nc-page {
          padding: 0.5rem 2rem 1.5rem;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 0;
          flex: 1;
        }

        /* ── Subheader ── */
        .nc-subheader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0;
          margin-bottom: 0.25rem;
        }

        .nc-subheader-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nc-subheader-step {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
        }

        .nc-subheader-separator {
          color: var(--border-subtle, rgba(255, 255, 255, 0.08));
          font-weight: bold;
        }

        .nc-subheader-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #f8fafc);
        }

        .nc-subheader-right {
          display: flex;
          align-items: center;
        }

        .nc-btn-cancelar {
          padding: 0.4rem 1rem;
          font-size: 0.8125rem;
          border-radius: 6px;
        }

        .nc-stepper-container {
          margin-bottom: 1.5rem;
          padding: 0;
        }

        /* Animação Suave entre Passos */
        @keyframes nc-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nc-fade-in {
          animation: nc-fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .nc-step-content {
          max-width: 840px;
          margin: 0 auto;
        }

        .nc-section-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
          margin-top: 2.5rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .nc-section-title:first-child { 
          margin-top: 0; 
        }

        /* ── Grids de Cards de Opções ── */
        .nc-options-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }
        .nc-options-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }

        /* Botão de Opção Enriquecido */
        .nc-option-btn {
          display: flex;
          align-items: flex-start;
          gap: 1.125rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.5));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: inherit;
          color: var(--text-secondary, #94a3b8);
          text-align: left;
          width: 100%;
        }
        .nc-option-btn:hover {
          border-color: rgba(99, 102, 241, 0.45);
          background: var(--bg-hover, rgba(255, 255, 255, 0.04));
          color: var(--text-primary, #f8fafc);
          transform: translateY(-2px);
        }
        .nc-option-btn--selected {
          border-color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.12);
          color: #fff;
          box-shadow: 0 0 0 1px var(--accent, #6366f1), 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .nc-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary, #94a3b8);
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .nc-option-btn:hover .nc-option-icon {
          color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.1);
        }
        .nc-option-btn--selected .nc-option-icon {
          background: var(--accent, #6366f1);
          color: #fff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }

        .nc-option-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-option-label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.45;
        }
        .nc-option-btn:hover .nc-option-desc {
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-btn--selected .nc-option-desc {
          color: rgba(255, 255, 255, 0.95);
        }

        /* ── Dica Vazia Modalidade ── */
        .nc-empty-hint {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.08);
          padding: 1.25rem 1.5rem;
          border-radius: 8px;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.875rem;
          grid-column: span 2;
        }

        /* ── Fields ── */
        .nc-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem 1.25rem;
        }
        .nc-fields-grid--cargo {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem 1.25rem;
        }

        .nc-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nc-field-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-secondary, #94a3b8);
        }

        .nc-input {
          padding: 0.625rem 0.875rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.4));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          color: var(--text-primary, #f8fafc);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          width: 100%;
        }
        .nc-input:focus {
          border-color: var(--accent, #6366f1);
          background: var(--bg-surface-raised, rgba(15, 23, 42, 0.65));
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .nc-input::placeholder { 
          color: var(--text-muted, #64748b); 
        }

        select.nc-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.875rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }

        /* Input Group com Sufixo */
        .nc-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nc-input--with-suffix {
          padding-right: 3rem;
        }
        .nc-input-suffix {
          position: absolute;
          right: 1rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
          pointer-events: none;
          text-transform: uppercase;
        }
        .nc-input:focus ~ .nc-input-suffix {
          color: var(--accent, #6366f1);
        }

        /* ── Origem e Destino Refinados ── */
        .nc-location-visual-card {
          background: var(--bg-base, rgba(15, 23, 42, 0.3));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
          border-radius: 12px;
          padding: 1.5rem 1.75rem;
          margin-top: 0.75rem;
        }
        .nc-location-visual-card--origin {
          border-left: 4px solid var(--accent, #6366f1);
        }
        .nc-location-visual-card--destination {
          border-left: 4px solid var(--success, #10b981);
        }

        .nc-location-visual-header {
          display: flex;
          align-items: center;
          gap: 1.125rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
          padding-bottom: 1rem;
        }

        .nc-location-visual-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
        }
        .nc-location-visual-card--origin .nc-location-visual-circle {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent, #6366f1);
        }
        .nc-location-visual-card--destination .nc-location-visual-circle {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success, #10b981);
        }

        .nc-location-visual-text h4 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-location-visual-text p {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          margin-top: 0.2rem;
        }

        @keyframes nc-pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes nc-pulse-dest {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .nc-pulsing-icon {
          border-radius: 50%;
          animation: nc-pulse 2s infinite;
        }
        .nc-pulsing-icon-dest {
          border-radius: 50%;
          animation: nc-pulse-dest 2s infinite;
        }

        .nc-fields-grid--location {
          grid-template-columns: 1.25fr 2fr 1.5fr;
          gap: 1.25rem;
        }
        @media(max-width: 600px) {
          .nc-fields-grid--location {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        /* ── Incoterms ── */
        .nc-incoterm-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
        }

        .nc-incoterm-btn {
          padding: 0.625rem 1.25rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.45));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 30px;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.8125rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nc-incoterm-btn:hover {
          border-color: rgba(99, 102, 241, 0.5);
          color: #fff;
          transform: scale(1.05);
        }
        .nc-incoterm-btn--selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent, #6366f1);
          color: var(--accent, #6366f1);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
        }

        /* UX Helper Card do Incoterm */
        .nc-incoterm-helper-card {
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          margin: 1.75rem 0;
        }
        .nc-helper-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--accent, #6366f1);
          margin-bottom: 0.75rem;
        }
        .nc-helper-header h4 {
          font-size: 0.9375rem;
          font-weight: 700;
        }
        .nc-helper-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.5;
        }
        .nc-helper-footer {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(99, 102, 241, 0.15);
          font-size: 0.8125rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        /* Visibilidade & Fornecedores */
        .nc-visibilidade-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.25rem;
        }

        .nc-vis-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
          background: var(--bg-base, rgba(15, 23, 42, 0.4));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          font-family: inherit;
        }
        .nc-vis-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: var(--bg-hover, rgba(99, 102, 241, 0.04));
          transform: translateY(-2px);
        }
        .nc-vis-card--selected {
          border-color: var(--accent, #6366f1);
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
        }

        .nc-vis-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary, #94a3b8);
          flex-shrink: 0;
        }
        .nc-vis-card--selected .nc-vis-icon-wrap {
          background: var(--accent, #6366f1);
          color: #fff;
        }

        .nc-vis-info {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-vis-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-vis-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.45;
        }

        /* Custom Alternator Switch Component */
        .nc-switch-row {
          background: var(--bg-base, rgba(15, 23, 42, 0.25));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
          padding: 1rem 1.5rem;
          border-radius: 10px;
          margin-top: 2rem;
        }
        .nc-switch-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          cursor: pointer;
          width: 100%;
        }

        .nc-switch-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nc-switch-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
        }
        .nc-switch-desc {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        .nc-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .nc-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .nc-switch-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .3s;
          border-radius: 34px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nc-switch-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-secondary, #94a3b8);
          transition: .3s;
          border-radius: 50%;
        }
        .nc-switch input:checked + .nc-switch-slider {
          background-color: var(--accent, #6366f1);
        }
        .nc-switch input:checked + .nc-switch-slider:before {
          transform: translateX(20px);
          background-color: #fff;
        }

        /* ── Resumo Final Premium (Recibo Digital) ── */
        .nc-fields-grid--summary-inputs {
          margin-bottom: 2rem;
          grid-template-columns: 2fr 1.25fr;
        }

        .nc-receipt-card {
          background: var(--bg-surface, rgba(15, 23, 42, 0.45));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
        }
        .nc-receipt-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent, #6366f1), var(--success, #10b981));
        }

        .nc-receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
        }
        .nc-receipt-badge {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent, #6366f1);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 30px;
          text-transform: uppercase;
        }
        .nc-receipt-modal {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
        }

        /* Timeline de Rota Comercial */
        .nc-route-timeline {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 1.75rem 0 2.5rem 0;
        }
        .nc-timeline-node {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .nc-node-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .nc-node-dot--origin {
          background: var(--accent, #6366f1);
          box-shadow: 0 0 8px var(--accent, #6366f1);
        }
        .nc-node-dot--destination {
          background: var(--success, #10b981);
          box-shadow: 0 0 8px var(--success, #10b981);
        }

        .nc-node-text {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .nc-node-code {
          font-size: 1.0625rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          font-family: 'DM Mono', monospace;
        }
        .nc-node-name {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }

        .nc-timeline-line {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100px;
          flex-shrink: 0;
        }
        .nc-timeline-line-fill {
          height: 2px;
          background: linear-gradient(90deg, var(--accent, #6366f1), var(--success, #10b981));
          width: 100%;
          border-radius: 2px;
        }
        .nc-timeline-icon-wrap {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface, #1e293b);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary, #94a3b8);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 500px) {
          .nc-route-timeline {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .nc-timeline-line {
            width: 2px;
            height: 40px;
            margin-left: 5px;
          }
          .nc-timeline-line-fill {
            width: 2px;
            height: 100%;
          }
        }

        /* Detalhes de Recibo */
        .nc-receipt-details {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .nc-receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .nc-receipt-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .nc-receipt-label {
          font-size: 0.875rem;
          color: var(--text-secondary-light, #cbd5e1);
        }
        .nc-receipt-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary, #f8fafc);
        }
        .nc-receipt-value.font-mono {
          font-family: 'DM Mono', monospace;
          color: var(--text-secondary, #94a3b8);
        }
        .nc-receipt-value--incoterm {
          color: var(--accent, #6366f1);
          font-family: 'DM Mono', monospace;
          background: rgba(99, 102, 241, 0.08);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        /* ── Footer de Navegação ── */
        .nc-footer {
          display: flex;
          align-items: center;
          padding: 2rem 0 0 0;
          gap: 1.25rem;
        }
        .nc-footer-spacer { 
          flex: 1; 
        }

        /* ── Botões Customizados Premium ── */
        .nc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 0.8rem 2rem;
          border-radius: 30px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          font-family: inherit;
        }
        .nc-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .nc-btn--primary {
          background: linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-hover, #4f46e5) 100%);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .nc-btn--primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--accent-hover, #4f46e5) 0%, #4338ca 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
        }
        .nc-btn--secondary {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .nc-btn--secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary, #f8fafc);
        }

        .nc-btn--navigation {
          min-width: 150px;
        }
        .nc-btn--cta {
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
        }

        /* ── Sucesso Premium ── */
        .nc-sucesso {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1.5rem;
          max-width: 520px;
          margin: 0 auto;
          text-align: center;
        }
        .nc-sucesso-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
          margin-bottom: 0.5rem;
        }
        .nc-sucesso-title {
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--text-primary, #f8fafc);
        }
        .nc-sucesso-desc {
          font-size: 0.9375rem;
          color: var(--text-secondary-light, #cbd5e1);
          line-height: 1.55;
        }
        .nc-sucesso-actions {
          display: flex;
          gap: 1.25rem;
          margin-top: 1.75rem;
        }
      `}</style>
    </div>
  )
}
