import type { RefObject } from 'react'
import type { LadoDropColuna } from './reordenar-colunas-lista-simulador-pedido'

export type PassoAnimacaoArrastarColunaLista =
  | { tipo: 'espera'; duracaoMs: number }
  | {
    tipo: 'mover'
    origemId: string
    destinoId: string
    lado: LadoDropColuna
    duracaoMs: number
    /** Fração do percurso em que a coluna é solta (0–1). */
    soltarEm?: number
  }

export const SEQUENCIA_DEMO_ARRASTAR_COLUNAS_LISTA: PassoAnimacaoArrastarColunaLista[] = [
  { tipo: 'espera', duracaoMs: 1400 },
  {
    tipo: 'mover',
    origemId: 'id_workspace',
    destinoId: 'nome_exportador',
    lado: 'after',
    duracaoMs: 1500,
    soltarEm: 0.82,
  },
  { tipo: 'espera', duracaoMs: 700 },
  {
    tipo: 'mover',
    origemId: 'referencia_exportador',
    destinoId: 'referencia_importador',
    lado: 'before',
    duracaoMs: 1300,
    soltarEm: 0.8,
  },
  { tipo: 'espera', duracaoMs: 700 },
  {
    tipo: 'mover',
    origemId: 'tipo_operacao',
    destinoId: 'status',
    lado: 'after',
    duracaoMs: 1100,
    soltarEm: 0.78,
  },
  { tipo: 'espera', duracaoMs: 1100 },
]

export type EstadoCursorArrastarLista = {
  visivel: boolean
  x: number
  y: number
  arrastando: boolean
}

export const CURSOR_ARRASTAR_LISTA_INICIAL: EstadoCursorArrastarLista = {
  visivel: false,
  x: 0,
  y: 0,
  arrastando: false,
}

function medirCabecalhoColuna(container: HTMLElement, colunaId: string): DOMRect | null {
  const cabecalho = container.querySelector<HTMLElement>(`[data-coluna-th-demo-id="${colunaId}"]`)
  if (cabecalho == null) return null
  const rect = cabecalho.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  return rect
}

function garantirCabecalhoVisivelNoContainer(container: HTMLElement, colunaId: string) {
  const cabecalho = container.querySelector<HTMLElement>(`[data-coluna-th-demo-id="${colunaId}"]`)
  const areaRolagem = container.querySelector<HTMLElement>('.pds-lista-tabela-wrap')
  if (cabecalho == null || areaRolagem == null) return

  const cabecalhoRect = cabecalho.getBoundingClientRect()
  const areaRect = areaRolagem.getBoundingClientRect()
  const margem = 24

  if (cabecalhoRect.left < areaRect.left + margem) {
    areaRolagem.scrollLeft -= areaRect.left + margem - cabecalhoRect.left
  } else if (cabecalhoRect.right > areaRect.right - margem) {
    areaRolagem.scrollLeft += cabecalhoRect.right - (areaRect.right - margem)
  }
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

function pontoCursorCabecalhoRelativo(
  rect: DOMRect,
  containerRect: DOMRect,
  fracaoX = 0.5,
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

type ParametrosMotorAnimacaoArrastarColunas = {
  ativo: boolean
  containerRef: RefObject<HTMLElement | null>
  aoMoverColuna: (origemId: string, destinoId: string, lado: LadoDropColuna) => void
  aoArrastarColuna: (colunaId: string | null) => void
  aoPreverDrop: (destinoId: string | null, lado: LadoDropColuna | null) => void
  aoAtualizarCursor: (estado: EstadoCursorArrastarLista) => void
  aoReiniciarColunas: () => void
}

export function iniciarMotorAnimacaoArrastarColunasLista({
  ativo,
  containerRef,
  aoMoverColuna,
  aoArrastarColuna,
  aoPreverDrop,
  aoAtualizarCursor,
  aoReiniciarColunas,
}: ParametrosMotorAnimacaoArrastarColunas): () => void {
  if (!ativo) {
    aoAtualizarCursor(CURSOR_ARRASTAR_LISTA_INICIAL)
    aoArrastarColuna(null)
    aoPreverDrop(null, null)
    return () => undefined
  }

  let cancelado = false
  let timeoutId = 0
  let frameId = 0

  const limpar = () => {
    cancelado = true
    window.clearTimeout(timeoutId)
    window.cancelAnimationFrame(frameId)
    aoAtualizarCursor(CURSOR_ARRASTAR_LISTA_INICIAL)
    aoArrastarColuna(null)
    aoPreverDrop(null, null)
  }

  const aguardar = (ms: number) => new Promise<void>((resolve) => {
    timeoutId = window.setTimeout(() => {
      if (!cancelado) resolve()
    }, ms)
  })

  const animarMovimento = async (
    origemId: string,
    destinoId: string,
    lado: LadoDropColuna,
    duracaoMs: number,
    soltarEm: number,
  ) => {
    const container = containerRef.current
    if (container == null || cancelado) return

    const medir = () => {
      const containerRect = container.getBoundingClientRect()
      const origemRect = medirCabecalhoColuna(container, origemId)
      const destinoRect = medirCabecalhoColuna(container, destinoId)
      if (origemRect == null || destinoRect == null) return null
      const fimFracaoX = lado === 'before' ? 0.22 : 0.78
      return {
        inicio: pontoCursorCabecalhoRelativo(origemRect, containerRect, 0.5),
        fim: pontoCursorCabecalhoRelativo(destinoRect, containerRect, fimFracaoX),
      }
    }

    garantirCabecalhoVisivelNoContainer(container, origemId)
    garantirCabecalhoVisivelNoContainer(container, destinoId)
    await aguardar(160)

    let pontos = medir()
    if (pontos == null) {
      await aguardar(400)
      garantirCabecalhoVisivelNoContainer(container, origemId)
      garantirCabecalhoVisivelNoContainer(container, destinoId)
      pontos = medir()
    }
    if (pontos == null || cancelado) return

    aoArrastarColuna(origemId)
    aoAtualizarCursor({
      visivel: true,
      x: pontos.inicio.x,
      y: pontos.inicio.y,
      arrastando: false,
    })

    await aguardar(280)
    if (cancelado) return

    aoAtualizarCursor({
      visivel: true,
      x: pontos.inicio.x,
      y: pontos.inicio.y,
      arrastando: true,
    })

    const inicioAnimacao = performance.now()
    let soltou = false

    await new Promise<void>((resolve) => {
      const tick = (agora: number) => {
        if (cancelado) {
          resolve()
          return
        }

        const pontosAtualizados = medir()
        const alvo = pontosAtualizados ?? pontos
        if (alvo == null) {
          resolve()
          return
        }

        const progresso = Math.min(1, (agora - inicioAnimacao) / duracaoMs)
        const pos = interpolar(alvo.inicio, alvo.fim, progresso)

        aoAtualizarCursor({
          visivel: true,
          x: pos.x,
          y: pos.y,
          arrastando: true,
        })

        if (progresso >= 0.42) {
          aoPreverDrop(destinoId, lado)
        }

        if (!soltou && progresso >= soltarEm) {
          soltou = true
          aoMoverColuna(origemId, destinoId, lado)
          aoArrastarColuna(null)
          aoPreverDrop(null, null)
        }

        if (progresso >= 1) {
          resolve()
          return
        }

        frameId = window.requestAnimationFrame(tick)
      }

      frameId = window.requestAnimationFrame(tick)
    })

    if (cancelado) return

    aoAtualizarCursor({
      visivel: true,
      x: pontos.fim.x,
      y: pontos.fim.y,
      arrastando: false,
    })
    await aguardar(320)
  }

  const executarLoop = async () => {
    while (!cancelado) {
      aoReiniciarColunas()
      await aguardar(500)
      if (cancelado) break

      for (const passo of SEQUENCIA_DEMO_ARRASTAR_COLUNAS_LISTA) {
        if (cancelado) break
        if (passo.tipo === 'espera') {
          aoAtualizarCursor(CURSOR_ARRASTAR_LISTA_INICIAL)
          aoArrastarColuna(null)
          aoPreverDrop(null, null)
          await aguardar(passo.duracaoMs)
        } else {
          await animarMovimento(
            passo.origemId,
            passo.destinoId,
            passo.lado,
            passo.duracaoMs,
            passo.soltarEm ?? 0.8,
          )
        }
      }
    }
  }

  timeoutId = window.setTimeout(() => {
    void executarLoop()
  }, 700)

  return limpar
}
