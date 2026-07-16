export const LARGURA_COLUNA_DADO_LISTA_SIMULADOR = 112

/** Expand (28) + check (36) — colunas fixas à esquerda da grade de dados. */
export const LARGURA_FIXA_ESQUERDA_LISTA_SIMULADOR = 64

/** Reserva à direita para o painel fixo do guia (.pds-transf-guia). */
export const MARGEM_DIREITA_GUIA_LISTA_SIMULADOR = 400

const BUFFER_JANELA_COLUNAS = 4
const BUFFER_JANELA_GUIA_COLUNAS = 10

/** Abaixo deste limite renderiza todas as colunas sem janela (menos overhead). */
export const LIMITE_COLUNAS_RENDER_DIRETO_LISTA_SIMULADOR = 32

export type JanelaColunasScrollListaSimulador = {
  inicio: number
  fim: number
  espacoEsquerda: number
  espacoDireita: number
  usaJanela: boolean
}

export type OpcoesScrollColunaListaSimulador = {
  modoGuia?: boolean
  indiceColuna?: number
}

export function expandirJanelaColunasListaSimulador(
  janela: JanelaColunasScrollListaSimulador,
  totalColunas: number,
  indicesIncluir: number[],
): JanelaColunasScrollListaSimulador {
  if (!janela.usaJanela || indicesIncluir.length === 0) return janela
  const inicio = Math.min(janela.inicio, ...indicesIncluir)
  const fim = Math.max(janela.fim, ...indicesIncluir.map((i) => i + 1))
  return {
    inicio,
    fim,
    espacoEsquerda: inicio * LARGURA_COLUNA_DADO_LISTA_SIMULADOR,
    espacoDireita: Math.max(0, (totalColunas - fim) * LARGURA_COLUNA_DADO_LISTA_SIMULADOR),
    usaJanela: true,
  }
}

/** Janela virtual no guia: renderiza só colunas perto do alvo + espaçadores = largura total. */
export function calcularJanelaColunasGuiaListaSimulador(
  indiceAlvo: number,
  totalColunas: number,
  viewportWidth: number,
): JanelaColunasScrollListaSimulador {
  if (totalColunas <= LIMITE_COLUNAS_RENDER_DIRETO_LISTA_SIMULADOR) {
    return {
      inicio: 0,
      fim: totalColunas,
      espacoEsquerda: 0,
      espacoDireita: 0,
      usaJanela: false,
    }
  }

  const inicio = Math.max(0, indiceAlvo - BUFFER_JANELA_GUIA_COLUNAS)
  const colunasNaViewport = Math.ceil(viewportWidth / LARGURA_COLUNA_DADO_LISTA_SIMULADOR)
  const fim = Math.min(
    totalColunas,
    Math.max(indiceAlvo + BUFFER_JANELA_GUIA_COLUNAS + 1, inicio + colunasNaViewport + BUFFER_JANELA_COLUNAS),
  )

  return {
    inicio,
    fim,
    espacoEsquerda: inicio * LARGURA_COLUNA_DADO_LISTA_SIMULADOR,
    espacoDireita: Math.max(0, (totalColunas - fim) * LARGURA_COLUNA_DADO_LISTA_SIMULADOR),
    usaJanela: true,
  }
}

export function calcularScrollLeftParaColunaListaSimulador(
  indiceColuna: number,
  viewportWidth: number,
  margemEsquerda = LARGURA_FIXA_ESQUERDA_LISTA_SIMULADOR,
  margemDireita = MARGEM_DIREITA_GUIA_LISTA_SIMULADOR,
): number {
  if (indiceColuna < 0) return 0
  const inicioColuna =
    LARGURA_FIXA_ESQUERDA_LISTA_SIMULADOR + indiceColuna * LARGURA_COLUNA_DADO_LISTA_SIMULADOR
  const contextoAntes = LARGURA_COLUNA_DADO_LISTA_SIMULADOR
  return Math.max(0, inicioColuna - margemEsquerda - contextoAntes)
}

function medirMargemEsquerdaTabelaLista(container: HTMLElement): number {
  const checkTh = container.querySelector('.pds-lista-th-check')
  if (checkTh instanceof HTMLElement) {
    const containerRect = container.getBoundingClientRect()
    return checkTh.getBoundingClientRect().right - containerRect.left
  }
  return LARGURA_FIXA_ESQUERDA_LISTA_SIMULADOR
}

function resolverElementoColunaListaSimulador(
  container: HTMLElement,
  colunaId: string,
  itemId?: string,
): HTMLElement | null {
  const esc = colunaId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

  if (itemId) {
    const escItem = itemId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const td = container.querySelector(
      `tbody tr[data-pds-linha-id="item-${escItem}"] td[data-pds-coluna-id="${esc}"]`,
    )
    if (td instanceof HTMLElement) return td
  }

  const th = container.querySelector(`thead th[data-pds-coluna-id="${esc}"]`)
  return th instanceof HTMLElement ? th : null
}

function colunaVisivelNoContainer(elemento: HTMLElement, container: HTMLElement): boolean {
  const containerRect = container.getBoundingClientRect()
  const elementoRect = elemento.getBoundingClientRect()
  const margemEsquerda = medirMargemEsquerdaTabelaLista(container)
  const alvoEsquerda = containerRect.left + margemEsquerda + LARGURA_COLUNA_DADO_LISTA_SIMULADOR
  const alvoDireita = containerRect.right - MARGEM_DIREITA_GUIA_LISTA_SIMULADOR

  return elementoRect.left >= alvoEsquerda - 20
    && elementoRect.left <= alvoEsquerda + 40
    && elementoRect.right <= alvoDireita + 12
}

export function scrollContainerParaIndiceColunaGuiaLista(
  container: HTMLElement,
  indiceColuna: number,
): void {
  const margemEsquerda = medirMargemEsquerdaTabelaLista(container)
  const alvo = calcularScrollLeftParaColunaListaSimulador(
    indiceColuna,
    container.clientWidth,
    margemEsquerda,
    MARGEM_DIREITA_GUIA_LISTA_SIMULADOR,
  )
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
  container.scrollTo({ left: Math.max(0, Math.min(alvo, maxScroll)), behavior: 'auto' })
}

function scrollThPadraoParaViewport(th: HTMLElement, container: HTMLElement): void {
  const containerRect = container.getBoundingClientRect()
  const thRect = th.getBoundingClientRect()
  const margemEsquerda = medirMargemEsquerdaTabelaLista(container)
  const areaUtil = Math.max(0, container.clientWidth - margemEsquerda)
  const alvoViewportX = margemEsquerda + areaUtil / 2 - thRect.width / 2
  const delta = thRect.left - containerRect.left - alvoViewportX
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
  container.scrollLeft = Math.max(0, Math.min(container.scrollLeft + delta, maxScroll))
}

export function scrollContainerParaColunaListaSimulador(
  container: HTMLElement,
  colunaId: string,
  opcoes?: OpcoesScrollColunaListaSimulador,
  itemId?: string,
): boolean {
  if (opcoes?.modoGuia && opcoes.indiceColuna !== undefined && opcoes.indiceColuna >= 0) {
    const scrollTopAntes = container.scrollTop
    scrollContainerParaIndiceColunaGuiaLista(container, opcoes.indiceColuna)
    container.scrollTop = scrollTopAntes
    return true
  }

  const alvo = resolverElementoColunaListaSimulador(container, colunaId, itemId)
  if (!alvo) return false

  scrollThPadraoParaViewport(alvo, container)
  return true
}

export function scrollContainerParaColunaListaSimuladorAposLayout(
  container: HTMLElement,
  colunaId: string,
  indiceColuna: number,
  onScroll?: () => void,
  itemId?: string,
): () => void {
  const executar = () => {
    scrollContainerParaColunaListaSimulador(
      container,
      colunaId,
      { modoGuia: true, indiceColuna },
      itemId,
    )
    onScroll?.()

    const alvo = resolverElementoColunaListaSimulador(container, colunaId, itemId)
    if (alvo instanceof HTMLElement) {
      return colunaVisivelNoContainer(alvo, container)
    }
    return indiceColuna >= 0
  }

  executar()

  let tentativas = 0
  let concluiu = false

  const tentarAteAlinhar = () => {
    if (concluiu) return
    tentativas += 1
    if (executar() || tentativas >= 24) {
      concluiu = true
      observer?.disconnect()
    }
  }

  const raf1 = window.requestAnimationFrame(() => {
    tentarAteAlinhar()
    window.requestAnimationFrame(tentarAteAlinhar)
  })

  const tabela = container.querySelector('.pds-lista-tabela')
  const observer =
    tabela instanceof HTMLElement
      ? new ResizeObserver(() => tentarAteAlinhar())
      : null

  observer?.observe(tabela ?? container)
  const timeouts = [50, 150, 300, 500, 800, 1200, 1800].map((ms) =>
    window.setTimeout(tentarAteAlinhar, ms),
  )
  const timeoutSeguranca = window.setTimeout(() => {
    concluiu = true
    observer?.disconnect()
  }, 2200)

  return () => {
    concluiu = true
    window.cancelAnimationFrame(raf1)
    observer?.disconnect()
    timeouts.forEach((id) => window.clearTimeout(id))
    window.clearTimeout(timeoutSeguranca)
  }
}

export function scrollContainerParaLinhaListaSimulador(
  container: HTMLElement,
  seletorLinha: string,
): boolean {
  const linha = container.querySelector(seletorLinha)
  if (!(linha instanceof HTMLElement)) return false

  const linhaRect = linha.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const delta =
    linhaRect.top - containerRect.top - containerRect.height / 2 + linhaRect.height / 2
  const scrollLeftAtual = container.scrollLeft

  container.scrollTo({
    top: Math.max(0, container.scrollTop + delta),
    left: scrollLeftAtual,
    behavior: 'auto',
  })
  return true
}

export function calcularJanelaColunasScrollListaSimulador(
  totalColunas: number,
  scrollLeft: number,
  viewportWidth: number,
): JanelaColunasScrollListaSimulador {
  if (totalColunas <= LIMITE_COLUNAS_RENDER_DIRETO_LISTA_SIMULADOR) {
    return {
      inicio: 0,
      fim: totalColunas,
      espacoEsquerda: 0,
      espacoDireita: 0,
      usaJanela: false,
    }
  }

  const inicio = Math.max(
    0,
    Math.floor(scrollLeft / LARGURA_COLUNA_DADO_LISTA_SIMULADOR) - BUFFER_JANELA_COLUNAS,
  )
  const colunasNaViewport = Math.ceil(viewportWidth / LARGURA_COLUNA_DADO_LISTA_SIMULADOR)
  const fim = Math.min(totalColunas, inicio + colunasNaViewport + BUFFER_JANELA_COLUNAS * 2)

  return {
    inicio,
    fim,
    espacoEsquerda: inicio * LARGURA_COLUNA_DADO_LISTA_SIMULADOR,
    espacoDireita: Math.max(0, (totalColunas - fim) * LARGURA_COLUNA_DADO_LISTA_SIMULADOR),
    usaJanela: true,
  }
}
