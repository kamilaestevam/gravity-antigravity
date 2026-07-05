import type { TFunction } from 'i18next'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import type { TipoPassoWizardNovaCotacao } from './armazenagem-lcl-maritimo-bid-frete-internacional'
import {
  type ModalFrete,
  type ModalidadeCarga,
  type TipoOperacao,
  type Visibilidade,
} from './types'
import {
  traduzirModalKanbanBidFrete,
  traduzirModalidadeKanbanBidFrete,
  traduzirOperacaoKanbanBidFrete,
} from './traduzir-kanban-bid-frete-internacional'

const INCOTERM_SUFIXO_CHAVE: Record<string, string> = {
  EXW: 'Exw',
  FCA: 'Fca',
  CPT: 'Cpt',
  CIP: 'Cip',
  DAP: 'Dap',
  DPU: 'Dpu',
  DDP: 'Ddp',
  FAS: 'Fas',
  FOB: 'Fob',
  CFR: 'Cfr',
  CIF: 'Cif',
}

export const INCOTERM_GRUPOS_CODIGOS: Array<{ chave: string; itens: readonly string[] }> = [
  { chave: 'incoterm_grupo_e', itens: ['EXW', 'FCA'] },
  { chave: 'incoterm_grupo_f', itens: ['FAS', 'FOB'] },
  { chave: 'incoterm_grupo_c', itens: ['CFR', 'CIF', 'CPT', 'CIP'] },
  { chave: 'incoterm_grupo_d', itens: ['DAP', 'DPU', 'DDP'] },
]

export const INCOTERM_TODOS_NOVA_COTACAO = INCOTERM_GRUPOS_CODIGOS.flatMap((grupo) => grupo.itens)

const GRUPO_CHAVE_POR_INCOTERM: Record<string, string> = Object.fromEntries(
  INCOTERM_GRUPOS_CODIGOS.flatMap((grupo) => grupo.itens.map((inc) => [inc, grupo.chave])),
)

const EMBALAGEM_CODIGOS = [
  'UNIDADE',
  'CAIXA',
  'PALLET',
  'VOLUME',
  'FARDO',
  'SACO',
  'TAMBOR',
  'BIG_BAG',
] as const

type LadoLocalizacaoWizard = 'origem' | 'destino'

export function traduzirPassoWizardNovaCotacao(
  t: TFunction,
  tipo: TipoPassoWizardNovaCotacao,
): string {
  const chaves: Record<TipoPassoWizardNovaCotacao, { key: string; defaultValue: string }> = {
    modal: { key: 'bidfrete.nova_cotacao.stepModalOperacao', defaultValue: 'Modal e Operação' },
    origem: { key: 'bidfrete.nova_cotacao.step_origem_destino', defaultValue: 'Origem e Destino' },
    carga: { key: 'bidfrete.nova_cotacao.step_carga_incoterm', defaultValue: 'Carga e Incoterm' },
    armazenagem: { key: 'bidfrete.nova_cotacao.step_armazenagem', defaultValue: 'Armazenagem' },
    fornecedores: { key: 'bidfrete.nova_cotacao.stepFornecedores', defaultValue: 'Fornecedores' },
    resumo: { key: 'bidfrete.nova_cotacao.stepResumo', defaultValue: 'Resumo' },
  }
  const { key, defaultValue } = chaves[tipo]
  return t(key, { defaultValue })
}

export function traduzirOperacaoNovaCotacao(t: TFunction, operacao: TipoOperacao): string {
  return traduzirOperacaoKanbanBidFrete(t, operacao)
}

export function traduzirDescOperacaoNovaCotacao(t: TFunction, operacao: TipoOperacao): string {
  if (operacao === 'IMPORTACAO') {
    return t('bidfrete.nova_cotacao.operacao_desc_importacao', {
      defaultValue: 'Trazer cargas de outros países para o território nacional.',
    })
  }
  return t('bidfrete.nova_cotacao.operacao_desc_exportacao', {
    defaultValue: 'Enviar produtos nacionais para compradores internacionais.',
  })
}

export function traduzirModalNovaCotacao(t: TFunction, modal: ModalFrete): string {
  return traduzirModalKanbanBidFrete(t, modal)
}

export function traduzirDescModalNovaCotacao(t: TFunction, modal: ModalFrete): string {
  const map: Record<ModalFrete, { key: string; defaultValue: string }> = {
    MARITIMO: {
      key: 'bidfrete.nova_cotacao.modal_desc_maritimo',
      defaultValue: 'Alto volume, menor custo',
    },
    AEREO: {
      key: 'bidfrete.nova_cotacao.modal_desc_aereo',
      defaultValue: 'Entrega rápida e expressa',
    },
    RODOVIARIO: {
      key: 'bidfrete.nova_cotacao.modal_desc_rodoviario',
      defaultValue: 'Flexível e porta a porta',
    },
  }
  const { key, defaultValue } = map[modal]
  return t(key, { defaultValue })
}

export function traduzirLabelModalidadeNovaCotacao(
  t: TFunction,
  modalidade: ModalidadeCarga,
): string {
  const map: Partial<Record<ModalidadeCarga, { key: string; defaultValue: string }>> = {
    FCL: { key: 'bidfrete.nova_cotacao.label_fcl_completo', defaultValue: 'FCL — Container Completo' },
    LCL: { key: 'bidfrete.nova_cotacao.label_lcl_fracionada', defaultValue: 'LCL — Carga Fracionada' },
    RODOVIARIO_FTL: { key: 'bidfrete.nova_cotacao.labelFtl', defaultValue: 'FTL — Carga Completa' },
    RODOVIARIO_LTL: { key: 'bidfrete.nova_cotacao.labelLtl', defaultValue: 'LTL — Carga Fracionada' },
    AEREO_GERAL: { key: 'bidfrete.nova_cotacao.labelAereoGeral', defaultValue: 'Aéreo Geral' },
  }
  const entry = map[modalidade]
  if (entry) {
    return t(entry.key, { defaultValue: entry.defaultValue })
  }
  return traduzirModalidadeKanbanBidFrete(t, modalidade)
}

export function traduzirDescModalidadeNovaCotacao(
  t: TFunction,
  modalidade: ModalidadeCarga,
): string {
  const map: Record<ModalidadeCarga, { key: string; defaultValue: string }> = {
    FCL: {
      key: 'bidfrete.nova_cotacao.descFcl',
      defaultValue: 'Container completo e exclusivo para acomodar suas mercadorias.',
    },
    LCL: {
      key: 'bidfrete.nova_cotacao.descLcl',
      defaultValue: 'Carga fracionada. Pague somente pelo volume que ocupar no container.',
    },
    AEREO_GERAL: {
      key: 'bidfrete.nova_cotacao.descAereoGeral',
      defaultValue: 'Envio aéreo padrão para cargas gerais em compartimentos dedicados.',
    },
    RODOVIARIO_FTL: {
      key: 'bidfrete.nova_cotacao.descRodoviarioFtl',
      defaultValue: 'Caminhão inteiro e exclusivo dedicado para a sua logística.',
    },
    RODOVIARIO_LTL: {
      key: 'bidfrete.nova_cotacao.descRodoviarioLtl',
      defaultValue: 'Carga rodoviária fracionada consolidada com outros embarques.',
    },
  }
  const { key, defaultValue } = map[modalidade]
  return t(key, { defaultValue })
}

export function traduzirIncotermGrupoNovaCotacao(t: TFunction, chaveGrupo: string): string {
  const defaults: Record<string, string> = {
    incoterm_grupo_e: 'Grupo E — Saída do vendedor',
    incoterm_grupo_f: 'Grupo F — Principal não pago (marítimo)',
    incoterm_grupo_c: 'Grupo C — Principal pago',
    incoterm_grupo_d: 'Grupo D — Entrega no destino',
  }
  return t(`bidfrete.nova_cotacao.${chaveGrupo}`, {
    defaultValue: defaults[chaveGrupo] ?? chaveGrupo,
  })
}

export function traduzirIncotermExplicacaoNovaCotacao(
  t: TFunction,
  inc: string,
): { titulo: string; desc: string; responsabilidade: string } | null {
  const sufixo = INCOTERM_SUFIXO_CHAVE[inc]
  if (!sufixo) return null

  const tituloPadrao = INCOTERM_EXPLANATIONS_PT[inc]?.title ?? inc
  const descPadrao = INCOTERM_EXPLANATIONS_PT[inc]?.desc ?? ''
  const respPadrao = INCOTERM_EXPLANATIONS_PT[inc]?.responsabilidade ?? ''

  return {
    titulo: t(`bidfrete.nova_cotacao.incoterm${sufixo}Title`, { defaultValue: tituloPadrao }),
    desc: t(`bidfrete.nova_cotacao.incoterm${sufixo}Desc`, { defaultValue: descPadrao }),
    responsabilidade: t(`bidfrete.nova_cotacao.incoterm${sufixo}Resp`, { defaultValue: respPadrao }),
  }
}

export function traduzirTooltipIncotermNovaCotacao(
  t: TFunction,
  inc: string,
): {
  titulo: string
  grupo: string
  desc: string
  responsabilidade: string
  interativo: boolean
} {
  const chaveGrupo = GRUPO_CHAVE_POR_INCOTERM[inc]
  const grupo = chaveGrupo ? traduzirIncotermGrupoNovaCotacao(t, chaveGrupo) : ''
  const explicacao = traduzirIncotermExplicacaoNovaCotacao(t, inc)

  if (!explicacao) {
    return { titulo: inc, grupo, desc: grupo, responsabilidade: '', interativo: false }
  }

  return {
    titulo: explicacao.titulo,
    grupo,
    desc: explicacao.desc,
    responsabilidade: explicacao.responsabilidade,
    interativo: true,
  }
}

export function traduzirOpcoesSimNaoNovaCotacao(t: TFunction): SelectOpcao[] {
  return [
    { valor: 'sim', rotulo: t('bidfrete.nova_cotacao.sim', { defaultValue: 'Sim' }) },
    { valor: 'nao', rotulo: t('bidfrete.nova_cotacao.nao', { defaultValue: 'Não' }) },
  ]
}

export function traduzirOpcoesUnidadeEmbalagemNovaCotacao(t: TFunction): SelectOpcao[] {
  return EMBALAGEM_CODIGOS.map((codigo) => ({
    valor: codigo,
    rotulo: traduzirRotuloUnidadeEmbalagemNovaCotacao(t, codigo),
  }))
}

export function traduzirRotuloUnidadeEmbalagemNovaCotacao(t: TFunction, codigo: string): string {
  const defaults: Record<string, string> = {
    UNIDADE: 'Unidade (UN)',
    CAIXA: 'Caixa',
    PALLET: 'Palete / Pallet',
    VOLUME: 'Volume',
    FARDO: 'Fardo',
    SACO: 'Saco / Bag',
    TAMBOR: 'Tambor',
    BIG_BAG: 'Big Bag',
  }
  return t(`bidfrete.nova_cotacao.embalagem_${codigo.toLowerCase()}`, {
    defaultValue: defaults[codigo] ?? codigo,
  })
}

export function traduzirFraseExibirCamposLocalizacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
): string {
  return t(
    lado === 'origem'
      ? 'bidfrete.nova_cotacao.exibir_campos_origem'
      : 'bidfrete.nova_cotacao.exibir_campos_destino',
    {
      defaultValue:
        lado === 'origem'
          ? 'Exibir campos: cidade, estado/província e país de origem para cotações de coleta na origem (EXW)'
          : 'Exibir campos: cidade, estado/província e país de destino para cotações de coleta (EXW)',
    },
  )
}

export function traduzirFraseOpcaoPortoAeroportoLocalizacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
): string {
  return t(
    lado === 'origem'
      ? 'bidfrete.nova_cotacao.opcao_porto_aeroporto_origem'
      : 'bidfrete.nova_cotacao.opcao_porto_aeroporto_destino',
    {
      defaultValue:
        lado === 'origem'
          ? 'Incluir mais opções para Porto/Aeroporto de Origem'
          : 'Incluir mais opções para Porto/Aeroporto de Destino',
    },
  )
}

export function traduzirLegendaOpcaoPortoAeroportoLocalizacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
  tipo: 'aeroporto' | 'porto',
): string {
  const keys: Record<LadoLocalizacaoWizard, Record<typeof tipo, { key: string; defaultValue: string }>> = {
    origem: {
      porto: {
        key: 'bidfrete.nova_cotacao.legenda_opcao_porto_origem',
        defaultValue:
          'Além do porto principal, aceito cotações para outros portos próximos.',
      },
      aeroporto: {
        key: 'bidfrete.nova_cotacao.legenda_opcao_aeroporto_origem',
        defaultValue: 'Além do aeroporto principal, aceito cotações para outros aeroportos próximos.',
      },
    },
    destino: {
      porto: {
        key: 'bidfrete.nova_cotacao.legenda_opcao_porto_destino',
        defaultValue: 'Além do porto principal, aceito cotações para outros portos próximos.',
      },
      aeroporto: {
        key: 'bidfrete.nova_cotacao.legenda_opcao_aeroporto_destino',
        defaultValue: 'Além do aeroporto principal, aceito cotações para outros aeroportos próximos.',
      },
    },
  }
  const { key, defaultValue } = keys[lado][tipo]
  return t(key, { defaultValue })
}

export function traduzirCampoLocaisOpcionaisLocalizacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
  tipo: 'aeroporto' | 'porto',
): string {
  const keys: Record<LadoLocalizacaoWizard, Record<typeof tipo, { key: string; defaultValue: string }>> = {
    origem: {
      porto: { key: 'bidfrete.nova_cotacao.campo_portos_opcionais_origem', defaultValue: 'PORTOS ALTERNATIVOS ACEITOS' },
      aeroporto: { key: 'bidfrete.nova_cotacao.campo_aeroportos_opcionais_origem', defaultValue: 'AEROPORTOS ALTERNATIVOS ACEITOS' },
    },
    destino: {
      porto: { key: 'bidfrete.nova_cotacao.campo_portos_opcionais_destino', defaultValue: 'PORTOS ALTERNATIVOS ACEITOS' },
      aeroporto: { key: 'bidfrete.nova_cotacao.campo_aeroportos_opcionais_destino', defaultValue: 'AEROPORTOS ALTERNATIVOS ACEITOS' },
    },
  }
  const { key, defaultValue } = keys[lado][tipo]
  return t(key, { defaultValue })
}

export function traduzirLegendaLocalizacaoNovaCotacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
  tipo: 'aeroporto' | 'porto' | 'rodoviario',
): string {
  const keys: Record<LadoLocalizacaoWizard, Record<typeof tipo, { key: string; defaultValue: string }>> = {
    origem: {
      aeroporto: {
        key: 'bidfrete.nova_cotacao.legenda_origem_aeroporto',
        defaultValue:
          'Informe o aeroporto de partida. Marque a opção abaixo se precisar complementar endereço ou país.',
      },
      porto: {
        key: 'bidfrete.nova_cotacao.legenda_origem_porto',
        defaultValue:
          'Informe o porto de embarque. Marque a opção abaixo se precisar complementar endereço ou país.',
      },
      rodoviario: {
        key: 'bidfrete.nova_cotacao.legenda_origem_rodoviario',
        defaultValue: 'Informe país, estado/província e cidade de coleta (América Latina).',
      },
    },
    destino: {
      aeroporto: {
        key: 'bidfrete.nova_cotacao.legenda_destino_aeroporto',
        defaultValue:
          'Informe o aeroporto de chegada. Marque a opção abaixo se precisar complementar endereço ou país.',
      },
      porto: {
        key: 'bidfrete.nova_cotacao.legenda_destino_porto',
        defaultValue:
          'Informe o porto de destino. Marque a opção abaixo se precisar complementar endereço ou país.',
      },
      rodoviario: {
        key: 'bidfrete.nova_cotacao.legenda_destino_rodoviario',
        defaultValue: 'Informe país, estado/província e cidade de entrega (América Latina).',
      },
    },
  }
  const { key, defaultValue } = keys[lado][tipo]
  return t(key, { defaultValue })
}

export function traduzirTituloLocalizacaoNovaCotacao(
  t: TFunction,
  lado: LadoLocalizacaoWizard,
  tipo: 'aeroporto' | 'porto' | 'rodoviario',
): string {
  if (tipo === 'porto') {
    return t(
      lado === 'origem'
        ? 'bidfrete.nova_cotacao.porto_origem'
        : 'bidfrete.nova_cotacao.porto_destino',
      {
        defaultValue: lado === 'origem' ? 'Porto / Aeroporto de Origem' : 'Porto / Aeroporto de Destino',
      },
    )
  }
  if (tipo === 'aeroporto') {
    return t(
      lado === 'origem'
        ? 'bidfrete.nova_cotacao.titulo_aeroporto_origem'
        : 'bidfrete.nova_cotacao.titulo_aeroporto_destino',
      {
        defaultValue: lado === 'origem' ? 'Aeroporto de Origem' : 'Aeroporto de Destino',
      },
    )
  }
  return t(
    lado === 'origem'
      ? 'bidfrete.nova_cotacao.titulo_local_rodoviario_origem'
      : 'bidfrete.nova_cotacao.titulo_local_rodoviario_destino',
    {
      defaultValue: lado === 'origem' ? 'Local rodoviário de Origem' : 'Local rodoviário de Destino',
    },
  )
}

export function traduzirRotuloResumoVisibilidadeNovaCotacao(
  t: TFunction,
  visibilidade: Visibilidade,
  anonima: boolean,
): string {
  if (visibilidade === 'DIRECIONADA') {
    return t('bidfrete.nova_cotacao.resumo_visibilidade_direcionada', {
      defaultValue: 'Direcionada — apenas os fornecedores selecionados recebem a cotação',
    })
  }
  if (anonima) {
    return t('bidfrete.nova_cotacao.resumo_visibilidade_aberta_anonima', {
      defaultValue: 'Aberta (Anônima) — o nome da sua empresa ficará oculto para os fornecedores',
    })
  }
  return t('bidfrete.nova_cotacao.resumo_visibilidade_aberta_identificada', {
    defaultValue: 'Aberta — todos os fornecedores elegíveis verão o nome da sua empresa',
  })
}

export function traduzirRotuloArmazenagemResumoNovaCotacao(
  t: TFunction,
  opcao: '' | 'sim' | 'nao',
): string {
  if (opcao === 'sim') {
    return t('bidfrete.nova_cotacao.resumo_incluir_armazenagem', {
      defaultValue: 'Incluir armazenagem',
    })
  }
  if (opcao === 'nao') {
    return t('bidfrete.nova_cotacao.resumo_nao_incluir_armazenagem', {
      defaultValue: 'Não incluir armazenagem',
    })
  }
  return '—'
}

export function traduzirErroCriarCotacaoNovaCotacao(t: TFunction, detalhe: string): string {
  return t('bidfrete.nova_cotacao.erro_criar_cotacao', {
    defaultValue: 'Erro ao criar cotação: {{detalhe}}',
    detalhe,
  })
}

export function traduzirDisparoNaoConfiguradoNovaCotacao(t: TFunction): {
  titulo: string
  detalhe: string
} {
  return {
    titulo: t('bidfrete.nova_cotacao.disparo_nao_configurado', {
      defaultValue: 'Disparo não configurado',
    }),
    detalhe: t('bidfrete.nova_cotacao.disparo_nao_configurado_detalhe', {
      defaultValue: 'Marque ao menos um canal (E-mail) e selecione fornecedores no passo anterior.',
    }),
  }
}

export function traduzirDisparoNaoRealizadoNovaCotacao(t: TFunction): {
  titulo: string
  detalhe: string
} {
  return {
    titulo: t('bidfrete.nova_cotacao.disparo_nao_realizado', {
      defaultValue: 'Disparo não realizado',
    }),
    detalhe: t('bidfrete.nova_cotacao.disparo_nao_realizado_detalhe', {
      defaultValue: 'Nenhum fornecedor selecionado para envio.',
    }),
  }
}

/** Textos PT usados como defaultValue — espelham INCOTERM_EXPLANATIONS do modal. */
const INCOTERM_EXPLANATIONS_PT: Record<
  string,
  { title: string; desc: string; responsabilidade: string }
> = {
  EXW: {
    title: 'EXW — Ex Works (Na Origem)',
    desc: 'O comprador assume todos os custos e riscos a partir do estabelecimento do vendedor (coleta, porto de origem, frete internacional e taxas).',
    responsabilidade: 'Comprador assume 100% da cadeia logística.',
  },
  FCA: {
    title: 'FCA — Free Carrier (Franco Transportador)',
    desc: 'O vendedor realiza o desembaraço de exportação e entrega a carga no local/transportador indicado na origem pelo comprador.',
    responsabilidade: 'Vendedor desembaraça na origem; comprador assume a partir da entrega ao transportador.',
  },
  CPT: {
    title: 'CPT — Carriage Paid To (Transporte Pago Até)',
    desc: 'O vendedor contrata e paga o frete principal até o ponto acordado. Porém, os riscos passam ao comprador na entrega ao primeiro transportador.',
    responsabilidade: 'Custos com o vendedor; riscos de perda ou dano com o comprador durante o transporte.',
  },
  CIP: {
    title: 'CIP — Carriage and Insurance Paid To (Transporte e Seguro Pagos Até)',
    desc: 'Idêntico ao CPT, mas o vendedor é responsável por contratar e pagar um seguro de transporte contra perda ou dano da carga.',
    responsabilidade: 'Custos e seguro com o vendedor; riscos com o comprador a partir da origem.',
  },
  DAP: {
    title: 'DAP — Delivered At Place (Entregue no Local)',
    desc: 'O vendedor assume riscos e fretes até a chegada no local de destino acordado (antes da descarga). O comprador faz a importação e descarga.',
    responsabilidade: 'Vendedor assume frete internacional até o destino; comprador faz desembaraço de importação.',
  },
  DPU: {
    title: 'DPU — Delivered at Place Unloaded (Entregue no Local Descarregado)',
    desc: 'O vendedor entrega a mercadoria descarregada do meio de transporte no local indicado. Substitui o antigo DAT.',
    responsabilidade: 'Vendedor assume o transporte e a descarga no destino; comprador faz o desembaraço.',
  },
  DDP: {
    title: 'DDP — Delivered Duty Paid (Entregue com Direitos Pagos)',
    desc: 'O vendedor assume todos os custos e riscos da operação até a entrega no destino do comprador, incluindo tarifas alfandegárias de importação.',
    responsabilidade: 'Vendedor assume 100% da logística e impostos de importação.',
  },
  FAS: {
    title: 'FAS — Free Alongside Ship (Livre ao Lado do Navio)',
    desc: 'O vendedor coloca a mercadoria ao lado do navio do comprador no porto de embarque indicado. Risco passa na linha de cais.',
    responsabilidade: 'Exclusivo para modal marítimo/fluvial. Comprador contrata frete internacional.',
  },
  FOB: {
    title: 'FOB — Free On Board (Livre a Bordo)',
    desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
    responsabilidade: 'Exclusivo para modal marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.',
  },
  CFR: {
    title: 'CFR — Cost and Freight (Custo e Frete)',
    desc: 'O vendedor paga os custos e frete marítimo até o porto de destino. Os riscos de perda são transferidos ao comprador no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete pago pelo vendedor; seguro internacional é opcional do comprador.',
  },
  CIF: {
    title: 'CIF — Cost, Insurance and Freight (Custo, Seguro e Frete)',
    desc: 'O vendedor paga custos, frete internacional e contrata seguro marítimo até o porto de destino designado. Riscos transferem no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete e seguro básico com o vendedor; riscos com o comprador.',
  },
}
