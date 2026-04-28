# Smart Import — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.2
> **Data:** Abril 2026
> **Status:** Implementado e em produção

---

## O que é

O Smart Import é o fluxo de importação inteligente de pedidos a partir de arquivos externos. Permite ao operador carregar uma planilha Excel, CSV, PDF de invoice ou outros formatos e transformar as linhas do arquivo em pedidos no sistema, com mapeamento automático de colunas via IA.

---

## Formatos Aceitos

| Formato | Extensão | Observação |
|---|---|---|
| Excel | `.xlsx`, `.xls` | Recomendado. Suporte a múltiplas abas. |
| CSV | `.csv` | Auto-detecta separador: `,` `;` `\t` `|` |
| Texto tabulado | `.txt` | Mesmo parser do CSV |
| JSON | `.json` | Deve ser um array de objetos |
| XML | `.xml` | Tags de um nível (parser simples) |
| PDF | `.pdf` | Apenas PDFs com texto selecionável. PDFs escaneados (imagem) não são suportados. |

**Limite de tamanho:** 10 MB por arquivo.

**PDFs escaneados:** não são suportados. O sistema retorna uma mensagem de aviso explicando que o PDF não contém texto extraível e orienta o usuário a usar Excel ou CSV.

---

## Fluxo do Usuário

```
1. Upload
   ├── Usuário arrasta ou seleciona o arquivo
   ├── Se Excel com múltiplas abas → seleciona qual aba importar
   └── Sistema analisa e mapeia automaticamente

2. Mapeamento
   ├── Sistema exibe as colunas do arquivo e o campo correspondente no sistema
   ├── Mostra um valor de exemplo de cada coluna para o usuário validar
   ├── Mostra % de confiança por coluna e global
   ├── Se mapeamento já foi feito antes (mesmas colunas) → aplicado automaticamente com badge "Mapeamento salvo"
   ├── Usuário pode ajustar qualquer mapeamento manualmente
   ├── Usuário pode ignorar colunas que não devem ser importadas
   └── Checkbox "Lembrar este mapeamento" para reutilizar em próximos uploads

3. Preview
   ├── Exibe todas as linhas com status: OK / Aviso / Erro
   ├── Pedidos que já existem no sistema são marcados com aviso de duplicata
   ├── Para cada duplicata, usuário decide: Sobrescrever / Criar novo / Pular
   ├── Usuário pode editar o número do pedido de cada linha
   ├── Usuário seleciona quais linhas incluir na importação
   └── Erros bloqueantes (quantidade negativa, formato inválido grave) ficam deselecionados por padrão

4. Resultado
   ├── Exibe: Criados / Atualizados / Pulados / Erros
   ├── Se houver erros, oferece download de relatório .csv com linha e motivo
   ├── Botão "Ver Pedidos Importados" navega para a lista filtrada pelos pedidos criados
   └── Botão "Reverter esta importação" cancela os pedidos criados (status → Cancelado)
```

---

## Extração de PDF (Gemini)

Quando o arquivo é um PDF e a integração Gemini está ativa:

- O sistema envia o PDF para o modelo **Gemini 2.5 Flash**
- O modelo extrai automaticamente todos os itens da invoice (parte number, descrição, quantidade, valor, etc.)
- O processo pode levar **até 60–90 segundos** para invoices com muitas páginas — uma mensagem informa o usuário durante o carregamento
- Após extração, o mapeamento é automático (o Gemini já usa os nomes internos do sistema)
- O UI exibe **"✦ Extraído com IA (Gemini)"** na barra de contexto do mapeamento

Se o Gemini não estiver disponível ou falhar:
1. O sistema tenta extrair o texto do PDF localmente
2. Se o PDF não contiver texto selecionável, retorna aviso e orienta o usuário a usar Excel/CSV

**Custo estimado:** ~$0,009 por invoice de 26 páginas / 66 itens.

---

## Mapeamento Automático de Colunas

O sistema mapeia automaticamente as colunas do arquivo para os campos do sistema com base em:

### 1. Nomes internos do sistema (exclusivo para PDF via Gemini)
Quando o Gemini extrai um PDF, ele já usa os nomes internos (`moeda_pedido`, `valor_unitario_item`, etc.). Esses campos são reconhecidos com **99% de confiança** automaticamente.

### 2. Aliases conhecidos (Excel/CSV)
O sistema mantém uma lista de aliases para cada campo. Exemplos:

| Campo no sistema | Aliases aceitos |
|---|---|
| Número do Pedido | PO Number, Order Number, Purchase Order, Referencia, PO#, SO Number |
| Exportador | Supplier, Vendor, Shipper, Exporter, Company |
| Fabricante | Manufacturer, Maker, Brand, Produced By |
| Moeda | Currency, Moeda, CCY |
| Data de Emissão | Order Date, PO Date, Issue Date, Data Emissão |
| Part Number | Part Number, SKU, Item Code, Codigo, Reference |
| Descrição | Description, Product Name, Goods Description |
| Quantidade | Qty, Quantity, Qtd, Qtde, Pieces, Count |
| Valor Unitário | Unit Price, Price, Unit Value, Unit Cost |
| Valor Total Item | Total Value, Line Total, Line Amount |
| NCM | NCM, HS Code, Tariff Code, Harmonized Code |

> **Fabricante ≠ Exportador:** São campos distintos. "Manufacturer" só mapeia para Fabricante, nunca para Exportador.

### 3. Inferência pelos dados
Se o alias não identificou o campo, o sistema analisa os valores da coluna:
- Todos os valores são `FOB`, `CIF`, `EXW`... → campo `incoterm`
- Todos os valores são moedas ISO (`USD`, `EUR`, `BRL`)... → campo `moeda`
- Maioria dos valores tem formato de NCM (8 dígitos) → campo `NCM`
- Maioria dos valores são datas → campo `data_embarque`

### Níveis de confiança

| Nível | Confiança | O que significa |
|---|---|---|
| **Auto** (verde) | ≥ 90% | Sistema aplicou automaticamente — usuário pode aceitar sem revisar |
| **Confirmado** (amarelo) | 50–89% | Sistema tem boa ideia mas recomenda o usuário confirmar |
| **Ignorado** (cinza) | < 50% | Coluna não mapeada — usuário decide manualmente |

---

## Memória de Mapeamento

Quando o usuário confirma um mapeamento e marca **"Lembrar este mapeamento"**, o sistema salva essa configuração associada ao padrão de colunas do arquivo (um "fingerprint" das colunas).

**Na próxima vez** que um arquivo com as mesmas colunas for enviado (independente dos valores), o mapeamento salvo é aplicado automaticamente. Um badge **"Mapeamento salvo"** indica que a memória foi usada.

Isso é especialmente útil para operadores que recebem planilhas do mesmo fornecedor periodicamente.

---

## Pedidos Duplicados

Se um pedido com o mesmo número já existir no sistema, o usuário escolhe, linha a linha:

| Decisão | Efeito |
|---|---|
| **Sobrescrever** | Atualiza o pedido existente com os dados do arquivo |
| **Criar novo** | Cria um segundo pedido com o mesmo número (permitido para rastreabilidade) |
| **Pular** | A linha é ignorada — o pedido existente não é alterado |

A decisão é tomada por número de pedido, ou seja, todas as linhas do mesmo pedido seguem a mesma decisão.

---

## Validações por Linha

Cada linha é validada automaticamente antes do Preview:

| Campo | Regra | Gravidade |
|---|---|---|
| Número do pedido | Se ausente, gera automaticamente (`IMP-<timestamp>`) | Aviso |
| Part number | Campo recomendado para identificação do item | Aviso |
| Quantidade | Deve ser maior que zero | **Erro** (bloqueia linha) |
| Valor unitário | Não pode ser negativo (preview e confirmação) | **Erro** (bloqueia linha) |
| NCM | Deve ter exatamente 8 dígitos numéricos | Aviso |
| Data de embarque | Deve ser uma data válida | Aviso |

**Linhas com erro** ficam deselecionadas por padrão no Preview. O usuário pode forçar a inclusão, mas o erro é registrado.

---

## Pedidos Criados — Status Inicial

Todos os pedidos criados via importação recebem status **Rascunho**.

Isso garante que o operador revise e ajuste os dados importados antes de colocar o pedido em operação. Para ativar, basta alterar o status para **Aberto**.

---

## Reversão de Importação

Após a importação, o usuário pode reverter a operação clicando em **"Reverter esta importação"**.

- Reverte apenas pedidos com status **Rascunho** — pedidos já abertos não são afetados
- Marca os pedidos criados como **Cancelado** (soft delete — os registros continuam no banco para auditoria)
- A reversão inclui tanto pedidos **criados** quanto **atualizados** na importação

---

## Limite de Linhas

O sistema suporta arquivos de qualquer tamanho (até 10 MB), mas recomenda **até 1.000 linhas** por importação para melhor desempenho. Para arquivos maiores, uma faixa de aviso é exibida recomendando dividir em lotes.

---

## O que não é suportado

- PDFs escaneados (imagem) — não há texto extraível
- Arquivos HTML com extensão `.pdf`
- JSON que não seja um array de objetos
- Planilhas com dados em múltiplas linhas de cabeçalho
- Fórmulas Excel — apenas os valores calculados são lidos
