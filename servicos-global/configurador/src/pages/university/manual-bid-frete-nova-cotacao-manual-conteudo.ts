/**
 * Manual BID Frete § Nova cotação avulsa manual — grades por subtópico (paridade Pedido § Transferir).
 */
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { screenshotBidFreteInt } from './manual-bid-frete-catalogo-screenshots'

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

export const GALERIAS_BID_FRETE_NOVA_COTACAO_ABRIR: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Abrir nova cotação',
    iconesEscopoBidFrete: { preset: 'universal' },
    cenariosAcesso: [
      {
        titulo: 'Via Insight',
        texto: 'Clique no botão **+ novo** na aba **Insights**',
        imagem: S('insight_nova_cotacao_tela_1'),
        printsApos: [
          {
            imagem: S('insight_nova_cotacao_tela_3'),
            paragrafoAntesPrint: 'Clique em **Buscar Frete**',
          },
        ],
      },
      {
        titulo: 'Via Lista',
        texto: 'Clique no botão **+ novo** na lista',
        paragrafoAntesPrint: '**01.** Clique em **Nova cotação** na barra superior',
        imagem: S('lista_cotacao_nova_1'),
        printsApos: [
          {
            imagem: S('insight_nova_cotacao_tela_2'),
            paragrafoAntesPrint: '**02.** Escolha **Manual** em **Cotação avulsa**',
          },
        ],
      },
    ],
    telas: [],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_INICIO_COMUM: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Início comum (passos 05–08)',
    iconesEscopoBidFrete: { preset: 'inicio-comum' },
    textoIntro:
      'Antes de ramificar por **modal** (passo **09**) e por **tipo de carga** (passo **39**), o assistente compartilha cabeçalho e identificação da cotação — **válido para Marítimo, Aéreo e Rodoviário**.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_numero_cotacao', '**05.** Informe o **número da cotação**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao', '**06.** Selecione o **tipo de operação**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_tipo_operacao_selecionado', '**07.** Tipo de operação **selecionado**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal', '**08.** Escolha o **modal de transporte**'),
    ],
    calloutApos: [
      {
        tipo: 'dica',
        texto:
          'Ao selecionar o transporte **Rodoviário**, a plataforma solicitará a escolha entre as modalidades **FTL** e **LTL**. A opção **Aéreo**, por sua vez, não apresenta ramificações na tela.',
      },
    ],
  }),
  grade({
    tituloEtapa: 'Passo 09 — Modal selecionado (três ramos)',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_maritimo', '**09a.** **Marítimo** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_aereo', '**09b.** **Aéreo** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_rodoviario', '**09c.** **Rodoviário** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL', '**10.** Passo 2 — visão geral do modal **Locais**'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — locais Marítimo (portos e endereços)',
    chipBidFreteModalTransporte: 'maritimo',
    textoIntro:
      'No modal **Marítimo**, preencha **portos** preferenciais, locais de origem/destino e avance com **Próximo** antes da etapa de mercadoria.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque', '**11.** Campo **porto de embarque**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionar', '**12.** Abrir seleção de porto'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_selecionado', '**13.** Porto de embarque **selecionado**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais', '**14.** Lista de **portos preferenciais**'),
    ],
  }),
  grade({
    chipBidFreteModalTransporte: 'maritimo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_novo_porto', '**15.** **Adicionar novo porto** preferencial'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_adicionar_porto', '**16.** Fluxo **adicionar porto**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_embarque_portos_preferenciais_novo_porto', '**17.** Novo porto preferencial **preenchido**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_seta', '**18.** Avançar para **porto de destino**'),
    ],
  }),
  grade({
    chipBidFreteModalTransporte: 'maritimo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecao', '**19.** Seleção do **porto de destino**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_selecionado', '**20.** Porto de destino **selecionado**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_seta', '**21.** **Portos preferenciais** de destino'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_adicionar_seta', '**22.** **Adicionar** porto preferencial de destino'),
    ],
  }),
  grade({
    chipBidFreteModalTransporte: 'maritimo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_novo_preenchido', '**23.** Novo porto de destino **preenchido**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_porto_destino_portos_preferenciais_segundo', '**24.** Segundo porto preferencial de destino'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_seta', '**25.** **Local de origem** — seta de foco'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_origem_campos', '**26.** Campos do **local de origem**'),
    ],
  }),
  grade({
    chipBidFreteModalTransporte: 'maritimo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_seta', '**27.** **Local de destino** — seta de foco'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_maritimo_local_destino_campos', '**28.** Campos do **local de destino**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_proximo', '**29.** Clique em **Próximo** (Marítimo)'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — locais Aéreo',
    chipBidFreteModalTransporte: 'aereo',
    textoIntro:
      'Com **Aéreo** selecionado, a etapa **Locais** usa aeroportos e endereços de coleta/entrega — trilha resumida no Drive atual.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_aereo', '**10.** Com **Aéreo** selecionado no passo 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL', '**11.** Etapa **Locais** — aeroportos e endereços'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_proximo', '**12.** **Próximo** para mercadoria e volumes'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — locais Rodoviário',
    chipBidFreteModalTransporte: 'rodoviario',
    textoIntro:
      'No **Rodoviário**, informe trechos e pontos door-to-door na etapa **Locais** antes de seguir para mercadoria.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_rodoviario', '**10.** Com **Rodoviário** selecionado no passo 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL', '**11.** Etapa **Locais** — trechos e pontos'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_proximo', '**12.** **Próximo** para mercadoria e volumes'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_NCM: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo 30 — NCM e mercadoria (comum a todos os modais)',
    textoIntro:
      'A etapa de **mercadoria** é **comum** a todos os modais: **NCM**, **HS Code**, pesquisa no catálogo e **descrição**.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_seta', '**30.** Campo **NCM** — seta'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_seta', '**31.** Abrir **pesquisa NCM**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_modal', '**32.** Modal de **pesquisa NCM**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_resultado', '**33.** Resultado por **código NCM**'),
    ],
  }),
  grade({
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_palavra_resultado', '**34.** Resultado por **palavra-chave**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_pesquisar_ncm_ultima_sincronizacao', '**35.** **Última sincronização** do catálogo NCM'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_ncm_nao_encontrado', '**36.** NCM **não encontrado**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_hs_code', '**37.** Campo **HS Code**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_descricao', '**38.** **Descrição** da mercadoria'),
    ],
    calloutApos: {
      tipo: 'dica',
      texto: 'Do **passo 39** em diante, escolha **FCL**, **LCL** ou **Aéreo/LCL/Rodo** — três ramos abaixo.',
    },
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_FCL: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — tipo de carga FCL',
    chipBidFreteTipoCarga: 'fcl',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_1', '**39.** Selecionar **FCL**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_fcl_tela_2', '**40.** Detalhes do **container FCL**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_fcl_3', '**41.** Revisão **FCL**'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_LCL: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — tipo de carga LCL',
    chipBidFreteTipoCarga: 'lcl',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_1', '**39.** Selecionar **LCL**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_2', '**40.** Volumes **LCL** — linha 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_3', '**41.** Volumes **LCL** — linha 2'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_lcl_tela_4', '**42.** Totais **LCL**'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_AIR_LCL_RODO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo a passo — Aéreo / LCL / Rodoviário (volumes)',
    chipBidFreteTipoCarga: 'air_lcl_rodo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_tela_air_lcl_rodo_quantidade', '**39.** Informar **quantidade** de volumes'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionar_container', '**40.** **Adicionar** volume/container'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_air_lcl_rodo_adicionado_container', '**41.** Volume **adicionado**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_tipo_volume_excluir_container', '**42.** **Excluir** volume/container'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_ENVIO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo 43 — Cubagem, Incoterm e valor alvo (comum aos três tipos de carga)',
    mostrarChipsBidFreteTipoCarga: true,
    textoIntro:
      'Após o tipo de carga, **cubagem**, **Incoterm**, **valor alvo**, **fornecedores** e **envio** seguem a **mesma trilha** para FCL, LCL e Aéreo/LCL/Rodo.',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_1', '**43.** Campo **cubagem** na tela'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal', '**44.** Modal de **cubagem (m³)**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_cubagem_modal_preenchido', '**45.** Cubagem **preenchida**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_incoterm', '**46.** Selecionar **Incoterm**'),
    ],
  }),
  grade({
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_valor_alvo', '**47.** **Valor alvo** da cotação'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_03_proximo', '**48.** **Próximo** — armazéns e locais adicionais'),
    ],
  }),
  grade({
    tituloEtapa: 'Passo 49 — Locais adicionais / armazéns (passo 4)',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal', '**49.** Modal **locais adicionais**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_01', '**50.** Detalhe do modal **passo 4**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_modal_novo_armazem', '**51.** **Novo armazém**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_04_proximo', '**52.** **Próximo** — fornecedores e envio'),
    ],
  }),
  grade({
    tituloEtapa: 'Passo 53 — Fornecedores, visibilidade e prazo',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal', '**53.** Modal **Fornecedores e envio**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_direcionada_aberta', '**54.** **Visibilidade direcionada**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_visibilidade_anonima', '**55.** **Visibilidade anônima**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_calendario', '**56.** **Calendário** — data de vencimento'),
    ],
  }),
  grade({
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_hora', '**57.** **Hora** limite do vencimento'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta', '**58.** **Alterar proposta**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_tela', '**59.** Tela de **edição da proposta**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_alterar_proposta_configuracaoes', '**60.** **Configurações** da proposta'),
    ],
  }),
  grade({
    tituloEtapa: 'Passo 61 — Envio aos fornecedores',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_1', '**61.** Revisão do **envio**'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar', '**62.** **Editar** envio'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_1', '**63.** Editar contato — tela 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_editar_2', '**64.** Editar contato — tela 2'),
    ],
  }),
  grade({
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_excluir_1', '**65.** **Excluir** destinatário'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_1', '**66.** **Adicionar e-mail** — passo 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_adicionar_email_2', '**67.** **Adicionar e-mail** — passo 2'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_05_modal_envio_selecionar_fornecedores_emails', '**68.** **Selecionar fornecedores** e e-mails'),
    ],
  }),
  grade({
    tituloEtapa: 'Passo 69 — Confirmação (passo 6 do wizard)',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_1', '**69.** Modal **passo 6** — confirmação 1'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_06_modal_2', '**70.** Modal **passo 6** — confirmação 2'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_gerada_aviso', '**71.** Aviso — **cotação gerada**'),
    ],
  }),
]

export const GALERIAS_BID_FRETE_NOVA_COTACAO_RESULTADO: GaleriaNovaCotacao[] = [
  grade({
    infograficoBidFreteNovaCotacaoResultadoEsperado: true,
    telas: [],
  }),
  grade({
    tituloEtapa: 'Conferir na Lista após o envio',
    textoIntro:
      'Ao concluir o wizard, confira o aviso de **cotação gerada**, a nova linha na **Lista** e o status **solicitação enviada** aos fornecedores.',
    colunas: 3,
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao', '**72.** **Processo de cotação** na Lista'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_processo_cotacao_solicitacao', '**73.** Status **solicitação enviada** aos fornecedores'),
    ],
  }),
]

/** §4.01 — abrir nova cotação (Via Insight / Via Lista) até escolher Manual. */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_VISAO_GERAL: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_ABRIR,
]

const FLUXO_INICIO_AO_FIM_CABECALHO = {
  tituloEtapa: 'Iniciando o fluxo manual',
  textoIntro:
    'Para acessar a tela principal, clique primeiro no botão **+ Novo**, direcione para o menu **Cotação Avulsa** e finalize clicando na opção **Manual**.',
  chipBidFreteFormaManual: true,
  iconesEscopoBidFrete: { preset: 'inicio-comum' as const },
  colunas: 1,
}

/** §4.02.01 — 1º tópico: acesso pelo menu (+ Novo → Cotação Avulsa → Manual). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_FLUXO_INICIO_AO_FIM: GaleriaNovaCotacao = grade({
  ...FLUXO_INICIO_AO_FIM_CABECALHO,
  telas: [fig('lista_cotacao_nova_cotacao_avulsa_manual', '')],
})

/** §4.02.01 — 2º tópico: passo Modal e Operação (wizard + infográfico de campos). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_FLUXO_INICIO_AO_FIM_RECAP: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Modal e Operação',
  textoIntro:
    'Esta tela é o primeiro passo do formulário, definindo o número da cotação, o tipo de operação e o modal de transporte. Logo abaixo, cada campo será explicado detalhadamente.',
  chipBidFreteFormaManual: true,
  iconesEscopoBidFrete: { preset: 'inicio-comum' as const },
  colunas: 1,
  telas: [fig('cotacao_avulsa', '')],
  infograficoBidFreteModalOperacaoCampos: true,
  textoAposInfograficoBidFreteModalOperacaoCampos:
    'A imagem a seguir ilustra como a tela se comporta e valida os dados logo após você concluir as suas escolhas de preenchimento.',
  telasAposInfograficoBidFreteModalOperacaoCampos: [fig('manual_modal_operaca', '')],
  calloutApos: [
    {
      tipo: 'dica',
      texto:
        'Ao selecionar o transporte **Rodoviário**, a plataforma solicitará a escolha entre as modalidades **FTL** e **LTL**. A opção **Aéreo**, por sua vez, não apresenta ramificações na tela.',
    },
  ],
})

/** §4.02.01 — 3º tópico: origem e destino (após Modal e Operação). */
export const GALERIA_BID_FRETE_NOVA_COTACAO_ORIGEM_DESTINO: GaleriaNovaCotacao = grade({
  tituloEtapa: 'Origem e Destino',
  textoIntro: 'Tela para seleção e configuração da origem e destino',
  chipBidFreteFormaManual: true,
  iconesEscopoBidFrete: { preset: 'inicio-comum' as const },
  colunas: 1,
  telas: [fig('manual_origem_destino', '')],
  infograficoBidFreteOrigemDestinoCampos: true,
  textoAposInfograficoBidFreteOrigemDestinoCampos:
    'Acompanhe nas imagens a seguir como configurar o local de origem. O exemplo ilustra uma operação marítima para demonstrar a lógica padrão de busca e seleção.',
  telasAposInfograficoBidFreteOrigemDestinoCampos: [
    fig('manual_origem_porto_origem', '**11.** Campo **porto de origem**'),
    fig('manual_origem_porto_origem_pais', '**12.** Seleção de **país**'),
    fig('manual_origem_porto_origem_preferencias', '**13.** **Portos preferenciais**'),
    fig('manual_origem_porto_origem_dados_pais_cidade_estado', '**14.** Dados de **país, cidade e estado**'),
  ],
  calloutEntreTelasAposInfograficoBidFreteOrigemDestinoCampos: [
    {
      tipo: 'dica',
      texto:
        'Acelere o preenchimento do formulário buscando o local desejado pelo **nome exato ou pelas iniciais**.',
    },
    {
      tipo: 'dica',
      texto:
        'Pesquise diretamente pelo **nome do país** para listar todos os portos ou aeroportos associados a ele.',
    },
  ],
  calloutApos: [
    {
      tipo: 'dica',
      texto:
        'Caso precise cotar a **coleta na origem**, como em operações **EXW** na importação, marque a opção *_Exibir campos: País de origem, Estado ou Província de origem, Cidade de origem_*.',
    },
    {
      tipo: 'dica',
      texto:
        'Clique em *_Selecione portos próximos que você aceita na proposta, além do porto de preferência acima._*',
    },
  ],
})

/** §4.02.01 — passo 09 (três ramos por modal), após Modal e Operação. */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_MODAL_SELECIONADO: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Passo 09 — Modal selecionado (três ramos)',
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_maritimo', '**09a.** **Marítimo** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_aereo', '**09b.** **Aéreo** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_01_modal_selecionado_rodoviario', '**09c.** **Rodoviário** selecionado'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual_passo_02_MODAL', '**10.** Passo 2 — visão geral do modal **Locais**'),
    ],
  }),
]

/** §4.02.01 — wizard manual: início, Modal e Operação, origem/destino e resultado. */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL_WIZARD: GaleriaNovaCotacao[] = [
  GALERIA_BID_FRETE_NOVA_COTACAO_FLUXO_INICIO_AO_FIM,
  GALERIA_BID_FRETE_NOVA_COTACAO_FLUXO_INICIO_AO_FIM_RECAP,
  GALERIA_BID_FRETE_NOVA_COTACAO_ORIGEM_DESTINO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_RESULTADO,
]

/** §4.02.01.x — ramo Marítimo (locais + FCL + LCL), após wizard comum. */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO_RAMO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_FCL,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_LCL,
]

/** §4.02.01.x — ramo Aéreo (locais + volumes). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO_RAMO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_AIR_LCL_RODO,
]

/** §4.02.01.x — ramo Rodoviário (locais + volumes). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO_RAMO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_AIR_LCL_RODO,
]

/** §4.02–4.04 — trilha pós-visão geral (legado / compat). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_POS_VISAO_GERAL: GaleriaNovaCotacao[] = [
  grade({
    tituloEtapa: 'Wizard Nova cotação avulsa manual',
    colunas: 2,
    telas: [
      fig('lista_cotacao_nova_cotacao_avulsa_', '**03.** Atalho **Cotação avulsa** no menu'),
      fig('lista_cotacao_nova_cotacao_avulsa_manual', '**04.** Wizard **Nova cotação avulsa manual** aberto'),
    ],
  }),
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_INICIO_COMUM,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_NCM,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_ENVIO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_RESULTADO,
]

/** §4.02 — trilha comum pós-visão + locais Marítimo + bifurcação FCL e LCL (legado). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO_COMPLETO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_POS_VISAO_GERAL,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO_RAMO,
]

/** §4.03 — locais Aéreo + volumes (legado). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO_COMPLETO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO_RAMO,
]

/** §4.04 — locais Rodoviário + volumes (legado). */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO_COMPLETO: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO_RAMO,
]

/** @deprecated Use exports por subtópico — mantido para compatibilidade de import. */
export const GALERIAS_BID_FRETE_NOVA_COTACAO_MANUAL: GaleriaNovaCotacao[] = [
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_VISAO_GERAL,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_MARITIMO_COMPLETO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_AEREO_COMPLETO,
  ...GALERIAS_BID_FRETE_NOVA_COTACAO_RODOVIARIO_COMPLETO,
]
