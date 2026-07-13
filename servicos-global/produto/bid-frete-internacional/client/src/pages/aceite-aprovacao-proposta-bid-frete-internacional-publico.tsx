/**
 * Página pública — aceite "Recebi e estou de acordo" (ganhador, sem login).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, CurrencyDollar, HandCoins, UserCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ConteudoCarregandoBidFreteInternacional } from '../shared/pagina-carregando-bid-frete-internacional'
import {
  confirmarAceiteAprovacaoPropostaBidFreteInternacionalPublico,
  getAceiteAprovacaoPropostaBidFreteInternacionalPublico,
} from '../shared/api'
import { formatarMoedaBidFrete } from '../shared/exibir-taxas-proposta-bid-frete-internacional'
import {
  EstadoMensagemRespostaCotacao,
  ShellPaginaRespostaCotacao,
} from '../shared/formulario-resposta-cotacao-bid-frete-internacional'
import {
  ehContratanteGravityPagadorTaxaFechamento,
  normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity,
  rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity,
} from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional'
import { resolverRotaContratoFechamentoPlataformaBidFreteInternacional } from '../../../shared/contrato-fechamento-plataforma-bid-frete-internacional'
import { ROTULO_TAXA_FECHAMENTO_FRETE_USD } from '../../../shared/condicoes-plataforma-fornecedor-bid-frete-internacional'

type PageState = 'loading' | 'invalid' | 'ready' | 'success' | 'expired'

function extrairTokenAceiteAprovacaoPublico(pathname: string): string | undefined {
  const marcador = '/aceite-aprovacao-proposta-bid-frete-internacional/publico/'
  const indice = pathname.indexOf(marcador)
  if (indice === -1) return undefined
  return pathname.slice(indice + marcador.length).split('/')[0]?.trim() || undefined
}

export default function AceiteAprovacaoPropostaPublico() {
  const params = useParams<{
    token_aceite_aprovacao_proposta_bid_frete_internacional: string
  }>()
  const location = useLocation()
  const token =
    params.token_aceite_aprovacao_proposta_bid_frete_internacional?.trim()
    || extrairTokenAceiteAprovacaoPublico(location.pathname)
  const { t } = useTranslation()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [confirmando, setConfirmando] = useState(false)
  const [aceiteCondicoes, setAceiteCondicoes] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [dados, setDados] = useState<Awaited<
    ReturnType<typeof getAceiteAprovacaoPropostaBidFreteInternacionalPublico>
  > | null>(null)

  const carregar = useCallback(async () => {
    if (!token?.trim()) {
      setPageState('invalid')
      return
    }
    setPageState('loading')
    setErro(null)
    try {
      const res = await getAceiteAprovacaoPropostaBidFreteInternacionalPublico(token)
      setDados(res)
      if (res.ja_confirmado) {
        setPageState('success')
      } else if (res.token_expirado) {
        setPageState('expired')
      } else {
        setPageState('ready')
      }
    } catch {
      setPageState('invalid')
    }
  }, [token])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const confirmar = async () => {
    if (!token?.trim() || !dados?.pode_confirmar) return
    if (!dados.hash_contrato_fechamento_plataforma_bid_frete_internacional) return
    setConfirmando(true)
    setErro(null)
    try {
      await confirmarAceiteAprovacaoPropostaBidFreteInternacionalPublico(token, {
        aceite_contrato_li_e_aceito: true,
        hash_contrato_fechamento_plataforma_bid_frete_internacional:
          dados.hash_contrato_fechamento_plataforma_bid_frete_internacional,
      })
      setPageState('success')
    } catch (e: unknown) {
      setErro(
        e instanceof Error
          ? e.message
          : t('bidfrete.aceite_aprovacao.erro_confirmar', 'Não foi possível confirmar.'),
      )
    } finally {
      setConfirmando(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
        <EstadoMensagemRespostaCotacao variante="carregando" titulo="">
          <ConteudoCarregandoBidFreteInternacional />
        </EstadoMensagemRespostaCotacao>
      </ShellPaginaRespostaCotacao>
    )
  }

  if (pageState === 'invalid') {
    return (
      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
        <EstadoMensagemRespostaCotacao
          variante="invalido"
          titulo={t('bidfrete.aceite_aprovacao.link_invalido', 'Link inválido ou expirado')}
          descricao={t('bidfrete.portal.publico.invalido_contato', 'Se precisar de ajuda, entre em contato com quem enviou o link.')}
        />
      </ShellPaginaRespostaCotacao>
    )
  }

  const proposta = dados?.proposta
  const valorFmt = proposta
    ? formatarMoedaBidFrete(
        proposta.valor_total_proposta_bid_frete_internacional,
        proposta.moeda_proposta_bid_frete_internacional,
      )
    : '—'

  const pagadorTaxa = normalizarEmpresaPagadoraTaxaFechamentoPlataformaGravity(
    dados?.empresa_pagadora_taxa_fechamento_plataforma_gravity,
  )
  const taxaPagaPelaPropriaEmpresa = !ehContratanteGravityPagadorTaxaFechamento(pagadorTaxa)
  const rotaContratoFechamento = resolverRotaContratoFechamentoPlataformaBidFreteInternacional(
    pagadorTaxa,
    undefined,
    { token_aceite: token },
  )

  if (pageState === 'expired') {
    return (
      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
        <EstadoMensagemRespostaCotacao
          variante="bloqueado"
          titulo={t('bidfrete.aceite_aprovacao.link_expirado', 'Link expirado')}
          descricao={t(
            'bidfrete.aceite_aprovacao.link_expirado_desc',
            'Entre em contato com o contratante para solicitar um novo envio.',
          )}
        />
      </ShellPaginaRespostaCotacao>
    )
  }

  if (pageState === 'success') {
    return (
      <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
        <EstadoMensagemRespostaCotacao
          variante="sucesso"
          titulo={t('bidfrete.aceite_aprovacao.confirmado_titulo', 'Aprovação recebida')}
          descricao={t(
            'bidfrete.aceite_aprovacao.confirmado_desc',
            'Registramos que você recebeu e está de acordo com a aprovação da proposta {{cotacao}}.',
            { cotacao: proposta?.numero_cotacao_bid_frete_internacional ?? '' },
          )}
        />
      </ShellPaginaRespostaCotacao>
    )
  }

  const nomeFornecedor = proposta?.nome_fornecedor_bid_frete_internacional ?? ''
  const numeroCotacao = proposta?.numero_cotacao_bid_frete_internacional ?? ''

  return (
    <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
      <EstadoMensagemRespostaCotacao
        variante="sucesso"
        titulo={t('bidfrete.aceite_aprovacao.titulo', 'Confirmar recebimento da aprovação')}
        acao={
          <div className="bf-aceite-aprovacao-acoes">
            <div className="bf-aceite-aprovacao-painel">
              <p className="bf-aceite-aprovacao-intro">
                <UserCircle size={16} weight="duotone" className="bf-aceite-aprovacao-icone-linha" aria-hidden />
                <span>
                  {t('bidfrete.aceite_aprovacao.intro_ola', 'Olá,')}{' '}
                  <strong>{nomeFornecedor}</strong>.
                </span>
              </p>
              <p className="bf-aceite-aprovacao-aprovada">
                <CheckCircle size={16} weight="duotone" className="bf-aceite-aprovacao-icone-linha bf-aceite-aprovacao-icone-aprovacao" aria-hidden />
                <span>
                  {t('bidfrete.aceite_aprovacao.proposta_aprovada_prefixo', 'Sua proposta')}{' '}
                  <strong>{numeroCotacao}</strong>{' '}
                  {t('bidfrete.aceite_aprovacao.proposta_aprovada_sufixo', 'foi aprovada.')}
                </span>
              </p>
              <p className="bf-aceite-aprovacao-valor">
                <CurrencyDollar size={18} weight="duotone" className="bf-aceite-aprovacao-icone-linha" aria-hidden />
                <span>
                  <strong>{t('bidfrete.aceite_aprovacao.valor_aprovado_rotulo', 'Valor aprovado')}</strong>:{' '}
                  <strong>{valorFmt}</strong>
                </span>
              </p>
            </div>
            {erro ? <p className="bf-aceite-aprovacao-erro">{erro}</p> : null}
            <label className="bf-aceite-aprovacao-li-aceito">
              <input
                type="checkbox"
                checked={aceiteCondicoes}
                onChange={(e) => setAceiteCondicoes(e.target.checked)}
                disabled={confirmando}
              />
              <span>
                {t('bidfrete.aceite_aprovacao.li_aceito_prefixo', 'Li e aceito o')}{' '}
                <a href={rotaContratoFechamento} target="_blank" rel="noreferrer">
                  {t('bidfrete.aceite_aprovacao.li_aceito_link', 'contrato de fechamento')}
                </a>.
              </span>
            </label>
            <BotaoGlobal
              variante="primario"
              disabled={confirmando || !dados?.pode_confirmar || !aceiteCondicoes}
              onClick={() => void confirmar()}
            >
              {confirmando
                ? t('bidfrete.aceite_aprovacao.confirmando', 'Confirmando…')
                : t('bidfrete.aceite_aprovacao.botao', 'Recebi e estou de acordo')}
            </BotaoGlobal>
            <div className="bf-aceite-aprovacao-taxa" role="note">
              <HandCoins size={20} weight="duotone" className="bf-aceite-aprovacao-taxa-icone" aria-hidden />
              <div>
                <p className="bf-aceite-aprovacao-taxa-titulo">
                  {t('bidfrete.aceite_aprovacao.taxa_titulo', 'Taxa de fechamento')}{' '}
                  <strong>{ROTULO_TAXA_FECHAMENTO_FRETE_USD}</strong>
                </p>
                <p className="bf-aceite-aprovacao-taxa-pagador">
                  <strong>{t('bidfrete.aceite_aprovacao.taxa_paga_por', 'Paga por')}</strong>:{' '}
                  {taxaPagaPelaPropriaEmpresa ? (
                    <strong className="bf-aceite-aprovacao-taxa-pagador-empresa">
                      {t('bidfrete.aceite_aprovacao.taxa_paga_sua_empresa', 'pela sua empresa')}
                    </strong>
                  ) : (
                    <strong>{rotuloEmpresaPagadoraTaxaFechamentoPlataformaGravity(pagadorTaxa)}</strong>
                  )}
                </p>
              </div>
            </div>
          </div>
        }
      />
      <style>{ACEITE_APROVACAO_PUBLICO_STYLES}</style>
    </ShellPaginaRespostaCotacao>
  )
}

const ACEITE_APROVACAO_PUBLICO_STYLES = `
  .bf-aceite-aprovacao-acoes {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    width: 100%;
    text-align: left;
  }
  .bf-aceite-aprovacao-painel {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(148, 163, 184, 0.18);
  }
  .bf-aceite-aprovacao-intro,
  .bf-aceite-aprovacao-aprovada,
  .bf-aceite-aprovacao-valor {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    margin: 0;
    line-height: 1.5;
    color: var(--text-secondary, #cbd5e1);
  }
  .bf-aceite-aprovacao-intro,
  .bf-aceite-aprovacao-aprovada {
    font-size: 0.8125rem;
  }
  .bf-aceite-aprovacao-intro strong,
  .bf-aceite-aprovacao-aprovada strong {
    font-weight: 700;
    color: #f1f5f9;
  }
  .bf-aceite-aprovacao-valor {
    font-size: 0.875rem;
    color: var(--text-primary, #f1f5f9);
  }
  .bf-aceite-aprovacao-valor strong {
    font-weight: 700;
    color: #e0e7ff;
  }
  .bf-aceite-aprovacao-li-aceito {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin: 0;
    padding: 0.625rem 0.75rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    user-select: none;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--text-secondary, #cbd5e1);
  }
  .bf-aceite-aprovacao-li-aceito input {
    margin-top: 0.15rem;
    accent-color: #818cf8;
    cursor: pointer;
    flex-shrink: 0;
  }
  .bf-aceite-aprovacao-li-aceito a {
    color: #818cf8;
    font-weight: 600;
    text-decoration: underline;
  }
  .bf-aceite-aprovacao-icone-linha {
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #818cf8;
  }
  .bf-aceite-aprovacao-icone-aprovacao {
    color: #34d399;
  }
  .bf-aceite-aprovacao-erro {
    margin: 0;
    font-size: 0.8125rem;
    color: #fca5a5;
  }
  .bf-aceite-aprovacao-taxa {
    display: flex;
    gap: 0.65rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.28);
  }
  .bf-aceite-aprovacao-taxa-icone {
    flex-shrink: 0;
    color: #f59e0b;
    margin-top: 0.1rem;
  }
  .bf-aceite-aprovacao-taxa-titulo,
  .bf-aceite-aprovacao-taxa-pagador {
    margin: 0 0 0.35rem;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: #fcd34d;
  }
  .bf-aceite-aprovacao-taxa-pagador:last-child {
    margin-bottom: 0;
  }
  .bf-aceite-aprovacao-taxa-titulo strong,
  .bf-aceite-aprovacao-taxa-pagador strong {
    color: #fef3c7;
  }
  .bf-aceite-aprovacao-taxa-pagador-empresa {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`
