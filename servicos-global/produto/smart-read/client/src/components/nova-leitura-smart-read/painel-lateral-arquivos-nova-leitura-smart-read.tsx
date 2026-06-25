/**
 * PainelLateralArquivosNovaLeituraSmartRead — sidebar com lista de arquivos e ações
 */

import { BotaoGlobal } from '@nucleo/botao-global'
import { CardArquivoNovaLeituraSmartRead } from './card-arquivo-nova-leitura-smart-read'
import { EdicaoNomeLeituraNovaLeituraSmartRead } from './edicao-nome-leitura-nova-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'

type Props = {
  passo: number
  nomeLeitura: string
  arquivos: ArquivoLocalNovaLeitura[]
  enviando: boolean
  podeContinuar: boolean
  onConfirmarNome: (nome: string) => void | Promise<void>
  onRemoverArquivo?: (id: string) => void
  onAlternarExpandido: (id: string) => void
  onVisualizarArquivo: (id: string) => void
  onVisualizarDocumento: (idArquivo: string, indice: number) => void
  onEnviar?: () => void
  onCancelar?: () => void
  onVoltar?: () => void
  onContinuar?: () => void
}

export function PainelLateralArquivosNovaLeituraSmartRead({
  passo,
  nomeLeitura,
  arquivos,
  enviando,
  podeContinuar,
  onConfirmarNome,
  onRemoverArquivo,
  onAlternarExpandido,
  onVisualizarArquivo,
  onVisualizarDocumento,
  onEnviar,
  onCancelar,
  onVoltar,
  onContinuar,
}: Props) {
  return (
    <aside className="sr-wizard-lateral">
      <EdicaoNomeLeituraNovaLeituraSmartRead
        nomeLeitura={nomeLeitura}
        onConfirmar={onConfirmarNome}
      />

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
          <div className="sr-wizard-lateral-botoes-duplos">
            {onCancelar && (
              <BotaoGlobal variante="secundario" tamanho="padrao" onClick={onCancelar}>
                Cancelar
              </BotaoGlobal>
            )}

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
