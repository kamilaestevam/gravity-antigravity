---
name: antigravity-teste-em-tela
description: "Skill de teste visual com navegador. Quando ativada, o agente executa um passo a passo completo de teste — do login até o fluxo final — usando Playwright, e salva prints numerados de cada etapa em testes/testes-em-tela/{area}/{produto}/{YYYY-MM-DD-nome}/. Cada print documenta o estado exato da tela naquele momento."
---

# Gravity — Teste em Tela

## Por que esta skill existe

Testes unitários provam que funções funcionam. Testes em tela provam que o **usuário
consegue completar o fluxo**. São complementares, não substitutos.

Esta skill define como o agente executa um teste visual completo:
do zero ao fluxo finalizado, com print de cada estado significativo.

---

## Quando Esta Skill É Obrigatória

- Após entrega de nova tela ou feature visual
- Após ajuste em componente que afeta layout ou fluxo
- Após correção de bug reportado na interface
- Quando o QA pede validação visual
- Ao usar o comando `/teste-em-tela`

---

## Estrutura de Pastas — Onde Salvar os Prints

```
testes/
  └── testes-em-tela/
      ├── produto/
      │   └── pedido/
      │       └── YYYY-MM-DD-nome-do-teste/
      │           ├── 01-descricao-do-estado.png
      │           ├── 02-descricao-do-estado.png
      │           └── ...
      ├── servico/
      │   └── gabi/
      │       └── YYYY-MM-DD-nome-do-teste/
      └── configurador/
          └── YYYY-MM-DD-nome-do-teste/
```

### Convenção de nome da pasta

```
YYYY-MM-DD-[area-do-teste]
```

Exemplos:
- `2026-04-10-modal-transferir`
- `2026-04-10-dashboard-kpis`
- `2026-04-10-kanban-edicao-inline`

### Convenção de nome do print

```
NN-descricao-do-estado.png
```

- `NN` começa em `01` e incrementa sequencialmente
- Descrição em kebab-case, descritiva do que está visível
- Nunca genérico (`screenshot-1.png`) — sempre descritivo (`01-login-preenchido.png`)

Exemplos:
```
01-pagina-inicial-carregada.png
02-modal-aberto.png
03-formulario-preenchido.png
04-erro-de-validacao.png
05-confirmacao-de-sucesso.png
```

---

## Protocolo de Execução

### ETAPA 0 — Preparação

Antes de iniciar o teste:

1. **Confirmar que o servidor está rodando** — verificar porta do produto na skill de ambiente
2. **Identificar o fluxo a testar** — do primeiro clique até o estado final esperado
3. **Criar a pasta de destino** para os prints com a data atual e nome descritivo
4. **Definir os estados a capturar** — listar cada print planejado antes de executar

```
PLANO DO TESTE:
  Produto: [nome]
  Porta: [frontend:XXXX]
  Fluxo: [descrição em 1 linha]
  Prints planejados:
    01 - [estado inicial]
    02 - [após ação X]
    03 - [após ação Y]
    ...
  Critério de sucesso: [o que deve estar visível no último print]
```

### ETAPA 1 — Execução com Playwright

O agente usa Playwright para:
- Navegar até a URL correta
- Executar ações (clicar, preencher, selecionar)
- Capturar prints em cada estado relevante
- Validar elementos esperados (texto, botão, modal)

#### Script padrão

```typescript
import { chromium } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const PASTA_PRINTS = path.join(
  'testes', 'testes-em-tela', '[area]', '[produto]',
  `${new Date().toISOString().split('T')[0]}-[nome-do-teste]`
)

async function testar() {
  fs.mkdirSync(PASTA_PRINTS, { recursive: true })

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  try {
    // PASSO 1 — estado inicial
    await page.goto('http://localhost:[PORTA]/[rota]')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${PASTA_PRINTS}/01-pagina-carregada.png`, fullPage: false })

    // PASSO 2 — ação
    await page.click('[data-testid="botao-X"]')
    await page.screenshot({ path: `${PASTA_PRINTS}/02-apos-clicar-X.png` })

    // ... continuar para cada estado relevante

  } finally {
    await browser.close()
  }
}

testar().catch(console.error)
```

### ETAPA 2 — O que Sempre Fotografar

Obrigatório capturar print de:

| Momento | Exemplo de nome |
|:--------|:----------------|
| Página carregada (estado inicial) | `01-pagina-carregada.png` |
| Após abrir modal/drawer | `02-modal-aberto.png` |
| Formulário com dados preenchidos | `03-formulario-preenchido.png` |
| Estado de loading/processando | `04-loading.png` |
| Mensagem de erro (se houver) | `05-erro-validacao.png` |
| Estado de sucesso | `06-sucesso.png` |
| Estado final da tela após ação | `07-estado-final.png` |

**Opcional mas recomendado:**
- Hover sobre elementos interativos
- Estados de tabela vazia vs. com dados
- Comparação antes/depois de uma ação

### ETAPA 3 — Relatório Compacto

Após salvar todos os prints, o agente reporta:

```
TESTE EM TELA — [nome do teste]
Data: YYYY-MM-DD
Produto: [nome] | Porta: [XXXX]
Pasta: testes/testes-em-tela/[area]/[produto]/YYYY-MM-DD-[nome]/

Prints salvos:
  ✓ 01-pagina-carregada.png
  ✓ 02-modal-aberto.png
  ✓ 03-formulario-preenchido.png
  ✓ 04-sucesso.png

Resultado: PASSOU / FALHOU
Observações: [anomalias visuais, comportamentos inesperados]
```

---

## Regras de Qualidade dos Prints

- **Viewport fixo:** sempre `1440x900` — consistência entre testes
- **Sem prints em branco:** aguardar `networkidle` antes de capturar
- **Sem prints cortados:** usar `fullPage: false` para capturar a viewport visível
- **Sem prints duplicados:** cada print deve mostrar um estado diferente do anterior
- **Nomes descritivos:** o nome do arquivo deve dizer o que está na tela sem precisar abrir

---

## Quando Playwright Não Está Disponível

Se o Playwright não estiver instalado:

```bash
# Instalar no produto correto
cd produto/[nome]/client
npx playwright install chromium
```

Ou usar o script global se existir em `testes/testes-e2e/`.

---

## Integração com Outras Skills

| Skill | Relação |
|:------|:--------|
| `antigravity-testes` | Esta skill é o complemento visual; aquela cobre unitários/funcionais |
| `antigravity-qa` | QA pode solicitar `/teste-em-tela` para validar entrega |
| `antigravity-dream-team-ajustes` | Fase 7 pode incluir `/teste-em-tela` para verificação visual |

---

## Slash Command `/teste-em-tela`

Ativa o modo de teste visual. Uso:

```
/teste-em-tela [descrição do fluxo a testar]
```

Exemplos:
```
/teste-em-tela modal de transferir pedido — fluxo completo
/teste-em-tela dashboard — verificar KPIs após atualização
/teste-em-tela kanban — criar coluna customizada
```

O agente:
1. Define o plano (estados a capturar)
2. Confirma com o usuário (opcional para fluxos simples)
3. Executa com Playwright
4. Salva os prints na pasta correta
5. Reporta o resultado com lista dos prints salvos
