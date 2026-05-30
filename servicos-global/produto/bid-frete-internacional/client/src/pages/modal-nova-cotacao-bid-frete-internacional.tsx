/**
 * modal-nova-cotacao-bid-frete-internacional.tsx — SSOT do wizard Nova Cotação (BID Frete Internacional).
 * Rota exclusiva: /bid-frete/cotacoes/nova (App.tsx). Não montar overlay em outras telas.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Truck,
  DownloadSimple,
  Export,
  Anchor,
  AirplaneTilt,
  Van,
  Package,
  MapPin,
  Scales,
  Users,
  FileText,
  CheckCircle,
  Info,
  Plus,
  Trash,
} from '@phosphor-icons/react'

import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'

import { criarCotacao, getFornecedores } from '../shared/api'
import { rotuloContainerCadastro } from '../shared/cadastrosApi'
import {
  formatarLinhasContainersParaExibicao,
  linhaContainerCotacaoVazia,
  serializarLinhasContainersFcl,
  type LinhaContainerCotacao,
} from '../shared/containers-cotacao-bid-frete-internacional'
import { useAeroportosPorPais, useContainersCadastros, usePaisesCadastros, usePortosPorPais } from '../shared/useCadastrosLogistica'
import { SelecaoFornecedoresDisparo } from './selecao-fornecedores-disparo-bid-frete-internacional'
import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  Visibilidade,
  CanalDisparo,
  Fornecedor,
} from '../shared/types'
import {
  OPERACAO_LABELS,
  MODAL_LABELS,
  MODALIDADE_LABELS,
} from '../shared/types'

// ─── Passos do wizard ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem e Destino', icone: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Carga e Incoterm', icone: <Package weight="duotone" size={16} /> },
  { id: 4, label: 'Fornecedores',     icone: <Users weight="duotone" size={16} /> },
  { id: 5, label: 'Resumo',           icone: <FileText weight="duotone" size={16} /> },
]

const INCOTERMS_APENAS_MARITIMOS = new Set(['FAS', 'FOB', 'CFR', 'CIF'])

const INCOTERM_GRUPOS: Array<{ titulo: string; itens: readonly string[] }> = [
  { titulo: 'Grupo E — Saída do vendedor', itens: ['EXW', 'FCA'] },
  { titulo: 'Grupo F — Principal não pago (marítimo)', itens: ['FAS', 'FOB'] },
  { titulo: 'Grupo C — Principal pago', itens: ['CFR', 'CIF', 'CPT', 'CIP'] },
  { titulo: 'Grupo D — Entrega no destino', itens: ['DAP', 'DPU', 'DDP'] },
]

function incotermHabilitadoParaModal(inc: string, modal: ModalFrete | ''): boolean {
  return modal === 'MARITIMO' || !INCOTERMS_APENAS_MARITIMOS.has(inc)
}

// ─── UF Brasil ──────────────────────────────────────────────────────────────
const UFS_BRASIL = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const OPCOES_ESTADOS_BR: SelectOpcao[] = [
  { valor: '', rotulo: 'Selecione...' },
  ...UFS_BRASIL.map((uf) => ({ valor: uf, rotulo: uf })),
]

/** Embalagem (LCL/aéreo/rodoviário) — persiste em tipo_container_cotacao_bid_frete_internacional quando não é FCL. */
const OPCOES_UNIDADE_EMBALAGEM: SelectOpcao[] = [
  { valor: 'UNIDADE', rotulo: 'Unidade (UN)' },
  { valor: 'CAIXA', rotulo: 'Caixa' },
  { valor: 'PALLET', rotulo: 'Palete / Pallet' },
  { valor: 'VOLUME', rotulo: 'Volume' },
  { valor: 'FARDO', rotulo: 'Fardo' },
  { valor: 'SACO', rotulo: 'Saco / Bag' },
  { valor: 'TAMBOR', rotulo: 'Tambor' },
  { valor: 'BIG_BAG', rotulo: 'Big Bag' },
]

const SUFIXO_QUANTIDADE_EMBALAGEM: Record<string, string> = {
  UNIDADE: 'un',
  CAIXA: 'cx',
  PALLET: 'plt',
  VOLUME: 'vol',
  FARDO: 'fd',
  SACO: 'sc',
  TAMBOR: 'tb',
  BIG_BAG: 'bb',
}

function rotuloUnidadeEmbalagem(codigo: string): string {
  return OPCOES_UNIDADE_EMBALAGEM.find((o) => o.valor === codigo)?.rotulo ?? codigo
}

function sufixoQuantidadeEmbalagem(codigo: string): string {
  return SUFIXO_QUANTIDADE_EMBALAGEM[codigo] ?? 'un'
}

type LadoLocalizacaoWizard = 'origem' | 'destino'

function modalExigePortoCotacao(modal: ModalFrete | ''): boolean {
  return modal === 'MARITIMO' || modal === 'RODOVIARIO'
}

function modalExigeAeroportoCotacao(modal: ModalFrete | ''): boolean {
  return modal === 'AEREO'
}

function fraseExibirCamposLocalizacao(lado: LadoLocalizacaoWizard): string {
  const sufixo = lado === 'origem' ? 'Origem' : 'Destino'
  return `Exibir campos: Cidade de ${sufixo}, Estado ou Província de ${sufixo} e País de ${sufixo}`
}

function limparCamposExtrasLocalizacao(prev: FormState, lado: LadoLocalizacaoWizard): FormState {
  if (lado === 'origem') {
    return {
      ...prev,
      origem_pais_cotacao_bid_frete_internacional: '',
      origem_pais_nome: '',
      estado_provincia_origem_cotacao_bid_frete_internacional: '',
      cidade_origem_cotacao_bid_frete_internacional: '',
      endereco_origem_cotacao_bid_frete_internacional: '',
    }
  }
  return {
    ...prev,
    destino_pais_cotacao_bid_frete_internacional: '',
    destino_pais_nome: '',
    estado_provincia_destino_cotacao_bid_frete_internacional: '',
    cidade_destino_cotacao_bid_frete_internacional: '',
    endereco_destino_cotacao_bid_frete_internacional: '',
  }
}

function alternarExibirCamposExtrasLocalizacao(
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  lado: LadoLocalizacaoWizard,
  ativo: boolean,
): void {
  setForm((prev) => {
    let next = { ...prev }
    if (lado === 'origem') {
      next.exibir_campos_extras_origem_cotacao = ativo
    } else {
      next.exibir_campos_extras_destino_cotacao = ativo
    }
    if (!ativo) {
      next = limparCamposExtrasLocalizacao(next, lado)
    }
    return next
  })
}

function exibirCamposExtrasLocalizacao(
  form: FormState,
  lado: LadoLocalizacaoWizard,
): boolean {
  return lado === 'origem'
    ? form.exibir_campos_extras_origem_cotacao
    : form.exibir_campos_extras_destino_cotacao
}

function limparCamposQuantidadeAoMudarModalidade(
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  modalidade: ModalidadeCarga,
) {
  setForm((prev) => ({
    ...prev,
    modalidade_cotacao_bid_frete_internacional: modalidade,
    tipo_container_cotacao_bid_frete_internacional: '',
    quantidade_cotacao_bid_frete_internacional: 1,
    linhas_container_fcl_cotacao: [linhaContainerCotacaoVazia(1)],
  }))
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
  cidade_origem_cotacao_bid_frete_internacional: string
  cidade_destino_cotacao_bid_frete_internacional: string
  exibir_campos_extras_origem_cotacao: boolean
  exibir_campos_extras_destino_cotacao: boolean
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
  /** FCL — várias linhas tipo/qtd; persistidas via serialização em tipo_container. */
  linhas_container_fcl_cotacao: LinhaContainerCotacao[]
  peso_kg_cotacao_bid_frete_internacional: string
  peso_ton_cotacao_bid_frete_internacional: string
  cubagem_m3_cotacao_bid_frete_internacional: string
  // Incoterm
  incoterm_cotacao_bid_frete_internacional: string
  zipcode_origem_cotacao_bid_frete_internacional: string
  endereco_origem_cotacao_bid_frete_internacional: string
  endereco_destino_cotacao_bid_frete_internacional: string
  zipcode_destino_cotacao_bid_frete_internacional: string
  data_limite_resposta_cotacao_bid_frete_internacional: string
  // Fornecedores
  visibilidade_cotacao_bid_frete_internacional: Visibilidade
  anonima_cotacao_bid_frete_internacional: boolean
  // Resumo
  valor_meta_cotacao_bid_frete_internacional: string
  moeda_meta_cotacao_bid_frete_internacional: string
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
  cidade_origem_cotacao_bid_frete_internacional: '',
  cidade_destino_cotacao_bid_frete_internacional: '',
  exibir_campos_extras_origem_cotacao: false,
  exibir_campos_extras_destino_cotacao: false,
  destino_codigo_cotacao_bid_frete_internacional: '',
  destino_nome_cotacao_bid_frete_internacional: '',
  aeroporto_destino_cotacao_bid_frete_internacional: '',
  aeroporto_destino_nome: '',
  descricao_mercadoria_cotacao_bid_frete_internacional: '',
  ncm_cotacao_bid_frete_internacional: '',
  hs_code_cotacao_bid_frete_internacional: '',
  quantidade_cotacao_bid_frete_internacional: 1,
  tipo_container_cotacao_bid_frete_internacional: '',
  linhas_container_fcl_cotacao: [linhaContainerCotacaoVazia(1)],
  peso_kg_cotacao_bid_frete_internacional: '',
  peso_ton_cotacao_bid_frete_internacional: '',
  cubagem_m3_cotacao_bid_frete_internacional: '',
  incoterm_cotacao_bid_frete_internacional: '',
  zipcode_origem_cotacao_bid_frete_internacional: '',
  endereco_origem_cotacao_bid_frete_internacional: '',
  endereco_destino_cotacao_bid_frete_internacional: '',
  zipcode_destino_cotacao_bid_frete_internacional: '',
  data_limite_resposta_cotacao_bid_frete_internacional: '',
  visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
  anonima_cotacao_bid_frete_internacional: false,
  valor_meta_cotacao_bid_frete_internacional: '',
  moeda_meta_cotacao_bid_frete_internacional: 'USD',
}

// ─── Descrições Enriquecidas de Opções ──────────────────────────────────────
const OPERACAO_DESCS: Record<TipoOperacao, string> = {
  IMPORTACAO: 'Trazer cargas de outros países para o território nacional.',
  EXPORTACAO: 'Enviar produtos nacionais para compradores internacionais.',
}

const MODAL_DESCS: Record<ModalFrete, string> = {
  MARITIMO: 'Alto volume, menor custo',
  AEREO: 'Entrega rápida e expressa',
  RODOVIARIO: 'Flexível e porta a porta',
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
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`nc-field${className ? ` ${className}` : ''}`}>
      <label className="nc-field-label">
        {label}
        {required && <span style={{ color: 'var(--danger, #ef4444)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function LinhaCheckboxExibirCamposLocalizacao({
  lado,
  form,
  setForm,
}: {
  lado: LadoLocalizacaoWizard
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const marcado = exibirCamposExtrasLocalizacao(form, lado)

  return (
    <div className="nc-exibir-campos-linha">
      <label className="nc-exibir-campos-checkbox">
        <input
          type="checkbox"
          className="nc-checkbox-padrao"
          checked={marcado}
          onChange={(e) => alternarExibirCamposExtrasLocalizacao(setForm, lado, e.target.checked)}
        />
        <span>{fraseExibirCamposLocalizacao(lado)}</span>
      </label>
    </div>
  )
}

const NC_ESTILOS_CONTEUDO = `
        .nc-root,
        .nc-step-wrapper,
        .nc-sucesso {
          --nc-muted: var(--ws-muted, var(--text-secondary, #94a3b8));
          /* Cards de opção: roxo explícito no selecionado (não herdar --accent azul do shell) */
          --nc-option-accent: #818cf8;
          --nc-option-accent-dim: rgba(129, 140, 248, 0.12);
          --nc-option-accent-border: rgba(129, 140, 248, 0.35);
          --nc-option-focus-ring: 0 0 0 3px rgba(129, 140, 248, 0.25);
          --nc-accent: var(--ws-accent, var(--accent, #818cf8));
          --nc-accent-dim: var(--ws-accent-dim, rgba(129, 140, 248, 0.12));
          --nc-accent-border: var(--ws-accent-border, rgba(129, 140, 248, 0.2));
          --nc-focus-ring: 0 0 0 3px rgba(129, 140, 248, 0.25);
        }

        /* Área scrollável — padding compacto para caber passo 1 sem scroll */
        .mpg-content-wrap {
          padding: 1.25rem 2rem 1.5rem !important;
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
          width: 100%;
        }

        .nc-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--nc-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          line-height: 1.3;
          margin-bottom: 1rem;
          margin-top: 1.75rem;
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
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .nc-options-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 720px) {
          .nc-options-grid-3 {
            grid-template-columns: 1fr;
          }
        }
        .nc-options-grid-2:last-child,
        .nc-options-grid-3:last-child {
          margin-bottom: 0;
        }

        /* Botão de Opção — repouso neutro; selecionado/hover selecionado em roxo (#818cf8) */
        .nc-option-btn {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-md, 8px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
          font-family: inherit;
          font-weight: 400;
          text-align: left;
          width: 100%;
          user-select: none;
        }
        .nc-option-btn:hover:not(.nc-option-btn--selected) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .nc-option-btn--selected {
          background: var(--nc-option-accent-dim);
          border: 1.5px solid var(--nc-option-accent-border);
          box-shadow: var(--nc-option-focus-ring);
        }
        .nc-option-btn--selected:hover {
          background: rgba(129, 140, 248, 0.16);
          border-color: rgba(129, 140, 248, 0.5);
          box-shadow: var(--nc-option-focus-ring);
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
          background: color-mix(in srgb, var(--nc-option-accent) 20%, transparent);
          border-color: var(--nc-option-accent);
        }
        .nc-option-checkmark {
          color: var(--nc-option-accent);
          font-size: 11px;
          line-height: 1;
          font-weight: 700;
        }

        .nc-option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--nc-muted);
          flex-shrink: 0;
          transition: color 0.15s ease;
        }
        .nc-option-btn--selected .nc-option-icon {
          color: var(--nc-option-accent);
        }

        .nc-option-text {
          display: flex;
          flex-direction: column;
          gap: 5px;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
        }
        .nc-option-label {
          font-size: 14.5px;
          font-weight: 600;
          color: #f1f5f9;
          transition: color 0.15s ease;
        }
        .nc-option-desc {
          font-size: 13px;
          color: var(--nc-muted);
          transition: color 0.15s ease;
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
          color: var(--nc-muted);
          font-size: 13px;
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

        .nc-cargo-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .nc-cargo-subsecao {
          background: var(--bg-base, rgba(15, 23, 42, 0.3));
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
        }
        .nc-cargo-subsecao-title {
          margin: 0 0 0.35rem;
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-primary, #f8fafc);
        }
        .nc-cargo-subsecao-hint {
          margin: 0 0 1rem;
          font-size: 0.8125rem;
          line-height: 1.45;
          color: var(--text-secondary-light, #94a3b8);
        }
        .nc-cargo-subsecao-grid-identificacao {
          display: grid;
          grid-template-columns: 13rem minmax(0, 2fr) 10rem;
          gap: 1.25rem;
          align-items: start;
        }
        .nc-cargo-subsecao-grid-quantidade {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) 8.5rem;
          gap: 1.25rem;
          align-items: start;
        }
        .nc-cargo-subsecao-grid-quantidade--embalagem {
          grid-template-columns: minmax(0, 1.2fr) 8.5rem;
        }
        .nc-linhas-container-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .nc-btn-adicionar-linha {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border: 1px dashed var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          background: transparent;
          color: var(--nc-accent);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .nc-btn-adicionar-linha:hover {
          background: var(--nc-accent-dim);
          border-color: var(--nc-accent);
        }
        .nc-linha-container-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 7.5rem auto;
          gap: 0.75rem;
          align-items: end;
          margin-bottom: 0.75rem;
        }
        .nc-btn-remover-linha {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          margin-bottom: 0.125rem;
          border: 1px solid rgba(248, 113, 113, 0.35);
          border-radius: var(--radius-md, 8px);
          background: rgba(248, 113, 113, 0.08);
          color: #f87171;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .nc-btn-remover-linha:hover:not(:disabled) {
          background: rgba(248, 113, 113, 0.18);
        }
        .nc-btn-remover-linha:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .nc-cargo-subsecao-grid-peso {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 960px) {
          .nc-cargo-subsecao-grid-identificacao {
            grid-template-columns: 1fr 1fr;
          }
          .nc-cargo-subsecao-grid-identificacao .nc-cargo-descricao {
            grid-column: 1 / -1;
          }
          .nc-cargo-subsecao-grid-quantidade,
          .nc-cargo-subsecao-grid-quantidade--embalagem {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .nc-cargo-subsecao-grid-identificacao,
          .nc-cargo-subsecao-grid-quantidade,
          .nc-cargo-subsecao-grid-quantidade--embalagem,
          .nc-linha-container-row {
            grid-template-columns: 1fr;
          }
        }

        /* SelectNcmGlobal alinhado ao padrão nc-field / nc-input desta tela */
        .nc-campo-ncm {
          min-width: 0;
        }
        .nc-campo-ncm .cg-wrapper {
          gap: 0.5rem;
        }
        .nc-campo-ncm .cg-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          color: var(--nc-muted);
        }
        .nc-campo-ncm .cg-wrapper > div:first-of-type {
          gap: 0.625rem;
        }
        .nc-campo-ncm input {
          flex: 1;
          min-width: 0;
          padding: 0.5625rem 0.875rem;
          background: var(--ws-bg-body, var(--bg-body, #0f172a));
          border: 1.5px solid var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          color: var(--text-primary, #f1f5f9);
          font-size: 0.875rem;
          font-family: var(--font-mono, 'DM Mono', monospace);
          min-height: 2.5rem;
          box-sizing: border-box;
        }
        .nc-campo-ncm input:focus {
          border-color: var(--nc-option-accent, #818cf8);
          box-shadow: var(--nc-option-focus-ring, 0 0 0 3px rgba(129, 140, 248, 0.25));
          outline: none;
        }
        .nc-campo-ncm button[aria-label="Buscar NCM"] {
          width: 2.5rem;
          height: 2.5rem;
          flex-shrink: 0;
          background: var(--ws-bg-body, var(--bg-body, #0f172a));
          border: 1.5px solid var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          color: var(--nc-option-accent, #818cf8);
        }
        .nc-campo-ncm button[aria-label="Buscar NCM"]:hover:not(:disabled) {
          background: var(--nc-option-accent-dim, rgba(129, 140, 248, 0.12));
          border-color: var(--nc-option-accent, #818cf8);
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
          color: var(--nc-muted);
        }

        .nc-input {
          padding: 0.5625rem 0.875rem;
          background: var(--ws-bg-body, var(--bg-body, #0f172a));
          border: 1.5px solid var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          color: var(--text-primary, #f1f5f9);
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          width: 100%;
          box-sizing: border-box;
          min-height: 2.5rem;
        }
        .nc-input:focus {
          border-color: var(--nc-accent);
          box-shadow: var(--nc-focus-ring);
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
          color: var(--nc-accent);
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
          background: var(--nc-option-accent-dim);
          border: 1px solid var(--nc-option-accent-border);
          border-left: 4px solid var(--nc-option-accent);
          box-shadow: var(--nc-option-focus-ring);
        }
        .nc-location-visual-card--destination {
          border-left: 4px solid var(--success, #10b981);
        }
        .nc-origem-destino-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .nc-location-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .nc-exibir-campos-linha {
          margin: 0;
          padding: 0;
        }
        .nc-exibir-campos-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin: 0;
          cursor: pointer;
          user-select: none;
        }
        .nc-fields-grid--location-extras {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-top: 1rem;
        }
        .nc-fields-grid--location-extras .nc-field--span-2 {
          grid-column: span 2;
        }
        @media (max-width: 600px) {
          .nc-fields-grid--location-extras {
            grid-template-columns: 1fr;
          }
          .nc-fields-grid--location-extras .nc-field--span-2 {
            grid-column: span 1;
          }
        }
        /* Checkbox — paridade gtv-checkbox (tabela-virtual-global) / Solid Slate */
        .nc-checkbox-padrao {
          appearance: none;
          -webkit-appearance: none;
          margin-top: 0.15rem;
          flex-shrink: 0;
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid var(--text-secondary, #94a3b8);
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: border-color 0.12s ease, background 0.12s ease;
        }
        .nc-checkbox-padrao:hover {
          border-color: var(--nc-accent);
          background: var(--nc-accent-dim);
        }
        .nc-checkbox-padrao:checked {
          background: var(--nc-accent);
          border-color: var(--nc-accent);
        }
        .nc-checkbox-padrao:checked::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 5px;
          border-left: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(-45deg) translate(0, -1px);
        }
        .nc-checkbox-padrao:focus-visible {
          outline: none;
          box-shadow: var(--nc-focus-ring);
        }
        .nc-exibir-campos-checkbox span {
          font-size: 0.8125rem;
          line-height: 1.45;
          color: var(--text-secondary, #cbd5e1);
        }
        .nc-origem-destino-stack .nc-location-visual-card {
          margin-top: 0;
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
          background: color-mix(in srgb, var(--nc-option-accent) 20%, transparent);
          border: 1px solid var(--nc-option-accent-border);
          color: var(--nc-option-accent);
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
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--nc-option-accent) 40%, transparent); }
          70% { box-shadow: 0 0 0 6px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
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

        /* Layout: Porto/Aeroporto (linha 1) + País + Estado/Província (linha 2) */
        .nc-fields-grid--location-new {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .nc-fields-grid--location-new > *:nth-child(1) {
          grid-column: span 2;
        }
        @media(max-width: 600px) {
          .nc-fields-grid--location-new {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .nc-fields-grid--location-new > *:nth-child(1) {
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
          border: 1px solid var(--nc-accent-border);
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
          background: var(--nc-accent-dim);
        }
        .nc-ac-code {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--nc-accent);
          background: var(--nc-accent-dim);
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

        /* ── Incoterms (agrupados) ── */
        .nc-incoterm-grupos {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .nc-incoterm-grupo-titulo {
          margin: 0 0 0.5rem;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-secondary-light, #94a3b8);
        }
        .nc-incoterm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(4.25rem, 1fr));
          gap: 0.5rem;
        }
        .nc-incoterm-btn {
          padding: 0.5rem 0.35rem;
          min-height: 2.5rem;
          background: var(--ws-bg-body, var(--bg-body, #0f172a));
          border: 1.5px solid var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          color: var(--text-secondary, #94a3b8);
          font-size: 0.75rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, opacity 0.18s ease;
        }
        .nc-incoterm-btn:hover:not(:disabled) {
          border-color: var(--nc-accent);
          color: var(--text-primary, #f1f5f9);
        }
        .nc-incoterm-btn--selected {
          background: var(--nc-accent-dim);
          border-color: var(--nc-accent);
          color: var(--nc-accent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--nc-accent) 35%, transparent);
        }
        .nc-incoterm-btn--desabilitado {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .nc-incoterm-helper-card {
          background: var(--nc-accent-dim);
          border: 1px solid var(--nc-accent-border);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          margin-top: 0.25rem;
        }
        .nc-helper-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--nc-accent);
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
          border-top: 1px solid var(--nc-accent-border);
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
          background: var(--ws-bg-body, var(--bg-body, #0f172a));
          border: 1.5px solid var(--nc-accent-border);
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
          text-align: left;
          font-family: inherit;
        }
        .nc-vis-card:hover:not(.nc-vis-card--selected) {
          border-color: var(--nc-accent);
          background: var(--nc-accent-dim);
        }
        .nc-vis-card--selected {
          border-color: var(--nc-accent);
          background: var(--nc-accent-dim);
          box-shadow: var(--nc-focus-ring);
        }
        .nc-vis-card--selected:hover {
          border-color: var(--nc-accent);
          background: var(--nc-accent-dim);
          box-shadow: var(--nc-focus-ring);
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
          background: color-mix(in srgb, var(--nc-accent) 20%, transparent);
          color: var(--nc-accent);
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
          background-color: var(--nc-accent);
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
          background: linear-gradient(90deg, var(--nc-accent), var(--success, #10b981));
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
          background: var(--nc-accent-dim);
          color: var(--nc-accent);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md, 8px);
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
          background: var(--nc-accent);
          box-shadow: 0 0 8px var(--nc-accent);
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
          background: linear-gradient(90deg, var(--nc-accent), var(--success, #10b981));
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
          color: var(--nc-accent);
          font-family: 'DM Mono', monospace;
          background: var(--nc-accent-dim);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--nc-accent-border);
        }

        /* ── Footer de Navegação (legado — modal usa BotaoGlobal) ── */
        .nc-footer {
          display: flex;
          align-items: center;
          padding: 2rem 0 0 0;
          gap: 1.25rem;
        }
        .nc-footer-spacer { 
          flex: 1; 
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

        .nc-field--span-2 {
          grid-column: span 2;
        }
        .nc-caption {
          font-size: 13px;
          color: var(--nc-muted, #94a3b8);
          margin: 0;
        }
        .nc-location-visual-text h4 {
          color: #f1f5f9;
          font-weight: 600;
        }
`

const ROTA_LISTA = '/bid-frete/cotacoes'

/** Padrão Pedido (ModalPedidosConsolidar) — banner de resultado no wizard */
const ESTILOS_RESULTADO = {
  passo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    minHeight: '120px',
  },
  resultadoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'color-mix(in srgb, var(--success, #22c55e) 10%, transparent)',
    border: '1px solid color-mix(in srgb, var(--success, #22c55e) 35%, transparent)',
    borderRadius: 'var(--radius-md, 8px)',
  },
  resultadoBannerTexto: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary, #f8fafc)',
    lineHeight: 1.5,
  },
  footerAcoes: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    width: '100%',
  },
}

function limparHtmlNcm(texto: string): string {
  return texto.replace(/<[^>]*>/g, '').trim()
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function ModalNovaCotacaoBidFreteInternacional() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [cotacaoId, setCotacaoId] = useState<string | null>(null)
  const [fornecedoresAtivos, setFornecedoresAtivos] = useState<Fornecedor[]>([])
  const [carregandoFornecedores, setCarregandoFornecedores] = useState(false)
  const [fornecedorIdsSelecionados, setFornecedorIdsSelecionados] = useState<string[]>([])
  const [canaisDisparo, setCanaisDisparo] = useState<CanalDisparo[]>([])
  const proximoIdLinhaContainerRef = useRef(2)

  useEffect(() => {
    if (step !== 4 || form.visibilidade_cotacao_bid_frete_internacional !== 'DIRECIONADA') return
    let cancelado = false
    setCarregandoFornecedores(true)
    getFornecedores({ limit: 200, status: 'ATIVO' })
      .then(res => {
        if (!cancelado) setFornecedoresAtivos(res.fornecedores)
      })
      .catch(() => {
        if (!cancelado) setFornecedoresAtivos([])
      })
      .finally(() => {
        if (!cancelado) setCarregandoFornecedores(false)
      })
    return () => { cancelado = true }
  }, [step, form.visibilidade_cotacao_bid_frete_internacional])

  useEffect(() => {
    if (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') {
      setFornecedorIdsSelecionados([])
    }
  }, [form.visibilidade_cotacao_bid_frete_internacional])

  const { paises: paisesCadastro, opcoes: opcoesPaises, carregando: carregandoPaises } = usePaisesCadastros()
  const paisOrigemCodigo = form.origem_pais_cotacao_bid_frete_internacional
  const paisDestinoCodigo = form.destino_pais_cotacao_bid_frete_internacional
  const {
    portos: portosOrigem,
    opcoes: opcoesPortosOrigem,
    carregando: carregandoPortosOrigem,
  } = usePortosPorPais(
    paisOrigemCodigo,
    modalExigePortoCotacao(form.modal_cotacao_bid_frete_internacional),
  )
  const {
    portos: portosDestino,
    opcoes: opcoesPortosDestino,
    carregando: carregandoPortosDestino,
  } = usePortosPorPais(
    paisDestinoCodigo,
    modalExigePortoCotacao(form.modal_cotacao_bid_frete_internacional),
  )
  const {
    aeroportos: aeroportosOrigem,
    opcoes: opcoesAeroportosOrigem,
    carregando: carregandoAeroportosOrigem,
  } = useAeroportosPorPais(
    paisOrigemCodigo,
    modalExigeAeroportoCotacao(form.modal_cotacao_bid_frete_internacional),
  )
  const {
    aeroportos: aeroportosDestino,
    opcoes: opcoesAeroportosDestino,
    carregando: carregandoAeroportosDestino,
  } = useAeroportosPorPais(
    paisDestinoCodigo,
    modalExigeAeroportoCotacao(form.modal_cotacao_bid_frete_internacional),
  )
  const {
    containers: containersCadastro,
    opcoes: opcoesContainers,
    carregando: carregandoContainers,
  } = useContainersCadastros(form.modal_cotacao_bid_frete_internacional === 'MARITIMO')

  const rotuloPais = useCallback(
    (codigo: string) => {
      const pais = paisesCadastro.find((p) => p.codigo_pais_iso_alpha2 === codigo)
      return pais ? `${pais.nome_pais_portugues} (${codigo})` : codigo
    },
    [paisesCadastro],
  )

  const rotuloPorto = useCallback(
    (codigo: string, portos: typeof portosOrigem) => {
      const porto = portos.find((p) => p.codigo_unlocode_porto === codigo)
      return porto ? `${porto.nome_porto} (${codigo})` : codigo
    },
    [],
  )

  const rotuloAeroporto = useCallback(
    (iata: string, aeroportos: typeof aeroportosOrigem) => {
      const aeroporto = aeroportos.find((a) => a.codigo_iata_aeroporto === iata)
      return aeroporto ? `${aeroporto.nome_aeroporto} (${iata})` : iata
    },
    [],
  )

  const aoMudarPaisOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      origem_pais_cotacao_bid_frete_internacional: codigo,
      origem_pais_nome: codigo ? rotuloPais(codigo) : '',
      estado_provincia_origem_cotacao_bid_frete_internacional: '',
      origem_codigo_cotacao_bid_frete_internacional: '',
      origem_nome_cotacao_bid_frete_internacional: '',
      aeroporto_origem_cotacao_bid_frete_internacional: '',
      aeroporto_origem_nome: '',
    }))
  }

  const aoMudarPaisDestino = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      destino_pais_cotacao_bid_frete_internacional: codigo,
      destino_pais_nome: codigo ? rotuloPais(codigo) : '',
      estado_provincia_destino_cotacao_bid_frete_internacional: '',
      destino_codigo_cotacao_bid_frete_internacional: '',
      destino_nome_cotacao_bid_frete_internacional: '',
      aeroporto_destino_cotacao_bid_frete_internacional: '',
      aeroporto_destino_nome: '',
    }))
  }

  const aoMudarPortoOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    const porto = portosOrigem.find((p) => p.codigo_unlocode_porto === codigo)
    setForm((prev) => ({
      ...prev,
      origem_codigo_cotacao_bid_frete_internacional: codigo,
      origem_nome_cotacao_bid_frete_internacional: codigo ? rotuloPorto(codigo, portosOrigem) : '',
      ...(porto?.codigo_pais_porto && !prev.origem_pais_cotacao_bid_frete_internacional
        ? {
            origem_pais_cotacao_bid_frete_internacional: porto.codigo_pais_porto,
            origem_pais_nome: rotuloPais(porto.codigo_pais_porto),
          }
        : {}),
    }))
  }

  const aoMudarPortoDestino = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    const porto = portosDestino.find((p) => p.codigo_unlocode_porto === codigo)
    setForm((prev) => ({
      ...prev,
      destino_codigo_cotacao_bid_frete_internacional: codigo,
      destino_nome_cotacao_bid_frete_internacional: codigo ? rotuloPorto(codigo, portosDestino) : '',
      ...(porto?.codigo_pais_porto && !prev.destino_pais_cotacao_bid_frete_internacional
        ? {
            destino_pais_cotacao_bid_frete_internacional: porto.codigo_pais_porto,
            destino_pais_nome: rotuloPais(porto.codigo_pais_porto),
          }
        : {}),
    }))
  }

  const aoMudarAeroportoOrigem = (valor: string | number | null) => {
    const iata = String(valor ?? '')
    const aeroporto = aeroportosOrigem.find((a) => a.codigo_iata_aeroporto === iata)
    setForm((prev) => ({
      ...prev,
      aeroporto_origem_cotacao_bid_frete_internacional: iata,
      aeroporto_origem_nome: iata ? rotuloAeroporto(iata, aeroportosOrigem) : '',
      ...(aeroporto?.codigo_pais_aeroporto && !prev.origem_pais_cotacao_bid_frete_internacional
        ? {
            origem_pais_cotacao_bid_frete_internacional: aeroporto.codigo_pais_aeroporto,
            origem_pais_nome: rotuloPais(aeroporto.codigo_pais_aeroporto),
          }
        : {}),
    }))
  }

  const aoMudarAeroportoDestino = (valor: string | number | null) => {
    const iata = String(valor ?? '')
    const aeroporto = aeroportosDestino.find((a) => a.codigo_iata_aeroporto === iata)
    setForm((prev) => ({
      ...prev,
      aeroporto_destino_cotacao_bid_frete_internacional: iata,
      aeroporto_destino_nome: iata ? rotuloAeroporto(iata, aeroportosDestino) : '',
      ...(aeroporto?.codigo_pais_aeroporto && !prev.destino_pais_cotacao_bid_frete_internacional
        ? {
            destino_pais_cotacao_bid_frete_internacional: aeroporto.codigo_pais_aeroporto,
            destino_pais_nome: rotuloPais(aeroporto.codigo_pais_aeroporto),
          }
        : {}),
    }))
  }

  // Carregar containers — SSOT Cadastros via useContainersCadastros

  const modal = form.modal_cotacao_bid_frete_internacional
  const modalidade = form.modalidade_cotacao_bid_frete_internacional
  const exigeContainerFcl = modal === 'MARITIMO' && modalidade === 'FCL'

  const stepStatus = (passoId: number): 'pendente' | 'ativo' | 'feito' => {
    if (passoId < step) return 'feito'
    if (passoId === step) return 'ativo'
    return 'pendente'
  }

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const rotuloContainerPorCodigo = useCallback(
    (codigo: string) => {
      const c = containersCadastro.find((item) => item.codigo_iso_container === codigo)
      return c ? `${c.codigo_iso_container} — ${rotuloContainerCadastro(c)}` : codigo
    },
    [containersCadastro],
  )

  const adicionarLinhaContainerFcl = () => {
    const id = proximoIdLinhaContainerRef.current++
    setForm((prev) => ({
      ...prev,
      linhas_container_fcl_cotacao: [
        ...prev.linhas_container_fcl_cotacao,
        linhaContainerCotacaoVazia(id),
      ],
    }))
  }

  const removerLinhaContainerFcl = (id: number) => {
    setForm((prev) => {
      if (prev.linhas_container_fcl_cotacao.length <= 1) return prev
      return {
        ...prev,
        linhas_container_fcl_cotacao: prev.linhas_container_fcl_cotacao.filter((l) => l.id !== id),
      }
    })
  }

  const atualizarLinhaContainerFcl = (
    id: number,
    patch: Partial<Pick<LinhaContainerCotacao, 'tipo_container' | 'quantidade'>>,
  ) => {
    setForm((prev) => ({
      ...prev,
      linhas_container_fcl_cotacao: prev.linhas_container_fcl_cotacao.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    }))
  }

  useEffect(() => {
    const inc = form.incoterm_cotacao_bid_frete_internacional
    if (!inc || incotermHabilitadoParaModal(inc, modal)) return
    set('incoterm_cotacao_bid_frete_internacional', '')
  }, [modal, form.incoterm_cotacao_bid_frete_internacional])

  const aoMudarNcm = (codigo: string, descricao?: string) => {
    set('ncm_cotacao_bid_frete_internacional', codigo)
    if (descricao) {
      set('descricao_mercadoria_cotacao_bid_frete_internacional', limparHtmlNcm(descricao))
    }
  }

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!form.tipo_operacao_cotacao_bid_frete_internacional && !!form.modal_cotacao_bid_frete_internacional && !!form.modalidade_cotacao_bid_frete_internacional
      case 2: {
        const origemOk = modalExigePortoCotacao(modal)
          ? !!form.origem_codigo_cotacao_bid_frete_internacional
          : modalExigeAeroportoCotacao(modal)
            ? !!form.aeroporto_origem_cotacao_bid_frete_internacional
            : true
        const destinoOk = modalExigePortoCotacao(modal)
          ? !!form.destino_codigo_cotacao_bid_frete_internacional
          : modalExigeAeroportoCotacao(modal)
            ? !!form.aeroporto_destino_cotacao_bid_frete_internacional
            : true
        return origemOk && destinoOk
      }
      case 3: {
        const base = !!form.descricao_mercadoria_cotacao_bid_frete_internacional
          && !!form.incoterm_cotacao_bid_frete_internacional
        if (exigeContainerFcl) {
          return (
            base
            && form.linhas_container_fcl_cotacao.length > 0
            && form.linhas_container_fcl_cotacao.every(
              (l) => !!l.tipo_container.trim() && l.quantidade > 0,
            )
          )
        }
        return (
          base
          && !!form.tipo_container_cotacao_bid_frete_internacional
          && form.quantidade_cotacao_bid_frete_internacional > 0
        )
      }
      case 4:
        if (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') return true
        return fornecedorIdsSelecionados.length > 0
      case 5: return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSalvando(true)
    try {
      const paisOrigem =
        form.origem_pais_cotacao_bid_frete_internacional ||
        portosOrigem.find((p) => p.codigo_unlocode_porto === form.origem_codigo_cotacao_bid_frete_internacional)?.codigo_pais_porto ||
        aeroportosOrigem.find((a) => a.codigo_iata_aeroporto === form.aeroporto_origem_cotacao_bid_frete_internacional)?.codigo_pais_aeroporto ||
        (form.origem_codigo_cotacao_bid_frete_internacional.length >= 2
          ? form.origem_codigo_cotacao_bid_frete_internacional.slice(0, 2).toUpperCase()
          : '')

      const paisDestino =
        form.destino_pais_cotacao_bid_frete_internacional ||
        portosDestino.find((p) => p.codigo_unlocode_porto === form.destino_codigo_cotacao_bid_frete_internacional)?.codigo_pais_porto ||
        aeroportosDestino.find((a) => a.codigo_iata_aeroporto === form.aeroporto_destino_cotacao_bid_frete_internacional)?.codigo_pais_aeroporto ||
        (form.destino_codigo_cotacao_bid_frete_internacional.length >= 2
          ? form.destino_codigo_cotacao_bid_frete_internacional.slice(0, 2).toUpperCase()
          : '')

      const containersPersistidos = exigeContainerFcl
        ? serializarLinhasContainersFcl(form.linhas_container_fcl_cotacao)
        : {
            tipo_container_cotacao_bid_frete_internacional: form.tipo_container_cotacao_bid_frete_internacional,
            quantidade_cotacao_bid_frete_internacional: form.quantidade_cotacao_bid_frete_internacional,
          }

      const cotacao = await criarCotacao({
        tipo_operacao_cotacao_bid_frete_internacional: form.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao,
        modal_cotacao_bid_frete_internacional: form.modal_cotacao_bid_frete_internacional as ModalFrete,
        modalidade_cotacao_bid_frete_internacional: form.modalidade_cotacao_bid_frete_internacional as ModalidadeCarga,
        origem_codigo_cotacao_bid_frete_internacional:
          form.origem_codigo_cotacao_bid_frete_internacional ||
          form.aeroporto_origem_cotacao_bid_frete_internacional,
        origem_nome_cotacao_bid_frete_internacional: form.origem_nome_cotacao_bid_frete_internacional || form.aeroporto_origem_nome,
        origem_pais_cotacao_bid_frete_internacional: paisOrigem,
        destino_codigo_cotacao_bid_frete_internacional:
          form.destino_codigo_cotacao_bid_frete_internacional ||
          form.aeroporto_destino_cotacao_bid_frete_internacional,
        destino_nome_cotacao_bid_frete_internacional: form.destino_nome_cotacao_bid_frete_internacional || form.aeroporto_destino_nome,
        destino_pais_cotacao_bid_frete_internacional: paisDestino,
        descricao_mercadoria_cotacao_bid_frete_internacional: form.descricao_mercadoria_cotacao_bid_frete_internacional,
        ncm_cotacao_bid_frete_internacional: form.ncm_cotacao_bid_frete_internacional || undefined,
        quantidade_cotacao_bid_frete_internacional: containersPersistidos.quantidade_cotacao_bid_frete_internacional,
        tipo_container_cotacao_bid_frete_internacional:
          containersPersistidos.tipo_container_cotacao_bid_frete_internacional || undefined,
        peso_kg_cotacao_bid_frete_internacional: form.peso_kg_cotacao_bid_frete_internacional ? parseFloat(form.peso_kg_cotacao_bid_frete_internacional) : undefined,
        cubagem_m3_cotacao_bid_frete_internacional: form.cubagem_m3_cotacao_bid_frete_internacional ? parseFloat(form.cubagem_m3_cotacao_bid_frete_internacional) : undefined,
        incoterm_cotacao_bid_frete_internacional: form.incoterm_cotacao_bid_frete_internacional,
        endereco_origem_cotacao_bid_frete_internacional: exibirCamposExtrasLocalizacao(form, 'origem')
          ? form.cidade_origem_cotacao_bid_frete_internacional.trim() || undefined
          : undefined,
        endereco_destino_cotacao_bid_frete_internacional: exibirCamposExtrasLocalizacao(form, 'destino')
          ? form.cidade_destino_cotacao_bid_frete_internacional.trim() || undefined
          : undefined,
        visibilidade_cotacao_bid_frete_internacional: form.visibilidade_cotacao_bid_frete_internacional,
        anonima_cotacao_bid_frete_internacional: form.anonima_cotacao_bid_frete_internacional,
        valor_meta_cotacao_bid_frete_internacional: form.valor_meta_cotacao_bid_frete_internacional
          ? parseFloat(form.valor_meta_cotacao_bid_frete_internacional)
          : undefined,
        moeda_meta_cotacao_bid_frete_internacional: form.moeda_meta_cotacao_bid_frete_internacional,
        data_limite_resposta_cotacao_bid_frete_internacional: form.data_limite_resposta_cotacao_bid_frete_internacional || undefined,
        fornecedor_ids: form.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA' ? fornecedorIdsSelecionados : undefined,
        disparar_ao_criar: canaisDisparo.length > 0
          && (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA'
            || fornecedorIdsSelecionados.length > 0),
        canais_disparo: canaisDisparo,
      })
      setCotacaoId(cotacao.id_cotacao_bid_frete_internacional)
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
                  icon={op === 'IMPORTACAO' ? <DownloadSimple weight="duotone" size={24} /> : <Export weight="duotone" size={24} />}
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
                icon={<Anchor weight="duotone" size={24} />}
                label="Marítimo"
                description={MODAL_DESCS.MARITIMO}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'AEREO'}
                onClick={() => {
                  set('modal_cotacao_bid_frete_internacional', 'AEREO')
                  set('modalidade_cotacao_bid_frete_internacional', '')
                }}
                icon={<AirplaneTilt weight="duotone" size={24} />}
                label="Aéreo"
                description={MODAL_DESCS.AEREO}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO'}
                onClick={() => {
                  set('modal_cotacao_bid_frete_internacional', 'RODOVIARIO')
                  set('modalidade_cotacao_bid_frete_internacional', '')
                }}
                icon={<Truck weight="duotone" size={24} />}
                label="Rodoviário"
                description={MODAL_DESCS.RODOVIARIO}
              />
            </div>

            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.modalidade')}</h3>
            <div className="nc-options-grid-2">
              {form.modal_cotacao_bid_frete_internacional === 'MARITIMO' && (
                <>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'FCL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'FCL')} icon={<Package weight="duotone" size={22} />} label="FCL — Container Completo" description={MODALIDADE_DESCS.FCL} />
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'LCL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'LCL')} icon={<Package weight="duotone" size={22} />} label="LCL — Carga Fracionada" description={MODALIDADE_DESCS.LCL} />
                </>
              )}
              {form.modal_cotacao_bid_frete_internacional === 'AEREO' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'AEREO_GERAL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'AEREO_GERAL')} icon={<AirplaneTilt weight="duotone" size={22} />} label="Aéreo Geral" description={MODALIDADE_DESCS.AEREO_GERAL} />
                </div>
              )}
              {form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO' && (
                <>
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_FTL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'RODOVIARIO_FTL')} icon={<Van weight="duotone" size={22} />} label="FTL — Carga Completa" description={MODALIDADE_DESCS.RODOVIARIO_FTL} />
                  <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_LTL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'RODOVIARIO_LTL')} icon={<Van weight="duotone" size={22} />} label="LTL — Carga Fracionada" description={MODALIDADE_DESCS.RODOVIARIO_LTL} />
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

      // STEP 2 — Origem e Destino
      case 2: {
        const exibirExtrasOrigem = exibirCamposExtrasLocalizacao(form, 'origem')
        const exibirExtrasDestino = exibirCamposExtrasLocalizacao(form, 'destino')
        const exigePorto = modalExigePortoCotacao(modal)
        const exigeAeroporto = modalExigeAeroportoCotacao(modal)
        const legendaOrigem = exigeAeroporto
          ? 'Informe o aeroporto de partida. Marque a opção abaixo se precisar informar cidade, estado ou país.'
          : exigePorto
            ? 'Informe o porto de embarque. Marque a opção abaixo se precisar informar cidade, estado ou país.'
            : 'Marque a opção abaixo se precisar informar o local de coleta.'
        const legendaDestino = exigeAeroporto
          ? 'Informe o aeroporto de chegada. Marque a opção abaixo se precisar informar cidade, estado ou país.'
          : exigePorto
            ? 'Informe o porto de destino. Marque a opção abaixo se precisar informar cidade, estado ou país.'
            : 'Marque a opção abaixo se precisar informar o local de entrega.'

        return (
          <div className="nc-step-content nc-origem-destino-stack">
            <div className="nc-location-visual-card nc-location-visual-card--origin">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{exigeAeroporto ? 'Aeroporto de Origem' : exigePorto ? t('bidfrete.nova_cotacao.porto_origem') : 'Local de Origem'}</h4>
                  <p className="nc-caption">{legendaOrigem}</p>
                </div>
              </div>

              <div className="nc-location-body">
                {exigePorto && (
                  <Field label="PORTO DE EMBARQUE" required>
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosOrigem}
                      valor={form.origem_codigo_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoOrigem}
                      placeholder="Selecione o porto..."
                      buscavel
                      carregando={carregandoPortosOrigem}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeAeroporto && (
                  <Field label="AEROPORTO DE EMBARQUE" required>
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosOrigem}
                      valor={form.aeroporto_origem_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoOrigem}
                      placeholder="Selecione o aeroporto..."
                      buscavel
                      carregando={carregandoAeroportosOrigem}
                      posicao="auto"
                    />
                  </Field>
                )}

                <LinhaCheckboxExibirCamposLocalizacao lado="origem" form={form} setForm={setForm} />

                {exibirExtrasOrigem && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE ORIGEM">
                      <SelectGlobal
                        iconeEsquerda={<MapPin size={16} />}
                        opcoes={opcoesPaises}
                        valor={form.origem_pais_cotacao_bid_frete_internacional || null}
                        aoMudarValor={aoMudarPaisOrigem}
                        placeholder="Selecione o país..."
                        buscavel
                        carregando={carregandoPaises}
                        posicao="auto"
                      />
                    </Field>

                    <Field label="ESTADO OU PROVÍNCIA DE ORIGEM">
                      {form.origem_pais_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={OPCOES_ESTADOS_BR}
                          valor={form.estado_provincia_origem_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => set('estado_provincia_origem_cotacao_bid_frete_internacional', String(v ?? ''))}
                          placeholder="Selecione o UF"
                          buscavel
                          desabilitado={!form.origem_pais_cotacao_bid_frete_internacional}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: Guangdong"
                          value={form.estado_provincia_origem_cotacao_bid_frete_internacional}
                          onChange={(e) => set('estado_provincia_origem_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>

                    <Field label="CIDADE DE ORIGEM" className="nc-field--span-2">
                      <input
                        className="nc-input"
                        placeholder="Ex: Shenzhen"
                        value={form.cidade_origem_cotacao_bid_frete_internacional}
                        onChange={(e) => set('cidade_origem_cotacao_bid_frete_internacional', e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div className="nc-location-visual-card nc-location-visual-card--destination">
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon-dest" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{exigeAeroporto ? 'Aeroporto de Destino' : exigePorto ? t('bidfrete.nova_cotacao.porto_destino') : 'Local de Destino'}</h4>
                  <p className="nc-caption">{legendaDestino}</p>
                </div>
              </div>

              <div className="nc-location-body">
                {exigePorto && (
                  <Field label="PORTO DE DESTINO" required>
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosDestino}
                      valor={form.destino_codigo_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoDestino}
                      placeholder="Selecione o porto..."
                      buscavel
                      carregando={carregandoPortosDestino}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeAeroporto && (
                  <Field label="AEROPORTO DE DESTINO" required>
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosDestino}
                      valor={form.aeroporto_destino_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoDestino}
                      placeholder="Selecione o aeroporto..."
                      buscavel
                      carregando={carregandoAeroportosDestino}
                      posicao="auto"
                    />
                  </Field>
                )}

                <LinhaCheckboxExibirCamposLocalizacao lado="destino" form={form} setForm={setForm} />

                {exibirExtrasDestino && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE DESTINO">
                      <SelectGlobal
                        iconeEsquerda={<MapPin size={16} />}
                        opcoes={opcoesPaises}
                        valor={form.destino_pais_cotacao_bid_frete_internacional || null}
                        aoMudarValor={aoMudarPaisDestino}
                        placeholder="Selecione o país..."
                        buscavel
                        carregando={carregandoPaises}
                        posicao="auto"
                      />
                    </Field>

                    <Field label="ESTADO OU PROVÍNCIA DE DESTINO">
                      {form.destino_pais_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={OPCOES_ESTADOS_BR}
                          valor={form.estado_provincia_destino_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => set('estado_provincia_destino_cotacao_bid_frete_internacional', String(v ?? ''))}
                          placeholder="Selecione o UF"
                          buscavel
                          desabilitado={!form.destino_pais_cotacao_bid_frete_internacional}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: California"
                          value={form.estado_provincia_destino_cotacao_bid_frete_internacional}
                          onChange={(e) => set('estado_provincia_destino_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>

                    <Field label="CIDADE DE DESTINO" className="nc-field--span-2">
                      <input
                        className="nc-input"
                        placeholder="Ex: Santos"
                        value={form.cidade_destino_cotacao_bid_frete_internacional}
                        onChange={(e) => set('cidade_destino_cotacao_bid_frete_internacional', e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      // STEP 3 — Carga + Incoterm
      case 3: {
        const sufixoQtd = exigeContainerFcl
          ? 'ctn'
          : sufixoQuantidadeEmbalagem(form.tipo_container_cotacao_bid_frete_internacional)
        const modalidadeLabel = form.modalidade_cotacao_bid_frete_internacional
          ? MODALIDADE_LABELS[form.modalidade_cotacao_bid_frete_internacional as ModalidadeCarga]
          : '—'

        return (
          <div className="nc-step-content nc-cargo-stack">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.dados_mercadoria')}</h3>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-identificacao">
              <h4 id="nc-cargo-identificacao" className="nc-cargo-subsecao-title">Identificação da mercadoria</h4>
              <p className="nc-cargo-subsecao-hint">NCM, descrição comercial e HS Code (quando aplicável).</p>
              <div className="nc-cargo-subsecao-grid-identificacao">
                <SelectNcmGlobal
                  className="nc-campo-ncm"
                  label="NCM"
                  value={form.ncm_cotacao_bid_frete_internacional}
                  onChange={aoMudarNcm}
                />

                <Field
                  label={t('bidfrete.nova_cotacao.descricao_mercadoria')}
                  required
                  className="nc-cargo-descricao"
                >
                  <input
                    className="nc-input"
                    placeholder="Ex: Peças automotivas, eletrônicos industriais..."
                    value={form.descricao_mercadoria_cotacao_bid_frete_internacional}
                    onChange={e => set('descricao_mercadoria_cotacao_bid_frete_internacional', e.target.value)}
                  />
                </Field>

                <Field label="HS CODE">
                  <input
                    className="nc-input"
                    placeholder="Ex: 8708.99"
                    value={form.hs_code_cotacao_bid_frete_internacional}
                    onChange={e => set('hs_code_cotacao_bid_frete_internacional', e.target.value.slice(0, 10))}
                  />
                </Field>
              </div>
            </section>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-quantidade">
              <h4 id="nc-cargo-quantidade" className="nc-cargo-subsecao-title">Quantidade</h4>
              {exigeContainerFcl ? (
                <>
                  <div className="nc-linhas-container-header">
                    <p className="nc-cargo-subsecao-hint" style={{ margin: 0 }}>
                      Modalidade <strong>{modalidadeLabel}</strong> (passo 1) — adicione um ou mais tipos de container.
                    </p>
                    <button
                      type="button"
                      className="nc-btn-adicionar-linha"
                      onClick={adicionarLinhaContainerFcl}
                    >
                      <Plus size={14} weight="bold" />
                      Adicionar container
                    </button>
                  </div>
                  {form.linhas_container_fcl_cotacao.map((linha, indice) => (
                    <div key={linha.id} className="nc-linha-container-row">
                      <Field label="TIPO CONTAINER" required>
                        <SelectGlobal
                          opcoes={opcoesContainers}
                          valor={linha.tipo_container || null}
                          aoMudarValor={(v) =>
                            atualizarLinhaContainerFcl(linha.id, { tipo_container: String(v ?? '') })
                          }
                          placeholder="Selecione o tipo..."
                          buscavel
                          carregando={carregandoContainers}
                          posicao="auto"
                        />
                      </Field>
                      <Field label="QUANTIDADE" required>
                        <div className="nc-input-group">
                          <input
                            className="nc-input nc-input--with-suffix"
                            type="number"
                            min={1}
                            value={linha.quantidade}
                            onChange={(e) =>
                              atualizarLinhaContainerFcl(linha.id, {
                                quantidade: parseInt(e.target.value, 10) || 1,
                              })
                            }
                          />
                          <span className="nc-input-suffix">ctn</span>
                        </div>
                      </Field>
                      <button
                        type="button"
                        className="nc-btn-remover-linha"
                        title="Remover linha"
                        disabled={form.linhas_container_fcl_cotacao.length <= 1}
                        onClick={() => removerLinhaContainerFcl(linha.id)}
                        aria-label="Remover container"
                      >
                        <Trash size={18} weight="duotone" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="nc-cargo-subsecao-hint">
                    Modalidade <strong>{modalidadeLabel}</strong> — escolha o tipo de volume (caixa, palete, etc.) e a quantidade.
                  </p>
                  <div className="nc-cargo-subsecao-grid-quantidade nc-cargo-subsecao-grid-quantidade--embalagem">
                    <Field label="TIPO DE VOLUME" required>
                      <SelectGlobal
                        opcoes={OPCOES_UNIDADE_EMBALAGEM}
                        valor={form.tipo_container_cotacao_bid_frete_internacional || null}
                        aoMudarValor={(v) => set('tipo_container_cotacao_bid_frete_internacional', String(v ?? ''))}
                        placeholder="Selecione caixa, palete..."
                        buscavel
                        posicao="auto"
                      />
                    </Field>

                    <Field label={t('bidfrete.nova_cotacao.quantidade')} required>
                      <div className="nc-input-group">
                        <input
                          className="nc-input nc-input--with-suffix"
                          type="number"
                          min={1}
                          value={form.quantidade_cotacao_bid_frete_internacional}
                          onChange={e => set('quantidade_cotacao_bid_frete_internacional', parseInt(e.target.value, 10) || 1)}
                        />
                        <span className="nc-input-suffix">{sufixoQtd}</span>
                      </div>
                    </Field>
                  </div>
                </>
              )}
            </section>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-peso">
              <h4 id="nc-cargo-peso" className="nc-cargo-subsecao-title">Peso e cubagem</h4>
              <p className="nc-cargo-subsecao-hint">Opcional neste momento; ajuda o fornecedor a cotar com precisão.</p>
              <div className="nc-cargo-subsecao-grid-peso">
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
            </section>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-incoterm">
              <h4 id="nc-cargo-incoterm" className="nc-cargo-subsecao-title">{t('bidfrete.nova_cotacao.incoterm')}</h4>
              <p className="nc-cargo-subsecao-hint">
                Escolha quem assume frete e risco até o destino.
                {modal !== 'MARITIMO' && (
                  <> Termos exclusivos de transporte marítimo (FAS, FOB, CFR, CIF) ficam indisponíveis para o modal <strong>{MODAL_LABELS[modal as ModalFrete] ?? modal}</strong>.</>
                )}
              </p>
              <div className="nc-incoterm-grupos">
                {INCOTERM_GRUPOS.map(grupo => (
                  <div key={grupo.titulo}>
                    <p className="nc-incoterm-grupo-titulo">{grupo.titulo}</p>
                    <div className="nc-incoterm-grid" role="group" aria-label={grupo.titulo}>
                      {grupo.itens.map(inc => {
                        const habilitado = incotermHabilitadoParaModal(inc, modal)
                        const selecionado = form.incoterm_cotacao_bid_frete_internacional === inc
                        return (
                          <button
                            key={inc}
                            type="button"
                            disabled={!habilitado}
                            title={habilitado ? undefined : 'Disponível apenas para modal Marítimo'}
                            className={[
                              'nc-incoterm-btn',
                              selecionado ? 'nc-incoterm-btn--selected' : '',
                              !habilitado ? 'nc-incoterm-btn--desabilitado' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => habilitado && set('incoterm_cotacao_bid_frete_internacional', inc)}
                          >
                            {inc}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {form.incoterm_cotacao_bid_frete_internacional && INCOTERM_EXPLANATIONS[form.incoterm_cotacao_bid_frete_internacional] && (
                <div className="nc-incoterm-helper-card nc-fade-in">
                  <div className="nc-helper-header">
                    <Scales size={20} weight="duotone" className="nc-helper-icon" />
                    <h4>{INCOTERM_EXPLANATIONS[form.incoterm_cotacao_bid_frete_internacional].title}</h4>
                  </div>
                  <p className="nc-helper-desc">{INCOTERM_EXPLANATIONS[form.incoterm_cotacao_bid_frete_internacional].desc}</p>
                  <div className="nc-helper-footer">
                    <strong>Responsabilidade:</strong>{' '}
                    {INCOTERM_EXPLANATIONS[form.incoterm_cotacao_bid_frete_internacional].responsabilidade}
                  </div>
                </div>
              )}
            </section>
          </div>
        )
      }

      // STEP 4 — Fornecedores
      case 4:
        return (
          <div className="nc-step-content">
            <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }} aria-labelledby="nc-prazo-respostas">
              <h4 id="nc-prazo-respostas" className="nc-cargo-subsecao-title">{t('bidfrete.nova_cotacao.prazo_respostas')}</h4>
              <p className="nc-cargo-subsecao-hint">Opcional — define até quando os fornecedores podem enviar propostas.</p>
              <Field label={t('bidfrete.nova_cotacao.prazo_respostas')}>
                <input
                  className="nc-input nc-input--date"
                  type="datetime-local"
                  value={form.data_limite_resposta_cotacao_bid_frete_internacional}
                  onChange={e => set('data_limite_resposta_cotacao_bid_frete_internacional', e.target.value)}
                />
              </Field>
            </section>

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
                  <input type="checkbox" checked={form.anonima_cotacao_bid_frete_internacional} onChange={e => set('anonima_cotacao_bid_frete_internacional', e.target.checked)} />
                  <span className="nc-switch-slider"></span>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.fornecedores_disparo', 'Fornecedores e envio')}</h3>
              <SelecaoFornecedoresDisparo
                visibilidade={form.visibilidade_cotacao_bid_frete_internacional}
                fornecedores={fornecedoresAtivos}
                carregando={carregandoFornecedores}
                selecionados={fornecedorIdsSelecionados}
                onChangeSelecionados={setFornecedorIdsSelecionados}
                canais={canaisDisparo}
                onChangeCanais={setCanaisDisparo}
              />
            </div>
          </div>
        )

      // STEP 5 — Resumo
      case 5: {
        const origemCode = modal === 'AEREO' ? form.aeroporto_origem_cotacao_bid_frete_internacional : form.origem_codigo_cotacao_bid_frete_internacional
        const origemName = modalExigeAeroportoCotacao(modal)
          ? form.aeroporto_origem_nome
          : form.origem_nome_cotacao_bid_frete_internacional
        const destinoCode = modal === 'AEREO' ? form.aeroporto_destino_cotacao_bid_frete_internacional : form.destino_codigo_cotacao_bid_frete_internacional
        const destinoName = modalExigeAeroportoCotacao(modal)
          ? form.aeroporto_destino_nome
          : form.destino_nome_cotacao_bid_frete_internacional

        return (
          <div className="nc-step-content">
            <h3 className="nc-section-title">{t('bidfrete.nova_cotacao.resumo_cotacao')}</h3>

            <div className="nc-fields-grid nc-fields-grid--summary-inputs">
              <Field label={t('bidfrete.nova_cotacao.valor_alvo')}>
                <input className="nc-input" type="number" placeholder="Ex: 5000" value={form.valor_meta_cotacao_bid_frete_internacional} onChange={e => set('valor_meta_cotacao_bid_frete_internacional', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.moeda')}>
                <select className="nc-input" value={form.moeda_meta_cotacao_bid_frete_internacional} onChange={e => set('moeda_meta_cotacao_bid_frete_internacional', e.target.value)}>
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
                    {modal === 'RODOVIARIO' && <Truck weight="duotone" size={16} />}
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
                    {exigeContainerFcl
                      ? `${serializarLinhasContainersFcl(form.linhas_container_fcl_cotacao).quantidade_cotacao_bid_frete_internacional} ctn`
                      : `${form.quantidade_cotacao_bid_frete_internacional} ${sufixoQuantidadeEmbalagem(form.tipo_container_cotacao_bid_frete_internacional)}`}
                    {form.peso_kg_cotacao_bid_frete_internacional ? ` | ${form.peso_kg_cotacao_bid_frete_internacional} Kg` : ''}
                    {form.peso_ton_cotacao_bid_frete_internacional ? ` (${form.peso_ton_cotacao_bid_frete_internacional} TON)` : ''}
                    {form.cubagem_m3_cotacao_bid_frete_internacional ? ` | ${form.cubagem_m3_cotacao_bid_frete_internacional} m³` : ''}
                    {!exigeContainerFcl
                      && !form.peso_kg_cotacao_bid_frete_internacional
                      && !form.cubagem_m3_cotacao_bid_frete_internacional
                      && form.quantidade_cotacao_bid_frete_internacional <= 0
                      ? '—'
                      : ''}
                  </span>
                </div>
                {(exigeContainerFcl
                  ? form.linhas_container_fcl_cotacao.some((l) => l.tipo_container.trim())
                  : !!form.tipo_container_cotacao_bid_frete_internacional) && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">{exigeContainerFcl ? 'Containers' : 'Tipo de volume'}</span>
                    <span className="nc-receipt-value">
                      {exigeContainerFcl
                        ? formatarLinhasContainersParaExibicao(
                            form.linhas_container_fcl_cotacao,
                            rotuloContainerPorCodigo,
                          )
                        : rotuloUnidadeEmbalagem(form.tipo_container_cotacao_bid_frete_internacional)}
                    </span>
                  </div>
                )}
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_incoterm')}</span>
                  <span className="nc-receipt-value nc-receipt-value--incoterm">{form.incoterm_cotacao_bid_frete_internacional || '—'}</span>
                </div>
                <div className="nc-receipt-row">
                  <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.resumo_visibilidade')}</span>
                  <span className="nc-receipt-value">
                    {form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA' ? 'Aberta' : 'Direcionada'}{form.anonima_cotacao_bid_frete_internacional ? ' (Anônima)' : ''}
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
  const handleFechar = () => navigate(ROTA_LISTA)

  const handleProximo = () => {
    if (step < 5) setStep((s) => s + 1)
    else void handleSubmit()
  }

  const handleVoltar = () => {
    if (step > 1) setStep((s) => s - 1)
    else handleFechar()
  }

  if (sucesso) {
    return (
      <>
        <ModalPassoPassoGlobal
          titulo={t('bidfrete.nova_cotacao.criado_sucesso')}
          aberto
          passos={STEPS}
          passoAtual={5}
          onProximo={handleFechar}
          onVoltar={handleFechar}
          onFechar={handleFechar}
          ocultarStepper
          footerCustom={(
            <div style={ESTILOS_RESULTADO.footerAcoes}>
              <BotaoGlobal variante="fantasma" tamanho="medio" onClick={handleFechar}>
                {t('bidfrete.nova_cotacao.ver_cotacoes')}
              </BotaoGlobal>
              {cotacaoId && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="medio"
                  onClick={() => navigate(`${ROTA_LISTA}/${cotacaoId}`)}
                >
                  {t('bidfrete.nova_cotacao.ver_detalhes')}
                </BotaoGlobal>
              )}
            </div>
          )}
          tamanho="md"
        >
          <div className="nc-root" style={ESTILOS_RESULTADO.passo}>
            <div style={ESTILOS_RESULTADO.resultadoBanner}>
              <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
              <p style={ESTILOS_RESULTADO.resultadoBannerTexto}>
                {t('bidfrete.nova_cotacao.criado_desc')}
              </p>
            </div>
          </div>
        </ModalPassoPassoGlobal>
        <style>{NC_ESTILOS_CONTEUDO}</style>
      </>
    )
  }

  return (
    <>
      <ModalPassoPassoGlobal
        titulo="Nova Cotação"
        icone={<Truck weight="duotone" size={22} />}
        subtitulo="Preencha as informações para buscar as melhores opções de frete"
        aberto
        passos={STEPS}
        passoAtual={step}
        onProximo={handleProximo}
        onVoltar={handleVoltar}
        onFechar={handleFechar}
        onIrParaPasso={(id) => setStep(id)}
        podeAvancar={canNext()}
        carregando={salvando}
        textoCarregando={t('bidfrete.nova_cotacao.criando')}
        labelBotaoFinal={t('bidfrete.nova_cotacao.criar')}
        labelProximo={t('comum.proximo')}
        tamanho="2xl"
        altura="90vh"
      >
        <div className="nc-root nc-step-wrapper nc-fade-in">{renderStep()}</div>
      </ModalPassoPassoGlobal>
      <style>{NC_ESTILOS_CONTEUDO}</style>
    </>
  )
}
