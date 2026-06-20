import { PillStatusLeitura } from './pill-status-leitura-smart-read'
import { formatarDataLeitura } from '../shared/formatacao-leitura-smart-read'
import type { TransacaoLeitura } from '../shared/schemas'

type Props = {
  recentes: TransacaoLeitura[]
}

export function ListaRecentesInsightsLeituraSmartRead({ recentes }: Props) {
  return (
    <section className="sr-insights-painel" aria-labelledby="sr-insights-recentes-titulo">
      <h2 id="sr-insights-recentes-titulo" className="sr-insights-painel-titulo">
        Leituras recentes
      </h2>
      <p className="sr-insights-painel-subtitulo">Últimos envios na amostra carregada</p>

      {recentes.length === 0 ? (
        <p className="sr-insights-vazio">Nenhuma leitura recente.</p>
      ) : (
        <ul className="sr-insights-recentes-lista">
          {recentes.map((item) => (
            <li key={item.id_leitura} className="sr-insights-recentes-item">
              <div>
                <p className="sr-insights-recentes-nome">
                  {item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura}
                </p>
                <p className="sr-insights-recentes-meta">
                  {formatarDataLeitura(item.data_envio)} · {item.origem_leitura} ·{' '}
                  {item.total_arquivos} arquivo(s)
                </p>
              </div>
              <PillStatusLeitura status={item.status_leitura} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
