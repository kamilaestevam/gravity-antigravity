/**
 * NovaCotacao.tsx — Wizard de Nova Cotação (T7)
 * Redesenhado para UX 10/10 com visual premium, glassmorphism, micro-animações,
 * cards ricos em descrição, painel inteligente de Incoterms e resumo visual avançado.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  MagnifyingGlass,
} from '@phosphor-icons/react'

import { criarCotacao, getPaises, getPortos, getAeroportos, getContainers } from '../shared/api'
import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  Visibilidade,
  Pais,
  Porto,
  Aeroporto,
  ContainerOption,
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

// ─── UF Brasil ──────────────────────────────────────────────────────────────
const UFS_BRASIL = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

// ─── Autocomplete Helper ────────────────────────────────────────────────────
function useAutocomplete<T>(
  fetchFn: (q: string) => Promise<T[]>,
  delay = 300,
) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query || query.length < 2) { setOptions([]); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const data = await fetchFn(query)
        setOptions(data)
        setOpen(true)
      } catch { setOptions([]) }
      finally { setLoading(false) }
    }, delay)
    return () => clearTimeout(timerRef.current)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return { query, setQuery, options, open, setOpen, loading, wrapperRef }
}

// ─── Form State ──────────────────────────────────────────────────────────────
interface FormState {
  tipo_operacao_cotacao_bid_frete_internacional: TipoOperacao | ''
  modal_cotacao_bid_frete_internacional: ModalFrete | ''
  modalidade_cotacao_bid_frete_internacional: ModalidadeCarga | ''
  // Origem
  origem_pais_cotacao_bid_frete_internacional: string
  origem_pais_nome: string
  estado_provincia_origem_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  aeroporto_origem_cotacao_bid_frete_internacional: string
  aeroporto_origem_nome: string
  // Destino
  destino_pais_cotacao_bid_frete_internacional: string
  destino_pais_nome: string
  estado_provincia_destino_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  aeroporto_destino_cotacao_bid_frete_internacional: string
  aeroporto_destino_nome: string
  // Carga
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
  hs_code_cotacao_bid_frete_internacional: string
  quantidade_cotacao_bid_frete_internacional: number
  tipo_container_cotacao_bid_frete_internacional: string
  peso_kg_cotacao_bid_frete_internacional: string
  peso_ton_cotacao_bid_frete_internacional: string
  cubagem_m3_cotacao_bid_frete_internacional: string
  // Incoterm
  incoterm_cotacao_bid_frete_internacional: string
  cep_origem: string
  cep_destino: string
  prazo_resposta: string
  // Fornecedores
  visibilidade_cotacao_bid_frete_internacional: Visibilidade
  anonima: boolean
  // Resumo
  valor_alvo: string
  moeda_alvo: string
}

const INITIAL_FORM: FormState = {
  tipo_operacao_cotacao_bid_frete_internacional: '',
  modal_cotacao_bid_frete_internacional: '',
  modalidade_cotacao_bid_frete_internacional: '',
  origem_pais_cotacao_bid_frete_internacional: '',
  origem_pais_nome: '',
  estado_provincia_origem_cotacao_bid_frete_internacional: '',
  origem_codigo_cotacao_bid_frete_internacional: '',
  origem_nome_cotacao_bid_frete_internacional: '',
  aeroporto_origem_cotacao_bid_frete_internacional: '',
  aeroporto_origem_nome: '',
  destino_pais_cotacao_bid_frete_internacional: '',
  destino_pais_nome: '',
  estado_provincia_destino_cotacao_bid_frete_internacional: '',
  destino_codigo_cotacao_bid_frete_internacional: '',
  destino_nome_cotacao_bid_frete_internacional: '',
  aeroporto_destino_cotacao_bid_frete_internacional: '',
  aeroporto_destino_nome: '',
  descricao_mercadoria_cotacao_bid_frete_internacional: '',
  ncm_cotacao_bid_frete_internacional: '',
  hs_code_cotacao_bid_frete_internacional: '',
  quantidade_cotacao_bid_frete_internacional: 1,
  tipo_container_cotacao_bid_frete_internacional: '',
  peso_kg_cotacao_bid_frete_internacional: '',
  peso_ton_cotacao_bid_frete_internacional: '',
  cubagem_m3_cotacao_bid_frete_internacional: '',
  incoterm_cotacao_bid_frete_internacional: '',
  cep_origem: '',
  cep_destino: '',
  prazo_resposta: '',
  visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
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
    responsabilidade: 'Exclusivo para modal_cotacao_bid_frete_internacional marítimo/fluvial. Comprador contrata frete internacional.'
  },
  FOB: {
    title: 'FOB — Free On Board (Livre a Bordo)',
    desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
    responsabilidade: 'Exclusivo para modal_cotacao_bid_frete_internacional marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.'
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
      <div className="nc-option-checkbox">
        {selected && <span className="nc-option-checkmark">✓</span>}
      </div>
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
  const [containersList, setContainersList] = useState<ContainerOption[]>([])

  // Autocompletes
  const paisOrigem = useAutocomplete<Pais>((q) => getPaises(q))
  const paisDestino = useAutocomplete<Pais>((q) => getPaises(q))
  const portoOrigem = useAutocomplete<Porto>((q) => getPortos(q))
  const portoDestino = useAutocomplete<Porto>((q) => getPortos(q))
  const aeroportoOrigem = useAutocomplete<Aeroporto>((q) => getAeroportos(q, form.origem_pais_cotacao_bid_frete_internacional || undefined))
  const aeroportoDestino = useAutocomplete<Aeroporto>((q) => getAeroportos(q, form.destino_pais_cotacao_bid_frete_internacional || undefined))

  // Carregar containers ao montar
  useEffect(() => {
    getContainers().then(setContainersList).catch(() => {})
  }, [])

  const modal = form.modal_cotacao_bid_frete_internacional

  const stepStatus = (passoId: number): 'pendente' | 'ativo' | 'feito' => {
    if (passoId < step) return 'feito'
    if (passoId === step) return 'ativo'
    return 'pendente'
  }

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.tipo_operacao_cotacao_bid_frete_internacional && !!form.modal_cotacao_bid_frete_internacional && !!form.modalidade_cotacao_bid_frete_internacional
      case 2: {
        const temPais = !!form.origem_pais_cotacao_bid_frete_internacional
        if (modal === 'MARITIMO') return temPais && !!form.origem_codigo_cotacao_bid_frete_internacional
        if (modal === 'AEREO') return temPais && !!form.aeroporto_origem_cotacao_bid_frete_internacional
        return temPais // RODOVIARIO: só país
      }
      case 3: {
        const temPais = !!form.destino_pais_cotacao_bid_frete_internacional
        if (modal === 'MARITIMO') return temPais && !!form.destino_codigo_cotacao_bid_frete_internacional
        if (modal === 'AEREO') return temPais && !!form.aeroporto_destino_cotacao_bid_frete_internacional
        return temPais
      }
      case 4: return !!form.descricao_mercadoria_cotacao_bid_frete_internacional && form.quantidade_cotacao_bid_frete_internacional > 0
      case 5: return !!form.incoterm_cotacao_bid_frete_internacional
      case 6: return true
      case 7: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSalvando(true)
    try {
      const cotacao = await criarCotacao({
        tipo_operacao_cotacao_bid_frete_internacional: form.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao,
        modal_cotacao_bid_frete_internacional: form.modal_cotacao_bid_frete_internacional as ModalFrete,
        modalidade_cotacao_bid_frete_internacional: form.modalidade_cotacao_bid_frete_internacional as ModalidadeCarga,
        origem_codigo_cotacao_bid_frete_internacional: form.origem_codigo_cotacao_bid_frete_internacional,
        origem_nome_cotacao_bid_frete_internacional: form.origem_nome_cotacao_bid_frete_internacional || form.aeroporto_origem_nome,
        origem_pais_cotacao_bid_frete_internacional: form.origem_pais_cotacao_bid_frete_internacional,
        destino_codigo_cotacao_bid_frete_internacional: form.destino_codigo_cotacao_bid_frete_internacional,
        destino_nome_cotacao_bid_frete_internacional: form.destino_nome_cotacao_bid_frete_internacional || form.aeroporto_destino_nome,
        destino_pais_cotacao_bid_frete_internacional: form.destino_pais_cotacao_bid_frete_internacional,
        descricao_mercadoria_cotacao_bid_frete_internacional: form.descricao_mercadoria_cotacao_bid_frete_internacional,
        ncm_cotacao_bid_frete_internacional: form.ncm_cotacao_bid_frete_internacional || undefined,
        quantidade_cotacao_bid_frete_internacional: form.quantidade_cotacao_bid_frete_internacional,
        tipo_container_cotacao_bid_frete_internacional: form.tipo_container_cotacao_bid_frete_internacional || undefined,
        peso_kg_cotacao_bid_frete_internacional: form.peso_kg_cotacao_bid_frete_internacional ? parseFloat(form.peso_kg_cotacao_bid_frete_internacional) : undefined,
        cubagem_m3_cotacao_bid_frete_internacional: form.cubagem_m3_cotacao_bid_frete_internacional ? parseFloat(form.cubagem_m3_cotacao_bid_frete_internacional) : undefined,
        incoterm_cotacao_bid_frete_internacional: form.incoterm_cotacao_bid_frete_internacional,
        cep_destino: form.cep_destino || undefined,
        visibilidade_cotacao_bid_frete_internacional: form.visibilidade_cotacao_bid_frete_internacional,
        anonima: form.anonima,
        valor_alvo: form.valor_alvo ? parseFloat(form.valor_alvo) : undefined,
        moeda_alvo: form.moeda_alvo,
        prazo_resposta: form.prazo_resposta || undefined,
      } as any)
      setCotacaoId(cotacao.id)
      setSucesso(true)
    } catch (err) {
      console.error('Erro ao criar cotação:', err)
      alert('Erro ao criar cotação: ' + (err instanceof Error ? err.message : String(err)))
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
                  selected={form.tipo_operacao_cotacao_bid_frete_internacional === op}
                  onClick={() => {
                    set('tipo_operacao_cotacao_bid_frete_internacional', op)
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
                selected={form.modal_cotacao_bid_frete_internacional === 'MARITIMO'}
                onClick={() => {
                  set('modal_cotacao_bid_frete_internacional', 'MARITIMO')
                  set('modalidade_cotacao_bid_frete_internacional', '') // reseta para forçar escolha limpa
                }}
                icon={<Anchor weight="duotone" size={28} />}
                label="Marítimo"
                description={MODAL_DESCS.MARITIMO}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'AEREO'}
                onClick={() => {
                  set('modal_cotacao_bid_frete_internacional', 'AEREO')
                  set('modalidade_cotacao_bid_frete_internacional', '')
                }}
                icon={<AirplaneTilt weight="duotone" size={28} />}
                label="Aéreo"
                description={MODAL_DESCS.AEREO}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO'}
                onClick={() => {
                  set('modal_cotacao_bid_frete_internacional', 'RODOVIARIO')
                  set('modalidade_cotacao_bid_frete_internacional', '')
                }}
                icon={<Van weight="duotone" size={28} />}
                label="Rodoviário"
                description={MODAL_DESCS.RODOVIARIO}
              />
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modalidade')}</h3>
            <div className="nc-options-grid-2">
              {form.modal_cotacao_bid_frete_internacional === 'MARITIMO' && (
                <>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'FCL'} onClick={() => set('modalidade_cotacao_bid_frete_internacional', 'FCL')} icon={<Package weight="duotone" size={22} />} label="FCL — Container Completo" description={MODALIDADE_DESCS.FCL} />
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'LCL'} onClick={() => set('modalidade_cotacao_bid_frete_internacional', 'LCL')} icon={<Package weight="duotone" size={22} />} label="LCL — Carga Fracionada" description={MODALIDADE_DESCS.LCL} />
                </>
              )}
              {form.modal_cotacao_bid_frete_internacional === 'AEREO' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'AEREO_GERAL'} onClick={() => set('modalidade_cotacao_bid_frete_internacional', 'AEREO_GERAL')} icon={<AirplaneTilt weight="duotone" size={22} />} label="Aéreo Geral" description={MODALIDADE_DESCS.AEREO_GERAL} />
                </div>
              )}
              {form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO' && (
                <>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_FTL'} onClick={() => set('modalidade_cotacao_bid_frete_internacional', 'RODOVIARIO_FTL')} icon={<Van weight="duotone" size={22} />} label="FTL — Carga Completa" description={MODALIDADE_DESCS.RODOVIARIO_FTL} />
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_LTL'} onClick={() => set('modalidade_cotacao_bid_frete_internacional', 'RODOVIARIO_LTL')} icon={<Van weight="duotone" size={22} />} label="LTL — Carga Fracionada" description={MODALIDADE_DESCS.RODOVIARIO_LTL} />
                </>
              )}
              {!form.modal_cotacao_bid_frete_internacional && (
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
                  <h4>{modal === 'AEREO' ? 'Aeroporto de Origem' : modal === 'RODOVIARIO' ? 'Local de Origem' : t('bidfrete.nova_cotacao.porto_origem')}</h4>
                  <p>{modal === 'AEREO' ? 'Selecione o país e o aeroporto de partida.' : modal === 'RODOVIARIO' ? 'Selecione o país e estado/província de coleta.' : 'Selecione o país e o porto de embarque.'}</p>
                </div>
              </div>

              <div className="nc-fields-grid nc-fields-grid--location-new">
                {/* País Origem — Autocomplete */}
                <Field label="PAÍS" required>
                  <div className="nc-autocomplete" ref={paisOrigem.wrapperRef}>
                    <div className="nc-input-icon-wrap">
                      <MagnifyingGlass size={14} className="nc-input-search-icon" />
                      <input
                        className="nc-input nc-input--search"
                        placeholder="Buscar país..."
                        value={form.origem_pais_nome || paisOrigem.query}
                        onChange={e => { paisOrigem.setQuery(e.target.value); set('origem_pais_cotacao_bid_frete_internacional', ''); set('origem_pais_nome', '') }}
                        onFocus={() => { if (paisOrigem.options.length > 0) paisOrigem.setOpen(true) }}
                      />
                    </div>
                    {paisOrigem.open && paisOrigem.options.length > 0 && (
                      <ul className="nc-autocomplete-list">
                        {paisOrigem.options.map(p => (
                          <li key={p.codigo_pais_iso_alpha2} className="nc-autocomplete-item" onClick={() => {
                            set('origem_pais_cotacao_bid_frete_internacional', p.codigo_pais_iso_alpha2)
                            set('origem_pais_nome', `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`)
                            paisOrigem.setQuery('')
                            paisOrigem.setOpen(false)
                          }}>
                            <span className="nc-ac-code">{p.codigo_pais_iso_alpha2}</span>
                            <span className="nc-ac-name">{p.nome_pais_portugues}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>

                {/* Estado/Província */}
                <Field label="ESTADO / PROVÍNCIA">
                  {form.origem_pais_cotacao_bid_frete_internacional === 'BR' ? (
                    <select className="nc-input" value={form.estado_provincia_origem_cotacao_bid_frete_internacional} onChange={e => set('estado_provincia_origem_cotacao_bid_frete_internacional', e.target.value)}>
                      <option value="">Selecione o UF</option>
                      {UFS_BRASIL.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  ) : (
                    <input className="nc-input" placeholder="Ex: Guangdong" value={form.estado_provincia_origem_cotacao_bid_frete_internacional} onChange={e => set('estado_provincia_origem_cotacao_bid_frete_internacional', e.target.value)} />
                  )}
                </Field>

                {/* Porto — só MARITIMO */}
                {modal === 'MARITIMO' && (
                  <Field label="PORTO DE EMBARQUE" required>
                    <div className="nc-autocomplete" ref={portoOrigem.wrapperRef}>
                      <div className="nc-input-icon-wrap">
                        <Anchor size={14} className="nc-input-search-icon" />
                        <input
                          className="nc-input nc-input--search"
                          placeholder="Buscar porto..."
                          value={form.origem_nome_cotacao_bid_frete_internacional || portoOrigem.query}
                          onChange={e => { portoOrigem.setQuery(e.target.value); set('origem_codigo_cotacao_bid_frete_internacional', ''); set('origem_nome_cotacao_bid_frete_internacional', '') }}
                          onFocus={() => { if (portoOrigem.options.length > 0) portoOrigem.setOpen(true) }}
                        />
                      </div>
                      {portoOrigem.open && portoOrigem.options.length > 0 && (
                        <ul className="nc-autocomplete-list">
                          {portoOrigem.options.map(p => (
                            <li key={p.codigo} className="nc-autocomplete-item" onClick={() => {
                              set('origem_codigo_cotacao_bid_frete_internacional', p.codigo)
                              set('origem_nome_cotacao_bid_frete_internacional', `${p.nome} (${p.codigo})`)
                              portoOrigem.setQuery('')
                              portoOrigem.setOpen(false)
                            }}>
                              <span className="nc-ac-code">{p.codigo}</span>
                              <span className="nc-ac-name">{p.nome}</span>
                              <span className="nc-ac-pais">{p.pais}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                )}

                {/* Aeroporto — só AEREO */}
                {modal === 'AEREO' && (
                  <Field label="AEROPORTO DE EMBARQUE" required>
                    <div className="nc-autocomplete" ref={aeroportoOrigem.wrapperRef}>
                      <div className="nc-input-icon-wrap">
                        <AirplaneTilt size={14} className="nc-input-search-icon" />
                        <input
                          className="nc-input nc-input--search"
                          placeholder="Buscar aeroporto..."
                          value={form.aeroporto_origem_nome || aeroportoOrigem.query}
                          onChange={e => { aeroportoOrigem.setQuery(e.target.value); set('aeroporto_origem_cotacao_bid_frete_internacional', ''); set('aeroporto_origem_nome', '') }}
                          onFocus={() => { if (aeroportoOrigem.options.length > 0) aeroportoOrigem.setOpen(true) }}
                        />
                      </div>
                      {aeroportoOrigem.open && aeroportoOrigem.options.length > 0 && (
                        <ul className="nc-autocomplete-list">
                          {aeroportoOrigem.options.map(a => (
                            <li key={a.id_aeroporto} className="nc-autocomplete-item" onClick={() => {
                              set('aeroporto_origem_cotacao_bid_frete_internacional', a.codigo_iata_aeroporto)
                              set('aeroporto_origem_nome', `${a.nome_aeroporto} (${a.codigo_iata_aeroporto})`)
                              aeroportoOrigem.setQuery('')
                              aeroportoOrigem.setOpen(false)
                            }}>
                              <span className="nc-ac-code">{a.codigo_iata_aeroporto}</span>
                              <span className="nc-ac-name">{a.nome_aeroporto}</span>
                              <span className="nc-ac-pais">{a.codigo_pais_aeroporto}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                )}
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
                  <h4>{modal === 'AEREO' ? 'Aeroporto de Destino' : modal === 'RODOVIARIO' ? 'Local de Destino' : t('bidfrete.nova_cotacao.porto_destino')}</h4>
                  <p>{modal === 'AEREO' ? 'Selecione o país e o aeroporto de chegada.' : modal === 'RODOVIARIO' ? 'Selecione o país e estado/província de entrega.' : 'Selecione o país e o porto de destino.'}</p>
                </div>
              </div>

              <div className="nc-fields-grid nc-fields-grid--location-new">
                {/* País Destino — Autocomplete */}
                <Field label="PAÍS" required>
                  <div className="nc-autocomplete" ref={paisDestino.wrapperRef}>
                    <div className="nc-input-icon-wrap">
                      <MagnifyingGlass size={14} className="nc-input-search-icon" />
                      <input
                        className="nc-input nc-input--search"
                        placeholder="Buscar país..."
                        value={form.destino_pais_nome || paisDestino.query}
                        onChange={e => { paisDestino.setQuery(e.target.value); set('destino_pais_cotacao_bid_frete_internacional', ''); set('destino_pais_nome', '') }}
                        onFocus={() => { if (paisDestino.options.length > 0) paisDestino.setOpen(true) }}
                      />
                    </div>
                    {paisDestino.open && paisDestino.options.length > 0 && (
                      <ul className="nc-autocomplete-list">
                        {paisDestino.options.map(p => (
                          <li key={p.codigo_pais_iso_alpha2} className="nc-autocomplete-item" onClick={() => {
                            set('destino_pais_cotacao_bid_frete_internacional', p.codigo_pais_iso_alpha2)
                            set('destino_pais_nome', `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`)
                            paisDestino.setQuery('')
                            paisDestino.setOpen(false)
                          }}>
                            <span className="nc-ac-code">{p.codigo_pais_iso_alpha2}</span>
                            <span className="nc-ac-name">{p.nome_pais_portugues}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>

                {/* Estado/Província */}
                <Field label="ESTADO / PROVÍNCIA">
                  {form.destino_pais_cotacao_bid_frete_internacional === 'BR' ? (
                    <select className="nc-input" value={form.estado_provincia_destino_cotacao_bid_frete_internacional} onChange={e => set('estado_provincia_destino_cotacao_bid_frete_internacional', e.target.value)}>
                      <option value="">Selecione o UF</option>
                      {UFS_BRASIL.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  ) : (
                    <input className="nc-input" placeholder="Ex: California" value={form.estado_provincia_destino_cotacao_bid_frete_internacional} onChange={e => set('estado_provincia_destino_cotacao_bid_frete_internacional', e.target.value)} />
                  )}
                </Field>

                {/* Porto — só MARITIMO */}
                {modal === 'MARITIMO' && (
                  <Field label="PORTO DE DESTINO" required>
                    <div className="nc-autocomplete" ref={portoDestino.wrapperRef}>
                      <div className="nc-input-icon-wrap">
                        <Anchor size={14} className="nc-input-search-icon" />
                        <input
                          className="nc-input nc-input--search"
                          placeholder="Buscar porto..."
                          value={form.destino_nome_cotacao_bid_frete_internacional || portoDestino.query}
                          onChange={e => { portoDestino.setQuery(e.target.value); set('destino_codigo_cotacao_bid_frete_internacional', ''); set('destino_nome_cotacao_bid_frete_internacional', '') }}
                          onFocus={() => { if (portoDestino.options.length > 0) portoDestino.setOpen(true) }}
                        />
                      </div>
                      {portoDestino.open && portoDestino.options.length > 0 && (
                        <ul className="nc-autocomplete-list">
                          {portoDestino.options.map(p => (
                            <li key={p.codigo} className="nc-autocomplete-item" onClick={() => {
                              set('destino_codigo_cotacao_bid_frete_internacional', p.codigo)
                              set('destino_nome_cotacao_bid_frete_internacional', `${p.nome} (${p.codigo})`)
                              portoDestino.setQuery('')
                              portoDestino.setOpen(false)
                            }}>
                              <span className="nc-ac-code">{p.codigo}</span>
                              <span className="nc-ac-name">{p.nome}</span>
                              <span className="nc-ac-pais">{p.pais}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                )}

                {/* Aeroporto — só AEREO */}
                {modal === 'AEREO' && (
                  <Field label="AEROPORTO DE DESTINO" required>
                    <div className="nc-autocomplete" ref={aeroportoDestino.wrapperRef}>
                      <div className="nc-input-icon-wrap">
                        <AirplaneTilt size={14} className="nc-input-search-icon" />
                        <input
                          className="nc-input nc-input--search"
                          placeholder="Buscar aeroporto..."
                          value={form.aeroporto_destino_nome || aeroportoDestino.query}
                          onChange={e => { aeroportoDestino.setQuery(e.target.value); set('aeroporto_destino_cotacao_bid_frete_internacional', ''); set('aeroporto_destino_nome', '') }}
                          onFocus={() => { if (aeroportoDestino.options.length > 0) aeroportoDestino.setOpen(true) }}
                        />
                      </div>
                      {aeroportoDestino.open && aeroportoDestino.options.length > 0 && (
                        <ul className="nc-autocomplete-list">
                          {aeroportoDestino.options.map(a => (
                            <li key={a.id_aeroporto} className="nc-autocomplete-item" onClick={() => {
                              set('aeroporto_destino_cotacao_bid_frete_internacional', a.codigo_iata_aeroporto)
                              set('aeroporto_destino_nome', `${a.nome_aeroporto} (${a.codigo_iata_aeroporto})`)
                              aeroportoDestino.setQuery('')
                              aeroportoDestino.setOpen(false)
                            }}>
                              <span className="nc-ac-code">{a.codigo_iata_aeroporto}</span>
                              <span className="nc-ac-name">{a.nome_aeroporto}</span>
                              <span className="nc-ac-pais">{a.codigo_pais_aeroporto}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Field>
                )}
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
                  <input className="nc-input" placeholder="Ex: Peças automotivas, eletrônicos industriais..." value={form.descricao_mercadoria_cotacao_bid_frete_internacional} onChange={e => set('descricao_mercadoria_cotacao_bid_frete_internacional', e.target.value)} />
                </Field>
              </div>
              <Field label="NCM">
                <input className="nc-input" placeholder="Ex: 87089990" value={form.ncm_cotacao_bid_frete_internacional} onChange={e => set('ncm_cotacao_bid_frete_internacional', e.target.value.replace(/\D/g, '').slice(0, 8))} />
              </Field>
              <Field label="HS CODE">
                <input className="nc-input" placeholder="Ex: 8708.99" value={form.hs_code_cotacao_bid_frete_internacional} onChange={e => set('hs_code_cotacao_bid_frete_internacional', e.target.value.slice(0, 10))} />
              </Field>

              <Field label={t('bidfrete.nova_cotacao.quantidade')} required>
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" min={1} value={form.quantidade_cotacao_bid_frete_internacional} onChange={e => set('quantidade_cotacao_bid_frete_internacional', parseInt(e.target.value) || 1)} />
                  <span className="nc-input-suffix">un</span>
                </div>
              </Field>

              {modal === 'MARITIMO' && (
                <Field label="TIPO CONTAINER">
                  <select className="nc-input" value={form.tipo_container_cotacao_bid_frete_internacional} onChange={e => set('tipo_container_cotacao_bid_frete_internacional', e.target.value)}>
                    <option value="">Selecione</option>
                    {containersList.map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.nome} ({c.teus} TEU)</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="PESO (KG)">
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 12000" value={form.peso_kg_cotacao_bid_frete_internacional} onChange={e => {
                    const val = e.target.value
                    set('peso_kg_cotacao_bid_frete_internacional', val)
                    if (val) set('peso_ton_cotacao_bid_frete_internacional', (parseFloat(val) / 1000).toFixed(3))
                    else set('peso_ton_cotacao_bid_frete_internacional', '')
                  }} />
                  <span className="nc-input-suffix">Kg</span>
                </div>
              </Field>

              <Field label="PESO (TON)">
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 12.0" value={form.peso_ton_cotacao_bid_frete_internacional} onChange={e => {
                    const val = e.target.value
                    set('peso_ton_cotacao_bid_frete_internacional', val)
                    if (val) set('peso_kg_cotacao_bid_frete_internacional', (parseFloat(val) * 1000).toFixed(0))
                    else set('peso_kg_cotacao_bid_frete_internacional', '')
                  }} />
                  <span className="nc-input-suffix">TON</span>
                </div>
              </Field>

              <Field label="CUBAGEM (M³)">
                <div className="nc-input-group">
                  <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 33.2" value={form.cubagem_m3_cotacao_bid_frete_internacional} onChange={e => set('cubagem_m3_cotacao_bid_frete_internacional', e.target.value)} />
                  <span className="nc-input-suffix">m³</span>
                </div>
              </Field>
            </div>
          </div>
        )

      // STEP 5 — Incoterm
      case 5: {
        const explanation = form.incoterm_cotacao_bid_frete_internacional ? INCOTERM_EXPLANATIONS[form.incoterm_cotacao_bid_frete_internacional] : null

        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.incoterm')}</h3>
            <div className="nc-incoterm-grid">
              {INCOTERMS.map(inc => (
                <button
                  key={inc}
                  type="button"
                  className={`nc-incoterm-btn ${form.incoterm_cotacao_bid_frete_internacional === inc ? 'nc-incoterm-btn--selected' : ''}`}
                  onClick={() => set('incoterm_cotacao_bid_frete_internacional', inc)}
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

            <div className="nc-fields-grid" style={{ marginTop: '1.5rem' }}>
              <Field label="CEP ORIGEM">
                <input className="nc-input" placeholder="Ex: 01310-100" value={form.cep_origem} onChange={e => set('cep_origem', e.target.value)} />
              </Field>
              <Field label="CEP DESTINO">
                <input className="nc-input" placeholder="Ex: 90000-000" value={form.cep_destino} onChange={e => set('cep_destino', e.target.value)} />
              </Field>
            </div>

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
            
            <div className="nc-visibilidade_cotacao_bid_frete_internacional-grid">
              <button
                type="button"
                className={`nc-vis-card ${form.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA' ? 'nc-vis-card--selected' : ''}`}
                onClick={() => set('visibilidade_cotacao_bid_frete_internacional', 'DIRECIONADA')}
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
                className={`nc-vis-card ${form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA' ? 'nc-vis-card--selected' : ''}`}
                onClick={() => set('visibilidade_cotacao_bid_frete_internacional', 'ABERTA')}
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
      case 7: {
        const origemCode = modal === 'AEREO' ? form.aeroporto_origem_cotacao_bid_frete_internacional : form.origem_codigo_cotacao_bid_frete_internacional
        const origemName = modal === 'AEREO' ? form.aeroporto_origem_nome : (modal === 'RODOVIARIO' ? (form.estado_provincia_origem_cotacao_bid_frete_internacional || form.origem_pais_nome) : form.origem_nome_cotacao_bid_frete_internacional)
        const destinoCode = modal === 'AEREO' ? form.aeroporto_destino_cotacao_bid_frete_internacional : form.destino_codigo_cotacao_bid_frete_internacional
        const destinoName = modal === 'AEREO' ? form.aeroporto_destino_nome : (modal === 'RODOVIARIO' ? (form.estado_provincia_destino_cotacao_bid_frete_internacional || form.destino_pais_nome) : form.destino_nome_cotacao_bid_frete_internacional)

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
                <span className="nc-receipt-badge">{form.tipo_operacao_cotacao_bid_frete_internacional ? OPERACAO_LABELS[form.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao] : '—'}</span>
                <span className="nc-receipt-modal">
                  {form.modal_cotacao_bid_frete_internacional ? MODAL_LABELS[form.modal_cotacao_bid_frete_internacional as ModalFrete] : '—'} / {form.modalidade_cotacao_bid_frete_internacional ? MODALIDADE_LABELS[form.modalidade_cotacao_bid_frete_internacional as ModalidadeCarga] : '—'}
                </span>
              </div>

              {/* Linha do tempo da rota visual */}
              <div className="nc-route-timeline">
                <div className="nc-timeline-node">
                  <div className="nc-node-dot nc-node-dot--origin"></div>
                  <div className="nc-node-text">
                    <span className="nc-node-code">{origemCode || form.origem_pais_cotacao_bid_frete_internacional || '—'}</span>
                    <span className="nc-node-name">{origemName || '—'}{form.origem_pais_nome && !origemName?.includes(form.origem_pais_cotacao_bid_frete_internacional) ? `, ${form.origem_pais_cotacao_bid_frete_internacional}` : ''}</span>
                  </div>
                </div>

                <div className="nc-timeline-line">
                  <div className="nc-timeline-icon-wrap">
                    {modal === 'MARITIMO' && <Anchor weight="duotone" size={16} />}
                    {modal === 'AEREO' && <AirplaneTilt weight="duotone" size={16} />}
                    {modal === 'RODOVIARIO' && <Van weight="duotone" size={16} />}
                    {!modal && <Truck weight="duotone" size={16} />}
                  </div>
                  <div className="nc-timeline-line-fill"></div>
                </div>

                <div className="nc-timeline-node">
                  <div className="nc-node-dot nc-node-dot--destination"></div>
                  <div className="nc-node-text">
                    <span className="nc-node-code">{destinoCode || form.destino_pais_cotacao_bid_frete_internacional || '—'}</span>
                    <span className="nc-node-name">{destinoName || '—'}{form.destino_pais_nome && !destinoName?.includes(form.destino_pais_cotacao_bid_frete_internacional) ? `, ${form.destino_pais_cotacao_bid_frete_internacional}` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="nc-receipt-details">
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_mercadoria')}</span>
                  <span className="nc-receipt-value">{form.descricao_mercadoria_cotacao_bid_frete_internacional || '—'}</span>
                </div>
                {form.ncm_cotacao_bid_frete_internacional && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">NCM</span>
                    <span className="nc-receipt-value font-mono">{form.ncm_cotacao_bid_frete_internacional}</span>
                  </div>
                )}
                {form.hs_code_cotacao_bid_frete_internacional && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">HS Code</span>
                    <span className="nc-receipt-value font-mono">{form.hs_code_cotacao_bid_frete_internacional}</span>
                  </div>
                )}
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_qtd_peso')}</span>
                  <span className="nc-receipt-value">
                    {form.quantidade_cotacao_bid_frete_internacional} un {form.peso_kg_cotacao_bid_frete_internacional ? `| ${form.peso_kg_cotacao_bid_frete_internacional} Kg` : ''} {form.peso_ton_cotacao_bid_frete_internacional ? `(${form.peso_ton_cotacao_bid_frete_internacional} TON)` : ''} {form.cubagem_m3_cotacao_bid_frete_internacional ? `| ${form.cubagem_m3_cotacao_bid_frete_internacional} m³` : ''}
                  </span>
                </div>
                {form.tipo_container_cotacao_bid_frete_internacional && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">Container</span>
                    <span className="nc-receipt-value">{containersList.find(c => c.codigo === form.tipo_container_cotacao_bid_frete_internacional)?.nome || form.tipo_container_cotacao_bid_frete_internacional}</span>
                  </div>
                )}
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_incoterm')}</span>
                  <span className="nc-receipt-value nc-receipt-value--incoterm">{form.incoterm_cotacao_bid_frete_internacional || '—'}</span>
                </div>
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_visibilidade')}</span>
                  <span className="nc-receipt-value">
                    {form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA' ? 'Aberta' : 'Direcionada'}{form.anonima ? ' (Anônima)' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // ─── Sucesso ──────────────────────────────────────────────────────────
  if (sucesso) {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        navigate('/produto/bid-frete/cotacoes')
      }
    }
    return (
      <div className="nc-modal_cotacao_bid_frete_internacional-overlay" onClick={handleOverlayClick}>
        <div className="nc-modal_cotacao_bid_frete_internacional-container nc-fade-in" style={{ maxWidth: '520px', padding: '3rem 2rem' }} onClick={e => e.stopPropagation()}>
          <button className="nc-modal_cotacao_bid_frete_internacional-close" onClick={() => navigate('/produto/bid-frete/cotacoes')} aria-label="Fechar">
            <X weight="bold" size={20} />
          </button>
          <div className="nc-sucesso nc-fade-in">
            <div className="nc-sucesso-badge">
              <CheckCircle weight="duotone" size={72} style={{ color: 'var(--success, #10b981)' }} />
            </div>
            <h2 className="nc-sucesso-title">{t('bidfrete.nova_cotacao.criado_sucesso')}</h2>
            <p className="nc-sucesso-desc">{t('bidfrete.nova_cotacao.criado_desc')}</p>
            <div className="nc-sucesso-actions">
              <button className="nc-btn nc-btn--secondary" onClick={() => navigate('/produto/bid-frete/cotacoes')}>{t('bidfrete.nova_cotacao.ver_cotacoes')}</button>
              {cotacaoId && <button className="nc-btn nc-btn--primary" onClick={() => navigate(`/produto/bid-frete/cotacoes/${cotacaoId}`)}>{t('bidfrete.nova_cotacao.ver_detalhes')}</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      navigate('/produto/bid-frete/cotacoes')
    }
  }

  // ─── Render principal ──────────────────────────────────────────────────
  return (
    <div className="nc-modal_cotacao_bid_frete_internacional-overlay" onClick={handleOverlayClick}>
      <div className="nc-modal_cotacao_bid_frete_internacional-container nc-fade-in" onClick={e => e.stopPropagation()}>
        
        {/* Header do Modal — Alinhado com a Imagem 02 */}
        <div className="nc-modal_cotacao_bid_frete_internacional-header">
          <div className="nc-modal_cotacao_bid_frete_internacional-header-left">
            <div className="nc-modal_cotacao_bid_frete_internacional-header-icon-wrap">
              <Truck weight="duotone" size={22} />
            </div>
            <div>
              <h2 className="nc-modal_cotacao_bid_frete_internacional-title">Nova Cotação</h2>
              <p className="nc-modal_cotacao_bid_frete_internacional-subtitle">Preencha as informações para buscar as melhores opções de frete</p>
            </div>
          </div>
          <div className="nc-modal_cotacao_bid_frete_internacional-header-step-badge">
            Etapa {step} de 7 • <span className="nc-modal_cotacao_bid_frete_internacional-header-step-name">{STEPS[step - 1].label}</span>
          </div>
          <button className="nc-modal_cotacao_bid_frete_internacional-close" onClick={() => navigate('/produto/bid-frete/cotacoes')} aria-label="Fechar">
            <X weight="bold" size={20} />
          </button>
        </div>

        {/* Linha do Stepper com customizações visuais intensas da Imagem 02 */}
        <div className="nc-stepper-container">
          <div className="mpg-stepper" role="list" aria-label="Passos">
            {STEPS.map((passo, idx) => {
              const status = stepStatus(passo.id)
              const isClickable = status === 'feito'

              return (
                <React.Fragment key={passo.id}>
                  <div
                    className={`mpg-passo ${isClickable ? 'mpg-passo-feito' : ''}`}
                    role="listitem"
                    aria-current={status === 'ativo' ? 'step' : undefined}
                    onClick={isClickable ? () => setStep(passo.id) : undefined}
                    title={isClickable ? `Voltar para: ${passo.label}` : undefined}
                    style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  >
                    <div className="mpg-circulo-wrap">
                      <div
                        className={`mpg-circulo ${
                          status === 'ativo' ? 'mpg-circulo-ativo' :
                          status === 'feito' ? 'mpg-circulo-feito' : 'mpg-circulo-pendente'
                        }`}
                      >
                        {status === 'feito' ? (
                          <span className="mpg-check-icon"><Check size={14} weight="bold" /></span>
                        ) : (
                          passo.icone ?? passo.id
                        )}
                      </div>
                      {/* Orbita 3D Gravity — apenas no passo ativo */}
                      {status === 'ativo' && (
                        <>
                          <div className="mpg-orbita-3d" aria-hidden="true">
                            <div className="mpg-orbita-ring mpg-orbita-ring--1">
                              <div className="mpg-orbita-anel" />
                              <div className="mpg-orbita-eletron mpg-orbita-eletron--1" />
                            </div>
                            <div className="mpg-orbita-ring mpg-orbita-ring--2">
                              <div className="mpg-orbita-anel" />
                              <div className="mpg-orbita-eletron mpg-orbita-eletron--2" />
                            </div>
                          </div>
                          {/* Glow atras do circulo */}
                          <div className="mpg-nucleo-glow" aria-hidden="true" />
                        </>
                      )}
                    </div>
                    <span className={`mpg-label ${
                      status === 'ativo' ? 'mpg-label-ativo' :
                      status === 'feito' ? 'mpg-label-feito' : ''
                    }`}>
                      {passo.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="mpg-conector" aria-hidden="true">
                      <div
                        className="mpg-conector-fill"
                        style={{ width: status === 'feito' ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Corpo do modal_cotacao_bid_frete_internacional com scroll individual */}
        <div className="nc-modal_cotacao_bid_frete_internacional-body">
          {/* Usar a chave no passo atual força a montagem do container disparando a animação .nc-fade-in */}
          <div className="nc-step-wrapper nc-fade-in" key={step}>
            {renderStep()}
          </div>
        </div>

        {/* Footer do Modal — Separador por borda + Botão "Cancelar" na esquerda na etapa 1 */}
        <div className="nc-footer">
          {step === 1 ? (
            <button
              type="button"
              className="nc-btn nc-btn--secondary nc-btn-cancelar"
              onClick={() => navigate('/produto/bid-frete/cotacoes')}
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              className="nc-btn nc-btn--secondary nc-btn--navigation"
              onClick={() => setStep(s => s - 1)}
            >
              <ArrowLeft weight="bold" size={14} /> {t('comum.anterior')}
            </button>
          )}
          
          <div className="nc-footer-spacer" />
          
          {step < 7 ? (
            <button
              type="button"
              className="nc-btn nc-btn--primary nc-btn--navigation"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              {t('comum.proximo')} <ArrowRight weight="bold" size={14} />
            </button>
          ) : (
            <button
              type="button"
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
        .nc-modal_cotacao_bid_frete_internacional-overlay {
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

        .nc-modal_cotacao_bid_frete_internacional-container {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 16px;
          width: 100%;
          max-width: 920px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
          position: relative;
          padding: 0; /* Full-bleed layout para cabeçalho e rodapé */
          display: flex;
          flex-direction: column;
          gap: 0; /* Remove gap genérico */
          animation: nc-modal_cotacao_bid_frete_internacional-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 90vh;
          overflow: hidden; /* Mantém as bordas arredondadas nos cantos */
        }

        /* ── Cabeçalho do Modal — Inspirado na Imagem 02 ── */
        .nc-modal_cotacao_bid_frete_internacional-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(10, 15, 30, 0.45);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
        }

        .nc-modal_cotacao_bid_frete_internacional-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nc-modal_cotacao_bid_frete_internacional-header-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(124, 58, 237, 0.25) 50%, rgba(99, 102, 241, 0.25) 100%);
          border: 1px solid rgba(99, 102, 241, 0.45);
          color: #a5b4fc;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
        }

        .nc-modal_cotacao_bid_frete_internacional-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .nc-modal_cotacao_bid_frete_internacional-subtitle {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0.15rem 0 0 0;
          font-weight: 400;
        }

        .nc-modal_cotacao_bid_frete_internacional-header-step-badge {
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem 0.875rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          margin-right: 2rem; /* Espaço para o X close */
        }

        .nc-modal_cotacao_bid_frete_internacional-header-step-name {
          color: #a5b4fc;
        }

        .nc-modal_cotacao_bid_frete_internacional-close {
          position: absolute;
          top: 50%;
          right: 1.5rem;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .nc-modal_cotacao_bid_frete_internacional-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .nc-stepper-container {
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 15, 30, 0.25);
        }

        /* Stepper markup aligned with ModalPassoPassoGlobal */
        .mpg-stepper {
          display: flex;
          align-items: flex-start;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .mpg-stepper::-webkit-scrollbar {
          display: none;
        }

        .mpg-passo {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .mpg-circulo-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
        }

        .mpg-circulo {
          position: relative;
          z-index: 3;
          width: 2.75rem;
          height: 2.75rem;
          min-width: 2.75rem;
          flex-shrink: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted, #64748b);
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Active Circle styling with exact linear-gradient and box-shadow */
        .mpg-circulo-ativo {
          background: linear-gradient(135deg, #c084fc 0%, #7c3aed 50%, #2563eb 100%) !important;
          border: 1.5px solid rgba(192, 132, 252, 0.6) !important;
          color: #fff !important;
          font-size: 1rem !important;
          font-weight: 800 !important;
          box-shadow: 0 0 10px rgba(192, 132, 252, 0.5), 0 0 25px rgba(124, 58, 237, 0.35), 0 0 50px rgba(37, 99, 235, 0.2), inset 0 0 12px rgba(255, 255, 255, 0.2) !important;
          animation: mpg-neon-pulse 2s ease-in-out infinite;
        }

        /* Completed Circle styling with exact success gradient and box-shadow */
        .mpg-circulo-feito {
          background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80) !important;
          border: 2px solid rgba(74, 222, 128, 0.4) !important;
          color: #fff !important;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2), 0 0 35px rgba(34, 197, 94, 0.1) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease !important;
        }

        .mpg-passo-feito:hover .mpg-circulo-feito {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5), 0 0 25px rgba(34, 197, 94, 0.25), 0 0 50px rgba(34, 197, 94, 0.1) !important;
        }

        /* Stepper Labels */
        .mpg-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-align: center;
          color: var(--text-muted, #64748b);
          white-space: nowrap;
          transition: color 0.3s, text-shadow 0.3s;
        }

        .mpg-label-ativo {
          color: #c084fc !important;
          text-shadow: 0 0 8px rgba(192, 132, 252, 0.5) !important;
          font-weight: 700 !important;
        }

        .mpg-label-feito {
          color: #86efac !important;
          text-shadow: 0 0 6px rgba(34, 197, 94, 0.3) !important;
        }

        /* Connectors */
        .mpg-conector {
          position: relative;
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.06);
          min-width: 20px;
          margin-top: 1.375rem;
          border-radius: 1px;
          overflow: hidden;
        }

        .mpg-conector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Ambient Glow Behind Active Circle */
        .mpg-nucleo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%);
          animation: mpg-nucleo-glow 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Keyframes for animations */
        @keyframes mpg-neon-pulse {
          0%, 100% {
            box-shadow: 
              0 0 0 1px rgba(192, 132, 252, 0.4),
              0 0 15px 4px rgba(124, 58, 237, 0.6), 
              0 0 35px 12px rgba(37, 99, 235, 0.35),
              inset 0 0 8px rgba(255, 255, 255, 0.35);
          }
          50% {
            box-shadow: 
              0 0 0 2px rgba(192, 132, 252, 0.6),
              0 0 22px 8px rgba(124, 58, 237, 0.85), 
              0 0 45px 18px rgba(37, 99, 235, 0.5),
              inset 0 0 12px rgba(255, 255, 255, 0.5);
          }
        }

        @keyframes mpg-nucleo-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.3); }
        }

        /* --- Orbita 3D ao redor do circulo ativo (identidade Gravity) --- */
        @keyframes mpg-orbita-drift {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes mpg-eletron-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }

        .mpg-orbita-3d {
          position: absolute;
          top: 50%; left: 50%;
          width: 130%; height: 130%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          perspective: 200px;
          transform-style: preserve-3d;
          z-index: 2;
        }
        .mpg-orbita-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .mpg-orbita-ring--1 {
          transform: rotateX(70deg) rotateZ(0deg);
          animation: mpg-orbita-drift 3s linear infinite;
        }
        .mpg-orbita-ring--2 {
          transform: rotateX(70deg) rotateZ(90deg);
          animation: mpg-orbita-drift 4.5s linear infinite reverse;
        }
        .mpg-orbita-anel {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px solid rgba(192, 132, 252, 0.3) !important;
          box-shadow: none !important;
        }
        .mpg-orbita-ring--2 .mpg-orbita-anel {
          border: 1px dashed rgba(124, 58, 237, 0.2) !important;
          box-shadow: none !important;
        }
        .mpg-orbita-eletron {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .mpg-orbita-eletron--1 {
          animation: mpg-eletron-spin 3s linear infinite;
        }
        .mpg-orbita-eletron--1::after {
          content: '';
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          top: -2.5px; left: 50%;
          transform: translateX(-50%);
          background: #c084fc;
          box-shadow: 0 0 8px 2px rgba(192, 132, 252, 0.8), 0 0 16px 4px rgba(192, 132, 252, 0.4);
        }
        .mpg-orbita-eletron--2 {
          animation: mpg-eletron-spin 4.5s linear infinite reverse;
        }
        .mpg-orbita-eletron--2::after {
          content: '';
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          top: -2px; left: 50%;
          transform: translateX(-50%);
          background: #7c3aed;
          box-shadow: 0 0 8px 2px rgba(124, 58, 237, 0.8), 0 0 16px 4px rgba(124, 58, 237, 0.4);
        }

        .nc-modal_cotacao_bid_frete_internacional-body {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 2.5rem;
          margin-bottom: 0;
          /* Suavizar a barra de rolagem */
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
        .nc-modal_cotacao_bid_frete_internacional-body::-webkit-scrollbar {
          width: 6px;
        }
        .nc-modal_cotacao_bid_frete_internacional-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }

        .nc-footer {
          display: flex;
          align-items: center;
          padding: 1.25rem 2.5rem;
          background: rgba(10, 15, 30, 0.45);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @keyframes nc-modal_cotacao_bid_frete_internacional-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .nc-modal_cotacao_bid_frete_internacional-close {
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
        .nc-modal_cotacao_bid_frete_internacional-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary, #f8fafc);
        }

        .nc-modal_cotacao_bid_frete_internacional-body {
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

        /* Removido duplicado .nc-stepper-container */

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
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          color: var(--text-secondary, #94a3b8);
          text-align: left;
          width: 100%;
          user-select: none;
        }
        .nc-option-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-btn--selected {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.27);
          color: var(--accent, #6366f1);
        }
        .nc-option-btn--selected:hover {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.44);
        }

        .nc-option-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          flex-shrink: 0;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .nc-option-btn--selected .nc-option-checkbox {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent, #6366f1);
        }
        .nc-option-checkmark {
          color: var(--accent, #6366f1);
          font-size: 11px;
          line-height: 1;
          font-weight: 700;
        }

        .nc-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary, #94a3b8);
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .nc-option-btn--selected .nc-option-icon {
          color: var(--accent, #6366f1);
        }
        .nc-option-btn:hover .nc-option-icon {
          color: var(--accent, #6366f1);
        }

        .nc-option-text {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
        }
        .nc-option-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          transition: all 0.15s ease;
        }
        .nc-option-btn--selected .nc-option-label {
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-btn:hover .nc-option-label {
          color: var(--text-primary, #f8fafc);
        }
        .nc-option-desc {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          opacity: 0.8;
          transition: all 0.15s ease;
        }
        .nc-option-btn--selected .nc-option-desc {
          color: var(--text-muted, #64748b);
        }
        .nc-option-btn:hover .nc-option-desc {
          color: var(--text-secondary-light, #cbd5e1);
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

        /* Novo layout: País + Estado/Província (linha 1) + Porto/Aeroporto (linha 2) */
        .nc-fields-grid--location-new {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .nc-fields-grid--location-new > *:nth-child(3) {
          grid-column: span 2;
        }
        @media(max-width: 600px) {
          .nc-fields-grid--location-new {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .nc-fields-grid--location-new > *:nth-child(3) {
            grid-column: span 1;
          }
        }

        /* ── Autocomplete ── */
        .nc-autocomplete {
          position: relative;
          width: 100%;
        }
        .nc-input-icon-wrap {
          position: relative;
          width: 100%;
        }
        .nc-input-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #64748b);
          pointer-events: none;
          z-index: 2;
        }
        .nc-input--search {
          padding-left: 2rem !important;
        }
        .nc-autocomplete-list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 50;
          max-height: 240px;
          overflow-y: auto;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          padding: 0.25rem;
          list-style: none;
          margin: 0;
        }
        .nc-autocomplete-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.55rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary, #f8fafc);
          font-size: 0.875rem;
          transition: background 0.12s ease;
        }
        .nc-autocomplete-item:hover {
          background: rgba(99, 102, 241, 0.12);
        }
        .nc-ac-code {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.12);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          min-width: 2.5rem;
          text-align: center;
        }
        .nc-ac-name {
          flex: 1;
          color: var(--text-primary, #f8fafc);
        }
        .nc-ac-pais {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
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
        .nc-visibilidade_cotacao_bid_frete_internacional-grid {
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
        .nc-receipt-modal_cotacao_bid_frete_internacional {
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
