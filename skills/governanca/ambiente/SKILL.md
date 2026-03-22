---
name: antigravity-ambiente
description: "Use esta skill sempre que um agente precisar iniciar um servidor local, abrir o navegador ou verificar qual porta usar. Todo agente do projeto Gravity opera em uma porta dedicada e exclusiva, e o navegador deve ser sempre aberto na Área de Trabalho 1 do Windows. Esta skill é obrigatória para todos os agentes — consultar antes de qualquer comando npm run dev ou equivalente."
---

# Gravity — Ambiente de Trabalho dos Agentes

## Regra 1 — Navegador na Área de Trabalho 1

Todo agente que precisar abrir ou interagir com o navegador deve garantir que ele esteja rodando na **Área de Trabalho 1** do Windows (Virtual Desktop 1).

- Nunca abrir o navegador em outras áreas de trabalho
- Se o navegador já estiver aberto em outra área, mover para a Área de Trabalho 1 antes de interagir

---

## Regra 2 — Porta Dedicada por Agente

Cada agente opera em uma porta exclusiva para evitar conflito entre servidores simultâneos.

| Agente | Porta |
|:---|:---|
| Agente 1 | `8000` |
| Agente 2 | `8001` |
| Agente 3 | `8002` |
| Agente 4 | `8003` |
| Agente 5 | `8004` |
| Agente N | `8000 + (N-1)` |

**Regra:**
- Antes de iniciar o servidor, verificar se a porta já está em uso
- Nunca usar a porta de outro agente
- Sempre especificar a porta explicitamente no comando

```bash
# Exemplo — Agente 2 inicia o servidor
npm run dev -- --port 8001

# Verificar se porta está em uso antes de iniciar
netstat -an | findstr :8001
```

---

## Regra 3 — Como Identificar Sua Porta

O agente deve identificar sua porta com base no número do seu slot de execução, combinando com o Líder via prompt de distribuição da tarefa. O prompt de distribuição sempre deve conter a linha:

```
Porta designada: 800X
```

---

## Checklist — Antes de Iniciar o Servidor

- [ ] Confirmou a porta designada no prompt de distribuição do Líder?
- [ ] Verificou que a porta está livre?
- [ ] Iniciou o servidor com a porta explicitamente declarada?
- [ ] Abriu o navegador na Área de Trabalho 1?
