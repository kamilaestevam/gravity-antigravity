/**
 * Manual Pedido §5.12 — Novo pedido e item (4 formas + Novo item).
 * SSOT prints: Drive `1. Pedido` → `pedido-lista-novo-*.png`; API/Smart reutilizam prints já em `public/`.
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num'>

const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO =
  '/university/screenshots/pedido-lista-importar-seta-novo.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO_PEDIDO =
  '/university/screenshots/pedido-lista-importar-seta-novo-pedido.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MODAL_OPCOES =
  '/university/screenshots/pedido-lista-novo-pedido-modal-opcoes.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MODAL = '/university/screenshots/pedido-lista-importar-modal.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_TEMPLATE = '/university/screenshots/pedido-lista-importar-template.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MULTIPLAS_ABAS =
  '/university/screenshots/pedido-lista-importar-multiplas-abas.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ANALISANDO = '/university/screenshots/pedido-lista-importar-analisando.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MAPEAMENTO = '/university/screenshots/pedido-lista-importar-mapeamento.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_CONFIANCA = '/university/screenshots/pedido-lista-importar-confianca.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MEMORIA = '/university/screenshots/pedido-lista-importar-memoria.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_LEMBRAR = '/university/screenshots/pedido-lista-importar-lembrar.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_VER_DOCUMENTO =
  '/university/screenshots/pedido-lista-importar-ver-documento.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_FILTROS =
  '/university/screenshots/pedido-lista-importar-preview-filtros.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_CARD =
  '/university/screenshots/pedido-lista-importar-preview-card.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_DUPLICATA = '/university/screenshots/pedido-lista-importar-duplicata.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SOBRESCREVER_DIFF =
  '/university/screenshots/pedido-lista-importar-sobrescrever-diff.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_RESULTADO = '/university/screenshots/pedido-lista-importar-resultado.png'
const SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ERROS_CSV = '/university/screenshots/pedido-lista-importar-erros-csv.png'
const SCREENSHOT_API_COCKPIT_TOKENS = '/university/screenshots/configurador-api-cockpit-tokens.png'
const SCREENSHOT_API_COCKPIT_TOKENS_NOVO_SETA =
  '/university/screenshots/configurador-api-cockpit-tokens-novo-seta.png'
const SCREENSHOT_API_COCKPIT_TOKENS_MODAL_1 =
  '/university/screenshots/configurador-api-cockpit-tokens-modal-1.png'
const SCREENSHOT_API_COCKPIT_TOKENS_MODAL_2 =
  '/university/screenshots/configurador-api-cockpit-tokens-modal-2.png'
const SCREENSHOT_API_COCKPIT_TOKENS_GERAR_SETA =
  '/university/screenshots/configurador-api-cockpit-tokens-gerar-seta.png'
const SCREENSHOT_API_COCKPIT_TOKENS_GERAR_OK =
  '/university/screenshots/configurador-api-cockpit-tokens-gerar-modal-confirmado.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_4_PASSOS =
  '/university/screenshots/smart-docs-nova-leitura-4-passos.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-geral.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexar.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR_SETA =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexar-seta.png'
const SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO =
  '/university/screenshots/smart-docs-nova-leitura-passo-1-anexado.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_SETA =
  '/university/screenshots/pedido-lista-novo-pedido-manual-seta.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_1 =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-1.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_1_REQUISITOS =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-1-requisitos.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_NOVA_SETA =
  '/university/screenshots/pedido-lista-novo-pedido-manual-exportador-nova-seta.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_NOVA_MODAL =
  '/university/screenshots/pedido-lista-novo-pedido-manual-exportador-nova-modal.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_SELECT =
  '/university/screenshots/pedido-lista-novo-pedido-manual-exportador-select.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_ITENS =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-2-itens.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_NCM_1 =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-2-ncm-1.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_NCM_2 =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-2-ncm-2.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_CRIAR =
  '/university/screenshots/pedido-lista-novo-pedido-manual-passo-2-criar.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_SALVO_LISTA =
  '/university/screenshots/pedido-lista-novo-pedido-manual-salvo-lista.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_SETA = '/university/screenshots/pedido-lista-novo-item-seta.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MODAL_OPCOES =
  '/university/screenshots/pedido-lista-novo-item-modal-opcoes.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_PASSO_1 =
  '/university/screenshots/pedido-lista-novo-item-manual-passo-1.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ADICIONAR =
  '/university/screenshots/pedido-lista-novo-item-manual-adicionar.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ITEM_1 =
  '/university/screenshots/pedido-lista-novo-item-manual-item-1.png'
const SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ITENS_SALVOS =
  '/university/screenshots/pedido-lista-novo-item-manual-itens-salvos.png'

export const PASSO_MANUAL_PEDIDO_LISTA_NOVO_PEDIDO: PassoSemNumero = {
  titulo: 'Novo pedido e item',
  tituloCurto: 'Novo pedido e item',
  paragrafos: [
    'Na **Lista**, o botão **+ Novo** abre **Novo pedido** ou **Novo item**. Cada opção oferece **quatro caminhos** para incluir registros no workspace (cards no topo desta seção). O passo a passo de cada via está nas galerias abaixo.',
    'Além de **Novo pedido**, use **Novo item** para incluir linhas em pedidos já existentes sem abrir um PO novo. Pedidos criados por qualquer via nascem em **rascunho** — revise na Lista e altere o status para **Aberto** quando estiver pronto.',
  ],
  mostrarInfograficoPedidoListaImportarFormas: true,
  galeriaComparacaoAposParagrafo: [
    {
      indice: 1,
      tituloEtapa: '**Acesso comum (+ Novo):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO,
          paragrafoAntes: '**01.** Na Lista, clique em **+ Novo**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SETA_NOVO_PEDIDO,
          paragrafoAntes: '**02.** Escolha **Novo pedido** (ou **Novo item** no fluxo final desta seção)',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MODAL_OPCOES,
          paragrafoAntes: '**03.** Modal com as **quatro formas** de inclusão',
        },
      ],
    },
    {
      indice: 1,
      legendaPasso: '01 · Importar via planilha',
      pilaresImportarFormas: ['01'],
      tituloEtapa: '**01 — Importar via planilha (upload):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MODAL,
          paragrafoAntes: '**04.** Selecione **Importação**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_TEMPLATE,
          paragrafoAntes: '**05.** Modal **Importar Pedidos** — **Baixar template** oficial (.xlsx)',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MULTIPLAS_ABAS,
          paragrafoAntes: '**06.** Template: escolha a **aba** a importar',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ANALISANDO,
          paragrafoAntes: '**07.** **Em breve** — análise de planilha ou PDF do fornecedor',
        },
      ],
    },
    {
      indice: 1,
      tituloEtapa: '**01 — Importar via planilha (mapeamento):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      infograficoMapeamentoImportarColunas: true,
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MEMORIA,
          paragrafoAntes: '**08.** Modal com o **resultado da importação**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_MAPEAMENTO,
          calloutAntes: {
            tipo: 'dica',
            texto: 'Cada linha liga uma **coluna do arquivo** a um **campo Gravity** — ajuste no dropdown se a IA errar.',
          },
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_CONFIANCA,
          calloutAntes: {
            tipo: 'dica',
            texto: 'Use a cor da confiança: **≥90%** verde (aceite), **50–89%** amarelo (confira), **<50%** cinza (mapeie ou ignore).',
          },
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_LEMBRAR,
          calloutAntes: {
            tipo: 'dica',
            texto:
              'Se você já importou um arquivo com as **mesmas colunas**, o badge **Mapeamento salvo** indica que a memória foi reaplicada.',
          },
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_VER_DOCUMENTO,
          calloutAntes: {
            tipo: 'dica',
            texto: '**Ver documento** exibe o arquivo original ao lado da tabela — confira o PDF ou a planilha sem sair do modal.',
          },
        },
      ],
    },
    {
      indice: 1,
      tituloEtapa: '**01 — Importar via planilha (preview e resultado):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_FILTROS,
          paragrafoAntes: '**09.** Modal com o **Preview**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_PREVIEW_CARD,
          paragrafoAntes: '**10.** Preview expandido',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_DUPLICATA,
          calloutAntes: {
            tipo: 'dica',
            texto:
              'Pedido **já existente** no workspace? O card exibe aviso de **duplicata** — escolha **Sobrescrever**, **Criar novo** ou **Pular**.',
          },
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_SOBRESCREVER_DIFF,
          calloutAntes: {
            tipo: 'dica',
            texto: 'Ao **Sobrescrever**, o modal exibe o **diff** entre o pedido atual e os dados importados.',
          },
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_RESULTADO,
          paragrafoAntes: '**11.** Resultado e **Confirmação**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_IMPORTAR_ERROS_CSV,
          paragrafoAntes: '**12.** Conferir na **lista**',
        },
      ],
    },
    {
      indice: 1,
      legendaPasso: '02 · Importar via API',
      pilaresImportarFormas: ['02'],
      tituloEtapa: '**02 — Importar via API:**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      textoIntro:
        'No modal de **Novo pedido**, escolha **Importação via API**. A integração usa tokens do **API Cockpit** — crie um token com escopo de Pedido e use-o no ERP ou no conector.',
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MODAL_OPCOES,
          paragrafoAntes: '**01.** Selecione **Importação via API**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS,
          paragrafoAntes: '**02.** No **API Cockpit**, aba **Tokens**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS_NOVO_SETA,
          paragrafoAntes: '**03.** Clique em **Novo token**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS_MODAL_1,
          paragrafoAntes: '**04.** Preencha nome e escopo do token',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS_MODAL_2,
          paragrafoAntes: '**05.** Confirme permissões e produtos',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS_GERAR_SETA,
          paragrafoAntes: '**06.** Gere o token',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_API_COCKPIT_TOKENS_GERAR_OK,
          paragrafoAntes: '**07.** Copie o token — ele dispara pedidos via API',
        },
      ],
    },
    {
      indice: 1,
      legendaPasso: '03 · Importar via Smart Docs',
      pilaresImportarFormas: ['03'],
      tituloEtapa: '**03 — Importar via Smart Docs:**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      textoIntro:
        'No modal de **Novo pedido**, escolha **Smart Docs**. O produto abre o wizard **Nova Leitura** para anexar PDFs ou imagens e extrair pedidos com IA.',
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MODAL_OPCOES,
          paragrafoAntes: '**01.** Selecione **Smart Docs**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_4_PASSOS,
          paragrafoAntes: '**02.** Redirecionamento para **Nova Leitura** (4 passos)',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_GERAL,
          paragrafoAntes: '**03.** Passo 1 — visão geral do wizard',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR,
          paragrafoAntes: '**04.** Área de **anexar** documentos',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXAR_SETA,
          paragrafoAntes: '**05.** Clique para selecionar arquivo',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_SMART_DOCS_NOVA_LEITURA_PASSO_1_ANEXADO,
          paragrafoAntes: '**06.** Documento **anexado** — prossiga para extração',
        },
      ],
    },
    {
      indice: 1,
      legendaPasso: '04 · Criar manual',
      pilaresImportarFormas: ['04'],
      tituloEtapa: '**04 — Criar manual (Novo pedido):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      textoIntro:
        'Wizard em **dois passos**: cabeçalho do pedido (exportador, incoterm, datas) e **itens** um a um. Ideal para POs avulsos ou ajustes pontuais.',
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_SETA,
          paragrafoAntes: '**01.** Selecione **Criar manual**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_1,
          paragrafoAntes: '**02.** Passo 1 — cabeçalho do pedido',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_1_REQUISITOS,
          paragrafoAntes: '**03.** Campos obrigatórios destacados',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_NOVA_SETA,
          paragrafoAntes: '**04.** Exportador inexistente? **Cadastrar novo**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_NOVA_MODAL,
          paragrafoAntes: '**05.** Modal de **novo exportador**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_EXPORTADOR_SELECT,
          paragrafoAntes: '**06.** Exportador selecionado no cabeçalho',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_ITENS,
          paragrafoAntes: '**07.** Passo 2 — **itens** do pedido',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_NCM_1,
          paragrafoAntes: '**08.** Busca de **NCM** no item',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_NCM_2,
          paragrafoAntes: '**09.** NCM selecionado',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_PASSO_2_CRIAR,
          paragrafoAntes: '**10.** Clique em **Criar pedido**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_PEDIDO_MANUAL_SALVO_LISTA,
          paragrafoAntes: '**11.** Pedido **rascunho** visível na Lista',
        },
      ],
    },
    {
      indice: 1,
      tituloEtapa: '**Novo item (manual):**',
      colunas: 1,
      textoAcimaEstiloCorpo: true,
      espacoTextoFiguraPx: 12,
      textoIntro:
        'Para incluir linhas em um pedido **já existente**, use **+ Novo → Novo item**. O fluxo manual adiciona itens sem abrir um PO novo.',
      telas: [
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_SETA,
          paragrafoAntes: '**01.** Na Lista, **+ Novo → Novo item**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MODAL_OPCOES,
          paragrafoAntes: '**02.** Modal com as formas de inclusão de item',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_PASSO_1,
          paragrafoAntes: '**03.** Escolha **Manual** — selecione o pedido destino',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ADICIONAR,
          paragrafoAntes: '**04.** Preencha o item e clique em **Adicionar**',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ITEM_1,
          paragrafoAntes: '**05.** Primeiro item na grade',
        },
        {
          legenda: '',
          imagem: SCREENSHOT_PEDIDO_LISTA_NOVO_ITEM_MANUAL_ITENS_SALVOS,
          paragrafoAntes: '**06.** Itens **salvos** no pedido existente',
        },
      ],
    },
  ],
}
