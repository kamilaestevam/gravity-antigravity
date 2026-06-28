# /onboarding-documento

Gera o conteúdo completo de uma aula do Gravity University — textos, blocos, layout variado e plano de screenshots Playwright — seguindo o padrão editorial definido.

## Como usar

```
/onboarding-documento <produto> <fase>
```

Exemplos:
- `/onboarding-documento pedido lista-de-pedidos`
- `/onboarding-documento login criando-sua-conta`
- `/onboarding-documento processo criando-processo`

Também aceita forma livre:
- "faça a tela de pedido / lista de pedidos"
- "gere o onboarding de criando-sua-conta do login"

## Execução obrigatória

Ao receber este comando, o agente DEVE:

1. **LER** `skills/produtos-gravity/university-gravity/onboarding-documento/SKILL.md` por inteiro
2. **LER** `documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md` (catálogo de blocos + template + tom)
3. **LER** a skill do produto alvo (ex: `skills/produtos-gravity/pedido/SKILL.md`)
4. **LER** `servicos-global/configurador/src/pages/university/conteudo-demo.ts` para ver o que já existe
5. **EXECUTAR** as 6 etapas da skill na ordem

## Regra absoluta

**NÃO ESCREVER em `conteudo-demo.ts` antes da aprovação explícita do dono.**

O rascunho é apresentado primeiro. Só após "aprovado" (ou equivalente) o agente persiste o conteúdo e commita em `banch-university-gravity`.
