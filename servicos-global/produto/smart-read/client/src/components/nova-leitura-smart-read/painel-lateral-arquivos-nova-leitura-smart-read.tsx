/**

 * PainelLateralArquivosNovaLeituraSmartRead — sidebar com lista de arquivos e ações

 */



import { PencilSimple } from '@phosphor-icons/react'

import { BotaoGlobal } from '@nucleo/botao-global'

import { CardArquivoNovaLeituraSmartRead } from './card-arquivo-nova-leitura-smart-read'

import {
  contarDocumentosIdentificadosLote,
  LIMITE_DOCUMENTOS_NOVA_LEITURA,
} from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'



type Props = {

  passo: number

  nomeLeitura: string

  arquivos: ArquivoLocalNovaLeitura[]

  enviando: boolean

  podeContinuar: boolean

  onEditarNome?: () => void

  onRemoverArquivo?: (id: string) => void

  onAlternarExpandido: (id: string) => void

  onVisualizarArquivo: (id: string) => void

  onVisualizarDocumento: (idArquivo: string, indice: number) => void

  onEnviar?: () => void

  onVoltar?: () => void

  onContinuar?: () => void

}



export function PainelLateralArquivosNovaLeituraSmartRead({

  passo,

  nomeLeitura,

  arquivos,

  enviando,

  podeContinuar,

  onEditarNome,

  onRemoverArquivo,

  onAlternarExpandido,

  onVisualizarArquivo,

  onVisualizarDocumento,

  onEnviar,

  onVoltar,

  onContinuar,

}: Props) {

  const totalDocumentos = contarDocumentosIdentificadosLote(arquivos)



  return (

    <aside className="sr-wizard-lateral">

      <div className="sr-wizard-lateral-topo">

        <span className="sr-wizard-lateral-plano">Starter</span>

        <span className="sr-wizard-lateral-contador">

          Documentos {totalDocumentos}/{LIMITE_DOCUMENTOS_NOVA_LEITURA}

        </span>

      </div>



      <div className="sr-wizard-lateral-titulo">

        <h3>{nomeLeitura}</h3>

        {onEditarNome && passo === 1 && (

          <button type="button" className="sr-wizard-lateral-editar" onClick={onEditarNome} aria-label="Editar nome da leitura">

            <PencilSimple size={14} />

          </button>

        )}

      </div>



      <div className="sr-wizard-lateral-secao">

        <span className="sr-wizard-lateral-secao-titulo">Arquivos enviados</span>

        <span className="sr-wizard-lateral-badge">{arquivos.length}</span>

      </div>



      <div className="sr-wizard-lateral-lista">

        {arquivos.map((item) => (

          <CardArquivoNovaLeituraSmartRead

            key={item.id_arquivo_local}

            item={item}

            passo={passo}

            onRemover={passo === 1 && onRemoverArquivo ? () => onRemoverArquivo(item.id_arquivo_local) : undefined}

            onAlternarExpandido={() => onAlternarExpandido(item.id_arquivo_local)}

            onVisualizarArquivo={() => onVisualizarArquivo(item.id_arquivo_local)}

            onVisualizarDocumento={(indice) => onVisualizarDocumento(item.id_arquivo_local, indice)}

          />

        ))}

      </div>



      <div className="sr-wizard-lateral-rodape">

        {passo === 1 && onEnviar && (

          <div className="sr-wizard-btn-enviar">
            <BotaoGlobal
              variante="primario"
              tamanho="padrao"
              disabled={arquivos.length === 0 || enviando}
              carregando={enviando}
              onClick={onEnviar}
            >
              Enviar
            </BotaoGlobal>
          </div>

        )}

        {passo >= 2 && (

          <div className="sr-wizard-lateral-botoes-duplos">

            {onVoltar && (

              <BotaoGlobal variante="secundario" tamanho="padrao" onClick={onVoltar}>

                Voltar

              </BotaoGlobal>

            )}

            {onContinuar && (

              <BotaoGlobal

                variante="primario"

                tamanho="padrao"

                disabled={!podeContinuar}

                onClick={onContinuar}

              >

                Continuar

              </BotaoGlobal>

            )}

          </div>

        )}

      </div>

    </aside>

  )

}


