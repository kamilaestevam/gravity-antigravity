/**
 * Manual BID Frete § Nova cotação avulsa via Smart Docs — grades por subtópico.
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'
import { MANUAL_ESPACO_FRASE_IMAGEM_PX } from './manual-tipografia'

type GaleriaNovaCotacao = NonNullable<DocPassoVisual['galeriaComparacaoAposParagrafo']>[number]

const S = screenshotBidFreteInt

function fig(sufixoDrive: string, paragrafoAntes: string) {
  return { legenda: '', imagem: S(sufixoDrive), paragrafoAntes }
}

function grade(
  partial: Omit<GaleriaNovaCotacao, 'indice' | 'telas'> & { telas: ReturnType<typeof fig>[] },
): GaleriaNovaCotacao {
  return { indice: 0, colunas: 4, textoAcimaEstiloCorpo: true, ...partial }
}

const FLUXO_SMART_DOC_CABECALHO = {
  tituloEtapa: 'Iniciando o fluxo Smart Docs',
  textoIntro:
    'Para acessar a tela principal, clique primeiro no botão **+ Novo**, direcione para o menu **Cotação Avulsa** e finalize clicando na opção **Smart Docs**.',
  iconesEscopoBidFrete: { preset: 'inicio-comum' as const },
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
}

/** Acesso pelo menu (+ Novo → Cotação Avulsa → Smart Docs). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_INICIO: GaleriaNovaCotacao = grade({
  ...FLUXO_SMART_DOC_CABECALHO,
  telas: [fig('nova_via_smart_doc_acesso', '')],
})

/** Wizard Smart Docs — passos 1 a 3 (Anexar, Análise, Conferência). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_LEITURA: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Nova Leitura Smart Docs',
  textoIntro:
    'O produto abre o wizard **Smart Docs** em quatro passos. Anexe o documento comercial, aguarde a **análise da IA** e confira os campos na **Conferência** antes de montar a cotação.',
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
  telas: [
    fig('nova_via_smart_doc_passo_1', '**01.** Passo 1 — **Anexar arquivo** (clique ou arraste o documento)'),
    fig(
      'nova_via_smart_doc_passo_2',
      '**02.** Passo 2 — **Análise do arquivo** concluída: clique em **Continuar**',
    ),
    fig(
      'nova_via_smart_doc_passo_3',
      '**03.** Passo 3 — **Conferência** dos campos extraídos pela IA',
    ),
  ],
  calloutApos: [
    {
      tipo: 'dica',
      texto:
        'Formatos aceitos: **PDF**, imagens, **XML**, **CSV** e planilhas — até **50 MB** por arquivo.',
    },
  ],
})

/** Passo 4 — combinar documentos e abrir revisão das cotações. */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_COMBINAR: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Combinar documentos nas cotações',
  textoIntro:
    'No passo **Resultado das leituras**, arraste **invoice** e **packing** do mesmo embarque para a **mesma coluna**. Use **Nova cotação** se precisar de outro agrupamento.',
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
  telas: [
    fig(
      'nova_via_smart_doc_passo_4_ajuste_leituras_para_cotacao',
      '**04.** Arraste os documentos do mesmo embarque para **uma coluna**',
    ),
    fig(
      'nova_via_smart_doc_passo_4_nova_cotacao_documentos_analisados',
      '**05.** Opcional: clique em **Nova cotação** para criar outro agrupamento',
    ),
    fig(
      'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes',
      '**06.** Clique em **Revisar cotações** para conferir os dados de cada uma',
    ),
    fig(
      'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_menu_selecionar_cotacao',
      '**07.** Alterne entre as **abas** de cotação e preencha os campos obrigatórios',
    ),
  ],
})

/** Passo 4 — campos obrigatórios antes de abrir o wizard no BID. */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_CAMPOS: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Campos obrigatórios da cotação',
  textoIntro:
    'Cada aba exibe a origem do dado (**EXTRAÍDO**, **SUGERIDO**, **EDITADO** ou **PENDENTE**). Campos com asterisco (*) são obrigatórios para avançar.',
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
  telas: [
    fig(
      'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar',
      '**08.** Campos **PENDENTES** podem ser completados aqui ou no passo **Resumo** do wizard',
    ),
    fig(
      'nova_via_smart_doc_passo_4_nova_cotacao_botao_revisar_cotacoes_campos_obrigatorios_para_avancar_aviso_falta_campos',
      '**09.** Sem os obrigatórios preenchidos, a plataforma exibe **Não é possível continuar ainda**',
    ),
  ],
  calloutApos: [
    {
      tipo: 'dica',
      texto:
        'Ao clicar em **Continuar cotação X de Y**, o BID Frete abre o wizard **Nova Cotação** pré-preenchido — uma cotação por vez, em sequência.',
    },
  ],
})

/** Wizard Nova cotação — passo Fornecedores (pré-preenchido pela leitura). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_FORNECEDORES: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Fornecedores e envio',
  textoIntro:
    'Com os dados da leitura, o assistente **Nova Cotação de Frete Internacional** abre no passo **Fornecedores**. Defina prazo, visibilidade e quem receberá o pedido.',
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
  telas: [
    fig(
      'nova_via_smart_doc_passo_5_revisao_fornecedores_1',
      '**10.** Prazo para respostas, edição da proposta e **visibilidade** da cotação',
    ),
    fig(
      'nova_via_smart_doc_passo_5_revisao_fornecedores_2',
      '**11.** Selecione os **fornecedores** e o canal **E-mail**; clique em **Próximo**',
    ),
  ],
})

/** Resumo, confirmação e Painel da Cotação. */
export const GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_RESULTADO: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Resumo, confirmação e Painel',
  textoIntro:
    'Revise o **Resumo**, crie a cotação e acompanhe o envio aos fornecedores. Use **Ir para cotação** para abrir o **Painel da Cotação**.',
  colunas: 1,
  espacoTextoFiguraPx: MANUAL_ESPACO_FRASE_IMAGEM_PX,
  telas: [
    fig(
      'nova_via_smart_doc_passo_6_revisao_final',
      '**12.** Passo **Resumo**: confira os dados e clique em **Criar Cotação**',
    ),
    fig(
      'nova_via_smart_doc_passo_6_confirmacao',
      '**13.** Confirmação de **cotação criada** e envio aos fornecedores',
    ),
    fig(
      'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao',
      '**14.** Clique em {{botao:ir-para-cotacao-bid-frete}} para abrir o **Painel da Cotação**',
    ),
    fig(
      'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_1',
      '**15.** **Painel da Cotação** — visão geral com status **Enviada**',
    ),
    fig(
      'nova_via_smart_doc_passo_6_confirmacao_ir_painel_cotacao_2',
      '**16.** Aba **Solicitação de Cotação** — acompanhe o envio por fornecedor',
    ),
  ],
})

/** §4.02.02 — trilha completa Cotação avulsa via Smart Docs (17 prints). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_SMART_DOC: GaleriaNovaCotacao[] = [
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_INICIO,
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_LEITURA,
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_COMBINAR,
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_CAMPOS,
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_FORNECEDORES,
  GALERIA_BID_FRETE_NOVA_COTACAO_SMART_DOC_RESULTADO,
]
