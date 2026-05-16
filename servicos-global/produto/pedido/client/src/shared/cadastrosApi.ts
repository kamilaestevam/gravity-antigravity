/**
 * cadastrosApi.ts — Cliente HTTP do Pedido para o serviço Cadastros.
 *
 * Endpoints consumidos:
 *   GET  /api/v1/empresas                    — lista paginada (suporta `busca`, `por_pagina`)
 *   POST /api/v1/empresas                    — cria nova empresa (cadastro rápido inline)
 *   GET  /api/v1/cadastros/paises            — catálogo de países (fonte única)
 *
 * Histórico DDD: o router de Empresa foi montado em /api/v1/empresas (raiz)
 * em vez de /api/v1/cadastros/empresas — ver cadastros/server/src/index.ts:42.
 * O Vite tem proxy `/api/v1/empresas` → 8031 (configurador/vite.config.ts:128).
 *
 * Mandamentos respeitados:
 *   - 03 (DDD): nomes em PT-BR (`nome_empresa`, `pais_empresa`, `pode_ser_*`)
 *   - 06 (Zod no backend): validação principal está no Cadastros via
 *     `criarEmpresaSchema`. Frontend não duplica regras, só envia o shape certo.
 *   - 08 (fim dos fallbacks silenciosos): erros 401/403/409/422 propagam mensagens
 *     específicas pra UI tratar — `request<T>` já preserva `error.details`.
 *
 * Tipos: declarados localmente para evitar problemas de rootDir cross-produto.
 * Source-of-truth: servicos-global/cadastros/shared/schemas/empresa.schema.ts
 * (manter em sincronia se o schema do Cadastros evoluir).
 */

import { request, getApiContext } from './api'

// ── Tipos (espelho do empresaSchema do Cadastros) ─────────────────────────────

export interface Empresa {
  suid_empresa: string
  id_organizacao: string
  nome_empresa: string
  cnpj_empresa: string | null
  tin_empresa: string | null
  pais_empresa: string
  estado_empresa: string | null
  cidade_empresa: string | null
  endereco_empresa: string | null
  zipcode_empresa: string | null
  email_empresa: string | null
  telefone_empresa: string | null
  whatsapp_empresa: string | null
  pode_ser_importador_empresa: boolean
  pode_ser_exportador_empresa: boolean
  pode_ser_fabricante_empresa: boolean
  pode_ser_agente_empresa: boolean
  pode_ser_despachante_empresa: boolean
  pode_ser_armador_empresa: boolean
  pode_ser_cia_aerea_empresa: boolean
  pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
  pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
  pode_ser_armazem_alfandegado_empresa: boolean
  pode_ser_armazem_nacional_empresa: boolean
  pode_ser_banco_empresa: boolean
  pode_ser_seguradora_internacional_empresa: boolean
  pode_ser_seguradora_corretora_cambio_empresa: boolean
  ativo_empresa: boolean
}

export interface ListaEmpresas {
  itens: Empresa[]
  total: number
  pagina: number
  por_pagina: number
}

export interface Pais {
  id_pais: string
  codigo_pais_iso_alpha2: string      // ISO-2 (BR, US, CN...)
  codigo_pais_iso_alpha3: string      // ISO-3 (BRA, USA, CHN...)
  nome_pais_portugues: string
  nome_pais_ingles: string
  ativo_pais: boolean
}

// ── ExportadorQuandoImportacao (espelho do schema do Cadastros) ──────────────

export interface ExportadorQuandoImportacaoDto {
  id_exportador_quando_importacao: string
  id_organizacao: string
  id_workspace: string
  nome_exportador: string
  endereco_exportador: string | null
  cidade_exportador: string | null
  estado_provincia_exportador: string | null
  pais_exportador: string
  zipcode_exportador: string | null
  criado_em_exportador: string
  atualizado_em_exportador: string
}

export interface ListaExportadoresQuandoImportacao {
  itens: ExportadorQuandoImportacaoDto[]
  total: number
  pagina: number
  por_pagina: number
}

// ── ImportadorQuandoExportacao (espelho do schema do Cadastros) ──────────────

export interface ImportadorQuandoExportacaoDto {
  id_importador_quando_exportacao: string
  id_organizacao: string
  id_workspace: string
  nome_importador: string
  endereco_importador: string | null
  cidade_importador: string | null
  estado_provincia_importador: string | null
  pais_importador: string
  zipcode_importador: string | null
  criado_em_importador: string
  atualizado_em_importador: string
}

export interface ListaImportadoresQuandoExportacao {
  itens: ImportadorQuandoExportacaoDto[]
  total: number
  pagina: number
  por_pagina: number
}

// ── Payload de criação rápida — papel definido pelo contexto do modal ────────

export type PapelEmpresaRapido =
  | 'importador'
  | 'exportador'
  | 'fabricante'

export interface CriarEmpresaRapidoInput {
  nome_empresa: string
  pais_empresa: string
  /** CNPJ obrigatório quando pais_empresa==='BR'. Validado no cliente antes de chamar. */
  cnpj_empresa?: string | null
  /** TIN obrigatório quando pais_empresa!=='BR'. Validado no cliente antes de chamar. */
  tin_empresa?: string | null
  papel: PapelEmpresaRapido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCriarEmpresaPayload(input: CriarEmpresaRapidoInput): Record<string, unknown> {
  // id_organizacao é EXIGIDO pelo criarEmpresaSchema (Zod) do Cadastros — Mand.
  // 06/09. O `request()` já injeta o header x-id-organizacao, mas o schema
  // valida o body antes do controller, então enviamos explícito também.
  // Defesa em profundidade: header (proxy) + body (Zod).
  const { idOrganizacao } = getApiContext()

  const papelFlags: Record<string, boolean> = {
    pode_ser_importador_empresa:  input.papel === 'importador',
    pode_ser_exportador_empresa:  input.papel === 'exportador',
    pode_ser_fabricante_empresa:  input.papel === 'fabricante',
  }

  const ehBr = input.pais_empresa === 'BR'
  return {
    id_organizacao:      idOrganizacao,
    nome_empresa:        input.nome_empresa.trim(),
    pais_empresa:        input.pais_empresa,
    cnpj_empresa:        ehBr && input.cnpj_empresa ? input.cnpj_empresa.trim() : null,
    tin_empresa:         !ehBr && input.tin_empresa ? input.tin_empresa.trim() : null,
    ...papelFlags,
    ativo_empresa:       true,
  }
}

// ── API público ───────────────────────────────────────────────────────────────

export const cadastrosApi = {
  /**
   * Lista empresas da organização. Suporta filtro por busca textual no nome.
   * `por_pagina` máximo é 200 no backend; usamos 200 por padrão para evitar
   * paginação no SelectGlobal (cenário Manual de criar pedido).
   */
  listarEmpresas: (busca?: string, por_pagina = 200): Promise<ListaEmpresas> => {
    const params = new URLSearchParams({ por_pagina: String(por_pagina) })
    if (busca && busca.trim()) params.set('busca', busca.trim())
    return request<ListaEmpresas>(`/api/v1/empresas?${params.toString()}`)
  },

  /**
   * Resolve a empresa-da-organização (1:1) — a Empresa cadastrada em Cadastros
   * que representa a própria organização do usuário. Distingue-se das demais
   * empresas (parceiros estrangeiros, fabricantes) via lookup cross-banco:
   * Configurador.Organizacao.suid_empresa_organizacao → Cadastros.Empresa.
   *
   * Usado pelo ModalPedidoNovo para auto-preencher o Importador (em IMPORTACAO)
   * ou Exportador (em EXPORTACAO) — esse lado fica somente leitura, com tooltip.
   *
   * Mandamento 08 (sem fallbacks silenciosos): erro 404 sobe com mensagem clara
   * para a UI exibir ao master do workspace.
   */
  obterEmpresaDaOrganizacao: (): Promise<Empresa> =>
    request<Empresa>('/api/v1/empresas/da-organizacao'),

  /**
   * Cria empresa via fluxo rápido do modal de Pedido. Apenas nome+país+papel
   * são preenchidos — usuário completa demais dados depois no Cadastros.
   * Lança erro com mensagem específica para 401/403/409/422 (Mandamento 08).
   */
  criarEmpresa: async (input: CriarEmpresaRapidoInput): Promise<Empresa> => {
    const payload = toCriarEmpresaPayload(input)
    return request<Empresa>('/api/v1/empresas', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Lista países (fonte única — já vem ordenado: Brasil primeiro).
   */
  listarPaises: (): Promise<{ itens: Pais[] }> =>
    request<{ itens: Pais[] }>('/api/v1/cadastros/paises'),

  // ── ExportadorQuandoImportacao ─────────────────────────────────────────────

  /**
   * Lista exportadores (contrapartes estrangeiras/fornecedores) vinculados
   * à organização. Filtra opcionalmente por workspace e busca textual.
   */
  listarExportadoresQuandoImportacao: (idWorkspace?: string, busca?: string): Promise<ListaExportadoresQuandoImportacao> => {
    const params = new URLSearchParams({ por_pagina: '200' })
    if (idWorkspace) params.set('id_workspace', idWorkspace)
    if (busca && busca.trim()) params.set('busca', busca.trim())
    return request<ListaExportadoresQuandoImportacao>(`/api/v1/cadastros/exportadores-quando-importacao?${params.toString()}`)
  },

  /**
   * Busca exportador por ID.
   */
  obterExportadorQuandoImportacao: (id: string): Promise<ExportadorQuandoImportacaoDto> =>
    request<ExportadorQuandoImportacaoDto>(`/api/v1/cadastros/exportadores-quando-importacao/${id}`),

  // ── ImportadorQuandoExportacao ─────────────────────────────────────────────

  /**
   * Lista importadores (contrapartes estrangeiras/compradores) vinculados
   * à organização. Filtra opcionalmente por workspace e busca textual.
   */
  listarImportadoresQuandoExportacao: (idWorkspace?: string, busca?: string): Promise<ListaImportadoresQuandoExportacao> => {
    const params = new URLSearchParams({ por_pagina: '200' })
    if (idWorkspace) params.set('id_workspace', idWorkspace)
    if (busca && busca.trim()) params.set('busca', busca.trim())
    return request<ListaImportadoresQuandoExportacao>(`/api/v1/cadastros/importadores-quando-exportacao?${params.toString()}`)
  },

  /**
   * Busca importador por ID.
   */
  obterImportadorQuandoExportacao: (id: string): Promise<ImportadorQuandoExportacaoDto> =>
    request<ImportadorQuandoExportacaoDto>(`/api/v1/cadastros/importadores-quando-exportacao/${id}`),
}
