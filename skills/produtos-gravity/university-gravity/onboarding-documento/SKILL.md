# Skill: /onboarding-documento

> Gera o conteúdo completo de uma aula do Gravity University — textos, estrutura de blocos, plano de screenshots Playwright e layout variado — seguindo o padrão definido em `documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md`.

---

## Quando Usar

Quando o usuário disser qualquer variação de:
- `"faça a tela de [produto] / [fase]"`
- `"gere o onboarding de [fase] do [produto]"`
- `"/onboarding-documento [produto] [fase]"`

---

## Leitura Obrigatória Antes de Agir

1. `documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md` — padrão editorial, catálogo de blocos, template, tom
2. Skill do produto alvo (ex: `skills/produtos-gravity/pedido/SKILL.md`) — entender o produto
3. `servicos-global/configurador/src/pages/university/conteudo-demo.ts` — ver o que já existe

---

## Processo de Execução (6 Etapas)

### ETAPA 1 — Identificar o escopo

Extrair do pedido do usuário:
- **Produto**: qual produto do Gravity está sendo documentado
- **Fase**: qual aula/módulo dentro do produto
- **Contexto**: o que o usuário já sabe ou já fez neste produto

Se algum dado não estiver claro, perguntar antes de prosseguir.

---

### ETAPA 2 — Preparar contexto do produto

Ler a skill do produto para entender:
- O que o produto faz
- Principais telas e funcionalidades
- Fluxos críticos do usuário
- Terminologia específica (termos que precisarão de bloco `definicao`)

---

### ETAPA 3 — Gerar os blocos de conteúdo

Seguir o **Template Padrão** do ONBOARDING-DOCUMENTO.md:

```
[H1] Título numerado da aula
[imagem] Hero screenshot — rota principal da tela
[texto] Introdução — o que é e para que serve (formal, voz ativa)
[definicao] Se houver termo técnico central
[H2] Primeiro subtema
[dois_colunas] Screenshot específico + texto (imagem direita)
[destaque] Dica ou boa prática
[H2] Segundo subtema (se houver)
[dois_colunas] Outra área + texto (imagem esquerda — alterna)
[texto] Elaboração
[destaque_escuro] Caso de uso real
[video] Demonstração do fluxo (opcional)
[citacao] Frase de impacto (opcional, máx 1)
[texto] Conclusão + gancho para próxima aula
```

**Regras obrigatórias:**
- ❌ Nunca 2 blocos `texto` consecutivos
- ❌ Nunca 2 `dois_colunas` sem bloco intermediário
- ❌ Nunca `avaliacao` no meio da aula, apenas no final
- ✅ Usar `timeline` quando o conteúdo for um fluxo sequencial ou histórico
- ✅ Usar `destaque_escuro` uma vez por aula para criar contraste visual
- ✅ Alternar `imagem_lado` entre usos consecutivos de `dois_colunas`

**Tom obrigatório:**
- ✅ "O módulo de Pedidos centraliza todas as operações..."
- ❌ "Você vai aprender a usar o módulo de Pedidos..."
- Formal mas leve. Voz ativa. Presente do indicativo.

---

### ETAPA 4 — Planejar screenshots Playwright

Para cada bloco `imagem`, `dois_colunas` (campo imagem) e `video`, especificar:

```yaml
bloco: imagem (hero)
rota: /pedido/lista
estado: "12 pedidos visíveis, sem filtros ativos"
viewport: 1440x900, dark mode
recorte: none (tela inteira)
arquivo: assets/screenshots/pedido/lista-de-pedidos/visao-geral.png
```

Gerar um plano Playwright completo como lista separada do conteúdo.

---

### ETAPA 5 — Apresentar para validação

Apresentar em formato legível:

```
=== RASCUNHO: [Produto] / [Fase] ===

BLOCOS (n total):
1. [H1] "Título da aula"
2. [imagem] visao-geral.png — "Tela principal..."
3. [texto] "O módulo de X..."
...

PLANO PLAYWRIGHT (n capturas):
• /rota/da/tela → estado → arquivo.png
...

=== AGUARDANDO APROVAÇÃO ===
```

**⚠️ NÃO ESCREVER em conteudo-demo.ts até o usuário aprovar.**

---

### ETAPA 6 — Persistir após aprovação

Após "aprovado" ou equivalente do usuário:

1. Escrever a nova entrada em `conteudo-demo.ts`:
   - Adicionar `AulaDemo[]` no `CONTEUDO_DEMO` do produto correto
   - Atualizar `TRILHAS_POR_PRODUTO` em `UniversityGravity.tsx` se a fase for nova

2. Registrar as capturas Playwright pendentes como comentário `// PLAYWRIGHT_PENDENTE` no topo do bloco de imagem

3. Commitar na branch `banch-university-gravity`:
   ```
   feat(university): onboarding [produto]/[fase] — conteúdo gerado (/onboarding-documento)
   ```

4. Informar ao usuário os arquivos alterados e o próximo passo (rodar Playwright para gerar os assets)

---

## Tipos de Bloco Suportados

| Tipo | Implementado | Descrição |
|------|-------------|-----------|
| `heading` | ✅ | Título H1/H2/H3 |
| `texto` | ✅ | Parágrafo |
| `imagem` | ✅ | Screenshot ou imagem |
| `video` | ✅ | Demonstração em vídeo |
| `citacao` | ✅ | Frase de impacto |
| `destaque` | ✅ | Dica / Boa prática |
| `definicao` | ⚙️ pendente | Termo técnico (caixa azul) |
| `dois_colunas` | ⚙️ pendente | Texto + screenshot lado a lado |
| `timeline` | ⚙️ pendente | Linha do tempo / fluxo |
| `destaque_escuro` | ⚙️ pendente | Seção de contraste navy |
| `grafico` | ⚙️ pendente | Gráfico / infográfico |
| `avaliacao` | ⚙️ pendente | Quiz de fixação |

> Tipos marcados como ⚙️ pendente devem ser especificados no rascunho mas anotados com `// IMPLEMENTAR_BLOCO` para que o desenvolvedor saiba que falta o renderizador em `PlayerAula.tsx`.

---

## Referências

- **Padrão editorial completo**: `documentos-tecnicos/produtos-gravity/university-gravity/ONBOARDING-DOCUMENTO.md`
- **Manual descritivo de tela (Login e futuros)**: ONBOARDING-DOCUMENTO.md **§9** — tipografia, `MANUAL_CORPO_70`, `ManualTextoRich`, ícones `{{icone:slug}}`, URLs completas
- **Renderizador de blocos**: `servicos-global/configurador/src/pages/university/PlayerAula.tsx`
- **Manual descritivo (código)**: `servicos-global/configurador/src/pages/UniversityGravity.tsx` — `DOC_LOGIN_SECOES`, `ManualBlocoPassoVisual`, `ManualTextoRich`
- **Dados de demo**: `servicos-global/configurador/src/pages/university/conteudo-demo.ts`
- **Mapa de produtos × fases**: seção 7 do ONBOARDING-DOCUMENTO.md

---

## Manual descritivo de tela (regras para agentes)

Quando editar ou criar conteúdo em `DOC_LOGIN_SECOES` (ou futuros `DOC_*_SECOES`):

1. **Ler ONBOARDING-DOCUMENTO.md §9** antes de escrever parágrafos ou passos visuais.
2. **Sumário (§9.6):** `titulo` e `tituloSumario` em **frase** — só primeira palavra e nomes próprios em maiúscula (padrão Login: `A tela de acesso`, `Fluxo 1: Criar sua conta`). ❌ Title Case (`Seus Produtos Gravity`).
3. **Corpo:** `0.9rem` + `MANUAL_CORPO_70` (70% de `--ws-text`). Não usar `MANUAL_TIPO.corpo` legado em texto novo.
4. **Espaço entre parágrafos:** **12px** (`MANUAL_ESPACO_PARAGRAFO_PX`) via `manualMargemParagrafo(i, total)`; **0** no último parágrafo de cada bloco — ver ONBOARDING-DOCUMENTO.md **§9.1.1** e `manual-tipografia.ts`.
5. **Alinhamento:** corpo narrativo **justificado** (`MANUAL_ALINHAMENTO_CORPO`) em parágrafos e callouts — ver **§9.1.2**; títulos e rótulos ficam à esquerda.
6. **Passos:** rótulo `PASSO NN` em `12px` `#818cf8`; título do passo em `0.92rem` 100%; parágrafos via `ManualParagrafo`.
7. **URLs:** sempre `https://usegravity.com.br/...` no texto; login canônico = `https://usegravity.com.br/login`.
8. **Ícones:** token `{{icone:slug}}` **com** escrita descritiva no mesmo parágrafo (ex.: “ícone de olho {{icone:olho}}”).
9. **Screenshots:** salvar em `public/university/screenshots/` e referenciar caminho absoluto `/university/screenshots/...`.
10. **Intro de fluxo:** um parágrafo resumido na seção; detalhes nos `passosVisuais`.
