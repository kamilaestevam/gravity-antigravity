# Anexos e Gerar PDF — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026

---

## Anexos

### O que é
Upload de arquivos vinculados a um pedido ou item. O usuário escolhe o nível (pedido ou item).

### Formatos aceitos
PDF, DOCX, DOC, XLSX, XLS, CSV, PNG, JPG, JPEG, TIFF, GIF, ZIP, RAR, TXT, XML, JSON

### Limites (SLA)
| Limite | Valor |
|---|---|
| Tamanho máximo por arquivo | 25 MB |
| Total de anexos por pedido | 200 MB |
| Quantidade de arquivos por pedido | 50 arquivos |

### Vínculo
- Usuário escolhe ao fazer upload: **Pedido** ou **Item**
- Um arquivo é vinculado a um único nível — não é compartilhado entre pedido e item

### Campos do anexo
- `nome_arquivo` — nome original do arquivo
- `tipo_arquivo` — extensão / MIME type
- `tamanho_bytes`
- `descricao` — campo livre opcional (ex: "Invoice Final", "BL Corrigido")
- `categoria` — opcional, configurável pelo tenant (ex: Invoice, Packing List, BL, Certificado, Outros)
- `vinculo` — `pedido` ou `item`
- `vinculo_id` — id do pedido ou item
- `uploaded_by`, `uploaded_at`

### Ações disponíveis
- **Upload** — drag-and-drop ou clique
- **Download** — baixar o arquivo original
- **Preview** — visualizar inline (PDF e imagens)
- **Renomear** — editar descrição/nome
- **Excluir** — remove com permissão

### Permissões
- Upload: permissão configurável
- Download: permissão configurável (pode ser diferente de upload)
- Excluir: só quem fez upload ou admin do tenant

---

## Gerar Pedido (PDF com Templates)

### O que é
Geração de PDF do pedido usando templates configurados no Configurador. O usuário escolhe o template e baixa o PDF — que também é salvo como anexo no pedido.

### Templates
- Criados e gerenciados no **Configurador** (tela de workspace)
- Múltiplos templates por tenant (ex: Template PO, Template SO, Template Proforma)
- Template usa **variáveis** (`{{numero_pedido}}`, `{{exportador}}`, etc.)
- O sistema sugere variáveis disponíveis; usuário pode também usar variáveis próprias
- Template pode incluir tabela de itens com loop automático

### Variáveis disponíveis (sugeridas pelo sistema)
| Variável | Campo |
|---|---|
| `{{numero_pedido}}` | Número do pedido |
| `{{tipo_operacao}}` | Importação / Exportação |
| `{{exportador}}` | Nome do exportador |
| `{{fabricante}}` | Nome do fabricante |
| `{{incoterm}}` | Incoterm |
| `{{moeda}}` | Moeda |
| `{{data_emissao}}` | Data de emissão |
| `{{valor_total}}` | Valor total do pedido |
| `{{quantidade_total}}` | Quantidade total |
| `{{tenant_nome}}` | Nome da empresa |
| `{{data_geracao}}` | Data de geração do PDF |
| Colunas do usuário | `{{coluna_nome_da_coluna}}` |
| Loop de itens | `{{#itens}} ... {{/itens}}` |
| Dentro do loop | `{{item.part_number}}`, `{{item.descricao}}`, `{{item.quantidade}}`, etc. |

### Fluxo
1. Usuário abre pedido (drawer ou visualização)
2. Clica em "Gerar PDF"
3. Modal com lista de templates disponíveis
4. Seleciona template → preview do PDF gerado
5. Confirma → PDF é baixado E salvo como anexo no pedido automaticamente
6. Anexo salvo com categoria "PDF Gerado" e nome `{template}_{numero_pedido}_{data}.pdf`

### Restrições
- Template sem variáveis obrigatórias gera PDF com campos em branco (não bloqueia)
- Pedido sem itens: bloco de loop de itens fica vazio
- PDF gerado é somente leitura — não pode ser editado no sistema
