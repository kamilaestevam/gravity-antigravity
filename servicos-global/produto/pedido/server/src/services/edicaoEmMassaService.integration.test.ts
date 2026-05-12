/**
 * edicaoEmMassaService.integration.test.ts
 *
 * Testes de integração REAIS contra o banco de dados.
 * Cria dados de teste, executa o service, verifica persistência, limpa tudo.
 *
 * Refatoração DDD-puro (Líder Técnico, 2026-05-12):
 *   - Sem ACL: frontend envia nome exato da coluna do Prisma
 *   - 5 argumentos no confirmar(): id_organizacao, id_usuario, nome_usuario, db, payload
 *
 * Requer: DATABASE_URL configurada no .env
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Carregar .env do produto pedido antes de instanciar PrismaClient
config({ path: resolve(__dirname, '../../../.env') })

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { EdicaoEmMassaService } from './edicaoEmMassaService.js'

// ── Setup ─────────────────────────────────────────────────────────────────────

const prisma  = new PrismaClient()
const service = new EdicaoEmMassaService()

const ID_ORG     = 'org-test-edicao-massa'
const ID_WS      = 'ws-test-edicao-massa'
const ID_USER    = 'user-test'
const NOME_USER  = 'Usuário Teste'
const PEDIDO_ID  = 'pedi_test_edicao_massa_01'
const ITEM_ID    = 'pite_test_edicao_massa_01'

// ── Dados de teste ────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Limpar qualquer resíduo de run anterior
  await prisma.pedidoItem.deleteMany({ where: { id_organizacao: ID_ORG } })
  await prisma.pedido.deleteMany({ where: { id_organizacao: ID_ORG } })

  await prisma.pedido.create({
    data: {
      id_pedido:               PEDIDO_ID,
      id_organizacao:          ID_ORG,
      id_workspace:            ID_WS,
      tipo_operacao_pedido:    'importacao',
      numero_pedido:           'PO-TEST-EDICAO-MASSA',
      status_pedido:           'aberto',
      moeda_pedido:            'USD',
      quantidade_total_pedido: 100,
      valor_total_pedido:      999,
    },
  })

  await prisma.pedidoItem.create({
    data: {
      id_item:                            ITEM_ID,
      id_organizacao:                     ID_ORG,
      id_workspace:                       ID_WS,
      id_pedido:                          PEDIDO_ID,
      sequencia_item_pedido:              1,
      part_number_item:                   'TEST-PART-001',
      ncm_item:                           '0000.00.00',
      descricao_item:                     'Item de Teste',
      quantidade_inicial_item:            100,
      quantidade_atual_item:              100,
      quantidade_pronta_item:             10,
      quantidade_transferida_item:        20,
      quantidade_cancelada_item:          5,
      casas_decimais_quantidade_item:     2,
      moeda_item:                         'USD',
      valor_por_unidade_item:             9.99,
      valor_total_item:                   999,
    },
  })
})

afterAll(async () => {
  await prisma.pedidoItem.deleteMany({ where: { id_organizacao: ID_ORG } })
  await prisma.pedido.deleteMany({ where: { id_organizacao: ID_ORG } })
  await prisma.$disconnect()
})

async function lerItem() {
  return prisma.pedidoItem.findUnique({ where: { id_item: ITEM_ID } })
}

async function lerPedido() {
  return prisma.pedido.findUnique({ where: { id_pedido: PEDIDO_ID } })
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('EdicaoEmMassaService — integração real (DDD-puro)', () => {

  describe('preview()', () => {

    it('lê quantidade_inicial_item direto da coluna DDD', async () => {
      const resultado = await service.preview(ID_ORG, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 200,
        }],
        nivel: 'item',
      })

      expect(resultado.campos[0].valores_distintos).toContain('100')
      expect(resultado.campos[0].valores_distintos).not.toContain('')
    })

    it('lê quantidade_transferida_item direto da coluna DDD', async () => {
      const resultado = await service.preview(ID_ORG, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_transferida_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 99,
        }],
        nivel: 'item',
      })

      expect(resultado.campos[0].valores_distintos).toContain('20')
    })
  })

  describe('confirmar() — persistência real no banco', () => {

    it('persiste quantidade_inicial_item via nome DDD direto', async () => {
      await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 777,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_inicial_item)).toBe(777)
    })

    it('persiste quantidade_pronta_item via nome DDD', async () => {
      await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_pronta_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 30,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_pronta_item)).toBe(30)
    })

    it('persiste quantidade_cancelada_item via nome DDD', async () => {
      await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_cancelada_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'substituir',
          valor: 2,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_cancelada_item)).toBe(2)
    })

    it('operação "somar" usa o valor atual do banco (lendo coluna DDD)', async () => {
      await prisma.pedidoItem.update({
        where: { id_item: ITEM_ID, id_organizacao: ID_ORG },
        data: { quantidade_inicial_item: 100 },
      })

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item',
          tipo: 'numero',
          nivel: 'item',
          operacao: 'somar',
          valor: 50,
        }],
        nivel: 'item',
      })

      const item = await lerItem()
      expect(Number(item?.quantidade_inicial_item)).toBe(150) // 100 + 50
    })

    it('retorna contadores reais: pedidos_atualizados=1, itens_atualizados=1, erros=[]', async () => {
      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item',
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

    it('recalcularAgregados atualiza quantidade_total_pedido a partir dos itens', async () => {
      await prisma.pedidoItem.update({
        where: { id_item: ITEM_ID, id_organizacao: ID_ORG },
        data: { quantidade_inicial_item: 500, valor_por_unidade_item: 10 },
      })

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
        pedido_ids: [PEDIDO_ID],
        campos: [{
          campo: 'quantidade_inicial_item',
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

    it('UPDATE de item respeita id_organizacao no where (org isolation)', async () => {
      const itemAntes = await lerItem()
      const valorAntes = Number(itemAntes?.quantidade_inicial_item)

      // Tentar editar com outra organização — service rejeita porque não encontra
      await expect(
        service.confirmar('org-outra', ID_USER, NOME_USER, prisma, {
          pedido_ids: [PEDIDO_ID],
          campos: [{
            campo: 'quantidade_inicial_item',
            tipo: 'numero',
            nivel: 'item',
            operacao: 'substituir',
            valor: 9999,
          }],
          nivel: 'item',
        })
      ).rejects.toThrow('Nenhum pedido encontrado para edição')

      const itemDepois = await lerItem()
      expect(Number(itemDepois?.quantidade_inicial_item)).toBe(valorAntes)
      expect(Number(itemDepois?.quantidade_inicial_item)).not.toBe(9999)
    })

    it('rejeita campo bloqueado (quantidade_atual_item — saldoEngine)', async () => {
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
          pedido_ids: [PEDIDO_ID],
          campos: [{
            campo: 'quantidade_atual_item',
            tipo: 'numero',
            nivel: 'item',
            operacao: 'substituir',
            valor: 0,
          }],
          nivel: 'item',
        })
      ).rejects.toThrow()
    })

    it('rejeita id_organizacao no payload (vetor cross-org)', async () => {
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, prisma, {
          pedido_ids: [PEDIDO_ID],
          campos: [{
            campo: 'id_organizacao',
            tipo: 'texto',
            nivel: 'pedido',
            operacao: 'substituir',
            valor: 'org-hacker',
          }],
          nivel: 'pedido',
        })
      ).rejects.toThrow()
    })
  })
})
