# Gravity University — Padrão Editorial e Visual de Onboarding

> Documento de referência obrigatório para a skill `/onboarding-documento`.
> Define o catálogo de blocos, tom editorial, template de aula e processo de geração de conteúdo.

---

## 1. Princípio Central

O conteúdo do onboarding deve ser **profissional, variado e escalonável**. Cada aula usa uma sequência de blocos de tipos diferentes — nunca monotona — intercalando texto, imagens, citações, exemplos e elementos interativos, seguindo o padrão de cursos de alto nível (ex: MIT Professional Education).

---

## 2. Tom Editorial

### Regra de Ouro
**O foco é no que o sistema faz, não no que o usuário "vai aprender".**

| ✅ Correto | ❌ Evitar |
|-----------|----------|
| "O módulo de Pedidos centraliza todas as operações de compra." | "Você vai aprender a usar o módulo de Pedidos." |
| "A Lista de Pedidos oferece visibilidade em tempo real." | "Nesta aula você verá como funciona a Lista." |
| "O filtro avançado permite segmentar por status, data e responsável." | "Vamos entender como filtrar pedidos." |

### Características
- **Voz ativa**, tempo presente
- **Formal mas leve** — sem jargão acadêmico, sem excesso de gerundismo
- **Bold** na primeira ocorrência de termos técnicos e conceitos-chave
- Parágrafos de **3-5 frases (~80-120 palavras)**
- Todo termo técnico novo recebe bloco `definicao` na mesma aula
- Idioma primário: **PT-BR** (EN/ES via i18n na implementação)

---

## 3. Catálogo de Blocos

### 3.1 `heading` — Título de seção

```typescript
{ tipo: 'heading', dados: { text: '1. Lista de Pedidos', nivel: 1 } }
{ tipo: 'heading', dados: { text: 'Estrutura da tela', nivel: 2 } }
```

**Visual:**
- H1: fundo com cor de destaque do produto (`#1e293b` elevado + borda inferior accent), fonte 1.65rem, bold 800
- H2: fonte 1.2rem, bold 700, sem fundo, margem superior generosa
- H3: fonte 1rem, cor accent, bold 700

**Regra:** H1 apenas no início da aula. H2 a cada novo bloco temático.

---

### 3.2 `texto` — Parágrafo

```typescript
{ tipo: 'texto', dados: { text: 'A Lista de Pedidos centraliza...' } }
```

**Visual:** fonte `.96rem`, line-height 1.8, cor primária. Suporta HTML simples (bold, itálico).

---

### 3.3 `imagem` — Imagem ou screenshot

```typescript
{
  tipo: 'imagem',
  dados: {
    src: 'assets/screenshots/pedido/lista/visao-geral.png',  // Playwright
    alt: 'Visão geral da Lista de Pedidos',
    caption: 'Tela principal do módulo Pedido com filtros ativos',
    largura: 'full'  // 'full' | 'meio'
  }
}
```

**Visual:**
- `full`: largura 100%, aspect-ratio 16/7, rounded-xl
- `meio`: 50% de largura (usado dentro de `dois_colunas`)
- Caption em itálico, centralizado, abaixo da imagem
- Placeholder: ícone + alt text quando `src` ainda não existe

**Fonte:** screenshots via Playwright (ver seção 5). Nunca usar stock photos genéricas.

---

### 3.4 `video` — Demonstração em vídeo

```typescript
{
  tipo: 'video',
  dados: {
    src: 'assets/videos/pedido/criar-pedido.webm',  // Playwright recording
    titulo: 'Criando um pedido do zero — demonstração',
    duracao: '2m30'
  }
}
```

**Visual:** player com fundo dark indigo, botão play centrado, título + duração abaixo.

---

### 3.5 `citacao` — Frase de impacto

```typescript
{
  tipo: 'citacao',
  dados: {
    texto: 'Visibilidade total, do pedido ao desembaraço.',
    autor: 'Time Gravity'
  }
}
```

**Visual:** aspas grandes (cor accent, 40% opacidade), texto bold itálico 1.08rem, borda esquerda accent, fundo accent 7%.

**Regra:** Máximo **1 por aula**. Usar no 2/3 final, nunca no início.

---

### 3.6 `destaque` — Dica / Boa prática / Atenção

```typescript
{
  tipo: 'destaque',
  dados: {
    titulo: 'Dica',           // 'Dica' | 'Atenção' | 'Boa prática' | 'Importante'
    text: 'Ao criar um pedido...',
    icone: 'lightbulb'        // 'lightbulb' | 'warning' | 'check' | 'info'
  }
}
```

**Visual:** caixa com fundo accent 8%, borda accent 20%, ícone + título bold accent, texto secundário.

---

### 3.7 `definicao` — Definição de termo técnico

```typescript
{
  tipo: 'definicao',
  dados: {
    termo: 'SKU',
    definicao: 'Stock Keeping Unit — código único que identifica cada produto no sistema.'
  }
}
```

**Visual** (ref. MIT — caixa azul claro):
Fundo `rgba(99,102,241,.08)`, borda `rgba(99,102,241,.2)`, ícone livro à direita, título bold, texto regular.

---

### 3.8 `dois_colunas` — Texto + screenshot lado a lado

```typescript
{
  tipo: 'dois_colunas',
  dados: {
    texto: 'A barra de filtros avançados permite...',
    imagem_src: 'assets/screenshots/pedido/lista/filtros.png',
    imagem_alt: 'Painel de filtros da Lista de Pedidos',
    imagem_lado: 'direita'  // 'esquerda' | 'direita'
  }
}
```

**Visual:** grid 2 colunas (55% texto / 45% imagem), alternar lado a cada uso. Em telas < 768px empilha. Imagem rounded-lg com shadow sutil.

**Regra:** Alternar `imagem_lado` entre usos consecutivos para não monotonizar.

---

### 3.9 `timeline` — Linha do tempo / Sequência de etapas

```typescript
{
  tipo: 'timeline',
  dados: {
    titulo: 'Fluxo de criação de um Pedido',
    itens: JSON.stringify([
      { label: 'Criar pedido', descricao: 'Preencher campos obrigatórios' },
      { label: 'Adicionar itens', descricao: 'Inserir produtos e quantidades' },
      { label: 'Revisar', descricao: 'Confirmar dados e totais' },
      { label: 'Enviar', descricao: 'Pedido encaminhado ao fornecedor' },
    ])
  }
}
```

**Visual** (ref. MIT — timeline vertical):
Linha central, círculos alternando esquerda/direita com rótulo, marcadores Início/Fim. Cor dos nós: accent do produto.

**Quando usar:** fluxos de processo, histórico cronológico, jornada do usuário step-by-step.

---

### 3.10 `destaque_escuro` — Seção de contraste (caso de uso real)

```typescript
{
  tipo: 'destaque_escuro',
  dados: {
    titulo: 'Caso de uso: importação de eletrônicos',
    texto: 'Uma trading com 200 pedidos mensais utiliza...',
    imagem_src: 'assets/screenshots/pedido/lista/com-dados.png',
    imagem_alt: 'Lista com pedidos reais carregados'
  }
}
```

**Visual** (ref. MIT — seção dark navy):
Fundo `#0f172a`, texto claro, imagem à direita com opacidade 90%. Cria pausa visual e contraste na leitura.

**Quando usar:** 1x por aula, preferencialmente no 3/4 final. Caso de uso real ou exemplo concreto.

---

### 3.11 `grafico` — Gráfico ou infográfico

```typescript
{
  tipo: 'grafico',
  dados: {
    titulo: 'Redução de retrabalho com o Gravity',
    descricao: 'Comparativo antes/depois da implementação',
    imagem_src: 'assets/graficos/pedido/reducao-retrabalho.png',
    fonte: 'Dados internos Gravity, 2024'
  }
}
```

**Visual:** imagem centralizada largura total, título H3 acima, fonte em itálico abaixo.

---

### 3.12 `avaliacao` — Ponto de avaliação / Reflexão

```typescript
{
  tipo: 'avaliacao',
  dados: {
    pergunta: 'O que acontece quando um pedido é rejeitado pelo fornecedor?',
    opcoes: JSON.stringify([
      { texto: 'Volta para rascunho automaticamente', correta: true },
      { texto: 'É excluído do sistema', correta: false },
      { texto: 'Fica aguardando revisão manual', correta: false },
    ])
  }
}
```

**Quando usar:** Opcional, no final de aulas longas (> 4 blocos de conteúdo). Máx 1 por aula.

---

## 4. Template Padrão de Aula

A sequência abaixo é o **modelo base**. Pode ser adaptada conforme o conteúdo, mas a variedade de tipos é obrigatória.

```
[H1]              Título numerado da aula (ex: "1. Lista de Pedidos")
[imagem]          Hero screenshot da tela principal — largura full
[texto]           Parágrafo de introdução: o que é esta tela, para que serve
[definicao]       Se houver termo técnico central nesta aula
[H2]              Primeiro bloco temático
[dois_colunas]    Screenshot da área específica + texto explicativo (imagem à direita)
[destaque]        Dica ou boa prática relacionada ao bloco acima
[H2]              Segundo bloco temático (se houver)
[dois_colunas]    Outra área da tela + texto (imagem à esquerda — alterna lado)
[texto]           Elaboração conceitual
[destaque_escuro] Caso de uso real com imagem
[video]           Demonstração do fluxo completo (opcional)
[citacao]         Frase de impacto (1 por aula, opcional)
[texto]           Conclusão: o que esta tela permite e gancho para próxima aula
```

**Regras de composição:**
- Nunca 2 blocos `texto` consecutivos sem bloco visual entre eles
- Nunca 2 `dois_colunas` consecutivos sem `destaque` ou `texto` entre eles
- `timeline` substitui `dois_colunas` quando o conteúdo é um fluxo sequencial
- `avaliacao` só no final, nunca no meio

---

## 5. Processo Playwright — Screenshots e Vídeos

### 5.1 Padrão de captura

| Parâmetro | Valor |
|-----------|-------|
| Viewport | `1440 × 900` |
| Tema | Dark mode (padrão do shell) |
| Estado | Com dados reais/mock visíveis (não tela vazia) |
| Formato | PNG para imagens, WebM para vídeos |

### 5.2 Especificação por bloco

Para cada bloco `imagem` ou `video`, o agente deve especificar:

```yaml
rota: /pedido/lista
estado: "filtro por status 'Em análise' ativo, 12 pedidos visíveis"
elemento_foco: ".gtv-table-wrapper"  # opcional — recorte específico
arquivo: assets/screenshots/pedido/lista/filtro-status.png
```

### 5.3 Nomenclatura de arquivos

```
assets/
  screenshots/
    {produto-slug}/
      {fase-slug}/
        {nome-descritivo-kebab-case}.png
  videos/
    {produto-slug}/
      {fase-slug}/
        {nome-descritivo-kebab-case}.webm
  graficos/
    {produto-slug}/
        {nome-descritivo-kebab-case}.png
```

---

## 6. Workflow de Geração (para a skill `/onboarding-documento`)

```
1. PREPARAR   → Ler skill do produto alvo + este documento
2. GERAR      → Montar array BlocoConteudo[] seguindo template + tom
3. PLANEJAR   → Para cada imagem/video: especificar rota Playwright + estado
4. APRESENTAR → Mostrar rascunho legível para validação (NÃO persistir ainda)
5. AGUARDAR   → Dono revisa e aprova ou solicita ajustes
6. PERSISTIR  → Escrever em conteudo-demo.ts + commitar na branch banch-university-gravity
7. CAPTURAR   → (passo separado) Rodar Playwright para gerar os assets
```

---

## 7. Mapa de Produtos × Fases

| Produto | Slug | Fases planejadas |
|---------|------|-----------------|
| Login | `login` | o-que-e-o-gravity · criando-sua-conta · configurando-seu-perfil |
| Configurador | `configurador` | criando-organizacao · configurando-workspaces · convidando-usuarios |
| HUB | `hub` | navegando-pelo-hub · trocando-workspace |
| Pedido | `pedido` | lista-de-pedidos · criando-um-pedido · edicao-em-massa · colunas-e-filtros · relatorios |
| Smart Read | `smart-read` | anexando-documentos · leitura-inteligente · analise-de-riscos · exportando-insights |
| Processo | `processo` | criando-processo · dados-tecnicos · vinculando-pedidos · containers-taxas · workflow-status · relatorios |
| BID Frete | `bid-frete` | nova-cotacao · comparando-fretes · aprovacao-followup · relatorios-frete |
| BID Câmbio | `bid-cambio` | simulacao-cambio · fechamento-cambio · historico-relatorios |
| Gravity Store | `store` | explorando-marketplace · contratando-produto |
| Admin | `admin` | visao-geral-admin · impersonacao · monitor-apis |

---

## 8. Novos Tipos de Bloco a Implementar em PlayerAula.tsx

Os seguintes tipos estão especificados aqui mas ainda precisam ser adicionados ao renderizador:

| Tipo | Status | Prioridade |
|------|--------|-----------|
| `definicao` | ⚙️ A implementar | Alta |
| `dois_colunas` | ⚙️ A implementar | Alta |
| `timeline` | ⚙️ A implementar | Alta |
| `destaque_escuro` | ⚙️ A implementar | Média |
| `grafico` | ⚙️ A implementar | Média |
| `avaliacao` | ⚙️ A implementar | Baixa |
| `heading` | ✅ Implementado | — |
| `texto` | ✅ Implementado | — |
| `imagem` | ✅ Implementado | — |
| `video` | ✅ Implementado | — |
| `citacao` | ✅ Implementado | — |
| `destaque` | ✅ Implementado | — |

---

## 9. Manual descritivo de tela (`DocLoginManual`)

Além das aulas em blocos (`PlayerAula`), o Configurador expõe manuais descritivos embutidos em `UniversityGravity.tsx` (ex.: Login em `/university-gravity/docs/login`). Este formato tem regras próprias de tipografia, ícones inline e URLs.

### 9.1 Tipografia e cor

| Elemento | Tamanho | Cor | Observação |
|----------|---------|-----|------------|
| Rótulo **PASSO NN** | `12px` | `#818cf8` (índigo) | `text-transform: uppercase`, `letter-spacing: .08em` |
| Título do passo | `0.92rem` (~15px) | `var(--ws-text, #f1f5f9)` 100% | Peso 700 |
| **Corpo** (parágrafos, callouts, legendas, timeline) | `0.9rem` (~14px) | `color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)` | Constante `MANUAL_CORPO_70` no código |
| Títulos de seção / cards | conforme layout | 100% `--ws-text` | Não recebem opacidade 70% |
| Metadados (versão, data, rota) | `.78rem` | `--ws-muted` | Não é corpo narrativo |

**Regra:** todo texto explicativo do manual usa `ManualParagrafo` / `ManualTextoRich` com `MANUAL_CORPO_70`. Títulos e rótulos permanecem em 100%.

### 9.2 URLs e links

- URLs públicas sempre completas: `https://usegravity.com.br/login` (nunca só `/login` no corpo narrativo).
- O renderizador `ManualTextoRich` detecta `https://…` e gera `<a target="_blank">` com sublinhado índigo.
- Metadado **URL de acesso** no cabeçalho do manual deve espelhar a URL canônica de produção.

### 9.3 Ícones inline (Phosphor)

No texto fonte (`DOC_LOGIN_SECOES`), referenciar ícones com token **e** escrita descritiva no mesmo parágrafo:

```
O ícone de olho {{icone:olho}} à direita da senha revela ou oculta o que você digitou.
```

| Slug | Ícone Phosphor |
|------|----------------|
| `olho` | `Eye` |
| `olho-riscado` | `EyeSlash` |
| `envelope` | `Envelope` |
| `cadeado` | `Lock` |

❌ Só o token sem texto (“clique em {{icone:olho}}”)  
✅ Token + descrição (“ícone de olho {{icone:olho}}”)

### 9.4 Passos visuais (`passosVisuais`)

- Layout: grid texto (36%) + screenshot (64%), borda esquerda índigo.
- Um passo = rótulo + título + `paragrafos[]` + screenshot opcional + `callout` opcional.
- Screenshots em `public/university/screenshots/` com nomenclatura `{produto}-fluxo{n}-passo-{nn}-{descricao}.png`.
- Intro da seção (antes dos passos): parágrafo único resumido; detalhe fica nos passos.

### 9.5 Constantes no código (SSOT)

Em `UniversityGravity.tsx`, reutilizar:

- `MANUAL_TITULO_COR` — títulos 100%
- `MANUAL_CORPO_70` — corpo com 70% de opacidade sobre `--ws-text`
- `MANUAL_ESTILO_PASSO_ROTULO`, `MANUAL_ESTILO_PASSO_TITULO`, `MANUAL_ESTILO_CORPO`, `MANUAL_ESTILO_CALLOUT_CORPO`
- `ManualTextoRich` — parse de URLs e `{{icone:slug}}`
- `ManualParagrafo` — parágrafo padrão do corpo
