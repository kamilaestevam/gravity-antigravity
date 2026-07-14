/**
 * Formulário editável — prefill Smart Docs → Nova Cotação (controles paridade BID Frete).
 */
import { useCallback, useEffect, useMemo } from 'react'
import {
  AirplaneTilt,
  Anchor,
  DownloadSimple,
  Export,
  Hash,
  MapPin,
  Package,
  PencilSimple,
  Truck,
  Van,
  Warning,
} from '@phosphor-icons/react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useTranslation } from 'react-i18next'
import type {
  DetalheMapeamentoSmartReadCotacaoBidFrete,
  PrefillFormularioCotacaoBidFreteSmartRead,
} from '../../../../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import { ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE } from '../../../../../smart-read/shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import {
  aplicarRegrasDerivadasPrefill,
} from '../../../../shared/classificacao-prefill-smart-read-cotacao-bid-frete-internacional.js'
import {
  avaliarCamposFaltantesPrefillCotacaoBidFrete,
  exigeCampoArmazenagemLclPrefill,
  exigeLinhasContainerFclPrefill,
  modalExigeAeroportoPrefill,
  modalExigePortoPrefill,
  modalExigeRodoviarioPrefill,
  resolverPassoInicialPrefillSmartRead,
} from '../../../../shared/regras-prefill-smart-read-cotacao-bid-frete-internacional.js'
import { ehCodigoPaisAmericaLatina } from '../../../../shared/rota-cotacao-bid-frete-internacional'
import { useCidadesIbgeBidFreteInternacional } from '../../shared/use-cidades-ibge-bid-frete-internacional'
import { useOpcoesUnidadeEmbalagemBidFreteInternacional } from '../../shared/use-opcoes-unidade-embalagem-bid-frete-internacional'
import { useAeroportosPorPais, useContainersCadastros, usePaisesCadastros, usePortosPorPais } from '../../shared/useCadastrosLogistica'
import {
  INCOTERM_TODOS_NOVA_COTACAO,
  traduzirDescModalNovaCotacao,
  traduzirDescModalidadeNovaCotacao,
  traduzirDescOperacaoNovaCotacao,
  traduzirLabelModalidadeNovaCotacao,
  traduzirModalNovaCotacao,
  traduzirOperacaoNovaCotacao,
} from '../../shared/traduzir-nova-cotacao-bid-frete-internacional'
import type { ModalFrete, ModalidadeCarga, TipoOperacao } from '../../shared/types'
import './prefill-cotacao-bid-frete-smart-read.css'

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]
const OPCOES_ESTADOS_BR: SelectOpcao[] = UFS_BRASIL.map((uf) => ({ valor: uf, rotulo: uf }))

type StatusLinha = 'mapeado' | 'sugerido' | 'pendente' | 'editado'

export type MetaPrefillCotacaoBidFreteSmartRead = {
  campos_faltantes: string[]
  passo_inicial_tipo: ReturnType<typeof resolverPassoInicialPrefillSmartRead>
  iniciar_no_passo_fornecedores: boolean
}

type Props = {
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  detalheMapeamento: DetalheMapeamentoSmartReadCotacaoBidFrete
  onChange: (prefill: PrefillFormularioCotacaoBidFreteSmartRead, meta: MetaPrefillCotacaoBidFreteSmartRead) => void
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

function rotuloStatus(status: StatusLinha): string {
  switch (status) {
    case 'mapeado': return 'Extraído'
    case 'sugerido': return 'Sugerido'
    case 'pendente': return 'Pendente'
    case 'editado': return 'Editado'
    default: return '—'
  }
}

function statusCampo(
  campo: keyof PrefillFormularioCotacaoBidFreteSmartRead,
  valorAtual: unknown,
  detalhe: DetalheMapeamentoSmartReadCotacaoBidFrete,
): StatusLinha {
  const registro = detalhe.campos.find((c) => c.campo_destino === campo)
  if (valorAtual == null || (typeof valorAtual !== 'boolean' && valorAtual === '')) return 'pendente'
  if (!registro) return 'editado'
  const original = registro.valor_destino
  if (String(valorAtual) !== String(original ?? '')) return 'editado'
  return registro.status_mapeamento === 'sugerido' ? 'sugerido' : 'mapeado'
}

function LinhaCampo({
  campo,
  rotulo,
  status,
  obrigatorio = false,
  children,
}: {
  campo: string
  rotulo: string
  status: StatusLinha
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="sr-prefill-bid-revisao-linha" role="row">
      <span className="sr-prefill-bid-revisao-campo sr-prefill-bid-campo-editavel" role="cell">
        <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" aria-hidden />
        {rotulo}
        {obrigatorio && (
          <span
            className="sr-prefill-bid-obrigatorio"
            title="Obrigatório para criar a cotação"
            aria-label="obrigatório"
          >
            *
          </span>
        )}
      </span>
      <div className="sr-prefill-bid-revisao-valor sr-prefill-bid-valor-controle" role="cell">
        {children}
      </div>
      <span
        className={`sr-prefill-bid-revisao-status ${
          status === 'editado'
            ? 'sr-prefill-bid-revisao-status--editado'
            : `sr-prefill-bid-revisao-status--${status}`
        }`}
        role="cell"
      >
        {rotuloStatus(status)}
      </span>
    </div>
  )
}

function recalcularMeta(prefill: PrefillFormularioCotacaoBidFreteSmartRead): MetaPrefillCotacaoBidFreteSmartRead {
  const normalizado = aplicarRegrasDerivadasPrefill(prefill)
  const passo_inicial_tipo = resolverPassoInicialPrefillSmartRead(normalizado)
  return {
    campos_faltantes: avaliarCamposFaltantesPrefillCotacaoBidFrete(normalizado),
    passo_inicial_tipo,
    iniciar_no_passo_fornecedores: passo_inicial_tipo === 'fornecedores',
  }
}

function publicarPrefill(
  base: PrefillFormularioCotacaoBidFreteSmartRead,
  onChange: Props['onChange'],
): void {
  const next = aplicarRegrasDerivadasPrefill(base)
  onChange(next, recalcularMeta(next))
}

export default function FormularioEditavelPrefillCotacaoBidFreteSmartRead({
  prefill,
  detalheMapeamento,
  onChange,
}: Props) {
  const { t } = useTranslation()
  const modal = prefill.modal_cotacao_bid_frete_internacional ?? ''
  const modalidade = prefill.modalidade_cotacao_bid_frete_internacional ?? ''

  const exigePorto = modalExigePortoPrefill(modal)
  const exigeAeroporto = modalExigeAeroportoPrefill(modal)
  const exigeRodoviario = modalExigeRodoviarioPrefill(modal)
  const exigeArmazenagemLcl = exigeCampoArmazenagemLclPrefill(prefill)
  const exigeContainerFcl = exigeLinhasContainerFclPrefill(prefill)
  const exigeTipoVolume = !exigeContainerFcl && modal !== ''

  const { opcoes: opcoesPaises, carregando: carregandoPaises } = usePaisesCadastros()
  const opcoesPaisesLatam = useMemo(
    () => opcoesPaises.filter((o) => ehCodigoPaisAmericaLatina(String(o.valor))),
    [opcoesPaises],
  )
  const { opcoes: opcoesEmbalagem, carregando: carregandoEmbalagem } = useOpcoesUnidadeEmbalagemBidFreteInternacional()
  const ufOrigemRod = prefill.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional ?? ''
  const ufDestinoRod = prefill.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional ?? ''
  const { cidades: cidadesOrigemRod, carregando: carregandoCidadesOrigemRod } = useCidadesIbgeBidFreteInternacional(
    prefill.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? ufOrigemRod : '',
  )
  const { cidades: cidadesDestinoRod, carregando: carregandoCidadesDestinoRod } = useCidadesIbgeBidFreteInternacional(
    prefill.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? ufDestinoRod : '',
  )

  const {
    opcoes: opcoesPortosOrigem,
    carregando: carregandoPortosOrigem,
    aoMudarBusca: aoMudarBuscaPortosOrigem,
    aoScrollFimLista: aoScrollFimPortosOrigem,
    totalCatalogo: totalCatalogoPortosOrigem,
    mensagemListaVazia: mensagemVaziaPortosOrigem,
  } = usePortosPorPais('', exigePorto, prefill.porto_origem_cotacao_bid_frete_internacional ?? null)

  const {
    opcoes: opcoesPortosDestino,
    carregando: carregandoPortosDestino,
    aoMudarBusca: aoMudarBuscaPortosDestino,
    aoScrollFimLista: aoScrollFimPortosDestino,
    totalCatalogo: totalCatalogoPortosDestino,
    mensagemListaVazia: mensagemVaziaPortosDestino,
  } = usePortosPorPais('', exigePorto, prefill.porto_destino_cotacao_bid_frete_internacional ?? null)

  const {
    opcoes: opcoesAeroportosOrigem,
    carregando: carregandoAeroportosOrigem,
    aoMudarBusca: aoMudarBuscaAeroportosOrigem,
    aoScrollFimLista: aoScrollFimAeroportosOrigem,
    totalCatalogo: totalCatalogoAeroportosOrigem,
    mensagemListaVazia: mensagemVaziaAeroportosOrigem,
  } = useAeroportosPorPais('', exigeAeroporto, prefill.aeroporto_origem_cotacao_bid_frete_internacional ?? null)

  const {
    opcoes: opcoesAeroportosDestino,
    carregando: carregandoAeroportosDestino,
    aoMudarBusca: aoMudarBuscaAeroportosDestino,
    aoScrollFimLista: aoScrollFimAeroportosDestino,
    totalCatalogo: totalCatalogoAeroportosDestino,
    mensagemListaVazia: mensagemVaziaAeroportosDestino,
  } = useAeroportosPorPais('', exigeAeroporto, prefill.aeroporto_destino_cotacao_bid_frete_internacional ?? null)

  const { opcoes: opcoesContainers, carregando: carregandoContainers } = useContainersCadastros(exigeContainerFcl)

  const patchPrefill = useCallback(
    (patch: Partial<PrefillFormularioCotacaoBidFreteSmartRead>) => {
      publicarPrefill({ ...prefill, ...patch }, onChange)
    },
    [onChange, prefill],
  )

  const aoMudarModal = useCallback((novoModal: ModalFrete) => {
    publicarPrefill({
      ...prefill,
      modal_cotacao_bid_frete_internacional: novoModal,
      modalidade_cotacao_bid_frete_internacional:
        novoModal === 'AEREO' ? 'AEREO_GERAL'
          : novoModal === 'RODOVIARIO' ? 'RODOVIARIO_LTL'
            : '',
      opcao_incluir_armazenagem_cotacao: '',
      tipo_container_cotacao_bid_frete_internacional: '',
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
    }, onChange)
  }, [onChange, prefill])

  const aoMudarModalidade = useCallback((novaModalidade: ModalidadeCarga) => {
    publicarPrefill({
      ...prefill,
      modalidade_cotacao_bid_frete_internacional: novaModalidade,
      opcao_incluir_armazenagem_cotacao: novaModalidade === 'LCL' ? (prefill.opcao_incluir_armazenagem_cotacao ?? 'nao') : '',
      tipo_container_cotacao_bid_frete_internacional: novaModalidade === 'FCL' ? prefill.tipo_container_cotacao_bid_frete_internacional : '',
    }, onChange)
  }, [onChange, prefill])

  useEffect(() => {
    publicarPrefill(prefill, onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apenas na montagem
  }, [])

  const statusPorCampo = useMemo(() => {
    const map = new Map<string, StatusLinha>()
    for (const [chave, valor] of Object.entries(prefill)) {
      map.set(chave, statusCampo(chave as keyof PrefillFormularioCotacaoBidFreteSmartRead, valor, detalheMapeamento))
    }
    return map
  }, [prefill, detalheMapeamento])

  return (
    <div className="nc-root sr-prefill-bid-formulario">
      <div className="sr-prefill-bid-revisao-tabela" role="table" aria-label="Campos editáveis da cotação">
        <div className="sr-prefill-bid-revisao-linha sr-prefill-bid-revisao-linha--cabecalho" role="row">
          <span role="columnheader">
            Campo da cotação
            <span className="sr-prefill-bid-legenda-obrigatorio"> (* obrigatório)</span>
          </span>
          <span role="columnheader">Valor</span>
          <span role="columnheader">Origem</span>
        </div>

        <LinhaCampo
          campo="referencia_interna_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.referencia_interna_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('referencia_interna_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <input
            className="nc-input"
            value={prefill.referencia_interna_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ referencia_interna_cotacao_bid_frete_internacional: e.target.value })}
            placeholder="Referência interna"
            autoComplete="off"
          />
        </LinhaCampo>

        <LinhaCampo
          campo="tipo_operacao_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.tipo_operacao_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('tipo_operacao_cotacao_bid_frete_internacional') ?? 'pendente'}
          obrigatorio
        >
          <div className="nc-options-grid-2 sr-prefill-bid-opcoes-inline">
            {(['IMPORTACAO', 'EXPORTACAO'] as TipoOperacao[]).map((op) => (
              <OptionButton
                key={op}
                selected={prefill.tipo_operacao_cotacao_bid_frete_internacional === op}
                onClick={() => patchPrefill({ tipo_operacao_cotacao_bid_frete_internacional: op })}
                icon={op === 'IMPORTACAO' ? <DownloadSimple weight="duotone" size={18} /> : <Export weight="duotone" size={18} />}
                label={traduzirOperacaoNovaCotacao(t, op)}
              />
            ))}
          </div>
        </LinhaCampo>

        <LinhaCampo campo="modal" rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.modal_cotacao_bid_frete_internacional} status={statusPorCampo.get('modal_cotacao_bid_frete_internacional') ?? 'pendente'} obrigatorio>
          <div className="nc-options-grid-3 sr-prefill-bid-opcoes-inline">
            <OptionButton selected={modal === 'MARITIMO'} onClick={() => aoMudarModal('MARITIMO')} icon={<Anchor weight="duotone" size={18} />} label={traduzirModalNovaCotacao(t, 'MARITIMO')} />
            <OptionButton selected={modal === 'AEREO'} onClick={() => aoMudarModal('AEREO')} icon={<AirplaneTilt weight="duotone" size={18} />} label={traduzirModalNovaCotacao(t, 'AEREO')} />
            <OptionButton selected={modal === 'RODOVIARIO'} onClick={() => aoMudarModal('RODOVIARIO')} icon={<Truck weight="duotone" size={18} />} label={traduzirModalNovaCotacao(t, 'RODOVIARIO')} />
          </div>
        </LinhaCampo>

        {modal !== 'AEREO' && modal && (
          <LinhaCampo campo="modalidade" rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.modalidade_cotacao_bid_frete_internacional} status={statusPorCampo.get('modalidade_cotacao_bid_frete_internacional') ?? 'pendente'} obrigatorio>
            <div className="nc-options-grid-2 sr-prefill-bid-opcoes-inline">
              {modal === 'MARITIMO' && (
                <>
                  <OptionButton selected={modalidade === 'FCL'} onClick={() => aoMudarModalidade('FCL')} icon={<Package weight="duotone" size={16} />} label={traduzirLabelModalidadeNovaCotacao(t, 'FCL')} />
                  <OptionButton selected={modalidade === 'LCL'} onClick={() => aoMudarModalidade('LCL')} icon={<Package weight="duotone" size={16} />} label={traduzirLabelModalidadeNovaCotacao(t, 'LCL')} />
                </>
              )}
              {modal === 'RODOVIARIO' && (
                <>
                  <OptionButton selected={modalidade === 'RODOVIARIO_FTL'} onClick={() => aoMudarModalidade('RODOVIARIO_FTL')} icon={<Van weight="duotone" size={16} />} label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_FTL')} />
                  <OptionButton selected={modalidade === 'RODOVIARIO_LTL'} onClick={() => aoMudarModalidade('RODOVIARIO_LTL')} icon={<Van weight="duotone" size={16} />} label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_LTL')} />
                </>
              )}
            </div>
          </LinhaCampo>
        )}

        <LinhaCampo
          campo="eh_carga_perigosa_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.eh_carga_perigosa_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('eh_carga_perigosa_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <div className="nc-options-grid-2 sr-prefill-bid-opcoes-inline">
            <OptionButton
              selected={prefill.eh_carga_perigosa_cotacao_bid_frete_internacional === true}
              onClick={() => patchPrefill({ eh_carga_perigosa_cotacao_bid_frete_internacional: true })}
              icon={<Warning weight="duotone" size={16} />}
              label="Sim"
            />
            <OptionButton
              selected={prefill.eh_carga_perigosa_cotacao_bid_frete_internacional === false}
              onClick={() => patchPrefill({ eh_carga_perigosa_cotacao_bid_frete_internacional: false })}
              icon={<Package weight="duotone" size={16} />}
              label="Não"
            />
          </div>
        </LinhaCampo>

        {exigePorto && (
          <>
            <LinhaCampo
              campo="porto_origem_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.porto_origem_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('porto_origem_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<Anchor size={16} />}
                opcoes={opcoesPortosOrigem}
                valor={prefill.porto_origem_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ porto_origem_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Selecione o porto..."
                buscavel
                buscaRemota
                aoMudarBusca={aoMudarBuscaPortosOrigem}
                aoScrollFimLista={aoScrollFimPortosOrigem}
                totalOpcoesCatalogo={totalCatalogoPortosOrigem}
                mensagemListaVazia={mensagemVaziaPortosOrigem}
                carregando={carregandoPortosOrigem}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="porto_destino_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.porto_destino_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('porto_destino_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<Anchor size={16} />}
                opcoes={opcoesPortosDestino}
                valor={prefill.porto_destino_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ porto_destino_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Selecione o porto..."
                buscavel
                buscaRemota
                aoMudarBusca={aoMudarBuscaPortosDestino}
                aoScrollFimLista={aoScrollFimPortosDestino}
                totalOpcoesCatalogo={totalCatalogoPortosDestino}
                mensagemListaVazia={mensagemVaziaPortosDestino}
                carregando={carregandoPortosDestino}
                posicao="auto"
              />
            </LinhaCampo>
          </>
        )}

        {exigeAeroporto && (
          <>
            <LinhaCampo
              campo="aeroporto_origem_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.aeroporto_origem_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('aeroporto_origem_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<AirplaneTilt size={16} />}
                opcoes={opcoesAeroportosOrigem}
                valor={prefill.aeroporto_origem_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ aeroporto_origem_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Selecione o aeroporto..."
                buscavel
                buscaRemota
                aoMudarBusca={aoMudarBuscaAeroportosOrigem}
                aoScrollFimLista={aoScrollFimAeroportosOrigem}
                totalOpcoesCatalogo={totalCatalogoAeroportosOrigem}
                mensagemListaVazia={mensagemVaziaAeroportosOrigem}
                carregando={carregandoAeroportosOrigem}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="aeroporto_destino_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.aeroporto_destino_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('aeroporto_destino_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<AirplaneTilt size={16} />}
                opcoes={opcoesAeroportosDestino}
                valor={prefill.aeroporto_destino_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ aeroporto_destino_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Selecione o aeroporto..."
                buscavel
                buscaRemota
                aoMudarBusca={aoMudarBuscaAeroportosDestino}
                aoScrollFimLista={aoScrollFimAeroportosDestino}
                totalOpcoesCatalogo={totalCatalogoAeroportosDestino}
                mensagemListaVazia={mensagemVaziaAeroportosDestino}
                carregando={carregandoAeroportosDestino}
                posicao="auto"
              />
            </LinhaCampo>
          </>
        )}

        {exigeRodoviario && (
          <>
            <LinhaCampo
              campo="pais_origem_rodoviario_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.pais_origem_rodoviario_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('pais_origem_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={opcoesPaisesLatam}
                valor={prefill.pais_origem_rodoviario_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({
                  pais_origem_rodoviario_cotacao_bid_frete_internacional: String(v ?? ''),
                  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: '',
                  cidade_origem_rodoviario_cotacao_bid_frete_internacional: '',
                })}
                placeholder="País de origem"
                buscavel
                carregando={carregandoPaises}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional"
              rotulo="Estado/província origem (rod.)"
              status={statusPorCampo.get('estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              {prefill.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={OPCOES_ESTADOS_BR}
                  valor={ufOrigemRod || null}
                  aoMudarValor={(v) => patchPrefill({
                    estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: String(v ?? ''),
                    cidade_origem_rodoviario_cotacao_bid_frete_internacional: '',
                  })}
                  placeholder="UF"
                  buscavel
                  desabilitado={!prefill.pais_origem_rodoviario_cotacao_bid_frete_internacional}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={ufOrigemRod}
                  onChange={(e) => patchPrefill({ estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Estado ou província"
                />
              )}
            </LinhaCampo>
            <LinhaCampo
              campo="cidade_origem_rodoviario_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.cidade_origem_rodoviario_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('cidade_origem_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              {prefill.pais_origem_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={cidadesOrigemRod}
                  valor={prefill.cidade_origem_rodoviario_cotacao_bid_frete_internacional || null}
                  aoMudarValor={(v) => patchPrefill({ cidade_origem_rodoviario_cotacao_bid_frete_internacional: String(v ?? '') })}
                  placeholder="Cidade"
                  buscavel
                  carregando={carregandoCidadesOrigemRod}
                  desabilitado={!ufOrigemRod}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={prefill.cidade_origem_rodoviario_cotacao_bid_frete_internacional ?? ''}
                  onChange={(e) => patchPrefill({ cidade_origem_rodoviario_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Cidade"
                />
              )}
            </LinhaCampo>
            <LinhaCampo
              campo="pais_destino_rodoviario_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.pais_destino_rodoviario_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('pais_destino_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={opcoesPaisesLatam}
                valor={prefill.pais_destino_rodoviario_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({
                  pais_destino_rodoviario_cotacao_bid_frete_internacional: String(v ?? ''),
                  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: '',
                  cidade_destino_rodoviario_cotacao_bid_frete_internacional: '',
                })}
                placeholder="País de destino"
                buscavel
                carregando={carregandoPaises}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional"
              rotulo="Estado/província destino (rod.)"
              status={statusPorCampo.get('estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              {prefill.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={OPCOES_ESTADOS_BR}
                  valor={ufDestinoRod || null}
                  aoMudarValor={(v) => patchPrefill({
                    estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: String(v ?? ''),
                    cidade_destino_rodoviario_cotacao_bid_frete_internacional: '',
                  })}
                  placeholder="UF"
                  buscavel
                  desabilitado={!prefill.pais_destino_rodoviario_cotacao_bid_frete_internacional}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={ufDestinoRod}
                  onChange={(e) => patchPrefill({ estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Estado ou província"
                />
              )}
            </LinhaCampo>
            <LinhaCampo
              campo="cidade_destino_rodoviario_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.cidade_destino_rodoviario_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('cidade_destino_rodoviario_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              {prefill.pais_destino_rodoviario_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={cidadesDestinoRod}
                  valor={prefill.cidade_destino_rodoviario_cotacao_bid_frete_internacional || null}
                  aoMudarValor={(v) => patchPrefill({ cidade_destino_rodoviario_cotacao_bid_frete_internacional: String(v ?? '') })}
                  placeholder="Cidade"
                  buscavel
                  carregando={carregandoCidadesDestinoRod}
                  desabilitado={!ufDestinoRod}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={prefill.cidade_destino_rodoviario_cotacao_bid_frete_internacional ?? ''}
                  onChange={(e) => patchPrefill({ cidade_destino_rodoviario_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Cidade"
                />
              )}
            </LinhaCampo>
          </>
        )}

        <LinhaCampo
          campo="ncm_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.ncm_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('ncm_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <input
            className="nc-input"
            value={prefill.ncm_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ ncm_cotacao_bid_frete_internacional: e.target.value })}
            placeholder="NCM"
            autoComplete="off"
          />
        </LinhaCampo>

        <LinhaCampo
          campo="descricao_mercadoria_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.descricao_mercadoria_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('descricao_mercadoria_cotacao_bid_frete_internacional') ?? 'pendente'}
          obrigatorio
        >
          <textarea
            className="nc-input sr-prefill-bid-textarea"
            rows={2}
            value={prefill.descricao_mercadoria_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ descricao_mercadoria_cotacao_bid_frete_internacional: e.target.value })}
            placeholder="Descrição da mercadoria"
          />
        </LinhaCampo>

        <LinhaCampo
          campo="hs_code_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.hs_code_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('hs_code_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <input
            className="nc-input"
            value={prefill.hs_code_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ hs_code_cotacao_bid_frete_internacional: e.target.value.slice(0, 10) })}
            placeholder="HS Code"
            autoComplete="off"
          />
        </LinhaCampo>

        {exigeContainerFcl && (
          <>
            <LinhaCampo
              campo="tipo_container_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.tipo_container_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('tipo_container_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <SelectGlobal
                iconeEsquerda={<Hash size={16} />}
                opcoes={opcoesContainers}
                valor={prefill.tipo_container_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ tipo_container_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Tipo de container"
                buscavel
                carregando={carregandoContainers}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="quantidade_volume_cotacao_bid_frete_internacional"
              rotulo="Quantidade de containers"
              status={statusPorCampo.get('quantidade_volume_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <input
                className="nc-input"
                type="number"
                min={1}
                value={prefill.quantidade_volume_cotacao_bid_frete_internacional ?? ''}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  patchPrefill({
                    quantidade_volume_cotacao_bid_frete_internacional: Number.isFinite(n) && n > 0 ? n : undefined,
                  })
                }}
                placeholder="1"
              />
            </LinhaCampo>
          </>
        )}

        {exigeTipoVolume && (
          <>
            <LinhaCampo
              campo="tipo_container_cotacao_bid_frete_internacional"
              rotulo="Tipo de volume"
              status={statusPorCampo.get('tipo_container_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              <SelectGlobal
                iconeEsquerda={<Package size={16} />}
                opcoes={opcoesEmbalagem}
                valor={prefill.tipo_container_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ tipo_container_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="Tipo de embalagem"
                buscavel
                carregando={carregandoEmbalagem}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="quantidade_volume_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.quantidade_volume_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('quantidade_volume_cotacao_bid_frete_internacional') ?? 'pendente'}
              obrigatorio
            >
              <input
                className="nc-input"
                type="number"
                min={1}
                value={prefill.quantidade_volume_cotacao_bid_frete_internacional ?? ''}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  patchPrefill({
                    quantidade_volume_cotacao_bid_frete_internacional: Number.isFinite(n) && n > 0 ? n : undefined,
                  })
                }}
                placeholder="1"
              />
            </LinhaCampo>
          </>
        )}

        <LinhaCampo
          campo="peso_kg_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.peso_kg_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('peso_kg_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <input
            className="nc-input"
            value={prefill.peso_kg_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ peso_kg_cotacao_bid_frete_internacional: e.target.value })}
            placeholder="Peso em kg"
            autoComplete="off"
          />
        </LinhaCampo>

        <LinhaCampo
          campo="cubagem_m3_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.cubagem_m3_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('cubagem_m3_cotacao_bid_frete_internacional') ?? 'pendente'}
        >
          <input
            className="nc-input"
            value={prefill.cubagem_m3_cotacao_bid_frete_internacional ?? ''}
            onChange={(e) => patchPrefill({ cubagem_m3_cotacao_bid_frete_internacional: e.target.value })}
            placeholder="Cubagem em m³"
            autoComplete="off"
          />
        </LinhaCampo>

        <LinhaCampo
          campo="incoterm_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.incoterm_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('incoterm_cotacao_bid_frete_internacional') ?? 'pendente'}
          obrigatorio
        >
          <div className="sr-prefill-bid-incoterm-grid">
            {INCOTERM_TODOS_NOVA_COTACAO.map((inc) => (
              <button
                key={inc}
                type="button"
                className={`nc-incoterm-btn ${prefill.incoterm_cotacao_bid_frete_internacional === inc ? 'nc-incoterm-btn--selected' : ''}`}
                onClick={() => patchPrefill({ incoterm_cotacao_bid_frete_internacional: inc })}
              >
                {inc}
              </button>
            ))}
          </div>
        </LinhaCampo>

        {prefill.exibir_campos_extras_origem_cotacao && (
          <>
            <LinhaCampo
              campo="origem_pais_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.origem_pais_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('origem_pais_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={opcoesPaises}
                valor={prefill.origem_pais_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ origem_pais_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="País de coleta (EXW)"
                buscavel
                carregando={carregandoPaises}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="estado_provincia_origem_cotacao_bid_frete_internacional"
              rotulo="Estado/província origem (pick-up)"
              status={statusPorCampo.get('estado_provincia_origem_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              {prefill.origem_pais_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={OPCOES_ESTADOS_BR}
                  valor={prefill.estado_provincia_origem_cotacao_bid_frete_internacional || null}
                  aoMudarValor={(v) => patchPrefill({ estado_provincia_origem_cotacao_bid_frete_internacional: String(v ?? '') })}
                  placeholder="UF"
                  buscavel
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={prefill.estado_provincia_origem_cotacao_bid_frete_internacional ?? ''}
                  onChange={(e) => patchPrefill({ estado_provincia_origem_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Estado ou província"
                />
              )}
            </LinhaCampo>
            <LinhaCampo
              campo="endereco_origem_cotacao_bid_frete_internacional"
              rotulo="Endereço origem (pick-up)"
              status={statusPorCampo.get('endereco_origem_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              <input
                className="nc-input"
                value={prefill.endereco_origem_cotacao_bid_frete_internacional ?? ''}
                onChange={(e) => patchPrefill({ endereco_origem_cotacao_bid_frete_internacional: e.target.value })}
                placeholder="Endereço de coleta"
                autoComplete="off"
              />
            </LinhaCampo>
          </>
        )}

        {prefill.exibir_campos_extras_destino_cotacao && (
          <>
            <LinhaCampo
              campo="destino_pais_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.destino_pais_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('destino_pais_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={opcoesPaises}
                valor={prefill.destino_pais_cotacao_bid_frete_internacional || null}
                aoMudarValor={(v) => patchPrefill({ destino_pais_cotacao_bid_frete_internacional: String(v ?? '') })}
                placeholder="País de entrega (DDP/DPU)"
                buscavel
                carregando={carregandoPaises}
                posicao="auto"
              />
            </LinhaCampo>
            <LinhaCampo
              campo="estado_provincia_destino_cotacao_bid_frete_internacional"
              rotulo="Estado/província destino (entrega)"
              status={statusPorCampo.get('estado_provincia_destino_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              {prefill.destino_pais_cotacao_bid_frete_internacional === 'BR' ? (
                <SelectGlobal
                  iconeEsquerda={<MapPin size={16} />}
                  opcoes={OPCOES_ESTADOS_BR}
                  valor={prefill.estado_provincia_destino_cotacao_bid_frete_internacional || null}
                  aoMudarValor={(v) => patchPrefill({ estado_provincia_destino_cotacao_bid_frete_internacional: String(v ?? '') })}
                  placeholder="UF"
                  buscavel
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  value={prefill.estado_provincia_destino_cotacao_bid_frete_internacional ?? ''}
                  onChange={(e) => patchPrefill({ estado_provincia_destino_cotacao_bid_frete_internacional: e.target.value })}
                  placeholder="Estado ou província"
                />
              )}
            </LinhaCampo>
            <LinhaCampo
              campo="endereco_destino_cotacao_bid_frete_internacional"
              rotulo="Endereço destino (entrega)"
              status={statusPorCampo.get('endereco_destino_cotacao_bid_frete_internacional') ?? 'pendente'}
            >
              <input
                className="nc-input"
                value={prefill.endereco_destino_cotacao_bid_frete_internacional ?? ''}
                onChange={(e) => patchPrefill({ endereco_destino_cotacao_bid_frete_internacional: e.target.value })}
                placeholder="Endereço de entrega"
                autoComplete="off"
              />
            </LinhaCampo>
          </>
        )}

        {exigeArmazenagemLcl && (
          <LinhaCampo
            campo="opcao_incluir_armazenagem_cotacao"
            rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.opcao_incluir_armazenagem_cotacao}
            status={statusPorCampo.get('opcao_incluir_armazenagem_cotacao') ?? 'pendente'}
            obrigatorio
          >
            <div className="nc-options-grid-2 sr-prefill-bid-opcoes-inline">
              <OptionButton
                selected={prefill.opcao_incluir_armazenagem_cotacao === 'sim'}
                onClick={() => patchPrefill({ opcao_incluir_armazenagem_cotacao: 'sim' })}
                icon={<Package weight="duotone" size={16} />}
                label="Sim"
                description="Abre passo Armazenagem no wizard"
              />
              <OptionButton
                selected={prefill.opcao_incluir_armazenagem_cotacao === 'nao'}
                onClick={() => patchPrefill({ opcao_incluir_armazenagem_cotacao: 'nao' })}
                icon={<Package weight="duotone" size={16} />}
                label="Não"
                description="Segue direto para fornecedores"
              />
            </div>
          </LinhaCampo>
        )}
      </div>
    </div>
  )
}
