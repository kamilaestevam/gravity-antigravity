/**
 * AreaConferenciaNovaLeituraSmartRead — passo 3: revisão dos dados extraídos
 */

import { CheckCircle } from '@phosphor-icons/react'
import type { ArquivoLocalNovaLeitura } from '../../shared/tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal } from '../../shared/tipo-arquivo-nova-leitura-smart-read'

type Props = {
  arquivos: ArquivoLocalNovaLeitura[]
}

function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false
  if (Array.isArray(valor)) return valor.length > 0
  if (typeof valor === 'object') return Object.values(valor as Record<string, unknown>).some(valorPreenchido)
  return true
}

function formatarValor(valor: unknown): string {
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  return String(valor)
}

export function AreaConferenciaNovaLeituraSmartRead({ arquivos }: Props) {
  const arquivosCompletos = arquivos.filter((item) => item.status_arquivo_local === 'completo' && item.leitura)

  return (
    <div className="sr-wizard-principal sr-wizard-principal--conferencia">
      <header className="sr-wizard-conferencia-cabecalho">
        <CheckCircle size={22} weight="duotone" />
        <div>
          <h2>Conferência</h2>
          <p>Corrija, compare e confirme a extração antes de finalizar.</p>
        </div>
      </header>

      <div className="sr-wizard-conferencia-lista">
        {arquivosCompletos.map((item) => {
          const arquivoApi = item.leitura?.arquivos[0]
          const documentos = extrairDocumentosArquivoLocal(item)

          return (
            <section key={item.id_arquivo_local} className="sr-wizard-conferencia-arquivo">
              <h3>{item.arquivo.name}</h3>
              {(arquivoApi?.resultado_extracao ?? []).map((resultado, indice) => {
                const docMeta = documentos[indice]
                const campos = Object.entries(resultado.dados).filter(
                  ([, valor]) => valorPreenchido(valor) && typeof valor !== 'object',
                )

                return (
                  <article key={`${item.id_arquivo_local}-${indice}`} className="sr-wizard-conferencia-doc">
                    <header>
                      <span className="sr-wizard-card-tag-tipo">
                        {docMeta?.tipo_documento ?? resultado.tipo_documento ?? 'Documento'}
                      </span>
                    </header>
                    {campos.length === 0 ? (
                      <p className="sr-wizard-conferencia-vazio">Nenhum campo escalar extraído para revisão.</p>
                    ) : (
                      <div className="sr-wizard-conferencia-campos">
                        {campos.map(([chave, valor]) => (
                          <div key={chave} className="sr-wizard-conferencia-campo">
                            <span>{chave}</span>
                            <strong>{formatarValor(valor)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
