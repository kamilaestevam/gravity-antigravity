#!/usr/bin/env python3
"""Gera matriz-validacao-certificado-fitossanitario-smart-read.ts (CF1–CF9)."""

import json

BASE = r'C:\Users\danie\worthree-ajuste-smartdoc-03\servicos-global\produto\smart-read\shared'
FILE = f'{BASE}\\matriz-validacao-certificado-fitossanitario-smart-read.ts'

def motor(m: str) -> str:
    m = m.lower()
    if 'lpco' in m and 'rag' in m:
        return 'lpco'
    if 'cross-doc + rag' in m or 'cross_doc + rag' in m:
        return 'cross_doc_rag'
    if 'api/rag' in m or 'api + rag' in m:
        return 'api_llm'
    if 'cross-doc' in m:
        return 'cross_doc'
    if 'lpco' in m:
        return 'lpco'
    if 'código' in m or 'codigo' in m:
        return 'codigo'
    if 'llm' in m or 'ia' in m:
        return 'llm'
    if 'api' in m:
        return 'api'
    if 'rag' in m:
        return 'rag'
    return 'codigo'


def row(*args):
    return {
        'id': args[0], 'secao': args[1], 'item': args[2], 'motor': motor(args[3]),
        'severidade': {'BLOQ': 'bloq', 'ALERTA': 'alerta', 'INFO': 'info', 'COND': 'cond'}.get(args[4]),
        'descricao': args[5], 'tooltip': args[6], 'base': args[7],
        'gate_condicional': args[4] == 'COND',
    }


SECOES = {
    'aplicabilidade_tipo': '1 — Aplicabilidade, tipo e enquadramento',
    'emissor_legitimidade': '2 — Emissor (ONPF) e legitimidade',
    'identificacao_datas': '3 — Identificação, datas e validade',
    'descricao_envio': '4 — Descrição do envio e correspondência',
    'origem_tratamento': '5 — Origem, tratamento e declarações adicionais',
    'embalagem_conteudo': '6 — Embalagem de madeira e conteúdo proibido',
    'processo_mapa_lpco': '7 — Coerência com processo, MAPA e LPCO',
    'regras_praga_produto': '8 — Regras específicas por praga/produto',
    'legitimidade_risco': '9 — Legitimidade e risco fitossanitário',
}

RULES = [
    row('CF1-01','aplicabilidade_tipo','Exigibilidade fitossanitária (categoria de risco)','Cross-Doc + RAG','BLOQ','Determinar pela NCM/produto se o envio é artigo regulamentado e categoria de risco 0–5; Categoria 0 dispensada','Define se o produto exige certificado fitossanitário e sua categoria de risco','IN SDA 12/2018; RFI/MAPA'),
    row('CF1-02','aplicabilidade_tipo','Produto na PVIA (importação autorizada)','RAG','BLOQ','Verificar se vegetal/origem consta na PVIA; fora da PVIA não tem importação autorizada','Verifica se o produto e a origem estão autorizados a importar (PVIA)','PVIA/MAPA'),
    row('CF1-03','aplicabilidade_tipo','Permissão de Importação / RFI','LPCO + RAG','BLOQ','PI ou Autorização Fitossanitária válida e RFI aplicáveis; CFI deve atender aos RFI','Confere a Permissão de Importação e os requisitos fitossanitários aplicáveis','IN SDA 12/2018; RFI; LPCO Portal Único'),
    row('CF1-04','aplicabilidade_tipo','Tipo: CFI × CFR (reexportação)','IA (LLM)','ALERTA','Classificar CFI ou CFR; CFR deve vir com cópia autenticada do CF de origem','Identifica certificado de origem ou reexportação (CFR exige CF de origem anexo)','NIMF 12; IN MAPA 71/2018 arts. 10–13'),
    row('CF1-05','aplicabilidade_tipo','Modelo NIMF 12','IA (LLM)','ALERTA','Documento no modelo NIMF 12 (Phytosanitary Certificate, campos padronizados)','Verifica se o certificado segue o modelo oficial da NIMF 12','NIMF 12; NIMF 7'),
    row('CF1-06','aplicabilidade_tipo','Formato: físico × eletrônico (ePhyto)','IA (LLM)','INFO','Detectar CFI físico ou eletrônico (ePhyto/IPPC ePhyto Hub)','Identifica se o certificado é físico ou eletrônico (ePhyto)','IN MAPA 71/2018 art. 28; ePhyto CIPV'),
    row('CF2-01','emissor_legitimidade','ONPF emissora do país de origem','RAG','BLOQ','Emitido pela ONPF oficial do país de origem (não entidade privada); signatária CIPV','Verifica se o emissor é a ONPF oficial do país de origem','CIPV/FAO; NIMF 7'),
    row('CF2-02','emissor_legitimidade','Assinatura do funcionário autorizado','IA (LLM)','BLOQ','Assinatura autógrafa ou digital de funcionário autorizado da ONPF','Verifica a assinatura do funcionário autorizado da ONPF','NIMF 12; IN MAPA 71/2018'),
    row('CF2-03','emissor_legitimidade','Carimbo/selo oficial','IA (LLM)','BLOQ','Carimbo ou selo oficial da ONPF emissora','Verifica o carimbo/selo oficial da organização emissora','NIMF 12; NIMF 7'),
    row('CF2-04','emissor_legitimidade','Sem alterações não autorizadas','IA (LLM)','BLOQ','Sem rasuras, emendas ou apagamentos — modelo NIMF 12 veda alterações','Detecta rasuras ou alterações que invalidam o certificado','NIMF 12'),
    row('CF2-05','emissor_legitimidade','Indícios de falsificação','IA (LLM)','BLOQ','Sinais de falsificação (fonte, layout, numeração inconsistente)','Sinaliza indícios de falsificação do certificado','IN MAPA 71/2018 art. 30; DL 1.455/76'),
    row('CF3-01','identificacao_datas','Número do certificado','Código','ALERTA','Nº único do certificado presente','Confere o número único do certificado','NIMF 12'),
    row('CF3-02','identificacao_datas','Data de emissão','Código','ALERTA','Presente; alertar se futura; validade fitossanitária curta conforme RFI','Valida a data de emissão e alerta prazos curtos','NIMF 12; RFI'),
    row('CF3-03','identificacao_datas','País de origem / exportação','Cross-Doc','BLOQ','País de origem casa com invoice (S3-05) e CO (CO2-04); ONPF emissora coerente','Confere o país de origem contra invoice/CO e a ONPF emissora','NIMF 12; NIMF 7'),
    row('CF3-04','identificacao_datas','Órgão de destino declarado','IA (LLM)','INFO','ONPF do Brasil indicada no campo próprio','Verifica a indicação da ONPF de destino (Brasil)','NIMF 12'),
    row('CF4-01','descricao_envio','Nome botânico (gênero + espécie)','IA (LLM)','BLOQ','Nome científico binomial (ex.: Glycine max), não apenas nome comum','Exige o nome científico do vegetal, não só o nome comum','NIMF 12; NIMF 5'),
    row('CF4-02','descricao_envio','Descrição × invoice/PL','Cross-Doc','BLOQ','Descrição coerente com invoice (S4-02) e PL (P6-01)','Confere a descrição do certificado contra invoice e packing list','NIMF 12'),
    row('CF4-03','descricao_envio','Quantidade e unidade','Cross-Doc','ALERTA','Quantidade coerente com invoice/PL; não amparar mais que embarcado','Confere a quantidade contra invoice e packing list','NIMF 12'),
    row('CF4-04','descricao_envio','Tipo e nº de volumes / embalagem','Cross-Doc','ALERTA','Volumes coerentes com PL (P4-01) e BL/AWB','Confere volumes e embalagem contra PL e conhecimento','NIMF 12'),
    row('CF4-05','descricao_envio','Marcas distintivas','IA (LLM)','INFO','Marcas de identificação coerentes com PL (P4-04)','Confere marcas distintivas contra o packing list','NIMF 12'),
    row('CF4-06','descricao_envio','Meio de transporte e rota','Cross-Doc','INFO','Meio de transporte coerente com BL/AWB e ponto de entrada','Confere transporte e ponto de entrada contra o conhecimento','NIMF 12'),
    row('CF5-01','origem_tratamento','Local de produção / origem','IA (LLM)','ALERTA','Local de origem declarado; base para área livre de praga','Confere o local de produção/origem declarado','NIMF 12; NIMF 4'),
    row('CF5-02','origem_tratamento','Declaração adicional (Additional Declaration)','RAG','BLOQ','Campo Declaração Adicional com texto exato exigido pelo RFI quando aplicável','Verifica a Declaração Adicional exigida pelo requisito fitossanitário','NIMF 12; IN MAPA 71/2018 arts. 8–9; RFI'),
    row('CF5-03','origem_tratamento','Tratamento fitossanitário — dados','RAG','COND','Quando há tratamento: tipo, ingrediente, dose, duração, temperatura e data','Verifica os dados do tratamento fitossanitário quando exigido','NIMF 12; Portaria MAPA 177/2021'),
    row('CF5-04','origem_tratamento','Coerência tratamento × praga/RFI','RAG','ALERTA','Tratamento declarado eficaz e adequado à praga-alvo e ao RFI','Avalia se o tratamento é adequado à praga e ao requisito','Portaria MAPA 177/2021; RFI'),
    row('CF5-05','origem_tratamento','Empresa/tratamento credenciado','API/RAG','COND','Coerência com credenciamento reconhecido quando aplicável','Verifica a credencial do tratamento quando aplicável','Portaria MAPA 177/2021'),
    row('CF5-06','origem_tratamento','Análise laboratorial (quando exigida)','RAG','COND','Referência ao laudo laboratorial quando exigido pelo RFI','Verifica a referência a laudo laboratorial quando exigido','IN MAPA 71/2018'),
    row('CF5-07','origem_tratamento','Informação Fitossanitária Oficial Adicional (CFR)','IA (LLM)','COND','Em CFR: Informação Fitossanitária Oficial Adicional com país de origem','Verifica a informação oficial adicional exigida na reexportação','IN MAPA 71/2018'),
    row('CF6-01','embalagem_conteudo','Embalagem de madeira (NIMF 15)','Cross-Doc','ALERTA','Coerência com invoice (S7-03), PL (P8-01) e BL/AWB; madeira exige marca IPPC','Cruza embalagem de madeira com demais documentos (NIMF 15)','NIMF 15; Portaria MAPA 514/2022'),
    row('CF6-02','embalagem_conteudo','Sem referências vedadas','IA (LLM)','ALERTA','CF não pode conter referências comerciais, saúde, qualidade, transgenia','Detecta referências vedadas no certificado','IN MAPA 71/2018 art. 29'),
    row('CF6-03','embalagem_conteudo','Escopo estritamente fitossanitário','IA (LLM)','INFO','Certificado atesta apenas condição fitossanitária','Confirma que o certificado é estritamente fitossanitário','NIMF 12'),
    row('CF7-01','processo_mapa_lpco','Carregado no LPCO','LPCO','ALERTA','Certificado anexado ao LPCO adequado no Portal Único','Verifica se o certificado está no LPCO do Portal Único','Manual LPCO; anuência MAPA'),
    row('CF7-02','processo_mapa_lpco','Vínculo CF × DUIMP / adição','Cross-Doc','BLOQ','CF deve amparar produto/adição da DUIMP; NCM e produto = certificado','Confere o vínculo do certificado com a adição da DUIMP','RA art. 553; anuência MAPA'),
    row('CF7-03','processo_mapa_lpco','Ponto de entrada e VIGIAGRO competente','Cross-Doc','ALERTA','Ponto de entrada atendido por Unidade VIGIAGRO','Confere o ponto de entrada e a unidade VIGIAGRO competente','IN MAPA 71/2018 art. 14; IN SDA 12/2018'),
    row('CF7-04','processo_mapa_lpco','Inspeção / interceptação de praga','IA (LLM)','BLOQ','Conformidade documental não afasta inspeção física; interceptação → tratamento/reexportação/destruição','Alerta que inspeção física pode prescrever medida fitossanitária','Portaria MAPA 177/2021; IN SDA 12/2018'),
    row('CF7-05','processo_mapa_lpco','Coerência global do dossiê','Cross-Doc','ALERTA','Parecer único: CF × invoice × PL × BL/AWB × CO consistentes','Consolida a coerência do certificado com os demais documentos','RA art. 553; NIMF 12'),
    row('CF8-01','regras_praga_produto','Praga quarentenária ausente','RAG','COND','Declaração de ausência de praga quarentenária específica quando RFI exige','Verifica declaração de ausência de praga quarentenária exigida','IN MAPA 71/2018 art. 8; RFI'),
    row('CF8-02','regras_praga_produto','Área/lugar/local livre de praga','RAG','COND','Reconhecimento de área livre (ALP) ou local livre quando RFI admite','Verifica reconhecimento de área/lugar livre de praga','NIMF 4; NIMF 10'),
    row('CF8-03','regras_praga_produto','Sementes e material de propagação','RAG','COND','Sementes/mudas: exigências reforçadas conforme normas MAPA','Aplica exigências reforçadas para sementes e propagação','IN SDA 12/2018'),
    row('CF8-04','regras_praga_produto','Grãos, farelos e produtos processados','RAG','COND','Grãos/farelos: risco de praga e tratamento conforme origem','Aplica regras específicas de grãos e processados','RFI por produto'),
    row('CF8-05','regras_praga_produto','Madeira e produtos florestais','RAG','COND','Madeira/produtos florestais: RFI próprio e declaração de praga','Aplica regras específicas de madeira e produtos florestais','RFI; NIMF específicas'),
    row('CF8-06','regras_praga_produto','Trânsito internacional / baldeação','IA (LLM)','COND','Envio em trânsito pelo Brasil: regime e exigências distintas','Identifica envio em trânsito e exigências próprias','NIMF 25; IN SDA 12/2018'),
    row('CF9-01','legitimidade_risco','Legibilidade e idioma','IA (LLM)','ALERTA','Legível; idioma aceito (inglês/espanhol/português)','Avalia legibilidade e idioma do certificado','NIMF 12'),
    row('CF9-02','legitimidade_risco','Consistência origem × triangulação','Cross-Doc','ALERTA','Origem coerente com invoice (S3-05), CO (CO2-04) e rota BL/AWB','Cruza origem do certificado com invoice, CO e rota','NIMF 7'),
    row('CF9-03','legitimidade_risco','Completude dos campos obrigatórios NIMF 12','Código','BLOQ','Todos os campos obrigatórios NIMF 12 preenchidos','Verifica completude dos campos obrigatórios do modelo NIMF 12','NIMF 12'),
    row('CF9-04','legitimidade_risco','Risco fitossanitário / medida provável','Código','BLOQ','Consolidar: certificado inválido, fora PVIA, declaração faltante, tratamento inadequado','Consolida risco fitossanitário e medida provável do MAPA','Portaria MAPA 177/2021; IN SDA 12/2018'),
    row('CF9-05','legitimidade_risco','Score documental','Código',None,'Score 0–100 sobre regras ALERTA/INFO aplicáveis','Pontuação de qualidade documental do certificado','Metodologia interna'),
    row('CF9-06','legitimidade_risco','Classificação de risco (gates + score)','Código',None,'Pior entre score e gates. Gates: CF1-01 a CF9-04 (16 gates BLOQ)','Classificação final combinando gates e pontuação','Metodologia interna'),
]

GATES_CRITICOS = ['CF2-01', 'CF2-02', 'CF2-03', 'CF2-04', 'CF2-05', 'CF1-02', 'CF1-03', 'CF5-02']

def esc(s):
    return s.replace("'", "\\'")

fn = 'CertificadoFitossanitario'
u = 'CERTIFICADO_FITOSSANITARIO'
const = 'MATRIZ_VALIDACAO_CERTIFICADO_FITOSSANITARIO'

header = """/**
 * matriz-validacao-certificado-fitossanitario-smart-read.ts — SSOT Matriz CF (CFI/CFR) v1.0
 *
 * Certificado Fitossanitário Internacional (NIMF 12). Consequência grave: retenção, tratamento
 * quarentenário, reexportação ou destruição do envio — não apenas multa.
 * Base: NIMF 12/7 · CIPV/FAO · IN MAPA 71/2018 · IN SDA 12/2018 · Portaria MAPA 177/2021 · LPCO.
 */"""

lines = [header, '']
lines.append('export type SecaoMatrizCertificadoFitossanitario =')
for s in SECOES:
    lines.append(f"  | '{s}'")
lines.append('')
lines.append('export type MotorValidacaoCertificadoFitossanitario =')
for m in ['codigo', 'api', 'llm', 'rag', 'cross_doc', 'codigo_rag', 'cross_doc_rag', 'api_llm', 'lpco']:
    lines.append(f"  | '{m}'")
lines.append('')
lines.append("export type SeveridadeMatrizCertificadoFitossanitario = 'bloq' | 'alerta' | 'info' | 'cond' | null")
lines.append('')
lines.append('export type RegraMatrizCertificadoFitossanitario = {')
for f in ['id: string', 'secao: SecaoMatrizCertificadoFitossanitario', 'item: string',
          'motor: MotorValidacaoCertificadoFitossanitario', 'severidade: SeveridadeMatrizCertificadoFitossanitario',
          'gate_condicional?: boolean', 'descricao: string', 'tooltip_conferencia: string', 'base_normativa: string']:
    lines.append(f'  {f}')
lines.append('}')
lines.append('')
lines.append('export const ORDEM_SECOES_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly SecaoMatrizCertificadoFitossanitario[] = [')
for s in SECOES:
    lines.append(f"  '{s}',")
lines.append('] as const')
lines.append('')
lines.append('export const ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO: Record<SecaoMatrizCertificadoFitossanitario, string> = {')
for s, rot in SECOES.items():
    lines.append(f"  {s}: '{esc(rot)}',")
lines.append('}')
lines.append('')
lines.append('export const ROTULO_SEVERIDADE_MATRIZ_CERTIFICADO_FITOSSANITARIO: Record<Exclude<SeveridadeMatrizCertificadoFitossanitario, null>, string> = {')
lines.append("  bloq: 'BLOQ', alerta: 'ALERTA', info: 'INFO', cond: 'COND',")
lines.append('}')
lines.append('')
lines.append(f'export const {const}: RegraMatrizCertificadoFitossanitario[] = [')
cur = None
for r in RULES:
    if r['secao'] != cur:
        cur = r['secao']
        lines.append(f"  // ── {SECOES[cur]} ──")
    gate = ',\n    gate_condicional: true' if r.get('gate_condicional') else ''
    sev_val = r['severidade']
    lines.append('  {')
    lines.append(f"    id: '{r['id']}',")
    lines.append(f"    secao: '{r['secao']}',")
    lines.append(f"    item: '{esc(r['item'])}',")
    lines.append(f"    motor: '{r['motor']}',")
    lines.append(f"    severidade: {json.dumps(sev_val)}{gate},")
    lines.append(f"    descricao: '{esc(r['descricao'])}',")
    lines.append(f"    tooltip_conferencia: '{esc(r['tooltip'])}',")
    lines.append(f"    base_normativa: '{esc(r['base'])}',")
    lines.append('  },')
lines.append(']')
lines.append('')
lines.append('export const GATES_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly string[] =')
lines.append(f"  {const}.filter((regra) => regra.severidade === 'bloq').map((regra) => regra.id)")
lines.append('')
lines.append('export const GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO: readonly string[] = [')
for g in GATES_CRITICOS:
    lines.append(f"  '{g}',")
lines.append(']')
lines.append('')
lines.append("export type ClassificacaoRiscoCertificadoFitossanitario = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'")
lines.append('')
lines.append('export const ROTULO_CLASSIFICACAO_RISCO_CERTIFICADO_FITOSSANITARIO: Record<ClassificacaoRiscoCertificadoFitossanitario, string> = {')
lines.append("  baixo_risco: 'Baixo risco', atencao: 'Atenção', alto_risco: 'Alto risco', critico: 'Crítico',")
lines.append('}')
lines.append('')
lines.append('export function classificacaoPorFaixaScoreCertificadoFitossanitario(score: number): ClassificacaoRiscoCertificadoFitossanitario {')
lines.append("  if (score >= 95) return 'baixo_risco'")
lines.append("  if (score >= 80) return 'atencao'")
lines.append("  if (score >= 60) return 'alto_risco'")
lines.append("  return 'critico'")
lines.append('}')
lines.append('')
lines.append('export function classificacaoRiscoCertificadoFitossanitario(score: number, gatesFalhos: readonly string[]): ClassificacaoRiscoCertificadoFitossanitario {')
lines.append('  const porScore = classificacaoPorFaixaScoreCertificadoFitossanitario(score)')
lines.append('  if (gatesFalhos.length === 0) return porScore')
lines.append('  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_CERTIFICADO_FITOSSANITARIO.includes(id))')
lines.append("  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'")
lines.append("  return porScore === 'critico' ? 'critico' : 'alto_risco'")
lines.append('}')
lines.append('')
lines.append('export function regraMatrizCertificadoFitossanitarioPorId(id: string): RegraMatrizCertificadoFitossanitario | undefined {')
lines.append(f'  return {const}.find((r) => r.id === id)')
lines.append('}')
lines.append('')

with open(FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print(f'Wrote {FILE} with {len(RULES)} rules, {sum(1 for r in RULES if r["severidade"]=="bloq")} gates')
