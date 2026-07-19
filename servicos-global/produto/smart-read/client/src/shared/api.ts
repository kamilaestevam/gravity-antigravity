/**
 * api.ts — Client HTTP do Smart Read (BFF porta 8033)
 * URLs relativas: em dev o proxy do Vite (configurador ou standalone) injeta o
 * x-internal-key correto. Contexto de organização vem do shell store via
 * setApiContext (App.tsx) com fallback no sessionStorage do Shell.
 */

import { z } from 'zod'
import {
  listaPainelDeletarResponseSchema,
  listaPainelItemResponseSchema,
  listaPainelListResponseSchema,
  listaPainelReordenarResponseSchema,
  type ListaPainel,
} from '../../../shared/listaPainelApiSchema'
import {
  AgregadoWorkspaceLeituraRespostaSchema,
  CriarLeituraRespostaSchema,
  EstadoProgressoLeituraSchema,
  LeituraSchema,
  ListarTransacoesRespostaSchema,
  MetricaLeituraRespostaSchema,
  CriarExportacaoLeituraRespostaSchema,
  StatusExportacaoLeituraRespostaSchema,
  type AgregadoWorkspaceLeituraResposta,
  type CriarExportacaoLeituraResposta,
  type CriarLeituraResposta,
  type EstadoProgressoLeitura,
  type Leitura,
  type ListarTransacoesResposta,
  type StatusExportacaoLeituraResposta,
} from './schemas'
import {
  AnaliseRiscosLeituraResponseSchema,
  type AnaliseRiscosLeituraRequest,
  type AnaliseRiscosLeituraResponse,
} from '../../../shared/analise-riscos-leitura-smart-read'
import {
  QaLeituraResponseSchema,
  type QaLeituraRequest,
  type QaLeituraResponse,
} from '../../../shared/qa-leitura-smart-read'
import {
  ResumoUsoLlmLeituraSmartReadSchema,
  type ResumoUsoLlmLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read'
import {
  CriarPedidoDeLeituraSmartReadRespostaSchema,
  type CriarPedidoDeLeituraSmartReadResposta,
} from '../../../shared/conversao-leitura-pedido-smart-read-schema.js'
import { extrairMensagemErroCorpo } from './extrair-mensagem-erro-api'
import {
  estadoProgressoKeepaliveSmartRead,
  estadoProgressoReduzidoUrgenteSmartRead,
  LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ,
} from '../../../shared/estado-progresso-reduzido-urgente-smart-read.js'
import {
  conteudoArquivoLeituraEhVisualizavel,
  mensagemConteudoArquivoInvalido,
  resolverMimePorNomeArquivo,
} from '../../../shared/validar-conteudo-arquivo-leitura-smart-read'

export type { ListaPainel }

let contexto = { idOrganizacao: '', idUsuario: '' }

let getDynamicToken: (() => Promise<string | null>) | null = null

export function injectTokenGetter(fn: () => Promise<string | null>): void {
  getDynamicToken = fn
}

export function setApiContext(ctx: { idOrganizacao: string; idUsuario: string }): void {
  contexto = ctx
}

async function getAuthToken(): Promise<string | null> {
  if (getDynamicToken) {
    try {
      const token = await getDynamicToken()
      if (token) return token
    } catch {
      /* fallback */
    }
  }
  try {
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    if (clerk?.session?.getToken) {
      const token = await clerk.session.getToken()
      if (token) return token
    }
  } catch {
    /* fallback */
  }
  return null
}

function obterIdOrganizacao(): string {
  if (contexto.idOrganizacao) return contexto.idOrganizacao
  try {
    return (
      sessionStorage.getItem('gravity_id_organizacao') ||
      localStorage.getItem('gravity:idOrganizacao') ||
      sessionStorage.getItem('gravity_tenant_id') ||
      (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) ||
      ''
    )
  } catch {
    return ''
  }
}

function obterIdUsuario(): string {
  if (contexto.idUsuario) return contexto.idUsuario
  try {
    return sessionStorage.getItem('gravity_id_usuario') || ''
  } catch {
    return ''
  }
}

function cabecalhosBase(): Record<string, string> {
  const idOrganizacao = obterIdOrganizacao()
  const idUsuario = obterIdUsuario()
  if (!idOrganizacao || !idUsuario) {
    console.error('[smart-read][api] x-id-organizacao ou x-id-usuario ausente — progresso pode não gravar', {
      idOrganizacao,
      idUsuario,
    })
  }
  const idWorkspace = (() => {
    try {
      return sessionStorage.getItem('gravity_company_id') || ''
    } catch {
      return ''
    }
  })()
  return {
    'x-id-organizacao': idOrganizacao,
    'x-id-usuario': idUsuario,
    ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
    'x-chave-interna-servico': (import.meta.env.VITE_CHAVE_INTERNA_SERVICO as string | undefined) || '',
  }
}

async function cabecalhosAutenticados(extra?: HeadersInit): Promise<Record<string, string>> {
  const token = await getAuthToken()
  const base = cabecalhosBase()
  const mesclado: Record<string, string> = { ...base }
  if (token) mesclado.Authorization = `Bearer ${token}`
  if (extra && typeof extra === 'object') {
    for (const [chave, valor] of Object.entries(extra as Record<string, string>)) {
      if (typeof valor === 'string') mesclado[chave] = valor
    }
  }
  return mesclado
}

async function lerErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => null)
  return extrairMensagemErroCorpo(corpo) ?? `HTTP ${resposta.status}`
}

async function requisitar<T>(schema: z.ZodType<T>, endpoint: string, init?: RequestInit): Promise<T> {
  const headers = await cabecalhosAutenticados(init?.headers)
  const resposta = await fetch(endpoint, {
    ...init,
    headers,
  })
  if (!resposta.ok) {
    throw new Error(await lerErro(resposta))
  }
  return schema.parse(await resposta.json())
}

/**
 * POST multipart via XHR — fetch não expõe progresso de upload, e a barra
 * «Envio do arquivo» do passo 2 precisa do progresso REAL byte a byte.
 * Semântica de erro espelha o fetch: falha de rede rejeita com TypeError
 * (mantém o retry de rede de enviarLeitura) e timeout/abort com DOMException.
 */
function enviarFormularioComProgresso<T>(
  schema: z.ZodType<T>,
  endpoint: string,
  formulario: FormData,
  headers: Record<string, string>,
  opcoes: {
    signal?: AbortSignal
    timeoutMs: number
    aoProgredirEnvio?: (fracao: number) => void
  },
): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    if (opcoes.signal?.aborted) {
      rejeitar(new DOMException('Envio abortado', 'AbortError'))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)
    for (const [chave, valor] of Object.entries(headers)) {
      if (valor) xhr.setRequestHeader(chave, valor)
    }
    xhr.timeout = opcoes.timeoutMs
    xhr.responseType = 'text'

    const aoAbortarSinal = () => xhr.abort()
    opcoes.signal?.addEventListener('abort', aoAbortarSinal, { once: true })
    const limpar = () => opcoes.signal?.removeEventListener('abort', aoAbortarSinal)

    if (opcoes.aoProgredirEnvio) {
      xhr.upload.onprogress = (evento) => {
        if (evento.lengthComputable && evento.total > 0) {
          opcoes.aoProgredirEnvio?.(Math.min(1, evento.loaded / evento.total))
        }
      }
    }

    xhr.onload = () => {
      limpar()
      let corpo: unknown = null
      try {
        corpo = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        corpo = null
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        rejeitar(new Error(extrairMensagemErroCorpo(corpo) ?? `HTTP ${xhr.status}`))
        return
      }
      try {
        resolver(schema.parse(corpo))
      } catch (erro) {
        rejeitar(erro)
      }
    }
    xhr.onerror = () => {
      limpar()
      rejeitar(new TypeError('Falha de rede ao enviar o arquivo'))
    }
    xhr.ontimeout = () => {
      limpar()
      rejeitar(new DOMException('Tempo limite ao enviar o arquivo', 'TimeoutError'))
    }
    xhr.onabort = () => {
      limpar()
      rejeitar(new DOMException('Envio abortado', 'AbortError'))
    }

    xhr.send(formulario)
  })
}

export type { AnaliseRiscosLeituraRequest, AnaliseRiscosLeituraResponse, QaLeituraRequest, QaLeituraResponse }

export const smartReadApi = {
  listarTransacoes(params: {
    pagina: number
    limite: number
    termo_busca?: string
    origem_leitura?: 'API' | 'INTERFACE'
  }): Promise<ListarTransacoesResposta> {
    const query = new URLSearchParams({
      pagina: String(params.pagina),
      limite: String(params.limite),
    })
    if (params.termo_busca) query.set('termo_busca', params.termo_busca)
    if (params.origem_leitura) query.set('origem_leitura', params.origem_leitura)
    return requisitar(ListarTransacoesRespostaSchema, `/api/v1/smart-read/leituras?${query.toString()}`)
  },

  obterMetricaLeitura(tipo: 'readings'): Promise<{ valor: number }> {
    return requisitar(
      MetricaLeituraRespostaSchema,
      `/api/v1/smart-read/leituras/metricas/${encodeURIComponent(tipo)}`,
    )
  },

  /** Saving acumulado + mediana de análise do workspace — 1 chamada, 100% Postgres Gravity. */
  obterAgregadoWorkspaceLeituras(): Promise<AgregadoWorkspaceLeituraResposta> {
    return requisitar(
      AgregadoWorkspaceLeituraRespostaSchema,
      '/api/v1/smart-read/leituras/agregado-workspace',
      { signal: AbortSignal.timeout(30_000) },
    )
  },

  async enviarLeitura(
    arquivo: File,
    opcoes?: { signal?: AbortSignal; aoProgredirEnvio?: (fracao: number) => void },
  ): Promise<CriarLeituraResposta> {
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)
    const sinalChamador = opcoes?.signal
    // Upload real via DATI leva ~90s para 5MB; 5min cobre arquivos grandes.
    // Sem timeout o card fica preso em "Enviando arquivo..." para sempre.
    // O sinal do chamador permite abortar ao fechar o wizard — um POST
    // abandonado seguraria o proxy de dev e entalaria o próximo envio.
    const tentar = async () =>
      enviarFormularioComProgresso(
        CriarLeituraRespostaSchema,
        '/api/v1/smart-read/leituras',
        formulario,
        await cabecalhosAutenticados(),
        {
          signal: sinalChamador,
          timeoutMs: 300_000,
          aoProgredirEnvio: opcoes?.aoProgredirEnvio,
        },
      )
    try {
      return await tentar()
    } catch (erro) {
      if (sinalChamador?.aborted) throw erro
      if (erro instanceof DOMException && (erro.name === 'TimeoutError' || erro.name === 'AbortError')) {
        throw new Error(
          'Tempo limite ao enviar o arquivo. Verifique se o arquivo está acessível (ex.: sincronizado no Google Drive) e tente novamente.',
        )
      }
      // TypeError = falha de rede (conexão caiu no meio do envio) — o servidor
      // não recebeu o arquivo. Uma retentativa silenciosa resolve quedas pontuais.
      if (erro instanceof TypeError) {
        try {
          return await tentar()
        } catch (erroRetentativa) {
          if (erroRetentativa instanceof TypeError || erroRetentativa instanceof DOMException) {
            throw new Error(
              'Falha de rede ao enviar o arquivo. Verifique a conexão e tente anexar novamente.',
            )
          }
          throw erroRetentativa
        }
      }
      throw erro
    }
  },

  obterLeitura(idLeitura: string): Promise<Leitura> {
    return requisitar(LeituraSchema, `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}`)
  },

  criarPedidoDeLeitura(idLeitura: string): Promise<CriarPedidoDeLeituraSmartReadResposta> {
    return requisitar(
      CriarPedidoDeLeituraSmartReadRespostaSchema,
      `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/criar-pedido`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_leitura: idLeitura }),
        signal: AbortSignal.timeout(120_000),
      },
    )
  },

  async obterArquivoLeitura(idLeitura: string, idArquivo: string, nomeArquivo?: string): Promise<Blob> {
    const resposta = await fetch(
      `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/arquivos/${encodeURIComponent(idArquivo)}`,
      {
        headers: await cabecalhosAutenticados(),
        signal: AbortSignal.timeout(45_000),
      },
    )
    if (!resposta.ok) {
      throw new Error(await lerErro(resposta))
    }
    const bruto = await resposta.blob()
    const bytes = new Uint8Array(await bruto.arrayBuffer())
    const nome = nomeArquivo ?? 'documento'
    if (!conteudoArquivoLeituraEhVisualizavel(bytes, nome)) {
      throw new Error(mensagemConteudoArquivoInvalido(nome))
    }
    const mime =
      bruto.type && bruto.type !== 'application/octet-stream'
        ? bruto.type
        : resolverMimePorNomeArquivo(nome)
    return new Blob([bytes], { type: mime })
  },

  analisarRiscosLeitura(
    payload: AnaliseRiscosLeituraRequest,
  ): Promise<AnaliseRiscosLeituraResponse> {
    const timeoutMs =
      payload.incluir_llm === false
        ? 15_000
        : payload.somente_llm === true
          ? 60_000
          : 70_000
    return requisitar(AnaliseRiscosLeituraResponseSchema, '/api/v1/smart-read/leituras/analise-riscos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    })
  },

  perguntarQaLeitura(payload: QaLeituraRequest): Promise<QaLeituraResponse> {
    return requisitar(QaLeituraResponseSchema, '/api/v1/smart-read/leituras/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  obterResumoTokensLeitura(idLeitura: string): Promise<ResumoUsoLlmLeituraSmartRead> {
    return requisitar(
      ResumoUsoLlmLeituraSmartReadSchema,
      `/api/v1/smart-read/leituras/tokens/${encodeURIComponent(idLeitura)}`,
    )
  },

  obterResumoTokensOrganizacaoMes(): Promise<ResumoUsoLlmLeituraSmartRead> {
    return requisitar(
      ResumoUsoLlmLeituraSmartReadSchema,
      '/api/v1/smart-read/leituras/tokens/resumo?escopo=organizacao_mes',
    )
  },

  async obterProgressoLeitura(idLeitura: string): Promise<EstadoProgressoLeitura | null> {
    const resposta = await fetch(
      `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/progresso`,
      { headers: await cabecalhosAutenticados() },
    )
    if (resposta.status === 404) return null
    if (!resposta.ok) {
      throw new Error(await lerErro(resposta))
    }
    return EstadoProgressoLeituraSchema.parse(await resposta.json())
  },

  salvarProgressoLeitura(idLeitura: string, estado: EstadoProgressoLeitura): Promise<EstadoProgressoLeitura> {
    return requisitar(
      EstadoProgressoLeituraSchema,
      `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/progresso`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estado),
      },
    )
  },

  async salvarProgressoLeituraKeepalive(idLeitura: string, estado: EstadoProgressoLeitura): Promise<void> {
    let corpo = JSON.stringify(estado)
    if (corpo.length > LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ) {
      corpo = JSON.stringify(estadoProgressoKeepaliveSmartRead(estado))
    }
    if (corpo.length > LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ) {
      corpo = JSON.stringify(estadoProgressoReduzidoUrgenteSmartRead(estado))
    }
    if (corpo.length > LIMITE_CORPO_KEEPALIVE_PROGRESSO_SMART_READ) {
      console.error('[smart-read][api] progresso keepalive excede limite — passo não enviado no flush', {
        idLeitura,
        bytes: corpo.length,
      })
      return
    }
    const headers = await cabecalhosAutenticados({ 'Content-Type': 'application/json' })
    void fetch(`/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/progresso`, {
      method: 'PATCH',
      headers,
      body: corpo,
      keepalive: true,
    })
  },

  async excluirLeitura(idLeitura: string): Promise<void> {
    const resposta = await fetch(`/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}`, {
      method: 'DELETE',
      headers: await cabecalhosAutenticados(),
    })
    if (!resposta.ok) {
      throw new Error(await lerErro(resposta))
    }
  },

  criarExportacaoLeitura(
    idLeitura: string,
    ids_arquivo: string[],
  ): Promise<CriarExportacaoLeituraResposta> {
    return requisitar(
      CriarExportacaoLeituraRespostaSchema,
      `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/exportacoes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids_arquivo }),
      },
    )
  },

  obterStatusExportacaoLeitura(idTarefa: string): Promise<StatusExportacaoLeituraResposta> {
    return requisitar(
      StatusExportacaoLeituraRespostaSchema,
      `/api/v1/smart-read/leituras/exportacoes/tarefas/${encodeURIComponent(idTarefa)}`,
    )
  },

  async baixarArquivoExportacaoLeitura(idTarefa: string, nomeArquivo?: string): Promise<void> {
    const resposta = await fetch(
      `/api/v1/smart-read/leituras/exportacoes/tarefas/${encodeURIComponent(idTarefa)}/arquivo`,
      { headers: await cabecalhosAutenticados(), signal: AbortSignal.timeout(120_000) },
    )
    if (!resposta.ok) {
      throw new Error(await lerErro(resposta))
    }
    const blob = await resposta.blob()
    const url = URL.createObjectURL(blob)
    const ancora = document.createElement('a')
    ancora.href = url
    ancora.download = nomeArquivo ?? `smart-read-export-${idTarefa}.zip`
    document.body.appendChild(ancora)
    ancora.click()
    ancora.remove()
    URL.revokeObjectURL(url)
  },
}

const BASE_LISTA_PAINEIS = '/api/v1/smart-read/lista/paineis'

export const paineisListaSmartReadApi = {
  async listar(): Promise<{ data: ListaPainel[] }> {
    const res = await fetch(BASE_LISTA_PAINEIS, { headers: await cabecalhosAutenticados() })
    if (!res.ok) throw new Error(await lerErro(res))
    const raw = await res.json()
    const parsed = listaPainelListResponseSchema.safeParse(raw)
    if (!parsed.success) {
      console.warn('[paineisListaSmartReadApi.listar] resposta fora do contrato Zod', parsed.error.flatten())
      throw new Error('Resposta inválida ao listar painéis da lista')
    }
    return parsed.data
  },

  async criar(nome: string, configJson?: string): Promise<{ data: ListaPainel }> {
    const res = await fetch(BASE_LISTA_PAINEIS, {
      method: 'POST',
      headers: await cabecalhosAutenticados({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        nome,
        ...(configJson ? { config_json: configJson } : {}),
      }),
    })
    if (!res.ok) throw new Error(await lerErro(res))
    return listaPainelItemResponseSchema.parse(await res.json())
  },

  async atualizar(
    id: string,
    patch: Partial<Pick<ListaPainel, 'nome' | 'is_visivel' | 'config_json'>>,
  ): Promise<{ data: ListaPainel }> {
    const res = await fetch(`${BASE_LISTA_PAINEIS}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: await cabecalhosAutenticados({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error(await lerErro(res))
    return listaPainelItemResponseSchema.parse(await res.json())
  },

  async reordenar(ids: string[]): Promise<{ data: { reordenado: true } }> {
    const res = await fetch(`${BASE_LISTA_PAINEIS}/reordenar`, {
      method: 'PUT',
      headers: await cabecalhosAutenticados({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) throw new Error(await lerErro(res))
    return listaPainelReordenarResponseSchema.parse(await res.json())
  },

  async deletar(id: string): Promise<{ data: { deletado: true } }> {
    const res = await fetch(`${BASE_LISTA_PAINEIS}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: await cabecalhosAutenticados(),
    })
    if (!res.ok) throw new Error(await lerErro(res))
    return listaPainelDeletarResponseSchema.parse(await res.json())
  },
}
