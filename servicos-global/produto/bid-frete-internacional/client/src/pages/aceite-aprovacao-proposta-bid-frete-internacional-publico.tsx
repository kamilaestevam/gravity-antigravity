/**
 * Página pública — aceite "Recebi e estou de acordo" (ganhador, sem login).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ConteudoCarregandoBidFreteInternacional } from '../../shared/pagina-carregando-bid-frete-internacional'
import {
  confirmarAceiteAprovacaoPropostaBidFreteInternacionalPublico,
  getAceiteAprovacaoPropostaBidFreteInternacionalPublico,
} from '../../shared/api'
import { formatarMoedaBidFrete } from '../../shared/exibir-taxas-proposta-bid-frete-internacional'
import {
  EstadoMensagemRespostaCotacao,
  ShellPaginaRespostaCotacao,
} from '../../shared/formulario-resposta-cotacao-bid-frete-internacional'

type PageState = 'loading' | 'invalid' | 'ready' | 'success' | 'expired'

export default function AceiteAprovacaoPropostaPublico() {
  const { token_aceite_aprovacao_proposta_bid_frete_internacional: token } = useParams<{
    token_aceite_aprovacao_proposta_bid_frete_internacional: string
  }>()
  const { t } = useTranslation()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [confirmando, setConfirmando] = useState(false)
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
    setConfirmando(true)
    setErro(null)
    try {
      await confirmarAceiteAprovacaoPropostaBidFreteInternacionalPublico(token)
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

  return (
    <ShellPaginaRespostaCotacao modo="publico" layoutPainel="estado">
      <EstadoMensagemRespostaCotacao
        variante="sucesso"
        titulo={t('bidfrete.aceite_aprovacao.titulo', 'Confirmar recebimento da aprovação')}
        descricao={t(
          'bidfrete.aceite_aprovacao.intro',
          'Olá, {{fornecedor}}. Sua proposta na cotação {{cotacao}} foi aprovada.',
          {
            fornecedor: proposta?.nome_fornecedor_bid_frete_internacional ?? '',
            cotacao: proposta?.numero_cotacao_bid_frete_internacional ?? '',
          },
        )}
        descricaoExtra={t(
          'bidfrete.aceite_aprovacao.instrucao_valor',
          'Valor aprovado: {{valor}}. Clique abaixo para confirmar que recebeu e está de acordo.',
          { valor: valorFmt },
        )}
        acao={
          <div className="brc-mensagem-acoes">
            {erro ? <p className="brc-estado-texto">{erro}</p> : null}
            <BotaoGlobal
              variante="primario"
              disabled={confirmando || !dados?.pode_confirmar}
              onClick={() => void confirmar()}
            >
              {confirmando
                ? t('bidfrete.aceite_aprovacao.confirmando', 'Confirmando…')
                : t('bidfrete.aceite_aprovacao.botao', 'Recebi e estou de acordo')}
            </BotaoGlobal>
          </div>
        }
      />
    </ShellPaginaRespostaCotacao>
  )
}
