/**
 * Modal de confirmação de aprovação — @nucleo/modal-global + resumo completo da proposta.
 */

import React, { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BellRinging, CheckCircle, CurrencyDollar, Info, Trophy } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalOverlay } from '@nucleo/modal-global'
import type { Cotacao, PropostaRankingBidFreteInternacional } from './types'

const formatMoeda = (val: number, currency: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)

const formatDataBR = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

function nomeFornecedor(proposta: PropostaRankingBidFreteInternacional, fallback: string): string {
  return (
    proposta.fornecedor_nome
    ?? proposta.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? fallback
  )
}

interface CampoResumoPropostaProps {
  label: string
  value: string
  destaque?: boolean
  wide?: boolean
}

function CampoResumoProposta({ label, value, destaque = false, wide = false }: CampoResumoPropostaProps) {
  return (
    <div
      className={[
        'bf-aprovacao-campo',
        destaque ? 'bf-aprovacao-campo--destaque' : '',
        wide ? 'bf-aprovacao-campo--wide' : '',
      ].filter(Boolean).join(' ')}
    >
      <span className="bf-aprovacao-campo-label">{label}</span>
      <span className="bf-aprovacao-campo-valor">{value}</span>
    </div>
  )
}

function ResumoCompletoProposta({
  proposta,
}: {
  proposta: PropostaRankingBidFreteInternacional
}) {
  const { t } = useTranslation()
  const moeda = proposta.moeda_proposta_bid_frete_internacional
  const dias = t('bidfrete.detalhe_cotacao.dias', 'dias')

  const transbordo =
    proposta.quantidade_transbordo_proposta_bid_frete_internacional === 0
      ? t('bidfrete.comparativo.direto', 'Direto')
      : String(proposta.quantidade_transbordo_proposta_bid_frete_internacional)

  const freeTime =
    proposta.dias_free_time_proposta_bid_frete_internacional != null
      ? `${proposta.dias_free_time_proposta_bid_frete_internacional} ${dias}`
      : '—'

  const escalas =
    proposta.quantidade_escala_proposta_bid_frete_internacional > 0
      ? String(proposta.quantidade_escala_proposta_bid_frete_internacional)
      : '—'

  const rating =
    proposta.nota_global_classificacao_bid_frete_internacional != null
      ? `${proposta.nota_global_classificacao_bid_frete_internacional.toFixed(1)}/5`
      : proposta.fornecedor?.nota_global_classificacao_bid_frete_internacional != null
        ? `${proposta.fornecedor.nota_global_classificacao_bid_frete_internacional.toFixed(1)}/5`
        : '—'

  return (
    <div className="bf-aprovacao-grid">
      <CampoResumoProposta
        label={t('bidfrete.comparativo.modal_aprovar_campo_moeda', 'Moeda')}
        value={moeda}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_frete', 'Frete Básico')}
        value={formatMoeda(proposta.valor_frete_proposta_bid_frete_internacional, moeda)}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_taxas_origem', 'Taxas da Origem')}
        value={formatMoeda(proposta.taxas_origem_proposta_bid_frete_internacional, moeda)}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_taxas_destino', 'Taxas do Destino')}
        value={formatMoeda(proposta.taxas_destino_proposta_bid_frete_internacional, moeda)}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_frete_total', 'Frete Total')}
        value={formatMoeda(proposta.valor_total_proposta_bid_frete_internacional, moeda)}
        destaque
        wide
      />
      <CampoResumoProposta
        label={t('bidfrete.comparativo.transit_time', 'Transit Time')}
        value={`${proposta.dias_transito_proposta_bid_frete_internacional} ${dias}`}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_free_time', 'Free Time')}
        value={freeTime}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_validade', 'Validade')}
        value={formatDataBR(proposta.validade_proposta_bid_frete_internacional)}
      />
      <CampoResumoProposta
        label={t('bidfrete.detalhe_cotacao.resp_transbordos', 'Transbordo')}
        value={transbordo}
      />
      <CampoResumoProposta
        label={t('bidfrete.comparativo.modal_aprovar_campo_escalas', 'Escalas')}
        value={escalas}
      />
      <CampoResumoProposta
        label={t('bidfrete.comparativo.rating', 'Rating')}
        value={rating}
      />
      {proposta.observacoes_proposta_bid_frete_internacional?.trim() && (
        <CampoResumoProposta
          label={t('bidfrete.comparativo.observacoes', 'Observações')}
          value={proposta.observacoes_proposta_bid_frete_internacional.trim()}
          wide
        />
      )}
    </div>
  )
}

export interface ModalAprovarPropostaBidFreteInternacionalProps {
  aberto: boolean
  proposta: PropostaRankingBidFreteInternacional | null
  aprovando?: boolean
  aprovacaoSucesso?: boolean
  /** Resposta da API após aprovar — alimenta card de saving na tela de sucesso. */
  resultadoAprovacao?: Cotacao | null
  onFechar: () => void
  onConfirmar: () => void
  /** Fecha o modal após o usuário ver a confirmação de sucesso. */
  onConcluirSucesso?: () => void
}

function CorpoSucessoAprovacao({
  nomeFornecedorExibicao,
  resultado,
}: {
  nomeFornecedorExibicao: string
  resultado: Cotacao | null | undefined
}) {
  const { t } = useTranslation()
  const moedaSaving = resultado?.moeda_aprovada ?? resultado?.moeda_meta_cotacao_bid_frete_internacional ?? 'USD'
  const valorSaving = resultado?.ganho_valor_cotacao_bid_frete_internacional
  const pctSaving = resultado?.ganho_percentual_cotacao_bid_frete_internacional

  return (
    <div className="bf-aprovacao-sucesso" role="status">
      <div className="bf-aprovacao-sucesso-icone" aria-hidden>
        <CheckCircle weight="duotone" size={56} />
      </div>
      <h3 className="bf-aprovacao-sucesso-titulo">
        {t('bidfrete.comparativo.aprovacao_confirmada', 'Aprovação confirmada!')}
      </h3>
      <p className="bf-aprovacao-sucesso-sub">
        {t('bidfrete.comparativo.fornecedor_selecionado', 'Fornecedor selecionado')}:{' '}
        <strong>{nomeFornecedorExibicao}</strong>
      </p>
      <p className="bf-aprovacao-sucesso-aviso">
        {t(
          'bidfrete.comparativo.aprovacao_sucesso_aviso',
          'O ganhador será notificado. As demais propostas foram reprovadas automaticamente.',
        )}
      </p>
      {valorSaving != null && valorSaving > 0 && (
        <div className="bf-aprovacao-saving-card">
          <div className="bf-aprovacao-saving-header">
            <CurrencyDollar weight="duotone" size={18} aria-hidden />
            <span>{t('bidfrete.comparativo.saving_obtido', 'Saving obtido')}</span>
          </div>
          <div className="bf-aprovacao-saving-valores">
            <span className="bf-aprovacao-saving-valor">
              {formatMoeda(valorSaving, moedaSaving)}
            </span>
            {pctSaving != null && (
              <span className="bf-aprovacao-saving-pct">{pctSaving.toFixed(1)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DestaqueGanhadorAvisoAprovacao({ children }: { children?: React.ReactNode }) {
  return (
    <strong className="bf-aprovacao-aviso-ganhador">
      <Trophy weight="duotone" size={14} className="bf-aprovacao-aviso-trofeu" aria-hidden />
      {children}
    </strong>
  )
}

export function ModalAprovarPropostaBidFreteInternacional({
  aberto,
  proposta,
  aprovando = false,
  aprovacaoSucesso = false,
  resultadoAprovacao = null,
  onFechar,
  onConfirmar,
  onConcluirSucesso,
}: ModalAprovarPropostaBidFreteInternacionalProps) {
  const { t } = useTranslation()
  const tituloId = useId()

  const fornecedorFallback = t('bidfrete.comparativo.fornecedor', 'Fornecedor')
  const nome = proposta ? nomeFornecedor(proposta, fornecedorFallback) : fornecedorFallback
  const tituloModal = t('bidfrete.comparativo.modal_aprovar', 'Confirmar Aprovação')
  const subtituloModal = t('bidfrete.comparativo.modal_aprovar_subtitulo', {
    fornecedor: nome,
    defaultValue: `Revise os dados completos da proposta de ${nome} antes de confirmar.`,
  })
  const exibirSucesso = aprovacaoSucesso && !aprovando
  const bloquearFechar = aprovando

  function aoFecharModal() {
    if (aprovando) return
    if (exibirSucesso) {
      ;(onConcluirSucesso ?? onFechar)()
      return
    }
    onFechar()
  }

  return (
    <>
      <ModalOverlay
        aberto={aberto}
        aoFechar={aoFecharModal}
        titulo={exibirSucesso ? '' : tituloModal}
        tamanho={exibirSucesso ? 'md' : 'lg'}
        semFechar={bloquearFechar}
        fecharAoClicarOverlay={!bloquearFechar}
        fecharPorESC={!bloquearFechar}
        cabecalhoPersonalizado={
          exibirSucesso
            ? <div className="bf-aprovacao-modal-header bf-aprovacao-modal-header--sucesso" aria-hidden />
            : (
              <div className="modal-header bf-aprovacao-modal-header">
                <div className="bf-aprovacao-modal-header-texto">
                  <div className="bf-aprovacao-modal-titulo-row">
                    <CheckCircle
                      weight="duotone"
                      size={22}
                      className="bf-aprovacao-modal-icone-titulo"
                      aria-hidden
                    />
                    <h2 id={tituloId} className="mg-titulo text-h3">
                      {tituloModal}
                    </h2>
                  </div>
                  <p className="mg-subtitulo text-sm">{subtituloModal}</p>
                </div>
              </div>
            )
        }
        renderizarFooter={() => (
          exibirSucesso ? (
            <BotaoGlobal
              variante="primario"
              tamanho="medio"
              icone={<CheckCircle size={14} weight="bold" />}
              onClick={aoFecharModal}
            >
              {t('comum.continuar', 'Continuar')}
            </BotaoGlobal>
          ) : (
            <>
              <BotaoGlobal
                variante="secundario"
                tamanho="medio"
                onClick={onFechar}
                disabled={aprovando}
              >
                {t('comum.cancelar', 'Cancelar')}
              </BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                tamanho="medio"
                icone={<CheckCircle size={14} weight="bold" />}
                carregando={aprovando}
                textoCarregando={t('bidfrete.comparativo.aprovando', 'Aprovando...')}
                disabled={!proposta || aprovando}
                onClick={onConfirmar}
              >
                {t('bidfrete.comparativo.confirmar_aprovacao', 'Confirmar Aprovação')}
              </BotaoGlobal>
            </>
          )
        )}
      >
        {exibirSucesso ? (
          <CorpoSucessoAprovacao
            nomeFornecedorExibicao={nome}
            resultado={resultadoAprovacao}
          />
        ) : proposta && (
          <div className="bf-aprovacao-corpo">
            <div className="bf-aprovacao-aviso" role="note">
              <BellRinging weight="duotone" size={20} className="bf-aprovacao-aviso-icone" aria-hidden />
              <p className="bf-aprovacao-aviso-texto">
                <Trans
                  i18nKey="bidfrete.comparativo.modal_aprovar_aviso_ganhador"
                  values={{ fornecedor: nome }}
                  components={{
                    ganhador: <DestaqueGanhadorAvisoAprovacao />,
                  }}
                  defaults={
                    'A partir deste momento, <ganhador>{{fornecedor}}</ganhador> será avisado como ganhador da cotação. '
                    + 'As demais propostas serão reprovadas automaticamente.'
                  }
                />
              </p>
            </div>

            <div className="bf-aprovacao-fornecedor-card">
              <CheckCircle weight="duotone" size={18} className="bf-aprovacao-fornecedor-icone" aria-hidden />
              <div>
                <span className="bf-aprovacao-fornecedor-label">
                  {t('bidfrete.comparativo.fornecedor_selecionado', 'Fornecedor selecionado')}
                </span>
                <strong className="bf-aprovacao-fornecedor-nome">{nome}</strong>
              </div>
            </div>

            <h4 className="bf-aprovacao-secao-titulo">
              <Info weight="duotone" size={16} aria-hidden />
              {t('bidfrete.comparativo.modal_aprovar_secao_proposta', 'Dados completos da proposta')}
            </h4>

            <ResumoCompletoProposta proposta={proposta} />
          </div>
        )}
      </ModalOverlay>
      <style>{MODAL_APROVAR_PROPOSTA_RESUMO_STYLES}</style>
    </>
  )
}

const MODAL_APROVAR_PROPOSTA_RESUMO_STYLES = `
  .bf-aprovacao-modal-header {
    padding-right: 3.5rem;
  }
  .bf-aprovacao-modal-header--sucesso {
    padding: 0;
    min-height: 2.75rem;
    border-bottom: none;
  }
  .bf-aprovacao-modal-header-texto {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }
  .bf-aprovacao-modal-titulo-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .bf-aprovacao-modal-icone-titulo {
    flex-shrink: 0;
    color: var(--ws-accent, var(--color-primary, #818cf8));
  }
  /* Header → conteúdo: mesmo 1.25rem do gap entre blocos (evita padding duplo do .modal-body) */
  .mg-dialog:has(.bf-aprovacao-corpo) > .mg-body.modal-body {
    padding-top: 0;
  }
  .bf-aprovacao-corpo {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-top: 1.25rem;
  }
  .bf-aprovacao-aviso {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(129, 140, 248, 0.28);
  }
  .bf-aprovacao-aviso-icone {
    flex-shrink: 0;
    color: #a5b4fc;
    margin-top: 0.1rem;
  }
  .bf-aprovacao-aviso-texto {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--text-secondary, #cbd5e1);
  }
  .bf-aprovacao-aviso-ganhador {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }
  .bf-aprovacao-aviso-trofeu {
    flex-shrink: 0;
    color: var(--warning, #f59e0b);
  }
  .bf-aprovacao-fornecedor-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.22);
  }
  .bf-aprovacao-fornecedor-icone {
    color: #4ade80;
    flex-shrink: 0;
  }
  .bf-aprovacao-fornecedor-label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #94a3b8);
    margin-bottom: 0.15rem;
  }
  .bf-aprovacao-fornecedor-nome {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--text-primary, #f8fafc);
  }
  .bf-aprovacao-secao-titulo {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0.5rem 0 0;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #94a3b8);
  }
  .bf-aprovacao-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
  @media (max-width: 640px) {
    .bf-aprovacao-grid {
      grid-template-columns: 1fr;
    }
  }
  .bf-aprovacao-campo {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 0.85rem;
    border-radius: 8px;
    background: var(--bg-base, rgba(15, 23, 42, 0.55));
    border: 1px solid rgba(148, 163, 184, 0.12);
  }
  .bf-aprovacao-campo--destaque {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(129, 140, 248, 0.25);
  }
  .bf-aprovacao-campo--wide {
    grid-column: 1 / -1;
  }
  .bf-aprovacao-campo-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #94a3b8);
  }
  .bf-aprovacao-campo-valor {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.45;
    color: var(--text-primary, #f1f5f9);
    word-break: break-word;
  }
  .bf-aprovacao-campo--destaque .bf-aprovacao-campo-valor {
    font-size: 1rem;
    font-weight: 700;
    color: #e0e7ff;
  }
  .mg-dialog:has(.bf-aprovacao-sucesso) > .mg-body.modal-body {
    padding-top: 1.5rem;
    padding-bottom: 0.5rem;
  }
  .bf-aprovacao-sucesso {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.875rem;
    padding: 0.5rem 0.75rem 1rem;
    text-align: center;
  }
  .bf-aprovacao-sucesso-icone {
    color: var(--success, #22c55e);
    animation: bf-aprovacao-sucesso-pulse 0.85s ease-out;
  }
  @keyframes bf-aprovacao-sucesso-pulse {
    0% { transform: scale(0.82); opacity: 0; }
    55% { transform: scale(1.06); }
    100% { transform: scale(1); opacity: 1; }
  }
  .bf-aprovacao-sucesso-titulo {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #f1f5f9);
  }
  .bf-aprovacao-sucesso-sub {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary, #94a3b8);
    line-height: 1.5;
  }
  .bf-aprovacao-sucesso-sub strong {
    color: var(--text-primary, #f1f5f9);
  }
  .bf-aprovacao-sucesso-aviso {
    margin: 0;
    max-width: 28rem;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--text-muted, #94a3b8);
  }
  .bf-aprovacao-saving-card {
    margin-top: 0.35rem;
    width: 100%;
    max-width: 18rem;
    padding: 0.875rem 1.125rem;
    border-radius: 10px;
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.22);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    text-align: left;
  }
  .bf-aprovacao-saving-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #86efac;
  }
  .bf-aprovacao-saving-valores {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
  .bf-aprovacao-saving-valor {
    font-size: 1.125rem;
    font-weight: 800;
    color: #f0fdf4;
    font-variant-numeric: tabular-nums;
  }
  .bf-aprovacao-saving-pct {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #4ade80;
  }
`
