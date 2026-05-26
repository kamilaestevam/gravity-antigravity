# Novo Pedido — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.1
> **Data:** Abril 2026
> **Última atualização:** 2026-05-26
> **Status:** Implementado (drawer manual + snapshot Cadastros)

---

## Canais de Criação de Pedido

| Canal | Descrição | Status atual |
|---|---|---|
| **A. Manual** | Drawer lateral — criar e editar pelo mesmo painel | Substituir NovoPedido.tsx |
| **B. Importar** | Smart import com IA, memória e validação linha a linha | Redesenhar ImportarArquivo.tsx |
| **C. API Cockpit** | Via integração usando API Cockpit | Futuro |
| **D. Smart Read** | Produto existente que lê documentos de pedido | Futuro |

---

## A. Criação Manual

### Conceito
Drawer (painel lateral deslizante) que abre pela direita. O usuário mantém o contexto da lista enquanto preenche. O mesmo drawer serve para **criar** e **editar**.

### Comportamento
- Botão "Novo" → abre drawer vazio
- Clicar em um pedido na lista → abre drawer preenchido (modo edição)
- A lista fica visível e desfocada atrás do drawer
- Fechar sem salvar → confirma se há dados preenchidos

### Campos obrigatórios
**Nenhum campo é travado.** O sistema avisa o que está faltando mas não bloqueia o salvamento. O pedido salvo sem campos essenciais fica com status `rascunho`.

### Itens
- Grade dinâmica de itens dentro do drawer
- Botão "+ Adicionar item" adiciona nova linha inline
- Cada item: `part_number`, `ncm`, `descricao`, `quantidade_inicial`, `unidade`, `valor_unitario`

### Snapshot Cadastros ao salvar (2026-05-26)

Ao criar pedido manual, o backend busca parceiros no Cadastros pelo SUID via
`processos-core/services/cadastrosClient.ts`:

- Endpoint: `GET /api/v1/fornecedores/:suid` (não `/empresas`)
- Contrato bilateral: **`fornecedorSchema`** (`cadastros/shared/schemas/fornecedor.schema.ts`)
- Resposta validada antes de montar `PedidoSnapshotEmpresa` em `pedidoSnapshots.ts`

> **Bug corrigido:** parse com `empresaSchema` falhava em campos exclusivos de fornecedor
> (`pode_ser_importador_fornecedor`, etc.) e quebrava o POST `/pedidos` no browser (ZodError no console).

---

## B. Importar em Massa (Smart Import)

### Filosofia
**O sistema se adapta ao arquivo do usuário — não o contrário.**
O usuário não precisa baixar um template. Pode usar qualquer planilha que já tem.

### Formatos suportados
- Excel (`.xlsx`, `.xls`)
- CSV (`,` `;` `\t` `|`)
- TXT
- XML
- JSON

### Fluxo completo

```
Upload arquivo
     ↓
Parse + detecção de estrutura
     ↓
IA mapeia colunas (< 3 segundos)
     ↓
Usuário vê mapeamento + confirma/ajusta
     ↓
Validação linha a linha
     ↓
Preview: ✓ ok · ⚠ dúvida · ✗ erro
     ↓
Usuário decide o que fazer com cada problema
     ↓
Confirmar importação (parcial ou total)
     ↓
Pedidos criados com status rascunho
```

### Mapeamento inteligente de colunas (3 camadas)

**Camada 1 — IA semântica (Gabi)**
Analisa os cabeçalhos do arquivo e mapeia para campos do sistema. Funciona com qualquer idioma, abreviação, erro de digitação ou nome não-óbvio.

**Camada 2 — Inferência pelos dados**
Analisa os valores das primeiras linhas para confirmar ou corrigir o mapeamento:

| Valor encontrado | Infere |
|---|---|
| "FOB", "CIF", "EXW", "DDP" | `incoterm` |
| Número de 8 dígitos | `ncm` |
| "USD", "EUR", "BRL" | `moeda_pedido` |
| Padrão de data | `data_embarque` |
| Valores decimais grandes | `valor_unitario` |
| Texto alfanumérico curto | `part_number` |

**Camada 3 — Memória por tenant**
- Primeira importação com uma estrutura de arquivo: usuário confirma o mapeamento
- Sistema salva o mapeamento associado à estrutura (hash dos cabeçalhos)
- Próximas importações com mesmo arquivo: aplica automaticamente sem perguntar
- Usuário pode resetar o mapeamento salvo se quiser

### Níveis de confiança do mapeamento

| Confiança | Comportamento | Visual |
|---|---|---|
| > 90% | Auto-mapeia sem perguntar | ✓ verde |
| 50–90% | Exibe para o usuário confirmar | ⚠ amarelo |
| < 50% | Usuário seleciona manualmente | ? cinza |
| Coluna ignorada | Não mapeia | — |

### Campos obrigatórios
Nenhum campo é bloqueador. Sistema avisa o que está faltando mas não impede a importação. Pedidos com campos essenciais ausentes ficam com status `rascunho` e com alerta.

### Número de pedido duplicado
Quando o arquivo contém um `numero_pedido` que já existe no sistema:
- Sistema avisa linha a linha
- Usuário decide para cada duplicata:
  - **Sobrescrever** — atualiza o pedido existente
  - **Criar assim mesmo** — cria um novo pedido com o mesmo número
  - **Pular** — ignora essa linha

### Import parcial (erros em linhas)
Quando algumas linhas têm problemas:
- Sistema separa: ✓ válidas · ⚠ com aviso · ✗ com erro
- Usuário decide por grupo ou linha a linha:
  - Importar só as válidas
  - Importar válidas + avisos
  - Corrigir antes de importar
  - Importar tudo assim mesmo

### Validações por linha
| Validação | Tipo |
|---|---|
| `numero_pedido` ausente | Aviso |
| `part_number` ausente | Aviso |
| `quantidade_inicial` ≤ 0 ou não numérico | Erro |
| `ncm` com formato inválido | Aviso |
| `valor_unitario` negativo | Erro |
| `data_embarque` com formato inválido | Aviso |
| `numero_pedido` duplicado no sistema | Aviso (usuário decide) |
| `numero_pedido` duplicado dentro do arquivo | Agrupa como itens do mesmo pedido |

### Agrupamento inteligente
Linhas com o mesmo `numero_pedido` são agrupadas automaticamente em um único pedido com múltiplos itens.

---

## Regras Transversais

| Regra | Descrição |
|---|---|
| **Status inicial** | Todo pedido criado (manual ou importado) começa com status `rascunho` |
| **Auditoria** | Canal de criação registrado no histórico (`manual`, `importacao`, `api`, `smart_read`) |
| **Colunas do usuário** | Colunas customizadas criadas pelo usuário aparecem no drawer e podem ser mapeadas no import |
| **Permissão** | Permissão separada para criar manual vs importar em massa |
