import type { DocPassoVisual } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'

const URL_VISAO_FORNECEDOR_BID_FRETE =
  'https://usegravity.com.br/bid-frete/visao-fornecedor-bid-frete-internacional/dashboard'

/** §09 — portal do agente de carga (fornecedor logado e link público). */
export const PASSOS_MANUAL_BID_FRETE_VISAO_FORNECEDOR: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'A **Visão do fornecedor** é o ambiente dedicado ao **agente de carga** convidado pelo workspace. Nele o fornecedor acompanha **disparos recebidos**, envia **propostas**, consulta **histórico**, gerencia **tabelas de valor** e monitora **desempenho** e **classificação**.',
      'É independente da visão **operacional** (Insights, Lista, Painel da Cotação): o fornecedor enxerga apenas as oportunidades direcionadas a ele, sem acesso aos dados internos do importador.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Como acessar',
    tituloCurto: 'Como acessar',
    paragrafos: [
      'O fornecedor acessa com a **conta Clerk** vinculada ao cadastro `fornecedor_bid_frete_internacional`. A URL base é **' + URL_VISAO_FORNECEDOR_BID_FRETE + '**.',
      'O menu lateral exibe **Cotações pendentes**, **Minhas propostas**, **Tabelas de valor**, **Meu desempenho** e **Configurações** — navegação exclusiva desta visão.',
      'Convites por e-mail podem incluir **link com token** para responder sem login; esse fluxo é detalhado em **Resposta pública**.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Cotações pendentes',
    tituloCurto: 'Cotações pendentes',
    paragrafos: [
      'Lista os **disparos aguardando proposta**: número da cotação, rota, modal, prazo de resposta e status do funil.',
      'Abra uma linha para **responder** ou use atalhos da tabela/kanban. Filtros, painéis e KPIs seguem o mesmo padrão visual da Lista operacional, adaptados ao escopo do fornecedor.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Minhas propostas',
    tituloCurto: 'Minhas propostas',
    paragrafos: [
      'Histórico de **propostas enviadas**: valores, moeda, data de envio e situação (**em análise**, **aprovada**, **reprovada**).',
      'Use esta aba para revisar negociações encerradas e acompanhar o retorno do workspace importador.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Responder cotação',
    tituloCurto: 'Responder cotação',
    paragrafos: [
      'Formulário de **resposta ao disparo**: preencha fretes, taxas, validade, observações e anexos conforme o escopo solicitado na cotação.',
      'Ao **enviar**, a proposta entra no comparativo do **Painel da Cotação** do importador e o status do disparo é atualizado para o funil do fornecedor.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Tabelas de valor',
    tituloCurto: 'Tabelas de valor',
    paragrafos: [
      'CRUD **self-service** de tabelas tarifárias do fornecedor (rotas, modais, faixas de peso/volume).',
      'As tabelas podem acelerar o preenchimento em respostas futuras; não substituem a proposta formal exigida em cada disparo.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Meu desempenho',
    tituloCurto: 'Meu desempenho',
    paragrafos: [
      'Painel de **KPIs** do fornecedor: taxa de resposta, taxa de aprovação, volume de disparos recebidos e **classificação** no ranking do workspace.',
      'Métricas alimentam a escolha de fornecedores nas próximas rodadas de cotação.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Resposta pública',
    tituloCurto: 'Resposta pública',
    paragrafos: [
      'Quando o disparo inclui **token de resposta**, o fornecedor abre um link público (`/publico/:token`) sem autenticação Clerk.',
      'O formulário espelha o fluxo **Responder cotação**, com escopo limitado ao disparo do token. Após o envio, a proposta segue o mesmo circuito de análise do importador.',
    ],
    badgeEmDesenvolvimento: true,
  },
  {
    titulo: 'Configurações do fornecedor',
    tituloCurto: 'Configurações',
    paragrafos: [
      'Preferências da visão fornecedor: notificações, colunas da lista, painéis do dashboard e demais ajustes locais ao agente de carga.',
      'Não confundir com as **Configurações** operacionais do workspace importador (capítulo 11 deste manual).',
    ],
    badgeEmDesenvolvimento: true,
  },
])
