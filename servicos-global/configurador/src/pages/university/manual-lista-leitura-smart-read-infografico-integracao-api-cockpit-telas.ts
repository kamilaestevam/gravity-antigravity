/** Sequências de telas do infográfico §5.10 — paths em `public/university/screenshots/`. */
import { CAPTURAS_TELA_TOKEN_API_COCKPIT, CAPTURAS_TELA_WEBHOOK_API_COCKPIT } from './manual-api-cockpit-conteudo'

export type TelaSequenciaInfografico = {
  titulo: string
  imagem: string
  paragrafo?: string
}

/** Preview fallback quando PNG ainda não existe no ambiente. */
export const IMAGEM_PREVIEW_PADRAO_INFOGRAFICO = '/university/screenshots/smart-docs-lista-transacoes-api.png'

const S = {
  lista: '/university/screenshots/smart-docs-lista.png',
  transacoes: '/university/screenshots/smart-docs-lista-transacoes-api.png',
  exportarSeta: '/university/screenshots/smart-docs-lista-exportar-seta.png',
  exportarModal: '/university/screenshots/smart-docs-lista-exportar-modal.png',
  paineisSeta: '/university/screenshots/smart-docs-lista-paineis-seta.png',
  novaLeitura: '/university/screenshots/smart-docs-lista-nova-leitura.png',
  telaPrincipal: '/university/screenshots/smart-docs-tela-principal.png',
  novaLeitura4Passos: '/university/screenshots/smart-docs-nova-leitura-4-passos.png',
  anexar: '/university/screenshots/smart-docs-nova-leitura-passo-1-anexar.png',
  anexado: '/university/screenshots/smart-docs-nova-leitura-passo-1-anexado.png',
  linhaExpandida: '/university/screenshots/smart-docs-lista-linha-expandida.png',
  edicaoConferencia: '/university/screenshots/smart-docs-lista-fluxo-edicao-conferencia.png',
  expandirSeta: '/university/screenshots/smart-docs-lista-expandir-seta.png',
} as const

export const TELAS_INFOGRAFICO_INTEGRACAO_API_COCKPIT: Record<string, TelaSequenciaInfografico[]> = {
  webhook: [
    {
      titulo: 'Abrir o API Cockpit',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.acesso,
      paragrafo: 'No menu lateral do **Configurador**, clique em **API Cockpit** (seta na imagem).',
    },
    {
      titulo: 'Abrir a aba Webhooks',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.aba,
      paragrafo: 'No menu de abas do Cockpit, clique em **Webhooks**.',
    },
    {
      titulo: 'Novo webhook',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.novoSeta,
      paragrafo: 'Clique em **+ Novo Webhook**, como indicado pela seta na imagem.',
    },
    {
      titulo: 'URL e eventos',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.modalNovo,
      paragrafo: 'Informe a **URL HTTPS** do Sistema Externo e marque os **eventos**.',
    },
    {
      titulo: 'Cadastrar webhook',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.cadastrarSeta,
      paragrafo: 'Selecione os eventos e clique em **Cadastrar Webhook**.',
    },
    {
      titulo: 'Secret em claro',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.secretModal,
      paragrafo: 'Copie o **secret** exibido uma única vez para validar o header no endpoint.',
    },
    {
      titulo: 'Webhook na listagem',
      imagem: CAPTURAS_TELA_WEBHOOK_API_COCKPIT.listagem,
      paragrafo: 'O webhook ativo aparece na tabela com URL, eventos e ações.',
    },
  ],
  token: [
    {
      titulo: 'Abrir o API Cockpit',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.acesso,
      paragrafo: 'No menu lateral do **Configurador**, clique em **API Cockpit** (seta na imagem).',
    },
    {
      titulo: 'Aba Tokens',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.listagem,
      paragrafo: 'No menu de abas do Cockpit, clique em **Tokens**.',
    },
    {
      titulo: 'Novo token',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.novoSeta,
      paragrafo: 'Clique em **Novo token**, como indicado pela seta na imagem.',
    },
    {
      titulo: 'Escopo e workspace',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.modal1,
      paragrafo: 'Informe **nome**, escopo **Escrita**, **validade** e **rate limit**.',
    },
    {
      titulo: 'Confirmar criação',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.modal2,
      paragrafo: 'Revise os campos e clique em **Gerar token**.',
    },
    {
      titulo: 'Copiar token em claro',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.gerarSeta,
      paragrafo: 'O valor completo aparece **uma única vez**: use **Copiar** antes de fechar.',
    },
    {
      titulo: 'Modal de confirmação',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.gerarConf,
      paragrafo: 'Confirme que guardou o token em local seguro.',
    },
    {
      titulo: 'Token confirmado',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.gerarOk,
      paragrafo: 'Após confirmar, o token volta à listagem.',
    },
    {
      titulo: 'Token na listagem',
      imagem: CAPTURAS_TELA_TOKEN_API_COCKPIT.listagem,
      paragrafo: 'Na tabela só permanece o **prefixo**: o valor secreto não pode ser recuperado.',
    },
  ],
  pdf: [
    { titulo: 'Exportar PDF no ERP', imagem: S.anexar, paragrafo: 'No **Sistema Externo**, gere o **PDF do pedido** (ex.: Pedido #4521) antes do envio.' },
    { titulo: 'Arquivo pronto para POST', imagem: S.anexado, paragrafo: 'O PDF fica disponível para anexar na chamada **multipart** da API.' },
  ],
  post: [
    { titulo: 'Endpoint Smart Docs', imagem: S.transacoes, paragrafo: 'O **Sistema Externo** envia **POST** via **API Cockpit** com header `Authorization: Bearer {token}`.' },
    { titulo: 'Upload multipart', imagem: S.novaLeitura, paragrafo: 'Corpo **multipart** com o PDF e metadados do workspace ligado ao token.' },
  ],
  valida: [
    { titulo: 'API Cockpit: gateway', imagem: S.telaPrincipal, paragrafo: 'Entrada pelo app **/configurador/api-cockpit** da organização.' },
    { titulo: 'Tokens ativos', imagem: S.transacoes, paragrafo: 'O token usado no **POST** deve estar ativo nesta aba.' },
  ],
  recebe: [
    { titulo: 'Entrada no Smart Docs', imagem: S.novaLeitura, paragrafo: 'Após roteamento, o serviço **Smart Docs** do workspace recebe o arquivo.' },
    { titulo: 'Documento na fila', imagem: S.anexado, paragrafo: 'O PDF entra no pipeline de leitura do workspace.' },
  ],
  id: [
    { titulo: 'Resposta da API', imagem: S.transacoes, paragrafo: 'A API retorna JSON com **`id_leitura`**: guarde para **GET** e webhooks.' },
  ],
  ia: [
    { titulo: 'Wizard Nova Leitura', imagem: S.novaLeitura4Passos, paragrafo: 'Paridade com o fluxo **Nova Leitura** do produto.' },
    { titulo: 'Classificação do documento', imagem: S.anexado, paragrafo: 'A **IA** identifica o tipo de documento anexado.' },
    { titulo: 'Extração de campos', imagem: S.edicaoConferencia, paragrafo: 'Campos são extraídos para revisão e conferência.' },
  ],
  grava: [
    { titulo: 'Lista · Transações API', imagem: S.transacoes, paragrafo: 'Leituras com **`origem_leitura: API`** aparecem nesta aba.' },
    { titulo: 'Lista · visão geral', imagem: S.lista, paragrafo: 'Contexto da lista Smart Docs onde a leitura fica registrada.' },
  ],
  decisao: [
    { titulo: 'Webhook cadastrado?', imagem: S.lista, paragrafo: 'Se há URL em **Webhooks**, Gravity pode avisar por **POST** (push).' },
    { titulo: 'Só polling via API', imagem: S.transacoes, paragrafo: 'Sem webhook, o **Sistema Externo** consulta status com **GET** em loop.' },
  ],
  'wh-post': [
    { titulo: 'Webhooks cadastrados', imagem: S.lista, paragrafo: 'Gravity dispara na **URL** configurada aqui.' },
    { titulo: 'Testar webhook', imagem: S.exportarSeta, paragrafo: 'Use **Testar** para validar conectividade antes de produção.' },
  ],
  'wh-recv': [
    { titulo: 'POST de conclusão', imagem: S.exportarModal, paragrafo: 'Gravity envia **POST** «leitura concluída» + **`id_leitura`** na URL cadastrada.' },
    { titulo: 'Endpoint do ERP', imagem: S.paineisSeta, paragrafo: 'O servidor **HTTPS** do **Sistema Externo** recebe e processa o aviso.' },
  ],
  'get-wh': [
    { titulo: 'Consumo de API', imagem: S.transacoes, paragrafo: 'Audite chamadas **GET** na aba **Consumo**.' },
    { titulo: 'GET após webhook', imagem: S.expandirSeta, paragrafo: 'Após o aviso, busque dados completos com token na API de leitura.' },
  ],
  'get-api': [
    { titulo: 'Consumo de API', imagem: S.transacoes, paragrafo: 'Acompanhe polling e latência na aba **Consumo**.' },
    { titulo: 'Loop de status', imagem: S.linhaExpandida, paragrafo: 'Repita **GET** no mesmo **`id_leitura`** até status concluído.' },
  ],
  resp: [
    { titulo: 'Campos na resposta', imagem: S.linhaExpandida, paragrafo: 'JSON com campos extraídos (nº pedido, itens, valores…).' },
    { titulo: 'Conferência na lista', imagem: S.edicaoConferencia, paragrafo: 'Mesmos dados visíveis ao expandir a linha na **Lista** Smart Docs.' },
  ],
  fim: [
    { titulo: 'Resultado no ERP', imagem: S.lista, paragrafo: 'O **Sistema Externo** persiste o resultado no pedido ou fluxo **COMEX**.' },
  ],
}
