/**
 * matriz-validacao-certificado-fitossanitario-smart-read.ts — SSOT Matriz CF (CFI/CFR) v1.0
 *
 * Certificado Fitossanitário Internacional (NIMF 12). Consequência grave: retenção, tratamento
 * quarentenário, reexportação ou destruição do envio — não apenas multa.
 * Base: NIMF 12/7 · CIPV/FAO · IN MAPA 71/2018 · IN SDA 12/2018 · Portaria MAPA 177/2021 · LPCO.
 */

export type SecaoMatrizCertificadoFitossanitario =
  | 'aplicabilidade_tipo'
  | 'emissor_legitimidade'
  | 'identificacao_datas'
  | 'descricao_envio'
  | 'origem_tratamento'
  | 'embalagem_conteudo'
  | 'processo_mapa_lpco'
  | 'regras_praga_produto'
  | 'legitimidade_risco'

export type MotorValidacaoCertificadoFitossanitario =
  | 'codigo'
  | 'api'
  | 'llm'
  | 'rag'
  | 'cross_doc'
  | 'codigo_rag'
  | 'cross_doc_rag'
  | 'api_llm'
  | 'lpco'

export type SeveridadeMatrizCertificadoFitossanitario = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizCertificadoFitossanitario = {
  id: string
  secao: SecaoMatrizCertificadoFitossanitario
  item: string
  motor: MotorValidacaoCertificadoFitossanitario
  severidade: SeveridadeMatrizCertificadoFitossanitario
  gate_condicional?: boolean
  descricao: string
  tooltip_conferencia: string
  base_normativa: string
}

export const ORDEM_SECOES_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly SecaoMatrizCertificadoFitossanitario[] = [
  'aplicabilidade_tipo',
  'emissor_legitimidade',
  'identificacao_datas',
  'descricao_envio',
  'origem_tratamento',
  'embalagem_conteudo',
  'processo_mapa_lpco',
  'regras_praga_produto',
  'legitimidade_risco',
] as const

export const ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO: Record<SecaoMatrizCertificadoFitossanitario, string> = {
  aplicabilidade_tipo: '1 — Aplicabilidade, tipo e enquadramento',
  emissor_legitimidade: '2 — Emissor (ONPF) e legitimidade',
  identificacao_datas: '3 — Identificação, datas e validade',
  descricao_envio: '4 — Descrição do envio e correspondência',
  origem_tratamento: '5 — Origem, tratamento e declarações adicionais',
  embalagem_conteudo: '6 — Embalagem de madeira e conteúdo proibido',
  processo_mapa_lpco: '7 — Coerência com processo, MAPA e LPCO',
  regras_praga_produto: '8 — Regras específicas por praga/produto',
  legitimidade_risco: '9 — Legitimidade e risco fitossanitário',
}

export const ROTULO_SEVERIDADE_MATRIZ_CERTIFICADO_FITOSSANITARIO: Record<Exclude<SeveridadeMatrizCertificadoFitossanitario, null>, string> = {
  bloq: 'BLOQ', alerta: 'ALERTA', info: 'INFO', cond: 'COND',
}

export const MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO: RegraMatrizCertificadoFitossanitario[] = [
  // ── 1 — Aplicabilidade, tipo e enquadramento ──
  {
    id: 'CF1-01',
    secao: 'aplicabilidade_tipo',
    item: 'Exigibilidade fitossanitária (categoria de risco)',
    motor: 'cross_doc_rag',
    severidade: "bloq",
    descricao: 'Determinar pela NCM/produto se o envio é artigo regulamentado e categoria de risco 0–5; Categoria 0 dispensada',
    tooltip_conferencia: 'Define se o produto exige certificado fitossanitário e sua categoria de risco',
    base_normativa: 'IN SDA 12/2018; RFI/MAPA',
  },
  {
    id: 'CF1-02',
    secao: 'aplicabilidade_tipo',
    item: 'Produto na PVIA (importação autorizada)',
    motor: 'rag',
    severidade: "bloq",
    descricao: 'Verificar se vegetal/origem consta na PVIA; fora da PVIA não tem importação autorizada',
    tooltip_conferencia: 'Verifica se o produto e a origem estão autorizados a importar (PVIA)',
    base_normativa: 'PVIA/MAPA',
  },
  {
    id: 'CF1-03',
    secao: 'aplicabilidade_tipo',
    item: 'Permissão de Importação / RFI',
    motor: 'lpco',
    severidade: "bloq",
    descricao: 'PI ou Autorização Fitossanitária válida e RFI aplicáveis; CFI deve atender aos RFI',
    tooltip_conferencia: 'Confere a Permissão de Importação e os requisitos fitossanitários aplicáveis',
    base_normativa: 'IN SDA 12/2018; RFI; LPCO Portal Único',
  },
  {
    id: 'CF1-04',
    secao: 'aplicabilidade_tipo',
    item: 'Tipo: CFI × CFR (reexportação)',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Classificar CFI ou CFR; CFR deve vir com cópia autenticada do CF de origem',
    tooltip_conferencia: 'Identifica certificado de origem ou reexportação (CFR exige CF de origem anexo)',
    base_normativa: 'NIMF 12; IN MAPA 71/2018 arts. 10–13',
  },
  {
    id: 'CF1-05',
    secao: 'aplicabilidade_tipo',
    item: 'Modelo NIMF 12',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Documento no modelo NIMF 12 (Phytosanitary Certificate, campos padronizados)',
    tooltip_conferencia: 'Verifica se o certificado segue o modelo oficial da NIMF 12',
    base_normativa: 'NIMF 12; NIMF 7',
  },
  {
    id: 'CF1-06',
    secao: 'aplicabilidade_tipo',
    item: 'Formato: físico × eletrônico (ePhyto)',
    motor: 'llm',
    severidade: "info",
    descricao: 'Detectar CFI físico ou eletrônico (ePhyto/IPPC ePhyto Hub)',
    tooltip_conferencia: 'Identifica se o certificado é físico ou eletrônico (ePhyto)',
    base_normativa: 'IN MAPA 71/2018 art. 28; ePhyto CIPV',
  },
  // ── 2 — Emissor (ONPF) e legitimidade ──
  {
    id: 'CF2-01',
    secao: 'emissor_legitimidade',
    item: 'ONPF emissora do país de origem',
    motor: 'rag',
    severidade: "bloq",
    descricao: 'Emitido pela ONPF oficial do país de origem (não entidade privada); signatária CIPV',
    tooltip_conferencia: 'Verifica se o emissor é a ONPF oficial do país de origem',
    base_normativa: 'CIPV/FAO; NIMF 7',
  },
  {
    id: 'CF2-02',
    secao: 'emissor_legitimidade',
    item: 'Assinatura do funcionário autorizado',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Assinatura autógrafa ou digital de funcionário autorizado da ONPF',
    tooltip_conferencia: 'Verifica a assinatura do funcionário autorizado da ONPF',
    base_normativa: 'NIMF 12; IN MAPA 71/2018',
  },
  {
    id: 'CF2-03',
    secao: 'emissor_legitimidade',
    item: 'Carimbo/selo oficial',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Carimbo ou selo oficial da ONPF emissora',
    tooltip_conferencia: 'Verifica o carimbo/selo oficial da organização emissora',
    base_normativa: 'NIMF 12; NIMF 7',
  },
  {
    id: 'CF2-04',
    secao: 'emissor_legitimidade',
    item: 'Sem alterações não autorizadas',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Sem rasuras, emendas ou apagamentos — modelo NIMF 12 veda alterações',
    tooltip_conferencia: 'Detecta rasuras ou alterações que invalidam o certificado',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF2-05',
    secao: 'emissor_legitimidade',
    item: 'Indícios de falsificação',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Sinais de falsificação (fonte, layout, numeração inconsistente)',
    tooltip_conferencia: 'Sinaliza indícios de falsificação do certificado',
    base_normativa: 'IN MAPA 71/2018 art. 30; DL 1.455/76',
  },
  // ── 3 — Identificação, datas e validade ──
  {
    id: 'CF3-01',
    secao: 'identificacao_datas',
    item: 'Número do certificado',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Nº único do certificado presente',
    tooltip_conferencia: 'Confere o número único do certificado',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF3-02',
    secao: 'identificacao_datas',
    item: 'Data de emissão',
    motor: 'codigo',
    severidade: "alerta",
    descricao: 'Presente; alertar se futura; validade fitossanitária curta conforme RFI',
    tooltip_conferencia: 'Valida a data de emissão e alerta prazos curtos',
    base_normativa: 'NIMF 12; RFI',
  },
  {
    id: 'CF3-03',
    secao: 'identificacao_datas',
    item: 'País de origem / exportação',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'País de origem casa com invoice (S3-05) e CO (CO2-04); ONPF emissora coerente',
    tooltip_conferencia: 'Confere o país de origem contra invoice/CO e a ONPF emissora',
    base_normativa: 'NIMF 12; NIMF 7',
  },
  {
    id: 'CF3-04',
    secao: 'identificacao_datas',
    item: 'Órgão de destino declarado',
    motor: 'llm',
    severidade: "info",
    descricao: 'ONPF do Brasil indicada no campo próprio',
    tooltip_conferencia: 'Verifica a indicação da ONPF de destino (Brasil)',
    base_normativa: 'NIMF 12',
  },
  // ── 4 — Descrição do envio e correspondência ──
  {
    id: 'CF4-01',
    secao: 'descricao_envio',
    item: 'Nome botânico (gênero + espécie)',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Nome científico binomial (ex.: Glycine max), não apenas nome comum',
    tooltip_conferencia: 'Exige o nome científico do vegetal, não só o nome comum',
    base_normativa: 'NIMF 12; NIMF 5',
  },
  {
    id: 'CF4-02',
    secao: 'descricao_envio',
    item: 'Descrição × invoice/PL',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'Descrição coerente com invoice (S4-02) e PL (P6-01)',
    tooltip_conferencia: 'Confere a descrição do certificado contra invoice e packing list',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF4-03',
    secao: 'descricao_envio',
    item: 'Quantidade e unidade',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Quantidade coerente com invoice/PL; não amparar mais que embarcado',
    tooltip_conferencia: 'Confere a quantidade contra invoice e packing list',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF4-04',
    secao: 'descricao_envio',
    item: 'Tipo e nº de volumes / embalagem',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Volumes coerentes com PL (P4-01) e BL/AWB',
    tooltip_conferencia: 'Confere volumes e embalagem contra PL e conhecimento',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF4-05',
    secao: 'descricao_envio',
    item: 'Marcas distintivas',
    motor: 'llm',
    severidade: "info",
    descricao: 'Marcas de identificação coerentes com PL (P4-04)',
    tooltip_conferencia: 'Confere marcas distintivas contra o packing list',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF4-06',
    secao: 'descricao_envio',
    item: 'Meio de transporte e rota',
    motor: 'cross_doc',
    severidade: "info",
    descricao: 'Meio de transporte coerente com BL/AWB e ponto de entrada',
    tooltip_conferencia: 'Confere transporte e ponto de entrada contra o conhecimento',
    base_normativa: 'NIMF 12',
  },
  // ── 5 — Origem, tratamento e declarações adicionais ──
  {
    id: 'CF5-01',
    secao: 'origem_tratamento',
    item: 'Local de produção / origem',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Local de origem declarado; base para área livre de praga',
    tooltip_conferencia: 'Confere o local de produção/origem declarado',
    base_normativa: 'NIMF 12; NIMF 4',
  },
  {
    id: 'CF5-02',
    secao: 'origem_tratamento',
    item: 'Declaração adicional (Additional Declaration)',
    motor: 'rag',
    severidade: "bloq",
    descricao: 'Campo Declaração Adicional com texto exato exigido pelo RFI quando aplicável',
    tooltip_conferencia: 'Verifica a Declaração Adicional exigida pelo requisito fitossanitário',
    base_normativa: 'NIMF 12; IN MAPA 71/2018 arts. 8–9; RFI',
  },
  {
    id: 'CF5-03',
    secao: 'origem_tratamento',
    item: 'Tratamento fitossanitário — dados',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Quando há tratamento: tipo, ingrediente, dose, duração, temperatura e data',
    tooltip_conferencia: 'Verifica os dados do tratamento fitossanitário quando exigido',
    base_normativa: 'NIMF 12; Portaria MAPA 177/2021',
  },
  {
    id: 'CF5-04',
    secao: 'origem_tratamento',
    item: 'Coerência tratamento × praga/RFI',
    motor: 'rag',
    severidade: "alerta",
    descricao: 'Tratamento declarado eficaz e adequado à praga-alvo e ao RFI',
    tooltip_conferencia: 'Avalia se o tratamento é adequado à praga e ao requisito',
    base_normativa: 'Portaria MAPA 177/2021; RFI',
  },
  {
    id: 'CF5-05',
    secao: 'origem_tratamento',
    item: 'Empresa/tratamento credenciado',
    motor: 'api_llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Coerência com credenciamento reconhecido quando aplicável',
    tooltip_conferencia: 'Verifica a credencial do tratamento quando aplicável',
    base_normativa: 'Portaria MAPA 177/2021',
  },
  {
    id: 'CF5-06',
    secao: 'origem_tratamento',
    item: 'Análise laboratorial (quando exigida)',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Referência ao laudo laboratorial quando exigido pelo RFI',
    tooltip_conferencia: 'Verifica a referência a laudo laboratorial quando exigido',
    base_normativa: 'IN MAPA 71/2018',
  },
  {
    id: 'CF5-07',
    secao: 'origem_tratamento',
    item: 'Informação Fitossanitária Oficial Adicional (CFR)',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Em CFR: Informação Fitossanitária Oficial Adicional com país de origem',
    tooltip_conferencia: 'Verifica a informação oficial adicional exigida na reexportação',
    base_normativa: 'IN MAPA 71/2018',
  },
  // ── 6 — Embalagem de madeira e conteúdo proibido ──
  {
    id: 'CF6-01',
    secao: 'embalagem_conteudo',
    item: 'Embalagem de madeira (NIMF 15)',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Coerência com invoice (S7-03), PL (P8-01) e BL/AWB; madeira exige marca IPPC',
    tooltip_conferencia: 'Cruza embalagem de madeira com demais documentos (NIMF 15)',
    base_normativa: 'NIMF 15; Portaria MAPA 514/2022',
  },
  {
    id: 'CF6-02',
    secao: 'embalagem_conteudo',
    item: 'Sem referências vedadas',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'CF não pode conter referências comerciais, saúde, qualidade, transgenia',
    tooltip_conferencia: 'Detecta referências vedadas no certificado',
    base_normativa: 'IN MAPA 71/2018 art. 29',
  },
  {
    id: 'CF6-03',
    secao: 'embalagem_conteudo',
    item: 'Escopo estritamente fitossanitário',
    motor: 'llm',
    severidade: "info",
    descricao: 'Certificado atesta apenas condição fitossanitária',
    tooltip_conferencia: 'Confirma que o certificado é estritamente fitossanitário',
    base_normativa: 'NIMF 12',
  },
  // ── 7 — Coerência com processo, MAPA e LPCO ──
  {
    id: 'CF7-01',
    secao: 'processo_mapa_lpco',
    item: 'Carregado no LPCO',
    motor: 'lpco',
    severidade: "alerta",
    descricao: 'Certificado anexado ao LPCO adequado no Portal Único',
    tooltip_conferencia: 'Verifica se o certificado está no LPCO do Portal Único',
    base_normativa: 'Manual LPCO; anuência MAPA',
  },
  {
    id: 'CF7-02',
    secao: 'processo_mapa_lpco',
    item: 'Vínculo CF × DUIMP / adição',
    motor: 'cross_doc',
    severidade: "bloq",
    descricao: 'CF deve amparar produto/adição da DUIMP; NCM e produto = certificado',
    tooltip_conferencia: 'Confere o vínculo do certificado com a adição da DUIMP',
    base_normativa: 'RA art. 553; anuência MAPA',
  },
  {
    id: 'CF7-03',
    secao: 'processo_mapa_lpco',
    item: 'Ponto de entrada e VIGIAGRO competente',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Ponto de entrada atendido por Unidade VIGIAGRO',
    tooltip_conferencia: 'Confere o ponto de entrada e a unidade VIGIAGRO competente',
    base_normativa: 'IN MAPA 71/2018 art. 14; IN SDA 12/2018',
  },
  {
    id: 'CF7-04',
    secao: 'processo_mapa_lpco',
    item: 'Inspeção / interceptação de praga',
    motor: 'llm',
    severidade: "bloq",
    descricao: 'Conformidade documental não afasta inspeção física; interceptação → tratamento/reexportação/destruição',
    tooltip_conferencia: 'Alerta que inspeção física pode prescrever medida fitossanitária',
    base_normativa: 'Portaria MAPA 177/2021; IN SDA 12/2018',
  },
  {
    id: 'CF7-05',
    secao: 'processo_mapa_lpco',
    item: 'Coerência global do dossiê',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Parecer único: CF × invoice × PL × BL/AWB × CO consistentes',
    tooltip_conferencia: 'Consolida a coerência do certificado com os demais documentos',
    base_normativa: 'RA art. 553; NIMF 12',
  },
  // ── 8 — Regras específicas por praga/produto ──
  {
    id: 'CF8-01',
    secao: 'regras_praga_produto',
    item: 'Praga quarentenária ausente',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Declaração de ausência de praga quarentenária específica quando RFI exige',
    tooltip_conferencia: 'Verifica declaração de ausência de praga quarentenária exigida',
    base_normativa: 'IN MAPA 71/2018 art. 8; RFI',
  },
  {
    id: 'CF8-02',
    secao: 'regras_praga_produto',
    item: 'Área/lugar/local livre de praga',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Reconhecimento de área livre (ALP) ou local livre quando RFI admite',
    tooltip_conferencia: 'Verifica reconhecimento de área/lugar livre de praga',
    base_normativa: 'NIMF 4; NIMF 10',
  },
  {
    id: 'CF8-03',
    secao: 'regras_praga_produto',
    item: 'Sementes e material de propagação',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Sementes/mudas: exigências reforçadas conforme normas MAPA',
    tooltip_conferencia: 'Aplica exigências reforçadas para sementes e propagação',
    base_normativa: 'IN SDA 12/2018',
  },
  {
    id: 'CF8-04',
    secao: 'regras_praga_produto',
    item: 'Grãos, farelos e produtos processados',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Grãos/farelos: risco de praga e tratamento conforme origem',
    tooltip_conferencia: 'Aplica regras específicas de grãos e processados',
    base_normativa: 'RFI por produto',
  },
  {
    id: 'CF8-05',
    secao: 'regras_praga_produto',
    item: 'Madeira e produtos florestais',
    motor: 'rag',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Madeira/produtos florestais: RFI próprio e declaração de praga',
    tooltip_conferencia: 'Aplica regras específicas de madeira e produtos florestais',
    base_normativa: 'RFI; NIMF específicas',
  },
  {
    id: 'CF8-06',
    secao: 'regras_praga_produto',
    item: 'Trânsito internacional / baldeação',
    motor: 'llm',
    severidade: "cond",
    gate_condicional: true,
    descricao: 'Envio em trânsito pelo Brasil: regime e exigências distintas',
    tooltip_conferencia: 'Identifica envio em trânsito e exigências próprias',
    base_normativa: 'NIMF 25; IN SDA 12/2018',
  },
  // ── 9 — Legitimidade e risco fitossanitário ──
  {
    id: 'CF9-01',
    secao: 'legitimidade_risco',
    item: 'Legibilidade e idioma',
    motor: 'llm',
    severidade: "alerta",
    descricao: 'Legível; idioma aceito (inglês/espanhol/português)',
    tooltip_conferencia: 'Avalia legibilidade e idioma do certificado',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF9-02',
    secao: 'legitimidade_risco',
    item: 'Consistência origem × triangulação',
    motor: 'cross_doc',
    severidade: "alerta",
    descricao: 'Origem coerente com invoice (S3-05), CO (CO2-04) e rota BL/AWB',
    tooltip_conferencia: 'Cruza origem do certificado com invoice, CO e rota',
    base_normativa: 'NIMF 7',
  },
  {
    id: 'CF9-03',
    secao: 'legitimidade_risco',
    item: 'Completude dos campos obrigatórios NIMF 12',
    motor: 'codigo',
    severidade: "bloq",
    descricao: 'Todos os campos obrigatórios NIMF 12 preenchidos',
    tooltip_conferencia: 'Verifica completude dos campos obrigatórios do modelo NIMF 12',
    base_normativa: 'NIMF 12',
  },
  {
    id: 'CF9-04',
    secao: 'legitimidade_risco',
    item: 'Risco fitossanitário / medida provável',
    motor: 'codigo',
    severidade: "bloq",
    descricao: 'Consolidar: certificado inválido, fora PVIA, declaração faltante, tratamento inadequado',
    tooltip_conferencia: 'Consolida risco fitossanitário e medida provável do MAPA',
    base_normativa: 'Portaria MAPA 177/2021; IN SDA 12/2018',
  },
  {
    id: 'CF9-05',
    secao: 'legitimidade_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao: 'Score 0–100 sobre regras ALERTA/INFO aplicáveis',
    tooltip_conferencia: 'Pontuação de qualidade documental do certificado',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'CF9-06',
    secao: 'legitimidade_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao: 'Pior entre score e gates. Gates: CF1-01 a CF9-04 (16 gates BLOQ)',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

export const GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly string[] =
  MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO.filter((regra) => regra.severidade === 'bloq').map((regra) => regra.id)

export const GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly string[] = [
  'CF2-01',
  'CF2-02',
  'CF2-03',
  'CF2-04',
  'CF2-05',
  'CF1-02',
  'CF1-03',
  'CF5-02',
]

export type ClassificacaoRiscoCertificadoFitossanitario = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_CERTIFICADO_FITOSSANITARIO: Record<ClassificacaoRiscoCertificadoFitossanitario, string> = {
  baixo_risco: 'Baixo risco', atencao: 'Atenção', alto_risco: 'Alto risco', critico: 'Crítico',
}

export function classificacaoPorFaixaScoreCertificadoFitossanitario(score: number): ClassificacaoRiscoCertificadoFitossanitario {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

export function classificacaoRiscoCertificadoFitossanitario(score: number, gatesFalhos: readonly string[]): ClassificacaoRiscoCertificadoFitossanitario {
  const porScore = classificacaoPorFaixaScoreCertificadoFitossanitario(score)
  if (gatesFalhos.length === 0) return porScore
  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'
  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizCertificadoFitossanitarioPorId(id: string): RegraMatrizCertificadoFitossanitario | undefined {
  return MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO.find((r) => r.id === id)
}
