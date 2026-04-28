// =====================================================================
// Refatoração DDD — imprime o plano de um serviço em formato legível
// =====================================================================
// Uso:
//   tsx scripts/refatoracao-ddd/gerar-plano-servico.ts <nome-do-servico>
// Exemplo:
//   tsx scripts/refatoracao-ddd/gerar-plano-servico.ts Cadastros
// =====================================================================

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PlanoCompleto, PlanoServico } from './tipos.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function main() {
  const servicoAlvo = process.argv[2]
  if (!servicoAlvo) {
    console.error('Uso: tsx gerar-plano-servico.ts <nome-do-servico>')
    console.error('Ex: tsx gerar-plano-servico.ts Cadastros')
    process.exit(1)
  }
  const planoPath = resolve(__dirname, 'plano.json')
  const plano = JSON.parse(readFileSync(planoPath, 'utf8')) as PlanoCompleto

  // Busca case-insensitive e por prefixo
  const servicos = Object.keys(plano.servicos)
  const match =
    servicos.find((s) => s === servicoAlvo) ||
    servicos.find((s) => s.toLowerCase() === servicoAlvo.toLowerCase()) ||
    servicos.find((s) => s.toLowerCase().includes(servicoAlvo.toLowerCase()))

  if (!match) {
    console.error(`Serviço "${servicoAlvo}" não encontrado.`)
    console.error(`Disponíveis: ${servicos.join(', ')}`)
    process.exit(1)
  }

  const p: PlanoServico = plano.servicos[match]
  console.log('='.repeat(72))
  console.log(`PLANO DE REFATORAÇÃO DDD — ${p.servico}`)
  console.log(`Gerado em: ${plano.geradoEm}`)
  console.log('='.repeat(72))
  console.log(
    `\nResumo: ${p.contagem.renameCampos} renames, ${p.contagem.deleteCampos} deletes, ${p.contagem.createCampos} creates (campos) | ${p.contagem.renameModels}R/${p.contagem.deleteModels}D (models) | ${p.contagem.renameEnums}R (enums) | ${p.contagem.renameRotas}R/${p.contagem.deleteRotas}D (rotas)`,
  )

  // --- Models ---
  if (p.models.length) {
    console.log('\n─── MODELS ───')
    for (const m of p.models) {
      if (m.acao === 'RENAME') {
        console.log(`  RENAME  ${m.pgAtual} → ${m.pgNovo}   (Prisma: ${m.prismaAtual} → ${m.prismaNovo})`)
      } else {
        console.log(`  DELETE  ${m.pgAtual}   (${m.descricao})`)
      }
    }
  }

  // --- Enums ---
  if (p.enums.length) {
    console.log('\n─── ENUMS ───')
    for (const e of p.enums) {
      console.log(`  RENAME  ${e.nomeAtual} → ${e.nomeNovo}`)
      console.log(`    valores (mantidos EN UPPER_SNAKE — REGRA 07): ${e.valoresAtuais.join(', ')}`)
    }
  }

  // --- Campos agrupados por tabela ---
  if (p.campos.length) {
    console.log('\n─── CAMPOS ───')
    const porTabela = new Map<string, typeof p.campos>()
    for (const c of p.campos) {
      const arr = porTabela.get(c.tabela) ?? []
      arr.push(c)
      porTabela.set(c.tabela, arr)
    }
    for (const [tabela, campos] of Array.from(porTabela.entries()).sort()) {
      console.log(`\n  [${tabela}] (${campos.length} alterações)`)
      for (const c of campos) {
        if (c.acao === 'RENAME') {
          const frontChange =
            c.frontAtual !== c.frontNovo ? `  | front: ${c.frontAtual} → ${c.frontNovo}` : ''
          console.log(
            `    RENAME  ${c.pgAtual.padEnd(32)} → ${c.pgNovo}${frontChange}`,
          )
        } else if (c.acao === 'DELETE') {
          console.log(`    DELETE  ${c.pgAtual}`)
        } else if (c.acao === 'CREATE') {
          console.log(
            `    CREATE  ${c.pgNovo}  (tipo: ${c.tipoDado || '?'}, obrig: ${c.obrigatorio}, default: ${c.valorPadrao || '-'})`,
          )
        }
      }
    }
  }

  // --- Rotas ---
  if (p.rotas.length) {
    console.log('\n─── ROTAS ───')
    for (const r of p.rotas) {
      if (r.acao === 'RENAME') {
        console.log(`  RENAME  ${r.metodo.padEnd(6)} ${r.rotaAtual} → ${r.rotaNova}   (${r.arquivoRota})`)
      } else {
        console.log(`  DELETE  ${r.metodo.padEnd(6)} ${r.rotaAtual}   (${r.arquivoRota})`)
      }
    }
  }

  console.log('\n' + '='.repeat(72))
  console.log('FIM DO PLANO — revise antes de executar aplicar-prisma.ts e aplicar-codigo.ts')
  console.log('='.repeat(72))
}

main()
