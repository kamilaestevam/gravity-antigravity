import type { DocGaleriaTela, DocPassoVisual, DocSecao, DocTooltipKpi } from './manual-configurador-conteudo'
import { passosComAcessoPadrao, renumerarPassos } from './manual-configurador-conteudo'

/** SSOT: Drive `7. API Cockpit` → `public/university/screenshots/configurador-api-cockpit-*.png` */
const IMG_ACESSO_SETA = '/university/screenshots/configurador-api-cockpit-acesso-seta.png'
const IMG_ACESSO_ATALHO = '/university/screenshots/configurador-assinaturas-acesso-atalho.png'
const IMG_SERVIDORES = '/university/screenshots/configurador-api-cockpit-servidores.png'
const IMG_SERVIDORES_TT1 = '/university/screenshots/configurador-api-cockpit-servidores-tooltip-1.png'
const IMG_SERVIDORES_TT2 = '/university/screenshots/configurador-api-cockpit-servidores-tooltip-2.png'
const IMG_SERVIDORES_TT3 = '/university/screenshots/configurador-api-cockpit-servidores-tooltip-3.png'
const IMG_SERVIDORES_TT4 = '/university/screenshots/configurador-api-cockpit-servidores-tooltip-4.png'
const IMG_TOKENS = '/university/screenshots/configurador-api-cockpit-tokens.png'
const IMG_TOKENS_CARDS = '/university/screenshots/configurador-api-cockpit-tokens-cards.png'
const IMG_TOKENS_NOVO_SETA = '/university/screenshots/configurador-api-cockpit-tokens-novo-seta.png'
const IMG_TOKENS_MODAL_1 = '/university/screenshots/configurador-api-cockpit-tokens-modal-1.png'
const IMG_TOKENS_MODAL_2 = '/university/screenshots/configurador-api-cockpit-tokens-modal-2.png'
const IMG_TOKENS_GERAR_SETA = '/university/screenshots/configurador-api-cockpit-tokens-gerar-seta.png'
const IMG_TOKENS_GERAR_CONF = '/university/screenshots/configurador-api-cockpit-tokens-gerar-modal-confirmacao.png'
const IMG_TOKENS_GERAR_OK = '/university/screenshots/configurador-api-cockpit-tokens-gerar-modal-confirmado.png'
const IMG_TOKENS_REVOGAR_SETA = '/university/screenshots/configurador-api-cockpit-tokens-revogar-seta.png'
/** Drive `tela_api_cockpit_revogar_token` — modal Gravity (TASK-000401), substitui print com confirm() nativo. */
const IMG_TOKENS_REVOGAR_TOKEN = '/university/screenshots/configurador-api-cockpit-tokens-revogar-token.png'
const IMG_TOKENS_REVOGADO = '/university/screenshots/configurador-api-cockpit-tokens-revogado.png'
const IMG_WEBHOOK_SETA = '/university/screenshots/configurador-api-cockpit-webhook-seta.png'
const IMG_WEBHOOK_NOVO_SETA = '/university/screenshots/configurador-api-cockpit-webhook-novo-seta.png'
/** Drive `webhook__modal.png` está mislabelled (conteúdo = histórico) — não usar no manual. */
const IMG_WEBHOOK_MODAL_NOVO = '/university/screenshots/configurador-api-cockpit-webhook-modal-2.png'
const IMG_WEBHOOK_CAD_SETA = '/university/screenshots/configurador-api-cockpit-webhook-cadastrar-seta.png'
const IMG_WEBHOOK_CAD_MODAL = '/university/screenshots/configurador-api-cockpit-webhook-cadastrado-modal.png'
const IMG_WEBHOOK_CAD_TELA = '/university/screenshots/configurador-api-cockpit-webhook-cadastrado-tela.png'
const IMG_WEBHOOK_TESTAR = '/university/screenshots/configurador-api-cockpit-webhook-testar.png'
const IMG_WEBHOOK_HIST_SETA = '/university/screenshots/configurador-api-cockpit-webhook-historico-seta.png'
const IMG_WEBHOOK_HIST_MODAL = '/university/screenshots/configurador-api-cockpit-webhook-historico-modal.png'
const IMG_WEBHOOK_EXCLUIR = '/university/screenshots/configurador-api-cockpit-webhook-excluir.png'
const IMG_CONSUMO = '/university/screenshots/configurador-api-cockpit-consumo.png'

export const DOC_API_COCKPIT_SUBTITULO =
  'Servidores, tokens, webhooks, consumo e integração REST com ERP/COMEX'

export const DOC_API_COCKPIT_METADADOS: { rotulo: string; valor: string; href?: boolean }[] = [
  { rotulo: 'Versão', valor: '1.0' },
  { rotulo: 'Atualizado em', valor: 'julho 2026' },
  { rotulo: 'Produto', valor: 'Configurador · API Cockpit' },
  { rotulo: 'URL de acesso', valor: 'https://usegravity.com.br/configurador/api-cockpit', href: true },
  { rotulo: 'Rota base', valor: '/configurador/api-cockpit' },
]

const API_COCKPIT_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Status da plataforma',
    tituloTooltip: 'Saúde agregada',
    descricao: 'Percentual de serviços online, degradados ou offline na infraestrutura Gravity.',
    detalhes: [],
  },
  {
    card: 'Latência da plataforma',
    tituloTooltip: 'Tempo de resposta',
    descricao: 'Média das latências dos health checks dos serviços em estado online.',
    detalhes: [],
  },
  {
    card: 'Última verificação',
    tituloTooltip: 'Freshness do monitor',
    descricao: 'Há quanto tempo o painel executou o último health check nos servidores.',
    detalhes: [],
  },
  {
    card: 'Disponibilidade percebida (30d)',
    tituloTooltip: 'Série diária',
    descricao: 'Percentual médio de requisições bem-sucedidas da organização nos últimos 30 dias.',
    detalhes: [],
  },
]

const API_COCKPIT_GALERIA_SERVIDORES_TOOLTIPS: DocGaleriaTela[] = [
  { legenda: '1 · Status da plataforma', imagem: IMG_SERVIDORES_TT1, tooltipKpi: API_COCKPIT_TOOLTIPS_KPI[0] },
  { legenda: '2 · Latência da plataforma', imagem: IMG_SERVIDORES_TT2, tooltipKpi: API_COCKPIT_TOOLTIPS_KPI[1] },
  { legenda: '3 · Última verificação', imagem: IMG_SERVIDORES_TT3, tooltipKpi: API_COCKPIT_TOOLTIPS_KPI[2] },
  { legenda: '4 · Disponibilidade (30d)', imagem: IMG_SERVIDORES_TT4, tooltipKpi: API_COCKPIT_TOOLTIPS_KPI[3] },
]

export const DOC_API_COCKPIT_SECAO: DocSecao = {
  num: 8,
  titulo: 'API Cockpit',
  tituloTopico: 'O que irá encontrar em API Cockpit',
  layoutTextoImagemLateral: true,
  mostrarInfograficoApiCockpitIntegracao: true,
  infograficoApiCockpitIntegracaoAposParagrafo: 0,
  imagem: IMG_SERVIDORES,
  paragrafos: [
    'O **API Cockpit** é a central de **integrações REST** da sua organização no Configurador. Nele você monitora a **saúde dos servidores**, **gera tokens** de acesso, configura **webhooks** opcionais e acompanha o **consumo** das APIs dos Produtos Gravity contratados.',
    'As quatro abas (**Servidores**, **Tokens**, **Webhooks** e **Consumo**) compartilham os mesmos cards de resumo no topo e refletem apenas o tráfego da **sua organização**.',
    'Para integrar um **ERP**, **COMEX** ou **WMS**, o **primeiro passo** é sempre **gerar um token** na aba **Tokens** (escopo **Escrita** quando o sistema externo precisa **enviar** dados). Depois, seu time técnico usa esse token nas chamadas REST. Cada produto Gravity expõe um **contrato de payload diferente**.',
  ],
  lista: [
    '**Servidores**: status, latência e versão de cada serviço da plataforma',
    '**Tokens**: credenciais com escopo (leitura, escrita ou exclusão) e validade',
    '**Webhooks**: notificações HTTP para o ERP ou sistema externo da empresa',
    '**Consumo**: log de requisições, método, endpoint e código de resposta',
  ],
  callout: {
    tipo: 'seguranca',
    texto: 'O valor completo do token e o **secret** do webhook são exibidos **uma única vez** na criação. Guarde em cofre seguro; após fechar o modal, só o prefixo permanece visível.',
  },
  fluxos: [
    {
      titulo: 'Acessar API Cockpit',
      tituloSumario: 'Acessar API Cockpit',
      paragrafos: [
        'Siga os passos abaixo para abrir o Configurador e chegar ao API Cockpit.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Somente usuários **Master** da organização acessam o API Cockpit no Configurador. Usuários **Standard** e **Fornecedor** não entram nesta tela, mas consomem o resultado das integrações nos produtos (ex.: leituras na **Lista** do Smart Docs).',
      },
      passosVisuais: passosComAcessoPadrao(
        'API Cockpit',
        [],
        IMG_ACESSO_SETA,
        true,
        [
          'No menu lateral do Configurador, clique em API Cockpit, como indicado pela seta na imagem.',
        ],
        undefined,
        IMG_ACESSO_ATALHO,
      ),
    },
    {
      titulo: 'Servidores',
      tituloSumario: 'Servidores',
      paragrafos: [
        'A aba **Servidores** mostra o inventário de serviços da plataforma e a saúde de cada endpoint usado pelos Produtos Gravity da organização.',
        'A **tabela** lista cada serviço com tipo (Plataforma, Produto Gravity ou Conector), status colorido, latência, versão e horário do último check. Use o status para identificar rapidamente se algum serviço está **offline** ou **degradado** antes de abrir chamado com o suporte.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Tela de Servidores',
          ocultarTituloPasso: true,
          ocultarRotuloPasso: true,
          imagem: IMG_SERVIDORES,
          calloutAposImagem: {
            tipo: 'dica',
            texto: 'Pense nesta tela como um **monitoramento em tempo real** da saúde da plataforma Gravity.',
          },
          galeriaTelas: [...API_COCKPIT_GALERIA_SERVIDORES_TOOLTIPS],
        },
      ]),
    },
    {
      titulo: 'Tokens',
      tituloSumario: 'Tokens',
      paragrafos: [
        'Na aba **Tokens** você cria credenciais nomeadas para integrações (ERP, WMS, scripts internos). Cada token tem **escopo**, **validade** e **limite de requisições por minuto**.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Tela de tokens',
          ocultarTituloPasso: true,
          ocultarRotuloPasso: true,
          imagem: IMG_TOKENS,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A listagem mostra nome, prefixo, escopo, validade e data de criação. Use **Novo token** para emitir uma credencial.',
            'Os **cinco cards** no topo repetem os indicadores de integração (status, taxa de sucesso 24h, latência, produtos em uso e requisições 24h):',
          ],
        },
        {
          titulo: 'Cards do token',
          rotuloPasso: 'Cards do token',
          imagem: IMG_TOKENS_CARDS,
          imagemAbaixoTexto: true,
          ocultarTituloPasso: true,
          paragrafos: [
            'Esses KPIs ajudam a validar se as integrações com token estão saudáveis antes de abrir a tabela.',
          ],
        },
        {
          titulo: 'Novo token',
          rotuloPasso: 'Novo token',
          ocultarTituloPasso: true,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Clique em **Novo token**, como indicado pela seta na imagem.',
            'Informe um **nome** identificável (ex.: «Integração SAP»), escolha o **escopo** (Leitura, Escrita ou Exclusão), a **validade** (Nunca, 30 dias, 90 dias ou personalizado) e o **rate limit** em requisições por minuto.',
            'Revise os campos e clique em **Gerar token**.',
            'O sistema exibe o token completo **uma única vez**. Use **Copiar** e armazene em local seguro antes de fechar.',
            'Após confirmar, o token aparece na tabela apenas com o **prefixo**; o valor secreto não pode ser recuperado depois.',
          ],
          figurasAposParagrafo: [
            { indice: 0, imagem: IMG_TOKENS_NOVO_SETA },
            { indice: 1, imagem: IMG_TOKENS_MODAL_1 },
            { indice: 2, imagem: IMG_TOKENS_MODAL_2 },
            { indice: 3, imagem: IMG_TOKENS_GERAR_SETA },
            { indice: 3, imagem: IMG_TOKENS_GERAR_CONF },
            { indice: 4, imagem: IMG_TOKENS_GERAR_OK },
          ],
        },
        {
          titulo: 'Revogar token',
          rotuloPasso: 'Revogar token',
          ocultarTituloPasso: true,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Para invalidar uma credencial comprometida ou desativada, use a ação **Revogar** na linha do token.',
            'No modal *_Revogar token?_*, leia o aviso e clique em **Excluir** para confirmar. A revogação é **imediata**: requisições com aquele token passam a retornar erro de autenticação.',
            'O status da linha atualiza e o token deixa de aceitar chamadas.',
          ],
          figurasAposParagrafo: [
            { indice: 0, imagem: IMG_TOKENS_REVOGAR_SETA },
            { indice: 1, imagem: IMG_TOKENS_REVOGAR_TOKEN },
            { indice: 2, imagem: IMG_TOKENS_REVOGADO },
          ],
        },
      ]),
    },
    {
      titulo: 'Webhooks',
      tituloSumario: 'Webhooks',
      paragrafos: [
        'Na aba **Webhooks** você cadastra URLs de destino para receber eventos da plataforma (pedido criado, cotação aprovada, documento emitido, etc.) com assinatura HMAC para validação.',
      ],
      calloutAposParagrafo: {
        indice: 0,
        callout: {
          tipo: 'aviso',
          texto:
            '**Em construção:** cadastro, secret e botão **Testar** já funcionam. Os eventos automáticos de negócio (`pedido.criado`, `cotacao.aprovada`, etc.) ainda **não disparam sozinhos** quando algo acontece na plataforma: use **Testar** para validar sua URL; para integrar de fato, use **Token + API**.',
        },
      },
      mostrarInfograficoApiCockpitWebhookVsApi: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Cadastrar webhook',
          rotuloPasso: 'Cadastrar webhook',
          ocultarTituloPasso: true,
          imagemAbaixoTexto: true,
          paragrafos: [
            'No menu de abas do Cockpit, clique em **Webhooks**.',
            'Clique em **+ Novo Webhook**, como indicado pela seta na imagem.',
            'Informe a **URL HTTPS** do seu sistema e marque os **eventos** que deseja receber.',
            'Selecione pelo menos um evento (ex.: **pedido.criado**) e clique em **Cadastrar Webhook**, como indicado pela seta na imagem.',
            'Copie o **secret** exibido uma única vez. Use-o para validar o header `X-Gravity-Signature` no seu endpoint.',
          ],
          figurasAposParagrafo: [
            { indice: 0, imagem: IMG_WEBHOOK_SETA },
            { indice: 1, imagem: IMG_WEBHOOK_NOVO_SETA },
            { indice: 2, imagem: IMG_WEBHOOK_MODAL_NOVO },
            { indice: 3, imagem: IMG_WEBHOOK_CAD_SETA },
            { indice: 4, imagem: IMG_WEBHOOK_CAD_MODAL },
          ],
        },
        {
          titulo: 'Testar webhook',
          rotuloPasso: 'Testar webhook',
          tagEmConstrucao: true,
          ocultarTituloPasso: true,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O webhook ativo aparece na tabela com URL, eventos e ações de teste, histórico e exclusão.',
            'Use **Testar** para enviar um payload de exemplo à URL cadastrada e verificar conectividade antes de ir para produção.',
          ],
          figurasAposParagrafo: [
            { indice: 0, imagem: IMG_WEBHOOK_CAD_TELA },
            { indice: 1, imagem: IMG_WEBHOOK_TESTAR },
          ],
        },
        {
          titulo: 'Histórico',
          rotuloPasso: 'Histórico',
          tagEmConstrucao: true,
          ocultarTituloPasso: true,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Abra **Histórico** na linha do webhook para auditar tentativas, códigos HTTP e latência.',
            'Cada linha registra evento, status (sucesso ou falha), latência e número de tentativas com retry automático.',
          ],
          figurasAposParagrafo: [
            { indice: 0, imagem: IMG_WEBHOOK_HIST_SETA },
            { indice: 1, imagem: IMG_WEBHOOK_HIST_MODAL },
          ],
        },
        {
          titulo: 'Excluir webhook',
          rotuloPasso: 'Excluir webhook',
          tagEmConstrucao: true,
          imagem: IMG_WEBHOOK_EXCLUIR,
          imagemAbaixoTexto: true,
          ocultarTituloPasso: true,
          paragrafos: [
            'Para remover uma URL obsoleta, use **Excluir** e confirme no modal. Os disparos cessam imediatamente.',
          ],
        },
      ]),
    },
    {
      titulo: 'Consumo',
      tituloSumario: 'Consumo',
      paragrafos: [
        'A aba **Consumo** concentra o log de requisições feitas com tokens da organização: método, endpoint, status HTTP, latência e produto de origem.',
      ],
      mostrarInfograficoApiCockpitConsumo: true,
      passosVisuais: renumerarPassos([
        {
          titulo: 'Log de requisições',
          rotuloPasso: 'Log de requisições',
          ocultarTituloPasso: true,
          imagem: IMG_CONSUMO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Filtre por período e produto quando disponível. Use a tabela para investigar erros 4xx/5xx, picos de latência ou integrações inativas.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'Os mesmos cinco cards de KPI do topo das outras abas refletem as últimas 24 horas, úteis para um diagnóstico rápido antes de mergulhar no log.',
          },
        },
      ]),
    },
    {
      titulo: 'Token + API vs Webhook',
      tituloSumario: 'Token + API vs Webhook',
      paragrafos: [
        'Dois mecanismos complementares; muita confusão vem de misturá-los:',
        '**Token + API**: **Seu sistema inicia**: envia documento, cria leitura e **busca** status/resultado com GET. **Obrigatório** para integrar.',
        '**Webhook**: **A Gravity inicia**: avisa seu endpoint HTTPS que um evento terminou (ex.: leitura pronta). **Opcional**; substituto: polling com GET.',
        '**Direção**: Token+API = Sistema Externo → Gravity (e consultas de volta); Webhook = Gravity → Sistema Externo. Depois do webhook, seu backend ainda faz **GET** com o mesmo token; o aviso **não traz** o JSON completo.',
      ],
    },
  ],
}

/** SSOT — sequência Webhooks (Drive → `configurador-api-cockpit-webhook-*.png`). */
export const CAPTURAS_TELA_WEBHOOK_API_COCKPIT = {
  acesso: IMG_ACESSO_SETA,
  aba: IMG_WEBHOOK_SETA,
  novoSeta: IMG_WEBHOOK_NOVO_SETA,
  modalNovo: IMG_WEBHOOK_MODAL_NOVO,
  cadastrarSeta: IMG_WEBHOOK_CAD_SETA,
  secretModal: IMG_WEBHOOK_CAD_MODAL,
  listagem: IMG_WEBHOOK_CAD_TELA,
} as const

/** SSOT — sequência Tokens (Drive → `configurador-api-cockpit-tokens-*.png`). */
export const CAPTURAS_TELA_TOKEN_API_COCKPIT = {
  acesso: IMG_ACESSO_SETA,
  listagem: IMG_TOKENS,
  novoSeta: IMG_TOKENS_NOVO_SETA,
  modal1: IMG_TOKENS_MODAL_1,
  modal2: IMG_TOKENS_MODAL_2,
  gerarSeta: IMG_TOKENS_GERAR_SETA,
  gerarConf: IMG_TOKENS_GERAR_CONF,
  gerarOk: IMG_TOKENS_GERAR_OK,
} as const
