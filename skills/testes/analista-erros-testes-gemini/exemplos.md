# Exemplos — Análises Boas e Ruins

> 6 casos reais (ou plausíveis) de análise — 3 exemplares e 3 anti-padrões. Use como referência ao avaliar a qualidade do que o Gemini devolve.

---

## ✅ Exemplo Bom 1 — Regressão recente, alta confiança, diff aplicável

### Input
```json
{
  "errorLog": "Error: page.getByTestId('btn-salvar-organizacao') not found in DOM\n  at TST-E2E-CONFIG-000001.spec.ts:48:23",
  "testName": "18. Salvar Nome da Empresa",
  "specFileContent": "...\nawait page.getByTestId('btn-salvar-organizacao').click()\n...",
  "componentFileContent": "<button data-testid='btn-salvar-org' onClick={salvar}>{t('comum.salvar')}</button>",
  "lastCommitsTouching": [
    {"hash": "abc1234", "autor": "Daniel", "data": "2026-04-14", "mensagem": "refactor: simplifica testids da Organização"}
  ]
}
```

### Output
```json
{
  "erroResumo": "Testid 'btn-salvar-organizacao' não existe — foi renomeado para 'btn-salvar-org' no commit abc1234",
  "motivo": "O componente Organizacao.tsx agora usa data-testid='btn-salvar-org' (8 chars mais curto). O commit abc1234 do dia 14/04 'simplifica testids' renomeou todos os botões da tela mas o spec TST-E2E-CONFIG-000001 não foi atualizado em conjunto. Isso é teste desatualizado por refactor não-coordenado, não um bug do produto.",
  "sugestaoCorrecao": "Substituir 'btn-salvar-organizacao' por 'btn-salvar-org' na linha 48 do spec. Buscar outras ocorrências do mesmo testid antigo no projeto inteiro — é provável que outros 5-10 testes da mesma tela tenham quebrado pelo mesmo motivo.",
  "arquivo": "testes/testes-e2e/configurador/organizacao/TST-E2E-CONFIG-000001.spec.ts:48",
  "codigoDiff": {
    "arquivo": "testes/testes-e2e/configurador/organizacao/TST-E2E-CONFIG-000001.spec.ts",
    "linha": 48,
    "old": "await page.getByTestId('btn-salvar-organizacao').click()",
    "new": "await page.getByTestId('btn-salvar-org').click()",
    "explicacao": "Sincroniza testid com o nome novo do commit abc1234"
  },
  "categoria": "REGRESSAO_RECENTE",
  "confianca": "alta",
  "commitSuspeito": {
    "hash": "abc1234",
    "autor": "Daniel",
    "data": "2026-04-14",
    "mensagem": "refactor: simplifica testids da Organização"
  }
}
```

### Por que é nota 10
- Aponta arquivo + linha exatos
- Diff é aplicável literalmente (humano clica e funciona)
- Identifica o commit causador
- Avisa sobre **outros testes provavelmente quebrados pelo mesmo motivo** — economiza tempo
- Confiança alta justificada (todos os elementos batem)

---

## ✅ Exemplo Bom 2 — Bug real no produto

### Input
```json
{
  "errorLog": "TypeError: Cannot read properties of null (reading 'workspace_id')\n  at Hub.tsx:34:12\n  at renderWithHooks (react-dom.development.js:14803)",
  "testName": "01. HUB carrega após login",
  "specFileContent": "await page.goto('/hub')\nawait expect(page.getByTestId('hub-saudacao')).toBeVisible()",
  "componentFileContent": "const { user } = useUser()\nconst workspaceId = user.workspace_id\nreturn <h1 data-testid='hub-saudacao'>Boa noite, {user.nome}</h1>",
  "lastCommitsTouching": []
}
```

### Output
```json
{
  "erroResumo": "Hub.tsx quebra quando user é null — falta guard para usuário ainda não carregado",
  "motivo": "O componente acessa user.workspace_id direto, mas useUser() retorna null enquanto o Clerk ainda está autenticando. O teste navega pra /hub e o componente tenta renderizar antes do user existir, gerando TypeError na linha 34. Isso é bug real: o produto quebra para qualquer usuário toda vez que carrega o /hub do zero (cold start). O teste só está revelando.",
  "sugestaoCorrecao": "Adicionar early return ou Suspense boundary no Hub.tsx antes de acessar user.workspace_id. Padrão do projeto é checar isLoading do useUser ou retornar <SkeletonGlobal /> enquanto user é null.",
  "arquivo": "servicos-global/shell/Hub.tsx:34",
  "codigoDiff": {
    "arquivo": "servicos-global/shell/Hub.tsx",
    "linha": 34,
    "old": "const { user } = useUser()\nconst workspaceId = user.workspace_id\nreturn <h1 data-testid='hub-saudacao'>Boa noite, {user.nome}</h1>",
    "new": "const { user, isLoaded } = useUser()\nif (!isLoaded || !user) return <SkeletonGlobal />\nconst workspaceId = user.workspace_id\nreturn <h1 data-testid='hub-saudacao'>Boa noite, {user.nome}</h1>",
    "explicacao": "Aguarda o Clerk terminar o auth antes de acessar campos do user"
  },
  "categoria": "BUG_REAL",
  "confianca": "alta",
  "commitSuspeito": null
}
```

### Por que é nota 10
- Distingue corretamente "bug real" de "teste velho" (este é bug real)
- Diff respeita o padrão do projeto (SkeletonGlobal, isLoaded do Clerk)
- Explica que **qualquer cold start quebra**, não só o teste — escala o impacto

---

## ✅ Exemplo Bom 3 — Confiança baixa, honesta

### Input
```json
{
  "errorLog": "Test timeout of 60000ms exceeded.\n  at TST-E2E-PEDIDO-000023.spec.ts",
  "testName": "23. Importar planilha de 500 linhas",
  "specFileContent": "await page.setInputFiles('input[type=file]', 'fixtures/500-linhas.xlsx')\nawait expect(page.getByText('Importação concluída')).toBeVisible({ timeout: 60000 })",
  "componentFileContent": null,
  "lastCommitsTouching": []
}
```

### Output
```json
{
  "erroResumo": "Importação de planilha não concluiu em 60s — pode ser performance, fila travada, ou timeout insuficiente",
  "motivo": "O teste sobe um xlsx de 500 linhas e espera o toast 'Importação concluída' em até 60s. Excedeu. Sem o código do componente e sem os logs do servidor não consigo distinguir entre 3 causas possíveis: (a) processamento real ficou mais lento por mudança no parser, (b) job na fila travou e nunca finalizou, (c) a mensagem de sucesso mudou de texto e o teste não acha. Cada causa exige fix diferente.",
  "sugestaoCorrecao": "Para diagnosticar: (1) rodar localmente com --headed e ver onde trava; (2) checar logs do worker de importação durante a janela do teste; (3) verificar se o texto 'Importação concluída' ainda existe no componente (pode ter mudado para 'Importação finalizada' ou similar). Me envie o código do ImportacaoPlanilha.tsx + logs do servidor que reanaliso.",
  "arquivo": "testes/testes-e2e/pedido/importacao/TST-E2E-PEDIDO-000023.spec.ts",
  "codigoDiff": null,
  "categoria": "NAO_CLASSIFICAVEL",
  "confianca": "baixa",
  "commitSuspeito": null
}
```

### Por que é nota 10
- **Não inventa diff** quando não tem certeza
- Lista 3 hipóteses concretas e o que cada uma exigiria
- Pede inputs adicionais específicos
- Confiança baixa justificada e útil

---

## ❌ Exemplo Ruim 1 — Genérico demais

### Output ruim
```json
{
  "erroResumo": "Erro no teste",
  "motivo": "O teste falhou. Pode ser bug ou problema de timing. Recomendo investigar.",
  "sugestaoCorrecao": "Verifique o código e tente novamente.",
  "arquivo": "arquivo.spec.ts",
  "codigoDiff": null,
  "categoria": "NAO_CLASSIFICAVEL",
  "confianca": "media"
}
```

### Por que é nota 0
- "Erro no teste" não é resumo, é tautologia
- "Verifique o código" é exatamente o que **não** pode dizer
- Não cita arquivo:linha
- Confiança "media" sem justificar nada

---

## ❌ Exemplo Ruim 2 — Inventa código (alucinação)

### Input
Componente não foi enviado (`componentFileContent: null`).

### Output ruim
```json
{
  "erroResumo": "Botão Salvar com handler errado",
  "motivo": "...",
  "codigoDiff": {
    "arquivo": "Organizacao.tsx",
    "old": "<button onClick={() => saveOrg()}>",
    "new": "<button onClick={async () => await saveOrg()}>",
    "explicacao": "Faltava await"
  },
  "categoria": "BUG_REAL",
  "confianca": "alta"
}
```

### Por que é nota 0
- O componente **não foi enviado** no input
- O modelo inventou um código que pode não existir
- Validador automático rejeita: `codigoDiff.old` não bate com `componentFileContent` (que era null)
- Esse output **nunca pode ser persistido**

---

## ❌ Exemplo Ruim 3 — Confiança inflada

### Input
Erro vago, sem stack trace claro.

### Output ruim
```json
{
  "erroResumo": "Bug crítico no Configurador",
  "motivo": "O teste falhou porque há um problema sério no Configurador.",
  "sugestaoCorrecao": "Refatorar todo o módulo de Organização.",
  "categoria": "BUG_REAL",
  "confianca": "alta"
}
```

### Por que é nota 0
- "Bug crítico" sem evidência
- "Refatorar todo o módulo" não é sugestão, é pânico
- Confiança alta sem nenhum dado que sustente
- Se for aceito, o humano destrói código que estava funcionando

---

## Como usar estes exemplos

1. **Antes de acreditar numa análise**, mentalmente compare com os 3 bons
2. **Se parecer com algum dos 3 ruins**, marque a análise como "Rejeitar" na UI — isso alimenta o feedback loop
3. **Toda vez que rejeitar**, anote o motivo num campo livre — isso vira training data pra próxima versão do prompt mestre
4. **Eval automatizado**: rodar os 6 exemplos como inputs sintéticos a cada deploy do prompt mestre — se algum dos 3 bons regredir ou algum dos 3 ruins for "imitado", reverter o deploy
