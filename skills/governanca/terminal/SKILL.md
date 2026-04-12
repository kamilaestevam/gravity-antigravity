---
name: antigravity-terminal
description: "Skill de automação de terminal. Quando ativada, o agente executa operações de terminal (reiniciar servidor, matar porta, instalar dependência, limpar cache, rodar build) de forma autônoma, sem pedir confirmação a cada passo. O agente age como operador de terminal experiente: diagnostica, executa e reporta o resultado."
---

# Gravity — Terminal Autônomo

## Por que esta skill existe

Em vez de o agente perguntar "posso rodar `npm install`?" ou "posso matar a porta 3000?",
esta skill autoriza execução direta de operações de terminal comuns, com diagnóstico e
reporte limpo do resultado.

O agente age, não pergunta. Se algo falhar, reporta com contexto suficiente para o
usuário decidir o próximo passo.

---

## Quando Esta Skill É Ativada

- Ao usar o comando `/terminal`
- Quando o agente já está no fluxo de outra skill e precisa executar operações de terminal
  como parte do trabalho (ex: reiniciar servidor após ajuste, instalar pacote novo)

---

## Operações Autorizadas (sem pedir confirmação)

### Servidores e Processos

```bash
# Verificar o que está rodando em uma porta
npx kill-port <PORTA>
lsof -ti:<PORTA> | xargs kill -9   # Unix/WSL
netstat -ano | findstr :<PORTA>    # Windows PowerShell

# Reiniciar servidor de desenvolvimento
# (o agente identifica o script correto no package.json)
npm run dev
npm run start
npm run server
```

### Instalação de Dependências

```bash
npm install
npm install <pacote>
npm install <pacote> --save-dev
npm ci   # instalação limpa via lockfile
```

### Build e Verificação de Tipos

```bash
npm run build
npx tsc --noEmit
npm run lint
```

### Limpeza de Cache

```bash
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist
rm -rf build
npx prisma generate   # regenerar client após schema
```

### Banco de Dados (desenvolvimento local apenas)

```bash
npx prisma migrate dev
npx prisma db push
npx prisma studio    # abre interface visual
npx prisma db seed
```

### Git — apenas leitura (sem commit, push ou reset)

```bash
git status
git log --oneline -10
git diff
git stash list
```

---

## Operações que NUNCA são executadas sem confirmação explícita

- `git commit`, `git push`, `git reset`, `git checkout` com mudanças
- `rm -rf` em diretórios que não sejam cache (`node_modules/.cache`, `.next`, `dist`)
- `npx prisma migrate reset` (apaga o banco)
- `npx prisma migrate deploy` (produção)
- Qualquer operação com `--force`
- Kill de processos que não sejam servidores de desenvolvimento conhecidos

---

## Protocolo de Execução

### 1. Identificar o problema

Antes de executar, o agente identifica:
- Qual é o erro ou sintoma?
- Qual comando resolve?
- Existe risco de perda de dados ou estado?

### 2. Executar

O agente executa sem pedir confirmação para operações na lista de autorizadas.

Para operações fora da lista, o agente **descreve o que quer fazer e aguarda aprovação**.

### 3. Reportar

Após executar, o agente reporta:

```
✓ [OPERAÇÃO]: [resultado em 1 linha]
  → [detalhe relevante se necessário]
```

Exemplos:
```
✓ kill-port 3000: porta liberada
✓ npm install: 142 pacotes instalados em 8.3s
✓ tsc --noEmit: 0 erros
✗ npm run build: falhou — ver erro abaixo
```

---

## Ambiente — Windows 11 (padrão deste projeto)

Este projeto roda em **Windows 11**. Priorizar:

| Tarefa | Comando preferencial |
|:-------|:--------------------|
| Listar processos em porta | `netstat -ano \| findstr :PORTA` |
| Matar processo por PID | `taskkill /PID <pid> /F` |
| Matar porta diretamente | `npx kill-port <PORTA>` |
| Listar arquivos | Claude Code Glob (não `ls`) |
| Buscar em arquivos | Claude Code Grep (não `grep`) |

WSL disponível como fallback, mas preferir PowerShell/npx para portabilidade.

---

## Diagnóstico de Problemas Comuns

### Porta em uso

```
PROBLEMA: Error: listen EADDRINUSE :::3000
AÇÃO: npx kill-port 3000 → reiniciar servidor
```

### Módulo não encontrado

```
PROBLEMA: Cannot find module 'X'
AÇÃO: npm install → verificar se pacote está no package.json
```

### Prisma client desatualizado

```
PROBLEMA: PrismaClientKnownRequestError ou tipo não encontrado
AÇÃO: npx prisma generate → reiniciar servidor
```

### TypeScript não compila

```
PROBLEMA: erro de tipo no build/dev
AÇÃO: npx tsc --noEmit → reportar erros com arquivo:linha
```

### Cache corrompido

```
PROBLEMA: comportamento estranho após mudanças
AÇÃO: rm -rf node_modules/.cache (ou .next/dist) → reiniciar
```

---

## Portas Padrão do Projeto

| Produto/Serviço | Backend | Frontend |
|:----------------|:--------|:---------|
| Tenant Server (todos os 11 serviços) | 3001 | — |
| Dashboard BI (client) | — | 5010 |
| Configurador | 8005 | 8000 |
| Marketplace | — | 8001 |
| Pedido | 8030 | 5179 |
| LPCO | 8027 | 5182 |
| NF Importação | 8028 | 5183 |
| Bid Frete | 8023 | 5181 |
| Bid Câmbio | 8025 | 5002 |
| Financeiro Comex | 8029 | 5184 |
| Processo | 8026 | 5000 |
| SimulaCusto | 8020 | 5180 |

> Para portas atualizadas, consultar `skills/governanca/ambiente/SKILL.md`.

---

## Slash Command `/terminal`

Ativa o modo terminal autônomo. Uso:

```
/terminal [descrição do que precisa fazer]
```

Exemplos:
```
/terminal servidor do pedido não sobe, porta 8020 em uso
/terminal instalar dependência zod no produto pedido
/terminal build está quebrando com erro de tipo
```

O agente identifica o problema, executa as operações necessárias da lista autorizada
e reporta o resultado em formato compacto.
