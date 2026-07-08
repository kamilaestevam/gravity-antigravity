export type NcmCatalogoSimuladorPedido = {
  codigo: string
  descricao: string
  ii: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
}

/** Data fixa de sync — exibida no rodapé do modal Buscar NCM (paridade com Cadastros). */
export const ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO = '2026-07-01T14:30:00.000Z'

/**
 * Catálogo NCM para o simulador — subset representativo do Incoterms 2020 / Siscomex.
 * Códigos em 8 dígitos (storage interno do SelectNcmGlobal).
 */
export const CATALOGO_NCM_SIMULADOR_PEDIDO: NcmCatalogoSimuladorPedido[] = [
  { codigo: '84713012', descricao: 'Máquinas automáticas para processamento de dados, portáteis, de peso não superior a 10 kg', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84714110', descricao: 'Máquinas automáticas para processamento de dados, digitais, que contenham na mesma embalagem unidade central de processamento e dispositivos de entrada e saída', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84714900', descricao: 'Outras máquinas automáticas para processamento de dados, apresentadas sob a forma de sistemas', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84715010', descricao: 'Unidades de processamento, digitais, exceto as das subposições 8471.41 ou 8471.49', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84716052', descricao: 'Unidades de entrada ou de saída, digitais, teclados', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84717012', descricao: 'Unidades de memória, digitais, discos magnéticos rígidos (HDD)', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84717032', descricao: 'Unidades de memória, digitais, discos de estado sólido (SSD)', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84718000', descricao: 'Outras unidades de máquinas automáticas para processamento de dados', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85171231', descricao: 'Telefones celulares, mesmo com outros dispositivos incorporados', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85176255', descricao: 'Aparelhos para recepção, conversão, transmissão ou regeneração de voz, imagens ou outros dados, roteadores', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85176262', descricao: 'Aparelhos de comunicação de dados, switches e hubs de rede', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85287200', descricao: 'Aparelhos receptores de televisão, mesmo incorporando aparelhos receptores de radiodifusão ou aparelhos de gravação ou reprodução de som ou imagem', ii: 20, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85423190', descricao: 'Processadores e controladores, mesmo combinados com memórias, conversores, circuitos lógicos, amplificadores, circuitos temporizadores e outros circuitos', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85444200', descricao: 'Outros condutores elétricos, para tensão não superior a 1.000 V, munidos de peças de conexão', ii: 12, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84099999', descricao: 'Partes reconhecíveis como exclusiva ou principalmente destinadas aos motores das posições 8407 ou 8408', ii: 4, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84091000', descricao: 'Partes reconhecíveis como exclusiva ou principalmente destinadas aos motores da posição 8407 ou 8408', ii: 4, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84145990', descricao: 'Ventiladores, exceto os de uso agrícola, de mesa, de teto ou de parede', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84213990', descricao: 'Outros aparelhos para filtrar ou depurar gases', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '73089000', descricao: 'Construções e suas partes, de ferro fundido, ferro ou aço, exceto as da posição 7308.10', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '73079900', descricao: 'Acessórios para tubos, de ferro fundido, ferro ou aço, exceto os de uso sanitário', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '72104900', descricao: 'Produtos laminados planos, de ferro ou aço, não ligados, de largura igual ou superior a 600 mm, zincados', ii: 12, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '39269090', descricao: 'Outras obras de plástico, exceto as da posição 3926.10', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '39201099', descricao: 'Chapas, folhas, películas, tiras e lâminas, de plástico, de polímeros de etileno', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '40169300', descricao: 'Juntas, gaxetas e semelhantes, de borracha vulcanizada não endurecida', ii: 12, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '87089990', descricao: 'Partes e acessórios dos veículos das posições 8701 a 8705, não especificados nem compreendidos noutras posições', ii: 18, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '87082999', descricao: 'Outras partes e acessórios de carroçarias, incluindo as cabinas', ii: 18, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '94036000', descricao: 'Outros móveis de madeira', ii: 20, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '94035000', descricao: 'Móveis de madeira do tipo utilizado em quartos', ii: 20, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84798999', descricao: 'Outras máquinas e aparelhos mecânicos com função própria, não especificados nem compreendidos noutras posições', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '84799090', descricao: 'Partes de máquinas e aparelhos mecânicos com função própria, da posição 8479', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85044021', descricao: 'Retificadores, mesmo incorporando transformadores, de potência não superior a 10 kVA', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85044029', descricao: 'Outros retificadores, mesmo incorporando transformadores', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '85371090', descricao: 'Quadros, painéis, consoles, cabinas e outras bases, para comando elétrico ou distribuição de energia', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '90318099', descricao: 'Outros instrumentos, aparelhos e máquinas de medida ou controle, não especificados nem compreendidos noutras posições', ii: 14, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '90189099', descricao: 'Outros instrumentos e aparelhos para medicina, cirurgia, odontologia ou veterinária', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '30049099', descricao: 'Outros medicamentos constituídos por produtos misturados ou não misturados, preparados para usos terapêuticos ou profiláticos', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '21069090', descricao: 'Outras preparações alimentícias, não especificadas nem compreendidas noutras posições', ii: 16, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '22030000', descricao: 'Cervejas de malte', ii: 20, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '09011110', descricao: 'Café não torrado, não descafeinado, em grão', ii: 10, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '10063021', descricao: 'Arroz semiperlado ou perlado, em branco, mesmo polido ou brunido', ii: 12, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '27101932', descricao: 'Óleos lubrificantes, exceto óleos para motores de ignição por centelha', ii: 6, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '28070010', descricao: 'Ácido sulfúrico', ii: 6, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '29051100', descricao: 'Metanol (álcool metílico)', ii: 6, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '39011020', descricao: 'Polietileno, de densidade inferior a 0,94, em formas primárias', ii: 12, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '62046200', descricao: 'Calças, jardineiras, bermudas e shorts, de algodão, para mulheres ou meninas', ii: 35, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '61091000', descricao: 'Camisetas de malha, de algodão', ii: 35, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '64039990', descricao: 'Outros calçados com sola exterior de borracha, plástico ou couro reconstituído', ii: 35, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '95030099', descricao: 'Outros brinquedos, exceto os de rodas para serem montados por crianças', ii: 20, ipi: 0, pis: 1.65, cofins: 7.6 },
  { codigo: '88026000', descricao: 'Veículos aéreos e aparelhos espaciais, não tripulados (drones)', ii: 0, ipi: 0, pis: 1.65, cofins: 7.6 },
]
