/**
 * Modal de confirmação de fechamento na plataforma.
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, SealCheck, WarningCircle } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { fecharCotacaoBidFreteInternacional } from './api'
import type { Cotacao } from './types'
import {
  montarTextoAvisoTaxaModalAprovarPropostaBidFrete,
} from '../../../shared/textos-taxa-fechamento-plataforma-bid-frete-internacional'
import {
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional'
import { nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional } from '../../../shared/estado-aceite-ganhador-comparativo-bid-frete-internacional'

type Props = {
  aberto: boolean
  cotacao: Cotacao | null
  nomeFornecedor: string
  aoFechar: () => void
  aoSucesso: (cotacaoAtualizada: Cotacao) => void
}

export function ModalFecharCotacaoBidFreteInternacional({
  aberto,
  cotacao,
  nomeFornecedor,
  aoFechar,
  aoSucesso,
}: Props) {
  const { t } = useTranslation()
  const [fechando, setFechando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const pagador = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
    cotacao?.empresa_pagadora_taxa_fechamento_plataforma_gravity,
  )
  const avisoTaxa = montarTextoAvisoTaxaModalAprovarPropostaBidFrete({
    pagador,
    nomeFornecedor,
  })

  const confirmar = async () => {
    if (!cotacao?.id_cotacao_bid_frete_internacional) return
    setFechando(true)
    setErro(null)
    try {
      const res = await fecharCotacaoBidFreteInternacional(cotacao.id_cotacao_bid_frete_internacional)
      setSucesso(true)
      aoSucesso(res.cotacao as Cotacao)
    } catch (e: unknown) {
      setErro(
        e instanceof Error
          ? e.message
          : t('bidfrete.comparativo.erro_fechar', 'Não foi possível confirmar o fechamento.'),
      )
    } finally {
      setFechando(false)
    }
  }

  const fecharModal = () => {
    if (fechando) return
    setErro(null)
    setSucesso(false)
    aoFechar()
  }

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={fecharModal}
      titulo={
        sucesso
          ? t('bidfrete.comparativo.fechamento_sucesso_titulo', 'Fechamento confirmado')
          : t('bidfrete.comparativo.fechamento_modal_titulo', 'Confirmar fechamento na plataforma')
      }
      tamanho="md"
      renderizarFooter={() => (
        sucesso ? (
          <BotaoGlobal variante="primario" onClick={fecharModal}>
            {t('comum.continuar', 'Continuar')}
          </BotaoGlobal>
        ) : (
          <>
            <BotaoGlobal variante="secundario" onClick={fecharModal} disabled={fechando}>
              {t('comum.cancelar', 'Cancelar')}
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              icone={<SealCheck size={14} weight="bold" />}
              carregando={fechando}
              onClick={() => void confirmar()}
            >
              {t('bidfrete.comparativo.confirmar_fechamento', 'Confirmar fechamento')}
            </BotaoGlobal>
          </>
        )
      )}
    >
      {sucesso ? (
        <p className="bf-fechamento-sucesso-texto">
          {t(
            'bidfrete.comparativo.fechamento_sucesso_desc',
            'Registramos o fechamento do frete com {{fornecedor}}. A taxa de plataforma foi incluída no faturamento.',
            { fornecedor: nomeFornecedor },
          )}
        </p>
      ) : (
        <div className="bf-fechamento-corpo">
          {erro ? (
            <div className="bf-aprovacao-erro" role="alert">
              <WarningCircle weight="duotone" size={20} aria-hidden />
              <p>{erro}</p>
            </div>
          ) : null}
          <div className="bf-aprovacao-fornecedor-card">
            <CheckCircle weight="duotone" size={18} aria-hidden />
            <div>
              <span className="bf-aprovacao-fornecedor-label">
                {t('bidfrete.comparativo.fornecedor_selecionado', 'Fornecedor selecionado')}
              </span>
              <strong>{nomeFornecedor}</strong>
            </div>
          </div>
          <p className="bf-fechamento-intro">
            {t(
              'bidfrete.comparativo.fechamento_intro',
              'Confirme que o frete será executado com este fornecedor por meio da plataforma Gravity.',
            )}
          </p>
          <div className="bf-aprovacao-aviso" role="note">
            <p>{avisoTaxa}</p>
          </div>
        </div>
      )}
    </ModalOverlay>
  )
}

export function resolverNomeFornecedorGanhadorCotacao(cotacao: Cotacao | null): string {
  const proposta = cotacao?.propostas_bid_frete_internacional?.find(
    (p) =>
      p.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA'
      || p.status_proposta_bid_frete_internacional === 'APROVADA',
  )
  return nomeFornecedorGanhadorEstadoAceiteBidFreteInternacional(proposta ?? undefined)
}
