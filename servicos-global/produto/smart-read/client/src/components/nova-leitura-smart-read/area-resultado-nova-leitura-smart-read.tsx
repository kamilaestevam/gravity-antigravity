/**
 * AreaResultadoNovaLeituraSmartRead — passo 4: resultado final
 */

import { DownloadSimple, FileText } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal } from '../../shared/tipo-arquivo-nova-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
}

function baixarJson(nome: string, dados: unknown) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${nome.replace(/\.[^.]+$/, '')}-leitura.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function AreaResultadoNovaLeituraSmartRead({ arquivos }: Props) {
  const arquivosCompletos = arquivos.filter((item) => item.status_arquivo_local === 'completo' && item.leitura)

  return (
    <div className="sr-wizard-principal sr-wizard-principal--resultado">
      <header className="sr-wizard-resultado-cabecalho">
        <FileText size={28} weight="duotone" />
        <div>
          <h2>Resultado das leituras</h2>
          <p>Baixe suas leituras no formato desejado.</p>
        </div>
      </header>

      <div className="sr-wizard-resultado-lista">
        {arquivosCompletos.map((item) => {
          const documentos = extrairDocumentosArquivoLocal(item)
          const extracao = item.leitura?.arquivos[0]?.resultado_extracao ?? []

          return (
            <article key={item.id_arquivo_local} className="sr-wizard-resultado-item">
              <div className="sr-wizard-resultado-item-info">
                <strong>{item.arquivo.name}</strong>
                <span>{documentos.length} documento(s) identificado(s)</span>
              </div>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<DownloadSimple size={14} />}
                onClick={() => baixarJson(item.arquivo.name, extracao)}
              >
                Baixar JSON
              </BotaoGlobal>
            </article>
          )
        })}
      </div>
    </div>
  )
}
