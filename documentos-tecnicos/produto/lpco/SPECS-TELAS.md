# Specs por Tela — LPCO MVP

> **Elaborado por:** Designer + Tech Lead — Dream Team de Produtos
> **Data:** 30/03/2026
> **Design System:** Gravity (Plus Jakarta Sans, Lucide icons, dark/light, pill buttons)

---

## T-00: Escolha de Canal (`/lpco/novo`)

### Layout
- Titulo: "Como voce quer criar este LPCO?"
- 5 cards em grid 3×2 (desktop), 2×3 (tablet), 1×5 (mobile)
- Cada card: icone Lucide (48px) + titulo + subtitulo de 1 linha
- Rodape: "Via API? Use o API Cockpit" com link

### Cards

| Card | Icone | Titulo | Subtitulo |
|------|-------|--------|-----------|
| 1 | `PenLine` | Digitar manual | Preencha todos os campos |
| 2 | `FileSpreadsheet` | Planilha Excel/CSV | Importe em lote |
| 3 | `Package` | A partir do Pedido | Auto-preenche ~70% |
| 4 | `ScanLine` | Smart Read | OCR+IA extrai dos documentos |
| 5 | `Copy` | Duplicar existente | Copie de um LPCO anterior |

### Estados
- **Default:** 5 cards clicaveis
- **Hover:** card eleva (shadow) + borda accent
- **Loading:** nenhum (navegacao instantanea)

### Componentes nucleo-global
- `CardGlobal` para cada opcao

---

## T-01: Lista de LPCOs (`/lpco`)

### Layout
- Cabecalho: titulo "LPCOs" + botao "+ Novo LPCO" (pill, accent)
- Barra de filtros: status (multi-select), orgao (multi-select), tipo operacao (imp/exp), canal entrada
- Campo de busca com debounce 300ms
- TabelaGlobal com paginacao server-side (20/pagina)

### Colunas da Tabela

| Coluna | Tipo | Largura | Ordenavel |
|--------|------|---------|-----------|
| ID | texto (lpco_id_...) | 180px | sim |
| N Portal | texto | 160px | sim |
| Orgao | badge com sigla | 100px | sim |
| Tipo | badge (IMP/EXP) | 80px | sim |
| Status | StatusBadgeGlobal | 140px | sim |
| Data Registro | data dd/mm/yy | 120px | sim |
| Canal | badge | 120px | nao |
| Acoes | icone eye (ver) | 60px | nao |

### Estados
- **Empty:** ilustracao + "Nenhum LPCO encontrado" + botao "Criar primeiro LPCO"
- **Loading:** skeleton (8 linhas)
- **Error:** mensagem + botao "Tentar novamente"
- **Filled:** tabela com dados
- **Filtered empty:** "Nenhum resultado para os filtros selecionados" + botao "Limpar filtros"

### Componentes nucleo-global
- `TabelaGlobal`, `StatusBadgeGlobal`, `CampoSelectGlobal`, `CampoLocalizarExpandidoGlobal`, `BotaoGlobal`

---

## T-02: Dados Gerais (`/lpco/novo/dados`) — Step 1

### Layout
- Stepper no topo: [1. Dados Gerais] → [2. Itens] → [3. Revisao]
- Formulario em 2 colunas (desktop), 1 coluna (mobile)
- Botoes: "Voltar" (outline) + "Proximo" (accent, pill)

### Campos

| Campo | Componente | Obrigatorio | Largura |
|-------|-----------|-------------|---------|
| Tipo Operacao | CampoSelectGlobal (IMP/EXP) | sim | 50% |
| Tipo LPCO | CampoSelectGlobal (Por Operacao/Flex/Taxa) | sim | 50% |
| Orgao Anuente | CampoSelectGlobal (16 orgaos) | sim | 50% |
| Modelo LPCO | CampoSelectGlobal (dinamico por orgao) | sim | 50% |
| Pais Procedencia | CampoSelectGlobal (ISO 3166) | sim | 50% |
| Fundamento Legal | CampoGeralGlobal (texto) | sim | 100% |
| Unidade Entrada | CampoSelectGlobal | nao | 50% |
| Recinto Armazenamento | CampoGeralGlobal | nao | 50% |

### Comportamento
- Ao selecionar orgao, modelos sao filtrados dinamicamente
- Se veio do Pedido: campos pre-preenchidos com borda azul "auto-preenchido"
- Se veio do Smart Read: campos extraidos com borda amarela "extraido por IA — confirme"

---

## T-03: Itens NCM (`/lpco/novo/itens`) — Step 2

### Layout
- Stepper no topo
- Tabela de itens adicionados (editavel inline)
- Botao "+ Adicionar Item" abre modal ou formulario inline
- Formulario dinamico de atributos (FormularioDinamico) abaixo de cada item

### Campos por Item

| Campo | Componente | Obrigatorio |
|-------|-----------|-------------|
| NCM | CampoGeralGlobal (8 digitos, mascara) | sim |
| Produto (Catalogo) | CampoSelectGlobal com busca | sim (imp) |
| Descricao | CampoGeralGlobal | sim |
| Fabricante | CampoGeralGlobal | nao |
| Qtd Estatistica | CampoGeralGlobal (numero) | sim |
| Unidade Medida | CampoSelectGlobal | sim |
| Peso Liquido | CampoGeralGlobal (decimal) | sim |
| VMLE | CampoGeralGlobal (decimal) | sim |
| Moeda | CampoSelectGlobal (ISO 4217) | sim |
| Incoterm | CampoSelectGlobal | nao |

### Atributos Dinamicos (FormularioDinamico)
- Renderiza campos baseado no JSON schema do modelo/orgao
- Tipos suportados: texto, numero, data, selecao, booleano, composto
- Campos condicionais aparecem quando campo pai e preenchido
- Campos obrigatorios com asterisco vermelho

---

## T-04: Revisao (`/lpco/novo/revisao`) — Step 3

### Layout
- Stepper no topo
- Resumo readonly de todos os dados (accordions: Dados Gerais, Itens, Documentos)
- Indicador de validacao: lista de erros (se houver) em vermelho
- Botoes: "Voltar" (outline) + "Registrar" (accent, pill, desabilitado se ha erros)

### Comportamento
- Validacao Zod executada automaticamente ao entrar na tela
- Se credencial Portal Unico configurada: checkbox "Registrar automaticamente no Portal Unico"
- Se nao: mensagem informativa "Voce precisara registrar manualmente no Portal Unico"

---

## T-07: Detalhe do LPCO (`/lpco/:id`)

### Layout
- Cabecalho: ID + numero_portal + StatusBadgeGlobal + botoes de acao
- Tabs: Formulario | Documentos | Exigencias | Vinculos | Historico
- Botoes de acao variam por status:
  - Rascunho: "Editar", "Registrar", "Cancelar"
  - Para analise: "Sincronizar Status"
  - Em exigencia: "Responder Exigencia"
  - Deferida: "Vincular a Processo"

### Aba Exigencias (T-10)
- Lista de exigencias com: numero, descricao, data, prazo, status
- Botao "Responder" em cada exigencia pendente
- Campo de resposta com rich text basico
- Indicador de dias restantes (verde >30, amarelo 10-30, vermelho <10)

### Aba Vinculos (T-11)
- Lista de vinculos: processo, tipo documento, quantidade, status
- Se LPCO Flex: SaldoIndicador no topo (barra: deferido | consumido | disponivel)
- Botao "+ Vincular a Processo" (so se deferida)

### Aba Historico (T-12)
- TimelineLpco: eventos em ordem cronologica inversa
- Cada evento: data/hora, icone do tipo, descricao, usuario
- Sem botao de editar/excluir (append-only)

---

## T-13: Simulador TA (`/lpco/simulador`)

### Layout
- Campo NCM (8 digitos) + Select operacao (IMP/EXP) + Botao "Simular"
- Resultado: tabela de orgaos anuentes que exigem LPCO
- Cada linha: sigla, nome, modelo, obrigatoriedade
- Botao "Criar LPCO" ao lado de cada orgao (leva para wizard pre-preenchido)

---

## T-14: Credenciais Siscomex (`/lpco/configuracoes`)

### Layout
- 2 cards: "Certificado Digital" e "Token OAuth2 (gov.br)"
- Cada card mostra status: configurado/nao configurado/expirado
- Botoes: "Configurar", "Testar Conexao", "Remover"

### Card Certificado Digital
- Upload .pfx/.p12
- Campo senha (password, nunca exibida novamente)
- Apos salvar: exibe CN, validade, emissor
- Indicador de validade: verde (>30 dias), amarelo (10-30), vermelho (<10)

### Card Token OAuth2
- Campos: client_id, client_secret (password)
- Scope (opcional)
- Botao "Testar Conexao"

---

## Responsividade

| Breakpoint | Layout |
|-----------|--------|
| Desktop (1280+) | 2 colunas formularios, tabela completa, sidebar visivel |
| Tablet (768-1279) | 1-2 colunas, tabela com scroll horizontal, sidebar colapsavel |
| Mobile (<768) | 1 coluna, cards empilhados, tabela como cards, menu hamburger |

## Acessibilidade

- Tab order logica em todos os formularios
- Aria-labels em botoes de icone
- Contraste minimo 4.5:1 (WCAG AA)
- Focus ring visivel (`--focus-ring`)
- Screen reader: todos os badges com aria-label descritivo
