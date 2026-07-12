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
  CriarLeituraRespostaSchema,
  EstadoProgressoLeituraSchema,
  LeituraSchema,
  ListarTransacoesRespostaSchema,
  MetricaLeituraRespostaSchema,
  CriarExportacaoLeituraRespostaSchema,
  StatusExportacaoLeituraRespostaSchema,
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
  conteudoArquivoLeituraEhVisualizavel,
  mensagemConteudoArquivoInvalido,
  resolverMimePorNomeArquivo,
} from '../../../shared/validar-conteudo-arquivo-leitura-smart-read'

export type { ListaPainel }

let contexto = { idOrganizacao: '', idUsuario: '' }

export function setApiContext(ctx: { idOrganizacao: string; idUsuario: string }): void {
  contexto = ctx
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
  if (import.meta.env.DEV && (!idOrganizacao || !idUsuario)) {
    console.error('[smart-read][api] x-id-organizacao ou x-id-usuario ausente — progresso não grava no banco', {
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
    'x-id-organizacao': obterIdOrganizacao(),
    'x-id-usuario': obterIdUsuario(),
    ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
    'x-chave-interna-servico': (import.meta.env.VITE_CHAVE_INTERNA_SERVICO as string | undefined) || '',
  }
}

async function lerErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => null)
  return extrairMensagemErroCorpo(corpo) ?? `HTTP ${resposta.status}`
}

async function requisitar<T>(schema: z.ZodType<T>, endpoint: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(endpoint, {
    ...init,
    headers: { ...cabecalhosBase(), ...init?.headers },
  })
  if (!resposta.ok) {
    throw new Error(await lerErro(resposta))
  }
  return schema.parse(await resposta.json())
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

  enviarLeitura(arquivo: File): Promise<CriarLeituraResposta> {
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)
    return requisitar(CriarLeituraRespostaSchema, '/api/v1/smart-read/leituras', {
      method: 'POST',
      body: formulario,
    })
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
        headers: cabecalhosBase(),
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
      { headers: cabecalhosBase() },
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

  async excluirLeitura(idLeitura: string): Promise<void> {
    const resposta = await fetch(`/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}`, {
      method: 'DELETE',
      headers: cabecalhosBase(),
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
      { headers: cabecalhosBase(), signal: AbortSignal.timeout(120_000) },
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
  listar(): Promise<{ data: ListaPainel[] }> {
    return fetch(BASE_LISTA_PAINEIS, { headers: cabecalhosBase() })
      .then(async (res) => {
        if (!res.ok) throw new Error(await lerErro(res))
        return res.json()
      })
      .then((raw) => {
        const parsed = listaPainelListResponseSchema.safeParse(raw)
        if (!parsed.success) {
          console.warn('[paineisListaSmartReadApi.listar] resposta fora do contrato Zod', parsed.error.flatten())
          throw new Error('Resposta inválida ao listar painéis da lista')
        }
        return parsed.data
      })
  },

  criar(nome: string, configJson?: string): Promise<{ data: ListaPainel }> {
    return fetch(BASE_LISTA_PAINEIS, {
      method: 'POST',
      headers: { ...cabecalhosBase(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        ...(configJson ? { config_json: configJson } : {}),
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await lerErro(res))
        return res.json()
      })
      .then((raw) => listaPainelItemResponseSchema.parse(raw))
  },

  atualizar(
    id: string,
    patch: Partial<Pick<ListaPainel, 'nome' | 'is_visivel' | 'config_json'>>,
  ): Promise<{ data: ListaPainel }> {
    return fetch(`${BASE_LISTA_PAINEIS}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { ...cabecalhosBase(), 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await lerErro(res))
        return res.json()
      })
      .then((raw) => listaPainelItemResponseSchema.parse(raw))
  },

  reordenar(ids: string[]): Promise<{ data: { reordenado: true } }> {
    return fetch(`${BASE_LISTA_PAINEIS}/reordenar`, {
      method: 'PUT',
      headers: { ...cabecalhosBase(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await lerErro(res))
        return res.json()
      })
      .then((raw) => listaPainelReordenarResponseSchema.parse(raw))
  },

  deletar(id: string): Promise<{ data: { deletado: true } }> {
    return fetch(`${BASE_LISTA_PAINEIS}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: cabecalhosBase(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await lerErro(res))
        return res.json()
      })
      .then((raw) => listaPainelDeletarResponseSchema.parse(raw))
  },
}
