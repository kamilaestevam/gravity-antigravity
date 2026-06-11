
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
 * Model Processo
 * 
 */
export type Processo = $Result.DefaultSelection<Prisma.$ProcessoPayload>
/**
 * Model ProcessoStatus
 * 
 */
export type ProcessoStatus = $Result.DefaultSelection<Prisma.$ProcessoStatusPayload>
/**
 * Model HistoricoStatusProcesso
 * 
 */
export type HistoricoStatusProcesso = $Result.DefaultSelection<Prisma.$HistoricoStatusProcessoPayload>
/**
 * Model LogisticaInternacionalProcesso
 * 
 */
export type LogisticaInternacionalProcesso = $Result.DefaultSelection<Prisma.$LogisticaInternacionalProcessoPayload>
/**
 * Model DadosProcesso
 * 
 */
export type DadosProcesso = $Result.DefaultSelection<Prisma.$DadosProcessoPayload>
/**
 * Model CambioProcesso
 * 
 */
export type CambioProcesso = $Result.DefaultSelection<Prisma.$CambioProcessoPayload>
/**
 * Model EstimativaProcesso
 * 
 */
export type EstimativaProcesso = $Result.DefaultSelection<Prisma.$EstimativaProcessoPayload>
/**
 * Model DocumentoProcesso
 * 
 */
export type DocumentoProcesso = $Result.DefaultSelection<Prisma.$DocumentoProcessoPayload>
/**
 * Model ContainerProcesso
 * 
 */
export type ContainerProcesso = $Result.DefaultSelection<Prisma.$ContainerProcessoPayload>
/**
 * Model FollowUpProcesso
 * 
 */
export type FollowUpProcesso = $Result.DefaultSelection<Prisma.$FollowUpProcessoPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Processos
 * const processos = await prisma.processo.findMany()
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
   * // Fetch zero or more Processos
   * const processos = await prisma.processo.findMany()
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
   * `prisma.processo`: Exposes CRUD operations for the **Processo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Processos
    * const processos = await prisma.processo.findMany()
    * ```
    */
  get processo(): Prisma.ProcessoDelegate<ExtArgs>;

  /**
   * `prisma.processoStatus`: Exposes CRUD operations for the **ProcessoStatus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoStatuses
    * const processoStatuses = await prisma.processoStatus.findMany()
    * ```
    */
  get processoStatus(): Prisma.ProcessoStatusDelegate<ExtArgs>;

  /**
   * `prisma.historicoStatusProcesso`: Exposes CRUD operations for the **HistoricoStatusProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HistoricoStatusProcessos
    * const historicoStatusProcessos = await prisma.historicoStatusProcesso.findMany()
    * ```
    */
  get historicoStatusProcesso(): Prisma.HistoricoStatusProcessoDelegate<ExtArgs>;

  /**
   * `prisma.logisticaInternacionalProcesso`: Exposes CRUD operations for the **LogisticaInternacionalProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LogisticaInternacionalProcessos
    * const logisticaInternacionalProcessos = await prisma.logisticaInternacionalProcesso.findMany()
    * ```
    */
  get logisticaInternacionalProcesso(): Prisma.LogisticaInternacionalProcessoDelegate<ExtArgs>;

  /**
   * `prisma.dadosProcesso`: Exposes CRUD operations for the **DadosProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DadosProcessos
    * const dadosProcessos = await prisma.dadosProcesso.findMany()
    * ```
    */
  get dadosProcesso(): Prisma.DadosProcessoDelegate<ExtArgs>;

  /**
   * `prisma.cambioProcesso`: Exposes CRUD operations for the **CambioProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CambioProcessos
    * const cambioProcessos = await prisma.cambioProcesso.findMany()
    * ```
    */
  get cambioProcesso(): Prisma.CambioProcessoDelegate<ExtArgs>;

  /**
   * `prisma.estimativaProcesso`: Exposes CRUD operations for the **EstimativaProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EstimativaProcessos
    * const estimativaProcessos = await prisma.estimativaProcesso.findMany()
    * ```
    */
  get estimativaProcesso(): Prisma.EstimativaProcessoDelegate<ExtArgs>;

  /**
   * `prisma.documentoProcesso`: Exposes CRUD operations for the **DocumentoProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DocumentoProcessos
    * const documentoProcessos = await prisma.documentoProcesso.findMany()
    * ```
    */
  get documentoProcesso(): Prisma.DocumentoProcessoDelegate<ExtArgs>;

  /**
   * `prisma.containerProcesso`: Exposes CRUD operations for the **ContainerProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContainerProcessos
    * const containerProcessos = await prisma.containerProcesso.findMany()
    * ```
    */
  get containerProcesso(): Prisma.ContainerProcessoDelegate<ExtArgs>;

  /**
   * `prisma.followUpProcesso`: Exposes CRUD operations for the **FollowUpProcesso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FollowUpProcessos
    * const followUpProcessos = await prisma.followUpProcesso.findMany()
    * ```
    */
  get followUpProcesso(): Prisma.FollowUpProcessoDelegate<ExtArgs>;
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
    Processo: 'Processo',
    ProcessoStatus: 'ProcessoStatus',
    HistoricoStatusProcesso: 'HistoricoStatusProcesso',
    LogisticaInternacionalProcesso: 'LogisticaInternacionalProcesso',
    DadosProcesso: 'DadosProcesso',
    CambioProcesso: 'CambioProcesso',
    EstimativaProcesso: 'EstimativaProcesso',
    DocumentoProcesso: 'DocumentoProcesso',
    ContainerProcesso: 'ContainerProcesso',
    FollowUpProcesso: 'FollowUpProcesso'
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
      modelProps: "processo" | "processoStatus" | "historicoStatusProcesso" | "logisticaInternacionalProcesso" | "dadosProcesso" | "cambioProcesso" | "estimativaProcesso" | "documentoProcesso" | "containerProcesso" | "followUpProcesso"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Processo: {
        payload: Prisma.$ProcessoPayload<ExtArgs>
        fields: Prisma.ProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          findFirst: {
            args: Prisma.ProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          findMany: {
            args: Prisma.ProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>[]
          }
          create: {
            args: Prisma.ProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          createMany: {
            args: Prisma.ProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>[]
          }
          delete: {
            args: Prisma.ProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          update: {
            args: Prisma.ProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          aggregate: {
            args: Prisma.ProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcesso>
          }
          groupBy: {
            args: Prisma.ProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoCountAggregateOutputType> | number
          }
        }
      }
      ProcessoStatus: {
        payload: Prisma.$ProcessoStatusPayload<ExtArgs>
        fields: Prisma.ProcessoStatusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoStatusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoStatusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          findFirst: {
            args: Prisma.ProcessoStatusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoStatusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          findMany: {
            args: Prisma.ProcessoStatusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>[]
          }
          create: {
            args: Prisma.ProcessoStatusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          createMany: {
            args: Prisma.ProcessoStatusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoStatusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>[]
          }
          delete: {
            args: Prisma.ProcessoStatusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          update: {
            args: Prisma.ProcessoStatusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoStatusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoStatusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoStatusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoStatusPayload>
          }
          aggregate: {
            args: Prisma.ProcessoStatusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoStatus>
          }
          groupBy: {
            args: Prisma.ProcessoStatusGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoStatusGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoStatusCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoStatusCountAggregateOutputType> | number
          }
        }
      }
      HistoricoStatusProcesso: {
        payload: Prisma.$HistoricoStatusProcessoPayload<ExtArgs>
        fields: Prisma.HistoricoStatusProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HistoricoStatusProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HistoricoStatusProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          findFirst: {
            args: Prisma.HistoricoStatusProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HistoricoStatusProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          findMany: {
            args: Prisma.HistoricoStatusProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>[]
          }
          create: {
            args: Prisma.HistoricoStatusProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          createMany: {
            args: Prisma.HistoricoStatusProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HistoricoStatusProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>[]
          }
          delete: {
            args: Prisma.HistoricoStatusProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          update: {
            args: Prisma.HistoricoStatusProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          deleteMany: {
            args: Prisma.HistoricoStatusProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HistoricoStatusProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.HistoricoStatusProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistoricoStatusProcessoPayload>
          }
          aggregate: {
            args: Prisma.HistoricoStatusProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHistoricoStatusProcesso>
          }
          groupBy: {
            args: Prisma.HistoricoStatusProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<HistoricoStatusProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.HistoricoStatusProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<HistoricoStatusProcessoCountAggregateOutputType> | number
          }
        }
      }
      LogisticaInternacionalProcesso: {
        payload: Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>
        fields: Prisma.LogisticaInternacionalProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LogisticaInternacionalProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LogisticaInternacionalProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          findFirst: {
            args: Prisma.LogisticaInternacionalProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LogisticaInternacionalProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          findMany: {
            args: Prisma.LogisticaInternacionalProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>[]
          }
          create: {
            args: Prisma.LogisticaInternacionalProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          createMany: {
            args: Prisma.LogisticaInternacionalProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LogisticaInternacionalProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>[]
          }
          delete: {
            args: Prisma.LogisticaInternacionalProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          update: {
            args: Prisma.LogisticaInternacionalProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          deleteMany: {
            args: Prisma.LogisticaInternacionalProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LogisticaInternacionalProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LogisticaInternacionalProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogisticaInternacionalProcessoPayload>
          }
          aggregate: {
            args: Prisma.LogisticaInternacionalProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLogisticaInternacionalProcesso>
          }
          groupBy: {
            args: Prisma.LogisticaInternacionalProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<LogisticaInternacionalProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.LogisticaInternacionalProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<LogisticaInternacionalProcessoCountAggregateOutputType> | number
          }
        }
      }
      DadosProcesso: {
        payload: Prisma.$DadosProcessoPayload<ExtArgs>
        fields: Prisma.DadosProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DadosProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DadosProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          findFirst: {
            args: Prisma.DadosProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DadosProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          findMany: {
            args: Prisma.DadosProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>[]
          }
          create: {
            args: Prisma.DadosProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          createMany: {
            args: Prisma.DadosProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DadosProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>[]
          }
          delete: {
            args: Prisma.DadosProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          update: {
            args: Prisma.DadosProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          deleteMany: {
            args: Prisma.DadosProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DadosProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DadosProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosProcessoPayload>
          }
          aggregate: {
            args: Prisma.DadosProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDadosProcesso>
          }
          groupBy: {
            args: Prisma.DadosProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DadosProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DadosProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<DadosProcessoCountAggregateOutputType> | number
          }
        }
      }
      CambioProcesso: {
        payload: Prisma.$CambioProcessoPayload<ExtArgs>
        fields: Prisma.CambioProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CambioProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CambioProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          findFirst: {
            args: Prisma.CambioProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CambioProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          findMany: {
            args: Prisma.CambioProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>[]
          }
          create: {
            args: Prisma.CambioProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          createMany: {
            args: Prisma.CambioProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CambioProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>[]
          }
          delete: {
            args: Prisma.CambioProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          update: {
            args: Prisma.CambioProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          deleteMany: {
            args: Prisma.CambioProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CambioProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CambioProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CambioProcessoPayload>
          }
          aggregate: {
            args: Prisma.CambioProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCambioProcesso>
          }
          groupBy: {
            args: Prisma.CambioProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<CambioProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.CambioProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<CambioProcessoCountAggregateOutputType> | number
          }
        }
      }
      EstimativaProcesso: {
        payload: Prisma.$EstimativaProcessoPayload<ExtArgs>
        fields: Prisma.EstimativaProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EstimativaProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EstimativaProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          findFirst: {
            args: Prisma.EstimativaProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EstimativaProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          findMany: {
            args: Prisma.EstimativaProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>[]
          }
          create: {
            args: Prisma.EstimativaProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          createMany: {
            args: Prisma.EstimativaProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EstimativaProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>[]
          }
          delete: {
            args: Prisma.EstimativaProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          update: {
            args: Prisma.EstimativaProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          deleteMany: {
            args: Prisma.EstimativaProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EstimativaProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EstimativaProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaProcessoPayload>
          }
          aggregate: {
            args: Prisma.EstimativaProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEstimativaProcesso>
          }
          groupBy: {
            args: Prisma.EstimativaProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EstimativaProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.EstimativaProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<EstimativaProcessoCountAggregateOutputType> | number
          }
        }
      }
      DocumentoProcesso: {
        payload: Prisma.$DocumentoProcessoPayload<ExtArgs>
        fields: Prisma.DocumentoProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentoProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentoProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          findFirst: {
            args: Prisma.DocumentoProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentoProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          findMany: {
            args: Prisma.DocumentoProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>[]
          }
          create: {
            args: Prisma.DocumentoProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          createMany: {
            args: Prisma.DocumentoProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentoProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>[]
          }
          delete: {
            args: Prisma.DocumentoProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          update: {
            args: Prisma.DocumentoProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          deleteMany: {
            args: Prisma.DocumentoProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentoProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentoProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoProcessoPayload>
          }
          aggregate: {
            args: Prisma.DocumentoProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumentoProcesso>
          }
          groupBy: {
            args: Prisma.DocumentoProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentoProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentoProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentoProcessoCountAggregateOutputType> | number
          }
        }
      }
      ContainerProcesso: {
        payload: Prisma.$ContainerProcessoPayload<ExtArgs>
        fields: Prisma.ContainerProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContainerProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContainerProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          findFirst: {
            args: Prisma.ContainerProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContainerProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          findMany: {
            args: Prisma.ContainerProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>[]
          }
          create: {
            args: Prisma.ContainerProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          createMany: {
            args: Prisma.ContainerProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContainerProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>[]
          }
          delete: {
            args: Prisma.ContainerProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          update: {
            args: Prisma.ContainerProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          deleteMany: {
            args: Prisma.ContainerProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContainerProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ContainerProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContainerProcessoPayload>
          }
          aggregate: {
            args: Prisma.ContainerProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContainerProcesso>
          }
          groupBy: {
            args: Prisma.ContainerProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContainerProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContainerProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<ContainerProcessoCountAggregateOutputType> | number
          }
        }
      }
      FollowUpProcesso: {
        payload: Prisma.$FollowUpProcessoPayload<ExtArgs>
        fields: Prisma.FollowUpProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FollowUpProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FollowUpProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          findFirst: {
            args: Prisma.FollowUpProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FollowUpProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          findMany: {
            args: Prisma.FollowUpProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>[]
          }
          create: {
            args: Prisma.FollowUpProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          createMany: {
            args: Prisma.FollowUpProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FollowUpProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>[]
          }
          delete: {
            args: Prisma.FollowUpProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          update: {
            args: Prisma.FollowUpProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          deleteMany: {
            args: Prisma.FollowUpProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FollowUpProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FollowUpProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpProcessoPayload>
          }
          aggregate: {
            args: Prisma.FollowUpProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFollowUpProcesso>
          }
          groupBy: {
            args: Prisma.FollowUpProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<FollowUpProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.FollowUpProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<FollowUpProcessoCountAggregateOutputType> | number
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
   * Count Type ProcessoCountOutputType
   */

  export type ProcessoCountOutputType = {
    historico_status: number
    containers: number
    documentos: number
    follow_ups: number
  }

  export type ProcessoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    historico_status?: boolean | ProcessoCountOutputTypeCountHistorico_statusArgs
    containers?: boolean | ProcessoCountOutputTypeCountContainersArgs
    documentos?: boolean | ProcessoCountOutputTypeCountDocumentosArgs
    follow_ups?: boolean | ProcessoCountOutputTypeCountFollow_upsArgs
  }

  // Custom InputTypes
  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoCountOutputType
     */
    select?: ProcessoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountHistorico_statusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistoricoStatusProcessoWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountContainersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContainerProcessoWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoProcessoWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountFollow_upsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowUpProcessoWhereInput
  }


  /**
   * Count Type ProcessoStatusCountOutputType
   */

  export type ProcessoStatusCountOutputType = {
    processos: number
    historico_anterior: number
    historico_novo: number
  }

  export type ProcessoStatusCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processos?: boolean | ProcessoStatusCountOutputTypeCountProcessosArgs
    historico_anterior?: boolean | ProcessoStatusCountOutputTypeCountHistorico_anteriorArgs
    historico_novo?: boolean | ProcessoStatusCountOutputTypeCountHistorico_novoArgs
  }

  // Custom InputTypes
  /**
   * ProcessoStatusCountOutputType without action
   */
  export type ProcessoStatusCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatusCountOutputType
     */
    select?: ProcessoStatusCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProcessoStatusCountOutputType without action
   */
  export type ProcessoStatusCountOutputTypeCountProcessosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoWhereInput
  }

  /**
   * ProcessoStatusCountOutputType without action
   */
  export type ProcessoStatusCountOutputTypeCountHistorico_anteriorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistoricoStatusProcessoWhereInput
  }

  /**
   * ProcessoStatusCountOutputType without action
   */
  export type ProcessoStatusCountOutputTypeCountHistorico_novoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistoricoStatusProcessoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Processo
   */

  export type AggregateProcesso = {
    _count: ProcessoCountAggregateOutputType | null
    _min: ProcessoMinAggregateOutputType | null
    _max: ProcessoMaxAggregateOutputType | null
  }

  export type ProcessoMinAggregateOutputType = {
    id_processo: string | null
    id_organizacao: string | null
    id_workspace: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    numero_processo: string | null
    tipo_operacao_processo: string | null
    referencia_interna_processo: string | null
    referencia_importador_processo: string | null
    referencia_exportador_processo: string | null
    id_status_atual_processo: string | null
    id_importacao_exportador_processo: string | null
    id_exportacao_importador_processo: string | null
    id_cotacao_bid_frete_internacional: string | null
    id_proposta_bid_frete_internacional: string | null
    id_transito_processo: string | null
    id_operacao_cambio_processo: string | null
    id_responsavel_processo: string | null
    responsavel_rotina_processo: string | null
    setor_responsavel_processo: string | null
    vendedor_responsavel_processo: string | null
    data_criacao_processo: Date | null
    data_atualizacao_processo: Date | null
  }

  export type ProcessoMaxAggregateOutputType = {
    id_processo: string | null
    id_organizacao: string | null
    id_workspace: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    numero_processo: string | null
    tipo_operacao_processo: string | null
    referencia_interna_processo: string | null
    referencia_importador_processo: string | null
    referencia_exportador_processo: string | null
    id_status_atual_processo: string | null
    id_importacao_exportador_processo: string | null
    id_exportacao_importador_processo: string | null
    id_cotacao_bid_frete_internacional: string | null
    id_proposta_bid_frete_internacional: string | null
    id_transito_processo: string | null
    id_operacao_cambio_processo: string | null
    id_responsavel_processo: string | null
    responsavel_rotina_processo: string | null
    setor_responsavel_processo: string | null
    vendedor_responsavel_processo: string | null
    data_criacao_processo: Date | null
    data_atualizacao_processo: Date | null
  }

  export type ProcessoCountAggregateOutputType = {
    id_processo: number
    id_organizacao: number
    id_workspace: number
    id_produto_gravity: number
    id_usuario: number
    numero_processo: number
    tipo_operacao_processo: number
    referencia_interna_processo: number
    referencia_importador_processo: number
    referencia_exportador_processo: number
    id_status_atual_processo: number
    id_importacao_exportador_processo: number
    id_exportacao_importador_processo: number
    id_cotacao_bid_frete_internacional: number
    id_proposta_bid_frete_internacional: number
    id_transito_processo: number
    id_operacao_cambio_processo: number
    id_responsavel_processo: number
    responsavel_rotina_processo: number
    setor_responsavel_processo: number
    vendedor_responsavel_processo: number
    data_criacao_processo: number
    data_atualizacao_processo: number
    _all: number
  }


  export type ProcessoMinAggregateInputType = {
    id_processo?: true
    id_organizacao?: true
    id_workspace?: true
    id_produto_gravity?: true
    id_usuario?: true
    numero_processo?: true
    tipo_operacao_processo?: true
    referencia_interna_processo?: true
    referencia_importador_processo?: true
    referencia_exportador_processo?: true
    id_status_atual_processo?: true
    id_importacao_exportador_processo?: true
    id_exportacao_importador_processo?: true
    id_cotacao_bid_frete_internacional?: true
    id_proposta_bid_frete_internacional?: true
    id_transito_processo?: true
    id_operacao_cambio_processo?: true
    id_responsavel_processo?: true
    responsavel_rotina_processo?: true
    setor_responsavel_processo?: true
    vendedor_responsavel_processo?: true
    data_criacao_processo?: true
    data_atualizacao_processo?: true
  }

  export type ProcessoMaxAggregateInputType = {
    id_processo?: true
    id_organizacao?: true
    id_workspace?: true
    id_produto_gravity?: true
    id_usuario?: true
    numero_processo?: true
    tipo_operacao_processo?: true
    referencia_interna_processo?: true
    referencia_importador_processo?: true
    referencia_exportador_processo?: true
    id_status_atual_processo?: true
    id_importacao_exportador_processo?: true
    id_exportacao_importador_processo?: true
    id_cotacao_bid_frete_internacional?: true
    id_proposta_bid_frete_internacional?: true
    id_transito_processo?: true
    id_operacao_cambio_processo?: true
    id_responsavel_processo?: true
    responsavel_rotina_processo?: true
    setor_responsavel_processo?: true
    vendedor_responsavel_processo?: true
    data_criacao_processo?: true
    data_atualizacao_processo?: true
  }

  export type ProcessoCountAggregateInputType = {
    id_processo?: true
    id_organizacao?: true
    id_workspace?: true
    id_produto_gravity?: true
    id_usuario?: true
    numero_processo?: true
    tipo_operacao_processo?: true
    referencia_interna_processo?: true
    referencia_importador_processo?: true
    referencia_exportador_processo?: true
    id_status_atual_processo?: true
    id_importacao_exportador_processo?: true
    id_exportacao_importador_processo?: true
    id_cotacao_bid_frete_internacional?: true
    id_proposta_bid_frete_internacional?: true
    id_transito_processo?: true
    id_operacao_cambio_processo?: true
    id_responsavel_processo?: true
    responsavel_rotina_processo?: true
    setor_responsavel_processo?: true
    vendedor_responsavel_processo?: true
    data_criacao_processo?: true
    data_atualizacao_processo?: true
    _all?: true
  }

  export type ProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Processo to aggregate.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Processos
    **/
    _count?: true | ProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoMaxAggregateInputType
  }

  export type GetProcessoAggregateType<T extends ProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcesso[P]>
      : GetScalarType<T[P], AggregateProcesso[P]>
  }




  export type ProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoWhereInput
    orderBy?: ProcessoOrderByWithAggregationInput | ProcessoOrderByWithAggregationInput[]
    by: ProcessoScalarFieldEnum[] | ProcessoScalarFieldEnum
    having?: ProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoCountAggregateInputType | true
    _min?: ProcessoMinAggregateInputType
    _max?: ProcessoMaxAggregateInputType
  }

  export type ProcessoGroupByOutputType = {
    id_processo: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity: string | null
    id_usuario: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo: string | null
    referencia_importador_processo: string | null
    referencia_exportador_processo: string | null
    id_status_atual_processo: string | null
    id_importacao_exportador_processo: string | null
    id_exportacao_importador_processo: string | null
    id_cotacao_bid_frete_internacional: string | null
    id_proposta_bid_frete_internacional: string | null
    id_transito_processo: string | null
    id_operacao_cambio_processo: string | null
    id_responsavel_processo: string | null
    responsavel_rotina_processo: string | null
    setor_responsavel_processo: string | null
    vendedor_responsavel_processo: string | null
    data_criacao_processo: Date
    data_atualizacao_processo: Date
    _count: ProcessoCountAggregateOutputType | null
    _min: ProcessoMinAggregateOutputType | null
    _max: ProcessoMaxAggregateOutputType | null
  }

  type GetProcessoGroupByPayload<T extends ProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo?: boolean
    id_organizacao?: boolean
    id_workspace?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    numero_processo?: boolean
    tipo_operacao_processo?: boolean
    referencia_interna_processo?: boolean
    referencia_importador_processo?: boolean
    referencia_exportador_processo?: boolean
    id_status_atual_processo?: boolean
    id_importacao_exportador_processo?: boolean
    id_exportacao_importador_processo?: boolean
    id_cotacao_bid_frete_internacional?: boolean
    id_proposta_bid_frete_internacional?: boolean
    id_transito_processo?: boolean
    id_operacao_cambio_processo?: boolean
    id_responsavel_processo?: boolean
    responsavel_rotina_processo?: boolean
    setor_responsavel_processo?: boolean
    vendedor_responsavel_processo?: boolean
    data_criacao_processo?: boolean
    data_atualizacao_processo?: boolean
    status_atual?: boolean | Processo$status_atualArgs<ExtArgs>
    historico_status?: boolean | Processo$historico_statusArgs<ExtArgs>
    logistica?: boolean | Processo$logisticaArgs<ExtArgs>
    dados?: boolean | Processo$dadosArgs<ExtArgs>
    cambio?: boolean | Processo$cambioArgs<ExtArgs>
    estimativa?: boolean | Processo$estimativaArgs<ExtArgs>
    containers?: boolean | Processo$containersArgs<ExtArgs>
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    follow_ups?: boolean | Processo$follow_upsArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo?: boolean
    id_organizacao?: boolean
    id_workspace?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    numero_processo?: boolean
    tipo_operacao_processo?: boolean
    referencia_interna_processo?: boolean
    referencia_importador_processo?: boolean
    referencia_exportador_processo?: boolean
    id_status_atual_processo?: boolean
    id_importacao_exportador_processo?: boolean
    id_exportacao_importador_processo?: boolean
    id_cotacao_bid_frete_internacional?: boolean
    id_proposta_bid_frete_internacional?: boolean
    id_transito_processo?: boolean
    id_operacao_cambio_processo?: boolean
    id_responsavel_processo?: boolean
    responsavel_rotina_processo?: boolean
    setor_responsavel_processo?: boolean
    vendedor_responsavel_processo?: boolean
    data_criacao_processo?: boolean
    data_atualizacao_processo?: boolean
    status_atual?: boolean | Processo$status_atualArgs<ExtArgs>
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectScalar = {
    id_processo?: boolean
    id_organizacao?: boolean
    id_workspace?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    numero_processo?: boolean
    tipo_operacao_processo?: boolean
    referencia_interna_processo?: boolean
    referencia_importador_processo?: boolean
    referencia_exportador_processo?: boolean
    id_status_atual_processo?: boolean
    id_importacao_exportador_processo?: boolean
    id_exportacao_importador_processo?: boolean
    id_cotacao_bid_frete_internacional?: boolean
    id_proposta_bid_frete_internacional?: boolean
    id_transito_processo?: boolean
    id_operacao_cambio_processo?: boolean
    id_responsavel_processo?: boolean
    responsavel_rotina_processo?: boolean
    setor_responsavel_processo?: boolean
    vendedor_responsavel_processo?: boolean
    data_criacao_processo?: boolean
    data_atualizacao_processo?: boolean
  }

  export type ProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    status_atual?: boolean | Processo$status_atualArgs<ExtArgs>
    historico_status?: boolean | Processo$historico_statusArgs<ExtArgs>
    logistica?: boolean | Processo$logisticaArgs<ExtArgs>
    dados?: boolean | Processo$dadosArgs<ExtArgs>
    cambio?: boolean | Processo$cambioArgs<ExtArgs>
    estimativa?: boolean | Processo$estimativaArgs<ExtArgs>
    containers?: boolean | Processo$containersArgs<ExtArgs>
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    follow_ups?: boolean | Processo$follow_upsArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    status_atual?: boolean | Processo$status_atualArgs<ExtArgs>
  }

  export type $ProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Processo"
    objects: {
      status_atual: Prisma.$ProcessoStatusPayload<ExtArgs> | null
      historico_status: Prisma.$HistoricoStatusProcessoPayload<ExtArgs>[]
      logistica: Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs> | null
      dados: Prisma.$DadosProcessoPayload<ExtArgs> | null
      cambio: Prisma.$CambioProcessoPayload<ExtArgs> | null
      estimativa: Prisma.$EstimativaProcessoPayload<ExtArgs> | null
      containers: Prisma.$ContainerProcessoPayload<ExtArgs>[]
      documentos: Prisma.$DocumentoProcessoPayload<ExtArgs>[]
      follow_ups: Prisma.$FollowUpProcessoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_processo: string
      id_organizacao: string
      id_workspace: string
      id_produto_gravity: string | null
      id_usuario: string | null
      numero_processo: string
      tipo_operacao_processo: string
      referencia_interna_processo: string | null
      referencia_importador_processo: string | null
      referencia_exportador_processo: string | null
      id_status_atual_processo: string | null
      id_importacao_exportador_processo: string | null
      id_exportacao_importador_processo: string | null
      id_cotacao_bid_frete_internacional: string | null
      id_proposta_bid_frete_internacional: string | null
      id_transito_processo: string | null
      id_operacao_cambio_processo: string | null
      id_responsavel_processo: string | null
      responsavel_rotina_processo: string | null
      setor_responsavel_processo: string | null
      vendedor_responsavel_processo: string | null
      data_criacao_processo: Date
      data_atualizacao_processo: Date
    }, ExtArgs["result"]["processo"]>
    composites: {}
  }

  type ProcessoGetPayload<S extends boolean | null | undefined | ProcessoDefaultArgs> = $Result.GetResult<Prisma.$ProcessoPayload, S>

  type ProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoCountAggregateInputType | true
    }

  export interface ProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Processo'], meta: { name: 'Processo' } }
    /**
     * Find zero or one Processo that matches the filter.
     * @param {ProcessoFindUniqueArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoFindUniqueArgs>(args: SelectSubset<T, ProcessoFindUniqueArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Processo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoFindUniqueOrThrowArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Processo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindFirstArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoFindFirstArgs>(args?: SelectSubset<T, ProcessoFindFirstArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Processo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindFirstOrThrowArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Processos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Processos
     * const processos = await prisma.processo.findMany()
     * 
     * // Get first 10 Processos
     * const processos = await prisma.processo.findMany({ take: 10 })
     * 
     * // Only select the `id_processo`
     * const processoWithId_processoOnly = await prisma.processo.findMany({ select: { id_processo: true } })
     * 
     */
    findMany<T extends ProcessoFindManyArgs>(args?: SelectSubset<T, ProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Processo.
     * @param {ProcessoCreateArgs} args - Arguments to create a Processo.
     * @example
     * // Create one Processo
     * const Processo = await prisma.processo.create({
     *   data: {
     *     // ... data to create a Processo
     *   }
     * })
     * 
     */
    create<T extends ProcessoCreateArgs>(args: SelectSubset<T, ProcessoCreateArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Processos.
     * @param {ProcessoCreateManyArgs} args - Arguments to create many Processos.
     * @example
     * // Create many Processos
     * const processo = await prisma.processo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoCreateManyArgs>(args?: SelectSubset<T, ProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Processos and returns the data saved in the database.
     * @param {ProcessoCreateManyAndReturnArgs} args - Arguments to create many Processos.
     * @example
     * // Create many Processos
     * const processo = await prisma.processo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Processos and only return the `id_processo`
     * const processoWithId_processoOnly = await prisma.processo.createManyAndReturn({ 
     *   select: { id_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Processo.
     * @param {ProcessoDeleteArgs} args - Arguments to delete one Processo.
     * @example
     * // Delete one Processo
     * const Processo = await prisma.processo.delete({
     *   where: {
     *     // ... filter to delete one Processo
     *   }
     * })
     * 
     */
    delete<T extends ProcessoDeleteArgs>(args: SelectSubset<T, ProcessoDeleteArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Processo.
     * @param {ProcessoUpdateArgs} args - Arguments to update one Processo.
     * @example
     * // Update one Processo
     * const processo = await prisma.processo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoUpdateArgs>(args: SelectSubset<T, ProcessoUpdateArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Processos.
     * @param {ProcessoDeleteManyArgs} args - Arguments to filter Processos to delete.
     * @example
     * // Delete a few Processos
     * const { count } = await prisma.processo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoDeleteManyArgs>(args?: SelectSubset<T, ProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Processos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Processos
     * const processo = await prisma.processo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoUpdateManyArgs>(args: SelectSubset<T, ProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Processo.
     * @param {ProcessoUpsertArgs} args - Arguments to update or create a Processo.
     * @example
     * // Update or create a Processo
     * const processo = await prisma.processo.upsert({
     *   create: {
     *     // ... data to create a Processo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Processo we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoUpsertArgs>(args: SelectSubset<T, ProcessoUpsertArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Processos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoCountArgs} args - Arguments to filter Processos to count.
     * @example
     * // Count the number of Processos
     * const count = await prisma.processo.count({
     *   where: {
     *     // ... the filter for the Processos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoCountArgs>(
      args?: Subset<T, ProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Processo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoAggregateArgs>(args: Subset<T, ProcessoAggregateArgs>): Prisma.PrismaPromise<GetProcessoAggregateType<T>>

    /**
     * Group by Processo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGroupByArgs} args - Group by arguments.
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
      T extends ProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Processo model
   */
  readonly fields: ProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Processo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    status_atual<T extends Processo$status_atualArgs<ExtArgs> = {}>(args?: Subset<T, Processo$status_atualArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    historico_status<T extends Processo$historico_statusArgs<ExtArgs> = {}>(args?: Subset<T, Processo$historico_statusArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findMany"> | Null>
    logistica<T extends Processo$logisticaArgs<ExtArgs> = {}>(args?: Subset<T, Processo$logisticaArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dados<T extends Processo$dadosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$dadosArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    cambio<T extends Processo$cambioArgs<ExtArgs> = {}>(args?: Subset<T, Processo$cambioArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    estimativa<T extends Processo$estimativaArgs<ExtArgs> = {}>(args?: Subset<T, Processo$estimativaArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    containers<T extends Processo$containersArgs<ExtArgs> = {}>(args?: Subset<T, Processo$containersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findMany"> | Null>
    documentos<T extends Processo$documentosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findMany"> | Null>
    follow_ups<T extends Processo$follow_upsArgs<ExtArgs> = {}>(args?: Subset<T, Processo$follow_upsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Processo model
   */ 
  interface ProcessoFieldRefs {
    readonly id_processo: FieldRef<"Processo", 'String'>
    readonly id_organizacao: FieldRef<"Processo", 'String'>
    readonly id_workspace: FieldRef<"Processo", 'String'>
    readonly id_produto_gravity: FieldRef<"Processo", 'String'>
    readonly id_usuario: FieldRef<"Processo", 'String'>
    readonly numero_processo: FieldRef<"Processo", 'String'>
    readonly tipo_operacao_processo: FieldRef<"Processo", 'String'>
    readonly referencia_interna_processo: FieldRef<"Processo", 'String'>
    readonly referencia_importador_processo: FieldRef<"Processo", 'String'>
    readonly referencia_exportador_processo: FieldRef<"Processo", 'String'>
    readonly id_status_atual_processo: FieldRef<"Processo", 'String'>
    readonly id_importacao_exportador_processo: FieldRef<"Processo", 'String'>
    readonly id_exportacao_importador_processo: FieldRef<"Processo", 'String'>
    readonly id_cotacao_bid_frete_internacional: FieldRef<"Processo", 'String'>
    readonly id_proposta_bid_frete_internacional: FieldRef<"Processo", 'String'>
    readonly id_transito_processo: FieldRef<"Processo", 'String'>
    readonly id_operacao_cambio_processo: FieldRef<"Processo", 'String'>
    readonly id_responsavel_processo: FieldRef<"Processo", 'String'>
    readonly responsavel_rotina_processo: FieldRef<"Processo", 'String'>
    readonly setor_responsavel_processo: FieldRef<"Processo", 'String'>
    readonly vendedor_responsavel_processo: FieldRef<"Processo", 'String'>
    readonly data_criacao_processo: FieldRef<"Processo", 'DateTime'>
    readonly data_atualizacao_processo: FieldRef<"Processo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Processo findUnique
   */
  export type ProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo findUniqueOrThrow
   */
  export type ProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo findFirst
   */
  export type ProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Processos.
     */
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo findFirstOrThrow
   */
  export type ProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Processos.
     */
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo findMany
   */
  export type ProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processos to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo create
   */
  export type ProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a Processo.
     */
    data: XOR<ProcessoCreateInput, ProcessoUncheckedCreateInput>
  }

  /**
   * Processo createMany
   */
  export type ProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Processos.
     */
    data: ProcessoCreateManyInput | ProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Processo createManyAndReturn
   */
  export type ProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Processos.
     */
    data: ProcessoCreateManyInput | ProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Processo update
   */
  export type ProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a Processo.
     */
    data: XOR<ProcessoUpdateInput, ProcessoUncheckedUpdateInput>
    /**
     * Choose, which Processo to update.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo updateMany
   */
  export type ProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Processos.
     */
    data: XOR<ProcessoUpdateManyMutationInput, ProcessoUncheckedUpdateManyInput>
    /**
     * Filter which Processos to update
     */
    where?: ProcessoWhereInput
  }

  /**
   * Processo upsert
   */
  export type ProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the Processo to update in case it exists.
     */
    where: ProcessoWhereUniqueInput
    /**
     * In case the Processo found by the `where` argument doesn't exist, create a new Processo with this data.
     */
    create: XOR<ProcessoCreateInput, ProcessoUncheckedCreateInput>
    /**
     * In case the Processo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoUpdateInput, ProcessoUncheckedUpdateInput>
  }

  /**
   * Processo delete
   */
  export type ProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter which Processo to delete.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo deleteMany
   */
  export type ProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Processos to delete
     */
    where?: ProcessoWhereInput
  }

  /**
   * Processo.status_atual
   */
  export type Processo$status_atualArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    where?: ProcessoStatusWhereInput
  }

  /**
   * Processo.historico_status
   */
  export type Processo$historico_statusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    where?: HistoricoStatusProcessoWhereInput
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * Processo.logistica
   */
  export type Processo$logisticaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    where?: LogisticaInternacionalProcessoWhereInput
  }

  /**
   * Processo.dados
   */
  export type Processo$dadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    where?: DadosProcessoWhereInput
  }

  /**
   * Processo.cambio
   */
  export type Processo$cambioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    where?: CambioProcessoWhereInput
  }

  /**
   * Processo.estimativa
   */
  export type Processo$estimativaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    where?: EstimativaProcessoWhereInput
  }

  /**
   * Processo.containers
   */
  export type Processo$containersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    where?: ContainerProcessoWhereInput
    orderBy?: ContainerProcessoOrderByWithRelationInput | ContainerProcessoOrderByWithRelationInput[]
    cursor?: ContainerProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContainerProcessoScalarFieldEnum | ContainerProcessoScalarFieldEnum[]
  }

  /**
   * Processo.documentos
   */
  export type Processo$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    where?: DocumentoProcessoWhereInput
    orderBy?: DocumentoProcessoOrderByWithRelationInput | DocumentoProcessoOrderByWithRelationInput[]
    cursor?: DocumentoProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentoProcessoScalarFieldEnum | DocumentoProcessoScalarFieldEnum[]
  }

  /**
   * Processo.follow_ups
   */
  export type Processo$follow_upsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    where?: FollowUpProcessoWhereInput
    orderBy?: FollowUpProcessoOrderByWithRelationInput | FollowUpProcessoOrderByWithRelationInput[]
    cursor?: FollowUpProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowUpProcessoScalarFieldEnum | FollowUpProcessoScalarFieldEnum[]
  }

  /**
   * Processo without action
   */
  export type ProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoStatus
   */

  export type AggregateProcessoStatus = {
    _count: ProcessoStatusCountAggregateOutputType | null
    _avg: ProcessoStatusAvgAggregateOutputType | null
    _sum: ProcessoStatusSumAggregateOutputType | null
    _min: ProcessoStatusMinAggregateOutputType | null
    _max: ProcessoStatusMaxAggregateOutputType | null
  }

  export type ProcessoStatusAvgAggregateOutputType = {
    ordem_status_processo: number | null
  }

  export type ProcessoStatusSumAggregateOutputType = {
    ordem_status_processo: number | null
  }

  export type ProcessoStatusMinAggregateOutputType = {
    id_processo_status: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    tipo_status_processo: string | null
    rotulo_status_processo: string | null
    cor_status_processo: string | null
    ordem_status_processo: number | null
    eh_padrao_status_processo: boolean | null
    eh_sistema_status_processo: boolean | null
    data_criacao_processo_status: Date | null
    data_atualizacao_processo_status: Date | null
  }

  export type ProcessoStatusMaxAggregateOutputType = {
    id_processo_status: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    tipo_status_processo: string | null
    rotulo_status_processo: string | null
    cor_status_processo: string | null
    ordem_status_processo: number | null
    eh_padrao_status_processo: boolean | null
    eh_sistema_status_processo: boolean | null
    data_criacao_processo_status: Date | null
    data_atualizacao_processo_status: Date | null
  }

  export type ProcessoStatusCountAggregateOutputType = {
    id_processo_status: number
    id_organizacao: number
    id_produto_gravity: number
    tipo_status_processo: number
    rotulo_status_processo: number
    cor_status_processo: number
    ordem_status_processo: number
    regras_status_processo: number
    eh_padrao_status_processo: number
    eh_sistema_status_processo: number
    data_criacao_processo_status: number
    data_atualizacao_processo_status: number
    _all: number
  }


  export type ProcessoStatusAvgAggregateInputType = {
    ordem_status_processo?: true
  }

  export type ProcessoStatusSumAggregateInputType = {
    ordem_status_processo?: true
  }

  export type ProcessoStatusMinAggregateInputType = {
    id_processo_status?: true
    id_organizacao?: true
    id_produto_gravity?: true
    tipo_status_processo?: true
    rotulo_status_processo?: true
    cor_status_processo?: true
    ordem_status_processo?: true
    eh_padrao_status_processo?: true
    eh_sistema_status_processo?: true
    data_criacao_processo_status?: true
    data_atualizacao_processo_status?: true
  }

  export type ProcessoStatusMaxAggregateInputType = {
    id_processo_status?: true
    id_organizacao?: true
    id_produto_gravity?: true
    tipo_status_processo?: true
    rotulo_status_processo?: true
    cor_status_processo?: true
    ordem_status_processo?: true
    eh_padrao_status_processo?: true
    eh_sistema_status_processo?: true
    data_criacao_processo_status?: true
    data_atualizacao_processo_status?: true
  }

  export type ProcessoStatusCountAggregateInputType = {
    id_processo_status?: true
    id_organizacao?: true
    id_produto_gravity?: true
    tipo_status_processo?: true
    rotulo_status_processo?: true
    cor_status_processo?: true
    ordem_status_processo?: true
    regras_status_processo?: true
    eh_padrao_status_processo?: true
    eh_sistema_status_processo?: true
    data_criacao_processo_status?: true
    data_atualizacao_processo_status?: true
    _all?: true
  }

  export type ProcessoStatusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoStatus to aggregate.
     */
    where?: ProcessoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoStatuses to fetch.
     */
    orderBy?: ProcessoStatusOrderByWithRelationInput | ProcessoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoStatuses
    **/
    _count?: true | ProcessoStatusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoStatusAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoStatusSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoStatusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoStatusMaxAggregateInputType
  }

  export type GetProcessoStatusAggregateType<T extends ProcessoStatusAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoStatus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoStatus[P]>
      : GetScalarType<T[P], AggregateProcessoStatus[P]>
  }




  export type ProcessoStatusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoStatusWhereInput
    orderBy?: ProcessoStatusOrderByWithAggregationInput | ProcessoStatusOrderByWithAggregationInput[]
    by: ProcessoStatusScalarFieldEnum[] | ProcessoStatusScalarFieldEnum
    having?: ProcessoStatusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoStatusCountAggregateInputType | true
    _avg?: ProcessoStatusAvgAggregateInputType
    _sum?: ProcessoStatusSumAggregateInputType
    _min?: ProcessoStatusMinAggregateInputType
    _max?: ProcessoStatusMaxAggregateInputType
  }

  export type ProcessoStatusGroupByOutputType = {
    id_processo_status: string
    id_organizacao: string
    id_produto_gravity: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo: string
    ordem_status_processo: number
    regras_status_processo: JsonValue | null
    eh_padrao_status_processo: boolean
    eh_sistema_status_processo: boolean
    data_criacao_processo_status: Date
    data_atualizacao_processo_status: Date
    _count: ProcessoStatusCountAggregateOutputType | null
    _avg: ProcessoStatusAvgAggregateOutputType | null
    _sum: ProcessoStatusSumAggregateOutputType | null
    _min: ProcessoStatusMinAggregateOutputType | null
    _max: ProcessoStatusMaxAggregateOutputType | null
  }

  type GetProcessoStatusGroupByPayload<T extends ProcessoStatusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoStatusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoStatusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoStatusGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoStatusGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoStatusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo_status?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    tipo_status_processo?: boolean
    rotulo_status_processo?: boolean
    cor_status_processo?: boolean
    ordem_status_processo?: boolean
    regras_status_processo?: boolean
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: boolean
    data_atualizacao_processo_status?: boolean
    processos?: boolean | ProcessoStatus$processosArgs<ExtArgs>
    historico_anterior?: boolean | ProcessoStatus$historico_anteriorArgs<ExtArgs>
    historico_novo?: boolean | ProcessoStatus$historico_novoArgs<ExtArgs>
    _count?: boolean | ProcessoStatusCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoStatus"]>

  export type ProcessoStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo_status?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    tipo_status_processo?: boolean
    rotulo_status_processo?: boolean
    cor_status_processo?: boolean
    ordem_status_processo?: boolean
    regras_status_processo?: boolean
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: boolean
    data_atualizacao_processo_status?: boolean
  }, ExtArgs["result"]["processoStatus"]>

  export type ProcessoStatusSelectScalar = {
    id_processo_status?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    tipo_status_processo?: boolean
    rotulo_status_processo?: boolean
    cor_status_processo?: boolean
    ordem_status_processo?: boolean
    regras_status_processo?: boolean
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: boolean
    data_atualizacao_processo_status?: boolean
  }

  export type ProcessoStatusInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processos?: boolean | ProcessoStatus$processosArgs<ExtArgs>
    historico_anterior?: boolean | ProcessoStatus$historico_anteriorArgs<ExtArgs>
    historico_novo?: boolean | ProcessoStatus$historico_novoArgs<ExtArgs>
    _count?: boolean | ProcessoStatusCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoStatusIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProcessoStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoStatus"
    objects: {
      processos: Prisma.$ProcessoPayload<ExtArgs>[]
      historico_anterior: Prisma.$HistoricoStatusProcessoPayload<ExtArgs>[]
      historico_novo: Prisma.$HistoricoStatusProcessoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_processo_status: string
      id_organizacao: string
      id_produto_gravity: string | null
      tipo_status_processo: string
      rotulo_status_processo: string
      cor_status_processo: string
      ordem_status_processo: number
      regras_status_processo: Prisma.JsonValue | null
      eh_padrao_status_processo: boolean
      eh_sistema_status_processo: boolean
      data_criacao_processo_status: Date
      data_atualizacao_processo_status: Date
    }, ExtArgs["result"]["processoStatus"]>
    composites: {}
  }

  type ProcessoStatusGetPayload<S extends boolean | null | undefined | ProcessoStatusDefaultArgs> = $Result.GetResult<Prisma.$ProcessoStatusPayload, S>

  type ProcessoStatusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoStatusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoStatusCountAggregateInputType | true
    }

  export interface ProcessoStatusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoStatus'], meta: { name: 'ProcessoStatus' } }
    /**
     * Find zero or one ProcessoStatus that matches the filter.
     * @param {ProcessoStatusFindUniqueArgs} args - Arguments to find a ProcessoStatus
     * @example
     * // Get one ProcessoStatus
     * const processoStatus = await prisma.processoStatus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoStatusFindUniqueArgs>(args: SelectSubset<T, ProcessoStatusFindUniqueArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoStatus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoStatusFindUniqueOrThrowArgs} args - Arguments to find a ProcessoStatus
     * @example
     * // Get one ProcessoStatus
     * const processoStatus = await prisma.processoStatus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoStatusFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoStatusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoStatus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusFindFirstArgs} args - Arguments to find a ProcessoStatus
     * @example
     * // Get one ProcessoStatus
     * const processoStatus = await prisma.processoStatus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoStatusFindFirstArgs>(args?: SelectSubset<T, ProcessoStatusFindFirstArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoStatus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusFindFirstOrThrowArgs} args - Arguments to find a ProcessoStatus
     * @example
     * // Get one ProcessoStatus
     * const processoStatus = await prisma.processoStatus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoStatusFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoStatusFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoStatuses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoStatuses
     * const processoStatuses = await prisma.processoStatus.findMany()
     * 
     * // Get first 10 ProcessoStatuses
     * const processoStatuses = await prisma.processoStatus.findMany({ take: 10 })
     * 
     * // Only select the `id_processo_status`
     * const processoStatusWithId_processo_statusOnly = await prisma.processoStatus.findMany({ select: { id_processo_status: true } })
     * 
     */
    findMany<T extends ProcessoStatusFindManyArgs>(args?: SelectSubset<T, ProcessoStatusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoStatus.
     * @param {ProcessoStatusCreateArgs} args - Arguments to create a ProcessoStatus.
     * @example
     * // Create one ProcessoStatus
     * const ProcessoStatus = await prisma.processoStatus.create({
     *   data: {
     *     // ... data to create a ProcessoStatus
     *   }
     * })
     * 
     */
    create<T extends ProcessoStatusCreateArgs>(args: SelectSubset<T, ProcessoStatusCreateArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoStatuses.
     * @param {ProcessoStatusCreateManyArgs} args - Arguments to create many ProcessoStatuses.
     * @example
     * // Create many ProcessoStatuses
     * const processoStatus = await prisma.processoStatus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoStatusCreateManyArgs>(args?: SelectSubset<T, ProcessoStatusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoStatuses and returns the data saved in the database.
     * @param {ProcessoStatusCreateManyAndReturnArgs} args - Arguments to create many ProcessoStatuses.
     * @example
     * // Create many ProcessoStatuses
     * const processoStatus = await prisma.processoStatus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoStatuses and only return the `id_processo_status`
     * const processoStatusWithId_processo_statusOnly = await prisma.processoStatus.createManyAndReturn({ 
     *   select: { id_processo_status: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoStatusCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoStatusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoStatus.
     * @param {ProcessoStatusDeleteArgs} args - Arguments to delete one ProcessoStatus.
     * @example
     * // Delete one ProcessoStatus
     * const ProcessoStatus = await prisma.processoStatus.delete({
     *   where: {
     *     // ... filter to delete one ProcessoStatus
     *   }
     * })
     * 
     */
    delete<T extends ProcessoStatusDeleteArgs>(args: SelectSubset<T, ProcessoStatusDeleteArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoStatus.
     * @param {ProcessoStatusUpdateArgs} args - Arguments to update one ProcessoStatus.
     * @example
     * // Update one ProcessoStatus
     * const processoStatus = await prisma.processoStatus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoStatusUpdateArgs>(args: SelectSubset<T, ProcessoStatusUpdateArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoStatuses.
     * @param {ProcessoStatusDeleteManyArgs} args - Arguments to filter ProcessoStatuses to delete.
     * @example
     * // Delete a few ProcessoStatuses
     * const { count } = await prisma.processoStatus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoStatusDeleteManyArgs>(args?: SelectSubset<T, ProcessoStatusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoStatuses
     * const processoStatus = await prisma.processoStatus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoStatusUpdateManyArgs>(args: SelectSubset<T, ProcessoStatusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoStatus.
     * @param {ProcessoStatusUpsertArgs} args - Arguments to update or create a ProcessoStatus.
     * @example
     * // Update or create a ProcessoStatus
     * const processoStatus = await prisma.processoStatus.upsert({
     *   create: {
     *     // ... data to create a ProcessoStatus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoStatus we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoStatusUpsertArgs>(args: SelectSubset<T, ProcessoStatusUpsertArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusCountArgs} args - Arguments to filter ProcessoStatuses to count.
     * @example
     * // Count the number of ProcessoStatuses
     * const count = await prisma.processoStatus.count({
     *   where: {
     *     // ... the filter for the ProcessoStatuses we want to count
     *   }
     * })
    **/
    count<T extends ProcessoStatusCountArgs>(
      args?: Subset<T, ProcessoStatusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoStatusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoStatusAggregateArgs>(args: Subset<T, ProcessoStatusAggregateArgs>): Prisma.PrismaPromise<GetProcessoStatusAggregateType<T>>

    /**
     * Group by ProcessoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoStatusGroupByArgs} args - Group by arguments.
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
      T extends ProcessoStatusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoStatusGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoStatusGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoStatusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoStatusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoStatus model
   */
  readonly fields: ProcessoStatusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoStatus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoStatusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processos<T extends ProcessoStatus$processosArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoStatus$processosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findMany"> | Null>
    historico_anterior<T extends ProcessoStatus$historico_anteriorArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoStatus$historico_anteriorArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findMany"> | Null>
    historico_novo<T extends ProcessoStatus$historico_novoArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoStatus$historico_novoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the ProcessoStatus model
   */ 
  interface ProcessoStatusFieldRefs {
    readonly id_processo_status: FieldRef<"ProcessoStatus", 'String'>
    readonly id_organizacao: FieldRef<"ProcessoStatus", 'String'>
    readonly id_produto_gravity: FieldRef<"ProcessoStatus", 'String'>
    readonly tipo_status_processo: FieldRef<"ProcessoStatus", 'String'>
    readonly rotulo_status_processo: FieldRef<"ProcessoStatus", 'String'>
    readonly cor_status_processo: FieldRef<"ProcessoStatus", 'String'>
    readonly ordem_status_processo: FieldRef<"ProcessoStatus", 'Int'>
    readonly regras_status_processo: FieldRef<"ProcessoStatus", 'Json'>
    readonly eh_padrao_status_processo: FieldRef<"ProcessoStatus", 'Boolean'>
    readonly eh_sistema_status_processo: FieldRef<"ProcessoStatus", 'Boolean'>
    readonly data_criacao_processo_status: FieldRef<"ProcessoStatus", 'DateTime'>
    readonly data_atualizacao_processo_status: FieldRef<"ProcessoStatus", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoStatus findUnique
   */
  export type ProcessoStatusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoStatus to fetch.
     */
    where: ProcessoStatusWhereUniqueInput
  }

  /**
   * ProcessoStatus findUniqueOrThrow
   */
  export type ProcessoStatusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoStatus to fetch.
     */
    where: ProcessoStatusWhereUniqueInput
  }

  /**
   * ProcessoStatus findFirst
   */
  export type ProcessoStatusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoStatus to fetch.
     */
    where?: ProcessoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoStatuses to fetch.
     */
    orderBy?: ProcessoStatusOrderByWithRelationInput | ProcessoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoStatuses.
     */
    cursor?: ProcessoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoStatuses.
     */
    distinct?: ProcessoStatusScalarFieldEnum | ProcessoStatusScalarFieldEnum[]
  }

  /**
   * ProcessoStatus findFirstOrThrow
   */
  export type ProcessoStatusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoStatus to fetch.
     */
    where?: ProcessoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoStatuses to fetch.
     */
    orderBy?: ProcessoStatusOrderByWithRelationInput | ProcessoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoStatuses.
     */
    cursor?: ProcessoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoStatuses.
     */
    distinct?: ProcessoStatusScalarFieldEnum | ProcessoStatusScalarFieldEnum[]
  }

  /**
   * ProcessoStatus findMany
   */
  export type ProcessoStatusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoStatuses to fetch.
     */
    where?: ProcessoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoStatuses to fetch.
     */
    orderBy?: ProcessoStatusOrderByWithRelationInput | ProcessoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoStatuses.
     */
    cursor?: ProcessoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoStatuses.
     */
    skip?: number
    distinct?: ProcessoStatusScalarFieldEnum | ProcessoStatusScalarFieldEnum[]
  }

  /**
   * ProcessoStatus create
   */
  export type ProcessoStatusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoStatus.
     */
    data: XOR<ProcessoStatusCreateInput, ProcessoStatusUncheckedCreateInput>
  }

  /**
   * ProcessoStatus createMany
   */
  export type ProcessoStatusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoStatuses.
     */
    data: ProcessoStatusCreateManyInput | ProcessoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoStatus createManyAndReturn
   */
  export type ProcessoStatusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoStatuses.
     */
    data: ProcessoStatusCreateManyInput | ProcessoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoStatus update
   */
  export type ProcessoStatusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoStatus.
     */
    data: XOR<ProcessoStatusUpdateInput, ProcessoStatusUncheckedUpdateInput>
    /**
     * Choose, which ProcessoStatus to update.
     */
    where: ProcessoStatusWhereUniqueInput
  }

  /**
   * ProcessoStatus updateMany
   */
  export type ProcessoStatusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoStatuses.
     */
    data: XOR<ProcessoStatusUpdateManyMutationInput, ProcessoStatusUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoStatuses to update
     */
    where?: ProcessoStatusWhereInput
  }

  /**
   * ProcessoStatus upsert
   */
  export type ProcessoStatusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoStatus to update in case it exists.
     */
    where: ProcessoStatusWhereUniqueInput
    /**
     * In case the ProcessoStatus found by the `where` argument doesn't exist, create a new ProcessoStatus with this data.
     */
    create: XOR<ProcessoStatusCreateInput, ProcessoStatusUncheckedCreateInput>
    /**
     * In case the ProcessoStatus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoStatusUpdateInput, ProcessoStatusUncheckedUpdateInput>
  }

  /**
   * ProcessoStatus delete
   */
  export type ProcessoStatusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    /**
     * Filter which ProcessoStatus to delete.
     */
    where: ProcessoStatusWhereUniqueInput
  }

  /**
   * ProcessoStatus deleteMany
   */
  export type ProcessoStatusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoStatuses to delete
     */
    where?: ProcessoStatusWhereInput
  }

  /**
   * ProcessoStatus.processos
   */
  export type ProcessoStatus$processosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    where?: ProcessoWhereInput
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    cursor?: ProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * ProcessoStatus.historico_anterior
   */
  export type ProcessoStatus$historico_anteriorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    where?: HistoricoStatusProcessoWhereInput
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * ProcessoStatus.historico_novo
   */
  export type ProcessoStatus$historico_novoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    where?: HistoricoStatusProcessoWhereInput
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * ProcessoStatus without action
   */
  export type ProcessoStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
  }


  /**
   * Model HistoricoStatusProcesso
   */

  export type AggregateHistoricoStatusProcesso = {
    _count: HistoricoStatusProcessoCountAggregateOutputType | null
    _min: HistoricoStatusProcessoMinAggregateOutputType | null
    _max: HistoricoStatusProcessoMaxAggregateOutputType | null
  }

  export type HistoricoStatusProcessoMinAggregateOutputType = {
    id_historico_status_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    id_status_anterior_processo: string | null
    id_status_novo_processo: string | null
    id_usuario_mudanca_status_processo: string | null
    data_mudanca_status_processo: Date | null
    observacao_mudanca_status_processo: string | null
  }

  export type HistoricoStatusProcessoMaxAggregateOutputType = {
    id_historico_status_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    id_status_anterior_processo: string | null
    id_status_novo_processo: string | null
    id_usuario_mudanca_status_processo: string | null
    data_mudanca_status_processo: Date | null
    observacao_mudanca_status_processo: string | null
  }

  export type HistoricoStatusProcessoCountAggregateOutputType = {
    id_historico_status_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    id_status_anterior_processo: number
    id_status_novo_processo: number
    id_usuario_mudanca_status_processo: number
    data_mudanca_status_processo: number
    observacao_mudanca_status_processo: number
    _all: number
  }


  export type HistoricoStatusProcessoMinAggregateInputType = {
    id_historico_status_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_status_anterior_processo?: true
    id_status_novo_processo?: true
    id_usuario_mudanca_status_processo?: true
    data_mudanca_status_processo?: true
    observacao_mudanca_status_processo?: true
  }

  export type HistoricoStatusProcessoMaxAggregateInputType = {
    id_historico_status_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_status_anterior_processo?: true
    id_status_novo_processo?: true
    id_usuario_mudanca_status_processo?: true
    data_mudanca_status_processo?: true
    observacao_mudanca_status_processo?: true
  }

  export type HistoricoStatusProcessoCountAggregateInputType = {
    id_historico_status_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_status_anterior_processo?: true
    id_status_novo_processo?: true
    id_usuario_mudanca_status_processo?: true
    data_mudanca_status_processo?: true
    observacao_mudanca_status_processo?: true
    _all?: true
  }

  export type HistoricoStatusProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HistoricoStatusProcesso to aggregate.
     */
    where?: HistoricoStatusProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistoricoStatusProcessos to fetch.
     */
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistoricoStatusProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistoricoStatusProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HistoricoStatusProcessos
    **/
    _count?: true | HistoricoStatusProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HistoricoStatusProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HistoricoStatusProcessoMaxAggregateInputType
  }

  export type GetHistoricoStatusProcessoAggregateType<T extends HistoricoStatusProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateHistoricoStatusProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHistoricoStatusProcesso[P]>
      : GetScalarType<T[P], AggregateHistoricoStatusProcesso[P]>
  }




  export type HistoricoStatusProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistoricoStatusProcessoWhereInput
    orderBy?: HistoricoStatusProcessoOrderByWithAggregationInput | HistoricoStatusProcessoOrderByWithAggregationInput[]
    by: HistoricoStatusProcessoScalarFieldEnum[] | HistoricoStatusProcessoScalarFieldEnum
    having?: HistoricoStatusProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HistoricoStatusProcessoCountAggregateInputType | true
    _min?: HistoricoStatusProcessoMinAggregateInputType
    _max?: HistoricoStatusProcessoMaxAggregateInputType
  }

  export type HistoricoStatusProcessoGroupByOutputType = {
    id_historico_status_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    id_status_anterior_processo: string | null
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo: string | null
    data_mudanca_status_processo: Date
    observacao_mudanca_status_processo: string | null
    _count: HistoricoStatusProcessoCountAggregateOutputType | null
    _min: HistoricoStatusProcessoMinAggregateOutputType | null
    _max: HistoricoStatusProcessoMaxAggregateOutputType | null
  }

  type GetHistoricoStatusProcessoGroupByPayload<T extends HistoricoStatusProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HistoricoStatusProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HistoricoStatusProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HistoricoStatusProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], HistoricoStatusProcessoGroupByOutputType[P]>
        }
      >
    >


  export type HistoricoStatusProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_historico_status_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_status_anterior_processo?: boolean
    id_status_novo_processo?: boolean
    id_usuario_mudanca_status_processo?: boolean
    data_mudanca_status_processo?: boolean
    observacao_mudanca_status_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    status_anterior?: boolean | HistoricoStatusProcesso$status_anteriorArgs<ExtArgs>
    status_novo?: boolean | ProcessoStatusDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["historicoStatusProcesso"]>

  export type HistoricoStatusProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_historico_status_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_status_anterior_processo?: boolean
    id_status_novo_processo?: boolean
    id_usuario_mudanca_status_processo?: boolean
    data_mudanca_status_processo?: boolean
    observacao_mudanca_status_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    status_anterior?: boolean | HistoricoStatusProcesso$status_anteriorArgs<ExtArgs>
    status_novo?: boolean | ProcessoStatusDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["historicoStatusProcesso"]>

  export type HistoricoStatusProcessoSelectScalar = {
    id_historico_status_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_status_anterior_processo?: boolean
    id_status_novo_processo?: boolean
    id_usuario_mudanca_status_processo?: boolean
    data_mudanca_status_processo?: boolean
    observacao_mudanca_status_processo?: boolean
  }

  export type HistoricoStatusProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    status_anterior?: boolean | HistoricoStatusProcesso$status_anteriorArgs<ExtArgs>
    status_novo?: boolean | ProcessoStatusDefaultArgs<ExtArgs>
  }
  export type HistoricoStatusProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    status_anterior?: boolean | HistoricoStatusProcesso$status_anteriorArgs<ExtArgs>
    status_novo?: boolean | ProcessoStatusDefaultArgs<ExtArgs>
  }

  export type $HistoricoStatusProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HistoricoStatusProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
      status_anterior: Prisma.$ProcessoStatusPayload<ExtArgs> | null
      status_novo: Prisma.$ProcessoStatusPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_historico_status_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      id_status_anterior_processo: string | null
      id_status_novo_processo: string
      id_usuario_mudanca_status_processo: string | null
      data_mudanca_status_processo: Date
      observacao_mudanca_status_processo: string | null
    }, ExtArgs["result"]["historicoStatusProcesso"]>
    composites: {}
  }

  type HistoricoStatusProcessoGetPayload<S extends boolean | null | undefined | HistoricoStatusProcessoDefaultArgs> = $Result.GetResult<Prisma.$HistoricoStatusProcessoPayload, S>

  type HistoricoStatusProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<HistoricoStatusProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: HistoricoStatusProcessoCountAggregateInputType | true
    }

  export interface HistoricoStatusProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HistoricoStatusProcesso'], meta: { name: 'HistoricoStatusProcesso' } }
    /**
     * Find zero or one HistoricoStatusProcesso that matches the filter.
     * @param {HistoricoStatusProcessoFindUniqueArgs} args - Arguments to find a HistoricoStatusProcesso
     * @example
     * // Get one HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HistoricoStatusProcessoFindUniqueArgs>(args: SelectSubset<T, HistoricoStatusProcessoFindUniqueArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one HistoricoStatusProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {HistoricoStatusProcessoFindUniqueOrThrowArgs} args - Arguments to find a HistoricoStatusProcesso
     * @example
     * // Get one HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HistoricoStatusProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, HistoricoStatusProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first HistoricoStatusProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoFindFirstArgs} args - Arguments to find a HistoricoStatusProcesso
     * @example
     * // Get one HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HistoricoStatusProcessoFindFirstArgs>(args?: SelectSubset<T, HistoricoStatusProcessoFindFirstArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first HistoricoStatusProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoFindFirstOrThrowArgs} args - Arguments to find a HistoricoStatusProcesso
     * @example
     * // Get one HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HistoricoStatusProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, HistoricoStatusProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more HistoricoStatusProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HistoricoStatusProcessos
     * const historicoStatusProcessos = await prisma.historicoStatusProcesso.findMany()
     * 
     * // Get first 10 HistoricoStatusProcessos
     * const historicoStatusProcessos = await prisma.historicoStatusProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_historico_status_processo`
     * const historicoStatusProcessoWithId_historico_status_processoOnly = await prisma.historicoStatusProcesso.findMany({ select: { id_historico_status_processo: true } })
     * 
     */
    findMany<T extends HistoricoStatusProcessoFindManyArgs>(args?: SelectSubset<T, HistoricoStatusProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a HistoricoStatusProcesso.
     * @param {HistoricoStatusProcessoCreateArgs} args - Arguments to create a HistoricoStatusProcesso.
     * @example
     * // Create one HistoricoStatusProcesso
     * const HistoricoStatusProcesso = await prisma.historicoStatusProcesso.create({
     *   data: {
     *     // ... data to create a HistoricoStatusProcesso
     *   }
     * })
     * 
     */
    create<T extends HistoricoStatusProcessoCreateArgs>(args: SelectSubset<T, HistoricoStatusProcessoCreateArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many HistoricoStatusProcessos.
     * @param {HistoricoStatusProcessoCreateManyArgs} args - Arguments to create many HistoricoStatusProcessos.
     * @example
     * // Create many HistoricoStatusProcessos
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HistoricoStatusProcessoCreateManyArgs>(args?: SelectSubset<T, HistoricoStatusProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HistoricoStatusProcessos and returns the data saved in the database.
     * @param {HistoricoStatusProcessoCreateManyAndReturnArgs} args - Arguments to create many HistoricoStatusProcessos.
     * @example
     * // Create many HistoricoStatusProcessos
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HistoricoStatusProcessos and only return the `id_historico_status_processo`
     * const historicoStatusProcessoWithId_historico_status_processoOnly = await prisma.historicoStatusProcesso.createManyAndReturn({ 
     *   select: { id_historico_status_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HistoricoStatusProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, HistoricoStatusProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a HistoricoStatusProcesso.
     * @param {HistoricoStatusProcessoDeleteArgs} args - Arguments to delete one HistoricoStatusProcesso.
     * @example
     * // Delete one HistoricoStatusProcesso
     * const HistoricoStatusProcesso = await prisma.historicoStatusProcesso.delete({
     *   where: {
     *     // ... filter to delete one HistoricoStatusProcesso
     *   }
     * })
     * 
     */
    delete<T extends HistoricoStatusProcessoDeleteArgs>(args: SelectSubset<T, HistoricoStatusProcessoDeleteArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one HistoricoStatusProcesso.
     * @param {HistoricoStatusProcessoUpdateArgs} args - Arguments to update one HistoricoStatusProcesso.
     * @example
     * // Update one HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HistoricoStatusProcessoUpdateArgs>(args: SelectSubset<T, HistoricoStatusProcessoUpdateArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more HistoricoStatusProcessos.
     * @param {HistoricoStatusProcessoDeleteManyArgs} args - Arguments to filter HistoricoStatusProcessos to delete.
     * @example
     * // Delete a few HistoricoStatusProcessos
     * const { count } = await prisma.historicoStatusProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HistoricoStatusProcessoDeleteManyArgs>(args?: SelectSubset<T, HistoricoStatusProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HistoricoStatusProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HistoricoStatusProcessos
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HistoricoStatusProcessoUpdateManyArgs>(args: SelectSubset<T, HistoricoStatusProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one HistoricoStatusProcesso.
     * @param {HistoricoStatusProcessoUpsertArgs} args - Arguments to update or create a HistoricoStatusProcesso.
     * @example
     * // Update or create a HistoricoStatusProcesso
     * const historicoStatusProcesso = await prisma.historicoStatusProcesso.upsert({
     *   create: {
     *     // ... data to create a HistoricoStatusProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HistoricoStatusProcesso we want to update
     *   }
     * })
     */
    upsert<T extends HistoricoStatusProcessoUpsertArgs>(args: SelectSubset<T, HistoricoStatusProcessoUpsertArgs<ExtArgs>>): Prisma__HistoricoStatusProcessoClient<$Result.GetResult<Prisma.$HistoricoStatusProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of HistoricoStatusProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoCountArgs} args - Arguments to filter HistoricoStatusProcessos to count.
     * @example
     * // Count the number of HistoricoStatusProcessos
     * const count = await prisma.historicoStatusProcesso.count({
     *   where: {
     *     // ... the filter for the HistoricoStatusProcessos we want to count
     *   }
     * })
    **/
    count<T extends HistoricoStatusProcessoCountArgs>(
      args?: Subset<T, HistoricoStatusProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HistoricoStatusProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HistoricoStatusProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends HistoricoStatusProcessoAggregateArgs>(args: Subset<T, HistoricoStatusProcessoAggregateArgs>): Prisma.PrismaPromise<GetHistoricoStatusProcessoAggregateType<T>>

    /**
     * Group by HistoricoStatusProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistoricoStatusProcessoGroupByArgs} args - Group by arguments.
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
      T extends HistoricoStatusProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HistoricoStatusProcessoGroupByArgs['orderBy'] }
        : { orderBy?: HistoricoStatusProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, HistoricoStatusProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHistoricoStatusProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HistoricoStatusProcesso model
   */
  readonly fields: HistoricoStatusProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HistoricoStatusProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HistoricoStatusProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    status_anterior<T extends HistoricoStatusProcesso$status_anteriorArgs<ExtArgs> = {}>(args?: Subset<T, HistoricoStatusProcesso$status_anteriorArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    status_novo<T extends ProcessoStatusDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoStatusDefaultArgs<ExtArgs>>): Prisma__ProcessoStatusClient<$Result.GetResult<Prisma.$ProcessoStatusPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the HistoricoStatusProcesso model
   */ 
  interface HistoricoStatusProcessoFieldRefs {
    readonly id_historico_status_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_organizacao: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_status_anterior_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_status_novo_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly id_usuario_mudanca_status_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
    readonly data_mudanca_status_processo: FieldRef<"HistoricoStatusProcesso", 'DateTime'>
    readonly observacao_mudanca_status_processo: FieldRef<"HistoricoStatusProcesso", 'String'>
  }
    

  // Custom InputTypes
  /**
   * HistoricoStatusProcesso findUnique
   */
  export type HistoricoStatusProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter, which HistoricoStatusProcesso to fetch.
     */
    where: HistoricoStatusProcessoWhereUniqueInput
  }

  /**
   * HistoricoStatusProcesso findUniqueOrThrow
   */
  export type HistoricoStatusProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter, which HistoricoStatusProcesso to fetch.
     */
    where: HistoricoStatusProcessoWhereUniqueInput
  }

  /**
   * HistoricoStatusProcesso findFirst
   */
  export type HistoricoStatusProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter, which HistoricoStatusProcesso to fetch.
     */
    where?: HistoricoStatusProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistoricoStatusProcessos to fetch.
     */
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HistoricoStatusProcessos.
     */
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistoricoStatusProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistoricoStatusProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HistoricoStatusProcessos.
     */
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * HistoricoStatusProcesso findFirstOrThrow
   */
  export type HistoricoStatusProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter, which HistoricoStatusProcesso to fetch.
     */
    where?: HistoricoStatusProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistoricoStatusProcessos to fetch.
     */
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HistoricoStatusProcessos.
     */
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistoricoStatusProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistoricoStatusProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HistoricoStatusProcessos.
     */
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * HistoricoStatusProcesso findMany
   */
  export type HistoricoStatusProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter, which HistoricoStatusProcessos to fetch.
     */
    where?: HistoricoStatusProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistoricoStatusProcessos to fetch.
     */
    orderBy?: HistoricoStatusProcessoOrderByWithRelationInput | HistoricoStatusProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HistoricoStatusProcessos.
     */
    cursor?: HistoricoStatusProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistoricoStatusProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistoricoStatusProcessos.
     */
    skip?: number
    distinct?: HistoricoStatusProcessoScalarFieldEnum | HistoricoStatusProcessoScalarFieldEnum[]
  }

  /**
   * HistoricoStatusProcesso create
   */
  export type HistoricoStatusProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a HistoricoStatusProcesso.
     */
    data: XOR<HistoricoStatusProcessoCreateInput, HistoricoStatusProcessoUncheckedCreateInput>
  }

  /**
   * HistoricoStatusProcesso createMany
   */
  export type HistoricoStatusProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HistoricoStatusProcessos.
     */
    data: HistoricoStatusProcessoCreateManyInput | HistoricoStatusProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HistoricoStatusProcesso createManyAndReturn
   */
  export type HistoricoStatusProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many HistoricoStatusProcessos.
     */
    data: HistoricoStatusProcessoCreateManyInput | HistoricoStatusProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * HistoricoStatusProcesso update
   */
  export type HistoricoStatusProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a HistoricoStatusProcesso.
     */
    data: XOR<HistoricoStatusProcessoUpdateInput, HistoricoStatusProcessoUncheckedUpdateInput>
    /**
     * Choose, which HistoricoStatusProcesso to update.
     */
    where: HistoricoStatusProcessoWhereUniqueInput
  }

  /**
   * HistoricoStatusProcesso updateMany
   */
  export type HistoricoStatusProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HistoricoStatusProcessos.
     */
    data: XOR<HistoricoStatusProcessoUpdateManyMutationInput, HistoricoStatusProcessoUncheckedUpdateManyInput>
    /**
     * Filter which HistoricoStatusProcessos to update
     */
    where?: HistoricoStatusProcessoWhereInput
  }

  /**
   * HistoricoStatusProcesso upsert
   */
  export type HistoricoStatusProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the HistoricoStatusProcesso to update in case it exists.
     */
    where: HistoricoStatusProcessoWhereUniqueInput
    /**
     * In case the HistoricoStatusProcesso found by the `where` argument doesn't exist, create a new HistoricoStatusProcesso with this data.
     */
    create: XOR<HistoricoStatusProcessoCreateInput, HistoricoStatusProcessoUncheckedCreateInput>
    /**
     * In case the HistoricoStatusProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HistoricoStatusProcessoUpdateInput, HistoricoStatusProcessoUncheckedUpdateInput>
  }

  /**
   * HistoricoStatusProcesso delete
   */
  export type HistoricoStatusProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
    /**
     * Filter which HistoricoStatusProcesso to delete.
     */
    where: HistoricoStatusProcessoWhereUniqueInput
  }

  /**
   * HistoricoStatusProcesso deleteMany
   */
  export type HistoricoStatusProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HistoricoStatusProcessos to delete
     */
    where?: HistoricoStatusProcessoWhereInput
  }

  /**
   * HistoricoStatusProcesso.status_anterior
   */
  export type HistoricoStatusProcesso$status_anteriorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoStatusInclude<ExtArgs> | null
    where?: ProcessoStatusWhereInput
  }

  /**
   * HistoricoStatusProcesso without action
   */
  export type HistoricoStatusProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistoricoStatusProcesso
     */
    select?: HistoricoStatusProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistoricoStatusProcessoInclude<ExtArgs> | null
  }


  /**
   * Model LogisticaInternacionalProcesso
   */

  export type AggregateLogisticaInternacionalProcesso = {
    _count: LogisticaInternacionalProcessoCountAggregateOutputType | null
    _min: LogisticaInternacionalProcessoMinAggregateOutputType | null
    _max: LogisticaInternacionalProcessoMaxAggregateOutputType | null
  }

  export type LogisticaInternacionalProcessoMinAggregateOutputType = {
    id_logistica_internacional_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    modal_frete_internacional_processo: string | null
    tipo_frete_internacional_processo: string | null
    tipo_volume_processo: string | null
    incoterm_processo: string | null
    porto_origem_processo: string | null
    porto_destino_processo: string | null
    porto_transbordo_processo: string | null
    aeroporto_origem_processo: string | null
    aeroporto_destino_processo: string | null
    aeroporto_escala_processo: string | null
    id_agente_carga: string | null
    id_armador: string | null
    id_cia_aerea: string | null
    id_transportador_rodo_internacional: string | null
    id_transportador_rodo_nacional: string | null
    id_transportador_ferroviario: string | null
    id_despachante: string | null
    id_armazem_alfandegado: string | null
    id_seguradora_internacional: string | null
    data_criacao_logistica_internacional_processo: Date | null
    data_atualizacao_logistica_internacional_processo: Date | null
  }

  export type LogisticaInternacionalProcessoMaxAggregateOutputType = {
    id_logistica_internacional_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    modal_frete_internacional_processo: string | null
    tipo_frete_internacional_processo: string | null
    tipo_volume_processo: string | null
    incoterm_processo: string | null
    porto_origem_processo: string | null
    porto_destino_processo: string | null
    porto_transbordo_processo: string | null
    aeroporto_origem_processo: string | null
    aeroporto_destino_processo: string | null
    aeroporto_escala_processo: string | null
    id_agente_carga: string | null
    id_armador: string | null
    id_cia_aerea: string | null
    id_transportador_rodo_internacional: string | null
    id_transportador_rodo_nacional: string | null
    id_transportador_ferroviario: string | null
    id_despachante: string | null
    id_armazem_alfandegado: string | null
    id_seguradora_internacional: string | null
    data_criacao_logistica_internacional_processo: Date | null
    data_atualizacao_logistica_internacional_processo: Date | null
  }

  export type LogisticaInternacionalProcessoCountAggregateOutputType = {
    id_logistica_internacional_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    modal_frete_internacional_processo: number
    tipo_frete_internacional_processo: number
    tipo_volume_processo: number
    incoterm_processo: number
    porto_origem_processo: number
    porto_destino_processo: number
    porto_transbordo_processo: number
    aeroporto_origem_processo: number
    aeroporto_destino_processo: number
    aeroporto_escala_processo: number
    id_agente_carga: number
    id_armador: number
    id_cia_aerea: number
    id_transportador_rodo_internacional: number
    id_transportador_rodo_nacional: number
    id_transportador_ferroviario: number
    id_despachante: number
    id_armazem_alfandegado: number
    id_seguradora_internacional: number
    data_criacao_logistica_internacional_processo: number
    data_atualizacao_logistica_internacional_processo: number
    _all: number
  }


  export type LogisticaInternacionalProcessoMinAggregateInputType = {
    id_logistica_internacional_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    modal_frete_internacional_processo?: true
    tipo_frete_internacional_processo?: true
    tipo_volume_processo?: true
    incoterm_processo?: true
    porto_origem_processo?: true
    porto_destino_processo?: true
    porto_transbordo_processo?: true
    aeroporto_origem_processo?: true
    aeroporto_destino_processo?: true
    aeroporto_escala_processo?: true
    id_agente_carga?: true
    id_armador?: true
    id_cia_aerea?: true
    id_transportador_rodo_internacional?: true
    id_transportador_rodo_nacional?: true
    id_transportador_ferroviario?: true
    id_despachante?: true
    id_armazem_alfandegado?: true
    id_seguradora_internacional?: true
    data_criacao_logistica_internacional_processo?: true
    data_atualizacao_logistica_internacional_processo?: true
  }

  export type LogisticaInternacionalProcessoMaxAggregateInputType = {
    id_logistica_internacional_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    modal_frete_internacional_processo?: true
    tipo_frete_internacional_processo?: true
    tipo_volume_processo?: true
    incoterm_processo?: true
    porto_origem_processo?: true
    porto_destino_processo?: true
    porto_transbordo_processo?: true
    aeroporto_origem_processo?: true
    aeroporto_destino_processo?: true
    aeroporto_escala_processo?: true
    id_agente_carga?: true
    id_armador?: true
    id_cia_aerea?: true
    id_transportador_rodo_internacional?: true
    id_transportador_rodo_nacional?: true
    id_transportador_ferroviario?: true
    id_despachante?: true
    id_armazem_alfandegado?: true
    id_seguradora_internacional?: true
    data_criacao_logistica_internacional_processo?: true
    data_atualizacao_logistica_internacional_processo?: true
  }

  export type LogisticaInternacionalProcessoCountAggregateInputType = {
    id_logistica_internacional_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    modal_frete_internacional_processo?: true
    tipo_frete_internacional_processo?: true
    tipo_volume_processo?: true
    incoterm_processo?: true
    porto_origem_processo?: true
    porto_destino_processo?: true
    porto_transbordo_processo?: true
    aeroporto_origem_processo?: true
    aeroporto_destino_processo?: true
    aeroporto_escala_processo?: true
    id_agente_carga?: true
    id_armador?: true
    id_cia_aerea?: true
    id_transportador_rodo_internacional?: true
    id_transportador_rodo_nacional?: true
    id_transportador_ferroviario?: true
    id_despachante?: true
    id_armazem_alfandegado?: true
    id_seguradora_internacional?: true
    data_criacao_logistica_internacional_processo?: true
    data_atualizacao_logistica_internacional_processo?: true
    _all?: true
  }

  export type LogisticaInternacionalProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LogisticaInternacionalProcesso to aggregate.
     */
    where?: LogisticaInternacionalProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogisticaInternacionalProcessos to fetch.
     */
    orderBy?: LogisticaInternacionalProcessoOrderByWithRelationInput | LogisticaInternacionalProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LogisticaInternacionalProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogisticaInternacionalProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogisticaInternacionalProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LogisticaInternacionalProcessos
    **/
    _count?: true | LogisticaInternacionalProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LogisticaInternacionalProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LogisticaInternacionalProcessoMaxAggregateInputType
  }

  export type GetLogisticaInternacionalProcessoAggregateType<T extends LogisticaInternacionalProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateLogisticaInternacionalProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLogisticaInternacionalProcesso[P]>
      : GetScalarType<T[P], AggregateLogisticaInternacionalProcesso[P]>
  }




  export type LogisticaInternacionalProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LogisticaInternacionalProcessoWhereInput
    orderBy?: LogisticaInternacionalProcessoOrderByWithAggregationInput | LogisticaInternacionalProcessoOrderByWithAggregationInput[]
    by: LogisticaInternacionalProcessoScalarFieldEnum[] | LogisticaInternacionalProcessoScalarFieldEnum
    having?: LogisticaInternacionalProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LogisticaInternacionalProcessoCountAggregateInputType | true
    _min?: LogisticaInternacionalProcessoMinAggregateInputType
    _max?: LogisticaInternacionalProcessoMaxAggregateInputType
  }

  export type LogisticaInternacionalProcessoGroupByOutputType = {
    id_logistica_internacional_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    modal_frete_internacional_processo: string | null
    tipo_frete_internacional_processo: string | null
    tipo_volume_processo: string | null
    incoterm_processo: string | null
    porto_origem_processo: string | null
    porto_destino_processo: string | null
    porto_transbordo_processo: string | null
    aeroporto_origem_processo: string | null
    aeroporto_destino_processo: string | null
    aeroporto_escala_processo: string | null
    id_agente_carga: string | null
    id_armador: string | null
    id_cia_aerea: string | null
    id_transportador_rodo_internacional: string | null
    id_transportador_rodo_nacional: string | null
    id_transportador_ferroviario: string | null
    id_despachante: string | null
    id_armazem_alfandegado: string | null
    id_seguradora_internacional: string | null
    data_criacao_logistica_internacional_processo: Date
    data_atualizacao_logistica_internacional_processo: Date
    _count: LogisticaInternacionalProcessoCountAggregateOutputType | null
    _min: LogisticaInternacionalProcessoMinAggregateOutputType | null
    _max: LogisticaInternacionalProcessoMaxAggregateOutputType | null
  }

  type GetLogisticaInternacionalProcessoGroupByPayload<T extends LogisticaInternacionalProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LogisticaInternacionalProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LogisticaInternacionalProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LogisticaInternacionalProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], LogisticaInternacionalProcessoGroupByOutputType[P]>
        }
      >
    >


  export type LogisticaInternacionalProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_logistica_internacional_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    modal_frete_internacional_processo?: boolean
    tipo_frete_internacional_processo?: boolean
    tipo_volume_processo?: boolean
    incoterm_processo?: boolean
    porto_origem_processo?: boolean
    porto_destino_processo?: boolean
    porto_transbordo_processo?: boolean
    aeroporto_origem_processo?: boolean
    aeroporto_destino_processo?: boolean
    aeroporto_escala_processo?: boolean
    id_agente_carga?: boolean
    id_armador?: boolean
    id_cia_aerea?: boolean
    id_transportador_rodo_internacional?: boolean
    id_transportador_rodo_nacional?: boolean
    id_transportador_ferroviario?: boolean
    id_despachante?: boolean
    id_armazem_alfandegado?: boolean
    id_seguradora_internacional?: boolean
    data_criacao_logistica_internacional_processo?: boolean
    data_atualizacao_logistica_internacional_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["logisticaInternacionalProcesso"]>

  export type LogisticaInternacionalProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_logistica_internacional_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    modal_frete_internacional_processo?: boolean
    tipo_frete_internacional_processo?: boolean
    tipo_volume_processo?: boolean
    incoterm_processo?: boolean
    porto_origem_processo?: boolean
    porto_destino_processo?: boolean
    porto_transbordo_processo?: boolean
    aeroporto_origem_processo?: boolean
    aeroporto_destino_processo?: boolean
    aeroporto_escala_processo?: boolean
    id_agente_carga?: boolean
    id_armador?: boolean
    id_cia_aerea?: boolean
    id_transportador_rodo_internacional?: boolean
    id_transportador_rodo_nacional?: boolean
    id_transportador_ferroviario?: boolean
    id_despachante?: boolean
    id_armazem_alfandegado?: boolean
    id_seguradora_internacional?: boolean
    data_criacao_logistica_internacional_processo?: boolean
    data_atualizacao_logistica_internacional_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["logisticaInternacionalProcesso"]>

  export type LogisticaInternacionalProcessoSelectScalar = {
    id_logistica_internacional_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    modal_frete_internacional_processo?: boolean
    tipo_frete_internacional_processo?: boolean
    tipo_volume_processo?: boolean
    incoterm_processo?: boolean
    porto_origem_processo?: boolean
    porto_destino_processo?: boolean
    porto_transbordo_processo?: boolean
    aeroporto_origem_processo?: boolean
    aeroporto_destino_processo?: boolean
    aeroporto_escala_processo?: boolean
    id_agente_carga?: boolean
    id_armador?: boolean
    id_cia_aerea?: boolean
    id_transportador_rodo_internacional?: boolean
    id_transportador_rodo_nacional?: boolean
    id_transportador_ferroviario?: boolean
    id_despachante?: boolean
    id_armazem_alfandegado?: boolean
    id_seguradora_internacional?: boolean
    data_criacao_logistica_internacional_processo?: boolean
    data_atualizacao_logistica_internacional_processo?: boolean
  }

  export type LogisticaInternacionalProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type LogisticaInternacionalProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $LogisticaInternacionalProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LogisticaInternacionalProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_logistica_internacional_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      modal_frete_internacional_processo: string | null
      tipo_frete_internacional_processo: string | null
      tipo_volume_processo: string | null
      incoterm_processo: string | null
      porto_origem_processo: string | null
      porto_destino_processo: string | null
      porto_transbordo_processo: string | null
      aeroporto_origem_processo: string | null
      aeroporto_destino_processo: string | null
      aeroporto_escala_processo: string | null
      id_agente_carga: string | null
      id_armador: string | null
      id_cia_aerea: string | null
      id_transportador_rodo_internacional: string | null
      id_transportador_rodo_nacional: string | null
      id_transportador_ferroviario: string | null
      id_despachante: string | null
      id_armazem_alfandegado: string | null
      id_seguradora_internacional: string | null
      data_criacao_logistica_internacional_processo: Date
      data_atualizacao_logistica_internacional_processo: Date
    }, ExtArgs["result"]["logisticaInternacionalProcesso"]>
    composites: {}
  }

  type LogisticaInternacionalProcessoGetPayload<S extends boolean | null | undefined | LogisticaInternacionalProcessoDefaultArgs> = $Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload, S>

  type LogisticaInternacionalProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LogisticaInternacionalProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LogisticaInternacionalProcessoCountAggregateInputType | true
    }

  export interface LogisticaInternacionalProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LogisticaInternacionalProcesso'], meta: { name: 'LogisticaInternacionalProcesso' } }
    /**
     * Find zero or one LogisticaInternacionalProcesso that matches the filter.
     * @param {LogisticaInternacionalProcessoFindUniqueArgs} args - Arguments to find a LogisticaInternacionalProcesso
     * @example
     * // Get one LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LogisticaInternacionalProcessoFindUniqueArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoFindUniqueArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LogisticaInternacionalProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LogisticaInternacionalProcessoFindUniqueOrThrowArgs} args - Arguments to find a LogisticaInternacionalProcesso
     * @example
     * // Get one LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LogisticaInternacionalProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LogisticaInternacionalProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoFindFirstArgs} args - Arguments to find a LogisticaInternacionalProcesso
     * @example
     * // Get one LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LogisticaInternacionalProcessoFindFirstArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoFindFirstArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LogisticaInternacionalProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoFindFirstOrThrowArgs} args - Arguments to find a LogisticaInternacionalProcesso
     * @example
     * // Get one LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LogisticaInternacionalProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LogisticaInternacionalProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LogisticaInternacionalProcessos
     * const logisticaInternacionalProcessos = await prisma.logisticaInternacionalProcesso.findMany()
     * 
     * // Get first 10 LogisticaInternacionalProcessos
     * const logisticaInternacionalProcessos = await prisma.logisticaInternacionalProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_logistica_internacional_processo`
     * const logisticaInternacionalProcessoWithId_logistica_internacional_processoOnly = await prisma.logisticaInternacionalProcesso.findMany({ select: { id_logistica_internacional_processo: true } })
     * 
     */
    findMany<T extends LogisticaInternacionalProcessoFindManyArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LogisticaInternacionalProcesso.
     * @param {LogisticaInternacionalProcessoCreateArgs} args - Arguments to create a LogisticaInternacionalProcesso.
     * @example
     * // Create one LogisticaInternacionalProcesso
     * const LogisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.create({
     *   data: {
     *     // ... data to create a LogisticaInternacionalProcesso
     *   }
     * })
     * 
     */
    create<T extends LogisticaInternacionalProcessoCreateArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoCreateArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LogisticaInternacionalProcessos.
     * @param {LogisticaInternacionalProcessoCreateManyArgs} args - Arguments to create many LogisticaInternacionalProcessos.
     * @example
     * // Create many LogisticaInternacionalProcessos
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LogisticaInternacionalProcessoCreateManyArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LogisticaInternacionalProcessos and returns the data saved in the database.
     * @param {LogisticaInternacionalProcessoCreateManyAndReturnArgs} args - Arguments to create many LogisticaInternacionalProcessos.
     * @example
     * // Create many LogisticaInternacionalProcessos
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LogisticaInternacionalProcessos and only return the `id_logistica_internacional_processo`
     * const logisticaInternacionalProcessoWithId_logistica_internacional_processoOnly = await prisma.logisticaInternacionalProcesso.createManyAndReturn({ 
     *   select: { id_logistica_internacional_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LogisticaInternacionalProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a LogisticaInternacionalProcesso.
     * @param {LogisticaInternacionalProcessoDeleteArgs} args - Arguments to delete one LogisticaInternacionalProcesso.
     * @example
     * // Delete one LogisticaInternacionalProcesso
     * const LogisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.delete({
     *   where: {
     *     // ... filter to delete one LogisticaInternacionalProcesso
     *   }
     * })
     * 
     */
    delete<T extends LogisticaInternacionalProcessoDeleteArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoDeleteArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LogisticaInternacionalProcesso.
     * @param {LogisticaInternacionalProcessoUpdateArgs} args - Arguments to update one LogisticaInternacionalProcesso.
     * @example
     * // Update one LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LogisticaInternacionalProcessoUpdateArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoUpdateArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LogisticaInternacionalProcessos.
     * @param {LogisticaInternacionalProcessoDeleteManyArgs} args - Arguments to filter LogisticaInternacionalProcessos to delete.
     * @example
     * // Delete a few LogisticaInternacionalProcessos
     * const { count } = await prisma.logisticaInternacionalProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LogisticaInternacionalProcessoDeleteManyArgs>(args?: SelectSubset<T, LogisticaInternacionalProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LogisticaInternacionalProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LogisticaInternacionalProcessos
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LogisticaInternacionalProcessoUpdateManyArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LogisticaInternacionalProcesso.
     * @param {LogisticaInternacionalProcessoUpsertArgs} args - Arguments to update or create a LogisticaInternacionalProcesso.
     * @example
     * // Update or create a LogisticaInternacionalProcesso
     * const logisticaInternacionalProcesso = await prisma.logisticaInternacionalProcesso.upsert({
     *   create: {
     *     // ... data to create a LogisticaInternacionalProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LogisticaInternacionalProcesso we want to update
     *   }
     * })
     */
    upsert<T extends LogisticaInternacionalProcessoUpsertArgs>(args: SelectSubset<T, LogisticaInternacionalProcessoUpsertArgs<ExtArgs>>): Prisma__LogisticaInternacionalProcessoClient<$Result.GetResult<Prisma.$LogisticaInternacionalProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of LogisticaInternacionalProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoCountArgs} args - Arguments to filter LogisticaInternacionalProcessos to count.
     * @example
     * // Count the number of LogisticaInternacionalProcessos
     * const count = await prisma.logisticaInternacionalProcesso.count({
     *   where: {
     *     // ... the filter for the LogisticaInternacionalProcessos we want to count
     *   }
     * })
    **/
    count<T extends LogisticaInternacionalProcessoCountArgs>(
      args?: Subset<T, LogisticaInternacionalProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LogisticaInternacionalProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LogisticaInternacionalProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LogisticaInternacionalProcessoAggregateArgs>(args: Subset<T, LogisticaInternacionalProcessoAggregateArgs>): Prisma.PrismaPromise<GetLogisticaInternacionalProcessoAggregateType<T>>

    /**
     * Group by LogisticaInternacionalProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogisticaInternacionalProcessoGroupByArgs} args - Group by arguments.
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
      T extends LogisticaInternacionalProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LogisticaInternacionalProcessoGroupByArgs['orderBy'] }
        : { orderBy?: LogisticaInternacionalProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, LogisticaInternacionalProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLogisticaInternacionalProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LogisticaInternacionalProcesso model
   */
  readonly fields: LogisticaInternacionalProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LogisticaInternacionalProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LogisticaInternacionalProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the LogisticaInternacionalProcesso model
   */ 
  interface LogisticaInternacionalProcessoFieldRefs {
    readonly id_logistica_internacional_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_organizacao: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly modal_frete_internacional_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly tipo_frete_internacional_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly tipo_volume_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly incoterm_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly porto_origem_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly porto_destino_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly porto_transbordo_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly aeroporto_origem_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly aeroporto_destino_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly aeroporto_escala_processo: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_agente_carga: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_armador: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_cia_aerea: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_transportador_rodo_internacional: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_transportador_rodo_nacional: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_transportador_ferroviario: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_despachante: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_armazem_alfandegado: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly id_seguradora_internacional: FieldRef<"LogisticaInternacionalProcesso", 'String'>
    readonly data_criacao_logistica_internacional_processo: FieldRef<"LogisticaInternacionalProcesso", 'DateTime'>
    readonly data_atualizacao_logistica_internacional_processo: FieldRef<"LogisticaInternacionalProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LogisticaInternacionalProcesso findUnique
   */
  export type LogisticaInternacionalProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter, which LogisticaInternacionalProcesso to fetch.
     */
    where: LogisticaInternacionalProcessoWhereUniqueInput
  }

  /**
   * LogisticaInternacionalProcesso findUniqueOrThrow
   */
  export type LogisticaInternacionalProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter, which LogisticaInternacionalProcesso to fetch.
     */
    where: LogisticaInternacionalProcessoWhereUniqueInput
  }

  /**
   * LogisticaInternacionalProcesso findFirst
   */
  export type LogisticaInternacionalProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter, which LogisticaInternacionalProcesso to fetch.
     */
    where?: LogisticaInternacionalProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogisticaInternacionalProcessos to fetch.
     */
    orderBy?: LogisticaInternacionalProcessoOrderByWithRelationInput | LogisticaInternacionalProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LogisticaInternacionalProcessos.
     */
    cursor?: LogisticaInternacionalProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogisticaInternacionalProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogisticaInternacionalProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LogisticaInternacionalProcessos.
     */
    distinct?: LogisticaInternacionalProcessoScalarFieldEnum | LogisticaInternacionalProcessoScalarFieldEnum[]
  }

  /**
   * LogisticaInternacionalProcesso findFirstOrThrow
   */
  export type LogisticaInternacionalProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter, which LogisticaInternacionalProcesso to fetch.
     */
    where?: LogisticaInternacionalProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogisticaInternacionalProcessos to fetch.
     */
    orderBy?: LogisticaInternacionalProcessoOrderByWithRelationInput | LogisticaInternacionalProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LogisticaInternacionalProcessos.
     */
    cursor?: LogisticaInternacionalProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogisticaInternacionalProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogisticaInternacionalProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LogisticaInternacionalProcessos.
     */
    distinct?: LogisticaInternacionalProcessoScalarFieldEnum | LogisticaInternacionalProcessoScalarFieldEnum[]
  }

  /**
   * LogisticaInternacionalProcesso findMany
   */
  export type LogisticaInternacionalProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter, which LogisticaInternacionalProcessos to fetch.
     */
    where?: LogisticaInternacionalProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogisticaInternacionalProcessos to fetch.
     */
    orderBy?: LogisticaInternacionalProcessoOrderByWithRelationInput | LogisticaInternacionalProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LogisticaInternacionalProcessos.
     */
    cursor?: LogisticaInternacionalProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogisticaInternacionalProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogisticaInternacionalProcessos.
     */
    skip?: number
    distinct?: LogisticaInternacionalProcessoScalarFieldEnum | LogisticaInternacionalProcessoScalarFieldEnum[]
  }

  /**
   * LogisticaInternacionalProcesso create
   */
  export type LogisticaInternacionalProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a LogisticaInternacionalProcesso.
     */
    data: XOR<LogisticaInternacionalProcessoCreateInput, LogisticaInternacionalProcessoUncheckedCreateInput>
  }

  /**
   * LogisticaInternacionalProcesso createMany
   */
  export type LogisticaInternacionalProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LogisticaInternacionalProcessos.
     */
    data: LogisticaInternacionalProcessoCreateManyInput | LogisticaInternacionalProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LogisticaInternacionalProcesso createManyAndReturn
   */
  export type LogisticaInternacionalProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many LogisticaInternacionalProcessos.
     */
    data: LogisticaInternacionalProcessoCreateManyInput | LogisticaInternacionalProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LogisticaInternacionalProcesso update
   */
  export type LogisticaInternacionalProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a LogisticaInternacionalProcesso.
     */
    data: XOR<LogisticaInternacionalProcessoUpdateInput, LogisticaInternacionalProcessoUncheckedUpdateInput>
    /**
     * Choose, which LogisticaInternacionalProcesso to update.
     */
    where: LogisticaInternacionalProcessoWhereUniqueInput
  }

  /**
   * LogisticaInternacionalProcesso updateMany
   */
  export type LogisticaInternacionalProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LogisticaInternacionalProcessos.
     */
    data: XOR<LogisticaInternacionalProcessoUpdateManyMutationInput, LogisticaInternacionalProcessoUncheckedUpdateManyInput>
    /**
     * Filter which LogisticaInternacionalProcessos to update
     */
    where?: LogisticaInternacionalProcessoWhereInput
  }

  /**
   * LogisticaInternacionalProcesso upsert
   */
  export type LogisticaInternacionalProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the LogisticaInternacionalProcesso to update in case it exists.
     */
    where: LogisticaInternacionalProcessoWhereUniqueInput
    /**
     * In case the LogisticaInternacionalProcesso found by the `where` argument doesn't exist, create a new LogisticaInternacionalProcesso with this data.
     */
    create: XOR<LogisticaInternacionalProcessoCreateInput, LogisticaInternacionalProcessoUncheckedCreateInput>
    /**
     * In case the LogisticaInternacionalProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LogisticaInternacionalProcessoUpdateInput, LogisticaInternacionalProcessoUncheckedUpdateInput>
  }

  /**
   * LogisticaInternacionalProcesso delete
   */
  export type LogisticaInternacionalProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
    /**
     * Filter which LogisticaInternacionalProcesso to delete.
     */
    where: LogisticaInternacionalProcessoWhereUniqueInput
  }

  /**
   * LogisticaInternacionalProcesso deleteMany
   */
  export type LogisticaInternacionalProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LogisticaInternacionalProcessos to delete
     */
    where?: LogisticaInternacionalProcessoWhereInput
  }

  /**
   * LogisticaInternacionalProcesso without action
   */
  export type LogisticaInternacionalProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogisticaInternacionalProcesso
     */
    select?: LogisticaInternacionalProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LogisticaInternacionalProcessoInclude<ExtArgs> | null
  }


  /**
   * Model DadosProcesso
   */

  export type AggregateDadosProcesso = {
    _count: DadosProcessoCountAggregateOutputType | null
    _min: DadosProcessoMinAggregateOutputType | null
    _max: DadosProcessoMaxAggregateOutputType | null
  }

  export type DadosProcessoMinAggregateOutputType = {
    id_dados_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    canal_parametrizacao_processo: string | null
    numero_duimp_processo: string | null
    numero_nfe_processo: string | null
    chave_acesso_nfe_processo: string | null
    data_registro_duimp_processo: Date | null
    data_liberacao_duimp_processo: Date | null
    data_consulta_liberacao_duimp_processo: Date | null
    data_previsao_registro_duimp_processo: Date | null
    data_previsao_liberacao_duimp_processo: Date | null
    data_registro_lpco_processo: Date | null
    data_deferimento_lpco_processo: Date | null
    data_indeferimento_lpco_processo: Date | null
    data_pendencia_lpco_processo: Date | null
    data_consulta_liberacao_lpco_processo: Date | null
    data_previsao_registro_lpco_processo: Date | null
    data_criacao_dados_processo: Date | null
    data_atualizacao_dados_processo: Date | null
  }

  export type DadosProcessoMaxAggregateOutputType = {
    id_dados_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    canal_parametrizacao_processo: string | null
    numero_duimp_processo: string | null
    numero_nfe_processo: string | null
    chave_acesso_nfe_processo: string | null
    data_registro_duimp_processo: Date | null
    data_liberacao_duimp_processo: Date | null
    data_consulta_liberacao_duimp_processo: Date | null
    data_previsao_registro_duimp_processo: Date | null
    data_previsao_liberacao_duimp_processo: Date | null
    data_registro_lpco_processo: Date | null
    data_deferimento_lpco_processo: Date | null
    data_indeferimento_lpco_processo: Date | null
    data_pendencia_lpco_processo: Date | null
    data_consulta_liberacao_lpco_processo: Date | null
    data_previsao_registro_lpco_processo: Date | null
    data_criacao_dados_processo: Date | null
    data_atualizacao_dados_processo: Date | null
  }

  export type DadosProcessoCountAggregateOutputType = {
    id_dados_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    canal_parametrizacao_processo: number
    numero_duimp_processo: number
    numero_nfe_processo: number
    chave_acesso_nfe_processo: number
    data_registro_duimp_processo: number
    data_liberacao_duimp_processo: number
    data_consulta_liberacao_duimp_processo: number
    data_previsao_registro_duimp_processo: number
    data_previsao_liberacao_duimp_processo: number
    data_registro_lpco_processo: number
    data_deferimento_lpco_processo: number
    data_indeferimento_lpco_processo: number
    data_pendencia_lpco_processo: number
    data_consulta_liberacao_lpco_processo: number
    data_previsao_registro_lpco_processo: number
    data_criacao_dados_processo: number
    data_atualizacao_dados_processo: number
    _all: number
  }


  export type DadosProcessoMinAggregateInputType = {
    id_dados_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    canal_parametrizacao_processo?: true
    numero_duimp_processo?: true
    numero_nfe_processo?: true
    chave_acesso_nfe_processo?: true
    data_registro_duimp_processo?: true
    data_liberacao_duimp_processo?: true
    data_consulta_liberacao_duimp_processo?: true
    data_previsao_registro_duimp_processo?: true
    data_previsao_liberacao_duimp_processo?: true
    data_registro_lpco_processo?: true
    data_deferimento_lpco_processo?: true
    data_indeferimento_lpco_processo?: true
    data_pendencia_lpco_processo?: true
    data_consulta_liberacao_lpco_processo?: true
    data_previsao_registro_lpco_processo?: true
    data_criacao_dados_processo?: true
    data_atualizacao_dados_processo?: true
  }

  export type DadosProcessoMaxAggregateInputType = {
    id_dados_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    canal_parametrizacao_processo?: true
    numero_duimp_processo?: true
    numero_nfe_processo?: true
    chave_acesso_nfe_processo?: true
    data_registro_duimp_processo?: true
    data_liberacao_duimp_processo?: true
    data_consulta_liberacao_duimp_processo?: true
    data_previsao_registro_duimp_processo?: true
    data_previsao_liberacao_duimp_processo?: true
    data_registro_lpco_processo?: true
    data_deferimento_lpco_processo?: true
    data_indeferimento_lpco_processo?: true
    data_pendencia_lpco_processo?: true
    data_consulta_liberacao_lpco_processo?: true
    data_previsao_registro_lpco_processo?: true
    data_criacao_dados_processo?: true
    data_atualizacao_dados_processo?: true
  }

  export type DadosProcessoCountAggregateInputType = {
    id_dados_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    canal_parametrizacao_processo?: true
    numero_duimp_processo?: true
    numero_nfe_processo?: true
    chave_acesso_nfe_processo?: true
    data_registro_duimp_processo?: true
    data_liberacao_duimp_processo?: true
    data_consulta_liberacao_duimp_processo?: true
    data_previsao_registro_duimp_processo?: true
    data_previsao_liberacao_duimp_processo?: true
    data_registro_lpco_processo?: true
    data_deferimento_lpco_processo?: true
    data_indeferimento_lpco_processo?: true
    data_pendencia_lpco_processo?: true
    data_consulta_liberacao_lpco_processo?: true
    data_previsao_registro_lpco_processo?: true
    data_criacao_dados_processo?: true
    data_atualizacao_dados_processo?: true
    _all?: true
  }

  export type DadosProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DadosProcesso to aggregate.
     */
    where?: DadosProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosProcessos to fetch.
     */
    orderBy?: DadosProcessoOrderByWithRelationInput | DadosProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DadosProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DadosProcessos
    **/
    _count?: true | DadosProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DadosProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DadosProcessoMaxAggregateInputType
  }

  export type GetDadosProcessoAggregateType<T extends DadosProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateDadosProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDadosProcesso[P]>
      : GetScalarType<T[P], AggregateDadosProcesso[P]>
  }




  export type DadosProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DadosProcessoWhereInput
    orderBy?: DadosProcessoOrderByWithAggregationInput | DadosProcessoOrderByWithAggregationInput[]
    by: DadosProcessoScalarFieldEnum[] | DadosProcessoScalarFieldEnum
    having?: DadosProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DadosProcessoCountAggregateInputType | true
    _min?: DadosProcessoMinAggregateInputType
    _max?: DadosProcessoMaxAggregateInputType
  }

  export type DadosProcessoGroupByOutputType = {
    id_dados_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    canal_parametrizacao_processo: string | null
    numero_duimp_processo: string | null
    numero_nfe_processo: string | null
    chave_acesso_nfe_processo: string | null
    data_registro_duimp_processo: Date | null
    data_liberacao_duimp_processo: Date | null
    data_consulta_liberacao_duimp_processo: Date | null
    data_previsao_registro_duimp_processo: Date | null
    data_previsao_liberacao_duimp_processo: Date | null
    data_registro_lpco_processo: Date | null
    data_deferimento_lpco_processo: Date | null
    data_indeferimento_lpco_processo: Date | null
    data_pendencia_lpco_processo: Date | null
    data_consulta_liberacao_lpco_processo: Date | null
    data_previsao_registro_lpco_processo: Date | null
    data_criacao_dados_processo: Date
    data_atualizacao_dados_processo: Date
    _count: DadosProcessoCountAggregateOutputType | null
    _min: DadosProcessoMinAggregateOutputType | null
    _max: DadosProcessoMaxAggregateOutputType | null
  }

  type GetDadosProcessoGroupByPayload<T extends DadosProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DadosProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DadosProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DadosProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], DadosProcessoGroupByOutputType[P]>
        }
      >
    >


  export type DadosProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_dados_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    canal_parametrizacao_processo?: boolean
    numero_duimp_processo?: boolean
    numero_nfe_processo?: boolean
    chave_acesso_nfe_processo?: boolean
    data_registro_duimp_processo?: boolean
    data_liberacao_duimp_processo?: boolean
    data_consulta_liberacao_duimp_processo?: boolean
    data_previsao_registro_duimp_processo?: boolean
    data_previsao_liberacao_duimp_processo?: boolean
    data_registro_lpco_processo?: boolean
    data_deferimento_lpco_processo?: boolean
    data_indeferimento_lpco_processo?: boolean
    data_pendencia_lpco_processo?: boolean
    data_consulta_liberacao_lpco_processo?: boolean
    data_previsao_registro_lpco_processo?: boolean
    data_criacao_dados_processo?: boolean
    data_atualizacao_dados_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dadosProcesso"]>

  export type DadosProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_dados_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    canal_parametrizacao_processo?: boolean
    numero_duimp_processo?: boolean
    numero_nfe_processo?: boolean
    chave_acesso_nfe_processo?: boolean
    data_registro_duimp_processo?: boolean
    data_liberacao_duimp_processo?: boolean
    data_consulta_liberacao_duimp_processo?: boolean
    data_previsao_registro_duimp_processo?: boolean
    data_previsao_liberacao_duimp_processo?: boolean
    data_registro_lpco_processo?: boolean
    data_deferimento_lpco_processo?: boolean
    data_indeferimento_lpco_processo?: boolean
    data_pendencia_lpco_processo?: boolean
    data_consulta_liberacao_lpco_processo?: boolean
    data_previsao_registro_lpco_processo?: boolean
    data_criacao_dados_processo?: boolean
    data_atualizacao_dados_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dadosProcesso"]>

  export type DadosProcessoSelectScalar = {
    id_dados_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    canal_parametrizacao_processo?: boolean
    numero_duimp_processo?: boolean
    numero_nfe_processo?: boolean
    chave_acesso_nfe_processo?: boolean
    data_registro_duimp_processo?: boolean
    data_liberacao_duimp_processo?: boolean
    data_consulta_liberacao_duimp_processo?: boolean
    data_previsao_registro_duimp_processo?: boolean
    data_previsao_liberacao_duimp_processo?: boolean
    data_registro_lpco_processo?: boolean
    data_deferimento_lpco_processo?: boolean
    data_indeferimento_lpco_processo?: boolean
    data_pendencia_lpco_processo?: boolean
    data_consulta_liberacao_lpco_processo?: boolean
    data_previsao_registro_lpco_processo?: boolean
    data_criacao_dados_processo?: boolean
    data_atualizacao_dados_processo?: boolean
  }

  export type DadosProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type DadosProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $DadosProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DadosProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_dados_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      canal_parametrizacao_processo: string | null
      numero_duimp_processo: string | null
      numero_nfe_processo: string | null
      chave_acesso_nfe_processo: string | null
      data_registro_duimp_processo: Date | null
      data_liberacao_duimp_processo: Date | null
      data_consulta_liberacao_duimp_processo: Date | null
      data_previsao_registro_duimp_processo: Date | null
      data_previsao_liberacao_duimp_processo: Date | null
      data_registro_lpco_processo: Date | null
      data_deferimento_lpco_processo: Date | null
      data_indeferimento_lpco_processo: Date | null
      data_pendencia_lpco_processo: Date | null
      data_consulta_liberacao_lpco_processo: Date | null
      data_previsao_registro_lpco_processo: Date | null
      data_criacao_dados_processo: Date
      data_atualizacao_dados_processo: Date
    }, ExtArgs["result"]["dadosProcesso"]>
    composites: {}
  }

  type DadosProcessoGetPayload<S extends boolean | null | undefined | DadosProcessoDefaultArgs> = $Result.GetResult<Prisma.$DadosProcessoPayload, S>

  type DadosProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DadosProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DadosProcessoCountAggregateInputType | true
    }

  export interface DadosProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DadosProcesso'], meta: { name: 'DadosProcesso' } }
    /**
     * Find zero or one DadosProcesso that matches the filter.
     * @param {DadosProcessoFindUniqueArgs} args - Arguments to find a DadosProcesso
     * @example
     * // Get one DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DadosProcessoFindUniqueArgs>(args: SelectSubset<T, DadosProcessoFindUniqueArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DadosProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DadosProcessoFindUniqueOrThrowArgs} args - Arguments to find a DadosProcesso
     * @example
     * // Get one DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DadosProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, DadosProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DadosProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoFindFirstArgs} args - Arguments to find a DadosProcesso
     * @example
     * // Get one DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DadosProcessoFindFirstArgs>(args?: SelectSubset<T, DadosProcessoFindFirstArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DadosProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoFindFirstOrThrowArgs} args - Arguments to find a DadosProcesso
     * @example
     * // Get one DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DadosProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, DadosProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DadosProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DadosProcessos
     * const dadosProcessos = await prisma.dadosProcesso.findMany()
     * 
     * // Get first 10 DadosProcessos
     * const dadosProcessos = await prisma.dadosProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_dados_processo`
     * const dadosProcessoWithId_dados_processoOnly = await prisma.dadosProcesso.findMany({ select: { id_dados_processo: true } })
     * 
     */
    findMany<T extends DadosProcessoFindManyArgs>(args?: SelectSubset<T, DadosProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DadosProcesso.
     * @param {DadosProcessoCreateArgs} args - Arguments to create a DadosProcesso.
     * @example
     * // Create one DadosProcesso
     * const DadosProcesso = await prisma.dadosProcesso.create({
     *   data: {
     *     // ... data to create a DadosProcesso
     *   }
     * })
     * 
     */
    create<T extends DadosProcessoCreateArgs>(args: SelectSubset<T, DadosProcessoCreateArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DadosProcessos.
     * @param {DadosProcessoCreateManyArgs} args - Arguments to create many DadosProcessos.
     * @example
     * // Create many DadosProcessos
     * const dadosProcesso = await prisma.dadosProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DadosProcessoCreateManyArgs>(args?: SelectSubset<T, DadosProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DadosProcessos and returns the data saved in the database.
     * @param {DadosProcessoCreateManyAndReturnArgs} args - Arguments to create many DadosProcessos.
     * @example
     * // Create many DadosProcessos
     * const dadosProcesso = await prisma.dadosProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DadosProcessos and only return the `id_dados_processo`
     * const dadosProcessoWithId_dados_processoOnly = await prisma.dadosProcesso.createManyAndReturn({ 
     *   select: { id_dados_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DadosProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, DadosProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DadosProcesso.
     * @param {DadosProcessoDeleteArgs} args - Arguments to delete one DadosProcesso.
     * @example
     * // Delete one DadosProcesso
     * const DadosProcesso = await prisma.dadosProcesso.delete({
     *   where: {
     *     // ... filter to delete one DadosProcesso
     *   }
     * })
     * 
     */
    delete<T extends DadosProcessoDeleteArgs>(args: SelectSubset<T, DadosProcessoDeleteArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DadosProcesso.
     * @param {DadosProcessoUpdateArgs} args - Arguments to update one DadosProcesso.
     * @example
     * // Update one DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DadosProcessoUpdateArgs>(args: SelectSubset<T, DadosProcessoUpdateArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DadosProcessos.
     * @param {DadosProcessoDeleteManyArgs} args - Arguments to filter DadosProcessos to delete.
     * @example
     * // Delete a few DadosProcessos
     * const { count } = await prisma.dadosProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DadosProcessoDeleteManyArgs>(args?: SelectSubset<T, DadosProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DadosProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DadosProcessos
     * const dadosProcesso = await prisma.dadosProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DadosProcessoUpdateManyArgs>(args: SelectSubset<T, DadosProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DadosProcesso.
     * @param {DadosProcessoUpsertArgs} args - Arguments to update or create a DadosProcesso.
     * @example
     * // Update or create a DadosProcesso
     * const dadosProcesso = await prisma.dadosProcesso.upsert({
     *   create: {
     *     // ... data to create a DadosProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DadosProcesso we want to update
     *   }
     * })
     */
    upsert<T extends DadosProcessoUpsertArgs>(args: SelectSubset<T, DadosProcessoUpsertArgs<ExtArgs>>): Prisma__DadosProcessoClient<$Result.GetResult<Prisma.$DadosProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DadosProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoCountArgs} args - Arguments to filter DadosProcessos to count.
     * @example
     * // Count the number of DadosProcessos
     * const count = await prisma.dadosProcesso.count({
     *   where: {
     *     // ... the filter for the DadosProcessos we want to count
     *   }
     * })
    **/
    count<T extends DadosProcessoCountArgs>(
      args?: Subset<T, DadosProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DadosProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DadosProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DadosProcessoAggregateArgs>(args: Subset<T, DadosProcessoAggregateArgs>): Prisma.PrismaPromise<GetDadosProcessoAggregateType<T>>

    /**
     * Group by DadosProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosProcessoGroupByArgs} args - Group by arguments.
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
      T extends DadosProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DadosProcessoGroupByArgs['orderBy'] }
        : { orderBy?: DadosProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DadosProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDadosProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DadosProcesso model
   */
  readonly fields: DadosProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DadosProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DadosProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the DadosProcesso model
   */ 
  interface DadosProcessoFieldRefs {
    readonly id_dados_processo: FieldRef<"DadosProcesso", 'String'>
    readonly id_organizacao: FieldRef<"DadosProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"DadosProcesso", 'String'>
    readonly id_processo: FieldRef<"DadosProcesso", 'String'>
    readonly canal_parametrizacao_processo: FieldRef<"DadosProcesso", 'String'>
    readonly numero_duimp_processo: FieldRef<"DadosProcesso", 'String'>
    readonly numero_nfe_processo: FieldRef<"DadosProcesso", 'String'>
    readonly chave_acesso_nfe_processo: FieldRef<"DadosProcesso", 'String'>
    readonly data_registro_duimp_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_liberacao_duimp_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_consulta_liberacao_duimp_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_previsao_registro_duimp_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_previsao_liberacao_duimp_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_registro_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_deferimento_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_indeferimento_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_pendencia_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_consulta_liberacao_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_previsao_registro_lpco_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_criacao_dados_processo: FieldRef<"DadosProcesso", 'DateTime'>
    readonly data_atualizacao_dados_processo: FieldRef<"DadosProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DadosProcesso findUnique
   */
  export type DadosProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DadosProcesso to fetch.
     */
    where: DadosProcessoWhereUniqueInput
  }

  /**
   * DadosProcesso findUniqueOrThrow
   */
  export type DadosProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DadosProcesso to fetch.
     */
    where: DadosProcessoWhereUniqueInput
  }

  /**
   * DadosProcesso findFirst
   */
  export type DadosProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DadosProcesso to fetch.
     */
    where?: DadosProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosProcessos to fetch.
     */
    orderBy?: DadosProcessoOrderByWithRelationInput | DadosProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DadosProcessos.
     */
    cursor?: DadosProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DadosProcessos.
     */
    distinct?: DadosProcessoScalarFieldEnum | DadosProcessoScalarFieldEnum[]
  }

  /**
   * DadosProcesso findFirstOrThrow
   */
  export type DadosProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DadosProcesso to fetch.
     */
    where?: DadosProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosProcessos to fetch.
     */
    orderBy?: DadosProcessoOrderByWithRelationInput | DadosProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DadosProcessos.
     */
    cursor?: DadosProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DadosProcessos.
     */
    distinct?: DadosProcessoScalarFieldEnum | DadosProcessoScalarFieldEnum[]
  }

  /**
   * DadosProcesso findMany
   */
  export type DadosProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DadosProcessos to fetch.
     */
    where?: DadosProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosProcessos to fetch.
     */
    orderBy?: DadosProcessoOrderByWithRelationInput | DadosProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DadosProcessos.
     */
    cursor?: DadosProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosProcessos.
     */
    skip?: number
    distinct?: DadosProcessoScalarFieldEnum | DadosProcessoScalarFieldEnum[]
  }

  /**
   * DadosProcesso create
   */
  export type DadosProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a DadosProcesso.
     */
    data: XOR<DadosProcessoCreateInput, DadosProcessoUncheckedCreateInput>
  }

  /**
   * DadosProcesso createMany
   */
  export type DadosProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DadosProcessos.
     */
    data: DadosProcessoCreateManyInput | DadosProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DadosProcesso createManyAndReturn
   */
  export type DadosProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DadosProcessos.
     */
    data: DadosProcessoCreateManyInput | DadosProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DadosProcesso update
   */
  export type DadosProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a DadosProcesso.
     */
    data: XOR<DadosProcessoUpdateInput, DadosProcessoUncheckedUpdateInput>
    /**
     * Choose, which DadosProcesso to update.
     */
    where: DadosProcessoWhereUniqueInput
  }

  /**
   * DadosProcesso updateMany
   */
  export type DadosProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DadosProcessos.
     */
    data: XOR<DadosProcessoUpdateManyMutationInput, DadosProcessoUncheckedUpdateManyInput>
    /**
     * Filter which DadosProcessos to update
     */
    where?: DadosProcessoWhereInput
  }

  /**
   * DadosProcesso upsert
   */
  export type DadosProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the DadosProcesso to update in case it exists.
     */
    where: DadosProcessoWhereUniqueInput
    /**
     * In case the DadosProcesso found by the `where` argument doesn't exist, create a new DadosProcesso with this data.
     */
    create: XOR<DadosProcessoCreateInput, DadosProcessoUncheckedCreateInput>
    /**
     * In case the DadosProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DadosProcessoUpdateInput, DadosProcessoUncheckedUpdateInput>
  }

  /**
   * DadosProcesso delete
   */
  export type DadosProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
    /**
     * Filter which DadosProcesso to delete.
     */
    where: DadosProcessoWhereUniqueInput
  }

  /**
   * DadosProcesso deleteMany
   */
  export type DadosProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DadosProcessos to delete
     */
    where?: DadosProcessoWhereInput
  }

  /**
   * DadosProcesso without action
   */
  export type DadosProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosProcesso
     */
    select?: DadosProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosProcessoInclude<ExtArgs> | null
  }


  /**
   * Model CambioProcesso
   */

  export type AggregateCambioProcesso = {
    _count: CambioProcessoCountAggregateOutputType | null
    _min: CambioProcessoMinAggregateOutputType | null
    _max: CambioProcessoMaxAggregateOutputType | null
  }

  export type CambioProcessoMinAggregateOutputType = {
    id_cambio_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    id_banco_processo: string | null
    id_corretora_cambio_processo: string | null
    data_criacao_cambio_processo: Date | null
    data_atualizacao_cambio_processo: Date | null
  }

  export type CambioProcessoMaxAggregateOutputType = {
    id_cambio_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    id_banco_processo: string | null
    id_corretora_cambio_processo: string | null
    data_criacao_cambio_processo: Date | null
    data_atualizacao_cambio_processo: Date | null
  }

  export type CambioProcessoCountAggregateOutputType = {
    id_cambio_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    id_banco_processo: number
    id_corretora_cambio_processo: number
    data_criacao_cambio_processo: number
    data_atualizacao_cambio_processo: number
    _all: number
  }


  export type CambioProcessoMinAggregateInputType = {
    id_cambio_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_banco_processo?: true
    id_corretora_cambio_processo?: true
    data_criacao_cambio_processo?: true
    data_atualizacao_cambio_processo?: true
  }

  export type CambioProcessoMaxAggregateInputType = {
    id_cambio_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_banco_processo?: true
    id_corretora_cambio_processo?: true
    data_criacao_cambio_processo?: true
    data_atualizacao_cambio_processo?: true
  }

  export type CambioProcessoCountAggregateInputType = {
    id_cambio_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    id_banco_processo?: true
    id_corretora_cambio_processo?: true
    data_criacao_cambio_processo?: true
    data_atualizacao_cambio_processo?: true
    _all?: true
  }

  export type CambioProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CambioProcesso to aggregate.
     */
    where?: CambioProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CambioProcessos to fetch.
     */
    orderBy?: CambioProcessoOrderByWithRelationInput | CambioProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CambioProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CambioProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CambioProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CambioProcessos
    **/
    _count?: true | CambioProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CambioProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CambioProcessoMaxAggregateInputType
  }

  export type GetCambioProcessoAggregateType<T extends CambioProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateCambioProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCambioProcesso[P]>
      : GetScalarType<T[P], AggregateCambioProcesso[P]>
  }




  export type CambioProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CambioProcessoWhereInput
    orderBy?: CambioProcessoOrderByWithAggregationInput | CambioProcessoOrderByWithAggregationInput[]
    by: CambioProcessoScalarFieldEnum[] | CambioProcessoScalarFieldEnum
    having?: CambioProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CambioProcessoCountAggregateInputType | true
    _min?: CambioProcessoMinAggregateInputType
    _max?: CambioProcessoMaxAggregateInputType
  }

  export type CambioProcessoGroupByOutputType = {
    id_cambio_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    id_banco_processo: string | null
    id_corretora_cambio_processo: string | null
    data_criacao_cambio_processo: Date
    data_atualizacao_cambio_processo: Date
    _count: CambioProcessoCountAggregateOutputType | null
    _min: CambioProcessoMinAggregateOutputType | null
    _max: CambioProcessoMaxAggregateOutputType | null
  }

  type GetCambioProcessoGroupByPayload<T extends CambioProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CambioProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CambioProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CambioProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], CambioProcessoGroupByOutputType[P]>
        }
      >
    >


  export type CambioProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cambio_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_banco_processo?: boolean
    id_corretora_cambio_processo?: boolean
    data_criacao_cambio_processo?: boolean
    data_atualizacao_cambio_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cambioProcesso"]>

  export type CambioProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_cambio_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_banco_processo?: boolean
    id_corretora_cambio_processo?: boolean
    data_criacao_cambio_processo?: boolean
    data_atualizacao_cambio_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cambioProcesso"]>

  export type CambioProcessoSelectScalar = {
    id_cambio_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    id_banco_processo?: boolean
    id_corretora_cambio_processo?: boolean
    data_criacao_cambio_processo?: boolean
    data_atualizacao_cambio_processo?: boolean
  }

  export type CambioProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type CambioProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $CambioProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CambioProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_cambio_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      id_banco_processo: string | null
      id_corretora_cambio_processo: string | null
      data_criacao_cambio_processo: Date
      data_atualizacao_cambio_processo: Date
    }, ExtArgs["result"]["cambioProcesso"]>
    composites: {}
  }

  type CambioProcessoGetPayload<S extends boolean | null | undefined | CambioProcessoDefaultArgs> = $Result.GetResult<Prisma.$CambioProcessoPayload, S>

  type CambioProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CambioProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CambioProcessoCountAggregateInputType | true
    }

  export interface CambioProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CambioProcesso'], meta: { name: 'CambioProcesso' } }
    /**
     * Find zero or one CambioProcesso that matches the filter.
     * @param {CambioProcessoFindUniqueArgs} args - Arguments to find a CambioProcesso
     * @example
     * // Get one CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CambioProcessoFindUniqueArgs>(args: SelectSubset<T, CambioProcessoFindUniqueArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CambioProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CambioProcessoFindUniqueOrThrowArgs} args - Arguments to find a CambioProcesso
     * @example
     * // Get one CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CambioProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, CambioProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CambioProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoFindFirstArgs} args - Arguments to find a CambioProcesso
     * @example
     * // Get one CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CambioProcessoFindFirstArgs>(args?: SelectSubset<T, CambioProcessoFindFirstArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CambioProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoFindFirstOrThrowArgs} args - Arguments to find a CambioProcesso
     * @example
     * // Get one CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CambioProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, CambioProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CambioProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CambioProcessos
     * const cambioProcessos = await prisma.cambioProcesso.findMany()
     * 
     * // Get first 10 CambioProcessos
     * const cambioProcessos = await prisma.cambioProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_cambio_processo`
     * const cambioProcessoWithId_cambio_processoOnly = await prisma.cambioProcesso.findMany({ select: { id_cambio_processo: true } })
     * 
     */
    findMany<T extends CambioProcessoFindManyArgs>(args?: SelectSubset<T, CambioProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CambioProcesso.
     * @param {CambioProcessoCreateArgs} args - Arguments to create a CambioProcesso.
     * @example
     * // Create one CambioProcesso
     * const CambioProcesso = await prisma.cambioProcesso.create({
     *   data: {
     *     // ... data to create a CambioProcesso
     *   }
     * })
     * 
     */
    create<T extends CambioProcessoCreateArgs>(args: SelectSubset<T, CambioProcessoCreateArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CambioProcessos.
     * @param {CambioProcessoCreateManyArgs} args - Arguments to create many CambioProcessos.
     * @example
     * // Create many CambioProcessos
     * const cambioProcesso = await prisma.cambioProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CambioProcessoCreateManyArgs>(args?: SelectSubset<T, CambioProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CambioProcessos and returns the data saved in the database.
     * @param {CambioProcessoCreateManyAndReturnArgs} args - Arguments to create many CambioProcessos.
     * @example
     * // Create many CambioProcessos
     * const cambioProcesso = await prisma.cambioProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CambioProcessos and only return the `id_cambio_processo`
     * const cambioProcessoWithId_cambio_processoOnly = await prisma.cambioProcesso.createManyAndReturn({ 
     *   select: { id_cambio_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CambioProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, CambioProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CambioProcesso.
     * @param {CambioProcessoDeleteArgs} args - Arguments to delete one CambioProcesso.
     * @example
     * // Delete one CambioProcesso
     * const CambioProcesso = await prisma.cambioProcesso.delete({
     *   where: {
     *     // ... filter to delete one CambioProcesso
     *   }
     * })
     * 
     */
    delete<T extends CambioProcessoDeleteArgs>(args: SelectSubset<T, CambioProcessoDeleteArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CambioProcesso.
     * @param {CambioProcessoUpdateArgs} args - Arguments to update one CambioProcesso.
     * @example
     * // Update one CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CambioProcessoUpdateArgs>(args: SelectSubset<T, CambioProcessoUpdateArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CambioProcessos.
     * @param {CambioProcessoDeleteManyArgs} args - Arguments to filter CambioProcessos to delete.
     * @example
     * // Delete a few CambioProcessos
     * const { count } = await prisma.cambioProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CambioProcessoDeleteManyArgs>(args?: SelectSubset<T, CambioProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CambioProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CambioProcessos
     * const cambioProcesso = await prisma.cambioProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CambioProcessoUpdateManyArgs>(args: SelectSubset<T, CambioProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CambioProcesso.
     * @param {CambioProcessoUpsertArgs} args - Arguments to update or create a CambioProcesso.
     * @example
     * // Update or create a CambioProcesso
     * const cambioProcesso = await prisma.cambioProcesso.upsert({
     *   create: {
     *     // ... data to create a CambioProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CambioProcesso we want to update
     *   }
     * })
     */
    upsert<T extends CambioProcessoUpsertArgs>(args: SelectSubset<T, CambioProcessoUpsertArgs<ExtArgs>>): Prisma__CambioProcessoClient<$Result.GetResult<Prisma.$CambioProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CambioProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoCountArgs} args - Arguments to filter CambioProcessos to count.
     * @example
     * // Count the number of CambioProcessos
     * const count = await prisma.cambioProcesso.count({
     *   where: {
     *     // ... the filter for the CambioProcessos we want to count
     *   }
     * })
    **/
    count<T extends CambioProcessoCountArgs>(
      args?: Subset<T, CambioProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CambioProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CambioProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CambioProcessoAggregateArgs>(args: Subset<T, CambioProcessoAggregateArgs>): Prisma.PrismaPromise<GetCambioProcessoAggregateType<T>>

    /**
     * Group by CambioProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CambioProcessoGroupByArgs} args - Group by arguments.
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
      T extends CambioProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CambioProcessoGroupByArgs['orderBy'] }
        : { orderBy?: CambioProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CambioProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCambioProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CambioProcesso model
   */
  readonly fields: CambioProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CambioProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CambioProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the CambioProcesso model
   */ 
  interface CambioProcessoFieldRefs {
    readonly id_cambio_processo: FieldRef<"CambioProcesso", 'String'>
    readonly id_organizacao: FieldRef<"CambioProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"CambioProcesso", 'String'>
    readonly id_processo: FieldRef<"CambioProcesso", 'String'>
    readonly id_banco_processo: FieldRef<"CambioProcesso", 'String'>
    readonly id_corretora_cambio_processo: FieldRef<"CambioProcesso", 'String'>
    readonly data_criacao_cambio_processo: FieldRef<"CambioProcesso", 'DateTime'>
    readonly data_atualizacao_cambio_processo: FieldRef<"CambioProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CambioProcesso findUnique
   */
  export type CambioProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter, which CambioProcesso to fetch.
     */
    where: CambioProcessoWhereUniqueInput
  }

  /**
   * CambioProcesso findUniqueOrThrow
   */
  export type CambioProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter, which CambioProcesso to fetch.
     */
    where: CambioProcessoWhereUniqueInput
  }

  /**
   * CambioProcesso findFirst
   */
  export type CambioProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter, which CambioProcesso to fetch.
     */
    where?: CambioProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CambioProcessos to fetch.
     */
    orderBy?: CambioProcessoOrderByWithRelationInput | CambioProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CambioProcessos.
     */
    cursor?: CambioProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CambioProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CambioProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CambioProcessos.
     */
    distinct?: CambioProcessoScalarFieldEnum | CambioProcessoScalarFieldEnum[]
  }

  /**
   * CambioProcesso findFirstOrThrow
   */
  export type CambioProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter, which CambioProcesso to fetch.
     */
    where?: CambioProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CambioProcessos to fetch.
     */
    orderBy?: CambioProcessoOrderByWithRelationInput | CambioProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CambioProcessos.
     */
    cursor?: CambioProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CambioProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CambioProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CambioProcessos.
     */
    distinct?: CambioProcessoScalarFieldEnum | CambioProcessoScalarFieldEnum[]
  }

  /**
   * CambioProcesso findMany
   */
  export type CambioProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter, which CambioProcessos to fetch.
     */
    where?: CambioProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CambioProcessos to fetch.
     */
    orderBy?: CambioProcessoOrderByWithRelationInput | CambioProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CambioProcessos.
     */
    cursor?: CambioProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CambioProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CambioProcessos.
     */
    skip?: number
    distinct?: CambioProcessoScalarFieldEnum | CambioProcessoScalarFieldEnum[]
  }

  /**
   * CambioProcesso create
   */
  export type CambioProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a CambioProcesso.
     */
    data: XOR<CambioProcessoCreateInput, CambioProcessoUncheckedCreateInput>
  }

  /**
   * CambioProcesso createMany
   */
  export type CambioProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CambioProcessos.
     */
    data: CambioProcessoCreateManyInput | CambioProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CambioProcesso createManyAndReturn
   */
  export type CambioProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CambioProcessos.
     */
    data: CambioProcessoCreateManyInput | CambioProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CambioProcesso update
   */
  export type CambioProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a CambioProcesso.
     */
    data: XOR<CambioProcessoUpdateInput, CambioProcessoUncheckedUpdateInput>
    /**
     * Choose, which CambioProcesso to update.
     */
    where: CambioProcessoWhereUniqueInput
  }

  /**
   * CambioProcesso updateMany
   */
  export type CambioProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CambioProcessos.
     */
    data: XOR<CambioProcessoUpdateManyMutationInput, CambioProcessoUncheckedUpdateManyInput>
    /**
     * Filter which CambioProcessos to update
     */
    where?: CambioProcessoWhereInput
  }

  /**
   * CambioProcesso upsert
   */
  export type CambioProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the CambioProcesso to update in case it exists.
     */
    where: CambioProcessoWhereUniqueInput
    /**
     * In case the CambioProcesso found by the `where` argument doesn't exist, create a new CambioProcesso with this data.
     */
    create: XOR<CambioProcessoCreateInput, CambioProcessoUncheckedCreateInput>
    /**
     * In case the CambioProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CambioProcessoUpdateInput, CambioProcessoUncheckedUpdateInput>
  }

  /**
   * CambioProcesso delete
   */
  export type CambioProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
    /**
     * Filter which CambioProcesso to delete.
     */
    where: CambioProcessoWhereUniqueInput
  }

  /**
   * CambioProcesso deleteMany
   */
  export type CambioProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CambioProcessos to delete
     */
    where?: CambioProcessoWhereInput
  }

  /**
   * CambioProcesso without action
   */
  export type CambioProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CambioProcesso
     */
    select?: CambioProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CambioProcessoInclude<ExtArgs> | null
  }


  /**
   * Model EstimativaProcesso
   */

  export type AggregateEstimativaProcesso = {
    _count: EstimativaProcessoCountAggregateOutputType | null
    _avg: EstimativaProcessoAvgAggregateOutputType | null
    _sum: EstimativaProcessoSumAggregateOutputType | null
    _min: EstimativaProcessoMinAggregateOutputType | null
    _max: EstimativaProcessoMaxAggregateOutputType | null
  }

  export type EstimativaProcessoAvgAggregateOutputType = {
    total_imposto_ii_processo: Decimal | null
    total_imposto_ipi_processo: Decimal | null
    total_imposto_pis_processo: Decimal | null
    total_imposto_cofins_processo: Decimal | null
    total_imposto_icms_processo: Decimal | null
    valor_frete_estimado_processo: Decimal | null
    valor_despacho_estimado_processo: Decimal | null
    valor_outros_estimado_processo: Decimal | null
    valor_total_estimado_processo: Decimal | null
  }

  export type EstimativaProcessoSumAggregateOutputType = {
    total_imposto_ii_processo: Decimal | null
    total_imposto_ipi_processo: Decimal | null
    total_imposto_pis_processo: Decimal | null
    total_imposto_cofins_processo: Decimal | null
    total_imposto_icms_processo: Decimal | null
    valor_frete_estimado_processo: Decimal | null
    valor_despacho_estimado_processo: Decimal | null
    valor_outros_estimado_processo: Decimal | null
    valor_total_estimado_processo: Decimal | null
  }

  export type EstimativaProcessoMinAggregateOutputType = {
    id_estimativa_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    total_imposto_ii_processo: Decimal | null
    total_imposto_ipi_processo: Decimal | null
    total_imposto_pis_processo: Decimal | null
    total_imposto_cofins_processo: Decimal | null
    total_imposto_icms_processo: Decimal | null
    valor_frete_estimado_processo: Decimal | null
    valor_despacho_estimado_processo: Decimal | null
    valor_outros_estimado_processo: Decimal | null
    valor_total_estimado_processo: Decimal | null
    moeda_estimativa_processo: string | null
    data_criacao_estimativa_processo: Date | null
    data_atualizacao_estimativa_processo: Date | null
  }

  export type EstimativaProcessoMaxAggregateOutputType = {
    id_estimativa_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    total_imposto_ii_processo: Decimal | null
    total_imposto_ipi_processo: Decimal | null
    total_imposto_pis_processo: Decimal | null
    total_imposto_cofins_processo: Decimal | null
    total_imposto_icms_processo: Decimal | null
    valor_frete_estimado_processo: Decimal | null
    valor_despacho_estimado_processo: Decimal | null
    valor_outros_estimado_processo: Decimal | null
    valor_total_estimado_processo: Decimal | null
    moeda_estimativa_processo: string | null
    data_criacao_estimativa_processo: Date | null
    data_atualizacao_estimativa_processo: Date | null
  }

  export type EstimativaProcessoCountAggregateOutputType = {
    id_estimativa_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    total_imposto_ii_processo: number
    total_imposto_ipi_processo: number
    total_imposto_pis_processo: number
    total_imposto_cofins_processo: number
    total_imposto_icms_processo: number
    valor_frete_estimado_processo: number
    valor_despacho_estimado_processo: number
    valor_outros_estimado_processo: number
    valor_total_estimado_processo: number
    moeda_estimativa_processo: number
    data_criacao_estimativa_processo: number
    data_atualizacao_estimativa_processo: number
    _all: number
  }


  export type EstimativaProcessoAvgAggregateInputType = {
    total_imposto_ii_processo?: true
    total_imposto_ipi_processo?: true
    total_imposto_pis_processo?: true
    total_imposto_cofins_processo?: true
    total_imposto_icms_processo?: true
    valor_frete_estimado_processo?: true
    valor_despacho_estimado_processo?: true
    valor_outros_estimado_processo?: true
    valor_total_estimado_processo?: true
  }

  export type EstimativaProcessoSumAggregateInputType = {
    total_imposto_ii_processo?: true
    total_imposto_ipi_processo?: true
    total_imposto_pis_processo?: true
    total_imposto_cofins_processo?: true
    total_imposto_icms_processo?: true
    valor_frete_estimado_processo?: true
    valor_despacho_estimado_processo?: true
    valor_outros_estimado_processo?: true
    valor_total_estimado_processo?: true
  }

  export type EstimativaProcessoMinAggregateInputType = {
    id_estimativa_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    total_imposto_ii_processo?: true
    total_imposto_ipi_processo?: true
    total_imposto_pis_processo?: true
    total_imposto_cofins_processo?: true
    total_imposto_icms_processo?: true
    valor_frete_estimado_processo?: true
    valor_despacho_estimado_processo?: true
    valor_outros_estimado_processo?: true
    valor_total_estimado_processo?: true
    moeda_estimativa_processo?: true
    data_criacao_estimativa_processo?: true
    data_atualizacao_estimativa_processo?: true
  }

  export type EstimativaProcessoMaxAggregateInputType = {
    id_estimativa_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    total_imposto_ii_processo?: true
    total_imposto_ipi_processo?: true
    total_imposto_pis_processo?: true
    total_imposto_cofins_processo?: true
    total_imposto_icms_processo?: true
    valor_frete_estimado_processo?: true
    valor_despacho_estimado_processo?: true
    valor_outros_estimado_processo?: true
    valor_total_estimado_processo?: true
    moeda_estimativa_processo?: true
    data_criacao_estimativa_processo?: true
    data_atualizacao_estimativa_processo?: true
  }

  export type EstimativaProcessoCountAggregateInputType = {
    id_estimativa_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    total_imposto_ii_processo?: true
    total_imposto_ipi_processo?: true
    total_imposto_pis_processo?: true
    total_imposto_cofins_processo?: true
    total_imposto_icms_processo?: true
    valor_frete_estimado_processo?: true
    valor_despacho_estimado_processo?: true
    valor_outros_estimado_processo?: true
    valor_total_estimado_processo?: true
    moeda_estimativa_processo?: true
    data_criacao_estimativa_processo?: true
    data_atualizacao_estimativa_processo?: true
    _all?: true
  }

  export type EstimativaProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EstimativaProcesso to aggregate.
     */
    where?: EstimativaProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaProcessos to fetch.
     */
    orderBy?: EstimativaProcessoOrderByWithRelationInput | EstimativaProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EstimativaProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EstimativaProcessos
    **/
    _count?: true | EstimativaProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EstimativaProcessoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EstimativaProcessoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EstimativaProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EstimativaProcessoMaxAggregateInputType
  }

  export type GetEstimativaProcessoAggregateType<T extends EstimativaProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateEstimativaProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEstimativaProcesso[P]>
      : GetScalarType<T[P], AggregateEstimativaProcesso[P]>
  }




  export type EstimativaProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EstimativaProcessoWhereInput
    orderBy?: EstimativaProcessoOrderByWithAggregationInput | EstimativaProcessoOrderByWithAggregationInput[]
    by: EstimativaProcessoScalarFieldEnum[] | EstimativaProcessoScalarFieldEnum
    having?: EstimativaProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EstimativaProcessoCountAggregateInputType | true
    _avg?: EstimativaProcessoAvgAggregateInputType
    _sum?: EstimativaProcessoSumAggregateInputType
    _min?: EstimativaProcessoMinAggregateInputType
    _max?: EstimativaProcessoMaxAggregateInputType
  }

  export type EstimativaProcessoGroupByOutputType = {
    id_estimativa_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    total_imposto_ii_processo: Decimal | null
    total_imposto_ipi_processo: Decimal | null
    total_imposto_pis_processo: Decimal | null
    total_imposto_cofins_processo: Decimal | null
    total_imposto_icms_processo: Decimal | null
    valor_frete_estimado_processo: Decimal | null
    valor_despacho_estimado_processo: Decimal | null
    valor_outros_estimado_processo: Decimal | null
    valor_total_estimado_processo: Decimal | null
    moeda_estimativa_processo: string
    data_criacao_estimativa_processo: Date
    data_atualizacao_estimativa_processo: Date
    _count: EstimativaProcessoCountAggregateOutputType | null
    _avg: EstimativaProcessoAvgAggregateOutputType | null
    _sum: EstimativaProcessoSumAggregateOutputType | null
    _min: EstimativaProcessoMinAggregateOutputType | null
    _max: EstimativaProcessoMaxAggregateOutputType | null
  }

  type GetEstimativaProcessoGroupByPayload<T extends EstimativaProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EstimativaProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EstimativaProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EstimativaProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], EstimativaProcessoGroupByOutputType[P]>
        }
      >
    >


  export type EstimativaProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_estimativa_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    total_imposto_ii_processo?: boolean
    total_imposto_ipi_processo?: boolean
    total_imposto_pis_processo?: boolean
    total_imposto_cofins_processo?: boolean
    total_imposto_icms_processo?: boolean
    valor_frete_estimado_processo?: boolean
    valor_despacho_estimado_processo?: boolean
    valor_outros_estimado_processo?: boolean
    valor_total_estimado_processo?: boolean
    moeda_estimativa_processo?: boolean
    data_criacao_estimativa_processo?: boolean
    data_atualizacao_estimativa_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["estimativaProcesso"]>

  export type EstimativaProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_estimativa_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    total_imposto_ii_processo?: boolean
    total_imposto_ipi_processo?: boolean
    total_imposto_pis_processo?: boolean
    total_imposto_cofins_processo?: boolean
    total_imposto_icms_processo?: boolean
    valor_frete_estimado_processo?: boolean
    valor_despacho_estimado_processo?: boolean
    valor_outros_estimado_processo?: boolean
    valor_total_estimado_processo?: boolean
    moeda_estimativa_processo?: boolean
    data_criacao_estimativa_processo?: boolean
    data_atualizacao_estimativa_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["estimativaProcesso"]>

  export type EstimativaProcessoSelectScalar = {
    id_estimativa_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    total_imposto_ii_processo?: boolean
    total_imposto_ipi_processo?: boolean
    total_imposto_pis_processo?: boolean
    total_imposto_cofins_processo?: boolean
    total_imposto_icms_processo?: boolean
    valor_frete_estimado_processo?: boolean
    valor_despacho_estimado_processo?: boolean
    valor_outros_estimado_processo?: boolean
    valor_total_estimado_processo?: boolean
    moeda_estimativa_processo?: boolean
    data_criacao_estimativa_processo?: boolean
    data_atualizacao_estimativa_processo?: boolean
  }

  export type EstimativaProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type EstimativaProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $EstimativaProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EstimativaProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_estimativa_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      total_imposto_ii_processo: Prisma.Decimal | null
      total_imposto_ipi_processo: Prisma.Decimal | null
      total_imposto_pis_processo: Prisma.Decimal | null
      total_imposto_cofins_processo: Prisma.Decimal | null
      total_imposto_icms_processo: Prisma.Decimal | null
      valor_frete_estimado_processo: Prisma.Decimal | null
      valor_despacho_estimado_processo: Prisma.Decimal | null
      valor_outros_estimado_processo: Prisma.Decimal | null
      valor_total_estimado_processo: Prisma.Decimal | null
      moeda_estimativa_processo: string
      data_criacao_estimativa_processo: Date
      data_atualizacao_estimativa_processo: Date
    }, ExtArgs["result"]["estimativaProcesso"]>
    composites: {}
  }

  type EstimativaProcessoGetPayload<S extends boolean | null | undefined | EstimativaProcessoDefaultArgs> = $Result.GetResult<Prisma.$EstimativaProcessoPayload, S>

  type EstimativaProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EstimativaProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EstimativaProcessoCountAggregateInputType | true
    }

  export interface EstimativaProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EstimativaProcesso'], meta: { name: 'EstimativaProcesso' } }
    /**
     * Find zero or one EstimativaProcesso that matches the filter.
     * @param {EstimativaProcessoFindUniqueArgs} args - Arguments to find a EstimativaProcesso
     * @example
     * // Get one EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EstimativaProcessoFindUniqueArgs>(args: SelectSubset<T, EstimativaProcessoFindUniqueArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EstimativaProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EstimativaProcessoFindUniqueOrThrowArgs} args - Arguments to find a EstimativaProcesso
     * @example
     * // Get one EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EstimativaProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, EstimativaProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EstimativaProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoFindFirstArgs} args - Arguments to find a EstimativaProcesso
     * @example
     * // Get one EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EstimativaProcessoFindFirstArgs>(args?: SelectSubset<T, EstimativaProcessoFindFirstArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EstimativaProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoFindFirstOrThrowArgs} args - Arguments to find a EstimativaProcesso
     * @example
     * // Get one EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EstimativaProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, EstimativaProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EstimativaProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EstimativaProcessos
     * const estimativaProcessos = await prisma.estimativaProcesso.findMany()
     * 
     * // Get first 10 EstimativaProcessos
     * const estimativaProcessos = await prisma.estimativaProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_estimativa_processo`
     * const estimativaProcessoWithId_estimativa_processoOnly = await prisma.estimativaProcesso.findMany({ select: { id_estimativa_processo: true } })
     * 
     */
    findMany<T extends EstimativaProcessoFindManyArgs>(args?: SelectSubset<T, EstimativaProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EstimativaProcesso.
     * @param {EstimativaProcessoCreateArgs} args - Arguments to create a EstimativaProcesso.
     * @example
     * // Create one EstimativaProcesso
     * const EstimativaProcesso = await prisma.estimativaProcesso.create({
     *   data: {
     *     // ... data to create a EstimativaProcesso
     *   }
     * })
     * 
     */
    create<T extends EstimativaProcessoCreateArgs>(args: SelectSubset<T, EstimativaProcessoCreateArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EstimativaProcessos.
     * @param {EstimativaProcessoCreateManyArgs} args - Arguments to create many EstimativaProcessos.
     * @example
     * // Create many EstimativaProcessos
     * const estimativaProcesso = await prisma.estimativaProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EstimativaProcessoCreateManyArgs>(args?: SelectSubset<T, EstimativaProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EstimativaProcessos and returns the data saved in the database.
     * @param {EstimativaProcessoCreateManyAndReturnArgs} args - Arguments to create many EstimativaProcessos.
     * @example
     * // Create many EstimativaProcessos
     * const estimativaProcesso = await prisma.estimativaProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EstimativaProcessos and only return the `id_estimativa_processo`
     * const estimativaProcessoWithId_estimativa_processoOnly = await prisma.estimativaProcesso.createManyAndReturn({ 
     *   select: { id_estimativa_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EstimativaProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, EstimativaProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a EstimativaProcesso.
     * @param {EstimativaProcessoDeleteArgs} args - Arguments to delete one EstimativaProcesso.
     * @example
     * // Delete one EstimativaProcesso
     * const EstimativaProcesso = await prisma.estimativaProcesso.delete({
     *   where: {
     *     // ... filter to delete one EstimativaProcesso
     *   }
     * })
     * 
     */
    delete<T extends EstimativaProcessoDeleteArgs>(args: SelectSubset<T, EstimativaProcessoDeleteArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EstimativaProcesso.
     * @param {EstimativaProcessoUpdateArgs} args - Arguments to update one EstimativaProcesso.
     * @example
     * // Update one EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EstimativaProcessoUpdateArgs>(args: SelectSubset<T, EstimativaProcessoUpdateArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EstimativaProcessos.
     * @param {EstimativaProcessoDeleteManyArgs} args - Arguments to filter EstimativaProcessos to delete.
     * @example
     * // Delete a few EstimativaProcessos
     * const { count } = await prisma.estimativaProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EstimativaProcessoDeleteManyArgs>(args?: SelectSubset<T, EstimativaProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EstimativaProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EstimativaProcessos
     * const estimativaProcesso = await prisma.estimativaProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EstimativaProcessoUpdateManyArgs>(args: SelectSubset<T, EstimativaProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EstimativaProcesso.
     * @param {EstimativaProcessoUpsertArgs} args - Arguments to update or create a EstimativaProcesso.
     * @example
     * // Update or create a EstimativaProcesso
     * const estimativaProcesso = await prisma.estimativaProcesso.upsert({
     *   create: {
     *     // ... data to create a EstimativaProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EstimativaProcesso we want to update
     *   }
     * })
     */
    upsert<T extends EstimativaProcessoUpsertArgs>(args: SelectSubset<T, EstimativaProcessoUpsertArgs<ExtArgs>>): Prisma__EstimativaProcessoClient<$Result.GetResult<Prisma.$EstimativaProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of EstimativaProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoCountArgs} args - Arguments to filter EstimativaProcessos to count.
     * @example
     * // Count the number of EstimativaProcessos
     * const count = await prisma.estimativaProcesso.count({
     *   where: {
     *     // ... the filter for the EstimativaProcessos we want to count
     *   }
     * })
    **/
    count<T extends EstimativaProcessoCountArgs>(
      args?: Subset<T, EstimativaProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EstimativaProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EstimativaProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EstimativaProcessoAggregateArgs>(args: Subset<T, EstimativaProcessoAggregateArgs>): Prisma.PrismaPromise<GetEstimativaProcessoAggregateType<T>>

    /**
     * Group by EstimativaProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaProcessoGroupByArgs} args - Group by arguments.
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
      T extends EstimativaProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EstimativaProcessoGroupByArgs['orderBy'] }
        : { orderBy?: EstimativaProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EstimativaProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEstimativaProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EstimativaProcesso model
   */
  readonly fields: EstimativaProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EstimativaProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EstimativaProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the EstimativaProcesso model
   */ 
  interface EstimativaProcessoFieldRefs {
    readonly id_estimativa_processo: FieldRef<"EstimativaProcesso", 'String'>
    readonly id_organizacao: FieldRef<"EstimativaProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"EstimativaProcesso", 'String'>
    readonly id_processo: FieldRef<"EstimativaProcesso", 'String'>
    readonly total_imposto_ii_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly total_imposto_ipi_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly total_imposto_pis_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly total_imposto_cofins_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly total_imposto_icms_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly valor_frete_estimado_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly valor_despacho_estimado_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly valor_outros_estimado_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly valor_total_estimado_processo: FieldRef<"EstimativaProcesso", 'Decimal'>
    readonly moeda_estimativa_processo: FieldRef<"EstimativaProcesso", 'String'>
    readonly data_criacao_estimativa_processo: FieldRef<"EstimativaProcesso", 'DateTime'>
    readonly data_atualizacao_estimativa_processo: FieldRef<"EstimativaProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EstimativaProcesso findUnique
   */
  export type EstimativaProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaProcesso to fetch.
     */
    where: EstimativaProcessoWhereUniqueInput
  }

  /**
   * EstimativaProcesso findUniqueOrThrow
   */
  export type EstimativaProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaProcesso to fetch.
     */
    where: EstimativaProcessoWhereUniqueInput
  }

  /**
   * EstimativaProcesso findFirst
   */
  export type EstimativaProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaProcesso to fetch.
     */
    where?: EstimativaProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaProcessos to fetch.
     */
    orderBy?: EstimativaProcessoOrderByWithRelationInput | EstimativaProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EstimativaProcessos.
     */
    cursor?: EstimativaProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EstimativaProcessos.
     */
    distinct?: EstimativaProcessoScalarFieldEnum | EstimativaProcessoScalarFieldEnum[]
  }

  /**
   * EstimativaProcesso findFirstOrThrow
   */
  export type EstimativaProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaProcesso to fetch.
     */
    where?: EstimativaProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaProcessos to fetch.
     */
    orderBy?: EstimativaProcessoOrderByWithRelationInput | EstimativaProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EstimativaProcessos.
     */
    cursor?: EstimativaProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EstimativaProcessos.
     */
    distinct?: EstimativaProcessoScalarFieldEnum | EstimativaProcessoScalarFieldEnum[]
  }

  /**
   * EstimativaProcesso findMany
   */
  export type EstimativaProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaProcessos to fetch.
     */
    where?: EstimativaProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaProcessos to fetch.
     */
    orderBy?: EstimativaProcessoOrderByWithRelationInput | EstimativaProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EstimativaProcessos.
     */
    cursor?: EstimativaProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaProcessos.
     */
    skip?: number
    distinct?: EstimativaProcessoScalarFieldEnum | EstimativaProcessoScalarFieldEnum[]
  }

  /**
   * EstimativaProcesso create
   */
  export type EstimativaProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a EstimativaProcesso.
     */
    data: XOR<EstimativaProcessoCreateInput, EstimativaProcessoUncheckedCreateInput>
  }

  /**
   * EstimativaProcesso createMany
   */
  export type EstimativaProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EstimativaProcessos.
     */
    data: EstimativaProcessoCreateManyInput | EstimativaProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EstimativaProcesso createManyAndReturn
   */
  export type EstimativaProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many EstimativaProcessos.
     */
    data: EstimativaProcessoCreateManyInput | EstimativaProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EstimativaProcesso update
   */
  export type EstimativaProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a EstimativaProcesso.
     */
    data: XOR<EstimativaProcessoUpdateInput, EstimativaProcessoUncheckedUpdateInput>
    /**
     * Choose, which EstimativaProcesso to update.
     */
    where: EstimativaProcessoWhereUniqueInput
  }

  /**
   * EstimativaProcesso updateMany
   */
  export type EstimativaProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EstimativaProcessos.
     */
    data: XOR<EstimativaProcessoUpdateManyMutationInput, EstimativaProcessoUncheckedUpdateManyInput>
    /**
     * Filter which EstimativaProcessos to update
     */
    where?: EstimativaProcessoWhereInput
  }

  /**
   * EstimativaProcesso upsert
   */
  export type EstimativaProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the EstimativaProcesso to update in case it exists.
     */
    where: EstimativaProcessoWhereUniqueInput
    /**
     * In case the EstimativaProcesso found by the `where` argument doesn't exist, create a new EstimativaProcesso with this data.
     */
    create: XOR<EstimativaProcessoCreateInput, EstimativaProcessoUncheckedCreateInput>
    /**
     * In case the EstimativaProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EstimativaProcessoUpdateInput, EstimativaProcessoUncheckedUpdateInput>
  }

  /**
   * EstimativaProcesso delete
   */
  export type EstimativaProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
    /**
     * Filter which EstimativaProcesso to delete.
     */
    where: EstimativaProcessoWhereUniqueInput
  }

  /**
   * EstimativaProcesso deleteMany
   */
  export type EstimativaProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EstimativaProcessos to delete
     */
    where?: EstimativaProcessoWhereInput
  }

  /**
   * EstimativaProcesso without action
   */
  export type EstimativaProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaProcesso
     */
    select?: EstimativaProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaProcessoInclude<ExtArgs> | null
  }


  /**
   * Model DocumentoProcesso
   */

  export type AggregateDocumentoProcesso = {
    _count: DocumentoProcessoCountAggregateOutputType | null
    _avg: DocumentoProcessoAvgAggregateOutputType | null
    _sum: DocumentoProcessoSumAggregateOutputType | null
    _min: DocumentoProcessoMinAggregateOutputType | null
    _max: DocumentoProcessoMaxAggregateOutputType | null
  }

  export type DocumentoProcessoAvgAggregateOutputType = {
    tamanho_bytes_documento_processo: number | null
  }

  export type DocumentoProcessoSumAggregateOutputType = {
    tamanho_bytes_documento_processo: number | null
  }

  export type DocumentoProcessoMinAggregateOutputType = {
    id_documento_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string | null
    nome_documento_processo: string | null
    tipo_arquivo_documento_processo: string | null
    tamanho_bytes_documento_processo: number | null
    url_documento_processo: string | null
    categoria_documento_processo: string | null
    numero_bl_processo: string | null
    numero_hawb_processo: string | null
    numero_mawb_processo: string | null
    numero_awb_processo: string | null
    numero_hbl_processo: string | null
    numero_mbl_processo: string | null
    numero_ce_mercante_processo: string | null
    numero_certificado_origem_processo: string | null
    numero_cim_processo: string | null
    numero_crt_processo: string | null
    numero_presenca_carga_destino_processo: string | null
    data_criacao_documento_processo: Date | null
  }

  export type DocumentoProcessoMaxAggregateOutputType = {
    id_documento_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string | null
    nome_documento_processo: string | null
    tipo_arquivo_documento_processo: string | null
    tamanho_bytes_documento_processo: number | null
    url_documento_processo: string | null
    categoria_documento_processo: string | null
    numero_bl_processo: string | null
    numero_hawb_processo: string | null
    numero_mawb_processo: string | null
    numero_awb_processo: string | null
    numero_hbl_processo: string | null
    numero_mbl_processo: string | null
    numero_ce_mercante_processo: string | null
    numero_certificado_origem_processo: string | null
    numero_cim_processo: string | null
    numero_crt_processo: string | null
    numero_presenca_carga_destino_processo: string | null
    data_criacao_documento_processo: Date | null
  }

  export type DocumentoProcessoCountAggregateOutputType = {
    id_documento_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_usuario: number
    id_processo: number
    nome_documento_processo: number
    tipo_arquivo_documento_processo: number
    tamanho_bytes_documento_processo: number
    url_documento_processo: number
    categoria_documento_processo: number
    numero_bl_processo: number
    numero_hawb_processo: number
    numero_mawb_processo: number
    numero_awb_processo: number
    numero_hbl_processo: number
    numero_mbl_processo: number
    numero_ce_mercante_processo: number
    numero_certificado_origem_processo: number
    numero_cim_processo: number
    numero_crt_processo: number
    numero_presenca_carga_destino_processo: number
    data_criacao_documento_processo: number
    _all: number
  }


  export type DocumentoProcessoAvgAggregateInputType = {
    tamanho_bytes_documento_processo?: true
  }

  export type DocumentoProcessoSumAggregateInputType = {
    tamanho_bytes_documento_processo?: true
  }

  export type DocumentoProcessoMinAggregateInputType = {
    id_documento_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    nome_documento_processo?: true
    tipo_arquivo_documento_processo?: true
    tamanho_bytes_documento_processo?: true
    url_documento_processo?: true
    categoria_documento_processo?: true
    numero_bl_processo?: true
    numero_hawb_processo?: true
    numero_mawb_processo?: true
    numero_awb_processo?: true
    numero_hbl_processo?: true
    numero_mbl_processo?: true
    numero_ce_mercante_processo?: true
    numero_certificado_origem_processo?: true
    numero_cim_processo?: true
    numero_crt_processo?: true
    numero_presenca_carga_destino_processo?: true
    data_criacao_documento_processo?: true
  }

  export type DocumentoProcessoMaxAggregateInputType = {
    id_documento_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    nome_documento_processo?: true
    tipo_arquivo_documento_processo?: true
    tamanho_bytes_documento_processo?: true
    url_documento_processo?: true
    categoria_documento_processo?: true
    numero_bl_processo?: true
    numero_hawb_processo?: true
    numero_mawb_processo?: true
    numero_awb_processo?: true
    numero_hbl_processo?: true
    numero_mbl_processo?: true
    numero_ce_mercante_processo?: true
    numero_certificado_origem_processo?: true
    numero_cim_processo?: true
    numero_crt_processo?: true
    numero_presenca_carga_destino_processo?: true
    data_criacao_documento_processo?: true
  }

  export type DocumentoProcessoCountAggregateInputType = {
    id_documento_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    nome_documento_processo?: true
    tipo_arquivo_documento_processo?: true
    tamanho_bytes_documento_processo?: true
    url_documento_processo?: true
    categoria_documento_processo?: true
    numero_bl_processo?: true
    numero_hawb_processo?: true
    numero_mawb_processo?: true
    numero_awb_processo?: true
    numero_hbl_processo?: true
    numero_mbl_processo?: true
    numero_ce_mercante_processo?: true
    numero_certificado_origem_processo?: true
    numero_cim_processo?: true
    numero_crt_processo?: true
    numero_presenca_carga_destino_processo?: true
    data_criacao_documento_processo?: true
    _all?: true
  }

  export type DocumentoProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentoProcesso to aggregate.
     */
    where?: DocumentoProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentoProcessos to fetch.
     */
    orderBy?: DocumentoProcessoOrderByWithRelationInput | DocumentoProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentoProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentoProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentoProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DocumentoProcessos
    **/
    _count?: true | DocumentoProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentoProcessoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentoProcessoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentoProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentoProcessoMaxAggregateInputType
  }

  export type GetDocumentoProcessoAggregateType<T extends DocumentoProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumentoProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumentoProcesso[P]>
      : GetScalarType<T[P], AggregateDocumentoProcesso[P]>
  }




  export type DocumentoProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoProcessoWhereInput
    orderBy?: DocumentoProcessoOrderByWithAggregationInput | DocumentoProcessoOrderByWithAggregationInput[]
    by: DocumentoProcessoScalarFieldEnum[] | DocumentoProcessoScalarFieldEnum
    having?: DocumentoProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentoProcessoCountAggregateInputType | true
    _avg?: DocumentoProcessoAvgAggregateInputType
    _sum?: DocumentoProcessoSumAggregateInputType
    _min?: DocumentoProcessoMinAggregateInputType
    _max?: DocumentoProcessoMaxAggregateInputType
  }

  export type DocumentoProcessoGroupByOutputType = {
    id_documento_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo: number
    url_documento_processo: string
    categoria_documento_processo: string
    numero_bl_processo: string | null
    numero_hawb_processo: string | null
    numero_mawb_processo: string | null
    numero_awb_processo: string | null
    numero_hbl_processo: string | null
    numero_mbl_processo: string | null
    numero_ce_mercante_processo: string | null
    numero_certificado_origem_processo: string | null
    numero_cim_processo: string | null
    numero_crt_processo: string | null
    numero_presenca_carga_destino_processo: string | null
    data_criacao_documento_processo: Date
    _count: DocumentoProcessoCountAggregateOutputType | null
    _avg: DocumentoProcessoAvgAggregateOutputType | null
    _sum: DocumentoProcessoSumAggregateOutputType | null
    _min: DocumentoProcessoMinAggregateOutputType | null
    _max: DocumentoProcessoMaxAggregateOutputType | null
  }

  type GetDocumentoProcessoGroupByPayload<T extends DocumentoProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentoProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentoProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentoProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentoProcessoGroupByOutputType[P]>
        }
      >
    >


  export type DocumentoProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_documento_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    nome_documento_processo?: boolean
    tipo_arquivo_documento_processo?: boolean
    tamanho_bytes_documento_processo?: boolean
    url_documento_processo?: boolean
    categoria_documento_processo?: boolean
    numero_bl_processo?: boolean
    numero_hawb_processo?: boolean
    numero_mawb_processo?: boolean
    numero_awb_processo?: boolean
    numero_hbl_processo?: boolean
    numero_mbl_processo?: boolean
    numero_ce_mercante_processo?: boolean
    numero_certificado_origem_processo?: boolean
    numero_cim_processo?: boolean
    numero_crt_processo?: boolean
    numero_presenca_carga_destino_processo?: boolean
    data_criacao_documento_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documentoProcesso"]>

  export type DocumentoProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_documento_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    nome_documento_processo?: boolean
    tipo_arquivo_documento_processo?: boolean
    tamanho_bytes_documento_processo?: boolean
    url_documento_processo?: boolean
    categoria_documento_processo?: boolean
    numero_bl_processo?: boolean
    numero_hawb_processo?: boolean
    numero_mawb_processo?: boolean
    numero_awb_processo?: boolean
    numero_hbl_processo?: boolean
    numero_mbl_processo?: boolean
    numero_ce_mercante_processo?: boolean
    numero_certificado_origem_processo?: boolean
    numero_cim_processo?: boolean
    numero_crt_processo?: boolean
    numero_presenca_carga_destino_processo?: boolean
    data_criacao_documento_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documentoProcesso"]>

  export type DocumentoProcessoSelectScalar = {
    id_documento_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    nome_documento_processo?: boolean
    tipo_arquivo_documento_processo?: boolean
    tamanho_bytes_documento_processo?: boolean
    url_documento_processo?: boolean
    categoria_documento_processo?: boolean
    numero_bl_processo?: boolean
    numero_hawb_processo?: boolean
    numero_mawb_processo?: boolean
    numero_awb_processo?: boolean
    numero_hbl_processo?: boolean
    numero_mbl_processo?: boolean
    numero_ce_mercante_processo?: boolean
    numero_certificado_origem_processo?: boolean
    numero_cim_processo?: boolean
    numero_crt_processo?: boolean
    numero_presenca_carga_destino_processo?: boolean
    data_criacao_documento_processo?: boolean
  }

  export type DocumentoProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type DocumentoProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $DocumentoProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DocumentoProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_documento_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_usuario: string | null
      id_processo: string
      nome_documento_processo: string
      tipo_arquivo_documento_processo: string
      tamanho_bytes_documento_processo: number
      url_documento_processo: string
      categoria_documento_processo: string
      numero_bl_processo: string | null
      numero_hawb_processo: string | null
      numero_mawb_processo: string | null
      numero_awb_processo: string | null
      numero_hbl_processo: string | null
      numero_mbl_processo: string | null
      numero_ce_mercante_processo: string | null
      numero_certificado_origem_processo: string | null
      numero_cim_processo: string | null
      numero_crt_processo: string | null
      numero_presenca_carga_destino_processo: string | null
      data_criacao_documento_processo: Date
    }, ExtArgs["result"]["documentoProcesso"]>
    composites: {}
  }

  type DocumentoProcessoGetPayload<S extends boolean | null | undefined | DocumentoProcessoDefaultArgs> = $Result.GetResult<Prisma.$DocumentoProcessoPayload, S>

  type DocumentoProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DocumentoProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DocumentoProcessoCountAggregateInputType | true
    }

  export interface DocumentoProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DocumentoProcesso'], meta: { name: 'DocumentoProcesso' } }
    /**
     * Find zero or one DocumentoProcesso that matches the filter.
     * @param {DocumentoProcessoFindUniqueArgs} args - Arguments to find a DocumentoProcesso
     * @example
     * // Get one DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentoProcessoFindUniqueArgs>(args: SelectSubset<T, DocumentoProcessoFindUniqueArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DocumentoProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DocumentoProcessoFindUniqueOrThrowArgs} args - Arguments to find a DocumentoProcesso
     * @example
     * // Get one DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentoProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentoProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DocumentoProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoFindFirstArgs} args - Arguments to find a DocumentoProcesso
     * @example
     * // Get one DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentoProcessoFindFirstArgs>(args?: SelectSubset<T, DocumentoProcessoFindFirstArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DocumentoProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoFindFirstOrThrowArgs} args - Arguments to find a DocumentoProcesso
     * @example
     * // Get one DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentoProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentoProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DocumentoProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DocumentoProcessos
     * const documentoProcessos = await prisma.documentoProcesso.findMany()
     * 
     * // Get first 10 DocumentoProcessos
     * const documentoProcessos = await prisma.documentoProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_documento_processo`
     * const documentoProcessoWithId_documento_processoOnly = await prisma.documentoProcesso.findMany({ select: { id_documento_processo: true } })
     * 
     */
    findMany<T extends DocumentoProcessoFindManyArgs>(args?: SelectSubset<T, DocumentoProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DocumentoProcesso.
     * @param {DocumentoProcessoCreateArgs} args - Arguments to create a DocumentoProcesso.
     * @example
     * // Create one DocumentoProcesso
     * const DocumentoProcesso = await prisma.documentoProcesso.create({
     *   data: {
     *     // ... data to create a DocumentoProcesso
     *   }
     * })
     * 
     */
    create<T extends DocumentoProcessoCreateArgs>(args: SelectSubset<T, DocumentoProcessoCreateArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DocumentoProcessos.
     * @param {DocumentoProcessoCreateManyArgs} args - Arguments to create many DocumentoProcessos.
     * @example
     * // Create many DocumentoProcessos
     * const documentoProcesso = await prisma.documentoProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentoProcessoCreateManyArgs>(args?: SelectSubset<T, DocumentoProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DocumentoProcessos and returns the data saved in the database.
     * @param {DocumentoProcessoCreateManyAndReturnArgs} args - Arguments to create many DocumentoProcessos.
     * @example
     * // Create many DocumentoProcessos
     * const documentoProcesso = await prisma.documentoProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DocumentoProcessos and only return the `id_documento_processo`
     * const documentoProcessoWithId_documento_processoOnly = await prisma.documentoProcesso.createManyAndReturn({ 
     *   select: { id_documento_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentoProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentoProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DocumentoProcesso.
     * @param {DocumentoProcessoDeleteArgs} args - Arguments to delete one DocumentoProcesso.
     * @example
     * // Delete one DocumentoProcesso
     * const DocumentoProcesso = await prisma.documentoProcesso.delete({
     *   where: {
     *     // ... filter to delete one DocumentoProcesso
     *   }
     * })
     * 
     */
    delete<T extends DocumentoProcessoDeleteArgs>(args: SelectSubset<T, DocumentoProcessoDeleteArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DocumentoProcesso.
     * @param {DocumentoProcessoUpdateArgs} args - Arguments to update one DocumentoProcesso.
     * @example
     * // Update one DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentoProcessoUpdateArgs>(args: SelectSubset<T, DocumentoProcessoUpdateArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DocumentoProcessos.
     * @param {DocumentoProcessoDeleteManyArgs} args - Arguments to filter DocumentoProcessos to delete.
     * @example
     * // Delete a few DocumentoProcessos
     * const { count } = await prisma.documentoProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentoProcessoDeleteManyArgs>(args?: SelectSubset<T, DocumentoProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DocumentoProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DocumentoProcessos
     * const documentoProcesso = await prisma.documentoProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentoProcessoUpdateManyArgs>(args: SelectSubset<T, DocumentoProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DocumentoProcesso.
     * @param {DocumentoProcessoUpsertArgs} args - Arguments to update or create a DocumentoProcesso.
     * @example
     * // Update or create a DocumentoProcesso
     * const documentoProcesso = await prisma.documentoProcesso.upsert({
     *   create: {
     *     // ... data to create a DocumentoProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DocumentoProcesso we want to update
     *   }
     * })
     */
    upsert<T extends DocumentoProcessoUpsertArgs>(args: SelectSubset<T, DocumentoProcessoUpsertArgs<ExtArgs>>): Prisma__DocumentoProcessoClient<$Result.GetResult<Prisma.$DocumentoProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DocumentoProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoCountArgs} args - Arguments to filter DocumentoProcessos to count.
     * @example
     * // Count the number of DocumentoProcessos
     * const count = await prisma.documentoProcesso.count({
     *   where: {
     *     // ... the filter for the DocumentoProcessos we want to count
     *   }
     * })
    **/
    count<T extends DocumentoProcessoCountArgs>(
      args?: Subset<T, DocumentoProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentoProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DocumentoProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentoProcessoAggregateArgs>(args: Subset<T, DocumentoProcessoAggregateArgs>): Prisma.PrismaPromise<GetDocumentoProcessoAggregateType<T>>

    /**
     * Group by DocumentoProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoProcessoGroupByArgs} args - Group by arguments.
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
      T extends DocumentoProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentoProcessoGroupByArgs['orderBy'] }
        : { orderBy?: DocumentoProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentoProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentoProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DocumentoProcesso model
   */
  readonly fields: DocumentoProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DocumentoProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentoProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the DocumentoProcesso model
   */ 
  interface DocumentoProcessoFieldRefs {
    readonly id_documento_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly id_organizacao: FieldRef<"DocumentoProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"DocumentoProcesso", 'String'>
    readonly id_usuario: FieldRef<"DocumentoProcesso", 'String'>
    readonly id_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly nome_documento_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly tipo_arquivo_documento_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly tamanho_bytes_documento_processo: FieldRef<"DocumentoProcesso", 'Int'>
    readonly url_documento_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly categoria_documento_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_bl_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_hawb_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_mawb_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_awb_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_hbl_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_mbl_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_ce_mercante_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_certificado_origem_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_cim_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_crt_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly numero_presenca_carga_destino_processo: FieldRef<"DocumentoProcesso", 'String'>
    readonly data_criacao_documento_processo: FieldRef<"DocumentoProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DocumentoProcesso findUnique
   */
  export type DocumentoProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DocumentoProcesso to fetch.
     */
    where: DocumentoProcessoWhereUniqueInput
  }

  /**
   * DocumentoProcesso findUniqueOrThrow
   */
  export type DocumentoProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DocumentoProcesso to fetch.
     */
    where: DocumentoProcessoWhereUniqueInput
  }

  /**
   * DocumentoProcesso findFirst
   */
  export type DocumentoProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DocumentoProcesso to fetch.
     */
    where?: DocumentoProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentoProcessos to fetch.
     */
    orderBy?: DocumentoProcessoOrderByWithRelationInput | DocumentoProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentoProcessos.
     */
    cursor?: DocumentoProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentoProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentoProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentoProcessos.
     */
    distinct?: DocumentoProcessoScalarFieldEnum | DocumentoProcessoScalarFieldEnum[]
  }

  /**
   * DocumentoProcesso findFirstOrThrow
   */
  export type DocumentoProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DocumentoProcesso to fetch.
     */
    where?: DocumentoProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentoProcessos to fetch.
     */
    orderBy?: DocumentoProcessoOrderByWithRelationInput | DocumentoProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DocumentoProcessos.
     */
    cursor?: DocumentoProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentoProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentoProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DocumentoProcessos.
     */
    distinct?: DocumentoProcessoScalarFieldEnum | DocumentoProcessoScalarFieldEnum[]
  }

  /**
   * DocumentoProcesso findMany
   */
  export type DocumentoProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter, which DocumentoProcessos to fetch.
     */
    where?: DocumentoProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DocumentoProcessos to fetch.
     */
    orderBy?: DocumentoProcessoOrderByWithRelationInput | DocumentoProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DocumentoProcessos.
     */
    cursor?: DocumentoProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DocumentoProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DocumentoProcessos.
     */
    skip?: number
    distinct?: DocumentoProcessoScalarFieldEnum | DocumentoProcessoScalarFieldEnum[]
  }

  /**
   * DocumentoProcesso create
   */
  export type DocumentoProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a DocumentoProcesso.
     */
    data: XOR<DocumentoProcessoCreateInput, DocumentoProcessoUncheckedCreateInput>
  }

  /**
   * DocumentoProcesso createMany
   */
  export type DocumentoProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DocumentoProcessos.
     */
    data: DocumentoProcessoCreateManyInput | DocumentoProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DocumentoProcesso createManyAndReturn
   */
  export type DocumentoProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DocumentoProcessos.
     */
    data: DocumentoProcessoCreateManyInput | DocumentoProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DocumentoProcesso update
   */
  export type DocumentoProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a DocumentoProcesso.
     */
    data: XOR<DocumentoProcessoUpdateInput, DocumentoProcessoUncheckedUpdateInput>
    /**
     * Choose, which DocumentoProcesso to update.
     */
    where: DocumentoProcessoWhereUniqueInput
  }

  /**
   * DocumentoProcesso updateMany
   */
  export type DocumentoProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DocumentoProcessos.
     */
    data: XOR<DocumentoProcessoUpdateManyMutationInput, DocumentoProcessoUncheckedUpdateManyInput>
    /**
     * Filter which DocumentoProcessos to update
     */
    where?: DocumentoProcessoWhereInput
  }

  /**
   * DocumentoProcesso upsert
   */
  export type DocumentoProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the DocumentoProcesso to update in case it exists.
     */
    where: DocumentoProcessoWhereUniqueInput
    /**
     * In case the DocumentoProcesso found by the `where` argument doesn't exist, create a new DocumentoProcesso with this data.
     */
    create: XOR<DocumentoProcessoCreateInput, DocumentoProcessoUncheckedCreateInput>
    /**
     * In case the DocumentoProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentoProcessoUpdateInput, DocumentoProcessoUncheckedUpdateInput>
  }

  /**
   * DocumentoProcesso delete
   */
  export type DocumentoProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
    /**
     * Filter which DocumentoProcesso to delete.
     */
    where: DocumentoProcessoWhereUniqueInput
  }

  /**
   * DocumentoProcesso deleteMany
   */
  export type DocumentoProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DocumentoProcessos to delete
     */
    where?: DocumentoProcessoWhereInput
  }

  /**
   * DocumentoProcesso without action
   */
  export type DocumentoProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DocumentoProcesso
     */
    select?: DocumentoProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoProcessoInclude<ExtArgs> | null
  }


  /**
   * Model ContainerProcesso
   */

  export type AggregateContainerProcesso = {
    _count: ContainerProcessoCountAggregateOutputType | null
    _avg: ContainerProcessoAvgAggregateOutputType | null
    _sum: ContainerProcessoSumAggregateOutputType | null
    _min: ContainerProcessoMinAggregateOutputType | null
    _max: ContainerProcessoMaxAggregateOutputType | null
  }

  export type ContainerProcessoAvgAggregateOutputType = {
    container_tara_processo_container: Decimal | null
    container_peso_bruto_processo_container: Decimal | null
    container_peso_liquido_processo_container: Decimal | null
    container_metragem_cubica_processo_container: Decimal | null
  }

  export type ContainerProcessoSumAggregateOutputType = {
    container_tara_processo_container: Decimal | null
    container_peso_bruto_processo_container: Decimal | null
    container_peso_liquido_processo_container: Decimal | null
    container_metragem_cubica_processo_container: Decimal | null
  }

  export type ContainerProcessoMinAggregateOutputType = {
    id_processo_container: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    container_numero_processo_container: string | null
    container_tipo_processo_container: string | null
    container_lacre_processo_container: string | null
    container_tara_processo_container: Decimal | null
    container_peso_bruto_processo_container: Decimal | null
    container_peso_liquido_processo_container: Decimal | null
    container_metragem_cubica_processo_container: Decimal | null
    local_devolucao_processo_container: string | null
    data_devolucao_prevista_processo_container: Date | null
    data_devolucao_real_processo_container: Date | null
    data_criacao_container_processo: Date | null
    data_atualizacao_container_processo: Date | null
  }

  export type ContainerProcessoMaxAggregateOutputType = {
    id_processo_container: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_processo: string | null
    container_numero_processo_container: string | null
    container_tipo_processo_container: string | null
    container_lacre_processo_container: string | null
    container_tara_processo_container: Decimal | null
    container_peso_bruto_processo_container: Decimal | null
    container_peso_liquido_processo_container: Decimal | null
    container_metragem_cubica_processo_container: Decimal | null
    local_devolucao_processo_container: string | null
    data_devolucao_prevista_processo_container: Date | null
    data_devolucao_real_processo_container: Date | null
    data_criacao_container_processo: Date | null
    data_atualizacao_container_processo: Date | null
  }

  export type ContainerProcessoCountAggregateOutputType = {
    id_processo_container: number
    id_organizacao: number
    id_produto_gravity: number
    id_processo: number
    container_numero_processo_container: number
    container_tipo_processo_container: number
    container_lacre_processo_container: number
    container_tara_processo_container: number
    container_peso_bruto_processo_container: number
    container_peso_liquido_processo_container: number
    container_metragem_cubica_processo_container: number
    local_devolucao_processo_container: number
    data_devolucao_prevista_processo_container: number
    data_devolucao_real_processo_container: number
    data_criacao_container_processo: number
    data_atualizacao_container_processo: number
    _all: number
  }


  export type ContainerProcessoAvgAggregateInputType = {
    container_tara_processo_container?: true
    container_peso_bruto_processo_container?: true
    container_peso_liquido_processo_container?: true
    container_metragem_cubica_processo_container?: true
  }

  export type ContainerProcessoSumAggregateInputType = {
    container_tara_processo_container?: true
    container_peso_bruto_processo_container?: true
    container_peso_liquido_processo_container?: true
    container_metragem_cubica_processo_container?: true
  }

  export type ContainerProcessoMinAggregateInputType = {
    id_processo_container?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    container_numero_processo_container?: true
    container_tipo_processo_container?: true
    container_lacre_processo_container?: true
    container_tara_processo_container?: true
    container_peso_bruto_processo_container?: true
    container_peso_liquido_processo_container?: true
    container_metragem_cubica_processo_container?: true
    local_devolucao_processo_container?: true
    data_devolucao_prevista_processo_container?: true
    data_devolucao_real_processo_container?: true
    data_criacao_container_processo?: true
    data_atualizacao_container_processo?: true
  }

  export type ContainerProcessoMaxAggregateInputType = {
    id_processo_container?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    container_numero_processo_container?: true
    container_tipo_processo_container?: true
    container_lacre_processo_container?: true
    container_tara_processo_container?: true
    container_peso_bruto_processo_container?: true
    container_peso_liquido_processo_container?: true
    container_metragem_cubica_processo_container?: true
    local_devolucao_processo_container?: true
    data_devolucao_prevista_processo_container?: true
    data_devolucao_real_processo_container?: true
    data_criacao_container_processo?: true
    data_atualizacao_container_processo?: true
  }

  export type ContainerProcessoCountAggregateInputType = {
    id_processo_container?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_processo?: true
    container_numero_processo_container?: true
    container_tipo_processo_container?: true
    container_lacre_processo_container?: true
    container_tara_processo_container?: true
    container_peso_bruto_processo_container?: true
    container_peso_liquido_processo_container?: true
    container_metragem_cubica_processo_container?: true
    local_devolucao_processo_container?: true
    data_devolucao_prevista_processo_container?: true
    data_devolucao_real_processo_container?: true
    data_criacao_container_processo?: true
    data_atualizacao_container_processo?: true
    _all?: true
  }

  export type ContainerProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContainerProcesso to aggregate.
     */
    where?: ContainerProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContainerProcessos to fetch.
     */
    orderBy?: ContainerProcessoOrderByWithRelationInput | ContainerProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContainerProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContainerProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContainerProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContainerProcessos
    **/
    _count?: true | ContainerProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContainerProcessoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContainerProcessoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContainerProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContainerProcessoMaxAggregateInputType
  }

  export type GetContainerProcessoAggregateType<T extends ContainerProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateContainerProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContainerProcesso[P]>
      : GetScalarType<T[P], AggregateContainerProcesso[P]>
  }




  export type ContainerProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContainerProcessoWhereInput
    orderBy?: ContainerProcessoOrderByWithAggregationInput | ContainerProcessoOrderByWithAggregationInput[]
    by: ContainerProcessoScalarFieldEnum[] | ContainerProcessoScalarFieldEnum
    having?: ContainerProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContainerProcessoCountAggregateInputType | true
    _avg?: ContainerProcessoAvgAggregateInputType
    _sum?: ContainerProcessoSumAggregateInputType
    _min?: ContainerProcessoMinAggregateInputType
    _max?: ContainerProcessoMaxAggregateInputType
  }

  export type ContainerProcessoGroupByOutputType = {
    id_processo_container: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_processo: string
    container_numero_processo_container: string
    container_tipo_processo_container: string | null
    container_lacre_processo_container: string | null
    container_tara_processo_container: Decimal | null
    container_peso_bruto_processo_container: Decimal | null
    container_peso_liquido_processo_container: Decimal | null
    container_metragem_cubica_processo_container: Decimal | null
    local_devolucao_processo_container: string | null
    data_devolucao_prevista_processo_container: Date | null
    data_devolucao_real_processo_container: Date | null
    data_criacao_container_processo: Date
    data_atualizacao_container_processo: Date
    _count: ContainerProcessoCountAggregateOutputType | null
    _avg: ContainerProcessoAvgAggregateOutputType | null
    _sum: ContainerProcessoSumAggregateOutputType | null
    _min: ContainerProcessoMinAggregateOutputType | null
    _max: ContainerProcessoMaxAggregateOutputType | null
  }

  type GetContainerProcessoGroupByPayload<T extends ContainerProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContainerProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContainerProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContainerProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], ContainerProcessoGroupByOutputType[P]>
        }
      >
    >


  export type ContainerProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo_container?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    container_numero_processo_container?: boolean
    container_tipo_processo_container?: boolean
    container_lacre_processo_container?: boolean
    container_tara_processo_container?: boolean
    container_peso_bruto_processo_container?: boolean
    container_peso_liquido_processo_container?: boolean
    container_metragem_cubica_processo_container?: boolean
    local_devolucao_processo_container?: boolean
    data_devolucao_prevista_processo_container?: boolean
    data_devolucao_real_processo_container?: boolean
    data_criacao_container_processo?: boolean
    data_atualizacao_container_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["containerProcesso"]>

  export type ContainerProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_processo_container?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    container_numero_processo_container?: boolean
    container_tipo_processo_container?: boolean
    container_lacre_processo_container?: boolean
    container_tara_processo_container?: boolean
    container_peso_bruto_processo_container?: boolean
    container_peso_liquido_processo_container?: boolean
    container_metragem_cubica_processo_container?: boolean
    local_devolucao_processo_container?: boolean
    data_devolucao_prevista_processo_container?: boolean
    data_devolucao_real_processo_container?: boolean
    data_criacao_container_processo?: boolean
    data_atualizacao_container_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["containerProcesso"]>

  export type ContainerProcessoSelectScalar = {
    id_processo_container?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_processo?: boolean
    container_numero_processo_container?: boolean
    container_tipo_processo_container?: boolean
    container_lacre_processo_container?: boolean
    container_tara_processo_container?: boolean
    container_peso_bruto_processo_container?: boolean
    container_peso_liquido_processo_container?: boolean
    container_metragem_cubica_processo_container?: boolean
    local_devolucao_processo_container?: boolean
    data_devolucao_prevista_processo_container?: boolean
    data_devolucao_real_processo_container?: boolean
    data_criacao_container_processo?: boolean
    data_atualizacao_container_processo?: boolean
  }

  export type ContainerProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type ContainerProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $ContainerProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContainerProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_processo_container: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_processo: string
      container_numero_processo_container: string
      container_tipo_processo_container: string | null
      container_lacre_processo_container: string | null
      container_tara_processo_container: Prisma.Decimal | null
      container_peso_bruto_processo_container: Prisma.Decimal | null
      container_peso_liquido_processo_container: Prisma.Decimal | null
      container_metragem_cubica_processo_container: Prisma.Decimal | null
      local_devolucao_processo_container: string | null
      data_devolucao_prevista_processo_container: Date | null
      data_devolucao_real_processo_container: Date | null
      data_criacao_container_processo: Date
      data_atualizacao_container_processo: Date
    }, ExtArgs["result"]["containerProcesso"]>
    composites: {}
  }

  type ContainerProcessoGetPayload<S extends boolean | null | undefined | ContainerProcessoDefaultArgs> = $Result.GetResult<Prisma.$ContainerProcessoPayload, S>

  type ContainerProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ContainerProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ContainerProcessoCountAggregateInputType | true
    }

  export interface ContainerProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContainerProcesso'], meta: { name: 'ContainerProcesso' } }
    /**
     * Find zero or one ContainerProcesso that matches the filter.
     * @param {ContainerProcessoFindUniqueArgs} args - Arguments to find a ContainerProcesso
     * @example
     * // Get one ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContainerProcessoFindUniqueArgs>(args: SelectSubset<T, ContainerProcessoFindUniqueArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ContainerProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ContainerProcessoFindUniqueOrThrowArgs} args - Arguments to find a ContainerProcesso
     * @example
     * // Get one ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContainerProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, ContainerProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ContainerProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoFindFirstArgs} args - Arguments to find a ContainerProcesso
     * @example
     * // Get one ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContainerProcessoFindFirstArgs>(args?: SelectSubset<T, ContainerProcessoFindFirstArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ContainerProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoFindFirstOrThrowArgs} args - Arguments to find a ContainerProcesso
     * @example
     * // Get one ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContainerProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, ContainerProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ContainerProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContainerProcessos
     * const containerProcessos = await prisma.containerProcesso.findMany()
     * 
     * // Get first 10 ContainerProcessos
     * const containerProcessos = await prisma.containerProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_processo_container`
     * const containerProcessoWithId_processo_containerOnly = await prisma.containerProcesso.findMany({ select: { id_processo_container: true } })
     * 
     */
    findMany<T extends ContainerProcessoFindManyArgs>(args?: SelectSubset<T, ContainerProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ContainerProcesso.
     * @param {ContainerProcessoCreateArgs} args - Arguments to create a ContainerProcesso.
     * @example
     * // Create one ContainerProcesso
     * const ContainerProcesso = await prisma.containerProcesso.create({
     *   data: {
     *     // ... data to create a ContainerProcesso
     *   }
     * })
     * 
     */
    create<T extends ContainerProcessoCreateArgs>(args: SelectSubset<T, ContainerProcessoCreateArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ContainerProcessos.
     * @param {ContainerProcessoCreateManyArgs} args - Arguments to create many ContainerProcessos.
     * @example
     * // Create many ContainerProcessos
     * const containerProcesso = await prisma.containerProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContainerProcessoCreateManyArgs>(args?: SelectSubset<T, ContainerProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContainerProcessos and returns the data saved in the database.
     * @param {ContainerProcessoCreateManyAndReturnArgs} args - Arguments to create many ContainerProcessos.
     * @example
     * // Create many ContainerProcessos
     * const containerProcesso = await prisma.containerProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContainerProcessos and only return the `id_processo_container`
     * const containerProcessoWithId_processo_containerOnly = await prisma.containerProcesso.createManyAndReturn({ 
     *   select: { id_processo_container: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContainerProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, ContainerProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ContainerProcesso.
     * @param {ContainerProcessoDeleteArgs} args - Arguments to delete one ContainerProcesso.
     * @example
     * // Delete one ContainerProcesso
     * const ContainerProcesso = await prisma.containerProcesso.delete({
     *   where: {
     *     // ... filter to delete one ContainerProcesso
     *   }
     * })
     * 
     */
    delete<T extends ContainerProcessoDeleteArgs>(args: SelectSubset<T, ContainerProcessoDeleteArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ContainerProcesso.
     * @param {ContainerProcessoUpdateArgs} args - Arguments to update one ContainerProcesso.
     * @example
     * // Update one ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContainerProcessoUpdateArgs>(args: SelectSubset<T, ContainerProcessoUpdateArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ContainerProcessos.
     * @param {ContainerProcessoDeleteManyArgs} args - Arguments to filter ContainerProcessos to delete.
     * @example
     * // Delete a few ContainerProcessos
     * const { count } = await prisma.containerProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContainerProcessoDeleteManyArgs>(args?: SelectSubset<T, ContainerProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContainerProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContainerProcessos
     * const containerProcesso = await prisma.containerProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContainerProcessoUpdateManyArgs>(args: SelectSubset<T, ContainerProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ContainerProcesso.
     * @param {ContainerProcessoUpsertArgs} args - Arguments to update or create a ContainerProcesso.
     * @example
     * // Update or create a ContainerProcesso
     * const containerProcesso = await prisma.containerProcesso.upsert({
     *   create: {
     *     // ... data to create a ContainerProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContainerProcesso we want to update
     *   }
     * })
     */
    upsert<T extends ContainerProcessoUpsertArgs>(args: SelectSubset<T, ContainerProcessoUpsertArgs<ExtArgs>>): Prisma__ContainerProcessoClient<$Result.GetResult<Prisma.$ContainerProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ContainerProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoCountArgs} args - Arguments to filter ContainerProcessos to count.
     * @example
     * // Count the number of ContainerProcessos
     * const count = await prisma.containerProcesso.count({
     *   where: {
     *     // ... the filter for the ContainerProcessos we want to count
     *   }
     * })
    **/
    count<T extends ContainerProcessoCountArgs>(
      args?: Subset<T, ContainerProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContainerProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContainerProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ContainerProcessoAggregateArgs>(args: Subset<T, ContainerProcessoAggregateArgs>): Prisma.PrismaPromise<GetContainerProcessoAggregateType<T>>

    /**
     * Group by ContainerProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContainerProcessoGroupByArgs} args - Group by arguments.
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
      T extends ContainerProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContainerProcessoGroupByArgs['orderBy'] }
        : { orderBy?: ContainerProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ContainerProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContainerProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContainerProcesso model
   */
  readonly fields: ContainerProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContainerProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContainerProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ContainerProcesso model
   */ 
  interface ContainerProcessoFieldRefs {
    readonly id_processo_container: FieldRef<"ContainerProcesso", 'String'>
    readonly id_organizacao: FieldRef<"ContainerProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"ContainerProcesso", 'String'>
    readonly id_processo: FieldRef<"ContainerProcesso", 'String'>
    readonly container_numero_processo_container: FieldRef<"ContainerProcesso", 'String'>
    readonly container_tipo_processo_container: FieldRef<"ContainerProcesso", 'String'>
    readonly container_lacre_processo_container: FieldRef<"ContainerProcesso", 'String'>
    readonly container_tara_processo_container: FieldRef<"ContainerProcesso", 'Decimal'>
    readonly container_peso_bruto_processo_container: FieldRef<"ContainerProcesso", 'Decimal'>
    readonly container_peso_liquido_processo_container: FieldRef<"ContainerProcesso", 'Decimal'>
    readonly container_metragem_cubica_processo_container: FieldRef<"ContainerProcesso", 'Decimal'>
    readonly local_devolucao_processo_container: FieldRef<"ContainerProcesso", 'String'>
    readonly data_devolucao_prevista_processo_container: FieldRef<"ContainerProcesso", 'DateTime'>
    readonly data_devolucao_real_processo_container: FieldRef<"ContainerProcesso", 'DateTime'>
    readonly data_criacao_container_processo: FieldRef<"ContainerProcesso", 'DateTime'>
    readonly data_atualizacao_container_processo: FieldRef<"ContainerProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ContainerProcesso findUnique
   */
  export type ContainerProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter, which ContainerProcesso to fetch.
     */
    where: ContainerProcessoWhereUniqueInput
  }

  /**
   * ContainerProcesso findUniqueOrThrow
   */
  export type ContainerProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter, which ContainerProcesso to fetch.
     */
    where: ContainerProcessoWhereUniqueInput
  }

  /**
   * ContainerProcesso findFirst
   */
  export type ContainerProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter, which ContainerProcesso to fetch.
     */
    where?: ContainerProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContainerProcessos to fetch.
     */
    orderBy?: ContainerProcessoOrderByWithRelationInput | ContainerProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContainerProcessos.
     */
    cursor?: ContainerProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContainerProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContainerProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContainerProcessos.
     */
    distinct?: ContainerProcessoScalarFieldEnum | ContainerProcessoScalarFieldEnum[]
  }

  /**
   * ContainerProcesso findFirstOrThrow
   */
  export type ContainerProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter, which ContainerProcesso to fetch.
     */
    where?: ContainerProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContainerProcessos to fetch.
     */
    orderBy?: ContainerProcessoOrderByWithRelationInput | ContainerProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContainerProcessos.
     */
    cursor?: ContainerProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContainerProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContainerProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContainerProcessos.
     */
    distinct?: ContainerProcessoScalarFieldEnum | ContainerProcessoScalarFieldEnum[]
  }

  /**
   * ContainerProcesso findMany
   */
  export type ContainerProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter, which ContainerProcessos to fetch.
     */
    where?: ContainerProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContainerProcessos to fetch.
     */
    orderBy?: ContainerProcessoOrderByWithRelationInput | ContainerProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContainerProcessos.
     */
    cursor?: ContainerProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContainerProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContainerProcessos.
     */
    skip?: number
    distinct?: ContainerProcessoScalarFieldEnum | ContainerProcessoScalarFieldEnum[]
  }

  /**
   * ContainerProcesso create
   */
  export type ContainerProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a ContainerProcesso.
     */
    data: XOR<ContainerProcessoCreateInput, ContainerProcessoUncheckedCreateInput>
  }

  /**
   * ContainerProcesso createMany
   */
  export type ContainerProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContainerProcessos.
     */
    data: ContainerProcessoCreateManyInput | ContainerProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContainerProcesso createManyAndReturn
   */
  export type ContainerProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ContainerProcessos.
     */
    data: ContainerProcessoCreateManyInput | ContainerProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ContainerProcesso update
   */
  export type ContainerProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a ContainerProcesso.
     */
    data: XOR<ContainerProcessoUpdateInput, ContainerProcessoUncheckedUpdateInput>
    /**
     * Choose, which ContainerProcesso to update.
     */
    where: ContainerProcessoWhereUniqueInput
  }

  /**
   * ContainerProcesso updateMany
   */
  export type ContainerProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContainerProcessos.
     */
    data: XOR<ContainerProcessoUpdateManyMutationInput, ContainerProcessoUncheckedUpdateManyInput>
    /**
     * Filter which ContainerProcessos to update
     */
    where?: ContainerProcessoWhereInput
  }

  /**
   * ContainerProcesso upsert
   */
  export type ContainerProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the ContainerProcesso to update in case it exists.
     */
    where: ContainerProcessoWhereUniqueInput
    /**
     * In case the ContainerProcesso found by the `where` argument doesn't exist, create a new ContainerProcesso with this data.
     */
    create: XOR<ContainerProcessoCreateInput, ContainerProcessoUncheckedCreateInput>
    /**
     * In case the ContainerProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContainerProcessoUpdateInput, ContainerProcessoUncheckedUpdateInput>
  }

  /**
   * ContainerProcesso delete
   */
  export type ContainerProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
    /**
     * Filter which ContainerProcesso to delete.
     */
    where: ContainerProcessoWhereUniqueInput
  }

  /**
   * ContainerProcesso deleteMany
   */
  export type ContainerProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContainerProcessos to delete
     */
    where?: ContainerProcessoWhereInput
  }

  /**
   * ContainerProcesso without action
   */
  export type ContainerProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContainerProcesso
     */
    select?: ContainerProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContainerProcessoInclude<ExtArgs> | null
  }


  /**
   * Model FollowUpProcesso
   */

  export type AggregateFollowUpProcesso = {
    _count: FollowUpProcessoCountAggregateOutputType | null
    _min: FollowUpProcessoMinAggregateOutputType | null
    _max: FollowUpProcessoMaxAggregateOutputType | null
  }

  export type FollowUpProcessoMinAggregateOutputType = {
    id_follow_up_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string | null
    titulo_follow_up_processo: string | null
    descricao_follow_up_processo: string | null
    tipo_follow_up_processo: string | null
    categoria_follow_up_processo: string | null
    id_usuario_registro_follow_up_processo: string | null
    nome_usuario_registro_follow_up_processo: string | null
    data_criacao_follow_up_processo: Date | null
  }

  export type FollowUpProcessoMaxAggregateOutputType = {
    id_follow_up_processo: string | null
    id_organizacao: string | null
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string | null
    titulo_follow_up_processo: string | null
    descricao_follow_up_processo: string | null
    tipo_follow_up_processo: string | null
    categoria_follow_up_processo: string | null
    id_usuario_registro_follow_up_processo: string | null
    nome_usuario_registro_follow_up_processo: string | null
    data_criacao_follow_up_processo: Date | null
  }

  export type FollowUpProcessoCountAggregateOutputType = {
    id_follow_up_processo: number
    id_organizacao: number
    id_produto_gravity: number
    id_usuario: number
    id_processo: number
    titulo_follow_up_processo: number
    descricao_follow_up_processo: number
    tipo_follow_up_processo: number
    categoria_follow_up_processo: number
    id_usuario_registro_follow_up_processo: number
    nome_usuario_registro_follow_up_processo: number
    data_criacao_follow_up_processo: number
    _all: number
  }


  export type FollowUpProcessoMinAggregateInputType = {
    id_follow_up_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    titulo_follow_up_processo?: true
    descricao_follow_up_processo?: true
    tipo_follow_up_processo?: true
    categoria_follow_up_processo?: true
    id_usuario_registro_follow_up_processo?: true
    nome_usuario_registro_follow_up_processo?: true
    data_criacao_follow_up_processo?: true
  }

  export type FollowUpProcessoMaxAggregateInputType = {
    id_follow_up_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    titulo_follow_up_processo?: true
    descricao_follow_up_processo?: true
    tipo_follow_up_processo?: true
    categoria_follow_up_processo?: true
    id_usuario_registro_follow_up_processo?: true
    nome_usuario_registro_follow_up_processo?: true
    data_criacao_follow_up_processo?: true
  }

  export type FollowUpProcessoCountAggregateInputType = {
    id_follow_up_processo?: true
    id_organizacao?: true
    id_produto_gravity?: true
    id_usuario?: true
    id_processo?: true
    titulo_follow_up_processo?: true
    descricao_follow_up_processo?: true
    tipo_follow_up_processo?: true
    categoria_follow_up_processo?: true
    id_usuario_registro_follow_up_processo?: true
    nome_usuario_registro_follow_up_processo?: true
    data_criacao_follow_up_processo?: true
    _all?: true
  }

  export type FollowUpProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowUpProcesso to aggregate.
     */
    where?: FollowUpProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUpProcessos to fetch.
     */
    orderBy?: FollowUpProcessoOrderByWithRelationInput | FollowUpProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FollowUpProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUpProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUpProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FollowUpProcessos
    **/
    _count?: true | FollowUpProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FollowUpProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FollowUpProcessoMaxAggregateInputType
  }

  export type GetFollowUpProcessoAggregateType<T extends FollowUpProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateFollowUpProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFollowUpProcesso[P]>
      : GetScalarType<T[P], AggregateFollowUpProcesso[P]>
  }




  export type FollowUpProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowUpProcessoWhereInput
    orderBy?: FollowUpProcessoOrderByWithAggregationInput | FollowUpProcessoOrderByWithAggregationInput[]
    by: FollowUpProcessoScalarFieldEnum[] | FollowUpProcessoScalarFieldEnum
    having?: FollowUpProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FollowUpProcessoCountAggregateInputType | true
    _min?: FollowUpProcessoMinAggregateInputType
    _max?: FollowUpProcessoMaxAggregateInputType
  }

  export type FollowUpProcessoGroupByOutputType = {
    id_follow_up_processo: string
    id_organizacao: string
    id_produto_gravity: string | null
    id_usuario: string | null
    id_processo: string
    titulo_follow_up_processo: string
    descricao_follow_up_processo: string | null
    tipo_follow_up_processo: string
    categoria_follow_up_processo: string
    id_usuario_registro_follow_up_processo: string | null
    nome_usuario_registro_follow_up_processo: string | null
    data_criacao_follow_up_processo: Date
    _count: FollowUpProcessoCountAggregateOutputType | null
    _min: FollowUpProcessoMinAggregateOutputType | null
    _max: FollowUpProcessoMaxAggregateOutputType | null
  }

  type GetFollowUpProcessoGroupByPayload<T extends FollowUpProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FollowUpProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FollowUpProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FollowUpProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], FollowUpProcessoGroupByOutputType[P]>
        }
      >
    >


  export type FollowUpProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_follow_up_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    titulo_follow_up_processo?: boolean
    descricao_follow_up_processo?: boolean
    tipo_follow_up_processo?: boolean
    categoria_follow_up_processo?: boolean
    id_usuario_registro_follow_up_processo?: boolean
    nome_usuario_registro_follow_up_processo?: boolean
    data_criacao_follow_up_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followUpProcesso"]>

  export type FollowUpProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_follow_up_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    titulo_follow_up_processo?: boolean
    descricao_follow_up_processo?: boolean
    tipo_follow_up_processo?: boolean
    categoria_follow_up_processo?: boolean
    id_usuario_registro_follow_up_processo?: boolean
    nome_usuario_registro_follow_up_processo?: boolean
    data_criacao_follow_up_processo?: boolean
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followUpProcesso"]>

  export type FollowUpProcessoSelectScalar = {
    id_follow_up_processo?: boolean
    id_organizacao?: boolean
    id_produto_gravity?: boolean
    id_usuario?: boolean
    id_processo?: boolean
    titulo_follow_up_processo?: boolean
    descricao_follow_up_processo?: boolean
    tipo_follow_up_processo?: boolean
    categoria_follow_up_processo?: boolean
    id_usuario_registro_follow_up_processo?: boolean
    nome_usuario_registro_follow_up_processo?: boolean
    data_criacao_follow_up_processo?: boolean
  }

  export type FollowUpProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type FollowUpProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $FollowUpProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FollowUpProcesso"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_follow_up_processo: string
      id_organizacao: string
      id_produto_gravity: string | null
      id_usuario: string | null
      id_processo: string
      titulo_follow_up_processo: string
      descricao_follow_up_processo: string | null
      tipo_follow_up_processo: string
      categoria_follow_up_processo: string
      id_usuario_registro_follow_up_processo: string | null
      nome_usuario_registro_follow_up_processo: string | null
      data_criacao_follow_up_processo: Date
    }, ExtArgs["result"]["followUpProcesso"]>
    composites: {}
  }

  type FollowUpProcessoGetPayload<S extends boolean | null | undefined | FollowUpProcessoDefaultArgs> = $Result.GetResult<Prisma.$FollowUpProcessoPayload, S>

  type FollowUpProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FollowUpProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FollowUpProcessoCountAggregateInputType | true
    }

  export interface FollowUpProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FollowUpProcesso'], meta: { name: 'FollowUpProcesso' } }
    /**
     * Find zero or one FollowUpProcesso that matches the filter.
     * @param {FollowUpProcessoFindUniqueArgs} args - Arguments to find a FollowUpProcesso
     * @example
     * // Get one FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FollowUpProcessoFindUniqueArgs>(args: SelectSubset<T, FollowUpProcessoFindUniqueArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FollowUpProcesso that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FollowUpProcessoFindUniqueOrThrowArgs} args - Arguments to find a FollowUpProcesso
     * @example
     * // Get one FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FollowUpProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, FollowUpProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FollowUpProcesso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoFindFirstArgs} args - Arguments to find a FollowUpProcesso
     * @example
     * // Get one FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FollowUpProcessoFindFirstArgs>(args?: SelectSubset<T, FollowUpProcessoFindFirstArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FollowUpProcesso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoFindFirstOrThrowArgs} args - Arguments to find a FollowUpProcesso
     * @example
     * // Get one FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FollowUpProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, FollowUpProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FollowUpProcessos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FollowUpProcessos
     * const followUpProcessos = await prisma.followUpProcesso.findMany()
     * 
     * // Get first 10 FollowUpProcessos
     * const followUpProcessos = await prisma.followUpProcesso.findMany({ take: 10 })
     * 
     * // Only select the `id_follow_up_processo`
     * const followUpProcessoWithId_follow_up_processoOnly = await prisma.followUpProcesso.findMany({ select: { id_follow_up_processo: true } })
     * 
     */
    findMany<T extends FollowUpProcessoFindManyArgs>(args?: SelectSubset<T, FollowUpProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FollowUpProcesso.
     * @param {FollowUpProcessoCreateArgs} args - Arguments to create a FollowUpProcesso.
     * @example
     * // Create one FollowUpProcesso
     * const FollowUpProcesso = await prisma.followUpProcesso.create({
     *   data: {
     *     // ... data to create a FollowUpProcesso
     *   }
     * })
     * 
     */
    create<T extends FollowUpProcessoCreateArgs>(args: SelectSubset<T, FollowUpProcessoCreateArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FollowUpProcessos.
     * @param {FollowUpProcessoCreateManyArgs} args - Arguments to create many FollowUpProcessos.
     * @example
     * // Create many FollowUpProcessos
     * const followUpProcesso = await prisma.followUpProcesso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FollowUpProcessoCreateManyArgs>(args?: SelectSubset<T, FollowUpProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FollowUpProcessos and returns the data saved in the database.
     * @param {FollowUpProcessoCreateManyAndReturnArgs} args - Arguments to create many FollowUpProcessos.
     * @example
     * // Create many FollowUpProcessos
     * const followUpProcesso = await prisma.followUpProcesso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FollowUpProcessos and only return the `id_follow_up_processo`
     * const followUpProcessoWithId_follow_up_processoOnly = await prisma.followUpProcesso.createManyAndReturn({ 
     *   select: { id_follow_up_processo: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FollowUpProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, FollowUpProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FollowUpProcesso.
     * @param {FollowUpProcessoDeleteArgs} args - Arguments to delete one FollowUpProcesso.
     * @example
     * // Delete one FollowUpProcesso
     * const FollowUpProcesso = await prisma.followUpProcesso.delete({
     *   where: {
     *     // ... filter to delete one FollowUpProcesso
     *   }
     * })
     * 
     */
    delete<T extends FollowUpProcessoDeleteArgs>(args: SelectSubset<T, FollowUpProcessoDeleteArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FollowUpProcesso.
     * @param {FollowUpProcessoUpdateArgs} args - Arguments to update one FollowUpProcesso.
     * @example
     * // Update one FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FollowUpProcessoUpdateArgs>(args: SelectSubset<T, FollowUpProcessoUpdateArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FollowUpProcessos.
     * @param {FollowUpProcessoDeleteManyArgs} args - Arguments to filter FollowUpProcessos to delete.
     * @example
     * // Delete a few FollowUpProcessos
     * const { count } = await prisma.followUpProcesso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FollowUpProcessoDeleteManyArgs>(args?: SelectSubset<T, FollowUpProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FollowUpProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FollowUpProcessos
     * const followUpProcesso = await prisma.followUpProcesso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FollowUpProcessoUpdateManyArgs>(args: SelectSubset<T, FollowUpProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FollowUpProcesso.
     * @param {FollowUpProcessoUpsertArgs} args - Arguments to update or create a FollowUpProcesso.
     * @example
     * // Update or create a FollowUpProcesso
     * const followUpProcesso = await prisma.followUpProcesso.upsert({
     *   create: {
     *     // ... data to create a FollowUpProcesso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FollowUpProcesso we want to update
     *   }
     * })
     */
    upsert<T extends FollowUpProcessoUpsertArgs>(args: SelectSubset<T, FollowUpProcessoUpsertArgs<ExtArgs>>): Prisma__FollowUpProcessoClient<$Result.GetResult<Prisma.$FollowUpProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FollowUpProcessos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoCountArgs} args - Arguments to filter FollowUpProcessos to count.
     * @example
     * // Count the number of FollowUpProcessos
     * const count = await prisma.followUpProcesso.count({
     *   where: {
     *     // ... the filter for the FollowUpProcessos we want to count
     *   }
     * })
    **/
    count<T extends FollowUpProcessoCountArgs>(
      args?: Subset<T, FollowUpProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FollowUpProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FollowUpProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FollowUpProcessoAggregateArgs>(args: Subset<T, FollowUpProcessoAggregateArgs>): Prisma.PrismaPromise<GetFollowUpProcessoAggregateType<T>>

    /**
     * Group by FollowUpProcesso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpProcessoGroupByArgs} args - Group by arguments.
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
      T extends FollowUpProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FollowUpProcessoGroupByArgs['orderBy'] }
        : { orderBy?: FollowUpProcessoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FollowUpProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFollowUpProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FollowUpProcesso model
   */
  readonly fields: FollowUpProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FollowUpProcesso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FollowUpProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the FollowUpProcesso model
   */ 
  interface FollowUpProcessoFieldRefs {
    readonly id_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly id_organizacao: FieldRef<"FollowUpProcesso", 'String'>
    readonly id_produto_gravity: FieldRef<"FollowUpProcesso", 'String'>
    readonly id_usuario: FieldRef<"FollowUpProcesso", 'String'>
    readonly id_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly titulo_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly descricao_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly tipo_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly categoria_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly id_usuario_registro_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly nome_usuario_registro_follow_up_processo: FieldRef<"FollowUpProcesso", 'String'>
    readonly data_criacao_follow_up_processo: FieldRef<"FollowUpProcesso", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FollowUpProcesso findUnique
   */
  export type FollowUpProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter, which FollowUpProcesso to fetch.
     */
    where: FollowUpProcessoWhereUniqueInput
  }

  /**
   * FollowUpProcesso findUniqueOrThrow
   */
  export type FollowUpProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter, which FollowUpProcesso to fetch.
     */
    where: FollowUpProcessoWhereUniqueInput
  }

  /**
   * FollowUpProcesso findFirst
   */
  export type FollowUpProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter, which FollowUpProcesso to fetch.
     */
    where?: FollowUpProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUpProcessos to fetch.
     */
    orderBy?: FollowUpProcessoOrderByWithRelationInput | FollowUpProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowUpProcessos.
     */
    cursor?: FollowUpProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUpProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUpProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowUpProcessos.
     */
    distinct?: FollowUpProcessoScalarFieldEnum | FollowUpProcessoScalarFieldEnum[]
  }

  /**
   * FollowUpProcesso findFirstOrThrow
   */
  export type FollowUpProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter, which FollowUpProcesso to fetch.
     */
    where?: FollowUpProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUpProcessos to fetch.
     */
    orderBy?: FollowUpProcessoOrderByWithRelationInput | FollowUpProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowUpProcessos.
     */
    cursor?: FollowUpProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUpProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUpProcessos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowUpProcessos.
     */
    distinct?: FollowUpProcessoScalarFieldEnum | FollowUpProcessoScalarFieldEnum[]
  }

  /**
   * FollowUpProcesso findMany
   */
  export type FollowUpProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter, which FollowUpProcessos to fetch.
     */
    where?: FollowUpProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUpProcessos to fetch.
     */
    orderBy?: FollowUpProcessoOrderByWithRelationInput | FollowUpProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FollowUpProcessos.
     */
    cursor?: FollowUpProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUpProcessos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUpProcessos.
     */
    skip?: number
    distinct?: FollowUpProcessoScalarFieldEnum | FollowUpProcessoScalarFieldEnum[]
  }

  /**
   * FollowUpProcesso create
   */
  export type FollowUpProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a FollowUpProcesso.
     */
    data: XOR<FollowUpProcessoCreateInput, FollowUpProcessoUncheckedCreateInput>
  }

  /**
   * FollowUpProcesso createMany
   */
  export type FollowUpProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FollowUpProcessos.
     */
    data: FollowUpProcessoCreateManyInput | FollowUpProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FollowUpProcesso createManyAndReturn
   */
  export type FollowUpProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FollowUpProcessos.
     */
    data: FollowUpProcessoCreateManyInput | FollowUpProcessoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FollowUpProcesso update
   */
  export type FollowUpProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a FollowUpProcesso.
     */
    data: XOR<FollowUpProcessoUpdateInput, FollowUpProcessoUncheckedUpdateInput>
    /**
     * Choose, which FollowUpProcesso to update.
     */
    where: FollowUpProcessoWhereUniqueInput
  }

  /**
   * FollowUpProcesso updateMany
   */
  export type FollowUpProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FollowUpProcessos.
     */
    data: XOR<FollowUpProcessoUpdateManyMutationInput, FollowUpProcessoUncheckedUpdateManyInput>
    /**
     * Filter which FollowUpProcessos to update
     */
    where?: FollowUpProcessoWhereInput
  }

  /**
   * FollowUpProcesso upsert
   */
  export type FollowUpProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the FollowUpProcesso to update in case it exists.
     */
    where: FollowUpProcessoWhereUniqueInput
    /**
     * In case the FollowUpProcesso found by the `where` argument doesn't exist, create a new FollowUpProcesso with this data.
     */
    create: XOR<FollowUpProcessoCreateInput, FollowUpProcessoUncheckedCreateInput>
    /**
     * In case the FollowUpProcesso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FollowUpProcessoUpdateInput, FollowUpProcessoUncheckedUpdateInput>
  }

  /**
   * FollowUpProcesso delete
   */
  export type FollowUpProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
    /**
     * Filter which FollowUpProcesso to delete.
     */
    where: FollowUpProcessoWhereUniqueInput
  }

  /**
   * FollowUpProcesso deleteMany
   */
  export type FollowUpProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowUpProcessos to delete
     */
    where?: FollowUpProcessoWhereInput
  }

  /**
   * FollowUpProcesso without action
   */
  export type FollowUpProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUpProcesso
     */
    select?: FollowUpProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpProcessoInclude<ExtArgs> | null
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


  export const ProcessoScalarFieldEnum: {
    id_processo: 'id_processo',
    id_organizacao: 'id_organizacao',
    id_workspace: 'id_workspace',
    id_produto_gravity: 'id_produto_gravity',
    id_usuario: 'id_usuario',
    numero_processo: 'numero_processo',
    tipo_operacao_processo: 'tipo_operacao_processo',
    referencia_interna_processo: 'referencia_interna_processo',
    referencia_importador_processo: 'referencia_importador_processo',
    referencia_exportador_processo: 'referencia_exportador_processo',
    id_status_atual_processo: 'id_status_atual_processo',
    id_importacao_exportador_processo: 'id_importacao_exportador_processo',
    id_exportacao_importador_processo: 'id_exportacao_importador_processo',
    id_cotacao_bid_frete_internacional: 'id_cotacao_bid_frete_internacional',
    id_proposta_bid_frete_internacional: 'id_proposta_bid_frete_internacional',
    id_transito_processo: 'id_transito_processo',
    id_operacao_cambio_processo: 'id_operacao_cambio_processo',
    id_responsavel_processo: 'id_responsavel_processo',
    responsavel_rotina_processo: 'responsavel_rotina_processo',
    setor_responsavel_processo: 'setor_responsavel_processo',
    vendedor_responsavel_processo: 'vendedor_responsavel_processo',
    data_criacao_processo: 'data_criacao_processo',
    data_atualizacao_processo: 'data_atualizacao_processo'
  };

  export type ProcessoScalarFieldEnum = (typeof ProcessoScalarFieldEnum)[keyof typeof ProcessoScalarFieldEnum]


  export const ProcessoStatusScalarFieldEnum: {
    id_processo_status: 'id_processo_status',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    tipo_status_processo: 'tipo_status_processo',
    rotulo_status_processo: 'rotulo_status_processo',
    cor_status_processo: 'cor_status_processo',
    ordem_status_processo: 'ordem_status_processo',
    regras_status_processo: 'regras_status_processo',
    eh_padrao_status_processo: 'eh_padrao_status_processo',
    eh_sistema_status_processo: 'eh_sistema_status_processo',
    data_criacao_processo_status: 'data_criacao_processo_status',
    data_atualizacao_processo_status: 'data_atualizacao_processo_status'
  };

  export type ProcessoStatusScalarFieldEnum = (typeof ProcessoStatusScalarFieldEnum)[keyof typeof ProcessoStatusScalarFieldEnum]


  export const HistoricoStatusProcessoScalarFieldEnum: {
    id_historico_status_processo: 'id_historico_status_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    id_status_anterior_processo: 'id_status_anterior_processo',
    id_status_novo_processo: 'id_status_novo_processo',
    id_usuario_mudanca_status_processo: 'id_usuario_mudanca_status_processo',
    data_mudanca_status_processo: 'data_mudanca_status_processo',
    observacao_mudanca_status_processo: 'observacao_mudanca_status_processo'
  };

  export type HistoricoStatusProcessoScalarFieldEnum = (typeof HistoricoStatusProcessoScalarFieldEnum)[keyof typeof HistoricoStatusProcessoScalarFieldEnum]


  export const LogisticaInternacionalProcessoScalarFieldEnum: {
    id_logistica_internacional_processo: 'id_logistica_internacional_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    modal_frete_internacional_processo: 'modal_frete_internacional_processo',
    tipo_frete_internacional_processo: 'tipo_frete_internacional_processo',
    tipo_volume_processo: 'tipo_volume_processo',
    incoterm_processo: 'incoterm_processo',
    porto_origem_processo: 'porto_origem_processo',
    porto_destino_processo: 'porto_destino_processo',
    porto_transbordo_processo: 'porto_transbordo_processo',
    aeroporto_origem_processo: 'aeroporto_origem_processo',
    aeroporto_destino_processo: 'aeroporto_destino_processo',
    aeroporto_escala_processo: 'aeroporto_escala_processo',
    id_agente_carga: 'id_agente_carga',
    id_armador: 'id_armador',
    id_cia_aerea: 'id_cia_aerea',
    id_transportador_rodo_internacional: 'id_transportador_rodo_internacional',
    id_transportador_rodo_nacional: 'id_transportador_rodo_nacional',
    id_transportador_ferroviario: 'id_transportador_ferroviario',
    id_despachante: 'id_despachante',
    id_armazem_alfandegado: 'id_armazem_alfandegado',
    id_seguradora_internacional: 'id_seguradora_internacional',
    data_criacao_logistica_internacional_processo: 'data_criacao_logistica_internacional_processo',
    data_atualizacao_logistica_internacional_processo: 'data_atualizacao_logistica_internacional_processo'
  };

  export type LogisticaInternacionalProcessoScalarFieldEnum = (typeof LogisticaInternacionalProcessoScalarFieldEnum)[keyof typeof LogisticaInternacionalProcessoScalarFieldEnum]


  export const DadosProcessoScalarFieldEnum: {
    id_dados_processo: 'id_dados_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    canal_parametrizacao_processo: 'canal_parametrizacao_processo',
    numero_duimp_processo: 'numero_duimp_processo',
    numero_nfe_processo: 'numero_nfe_processo',
    chave_acesso_nfe_processo: 'chave_acesso_nfe_processo',
    data_registro_duimp_processo: 'data_registro_duimp_processo',
    data_liberacao_duimp_processo: 'data_liberacao_duimp_processo',
    data_consulta_liberacao_duimp_processo: 'data_consulta_liberacao_duimp_processo',
    data_previsao_registro_duimp_processo: 'data_previsao_registro_duimp_processo',
    data_previsao_liberacao_duimp_processo: 'data_previsao_liberacao_duimp_processo',
    data_registro_lpco_processo: 'data_registro_lpco_processo',
    data_deferimento_lpco_processo: 'data_deferimento_lpco_processo',
    data_indeferimento_lpco_processo: 'data_indeferimento_lpco_processo',
    data_pendencia_lpco_processo: 'data_pendencia_lpco_processo',
    data_consulta_liberacao_lpco_processo: 'data_consulta_liberacao_lpco_processo',
    data_previsao_registro_lpco_processo: 'data_previsao_registro_lpco_processo',
    data_criacao_dados_processo: 'data_criacao_dados_processo',
    data_atualizacao_dados_processo: 'data_atualizacao_dados_processo'
  };

  export type DadosProcessoScalarFieldEnum = (typeof DadosProcessoScalarFieldEnum)[keyof typeof DadosProcessoScalarFieldEnum]


  export const CambioProcessoScalarFieldEnum: {
    id_cambio_processo: 'id_cambio_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    id_banco_processo: 'id_banco_processo',
    id_corretora_cambio_processo: 'id_corretora_cambio_processo',
    data_criacao_cambio_processo: 'data_criacao_cambio_processo',
    data_atualizacao_cambio_processo: 'data_atualizacao_cambio_processo'
  };

  export type CambioProcessoScalarFieldEnum = (typeof CambioProcessoScalarFieldEnum)[keyof typeof CambioProcessoScalarFieldEnum]


  export const EstimativaProcessoScalarFieldEnum: {
    id_estimativa_processo: 'id_estimativa_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    total_imposto_ii_processo: 'total_imposto_ii_processo',
    total_imposto_ipi_processo: 'total_imposto_ipi_processo',
    total_imposto_pis_processo: 'total_imposto_pis_processo',
    total_imposto_cofins_processo: 'total_imposto_cofins_processo',
    total_imposto_icms_processo: 'total_imposto_icms_processo',
    valor_frete_estimado_processo: 'valor_frete_estimado_processo',
    valor_despacho_estimado_processo: 'valor_despacho_estimado_processo',
    valor_outros_estimado_processo: 'valor_outros_estimado_processo',
    valor_total_estimado_processo: 'valor_total_estimado_processo',
    moeda_estimativa_processo: 'moeda_estimativa_processo',
    data_criacao_estimativa_processo: 'data_criacao_estimativa_processo',
    data_atualizacao_estimativa_processo: 'data_atualizacao_estimativa_processo'
  };

  export type EstimativaProcessoScalarFieldEnum = (typeof EstimativaProcessoScalarFieldEnum)[keyof typeof EstimativaProcessoScalarFieldEnum]


  export const DocumentoProcessoScalarFieldEnum: {
    id_documento_processo: 'id_documento_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_usuario: 'id_usuario',
    id_processo: 'id_processo',
    nome_documento_processo: 'nome_documento_processo',
    tipo_arquivo_documento_processo: 'tipo_arquivo_documento_processo',
    tamanho_bytes_documento_processo: 'tamanho_bytes_documento_processo',
    url_documento_processo: 'url_documento_processo',
    categoria_documento_processo: 'categoria_documento_processo',
    numero_bl_processo: 'numero_bl_processo',
    numero_hawb_processo: 'numero_hawb_processo',
    numero_mawb_processo: 'numero_mawb_processo',
    numero_awb_processo: 'numero_awb_processo',
    numero_hbl_processo: 'numero_hbl_processo',
    numero_mbl_processo: 'numero_mbl_processo',
    numero_ce_mercante_processo: 'numero_ce_mercante_processo',
    numero_certificado_origem_processo: 'numero_certificado_origem_processo',
    numero_cim_processo: 'numero_cim_processo',
    numero_crt_processo: 'numero_crt_processo',
    numero_presenca_carga_destino_processo: 'numero_presenca_carga_destino_processo',
    data_criacao_documento_processo: 'data_criacao_documento_processo'
  };

  export type DocumentoProcessoScalarFieldEnum = (typeof DocumentoProcessoScalarFieldEnum)[keyof typeof DocumentoProcessoScalarFieldEnum]


  export const ContainerProcessoScalarFieldEnum: {
    id_processo_container: 'id_processo_container',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_processo: 'id_processo',
    container_numero_processo_container: 'container_numero_processo_container',
    container_tipo_processo_container: 'container_tipo_processo_container',
    container_lacre_processo_container: 'container_lacre_processo_container',
    container_tara_processo_container: 'container_tara_processo_container',
    container_peso_bruto_processo_container: 'container_peso_bruto_processo_container',
    container_peso_liquido_processo_container: 'container_peso_liquido_processo_container',
    container_metragem_cubica_processo_container: 'container_metragem_cubica_processo_container',
    local_devolucao_processo_container: 'local_devolucao_processo_container',
    data_devolucao_prevista_processo_container: 'data_devolucao_prevista_processo_container',
    data_devolucao_real_processo_container: 'data_devolucao_real_processo_container',
    data_criacao_container_processo: 'data_criacao_container_processo',
    data_atualizacao_container_processo: 'data_atualizacao_container_processo'
  };

  export type ContainerProcessoScalarFieldEnum = (typeof ContainerProcessoScalarFieldEnum)[keyof typeof ContainerProcessoScalarFieldEnum]


  export const FollowUpProcessoScalarFieldEnum: {
    id_follow_up_processo: 'id_follow_up_processo',
    id_organizacao: 'id_organizacao',
    id_produto_gravity: 'id_produto_gravity',
    id_usuario: 'id_usuario',
    id_processo: 'id_processo',
    titulo_follow_up_processo: 'titulo_follow_up_processo',
    descricao_follow_up_processo: 'descricao_follow_up_processo',
    tipo_follow_up_processo: 'tipo_follow_up_processo',
    categoria_follow_up_processo: 'categoria_follow_up_processo',
    id_usuario_registro_follow_up_processo: 'id_usuario_registro_follow_up_processo',
    nome_usuario_registro_follow_up_processo: 'nome_usuario_registro_follow_up_processo',
    data_criacao_follow_up_processo: 'data_criacao_follow_up_processo'
  };

  export type FollowUpProcessoScalarFieldEnum = (typeof FollowUpProcessoScalarFieldEnum)[keyof typeof FollowUpProcessoScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ProcessoWhereInput = {
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    id_processo?: StringFilter<"Processo"> | string
    id_organizacao?: StringFilter<"Processo"> | string
    id_workspace?: StringFilter<"Processo"> | string
    id_produto_gravity?: StringNullableFilter<"Processo"> | string | null
    id_usuario?: StringNullableFilter<"Processo"> | string | null
    numero_processo?: StringFilter<"Processo"> | string
    tipo_operacao_processo?: StringFilter<"Processo"> | string
    referencia_interna_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_importador_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_status_atual_processo?: StringNullableFilter<"Processo"> | string | null
    id_importacao_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_exportacao_importador_processo?: StringNullableFilter<"Processo"> | string | null
    id_cotacao_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_proposta_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_transito_processo?: StringNullableFilter<"Processo"> | string | null
    id_operacao_cambio_processo?: StringNullableFilter<"Processo"> | string | null
    id_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    responsavel_rotina_processo?: StringNullableFilter<"Processo"> | string | null
    setor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    vendedor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    data_criacao_processo?: DateTimeFilter<"Processo"> | Date | string
    data_atualizacao_processo?: DateTimeFilter<"Processo"> | Date | string
    status_atual?: XOR<ProcessoStatusNullableRelationFilter, ProcessoStatusWhereInput> | null
    historico_status?: HistoricoStatusProcessoListRelationFilter
    logistica?: XOR<LogisticaInternacionalProcessoNullableRelationFilter, LogisticaInternacionalProcessoWhereInput> | null
    dados?: XOR<DadosProcessoNullableRelationFilter, DadosProcessoWhereInput> | null
    cambio?: XOR<CambioProcessoNullableRelationFilter, CambioProcessoWhereInput> | null
    estimativa?: XOR<EstimativaProcessoNullableRelationFilter, EstimativaProcessoWhereInput> | null
    containers?: ContainerProcessoListRelationFilter
    documentos?: DocumentoProcessoListRelationFilter
    follow_ups?: FollowUpProcessoListRelationFilter
  }

  export type ProcessoOrderByWithRelationInput = {
    id_processo?: SortOrder
    id_organizacao?: SortOrder
    id_workspace?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    numero_processo?: SortOrder
    tipo_operacao_processo?: SortOrder
    referencia_interna_processo?: SortOrderInput | SortOrder
    referencia_importador_processo?: SortOrderInput | SortOrder
    referencia_exportador_processo?: SortOrderInput | SortOrder
    id_status_atual_processo?: SortOrderInput | SortOrder
    id_importacao_exportador_processo?: SortOrderInput | SortOrder
    id_exportacao_importador_processo?: SortOrderInput | SortOrder
    id_cotacao_bid_frete_internacional?: SortOrderInput | SortOrder
    id_proposta_bid_frete_internacional?: SortOrderInput | SortOrder
    id_transito_processo?: SortOrderInput | SortOrder
    id_operacao_cambio_processo?: SortOrderInput | SortOrder
    id_responsavel_processo?: SortOrderInput | SortOrder
    responsavel_rotina_processo?: SortOrderInput | SortOrder
    setor_responsavel_processo?: SortOrderInput | SortOrder
    vendedor_responsavel_processo?: SortOrderInput | SortOrder
    data_criacao_processo?: SortOrder
    data_atualizacao_processo?: SortOrder
    status_atual?: ProcessoStatusOrderByWithRelationInput
    historico_status?: HistoricoStatusProcessoOrderByRelationAggregateInput
    logistica?: LogisticaInternacionalProcessoOrderByWithRelationInput
    dados?: DadosProcessoOrderByWithRelationInput
    cambio?: CambioProcessoOrderByWithRelationInput
    estimativa?: EstimativaProcessoOrderByWithRelationInput
    containers?: ContainerProcessoOrderByRelationAggregateInput
    documentos?: DocumentoProcessoOrderByRelationAggregateInput
    follow_ups?: FollowUpProcessoOrderByRelationAggregateInput
  }

  export type ProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_processo?: string
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    id_organizacao?: StringFilter<"Processo"> | string
    id_workspace?: StringFilter<"Processo"> | string
    id_produto_gravity?: StringNullableFilter<"Processo"> | string | null
    id_usuario?: StringNullableFilter<"Processo"> | string | null
    numero_processo?: StringFilter<"Processo"> | string
    tipo_operacao_processo?: StringFilter<"Processo"> | string
    referencia_interna_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_importador_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_status_atual_processo?: StringNullableFilter<"Processo"> | string | null
    id_importacao_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_exportacao_importador_processo?: StringNullableFilter<"Processo"> | string | null
    id_cotacao_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_proposta_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_transito_processo?: StringNullableFilter<"Processo"> | string | null
    id_operacao_cambio_processo?: StringNullableFilter<"Processo"> | string | null
    id_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    responsavel_rotina_processo?: StringNullableFilter<"Processo"> | string | null
    setor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    vendedor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    data_criacao_processo?: DateTimeFilter<"Processo"> | Date | string
    data_atualizacao_processo?: DateTimeFilter<"Processo"> | Date | string
    status_atual?: XOR<ProcessoStatusNullableRelationFilter, ProcessoStatusWhereInput> | null
    historico_status?: HistoricoStatusProcessoListRelationFilter
    logistica?: XOR<LogisticaInternacionalProcessoNullableRelationFilter, LogisticaInternacionalProcessoWhereInput> | null
    dados?: XOR<DadosProcessoNullableRelationFilter, DadosProcessoWhereInput> | null
    cambio?: XOR<CambioProcessoNullableRelationFilter, CambioProcessoWhereInput> | null
    estimativa?: XOR<EstimativaProcessoNullableRelationFilter, EstimativaProcessoWhereInput> | null
    containers?: ContainerProcessoListRelationFilter
    documentos?: DocumentoProcessoListRelationFilter
    follow_ups?: FollowUpProcessoListRelationFilter
  }, "id_processo">

  export type ProcessoOrderByWithAggregationInput = {
    id_processo?: SortOrder
    id_organizacao?: SortOrder
    id_workspace?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    numero_processo?: SortOrder
    tipo_operacao_processo?: SortOrder
    referencia_interna_processo?: SortOrderInput | SortOrder
    referencia_importador_processo?: SortOrderInput | SortOrder
    referencia_exportador_processo?: SortOrderInput | SortOrder
    id_status_atual_processo?: SortOrderInput | SortOrder
    id_importacao_exportador_processo?: SortOrderInput | SortOrder
    id_exportacao_importador_processo?: SortOrderInput | SortOrder
    id_cotacao_bid_frete_internacional?: SortOrderInput | SortOrder
    id_proposta_bid_frete_internacional?: SortOrderInput | SortOrder
    id_transito_processo?: SortOrderInput | SortOrder
    id_operacao_cambio_processo?: SortOrderInput | SortOrder
    id_responsavel_processo?: SortOrderInput | SortOrder
    responsavel_rotina_processo?: SortOrderInput | SortOrder
    setor_responsavel_processo?: SortOrderInput | SortOrder
    vendedor_responsavel_processo?: SortOrderInput | SortOrder
    data_criacao_processo?: SortOrder
    data_atualizacao_processo?: SortOrder
    _count?: ProcessoCountOrderByAggregateInput
    _max?: ProcessoMaxOrderByAggregateInput
    _min?: ProcessoMinOrderByAggregateInput
  }

  export type ProcessoScalarWhereWithAggregatesInput = {
    AND?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    OR?: ProcessoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    id_processo?: StringWithAggregatesFilter<"Processo"> | string
    id_organizacao?: StringWithAggregatesFilter<"Processo"> | string
    id_workspace?: StringWithAggregatesFilter<"Processo"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_usuario?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    numero_processo?: StringWithAggregatesFilter<"Processo"> | string
    tipo_operacao_processo?: StringWithAggregatesFilter<"Processo"> | string
    referencia_interna_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    referencia_importador_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    referencia_exportador_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_status_atual_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_importacao_exportador_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_exportacao_importador_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_cotacao_bid_frete_internacional?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_proposta_bid_frete_internacional?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_transito_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_operacao_cambio_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    id_responsavel_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    responsavel_rotina_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    setor_responsavel_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    vendedor_responsavel_processo?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    data_criacao_processo?: DateTimeWithAggregatesFilter<"Processo"> | Date | string
    data_atualizacao_processo?: DateTimeWithAggregatesFilter<"Processo"> | Date | string
  }

  export type ProcessoStatusWhereInput = {
    AND?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    OR?: ProcessoStatusWhereInput[]
    NOT?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    id_processo_status?: StringFilter<"ProcessoStatus"> | string
    id_organizacao?: StringFilter<"ProcessoStatus"> | string
    id_produto_gravity?: StringNullableFilter<"ProcessoStatus"> | string | null
    tipo_status_processo?: StringFilter<"ProcessoStatus"> | string
    rotulo_status_processo?: StringFilter<"ProcessoStatus"> | string
    cor_status_processo?: StringFilter<"ProcessoStatus"> | string
    ordem_status_processo?: IntFilter<"ProcessoStatus"> | number
    regras_status_processo?: JsonNullableFilter<"ProcessoStatus">
    eh_padrao_status_processo?: BoolFilter<"ProcessoStatus"> | boolean
    eh_sistema_status_processo?: BoolFilter<"ProcessoStatus"> | boolean
    data_criacao_processo_status?: DateTimeFilter<"ProcessoStatus"> | Date | string
    data_atualizacao_processo_status?: DateTimeFilter<"ProcessoStatus"> | Date | string
    processos?: ProcessoListRelationFilter
    historico_anterior?: HistoricoStatusProcessoListRelationFilter
    historico_novo?: HistoricoStatusProcessoListRelationFilter
  }

  export type ProcessoStatusOrderByWithRelationInput = {
    id_processo_status?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    tipo_status_processo?: SortOrder
    rotulo_status_processo?: SortOrder
    cor_status_processo?: SortOrder
    ordem_status_processo?: SortOrder
    regras_status_processo?: SortOrderInput | SortOrder
    eh_padrao_status_processo?: SortOrder
    eh_sistema_status_processo?: SortOrder
    data_criacao_processo_status?: SortOrder
    data_atualizacao_processo_status?: SortOrder
    processos?: ProcessoOrderByRelationAggregateInput
    historico_anterior?: HistoricoStatusProcessoOrderByRelationAggregateInput
    historico_novo?: HistoricoStatusProcessoOrderByRelationAggregateInput
  }

  export type ProcessoStatusWhereUniqueInput = Prisma.AtLeast<{
    id_processo_status?: string
    id_organizacao_tipo_status_processo?: ProcessoStatusId_organizacaoTipo_status_processoCompoundUniqueInput
    AND?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    OR?: ProcessoStatusWhereInput[]
    NOT?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    id_organizacao?: StringFilter<"ProcessoStatus"> | string
    id_produto_gravity?: StringNullableFilter<"ProcessoStatus"> | string | null
    tipo_status_processo?: StringFilter<"ProcessoStatus"> | string
    rotulo_status_processo?: StringFilter<"ProcessoStatus"> | string
    cor_status_processo?: StringFilter<"ProcessoStatus"> | string
    ordem_status_processo?: IntFilter<"ProcessoStatus"> | number
    regras_status_processo?: JsonNullableFilter<"ProcessoStatus">
    eh_padrao_status_processo?: BoolFilter<"ProcessoStatus"> | boolean
    eh_sistema_status_processo?: BoolFilter<"ProcessoStatus"> | boolean
    data_criacao_processo_status?: DateTimeFilter<"ProcessoStatus"> | Date | string
    data_atualizacao_processo_status?: DateTimeFilter<"ProcessoStatus"> | Date | string
    processos?: ProcessoListRelationFilter
    historico_anterior?: HistoricoStatusProcessoListRelationFilter
    historico_novo?: HistoricoStatusProcessoListRelationFilter
  }, "id_processo_status" | "id_organizacao_tipo_status_processo">

  export type ProcessoStatusOrderByWithAggregationInput = {
    id_processo_status?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    tipo_status_processo?: SortOrder
    rotulo_status_processo?: SortOrder
    cor_status_processo?: SortOrder
    ordem_status_processo?: SortOrder
    regras_status_processo?: SortOrderInput | SortOrder
    eh_padrao_status_processo?: SortOrder
    eh_sistema_status_processo?: SortOrder
    data_criacao_processo_status?: SortOrder
    data_atualizacao_processo_status?: SortOrder
    _count?: ProcessoStatusCountOrderByAggregateInput
    _avg?: ProcessoStatusAvgOrderByAggregateInput
    _max?: ProcessoStatusMaxOrderByAggregateInput
    _min?: ProcessoStatusMinOrderByAggregateInput
    _sum?: ProcessoStatusSumOrderByAggregateInput
  }

  export type ProcessoStatusScalarWhereWithAggregatesInput = {
    AND?: ProcessoStatusScalarWhereWithAggregatesInput | ProcessoStatusScalarWhereWithAggregatesInput[]
    OR?: ProcessoStatusScalarWhereWithAggregatesInput[]
    NOT?: ProcessoStatusScalarWhereWithAggregatesInput | ProcessoStatusScalarWhereWithAggregatesInput[]
    id_processo_status?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    id_organizacao?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"ProcessoStatus"> | string | null
    tipo_status_processo?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    rotulo_status_processo?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    cor_status_processo?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    ordem_status_processo?: IntWithAggregatesFilter<"ProcessoStatus"> | number
    regras_status_processo?: JsonNullableWithAggregatesFilter<"ProcessoStatus">
    eh_padrao_status_processo?: BoolWithAggregatesFilter<"ProcessoStatus"> | boolean
    eh_sistema_status_processo?: BoolWithAggregatesFilter<"ProcessoStatus"> | boolean
    data_criacao_processo_status?: DateTimeWithAggregatesFilter<"ProcessoStatus"> | Date | string
    data_atualizacao_processo_status?: DateTimeWithAggregatesFilter<"ProcessoStatus"> | Date | string
  }

  export type HistoricoStatusProcessoWhereInput = {
    AND?: HistoricoStatusProcessoWhereInput | HistoricoStatusProcessoWhereInput[]
    OR?: HistoricoStatusProcessoWhereInput[]
    NOT?: HistoricoStatusProcessoWhereInput | HistoricoStatusProcessoWhereInput[]
    id_historico_status_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_organizacao?: StringFilter<"HistoricoStatusProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_status_anterior_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_status_novo_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_usuario_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    data_mudanca_status_processo?: DateTimeFilter<"HistoricoStatusProcesso"> | Date | string
    observacao_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
    status_anterior?: XOR<ProcessoStatusNullableRelationFilter, ProcessoStatusWhereInput> | null
    status_novo?: XOR<ProcessoStatusRelationFilter, ProcessoStatusWhereInput>
  }

  export type HistoricoStatusProcessoOrderByWithRelationInput = {
    id_historico_status_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    id_status_anterior_processo?: SortOrderInput | SortOrder
    id_status_novo_processo?: SortOrder
    id_usuario_mudanca_status_processo?: SortOrderInput | SortOrder
    data_mudanca_status_processo?: SortOrder
    observacao_mudanca_status_processo?: SortOrderInput | SortOrder
    processo?: ProcessoOrderByWithRelationInput
    status_anterior?: ProcessoStatusOrderByWithRelationInput
    status_novo?: ProcessoStatusOrderByWithRelationInput
  }

  export type HistoricoStatusProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_historico_status_processo?: string
    AND?: HistoricoStatusProcessoWhereInput | HistoricoStatusProcessoWhereInput[]
    OR?: HistoricoStatusProcessoWhereInput[]
    NOT?: HistoricoStatusProcessoWhereInput | HistoricoStatusProcessoWhereInput[]
    id_organizacao?: StringFilter<"HistoricoStatusProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_status_anterior_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_status_novo_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_usuario_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    data_mudanca_status_processo?: DateTimeFilter<"HistoricoStatusProcesso"> | Date | string
    observacao_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
    status_anterior?: XOR<ProcessoStatusNullableRelationFilter, ProcessoStatusWhereInput> | null
    status_novo?: XOR<ProcessoStatusRelationFilter, ProcessoStatusWhereInput>
  }, "id_historico_status_processo">

  export type HistoricoStatusProcessoOrderByWithAggregationInput = {
    id_historico_status_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    id_status_anterior_processo?: SortOrderInput | SortOrder
    id_status_novo_processo?: SortOrder
    id_usuario_mudanca_status_processo?: SortOrderInput | SortOrder
    data_mudanca_status_processo?: SortOrder
    observacao_mudanca_status_processo?: SortOrderInput | SortOrder
    _count?: HistoricoStatusProcessoCountOrderByAggregateInput
    _max?: HistoricoStatusProcessoMaxOrderByAggregateInput
    _min?: HistoricoStatusProcessoMinOrderByAggregateInput
  }

  export type HistoricoStatusProcessoScalarWhereWithAggregatesInput = {
    AND?: HistoricoStatusProcessoScalarWhereWithAggregatesInput | HistoricoStatusProcessoScalarWhereWithAggregatesInput[]
    OR?: HistoricoStatusProcessoScalarWhereWithAggregatesInput[]
    NOT?: HistoricoStatusProcessoScalarWhereWithAggregatesInput | HistoricoStatusProcessoScalarWhereWithAggregatesInput[]
    id_historico_status_processo?: StringWithAggregatesFilter<"HistoricoStatusProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"HistoricoStatusProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"HistoricoStatusProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"HistoricoStatusProcesso"> | string
    id_status_anterior_processo?: StringNullableWithAggregatesFilter<"HistoricoStatusProcesso"> | string | null
    id_status_novo_processo?: StringWithAggregatesFilter<"HistoricoStatusProcesso"> | string
    id_usuario_mudanca_status_processo?: StringNullableWithAggregatesFilter<"HistoricoStatusProcesso"> | string | null
    data_mudanca_status_processo?: DateTimeWithAggregatesFilter<"HistoricoStatusProcesso"> | Date | string
    observacao_mudanca_status_processo?: StringNullableWithAggregatesFilter<"HistoricoStatusProcesso"> | string | null
  }

  export type LogisticaInternacionalProcessoWhereInput = {
    AND?: LogisticaInternacionalProcessoWhereInput | LogisticaInternacionalProcessoWhereInput[]
    OR?: LogisticaInternacionalProcessoWhereInput[]
    NOT?: LogisticaInternacionalProcessoWhereInput | LogisticaInternacionalProcessoWhereInput[]
    id_logistica_internacional_processo?: StringFilter<"LogisticaInternacionalProcesso"> | string
    id_organizacao?: StringFilter<"LogisticaInternacionalProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_processo?: StringFilter<"LogisticaInternacionalProcesso"> | string
    modal_frete_internacional_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_frete_internacional_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_volume_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    incoterm_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_origem_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_destino_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_transbordo_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_origem_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_destino_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_escala_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_agente_carga?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armador?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_cia_aerea?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_internacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_nacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_ferroviario?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_despachante?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armazem_alfandegado?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_seguradora_internacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFilter<"LogisticaInternacionalProcesso"> | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFilter<"LogisticaInternacionalProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type LogisticaInternacionalProcessoOrderByWithRelationInput = {
    id_logistica_internacional_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    modal_frete_internacional_processo?: SortOrderInput | SortOrder
    tipo_frete_internacional_processo?: SortOrderInput | SortOrder
    tipo_volume_processo?: SortOrderInput | SortOrder
    incoterm_processo?: SortOrderInput | SortOrder
    porto_origem_processo?: SortOrderInput | SortOrder
    porto_destino_processo?: SortOrderInput | SortOrder
    porto_transbordo_processo?: SortOrderInput | SortOrder
    aeroporto_origem_processo?: SortOrderInput | SortOrder
    aeroporto_destino_processo?: SortOrderInput | SortOrder
    aeroporto_escala_processo?: SortOrderInput | SortOrder
    id_agente_carga?: SortOrderInput | SortOrder
    id_armador?: SortOrderInput | SortOrder
    id_cia_aerea?: SortOrderInput | SortOrder
    id_transportador_rodo_internacional?: SortOrderInput | SortOrder
    id_transportador_rodo_nacional?: SortOrderInput | SortOrder
    id_transportador_ferroviario?: SortOrderInput | SortOrder
    id_despachante?: SortOrderInput | SortOrder
    id_armazem_alfandegado?: SortOrderInput | SortOrder
    id_seguradora_internacional?: SortOrderInput | SortOrder
    data_criacao_logistica_internacional_processo?: SortOrder
    data_atualizacao_logistica_internacional_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type LogisticaInternacionalProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_logistica_internacional_processo?: string
    id_processo?: string
    AND?: LogisticaInternacionalProcessoWhereInput | LogisticaInternacionalProcessoWhereInput[]
    OR?: LogisticaInternacionalProcessoWhereInput[]
    NOT?: LogisticaInternacionalProcessoWhereInput | LogisticaInternacionalProcessoWhereInput[]
    id_organizacao?: StringFilter<"LogisticaInternacionalProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    modal_frete_internacional_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_frete_internacional_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_volume_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    incoterm_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_origem_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_destino_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_transbordo_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_origem_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_destino_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_escala_processo?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_agente_carga?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armador?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_cia_aerea?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_internacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_nacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_ferroviario?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_despachante?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armazem_alfandegado?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    id_seguradora_internacional?: StringNullableFilter<"LogisticaInternacionalProcesso"> | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFilter<"LogisticaInternacionalProcesso"> | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFilter<"LogisticaInternacionalProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_logistica_internacional_processo" | "id_processo">

  export type LogisticaInternacionalProcessoOrderByWithAggregationInput = {
    id_logistica_internacional_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    modal_frete_internacional_processo?: SortOrderInput | SortOrder
    tipo_frete_internacional_processo?: SortOrderInput | SortOrder
    tipo_volume_processo?: SortOrderInput | SortOrder
    incoterm_processo?: SortOrderInput | SortOrder
    porto_origem_processo?: SortOrderInput | SortOrder
    porto_destino_processo?: SortOrderInput | SortOrder
    porto_transbordo_processo?: SortOrderInput | SortOrder
    aeroporto_origem_processo?: SortOrderInput | SortOrder
    aeroporto_destino_processo?: SortOrderInput | SortOrder
    aeroporto_escala_processo?: SortOrderInput | SortOrder
    id_agente_carga?: SortOrderInput | SortOrder
    id_armador?: SortOrderInput | SortOrder
    id_cia_aerea?: SortOrderInput | SortOrder
    id_transportador_rodo_internacional?: SortOrderInput | SortOrder
    id_transportador_rodo_nacional?: SortOrderInput | SortOrder
    id_transportador_ferroviario?: SortOrderInput | SortOrder
    id_despachante?: SortOrderInput | SortOrder
    id_armazem_alfandegado?: SortOrderInput | SortOrder
    id_seguradora_internacional?: SortOrderInput | SortOrder
    data_criacao_logistica_internacional_processo?: SortOrder
    data_atualizacao_logistica_internacional_processo?: SortOrder
    _count?: LogisticaInternacionalProcessoCountOrderByAggregateInput
    _max?: LogisticaInternacionalProcessoMaxOrderByAggregateInput
    _min?: LogisticaInternacionalProcessoMinOrderByAggregateInput
  }

  export type LogisticaInternacionalProcessoScalarWhereWithAggregatesInput = {
    AND?: LogisticaInternacionalProcessoScalarWhereWithAggregatesInput | LogisticaInternacionalProcessoScalarWhereWithAggregatesInput[]
    OR?: LogisticaInternacionalProcessoScalarWhereWithAggregatesInput[]
    NOT?: LogisticaInternacionalProcessoScalarWhereWithAggregatesInput | LogisticaInternacionalProcessoScalarWhereWithAggregatesInput[]
    id_logistica_internacional_processo?: StringWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string
    modal_frete_internacional_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_frete_internacional_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    tipo_volume_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    incoterm_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_origem_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_destino_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    porto_transbordo_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_origem_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_destino_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    aeroporto_escala_processo?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_agente_carga?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armador?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_cia_aerea?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_internacional?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_rodo_nacional?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_transportador_ferroviario?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_despachante?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_armazem_alfandegado?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    id_seguradora_internacional?: StringNullableWithAggregatesFilter<"LogisticaInternacionalProcesso"> | string | null
    data_criacao_logistica_internacional_processo?: DateTimeWithAggregatesFilter<"LogisticaInternacionalProcesso"> | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeWithAggregatesFilter<"LogisticaInternacionalProcesso"> | Date | string
  }

  export type DadosProcessoWhereInput = {
    AND?: DadosProcessoWhereInput | DadosProcessoWhereInput[]
    OR?: DadosProcessoWhereInput[]
    NOT?: DadosProcessoWhereInput | DadosProcessoWhereInput[]
    id_dados_processo?: StringFilter<"DadosProcesso"> | string
    id_organizacao?: StringFilter<"DadosProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"DadosProcesso"> | string | null
    id_processo?: StringFilter<"DadosProcesso"> | string
    canal_parametrizacao_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    numero_duimp_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    numero_nfe_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    chave_acesso_nfe_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    data_registro_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_registro_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_deferimento_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_indeferimento_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_pendencia_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_criacao_dados_processo?: DateTimeFilter<"DadosProcesso"> | Date | string
    data_atualizacao_dados_processo?: DateTimeFilter<"DadosProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type DadosProcessoOrderByWithRelationInput = {
    id_dados_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    canal_parametrizacao_processo?: SortOrderInput | SortOrder
    numero_duimp_processo?: SortOrderInput | SortOrder
    numero_nfe_processo?: SortOrderInput | SortOrder
    chave_acesso_nfe_processo?: SortOrderInput | SortOrder
    data_registro_duimp_processo?: SortOrderInput | SortOrder
    data_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_consulta_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_previsao_registro_duimp_processo?: SortOrderInput | SortOrder
    data_previsao_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_registro_lpco_processo?: SortOrderInput | SortOrder
    data_deferimento_lpco_processo?: SortOrderInput | SortOrder
    data_indeferimento_lpco_processo?: SortOrderInput | SortOrder
    data_pendencia_lpco_processo?: SortOrderInput | SortOrder
    data_consulta_liberacao_lpco_processo?: SortOrderInput | SortOrder
    data_previsao_registro_lpco_processo?: SortOrderInput | SortOrder
    data_criacao_dados_processo?: SortOrder
    data_atualizacao_dados_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type DadosProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_dados_processo?: string
    id_processo?: string
    AND?: DadosProcessoWhereInput | DadosProcessoWhereInput[]
    OR?: DadosProcessoWhereInput[]
    NOT?: DadosProcessoWhereInput | DadosProcessoWhereInput[]
    id_organizacao?: StringFilter<"DadosProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"DadosProcesso"> | string | null
    canal_parametrizacao_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    numero_duimp_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    numero_nfe_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    chave_acesso_nfe_processo?: StringNullableFilter<"DadosProcesso"> | string | null
    data_registro_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_liberacao_duimp_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_registro_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_deferimento_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_indeferimento_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_pendencia_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_lpco_processo?: DateTimeNullableFilter<"DadosProcesso"> | Date | string | null
    data_criacao_dados_processo?: DateTimeFilter<"DadosProcesso"> | Date | string
    data_atualizacao_dados_processo?: DateTimeFilter<"DadosProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_dados_processo" | "id_processo">

  export type DadosProcessoOrderByWithAggregationInput = {
    id_dados_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    canal_parametrizacao_processo?: SortOrderInput | SortOrder
    numero_duimp_processo?: SortOrderInput | SortOrder
    numero_nfe_processo?: SortOrderInput | SortOrder
    chave_acesso_nfe_processo?: SortOrderInput | SortOrder
    data_registro_duimp_processo?: SortOrderInput | SortOrder
    data_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_consulta_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_previsao_registro_duimp_processo?: SortOrderInput | SortOrder
    data_previsao_liberacao_duimp_processo?: SortOrderInput | SortOrder
    data_registro_lpco_processo?: SortOrderInput | SortOrder
    data_deferimento_lpco_processo?: SortOrderInput | SortOrder
    data_indeferimento_lpco_processo?: SortOrderInput | SortOrder
    data_pendencia_lpco_processo?: SortOrderInput | SortOrder
    data_consulta_liberacao_lpco_processo?: SortOrderInput | SortOrder
    data_previsao_registro_lpco_processo?: SortOrderInput | SortOrder
    data_criacao_dados_processo?: SortOrder
    data_atualizacao_dados_processo?: SortOrder
    _count?: DadosProcessoCountOrderByAggregateInput
    _max?: DadosProcessoMaxOrderByAggregateInput
    _min?: DadosProcessoMinOrderByAggregateInput
  }

  export type DadosProcessoScalarWhereWithAggregatesInput = {
    AND?: DadosProcessoScalarWhereWithAggregatesInput | DadosProcessoScalarWhereWithAggregatesInput[]
    OR?: DadosProcessoScalarWhereWithAggregatesInput[]
    NOT?: DadosProcessoScalarWhereWithAggregatesInput | DadosProcessoScalarWhereWithAggregatesInput[]
    id_dados_processo?: StringWithAggregatesFilter<"DadosProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"DadosProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"DadosProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"DadosProcesso"> | string
    canal_parametrizacao_processo?: StringNullableWithAggregatesFilter<"DadosProcesso"> | string | null
    numero_duimp_processo?: StringNullableWithAggregatesFilter<"DadosProcesso"> | string | null
    numero_nfe_processo?: StringNullableWithAggregatesFilter<"DadosProcesso"> | string | null
    chave_acesso_nfe_processo?: StringNullableWithAggregatesFilter<"DadosProcesso"> | string | null
    data_registro_duimp_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_liberacao_duimp_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_duimp_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_duimp_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_previsao_liberacao_duimp_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_registro_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_deferimento_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_indeferimento_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_pendencia_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_consulta_liberacao_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_previsao_registro_lpco_processo?: DateTimeNullableWithAggregatesFilter<"DadosProcesso"> | Date | string | null
    data_criacao_dados_processo?: DateTimeWithAggregatesFilter<"DadosProcesso"> | Date | string
    data_atualizacao_dados_processo?: DateTimeWithAggregatesFilter<"DadosProcesso"> | Date | string
  }

  export type CambioProcessoWhereInput = {
    AND?: CambioProcessoWhereInput | CambioProcessoWhereInput[]
    OR?: CambioProcessoWhereInput[]
    NOT?: CambioProcessoWhereInput | CambioProcessoWhereInput[]
    id_cambio_processo?: StringFilter<"CambioProcesso"> | string
    id_organizacao?: StringFilter<"CambioProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"CambioProcesso"> | string | null
    id_processo?: StringFilter<"CambioProcesso"> | string
    id_banco_processo?: StringNullableFilter<"CambioProcesso"> | string | null
    id_corretora_cambio_processo?: StringNullableFilter<"CambioProcesso"> | string | null
    data_criacao_cambio_processo?: DateTimeFilter<"CambioProcesso"> | Date | string
    data_atualizacao_cambio_processo?: DateTimeFilter<"CambioProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type CambioProcessoOrderByWithRelationInput = {
    id_cambio_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    id_banco_processo?: SortOrderInput | SortOrder
    id_corretora_cambio_processo?: SortOrderInput | SortOrder
    data_criacao_cambio_processo?: SortOrder
    data_atualizacao_cambio_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type CambioProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_cambio_processo?: string
    id_processo?: string
    AND?: CambioProcessoWhereInput | CambioProcessoWhereInput[]
    OR?: CambioProcessoWhereInput[]
    NOT?: CambioProcessoWhereInput | CambioProcessoWhereInput[]
    id_organizacao?: StringFilter<"CambioProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"CambioProcesso"> | string | null
    id_banco_processo?: StringNullableFilter<"CambioProcesso"> | string | null
    id_corretora_cambio_processo?: StringNullableFilter<"CambioProcesso"> | string | null
    data_criacao_cambio_processo?: DateTimeFilter<"CambioProcesso"> | Date | string
    data_atualizacao_cambio_processo?: DateTimeFilter<"CambioProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_cambio_processo" | "id_processo">

  export type CambioProcessoOrderByWithAggregationInput = {
    id_cambio_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    id_banco_processo?: SortOrderInput | SortOrder
    id_corretora_cambio_processo?: SortOrderInput | SortOrder
    data_criacao_cambio_processo?: SortOrder
    data_atualizacao_cambio_processo?: SortOrder
    _count?: CambioProcessoCountOrderByAggregateInput
    _max?: CambioProcessoMaxOrderByAggregateInput
    _min?: CambioProcessoMinOrderByAggregateInput
  }

  export type CambioProcessoScalarWhereWithAggregatesInput = {
    AND?: CambioProcessoScalarWhereWithAggregatesInput | CambioProcessoScalarWhereWithAggregatesInput[]
    OR?: CambioProcessoScalarWhereWithAggregatesInput[]
    NOT?: CambioProcessoScalarWhereWithAggregatesInput | CambioProcessoScalarWhereWithAggregatesInput[]
    id_cambio_processo?: StringWithAggregatesFilter<"CambioProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"CambioProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"CambioProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"CambioProcesso"> | string
    id_banco_processo?: StringNullableWithAggregatesFilter<"CambioProcesso"> | string | null
    id_corretora_cambio_processo?: StringNullableWithAggregatesFilter<"CambioProcesso"> | string | null
    data_criacao_cambio_processo?: DateTimeWithAggregatesFilter<"CambioProcesso"> | Date | string
    data_atualizacao_cambio_processo?: DateTimeWithAggregatesFilter<"CambioProcesso"> | Date | string
  }

  export type EstimativaProcessoWhereInput = {
    AND?: EstimativaProcessoWhereInput | EstimativaProcessoWhereInput[]
    OR?: EstimativaProcessoWhereInput[]
    NOT?: EstimativaProcessoWhereInput | EstimativaProcessoWhereInput[]
    id_estimativa_processo?: StringFilter<"EstimativaProcesso"> | string
    id_organizacao?: StringFilter<"EstimativaProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"EstimativaProcesso"> | string | null
    id_processo?: StringFilter<"EstimativaProcesso"> | string
    total_imposto_ii_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFilter<"EstimativaProcesso"> | string
    data_criacao_estimativa_processo?: DateTimeFilter<"EstimativaProcesso"> | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFilter<"EstimativaProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type EstimativaProcessoOrderByWithRelationInput = {
    id_estimativa_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    total_imposto_ii_processo?: SortOrderInput | SortOrder
    total_imposto_ipi_processo?: SortOrderInput | SortOrder
    total_imposto_pis_processo?: SortOrderInput | SortOrder
    total_imposto_cofins_processo?: SortOrderInput | SortOrder
    total_imposto_icms_processo?: SortOrderInput | SortOrder
    valor_frete_estimado_processo?: SortOrderInput | SortOrder
    valor_despacho_estimado_processo?: SortOrderInput | SortOrder
    valor_outros_estimado_processo?: SortOrderInput | SortOrder
    valor_total_estimado_processo?: SortOrderInput | SortOrder
    moeda_estimativa_processo?: SortOrder
    data_criacao_estimativa_processo?: SortOrder
    data_atualizacao_estimativa_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type EstimativaProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_estimativa_processo?: string
    id_processo?: string
    AND?: EstimativaProcessoWhereInput | EstimativaProcessoWhereInput[]
    OR?: EstimativaProcessoWhereInput[]
    NOT?: EstimativaProcessoWhereInput | EstimativaProcessoWhereInput[]
    id_organizacao?: StringFilter<"EstimativaProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"EstimativaProcesso"> | string | null
    total_imposto_ii_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: DecimalNullableFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFilter<"EstimativaProcesso"> | string
    data_criacao_estimativa_processo?: DateTimeFilter<"EstimativaProcesso"> | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFilter<"EstimativaProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_estimativa_processo" | "id_processo">

  export type EstimativaProcessoOrderByWithAggregationInput = {
    id_estimativa_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    total_imposto_ii_processo?: SortOrderInput | SortOrder
    total_imposto_ipi_processo?: SortOrderInput | SortOrder
    total_imposto_pis_processo?: SortOrderInput | SortOrder
    total_imposto_cofins_processo?: SortOrderInput | SortOrder
    total_imposto_icms_processo?: SortOrderInput | SortOrder
    valor_frete_estimado_processo?: SortOrderInput | SortOrder
    valor_despacho_estimado_processo?: SortOrderInput | SortOrder
    valor_outros_estimado_processo?: SortOrderInput | SortOrder
    valor_total_estimado_processo?: SortOrderInput | SortOrder
    moeda_estimativa_processo?: SortOrder
    data_criacao_estimativa_processo?: SortOrder
    data_atualizacao_estimativa_processo?: SortOrder
    _count?: EstimativaProcessoCountOrderByAggregateInput
    _avg?: EstimativaProcessoAvgOrderByAggregateInput
    _max?: EstimativaProcessoMaxOrderByAggregateInput
    _min?: EstimativaProcessoMinOrderByAggregateInput
    _sum?: EstimativaProcessoSumOrderByAggregateInput
  }

  export type EstimativaProcessoScalarWhereWithAggregatesInput = {
    AND?: EstimativaProcessoScalarWhereWithAggregatesInput | EstimativaProcessoScalarWhereWithAggregatesInput[]
    OR?: EstimativaProcessoScalarWhereWithAggregatesInput[]
    NOT?: EstimativaProcessoScalarWhereWithAggregatesInput | EstimativaProcessoScalarWhereWithAggregatesInput[]
    id_estimativa_processo?: StringWithAggregatesFilter<"EstimativaProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"EstimativaProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"EstimativaProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"EstimativaProcesso"> | string
    total_imposto_ii_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: DecimalNullableWithAggregatesFilter<"EstimativaProcesso"> | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringWithAggregatesFilter<"EstimativaProcesso"> | string
    data_criacao_estimativa_processo?: DateTimeWithAggregatesFilter<"EstimativaProcesso"> | Date | string
    data_atualizacao_estimativa_processo?: DateTimeWithAggregatesFilter<"EstimativaProcesso"> | Date | string
  }

  export type DocumentoProcessoWhereInput = {
    AND?: DocumentoProcessoWhereInput | DocumentoProcessoWhereInput[]
    OR?: DocumentoProcessoWhereInput[]
    NOT?: DocumentoProcessoWhereInput | DocumentoProcessoWhereInput[]
    id_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    id_organizacao?: StringFilter<"DocumentoProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_usuario?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_processo?: StringFilter<"DocumentoProcesso"> | string
    nome_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tipo_arquivo_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tamanho_bytes_documento_processo?: IntFilter<"DocumentoProcesso"> | number
    url_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    categoria_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    numero_bl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_awb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_ce_mercante_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_certificado_origem_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_cim_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_crt_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_presenca_carga_destino_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    data_criacao_documento_processo?: DateTimeFilter<"DocumentoProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type DocumentoProcessoOrderByWithRelationInput = {
    id_documento_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    nome_documento_processo?: SortOrder
    tipo_arquivo_documento_processo?: SortOrder
    tamanho_bytes_documento_processo?: SortOrder
    url_documento_processo?: SortOrder
    categoria_documento_processo?: SortOrder
    numero_bl_processo?: SortOrderInput | SortOrder
    numero_hawb_processo?: SortOrderInput | SortOrder
    numero_mawb_processo?: SortOrderInput | SortOrder
    numero_awb_processo?: SortOrderInput | SortOrder
    numero_hbl_processo?: SortOrderInput | SortOrder
    numero_mbl_processo?: SortOrderInput | SortOrder
    numero_ce_mercante_processo?: SortOrderInput | SortOrder
    numero_certificado_origem_processo?: SortOrderInput | SortOrder
    numero_cim_processo?: SortOrderInput | SortOrder
    numero_crt_processo?: SortOrderInput | SortOrder
    numero_presenca_carga_destino_processo?: SortOrderInput | SortOrder
    data_criacao_documento_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type DocumentoProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_documento_processo?: string
    AND?: DocumentoProcessoWhereInput | DocumentoProcessoWhereInput[]
    OR?: DocumentoProcessoWhereInput[]
    NOT?: DocumentoProcessoWhereInput | DocumentoProcessoWhereInput[]
    id_organizacao?: StringFilter<"DocumentoProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_usuario?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_processo?: StringFilter<"DocumentoProcesso"> | string
    nome_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tipo_arquivo_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tamanho_bytes_documento_processo?: IntFilter<"DocumentoProcesso"> | number
    url_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    categoria_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    numero_bl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_awb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_ce_mercante_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_certificado_origem_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_cim_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_crt_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_presenca_carga_destino_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    data_criacao_documento_processo?: DateTimeFilter<"DocumentoProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_documento_processo">

  export type DocumentoProcessoOrderByWithAggregationInput = {
    id_documento_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    nome_documento_processo?: SortOrder
    tipo_arquivo_documento_processo?: SortOrder
    tamanho_bytes_documento_processo?: SortOrder
    url_documento_processo?: SortOrder
    categoria_documento_processo?: SortOrder
    numero_bl_processo?: SortOrderInput | SortOrder
    numero_hawb_processo?: SortOrderInput | SortOrder
    numero_mawb_processo?: SortOrderInput | SortOrder
    numero_awb_processo?: SortOrderInput | SortOrder
    numero_hbl_processo?: SortOrderInput | SortOrder
    numero_mbl_processo?: SortOrderInput | SortOrder
    numero_ce_mercante_processo?: SortOrderInput | SortOrder
    numero_certificado_origem_processo?: SortOrderInput | SortOrder
    numero_cim_processo?: SortOrderInput | SortOrder
    numero_crt_processo?: SortOrderInput | SortOrder
    numero_presenca_carga_destino_processo?: SortOrderInput | SortOrder
    data_criacao_documento_processo?: SortOrder
    _count?: DocumentoProcessoCountOrderByAggregateInput
    _avg?: DocumentoProcessoAvgOrderByAggregateInput
    _max?: DocumentoProcessoMaxOrderByAggregateInput
    _min?: DocumentoProcessoMinOrderByAggregateInput
    _sum?: DocumentoProcessoSumOrderByAggregateInput
  }

  export type DocumentoProcessoScalarWhereWithAggregatesInput = {
    AND?: DocumentoProcessoScalarWhereWithAggregatesInput | DocumentoProcessoScalarWhereWithAggregatesInput[]
    OR?: DocumentoProcessoScalarWhereWithAggregatesInput[]
    NOT?: DocumentoProcessoScalarWhereWithAggregatesInput | DocumentoProcessoScalarWhereWithAggregatesInput[]
    id_documento_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    id_usuario?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    nome_documento_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    tipo_arquivo_documento_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    tamanho_bytes_documento_processo?: IntWithAggregatesFilter<"DocumentoProcesso"> | number
    url_documento_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    categoria_documento_processo?: StringWithAggregatesFilter<"DocumentoProcesso"> | string
    numero_bl_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_hawb_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_mawb_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_awb_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_hbl_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_mbl_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_ce_mercante_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_certificado_origem_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_cim_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_crt_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    numero_presenca_carga_destino_processo?: StringNullableWithAggregatesFilter<"DocumentoProcesso"> | string | null
    data_criacao_documento_processo?: DateTimeWithAggregatesFilter<"DocumentoProcesso"> | Date | string
  }

  export type ContainerProcessoWhereInput = {
    AND?: ContainerProcessoWhereInput | ContainerProcessoWhereInput[]
    OR?: ContainerProcessoWhereInput[]
    NOT?: ContainerProcessoWhereInput | ContainerProcessoWhereInput[]
    id_processo_container?: StringFilter<"ContainerProcesso"> | string
    id_organizacao?: StringFilter<"ContainerProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"ContainerProcesso"> | string | null
    id_processo?: StringFilter<"ContainerProcesso"> | string
    container_numero_processo_container?: StringFilter<"ContainerProcesso"> | string
    container_tipo_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_lacre_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_tara_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    data_devolucao_prevista_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_devolucao_real_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_criacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
    data_atualizacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type ContainerProcessoOrderByWithRelationInput = {
    id_processo_container?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    container_numero_processo_container?: SortOrder
    container_tipo_processo_container?: SortOrderInput | SortOrder
    container_lacre_processo_container?: SortOrderInput | SortOrder
    container_tara_processo_container?: SortOrderInput | SortOrder
    container_peso_bruto_processo_container?: SortOrderInput | SortOrder
    container_peso_liquido_processo_container?: SortOrderInput | SortOrder
    container_metragem_cubica_processo_container?: SortOrderInput | SortOrder
    local_devolucao_processo_container?: SortOrderInput | SortOrder
    data_devolucao_prevista_processo_container?: SortOrderInput | SortOrder
    data_devolucao_real_processo_container?: SortOrderInput | SortOrder
    data_criacao_container_processo?: SortOrder
    data_atualizacao_container_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type ContainerProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_processo_container?: string
    AND?: ContainerProcessoWhereInput | ContainerProcessoWhereInput[]
    OR?: ContainerProcessoWhereInput[]
    NOT?: ContainerProcessoWhereInput | ContainerProcessoWhereInput[]
    id_organizacao?: StringFilter<"ContainerProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"ContainerProcesso"> | string | null
    id_processo?: StringFilter<"ContainerProcesso"> | string
    container_numero_processo_container?: StringFilter<"ContainerProcesso"> | string
    container_tipo_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_lacre_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_tara_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    data_devolucao_prevista_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_devolucao_real_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_criacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
    data_atualizacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_processo_container">

  export type ContainerProcessoOrderByWithAggregationInput = {
    id_processo_container?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    container_numero_processo_container?: SortOrder
    container_tipo_processo_container?: SortOrderInput | SortOrder
    container_lacre_processo_container?: SortOrderInput | SortOrder
    container_tara_processo_container?: SortOrderInput | SortOrder
    container_peso_bruto_processo_container?: SortOrderInput | SortOrder
    container_peso_liquido_processo_container?: SortOrderInput | SortOrder
    container_metragem_cubica_processo_container?: SortOrderInput | SortOrder
    local_devolucao_processo_container?: SortOrderInput | SortOrder
    data_devolucao_prevista_processo_container?: SortOrderInput | SortOrder
    data_devolucao_real_processo_container?: SortOrderInput | SortOrder
    data_criacao_container_processo?: SortOrder
    data_atualizacao_container_processo?: SortOrder
    _count?: ContainerProcessoCountOrderByAggregateInput
    _avg?: ContainerProcessoAvgOrderByAggregateInput
    _max?: ContainerProcessoMaxOrderByAggregateInput
    _min?: ContainerProcessoMinOrderByAggregateInput
    _sum?: ContainerProcessoSumOrderByAggregateInput
  }

  export type ContainerProcessoScalarWhereWithAggregatesInput = {
    AND?: ContainerProcessoScalarWhereWithAggregatesInput | ContainerProcessoScalarWhereWithAggregatesInput[]
    OR?: ContainerProcessoScalarWhereWithAggregatesInput[]
    NOT?: ContainerProcessoScalarWhereWithAggregatesInput | ContainerProcessoScalarWhereWithAggregatesInput[]
    id_processo_container?: StringWithAggregatesFilter<"ContainerProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"ContainerProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"ContainerProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"ContainerProcesso"> | string
    container_numero_processo_container?: StringWithAggregatesFilter<"ContainerProcesso"> | string
    container_tipo_processo_container?: StringNullableWithAggregatesFilter<"ContainerProcesso"> | string | null
    container_lacre_processo_container?: StringNullableWithAggregatesFilter<"ContainerProcesso"> | string | null
    container_tara_processo_container?: DecimalNullableWithAggregatesFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: DecimalNullableWithAggregatesFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: DecimalNullableWithAggregatesFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: DecimalNullableWithAggregatesFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: StringNullableWithAggregatesFilter<"ContainerProcesso"> | string | null
    data_devolucao_prevista_processo_container?: DateTimeNullableWithAggregatesFilter<"ContainerProcesso"> | Date | string | null
    data_devolucao_real_processo_container?: DateTimeNullableWithAggregatesFilter<"ContainerProcesso"> | Date | string | null
    data_criacao_container_processo?: DateTimeWithAggregatesFilter<"ContainerProcesso"> | Date | string
    data_atualizacao_container_processo?: DateTimeWithAggregatesFilter<"ContainerProcesso"> | Date | string
  }

  export type FollowUpProcessoWhereInput = {
    AND?: FollowUpProcessoWhereInput | FollowUpProcessoWhereInput[]
    OR?: FollowUpProcessoWhereInput[]
    NOT?: FollowUpProcessoWhereInput | FollowUpProcessoWhereInput[]
    id_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    id_organizacao?: StringFilter<"FollowUpProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_usuario?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_processo?: StringFilter<"FollowUpProcesso"> | string
    titulo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    descricao_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    tipo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    categoria_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    id_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    nome_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    data_criacao_follow_up_processo?: DateTimeFilter<"FollowUpProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type FollowUpProcessoOrderByWithRelationInput = {
    id_follow_up_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    titulo_follow_up_processo?: SortOrder
    descricao_follow_up_processo?: SortOrderInput | SortOrder
    tipo_follow_up_processo?: SortOrder
    categoria_follow_up_processo?: SortOrder
    id_usuario_registro_follow_up_processo?: SortOrderInput | SortOrder
    nome_usuario_registro_follow_up_processo?: SortOrderInput | SortOrder
    data_criacao_follow_up_processo?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
  }

  export type FollowUpProcessoWhereUniqueInput = Prisma.AtLeast<{
    id_follow_up_processo?: string
    AND?: FollowUpProcessoWhereInput | FollowUpProcessoWhereInput[]
    OR?: FollowUpProcessoWhereInput[]
    NOT?: FollowUpProcessoWhereInput | FollowUpProcessoWhereInput[]
    id_organizacao?: StringFilter<"FollowUpProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_usuario?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_processo?: StringFilter<"FollowUpProcesso"> | string
    titulo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    descricao_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    tipo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    categoria_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    id_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    nome_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    data_criacao_follow_up_processo?: DateTimeFilter<"FollowUpProcesso"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id_follow_up_processo">

  export type FollowUpProcessoOrderByWithAggregationInput = {
    id_follow_up_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrderInput | SortOrder
    id_usuario?: SortOrderInput | SortOrder
    id_processo?: SortOrder
    titulo_follow_up_processo?: SortOrder
    descricao_follow_up_processo?: SortOrderInput | SortOrder
    tipo_follow_up_processo?: SortOrder
    categoria_follow_up_processo?: SortOrder
    id_usuario_registro_follow_up_processo?: SortOrderInput | SortOrder
    nome_usuario_registro_follow_up_processo?: SortOrderInput | SortOrder
    data_criacao_follow_up_processo?: SortOrder
    _count?: FollowUpProcessoCountOrderByAggregateInput
    _max?: FollowUpProcessoMaxOrderByAggregateInput
    _min?: FollowUpProcessoMinOrderByAggregateInput
  }

  export type FollowUpProcessoScalarWhereWithAggregatesInput = {
    AND?: FollowUpProcessoScalarWhereWithAggregatesInput | FollowUpProcessoScalarWhereWithAggregatesInput[]
    OR?: FollowUpProcessoScalarWhereWithAggregatesInput[]
    NOT?: FollowUpProcessoScalarWhereWithAggregatesInput | FollowUpProcessoScalarWhereWithAggregatesInput[]
    id_follow_up_processo?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    id_organizacao?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    id_produto_gravity?: StringNullableWithAggregatesFilter<"FollowUpProcesso"> | string | null
    id_usuario?: StringNullableWithAggregatesFilter<"FollowUpProcesso"> | string | null
    id_processo?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    titulo_follow_up_processo?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    descricao_follow_up_processo?: StringNullableWithAggregatesFilter<"FollowUpProcesso"> | string | null
    tipo_follow_up_processo?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    categoria_follow_up_processo?: StringWithAggregatesFilter<"FollowUpProcesso"> | string
    id_usuario_registro_follow_up_processo?: StringNullableWithAggregatesFilter<"FollowUpProcesso"> | string | null
    nome_usuario_registro_follow_up_processo?: StringNullableWithAggregatesFilter<"FollowUpProcesso"> | string | null
    data_criacao_follow_up_processo?: DateTimeWithAggregatesFilter<"FollowUpProcesso"> | Date | string
  }

  export type ProcessoCreateInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUpdateInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateManyInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
  }

  export type ProcessoUpdateManyMutationInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoUncheckedUpdateManyInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoStatusCreateInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoCreateNestedManyWithoutStatus_atualInput
    historico_anterior?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_anteriorInput
    historico_novo?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusUncheckedCreateInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoUncheckedCreateNestedManyWithoutStatus_atualInput
    historico_anterior?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_anteriorInput
    historico_novo?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusUpdateInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUpdateManyWithoutStatus_atualNestedInput
    historico_anterior?: HistoricoStatusProcessoUpdateManyWithoutStatus_anteriorNestedInput
    historico_novo?: HistoricoStatusProcessoUpdateManyWithoutStatus_novoNestedInput
  }

  export type ProcessoStatusUncheckedUpdateInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUncheckedUpdateManyWithoutStatus_atualNestedInput
    historico_anterior?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorNestedInput
    historico_novo?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoNestedInput
  }

  export type ProcessoStatusCreateManyInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
  }

  export type ProcessoStatusUpdateManyMutationInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoStatusUncheckedUpdateManyInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistoricoStatusProcessoCreateInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
    processo: ProcessoCreateNestedOneWithoutHistorico_statusInput
    status_anterior?: ProcessoStatusCreateNestedOneWithoutHistorico_anteriorInput
    status_novo: ProcessoStatusCreateNestedOneWithoutHistorico_novoInput
  }

  export type HistoricoStatusProcessoUncheckedCreateInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_anterior_processo?: string | null
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoUpdateInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoUpdateOneRequiredWithoutHistorico_statusNestedInput
    status_anterior?: ProcessoStatusUpdateOneWithoutHistorico_anteriorNestedInput
    status_novo?: ProcessoStatusUpdateOneRequiredWithoutHistorico_novoNestedInput
  }

  export type HistoricoStatusProcessoUncheckedUpdateInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoCreateManyInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_anterior_processo?: string | null
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoUpdateManyMutationInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LogisticaInternacionalProcessoCreateInput = {
    id_logistica_internacional_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    modal_frete_internacional_processo?: string | null
    tipo_frete_internacional_processo?: string | null
    tipo_volume_processo?: string | null
    incoterm_processo?: string | null
    porto_origem_processo?: string | null
    porto_destino_processo?: string | null
    porto_transbordo_processo?: string | null
    aeroporto_origem_processo?: string | null
    aeroporto_destino_processo?: string | null
    aeroporto_escala_processo?: string | null
    id_agente_carga?: string | null
    id_armador?: string | null
    id_cia_aerea?: string | null
    id_transportador_rodo_internacional?: string | null
    id_transportador_rodo_nacional?: string | null
    id_transportador_ferroviario?: string | null
    id_despachante?: string | null
    id_armazem_alfandegado?: string | null
    id_seguradora_internacional?: string | null
    data_criacao_logistica_internacional_processo?: Date | string
    data_atualizacao_logistica_internacional_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutLogisticaInput
  }

  export type LogisticaInternacionalProcessoUncheckedCreateInput = {
    id_logistica_internacional_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    modal_frete_internacional_processo?: string | null
    tipo_frete_internacional_processo?: string | null
    tipo_volume_processo?: string | null
    incoterm_processo?: string | null
    porto_origem_processo?: string | null
    porto_destino_processo?: string | null
    porto_transbordo_processo?: string | null
    aeroporto_origem_processo?: string | null
    aeroporto_destino_processo?: string | null
    aeroporto_escala_processo?: string | null
    id_agente_carga?: string | null
    id_armador?: string | null
    id_cia_aerea?: string | null
    id_transportador_rodo_internacional?: string | null
    id_transportador_rodo_nacional?: string | null
    id_transportador_ferroviario?: string | null
    id_despachante?: string | null
    id_armazem_alfandegado?: string | null
    id_seguradora_internacional?: string | null
    data_criacao_logistica_internacional_processo?: Date | string
    data_atualizacao_logistica_internacional_processo?: Date | string
  }

  export type LogisticaInternacionalProcessoUpdateInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutLogisticaNestedInput
  }

  export type LogisticaInternacionalProcessoUncheckedUpdateInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogisticaInternacionalProcessoCreateManyInput = {
    id_logistica_internacional_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    modal_frete_internacional_processo?: string | null
    tipo_frete_internacional_processo?: string | null
    tipo_volume_processo?: string | null
    incoterm_processo?: string | null
    porto_origem_processo?: string | null
    porto_destino_processo?: string | null
    porto_transbordo_processo?: string | null
    aeroporto_origem_processo?: string | null
    aeroporto_destino_processo?: string | null
    aeroporto_escala_processo?: string | null
    id_agente_carga?: string | null
    id_armador?: string | null
    id_cia_aerea?: string | null
    id_transportador_rodo_internacional?: string | null
    id_transportador_rodo_nacional?: string | null
    id_transportador_ferroviario?: string | null
    id_despachante?: string | null
    id_armazem_alfandegado?: string | null
    id_seguradora_internacional?: string | null
    data_criacao_logistica_internacional_processo?: Date | string
    data_atualizacao_logistica_internacional_processo?: Date | string
  }

  export type LogisticaInternacionalProcessoUpdateManyMutationInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogisticaInternacionalProcessoUncheckedUpdateManyInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DadosProcessoCreateInput = {
    id_dados_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    canal_parametrizacao_processo?: string | null
    numero_duimp_processo?: string | null
    numero_nfe_processo?: string | null
    chave_acesso_nfe_processo?: string | null
    data_registro_duimp_processo?: Date | string | null
    data_liberacao_duimp_processo?: Date | string | null
    data_consulta_liberacao_duimp_processo?: Date | string | null
    data_previsao_registro_duimp_processo?: Date | string | null
    data_previsao_liberacao_duimp_processo?: Date | string | null
    data_registro_lpco_processo?: Date | string | null
    data_deferimento_lpco_processo?: Date | string | null
    data_indeferimento_lpco_processo?: Date | string | null
    data_pendencia_lpco_processo?: Date | string | null
    data_consulta_liberacao_lpco_processo?: Date | string | null
    data_previsao_registro_lpco_processo?: Date | string | null
    data_criacao_dados_processo?: Date | string
    data_atualizacao_dados_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutDadosInput
  }

  export type DadosProcessoUncheckedCreateInput = {
    id_dados_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    canal_parametrizacao_processo?: string | null
    numero_duimp_processo?: string | null
    numero_nfe_processo?: string | null
    chave_acesso_nfe_processo?: string | null
    data_registro_duimp_processo?: Date | string | null
    data_liberacao_duimp_processo?: Date | string | null
    data_consulta_liberacao_duimp_processo?: Date | string | null
    data_previsao_registro_duimp_processo?: Date | string | null
    data_previsao_liberacao_duimp_processo?: Date | string | null
    data_registro_lpco_processo?: Date | string | null
    data_deferimento_lpco_processo?: Date | string | null
    data_indeferimento_lpco_processo?: Date | string | null
    data_pendencia_lpco_processo?: Date | string | null
    data_consulta_liberacao_lpco_processo?: Date | string | null
    data_previsao_registro_lpco_processo?: Date | string | null
    data_criacao_dados_processo?: Date | string
    data_atualizacao_dados_processo?: Date | string
  }

  export type DadosProcessoUpdateInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutDadosNestedInput
  }

  export type DadosProcessoUncheckedUpdateInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DadosProcessoCreateManyInput = {
    id_dados_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    canal_parametrizacao_processo?: string | null
    numero_duimp_processo?: string | null
    numero_nfe_processo?: string | null
    chave_acesso_nfe_processo?: string | null
    data_registro_duimp_processo?: Date | string | null
    data_liberacao_duimp_processo?: Date | string | null
    data_consulta_liberacao_duimp_processo?: Date | string | null
    data_previsao_registro_duimp_processo?: Date | string | null
    data_previsao_liberacao_duimp_processo?: Date | string | null
    data_registro_lpco_processo?: Date | string | null
    data_deferimento_lpco_processo?: Date | string | null
    data_indeferimento_lpco_processo?: Date | string | null
    data_pendencia_lpco_processo?: Date | string | null
    data_consulta_liberacao_lpco_processo?: Date | string | null
    data_previsao_registro_lpco_processo?: Date | string | null
    data_criacao_dados_processo?: Date | string
    data_atualizacao_dados_processo?: Date | string
  }

  export type DadosProcessoUpdateManyMutationInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DadosProcessoUncheckedUpdateManyInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CambioProcessoCreateInput = {
    id_cambio_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_banco_processo?: string | null
    id_corretora_cambio_processo?: string | null
    data_criacao_cambio_processo?: Date | string
    data_atualizacao_cambio_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutCambioInput
  }

  export type CambioProcessoUncheckedCreateInput = {
    id_cambio_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_banco_processo?: string | null
    id_corretora_cambio_processo?: string | null
    data_criacao_cambio_processo?: Date | string
    data_atualizacao_cambio_processo?: Date | string
  }

  export type CambioProcessoUpdateInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutCambioNestedInput
  }

  export type CambioProcessoUncheckedUpdateInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CambioProcessoCreateManyInput = {
    id_cambio_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_banco_processo?: string | null
    id_corretora_cambio_processo?: string | null
    data_criacao_cambio_processo?: Date | string
    data_atualizacao_cambio_processo?: Date | string
  }

  export type CambioProcessoUpdateManyMutationInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CambioProcessoUncheckedUpdateManyInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimativaProcessoCreateInput = {
    id_estimativa_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    total_imposto_ii_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: string
    data_criacao_estimativa_processo?: Date | string
    data_atualizacao_estimativa_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutEstimativaInput
  }

  export type EstimativaProcessoUncheckedCreateInput = {
    id_estimativa_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    total_imposto_ii_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: string
    data_criacao_estimativa_processo?: Date | string
    data_atualizacao_estimativa_processo?: Date | string
  }

  export type EstimativaProcessoUpdateInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutEstimativaNestedInput
  }

  export type EstimativaProcessoUncheckedUpdateInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimativaProcessoCreateManyInput = {
    id_estimativa_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    total_imposto_ii_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: string
    data_criacao_estimativa_processo?: Date | string
    data_atualizacao_estimativa_processo?: Date | string
  }

  export type EstimativaProcessoUpdateManyMutationInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimativaProcessoUncheckedUpdateManyInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoCreateInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutDocumentosInput
  }

  export type DocumentoProcessoUncheckedCreateInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    id_processo: string
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
  }

  export type DocumentoProcessoUpdateInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutDocumentosNestedInput
  }

  export type DocumentoProcessoUncheckedUpdateInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoCreateManyInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    id_processo: string
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
  }

  export type DocumentoProcessoUpdateManyMutationInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoUncheckedUpdateManyInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoCreateInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutContainersInput
  }

  export type ContainerProcessoUncheckedCreateInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
  }

  export type ContainerProcessoUpdateInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutContainersNestedInput
  }

  export type ContainerProcessoUncheckedUpdateInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoCreateManyInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
  }

  export type ContainerProcessoUpdateManyMutationInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoUncheckedUpdateManyInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoCreateInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
    processo: ProcessoCreateNestedOneWithoutFollow_upsInput
  }

  export type FollowUpProcessoUncheckedCreateInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    id_processo: string
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
  }

  export type FollowUpProcessoUpdateInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneRequiredWithoutFollow_upsNestedInput
  }

  export type FollowUpProcessoUncheckedUpdateInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoCreateManyInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    id_processo: string
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
  }

  export type FollowUpProcessoUpdateManyMutationInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoUncheckedUpdateManyInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type ProcessoStatusNullableRelationFilter = {
    is?: ProcessoStatusWhereInput | null
    isNot?: ProcessoStatusWhereInput | null
  }

  export type HistoricoStatusProcessoListRelationFilter = {
    every?: HistoricoStatusProcessoWhereInput
    some?: HistoricoStatusProcessoWhereInput
    none?: HistoricoStatusProcessoWhereInput
  }

  export type LogisticaInternacionalProcessoNullableRelationFilter = {
    is?: LogisticaInternacionalProcessoWhereInput | null
    isNot?: LogisticaInternacionalProcessoWhereInput | null
  }

  export type DadosProcessoNullableRelationFilter = {
    is?: DadosProcessoWhereInput | null
    isNot?: DadosProcessoWhereInput | null
  }

  export type CambioProcessoNullableRelationFilter = {
    is?: CambioProcessoWhereInput | null
    isNot?: CambioProcessoWhereInput | null
  }

  export type EstimativaProcessoNullableRelationFilter = {
    is?: EstimativaProcessoWhereInput | null
    isNot?: EstimativaProcessoWhereInput | null
  }

  export type ContainerProcessoListRelationFilter = {
    every?: ContainerProcessoWhereInput
    some?: ContainerProcessoWhereInput
    none?: ContainerProcessoWhereInput
  }

  export type DocumentoProcessoListRelationFilter = {
    every?: DocumentoProcessoWhereInput
    some?: DocumentoProcessoWhereInput
    none?: DocumentoProcessoWhereInput
  }

  export type FollowUpProcessoListRelationFilter = {
    every?: FollowUpProcessoWhereInput
    some?: FollowUpProcessoWhereInput
    none?: FollowUpProcessoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type HistoricoStatusProcessoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ContainerProcessoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentoProcessoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FollowUpProcessoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoCountOrderByAggregateInput = {
    id_processo?: SortOrder
    id_organizacao?: SortOrder
    id_workspace?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    numero_processo?: SortOrder
    tipo_operacao_processo?: SortOrder
    referencia_interna_processo?: SortOrder
    referencia_importador_processo?: SortOrder
    referencia_exportador_processo?: SortOrder
    id_status_atual_processo?: SortOrder
    id_importacao_exportador_processo?: SortOrder
    id_exportacao_importador_processo?: SortOrder
    id_cotacao_bid_frete_internacional?: SortOrder
    id_proposta_bid_frete_internacional?: SortOrder
    id_transito_processo?: SortOrder
    id_operacao_cambio_processo?: SortOrder
    id_responsavel_processo?: SortOrder
    responsavel_rotina_processo?: SortOrder
    setor_responsavel_processo?: SortOrder
    vendedor_responsavel_processo?: SortOrder
    data_criacao_processo?: SortOrder
    data_atualizacao_processo?: SortOrder
  }

  export type ProcessoMaxOrderByAggregateInput = {
    id_processo?: SortOrder
    id_organizacao?: SortOrder
    id_workspace?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    numero_processo?: SortOrder
    tipo_operacao_processo?: SortOrder
    referencia_interna_processo?: SortOrder
    referencia_importador_processo?: SortOrder
    referencia_exportador_processo?: SortOrder
    id_status_atual_processo?: SortOrder
    id_importacao_exportador_processo?: SortOrder
    id_exportacao_importador_processo?: SortOrder
    id_cotacao_bid_frete_internacional?: SortOrder
    id_proposta_bid_frete_internacional?: SortOrder
    id_transito_processo?: SortOrder
    id_operacao_cambio_processo?: SortOrder
    id_responsavel_processo?: SortOrder
    responsavel_rotina_processo?: SortOrder
    setor_responsavel_processo?: SortOrder
    vendedor_responsavel_processo?: SortOrder
    data_criacao_processo?: SortOrder
    data_atualizacao_processo?: SortOrder
  }

  export type ProcessoMinOrderByAggregateInput = {
    id_processo?: SortOrder
    id_organizacao?: SortOrder
    id_workspace?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    numero_processo?: SortOrder
    tipo_operacao_processo?: SortOrder
    referencia_interna_processo?: SortOrder
    referencia_importador_processo?: SortOrder
    referencia_exportador_processo?: SortOrder
    id_status_atual_processo?: SortOrder
    id_importacao_exportador_processo?: SortOrder
    id_exportacao_importador_processo?: SortOrder
    id_cotacao_bid_frete_internacional?: SortOrder
    id_proposta_bid_frete_internacional?: SortOrder
    id_transito_processo?: SortOrder
    id_operacao_cambio_processo?: SortOrder
    id_responsavel_processo?: SortOrder
    responsavel_rotina_processo?: SortOrder
    setor_responsavel_processo?: SortOrder
    vendedor_responsavel_processo?: SortOrder
    data_criacao_processo?: SortOrder
    data_atualizacao_processo?: SortOrder
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
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProcessoListRelationFilter = {
    every?: ProcessoWhereInput
    some?: ProcessoWhereInput
    none?: ProcessoWhereInput
  }

  export type ProcessoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoStatusId_organizacaoTipo_status_processoCompoundUniqueInput = {
    id_organizacao: string
    tipo_status_processo: string
  }

  export type ProcessoStatusCountOrderByAggregateInput = {
    id_processo_status?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    tipo_status_processo?: SortOrder
    rotulo_status_processo?: SortOrder
    cor_status_processo?: SortOrder
    ordem_status_processo?: SortOrder
    regras_status_processo?: SortOrder
    eh_padrao_status_processo?: SortOrder
    eh_sistema_status_processo?: SortOrder
    data_criacao_processo_status?: SortOrder
    data_atualizacao_processo_status?: SortOrder
  }

  export type ProcessoStatusAvgOrderByAggregateInput = {
    ordem_status_processo?: SortOrder
  }

  export type ProcessoStatusMaxOrderByAggregateInput = {
    id_processo_status?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    tipo_status_processo?: SortOrder
    rotulo_status_processo?: SortOrder
    cor_status_processo?: SortOrder
    ordem_status_processo?: SortOrder
    eh_padrao_status_processo?: SortOrder
    eh_sistema_status_processo?: SortOrder
    data_criacao_processo_status?: SortOrder
    data_atualizacao_processo_status?: SortOrder
  }

  export type ProcessoStatusMinOrderByAggregateInput = {
    id_processo_status?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    tipo_status_processo?: SortOrder
    rotulo_status_processo?: SortOrder
    cor_status_processo?: SortOrder
    ordem_status_processo?: SortOrder
    eh_padrao_status_processo?: SortOrder
    eh_sistema_status_processo?: SortOrder
    data_criacao_processo_status?: SortOrder
    data_atualizacao_processo_status?: SortOrder
  }

  export type ProcessoStatusSumOrderByAggregateInput = {
    ordem_status_processo?: SortOrder
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
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProcessoRelationFilter = {
    is?: ProcessoWhereInput
    isNot?: ProcessoWhereInput
  }

  export type ProcessoStatusRelationFilter = {
    is?: ProcessoStatusWhereInput
    isNot?: ProcessoStatusWhereInput
  }

  export type HistoricoStatusProcessoCountOrderByAggregateInput = {
    id_historico_status_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_status_anterior_processo?: SortOrder
    id_status_novo_processo?: SortOrder
    id_usuario_mudanca_status_processo?: SortOrder
    data_mudanca_status_processo?: SortOrder
    observacao_mudanca_status_processo?: SortOrder
  }

  export type HistoricoStatusProcessoMaxOrderByAggregateInput = {
    id_historico_status_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_status_anterior_processo?: SortOrder
    id_status_novo_processo?: SortOrder
    id_usuario_mudanca_status_processo?: SortOrder
    data_mudanca_status_processo?: SortOrder
    observacao_mudanca_status_processo?: SortOrder
  }

  export type HistoricoStatusProcessoMinOrderByAggregateInput = {
    id_historico_status_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_status_anterior_processo?: SortOrder
    id_status_novo_processo?: SortOrder
    id_usuario_mudanca_status_processo?: SortOrder
    data_mudanca_status_processo?: SortOrder
    observacao_mudanca_status_processo?: SortOrder
  }

  export type LogisticaInternacionalProcessoCountOrderByAggregateInput = {
    id_logistica_internacional_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    modal_frete_internacional_processo?: SortOrder
    tipo_frete_internacional_processo?: SortOrder
    tipo_volume_processo?: SortOrder
    incoterm_processo?: SortOrder
    porto_origem_processo?: SortOrder
    porto_destino_processo?: SortOrder
    porto_transbordo_processo?: SortOrder
    aeroporto_origem_processo?: SortOrder
    aeroporto_destino_processo?: SortOrder
    aeroporto_escala_processo?: SortOrder
    id_agente_carga?: SortOrder
    id_armador?: SortOrder
    id_cia_aerea?: SortOrder
    id_transportador_rodo_internacional?: SortOrder
    id_transportador_rodo_nacional?: SortOrder
    id_transportador_ferroviario?: SortOrder
    id_despachante?: SortOrder
    id_armazem_alfandegado?: SortOrder
    id_seguradora_internacional?: SortOrder
    data_criacao_logistica_internacional_processo?: SortOrder
    data_atualizacao_logistica_internacional_processo?: SortOrder
  }

  export type LogisticaInternacionalProcessoMaxOrderByAggregateInput = {
    id_logistica_internacional_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    modal_frete_internacional_processo?: SortOrder
    tipo_frete_internacional_processo?: SortOrder
    tipo_volume_processo?: SortOrder
    incoterm_processo?: SortOrder
    porto_origem_processo?: SortOrder
    porto_destino_processo?: SortOrder
    porto_transbordo_processo?: SortOrder
    aeroporto_origem_processo?: SortOrder
    aeroporto_destino_processo?: SortOrder
    aeroporto_escala_processo?: SortOrder
    id_agente_carga?: SortOrder
    id_armador?: SortOrder
    id_cia_aerea?: SortOrder
    id_transportador_rodo_internacional?: SortOrder
    id_transportador_rodo_nacional?: SortOrder
    id_transportador_ferroviario?: SortOrder
    id_despachante?: SortOrder
    id_armazem_alfandegado?: SortOrder
    id_seguradora_internacional?: SortOrder
    data_criacao_logistica_internacional_processo?: SortOrder
    data_atualizacao_logistica_internacional_processo?: SortOrder
  }

  export type LogisticaInternacionalProcessoMinOrderByAggregateInput = {
    id_logistica_internacional_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    modal_frete_internacional_processo?: SortOrder
    tipo_frete_internacional_processo?: SortOrder
    tipo_volume_processo?: SortOrder
    incoterm_processo?: SortOrder
    porto_origem_processo?: SortOrder
    porto_destino_processo?: SortOrder
    porto_transbordo_processo?: SortOrder
    aeroporto_origem_processo?: SortOrder
    aeroporto_destino_processo?: SortOrder
    aeroporto_escala_processo?: SortOrder
    id_agente_carga?: SortOrder
    id_armador?: SortOrder
    id_cia_aerea?: SortOrder
    id_transportador_rodo_internacional?: SortOrder
    id_transportador_rodo_nacional?: SortOrder
    id_transportador_ferroviario?: SortOrder
    id_despachante?: SortOrder
    id_armazem_alfandegado?: SortOrder
    id_seguradora_internacional?: SortOrder
    data_criacao_logistica_internacional_processo?: SortOrder
    data_atualizacao_logistica_internacional_processo?: SortOrder
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

  export type DadosProcessoCountOrderByAggregateInput = {
    id_dados_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    canal_parametrizacao_processo?: SortOrder
    numero_duimp_processo?: SortOrder
    numero_nfe_processo?: SortOrder
    chave_acesso_nfe_processo?: SortOrder
    data_registro_duimp_processo?: SortOrder
    data_liberacao_duimp_processo?: SortOrder
    data_consulta_liberacao_duimp_processo?: SortOrder
    data_previsao_registro_duimp_processo?: SortOrder
    data_previsao_liberacao_duimp_processo?: SortOrder
    data_registro_lpco_processo?: SortOrder
    data_deferimento_lpco_processo?: SortOrder
    data_indeferimento_lpco_processo?: SortOrder
    data_pendencia_lpco_processo?: SortOrder
    data_consulta_liberacao_lpco_processo?: SortOrder
    data_previsao_registro_lpco_processo?: SortOrder
    data_criacao_dados_processo?: SortOrder
    data_atualizacao_dados_processo?: SortOrder
  }

  export type DadosProcessoMaxOrderByAggregateInput = {
    id_dados_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    canal_parametrizacao_processo?: SortOrder
    numero_duimp_processo?: SortOrder
    numero_nfe_processo?: SortOrder
    chave_acesso_nfe_processo?: SortOrder
    data_registro_duimp_processo?: SortOrder
    data_liberacao_duimp_processo?: SortOrder
    data_consulta_liberacao_duimp_processo?: SortOrder
    data_previsao_registro_duimp_processo?: SortOrder
    data_previsao_liberacao_duimp_processo?: SortOrder
    data_registro_lpco_processo?: SortOrder
    data_deferimento_lpco_processo?: SortOrder
    data_indeferimento_lpco_processo?: SortOrder
    data_pendencia_lpco_processo?: SortOrder
    data_consulta_liberacao_lpco_processo?: SortOrder
    data_previsao_registro_lpco_processo?: SortOrder
    data_criacao_dados_processo?: SortOrder
    data_atualizacao_dados_processo?: SortOrder
  }

  export type DadosProcessoMinOrderByAggregateInput = {
    id_dados_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    canal_parametrizacao_processo?: SortOrder
    numero_duimp_processo?: SortOrder
    numero_nfe_processo?: SortOrder
    chave_acesso_nfe_processo?: SortOrder
    data_registro_duimp_processo?: SortOrder
    data_liberacao_duimp_processo?: SortOrder
    data_consulta_liberacao_duimp_processo?: SortOrder
    data_previsao_registro_duimp_processo?: SortOrder
    data_previsao_liberacao_duimp_processo?: SortOrder
    data_registro_lpco_processo?: SortOrder
    data_deferimento_lpco_processo?: SortOrder
    data_indeferimento_lpco_processo?: SortOrder
    data_pendencia_lpco_processo?: SortOrder
    data_consulta_liberacao_lpco_processo?: SortOrder
    data_previsao_registro_lpco_processo?: SortOrder
    data_criacao_dados_processo?: SortOrder
    data_atualizacao_dados_processo?: SortOrder
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

  export type CambioProcessoCountOrderByAggregateInput = {
    id_cambio_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_banco_processo?: SortOrder
    id_corretora_cambio_processo?: SortOrder
    data_criacao_cambio_processo?: SortOrder
    data_atualizacao_cambio_processo?: SortOrder
  }

  export type CambioProcessoMaxOrderByAggregateInput = {
    id_cambio_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_banco_processo?: SortOrder
    id_corretora_cambio_processo?: SortOrder
    data_criacao_cambio_processo?: SortOrder
    data_atualizacao_cambio_processo?: SortOrder
  }

  export type CambioProcessoMinOrderByAggregateInput = {
    id_cambio_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    id_banco_processo?: SortOrder
    id_corretora_cambio_processo?: SortOrder
    data_criacao_cambio_processo?: SortOrder
    data_atualizacao_cambio_processo?: SortOrder
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type EstimativaProcessoCountOrderByAggregateInput = {
    id_estimativa_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    total_imposto_ii_processo?: SortOrder
    total_imposto_ipi_processo?: SortOrder
    total_imposto_pis_processo?: SortOrder
    total_imposto_cofins_processo?: SortOrder
    total_imposto_icms_processo?: SortOrder
    valor_frete_estimado_processo?: SortOrder
    valor_despacho_estimado_processo?: SortOrder
    valor_outros_estimado_processo?: SortOrder
    valor_total_estimado_processo?: SortOrder
    moeda_estimativa_processo?: SortOrder
    data_criacao_estimativa_processo?: SortOrder
    data_atualizacao_estimativa_processo?: SortOrder
  }

  export type EstimativaProcessoAvgOrderByAggregateInput = {
    total_imposto_ii_processo?: SortOrder
    total_imposto_ipi_processo?: SortOrder
    total_imposto_pis_processo?: SortOrder
    total_imposto_cofins_processo?: SortOrder
    total_imposto_icms_processo?: SortOrder
    valor_frete_estimado_processo?: SortOrder
    valor_despacho_estimado_processo?: SortOrder
    valor_outros_estimado_processo?: SortOrder
    valor_total_estimado_processo?: SortOrder
  }

  export type EstimativaProcessoMaxOrderByAggregateInput = {
    id_estimativa_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    total_imposto_ii_processo?: SortOrder
    total_imposto_ipi_processo?: SortOrder
    total_imposto_pis_processo?: SortOrder
    total_imposto_cofins_processo?: SortOrder
    total_imposto_icms_processo?: SortOrder
    valor_frete_estimado_processo?: SortOrder
    valor_despacho_estimado_processo?: SortOrder
    valor_outros_estimado_processo?: SortOrder
    valor_total_estimado_processo?: SortOrder
    moeda_estimativa_processo?: SortOrder
    data_criacao_estimativa_processo?: SortOrder
    data_atualizacao_estimativa_processo?: SortOrder
  }

  export type EstimativaProcessoMinOrderByAggregateInput = {
    id_estimativa_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    total_imposto_ii_processo?: SortOrder
    total_imposto_ipi_processo?: SortOrder
    total_imposto_pis_processo?: SortOrder
    total_imposto_cofins_processo?: SortOrder
    total_imposto_icms_processo?: SortOrder
    valor_frete_estimado_processo?: SortOrder
    valor_despacho_estimado_processo?: SortOrder
    valor_outros_estimado_processo?: SortOrder
    valor_total_estimado_processo?: SortOrder
    moeda_estimativa_processo?: SortOrder
    data_criacao_estimativa_processo?: SortOrder
    data_atualizacao_estimativa_processo?: SortOrder
  }

  export type EstimativaProcessoSumOrderByAggregateInput = {
    total_imposto_ii_processo?: SortOrder
    total_imposto_ipi_processo?: SortOrder
    total_imposto_pis_processo?: SortOrder
    total_imposto_cofins_processo?: SortOrder
    total_imposto_icms_processo?: SortOrder
    valor_frete_estimado_processo?: SortOrder
    valor_despacho_estimado_processo?: SortOrder
    valor_outros_estimado_processo?: SortOrder
    valor_total_estimado_processo?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type DocumentoProcessoCountOrderByAggregateInput = {
    id_documento_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    nome_documento_processo?: SortOrder
    tipo_arquivo_documento_processo?: SortOrder
    tamanho_bytes_documento_processo?: SortOrder
    url_documento_processo?: SortOrder
    categoria_documento_processo?: SortOrder
    numero_bl_processo?: SortOrder
    numero_hawb_processo?: SortOrder
    numero_mawb_processo?: SortOrder
    numero_awb_processo?: SortOrder
    numero_hbl_processo?: SortOrder
    numero_mbl_processo?: SortOrder
    numero_ce_mercante_processo?: SortOrder
    numero_certificado_origem_processo?: SortOrder
    numero_cim_processo?: SortOrder
    numero_crt_processo?: SortOrder
    numero_presenca_carga_destino_processo?: SortOrder
    data_criacao_documento_processo?: SortOrder
  }

  export type DocumentoProcessoAvgOrderByAggregateInput = {
    tamanho_bytes_documento_processo?: SortOrder
  }

  export type DocumentoProcessoMaxOrderByAggregateInput = {
    id_documento_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    nome_documento_processo?: SortOrder
    tipo_arquivo_documento_processo?: SortOrder
    tamanho_bytes_documento_processo?: SortOrder
    url_documento_processo?: SortOrder
    categoria_documento_processo?: SortOrder
    numero_bl_processo?: SortOrder
    numero_hawb_processo?: SortOrder
    numero_mawb_processo?: SortOrder
    numero_awb_processo?: SortOrder
    numero_hbl_processo?: SortOrder
    numero_mbl_processo?: SortOrder
    numero_ce_mercante_processo?: SortOrder
    numero_certificado_origem_processo?: SortOrder
    numero_cim_processo?: SortOrder
    numero_crt_processo?: SortOrder
    numero_presenca_carga_destino_processo?: SortOrder
    data_criacao_documento_processo?: SortOrder
  }

  export type DocumentoProcessoMinOrderByAggregateInput = {
    id_documento_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    nome_documento_processo?: SortOrder
    tipo_arquivo_documento_processo?: SortOrder
    tamanho_bytes_documento_processo?: SortOrder
    url_documento_processo?: SortOrder
    categoria_documento_processo?: SortOrder
    numero_bl_processo?: SortOrder
    numero_hawb_processo?: SortOrder
    numero_mawb_processo?: SortOrder
    numero_awb_processo?: SortOrder
    numero_hbl_processo?: SortOrder
    numero_mbl_processo?: SortOrder
    numero_ce_mercante_processo?: SortOrder
    numero_certificado_origem_processo?: SortOrder
    numero_cim_processo?: SortOrder
    numero_crt_processo?: SortOrder
    numero_presenca_carga_destino_processo?: SortOrder
    data_criacao_documento_processo?: SortOrder
  }

  export type DocumentoProcessoSumOrderByAggregateInput = {
    tamanho_bytes_documento_processo?: SortOrder
  }

  export type ContainerProcessoCountOrderByAggregateInput = {
    id_processo_container?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    container_numero_processo_container?: SortOrder
    container_tipo_processo_container?: SortOrder
    container_lacre_processo_container?: SortOrder
    container_tara_processo_container?: SortOrder
    container_peso_bruto_processo_container?: SortOrder
    container_peso_liquido_processo_container?: SortOrder
    container_metragem_cubica_processo_container?: SortOrder
    local_devolucao_processo_container?: SortOrder
    data_devolucao_prevista_processo_container?: SortOrder
    data_devolucao_real_processo_container?: SortOrder
    data_criacao_container_processo?: SortOrder
    data_atualizacao_container_processo?: SortOrder
  }

  export type ContainerProcessoAvgOrderByAggregateInput = {
    container_tara_processo_container?: SortOrder
    container_peso_bruto_processo_container?: SortOrder
    container_peso_liquido_processo_container?: SortOrder
    container_metragem_cubica_processo_container?: SortOrder
  }

  export type ContainerProcessoMaxOrderByAggregateInput = {
    id_processo_container?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    container_numero_processo_container?: SortOrder
    container_tipo_processo_container?: SortOrder
    container_lacre_processo_container?: SortOrder
    container_tara_processo_container?: SortOrder
    container_peso_bruto_processo_container?: SortOrder
    container_peso_liquido_processo_container?: SortOrder
    container_metragem_cubica_processo_container?: SortOrder
    local_devolucao_processo_container?: SortOrder
    data_devolucao_prevista_processo_container?: SortOrder
    data_devolucao_real_processo_container?: SortOrder
    data_criacao_container_processo?: SortOrder
    data_atualizacao_container_processo?: SortOrder
  }

  export type ContainerProcessoMinOrderByAggregateInput = {
    id_processo_container?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_processo?: SortOrder
    container_numero_processo_container?: SortOrder
    container_tipo_processo_container?: SortOrder
    container_lacre_processo_container?: SortOrder
    container_tara_processo_container?: SortOrder
    container_peso_bruto_processo_container?: SortOrder
    container_peso_liquido_processo_container?: SortOrder
    container_metragem_cubica_processo_container?: SortOrder
    local_devolucao_processo_container?: SortOrder
    data_devolucao_prevista_processo_container?: SortOrder
    data_devolucao_real_processo_container?: SortOrder
    data_criacao_container_processo?: SortOrder
    data_atualizacao_container_processo?: SortOrder
  }

  export type ContainerProcessoSumOrderByAggregateInput = {
    container_tara_processo_container?: SortOrder
    container_peso_bruto_processo_container?: SortOrder
    container_peso_liquido_processo_container?: SortOrder
    container_metragem_cubica_processo_container?: SortOrder
  }

  export type FollowUpProcessoCountOrderByAggregateInput = {
    id_follow_up_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    titulo_follow_up_processo?: SortOrder
    descricao_follow_up_processo?: SortOrder
    tipo_follow_up_processo?: SortOrder
    categoria_follow_up_processo?: SortOrder
    id_usuario_registro_follow_up_processo?: SortOrder
    nome_usuario_registro_follow_up_processo?: SortOrder
    data_criacao_follow_up_processo?: SortOrder
  }

  export type FollowUpProcessoMaxOrderByAggregateInput = {
    id_follow_up_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    titulo_follow_up_processo?: SortOrder
    descricao_follow_up_processo?: SortOrder
    tipo_follow_up_processo?: SortOrder
    categoria_follow_up_processo?: SortOrder
    id_usuario_registro_follow_up_processo?: SortOrder
    nome_usuario_registro_follow_up_processo?: SortOrder
    data_criacao_follow_up_processo?: SortOrder
  }

  export type FollowUpProcessoMinOrderByAggregateInput = {
    id_follow_up_processo?: SortOrder
    id_organizacao?: SortOrder
    id_produto_gravity?: SortOrder
    id_usuario?: SortOrder
    id_processo?: SortOrder
    titulo_follow_up_processo?: SortOrder
    descricao_follow_up_processo?: SortOrder
    tipo_follow_up_processo?: SortOrder
    categoria_follow_up_processo?: SortOrder
    id_usuario_registro_follow_up_processo?: SortOrder
    nome_usuario_registro_follow_up_processo?: SortOrder
    data_criacao_follow_up_processo?: SortOrder
  }

  export type ProcessoStatusCreateNestedOneWithoutProcessosInput = {
    create?: XOR<ProcessoStatusCreateWithoutProcessosInput, ProcessoStatusUncheckedCreateWithoutProcessosInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutProcessosInput
    connect?: ProcessoStatusWhereUniqueInput
  }

  export type HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput> | HistoricoStatusProcessoCreateWithoutProcessoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput | HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: HistoricoStatusProcessoCreateManyProcessoInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: LogisticaInternacionalProcessoCreateOrConnectWithoutProcessoInput
    connect?: LogisticaInternacionalProcessoWhereUniqueInput
  }

  export type DadosProcessoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosProcessoCreateOrConnectWithoutProcessoInput
    connect?: DadosProcessoWhereUniqueInput
  }

  export type CambioProcessoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: CambioProcessoCreateOrConnectWithoutProcessoInput
    connect?: CambioProcessoWhereUniqueInput
  }

  export type EstimativaProcessoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaProcessoCreateOrConnectWithoutProcessoInput
    connect?: EstimativaProcessoWhereUniqueInput
  }

  export type ContainerProcessoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput> | ContainerProcessoCreateWithoutProcessoInput[] | ContainerProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ContainerProcessoCreateOrConnectWithoutProcessoInput | ContainerProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: ContainerProcessoCreateManyProcessoInputEnvelope
    connect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
  }

  export type DocumentoProcessoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput> | DocumentoProcessoCreateWithoutProcessoInput[] | DocumentoProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoProcessoCreateOrConnectWithoutProcessoInput | DocumentoProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoProcessoCreateManyProcessoInputEnvelope
    connect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
  }

  export type FollowUpProcessoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput> | FollowUpProcessoCreateWithoutProcessoInput[] | FollowUpProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpProcessoCreateOrConnectWithoutProcessoInput | FollowUpProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: FollowUpProcessoCreateManyProcessoInputEnvelope
    connect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
  }

  export type HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput> | HistoricoStatusProcessoCreateWithoutProcessoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput | HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: HistoricoStatusProcessoCreateManyProcessoInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: LogisticaInternacionalProcessoCreateOrConnectWithoutProcessoInput
    connect?: LogisticaInternacionalProcessoWhereUniqueInput
  }

  export type DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosProcessoCreateOrConnectWithoutProcessoInput
    connect?: DadosProcessoWhereUniqueInput
  }

  export type CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: CambioProcessoCreateOrConnectWithoutProcessoInput
    connect?: CambioProcessoWhereUniqueInput
  }

  export type EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaProcessoCreateOrConnectWithoutProcessoInput
    connect?: EstimativaProcessoWhereUniqueInput
  }

  export type ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput> | ContainerProcessoCreateWithoutProcessoInput[] | ContainerProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ContainerProcessoCreateOrConnectWithoutProcessoInput | ContainerProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: ContainerProcessoCreateManyProcessoInputEnvelope
    connect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
  }

  export type DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput> | DocumentoProcessoCreateWithoutProcessoInput[] | DocumentoProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoProcessoCreateOrConnectWithoutProcessoInput | DocumentoProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoProcessoCreateManyProcessoInputEnvelope
    connect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
  }

  export type FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput> | FollowUpProcessoCreateWithoutProcessoInput[] | FollowUpProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpProcessoCreateOrConnectWithoutProcessoInput | FollowUpProcessoCreateOrConnectWithoutProcessoInput[]
    createMany?: FollowUpProcessoCreateManyProcessoInputEnvelope
    connect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ProcessoStatusUpdateOneWithoutProcessosNestedInput = {
    create?: XOR<ProcessoStatusCreateWithoutProcessosInput, ProcessoStatusUncheckedCreateWithoutProcessosInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutProcessosInput
    upsert?: ProcessoStatusUpsertWithoutProcessosInput
    disconnect?: ProcessoStatusWhereInput | boolean
    delete?: ProcessoStatusWhereInput | boolean
    connect?: ProcessoStatusWhereUniqueInput
    update?: XOR<XOR<ProcessoStatusUpdateToOneWithWhereWithoutProcessosInput, ProcessoStatusUpdateWithoutProcessosInput>, ProcessoStatusUncheckedUpdateWithoutProcessosInput>
  }

  export type HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput> | HistoricoStatusProcessoCreateWithoutProcessoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput | HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutProcessoInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: HistoricoStatusProcessoCreateManyProcessoInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutProcessoInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutProcessoInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: LogisticaInternacionalProcessoCreateOrConnectWithoutProcessoInput
    upsert?: LogisticaInternacionalProcessoUpsertWithoutProcessoInput
    disconnect?: LogisticaInternacionalProcessoWhereInput | boolean
    delete?: LogisticaInternacionalProcessoWhereInput | boolean
    connect?: LogisticaInternacionalProcessoWhereUniqueInput
    update?: XOR<XOR<LogisticaInternacionalProcessoUpdateToOneWithWhereWithoutProcessoInput, LogisticaInternacionalProcessoUpdateWithoutProcessoInput>, LogisticaInternacionalProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosProcessoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosProcessoCreateOrConnectWithoutProcessoInput
    upsert?: DadosProcessoUpsertWithoutProcessoInput
    disconnect?: DadosProcessoWhereInput | boolean
    delete?: DadosProcessoWhereInput | boolean
    connect?: DadosProcessoWhereUniqueInput
    update?: XOR<XOR<DadosProcessoUpdateToOneWithWhereWithoutProcessoInput, DadosProcessoUpdateWithoutProcessoInput>, DadosProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type CambioProcessoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: CambioProcessoCreateOrConnectWithoutProcessoInput
    upsert?: CambioProcessoUpsertWithoutProcessoInput
    disconnect?: CambioProcessoWhereInput | boolean
    delete?: CambioProcessoWhereInput | boolean
    connect?: CambioProcessoWhereUniqueInput
    update?: XOR<XOR<CambioProcessoUpdateToOneWithWhereWithoutProcessoInput, CambioProcessoUpdateWithoutProcessoInput>, CambioProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type EstimativaProcessoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaProcessoCreateOrConnectWithoutProcessoInput
    upsert?: EstimativaProcessoUpsertWithoutProcessoInput
    disconnect?: EstimativaProcessoWhereInput | boolean
    delete?: EstimativaProcessoWhereInput | boolean
    connect?: EstimativaProcessoWhereUniqueInput
    update?: XOR<XOR<EstimativaProcessoUpdateToOneWithWhereWithoutProcessoInput, EstimativaProcessoUpdateWithoutProcessoInput>, EstimativaProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type ContainerProcessoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput> | ContainerProcessoCreateWithoutProcessoInput[] | ContainerProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ContainerProcessoCreateOrConnectWithoutProcessoInput | ContainerProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: ContainerProcessoUpsertWithWhereUniqueWithoutProcessoInput | ContainerProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ContainerProcessoCreateManyProcessoInputEnvelope
    set?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    disconnect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    delete?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    connect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    update?: ContainerProcessoUpdateWithWhereUniqueWithoutProcessoInput | ContainerProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ContainerProcessoUpdateManyWithWhereWithoutProcessoInput | ContainerProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ContainerProcessoScalarWhereInput | ContainerProcessoScalarWhereInput[]
  }

  export type DocumentoProcessoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput> | DocumentoProcessoCreateWithoutProcessoInput[] | DocumentoProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoProcessoCreateOrConnectWithoutProcessoInput | DocumentoProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoProcessoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoProcessoCreateManyProcessoInputEnvelope
    set?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    disconnect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    delete?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    connect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    update?: DocumentoProcessoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoProcessoUpdateManyWithWhereWithoutProcessoInput | DocumentoProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoProcessoScalarWhereInput | DocumentoProcessoScalarWhereInput[]
  }

  export type FollowUpProcessoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput> | FollowUpProcessoCreateWithoutProcessoInput[] | FollowUpProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpProcessoCreateOrConnectWithoutProcessoInput | FollowUpProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: FollowUpProcessoUpsertWithWhereUniqueWithoutProcessoInput | FollowUpProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: FollowUpProcessoCreateManyProcessoInputEnvelope
    set?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    disconnect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    delete?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    connect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    update?: FollowUpProcessoUpdateWithWhereUniqueWithoutProcessoInput | FollowUpProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: FollowUpProcessoUpdateManyWithWhereWithoutProcessoInput | FollowUpProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: FollowUpProcessoScalarWhereInput | FollowUpProcessoScalarWhereInput[]
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput> | HistoricoStatusProcessoCreateWithoutProcessoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput | HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutProcessoInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: HistoricoStatusProcessoCreateManyProcessoInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutProcessoInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutProcessoInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: LogisticaInternacionalProcessoCreateOrConnectWithoutProcessoInput
    upsert?: LogisticaInternacionalProcessoUpsertWithoutProcessoInput
    disconnect?: LogisticaInternacionalProcessoWhereInput | boolean
    delete?: LogisticaInternacionalProcessoWhereInput | boolean
    connect?: LogisticaInternacionalProcessoWhereUniqueInput
    update?: XOR<XOR<LogisticaInternacionalProcessoUpdateToOneWithWhereWithoutProcessoInput, LogisticaInternacionalProcessoUpdateWithoutProcessoInput>, LogisticaInternacionalProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosProcessoCreateOrConnectWithoutProcessoInput
    upsert?: DadosProcessoUpsertWithoutProcessoInput
    disconnect?: DadosProcessoWhereInput | boolean
    delete?: DadosProcessoWhereInput | boolean
    connect?: DadosProcessoWhereUniqueInput
    update?: XOR<XOR<DadosProcessoUpdateToOneWithWhereWithoutProcessoInput, DadosProcessoUpdateWithoutProcessoInput>, DadosProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: CambioProcessoCreateOrConnectWithoutProcessoInput
    upsert?: CambioProcessoUpsertWithoutProcessoInput
    disconnect?: CambioProcessoWhereInput | boolean
    delete?: CambioProcessoWhereInput | boolean
    connect?: CambioProcessoWhereUniqueInput
    update?: XOR<XOR<CambioProcessoUpdateToOneWithWhereWithoutProcessoInput, CambioProcessoUpdateWithoutProcessoInput>, CambioProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaProcessoCreateOrConnectWithoutProcessoInput
    upsert?: EstimativaProcessoUpsertWithoutProcessoInput
    disconnect?: EstimativaProcessoWhereInput | boolean
    delete?: EstimativaProcessoWhereInput | boolean
    connect?: EstimativaProcessoWhereUniqueInput
    update?: XOR<XOR<EstimativaProcessoUpdateToOneWithWhereWithoutProcessoInput, EstimativaProcessoUpdateWithoutProcessoInput>, EstimativaProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput> | ContainerProcessoCreateWithoutProcessoInput[] | ContainerProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ContainerProcessoCreateOrConnectWithoutProcessoInput | ContainerProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: ContainerProcessoUpsertWithWhereUniqueWithoutProcessoInput | ContainerProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ContainerProcessoCreateManyProcessoInputEnvelope
    set?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    disconnect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    delete?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    connect?: ContainerProcessoWhereUniqueInput | ContainerProcessoWhereUniqueInput[]
    update?: ContainerProcessoUpdateWithWhereUniqueWithoutProcessoInput | ContainerProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ContainerProcessoUpdateManyWithWhereWithoutProcessoInput | ContainerProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ContainerProcessoScalarWhereInput | ContainerProcessoScalarWhereInput[]
  }

  export type DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput> | DocumentoProcessoCreateWithoutProcessoInput[] | DocumentoProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoProcessoCreateOrConnectWithoutProcessoInput | DocumentoProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoProcessoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoProcessoCreateManyProcessoInputEnvelope
    set?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    disconnect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    delete?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    connect?: DocumentoProcessoWhereUniqueInput | DocumentoProcessoWhereUniqueInput[]
    update?: DocumentoProcessoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoProcessoUpdateManyWithWhereWithoutProcessoInput | DocumentoProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoProcessoScalarWhereInput | DocumentoProcessoScalarWhereInput[]
  }

  export type FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput> | FollowUpProcessoCreateWithoutProcessoInput[] | FollowUpProcessoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpProcessoCreateOrConnectWithoutProcessoInput | FollowUpProcessoCreateOrConnectWithoutProcessoInput[]
    upsert?: FollowUpProcessoUpsertWithWhereUniqueWithoutProcessoInput | FollowUpProcessoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: FollowUpProcessoCreateManyProcessoInputEnvelope
    set?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    disconnect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    delete?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    connect?: FollowUpProcessoWhereUniqueInput | FollowUpProcessoWhereUniqueInput[]
    update?: FollowUpProcessoUpdateWithWhereUniqueWithoutProcessoInput | FollowUpProcessoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: FollowUpProcessoUpdateManyWithWhereWithoutProcessoInput | FollowUpProcessoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: FollowUpProcessoScalarWhereInput | FollowUpProcessoScalarWhereInput[]
  }

  export type ProcessoCreateNestedManyWithoutStatus_atualInput = {
    create?: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput> | ProcessoCreateWithoutStatus_atualInput[] | ProcessoUncheckedCreateWithoutStatus_atualInput[]
    connectOrCreate?: ProcessoCreateOrConnectWithoutStatus_atualInput | ProcessoCreateOrConnectWithoutStatus_atualInput[]
    createMany?: ProcessoCreateManyStatus_atualInputEnvelope
    connect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
  }

  export type HistoricoStatusProcessoCreateNestedManyWithoutStatus_anteriorInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput> | HistoricoStatusProcessoCreateWithoutStatus_anteriorInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_anteriorInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type HistoricoStatusProcessoCreateNestedManyWithoutStatus_novoInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput> | HistoricoStatusProcessoCreateWithoutStatus_novoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_novoInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type ProcessoUncheckedCreateNestedManyWithoutStatus_atualInput = {
    create?: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput> | ProcessoCreateWithoutStatus_atualInput[] | ProcessoUncheckedCreateWithoutStatus_atualInput[]
    connectOrCreate?: ProcessoCreateOrConnectWithoutStatus_atualInput | ProcessoCreateOrConnectWithoutStatus_atualInput[]
    createMany?: ProcessoCreateManyStatus_atualInputEnvelope
    connect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
  }

  export type HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_anteriorInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput> | HistoricoStatusProcessoCreateWithoutStatus_anteriorInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_anteriorInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_novoInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput> | HistoricoStatusProcessoCreateWithoutStatus_novoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_novoInputEnvelope
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProcessoUpdateManyWithoutStatus_atualNestedInput = {
    create?: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput> | ProcessoCreateWithoutStatus_atualInput[] | ProcessoUncheckedCreateWithoutStatus_atualInput[]
    connectOrCreate?: ProcessoCreateOrConnectWithoutStatus_atualInput | ProcessoCreateOrConnectWithoutStatus_atualInput[]
    upsert?: ProcessoUpsertWithWhereUniqueWithoutStatus_atualInput | ProcessoUpsertWithWhereUniqueWithoutStatus_atualInput[]
    createMany?: ProcessoCreateManyStatus_atualInputEnvelope
    set?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    disconnect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    delete?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    connect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    update?: ProcessoUpdateWithWhereUniqueWithoutStatus_atualInput | ProcessoUpdateWithWhereUniqueWithoutStatus_atualInput[]
    updateMany?: ProcessoUpdateManyWithWhereWithoutStatus_atualInput | ProcessoUpdateManyWithWhereWithoutStatus_atualInput[]
    deleteMany?: ProcessoScalarWhereInput | ProcessoScalarWhereInput[]
  }

  export type HistoricoStatusProcessoUpdateManyWithoutStatus_anteriorNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput> | HistoricoStatusProcessoCreateWithoutStatus_anteriorInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_anteriorInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_anteriorInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_anteriorInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_anteriorInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_anteriorInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_anteriorInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_anteriorInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type HistoricoStatusProcessoUpdateManyWithoutStatus_novoNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput> | HistoricoStatusProcessoCreateWithoutStatus_novoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_novoInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_novoInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_novoInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_novoInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_novoInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_novoInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_novoInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type ProcessoUncheckedUpdateManyWithoutStatus_atualNestedInput = {
    create?: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput> | ProcessoCreateWithoutStatus_atualInput[] | ProcessoUncheckedCreateWithoutStatus_atualInput[]
    connectOrCreate?: ProcessoCreateOrConnectWithoutStatus_atualInput | ProcessoCreateOrConnectWithoutStatus_atualInput[]
    upsert?: ProcessoUpsertWithWhereUniqueWithoutStatus_atualInput | ProcessoUpsertWithWhereUniqueWithoutStatus_atualInput[]
    createMany?: ProcessoCreateManyStatus_atualInputEnvelope
    set?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    disconnect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    delete?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    connect?: ProcessoWhereUniqueInput | ProcessoWhereUniqueInput[]
    update?: ProcessoUpdateWithWhereUniqueWithoutStatus_atualInput | ProcessoUpdateWithWhereUniqueWithoutStatus_atualInput[]
    updateMany?: ProcessoUpdateManyWithWhereWithoutStatus_atualInput | ProcessoUpdateManyWithWhereWithoutStatus_atualInput[]
    deleteMany?: ProcessoScalarWhereInput | ProcessoScalarWhereInput[]
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput> | HistoricoStatusProcessoCreateWithoutStatus_anteriorInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_anteriorInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_anteriorInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_anteriorInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_anteriorInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_anteriorInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_anteriorInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_anteriorInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoNestedInput = {
    create?: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput> | HistoricoStatusProcessoCreateWithoutStatus_novoInput[] | HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput[]
    connectOrCreate?: HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput | HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput[]
    upsert?: HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_novoInput | HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_novoInput[]
    createMany?: HistoricoStatusProcessoCreateManyStatus_novoInputEnvelope
    set?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    disconnect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    delete?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    connect?: HistoricoStatusProcessoWhereUniqueInput | HistoricoStatusProcessoWhereUniqueInput[]
    update?: HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_novoInput | HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_novoInput[]
    updateMany?: HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_novoInput | HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_novoInput[]
    deleteMany?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
  }

  export type ProcessoCreateNestedOneWithoutHistorico_statusInput = {
    create?: XOR<ProcessoCreateWithoutHistorico_statusInput, ProcessoUncheckedCreateWithoutHistorico_statusInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutHistorico_statusInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoStatusCreateNestedOneWithoutHistorico_anteriorInput = {
    create?: XOR<ProcessoStatusCreateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedCreateWithoutHistorico_anteriorInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutHistorico_anteriorInput
    connect?: ProcessoStatusWhereUniqueInput
  }

  export type ProcessoStatusCreateNestedOneWithoutHistorico_novoInput = {
    create?: XOR<ProcessoStatusCreateWithoutHistorico_novoInput, ProcessoStatusUncheckedCreateWithoutHistorico_novoInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutHistorico_novoInput
    connect?: ProcessoStatusWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutHistorico_statusNestedInput = {
    create?: XOR<ProcessoCreateWithoutHistorico_statusInput, ProcessoUncheckedCreateWithoutHistorico_statusInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutHistorico_statusInput
    upsert?: ProcessoUpsertWithoutHistorico_statusInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutHistorico_statusInput, ProcessoUpdateWithoutHistorico_statusInput>, ProcessoUncheckedUpdateWithoutHistorico_statusInput>
  }

  export type ProcessoStatusUpdateOneWithoutHistorico_anteriorNestedInput = {
    create?: XOR<ProcessoStatusCreateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedCreateWithoutHistorico_anteriorInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutHistorico_anteriorInput
    upsert?: ProcessoStatusUpsertWithoutHistorico_anteriorInput
    disconnect?: ProcessoStatusWhereInput | boolean
    delete?: ProcessoStatusWhereInput | boolean
    connect?: ProcessoStatusWhereUniqueInput
    update?: XOR<XOR<ProcessoStatusUpdateToOneWithWhereWithoutHistorico_anteriorInput, ProcessoStatusUpdateWithoutHistorico_anteriorInput>, ProcessoStatusUncheckedUpdateWithoutHistorico_anteriorInput>
  }

  export type ProcessoStatusUpdateOneRequiredWithoutHistorico_novoNestedInput = {
    create?: XOR<ProcessoStatusCreateWithoutHistorico_novoInput, ProcessoStatusUncheckedCreateWithoutHistorico_novoInput>
    connectOrCreate?: ProcessoStatusCreateOrConnectWithoutHistorico_novoInput
    upsert?: ProcessoStatusUpsertWithoutHistorico_novoInput
    connect?: ProcessoStatusWhereUniqueInput
    update?: XOR<XOR<ProcessoStatusUpdateToOneWithWhereWithoutHistorico_novoInput, ProcessoStatusUpdateWithoutHistorico_novoInput>, ProcessoStatusUncheckedUpdateWithoutHistorico_novoInput>
  }

  export type ProcessoCreateNestedOneWithoutLogisticaInput = {
    create?: XOR<ProcessoCreateWithoutLogisticaInput, ProcessoUncheckedCreateWithoutLogisticaInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutLogisticaInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutLogisticaNestedInput = {
    create?: XOR<ProcessoCreateWithoutLogisticaInput, ProcessoUncheckedCreateWithoutLogisticaInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutLogisticaInput
    upsert?: ProcessoUpsertWithoutLogisticaInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutLogisticaInput, ProcessoUpdateWithoutLogisticaInput>, ProcessoUncheckedUpdateWithoutLogisticaInput>
  }

  export type ProcessoCreateNestedOneWithoutDadosInput = {
    create?: XOR<ProcessoCreateWithoutDadosInput, ProcessoUncheckedCreateWithoutDadosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDadosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ProcessoUpdateOneRequiredWithoutDadosNestedInput = {
    create?: XOR<ProcessoCreateWithoutDadosInput, ProcessoUncheckedCreateWithoutDadosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDadosInput
    upsert?: ProcessoUpsertWithoutDadosInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutDadosInput, ProcessoUpdateWithoutDadosInput>, ProcessoUncheckedUpdateWithoutDadosInput>
  }

  export type ProcessoCreateNestedOneWithoutCambioInput = {
    create?: XOR<ProcessoCreateWithoutCambioInput, ProcessoUncheckedCreateWithoutCambioInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutCambioInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutCambioNestedInput = {
    create?: XOR<ProcessoCreateWithoutCambioInput, ProcessoUncheckedCreateWithoutCambioInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutCambioInput
    upsert?: ProcessoUpsertWithoutCambioInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutCambioInput, ProcessoUpdateWithoutCambioInput>, ProcessoUncheckedUpdateWithoutCambioInput>
  }

  export type ProcessoCreateNestedOneWithoutEstimativaInput = {
    create?: XOR<ProcessoCreateWithoutEstimativaInput, ProcessoUncheckedCreateWithoutEstimativaInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEstimativaInput
    connect?: ProcessoWhereUniqueInput
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ProcessoUpdateOneRequiredWithoutEstimativaNestedInput = {
    create?: XOR<ProcessoCreateWithoutEstimativaInput, ProcessoUncheckedCreateWithoutEstimativaInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEstimativaInput
    upsert?: ProcessoUpsertWithoutEstimativaInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutEstimativaInput, ProcessoUpdateWithoutEstimativaInput>, ProcessoUncheckedUpdateWithoutEstimativaInput>
  }

  export type ProcessoCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutDocumentosNestedInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    upsert?: ProcessoUpsertWithoutDocumentosInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutDocumentosInput, ProcessoUpdateWithoutDocumentosInput>, ProcessoUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoCreateNestedOneWithoutContainersInput = {
    create?: XOR<ProcessoCreateWithoutContainersInput, ProcessoUncheckedCreateWithoutContainersInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutContainersInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutContainersNestedInput = {
    create?: XOR<ProcessoCreateWithoutContainersInput, ProcessoUncheckedCreateWithoutContainersInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutContainersInput
    upsert?: ProcessoUpsertWithoutContainersInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutContainersInput, ProcessoUpdateWithoutContainersInput>, ProcessoUncheckedUpdateWithoutContainersInput>
  }

  export type ProcessoCreateNestedOneWithoutFollow_upsInput = {
    create?: XOR<ProcessoCreateWithoutFollow_upsInput, ProcessoUncheckedCreateWithoutFollow_upsInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutFollow_upsInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutFollow_upsNestedInput = {
    create?: XOR<ProcessoCreateWithoutFollow_upsInput, ProcessoUncheckedCreateWithoutFollow_upsInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutFollow_upsInput
    upsert?: ProcessoUpsertWithoutFollow_upsInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutFollow_upsInput, ProcessoUpdateWithoutFollow_upsInput>, ProcessoUncheckedUpdateWithoutFollow_upsInput>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type ProcessoStatusCreateWithoutProcessosInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    historico_anterior?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_anteriorInput
    historico_novo?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusUncheckedCreateWithoutProcessosInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    historico_anterior?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_anteriorInput
    historico_novo?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusCreateOrConnectWithoutProcessosInput = {
    where: ProcessoStatusWhereUniqueInput
    create: XOR<ProcessoStatusCreateWithoutProcessosInput, ProcessoStatusUncheckedCreateWithoutProcessosInput>
  }

  export type HistoricoStatusProcessoCreateWithoutProcessoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
    status_anterior?: ProcessoStatusCreateNestedOneWithoutHistorico_anteriorInput
    status_novo: ProcessoStatusCreateNestedOneWithoutHistorico_novoInput
  }

  export type HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_status_anterior_processo?: string | null
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoCreateOrConnectWithoutProcessoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    create: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type HistoricoStatusProcessoCreateManyProcessoInputEnvelope = {
    data: HistoricoStatusProcessoCreateManyProcessoInput | HistoricoStatusProcessoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type LogisticaInternacionalProcessoCreateWithoutProcessoInput = {
    id_logistica_internacional_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    modal_frete_internacional_processo?: string | null
    tipo_frete_internacional_processo?: string | null
    tipo_volume_processo?: string | null
    incoterm_processo?: string | null
    porto_origem_processo?: string | null
    porto_destino_processo?: string | null
    porto_transbordo_processo?: string | null
    aeroporto_origem_processo?: string | null
    aeroporto_destino_processo?: string | null
    aeroporto_escala_processo?: string | null
    id_agente_carga?: string | null
    id_armador?: string | null
    id_cia_aerea?: string | null
    id_transportador_rodo_internacional?: string | null
    id_transportador_rodo_nacional?: string | null
    id_transportador_ferroviario?: string | null
    id_despachante?: string | null
    id_armazem_alfandegado?: string | null
    id_seguradora_internacional?: string | null
    data_criacao_logistica_internacional_processo?: Date | string
    data_atualizacao_logistica_internacional_processo?: Date | string
  }

  export type LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput = {
    id_logistica_internacional_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    modal_frete_internacional_processo?: string | null
    tipo_frete_internacional_processo?: string | null
    tipo_volume_processo?: string | null
    incoterm_processo?: string | null
    porto_origem_processo?: string | null
    porto_destino_processo?: string | null
    porto_transbordo_processo?: string | null
    aeroporto_origem_processo?: string | null
    aeroporto_destino_processo?: string | null
    aeroporto_escala_processo?: string | null
    id_agente_carga?: string | null
    id_armador?: string | null
    id_cia_aerea?: string | null
    id_transportador_rodo_internacional?: string | null
    id_transportador_rodo_nacional?: string | null
    id_transportador_ferroviario?: string | null
    id_despachante?: string | null
    id_armazem_alfandegado?: string | null
    id_seguradora_internacional?: string | null
    data_criacao_logistica_internacional_processo?: Date | string
    data_atualizacao_logistica_internacional_processo?: Date | string
  }

  export type LogisticaInternacionalProcessoCreateOrConnectWithoutProcessoInput = {
    where: LogisticaInternacionalProcessoWhereUniqueInput
    create: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type DadosProcessoCreateWithoutProcessoInput = {
    id_dados_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    canal_parametrizacao_processo?: string | null
    numero_duimp_processo?: string | null
    numero_nfe_processo?: string | null
    chave_acesso_nfe_processo?: string | null
    data_registro_duimp_processo?: Date | string | null
    data_liberacao_duimp_processo?: Date | string | null
    data_consulta_liberacao_duimp_processo?: Date | string | null
    data_previsao_registro_duimp_processo?: Date | string | null
    data_previsao_liberacao_duimp_processo?: Date | string | null
    data_registro_lpco_processo?: Date | string | null
    data_deferimento_lpco_processo?: Date | string | null
    data_indeferimento_lpco_processo?: Date | string | null
    data_pendencia_lpco_processo?: Date | string | null
    data_consulta_liberacao_lpco_processo?: Date | string | null
    data_previsao_registro_lpco_processo?: Date | string | null
    data_criacao_dados_processo?: Date | string
    data_atualizacao_dados_processo?: Date | string
  }

  export type DadosProcessoUncheckedCreateWithoutProcessoInput = {
    id_dados_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    canal_parametrizacao_processo?: string | null
    numero_duimp_processo?: string | null
    numero_nfe_processo?: string | null
    chave_acesso_nfe_processo?: string | null
    data_registro_duimp_processo?: Date | string | null
    data_liberacao_duimp_processo?: Date | string | null
    data_consulta_liberacao_duimp_processo?: Date | string | null
    data_previsao_registro_duimp_processo?: Date | string | null
    data_previsao_liberacao_duimp_processo?: Date | string | null
    data_registro_lpco_processo?: Date | string | null
    data_deferimento_lpco_processo?: Date | string | null
    data_indeferimento_lpco_processo?: Date | string | null
    data_pendencia_lpco_processo?: Date | string | null
    data_consulta_liberacao_lpco_processo?: Date | string | null
    data_previsao_registro_lpco_processo?: Date | string | null
    data_criacao_dados_processo?: Date | string
    data_atualizacao_dados_processo?: Date | string
  }

  export type DadosProcessoCreateOrConnectWithoutProcessoInput = {
    where: DadosProcessoWhereUniqueInput
    create: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type CambioProcessoCreateWithoutProcessoInput = {
    id_cambio_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_banco_processo?: string | null
    id_corretora_cambio_processo?: string | null
    data_criacao_cambio_processo?: Date | string
    data_atualizacao_cambio_processo?: Date | string
  }

  export type CambioProcessoUncheckedCreateWithoutProcessoInput = {
    id_cambio_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_banco_processo?: string | null
    id_corretora_cambio_processo?: string | null
    data_criacao_cambio_processo?: Date | string
    data_atualizacao_cambio_processo?: Date | string
  }

  export type CambioProcessoCreateOrConnectWithoutProcessoInput = {
    where: CambioProcessoWhereUniqueInput
    create: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type EstimativaProcessoCreateWithoutProcessoInput = {
    id_estimativa_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    total_imposto_ii_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: string
    data_criacao_estimativa_processo?: Date | string
    data_atualizacao_estimativa_processo?: Date | string
  }

  export type EstimativaProcessoUncheckedCreateWithoutProcessoInput = {
    id_estimativa_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    total_imposto_ii_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: string
    data_criacao_estimativa_processo?: Date | string
    data_atualizacao_estimativa_processo?: Date | string
  }

  export type EstimativaProcessoCreateOrConnectWithoutProcessoInput = {
    where: EstimativaProcessoWhereUniqueInput
    create: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type ContainerProcessoCreateWithoutProcessoInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
  }

  export type ContainerProcessoUncheckedCreateWithoutProcessoInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
  }

  export type ContainerProcessoCreateOrConnectWithoutProcessoInput = {
    where: ContainerProcessoWhereUniqueInput
    create: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type ContainerProcessoCreateManyProcessoInputEnvelope = {
    data: ContainerProcessoCreateManyProcessoInput | ContainerProcessoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type DocumentoProcessoCreateWithoutProcessoInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
  }

  export type DocumentoProcessoUncheckedCreateWithoutProcessoInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
  }

  export type DocumentoProcessoCreateOrConnectWithoutProcessoInput = {
    where: DocumentoProcessoWhereUniqueInput
    create: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoProcessoCreateManyProcessoInputEnvelope = {
    data: DocumentoProcessoCreateManyProcessoInput | DocumentoProcessoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type FollowUpProcessoCreateWithoutProcessoInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
  }

  export type FollowUpProcessoUncheckedCreateWithoutProcessoInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
  }

  export type FollowUpProcessoCreateOrConnectWithoutProcessoInput = {
    where: FollowUpProcessoWhereUniqueInput
    create: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type FollowUpProcessoCreateManyProcessoInputEnvelope = {
    data: FollowUpProcessoCreateManyProcessoInput | FollowUpProcessoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoStatusUpsertWithoutProcessosInput = {
    update: XOR<ProcessoStatusUpdateWithoutProcessosInput, ProcessoStatusUncheckedUpdateWithoutProcessosInput>
    create: XOR<ProcessoStatusCreateWithoutProcessosInput, ProcessoStatusUncheckedCreateWithoutProcessosInput>
    where?: ProcessoStatusWhereInput
  }

  export type ProcessoStatusUpdateToOneWithWhereWithoutProcessosInput = {
    where?: ProcessoStatusWhereInput
    data: XOR<ProcessoStatusUpdateWithoutProcessosInput, ProcessoStatusUncheckedUpdateWithoutProcessosInput>
  }

  export type ProcessoStatusUpdateWithoutProcessosInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_anterior?: HistoricoStatusProcessoUpdateManyWithoutStatus_anteriorNestedInput
    historico_novo?: HistoricoStatusProcessoUpdateManyWithoutStatus_novoNestedInput
  }

  export type ProcessoStatusUncheckedUpdateWithoutProcessosInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_anterior?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorNestedInput
    historico_novo?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoNestedInput
  }

  export type HistoricoStatusProcessoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    update: XOR<HistoricoStatusProcessoUpdateWithoutProcessoInput, HistoricoStatusProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<HistoricoStatusProcessoCreateWithoutProcessoInput, HistoricoStatusProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type HistoricoStatusProcessoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    data: XOR<HistoricoStatusProcessoUpdateWithoutProcessoInput, HistoricoStatusProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type HistoricoStatusProcessoUpdateManyWithWhereWithoutProcessoInput = {
    where: HistoricoStatusProcessoScalarWhereInput
    data: XOR<HistoricoStatusProcessoUpdateManyMutationInput, HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type HistoricoStatusProcessoScalarWhereInput = {
    AND?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
    OR?: HistoricoStatusProcessoScalarWhereInput[]
    NOT?: HistoricoStatusProcessoScalarWhereInput | HistoricoStatusProcessoScalarWhereInput[]
    id_historico_status_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_organizacao?: StringFilter<"HistoricoStatusProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_status_anterior_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    id_status_novo_processo?: StringFilter<"HistoricoStatusProcesso"> | string
    id_usuario_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
    data_mudanca_status_processo?: DateTimeFilter<"HistoricoStatusProcesso"> | Date | string
    observacao_mudanca_status_processo?: StringNullableFilter<"HistoricoStatusProcesso"> | string | null
  }

  export type LogisticaInternacionalProcessoUpsertWithoutProcessoInput = {
    update: XOR<LogisticaInternacionalProcessoUpdateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<LogisticaInternacionalProcessoCreateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedCreateWithoutProcessoInput>
    where?: LogisticaInternacionalProcessoWhereInput
  }

  export type LogisticaInternacionalProcessoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: LogisticaInternacionalProcessoWhereInput
    data: XOR<LogisticaInternacionalProcessoUpdateWithoutProcessoInput, LogisticaInternacionalProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type LogisticaInternacionalProcessoUpdateWithoutProcessoInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogisticaInternacionalProcessoUncheckedUpdateWithoutProcessoInput = {
    id_logistica_internacional_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    modal_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_frete_internacional_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_volume_processo?: NullableStringFieldUpdateOperationsInput | string | null
    incoterm_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    porto_transbordo_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    aeroporto_escala_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_agente_carga?: NullableStringFieldUpdateOperationsInput | string | null
    id_armador?: NullableStringFieldUpdateOperationsInput | string | null
    id_cia_aerea?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_rodo_nacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transportador_ferroviario?: NullableStringFieldUpdateOperationsInput | string | null
    id_despachante?: NullableStringFieldUpdateOperationsInput | string | null
    id_armazem_alfandegado?: NullableStringFieldUpdateOperationsInput | string | null
    id_seguradora_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_logistica_internacional_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DadosProcessoUpsertWithoutProcessoInput = {
    update: XOR<DadosProcessoUpdateWithoutProcessoInput, DadosProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<DadosProcessoCreateWithoutProcessoInput, DadosProcessoUncheckedCreateWithoutProcessoInput>
    where?: DadosProcessoWhereInput
  }

  export type DadosProcessoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: DadosProcessoWhereInput
    data: XOR<DadosProcessoUpdateWithoutProcessoInput, DadosProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosProcessoUpdateWithoutProcessoInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DadosProcessoUncheckedUpdateWithoutProcessoInput = {
    id_dados_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    canal_parametrizacao_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_duimp_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    chave_acesso_nfe_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_liberacao_duimp_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_deferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_indeferimento_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_pendencia_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_consulta_liberacao_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_previsao_registro_lpco_processo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_dados_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CambioProcessoUpsertWithoutProcessoInput = {
    update: XOR<CambioProcessoUpdateWithoutProcessoInput, CambioProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<CambioProcessoCreateWithoutProcessoInput, CambioProcessoUncheckedCreateWithoutProcessoInput>
    where?: CambioProcessoWhereInput
  }

  export type CambioProcessoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: CambioProcessoWhereInput
    data: XOR<CambioProcessoUpdateWithoutProcessoInput, CambioProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type CambioProcessoUpdateWithoutProcessoInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CambioProcessoUncheckedUpdateWithoutProcessoInput = {
    id_cambio_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_banco_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_corretora_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_cambio_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimativaProcessoUpsertWithoutProcessoInput = {
    update: XOR<EstimativaProcessoUpdateWithoutProcessoInput, EstimativaProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<EstimativaProcessoCreateWithoutProcessoInput, EstimativaProcessoUncheckedCreateWithoutProcessoInput>
    where?: EstimativaProcessoWhereInput
  }

  export type EstimativaProcessoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: EstimativaProcessoWhereInput
    data: XOR<EstimativaProcessoUpdateWithoutProcessoInput, EstimativaProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type EstimativaProcessoUpdateWithoutProcessoInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EstimativaProcessoUncheckedUpdateWithoutProcessoInput = {
    id_estimativa_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    total_imposto_ii_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_ipi_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_pis_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_cofins_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    total_imposto_icms_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_frete_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_despacho_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_outros_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    valor_total_estimado_processo?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    moeda_estimativa_processo?: StringFieldUpdateOperationsInput | string
    data_criacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_estimativa_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ContainerProcessoWhereUniqueInput
    update: XOR<ContainerProcessoUpdateWithoutProcessoInput, ContainerProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<ContainerProcessoCreateWithoutProcessoInput, ContainerProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type ContainerProcessoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ContainerProcessoWhereUniqueInput
    data: XOR<ContainerProcessoUpdateWithoutProcessoInput, ContainerProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type ContainerProcessoUpdateManyWithWhereWithoutProcessoInput = {
    where: ContainerProcessoScalarWhereInput
    data: XOR<ContainerProcessoUpdateManyMutationInput, ContainerProcessoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ContainerProcessoScalarWhereInput = {
    AND?: ContainerProcessoScalarWhereInput | ContainerProcessoScalarWhereInput[]
    OR?: ContainerProcessoScalarWhereInput[]
    NOT?: ContainerProcessoScalarWhereInput | ContainerProcessoScalarWhereInput[]
    id_processo_container?: StringFilter<"ContainerProcesso"> | string
    id_organizacao?: StringFilter<"ContainerProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"ContainerProcesso"> | string | null
    id_processo?: StringFilter<"ContainerProcesso"> | string
    container_numero_processo_container?: StringFilter<"ContainerProcesso"> | string
    container_tipo_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_lacre_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    container_tara_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: DecimalNullableFilter<"ContainerProcesso"> | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: StringNullableFilter<"ContainerProcesso"> | string | null
    data_devolucao_prevista_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_devolucao_real_processo_container?: DateTimeNullableFilter<"ContainerProcesso"> | Date | string | null
    data_criacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
    data_atualizacao_container_processo?: DateTimeFilter<"ContainerProcesso"> | Date | string
  }

  export type DocumentoProcessoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoProcessoWhereUniqueInput
    update: XOR<DocumentoProcessoUpdateWithoutProcessoInput, DocumentoProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<DocumentoProcessoCreateWithoutProcessoInput, DocumentoProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoProcessoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoProcessoWhereUniqueInput
    data: XOR<DocumentoProcessoUpdateWithoutProcessoInput, DocumentoProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type DocumentoProcessoUpdateManyWithWhereWithoutProcessoInput = {
    where: DocumentoProcessoScalarWhereInput
    data: XOR<DocumentoProcessoUpdateManyMutationInput, DocumentoProcessoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type DocumentoProcessoScalarWhereInput = {
    AND?: DocumentoProcessoScalarWhereInput | DocumentoProcessoScalarWhereInput[]
    OR?: DocumentoProcessoScalarWhereInput[]
    NOT?: DocumentoProcessoScalarWhereInput | DocumentoProcessoScalarWhereInput[]
    id_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    id_organizacao?: StringFilter<"DocumentoProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_usuario?: StringNullableFilter<"DocumentoProcesso"> | string | null
    id_processo?: StringFilter<"DocumentoProcesso"> | string
    nome_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tipo_arquivo_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    tamanho_bytes_documento_processo?: IntFilter<"DocumentoProcesso"> | number
    url_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    categoria_documento_processo?: StringFilter<"DocumentoProcesso"> | string
    numero_bl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mawb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_awb_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_hbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_mbl_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_ce_mercante_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_certificado_origem_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_cim_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_crt_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    numero_presenca_carga_destino_processo?: StringNullableFilter<"DocumentoProcesso"> | string | null
    data_criacao_documento_processo?: DateTimeFilter<"DocumentoProcesso"> | Date | string
  }

  export type FollowUpProcessoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: FollowUpProcessoWhereUniqueInput
    update: XOR<FollowUpProcessoUpdateWithoutProcessoInput, FollowUpProcessoUncheckedUpdateWithoutProcessoInput>
    create: XOR<FollowUpProcessoCreateWithoutProcessoInput, FollowUpProcessoUncheckedCreateWithoutProcessoInput>
  }

  export type FollowUpProcessoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: FollowUpProcessoWhereUniqueInput
    data: XOR<FollowUpProcessoUpdateWithoutProcessoInput, FollowUpProcessoUncheckedUpdateWithoutProcessoInput>
  }

  export type FollowUpProcessoUpdateManyWithWhereWithoutProcessoInput = {
    where: FollowUpProcessoScalarWhereInput
    data: XOR<FollowUpProcessoUpdateManyMutationInput, FollowUpProcessoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type FollowUpProcessoScalarWhereInput = {
    AND?: FollowUpProcessoScalarWhereInput | FollowUpProcessoScalarWhereInput[]
    OR?: FollowUpProcessoScalarWhereInput[]
    NOT?: FollowUpProcessoScalarWhereInput | FollowUpProcessoScalarWhereInput[]
    id_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    id_organizacao?: StringFilter<"FollowUpProcesso"> | string
    id_produto_gravity?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_usuario?: StringNullableFilter<"FollowUpProcesso"> | string | null
    id_processo?: StringFilter<"FollowUpProcesso"> | string
    titulo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    descricao_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    tipo_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    categoria_follow_up_processo?: StringFilter<"FollowUpProcesso"> | string
    id_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    nome_usuario_registro_follow_up_processo?: StringNullableFilter<"FollowUpProcesso"> | string | null
    data_criacao_follow_up_processo?: DateTimeFilter<"FollowUpProcesso"> | Date | string
  }

  export type ProcessoCreateWithoutStatus_atualInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutStatus_atualInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutStatus_atualInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput>
  }

  export type ProcessoCreateManyStatus_atualInputEnvelope = {
    data: ProcessoCreateManyStatus_atualInput | ProcessoCreateManyStatus_atualInput[]
    skipDuplicates?: boolean
  }

  export type HistoricoStatusProcessoCreateWithoutStatus_anteriorInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
    processo: ProcessoCreateNestedOneWithoutHistorico_statusInput
    status_novo: ProcessoStatusCreateNestedOneWithoutHistorico_novoInput
  }

  export type HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoCreateOrConnectWithoutStatus_anteriorInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    create: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput>
  }

  export type HistoricoStatusProcessoCreateManyStatus_anteriorInputEnvelope = {
    data: HistoricoStatusProcessoCreateManyStatus_anteriorInput | HistoricoStatusProcessoCreateManyStatus_anteriorInput[]
    skipDuplicates?: boolean
  }

  export type HistoricoStatusProcessoCreateWithoutStatus_novoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
    processo: ProcessoCreateNestedOneWithoutHistorico_statusInput
    status_anterior?: ProcessoStatusCreateNestedOneWithoutHistorico_anteriorInput
  }

  export type HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_anterior_processo?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoCreateOrConnectWithoutStatus_novoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    create: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput>
  }

  export type HistoricoStatusProcessoCreateManyStatus_novoInputEnvelope = {
    data: HistoricoStatusProcessoCreateManyStatus_novoInput | HistoricoStatusProcessoCreateManyStatus_novoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoUpsertWithWhereUniqueWithoutStatus_atualInput = {
    where: ProcessoWhereUniqueInput
    update: XOR<ProcessoUpdateWithoutStatus_atualInput, ProcessoUncheckedUpdateWithoutStatus_atualInput>
    create: XOR<ProcessoCreateWithoutStatus_atualInput, ProcessoUncheckedCreateWithoutStatus_atualInput>
  }

  export type ProcessoUpdateWithWhereUniqueWithoutStatus_atualInput = {
    where: ProcessoWhereUniqueInput
    data: XOR<ProcessoUpdateWithoutStatus_atualInput, ProcessoUncheckedUpdateWithoutStatus_atualInput>
  }

  export type ProcessoUpdateManyWithWhereWithoutStatus_atualInput = {
    where: ProcessoScalarWhereInput
    data: XOR<ProcessoUpdateManyMutationInput, ProcessoUncheckedUpdateManyWithoutStatus_atualInput>
  }

  export type ProcessoScalarWhereInput = {
    AND?: ProcessoScalarWhereInput | ProcessoScalarWhereInput[]
    OR?: ProcessoScalarWhereInput[]
    NOT?: ProcessoScalarWhereInput | ProcessoScalarWhereInput[]
    id_processo?: StringFilter<"Processo"> | string
    id_organizacao?: StringFilter<"Processo"> | string
    id_workspace?: StringFilter<"Processo"> | string
    id_produto_gravity?: StringNullableFilter<"Processo"> | string | null
    id_usuario?: StringNullableFilter<"Processo"> | string | null
    numero_processo?: StringFilter<"Processo"> | string
    tipo_operacao_processo?: StringFilter<"Processo"> | string
    referencia_interna_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_importador_processo?: StringNullableFilter<"Processo"> | string | null
    referencia_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_status_atual_processo?: StringNullableFilter<"Processo"> | string | null
    id_importacao_exportador_processo?: StringNullableFilter<"Processo"> | string | null
    id_exportacao_importador_processo?: StringNullableFilter<"Processo"> | string | null
    id_cotacao_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_proposta_bid_frete_internacional?: StringNullableFilter<"Processo"> | string | null
    id_transito_processo?: StringNullableFilter<"Processo"> | string | null
    id_operacao_cambio_processo?: StringNullableFilter<"Processo"> | string | null
    id_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    responsavel_rotina_processo?: StringNullableFilter<"Processo"> | string | null
    setor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    vendedor_responsavel_processo?: StringNullableFilter<"Processo"> | string | null
    data_criacao_processo?: DateTimeFilter<"Processo"> | Date | string
    data_atualizacao_processo?: DateTimeFilter<"Processo"> | Date | string
  }

  export type HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_anteriorInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    update: XOR<HistoricoStatusProcessoUpdateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedUpdateWithoutStatus_anteriorInput>
    create: XOR<HistoricoStatusProcessoCreateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_anteriorInput>
  }

  export type HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_anteriorInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    data: XOR<HistoricoStatusProcessoUpdateWithoutStatus_anteriorInput, HistoricoStatusProcessoUncheckedUpdateWithoutStatus_anteriorInput>
  }

  export type HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_anteriorInput = {
    where: HistoricoStatusProcessoScalarWhereInput
    data: XOR<HistoricoStatusProcessoUpdateManyMutationInput, HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorInput>
  }

  export type HistoricoStatusProcessoUpsertWithWhereUniqueWithoutStatus_novoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    update: XOR<HistoricoStatusProcessoUpdateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedUpdateWithoutStatus_novoInput>
    create: XOR<HistoricoStatusProcessoCreateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedCreateWithoutStatus_novoInput>
  }

  export type HistoricoStatusProcessoUpdateWithWhereUniqueWithoutStatus_novoInput = {
    where: HistoricoStatusProcessoWhereUniqueInput
    data: XOR<HistoricoStatusProcessoUpdateWithoutStatus_novoInput, HistoricoStatusProcessoUncheckedUpdateWithoutStatus_novoInput>
  }

  export type HistoricoStatusProcessoUpdateManyWithWhereWithoutStatus_novoInput = {
    where: HistoricoStatusProcessoScalarWhereInput
    data: XOR<HistoricoStatusProcessoUpdateManyMutationInput, HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoInput>
  }

  export type ProcessoCreateWithoutHistorico_statusInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutHistorico_statusInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutHistorico_statusInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutHistorico_statusInput, ProcessoUncheckedCreateWithoutHistorico_statusInput>
  }

  export type ProcessoStatusCreateWithoutHistorico_anteriorInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoCreateNestedManyWithoutStatus_atualInput
    historico_novo?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusUncheckedCreateWithoutHistorico_anteriorInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoUncheckedCreateNestedManyWithoutStatus_atualInput
    historico_novo?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_novoInput
  }

  export type ProcessoStatusCreateOrConnectWithoutHistorico_anteriorInput = {
    where: ProcessoStatusWhereUniqueInput
    create: XOR<ProcessoStatusCreateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedCreateWithoutHistorico_anteriorInput>
  }

  export type ProcessoStatusCreateWithoutHistorico_novoInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoCreateNestedManyWithoutStatus_atualInput
    historico_anterior?: HistoricoStatusProcessoCreateNestedManyWithoutStatus_anteriorInput
  }

  export type ProcessoStatusUncheckedCreateWithoutHistorico_novoInput = {
    id_processo_status?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    tipo_status_processo: string
    rotulo_status_processo: string
    cor_status_processo?: string
    ordem_status_processo?: number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: boolean
    eh_sistema_status_processo?: boolean
    data_criacao_processo_status?: Date | string
    data_atualizacao_processo_status?: Date | string
    processos?: ProcessoUncheckedCreateNestedManyWithoutStatus_atualInput
    historico_anterior?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutStatus_anteriorInput
  }

  export type ProcessoStatusCreateOrConnectWithoutHistorico_novoInput = {
    where: ProcessoStatusWhereUniqueInput
    create: XOR<ProcessoStatusCreateWithoutHistorico_novoInput, ProcessoStatusUncheckedCreateWithoutHistorico_novoInput>
  }

  export type ProcessoUpsertWithoutHistorico_statusInput = {
    update: XOR<ProcessoUpdateWithoutHistorico_statusInput, ProcessoUncheckedUpdateWithoutHistorico_statusInput>
    create: XOR<ProcessoCreateWithoutHistorico_statusInput, ProcessoUncheckedCreateWithoutHistorico_statusInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutHistorico_statusInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutHistorico_statusInput, ProcessoUncheckedUpdateWithoutHistorico_statusInput>
  }

  export type ProcessoUpdateWithoutHistorico_statusInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutHistorico_statusInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoStatusUpsertWithoutHistorico_anteriorInput = {
    update: XOR<ProcessoStatusUpdateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedUpdateWithoutHistorico_anteriorInput>
    create: XOR<ProcessoStatusCreateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedCreateWithoutHistorico_anteriorInput>
    where?: ProcessoStatusWhereInput
  }

  export type ProcessoStatusUpdateToOneWithWhereWithoutHistorico_anteriorInput = {
    where?: ProcessoStatusWhereInput
    data: XOR<ProcessoStatusUpdateWithoutHistorico_anteriorInput, ProcessoStatusUncheckedUpdateWithoutHistorico_anteriorInput>
  }

  export type ProcessoStatusUpdateWithoutHistorico_anteriorInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUpdateManyWithoutStatus_atualNestedInput
    historico_novo?: HistoricoStatusProcessoUpdateManyWithoutStatus_novoNestedInput
  }

  export type ProcessoStatusUncheckedUpdateWithoutHistorico_anteriorInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUncheckedUpdateManyWithoutStatus_atualNestedInput
    historico_novo?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoNestedInput
  }

  export type ProcessoStatusUpsertWithoutHistorico_novoInput = {
    update: XOR<ProcessoStatusUpdateWithoutHistorico_novoInput, ProcessoStatusUncheckedUpdateWithoutHistorico_novoInput>
    create: XOR<ProcessoStatusCreateWithoutHistorico_novoInput, ProcessoStatusUncheckedCreateWithoutHistorico_novoInput>
    where?: ProcessoStatusWhereInput
  }

  export type ProcessoStatusUpdateToOneWithWhereWithoutHistorico_novoInput = {
    where?: ProcessoStatusWhereInput
    data: XOR<ProcessoStatusUpdateWithoutHistorico_novoInput, ProcessoStatusUncheckedUpdateWithoutHistorico_novoInput>
  }

  export type ProcessoStatusUpdateWithoutHistorico_novoInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUpdateManyWithoutStatus_atualNestedInput
    historico_anterior?: HistoricoStatusProcessoUpdateManyWithoutStatus_anteriorNestedInput
  }

  export type ProcessoStatusUncheckedUpdateWithoutHistorico_novoInput = {
    id_processo_status?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_status_processo?: StringFieldUpdateOperationsInput | string
    rotulo_status_processo?: StringFieldUpdateOperationsInput | string
    cor_status_processo?: StringFieldUpdateOperationsInput | string
    ordem_status_processo?: IntFieldUpdateOperationsInput | number
    regras_status_processo?: NullableJsonNullValueInput | InputJsonValue
    eh_padrao_status_processo?: BoolFieldUpdateOperationsInput | boolean
    eh_sistema_status_processo?: BoolFieldUpdateOperationsInput | boolean
    data_criacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo_status?: DateTimeFieldUpdateOperationsInput | Date | string
    processos?: ProcessoUncheckedUpdateManyWithoutStatus_atualNestedInput
    historico_anterior?: HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorNestedInput
  }

  export type ProcessoCreateWithoutLogisticaInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutLogisticaInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutLogisticaInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutLogisticaInput, ProcessoUncheckedCreateWithoutLogisticaInput>
  }

  export type ProcessoUpsertWithoutLogisticaInput = {
    update: XOR<ProcessoUpdateWithoutLogisticaInput, ProcessoUncheckedUpdateWithoutLogisticaInput>
    create: XOR<ProcessoCreateWithoutLogisticaInput, ProcessoUncheckedCreateWithoutLogisticaInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutLogisticaInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutLogisticaInput, ProcessoUncheckedUpdateWithoutLogisticaInput>
  }

  export type ProcessoUpdateWithoutLogisticaInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutLogisticaInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutDadosInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutDadosInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutDadosInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutDadosInput, ProcessoUncheckedCreateWithoutDadosInput>
  }

  export type ProcessoUpsertWithoutDadosInput = {
    update: XOR<ProcessoUpdateWithoutDadosInput, ProcessoUncheckedUpdateWithoutDadosInput>
    create: XOR<ProcessoCreateWithoutDadosInput, ProcessoUncheckedCreateWithoutDadosInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutDadosInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutDadosInput, ProcessoUncheckedUpdateWithoutDadosInput>
  }

  export type ProcessoUpdateWithoutDadosInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutDadosInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutCambioInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutCambioInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutCambioInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutCambioInput, ProcessoUncheckedCreateWithoutCambioInput>
  }

  export type ProcessoUpsertWithoutCambioInput = {
    update: XOR<ProcessoUpdateWithoutCambioInput, ProcessoUncheckedUpdateWithoutCambioInput>
    create: XOR<ProcessoCreateWithoutCambioInput, ProcessoUncheckedCreateWithoutCambioInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutCambioInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutCambioInput, ProcessoUncheckedUpdateWithoutCambioInput>
  }

  export type ProcessoUpdateWithoutCambioInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutCambioInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutEstimativaInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutEstimativaInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutEstimativaInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutEstimativaInput, ProcessoUncheckedCreateWithoutEstimativaInput>
  }

  export type ProcessoUpsertWithoutEstimativaInput = {
    update: XOR<ProcessoUpdateWithoutEstimativaInput, ProcessoUncheckedUpdateWithoutEstimativaInput>
    create: XOR<ProcessoCreateWithoutEstimativaInput, ProcessoUncheckedCreateWithoutEstimativaInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutEstimativaInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutEstimativaInput, ProcessoUncheckedUpdateWithoutEstimativaInput>
  }

  export type ProcessoUpdateWithoutEstimativaInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutEstimativaInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutDocumentosInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutDocumentosInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutDocumentosInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
  }

  export type ProcessoUpsertWithoutDocumentosInput = {
    update: XOR<ProcessoUpdateWithoutDocumentosInput, ProcessoUncheckedUpdateWithoutDocumentosInput>
    create: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutDocumentosInput, ProcessoUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoUpdateWithoutDocumentosInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutDocumentosInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutContainersInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutContainersInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
    follow_ups?: FollowUpProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutContainersInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutContainersInput, ProcessoUncheckedCreateWithoutContainersInput>
  }

  export type ProcessoUpsertWithoutContainersInput = {
    update: XOR<ProcessoUpdateWithoutContainersInput, ProcessoUncheckedUpdateWithoutContainersInput>
    create: XOR<ProcessoCreateWithoutContainersInput, ProcessoUncheckedCreateWithoutContainersInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutContainersInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutContainersInput, ProcessoUncheckedUpdateWithoutContainersInput>
  }

  export type ProcessoUpdateWithoutContainersInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutContainersInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutFollow_upsInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    status_atual?: ProcessoStatusCreateNestedOneWithoutProcessosInput
    historico_status?: HistoricoStatusProcessoCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutFollow_upsInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_status_atual_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
    historico_status?: HistoricoStatusProcessoUncheckedCreateNestedManyWithoutProcessoInput
    logistica?: LogisticaInternacionalProcessoUncheckedCreateNestedOneWithoutProcessoInput
    dados?: DadosProcessoUncheckedCreateNestedOneWithoutProcessoInput
    cambio?: CambioProcessoUncheckedCreateNestedOneWithoutProcessoInput
    estimativa?: EstimativaProcessoUncheckedCreateNestedOneWithoutProcessoInput
    containers?: ContainerProcessoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoProcessoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutFollow_upsInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutFollow_upsInput, ProcessoUncheckedCreateWithoutFollow_upsInput>
  }

  export type ProcessoUpsertWithoutFollow_upsInput = {
    update: XOR<ProcessoUpdateWithoutFollow_upsInput, ProcessoUncheckedUpdateWithoutFollow_upsInput>
    create: XOR<ProcessoCreateWithoutFollow_upsInput, ProcessoUncheckedCreateWithoutFollow_upsInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutFollow_upsInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutFollow_upsInput, ProcessoUncheckedUpdateWithoutFollow_upsInput>
  }

  export type ProcessoUpdateWithoutFollow_upsInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    status_atual?: ProcessoStatusUpdateOneWithoutProcessosNestedInput
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutFollow_upsInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_atual_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type HistoricoStatusProcessoCreateManyProcessoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_status_anterior_processo?: string | null
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type ContainerProcessoCreateManyProcessoInput = {
    id_processo_container?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    container_numero_processo_container: string
    container_tipo_processo_container?: string | null
    container_lacre_processo_container?: string | null
    container_tara_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: string | null
    data_devolucao_prevista_processo_container?: Date | string | null
    data_devolucao_real_processo_container?: Date | string | null
    data_criacao_container_processo?: Date | string
    data_atualizacao_container_processo?: Date | string
  }

  export type DocumentoProcessoCreateManyProcessoInput = {
    id_documento_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    nome_documento_processo: string
    tipo_arquivo_documento_processo: string
    tamanho_bytes_documento_processo?: number
    url_documento_processo: string
    categoria_documento_processo?: string
    numero_bl_processo?: string | null
    numero_hawb_processo?: string | null
    numero_mawb_processo?: string | null
    numero_awb_processo?: string | null
    numero_hbl_processo?: string | null
    numero_mbl_processo?: string | null
    numero_ce_mercante_processo?: string | null
    numero_certificado_origem_processo?: string | null
    numero_cim_processo?: string | null
    numero_crt_processo?: string | null
    numero_presenca_carga_destino_processo?: string | null
    data_criacao_documento_processo?: Date | string
  }

  export type FollowUpProcessoCreateManyProcessoInput = {
    id_follow_up_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    titulo_follow_up_processo: string
    descricao_follow_up_processo?: string | null
    tipo_follow_up_processo?: string
    categoria_follow_up_processo?: string
    id_usuario_registro_follow_up_processo?: string | null
    nome_usuario_registro_follow_up_processo?: string | null
    data_criacao_follow_up_processo?: Date | string
  }

  export type HistoricoStatusProcessoUpdateWithoutProcessoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    status_anterior?: ProcessoStatusUpdateOneWithoutHistorico_anteriorNestedInput
    status_novo?: ProcessoStatusUpdateOneRequiredWithoutHistorico_novoNestedInput
  }

  export type HistoricoStatusProcessoUncheckedUpdateWithoutProcessoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ContainerProcessoUpdateWithoutProcessoInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoUncheckedUpdateWithoutProcessoInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContainerProcessoUncheckedUpdateManyWithoutProcessoInput = {
    id_processo_container?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero_processo_container?: StringFieldUpdateOperationsInput | string
    container_tipo_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_lacre_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    container_tara_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_bruto_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_peso_liquido_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    container_metragem_cubica_processo_container?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    local_devolucao_processo_container?: NullableStringFieldUpdateOperationsInput | string | null
    data_devolucao_prevista_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_devolucao_real_processo_container?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_criacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_container_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoUpdateWithoutProcessoInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoUncheckedUpdateWithoutProcessoInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoProcessoUncheckedUpdateManyWithoutProcessoInput = {
    id_documento_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    nome_documento_processo?: StringFieldUpdateOperationsInput | string
    tipo_arquivo_documento_processo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes_documento_processo?: IntFieldUpdateOperationsInput | number
    url_documento_processo?: StringFieldUpdateOperationsInput | string
    categoria_documento_processo?: StringFieldUpdateOperationsInput | string
    numero_bl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mawb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_awb_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_hbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_mbl_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_ce_mercante_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_certificado_origem_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_cim_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_crt_processo?: NullableStringFieldUpdateOperationsInput | string | null
    numero_presenca_carga_destino_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_documento_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoUpdateWithoutProcessoInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoUncheckedUpdateWithoutProcessoInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FollowUpProcessoUncheckedUpdateManyWithoutProcessoInput = {
    id_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    titulo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    descricao_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    tipo_follow_up_processo?: StringFieldUpdateOperationsInput | string
    categoria_follow_up_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    nome_usuario_registro_follow_up_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_follow_up_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoCreateManyStatus_atualInput = {
    id_processo?: string
    id_organizacao: string
    id_workspace: string
    id_produto_gravity?: string | null
    id_usuario?: string | null
    numero_processo: string
    tipo_operacao_processo: string
    referencia_interna_processo?: string | null
    referencia_importador_processo?: string | null
    referencia_exportador_processo?: string | null
    id_importacao_exportador_processo?: string | null
    id_exportacao_importador_processo?: string | null
    id_cotacao_bid_frete_internacional?: string | null
    id_proposta_bid_frete_internacional?: string | null
    id_transito_processo?: string | null
    id_operacao_cambio_processo?: string | null
    id_responsavel_processo?: string | null
    responsavel_rotina_processo?: string | null
    setor_responsavel_processo?: string | null
    vendedor_responsavel_processo?: string | null
    data_criacao_processo?: Date | string
    data_atualizacao_processo?: Date | string
  }

  export type HistoricoStatusProcessoCreateManyStatus_anteriorInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_novo_processo: string
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type HistoricoStatusProcessoCreateManyStatus_novoInput = {
    id_historico_status_processo?: string
    id_organizacao: string
    id_produto_gravity?: string | null
    id_processo: string
    id_status_anterior_processo?: string | null
    id_usuario_mudanca_status_processo?: string | null
    data_mudanca_status_processo?: Date | string
    observacao_mudanca_status_processo?: string | null
  }

  export type ProcessoUpdateWithoutStatus_atualInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutStatus_atualInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    historico_status?: HistoricoStatusProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    logistica?: LogisticaInternacionalProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    dados?: DadosProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    cambio?: CambioProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    estimativa?: EstimativaProcessoUncheckedUpdateOneWithoutProcessoNestedInput
    containers?: ContainerProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoProcessoUncheckedUpdateManyWithoutProcessoNestedInput
    follow_ups?: FollowUpProcessoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateManyWithoutStatus_atualInput = {
    id_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_workspace?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario?: NullableStringFieldUpdateOperationsInput | string | null
    numero_processo?: StringFieldUpdateOperationsInput | string
    tipo_operacao_processo?: StringFieldUpdateOperationsInput | string
    referencia_interna_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_importacao_exportador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_exportacao_importador_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_cotacao_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_proposta_bid_frete_internacional?: NullableStringFieldUpdateOperationsInput | string | null
    id_transito_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_operacao_cambio_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    responsavel_rotina_processo?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_responsavel_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_criacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    data_atualizacao_processo?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistoricoStatusProcessoUpdateWithoutStatus_anteriorInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoUpdateOneRequiredWithoutHistorico_statusNestedInput
    status_novo?: ProcessoStatusUpdateOneRequiredWithoutHistorico_novoNestedInput
  }

  export type HistoricoStatusProcessoUncheckedUpdateWithoutStatus_anteriorInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_anteriorInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_novo_processo?: StringFieldUpdateOperationsInput | string
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoUpdateWithoutStatus_novoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoUpdateOneRequiredWithoutHistorico_statusNestedInput
    status_anterior?: ProcessoStatusUpdateOneWithoutHistorico_anteriorNestedInput
  }

  export type HistoricoStatusProcessoUncheckedUpdateWithoutStatus_novoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HistoricoStatusProcessoUncheckedUpdateManyWithoutStatus_novoInput = {
    id_historico_status_processo?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
    id_produto_gravity?: NullableStringFieldUpdateOperationsInput | string | null
    id_processo?: StringFieldUpdateOperationsInput | string
    id_status_anterior_processo?: NullableStringFieldUpdateOperationsInput | string | null
    id_usuario_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
    data_mudanca_status_processo?: DateTimeFieldUpdateOperationsInput | Date | string
    observacao_mudanca_status_processo?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ProcessoCountOutputTypeDefaultArgs instead
     */
    export type ProcessoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoStatusCountOutputTypeDefaultArgs instead
     */
    export type ProcessoStatusCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoStatusCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoDefaultArgs instead
     */
    export type ProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoStatusDefaultArgs instead
     */
    export type ProcessoStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoStatusDefaultArgs<ExtArgs>
    /**
     * @deprecated Use HistoricoStatusProcessoDefaultArgs instead
     */
    export type HistoricoStatusProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = HistoricoStatusProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LogisticaInternacionalProcessoDefaultArgs instead
     */
    export type LogisticaInternacionalProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LogisticaInternacionalProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DadosProcessoDefaultArgs instead
     */
    export type DadosProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DadosProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CambioProcessoDefaultArgs instead
     */
    export type CambioProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CambioProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EstimativaProcessoDefaultArgs instead
     */
    export type EstimativaProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EstimativaProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DocumentoProcessoDefaultArgs instead
     */
    export type DocumentoProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DocumentoProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ContainerProcessoDefaultArgs instead
     */
    export type ContainerProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ContainerProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FollowUpProcessoDefaultArgs instead
     */
    export type FollowUpProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FollowUpProcessoDefaultArgs<ExtArgs>

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