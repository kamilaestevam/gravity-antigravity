
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
 * Model Empresa
 * 
 */
export type Empresa = $Result.DefaultSelection<Prisma.$EmpresaPayload>
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
 * Model ExportadorQuandoImportacao
 * 
 */
export type ExportadorQuandoImportacao = $Result.DefaultSelection<Prisma.$ExportadorQuandoImportacaoPayload>
/**
 * Model ImportadorQuandoExportacao
 * 
 */
export type ImportadorQuandoExportacao = $Result.DefaultSelection<Prisma.$ImportadorQuandoExportacaoPayload>

/**
 * Enums
 */
export namespace $Enums {
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
 * // Fetch zero or more Empresas
 * const empresas = await prisma.empresa.findMany()
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
   * // Fetch zero or more Empresas
   * const empresas = await prisma.empresa.findMany()
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
   * `prisma.empresa`: Exposes CRUD operations for the **Empresa** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Empresas
    * const empresas = await prisma.empresa.findMany()
    * ```
    */
  get empresa(): Prisma.EmpresaDelegate<ExtArgs>;

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

  /**
   * `prisma.exportadorQuandoImportacao`: Exposes CRUD operations for the **ExportadorQuandoImportacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExportadorQuandoImportacaos
    * const exportadorQuandoImportacaos = await prisma.exportadorQuandoImportacao.findMany()
    * ```
    */
  get exportadorQuandoImportacao(): Prisma.ExportadorQuandoImportacaoDelegate<ExtArgs>;

  /**
   * `prisma.importadorQuandoExportacao`: Exposes CRUD operations for the **ImportadorQuandoExportacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ImportadorQuandoExportacaos
    * const importadorQuandoExportacaos = await prisma.importadorQuandoExportacao.findMany()
    * ```
    */
  get importadorQuandoExportacao(): Prisma.ImportadorQuandoExportacaoDelegate<ExtArgs>;
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
    Empresa: 'Empresa',
    Pais: 'Pais',
    Moeda: 'Moeda',
    Unidade: 'Unidade',
    Incoterm: 'Incoterm',
    NcmSync: 'NcmSync',
    NcmSyncLog: 'NcmSyncLog',
    NcmSyncAgendamento: 'NcmSyncAgendamento',
    Ope: 'Ope',
    OPEHistoricoStatus: 'OPEHistoricoStatus',
    ExportadorQuandoImportacao: 'ExportadorQuandoImportacao',
    ImportadorQuandoExportacao: 'ImportadorQuandoExportacao'
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
      modelProps: "empresa" | "pais" | "moeda" | "unidade" | "incoterm" | "ncmSync" | "ncmSyncLog" | "ncmSyncAgendamento" | "ope" | "oPEHistoricoStatus" | "exportadorQuandoImportacao" | "importadorQuandoExportacao"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Empresa: {
        payload: Prisma.$EmpresaPayload<ExtArgs>
        fields: Prisma.EmpresaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmpresaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmpresaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          findFirst: {
            args: Prisma.EmpresaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmpresaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          findMany: {
            args: Prisma.EmpresaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>[]
          }
          create: {
            args: Prisma.EmpresaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          createMany: {
            args: Prisma.EmpresaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmpresaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>[]
          }
          delete: {
            args: Prisma.EmpresaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          update: {
            args: Prisma.EmpresaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          deleteMany: {
            args: Prisma.EmpresaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmpresaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmpresaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmpresaPayload>
          }
          aggregate: {
            args: Prisma.EmpresaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmpresa>
          }
          groupBy: {
            args: Prisma.EmpresaGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmpresaGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmpresaCountArgs<ExtArgs>
            result: $Utils.Optional<EmpresaCountAggregateOutputType> | number
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
      ExportadorQuandoImportacao: {
        payload: Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>
        fields: Prisma.ExportadorQuandoImportacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExportadorQuandoImportacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExportadorQuandoImportacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          findFirst: {
            args: Prisma.ExportadorQuandoImportacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExportadorQuandoImportacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          findMany: {
            args: Prisma.ExportadorQuandoImportacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>[]
          }
          create: {
            args: Prisma.ExportadorQuandoImportacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          createMany: {
            args: Prisma.ExportadorQuandoImportacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExportadorQuandoImportacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>[]
          }
          delete: {
            args: Prisma.ExportadorQuandoImportacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          update: {
            args: Prisma.ExportadorQuandoImportacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          deleteMany: {
            args: Prisma.ExportadorQuandoImportacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExportadorQuandoImportacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExportadorQuandoImportacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExportadorQuandoImportacaoPayload>
          }
          aggregate: {
            args: Prisma.ExportadorQuandoImportacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExportadorQuandoImportacao>
          }
          groupBy: {
            args: Prisma.ExportadorQuandoImportacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExportadorQuandoImportacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExportadorQuandoImportacaoCountArgs<ExtArgs>
            result: $Utils.Optional<ExportadorQuandoImportacaoCountAggregateOutputType> | number
          }
        }
      }
      ImportadorQuandoExportacao: {
        payload: Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>
        fields: Prisma.ImportadorQuandoExportacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ImportadorQuandoExportacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ImportadorQuandoExportacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          findFirst: {
            args: Prisma.ImportadorQuandoExportacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ImportadorQuandoExportacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          findMany: {
            args: Prisma.ImportadorQuandoExportacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>[]
          }
          create: {
            args: Prisma.ImportadorQuandoExportacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          createMany: {
            args: Prisma.ImportadorQuandoExportacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ImportadorQuandoExportacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>[]
          }
          delete: {
            args: Prisma.ImportadorQuandoExportacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          update: {
            args: Prisma.ImportadorQuandoExportacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          deleteMany: {
            args: Prisma.ImportadorQuandoExportacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ImportadorQuandoExportacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ImportadorQuandoExportacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ImportadorQuandoExportacaoPayload>
          }
          aggregate: {
            args: Prisma.ImportadorQuandoExportacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateImportadorQuandoExportacao>
          }
          groupBy: {
            args: Prisma.ImportadorQuandoExportacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ImportadorQuandoExportacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ImportadorQuandoExportacaoCountArgs<ExtArgs>
            result: $Utils.Optional<ImportadorQuandoExportacaoCountAggregateOutputType> | number
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
   * Models
   */

  /**
   * Model Empresa
   */

  export type AggregateEmpresa = {
    _count: EmpresaCountAggregateOutputType | null
    _min: EmpresaMinAggregateOutputType | null
    _max: EmpresaMaxAggregateOutputType | null
  }

  export type EmpresaMinAggregateOutputType = {
    suid_empresa: string | null
    id_organizacao_empresa: string | null
    id_produto_empresa: string | null
    id_usuario_empresa: string | null
    nome_empresa: string | null
    cnpj_empresa: string | null
    tin_empresa: string | null
    pais_empresa: string | null
    estado_empresa: string | null
    cidade_empresa: string | null
    endereco_empresa: string | null
    zipcode_empresa: string | null
    email_empresa: string | null
    telefone_empresa: string | null
    whatsapp_empresa: string | null
    pode_ser_importador_empresa: boolean | null
    pode_ser_exportador_empresa: boolean | null
    pode_ser_fabricante_empresa: boolean | null
    pode_ser_agente_empresa: boolean | null
    pode_ser_despachante_empresa: boolean | null
    pode_ser_armador_empresa: boolean | null
    pode_ser_armazem_alfandegado_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean | null
    pode_ser_cia_aerea_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean | null
    pode_ser_seguradora_internacional_empresa: boolean | null
    pode_ser_seguradora_corretora_cambio_empresa: boolean | null
    pode_ser_banco_empresa: boolean | null
    pode_ser_armazem_nacional_empresa: boolean | null
    ativo_empresa: boolean | null
    criado_em_empresa: Date | null
    atualizado_em_empresa: Date | null
  }

  export type EmpresaMaxAggregateOutputType = {
    suid_empresa: string | null
    id_organizacao_empresa: string | null
    id_produto_empresa: string | null
    id_usuario_empresa: string | null
    nome_empresa: string | null
    cnpj_empresa: string | null
    tin_empresa: string | null
    pais_empresa: string | null
    estado_empresa: string | null
    cidade_empresa: string | null
    endereco_empresa: string | null
    zipcode_empresa: string | null
    email_empresa: string | null
    telefone_empresa: string | null
    whatsapp_empresa: string | null
    pode_ser_importador_empresa: boolean | null
    pode_ser_exportador_empresa: boolean | null
    pode_ser_fabricante_empresa: boolean | null
    pode_ser_agente_empresa: boolean | null
    pode_ser_despachante_empresa: boolean | null
    pode_ser_armador_empresa: boolean | null
    pode_ser_armazem_alfandegado_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean | null
    pode_ser_cia_aerea_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean | null
    pode_ser_seguradora_internacional_empresa: boolean | null
    pode_ser_seguradora_corretora_cambio_empresa: boolean | null
    pode_ser_banco_empresa: boolean | null
    pode_ser_armazem_nacional_empresa: boolean | null
    ativo_empresa: boolean | null
    criado_em_empresa: Date | null
    atualizado_em_empresa: Date | null
  }

  export type EmpresaCountAggregateOutputType = {
    suid_empresa: number
    id_organizacao_empresa: number
    id_produto_empresa: number
    id_usuario_empresa: number
    nome_empresa: number
    cnpj_empresa: number
    tin_empresa: number
    pais_empresa: number
    estado_empresa: number
    cidade_empresa: number
    endereco_empresa: number
    zipcode_empresa: number
    email_empresa: number
    telefone_empresa: number
    whatsapp_empresa: number
    pode_ser_importador_empresa: number
    pode_ser_exportador_empresa: number
    pode_ser_fabricante_empresa: number
    pode_ser_agente_empresa: number
    pode_ser_despachante_empresa: number
    pode_ser_armador_empresa: number
    pode_ser_armazem_alfandegado_empresa: number
    pode_ser_transportadora_rodoviaria_nacional_empresa: number
    pode_ser_cia_aerea_empresa: number
    pode_ser_transportadora_rodoviaria_internacional_empresa: number
    pode_ser_seguradora_internacional_empresa: number
    pode_ser_seguradora_corretora_cambio_empresa: number
    pode_ser_banco_empresa: number
    pode_ser_armazem_nacional_empresa: number
    ativo_empresa: number
    criado_em_empresa: number
    atualizado_em_empresa: number
    _all: number
  }


  export type EmpresaMinAggregateInputType = {
    suid_empresa?: true
    id_organizacao_empresa?: true
    id_produto_empresa?: true
    id_usuario_empresa?: true
    nome_empresa?: true
    cnpj_empresa?: true
    tin_empresa?: true
    pais_empresa?: true
    estado_empresa?: true
    cidade_empresa?: true
    endereco_empresa?: true
    zipcode_empresa?: true
    email_empresa?: true
    telefone_empresa?: true
    whatsapp_empresa?: true
    pode_ser_importador_empresa?: true
    pode_ser_exportador_empresa?: true
    pode_ser_fabricante_empresa?: true
    pode_ser_agente_empresa?: true
    pode_ser_despachante_empresa?: true
    pode_ser_armador_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
  }

  export type EmpresaMaxAggregateInputType = {
    suid_empresa?: true
    id_organizacao_empresa?: true
    id_produto_empresa?: true
    id_usuario_empresa?: true
    nome_empresa?: true
    cnpj_empresa?: true
    tin_empresa?: true
    pais_empresa?: true
    estado_empresa?: true
    cidade_empresa?: true
    endereco_empresa?: true
    zipcode_empresa?: true
    email_empresa?: true
    telefone_empresa?: true
    whatsapp_empresa?: true
    pode_ser_importador_empresa?: true
    pode_ser_exportador_empresa?: true
    pode_ser_fabricante_empresa?: true
    pode_ser_agente_empresa?: true
    pode_ser_despachante_empresa?: true
    pode_ser_armador_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
  }

  export type EmpresaCountAggregateInputType = {
    suid_empresa?: true
    id_organizacao_empresa?: true
    id_produto_empresa?: true
    id_usuario_empresa?: true
    nome_empresa?: true
    cnpj_empresa?: true
    tin_empresa?: true
    pais_empresa?: true
    estado_empresa?: true
    cidade_empresa?: true
    endereco_empresa?: true
    zipcode_empresa?: true
    email_empresa?: true
    telefone_empresa?: true
    whatsapp_empresa?: true
    pode_ser_importador_empresa?: true
    pode_ser_exportador_empresa?: true
    pode_ser_fabricante_empresa?: true
    pode_ser_agente_empresa?: true
    pode_ser_despachante_empresa?: true
    pode_ser_armador_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
    _all?: true
  }

  export type EmpresaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empresa to aggregate.
     */
    where?: EmpresaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empresas to fetch.
     */
    orderBy?: EmpresaOrderByWithRelationInput | EmpresaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmpresaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empresas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empresas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Empresas
    **/
    _count?: true | EmpresaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmpresaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmpresaMaxAggregateInputType
  }

  export type GetEmpresaAggregateType<T extends EmpresaAggregateArgs> = {
        [P in keyof T & keyof AggregateEmpresa]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmpresa[P]>
      : GetScalarType<T[P], AggregateEmpresa[P]>
  }




  export type EmpresaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmpresaWhereInput
    orderBy?: EmpresaOrderByWithAggregationInput | EmpresaOrderByWithAggregationInput[]
    by: EmpresaScalarFieldEnum[] | EmpresaScalarFieldEnum
    having?: EmpresaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmpresaCountAggregateInputType | true
    _min?: EmpresaMinAggregateInputType
    _max?: EmpresaMaxAggregateInputType
  }

  export type EmpresaGroupByOutputType = {
    suid_empresa: string
    id_organizacao_empresa: string
    id_produto_empresa: string | null
    id_usuario_empresa: string | null
    nome_empresa: string
    cnpj_empresa: string | null
    tin_empresa: string | null
    pais_empresa: string
    estado_empresa: string | null
    cidade_empresa: string | null
    endereco_empresa: string | null
    zipcode_empresa: string | null
    email_empresa: string | null
    telefone_empresa: string | null
    whatsapp_empresa: string | null
    pode_ser_importador_empresa: boolean
    pode_ser_exportador_empresa: boolean
    pode_ser_fabricante_empresa: boolean
    pode_ser_agente_empresa: boolean
    pode_ser_despachante_empresa: boolean
    pode_ser_armador_empresa: boolean
    pode_ser_armazem_alfandegado_empresa: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
    pode_ser_cia_aerea_empresa: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
    pode_ser_seguradora_internacional_empresa: boolean
    pode_ser_seguradora_corretora_cambio_empresa: boolean
    pode_ser_banco_empresa: boolean
    pode_ser_armazem_nacional_empresa: boolean
    ativo_empresa: boolean
    criado_em_empresa: Date
    atualizado_em_empresa: Date
    _count: EmpresaCountAggregateOutputType | null
    _min: EmpresaMinAggregateOutputType | null
    _max: EmpresaMaxAggregateOutputType | null
  }

  type GetEmpresaGroupByPayload<T extends EmpresaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmpresaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmpresaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmpresaGroupByOutputType[P]>
            : GetScalarType<T[P], EmpresaGroupByOutputType[P]>
        }
      >
    >


  export type EmpresaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_empresa?: boolean
    id_organizacao_empresa?: boolean
    id_produto_empresa?: boolean
    id_usuario_empresa?: boolean
    nome_empresa?: boolean
    cnpj_empresa?: boolean
    tin_empresa?: boolean
    pais_empresa?: boolean
    estado_empresa?: boolean
    cidade_empresa?: boolean
    endereco_empresa?: boolean
    zipcode_empresa?: boolean
    email_empresa?: boolean
    telefone_empresa?: boolean
    whatsapp_empresa?: boolean
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
  }, ExtArgs["result"]["empresa"]>

  export type EmpresaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_empresa?: boolean
    id_organizacao_empresa?: boolean
    id_produto_empresa?: boolean
    id_usuario_empresa?: boolean
    nome_empresa?: boolean
    cnpj_empresa?: boolean
    tin_empresa?: boolean
    pais_empresa?: boolean
    estado_empresa?: boolean
    cidade_empresa?: boolean
    endereco_empresa?: boolean
    zipcode_empresa?: boolean
    email_empresa?: boolean
    telefone_empresa?: boolean
    whatsapp_empresa?: boolean
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
  }, ExtArgs["result"]["empresa"]>

  export type EmpresaSelectScalar = {
    suid_empresa?: boolean
    id_organizacao_empresa?: boolean
    id_produto_empresa?: boolean
    id_usuario_empresa?: boolean
    nome_empresa?: boolean
    cnpj_empresa?: boolean
    tin_empresa?: boolean
    pais_empresa?: boolean
    estado_empresa?: boolean
    cidade_empresa?: boolean
    endereco_empresa?: boolean
    zipcode_empresa?: boolean
    email_empresa?: boolean
    telefone_empresa?: boolean
    whatsapp_empresa?: boolean
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
  }


  export type $EmpresaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Empresa"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      suid_empresa: string
      id_organizacao_empresa: string
      id_produto_empresa: string | null
      id_usuario_empresa: string | null
      nome_empresa: string
      cnpj_empresa: string | null
      tin_empresa: string | null
      pais_empresa: string
      estado_empresa: string | null
      cidade_empresa: string | null
      endereco_empresa: string | null
      zipcode_empresa: string | null
      email_empresa: string | null
      telefone_empresa: string | null
      whatsapp_empresa: string | null
      pode_ser_importador_empresa: boolean
      pode_ser_exportador_empresa: boolean
      pode_ser_fabricante_empresa: boolean
      pode_ser_agente_empresa: boolean
      pode_ser_despachante_empresa: boolean
      pode_ser_armador_empresa: boolean
      pode_ser_armazem_alfandegado_empresa: boolean
      pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
      pode_ser_cia_aerea_empresa: boolean
      pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
      pode_ser_seguradora_internacional_empresa: boolean
      pode_ser_seguradora_corretora_cambio_empresa: boolean
      pode_ser_banco_empresa: boolean
      pode_ser_armazem_nacional_empresa: boolean
      ativo_empresa: boolean
      criado_em_empresa: Date
      atualizado_em_empresa: Date
    }, ExtArgs["result"]["empresa"]>
    composites: {}
  }

  type EmpresaGetPayload<S extends boolean | null | undefined | EmpresaDefaultArgs> = $Result.GetResult<Prisma.$EmpresaPayload, S>

  type EmpresaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmpresaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmpresaCountAggregateInputType | true
    }

  export interface EmpresaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Empresa'], meta: { name: 'Empresa' } }
    /**
     * Find zero or one Empresa that matches the filter.
     * @param {EmpresaFindUniqueArgs} args - Arguments to find a Empresa
     * @example
     * // Get one Empresa
     * const empresa = await prisma.empresa.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmpresaFindUniqueArgs>(args: SelectSubset<T, EmpresaFindUniqueArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Empresa that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmpresaFindUniqueOrThrowArgs} args - Arguments to find a Empresa
     * @example
     * // Get one Empresa
     * const empresa = await prisma.empresa.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmpresaFindUniqueOrThrowArgs>(args: SelectSubset<T, EmpresaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Empresa that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaFindFirstArgs} args - Arguments to find a Empresa
     * @example
     * // Get one Empresa
     * const empresa = await prisma.empresa.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmpresaFindFirstArgs>(args?: SelectSubset<T, EmpresaFindFirstArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Empresa that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaFindFirstOrThrowArgs} args - Arguments to find a Empresa
     * @example
     * // Get one Empresa
     * const empresa = await prisma.empresa.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmpresaFindFirstOrThrowArgs>(args?: SelectSubset<T, EmpresaFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Empresas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Empresas
     * const empresas = await prisma.empresa.findMany()
     * 
     * // Get first 10 Empresas
     * const empresas = await prisma.empresa.findMany({ take: 10 })
     * 
     * // Only select the `suid_empresa`
     * const empresaWithSuid_empresaOnly = await prisma.empresa.findMany({ select: { suid_empresa: true } })
     * 
     */
    findMany<T extends EmpresaFindManyArgs>(args?: SelectSubset<T, EmpresaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Empresa.
     * @param {EmpresaCreateArgs} args - Arguments to create a Empresa.
     * @example
     * // Create one Empresa
     * const Empresa = await prisma.empresa.create({
     *   data: {
     *     // ... data to create a Empresa
     *   }
     * })
     * 
     */
    create<T extends EmpresaCreateArgs>(args: SelectSubset<T, EmpresaCreateArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Empresas.
     * @param {EmpresaCreateManyArgs} args - Arguments to create many Empresas.
     * @example
     * // Create many Empresas
     * const empresa = await prisma.empresa.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmpresaCreateManyArgs>(args?: SelectSubset<T, EmpresaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Empresas and returns the data saved in the database.
     * @param {EmpresaCreateManyAndReturnArgs} args - Arguments to create many Empresas.
     * @example
     * // Create many Empresas
     * const empresa = await prisma.empresa.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Empresas and only return the `suid_empresa`
     * const empresaWithSuid_empresaOnly = await prisma.empresa.createManyAndReturn({ 
     *   select: { suid_empresa: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmpresaCreateManyAndReturnArgs>(args?: SelectSubset<T, EmpresaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Empresa.
     * @param {EmpresaDeleteArgs} args - Arguments to delete one Empresa.
     * @example
     * // Delete one Empresa
     * const Empresa = await prisma.empresa.delete({
     *   where: {
     *     // ... filter to delete one Empresa
     *   }
     * })
     * 
     */
    delete<T extends EmpresaDeleteArgs>(args: SelectSubset<T, EmpresaDeleteArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Empresa.
     * @param {EmpresaUpdateArgs} args - Arguments to update one Empresa.
     * @example
     * // Update one Empresa
     * const empresa = await prisma.empresa.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmpresaUpdateArgs>(args: SelectSubset<T, EmpresaUpdateArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Empresas.
     * @param {EmpresaDeleteManyArgs} args - Arguments to filter Empresas to delete.
     * @example
     * // Delete a few Empresas
     * const { count } = await prisma.empresa.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmpresaDeleteManyArgs>(args?: SelectSubset<T, EmpresaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Empresas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Empresas
     * const empresa = await prisma.empresa.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmpresaUpdateManyArgs>(args: SelectSubset<T, EmpresaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Empresa.
     * @param {EmpresaUpsertArgs} args - Arguments to update or create a Empresa.
     * @example
     * // Update or create a Empresa
     * const empresa = await prisma.empresa.upsert({
     *   create: {
     *     // ... data to create a Empresa
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Empresa we want to update
     *   }
     * })
     */
    upsert<T extends EmpresaUpsertArgs>(args: SelectSubset<T, EmpresaUpsertArgs<ExtArgs>>): Prisma__EmpresaClient<$Result.GetResult<Prisma.$EmpresaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Empresas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaCountArgs} args - Arguments to filter Empresas to count.
     * @example
     * // Count the number of Empresas
     * const count = await prisma.empresa.count({
     *   where: {
     *     // ... the filter for the Empresas we want to count
     *   }
     * })
    **/
    count<T extends EmpresaCountArgs>(
      args?: Subset<T, EmpresaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmpresaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Empresa.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmpresaAggregateArgs>(args: Subset<T, EmpresaAggregateArgs>): Prisma.PrismaPromise<GetEmpresaAggregateType<T>>

    /**
     * Group by Empresa.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmpresaGroupByArgs} args - Group by arguments.
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
      T extends EmpresaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmpresaGroupByArgs['orderBy'] }
        : { orderBy?: EmpresaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EmpresaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmpresaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Empresa model
   */
  readonly fields: EmpresaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Empresa.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmpresaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Empresa model
   */ 
  interface EmpresaFieldRefs {
    readonly suid_empresa: FieldRef<"Empresa", 'String'>
    readonly id_organizacao_empresa: FieldRef<"Empresa", 'String'>
    readonly id_produto_empresa: FieldRef<"Empresa", 'String'>
    readonly id_usuario_empresa: FieldRef<"Empresa", 'String'>
    readonly nome_empresa: FieldRef<"Empresa", 'String'>
    readonly cnpj_empresa: FieldRef<"Empresa", 'String'>
    readonly tin_empresa: FieldRef<"Empresa", 'String'>
    readonly pais_empresa: FieldRef<"Empresa", 'String'>
    readonly estado_empresa: FieldRef<"Empresa", 'String'>
    readonly cidade_empresa: FieldRef<"Empresa", 'String'>
    readonly endereco_empresa: FieldRef<"Empresa", 'String'>
    readonly zipcode_empresa: FieldRef<"Empresa", 'String'>
    readonly email_empresa: FieldRef<"Empresa", 'String'>
    readonly telefone_empresa: FieldRef<"Empresa", 'String'>
    readonly whatsapp_empresa: FieldRef<"Empresa", 'String'>
    readonly pode_ser_importador_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_exportador_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_fabricante_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_agente_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_despachante_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_armador_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_armazem_alfandegado_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_nacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_cia_aerea_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_internacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_seguradora_internacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_seguradora_corretora_cambio_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_banco_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_armazem_nacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly ativo_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly criado_em_empresa: FieldRef<"Empresa", 'DateTime'>
    readonly atualizado_em_empresa: FieldRef<"Empresa", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Empresa findUnique
   */
  export type EmpresaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter, which Empresa to fetch.
     */
    where: EmpresaWhereUniqueInput
  }

  /**
   * Empresa findUniqueOrThrow
   */
  export type EmpresaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter, which Empresa to fetch.
     */
    where: EmpresaWhereUniqueInput
  }

  /**
   * Empresa findFirst
   */
  export type EmpresaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter, which Empresa to fetch.
     */
    where?: EmpresaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empresas to fetch.
     */
    orderBy?: EmpresaOrderByWithRelationInput | EmpresaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empresas.
     */
    cursor?: EmpresaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empresas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empresas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empresas.
     */
    distinct?: EmpresaScalarFieldEnum | EmpresaScalarFieldEnum[]
  }

  /**
   * Empresa findFirstOrThrow
   */
  export type EmpresaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter, which Empresa to fetch.
     */
    where?: EmpresaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empresas to fetch.
     */
    orderBy?: EmpresaOrderByWithRelationInput | EmpresaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Empresas.
     */
    cursor?: EmpresaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empresas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empresas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Empresas.
     */
    distinct?: EmpresaScalarFieldEnum | EmpresaScalarFieldEnum[]
  }

  /**
   * Empresa findMany
   */
  export type EmpresaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter, which Empresas to fetch.
     */
    where?: EmpresaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Empresas to fetch.
     */
    orderBy?: EmpresaOrderByWithRelationInput | EmpresaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Empresas.
     */
    cursor?: EmpresaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Empresas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Empresas.
     */
    skip?: number
    distinct?: EmpresaScalarFieldEnum | EmpresaScalarFieldEnum[]
  }

  /**
   * Empresa create
   */
  export type EmpresaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * The data needed to create a Empresa.
     */
    data: XOR<EmpresaCreateInput, EmpresaUncheckedCreateInput>
  }

  /**
   * Empresa createMany
   */
  export type EmpresaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Empresas.
     */
    data: EmpresaCreateManyInput | EmpresaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Empresa createManyAndReturn
   */
  export type EmpresaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Empresas.
     */
    data: EmpresaCreateManyInput | EmpresaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Empresa update
   */
  export type EmpresaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * The data needed to update a Empresa.
     */
    data: XOR<EmpresaUpdateInput, EmpresaUncheckedUpdateInput>
    /**
     * Choose, which Empresa to update.
     */
    where: EmpresaWhereUniqueInput
  }

  /**
   * Empresa updateMany
   */
  export type EmpresaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Empresas.
     */
    data: XOR<EmpresaUpdateManyMutationInput, EmpresaUncheckedUpdateManyInput>
    /**
     * Filter which Empresas to update
     */
    where?: EmpresaWhereInput
  }

  /**
   * Empresa upsert
   */
  export type EmpresaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * The filter to search for the Empresa to update in case it exists.
     */
    where: EmpresaWhereUniqueInput
    /**
     * In case the Empresa found by the `where` argument doesn't exist, create a new Empresa with this data.
     */
    create: XOR<EmpresaCreateInput, EmpresaUncheckedCreateInput>
    /**
     * In case the Empresa was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmpresaUpdateInput, EmpresaUncheckedUpdateInput>
  }

  /**
   * Empresa delete
   */
  export type EmpresaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
    /**
     * Filter which Empresa to delete.
     */
    where: EmpresaWhereUniqueInput
  }

  /**
   * Empresa deleteMany
   */
  export type EmpresaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Empresas to delete
     */
    where?: EmpresaWhereInput
  }

  /**
   * Empresa without action
   */
  export type EmpresaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Empresa
     */
    select?: EmpresaSelect<ExtArgs> | null
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
   * Model ExportadorQuandoImportacao
   */

  export type AggregateExportadorQuandoImportacao = {
    _count: ExportadorQuandoImportacaoCountAggregateOutputType | null
    _min: ExportadorQuandoImportacaoMinAggregateOutputType | null
    _max: ExportadorQuandoImportacaoMaxAggregateOutputType | null
  }

  export type ExportadorQuandoImportacaoMinAggregateOutputType = {
    id_exportador: string | null
    id_organizacao_exportador: string | null
    id_workspace_exportador: string | null
    nome_exportador: string | null
    endereco_exportador: string | null
    cidade_exportador: string | null
    estado_provincia_exportador: string | null
    pais_exportador: string | null
    zipcode_exportador: string | null
    criado_em_exportador: Date | null
    atualizado_em_exportador: Date | null
  }

  export type ExportadorQuandoImportacaoMaxAggregateOutputType = {
    id_exportador: string | null
    id_organizacao_exportador: string | null
    id_workspace_exportador: string | null
    nome_exportador: string | null
    endereco_exportador: string | null
    cidade_exportador: string | null
    estado_provincia_exportador: string | null
    pais_exportador: string | null
    zipcode_exportador: string | null
    criado_em_exportador: Date | null
    atualizado_em_exportador: Date | null
  }

  export type ExportadorQuandoImportacaoCountAggregateOutputType = {
    id_exportador: number
    id_organizacao_exportador: number
    id_workspace_exportador: number
    nome_exportador: number
    endereco_exportador: number
    cidade_exportador: number
    estado_provincia_exportador: number
    pais_exportador: number
    zipcode_exportador: number
    criado_em_exportador: number
    atualizado_em_exportador: number
    _all: number
  }


  export type ExportadorQuandoImportacaoMinAggregateInputType = {
    id_exportador?: true
    id_organizacao_exportador?: true
    id_workspace_exportador?: true
    nome_exportador?: true
    endereco_exportador?: true
    cidade_exportador?: true
    estado_provincia_exportador?: true
    pais_exportador?: true
    zipcode_exportador?: true
    criado_em_exportador?: true
    atualizado_em_exportador?: true
  }

  export type ExportadorQuandoImportacaoMaxAggregateInputType = {
    id_exportador?: true
    id_organizacao_exportador?: true
    id_workspace_exportador?: true
    nome_exportador?: true
    endereco_exportador?: true
    cidade_exportador?: true
    estado_provincia_exportador?: true
    pais_exportador?: true
    zipcode_exportador?: true
    criado_em_exportador?: true
    atualizado_em_exportador?: true
  }

  export type ExportadorQuandoImportacaoCountAggregateInputType = {
    id_exportador?: true
    id_organizacao_exportador?: true
    id_workspace_exportador?: true
    nome_exportador?: true
    endereco_exportador?: true
    cidade_exportador?: true
    estado_provincia_exportador?: true
    pais_exportador?: true
    zipcode_exportador?: true
    criado_em_exportador?: true
    atualizado_em_exportador?: true
    _all?: true
  }

  export type ExportadorQuandoImportacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExportadorQuandoImportacao to aggregate.
     */
    where?: ExportadorQuandoImportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExportadorQuandoImportacaos to fetch.
     */
    orderBy?: ExportadorQuandoImportacaoOrderByWithRelationInput | ExportadorQuandoImportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExportadorQuandoImportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExportadorQuandoImportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExportadorQuandoImportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExportadorQuandoImportacaos
    **/
    _count?: true | ExportadorQuandoImportacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExportadorQuandoImportacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExportadorQuandoImportacaoMaxAggregateInputType
  }

  export type GetExportadorQuandoImportacaoAggregateType<T extends ExportadorQuandoImportacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateExportadorQuandoImportacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExportadorQuandoImportacao[P]>
      : GetScalarType<T[P], AggregateExportadorQuandoImportacao[P]>
  }




  export type ExportadorQuandoImportacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExportadorQuandoImportacaoWhereInput
    orderBy?: ExportadorQuandoImportacaoOrderByWithAggregationInput | ExportadorQuandoImportacaoOrderByWithAggregationInput[]
    by: ExportadorQuandoImportacaoScalarFieldEnum[] | ExportadorQuandoImportacaoScalarFieldEnum
    having?: ExportadorQuandoImportacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExportadorQuandoImportacaoCountAggregateInputType | true
    _min?: ExportadorQuandoImportacaoMinAggregateInputType
    _max?: ExportadorQuandoImportacaoMaxAggregateInputType
  }

  export type ExportadorQuandoImportacaoGroupByOutputType = {
    id_exportador: string
    id_organizacao_exportador: string
    id_workspace_exportador: string
    nome_exportador: string
    endereco_exportador: string | null
    cidade_exportador: string | null
    estado_provincia_exportador: string | null
    pais_exportador: string
    zipcode_exportador: string | null
    criado_em_exportador: Date
    atualizado_em_exportador: Date
    _count: ExportadorQuandoImportacaoCountAggregateOutputType | null
    _min: ExportadorQuandoImportacaoMinAggregateOutputType | null
    _max: ExportadorQuandoImportacaoMaxAggregateOutputType | null
  }

  type GetExportadorQuandoImportacaoGroupByPayload<T extends ExportadorQuandoImportacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExportadorQuandoImportacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExportadorQuandoImportacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExportadorQuandoImportacaoGroupByOutputType[P]>
            : GetScalarType<T[P], ExportadorQuandoImportacaoGroupByOutputType[P]>
        }
      >
    >


  export type ExportadorQuandoImportacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_exportador?: boolean
    id_organizacao_exportador?: boolean
    id_workspace_exportador?: boolean
    nome_exportador?: boolean
    endereco_exportador?: boolean
    cidade_exportador?: boolean
    estado_provincia_exportador?: boolean
    pais_exportador?: boolean
    zipcode_exportador?: boolean
    criado_em_exportador?: boolean
    atualizado_em_exportador?: boolean
  }, ExtArgs["result"]["exportadorQuandoImportacao"]>

  export type ExportadorQuandoImportacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_exportador?: boolean
    id_organizacao_exportador?: boolean
    id_workspace_exportador?: boolean
    nome_exportador?: boolean
    endereco_exportador?: boolean
    cidade_exportador?: boolean
    estado_provincia_exportador?: boolean
    pais_exportador?: boolean
    zipcode_exportador?: boolean
    criado_em_exportador?: boolean
    atualizado_em_exportador?: boolean
  }, ExtArgs["result"]["exportadorQuandoImportacao"]>

  export type ExportadorQuandoImportacaoSelectScalar = {
    id_exportador?: boolean
    id_organizacao_exportador?: boolean
    id_workspace_exportador?: boolean
    nome_exportador?: boolean
    endereco_exportador?: boolean
    cidade_exportador?: boolean
    estado_provincia_exportador?: boolean
    pais_exportador?: boolean
    zipcode_exportador?: boolean
    criado_em_exportador?: boolean
    atualizado_em_exportador?: boolean
  }


  export type $ExportadorQuandoImportacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExportadorQuandoImportacao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_exportador: string
      id_organizacao_exportador: string
      id_workspace_exportador: string
      nome_exportador: string
      endereco_exportador: string | null
      cidade_exportador: string | null
      estado_provincia_exportador: string | null
      pais_exportador: string
      zipcode_exportador: string | null
      criado_em_exportador: Date
      atualizado_em_exportador: Date
    }, ExtArgs["result"]["exportadorQuandoImportacao"]>
    composites: {}
  }

  type ExportadorQuandoImportacaoGetPayload<S extends boolean | null | undefined | ExportadorQuandoImportacaoDefaultArgs> = $Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload, S>

  type ExportadorQuandoImportacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExportadorQuandoImportacaoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExportadorQuandoImportacaoCountAggregateInputType | true
    }

  export interface ExportadorQuandoImportacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExportadorQuandoImportacao'], meta: { name: 'ExportadorQuandoImportacao' } }
    /**
     * Find zero or one ExportadorQuandoImportacao that matches the filter.
     * @param {ExportadorQuandoImportacaoFindUniqueArgs} args - Arguments to find a ExportadorQuandoImportacao
     * @example
     * // Get one ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExportadorQuandoImportacaoFindUniqueArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoFindUniqueArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ExportadorQuandoImportacao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExportadorQuandoImportacaoFindUniqueOrThrowArgs} args - Arguments to find a ExportadorQuandoImportacao
     * @example
     * // Get one ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExportadorQuandoImportacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ExportadorQuandoImportacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoFindFirstArgs} args - Arguments to find a ExportadorQuandoImportacao
     * @example
     * // Get one ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExportadorQuandoImportacaoFindFirstArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoFindFirstArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ExportadorQuandoImportacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoFindFirstOrThrowArgs} args - Arguments to find a ExportadorQuandoImportacao
     * @example
     * // Get one ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExportadorQuandoImportacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ExportadorQuandoImportacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExportadorQuandoImportacaos
     * const exportadorQuandoImportacaos = await prisma.exportadorQuandoImportacao.findMany()
     * 
     * // Get first 10 ExportadorQuandoImportacaos
     * const exportadorQuandoImportacaos = await prisma.exportadorQuandoImportacao.findMany({ take: 10 })
     * 
     * // Only select the `id_exportador`
     * const exportadorQuandoImportacaoWithId_exportadorOnly = await prisma.exportadorQuandoImportacao.findMany({ select: { id_exportador: true } })
     * 
     */
    findMany<T extends ExportadorQuandoImportacaoFindManyArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ExportadorQuandoImportacao.
     * @param {ExportadorQuandoImportacaoCreateArgs} args - Arguments to create a ExportadorQuandoImportacao.
     * @example
     * // Create one ExportadorQuandoImportacao
     * const ExportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.create({
     *   data: {
     *     // ... data to create a ExportadorQuandoImportacao
     *   }
     * })
     * 
     */
    create<T extends ExportadorQuandoImportacaoCreateArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoCreateArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ExportadorQuandoImportacaos.
     * @param {ExportadorQuandoImportacaoCreateManyArgs} args - Arguments to create many ExportadorQuandoImportacaos.
     * @example
     * // Create many ExportadorQuandoImportacaos
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExportadorQuandoImportacaoCreateManyArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExportadorQuandoImportacaos and returns the data saved in the database.
     * @param {ExportadorQuandoImportacaoCreateManyAndReturnArgs} args - Arguments to create many ExportadorQuandoImportacaos.
     * @example
     * // Create many ExportadorQuandoImportacaos
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExportadorQuandoImportacaos and only return the `id_exportador`
     * const exportadorQuandoImportacaoWithId_exportadorOnly = await prisma.exportadorQuandoImportacao.createManyAndReturn({ 
     *   select: { id_exportador: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExportadorQuandoImportacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ExportadorQuandoImportacao.
     * @param {ExportadorQuandoImportacaoDeleteArgs} args - Arguments to delete one ExportadorQuandoImportacao.
     * @example
     * // Delete one ExportadorQuandoImportacao
     * const ExportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.delete({
     *   where: {
     *     // ... filter to delete one ExportadorQuandoImportacao
     *   }
     * })
     * 
     */
    delete<T extends ExportadorQuandoImportacaoDeleteArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoDeleteArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ExportadorQuandoImportacao.
     * @param {ExportadorQuandoImportacaoUpdateArgs} args - Arguments to update one ExportadorQuandoImportacao.
     * @example
     * // Update one ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExportadorQuandoImportacaoUpdateArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoUpdateArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ExportadorQuandoImportacaos.
     * @param {ExportadorQuandoImportacaoDeleteManyArgs} args - Arguments to filter ExportadorQuandoImportacaos to delete.
     * @example
     * // Delete a few ExportadorQuandoImportacaos
     * const { count } = await prisma.exportadorQuandoImportacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExportadorQuandoImportacaoDeleteManyArgs>(args?: SelectSubset<T, ExportadorQuandoImportacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExportadorQuandoImportacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExportadorQuandoImportacaos
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExportadorQuandoImportacaoUpdateManyArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExportadorQuandoImportacao.
     * @param {ExportadorQuandoImportacaoUpsertArgs} args - Arguments to update or create a ExportadorQuandoImportacao.
     * @example
     * // Update or create a ExportadorQuandoImportacao
     * const exportadorQuandoImportacao = await prisma.exportadorQuandoImportacao.upsert({
     *   create: {
     *     // ... data to create a ExportadorQuandoImportacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExportadorQuandoImportacao we want to update
     *   }
     * })
     */
    upsert<T extends ExportadorQuandoImportacaoUpsertArgs>(args: SelectSubset<T, ExportadorQuandoImportacaoUpsertArgs<ExtArgs>>): Prisma__ExportadorQuandoImportacaoClient<$Result.GetResult<Prisma.$ExportadorQuandoImportacaoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ExportadorQuandoImportacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoCountArgs} args - Arguments to filter ExportadorQuandoImportacaos to count.
     * @example
     * // Count the number of ExportadorQuandoImportacaos
     * const count = await prisma.exportadorQuandoImportacao.count({
     *   where: {
     *     // ... the filter for the ExportadorQuandoImportacaos we want to count
     *   }
     * })
    **/
    count<T extends ExportadorQuandoImportacaoCountArgs>(
      args?: Subset<T, ExportadorQuandoImportacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExportadorQuandoImportacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExportadorQuandoImportacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ExportadorQuandoImportacaoAggregateArgs>(args: Subset<T, ExportadorQuandoImportacaoAggregateArgs>): Prisma.PrismaPromise<GetExportadorQuandoImportacaoAggregateType<T>>

    /**
     * Group by ExportadorQuandoImportacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExportadorQuandoImportacaoGroupByArgs} args - Group by arguments.
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
      T extends ExportadorQuandoImportacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExportadorQuandoImportacaoGroupByArgs['orderBy'] }
        : { orderBy?: ExportadorQuandoImportacaoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ExportadorQuandoImportacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExportadorQuandoImportacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExportadorQuandoImportacao model
   */
  readonly fields: ExportadorQuandoImportacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExportadorQuandoImportacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExportadorQuandoImportacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ExportadorQuandoImportacao model
   */ 
  interface ExportadorQuandoImportacaoFieldRefs {
    readonly id_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly id_organizacao_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly id_workspace_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly nome_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly endereco_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly cidade_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly estado_provincia_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly pais_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly zipcode_exportador: FieldRef<"ExportadorQuandoImportacao", 'String'>
    readonly criado_em_exportador: FieldRef<"ExportadorQuandoImportacao", 'DateTime'>
    readonly atualizado_em_exportador: FieldRef<"ExportadorQuandoImportacao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ExportadorQuandoImportacao findUnique
   */
  export type ExportadorQuandoImportacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ExportadorQuandoImportacao to fetch.
     */
    where: ExportadorQuandoImportacaoWhereUniqueInput
  }

  /**
   * ExportadorQuandoImportacao findUniqueOrThrow
   */
  export type ExportadorQuandoImportacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ExportadorQuandoImportacao to fetch.
     */
    where: ExportadorQuandoImportacaoWhereUniqueInput
  }

  /**
   * ExportadorQuandoImportacao findFirst
   */
  export type ExportadorQuandoImportacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ExportadorQuandoImportacao to fetch.
     */
    where?: ExportadorQuandoImportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExportadorQuandoImportacaos to fetch.
     */
    orderBy?: ExportadorQuandoImportacaoOrderByWithRelationInput | ExportadorQuandoImportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExportadorQuandoImportacaos.
     */
    cursor?: ExportadorQuandoImportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExportadorQuandoImportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExportadorQuandoImportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExportadorQuandoImportacaos.
     */
    distinct?: ExportadorQuandoImportacaoScalarFieldEnum | ExportadorQuandoImportacaoScalarFieldEnum[]
  }

  /**
   * ExportadorQuandoImportacao findFirstOrThrow
   */
  export type ExportadorQuandoImportacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ExportadorQuandoImportacao to fetch.
     */
    where?: ExportadorQuandoImportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExportadorQuandoImportacaos to fetch.
     */
    orderBy?: ExportadorQuandoImportacaoOrderByWithRelationInput | ExportadorQuandoImportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExportadorQuandoImportacaos.
     */
    cursor?: ExportadorQuandoImportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExportadorQuandoImportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExportadorQuandoImportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExportadorQuandoImportacaos.
     */
    distinct?: ExportadorQuandoImportacaoScalarFieldEnum | ExportadorQuandoImportacaoScalarFieldEnum[]
  }

  /**
   * ExportadorQuandoImportacao findMany
   */
  export type ExportadorQuandoImportacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ExportadorQuandoImportacaos to fetch.
     */
    where?: ExportadorQuandoImportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExportadorQuandoImportacaos to fetch.
     */
    orderBy?: ExportadorQuandoImportacaoOrderByWithRelationInput | ExportadorQuandoImportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExportadorQuandoImportacaos.
     */
    cursor?: ExportadorQuandoImportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExportadorQuandoImportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExportadorQuandoImportacaos.
     */
    skip?: number
    distinct?: ExportadorQuandoImportacaoScalarFieldEnum | ExportadorQuandoImportacaoScalarFieldEnum[]
  }

  /**
   * ExportadorQuandoImportacao create
   */
  export type ExportadorQuandoImportacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * The data needed to create a ExportadorQuandoImportacao.
     */
    data: XOR<ExportadorQuandoImportacaoCreateInput, ExportadorQuandoImportacaoUncheckedCreateInput>
  }

  /**
   * ExportadorQuandoImportacao createMany
   */
  export type ExportadorQuandoImportacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExportadorQuandoImportacaos.
     */
    data: ExportadorQuandoImportacaoCreateManyInput | ExportadorQuandoImportacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExportadorQuandoImportacao createManyAndReturn
   */
  export type ExportadorQuandoImportacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ExportadorQuandoImportacaos.
     */
    data: ExportadorQuandoImportacaoCreateManyInput | ExportadorQuandoImportacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExportadorQuandoImportacao update
   */
  export type ExportadorQuandoImportacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * The data needed to update a ExportadorQuandoImportacao.
     */
    data: XOR<ExportadorQuandoImportacaoUpdateInput, ExportadorQuandoImportacaoUncheckedUpdateInput>
    /**
     * Choose, which ExportadorQuandoImportacao to update.
     */
    where: ExportadorQuandoImportacaoWhereUniqueInput
  }

  /**
   * ExportadorQuandoImportacao updateMany
   */
  export type ExportadorQuandoImportacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExportadorQuandoImportacaos.
     */
    data: XOR<ExportadorQuandoImportacaoUpdateManyMutationInput, ExportadorQuandoImportacaoUncheckedUpdateManyInput>
    /**
     * Filter which ExportadorQuandoImportacaos to update
     */
    where?: ExportadorQuandoImportacaoWhereInput
  }

  /**
   * ExportadorQuandoImportacao upsert
   */
  export type ExportadorQuandoImportacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * The filter to search for the ExportadorQuandoImportacao to update in case it exists.
     */
    where: ExportadorQuandoImportacaoWhereUniqueInput
    /**
     * In case the ExportadorQuandoImportacao found by the `where` argument doesn't exist, create a new ExportadorQuandoImportacao with this data.
     */
    create: XOR<ExportadorQuandoImportacaoCreateInput, ExportadorQuandoImportacaoUncheckedCreateInput>
    /**
     * In case the ExportadorQuandoImportacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExportadorQuandoImportacaoUpdateInput, ExportadorQuandoImportacaoUncheckedUpdateInput>
  }

  /**
   * ExportadorQuandoImportacao delete
   */
  export type ExportadorQuandoImportacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
    /**
     * Filter which ExportadorQuandoImportacao to delete.
     */
    where: ExportadorQuandoImportacaoWhereUniqueInput
  }

  /**
   * ExportadorQuandoImportacao deleteMany
   */
  export type ExportadorQuandoImportacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExportadorQuandoImportacaos to delete
     */
    where?: ExportadorQuandoImportacaoWhereInput
  }

  /**
   * ExportadorQuandoImportacao without action
   */
  export type ExportadorQuandoImportacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExportadorQuandoImportacao
     */
    select?: ExportadorQuandoImportacaoSelect<ExtArgs> | null
  }


  /**
   * Model ImportadorQuandoExportacao
   */

  export type AggregateImportadorQuandoExportacao = {
    _count: ImportadorQuandoExportacaoCountAggregateOutputType | null
    _min: ImportadorQuandoExportacaoMinAggregateOutputType | null
    _max: ImportadorQuandoExportacaoMaxAggregateOutputType | null
  }

  export type ImportadorQuandoExportacaoMinAggregateOutputType = {
    id_importador: string | null
    id_organizacao_importador: string | null
    id_workspace_importador: string | null
    nome_importador: string | null
    endereco_importador: string | null
    cidade_importador: string | null
    estado_provincia_importador: string | null
    pais_importador: string | null
    zipcode_importador: string | null
    criado_em_importador: Date | null
    atualizado_em_importador: Date | null
  }

  export type ImportadorQuandoExportacaoMaxAggregateOutputType = {
    id_importador: string | null
    id_organizacao_importador: string | null
    id_workspace_importador: string | null
    nome_importador: string | null
    endereco_importador: string | null
    cidade_importador: string | null
    estado_provincia_importador: string | null
    pais_importador: string | null
    zipcode_importador: string | null
    criado_em_importador: Date | null
    atualizado_em_importador: Date | null
  }

  export type ImportadorQuandoExportacaoCountAggregateOutputType = {
    id_importador: number
    id_organizacao_importador: number
    id_workspace_importador: number
    nome_importador: number
    endereco_importador: number
    cidade_importador: number
    estado_provincia_importador: number
    pais_importador: number
    zipcode_importador: number
    criado_em_importador: number
    atualizado_em_importador: number
    _all: number
  }


  export type ImportadorQuandoExportacaoMinAggregateInputType = {
    id_importador?: true
    id_organizacao_importador?: true
    id_workspace_importador?: true
    nome_importador?: true
    endereco_importador?: true
    cidade_importador?: true
    estado_provincia_importador?: true
    pais_importador?: true
    zipcode_importador?: true
    criado_em_importador?: true
    atualizado_em_importador?: true
  }

  export type ImportadorQuandoExportacaoMaxAggregateInputType = {
    id_importador?: true
    id_organizacao_importador?: true
    id_workspace_importador?: true
    nome_importador?: true
    endereco_importador?: true
    cidade_importador?: true
    estado_provincia_importador?: true
    pais_importador?: true
    zipcode_importador?: true
    criado_em_importador?: true
    atualizado_em_importador?: true
  }

  export type ImportadorQuandoExportacaoCountAggregateInputType = {
    id_importador?: true
    id_organizacao_importador?: true
    id_workspace_importador?: true
    nome_importador?: true
    endereco_importador?: true
    cidade_importador?: true
    estado_provincia_importador?: true
    pais_importador?: true
    zipcode_importador?: true
    criado_em_importador?: true
    atualizado_em_importador?: true
    _all?: true
  }

  export type ImportadorQuandoExportacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportadorQuandoExportacao to aggregate.
     */
    where?: ImportadorQuandoExportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportadorQuandoExportacaos to fetch.
     */
    orderBy?: ImportadorQuandoExportacaoOrderByWithRelationInput | ImportadorQuandoExportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ImportadorQuandoExportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportadorQuandoExportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportadorQuandoExportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ImportadorQuandoExportacaos
    **/
    _count?: true | ImportadorQuandoExportacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ImportadorQuandoExportacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ImportadorQuandoExportacaoMaxAggregateInputType
  }

  export type GetImportadorQuandoExportacaoAggregateType<T extends ImportadorQuandoExportacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateImportadorQuandoExportacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateImportadorQuandoExportacao[P]>
      : GetScalarType<T[P], AggregateImportadorQuandoExportacao[P]>
  }




  export type ImportadorQuandoExportacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ImportadorQuandoExportacaoWhereInput
    orderBy?: ImportadorQuandoExportacaoOrderByWithAggregationInput | ImportadorQuandoExportacaoOrderByWithAggregationInput[]
    by: ImportadorQuandoExportacaoScalarFieldEnum[] | ImportadorQuandoExportacaoScalarFieldEnum
    having?: ImportadorQuandoExportacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ImportadorQuandoExportacaoCountAggregateInputType | true
    _min?: ImportadorQuandoExportacaoMinAggregateInputType
    _max?: ImportadorQuandoExportacaoMaxAggregateInputType
  }

  export type ImportadorQuandoExportacaoGroupByOutputType = {
    id_importador: string
    id_organizacao_importador: string
    id_workspace_importador: string
    nome_importador: string
    endereco_importador: string | null
    cidade_importador: string | null
    estado_provincia_importador: string | null
    pais_importador: string
    zipcode_importador: string | null
    criado_em_importador: Date
    atualizado_em_importador: Date
    _count: ImportadorQuandoExportacaoCountAggregateOutputType | null
    _min: ImportadorQuandoExportacaoMinAggregateOutputType | null
    _max: ImportadorQuandoExportacaoMaxAggregateOutputType | null
  }

  type GetImportadorQuandoExportacaoGroupByPayload<T extends ImportadorQuandoExportacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ImportadorQuandoExportacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ImportadorQuandoExportacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ImportadorQuandoExportacaoGroupByOutputType[P]>
            : GetScalarType<T[P], ImportadorQuandoExportacaoGroupByOutputType[P]>
        }
      >
    >


  export type ImportadorQuandoExportacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_importador?: boolean
    id_organizacao_importador?: boolean
    id_workspace_importador?: boolean
    nome_importador?: boolean
    endereco_importador?: boolean
    cidade_importador?: boolean
    estado_provincia_importador?: boolean
    pais_importador?: boolean
    zipcode_importador?: boolean
    criado_em_importador?: boolean
    atualizado_em_importador?: boolean
  }, ExtArgs["result"]["importadorQuandoExportacao"]>

  export type ImportadorQuandoExportacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_importador?: boolean
    id_organizacao_importador?: boolean
    id_workspace_importador?: boolean
    nome_importador?: boolean
    endereco_importador?: boolean
    cidade_importador?: boolean
    estado_provincia_importador?: boolean
    pais_importador?: boolean
    zipcode_importador?: boolean
    criado_em_importador?: boolean
    atualizado_em_importador?: boolean
  }, ExtArgs["result"]["importadorQuandoExportacao"]>

  export type ImportadorQuandoExportacaoSelectScalar = {
    id_importador?: boolean
    id_organizacao_importador?: boolean
    id_workspace_importador?: boolean
    nome_importador?: boolean
    endereco_importador?: boolean
    cidade_importador?: boolean
    estado_provincia_importador?: boolean
    pais_importador?: boolean
    zipcode_importador?: boolean
    criado_em_importador?: boolean
    atualizado_em_importador?: boolean
  }


  export type $ImportadorQuandoExportacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ImportadorQuandoExportacao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_importador: string
      id_organizacao_importador: string
      id_workspace_importador: string
      nome_importador: string
      endereco_importador: string | null
      cidade_importador: string | null
      estado_provincia_importador: string | null
      pais_importador: string
      zipcode_importador: string | null
      criado_em_importador: Date
      atualizado_em_importador: Date
    }, ExtArgs["result"]["importadorQuandoExportacao"]>
    composites: {}
  }

  type ImportadorQuandoExportacaoGetPayload<S extends boolean | null | undefined | ImportadorQuandoExportacaoDefaultArgs> = $Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload, S>

  type ImportadorQuandoExportacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ImportadorQuandoExportacaoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ImportadorQuandoExportacaoCountAggregateInputType | true
    }

  export interface ImportadorQuandoExportacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ImportadorQuandoExportacao'], meta: { name: 'ImportadorQuandoExportacao' } }
    /**
     * Find zero or one ImportadorQuandoExportacao that matches the filter.
     * @param {ImportadorQuandoExportacaoFindUniqueArgs} args - Arguments to find a ImportadorQuandoExportacao
     * @example
     * // Get one ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ImportadorQuandoExportacaoFindUniqueArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoFindUniqueArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ImportadorQuandoExportacao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ImportadorQuandoExportacaoFindUniqueOrThrowArgs} args - Arguments to find a ImportadorQuandoExportacao
     * @example
     * // Get one ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ImportadorQuandoExportacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ImportadorQuandoExportacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoFindFirstArgs} args - Arguments to find a ImportadorQuandoExportacao
     * @example
     * // Get one ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ImportadorQuandoExportacaoFindFirstArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoFindFirstArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ImportadorQuandoExportacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoFindFirstOrThrowArgs} args - Arguments to find a ImportadorQuandoExportacao
     * @example
     * // Get one ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ImportadorQuandoExportacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ImportadorQuandoExportacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ImportadorQuandoExportacaos
     * const importadorQuandoExportacaos = await prisma.importadorQuandoExportacao.findMany()
     * 
     * // Get first 10 ImportadorQuandoExportacaos
     * const importadorQuandoExportacaos = await prisma.importadorQuandoExportacao.findMany({ take: 10 })
     * 
     * // Only select the `id_importador`
     * const importadorQuandoExportacaoWithId_importadorOnly = await prisma.importadorQuandoExportacao.findMany({ select: { id_importador: true } })
     * 
     */
    findMany<T extends ImportadorQuandoExportacaoFindManyArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ImportadorQuandoExportacao.
     * @param {ImportadorQuandoExportacaoCreateArgs} args - Arguments to create a ImportadorQuandoExportacao.
     * @example
     * // Create one ImportadorQuandoExportacao
     * const ImportadorQuandoExportacao = await prisma.importadorQuandoExportacao.create({
     *   data: {
     *     // ... data to create a ImportadorQuandoExportacao
     *   }
     * })
     * 
     */
    create<T extends ImportadorQuandoExportacaoCreateArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoCreateArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ImportadorQuandoExportacaos.
     * @param {ImportadorQuandoExportacaoCreateManyArgs} args - Arguments to create many ImportadorQuandoExportacaos.
     * @example
     * // Create many ImportadorQuandoExportacaos
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ImportadorQuandoExportacaoCreateManyArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ImportadorQuandoExportacaos and returns the data saved in the database.
     * @param {ImportadorQuandoExportacaoCreateManyAndReturnArgs} args - Arguments to create many ImportadorQuandoExportacaos.
     * @example
     * // Create many ImportadorQuandoExportacaos
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ImportadorQuandoExportacaos and only return the `id_importador`
     * const importadorQuandoExportacaoWithId_importadorOnly = await prisma.importadorQuandoExportacao.createManyAndReturn({ 
     *   select: { id_importador: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ImportadorQuandoExportacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ImportadorQuandoExportacao.
     * @param {ImportadorQuandoExportacaoDeleteArgs} args - Arguments to delete one ImportadorQuandoExportacao.
     * @example
     * // Delete one ImportadorQuandoExportacao
     * const ImportadorQuandoExportacao = await prisma.importadorQuandoExportacao.delete({
     *   where: {
     *     // ... filter to delete one ImportadorQuandoExportacao
     *   }
     * })
     * 
     */
    delete<T extends ImportadorQuandoExportacaoDeleteArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoDeleteArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ImportadorQuandoExportacao.
     * @param {ImportadorQuandoExportacaoUpdateArgs} args - Arguments to update one ImportadorQuandoExportacao.
     * @example
     * // Update one ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ImportadorQuandoExportacaoUpdateArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoUpdateArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ImportadorQuandoExportacaos.
     * @param {ImportadorQuandoExportacaoDeleteManyArgs} args - Arguments to filter ImportadorQuandoExportacaos to delete.
     * @example
     * // Delete a few ImportadorQuandoExportacaos
     * const { count } = await prisma.importadorQuandoExportacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ImportadorQuandoExportacaoDeleteManyArgs>(args?: SelectSubset<T, ImportadorQuandoExportacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ImportadorQuandoExportacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ImportadorQuandoExportacaos
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ImportadorQuandoExportacaoUpdateManyArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ImportadorQuandoExportacao.
     * @param {ImportadorQuandoExportacaoUpsertArgs} args - Arguments to update or create a ImportadorQuandoExportacao.
     * @example
     * // Update or create a ImportadorQuandoExportacao
     * const importadorQuandoExportacao = await prisma.importadorQuandoExportacao.upsert({
     *   create: {
     *     // ... data to create a ImportadorQuandoExportacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ImportadorQuandoExportacao we want to update
     *   }
     * })
     */
    upsert<T extends ImportadorQuandoExportacaoUpsertArgs>(args: SelectSubset<T, ImportadorQuandoExportacaoUpsertArgs<ExtArgs>>): Prisma__ImportadorQuandoExportacaoClient<$Result.GetResult<Prisma.$ImportadorQuandoExportacaoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ImportadorQuandoExportacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoCountArgs} args - Arguments to filter ImportadorQuandoExportacaos to count.
     * @example
     * // Count the number of ImportadorQuandoExportacaos
     * const count = await prisma.importadorQuandoExportacao.count({
     *   where: {
     *     // ... the filter for the ImportadorQuandoExportacaos we want to count
     *   }
     * })
    **/
    count<T extends ImportadorQuandoExportacaoCountArgs>(
      args?: Subset<T, ImportadorQuandoExportacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ImportadorQuandoExportacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ImportadorQuandoExportacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ImportadorQuandoExportacaoAggregateArgs>(args: Subset<T, ImportadorQuandoExportacaoAggregateArgs>): Prisma.PrismaPromise<GetImportadorQuandoExportacaoAggregateType<T>>

    /**
     * Group by ImportadorQuandoExportacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ImportadorQuandoExportacaoGroupByArgs} args - Group by arguments.
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
      T extends ImportadorQuandoExportacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ImportadorQuandoExportacaoGroupByArgs['orderBy'] }
        : { orderBy?: ImportadorQuandoExportacaoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ImportadorQuandoExportacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetImportadorQuandoExportacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ImportadorQuandoExportacao model
   */
  readonly fields: ImportadorQuandoExportacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ImportadorQuandoExportacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ImportadorQuandoExportacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ImportadorQuandoExportacao model
   */ 
  interface ImportadorQuandoExportacaoFieldRefs {
    readonly id_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly id_organizacao_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly id_workspace_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly nome_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly endereco_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly cidade_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly estado_provincia_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly pais_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly zipcode_importador: FieldRef<"ImportadorQuandoExportacao", 'String'>
    readonly criado_em_importador: FieldRef<"ImportadorQuandoExportacao", 'DateTime'>
    readonly atualizado_em_importador: FieldRef<"ImportadorQuandoExportacao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ImportadorQuandoExportacao findUnique
   */
  export type ImportadorQuandoExportacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ImportadorQuandoExportacao to fetch.
     */
    where: ImportadorQuandoExportacaoWhereUniqueInput
  }

  /**
   * ImportadorQuandoExportacao findUniqueOrThrow
   */
  export type ImportadorQuandoExportacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ImportadorQuandoExportacao to fetch.
     */
    where: ImportadorQuandoExportacaoWhereUniqueInput
  }

  /**
   * ImportadorQuandoExportacao findFirst
   */
  export type ImportadorQuandoExportacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ImportadorQuandoExportacao to fetch.
     */
    where?: ImportadorQuandoExportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportadorQuandoExportacaos to fetch.
     */
    orderBy?: ImportadorQuandoExportacaoOrderByWithRelationInput | ImportadorQuandoExportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportadorQuandoExportacaos.
     */
    cursor?: ImportadorQuandoExportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportadorQuandoExportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportadorQuandoExportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportadorQuandoExportacaos.
     */
    distinct?: ImportadorQuandoExportacaoScalarFieldEnum | ImportadorQuandoExportacaoScalarFieldEnum[]
  }

  /**
   * ImportadorQuandoExportacao findFirstOrThrow
   */
  export type ImportadorQuandoExportacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ImportadorQuandoExportacao to fetch.
     */
    where?: ImportadorQuandoExportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportadorQuandoExportacaos to fetch.
     */
    orderBy?: ImportadorQuandoExportacaoOrderByWithRelationInput | ImportadorQuandoExportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ImportadorQuandoExportacaos.
     */
    cursor?: ImportadorQuandoExportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportadorQuandoExportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportadorQuandoExportacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ImportadorQuandoExportacaos.
     */
    distinct?: ImportadorQuandoExportacaoScalarFieldEnum | ImportadorQuandoExportacaoScalarFieldEnum[]
  }

  /**
   * ImportadorQuandoExportacao findMany
   */
  export type ImportadorQuandoExportacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter, which ImportadorQuandoExportacaos to fetch.
     */
    where?: ImportadorQuandoExportacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ImportadorQuandoExportacaos to fetch.
     */
    orderBy?: ImportadorQuandoExportacaoOrderByWithRelationInput | ImportadorQuandoExportacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ImportadorQuandoExportacaos.
     */
    cursor?: ImportadorQuandoExportacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ImportadorQuandoExportacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ImportadorQuandoExportacaos.
     */
    skip?: number
    distinct?: ImportadorQuandoExportacaoScalarFieldEnum | ImportadorQuandoExportacaoScalarFieldEnum[]
  }

  /**
   * ImportadorQuandoExportacao create
   */
  export type ImportadorQuandoExportacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * The data needed to create a ImportadorQuandoExportacao.
     */
    data: XOR<ImportadorQuandoExportacaoCreateInput, ImportadorQuandoExportacaoUncheckedCreateInput>
  }

  /**
   * ImportadorQuandoExportacao createMany
   */
  export type ImportadorQuandoExportacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ImportadorQuandoExportacaos.
     */
    data: ImportadorQuandoExportacaoCreateManyInput | ImportadorQuandoExportacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ImportadorQuandoExportacao createManyAndReturn
   */
  export type ImportadorQuandoExportacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ImportadorQuandoExportacaos.
     */
    data: ImportadorQuandoExportacaoCreateManyInput | ImportadorQuandoExportacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ImportadorQuandoExportacao update
   */
  export type ImportadorQuandoExportacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * The data needed to update a ImportadorQuandoExportacao.
     */
    data: XOR<ImportadorQuandoExportacaoUpdateInput, ImportadorQuandoExportacaoUncheckedUpdateInput>
    /**
     * Choose, which ImportadorQuandoExportacao to update.
     */
    where: ImportadorQuandoExportacaoWhereUniqueInput
  }

  /**
   * ImportadorQuandoExportacao updateMany
   */
  export type ImportadorQuandoExportacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ImportadorQuandoExportacaos.
     */
    data: XOR<ImportadorQuandoExportacaoUpdateManyMutationInput, ImportadorQuandoExportacaoUncheckedUpdateManyInput>
    /**
     * Filter which ImportadorQuandoExportacaos to update
     */
    where?: ImportadorQuandoExportacaoWhereInput
  }

  /**
   * ImportadorQuandoExportacao upsert
   */
  export type ImportadorQuandoExportacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * The filter to search for the ImportadorQuandoExportacao to update in case it exists.
     */
    where: ImportadorQuandoExportacaoWhereUniqueInput
    /**
     * In case the ImportadorQuandoExportacao found by the `where` argument doesn't exist, create a new ImportadorQuandoExportacao with this data.
     */
    create: XOR<ImportadorQuandoExportacaoCreateInput, ImportadorQuandoExportacaoUncheckedCreateInput>
    /**
     * In case the ImportadorQuandoExportacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ImportadorQuandoExportacaoUpdateInput, ImportadorQuandoExportacaoUncheckedUpdateInput>
  }

  /**
   * ImportadorQuandoExportacao delete
   */
  export type ImportadorQuandoExportacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
    /**
     * Filter which ImportadorQuandoExportacao to delete.
     */
    where: ImportadorQuandoExportacaoWhereUniqueInput
  }

  /**
   * ImportadorQuandoExportacao deleteMany
   */
  export type ImportadorQuandoExportacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ImportadorQuandoExportacaos to delete
     */
    where?: ImportadorQuandoExportacaoWhereInput
  }

  /**
   * ImportadorQuandoExportacao without action
   */
  export type ImportadorQuandoExportacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ImportadorQuandoExportacao
     */
    select?: ImportadorQuandoExportacaoSelect<ExtArgs> | null
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


  export const EmpresaScalarFieldEnum: {
    suid_empresa: 'suid_empresa',
    id_organizacao_empresa: 'id_organizacao_empresa',
    id_produto_empresa: 'id_produto_empresa',
    id_usuario_empresa: 'id_usuario_empresa',
    nome_empresa: 'nome_empresa',
    cnpj_empresa: 'cnpj_empresa',
    tin_empresa: 'tin_empresa',
    pais_empresa: 'pais_empresa',
    estado_empresa: 'estado_empresa',
    cidade_empresa: 'cidade_empresa',
    endereco_empresa: 'endereco_empresa',
    zipcode_empresa: 'zipcode_empresa',
    email_empresa: 'email_empresa',
    telefone_empresa: 'telefone_empresa',
    whatsapp_empresa: 'whatsapp_empresa',
    pode_ser_importador_empresa: 'pode_ser_importador_empresa',
    pode_ser_exportador_empresa: 'pode_ser_exportador_empresa',
    pode_ser_fabricante_empresa: 'pode_ser_fabricante_empresa',
    pode_ser_agente_empresa: 'pode_ser_agente_empresa',
    pode_ser_despachante_empresa: 'pode_ser_despachante_empresa',
    pode_ser_armador_empresa: 'pode_ser_armador_empresa',
    pode_ser_armazem_alfandegado_empresa: 'pode_ser_armazem_alfandegado_empresa',
    pode_ser_transportadora_rodoviaria_nacional_empresa: 'pode_ser_transportadora_rodoviaria_nacional_empresa',
    pode_ser_cia_aerea_empresa: 'pode_ser_cia_aerea_empresa',
    pode_ser_transportadora_rodoviaria_internacional_empresa: 'pode_ser_transportadora_rodoviaria_internacional_empresa',
    pode_ser_seguradora_internacional_empresa: 'pode_ser_seguradora_internacional_empresa',
    pode_ser_seguradora_corretora_cambio_empresa: 'pode_ser_seguradora_corretora_cambio_empresa',
    pode_ser_banco_empresa: 'pode_ser_banco_empresa',
    pode_ser_armazem_nacional_empresa: 'pode_ser_armazem_nacional_empresa',
    ativo_empresa: 'ativo_empresa',
    criado_em_empresa: 'criado_em_empresa',
    atualizado_em_empresa: 'atualizado_em_empresa'
  };

  export type EmpresaScalarFieldEnum = (typeof EmpresaScalarFieldEnum)[keyof typeof EmpresaScalarFieldEnum]


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


  export const ExportadorQuandoImportacaoScalarFieldEnum: {
    id_exportador: 'id_exportador',
    id_organizacao_exportador: 'id_organizacao_exportador',
    id_workspace_exportador: 'id_workspace_exportador',
    nome_exportador: 'nome_exportador',
    endereco_exportador: 'endereco_exportador',
    cidade_exportador: 'cidade_exportador',
    estado_provincia_exportador: 'estado_provincia_exportador',
    pais_exportador: 'pais_exportador',
    zipcode_exportador: 'zipcode_exportador',
    criado_em_exportador: 'criado_em_exportador',
    atualizado_em_exportador: 'atualizado_em_exportador'
  };

  export type ExportadorQuandoImportacaoScalarFieldEnum = (typeof ExportadorQuandoImportacaoScalarFieldEnum)[keyof typeof ExportadorQuandoImportacaoScalarFieldEnum]


  export const ImportadorQuandoExportacaoScalarFieldEnum: {
    id_importador: 'id_importador',
    id_organizacao_importador: 'id_organizacao_importador',
    id_workspace_importador: 'id_workspace_importador',
    nome_importador: 'nome_importador',
    endereco_importador: 'endereco_importador',
    cidade_importador: 'cidade_importador',
    estado_provincia_importador: 'estado_provincia_importador',
    pais_importador: 'pais_importador',
    zipcode_importador: 'zipcode_importador',
    criado_em_importador: 'criado_em_importador',
    atualizado_em_importador: 'atualizado_em_importador'
  };

  export type ImportadorQuandoExportacaoScalarFieldEnum = (typeof ImportadorQuandoExportacaoScalarFieldEnum)[keyof typeof ImportadorQuandoExportacaoScalarFieldEnum]


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
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


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


  export type EmpresaWhereInput = {
    AND?: EmpresaWhereInput | EmpresaWhereInput[]
    OR?: EmpresaWhereInput[]
    NOT?: EmpresaWhereInput | EmpresaWhereInput[]
    suid_empresa?: StringFilter<"Empresa"> | string
    id_organizacao_empresa?: StringFilter<"Empresa"> | string
    id_produto_empresa?: StringNullableFilter<"Empresa"> | string | null
    id_usuario_empresa?: StringNullableFilter<"Empresa"> | string | null
    nome_empresa?: StringFilter<"Empresa"> | string
    cnpj_empresa?: StringNullableFilter<"Empresa"> | string | null
    tin_empresa?: StringNullableFilter<"Empresa"> | string | null
    pais_empresa?: StringFilter<"Empresa"> | string
    estado_empresa?: StringNullableFilter<"Empresa"> | string | null
    cidade_empresa?: StringNullableFilter<"Empresa"> | string | null
    endereco_empresa?: StringNullableFilter<"Empresa"> | string | null
    zipcode_empresa?: StringNullableFilter<"Empresa"> | string | null
    email_empresa?: StringNullableFilter<"Empresa"> | string | null
    telefone_empresa?: StringNullableFilter<"Empresa"> | string | null
    whatsapp_empresa?: StringNullableFilter<"Empresa"> | string | null
    pode_ser_importador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_exportador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_fabricante_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_agente_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_despachante_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    ativo_empresa?: BoolFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
  }

  export type EmpresaOrderByWithRelationInput = {
    suid_empresa?: SortOrder
    id_organizacao_empresa?: SortOrder
    id_produto_empresa?: SortOrderInput | SortOrder
    id_usuario_empresa?: SortOrderInput | SortOrder
    nome_empresa?: SortOrder
    cnpj_empresa?: SortOrderInput | SortOrder
    tin_empresa?: SortOrderInput | SortOrder
    pais_empresa?: SortOrder
    estado_empresa?: SortOrderInput | SortOrder
    cidade_empresa?: SortOrderInput | SortOrder
    endereco_empresa?: SortOrderInput | SortOrder
    zipcode_empresa?: SortOrderInput | SortOrder
    email_empresa?: SortOrderInput | SortOrder
    telefone_empresa?: SortOrderInput | SortOrder
    whatsapp_empresa?: SortOrderInput | SortOrder
    pode_ser_importador_empresa?: SortOrder
    pode_ser_exportador_empresa?: SortOrder
    pode_ser_fabricante_empresa?: SortOrder
    pode_ser_agente_empresa?: SortOrder
    pode_ser_despachante_empresa?: SortOrder
    pode_ser_armador_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
  }

  export type EmpresaWhereUniqueInput = Prisma.AtLeast<{
    suid_empresa?: string
    id_organizacao_empresa_cnpj_empresa?: EmpresaId_organizacao_empresaCnpj_empresaCompoundUniqueInput
    id_organizacao_empresa_tin_empresa_pais_empresa?: EmpresaId_organizacao_empresaTin_empresaPais_empresaCompoundUniqueInput
    AND?: EmpresaWhereInput | EmpresaWhereInput[]
    OR?: EmpresaWhereInput[]
    NOT?: EmpresaWhereInput | EmpresaWhereInput[]
    id_organizacao_empresa?: StringFilter<"Empresa"> | string
    id_produto_empresa?: StringNullableFilter<"Empresa"> | string | null
    id_usuario_empresa?: StringNullableFilter<"Empresa"> | string | null
    nome_empresa?: StringFilter<"Empresa"> | string
    cnpj_empresa?: StringNullableFilter<"Empresa"> | string | null
    tin_empresa?: StringNullableFilter<"Empresa"> | string | null
    pais_empresa?: StringFilter<"Empresa"> | string
    estado_empresa?: StringNullableFilter<"Empresa"> | string | null
    cidade_empresa?: StringNullableFilter<"Empresa"> | string | null
    endereco_empresa?: StringNullableFilter<"Empresa"> | string | null
    zipcode_empresa?: StringNullableFilter<"Empresa"> | string | null
    email_empresa?: StringNullableFilter<"Empresa"> | string | null
    telefone_empresa?: StringNullableFilter<"Empresa"> | string | null
    whatsapp_empresa?: StringNullableFilter<"Empresa"> | string | null
    pode_ser_importador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_exportador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_fabricante_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_agente_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_despachante_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armador_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    ativo_empresa?: BoolFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
  }, "suid_empresa" | "id_organizacao_empresa_cnpj_empresa" | "id_organizacao_empresa_tin_empresa_pais_empresa">

  export type EmpresaOrderByWithAggregationInput = {
    suid_empresa?: SortOrder
    id_organizacao_empresa?: SortOrder
    id_produto_empresa?: SortOrderInput | SortOrder
    id_usuario_empresa?: SortOrderInput | SortOrder
    nome_empresa?: SortOrder
    cnpj_empresa?: SortOrderInput | SortOrder
    tin_empresa?: SortOrderInput | SortOrder
    pais_empresa?: SortOrder
    estado_empresa?: SortOrderInput | SortOrder
    cidade_empresa?: SortOrderInput | SortOrder
    endereco_empresa?: SortOrderInput | SortOrder
    zipcode_empresa?: SortOrderInput | SortOrder
    email_empresa?: SortOrderInput | SortOrder
    telefone_empresa?: SortOrderInput | SortOrder
    whatsapp_empresa?: SortOrderInput | SortOrder
    pode_ser_importador_empresa?: SortOrder
    pode_ser_exportador_empresa?: SortOrder
    pode_ser_fabricante_empresa?: SortOrder
    pode_ser_agente_empresa?: SortOrder
    pode_ser_despachante_empresa?: SortOrder
    pode_ser_armador_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    _count?: EmpresaCountOrderByAggregateInput
    _max?: EmpresaMaxOrderByAggregateInput
    _min?: EmpresaMinOrderByAggregateInput
  }

  export type EmpresaScalarWhereWithAggregatesInput = {
    AND?: EmpresaScalarWhereWithAggregatesInput | EmpresaScalarWhereWithAggregatesInput[]
    OR?: EmpresaScalarWhereWithAggregatesInput[]
    NOT?: EmpresaScalarWhereWithAggregatesInput | EmpresaScalarWhereWithAggregatesInput[]
    suid_empresa?: StringWithAggregatesFilter<"Empresa"> | string
    id_organizacao_empresa?: StringWithAggregatesFilter<"Empresa"> | string
    id_produto_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    id_usuario_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    nome_empresa?: StringWithAggregatesFilter<"Empresa"> | string
    cnpj_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    tin_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    pais_empresa?: StringWithAggregatesFilter<"Empresa"> | string
    estado_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    cidade_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    endereco_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    zipcode_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    email_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    telefone_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    whatsapp_empresa?: StringNullableWithAggregatesFilter<"Empresa"> | string | null
    pode_ser_importador_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_exportador_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_fabricante_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_agente_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_despachante_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_armador_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    ativo_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeWithAggregatesFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeWithAggregatesFilter<"Empresa"> | Date | string
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

  export type ExportadorQuandoImportacaoWhereInput = {
    AND?: ExportadorQuandoImportacaoWhereInput | ExportadorQuandoImportacaoWhereInput[]
    OR?: ExportadorQuandoImportacaoWhereInput[]
    NOT?: ExportadorQuandoImportacaoWhereInput | ExportadorQuandoImportacaoWhereInput[]
    id_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    id_organizacao_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    id_workspace_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    nome_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    endereco_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    cidade_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    estado_provincia_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    pais_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    zipcode_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    criado_em_exportador?: DateTimeFilter<"ExportadorQuandoImportacao"> | Date | string
    atualizado_em_exportador?: DateTimeFilter<"ExportadorQuandoImportacao"> | Date | string
  }

  export type ExportadorQuandoImportacaoOrderByWithRelationInput = {
    id_exportador?: SortOrder
    id_organizacao_exportador?: SortOrder
    id_workspace_exportador?: SortOrder
    nome_exportador?: SortOrder
    endereco_exportador?: SortOrderInput | SortOrder
    cidade_exportador?: SortOrderInput | SortOrder
    estado_provincia_exportador?: SortOrderInput | SortOrder
    pais_exportador?: SortOrder
    zipcode_exportador?: SortOrderInput | SortOrder
    criado_em_exportador?: SortOrder
    atualizado_em_exportador?: SortOrder
  }

  export type ExportadorQuandoImportacaoWhereUniqueInput = Prisma.AtLeast<{
    id_exportador?: string
    AND?: ExportadorQuandoImportacaoWhereInput | ExportadorQuandoImportacaoWhereInput[]
    OR?: ExportadorQuandoImportacaoWhereInput[]
    NOT?: ExportadorQuandoImportacaoWhereInput | ExportadorQuandoImportacaoWhereInput[]
    id_organizacao_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    id_workspace_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    nome_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    endereco_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    cidade_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    estado_provincia_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    pais_exportador?: StringFilter<"ExportadorQuandoImportacao"> | string
    zipcode_exportador?: StringNullableFilter<"ExportadorQuandoImportacao"> | string | null
    criado_em_exportador?: DateTimeFilter<"ExportadorQuandoImportacao"> | Date | string
    atualizado_em_exportador?: DateTimeFilter<"ExportadorQuandoImportacao"> | Date | string
  }, "id_exportador">

  export type ExportadorQuandoImportacaoOrderByWithAggregationInput = {
    id_exportador?: SortOrder
    id_organizacao_exportador?: SortOrder
    id_workspace_exportador?: SortOrder
    nome_exportador?: SortOrder
    endereco_exportador?: SortOrderInput | SortOrder
    cidade_exportador?: SortOrderInput | SortOrder
    estado_provincia_exportador?: SortOrderInput | SortOrder
    pais_exportador?: SortOrder
    zipcode_exportador?: SortOrderInput | SortOrder
    criado_em_exportador?: SortOrder
    atualizado_em_exportador?: SortOrder
    _count?: ExportadorQuandoImportacaoCountOrderByAggregateInput
    _max?: ExportadorQuandoImportacaoMaxOrderByAggregateInput
    _min?: ExportadorQuandoImportacaoMinOrderByAggregateInput
  }

  export type ExportadorQuandoImportacaoScalarWhereWithAggregatesInput = {
    AND?: ExportadorQuandoImportacaoScalarWhereWithAggregatesInput | ExportadorQuandoImportacaoScalarWhereWithAggregatesInput[]
    OR?: ExportadorQuandoImportacaoScalarWhereWithAggregatesInput[]
    NOT?: ExportadorQuandoImportacaoScalarWhereWithAggregatesInput | ExportadorQuandoImportacaoScalarWhereWithAggregatesInput[]
    id_exportador?: StringWithAggregatesFilter<"ExportadorQuandoImportacao"> | string
    id_organizacao_exportador?: StringWithAggregatesFilter<"ExportadorQuandoImportacao"> | string
    id_workspace_exportador?: StringWithAggregatesFilter<"ExportadorQuandoImportacao"> | string
    nome_exportador?: StringWithAggregatesFilter<"ExportadorQuandoImportacao"> | string
    endereco_exportador?: StringNullableWithAggregatesFilter<"ExportadorQuandoImportacao"> | string | null
    cidade_exportador?: StringNullableWithAggregatesFilter<"ExportadorQuandoImportacao"> | string | null
    estado_provincia_exportador?: StringNullableWithAggregatesFilter<"ExportadorQuandoImportacao"> | string | null
    pais_exportador?: StringWithAggregatesFilter<"ExportadorQuandoImportacao"> | string
    zipcode_exportador?: StringNullableWithAggregatesFilter<"ExportadorQuandoImportacao"> | string | null
    criado_em_exportador?: DateTimeWithAggregatesFilter<"ExportadorQuandoImportacao"> | Date | string
    atualizado_em_exportador?: DateTimeWithAggregatesFilter<"ExportadorQuandoImportacao"> | Date | string
  }

  export type ImportadorQuandoExportacaoWhereInput = {
    AND?: ImportadorQuandoExportacaoWhereInput | ImportadorQuandoExportacaoWhereInput[]
    OR?: ImportadorQuandoExportacaoWhereInput[]
    NOT?: ImportadorQuandoExportacaoWhereInput | ImportadorQuandoExportacaoWhereInput[]
    id_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    id_organizacao_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    id_workspace_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    nome_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    endereco_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    cidade_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    estado_provincia_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    pais_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    zipcode_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    criado_em_importador?: DateTimeFilter<"ImportadorQuandoExportacao"> | Date | string
    atualizado_em_importador?: DateTimeFilter<"ImportadorQuandoExportacao"> | Date | string
  }

  export type ImportadorQuandoExportacaoOrderByWithRelationInput = {
    id_importador?: SortOrder
    id_organizacao_importador?: SortOrder
    id_workspace_importador?: SortOrder
    nome_importador?: SortOrder
    endereco_importador?: SortOrderInput | SortOrder
    cidade_importador?: SortOrderInput | SortOrder
    estado_provincia_importador?: SortOrderInput | SortOrder
    pais_importador?: SortOrder
    zipcode_importador?: SortOrderInput | SortOrder
    criado_em_importador?: SortOrder
    atualizado_em_importador?: SortOrder
  }

  export type ImportadorQuandoExportacaoWhereUniqueInput = Prisma.AtLeast<{
    id_importador?: string
    AND?: ImportadorQuandoExportacaoWhereInput | ImportadorQuandoExportacaoWhereInput[]
    OR?: ImportadorQuandoExportacaoWhereInput[]
    NOT?: ImportadorQuandoExportacaoWhereInput | ImportadorQuandoExportacaoWhereInput[]
    id_organizacao_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    id_workspace_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    nome_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    endereco_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    cidade_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    estado_provincia_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    pais_importador?: StringFilter<"ImportadorQuandoExportacao"> | string
    zipcode_importador?: StringNullableFilter<"ImportadorQuandoExportacao"> | string | null
    criado_em_importador?: DateTimeFilter<"ImportadorQuandoExportacao"> | Date | string
    atualizado_em_importador?: DateTimeFilter<"ImportadorQuandoExportacao"> | Date | string
  }, "id_importador">

  export type ImportadorQuandoExportacaoOrderByWithAggregationInput = {
    id_importador?: SortOrder
    id_organizacao_importador?: SortOrder
    id_workspace_importador?: SortOrder
    nome_importador?: SortOrder
    endereco_importador?: SortOrderInput | SortOrder
    cidade_importador?: SortOrderInput | SortOrder
    estado_provincia_importador?: SortOrderInput | SortOrder
    pais_importador?: SortOrder
    zipcode_importador?: SortOrderInput | SortOrder
    criado_em_importador?: SortOrder
    atualizado_em_importador?: SortOrder
    _count?: ImportadorQuandoExportacaoCountOrderByAggregateInput
    _max?: ImportadorQuandoExportacaoMaxOrderByAggregateInput
    _min?: ImportadorQuandoExportacaoMinOrderByAggregateInput
  }

  export type ImportadorQuandoExportacaoScalarWhereWithAggregatesInput = {
    AND?: ImportadorQuandoExportacaoScalarWhereWithAggregatesInput | ImportadorQuandoExportacaoScalarWhereWithAggregatesInput[]
    OR?: ImportadorQuandoExportacaoScalarWhereWithAggregatesInput[]
    NOT?: ImportadorQuandoExportacaoScalarWhereWithAggregatesInput | ImportadorQuandoExportacaoScalarWhereWithAggregatesInput[]
    id_importador?: StringWithAggregatesFilter<"ImportadorQuandoExportacao"> | string
    id_organizacao_importador?: StringWithAggregatesFilter<"ImportadorQuandoExportacao"> | string
    id_workspace_importador?: StringWithAggregatesFilter<"ImportadorQuandoExportacao"> | string
    nome_importador?: StringWithAggregatesFilter<"ImportadorQuandoExportacao"> | string
    endereco_importador?: StringNullableWithAggregatesFilter<"ImportadorQuandoExportacao"> | string | null
    cidade_importador?: StringNullableWithAggregatesFilter<"ImportadorQuandoExportacao"> | string | null
    estado_provincia_importador?: StringNullableWithAggregatesFilter<"ImportadorQuandoExportacao"> | string | null
    pais_importador?: StringWithAggregatesFilter<"ImportadorQuandoExportacao"> | string
    zipcode_importador?: StringNullableWithAggregatesFilter<"ImportadorQuandoExportacao"> | string | null
    criado_em_importador?: DateTimeWithAggregatesFilter<"ImportadorQuandoExportacao"> | Date | string
    atualizado_em_importador?: DateTimeWithAggregatesFilter<"ImportadorQuandoExportacao"> | Date | string
  }

  export type EmpresaCreateInput = {
    suid_empresa: string
    id_organizacao_empresa: string
    id_produto_empresa?: string | null
    id_usuario_empresa?: string | null
    nome_empresa: string
    cnpj_empresa?: string | null
    tin_empresa?: string | null
    pais_empresa: string
    estado_empresa?: string | null
    cidade_empresa?: string | null
    endereco_empresa?: string | null
    zipcode_empresa?: string | null
    email_empresa?: string | null
    telefone_empresa?: string | null
    whatsapp_empresa?: string | null
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
  }

  export type EmpresaUncheckedCreateInput = {
    suid_empresa: string
    id_organizacao_empresa: string
    id_produto_empresa?: string | null
    id_usuario_empresa?: string | null
    nome_empresa: string
    cnpj_empresa?: string | null
    tin_empresa?: string | null
    pais_empresa: string
    estado_empresa?: string | null
    cidade_empresa?: string | null
    endereco_empresa?: string | null
    zipcode_empresa?: string | null
    email_empresa?: string | null
    telefone_empresa?: string | null
    whatsapp_empresa?: string | null
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
  }

  export type EmpresaUpdateInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao_empresa?: StringFieldUpdateOperationsInput | string
    id_produto_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    nome_empresa?: StringFieldUpdateOperationsInput | string
    cnpj_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    tin_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pais_empresa?: StringFieldUpdateOperationsInput | string
    estado_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    zipcode_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmpresaUncheckedUpdateInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao_empresa?: StringFieldUpdateOperationsInput | string
    id_produto_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    nome_empresa?: StringFieldUpdateOperationsInput | string
    cnpj_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    tin_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pais_empresa?: StringFieldUpdateOperationsInput | string
    estado_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    zipcode_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmpresaCreateManyInput = {
    suid_empresa: string
    id_organizacao_empresa: string
    id_produto_empresa?: string | null
    id_usuario_empresa?: string | null
    nome_empresa: string
    cnpj_empresa?: string | null
    tin_empresa?: string | null
    pais_empresa: string
    estado_empresa?: string | null
    cidade_empresa?: string | null
    endereco_empresa?: string | null
    zipcode_empresa?: string | null
    email_empresa?: string | null
    telefone_empresa?: string | null
    whatsapp_empresa?: string | null
    pode_ser_importador_empresa?: boolean
    pode_ser_exportador_empresa?: boolean
    pode_ser_fabricante_empresa?: boolean
    pode_ser_agente_empresa?: boolean
    pode_ser_despachante_empresa?: boolean
    pode_ser_armador_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
  }

  export type EmpresaUpdateManyMutationInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao_empresa?: StringFieldUpdateOperationsInput | string
    id_produto_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    nome_empresa?: StringFieldUpdateOperationsInput | string
    cnpj_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    tin_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pais_empresa?: StringFieldUpdateOperationsInput | string
    estado_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    zipcode_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmpresaUncheckedUpdateManyInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao_empresa?: StringFieldUpdateOperationsInput | string
    id_produto_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    nome_empresa?: StringFieldUpdateOperationsInput | string
    cnpj_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    tin_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pais_empresa?: StringFieldUpdateOperationsInput | string
    estado_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    endereco_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    zipcode_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    email_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    telefone_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    whatsapp_empresa?: NullableStringFieldUpdateOperationsInput | string | null
    pode_ser_importador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_exportador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_fabricante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_agente_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_despachante_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armador_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type ExportadorQuandoImportacaoCreateInput = {
    id_exportador?: string
    id_organizacao_exportador: string
    id_workspace_exportador: string
    nome_exportador: string
    endereco_exportador?: string | null
    cidade_exportador?: string | null
    estado_provincia_exportador?: string | null
    pais_exportador: string
    zipcode_exportador?: string | null
    criado_em_exportador?: Date | string
    atualizado_em_exportador?: Date | string
  }

  export type ExportadorQuandoImportacaoUncheckedCreateInput = {
    id_exportador?: string
    id_organizacao_exportador: string
    id_workspace_exportador: string
    nome_exportador: string
    endereco_exportador?: string | null
    cidade_exportador?: string | null
    estado_provincia_exportador?: string | null
    pais_exportador: string
    zipcode_exportador?: string | null
    criado_em_exportador?: Date | string
    atualizado_em_exportador?: Date | string
  }

  export type ExportadorQuandoImportacaoUpdateInput = {
    id_exportador?: StringFieldUpdateOperationsInput | string
    id_organizacao_exportador?: StringFieldUpdateOperationsInput | string
    id_workspace_exportador?: StringFieldUpdateOperationsInput | string
    nome_exportador?: StringFieldUpdateOperationsInput | string
    endereco_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_exportador?: StringFieldUpdateOperationsInput | string
    zipcode_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportadorQuandoImportacaoUncheckedUpdateInput = {
    id_exportador?: StringFieldUpdateOperationsInput | string
    id_organizacao_exportador?: StringFieldUpdateOperationsInput | string
    id_workspace_exportador?: StringFieldUpdateOperationsInput | string
    nome_exportador?: StringFieldUpdateOperationsInput | string
    endereco_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_exportador?: StringFieldUpdateOperationsInput | string
    zipcode_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportadorQuandoImportacaoCreateManyInput = {
    id_exportador?: string
    id_organizacao_exportador: string
    id_workspace_exportador: string
    nome_exportador: string
    endereco_exportador?: string | null
    cidade_exportador?: string | null
    estado_provincia_exportador?: string | null
    pais_exportador: string
    zipcode_exportador?: string | null
    criado_em_exportador?: Date | string
    atualizado_em_exportador?: Date | string
  }

  export type ExportadorQuandoImportacaoUpdateManyMutationInput = {
    id_exportador?: StringFieldUpdateOperationsInput | string
    id_organizacao_exportador?: StringFieldUpdateOperationsInput | string
    id_workspace_exportador?: StringFieldUpdateOperationsInput | string
    nome_exportador?: StringFieldUpdateOperationsInput | string
    endereco_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_exportador?: StringFieldUpdateOperationsInput | string
    zipcode_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExportadorQuandoImportacaoUncheckedUpdateManyInput = {
    id_exportador?: StringFieldUpdateOperationsInput | string
    id_organizacao_exportador?: StringFieldUpdateOperationsInput | string
    id_workspace_exportador?: StringFieldUpdateOperationsInput | string
    nome_exportador?: StringFieldUpdateOperationsInput | string
    endereco_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_exportador?: StringFieldUpdateOperationsInput | string
    zipcode_exportador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_exportador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportadorQuandoExportacaoCreateInput = {
    id_importador?: string
    id_organizacao_importador: string
    id_workspace_importador: string
    nome_importador: string
    endereco_importador?: string | null
    cidade_importador?: string | null
    estado_provincia_importador?: string | null
    pais_importador: string
    zipcode_importador?: string | null
    criado_em_importador?: Date | string
    atualizado_em_importador?: Date | string
  }

  export type ImportadorQuandoExportacaoUncheckedCreateInput = {
    id_importador?: string
    id_organizacao_importador: string
    id_workspace_importador: string
    nome_importador: string
    endereco_importador?: string | null
    cidade_importador?: string | null
    estado_provincia_importador?: string | null
    pais_importador: string
    zipcode_importador?: string | null
    criado_em_importador?: Date | string
    atualizado_em_importador?: Date | string
  }

  export type ImportadorQuandoExportacaoUpdateInput = {
    id_importador?: StringFieldUpdateOperationsInput | string
    id_organizacao_importador?: StringFieldUpdateOperationsInput | string
    id_workspace_importador?: StringFieldUpdateOperationsInput | string
    nome_importador?: StringFieldUpdateOperationsInput | string
    endereco_importador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_importador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_importador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_importador?: StringFieldUpdateOperationsInput | string
    zipcode_importador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportadorQuandoExportacaoUncheckedUpdateInput = {
    id_importador?: StringFieldUpdateOperationsInput | string
    id_organizacao_importador?: StringFieldUpdateOperationsInput | string
    id_workspace_importador?: StringFieldUpdateOperationsInput | string
    nome_importador?: StringFieldUpdateOperationsInput | string
    endereco_importador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_importador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_importador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_importador?: StringFieldUpdateOperationsInput | string
    zipcode_importador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportadorQuandoExportacaoCreateManyInput = {
    id_importador?: string
    id_organizacao_importador: string
    id_workspace_importador: string
    nome_importador: string
    endereco_importador?: string | null
    cidade_importador?: string | null
    estado_provincia_importador?: string | null
    pais_importador: string
    zipcode_importador?: string | null
    criado_em_importador?: Date | string
    atualizado_em_importador?: Date | string
  }

  export type ImportadorQuandoExportacaoUpdateManyMutationInput = {
    id_importador?: StringFieldUpdateOperationsInput | string
    id_organizacao_importador?: StringFieldUpdateOperationsInput | string
    id_workspace_importador?: StringFieldUpdateOperationsInput | string
    nome_importador?: StringFieldUpdateOperationsInput | string
    endereco_importador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_importador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_importador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_importador?: StringFieldUpdateOperationsInput | string
    zipcode_importador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ImportadorQuandoExportacaoUncheckedUpdateManyInput = {
    id_importador?: StringFieldUpdateOperationsInput | string
    id_organizacao_importador?: StringFieldUpdateOperationsInput | string
    id_workspace_importador?: StringFieldUpdateOperationsInput | string
    nome_importador?: StringFieldUpdateOperationsInput | string
    endereco_importador?: NullableStringFieldUpdateOperationsInput | string | null
    cidade_importador?: NullableStringFieldUpdateOperationsInput | string | null
    estado_provincia_importador?: NullableStringFieldUpdateOperationsInput | string | null
    pais_importador?: StringFieldUpdateOperationsInput | string
    zipcode_importador?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_importador?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type EmpresaId_organizacao_empresaCnpj_empresaCompoundUniqueInput = {
    id_organizacao_empresa: string
    cnpj_empresa: string
  }

  export type EmpresaId_organizacao_empresaTin_empresaPais_empresaCompoundUniqueInput = {
    id_organizacao_empresa: string
    tin_empresa: string
    pais_empresa: string
  }

  export type EmpresaCountOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao_empresa?: SortOrder
    id_produto_empresa?: SortOrder
    id_usuario_empresa?: SortOrder
    nome_empresa?: SortOrder
    cnpj_empresa?: SortOrder
    tin_empresa?: SortOrder
    pais_empresa?: SortOrder
    estado_empresa?: SortOrder
    cidade_empresa?: SortOrder
    endereco_empresa?: SortOrder
    zipcode_empresa?: SortOrder
    email_empresa?: SortOrder
    telefone_empresa?: SortOrder
    whatsapp_empresa?: SortOrder
    pode_ser_importador_empresa?: SortOrder
    pode_ser_exportador_empresa?: SortOrder
    pode_ser_fabricante_empresa?: SortOrder
    pode_ser_agente_empresa?: SortOrder
    pode_ser_despachante_empresa?: SortOrder
    pode_ser_armador_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
  }

  export type EmpresaMaxOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao_empresa?: SortOrder
    id_produto_empresa?: SortOrder
    id_usuario_empresa?: SortOrder
    nome_empresa?: SortOrder
    cnpj_empresa?: SortOrder
    tin_empresa?: SortOrder
    pais_empresa?: SortOrder
    estado_empresa?: SortOrder
    cidade_empresa?: SortOrder
    endereco_empresa?: SortOrder
    zipcode_empresa?: SortOrder
    email_empresa?: SortOrder
    telefone_empresa?: SortOrder
    whatsapp_empresa?: SortOrder
    pode_ser_importador_empresa?: SortOrder
    pode_ser_exportador_empresa?: SortOrder
    pode_ser_fabricante_empresa?: SortOrder
    pode_ser_agente_empresa?: SortOrder
    pode_ser_despachante_empresa?: SortOrder
    pode_ser_armador_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
  }

  export type EmpresaMinOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao_empresa?: SortOrder
    id_produto_empresa?: SortOrder
    id_usuario_empresa?: SortOrder
    nome_empresa?: SortOrder
    cnpj_empresa?: SortOrder
    tin_empresa?: SortOrder
    pais_empresa?: SortOrder
    estado_empresa?: SortOrder
    cidade_empresa?: SortOrder
    endereco_empresa?: SortOrder
    zipcode_empresa?: SortOrder
    email_empresa?: SortOrder
    telefone_empresa?: SortOrder
    whatsapp_empresa?: SortOrder
    pode_ser_importador_empresa?: SortOrder
    pode_ser_exportador_empresa?: SortOrder
    pode_ser_fabricante_empresa?: SortOrder
    pode_ser_agente_empresa?: SortOrder
    pode_ser_despachante_empresa?: SortOrder
    pode_ser_armador_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
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

  export type ExportadorQuandoImportacaoCountOrderByAggregateInput = {
    id_exportador?: SortOrder
    id_organizacao_exportador?: SortOrder
    id_workspace_exportador?: SortOrder
    nome_exportador?: SortOrder
    endereco_exportador?: SortOrder
    cidade_exportador?: SortOrder
    estado_provincia_exportador?: SortOrder
    pais_exportador?: SortOrder
    zipcode_exportador?: SortOrder
    criado_em_exportador?: SortOrder
    atualizado_em_exportador?: SortOrder
  }

  export type ExportadorQuandoImportacaoMaxOrderByAggregateInput = {
    id_exportador?: SortOrder
    id_organizacao_exportador?: SortOrder
    id_workspace_exportador?: SortOrder
    nome_exportador?: SortOrder
    endereco_exportador?: SortOrder
    cidade_exportador?: SortOrder
    estado_provincia_exportador?: SortOrder
    pais_exportador?: SortOrder
    zipcode_exportador?: SortOrder
    criado_em_exportador?: SortOrder
    atualizado_em_exportador?: SortOrder
  }

  export type ExportadorQuandoImportacaoMinOrderByAggregateInput = {
    id_exportador?: SortOrder
    id_organizacao_exportador?: SortOrder
    id_workspace_exportador?: SortOrder
    nome_exportador?: SortOrder
    endereco_exportador?: SortOrder
    cidade_exportador?: SortOrder
    estado_provincia_exportador?: SortOrder
    pais_exportador?: SortOrder
    zipcode_exportador?: SortOrder
    criado_em_exportador?: SortOrder
    atualizado_em_exportador?: SortOrder
  }

  export type ImportadorQuandoExportacaoCountOrderByAggregateInput = {
    id_importador?: SortOrder
    id_organizacao_importador?: SortOrder
    id_workspace_importador?: SortOrder
    nome_importador?: SortOrder
    endereco_importador?: SortOrder
    cidade_importador?: SortOrder
    estado_provincia_importador?: SortOrder
    pais_importador?: SortOrder
    zipcode_importador?: SortOrder
    criado_em_importador?: SortOrder
    atualizado_em_importador?: SortOrder
  }

  export type ImportadorQuandoExportacaoMaxOrderByAggregateInput = {
    id_importador?: SortOrder
    id_organizacao_importador?: SortOrder
    id_workspace_importador?: SortOrder
    nome_importador?: SortOrder
    endereco_importador?: SortOrder
    cidade_importador?: SortOrder
    estado_provincia_importador?: SortOrder
    pais_importador?: SortOrder
    zipcode_importador?: SortOrder
    criado_em_importador?: SortOrder
    atualizado_em_importador?: SortOrder
  }

  export type ImportadorQuandoExportacaoMinOrderByAggregateInput = {
    id_importador?: SortOrder
    id_organizacao_importador?: SortOrder
    id_workspace_importador?: SortOrder
    nome_importador?: SortOrder
    endereco_importador?: SortOrder
    cidade_importador?: SortOrder
    estado_provincia_importador?: SortOrder
    pais_importador?: SortOrder
    zipcode_importador?: SortOrder
    criado_em_importador?: SortOrder
    atualizado_em_importador?: SortOrder
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

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use EmpresaDefaultArgs instead
     */
    export type EmpresaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmpresaDefaultArgs<ExtArgs>
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
     * @deprecated Use ExportadorQuandoImportacaoDefaultArgs instead
     */
    export type ExportadorQuandoImportacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExportadorQuandoImportacaoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ImportadorQuandoExportacaoDefaultArgs instead
     */
    export type ImportadorQuandoExportacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ImportadorQuandoExportacaoDefaultArgs<ExtArgs>

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