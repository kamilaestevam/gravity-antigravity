# /docs-skills — Atualizar documentos-tecnicos e skills ao fim da task

> **SSOT:** espelho de `.cursor/commands/docs-skills.md` — alterar nos dois lugares.
> **Este comando existe porque agentes entregam código sem atualizar a documentação nem a skill do escopo, ou escrevem no diretório errado.**

---

## Quando invocado

Ao **final de qualquer task** (ou quando o dono pedir), o agente **PARA** e executa as etapas **0 → 5 nesta ordem**.

Papéis: **Líder** (roteamento + veredito) · **Coordenador** (contrato/SSOT — skill de governança só referencia, nunca redefine regra absoluta em vertical).

**Entrada:** diff da task (`branch changes`, `uncommitted changes` ou descrição do que foi entregue).

---

## ETAPA 0 — Skills obrigatórias (ler antes de editar)

1. `skills/governanca/lei/agent-policy/SKILL.md`
2. `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
3. `skills/processos/code-review/SKILL.md` — seção «Documentação e Skills»

---

## ETAPA 1 — Pergunta ao dono (obrigatória)

Perguntar **uma vez**, em uma linha:

> «Esta entrega exige atualizar `documentos-tecnicos` e/ou `skills`?»

- Dono diz **não** / **só código** → pular ETAPAs 2–4, ir direto à ETAPA 5 com ambos **Não**.
- Dono diz **sim** ou não responde mas a entrega mudou contrato, rota, regra, UX ou arquitetura → continuar (tratar silêncio + mudança óbvia como **sim**).

---

## ETAPA 2 — Roteamento `documentos-tecnicos/` (diretório exato)

**Regra:** editar **somente** o subdiretório correto. Nunca criar pasta nova sem confirmar com o dono. Preferir atualizar `README.md` do escopo + arquivo técnico existente.

| Se a task tocou… | Diretório alvo |
|:---|:---|
| Feature de produto (tela, modal, API do produto) | `documentos-tecnicos/produtos-gravity/<produto-kebab>/` |
| Contrato DDD (rotas, campos, enums do domínio) | `documentos-tecnicos/ddd-atlas/<dominio-kebab>/` |
| Padrão transversal (cache, estado, i18n, seletor) | `documentos-tecnicos/arquitetura/` |
| Infra de testes, registry, admin testes | `documentos-tecnicos/testes/` |
| Tooltip, padrão UX de tela | `documentos-tecnicos/ux/` |
| Segurança, permissões, pentest | `documentos-tecnicos/seguranca/` |
| Deploy, backup, operação | `documentos-tecnicos/operacoes/` |
| Decisão arquitetural irreversível | `documentos-tecnicos/decisoes-arquiteturais/` ou `documentos-tecnicos/adr/` |
| Processo interno (criar produto, deploy) | `documentos-tecnicos/processos/` |
| Gabi / integração ERP | `documentos-tecnicos/gabi/` |

**Se dois diretórios parecem válidos ou nenhum existe** → **parar e perguntar ao dono** qual subpasta usar (listar no máximo 3 opções). Não adivinhar.

**Antes de editar:** ler `README.md` do diretório alvo (índice do escopo).

---

## ETAPA 3 — Roteamento `skills/` (diretório exato)

**Regra:** skills são **mais restritas** — atualizar **apenas** `SKILL.md` existente no caminho exato; **proibido** embutir regra absoluta em vertical (mover para `skills/governanca/lei/` e referenciar).

| Se a task tocou… | Diretório alvo |
|:---|:---|
| Produto Gravity | `skills/produtos-gravity/<produto>/SKILL.md` |
| Testes / planos | `skills/testes/` (ou sub-skill específica) |
| Code review, deploy, criar produto | `skills/processos/<nome>/SKILL.md` |
| Padrão de arquitetura | `skills/arquitetura/<nome>/SKILL.md` |
| UX / componentes / telas | `skills/ux/<nome>/SKILL.md` |
| Segurança | `skills/seguranca/<nome>/SKILL.md` |
| Papel (Líder, QA, Coordenador) | `skills/papeis/<papel>/SKILL.md` |

**Skill inexistente para o escopo** → perguntar ao dono se cria (Coordenador aprova) ou se basta `documentos-tecnicos/`. **Não criar skill nova sozinho.**

**Se incerto** → perguntar ao dono (uma vez, com caminho sugerido).

---

## ETAPA 4 — Executar atualização

- Alterar **somente** arquivos dentro do diretório roteado (não espalhar no monorepo).
- Documentar: contrato de API, rotas, campos DDD, fluxo UX, decisão tomada — o que mudou na entrega.
- Skill: refletir o novo padrão **do escopo**; regras globais → link para governança, não cópia.
- Não editar `schema.prisma` nem criar slash command aqui.

---

## ETAPA 5 — Veredito final (formato fixo — resposta curta)

Entregar **exatamente** este bloco ao dono:

```
## Docs & Skills — fim da task

**documento-tecnico atualizado?** Sim | Não
[Se Sim] **Diretório:** documentos-tecnicos/<caminho>/
[Se Sim] **Resumo:** <frase 1>. <frase 2>.

**skill atualizada?** Sim | Não
[Se Sim] **Diretório:** skills/<caminho>/
[Se Sim] **Resumo:** <frase 1>. <frase 2>.
```

Cada resumo: **no máximo duas frases**, o que foi acrescentado ou corrigido.

---

## Proibido

- Atualizar diretório genérico errado «por conveniência»
- Criar `documentos-tecnicos/` solto na raiz sem subpasta
- Duplicar regra absoluta em skill de produto
- Omitir o veredito Sim/Não ao final
- Pular a pergunta da ETAPA 1
