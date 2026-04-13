---
name: antigravity-terminal
description: "Skill de execução automática de comandos de terminal. Quando ativada, o agente executa imediatamente qualquer operação solicitada: matar portas, reiniciar servidores, instalar dependências, rodar builds, limpar cache, etc. Sem pedir confirmação para operações de desenvolvimento local. Ativar com /terminal."
---

# Gravity — Terminal

## O que esta skill faz

Ao ser ativada, o agente executa comandos de terminal **imediatamente**, sem pedir confirmação para operações rotineiras de desenvolvimento local. A ideia é eliminar o ciclo de "quer que eu rode X?" — se o contexto pede, roda.

---

## Quando Executar Sem Pedir Confirmação

Executar direto, sem perguntar:

| Operação | Exemplos |
|:---------|:---------|
| Matar porta | `npx kill-port 5000`, `lsof -ti:8027 \| xargs kill -9` |
| Reiniciar servidor | `npm run dev`, `npm start`, reiniciar processo |
| Instalar dependências | `npm install`, `npm install [pacote]` |
| Rodar build | `npm run build`, `npx tsc --noEmit` |
| Limpar cache | `rm -rf node_modules/.cache`, `rm -rf dist` |
| Rodar scripts do projeto | `npm run [qualquer script do package.json]` |
| Checar porta em uso | `netstat`, `lsof -i :[porta]` |
| Ver logs de processo | `tail -f`, saída de servidor em background |
| Rodar testes | `npm run test`, `npx vitest`, `npx playwright test` |
| Checar status de processos | `ps aux`, listar processos Node |

---

## Quando PARAR e Pedir Confirmação

Parar **sempre** antes de:

- Deletar arquivos fora de `node_modules`, `dist`, `.cache`, `build`
- Fazer `git push`, `git reset --hard`, `git checkout` destrutivo
- Rodar migrations de banco (`prisma migrate deploy`)
- Alterar variáveis de ambiente em produção
- Encerrar processos que não são do projeto atual
- Qualquer operação em Railway, banco de produção ou serviço externo

---

## Ambiente do Projeto

**Windows 11 — shell padrão: bash (via terminal do VS Code)**

Este projeto roda em Windows 11. Usar sintaxe Unix (`/dev/null`, barras normais,
`kill`, `lsof`) pois o terminal do VS Code usa bash.

### Matar porta (Windows/bash)

```bash
# Opção 1 — via npx (recomendado)
npx kill-port [PORTA]

# Opção 2 — PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort [PORTA]).OwningProcess | Stop-Process -Force

# Opção 3 — bash WSL
lsof -ti:[PORTA] | xargs kill -9
```

### Reiniciar servidor de produto

```bash
# Frontend (client)
cd produto/[nome]/client && npm run dev

# Backend (server)
cd produto/[nome]/server && npm run dev

# Ambos com concurrently
npm run dev  # se houver script na raiz do produto
```

### Portas padrão do projeto

Consultar `skills/governanca/ambiente/SKILL.md` para lista completa de portas.
Regra geral: frontends em 5xxx, backends em 8xxx.

### Verificar o que está rodando

```bash
# Listar processos Node
ps aux | grep node

# Checar porta específica
npx kill-port --list  # ou lsof -i :[porta]
```

---

## Fluxo de Execução

Ao receber um pedido de terminal:

1. **Identificar** a operação (matar porta? reiniciar? instalar?)
2. **Checar** se está na lista "executar sem confirmação"
3. **Executar** imediatamente com o comando correto
4. **Reportar** o resultado (saída do comando, porta morta, servidor rodando, etc.)
5. **Aguardar** próxima instrução

Se o servidor falhar ao subir → reportar o erro completo sem omitir linhas.
Se a porta não existir → informar que não havia processo naquela porta.

---

## Checklist Rápido

- [ ] Operação é de desenvolvimento local? → Executar direto
- [ ] Porta a ser morta foi confirmada como do projeto? → Executar direto
- [ ] Servidor a reiniciar é do produto atual? → Executar direto
- [ ] Envolve produção, banco, git destrutivo? → **Parar e confirmar com o usuário**
