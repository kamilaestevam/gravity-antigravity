/**
 * mapeamentoMemoriaService.ts — Persistencia de mapeamentos de importacao por tenant
 *
 * Salva no banco (model MapeamentoImport) os mapeamentos confirmados pelo usuario.
 * Recupera por tenant_id + hash_colunas (hash dos cabecalhos ordenados).
 */

// ── Tipo local — espelha ColunaMapeada do client sem importar do client ────────

export interface ColunaMapeadaBackend {
  coluna_arquivo: string
  campo_sistema: string | null
  confianca: number
  nivel: 'auto' | 'confirmado' | 'manual' | 'ignorado'
  inferido_por: 'ia' | 'dados' | 'memoria' | 'usuario'
  exemplo_valor?: string | null
}

// ── Service ───────────────────────────────────────────────────────────────────

export class MapeamentoMemoriaService {
  // Prisma client injetado pelo router (req.prisma)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: Record<string, any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prismaClient: Record<string, any>) {
    this.db = prismaClient
  }

  async buscar(tenantId: string, hashColunas: string): Promise<ColunaMapeadaBackend[] | null> {
    try {
      const registro = await this.db['mapeamentoImport'].findUnique({
        where: {
          tenant_id_hash_colunas: {
            tenant_id: tenantId,
            hash_colunas: hashColunas,
          },
        },
      })
      if (!registro) return null
      return JSON.parse(registro.mapeamento as string) as ColunaMapeadaBackend[]
    } catch {
      // Tabela pode nao existir ainda em dev
      return null
    }
  }

  async salvar(
    tenantId: string,
    hashColunas: string,
    mapeamento: ColunaMapeadaBackend[],
  ): Promise<void> {
    try {
      await this.db['mapeamentoImport'].upsert({
        where: {
          tenant_id_hash_colunas: {
            tenant_id: tenantId,
            hash_colunas: hashColunas,
          },
        },
        create: {
          tenant_id:    tenantId,
          hash_colunas: hashColunas,
          mapeamento:   JSON.stringify(mapeamento),
          uso_count:    1,
        },
        update: {
          mapeamento: JSON.stringify(mapeamento),
          uso_count:  { increment: 1 },
          updated_at: new Date(),
        },
      })
    } catch {
      // Tabela pode nao existir ainda — nao bloquear a operacao
      console.warn('[MapeamentoMemoria] Tabela mapeamentoImport nao disponivel, pulando persistencia')
    }
  }

  async resetar(tenantId: string, hashColunas: string): Promise<void> {
    try {
      await this.db['mapeamentoImport'].delete({
        where: {
          tenant_id_hash_colunas: {
            tenant_id: tenantId,
            hash_colunas: hashColunas,
          },
        },
      })
    } catch {
      // Ignorar se nao existir
    }
  }
}
