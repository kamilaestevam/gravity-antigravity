import type { DocGaleriaTela, DocPassoVisual, DocSecao, DocTooltipKpi } from './manual-configurador-conteudo'
import { passosComAcessoPadrao, renumerarPassos } from './manual-configurador-conteudo'

/** SSOT: Drive `7. API Cockpit` → `public/university/screenshots/configurador-api-cockpit-*.png` */
const IMG_ACESSO_SETA = '/university/screenshots/configurador-api-cockpit-acesso-seta.png'
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
const IMG_TOKENS_REVOGAR_MODAL = '/university/screenshots/configurador-api-cockpit-tokens-revogar-modal.png'
const IMG_TOKENS_REVOGADO = '/university/screenshots/configurador-api-cockpit-tokens-revogado.png'
const IMG_WEBHOOK_SETA = '/university/screenshots/configurador-api-cockpit-webhook-seta.png'
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

const API_COCKPIT_TOOLTIPS_KPI: DocTooltipKpi[] = [
  {
    card: 'Status da plataforma',
    tituloTooltip: 'Saúde agregada',
    descricao: 'Percentual de serviços online, degradados ou offline na infraestrutura Gravity.',
    detalhes: ['Legenda colorida: verde online, amarelo degradado, vermelho offline'],
  },
  {
    card: 'Latência da plataforma',
    tituloTooltip: 'Tempo de resposta',
    descricao: 'Média das latências dos health checks dos serviços em estado online.',
    detalhes: ['Atualizado a cada polling automático da aba Servidores'],
  },
  {
    card: 'Última verificação',
    tituloTooltip: 'Freshness do monitor',
    descricao: 'Há quanto tempo o painel executou o último health check nos servidores.',
    detalhes: ['Útil para detectar atraso na coleta de métricas'],
  },
  {
    card: 'Disponibilidade percebida (30d)',
    tituloTooltip: 'Série diária',
    descricao: 'Percentual médio de requisições bem-sucedidas da organização nos últimos 30 dias.',
    detalhes: ['Sparkline mostra a tendência dia a dia'],
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
  layoutTextoImagemLateral: true,
  imagem: IMG_SERVIDORES,
  paragrafos: [
    'O **API Cockpit** é a central de **integrações REST** da organização no Configurador. Nele você monitora a **saúde dos servidores**, emite **tokens** de acesso, configura **webhooks** e acompanha o **consumo** das APIs dos Produtos Gravity contratados.',
    'As quatro abas — **Servidores**, **Tokens**, **Webhooks** e **Consumo** — compartilham os mesmos cards de resumo no topo e refletem apenas o tráfego da sua organização.',
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
      titulo: 'Como acessar o API Cockpit',
      tituloSumario: 'Como acessar o API Cockpit',
      paragrafos: [
        'Siga os passos abaixo para abrir o Configurador e chegar ao API Cockpit.',
      ],
      callout: {
        tipo: 'dica',
        texto: 'Somente usuários **Master** acessam o API Cockpit no Configurador.',
      },
      passosVisuais: passosComAcessoPadrao(
        'API Cockpit',
        [],
        IMG_ACESSO_SETA,
        true,
        [
          'No menu lateral do Configurador, clique em **API Cockpit** (seta na imagem). A tela abre na aba **Servidores**.',
        ],
      ),
    },
    {
      titulo: 'Servidores',
      tituloSumario: 'Servidores',
      paragrafos: [
        'A aba **Servidores** mostra o inventário de serviços da plataforma e a saúde de cada endpoint usado pelos Produtos Gravity da organização.',
        'Os **quatro cards** no topo resumem status agregado, latência, última verificação e disponibilidade de 30 dias. A **tabela** lista cada serviço com tipo (Plataforma, Produto Gravity ou Conector), status colorido, latência, versão e horário do último check.',
        'Passe o mouse no ícone **(i)** de cada card para abrir o tooltip. Veja abaixo o que cada indicador mostra:',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Servidores',
          ocultarRotuloPasso: true,
          ocultarTituloPasso: true,
          imagem: IMG_SERVIDORES,
          imagemAbaixoTexto: true,
          paragrafos: [],
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
          imagem: IMG_TOKENS,
          imagemAbaixoTexto: true,
          paragrafos: [
            'A listagem mostra nome, prefixo, escopo, validade e data de criação. Use **Novo token** para emitir uma credencial.',
            'Os **cinco cards** no topo repetem os indicadores de integração (status, taxa de sucesso 24h, latência, produtos em uso e requisições 24h):',
          ],
        },
        {
          titulo: 'Indicadores da aba',
          imagem: IMG_TOKENS_CARDS,
          imagemAbaixoTexto: true,
          ocultarTituloPasso: true,
          paragrafos: [
            'Esses KPIs ajudam a validar se as integrações com token estão saudáveis antes de abrir a tabela.',
          ],
        },
        {
          titulo: 'Abrir Novo token',
          imagem: IMG_TOKENS_NOVO_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Clique em **Novo token**, como indicado pela seta na imagem.',
          ],
        },
        {
          titulo: 'Preencher o formulário',
          imagem: IMG_TOKENS_MODAL_1,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Informe um **nome** identificável (ex.: «Integração SAP»), escolha o **escopo** (Leitura, Escrita ou Exclusão), a **validade** (Nunca, 30 dias, 90 dias ou personalizado) e o **rate limit** em requisições por minuto.',
          ],
        },
        {
          titulo: 'Confirmar criação',
          imagem: IMG_TOKENS_MODAL_2,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Revise os campos e clique em **Gerar token**.',
          ],
        },
        {
          titulo: 'Copiar o valor em claro',
          imagem: IMG_TOKENS_GERAR_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O sistema exibe o token completo **uma única vez**. Use **Copiar** e armazene em local seguro antes de fechar.',
          ],
        },
        {
          titulo: 'Modal de confirmação',
          imagem: IMG_TOKENS_GERAR_CONF,
          imagemAbaixoTexto: true,
          ocultarTituloPasso: true,
          paragrafos: [],
        },
        {
          titulo: 'Token na listagem',
          imagem: IMG_TOKENS_GERAR_OK,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Após confirmar, o token aparece na tabela apenas com o **prefixo** — o valor secreto não pode ser recuperado depois.',
          ],
        },
        {
          titulo: 'Revogar um token',
          imagem: IMG_TOKENS_REVOGAR_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Para invalidar uma credencial comprometida ou desativada, use a ação **Revogar** na linha do token.',
          ],
        },
        {
          titulo: 'Confirmar revogação',
          imagem: IMG_TOKENS_REVOGAR_MODAL,
          imagemAbaixoTexto: true,
          paragrafos: [
            'No modal **Revogar token?**, leia o aviso e clique em **Excluir** para confirmar. A revogação é **imediata**: requisições com aquele token passam a retornar erro de autenticação.',
          ],
        },
        {
          titulo: 'Token revogado',
          imagem: IMG_TOKENS_REVOGADO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O status da linha atualiza e o token deixa de aceitar chamadas.',
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
      passosVisuais: renumerarPassos([
        {
          titulo: 'Abrir a aba Webhooks',
          imagem: IMG_WEBHOOK_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'No menu de abas do Cockpit, clique em **Webhooks**.',
          ],
        },
        {
          titulo: 'Novo webhook — URL e eventos',
          imagem: IMG_WEBHOOK_MODAL_NOVO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Clique em **+ Novo Webhook**. Informe a **URL HTTPS** do seu sistema e marque os **eventos** que deseja receber.',
          ],
        },
        {
          titulo: 'Cadastrar webhook',
          imagem: IMG_WEBHOOK_CAD_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Selecione pelo menos um evento (ex.: **pedido.criado**) e clique em **Cadastrar Webhook**, como indicado pela seta na imagem.',
          ],
        },
        {
          titulo: 'Secret em claro',
          imagem: IMG_WEBHOOK_CAD_MODAL,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Copie o **secret** exibido uma única vez. Use-o para validar o header `X-Gravity-Signature` no seu endpoint.',
          ],
        },
        {
          titulo: 'Webhook na listagem',
          imagem: IMG_WEBHOOK_CAD_TELA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'O webhook ativo aparece na tabela com URL, eventos e ações de teste, histórico e exclusão.',
          ],
        },
        {
          titulo: 'Disparar evento de teste',
          imagem: IMG_WEBHOOK_TESTAR,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Use **Testar** para enviar um payload de exemplo à URL cadastrada e verificar conectividade antes de ir para produção.',
          ],
        },
        {
          titulo: 'Histórico de disparos',
          imagem: IMG_WEBHOOK_HIST_SETA,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Abra **Histórico** na linha do webhook para auditar tentativas, códigos HTTP e latência.',
          ],
        },
        {
          titulo: 'Modal de histórico',
          imagem: IMG_WEBHOOK_HIST_MODAL,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Cada linha registra evento, status (sucesso ou falha), latência e número de tentativas com retry automático.',
          ],
        },
        {
          titulo: 'Excluir webhook',
          imagem: IMG_WEBHOOK_EXCLUIR,
          imagemAbaixoTexto: true,
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
        'A aba **Consumo** concentra o log de requisições feitas com tokens da organização — método, endpoint, status HTTP, latência e produto de origem.',
      ],
      passosVisuais: renumerarPassos([
        {
          titulo: 'Log de requisições',
          imagem: IMG_CONSUMO,
          imagemAbaixoTexto: true,
          paragrafos: [
            'Filtre por período e produto quando disponível. Use a tabela para investigar erros 4xx/5xx, picos de latência ou integrações inativas.',
          ],
          callout: {
            tipo: 'dica',
            texto: 'Os mesmos cinco cards de KPI do topo das outras abas refletem as últimas 24 horas — úteis para um diagnóstico rápido antes de mergulhar no log.',
          },
        },
      ]),
    },
  ],
}
