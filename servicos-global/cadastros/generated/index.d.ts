
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Fornecedor
 * 
 */
export type Fornecedor = $Result.DefaultSelection<Prisma.$FornecedorPayload>
/**
 * Model FornecedorOrganizacao
 * 
 */
export type FornecedorOrganizacao = $Result.DefaultSelection<Prisma.$FornecedorOrganizacaoPayload>
/**
 * Model Pais
 * Pais — fonte única da verdade para país no monorepo Gravity.
 * 252 países seedeados de planilha consolidada (RFB + BACEN + SPED + ISO).
 * Toda entidade que referencia país (Empresa, Workspace, Organizacao,
 * AgenteCarga, Seguradora, etc.) deve apontar para id_pais (lookup lógico
 * cross-banco — sem FK física pois entidades vivem em DBs distintos).
 * Lei: skills/governanca/lei/cadastros-snapshot-policy/SKILL.md
 */
export type Pais = $Result.DefaultSelection<Prisma.$PaisPayload>
/**
 * Model Moeda
 * 
 */
export type Moeda = $Result.DefaultSelection<Prisma.$MoedaPayload>
/**
 * Model Unidade
 * 
 */
export type Unidade = $Result.DefaultSelection<Prisma.$UnidadePayload>
/**
 * Model Incoterm
 * 
 */
export type Incoterm = $Result.DefaultSelection<Prisma.$IncotermPayload>
/**
 * Model Porto
 * 
 */
export type Porto = $Result.DefaultSelection<Prisma.$PortoPayload>
/**
 * Model Aeroporto
 * 
 */
export type Aeroporto = $Result.DefaultSelection<Prisma.$AeroportoPayload>
/**
 * Model Container
 * 
 */
export type Container = $Result.DefaultSelection<Prisma.$ContainerPayload>
/**
 * Model NcmSync
 * 
 */
export type NcmSync = $Result.DefaultSelection<Prisma.$NcmSyncPayload>
/**
 * Model NcmSyncLog
 * 
 */
export type NcmSyncLog = $Result.DefaultSelection<Prisma.$NcmSyncLogPayload>
/**
 * Model NcmSyncAgendamento
 * 
 */
export type NcmSyncAgendamento = $Result.DefaultSelection<Prisma.$NcmSyncAgendamentoPayload>
/**
 * Model Ope
 * 
 */
export type Ope = $Result.DefaultSelection<Prisma.$OpePayload>
/**
 * Model OPEHistoricoStatus
 * 
 */
export type OPEHistoricoStatus = $Result.DefaultSelection<Prisma.$OPEHistoricoStatusPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TipoFornecedorOrganizacao: {
  AGENTE_CARGA: 'AGENTE_CARGA',
  DESPACHANTE_ADUANEIRO: 'DESPACHANTE_ADUANEIRO',
  ARMADOR: 'ARMADOR',
  CIA_AEREA: 'CIA_AEREA',
  TRANSPORTADORA_RODOVIARIA_NACIONAL: 'TRANSPORTADORA_RODOVIARIA_NACIONAL',
  TRANSPORTADORA_RODOVIARIA_INTERNACIONAL: 'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
  ARMAZEM_ALFANDEGADO: 'ARMAZEM_ALFANDEGADO',
  ARMAZEM_NACIONAL: 'ARMAZEM_NACIONAL',
  BANCO: 'BANCO',
  SEGURADORA_INTERNACIONAL: 'SEGURADORA_INTERNACIONAL',
  CORRETORA_CAMBIO: 'CORRETORA_CAMBIO',
  FABRICANTE: 'FABRICANTE'
};

export type TipoFornecedorOrganizacao = (typeof TipoFornecedorOrganizacao)[keyof typeof TipoFornecedorOrganizacao]


export const StatusFornecedorOrganizacao: {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  PENDENTE_APROVACAO: 'PENDENTE_APROVACAO'
};

export type StatusFornecedorOrganizacao = (typeof StatusFornecedorOrganizacao)[keyof typeof StatusFornecedorOrganizacao]


export const ContainerTipo: {
  DRY: 'DRY',
  REEFER: 'REEFER',
  OPEN_TOP: 'OPEN_TOP',
  FLAT_RACK: 'FLAT_RACK',
  TANK: 'TANK',
  BULK: 'BULK',
  PLATAFORMA: 'PLATAFORMA'
};

export type ContainerTipo = (typeof ContainerTipo)[keyof typeof ContainerTipo]


export const NcmSyncStatusSincronizacao: {
  EXECUTANDO: 'EXECUTANDO',
  SUCESSO: 'SUCESSO',
  ERRO: 'ERRO'
};

export type NcmSyncStatusSincronizacao = (typeof NcmSyncStatusSincronizacao)[keyof typeof NcmSyncStatusSincronizacao]


export const NcmSyncOrigemSincronizacao: {
  JOB: 'JOB',
  MANUAL: 'MANUAL'
};

export type NcmSyncOrigemSincronizacao = (typeof NcmSyncOrigemSincronizacao)[keyof typeof NcmSyncOrigemSincronizacao]

}

export type TipoFornecedorOrganizacao = $Enums.TipoFornecedorOrganizacao

export const TipoFornecedorOrganizacao: typeof $Enums.TipoFornecedorOrganizacao

export type StatusFornecedorOrganizacao = $Enums.StatusFornecedorOrganizacao

export const StatusFornecedorOrganizacao: typeof $Enums.StatusFornecedorOrganizacao

export type ContainerTipo = $Enums.ContainerTipo

export const ContainerTipo: typeof $Enums.ContainerTipo

export type NcmSyncStatusSincronizacao = $Enums.NcmSyncStatusSincronizacao

export const NcmSyncStatusSincronizacao: typeof $Enums.NcmSyncStatusSincronizacao

export type NcmSyncOrigemSincronizacao = $Enums.NcmSyncOrigemSincronizacao

export const NcmSyncOrigemSincronizacao: typeof $Enums.NcmSyncOrigemSincronizacao

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Fornecedors
 * const fornecedors = await prisma.fornecedor.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Fornecedors
   * const fornecedors = await prisma.fornecedor.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.fornecedor`: Exposes CRUD operations for the **Fornecedor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Fornecedors
    * const fornecedors = await prisma.fornecedor.findMany()
    * ```
    */
  get fornecedor(): Prisma.FornecedorDelegate<ExtArgs>;

  /**
   * `prisma.fornecedorOrganizacao`: Exposes CRUD operations for the **FornecedorOrganizacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FornecedorOrganizacaos
    * const fornecedorOrganizacaos = await prisma.fornecedorOrganizacao.findMany()
    * ```
    */
  get fornecedorOrganizacao(): Prisma.FornecedorOrganizacaoDelegate<ExtArgs>;

  /**
   * `prisma.pais`: Exposes CRUD operations for the **Pais** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pais
    * const pais = await prisma.pais.findMany()
    * ```
    */
  get pais(): Prisma.PaisDelegate<ExtArgs>;

  /**
   * `prisma.moeda`: Exposes CRUD operations for the **Moeda** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Moedas
    * const moedas = await prisma.moeda.findMany()
    * ```
    */
  get moeda(): Prisma.MoedaDelegate<ExtArgs>;

  /**
   * `prisma.unidade`: Exposes CRUD operations for the **Unidade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Unidades
    * const unidades = await prisma.unidade.findMany()
    * ```
    */
  get unidade(): Prisma.UnidadeDelegate<ExtArgs>;

  /**
   * `prisma.incoterm`: Exposes CRUD operations for the **Incoterm** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Incoterms
    * const incoterms = await prisma.incoterm.findMany()
    * ```
    */
  get incoterm(): Prisma.IncotermDelegate<ExtArgs>;

  /**
   * `prisma.porto`: Exposes CRUD operations for the **Porto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Portos
    * const portos = await prisma.porto.findMany()
    * ```
    */
  get porto(): Prisma.PortoDelegate<ExtArgs>;

  /**
   * `prisma.aeroporto`: Exposes CRUD operations for the **Aeroporto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Aeroportos
    * const aeroportos = await prisma.aeroporto.findMany()
    * ```
    */
  get aeroporto(): Prisma.AeroportoDelegate<ExtArgs>;

  /**
   * `prisma.container`: Exposes CRUD operations for the **Container** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Containers
    * const containers = await prisma.container.findMany()
    * ```
    */
  get container(): Prisma.ContainerDelegate<ExtArgs>;

  /**
   * `prisma.ncmSync`: Exposes CRUD operations for the **NcmSync** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NcmSyncs
    * const ncmSyncs = await prisma.ncmSync.findMany()
    * ```
    */
  get ncmSync(): Prisma.NcmSyncDelegate<ExtArgs>;

  /**
   * `prisma.ncmSyncLog`: Exposes CRUD operations for the **NcmSyncLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NcmSyncLogs
    * const ncmSyncLogs = await prisma.ncmSyncLog.findMany()
    * ```
    */
  get ncmSyncLog(): Prisma.NcmSyncLogDelegate<ExtArgs>;

  /**
   * `prisma.ncmSyncAgendamento`: Exposes CRUD operations for the **NcmSyncAgendamento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NcmSyncAgendamentos
    * const ncmSyncAgendamentos = await prisma.ncmSyncAgendamento.findMany()
    * ```
    */
  get ncmSyncAgendamento(): Prisma.NcmSyncAgendamentoDelegate<ExtArgs>;

  /**
   * `prisma.ope`: Exposes CRUD operations for the **Ope** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Opes
    * const opes = await prisma.ope.findMany()
    * ```
    */
  get ope(): Prisma.OpeDelegate<ExtArgs>;

  /**
   * `prisma.oPEHistoricoStatus`: Exposes CRUD operations for the **OPEHistoricoStatus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OPEHistoricoStatuses
    * const oPEHistoricoStatuses = await prisma.oPEHistoricoStatus.findMany()
    * ```
    */
  get oPEHistoricoStatus(): Prisma.OPEHistoricoStatusDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Fornecedor: 'Fornecedor',
    FornecedorOrganizacao: 'FornecedorOrganizacao',
    Pais: 'Pais',
    Moeda: 'Moeda',
    Unidade: 'Unidade',
    Incoterm: 'Incoterm',
    Porto: 'Porto',
    Aeroporto: 'Aeroporto',
    Container: 'Container',
    NcmSync: 'NcmSync',
    NcmSyncLog: 'NcmSyncLog',
    NcmSyncAgendamento: 'NcmSyncAgendamento',
    Ope: 'Ope',
    OPEHistoricoStatus: 'OPEHistoricoStatus'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "fornecedor" | "fornecedorOrganizacao" | "pais" | "moeda" | "unidade" | "incoterm" | "porto" | "aeroporto" | "container" | "ncmSync" | "ncmSyncLog" | "ncmSyncAgendamento" | "ope" | "oPEHistoricoStatus"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Fornecedor: {
        payload: Prisma.$FornecedorPayload<ExtArgs>
        fields: Prisma.FornecedorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FornecedorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FornecedorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          findFirst: {
            args: Prisma.FornecedorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FornecedorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          findMany: {
            args: Prisma.FornecedorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>[]
          }
          create: {
            args: Prisma.FornecedorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          createMany: {
            args: Prisma.FornecedorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FornecedorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>[]
          }
          delete: {
            args: Prisma.FornecedorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          update: {
            args: Prisma.FornecedorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          deleteMany: {
            args: Prisma.FornecedorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FornecedorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FornecedorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorPayload>
          }
          aggregate: {
            args: Prisma.FornecedorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFornecedor>
          }
          groupBy: {
            args: Prisma.FornecedorGroupByArgs<ExtArgs>
            result: $Utils.Optional<FornecedorGroupByOutputType>[]
          }
          count: {
            args: Prisma.FornecedorCountArgs<ExtArgs>
            result: $Utils.Optional<FornecedorCountAggregateOutputType> | number
          }
        }
      }
      FornecedorOrganizacao: {
        payload: Prisma.$FornecedorOrganizacaoPayload<ExtArgs>
        fields: Prisma.FornecedorOrganizacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FornecedorOrganizacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FornecedorOrganizacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          findFirst: {
            args: Prisma.FornecedorOrganizacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FornecedorOrganizacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          findMany: {
            args: Prisma.FornecedorOrganizacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>[]
          }
          create: {
            args: Prisma.FornecedorOrganizacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          createMany: {
            args: Prisma.FornecedorOrganizacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FornecedorOrganizacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>[]
          }
          delete: {
            args: Prisma.FornecedorOrganizacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          update: {
            args: Prisma.FornecedorOrganizacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          deleteMany: {
            args: Prisma.FornecedorOrganizacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FornecedorOrganizacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FornecedorOrganizacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FornecedorOrganizacaoPayload>
          }
          aggregate: {
            args: Prisma.FornecedorOrganizacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFornecedorOrganizacao>
          }
          groupBy: {
            args: Prisma.FornecedorOrganizacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<FornecedorOrganizacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.FornecedorOrganizacaoCountArgs<ExtArgs>
            result: $Utils.Optional<FornecedorOrganizacaoCountAggregateOutputType> | number
          }
        }
      }
      Pais: {
        payload: Prisma.$PaisPayload<ExtArgs>
        fields: Prisma.PaisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          findFirst: {
            args: Prisma.PaisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          findMany: {
            args: Prisma.PaisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>[]
          }
          create: {
            args: Prisma.PaisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          createMany: {
            args: Prisma.PaisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaisCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>[]
          }
          delete: {
            args: Prisma.PaisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          update: {
            args: Prisma.PaisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          deleteMany: {
            args: Prisma.PaisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PaisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaisPayload>
          }
          aggregate: {
            args: Prisma.PaisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePais>
          }
          groupBy: {
            args: Prisma.PaisGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaisGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaisCountArgs<ExtArgs>
            result: $Utils.Optional<PaisCountAggregateOutputType> | number
          }
        }
      }
      Moeda: {
        payload: Prisma.$MoedaPayload<ExtArgs>
        fields: Prisma.MoedaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MoedaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MoedaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          findFirst: {
            args: Prisma.MoedaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MoedaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          findMany: {
            args: Prisma.MoedaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>[]
          }
          create: {
            args: Prisma.MoedaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          createMany: {
            args: Prisma.MoedaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MoedaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>[]
          }
          delete: {
            args: Prisma.MoedaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          update: {
            args: Prisma.MoedaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          deleteMany: {
            args: Prisma.MoedaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MoedaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MoedaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MoedaPayload>
          }
          aggregate: {
            args: Prisma.MoedaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMoeda>
          }
          groupBy: {
            args: Prisma.MoedaGroupByArgs<ExtArgs>
            result: $Utils.Optional<MoedaGroupByOutputType>[]
          }
          count: {
            args: Prisma.MoedaCountArgs<ExtArgs>
            result: $Utils.Optional<MoedaCountAggregateOutputType> | number
          }
        }
      }
      Unidade: {
        payload: Prisma.$UnidadePayload<ExtArgs>
        fields: Prisma.UnidadeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UnidadeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UnidadeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          findFirst: {
            args: Prisma.UnidadeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UnidadeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          findMany: {
            args: Prisma.UnidadeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>[]
          }
          create: {
            args: Prisma.UnidadeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          createMany: {
            args: Prisma.UnidadeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UnidadeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>[]
          }
          delete: {
            args: Prisma.UnidadeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          update: {
            args: Prisma.UnidadeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          deleteMany: {
            args: Prisma.UnidadeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UnidadeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UnidadeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnidadePayload>
          }
          aggregate: {
            args: Prisma.UnidadeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUnidade>
          }
          groupBy: {
            args: Prisma.UnidadeGroupByArgs<ExtArgs>
            result: $Utils.Optional<UnidadeGroupByOutputType>[]
          }
          count: {
            args: Prisma.UnidadeCountArgs<ExtArgs>
            result: $Utils.Optional<UnidadeCountAggregateOutputType> | number
          }
        }
      }
      Incoterm: {
        payload: Prisma.$IncotermPayload<ExtArgs>
        fields: Prisma.IncotermFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IncotermFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IncotermFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          findFirst: {
            args: Prisma.IncotermFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IncotermFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          findMany: {
            args: Prisma.IncotermFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>[]
          }
          create: {
            args: Prisma.IncotermCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          createMany: {
            args: Prisma.IncotermCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IncotermCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>[]
          }
          delete: {
            args: Prisma.IncotermDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          update: {
            args: Prisma.IncotermUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          deleteMany: {
            args: Prisma.IncotermDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IncotermUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IncotermUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IncotermPayload>
          }
          aggregate: {
            args: Prisma.IncotermAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIncoterm>
          }
          groupBy: {
            args: Prisma.IncotermGroupByArgs<ExtArgs>
            result: $Utils.Optional<IncotermGroupByOutputType>[]
          }
          count: {
            args: Prisma.IncotermCountArgs<ExtArgs>
            result: $Utils.Optional<IncotermCountAggregateOutputType> | number
          }
        }
      }
      Porto: {
        payload: Prisma.$PortoPayload<ExtArgs>
        fields: Prisma.PortoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          findFirst: {
            args: Prisma.PortoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          findMany: {
            args: Prisma.PortoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>[]
          }
          create: {
            args: Prisma.PortoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          createMany: {
            args: Prisma.PortoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PortoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>[]
          }
          delete: {
            args: Prisma.PortoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          update: {
            args: Prisma.PortoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          deleteMany: {
            args: Prisma.PortoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PortoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortoPayload>
          }
          aggregate: {
            args: Prisma.PortoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePorto>
          }
          groupBy: {
            args: Prisma.PortoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortoCountArgs<ExtArgs>
            result: $Utils.Optional<PortoCountAggregateOutputType> | number
          }
        }
      }
      Aeroporto: {
        payload: Prisma.$AeroportoPayload<ExtArgs>
        fields: Prisma.AeroportoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AeroportoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AeroportoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          findFirst: {
            args: Prisma.AeroportoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AeroportoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          findMany: {
            args: Prisma.AeroportoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>[]
          }
          create: {
            args: Prisma.AeroportoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          createMany: {
            args: Prisma.AeroportoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AeroportoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>[]
          }
          delete: {
            args: Prisma.AeroportoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          update: {
            args: Prisma.AeroportoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          deleteMany: {
            args: Prisma.AeroportoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AeroportoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AeroportoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AeroportoPayload>
          }
          aggregate: {
            args: Prisma.AeroportoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAeroporto>
          }
          groupBy: {
            args: Prisma.AeroportoGroupByArgs<ExtArgs>
            result: $Utils.Optional<AeroportoGroupByOutputType>[]
          }
          count: {
            args: Prisma.AeroportoCountArgs<ExtArgs>
            result: $Utils.Optional<AeroportoCountAggregateOutputType> | number
          }
        }
      }
      Container: {
        payload: Prisma.$ContainerPayload<ExtArgs>
        fields: Prisma.ContainerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContainerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContainerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          findFirst: {
            args: Prisma.ContainerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContainerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          findMany: {
            args: Prisma.ContainerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>[]
          }
          create: {
            args: Prisma.ContainerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          createMany: {
            args: Prisma.ContainerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContainerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>[]
          }
          delete: {
            args: Prisma.ContainerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          update: {
            args: Prisma.ContainerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          deleteMany: {
            args: Prisma.ContainerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContainerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ContainerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerPayload>
          }
          aggregate: {
            args: Prisma.ContainerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContainer>
          }
          groupBy: {
            args: Prisma.ContainerGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContainerGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContainerCountArgs<ExtArgs>
            result: $Utils.Optional<ContainerCountAggregateOutputType> | number
          }
        }
      }
      NcmSync: {
        payload: Prisma.$NcmSyncPayload<ExtArgs>
        fields: Prisma.NcmSyncFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NcmSyncFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NcmSyncFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          findFirst: {
            args: Prisma.NcmSyncFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NcmSyncFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          findMany: {
            args: Prisma.NcmSyncFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>[]
          }
          create: {
            args: Prisma.NcmSyncCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          createMany: {
            args: Prisma.NcmSyncCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NcmSyncCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>[]
          }
          delete: {
            args: Prisma.NcmSyncDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          update: {
            args: Prisma.NcmSyncUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          deleteMany: {
            args: Prisma.NcmSyncDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NcmSyncUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NcmSyncUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncPayload>
          }
          aggregate: {
            args: Prisma.NcmSyncAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNcmSync>
          }
          groupBy: {
            args: Prisma.NcmSyncGroupByArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncGroupByOutputType>[]
          }
          count: {
            args: Prisma.NcmSyncCountArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncCountAggregateOutputType> | number
          }
        }
      }
      NcmSyncLog: {
        payload: Prisma.$NcmSyncLogPayload<ExtArgs>
        fields: Prisma.NcmSyncLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NcmSyncLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NcmSyncLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          findFirst: {
            args: Prisma.NcmSyncLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NcmSyncLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          findMany: {
            args: Prisma.NcmSyncLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>[]
          }
          create: {
            args: Prisma.NcmSyncLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          createMany: {
            args: Prisma.NcmSyncLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NcmSyncLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>[]
          }
          delete: {
            args: Prisma.NcmSyncLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          update: {
            args: Prisma.NcmSyncLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          deleteMany: {
            args: Prisma.NcmSyncLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NcmSyncLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NcmSyncLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncLogPayload>
          }
          aggregate: {
            args: Prisma.NcmSyncLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNcmSyncLog>
          }
          groupBy: {
            args: Prisma.NcmSyncLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.NcmSyncLogCountArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncLogCountAggregateOutputType> | number
          }
        }
      }
      NcmSyncAgendamento: {
        payload: Prisma.$NcmSyncAgendamentoPayload<ExtArgs>
        fields: Prisma.NcmSyncAgendamentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NcmSyncAgendamentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NcmSyncAgendamentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          findFirst: {
            args: Prisma.NcmSyncAgendamentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NcmSyncAgendamentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          findMany: {
            args: Prisma.NcmSyncAgendamentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>[]
          }
          create: {
            args: Prisma.NcmSyncAgendamentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          createMany: {
            args: Prisma.NcmSyncAgendamentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NcmSyncAgendamentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>[]
          }
          delete: {
            args: Prisma.NcmSyncAgendamentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          update: {
            args: Prisma.NcmSyncAgendamentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          deleteMany: {
            args: Prisma.NcmSyncAgendamentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NcmSyncAgendamentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NcmSyncAgendamentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NcmSyncAgendamentoPayload>
          }
          aggregate: {
            args: Prisma.NcmSyncAgendamentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNcmSyncAgendamento>
          }
          groupBy: {
            args: Prisma.NcmSyncAgendamentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncAgendamentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.NcmSyncAgendamentoCountArgs<ExtArgs>
            result: $Utils.Optional<NcmSyncAgendamentoCountAggregateOutputType> | number
          }
        }
      }
      Ope: {
        payload: Prisma.$OpePayload<ExtArgs>
        fields: Prisma.OpeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OpeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OpeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          findFirst: {
            args: Prisma.OpeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OpeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          findMany: {
            args: Prisma.OpeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>[]
          }
          create: {
            args: Prisma.OpeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          createMany: {
            args: Prisma.OpeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OpeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>[]
          }
          delete: {
            args: Prisma.OpeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          update: {
            args: Prisma.OpeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          deleteMany: {
            args: Prisma.OpeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OpeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OpeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpePayload>
          }
          aggregate: {
            args: Prisma.OpeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOpe>
          }
          groupBy: {
            args: Prisma.OpeGroupByArgs<ExtArgs>
            result: $Utils.Optional<OpeGroupByOutputType>[]
          }
          count: {
            args: Prisma.OpeCountArgs<ExtArgs>
            result: $Utils.Optional<OpeCountAggregateOutputType> | number
          }
        }
      }
      OPEHistoricoStatus: {
        payload: Prisma.$OPEHistoricoStatusPayload<ExtArgs>
        fields: Prisma.OPEHistoricoStatusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OPEHistoricoStatusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OPEHistoricoStatusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          findFirst: {
            args: Prisma.OPEHistoricoStatusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OPEHistoricoStatusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          findMany: {
            args: Prisma.OPEHistoricoStatusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>[]
          }
          create: {
            args: Prisma.OPEHistoricoStatusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          createMany: {
            args: Prisma.OPEHistoricoStatusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OPEHistoricoStatusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>[]
          }
          delete: {
            args: Prisma.OPEHistoricoStatusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          update: {
            args: Prisma.OPEHistoricoStatusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          deleteMany: {
            args: Prisma.OPEHistoricoStatusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OPEHistoricoStatusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OPEHistoricoStatusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEHistoricoStatusPayload>
          }
          aggregate: {
            args: Prisma.OPEHistoricoStatusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOPEHistoricoStatus>
          }
          groupBy: {
            args: Prisma.OPEHistoricoStatusGroupByArgs<ExtArgs>
            result: $Utils.Optional<OPEHistoricoStatusGroupByOutputType>[]
          }
          count: {
            args: Prisma.OPEHistoricoStatusCountArgs<ExtArgs>
            result: $Utils.Optional<OPEHistoricoStatusCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type FornecedorCountOutputType
   */

  export type FornecedorCountOutputType = {
    fornecedores_organizacao: number
  }

  export type FornecedorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fornecedores_organizacao?: boolean | FornecedorCountOutputTypeCountFornecedores_organizacaoArgs
  }

  // Custom InputTypes
  /**
   * FornecedorCountOutputType without action
   */
  export type FornecedorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorCountOutputType
     */
    select?: FornecedorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FornecedorCountOutputType without action
   */
  export type FornecedorCountOutputTypeCountFornecedores_organizacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FornecedorOrganizacaoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Fornecedor
   */

  export type AggregateFornecedor = {
    _count: FornecedorCountAggregateOutputType | null
    _min: FornecedorMinAggregateOutputType | null
    _max: FornecedorMaxAggregateOutputType | null
  }

  export type FornecedorMinAggregateOutputType = {
    id_fornecedor: string | null
    id_organizacao_cadastro_fornecedor: string | null
    id_produto_fornecedor: string | null
    id_usuario_cadastro_fornecedor: string | null
    nome_fornecedor: string | null
    cnpj_fornecedor: string | null
    tin_fornecedor: string | null
    pais_fornecedor: string | null
    estado_provincia_fornecedor: string | null
    cidade_fornecedor: string | null
    endereco_fornecedor: string | null
    cep_zipcode_fornecedor: string | null
    email_principal_fornecedor: string | null
    telefone_principal_fornecedor: string | null
    whatsapp_principal_fornecedor: string | null
    pode_ser_importador_fornecedor: boolean | null
    pode_ser_exportador_fornecedor: boolean | null
    pode_ser_fabricante_fornecedor: boolean | null
    pode_ser_agente_fornecedor: boolean | null
    pode_ser_despachante_fornecedor: boolean | null
    pode_ser_armador_fornecedor: boolean | null
    pode_ser_armazem_alfandegado_fornecedor: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean | null
    pode_ser_cia_aerea_fornecedor: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean | null
    pode_ser_seguradora_internacional_fornecedor: boolean | null
    pode_ser_seguradora_corretora_cambio_fornecedor: boolean | null
    pode_ser_banco_fornecedor: boolean | null
    pode_ser_armazem_nacional_fornecedor: boolean | null
    ativo_fornecedor: boolean | null
    criado_em_fornecedor: Date | null
    atualizado_em_fornecedor: Date | null
  }

  export type FornecedorMaxAggregateOutputType = {
    id_fornecedor: string | null
    id_organizacao_cadastro_fornecedor: string | null
    id_produto_fornecedor: string | null
    id_usuario_cadastro_fornecedor: string | null
    nome_fornecedor: string | null
    cnpj_fornecedor: string | null
    tin_fornecedor: string | null
    pais_fornecedor: string | null
    estado_provincia_fornecedor: string | null
    cidade_fornecedor: string | null
    endereco_fornecedor: string | null
    cep_zipcode_fornecedor: string | null
    email_principal_fornecedor: string | null
    telefone_principal_fornecedor: string | null
    whatsapp_principal_fornecedor: string | null
    pode_ser_importador_fornecedor: boolean | null
    pode_ser_exportador_fornecedor: boolean | null
    pode_ser_fabricante_fornecedor: boolean | null
    pode_ser_agente_fornecedor: boolean | null
    pode_ser_despachante_fornecedor: boolean | null
    pode_ser_armador_fornecedor: boolean | null
    pode_ser_armazem_alfandegado_fornecedor: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean | null
    pode_ser_cia_aerea_fornecedor: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean | null
    pode_ser_seguradora_internacional_fornecedor: boolean | null
    pode_ser_seguradora_corretora_cambio_fornecedor: boolean | null
    pode_ser_banco_fornecedor: boolean | null
    pode_ser_armazem_nacional_fornecedor: boolean | null
    ativo_fornecedor: boolean | null
    criado_em_fornecedor: Date | null
    atualizado_em_fornecedor: Date | null
  }

  export type FornecedorCountAggregateOutputType = {
    id_fornecedor: number
    id_organizacao_cadastro_fornecedor: number
    id_produto_fornecedor: number
    id_usuario_cadastro_fornecedor: number
    nome_fornecedor: number
    cnpj_fornecedor: number
    tin_fornecedor: number
    pais_fornecedor: number
    estado_provincia_fornecedor: number
    cidade_fornecedor: number
    endereco_fornecedor: number
    cep_zipcode_fornecedor: number
    email_principal_fornecedor: number
    telefone_principal_fornecedor: number
    whatsapp_principal_fornecedor: number
    pode_ser_importador_fornecedor: number
    pode_ser_exportador_fornecedor: number
    pode_ser_fabricante_fornecedor: number
    pode_ser_agente_fornecedor: number
    pode_ser_despachante_fornecedor: number
    pode_ser_armador_fornecedor: number
    pode_ser_armazem_alfandegado_fornecedor: number
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: number
    pode_ser_cia_aerea_fornecedor: number
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: number
    pode_ser_seguradora_internacional_fornecedor: number
    pode_ser_seguradora_corretora_cambio_fornecedor: number
    pode_ser_banco_fornecedor: number
    pode_ser_armazem_nacional_fornecedor: number
    ativo_fornecedor: number
    criado_em_fornecedor: number
    atualizado_em_fornecedor: number
    _all: number
  }


  export type FornecedorMinAggregateInputType = {
    id_fornecedor?: true
    id_organizacao_cadastro_fornecedor?: true
    id_produto_fornecedor?: true
    id_usuario_cadastro_fornecedor?: true
    nome_fornecedor?: true
    cnpj_fornecedor?: true
    tin_fornecedor?: true
    pais_fornecedor?: true
    estado_provincia_fornecedor?: true
    cidade_fornecedor?: true
    endereco_fornecedor?: true
    cep_zipcode_fornecedor?: true
    email_principal_fornecedor?: true
    telefone_principal_fornecedor?: true
    whatsapp_principal_fornecedor?: true
    pode_ser_importador_fornecedor?: true
    pode_ser_exportador_fornecedor?: true
    pode_ser_fabricante_fornecedor?: true
    pode_ser_agente_fornecedor?: true
    pode_ser_despachante_fornecedor?: true
    pode_ser_armador_fornecedor?: true
    pode_ser_armazem_alfandegado_fornecedor?: true
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: true
    pode_ser_cia_aerea_fornecedor?: true
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: true
    pode_ser_seguradora_internacional_fornecedor?: true
    pode_ser_seguradora_corretora_cambio_fornecedor?: true
    pode_ser_banco_fornecedor?: true
    pode_ser_armazem_nacional_fornecedor?: true
    ativo_fornecedor?: true
    criado_em_fornecedor?: true
    atualizado_em_fornecedor?: true
  }

  export type FornecedorMaxAggregateInputType = {
    id_fornecedor?: true
    id_organizacao_cadastro_fornecedor?: true
    id_produto_fornecedor?: true
    id_usuario_cadastro_fornecedor?: true
    nome_fornecedor?: true
    cnpj_fornecedor?: true
    tin_fornecedor?: true
    pais_fornecedor?: true
    estado_provincia_fornecedor?: true
    cidade_fornecedor?: true
    endereco_fornecedor?: true
    cep_zipcode_fornecedor?: true
    email_principal_fornecedor?: true
    telefone_principal_fornecedor?: true
    whatsapp_principal_fornecedor?: true
    pode_ser_importador_fornecedor?: true
    pode_ser_exportador_fornecedor?: true
    pode_ser_fabricante_fornecedor?: true
    pode_ser_agente_fornecedor?: true
    pode_ser_despachante_fornecedor?: true
    pode_ser_armador_fornecedor?: true
    pode_ser_armazem_alfandegado_fornecedor?: true
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: true
    pode_ser_cia_aerea_fornecedor?: true
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: true
    pode_ser_seguradora_internacional_fornecedor?: true
    pode_ser_seguradora_corretora_cambio_fornecedor?: true
    pode_ser_banco_fornecedor?: true
    pode_ser_armazem_nacional_fornecedor?: true
    ativo_fornecedor?: true
    criado_em_fornecedor?: true
    atualizado_em_fornecedor?: true
  }

  export type FornecedorCountAggregateInputType = {
    id_fornecedor?: true
    id_organizacao_cadastro_fornecedor?: true
    id_produto_fornecedor?: true
    id_usuario_cadastro_fornecedor?: true
    nome_fornecedor?: true
    cnpj_fornecedor?: true
    tin_fornecedor?: true
    pais_fornecedor?: true
    estado_provincia_fornecedor?: true
    cidade_fornecedor?: true
    endereco_fornecedor?: true
    cep_zipcode_fornecedor?: true
    email_principal_fornecedor?: true
    telefone_principal_fornecedor?: true
    whatsapp_principal_fornecedor?: true
    pode_ser_importador_fornecedor?: true
    pode_ser_exportador_fornecedor?: true
    pode_ser_fabricante_fornecedor?: true
    pode_ser_agente_fornecedor?: true
    pode_ser_despachante_fornecedor?: true
    pode_ser_armador_fornecedor?: true
    pode_ser_armazem_alfandegado_fornecedor?: true
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: true
    pode_ser_cia_aerea_fornecedor?: true
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: true
    pode_ser_seguradora_internacional_fornecedor?: true
    pode_ser_seguradora_corretora_cambio_fornecedor?: true
    pode_ser_banco_fornecedor?: true
    pode_ser_armazem_nacional_fornecedor?: true
    ativo_fornecedor?: true
    criado_em_fornecedor?: true
    atualizado_em_fornecedor?: true
    _all?: true
  }

  export type FornecedorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fornecedor to aggregate.
     */
    where?: FornecedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fornecedors to fetch.
     */
    orderBy?: FornecedorOrderByWithRelationInput | FornecedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FornecedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fornecedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fornecedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Fornecedors
    **/
    _count?: true | FornecedorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FornecedorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FornecedorMaxAggregateInputType
  }

  export type GetFornecedorAggregateType<T extends FornecedorAggregateArgs> = {
        [P in keyof T & keyof AggregateFornecedor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFornecedor[P]>
      : GetScalarType<T[P], AggregateFornecedor[P]>
  }




  export type FornecedorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FornecedorWhereInput
    orderBy?: FornecedorOrderByWithAggregationInput | FornecedorOrderByWithAggregationInput[]
    by: FornecedorScalarFieldEnum[] | FornecedorScalarFieldEnum
    having?: FornecedorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FornecedorCountAggregateInputType | true
    _min?: FornecedorMinAggregateInputType
    _max?: FornecedorMaxAggregateInputType
  }

  export type FornecedorGroupByOutputType = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor: string | null
    id_usuario_cadastro_fornecedor: string | null
    nome_fornecedor: string
    cnpj_fornecedor: string | null
    tin_fornecedor: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor: string | null
    cidade_fornecedor: string | null
    endereco_fornecedor: string | null
    cep_zipcode_fornecedor: string | null
    email_principal_fornecedor: string | null
    telefone_principal_fornecedor: string | null
    whatsapp_principal_fornecedor: string | null
    pode_ser_importador_fornecedor: boolean
    pode_ser_exportador_fornecedor: boolean
    pode_ser_fabricante_fornecedor: boolean
    pode_ser_agente_fornecedor: boolean
    pode_ser_despachante_fornecedor: boolean
    pode_ser_armador_fornecedor: boolean
    pode_ser_armazem_alfandegado_fornecedor: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
    pode_ser_cia_aerea_fornecedor: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
    pode_ser_seguradora_internacional_fornecedor: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor: boolean
    pode_ser_banco_fornecedor: boolean
    pode_ser_armazem_nacional_fornecedor: boolean
    ativo_fornecedor: boolean
    criado_em_fornecedor: Date
    atualizado_em_fornecedor: Date
    _count: FornecedorCountAggregateOutputType | null
    _min: FornecedorMinAggregateOutputType | null
    _max: FornecedorMaxAggregateOutputType | null
  }

  type GetFornecedorGroupByPayload<T extends FornecedorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FornecedorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FornecedorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FornecedorGroupByOutputType[P]>
            : GetScalarType<T[P], FornecedorGroupByOutputType[P]>
        }
      >
    >


  export type FornecedorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fornecedor?: boolean
    id_organizacao_cadastro_fornecedor?: boolean
    id_produto_fornecedor?: boolean
    id_usuario_cadastro_fornecedor?: boolean
    nome_fornecedor?: boolean
    cnpj_fornecedor?: boolean
    tin_fornecedor?: boolean
    pais_fornecedor?: boolean
    estado_provincia_fornecedor?: boolean
    cidade_fornecedor?: boolean
    endereco_fornecedor?: boolean
    cep_zipcode_fornecedor?: boolean
    email_principal_fornecedor?: boolean
    telefone_principal_fornecedor?: boolean
    whatsapp_principal_fornecedor?: boolean
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: boolean
    atualizado_em_fornecedor?: boolean
    fornecedores_organizacao?: boolean | Fornecedor$fornecedores_organizacaoArgs<ExtArgs>
    _count?: boolean | FornecedorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fornecedor"]>

  export type FornecedorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fornecedor?: boolean
    id_organizacao_cadastro_fornecedor?: boolean
    id_produto_fornecedor?: boolean
    id_usuario_cadastro_fornecedor?: boolean
    nome_fornecedor?: boolean
    cnpj_fornecedor?: boolean
    tin_fornecedor?: boolean
    pais_fornecedor?: boolean
    estado_provincia_fornecedor?: boolean
    cidade_fornecedor?: boolean
    endereco_fornecedor?: boolean
    cep_zipcode_fornecedor?: boolean
    email_principal_fornecedor?: boolean
    telefone_principal_fornecedor?: boolean
    whatsapp_principal_fornecedor?: boolean
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: boolean
    atualizado_em_fornecedor?: boolean
  }, ExtArgs["result"]["fornecedor"]>

  export type FornecedorSelectScalar = {
    id_fornecedor?: boolean
    id_organizacao_cadastro_fornecedor?: boolean
    id_produto_fornecedor?: boolean
    id_usuario_cadastro_fornecedor?: boolean
    nome_fornecedor?: boolean
    cnpj_fornecedor?: boolean
    tin_fornecedor?: boolean
    pais_fornecedor?: boolean
    estado_provincia_fornecedor?: boolean
    cidade_fornecedor?: boolean
    endereco_fornecedor?: boolean
    cep_zipcode_fornecedor?: boolean
    email_principal_fornecedor?: boolean
    telefone_principal_fornecedor?: boolean
    whatsapp_principal_fornecedor?: boolean
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: boolean
    atualizado_em_fornecedor?: boolean
  }

  export type FornecedorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fornecedores_organizacao?: boolean | Fornecedor$fornecedores_organizacaoArgs<ExtArgs>
    _count?: boolean | FornecedorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FornecedorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $FornecedorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Fornecedor"
    objects: {
      fornecedores_organizacao: Prisma.$FornecedorOrganizacaoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_fornecedor: string
      id_organizacao_cadastro_fornecedor: string
      id_produto_fornecedor: string | null
      id_usuario_cadastro_fornecedor: string | null
      nome_fornecedor: string
      cnpj_fornecedor: string | null
      tin_fornecedor: string | null
      pais_fornecedor: string
      estado_provincia_fornecedor: string | null
      cidade_fornecedor: string | null
      endereco_fornecedor: string | null
      cep_zipcode_fornecedor: string | null
      email_principal_fornecedor: string | null
      telefone_principal_fornecedor: string | null
      whatsapp_principal_fornecedor: string | null
      pode_ser_importador_fornecedor: boolean
      pode_ser_exportador_fornecedor: boolean
      pode_ser_fabricante_fornecedor: boolean
      pode_ser_agente_fornecedor: boolean
      pode_ser_despachante_fornecedor: boolean
      pode_ser_armador_fornecedor: boolean
      pode_ser_armazem_alfandegado_fornecedor: boolean
      pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
      pode_ser_cia_aerea_fornecedor: boolean
      pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
      pode_ser_seguradora_internacional_fornecedor: boolean
      pode_ser_seguradora_corretora_cambio_fornecedor: boolean
      pode_ser_banco_fornecedor: boolean
      pode_ser_armazem_nacional_fornecedor: boolean
      ativo_fornecedor: boolean
      criado_em_fornecedor: Date
      atualizado_em_fornecedor: Date
    }, ExtArgs["result"]["fornecedor"]>
    composites: {}
  }

  type FornecedorGetPayload<S extends boolean | null | undefined | FornecedorDefaultArgs> = $Result.GetResult<Prisma.$FornecedorPayload, S>

  type FornecedorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FornecedorFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FornecedorCountAggregateInputType | true
    }

  export interface FornecedorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Fornecedor'], meta: { name: 'Fornecedor' } }
    /**
     * Find zero or one Fornecedor that matches the filter.
     * @param {FornecedorFindUniqueArgs} args - Arguments to find a Fornecedor
     * @example
     * // Get one Fornecedor
     * const fornecedor = await prisma.fornecedor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FornecedorFindUniqueArgs>(args: SelectSubset<T, FornecedorFindUniqueArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Fornecedor that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FornecedorFindUniqueOrThrowArgs} args - Arguments to find a Fornecedor
     * @example
     * // Get one Fornecedor
     * const fornecedor = await prisma.fornecedor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FornecedorFindUniqueOrThrowArgs>(args: SelectSubset<T, FornecedorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Fornecedor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorFindFirstArgs} args - Arguments to find a Fornecedor
     * @example
     * // Get one Fornecedor
     * const fornecedor = await prisma.fornecedor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FornecedorFindFirstArgs>(args?: SelectSubset<T, FornecedorFindFirstArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Fornecedor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorFindFirstOrThrowArgs} args - Arguments to find a Fornecedor
     * @example
     * // Get one Fornecedor
     * const fornecedor = await prisma.fornecedor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FornecedorFindFirstOrThrowArgs>(args?: SelectSubset<T, FornecedorFindFirstOrThrowArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Fornecedors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Fornecedors
     * const fornecedors = await prisma.fornecedor.findMany()
     * 
     * // Get first 10 Fornecedors
     * const fornecedors = await prisma.fornecedor.findMany({ take: 10 })
     * 
     * // Only select the `id_fornecedor`
     * const fornecedorWithId_fornecedorOnly = await prisma.fornecedor.findMany({ select: { id_fornecedor: true } })
     * 
     */
    findMany<T extends FornecedorFindManyArgs>(args?: SelectSubset<T, FornecedorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Fornecedor.
     * @param {FornecedorCreateArgs} args - Arguments to create a Fornecedor.
     * @example
     * // Create one Fornecedor
     * const Fornecedor = await prisma.fornecedor.create({
     *   data: {
     *     // ... data to create a Fornecedor
     *   }
     * })
     * 
     */
    create<T extends FornecedorCreateArgs>(args: SelectSubset<T, FornecedorCreateArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Fornecedors.
     * @param {FornecedorCreateManyArgs} args - Arguments to create many Fornecedors.
     * @example
     * // Create many Fornecedors
     * const fornecedor = await prisma.fornecedor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FornecedorCreateManyArgs>(args?: SelectSubset<T, FornecedorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Fornecedors and returns the data saved in the database.
     * @param {FornecedorCreateManyAndReturnArgs} args - Arguments to create many Fornecedors.
     * @example
     * // Create many Fornecedors
     * const fornecedor = await prisma.fornecedor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Fornecedors and only return the `id_fornecedor`
     * const fornecedorWithId_fornecedorOnly = await prisma.fornecedor.createManyAndReturn({ 
     *   select: { id_fornecedor: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FornecedorCreateManyAndReturnArgs>(args?: SelectSubset<T, FornecedorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Fornecedor.
     * @param {FornecedorDeleteArgs} args - Arguments to delete one Fornecedor.
     * @example
     * // Delete one Fornecedor
     * const Fornecedor = await prisma.fornecedor.delete({
     *   where: {
     *     // ... filter to delete one Fornecedor
     *   }
     * })
     * 
     */
    delete<T extends FornecedorDeleteArgs>(args: SelectSubset<T, FornecedorDeleteArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Fornecedor.
     * @param {FornecedorUpdateArgs} args - Arguments to update one Fornecedor.
     * @example
     * // Update one Fornecedor
     * const fornecedor = await prisma.fornecedor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FornecedorUpdateArgs>(args: SelectSubset<T, FornecedorUpdateArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Fornecedors.
     * @param {FornecedorDeleteManyArgs} args - Arguments to filter Fornecedors to delete.
     * @example
     * // Delete a few Fornecedors
     * const { count } = await prisma.fornecedor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FornecedorDeleteManyArgs>(args?: SelectSubset<T, FornecedorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Fornecedors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Fornecedors
     * const fornecedor = await prisma.fornecedor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FornecedorUpdateManyArgs>(args: SelectSubset<T, FornecedorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Fornecedor.
     * @param {FornecedorUpsertArgs} args - Arguments to update or create a Fornecedor.
     * @example
     * // Update or create a Fornecedor
     * const fornecedor = await prisma.fornecedor.upsert({
     *   create: {
     *     // ... data to create a Fornecedor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Fornecedor we want to update
     *   }
     * })
     */
    upsert<T extends FornecedorUpsertArgs>(args: SelectSubset<T, FornecedorUpsertArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Fornecedors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorCountArgs} args - Arguments to filter Fornecedors to count.
     * @example
     * // Count the number of Fornecedors
     * const count = await prisma.fornecedor.count({
     *   where: {
     *     // ... the filter for the Fornecedors we want to count
     *   }
     * })
    **/
    count<T extends FornecedorCountArgs>(
      args?: Subset<T, FornecedorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FornecedorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Fornecedor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FornecedorAggregateArgs>(args: Subset<T, FornecedorAggregateArgs>): Prisma.PrismaPromise<GetFornecedorAggregateType<T>>

    /**
     * Group by Fornecedor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FornecedorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FornecedorGroupByArgs['orderBy'] }
        : { orderBy?: FornecedorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FornecedorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFornecedorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Fornecedor model
   */
  readonly fields: FornecedorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Fornecedor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FornecedorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    fornecedores_organizacao<T extends Fornecedor$fornecedores_organizacaoArgs<ExtArgs> = {}>(args?: Subset<T, Fornecedor$fornecedores_organizacaoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Fornecedor model
   */ 
  interface FornecedorFieldRefs {
    readonly id_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly id_organizacao_cadastro_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly id_produto_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly id_usuario_cadastro_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly nome_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly cnpj_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly tin_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly pais_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly estado_provincia_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly cidade_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly endereco_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly cep_zipcode_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly email_principal_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly telefone_principal_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly whatsapp_principal_fornecedor: FieldRef<"Fornecedor", 'String'>
    readonly pode_ser_importador_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_exportador_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_fabricante_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_agente_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_despachante_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_armador_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_armazem_alfandegado_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_nacional_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_cia_aerea_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_internacional_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_seguradora_internacional_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_seguradora_corretora_cambio_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_banco_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly pode_ser_armazem_nacional_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly ativo_fornecedor: FieldRef<"Fornecedor", 'Boolean'>
    readonly criado_em_fornecedor: FieldRef<"Fornecedor", 'DateTime'>
    readonly atualizado_em_fornecedor: FieldRef<"Fornecedor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Fornecedor findUnique
   */
  export type FornecedorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter, which Fornecedor to fetch.
     */
    where: FornecedorWhereUniqueInput
  }

  /**
   * Fornecedor findUniqueOrThrow
   */
  export type FornecedorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter, which Fornecedor to fetch.
     */
    where: FornecedorWhereUniqueInput
  }

  /**
   * Fornecedor findFirst
   */
  export type FornecedorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter, which Fornecedor to fetch.
     */
    where?: FornecedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fornecedors to fetch.
     */
    orderBy?: FornecedorOrderByWithRelationInput | FornecedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fornecedors.
     */
    cursor?: FornecedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fornecedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fornecedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fornecedors.
     */
    distinct?: FornecedorScalarFieldEnum | FornecedorScalarFieldEnum[]
  }

  /**
   * Fornecedor findFirstOrThrow
   */
  export type FornecedorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter, which Fornecedor to fetch.
     */
    where?: FornecedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fornecedors to fetch.
     */
    orderBy?: FornecedorOrderByWithRelationInput | FornecedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Fornecedors.
     */
    cursor?: FornecedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fornecedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fornecedors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Fornecedors.
     */
    distinct?: FornecedorScalarFieldEnum | FornecedorScalarFieldEnum[]
  }

  /**
   * Fornecedor findMany
   */
  export type FornecedorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter, which Fornecedors to fetch.
     */
    where?: FornecedorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Fornecedors to fetch.
     */
    orderBy?: FornecedorOrderByWithRelationInput | FornecedorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Fornecedors.
     */
    cursor?: FornecedorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Fornecedors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Fornecedors.
     */
    skip?: number
    distinct?: FornecedorScalarFieldEnum | FornecedorScalarFieldEnum[]
  }

  /**
   * Fornecedor create
   */
  export type FornecedorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * The data needed to create a Fornecedor.
     */
    data: XOR<FornecedorCreateInput, FornecedorUncheckedCreateInput>
  }

  /**
   * Fornecedor createMany
   */
  export type FornecedorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Fornecedors.
     */
    data: FornecedorCreateManyInput | FornecedorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Fornecedor createManyAndReturn
   */
  export type FornecedorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Fornecedors.
     */
    data: FornecedorCreateManyInput | FornecedorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Fornecedor update
   */
  export type FornecedorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * The data needed to update a Fornecedor.
     */
    data: XOR<FornecedorUpdateInput, FornecedorUncheckedUpdateInput>
    /**
     * Choose, which Fornecedor to update.
     */
    where: FornecedorWhereUniqueInput
  }

  /**
   * Fornecedor updateMany
   */
  export type FornecedorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Fornecedors.
     */
    data: XOR<FornecedorUpdateManyMutationInput, FornecedorUncheckedUpdateManyInput>
    /**
     * Filter which Fornecedors to update
     */
    where?: FornecedorWhereInput
  }

  /**
   * Fornecedor upsert
   */
  export type FornecedorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * The filter to search for the Fornecedor to update in case it exists.
     */
    where: FornecedorWhereUniqueInput
    /**
     * In case the Fornecedor found by the `where` argument doesn't exist, create a new Fornecedor with this data.
     */
    create: XOR<FornecedorCreateInput, FornecedorUncheckedCreateInput>
    /**
     * In case the Fornecedor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FornecedorUpdateInput, FornecedorUncheckedUpdateInput>
  }

  /**
   * Fornecedor delete
   */
  export type FornecedorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
    /**
     * Filter which Fornecedor to delete.
     */
    where: FornecedorWhereUniqueInput
  }

  /**
   * Fornecedor deleteMany
   */
  export type FornecedorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Fornecedors to delete
     */
    where?: FornecedorWhereInput
  }

  /**
   * Fornecedor.fornecedores_organizacao
   */
  export type Fornecedor$fornecedores_organizacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    where?: FornecedorOrganizacaoWhereInput
    orderBy?: FornecedorOrganizacaoOrderByWithRelationInput | FornecedorOrganizacaoOrderByWithRelationInput[]
    cursor?: FornecedorOrganizacaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FornecedorOrganizacaoScalarFieldEnum | FornecedorOrganizacaoScalarFieldEnum[]
  }

  /**
   * Fornecedor without action
   */
  export type FornecedorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Fornecedor
     */
    select?: FornecedorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorInclude<ExtArgs> | null
  }


  /**
   * Model FornecedorOrganizacao
   */

  export type AggregateFornecedorOrganizacao = {
    _count: FornecedorOrganizacaoCountAggregateOutputType | null
    _min: FornecedorOrganizacaoMinAggregateOutputType | null
    _max: FornecedorOrganizacaoMaxAggregateOutputType | null
  }

  export type FornecedorOrganizacaoMinAggregateOutputType = {
    id_fornecedor_organizacao: string | null
    id_fornecedor: string | null
    id_organizacao: string | null
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao | null
    status_fornecedor_organizacao: $Enums.StatusFornecedorOrganizacao | null
    id_usuario: string | null
    data_criacao_fornecedor_organizacao: Date | null
    data_atualizacao_fornecedor_organizacao: Date | null
  }

  export type FornecedorOrganizacaoMaxAggregateOutputType = {
    id_fornecedor_organizacao: string | null
    id_fornecedor: string | null
    id_organizacao: string | null
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao | null
    status_fornecedor_organizacao: $Enums.StatusFornecedorOrganizacao | null
    id_usuario: string | null
    data_criacao_fornecedor_organizacao: Date | null
    data_atualizacao_fornecedor_organizacao: Date | null
  }

  export type FornecedorOrganizacaoCountAggregateOutputType = {
    id_fornecedor_organizacao: number
    id_fornecedor: number
    id_organizacao: number
    tipo_fornecedor_organizacao: number
    status_fornecedor_organizacao: number
    id_usuario: number
    data_criacao_fornecedor_organizacao: number
    data_atualizacao_fornecedor_organizacao: number
    _all: number
  }


  export type FornecedorOrganizacaoMinAggregateInputType = {
    id_fornecedor_organizacao?: true
    id_fornecedor?: true
    id_organizacao?: true
    tipo_fornecedor_organizacao?: true
    status_fornecedor_organizacao?: true
    id_usuario?: true
    data_criacao_fornecedor_organizacao?: true
    data_atualizacao_fornecedor_organizacao?: true
  }

  export type FornecedorOrganizacaoMaxAggregateInputType = {
    id_fornecedor_organizacao?: true
    id_fornecedor?: true
    id_organizacao?: true
    tipo_fornecedor_organizacao?: true
    status_fornecedor_organizacao?: true
    id_usuario?: true
    data_criacao_fornecedor_organizacao?: true
    data_atualizacao_fornecedor_organizacao?: true
  }

  export type FornecedorOrganizacaoCountAggregateInputType = {
    id_fornecedor_organizacao?: true
    id_fornecedor?: true
    id_organizacao?: true
    tipo_fornecedor_organizacao?: true
    status_fornecedor_organizacao?: true
    id_usuario?: true
    data_criacao_fornecedor_organizacao?: true
    data_atualizacao_fornecedor_organizacao?: true
    _all?: true
  }

  export type FornecedorOrganizacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FornecedorOrganizacao to aggregate.
     */
    where?: FornecedorOrganizacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FornecedorOrganizacaos to fetch.
     */
    orderBy?: FornecedorOrganizacaoOrderByWithRelationInput | FornecedorOrganizacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FornecedorOrganizacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FornecedorOrganizacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FornecedorOrganizacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FornecedorOrganizacaos
    **/
    _count?: true | FornecedorOrganizacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FornecedorOrganizacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FornecedorOrganizacaoMaxAggregateInputType
  }

  export type GetFornecedorOrganizacaoAggregateType<T extends FornecedorOrganizacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateFornecedorOrganizacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFornecedorOrganizacao[P]>
      : GetScalarType<T[P], AggregateFornecedorOrganizacao[P]>
  }




  export type FornecedorOrganizacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FornecedorOrganizacaoWhereInput
    orderBy?: FornecedorOrganizacaoOrderByWithAggregationInput | FornecedorOrganizacaoOrderByWithAggregationInput[]
    by: FornecedorOrganizacaoScalarFieldEnum[] | FornecedorOrganizacaoScalarFieldEnum
    having?: FornecedorOrganizacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FornecedorOrganizacaoCountAggregateInputType | true
    _min?: FornecedorOrganizacaoMinAggregateInputType
    _max?: FornecedorOrganizacaoMaxAggregateInputType
  }

  export type FornecedorOrganizacaoGroupByOutputType = {
    id_fornecedor_organizacao: string
    id_fornecedor: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao: $Enums.StatusFornecedorOrganizacao
    id_usuario: string | null
    data_criacao_fornecedor_organizacao: Date
    data_atualizacao_fornecedor_organizacao: Date
    _count: FornecedorOrganizacaoCountAggregateOutputType | null
    _min: FornecedorOrganizacaoMinAggregateOutputType | null
    _max: FornecedorOrganizacaoMaxAggregateOutputType | null
  }

  type GetFornecedorOrganizacaoGroupByPayload<T extends FornecedorOrganizacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FornecedorOrganizacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FornecedorOrganizacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FornecedorOrganizacaoGroupByOutputType[P]>
            : GetScalarType<T[P], FornecedorOrganizacaoGroupByOutputType[P]>
        }
      >
    >


  export type FornecedorOrganizacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fornecedor_organizacao?: boolean
    id_fornecedor?: boolean
    id_organizacao?: boolean
    tipo_fornecedor_organizacao?: boolean
    status_fornecedor_organizacao?: boolean
    id_usuario?: boolean
    data_criacao_fornecedor_organizacao?: boolean
    data_atualizacao_fornecedor_organizacao?: boolean
    fornecedor?: boolean | FornecedorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fornecedorOrganizacao"]>

  export type FornecedorOrganizacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fornecedor_organizacao?: boolean
    id_fornecedor?: boolean
    id_organizacao?: boolean
    tipo_fornecedor_organizacao?: boolean
    status_fornecedor_organizacao?: boolean
    id_usuario?: boolean
    data_criacao_fornecedor_organizacao?: boolean
    data_atualizacao_fornecedor_organizacao?: boolean
    fornecedor?: boolean | FornecedorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fornecedorOrganizacao"]>

  export type FornecedorOrganizacaoSelectScalar = {
    id_fornecedor_organizacao?: boolean
    id_fornecedor?: boolean
    id_organizacao?: boolean
    tipo_fornecedor_organizacao?: boolean
    status_fornecedor_organizacao?: boolean
    id_usuario?: boolean
    data_criacao_fornecedor_organizacao?: boolean
    data_atualizacao_fornecedor_organizacao?: boolean
  }

  export type FornecedorOrganizacaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fornecedor?: boolean | FornecedorDefaultArgs<ExtArgs>
  }
  export type FornecedorOrganizacaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fornecedor?: boolean | FornecedorDefaultArgs<ExtArgs>
  }

  export type $FornecedorOrganizacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FornecedorOrganizacao"
    objects: {
      fornecedor: Prisma.$FornecedorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_fornecedor_organizacao: string
      id_fornecedor: string
      id_organizacao: string
      tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
      status_fornecedor_organizacao: $Enums.StatusFornecedorOrganizacao
      id_usuario: string | null
      data_criacao_fornecedor_organizacao: Date
      data_atualizacao_fornecedor_organizacao: Date
    }, ExtArgs["result"]["fornecedorOrganizacao"]>
    composites: {}
  }

  type FornecedorOrganizacaoGetPayload<S extends boolean | null | undefined | FornecedorOrganizacaoDefaultArgs> = $Result.GetResult<Prisma.$FornecedorOrganizacaoPayload, S>

  type FornecedorOrganizacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FornecedorOrganizacaoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FornecedorOrganizacaoCountAggregateInputType | true
    }

  export interface FornecedorOrganizacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FornecedorOrganizacao'], meta: { name: 'FornecedorOrganizacao' } }
    /**
     * Find zero or one FornecedorOrganizacao that matches the filter.
     * @param {FornecedorOrganizacaoFindUniqueArgs} args - Arguments to find a FornecedorOrganizacao
     * @example
     * // Get one FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FornecedorOrganizacaoFindUniqueArgs>(args: SelectSubset<T, FornecedorOrganizacaoFindUniqueArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FornecedorOrganizacao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FornecedorOrganizacaoFindUniqueOrThrowArgs} args - Arguments to find a FornecedorOrganizacao
     * @example
     * // Get one FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FornecedorOrganizacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, FornecedorOrganizacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FornecedorOrganizacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoFindFirstArgs} args - Arguments to find a FornecedorOrganizacao
     * @example
     * // Get one FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FornecedorOrganizacaoFindFirstArgs>(args?: SelectSubset<T, FornecedorOrganizacaoFindFirstArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FornecedorOrganizacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoFindFirstOrThrowArgs} args - Arguments to find a FornecedorOrganizacao
     * @example
     * // Get one FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FornecedorOrganizacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, FornecedorOrganizacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FornecedorOrganizacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FornecedorOrganizacaos
     * const fornecedorOrganizacaos = await prisma.fornecedorOrganizacao.findMany()
     * 
     * // Get first 10 FornecedorOrganizacaos
     * const fornecedorOrganizacaos = await prisma.fornecedorOrganizacao.findMany({ take: 10 })
     * 
     * // Only select the `id_fornecedor_organizacao`
     * const fornecedorOrganizacaoWithId_fornecedor_organizacaoOnly = await prisma.fornecedorOrganizacao.findMany({ select: { id_fornecedor_organizacao: true } })
     * 
     */
    findMany<T extends FornecedorOrganizacaoFindManyArgs>(args?: SelectSubset<T, FornecedorOrganizacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FornecedorOrganizacao.
     * @param {FornecedorOrganizacaoCreateArgs} args - Arguments to create a FornecedorOrganizacao.
     * @example
     * // Create one FornecedorOrganizacao
     * const FornecedorOrganizacao = await prisma.fornecedorOrganizacao.create({
     *   data: {
     *     // ... data to create a FornecedorOrganizacao
     *   }
     * })
     * 
     */
    create<T extends FornecedorOrganizacaoCreateArgs>(args: SelectSubset<T, FornecedorOrganizacaoCreateArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FornecedorOrganizacaos.
     * @param {FornecedorOrganizacaoCreateManyArgs} args - Arguments to create many FornecedorOrganizacaos.
     * @example
     * // Create many FornecedorOrganizacaos
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FornecedorOrganizacaoCreateManyArgs>(args?: SelectSubset<T, FornecedorOrganizacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FornecedorOrganizacaos and returns the data saved in the database.
     * @param {FornecedorOrganizacaoCreateManyAndReturnArgs} args - Arguments to create many FornecedorOrganizacaos.
     * @example
     * // Create many FornecedorOrganizacaos
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FornecedorOrganizacaos and only return the `id_fornecedor_organizacao`
     * const fornecedorOrganizacaoWithId_fornecedor_organizacaoOnly = await prisma.fornecedorOrganizacao.createManyAndReturn({ 
     *   select: { id_fornecedor_organizacao: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FornecedorOrganizacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, FornecedorOrganizacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FornecedorOrganizacao.
     * @param {FornecedorOrganizacaoDeleteArgs} args - Arguments to delete one FornecedorOrganizacao.
     * @example
     * // Delete one FornecedorOrganizacao
     * const FornecedorOrganizacao = await prisma.fornecedorOrganizacao.delete({
     *   where: {
     *     // ... filter to delete one FornecedorOrganizacao
     *   }
     * })
     * 
     */
    delete<T extends FornecedorOrganizacaoDeleteArgs>(args: SelectSubset<T, FornecedorOrganizacaoDeleteArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FornecedorOrganizacao.
     * @param {FornecedorOrganizacaoUpdateArgs} args - Arguments to update one FornecedorOrganizacao.
     * @example
     * // Update one FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FornecedorOrganizacaoUpdateArgs>(args: SelectSubset<T, FornecedorOrganizacaoUpdateArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FornecedorOrganizacaos.
     * @param {FornecedorOrganizacaoDeleteManyArgs} args - Arguments to filter FornecedorOrganizacaos to delete.
     * @example
     * // Delete a few FornecedorOrganizacaos
     * const { count } = await prisma.fornecedorOrganizacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FornecedorOrganizacaoDeleteManyArgs>(args?: SelectSubset<T, FornecedorOrganizacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FornecedorOrganizacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FornecedorOrganizacaos
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FornecedorOrganizacaoUpdateManyArgs>(args: SelectSubset<T, FornecedorOrganizacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FornecedorOrganizacao.
     * @param {FornecedorOrganizacaoUpsertArgs} args - Arguments to update or create a FornecedorOrganizacao.
     * @example
     * // Update or create a FornecedorOrganizacao
     * const fornecedorOrganizacao = await prisma.fornecedorOrganizacao.upsert({
     *   create: {
     *     // ... data to create a FornecedorOrganizacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FornecedorOrganizacao we want to update
     *   }
     * })
     */
    upsert<T extends FornecedorOrganizacaoUpsertArgs>(args: SelectSubset<T, FornecedorOrganizacaoUpsertArgs<ExtArgs>>): Prisma__FornecedorOrganizacaoClient<$Result.GetResult<Prisma.$FornecedorOrganizacaoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FornecedorOrganizacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoCountArgs} args - Arguments to filter FornecedorOrganizacaos to count.
     * @example
     * // Count the number of FornecedorOrganizacaos
     * const count = await prisma.fornecedorOrganizacao.count({
     *   where: {
     *     // ... the filter for the FornecedorOrganizacaos we want to count
     *   }
     * })
    **/
    count<T extends FornecedorOrganizacaoCountArgs>(
      args?: Subset<T, FornecedorOrganizacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FornecedorOrganizacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FornecedorOrganizacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FornecedorOrganizacaoAggregateArgs>(args: Subset<T, FornecedorOrganizacaoAggregateArgs>): Prisma.PrismaPromise<GetFornecedorOrganizacaoAggregateType<T>>

    /**
     * Group by FornecedorOrganizacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FornecedorOrganizacaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FornecedorOrganizacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FornecedorOrganizacaoGroupByArgs['orderBy'] }
        : { orderBy?: FornecedorOrganizacaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FornecedorOrganizacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFornecedorOrganizacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FornecedorOrganizacao model
   */
  readonly fields: FornecedorOrganizacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FornecedorOrganizacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FornecedorOrganizacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    fornecedor<T extends FornecedorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FornecedorDefaultArgs<ExtArgs>>): Prisma__FornecedorClient<$Result.GetResult<Prisma.$FornecedorPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FornecedorOrganizacao model
   */ 
  interface FornecedorOrganizacaoFieldRefs {
    readonly id_fornecedor_organizacao: FieldRef<"FornecedorOrganizacao", 'String'>
    readonly id_fornecedor: FieldRef<"FornecedorOrganizacao", 'String'>
    readonly id_organizacao: FieldRef<"FornecedorOrganizacao", 'String'>
    readonly tipo_fornecedor_organizacao: FieldRef<"FornecedorOrganizacao", 'TipoFornecedorOrganizacao'>
    readonly status_fornecedor_organizacao: FieldRef<"FornecedorOrganizacao", 'StatusFornecedorOrganizacao'>
    readonly id_usuario: FieldRef<"FornecedorOrganizacao", 'String'>
    readonly data_criacao_fornecedor_organizacao: FieldRef<"FornecedorOrganizacao", 'DateTime'>
    readonly data_atualizacao_fornecedor_organizacao: FieldRef<"FornecedorOrganizacao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FornecedorOrganizacao findUnique
   */
  export type FornecedorOrganizacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter, which FornecedorOrganizacao to fetch.
     */
    where: FornecedorOrganizacaoWhereUniqueInput
  }

  /**
   * FornecedorOrganizacao findUniqueOrThrow
   */
  export type FornecedorOrganizacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter, which FornecedorOrganizacao to fetch.
     */
    where: FornecedorOrganizacaoWhereUniqueInput
  }

  /**
   * FornecedorOrganizacao findFirst
   */
  export type FornecedorOrganizacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter, which FornecedorOrganizacao to fetch.
     */
    where?: FornecedorOrganizacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FornecedorOrganizacaos to fetch.
     */
    orderBy?: FornecedorOrganizacaoOrderByWithRelationInput | FornecedorOrganizacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FornecedorOrganizacaos.
     */
    cursor?: FornecedorOrganizacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FornecedorOrganizacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FornecedorOrganizacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FornecedorOrganizacaos.
     */
    distinct?: FornecedorOrganizacaoScalarFieldEnum | FornecedorOrganizacaoScalarFieldEnum[]
  }

  /**
   * FornecedorOrganizacao findFirstOrThrow
   */
  export type FornecedorOrganizacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter, which FornecedorOrganizacao to fetch.
     */
    where?: FornecedorOrganizacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FornecedorOrganizacaos to fetch.
     */
    orderBy?: FornecedorOrganizacaoOrderByWithRelationInput | FornecedorOrganizacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FornecedorOrganizacaos.
     */
    cursor?: FornecedorOrganizacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FornecedorOrganizacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FornecedorOrganizacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FornecedorOrganizacaos.
     */
    distinct?: FornecedorOrganizacaoScalarFieldEnum | FornecedorOrganizacaoScalarFieldEnum[]
  }

  /**
   * FornecedorOrganizacao findMany
   */
  export type FornecedorOrganizacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter, which FornecedorOrganizacaos to fetch.
     */
    where?: FornecedorOrganizacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FornecedorOrganizacaos to fetch.
     */
    orderBy?: FornecedorOrganizacaoOrderByWithRelationInput | FornecedorOrganizacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FornecedorOrganizacaos.
     */
    cursor?: FornecedorOrganizacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FornecedorOrganizacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FornecedorOrganizacaos.
     */
    skip?: number
    distinct?: FornecedorOrganizacaoScalarFieldEnum | FornecedorOrganizacaoScalarFieldEnum[]
  }

  /**
   * FornecedorOrganizacao create
   */
  export type FornecedorOrganizacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * The data needed to create a FornecedorOrganizacao.
     */
    data: XOR<FornecedorOrganizacaoCreateInput, FornecedorOrganizacaoUncheckedCreateInput>
  }

  /**
   * FornecedorOrganizacao createMany
   */
  export type FornecedorOrganizacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FornecedorOrganizacaos.
     */
    data: FornecedorOrganizacaoCreateManyInput | FornecedorOrganizacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FornecedorOrganizacao createManyAndReturn
   */
  export type FornecedorOrganizacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FornecedorOrganizacaos.
     */
    data: FornecedorOrganizacaoCreateManyInput | FornecedorOrganizacaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FornecedorOrganizacao update
   */
  export type FornecedorOrganizacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * The data needed to update a FornecedorOrganizacao.
     */
    data: XOR<FornecedorOrganizacaoUpdateInput, FornecedorOrganizacaoUncheckedUpdateInput>
    /**
     * Choose, which FornecedorOrganizacao to update.
     */
    where: FornecedorOrganizacaoWhereUniqueInput
  }

  /**
   * FornecedorOrganizacao updateMany
   */
  export type FornecedorOrganizacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FornecedorOrganizacaos.
     */
    data: XOR<FornecedorOrganizacaoUpdateManyMutationInput, FornecedorOrganizacaoUncheckedUpdateManyInput>
    /**
     * Filter which FornecedorOrganizacaos to update
     */
    where?: FornecedorOrganizacaoWhereInput
  }

  /**
   * FornecedorOrganizacao upsert
   */
  export type FornecedorOrganizacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * The filter to search for the FornecedorOrganizacao to update in case it exists.
     */
    where: FornecedorOrganizacaoWhereUniqueInput
    /**
     * In case the FornecedorOrganizacao found by the `where` argument doesn't exist, create a new FornecedorOrganizacao with this data.
     */
    create: XOR<FornecedorOrganizacaoCreateInput, FornecedorOrganizacaoUncheckedCreateInput>
    /**
     * In case the FornecedorOrganizacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FornecedorOrganizacaoUpdateInput, FornecedorOrganizacaoUncheckedUpdateInput>
  }

  /**
   * FornecedorOrganizacao delete
   */
  export type FornecedorOrganizacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
    /**
     * Filter which FornecedorOrganizacao to delete.
     */
    where: FornecedorOrganizacaoWhereUniqueInput
  }

  /**
   * FornecedorOrganizacao deleteMany
   */
  export type FornecedorOrganizacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FornecedorOrganizacaos to delete
     */
    where?: FornecedorOrganizacaoWhereInput
  }

  /**
   * FornecedorOrganizacao without action
   */
  export type FornecedorOrganizacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FornecedorOrganizacao
     */
    select?: FornecedorOrganizacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FornecedorOrganizacaoInclude<ExtArgs> | null
  }


  /**
   * Model Pais
   */

  export type AggregatePais = {
    _count: PaisCountAggregateOutputType | null
    _min: PaisMinAggregateOutputType | null
    _max: PaisMaxAggregateOutputType | null
  }

  export type PaisMinAggregateOutputType = {
    id_pais: string | null
    nome_pais_portugues: string | null
    nome_pais_ingles: string | null
    codigo_pais_portal_unico_siscomex: string | null
    codigo_pais_bacen_4: string | null
    codigo_pais_bacen_5: string | null
    codigo_pais_sped_nfe: string | null
    codigo_pais_sped_efd: string | null
    codigo_pais_iso_alpha2: string | null
    codigo_pais_iso_alpha3: string | null
    codigo_pais_iso_numerico: string | null
    ativo_pais: boolean | null
  }

  export type PaisMaxAggregateOutputType = {
    id_pais: string | null
    nome_pais_portugues: string | null
    nome_pais_ingles: string | null
    codigo_pais_portal_unico_siscomex: string | null
    codigo_pais_bacen_4: string | null
    codigo_pais_bacen_5: string | null
    codigo_pais_sped_nfe: string | null
    codigo_pais_sped_efd: string | null
    codigo_pais_iso_alpha2: string | null
    codigo_pais_iso_alpha3: string | null
    codigo_pais_iso_numerico: string | null
    ativo_pais: boolean | null
  }

  export type PaisCountAggregateOutputType = {
    id_pais: number
    nome_pais_portugues: number
    nome_pais_ingles: number
    codigo_pais_portal_unico_siscomex: number
    codigo_pais_bacen_4: number
    codigo_pais_bacen_5: number
    codigo_pais_sped_nfe: number
    codigo_pais_sped_efd: number
    codigo_pais_iso_alpha2: number
    codigo_pais_iso_alpha3: number
    codigo_pais_iso_numerico: number
    ativo_pais: number
    _all: number
  }


  export type PaisMinAggregateInputType = {
    id_pais?: true
    nome_pais_portugues?: true
    nome_pais_ingles?: true
    codigo_pais_portal_unico_siscomex?: true
    codigo_pais_bacen_4?: true
    codigo_pais_bacen_5?: true
    codigo_pais_sped_nfe?: true
    codigo_pais_sped_efd?: true
    codigo_pais_iso_alpha2?: true
    codigo_pais_iso_alpha3?: true
    codigo_pais_iso_numerico?: true
    ativo_pais?: true
  }

  export type PaisMaxAggregateInputType = {
    id_pais?: true
    nome_pais_portugues?: true
    nome_pais_ingles?: true
    codigo_pais_portal_unico_siscomex?: true
    codigo_pais_bacen_4?: true
    codigo_pais_bacen_5?: true
    codigo_pais_sped_nfe?: true
    codigo_pais_sped_efd?: true
    codigo_pais_iso_alpha2?: true
    codigo_pais_iso_alpha3?: true
    codigo_pais_iso_numerico?: true
    ativo_pais?: true
  }

  export type PaisCountAggregateInputType = {
    id_pais?: true
    nome_pais_portugues?: true
    nome_pais_ingles?: true
    codigo_pais_portal_unico_siscomex?: true
    codigo_pais_bacen_4?: true
    codigo_pais_bacen_5?: true
    codigo_pais_sped_nfe?: true
    codigo_pais_sped_efd?: true
    codigo_pais_iso_alpha2?: true
    codigo_pais_iso_alpha3?: true
    codigo_pais_iso_numerico?: true
    ativo_pais?: true
    _all?: true
  }

  export type PaisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pais to aggregate.
     */
    where?: PaisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pais to fetch.
     */
    orderBy?: PaisOrderByWithRelationInput | PaisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pais from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pais.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pais
    **/
    _count?: true | PaisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaisMaxAggregateInputType
  }

  export type GetPaisAggregateType<T extends PaisAggregateArgs> = {
        [P in keyof T & keyof AggregatePais]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePais[P]>
      : GetScalarType<T[P], AggregatePais[P]>
  }




  export type PaisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaisWhereInput
    orderBy?: PaisOrderByWithAggregationInput | PaisOrderByWithAggregationInput[]
    by: PaisScalarFieldEnum[] | PaisScalarFieldEnum
    having?: PaisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaisCountAggregateInputType | true
    _min?: PaisMinAggregateInputType
    _max?: PaisMaxAggregateInputType
  }

  export type PaisGroupByOutputType = {
    id_pais: string
    nome_pais_portugues: string
    nome_pais_ingles: string
    codigo_pais_portal_unico_siscomex: string | null
    codigo_pais_bacen_4: string | null
    codigo_pais_bacen_5: string | null
    codigo_pais_sped_nfe: string | null
    codigo_pais_sped_efd: string | null
    codigo_pais_iso_alpha2: string | null
    codigo_pais_iso_alpha3: string | null
    codigo_pais_iso_numerico: string | null
    ativo_pais: boolean
    _count: PaisCountAggregateOutputType | null
    _min: PaisMinAggregateOutputType | null
    _max: PaisMaxAggregateOutputType | null
  }

  type GetPaisGroupByPayload<T extends PaisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaisGroupByOutputType[P]>
            : GetScalarType<T[P], PaisGroupByOutputType[P]>
        }
      >
    >


  export type PaisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pais?: boolean
    nome_pais_portugues?: boolean
    nome_pais_ingles?: boolean
    codigo_pais_portal_unico_siscomex?: boolean
    codigo_pais_bacen_4?: boolean
    codigo_pais_bacen_5?: boolean
    codigo_pais_sped_nfe?: boolean
    codigo_pais_sped_efd?: boolean
    codigo_pais_iso_alpha2?: boolean
    codigo_pais_iso_alpha3?: boolean
    codigo_pais_iso_numerico?: boolean
    ativo_pais?: boolean
  }, ExtArgs["result"]["pais"]>

  export type PaisSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_pais?: boolean
    nome_pais_portugues?: boolean
    nome_pais_ingles?: boolean
    codigo_pais_portal_unico_siscomex?: boolean
    codigo_pais_bacen_4?: boolean
    codigo_pais_bacen_5?: boolean
    codigo_pais_sped_nfe?: boolean
    codigo_pais_sped_efd?: boolean
    codigo_pais_iso_alpha2?: boolean
    codigo_pais_iso_alpha3?: boolean
    codigo_pais_iso_numerico?: boolean
    ativo_pais?: boolean
  }, ExtArgs["result"]["pais"]>

  export type PaisSelectScalar = {
    id_pais?: boolean
    nome_pais_portugues?: boolean
    nome_pais_ingles?: boolean
    codigo_pais_portal_unico_siscomex?: boolean
    codigo_pais_bacen_4?: boolean
    codigo_pais_bacen_5?: boolean
    codigo_pais_sped_nfe?: boolean
    codigo_pais_sped_efd?: boolean
    codigo_pais_iso_alpha2?: boolean
    codigo_pais_iso_alpha3?: boolean
    codigo_pais_iso_numerico?: boolean
    ativo_pais?: boolean
  }


  export type $PaisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pais"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_pais: string
      nome_pais_portugues: string
      nome_pais_ingles: string
      codigo_pais_portal_unico_siscomex: string | null
      codigo_pais_bacen_4: string | null
      codigo_pais_bacen_5: string | null
      codigo_pais_sped_nfe: string | null
      codigo_pais_sped_efd: string | null
      codigo_pais_iso_alpha2: string | null
      codigo_pais_iso_alpha3: string | null
      codigo_pais_iso_numerico: string | null
      ativo_pais: boolean
    }, ExtArgs["result"]["pais"]>
    composites: {}
  }

  type PaisGetPayload<S extends boolean | null | undefined | PaisDefaultArgs> = $Result.GetResult<Prisma.$PaisPayload, S>

  type PaisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PaisFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PaisCountAggregateInputType | true
    }

  export interface PaisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pais'], meta: { name: 'Pais' } }
    /**
     * Find zero or one Pais that matches the filter.
     * @param {PaisFindUniqueArgs} args - Arguments to find a Pais
     * @example
     * // Get one Pais
     * const pais = await prisma.pais.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaisFindUniqueArgs>(args: SelectSubset<T, PaisFindUniqueArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Pais that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PaisFindUniqueOrThrowArgs} args - Arguments to find a Pais
     * @example
     * // Get one Pais
     * const pais = await prisma.pais.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaisFindUniqueOrThrowArgs>(args: SelectSubset<T, PaisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Pais that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisFindFirstArgs} args - Arguments to find a Pais
     * @example
     * // Get one Pais
     * const pais = await prisma.pais.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaisFindFirstArgs>(args?: SelectSubset<T, PaisFindFirstArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Pais that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisFindFirstOrThrowArgs} args - Arguments to find a Pais
     * @example
     * // Get one Pais
     * const pais = await prisma.pais.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaisFindFirstOrThrowArgs>(args?: SelectSubset<T, PaisFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Pais that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pais
     * const pais = await prisma.pais.findMany()
     * 
     * // Get first 10 Pais
     * const pais = await prisma.pais.findMany({ take: 10 })
     * 
     * // Only select the `id_pais`
     * const paisWithId_paisOnly = await prisma.pais.findMany({ select: { id_pais: true } })
     * 
     */
    findMany<T extends PaisFindManyArgs>(args?: SelectSubset<T, PaisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Pais.
     * @param {PaisCreateArgs} args - Arguments to create a Pais.
     * @example
     * // Create one Pais
     * const Pais = await prisma.pais.create({
     *   data: {
     *     // ... data to create a Pais
     *   }
     * })
     * 
     */
    create<T extends PaisCreateArgs>(args: SelectSubset<T, PaisCreateArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Pais.
     * @param {PaisCreateManyArgs} args - Arguments to create many Pais.
     * @example
     * // Create many Pais
     * const pais = await prisma.pais.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaisCreateManyArgs>(args?: SelectSubset<T, PaisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pais and returns the data saved in the database.
     * @param {PaisCreateManyAndReturnArgs} args - Arguments to create many Pais.
     * @example
     * // Create many Pais
     * const pais = await prisma.pais.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pais and only return the `id_pais`
     * const paisWithId_paisOnly = await prisma.pais.createManyAndReturn({ 
     *   select: { id_pais: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaisCreateManyAndReturnArgs>(args?: SelectSubset<T, PaisCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Pais.
     * @param {PaisDeleteArgs} args - Arguments to delete one Pais.
     * @example
     * // Delete one Pais
     * const Pais = await prisma.pais.delete({
     *   where: {
     *     // ... filter to delete one Pais
     *   }
     * })
     * 
     */
    delete<T extends PaisDeleteArgs>(args: SelectSubset<T, PaisDeleteArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Pais.
     * @param {PaisUpdateArgs} args - Arguments to update one Pais.
     * @example
     * // Update one Pais
     * const pais = await prisma.pais.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaisUpdateArgs>(args: SelectSubset<T, PaisUpdateArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Pais.
     * @param {PaisDeleteManyArgs} args - Arguments to filter Pais to delete.
     * @example
     * // Delete a few Pais
     * const { count } = await prisma.pais.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaisDeleteManyArgs>(args?: SelectSubset<T, PaisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pais.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pais
     * const pais = await prisma.pais.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaisUpdateManyArgs>(args: SelectSubset<T, PaisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Pais.
     * @param {PaisUpsertArgs} args - Arguments to update or create a Pais.
     * @example
     * // Update or create a Pais
     * const pais = await prisma.pais.upsert({
     *   create: {
     *     // ... data to create a Pais
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pais we want to update
     *   }
     * })
     */
    upsert<T extends PaisUpsertArgs>(args: SelectSubset<T, PaisUpsertArgs<ExtArgs>>): Prisma__PaisClient<$Result.GetResult<Prisma.$PaisPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Pais.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisCountArgs} args - Arguments to filter Pais to count.
     * @example
     * // Count the number of Pais
     * const count = await prisma.pais.count({
     *   where: {
     *     // ... the filter for the Pais we want to count
     *   }
     * })
    **/
    count<T extends PaisCountArgs>(
      args?: Subset<T, PaisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pais.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PaisAggregateArgs>(args: Subset<T, PaisAggregateArgs>): Prisma.PrismaPromise<GetPaisAggregateType<T>>

    /**
     * Group by Pais.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PaisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaisGroupByArgs['orderBy'] }
        : { orderBy?: PaisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PaisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pais model
   */
  readonly fields: PaisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pais.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pais model
   */ 
  interface PaisFieldRefs {
    readonly id_pais: FieldRef<"Pais", 'String'>
    readonly nome_pais_portugues: FieldRef<"Pais", 'String'>
    readonly nome_pais_ingles: FieldRef<"Pais", 'String'>
    readonly codigo_pais_portal_unico_siscomex: FieldRef<"Pais", 'String'>
    readonly codigo_pais_bacen_4: FieldRef<"Pais", 'String'>
    readonly codigo_pais_bacen_5: FieldRef<"Pais", 'String'>
    readonly codigo_pais_sped_nfe: FieldRef<"Pais", 'String'>
    readonly codigo_pais_sped_efd: FieldRef<"Pais", 'String'>
    readonly codigo_pais_iso_alpha2: FieldRef<"Pais", 'String'>
    readonly codigo_pais_iso_alpha3: FieldRef<"Pais", 'String'>
    readonly codigo_pais_iso_numerico: FieldRef<"Pais", 'String'>
    readonly ativo_pais: FieldRef<"Pais", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Pais findUnique
   */
  export type PaisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter, which Pais to fetch.
     */
    where: PaisWhereUniqueInput
  }

  /**
   * Pais findUniqueOrThrow
   */
  export type PaisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter, which Pais to fetch.
     */
    where: PaisWhereUniqueInput
  }

  /**
   * Pais findFirst
   */
  export type PaisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter, which Pais to fetch.
     */
    where?: PaisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pais to fetch.
     */
    orderBy?: PaisOrderByWithRelationInput | PaisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pais.
     */
    cursor?: PaisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pais from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pais.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pais.
     */
    distinct?: PaisScalarFieldEnum | PaisScalarFieldEnum[]
  }

  /**
   * Pais findFirstOrThrow
   */
  export type PaisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter, which Pais to fetch.
     */
    where?: PaisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pais to fetch.
     */
    orderBy?: PaisOrderByWithRelationInput | PaisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pais.
     */
    cursor?: PaisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pais from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pais.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pais.
     */
    distinct?: PaisScalarFieldEnum | PaisScalarFieldEnum[]
  }

  /**
   * Pais findMany
   */
  export type PaisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter, which Pais to fetch.
     */
    where?: PaisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pais to fetch.
     */
    orderBy?: PaisOrderByWithRelationInput | PaisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pais.
     */
    cursor?: PaisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pais from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pais.
     */
    skip?: number
    distinct?: PaisScalarFieldEnum | PaisScalarFieldEnum[]
  }

  /**
   * Pais create
   */
  export type PaisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * The data needed to create a Pais.
     */
    data: XOR<PaisCreateInput, PaisUncheckedCreateInput>
  }

  /**
   * Pais createMany
   */
  export type PaisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pais.
     */
    data: PaisCreateManyInput | PaisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pais createManyAndReturn
   */
  export type PaisCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Pais.
     */
    data: PaisCreateManyInput | PaisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pais update
   */
  export type PaisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * The data needed to update a Pais.
     */
    data: XOR<PaisUpdateInput, PaisUncheckedUpdateInput>
    /**
     * Choose, which Pais to update.
     */
    where: PaisWhereUniqueInput
  }

  /**
   * Pais updateMany
   */
  export type PaisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pais.
     */
    data: XOR<PaisUpdateManyMutationInput, PaisUncheckedUpdateManyInput>
    /**
     * Filter which Pais to update
     */
    where?: PaisWhereInput
  }

  /**
   * Pais upsert
   */
  export type PaisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * The filter to search for the Pais to update in case it exists.
     */
    where: PaisWhereUniqueInput
    /**
     * In case the Pais found by the `where` argument doesn't exist, create a new Pais with this data.
     */
    create: XOR<PaisCreateInput, PaisUncheckedCreateInput>
    /**
     * In case the Pais was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaisUpdateInput, PaisUncheckedUpdateInput>
  }

  /**
   * Pais delete
   */
  export type PaisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
    /**
     * Filter which Pais to delete.
     */
    where: PaisWhereUniqueInput
  }

  /**
   * Pais deleteMany
   */
  export type PaisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pais to delete
     */
    where?: PaisWhereInput
  }

  /**
   * Pais without action
   */
  export type PaisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pais
     */
    select?: PaisSelect<ExtArgs> | null
  }


  /**
   * Model Moeda
   */

  export type AggregateMoeda = {
    _count: MoedaCountAggregateOutputType | null
    _min: MoedaMinAggregateOutputType | null
    _max: MoedaMaxAggregateOutputType | null
  }

  export type MoedaMinAggregateOutputType = {
    codigo_moeda: string | null
    nome_moeda: string | null
    simbolo_moeda: string | null
    ativo_moeda: boolean | null
  }

  export type MoedaMaxAggregateOutputType = {
    codigo_moeda: string | null
    nome_moeda: string | null
    simbolo_moeda: string | null
    ativo_moeda: boolean | null
  }

  export type MoedaCountAggregateOutputType = {
    codigo_moeda: number
    nome_moeda: number
    simbolo_moeda: number
    ativo_moeda: number
    _all: number
  }


  export type MoedaMinAggregateInputType = {
    codigo_moeda?: true
    nome_moeda?: true
    simbolo_moeda?: true
    ativo_moeda?: true
  }

  export type MoedaMaxAggregateInputType = {
    codigo_moeda?: true
    nome_moeda?: true
    simbolo_moeda?: true
    ativo_moeda?: true
  }

  export type MoedaCountAggregateInputType = {
    codigo_moeda?: true
    nome_moeda?: true
    simbolo_moeda?: true
    ativo_moeda?: true
    _all?: true
  }

  export type MoedaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Moeda to aggregate.
     */
    where?: MoedaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Moedas to fetch.
     */
    orderBy?: MoedaOrderByWithRelationInput | MoedaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MoedaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Moedas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Moedas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Moedas
    **/
    _count?: true | MoedaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MoedaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MoedaMaxAggregateInputType
  }

  export type GetMoedaAggregateType<T extends MoedaAggregateArgs> = {
        [P in keyof T & keyof AggregateMoeda]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMoeda[P]>
      : GetScalarType<T[P], AggregateMoeda[P]>
  }




  export type MoedaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MoedaWhereInput
    orderBy?: MoedaOrderByWithAggregationInput | MoedaOrderByWithAggregationInput[]
    by: MoedaScalarFieldEnum[] | MoedaScalarFieldEnum
    having?: MoedaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MoedaCountAggregateInputType | true
    _min?: MoedaMinAggregateInputType
    _max?: MoedaMaxAggregateInputType
  }

  export type MoedaGroupByOutputType = {
    codigo_moeda: string
    nome_moeda: string
    simbolo_moeda: string
    ativo_moeda: boolean
    _count: MoedaCountAggregateOutputType | null
    _min: MoedaMinAggregateOutputType | null
    _max: MoedaMaxAggregateOutputType | null
  }

  type GetMoedaGroupByPayload<T extends MoedaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MoedaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MoedaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MoedaGroupByOutputType[P]>
            : GetScalarType<T[P], MoedaGroupByOutputType[P]>
        }
      >
    >


  export type MoedaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_moeda?: boolean
    nome_moeda?: boolean
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }, ExtArgs["result"]["moeda"]>

  export type MoedaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_moeda?: boolean
    nome_moeda?: boolean
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }, ExtArgs["result"]["moeda"]>

  export type MoedaSelectScalar = {
    codigo_moeda?: boolean
    nome_moeda?: boolean
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }


  export type $MoedaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Moeda"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_moeda: string
      nome_moeda: string
      simbolo_moeda: string
      ativo_moeda: boolean
    }, ExtArgs["result"]["moeda"]>
    composites: {}
  }

  type MoedaGetPayload<S extends boolean | null | undefined | MoedaDefaultArgs> = $Result.GetResult<Prisma.$MoedaPayload, S>

  type MoedaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MoedaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MoedaCountAggregateInputType | true
    }

  export interface MoedaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Moeda'], meta: { name: 'Moeda' } }
    /**
     * Find zero or one Moeda that matches the filter.
     * @param {MoedaFindUniqueArgs} args - Arguments to find a Moeda
     * @example
     * // Get one Moeda
     * const moeda = await prisma.moeda.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MoedaFindUniqueArgs>(args: SelectSubset<T, MoedaFindUniqueArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Moeda that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MoedaFindUniqueOrThrowArgs} args - Arguments to find a Moeda
     * @example
     * // Get one Moeda
     * const moeda = await prisma.moeda.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MoedaFindUniqueOrThrowArgs>(args: SelectSubset<T, MoedaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Moeda that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaFindFirstArgs} args - Arguments to find a Moeda
     * @example
     * // Get one Moeda
     * const moeda = await prisma.moeda.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MoedaFindFirstArgs>(args?: SelectSubset<T, MoedaFindFirstArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Moeda that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaFindFirstOrThrowArgs} args - Arguments to find a Moeda
     * @example
     * // Get one Moeda
     * const moeda = await prisma.moeda.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MoedaFindFirstOrThrowArgs>(args?: SelectSubset<T, MoedaFindFirstOrThrowArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Moedas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Moedas
     * const moedas = await prisma.moeda.findMany()
     * 
     * // Get first 10 Moedas
     * const moedas = await prisma.moeda.findMany({ take: 10 })
     * 
     * // Only select the `codigo_moeda`
     * const moedaWithCodigo_moedaOnly = await prisma.moeda.findMany({ select: { codigo_moeda: true } })
     * 
     */
    findMany<T extends MoedaFindManyArgs>(args?: SelectSubset<T, MoedaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Moeda.
     * @param {MoedaCreateArgs} args - Arguments to create a Moeda.
     * @example
     * // Create one Moeda
     * const Moeda = await prisma.moeda.create({
     *   data: {
     *     // ... data to create a Moeda
     *   }
     * })
     * 
     */
    create<T extends MoedaCreateArgs>(args: SelectSubset<T, MoedaCreateArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Moedas.
     * @param {MoedaCreateManyArgs} args - Arguments to create many Moedas.
     * @example
     * // Create many Moedas
     * const moeda = await prisma.moeda.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MoedaCreateManyArgs>(args?: SelectSubset<T, MoedaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Moedas and returns the data saved in the database.
     * @param {MoedaCreateManyAndReturnArgs} args - Arguments to create many Moedas.
     * @example
     * // Create many Moedas
     * const moeda = await prisma.moeda.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Moedas and only return the `codigo_moeda`
     * const moedaWithCodigo_moedaOnly = await prisma.moeda.createManyAndReturn({ 
     *   select: { codigo_moeda: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MoedaCreateManyAndReturnArgs>(args?: SelectSubset<T, MoedaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Moeda.
     * @param {MoedaDeleteArgs} args - Arguments to delete one Moeda.
     * @example
     * // Delete one Moeda
     * const Moeda = await prisma.moeda.delete({
     *   where: {
     *     // ... filter to delete one Moeda
     *   }
     * })
     * 
     */
    delete<T extends MoedaDeleteArgs>(args: SelectSubset<T, MoedaDeleteArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Moeda.
     * @param {MoedaUpdateArgs} args - Arguments to update one Moeda.
     * @example
     * // Update one Moeda
     * const moeda = await prisma.moeda.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MoedaUpdateArgs>(args: SelectSubset<T, MoedaUpdateArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Moedas.
     * @param {MoedaDeleteManyArgs} args - Arguments to filter Moedas to delete.
     * @example
     * // Delete a few Moedas
     * const { count } = await prisma.moeda.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MoedaDeleteManyArgs>(args?: SelectSubset<T, MoedaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Moedas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Moedas
     * const moeda = await prisma.moeda.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MoedaUpdateManyArgs>(args: SelectSubset<T, MoedaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Moeda.
     * @param {MoedaUpsertArgs} args - Arguments to update or create a Moeda.
     * @example
     * // Update or create a Moeda
     * const moeda = await prisma.moeda.upsert({
     *   create: {
     *     // ... data to create a Moeda
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Moeda we want to update
     *   }
     * })
     */
    upsert<T extends MoedaUpsertArgs>(args: SelectSubset<T, MoedaUpsertArgs<ExtArgs>>): Prisma__MoedaClient<$Result.GetResult<Prisma.$MoedaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Moedas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaCountArgs} args - Arguments to filter Moedas to count.
     * @example
     * // Count the number of Moedas
     * const count = await prisma.moeda.count({
     *   where: {
     *     // ... the filter for the Moedas we want to count
     *   }
     * })
    **/
    count<T extends MoedaCountArgs>(
      args?: Subset<T, MoedaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MoedaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Moeda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MoedaAggregateArgs>(args: Subset<T, MoedaAggregateArgs>): Prisma.PrismaPromise<GetMoedaAggregateType<T>>

    /**
     * Group by Moeda.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MoedaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MoedaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MoedaGroupByArgs['orderBy'] }
        : { orderBy?: MoedaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MoedaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMoedaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Moeda model
   */
  readonly fields: MoedaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Moeda.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MoedaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Moeda model
   */ 
  interface MoedaFieldRefs {
    readonly codigo_moeda: FieldRef<"Moeda", 'String'>
    readonly nome_moeda: FieldRef<"Moeda", 'String'>
    readonly simbolo_moeda: FieldRef<"Moeda", 'String'>
    readonly ativo_moeda: FieldRef<"Moeda", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Moeda findUnique
   */
  export type MoedaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter, which Moeda to fetch.
     */
    where: MoedaWhereUniqueInput
  }

  /**
   * Moeda findUniqueOrThrow
   */
  export type MoedaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter, which Moeda to fetch.
     */
    where: MoedaWhereUniqueInput
  }

  /**
   * Moeda findFirst
   */
  export type MoedaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter, which Moeda to fetch.
     */
    where?: MoedaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Moedas to fetch.
     */
    orderBy?: MoedaOrderByWithRelationInput | MoedaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Moedas.
     */
    cursor?: MoedaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Moedas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Moedas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Moedas.
     */
    distinct?: MoedaScalarFieldEnum | MoedaScalarFieldEnum[]
  }

  /**
   * Moeda findFirstOrThrow
   */
  export type MoedaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter, which Moeda to fetch.
     */
    where?: MoedaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Moedas to fetch.
     */
    orderBy?: MoedaOrderByWithRelationInput | MoedaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Moedas.
     */
    cursor?: MoedaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Moedas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Moedas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Moedas.
     */
    distinct?: MoedaScalarFieldEnum | MoedaScalarFieldEnum[]
  }

  /**
   * Moeda findMany
   */
  export type MoedaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter, which Moedas to fetch.
     */
    where?: MoedaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Moedas to fetch.
     */
    orderBy?: MoedaOrderByWithRelationInput | MoedaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Moedas.
     */
    cursor?: MoedaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Moedas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Moedas.
     */
    skip?: number
    distinct?: MoedaScalarFieldEnum | MoedaScalarFieldEnum[]
  }

  /**
   * Moeda create
   */
  export type MoedaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * The data needed to create a Moeda.
     */
    data: XOR<MoedaCreateInput, MoedaUncheckedCreateInput>
  }

  /**
   * Moeda createMany
   */
  export type MoedaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Moedas.
     */
    data: MoedaCreateManyInput | MoedaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Moeda createManyAndReturn
   */
  export type MoedaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Moedas.
     */
    data: MoedaCreateManyInput | MoedaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Moeda update
   */
  export type MoedaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * The data needed to update a Moeda.
     */
    data: XOR<MoedaUpdateInput, MoedaUncheckedUpdateInput>
    /**
     * Choose, which Moeda to update.
     */
    where: MoedaWhereUniqueInput
  }

  /**
   * Moeda updateMany
   */
  export type MoedaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Moedas.
     */
    data: XOR<MoedaUpdateManyMutationInput, MoedaUncheckedUpdateManyInput>
    /**
     * Filter which Moedas to update
     */
    where?: MoedaWhereInput
  }

  /**
   * Moeda upsert
   */
  export type MoedaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * The filter to search for the Moeda to update in case it exists.
     */
    where: MoedaWhereUniqueInput
    /**
     * In case the Moeda found by the `where` argument doesn't exist, create a new Moeda with this data.
     */
    create: XOR<MoedaCreateInput, MoedaUncheckedCreateInput>
    /**
     * In case the Moeda was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MoedaUpdateInput, MoedaUncheckedUpdateInput>
  }

  /**
   * Moeda delete
   */
  export type MoedaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
    /**
     * Filter which Moeda to delete.
     */
    where: MoedaWhereUniqueInput
  }

  /**
   * Moeda deleteMany
   */
  export type MoedaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Moedas to delete
     */
    where?: MoedaWhereInput
  }

  /**
   * Moeda without action
   */
  export type MoedaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Moeda
     */
    select?: MoedaSelect<ExtArgs> | null
  }


  /**
   * Model Unidade
   */

  export type AggregateUnidade = {
    _count: UnidadeCountAggregateOutputType | null
    _min: UnidadeMinAggregateOutputType | null
    _max: UnidadeMaxAggregateOutputType | null
  }

  export type UnidadeMinAggregateOutputType = {
    codigo_unidade: string | null
    nome_unidade: string | null
    tipo_unidade: string | null
    ativo_unidade: boolean | null
  }

  export type UnidadeMaxAggregateOutputType = {
    codigo_unidade: string | null
    nome_unidade: string | null
    tipo_unidade: string | null
    ativo_unidade: boolean | null
  }

  export type UnidadeCountAggregateOutputType = {
    codigo_unidade: number
    nome_unidade: number
    tipo_unidade: number
    ativo_unidade: number
    _all: number
  }


  export type UnidadeMinAggregateInputType = {
    codigo_unidade?: true
    nome_unidade?: true
    tipo_unidade?: true
    ativo_unidade?: true
  }

  export type UnidadeMaxAggregateInputType = {
    codigo_unidade?: true
    nome_unidade?: true
    tipo_unidade?: true
    ativo_unidade?: true
  }

  export type UnidadeCountAggregateInputType = {
    codigo_unidade?: true
    nome_unidade?: true
    tipo_unidade?: true
    ativo_unidade?: true
    _all?: true
  }

  export type UnidadeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Unidade to aggregate.
     */
    where?: UnidadeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Unidades to fetch.
     */
    orderBy?: UnidadeOrderByWithRelationInput | UnidadeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UnidadeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Unidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Unidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Unidades
    **/
    _count?: true | UnidadeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnidadeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnidadeMaxAggregateInputType
  }

  export type GetUnidadeAggregateType<T extends UnidadeAggregateArgs> = {
        [P in keyof T & keyof AggregateUnidade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnidade[P]>
      : GetScalarType<T[P], AggregateUnidade[P]>
  }




  export type UnidadeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnidadeWhereInput
    orderBy?: UnidadeOrderByWithAggregationInput | UnidadeOrderByWithAggregationInput[]
    by: UnidadeScalarFieldEnum[] | UnidadeScalarFieldEnum
    having?: UnidadeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnidadeCountAggregateInputType | true
    _min?: UnidadeMinAggregateInputType
    _max?: UnidadeMaxAggregateInputType
  }

  export type UnidadeGroupByOutputType = {
    codigo_unidade: string
    nome_unidade: string
    tipo_unidade: string
    ativo_unidade: boolean
    _count: UnidadeCountAggregateOutputType | null
    _min: UnidadeMinAggregateOutputType | null
    _max: UnidadeMaxAggregateOutputType | null
  }

  type GetUnidadeGroupByPayload<T extends UnidadeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UnidadeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnidadeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnidadeGroupByOutputType[P]>
            : GetScalarType<T[P], UnidadeGroupByOutputType[P]>
        }
      >
    >


  export type UnidadeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_unidade?: boolean
    nome_unidade?: boolean
    tipo_unidade?: boolean
    ativo_unidade?: boolean
  }, ExtArgs["result"]["unidade"]>

  export type UnidadeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_unidade?: boolean
    nome_unidade?: boolean
    tipo_unidade?: boolean
    ativo_unidade?: boolean
  }, ExtArgs["result"]["unidade"]>

  export type UnidadeSelectScalar = {
    codigo_unidade?: boolean
    nome_unidade?: boolean
    tipo_unidade?: boolean
    ativo_unidade?: boolean
  }


  export type $UnidadePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Unidade"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_unidade: string
      nome_unidade: string
      tipo_unidade: string
      ativo_unidade: boolean
    }, ExtArgs["result"]["unidade"]>
    composites: {}
  }

  type UnidadeGetPayload<S extends boolean | null | undefined | UnidadeDefaultArgs> = $Result.GetResult<Prisma.$UnidadePayload, S>

  type UnidadeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UnidadeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UnidadeCountAggregateInputType | true
    }

  export interface UnidadeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Unidade'], meta: { name: 'Unidade' } }
    /**
     * Find zero or one Unidade that matches the filter.
     * @param {UnidadeFindUniqueArgs} args - Arguments to find a Unidade
     * @example
     * // Get one Unidade
     * const unidade = await prisma.unidade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UnidadeFindUniqueArgs>(args: SelectSubset<T, UnidadeFindUniqueArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Unidade that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UnidadeFindUniqueOrThrowArgs} args - Arguments to find a Unidade
     * @example
     * // Get one Unidade
     * const unidade = await prisma.unidade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UnidadeFindUniqueOrThrowArgs>(args: SelectSubset<T, UnidadeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Unidade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeFindFirstArgs} args - Arguments to find a Unidade
     * @example
     * // Get one Unidade
     * const unidade = await prisma.unidade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UnidadeFindFirstArgs>(args?: SelectSubset<T, UnidadeFindFirstArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Unidade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeFindFirstOrThrowArgs} args - Arguments to find a Unidade
     * @example
     * // Get one Unidade
     * const unidade = await prisma.unidade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UnidadeFindFirstOrThrowArgs>(args?: SelectSubset<T, UnidadeFindFirstOrThrowArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Unidades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Unidades
     * const unidades = await prisma.unidade.findMany()
     * 
     * // Get first 10 Unidades
     * const unidades = await prisma.unidade.findMany({ take: 10 })
     * 
     * // Only select the `codigo_unidade`
     * const unidadeWithCodigo_unidadeOnly = await prisma.unidade.findMany({ select: { codigo_unidade: true } })
     * 
     */
    findMany<T extends UnidadeFindManyArgs>(args?: SelectSubset<T, UnidadeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Unidade.
     * @param {UnidadeCreateArgs} args - Arguments to create a Unidade.
     * @example
     * // Create one Unidade
     * const Unidade = await prisma.unidade.create({
     *   data: {
     *     // ... data to create a Unidade
     *   }
     * })
     * 
     */
    create<T extends UnidadeCreateArgs>(args: SelectSubset<T, UnidadeCreateArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Unidades.
     * @param {UnidadeCreateManyArgs} args - Arguments to create many Unidades.
     * @example
     * // Create many Unidades
     * const unidade = await prisma.unidade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UnidadeCreateManyArgs>(args?: SelectSubset<T, UnidadeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Unidades and returns the data saved in the database.
     * @param {UnidadeCreateManyAndReturnArgs} args - Arguments to create many Unidades.
     * @example
     * // Create many Unidades
     * const unidade = await prisma.unidade.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Unidades and only return the `codigo_unidade`
     * const unidadeWithCodigo_unidadeOnly = await prisma.unidade.createManyAndReturn({ 
     *   select: { codigo_unidade: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UnidadeCreateManyAndReturnArgs>(args?: SelectSubset<T, UnidadeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Unidade.
     * @param {UnidadeDeleteArgs} args - Arguments to delete one Unidade.
     * @example
     * // Delete one Unidade
     * const Unidade = await prisma.unidade.delete({
     *   where: {
     *     // ... filter to delete one Unidade
     *   }
     * })
     * 
     */
    delete<T extends UnidadeDeleteArgs>(args: SelectSubset<T, UnidadeDeleteArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Unidade.
     * @param {UnidadeUpdateArgs} args - Arguments to update one Unidade.
     * @example
     * // Update one Unidade
     * const unidade = await prisma.unidade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UnidadeUpdateArgs>(args: SelectSubset<T, UnidadeUpdateArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Unidades.
     * @param {UnidadeDeleteManyArgs} args - Arguments to filter Unidades to delete.
     * @example
     * // Delete a few Unidades
     * const { count } = await prisma.unidade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UnidadeDeleteManyArgs>(args?: SelectSubset<T, UnidadeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Unidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Unidades
     * const unidade = await prisma.unidade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UnidadeUpdateManyArgs>(args: SelectSubset<T, UnidadeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Unidade.
     * @param {UnidadeUpsertArgs} args - Arguments to update or create a Unidade.
     * @example
     * // Update or create a Unidade
     * const unidade = await prisma.unidade.upsert({
     *   create: {
     *     // ... data to create a Unidade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Unidade we want to update
     *   }
     * })
     */
    upsert<T extends UnidadeUpsertArgs>(args: SelectSubset<T, UnidadeUpsertArgs<ExtArgs>>): Prisma__UnidadeClient<$Result.GetResult<Prisma.$UnidadePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Unidades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeCountArgs} args - Arguments to filter Unidades to count.
     * @example
     * // Count the number of Unidades
     * const count = await prisma.unidade.count({
     *   where: {
     *     // ... the filter for the Unidades we want to count
     *   }
     * })
    **/
    count<T extends UnidadeCountArgs>(
      args?: Subset<T, UnidadeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnidadeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Unidade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnidadeAggregateArgs>(args: Subset<T, UnidadeAggregateArgs>): Prisma.PrismaPromise<GetUnidadeAggregateType<T>>

    /**
     * Group by Unidade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnidadeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnidadeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnidadeGroupByArgs['orderBy'] }
        : { orderBy?: UnidadeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnidadeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnidadeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Unidade model
   */
  readonly fields: UnidadeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Unidade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UnidadeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Unidade model
   */ 
  interface UnidadeFieldRefs {
    readonly codigo_unidade: FieldRef<"Unidade", 'String'>
    readonly nome_unidade: FieldRef<"Unidade", 'String'>
    readonly tipo_unidade: FieldRef<"Unidade", 'String'>
    readonly ativo_unidade: FieldRef<"Unidade", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Unidade findUnique
   */
  export type UnidadeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter, which Unidade to fetch.
     */
    where: UnidadeWhereUniqueInput
  }

  /**
   * Unidade findUniqueOrThrow
   */
  export type UnidadeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter, which Unidade to fetch.
     */
    where: UnidadeWhereUniqueInput
  }

  /**
   * Unidade findFirst
   */
  export type UnidadeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter, which Unidade to fetch.
     */
    where?: UnidadeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Unidades to fetch.
     */
    orderBy?: UnidadeOrderByWithRelationInput | UnidadeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Unidades.
     */
    cursor?: UnidadeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Unidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Unidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Unidades.
     */
    distinct?: UnidadeScalarFieldEnum | UnidadeScalarFieldEnum[]
  }

  /**
   * Unidade findFirstOrThrow
   */
  export type UnidadeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter, which Unidade to fetch.
     */
    where?: UnidadeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Unidades to fetch.
     */
    orderBy?: UnidadeOrderByWithRelationInput | UnidadeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Unidades.
     */
    cursor?: UnidadeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Unidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Unidades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Unidades.
     */
    distinct?: UnidadeScalarFieldEnum | UnidadeScalarFieldEnum[]
  }

  /**
   * Unidade findMany
   */
  export type UnidadeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter, which Unidades to fetch.
     */
    where?: UnidadeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Unidades to fetch.
     */
    orderBy?: UnidadeOrderByWithRelationInput | UnidadeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Unidades.
     */
    cursor?: UnidadeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Unidades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Unidades.
     */
    skip?: number
    distinct?: UnidadeScalarFieldEnum | UnidadeScalarFieldEnum[]
  }

  /**
   * Unidade create
   */
  export type UnidadeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * The data needed to create a Unidade.
     */
    data: XOR<UnidadeCreateInput, UnidadeUncheckedCreateInput>
  }

  /**
   * Unidade createMany
   */
  export type UnidadeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Unidades.
     */
    data: UnidadeCreateManyInput | UnidadeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Unidade createManyAndReturn
   */
  export type UnidadeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Unidades.
     */
    data: UnidadeCreateManyInput | UnidadeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Unidade update
   */
  export type UnidadeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * The data needed to update a Unidade.
     */
    data: XOR<UnidadeUpdateInput, UnidadeUncheckedUpdateInput>
    /**
     * Choose, which Unidade to update.
     */
    where: UnidadeWhereUniqueInput
  }

  /**
   * Unidade updateMany
   */
  export type UnidadeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Unidades.
     */
    data: XOR<UnidadeUpdateManyMutationInput, UnidadeUncheckedUpdateManyInput>
    /**
     * Filter which Unidades to update
     */
    where?: UnidadeWhereInput
  }

  /**
   * Unidade upsert
   */
  export type UnidadeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * The filter to search for the Unidade to update in case it exists.
     */
    where: UnidadeWhereUniqueInput
    /**
     * In case the Unidade found by the `where` argument doesn't exist, create a new Unidade with this data.
     */
    create: XOR<UnidadeCreateInput, UnidadeUncheckedCreateInput>
    /**
     * In case the Unidade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UnidadeUpdateInput, UnidadeUncheckedUpdateInput>
  }

  /**
   * Unidade delete
   */
  export type UnidadeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
    /**
     * Filter which Unidade to delete.
     */
    where: UnidadeWhereUniqueInput
  }

  /**
   * Unidade deleteMany
   */
  export type UnidadeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Unidades to delete
     */
    where?: UnidadeWhereInput
  }

  /**
   * Unidade without action
   */
  export type UnidadeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Unidade
     */
    select?: UnidadeSelect<ExtArgs> | null
  }


  /**
   * Model Incoterm
   */

  export type AggregateIncoterm = {
    _count: IncotermCountAggregateOutputType | null
    _min: IncotermMinAggregateOutputType | null
    _max: IncotermMaxAggregateOutputType | null
  }

  export type IncotermMinAggregateOutputType = {
    codigo_incoterm: string | null
    nome_incoterm: string | null
    descricao_incoterm: string | null
    modal_transporte: string | null
    versao_incoterm: string | null
    ativo_incoterm: boolean | null
  }

  export type IncotermMaxAggregateOutputType = {
    codigo_incoterm: string | null
    nome_incoterm: string | null
    descricao_incoterm: string | null
    modal_transporte: string | null
    versao_incoterm: string | null
    ativo_incoterm: boolean | null
  }

  export type IncotermCountAggregateOutputType = {
    codigo_incoterm: number
    nome_incoterm: number
    descricao_incoterm: number
    modal_transporte: number
    versao_incoterm: number
    ativo_incoterm: number
    _all: number
  }


  export type IncotermMinAggregateInputType = {
    codigo_incoterm?: true
    nome_incoterm?: true
    descricao_incoterm?: true
    modal_transporte?: true
    versao_incoterm?: true
    ativo_incoterm?: true
  }

  export type IncotermMaxAggregateInputType = {
    codigo_incoterm?: true
    nome_incoterm?: true
    descricao_incoterm?: true
    modal_transporte?: true
    versao_incoterm?: true
    ativo_incoterm?: true
  }

  export type IncotermCountAggregateInputType = {
    codigo_incoterm?: true
    nome_incoterm?: true
    descricao_incoterm?: true
    modal_transporte?: true
    versao_incoterm?: true
    ativo_incoterm?: true
    _all?: true
  }

  export type IncotermAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Incoterm to aggregate.
     */
    where?: IncotermWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incoterms to fetch.
     */
    orderBy?: IncotermOrderByWithRelationInput | IncotermOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IncotermWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incoterms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incoterms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Incoterms
    **/
    _count?: true | IncotermCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IncotermMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IncotermMaxAggregateInputType
  }

  export type GetIncotermAggregateType<T extends IncotermAggregateArgs> = {
        [P in keyof T & keyof AggregateIncoterm]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIncoterm[P]>
      : GetScalarType<T[P], AggregateIncoterm[P]>
  }




  export type IncotermGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IncotermWhereInput
    orderBy?: IncotermOrderByWithAggregationInput | IncotermOrderByWithAggregationInput[]
    by: IncotermScalarFieldEnum[] | IncotermScalarFieldEnum
    having?: IncotermScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IncotermCountAggregateInputType | true
    _min?: IncotermMinAggregateInputType
    _max?: IncotermMaxAggregateInputType
  }

  export type IncotermGroupByOutputType = {
    codigo_incoterm: string
    nome_incoterm: string
    descricao_incoterm: string | null
    modal_transporte: string
    versao_incoterm: string
    ativo_incoterm: boolean
    _count: IncotermCountAggregateOutputType | null
    _min: IncotermMinAggregateOutputType | null
    _max: IncotermMaxAggregateOutputType | null
  }

  type GetIncotermGroupByPayload<T extends IncotermGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IncotermGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IncotermGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IncotermGroupByOutputType[P]>
            : GetScalarType<T[P], IncotermGroupByOutputType[P]>
        }
      >
    >


  export type IncotermSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_incoterm?: boolean
    nome_incoterm?: boolean
    descricao_incoterm?: boolean
    modal_transporte?: boolean
    versao_incoterm?: boolean
    ativo_incoterm?: boolean
  }, ExtArgs["result"]["incoterm"]>

  export type IncotermSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_incoterm?: boolean
    nome_incoterm?: boolean
    descricao_incoterm?: boolean
    modal_transporte?: boolean
    versao_incoterm?: boolean
    ativo_incoterm?: boolean
  }, ExtArgs["result"]["incoterm"]>

  export type IncotermSelectScalar = {
    codigo_incoterm?: boolean
    nome_incoterm?: boolean
    descricao_incoterm?: boolean
    modal_transporte?: boolean
    versao_incoterm?: boolean
    ativo_incoterm?: boolean
  }


  export type $IncotermPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Incoterm"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_incoterm: string
      nome_incoterm: string
      descricao_incoterm: string | null
      modal_transporte: string
      versao_incoterm: string
      ativo_incoterm: boolean
    }, ExtArgs["result"]["incoterm"]>
    composites: {}
  }

  type IncotermGetPayload<S extends boolean | null | undefined | IncotermDefaultArgs> = $Result.GetResult<Prisma.$IncotermPayload, S>

  type IncotermCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IncotermFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IncotermCountAggregateInputType | true
    }

  export interface IncotermDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Incoterm'], meta: { name: 'Incoterm' } }
    /**
     * Find zero or one Incoterm that matches the filter.
     * @param {IncotermFindUniqueArgs} args - Arguments to find a Incoterm
     * @example
     * // Get one Incoterm
     * const incoterm = await prisma.incoterm.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IncotermFindUniqueArgs>(args: SelectSubset<T, IncotermFindUniqueArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Incoterm that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IncotermFindUniqueOrThrowArgs} args - Arguments to find a Incoterm
     * @example
     * // Get one Incoterm
     * const incoterm = await prisma.incoterm.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IncotermFindUniqueOrThrowArgs>(args: SelectSubset<T, IncotermFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Incoterm that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermFindFirstArgs} args - Arguments to find a Incoterm
     * @example
     * // Get one Incoterm
     * const incoterm = await prisma.incoterm.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IncotermFindFirstArgs>(args?: SelectSubset<T, IncotermFindFirstArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Incoterm that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermFindFirstOrThrowArgs} args - Arguments to find a Incoterm
     * @example
     * // Get one Incoterm
     * const incoterm = await prisma.incoterm.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IncotermFindFirstOrThrowArgs>(args?: SelectSubset<T, IncotermFindFirstOrThrowArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Incoterms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Incoterms
     * const incoterms = await prisma.incoterm.findMany()
     * 
     * // Get first 10 Incoterms
     * const incoterms = await prisma.incoterm.findMany({ take: 10 })
     * 
     * // Only select the `codigo_incoterm`
     * const incotermWithCodigo_incotermOnly = await prisma.incoterm.findMany({ select: { codigo_incoterm: true } })
     * 
     */
    findMany<T extends IncotermFindManyArgs>(args?: SelectSubset<T, IncotermFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Incoterm.
     * @param {IncotermCreateArgs} args - Arguments to create a Incoterm.
     * @example
     * // Create one Incoterm
     * const Incoterm = await prisma.incoterm.create({
     *   data: {
     *     // ... data to create a Incoterm
     *   }
     * })
     * 
     */
    create<T extends IncotermCreateArgs>(args: SelectSubset<T, IncotermCreateArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Incoterms.
     * @param {IncotermCreateManyArgs} args - Arguments to create many Incoterms.
     * @example
     * // Create many Incoterms
     * const incoterm = await prisma.incoterm.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IncotermCreateManyArgs>(args?: SelectSubset<T, IncotermCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Incoterms and returns the data saved in the database.
     * @param {IncotermCreateManyAndReturnArgs} args - Arguments to create many Incoterms.
     * @example
     * // Create many Incoterms
     * const incoterm = await prisma.incoterm.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Incoterms and only return the `codigo_incoterm`
     * const incotermWithCodigo_incotermOnly = await prisma.incoterm.createManyAndReturn({ 
     *   select: { codigo_incoterm: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IncotermCreateManyAndReturnArgs>(args?: SelectSubset<T, IncotermCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Incoterm.
     * @param {IncotermDeleteArgs} args - Arguments to delete one Incoterm.
     * @example
     * // Delete one Incoterm
     * const Incoterm = await prisma.incoterm.delete({
     *   where: {
     *     // ... filter to delete one Incoterm
     *   }
     * })
     * 
     */
    delete<T extends IncotermDeleteArgs>(args: SelectSubset<T, IncotermDeleteArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Incoterm.
     * @param {IncotermUpdateArgs} args - Arguments to update one Incoterm.
     * @example
     * // Update one Incoterm
     * const incoterm = await prisma.incoterm.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IncotermUpdateArgs>(args: SelectSubset<T, IncotermUpdateArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Incoterms.
     * @param {IncotermDeleteManyArgs} args - Arguments to filter Incoterms to delete.
     * @example
     * // Delete a few Incoterms
     * const { count } = await prisma.incoterm.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IncotermDeleteManyArgs>(args?: SelectSubset<T, IncotermDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Incoterms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Incoterms
     * const incoterm = await prisma.incoterm.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IncotermUpdateManyArgs>(args: SelectSubset<T, IncotermUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Incoterm.
     * @param {IncotermUpsertArgs} args - Arguments to update or create a Incoterm.
     * @example
     * // Update or create a Incoterm
     * const incoterm = await prisma.incoterm.upsert({
     *   create: {
     *     // ... data to create a Incoterm
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Incoterm we want to update
     *   }
     * })
     */
    upsert<T extends IncotermUpsertArgs>(args: SelectSubset<T, IncotermUpsertArgs<ExtArgs>>): Prisma__IncotermClient<$Result.GetResult<Prisma.$IncotermPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Incoterms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermCountArgs} args - Arguments to filter Incoterms to count.
     * @example
     * // Count the number of Incoterms
     * const count = await prisma.incoterm.count({
     *   where: {
     *     // ... the filter for the Incoterms we want to count
     *   }
     * })
    **/
    count<T extends IncotermCountArgs>(
      args?: Subset<T, IncotermCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IncotermCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Incoterm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IncotermAggregateArgs>(args: Subset<T, IncotermAggregateArgs>): Prisma.PrismaPromise<GetIncotermAggregateType<T>>

    /**
     * Group by Incoterm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IncotermGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IncotermGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IncotermGroupByArgs['orderBy'] }
        : { orderBy?: IncotermGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IncotermGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIncotermGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Incoterm model
   */
  readonly fields: IncotermFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Incoterm.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IncotermClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Incoterm model
   */ 
  interface IncotermFieldRefs {
    readonly codigo_incoterm: FieldRef<"Incoterm", 'String'>
    readonly nome_incoterm: FieldRef<"Incoterm", 'String'>
    readonly descricao_incoterm: FieldRef<"Incoterm", 'String'>
    readonly modal_transporte: FieldRef<"Incoterm", 'String'>
    readonly versao_incoterm: FieldRef<"Incoterm", 'String'>
    readonly ativo_incoterm: FieldRef<"Incoterm", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Incoterm findUnique
   */
  export type IncotermFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter, which Incoterm to fetch.
     */
    where: IncotermWhereUniqueInput
  }

  /**
   * Incoterm findUniqueOrThrow
   */
  export type IncotermFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter, which Incoterm to fetch.
     */
    where: IncotermWhereUniqueInput
  }

  /**
   * Incoterm findFirst
   */
  export type IncotermFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter, which Incoterm to fetch.
     */
    where?: IncotermWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incoterms to fetch.
     */
    orderBy?: IncotermOrderByWithRelationInput | IncotermOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incoterms.
     */
    cursor?: IncotermWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incoterms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incoterms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incoterms.
     */
    distinct?: IncotermScalarFieldEnum | IncotermScalarFieldEnum[]
  }

  /**
   * Incoterm findFirstOrThrow
   */
  export type IncotermFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter, which Incoterm to fetch.
     */
    where?: IncotermWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incoterms to fetch.
     */
    orderBy?: IncotermOrderByWithRelationInput | IncotermOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Incoterms.
     */
    cursor?: IncotermWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incoterms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incoterms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Incoterms.
     */
    distinct?: IncotermScalarFieldEnum | IncotermScalarFieldEnum[]
  }

  /**
   * Incoterm findMany
   */
  export type IncotermFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter, which Incoterms to fetch.
     */
    where?: IncotermWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Incoterms to fetch.
     */
    orderBy?: IncotermOrderByWithRelationInput | IncotermOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Incoterms.
     */
    cursor?: IncotermWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Incoterms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Incoterms.
     */
    skip?: number
    distinct?: IncotermScalarFieldEnum | IncotermScalarFieldEnum[]
  }

  /**
   * Incoterm create
   */
  export type IncotermCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * The data needed to create a Incoterm.
     */
    data: XOR<IncotermCreateInput, IncotermUncheckedCreateInput>
  }

  /**
   * Incoterm createMany
   */
  export type IncotermCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Incoterms.
     */
    data: IncotermCreateManyInput | IncotermCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Incoterm createManyAndReturn
   */
  export type IncotermCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Incoterms.
     */
    data: IncotermCreateManyInput | IncotermCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Incoterm update
   */
  export type IncotermUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * The data needed to update a Incoterm.
     */
    data: XOR<IncotermUpdateInput, IncotermUncheckedUpdateInput>
    /**
     * Choose, which Incoterm to update.
     */
    where: IncotermWhereUniqueInput
  }

  /**
   * Incoterm updateMany
   */
  export type IncotermUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Incoterms.
     */
    data: XOR<IncotermUpdateManyMutationInput, IncotermUncheckedUpdateManyInput>
    /**
     * Filter which Incoterms to update
     */
    where?: IncotermWhereInput
  }

  /**
   * Incoterm upsert
   */
  export type IncotermUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * The filter to search for the Incoterm to update in case it exists.
     */
    where: IncotermWhereUniqueInput
    /**
     * In case the Incoterm found by the `where` argument doesn't exist, create a new Incoterm with this data.
     */
    create: XOR<IncotermCreateInput, IncotermUncheckedCreateInput>
    /**
     * In case the Incoterm was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IncotermUpdateInput, IncotermUncheckedUpdateInput>
  }

  /**
   * Incoterm delete
   */
  export type IncotermDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
    /**
     * Filter which Incoterm to delete.
     */
    where: IncotermWhereUniqueInput
  }

  /**
   * Incoterm deleteMany
   */
  export type IncotermDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Incoterms to delete
     */
    where?: IncotermWhereInput
  }

  /**
   * Incoterm without action
   */
  export type IncotermDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Incoterm
     */
    select?: IncotermSelect<ExtArgs> | null
  }


  /**
   * Model Porto
   */

  export type AggregatePorto = {
    _count: PortoCountAggregateOutputType | null
    _avg: PortoAvgAggregateOutputType | null
    _sum: PortoSumAggregateOutputType | null
    _min: PortoMinAggregateOutputType | null
    _max: PortoMaxAggregateOutputType | null
  }

  export type PortoAvgAggregateOutputType = {
    latitude_porto: number | null
    longitude_porto: number | null
  }

  export type PortoSumAggregateOutputType = {
    latitude_porto: number | null
    longitude_porto: number | null
  }

  export type PortoMinAggregateOutputType = {
    id_porto: string | null
    codigo_unlocode_porto: string | null
    codigo_pais_porto: string | null
    codigo_local_porto: string | null
    nome_porto: string | null
    nome_ascii_porto: string | null
    subdivisao_porto: string | null
    latitude_porto: number | null
    longitude_porto: number | null
    codigo_iata_porto: string | null
    ativo_porto: boolean | null
  }

  export type PortoMaxAggregateOutputType = {
    id_porto: string | null
    codigo_unlocode_porto: string | null
    codigo_pais_porto: string | null
    codigo_local_porto: string | null
    nome_porto: string | null
    nome_ascii_porto: string | null
    subdivisao_porto: string | null
    latitude_porto: number | null
    longitude_porto: number | null
    codigo_iata_porto: string | null
    ativo_porto: boolean | null
  }

  export type PortoCountAggregateOutputType = {
    id_porto: number
    codigo_unlocode_porto: number
    codigo_pais_porto: number
    codigo_local_porto: number
    nome_porto: number
    nome_ascii_porto: number
    subdivisao_porto: number
    latitude_porto: number
    longitude_porto: number
    codigo_iata_porto: number
    ativo_porto: number
    _all: number
  }


  export type PortoAvgAggregateInputType = {
    latitude_porto?: true
    longitude_porto?: true
  }

  export type PortoSumAggregateInputType = {
    latitude_porto?: true
    longitude_porto?: true
  }

  export type PortoMinAggregateInputType = {
    id_porto?: true
    codigo_unlocode_porto?: true
    codigo_pais_porto?: true
    codigo_local_porto?: true
    nome_porto?: true
    nome_ascii_porto?: true
    subdivisao_porto?: true
    latitude_porto?: true
    longitude_porto?: true
    codigo_iata_porto?: true
    ativo_porto?: true
  }

  export type PortoMaxAggregateInputType = {
    id_porto?: true
    codigo_unlocode_porto?: true
    codigo_pais_porto?: true
    codigo_local_porto?: true
    nome_porto?: true
    nome_ascii_porto?: true
    subdivisao_porto?: true
    latitude_porto?: true
    longitude_porto?: true
    codigo_iata_porto?: true
    ativo_porto?: true
  }

  export type PortoCountAggregateInputType = {
    id_porto?: true
    codigo_unlocode_porto?: true
    codigo_pais_porto?: true
    codigo_local_porto?: true
    nome_porto?: true
    nome_ascii_porto?: true
    subdivisao_porto?: true
    latitude_porto?: true
    longitude_porto?: true
    codigo_iata_porto?: true
    ativo_porto?: true
    _all?: true
  }

  export type PortoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Porto to aggregate.
     */
    where?: PortoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portos to fetch.
     */
    orderBy?: PortoOrderByWithRelationInput | PortoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Portos
    **/
    _count?: true | PortoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PortoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PortoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortoMaxAggregateInputType
  }

  export type GetPortoAggregateType<T extends PortoAggregateArgs> = {
        [P in keyof T & keyof AggregatePorto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePorto[P]>
      : GetScalarType<T[P], AggregatePorto[P]>
  }




  export type PortoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortoWhereInput
    orderBy?: PortoOrderByWithAggregationInput | PortoOrderByWithAggregationInput[]
    by: PortoScalarFieldEnum[] | PortoScalarFieldEnum
    having?: PortoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortoCountAggregateInputType | true
    _avg?: PortoAvgAggregateInputType
    _sum?: PortoSumAggregateInputType
    _min?: PortoMinAggregateInputType
    _max?: PortoMaxAggregateInputType
  }

  export type PortoGroupByOutputType = {
    id_porto: string
    codigo_unlocode_porto: string
    codigo_pais_porto: string
    codigo_local_porto: string
    nome_porto: string
    nome_ascii_porto: string
    subdivisao_porto: string | null
    latitude_porto: number | null
    longitude_porto: number | null
    codigo_iata_porto: string | null
    ativo_porto: boolean
    _count: PortoCountAggregateOutputType | null
    _avg: PortoAvgAggregateOutputType | null
    _sum: PortoSumAggregateOutputType | null
    _min: PortoMinAggregateOutputType | null
    _max: PortoMaxAggregateOutputType | null
  }

  type GetPortoGroupByPayload<T extends PortoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortoGroupByOutputType[P]>
            : GetScalarType<T[P], PortoGroupByOutputType[P]>
        }
      >
    >


  export type PortoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_porto?: boolean
    codigo_unlocode_porto?: boolean
    codigo_pais_porto?: boolean
    codigo_local_porto?: boolean
    nome_porto?: boolean
    nome_ascii_porto?: boolean
    subdivisao_porto?: boolean
    latitude_porto?: boolean
    longitude_porto?: boolean
    codigo_iata_porto?: boolean
    ativo_porto?: boolean
  }, ExtArgs["result"]["porto"]>

  export type PortoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_porto?: boolean
    codigo_unlocode_porto?: boolean
    codigo_pais_porto?: boolean
    codigo_local_porto?: boolean
    nome_porto?: boolean
    nome_ascii_porto?: boolean
    subdivisao_porto?: boolean
    latitude_porto?: boolean
    longitude_porto?: boolean
    codigo_iata_porto?: boolean
    ativo_porto?: boolean
  }, ExtArgs["result"]["porto"]>

  export type PortoSelectScalar = {
    id_porto?: boolean
    codigo_unlocode_porto?: boolean
    codigo_pais_porto?: boolean
    codigo_local_porto?: boolean
    nome_porto?: boolean
    nome_ascii_porto?: boolean
    subdivisao_porto?: boolean
    latitude_porto?: boolean
    longitude_porto?: boolean
    codigo_iata_porto?: boolean
    ativo_porto?: boolean
  }


  export type $PortoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Porto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_porto: string
      codigo_unlocode_porto: string
      codigo_pais_porto: string
      codigo_local_porto: string
      nome_porto: string
      nome_ascii_porto: string
      subdivisao_porto: string | null
      latitude_porto: number | null
      longitude_porto: number | null
      codigo_iata_porto: string | null
      ativo_porto: boolean
    }, ExtArgs["result"]["porto"]>
    composites: {}
  }

  type PortoGetPayload<S extends boolean | null | undefined | PortoDefaultArgs> = $Result.GetResult<Prisma.$PortoPayload, S>

  type PortoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PortoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PortoCountAggregateInputType | true
    }

  export interface PortoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Porto'], meta: { name: 'Porto' } }
    /**
     * Find zero or one Porto that matches the filter.
     * @param {PortoFindUniqueArgs} args - Arguments to find a Porto
     * @example
     * // Get one Porto
     * const porto = await prisma.porto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortoFindUniqueArgs>(args: SelectSubset<T, PortoFindUniqueArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Porto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PortoFindUniqueOrThrowArgs} args - Arguments to find a Porto
     * @example
     * // Get one Porto
     * const porto = await prisma.porto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortoFindUniqueOrThrowArgs>(args: SelectSubset<T, PortoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Porto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoFindFirstArgs} args - Arguments to find a Porto
     * @example
     * // Get one Porto
     * const porto = await prisma.porto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortoFindFirstArgs>(args?: SelectSubset<T, PortoFindFirstArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Porto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoFindFirstOrThrowArgs} args - Arguments to find a Porto
     * @example
     * // Get one Porto
     * const porto = await prisma.porto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortoFindFirstOrThrowArgs>(args?: SelectSubset<T, PortoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Portos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Portos
     * const portos = await prisma.porto.findMany()
     * 
     * // Get first 10 Portos
     * const portos = await prisma.porto.findMany({ take: 10 })
     * 
     * // Only select the `id_porto`
     * const portoWithId_portoOnly = await prisma.porto.findMany({ select: { id_porto: true } })
     * 
     */
    findMany<T extends PortoFindManyArgs>(args?: SelectSubset<T, PortoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Porto.
     * @param {PortoCreateArgs} args - Arguments to create a Porto.
     * @example
     * // Create one Porto
     * const Porto = await prisma.porto.create({
     *   data: {
     *     // ... data to create a Porto
     *   }
     * })
     * 
     */
    create<T extends PortoCreateArgs>(args: SelectSubset<T, PortoCreateArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Portos.
     * @param {PortoCreateManyArgs} args - Arguments to create many Portos.
     * @example
     * // Create many Portos
     * const porto = await prisma.porto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortoCreateManyArgs>(args?: SelectSubset<T, PortoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Portos and returns the data saved in the database.
     * @param {PortoCreateManyAndReturnArgs} args - Arguments to create many Portos.
     * @example
     * // Create many Portos
     * const porto = await prisma.porto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Portos and only return the `id_porto`
     * const portoWithId_portoOnly = await prisma.porto.createManyAndReturn({ 
     *   select: { id_porto: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PortoCreateManyAndReturnArgs>(args?: SelectSubset<T, PortoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Porto.
     * @param {PortoDeleteArgs} args - Arguments to delete one Porto.
     * @example
     * // Delete one Porto
     * const Porto = await prisma.porto.delete({
     *   where: {
     *     // ... filter to delete one Porto
     *   }
     * })
     * 
     */
    delete<T extends PortoDeleteArgs>(args: SelectSubset<T, PortoDeleteArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Porto.
     * @param {PortoUpdateArgs} args - Arguments to update one Porto.
     * @example
     * // Update one Porto
     * const porto = await prisma.porto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortoUpdateArgs>(args: SelectSubset<T, PortoUpdateArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Portos.
     * @param {PortoDeleteManyArgs} args - Arguments to filter Portos to delete.
     * @example
     * // Delete a few Portos
     * const { count } = await prisma.porto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortoDeleteManyArgs>(args?: SelectSubset<T, PortoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Portos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Portos
     * const porto = await prisma.porto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortoUpdateManyArgs>(args: SelectSubset<T, PortoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Porto.
     * @param {PortoUpsertArgs} args - Arguments to update or create a Porto.
     * @example
     * // Update or create a Porto
     * const porto = await prisma.porto.upsert({
     *   create: {
     *     // ... data to create a Porto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Porto we want to update
     *   }
     * })
     */
    upsert<T extends PortoUpsertArgs>(args: SelectSubset<T, PortoUpsertArgs<ExtArgs>>): Prisma__PortoClient<$Result.GetResult<Prisma.$PortoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Portos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoCountArgs} args - Arguments to filter Portos to count.
     * @example
     * // Count the number of Portos
     * const count = await prisma.porto.count({
     *   where: {
     *     // ... the filter for the Portos we want to count
     *   }
     * })
    **/
    count<T extends PortoCountArgs>(
      args?: Subset<T, PortoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Porto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortoAggregateArgs>(args: Subset<T, PortoAggregateArgs>): Prisma.PrismaPromise<GetPortoAggregateType<T>>

    /**
     * Group by Porto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortoGroupByArgs['orderBy'] }
        : { orderBy?: PortoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Porto model
   */
  readonly fields: PortoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Porto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Porto model
   */ 
  interface PortoFieldRefs {
    readonly id_porto: FieldRef<"Porto", 'String'>
    readonly codigo_unlocode_porto: FieldRef<"Porto", 'String'>
    readonly codigo_pais_porto: FieldRef<"Porto", 'String'>
    readonly codigo_local_porto: FieldRef<"Porto", 'String'>
    readonly nome_porto: FieldRef<"Porto", 'String'>
    readonly nome_ascii_porto: FieldRef<"Porto", 'String'>
    readonly subdivisao_porto: FieldRef<"Porto", 'String'>
    readonly latitude_porto: FieldRef<"Porto", 'Float'>
    readonly longitude_porto: FieldRef<"Porto", 'Float'>
    readonly codigo_iata_porto: FieldRef<"Porto", 'String'>
    readonly ativo_porto: FieldRef<"Porto", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Porto findUnique
   */
  export type PortoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter, which Porto to fetch.
     */
    where: PortoWhereUniqueInput
  }

  /**
   * Porto findUniqueOrThrow
   */
  export type PortoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter, which Porto to fetch.
     */
    where: PortoWhereUniqueInput
  }

  /**
   * Porto findFirst
   */
  export type PortoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter, which Porto to fetch.
     */
    where?: PortoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portos to fetch.
     */
    orderBy?: PortoOrderByWithRelationInput | PortoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Portos.
     */
    cursor?: PortoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Portos.
     */
    distinct?: PortoScalarFieldEnum | PortoScalarFieldEnum[]
  }

  /**
   * Porto findFirstOrThrow
   */
  export type PortoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter, which Porto to fetch.
     */
    where?: PortoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portos to fetch.
     */
    orderBy?: PortoOrderByWithRelationInput | PortoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Portos.
     */
    cursor?: PortoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Portos.
     */
    distinct?: PortoScalarFieldEnum | PortoScalarFieldEnum[]
  }

  /**
   * Porto findMany
   */
  export type PortoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter, which Portos to fetch.
     */
    where?: PortoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Portos to fetch.
     */
    orderBy?: PortoOrderByWithRelationInput | PortoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Portos.
     */
    cursor?: PortoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Portos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Portos.
     */
    skip?: number
    distinct?: PortoScalarFieldEnum | PortoScalarFieldEnum[]
  }

  /**
   * Porto create
   */
  export type PortoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * The data needed to create a Porto.
     */
    data: XOR<PortoCreateInput, PortoUncheckedCreateInput>
  }

  /**
   * Porto createMany
   */
  export type PortoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Portos.
     */
    data: PortoCreateManyInput | PortoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Porto createManyAndReturn
   */
  export type PortoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Portos.
     */
    data: PortoCreateManyInput | PortoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Porto update
   */
  export type PortoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * The data needed to update a Porto.
     */
    data: XOR<PortoUpdateInput, PortoUncheckedUpdateInput>
    /**
     * Choose, which Porto to update.
     */
    where: PortoWhereUniqueInput
  }

  /**
   * Porto updateMany
   */
  export type PortoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Portos.
     */
    data: XOR<PortoUpdateManyMutationInput, PortoUncheckedUpdateManyInput>
    /**
     * Filter which Portos to update
     */
    where?: PortoWhereInput
  }

  /**
   * Porto upsert
   */
  export type PortoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * The filter to search for the Porto to update in case it exists.
     */
    where: PortoWhereUniqueInput
    /**
     * In case the Porto found by the `where` argument doesn't exist, create a new Porto with this data.
     */
    create: XOR<PortoCreateInput, PortoUncheckedCreateInput>
    /**
     * In case the Porto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortoUpdateInput, PortoUncheckedUpdateInput>
  }

  /**
   * Porto delete
   */
  export type PortoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
    /**
     * Filter which Porto to delete.
     */
    where: PortoWhereUniqueInput
  }

  /**
   * Porto deleteMany
   */
  export type PortoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Portos to delete
     */
    where?: PortoWhereInput
  }

  /**
   * Porto without action
   */
  export type PortoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Porto
     */
    select?: PortoSelect<ExtArgs> | null
  }


  /**
   * Model Aeroporto
   */

  export type AggregateAeroporto = {
    _count: AeroportoCountAggregateOutputType | null
    _avg: AeroportoAvgAggregateOutputType | null
    _sum: AeroportoSumAggregateOutputType | null
    _min: AeroportoMinAggregateOutputType | null
    _max: AeroportoMaxAggregateOutputType | null
  }

  export type AeroportoAvgAggregateOutputType = {
    latitude_aeroporto: number | null
    longitude_aeroporto: number | null
  }

  export type AeroportoSumAggregateOutputType = {
    latitude_aeroporto: number | null
    longitude_aeroporto: number | null
  }

  export type AeroportoMinAggregateOutputType = {
    id_aeroporto: string | null
    codigo_unlocode_aeroporto: string | null
    codigo_pais_aeroporto: string | null
    codigo_local_aeroporto: string | null
    nome_aeroporto: string | null
    nome_ascii_aeroporto: string | null
    subdivisao_aeroporto: string | null
    latitude_aeroporto: number | null
    longitude_aeroporto: number | null
    codigo_iata_aeroporto: string | null
    ativo_aeroporto: boolean | null
  }

  export type AeroportoMaxAggregateOutputType = {
    id_aeroporto: string | null
    codigo_unlocode_aeroporto: string | null
    codigo_pais_aeroporto: string | null
    codigo_local_aeroporto: string | null
    nome_aeroporto: string | null
    nome_ascii_aeroporto: string | null
    subdivisao_aeroporto: string | null
    latitude_aeroporto: number | null
    longitude_aeroporto: number | null
    codigo_iata_aeroporto: string | null
    ativo_aeroporto: boolean | null
  }

  export type AeroportoCountAggregateOutputType = {
    id_aeroporto: number
    codigo_unlocode_aeroporto: number
    codigo_pais_aeroporto: number
    codigo_local_aeroporto: number
    nome_aeroporto: number
    nome_ascii_aeroporto: number
    subdivisao_aeroporto: number
    latitude_aeroporto: number
    longitude_aeroporto: number
    codigo_iata_aeroporto: number
    ativo_aeroporto: number
    _all: number
  }


  export type AeroportoAvgAggregateInputType = {
    latitude_aeroporto?: true
    longitude_aeroporto?: true
  }

  export type AeroportoSumAggregateInputType = {
    latitude_aeroporto?: true
    longitude_aeroporto?: true
  }

  export type AeroportoMinAggregateInputType = {
    id_aeroporto?: true
    codigo_unlocode_aeroporto?: true
    codigo_pais_aeroporto?: true
    codigo_local_aeroporto?: true
    nome_aeroporto?: true
    nome_ascii_aeroporto?: true
    subdivisao_aeroporto?: true
    latitude_aeroporto?: true
    longitude_aeroporto?: true
    codigo_iata_aeroporto?: true
    ativo_aeroporto?: true
  }

  export type AeroportoMaxAggregateInputType = {
    id_aeroporto?: true
    codigo_unlocode_aeroporto?: true
    codigo_pais_aeroporto?: true
    codigo_local_aeroporto?: true
    nome_aeroporto?: true
    nome_ascii_aeroporto?: true
    subdivisao_aeroporto?: true
    latitude_aeroporto?: true
    longitude_aeroporto?: true
    codigo_iata_aeroporto?: true
    ativo_aeroporto?: true
  }

  export type AeroportoCountAggregateInputType = {
    id_aeroporto?: true
    codigo_unlocode_aeroporto?: true
    codigo_pais_aeroporto?: true
    codigo_local_aeroporto?: true
    nome_aeroporto?: true
    nome_ascii_aeroporto?: true
    subdivisao_aeroporto?: true
    latitude_aeroporto?: true
    longitude_aeroporto?: true
    codigo_iata_aeroporto?: true
    ativo_aeroporto?: true
    _all?: true
  }

  export type AeroportoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Aeroporto to aggregate.
     */
    where?: AeroportoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Aeroportos to fetch.
     */
    orderBy?: AeroportoOrderByWithRelationInput | AeroportoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AeroportoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Aeroportos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Aeroportos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Aeroportos
    **/
    _count?: true | AeroportoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AeroportoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AeroportoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AeroportoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AeroportoMaxAggregateInputType
  }

  export type GetAeroportoAggregateType<T extends AeroportoAggregateArgs> = {
        [P in keyof T & keyof AggregateAeroporto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAeroporto[P]>
      : GetScalarType<T[P], AggregateAeroporto[P]>
  }




  export type AeroportoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AeroportoWhereInput
    orderBy?: AeroportoOrderByWithAggregationInput | AeroportoOrderByWithAggregationInput[]
    by: AeroportoScalarFieldEnum[] | AeroportoScalarFieldEnum
    having?: AeroportoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AeroportoCountAggregateInputType | true
    _avg?: AeroportoAvgAggregateInputType
    _sum?: AeroportoSumAggregateInputType
    _min?: AeroportoMinAggregateInputType
    _max?: AeroportoMaxAggregateInputType
  }

  export type AeroportoGroupByOutputType = {
    id_aeroporto: string
    codigo_unlocode_aeroporto: string
    codigo_pais_aeroporto: string
    codigo_local_aeroporto: string
    nome_aeroporto: string
    nome_ascii_aeroporto: string
    subdivisao_aeroporto: string | null
    latitude_aeroporto: number | null
    longitude_aeroporto: number | null
    codigo_iata_aeroporto: string | null
    ativo_aeroporto: boolean
    _count: AeroportoCountAggregateOutputType | null
    _avg: AeroportoAvgAggregateOutputType | null
    _sum: AeroportoSumAggregateOutputType | null
    _min: AeroportoMinAggregateOutputType | null
    _max: AeroportoMaxAggregateOutputType | null
  }

  type GetAeroportoGroupByPayload<T extends AeroportoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AeroportoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AeroportoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AeroportoGroupByOutputType[P]>
            : GetScalarType<T[P], AeroportoGroupByOutputType[P]>
        }
      >
    >


  export type AeroportoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_aeroporto?: boolean
    codigo_unlocode_aeroporto?: boolean
    codigo_pais_aeroporto?: boolean
    codigo_local_aeroporto?: boolean
    nome_aeroporto?: boolean
    nome_ascii_aeroporto?: boolean
    subdivisao_aeroporto?: boolean
    latitude_aeroporto?: boolean
    longitude_aeroporto?: boolean
    codigo_iata_aeroporto?: boolean
    ativo_aeroporto?: boolean
  }, ExtArgs["result"]["aeroporto"]>

  export type AeroportoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_aeroporto?: boolean
    codigo_unlocode_aeroporto?: boolean
    codigo_pais_aeroporto?: boolean
    codigo_local_aeroporto?: boolean
    nome_aeroporto?: boolean
    nome_ascii_aeroporto?: boolean
    subdivisao_aeroporto?: boolean
    latitude_aeroporto?: boolean
    longitude_aeroporto?: boolean
    codigo_iata_aeroporto?: boolean
    ativo_aeroporto?: boolean
  }, ExtArgs["result"]["aeroporto"]>

  export type AeroportoSelectScalar = {
    id_aeroporto?: boolean
    codigo_unlocode_aeroporto?: boolean
    codigo_pais_aeroporto?: boolean
    codigo_local_aeroporto?: boolean
    nome_aeroporto?: boolean
    nome_ascii_aeroporto?: boolean
    subdivisao_aeroporto?: boolean
    latitude_aeroporto?: boolean
    longitude_aeroporto?: boolean
    codigo_iata_aeroporto?: boolean
    ativo_aeroporto?: boolean
  }


  export type $AeroportoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Aeroporto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_aeroporto: string
      codigo_unlocode_aeroporto: string
      codigo_pais_aeroporto: string
      codigo_local_aeroporto: string
      nome_aeroporto: string
      nome_ascii_aeroporto: string
      subdivisao_aeroporto: string | null
      latitude_aeroporto: number | null
      longitude_aeroporto: number | null
      codigo_iata_aeroporto: string | null
      ativo_aeroporto: boolean
    }, ExtArgs["result"]["aeroporto"]>
    composites: {}
  }

  type AeroportoGetPayload<S extends boolean | null | undefined | AeroportoDefaultArgs> = $Result.GetResult<Prisma.$AeroportoPayload, S>

  type AeroportoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AeroportoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AeroportoCountAggregateInputType | true
    }

  export interface AeroportoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Aeroporto'], meta: { name: 'Aeroporto' } }
    /**
     * Find zero or one Aeroporto that matches the filter.
     * @param {AeroportoFindUniqueArgs} args - Arguments to find a Aeroporto
     * @example
     * // Get one Aeroporto
     * const aeroporto = await prisma.aeroporto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AeroportoFindUniqueArgs>(args: SelectSubset<T, AeroportoFindUniqueArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Aeroporto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AeroportoFindUniqueOrThrowArgs} args - Arguments to find a Aeroporto
     * @example
     * // Get one Aeroporto
     * const aeroporto = await prisma.aeroporto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AeroportoFindUniqueOrThrowArgs>(args: SelectSubset<T, AeroportoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Aeroporto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoFindFirstArgs} args - Arguments to find a Aeroporto
     * @example
     * // Get one Aeroporto
     * const aeroporto = await prisma.aeroporto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AeroportoFindFirstArgs>(args?: SelectSubset<T, AeroportoFindFirstArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Aeroporto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoFindFirstOrThrowArgs} args - Arguments to find a Aeroporto
     * @example
     * // Get one Aeroporto
     * const aeroporto = await prisma.aeroporto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AeroportoFindFirstOrThrowArgs>(args?: SelectSubset<T, AeroportoFindFirstOrThrowArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Aeroportos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Aeroportos
     * const aeroportos = await prisma.aeroporto.findMany()
     * 
     * // Get first 10 Aeroportos
     * const aeroportos = await prisma.aeroporto.findMany({ take: 10 })
     * 
     * // Only select the `id_aeroporto`
     * const aeroportoWithId_aeroportoOnly = await prisma.aeroporto.findMany({ select: { id_aeroporto: true } })
     * 
     */
    findMany<T extends AeroportoFindManyArgs>(args?: SelectSubset<T, AeroportoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Aeroporto.
     * @param {AeroportoCreateArgs} args - Arguments to create a Aeroporto.
     * @example
     * // Create one Aeroporto
     * const Aeroporto = await prisma.aeroporto.create({
     *   data: {
     *     // ... data to create a Aeroporto
     *   }
     * })
     * 
     */
    create<T extends AeroportoCreateArgs>(args: SelectSubset<T, AeroportoCreateArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Aeroportos.
     * @param {AeroportoCreateManyArgs} args - Arguments to create many Aeroportos.
     * @example
     * // Create many Aeroportos
     * const aeroporto = await prisma.aeroporto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AeroportoCreateManyArgs>(args?: SelectSubset<T, AeroportoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Aeroportos and returns the data saved in the database.
     * @param {AeroportoCreateManyAndReturnArgs} args - Arguments to create many Aeroportos.
     * @example
     * // Create many Aeroportos
     * const aeroporto = await prisma.aeroporto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Aeroportos and only return the `id_aeroporto`
     * const aeroportoWithId_aeroportoOnly = await prisma.aeroporto.createManyAndReturn({ 
     *   select: { id_aeroporto: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AeroportoCreateManyAndReturnArgs>(args?: SelectSubset<T, AeroportoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Aeroporto.
     * @param {AeroportoDeleteArgs} args - Arguments to delete one Aeroporto.
     * @example
     * // Delete one Aeroporto
     * const Aeroporto = await prisma.aeroporto.delete({
     *   where: {
     *     // ... filter to delete one Aeroporto
     *   }
     * })
     * 
     */
    delete<T extends AeroportoDeleteArgs>(args: SelectSubset<T, AeroportoDeleteArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Aeroporto.
     * @param {AeroportoUpdateArgs} args - Arguments to update one Aeroporto.
     * @example
     * // Update one Aeroporto
     * const aeroporto = await prisma.aeroporto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AeroportoUpdateArgs>(args: SelectSubset<T, AeroportoUpdateArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Aeroportos.
     * @param {AeroportoDeleteManyArgs} args - Arguments to filter Aeroportos to delete.
     * @example
     * // Delete a few Aeroportos
     * const { count } = await prisma.aeroporto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AeroportoDeleteManyArgs>(args?: SelectSubset<T, AeroportoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Aeroportos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Aeroportos
     * const aeroporto = await prisma.aeroporto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AeroportoUpdateManyArgs>(args: SelectSubset<T, AeroportoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Aeroporto.
     * @param {AeroportoUpsertArgs} args - Arguments to update or create a Aeroporto.
     * @example
     * // Update or create a Aeroporto
     * const aeroporto = await prisma.aeroporto.upsert({
     *   create: {
     *     // ... data to create a Aeroporto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Aeroporto we want to update
     *   }
     * })
     */
    upsert<T extends AeroportoUpsertArgs>(args: SelectSubset<T, AeroportoUpsertArgs<ExtArgs>>): Prisma__AeroportoClient<$Result.GetResult<Prisma.$AeroportoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Aeroportos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoCountArgs} args - Arguments to filter Aeroportos to count.
     * @example
     * // Count the number of Aeroportos
     * const count = await prisma.aeroporto.count({
     *   where: {
     *     // ... the filter for the Aeroportos we want to count
     *   }
     * })
    **/
    count<T extends AeroportoCountArgs>(
      args?: Subset<T, AeroportoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AeroportoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Aeroporto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AeroportoAggregateArgs>(args: Subset<T, AeroportoAggregateArgs>): Prisma.PrismaPromise<GetAeroportoAggregateType<T>>

    /**
     * Group by Aeroporto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AeroportoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AeroportoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AeroportoGroupByArgs['orderBy'] }
        : { orderBy?: AeroportoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AeroportoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAeroportoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Aeroporto model
   */
  readonly fields: AeroportoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Aeroporto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AeroportoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Aeroporto model
   */ 
  interface AeroportoFieldRefs {
    readonly id_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly codigo_unlocode_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly codigo_pais_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly codigo_local_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly nome_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly nome_ascii_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly subdivisao_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly latitude_aeroporto: FieldRef<"Aeroporto", 'Float'>
    readonly longitude_aeroporto: FieldRef<"Aeroporto", 'Float'>
    readonly codigo_iata_aeroporto: FieldRef<"Aeroporto", 'String'>
    readonly ativo_aeroporto: FieldRef<"Aeroporto", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Aeroporto findUnique
   */
  export type AeroportoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter, which Aeroporto to fetch.
     */
    where: AeroportoWhereUniqueInput
  }

  /**
   * Aeroporto findUniqueOrThrow
   */
  export type AeroportoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter, which Aeroporto to fetch.
     */
    where: AeroportoWhereUniqueInput
  }

  /**
   * Aeroporto findFirst
   */
  export type AeroportoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter, which Aeroporto to fetch.
     */
    where?: AeroportoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Aeroportos to fetch.
     */
    orderBy?: AeroportoOrderByWithRelationInput | AeroportoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Aeroportos.
     */
    cursor?: AeroportoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Aeroportos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Aeroportos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Aeroportos.
     */
    distinct?: AeroportoScalarFieldEnum | AeroportoScalarFieldEnum[]
  }

  /**
   * Aeroporto findFirstOrThrow
   */
  export type AeroportoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter, which Aeroporto to fetch.
     */
    where?: AeroportoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Aeroportos to fetch.
     */
    orderBy?: AeroportoOrderByWithRelationInput | AeroportoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Aeroportos.
     */
    cursor?: AeroportoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Aeroportos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Aeroportos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Aeroportos.
     */
    distinct?: AeroportoScalarFieldEnum | AeroportoScalarFieldEnum[]
  }

  /**
   * Aeroporto findMany
   */
  export type AeroportoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter, which Aeroportos to fetch.
     */
    where?: AeroportoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Aeroportos to fetch.
     */
    orderBy?: AeroportoOrderByWithRelationInput | AeroportoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Aeroportos.
     */
    cursor?: AeroportoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Aeroportos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Aeroportos.
     */
    skip?: number
    distinct?: AeroportoScalarFieldEnum | AeroportoScalarFieldEnum[]
  }

  /**
   * Aeroporto create
   */
  export type AeroportoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * The data needed to create a Aeroporto.
     */
    data: XOR<AeroportoCreateInput, AeroportoUncheckedCreateInput>
  }

  /**
   * Aeroporto createMany
   */
  export type AeroportoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Aeroportos.
     */
    data: AeroportoCreateManyInput | AeroportoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Aeroporto createManyAndReturn
   */
  export type AeroportoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Aeroportos.
     */
    data: AeroportoCreateManyInput | AeroportoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Aeroporto update
   */
  export type AeroportoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * The data needed to update a Aeroporto.
     */
    data: XOR<AeroportoUpdateInput, AeroportoUncheckedUpdateInput>
    /**
     * Choose, which Aeroporto to update.
     */
    where: AeroportoWhereUniqueInput
  }

  /**
   * Aeroporto updateMany
   */
  export type AeroportoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Aeroportos.
     */
    data: XOR<AeroportoUpdateManyMutationInput, AeroportoUncheckedUpdateManyInput>
    /**
     * Filter which Aeroportos to update
     */
    where?: AeroportoWhereInput
  }

  /**
   * Aeroporto upsert
   */
  export type AeroportoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * The filter to search for the Aeroporto to update in case it exists.
     */
    where: AeroportoWhereUniqueInput
    /**
     * In case the Aeroporto found by the `where` argument doesn't exist, create a new Aeroporto with this data.
     */
    create: XOR<AeroportoCreateInput, AeroportoUncheckedCreateInput>
    /**
     * In case the Aeroporto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AeroportoUpdateInput, AeroportoUncheckedUpdateInput>
  }

  /**
   * Aeroporto delete
   */
  export type AeroportoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
    /**
     * Filter which Aeroporto to delete.
     */
    where: AeroportoWhereUniqueInput
  }

  /**
   * Aeroporto deleteMany
   */
  export type AeroportoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Aeroportos to delete
     */
    where?: AeroportoWhereInput
  }

  /**
   * Aeroporto without action
   */
  export type AeroportoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Aeroporto
     */
    select?: AeroportoSelect<ExtArgs> | null
  }


  /**
   * Model Container
   */

  export type AggregateContainer = {
    _count: ContainerCountAggregateOutputType | null
    _min: ContainerMinAggregateOutputType | null
    _max: ContainerMaxAggregateOutputType | null
  }

  export type ContainerMinAggregateOutputType = {
    id_container: string | null
    tipo_container: $Enums.ContainerTipo | null
    tamanho_container: string | null
    codigo_iso_container: string | null
    armador_dono_container: string | null
    ativo_container: boolean | null
  }

  export type ContainerMaxAggregateOutputType = {
    id_container: string | null
    tipo_container: $Enums.ContainerTipo | null
    tamanho_container: string | null
    codigo_iso_container: string | null
    armador_dono_container: string | null
    ativo_container: boolean | null
  }

  export type ContainerCountAggregateOutputType = {
    id_container: number
    tipo_container: number
    tamanho_container: number
    codigo_iso_container: number
    armador_dono_container: number
    ativo_container: number
    _all: number
  }


  export type ContainerMinAggregateInputType = {
    id_container?: true
    tipo_container?: true
    tamanho_container?: true
    codigo_iso_container?: true
    armador_dono_container?: true
    ativo_container?: true
  }

  export type ContainerMaxAggregateInputType = {
    id_container?: true
    tipo_container?: true
    tamanho_container?: true
    codigo_iso_container?: true
    armador_dono_container?: true
    ativo_container?: true
  }

  export type ContainerCountAggregateInputType = {
    id_container?: true
    tipo_container?: true
    tamanho_container?: true
    codigo_iso_container?: true
    armador_dono_container?: true
    ativo_container?: true
    _all?: true
  }

  export type ContainerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Container to aggregate.
     */
    where?: ContainerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Containers to fetch.
     */
    orderBy?: ContainerOrderByWithRelationInput | ContainerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContainerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Containers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Containers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Containers
    **/
    _count?: true | ContainerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContainerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContainerMaxAggregateInputType
  }

  export type GetContainerAggregateType<T extends ContainerAggregateArgs> = {
        [P in keyof T & keyof AggregateContainer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContainer[P]>
      : GetScalarType<T[P], AggregateContainer[P]>
  }




  export type ContainerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContainerWhereInput
    orderBy?: ContainerOrderByWithAggregationInput | ContainerOrderByWithAggregationInput[]
    by: ContainerScalarFieldEnum[] | ContainerScalarFieldEnum
    having?: ContainerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContainerCountAggregateInputType | true
    _min?: ContainerMinAggregateInputType
    _max?: ContainerMaxAggregateInputType
  }

  export type ContainerGroupByOutputType = {
    id_container: string
    tipo_container: $Enums.ContainerTipo
    tamanho_container: string
    codigo_iso_container: string | null
    armador_dono_container: string | null
    ativo_container: boolean
    _count: ContainerCountAggregateOutputType | null
    _min: ContainerMinAggregateOutputType | null
    _max: ContainerMaxAggregateOutputType | null
  }

  type GetContainerGroupByPayload<T extends ContainerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContainerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContainerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContainerGroupByOutputType[P]>
            : GetScalarType<T[P], ContainerGroupByOutputType[P]>
        }
      >
    >


  export type ContainerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_container?: boolean
    tipo_container?: boolean
    tamanho_container?: boolean
    codigo_iso_container?: boolean
    armador_dono_container?: boolean
    ativo_container?: boolean
  }, ExtArgs["result"]["container"]>

  export type ContainerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_container?: boolean
    tipo_container?: boolean
    tamanho_container?: boolean
    codigo_iso_container?: boolean
    armador_dono_container?: boolean
    ativo_container?: boolean
  }, ExtArgs["result"]["container"]>

  export type ContainerSelectScalar = {
    id_container?: boolean
    tipo_container?: boolean
    tamanho_container?: boolean
    codigo_iso_container?: boolean
    armador_dono_container?: boolean
    ativo_container?: boolean
  }


  export type $ContainerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Container"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_container: string
      tipo_container: $Enums.ContainerTipo
      tamanho_container: string
      codigo_iso_container: string | null
      armador_dono_container: string | null
      ativo_container: boolean
    }, ExtArgs["result"]["container"]>
    composites: {}
  }

  type ContainerGetPayload<S extends boolean | null | undefined | ContainerDefaultArgs> = $Result.GetResult<Prisma.$ContainerPayload, S>

  type ContainerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ContainerFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ContainerCountAggregateInputType | true
    }

  export interface ContainerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Container'], meta: { name: 'Container' } }
    /**
     * Find zero or one Container that matches the filter.
     * @param {ContainerFindUniqueArgs} args - Arguments to find a Container
     * @example
     * // Get one Container
     * const container = await prisma.container.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContainerFindUniqueArgs>(args: SelectSubset<T, ContainerFindUniqueArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Container that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ContainerFindUniqueOrThrowArgs} args - Arguments to find a Container
     * @example
     * // Get one Container
     * const container = await prisma.container.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContainerFindUniqueOrThrowArgs>(args: SelectSubset<T, ContainerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Container that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerFindFirstArgs} args - Arguments to find a Container
     * @example
     * // Get one Container
     * const container = await prisma.container.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContainerFindFirstArgs>(args?: SelectSubset<T, ContainerFindFirstArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Container that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerFindFirstOrThrowArgs} args - Arguments to find a Container
     * @example
     * // Get one Container
     * const container = await prisma.container.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContainerFindFirstOrThrowArgs>(args?: SelectSubset<T, ContainerFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Containers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Containers
     * const containers = await prisma.container.findMany()
     * 
     * // Get first 10 Containers
     * const containers = await prisma.container.findMany({ take: 10 })
     * 
     * // Only select the `id_container`
     * const containerWithId_containerOnly = await prisma.container.findMany({ select: { id_container: true } })
     * 
     */
    findMany<T extends ContainerFindManyArgs>(args?: SelectSubset<T, ContainerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Container.
     * @param {ContainerCreateArgs} args - Arguments to create a Container.
     * @example
     * // Create one Container
     * const Container = await prisma.container.create({
     *   data: {
     *     // ... data to create a Container
     *   }
     * })
     * 
     */
    create<T extends ContainerCreateArgs>(args: SelectSubset<T, ContainerCreateArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Containers.
     * @param {ContainerCreateManyArgs} args - Arguments to create many Containers.
     * @example
     * // Create many Containers
     * const container = await prisma.container.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContainerCreateManyArgs>(args?: SelectSubset<T, ContainerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Containers and returns the data saved in the database.
     * @param {ContainerCreateManyAndReturnArgs} args - Arguments to create many Containers.
     * @example
     * // Create many Containers
     * const container = await prisma.container.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Containers and only return the `id_container`
     * const containerWithId_containerOnly = await prisma.container.createManyAndReturn({ 
     *   select: { id_container: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContainerCreateManyAndReturnArgs>(args?: SelectSubset<T, ContainerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Container.
     * @param {ContainerDeleteArgs} args - Arguments to delete one Container.
     * @example
     * // Delete one Container
     * const Container = await prisma.container.delete({
     *   where: {
     *     // ... filter to delete one Container
     *   }
     * })
     * 
     */
    delete<T extends ContainerDeleteArgs>(args: SelectSubset<T, ContainerDeleteArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Container.
     * @param {ContainerUpdateArgs} args - Arguments to update one Container.
     * @example
     * // Update one Container
     * const container = await prisma.container.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContainerUpdateArgs>(args: SelectSubset<T, ContainerUpdateArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Containers.
     * @param {ContainerDeleteManyArgs} args - Arguments to filter Containers to delete.
     * @example
     * // Delete a few Containers
     * const { count } = await prisma.container.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContainerDeleteManyArgs>(args?: SelectSubset<T, ContainerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Containers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Containers
     * const container = await prisma.container.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContainerUpdateManyArgs>(args: SelectSubset<T, ContainerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Container.
     * @param {ContainerUpsertArgs} args - Arguments to update or create a Container.
     * @example
     * // Update or create a Container
     * const container = await prisma.container.upsert({
     *   create: {
     *     // ... data to create a Container
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Container we want to update
     *   }
     * })
     */
    upsert<T extends ContainerUpsertArgs>(args: SelectSubset<T, ContainerUpsertArgs<ExtArgs>>): Prisma__ContainerClient<$Result.GetResult<Prisma.$ContainerPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Containers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerCountArgs} args - Arguments to filter Containers to count.
     * @example
     * // Count the number of Containers
     * const count = await prisma.container.count({
     *   where: {
     *     // ... the filter for the Containers we want to count
     *   }
     * })
    **/
    count<T extends ContainerCountArgs>(
      args?: Subset<T, ContainerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContainerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Container.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContainerAggregateArgs>(args: Subset<T, ContainerAggregateArgs>): Prisma.PrismaPromise<GetContainerAggregateType<T>>

    /**
     * Group by Container.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContainerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContainerGroupByArgs['orderBy'] }
        : { orderBy?: ContainerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContainerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContainerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Container model
   */
  readonly fields: ContainerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Container.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContainerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Container model
   */ 
  interface ContainerFieldRefs {
    readonly id_container: FieldRef<"Container", 'String'>
    readonly tipo_container: FieldRef<"Container", 'ContainerTipo'>
    readonly tamanho_container: FieldRef<"Container", 'String'>
    readonly codigo_iso_container: FieldRef<"Container", 'String'>
    readonly armador_dono_container: FieldRef<"Container", 'String'>
    readonly ativo_container: FieldRef<"Container", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Container findUnique
   */
  export type ContainerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter, which Container to fetch.
     */
    where: ContainerWhereUniqueInput
  }

  /**
   * Container findUniqueOrThrow
   */
  export type ContainerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter, which Container to fetch.
     */
    where: ContainerWhereUniqueInput
  }

  /**
   * Container findFirst
   */
  export type ContainerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter, which Container to fetch.
     */
    where?: ContainerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Containers to fetch.
     */
    orderBy?: ContainerOrderByWithRelationInput | ContainerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Containers.
     */
    cursor?: ContainerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Containers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Containers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Containers.
     */
    distinct?: ContainerScalarFieldEnum | ContainerScalarFieldEnum[]
  }

  /**
   * Container findFirstOrThrow
   */
  export type ContainerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter, which Container to fetch.
     */
    where?: ContainerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Containers to fetch.
     */
    orderBy?: ContainerOrderByWithRelationInput | ContainerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Containers.
     */
    cursor?: ContainerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Containers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Containers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Containers.
     */
    distinct?: ContainerScalarFieldEnum | ContainerScalarFieldEnum[]
  }

  /**
   * Container findMany
   */
  export type ContainerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter, which Containers to fetch.
     */
    where?: ContainerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Containers to fetch.
     */
    orderBy?: ContainerOrderByWithRelationInput | ContainerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Containers.
     */
    cursor?: ContainerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Containers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Containers.
     */
    skip?: number
    distinct?: ContainerScalarFieldEnum | ContainerScalarFieldEnum[]
  }

  /**
   * Container create
   */
  export type ContainerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * The data needed to create a Container.
     */
    data: XOR<ContainerCreateInput, ContainerUncheckedCreateInput>
  }

  /**
   * Container createMany
   */
  export type ContainerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Containers.
     */
    data: ContainerCreateManyInput | ContainerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Container createManyAndReturn
   */
  export type ContainerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Containers.
     */
    data: ContainerCreateManyInput | ContainerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Container update
   */
  export type ContainerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * The data needed to update a Container.
     */
    data: XOR<ContainerUpdateInput, ContainerUncheckedUpdateInput>
    /**
     * Choose, which Container to update.
     */
    where: ContainerWhereUniqueInput
  }

  /**
   * Container updateMany
   */
  export type ContainerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Containers.
     */
    data: XOR<ContainerUpdateManyMutationInput, ContainerUncheckedUpdateManyInput>
    /**
     * Filter which Containers to update
     */
    where?: ContainerWhereInput
  }

  /**
   * Container upsert
   */
  export type ContainerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * The filter to search for the Container to update in case it exists.
     */
    where: ContainerWhereUniqueInput
    /**
     * In case the Container found by the `where` argument doesn't exist, create a new Container with this data.
     */
    create: XOR<ContainerCreateInput, ContainerUncheckedCreateInput>
    /**
     * In case the Container was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContainerUpdateInput, ContainerUncheckedUpdateInput>
  }

  /**
   * Container delete
   */
  export type ContainerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
    /**
     * Filter which Container to delete.
     */
    where: ContainerWhereUniqueInput
  }

  /**
   * Container deleteMany
   */
  export type ContainerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Containers to delete
     */
    where?: ContainerWhereInput
  }

  /**
   * Container without action
   */
  export type ContainerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Container
     */
    select?: ContainerSelect<ExtArgs> | null
  }


  /**
   * Model NcmSync
   */

  export type AggregateNcmSync = {
    _count: NcmSyncCountAggregateOutputType | null
    _avg: NcmSyncAvgAggregateOutputType | null
    _sum: NcmSyncSumAggregateOutputType | null
    _min: NcmSyncMinAggregateOutputType | null
    _max: NcmSyncMaxAggregateOutputType | null
  }

  export type NcmSyncAvgAggregateOutputType = {
    ipi_ncm_sync: number | null
    ii_ncm_sync: number | null
    pis_ncm_sync: number | null
    cofins_ncm_sync: number | null
  }

  export type NcmSyncSumAggregateOutputType = {
    ipi_ncm_sync: number | null
    ii_ncm_sync: number | null
    pis_ncm_sync: number | null
    cofins_ncm_sync: number | null
  }

  export type NcmSyncMinAggregateOutputType = {
    codigo_ncm_sync: string | null
    descricao_ncm_sync: string | null
    ipi_ncm_sync: number | null
    ii_ncm_sync: number | null
    pis_ncm_sync: number | null
    cofins_ncm_sync: number | null
    ativo_ncm_sync: boolean | null
    data_inicio_ncm_sync: Date | null
    data_fim_ncm_sync: Date | null
    id_ncm_sync_log: string | null
    data_criacao_ncm_sync: Date | null
    data_atualizacao_ncm_sync: Date | null
  }

  export type NcmSyncMaxAggregateOutputType = {
    codigo_ncm_sync: string | null
    descricao_ncm_sync: string | null
    ipi_ncm_sync: number | null
    ii_ncm_sync: number | null
    pis_ncm_sync: number | null
    cofins_ncm_sync: number | null
    ativo_ncm_sync: boolean | null
    data_inicio_ncm_sync: Date | null
    data_fim_ncm_sync: Date | null
    id_ncm_sync_log: string | null
    data_criacao_ncm_sync: Date | null
    data_atualizacao_ncm_sync: Date | null
  }

  export type NcmSyncCountAggregateOutputType = {
    codigo_ncm_sync: number
    descricao_ncm_sync: number
    ipi_ncm_sync: number
    ii_ncm_sync: number
    pis_ncm_sync: number
    cofins_ncm_sync: number
    ativo_ncm_sync: number
    data_inicio_ncm_sync: number
    data_fim_ncm_sync: number
    id_ncm_sync_log: number
    data_criacao_ncm_sync: number
    data_atualizacao_ncm_sync: number
    _all: number
  }


  export type NcmSyncAvgAggregateInputType = {
    ipi_ncm_sync?: true
    ii_ncm_sync?: true
    pis_ncm_sync?: true
    cofins_ncm_sync?: true
  }

  export type NcmSyncSumAggregateInputType = {
    ipi_ncm_sync?: true
    ii_ncm_sync?: true
    pis_ncm_sync?: true
    cofins_ncm_sync?: true
  }

  export type NcmSyncMinAggregateInputType = {
    codigo_ncm_sync?: true
    descricao_ncm_sync?: true
    ipi_ncm_sync?: true
    ii_ncm_sync?: true
    pis_ncm_sync?: true
    cofins_ncm_sync?: true
    ativo_ncm_sync?: true
    data_inicio_ncm_sync?: true
    data_fim_ncm_sync?: true
    id_ncm_sync_log?: true
    data_criacao_ncm_sync?: true
    data_atualizacao_ncm_sync?: true
  }

  export type NcmSyncMaxAggregateInputType = {
    codigo_ncm_sync?: true
    descricao_ncm_sync?: true
    ipi_ncm_sync?: true
    ii_ncm_sync?: true
    pis_ncm_sync?: true
    cofins_ncm_sync?: true
    ativo_ncm_sync?: true
    data_inicio_ncm_sync?: true
    data_fim_ncm_sync?: true
    id_ncm_sync_log?: true
    data_criacao_ncm_sync?: true
    data_atualizacao_ncm_sync?: true
  }

  export type NcmSyncCountAggregateInputType = {
    codigo_ncm_sync?: true
    descricao_ncm_sync?: true
    ipi_ncm_sync?: true
    ii_ncm_sync?: true
    pis_ncm_sync?: true
    cofins_ncm_sync?: true
    ativo_ncm_sync?: true
    data_inicio_ncm_sync?: true
    data_fim_ncm_sync?: true
    id_ncm_sync_log?: true
    data_criacao_ncm_sync?: true
    data_atualizacao_ncm_sync?: true
    _all?: true
  }

  export type NcmSyncAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSync to aggregate.
     */
    where?: NcmSyncWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncs to fetch.
     */
    orderBy?: NcmSyncOrderByWithRelationInput | NcmSyncOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NcmSyncWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NcmSyncs
    **/
    _count?: true | NcmSyncCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NcmSyncAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NcmSyncSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NcmSyncMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NcmSyncMaxAggregateInputType
  }

  export type GetNcmSyncAggregateType<T extends NcmSyncAggregateArgs> = {
        [P in keyof T & keyof AggregateNcmSync]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNcmSync[P]>
      : GetScalarType<T[P], AggregateNcmSync[P]>
  }




  export type NcmSyncGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NcmSyncWhereInput
    orderBy?: NcmSyncOrderByWithAggregationInput | NcmSyncOrderByWithAggregationInput[]
    by: NcmSyncScalarFieldEnum[] | NcmSyncScalarFieldEnum
    having?: NcmSyncScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NcmSyncCountAggregateInputType | true
    _avg?: NcmSyncAvgAggregateInputType
    _sum?: NcmSyncSumAggregateInputType
    _min?: NcmSyncMinAggregateInputType
    _max?: NcmSyncMaxAggregateInputType
  }

  export type NcmSyncGroupByOutputType = {
    codigo_ncm_sync: string
    descricao_ncm_sync: string
    ipi_ncm_sync: number | null
    ii_ncm_sync: number | null
    pis_ncm_sync: number | null
    cofins_ncm_sync: number | null
    ativo_ncm_sync: boolean
    data_inicio_ncm_sync: Date | null
    data_fim_ncm_sync: Date | null
    id_ncm_sync_log: string | null
    data_criacao_ncm_sync: Date
    data_atualizacao_ncm_sync: Date
    _count: NcmSyncCountAggregateOutputType | null
    _avg: NcmSyncAvgAggregateOutputType | null
    _sum: NcmSyncSumAggregateOutputType | null
    _min: NcmSyncMinAggregateOutputType | null
    _max: NcmSyncMaxAggregateOutputType | null
  }

  type GetNcmSyncGroupByPayload<T extends NcmSyncGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NcmSyncGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NcmSyncGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NcmSyncGroupByOutputType[P]>
            : GetScalarType<T[P], NcmSyncGroupByOutputType[P]>
        }
      >
    >


  export type NcmSyncSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_ncm_sync?: boolean
    descricao_ncm_sync?: boolean
    ipi_ncm_sync?: boolean
    ii_ncm_sync?: boolean
    pis_ncm_sync?: boolean
    cofins_ncm_sync?: boolean
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: boolean
    data_fim_ncm_sync?: boolean
    id_ncm_sync_log?: boolean
    data_criacao_ncm_sync?: boolean
    data_atualizacao_ncm_sync?: boolean
  }, ExtArgs["result"]["ncmSync"]>

  export type NcmSyncSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_ncm_sync?: boolean
    descricao_ncm_sync?: boolean
    ipi_ncm_sync?: boolean
    ii_ncm_sync?: boolean
    pis_ncm_sync?: boolean
    cofins_ncm_sync?: boolean
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: boolean
    data_fim_ncm_sync?: boolean
    id_ncm_sync_log?: boolean
    data_criacao_ncm_sync?: boolean
    data_atualizacao_ncm_sync?: boolean
  }, ExtArgs["result"]["ncmSync"]>

  export type NcmSyncSelectScalar = {
    codigo_ncm_sync?: boolean
    descricao_ncm_sync?: boolean
    ipi_ncm_sync?: boolean
    ii_ncm_sync?: boolean
    pis_ncm_sync?: boolean
    cofins_ncm_sync?: boolean
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: boolean
    data_fim_ncm_sync?: boolean
    id_ncm_sync_log?: boolean
    data_criacao_ncm_sync?: boolean
    data_atualizacao_ncm_sync?: boolean
  }


  export type $NcmSyncPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NcmSync"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_ncm_sync: string
      descricao_ncm_sync: string
      ipi_ncm_sync: number | null
      ii_ncm_sync: number | null
      pis_ncm_sync: number | null
      cofins_ncm_sync: number | null
      ativo_ncm_sync: boolean
      data_inicio_ncm_sync: Date | null
      data_fim_ncm_sync: Date | null
      id_ncm_sync_log: string | null
      data_criacao_ncm_sync: Date
      data_atualizacao_ncm_sync: Date
    }, ExtArgs["result"]["ncmSync"]>
    composites: {}
  }

  type NcmSyncGetPayload<S extends boolean | null | undefined | NcmSyncDefaultArgs> = $Result.GetResult<Prisma.$NcmSyncPayload, S>

  type NcmSyncCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NcmSyncFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NcmSyncCountAggregateInputType | true
    }

  export interface NcmSyncDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NcmSync'], meta: { name: 'NcmSync' } }
    /**
     * Find zero or one NcmSync that matches the filter.
     * @param {NcmSyncFindUniqueArgs} args - Arguments to find a NcmSync
     * @example
     * // Get one NcmSync
     * const ncmSync = await prisma.ncmSync.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NcmSyncFindUniqueArgs>(args: SelectSubset<T, NcmSyncFindUniqueArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one NcmSync that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NcmSyncFindUniqueOrThrowArgs} args - Arguments to find a NcmSync
     * @example
     * // Get one NcmSync
     * const ncmSync = await prisma.ncmSync.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NcmSyncFindUniqueOrThrowArgs>(args: SelectSubset<T, NcmSyncFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first NcmSync that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncFindFirstArgs} args - Arguments to find a NcmSync
     * @example
     * // Get one NcmSync
     * const ncmSync = await prisma.ncmSync.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NcmSyncFindFirstArgs>(args?: SelectSubset<T, NcmSyncFindFirstArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first NcmSync that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncFindFirstOrThrowArgs} args - Arguments to find a NcmSync
     * @example
     * // Get one NcmSync
     * const ncmSync = await prisma.ncmSync.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NcmSyncFindFirstOrThrowArgs>(args?: SelectSubset<T, NcmSyncFindFirstOrThrowArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more NcmSyncs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NcmSyncs
     * const ncmSyncs = await prisma.ncmSync.findMany()
     * 
     * // Get first 10 NcmSyncs
     * const ncmSyncs = await prisma.ncmSync.findMany({ take: 10 })
     * 
     * // Only select the `codigo_ncm_sync`
     * const ncmSyncWithCodigo_ncm_syncOnly = await prisma.ncmSync.findMany({ select: { codigo_ncm_sync: true } })
     * 
     */
    findMany<T extends NcmSyncFindManyArgs>(args?: SelectSubset<T, NcmSyncFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a NcmSync.
     * @param {NcmSyncCreateArgs} args - Arguments to create a NcmSync.
     * @example
     * // Create one NcmSync
     * const NcmSync = await prisma.ncmSync.create({
     *   data: {
     *     // ... data to create a NcmSync
     *   }
     * })
     * 
     */
    create<T extends NcmSyncCreateArgs>(args: SelectSubset<T, NcmSyncCreateArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many NcmSyncs.
     * @param {NcmSyncCreateManyArgs} args - Arguments to create many NcmSyncs.
     * @example
     * // Create many NcmSyncs
     * const ncmSync = await prisma.ncmSync.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NcmSyncCreateManyArgs>(args?: SelectSubset<T, NcmSyncCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NcmSyncs and returns the data saved in the database.
     * @param {NcmSyncCreateManyAndReturnArgs} args - Arguments to create many NcmSyncs.
     * @example
     * // Create many NcmSyncs
     * const ncmSync = await prisma.ncmSync.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NcmSyncs and only return the `codigo_ncm_sync`
     * const ncmSyncWithCodigo_ncm_syncOnly = await prisma.ncmSync.createManyAndReturn({ 
     *   select: { codigo_ncm_sync: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NcmSyncCreateManyAndReturnArgs>(args?: SelectSubset<T, NcmSyncCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a NcmSync.
     * @param {NcmSyncDeleteArgs} args - Arguments to delete one NcmSync.
     * @example
     * // Delete one NcmSync
     * const NcmSync = await prisma.ncmSync.delete({
     *   where: {
     *     // ... filter to delete one NcmSync
     *   }
     * })
     * 
     */
    delete<T extends NcmSyncDeleteArgs>(args: SelectSubset<T, NcmSyncDeleteArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one NcmSync.
     * @param {NcmSyncUpdateArgs} args - Arguments to update one NcmSync.
     * @example
     * // Update one NcmSync
     * const ncmSync = await prisma.ncmSync.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NcmSyncUpdateArgs>(args: SelectSubset<T, NcmSyncUpdateArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more NcmSyncs.
     * @param {NcmSyncDeleteManyArgs} args - Arguments to filter NcmSyncs to delete.
     * @example
     * // Delete a few NcmSyncs
     * const { count } = await prisma.ncmSync.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NcmSyncDeleteManyArgs>(args?: SelectSubset<T, NcmSyncDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NcmSyncs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NcmSyncs
     * const ncmSync = await prisma.ncmSync.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NcmSyncUpdateManyArgs>(args: SelectSubset<T, NcmSyncUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NcmSync.
     * @param {NcmSyncUpsertArgs} args - Arguments to update or create a NcmSync.
     * @example
     * // Update or create a NcmSync
     * const ncmSync = await prisma.ncmSync.upsert({
     *   create: {
     *     // ... data to create a NcmSync
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NcmSync we want to update
     *   }
     * })
     */
    upsert<T extends NcmSyncUpsertArgs>(args: SelectSubset<T, NcmSyncUpsertArgs<ExtArgs>>): Prisma__NcmSyncClient<$Result.GetResult<Prisma.$NcmSyncPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of NcmSyncs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncCountArgs} args - Arguments to filter NcmSyncs to count.
     * @example
     * // Count the number of NcmSyncs
     * const count = await prisma.ncmSync.count({
     *   where: {
     *     // ... the filter for the NcmSyncs we want to count
     *   }
     * })
    **/
    count<T extends NcmSyncCountArgs>(
      args?: Subset<T, NcmSyncCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NcmSyncCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NcmSync.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NcmSyncAggregateArgs>(args: Subset<T, NcmSyncAggregateArgs>): Prisma.PrismaPromise<GetNcmSyncAggregateType<T>>

    /**
     * Group by NcmSync.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NcmSyncGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NcmSyncGroupByArgs['orderBy'] }
        : { orderBy?: NcmSyncGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NcmSyncGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNcmSyncGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NcmSync model
   */
  readonly fields: NcmSyncFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NcmSync.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NcmSyncClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NcmSync model
   */ 
  interface NcmSyncFieldRefs {
    readonly codigo_ncm_sync: FieldRef<"NcmSync", 'String'>
    readonly descricao_ncm_sync: FieldRef<"NcmSync", 'String'>
    readonly ipi_ncm_sync: FieldRef<"NcmSync", 'Float'>
    readonly ii_ncm_sync: FieldRef<"NcmSync", 'Float'>
    readonly pis_ncm_sync: FieldRef<"NcmSync", 'Float'>
    readonly cofins_ncm_sync: FieldRef<"NcmSync", 'Float'>
    readonly ativo_ncm_sync: FieldRef<"NcmSync", 'Boolean'>
    readonly data_inicio_ncm_sync: FieldRef<"NcmSync", 'DateTime'>
    readonly data_fim_ncm_sync: FieldRef<"NcmSync", 'DateTime'>
    readonly id_ncm_sync_log: FieldRef<"NcmSync", 'String'>
    readonly data_criacao_ncm_sync: FieldRef<"NcmSync", 'DateTime'>
    readonly data_atualizacao_ncm_sync: FieldRef<"NcmSync", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NcmSync findUnique
   */
  export type NcmSyncFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter, which NcmSync to fetch.
     */
    where: NcmSyncWhereUniqueInput
  }

  /**
   * NcmSync findUniqueOrThrow
   */
  export type NcmSyncFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter, which NcmSync to fetch.
     */
    where: NcmSyncWhereUniqueInput
  }

  /**
   * NcmSync findFirst
   */
  export type NcmSyncFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter, which NcmSync to fetch.
     */
    where?: NcmSyncWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncs to fetch.
     */
    orderBy?: NcmSyncOrderByWithRelationInput | NcmSyncOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncs.
     */
    cursor?: NcmSyncWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncs.
     */
    distinct?: NcmSyncScalarFieldEnum | NcmSyncScalarFieldEnum[]
  }

  /**
   * NcmSync findFirstOrThrow
   */
  export type NcmSyncFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter, which NcmSync to fetch.
     */
    where?: NcmSyncWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncs to fetch.
     */
    orderBy?: NcmSyncOrderByWithRelationInput | NcmSyncOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncs.
     */
    cursor?: NcmSyncWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncs.
     */
    distinct?: NcmSyncScalarFieldEnum | NcmSyncScalarFieldEnum[]
  }

  /**
   * NcmSync findMany
   */
  export type NcmSyncFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncs to fetch.
     */
    where?: NcmSyncWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncs to fetch.
     */
    orderBy?: NcmSyncOrderByWithRelationInput | NcmSyncOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NcmSyncs.
     */
    cursor?: NcmSyncWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncs.
     */
    skip?: number
    distinct?: NcmSyncScalarFieldEnum | NcmSyncScalarFieldEnum[]
  }

  /**
   * NcmSync create
   */
  export type NcmSyncCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * The data needed to create a NcmSync.
     */
    data: XOR<NcmSyncCreateInput, NcmSyncUncheckedCreateInput>
  }

  /**
   * NcmSync createMany
   */
  export type NcmSyncCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NcmSyncs.
     */
    data: NcmSyncCreateManyInput | NcmSyncCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSync createManyAndReturn
   */
  export type NcmSyncCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many NcmSyncs.
     */
    data: NcmSyncCreateManyInput | NcmSyncCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSync update
   */
  export type NcmSyncUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * The data needed to update a NcmSync.
     */
    data: XOR<NcmSyncUpdateInput, NcmSyncUncheckedUpdateInput>
    /**
     * Choose, which NcmSync to update.
     */
    where: NcmSyncWhereUniqueInput
  }

  /**
   * NcmSync updateMany
   */
  export type NcmSyncUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NcmSyncs.
     */
    data: XOR<NcmSyncUpdateManyMutationInput, NcmSyncUncheckedUpdateManyInput>
    /**
     * Filter which NcmSyncs to update
     */
    where?: NcmSyncWhereInput
  }

  /**
   * NcmSync upsert
   */
  export type NcmSyncUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * The filter to search for the NcmSync to update in case it exists.
     */
    where: NcmSyncWhereUniqueInput
    /**
     * In case the NcmSync found by the `where` argument doesn't exist, create a new NcmSync with this data.
     */
    create: XOR<NcmSyncCreateInput, NcmSyncUncheckedCreateInput>
    /**
     * In case the NcmSync was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NcmSyncUpdateInput, NcmSyncUncheckedUpdateInput>
  }

  /**
   * NcmSync delete
   */
  export type NcmSyncDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
    /**
     * Filter which NcmSync to delete.
     */
    where: NcmSyncWhereUniqueInput
  }

  /**
   * NcmSync deleteMany
   */
  export type NcmSyncDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSyncs to delete
     */
    where?: NcmSyncWhereInput
  }

  /**
   * NcmSync without action
   */
  export type NcmSyncDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSync
     */
    select?: NcmSyncSelect<ExtArgs> | null
  }


  /**
   * Model NcmSyncLog
   */

  export type AggregateNcmSyncLog = {
    _count: NcmSyncLogCountAggregateOutputType | null
    _avg: NcmSyncLogAvgAggregateOutputType | null
    _sum: NcmSyncLogSumAggregateOutputType | null
    _min: NcmSyncLogMinAggregateOutputType | null
    _max: NcmSyncLogMaxAggregateOutputType | null
  }

  export type NcmSyncLogAvgAggregateOutputType = {
    total_ncm_sync_log: number | null
    adicionados_ncm_sync_log: number | null
    alterados_ncm_sync_log: number | null
    removidos_ncm_sync_log: number | null
  }

  export type NcmSyncLogSumAggregateOutputType = {
    total_ncm_sync_log: number | null
    adicionados_ncm_sync_log: number | null
    alterados_ncm_sync_log: number | null
    removidos_ncm_sync_log: number | null
  }

  export type NcmSyncLogMinAggregateOutputType = {
    id_ncm_sync_log: string | null
    data_inicio_ncm_sync_log: Date | null
    data_conclusao_ncm_sync_log: Date | null
    status_ncm_sync_log: $Enums.NcmSyncStatusSincronizacao | null
    total_ncm_sync_log: number | null
    adicionados_ncm_sync_log: number | null
    alterados_ncm_sync_log: number | null
    removidos_ncm_sync_log: number | null
    origem_ncm_sync_log: $Enums.NcmSyncOrigemSincronizacao | null
    disparado_por_ncm_sync_log: string | null
    mensagem_erro_ncm_sync_log: string | null
    data_criacao_ncm_sync_log: Date | null
    data_atualizacao_ncm_sync_log: Date | null
  }

  export type NcmSyncLogMaxAggregateOutputType = {
    id_ncm_sync_log: string | null
    data_inicio_ncm_sync_log: Date | null
    data_conclusao_ncm_sync_log: Date | null
    status_ncm_sync_log: $Enums.NcmSyncStatusSincronizacao | null
    total_ncm_sync_log: number | null
    adicionados_ncm_sync_log: number | null
    alterados_ncm_sync_log: number | null
    removidos_ncm_sync_log: number | null
    origem_ncm_sync_log: $Enums.NcmSyncOrigemSincronizacao | null
    disparado_por_ncm_sync_log: string | null
    mensagem_erro_ncm_sync_log: string | null
    data_criacao_ncm_sync_log: Date | null
    data_atualizacao_ncm_sync_log: Date | null
  }

  export type NcmSyncLogCountAggregateOutputType = {
    id_ncm_sync_log: number
    data_inicio_ncm_sync_log: number
    data_conclusao_ncm_sync_log: number
    status_ncm_sync_log: number
    total_ncm_sync_log: number
    adicionados_ncm_sync_log: number
    alterados_ncm_sync_log: number
    removidos_ncm_sync_log: number
    origem_ncm_sync_log: number
    disparado_por_ncm_sync_log: number
    mensagem_erro_ncm_sync_log: number
    data_criacao_ncm_sync_log: number
    data_atualizacao_ncm_sync_log: number
    _all: number
  }


  export type NcmSyncLogAvgAggregateInputType = {
    total_ncm_sync_log?: true
    adicionados_ncm_sync_log?: true
    alterados_ncm_sync_log?: true
    removidos_ncm_sync_log?: true
  }

  export type NcmSyncLogSumAggregateInputType = {
    total_ncm_sync_log?: true
    adicionados_ncm_sync_log?: true
    alterados_ncm_sync_log?: true
    removidos_ncm_sync_log?: true
  }

  export type NcmSyncLogMinAggregateInputType = {
    id_ncm_sync_log?: true
    data_inicio_ncm_sync_log?: true
    data_conclusao_ncm_sync_log?: true
    status_ncm_sync_log?: true
    total_ncm_sync_log?: true
    adicionados_ncm_sync_log?: true
    alterados_ncm_sync_log?: true
    removidos_ncm_sync_log?: true
    origem_ncm_sync_log?: true
    disparado_por_ncm_sync_log?: true
    mensagem_erro_ncm_sync_log?: true
    data_criacao_ncm_sync_log?: true
    data_atualizacao_ncm_sync_log?: true
  }

  export type NcmSyncLogMaxAggregateInputType = {
    id_ncm_sync_log?: true
    data_inicio_ncm_sync_log?: true
    data_conclusao_ncm_sync_log?: true
    status_ncm_sync_log?: true
    total_ncm_sync_log?: true
    adicionados_ncm_sync_log?: true
    alterados_ncm_sync_log?: true
    removidos_ncm_sync_log?: true
    origem_ncm_sync_log?: true
    disparado_por_ncm_sync_log?: true
    mensagem_erro_ncm_sync_log?: true
    data_criacao_ncm_sync_log?: true
    data_atualizacao_ncm_sync_log?: true
  }

  export type NcmSyncLogCountAggregateInputType = {
    id_ncm_sync_log?: true
    data_inicio_ncm_sync_log?: true
    data_conclusao_ncm_sync_log?: true
    status_ncm_sync_log?: true
    total_ncm_sync_log?: true
    adicionados_ncm_sync_log?: true
    alterados_ncm_sync_log?: true
    removidos_ncm_sync_log?: true
    origem_ncm_sync_log?: true
    disparado_por_ncm_sync_log?: true
    mensagem_erro_ncm_sync_log?: true
    data_criacao_ncm_sync_log?: true
    data_atualizacao_ncm_sync_log?: true
    _all?: true
  }

  export type NcmSyncLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSyncLog to aggregate.
     */
    where?: NcmSyncLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncLogs to fetch.
     */
    orderBy?: NcmSyncLogOrderByWithRelationInput | NcmSyncLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NcmSyncLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NcmSyncLogs
    **/
    _count?: true | NcmSyncLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NcmSyncLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NcmSyncLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NcmSyncLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NcmSyncLogMaxAggregateInputType
  }

  export type GetNcmSyncLogAggregateType<T extends NcmSyncLogAggregateArgs> = {
        [P in keyof T & keyof AggregateNcmSyncLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNcmSyncLog[P]>
      : GetScalarType<T[P], AggregateNcmSyncLog[P]>
  }




  export type NcmSyncLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NcmSyncLogWhereInput
    orderBy?: NcmSyncLogOrderByWithAggregationInput | NcmSyncLogOrderByWithAggregationInput[]
    by: NcmSyncLogScalarFieldEnum[] | NcmSyncLogScalarFieldEnum
    having?: NcmSyncLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NcmSyncLogCountAggregateInputType | true
    _avg?: NcmSyncLogAvgAggregateInputType
    _sum?: NcmSyncLogSumAggregateInputType
    _min?: NcmSyncLogMinAggregateInputType
    _max?: NcmSyncLogMaxAggregateInputType
  }

  export type NcmSyncLogGroupByOutputType = {
    id_ncm_sync_log: string
    data_inicio_ncm_sync_log: Date
    data_conclusao_ncm_sync_log: Date | null
    status_ncm_sync_log: $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log: number
    adicionados_ncm_sync_log: number
    alterados_ncm_sync_log: number
    removidos_ncm_sync_log: number
    origem_ncm_sync_log: $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log: string | null
    mensagem_erro_ncm_sync_log: string | null
    data_criacao_ncm_sync_log: Date
    data_atualizacao_ncm_sync_log: Date
    _count: NcmSyncLogCountAggregateOutputType | null
    _avg: NcmSyncLogAvgAggregateOutputType | null
    _sum: NcmSyncLogSumAggregateOutputType | null
    _min: NcmSyncLogMinAggregateOutputType | null
    _max: NcmSyncLogMaxAggregateOutputType | null
  }

  type GetNcmSyncLogGroupByPayload<T extends NcmSyncLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NcmSyncLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NcmSyncLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NcmSyncLogGroupByOutputType[P]>
            : GetScalarType<T[P], NcmSyncLogGroupByOutputType[P]>
        }
      >
    >


  export type NcmSyncLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ncm_sync_log?: boolean
    data_inicio_ncm_sync_log?: boolean
    data_conclusao_ncm_sync_log?: boolean
    status_ncm_sync_log?: boolean
    total_ncm_sync_log?: boolean
    adicionados_ncm_sync_log?: boolean
    alterados_ncm_sync_log?: boolean
    removidos_ncm_sync_log?: boolean
    origem_ncm_sync_log?: boolean
    disparado_por_ncm_sync_log?: boolean
    mensagem_erro_ncm_sync_log?: boolean
    data_criacao_ncm_sync_log?: boolean
    data_atualizacao_ncm_sync_log?: boolean
  }, ExtArgs["result"]["ncmSyncLog"]>

  export type NcmSyncLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ncm_sync_log?: boolean
    data_inicio_ncm_sync_log?: boolean
    data_conclusao_ncm_sync_log?: boolean
    status_ncm_sync_log?: boolean
    total_ncm_sync_log?: boolean
    adicionados_ncm_sync_log?: boolean
    alterados_ncm_sync_log?: boolean
    removidos_ncm_sync_log?: boolean
    origem_ncm_sync_log?: boolean
    disparado_por_ncm_sync_log?: boolean
    mensagem_erro_ncm_sync_log?: boolean
    data_criacao_ncm_sync_log?: boolean
    data_atualizacao_ncm_sync_log?: boolean
  }, ExtArgs["result"]["ncmSyncLog"]>

  export type NcmSyncLogSelectScalar = {
    id_ncm_sync_log?: boolean
    data_inicio_ncm_sync_log?: boolean
    data_conclusao_ncm_sync_log?: boolean
    status_ncm_sync_log?: boolean
    total_ncm_sync_log?: boolean
    adicionados_ncm_sync_log?: boolean
    alterados_ncm_sync_log?: boolean
    removidos_ncm_sync_log?: boolean
    origem_ncm_sync_log?: boolean
    disparado_por_ncm_sync_log?: boolean
    mensagem_erro_ncm_sync_log?: boolean
    data_criacao_ncm_sync_log?: boolean
    data_atualizacao_ncm_sync_log?: boolean
  }


  export type $NcmSyncLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NcmSyncLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_ncm_sync_log: string
      data_inicio_ncm_sync_log: Date
      data_conclusao_ncm_sync_log: Date | null
      status_ncm_sync_log: $Enums.NcmSyncStatusSincronizacao
      total_ncm_sync_log: number
      adicionados_ncm_sync_log: number
      alterados_ncm_sync_log: number
      removidos_ncm_sync_log: number
      origem_ncm_sync_log: $Enums.NcmSyncOrigemSincronizacao
      disparado_por_ncm_sync_log: string | null
      mensagem_erro_ncm_sync_log: string | null
      data_criacao_ncm_sync_log: Date
      data_atualizacao_ncm_sync_log: Date
    }, ExtArgs["result"]["ncmSyncLog"]>
    composites: {}
  }

  type NcmSyncLogGetPayload<S extends boolean | null | undefined | NcmSyncLogDefaultArgs> = $Result.GetResult<Prisma.$NcmSyncLogPayload, S>

  type NcmSyncLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NcmSyncLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NcmSyncLogCountAggregateInputType | true
    }

  export interface NcmSyncLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NcmSyncLog'], meta: { name: 'NcmSyncLog' } }
    /**
     * Find zero or one NcmSyncLog that matches the filter.
     * @param {NcmSyncLogFindUniqueArgs} args - Arguments to find a NcmSyncLog
     * @example
     * // Get one NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NcmSyncLogFindUniqueArgs>(args: SelectSubset<T, NcmSyncLogFindUniqueArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one NcmSyncLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NcmSyncLogFindUniqueOrThrowArgs} args - Arguments to find a NcmSyncLog
     * @example
     * // Get one NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NcmSyncLogFindUniqueOrThrowArgs>(args: SelectSubset<T, NcmSyncLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first NcmSyncLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogFindFirstArgs} args - Arguments to find a NcmSyncLog
     * @example
     * // Get one NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NcmSyncLogFindFirstArgs>(args?: SelectSubset<T, NcmSyncLogFindFirstArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first NcmSyncLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogFindFirstOrThrowArgs} args - Arguments to find a NcmSyncLog
     * @example
     * // Get one NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NcmSyncLogFindFirstOrThrowArgs>(args?: SelectSubset<T, NcmSyncLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more NcmSyncLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NcmSyncLogs
     * const ncmSyncLogs = await prisma.ncmSyncLog.findMany()
     * 
     * // Get first 10 NcmSyncLogs
     * const ncmSyncLogs = await prisma.ncmSyncLog.findMany({ take: 10 })
     * 
     * // Only select the `id_ncm_sync_log`
     * const ncmSyncLogWithId_ncm_sync_logOnly = await prisma.ncmSyncLog.findMany({ select: { id_ncm_sync_log: true } })
     * 
     */
    findMany<T extends NcmSyncLogFindManyArgs>(args?: SelectSubset<T, NcmSyncLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a NcmSyncLog.
     * @param {NcmSyncLogCreateArgs} args - Arguments to create a NcmSyncLog.
     * @example
     * // Create one NcmSyncLog
     * const NcmSyncLog = await prisma.ncmSyncLog.create({
     *   data: {
     *     // ... data to create a NcmSyncLog
     *   }
     * })
     * 
     */
    create<T extends NcmSyncLogCreateArgs>(args: SelectSubset<T, NcmSyncLogCreateArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many NcmSyncLogs.
     * @param {NcmSyncLogCreateManyArgs} args - Arguments to create many NcmSyncLogs.
     * @example
     * // Create many NcmSyncLogs
     * const ncmSyncLog = await prisma.ncmSyncLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NcmSyncLogCreateManyArgs>(args?: SelectSubset<T, NcmSyncLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NcmSyncLogs and returns the data saved in the database.
     * @param {NcmSyncLogCreateManyAndReturnArgs} args - Arguments to create many NcmSyncLogs.
     * @example
     * // Create many NcmSyncLogs
     * const ncmSyncLog = await prisma.ncmSyncLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NcmSyncLogs and only return the `id_ncm_sync_log`
     * const ncmSyncLogWithId_ncm_sync_logOnly = await prisma.ncmSyncLog.createManyAndReturn({ 
     *   select: { id_ncm_sync_log: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NcmSyncLogCreateManyAndReturnArgs>(args?: SelectSubset<T, NcmSyncLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a NcmSyncLog.
     * @param {NcmSyncLogDeleteArgs} args - Arguments to delete one NcmSyncLog.
     * @example
     * // Delete one NcmSyncLog
     * const NcmSyncLog = await prisma.ncmSyncLog.delete({
     *   where: {
     *     // ... filter to delete one NcmSyncLog
     *   }
     * })
     * 
     */
    delete<T extends NcmSyncLogDeleteArgs>(args: SelectSubset<T, NcmSyncLogDeleteArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one NcmSyncLog.
     * @param {NcmSyncLogUpdateArgs} args - Arguments to update one NcmSyncLog.
     * @example
     * // Update one NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NcmSyncLogUpdateArgs>(args: SelectSubset<T, NcmSyncLogUpdateArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more NcmSyncLogs.
     * @param {NcmSyncLogDeleteManyArgs} args - Arguments to filter NcmSyncLogs to delete.
     * @example
     * // Delete a few NcmSyncLogs
     * const { count } = await prisma.ncmSyncLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NcmSyncLogDeleteManyArgs>(args?: SelectSubset<T, NcmSyncLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NcmSyncLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NcmSyncLogs
     * const ncmSyncLog = await prisma.ncmSyncLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NcmSyncLogUpdateManyArgs>(args: SelectSubset<T, NcmSyncLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NcmSyncLog.
     * @param {NcmSyncLogUpsertArgs} args - Arguments to update or create a NcmSyncLog.
     * @example
     * // Update or create a NcmSyncLog
     * const ncmSyncLog = await prisma.ncmSyncLog.upsert({
     *   create: {
     *     // ... data to create a NcmSyncLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NcmSyncLog we want to update
     *   }
     * })
     */
    upsert<T extends NcmSyncLogUpsertArgs>(args: SelectSubset<T, NcmSyncLogUpsertArgs<ExtArgs>>): Prisma__NcmSyncLogClient<$Result.GetResult<Prisma.$NcmSyncLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of NcmSyncLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogCountArgs} args - Arguments to filter NcmSyncLogs to count.
     * @example
     * // Count the number of NcmSyncLogs
     * const count = await prisma.ncmSyncLog.count({
     *   where: {
     *     // ... the filter for the NcmSyncLogs we want to count
     *   }
     * })
    **/
    count<T extends NcmSyncLogCountArgs>(
      args?: Subset<T, NcmSyncLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NcmSyncLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NcmSyncLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NcmSyncLogAggregateArgs>(args: Subset<T, NcmSyncLogAggregateArgs>): Prisma.PrismaPromise<GetNcmSyncLogAggregateType<T>>

    /**
     * Group by NcmSyncLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NcmSyncLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NcmSyncLogGroupByArgs['orderBy'] }
        : { orderBy?: NcmSyncLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NcmSyncLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNcmSyncLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NcmSyncLog model
   */
  readonly fields: NcmSyncLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NcmSyncLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NcmSyncLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NcmSyncLog model
   */ 
  interface NcmSyncLogFieldRefs {
    readonly id_ncm_sync_log: FieldRef<"NcmSyncLog", 'String'>
    readonly data_inicio_ncm_sync_log: FieldRef<"NcmSyncLog", 'DateTime'>
    readonly data_conclusao_ncm_sync_log: FieldRef<"NcmSyncLog", 'DateTime'>
    readonly status_ncm_sync_log: FieldRef<"NcmSyncLog", 'NcmSyncStatusSincronizacao'>
    readonly total_ncm_sync_log: FieldRef<"NcmSyncLog", 'Int'>
    readonly adicionados_ncm_sync_log: FieldRef<"NcmSyncLog", 'Int'>
    readonly alterados_ncm_sync_log: FieldRef<"NcmSyncLog", 'Int'>
    readonly removidos_ncm_sync_log: FieldRef<"NcmSyncLog", 'Int'>
    readonly origem_ncm_sync_log: FieldRef<"NcmSyncLog", 'NcmSyncOrigemSincronizacao'>
    readonly disparado_por_ncm_sync_log: FieldRef<"NcmSyncLog", 'String'>
    readonly mensagem_erro_ncm_sync_log: FieldRef<"NcmSyncLog", 'String'>
    readonly data_criacao_ncm_sync_log: FieldRef<"NcmSyncLog", 'DateTime'>
    readonly data_atualizacao_ncm_sync_log: FieldRef<"NcmSyncLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NcmSyncLog findUnique
   */
  export type NcmSyncLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncLog to fetch.
     */
    where: NcmSyncLogWhereUniqueInput
  }

  /**
   * NcmSyncLog findUniqueOrThrow
   */
  export type NcmSyncLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncLog to fetch.
     */
    where: NcmSyncLogWhereUniqueInput
  }

  /**
   * NcmSyncLog findFirst
   */
  export type NcmSyncLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncLog to fetch.
     */
    where?: NcmSyncLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncLogs to fetch.
     */
    orderBy?: NcmSyncLogOrderByWithRelationInput | NcmSyncLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncLogs.
     */
    cursor?: NcmSyncLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncLogs.
     */
    distinct?: NcmSyncLogScalarFieldEnum | NcmSyncLogScalarFieldEnum[]
  }

  /**
   * NcmSyncLog findFirstOrThrow
   */
  export type NcmSyncLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncLog to fetch.
     */
    where?: NcmSyncLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncLogs to fetch.
     */
    orderBy?: NcmSyncLogOrderByWithRelationInput | NcmSyncLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncLogs.
     */
    cursor?: NcmSyncLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncLogs.
     */
    distinct?: NcmSyncLogScalarFieldEnum | NcmSyncLogScalarFieldEnum[]
  }

  /**
   * NcmSyncLog findMany
   */
  export type NcmSyncLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncLogs to fetch.
     */
    where?: NcmSyncLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncLogs to fetch.
     */
    orderBy?: NcmSyncLogOrderByWithRelationInput | NcmSyncLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NcmSyncLogs.
     */
    cursor?: NcmSyncLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncLogs.
     */
    skip?: number
    distinct?: NcmSyncLogScalarFieldEnum | NcmSyncLogScalarFieldEnum[]
  }

  /**
   * NcmSyncLog create
   */
  export type NcmSyncLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * The data needed to create a NcmSyncLog.
     */
    data: XOR<NcmSyncLogCreateInput, NcmSyncLogUncheckedCreateInput>
  }

  /**
   * NcmSyncLog createMany
   */
  export type NcmSyncLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NcmSyncLogs.
     */
    data: NcmSyncLogCreateManyInput | NcmSyncLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSyncLog createManyAndReturn
   */
  export type NcmSyncLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many NcmSyncLogs.
     */
    data: NcmSyncLogCreateManyInput | NcmSyncLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSyncLog update
   */
  export type NcmSyncLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * The data needed to update a NcmSyncLog.
     */
    data: XOR<NcmSyncLogUpdateInput, NcmSyncLogUncheckedUpdateInput>
    /**
     * Choose, which NcmSyncLog to update.
     */
    where: NcmSyncLogWhereUniqueInput
  }

  /**
   * NcmSyncLog updateMany
   */
  export type NcmSyncLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NcmSyncLogs.
     */
    data: XOR<NcmSyncLogUpdateManyMutationInput, NcmSyncLogUncheckedUpdateManyInput>
    /**
     * Filter which NcmSyncLogs to update
     */
    where?: NcmSyncLogWhereInput
  }

  /**
   * NcmSyncLog upsert
   */
  export type NcmSyncLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * The filter to search for the NcmSyncLog to update in case it exists.
     */
    where: NcmSyncLogWhereUniqueInput
    /**
     * In case the NcmSyncLog found by the `where` argument doesn't exist, create a new NcmSyncLog with this data.
     */
    create: XOR<NcmSyncLogCreateInput, NcmSyncLogUncheckedCreateInput>
    /**
     * In case the NcmSyncLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NcmSyncLogUpdateInput, NcmSyncLogUncheckedUpdateInput>
  }

  /**
   * NcmSyncLog delete
   */
  export type NcmSyncLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
    /**
     * Filter which NcmSyncLog to delete.
     */
    where: NcmSyncLogWhereUniqueInput
  }

  /**
   * NcmSyncLog deleteMany
   */
  export type NcmSyncLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSyncLogs to delete
     */
    where?: NcmSyncLogWhereInput
  }

  /**
   * NcmSyncLog without action
   */
  export type NcmSyncLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncLog
     */
    select?: NcmSyncLogSelect<ExtArgs> | null
  }


  /**
   * Model NcmSyncAgendamento
   */

  export type AggregateNcmSyncAgendamento = {
    _count: NcmSyncAgendamentoCountAggregateOutputType | null
    _min: NcmSyncAgendamentoMinAggregateOutputType | null
    _max: NcmSyncAgendamentoMaxAggregateOutputType | null
  }

  export type NcmSyncAgendamentoMinAggregateOutputType = {
    id_ncm_sync_agendamento: string | null
    ativo_ncm_sync_agendamento: boolean | null
    cron_expressao_ncm_sync_agendamento: string | null
    data_criacao_ncm_sync_agendamento: Date | null
    data_atualizacao_ncm_sync_agendamento: Date | null
  }

  export type NcmSyncAgendamentoMaxAggregateOutputType = {
    id_ncm_sync_agendamento: string | null
    ativo_ncm_sync_agendamento: boolean | null
    cron_expressao_ncm_sync_agendamento: string | null
    data_criacao_ncm_sync_agendamento: Date | null
    data_atualizacao_ncm_sync_agendamento: Date | null
  }

  export type NcmSyncAgendamentoCountAggregateOutputType = {
    id_ncm_sync_agendamento: number
    ativo_ncm_sync_agendamento: number
    cron_expressao_ncm_sync_agendamento: number
    notificadores_ncm_sync_agendamento: number
    data_criacao_ncm_sync_agendamento: number
    data_atualizacao_ncm_sync_agendamento: number
    _all: number
  }


  export type NcmSyncAgendamentoMinAggregateInputType = {
    id_ncm_sync_agendamento?: true
    ativo_ncm_sync_agendamento?: true
    cron_expressao_ncm_sync_agendamento?: true
    data_criacao_ncm_sync_agendamento?: true
    data_atualizacao_ncm_sync_agendamento?: true
  }

  export type NcmSyncAgendamentoMaxAggregateInputType = {
    id_ncm_sync_agendamento?: true
    ativo_ncm_sync_agendamento?: true
    cron_expressao_ncm_sync_agendamento?: true
    data_criacao_ncm_sync_agendamento?: true
    data_atualizacao_ncm_sync_agendamento?: true
  }

  export type NcmSyncAgendamentoCountAggregateInputType = {
    id_ncm_sync_agendamento?: true
    ativo_ncm_sync_agendamento?: true
    cron_expressao_ncm_sync_agendamento?: true
    notificadores_ncm_sync_agendamento?: true
    data_criacao_ncm_sync_agendamento?: true
    data_atualizacao_ncm_sync_agendamento?: true
    _all?: true
  }

  export type NcmSyncAgendamentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSyncAgendamento to aggregate.
     */
    where?: NcmSyncAgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncAgendamentos to fetch.
     */
    orderBy?: NcmSyncAgendamentoOrderByWithRelationInput | NcmSyncAgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NcmSyncAgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncAgendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncAgendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NcmSyncAgendamentos
    **/
    _count?: true | NcmSyncAgendamentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NcmSyncAgendamentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NcmSyncAgendamentoMaxAggregateInputType
  }

  export type GetNcmSyncAgendamentoAggregateType<T extends NcmSyncAgendamentoAggregateArgs> = {
        [P in keyof T & keyof AggregateNcmSyncAgendamento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNcmSyncAgendamento[P]>
      : GetScalarType<T[P], AggregateNcmSyncAgendamento[P]>
  }




  export type NcmSyncAgendamentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NcmSyncAgendamentoWhereInput
    orderBy?: NcmSyncAgendamentoOrderByWithAggregationInput | NcmSyncAgendamentoOrderByWithAggregationInput[]
    by: NcmSyncAgendamentoScalarFieldEnum[] | NcmSyncAgendamentoScalarFieldEnum
    having?: NcmSyncAgendamentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NcmSyncAgendamentoCountAggregateInputType | true
    _min?: NcmSyncAgendamentoMinAggregateInputType
    _max?: NcmSyncAgendamentoMaxAggregateInputType
  }

  export type NcmSyncAgendamentoGroupByOutputType = {
    id_ncm_sync_agendamento: string
    ativo_ncm_sync_agendamento: boolean
    cron_expressao_ncm_sync_agendamento: string
    notificadores_ncm_sync_agendamento: JsonValue
    data_criacao_ncm_sync_agendamento: Date
    data_atualizacao_ncm_sync_agendamento: Date
    _count: NcmSyncAgendamentoCountAggregateOutputType | null
    _min: NcmSyncAgendamentoMinAggregateOutputType | null
    _max: NcmSyncAgendamentoMaxAggregateOutputType | null
  }

  type GetNcmSyncAgendamentoGroupByPayload<T extends NcmSyncAgendamentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NcmSyncAgendamentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NcmSyncAgendamentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NcmSyncAgendamentoGroupByOutputType[P]>
            : GetScalarType<T[P], NcmSyncAgendamentoGroupByOutputType[P]>
        }
      >
    >


  export type NcmSyncAgendamentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ncm_sync_agendamento?: boolean
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: boolean
    notificadores_ncm_sync_agendamento?: boolean
    data_criacao_ncm_sync_agendamento?: boolean
    data_atualizacao_ncm_sync_agendamento?: boolean
  }, ExtArgs["result"]["ncmSyncAgendamento"]>

  export type NcmSyncAgendamentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ncm_sync_agendamento?: boolean
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: boolean
    notificadores_ncm_sync_agendamento?: boolean
    data_criacao_ncm_sync_agendamento?: boolean
    data_atualizacao_ncm_sync_agendamento?: boolean
  }, ExtArgs["result"]["ncmSyncAgendamento"]>

  export type NcmSyncAgendamentoSelectScalar = {
    id_ncm_sync_agendamento?: boolean
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: boolean
    notificadores_ncm_sync_agendamento?: boolean
    data_criacao_ncm_sync_agendamento?: boolean
    data_atualizacao_ncm_sync_agendamento?: boolean
  }


  export type $NcmSyncAgendamentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NcmSyncAgendamento"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_ncm_sync_agendamento: string
      ativo_ncm_sync_agendamento: boolean
      cron_expressao_ncm_sync_agendamento: string
      notificadores_ncm_sync_agendamento: Prisma.JsonValue
      data_criacao_ncm_sync_agendamento: Date
      data_atualizacao_ncm_sync_agendamento: Date
    }, ExtArgs["result"]["ncmSyncAgendamento"]>
    composites: {}
  }

  type NcmSyncAgendamentoGetPayload<S extends boolean | null | undefined | NcmSyncAgendamentoDefaultArgs> = $Result.GetResult<Prisma.$NcmSyncAgendamentoPayload, S>

  type NcmSyncAgendamentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NcmSyncAgendamentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NcmSyncAgendamentoCountAggregateInputType | true
    }

  export interface NcmSyncAgendamentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NcmSyncAgendamento'], meta: { name: 'NcmSyncAgendamento' } }
    /**
     * Find zero or one NcmSyncAgendamento that matches the filter.
     * @param {NcmSyncAgendamentoFindUniqueArgs} args - Arguments to find a NcmSyncAgendamento
     * @example
     * // Get one NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NcmSyncAgendamentoFindUniqueArgs>(args: SelectSubset<T, NcmSyncAgendamentoFindUniqueArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one NcmSyncAgendamento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NcmSyncAgendamentoFindUniqueOrThrowArgs} args - Arguments to find a NcmSyncAgendamento
     * @example
     * // Get one NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NcmSyncAgendamentoFindUniqueOrThrowArgs>(args: SelectSubset<T, NcmSyncAgendamentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first NcmSyncAgendamento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoFindFirstArgs} args - Arguments to find a NcmSyncAgendamento
     * @example
     * // Get one NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NcmSyncAgendamentoFindFirstArgs>(args?: SelectSubset<T, NcmSyncAgendamentoFindFirstArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first NcmSyncAgendamento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoFindFirstOrThrowArgs} args - Arguments to find a NcmSyncAgendamento
     * @example
     * // Get one NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NcmSyncAgendamentoFindFirstOrThrowArgs>(args?: SelectSubset<T, NcmSyncAgendamentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more NcmSyncAgendamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NcmSyncAgendamentos
     * const ncmSyncAgendamentos = await prisma.ncmSyncAgendamento.findMany()
     * 
     * // Get first 10 NcmSyncAgendamentos
     * const ncmSyncAgendamentos = await prisma.ncmSyncAgendamento.findMany({ take: 10 })
     * 
     * // Only select the `id_ncm_sync_agendamento`
     * const ncmSyncAgendamentoWithId_ncm_sync_agendamentoOnly = await prisma.ncmSyncAgendamento.findMany({ select: { id_ncm_sync_agendamento: true } })
     * 
     */
    findMany<T extends NcmSyncAgendamentoFindManyArgs>(args?: SelectSubset<T, NcmSyncAgendamentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a NcmSyncAgendamento.
     * @param {NcmSyncAgendamentoCreateArgs} args - Arguments to create a NcmSyncAgendamento.
     * @example
     * // Create one NcmSyncAgendamento
     * const NcmSyncAgendamento = await prisma.ncmSyncAgendamento.create({
     *   data: {
     *     // ... data to create a NcmSyncAgendamento
     *   }
     * })
     * 
     */
    create<T extends NcmSyncAgendamentoCreateArgs>(args: SelectSubset<T, NcmSyncAgendamentoCreateArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many NcmSyncAgendamentos.
     * @param {NcmSyncAgendamentoCreateManyArgs} args - Arguments to create many NcmSyncAgendamentos.
     * @example
     * // Create many NcmSyncAgendamentos
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NcmSyncAgendamentoCreateManyArgs>(args?: SelectSubset<T, NcmSyncAgendamentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NcmSyncAgendamentos and returns the data saved in the database.
     * @param {NcmSyncAgendamentoCreateManyAndReturnArgs} args - Arguments to create many NcmSyncAgendamentos.
     * @example
     * // Create many NcmSyncAgendamentos
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NcmSyncAgendamentos and only return the `id_ncm_sync_agendamento`
     * const ncmSyncAgendamentoWithId_ncm_sync_agendamentoOnly = await prisma.ncmSyncAgendamento.createManyAndReturn({ 
     *   select: { id_ncm_sync_agendamento: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NcmSyncAgendamentoCreateManyAndReturnArgs>(args?: SelectSubset<T, NcmSyncAgendamentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a NcmSyncAgendamento.
     * @param {NcmSyncAgendamentoDeleteArgs} args - Arguments to delete one NcmSyncAgendamento.
     * @example
     * // Delete one NcmSyncAgendamento
     * const NcmSyncAgendamento = await prisma.ncmSyncAgendamento.delete({
     *   where: {
     *     // ... filter to delete one NcmSyncAgendamento
     *   }
     * })
     * 
     */
    delete<T extends NcmSyncAgendamentoDeleteArgs>(args: SelectSubset<T, NcmSyncAgendamentoDeleteArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one NcmSyncAgendamento.
     * @param {NcmSyncAgendamentoUpdateArgs} args - Arguments to update one NcmSyncAgendamento.
     * @example
     * // Update one NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NcmSyncAgendamentoUpdateArgs>(args: SelectSubset<T, NcmSyncAgendamentoUpdateArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more NcmSyncAgendamentos.
     * @param {NcmSyncAgendamentoDeleteManyArgs} args - Arguments to filter NcmSyncAgendamentos to delete.
     * @example
     * // Delete a few NcmSyncAgendamentos
     * const { count } = await prisma.ncmSyncAgendamento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NcmSyncAgendamentoDeleteManyArgs>(args?: SelectSubset<T, NcmSyncAgendamentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NcmSyncAgendamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NcmSyncAgendamentos
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NcmSyncAgendamentoUpdateManyArgs>(args: SelectSubset<T, NcmSyncAgendamentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NcmSyncAgendamento.
     * @param {NcmSyncAgendamentoUpsertArgs} args - Arguments to update or create a NcmSyncAgendamento.
     * @example
     * // Update or create a NcmSyncAgendamento
     * const ncmSyncAgendamento = await prisma.ncmSyncAgendamento.upsert({
     *   create: {
     *     // ... data to create a NcmSyncAgendamento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NcmSyncAgendamento we want to update
     *   }
     * })
     */
    upsert<T extends NcmSyncAgendamentoUpsertArgs>(args: SelectSubset<T, NcmSyncAgendamentoUpsertArgs<ExtArgs>>): Prisma__NcmSyncAgendamentoClient<$Result.GetResult<Prisma.$NcmSyncAgendamentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of NcmSyncAgendamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoCountArgs} args - Arguments to filter NcmSyncAgendamentos to count.
     * @example
     * // Count the number of NcmSyncAgendamentos
     * const count = await prisma.ncmSyncAgendamento.count({
     *   where: {
     *     // ... the filter for the NcmSyncAgendamentos we want to count
     *   }
     * })
    **/
    count<T extends NcmSyncAgendamentoCountArgs>(
      args?: Subset<T, NcmSyncAgendamentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NcmSyncAgendamentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NcmSyncAgendamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NcmSyncAgendamentoAggregateArgs>(args: Subset<T, NcmSyncAgendamentoAggregateArgs>): Prisma.PrismaPromise<GetNcmSyncAgendamentoAggregateType<T>>

    /**
     * Group by NcmSyncAgendamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NcmSyncAgendamentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NcmSyncAgendamentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NcmSyncAgendamentoGroupByArgs['orderBy'] }
        : { orderBy?: NcmSyncAgendamentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NcmSyncAgendamentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNcmSyncAgendamentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NcmSyncAgendamento model
   */
  readonly fields: NcmSyncAgendamentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NcmSyncAgendamento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NcmSyncAgendamentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NcmSyncAgendamento model
   */ 
  interface NcmSyncAgendamentoFieldRefs {
    readonly id_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'String'>
    readonly ativo_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'Boolean'>
    readonly cron_expressao_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'String'>
    readonly notificadores_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'Json'>
    readonly data_criacao_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'DateTime'>
    readonly data_atualizacao_ncm_sync_agendamento: FieldRef<"NcmSyncAgendamento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NcmSyncAgendamento findUnique
   */
  export type NcmSyncAgendamentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncAgendamento to fetch.
     */
    where: NcmSyncAgendamentoWhereUniqueInput
  }

  /**
   * NcmSyncAgendamento findUniqueOrThrow
   */
  export type NcmSyncAgendamentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncAgendamento to fetch.
     */
    where: NcmSyncAgendamentoWhereUniqueInput
  }

  /**
   * NcmSyncAgendamento findFirst
   */
  export type NcmSyncAgendamentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncAgendamento to fetch.
     */
    where?: NcmSyncAgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncAgendamentos to fetch.
     */
    orderBy?: NcmSyncAgendamentoOrderByWithRelationInput | NcmSyncAgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncAgendamentos.
     */
    cursor?: NcmSyncAgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncAgendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncAgendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncAgendamentos.
     */
    distinct?: NcmSyncAgendamentoScalarFieldEnum | NcmSyncAgendamentoScalarFieldEnum[]
  }

  /**
   * NcmSyncAgendamento findFirstOrThrow
   */
  export type NcmSyncAgendamentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncAgendamento to fetch.
     */
    where?: NcmSyncAgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncAgendamentos to fetch.
     */
    orderBy?: NcmSyncAgendamentoOrderByWithRelationInput | NcmSyncAgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NcmSyncAgendamentos.
     */
    cursor?: NcmSyncAgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncAgendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncAgendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NcmSyncAgendamentos.
     */
    distinct?: NcmSyncAgendamentoScalarFieldEnum | NcmSyncAgendamentoScalarFieldEnum[]
  }

  /**
   * NcmSyncAgendamento findMany
   */
  export type NcmSyncAgendamentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter, which NcmSyncAgendamentos to fetch.
     */
    where?: NcmSyncAgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NcmSyncAgendamentos to fetch.
     */
    orderBy?: NcmSyncAgendamentoOrderByWithRelationInput | NcmSyncAgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NcmSyncAgendamentos.
     */
    cursor?: NcmSyncAgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NcmSyncAgendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NcmSyncAgendamentos.
     */
    skip?: number
    distinct?: NcmSyncAgendamentoScalarFieldEnum | NcmSyncAgendamentoScalarFieldEnum[]
  }

  /**
   * NcmSyncAgendamento create
   */
  export type NcmSyncAgendamentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * The data needed to create a NcmSyncAgendamento.
     */
    data: XOR<NcmSyncAgendamentoCreateInput, NcmSyncAgendamentoUncheckedCreateInput>
  }

  /**
   * NcmSyncAgendamento createMany
   */
  export type NcmSyncAgendamentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NcmSyncAgendamentos.
     */
    data: NcmSyncAgendamentoCreateManyInput | NcmSyncAgendamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSyncAgendamento createManyAndReturn
   */
  export type NcmSyncAgendamentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many NcmSyncAgendamentos.
     */
    data: NcmSyncAgendamentoCreateManyInput | NcmSyncAgendamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NcmSyncAgendamento update
   */
  export type NcmSyncAgendamentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * The data needed to update a NcmSyncAgendamento.
     */
    data: XOR<NcmSyncAgendamentoUpdateInput, NcmSyncAgendamentoUncheckedUpdateInput>
    /**
     * Choose, which NcmSyncAgendamento to update.
     */
    where: NcmSyncAgendamentoWhereUniqueInput
  }

  /**
   * NcmSyncAgendamento updateMany
   */
  export type NcmSyncAgendamentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NcmSyncAgendamentos.
     */
    data: XOR<NcmSyncAgendamentoUpdateManyMutationInput, NcmSyncAgendamentoUncheckedUpdateManyInput>
    /**
     * Filter which NcmSyncAgendamentos to update
     */
    where?: NcmSyncAgendamentoWhereInput
  }

  /**
   * NcmSyncAgendamento upsert
   */
  export type NcmSyncAgendamentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * The filter to search for the NcmSyncAgendamento to update in case it exists.
     */
    where: NcmSyncAgendamentoWhereUniqueInput
    /**
     * In case the NcmSyncAgendamento found by the `where` argument doesn't exist, create a new NcmSyncAgendamento with this data.
     */
    create: XOR<NcmSyncAgendamentoCreateInput, NcmSyncAgendamentoUncheckedCreateInput>
    /**
     * In case the NcmSyncAgendamento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NcmSyncAgendamentoUpdateInput, NcmSyncAgendamentoUncheckedUpdateInput>
  }

  /**
   * NcmSyncAgendamento delete
   */
  export type NcmSyncAgendamentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
    /**
     * Filter which NcmSyncAgendamento to delete.
     */
    where: NcmSyncAgendamentoWhereUniqueInput
  }

  /**
   * NcmSyncAgendamento deleteMany
   */
  export type NcmSyncAgendamentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NcmSyncAgendamentos to delete
     */
    where?: NcmSyncAgendamentoWhereInput
  }

  /**
   * NcmSyncAgendamento without action
   */
  export type NcmSyncAgendamentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NcmSyncAgendamento
     */
    select?: NcmSyncAgendamentoSelect<ExtArgs> | null
  }


  /**
   * Model Ope
   */

  export type AggregateOpe = {
    _count: OpeCountAggregateOutputType | null
    _min: OpeMinAggregateOutputType | null
    _max: OpeMaxAggregateOutputType | null
  }

  export type OpeMinAggregateOutputType = {
    suid_ope: string | null
    id_organizacao_ope: string | null
    id_produto_ope: string | null
    id_usuario_ope: string | null
    codigo_portal_unico_ope: string | null
    situacao_ope: string | null
    versao_ope: string | null
    nome_ope: string | null
    cnpj_raiz_empresa_ope: string | null
    pais_ope: string | null
    estado_ope: string | null
    cidade_ope: string | null
    endereco_ope: string | null
    zip_ope: string | null
    tin_ope: string | null
    email_ope: string | null
    ultima_sincronizacao_ope: Date | null
    origem_ope: string | null
  }

  export type OpeMaxAggregateOutputType = {
    suid_ope: string | null
    id_organizacao_ope: string | null
    id_produto_ope: string | null
    id_usuario_ope: string | null
    codigo_portal_unico_ope: string | null
    situacao_ope: string | null
    versao_ope: string | null
    nome_ope: string | null
    cnpj_raiz_empresa_ope: string | null
    pais_ope: string | null
    estado_ope: string | null
    cidade_ope: string | null
    endereco_ope: string | null
    zip_ope: string | null
    tin_ope: string | null
    email_ope: string | null
    ultima_sincronizacao_ope: Date | null
    origem_ope: string | null
  }

  export type OpeCountAggregateOutputType = {
    suid_ope: number
    id_organizacao_ope: number
    id_produto_ope: number
    id_usuario_ope: number
    codigo_portal_unico_ope: number
    situacao_ope: number
    versao_ope: number
    nome_ope: number
    cnpj_raiz_empresa_ope: number
    pais_ope: number
    estado_ope: number
    cidade_ope: number
    endereco_ope: number
    zip_ope: number
    tin_ope: number
    email_ope: number
    ultima_sincronizacao_ope: number
    origem_ope: number
    _all: number
  }


  export type OpeMinAggregateInputType = {
    suid_ope?: true
    id_organizacao_ope?: true
    id_produto_ope?: true
    id_usuario_ope?: true
    codigo_portal_unico_ope?: true
    situacao_ope?: true
    versao_ope?: true
    nome_ope?: true
    cnpj_raiz_empresa_ope?: true
    pais_ope?: true
    estado_ope?: true
    cidade_ope?: true
    endereco_ope?: true
    zip_ope?: true
    tin_ope?: true
    email_ope?: true
    ultima_sincronizacao_ope?: true
    origem_ope?: true
  }

  export type OpeMaxAggregateInputType = {
    suid_ope?: true
    id_organizacao_ope?: true
    id_produto_ope?: true
    id_usuario_ope?: true
    codigo_portal_unico_ope?: true
    situacao_ope?: true
    versao_ope?: true
    nome_ope?: true
    cnpj_raiz_empresa_ope?: true
    pais_ope?: true
    estado_ope?: true
    cidade_ope?: true
    endereco_ope?: true
    zip_ope?: true
    tin_ope?: true
    email_ope?: true
    ultima_sincronizacao_ope?: true
    origem_ope?: true
  }

  export type OpeCountAggregateInputType = {
    suid_ope?: true
    id_organizacao_ope?: true
    id_produto_ope?: true
    id_usuario_ope?: true
    codigo_portal_unico_ope?: true
    situacao_ope?: true
    versao_ope?: true
    nome_ope?: true
    cnpj_raiz_empresa_ope?: true
    pais_ope?: true
    estado_ope?: true
    cidade_ope?: true
    endereco_ope?: true
    zip_ope?: true
    tin_ope?: true
    email_ope?: true
    ultima_sincronizacao_ope?: true
    origem_ope?: true
    _all?: true
  }

  export type OpeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ope to aggregate.
     */
    where?: OpeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Opes to fetch.
     */
    orderBy?: OpeOrderByWithRelationInput | OpeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OpeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Opes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Opes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Opes
    **/
    _count?: true | OpeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OpeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OpeMaxAggregateInputType
  }

  export type GetOpeAggregateType<T extends OpeAggregateArgs> = {
        [P in keyof T & keyof AggregateOpe]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOpe[P]>
      : GetScalarType<T[P], AggregateOpe[P]>
  }




  export type OpeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OpeWhereInput
    orderBy?: OpeOrderByWithAggregationInput | OpeOrderByWithAggregationInput[]
    by: OpeScalarFieldEnum[] | OpeScalarFieldEnum
    having?: OpeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OpeCountAggregateInputType | true
    _min?: OpeMinAggregateInputType
    _max?: OpeMaxAggregateInputType
  }

  export type OpeGroupByOutputType = {
    suid_ope: string
    id_organizacao_ope: string
    id_produto_ope: string | null
    id_usuario_ope: string | null
    codigo_portal_unico_ope: string
    situacao_ope: string
    versao_ope: string
    nome_ope: string
    cnpj_raiz_empresa_ope: string
    pais_ope: string
    estado_ope: string | null
    cidade_ope: string | null
    endereco_ope: string | null
    zip_ope: string | null
    tin_ope: string | null
    email_ope: string | null
    ultima_sincronizacao_ope: Date
    origem_ope: string
    _count: OpeCountAggregateOutputType | null
    _min: OpeMinAggregateOutputType | null
    _max: OpeMaxAggregateOutputType | null
  }

  type GetOpeGroupByPayload<T extends OpeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OpeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OpeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OpeGroupByOutputType[P]>
            : GetScalarType<T[P], OpeGroupByOutputType[P]>
        }
      >
    >


  export type OpeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_ope?: boolean
    id_organizacao_ope?: boolean
    id_produto_ope?: boolean
    id_usuario_ope?: boolean
    codigo_portal_unico_ope?: boolean
    situacao_ope?: boolean
    versao_ope?: boolean
    nome_ope?: boolean
    cnpj_raiz_empresa_ope?: boolean
    pais_ope?: boolean
    estado_ope?: boolean
    cidade_ope?: boolean
    endereco_ope?: boolean
    zip_ope?: boolean
    tin_ope?: boolean
    email_ope?: boolean
    ultima_sincronizacao_ope?: boolean
    origem_ope?: boolean
  }, ExtArgs["result"]["ope"]>

  export type OpeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_ope?: boolean
    id_organizacao_ope?: boolean
    id_produto_ope?: boolean
    id_usuario_ope?: boolean
    codigo_portal_unico_ope?: boolean
    situacao_ope?: boolean
    versao_ope?: boolean
    nome_ope?: boolean
    cnpj_raiz_empresa_ope?: boolean
    pais_ope?: boolean
    estado_ope?: boolean
    cidade_ope?: boolean
    endereco_ope?: boolean
    zip_ope?: boolean
    tin_ope?: boolean
    email_ope?: boolean
    ultima_sincronizacao_ope?: boolean
    origem_ope?: boolean
  }, ExtArgs["result"]["ope"]>

  export type OpeSelectScalar = {
    suid_ope?: boolean
    id_organizacao_ope?: boolean
    id_produto_ope?: boolean
    id_usuario_ope?: boolean
    codigo_portal_unico_ope?: boolean
    situacao_ope?: boolean
    versao_ope?: boolean
    nome_ope?: boolean
    cnpj_raiz_empresa_ope?: boolean
    pais_ope?: boolean
    estado_ope?: boolean
    cidade_ope?: boolean
    endereco_ope?: boolean
    zip_ope?: boolean
    tin_ope?: boolean
    email_ope?: boolean
    ultima_sincronizacao_ope?: boolean
    origem_ope?: boolean
  }


  export type $OpePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ope"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      suid_ope: string
      id_organizacao_ope: string
      id_produto_ope: string | null
      id_usuario_ope: string | null
      codigo_portal_unico_ope: string
      situacao_ope: string
      versao_ope: string
      nome_ope: string
      cnpj_raiz_empresa_ope: string
      pais_ope: string
      estado_ope: string | null
      cidade_ope: string | null
      endereco_ope: string | null
      zip_ope: string | null
      tin_ope: string | null
      email_ope: string | null
      ultima_sincronizacao_ope: Date
      origem_ope: string
    }, ExtArgs["result"]["ope"]>
    composites: {}
  }

  type OpeGetPayload<S extends boolean | null | undefined | OpeDefaultArgs> = $Result.GetResult<Prisma.$OpePayload, S>

  type OpeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OpeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OpeCountAggregateInputType | true
    }

  export interface OpeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ope'], meta: { name: 'Ope' } }
    /**
     * Find zero or one Ope that matches the filter.
     * @param {OpeFindUniqueArgs} args - Arguments to find a Ope
     * @example
     * // Get one Ope
     * const ope = await prisma.ope.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OpeFindUniqueArgs>(args: SelectSubset<T, OpeFindUniqueArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Ope that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OpeFindUniqueOrThrowArgs} args - Arguments to find a Ope
     * @example
     * // Get one Ope
     * const ope = await prisma.ope.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OpeFindUniqueOrThrowArgs>(args: SelectSubset<T, OpeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Ope that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeFindFirstArgs} args - Arguments to find a Ope
     * @example
     * // Get one Ope
     * const ope = await prisma.ope.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OpeFindFirstArgs>(args?: SelectSubset<T, OpeFindFirstArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Ope that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeFindFirstOrThrowArgs} args - Arguments to find a Ope
     * @example
     * // Get one Ope
     * const ope = await prisma.ope.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OpeFindFirstOrThrowArgs>(args?: SelectSubset<T, OpeFindFirstOrThrowArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Opes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Opes
     * const opes = await prisma.ope.findMany()
     * 
     * // Get first 10 Opes
     * const opes = await prisma.ope.findMany({ take: 10 })
     * 
     * // Only select the `suid_ope`
     * const opeWithSuid_opeOnly = await prisma.ope.findMany({ select: { suid_ope: true } })
     * 
     */
    findMany<T extends OpeFindManyArgs>(args?: SelectSubset<T, OpeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Ope.
     * @param {OpeCreateArgs} args - Arguments to create a Ope.
     * @example
     * // Create one Ope
     * const Ope = await prisma.ope.create({
     *   data: {
     *     // ... data to create a Ope
     *   }
     * })
     * 
     */
    create<T extends OpeCreateArgs>(args: SelectSubset<T, OpeCreateArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Opes.
     * @param {OpeCreateManyArgs} args - Arguments to create many Opes.
     * @example
     * // Create many Opes
     * const ope = await prisma.ope.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OpeCreateManyArgs>(args?: SelectSubset<T, OpeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Opes and returns the data saved in the database.
     * @param {OpeCreateManyAndReturnArgs} args - Arguments to create many Opes.
     * @example
     * // Create many Opes
     * const ope = await prisma.ope.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Opes and only return the `suid_ope`
     * const opeWithSuid_opeOnly = await prisma.ope.createManyAndReturn({ 
     *   select: { suid_ope: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OpeCreateManyAndReturnArgs>(args?: SelectSubset<T, OpeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Ope.
     * @param {OpeDeleteArgs} args - Arguments to delete one Ope.
     * @example
     * // Delete one Ope
     * const Ope = await prisma.ope.delete({
     *   where: {
     *     // ... filter to delete one Ope
     *   }
     * })
     * 
     */
    delete<T extends OpeDeleteArgs>(args: SelectSubset<T, OpeDeleteArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Ope.
     * @param {OpeUpdateArgs} args - Arguments to update one Ope.
     * @example
     * // Update one Ope
     * const ope = await prisma.ope.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OpeUpdateArgs>(args: SelectSubset<T, OpeUpdateArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Opes.
     * @param {OpeDeleteManyArgs} args - Arguments to filter Opes to delete.
     * @example
     * // Delete a few Opes
     * const { count } = await prisma.ope.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OpeDeleteManyArgs>(args?: SelectSubset<T, OpeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Opes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Opes
     * const ope = await prisma.ope.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OpeUpdateManyArgs>(args: SelectSubset<T, OpeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ope.
     * @param {OpeUpsertArgs} args - Arguments to update or create a Ope.
     * @example
     * // Update or create a Ope
     * const ope = await prisma.ope.upsert({
     *   create: {
     *     // ... data to create a Ope
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ope we want to update
     *   }
     * })
     */
    upsert<T extends OpeUpsertArgs>(args: SelectSubset<T, OpeUpsertArgs<ExtArgs>>): Prisma__OpeClient<$Result.GetResult<Prisma.$OpePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Opes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeCountArgs} args - Arguments to filter Opes to count.
     * @example
     * // Count the number of Opes
     * const count = await prisma.ope.count({
     *   where: {
     *     // ... the filter for the Opes we want to count
     *   }
     * })
    **/
    count<T extends OpeCountArgs>(
      args?: Subset<T, OpeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OpeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ope.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OpeAggregateArgs>(args: Subset<T, OpeAggregateArgs>): Prisma.PrismaPromise<GetOpeAggregateType<T>>

    /**
     * Group by Ope.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OpeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OpeGroupByArgs['orderBy'] }
        : { orderBy?: OpeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OpeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ope model
   */
  readonly fields: OpeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ope.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OpeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ope model
   */ 
  interface OpeFieldRefs {
    readonly suid_ope: FieldRef<"Ope", 'String'>
    readonly id_organizacao_ope: FieldRef<"Ope", 'String'>
    readonly id_produto_ope: FieldRef<"Ope", 'String'>
    readonly id_usuario_ope: FieldRef<"Ope", 'String'>
    readonly codigo_portal_unico_ope: FieldRef<"Ope", 'String'>
    readonly situacao_ope: FieldRef<"Ope", 'String'>
    readonly versao_ope: FieldRef<"Ope", 'String'>
    readonly nome_ope: FieldRef<"Ope", 'String'>
    readonly cnpj_raiz_empresa_ope: FieldRef<"Ope", 'String'>
    readonly pais_ope: FieldRef<"Ope", 'String'>
    readonly estado_ope: FieldRef<"Ope", 'String'>
    readonly cidade_ope: FieldRef<"Ope", 'String'>
    readonly endereco_ope: FieldRef<"Ope", 'String'>
    readonly zip_ope: FieldRef<"Ope", 'String'>
    readonly tin_ope: FieldRef<"Ope", 'String'>
    readonly email_ope: FieldRef<"Ope", 'String'>
    readonly ultima_sincronizacao_ope: FieldRef<"Ope", 'DateTime'>
    readonly origem_ope: FieldRef<"Ope", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Ope findUnique
   */
  export type OpeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter, which Ope to fetch.
     */
    where: OpeWhereUniqueInput
  }

  /**
   * Ope findUniqueOrThrow
   */
  export type OpeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter, which Ope to fetch.
     */
    where: OpeWhereUniqueInput
  }

  /**
   * Ope findFirst
   */
  export type OpeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter, which Ope to fetch.
     */
    where?: OpeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Opes to fetch.
     */
    orderBy?: OpeOrderByWithRelationInput | OpeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Opes.
     */
    cursor?: OpeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Opes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Opes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Opes.
     */
    distinct?: OpeScalarFieldEnum | OpeScalarFieldEnum[]
  }

  /**
   * Ope findFirstOrThrow
   */
  export type OpeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter, which Ope to fetch.
     */
    where?: OpeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Opes to fetch.
     */
    orderBy?: OpeOrderByWithRelationInput | OpeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Opes.
     */
    cursor?: OpeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Opes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Opes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Opes.
     */
    distinct?: OpeScalarFieldEnum | OpeScalarFieldEnum[]
  }

  /**
   * Ope findMany
   */
  export type OpeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter, which Opes to fetch.
     */
    where?: OpeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Opes to fetch.
     */
    orderBy?: OpeOrderByWithRelationInput | OpeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Opes.
     */
    cursor?: OpeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Opes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Opes.
     */
    skip?: number
    distinct?: OpeScalarFieldEnum | OpeScalarFieldEnum[]
  }

  /**
   * Ope create
   */
  export type OpeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * The data needed to create a Ope.
     */
    data: XOR<OpeCreateInput, OpeUncheckedCreateInput>
  }

  /**
   * Ope createMany
   */
  export type OpeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Opes.
     */
    data: OpeCreateManyInput | OpeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ope createManyAndReturn
   */
  export type OpeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Opes.
     */
    data: OpeCreateManyInput | OpeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ope update
   */
  export type OpeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * The data needed to update a Ope.
     */
    data: XOR<OpeUpdateInput, OpeUncheckedUpdateInput>
    /**
     * Choose, which Ope to update.
     */
    where: OpeWhereUniqueInput
  }

  /**
   * Ope updateMany
   */
  export type OpeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Opes.
     */
    data: XOR<OpeUpdateManyMutationInput, OpeUncheckedUpdateManyInput>
    /**
     * Filter which Opes to update
     */
    where?: OpeWhereInput
  }

  /**
   * Ope upsert
   */
  export type OpeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * The filter to search for the Ope to update in case it exists.
     */
    where: OpeWhereUniqueInput
    /**
     * In case the Ope found by the `where` argument doesn't exist, create a new Ope with this data.
     */
    create: XOR<OpeCreateInput, OpeUncheckedCreateInput>
    /**
     * In case the Ope was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OpeUpdateInput, OpeUncheckedUpdateInput>
  }

  /**
   * Ope delete
   */
  export type OpeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
    /**
     * Filter which Ope to delete.
     */
    where: OpeWhereUniqueInput
  }

  /**
   * Ope deleteMany
   */
  export type OpeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Opes to delete
     */
    where?: OpeWhereInput
  }

  /**
   * Ope without action
   */
  export type OpeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ope
     */
    select?: OpeSelect<ExtArgs> | null
  }


  /**
   * Model OPEHistoricoStatus
   */

  export type AggregateOPEHistoricoStatus = {
    _count: OPEHistoricoStatusCountAggregateOutputType | null
    _min: OPEHistoricoStatusMinAggregateOutputType | null
    _max: OPEHistoricoStatusMaxAggregateOutputType | null
  }

  export type OPEHistoricoStatusMinAggregateOutputType = {
    id_ope_historico_status: string | null
    id_organizacao_ope_historico_status: string | null
    id_produto_ope_historico_status: string | null
    id_usuario_ope_historico_status: string | null
    suid_ope_historico_status: string | null
    status_anterior_ope_historico_status: string | null
    status_novo_ope_historico_status: string | null
    origem_ope_historico_status: string | null
    registrado_em_ope_historico_status: Date | null
  }

  export type OPEHistoricoStatusMaxAggregateOutputType = {
    id_ope_historico_status: string | null
    id_organizacao_ope_historico_status: string | null
    id_produto_ope_historico_status: string | null
    id_usuario_ope_historico_status: string | null
    suid_ope_historico_status: string | null
    status_anterior_ope_historico_status: string | null
    status_novo_ope_historico_status: string | null
    origem_ope_historico_status: string | null
    registrado_em_ope_historico_status: Date | null
  }

  export type OPEHistoricoStatusCountAggregateOutputType = {
    id_ope_historico_status: number
    id_organizacao_ope_historico_status: number
    id_produto_ope_historico_status: number
    id_usuario_ope_historico_status: number
    suid_ope_historico_status: number
    status_anterior_ope_historico_status: number
    status_novo_ope_historico_status: number
    origem_ope_historico_status: number
    payload_ope_historico_status: number
    registrado_em_ope_historico_status: number
    _all: number
  }


  export type OPEHistoricoStatusMinAggregateInputType = {
    id_ope_historico_status?: true
    id_organizacao_ope_historico_status?: true
    id_produto_ope_historico_status?: true
    id_usuario_ope_historico_status?: true
    suid_ope_historico_status?: true
    status_anterior_ope_historico_status?: true
    status_novo_ope_historico_status?: true
    origem_ope_historico_status?: true
    registrado_em_ope_historico_status?: true
  }

  export type OPEHistoricoStatusMaxAggregateInputType = {
    id_ope_historico_status?: true
    id_organizacao_ope_historico_status?: true
    id_produto_ope_historico_status?: true
    id_usuario_ope_historico_status?: true
    suid_ope_historico_status?: true
    status_anterior_ope_historico_status?: true
    status_novo_ope_historico_status?: true
    origem_ope_historico_status?: true
    registrado_em_ope_historico_status?: true
  }

  export type OPEHistoricoStatusCountAggregateInputType = {
    id_ope_historico_status?: true
    id_organizacao_ope_historico_status?: true
    id_produto_ope_historico_status?: true
    id_usuario_ope_historico_status?: true
    suid_ope_historico_status?: true
    status_anterior_ope_historico_status?: true
    status_novo_ope_historico_status?: true
    origem_ope_historico_status?: true
    payload_ope_historico_status?: true
    registrado_em_ope_historico_status?: true
    _all?: true
  }

  export type OPEHistoricoStatusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OPEHistoricoStatus to aggregate.
     */
    where?: OPEHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPEHistoricoStatuses to fetch.
     */
    orderBy?: OPEHistoricoStatusOrderByWithRelationInput | OPEHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OPEHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPEHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPEHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OPEHistoricoStatuses
    **/
    _count?: true | OPEHistoricoStatusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OPEHistoricoStatusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OPEHistoricoStatusMaxAggregateInputType
  }

  export type GetOPEHistoricoStatusAggregateType<T extends OPEHistoricoStatusAggregateArgs> = {
        [P in keyof T & keyof AggregateOPEHistoricoStatus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOPEHistoricoStatus[P]>
      : GetScalarType<T[P], AggregateOPEHistoricoStatus[P]>
  }




  export type OPEHistoricoStatusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OPEHistoricoStatusWhereInput
    orderBy?: OPEHistoricoStatusOrderByWithAggregationInput | OPEHistoricoStatusOrderByWithAggregationInput[]
    by: OPEHistoricoStatusScalarFieldEnum[] | OPEHistoricoStatusScalarFieldEnum
    having?: OPEHistoricoStatusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OPEHistoricoStatusCountAggregateInputType | true
    _min?: OPEHistoricoStatusMinAggregateInputType
    _max?: OPEHistoricoStatusMaxAggregateInputType
  }

  export type OPEHistoricoStatusGroupByOutputType = {
    id_ope_historico_status: string
    id_organizacao_ope_historico_status: string | null
    id_produto_ope_historico_status: string | null
    id_usuario_ope_historico_status: string | null
    suid_ope_historico_status: string
    status_anterior_ope_historico_status: string | null
    status_novo_ope_historico_status: string
    origem_ope_historico_status: string
    payload_ope_historico_status: JsonValue
    registrado_em_ope_historico_status: Date
    _count: OPEHistoricoStatusCountAggregateOutputType | null
    _min: OPEHistoricoStatusMinAggregateOutputType | null
    _max: OPEHistoricoStatusMaxAggregateOutputType | null
  }

  type GetOPEHistoricoStatusGroupByPayload<T extends OPEHistoricoStatusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OPEHistoricoStatusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OPEHistoricoStatusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OPEHistoricoStatusGroupByOutputType[P]>
            : GetScalarType<T[P], OPEHistoricoStatusGroupByOutputType[P]>
        }
      >
    >


  export type OPEHistoricoStatusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ope_historico_status?: boolean
    id_organizacao_ope_historico_status?: boolean
    id_produto_ope_historico_status?: boolean
    id_usuario_ope_historico_status?: boolean
    suid_ope_historico_status?: boolean
    status_anterior_ope_historico_status?: boolean
    status_novo_ope_historico_status?: boolean
    origem_ope_historico_status?: boolean
    payload_ope_historico_status?: boolean
    registrado_em_ope_historico_status?: boolean
  }, ExtArgs["result"]["oPEHistoricoStatus"]>

  export type OPEHistoricoStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ope_historico_status?: boolean
    id_organizacao_ope_historico_status?: boolean
    id_produto_ope_historico_status?: boolean
    id_usuario_ope_historico_status?: boolean
    suid_ope_historico_status?: boolean
    status_anterior_ope_historico_status?: boolean
    status_novo_ope_historico_status?: boolean
    origem_ope_historico_status?: boolean
    payload_ope_historico_status?: boolean
    registrado_em_ope_historico_status?: boolean
  }, ExtArgs["result"]["oPEHistoricoStatus"]>

  export type OPEHistoricoStatusSelectScalar = {
    id_ope_historico_status?: boolean
    id_organizacao_ope_historico_status?: boolean
    id_produto_ope_historico_status?: boolean
    id_usuario_ope_historico_status?: boolean
    suid_ope_historico_status?: boolean
    status_anterior_ope_historico_status?: boolean
    status_novo_ope_historico_status?: boolean
    origem_ope_historico_status?: boolean
    payload_ope_historico_status?: boolean
    registrado_em_ope_historico_status?: boolean
  }


  export type $OPEHistoricoStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OPEHistoricoStatus"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_ope_historico_status: string
      id_organizacao_ope_historico_status: string | null
      id_produto_ope_historico_status: string | null
      id_usuario_ope_historico_status: string | null
      suid_ope_historico_status: string
      status_anterior_ope_historico_status: string | null
      status_novo_ope_historico_status: string
      origem_ope_historico_status: string
      payload_ope_historico_status: Prisma.JsonValue
      registrado_em_ope_historico_status: Date
    }, ExtArgs["result"]["oPEHistoricoStatus"]>
    composites: {}
  }

  type OPEHistoricoStatusGetPayload<S extends boolean | null | undefined | OPEHistoricoStatusDefaultArgs> = $Result.GetResult<Prisma.$OPEHistoricoStatusPayload, S>

  type OPEHistoricoStatusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OPEHistoricoStatusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OPEHistoricoStatusCountAggregateInputType | true
    }

  export interface OPEHistoricoStatusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OPEHistoricoStatus'], meta: { name: 'OPEHistoricoStatus' } }
    /**
     * Find zero or one OPEHistoricoStatus that matches the filter.
     * @param {OPEHistoricoStatusFindUniqueArgs} args - Arguments to find a OPEHistoricoStatus
     * @example
     * // Get one OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OPEHistoricoStatusFindUniqueArgs>(args: SelectSubset<T, OPEHistoricoStatusFindUniqueArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OPEHistoricoStatus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OPEHistoricoStatusFindUniqueOrThrowArgs} args - Arguments to find a OPEHistoricoStatus
     * @example
     * // Get one OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OPEHistoricoStatusFindUniqueOrThrowArgs>(args: SelectSubset<T, OPEHistoricoStatusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OPEHistoricoStatus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusFindFirstArgs} args - Arguments to find a OPEHistoricoStatus
     * @example
     * // Get one OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OPEHistoricoStatusFindFirstArgs>(args?: SelectSubset<T, OPEHistoricoStatusFindFirstArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OPEHistoricoStatus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusFindFirstOrThrowArgs} args - Arguments to find a OPEHistoricoStatus
     * @example
     * // Get one OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OPEHistoricoStatusFindFirstOrThrowArgs>(args?: SelectSubset<T, OPEHistoricoStatusFindFirstOrThrowArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OPEHistoricoStatuses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OPEHistoricoStatuses
     * const oPEHistoricoStatuses = await prisma.oPEHistoricoStatus.findMany()
     * 
     * // Get first 10 OPEHistoricoStatuses
     * const oPEHistoricoStatuses = await prisma.oPEHistoricoStatus.findMany({ take: 10 })
     * 
     * // Only select the `id_ope_historico_status`
     * const oPEHistoricoStatusWithId_ope_historico_statusOnly = await prisma.oPEHistoricoStatus.findMany({ select: { id_ope_historico_status: true } })
     * 
     */
    findMany<T extends OPEHistoricoStatusFindManyArgs>(args?: SelectSubset<T, OPEHistoricoStatusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OPEHistoricoStatus.
     * @param {OPEHistoricoStatusCreateArgs} args - Arguments to create a OPEHistoricoStatus.
     * @example
     * // Create one OPEHistoricoStatus
     * const OPEHistoricoStatus = await prisma.oPEHistoricoStatus.create({
     *   data: {
     *     // ... data to create a OPEHistoricoStatus
     *   }
     * })
     * 
     */
    create<T extends OPEHistoricoStatusCreateArgs>(args: SelectSubset<T, OPEHistoricoStatusCreateArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OPEHistoricoStatuses.
     * @param {OPEHistoricoStatusCreateManyArgs} args - Arguments to create many OPEHistoricoStatuses.
     * @example
     * // Create many OPEHistoricoStatuses
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OPEHistoricoStatusCreateManyArgs>(args?: SelectSubset<T, OPEHistoricoStatusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OPEHistoricoStatuses and returns the data saved in the database.
     * @param {OPEHistoricoStatusCreateManyAndReturnArgs} args - Arguments to create many OPEHistoricoStatuses.
     * @example
     * // Create many OPEHistoricoStatuses
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OPEHistoricoStatuses and only return the `id_ope_historico_status`
     * const oPEHistoricoStatusWithId_ope_historico_statusOnly = await prisma.oPEHistoricoStatus.createManyAndReturn({ 
     *   select: { id_ope_historico_status: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OPEHistoricoStatusCreateManyAndReturnArgs>(args?: SelectSubset<T, OPEHistoricoStatusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OPEHistoricoStatus.
     * @param {OPEHistoricoStatusDeleteArgs} args - Arguments to delete one OPEHistoricoStatus.
     * @example
     * // Delete one OPEHistoricoStatus
     * const OPEHistoricoStatus = await prisma.oPEHistoricoStatus.delete({
     *   where: {
     *     // ... filter to delete one OPEHistoricoStatus
     *   }
     * })
     * 
     */
    delete<T extends OPEHistoricoStatusDeleteArgs>(args: SelectSubset<T, OPEHistoricoStatusDeleteArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OPEHistoricoStatus.
     * @param {OPEHistoricoStatusUpdateArgs} args - Arguments to update one OPEHistoricoStatus.
     * @example
     * // Update one OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OPEHistoricoStatusUpdateArgs>(args: SelectSubset<T, OPEHistoricoStatusUpdateArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OPEHistoricoStatuses.
     * @param {OPEHistoricoStatusDeleteManyArgs} args - Arguments to filter OPEHistoricoStatuses to delete.
     * @example
     * // Delete a few OPEHistoricoStatuses
     * const { count } = await prisma.oPEHistoricoStatus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OPEHistoricoStatusDeleteManyArgs>(args?: SelectSubset<T, OPEHistoricoStatusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OPEHistoricoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OPEHistoricoStatuses
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OPEHistoricoStatusUpdateManyArgs>(args: SelectSubset<T, OPEHistoricoStatusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OPEHistoricoStatus.
     * @param {OPEHistoricoStatusUpsertArgs} args - Arguments to update or create a OPEHistoricoStatus.
     * @example
     * // Update or create a OPEHistoricoStatus
     * const oPEHistoricoStatus = await prisma.oPEHistoricoStatus.upsert({
     *   create: {
     *     // ... data to create a OPEHistoricoStatus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OPEHistoricoStatus we want to update
     *   }
     * })
     */
    upsert<T extends OPEHistoricoStatusUpsertArgs>(args: SelectSubset<T, OPEHistoricoStatusUpsertArgs<ExtArgs>>): Prisma__OPEHistoricoStatusClient<$Result.GetResult<Prisma.$OPEHistoricoStatusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OPEHistoricoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusCountArgs} args - Arguments to filter OPEHistoricoStatuses to count.
     * @example
     * // Count the number of OPEHistoricoStatuses
     * const count = await prisma.oPEHistoricoStatus.count({
     *   where: {
     *     // ... the filter for the OPEHistoricoStatuses we want to count
     *   }
     * })
    **/
    count<T extends OPEHistoricoStatusCountArgs>(
      args?: Subset<T, OPEHistoricoStatusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OPEHistoricoStatusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OPEHistoricoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OPEHistoricoStatusAggregateArgs>(args: Subset<T, OPEHistoricoStatusAggregateArgs>): Prisma.PrismaPromise<GetOPEHistoricoStatusAggregateType<T>>

    /**
     * Group by OPEHistoricoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEHistoricoStatusGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OPEHistoricoStatusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OPEHistoricoStatusGroupByArgs['orderBy'] }
        : { orderBy?: OPEHistoricoStatusGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OPEHistoricoStatusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOPEHistoricoStatusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OPEHistoricoStatus model
   */
  readonly fields: OPEHistoricoStatusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OPEHistoricoStatus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OPEHistoricoStatusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OPEHistoricoStatus model
   */ 
  interface OPEHistoricoStatusFieldRefs {
    readonly id_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly id_organizacao_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly id_produto_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly id_usuario_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly suid_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly status_anterior_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly status_novo_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly origem_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'String'>
    readonly payload_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'Json'>
    readonly registrado_em_ope_historico_status: FieldRef<"OPEHistoricoStatus", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OPEHistoricoStatus findUnique
   */
  export type OPEHistoricoStatusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OPEHistoricoStatus to fetch.
     */
    where: OPEHistoricoStatusWhereUniqueInput
  }

  /**
   * OPEHistoricoStatus findUniqueOrThrow
   */
  export type OPEHistoricoStatusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OPEHistoricoStatus to fetch.
     */
    where: OPEHistoricoStatusWhereUniqueInput
  }

  /**
   * OPEHistoricoStatus findFirst
   */
  export type OPEHistoricoStatusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OPEHistoricoStatus to fetch.
     */
    where?: OPEHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPEHistoricoStatuses to fetch.
     */
    orderBy?: OPEHistoricoStatusOrderByWithRelationInput | OPEHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OPEHistoricoStatuses.
     */
    cursor?: OPEHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPEHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPEHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OPEHistoricoStatuses.
     */
    distinct?: OPEHistoricoStatusScalarFieldEnum | OPEHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OPEHistoricoStatus findFirstOrThrow
   */
  export type OPEHistoricoStatusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OPEHistoricoStatus to fetch.
     */
    where?: OPEHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPEHistoricoStatuses to fetch.
     */
    orderBy?: OPEHistoricoStatusOrderByWithRelationInput | OPEHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OPEHistoricoStatuses.
     */
    cursor?: OPEHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPEHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPEHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OPEHistoricoStatuses.
     */
    distinct?: OPEHistoricoStatusScalarFieldEnum | OPEHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OPEHistoricoStatus findMany
   */
  export type OPEHistoricoStatusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OPEHistoricoStatuses to fetch.
     */
    where?: OPEHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPEHistoricoStatuses to fetch.
     */
    orderBy?: OPEHistoricoStatusOrderByWithRelationInput | OPEHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OPEHistoricoStatuses.
     */
    cursor?: OPEHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPEHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPEHistoricoStatuses.
     */
    skip?: number
    distinct?: OPEHistoricoStatusScalarFieldEnum | OPEHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OPEHistoricoStatus create
   */
  export type OPEHistoricoStatusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * The data needed to create a OPEHistoricoStatus.
     */
    data: XOR<OPEHistoricoStatusCreateInput, OPEHistoricoStatusUncheckedCreateInput>
  }

  /**
   * OPEHistoricoStatus createMany
   */
  export type OPEHistoricoStatusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OPEHistoricoStatuses.
     */
    data: OPEHistoricoStatusCreateManyInput | OPEHistoricoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OPEHistoricoStatus createManyAndReturn
   */
  export type OPEHistoricoStatusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OPEHistoricoStatuses.
     */
    data: OPEHistoricoStatusCreateManyInput | OPEHistoricoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OPEHistoricoStatus update
   */
  export type OPEHistoricoStatusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * The data needed to update a OPEHistoricoStatus.
     */
    data: XOR<OPEHistoricoStatusUpdateInput, OPEHistoricoStatusUncheckedUpdateInput>
    /**
     * Choose, which OPEHistoricoStatus to update.
     */
    where: OPEHistoricoStatusWhereUniqueInput
  }

  /**
   * OPEHistoricoStatus updateMany
   */
  export type OPEHistoricoStatusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OPEHistoricoStatuses.
     */
    data: XOR<OPEHistoricoStatusUpdateManyMutationInput, OPEHistoricoStatusUncheckedUpdateManyInput>
    /**
     * Filter which OPEHistoricoStatuses to update
     */
    where?: OPEHistoricoStatusWhereInput
  }

  /**
   * OPEHistoricoStatus upsert
   */
  export type OPEHistoricoStatusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * The filter to search for the OPEHistoricoStatus to update in case it exists.
     */
    where: OPEHistoricoStatusWhereUniqueInput
    /**
     * In case the OPEHistoricoStatus found by the `where` argument doesn't exist, create a new OPEHistoricoStatus with this data.
     */
    create: XOR<OPEHistoricoStatusCreateInput, OPEHistoricoStatusUncheckedCreateInput>
    /**
     * In case the OPEHistoricoStatus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OPEHistoricoStatusUpdateInput, OPEHistoricoStatusUncheckedUpdateInput>
  }

  /**
   * OPEHistoricoStatus delete
   */
  export type OPEHistoricoStatusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter which OPEHistoricoStatus to delete.
     */
    where: OPEHistoricoStatusWhereUniqueInput
  }

  /**
   * OPEHistoricoStatus deleteMany
   */
  export type OPEHistoricoStatusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OPEHistoricoStatuses to delete
     */
    where?: OPEHistoricoStatusWhereInput
  }

  /**
   * OPEHistoricoStatus without action
   */
  export type OPEHistoricoStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPEHistoricoStatus
     */
    select?: OPEHistoricoStatusSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const FornecedorScalarFieldEnum: {
    id_fornecedor: 'id_fornecedor',
    id_organizacao_cadastro_fornecedor: 'id_organizacao_cadastro_fornecedor',
    id_produto_fornecedor: 'id_produto_fornecedor',
    id_usuario_cadastro_fornecedor: 'id_usuario_cadastro_fornecedor',
    nome_fornecedor: 'nome_fornecedor',
    cnpj_fornecedor: 'cnpj_fornecedor',
    tin_fornecedor: 'tin_fornecedor',
    pais_fornecedor: 'pais_fornecedor',
    estado_provincia_fornecedor: 'estado_provincia_fornecedor',
    cidade_fornecedor: 'cidade_fornecedor',
    endereco_fornecedor: 'endereco_fornecedor',
    cep_zipcode_fornecedor: 'cep_zipcode_fornecedor',
    email_principal_fornecedor: 'email_principal_fornecedor',
    telefone_principal_fornecedor: 'telefone_principal_fornecedor',
    whatsapp_principal_fornecedor: 'whatsapp_principal_fornecedor',
    pode_ser_importador_fornecedor: 'pode_ser_importador_fornecedor',
    pode_ser_exportador_fornecedor: 'pode_ser_exportador_fornecedor',
    pode_ser_fabricante_fornecedor: 'pode_ser_fabricante_fornecedor',
    pode_ser_agente_fornecedor: 'pode_ser_agente_fornecedor',
    pode_ser_despachante_fornecedor: 'pode_ser_despachante_fornecedor',
    pode_ser_armador_fornecedor: 'pode_ser_armador_fornecedor',
    pode_ser_armazem_alfandegado_fornecedor: 'pode_ser_armazem_alfandegado_fornecedor',
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: 'pode_ser_transportadora_rodoviaria_nacional_fornecedor',
    pode_ser_cia_aerea_fornecedor: 'pode_ser_cia_aerea_fornecedor',
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: 'pode_ser_transportadora_rodoviaria_internacional_fornecedor',
    pode_ser_seguradora_internacional_fornecedor: 'pode_ser_seguradora_internacional_fornecedor',
    pode_ser_seguradora_corretora_cambio_fornecedor: 'pode_ser_seguradora_corretora_cambio_fornecedor',
    pode_ser_banco_fornecedor: 'pode_ser_banco_fornecedor',
    pode_ser_armazem_nacional_fornecedor: 'pode_ser_armazem_nacional_fornecedor',
    ativo_fornecedor: 'ativo_fornecedor',
    criado_em_fornecedor: 'criado_em_fornecedor',
    atualizado_em_fornecedor: 'atualizado_em_fornecedor'
  };

  export type FornecedorScalarFieldEnum = (typeof FornecedorScalarFieldEnum)[keyof typeof FornecedorScalarFieldEnum]


  export const FornecedorOrganizacaoScalarFieldEnum: {
    id_fornecedor_organizacao: 'id_fornecedor_organizacao',
    id_fornecedor: 'id_fornecedor',
    id_organizacao: 'id_organizacao',
    tipo_fornecedor_organizacao: 'tipo_fornecedor_organizacao',
    status_fornecedor_organizacao: 'status_fornecedor_organizacao',
    id_usuario: 'id_usuario',
    data_criacao_fornecedor_organizacao: 'data_criacao_fornecedor_organizacao',
    data_atualizacao_fornecedor_organizacao: 'data_atualizacao_fornecedor_organizacao'
  };

  export type FornecedorOrganizacaoScalarFieldEnum = (typeof FornecedorOrganizacaoScalarFieldEnum)[keyof typeof FornecedorOrganizacaoScalarFieldEnum]


  export const PaisScalarFieldEnum: {
    id_pais: 'id_pais',
    nome_pais_portugues: 'nome_pais_portugues',
    nome_pais_ingles: 'nome_pais_ingles',
    codigo_pais_portal_unico_siscomex: 'codigo_pais_portal_unico_siscomex',
    codigo_pais_bacen_4: 'codigo_pais_bacen_4',
    codigo_pais_bacen_5: 'codigo_pais_bacen_5',
    codigo_pais_sped_nfe: 'codigo_pais_sped_nfe',
    codigo_pais_sped_efd: 'codigo_pais_sped_efd',
    codigo_pais_iso_alpha2: 'codigo_pais_iso_alpha2',
    codigo_pais_iso_alpha3: 'codigo_pais_iso_alpha3',
    codigo_pais_iso_numerico: 'codigo_pais_iso_numerico',
    ativo_pais: 'ativo_pais'
  };

  export type PaisScalarFieldEnum = (typeof PaisScalarFieldEnum)[keyof typeof PaisScalarFieldEnum]


  export const MoedaScalarFieldEnum: {
    codigo_moeda: 'codigo_moeda',
    nome_moeda: 'nome_moeda',
    simbolo_moeda: 'simbolo_moeda',
    ativo_moeda: 'ativo_moeda'
  };

  export type MoedaScalarFieldEnum = (typeof MoedaScalarFieldEnum)[keyof typeof MoedaScalarFieldEnum]


  export const UnidadeScalarFieldEnum: {
    codigo_unidade: 'codigo_unidade',
    nome_unidade: 'nome_unidade',
    tipo_unidade: 'tipo_unidade',
    ativo_unidade: 'ativo_unidade'
  };

  export type UnidadeScalarFieldEnum = (typeof UnidadeScalarFieldEnum)[keyof typeof UnidadeScalarFieldEnum]


  export const IncotermScalarFieldEnum: {
    codigo_incoterm: 'codigo_incoterm',
    nome_incoterm: 'nome_incoterm',
    descricao_incoterm: 'descricao_incoterm',
    modal_transporte: 'modal_transporte',
    versao_incoterm: 'versao_incoterm',
    ativo_incoterm: 'ativo_incoterm'
  };

  export type IncotermScalarFieldEnum = (typeof IncotermScalarFieldEnum)[keyof typeof IncotermScalarFieldEnum]


  export const PortoScalarFieldEnum: {
    id_porto: 'id_porto',
    codigo_unlocode_porto: 'codigo_unlocode_porto',
    codigo_pais_porto: 'codigo_pais_porto',
    codigo_local_porto: 'codigo_local_porto',
    nome_porto: 'nome_porto',
    nome_ascii_porto: 'nome_ascii_porto',
    subdivisao_porto: 'subdivisao_porto',
    latitude_porto: 'latitude_porto',
    longitude_porto: 'longitude_porto',
    codigo_iata_porto: 'codigo_iata_porto',
    ativo_porto: 'ativo_porto'
  };

  export type PortoScalarFieldEnum = (typeof PortoScalarFieldEnum)[keyof typeof PortoScalarFieldEnum]


  export const AeroportoScalarFieldEnum: {
    id_aeroporto: 'id_aeroporto',
    codigo_unlocode_aeroporto: 'codigo_unlocode_aeroporto',
    codigo_pais_aeroporto: 'codigo_pais_aeroporto',
    codigo_local_aeroporto: 'codigo_local_aeroporto',
    nome_aeroporto: 'nome_aeroporto',
    nome_ascii_aeroporto: 'nome_ascii_aeroporto',
    subdivisao_aeroporto: 'subdivisao_aeroporto',
    latitude_aeroporto: 'latitude_aeroporto',
    longitude_aeroporto: 'longitude_aeroporto',
    codigo_iata_aeroporto: 'codigo_iata_aeroporto',
    ativo_aeroporto: 'ativo_aeroporto'
  };

  export type AeroportoScalarFieldEnum = (typeof AeroportoScalarFieldEnum)[keyof typeof AeroportoScalarFieldEnum]


  export const ContainerScalarFieldEnum: {
    id_container: 'id_container',
    tipo_container: 'tipo_container',
    tamanho_container: 'tamanho_container',
    codigo_iso_container: 'codigo_iso_container',
    armador_dono_container: 'armador_dono_container',
    ativo_container: 'ativo_container'
  };

  export type ContainerScalarFieldEnum = (typeof ContainerScalarFieldEnum)[keyof typeof ContainerScalarFieldEnum]


  export const NcmSyncScalarFieldEnum: {
    codigo_ncm_sync: 'codigo_ncm_sync',
    descricao_ncm_sync: 'descricao_ncm_sync',
    ipi_ncm_sync: 'ipi_ncm_sync',
    ii_ncm_sync: 'ii_ncm_sync',
    pis_ncm_sync: 'pis_ncm_sync',
    cofins_ncm_sync: 'cofins_ncm_sync',
    ativo_ncm_sync: 'ativo_ncm_sync',
    data_inicio_ncm_sync: 'data_inicio_ncm_sync',
    data_fim_ncm_sync: 'data_fim_ncm_sync',
    id_ncm_sync_log: 'id_ncm_sync_log',
    data_criacao_ncm_sync: 'data_criacao_ncm_sync',
    data_atualizacao_ncm_sync: 'data_atualizacao_ncm_sync'
  };

  export type NcmSyncScalarFieldEnum = (typeof NcmSyncScalarFieldEnum)[keyof typeof NcmSyncScalarFieldEnum]


  export const NcmSyncLogScalarFieldEnum: {
    id_ncm_sync_log: 'id_ncm_sync_log',
    data_inicio_ncm_sync_log: 'data_inicio_ncm_sync_log',
    data_conclusao_ncm_sync_log: 'data_conclusao_ncm_sync_log',
    status_ncm_sync_log: 'status_ncm_sync_log',
    total_ncm_sync_log: 'total_ncm_sync_log',
    adicionados_ncm_sync_log: 'adicionados_ncm_sync_log',
    alterados_ncm_sync_log: 'alterados_ncm_sync_log',
    removidos_ncm_sync_log: 'removidos_ncm_sync_log',
    origem_ncm_sync_log: 'origem_ncm_sync_log',
    disparado_por_ncm_sync_log: 'disparado_por_ncm_sync_log',
    mensagem_erro_ncm_sync_log: 'mensagem_erro_ncm_sync_log',
    data_criacao_ncm_sync_log: 'data_criacao_ncm_sync_log',
    data_atualizacao_ncm_sync_log: 'data_atualizacao_ncm_sync_log'
  };

  export type NcmSyncLogScalarFieldEnum = (typeof NcmSyncLogScalarFieldEnum)[keyof typeof NcmSyncLogScalarFieldEnum]


  export const NcmSyncAgendamentoScalarFieldEnum: {
    id_ncm_sync_agendamento: 'id_ncm_sync_agendamento',
    ativo_ncm_sync_agendamento: 'ativo_ncm_sync_agendamento',
    cron_expressao_ncm_sync_agendamento: 'cron_expressao_ncm_sync_agendamento',
    notificadores_ncm_sync_agendamento: 'notificadores_ncm_sync_agendamento',
    data_criacao_ncm_sync_agendamento: 'data_criacao_ncm_sync_agendamento',
    data_atualizacao_ncm_sync_agendamento: 'data_atualizacao_ncm_sync_agendamento'
  };

  export type NcmSyncAgendamentoScalarFieldEnum = (typeof NcmSyncAgendamentoScalarFieldEnum)[keyof typeof NcmSyncAgendamentoScalarFieldEnum]


  export const OpeScalarFieldEnum: {
    suid_ope: 'suid_ope',
    id_organizacao_ope: 'id_organizacao_ope',
    id_produto_ope: 'id_produto_ope',
    id_usuario_ope: 'id_usuario_ope',
    codigo_portal_unico_ope: 'codigo_portal_unico_ope',
    situacao_ope: 'situacao_ope',
    versao_ope: 'versao_ope',
    nome_ope: 'nome_ope',
    cnpj_raiz_empresa_ope: 'cnpj_raiz_empresa_ope',
    pais_ope: 'pais_ope',
    estado_ope: 'estado_ope',
    cidade_ope: 'cidade_ope',
    endereco_ope: 'endereco_ope',
    zip_ope: 'zip_ope',
    tin_ope: 'tin_ope',
    email_ope: 'email_ope',
    ultima_sincronizacao_ope: 'ultima_sincronizacao_ope',
    origem_ope: 'origem_ope'
  };

  export type OpeScalarFieldEnum = (typeof OpeScalarFieldEnum)[keyof typeof OpeScalarFieldEnum]


  export const OPEHistoricoStatusScalarFieldEnum: {
    id_ope_historico_status: 'id_ope_historico_status',
    id_organizacao_ope_historico_status: 'id_organizacao_ope_historico_status',
    id_produto_ope_historico_status: 'id_produto_ope_historico_status',
    id_usuario_ope_historico_status: 'id_usuario_ope_historico_status',
    suid_ope_historico_status: 'suid_ope_historico_status',
    status_anterior_ope_historico_status: 'status_anterior_ope_historico_status',
    status_novo_ope_historico_status: 'status_novo_ope_historico_status',
    origem_ope_historico_status: 'origem_ope_historico_status',
    payload_ope_historico_status: 'payload_ope_historico_status',
    registrado_em_ope_historico_status: 'registrado_em_ope_historico_status'
  };

  export type OPEHistoricoStatusScalarFieldEnum = (typeof OPEHistoricoStatusScalarFieldEnum)[keyof typeof OPEHistoricoStatusScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'TipoFornecedorOrganizacao'
   */
  export type EnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoFornecedorOrganizacao'>
    


  /**
   * Reference to a field of type 'TipoFornecedorOrganizacao[]'
   */
  export type ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoFornecedorOrganizacao[]'>
    


  /**
   * Reference to a field of type 'StatusFornecedorOrganizacao'
   */
  export type EnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusFornecedorOrganizacao'>
    


  /**
   * Reference to a field of type 'StatusFornecedorOrganizacao[]'
   */
  export type ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusFornecedorOrganizacao[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'ContainerTipo'
   */
  export type EnumContainerTipoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ContainerTipo'>
    


  /**
   * Reference to a field of type 'ContainerTipo[]'
   */
  export type ListEnumContainerTipoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ContainerTipo[]'>
    


  /**
   * Reference to a field of type 'NcmSyncStatusSincronizacao'
   */
  export type EnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NcmSyncStatusSincronizacao'>
    


  /**
   * Reference to a field of type 'NcmSyncStatusSincronizacao[]'
   */
  export type ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NcmSyncStatusSincronizacao[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'NcmSyncOrigemSincronizacao'
   */
  export type EnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NcmSyncOrigemSincronizacao'>
    


  /**
   * Reference to a field of type 'NcmSyncOrigemSincronizacao[]'
   */
  export type ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NcmSyncOrigemSincronizacao[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    
  /**
   * Deep Input Types
   */


  export type FornecedorWhereInput = {
    AND?: FornecedorWhereInput | FornecedorWhereInput[]
    OR?: FornecedorWhereInput[]
    NOT?: FornecedorWhereInput | FornecedorWhereInput[]
    id_fornecedor?: StringFilter<"Fornecedor"> | string
    id_organizacao_cadastro_fornecedor?: StringFilter<"Fornecedor"> | string
    id_produto_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    id_usuario_cadastro_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    nome_fornecedor?: StringFilter<"Fornecedor"> | string
    cnpj_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    tin_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    pais_fornecedor?: StringFilter<"Fornecedor"> | string
    estado_provincia_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    cidade_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    endereco_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    cep_zipcode_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    email_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    telefone_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    whatsapp_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    pode_ser_importador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_exportador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_fabricante_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_agente_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_despachante_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_banco_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    ativo_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    criado_em_fornecedor?: DateTimeFilter<"Fornecedor"> | Date | string
    atualizado_em_fornecedor?: DateTimeFilter<"Fornecedor"> | Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoListRelationFilter
  }

  export type FornecedorOrderByWithRelationInput = {
    id_fornecedor?: SortOrder
    id_organizacao_cadastro_fornecedor?: SortOrder
    id_produto_fornecedor?: SortOrderInput | SortOrder
    id_usuario_cadastro_fornecedor?: SortOrderInput | SortOrder
    nome_fornecedor?: SortOrder
    cnpj_fornecedor?: SortOrderInput | SortOrder
    tin_fornecedor?: SortOrderInput | SortOrder
    pais_fornecedor?: SortOrder
    estado_provincia_fornecedor?: SortOrderInput | SortOrder
    cidade_fornecedor?: SortOrderInput | SortOrder
    endereco_fornecedor?: SortOrderInput | SortOrder
    cep_zipcode_fornecedor?: SortOrderInput | SortOrder
    email_principal_fornecedor?: SortOrderInput | SortOrder
    telefone_principal_fornecedor?: SortOrderInput | SortOrder
    whatsapp_principal_fornecedor?: SortOrderInput | SortOrder
    pode_ser_importador_fornecedor?: SortOrder
    pode_ser_exportador_fornecedor?: SortOrder
    pode_ser_fabricante_fornecedor?: SortOrder
    pode_ser_agente_fornecedor?: SortOrder
    pode_ser_despachante_fornecedor?: SortOrder
    pode_ser_armador_fornecedor?: SortOrder
    pode_ser_armazem_alfandegado_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: SortOrder
    pode_ser_cia_aerea_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_corretora_cambio_fornecedor?: SortOrder
    pode_ser_banco_fornecedor?: SortOrder
    pode_ser_armazem_nacional_fornecedor?: SortOrder
    ativo_fornecedor?: SortOrder
    criado_em_fornecedor?: SortOrder
    atualizado_em_fornecedor?: SortOrder
    fornecedores_organizacao?: FornecedorOrganizacaoOrderByRelationAggregateInput
  }

  export type FornecedorWhereUniqueInput = Prisma.AtLeast<{
    id_fornecedor?: string
    id_organizacao_cadastro_fornecedor_cnpj_fornecedor?: FornecedorId_organizacao_cadastro_fornecedorCnpj_fornecedorCompoundUniqueInput
    id_organizacao_cadastro_fornecedor_tin_fornecedor_pais_fornecedor?: FornecedorId_organizacao_cadastro_fornecedorTin_fornecedorPais_fornecedorCompoundUniqueInput
    AND?: FornecedorWhereInput | FornecedorWhereInput[]
    OR?: FornecedorWhereInput[]
    NOT?: FornecedorWhereInput | FornecedorWhereInput[]
    id_organizacao_cadastro_fornecedor?: StringFilter<"Fornecedor"> | string
    id_produto_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    id_usuario_cadastro_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    nome_fornecedor?: StringFilter<"Fornecedor"> | string
    cnpj_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    tin_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    pais_fornecedor?: StringFilter<"Fornecedor"> | string
    estado_provincia_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    cidade_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    endereco_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    cep_zipcode_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    email_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    telefone_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    whatsapp_principal_fornecedor?: StringNullableFilter<"Fornecedor"> | string | null
    pode_ser_importador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_exportador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_fabricante_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_agente_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_despachante_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armador_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_banco_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    ativo_fornecedor?: BoolFilter<"Fornecedor"> | boolean
    criado_em_fornecedor?: DateTimeFilter<"Fornecedor"> | Date | string
    atualizado_em_fornecedor?: DateTimeFilter<"Fornecedor"> | Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoListRelationFilter
  }, "id_fornecedor" | "id_organizacao_cadastro_fornecedor_cnpj_fornecedor" | "id_organizacao_cadastro_fornecedor_tin_fornecedor_pais_fornecedor">

  export type FornecedorOrderByWithAggregationInput = {
    id_fornecedor?: SortOrder
    id_organizacao_cadastro_fornecedor?: SortOrder
    id_produto_fornecedor?: SortOrderInput | SortOrder
    id_usuario_cadastro_fornecedor?: SortOrderInput | SortOrder
    nome_fornecedor?: SortOrder
    cnpj_fornecedor?: SortOrderInput | SortOrder
    tin_fornecedor?: SortOrderInput | SortOrder
    pais_fornecedor?: SortOrder
    estado_provincia_fornecedor?: SortOrderInput | SortOrder
    cidade_fornecedor?: SortOrderInput | SortOrder
    endereco_fornecedor?: SortOrderInput | SortOrder
    cep_zipcode_fornecedor?: SortOrderInput | SortOrder
    email_principal_fornecedor?: SortOrderInput | SortOrder
    telefone_principal_fornecedor?: SortOrderInput | SortOrder
    whatsapp_principal_fornecedor?: SortOrderInput | SortOrder
    pode_ser_importador_fornecedor?: SortOrder
    pode_ser_exportador_fornecedor?: SortOrder
    pode_ser_fabricante_fornecedor?: SortOrder
    pode_ser_agente_fornecedor?: SortOrder
    pode_ser_despachante_fornecedor?: SortOrder
    pode_ser_armador_fornecedor?: SortOrder
    pode_ser_armazem_alfandegado_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: SortOrder
    pode_ser_cia_aerea_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_corretora_cambio_fornecedor?: SortOrder
    pode_ser_banco_fornecedor?: SortOrder
    pode_ser_armazem_nacional_fornecedor?: SortOrder
    ativo_fornecedor?: SortOrder
    criado_em_fornecedor?: SortOrder
    atualizado_em_fornecedor?: SortOrder
    _count?: FornecedorCountOrderByAggregateInput
    _max?: FornecedorMaxOrderByAggregateInput
    _min?: FornecedorMinOrderByAggregateInput
  }

  export type FornecedorScalarWhereWithAggregatesInput = {
    AND?: FornecedorScalarWhereWithAggregatesInput | FornecedorScalarWhereWithAggregatesInput[]
    OR?: FornecedorScalarWhereWithAggregatesInput[]
    NOT?: FornecedorScalarWhereWithAggregatesInput | FornecedorScalarWhereWithAggregatesInput[]
    id_fornecedor?: StringWithAggregatesFilter<"Fornecedor"> | string
    id_organizacao_cadastro_fornecedor?: StringWithAggregatesFilter<"Fornecedor"> | string
    id_produto_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    id_usuario_cadastro_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    nome_fornecedor?: StringWithAggregatesFilter<"Fornecedor"> | string
    cnpj_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    tin_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    pais_fornecedor?: StringWithAggregatesFilter<"Fornecedor"> | string
    estado_provincia_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    cidade_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    endereco_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    cep_zipcode_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    email_principal_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    telefone_principal_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    whatsapp_principal_fornecedor?: StringNullableWithAggregatesFilter<"Fornecedor"> | string | null
    pode_ser_importador_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_exportador_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_fabricante_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_agente_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_despachante_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_armador_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_cia_aerea_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_banco_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    ativo_fornecedor?: BoolWithAggregatesFilter<"Fornecedor"> | boolean
    criado_em_fornecedor?: DateTimeWithAggregatesFilter<"Fornecedor"> | Date | string
    atualizado_em_fornecedor?: DateTimeWithAggregatesFilter<"Fornecedor"> | Date | string
  }

  export type FornecedorOrganizacaoWhereInput = {
    AND?: FornecedorOrganizacaoWhereInput | FornecedorOrganizacaoWhereInput[]
    OR?: FornecedorOrganizacaoWhereInput[]
    NOT?: FornecedorOrganizacaoWhereInput | FornecedorOrganizacaoWhereInput[]
    id_fornecedor_organizacao?: StringFilter<"FornecedorOrganizacao"> | string
    id_fornecedor?: StringFilter<"FornecedorOrganizacao"> | string
    id_organizacao?: StringFilter<"FornecedorOrganizacao"> | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.StatusFornecedorOrganizacao
    id_usuario?: StringNullableFilter<"FornecedorOrganizacao"> | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
    fornecedor?: XOR<FornecedorRelationFilter, FornecedorWhereInput>
  }

  export type FornecedorOrganizacaoOrderByWithRelationInput = {
    id_fornecedor_organizacao?: SortOrder
    id_fornecedor?: SortOrder
    id_organizacao?: SortOrder
    tipo_fornecedor_organizacao?: SortOrder
    status_fornecedor_organizacao?: SortOrder
    id_usuario?: SortOrderInput | SortOrder
    data_criacao_fornecedor_organizacao?: SortOrder
    data_atualizacao_fornecedor_organizacao?: SortOrder
    fornecedor?: FornecedorOrderByWithRelationInput
  }

  export type FornecedorOrganizacaoWhereUniqueInput = Prisma.AtLeast<{
    id_fornecedor_organizacao?: string
    id_fornecedor_id_organizacao_tipo_fornecedor_organizacao?: FornecedorOrganizacaoId_fornecedorId_organizacaoTipo_fornecedor_organizacaoCompoundUniqueInput
    AND?: FornecedorOrganizacaoWhereInput | FornecedorOrganizacaoWhereInput[]
    OR?: FornecedorOrganizacaoWhereInput[]
    NOT?: FornecedorOrganizacaoWhereInput | FornecedorOrganizacaoWhereInput[]
    id_fornecedor?: StringFilter<"FornecedorOrganizacao"> | string
    id_organizacao?: StringFilter<"FornecedorOrganizacao"> | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.StatusFornecedorOrganizacao
    id_usuario?: StringNullableFilter<"FornecedorOrganizacao"> | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
    fornecedor?: XOR<FornecedorRelationFilter, FornecedorWhereInput>
  }, "id_fornecedor_organizacao" | "id_fornecedor_id_organizacao_tipo_fornecedor_organizacao">

  export type FornecedorOrganizacaoOrderByWithAggregationInput = {
    id_fornecedor_organizacao?: SortOrder
    id_fornecedor?: SortOrder
    id_organizacao?: SortOrder
    tipo_fornecedor_organizacao?: SortOrder
    status_fornecedor_organizacao?: SortOrder
    id_usuario?: SortOrderInput | SortOrder
    data_criacao_fornecedor_organizacao?: SortOrder
    data_atualizacao_fornecedor_organizacao?: SortOrder
    _count?: FornecedorOrganizacaoCountOrderByAggregateInput
    _max?: FornecedorOrganizacaoMaxOrderByAggregateInput
    _min?: FornecedorOrganizacaoMinOrderByAggregateInput
  }

  export type FornecedorOrganizacaoScalarWhereWithAggregatesInput = {
    AND?: FornecedorOrganizacaoScalarWhereWithAggregatesInput | FornecedorOrganizacaoScalarWhereWithAggregatesInput[]
    OR?: FornecedorOrganizacaoScalarWhereWithAggregatesInput[]
    NOT?: FornecedorOrganizacaoScalarWhereWithAggregatesInput | FornecedorOrganizacaoScalarWhereWithAggregatesInput[]
    id_fornecedor_organizacao?: StringWithAggregatesFilter<"FornecedorOrganizacao"> | string
    id_fornecedor?: StringWithAggregatesFilter<"FornecedorOrganizacao"> | string
    id_organizacao?: StringWithAggregatesFilter<"FornecedorOrganizacao"> | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoWithAggregatesFilter<"FornecedorOrganizacao"> | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoWithAggregatesFilter<"FornecedorOrganizacao"> | $Enums.StatusFornecedorOrganizacao
    id_usuario?: StringNullableWithAggregatesFilter<"FornecedorOrganizacao"> | string | null
    data_criacao_fornecedor_organizacao?: DateTimeWithAggregatesFilter<"FornecedorOrganizacao"> | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeWithAggregatesFilter<"FornecedorOrganizacao"> | Date | string
  }

  export type PaisWhereInput = {
    AND?: PaisWhereInput | PaisWhereInput[]
    OR?: PaisWhereInput[]
    NOT?: PaisWhereInput | PaisWhereInput[]
    id_pais?: StringFilter<"Pais"> | string
    nome_pais_portugues?: StringFilter<"Pais"> | string
    nome_pais_ingles?: StringFilter<"Pais"> | string
    codigo_pais_portal_unico_siscomex?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_bacen_4?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_bacen_5?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_sped_nfe?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_sped_efd?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_iso_alpha2?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_iso_alpha3?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_iso_numerico?: StringNullableFilter<"Pais"> | string | null
    ativo_pais?: BoolFilter<"Pais"> | boolean
  }

  export type PaisOrderByWithRelationInput = {
    id_pais?: SortOrder
    nome_pais_portugues?: SortOrder
    nome_pais_ingles?: SortOrder
    codigo_pais_portal_unico_siscomex?: SortOrderInput | SortOrder
    codigo_pais_bacen_4?: SortOrderInput | SortOrder
    codigo_pais_bacen_5?: SortOrderInput | SortOrder
    codigo_pais_sped_nfe?: SortOrderInput | SortOrder
    codigo_pais_sped_efd?: SortOrderInput | SortOrder
    codigo_pais_iso_alpha2?: SortOrderInput | SortOrder
    codigo_pais_iso_alpha3?: SortOrderInput | SortOrder
    codigo_pais_iso_numerico?: SortOrderInput | SortOrder
    ativo_pais?: SortOrder
  }

  export type PaisWhereUniqueInput = Prisma.AtLeast<{
    id_pais?: string
    nome_pais_portugues?: string
    codigo_pais_iso_alpha2?: string
    codigo_pais_iso_alpha3?: string
    AND?: PaisWhereInput | PaisWhereInput[]
    OR?: PaisWhereInput[]
    NOT?: PaisWhereInput | PaisWhereInput[]
    nome_pais_ingles?: StringFilter<"Pais"> | string
    codigo_pais_portal_unico_siscomex?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_bacen_4?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_bacen_5?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_sped_nfe?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_sped_efd?: StringNullableFilter<"Pais"> | string | null
    codigo_pais_iso_numerico?: StringNullableFilter<"Pais"> | string | null
    ativo_pais?: BoolFilter<"Pais"> | boolean
  }, "id_pais" | "nome_pais_portugues" | "codigo_pais_iso_alpha2" | "codigo_pais_iso_alpha3">

  export type PaisOrderByWithAggregationInput = {
    id_pais?: SortOrder
    nome_pais_portugues?: SortOrder
    nome_pais_ingles?: SortOrder
    codigo_pais_portal_unico_siscomex?: SortOrderInput | SortOrder
    codigo_pais_bacen_4?: SortOrderInput | SortOrder
    codigo_pais_bacen_5?: SortOrderInput | SortOrder
    codigo_pais_sped_nfe?: SortOrderInput | SortOrder
    codigo_pais_sped_efd?: SortOrderInput | SortOrder
    codigo_pais_iso_alpha2?: SortOrderInput | SortOrder
    codigo_pais_iso_alpha3?: SortOrderInput | SortOrder
    codigo_pais_iso_numerico?: SortOrderInput | SortOrder
    ativo_pais?: SortOrder
    _count?: PaisCountOrderByAggregateInput
    _max?: PaisMaxOrderByAggregateInput
    _min?: PaisMinOrderByAggregateInput
  }

  export type PaisScalarWhereWithAggregatesInput = {
    AND?: PaisScalarWhereWithAggregatesInput | PaisScalarWhereWithAggregatesInput[]
    OR?: PaisScalarWhereWithAggregatesInput[]
    NOT?: PaisScalarWhereWithAggregatesInput | PaisScalarWhereWithAggregatesInput[]
    id_pais?: StringWithAggregatesFilter<"Pais"> | string
    nome_pais_portugues?: StringWithAggregatesFilter<"Pais"> | string
    nome_pais_ingles?: StringWithAggregatesFilter<"Pais"> | string
    codigo_pais_portal_unico_siscomex?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_bacen_4?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_bacen_5?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_sped_nfe?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_sped_efd?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_iso_alpha2?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_iso_alpha3?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    codigo_pais_iso_numerico?: StringNullableWithAggregatesFilter<"Pais"> | string | null
    ativo_pais?: BoolWithAggregatesFilter<"Pais"> | boolean
  }

  export type MoedaWhereInput = {
    AND?: MoedaWhereInput | MoedaWhereInput[]
    OR?: MoedaWhereInput[]
    NOT?: MoedaWhereInput | MoedaWhereInput[]
    codigo_moeda?: StringFilter<"Moeda"> | string
    nome_moeda?: StringFilter<"Moeda"> | string
    simbolo_moeda?: StringFilter<"Moeda"> | string
    ativo_moeda?: BoolFilter<"Moeda"> | boolean
  }

  export type MoedaOrderByWithRelationInput = {
    codigo_moeda?: SortOrder
    nome_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaWhereUniqueInput = Prisma.AtLeast<{
    codigo_moeda?: string
    AND?: MoedaWhereInput | MoedaWhereInput[]
    OR?: MoedaWhereInput[]
    NOT?: MoedaWhereInput | MoedaWhereInput[]
    nome_moeda?: StringFilter<"Moeda"> | string
    simbolo_moeda?: StringFilter<"Moeda"> | string
    ativo_moeda?: BoolFilter<"Moeda"> | boolean
  }, "codigo_moeda">

  export type MoedaOrderByWithAggregationInput = {
    codigo_moeda?: SortOrder
    nome_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
    _count?: MoedaCountOrderByAggregateInput
    _max?: MoedaMaxOrderByAggregateInput
    _min?: MoedaMinOrderByAggregateInput
  }

  export type MoedaScalarWhereWithAggregatesInput = {
    AND?: MoedaScalarWhereWithAggregatesInput | MoedaScalarWhereWithAggregatesInput[]
    OR?: MoedaScalarWhereWithAggregatesInput[]
    NOT?: MoedaScalarWhereWithAggregatesInput | MoedaScalarWhereWithAggregatesInput[]
    codigo_moeda?: StringWithAggregatesFilter<"Moeda"> | string
    nome_moeda?: StringWithAggregatesFilter<"Moeda"> | string
    simbolo_moeda?: StringWithAggregatesFilter<"Moeda"> | string
    ativo_moeda?: BoolWithAggregatesFilter<"Moeda"> | boolean
  }

  export type UnidadeWhereInput = {
    AND?: UnidadeWhereInput | UnidadeWhereInput[]
    OR?: UnidadeWhereInput[]
    NOT?: UnidadeWhereInput | UnidadeWhereInput[]
    codigo_unidade?: StringFilter<"Unidade"> | string
    nome_unidade?: StringFilter<"Unidade"> | string
    tipo_unidade?: StringFilter<"Unidade"> | string
    ativo_unidade?: BoolFilter<"Unidade"> | boolean
  }

  export type UnidadeOrderByWithRelationInput = {
    codigo_unidade?: SortOrder
    nome_unidade?: SortOrder
    tipo_unidade?: SortOrder
    ativo_unidade?: SortOrder
  }

  export type UnidadeWhereUniqueInput = Prisma.AtLeast<{
    codigo_unidade?: string
    AND?: UnidadeWhereInput | UnidadeWhereInput[]
    OR?: UnidadeWhereInput[]
    NOT?: UnidadeWhereInput | UnidadeWhereInput[]
    nome_unidade?: StringFilter<"Unidade"> | string
    tipo_unidade?: StringFilter<"Unidade"> | string
    ativo_unidade?: BoolFilter<"Unidade"> | boolean
  }, "codigo_unidade">

  export type UnidadeOrderByWithAggregationInput = {
    codigo_unidade?: SortOrder
    nome_unidade?: SortOrder
    tipo_unidade?: SortOrder
    ativo_unidade?: SortOrder
    _count?: UnidadeCountOrderByAggregateInput
    _max?: UnidadeMaxOrderByAggregateInput
    _min?: UnidadeMinOrderByAggregateInput
  }

  export type UnidadeScalarWhereWithAggregatesInput = {
    AND?: UnidadeScalarWhereWithAggregatesInput | UnidadeScalarWhereWithAggregatesInput[]
    OR?: UnidadeScalarWhereWithAggregatesInput[]
    NOT?: UnidadeScalarWhereWithAggregatesInput | UnidadeScalarWhereWithAggregatesInput[]
    codigo_unidade?: StringWithAggregatesFilter<"Unidade"> | string
    nome_unidade?: StringWithAggregatesFilter<"Unidade"> | string
    tipo_unidade?: StringWithAggregatesFilter<"Unidade"> | string
    ativo_unidade?: BoolWithAggregatesFilter<"Unidade"> | boolean
  }

  export type IncotermWhereInput = {
    AND?: IncotermWhereInput | IncotermWhereInput[]
    OR?: IncotermWhereInput[]
    NOT?: IncotermWhereInput | IncotermWhereInput[]
    codigo_incoterm?: StringFilter<"Incoterm"> | string
    nome_incoterm?: StringFilter<"Incoterm"> | string
    descricao_incoterm?: StringNullableFilter<"Incoterm"> | string | null
    modal_transporte?: StringFilter<"Incoterm"> | string
    versao_incoterm?: StringFilter<"Incoterm"> | string
    ativo_incoterm?: BoolFilter<"Incoterm"> | boolean
  }

  export type IncotermOrderByWithRelationInput = {
    codigo_incoterm?: SortOrder
    nome_incoterm?: SortOrder
    descricao_incoterm?: SortOrderInput | SortOrder
    modal_transporte?: SortOrder
    versao_incoterm?: SortOrder
    ativo_incoterm?: SortOrder
  }

  export type IncotermWhereUniqueInput = Prisma.AtLeast<{
    codigo_incoterm?: string
    AND?: IncotermWhereInput | IncotermWhereInput[]
    OR?: IncotermWhereInput[]
    NOT?: IncotermWhereInput | IncotermWhereInput[]
    nome_incoterm?: StringFilter<"Incoterm"> | string
    descricao_incoterm?: StringNullableFilter<"Incoterm"> | string | null
    modal_transporte?: StringFilter<"Incoterm"> | string
    versao_incoterm?: StringFilter<"Incoterm"> | string
    ativo_incoterm?: BoolFilter<"Incoterm"> | boolean
  }, "codigo_incoterm">

  export type IncotermOrderByWithAggregationInput = {
    codigo_incoterm?: SortOrder
    nome_incoterm?: SortOrder
    descricao_incoterm?: SortOrderInput | SortOrder
    modal_transporte?: SortOrder
    versao_incoterm?: SortOrder
    ativo_incoterm?: SortOrder
    _count?: IncotermCountOrderByAggregateInput
    _max?: IncotermMaxOrderByAggregateInput
    _min?: IncotermMinOrderByAggregateInput
  }

  export type IncotermScalarWhereWithAggregatesInput = {
    AND?: IncotermScalarWhereWithAggregatesInput | IncotermScalarWhereWithAggregatesInput[]
    OR?: IncotermScalarWhereWithAggregatesInput[]
    NOT?: IncotermScalarWhereWithAggregatesInput | IncotermScalarWhereWithAggregatesInput[]
    codigo_incoterm?: StringWithAggregatesFilter<"Incoterm"> | string
    nome_incoterm?: StringWithAggregatesFilter<"Incoterm"> | string
    descricao_incoterm?: StringNullableWithAggregatesFilter<"Incoterm"> | string | null
    modal_transporte?: StringWithAggregatesFilter<"Incoterm"> | string
    versao_incoterm?: StringWithAggregatesFilter<"Incoterm"> | string
    ativo_incoterm?: BoolWithAggregatesFilter<"Incoterm"> | boolean
  }

  export type PortoWhereInput = {
    AND?: PortoWhereInput | PortoWhereInput[]
    OR?: PortoWhereInput[]
    NOT?: PortoWhereInput | PortoWhereInput[]
    id_porto?: StringFilter<"Porto"> | string
    codigo_unlocode_porto?: StringFilter<"Porto"> | string
    codigo_pais_porto?: StringFilter<"Porto"> | string
    codigo_local_porto?: StringFilter<"Porto"> | string
    nome_porto?: StringFilter<"Porto"> | string
    nome_ascii_porto?: StringFilter<"Porto"> | string
    subdivisao_porto?: StringNullableFilter<"Porto"> | string | null
    latitude_porto?: FloatNullableFilter<"Porto"> | number | null
    longitude_porto?: FloatNullableFilter<"Porto"> | number | null
    codigo_iata_porto?: StringNullableFilter<"Porto"> | string | null
    ativo_porto?: BoolFilter<"Porto"> | boolean
  }

  export type PortoOrderByWithRelationInput = {
    id_porto?: SortOrder
    codigo_unlocode_porto?: SortOrder
    codigo_pais_porto?: SortOrder
    codigo_local_porto?: SortOrder
    nome_porto?: SortOrder
    nome_ascii_porto?: SortOrder
    subdivisao_porto?: SortOrderInput | SortOrder
    latitude_porto?: SortOrderInput | SortOrder
    longitude_porto?: SortOrderInput | SortOrder
    codigo_iata_porto?: SortOrderInput | SortOrder
    ativo_porto?: SortOrder
  }

  export type PortoWhereUniqueInput = Prisma.AtLeast<{
    id_porto?: string
    codigo_unlocode_porto?: string
    AND?: PortoWhereInput | PortoWhereInput[]
    OR?: PortoWhereInput[]
    NOT?: PortoWhereInput | PortoWhereInput[]
    codigo_pais_porto?: StringFilter<"Porto"> | string
    codigo_local_porto?: StringFilter<"Porto"> | string
    nome_porto?: StringFilter<"Porto"> | string
    nome_ascii_porto?: StringFilter<"Porto"> | string
    subdivisao_porto?: StringNullableFilter<"Porto"> | string | null
    latitude_porto?: FloatNullableFilter<"Porto"> | number | null
    longitude_porto?: FloatNullableFilter<"Porto"> | number | null
    codigo_iata_porto?: StringNullableFilter<"Porto"> | string | null
    ativo_porto?: BoolFilter<"Porto"> | boolean
  }, "id_porto" | "codigo_unlocode_porto">

  export type PortoOrderByWithAggregationInput = {
    id_porto?: SortOrder
    codigo_unlocode_porto?: SortOrder
    codigo_pais_porto?: SortOrder
    codigo_local_porto?: SortOrder
    nome_porto?: SortOrder
    nome_ascii_porto?: SortOrder
    subdivisao_porto?: SortOrderInput | SortOrder
    latitude_porto?: SortOrderInput | SortOrder
    longitude_porto?: SortOrderInput | SortOrder
    codigo_iata_porto?: SortOrderInput | SortOrder
    ativo_porto?: SortOrder
    _count?: PortoCountOrderByAggregateInput
    _avg?: PortoAvgOrderByAggregateInput
    _max?: PortoMaxOrderByAggregateInput
    _min?: PortoMinOrderByAggregateInput
    _sum?: PortoSumOrderByAggregateInput
  }

  export type PortoScalarWhereWithAggregatesInput = {
    AND?: PortoScalarWhereWithAggregatesInput | PortoScalarWhereWithAggregatesInput[]
    OR?: PortoScalarWhereWithAggregatesInput[]
    NOT?: PortoScalarWhereWithAggregatesInput | PortoScalarWhereWithAggregatesInput[]
    id_porto?: StringWithAggregatesFilter<"Porto"> | string
    codigo_unlocode_porto?: StringWithAggregatesFilter<"Porto"> | string
    codigo_pais_porto?: StringWithAggregatesFilter<"Porto"> | string
    codigo_local_porto?: StringWithAggregatesFilter<"Porto"> | string
    nome_porto?: StringWithAggregatesFilter<"Porto"> | string
    nome_ascii_porto?: StringWithAggregatesFilter<"Porto"> | string
    subdivisao_porto?: StringNullableWithAggregatesFilter<"Porto"> | string | null
    latitude_porto?: FloatNullableWithAggregatesFilter<"Porto"> | number | null
    longitude_porto?: FloatNullableWithAggregatesFilter<"Porto"> | number | null
    codigo_iata_porto?: StringNullableWithAggregatesFilter<"Porto"> | string | null
    ativo_porto?: BoolWithAggregatesFilter<"Porto"> | boolean
  }

  export type AeroportoWhereInput = {
    AND?: AeroportoWhereInput | AeroportoWhereInput[]
    OR?: AeroportoWhereInput[]
    NOT?: AeroportoWhereInput | AeroportoWhereInput[]
    id_aeroporto?: StringFilter<"Aeroporto"> | string
    codigo_unlocode_aeroporto?: StringFilter<"Aeroporto"> | string
    codigo_pais_aeroporto?: StringFilter<"Aeroporto"> | string
    codigo_local_aeroporto?: StringFilter<"Aeroporto"> | string
    nome_aeroporto?: StringFilter<"Aeroporto"> | string
    nome_ascii_aeroporto?: StringFilter<"Aeroporto"> | string
    subdivisao_aeroporto?: StringNullableFilter<"Aeroporto"> | string | null
    latitude_aeroporto?: FloatNullableFilter<"Aeroporto"> | number | null
    longitude_aeroporto?: FloatNullableFilter<"Aeroporto"> | number | null
    codigo_iata_aeroporto?: StringNullableFilter<"Aeroporto"> | string | null
    ativo_aeroporto?: BoolFilter<"Aeroporto"> | boolean
  }

  export type AeroportoOrderByWithRelationInput = {
    id_aeroporto?: SortOrder
    codigo_unlocode_aeroporto?: SortOrder
    codigo_pais_aeroporto?: SortOrder
    codigo_local_aeroporto?: SortOrder
    nome_aeroporto?: SortOrder
    nome_ascii_aeroporto?: SortOrder
    subdivisao_aeroporto?: SortOrderInput | SortOrder
    latitude_aeroporto?: SortOrderInput | SortOrder
    longitude_aeroporto?: SortOrderInput | SortOrder
    codigo_iata_aeroporto?: SortOrderInput | SortOrder
    ativo_aeroporto?: SortOrder
  }

  export type AeroportoWhereUniqueInput = Prisma.AtLeast<{
    id_aeroporto?: string
    codigo_unlocode_aeroporto?: string
    codigo_iata_aeroporto?: string
    AND?: AeroportoWhereInput | AeroportoWhereInput[]
    OR?: AeroportoWhereInput[]
    NOT?: AeroportoWhereInput | AeroportoWhereInput[]
    codigo_pais_aeroporto?: StringFilter<"Aeroporto"> | string
    codigo_local_aeroporto?: StringFilter<"Aeroporto"> | string
    nome_aeroporto?: StringFilter<"Aeroporto"> | string
    nome_ascii_aeroporto?: StringFilter<"Aeroporto"> | string
    subdivisao_aeroporto?: StringNullableFilter<"Aeroporto"> | string | null
    latitude_aeroporto?: FloatNullableFilter<"Aeroporto"> | number | null
    longitude_aeroporto?: FloatNullableFilter<"Aeroporto"> | number | null
    ativo_aeroporto?: BoolFilter<"Aeroporto"> | boolean
  }, "id_aeroporto" | "codigo_unlocode_aeroporto" | "codigo_iata_aeroporto">

  export type AeroportoOrderByWithAggregationInput = {
    id_aeroporto?: SortOrder
    codigo_unlocode_aeroporto?: SortOrder
    codigo_pais_aeroporto?: SortOrder
    codigo_local_aeroporto?: SortOrder
    nome_aeroporto?: SortOrder
    nome_ascii_aeroporto?: SortOrder
    subdivisao_aeroporto?: SortOrderInput | SortOrder
    latitude_aeroporto?: SortOrderInput | SortOrder
    longitude_aeroporto?: SortOrderInput | SortOrder
    codigo_iata_aeroporto?: SortOrderInput | SortOrder
    ativo_aeroporto?: SortOrder
    _count?: AeroportoCountOrderByAggregateInput
    _avg?: AeroportoAvgOrderByAggregateInput
    _max?: AeroportoMaxOrderByAggregateInput
    _min?: AeroportoMinOrderByAggregateInput
    _sum?: AeroportoSumOrderByAggregateInput
  }

  export type AeroportoScalarWhereWithAggregatesInput = {
    AND?: AeroportoScalarWhereWithAggregatesInput | AeroportoScalarWhereWithAggregatesInput[]
    OR?: AeroportoScalarWhereWithAggregatesInput[]
    NOT?: AeroportoScalarWhereWithAggregatesInput | AeroportoScalarWhereWithAggregatesInput[]
    id_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    codigo_unlocode_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    codigo_pais_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    codigo_local_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    nome_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    nome_ascii_aeroporto?: StringWithAggregatesFilter<"Aeroporto"> | string
    subdivisao_aeroporto?: StringNullableWithAggregatesFilter<"Aeroporto"> | string | null
    latitude_aeroporto?: FloatNullableWithAggregatesFilter<"Aeroporto"> | number | null
    longitude_aeroporto?: FloatNullableWithAggregatesFilter<"Aeroporto"> | number | null
    codigo_iata_aeroporto?: StringNullableWithAggregatesFilter<"Aeroporto"> | string | null
    ativo_aeroporto?: BoolWithAggregatesFilter<"Aeroporto"> | boolean
  }

  export type ContainerWhereInput = {
    AND?: ContainerWhereInput | ContainerWhereInput[]
    OR?: ContainerWhereInput[]
    NOT?: ContainerWhereInput | ContainerWhereInput[]
    id_container?: StringFilter<"Container"> | string
    tipo_container?: EnumContainerTipoFilter<"Container"> | $Enums.ContainerTipo
    tamanho_container?: StringFilter<"Container"> | string
    codigo_iso_container?: StringNullableFilter<"Container"> | string | null
    armador_dono_container?: StringNullableFilter<"Container"> | string | null
    ativo_container?: BoolFilter<"Container"> | boolean
  }

  export type ContainerOrderByWithRelationInput = {
    id_container?: SortOrder
    tipo_container?: SortOrder
    tamanho_container?: SortOrder
    codigo_iso_container?: SortOrderInput | SortOrder
    armador_dono_container?: SortOrderInput | SortOrder
    ativo_container?: SortOrder
  }

  export type ContainerWhereUniqueInput = Prisma.AtLeast<{
    id_container?: string
    codigo_iso_container?: string
    AND?: ContainerWhereInput | ContainerWhereInput[]
    OR?: ContainerWhereInput[]
    NOT?: ContainerWhereInput | ContainerWhereInput[]
    tipo_container?: EnumContainerTipoFilter<"Container"> | $Enums.ContainerTipo
    tamanho_container?: StringFilter<"Container"> | string
    armador_dono_container?: StringNullableFilter<"Container"> | string | null
    ativo_container?: BoolFilter<"Container"> | boolean
  }, "id_container" | "codigo_iso_container">

  export type ContainerOrderByWithAggregationInput = {
    id_container?: SortOrder
    tipo_container?: SortOrder
    tamanho_container?: SortOrder
    codigo_iso_container?: SortOrderInput | SortOrder
    armador_dono_container?: SortOrderInput | SortOrder
    ativo_container?: SortOrder
    _count?: ContainerCountOrderByAggregateInput
    _max?: ContainerMaxOrderByAggregateInput
    _min?: ContainerMinOrderByAggregateInput
  }

  export type ContainerScalarWhereWithAggregatesInput = {
    AND?: ContainerScalarWhereWithAggregatesInput | ContainerScalarWhereWithAggregatesInput[]
    OR?: ContainerScalarWhereWithAggregatesInput[]
    NOT?: ContainerScalarWhereWithAggregatesInput | ContainerScalarWhereWithAggregatesInput[]
    id_container?: StringWithAggregatesFilter<"Container"> | string
    tipo_container?: EnumContainerTipoWithAggregatesFilter<"Container"> | $Enums.ContainerTipo
    tamanho_container?: StringWithAggregatesFilter<"Container"> | string
    codigo_iso_container?: StringNullableWithAggregatesFilter<"Container"> | string | null
    armador_dono_container?: StringNullableWithAggregatesFilter<"Container"> | string | null
    ativo_container?: BoolWithAggregatesFilter<"Container"> | boolean
  }

  export type NcmSyncWhereInput = {
    AND?: NcmSyncWhereInput | NcmSyncWhereInput[]
    OR?: NcmSyncWhereInput[]
    NOT?: NcmSyncWhereInput | NcmSyncWhereInput[]
    codigo_ncm_sync?: StringFilter<"NcmSync"> | string
    descricao_ncm_sync?: StringFilter<"NcmSync"> | string
    ipi_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    ii_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    pis_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    cofins_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    ativo_ncm_sync?: BoolFilter<"NcmSync"> | boolean
    data_inicio_ncm_sync?: DateTimeNullableFilter<"NcmSync"> | Date | string | null
    data_fim_ncm_sync?: DateTimeNullableFilter<"NcmSync"> | Date | string | null
    id_ncm_sync_log?: StringNullableFilter<"NcmSync"> | string | null
    data_criacao_ncm_sync?: DateTimeFilter<"NcmSync"> | Date | string
    data_atualizacao_ncm_sync?: DateTimeFilter<"NcmSync"> | Date | string
  }

  export type NcmSyncOrderByWithRelationInput = {
    codigo_ncm_sync?: SortOrder
    descricao_ncm_sync?: SortOrder
    ipi_ncm_sync?: SortOrderInput | SortOrder
    ii_ncm_sync?: SortOrderInput | SortOrder
    pis_ncm_sync?: SortOrderInput | SortOrder
    cofins_ncm_sync?: SortOrderInput | SortOrder
    ativo_ncm_sync?: SortOrder
    data_inicio_ncm_sync?: SortOrderInput | SortOrder
    data_fim_ncm_sync?: SortOrderInput | SortOrder
    id_ncm_sync_log?: SortOrderInput | SortOrder
    data_criacao_ncm_sync?: SortOrder
    data_atualizacao_ncm_sync?: SortOrder
  }

  export type NcmSyncWhereUniqueInput = Prisma.AtLeast<{
    codigo_ncm_sync?: string
    AND?: NcmSyncWhereInput | NcmSyncWhereInput[]
    OR?: NcmSyncWhereInput[]
    NOT?: NcmSyncWhereInput | NcmSyncWhereInput[]
    descricao_ncm_sync?: StringFilter<"NcmSync"> | string
    ipi_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    ii_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    pis_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    cofins_ncm_sync?: FloatNullableFilter<"NcmSync"> | number | null
    ativo_ncm_sync?: BoolFilter<"NcmSync"> | boolean
    data_inicio_ncm_sync?: DateTimeNullableFilter<"NcmSync"> | Date | string | null
    data_fim_ncm_sync?: DateTimeNullableFilter<"NcmSync"> | Date | string | null
    id_ncm_sync_log?: StringNullableFilter<"NcmSync"> | string | null
    data_criacao_ncm_sync?: DateTimeFilter<"NcmSync"> | Date | string
    data_atualizacao_ncm_sync?: DateTimeFilter<"NcmSync"> | Date | string
  }, "codigo_ncm_sync">

  export type NcmSyncOrderByWithAggregationInput = {
    codigo_ncm_sync?: SortOrder
    descricao_ncm_sync?: SortOrder
    ipi_ncm_sync?: SortOrderInput | SortOrder
    ii_ncm_sync?: SortOrderInput | SortOrder
    pis_ncm_sync?: SortOrderInput | SortOrder
    cofins_ncm_sync?: SortOrderInput | SortOrder
    ativo_ncm_sync?: SortOrder
    data_inicio_ncm_sync?: SortOrderInput | SortOrder
    data_fim_ncm_sync?: SortOrderInput | SortOrder
    id_ncm_sync_log?: SortOrderInput | SortOrder
    data_criacao_ncm_sync?: SortOrder
    data_atualizacao_ncm_sync?: SortOrder
    _count?: NcmSyncCountOrderByAggregateInput
    _avg?: NcmSyncAvgOrderByAggregateInput
    _max?: NcmSyncMaxOrderByAggregateInput
    _min?: NcmSyncMinOrderByAggregateInput
    _sum?: NcmSyncSumOrderByAggregateInput
  }

  export type NcmSyncScalarWhereWithAggregatesInput = {
    AND?: NcmSyncScalarWhereWithAggregatesInput | NcmSyncScalarWhereWithAggregatesInput[]
    OR?: NcmSyncScalarWhereWithAggregatesInput[]
    NOT?: NcmSyncScalarWhereWithAggregatesInput | NcmSyncScalarWhereWithAggregatesInput[]
    codigo_ncm_sync?: StringWithAggregatesFilter<"NcmSync"> | string
    descricao_ncm_sync?: StringWithAggregatesFilter<"NcmSync"> | string
    ipi_ncm_sync?: FloatNullableWithAggregatesFilter<"NcmSync"> | number | null
    ii_ncm_sync?: FloatNullableWithAggregatesFilter<"NcmSync"> | number | null
    pis_ncm_sync?: FloatNullableWithAggregatesFilter<"NcmSync"> | number | null
    cofins_ncm_sync?: FloatNullableWithAggregatesFilter<"NcmSync"> | number | null
    ativo_ncm_sync?: BoolWithAggregatesFilter<"NcmSync"> | boolean
    data_inicio_ncm_sync?: DateTimeNullableWithAggregatesFilter<"NcmSync"> | Date | string | null
    data_fim_ncm_sync?: DateTimeNullableWithAggregatesFilter<"NcmSync"> | Date | string | null
    id_ncm_sync_log?: StringNullableWithAggregatesFilter<"NcmSync"> | string | null
    data_criacao_ncm_sync?: DateTimeWithAggregatesFilter<"NcmSync"> | Date | string
    data_atualizacao_ncm_sync?: DateTimeWithAggregatesFilter<"NcmSync"> | Date | string
  }

  export type NcmSyncLogWhereInput = {
    AND?: NcmSyncLogWhereInput | NcmSyncLogWhereInput[]
    OR?: NcmSyncLogWhereInput[]
    NOT?: NcmSyncLogWhereInput | NcmSyncLogWhereInput[]
    id_ncm_sync_log?: StringFilter<"NcmSyncLog"> | string
    data_inicio_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
    data_conclusao_ncm_sync_log?: DateTimeNullableFilter<"NcmSyncLog"> | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFilter<"NcmSyncLog"> | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    adicionados_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    alterados_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    removidos_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFilter<"NcmSyncLog"> | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: StringNullableFilter<"NcmSyncLog"> | string | null
    mensagem_erro_ncm_sync_log?: StringNullableFilter<"NcmSyncLog"> | string | null
    data_criacao_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
  }

  export type NcmSyncLogOrderByWithRelationInput = {
    id_ncm_sync_log?: SortOrder
    data_inicio_ncm_sync_log?: SortOrder
    data_conclusao_ncm_sync_log?: SortOrderInput | SortOrder
    status_ncm_sync_log?: SortOrder
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
    origem_ncm_sync_log?: SortOrder
    disparado_por_ncm_sync_log?: SortOrderInput | SortOrder
    mensagem_erro_ncm_sync_log?: SortOrderInput | SortOrder
    data_criacao_ncm_sync_log?: SortOrder
    data_atualizacao_ncm_sync_log?: SortOrder
  }

  export type NcmSyncLogWhereUniqueInput = Prisma.AtLeast<{
    id_ncm_sync_log?: string
    AND?: NcmSyncLogWhereInput | NcmSyncLogWhereInput[]
    OR?: NcmSyncLogWhereInput[]
    NOT?: NcmSyncLogWhereInput | NcmSyncLogWhereInput[]
    data_inicio_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
    data_conclusao_ncm_sync_log?: DateTimeNullableFilter<"NcmSyncLog"> | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFilter<"NcmSyncLog"> | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    adicionados_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    alterados_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    removidos_ncm_sync_log?: IntFilter<"NcmSyncLog"> | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFilter<"NcmSyncLog"> | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: StringNullableFilter<"NcmSyncLog"> | string | null
    mensagem_erro_ncm_sync_log?: StringNullableFilter<"NcmSyncLog"> | string | null
    data_criacao_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFilter<"NcmSyncLog"> | Date | string
  }, "id_ncm_sync_log">

  export type NcmSyncLogOrderByWithAggregationInput = {
    id_ncm_sync_log?: SortOrder
    data_inicio_ncm_sync_log?: SortOrder
    data_conclusao_ncm_sync_log?: SortOrderInput | SortOrder
    status_ncm_sync_log?: SortOrder
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
    origem_ncm_sync_log?: SortOrder
    disparado_por_ncm_sync_log?: SortOrderInput | SortOrder
    mensagem_erro_ncm_sync_log?: SortOrderInput | SortOrder
    data_criacao_ncm_sync_log?: SortOrder
    data_atualizacao_ncm_sync_log?: SortOrder
    _count?: NcmSyncLogCountOrderByAggregateInput
    _avg?: NcmSyncLogAvgOrderByAggregateInput
    _max?: NcmSyncLogMaxOrderByAggregateInput
    _min?: NcmSyncLogMinOrderByAggregateInput
    _sum?: NcmSyncLogSumOrderByAggregateInput
  }

  export type NcmSyncLogScalarWhereWithAggregatesInput = {
    AND?: NcmSyncLogScalarWhereWithAggregatesInput | NcmSyncLogScalarWhereWithAggregatesInput[]
    OR?: NcmSyncLogScalarWhereWithAggregatesInput[]
    NOT?: NcmSyncLogScalarWhereWithAggregatesInput | NcmSyncLogScalarWhereWithAggregatesInput[]
    id_ncm_sync_log?: StringWithAggregatesFilter<"NcmSyncLog"> | string
    data_inicio_ncm_sync_log?: DateTimeWithAggregatesFilter<"NcmSyncLog"> | Date | string
    data_conclusao_ncm_sync_log?: DateTimeNullableWithAggregatesFilter<"NcmSyncLog"> | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoWithAggregatesFilter<"NcmSyncLog"> | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntWithAggregatesFilter<"NcmSyncLog"> | number
    adicionados_ncm_sync_log?: IntWithAggregatesFilter<"NcmSyncLog"> | number
    alterados_ncm_sync_log?: IntWithAggregatesFilter<"NcmSyncLog"> | number
    removidos_ncm_sync_log?: IntWithAggregatesFilter<"NcmSyncLog"> | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoWithAggregatesFilter<"NcmSyncLog"> | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: StringNullableWithAggregatesFilter<"NcmSyncLog"> | string | null
    mensagem_erro_ncm_sync_log?: StringNullableWithAggregatesFilter<"NcmSyncLog"> | string | null
    data_criacao_ncm_sync_log?: DateTimeWithAggregatesFilter<"NcmSyncLog"> | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeWithAggregatesFilter<"NcmSyncLog"> | Date | string
  }

  export type NcmSyncAgendamentoWhereInput = {
    AND?: NcmSyncAgendamentoWhereInput | NcmSyncAgendamentoWhereInput[]
    OR?: NcmSyncAgendamentoWhereInput[]
    NOT?: NcmSyncAgendamentoWhereInput | NcmSyncAgendamentoWhereInput[]
    id_ncm_sync_agendamento?: StringFilter<"NcmSyncAgendamento"> | string
    ativo_ncm_sync_agendamento?: BoolFilter<"NcmSyncAgendamento"> | boolean
    cron_expressao_ncm_sync_agendamento?: StringFilter<"NcmSyncAgendamento"> | string
    notificadores_ncm_sync_agendamento?: JsonFilter<"NcmSyncAgendamento">
    data_criacao_ncm_sync_agendamento?: DateTimeFilter<"NcmSyncAgendamento"> | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFilter<"NcmSyncAgendamento"> | Date | string
  }

  export type NcmSyncAgendamentoOrderByWithRelationInput = {
    id_ncm_sync_agendamento?: SortOrder
    ativo_ncm_sync_agendamento?: SortOrder
    cron_expressao_ncm_sync_agendamento?: SortOrder
    notificadores_ncm_sync_agendamento?: SortOrder
    data_criacao_ncm_sync_agendamento?: SortOrder
    data_atualizacao_ncm_sync_agendamento?: SortOrder
  }

  export type NcmSyncAgendamentoWhereUniqueInput = Prisma.AtLeast<{
    id_ncm_sync_agendamento?: string
    AND?: NcmSyncAgendamentoWhereInput | NcmSyncAgendamentoWhereInput[]
    OR?: NcmSyncAgendamentoWhereInput[]
    NOT?: NcmSyncAgendamentoWhereInput | NcmSyncAgendamentoWhereInput[]
    ativo_ncm_sync_agendamento?: BoolFilter<"NcmSyncAgendamento"> | boolean
    cron_expressao_ncm_sync_agendamento?: StringFilter<"NcmSyncAgendamento"> | string
    notificadores_ncm_sync_agendamento?: JsonFilter<"NcmSyncAgendamento">
    data_criacao_ncm_sync_agendamento?: DateTimeFilter<"NcmSyncAgendamento"> | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFilter<"NcmSyncAgendamento"> | Date | string
  }, "id_ncm_sync_agendamento">

  export type NcmSyncAgendamentoOrderByWithAggregationInput = {
    id_ncm_sync_agendamento?: SortOrder
    ativo_ncm_sync_agendamento?: SortOrder
    cron_expressao_ncm_sync_agendamento?: SortOrder
    notificadores_ncm_sync_agendamento?: SortOrder
    data_criacao_ncm_sync_agendamento?: SortOrder
    data_atualizacao_ncm_sync_agendamento?: SortOrder
    _count?: NcmSyncAgendamentoCountOrderByAggregateInput
    _max?: NcmSyncAgendamentoMaxOrderByAggregateInput
    _min?: NcmSyncAgendamentoMinOrderByAggregateInput
  }

  export type NcmSyncAgendamentoScalarWhereWithAggregatesInput = {
    AND?: NcmSyncAgendamentoScalarWhereWithAggregatesInput | NcmSyncAgendamentoScalarWhereWithAggregatesInput[]
    OR?: NcmSyncAgendamentoScalarWhereWithAggregatesInput[]
    NOT?: NcmSyncAgendamentoScalarWhereWithAggregatesInput | NcmSyncAgendamentoScalarWhereWithAggregatesInput[]
    id_ncm_sync_agendamento?: StringWithAggregatesFilter<"NcmSyncAgendamento"> | string
    ativo_ncm_sync_agendamento?: BoolWithAggregatesFilter<"NcmSyncAgendamento"> | boolean
    cron_expressao_ncm_sync_agendamento?: StringWithAggregatesFilter<"NcmSyncAgendamento"> | string
    notificadores_ncm_sync_agendamento?: JsonWithAggregatesFilter<"NcmSyncAgendamento">
    data_criacao_ncm_sync_agendamento?: DateTimeWithAggregatesFilter<"NcmSyncAgendamento"> | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeWithAggregatesFilter<"NcmSyncAgendamento"> | Date | string
  }

  export type OpeWhereInput = {
    AND?: OpeWhereInput | OpeWhereInput[]
    OR?: OpeWhereInput[]
    NOT?: OpeWhereInput | OpeWhereInput[]
    suid_ope?: StringFilter<"Ope"> | string
    id_organizacao_ope?: StringFilter<"Ope"> | string
    id_produto_ope?: StringNullableFilter<"Ope"> | string | null
    id_usuario_ope?: StringNullableFilter<"Ope"> | string | null
    codigo_portal_unico_ope?: StringFilter<"Ope"> | string
    situacao_ope?: StringFilter<"Ope"> | string
    versao_ope?: StringFilter<"Ope"> | string
    nome_ope?: StringFilter<"Ope"> | string
    cnpj_raiz_empresa_ope?: StringFilter<"Ope"> | string
    pais_ope?: StringFilter<"Ope"> | string
    estado_ope?: StringNullableFilter<"Ope"> | string | null
    cidade_ope?: StringNullableFilter<"Ope"> | string | null
    endereco_ope?: StringNullableFilter<"Ope"> | string | null
    zip_ope?: StringNullableFilter<"Ope"> | string | null
    tin_ope?: StringNullableFilter<"Ope"> | string | null
    email_ope?: StringNullableFilter<"Ope"> | string | null
    ultima_sincronizacao_ope?: DateTimeFilter<"Ope"> | Date | string
    origem_ope?: StringFilter<"Ope"> | string
  }

  export type OpeOrderByWithRelationInput = {
    suid_ope?: SortOrder
    id_organizacao_ope?: SortOrder
    id_produto_ope?: SortOrderInput | SortOrder
    id_usuario_ope?: SortOrderInput | SortOrder
    codigo_portal_unico_ope?: SortOrder
    situacao_ope?: SortOrder
    versao_ope?: SortOrder
    nome_ope?: SortOrder
    cnpj_raiz_empresa_ope?: SortOrder
    pais_ope?: SortOrder
    estado_ope?: SortOrderInput | SortOrder
    cidade_ope?: SortOrderInput | SortOrder
    endereco_ope?: SortOrderInput | SortOrder
    zip_ope?: SortOrderInput | SortOrder
    tin_ope?: SortOrderInput | SortOrder
    email_ope?: SortOrderInput | SortOrder
    ultima_sincronizacao_ope?: SortOrder
    origem_ope?: SortOrder
  }

  export type OpeWhereUniqueInput = Prisma.AtLeast<{
    suid_ope?: string
    codigo_portal_unico_ope?: string
    AND?: OpeWhereInput | OpeWhereInput[]
    OR?: OpeWhereInput[]
    NOT?: OpeWhereInput | OpeWhereInput[]
    id_organizacao_ope?: StringFilter<"Ope"> | string
    id_produto_ope?: StringNullableFilter<"Ope"> | string | null
    id_usuario_ope?: StringNullableFilter<"Ope"> | string | null
    situacao_ope?: StringFilter<"Ope"> | string
    versao_ope?: StringFilter<"Ope"> | string
    nome_ope?: StringFilter<"Ope"> | string
    cnpj_raiz_empresa_ope?: StringFilter<"Ope"> | string
    pais_ope?: StringFilter<"Ope"> | string
    estado_ope?: StringNullableFilter<"Ope"> | string | null
    cidade_ope?: StringNullableFilter<"Ope"> | string | null
    endereco_ope?: StringNullableFilter<"Ope"> | string | null
    zip_ope?: StringNullableFilter<"Ope"> | string | null
    tin_ope?: StringNullableFilter<"Ope"> | string | null
    email_ope?: StringNullableFilter<"Ope"> | string | null
    ultima_sincronizacao_ope?: DateTimeFilter<"Ope"> | Date | string
    origem_ope?: StringFilter<"Ope"> | string
  }, "suid_ope" | "codigo_portal_unico_ope">

  export type OpeOrderByWithAggregationInput = {
    suid_ope?: SortOrder
    id_organizacao_ope?: SortOrder
    id_produto_ope?: SortOrderInput | SortOrder
    id_usuario_ope?: SortOrderInput | SortOrder
    codigo_portal_unico_ope?: SortOrder
    situacao_ope?: SortOrder
    versao_ope?: SortOrder
    nome_ope?: SortOrder
    cnpj_raiz_empresa_ope?: SortOrder
    pais_ope?: SortOrder
    estado_ope?: SortOrderInput | SortOrder
    cidade_ope?: SortOrderInput | SortOrder
    endereco_ope?: SortOrderInput | SortOrder
    zip_ope?: SortOrderInput | SortOrder
    tin_ope?: SortOrderInput | SortOrder
    email_ope?: SortOrderInput | SortOrder
    ultima_sincronizacao_ope?: SortOrder
    origem_ope?: SortOrder
    _count?: OpeCountOrderByAggregateInput
    _max?: OpeMaxOrderByAggregateInput
    _min?: OpeMinOrderByAggregateInput
  }

  export type OpeScalarWhereWithAggregatesInput = {
    AND?: OpeScalarWhereWithAggregatesInput | OpeScalarWhereWithAggregatesInput[]
    OR?: OpeScalarWhereWithAggregatesInput[]
    NOT?: OpeScalarWhereWithAggregatesInput | OpeScalarWhereWithAggregatesInput[]
    suid_ope?: StringWithAggregatesFilter<"Ope"> | string
    id_organizacao_ope?: StringWithAggregatesFilter<"Ope"> | string
    id_produto_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    id_usuario_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    codigo_portal_unico_ope?: StringWithAggregatesFilter<"Ope"> | string
    situacao_ope?: StringWithAggregatesFilter<"Ope"> | string
    versao_ope?: StringWithAggregatesFilter<"Ope"> | string
    nome_ope?: StringWithAggregatesFilter<"Ope"> | string
    cnpj_raiz_empresa_ope?: StringWithAggregatesFilter<"Ope"> | string
    pais_ope?: StringWithAggregatesFilter<"Ope"> | string
    estado_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    cidade_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    endereco_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    zip_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    tin_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    email_ope?: StringNullableWithAggregatesFilter<"Ope"> | string | null
    ultima_sincronizacao_ope?: DateTimeWithAggregatesFilter<"Ope"> | Date | string
    origem_ope?: StringWithAggregatesFilter<"Ope"> | string
  }

  export type OPEHistoricoStatusWhereInput = {
    AND?: OPEHistoricoStatusWhereInput | OPEHistoricoStatusWhereInput[]
    OR?: OPEHistoricoStatusWhereInput[]
    NOT?: OPEHistoricoStatusWhereInput | OPEHistoricoStatusWhereInput[]
    id_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    id_organizacao_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    id_produto_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    id_usuario_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    suid_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    status_anterior_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    status_novo_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    origem_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    payload_ope_historico_status?: JsonFilter<"OPEHistoricoStatus">
    registrado_em_ope_historico_status?: DateTimeFilter<"OPEHistoricoStatus"> | Date | string
  }

  export type OPEHistoricoStatusOrderByWithRelationInput = {
    id_ope_historico_status?: SortOrder
    id_organizacao_ope_historico_status?: SortOrderInput | SortOrder
    id_produto_ope_historico_status?: SortOrderInput | SortOrder
    id_usuario_ope_historico_status?: SortOrderInput | SortOrder
    suid_ope_historico_status?: SortOrder
    status_anterior_ope_historico_status?: SortOrderInput | SortOrder
    status_novo_ope_historico_status?: SortOrder
    origem_ope_historico_status?: SortOrder
    payload_ope_historico_status?: SortOrder
    registrado_em_ope_historico_status?: SortOrder
  }

  export type OPEHistoricoStatusWhereUniqueInput = Prisma.AtLeast<{
    id_ope_historico_status?: string
    AND?: OPEHistoricoStatusWhereInput | OPEHistoricoStatusWhereInput[]
    OR?: OPEHistoricoStatusWhereInput[]
    NOT?: OPEHistoricoStatusWhereInput | OPEHistoricoStatusWhereInput[]
    id_organizacao_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    id_produto_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    id_usuario_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    suid_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    status_anterior_ope_historico_status?: StringNullableFilter<"OPEHistoricoStatus"> | string | null
    status_novo_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    origem_ope_historico_status?: StringFilter<"OPEHistoricoStatus"> | string
    payload_ope_historico_status?: JsonFilter<"OPEHistoricoStatus">
    registrado_em_ope_historico_status?: DateTimeFilter<"OPEHistoricoStatus"> | Date | string
  }, "id_ope_historico_status">

  export type OPEHistoricoStatusOrderByWithAggregationInput = {
    id_ope_historico_status?: SortOrder
    id_organizacao_ope_historico_status?: SortOrderInput | SortOrder
    id_produto_ope_historico_status?: SortOrderInput | SortOrder
    id_usuario_ope_historico_status?: SortOrderInput | SortOrder
    suid_ope_historico_status?: SortOrder
    status_anterior_ope_historico_status?: SortOrderInput | SortOrder
    status_novo_ope_historico_status?: SortOrder
    origem_ope_historico_status?: SortOrder
    payload_ope_historico_status?: SortOrder
    registrado_em_ope_historico_status?: SortOrder
    _count?: OPEHistoricoStatusCountOrderByAggregateInput
    _max?: OPEHistoricoStatusMaxOrderByAggregateInput
    _min?: OPEHistoricoStatusMinOrderByAggregateInput
  }

  export type OPEHistoricoStatusScalarWhereWithAggregatesInput = {
    AND?: OPEHistoricoStatusScalarWhereWithAggregatesInput | OPEHistoricoStatusScalarWhereWithAggregatesInput[]
    OR?: OPEHistoricoStatusScalarWhereWithAggregatesInput[]
    NOT?: OPEHistoricoStatusScalarWhereWithAggregatesInput | OPEHistoricoStatusScalarWhereWithAggregatesInput[]
    id_ope_historico_status?: StringWithAggregatesFilter<"OPEHistoricoStatus"> | string
    id_organizacao_ope_historico_status?: StringNullableWithAggregatesFilter<"OPEHistoricoStatus"> | string | null
    id_produto_ope_historico_status?: StringNullableWithAggregatesFilter<"OPEHistoricoStatus"> | string | null
    id_usuario_ope_historico_status?: StringNullableWithAggregatesFilter<"OPEHistoricoStatus"> | string | null
    suid_ope_historico_status?: StringWithAggregatesFilter<"OPEHistoricoStatus"> | string
    status_anterior_ope_historico_status?: StringNullableWithAggregatesFilter<"OPEHistoricoStatus"> | string | null
    status_novo_ope_historico_status?: StringWithAggregatesFilter<"OPEHistoricoStatus"> | string
    origem_ope_historico_status?: StringWithAggregatesFilter<"OPEHistoricoStatus"> | string
    payload_ope_historico_status?: JsonWithAggregatesFilter<"OPEHistoricoStatus">
    registrado_em_ope_historico_status?: DateTimeWithAggregatesFilter<"OPEHistoricoStatus"> | Date | string
  }

  export type FornecedorCreateInput = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor?: string | null
    id_usuario_cadastro_fornecedor?: string | null
    nome_fornecedor: string
    cnpj_fornecedor?: string | null
    tin_fornecedor?: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor?: string | null
    cidade_fornecedor?: string | null
    endereco_fornecedor?: string | null
    cep_zipcode_fornecedor?: string | null
    email_principal_fornecedor?: string | null
    telefone_principal_fornecedor?: string | null
    whatsapp_principal_fornecedor?: string | null
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: Date | string
    atualizado_em_fornecedor?: Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoCreateNestedManyWithoutFornecedorInput
  }

  export type FornecedorUncheckedCreateInput = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor?: string | null
    id_usuario_cadastro_fornecedor?: string | null
    nome_fornecedor: string
    cnpj_fornecedor?: string | null
    tin_fornecedor?: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor?: string | null
    cidade_fornecedor?: string | null
    endereco_fornecedor?: string | null
    cep_zipcode_fornecedor?: string | null
    email_principal_fornecedor?: string | null
    telefone_principal_fornecedor?: string | null
    whatsapp_principal_fornecedor?: string | null
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: Date | string
    atualizado_em_fornecedor?: Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoUncheckedCreateNestedManyWithoutFornecedorInput
  }

  export type FornecedorUpdateInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoUpdateManyWithoutFornecedorNestedInput
  }

  export type FornecedorUncheckedUpdateInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedores_organizacao?: FornecedorOrganizacaoUncheckedUpdateManyWithoutFornecedorNestedInput
  }

  export type FornecedorCreateManyInput = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor?: string | null
    id_usuario_cadastro_fornecedor?: string | null
    nome_fornecedor: string
    cnpj_fornecedor?: string | null
    tin_fornecedor?: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor?: string | null
    cidade_fornecedor?: string | null
    endereco_fornecedor?: string | null
    cep_zipcode_fornecedor?: string | null
    email_principal_fornecedor?: string | null
    telefone_principal_fornecedor?: string | null
    whatsapp_principal_fornecedor?: string | null
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: Date | string
    atualizado_em_fornecedor?: Date | string
  }

  export type FornecedorUpdateManyMutationInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorUncheckedUpdateManyInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoCreateInput = {
    id_fornecedor_organizacao?: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
    fornecedor: FornecedorCreateNestedOneWithoutFornecedores_organizacaoInput
  }

  export type FornecedorOrganizacaoUncheckedCreateInput = {
    id_fornecedor_organizacao?: string
    id_fornecedor: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
  }

  export type FornecedorOrganizacaoUpdateInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    fornecedor?: FornecedorUpdateOneRequiredWithoutFornecedores_organizacaoNestedInput
  }

  export type FornecedorOrganizacaoUncheckedUpdateInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoCreateManyInput = {
    id_fornecedor_organizacao?: string
    id_fornecedor: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
  }

  export type FornecedorOrganizacaoUpdateManyMutationInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoUncheckedUpdateManyInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaisCreateInput = {
    id_pais?: string
    nome_pais_portugues: string
    nome_pais_ingles: string
    codigo_pais_portal_unico_siscomex?: string | null
    codigo_pais_bacen_4?: string | null
    codigo_pais_bacen_5?: string | null
    codigo_pais_sped_nfe?: string | null
    codigo_pais_sped_efd?: string | null
    codigo_pais_iso_alpha2?: string | null
    codigo_pais_iso_alpha3?: string | null
    codigo_pais_iso_numerico?: string | null
    ativo_pais?: boolean
  }

  export type PaisUncheckedCreateInput = {
    id_pais?: string
    nome_pais_portugues: string
    nome_pais_ingles: string
    codigo_pais_portal_unico_siscomex?: string | null
    codigo_pais_bacen_4?: string | null
    codigo_pais_bacen_5?: string | null
    codigo_pais_sped_nfe?: string | null
    codigo_pais_sped_efd?: string | null
    codigo_pais_iso_alpha2?: string | null
    codigo_pais_iso_alpha3?: string | null
    codigo_pais_iso_numerico?: string | null
    ativo_pais?: boolean
  }

  export type PaisUpdateInput = {
    id_pais?: StringFieldUpdateOperationsInput | string
    nome_pais_portugues?: StringFieldUpdateOperationsInput | string
    nome_pais_ingles?: StringFieldUpdateOperationsInput | string
    codigo_pais_portal_unico_siscomex?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_4?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_5?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_nfe?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_efd?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha2?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha3?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_numerico?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_pais?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PaisUncheckedUpdateInput = {
    id_pais?: StringFieldUpdateOperationsInput | string
    nome_pais_portugues?: StringFieldUpdateOperationsInput | string
    nome_pais_ingles?: StringFieldUpdateOperationsInput | string
    codigo_pais_portal_unico_siscomex?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_4?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_5?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_nfe?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_efd?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha2?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha3?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_numerico?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_pais?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PaisCreateManyInput = {
    id_pais?: string
    nome_pais_portugues: string
    nome_pais_ingles: string
    codigo_pais_portal_unico_siscomex?: string | null
    codigo_pais_bacen_4?: string | null
    codigo_pais_bacen_5?: string | null
    codigo_pais_sped_nfe?: string | null
    codigo_pais_sped_efd?: string | null
    codigo_pais_iso_alpha2?: string | null
    codigo_pais_iso_alpha3?: string | null
    codigo_pais_iso_numerico?: string | null
    ativo_pais?: boolean
  }

  export type PaisUpdateManyMutationInput = {
    id_pais?: StringFieldUpdateOperationsInput | string
    nome_pais_portugues?: StringFieldUpdateOperationsInput | string
    nome_pais_ingles?: StringFieldUpdateOperationsInput | string
    codigo_pais_portal_unico_siscomex?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_4?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_5?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_nfe?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_efd?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha2?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha3?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_numerico?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_pais?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PaisUncheckedUpdateManyInput = {
    id_pais?: StringFieldUpdateOperationsInput | string
    nome_pais_portugues?: StringFieldUpdateOperationsInput | string
    nome_pais_ingles?: StringFieldUpdateOperationsInput | string
    codigo_pais_portal_unico_siscomex?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_4?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_bacen_5?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_nfe?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_sped_efd?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha2?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_alpha3?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_pais_iso_numerico?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_pais?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaCreateInput = {
    codigo_moeda: string
    nome_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUncheckedCreateInput = {
    codigo_moeda: string
    nome_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUpdateInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    nome_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaUncheckedUpdateInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    nome_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaCreateManyInput = {
    codigo_moeda: string
    nome_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUpdateManyMutationInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    nome_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaUncheckedUpdateManyInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    nome_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UnidadeCreateInput = {
    codigo_unidade: string
    nome_unidade: string
    tipo_unidade: string
    ativo_unidade?: boolean
  }

  export type UnidadeUncheckedCreateInput = {
    codigo_unidade: string
    nome_unidade: string
    tipo_unidade: string
    ativo_unidade?: boolean
  }

  export type UnidadeUpdateInput = {
    codigo_unidade?: StringFieldUpdateOperationsInput | string
    nome_unidade?: StringFieldUpdateOperationsInput | string
    tipo_unidade?: StringFieldUpdateOperationsInput | string
    ativo_unidade?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UnidadeUncheckedUpdateInput = {
    codigo_unidade?: StringFieldUpdateOperationsInput | string
    nome_unidade?: StringFieldUpdateOperationsInput | string
    tipo_unidade?: StringFieldUpdateOperationsInput | string
    ativo_unidade?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UnidadeCreateManyInput = {
    codigo_unidade: string
    nome_unidade: string
    tipo_unidade: string
    ativo_unidade?: boolean
  }

  export type UnidadeUpdateManyMutationInput = {
    codigo_unidade?: StringFieldUpdateOperationsInput | string
    nome_unidade?: StringFieldUpdateOperationsInput | string
    tipo_unidade?: StringFieldUpdateOperationsInput | string
    ativo_unidade?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UnidadeUncheckedUpdateManyInput = {
    codigo_unidade?: StringFieldUpdateOperationsInput | string
    nome_unidade?: StringFieldUpdateOperationsInput | string
    tipo_unidade?: StringFieldUpdateOperationsInput | string
    ativo_unidade?: BoolFieldUpdateOperationsInput | boolean
  }

  export type IncotermCreateInput = {
    codigo_incoterm: string
    nome_incoterm: string
    descricao_incoterm?: string | null
    modal_transporte: string
    versao_incoterm?: string
    ativo_incoterm?: boolean
  }

  export type IncotermUncheckedCreateInput = {
    codigo_incoterm: string
    nome_incoterm: string
    descricao_incoterm?: string | null
    modal_transporte: string
    versao_incoterm?: string
    ativo_incoterm?: boolean
  }

  export type IncotermUpdateInput = {
    codigo_incoterm?: StringFieldUpdateOperationsInput | string
    nome_incoterm?: StringFieldUpdateOperationsInput | string
    descricao_incoterm?: NullableStringFieldUpdateOperationsInput | string | null
    modal_transporte?: StringFieldUpdateOperationsInput | string
    versao_incoterm?: StringFieldUpdateOperationsInput | string
    ativo_incoterm?: BoolFieldUpdateOperationsInput | boolean
  }

  export type IncotermUncheckedUpdateInput = {
    codigo_incoterm?: StringFieldUpdateOperationsInput | string
    nome_incoterm?: StringFieldUpdateOperationsInput | string
    descricao_incoterm?: NullableStringFieldUpdateOperationsInput | string | null
    modal_transporte?: StringFieldUpdateOperationsInput | string
    versao_incoterm?: StringFieldUpdateOperationsInput | string
    ativo_incoterm?: BoolFieldUpdateOperationsInput | boolean
  }

  export type IncotermCreateManyInput = {
    codigo_incoterm: string
    nome_incoterm: string
    descricao_incoterm?: string | null
    modal_transporte: string
    versao_incoterm?: string
    ativo_incoterm?: boolean
  }

  export type IncotermUpdateManyMutationInput = {
    codigo_incoterm?: StringFieldUpdateOperationsInput | string
    nome_incoterm?: StringFieldUpdateOperationsInput | string
    descricao_incoterm?: NullableStringFieldUpdateOperationsInput | string | null
    modal_transporte?: StringFieldUpdateOperationsInput | string
    versao_incoterm?: StringFieldUpdateOperationsInput | string
    ativo_incoterm?: BoolFieldUpdateOperationsInput | boolean
  }

  export type IncotermUncheckedUpdateManyInput = {
    codigo_incoterm?: StringFieldUpdateOperationsInput | string
    nome_incoterm?: StringFieldUpdateOperationsInput | string
    descricao_incoterm?: NullableStringFieldUpdateOperationsInput | string | null
    modal_transporte?: StringFieldUpdateOperationsInput | string
    versao_incoterm?: StringFieldUpdateOperationsInput | string
    ativo_incoterm?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PortoCreateInput = {
    id_porto?: string
    codigo_unlocode_porto: string
    codigo_pais_porto: string
    codigo_local_porto: string
    nome_porto: string
    nome_ascii_porto: string
    subdivisao_porto?: string | null
    latitude_porto?: number | null
    longitude_porto?: number | null
    codigo_iata_porto?: string | null
    ativo_porto?: boolean
  }

  export type PortoUncheckedCreateInput = {
    id_porto?: string
    codigo_unlocode_porto: string
    codigo_pais_porto: string
    codigo_local_porto: string
    nome_porto: string
    nome_ascii_porto: string
    subdivisao_porto?: string | null
    latitude_porto?: number | null
    longitude_porto?: number | null
    codigo_iata_porto?: string | null
    ativo_porto?: boolean
  }

  export type PortoUpdateInput = {
    id_porto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_porto?: StringFieldUpdateOperationsInput | string
    codigo_pais_porto?: StringFieldUpdateOperationsInput | string
    codigo_local_porto?: StringFieldUpdateOperationsInput | string
    nome_porto?: StringFieldUpdateOperationsInput | string
    nome_ascii_porto?: StringFieldUpdateOperationsInput | string
    subdivisao_porto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_porto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_porto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PortoUncheckedUpdateInput = {
    id_porto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_porto?: StringFieldUpdateOperationsInput | string
    codigo_pais_porto?: StringFieldUpdateOperationsInput | string
    codigo_local_porto?: StringFieldUpdateOperationsInput | string
    nome_porto?: StringFieldUpdateOperationsInput | string
    nome_ascii_porto?: StringFieldUpdateOperationsInput | string
    subdivisao_porto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_porto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_porto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PortoCreateManyInput = {
    id_porto?: string
    codigo_unlocode_porto: string
    codigo_pais_porto: string
    codigo_local_porto: string
    nome_porto: string
    nome_ascii_porto: string
    subdivisao_porto?: string | null
    latitude_porto?: number | null
    longitude_porto?: number | null
    codigo_iata_porto?: string | null
    ativo_porto?: boolean
  }

  export type PortoUpdateManyMutationInput = {
    id_porto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_porto?: StringFieldUpdateOperationsInput | string
    codigo_pais_porto?: StringFieldUpdateOperationsInput | string
    codigo_local_porto?: StringFieldUpdateOperationsInput | string
    nome_porto?: StringFieldUpdateOperationsInput | string
    nome_ascii_porto?: StringFieldUpdateOperationsInput | string
    subdivisao_porto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_porto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_porto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PortoUncheckedUpdateManyInput = {
    id_porto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_porto?: StringFieldUpdateOperationsInput | string
    codigo_pais_porto?: StringFieldUpdateOperationsInput | string
    codigo_local_porto?: StringFieldUpdateOperationsInput | string
    nome_porto?: StringFieldUpdateOperationsInput | string
    nome_ascii_porto?: StringFieldUpdateOperationsInput | string
    subdivisao_porto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_porto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_porto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_porto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AeroportoCreateInput = {
    id_aeroporto?: string
    codigo_unlocode_aeroporto: string
    codigo_pais_aeroporto: string
    codigo_local_aeroporto: string
    nome_aeroporto: string
    nome_ascii_aeroporto: string
    subdivisao_aeroporto?: string | null
    latitude_aeroporto?: number | null
    longitude_aeroporto?: number | null
    codigo_iata_aeroporto?: string | null
    ativo_aeroporto?: boolean
  }

  export type AeroportoUncheckedCreateInput = {
    id_aeroporto?: string
    codigo_unlocode_aeroporto: string
    codigo_pais_aeroporto: string
    codigo_local_aeroporto: string
    nome_aeroporto: string
    nome_ascii_aeroporto: string
    subdivisao_aeroporto?: string | null
    latitude_aeroporto?: number | null
    longitude_aeroporto?: number | null
    codigo_iata_aeroporto?: string | null
    ativo_aeroporto?: boolean
  }

  export type AeroportoUpdateInput = {
    id_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_pais_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_local_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_ascii_aeroporto?: StringFieldUpdateOperationsInput | string
    subdivisao_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_aeroporto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AeroportoUncheckedUpdateInput = {
    id_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_pais_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_local_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_ascii_aeroporto?: StringFieldUpdateOperationsInput | string
    subdivisao_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_aeroporto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AeroportoCreateManyInput = {
    id_aeroporto?: string
    codigo_unlocode_aeroporto: string
    codigo_pais_aeroporto: string
    codigo_local_aeroporto: string
    nome_aeroporto: string
    nome_ascii_aeroporto: string
    subdivisao_aeroporto?: string | null
    latitude_aeroporto?: number | null
    longitude_aeroporto?: number | null
    codigo_iata_aeroporto?: string | null
    ativo_aeroporto?: boolean
  }

  export type AeroportoUpdateManyMutationInput = {
    id_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_pais_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_local_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_ascii_aeroporto?: StringFieldUpdateOperationsInput | string
    subdivisao_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_aeroporto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AeroportoUncheckedUpdateManyInput = {
    id_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_unlocode_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_pais_aeroporto?: StringFieldUpdateOperationsInput | string
    codigo_local_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_aeroporto?: StringFieldUpdateOperationsInput | string
    nome_ascii_aeroporto?: StringFieldUpdateOperationsInput | string
    subdivisao_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    latitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude_aeroporto?: NullableFloatFieldUpdateOperationsInput | number | null
    codigo_iata_aeroporto?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_aeroporto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContainerCreateInput = {
    id_container?: string
    tipo_container: $Enums.ContainerTipo
    tamanho_container: string
    codigo_iso_container?: string | null
    armador_dono_container?: string | null
    ativo_container?: boolean
  }

  export type ContainerUncheckedCreateInput = {
    id_container?: string
    tipo_container: $Enums.ContainerTipo
    tamanho_container: string
    codigo_iso_container?: string | null
    armador_dono_container?: string | null
    ativo_container?: boolean
  }

  export type ContainerUpdateInput = {
    id_container?: StringFieldUpdateOperationsInput | string
    tipo_container?: EnumContainerTipoFieldUpdateOperationsInput | $Enums.ContainerTipo
    tamanho_container?: StringFieldUpdateOperationsInput | string
    codigo_iso_container?: NullableStringFieldUpdateOperationsInput | string | null
    armador_dono_container?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_container?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContainerUncheckedUpdateInput = {
    id_container?: StringFieldUpdateOperationsInput | string
    tipo_container?: EnumContainerTipoFieldUpdateOperationsInput | $Enums.ContainerTipo
    tamanho_container?: StringFieldUpdateOperationsInput | string
    codigo_iso_container?: NullableStringFieldUpdateOperationsInput | string | null
    armador_dono_container?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_container?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContainerCreateManyInput = {
    id_container?: string
    tipo_container: $Enums.ContainerTipo
    tamanho_container: string
    codigo_iso_container?: string | null
    armador_dono_container?: string | null
    ativo_container?: boolean
  }

  export type ContainerUpdateManyMutationInput = {
    id_container?: StringFieldUpdateOperationsInput | string
    tipo_container?: EnumContainerTipoFieldUpdateOperationsInput | $Enums.ContainerTipo
    tamanho_container?: StringFieldUpdateOperationsInput | string
    codigo_iso_container?: NullableStringFieldUpdateOperationsInput | string | null
    armador_dono_container?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_container?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ContainerUncheckedUpdateManyInput = {
    id_container?: StringFieldUpdateOperationsInput | string
    tipo_container?: EnumContainerTipoFieldUpdateOperationsInput | $Enums.ContainerTipo
    tamanho_container?: StringFieldUpdateOperationsInput | string
    codigo_iso_container?: NullableStringFieldUpdateOperationsInput | string | null
    armador_dono_container?: NullableStringFieldUpdateOperationsInput | string | null
    ativo_container?: BoolFieldUpdateOperationsInput | boolean
  }

  export type NcmSyncCreateInput = {
    codigo_ncm_sync: string
    descricao_ncm_sync: string
    ipi_ncm_sync?: number | null
    ii_ncm_sync?: number | null
    pis_ncm_sync?: number | null
    cofins_ncm_sync?: number | null
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: Date | string | null
    data_fim_ncm_sync?: Date | string | null
    id_ncm_sync_log?: string | null
    data_criacao_ncm_sync?: Date | string
    data_atualizacao_ncm_sync?: Date | string
  }

  export type NcmSyncUncheckedCreateInput = {
    codigo_ncm_sync: string
    descricao_ncm_sync: string
    ipi_ncm_sync?: number | null
    ii_ncm_sync?: number | null
    pis_ncm_sync?: number | null
    cofins_ncm_sync?: number | null
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: Date | string | null
    data_fim_ncm_sync?: Date | string | null
    id_ncm_sync_log?: string | null
    data_criacao_ncm_sync?: Date | string
    data_atualizacao_ncm_sync?: Date | string
  }

  export type NcmSyncUpdateInput = {
    codigo_ncm_sync?: StringFieldUpdateOperationsInput | string
    descricao_ncm_sync?: StringFieldUpdateOperationsInput | string
    ipi_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    pis_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm_sync?: BoolFieldUpdateOperationsInput | boolean
    data_inicio_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_fim_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    id_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncUncheckedUpdateInput = {
    codigo_ncm_sync?: StringFieldUpdateOperationsInput | string
    descricao_ncm_sync?: StringFieldUpdateOperationsInput | string
    ipi_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    pis_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm_sync?: BoolFieldUpdateOperationsInput | boolean
    data_inicio_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_fim_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    id_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncCreateManyInput = {
    codigo_ncm_sync: string
    descricao_ncm_sync: string
    ipi_ncm_sync?: number | null
    ii_ncm_sync?: number | null
    pis_ncm_sync?: number | null
    cofins_ncm_sync?: number | null
    ativo_ncm_sync?: boolean
    data_inicio_ncm_sync?: Date | string | null
    data_fim_ncm_sync?: Date | string | null
    id_ncm_sync_log?: string | null
    data_criacao_ncm_sync?: Date | string
    data_atualizacao_ncm_sync?: Date | string
  }

  export type NcmSyncUpdateManyMutationInput = {
    codigo_ncm_sync?: StringFieldUpdateOperationsInput | string
    descricao_ncm_sync?: StringFieldUpdateOperationsInput | string
    ipi_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    pis_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm_sync?: BoolFieldUpdateOperationsInput | boolean
    data_inicio_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_fim_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    id_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncUncheckedUpdateManyInput = {
    codigo_ncm_sync?: StringFieldUpdateOperationsInput | string
    descricao_ncm_sync?: StringFieldUpdateOperationsInput | string
    ipi_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    pis_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm_sync?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm_sync?: BoolFieldUpdateOperationsInput | boolean
    data_inicio_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_fim_ncm_sync?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    id_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncLogCreateInput = {
    id_ncm_sync_log?: string
    data_inicio_ncm_sync_log?: Date | string
    data_conclusao_ncm_sync_log?: Date | string | null
    status_ncm_sync_log?: $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: number
    adicionados_ncm_sync_log?: number
    alterados_ncm_sync_log?: number
    removidos_ncm_sync_log?: number
    origem_ncm_sync_log?: $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: string | null
    mensagem_erro_ncm_sync_log?: string | null
    data_criacao_ncm_sync_log?: Date | string
    data_atualizacao_ncm_sync_log?: Date | string
  }

  export type NcmSyncLogUncheckedCreateInput = {
    id_ncm_sync_log?: string
    data_inicio_ncm_sync_log?: Date | string
    data_conclusao_ncm_sync_log?: Date | string | null
    status_ncm_sync_log?: $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: number
    adicionados_ncm_sync_log?: number
    alterados_ncm_sync_log?: number
    removidos_ncm_sync_log?: number
    origem_ncm_sync_log?: $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: string | null
    mensagem_erro_ncm_sync_log?: string | null
    data_criacao_ncm_sync_log?: Date | string
    data_atualizacao_ncm_sync_log?: Date | string
  }

  export type NcmSyncLogUpdateInput = {
    id_ncm_sync_log?: StringFieldUpdateOperationsInput | string
    data_inicio_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_conclusao_ncm_sync_log?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    adicionados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    alterados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    removidos_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    mensagem_erro_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncLogUncheckedUpdateInput = {
    id_ncm_sync_log?: StringFieldUpdateOperationsInput | string
    data_inicio_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_conclusao_ncm_sync_log?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    adicionados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    alterados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    removidos_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    mensagem_erro_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncLogCreateManyInput = {
    id_ncm_sync_log?: string
    data_inicio_ncm_sync_log?: Date | string
    data_conclusao_ncm_sync_log?: Date | string | null
    status_ncm_sync_log?: $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: number
    adicionados_ncm_sync_log?: number
    alterados_ncm_sync_log?: number
    removidos_ncm_sync_log?: number
    origem_ncm_sync_log?: $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: string | null
    mensagem_erro_ncm_sync_log?: string | null
    data_criacao_ncm_sync_log?: Date | string
    data_atualizacao_ncm_sync_log?: Date | string
  }

  export type NcmSyncLogUpdateManyMutationInput = {
    id_ncm_sync_log?: StringFieldUpdateOperationsInput | string
    data_inicio_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_conclusao_ncm_sync_log?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    adicionados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    alterados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    removidos_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    mensagem_erro_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncLogUncheckedUpdateManyInput = {
    id_ncm_sync_log?: StringFieldUpdateOperationsInput | string
    data_inicio_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_conclusao_ncm_sync_log?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status_ncm_sync_log?: EnumNcmSyncStatusSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncStatusSincronizacao
    total_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    adicionados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    alterados_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    removidos_ncm_sync_log?: IntFieldUpdateOperationsInput | number
    origem_ncm_sync_log?: EnumNcmSyncOrigemSincronizacaoFieldUpdateOperationsInput | $Enums.NcmSyncOrigemSincronizacao
    disparado_por_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    mensagem_erro_ncm_sync_log?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_log?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncAgendamentoCreateInput = {
    id_ncm_sync_agendamento?: string
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: Date | string
    data_atualizacao_ncm_sync_agendamento?: Date | string
  }

  export type NcmSyncAgendamentoUncheckedCreateInput = {
    id_ncm_sync_agendamento?: string
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: Date | string
    data_atualizacao_ncm_sync_agendamento?: Date | string
  }

  export type NcmSyncAgendamentoUpdateInput = {
    id_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    ativo_ncm_sync_agendamento?: BoolFieldUpdateOperationsInput | boolean
    cron_expressao_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncAgendamentoUncheckedUpdateInput = {
    id_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    ativo_ncm_sync_agendamento?: BoolFieldUpdateOperationsInput | boolean
    cron_expressao_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncAgendamentoCreateManyInput = {
    id_ncm_sync_agendamento?: string
    ativo_ncm_sync_agendamento?: boolean
    cron_expressao_ncm_sync_agendamento?: string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: Date | string
    data_atualizacao_ncm_sync_agendamento?: Date | string
  }

  export type NcmSyncAgendamentoUpdateManyMutationInput = {
    id_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    ativo_ncm_sync_agendamento?: BoolFieldUpdateOperationsInput | boolean
    cron_expressao_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NcmSyncAgendamentoUncheckedUpdateManyInput = {
    id_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    ativo_ncm_sync_agendamento?: BoolFieldUpdateOperationsInput | boolean
    cron_expressao_ncm_sync_agendamento?: StringFieldUpdateOperationsInput | string
    notificadores_ncm_sync_agendamento?: JsonNullValueInput | InputJsonValue
    data_criacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_ncm_sync_agendamento?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpeCreateInput = {
    suid_ope: string
    id_organizacao_ope: string
    id_produto_ope?: string | null
    id_usuario_ope?: string | null
    codigo_portal_unico_ope: string
    situacao_ope: string
    versao_ope: string
    nome_ope: string
    cnpj_raiz_empresa_ope: string
    pais_ope: string
    estado_ope?: string | null
    cidade_ope?: string | null
    endereco_ope?: string | null
    zip_ope?: string | null
    tin_ope?: string | null
    email_ope?: string | null
    ultima_sincronizacao_ope: Date | string
    origem_ope?: string
  }

  export type OpeUncheckedCreateInput = {
    suid_ope: string
    id_organizacao_ope: string
    id_produto_ope?: string | null
    id_usuario_ope?: string | null
    codigo_portal_unico_ope: string
    situacao_ope: string
    versao_ope: string
    nome_ope: string
    cnpj_raiz_empresa_ope: string
    pais_ope: string
    estado_ope?: string | null
    cidade_ope?: string | null
    endereco_ope?: string | null
    zip_ope?: string | null
    tin_ope?: string | null
    email_ope?: string | null
    ultima_sincronizacao_ope: Date | string
    origem_ope?: string
  }

  export type OpeUpdateInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope?: StringFieldUpdateOperationsInput | string
    id_produto_ope?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_portal_unico_ope?: StringFieldUpdateOperationsInput | string
    situacao_ope?: StringFieldUpdateOperationsInput | string
    versao_ope?: StringFieldUpdateOperationsInput | string
    nome_ope?: StringFieldUpdateOperationsInput | string
    cnpj_raiz_empresa_ope?: StringFieldUpdateOperationsInput | string
    pais_ope?: StringFieldUpdateOperationsInput | string
    estado_ope?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_ope?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_ope?: NullableStringFieldUpdateOperationsInput | string | null
    zip_ope?: NullableStringFieldUpdateOperationsInput | string | null
    tin_ope?: NullableStringFieldUpdateOperationsInput | string | null
    email_ope?: NullableStringFieldUpdateOperationsInput | string | null
    ultima_sincronizacao_ope?: DateTimeFieldUpdateOperationsInput | Date | string
    origem_ope?: StringFieldUpdateOperationsInput | string
  }

  export type OpeUncheckedUpdateInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope?: StringFieldUpdateOperationsInput | string
    id_produto_ope?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_portal_unico_ope?: StringFieldUpdateOperationsInput | string
    situacao_ope?: StringFieldUpdateOperationsInput | string
    versao_ope?: StringFieldUpdateOperationsInput | string
    nome_ope?: StringFieldUpdateOperationsInput | string
    cnpj_raiz_empresa_ope?: StringFieldUpdateOperationsInput | string
    pais_ope?: StringFieldUpdateOperationsInput | string
    estado_ope?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_ope?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_ope?: NullableStringFieldUpdateOperationsInput | string | null
    zip_ope?: NullableStringFieldUpdateOperationsInput | string | null
    tin_ope?: NullableStringFieldUpdateOperationsInput | string | null
    email_ope?: NullableStringFieldUpdateOperationsInput | string | null
    ultima_sincronizacao_ope?: DateTimeFieldUpdateOperationsInput | Date | string
    origem_ope?: StringFieldUpdateOperationsInput | string
  }

  export type OpeCreateManyInput = {
    suid_ope: string
    id_organizacao_ope: string
    id_produto_ope?: string | null
    id_usuario_ope?: string | null
    codigo_portal_unico_ope: string
    situacao_ope: string
    versao_ope: string
    nome_ope: string
    cnpj_raiz_empresa_ope: string
    pais_ope: string
    estado_ope?: string | null
    cidade_ope?: string | null
    endereco_ope?: string | null
    zip_ope?: string | null
    tin_ope?: string | null
    email_ope?: string | null
    ultima_sincronizacao_ope: Date | string
    origem_ope?: string
  }

  export type OpeUpdateManyMutationInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope?: StringFieldUpdateOperationsInput | string
    id_produto_ope?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_portal_unico_ope?: StringFieldUpdateOperationsInput | string
    situacao_ope?: StringFieldUpdateOperationsInput | string
    versao_ope?: StringFieldUpdateOperationsInput | string
    nome_ope?: StringFieldUpdateOperationsInput | string
    cnpj_raiz_empresa_ope?: StringFieldUpdateOperationsInput | string
    pais_ope?: StringFieldUpdateOperationsInput | string
    estado_ope?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_ope?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_ope?: NullableStringFieldUpdateOperationsInput | string | null
    zip_ope?: NullableStringFieldUpdateOperationsInput | string | null
    tin_ope?: NullableStringFieldUpdateOperationsInput | string | null
    email_ope?: NullableStringFieldUpdateOperationsInput | string | null
    ultima_sincronizacao_ope?: DateTimeFieldUpdateOperationsInput | Date | string
    origem_ope?: StringFieldUpdateOperationsInput | string
  }

  export type OpeUncheckedUpdateManyInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope?: StringFieldUpdateOperationsInput | string
    id_produto_ope?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope?: NullableStringFieldUpdateOperationsInput | string | null
    codigo_portal_unico_ope?: StringFieldUpdateOperationsInput | string
    situacao_ope?: StringFieldUpdateOperationsInput | string
    versao_ope?: StringFieldUpdateOperationsInput | string
    nome_ope?: StringFieldUpdateOperationsInput | string
    cnpj_raiz_empresa_ope?: StringFieldUpdateOperationsInput | string
    pais_ope?: StringFieldUpdateOperationsInput | string
    estado_ope?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_ope?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_ope?: NullableStringFieldUpdateOperationsInput | string | null
    zip_ope?: NullableStringFieldUpdateOperationsInput | string | null
    tin_ope?: NullableStringFieldUpdateOperationsInput | string | null
    email_ope?: NullableStringFieldUpdateOperationsInput | string | null
    ultima_sincronizacao_ope?: DateTimeFieldUpdateOperationsInput | Date | string
    origem_ope?: StringFieldUpdateOperationsInput | string
  }

  export type OPEHistoricoStatusCreateInput = {
    id_ope_historico_status?: string
    id_organizacao_ope_historico_status?: string | null
    id_produto_ope_historico_status?: string | null
    id_usuario_ope_historico_status?: string | null
    suid_ope_historico_status: string
    status_anterior_ope_historico_status?: string | null
    status_novo_ope_historico_status: string
    origem_ope_historico_status: string
    payload_ope_historico_status: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: Date | string
  }

  export type OPEHistoricoStatusUncheckedCreateInput = {
    id_ope_historico_status?: string
    id_organizacao_ope_historico_status?: string | null
    id_produto_ope_historico_status?: string | null
    id_usuario_ope_historico_status?: string | null
    suid_ope_historico_status: string
    status_anterior_ope_historico_status?: string | null
    status_novo_ope_historico_status: string
    origem_ope_historico_status: string
    payload_ope_historico_status: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: Date | string
  }

  export type OPEHistoricoStatusUpdateInput = {
    id_ope_historico_status?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_produto_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    suid_ope_historico_status?: StringFieldUpdateOperationsInput | string
    status_anterior_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_ope_historico_status?: StringFieldUpdateOperationsInput | string
    origem_ope_historico_status?: StringFieldUpdateOperationsInput | string
    payload_ope_historico_status?: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OPEHistoricoStatusUncheckedUpdateInput = {
    id_ope_historico_status?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_produto_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    suid_ope_historico_status?: StringFieldUpdateOperationsInput | string
    status_anterior_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_ope_historico_status?: StringFieldUpdateOperationsInput | string
    origem_ope_historico_status?: StringFieldUpdateOperationsInput | string
    payload_ope_historico_status?: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OPEHistoricoStatusCreateManyInput = {
    id_ope_historico_status?: string
    id_organizacao_ope_historico_status?: string | null
    id_produto_ope_historico_status?: string | null
    id_usuario_ope_historico_status?: string | null
    suid_ope_historico_status: string
    status_anterior_ope_historico_status?: string | null
    status_novo_ope_historico_status: string
    origem_ope_historico_status: string
    payload_ope_historico_status: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: Date | string
  }

  export type OPEHistoricoStatusUpdateManyMutationInput = {
    id_ope_historico_status?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_produto_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    suid_ope_historico_status?: StringFieldUpdateOperationsInput | string
    status_anterior_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_ope_historico_status?: StringFieldUpdateOperationsInput | string
    origem_ope_historico_status?: StringFieldUpdateOperationsInput | string
    payload_ope_historico_status?: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OPEHistoricoStatusUncheckedUpdateManyInput = {
    id_ope_historico_status?: StringFieldUpdateOperationsInput | string
    id_organizacao_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_produto_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    suid_ope_historico_status?: StringFieldUpdateOperationsInput | string
    status_anterior_ope_historico_status?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_ope_historico_status?: StringFieldUpdateOperationsInput | string
    origem_ope_historico_status?: StringFieldUpdateOperationsInput | string
    payload_ope_historico_status?: JsonNullValueInput | InputJsonValue
    registrado_em_ope_historico_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FornecedorOrganizacaoListRelationFilter = {
    every?: FornecedorOrganizacaoWhereInput
    some?: FornecedorOrganizacaoWhereInput
    none?: FornecedorOrganizacaoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FornecedorOrganizacaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FornecedorId_organizacao_cadastro_fornecedorCnpj_fornecedorCompoundUniqueInput = {
    id_organizacao_cadastro_fornecedor: string
    cnpj_fornecedor: string
  }

  export type FornecedorId_organizacao_cadastro_fornecedorTin_fornecedorPais_fornecedorCompoundUniqueInput = {
    id_organizacao_cadastro_fornecedor: string
    tin_fornecedor: string
    pais_fornecedor: string
  }

  export type FornecedorCountOrderByAggregateInput = {
    id_fornecedor?: SortOrder
    id_organizacao_cadastro_fornecedor?: SortOrder
    id_produto_fornecedor?: SortOrder
    id_usuario_cadastro_fornecedor?: SortOrder
    nome_fornecedor?: SortOrder
    cnpj_fornecedor?: SortOrder
    tin_fornecedor?: SortOrder
    pais_fornecedor?: SortOrder
    estado_provincia_fornecedor?: SortOrder
    cidade_fornecedor?: SortOrder
    endereco_fornecedor?: SortOrder
    cep_zipcode_fornecedor?: SortOrder
    email_principal_fornecedor?: SortOrder
    telefone_principal_fornecedor?: SortOrder
    whatsapp_principal_fornecedor?: SortOrder
    pode_ser_importador_fornecedor?: SortOrder
    pode_ser_exportador_fornecedor?: SortOrder
    pode_ser_fabricante_fornecedor?: SortOrder
    pode_ser_agente_fornecedor?: SortOrder
    pode_ser_despachante_fornecedor?: SortOrder
    pode_ser_armador_fornecedor?: SortOrder
    pode_ser_armazem_alfandegado_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: SortOrder
    pode_ser_cia_aerea_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_corretora_cambio_fornecedor?: SortOrder
    pode_ser_banco_fornecedor?: SortOrder
    pode_ser_armazem_nacional_fornecedor?: SortOrder
    ativo_fornecedor?: SortOrder
    criado_em_fornecedor?: SortOrder
    atualizado_em_fornecedor?: SortOrder
  }

  export type FornecedorMaxOrderByAggregateInput = {
    id_fornecedor?: SortOrder
    id_organizacao_cadastro_fornecedor?: SortOrder
    id_produto_fornecedor?: SortOrder
    id_usuario_cadastro_fornecedor?: SortOrder
    nome_fornecedor?: SortOrder
    cnpj_fornecedor?: SortOrder
    tin_fornecedor?: SortOrder
    pais_fornecedor?: SortOrder
    estado_provincia_fornecedor?: SortOrder
    cidade_fornecedor?: SortOrder
    endereco_fornecedor?: SortOrder
    cep_zipcode_fornecedor?: SortOrder
    email_principal_fornecedor?: SortOrder
    telefone_principal_fornecedor?: SortOrder
    whatsapp_principal_fornecedor?: SortOrder
    pode_ser_importador_fornecedor?: SortOrder
    pode_ser_exportador_fornecedor?: SortOrder
    pode_ser_fabricante_fornecedor?: SortOrder
    pode_ser_agente_fornecedor?: SortOrder
    pode_ser_despachante_fornecedor?: SortOrder
    pode_ser_armador_fornecedor?: SortOrder
    pode_ser_armazem_alfandegado_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: SortOrder
    pode_ser_cia_aerea_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_corretora_cambio_fornecedor?: SortOrder
    pode_ser_banco_fornecedor?: SortOrder
    pode_ser_armazem_nacional_fornecedor?: SortOrder
    ativo_fornecedor?: SortOrder
    criado_em_fornecedor?: SortOrder
    atualizado_em_fornecedor?: SortOrder
  }

  export type FornecedorMinOrderByAggregateInput = {
    id_fornecedor?: SortOrder
    id_organizacao_cadastro_fornecedor?: SortOrder
    id_produto_fornecedor?: SortOrder
    id_usuario_cadastro_fornecedor?: SortOrder
    nome_fornecedor?: SortOrder
    cnpj_fornecedor?: SortOrder
    tin_fornecedor?: SortOrder
    pais_fornecedor?: SortOrder
    estado_provincia_fornecedor?: SortOrder
    cidade_fornecedor?: SortOrder
    endereco_fornecedor?: SortOrder
    cep_zipcode_fornecedor?: SortOrder
    email_principal_fornecedor?: SortOrder
    telefone_principal_fornecedor?: SortOrder
    whatsapp_principal_fornecedor?: SortOrder
    pode_ser_importador_fornecedor?: SortOrder
    pode_ser_exportador_fornecedor?: SortOrder
    pode_ser_fabricante_fornecedor?: SortOrder
    pode_ser_agente_fornecedor?: SortOrder
    pode_ser_despachante_fornecedor?: SortOrder
    pode_ser_armador_fornecedor?: SortOrder
    pode_ser_armazem_alfandegado_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: SortOrder
    pode_ser_cia_aerea_fornecedor?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_internacional_fornecedor?: SortOrder
    pode_ser_seguradora_corretora_cambio_fornecedor?: SortOrder
    pode_ser_banco_fornecedor?: SortOrder
    pode_ser_armazem_nacional_fornecedor?: SortOrder
    ativo_fornecedor?: SortOrder
    criado_em_fornecedor?: SortOrder
    atualizado_em_fornecedor?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumTipoFornecedorOrganizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoFornecedorOrganizacao | EnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel> | $Enums.TipoFornecedorOrganizacao
  }

  export type EnumStatusFornecedorOrganizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusFornecedorOrganizacao | EnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel> | $Enums.StatusFornecedorOrganizacao
  }

  export type FornecedorRelationFilter = {
    is?: FornecedorWhereInput
    isNot?: FornecedorWhereInput
  }

  export type FornecedorOrganizacaoId_fornecedorId_organizacaoTipo_fornecedor_organizacaoCompoundUniqueInput = {
    id_fornecedor: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
  }

  export type FornecedorOrganizacaoCountOrderByAggregateInput = {
    id_fornecedor_organizacao?: SortOrder
    id_fornecedor?: SortOrder
    id_organizacao?: SortOrder
    tipo_fornecedor_organizacao?: SortOrder
    status_fornecedor_organizacao?: SortOrder
    id_usuario?: SortOrder
    data_criacao_fornecedor_organizacao?: SortOrder
    data_atualizacao_fornecedor_organizacao?: SortOrder
  }

  export type FornecedorOrganizacaoMaxOrderByAggregateInput = {
    id_fornecedor_organizacao?: SortOrder
    id_fornecedor?: SortOrder
    id_organizacao?: SortOrder
    tipo_fornecedor_organizacao?: SortOrder
    status_fornecedor_organizacao?: SortOrder
    id_usuario?: SortOrder
    data_criacao_fornecedor_organizacao?: SortOrder
    data_atualizacao_fornecedor_organizacao?: SortOrder
  }

  export type FornecedorOrganizacaoMinOrderByAggregateInput = {
    id_fornecedor_organizacao?: SortOrder
    id_fornecedor?: SortOrder
    id_organizacao?: SortOrder
    tipo_fornecedor_organizacao?: SortOrder
    status_fornecedor_organizacao?: SortOrder
    id_usuario?: SortOrder
    data_criacao_fornecedor_organizacao?: SortOrder
    data_atualizacao_fornecedor_organizacao?: SortOrder
  }

  export type EnumTipoFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoFornecedorOrganizacao | EnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel> | $Enums.TipoFornecedorOrganizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel>
    _max?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel>
  }

  export type EnumStatusFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusFornecedorOrganizacao | EnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel> | $Enums.StatusFornecedorOrganizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel>
    _max?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel>
  }

  export type PaisCountOrderByAggregateInput = {
    id_pais?: SortOrder
    nome_pais_portugues?: SortOrder
    nome_pais_ingles?: SortOrder
    codigo_pais_portal_unico_siscomex?: SortOrder
    codigo_pais_bacen_4?: SortOrder
    codigo_pais_bacen_5?: SortOrder
    codigo_pais_sped_nfe?: SortOrder
    codigo_pais_sped_efd?: SortOrder
    codigo_pais_iso_alpha2?: SortOrder
    codigo_pais_iso_alpha3?: SortOrder
    codigo_pais_iso_numerico?: SortOrder
    ativo_pais?: SortOrder
  }

  export type PaisMaxOrderByAggregateInput = {
    id_pais?: SortOrder
    nome_pais_portugues?: SortOrder
    nome_pais_ingles?: SortOrder
    codigo_pais_portal_unico_siscomex?: SortOrder
    codigo_pais_bacen_4?: SortOrder
    codigo_pais_bacen_5?: SortOrder
    codigo_pais_sped_nfe?: SortOrder
    codigo_pais_sped_efd?: SortOrder
    codigo_pais_iso_alpha2?: SortOrder
    codigo_pais_iso_alpha3?: SortOrder
    codigo_pais_iso_numerico?: SortOrder
    ativo_pais?: SortOrder
  }

  export type PaisMinOrderByAggregateInput = {
    id_pais?: SortOrder
    nome_pais_portugues?: SortOrder
    nome_pais_ingles?: SortOrder
    codigo_pais_portal_unico_siscomex?: SortOrder
    codigo_pais_bacen_4?: SortOrder
    codigo_pais_bacen_5?: SortOrder
    codigo_pais_sped_nfe?: SortOrder
    codigo_pais_sped_efd?: SortOrder
    codigo_pais_iso_alpha2?: SortOrder
    codigo_pais_iso_alpha3?: SortOrder
    codigo_pais_iso_numerico?: SortOrder
    ativo_pais?: SortOrder
  }

  export type MoedaCountOrderByAggregateInput = {
    codigo_moeda?: SortOrder
    nome_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaMaxOrderByAggregateInput = {
    codigo_moeda?: SortOrder
    nome_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaMinOrderByAggregateInput = {
    codigo_moeda?: SortOrder
    nome_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type UnidadeCountOrderByAggregateInput = {
    codigo_unidade?: SortOrder
    nome_unidade?: SortOrder
    tipo_unidade?: SortOrder
    ativo_unidade?: SortOrder
  }

  export type UnidadeMaxOrderByAggregateInput = {
    codigo_unidade?: SortOrder
    nome_unidade?: SortOrder
    tipo_unidade?: SortOrder
    ativo_unidade?: SortOrder
  }

  export type UnidadeMinOrderByAggregateInput = {
    codigo_unidade?: SortOrder
    nome_unidade?: SortOrder
    tipo_unidade?: SortOrder
    ativo_unidade?: SortOrder
  }

  export type IncotermCountOrderByAggregateInput = {
    codigo_incoterm?: SortOrder
    nome_incoterm?: SortOrder
    descricao_incoterm?: SortOrder
    modal_transporte?: SortOrder
    versao_incoterm?: SortOrder
    ativo_incoterm?: SortOrder
  }

  export type IncotermMaxOrderByAggregateInput = {
    codigo_incoterm?: SortOrder
    nome_incoterm?: SortOrder
    descricao_incoterm?: SortOrder
    modal_transporte?: SortOrder
    versao_incoterm?: SortOrder
    ativo_incoterm?: SortOrder
  }

  export type IncotermMinOrderByAggregateInput = {
    codigo_incoterm?: SortOrder
    nome_incoterm?: SortOrder
    descricao_incoterm?: SortOrder
    modal_transporte?: SortOrder
    versao_incoterm?: SortOrder
    ativo_incoterm?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type PortoCountOrderByAggregateInput = {
    id_porto?: SortOrder
    codigo_unlocode_porto?: SortOrder
    codigo_pais_porto?: SortOrder
    codigo_local_porto?: SortOrder
    nome_porto?: SortOrder
    nome_ascii_porto?: SortOrder
    subdivisao_porto?: SortOrder
    latitude_porto?: SortOrder
    longitude_porto?: SortOrder
    codigo_iata_porto?: SortOrder
    ativo_porto?: SortOrder
  }

  export type PortoAvgOrderByAggregateInput = {
    latitude_porto?: SortOrder
    longitude_porto?: SortOrder
  }

  export type PortoMaxOrderByAggregateInput = {
    id_porto?: SortOrder
    codigo_unlocode_porto?: SortOrder
    codigo_pais_porto?: SortOrder
    codigo_local_porto?: SortOrder
    nome_porto?: SortOrder
    nome_ascii_porto?: SortOrder
    subdivisao_porto?: SortOrder
    latitude_porto?: SortOrder
    longitude_porto?: SortOrder
    codigo_iata_porto?: SortOrder
    ativo_porto?: SortOrder
  }

  export type PortoMinOrderByAggregateInput = {
    id_porto?: SortOrder
    codigo_unlocode_porto?: SortOrder
    codigo_pais_porto?: SortOrder
    codigo_local_porto?: SortOrder
    nome_porto?: SortOrder
    nome_ascii_porto?: SortOrder
    subdivisao_porto?: SortOrder
    latitude_porto?: SortOrder
    longitude_porto?: SortOrder
    codigo_iata_porto?: SortOrder
    ativo_porto?: SortOrder
  }

  export type PortoSumOrderByAggregateInput = {
    latitude_porto?: SortOrder
    longitude_porto?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type AeroportoCountOrderByAggregateInput = {
    id_aeroporto?: SortOrder
    codigo_unlocode_aeroporto?: SortOrder
    codigo_pais_aeroporto?: SortOrder
    codigo_local_aeroporto?: SortOrder
    nome_aeroporto?: SortOrder
    nome_ascii_aeroporto?: SortOrder
    subdivisao_aeroporto?: SortOrder
    latitude_aeroporto?: SortOrder
    longitude_aeroporto?: SortOrder
    codigo_iata_aeroporto?: SortOrder
    ativo_aeroporto?: SortOrder
  }

  export type AeroportoAvgOrderByAggregateInput = {
    latitude_aeroporto?: SortOrder
    longitude_aeroporto?: SortOrder
  }

  export type AeroportoMaxOrderByAggregateInput = {
    id_aeroporto?: SortOrder
    codigo_unlocode_aeroporto?: SortOrder
    codigo_pais_aeroporto?: SortOrder
    codigo_local_aeroporto?: SortOrder
    nome_aeroporto?: SortOrder
    nome_ascii_aeroporto?: SortOrder
    subdivisao_aeroporto?: SortOrder
    latitude_aeroporto?: SortOrder
    longitude_aeroporto?: SortOrder
    codigo_iata_aeroporto?: SortOrder
    ativo_aeroporto?: SortOrder
  }

  export type AeroportoMinOrderByAggregateInput = {
    id_aeroporto?: SortOrder
    codigo_unlocode_aeroporto?: SortOrder
    codigo_pais_aeroporto?: SortOrder
    codigo_local_aeroporto?: SortOrder
    nome_aeroporto?: SortOrder
    nome_ascii_aeroporto?: SortOrder
    subdivisao_aeroporto?: SortOrder
    latitude_aeroporto?: SortOrder
    longitude_aeroporto?: SortOrder
    codigo_iata_aeroporto?: SortOrder
    ativo_aeroporto?: SortOrder
  }

  export type AeroportoSumOrderByAggregateInput = {
    latitude_aeroporto?: SortOrder
    longitude_aeroporto?: SortOrder
  }

  export type EnumContainerTipoFilter<$PrismaModel = never> = {
    equals?: $Enums.ContainerTipo | EnumContainerTipoFieldRefInput<$PrismaModel>
    in?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    notIn?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    not?: NestedEnumContainerTipoFilter<$PrismaModel> | $Enums.ContainerTipo
  }

  export type ContainerCountOrderByAggregateInput = {
    id_container?: SortOrder
    tipo_container?: SortOrder
    tamanho_container?: SortOrder
    codigo_iso_container?: SortOrder
    armador_dono_container?: SortOrder
    ativo_container?: SortOrder
  }

  export type ContainerMaxOrderByAggregateInput = {
    id_container?: SortOrder
    tipo_container?: SortOrder
    tamanho_container?: SortOrder
    codigo_iso_container?: SortOrder
    armador_dono_container?: SortOrder
    ativo_container?: SortOrder
  }

  export type ContainerMinOrderByAggregateInput = {
    id_container?: SortOrder
    tipo_container?: SortOrder
    tamanho_container?: SortOrder
    codigo_iso_container?: SortOrder
    armador_dono_container?: SortOrder
    ativo_container?: SortOrder
  }

  export type EnumContainerTipoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ContainerTipo | EnumContainerTipoFieldRefInput<$PrismaModel>
    in?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    notIn?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    not?: NestedEnumContainerTipoWithAggregatesFilter<$PrismaModel> | $Enums.ContainerTipo
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumContainerTipoFilter<$PrismaModel>
    _max?: NestedEnumContainerTipoFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NcmSyncCountOrderByAggregateInput = {
    codigo_ncm_sync?: SortOrder
    descricao_ncm_sync?: SortOrder
    ipi_ncm_sync?: SortOrder
    ii_ncm_sync?: SortOrder
    pis_ncm_sync?: SortOrder
    cofins_ncm_sync?: SortOrder
    ativo_ncm_sync?: SortOrder
    data_inicio_ncm_sync?: SortOrder
    data_fim_ncm_sync?: SortOrder
    id_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync?: SortOrder
    data_atualizacao_ncm_sync?: SortOrder
  }

  export type NcmSyncAvgOrderByAggregateInput = {
    ipi_ncm_sync?: SortOrder
    ii_ncm_sync?: SortOrder
    pis_ncm_sync?: SortOrder
    cofins_ncm_sync?: SortOrder
  }

  export type NcmSyncMaxOrderByAggregateInput = {
    codigo_ncm_sync?: SortOrder
    descricao_ncm_sync?: SortOrder
    ipi_ncm_sync?: SortOrder
    ii_ncm_sync?: SortOrder
    pis_ncm_sync?: SortOrder
    cofins_ncm_sync?: SortOrder
    ativo_ncm_sync?: SortOrder
    data_inicio_ncm_sync?: SortOrder
    data_fim_ncm_sync?: SortOrder
    id_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync?: SortOrder
    data_atualizacao_ncm_sync?: SortOrder
  }

  export type NcmSyncMinOrderByAggregateInput = {
    codigo_ncm_sync?: SortOrder
    descricao_ncm_sync?: SortOrder
    ipi_ncm_sync?: SortOrder
    ii_ncm_sync?: SortOrder
    pis_ncm_sync?: SortOrder
    cofins_ncm_sync?: SortOrder
    ativo_ncm_sync?: SortOrder
    data_inicio_ncm_sync?: SortOrder
    data_fim_ncm_sync?: SortOrder
    id_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync?: SortOrder
    data_atualizacao_ncm_sync?: SortOrder
  }

  export type NcmSyncSumOrderByAggregateInput = {
    ipi_ncm_sync?: SortOrder
    ii_ncm_sync?: SortOrder
    pis_ncm_sync?: SortOrder
    cofins_ncm_sync?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumNcmSyncStatusSincronizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncStatusSincronizacao | EnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel> | $Enums.NcmSyncStatusSincronizacao
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncOrigemSincronizacao | EnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel> | $Enums.NcmSyncOrigemSincronizacao
  }

  export type NcmSyncLogCountOrderByAggregateInput = {
    id_ncm_sync_log?: SortOrder
    data_inicio_ncm_sync_log?: SortOrder
    data_conclusao_ncm_sync_log?: SortOrder
    status_ncm_sync_log?: SortOrder
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
    origem_ncm_sync_log?: SortOrder
    disparado_por_ncm_sync_log?: SortOrder
    mensagem_erro_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync_log?: SortOrder
    data_atualizacao_ncm_sync_log?: SortOrder
  }

  export type NcmSyncLogAvgOrderByAggregateInput = {
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
  }

  export type NcmSyncLogMaxOrderByAggregateInput = {
    id_ncm_sync_log?: SortOrder
    data_inicio_ncm_sync_log?: SortOrder
    data_conclusao_ncm_sync_log?: SortOrder
    status_ncm_sync_log?: SortOrder
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
    origem_ncm_sync_log?: SortOrder
    disparado_por_ncm_sync_log?: SortOrder
    mensagem_erro_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync_log?: SortOrder
    data_atualizacao_ncm_sync_log?: SortOrder
  }

  export type NcmSyncLogMinOrderByAggregateInput = {
    id_ncm_sync_log?: SortOrder
    data_inicio_ncm_sync_log?: SortOrder
    data_conclusao_ncm_sync_log?: SortOrder
    status_ncm_sync_log?: SortOrder
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
    origem_ncm_sync_log?: SortOrder
    disparado_por_ncm_sync_log?: SortOrder
    mensagem_erro_ncm_sync_log?: SortOrder
    data_criacao_ncm_sync_log?: SortOrder
    data_atualizacao_ncm_sync_log?: SortOrder
  }

  export type NcmSyncLogSumOrderByAggregateInput = {
    total_ncm_sync_log?: SortOrder
    adicionados_ncm_sync_log?: SortOrder
    alterados_ncm_sync_log?: SortOrder
    removidos_ncm_sync_log?: SortOrder
  }

  export type EnumNcmSyncStatusSincronizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncStatusSincronizacao | EnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncStatusSincronizacaoWithAggregatesFilter<$PrismaModel> | $Enums.NcmSyncStatusSincronizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel>
    _max?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumNcmSyncOrigemSincronizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncOrigemSincronizacao | EnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncOrigemSincronizacaoWithAggregatesFilter<$PrismaModel> | $Enums.NcmSyncOrigemSincronizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel>
    _max?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NcmSyncAgendamentoCountOrderByAggregateInput = {
    id_ncm_sync_agendamento?: SortOrder
    ativo_ncm_sync_agendamento?: SortOrder
    cron_expressao_ncm_sync_agendamento?: SortOrder
    notificadores_ncm_sync_agendamento?: SortOrder
    data_criacao_ncm_sync_agendamento?: SortOrder
    data_atualizacao_ncm_sync_agendamento?: SortOrder
  }

  export type NcmSyncAgendamentoMaxOrderByAggregateInput = {
    id_ncm_sync_agendamento?: SortOrder
    ativo_ncm_sync_agendamento?: SortOrder
    cron_expressao_ncm_sync_agendamento?: SortOrder
    data_criacao_ncm_sync_agendamento?: SortOrder
    data_atualizacao_ncm_sync_agendamento?: SortOrder
  }

  export type NcmSyncAgendamentoMinOrderByAggregateInput = {
    id_ncm_sync_agendamento?: SortOrder
    ativo_ncm_sync_agendamento?: SortOrder
    cron_expressao_ncm_sync_agendamento?: SortOrder
    data_criacao_ncm_sync_agendamento?: SortOrder
    data_atualizacao_ncm_sync_agendamento?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type OpeCountOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao_ope?: SortOrder
    id_produto_ope?: SortOrder
    id_usuario_ope?: SortOrder
    codigo_portal_unico_ope?: SortOrder
    situacao_ope?: SortOrder
    versao_ope?: SortOrder
    nome_ope?: SortOrder
    cnpj_raiz_empresa_ope?: SortOrder
    pais_ope?: SortOrder
    estado_ope?: SortOrder
    cidade_ope?: SortOrder
    endereco_ope?: SortOrder
    zip_ope?: SortOrder
    tin_ope?: SortOrder
    email_ope?: SortOrder
    ultima_sincronizacao_ope?: SortOrder
    origem_ope?: SortOrder
  }

  export type OpeMaxOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao_ope?: SortOrder
    id_produto_ope?: SortOrder
    id_usuario_ope?: SortOrder
    codigo_portal_unico_ope?: SortOrder
    situacao_ope?: SortOrder
    versao_ope?: SortOrder
    nome_ope?: SortOrder
    cnpj_raiz_empresa_ope?: SortOrder
    pais_ope?: SortOrder
    estado_ope?: SortOrder
    cidade_ope?: SortOrder
    endereco_ope?: SortOrder
    zip_ope?: SortOrder
    tin_ope?: SortOrder
    email_ope?: SortOrder
    ultima_sincronizacao_ope?: SortOrder
    origem_ope?: SortOrder
  }

  export type OpeMinOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao_ope?: SortOrder
    id_produto_ope?: SortOrder
    id_usuario_ope?: SortOrder
    codigo_portal_unico_ope?: SortOrder
    situacao_ope?: SortOrder
    versao_ope?: SortOrder
    nome_ope?: SortOrder
    cnpj_raiz_empresa_ope?: SortOrder
    pais_ope?: SortOrder
    estado_ope?: SortOrder
    cidade_ope?: SortOrder
    endereco_ope?: SortOrder
    zip_ope?: SortOrder
    tin_ope?: SortOrder
    email_ope?: SortOrder
    ultima_sincronizacao_ope?: SortOrder
    origem_ope?: SortOrder
  }

  export type OPEHistoricoStatusCountOrderByAggregateInput = {
    id_ope_historico_status?: SortOrder
    id_organizacao_ope_historico_status?: SortOrder
    id_produto_ope_historico_status?: SortOrder
    id_usuario_ope_historico_status?: SortOrder
    suid_ope_historico_status?: SortOrder
    status_anterior_ope_historico_status?: SortOrder
    status_novo_ope_historico_status?: SortOrder
    origem_ope_historico_status?: SortOrder
    payload_ope_historico_status?: SortOrder
    registrado_em_ope_historico_status?: SortOrder
  }

  export type OPEHistoricoStatusMaxOrderByAggregateInput = {
    id_ope_historico_status?: SortOrder
    id_organizacao_ope_historico_status?: SortOrder
    id_produto_ope_historico_status?: SortOrder
    id_usuario_ope_historico_status?: SortOrder
    suid_ope_historico_status?: SortOrder
    status_anterior_ope_historico_status?: SortOrder
    status_novo_ope_historico_status?: SortOrder
    origem_ope_historico_status?: SortOrder
    registrado_em_ope_historico_status?: SortOrder
  }

  export type OPEHistoricoStatusMinOrderByAggregateInput = {
    id_ope_historico_status?: SortOrder
    id_organizacao_ope_historico_status?: SortOrder
    id_produto_ope_historico_status?: SortOrder
    id_usuario_ope_historico_status?: SortOrder
    suid_ope_historico_status?: SortOrder
    status_anterior_ope_historico_status?: SortOrder
    status_novo_ope_historico_status?: SortOrder
    origem_ope_historico_status?: SortOrder
    registrado_em_ope_historico_status?: SortOrder
  }

  export type FornecedorOrganizacaoCreateNestedManyWithoutFornecedorInput = {
    create?: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput> | FornecedorOrganizacaoCreateWithoutFornecedorInput[] | FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput[]
    connectOrCreate?: FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput | FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput[]
    createMany?: FornecedorOrganizacaoCreateManyFornecedorInputEnvelope
    connect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
  }

  export type FornecedorOrganizacaoUncheckedCreateNestedManyWithoutFornecedorInput = {
    create?: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput> | FornecedorOrganizacaoCreateWithoutFornecedorInput[] | FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput[]
    connectOrCreate?: FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput | FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput[]
    createMany?: FornecedorOrganizacaoCreateManyFornecedorInputEnvelope
    connect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FornecedorOrganizacaoUpdateManyWithoutFornecedorNestedInput = {
    create?: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput> | FornecedorOrganizacaoCreateWithoutFornecedorInput[] | FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput[]
    connectOrCreate?: FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput | FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput[]
    upsert?: FornecedorOrganizacaoUpsertWithWhereUniqueWithoutFornecedorInput | FornecedorOrganizacaoUpsertWithWhereUniqueWithoutFornecedorInput[]
    createMany?: FornecedorOrganizacaoCreateManyFornecedorInputEnvelope
    set?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    disconnect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    delete?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    connect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    update?: FornecedorOrganizacaoUpdateWithWhereUniqueWithoutFornecedorInput | FornecedorOrganizacaoUpdateWithWhereUniqueWithoutFornecedorInput[]
    updateMany?: FornecedorOrganizacaoUpdateManyWithWhereWithoutFornecedorInput | FornecedorOrganizacaoUpdateManyWithWhereWithoutFornecedorInput[]
    deleteMany?: FornecedorOrganizacaoScalarWhereInput | FornecedorOrganizacaoScalarWhereInput[]
  }

  export type FornecedorOrganizacaoUncheckedUpdateManyWithoutFornecedorNestedInput = {
    create?: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput> | FornecedorOrganizacaoCreateWithoutFornecedorInput[] | FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput[]
    connectOrCreate?: FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput | FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput[]
    upsert?: FornecedorOrganizacaoUpsertWithWhereUniqueWithoutFornecedorInput | FornecedorOrganizacaoUpsertWithWhereUniqueWithoutFornecedorInput[]
    createMany?: FornecedorOrganizacaoCreateManyFornecedorInputEnvelope
    set?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    disconnect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    delete?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    connect?: FornecedorOrganizacaoWhereUniqueInput | FornecedorOrganizacaoWhereUniqueInput[]
    update?: FornecedorOrganizacaoUpdateWithWhereUniqueWithoutFornecedorInput | FornecedorOrganizacaoUpdateWithWhereUniqueWithoutFornecedorInput[]
    updateMany?: FornecedorOrganizacaoUpdateManyWithWhereWithoutFornecedorInput | FornecedorOrganizacaoUpdateManyWithWhereWithoutFornecedorInput[]
    deleteMany?: FornecedorOrganizacaoScalarWhereInput | FornecedorOrganizacaoScalarWhereInput[]
  }

  export type FornecedorCreateNestedOneWithoutFornecedores_organizacaoInput = {
    create?: XOR<FornecedorCreateWithoutFornecedores_organizacaoInput, FornecedorUncheckedCreateWithoutFornecedores_organizacaoInput>
    connectOrCreate?: FornecedorCreateOrConnectWithoutFornecedores_organizacaoInput
    connect?: FornecedorWhereUniqueInput
  }

  export type EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput = {
    set?: $Enums.TipoFornecedorOrganizacao
  }

  export type EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput = {
    set?: $Enums.StatusFornecedorOrganizacao
  }

  export type FornecedorUpdateOneRequiredWithoutFornecedores_organizacaoNestedInput = {
    create?: XOR<FornecedorCreateWithoutFornecedores_organizacaoInput, FornecedorUncheckedCreateWithoutFornecedores_organizacaoInput>
    connectOrCreate?: FornecedorCreateOrConnectWithoutFornecedores_organizacaoInput
    upsert?: FornecedorUpsertWithoutFornecedores_organizacaoInput
    connect?: FornecedorWhereUniqueInput
    update?: XOR<XOR<FornecedorUpdateToOneWithWhereWithoutFornecedores_organizacaoInput, FornecedorUpdateWithoutFornecedores_organizacaoInput>, FornecedorUncheckedUpdateWithoutFornecedores_organizacaoInput>
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumContainerTipoFieldUpdateOperationsInput = {
    set?: $Enums.ContainerTipo
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumNcmSyncStatusSincronizacaoFieldUpdateOperationsInput = {
    set?: $Enums.NcmSyncStatusSincronizacao
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumNcmSyncOrigemSincronizacaoFieldUpdateOperationsInput = {
    set?: $Enums.NcmSyncOrigemSincronizacao
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoFornecedorOrganizacao | EnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel> | $Enums.TipoFornecedorOrganizacao
  }

  export type NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusFornecedorOrganizacao | EnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel> | $Enums.StatusFornecedorOrganizacao
  }

  export type NestedEnumTipoFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoFornecedorOrganizacao | EnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoFornecedorOrganizacao[] | ListEnumTipoFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel> | $Enums.TipoFornecedorOrganizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel>
    _max?: NestedEnumTipoFornecedorOrganizacaoFilter<$PrismaModel>
  }

  export type NestedEnumStatusFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusFornecedorOrganizacao | EnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusFornecedorOrganizacao[] | ListEnumStatusFornecedorOrganizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFornecedorOrganizacaoWithAggregatesFilter<$PrismaModel> | $Enums.StatusFornecedorOrganizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel>
    _max?: NestedEnumStatusFornecedorOrganizacaoFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumContainerTipoFilter<$PrismaModel = never> = {
    equals?: $Enums.ContainerTipo | EnumContainerTipoFieldRefInput<$PrismaModel>
    in?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    notIn?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    not?: NestedEnumContainerTipoFilter<$PrismaModel> | $Enums.ContainerTipo
  }

  export type NestedEnumContainerTipoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ContainerTipo | EnumContainerTipoFieldRefInput<$PrismaModel>
    in?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    notIn?: $Enums.ContainerTipo[] | ListEnumContainerTipoFieldRefInput<$PrismaModel>
    not?: NestedEnumContainerTipoWithAggregatesFilter<$PrismaModel> | $Enums.ContainerTipo
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumContainerTipoFilter<$PrismaModel>
    _max?: NestedEnumContainerTipoFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncStatusSincronizacao | EnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel> | $Enums.NcmSyncStatusSincronizacao
  }

  export type NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncOrigemSincronizacao | EnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel> | $Enums.NcmSyncOrigemSincronizacao
  }

  export type NestedEnumNcmSyncStatusSincronizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncStatusSincronizacao | EnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncStatusSincronizacao[] | ListEnumNcmSyncStatusSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncStatusSincronizacaoWithAggregatesFilter<$PrismaModel> | $Enums.NcmSyncStatusSincronizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel>
    _max?: NestedEnumNcmSyncStatusSincronizacaoFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumNcmSyncOrigemSincronizacaoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NcmSyncOrigemSincronizacao | EnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    in?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    notIn?: $Enums.NcmSyncOrigemSincronizacao[] | ListEnumNcmSyncOrigemSincronizacaoFieldRefInput<$PrismaModel>
    not?: NestedEnumNcmSyncOrigemSincronizacaoWithAggregatesFilter<$PrismaModel> | $Enums.NcmSyncOrigemSincronizacao
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel>
    _max?: NestedEnumNcmSyncOrigemSincronizacaoFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type FornecedorOrganizacaoCreateWithoutFornecedorInput = {
    id_fornecedor_organizacao?: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
  }

  export type FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput = {
    id_fornecedor_organizacao?: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
  }

  export type FornecedorOrganizacaoCreateOrConnectWithoutFornecedorInput = {
    where: FornecedorOrganizacaoWhereUniqueInput
    create: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput>
  }

  export type FornecedorOrganizacaoCreateManyFornecedorInputEnvelope = {
    data: FornecedorOrganizacaoCreateManyFornecedorInput | FornecedorOrganizacaoCreateManyFornecedorInput[]
    skipDuplicates?: boolean
  }

  export type FornecedorOrganizacaoUpsertWithWhereUniqueWithoutFornecedorInput = {
    where: FornecedorOrganizacaoWhereUniqueInput
    update: XOR<FornecedorOrganizacaoUpdateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedUpdateWithoutFornecedorInput>
    create: XOR<FornecedorOrganizacaoCreateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedCreateWithoutFornecedorInput>
  }

  export type FornecedorOrganizacaoUpdateWithWhereUniqueWithoutFornecedorInput = {
    where: FornecedorOrganizacaoWhereUniqueInput
    data: XOR<FornecedorOrganizacaoUpdateWithoutFornecedorInput, FornecedorOrganizacaoUncheckedUpdateWithoutFornecedorInput>
  }

  export type FornecedorOrganizacaoUpdateManyWithWhereWithoutFornecedorInput = {
    where: FornecedorOrganizacaoScalarWhereInput
    data: XOR<FornecedorOrganizacaoUpdateManyMutationInput, FornecedorOrganizacaoUncheckedUpdateManyWithoutFornecedorInput>
  }

  export type FornecedorOrganizacaoScalarWhereInput = {
    AND?: FornecedorOrganizacaoScalarWhereInput | FornecedorOrganizacaoScalarWhereInput[]
    OR?: FornecedorOrganizacaoScalarWhereInput[]
    NOT?: FornecedorOrganizacaoScalarWhereInput | FornecedorOrganizacaoScalarWhereInput[]
    id_fornecedor_organizacao?: StringFilter<"FornecedorOrganizacao"> | string
    id_fornecedor?: StringFilter<"FornecedorOrganizacao"> | string
    id_organizacao?: StringFilter<"FornecedorOrganizacao"> | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFilter<"FornecedorOrganizacao"> | $Enums.StatusFornecedorOrganizacao
    id_usuario?: StringNullableFilter<"FornecedorOrganizacao"> | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFilter<"FornecedorOrganizacao"> | Date | string
  }

  export type FornecedorCreateWithoutFornecedores_organizacaoInput = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor?: string | null
    id_usuario_cadastro_fornecedor?: string | null
    nome_fornecedor: string
    cnpj_fornecedor?: string | null
    tin_fornecedor?: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor?: string | null
    cidade_fornecedor?: string | null
    endereco_fornecedor?: string | null
    cep_zipcode_fornecedor?: string | null
    email_principal_fornecedor?: string | null
    telefone_principal_fornecedor?: string | null
    whatsapp_principal_fornecedor?: string | null
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: Date | string
    atualizado_em_fornecedor?: Date | string
  }

  export type FornecedorUncheckedCreateWithoutFornecedores_organizacaoInput = {
    id_fornecedor: string
    id_organizacao_cadastro_fornecedor: string
    id_produto_fornecedor?: string | null
    id_usuario_cadastro_fornecedor?: string | null
    nome_fornecedor: string
    cnpj_fornecedor?: string | null
    tin_fornecedor?: string | null
    pais_fornecedor: string
    estado_provincia_fornecedor?: string | null
    cidade_fornecedor?: string | null
    endereco_fornecedor?: string | null
    cep_zipcode_fornecedor?: string | null
    email_principal_fornecedor?: string | null
    telefone_principal_fornecedor?: string | null
    whatsapp_principal_fornecedor?: string | null
    pode_ser_importador_fornecedor?: boolean
    pode_ser_exportador_fornecedor?: boolean
    pode_ser_fabricante_fornecedor?: boolean
    pode_ser_agente_fornecedor?: boolean
    pode_ser_despachante_fornecedor?: boolean
    pode_ser_armador_fornecedor?: boolean
    pode_ser_armazem_alfandegado_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: boolean
    pode_ser_cia_aerea_fornecedor?: boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: boolean
    pode_ser_seguradora_internacional_fornecedor?: boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: boolean
    pode_ser_banco_fornecedor?: boolean
    pode_ser_armazem_nacional_fornecedor?: boolean
    ativo_fornecedor?: boolean
    criado_em_fornecedor?: Date | string
    atualizado_em_fornecedor?: Date | string
  }

  export type FornecedorCreateOrConnectWithoutFornecedores_organizacaoInput = {
    where: FornecedorWhereUniqueInput
    create: XOR<FornecedorCreateWithoutFornecedores_organizacaoInput, FornecedorUncheckedCreateWithoutFornecedores_organizacaoInput>
  }

  export type FornecedorUpsertWithoutFornecedores_organizacaoInput = {
    update: XOR<FornecedorUpdateWithoutFornecedores_organizacaoInput, FornecedorUncheckedUpdateWithoutFornecedores_organizacaoInput>
    create: XOR<FornecedorCreateWithoutFornecedores_organizacaoInput, FornecedorUncheckedCreateWithoutFornecedores_organizacaoInput>
    where?: FornecedorWhereInput
  }

  export type FornecedorUpdateToOneWithWhereWithoutFornecedores_organizacaoInput = {
    where?: FornecedorWhereInput
    data: XOR<FornecedorUpdateWithoutFornecedores_organizacaoInput, FornecedorUncheckedUpdateWithoutFornecedores_organizacaoInput>
  }

  export type FornecedorUpdateWithoutFornecedores_organizacaoInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorUncheckedUpdateWithoutFornecedores_organizacaoInput = {
    id_fornecedor?: StringFieldUpdateOperationsInput | string
    id_organizacao_cadastro_fornecedor?: StringFieldUpdateOperationsInput | string
    id_produto_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_cadastro_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    nome_fornecedor?: StringFieldUpdateOperationsInput | string
    cnpj_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    tin_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pais_fornecedor?: StringFieldUpdateOperationsInput | string
    estado_provincia_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    cep_zipcode_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    email_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_principal_fornecedor?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    ativo_fornecedor?: BoolFieldUpdateOperationsInput | boolean
    criado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_fornecedor?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoCreateManyFornecedorInput = {
    id_fornecedor_organizacao?: string
    id_organizacao: string
    tipo_fornecedor_organizacao: $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: $Enums.StatusFornecedorOrganizacao
    id_usuario?: string | null
    data_criacao_fornecedor_organizacao?: Date | string
    data_atualizacao_fornecedor_organizacao?: Date | string
  }

  export type FornecedorOrganizacaoUpdateWithoutFornecedorInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoUncheckedUpdateWithoutFornecedorInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FornecedorOrganizacaoUncheckedUpdateManyWithoutFornecedorInput = {
    id_fornecedor_organizacao?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    tipo_fornecedor_organizacao?: EnumTipoFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.TipoFornecedorOrganizacao
    status_fornecedor_organizacao?: EnumStatusFornecedorOrganizacaoFieldUpdateOperationsInput | $Enums.StatusFornecedorOrganizacao
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_fornecedor_organizacao?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use FornecedorCountOutputTypeDefaultArgs instead
     */
    export type FornecedorCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FornecedorCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FornecedorDefaultArgs instead
     */
    export type FornecedorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FornecedorDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FornecedorOrganizacaoDefaultArgs instead
     */
    export type FornecedorOrganizacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FornecedorOrganizacaoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PaisDefaultArgs instead
     */
    export type PaisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PaisDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MoedaDefaultArgs instead
     */
    export type MoedaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MoedaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UnidadeDefaultArgs instead
     */
    export type UnidadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UnidadeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IncotermDefaultArgs instead
     */
    export type IncotermArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IncotermDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PortoDefaultArgs instead
     */
    export type PortoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PortoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AeroportoDefaultArgs instead
     */
    export type AeroportoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AeroportoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ContainerDefaultArgs instead
     */
    export type ContainerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ContainerDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NcmSyncDefaultArgs instead
     */
    export type NcmSyncArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NcmSyncDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NcmSyncLogDefaultArgs instead
     */
    export type NcmSyncLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NcmSyncLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NcmSyncAgendamentoDefaultArgs instead
     */
    export type NcmSyncAgendamentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NcmSyncAgendamentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OpeDefaultArgs instead
     */
    export type OpeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OpeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OPEHistoricoStatusDefaultArgs instead
     */
    export type OPEHistoricoStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OPEHistoricoStatusDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}