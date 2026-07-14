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
  Package,
  PencilSimple,
  Truck,
  Van,
} from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useTranslation } from 'react-i18next'
import type {
  DetalheMapeamentoSmartReadCotacaoBidFrete,
  PrefillFormularioCotacaoBidFreteSmartRead,
} from '../../../../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import { ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE } from '../../../../../smart-read/shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import {
  avaliarCamposFaltantesPrefillCotacaoBidFrete,
  exigeCampoArmazenagemLclPrefill,
  exigeLinhasContainerFclPrefill,
  modalExigeAeroportoPrefill,
  modalExigePortoPrefill,
  resolverPassoInicialPrefillSmartRead,
} from '../../../../shared/regras-prefill-smart-read-cotacao-bid-frete-internacional.js'
import {
  INCOTERM_TODOS_NOVA_COTACAO,
  traduzirDescModalNovaCotacao,
  traduzirDescModalidadeNovaCotacao,
  traduzirDescOperacaoNovaCotacao,
  traduzirLabelModalidadeNovaCotacao,
  traduzirModalNovaCotacao,
  traduzirOperacaoNovaCotacao,
} from '../../shared/traduzir-nova-cotacao-bid-frete-internacional'
import { useAeroportosPorPais, useContainersCadastros, usePortosPorPais } from '../../shared/useCadastrosLogistica'
import type { ModalFrete, ModalidadeCarga, TipoOperacao } from '../../shared/types'
import './prefill-cotacao-bid-frete-smart-read.css'

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
  if (valorAtual == null || valorAtual === '') return 'pendente'
  if (!registro) return 'editado'
  const original = registro.valor_destino
  if (String(valorAtual) !== String(original ?? '')) return 'editado'
  return registro.status_mapeamento === 'sugerido' ? 'sugerido' : 'mapeado'
}

function LinhaCampo({
  campo,
  rotulo,
  status,
  children,
}: {
  campo: string
  rotulo: string
  status: StatusLinha
  children: React.ReactNode
}) {
  return (
    <div className="sr-prefill-bid-revisao-linha" role="row">
      <span className="sr-prefill-bid-revisao-campo sr-prefill-bid-campo-editavel" role="cell">
        <PencilSimple weight="duotone" size={13} className="dt-row-edit-icon" aria-hidden />
        {rotulo}
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
  const passo_inicial_tipo = resolverPassoInicialPrefillSmartRead(prefill)
  return {
    campos_faltantes: avaliarCamposFaltantesPrefillCotacaoBidFrete(prefill),
    passo_inicial_tipo,
    iniciar_no_passo_fornecedores: passo_inicial_tipo === 'fornecedores',
  }
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
  const exigeArmazenagemLcl = exigeCampoArmazenagemLclPrefill(prefill)
  const exigeContainerFcl = exigeLinhasContainerFclPrefill(prefill)

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
      const next = { ...prefill, ...patch }
      onChange(next, recalcularMeta(next))
    },
    [onChange, prefill],
  )

  const aoMudarModal = useCallback((novoModal: ModalFrete) => {
    const base: PrefillFormularioCotacaoBidFreteSmartRead = {
      ...prefill,
      modal_cotacao_bid_frete_internacional: novoModal,
      modalidade_cotacao_bid_frete_internacional: novoModal === 'AEREO' ? 'AEREO_GERAL' : '',
      opcao_incluir_armazenagem_cotacao: '',
      tipo_container_cotacao_bid_frete_internacional: '',
      porto_origem_cotacao_bid_frete_internacional: '',
      porto_destino_cotacao_bid_frete_internacional: '',
      aeroporto_origem_cotacao_bid_frete_internacional: '',
      aeroporto_destino_cotacao_bid_frete_internacional: '',
    }
    onChange(base, recalcularMeta(base))
  }, [onChange, prefill])

  const aoMudarModalidade = useCallback((novaModalidade: ModalidadeCarga) => {
    const base: PrefillFormularioCotacaoBidFreteSmartRead = {
      ...prefill,
      modalidade_cotacao_bid_frete_internacional: novaModalidade,
      opcao_incluir_armazenagem_cotacao: novaModalidade === 'LCL' ? (prefill.opcao_incluir_armazenagem_cotacao ?? 'nao') : '',
      tipo_container_cotacao_bid_frete_internacional: novaModalidade === 'FCL' ? prefill.tipo_container_cotacao_bid_frete_internacional : '',
    }
    onChange(base, recalcularMeta(base))
  }, [onChange, prefill])

  useEffect(() => {
    onChange(prefill, recalcularMeta(prefill))
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
      <div className="sr-prefill-bid-secao-opcoes">
        <h4 className="sr-prefill-bid-secao-titulo">Operação e modal</h4>
        <div className="nc-options-grid-2 sr-prefill-bid-opcoes-compactas">
          {(['IMPORTACAO', 'EXPORTACAO'] as TipoOperacao[]).map((op) => (
            <OptionButton
              key={op}
              selected={prefill.tipo_operacao_cotacao_bid_frete_internacional === op}
              onClick={() => patchPrefill({ tipo_operacao_cotacao_bid_frete_internacional: op })}
              icon={op === 'IMPORTACAO' ? <DownloadSimple weight="duotone" size={20} /> : <Export weight="duotone" size={20} />}
              label={traduzirOperacaoNovaCotacao(t, op)}
              description={traduzirDescOperacaoNovaCotacao(t, op)}
            />
          ))}
        </div>
        <div className="nc-options-grid-3 sr-prefill-bid-opcoes-compactas">
          <OptionButton
            selected={modal === 'MARITIMO'}
            onClick={() => aoMudarModal('MARITIMO')}
            icon={<Anchor weight="duotone" size={20} />}
            label={traduzirModalNovaCotacao(t, 'MARITIMO')}
            description={traduzirDescModalNovaCotacao(t, 'MARITIMO')}
          />
          <OptionButton
            selected={modal === 'AEREO'}
            onClick={() => aoMudarModal('AEREO')}
            icon={<AirplaneTilt weight="duotone" size={20} />}
            label={traduzirModalNovaCotacao(t, 'AEREO')}
            description={traduzirDescModalNovaCotacao(t, 'AEREO')}
          />
          <OptionButton
            selected={modal === 'RODOVIARIO'}
            onClick={() => aoMudarModal('RODOVIARIO')}
            icon={<Truck weight="duotone" size={20} />}
            label={traduzirModalNovaCotacao(t, 'RODOVIARIO')}
            description={traduzirDescModalNovaCotacao(t, 'RODOVIARIO')}
          />
        </div>
        {modal !== 'AEREO' && modal && (
          <div className="nc-options-grid-2 sr-prefill-bid-opcoes-compactas">
            {modal === 'MARITIMO' && (
              <>
                <OptionButton
                  selected={modalidade === 'FCL'}
                  onClick={() => aoMudarModalidade('FCL')}
                  icon={<Package weight="duotone" size={18} />}
                  label={traduzirLabelModalidadeNovaCotacao(t, 'FCL')}
                  description={traduzirDescModalidadeNovaCotacao(t, 'FCL')}
                />
                <OptionButton
                  selected={modalidade === 'LCL'}
                  onClick={() => aoMudarModalidade('LCL')}
                  icon={<Package weight="duotone" size={18} />}
                  label={traduzirLabelModalidadeNovaCotacao(t, 'LCL')}
                  description={traduzirDescModalidadeNovaCotacao(t, 'LCL')}
                />
              </>
            )}
            {modal === 'RODOVIARIO' && (
              <>
                <OptionButton
                  selected={modalidade === 'RODOVIARIO_FTL'}
                  onClick={() => aoMudarModalidade('RODOVIARIO_FTL')}
                  icon={<Van weight="duotone" size={18} />}
                  label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_FTL')}
                  description={traduzirDescModalidadeNovaCotacao(t, 'RODOVIARIO_FTL')}
                />
                <OptionButton
                  selected={modalidade === 'RODOVIARIO_LTL'}
                  onClick={() => aoMudarModalidade('RODOVIARIO_LTL')}
                  icon={<Van weight="duotone" size={18} />}
                  label={traduzirLabelModalidadeNovaCotacao(t, 'RODOVIARIO_LTL')}
                  description={traduzirDescModalidadeNovaCotacao(t, 'RODOVIARIO_LTL')}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div className="sr-prefill-bid-revisao-tabela" role="table" aria-label="Campos editáveis da cotação">
        <div className="sr-prefill-bid-revisao-linha sr-prefill-bid-revisao-linha--cabecalho" role="row">
          <span role="columnheader">Campo da cotação</span>
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
          campo="incoterm_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.incoterm_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('incoterm_cotacao_bid_frete_internacional') ?? 'pendente'}
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

        <LinhaCampo
          campo="descricao_mercadoria_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.descricao_mercadoria_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('descricao_mercadoria_cotacao_bid_frete_internacional') ?? 'pendente'}
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
          campo="quantidade_volume_cotacao_bid_frete_internacional"
          rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.quantidade_volume_cotacao_bid_frete_internacional}
          status={statusPorCampo.get('quantidade_volume_cotacao_bid_frete_internacional') ?? 'pendente'}
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

        {exigePorto && (
          <>
            <LinhaCampo
              campo="porto_origem_cotacao_bid_frete_internacional"
              rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.porto_origem_cotacao_bid_frete_internacional}
              status={statusPorCampo.get('porto_origem_cotacao_bid_frete_internacional') ?? 'pendente'}
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

        {exigeContainerFcl && (
          <LinhaCampo
            campo="tipo_container_cotacao_bid_frete_internacional"
            rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.tipo_container_cotacao_bid_frete_internacional}
            status={statusPorCampo.get('tipo_container_cotacao_bid_frete_internacional') ?? 'pendente'}
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
        )}

        {exigeArmazenagemLcl && (
          <LinhaCampo
            campo="opcao_incluir_armazenagem_cotacao"
            rotulo={ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE.opcao_incluir_armazenagem_cotacao}
            status={statusPorCampo.get('opcao_incluir_armazenagem_cotacao') ?? 'pendente'}
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
