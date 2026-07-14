/**
 * Passo 4 (BID Frete) — revisão DE/PARA antes de abrir Nova Cotação nos passos Fornecedores/Resumo.
 */
import { useMemo } from 'react'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE,
  converterLeituraParaCotacaoBidFreteInternacional,
  type LeituraParaConversaoCotacaoBidFrete,
} from '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'
import type { DetalheMapeamentoCampoSmartReadCotacaoBidFrete } from '../../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import './painel-revisao-prefill-cotacao-bid-frete-smart-read.css'

type Props = {
  leitura: LeituraParaConversaoCotacaoBidFrete
  onContinuar: () => void
  continuando?: boolean
}

function rotuloStatus(status: DetalheMapeamentoCampoSmartReadCotacaoBidFrete['status_mapeamento']): string {
  switch (status) {
    case 'mapeado': return 'Extraído'
    case 'sugerido': return 'Sugerido'
    case 'pendente': return 'Pendente'
    case 'rejeitado': return 'Rejeitado'
    default: return '—'
  }
}

function formatarValor(valor: unknown): string {
  if (valor == null || valor === '') return '—'
  return String(valor)
}

export function PainelRevisaoPrefillCotacaoBidFreteSmartRead({
  leitura,
  onContinuar,
  continuando = false,
}: Props) {
  const conversao = useMemo(
    () => converterLeituraParaCotacaoBidFreteInternacional(leitura),
    [leitura],
  )

  const linhasResumo = useMemo(() => {
    const vistos = new Set<string>()
    const linhas: Array<{
      campo: string
      rotulo: string
      valor: string
      status: DetalheMapeamentoCampoSmartReadCotacaoBidFrete['status_mapeamento']
    }> = []

    for (const [campo, valor] of Object.entries(conversao.prefill)) {
      if (valor == null || valor === '') continue
      vistos.add(campo)
      const detalhe = conversao.detalhe_mapeamento.campos.find((c) => c.campo_destino === campo)
      linhas.push({
        campo,
        rotulo: ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE[campo] ?? campo,
        valor: formatarValor(valor),
        status: detalhe?.status_mapeamento ?? 'mapeado',
      })
    }

    for (const campo of conversao.campos_faltantes) {
      const chave = Object.entries(ROTULOS_CAMPO_PREFILL_COTACAO_BID_FRETE).find(([, r]) => r === campo)?.[0]
      if (chave && vistos.has(chave)) continue
      linhas.push({
        campo: chave ?? campo,
        rotulo: campo,
        valor: '—',
        status: 'pendente',
      })
    }

    return linhas
  }, [conversao])

  return (
    <div className="sr-prefill-bid-revisao">
      <div className="sr-prefill-bid-revisao-cabecalho">
        <Sparkle weight="duotone" size={20} aria-hidden />
        <div>
          <h3 className="sr-prefill-bid-revisao-titulo">Dados para nova cotação de frete</h3>
          <p className="sr-prefill-bid-revisao-subtitulo">
            Revise o que será levado ao BID Frete. Campos <strong>sugeridos</strong> podem ser ajustados
            depois; os passos Modal, Origem/Destino e Carga/Incoterm serão pulados.
          </p>
        </div>
      </div>

      <div className="sr-prefill-bid-revisao-tabela" role="table" aria-label="Mapeamento leitura para cotação">
        <div className="sr-prefill-bid-revisao-linha sr-prefill-bid-revisao-linha--cabecalho" role="row">
          <span role="columnheader">Campo da cotação</span>
          <span role="columnheader">Valor</span>
          <span role="columnheader">Origem</span>
        </div>
        {linhasResumo.map((linha) => (
          <div key={linha.campo} className="sr-prefill-bid-revisao-linha" role="row">
            <span className="sr-prefill-bid-revisao-campo" role="cell">{linha.rotulo}</span>
            <span className="sr-prefill-bid-revisao-valor" role="cell">{linha.valor}</span>
            <span
              className={`sr-prefill-bid-revisao-status sr-prefill-bid-revisao-status--${linha.status}`}
              role="cell"
            >
              {rotuloStatus(linha.status)}
            </span>
          </div>
        ))}
      </div>

      {conversao.campos_faltantes.length > 0 && (
        <p className="sr-prefill-bid-revisao-aviso">
          {conversao.iniciar_no_passo_fornecedores
            ? `Alguns campos opcionais não vieram do documento (${conversao.campos_faltantes.join(', ')}).`
            : `Campos obrigatórios ausentes (${conversao.campos_faltantes.join(', ')}). O wizard abrirá nos passos iniciais para você completar antes de fornecedores.`}
        </p>
      )}

      <div className="sr-prefill-bid-revisao-acoes">
        <BotaoGlobal
          variante="primario"
          tamanho="padrao"
          iconeDireita={<ArrowRight weight="bold" />}
          onClick={onContinuar}
          disabled={continuando}
        >
          Continuar para cotação
        </BotaoGlobal>
      </div>
    </div>
  )
}

export { converterLeituraParaCotacaoBidFreteInternacional }
