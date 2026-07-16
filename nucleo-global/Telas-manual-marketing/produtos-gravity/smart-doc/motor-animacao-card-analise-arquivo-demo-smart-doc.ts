import type { RefObject } from 'react'
import type {
  AlvoDemoCardAnaliseArquivo,
  FaseNarrativaCardAnaliseDemo,
} from './dados-card-analise-arquivo-demo-smart-doc'

export type PassoAnimacaoCardAnaliseArquivo =
  | { tipo: 'espera'; duracaoMs: number; fase?: FaseNarrativaCardAnaliseDemo }
  | { tipo: 'clicar'; alvo: AlvoDemoCardAnaliseArquivo; duracaoMs: number; fase?: FaseNarrativaCardAnaliseDemo }
  | { tipo: 'reiniciar'; duracaoMs: number; fase?: FaseNarrativaCardAnaliseDemo }

export const SEQUENCIA_DEMO_CARD_ANALISE_ARQUIVO: PassoAnimacaoCardAnaliseArquivo[] = [
  { tipo: 'espera', duracaoMs: 1800, fase: 1 },
  { tipo: 'clicar', alvo: 'expandir', duracaoMs: 1000, fase: 1 },
  { tipo: 'espera', duracaoMs: 2200, fase: 2 },
  { tipo: 'espera', duracaoMs: 1000, fase: 3 },
  { tipo: 'clicar', alvo: 'visualizar-doc-0', duracaoMs: 1000 },
  { tipo: 'espera', duracaoMs: 2400 },
  { tipo: 'clicar', alvo: 'fechar-preview', duracaoMs: 800 },
  { tipo: 'espera', duracaoMs: 600 },
  { tipo: 'clicar', alvo: 'visualizar-doc-1', duracaoMs: 1000 },
  { tipo: 'espera', duracaoMs: 2400 },
  { tipo: 'reiniciar', duracaoMs: 700, fase: 1 },
  { tipo: 'espera', duracaoMs: 900, fase: 1 },
]

export type EstadoCursorCliqueDemo = {
  visivel: boolean
  x: number
  y: number
  clicando: boolean
}

export const CURSOR_CLIQUE_DEMO_INICIAL: EstadoCursorCliqueDemo = {
  visivel: false,
  x: 0,
  y: 0,
  clicando: false,
}

function medirAlvoDemo(container: HTMLElement, alvo: AlvoDemoCardAnaliseArquivo): DOMRect | null {
  const elemento = container.querySelector<HTMLElement>(`[data-sds-demo-alvo="${alvo}"]`)
  if (elemento == null) return null
  const rect = elemento.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return rect
}

function indiceVisualizarDoc(alvo: AlvoDemoCardAnaliseArquivo): number | null {
  const match = /^visualizar-doc-(\d+)$/.exec(alvo)
  if (match == null) return null
  return Number(match[1])
}

function limitarPontoAoContainer(
  ponto: { x: number, y: number },
  largura: number,
  altura: number,
): { x: number, y: number } {
  const margem = 12
  return {
    x: Math.min(Math.max(ponto.x, margem), Math.max(margem, largura - margem)),
    y: Math.min(Math.max(ponto.y, margem), Math.max(margem, altura - margem)),
  }
}

function pontoCursorAlvoRelativo(
  rect: DOMRect,
  containerRect: DOMRect,
  fracaoX = 0.55,
): { x: number, y: number } {
  return limitarPontoAoContainer(
    {
      x: rect.left + rect.width * fracaoX - containerRect.left,
      y: rect.top + rect.height * 0.58 - containerRect.top,
    },
    containerRect.width,
    containerRect.height,
  )
}

function interpolar(
  inicio: { x: number, y: number },
  fim: { x: number, y: number },
  progresso: number,
): { x: number, y: number } {
  const t = Math.min(1, Math.max(0, progresso))
  const suave = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
  return {
    x: inicio.x + (fim.x - inicio.x) * suave,
    y: inicio.y + (fim.y - inicio.y) * suave,
  }
}

type ParametrosMotorAnimacaoCardAnalise = {
  ativo: boolean
  containerRef: RefObject<HTMLElement | null>
  aoAtualizarCursor: (estado: EstadoCursorCliqueDemo) => void
  aoDestacarAlvo: (alvo: AlvoDemoCardAnaliseArquivo | null) => void
  aoAtualizarFaseNarrativa: (fase: FaseNarrativaCardAnaliseDemo) => void
  aoExpandirCard: () => void
  aoVisualizarDocumento: (indice: number) => void
  aoFecharPreview: () => void
  aoReiniciar: () => void
}

export function iniciarMotorAnimacaoCardAnaliseArquivo({
  ativo,
  containerRef,
  aoAtualizarCursor,
  aoDestacarAlvo,
  aoAtualizarFaseNarrativa,
  aoExpandirCard,
  aoVisualizarDocumento,
  aoFecharPreview,
  aoReiniciar,
}: ParametrosMotorAnimacaoCardAnalise): () => void {
  if (!ativo) {
    aoAtualizarCursor(CURSOR_CLIQUE_DEMO_INICIAL)
    aoDestacarAlvo(null)
    return () => undefined
  }

  let cancelado = false
  let timeoutId = 0
  let frameId = 0

  const limpar = () => {
    cancelado = true
    window.clearTimeout(timeoutId)
    window.cancelAnimationFrame(frameId)
    aoAtualizarCursor(CURSOR_CLIQUE_DEMO_INICIAL)
    aoDestacarAlvo(null)
  }

  const aguardar = (ms: number) => new Promise<void>((resolve) => {
    timeoutId = window.setTimeout(() => {
      if (!cancelado) resolve()
    }, ms)
  })

  const aplicarFase = (fase?: FaseNarrativaCardAnaliseDemo) => {
    if (fase != null) aoAtualizarFaseNarrativa(fase)
  }

  const animarClique = async (alvo: AlvoDemoCardAnaliseArquivo, duracaoMs: number) => {
    const container = containerRef.current
    if (container == null || cancelado) return

    const containerRect = container.getBoundingClientRect()
    const alvoRect = medirAlvoDemo(container, alvo)
    if (alvoRect == null) return

    const destino = pontoCursorAlvoRelativo(alvoRect, containerRect)
    const origem = {
      x: Math.max(24, destino.x - 48),
      y: Math.max(24, destino.y - 36),
    }

    const inicioAnimacao = performance.now()

    await new Promise<void>((resolve) => {
      const tick = (agora: number) => {
        if (cancelado) {
          resolve()
          return
        }
        const progresso = (agora - inicioAnimacao) / duracaoMs
        const ponto = progresso >= 1 ? destino : interpolar(origem, destino, progresso)
        const clicando = progresso >= 0.78

        aoAtualizarCursor({
          visivel: true,
          x: ponto.x,
          y: ponto.y,
          clicando,
        })

        if (clicando) aoDestacarAlvo(alvo)

        if (progresso >= 1) {
          if (alvo === 'expandir') aoExpandirCard()
          if (alvo === 'fechar-preview') aoFecharPreview()
          const indiceDoc = indiceVisualizarDoc(alvo)
          if (indiceDoc != null) aoVisualizarDocumento(indiceDoc)
          aoAtualizarCursor({ visivel: true, ...destino, clicando: false })
          aoDestacarAlvo(null)
          resolve()
          return
        }

        frameId = window.requestAnimationFrame(tick)
      }

      frameId = window.requestAnimationFrame(tick)
    })
  }

  const executarCiclo = async () => {
    while (!cancelado) {
      for (const passo of SEQUENCIA_DEMO_CARD_ANALISE_ARQUIVO) {
        if (cancelado) return

        aplicarFase(passo.fase)

        if (passo.tipo === 'espera') {
          await aguardar(passo.duracaoMs)
          continue
        }

        if (passo.tipo === 'reiniciar') {
          aoReiniciar()
          aoAtualizarCursor(CURSOR_CLIQUE_DEMO_INICIAL)
          await aguardar(passo.duracaoMs)
          continue
        }

        await animarClique(passo.alvo, passo.duracaoMs)
      }
    }
  }

  void executarCiclo()

  return limpar
}
