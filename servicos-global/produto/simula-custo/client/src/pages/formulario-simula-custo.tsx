/**
 * formulario-simula-custo.tsx — Wizard Nova/Editar Simula (padrão ModalPassoPassoGlobal,
 * alinhado à Nova Cotação do Bid Frete Internacional).
 */
import React, { useState, useEffect, useMemo, useRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Calculator,
  Plus,
  Trash,
  GearSix,
  Package,
  CurrencyCircleDollar,
  ListPlus,
  Boat,
  ShieldCheck,
  CheckCircle,
  DownloadSimple,
  UploadSimple,
  Handshake,
  Buildings,
  Storefront,
  Hash,
  MapPin,
  Scales,
  Tag,
  CalendarBlank,
  FileText,
  ClockCounterClockwise,
  Info,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { SelectNcmGlobal } from '@nucleo/campo-ncm-global'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  simularSimulaCusto,
  obterSimulaCusto,
  criarSimulaCusto,
  atualizarSimulaCusto,
  validarNcmSimulaCusto,
  listarUfsSimulaCusto,
  listarNcmsRecentesSimulaCusto,
} from '../shared/api'
import { TabelaResumoValoresSimulaCusto } from '../shared/tabela-resumo-valores-simula-custo'
import {
  formatarNcmDisplaySimulaCusto,
  filtrarUltimosNcmSimulaCusto,
  semearUltimosNcmSimulaCustoDev,
  ncmsPreviewSimulaCusto,
  mesclarUltimosNcmSimulaCusto,
  registrarUltimoNcmSimulaCusto,
  aplicarPadraoPisCofinsNcmSimulaCusto,
  type AliquotasNcmPctSimulaCusto,
  type NcmRecenteSimulaCusto,
} from '../shared/ultimos-ncm-simula-custo'
import {
  opcoesSelectTaxaSimulaCusto,
  useTaxasOrigemDestinoCadastrosSimulaCusto,
} from '../shared/use-taxas-origem-destino-cadastros-simula-custo'
import { useOpcoesMoedaCadastrosSimulaCusto } from '../shared/use-opcoes-moeda-cadastros-simula-custo'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import type {
  EntradaSimulaCusto,
  ItemProdutoEntradaSimulaCusto,
  ResultadoSimulacaoSimulaCusto,
  TipoDocumentoSimulaCusto,
  UfSimulaCusto,
  MomentoPrazoPagamentoSimulaCusto,
  TipoValorPrazoPagamentoSimulaCusto,
  FatoGeradorPrazoPagamentoSimulaCusto,
  PrazoPagamentoEntradaSimulaCusto,
  ModalidadeRecolhimentoIcmsSimulaCusto,
} from '../shared/schemas-simula-custo'
import {
  criarTaxaOrigemEntradaVaziaSimulaCusto,
  criarTaxaDestinoEntradaVaziaSimulaCusto,
} from '../shared/schemas-simula-custo'
import {
  OPERACAO_LABELS,
  DETALHE_OPERACAO_LABELS,
  DOCUMENTO_LABELS,
  DETALHE_OPERACAO_TRADING_PADRAO,
  ehModalidadeTrading,
  TIPO_VALOR_PRAZO_LABELS,
  MOMENTO_PRAZO_LABELS,
  FATO_GERADOR_PRAZO_LABELS,
  FATOS_GERADOR_PRAZO_ORDEM,
} from '../shared/types'
import { rotaSimulaCusto } from '../shared/rotas-simula-custo'
import {
  INCOTERMS_SIMULA_CUSTO,
  explicacaoIncotermSimulaCusto,
} from '../shared/incoterms-simula-custo'
import {
  MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO,
  RECOLHIMENTO_ICMS_HINTS,
  RECOLHIMENTO_ICMS_LABELS,
} from '../shared/modalidades-recolhimento-icms-simula-custo'
import {
  resolverAliquotaEfetivaIcmsReducaoSimulaCusto,
} from '../shared/calculo-icms-importacao-simula-custo'
import {
  ITEM_PRODUTO_VAZIO_SIMULA_CUSTO,
  aplicarValorProdutoSimplesSimulaCusto,
  calcularTotalItemProdutoSimulaCusto,
  ehModoMultiItensProdutoSimulaCusto,
  normalizarItemUnicoParaMultiItensSimulaCusto,
  passoValoresCompletoSimulaCusto,
  sincronizarProdutoLegadoSimulaCusto,
  itensProdutoFromLegadoSimulaCusto,
  lerItensProdutoStorageSimulaCusto,
  salvarItensProdutoStorageSimulaCusto,
  type FormularioComItensSimulaCusto,
} from '../shared/itens-produto-simula-custo'
import { formatarMoedaEstrangeiraSimulaCusto } from '../shared/formatacao-moeda-simula-custo'
import { ResultadoSimulaCusto } from './resultado-simula-custo'
import './formulario-simula-custo.css'

/** Helpers espelhados da Nova Cotação (Bid Frete) — classes `nc-*`. */
const ICONE_LABEL_SECAO = { size: 13, weight: 'fill' as const }

const OPCOES_TIPO_VALOR_PRAZO_SIMULA_CUSTO: SelectOpcao[] = (
  Object.keys(TIPO_VALOR_PRAZO_LABELS) as TipoValorPrazoPagamentoSimulaCusto[]
).map((k) => ({ valor: k, rotulo: TIPO_VALOR_PRAZO_LABELS[k] }))

const OPCOES_MOMENTO_PRAZO_SIMULA_CUSTO: SelectOpcao[] = (
  Object.keys(MOMENTO_PRAZO_LABELS) as MomentoPrazoPagamentoSimulaCusto[]
).map((k) => ({ valor: k, rotulo: MOMENTO_PRAZO_LABELS[k] }))

const OPCOES_FATO_GERADOR_PRAZO_SIMULA_CUSTO: SelectOpcao[] = FATOS_GERADOR_PRAZO_ORDEM.map((k) => ({
  valor: k,
  rotulo: FATO_GERADOR_PRAZO_LABELS[k],
}))

type LadoTaxaSimulaCusto = 'taxas_origem' | 'taxas_destino'

const OPCOES_LADO_TAXA_SIMULA_CUSTO: SelectOpcao[] = [
  { valor: 'taxas_destino', rotulo: 'Destino' },
  { valor: 'taxas_origem', rotulo: 'Origem' },
]

interface LinhaTaxaUnificadaSimulaCusto {
  lado: LadoTaxaSimulaCusto
  indice: number
}

function nomeTaxaFormularioSimulaCusto(
  lado: LadoTaxaSimulaCusto,
  taxa: EntradaSimulaCusto['taxas_origem'][number] | EntradaSimulaCusto['taxas_destino'][number],
): string {
  return lado === 'taxas_origem'
    ? taxa.nome_taxa_origem_simula_custo
    : taxa.nome_taxa_destino_simula_custo
}

function moedaTaxaFormularioSimulaCusto(
  lado: LadoTaxaSimulaCusto,
  taxa: EntradaSimulaCusto['taxas_origem'][number] | EntradaSimulaCusto['taxas_destino'][number],
): string {
  return lado === 'taxas_origem'
    ? taxa.moeda_taxa_origem_simula_custo
    : taxa.moeda_taxa_destino_simula_custo
}

function valorTotalTaxaFormularioSimulaCusto(
  lado: LadoTaxaSimulaCusto,
  taxa: EntradaSimulaCusto['taxas_origem'][number] | EntradaSimulaCusto['taxas_destino'][number],
): number {
  return lado === 'taxas_origem'
    ? taxa.valor_total_taxa_origem_simula_custo
    : taxa.valor_total_taxa_destino_simula_custo
}

function montarLinhasTaxasUnificadas(
  taxasOrigem: EntradaSimulaCusto['taxas_origem'],
  taxasDestino: EntradaSimulaCusto['taxas_destino'],
): LinhaTaxaUnificadaSimulaCusto[] {
  const origem = taxasOrigem.map((_, indice) => ({
    lado: 'taxas_origem' as const,
    indice,
  }))
  const destino = taxasDestino.map((_, indice) => ({
    lado: 'taxas_destino' as const,
    indice,
  }))
  return [...origem, ...destino]
}

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
      className={`nc-option-btn${selected ? ' nc-option-btn--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="nc-option-checkbox">
        {selected ? <span className="nc-option-checkmark">✓</span> : null}
      </div>
      <span className="nc-option-icon">{icon}</span>
      <div className="nc-option-text">
        <span className="nc-option-label">{label}</span>
        {description ? <span className="nc-option-desc">{description}</span> : null}
      </div>
    </button>
  )
}

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
      {obrigatorio ? <span className="nc-obrig">*</span> : null}
    </h3>
  )
}

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
        {required ? <span className="nc-obrig">*</span> : null}
      </span>
      {children}
    </div>
  )
}

/** Painel lateral de NCMs recentes — seleção rápida ao lado do campo. */
function PainelUltimosNcmSimulaCusto({
  itens,
  codigoSelecionado,
  aoSelecionar,
}: {
  itens: NcmRecenteSimulaCusto[]
  codigoSelecionado: string
  aoSelecionar: (codigo: string, descricao?: string, aliquotas?: AliquotasNcmPctSimulaCusto) => void
}) {
  const { t } = useTranslation()
  const [filtro, setFiltro] = useState('')
  const [expandido, setExpandido] = useState(() => itens.length <= 6)

  const itensFiltrados = useMemo(
    () => filtrarUltimosNcmSimulaCusto(itens, filtro),
    [itens, filtro],
  )

  if (itens.length === 0) return null

  const modoCompacto = itens.length > 6
  const total = itens.length
  const exibidos = itensFiltrados.length
  const filtrando = filtro.trim().length > 0

  const alternarExpansao = () => {
    setExpandido((atual) => {
      if (atual) setFiltro('')
      return !atual
    })
  }

  return (
    <section
      className={[
        'nc-ncm-recentes',
        modoCompacto ? 'nc-ncm-recentes--compacto' : '',
        expandido ? 'nc-ncm-recentes--expandido' : 'nc-ncm-recentes--recolhido',
      ].filter(Boolean).join(' ')}
      aria-label={t('simulacusto.formulario.ncm_ultimos_painel', 'Últimos NCMs usados')}
    >
      <header className="nc-ncm-recentes__cabecalho">
        <div className="nc-ncm-recentes__titulo">
          <ClockCounterClockwise weight="duotone" size={15} aria-hidden />
          <span>{t('simulacusto.formulario.ncm_ultimos', 'Últimos NCMs')}</span>
        </div>
        <div className="nc-ncm-recentes__acoes">
          <span className="nc-ncm-recentes__contagem" aria-live="polite">
            {filtrando && expandido
              ? t('simulacusto.formulario.ncm_ultimos_encontrados', '{{n}} de {{total}}', {
                n: exibidos,
                total,
              })
              : total}
          </span>
          <button
            type="button"
            className="nc-ncm-recentes__toggle"
            onClick={alternarExpansao}
            aria-expanded={expandido}
            aria-controls="ncm-recentes-corpo"
            title={expandido
              ? t('simulacusto.formulario.ncm_ultimos_contrair', 'Contrair lista')
              : t('simulacusto.formulario.ncm_ultimos_expandir', 'Expandir lista')}
          >
            {expandido ? (
              <CaretUp size={14} weight="bold" aria-hidden />
            ) : (
              <CaretDown size={14} weight="bold" aria-hidden />
            )}
          </button>
        </div>
      </header>

      {expandido ? (
        <div id="ncm-recentes-corpo" className="nc-ncm-recentes__corpo">
          {total > 4 ? (
            <div className="nc-ncm-recentes__busca">
              <MagnifyingGlass size={14} className="nc-ncm-recentes__busca-icone" aria-hidden />
              <input
                type="search"
                className="nc-ncm-recentes__busca-input"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder={t(
                  'simulacusto.formulario.ncm_ultimos_busca',
                  'Filtrar por código ou descrição…',
                )}
                aria-label={t('simulacusto.formulario.ncm_ultimos_busca', 'Filtrar por código ou descrição')}
                autoComplete="off"
                spellCheck={false}
              />
              {filtro ? (
                <button
                  type="button"
                  className="nc-ncm-recentes__busca-limpar"
                  onClick={() => setFiltro('')}
                  aria-label={t('simulacusto.formulario.ncm_ultimos_limpar', 'Limpar filtro')}
                >
                  <X size={12} weight="bold" aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}

          {exibidos === 0 ? (
            <p className="nc-ncm-recentes__vazio">
              {t('simulacusto.formulario.ncm_ultimos_sem_resultado', 'Nenhum NCM encontrado para este filtro.')}
            </p>
          ) : (
            <ul className="nc-ncm-recentes__lista" role="listbox" aria-label={t('simulacusto.formulario.ncm_ultimos', 'Últimos NCMs')}>
              {itensFiltrados.map((item) => {
                const ativo = codigoSelecionado === item.codigo
                const codigoFmt = formatarNcmDisplaySimulaCusto(item.codigo)
                const titulo = item.descricao ? `${codigoFmt}, ${item.descricao}` : codigoFmt
                return (
                  <li key={item.codigo} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={ativo}
                      className={`nc-ncm-recentes-item${ativo ? ' nc-ncm-recentes-item--ativo' : ''}`}
                      title={titulo}
                      onClick={() => aoSelecionar(item.codigo, item.descricao, {
                    ii: item.ii,
                    ipi: item.ipi,
                    pis: item.pis,
                    cofins: item.cofins,
                  })}
                    >
                      <span className="nc-ncm-recentes-item__principal">
                        <span className="nc-ncm-recentes-item__codigo">{codigoFmt}</span>
                        {ativo ? (
                          <CheckCircle weight="fill" size={14} className="nc-ncm-recentes-item__check" aria-hidden />
                        ) : null}
                      </span>
                      {item.descricao ? (
                        <span className="nc-ncm-recentes-item__descricao">{item.descricao}</span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {!filtrando && total > 6 ? (
            <p className="nc-ncm-recentes__rodape">
              {t(
                'simulacusto.formulario.ncm_ultimos_dica',
                'Use o filtro para localizar entre os {{total}} NCMs recentes.',
                { total },
              )}
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="nc-ncm-recentes__resumo-recolhido"
          onClick={() => setExpandido(true)}
        >
          {t(
            'simulacusto.formulario.ncm_ultimos_resumo_recolhido',
            'Expandir para ver e selecionar entre {{total}} NCMs recentes.',
            { total },
          )}
        </button>
      )}
    </section>
  )
}

/** Chips de Incoterm — mesmo padrão visual da Nova Cotação (Bid Frete). */
function BotaoIncoterm({
  codigo,
  selecionado,
  onSelecionar,
}: {
  codigo: string
  selecionado: boolean
  onSelecionar: (codigo: string) => void
}) {
  const { t } = useTranslation()
  const explicacao = explicacaoIncotermSimulaCusto(t, codigo)

  return (
    <TooltipGlobal
      titulo={explicacao?.titulo ?? codigo}
      descricao={explicacao ? (
        <>
          <p>{explicacao.desc}</p>
          <p>
            <strong>{t('bidfrete.nova_cotacao.responsabilidade', { defaultValue: 'Responsabilidade' })}:</strong>{' '}
            {explicacao.responsabilidade}
          </p>
        </>
      ) : codigo}
      interativo={Boolean(explicacao)}
      posicaoPreferida="auto"
    >
      <button
        type="button"
        aria-pressed={selecionado}
        className={`nc-incoterm-btn${selecionado ? ' nc-incoterm-btn--selected' : ''}`}
        onClick={() => onSelecionar(codigo)}
      >
        {codigo}
      </button>
    </TooltipGlobal>
  )
}

function resolverAliquotaInternaUfFormulario(
  uf: string,
  listaUf: UfSimulaCusto[],
): number {
  return listaUf.find((u) => u.uf === uf)?.icms ?? 0
}

function resolverAliquotaIcmsFormulario(
  modalidade: ModalidadeRecolhimentoIcmsSimulaCusto,
  aliquotaUf: number,
  reducaoBase = 0,
): number {
  if (modalidade === 'ISENTO' || modalidade === 'DIFERIDO') return 0
  if (modalidade === 'REDUCAO') {
    return resolverAliquotaEfetivaIcmsReducaoSimulaCusto(aliquotaUf, reducaoBase)
  }
  return aliquotaUf
}

function formatarPctIcmsSimulaCusto(aliquota: number): string {
  return (aliquota * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function InputComSufixoPercentual({
  suffix = '%',
  mostrarSufixo = true,
  className = '',
  readOnly,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  suffix?: string
  mostrarSufixo?: boolean
}) {
  const somenteLeitura = Boolean(readOnly || className.includes('nc-input--readonly'))

  if (!mostrarSufixo) {
    return (
      <input
        {...props}
        readOnly={readOnly}
        value={value}
        className={['nc-input', className].filter(Boolean).join(' ')}
      />
    )
  }

  if (somenteLeitura) {
    const texto = value === '' || value == null ? '' : `${value}${suffix}`
    return (
      <input
        {...props}
        readOnly
        tabIndex={props.tabIndex ?? -1}
        value={texto}
        className={['nc-input', 'nc-input--readonly', className].filter(Boolean).join(' ')}
      />
    )
  }

  const textoValor = value == null ? '' : String(value)

  return (
    <div className="nc-input-pct">
      <input
        {...props}
        readOnly={readOnly}
        value={value}
        size={Math.max(textoValor.length, 1)}
        className="nc-input-pct-campo"
      />
      <span className="nc-input-pct-sufixo" aria-hidden="true">{suffix}</span>
    </div>
  )
}

function CabecalhoColunaTabelaPrazoPagamento({
  rotulo,
  descricaoTooltip,
}: {
  rotulo: string
  descricaoTooltip: string
}) {
  return (
    <span className="nc-tabela-refinada-th-conteudo">
      <span>{rotulo}</span>
      <TooltipGlobal
        descricao={descricaoTooltip}
        posicaoPreferida="abaixo"
        silenciarIconeAuxiliar
      >
        <button
          type="button"
          className="nc-tabela-refinada-th-info"
          aria-label={descricaoTooltip}
        >
          <Info weight="fill" size={12} />
        </button>
      </TooltipGlobal>
    </span>
  )
}

function ChipRecolhimentoIcmsSimulaCusto({
  codigo,
  selecionado,
  onSelecionar,
}: {
  codigo: ModalidadeRecolhimentoIcmsSimulaCusto
  selecionado: boolean
  onSelecionar: (codigo: ModalidadeRecolhimentoIcmsSimulaCusto) => void
}) {
  return (
    <TooltipGlobal texto={RECOLHIMENTO_ICMS_HINTS[codigo]} posicao="bottom">
      <button
        type="button"
        aria-pressed={selecionado}
        className={`nc-recolhimento-icms-btn${selecionado ? ' nc-recolhimento-icms-btn--selected' : ''}`}
        onClick={() => onSelecionar(codigo)}
      >
        {RECOLHIMENTO_ICMS_LABELS[codigo]}
      </button>
    </TooltipGlobal>
  )
}

const FORM_DEFAULTS: FormularioComItensSimulaCusto = {
  referencia_simula_custo: '',
  tipo_operacao_simula_custo: 'IMPORTACAO',
  detalhe_operacao_simula_custo: 'DIRETA',
  ncm_simula_custo: '',
  incoterm_simula_custo: 'FOB',
  quantidade_simula_custo: 1,
  moeda_produto_simula_custo: 'USD',
  valor_produto_simula_custo: 0,
  moeda_frete_simula_custo: 'USD',
  valor_frete_simula_custo: 0,
  enviar_solicitacao_cotacao_frete_simula_custo: false,
  moeda_seguro_simula_custo: 'USD',
  valor_seguro_simula_custo: 0,
  uf_desembaraco_simula_custo: 'SP',
  modalidade_recolhimento_icms_simula_custo: 'INTEGRAL',
  // Alíquotas: zero até Cadastros/UF ou digitação explícita (REGRA 05.1 — proibido inventar).
  aliquota_icms_simula_custo: 0,
  aliquota_ii_simula_custo: 0,
  aliquota_ipi_simula_custo: 0,
  aliquota_pis_simula_custo: 0,
  aliquota_cofins_simula_custo: 0,
  reducao_ii_simula_custo: 0,
  reducao_icms_base_simula_custo: 0,
  taxas_origem: [],
  taxas_destino: [],
  documentos: [],
  prazos_pagamento: [],
  itens_produto_simula_custo: [{ ...ITEM_PRODUTO_VAZIO_SIMULA_CUSTO }],
}

const PRAZO_PAGAMENTO_VAZIO: PrazoPagamentoEntradaSimulaCusto = {
  valor_prazo_pagamento_simula_custo: 0,
  tipo_valor_prazo_pagamento_simula_custo: 'PERCENTUAL',
  momento_prazo_pagamento_simula_custo: 'NO_DIA',
  dias_prazo_pagamento_simula_custo: 0,
  fato_gerador_prazo_pagamento_simula_custo: 'PRODUCAO',
}

/** Valor monetário com máscara BR (0.000,00) — padrão CampoDecimalGlobal. */
function CampoValorMonetarioSimulaCusto({
  valor,
  onChange,
  placeholder = '0,00',
  required,
  compacto = false,
}: {
  valor: number
  onChange: (valor: number) => void
  placeholder?: string
  required?: boolean
  compacto?: boolean
}) {
  return (
    <CampoDecimalGlobal
      valor={valor === 0 ? null : valor}
      aoMudarValor={(n) => onChange(n ?? 0)}
      casasDecimais={2}
      placeholder={placeholder}
      textAlign="left"
      aria-invalid={required && valor <= 0 ? true : undefined}
      style={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
        minHeight: compacto ? '2rem' : '2.5rem',
        padding: compacto ? '0.375rem 0.5rem' : '0.5625rem 0.875rem',
        background: 'var(--ws-bg-body, var(--bg-body, #0f172a))',
        border: '1.5px solid var(--nc-accent-border, rgba(129, 140, 248, 0.2))',
        borderRadius: compacto ? '6px' : 'var(--radius-md, 8px)',
        color: 'var(--text-primary, #f1f5f9)',
        fontSize: compacto ? '0.8125rem' : '0.875rem',
        outline: 'none',
        fontFamily: 'inherit',
      }}
    />
  )
}

/** Nome da taxa — catálogo Cadastros ou digitação livre (combobox). */
function CampoNomeTaxaSimulaCusto({
  valor,
  opcoes,
  carregando,
  placeholder,
  ariaLabel,
  onChange,
  onSelecionarCatalogo,
}: {
  valor: string
  opcoes: SelectOpcao[]
  carregando: boolean
  placeholder: string
  ariaLabel: string
  onChange: (nome: string) => void
  onSelecionarCatalogo: (idTaxa: string) => void
}) {
  const { t } = useTranslation()
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState(valor)
  const containerRef = useRef<HTMLDivElement>(null)
  const listaId = useId()

  useEffect(() => {
    setTexto(valor)
  }, [valor])

  const opcoesFiltradas = useMemo(() => {
    const termo = texto.trim().toLowerCase()
    const base = termo
      ? opcoes.filter((opcao) => opcao.rotulo.toLowerCase().includes(termo))
      : opcoes
    return base.slice(0, 30)
  }, [opcoes, texto])

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  const mostrarLista = aberto && (carregando || opcoesFiltradas.length > 0)

  return (
    <div className="nc-campo-taxa-nome" ref={containerRef}>
      <div className={`nc-campo-taxa-nome__inner${aberto ? ' nc-campo-taxa-nome__inner--aberto' : ''}`}>
        <input
          className="nc-campo-taxa-nome__input"
          type="text"
          value={texto}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-expanded={aberto}
          aria-controls={listaId}
          aria-autocomplete="list"
          role="combobox"
          onChange={(evento) => {
            const proximo = evento.target.value
            setTexto(proximo)
            onChange(proximo)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
        />
        <button
          type="button"
          className="nc-campo-taxa-nome__toggle"
          aria-label={t('simulacusto.formulario.taxa_abrir_catalogo', 'Abrir catálogo de taxas')}
          onClick={() => setAberto((estado) => !estado)}
          disabled={carregando}
        >
          <CaretDown weight="bold" size={12} aria-hidden />
        </button>
      </div>
      {mostrarLista ? (
        <ul id={listaId} className="nc-campo-taxa-nome__lista" role="listbox">
          {carregando ? (
            <li className="nc-campo-taxa-nome__estado" role="presentation">
              {t('acoes.carregando', 'Carregando...')}
            </li>
          ) : (
            opcoesFiltradas.map((opcao) => (
              <li
                key={String(opcao.valor)}
                role="option"
                className="nc-campo-taxa-nome__opcao"
                onMouseDown={(evento) => evento.preventDefault()}
                onClick={() => {
                  onSelecionarCatalogo(String(opcao.valor))
                  setTexto(opcao.rotulo)
                  setAberto(false)
                }}
              >
                {opcao.rotulo}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

/** Select de moeda — SSOT Cadastros via SelectGlobal (padrão Bid Frete). */
function SelectMoedaSimulaCusto({
  valor,
  onChange,
  opcoes,
  carregando,
  indisponivel,
  erro,
  placeholder,
  compacto = false,
}: {
  valor: string
  onChange: (codigo: string) => void
  opcoes: SelectOpcao[]
  carregando: boolean
  indisponivel: boolean
  erro: string | null
  placeholder?: string
  compacto?: boolean
}) {
  const { t } = useTranslation()
  const opcoesComAtual = useMemo(() => {
    if (!valor || opcoes.some((o) => o.valor === valor)) return opcoes
    return [{ valor, rotulo: valor }, ...opcoes]
  }, [opcoes, valor])

  return (
    <div className={`nc-select-moeda nc-select-moeda--iso${compacto ? ' nc-select-moeda--compacto' : ''}`}>
      <SelectGlobal
        opcoes={opcoesComAtual}
        valor={valor || null}
        aoMudarValor={(v) => onChange(v == null ? '' : String(v))}
        buscavel
        carregando={carregando}
        desabilitado={indisponivel}
        tamanho={compacto ? 'compacto' : undefined}
        placeholder={
          erro
            ? t('simulacusto.formulario.moeda_erro', 'Erro ao carregar moedas')
            : (!carregando && opcoes.length === 0)
              ? t('simulacusto.formulario.moeda_sem_cadastro', 'Nenhuma moeda cadastrada')
              : (placeholder ?? t('simulacusto.formulario.moeda_selecionar', 'Moeda'))
        }
        posicao="auto"
        monoValor
        aria-label={t('simulacusto.formulario.moeda', 'Moeda')}
      />
    </div>
  )
}

/** Select de UF — padrão Bid Frete (sigla buscável, SSOT `/unidades-federativas`). */
function SelectUfDesembaracoSimulaCusto({
  valor,
  onChange,
  opcoes,
  carregando,
}: {
  valor: string
  onChange: (uf: string) => void
  opcoes: SelectOpcao[]
  carregando: boolean
}) {
  const { t } = useTranslation()

  return (
    <SelectGlobal
      opcoes={opcoes}
      valor={valor || null}
      aoMudarValor={(v) => {
        if (v) onChange(String(v))
      }}
      placeholder={t('simulacusto.formulario.uf_selecionar', 'Selecione o UF')}
      buscavel
      carregando={carregando}
      desabilitado={!carregando && opcoes.length === 0}
      posicao="auto"
      monoValor
      aria-label={t('simulacusto.formulario.uf_desembaraco', 'UF de desembaraço')}
    />
  )
}

export default function FormularioSimulaCusto() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id_simula_custo: id } = useParams<{ id_simula_custo: string }>()
  const isEdicao = Boolean(id)

  const [form, setForm] = useState<FormularioComItensSimulaCusto>(FORM_DEFAULTS)
  const [resultado, setResultado] = useState<ResultadoSimulacaoSimulaCusto | null>(null)
  const [ufs, setUfs] = useState<UfSimulaCusto[]>([])
  const [carregandoUfs, setCarregandoUfs] = useState(true)
  const [passo, setPasso] = useState(1)
  const [faseResultado, setFaseResultado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimosNcm, setUltimosNcm] = useState<NcmRecenteSimulaCusto[]>(() => semearUltimosNcmSimulaCustoDev())
  const [avisoAliquotasNcm, setAvisoAliquotasNcm] = useState<string | null>(null)
  const [carregandoAliquotasNcm, setCarregandoAliquotasNcm] = useState(false)
  const [aliquotasPresentes, setAliquotasPresentes] = useState<{
    ii: boolean
    ipi: boolean
    pis: boolean
    cofins: boolean
  } | null>(null)
  const retryAliquotasIiIpiRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const catalogoTaxasOrigem = useTaxasOrigemDestinoCadastrosSimulaCusto('ORIGEM')
  const catalogoTaxasDestino = useTaxasOrigemDestinoCadastrosSimulaCusto('DESTINO')
  const {
    opcoes: opcoesMoeda,
    loading: carregandoMoedas,
    erro: erroMoedas,
    indisponivel: moedasIndisponiveis,
  } = useOpcoesMoedaCadastrosSimulaCusto()

  const textoAliquotaPct = (fracao: number, presente: boolean) => {
    if (!presente) return ''
    return (fracao * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const aplicarAliquotasNoFormulario = (
    aliquotas: AliquotasNcmPctSimulaCusto,
    descricao?: string,
  ) => {
    const presentes = {
      ii: aliquotas.ii != null,
      ipi: aliquotas.ipi != null,
      pis: aliquotas.pis != null,
      cofins: aliquotas.cofins != null,
    }
    if (!presentes.ii && !presentes.ipi && !presentes.pis && !presentes.cofins) return

    setAliquotasPresentes(presentes)
    setForm((prev) => ({
      ...prev,
      ...(descricao ? { descricao_ncm_simula_custo: descricao } : {}),
      ...(presentes.ii ? { aliquota_ii_simula_custo: (aliquotas.ii ?? 0) / 100 } : {}),
      ...(presentes.ipi ? { aliquota_ipi_simula_custo: (aliquotas.ipi ?? 0) / 100 } : {}),
      ...(presentes.pis ? { aliquota_pis_simula_custo: (aliquotas.pis ?? 0) / 100 } : {}),
      ...(presentes.cofins ? { aliquota_cofins_simula_custo: (aliquotas.cofins ?? 0) / 100 } : {}),
    }))
  }

  const mesclarAliquotasNcm = (
    resposta: AliquotasNcmPctSimulaCusto,
    fallback?: AliquotasNcmPctSimulaCusto,
  ): AliquotasNcmPctSimulaCusto => ({
    ii: resposta.ii ?? fallback?.ii ?? null,
    ipi: resposta.ipi ?? fallback?.ipi ?? null,
    pis: resposta.pis ?? fallback?.pis ?? null,
    cofins: resposta.cofins ?? fallback?.cofins ?? null,
  })

  const passosWizard = useMemo(
    () => [
      {
        id: 1,
        label: t('simulacusto.formulario.step_operacao', 'Operação'),
        icone: <GearSix weight="duotone" size={18} />,
      },
      {
        id: 2,
        label: t('simulacusto.formulario.step_aliquotas', 'Alíquotas'),
        icone: <Calculator weight="duotone" size={18} />,
      },
      {
        id: 3,
        label: t('simulacusto.formulario.step_valores', 'Valores'),
        icone: <CurrencyCircleDollar weight="duotone" size={18} />,
      },
      {
        id: 4,
        label: t('simulacusto.formulario.step_conferencia', 'Conferência'),
        icone: <ListPlus weight="duotone" size={18} />,
      },
    ],
    [t],
  )

  const opcoesUfDesembaraco = useMemo((): SelectOpcao[] => {
    const base = ufs.map((u) => ({ valor: u.uf, rotulo: u.uf }))
    const atual = form.uf_desembaraco_simula_custo
    if (atual && !base.some((o) => o.valor === atual)) {
      return [{ valor: atual, rotulo: atual }, ...base]
    }
    return base
  }, [ufs, form.uf_desembaraco_simula_custo])

  const podeAvancar = (): boolean => {
    if (passo === 1) return true
    if (passo === 2) {
      return Boolean(form.uf_desembaraco_simula_custo)
    }
    if (passo === 3) {
      return passoValoresCompletoSimulaCusto(form)
    }
    return true
  }

  useEffect(() => {
    void (async () => {
      setCarregandoUfs(true)
      try {
        const listaUf = await listarUfsSimulaCusto()
        setUfs(listaUf)
        const info = listaUf.find((u) => u.uf === 'SP') ?? listaUf[0]
        if (info) {
          setForm((prev) => ({
            ...prev,
            uf_desembaraco_simula_custo: info.uf,
            aliquota_icms_simula_custo: info.icms,
          }))
        }
      } catch {
        setUfs([])
      } finally {
        setCarregandoUfs(false)
      }
    })()
  }, [])

  // Carregar simula existente em modo edição
  useEffect(() => {
    if (!id) return
    obterSimulaCusto(id).then(est => {
      const base: FormularioComItensSimulaCusto = {
        referencia_simula_custo: est.referencia_simula_custo ?? '',
        tipo_operacao_simula_custo: est.tipo_operacao_simula_custo,
        detalhe_operacao_simula_custo: est.detalhe_operacao_simula_custo,
        ncm_simula_custo: est.ncm_simula_custo,
        descricao_ncm_simula_custo: est.descricao_ncm_simula_custo ?? undefined,
        incoterm_simula_custo: est.incoterm_simula_custo,
        quantidade_simula_custo: est.quantidade_simula_custo ?? 1,
        moeda_produto_simula_custo: est.moeda_produto_simula_custo,
        valor_produto_simula_custo: est.valor_produto_simula_custo ?? 0,
        moeda_frete_simula_custo: est.moeda_frete_simula_custo,
        valor_frete_simula_custo: est.valor_frete_simula_custo ?? 0,
        enviar_solicitacao_cotacao_frete_simula_custo: est.enviar_solicitacao_cotacao_frete_simula_custo ?? false,
        moeda_seguro_simula_custo: est.moeda_seguro_simula_custo,
        valor_seguro_simula_custo: est.valor_seguro_simula_custo ?? 0,
        uf_desembaraco_simula_custo: est.uf_desembaraco_simula_custo,
        modalidade_recolhimento_icms_simula_custo: est.modalidade_recolhimento_icms_simula_custo
          ?? (est.usa_beneficio_simula_custo || est.aliquota_icms_simula_custo === 0 ? 'ISENTO' : 'INTEGRAL'),
        aliquota_icms_simula_custo: est.aliquota_icms_simula_custo,
        aliquota_ii_simula_custo: est.aliquota_ii_simula_custo,
        aliquota_ipi_simula_custo: est.aliquota_ipi_simula_custo,
        aliquota_pis_simula_custo: est.aliquota_pis_simula_custo,
        aliquota_cofins_simula_custo: est.aliquota_cofins_simula_custo,
        reducao_ii_simula_custo: est.reducao_ii_simula_custo,
        usa_beneficio_simula_custo: est.usa_beneficio_simula_custo,
        taxas_origem: est.taxas_origem.map(tx => ({
          id_taxa_origem_destino: tx.id_taxa_origem_destino,
          nome_taxa_origem_simula_custo: tx.nome_taxa_origem_simula_custo,
          moeda_taxa_origem_simula_custo: tx.moeda_taxa_origem_simula_custo,
          tipo_cobranca_taxa_origem_simula_custo: tx.tipo_cobranca_taxa_origem_simula_custo,
          valor_minimo_taxa_origem_simula_custo: tx.valor_minimo_taxa_origem_simula_custo,
          valor_total_taxa_origem_simula_custo: tx.valor_total_taxa_origem_simula_custo,
        })),
        taxas_destino: est.taxas_destino.map(tx => ({
          id_taxa_origem_destino: tx.id_taxa_origem_destino,
          nome_taxa_destino_simula_custo: tx.nome_taxa_destino_simula_custo,
          moeda_taxa_destino_simula_custo: tx.moeda_taxa_destino_simula_custo,
          tipo_cobranca_taxa_destino_simula_custo: tx.tipo_cobranca_taxa_destino_simula_custo,
          valor_minimo_taxa_destino_simula_custo: tx.valor_minimo_taxa_destino_simula_custo,
          valor_total_taxa_destino_simula_custo: tx.valor_total_taxa_destino_simula_custo,
        })),
        documentos: est.documentos.map(d => ({
          tipo_documento_simula_custo: d.tipo_documento_simula_custo,
          numero_documento_simula_custo: d.numero_documento_simula_custo,
        })),
        prazos_pagamento: (est.prazos_pagamento ?? []).map((p) => ({
          valor_prazo_pagamento_simula_custo: p.valor_prazo_pagamento_simula_custo,
          tipo_valor_prazo_pagamento_simula_custo: p.tipo_valor_prazo_pagamento_simula_custo,
          momento_prazo_pagamento_simula_custo: p.momento_prazo_pagamento_simula_custo,
          dias_prazo_pagamento_simula_custo: p.dias_prazo_pagamento_simula_custo,
          fato_gerador_prazo_pagamento_simula_custo: p.fato_gerador_prazo_pagamento_simula_custo,
        })),
      }
      const doStorage = lerItensProdutoStorageSimulaCusto(id)
      setForm({
        ...base,
        itens_produto_simula_custo: doStorage ?? itensProdutoFromLegadoSimulaCusto(base),
      })
    }).catch(() => setError(t('simulacusto.formulario.nao_encontrada', 'Simula não encontrada')))
  }, [id, t])

  useEffect(() => {
    salvarItensProdutoStorageSimulaCusto(form.itens_produto_simula_custo, id)
  }, [form.itens_produto_simula_custo, id])

  const aplicarSincroniaItensProduto = (
    proximo: FormularioComItensSimulaCusto,
  ): FormularioComItensSimulaCusto => ({
    ...sincronizarProdutoLegadoSimulaCusto(proximo),
    itens_produto_simula_custo: proximo.itens_produto_simula_custo,
  })

  const update = <K extends keyof FormularioComItensSimulaCusto>(
    campo: K,
    valor: FormularioComItensSimulaCusto[K],
  ) => setForm((prev) => ({ ...prev, [campo]: valor }))

  const aplicarModalidadeRecolhimentoIcms = (modalidade: ModalidadeRecolhimentoIcmsSimulaCusto) => {
    const aliquotaInterna = resolverAliquotaInternaUfFormulario(form.uf_desembaraco_simula_custo, ufs)
    setForm((prev) => {
      const reducaoBase = modalidade === 'REDUCAO' ? (prev.reducao_icms_base_simula_custo ?? 0) : 0
      return {
        ...prev,
        modalidade_recolhimento_icms_simula_custo: modalidade,
        reducao_icms_base_simula_custo: reducaoBase,
        aliquota_icms_simula_custo: resolverAliquotaIcmsFormulario(modalidade, aliquotaInterna, reducaoBase),
        usa_beneficio_simula_custo: modalidade === 'ISENTO',
      }
    })
  }

  const aplicarUfDesembaraco = (uf: string) => {
    const info = ufs.find((u) => u.uf === uf)
    if (!info) return
    const modalidade = form.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL'
    const reducaoBase = form.reducao_icms_base_simula_custo ?? 0
    setForm((prev) => ({
      ...prev,
      uf_desembaraco_simula_custo: uf,
      aliquota_icms_simula_custo: resolverAliquotaIcmsFormulario(modalidade, info.icms, reducaoBase),
    }))
  }

  // Pré-preenche alíquotas TEC do Cadastros quando o NCM completa 8 dígitos.
  // A validação visual (badge verde/amarelo) é do próprio SelectNcmGlobal.
  const aplicarAliquotasNcm = async (
    codigo: string,
    cacheAliquotas?: AliquotasNcmPctSimulaCusto,
  ) => {
    const digitos = codigo.replace(/\D/g, '').slice(0, 8)
    if (!/^\d{8}$/.test(digitos)) {
      setAliquotasPresentes(null)
      setAvisoAliquotasNcm(null)
      return
    }
    setCarregandoAliquotasNcm(true)
    setAvisoAliquotasNcm(null)
    try {
      const v = await validarNcmSimulaCusto(digitos)
      if (!v.valido) {
        setAliquotasPresentes({ ii: false, ipi: false, pis: false, cofins: false })
        setAvisoAliquotasNcm(v.motivo ?? t('simulacusto.formulario.ncm_invalido', 'NCM inválido no Cadastros.'))
        setForm((prev) => ({
          ...prev,
          aliquota_ii_simula_custo: 0,
          aliquota_ipi_simula_custo: 0,
          aliquota_pis_simula_custo: 0,
          aliquota_cofins_simula_custo: 0,
        }))
        return
      }

      const merged = aplicarPadraoPisCofinsNcmSimulaCusto(
        mesclarAliquotasNcm(
          { ii: v.ii, ipi: v.ipi, pis: v.pis, cofins: v.cofins },
          cacheAliquotas,
        ),
      )
      const presentes = {
        ii: merged.ii != null,
        ipi: merged.ipi != null,
        pis: merged.pis != null,
        cofins: merged.cofins != null,
      }
      setAliquotasPresentes(presentes)
      const temIiIpi = presentes.ii || presentes.ipi
      setAvisoAliquotasNcm(
        temIiIpi
          ? null
          : (v.motivo ?? t(
            presentes.pis && presentes.cofins
              ? 'simulacusto.formulario.ncm_sem_ii_ipi'
              : 'simulacusto.formulario.ncm_sem_aliquotas',
            presentes.pis && presentes.cofins
              ? 'NCM válido. PIS e COFINS aplicados. II e IPI pendentes — sincronize a TEC e a TIPI no Admin NCM.'
              : 'NCM válido, mas sem II/IPI no Cadastros — sincronize a TEC e a TIPI no Admin NCM.',
          )),
      )
      aplicarAliquotasNoFormulario(merged, v.descricao ?? undefined)
      setUltimosNcm(registrarUltimoNcmSimulaCusto(digitos, v.descricao ?? undefined, merged))

      if (!temIiIpi) {
        if (retryAliquotasIiIpiRef.current) clearTimeout(retryAliquotasIiIpiRef.current)
        retryAliquotasIiIpiRef.current = setTimeout(() => {
          void validarNcmSimulaCusto(digitos)
            .then((retry) => {
              if (!retry.valido || (retry.ii == null && retry.ipi == null)) return
              const retryMerged = aplicarPadraoPisCofinsNcmSimulaCusto(
                mesclarAliquotasNcm(
                  { ii: retry.ii, ipi: retry.ipi, pis: retry.pis, cofins: retry.cofins },
                  merged,
                ),
              )
              const retryPresentes = {
                ii: retryMerged.ii != null,
                ipi: retryMerged.ipi != null,
                pis: retryMerged.pis != null,
                cofins: retryMerged.cofins != null,
              }
              setAliquotasPresentes(retryPresentes)
              if (retryPresentes.ii || retryPresentes.ipi) setAvisoAliquotasNcm(null)
              aplicarAliquotasNoFormulario(retryMerged, retry.descricao ?? undefined)
              setUltimosNcm(registrarUltimoNcmSimulaCusto(digitos, retry.descricao ?? undefined, retryMerged))
            })
            .catch(() => { /* mantém aviso atual */ })
        }, 4000)
      }
    } catch (err: unknown) {
      if (cacheAliquotas && (cacheAliquotas.ii != null || cacheAliquotas.ipi != null
        || cacheAliquotas.pis != null || cacheAliquotas.cofins != null)) {
        aplicarAliquotasNoFormulario(cacheAliquotas)
      } else {
        setAliquotasPresentes({ ii: false, ipi: false, pis: false, cofins: false })
      }
      setAvisoAliquotasNcm(
        err instanceof Error
          ? err.message
          : t('simulacusto.formulario.erro_aliquotas_ncm', 'Não foi possível carregar alíquotas do Cadastros.'),
      )
    } finally {
      setCarregandoAliquotasNcm(false)
    }
  }

  // Seed da lista "Últimos" — localStorage + NCMs distintos das simulas da org (até 30)
  useEffect(() => () => {
    if (retryAliquotasIiIpiRef.current) clearTimeout(retryAliquotasIiIpiRef.current)
  }, [])

  useEffect(() => {
    let cancelado = false
    void listarNcmsRecentesSimulaCusto()
      .then((ncms) => {
        if (cancelado) return
        setUltimosNcm((prev) => mesclarUltimosNcmSimulaCusto(
          prev,
          ncms,
          import.meta.env.DEV ? ncmsPreviewSimulaCusto() : [],
        ))
      })
      .catch(() => { /* sem seed remoto — mantém localStorage */ })
    return () => { cancelado = true }
  }, [])

  // onChange do SelectNcmGlobal — digitação ou seleção no modal Buscar NCM / Últimos
  const handleNcmChange = (
    codigo: string,
    descricao?: string,
    cacheAliquotas?: AliquotasNcmPctSimulaCusto,
  ) => {
    const digitos = codigo.replace(/\D/g, '').slice(0, 8)
    setForm((prev) => {
      const itens = [...(prev.itens_produto_simula_custo ?? [])]
      if (itens.length > 0) {
        itens[0] = {
          ...itens[0],
          ncm_item_produto_simula_custo: digitos,
          ...(descricao ? { descricao_ncm_item_produto_simula_custo: descricao } : {}),
        }
      }
      return aplicarSincroniaItensProduto({
        ...prev,
        ncm_simula_custo: digitos,
        ...(descricao ? { descricao_ncm_simula_custo: descricao } : {}),
        itens_produto_simula_custo: itens,
      })
    })
    if (digitos.length === 8) {
      if (cacheAliquotas) {
        aplicarAliquotasNoFormulario(cacheAliquotas, descricao)
      }
      setUltimosNcm(registrarUltimoNcmSimulaCusto(digitos, descricao, cacheAliquotas))
      void aplicarAliquotasNcm(digitos, cacheAliquotas)
    } else {
      setAliquotasPresentes(null)
      setAvisoAliquotasNcm(null)
    }
  }

  // ─── Prazos de pagamento ──────────────────────────────────────────────────
  const addPrazoPagamento = () =>
    update('prazos_pagamento', [...form.prazos_pagamento, { ...PRAZO_PAGAMENTO_VAZIO }])

  const updatePrazoPagamento = <K extends keyof PrazoPagamentoEntradaSimulaCusto>(
    index: number,
    campo: K,
    valor: PrazoPagamentoEntradaSimulaCusto[K],
  ) => {
    const linhas = [...form.prazos_pagamento]
    linhas[index] = { ...linhas[index], [campo]: valor }
    update('prazos_pagamento', linhas)
  }

  const removePrazoPagamento = (index: number) =>
    update('prazos_pagamento', form.prazos_pagamento.filter((_, i) => i !== index))

  // ─── Documentos ───────────────────────────────────────────────────────────
  const addDocumento = () =>
    update('documentos', [...form.documentos, { tipo_documento_simula_custo: 'INVOICE', numero_documento_simula_custo: '' }])

  const updateDocumento = (index: number, campo: 'tipo_documento_simula_custo' | 'numero_documento_simula_custo', valor: string) => {
    const docs = [...form.documentos]
    docs[index] = { ...docs[index], [campo]: valor }
    update('documentos', docs)
  }

  const removeDocumento = (index: number) =>
    update('documentos', form.documentos.filter((_, i) => i !== index))

  // ─── Itens de produto (multi-linha) ───────────────────────────────────────
  const addItemProduto = () =>
    setForm((prev) => {
      const itens = [...prev.itens_produto_simula_custo]
      if (itens.length === 1) {
        itens[0] = normalizarItemUnicoParaMultiItensSimulaCusto(prev)
      }
      itens.push({ ...ITEM_PRODUTO_VAZIO_SIMULA_CUSTO })
      return aplicarSincroniaItensProduto({ ...prev, itens_produto_simula_custo: itens })
    })

  const updateItemProduto = <K extends keyof ItemProdutoEntradaSimulaCusto>(
    index: number,
    campo: K,
    valor: ItemProdutoEntradaSimulaCusto[K],
  ) => {
    setForm((prev) => {
      const itens = [...prev.itens_produto_simula_custo]
      itens[index] = { ...itens[index], [campo]: valor }
      return aplicarSincroniaItensProduto({ ...prev, itens_produto_simula_custo: itens })
    })
  }

  const handleItemNcmChange = (
    index: number,
    codigo: string,
    descricao?: string,
    cacheAliquotas?: AliquotasNcmPctSimulaCusto,
  ) => {
    const digitos = codigo.replace(/\D/g, '').slice(0, 8)
    setForm((prev) => {
      const itens = [...prev.itens_produto_simula_custo]
      itens[index] = {
        ...itens[index],
        ncm_item_produto_simula_custo: digitos,
        ...(descricao ? { descricao_ncm_item_produto_simula_custo: descricao } : {}),
      }
      return aplicarSincroniaItensProduto({
        ...prev,
        ...(index === 0
          ? {
            ncm_simula_custo: digitos,
            ...(descricao ? { descricao_ncm_simula_custo: descricao } : {}),
          }
          : {}),
        itens_produto_simula_custo: itens,
      })
    })
    if (index === 0 && digitos.length === 8) {
      if (cacheAliquotas) {
        aplicarAliquotasNoFormulario(cacheAliquotas, descricao)
      }
      setUltimosNcm(registrarUltimoNcmSimulaCusto(digitos, descricao, cacheAliquotas))
      void aplicarAliquotasNcm(digitos, cacheAliquotas)
    } else if (index === 0) {
      setAliquotasPresentes(null)
      setAvisoAliquotasNcm(null)
    }
  }

  const removeItemProduto = (index: number) => {
    if (form.itens_produto_simula_custo.length <= 1) return
    setForm((prev) => aplicarSincroniaItensProduto({
      ...prev,
      itens_produto_simula_custo: prev.itens_produto_simula_custo.filter((_, i) => i !== index),
    }))
  }

  // ─── Taxas (nome via SelectGlobal do catálogo Cadastros) ───────────────────
  const addTaxa = (lado: LadoTaxaSimulaCusto = 'taxas_destino') =>
    update(lado, [
      ...form[lado],
      lado === 'taxas_origem'
        ? criarTaxaOrigemEntradaVaziaSimulaCusto()
        : criarTaxaDestinoEntradaVaziaSimulaCusto(),
    ])

  const updateTaxa = (
    lado: LadoTaxaSimulaCusto,
    index: number,
    campo: 'moeda' | 'valor_total',
    valor: string | number,
  ) => {
    const taxas = [...form[lado]]
    const atual = taxas[index]
    if (!atual) return
    if (lado === 'taxas_origem') {
      taxas[index] = campo === 'moeda'
        ? { ...atual, moeda_taxa_origem_simula_custo: String(valor) }
        : { ...atual, valor_total_taxa_origem_simula_custo: Number(valor) }
    } else {
      taxas[index] = campo === 'moeda'
        ? { ...atual, moeda_taxa_destino_simula_custo: String(valor) }
        : { ...atual, valor_total_taxa_destino_simula_custo: Number(valor) }
    }
    update(lado, taxas)
  }

  const selecionarTaxaCatalogo = (
    lado: LadoTaxaSimulaCusto,
    index: number,
    idTaxa: string | null,
  ) => {
    const catalogo = lado === 'taxas_origem' ? catalogoTaxasOrigem.taxas : catalogoTaxasDestino.taxas
    const taxas = [...form[lado]]
    if (!idTaxa) {
      if (lado === 'taxas_origem') {
        taxas[index] = { ...taxas[index], id_taxa_origem_destino: null, nome_taxa_origem_simula_custo: '' }
      } else {
        taxas[index] = { ...taxas[index], id_taxa_origem_destino: null, nome_taxa_destino_simula_custo: '' }
      }
      update(lado, taxas)
      return
    }
    const encontrada = catalogo.find((t) => t.id_taxa_origem_destino === idTaxa)
    if (lado === 'taxas_origem') {
      taxas[index] = {
        ...taxas[index],
        id_taxa_origem_destino: idTaxa,
        nome_taxa_origem_simula_custo: encontrada?.nome_taxa_origem_destino
          ?? taxas[index].nome_taxa_origem_simula_custo,
      }
    } else {
      taxas[index] = {
        ...taxas[index],
        id_taxa_origem_destino: idTaxa,
        nome_taxa_destino_simula_custo: encontrada?.nome_taxa_origem_destino
          ?? taxas[index].nome_taxa_destino_simula_custo,
      }
    }
    update(lado, taxas)
  }

  const editarNomeTaxa = (
    lado: LadoTaxaSimulaCusto,
    index: number,
    nome: string,
  ) => {
    const catalogoLista = lado === 'taxas_origem' ? catalogoTaxasOrigem.taxas : catalogoTaxasDestino.taxas
    const taxas = [...form[lado]]
    const nomeNormalizado = nome.trim().toLowerCase()
    const correspondencia = catalogoLista.find(
      (item) => item.nome_taxa_origem_destino.trim().toLowerCase() === nomeNormalizado,
    )
    if (lado === 'taxas_origem') {
      taxas[index] = {
        ...taxas[index],
        nome_taxa_origem_simula_custo: nome,
        id_taxa_origem_destino: correspondencia?.id_taxa_origem_destino ?? null,
      }
    } else {
      taxas[index] = {
        ...taxas[index],
        nome_taxa_destino_simula_custo: nome,
        id_taxa_origem_destino: correspondencia?.id_taxa_origem_destino ?? null,
      }
    }
    update(lado, taxas)
  }

  const removeTaxa = (lado: 'taxas_origem' | 'taxas_destino', index: number) =>
    update(lado, form[lado].filter((_, i) => i !== index))

  const alterarLadoTaxa = (
    ladoAtual: LadoTaxaSimulaCusto,
    index: number,
    novoLado: LadoTaxaSimulaCusto,
  ) => {
    if (ladoAtual === novoLado) return
    const origem = [...form.taxas_origem]
    const destino = [...form.taxas_destino]
    const removidas = ladoAtual === 'taxas_origem' ? origem.splice(index, 1) : destino.splice(index, 1)
    if (!removidas[0]) return
    if (novoLado === 'taxas_origem') origem.push(criarTaxaOrigemEntradaVaziaSimulaCusto())
    else destino.push(criarTaxaDestinoEntradaVaziaSimulaCusto())
    setForm((prev) => ({ ...prev, taxas_origem: origem, taxas_destino: destino }))
  }

  const linhasTaxasUnificadas = useMemo(
    () => montarLinhasTaxasUnificadas(form.taxas_origem, form.taxas_destino),
    [form.taxas_origem, form.taxas_destino],
  )

  // ─── Simular (preview, sem persistir) ─────────────────────────────────────
  const handleSimular = async () => {
    const formSincronizado = sincronizarProdutoLegadoSimulaCusto(form)
    if (!/^\d{8}$/.test(formSincronizado.ncm_simula_custo)) {
      setError(t('simulacusto.formulario.ncm_obrigatorio', 'Informe um NCM de 8 dígitos em pelo menos um item.'))
      return
    }
    if (formSincronizado.valor_produto_simula_custo <= 0) {
      setError(t(
        'simulacusto.formulario.valor_produto_obrigatorio',
        ehModoMultiItensProdutoSimulaCusto(form.itens_produto_simula_custo)
          ? 'Informe valor unitário e quantidade em cada item.'
          : 'Informe o valor do produto.',
      ))
      return
    }
    setLoading(true)
    setError(null)
    setResultado(null)
    setFaseResultado(false)
    try {
      // REGRA 05.1 — só calcula com alíquotas da fonte Cadastros (sem chute).
      const fonte = await validarNcmSimulaCusto(formSincronizado.ncm_simula_custo)
      if (!fonte.valido) {
        throw new Error(fonte.motivo ?? t('simulacusto.formulario.ncm_invalido', 'NCM inválido no Cadastros.'))
      }
      if (fonte.ii == null) {
        throw new Error(t(
          'simulacusto.formulario.sem_ii_tec',
          'NCM sem II (TEC) no Cadastros — aguarde o job TEC com cobertura total ou sincronize a TEC.',
        ))
      }
      if (fonte.ipi == null) {
        throw new Error(t(
          'simulacusto.formulario.sem_ipi_tipi',
          'NCM sem IPI (TIPI) no Cadastros — sincronize a TIPI.',
        ))
      }
      if (fonte.pis == null || fonte.cofins == null) {
        throw new Error(t(
          'simulacusto.formulario.sem_pis_cofins',
          'NCM sem PIS/COFINS no Cadastros — reaplique alíquotas legais no Admin NCM.',
        ))
      }
      const ufIcms = ufs.find((u) => u.uf === formSincronizado.uf_desembaraco_simula_custo)
      if (!ufIcms) {
        throw new Error(t(
          'simulacusto.formulario.sem_icms',
          'Selecione a UF de desembaraço para definir o ICMS.',
        ))
      }

      const res = await simularSimulaCusto({
        ncm_simula_custo: formSincronizado.ncm_simula_custo,
        valor_produto_simula_custo: formSincronizado.valor_produto_simula_custo,
        moeda_produto_simula_custo: formSincronizado.moeda_produto_simula_custo,
        valor_frete_simula_custo: formSincronizado.valor_frete_simula_custo,
        moeda_frete_simula_custo: formSincronizado.moeda_frete_simula_custo,
        valor_seguro_simula_custo: formSincronizado.valor_seguro_simula_custo,
        moeda_seguro_simula_custo: formSincronizado.moeda_seguro_simula_custo,
        taxas_origem: formSincronizado.taxas_origem.map(tx => ({
          nome: tx.nome_taxa_origem_simula_custo,
          valor: tx.valor_total_taxa_origem_simula_custo,
          moeda: tx.moeda_taxa_origem_simula_custo,
        })),
        taxas_destino: formSincronizado.taxas_destino.map(tx => ({
          nome: tx.nome_taxa_destino_simula_custo,
          valor: tx.valor_total_taxa_destino_simula_custo,
          moeda: tx.moeda_taxa_destino_simula_custo,
        })),
        uf_desembaraco_simula_custo: formSincronizado.uf_desembaraco_simula_custo,
        // Força alíquotas da fonte oficial (não o que estiver “chutado” no form).
        aliquota_ii_simula_custo: fonte.ii / 100,
        aliquota_ipi_simula_custo: fonte.ipi / 100,
        aliquota_pis_simula_custo: fonte.pis / 100,
        aliquota_cofins_simula_custo: fonte.cofins / 100,
        aliquota_icms_simula_custo: formSincronizado.aliquota_icms_simula_custo,
        aliquota_icms_interna_uf_simula_custo: resolverAliquotaInternaUfFormulario(
          formSincronizado.uf_desembaraco_simula_custo,
          ufs,
        ),
        modalidade_recolhimento_icms_simula_custo: formSincronizado.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL',
        reducao_ii_simula_custo: formSincronizado.reducao_ii_simula_custo,
      })
      setForm((prev) => aplicarSincroniaItensProduto({
        ...prev,
        ...formSincronizado,
        aliquota_ii_simula_custo: fonte.ii! / 100,
        aliquota_ipi_simula_custo: fonte.ipi! / 100,
        aliquota_pis_simula_custo: fonte.pis! / 100,
        aliquota_cofins_simula_custo: fonte.cofins! / 100,
        aliquota_icms_simula_custo: formSincronizado.aliquota_icms_simula_custo,
      }))
      setResultado(res)
      setFaseResultado(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('simulacusto.formulario.erro_simular', 'Erro ao simular'))
    } finally {
      setLoading(false)
    }
  }

  const handleProximo = () => {
    setError(null)
    if (passo < 4) {
      setPasso((p) => p + 1)
      return
    }
    void handleSimular()
  }

  const handleVoltarPasso = () => {
    setError(null)
    if (faseResultado) {
      setFaseResultado(false)
      return
    }
    if (passo > 1) setPasso((p) => p - 1)
  }

  const handleFechar = () => navigate(rotaSimulaCusto('lista'))

  // ─── Salvar ───────────────────────────────────────────────────────────────
  const handleSalvar = async () => {
    setSalvando(true)
    setError(null)
    try {
      const payload: EntradaSimulaCusto = {
        ...sincronizarProdutoLegadoSimulaCusto(form),
        referencia_simula_custo: form.referencia_simula_custo?.trim() || undefined,
      }
      if (isEdicao && id) {
        await atualizarSimulaCusto(id, payload)
      } else {
        await criarSimulaCusto(payload)
      }
      navigate(rotaSimulaCusto('lista'))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('simulacusto.formulario.erro_salvar', 'Erro ao salvar'))
    } finally {
      setSalvando(false)
    }
  }

  const conteudoPasso = () => {
    if (passo === 1) {
      return (
        <div className="nc-step-content nc-fade-in">
          {/* Mesmo padrão Bid Frete: identificação no topo do passo 1 */}
          <Field
            label={t('simulacusto.formulario.referencia', 'Referência Interna')}
            icone={<Hash {...ICONE_LABEL_SECAO} />}
          >
            <input
              className="nc-input"
              type="text"
              maxLength={30}
              placeholder={t('simulacusto.formulario.referencia_placeholder', 'Ex.: Cotação 0001/2026 BID Europa')}
              value={form.referencia_simula_custo ?? ''}
              onChange={(e) => update('referencia_simula_custo', e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>

          <NcSectionTitle obrigatorio icone={<DownloadSimple {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.operacao', 'Operação')}
          </NcSectionTitle>
          <div className="nc-options-grid-2">
            <OptionButton
              selected={form.tipo_operacao_simula_custo === 'IMPORTACAO'}
              onClick={() => update('tipo_operacao_simula_custo', 'IMPORTACAO')}
              icon={<DownloadSimple weight="duotone" size={22} />}
              label={OPERACAO_LABELS.IMPORTACAO}
              description={t('simulacusto.formulario.operacao_desc_importacao', 'Entrada de mercadoria no Brasil')}
            />
            <OptionButton
              selected={form.tipo_operacao_simula_custo === 'EXPORTACAO'}
              onClick={() => update('tipo_operacao_simula_custo', 'EXPORTACAO')}
              icon={<UploadSimple weight="duotone" size={22} />}
              label={OPERACAO_LABELS.EXPORTACAO}
              description={t('simulacusto.formulario.operacao_desc_exportacao', 'Saída de mercadoria do Brasil')}
            />
          </div>

          <NcSectionTitle obrigatorio icone={<Handshake {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.modalidade', 'Modalidade')}
          </NcSectionTitle>
          <div className="nc-options-grid-3">
            <OptionButton
              selected={form.detalhe_operacao_simula_custo === 'DIRETA'}
              onClick={() => update('detalhe_operacao_simula_custo', 'DIRETA')}
              icon={<Buildings weight="duotone" size={22} />}
              label={DETALHE_OPERACAO_LABELS.DIRETA}
              description={t(
                'simulacusto.formulario.modalidade_desc_direta',
                'Importação/exportação em nome próprio',
              )}
            />
            <OptionButton
              selected={ehModalidadeTrading(form.detalhe_operacao_simula_custo)}
              onClick={() => update('detalhe_operacao_simula_custo', DETALHE_OPERACAO_TRADING_PADRAO)}
              icon={<Handshake weight="duotone" size={22} />}
              label={t('simulacusto.formulario.modalidade_trading', 'Trading')}
              description={t(
                'simulacusto.formulario.modalidade_desc_trading',
                'Conta e ordem ou encomenda, operação via trading',
              )}
            />
            <OptionButton
              selected={form.detalhe_operacao_simula_custo === 'COMERCIAL_EXPORTADORA'}
              onClick={() => update('detalhe_operacao_simula_custo', 'COMERCIAL_EXPORTADORA')}
              icon={<Storefront weight="duotone" size={22} />}
              label={DETALHE_OPERACAO_LABELS.COMERCIAL_EXPORTADORA}
              description={t(
                'simulacusto.formulario.modalidade_desc_ce',
                'Via comercial exportadora',
              )}
            />
          </div>

          <section className="nc-incoterm-bloco" aria-labelledby="ne-incoterm-titulo">
            <NcSectionTitle obrigatorio icone={<FileText {...ICONE_LABEL_SECAO} />}>
              <span id="ne-incoterm-titulo">Incoterm</span>
            </NcSectionTitle>
            <p className="nc-incoterm-hint">
              {t(
                'bidfrete.nova_cotacao.hint_incoterm',
                'Escolha quem assume frete e risco até o destino',
              )}
            </p>
            <div
              className="nc-incoterm-grid"
              role="group"
              aria-label="Incoterm"
            >
              {INCOTERMS_SIMULA_CUSTO.map((inc) => (
                <BotaoIncoterm
                  key={inc}
                  codigo={inc}
                  selecionado={form.incoterm_simula_custo === inc}
                  onSelecionar={(codigo) => update('incoterm_simula_custo', codigo)}
                />
              ))}
            </div>
          </section>
        </div>
      )
    }

    if (passo === 2) {
      return (
        <div className="nc-step-content nc-fade-in">
          <NcSectionTitle icone={<Package {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.produto_origem', 'Produto e Origem')}
          </NcSectionTitle>
          <div className="nc-ncm-bloco">
            <Field
              label={t('simulacusto.formulario.ncm', 'NCM (8 dígitos)')}
              required
              className="nc-ncm-bloco__campo"
            >
              <SelectNcmGlobal
                className="nc-campo-ncm__inner"
                label=""
                value={form.ncm_simula_custo}
                onChange={handleNcmChange}
              />
            </Field>
            <PainelUltimosNcmSimulaCusto
              itens={ultimosNcm}
              codigoSelecionado={form.ncm_simula_custo}
              aoSelecionar={handleNcmChange}
            />
          </div>

          <NcSectionTitle icone={<Calculator {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.aliquotas', 'Alíquotas')}
          </NcSectionTitle>
          <p className="nc-field-hint">
            {t(
              'simulacusto.formulario.hint_aliquotas',
              'II, IPI, PIS e COFINS vêm do Cadastros ao informar o NCM (somente leitura).',
            )}
          </p>
          {carregandoAliquotasNcm ? (
            <p className="nc-field-hint">
              {t('simulacusto.formulario.aliquotas_carregando', 'Buscando alíquotas no Cadastros…')}
            </p>
          ) : null}
          {avisoAliquotasNcm ? (
            <p className="nc-field-hint nc-field-hint--erro" role="alert">
              {avisoAliquotasNcm}
            </p>
          ) : null}
          <div className="nc-fields-grid nc-fields-grid--4">
            <Field label="II (%)" required>
              <InputComSufixoPercentual
                className="nc-input--readonly"
                type="text"
                readOnly
                tabIndex={-1}
                placeholder="—"
                value={textoAliquotaPct(form.aliquota_ii_simula_custo, Boolean(aliquotasPresentes?.ii))}
                mostrarSufixo={Boolean(aliquotasPresentes?.ii)}
                title={t('simulacusto.formulario.aliquota_fonte', 'Preenchido pelo Cadastros (TEC)')}
              />
            </Field>
            <Field label="IPI (%)" required>
              <InputComSufixoPercentual
                className="nc-input--readonly"
                type="text"
                readOnly
                tabIndex={-1}
                placeholder="—"
                value={textoAliquotaPct(form.aliquota_ipi_simula_custo, Boolean(aliquotasPresentes?.ipi))}
                mostrarSufixo={Boolean(aliquotasPresentes?.ipi)}
                title={t('simulacusto.formulario.aliquota_fonte_ipi', 'Preenchido pelo Cadastros (TIPI)')}
              />
            </Field>
            <Field label="PIS (%)" required>
              <InputComSufixoPercentual
                className="nc-input--readonly"
                type="text"
                readOnly
                tabIndex={-1}
                placeholder="—"
                value={textoAliquotaPct(form.aliquota_pis_simula_custo, Boolean(aliquotasPresentes?.pis))}
                mostrarSufixo={Boolean(aliquotasPresentes?.pis)}
                title={t('simulacusto.formulario.aliquota_fonte_pis', 'Lei 10.865/2004 — Cadastros')}
              />
            </Field>
            <Field label="COFINS (%)" required>
              <InputComSufixoPercentual
                className="nc-input--readonly"
                type="text"
                readOnly
                tabIndex={-1}
                placeholder="—"
                value={textoAliquotaPct(form.aliquota_cofins_simula_custo, Boolean(aliquotasPresentes?.cofins))}
                mostrarSufixo={Boolean(aliquotasPresentes?.cofins)}
                title={t('simulacusto.formulario.aliquota_fonte_cofins', 'Lei 10.865/2004 — Cadastros')}
              />
            </Field>
          </div>

          <NcSectionTitle icone={<Scales {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.icms', 'ICMS')}
          </NcSectionTitle>
          <p className="nc-field-hint">
            {t(
              'simulacusto.formulario.hint_icms',
              'Escolha a modalidade de recolhimento e a UF de desembaraço.',
            )}
          </p>
          <div className="nc-recolhimento-icms-bloco">
            <Field
              label={t('simulacusto.formulario.recolhimento_icms', 'Recolhimento')}
              required
            >
              <div
                className="nc-recolhimento-icms-grid"
                role="group"
                aria-label={t('simulacusto.formulario.recolhimento_icms', 'Recolhimento ICMS')}
              >
                {MODALIDADES_RECOLHIMENTO_ICMS_SIMULA_CUSTO.map((modalidade) => (
                  <ChipRecolhimentoIcmsSimulaCusto
                    key={modalidade}
                    codigo={modalidade}
                    selecionado={(form.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL') === modalidade}
                    onSelecionar={aplicarModalidadeRecolhimentoIcms}
                  />
                ))}
              </div>
            </Field>
          </div>
          <div className="nc-fields-grid nc-fields-grid--2 nc-fields-grid--icms-uf">
            <Field
              label={t('simulacusto.formulario.uf_desembaraco', 'UF de desembaraço')}
              required
              icone={<MapPin weight="bold" size={12} />}
            >
              <SelectUfDesembaracoSimulaCusto
                valor={form.uf_desembaraco_simula_custo}
                onChange={aplicarUfDesembaraco}
                opcoes={opcoesUfDesembaraco}
                carregando={carregandoUfs}
              />
            </Field>
            <Field
              label={
                (form.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL') === 'REDUCAO'
                  ? t('simulacusto.formulario.aliquota_icms_interna', 'Alíquota interna (%)')
                  : t('simulacusto.formulario.aliquota_icms', 'ICMS (%)')
              }
            >
              {(form.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL') === 'REDUCAO' ? (
                <InputComSufixoPercentual
                  className="nc-input--readonly"
                  readOnly
                  tabIndex={-1}
                  value={formatarPctIcmsSimulaCusto(
                    resolverAliquotaInternaUfFormulario(form.uf_desembaraco_simula_custo, ufs),
                  )}
                />
              ) : (
                <InputComSufixoPercentual
                  type="number"
                  min={0}
                  max={resolverAliquotaInternaUfFormulario(form.uf_desembaraco_simula_custo, ufs) * 100}
                  step="0.1"
                  placeholder="0,0"
                  value={(form.aliquota_icms_simula_custo ?? 0) * 100}
                  onChange={(e) => {
                    const aliquotaInterna = resolverAliquotaInternaUfFormulario(
                      form.uf_desembaraco_simula_custo,
                      ufs,
                    )
                    const efetiva = Math.min((parseFloat(e.target.value) || 0) / 100, aliquotaInterna)
                    setForm((prev) => ({
                      ...prev,
                      aliquota_icms_simula_custo: efetiva,
                    }))
                  }}
                />
              )}
            </Field>
          </div>
          {(form.modalidade_recolhimento_icms_simula_custo ?? 'INTEGRAL') === 'REDUCAO' ? (
            <div className="nc-fields-grid nc-fields-grid--2 nc-fields-grid--reducao-icms">
              <Field label={t('simulacusto.formulario.reducao_icms_base', 'Redução ICMS — Base (%)')}>
                <InputComSufixoPercentual
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="0,00"
                  value={((form.reducao_icms_base_simula_custo ?? 0) * 100) || ''}
                  onChange={(e) => {
                    const reducaoBase = (parseFloat(e.target.value) || 0) / 100
                    const aliquotaInterna = resolverAliquotaInternaUfFormulario(
                      form.uf_desembaraco_simula_custo,
                      ufs,
                    )
                    setForm((prev) => ({
                      ...prev,
                      reducao_icms_base_simula_custo: reducaoBase,
                      aliquota_icms_simula_custo: resolverAliquotaEfetivaIcmsReducaoSimulaCusto(
                        aliquotaInterna,
                        reducaoBase,
                      ),
                    }))
                  }}
                />
              </Field>
              <Field label={t('simulacusto.formulario.aliquota_icms_final', 'ICMS final (%)')}>
                <InputComSufixoPercentual
                  className="nc-input--readonly"
                  readOnly
                  tabIndex={-1}
                  value={formatarPctIcmsSimulaCusto(form.aliquota_icms_simula_custo ?? 0)}
                />
              </Field>
              <p className="nc-field-hint nc-field-hint--reducao-icms">
                {t(
                  'simulacusto.formulario.hint_reducao_icms',
                  'Base por dentro com alíquota interna da UF; imposto devido com alíquota efetiva (Convênio ICMS 38/2013, RICMS).',
                )}
              </p>
            </div>
          ) : null}

          <div className="nc-titulo-secao--prazo-pagamento">
            <NcSectionTitle icone={<CalendarBlank {...ICONE_LABEL_SECAO} />}>
              {t('simulacusto.formulario.prazo_pagamento', 'Prazo de pagamento')}
            </NcSectionTitle>
          </div>
          <div className="nc-prazo-pagamento-topo">
            <p className="nc-field-hint nc-field-hint--prazo-pagamento">
              {t(
                'simulacusto.formulario.hint_prazo_pagamento',
                'Opcional — adicione uma ou mais condições (valor ou %, momento e fato gerador).',
              )}
            </p>
            <button type="button" className="nc-btn-inline" onClick={addPrazoPagamento}>
              <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
            </button>
          </div>
          <div className="nc-bloco-tabela-refinada nc-bloco-tabela-refinada--somente-tabela">
            <div className="nc-tabela-refinada-wrapper">
              <table className="nc-tabela-refinada nc-tabela-refinada--prazo">
                <thead>
                  <tr>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.prazo_valor', 'Valor ou %')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.prazo_valor_tooltip',
                          'Valor na moeda da operação ou percentual da mercadoria, sem conversão cambial',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.prazo_momento', 'Momento')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.prazo_momento_tooltip',
                          'Indique se o vencimento é no dia, antes ou depois do fato gerador',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.prazo_dias', 'Dias')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.prazo_dias_tooltip',
                          'Número de dias somados ou subtraídos conforme o momento escolhido',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.prazo_fato_gerador', 'Fato gerador')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.prazo_fato_gerador_tooltip',
                          'Marco da operação usado para contar o prazo de cada parcela',
                        )}
                      />
                    </th>
                    <th className="nc-tabela-refinada-col-acao" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {form.prazos_pagamento.length === 0 ? (
                    <tr className="nc-tabela-refinada-linha-vazia" aria-hidden="true">
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td className="nc-tabela-refinada-col-acao" />
                    </tr>
                  ) : (
                  form.prazos_pagamento.map((prazo, i) => (
                    <tr key={i}>
                      <td>
                        <div className="nc-input-moeda">
                          {prazo.tipo_valor_prazo_pagamento_simula_custo === 'PERCENTUAL' ? (
                            <InputComSufixoPercentual
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0"
                              value={prazo.valor_prazo_pagamento_simula_custo || ''}
                              onChange={(e) => updatePrazoPagamento(
                                i,
                                'valor_prazo_pagamento_simula_custo',
                                parseFloat(e.target.value) || 0,
                              )}
                            />
                          ) : (
                            <input
                              className="nc-input"
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0"
                              value={prazo.valor_prazo_pagamento_simula_custo || ''}
                              onChange={(e) => updatePrazoPagamento(
                                i,
                                'valor_prazo_pagamento_simula_custo',
                                parseFloat(e.target.value) || 0,
                              )}
                            />
                          )}
                          <div className="nc-select-moeda">
                            <SelectGlobal
                              opcoes={OPCOES_TIPO_VALOR_PRAZO_SIMULA_CUSTO}
                              valor={prazo.tipo_valor_prazo_pagamento_simula_custo}
                              aoMudarValor={(v) => {
                                if (!v) return
                                updatePrazoPagamento(
                                  i,
                                  'tipo_valor_prazo_pagamento_simula_custo',
                                  String(v) as TipoValorPrazoPagamentoSimulaCusto,
                                )
                              }}
                              monoValor
                              tamanho="compacto"
                              posicao="auto"
                              aria-label={t('simulacusto.formulario.prazo_valor', 'Valor ou %')}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <SelectGlobal
                          opcoes={OPCOES_MOMENTO_PRAZO_SIMULA_CUSTO}
                          valor={prazo.momento_prazo_pagamento_simula_custo}
                          aoMudarValor={(v) => {
                            if (!v) return
                            updatePrazoPagamento(
                              i,
                              'momento_prazo_pagamento_simula_custo',
                              String(v) as MomentoPrazoPagamentoSimulaCusto,
                            )
                          }}
                          tamanho="compacto"
                          posicao="auto"
                          aria-label={t('simulacusto.formulario.prazo_momento', 'Momento')}
                        />
                      </td>
                      <td>
                        {prazo.momento_prazo_pagamento_simula_custo !== 'NO_DIA' ? (
                          <input
                            className="nc-input"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="0"
                            value={prazo.dias_prazo_pagamento_simula_custo || ''}
                            onChange={(e) => updatePrazoPagamento(
                              i,
                              'dias_prazo_pagamento_simula_custo',
                              parseInt(e.target.value, 10) || 0,
                            )}
                          />
                        ) : (
                          <span className="nc-tabela-refinada-vazio">—</span>
                        )}
                      </td>
                      <td>
                        <SelectGlobal
                          opcoes={OPCOES_FATO_GERADOR_PRAZO_SIMULA_CUSTO}
                          valor={prazo.fato_gerador_prazo_pagamento_simula_custo}
                          aoMudarValor={(v) => {
                            if (!v) return
                            updatePrazoPagamento(
                              i,
                              'fato_gerador_prazo_pagamento_simula_custo',
                              String(v) as FatoGeradorPrazoPagamentoSimulaCusto,
                            )
                          }}
                          buscavel
                          tamanho="compacto"
                          posicao="auto"
                          aria-label={t('simulacusto.formulario.prazo_fato_gerador', 'Fato gerador')}
                        />
                      </td>
                      <td className="nc-tabela-refinada-col-acao">
                        <button
                          type="button"
                          className="nc-btn-remove"
                          onClick={() => removePrazoPagamento(i)}
                          aria-label={t('acoes.remover', 'Remover')}
                        >
                          <Trash weight="duotone" size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    if (passo === 3) {
      const modoMultiItens = ehModoMultiItensProdutoSimulaCusto(form.itens_produto_simula_custo)
      const ncmInformadoPassoAliquotas = /^\d{8}$/.test(form.ncm_simula_custo.replace(/\D/g, ''))

      return (
        <div className="nc-step-content nc-fade-in">
          <div className="nc-bloco-valores-destaque">
            <NcSectionTitle icone={<CurrencyCircleDollar {...ICONE_LABEL_SECAO} />}>
              {t('simulacusto.formulario.valores_totais', 'Valores Totais')}
            </NcSectionTitle>
            <div className={`nc-fields-grid ${modoMultiItens ? 'nc-fields-grid--2' : 'nc-fields-grid--3'} nc-linha-valores-par`}>
            <div className="nc-campo-frete-simula">
              <Field
                label={t('simulacusto.formulario.frete_internacional', 'Frete Internacional')}
                icone={<Boat weight="bold" size={12} />}
              >
                <div className="nc-input-moeda">
                  <SelectMoedaSimulaCusto
                    valor={form.moeda_frete_simula_custo}
                    onChange={(codigo) => update('moeda_frete_simula_custo', codigo)}
                    opcoes={opcoesMoeda}
                    carregando={carregandoMoedas}
                    indisponivel={moedasIndisponiveis}
                    erro={erroMoedas}
                  />
                  <CampoValorMonetarioSimulaCusto
                    valor={form.valor_frete_simula_custo}
                    onChange={(n) => update('valor_frete_simula_custo', n)}
                  />
                </div>
              </Field>
              <label className="nc-frete-cotacao-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={form.enviar_solicitacao_cotacao_frete_simula_custo ?? false}
                  onChange={(e) => update('enviar_solicitacao_cotacao_frete_simula_custo', e.target.checked)}
                />
                <span>
                  {t(
                    'simulacusto.formulario.cotar_via_bid_frete',
                    'Cotar via Bid Frete Internacional',
                  )}
                </span>
              </label>
            </div>
            <Field
              label={t('simulacusto.formulario.seguro_internacional', 'Seguro Internacional')}
              icone={<ShieldCheck weight="bold" size={12} />}
            >
              <div className="nc-input-moeda">
                <SelectMoedaSimulaCusto
                  valor={form.moeda_seguro_simula_custo}
                  onChange={(codigo) => update('moeda_seguro_simula_custo', codigo)}
                  opcoes={opcoesMoeda}
                  carregando={carregandoMoedas}
                  indisponivel={moedasIndisponiveis}
                  erro={erroMoedas}
                />
                <CampoValorMonetarioSimulaCusto
                  valor={form.valor_seguro_simula_custo}
                  onChange={(n) => update('valor_seguro_simula_custo', n)}
                />
              </div>
            </Field>
            {!modoMultiItens ? (
              <Field
                required
                label={t('simulacusto.formulario.valor_produto', 'Valor do Produto')}
                icone={<Package weight="bold" size={12} />}
              >
                <div className="nc-input-moeda">
                  <SelectMoedaSimulaCusto
                    valor={form.moeda_produto_simula_custo}
                    onChange={(codigo) => setForm((prev) => aplicarSincroniaItensProduto(
                      aplicarValorProdutoSimplesSimulaCusto(prev, { moeda: codigo }),
                    ))}
                    opcoes={opcoesMoeda}
                    carregando={carregandoMoedas}
                    indisponivel={moedasIndisponiveis}
                    erro={erroMoedas}
                  />
                  <CampoValorMonetarioSimulaCusto
                    valor={form.valor_produto_simula_custo}
                    onChange={(n) => setForm((prev) => aplicarSincroniaItensProduto(
                      aplicarValorProdutoSimplesSimulaCusto(prev, { valor: n }),
                    ))}
                    required
                  />
                </div>
                {ncmInformadoPassoAliquotas ? (
                  <p className="nc-field-hint nc-field-hint--valor-produto-ncm">
                    {t(
                      'simulacusto.formulario.valor_produto_ncm_aliquotas',
                      'NCM {{ncm}} informado no passo Alíquotas.',
                      { ncm: formatarNcmDisplaySimulaCusto(form.ncm_simula_custo) },
                    )}
                  </p>
                ) : (
                  <p className="nc-field-hint nc-field-hint--valor-produto-ncm">
                    {t(
                      'simulacusto.formulario.valor_produto_ncm_pendente',
                      'Informe o NCM no passo Alíquotas ou ao detalhar vários itens.',
                    )}
                  </p>
                )}
              </Field>
            ) : null}
          </div>
          </div>

          {modoMultiItens ? (
            <>
          <div className="nc-section-head nc-section-head--bloco-itens">
            <NcSectionTitle obrigatorio icone={<Package {...ICONE_LABEL_SECAO} />}>
              {t('simulacusto.formulario.itens', 'Itens')}
            </NcSectionTitle>
            <button type="button" className="nc-btn-inline" onClick={addItemProduto}>
              <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
            </button>
          </div>
          <div className="nc-bloco-tabela-refinada nc-bloco-tabela-refinada--somente-tabela">
            <div className="nc-tabela-refinada-wrapper">
              <table className="nc-tabela-refinada nc-tabela-refinada--itens">
                <thead>
                  <tr>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.item_moeda_curto', 'Moeda')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.item_moeda_tooltip',
                          'Moeda do valor unitário deste item',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.item_valor_unitario_curto', 'Valor unitário')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.item_valor_unitario_tooltip',
                          'Preço unitário na moeda selecionada',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.item_quantidade_curto', 'Quantidade')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.item_quantidade_tooltip',
                          'Quantidade de unidades deste item',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.item_valor_total_curto', 'Valor total')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.item_valor_total_tooltip',
                          'Valor unitário multiplicado pela quantidade',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.item_ncm_curto', 'NCM')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.item_ncm_tooltip',
                          'NCM de 8 dígitos — o primeiro item define as alíquotas da simula',
                        )}
                      />
                    </th>
                    <th className="nc-tabela-refinada-col-acao" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {form.itens_produto_simula_custo.map((item, i) => (
                    <tr key={`item-produto-${i}`}>
                      <td>
                        <SelectMoedaSimulaCusto
                          compacto
                          valor={item.moeda_item_produto_simula_custo}
                          onChange={(codigo) => updateItemProduto(i, 'moeda_item_produto_simula_custo', codigo)}
                          opcoes={opcoesMoeda}
                          carregando={carregandoMoedas}
                          indisponivel={moedasIndisponiveis}
                          erro={erroMoedas}
                        />
                      </td>
                      <td>
                        <CampoValorMonetarioSimulaCusto
                          compacto
                          valor={item.valor_unitario_item_produto_simula_custo}
                          onChange={(n) => updateItemProduto(i, 'valor_unitario_item_produto_simula_custo', n)}
                          required
                        />
                      </td>
                      <td>
                        <CampoDecimalGlobal
                          valor={item.quantidade_item_produto_simula_custo === 0
                            ? null
                            : item.quantidade_item_produto_simula_custo}
                          aoMudarValor={(n) => updateItemProduto(
                            i,
                            'quantidade_item_produto_simula_custo',
                            n ?? 0,
                          )}
                          casasDecimais={2}
                          placeholder="1,00"
                          textAlign="left"
                          style={{
                            width: '100%',
                            minHeight: '2rem',
                            padding: '0.375rem 0.5rem',
                            background: 'var(--ws-bg-body, var(--bg-body, #0f172a))',
                            border: '1.5px solid var(--nc-accent-border, rgba(129, 140, 248, 0.2))',
                            borderRadius: '6px',
                            color: 'var(--text-primary, #f1f5f9)',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                        />
                      </td>
                      <td>
                        <span
                          className="nc-item-valor-total"
                          aria-label={t('simulacusto.formulario.item_valor_total', 'Valor total do item')}
                        >
                          {formatarMoedaEstrangeiraSimulaCusto(
                            calcularTotalItemProdutoSimulaCusto(item),
                            item.moeda_item_produto_simula_custo,
                          )}
                        </span>
                      </td>
                      <td>
                        <input
                          className="nc-input nc-input--ncm-item"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="0000.0000"
                          aria-label={t('simulacusto.formulario.item_ncm', 'NCM do produto')}
                          value={formatarNcmDisplaySimulaCusto(item.ncm_item_produto_simula_custo)}
                          onChange={(e) => handleItemNcmChange(i, e.target.value)}
                        />
                      </td>
                      <td className="nc-tabela-refinada-col-acao">
                        <button
                          type="button"
                          className="nc-btn-remove"
                          onClick={() => removeItemProduto(i)}
                          disabled={form.itens_produto_simula_custo.length <= 1}
                          aria-label={t('acoes.remover', 'Remover')}
                        >
                          <Trash weight="duotone" size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="nc-field-hint nc-field-hint--itens-total">
              {t('simulacusto.formulario.itens_multiplos_hint', 'Vários itens podem compor a mesma simula.')}
            </p>
          </div>
            </>
          ) : (
            <div className="nc-itens-modo-simples">
              <p className="nc-field-hint nc-field-hint--itens-modo-simples">
                {t(
                  'simulacusto.formulario.itens_modo_simples_hint',
                  'Um único produto? Informe o valor total acima. Para vários NCMs ou quantidades distintas, detalhe item a item.',
                )}
              </p>
              <button type="button" className="nc-btn-inline" onClick={addItemProduto}>
                <Plus weight="bold" size={14} />
                {' '}
                {t('simulacusto.formulario.adicionar_outro_produto', 'Adicionar outro produto')}
              </button>
            </div>
          )}

          <div className="nc-section-head nc-section-head--bloco-taxas">
            <NcSectionTitle icone={<ListPlus {...ICONE_LABEL_SECAO} />}>
              {t('simulacusto.formulario.taxas_origem_destino', 'Taxas de origem e destino')}
            </NcSectionTitle>
            <button type="button" className="nc-btn-inline" onClick={() => addTaxa()}>
              <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
            </button>
          </div>
          <div className="nc-bloco-tabela-refinada nc-bloco-tabela-refinada--somente-tabela">
            <div className="nc-tabela-refinada-wrapper">
              <table className="nc-tabela-refinada nc-tabela-refinada--taxas">
                <thead>
                  <tr>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.taxa_tipo', 'Tipo de taxa')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.taxa_tipo_tooltip',
                          'Indique se a taxa incide na origem ou no destino da operação',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.taxa_nome', 'Nome da taxa')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.taxa_nome_tooltip',
                          'Selecione a taxa no catálogo do Cadastros (THC, handling, AFRMM, etc.)',
                        )}
                      />
                    </th>
                    <th>
                      <CabecalhoColunaTabelaPrazoPagamento
                        rotulo={t('simulacusto.formulario.taxa_valor', 'Valor da taxa')}
                        descricaoTooltip={t(
                          'simulacusto.formulario.taxa_valor_tooltip',
                          'Valor da taxa na moeda escolhida, sem conversão cambial',
                        )}
                      />
                    </th>
                    <th className="nc-tabela-refinada-col-acao" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {linhasTaxasUnificadas.length === 0 ? (
                    <tr className="nc-tabela-refinada-linha-vazia" aria-hidden="true">
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td><span className="nc-tabela-refinada-vazio">—</span></td>
                      <td className="nc-tabela-refinada-col-acao" />
                    </tr>
                  ) : (
                    linhasTaxasUnificadas.map(({ lado, indice }) => {
                      const taxa = form[lado][indice]
                      const catalogo = lado === 'taxas_origem' ? catalogoTaxasOrigem : catalogoTaxasDestino
                      return (
                        <tr key={`${lado}-${indice}`}>
                          <td>
                            <SelectGlobal
                              opcoes={OPCOES_LADO_TAXA_SIMULA_CUSTO}
                              valor={lado}
                              aoMudarValor={(v) => {
                                if (!v || v === lado) return
                                alterarLadoTaxa(lado, indice, String(v) as LadoTaxaSimulaCusto)
                              }}
                              tamanho="compacto"
                              posicao="auto"
                              aria-label={t('simulacusto.formulario.taxa_tipo', 'Tipo de taxa')}
                            />
                          </td>
                          <td>
                            <CampoNomeTaxaSimulaCusto
                              valor={nomeTaxaFormularioSimulaCusto(lado, taxa)}
                              opcoes={opcoesSelectTaxaSimulaCusto(catalogo.opcoes, {
                                id_taxa_origem_destino: taxa.id_taxa_origem_destino ?? null,
                                nome: nomeTaxaFormularioSimulaCusto(lado, taxa),
                              })}
                              carregando={catalogo.carregando}
                              placeholder={t('simulacusto.formulario.taxa_selecione_ou_digite', 'Selecione ou digite a taxa...')}
                              ariaLabel={t('simulacusto.formulario.taxa_nome', 'Nome da taxa')}
                              onChange={(nome) => editarNomeTaxa(lado, indice, nome)}
                              onSelecionarCatalogo={(idTaxa) => selecionarTaxaCatalogo(lado, indice, idTaxa)}
                            />
                          </td>
                          <td>
                            <div className="nc-input-moeda">
                              <SelectMoedaSimulaCusto
                                compacto
                                valor={moedaTaxaFormularioSimulaCusto(lado, taxa)}
                                onChange={(codigo) => updateTaxa(lado, indice, 'moeda', codigo)}
                                opcoes={opcoesMoeda}
                                carregando={carregandoMoedas}
                                indisponivel={moedasIndisponiveis}
                                erro={erroMoedas}
                              />
                              <CampoValorMonetarioSimulaCusto
                                compacto
                                valor={valorTotalTaxaFormularioSimulaCusto(lado, taxa)}
                                onChange={(n) => updateTaxa(lado, indice, 'valor_total', n)}
                              />
                            </div>
                          </td>
                          <td className="nc-tabela-refinada-col-acao">
                            <button
                              type="button"
                              className="nc-btn-remove"
                              onClick={() => removeTaxa(lado, indice)}
                              aria-label={t('acoes.remover', 'Remover')}
                            >
                              <Trash weight="duotone" size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="nc-step-content nc-fade-in">
        <NcSectionTitle icone={<CurrencyCircleDollar {...ICONE_LABEL_SECAO} />}>
          {t('simulacusto.formulario.resumo_valores', 'Resumo dos valores')}
        </NcSectionTitle>
        <TabelaResumoValoresSimulaCusto form={form} />

        <p className="nc-legenda-obrig nc-legenda-obrig--opcional">
          {t(
            'simulacusto.formulario.legenda_complementos',
            'Nenhum campo deste passo é obrigatório — documentos são opcionais.',
          )}
        </p>
        <div className="nc-section-head">
          <NcSectionTitle icone={<Tag {...ICONE_LABEL_SECAO} />}>
            {t('simulacusto.formulario.documentos', 'Documentos Vinculados')}
          </NcSectionTitle>
          <button type="button" className="nc-btn-inline" onClick={addDocumento}>
            <Plus weight="bold" size={14} /> {t('acoes.adicionar', 'Adicionar')}
          </button>
        </div>
        {form.documentos.length === 0 ? (
          <p className="nc-field-hint">{t('simulacusto.formulario.documentos_vazio', 'Nenhum documento vinculado.')}</p>
        ) : null}
        {form.documentos.map((doc, i) => (
          <div key={i} className="nc-linha-extra">
            <Field label={t('simulacusto.formulario.documento_tipo', 'Tipo')}>
              <select
                className="nc-input"
                value={doc.tipo_documento_simula_custo}
                onChange={(e) => updateDocumento(i, 'tipo_documento_simula_custo', e.target.value)}
              >
                {(Object.keys(DOCUMENTO_LABELS) as TipoDocumentoSimulaCusto[]).map((k) => (
                  <option key={k} value={k}>{DOCUMENTO_LABELS[k]}</option>
                ))}
              </select>
            </Field>
            <Field label={t('simulacusto.formulario.documento_numero', 'Número')}>
              <input
                className="nc-input"
                type="text"
                maxLength={30}
                placeholder="INV-2026-001"
                value={doc.numero_documento_simula_custo}
                onChange={(e) => updateDocumento(i, 'numero_documento_simula_custo', e.target.value)}
              />
            </Field>
            <button type="button" className="nc-btn-remove" onClick={() => removeDocumento(i)} aria-label={t('acoes.remover', 'Remover')}>
              <Trash weight="duotone" size={16} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  if (faseResultado && resultado) {
    return (
      <ResultadoSimulaCusto
        resultado={resultado}
        form={form}
        onVoltar={handleVoltarPasso}
        onSalvar={() => void handleSalvar()}
        salvando={salvando}
        error={error}
        isEdicao={isEdicao}
      />
    )
  }

  return (
    <>
      <ModalPassoPassoGlobal
        titulo={
          isEdicao
            ? t('simulacusto.formulario.titulo_editar', 'Editar Simula de Custo')
            : t('simulacusto.formulario.titulo_nova', 'Nova Simula de Custo')
        }
        icone={<Calculator weight="duotone" size={22} />}
        subtitulo={
          isEdicao
            ? t('simulacusto.formulario.subtitulo_editar', 'Revise os dados e o resultado fiscal da simula')
            : t('simulacusto.formulario.subtitulo_nova', 'Preencha as informações para calcular o custo nacionalizado')
        }
        aberto
        passos={passosWizard}
        passoAtual={passo}
        onProximo={handleProximo}
        onVoltar={handleVoltarPasso}
        onFechar={handleFechar}
        fecharAoClicarFora={false}
        fecharComTeclaEscape={false}
        onIrParaPasso={(idPasso) => { setFaseResultado(false); setPasso(idPasso) }}
        podeAvancar={podeAvancar()}
        carregando={loading}
        textoCarregando={t('simulacusto.formulario.calculando', 'Calculando…')}
        labelBotaoFinal={t('simulacusto.formulario.simular_custo', 'Simular Custo')}
        labelProximo={t('comum.proximo', 'Próximo')}
        tamanho="2xl"
        altura="90vh"
      >
        <div className="nc-root nc-step-wrapper">
          {conteudoPasso()}
          {error ? <div className="nc-error">{error}</div> : null}
        </div>
      </ModalPassoPassoGlobal>
    </>
  )
}
