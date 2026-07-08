import type { AbaConferenciaSimulador } from './conferencia-simulador-smart-doc'

export type DestinoDespedidaSimulador = {
  passo: 1 | 2 | 3 | 4
  abaConferencia?: AbaConferenciaSimulador
}

export type PendenciaDespedidaSimulador = {
  id: string
  rotulo: string
  destino?: DestinoDespedidaSimulador
}

export type ConteudoDespedidaNovaLeituraSimulador = {
  titulo: string
  saudacao: string
  contexto: string
  pendencias: PendenciaDespedidaSimulador[]
  pergunta: string
  rotuloContinuar: string
  rotuloSair: string
  rotuloFecharSair: string
}

const CONTEXTO_SHELL_PADRAO =
  'Se tiver mais um tempinho, te levo direto aos locais mais importantes.'

const PERGUNTA_SHELL = 'Quer continuar explorando ou quer falar com um consultor?'

const ROTULO_FECHAR_SAIR = 'Fechar e sair'

const ACOES_DESPEDIDA_PADRAO = {
  pergunta: PERGUNTA_SHELL,
  rotuloContinuar: 'Continuar explorando',
  rotuloSair: 'Falar com um consultor',
  rotuloFecharSair: ROTULO_FECHAR_SAIR,
} as const

const ROTULO_FUNCIONALIDADE = {
  extracao: 'Extração automática dos dados do PDF',
  analiseArquivo: 'Análise do arquivo e identificação dos documentos',
  conferenciaCampos: 'Conferência dos campos extraídos',
  analiseRiscos: 'Análise de riscos aduaneiros',
  consultorInteligente: 'Consultor Inteligente — pergunte sobre a leitura',
  resultadoLeitura: 'Resultado consolidado da leitura',
} as const

function pendencia(
  id: string,
  rotulo: string,
  destino?: DestinoDespedidaSimulador,
): PendenciaDespedidaSimulador {
  return { id, rotulo, destino }
}

function pendenciaFuncionalidade(
  chave: keyof typeof ROTULO_FUNCIONALIDADE,
  destino?: DestinoDespedidaSimulador,
): PendenciaDespedidaSimulador {
  return pendencia(chave, ROTULO_FUNCIONALIDADE[chave], destino)
}

export const PENDENCIAS_DESTAQUE_SHELL: PendenciaDespedidaSimulador[] = [
  pendenciaFuncionalidade('extracao', { passo: 2 }),
  pendenciaFuncionalidade('conferenciaCampos', { passo: 3, abaConferencia: 'campos' }),
  pendenciaFuncionalidade('analiseRiscos', { passo: 3, abaConferencia: 'riscos' }),
  pendenciaFuncionalidade('consultorInteligente', { passo: 3, abaConferencia: 'qa' }),
  pendenciaFuncionalidade('resultadoLeitura', { passo: 4 }),
]

function pendenciasPasso1(): PendenciaDespedidaSimulador[] {
  return [
    pendenciaFuncionalidade('extracao', { passo: 2 }),
    pendenciaFuncionalidade('analiseArquivo', { passo: 2 }),
    pendenciaFuncionalidade('conferenciaCampos', { passo: 3, abaConferencia: 'campos' }),
    pendenciaFuncionalidade('analiseRiscos', { passo: 3, abaConferencia: 'riscos' }),
    pendenciaFuncionalidade('consultorInteligente', { passo: 3, abaConferencia: 'qa' }),
    pendenciaFuncionalidade('resultadoLeitura', { passo: 4 }),
  ]
}

function pendenciasPasso2(): PendenciaDespedidaSimulador[] {
  return [
    pendenciaFuncionalidade('conferenciaCampos', { passo: 3, abaConferencia: 'campos' }),
    pendenciaFuncionalidade('analiseRiscos', { passo: 3, abaConferencia: 'riscos' }),
    pendenciaFuncionalidade('consultorInteligente', { passo: 3, abaConferencia: 'qa' }),
    pendenciaFuncionalidade('resultadoLeitura', { passo: 4 }),
  ]
}

function pendenciasPasso3(abasVisitadas: ReadonlySet<AbaConferenciaSimulador>): PendenciaDespedidaSimulador[] {
  const pendencias: PendenciaDespedidaSimulador[] = []
  if (!abasVisitadas.has('campos')) {
    pendencias.push(
      pendenciaFuncionalidade('conferenciaCampos', { passo: 3, abaConferencia: 'campos' }),
    )
  }
  if (!abasVisitadas.has('riscos')) {
    pendencias.push(
      pendenciaFuncionalidade('analiseRiscos', { passo: 3, abaConferencia: 'riscos' }),
    )
  }
  if (!abasVisitadas.has('qa')) {
    pendencias.push(
      pendenciaFuncionalidade('consultorInteligente', { passo: 3, abaConferencia: 'qa' }),
    )
  }
  pendencias.push(pendenciaFuncionalidade('resultadoLeitura', { passo: 4 }))
  return pendencias
}

export function resolverConteudoDespedidaNovaLeituraSimulador(
  passo: number,
  abasConferenciaVisitadas: ReadonlySet<AbaConferenciaSimulador>,
  analiseCompleta = false,
  temArquivoAnexado = false,
): ConteudoDespedidaNovaLeituraSimulador | null {
  if (passo >= 4) return null

  if (passo === 1) {
    return {
      titulo: 'Antes de ir…',
      saudacao: 'Tchau por agora?',
      contexto: temArquivoAnexado
        ? 'Você já simulou o anexo — falta clicar em Enviar e ver a extração automática, a conferência, os riscos e o Consultor Inteligente.'
        : CONTEXTO_SHELL_PADRAO,
      pendencias: pendenciasPasso1(),
      ...ACOES_DESPEDIDA_PADRAO,
    }
  }

  if (passo === 2) {
    const contexto = analiseCompleta
      ? 'A análise já identificou os documentos — falta conferir a extração dos dados, os riscos e o Consultor Inteligente.'
      : 'A análise do arquivo está em andamento — em instantes você verá a extração dos documentos. Ainda dá tempo de conhecer o que vem depois.'
    return {
      titulo: 'Quase lá!',
      saudacao: 'Já vai?',
      contexto,
      pendencias: pendenciasPasso2(),
      ...ACOES_DESPEDIDA_PADRAO,
    }
  }

  if (passo === 3) {
    const pendencias = pendenciasPasso3(abasConferenciaVisitadas)
    const explorouTudo = pendencias.length === 1
    return {
      titulo: explorouTudo ? 'Falta só o resultado!' : 'Ainda tem ouro aqui',
      saudacao: 'Tchau por agora?',
      contexto: explorouTudo
        ? 'Você já explorou a conferência — falta apenas ver o resultado consolidado da leitura.'
        : 'Você está na conferência, mas ainda não passou por tudo que esta demonstração oferece.',
      pendencias,
      ...ACOES_DESPEDIDA_PADRAO,
      rotuloContinuar: explorouTudo ? 'Ver resultado final' : ACOES_DESPEDIDA_PADRAO.rotuloContinuar,
    }
  }

  return null
}

export function deveExibirDespedidaNovaLeituraSimulador(passo: number): boolean {
  return passo >= 1 && passo <= 3
}

export function resolverConteudoDespedidaShellSimulador(
  idTela: string,
  wizardIniciado: boolean,
  wizardCompletado: boolean,
): ConteudoDespedidaNovaLeituraSimulador | null {
  if (wizardCompletado) return null

  if (wizardIniciado) {
    return {
      titulo: 'Quase lá!',
      saudacao: 'Tchau por agora?',
      contexto: CONTEXTO_SHELL_PADRAO,
      pendencias: PENDENCIAS_DESTAQUE_SHELL,
      ...ACOES_DESPEDIDA_PADRAO,
    }
  }

  const contextoPorTela: Record<string, string> = {
    insights: CONTEXTO_SHELL_PADRAO,
    lista:
      'Se tiver mais um tempinho, conheça o fluxo Nova Leitura — onde ocorre a extração automática e a análise de riscos.',
    'lista-detalhe':
      'Se tiver mais um tempinho, conheça o fluxo Nova Leitura do início ao resultado consolidado.',
    historico:
      'Se tiver mais um tempinho, o destaque desta demo está em Nova Leitura — extração automática e análise de riscos.',
    config:
      'Se tiver mais um tempinho, vale conhecer o fluxo operacional de Nova Leitura antes de sair.',
  }

  return {
    titulo: 'Antes de ir…',
    saudacao: 'Tchau por agora?',
    contexto: contextoPorTela[idTela] ?? CONTEXTO_SHELL_PADRAO,
    pendencias: PENDENCIAS_DESTAQUE_SHELL,
    ...ACOES_DESPEDIDA_PADRAO,
  }
}

export function deveExibirDespedidaShellSimulador(wizardCompletado: boolean): boolean {
  return !wizardCompletado
}

export const URL_CONSULTOR_SMART_DOCS_SIMULADOR = '/cadastro?trial=true&produto=smart-read'
