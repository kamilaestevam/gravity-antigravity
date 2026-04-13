---
name: antigravity-testes-em-tela
description: "Skill de teste visual direto no navegador. O agente executa um passo a passo completo do início ao fim usando Playwright, tira print de cada etapa relevante e salva as imagens em testes/testes-em-tela/[produto]/[nome]/YYYY-MM-DD-[descricao]/XX-descricao.png. Ativar com /teste-em-tela."
---

# Gravity — Testes em Tela

## O que esta skill faz

Executa um teste **visual completo no navegador**, do início ao fim, sem pular etapas.
Cada passo relevante gera um screenshot numerado salvo em disco.
O objetivo é documentar que a funcionalidade está funcionando **como o usuário vê**.

Esta skill não substitui testes unitários nem funcionais. Ela valida a **experiência visual**
após uma entrega: layout correto, dados aparecendo, fluxos funcionando no browser real.

---

## Quando Usar Esta Skill

- Após entrega de nova tela ou componente visual
- Após ajuste que afeta CSS, layout ou fluxo de UI
- Para validar que um bug visual foi corrigido
- Para documentar o estado atual de uma funcionalidade
- Sempre que o usuário pedir `/teste-em-tela`

---

## Estrutura de Pastas e Nomenclatura

```
testes/
  testes-em-tela/
    produto/
      [nome-produto]/           ← ex: pedido, simulacusto, lpco
        YYYY-MM-DD-[descricao]/  ← ex: 2026-04-10-kanban-customizado
          01-[descricao].png     ← ex: 01-pagina-carregada.png
          02-[descricao].png     ← ex: 02-modal-aberto.png
          03-[descricao].png     ← ex: 03-formulario-preenchido.png
          ...
    servico/
      [nome-servico]/           ← ex: dashboard, gabi, configurador
        YYYY-MM-DD-[descricao]/
          01-[descricao].png
          ...
```

**Regras de nomenclatura:**
- Data sempre no formato `YYYY-MM-DD`
- Descrição da pasta: kebab-case, curta (3-5 palavras), descritiva do cenário
- Screenshots numerados sequencialmente: `01`, `02`, `03`...
- Nome do screenshot: número + hífen + descrição do momento (`01-tela-carregada.png`)
- Sem espaços, sem maiúsculas, sem caracteres especiais

---

## Como Executar o Teste

### Passo 1 — Definir o roteiro

Antes de abrir o navegador, escrever o roteiro completo:

```
ROTEIRO DE TESTE
Produto: [nome]
Cenário: [o que será testado]
URL base: http://localhost:[porta]
Data: YYYY-MM-DD
Pasta de saída: testes/testes-em-tela/produto/[nome]/YYYY-MM-DD-[descricao]/

Passos:
1. Acessar [URL]
2. [ação]
3. [ação]
...
N. Screenshot final — estado esperado
```

### Passo 2 — Checar que o servidor está rodando

```bash
# Verificar se o frontend está acessível
curl -s -o /dev/null -w "%{http_code}" http://localhost:[porta]
```

Se retornar 200 → prosseguir.
Se não → acionar `/terminal` para subir o servidor antes de continuar.

### Passo 3 — Executar com Playwright

```typescript
// testes/testes-em-tela/[produto]/[nome]/[data-descricao]/teste.ts
import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'

const PASTA_SAIDA = path.join(
  'testes', 'testes-em-tela', '[produto]', '[nome]',
  'YYYY-MM-DD-[descricao]'
)

async function executar() {
  fs.mkdirSync(PASTA_SAIDA, { recursive: true })

  const browser = await chromium.launch({ headless: false }) // headless: false para ver
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // Passo 1
  await page.goto('http://localhost:[porta]/[rota]')
  await page.waitForLoadState('networkidle')
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '01-pagina-carregada.png'),
    fullPage: false
  })

  // Passo 2 — exemplo: clicar em botão
  await page.getByRole('button', { name: '[texto do botão]' }).click()
  await page.waitForTimeout(500) // aguardar animação
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '02-modal-aberto.png'),
    fullPage: false
  })

  // ... demais passos

  await browser.close()
  console.log(`Screenshots salvos em: ${PASTA_SAIDA}`)
}

executar().catch(console.error)
```

### Passo 4 — Rodar o script

```bash
npx ts-node testes/testes-em-tela/[produto]/[nome]/[data-descricao]/teste.ts
```

Ou usar `npx playwright test` se houver configuração global.

---

## Momentos Obrigatórios de Screenshot

Todo teste em tela DEVE capturar no mínimo:

| Momento | Quando capturar |
|:--------|:----------------|
| Tela carregada | Após `waitForLoadState('networkidle')` |
| Estado vazio | Se a tela tem estado sem dados |
| Após ação principal | Clique, submit, seleção relevante |
| Modal/drawer aberto | Se o fluxo inclui overlay |
| Estado de erro | Se o fluxo inclui validação ou erro |
| Estado final | Resultado esperado da ação |

Capturar também sempre que houver:
- Toast/snackbar de confirmação
- Mudança visível de layout (ex: kanban coluna adicionada)
- Dados novos aparecendo na tela

---

## Seletores Preferidos (ordem de prioridade)

1. `getByRole('button', { name: 'Texto' })` — mais acessível e estável
2. `getByText('Texto visível')` — para elementos de texto
3. `getByLabel('Label do campo')` — para inputs
4. `getByTestId('data-testid')` — quando existir `data-testid`
5. `locator('.classe-css')` — último recurso, frágil

**Nunca usar seletores por ID gerado dinamicamente ou índice de lista.**

---

## Configurações de Screenshot

```typescript
// Screenshot padrão (viewport 1440x900)
await page.screenshot({
  path: path.join(PASTA_SAIDA, 'XX-descricao.png'),
  fullPage: false  // capturar só o viewport visível
})

// Screenshot de elemento específico (ex: só o card)
const card = page.locator('.gtv-card')
await card.screenshot({
  path: path.join(PASTA_SAIDA, 'XX-detalhe-card.png')
})

// Screenshot full page (para telas longas)
await page.screenshot({
  path: path.join(PASTA_SAIDA, 'XX-tela-completa.png'),
  fullPage: true
})
```

---

## Aguardar Carregamento Corretamente

```typescript
// Aguardar rede estabilizar (preferencial)
await page.waitForLoadState('networkidle')

// Aguardar elemento aparecer
await page.waitForSelector('.minha-classe', { state: 'visible' })

// Aguardar animação (quando necessário)
await page.waitForTimeout(300) // máximo 500ms — se precisar de mais, há problema

// Aguardar resposta de API
await page.waitForResponse(resp => resp.url().includes('/api/') && resp.status() === 200)
```

**Evitar `waitForTimeout` grandes (> 1s). Se precisar, o problema está no carregamento, não no teste.**

---

## Relatório Pós-Teste

Após a execução, reportar ao usuário:

```
RELATÓRIO — Teste em Tela
Produto: [nome]
Cenário: [descricao]
Data: YYYY-MM-DD
Pasta: testes/testes-em-tela/[produto]/[nome]/YYYY-MM-DD-[descricao]/

Screenshots gerados:
  01-pagina-carregada.png ✓
  02-modal-aberto.png ✓
  03-formulario-preenchido.png ✓
  04-confirmacao.png ✓

Resultado: PASSOU / FALHOU
Observações: [o que estava diferente do esperado, se houver]
```

---

## Checklist Antes de Executar

- [ ] Roteiro escrito com todos os passos?
- [ ] Servidor local rodando na porta correta?
- [ ] Pasta de saída com nomenclatura correta (`YYYY-MM-DD-descricao`)?
- [ ] Playwright instalado (`npx playwright install` se necessário)?
- [ ] Viewport definido como 1440x900?
- [ ] `waitForLoadState('networkidle')` antes do primeiro screenshot?
- [ ] Screenshots numerados sequencialmente?
- [ ] Relatório enviado ao usuário após execução?
