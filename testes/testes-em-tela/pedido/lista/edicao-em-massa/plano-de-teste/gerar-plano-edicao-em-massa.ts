/**
 * Gerador do plano de teste em tela — Edição em Massa (Pedido/Lista).
 * Deriva as etapas campo a campo do SSOT `camposEdicaoMassa.ts` (zero drift:
 * se o SSOT mudar, rodar este script regenera o plano com a lista atual).
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
  texto: 'Texto livre',
  numero: 'Numérico',
  data: 'Data (date picker)',
  select: 'Seleção (dropdown com busca)',
  moeda: 'Seleção de moeda',
  unidade: 'Seleção de unidade',
  incoterm: 'Seleção de incoterm',
  tipo_operacao: 'Seleção Importação/Exportação',
  ncm: 'NCM (máscara 0000.00.00)',
  checkbox: 'Checkbox (✓ Sim / ✗ Não)',
  percentual: 'Percentual',
  tipo_documento: 'Seleção de tipo de documento',
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

/** Alterna o estado inicial exigido (regra anti-viés 50/50 do plano aprovado). */
function estadoInicial(idx: number): string {
  return idx % 2 === 0
    ? 'Campo **vazio** antes da edição → preencher'
    : 'Campo **pré-preenchido** antes da edição → substituir por valor novo'
}

function tabelaCampos(campos: CampoMassa[], offsetGlobal: number): string {
  const linhas = [
    '| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |',
    '|---|-------------|--------|---------------|------------------------|--------------|',
  ]
  campos.forEach((c, i) => {
    const n = offsetGlobal + i + 1
    const tipo = ROTULO_TIPO[c.tipo] ?? c.tipo
    linhas.push(
      `| ${n} | \`${c.campo}\` | ${c.rotulo} | ${tipo} | ${estadoInicial(n)} | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |`,
    )
  })
  return linhas.join('\n')
}

function blocoGrupo(
  numeroEtapa: number,
  nivel: 'PEDIDO' | 'ITEM',
  grupo: string,
  campos: CampoMassa[],
  offsetGlobal: number,
): string {
  const nivelTxt = nivel === 'PEDIDO' ? 'Pedido' : 'Item'
  return [
    `### ETAPA ${numeroEtapa} — ${nivel} · GRUPO «${grupo.toUpperCase()}» (${campos.length} campos)`,
    '',
    `Nível do modal: **${nivelTxt}**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.`,
    '',
    `Prints obrigatórios por campo: \`NN-<campo>-selecao.png\` (passo 1 preenchido) e \`NN-<campo>-resultado.png\` (lista após aplicar).`,
    '',
    tabelaCampos(campos, offsetGlobal),
    '',
  ].join('\n')
}

function gerar(): string {
  const gruposPedido = agruparPorGrupo(CAMPOS_EDICAO_MASSA_PEDIDO)
  const gruposItem = agruparPorGrupo(CAMPOS_EDICAO_MASSA_ITEM)

  const partes: string[] = []
  const totalCampos = CAMPOS_EDICAO_MASSA_PEDIDO.length + CAMPOS_EDICAO_MASSA_ITEM.length

  partes.push(`# Plano de Teste em Tela — Edição em Massa (Pedido / Lista)

- **ID do plano:** TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
- **Tipo:** EMT (Teste em Tela)
- **Produto / Local / Sublocal:** Pedido / Lista / edicao-em-massa
- **Componentes:** \`ModalPedidosEdicaoMassa.tsx\` (front) + \`edicaoEmMassaService.ts\` (back) + SSOT \`camposEdicaoMassa.ts\`
- **Cobertura:** ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos de Pedido + ${CAMPOS_EDICAO_MASSA_ITEM.length} campos de Item = **${totalCampos} campos do sistema** + **8 tipos de colunas manuais do usuário**
- **Runner:** \`run-lista-edicao-em-massa.ts\` (mesma pasta)
- **Gerado por:** \`gerar-plano-edicao-em-massa.ts\` — NÃO editar as tabelas de campos à mão; regenerar a partir do SSOT.

---

## REGRAS-MESTRE (valem para TODAS as etapas)

1. **Anti-viés 50/50** — os campos alternam estado inicial: ímpares partem de valor **vazio** (preencher) e pares partem de valor **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — usar o pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Anotar o número do pedido no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos **1 pedido de Importação e 1 de Exportação** no workspace de teste.
4. **Validação tripla por campo** — (a) preview de→para correto no passo «Revisar alterações»; (b) valor aplicado visível na lista; (c) valor persiste após recarregar a página (F5).
5. **UX intacta** — o modal mantém os 3 passos (Campos → Revisão → Resultado), os 3 níveis (Combinado / Pedido / Item), o combobox com busca e o botão «Adicionar campo». Qualquer regressão visual reprova a etapa.
6. **Print padrão** — \`NN-<slug>-selecao.png\` e \`NN-<slug>-resultado.png\` na pasta de resultado da execução.
7. **Falha não bloqueia** — exceção em um campo reprova apenas aquela linha; o runner continua nos demais campos (relatório \`EMT_ROW\` por linha).

---

### ETAPA 0 — PREPARAÇÃO DO AMBIENTE

| # | Passo | Verificação |
|---|-------|-------------|
| 0.1 | Login Clerk no ambiente alvo e entrada no workspace de teste | Lista de pedidos carrega com linhas editáveis |
| 0.2 | Varredura da lista: identificar o pedido com maior nº de itens (pedido-alvo) | rowId e número do pedido anotados no relatório |
| 0.3 | Confirmar existência de pedido de Importação e de Exportação | Ambos os tipos presentes (criar/converter se faltar) |
| 0.4 | Print do estado inicial da lista | \`00-estado-inicial.png\` |

### ETAPA 1 — ABERTURA E UX DO MODAL

| # | Passo | Verificação |
|---|-------|-------------|
| 1.1 | Selecionar o pedido-alvo pelo checkbox da linha pai | Checkbox marcado; barra mostra contagem |
| 1.2 | Clicar no botão «Edição em Massa» da barra | Modal abre com título «Editar em Massa (1 pedido selecionado)» |
| 1.3 | Validar os 3 passos no stepper (Campos / Revisão / Resultado) | Stepper visível com passo 1 ativo |
| 1.4 | Validar o toggle de nível com 3 opções (Combinado / Pedido / Item) | 3 botões presentes; Combinado ativo por padrão |
| 1.5 | Abrir o combobox de campos e validar busca + agrupamento por grupo DDD | Grupos visíveis; busca filtra; contador de campos correto |
| 1.6 | Print do modal aberto | \`01-modal-aberto.png\` |

### ETAPA 2 — GUARD-RAIL DE DRIFT (paridade com SSOT)

| # | Passo | Verificação |
|---|-------|-------------|
| 2.1 | Nível **Pedido**: contar os campos do combobox | = ${CAMPOS_EDICAO_MASSA_PEDIDO.length} campos do sistema (+ colunas do usuário escopo pedido, se houver) |
| 2.2 | Nível **Item**: contar os campos do combobox | = ${CAMPOS_EDICAO_MASSA_ITEM.length} campos do sistema (+ colunas do usuário escopo item, se houver) |
| 2.3 | Confirmar que NENHUM campo bloqueado aparece no combobox | ${CAMPOS_BLOQUEADOS_PEDIDO.length} bloqueados de pedido e ${CAMPOS_BLOQUEADOS_ITEM.length} de item ausentes |
| 2.4 | Conferir bloqueados de pedido: ${[...CAMPOS_BLOQUEADOS_PEDIDO].map(c => `\`${c}\``).join(', ')} | Nenhum listado |
| 2.5 | Conferir bloqueados de item: ${[...CAMPOS_BLOQUEADOS_ITEM].map(c => `\`${c}\``).join(', ')} | Nenhum listado |
| 2.6 | Print dos comboboxes dos 2 níveis | \`02-combobox-pedido.png\`, \`02-combobox-item.png\` |
`)

  let etapa = 3
  let offset = 0
  partes.push('\n---\n\n## CAMPOS DE PEDIDO — campo a campo\n')
  for (const [grupo, campos] of gruposPedido) {
    partes.push(blocoGrupo(etapa, 'PEDIDO', grupo, campos, offset))
    etapa++
    offset += campos.length
  }

  partes.push('\n---\n\n## CAMPOS DE ITEM — campo a campo\n')
  for (const [grupo, campos] of gruposItem) {
    partes.push(blocoGrupo(etapa, 'ITEM', grupo, campos, offset))
    etapa++
    offset += campos.length
  }

  const etapaCombinado = etapa
  partes.push(`
---

### ETAPA ${etapaCombinado} — NÍVEL COMBINADO + CASCADE

| # | Passo | Verificação |
|---|-------|-------------|
| ${etapaCombinado}.1 | Nível **Combinado**: editar \`incoterm\` (campo espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens |
| ${etapaCombinado}.2 | Aplicar e validar cascade na lista | Linha pai e TODAS as linhas filhas com o novo valor |
| ${etapaCombinado}.3 | Nível Combinado: editar campo só-pedido (\`observacoes_pedido\`) + campo só-item (\`part_number_item\`) na mesma sessão | Ambos aplicados nos escopos corretos |
| ${etapaCombinado}.4 | Validar persistência após F5 | Valores mantidos |
| ${etapaCombinado}.5 | Prints | \`${String(etapaCombinado).padStart(2, '0')}-combinado-selecao.png\`, \`${String(etapaCombinado).padStart(2, '0')}-combinado-resultado.png\` |

### ETAPA ${etapaCombinado + 1} — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS

Criar (ou reutilizar) uma coluna manual de **cada um dos 8 tipos** no escopo Pedido e repetir a verificação no escopo Item. Os 7 tipos editáveis devem aparecer no modal sob o grupo «Personalizadas» com a convenção \`coluna_usuario:<id>\`; o tipo **fórmula** NÃO deve aparecer (calculado, não editável).

| # | Tipo da coluna | Comportamento esperado no modal | Verificação pós-aplicar |
|---|----------------|--------------------------------|------------------------|
| ${etapaCombinado + 1}.1 | Texto | Input texto livre | Valor aplicado na célula da coluna manual |
| ${etapaCombinado + 1}.2 | Número | Input numérico | Valor numérico aplicado e formatado |
| ${etapaCombinado + 1}.3 | Data | Date picker | Data aplicada no formato da lista |
| ${etapaCombinado + 1}.4 | Moeda | Input numérico + formatação de moeda | Valor monetário aplicado |
| ${etapaCombinado + 1}.5 | Percentual | Input percentual | Percentual aplicado |
| ${etapaCombinado + 1}.6 | Checkbox | Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline) | Estado booleano aplicado |
| ${etapaCombinado + 1}.7 | Tipo de documento | Seleção de tipo de documento | Tipo aplicado |
| ${etapaCombinado + 1}.8 | **Fórmula** | **NÃO listada no combobox** (bloqueada — calculada) | Célula continua exibindo valor calculado; nenhuma via de edição em massa |
| ${etapaCombinado + 1}.9 | Escopo | Coluna criada no escopo Pedido só aparece no nível Pedido/Combinado; escopo Item só no nível Item/Combinado | Sem vazamento de escopo |
| ${etapaCombinado + 1}.10 | Anti-viés | Metade dos tipos testada partindo de valor vazio, metade partindo de valor pré-preenchido | Alternância registrada no relatório |
| ${etapaCombinado + 1}.11 | Prints | \`${String(etapaCombinado + 1).padStart(2, '0')}-coluna-<tipo>-selecao.png\` + \`-resultado.png\` por tipo | 16+ prints |

### ETAPA ${etapaCombinado + 2} — AUTO-FILL TIPO DE OPERAÇÃO

| # | Passo | Verificação |
|---|-------|-------------|
| ${etapaCombinado + 2}.1 | Selecionar pedido de **Importação** e editar \`tipo_operacao_pedido\` → Exportação | Preview correto; aplicado com sucesso |
| ${etapaCombinado + 2}.2 | Validar auto-fill dos campos dependentes da operação | Campos de referência/parte coerentes com o novo tipo |
| ${etapaCombinado + 2}.3 | Reverter para Importação via edição em massa | Pedido retorna ao estado original |
| ${etapaCombinado + 2}.4 | Repetir em pedido de **Exportação** → Importação → reverter | Mesmo comportamento simétrico |
| ${etapaCombinado + 2}.5 | Validar \`tipo_operacao_item\` no nível Item | Itens seguem a mesma regra |
| ${etapaCombinado + 2}.6 | Prints | \`${String(etapaCombinado + 2).padStart(2, '0')}-tipo-operacao-*.png\` |

### ETAPA ${etapaCombinado + 3} — ERROS, BLOQUEIOS E ESTADOS

| # | Passo | Verificação |
|---|-------|-------------|
| ${etapaCombinado + 3}.1 | Tentar avançar sem nenhum campo preenchido | Botão «Revisar alterações» desabilitado |
| ${etapaCombinado + 3}.2 | Campo \`@@unique\` (ex.: \`numero_pedido\`) com >1 pedido selecionado | Input bloqueado com aviso de colisão |
| ${etapaCombinado + 3}.3 | Valor inválido (ex.: NCM incompleto) | Validação impede aplicar ou backend rejeita com erro legível |
| ${etapaCombinado + 3}.4 | Cancelar no passo 2 («Voltar») e no passo 1 («Cancelar») | Nenhuma alteração aplicada |
| ${etapaCombinado + 3}.5 | Prints | \`${String(etapaCombinado + 3).padStart(2, '0')}-erros-*.png\` |

### ETAPA ${etapaCombinado + 4} — PERSISTÊNCIA FINAL + RELATÓRIO

| # | Passo | Verificação |
|---|-------|-------------|
| ${etapaCombinado + 4}.1 | Navegar para o Hub e voltar à lista | Todos os valores aplicados nas etapas anteriores persistem |
| ${etapaCombinado + 4}.2 | Print final da lista | \`${String(etapaCombinado + 4).padStart(2, '0')}-persistencia-final.png\` |
| ${etapaCombinado + 4}.3 | Gravar \`RESULTADO.txt\` com todas as linhas \`EMT_ROW\` | Resultado final PASSOU/FALHOU + contagem de falhas |
`)

  return partes.join('\n')
}

const md = gerar()
writeFileSync(DESTINO, md, 'utf8')
const totalEtapas = (md.match(/^### ETAPA /gm) ?? []).length
const totalLinhasCampo = (md.match(/^\| \d+ \| `/gm) ?? []).length
console.log(`Plano gerado: ${DESTINO}`)
console.log(`Etapas: ${totalEtapas} | Linhas campo a campo: ${totalLinhasCampo}`)
