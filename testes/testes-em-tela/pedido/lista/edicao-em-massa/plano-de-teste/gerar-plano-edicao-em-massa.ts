/**
 * Gerador do plano de teste em tela — Edição em Massa (Pedido/Lista).
 * Deriva as etapas campo a campo do SSOT `camposEdicaoMassa.ts` (zero drift:
 * se o SSOT mudar, rodar este script regenera o plano com a lista atual).
 *
 * Formato segue o modelo do plano TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045:
 * passos numerados globalmente, print nomeado em cada passo («Print NN-….png
 * (sucesso ou erro)»), persistência hub→lista ao fim de cada etapa que altera
 * dados e seção «Prints planejados» ao final.
 *
 * A numeração de passos é compartilhada com o runner via
 * `numeracao-passos-edicao-em-massa.ts`.
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
import { NUMERACAO, fmtPasso, slugCampo, type GrupoPlano } from './numeracao-passos-edicao-em-massa.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const DESTINO = resolve(__dir, 'plano-teste-em-tela.md')

const ROTULO_TIPO: Record<string, string> = {
  texto: 'texto livre',
  numero: 'numérico',
  data: 'data (date picker)',
  select: 'seleção (dropdown com busca)',
}

const prints: Array<{ passo: string; arquivo: string; estado: string }> = []

function registrarPrint(passo: number, arquivo: string, estado: string): string {
  prints.push({ passo: fmtPasso(passo), arquivo, estado })
  return `Print \`${arquivo}\` (sucesso ou erro)`
}

function blocoGrupo(g: GrupoPlano): string {
  const nivelTxt = g.nivel === 'PEDIDO' ? 'Pedido' : 'Item'
  const primeiro = g.passos[0].passo
  const linhas: string[] = [
    `### ETAPA ${g.etapa} — ${g.nivel} · ${g.grupo.toUpperCase()} (passos ${fmtPasso(primeiro)}–${fmtPasso(g.passoPersistencia)})`,
    '',
    `Nível do modal: **${nivelTxt}**. Por campo: selecionar pedido-alvo → abrir modal → nível ${nivelTxt} → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.`,
    '',
    '| Passo | Ação | APROVADO quando |',
    '|-------|------|-----------------|',
  ]
  for (const { passo, campo } of g.passos) {
    const slug = `${fmtPasso(passo)}-${slugCampo(campo.campo)}`
    const modo = passo % 2 === 0
      ? 'partindo de campo **vazio** (preencher)'
      : 'partindo de campo **pré-preenchido** (substituir)'
    const printSel = registrarPrint(passo, `${slug}-selecao.png`, `${campo.rotulo} — passo Revisão com de→para visível`)
    const printRes = registrarPrint(passo, `${slug}-resultado.png`, `${campo.rotulo} — lista após aplicar`)
    linhas.push(
      `| **${fmtPasso(passo)}** | Editar em massa \`${campo.campo}\` (${campo.rotulo}, ${ROTULO_TIPO[campo.tipo] ?? campo.tipo}) ${modo} | Preview de→para correto · valor aplicado na lista · ${printSel} · ${printRes} |`,
    )
  }
  const printPersist = registrarPrint(
    g.passoPersistencia,
    `${g.slugPersistencia}.png`,
    `${g.nivel} · ${g.grupo} — grade após navegar hub→lista (persistência da etapa)`,
  )
  linhas.push(
    `| **${fmtPasso(g.passoPersistencia)}** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · ${printPersist} |`,
    '',
  )
  return linhas.join('\n')
}

function gerar(): string {
  const n = NUMERACAO
  const totalCampos = CAMPOS_EDICAO_MASSA_PEDIDO.length + CAMPOS_EDICAO_MASSA_ITEM.length
  const partes: string[] = []

  partes.push(`# Plano de Teste em Tela — Pedido / Lista / Edição em Massa

**ID:** TST-EMT-EDICAO-EM-MASSA-PEDIDO-LISTA-000081
**Data:** 2026-06-11
**Versão:** 1.1
**Criticidade:** alta
**Skill:** \`skills/testes/teste-em-tela/SKILL.md\`

**Escopo pasta:** \`testes/testes-em-tela/pedido/lista/edicao-em-massa/\`
**Plano + runner:** \`plano-de-teste/\` (este arquivo + \`run-lista-edicao-em-massa.ts\` + \`gerar-plano-edicao-em-massa.ts\` + \`numeracao-passos-edicao-em-massa.ts\`)
**Prints:** \`../resultado-teste/<runId>/\` — uma pasta por execução
**Regras de negócio:** \`documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-REGRAS-NEGOCIO.md\` · técnico: \`EDICAO-EM-MASSA-TECNICO.md\` · colunas manuais: \`COLUNAS-USUARIO-REGRAS-NEGOCIO.md\`
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

## Regra universal — persistência ao fim de cada ETAPA

> **Obrigatório** em toda \`### ETAPA …\` que altera dados (regra do modelo editar-salvar §Regra universal).

**Último passo de cada etapa de edição:** navegar para o **hub** → voltar à **Lista** → reencontrar e **reexpandir** o pedido-alvo → **APROVADO** quando tudo salvo na etapa permanece na grade.
**Print:** \`{passo}-{slug}-persistencia-apos-navegar-resultado.png\`
**Exceções:** ETAPA 0 (preparação), ETAPA 2 (drift — só leitura), etapa de erros (não aplica dados) e etapa final de relatório.

---

## Regras-mestre (valem para TODAS as etapas)

1. **Anti-viés 50/50** — passos pares partem de campo **vazio** (preencher); passos ímpares partem de campo **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Número anotado no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos 1 pedido de Importação e 1 de Exportação.
4. **Validação tripla por campo** — preview de→para correto; valor aplicado na lista; persistência validada no fechamento da etapa (hub→lista).
5. **UX intacta** — modal mantém 3 passos (Campos → Revisão → Resultado), 3 níveis (Combinado / Pedido / Item), combobox com busca e «Adicionar campo».
6. **Falha não bloqueia** — exceção em um campo reprova apenas aquela linha (\`EMT_ROW\`); o runner continua.

---

## Roteiro de execução
`)

  // ── ETAPA 0 ──
  const p01 = registrarPrint(1, '001-estado-inicial.png', 'Lista carregada pós-login no workspace de teste')
  partes.push(`### ETAPA 0 — PREPARAÇÃO (passos 001–002)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **001** | Login Clerk + workspace de teste + abrir Lista de Pedidos | Lista com linhas editáveis · ${p01} |
| **002** | Varredura: eleger pedido-alvo (maior nº de itens) e confirmar Importação + Exportação presentes | rowId e nº do pedido anotados no relatório |
`)

  // ── ETAPA 1 ──
  const p03 = registrarPrint(3, '003-modal-aberto.png', 'Modal Editar em Massa aberto — stepper, níveis e combobox')
  partes.push(`### ETAPA 1 — ABERTURA E UX DO MODAL (passo 003)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **003** | Selecionar pedido-alvo (checkbox) → clicar «Edição em Massa» na barra | Título «Editar em Massa (1 pedido selecionado)» · stepper com 3 passos · toggle com 3 níveis · combobox com busca e grupos DDD · ${p03} |
`)

  // ── ETAPA 2 ──
  const p04 = registrarPrint(4, '004-combobox-pedido.png', `Combobox nível Pedido — ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos do SSOT`)
  const p05 = registrarPrint(5, '005-combobox-item.png', `Combobox nível Item — ${CAMPOS_EDICAO_MASSA_ITEM.length} campos do SSOT`)
  partes.push(`### ETAPA 2 — GUARD-RAIL DE DRIFT (passos 004–005)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **004** | Nível **Pedido**: listar campos do combobox | ≥ ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado · ${p04} |
| **005** | Nível **Item**: listar campos do combobox | ≥ ${CAMPOS_EDICAO_MASSA_ITEM.length} campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado · ${p05} |

> Bloqueados pedido (${CAMPOS_BLOQUEADOS_PEDIDO.length}): ${[...CAMPOS_BLOQUEADOS_PEDIDO].map(c => `\`${c}\``).join(', ')}
> Bloqueados item (${CAMPOS_BLOQUEADOS_ITEM.length}): ${[...CAMPOS_BLOQUEADOS_ITEM].map(c => `\`${c}\``).join(', ')}
`)

  // ── Etapas de grupo (com persistência ao fim de cada uma) ──
  partes.push('\n---\n\n## CAMPOS DE PEDIDO — campo a campo\n')
  let emitiuItem = false
  for (const g of n.grupos) {
    if (g.nivel === 'ITEM' && !emitiuItem) {
      partes.push('\n---\n\n## CAMPOS DE ITEM — campo a campo\n')
      emitiuItem = true
    }
    partes.push(blocoGrupo(g))
  }

  let etapa = n.grupos[n.grupos.length - 1].etapa + 1

  // ── Combinado + cascade ──
  const pc = n.PASSO_COMBINADO
  const pComb1 = registrarPrint(pc, `${fmtPasso(pc)}-combinado-incoterm-selecao.png`, 'Combinado: incoterm — preview de→para pedido+itens')
  const pComb2 = registrarPrint(pc, `${fmtPasso(pc)}-combinado-incoterm-resultado.png`, 'Combinado: incoterm aplicado — cascade pai+filhos na lista')
  const pCombP = registrarPrint(n.PASSO_COMBINADO_PERSISTENCIA, `${fmtPasso(n.PASSO_COMBINADO_PERSISTENCIA)}-combinado-persistencia-apos-navegar-resultado.png`, 'Combinado — grade após navegar hub→lista')
  partes.push(`---

### ETAPA ${etapa} — NÍVEL COMBINADO + CASCADE (passos ${fmtPasso(pc)}–${fmtPasso(n.PASSO_COMBINADO_PERSISTENCIA)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(pc)}** | Nível **Combinado**: editar \`incoterm\` (espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens · linha pai e TODAS as filhas com novo valor · ${pComb1} · ${pComb2} |
| **${fmtPasso(pc + 1)}** | Combinado: campo só-pedido (\`observacoes_pedido\`) + só-item (\`part_number_item\`) na mesma sessão | Ambos aplicados nos escopos corretos |
| **${fmtPasso(n.PASSO_COMBINADO_PERSISTENCIA)}** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Cascade mantido na grade · ${pCombP} |
`)
  etapa++

  // ── Colunas manuais — 8 tipos ──
  const TIPOS_COLUNA: Array<{ tipo: string; comportamento: string }> = [
    { tipo: 'texto', comportamento: 'Input texto livre' },
    { tipo: 'numero', comportamento: 'Input numérico' },
    { tipo: 'data', comportamento: 'Date picker' },
    { tipo: 'moeda', comportamento: 'Input numérico + formatação de moeda' },
    { tipo: 'percentual', comportamento: 'Input percentual' },
    { tipo: 'checkbox', comportamento: 'Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline)' },
    { tipo: 'tipo-documento', comportamento: 'Seleção de tipo de documento' },
  ]
  const pu = n.PASSO_COLUNAS_USUARIO
  const linhasColunas: string[] = [
    `### ETAPA ${etapa} — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS (passos ${fmtPasso(pu)}–${fmtPasso(n.PASSO_COLUNAS_PERSISTENCIA)})`,
    '',
    `Criar (ou reutilizar) 1 coluna manual de **cada um dos 8 tipos**. Os 7 editáveis aparecem no grupo «Personalizadas» (convenção \`coluna_usuario:<id>\`); **fórmula NÃO aparece** (calculada). Metade dos tipos parte de valor vazio, metade de pré-preenchido (anti-viés). Regras: \`COLUNAS-USUARIO-REGRAS-NEGOCIO.md\`.`,
    '',
    '| Passo | Ação | APROVADO quando |',
    '|-------|------|-----------------|',
  ]
  TIPOS_COLUNA.forEach(({ tipo, comportamento }, i) => {
    const p = pu + i
    const pSel = registrarPrint(p, `${fmtPasso(p)}-coluna-${tipo}-selecao.png`, `Coluna manual ${tipo} — passo Revisão`)
    const pRes = registrarPrint(p, `${fmtPasso(p)}-coluna-${tipo}-resultado.png`, `Coluna manual ${tipo} — lista após aplicar`)
    linhasColunas.push(`| **${fmtPasso(p)}** | Editar em massa coluna manual tipo **${tipo}** | ${comportamento} · valor aplicado na célula da coluna · ${pSel} · ${pRes} |`)
  })
  const pFormula = registrarPrint(pu + 7, `${fmtPasso(pu + 7)}-coluna-formula-bloqueada.png`, 'Combobox sem a coluna fórmula (bloqueada)')
  linhasColunas.push(`| **${fmtPasso(pu + 7)}** | Coluna tipo **fórmula** | **NÃO listada** no combobox · célula continua exibindo valor calculado · ${pFormula} |`)
  const pEscopo = registrarPrint(pu + 8, `${fmtPasso(pu + 8)}-coluna-escopo.png`, 'Colunas por escopo — pedido vs item sem vazamento')
  linhasColunas.push(`| **${fmtPasso(pu + 8)}** | Validar escopo | Coluna escopo Pedido só no nível Pedido/Combinado; escopo Item só no nível Item/Combinado · ${pEscopo} |`)
  const pColP = registrarPrint(n.PASSO_COLUNAS_PERSISTENCIA, `${fmtPasso(n.PASSO_COLUNAS_PERSISTENCIA)}-colunas-usuario-persistencia-apos-navegar-resultado.png`, 'Colunas manuais — grade após navegar hub→lista')
  linhasColunas.push(`| **${fmtPasso(n.PASSO_COLUNAS_PERSISTENCIA)}** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Valores das colunas manuais mantidos · ${pColP} |`, '')
  partes.push(linhasColunas.join('\n'))
  etapa++

  // ── Auto-fill tipo de operação ──
  const po = n.PASSO_TIPO_OPERACAO
  const pOp1 = registrarPrint(po, `${fmtPasso(po)}-tipo-operacao-imp-exp.png`, 'Pedido Importação → Exportação em massa')
  const pOp2 = registrarPrint(po + 1, `${fmtPasso(po + 1)}-tipo-operacao-exp-imp.png`, 'Pedido Exportação → Importação em massa')
  const pOp3 = registrarPrint(po + 2, `${fmtPasso(po + 2)}-tipo-operacao-item.png`, 'tipo_operacao_item no nível Item')
  const pOpP = registrarPrint(n.PASSO_TIPO_OP_PERSISTENCIA, `${fmtPasso(n.PASSO_TIPO_OP_PERSISTENCIA)}-tipo-operacao-persistencia-apos-navegar-resultado.png`, 'Tipo de operação — grade após navegar hub→lista')
  partes.push(`### ETAPA ${etapa} — AUTO-FILL TIPO DE OPERAÇÃO (passos ${fmtPasso(po)}–${fmtPasso(n.PASSO_TIPO_OP_PERSISTENCIA)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(po)}** | Pedido **Importação**: \`tipo_operacao_pedido\` → Exportação → reverter | Auto-fill dos campos dependentes coerente · reversão restaura estado · ${pOp1} |
| **${fmtPasso(po + 1)}** | Pedido **Exportação**: → Importação → reverter | Comportamento simétrico · ${pOp2} |
| **${fmtPasso(po + 2)}** | \`tipo_operacao_item\` no nível **Item** | Itens seguem a mesma regra · ${pOp3} |
| **${fmtPasso(n.PASSO_TIPO_OP_PERSISTENCIA)}** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Tipo de operação mantido após navegação · ${pOpP} |
`)
  etapa++

  // ── Erros e estados ──
  const pe = n.PASSO_ERROS
  const pErr1 = registrarPrint(pe, `${fmtPasso(pe)}-erros-revisar-desabilitado.png`, '«Revisar alterações» desabilitado sem campos')
  const pErr2 = registrarPrint(pe + 1, `${fmtPasso(pe + 1)}-erros-unique-bloqueado.png`, 'numero_pedido bloqueado com >1 pedido (@@unique)')
  partes.push(`### ETAPA ${etapa} — ERROS, BLOQUEIOS E ESTADOS (passos ${fmtPasso(pe)}–${fmtPasso(pe + 3)})

> Etapa **somente leitura** — nenhuma alteração é aplicada; dispensa passo de persistência.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(pe)}** | Avançar sem campo preenchido | «Revisar alterações» desabilitado · ${pErr1} |
| **${fmtPasso(pe + 1)}** | Campo \`@@unique\` (\`numero_pedido\`) com >1 pedido selecionado | Input bloqueado com aviso de colisão · ${pErr2} |
| **${fmtPasso(pe + 2)}** | «Voltar» no passo Revisão | Retorna ao passo Campos sem aplicar |
| **${fmtPasso(pe + 3)}** | «Cancelar» no passo Campos | Modal fecha sem aplicar nada |
`)
  etapa++

  // ── Persistência final + relatório ──
  const pf = n.PASSO_FINAL
  const pFinal = registrarPrint(pf, `${fmtPasso(pf)}-persistencia-final.png`, 'Lista após navegar Hub→Lista — visão final consolidada')
  partes.push(`### ETAPA ${etapa} — PERSISTÊNCIA FINAL + RELATÓRIO (passo ${fmtPasso(pf)})

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **${fmtPasso(pf)}** | Navegar Hub → voltar à Lista · gravar \`RESULTADO.txt\` | Visão final consolidada da grade · relatório com todas as linhas \`EMT_ROW\` · ${pFinal} |
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
