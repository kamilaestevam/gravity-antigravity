
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.ProcessoGravityScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  numero: 'numero',
  referencia_interna: 'referencia_interna',
  referencia_dati: 'referencia_dati',
  status: 'status',
  tipo: 'tipo',
  responsavel_id: 'responsavel_id',
  vendedor_id: 'vendedor_id',
  setor_responsavel: 'setor_responsavel',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoEtapasScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  nome: 'nome',
  status: 'status',
  data_prevista: 'data_prevista',
  data_realizada: 'data_realizada',
  observacao: 'observacao'
};

exports.Prisma.ProcessoPedidoScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  numero: 'numero',
  exportador_nome: 'exportador_nome',
  exportador_pais: 'exportador_pais',
  valor_fob: 'valor_fob',
  moeda: 'moeda',
  peso_bruto: 'peso_bruto',
  status: 'status',
  status_id: 'status_id',
  campos_custom: 'campos_custom',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoPedidoItensScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  pedido_id: 'pedido_id',
  numero_item: 'numero_item',
  descricao: 'descricao',
  ncm: 'ncm',
  quantidade: 'quantidade',
  unidade: 'unidade',
  valor_unitario: 'valor_unitario',
  valor_total: 'valor_total',
  moeda: 'moeda',
  status_li: 'status_li',
  campos_custom: 'campos_custom',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoFollowupScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  titulo: 'titulo',
  descricao: 'descricao',
  tipo: 'tipo',
  categoria: 'categoria',
  usuario_id: 'usuario_id',
  usuario_nome: 'usuario_nome',
  created_at: 'created_at'
};

exports.Prisma.ProcessoAnexosScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  nome: 'nome',
  tipo_arquivo: 'tipo_arquivo',
  tamanho_bytes: 'tamanho_bytes',
  url: 'url',
  categoria: 'categoria',
  created_at: 'created_at'
};

exports.Prisma.ProcessoEstimativaCustoScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  impostos: 'impostos',
  frete: 'frete',
  despacho: 'despacho',
  outros: 'outros',
  total: 'total',
  moeda: 'moeda'
};

exports.Prisma.ProcessoDadosTecnicosScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  processo_id: 'processo_id',
  importador_nome: 'importador_nome',
  importador_cnpj: 'importador_cnpj',
  importador_endereco: 'importador_endereco',
  exportador_nome: 'exportador_nome',
  exportador_pais: 'exportador_pais',
  exportador_endereco: 'exportador_endereco',
  modal: 'modal',
  porto_embarque: 'porto_embarque',
  porto_destino: 'porto_destino',
  navio_voo: 'navio_voo',
  data_embarque: 'data_embarque',
  data_chegada_prevista: 'data_chegada_prevista',
  data_chegada_real: 'data_chegada_real',
  bl_numero: 'bl_numero',
  container_numero: 'container_numero',
  despachante_nome: 'despachante_nome',
  despachante_contato: 'despachante_contato',
  di_numero: 'di_numero',
  di_data: 'di_data',
  canal: 'canal',
  seguro_apolice: 'seguro_apolice',
  seguro_valor: 'seguro_valor',
  seguro_moeda: 'seguro_moeda'
};

exports.Prisma.ProcessoStatusScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  nome: 'nome',
  rotulo: 'rotulo',
  cor: 'cor',
  icone: 'icone',
  ordem: 'ordem',
  is_padrao: 'is_padrao',
  is_sistema: 'is_sistema',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoColunasScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  nome: 'nome',
  rotulo: 'rotulo',
  tipo: 'tipo',
  casas_decimais: 'casas_decimais',
  opcoes: 'opcoes',
  ordem: 'ordem',
  filtravel: 'filtravel',
  exibida_padrao: 'exibida_padrao',
  index_criado: 'index_criado',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessosPedidoPreferenciaScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  user_id: 'user_id',
  colunas_visiveis: 'colunas_visiveis',
  colunas_largura: 'colunas_largura',
  updated_at: 'updated_at'
};

exports.Prisma.ProcessoPedidoPadraoScalarFieldEnum = {
  id: 'id',
  id_organizacao: 'id_organizacao',
  product_id: 'product_id',
  colunas_visiveis: 'colunas_visiveis',
  colunas_largura: 'colunas_largura',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  ProcessoGravity: 'ProcessoGravity',
  ProcessoEtapas: 'ProcessoEtapas',
  ProcessoPedido: 'ProcessoPedido',
  ProcessoPedidoItens: 'ProcessoPedidoItens',
  ProcessoFollowup: 'ProcessoFollowup',
  ProcessoAnexos: 'ProcessoAnexos',
  ProcessoEstimativaCusto: 'ProcessoEstimativaCusto',
  ProcessoDadosTecnicos: 'ProcessoDadosTecnicos',
  ProcessoStatus: 'ProcessoStatus',
  ProcessoColunas: 'ProcessoColunas',
  ProcessosPedidoPreferencia: 'ProcessosPedidoPreferencia',
  ProcessoPedidoPadrao: 'ProcessoPedidoPadrao'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
