import type { GTColuna, GTMapaColunasFilho } from '@nucleo/tabela-virtual-global'
import { PillStatusLeitura } from '../components/pill-status-leitura-smart-read'
import {
  formatarDataLeitura,
  formatarPercentualLeitura,
} from './formatacao-leitura-smart-read'
import type { DocumentoLeituraLista } from './montar-documentos-leitura-smart-read'
import type { TransacaoLeitura } from './schemas'

export const COLUNAS_LISTA_LEITURA_SMART_READ: GTColuna<TransacaoLeitura>[] = [
  {
    key: 'nome_leitura',
    label: 'Nome da leitura',
    naoOcultavel: true,
    sortavel: false,
    render: (_valor, item) => (
      <span className="sr-nome-celula">
        {item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura}
      </span>
    ),
    findDisplay: (item) => item.nome_leitura ?? item.nome_arquivo ?? item.id_leitura,
  },
  {
    key: 'status_leitura',
    label: 'Status',
    sortavel: false,
    render: (_valor, item) => <PillStatusLeitura status={item.status_leitura} />,
    findDisplay: (item) => item.status_leitura,
  },
  {
    key: 'total_arquivos',
    label: 'Arquivos',
    tipo: 'numero',
    align: 'center',
    sortavel: false,
    render: (_valor, item) => item.total_arquivos,
  },
  {
    key: 'media_acertos',
    label: 'Média de acertos',
    align: 'center',
    sortavel: false,
    render: (_valor, item) => formatarPercentualLeitura(item.media_acertos),
  },
  {
    key: 'data_envio',
    label: 'Data de envio',
    sortavel: false,
    render: (_valor, item) => formatarDataLeitura(item.data_envio),
    findDisplay: (item) => formatarDataLeitura(item.data_envio),
  },
]

export const MAPA_COLUNAS_DOCUMENTO_LEITURA: Record<string, GTMapaColunasFilho<DocumentoLeituraLista>> = {
  nome_leitura: {
    render: (item) => <span className="sr-nome-celula sr-nome-celula--filho">{item.nome_documento}</span>,
  },
  status_leitura: {
    render: (item) => <PillStatusLeitura status={item.status_documento} />,
  },
  total_arquivos: {
    render: () => '—',
  },
  media_acertos: {
    render: (item) => formatarPercentualLeitura(item.media_acertos),
  },
  data_envio: {
    render: (item) => formatarDataLeitura(item.data_envio),
  },
}
