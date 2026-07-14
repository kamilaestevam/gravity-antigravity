# Skill: manual-gravity-onboarding

> Gera o conteúdo completo de uma aula do **Gravity University** (Academy + manuais `/docs`) — textos, blocos, screenshots e jornada gamificada — seguindo `documentos-tecnicos/produtos-gravity/university-gravity/MANUAL-GRAVITY-ONBOARDING.md`.
>
> **Não confundir** com onboarding de produto (`/trial`, organização, workspace) — escopo desta skill é **University / Academy / manual descritivo**.

---

## Quando Usar

**Ler esta skill (sob demanda — não está no boot do `CLAUDE.md`)** quando qualquer gatilho abaixo bater:

### Pedido explícito
- `"faça a tela de [produto] / [fase]"` (University/Academy)
- `"gere a jornada Academy de [fase] do [produto]"`
- `"manual gravity"`, `"manual university"`, `"academy [produto]"`

### Arquivo ou rota (Trilha A)
- `servicos-global/configurador/src/pages/university/` — `conteudo-demo.ts`, `PlayerAula.tsx`, `manual-*-conteudo.ts`, `manual-*-academy.ts`
- `UniversityGravity.tsx` — `TRILHAS_POR_PRODUTO`, jornada/academy, campo `duracao`
- Rota ou URL `/university-gravity/academy` ou `/university-gravity/docs`
- Criar/editar `*_DURACOES`, fase de trilha, aula ou tempo exibido no menu lateral do player

### Duração de leitura
- Ajustar minutos de aula ou total do módulo → ler **MANUAL-GRAVITY-ONBOARDING.md §10** (nesta skill, § Duração de leitura)

---

## Leitura Obrigatória Antes de Agir

1. `documentos-tecnicos/produtos-gravity/university-gravity/MANUAL-GRAVITY-ONBOARDING.md` — padrão editorial, catálogo de blocos, template, tom
2. **MANUAL-GRAVITY-ONBOARDING.md §10** — duração de leitura (Academy): heurística, tetos, SSOT `*_DURACOES`
3. Skill do produto alvo (ex: `skills/produtos-gravity/pedido/SKILL.md`) — entender o produto
4. `servicos-global/configurador/src/pages/university/conteudo-demo.ts` — ver o que já existe

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

Seguir o **Template Padrão** do MANUAL-GRAVITY-ONBOARDING.md:

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

3. Commitar na branch de university:
   ```
   feat(university): academy [produto]/[fase] — conteúdo manual-gravity-onboarding
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
| `infografico` | ✅ | Infográfico React do manual (`academy-infograficos.tsx`) |
| `grafico` | ⚙️ pendente | Gráfico legado (preferir `infografico`) |
| `avaliacao` | ⚙️ pendente | Quiz de fixação |

> Tipos marcados como ⚙️ pendente devem ser especificados no rascunho mas anotados com `// IMPLEMENTAR_BLOCO` para que o desenvolvedor saiba que falta o renderizador em `PlayerAula.tsx`.

---

## Referências

- **Padrão editorial completo**: `documentos-tecnicos/produtos-gravity/university-gravity/MANUAL-GRAVITY-ONBOARDING.md`
- **Manual descritivo de tela (Login e futuros)**: MANUAL-GRAVITY-ONBOARDING.md **§9** — tipografia, `MANUAL_CORPO_70`, `ManualTextoRich`, ícones `{{icone:slug}}`, URLs completas
- **Renderizador de blocos**: `servicos-global/configurador/src/pages/university/PlayerAula.tsx`
- **Manual descritivo (código)**: `servicos-global/configurador/src/pages/UniversityGravity.tsx` — `DOC_LOGIN_SECOES`, `ManualBlocoPassoVisual`, `ManualTextoRich`
- **Dados de demo**: `servicos-global/configurador/src/pages/university/conteudo-demo.ts`
- **Academy ← manual**: `academy-blocos-manual.ts`, `academy-infograficos.tsx`, `manual-*-academy.ts`
- **Mapa de produtos × fases**: seção 7 do MANUAL-GRAVITY-ONBOARDING.md

---

## Manual descritivo de tela (regras para agentes)

Quando editar ou criar conteúdo em `DOC_LOGIN_SECOES` (ou futuros `DOC_*_SECOES`):

### Regra de ritmo vertical — Guia Gravity + manual

O Guia Gravity tem **motor único de espaçamento no `PlayerAula`**. Componentes internos não definem margem externa. Não usar `16px`, `20px`, `1.75rem` ou `margin` ad hoc entre blocos narrativos.

| Onde | Valor | SSOT código |
|------|-------|-------------|
| Título H1 → linha decorativa | **24px** | `MANUAL_ESPACO_TITULO_LINHA_GUIA_PX` + `::after` |
| Linha roxa → 1º parágrafo | **18px** | `MANUAL_ESPACO_APOS_LINHA_TITULO_GUIA_PX` |
| Parágrafo → parágrafo / blocos padrão | **12px** | `MANUAL_ESPACO_ENTRE_PARAGRAFOS_GUIA_PX` / `MANUAL_ESPACO_PARAGRAFO_PX` |
| Intro / parágrafo → primeiro passo | **12px** | `MANUAL_ESPACO_PARAGRAFO_PX` |
| Fim de um passo (tela) → próximo passo | **32px** | `MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX` |
| Texto do passo → screenshot / callout | **12px** | CSS `.uni-player-aula__bloco-passo` |
| Rótulo PASSO → título do passo | **12px** | gap interno `.uni-player-aula__passo-corpo` |
| Conteúdo → linha do rodapé / linha → botões | **24px** | `.uni-player-aula__rodape-nav` |

**Atalho:** `/modelo-espacamento-guia` — fonte da verdade do ritmo do Guia.

**Implementação obrigatória:**
- Manual: `ManualParagrafo`, `ManualBlocoPassoVisual`, `manual-configurador-ui.tsx`
- Guia Gravity: `PlayerAula.tsx` calcula o espaçamento externo com `classificarBlocoGuia()` e `calcularEspacoSuperiorBlocoGuia()` (`marginTop` no wrapper); cada bloco renderizado deve ter **um único root** sem margem externa.
- Guia Gravity usa `MANUAL_GUIA_CORPO_TIPOGRAFIA` (`lineHeight: 1.8`, `textAlign: left`).
- ❌ Proibido `Fragment` com múltiplos roots para um bloco da Academy.
- ❌ Proibido CSS `margin-top: Npx !important` nos wrappers `.uni-player-aula__bloco` (sobrescreve o motor).
- ❌ Proibido `margin: 1.75rem 0` ou valores soltos em figuras/blocos novos — usar constantes de `manual-tipografia.ts`.

1. **Ler MANUAL-GRAVITY-ONBOARDING.md §9** antes de escrever parágrafos ou passos visuais.
2. **Sumário (§9.6):** `titulo` e `tituloSumario` em **frase** — só primeira palavra e nomes próprios em maiúscula (padrão Login: `A tela de acesso`, `Fluxo 1: Criar sua conta`). ❌ Title Case (`Seus Produtos Gravity`).
3. **Corpo:** `0.9rem` + `MANUAL_CORPO_70` (70% de `--ws-text`). Não usar `MANUAL_TIPO.corpo` legado em texto novo.
4. **Espaço entre parágrafos e blocos narrativos (Guia):** **24 / 18 / 12 / 24** — ver **§ Regra de ritmo vertical** e `/modelo-espacamento-guia`.
5. **Alinhamento:** corpo narrativo do Guia à **esquerda** (`MANUAL_GUIA_CORPO_TIPOGRAFIA`); manuais descritivos usam `MANUAL_ALINHAMENTO_CORPO` (justify) — ver **§9.1.2**; títulos e rótulos ficam à esquerda.
6. **Passos:** rótulo `PASSO NN` em `12px` `#818cf8`; título do passo em `0.92rem` 100%; parágrafos via `ManualParagrafo`.
7. **URLs:** sempre `https://usegravity.com.br/...` no texto; login canônico = `https://usegravity.com.br/login`.
8. **Ícones:** token `{{icone:slug}}` **com** escrita descritiva no mesmo parágrafo (ex.: “ícone de olho {{icone:olho}}”).
9. **Screenshots:** salvar em `public/university/screenshots/` e referenciar caminho absoluto `/university/screenshots/...`.
10. **Rich text (§9.7):** botões `**…**`; cópia literal da UI `*_…_*` — ver `skills/produtos-gravity/university-gravity/manual-markdown-rich-text/SKILL.md`.

---

## Academy gerada do manual (SSOT → PlayerAula)

Quando a aula vier do manual (`manual-*-academy.ts` + `academy-blocos-manual.ts`), **não reimplementar conteúdo à mão** — curadoria aponta seção/fluxos do SSOT (`manual-*-conteudo.ts`).

### Infográficos (obrigatório)

**Regra:** todo infográfico que o manual expõe via flag `mostrarInfografico*` e que faça parte da curadoria da aula **deve aparecer na Academy**, no mesmo papel editorial do manual (texto que cita “infográfico abaixo” → bloco `infografico` antes do print).

- **Componente:** reutilizar o React do manual (`ManualInfografico*`), registrado em `servicos-global/configurador/src/pages/university/academy-infograficos.tsx`.
- **Gerador:** `academy-blocos-manual.ts` emite `{ tipo: 'infografico', dados: { id } }` a partir das flags da seção/fluxo (`INFOGRAFICOS_SECAO` / `INFOGRAFICOS_FLUXO`).
- **Player:** `PlayerAula.tsx` renderiza via `<AcademyInfografico id={…} />`.
- **Infográfico novo:** exportar componente do manual (se ainda privado) → registrar id em `academy-infograficos.tsx` → mapear flag em `academy-blocos-manual.ts`. ❌ Não substituir infográfico por screenshot estático.
- **Curadoria:** `incluirIntroSecao: false` omite parágrafos da seção, mas use `infograficosSecao: ['…']` quando a aula ainda precisar do infográfico (ex.: aula 2 do capítulo Fornecedores).

---

## Duração de leitura (Academy) — obrigatório

**Gatilho:** criar/editar aula, fase, jornada ou campo `duracao` em University/Academy.

**SSOT:** `documentos-tecnicos/produtos-gravity/university-gravity/MANUAL-GRAVITY-ONBOARDING.md` **§10**.

Resumo para não errar:

1. **Tempo = leitura no PlayerAula**, não tempo de executar o fluxo na vida real.
2. **Heurística:** `2min + 1min × passo com screenshot + 0,5min × callout extra` → arredondar; teto 3/6/10/12 min conforme §10.2.
3. **Calibração:** se ainda alto, × **0,7** antes de arredondar.
4. **Persistir:** array `*_DURACOES` em `manual-{produto}-academy.ts` + `TRILHAS_POR_PRODUTO[slug][0].duracao` = **soma** das aulas (`'26m'`, não `'1h15'` inflado).
5. **Referência Login:** `['2m','6m','4m','5m','7m','2m']` → total **26m**.

❌ Nunca usar duração de execução hands-on como duração da aula.  
❌ Nunca deixar `TRILHAS_POR_PRODUTO.*.duracao` divergente da soma de `*_DURACOES`.
