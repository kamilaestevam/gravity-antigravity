/**
 * Gerador do plano de teste em tela — Edição em Massa (Pedido/Lista).
 * Deriva as etapas campo a campo do SSOT `camposEdicaoMassa.ts` (zero drift:
 * se o SSOT mudar, rodar este script regenera o plano com a lista atual).
 *
 * Formato segue o modelo do plano TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045:
 * passos numerados globalmente, print nomeado em cada passo («Print NN-….png
 * (sucesso ou erro)») e seção «Prints planejados» ao final.
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/edicao-em-massa/plano-de-teste/gerar-plano-edicao-em-massa.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
  CAMPOS_BLOQUEADOS_PEDIDO,
  CAMPOS_BLOQUEADOS_ITEM,
} from '../../../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const DESTINO = resolve(__dir, 'plano-teste-em-tela.md')

type CampoMassa = (typeof CAMPOS_EDICAO_MASSA_PEDIDO)[number]

const ROTULO_TIPO: Record<string, string> = {
  texto: 'texto livre',
  numero: 'numérico',
  data: 'data (date picker)',
  select: 'seleção (dropdown com busca)',
}

/**
 * Numeração global de passos — mantida em sincronia com os slugs de print do
 * runner `run-lista-edicao-em-massa.ts` (PASSO_BASE_CAMPOS).
 */
const prints: Array<{ passo: string; arquivo: string; estado: string }> = []

function fmtPasso(n: number): string {
  return String(n).padStart(3, '0')
}

function registrarPrint(passo: number, arquivo: string, estado: string): string {
  prints.push({ passo: fmtPasso(passo), arquivo, estado })
  return `Print \`${arquivo}\` (sucesso ou erro)`
}

function slugCampo(campo: string): string {
  return campo.replace(/[^a-z0-9_]/gi, '')
}

function agruparPorGrupo(campos: readonly CampoMassa[]): Map<string, CampoMassa[]> {
  const mapa = new Map<string, CampoMassa[]>()
  for (const c of campos) {
    const lista = mapa.get(c.grupo) ?? []
    lista.push(c)
    mapa.set(c.grupo, lista)
  }
  return mapa
}

function blocoGrupo(
  numeroEtapa: number,
  nivel: 'PEDIDO' | 'ITEM',
  grupo: string,
  campos: CampoMassa[],
  passoInicial: number,
): { md: string; proximoPasso: number } {
  const nivelTxt = nivel === 'PEDIDO' ? 'Pedido' : 'Item'
  const linhas: string[] = [
    `### ETAPA ${numeroEtapa} — ${nivel} · ${grupo.toUpperCase()} (passos ${fmtPasso(passoInicial)}–${fmtPasso(passoInicial + campos.length - 1)})`,
    '',
    `Nível do modal: **${nivelTxt}**. Por campo: selecionar pedido-alvo → abrir modal → nível ${nivelTxt} → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.`,
    '',
    '| Passo | Ação | APROVADO quando |',
    '|-------|------|-----------------|',
  ]
  let passo = passoInicial
  for (const c of campos) {
    const slug = `${fmtPasso(passo)}-${slugCampo(c.campo)}`
    const modo = passo % 2 === 0
      ? 'partindo de campo **vazio** (preencher)'
      : 'partindo de campo **pré-preenchido** (substituir)'
    const printSel = registrarPrint(passo, `${slug}-selecao.png`, `${c.rotulo} — passo Revisão com de→para visível`)
    const printRes = registrarPrint(passo, `${slug}-resultado.png`, `${c.rotulo} — lista após aplicar`)
    linhas.push(
      `| **${fmtPasso(passo)}** | Editar em massa \`${c.campo}\` (${c.rotulo}, ${ROTULO_TIPO[c.tipo] ?? c.tipo}) ${modo} | Preview de→para correto · valor aplicado na lista · persiste após F5 · ${printSel} · ${printRes} |`,
    )
    passo++
  }
  linhas.push('')
  return { md: linhas.join('\n'), proximoPasso: passo }
}

function gerar(): string {
  const gruposPedido = agruparPorGrupo(CAMPOS_EDICAO_MASSA_PEDIDO)
  const gruposItem = agruparPorGrupo(CAMPOS_EDICAO_MASSA_ITEM)
  const totalCampos = CAMPOS_EDICAO_MASSA_PEDIDO.length + CAMPOS_EDICAO_MASSA_ITEM.length
  const partes: string[] = []

  partes.push(`# Plano de Teste em Tela — Pedido / Lista / Edição em Massa

**ID:** TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
**Data:** 2026-06-11
**Versão:** 1.0
**Criticidade:** alta
**Skill:** \`skills/testes/teste-em-tela/SKILL.md\`

**Escopo pasta:** \`testes/testes-em-tela/pedido/lista/edicao-em-massa/\`
**Plano + runner:** \`plano-de-teste/\` (este arquivo + \`run-lista-edicao-em-massa.ts\` + \`gerar-plano-edicao-em-massa.ts\`)
**Prints:** \`../resultado-teste/<runId>/\` — uma pasta por execução
**SSOT:** \`servicos-global/produto/pedido/shared/camposEdicaoMassa.ts\` — ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos pedido + ${CAMPOS_EDICAO_MASSA_ITEM.length} campos item = **${totalCampos} campos** + 8 tipos de colunas manuais

> O modal Admin («O que será testado») agrupa casos pelos títulos \`### ETAPA …\` abaixo. **Não remover** essa estrutura.
> **Plano gerado** por \`gerar-plano-edicao-em-massa.ts\` — não editar tabelas de campos à mão; regenerar a partir do SSOT.

---

## Regra de sequência dos prints

> **Padrão obrigatório** por campo editado em massa, **dois** prints em sequência:
>
> 1. **\`-selecao.png\`** — passo «Revisar alterações» com o de→para visível (antes de aplicar)
> 2. **\`-resultado.png\`** — grade **após aplicar** (sucesso ou erro visível na lista/toast)
>
> Validações de UX/drift/erros usam **um** print por verificação.

---

## Regras-mestre (valem para TODAS as etapas)

1. **Anti-viés 50/50** — passos pares partem de campo **vazio** (preencher); passos ímpares partem de campo **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Número anotado no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos 1 pedido de Importação e 1 de Exportação.
4. **Validação tripla por campo** — preview de→para correto; valor aplicado na lista; persiste após F5.
5. **UX intacta** — modal mantém 3 passos (Campos → Revisão → Resultado), 3 níveis (Combinado / Pedido / Item), combobox com busca e «Adicionar campo».
6. **Falha não bloqueia** — exceção em um campo reprova apenas aquela linha (\`EMT_ROW\`); o runner continua.

---

## Roteiro de execução
`)

  // ── ETAPA 0 — Preparação ──
  let passo = 1
  const p01 = registrarPrint(passo, `${fmtPasso(passo)}-estado-inicial.png`, 'Lista carregada pós-login no workspace de teste')
  partes.push(`### ETAPA 0 — PREPARAÇÃO (passos ${fmtPasso(passo)}–${fmtPasso(passo + 1)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Login Clerk + workspace de teste + abrir Lista de Pedidos | Lista com linhas editáveis · ${p01} |
| **${fmtPasso(passo + 1)}** | Varredura: eleger pedido-alvo (maior nº de itens) e confirmar Importação + Exportação presentes | rowId e nº do pedido anotados no relatório |
`)
  passo += 2

  // ── ETAPA 1 — Abertura e UX do modal ──
  const p03 = registrarPrint(passo, `${fmtPasso(passo)}-modal-aberto.png`, 'Modal Editar em Massa aberto — stepper, níveis e combobox')
  partes.push(`### ETAPA 1 — ABERTURA E UX DO MODAL (passo ${fmtPasso(passo)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Selecionar pedido-alvo (checkbox) → clicar «Edição em Massa» na barra | Título «Editar em Massa (1 pedido selecionado)» · stepper com 3 passos · toggle com 3 níveis · combobox com busca e grupos DDD · ${p03} |
`)
  passo += 1

  // ── ETAPA 2 — Guard-rail de drift ──
  const p04 = registrarPrint(passo, `${fmtPasso(passo)}-combobox-pedido.png`, `Combobox nível Pedido — ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos do SSOT`)
  const p05 = registrarPrint(passo + 1, `${fmtPasso(passo + 1)}-combobox-item.png`, `Combobox nível Item — ${CAMPOS_EDICAO_MASSA_ITEM.length} campos do SSOT`)
  partes.push(`### ETAPA 2 — GUARD-RAIL DE DRIFT (passos ${fmtPasso(passo)}–${fmtPasso(passo + 1)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Nível **Pedido**: listar campos do combobox | ≥ ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado (${[...CAMPOS_BLOQUEADOS_PEDIDO].slice(0, 4).map(c => `\`${c}\``).join(', ')}…) · ${p04} |
| **${fmtPasso(passo + 1)}** | Nível **Item**: listar campos do combobox | ≥ ${CAMPOS_EDICAO_MASSA_ITEM.length} campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado (${[...CAMPOS_BLOQUEADOS_ITEM].slice(0, 4).map(c => `\`${c}\``).join(', ')}…) · ${p05} |

> Bloqueados pedido (${CAMPOS_BLOQUEADOS_PEDIDO.length}): ${[...CAMPOS_BLOQUEADOS_PEDIDO].map(c => `\`${c}\``).join(', ')}
> Bloqueados item (${CAMPOS_BLOQUEADOS_ITEM.length}): ${[...CAMPOS_BLOQUEADOS_ITEM].map(c => `\`${c}\``).join(', ')}
`)
  passo += 2

  // ── ETAPAS de campos — PEDIDO ──
  let etapa = 3
  partes.push('\n---\n\n## CAMPOS DE PEDIDO — campo a campo\n')
  for (const [grupo, campos] of gruposPedido) {
    const bloco = blocoGrupo(etapa, 'PEDIDO', grupo, campos, passo)
    partes.push(bloco.md)
    passo = bloco.proximoPasso
    etapa++
  }

  // ── ETAPAS de campos — ITEM ──
  partes.push('\n---\n\n## CAMPOS DE ITEM — campo a campo\n')
  for (const [grupo, campos] of gruposItem) {
    const bloco = blocoGrupo(etapa, 'ITEM', grupo, campos, passo)
    partes.push(bloco.md)
    passo = bloco.proximoPasso
    etapa++
  }

  // ── ETAPA Combinado + cascade ──
  const pComb1 = registrarPrint(passo, `${fmtPasso(passo)}-combinado-incoterm-selecao.png`, 'Combinado: incoterm — preview de→para pedido+itens')
  const pComb2 = registrarPrint(passo, `${fmtPasso(passo)}-combinado-incoterm-resultado.png`, 'Combinado: incoterm aplicado — cascade pai+filhos na lista')
  partes.push(`---

### ETAPA ${etapa} — NÍVEL COMBINADO + CASCADE (passos ${fmtPasso(passo)}–${fmtPasso(passo + 1)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Nível **Combinado**: editar \`incoterm\` (espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens · linha pai e TODAS as filhas com novo valor · ${pComb1} · ${pComb2} |
| **${fmtPasso(passo + 1)}** | Combinado: campo só-pedido (\`observacoes_pedido\`) + só-item (\`part_number_item\`) na mesma sessão | Ambos aplicados nos escopos corretos · persiste após F5 |
`)
  passo += 2
  etapa++

  // ── ETAPA Colunas manuais — 8 tipos ──
  const TIPOS_COLUNA: Array<{ tipo: string; comportamento: string }> = [
    { tipo: 'texto', comportamento: 'Input texto livre' },
    { tipo: 'numero', comportamento: 'Input numérico' },
    { tipo: 'data', comportamento: 'Date picker' },
    { tipo: 'moeda', comportamento: 'Input numérico + formatação de moeda' },
    { tipo: 'percentual', comportamento: 'Input percentual' },
    { tipo: 'checkbox', comportamento: 'Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline)' },
    { tipo: 'tipo-documento', comportamento: 'Seleção de tipo de documento' },
  ]
  const linhasColunas: string[] = [
    `### ETAPA ${etapa} — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS (passos ${fmtPasso(passo)}–${fmtPasso(passo + 8)})`,
    '',
    `Criar (ou reutilizar) 1 coluna manual de **cada um dos 8 tipos**. Os 7 editáveis aparecem no grupo «Personalizadas» (convenção \`coluna_usuario:<id>\`); **fórmula NÃO aparece** (calculada). Metade dos tipos parte de valor vazio, metade de pré-preenchido (anti-viés).`,
    '',
    '| Passo | Ação | APROVADO quando |',
    '|-------|------|-----------------|',
  ]
  for (const { tipo, comportamento } of TIPOS_COLUNA) {
    const pSel = registrarPrint(passo, `${fmtPasso(passo)}-coluna-${tipo}-selecao.png`, `Coluna manual ${tipo} — passo Revisão`)
    const pRes = registrarPrint(passo, `${fmtPasso(passo)}-coluna-${tipo}-resultado.png`, `Coluna manual ${tipo} — lista após aplicar`)
    linhasColunas.push(`| **${fmtPasso(passo)}** | Editar em massa coluna manual tipo **${tipo}** | ${comportamento} · valor aplicado na célula da coluna · ${pSel} · ${pRes} |`)
    passo++
  }
  const pFormula = registrarPrint(passo, `${fmtPasso(passo)}-coluna-formula-bloqueada.png`, 'Combobox sem a coluna fórmula (bloqueada)')
  linhasColunas.push(`| **${fmtPasso(passo)}** | Coluna tipo **fórmula** | **NÃO listada** no combobox · célula continua exibindo valor calculado · ${pFormula} |`)
  passo++
  const pEscopo = registrarPrint(passo, `${fmtPasso(passo)}-coluna-escopo.png`, 'Colunas por escopo — pedido vs item sem vazamento')
  linhasColunas.push(`| **${fmtPasso(passo)}** | Validar escopo | Coluna escopo Pedido só no nível Pedido/Combinado; escopo Item só no nível Item/Combinado · ${pEscopo} |`)
  passo++
  linhasColunas.push('')
  partes.push(linhasColunas.join('\n'))
  etapa++

  // ── ETAPA Auto-fill tipo de operação ──
  const pOp1 = registrarPrint(passo, `${fmtPasso(passo)}-tipo-operacao-imp-exp.png`, 'Pedido Importação → Exportação em massa')
  const pOp2 = registrarPrint(passo + 1, `${fmtPasso(passo + 1)}-tipo-operacao-exp-imp.png`, 'Pedido Exportação → Importação em massa')
  const pOp3 = registrarPrint(passo + 2, `${fmtPasso(passo + 2)}-tipo-operacao-item.png`, 'tipo_operacao_item no nível Item')
  partes.push(`### ETAPA ${etapa} — AUTO-FILL TIPO DE OPERAÇÃO (passos ${fmtPasso(passo)}–${fmtPasso(passo + 2)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Pedido **Importação**: \`tipo_operacao_pedido\` → Exportação → reverter | Auto-fill dos campos dependentes coerente · reversão restaura estado · ${pOp1} |
| **${fmtPasso(passo + 1)}** | Pedido **Exportação**: → Importação → reverter | Comportamento simétrico · ${pOp2} |
| **${fmtPasso(passo + 2)}** | \`tipo_operacao_item\` no nível **Item** | Itens seguem a mesma regra · ${pOp3} |
`)
  passo += 3
  etapa++

  // ── ETAPA Erros e estados ──
  const pErr1 = registrarPrint(passo, `${fmtPasso(passo)}-erros-revisar-desabilitado.png`, '«Revisar alterações» desabilitado sem campos')
  const pErr2 = registrarPrint(passo + 1, `${fmtPasso(passo + 1)}-erros-unique-bloqueado.png`, 'numero_pedido bloqueado com >1 pedido (@@unique)')
  partes.push(`### ETAPA ${etapa} — ERROS, BLOQUEIOS E ESTADOS (passos ${fmtPasso(passo)}–${fmtPasso(passo + 3)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Avançar sem campo preenchido | «Revisar alterações» desabilitado · ${pErr1} |
| **${fmtPasso(passo + 1)}** | Campo \`@@unique\` (\`numero_pedido\`) com >1 pedido selecionado | Input bloqueado com aviso de colisão · ${pErr2} |
| **${fmtPasso(passo + 2)}** | «Voltar» no passo Revisão | Retorna ao passo Campos sem aplicar |
| **${fmtPasso(passo + 3)}** | «Cancelar» no passo Campos | Modal fecha sem aplicar nada |
`)
  passo += 4
  etapa++

  // ── ETAPA Persistência final ──
  const pFinal = registrarPrint(passo, `${fmtPasso(passo)}-persistencia-final.png`, 'Lista após navegar Hub→Lista — valores persistidos')
  partes.push(`### ETAPA ${etapa} — PERSISTÊNCIA FINAL + RELATÓRIO (passo ${fmtPasso(passo)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(passo)}** | Navegar Hub → voltar à Lista · gravar \`RESULTADO.txt\` | Valores das etapas anteriores persistem · relatório com todas as linhas \`EMT_ROW\` · ${pFinal} |
`)

  // ── Prints planejados ──
  partes.push(`---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
${prints.map(p => `| ${p.passo} | \`${p.arquivo}\` | ${p.estado} |`).join('\n')}
`)

  return partes.join('\n')
}

const md = gerar()
writeFileSync(DESTINO, md, 'utf8')
const totalEtapas = (md.match(/^### ETAPA /gm) ?? []).length
const totalPassos = (md.match(/^\| \*\*\d{3}\*\* \|/gm) ?? []).length
console.log(`Plano gerado: ${DESTINO}`)
console.log(`Etapas: ${totalEtapas} | Passos: ${totalPassos} | Prints planejados: ${prints.length}`)
