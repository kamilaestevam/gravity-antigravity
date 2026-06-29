/**
 * ClassificacaoProdutoChecklistSmartRead — bloco NCM por linha na seção itens fiscais
 */

import type { LinhaClassificacaoProdutoChecklist } from '../../../../shared/montar-classificacao-produto-checklist-smart-read'
import { DISCLAIMER_CLASSIFICACAO_FISCAL } from '../../../../shared/texto-analise-riscos-leitura-smart-read'

type Props = {
  linhas: LinhaClassificacaoProdutoChecklist[]
  onVerRisco?: (riscoId: string) => void
}

function classeVeredito(veredito: LinhaClassificacaoProdutoChecklist['veredito']): string {
  return `sr-conf-chk-status sr-conf-chk-status--${veredito === 'conforme' ? 'verde' : veredito === 'atencao' ? 'amarelo' : veredito === 'falha' ? 'vermelho' : veredito === 'na' ? 'na' : 'pendente'}`
}

function classeComparacaoNcm(comparacao: LinhaClassificacaoProdutoChecklist['comparacao_ncm']): string {
  switch (comparacao) {
    case 'bate':
      return 'sr-conf-classificacao-ncm-comp--bate'
    case 'diverge':
      return 'sr-conf-classificacao-ncm-comp--diverge'
    case 'sem_declarado':
      return 'sr-conf-classificacao-ncm-comp--sem-declarado'
    default:
      return 'sr-conf-classificacao-ncm-comp--aguardando'
  }
}

export function ClassificacaoProdutoChecklistSmartRead({ linhas, onVerRisco }: Props) {
  if (linhas.length === 0) return null

  return (
    <div className="sr-conf-classificacao-produto" aria-label="Classificação do produto">
      <h4 className="sr-conf-classificacao-produto-titulo">Classificação do produto</h4>
      <p className="sr-conf-classificacao-produto-subtitulo">
        NCM declarado no documento × NCM sugerido pela IA (descrição + Cadastros).
      </p>

      <div className="sr-conf-classificacao-produto-lista">
        {linhas.map((linha) => (
          <article
            key={`class-prod-${linha.indice}`}
            className={`sr-conf-classificacao-produto-card sr-conf-classificacao-produto-card--${linha.veredito}`}
          >
            <header className="sr-conf-classificacao-produto-card-topo">
              <span className="sr-conf-classificacao-produto-linha">Linha {linha.indice + 1}</span>
              <span className={classeVeredito(linha.veredito)}>{linha.rotulo_veredito}</span>
            </header>

            <dl className="sr-conf-classificacao-produto-campos">
              <div className="sr-conf-classificacao-produto-campo">
                <dt>Descrição</dt>
                <dd>{linha.descricao?.trim() || '—'}</dd>
              </div>

              <div className="sr-conf-classificacao-produto-ncm-par">
                <div className="sr-conf-classificacao-produto-campo">
                  <dt>NCM declarado</dt>
                  <dd>
                    {linha.ncm_declarado?.trim() ? (
                      <strong className="sr-conf-classificacao-ncm-codigo">{linha.ncm_declarado}</strong>
                    ) : (
                      <span className="sr-conf-classificacao-ncm-ausente">Não informado no documento</span>
                    )}
                  </dd>
                </div>

                <div className="sr-conf-classificacao-produto-campo sr-conf-classificacao-produto-campo--destaque">
                  <dt>NCM sugerido</dt>
                  <dd>
                    {linha.ncm_sugerido ? (
                      <>
                        <strong className="sr-conf-classificacao-ncm-codigo">{linha.ncm_sugerido}</strong>
                        {linha.rotulo_comparacao_ncm ? (
                          <span
                            className={`sr-conf-classificacao-ncm-comp ${classeComparacaoNcm(linha.comparacao_ncm)}`}
                          >
                            {linha.rotulo_comparacao_ncm}
                            {linha.comparacao_ncm === 'diverge' && linha.ncm_declarado
                              ? ` (${linha.ncm_declarado} ≠ ${linha.ncm_sugerido})`
                              : ''}
                          </span>
                        ) : null}
                        {linha.descricao_ncm_oficial ? (
                          <span className="sr-conf-classificacao-produto-ncm-oficial">
                            Tabela TI: {linha.descricao_ncm_oficial}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="sr-conf-classificacao-ncm-ausente">
                        Aguardando análise fiscal (Passo 3)
                      </span>
                    )}
                  </dd>
                </div>
              </div>

              <div className="sr-conf-classificacao-produto-campo sr-conf-classificacao-produto-campo--analise">
                <dt>Justificativa técnica</dt>
                <dd>{linha.justificativa_tecnica?.trim() || '—'}</dd>
              </div>
            </dl>

            {linha.risco_id && onVerRisco ? (
              <button
                type="button"
                className="sr-conf-chk-ver-risco"
                onClick={() => onVerRisco(linha.risco_id!)}
              >
                Ver risco completo
              </button>
            ) : null}
          </article>
        ))}
      </div>

      <p className="sr-conf-classificacao-produto-disclaimer">{DISCLAIMER_CLASSIFICACAO_FISCAL}</p>
    </div>
  )
}
