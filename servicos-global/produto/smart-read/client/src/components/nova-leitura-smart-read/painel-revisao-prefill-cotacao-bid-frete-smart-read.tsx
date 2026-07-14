/**

 * Passo 4 (BID Frete) — revisão editável antes de abrir Nova Cotação.

 */

import { lazy, Suspense, useCallback, useMemo, useState } from 'react'

import { ArrowRight, Sparkle } from '@phosphor-icons/react'

import { BotaoGlobal } from '@nucleo/botao-global'

import {

  converterLeituraParaCotacaoBidFreteInternacional,

  type LeituraParaConversaoCotacaoBidFrete,

} from '../../../../shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'

import type {

  PrefillFormularioCotacaoBidFreteSmartRead,

} from '../../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

import type { MetaPrefillCotacaoBidFreteSmartRead } from '../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/formulario-editavel-prefill-cotacao-bid-frete-smart-read.js'

import './painel-revisao-prefill-cotacao-bid-frete-smart-read.css'

import '../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/prefill-cotacao-bid-frete-smart-read.css'



const FormularioEditavelPrefillCotacaoBidFreteSmartRead = lazy(

  () => import('../../../../../bid-frete-internacional/client/src/components/prefill-smart-read/formulario-editavel-prefill-cotacao-bid-frete-smart-read.js'),

)



export type PayloadContinuarPrefillCotacaoBidFreteSmartRead = {

  prefill: PrefillFormularioCotacaoBidFreteSmartRead

  detalhe_mapeamento: ReturnType<typeof converterLeituraParaCotacaoBidFreteInternacional>['detalhe_mapeamento']

  campos_faltantes: string[]

  passo_inicial_tipo: MetaPrefillCotacaoBidFreteSmartRead['passo_inicial_tipo']

  iniciar_no_passo_fornecedores: boolean

}



type Props = {

  leitura: LeituraParaConversaoCotacaoBidFrete

  onContinuar: (payload: PayloadContinuarPrefillCotacaoBidFreteSmartRead) => void

  continuando?: boolean

}



function mensagemAviso(meta: MetaPrefillCotacaoBidFreteSmartRead): string | null {

  if (meta.campos_faltantes.length === 0) return null

  if (meta.iniciar_no_passo_fornecedores) {

    return `Alguns campos opcionais não vieram do documento (${meta.campos_faltantes.join(', ')}).`

  }

  if (meta.passo_inicial_tipo === 'armazenagem') {

    return `Com armazenagem LCL ativa, o wizard abrirá no passo Armazenagem para cadastrar os armazéns antes de fornecedores.`

  }

  return `Campos obrigatórios ausentes (${meta.campos_faltantes.join(', ')}). O wizard abrirá no passo "${meta.passo_inicial_tipo}" para você completar antes de fornecedores.`

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



  const [prefill, setPrefill] = useState(conversao.prefill)

  const [meta, setMeta] = useState<MetaPrefillCotacaoBidFreteSmartRead>({

    campos_faltantes: conversao.campos_faltantes,

    passo_inicial_tipo: conversao.passo_inicial_tipo,

    iniciar_no_passo_fornecedores: conversao.iniciar_no_passo_fornecedores,

  })



  const handleChange = useCallback(

    (novoPrefill: PrefillFormularioCotacaoBidFreteSmartRead, novoMeta: MetaPrefillCotacaoBidFreteSmartRead) => {

      setPrefill(novoPrefill)

      setMeta(novoMeta)

    },

    [],

  )



  const aviso = mensagemAviso(meta)



  return (

    <div className="sr-prefill-bid-revisao">

      <div className="sr-prefill-bid-revisao-cabecalho">

        <Sparkle weight="duotone" size={20} aria-hidden />

        <div>

          <h3 className="sr-prefill-bid-revisao-titulo">Dados para nova cotação de frete</h3>

          <p className="sr-prefill-bid-revisao-subtitulo">

            Ajuste os campos com os mesmos controles do BID Frete. Campos <strong>LCL</strong> exibem

            armazenagem; se escolher <strong>Sim</strong>, o wizard abrirá no passo Armazenagem.

          </p>

        </div>

      </div>



      <Suspense fallback={<p className="sr-prefill-bid-revisao-subtitulo">Carregando formulário…</p>}>

        <FormularioEditavelPrefillCotacaoBidFreteSmartRead

          prefill={prefill}

          detalheMapeamento={conversao.detalhe_mapeamento}

          onChange={handleChange}

        />

      </Suspense>



      {aviso && (

        <p className="sr-prefill-bid-revisao-aviso">{aviso}</p>

      )}



      <div className="sr-prefill-bid-revisao-acoes">

        <BotaoGlobal

          variante="primario"

          tamanho="padrao"

          iconeDireita={<ArrowRight weight="bold" />}

          onClick={() => onContinuar({

            prefill,

            detalhe_mapeamento: conversao.detalhe_mapeamento,

            campos_faltantes: meta.campos_faltantes,

            passo_inicial_tipo: meta.passo_inicial_tipo,

            iniciar_no_passo_fornecedores: meta.iniciar_no_passo_fornecedores,

          })}

          disabled={continuando}

        >

          Continuar para cotação

        </BotaoGlobal>

      </div>

    </div>

  )

}



export { converterLeituraParaCotacaoBidFreteInternacional }


