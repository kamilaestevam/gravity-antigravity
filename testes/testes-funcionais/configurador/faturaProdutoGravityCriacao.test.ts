// Teste FUNCIONAL — prova ponta-a-ponta que criar() persiste competência,
// customer_email e due_date no banco. Resolve o caso reportado 3× pelo dono
// onde o modal "Editar Fatura" abria com campos vazios.
//
// Roda contra o Postgres real (Railway via CONFIGURADOR_DATABASE_URL).
// Cleanup ao final apaga as faturas criadas no teste.

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { faturaProdutoGravityServico } from '../../../servicos-global/configurador/server/services/fatura-produto-gravity-service'
import { prisma } from '../../../servicos-global/configurador/server/lib/prisma'

// Org de teste — usa qualquer org existente para evitar criar/limpar org inteira
let ORG_ID = ''
const FATURAS_CRIADAS: string[] = []

beforeAll(async () => {
  // Pega a primeira organização existente para usar como tenant de teste
  const org = await prisma.organizacao.findFirst({ select: { id_organizacao: true } })
  if (!org) throw new Error('Nenhuma organização para teste — crie uma antes de rodar')
  ORG_ID = org.id_organizacao
})

afterAll(async () => {
  // Limpa apenas as faturas criadas neste teste
  if (FATURAS_CRIADAS.length > 0) {
    await prisma.produtoGravityFaturaItem.deleteMany({
      where: { id_fatura_produto_gravity: { in: FATURAS_CRIADAS } },
    })
    await prisma.produtoGravityFatura.deleteMany({
      where: { id_fatura_produto_gravity: { in: FATURAS_CRIADAS } },
    })
  }
  await prisma.$disconnect()
})

describe('faturaProdutoGravityServico.criar — persistência de campos opcionais', () => {
  it('persiste competencia quando enviada', async () => {
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste competência',
      line_items: [{ description: 'Item', amount_cents: 10000, quantity: 1 }],
      competencia: '2026-04',
      auto_finalize: false,
    })
    FATURAS_CRIADAS.push(fatura.id)

    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: fatura.id },
    })
    expect(row?.competencia_fatura_produto_gravity).toBe('2026-04')
  })

  it('persiste customer_email quando enviado', async () => {
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste email',
      line_items: [{ description: 'Item', amount_cents: 10000, quantity: 1 }],
      customer_email: 'teste@cliente-fatura.com',
      auto_finalize: false,
    })
    FATURAS_CRIADAS.push(fatura.id)

    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: fatura.id },
    })
    expect(row?.email_organizacao_fatura_produto_gravity).toBe('teste@cliente-fatura.com')
  })

  it('persiste due_date como data_fatura quando enviado', async () => {
    const dueDate = '2026-08-15T23:59:59.000Z'
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste vencimento',
      line_items: [{ description: 'Item', amount_cents: 10000, quantity: 1 }],
      due_date: dueDate,
      auto_finalize: false,
    })
    FATURAS_CRIADAS.push(fatura.id)

    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: fatura.id },
    })
    expect(row?.data_fatura_produto_gravity.toISOString()).toBe(dueDate)
    // Confirma que data_fatura ≠ data_criacao (garantia que due_date NÃO foi ignorado)
    expect(row?.data_fatura_produto_gravity.getTime()).not.toBe(row?.data_criacao_fatura_produto_gravity.getTime())
  })

  it('paraFaturaDto retorna due_date != null (regressão do hardcoded null)', async () => {
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste DTO',
      line_items: [{ description: 'Item', amount_cents: 10000, quantity: 1 }],
      due_date: '2026-09-01T00:00:00.000Z',
      auto_finalize: false,
    })
    FATURAS_CRIADAS.push(fatura.id)

    const dto = await faturaProdutoGravityServico.obterPorId(fatura.id)
    expect(dto?.due_date).not.toBeNull()
    expect(dto?.due_date).toBe('2026-09-01T00:00:00.000Z')
  })

  it('persiste todos os 3 campos juntos', async () => {
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste completo',
      line_items: [
        { description: 'Item A', amount_cents: 5000, quantity: 2 },
        { description: 'Item B', amount_cents: 3000, quantity: 1 },
      ],
      competencia: '2026-12',
      customer_email: 'tudo-junto@cliente.com',
      due_date: '2026-12-31T00:00:00.000Z',
      auto_finalize: true,
    })
    FATURAS_CRIADAS.push(fatura.id)

    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: fatura.id },
      include: { itens_fatura_produto_gravity: true },
    })

    expect(row?.competencia_fatura_produto_gravity).toBe('2026-12')
    expect(row?.email_organizacao_fatura_produto_gravity).toBe('tudo-junto@cliente.com')
    expect(row?.data_fatura_produto_gravity.toISOString()).toBe('2026-12-31T00:00:00.000Z')
    expect(row?.status_fatura_produto_gravity).toBe('OPEN') // auto_finalize=true
    expect(row?.itens_fatura_produto_gravity).toHaveLength(2)
    expect(Number(row?.valor_total_fatura_produto_gravity)).toBe(130) // (50×2 + 30×1) / 100
  })

  it('atualizar() com itens recalcula valor_total', async () => {
    const fatura = await faturaProdutoGravityServico.criar({
      customer_tenant_id: ORG_ID,
      description: 'Teste PATCH',
      line_items: [{ description: 'Original', amount_cents: 1000, quantity: 1 }],
      auto_finalize: false,
    })
    FATURAS_CRIADAS.push(fatura.id)

    await faturaProdutoGravityServico.atualizar({
      id_fatura_produto_gravity: fatura.id,
      id_organizacao:            ORG_ID,
      competencia:               '2026-06',
      itens: [
        { descricao_fatura_item_produto_gravity: 'Novo A', quantidade_fatura_item_produto_gravity: 3, valor_unitario_fatura_item_produto_gravity: 50 },
        { descricao_fatura_item_produto_gravity: 'Novo B', quantidade_fatura_item_produto_gravity: 1, valor_unitario_fatura_item_produto_gravity: 200 },
      ],
    })

    const row = await prisma.produtoGravityFatura.findUnique({
      where: { id_fatura_produto_gravity: fatura.id },
      include: { itens_fatura_produto_gravity: true },
    })
    expect(row?.competencia_fatura_produto_gravity).toBe('2026-06')
    expect(row?.itens_fatura_produto_gravity).toHaveLength(2)
    expect(Number(row?.valor_total_fatura_produto_gravity)).toBe(350) // 3×50 + 1×200
  })
})
