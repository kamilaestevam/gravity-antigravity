/**
 * edicaoEmMassaService.integration.test.ts
 *
 * Testes de integração REAIS contra o banco de dados.
 * Cria dados de teste, executa o service, verifica persistência, limpa tudo.
 *
 * Requer: DATABASE_URL configurada no .env
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { EdicaoEmMassaService } from './edicaoEmMassaService.js'

// ── Setup ─────────────────────────────────────────────────────────────────────

const prisma  = new PrismaClient()
const service = new EdicaoEmMassaService()

const TENANT     = 'tenant-test-edicao-massa'
const COMPANY    = 'company-test-edicao-massa'
const PEDIDO_ID  = 'pedi_test_edicao_massa_01'
const ITEM_ID    = 'pite_test_edicao_massa_01'

// ── Dados de teste ────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Limpar qualquer resíduo de run anterior
  await prisma.pedidoItem.deleteMany({ where: { tenant_id: TENANT } })
  await prisma.pedido.deleteMany({ where: { tenant_id: TENANT } })

  await prisma.pedido.create({
    data: {
      id:                     PEDIDO_ID,
      tenant_id:              TENANT,
      company_id:             COMPANY,
      tipo_operacao:          'importacao',
      numero_pedido:          'PO-TEST-EDICAO-MASSA',
      status:                 'aberto',
      moeda_pedido:           'USD',
      cobertura_cambial:      'com_cobertura',
      quantidade_total_pedido: 100,
      valor_total_pedido:     999,
    },
  })

  await prisma.pedidoItem.create({
    data: {
      id:                            ITEM_ID,
      tenant_id:                     TENANT,
      company_id:                    COMPANY,
      pedido_id:                     PEDIDO_ID,
      sequencia_item:                1,
      part_number:                   'TEST-PART-001',
      ncm:                           '0000.00.00',
      descricao_item:                'Item de Teste',
      quantidade_inicial_pedido:     100,
      quantidade_saldo_pedido:       100,
      quantidade_pronta_pedido:      10,
      quantidade_transferida_pedido: 20,
      quantidade_cancelada_pedido:   5,
      casas_decimais_quantidade_item: 2,
      moeda_item:                    'USD',
      valor_por_unidade_item:        9.99,
      valor_total_item:              999,
      casas_decimais_total_item:     2,
    },
  })
})

afterAll(async () => {
  await prisma.pedidoItem.deleteMany({ where: { tenant_id: TENANT } })
  await prisma.pedido.deleteMany({ where: { tenant_id: TENANT } })
  await prisma.$disconnect()
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function lerItem() {
  return prisma.pedidoItem.findFirst({ where: { id: ITEM_ID } })
}

async function lerPedido() {
  return prisma.pedido.findFirst({ where: { id: PEDIDO_ID } })
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('EdicaoEmMassaService — integração com banco real', () => {

  describe('preview()', () => {

    it('exibe o valor real do banco (não alias vazio) no campo quantidade_inicial_item_pedido', async () => {
      const resultado = await service.preview(TENANT, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 999,
        }],
        nivel: 'item',
      })

      const campo = resultado.campos[0]
      // Deve mostrar '100' (valor real), nunca '' (alias inexistente)
      expect(campo.valores_distintos).toContain('100')
      expect(campo.valores_distintos).not.toContain('')
    })

    it('exibe valor real de quantidade_transferida_item', async () => {
      const resultado = await service.preview(TENANT, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_transferida_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 0,
        }],
        nivel: 'item',
      })

      expect(resultado.campos[0].valores_distintos).toContain('20')
      expect(resultado.campos[0].valores_distintos).not.toContain('')
    })

  })

  describe('confirmar() — persistência real no banco', () => {

    it('persiste quantidade_inicial via alias "quantidade_inicial_item_pedido"', async () => {
      await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 777,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_inicial_pedido)).toBe(777)
    })

    it('persiste quantidade_transferida via alias "quantidade_transferida_item"', async () => {
      await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_transferida_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 50,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_transferida_pedido)).toBe(50)
    })

    it('persiste quantidade_pronta via alias "quantidade_pronta_total"', async () => {
      await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_pronta_total',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 30,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_pronta_pedido)).toBe(30)
    })

    it('persiste quantidade_cancelada via alias "quantidade_cancelada_item_pedido"', async () => {
      await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_cancelada_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 2,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_cancelada_pedido)).toBe(2)
    })

    it('operação "somar" usa o valor atual do banco (não alias undefined)', async () => {
      // Resetar para valor conhecido
      await prisma.pedidoItem.update({
        where: { id: ITEM_ID, tenant_id: TENANT },
        data: { quantidade_inicial_pedido: 100 },
      })

      await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'somar',
          valor: 50,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_inicial_pedido)).toBe(150) // 100 + 50
    })

    it('retorna contadores reais: pedidos_atualizados=1, itens_atualizados=1, erros=[]', async () => {
      const resultado = await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 200,
        }],
        nivel: 'item',
      })

      expect(resultado.pedidos_atualizados).toBe(1)
      expect(resultado.itens_atualizados).toBe(1)
      expect(resultado.erros).toHaveLength(0)
    })

    it('recalcularAgregados atualiza quantidade_total_pedido no Pedido sem erro', async () => {
      await prisma.pedidoItem.update({
        where: { id: ITEM_ID, tenant_id: TENANT },
        data: { quantidade_inicial_pedido: 500, valor_por_unidade_item: 10 },
      })

      const resultado = await service.confirmar(TENANT, 'user-test', prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item_pedido',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 300,
        }],
        nivel: 'item',
      })

      expect(resultado.erros).toHaveLength(0)

      const pedido = await lerPedido()
      expect(Number(pedido?.quantidade_total_pedido)).toBe(300)
    })

    it('UPDATE de item inclui tenant_id no where (tenant isolation)', async () => {
      // Salvar valor antes
      const itemAntes = await lerItem()
      const valorAntes = Number(itemAntes?.quantidade_inicial_pedido)

      // Tentar editar com tenant diferente — service rejeita porque não encontra o pedido
      await expect(
        service.confirmar('tenant-outro', 'user-test', prisma, {
          pedido_ids: [PEDIDO_ID],
          campos: [{
            campo: 'quantidade_inicial_item_pedido',
            tipo: 'numero',
            nivel: 'item',
            operacao: 'substituir',
            valor: 9999,
          }],
          nivel: 'item',
        })
      ).rejects.toThrow('Nenhum pedido encontrado para edição')

      // Valor do banco permanece intacto
      const itemDepois = await lerItem()
      expect(Number(itemDepois?.quantidade_inicial_pedido)).toBe(valorAntes)
      expect(Number(itemDepois?.quantidade_inicial_pedido)).not.toBe(9999)
    })

    it('rejeita campo bloqueado com erro (saldo_item_pedido)', async () => {
      await expect(
        service.confirmar(TENANT, 'user-test', prisma, {
          pedido_ids: [PEDIDO_ID],
          campos: [{
            campo: 'saldo_item_pedido',
            tipo: 'numero',
            nivel: 'item',
            operacao: 'substituir',
            valor: 0,
          }],
          nivel: 'item',
        })
      ).rejects.toThrow()
    })

  })

})
