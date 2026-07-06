/** Gerado por scripts/gerar-manual-smart-read-catalogo-colunas.ts — não editar manualmente. */
export type ManualSmartReadColunaCatalogo = {
  ordem: number
  coluna: string
  descricao: string
  edicao: string
  fixa?: boolean
}

export type ManualSmartReadGrupoCatalogoColunas = {
  id: string
  titulo: string
  nivel: 'leitura' | 'documento'
  colunas: ManualSmartReadColunaCatalogo[]
}

export const TOTAL_COLUNAS_CATALOGO_SMART_READ = 260
export const TOTAL_COLUNAS_LEITURA_SMART_READ = 15
export const TOTAL_COLUNAS_DOCUMENTO_SMART_READ = 245

export const GRUPOS_CATALOGO_COLUNAS_SMART_READ: ManualSmartReadGrupoCatalogoColunas[] = [
  {
    "id": "leitura-metricas",
    "titulo": "Métricas da leitura",
    "nivel": "leitura",
    "colunas": [
      {
        "coluna": "Nome da leitura",
        "descricao": "Identificador da leitura; **link** que abre no passo atual (retomar).",
        "edicao": "Link",
        "fixa": true,
        "ordem": 1
      },
      {
        "coluna": "Tipo de documento",
        "descricao": "Tipos consolidados na leitura (ex.: Invoice, Bill of Lading, Packing List).",
        "edicao": "Não",
        "ordem": 2
      },
      {
        "coluna": "Nº documento",
        "descricao": "Números dos documentos vinculados à leitura.",
        "edicao": "Não",
        "ordem": 3
      },
      {
        "coluna": "Status",
        "descricao": "Pill com o status da leitura (Concluída, Em andamento, Erro, etc.).",
        "edicao": "Não",
        "ordem": 4
      },
      {
        "coluna": "Arquivos",
        "descricao": "Quantidade de arquivos anexados no envio.",
        "edicao": "Não",
        "ordem": 5
      },
      {
        "coluna": "Documentos",
        "descricao": "Quantidade de documentos extraídos pela IA.",
        "edicao": "Não",
        "ordem": 6
      },
      {
        "coluna": "Campos extraídos",
        "descricao": "Total de campos preenchidos pela IA na leitura.",
        "edicao": "Não",
        "ordem": 7
      },
      {
        "coluna": "Campos corretos",
        "descricao": "Campos **não** alterados na conferência.",
        "edicao": "Não",
        "ordem": 8
      },
      {
        "coluna": "Campos errados",
        "descricao": "Campos **editados** na conferência.",
        "edicao": "Não",
        "ordem": 9
      },
      {
        "coluna": "Média de acertos",
        "descricao": "Percentual de acerto da leitura.",
        "edicao": "Não",
        "ordem": 10
      },
      {
        "coluna": "Tempo extração (IA)",
        "descricao": "Duração do processamento da IA.",
        "edicao": "Não",
        "ordem": 11
      },
      {
        "coluna": "Tempo processo total",
        "descricao": "Cronômetro total do fluxo (envio até conclusão).",
        "edicao": "Não",
        "ordem": 12
      },
      {
        "coluna": "Saving (horas)",
        "descricao": "Tempo economizado vs. digitação manual.",
        "edicao": "Não",
        "ordem": 13
      },
      {
        "coluna": "Saving (valor)",
        "descricao": "Valor estimado da economia (BRL).",
        "edicao": "Não",
        "ordem": 14
      },
      {
        "coluna": "Data de envio",
        "descricao": "Data em que a leitura foi enviada.",
        "edicao": "Não",
        "ordem": 15
      }
    ]
  },
  {
    "id": "doc-campos-adicionais",
    "titulo": "Campos adicionais",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 1,
        "coluna": "Agente de Entrega",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 2,
        "coluna": "Assinado por",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 3,
        "coluna": "CNPJ Agente de Entrega",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 4,
        "coluna": "Código do Cliente",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 5,
        "coluna": "Contato Importador",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 6,
        "coluna": "Data de Vencimento",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 7,
        "coluna": "Dimensões",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 8,
        "coluna": "Email Agente de Entrega",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 9,
        "coluna": "Fabricante",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 10,
        "coluna": "Nota de Entrega",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 11,
        "coluna": "Número de Referência",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 12,
        "coluna": "Ordem de Trabalho",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 13,
        "coluna": "Outras Taxas",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 14,
        "coluna": "País de Aquisição",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 15,
        "coluna": "País de Procedência",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 16,
        "coluna": "Porto de Entrega",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 17,
        "coluna": "Subtotal",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 18,
        "coluna": "Total de Paletes",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 19,
        "coluna": "Vendedor Beneficiário",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-containers",
    "titulo": "Containers",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 20,
        "coluna": "Carga perigosa (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 21,
        "coluna": "Classe carga perigosa (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 22,
        "coluna": "Container Tare",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 23,
        "coluna": "Lacre (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 24,
        "coluna": "Número do container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 25,
        "coluna": "Números de container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 26,
        "coluna": "Peso bruto container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 27,
        "coluna": "Peso líquido container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 28,
        "coluna": "Quantidade embalagem (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 29,
        "coluna": "Tipo do container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 30,
        "coluna": "Tipo embalagem (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 31,
        "coluna": "Volume container (Containers)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      }
    ]
  },
  {
    "id": "doc-dados-bancarios",
    "titulo": "Dados bancários",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 32,
        "coluna": "Account Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 33,
        "coluna": "Beneficiary",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 34,
        "coluna": "Branch Code",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 35,
        "coluna": "Full Text",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 36,
        "coluna": "IBAN (Dados bancários)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 37,
        "coluna": "Nome do banco (Dados bancários)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 38,
        "coluna": "SWIFT (Dados bancários)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      }
    ]
  },
  {
    "id": "doc-documento",
    "titulo": "Documento",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 39,
        "coluna": "Data do documento (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 40,
        "coluna": "Data shipped on board (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 41,
        "coluna": "Documento assinado (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, Financial Document, INVOICE, PACKING LIST."
      },
      {
        "ordem": 42,
        "coluna": "Incoterm (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 43,
        "coluna": "Local incoterm (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 44,
        "coluna": "Número do BL (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 45,
        "coluna": "Número do BL master (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 46,
        "coluna": "Número do documento (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 47,
        "coluna": "País de aquisição (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 48,
        "coluna": "País de origem (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 49,
        "coluna": "País de procedência (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 50,
        "coluna": "Referência booking (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 51,
        "coluna": "Tipo do documento (Documento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-embarque",
    "titulo": "Embarque",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 52,
        "coluna": "Airport",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 53,
        "coluna": "Airport",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 54,
        "coluna": "Cargo Description",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 55,
        "coluna": "Destination",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 56,
        "coluna": "Estado destino (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 57,
        "coluna": "Frete (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 58,
        "coluna": "Local destino (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 59,
        "coluna": "Local origem (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 60,
        "coluna": "Location",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 61,
        "coluna": "Location",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 62,
        "coluna": "Marcas e números (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 63,
        "coluna": "Modal de transporte (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 64,
        "coluna": "Nome do navio (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE."
      },
      {
        "ordem": 65,
        "coluna": "Número da viagem (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 66,
        "coluna": "Origin",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 67,
        "coluna": "País origem embarque (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 68,
        "coluna": "Place",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 69,
        "coluna": "Place",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 70,
        "coluna": "Port",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 71,
        "coluna": "Port",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 72,
        "coluna": "Porto destino (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE."
      },
      {
        "ordem": 73,
        "coluna": "Porto origem (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE."
      },
      {
        "ordem": 74,
        "coluna": "Pre Carriage",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 75,
        "coluna": "Seguro (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 76,
        "coluna": "Tariff Class",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 77,
        "coluna": "Temperature",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 78,
        "coluna": "Total Cubed Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 79,
        "coluna": "Total Gross Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 80,
        "coluna": "Total Packages",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 81,
        "coluna": "Transportadora (Embarque)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 82,
        "coluna": "Vessel Name",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-exportador",
    "titulo": "Exportador",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 83,
        "coluna": "CEP / Código postal (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 84,
        "coluna": "Cidade (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 85,
        "coluna": "CNPJ / Tax ID (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 86,
        "coluna": "E-mail (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 87,
        "coluna": "Endereço (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 88,
        "coluna": "Estado / UF (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 89,
        "coluna": "Nome (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 90,
        "coluna": "País (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 91,
        "coluna": "Telefone (Exportador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-importador",
    "titulo": "Importador",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 92,
        "coluna": "CEP / Código postal (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 93,
        "coluna": "Cidade (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 94,
        "coluna": "CNPJ (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, PACKING LIST."
      },
      {
        "ordem": 95,
        "coluna": "CNPJ / Tax ID (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 96,
        "coluna": "E-mail (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 97,
        "coluna": "Endereço (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 98,
        "coluna": "Estado / UF (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 99,
        "coluna": "Nome (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 100,
        "coluna": "País (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      },
      {
        "ordem": 101,
        "coluna": "Telefone (Importador)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-itens",
    "titulo": "Itens",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 102,
        "coluna": "Additional Information",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 103,
        "coluna": "Dimensions",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 104,
        "coluna": "English",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 105,
        "coluna": "Gross",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 106,
        "coluna": "HS Code (Itens)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 107,
        "coluna": "Item Currency",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 108,
        "coluna": "Item Quantity",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 109,
        "coluna": "Item Total Price With Currency",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 110,
        "coluna": "Item Unit Price With Currency",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 111,
        "coluna": "Manufacturer",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 112,
        "coluna": "NCM (Itens)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 113,
        "coluna": "Net",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 114,
        "coluna": "Origin Country",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 115,
        "coluna": "Package Type",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 116,
        "coluna": "Part Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 117,
        "coluna": "Po Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 118,
        "coluna": "Portuguese",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 119,
        "coluna": "Product Description",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 120,
        "coluna": "Quantity",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 121,
        "coluna": "Size",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 122,
        "coluna": "Total Cubic Measurement",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 123,
        "coluna": "Total Product Quantity",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 124,
        "coluna": "Total Tare Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 125,
        "coluna": "Type",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 126,
        "coluna": "Unit",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 127,
        "coluna": "Unit Gross Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 128,
        "coluna": "Unit Net Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      },
      {
        "ordem": 129,
        "coluna": "Unit Quantity",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-mercadorias",
    "titulo": "Mercadorias",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 130,
        "coluna": "Descrição BL (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 131,
        "coluna": "Descrição item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 132,
        "coluna": "HS Code (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 133,
        "coluna": "Invoice item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 134,
        "coluna": "NCM (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 135,
        "coluna": "Ncm List[]",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 136,
        "coluna": "Peso bruto item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 137,
        "coluna": "Peso bruto total (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 138,
        "coluna": "Peso líquido item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 139,
        "coluna": "Peso líquido total (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 140,
        "coluna": "Qtd embalagem (resumo) (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 141,
        "coluna": "Quantidade item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 142,
        "coluna": "Shipper item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 143,
        "coluna": "Tipo embalagem (resumo) (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 144,
        "coluna": "Total de volumes (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 145,
        "coluna": "Unidade cubagem (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 146,
        "coluna": "Unidade de volume (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 147,
        "coluna": "Volume item (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 148,
        "coluna": "Volume total (Mercadorias)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      }
    ]
  },
  {
    "id": "doc-moeda",
    "titulo": "Moeda",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 149,
        "coluna": "Moeda (Moeda)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 150,
        "coluna": "Taxa de câmbio (Moeda)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      }
    ]
  },
  {
    "id": "doc-notify-party",
    "titulo": "Notify party",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 151,
        "coluna": "CEP / Código postal (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 152,
        "coluna": "Cidade (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 153,
        "coluna": "CNPJ (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 154,
        "coluna": "E-mail (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 155,
        "coluna": "Endereço (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 156,
        "coluna": "Estado / UF (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 157,
        "coluna": "Nome (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 158,
        "coluna": "País (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 159,
        "coluna": "Telefone (Notify party)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      }
    ]
  },
  {
    "id": "doc-observacoes",
    "titulo": "Observações",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 160,
        "coluna": "Observações (Observações)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB, BL, INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-outros",
    "titulo": "Outros",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 161,
        "coluna": "Abatimentos",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 162,
        "coluna": "Accounting Info",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 163,
        "coluna": "AcréScimos",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 164,
        "coluna": "AgêNcia E CóDigo Do BeneficiáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 165,
        "coluna": "Awb Date",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 166,
        "coluna": "Basic Value",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 167,
        "coluna": "BeneficiáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 168,
        "coluna": "Carteira",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 169,
        "coluna": "Clause",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 170,
        "coluna": "Cliente",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 171,
        "coluna": "CNPJ Do BeneficiáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 172,
        "coluna": "CNPJ Do Cliente",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 173,
        "coluna": "Currency",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 174,
        "coluna": "Customs Value",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 175,
        "coluna": "Data De Vencimento",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 176,
        "coluna": "Descontos",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 177,
        "coluna": "DestinatáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 178,
        "coluna": "Destination Airport",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 179,
        "coluna": "Discounts Or Additions",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 180,
        "coluna": "EmissãO",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 181,
        "coluna": "EmissãO",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 182,
        "coluna": "EndereçO Do BeneficiáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 183,
        "coluna": "EndereçO Do Cliente",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 184,
        "coluna": "Fatura",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 185,
        "coluna": "Filial",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 186,
        "coluna": "Flight Date",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 187,
        "coluna": "Flight Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 188,
        "coluna": "Handling Information",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 189,
        "coluna": "Has Wood",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 190,
        "coluna": "Hawb Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 191,
        "coluna": "Iata Code",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 192,
        "coluna": "InstruçõEs De Responsabilidade Do BeneficiáRio",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 193,
        "coluna": "Is Treated Certified",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 194,
        "coluna": "Items Quantity",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 195,
        "coluna": "Linha DigitáVel",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 196,
        "coluna": "Mawb Number",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 197,
        "coluna": "Moeda",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 198,
        "coluna": "Moeda",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 199,
        "coluna": "Nome (Outros)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 200,
        "coluna": "Nome Da Taxa",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 201,
        "coluna": "Nosso NúMero",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 202,
        "coluna": "NúMero",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 203,
        "coluna": "NúMero Controle",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 204,
        "coluna": "NúMero Do Documento",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 205,
        "coluna": "NúMero NF",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 206,
        "coluna": "Origin Airport",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 207,
        "coluna": "Other Charges",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 208,
        "coluna": "Parcela",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 209,
        "coluna": "Payment Terms",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 210,
        "coluna": "Peso",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 211,
        "coluna": "Remetente",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 212,
        "coluna": "SéRie",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 213,
        "coluna": "Shipped On Board Date",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 214,
        "coluna": "Tipo",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 215,
        "coluna": "Total Document Value",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 216,
        "coluna": "Total Value",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 217,
        "coluna": "Transport Value",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 218,
        "coluna": "Valor",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      },
      {
        "ordem": 219,
        "coluna": "Valor",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 220,
        "coluna": "Valor Bruto",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 221,
        "coluna": "Valor Da Parcela",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 222,
        "coluna": "Valor LíQuido",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 223,
        "coluna": "Valor NF",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: Financial Document."
      },
      {
        "ordem": 224,
        "coluna": "Wood Description",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      }
    ]
  },
  {
    "id": "doc-pagamento",
    "titulo": "Pagamento",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 225,
        "coluna": "Condição de pagamento (Pagamento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      },
      {
        "ordem": 226,
        "coluna": "Método de pagamento (Pagamento)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE."
      }
    ]
  },
  {
    "id": "doc-resumo-volumes",
    "titulo": "Resumo volumes",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 227,
        "coluna": "Peso bruto total (Resumo volumes)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 228,
        "coluna": "Peso líquido total (Resumo volumes)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 229,
        "coluna": "Total Cubic Measurement",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 230,
        "coluna": "Total de volumes (Resumo volumes)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 231,
        "coluna": "Total Tare Weight",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      },
      {
        "ordem": 232,
        "coluna": "Unidade comercial (Resumo volumes)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: INVOICE, PACKING LIST."
      }
    ]
  },
  {
    "id": "doc-taxas",
    "titulo": "Taxas",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 233,
        "coluna": "Agent Other Charges",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 234,
        "coluna": "Airline Other Charges",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 235,
        "coluna": "Basic Freight Amount",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 236,
        "coluna": "Currency",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 237,
        "coluna": "Currency Conversion Rates",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 238,
        "coluna": "Declared Value Fee",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 239,
        "coluna": "Destination Charges",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 240,
        "coluna": "Freight Tax",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 241,
        "coluna": "Payment Type",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 242,
        "coluna": "Rate",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 243,
        "coluna": "Total Amount To Collect",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      },
      {
        "ordem": 244,
        "coluna": "Total Freight Amount",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: AWB."
      }
    ]
  },
  {
    "id": "doc-transportadora",
    "titulo": "Transportadora",
    "nivel": "documento",
    "colunas": [
      {
        "ordem": 245,
        "coluna": "Nome (Transportadora)",
        "edicao": "Não",
        "descricao": "Campo extraído pela IA na linha filha (documento). Tipos: BL."
      }
    ]
  }
] as ManualSmartReadGrupoCatalogoColunas[]
