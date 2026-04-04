# Anexos e Gerar PDF — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Abril 2026

---

## Stack adicional

| Lib | Uso |
|---|---|
| `multer` | Upload multipart no Express |
| `puppeteer` ou `@react-pdf/renderer` | Geração de PDF |
| `handlebars` | Engine de templates com variáveis `{{campo}}` e loop `{{#itens}}` |
| `sharp` (opcional) | Resize de imagens para preview |

---

## Estrutura de Arquivos

```
produto/pedido/
├── client/src/
│   ├── components/
│   │   ├── PainelAnexos.tsx           ← Componente de anexos (usado no Drawer)
│   │   ├── PainelAnexos.css
│   │   ├── ModalGerarPdf.tsx          ← Modal seleção de template + preview
│   │   └── ModalGerarPdf.css
│   └── shared/
│       ├── types.ts                   ← Tipos de Anexo, Template, PDF
│       └── api.ts                     ← anexosApi, pdfApi
└── server/src/
    ├── routes/
    │   ├── anexos.ts                  ← Upload/download/delete
    │   └── pdf.ts                     ← Gerar PDF
    └── services/
        ├── anexosService.ts
        └── pdfService.ts              ← Renderiza template + gera PDF
```

---

## Tipos

```ts
// ── Anexos ────────────────────────────────────────────
export interface Anexo {
  id: string
  tenant_id: string
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  nome_arquivo: string
  tipo_arquivo: string          // MIME type
  tamanho_bytes: number
  descricao?: string
  categoria?: string
  storage_key: string           // path interno no storage
  uploaded_by: string
  uploaded_at: string
}

export interface AnexoUploadResultado {
  id: string
  nome_arquivo: string
  tamanho_bytes: number
  url_download: string
}

// ── PDF ───────────────────────────────────────────────
export interface TemplatePdf {
  id: string
  tenant_id: string
  nome: string
  descricao?: string
  conteudo_html: string         // HTML com variáveis Handlebars
  created_at: string
  updated_at: string
}

export interface GerarPdfPayload {
  pedido_id: string
  template_id: string
  salvar_como_anexo: boolean    // sempre true conforme regra
}

export interface GerarPdfResultado {
  url_download: string
  anexo_id: string              // ID do anexo salvo
}
```

---

## API Client

```ts
export const anexosApi = {
  listar: (vinculo: 'pedido' | 'item', vinculo_id: string) =>
    request<Anexo[]>(`/api/v1/pedidos/anexos?vinculo=${vinculo}&vinculo_id=${vinculo_id}`),

  upload: (vinculo: 'pedido' | 'item', vinculo_id: string, arquivo: File, descricao?: string, categoria?: string) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('vinculo', vinculo)
    form.append('vinculo_id', vinculo_id)
    if (descricao) form.append('descricao', descricao)
    if (categoria) form.append('categoria', categoria)
    return request<AnexoUploadResultado>('/api/v1/pedidos/anexos', { method: 'POST', body: form })
  },

  download: (id: string) =>
    request<Blob>(`/api/v1/pedidos/anexos/${id}/download`),

  excluir: (id: string) =>
    request<void>(`/api/v1/pedidos/anexos/${id}`, { method: 'DELETE' }),
}

export const pdfApi = {
  listarTemplates: () =>
    request<TemplatePdf[]>('/api/v1/pedidos/pdf/templates'),

  gerar: (payload: GerarPdfPayload) =>
    request<GerarPdfResultado>('/api/v1/pedidos/pdf/gerar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
```

---

## Backend — Rotas

### `POST /api/v1/pedidos/anexos` (multipart/form-data)

```
1. multer valida: extensão permitida, tamanho ≤ 25MB
2. Verificar total de anexos do pedido ≤ 50 e total bytes ≤ 200MB
3. Salvar arquivo em storage local (dev) ou S3 (prod): path = tenant_id/pedido_id/uuid_filename
4. Criar registro Anexo no banco com tenant_id
5. Registrar audit trail
6. Retornar AnexoUploadResultado
```

### `GET /api/v1/pedidos/anexos`
Query params: `vinculo`, `vinculo_id` — filtra por pedido ou item com `tenant_id`

### `GET /api/v1/pedidos/anexos/:id/download`
Serve o arquivo com header `Content-Disposition: attachment`

### `DELETE /api/v1/pedidos/anexos/:id`
Verifica permissão (uploaded_by = user OU admin), remove do storage e do banco

### `GET /api/v1/pedidos/pdf/templates`
Lista templates do tenant — proxy para o Configurador ou tabela local

### `POST /api/v1/pedidos/pdf/gerar`

```ts
const GerarPdfSchema = z.object({
  pedido_id: z.string().uuid(),
  template_id: z.string().uuid(),
  salvar_como_anexo: z.boolean().default(true),
})
```

```
1. Buscar pedido + itens + colunas do usuário com tenant_id
2. Buscar template pelo template_id (com tenant_id)
3. Compilar variáveis: { numero_pedido, exportador, ..., itens: [...] }
4. Renderizar Handlebars: template.conteudo_html + variáveis → HTML final
5. Gerar PDF via Puppeteer (html → pdf buffer)
6. Nome do arquivo: `{template.nome}_{numero_pedido}_{YYYY-MM-DD}.pdf`
7. Salvar PDF no storage
8. Criar Anexo no banco com categoria = 'PDF Gerado'
9. Retornar GerarPdfResultado com url_download e anexo_id
```

---

## Fragment Prisma

```prisma
model Anexo {
  id            String   @id @default(cuid())
  tenant_id     String
  product_id    String?
  vinculo       String              // 'pedido' | 'item'
  vinculo_id    String
  nome_arquivo  String
  tipo_arquivo  String
  tamanho_bytes Int
  descricao     String?
  categoria     String?
  storage_key   String
  uploaded_by   String
  created_at    DateTime @default(now())

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, vinculo_id])
  @@map("pedido_anexos")
}

model TemplatePdf {
  id            String   @id @default(cuid())
  tenant_id     String
  product_id    String?
  nome          String
  descricao     String?
  conteudo_html String   @db.Text
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@map("pedido_templates_pdf")
}
```

---

## Frontend — PainelAnexos.tsx

Componente usado dentro do DrawerPedido e também na view de item:

```
┌─────────────────────────────────────┐
│  Anexos (3)           [+ Adicionar] │
├─────────────────────────────────────┤
│  📄 Invoice_Final.pdf    2.3MB  [↓][🗑] │
│  📊 Packing_List.xlsx    1.1MB  [↓][🗑] │
│  🖼 BL_scan.jpg          4.7MB  [↓][🗑] │
└─────────────────────────────────────┘
```

- Drag-and-drop para upload
- Ícone por tipo de arquivo
- Download inline
- Preview para PDF e imagens
- Barra de progresso durante upload

---

## Frontend — ModalGerarPdf.tsx

```
┌──────────────────────────────────────┐
│  Gerar PDF — PO-2026/001             │
├──────────────────────────────────────┤
│  Template:                           │
│  ○ Template PO Padrão               │
│  ○ Template Proforma Invoice        │
│  ● Template PO Detalhado            │
│                                      │
│  Preview:                            │
│  ┌──────────────────────────────┐   │
│  │  [miniatura do PDF]          │   │
│  └──────────────────────────────┘   │
│                                      │
│  ✓ Salvar como anexo no pedido       │
│                                      │
│   [Cancelar]    [Baixar PDF]         │
└──────────────────────────────────────┘
```
