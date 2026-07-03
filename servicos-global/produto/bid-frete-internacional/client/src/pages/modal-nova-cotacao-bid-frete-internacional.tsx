/**
 * modal-nova-cotacao-bid-frete-internacional.tsx — SSOT do wizard Nova Cotação (BID Frete Internacional).
 * Rota exclusiva: /bid-frete/cotacoes/nova (App.tsx). Não montar overlay em outras telas.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  Warning,
  GlobeHemisphereWest,
  SquaresFour,
  Eye,
  ShippingContainer,
  CalendarBlank,
  Hash,
  Buildings,
  TextAlignLeft,
  Tag,
  Barcode,
  Certificate,
  IdentificationCard,
  NotePencil,
  ListNumbers,
  GitBranch,
  Warehouse,
} from '@phosphor-icons/react'

import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

import { criarCotacaoComDisparo, getFornecedores } from '../shared/api'
import { formatarFeedbackDisparoBidFrete, type FeedbackDisparoFormatado } from '../shared/formatar-resultado-disparo-bid-frete-internacional'
import { idBidDoQueryParam } from '../shared/novo-bid-frete-internacional-utils'
import {
  ROTA_LISTA_BID_FRETE_INTERNACIONAL,
  buildRotaListaBidFreteComPainelAtivo,
  idPainelListaBidFreteDoQueryParam,
  rotaDetalheCotacaoBidFreteInternacional,
} from '../shared/rotas-bid-frete-internacional'
import { formatarRotuloLocalLogistico } from '../shared/formatacao-local-logistico-bid-frete-internacional'
import { rotuloContainerCadastro } from '../shared/cadastrosApi'
import {
  formatarLinhasContainersParaExibicao,
  linhaContainerCotacaoVazia,
  serializarLinhasContainersFcl,
  type LinhaContainerCotacao,
} from '../shared/containers-cotacao-bid-frete-internacional'
import { useAeroportosPorPais, useContainersCadastros, useMercadoriasPerigosasCadastros, usePaisesCadastros, usePortosPorPais } from '../shared/useCadastrosLogistica'
import { SelecaoFornecedoresDisparo, idsFornecedoresDisparoCotacaoAberta } from './selecao-fornecedores-disparo-bid-frete-internacional'
import type {
  TipoOperacao,
  ModalFrete,
  ModalidadeCarga,
  CanalDisparo,
  Fornecedor,
} from '../shared/types'
import {
  ehCodigoPaisAmericaLatina,
  prepararCamposRotaCotacaoPersistencia,
} from '../shared/rota-cotacao-bid-frete-internacional'
import { traduzirModalidadeKanbanBidFrete } from '../shared/traduzir-kanban-bid-frete-internacional'
import { useCidadesIbgeBidFreteInternacional } from '../shared/use-cidades-ibge-bid-frete-internacional'
import {
  ehMaritimoLclCotacaoBidFreteInternacional,
  sequenciaPassosWizardNovaCotacao,
  tipoPassoWizardNovaCotacao,
  type TipoPassoWizardNovaCotacao,
} from '../shared/armazenagem-lcl-maritimo-bid-frete-internacional'
import {
  INCOTERM_TODOS_NOVA_COTACAO,
  traduzirDescModalNovaCotacao,
  traduzirDescModalidadeNovaCotacao,
  traduzirDescOperacaoNovaCotacao,
  traduzirDisparoNaoConfiguradoNovaCotacao,
  traduzirDisparoNaoRealizadoNovaCotacao,
  traduzirErroCriarCotacaoNovaCotacao,
  traduzirFraseExibirCamposLocalizacao,
  traduzirIncotermExplicacaoNovaCotacao,
  traduzirLabelModalidadeNovaCotacao,
  traduzirLegendaLocalizacaoNovaCotacao,
  traduzirModalNovaCotacao,
  traduzirOpcoesSimNaoNovaCotacao,
  traduzirOpcoesUnidadeEmbalagemNovaCotacao,
  traduzirOperacaoNovaCotacao,
  traduzirPassoWizardNovaCotacao,
  traduzirRotuloArmazenagemResumoNovaCotacao,
  traduzirRotuloResumoVisibilidadeNovaCotacao,
  traduzirRotuloUnidadeEmbalagemNovaCotacao,
  traduzirTituloLocalizacaoNovaCotacao,
  traduzirTooltipIncotermNovaCotacao,
} from '../shared/traduzir-nova-cotacao-bid-frete-internacional'

const ICONES_PASSO_WIZARD: Record<TipoPassoWizardNovaCotacao, React.ReactNode> = {
  modal: <Truck weight="duotone" size={16} />,
  origem: <MapPin weight="duotone" size={16} />,
  carga: <Package weight="duotone" size={16} />,
  armazenagem: <Warehouse weight="duotone" size={16} />,
  fornecedores: <Users weight="duotone" size={16} />,
  resumo: <FileText weight="duotone" size={16} />,
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

function sufixoQuantidadeEmbalagem(codigo: string): string {
  return SUFIXO_QUANTIDADE_EMBALAGEM[codigo] ?? 'un'
}

type LadoLocalizacaoWizard = 'origem' | 'destino'

function modalExigePortoCotacao(modal: ModalFrete | ''): boolean {
  return modal === 'MARITIMO'
}

function modalExigeRodoviarioLocal(modal: ModalFrete | ''): boolean {
  return modal === 'RODOVIARIO'
}

function modalExigeAeroportoCotacao(modal: ModalFrete | ''): boolean {
  return modal === 'AEREO'
}

function localizacaoPrincipalPreenchida(
  form: FormState,
  modal: ModalFrete | '',
  lado: LadoLocalizacaoWizard,
): boolean {
  if (modalExigePortoCotacao(modal)) {
    return lado === 'origem'
      ? !!form.porto_origem_cotacao_bid_frete_internacional.trim()
      : !!form.porto_destino_cotacao_bid_frete_internacional.trim()
  }
  if (modalExigeAeroportoCotacao(modal)) {
    return lado === 'origem'
      ? !!form.aeroporto_origem_cotacao_bid_frete_internacional.trim()
      : !!form.aeroporto_destino_cotacao_bid_frete_internacional.trim()
  }
  if (modalExigeRodoviarioLocal(modal)) {
    return lado === 'origem'
      ? !!form.pais_origem_rodoviario_cotacao_bid_frete_internacional.trim()
        && !!form.cidade_origem_rodoviario_cotacao_bid_frete_internacional.trim()
      : !!form.pais_destino_rodoviario_cotacao_bid_frete_internacional.trim()
        && !!form.cidade_destino_rodoviario_cotacao_bid_frete_internacional.trim()
  }
  return false
}

function limparCamposExtrasLocalizacao(prev: FormState, lado: LadoLocalizacaoWizard): FormState {
  if (lado === 'origem') {
    return {
      ...prev,
      origem_pais_cotacao_bid_frete_internacional: '',
      origem_pais_nome: '',
      endereco_origem_cotacao_bid_frete_internacional: '',
    }
  }
  return {
    ...prev,
    destino_pais_cotacao_bid_frete_internacional: '',
    destino_pais_nome: '',
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

function limparCamposCargaPerigosa(): Pick<
  FormState,
  | 'eh_carga_perigosa_cotacao_bid_frete_internacional'
  | 'id_mercadoria_perigosa_cotacao'
  | 'numero_onu_cotacao_bid_frete_internacional'
  | 'nome_tecnico_embarque_cotacao_bid_frete_internacional'
  | 'classe_carga_perigosa_cotacao_bid_frete_internacional'
  | 'divisao_carga_perigosa_cotacao_bid_frete_internacional'
  | 'grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional'
  | 'observacoes_carga_perigosa_cotacao_bid_frete_internacional'
> {
  return {
    eh_carga_perigosa_cotacao_bid_frete_internacional: false,
    id_mercadoria_perigosa_cotacao: '',
    numero_onu_cotacao_bid_frete_internacional: '',
    nome_tecnico_embarque_cotacao_bid_frete_internacional: '',
    classe_carga_perigosa_cotacao_bid_frete_internacional: '',
    divisao_carga_perigosa_cotacao_bid_frete_internacional: '',
    grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: '',
    observacoes_carga_perigosa_cotacao_bid_frete_internacional: '',
  }
}

function limparCamposQuantidadeAoMudarModalidade(
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  modalidade: ModalidadeCarga,
) {
  setForm((prev) => ({
    ...prev,
    modalidade_cotacao_bid_frete_internacional: modalidade,
    tipo_container_cotacao_bid_frete_internacional: '',
    quantidade_volume_cotacao_bid_frete_internacional: 0,
    linhas_container_fcl_cotacao: [linhaContainerCotacaoVazia(1)],
    opcao_incluir_armazenagem_cotacao: modalidade === 'LCL' ? '' : '',
  }))
}

/** Aéreo não exige escolha de modalidade na UI — persiste AEREO_GERAL implicitamente. */
function modalidadeEfetivaNovaCotacao(form: FormState): ModalidadeCarga | '' {
  if (form.modal_cotacao_bid_frete_internacional === 'AEREO') return 'AEREO_GERAL'
  return form.modalidade_cotacao_bid_frete_internacional
}

// ─── Form State ──────────────────────────────────────────────────────────────
interface FormState {
  tipo_operacao_cotacao_bid_frete_internacional: TipoOperacao | ''
  modal_cotacao_bid_frete_internacional: ModalFrete | ''
  modalidade_cotacao_bid_frete_internacional: ModalidadeCarga | ''
  porto_origem_cotacao_bid_frete_internacional: string
  porto_destino_cotacao_bid_frete_internacional: string
  aeroporto_origem_cotacao_bid_frete_internacional: string
  aeroporto_destino_cotacao_bid_frete_internacional: string
  pais_origem_rodoviario_cotacao_bid_frete_internacional: string
  pais_destino_rodoviario_cotacao_bid_frete_internacional: string
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: string
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: string
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: string
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  origem_pais_nome: string
  destino_pais_cotacao_bid_frete_internacional: string
  destino_pais_nome: string
  exibir_campos_extras_origem_cotacao: boolean
  exibir_campos_extras_destino_cotacao: boolean
  // Carga
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string
  hs_code_cotacao_bid_frete_internacional: string
  quantidade_volume_cotacao_bid_frete_internacional: number
  tipo_container_cotacao_bid_frete_internacional: string
  /** FCL — várias linhas tipo/qtd; persistidas via serialização em tipo_container. */
  linhas_container_fcl_cotacao: LinhaContainerCotacao[]
  peso_kg_cotacao_bid_frete_internacional: string
  peso_ton_cotacao_bid_frete_internacional: string
  cubagem_m3_cotacao_bid_frete_internacional: string
  // Carga perigosa
  eh_carga_perigosa_cotacao_bid_frete_internacional: boolean
  id_mercadoria_perigosa_cotacao: string
  numero_onu_cotacao_bid_frete_internacional: string
  nome_tecnico_embarque_cotacao_bid_frete_internacional: string
  classe_carga_perigosa_cotacao_bid_frete_internacional: string
  divisao_carga_perigosa_cotacao_bid_frete_internacional: string
  grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: string
  observacoes_carga_perigosa_cotacao_bid_frete_internacional: string
  // Incoterm
  incoterm_cotacao_bid_frete_internacional: string
  zipcode_origem_cotacao_bid_frete_internacional: string
  endereco_origem_cotacao_bid_frete_internacional: string
  endereco_destino_cotacao_bid_frete_internacional: string
  zipcode_destino_cotacao_bid_frete_internacional: string
  data_limite_resposta_cotacao_bid_frete_internacional: string
  /** Marítimo LCL — '' até o comprador escolher Sim/Não no passo Armazenagem */
  opcao_incluir_armazenagem_cotacao: '' | 'sim' | 'nao'
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
  porto_origem_cotacao_bid_frete_internacional: '',
  porto_destino_cotacao_bid_frete_internacional: '',
  aeroporto_origem_cotacao_bid_frete_internacional: '',
  aeroporto_destino_cotacao_bid_frete_internacional: '',
  pais_origem_rodoviario_cotacao_bid_frete_internacional: '',
  pais_destino_rodoviario_cotacao_bid_frete_internacional: '',
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: '',
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: '',
  cidade_origem_rodoviario_cotacao_bid_frete_internacional: '',
  cidade_destino_rodoviario_cotacao_bid_frete_internacional: '',
  origem_pais_cotacao_bid_frete_internacional: '',
  origem_pais_nome: '',
  destino_pais_cotacao_bid_frete_internacional: '',
  destino_pais_nome: '',
  exibir_campos_extras_origem_cotacao: false,
  exibir_campos_extras_destino_cotacao: false,
  descricao_mercadoria_cotacao_bid_frete_internacional: '',
  ncm_cotacao_bid_frete_internacional: '',
  hs_code_cotacao_bid_frete_internacional: '',
  quantidade_volume_cotacao_bid_frete_internacional: 0,
  tipo_container_cotacao_bid_frete_internacional: '',
  linhas_container_fcl_cotacao: [linhaContainerCotacaoVazia(1)],
  peso_kg_cotacao_bid_frete_internacional: '',
  peso_ton_cotacao_bid_frete_internacional: '',
  cubagem_m3_cotacao_bid_frete_internacional: '',
  eh_carga_perigosa_cotacao_bid_frete_internacional: false,
  id_mercadoria_perigosa_cotacao: '',
  numero_onu_cotacao_bid_frete_internacional: '',
  nome_tecnico_embarque_cotacao_bid_frete_internacional: '',
  classe_carga_perigosa_cotacao_bid_frete_internacional: '',
  divisao_carga_perigosa_cotacao_bid_frete_internacional: '',
  grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: '',
  observacoes_carga_perigosa_cotacao_bid_frete_internacional: '',
  incoterm_cotacao_bid_frete_internacional: '',
  zipcode_origem_cotacao_bid_frete_internacional: '',
  endereco_origem_cotacao_bid_frete_internacional: '',
  endereco_destino_cotacao_bid_frete_internacional: '',
  zipcode_destino_cotacao_bid_frete_internacional: '',
  data_limite_resposta_cotacao_bid_frete_internacional: '',
  opcao_incluir_armazenagem_cotacao: '',
  visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
  anonima_cotacao_bid_frete_internacional: false,
  valor_meta_cotacao_bid_frete_internacional: '',
  moeda_meta_cotacao_bid_frete_internacional: 'USD',
}

function BotaoIncotermNovaCotacao({
  inc,
  selecionado,
  onSelecionar,
}: {
  inc: string
  selecionado: boolean
  onSelecionar: (inc: string) => void
}) {
  const { t } = useTranslation()
  const tt = traduzirTooltipIncotermNovaCotacao(t, inc)

  return (
    <TooltipGlobal
      titulo={tt.titulo}
      descricao={
        tt.interativo ? (
          <>
            <p>
              <strong>{t('bidfrete.nova_cotacao.incoterm_grupo_label', { defaultValue: 'Grupo' })}:</strong>{' '}
              {tt.grupo}
            </p>
            <p>{tt.desc}</p>
            <p>
              <strong>{t('bidfrete.nova_cotacao.responsabilidade', { defaultValue: 'Responsabilidade' })}:</strong>{' '}
              {tt.responsabilidade}
            </p>
          </>
        ) : (
          tt.desc
        )
      }
      interativo={tt.interativo}
      posicaoPreferida="auto"
    >
      <button
        type="button"
        aria-pressed={selecionado}
        className={[
          'nc-incoterm-btn',
          selecionado ? 'nc-incoterm-btn--selected' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => onSelecionar(inc)}
      >
        {inc}
      </button>
    </TooltipGlobal>
  )
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

// ─── Labels de seção (padrão Nova Coluna — ícone + asterisco obrigatório) ───
const ICONE_LABEL_SECAO = { size: 13, weight: 'fill' as const }
const ICONE_FIELD = ICONE_LABEL_SECAO

function NcSectionTitle({
  icone,
  children,
  obrigatorio,
}: {
  icone: React.ReactNode
  children: React.ReactNode
  obrigatorio?: boolean
}) {
  return (
    <h3 className="nc-section-title">
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="nc-obrig">*</span>}
    </h3>
  )
}

function NcSubsecaoTitle({
  id,
  icone,
  children,
  obrigatorio,
}: {
  id?: string
  icone: React.ReactNode
  children: React.ReactNode
  obrigatorio?: boolean
}) {
  return (
    <h4 id={id} className="nc-cargo-subsecao-title">
      {icone}
      <span>{children}</span>
      {obrigatorio && <span className="nc-obrig">*</span>}
    </h4>
  )
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  icone,
  children,
  className,
}: {
  label: string
  required?: boolean
  icone?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`nc-field${className ? ` ${className}` : ''}`}>
      <span className="nc-field-label">
        {icone}
        <span>{label}</span>
        {required && <span className="nc-obrig">*</span>}
      </span>
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
  const { t } = useTranslation()
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
        <span>{traduzirFraseExibirCamposLocalizacao(t, lado)}</span>
      </label>
    </div>
  )
}

const NC_ESTILOS_CONTEUDO = `
        .nc-root,
        .nc-step-wrapper,
        .nc-sucesso {
          --nc-muted: var(--ws-muted, var(--text-secondary, #94a3b8));
          /* Cards de opção — hover sutil (padrão BID Frete); selecionado alinhado ao design system */
          --nc-option-accent: var(--color-primary, #6366f1);
          --nc-option-accent-dim: rgba(99, 102, 241, 0.08);
          --nc-option-accent-border: var(--color-primary, #6366f1);
          --nc-option-focus-ring: 0 0 0 1px var(--color-primary, #6366f1);
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

        /* Prazo para respostas — calendário global + hora lado a lado.
           Campo de data com 18.75rem (300px) = largura padrão do painel do calendário (modoUnico) */
        .nc-prazo-data-hora {
          display: grid;
          grid-template-columns: 18.75rem 9rem;
          gap: 1rem;
          align-items: start;
        }
        .nc-prazo-data-hora .nc-field {
          display: grid;
          grid-template-rows: auto 2.5rem;
          gap: 0.5rem;
          align-content: start;
          min-width: 0;
        }
        .nc-prazo-data-hora .nc-field-label {
          min-height: 1.125rem;
          line-height: 1.125rem;
        }
        .nc-prazo-data-hora .nc-field > .cg-wrapper,
        .nc-prazo-data-hora .nc-field > .nc-input {
          height: 2.5rem;
          min-height: 2.5rem;
          max-height: 2.5rem;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .nc-prazo-data-hora .nc-field > .cg-wrapper {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          gap: 0;
        }
        .nc-prazo-data-hora .nc-field > .cg-wrapper > div {
          flex: 1 1 auto;
          height: 2.5rem;
          min-height: 2.5rem;
          max-height: 2.5rem;
          width: 100%;
          min-width: 0;
        }
        .nc-prazo-data-hora .sg-campo {
          height: 2.5rem;
          min-height: 2.5rem;
          max-height: 2.5rem;
          width: 100%;
          box-sizing: border-box;
        }
        .nc-prazo-data-hora .tg-trigger {
          display: block;
          width: 100%;
          height: 2.5rem;
        }
        @media (max-width: 560px) {
          .nc-prazo-data-hora {
            grid-template-columns: 1fr;
          }
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
          gap: 0.4rem;
        }
        .nc-section-title svg {
          color: #94a3b8;
          flex-shrink: 0;
        }
        .nc-section-title:first-child {
          margin-top: 0;
        }

        .nc-obrig {
          color: var(--color-danger, #f87171);
          margin-left: 0.125rem;
        }

        /* ── Grids de Cards de Opções ── */
        .nc-options-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px;
          margin-bottom: 1.25rem;
        }
        .nc-options-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 720px) {
          .nc-options-grid-3 {
            grid-template-columns: 1fr;
          }
        }
        .nc-options-grid-2:last-child,
        .nc-options-grid-3:last-child,
        .nc-options-grid-full:last-child {
          margin-bottom: 0;
        }

        .nc-options-grid-full {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-bottom: 1.25rem;
        }

        /* Botão de Opção — repouso/hover sutil; selecionado com ring roxo */
        .nc-option-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--color-text-primary, #f1f5f9);
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
          border-color: var(--nc-option-accent-border);
          box-shadow: var(--nc-option-focus-ring);
        }
        .nc-option-btn--selected:hover {
          border-color: var(--nc-option-accent-border);
          background: rgba(99, 102, 241, 0.12);
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
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 8px;
          background: var(--color-surface-hover, #334155);
          color: var(--color-text-muted, #94a3b8);
          transition: background-color 0.15s, color 0.15s;
        }
        .nc-option-btn--selected .nc-option-icon {
          background: rgba(99, 102, 241, 0.18);
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
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary, #f1f5f9);
          line-height: 1.3;
        }
        .nc-option-desc {
          font-size: 11px;
          color: var(--color-text-muted, #94a3b8);
          line-height: 1.3;
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
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .nc-cargo-subsecao-title svg {
          color: #94a3b8;
          flex-shrink: 0;
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
        .nc-cargo-perigosa-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          align-items: start;
        }
        .nc-cargo-perigosa-grid .nc-field {
          display: grid;
          grid-template-rows: auto 2.5rem;
          gap: 0.5rem;
          align-content: start;
          min-width: 0;
        }
        .nc-cargo-perigosa-grid .nc-field-label {
          min-height: 1.125rem;
          line-height: 1.125rem;
        }
        .nc-cargo-perigosa-grid .nc-field > .sg-wrapper-inner,
        .nc-cargo-perigosa-grid .nc-field > .nc-input {
          height: 2.5rem;
          min-height: 2.5rem;
          max-height: 2.5rem;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .nc-cargo-perigosa-grid .nc-field > .sg-wrapper-inner {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .nc-cargo-perigosa-grid .sg-campo {
          flex: 1 1 auto;
          height: 2.5rem;
          min-height: 2.5rem;
          max-height: 2.5rem;
          min-width: 0;
          box-sizing: border-box;
          overflow: hidden;
          gap: 0.375rem;
        }
        .nc-cargo-perigosa-grid .sg-valor {
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
        }
        .nc-cargo-perigosa-grid .sg-valor-selecionado,
        .nc-cargo-perigosa-grid .sg-placeholder {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nc-cargo-perigosa-grid .sg-acoes {
          flex-shrink: 0;
        }
        .nc-cargo-perigosa-grid .nc-input.nc-textarea {
          resize: none;
          overflow-y: auto;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          line-height: 1.25;
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
        .nc-cargo-subsecao-grid-quantidade .nc-field {
          display: grid;
          grid-template-rows: auto minmax(2.5rem, auto);
          gap: 0.5rem;
          align-content: start;
        }
        .nc-cargo-subsecao-grid-quantidade .nc-field-label {
          min-height: 1.125rem;
          line-height: 1.125rem;
        }
        .nc-cargo-subsecao-grid-quantidade .nc-field > .sg-wrapper-inner {
          width: 100%;
        }
        .nc-cargo-subsecao-grid-quantidade .sg-campo,
        .nc-cargo-subsecao-grid-quantidade .nc-input-group {
          min-height: 2.5rem;
          box-sizing: border-box;
        }
        .nc-cargo-subsecao-grid-quantidade .nc-input-group .nc-input {
          height: 100%;
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
          .nc-cargo-perigosa-grid {
            grid-template-columns: 1fr 1fr;
          }
          .nc-cargo-subsecao-grid-quantidade,
          .nc-cargo-subsecao-grid-quantidade--embalagem {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 560px) {
          .nc-cargo-subsecao-grid-identificacao,
          .nc-cargo-perigosa-grid,
          .nc-cargo-subsecao-grid-quantidade,
          .nc-cargo-subsecao-grid-quantidade--embalagem,
          .nc-linha-container-row {
            grid-template-columns: 1fr;
          }
        }

        .nc-field > .nc-campo-ncm .cg-wrapper {
          gap: 0;
        }

        /* SelectNcmGlobal alinhado ao padrão nc-field / nc-input desta tela */
        .nc-campo-ncm {
          min-width: 0;
        }
        .nc-campo-ncm .cg-wrapper {
          gap: 0.5rem;
        }
        .nc-campo-ncm--label-externo .cg-label {
          display: none;
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
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--nc-muted);
        }
        .nc-field-label svg {
          color: #94a3b8;
          flex-shrink: 0;
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

        /* ── Origem e Destino — repouso = nc-option-btn; selecionado = nc-option-btn--selected ── */
        .nc-location-visual-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md, 12px);
          padding: 1.5rem 1.75rem;
          margin-top: 0.75rem;
          transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .nc-location-visual-card--selected {
          background: var(--nc-option-accent-dim);
          border: 1.5px solid var(--nc-option-accent-border);
          box-shadow: var(--nc-option-focus-ring);
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
          flex-shrink: 0;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.25);
          color: var(--nc-muted);
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        }
        .nc-location-visual-card--selected .nc-location-visual-circle {
          background: color-mix(in srgb, var(--nc-option-accent) 20%, transparent);
          border-color: var(--nc-option-accent);
          color: var(--nc-option-accent);
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
        .nc-location-visual-card--selected .nc-pulsing-icon,
        .nc-location-visual-card--selected .nc-pulsing-icon-dest {
          border-radius: 50%;
          animation: nc-pulse 2s infinite;
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

        /* ── Incoterms (linha única — todos lado a lado, tooltip por termo) ── */
        .nc-incoterm-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: stretch;
          width: 100%;
        }
        .nc-incoterm-grid .tg-trigger {
          display: inline-flex;
          flex: 0 0 auto;
        }
        .nc-incoterm-btn {
          padding: 0.5rem 0.35rem;
          min-width: 3.25rem;
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
        .nc-incoterm-btn:hover {
          border-color: var(--nc-accent);
          color: var(--text-primary, #f1f5f9);
        }
        .nc-incoterm-btn--selected {
          background: var(--nc-accent-dim);
          border-color: var(--nc-accent);
          color: var(--nc-accent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--nc-accent) 35%, transparent);
        }

        .nc-incoterm-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nc-incoterm-helper-card {
          background: var(--nc-accent-dim);
          border: 1px solid var(--nc-accent-border);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          margin-top: 0;
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
  const addNotification = useShellStore(s => s.addNotification)
  const [searchParams] = useSearchParams()
  const idBid = idBidDoQueryParam(searchParams.get('id_bid'))
  const idPainelLista = idPainelListaBidFreteDoQueryParam(searchParams.get('id_painel_lista'))
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [feedbackDisparoCriacao, setFeedbackDisparoCriacao] = useState<FeedbackDisparoFormatado | null>(null)
  const [cotacaoId, setCotacaoId] = useState<string | null>(null)
  const [fornecedoresAtivos, setFornecedoresAtivos] = useState<Fornecedor[]>([])
  const [carregandoFornecedores, setCarregandoFornecedores] = useState(false)
  const [fornecedorIdsSelecionados, setFornecedorIdsSelecionados] = useState<string[]>([])
  const [fornecedorIdsExcluidosDisparo, setFornecedorIdsExcluidosDisparo] = useState<string[]>([])
  const [canaisDisparo, setCanaisDisparo] = useState<CanalDisparo[]>(['EMAIL'])
  const [emailsPorFornecedorDisparo, setEmailsPorFornecedorDisparo] = useState<Record<string, string[]>>({})
  const proximoIdLinhaContainerRef = useRef(2)

  useEffect(() => {
    const passoFornecedores = sequenciaPassosWizardNovaCotacao(
      form.modal_cotacao_bid_frete_internacional,
      form.modalidade_cotacao_bid_frete_internacional,
    ).indexOf('fornecedores') + 1
    if (step !== passoFornecedores) return
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
  }, [step, form.visibilidade_cotacao_bid_frete_internacional, form.modal_cotacao_bid_frete_internacional, form.modalidade_cotacao_bid_frete_internacional])

  useEffect(() => {
    setFornecedorIdsExcluidosDisparo([])
    if (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') {
      setFornecedorIdsSelecionados([])
    }
  }, [form.visibilidade_cotacao_bid_frete_internacional])

  useEffect(() => {
    if (step !== 4 || form.visibilidade_cotacao_bid_frete_internacional !== 'DIRECIONADA') return
    if (carregandoFornecedores || fornecedoresAtivos.length === 0) return
    if (fornecedorIdsSelecionados.length === 0) {
      setFornecedorIdsSelecionados(
        fornecedoresAtivos.map(f => f.id_fornecedor_bid_frete_internacional),
      )
    }
  }, [
    step,
    form.visibilidade_cotacao_bid_frete_internacional,
    carregandoFornecedores,
    fornecedoresAtivos,
    fornecedorIdsSelecionados.length,
  ])

  const { paises: paisesCadastro, opcoes: opcoesPaises, carregando: carregandoPaises } = usePaisesCadastros()
  const opcoesPaisesLatam = React.useMemo(
    () => opcoesPaises.filter((o) => ehCodigoPaisAmericaLatina(String(o.valor))),
    [opcoesPaises],
  )
  const ufOrigemRodoviario = form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional
  const ufDestinoRodoviario = form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional
  const { cidades: cidadesOrigemRodoviario, carregando: carregandoCidadesOrigemRodoviario } =
    useCidadesIbgeBidFreteInternacional(
      form.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? ufOrigemRodoviario : '',
    )
  const { cidades: cidadesDestinoRodoviario, carregando: carregandoCidadesDestinoRodoviario } =
    useCidadesIbgeBidFreteInternacional(
      form.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? ufDestinoRodoviario : '',
    )
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
  const {
    mercadorias: mercadoriasPerigosasCadastro,
    opcoes: opcoesMercadoriasPerigosas,
    carregando: carregandoMercadoriasPerigosas,
  } = useMercadoriasPerigosasCadastros(form.eh_carga_perigosa_cotacao_bid_frete_internacional)

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
      return porto ? formatarRotuloLocalLogistico(porto.nome_porto, codigo) : codigo
    },
    [],
  )

  const rotuloAeroporto = useCallback(
    (iata: string, aeroportos: typeof aeroportosOrigem) => {
      const aeroporto = aeroportos.find((a) => a.codigo_iata_aeroporto === iata)
      return aeroporto ? formatarRotuloLocalLogistico(aeroporto.nome_aeroporto, iata) : iata
    },
    [],
  )

  const aoMudarPaisOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      origem_pais_cotacao_bid_frete_internacional: codigo,
      origem_pais_nome: codigo ? rotuloPais(codigo) : '',
    }))
  }

  const aoMudarPaisDestino = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      destino_pais_cotacao_bid_frete_internacional: codigo,
      destino_pais_nome: codigo ? rotuloPais(codigo) : '',
    }))
  }

  const aoMudarPaisOrigemRodoviario = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      pais_origem_rodoviario_cotacao_bid_frete_internacional: codigo,
      estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: '',
      cidade_origem_rodoviario_cotacao_bid_frete_internacional: '',
    }))
  }

  const aoMudarPaisDestinoRodoviario = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    setForm((prev) => ({
      ...prev,
      pais_destino_rodoviario_cotacao_bid_frete_internacional: codigo,
      estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: '',
      cidade_destino_rodoviario_cotacao_bid_frete_internacional: '',
    }))
  }

  const aoMudarPortoOrigem = (valor: string | number | null) => {
    const codigo = String(valor ?? '')
    const porto = portosOrigem.find((p) => p.codigo_unlocode_porto === codigo)
    setForm((prev) => ({
      ...prev,
      porto_origem_cotacao_bid_frete_internacional: codigo,
      ...(porto?.codigo_pais_porto
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
      porto_destino_cotacao_bid_frete_internacional: codigo,
      ...(porto?.codigo_pais_porto
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
      ...(aeroporto?.codigo_pais_aeroporto
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
      ...(aeroporto?.codigo_pais_aeroporto
        ? {
            destino_pais_cotacao_bid_frete_internacional: aeroporto.codigo_pais_aeroporto,
            destino_pais_nome: rotuloPais(aeroporto.codigo_pais_aeroporto),
          }
        : {}),
    }))
  }

  // Carregar containers — SSOT Cadastros via useContainersCadastros

  const modal = form.modal_cotacao_bid_frete_internacional
  const modalidade = modalidadeEfetivaNovaCotacao(form)
  const exigeContainerFcl = modal === 'MARITIMO' && modalidade === 'FCL'
  const opcoesEmbalagem = useMemo(
    () => traduzirOpcoesUnidadeEmbalagemNovaCotacao(t),
    [t],
  )
  const opcoesIncluirArmazenagem = useMemo(
    () => traduzirOpcoesSimNaoNovaCotacao(t),
    [t],
  )
  const passosWizard = useMemo(
    () =>
      sequenciaPassosWizardNovaCotacao(modal, form.modalidade_cotacao_bid_frete_internacional).map(
        (tipo, index) => ({
          id: index + 1,
          label: traduzirPassoWizardNovaCotacao(t, tipo),
          icone: ICONES_PASSO_WIZARD[tipo],
        }),
      ),
    [modal, form.modalidade_cotacao_bid_frete_internacional, t],
  )
  const totalPassos = passosWizard.length
  const tipoPassoAtual = tipoPassoWizardNovaCotacao(
    step,
    modal,
    form.modalidade_cotacao_bid_frete_internacional,
  )

  useEffect(() => {
    if (step > totalPassos) {
      setStep(totalPassos)
    }
  }, [step, totalPassos])

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

  const aoMudarNcm = (codigo: string, descricao?: string) => {
    set('ncm_cotacao_bid_frete_internacional', codigo)
    if (descricao) {
      set('descricao_mercadoria_cotacao_bid_frete_internacional', limparHtmlNcm(descricao))
    }
  }

  const aoMudarEhCargaPerigosa = (marcado: boolean) => {
    setForm((prev) => ({
      ...prev,
      eh_carga_perigosa_cotacao_bid_frete_internacional: marcado,
      ...(marcado
        ? {}
        : {
            id_mercadoria_perigosa_cotacao: '',
            numero_onu_cotacao_bid_frete_internacional: '',
            nome_tecnico_embarque_cotacao_bid_frete_internacional: '',
            classe_carga_perigosa_cotacao_bid_frete_internacional: '',
            divisao_carga_perigosa_cotacao_bid_frete_internacional: '',
            grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: '',
            observacoes_carga_perigosa_cotacao_bid_frete_internacional: '',
          }),
    }))
  }

  const aoMudarMercadoriaPerigosa = (valor: string | number | null) => {
    const id = String(valor ?? '')
    const mercadoria = mercadoriasPerigosasCadastro.find((m) => m.id_mercadoria_perigosa === id)
    setForm((prev) => ({
      ...prev,
      id_mercadoria_perigosa_cotacao: id,
      numero_onu_cotacao_bid_frete_internacional: mercadoria?.numero_onu_mercadoria_perigosa ?? '',
      nome_tecnico_embarque_cotacao_bid_frete_internacional:
        mercadoria?.nome_tecnico_embarque_mercadoria_perigosa ?? '',
      classe_carga_perigosa_cotacao_bid_frete_internacional: mercadoria
        ? String(mercadoria.classe_mercadoria_perigosa)
        : '',
      divisao_carga_perigosa_cotacao_bid_frete_internacional:
        mercadoria?.divisao_mercadoria_perigosa ?? '',
      grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional:
        mercadoria?.grupo_embalagem_mercadoria_perigosa ?? '',
    }))
  }

  const renderizarMercadoriaPerigosaNoGatilho = (opcao: SelectOpcao | SelectOpcao[]) => {
    const selecionada = Array.isArray(opcao) ? opcao[0] : opcao
    if (!selecionada) return null
    const mercadoria = mercadoriasPerigosasCadastro.find(
      (m) => m.id_mercadoria_perigosa === String(selecionada.valor),
    )
    const textoGatilho = mercadoria
      ? `UN ${mercadoria.numero_onu_mercadoria_perigosa}`
      : selecionada.rotulo
    return (
      <span className="sg-valor-selecionado" title={selecionada.rotulo}>
        {textoGatilho}
      </span>
    )
  }

  const canNext = (): boolean => {
    switch (tipoPassoAtual) {
      case 'modal': {
        if (!form.tipo_operacao_cotacao_bid_frete_internacional || !form.modal_cotacao_bid_frete_internacional) {
          return false
        }
        if (form.modal_cotacao_bid_frete_internacional === 'AEREO') return true
        return !!form.modalidade_cotacao_bid_frete_internacional
      }
      case 'origem': {
        const origemOk = modalExigePortoCotacao(modal)
          ? !!form.porto_origem_cotacao_bid_frete_internacional
          : modalExigeAeroportoCotacao(modal)
            ? !!form.aeroporto_origem_cotacao_bid_frete_internacional
            : modalExigeRodoviarioLocal(modal)
              ? !!form.pais_origem_rodoviario_cotacao_bid_frete_internacional
                && !!form.cidade_origem_rodoviario_cotacao_bid_frete_internacional
              : true
        const destinoOk = modalExigePortoCotacao(modal)
          ? !!form.porto_destino_cotacao_bid_frete_internacional
          : modalExigeAeroportoCotacao(modal)
            ? !!form.aeroporto_destino_cotacao_bid_frete_internacional
            : modalExigeRodoviarioLocal(modal)
              ? !!form.pais_destino_rodoviario_cotacao_bid_frete_internacional
                && !!form.cidade_destino_rodoviario_cotacao_bid_frete_internacional
              : true
        return origemOk && destinoOk
      }
      case 'carga': {
        const base = !!form.descricao_mercadoria_cotacao_bid_frete_internacional
          && !!form.incoterm_cotacao_bid_frete_internacional
        const perigosaOk = !form.eh_carga_perigosa_cotacao_bid_frete_internacional
          || (
            !!form.numero_onu_cotacao_bid_frete_internacional
            && !!form.nome_tecnico_embarque_cotacao_bid_frete_internacional
            && !!form.classe_carga_perigosa_cotacao_bid_frete_internacional
            && (
              ['1', '2', '7'].includes(form.classe_carga_perigosa_cotacao_bid_frete_internacional)
              || !!form.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional
            )
          )
        if (exigeContainerFcl) {
          return (
            base
            && perigosaOk
            && form.linhas_container_fcl_cotacao.length > 0
            && form.linhas_container_fcl_cotacao.every(
              (l) => !!l.tipo_container.trim() && l.quantidade > 0,
            )
          )
        }
        return (
          base
          && perigosaOk
          && !!form.tipo_container_cotacao_bid_frete_internacional
          && form.quantidade_volume_cotacao_bid_frete_internacional > 0
        )
      }
      case 'armazenagem':
        return form.opcao_incluir_armazenagem_cotacao === 'sim'
          || form.opcao_incluir_armazenagem_cotacao === 'nao'
      case 'fornecedores':
        if (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA') return true
        return fornecedorIdsSelecionados.length > 0
      case 'resumo': return true
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSalvando(true)
    try {
      const rotaPersistencia = prepararCamposRotaCotacaoPersistencia(
        {
          modal_cotacao_bid_frete_internacional: form.modal_cotacao_bid_frete_internacional as ModalFrete,
          porto_origem_cotacao_bid_frete_internacional: form.porto_origem_cotacao_bid_frete_internacional || null,
          porto_destino_cotacao_bid_frete_internacional: form.porto_destino_cotacao_bid_frete_internacional || null,
          aeroporto_origem_cotacao_bid_frete_internacional: form.aeroporto_origem_cotacao_bid_frete_internacional || null,
          aeroporto_destino_cotacao_bid_frete_internacional: form.aeroporto_destino_cotacao_bid_frete_internacional || null,
          pais_origem_rodoviario_cotacao_bid_frete_internacional: form.pais_origem_rodoviario_cotacao_bid_frete_internacional || null,
          pais_destino_rodoviario_cotacao_bid_frete_internacional: form.pais_destino_rodoviario_cotacao_bid_frete_internacional || null,
          estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional:
            form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional || null,
          estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional:
            form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional || null,
          cidade_origem_rodoviario_cotacao_bid_frete_internacional:
            form.cidade_origem_rodoviario_cotacao_bid_frete_internacional || null,
          cidade_destino_rodoviario_cotacao_bid_frete_internacional:
            form.cidade_destino_rodoviario_cotacao_bid_frete_internacional || null,
        },
        { portos: [...portosOrigem, ...portosDestino], aeroportos: [...aeroportosOrigem, ...aeroportosDestino] },
      )

      const containersPersistidos = exigeContainerFcl
        ? serializarLinhasContainersFcl(form.linhas_container_fcl_cotacao)
        : {
            tipo_container_cotacao_bid_frete_internacional: form.tipo_container_cotacao_bid_frete_internacional,
            quantidade_volume_cotacao_bid_frete_internacional: form.quantidade_volume_cotacao_bid_frete_internacional,
          }

      const idsDisparoAberta = idsFornecedoresDisparoCotacaoAberta(
        fornecedoresAtivos,
        fornecedorIdsExcluidosDisparo,
      )

      const pretendiaDisparar = canaisDisparo.length > 0
        && (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA'
          ? idsDisparoAberta.length > 0
          : fornecedorIdsSelecionados.length > 0)

      const { cotacao, disparo, disparo_erro } = await criarCotacaoComDisparo({
        tipo_operacao_cotacao_bid_frete_internacional: form.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao,
        modal_cotacao_bid_frete_internacional: form.modal_cotacao_bid_frete_internacional as ModalFrete,
        modalidade_cotacao_bid_frete_internacional: modalidadeEfetivaNovaCotacao(form) as ModalidadeCarga,
        porto_origem_cotacao_bid_frete_internacional: form.porto_origem_cotacao_bid_frete_internacional || undefined,
        porto_destino_cotacao_bid_frete_internacional: form.porto_destino_cotacao_bid_frete_internacional || undefined,
        aeroporto_origem_cotacao_bid_frete_internacional: form.aeroporto_origem_cotacao_bid_frete_internacional || undefined,
        aeroporto_destino_cotacao_bid_frete_internacional: form.aeroporto_destino_cotacao_bid_frete_internacional || undefined,
        pais_origem_rodoviario_cotacao_bid_frete_internacional: form.pais_origem_rodoviario_cotacao_bid_frete_internacional || undefined,
        pais_destino_rodoviario_cotacao_bid_frete_internacional: form.pais_destino_rodoviario_cotacao_bid_frete_internacional || undefined,
        estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional:
          form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional || undefined,
        estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional:
          form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional || undefined,
        cidade_origem_rodoviario_cotacao_bid_frete_internacional:
          form.cidade_origem_rodoviario_cotacao_bid_frete_internacional || undefined,
        cidade_destino_rodoviario_cotacao_bid_frete_internacional:
          form.cidade_destino_rodoviario_cotacao_bid_frete_internacional || undefined,
        origem_codigo_cotacao_bid_frete_internacional: rotaPersistencia.origem_codigo_cotacao_bid_frete_internacional,
        origem_nome_cotacao_bid_frete_internacional: rotaPersistencia.origem_nome_cotacao_bid_frete_internacional,
        origem_pais_cotacao_bid_frete_internacional: rotaPersistencia.origem_pais_cotacao_bid_frete_internacional,
        destino_codigo_cotacao_bid_frete_internacional: rotaPersistencia.destino_codigo_cotacao_bid_frete_internacional,
        destino_nome_cotacao_bid_frete_internacional: rotaPersistencia.destino_nome_cotacao_bid_frete_internacional,
        destino_pais_cotacao_bid_frete_internacional: rotaPersistencia.destino_pais_cotacao_bid_frete_internacional,
        descricao_mercadoria_cotacao_bid_frete_internacional: form.descricao_mercadoria_cotacao_bid_frete_internacional,
        ncm_cotacao_bid_frete_internacional: form.ncm_cotacao_bid_frete_internacional || undefined,
        quantidade_volume_cotacao_bid_frete_internacional: containersPersistidos.quantidade_volume_cotacao_bid_frete_internacional,
        tipo_container_cotacao_bid_frete_internacional:
          containersPersistidos.tipo_container_cotacao_bid_frete_internacional || undefined,
        peso_kg_cotacao_bid_frete_internacional: form.peso_kg_cotacao_bid_frete_internacional ? parseFloat(form.peso_kg_cotacao_bid_frete_internacional) : undefined,
        peso_ton_cotacao_bid_frete_internacional: form.peso_ton_cotacao_bid_frete_internacional ? parseFloat(form.peso_ton_cotacao_bid_frete_internacional) : undefined,
        cubagem_m3_cotacao_bid_frete_internacional: form.cubagem_m3_cotacao_bid_frete_internacional ? parseFloat(form.cubagem_m3_cotacao_bid_frete_internacional) : undefined,
        incoterm_cotacao_bid_frete_internacional: form.incoterm_cotacao_bid_frete_internacional,
        endereco_origem_cotacao_bid_frete_internacional: exibirCamposExtrasLocalizacao(form, 'origem')
          ? form.endereco_origem_cotacao_bid_frete_internacional.trim() || undefined
          : undefined,
        endereco_destino_cotacao_bid_frete_internacional: exibirCamposExtrasLocalizacao(form, 'destino')
          ? form.endereco_destino_cotacao_bid_frete_internacional.trim() || undefined
          : undefined,
        visibilidade_cotacao_bid_frete_internacional: form.visibilidade_cotacao_bid_frete_internacional,
        anonima_cotacao_bid_frete_internacional: form.anonima_cotacao_bid_frete_internacional,
        valor_meta_cotacao_bid_frete_internacional: form.valor_meta_cotacao_bid_frete_internacional
          ? parseFloat(form.valor_meta_cotacao_bid_frete_internacional)
          : undefined,
        moeda_meta_cotacao_bid_frete_internacional: form.moeda_meta_cotacao_bid_frete_internacional,
        eh_carga_perigosa_cotacao_bid_frete_internacional: form.eh_carga_perigosa_cotacao_bid_frete_internacional,
        incluir_armazenagem_cotacao_bid_frete_internacional: ehMaritimoLclCotacaoBidFreteInternacional(
          form.modal_cotacao_bid_frete_internacional,
          modalidadeEfetivaNovaCotacao(form),
        )
          ? form.opcao_incluir_armazenagem_cotacao === 'sim'
          : false,
        ...(form.eh_carga_perigosa_cotacao_bid_frete_internacional
          ? {
              numero_onu_cotacao_bid_frete_internacional: form.numero_onu_cotacao_bid_frete_internacional,
              nome_tecnico_embarque_cotacao_bid_frete_internacional: form.nome_tecnico_embarque_cotacao_bid_frete_internacional,
              classe_carga_perigosa_cotacao_bid_frete_internacional: Number(form.classe_carga_perigosa_cotacao_bid_frete_internacional),
              divisao_carga_perigosa_cotacao_bid_frete_internacional: form.divisao_carga_perigosa_cotacao_bid_frete_internacional || undefined,
              grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional: (
                form.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional || undefined
              ) as 'I' | 'II' | 'III' | undefined,
              observacoes_carga_perigosa_cotacao_bid_frete_internacional: form.observacoes_carga_perigosa_cotacao_bid_frete_internacional || undefined,
            }
          : {}),
        // Form guarda "YYYY-MM-DDTHH:mm" (sem timezone) — converter para ISO completo exigido pelo z.string().datetime() do backend
        data_limite_resposta_cotacao_bid_frete_internacional: form.data_limite_resposta_cotacao_bid_frete_internacional
          ? new Date(form.data_limite_resposta_cotacao_bid_frete_internacional).toISOString()
          : undefined,
        id_bid_bid_frete_internacional: idBid ?? undefined,
        fornecedor_ids: form.visibilidade_cotacao_bid_frete_internacional === 'DIRECIONADA'
          ? fornecedorIdsSelecionados
          : form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA'
            ? idsDisparoAberta
            : undefined,
        disparar_ao_criar: canaisDisparo.length > 0
          && (form.visibilidade_cotacao_bid_frete_internacional === 'ABERTA'
            ? idsDisparoAberta.length > 0
            : fornecedorIdsSelecionados.length > 0),
        canais_disparo: canaisDisparo,
        emails_por_fornecedor: Object.keys(emailsPorFornecedorDisparo).length > 0
          ? emailsPorFornecedorDisparo
          : undefined,
      })
      const feedback = formatarFeedbackDisparoBidFrete(
        pretendiaDisparar ? disparo : null,
        { disparoErro: disparo_erro },
      )
      if (pretendiaDisparar) {
        setFeedbackDisparoCriacao(feedback)
        addNotification({
          type: feedback.tipo === 'sucesso' ? 'success' : feedback.tipo === 'parcial' ? 'warning' : 'error',
          message: `${feedback.titulo} — ${feedback.detalhe}`,
          duration: feedback.tipo === 'erro' ? 8000 : 6000,
        })
      } else if (canaisDisparo.length === 0) {
        setFeedbackDisparoCriacao({
          tipo: 'erro',
          ...traduzirDisparoNaoConfiguradoNovaCotacao(t),
        })
      } else {
        setFeedbackDisparoCriacao({
          tipo: 'erro',
          ...traduzirDisparoNaoRealizadoNovaCotacao(t),
        })
      }
      setCotacaoId(cotacao.id_cotacao_bid_frete_internacional)
      setSucesso(true)
    } catch (err) {
      console.error('Erro ao criar cotação:', err)
      alert(
        traduzirErroCriarCotacaoNovaCotacao(
          t,
          err instanceof Error ? err.message : String(err),
        ),
      )
    } finally {
      setSalvando(false)
    }
  }

  // ─── Step Content ─────────────────────────────────────────────────────
  const renderStep = () => {
    switch (tipoPassoAtual) {
      // STEP — Modal e Operação
      case 'modal':
        return (
          <div className="nc-step-content">
            <NcSectionTitle icone={<GlobeHemisphereWest {...ICONE_LABEL_SECAO} />} obrigatorio>
              {t('bidfrete.nova_cotacao.tipo_operacao')}
            </NcSectionTitle>
            <div className="nc-options-grid-2">
              {(['IMPORTACAO', 'EXPORTACAO'] as TipoOperacao[]).map(op => (
                <OptionButton
                  key={op}
                  selected={form.tipo_operacao_cotacao_bid_frete_internacional === op}
                  onClick={() => {
                    set('tipo_operacao_cotacao_bid_frete_internacional', op)
                  }}
                  icon={op === 'IMPORTACAO' ? <DownloadSimple weight="duotone" size={24} /> : <Export weight="duotone" size={24} />}
                  label={traduzirOperacaoNovaCotacao(t, op)}
                  description={traduzirDescOperacaoNovaCotacao(t, op)}
                />
              ))}
            </div>

            <NcSectionTitle icone={<ShippingContainer {...ICONE_LABEL_SECAO} />} obrigatorio>
              {t('bidfrete.nova_cotacao.modal_frete')}
            </NcSectionTitle>
            <div className="nc-options-grid-3">
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'MARITIMO'}
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    modal_cotacao_bid_frete_internacional: 'MARITIMO',
                    modalidade_cotacao_bid_frete_internacional: '',
                    opcao_incluir_armazenagem_cotacao: '',
                    ...limparCamposCargaPerigosa(),
                  }))
                }}
                icon={<Anchor weight="duotone" size={24} />}
                label={traduzirModalNovaCotacao(t, 'MARITIMO')}
                description={traduzirDescModalNovaCotacao(t, 'MARITIMO')}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'AEREO'}
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    modal_cotacao_bid_frete_internacional: 'AEREO',
                    modalidade_cotacao_bid_frete_internacional: 'AEREO_GERAL',
                    opcao_incluir_armazenagem_cotacao: '',
                    tipo_container_cotacao_bid_frete_internacional: '',
                    quantidade_volume_cotacao_bid_frete_internacional: 0,
                    linhas_container_fcl_cotacao: [linhaContainerCotacaoVazia(1)],
                    ...limparCamposCargaPerigosa(),
                  }))
                }}
                icon={<AirplaneTilt weight="duotone" size={24} />}
                label={traduzirModalNovaCotacao(t, 'AEREO')}
                description={traduzirDescModalNovaCotacao(t, 'AEREO')}
              />
              <OptionButton
                selected={form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO'}
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    modal_cotacao_bid_frete_internacional: 'RODOVIARIO',
                    modalidade_cotacao_bid_frete_internacional: '',
                    opcao_incluir_armazenagem_cotacao: '',
                    ...limparCamposCargaPerigosa(),
                  }))
                }}
                icon={<Truck weight="duotone" size={24} />}
                label={traduzirModalNovaCotacao(t, 'RODOVIARIO')}
                description={traduzirDescModalNovaCotacao(t, 'RODOVIARIO')}
              />
            </div>

            {form.modal_cotacao_bid_frete_internacional !== 'AEREO' && (
              <>
                <NcSectionTitle icone={<SquaresFour {...ICONE_LABEL_SECAO} />} obrigatorio>
                  {t('bidfrete.nova_cotacao.modalidade')}
                </NcSectionTitle>
                <div className="nc-options-grid-2">
                  {!form.modal_cotacao_bid_frete_internacional && (
                    <div className="nc-empty-hint">
                      <Info size={18} weight="duotone" />
                      <p>{t('bidfrete.nova_cotacao.selecionar_modal_primeiro')}</p>
                    </div>
                  )}
                  {form.modal_cotacao_bid_frete_internacional === 'MARITIMO' && (
                    <>
                      <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'FCL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'FCL')} icon={<Package weight="duotone" size={22} />} label={traduzirLabelModalidadeNovaCotacao(t, 'FCL')} description={traduzirDescModalidadeNovaCotacao(t, 'FCL')} />
                      <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'LCL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'LCL')} icon={<Package weight="duotone" size={22} />} label={traduzirLabelModalidadeNovaCotacao(t, 'LCL')} description={traduzirDescModalidadeNovaCotacao(t, 'LCL')} />
                    </>
                  )}
                  {form.modal_cotacao_bid_frete_internacional === 'RODOVIARIO' && (
                    <>
                      <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_FTL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'RODOVIARIO_FTL')} icon={<Van weight="duotone" size={22} />} label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_FTL')} description={traduzirDescModalidadeNovaCotacao(t, 'RODOVIARIO_FTL')} />
                      <OptionButton selected={form.modalidade_cotacao_bid_frete_internacional === 'RODOVIARIO_LTL'} onClick={() => limparCamposQuantidadeAoMudarModalidade(setForm, 'RODOVIARIO_LTL')} icon={<Van weight="duotone" size={22} />} label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_LTL')} description={traduzirDescModalidadeNovaCotacao(t, 'RODOVIARIO_LTL')} />
                    </>
                  )}
                </div>
              </>
            )}

            <NcSectionTitle icone={<Warning {...ICONE_LABEL_SECAO} />}>
              {t('bidfrete.nova_cotacao.carga_perigosa_secao', { defaultValue: 'Carga perigosa' })}
            </NcSectionTitle>
            <div className="nc-options-grid-full">
              <OptionButton
                selected={form.eh_carga_perigosa_cotacao_bid_frete_internacional}
                onClick={() => aoMudarEhCargaPerigosa(!form.eh_carga_perigosa_cotacao_bid_frete_internacional)}
                icon={<Warning weight="duotone" size={22} />}
                label={t('bidfrete.nova_cotacao.carga_perigosa_label', { defaultValue: 'Carga Perigosa' })}
                description={t('bidfrete.nova_cotacao.carga_perigosa_desc', {
                  defaultValue:
                    'Mercadoria classificada ONU (IMDG / ADR / IATA DGR). Informe o número ONU no passo Carga.',
                })}
              />
            </div>
          </div>
        )

      // STEP — Origem e Destino
      case 'origem': {
        const exibirExtrasOrigem = exibirCamposExtrasLocalizacao(form, 'origem')
        const exibirExtrasDestino = exibirCamposExtrasLocalizacao(form, 'destino')
        const exigePorto = modalExigePortoCotacao(modal)
        const exigeAeroporto = modalExigeAeroportoCotacao(modal)
        const origemPreenchida = localizacaoPrincipalPreenchida(form, modal, 'origem')
        const destinoPreenchido = localizacaoPrincipalPreenchida(form, modal, 'destino')
        const exigeRodoviario = modalExigeRodoviarioLocal(modal)
        const tipoLocal = exigeAeroporto ? 'aeroporto' : exigePorto ? 'porto' : 'rodoviario'
        const legendaOrigem = traduzirLegendaLocalizacaoNovaCotacao(t, 'origem', tipoLocal)
        const legendaDestino = traduzirLegendaLocalizacaoNovaCotacao(t, 'destino', tipoLocal)

        return (
          <div className="nc-step-content nc-origem-destino-stack">
            <div
              className={`nc-location-visual-card nc-location-visual-card--origin${origemPreenchida ? ' nc-location-visual-card--selected' : ''}`}
            >
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{traduzirTituloLocalizacaoNovaCotacao(t, 'origem', tipoLocal)}</h4>
                  <p className="nc-caption">{legendaOrigem}</p>
                </div>
              </div>

              <div className="nc-location-body">
                {exigePorto && (
                  <Field label={t('bidfrete.nova_cotacao.campo_porto_embarque', { defaultValue: 'PORTO DE EMBARQUE' })} required icone={<Anchor {...ICONE_FIELD} />}>
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosOrigem}
                      valor={form.porto_origem_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoOrigem}
                      placeholder={t('bidfrete.nova_cotacao.placeholder_selecione_porto', { defaultValue: 'Selecione o porto...' })}
                      buscavel
                      carregando={carregandoPortosOrigem}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeAeroporto && (
                  <Field label={t('bidfrete.nova_cotacao.campo_aeroporto_embarque', { defaultValue: 'AEROPORTO DE EMBARQUE' })} required icone={<AirplaneTilt {...ICONE_FIELD} />}>
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosOrigem}
                      valor={form.aeroporto_origem_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoOrigem}
                      placeholder={t('bidfrete.nova_cotacao.placeholder_selecione_aeroporto', { defaultValue: 'Selecione o aeroporto...' })}
                      buscavel
                      carregando={carregandoAeroportosOrigem}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeRodoviario && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE ORIGEM" required icone={<GlobeHemisphereWest {...ICONE_FIELD} />}>
                      <SelectGlobal
                        iconeEsquerda={<MapPin size={16} />}
                        opcoes={opcoesPaisesLatam}
                        valor={form.pais_origem_rodoviario_cotacao_bid_frete_internacional || null}
                        aoMudarValor={aoMudarPaisOrigemRodoviario}
                        placeholder="Selecione o país..."
                        buscavel
                        carregando={carregandoPaises}
                        posicao="auto"
                      />
                    </Field>
                    <Field label="ESTADO OU PROVÍNCIA DE ORIGEM" required={form.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR'} icone={<MapPin {...ICONE_FIELD} />}>
                      {form.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={OPCOES_ESTADOS_BR}
                          valor={form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => {
                            set('estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional', String(v ?? ''))
                            set('cidade_origem_rodoviario_cotacao_bid_frete_internacional', '')
                          }}
                          placeholder="Selecione o UF"
                          buscavel
                          desabilitado={!form.pais_origem_rodoviario_cotacao_bid_frete_internacional}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: Buenos Aires"
                          value={form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional}
                          onChange={(e) => set('estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>
                    <Field label="CIDADE DE ORIGEM" className="nc-field--span-2" required icone={<Buildings {...ICONE_FIELD} />}>
                      {form.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={cidadesOrigemRodoviario}
                          valor={form.cidade_origem_rodoviario_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => set('cidade_origem_rodoviario_cotacao_bid_frete_internacional', String(v ?? ''))}
                          placeholder="Selecione a cidade"
                          buscavel
                          carregando={carregandoCidadesOrigemRodoviario}
                          desabilitado={!ufOrigemRodoviario}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: Montevideo"
                          value={form.cidade_origem_rodoviario_cotacao_bid_frete_internacional}
                          onChange={(e) => set('cidade_origem_rodoviario_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>
                  </div>
                )}

                {(exigePorto || exigeAeroporto) && (
                  <LinhaCheckboxExibirCamposLocalizacao lado="origem" form={form} setForm={setForm} />
                )}

                {exibirExtrasOrigem && (exigePorto || exigeAeroporto) && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE ORIGEM" icone={<GlobeHemisphereWest {...ICONE_FIELD} />}>
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
                    <Field label="ENDEREÇO DE ORIGEM" className="nc-field--span-2" icone={<MapPin {...ICONE_FIELD} />}>
                      <input
                        className="nc-input"
                        placeholder="Complemento de endereço (opcional)"
                        value={form.endereco_origem_cotacao_bid_frete_internacional}
                        onChange={(e) => set('endereco_origem_cotacao_bid_frete_internacional', e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`nc-location-visual-card nc-location-visual-card--destination${destinoPreenchido ? ' nc-location-visual-card--selected' : ''}`}
            >
              <div className="nc-location-visual-header">
                <div className="nc-location-visual-circle">
                  <MapPin weight="duotone" size={26} className="nc-pulsing-icon-dest" />
                </div>
                <div className="nc-location-visual-text">
                  <h4>{traduzirTituloLocalizacaoNovaCotacao(t, 'destino', tipoLocal)}</h4>
                  <p className="nc-caption">{legendaDestino}</p>
                </div>
              </div>

              <div className="nc-location-body">
                {exigePorto && (
                  <Field label={t('bidfrete.nova_cotacao.campo_porto_destino', { defaultValue: 'PORTO DE DESTINO' })} required icone={<Anchor {...ICONE_FIELD} />}>
                    <SelectGlobal
                      iconeEsquerda={<Anchor size={16} />}
                      opcoes={opcoesPortosDestino}
                      valor={form.porto_destino_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarPortoDestino}
                      placeholder={t('bidfrete.nova_cotacao.placeholder_selecione_porto', { defaultValue: 'Selecione o porto...' })}
                      buscavel
                      carregando={carregandoPortosDestino}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeAeroporto && (
                  <Field label={t('bidfrete.nova_cotacao.campo_aeroporto_destino', { defaultValue: 'AEROPORTO DE DESTINO' })} required icone={<AirplaneTilt {...ICONE_FIELD} />}>
                    <SelectGlobal
                      iconeEsquerda={<AirplaneTilt size={16} />}
                      opcoes={opcoesAeroportosDestino}
                      valor={form.aeroporto_destino_cotacao_bid_frete_internacional || null}
                      aoMudarValor={aoMudarAeroportoDestino}
                      placeholder={t('bidfrete.nova_cotacao.placeholder_selecione_aeroporto', { defaultValue: 'Selecione o aeroporto...' })}
                      buscavel
                      carregando={carregandoAeroportosDestino}
                      posicao="auto"
                    />
                  </Field>
                )}

                {exigeRodoviario && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE DESTINO" required icone={<GlobeHemisphereWest {...ICONE_FIELD} />}>
                      <SelectGlobal
                        iconeEsquerda={<MapPin size={16} />}
                        opcoes={opcoesPaisesLatam}
                        valor={form.pais_destino_rodoviario_cotacao_bid_frete_internacional || null}
                        aoMudarValor={aoMudarPaisDestinoRodoviario}
                        placeholder="Selecione o país..."
                        buscavel
                        carregando={carregandoPaises}
                        posicao="auto"
                      />
                    </Field>
                    <Field label="ESTADO OU PROVÍNCIA DE DESTINO" required={form.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR'} icone={<MapPin {...ICONE_FIELD} />}>
                      {form.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={OPCOES_ESTADOS_BR}
                          valor={form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => {
                            set('estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional', String(v ?? ''))
                            set('cidade_destino_rodoviario_cotacao_bid_frete_internacional', '')
                          }}
                          placeholder="Selecione o UF"
                          buscavel
                          desabilitado={!form.pais_destino_rodoviario_cotacao_bid_frete_internacional}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: São Paulo"
                          value={form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional}
                          onChange={(e) => set('estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>
                    <Field label="CIDADE DE DESTINO" className="nc-field--span-2" required icone={<Buildings {...ICONE_FIELD} />}>
                      {form.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                        <SelectGlobal
                          opcoes={cidadesDestinoRodoviario}
                          valor={form.cidade_destino_rodoviario_cotacao_bid_frete_internacional || null}
                          aoMudarValor={(v) => set('cidade_destino_rodoviario_cotacao_bid_frete_internacional', String(v ?? ''))}
                          placeholder="Selecione a cidade"
                          buscavel
                          carregando={carregandoCidadesDestinoRodoviario}
                          desabilitado={!ufDestinoRodoviario}
                          posicao="auto"
                        />
                      ) : (
                        <input
                          className="nc-input"
                          placeholder="Ex: Santos"
                          value={form.cidade_destino_rodoviario_cotacao_bid_frete_internacional}
                          onChange={(e) => set('cidade_destino_rodoviario_cotacao_bid_frete_internacional', e.target.value)}
                        />
                      )}
                    </Field>
                  </div>
                )}

                {(exigePorto || exigeAeroporto) && (
                  <LinhaCheckboxExibirCamposLocalizacao lado="destino" form={form} setForm={setForm} />
                )}

                {exibirExtrasDestino && (exigePorto || exigeAeroporto) && (
                  <div className="nc-fields-grid nc-fields-grid--location-extras">
                    <Field label="PAÍS DE DESTINO" icone={<GlobeHemisphereWest {...ICONE_FIELD} />}>
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
                    <Field label="ENDEREÇO DE DESTINO" className="nc-field--span-2" icone={<MapPin {...ICONE_FIELD} />}>
                      <input
                        className="nc-input"
                        placeholder="Complemento de endereço (opcional)"
                        value={form.endereco_destino_cotacao_bid_frete_internacional}
                        onChange={(e) => set('endereco_destino_cotacao_bid_frete_internacional', e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      // STEP — Carga + Incoterm
      case 'carga': {
        const sufixoQtd = exigeContainerFcl
          ? 'ctn'
          : sufixoQuantidadeEmbalagem(form.tipo_container_cotacao_bid_frete_internacional)
        const modalidadeLabel = modalidadeEfetivaNovaCotacao(form)
          ? traduzirModalidadeKanbanBidFrete(t, modalidadeEfetivaNovaCotacao(form) as ModalidadeCarga)
          : '—'

        return (
          <div className="nc-step-content nc-cargo-stack">
            <NcSectionTitle icone={<Package {...ICONE_LABEL_SECAO} />} obrigatorio>
              {t('bidfrete.nova_cotacao.dados_mercadoria')}
            </NcSectionTitle>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-identificacao">
              <NcSubsecaoTitle id="nc-cargo-identificacao" icone={<IdentificationCard {...ICONE_LABEL_SECAO} />} obrigatorio>
                {t('bidfrete.nova_cotacao.identificacao_mercadoria', { defaultValue: 'Identificação da mercadoria' })}
              </NcSubsecaoTitle>
              <p className="nc-cargo-subsecao-hint">{t('bidfrete.nova_cotacao.hint_identificacao_mercadoria', { defaultValue: 'NCM, descrição comercial e HS Code (quando aplicável).' })}</p>
              <div className="nc-cargo-subsecao-grid-identificacao">
                <Field label="NCM" icone={<Barcode {...ICONE_FIELD} />}>
                  <SelectNcmGlobal
                    className="nc-campo-ncm nc-campo-ncm--label-externo"
                    label=""
                    value={form.ncm_cotacao_bid_frete_internacional}
                    onChange={aoMudarNcm}
                  />
                </Field>

                <Field
                  label={t('bidfrete.nova_cotacao.descricao_mercadoria')}
                  required
                  icone={<TextAlignLeft {...ICONE_FIELD} />}
                  className="nc-cargo-descricao"
                >
                  <input
                    className="nc-input"
                    placeholder={t('bidfrete.nova_cotacao.placeholder_mercadoria_long', { defaultValue: 'Ex: Peças automotivas, eletrônicos industriais...' })}
                    value={form.descricao_mercadoria_cotacao_bid_frete_internacional}
                    onChange={e => set('descricao_mercadoria_cotacao_bid_frete_internacional', e.target.value)}
                  />
                </Field>

                <Field label="HS CODE" icone={<Certificate {...ICONE_FIELD} />}>
                  <input
                    className="nc-input"
                    placeholder="Ex: 8708.99"
                    value={form.hs_code_cotacao_bid_frete_internacional}
                    onChange={e => set('hs_code_cotacao_bid_frete_internacional', e.target.value.slice(0, 10))}
                  />
                </Field>
              </div>
            </section>

            {form.eh_carga_perigosa_cotacao_bid_frete_internacional && (
              <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-perigosa">
              <NcSubsecaoTitle id="nc-cargo-perigosa" icone={<Warning {...ICONE_LABEL_SECAO} />} obrigatorio>
                Carga perigosa
              </NcSubsecaoTitle>
              <p className="nc-cargo-subsecao-hint">Marcado no passo 1 — informe a classificação ONU (IMDG / IATA DGR / ADR).</p>
              <div className="nc-cargo-perigosa-grid">
                  <Field label="NÚMERO ONU" required icone={<Warning {...ICONE_FIELD} />}>
                    <SelectGlobal
                      opcoes={opcoesMercadoriasPerigosas}
                      valor={form.id_mercadoria_perigosa_cotacao || null}
                      aoMudarValor={aoMudarMercadoriaPerigosa}
                      renderizarValorSelecionado={renderizarMercadoriaPerigosaNoGatilho}
                      placeholder="Selecione UN + nome técnico..."
                      buscavel
                      carregando={carregandoMercadoriasPerigosas}
                      posicao="auto"
                    />
                  </Field>

                  <Field label="CLASSE" icone={<ListNumbers {...ICONE_FIELD} />}>
                    <input className="nc-input" readOnly value={form.classe_carga_perigosa_cotacao_bid_frete_internacional || '—'} />
                  </Field>

                  <Field label="DIVISÃO" icone={<GitBranch {...ICONE_FIELD} />}>
                    <input className="nc-input" readOnly value={form.divisao_carga_perigosa_cotacao_bid_frete_internacional || '—'} />
                  </Field>

                  <Field label="GRUPO DE EMBALAGEM" icone={<Package {...ICONE_FIELD} />}>
                    <input className="nc-input" readOnly value={form.grupo_embalagem_carga_perigosa_cotacao_bid_frete_internacional || '—'} />
                  </Field>

                  <Field label="NOME TÉCNICO DE EMBARQUE" icone={<TextAlignLeft {...ICONE_FIELD} />}>
                    <input className="nc-input" readOnly value={form.nome_tecnico_embarque_cotacao_bid_frete_internacional || '—'} />
                  </Field>

                  <Field label="OBSERVAÇÕES DG" icone={<NotePencil {...ICONE_FIELD} />}>
                    <textarea
                      className="nc-input nc-textarea"
                      rows={1}
                      placeholder="Flash point, poluente marinho..."
                      value={form.observacoes_carga_perigosa_cotacao_bid_frete_internacional}
                      onChange={(e) => set('observacoes_carga_perigosa_cotacao_bid_frete_internacional', e.target.value)}
                    />
                  </Field>
              </div>
              </section>
            )}

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-quantidade">
              <NcSubsecaoTitle id="nc-cargo-quantidade" icone={<Package {...ICONE_LABEL_SECAO} />} obrigatorio>
                {t('bidfrete.nova_cotacao.quantidade')}
              </NcSubsecaoTitle>
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
                      <Field label="TIPO CONTAINER" required icone={<Package {...ICONE_FIELD} />}>
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
                      <Field label="QUANTIDADE" required icone={<Hash {...ICONE_FIELD} />}>
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
                    <Field label="TIPO DE VOLUME" required icone={<Package {...ICONE_FIELD} />}>
                      <SelectGlobal
                        opcoes={opcoesEmbalagem}
                        valor={form.tipo_container_cotacao_bid_frete_internacional || null}
                        aoMudarValor={(v) => set('tipo_container_cotacao_bid_frete_internacional', String(v ?? ''))}
                        placeholder="Selecione caixa, palete..."
                        buscavel
                        posicao="auto"
                      />
                    </Field>

                    <Field label="QUANTIDADE" required icone={<Hash {...ICONE_FIELD} />}>
                      <div className="nc-input-group">
                        <input
                          className="nc-input nc-input--with-suffix"
                          type="number"
                          min={1}
                          placeholder="Ex: 10"
                          value={form.quantidade_volume_cotacao_bid_frete_internacional || ''}
                          onChange={e => set('quantidade_volume_cotacao_bid_frete_internacional', parseInt(e.target.value, 10) || 0)}
                        />
                        <span className="nc-input-suffix">{sufixoQtd}</span>
                      </div>
                    </Field>
                  </div>
                </>
              )}
            </section>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-peso">
              <NcSubsecaoTitle id="nc-cargo-peso" icone={<Scales {...ICONE_LABEL_SECAO} />}>
                Peso e cubagem
              </NcSubsecaoTitle>
              <p className="nc-cargo-subsecao-hint">Opcional neste momento; ajuda o fornecedor a cotar com precisão.</p>
              <div className="nc-cargo-subsecao-grid-peso">
                <Field label="PESO (KG)" icone={<Scales {...ICONE_FIELD} />}>
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

                <Field label="PESO (TON)" icone={<Scales {...ICONE_FIELD} />}>
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

                <Field label="CUBAGEM (M³)" icone={<Scales {...ICONE_FIELD} />}>
                  <div className="nc-input-group">
                    <input className="nc-input nc-input--with-suffix" type="number" placeholder="Ex: 33.2" value={form.cubagem_m3_cotacao_bid_frete_internacional} onChange={e => set('cubagem_m3_cotacao_bid_frete_internacional', e.target.value)} />
                    <span className="nc-input-suffix">m³</span>
                  </div>
                </Field>
              </div>
            </section>

            <section className="nc-cargo-subsecao" aria-labelledby="nc-cargo-incoterm">
              <NcSubsecaoTitle id="nc-cargo-incoterm" icone={<FileText {...ICONE_LABEL_SECAO} />} obrigatorio>
                {t('bidfrete.nova_cotacao.incoterm')}
              </NcSubsecaoTitle>
              <p className="nc-cargo-subsecao-hint">
                {t('bidfrete.nova_cotacao.hint_incoterm', {
                  defaultValue: 'Escolha quem assume frete e risco até o destino.',
                })}
              </p>
              <div className="nc-incoterm-stack">
                <div
                  className="nc-incoterm-grid"
                  role="group"
                  aria-label={t('bidfrete.nova_cotacao.incoterm')}
                >
                  {INCOTERM_TODOS_NOVA_COTACAO.map((inc) => (
                    <BotaoIncotermNovaCotacao
                      key={inc}
                      inc={inc}
                      selecionado={form.incoterm_cotacao_bid_frete_internacional === inc}
                      onSelecionar={(codigo) => set('incoterm_cotacao_bid_frete_internacional', codigo)}
                    />
                  ))}
                </div>
                {form.incoterm_cotacao_bid_frete_internacional && (() => {
                  const explicacao = traduzirIncotermExplicacaoNovaCotacao(
                    t,
                    form.incoterm_cotacao_bid_frete_internacional,
                  )
                  if (!explicacao) return null
                  return (
                  <div className="nc-incoterm-helper-card nc-fade-in">
                    <div className="nc-helper-header">
                      <Scales size={20} weight="duotone" className="nc-helper-icon" />
                      <h4>{explicacao.titulo}</h4>
                    </div>
                    <p className="nc-helper-desc">{explicacao.desc}</p>
                    <div className="nc-helper-footer">
                      <strong>{t('bidfrete.nova_cotacao.responsabilidade', { defaultValue: 'Responsabilidade' })}:</strong>{' '}
                      {explicacao.responsabilidade}
                    </div>
                  </div>
                  )
                })()}
              </div>
            </section>
          </div>
        )
      }

      // STEP — Armazenagem (Marítimo LCL)
      case 'armazenagem': {
        return (
          <div className="nc-step-content">
            <NcSectionTitle icone={<Warehouse {...ICONE_LABEL_SECAO} />} obrigatorio>
              {t('bidfrete.nova_cotacao.step_armazenagem', { defaultValue: 'Armazenagem' })}
            </NcSectionTitle>
            <p className="nc-cargo-subsecao-hint">
              {t('bidfrete.nova_cotacao.hint_armazenagem', {
                defaultValue:
                  'Disponível para embarques Marítimo LCL. Informe se a cotação deve incluir armazenagem.',
              })}
            </p>
            <Field
              label={t('bidfrete.nova_cotacao.campo_incluir_armazenagem', { defaultValue: 'Incluir armazenagem' })}
              icone={<Warehouse {...ICONE_FIELD} />}
              required
            >
              <SelectGlobal
                id="nc-incluir-armazenagem"
                opcoes={opcoesIncluirArmazenagem}
                valor={form.opcao_incluir_armazenagem_cotacao || null}
                aoMudarValor={(v) =>
                  set('opcao_incluir_armazenagem_cotacao', v == null ? '' : String(v) as '' | 'sim' | 'nao')
                }
                placeholder={t('bidfrete.nova_cotacao.selecione', { defaultValue: 'Selecionar' })}
                posicao="auto"
              />
            </Field>
          </div>
        )
      }

      // STEP — Fornecedores
      case 'fornecedores': {
        // Valor no form: "YYYY-MM-DDTHH:mm" — separar data e hora para calendário global + campo de hora
        const [prazoDataParte, prazoHoraParte = ''] =
          form.data_limite_resposta_cotacao_bid_frete_internacional.split('T')
        const prazoDataSelecionada = prazoDataParte ? new Date(`${prazoDataParte}T00:00:00`) : null

        return (
          <div className="nc-step-content">
            <section className="nc-cargo-subsecao" style={{ marginBottom: '1.5rem' }} aria-labelledby="nc-prazo-respostas">
              <NcSubsecaoTitle id="nc-prazo-respostas" icone={<CalendarBlank {...ICONE_LABEL_SECAO} />}>
                {t('bidfrete.nova_cotacao.prazo_respostas')}
              </NcSubsecaoTitle>
              <p className="nc-cargo-subsecao-hint">{t('bidfrete.nova_cotacao.hint_prazo_respostas', { defaultValue: 'Opcional — define até quando os fornecedores podem enviar propostas.' })}</p>
              <div className="nc-prazo-data-hora">
                <Field label={t('bidfrete.nova_cotacao.prazo_respostas')} icone={<CalendarBlank {...ICONE_FIELD} />}>
                  <CampoCalendarioGlobal
                    modoUnico
                    placeholder="DD/MM/AAAA"
                    valor={{ inicio: prazoDataSelecionada, fim: prazoDataSelecionada }}
                    aoMudarValor={({ inicio }) => {
                      if (!inicio) {
                        set('data_limite_resposta_cotacao_bid_frete_internacional', '')
                        return
                      }
                      const yyyy = inicio.getFullYear()
                      const mm = String(inicio.getMonth() + 1).padStart(2, '0')
                      const dd = String(inicio.getDate()).padStart(2, '0')
                      set(
                        'data_limite_resposta_cotacao_bid_frete_internacional',
                        `${yyyy}-${mm}-${dd}T${prazoHoraParte || '23:59'}`,
                      )
                    }}
                  />
                </Field>
                <Field label={t('bidfrete.nova_cotacao.campo_hora', { defaultValue: 'Hora' })} icone={<CalendarBlank {...ICONE_FIELD} />}>
                  <input
                    className="nc-input"
                    type="time"
                    value={prazoHoraParte}
                    disabled={!prazoDataParte}
                    onChange={e => {
                      if (!prazoDataParte) return
                      set(
                        'data_limite_resposta_cotacao_bid_frete_internacional',
                        `${prazoDataParte}T${e.target.value}`,
                      )
                    }}
                  />
                </Field>
              </div>
            </section>

            <NcSectionTitle icone={<Eye {...ICONE_LABEL_SECAO} />} obrigatorio>
              {t('bidfrete.nova_cotacao.visibilidade')}
            </NcSectionTitle>
            
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
                  <span className="nc-switch-desc">{t('bidfrete.nova_cotacao.anonima_desc_long', {
                    defaultValue:
                      'Ocultar o nome da sua empresa no mercado inicial de lances para total confidencialidade.',
                  })}</span>
                </div>
                <div className="nc-switch">
                  <input type="checkbox" checked={form.anonima_cotacao_bid_frete_internacional} onChange={e => set('anonima_cotacao_bid_frete_internacional', e.target.checked)} />
                  <span className="nc-switch-slider"></span>
                </div>
              </label>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <NcSectionTitle icone={<Users {...ICONE_LABEL_SECAO} />}>
                {t('bidfrete.nova_cotacao.fornecedores_disparo', 'Fornecedores e envio')}
              </NcSectionTitle>
              <SelecaoFornecedoresDisparo
                visibilidade={form.visibilidade_cotacao_bid_frete_internacional}
                fornecedores={fornecedoresAtivos}
                carregando={carregandoFornecedores}
                selecionados={fornecedorIdsSelecionados}
                onChangeSelecionados={setFornecedorIdsSelecionados}
                canais={canaisDisparo}
                onChangeCanais={setCanaisDisparo}
                excluidosDisparo={fornecedorIdsExcluidosDisparo}
                onExcluirFornecedorDisparo={(id) => {
                  setFornecedorIdsExcluidosDisparo(prev =>
                    prev.includes(id) ? prev : [...prev, id],
                  )
                }}
                emailsPorFornecedor={emailsPorFornecedorDisparo}
                onEmailFornecedorChange={(id_fornecedor, emails) => {
                  setEmailsPorFornecedorDisparo(prev => ({ ...prev, [id_fornecedor]: emails }))
                }}
                onContatosFornecedorAtualizados={() => {
                  getFornecedores({ limit: 200, status: 'ATIVO' })
                    .then(res => setFornecedoresAtivos(res.fornecedores))
                    .catch(() => undefined)
                }}
              />
            </div>
          </div>
        )
      }

      // STEP — Resumo
      case 'resumo': {
        const rotaResumo = prepararCamposRotaCotacaoPersistencia(
          {
            modal_cotacao_bid_frete_internacional: modal as ModalFrete,
            porto_origem_cotacao_bid_frete_internacional: form.porto_origem_cotacao_bid_frete_internacional || null,
            porto_destino_cotacao_bid_frete_internacional: form.porto_destino_cotacao_bid_frete_internacional || null,
            aeroporto_origem_cotacao_bid_frete_internacional: form.aeroporto_origem_cotacao_bid_frete_internacional || null,
            aeroporto_destino_cotacao_bid_frete_internacional: form.aeroporto_destino_cotacao_bid_frete_internacional || null,
            pais_origem_rodoviario_cotacao_bid_frete_internacional: form.pais_origem_rodoviario_cotacao_bid_frete_internacional || null,
            pais_destino_rodoviario_cotacao_bid_frete_internacional: form.pais_destino_rodoviario_cotacao_bid_frete_internacional || null,
            estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional:
              form.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional || null,
            estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional:
              form.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional || null,
            cidade_origem_rodoviario_cotacao_bid_frete_internacional:
              form.cidade_origem_rodoviario_cotacao_bid_frete_internacional || null,
            cidade_destino_rodoviario_cotacao_bid_frete_internacional:
              form.cidade_destino_rodoviario_cotacao_bid_frete_internacional || null,
          },
          { portos: [...portosOrigem, ...portosDestino], aeroportos: [...aeroportosOrigem, ...aeroportosDestino] },
        )
        const origemName = rotaResumo.origem_nome_cotacao_bid_frete_internacional
        const destinoName = rotaResumo.destino_nome_cotacao_bid_frete_internacional

        return (
          <div className="nc-step-content">
            <NcSectionTitle icone={<FileText {...ICONE_LABEL_SECAO} />}>
              {t('bidfrete.nova_cotacao.resumo_cotacao')}
            </NcSectionTitle>

            <div className="nc-fields-grid nc-fields-grid--summary-inputs">
              <Field label={t('bidfrete.nova_cotacao.valor_alvo')} icone={<Hash {...ICONE_FIELD} />}>
                <input className="nc-input" type="number" placeholder="Ex: 5000" value={form.valor_meta_cotacao_bid_frete_internacional} onChange={e => set('valor_meta_cotacao_bid_frete_internacional', e.target.value)} />
              </Field>
              <Field label={t('bidfrete.nova_cotacao.moeda')} icone={<Tag {...ICONE_FIELD} />}>
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
                <span className="nc-receipt-badge">{form.tipo_operacao_cotacao_bid_frete_internacional ? traduzirOperacaoNovaCotacao(t, form.tipo_operacao_cotacao_bid_frete_internacional as TipoOperacao) : '—'}</span>
                <span className="nc-receipt-modal">
                  {form.modal_cotacao_bid_frete_internacional
                    ? form.modal_cotacao_bid_frete_internacional === 'AEREO'
                      ? traduzirModalNovaCotacao(t, 'AEREO')
                      : `${traduzirModalNovaCotacao(t, form.modal_cotacao_bid_frete_internacional as ModalFrete)} / ${form.modalidade_cotacao_bid_frete_internacional ? traduzirModalidadeKanbanBidFrete(t, form.modalidade_cotacao_bid_frete_internacional as ModalidadeCarga) : '—'}`
                    : '—'}
                </span>
              </div>

              {/* Linha do tempo da rota visual */}
              <div className="nc-route-timeline">
                <div className="nc-timeline-node">
                  <div className="nc-node-dot nc-node-dot--origin"></div>
                  <div className="nc-node-text">
                    <span className="nc-node-code">{origemName || '—'}</span>
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
                    <span className="nc-node-code">{destinoName || '—'}</span>
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
                      ? `${serializarLinhasContainersFcl(form.linhas_container_fcl_cotacao).quantidade_volume_cotacao_bid_frete_internacional} ctn`
                      : `${form.quantidade_volume_cotacao_bid_frete_internacional} ${sufixoQuantidadeEmbalagem(form.tipo_container_cotacao_bid_frete_internacional)}`}
                    {form.peso_kg_cotacao_bid_frete_internacional ? ` | ${form.peso_kg_cotacao_bid_frete_internacional} Kg` : ''}
                    {form.peso_ton_cotacao_bid_frete_internacional ? ` (${form.peso_ton_cotacao_bid_frete_internacional} TON)` : ''}
                    {form.cubagem_m3_cotacao_bid_frete_internacional ? ` | ${form.cubagem_m3_cotacao_bid_frete_internacional} m³` : ''}
                    {!exigeContainerFcl
                      && !form.peso_kg_cotacao_bid_frete_internacional
                      && !form.cubagem_m3_cotacao_bid_frete_internacional
                      && form.quantidade_volume_cotacao_bid_frete_internacional <= 0
                      ? '—'
                      : ''}
                  </span>
                </div>
                {ehMaritimoLclCotacaoBidFreteInternacional(
                  form.modal_cotacao_bid_frete_internacional,
                  form.modalidade_cotacao_bid_frete_internacional,
                ) && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">{t('bidfrete.nova_cotacao.label_armazenagem', { defaultValue: 'Armazenagem' })}</span>
                    <span className="nc-receipt-value">
                      {traduzirRotuloArmazenagemResumoNovaCotacao(t, form.opcao_incluir_armazenagem_cotacao)}
                    </span>
                  </div>
                )}
                {(exigeContainerFcl
                  ? form.linhas_container_fcl_cotacao.some((l) => l.tipo_container.trim())
                  : !!form.tipo_container_cotacao_bid_frete_internacional) && (
                  <div className="nc-receipt-row">
                    <span className="nc-receipt-label">{exigeContainerFcl ? t('bidfrete.nova_cotacao.resumo_containers', { defaultValue: 'Containers' }) : t('bidfrete.nova_cotacao.resumo_tipo_volume', { defaultValue: 'Tipo de volume' })}</span>
                    <span className="nc-receipt-value">
                      {exigeContainerFcl
                        ? formatarLinhasContainersParaExibicao(
                            form.linhas_container_fcl_cotacao,
                            rotuloContainerPorCodigo,
                          )
                        : traduzirRotuloUnidadeEmbalagemNovaCotacao(t, form.tipo_container_cotacao_bid_frete_internacional)}
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
                    {traduzirRotuloResumoVisibilidadeNovaCotacao(
                      t,
                      form.visibilidade_cotacao_bid_frete_internacional,
                      form.anonima_cotacao_bid_frete_internacional,
                    )}
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
  const handleFechar = () => {
    navigate(
      idPainelLista
        ? buildRotaListaBidFreteComPainelAtivo(idPainelLista)
        : ROTA_LISTA_BID_FRETE_INTERNACIONAL,
    )
  }

  const handleNovaCotacaoMesmoBid = () => {
    setForm(INITIAL_FORM)
    setFornecedorIdsSelecionados([])
    setCanaisDisparo([])
    setCotacaoId(null)
    setSucesso(false)
    proximoIdLinhaContainerRef.current = 2
    setStep(1)
  }

  const handleProximo = () => {
    if (step < totalPassos) setStep((s) => s + 1)
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
          passos={passosWizard}
          passoAtual={totalPassos}
          onProximo={handleFechar}
          onVoltar={handleFechar}
          onFechar={handleFechar}
          ocultarStepper
          footerCustom={(
            <div style={ESTILOS_RESULTADO.footerAcoes}>
              <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={handleFechar}>
                {t('bidfrete.nova_cotacao.ver_cotacoes')}
              </BotaoGlobal>
              {idBid && (
                <BotaoGlobal variante="secundario" tamanho="padrao" onClick={handleNovaCotacaoMesmoBid}>
                  {t('bidfrete.nova_cotacao.adicionar_outra_bid')}
                </BotaoGlobal>
              )}
              {cotacaoId && (
                <BotaoGlobal
                  variante="primario"
                  tamanho="padrao"
                  onClick={() => navigate(rotaDetalheCotacaoBidFreteInternacional(cotacaoId))}
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
            {feedbackDisparoCriacao && (
              <div
                style={{
                  ...ESTILOS_RESULTADO.resultadoBanner,
                  marginTop: '0.75rem',
                  borderColor: feedbackDisparoCriacao.tipo === 'sucesso'
                    ? 'rgba(34, 197, 94, 0.35)'
                    : feedbackDisparoCriacao.tipo === 'parcial'
                      ? 'rgba(245, 158, 11, 0.35)'
                      : 'rgba(239, 68, 68, 0.35)',
                }}
                role="status"
              >
                {feedbackDisparoCriacao.tipo === 'sucesso'
                  ? <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
                  : <Warning weight="fill" size={20} color={feedbackDisparoCriacao.tipo === 'parcial' ? '#f59e0b' : '#ef4444'} />}
                <p style={ESTILOS_RESULTADO.resultadoBannerTexto}>
                  <strong>{feedbackDisparoCriacao.titulo}</strong>
                  {' — '}
                  {feedbackDisparoCriacao.detalhe}
                </p>
              </div>
            )}
          </div>
        </ModalPassoPassoGlobal>
        <style>{NC_ESTILOS_CONTEUDO}</style>
      </>
    )
  }

  return (
    <>
      <ModalPassoPassoGlobal
        titulo={t('bidfrete.nova_cotacao.titulo_internacional')}
        icone={<Truck weight="duotone" size={22} />}
        subtitulo={idBid
          ? t('bidfrete.nova_cotacao.subtitulo_vinculada_bid')
          : t('bidfrete.nova_cotacao.subtitulo')}
        aberto
        passos={passosWizard}
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
        tamanho="xl"
        altura="90vh"
      >
        <div className="nc-root nc-step-wrapper nc-fade-in">{renderStep()}</div>
      </ModalPassoPassoGlobal>
      <style>{NC_ESTILOS_CONTEUDO}</style>
    </>
  )
}
