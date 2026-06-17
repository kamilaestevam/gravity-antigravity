/**
 * api.ts — Client HTTP do Smart Read (BFF porta 8033)
 * URLs relativas: em dev o proxy do Vite (configurador ou standalone) injeta o
 * x-internal-key correto. Contexto de organização vem do shell store via
 * setApiContext (App.tsx) com fallback no sessionStorage do Shell.
 */

import { z } from 'zod'
import {
  CriarLeituraRespostaSchema,
  LeituraSchema,
  type CriarLeituraResposta,
  type Leitura,
} from './schemas'
import { extrairMensagemErroCorpo } from './extrair-mensagem-erro-api'

let contexto = { idOrganizacao: '', idUsuario: '' }

export function setApiContext(ctx: { idOrganizacao: string; idUsuario: string }): void {
  contexto = ctx
}

function obterIdOrganizacao(): string {
  if (contexto.idOrganizacao) return contexto.idOrganizacao
  try {
    return (
      sessionStorage.getItem('gravity_tenant_id') ||
      (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) ||
      ''
    )
  } catch {
    return ''
  }
}

function cabecalhosBase(): Record<string, string> {
  const idWorkspace = (() => {
    try {
      return sessionStorage.getItem('gravity_company_id') || ''
    } catch {
      return ''
    }
  })()
  return {
    'x-id-organizacao': obterIdOrganizacao(),
    'x-id-usuario': contexto.idUsuario,
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

export const smartReadApi = {
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
}
