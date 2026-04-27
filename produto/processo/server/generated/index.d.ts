
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
 * Model ProcessoGravity
 * 
 */
export type ProcessoGravity = $Result.DefaultSelection<Prisma.$ProcessoGravityPayload>
/**
 * Model ProcessoEtapas
 * 
 */
export type ProcessoEtapas = $Result.DefaultSelection<Prisma.$ProcessoEtapasPayload>
/**
 * Model ProcessoPedido
 * 
 */
export type ProcessoPedido = $Result.DefaultSelection<Prisma.$ProcessoPedidoPayload>
/**
 * Model ProcessoPedidoItens
 * 
 */
export type ProcessoPedidoItens = $Result.DefaultSelection<Prisma.$ProcessoPedidoItensPayload>
/**
 * Model ProcessoFollowup
 * 
 */
export type ProcessoFollowup = $Result.DefaultSelection<Prisma.$ProcessoFollowupPayload>
/**
 * Model ProcessoAnexos
 * 
 */
export type ProcessoAnexos = $Result.DefaultSelection<Prisma.$ProcessoAnexosPayload>
/**
 * Model ProcessoEstimativaCusto
 * 
 */
export type ProcessoEstimativaCusto = $Result.DefaultSelection<Prisma.$ProcessoEstimativaCustoPayload>
/**
 * Model ProcessoDadosTecnicos
 * 
 */
export type ProcessoDadosTecnicos = $Result.DefaultSelection<Prisma.$ProcessoDadosTecnicosPayload>
/**
 * Model ProcessoStatus
 * 
 */
export type ProcessoStatus = $Result.DefaultSelection<Prisma.$ProcessoStatusPayload>
/**
 * Model ProcessoColunas
 * 
 */
export type ProcessoColunas = $Result.DefaultSelection<Prisma.$ProcessoColunasPayload>
/**
 * Model ProcessosPedidoPreferencia
 * 
 */
export type ProcessosPedidoPreferencia = $Result.DefaultSelection<Prisma.$ProcessosPedidoPreferenciaPayload>
/**
 * Model ProcessoPedidoPadrao
 * 
 */
export type ProcessoPedidoPadrao = $Result.DefaultSelection<Prisma.$ProcessoPedidoPadraoPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ProcessoGravities
 * const processoGravities = await prisma.processoGravity.findMany()
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
   * // Fetch zero or more ProcessoGravities
   * const processoGravities = await prisma.processoGravity.findMany()
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
   * `prisma.processoGravity`: Exposes CRUD operations for the **ProcessoGravity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoGravities
    * const processoGravities = await prisma.processoGravity.findMany()
    * ```
    */
  get processoGravity(): Prisma.ProcessoGravityDelegate<ExtArgs>;

  /**
   * `prisma.processoEtapas`: Exposes CRUD operations for the **ProcessoEtapas** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoEtapas
    * const processoEtapas = await prisma.processoEtapas.findMany()
    * ```
    */
  get processoEtapas(): Prisma.ProcessoEtapasDelegate<ExtArgs>;

  /**
   * `prisma.processoPedido`: Exposes CRUD operations for the **ProcessoPedido** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoPedidos
    * const processoPedidos = await prisma.processoPedido.findMany()
    * ```
    */
  get processoPedido(): Prisma.ProcessoPedidoDelegate<ExtArgs>;

  /**
   * `prisma.processoPedidoItens`: Exposes CRUD operations for the **ProcessoPedidoItens** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoPedidoItens
    * const processoPedidoItens = await prisma.processoPedidoItens.findMany()
    * ```
    */
  get processoPedidoItens(): Prisma.ProcessoPedidoItensDelegate<ExtArgs>;

  /**
   * `prisma.processoFollowup`: Exposes CRUD operations for the **ProcessoFollowup** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoFollowups
    * const processoFollowups = await prisma.processoFollowup.findMany()
    * ```
    */
  get processoFollowup(): Prisma.ProcessoFollowupDelegate<ExtArgs>;

  /**
   * `prisma.processoAnexos`: Exposes CRUD operations for the **ProcessoAnexos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoAnexos
    * const processoAnexos = await prisma.processoAnexos.findMany()
    * ```
    */
  get processoAnexos(): Prisma.ProcessoAnexosDelegate<ExtArgs>;

  /**
   * `prisma.processoEstimativaCusto`: Exposes CRUD operations for the **ProcessoEstimativaCusto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoEstimativaCustos
    * const processoEstimativaCustos = await prisma.processoEstimativaCusto.findMany()
    * ```
    */
  get processoEstimativaCusto(): Prisma.ProcessoEstimativaCustoDelegate<ExtArgs>;

  /**
   * `prisma.processoDadosTecnicos`: Exposes CRUD operations for the **ProcessoDadosTecnicos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoDadosTecnicos
    * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findMany()
    * ```
    */
  get processoDadosTecnicos(): Prisma.ProcessoDadosTecnicosDelegate<ExtArgs>;

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
   * `prisma.processoColunas`: Exposes CRUD operations for the **ProcessoColunas** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoColunas
    * const processoColunas = await prisma.processoColunas.findMany()
    * ```
    */
  get processoColunas(): Prisma.ProcessoColunasDelegate<ExtArgs>;

  /**
   * `prisma.processosPedidoPreferencia`: Exposes CRUD operations for the **ProcessosPedidoPreferencia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessosPedidoPreferencias
    * const processosPedidoPreferencias = await prisma.processosPedidoPreferencia.findMany()
    * ```
    */
  get processosPedidoPreferencia(): Prisma.ProcessosPedidoPreferenciaDelegate<ExtArgs>;

  /**
   * `prisma.processoPedidoPadrao`: Exposes CRUD operations for the **ProcessoPedidoPadrao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoPedidoPadraos
    * const processoPedidoPadraos = await prisma.processoPedidoPadrao.findMany()
    * ```
    */
  get processoPedidoPadrao(): Prisma.ProcessoPedidoPadraoDelegate<ExtArgs>;
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "processoGravity" | "processoEtapas" | "processoPedido" | "processoPedidoItens" | "processoFollowup" | "processoAnexos" | "processoEstimativaCusto" | "processoDadosTecnicos" | "processoStatus" | "processoColunas" | "processosPedidoPreferencia" | "processoPedidoPadrao"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ProcessoGravity: {
        payload: Prisma.$ProcessoGravityPayload<ExtArgs>
        fields: Prisma.ProcessoGravityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoGravityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoGravityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          findFirst: {
            args: Prisma.ProcessoGravityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoGravityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          findMany: {
            args: Prisma.ProcessoGravityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>[]
          }
          create: {
            args: Prisma.ProcessoGravityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          createMany: {
            args: Prisma.ProcessoGravityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoGravityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>[]
          }
          delete: {
            args: Prisma.ProcessoGravityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          update: {
            args: Prisma.ProcessoGravityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoGravityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoGravityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoGravityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoGravityPayload>
          }
          aggregate: {
            args: Prisma.ProcessoGravityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoGravity>
          }
          groupBy: {
            args: Prisma.ProcessoGravityGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoGravityGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoGravityCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoGravityCountAggregateOutputType> | number
          }
        }
      }
      ProcessoEtapas: {
        payload: Prisma.$ProcessoEtapasPayload<ExtArgs>
        fields: Prisma.ProcessoEtapasFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoEtapasFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoEtapasFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          findFirst: {
            args: Prisma.ProcessoEtapasFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoEtapasFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          findMany: {
            args: Prisma.ProcessoEtapasFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>[]
          }
          create: {
            args: Prisma.ProcessoEtapasCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          createMany: {
            args: Prisma.ProcessoEtapasCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoEtapasCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>[]
          }
          delete: {
            args: Prisma.ProcessoEtapasDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          update: {
            args: Prisma.ProcessoEtapasUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoEtapasDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoEtapasUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoEtapasUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapasPayload>
          }
          aggregate: {
            args: Prisma.ProcessoEtapasAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoEtapas>
          }
          groupBy: {
            args: Prisma.ProcessoEtapasGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEtapasGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoEtapasCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEtapasCountAggregateOutputType> | number
          }
        }
      }
      ProcessoPedido: {
        payload: Prisma.$ProcessoPedidoPayload<ExtArgs>
        fields: Prisma.ProcessoPedidoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoPedidoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoPedidoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          findFirst: {
            args: Prisma.ProcessoPedidoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoPedidoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          findMany: {
            args: Prisma.ProcessoPedidoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>[]
          }
          create: {
            args: Prisma.ProcessoPedidoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          createMany: {
            args: Prisma.ProcessoPedidoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoPedidoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>[]
          }
          delete: {
            args: Prisma.ProcessoPedidoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          update: {
            args: Prisma.ProcessoPedidoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoPedidoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoPedidoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoPedidoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPayload>
          }
          aggregate: {
            args: Prisma.ProcessoPedidoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoPedido>
          }
          groupBy: {
            args: Prisma.ProcessoPedidoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoPedidoCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoCountAggregateOutputType> | number
          }
        }
      }
      ProcessoPedidoItens: {
        payload: Prisma.$ProcessoPedidoItensPayload<ExtArgs>
        fields: Prisma.ProcessoPedidoItensFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoPedidoItensFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoPedidoItensFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          findFirst: {
            args: Prisma.ProcessoPedidoItensFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoPedidoItensFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          findMany: {
            args: Prisma.ProcessoPedidoItensFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>[]
          }
          create: {
            args: Prisma.ProcessoPedidoItensCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          createMany: {
            args: Prisma.ProcessoPedidoItensCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoPedidoItensCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>[]
          }
          delete: {
            args: Prisma.ProcessoPedidoItensDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          update: {
            args: Prisma.ProcessoPedidoItensUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoPedidoItensDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoPedidoItensUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoPedidoItensUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoItensPayload>
          }
          aggregate: {
            args: Prisma.ProcessoPedidoItensAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoPedidoItens>
          }
          groupBy: {
            args: Prisma.ProcessoPedidoItensGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoItensGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoPedidoItensCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoItensCountAggregateOutputType> | number
          }
        }
      }
      ProcessoFollowup: {
        payload: Prisma.$ProcessoFollowupPayload<ExtArgs>
        fields: Prisma.ProcessoFollowupFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoFollowupFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoFollowupFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          findFirst: {
            args: Prisma.ProcessoFollowupFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoFollowupFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          findMany: {
            args: Prisma.ProcessoFollowupFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>[]
          }
          create: {
            args: Prisma.ProcessoFollowupCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          createMany: {
            args: Prisma.ProcessoFollowupCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoFollowupCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>[]
          }
          delete: {
            args: Prisma.ProcessoFollowupDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          update: {
            args: Prisma.ProcessoFollowupUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoFollowupDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoFollowupUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoFollowupUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoFollowupPayload>
          }
          aggregate: {
            args: Prisma.ProcessoFollowupAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoFollowup>
          }
          groupBy: {
            args: Prisma.ProcessoFollowupGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoFollowupGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoFollowupCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoFollowupCountAggregateOutputType> | number
          }
        }
      }
      ProcessoAnexos: {
        payload: Prisma.$ProcessoAnexosPayload<ExtArgs>
        fields: Prisma.ProcessoAnexosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoAnexosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoAnexosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          findFirst: {
            args: Prisma.ProcessoAnexosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoAnexosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          findMany: {
            args: Prisma.ProcessoAnexosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>[]
          }
          create: {
            args: Prisma.ProcessoAnexosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          createMany: {
            args: Prisma.ProcessoAnexosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoAnexosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>[]
          }
          delete: {
            args: Prisma.ProcessoAnexosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          update: {
            args: Prisma.ProcessoAnexosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoAnexosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoAnexosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoAnexosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoAnexosPayload>
          }
          aggregate: {
            args: Prisma.ProcessoAnexosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoAnexos>
          }
          groupBy: {
            args: Prisma.ProcessoAnexosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoAnexosGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoAnexosCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoAnexosCountAggregateOutputType> | number
          }
        }
      }
      ProcessoEstimativaCusto: {
        payload: Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>
        fields: Prisma.ProcessoEstimativaCustoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoEstimativaCustoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoEstimativaCustoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          findFirst: {
            args: Prisma.ProcessoEstimativaCustoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoEstimativaCustoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          findMany: {
            args: Prisma.ProcessoEstimativaCustoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>[]
          }
          create: {
            args: Prisma.ProcessoEstimativaCustoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          createMany: {
            args: Prisma.ProcessoEstimativaCustoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoEstimativaCustoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>[]
          }
          delete: {
            args: Prisma.ProcessoEstimativaCustoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          update: {
            args: Prisma.ProcessoEstimativaCustoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoEstimativaCustoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoEstimativaCustoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoEstimativaCustoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEstimativaCustoPayload>
          }
          aggregate: {
            args: Prisma.ProcessoEstimativaCustoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoEstimativaCusto>
          }
          groupBy: {
            args: Prisma.ProcessoEstimativaCustoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEstimativaCustoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoEstimativaCustoCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEstimativaCustoCountAggregateOutputType> | number
          }
        }
      }
      ProcessoDadosTecnicos: {
        payload: Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>
        fields: Prisma.ProcessoDadosTecnicosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoDadosTecnicosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoDadosTecnicosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          findFirst: {
            args: Prisma.ProcessoDadosTecnicosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoDadosTecnicosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          findMany: {
            args: Prisma.ProcessoDadosTecnicosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>[]
          }
          create: {
            args: Prisma.ProcessoDadosTecnicosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          createMany: {
            args: Prisma.ProcessoDadosTecnicosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoDadosTecnicosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>[]
          }
          delete: {
            args: Prisma.ProcessoDadosTecnicosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          update: {
            args: Prisma.ProcessoDadosTecnicosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoDadosTecnicosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoDadosTecnicosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoDadosTecnicosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoDadosTecnicosPayload>
          }
          aggregate: {
            args: Prisma.ProcessoDadosTecnicosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoDadosTecnicos>
          }
          groupBy: {
            args: Prisma.ProcessoDadosTecnicosGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoDadosTecnicosGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoDadosTecnicosCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoDadosTecnicosCountAggregateOutputType> | number
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
      ProcessoColunas: {
        payload: Prisma.$ProcessoColunasPayload<ExtArgs>
        fields: Prisma.ProcessoColunasFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoColunasFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoColunasFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          findFirst: {
            args: Prisma.ProcessoColunasFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoColunasFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          findMany: {
            args: Prisma.ProcessoColunasFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>[]
          }
          create: {
            args: Prisma.ProcessoColunasCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          createMany: {
            args: Prisma.ProcessoColunasCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoColunasCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>[]
          }
          delete: {
            args: Prisma.ProcessoColunasDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          update: {
            args: Prisma.ProcessoColunasUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoColunasDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoColunasUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoColunasUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoColunasPayload>
          }
          aggregate: {
            args: Prisma.ProcessoColunasAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoColunas>
          }
          groupBy: {
            args: Prisma.ProcessoColunasGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoColunasGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoColunasCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoColunasCountAggregateOutputType> | number
          }
        }
      }
      ProcessosPedidoPreferencia: {
        payload: Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>
        fields: Prisma.ProcessosPedidoPreferenciaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessosPedidoPreferenciaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessosPedidoPreferenciaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          findFirst: {
            args: Prisma.ProcessosPedidoPreferenciaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessosPedidoPreferenciaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          findMany: {
            args: Prisma.ProcessosPedidoPreferenciaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>[]
          }
          create: {
            args: Prisma.ProcessosPedidoPreferenciaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          createMany: {
            args: Prisma.ProcessosPedidoPreferenciaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessosPedidoPreferenciaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>[]
          }
          delete: {
            args: Prisma.ProcessosPedidoPreferenciaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          update: {
            args: Prisma.ProcessosPedidoPreferenciaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          deleteMany: {
            args: Prisma.ProcessosPedidoPreferenciaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessosPedidoPreferenciaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessosPedidoPreferenciaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessosPedidoPreferenciaPayload>
          }
          aggregate: {
            args: Prisma.ProcessosPedidoPreferenciaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessosPedidoPreferencia>
          }
          groupBy: {
            args: Prisma.ProcessosPedidoPreferenciaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessosPedidoPreferenciaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessosPedidoPreferenciaCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessosPedidoPreferenciaCountAggregateOutputType> | number
          }
        }
      }
      ProcessoPedidoPadrao: {
        payload: Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>
        fields: Prisma.ProcessoPedidoPadraoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoPedidoPadraoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoPedidoPadraoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          findFirst: {
            args: Prisma.ProcessoPedidoPadraoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoPedidoPadraoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          findMany: {
            args: Prisma.ProcessoPedidoPadraoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>[]
          }
          create: {
            args: Prisma.ProcessoPedidoPadraoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          createMany: {
            args: Prisma.ProcessoPedidoPadraoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoPedidoPadraoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>[]
          }
          delete: {
            args: Prisma.ProcessoPedidoPadraoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          update: {
            args: Prisma.ProcessoPedidoPadraoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoPedidoPadraoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoPedidoPadraoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoPedidoPadraoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPedidoPadraoPayload>
          }
          aggregate: {
            args: Prisma.ProcessoPedidoPadraoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoPedidoPadrao>
          }
          groupBy: {
            args: Prisma.ProcessoPedidoPadraoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoPadraoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoPedidoPadraoCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoPedidoPadraoCountAggregateOutputType> | number
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
   * Count Type ProcessoGravityCountOutputType
   */

  export type ProcessoGravityCountOutputType = {
    etapas: number
    pedidos: number
    followUps: number
    documentos: number
  }

  export type ProcessoGravityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etapas?: boolean | ProcessoGravityCountOutputTypeCountEtapasArgs
    pedidos?: boolean | ProcessoGravityCountOutputTypeCountPedidosArgs
    followUps?: boolean | ProcessoGravityCountOutputTypeCountFollowUpsArgs
    documentos?: boolean | ProcessoGravityCountOutputTypeCountDocumentosArgs
  }

  // Custom InputTypes
  /**
   * ProcessoGravityCountOutputType without action
   */
  export type ProcessoGravityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravityCountOutputType
     */
    select?: ProcessoGravityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProcessoGravityCountOutputType without action
   */
  export type ProcessoGravityCountOutputTypeCountEtapasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoEtapasWhereInput
  }

  /**
   * ProcessoGravityCountOutputType without action
   */
  export type ProcessoGravityCountOutputTypeCountPedidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoPedidoWhereInput
  }

  /**
   * ProcessoGravityCountOutputType without action
   */
  export type ProcessoGravityCountOutputTypeCountFollowUpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoFollowupWhereInput
  }

  /**
   * ProcessoGravityCountOutputType without action
   */
  export type ProcessoGravityCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoAnexosWhereInput
  }


  /**
   * Count Type ProcessoPedidoCountOutputType
   */

  export type ProcessoPedidoCountOutputType = {
    itens: number
  }

  export type ProcessoPedidoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itens?: boolean | ProcessoPedidoCountOutputTypeCountItensArgs
  }

  // Custom InputTypes
  /**
   * ProcessoPedidoCountOutputType without action
   */
  export type ProcessoPedidoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoCountOutputType
     */
    select?: ProcessoPedidoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProcessoPedidoCountOutputType without action
   */
  export type ProcessoPedidoCountOutputTypeCountItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoPedidoItensWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ProcessoGravity
   */

  export type AggregateProcessoGravity = {
    _count: ProcessoGravityCountAggregateOutputType | null
    _min: ProcessoGravityMinAggregateOutputType | null
    _max: ProcessoGravityMaxAggregateOutputType | null
  }

  export type ProcessoGravityMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    numero: string | null
    referencia_interna: string | null
    referencia_dati: string | null
    status: string | null
    tipo: string | null
    responsavel_id: string | null
    vendedor_id: string | null
    setor_responsavel: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoGravityMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    numero: string | null
    referencia_interna: string | null
    referencia_dati: string | null
    status: string | null
    tipo: string | null
    responsavel_id: string | null
    vendedor_id: string | null
    setor_responsavel: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoGravityCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    numero: number
    referencia_interna: number
    referencia_dati: number
    status: number
    tipo: number
    responsavel_id: number
    vendedor_id: number
    setor_responsavel: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProcessoGravityMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    numero?: true
    referencia_interna?: true
    referencia_dati?: true
    status?: true
    tipo?: true
    responsavel_id?: true
    vendedor_id?: true
    setor_responsavel?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoGravityMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    numero?: true
    referencia_interna?: true
    referencia_dati?: true
    status?: true
    tipo?: true
    responsavel_id?: true
    vendedor_id?: true
    setor_responsavel?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoGravityCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    numero?: true
    referencia_interna?: true
    referencia_dati?: true
    status?: true
    tipo?: true
    responsavel_id?: true
    vendedor_id?: true
    setor_responsavel?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessoGravityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoGravity to aggregate.
     */
    where?: ProcessoGravityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoGravities to fetch.
     */
    orderBy?: ProcessoGravityOrderByWithRelationInput | ProcessoGravityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoGravityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoGravities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoGravities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoGravities
    **/
    _count?: true | ProcessoGravityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoGravityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoGravityMaxAggregateInputType
  }

  export type GetProcessoGravityAggregateType<T extends ProcessoGravityAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoGravity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoGravity[P]>
      : GetScalarType<T[P], AggregateProcessoGravity[P]>
  }




  export type ProcessoGravityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoGravityWhereInput
    orderBy?: ProcessoGravityOrderByWithAggregationInput | ProcessoGravityOrderByWithAggregationInput[]
    by: ProcessoGravityScalarFieldEnum[] | ProcessoGravityScalarFieldEnum
    having?: ProcessoGravityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoGravityCountAggregateInputType | true
    _min?: ProcessoGravityMinAggregateInputType
    _max?: ProcessoGravityMaxAggregateInputType
  }

  export type ProcessoGravityGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    numero: string
    referencia_interna: string | null
    referencia_dati: string | null
    status: string
    tipo: string
    responsavel_id: string | null
    vendedor_id: string | null
    setor_responsavel: string | null
    created_at: Date
    updated_at: Date
    _count: ProcessoGravityCountAggregateOutputType | null
    _min: ProcessoGravityMinAggregateOutputType | null
    _max: ProcessoGravityMaxAggregateOutputType | null
  }

  type GetProcessoGravityGroupByPayload<T extends ProcessoGravityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoGravityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoGravityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoGravityGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoGravityGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoGravitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    numero?: boolean
    referencia_interna?: boolean
    referencia_dati?: boolean
    status?: boolean
    tipo?: boolean
    responsavel_id?: boolean
    vendedor_id?: boolean
    setor_responsavel?: boolean
    created_at?: boolean
    updated_at?: boolean
    etapas?: boolean | ProcessoGravity$etapasArgs<ExtArgs>
    pedidos?: boolean | ProcessoGravity$pedidosArgs<ExtArgs>
    followUps?: boolean | ProcessoGravity$followUpsArgs<ExtArgs>
    documentos?: boolean | ProcessoGravity$documentosArgs<ExtArgs>
    estimativaCusto?: boolean | ProcessoGravity$estimativaCustoArgs<ExtArgs>
    dadosTecnicos?: boolean | ProcessoGravity$dadosTecnicosArgs<ExtArgs>
    _count?: boolean | ProcessoGravityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoGravity"]>

  export type ProcessoGravitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    numero?: boolean
    referencia_interna?: boolean
    referencia_dati?: boolean
    status?: boolean
    tipo?: boolean
    responsavel_id?: boolean
    vendedor_id?: boolean
    setor_responsavel?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoGravity"]>

  export type ProcessoGravitySelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    numero?: boolean
    referencia_interna?: boolean
    referencia_dati?: boolean
    status?: boolean
    tipo?: boolean
    responsavel_id?: boolean
    vendedor_id?: boolean
    setor_responsavel?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProcessoGravityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etapas?: boolean | ProcessoGravity$etapasArgs<ExtArgs>
    pedidos?: boolean | ProcessoGravity$pedidosArgs<ExtArgs>
    followUps?: boolean | ProcessoGravity$followUpsArgs<ExtArgs>
    documentos?: boolean | ProcessoGravity$documentosArgs<ExtArgs>
    estimativaCusto?: boolean | ProcessoGravity$estimativaCustoArgs<ExtArgs>
    dadosTecnicos?: boolean | ProcessoGravity$dadosTecnicosArgs<ExtArgs>
    _count?: boolean | ProcessoGravityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoGravityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProcessoGravityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoGravity"
    objects: {
      etapas: Prisma.$ProcessoEtapasPayload<ExtArgs>[]
      pedidos: Prisma.$ProcessoPedidoPayload<ExtArgs>[]
      followUps: Prisma.$ProcessoFollowupPayload<ExtArgs>[]
      documentos: Prisma.$ProcessoAnexosPayload<ExtArgs>[]
      estimativaCusto: Prisma.$ProcessoEstimativaCustoPayload<ExtArgs> | null
      dadosTecnicos: Prisma.$ProcessoDadosTecnicosPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      numero: string
      referencia_interna: string | null
      referencia_dati: string | null
      status: string
      tipo: string
      responsavel_id: string | null
      vendedor_id: string | null
      setor_responsavel: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["processoGravity"]>
    composites: {}
  }

  type ProcessoGravityGetPayload<S extends boolean | null | undefined | ProcessoGravityDefaultArgs> = $Result.GetResult<Prisma.$ProcessoGravityPayload, S>

  type ProcessoGravityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoGravityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoGravityCountAggregateInputType | true
    }

  export interface ProcessoGravityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoGravity'], meta: { name: 'ProcessoGravity' } }
    /**
     * Find zero or one ProcessoGravity that matches the filter.
     * @param {ProcessoGravityFindUniqueArgs} args - Arguments to find a ProcessoGravity
     * @example
     * // Get one ProcessoGravity
     * const processoGravity = await prisma.processoGravity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoGravityFindUniqueArgs>(args: SelectSubset<T, ProcessoGravityFindUniqueArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoGravity that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoGravityFindUniqueOrThrowArgs} args - Arguments to find a ProcessoGravity
     * @example
     * // Get one ProcessoGravity
     * const processoGravity = await prisma.processoGravity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoGravityFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoGravityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoGravity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityFindFirstArgs} args - Arguments to find a ProcessoGravity
     * @example
     * // Get one ProcessoGravity
     * const processoGravity = await prisma.processoGravity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoGravityFindFirstArgs>(args?: SelectSubset<T, ProcessoGravityFindFirstArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoGravity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityFindFirstOrThrowArgs} args - Arguments to find a ProcessoGravity
     * @example
     * // Get one ProcessoGravity
     * const processoGravity = await prisma.processoGravity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoGravityFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoGravityFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoGravities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoGravities
     * const processoGravities = await prisma.processoGravity.findMany()
     * 
     * // Get first 10 ProcessoGravities
     * const processoGravities = await prisma.processoGravity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoGravityWithIdOnly = await prisma.processoGravity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoGravityFindManyArgs>(args?: SelectSubset<T, ProcessoGravityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoGravity.
     * @param {ProcessoGravityCreateArgs} args - Arguments to create a ProcessoGravity.
     * @example
     * // Create one ProcessoGravity
     * const ProcessoGravity = await prisma.processoGravity.create({
     *   data: {
     *     // ... data to create a ProcessoGravity
     *   }
     * })
     * 
     */
    create<T extends ProcessoGravityCreateArgs>(args: SelectSubset<T, ProcessoGravityCreateArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoGravities.
     * @param {ProcessoGravityCreateManyArgs} args - Arguments to create many ProcessoGravities.
     * @example
     * // Create many ProcessoGravities
     * const processoGravity = await prisma.processoGravity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoGravityCreateManyArgs>(args?: SelectSubset<T, ProcessoGravityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoGravities and returns the data saved in the database.
     * @param {ProcessoGravityCreateManyAndReturnArgs} args - Arguments to create many ProcessoGravities.
     * @example
     * // Create many ProcessoGravities
     * const processoGravity = await prisma.processoGravity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoGravities and only return the `id`
     * const processoGravityWithIdOnly = await prisma.processoGravity.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoGravityCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoGravityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoGravity.
     * @param {ProcessoGravityDeleteArgs} args - Arguments to delete one ProcessoGravity.
     * @example
     * // Delete one ProcessoGravity
     * const ProcessoGravity = await prisma.processoGravity.delete({
     *   where: {
     *     // ... filter to delete one ProcessoGravity
     *   }
     * })
     * 
     */
    delete<T extends ProcessoGravityDeleteArgs>(args: SelectSubset<T, ProcessoGravityDeleteArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoGravity.
     * @param {ProcessoGravityUpdateArgs} args - Arguments to update one ProcessoGravity.
     * @example
     * // Update one ProcessoGravity
     * const processoGravity = await prisma.processoGravity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoGravityUpdateArgs>(args: SelectSubset<T, ProcessoGravityUpdateArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoGravities.
     * @param {ProcessoGravityDeleteManyArgs} args - Arguments to filter ProcessoGravities to delete.
     * @example
     * // Delete a few ProcessoGravities
     * const { count } = await prisma.processoGravity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoGravityDeleteManyArgs>(args?: SelectSubset<T, ProcessoGravityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoGravities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoGravities
     * const processoGravity = await prisma.processoGravity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoGravityUpdateManyArgs>(args: SelectSubset<T, ProcessoGravityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoGravity.
     * @param {ProcessoGravityUpsertArgs} args - Arguments to update or create a ProcessoGravity.
     * @example
     * // Update or create a ProcessoGravity
     * const processoGravity = await prisma.processoGravity.upsert({
     *   create: {
     *     // ... data to create a ProcessoGravity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoGravity we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoGravityUpsertArgs>(args: SelectSubset<T, ProcessoGravityUpsertArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoGravities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityCountArgs} args - Arguments to filter ProcessoGravities to count.
     * @example
     * // Count the number of ProcessoGravities
     * const count = await prisma.processoGravity.count({
     *   where: {
     *     // ... the filter for the ProcessoGravities we want to count
     *   }
     * })
    **/
    count<T extends ProcessoGravityCountArgs>(
      args?: Subset<T, ProcessoGravityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoGravityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoGravity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoGravityAggregateArgs>(args: Subset<T, ProcessoGravityAggregateArgs>): Prisma.PrismaPromise<GetProcessoGravityAggregateType<T>>

    /**
     * Group by ProcessoGravity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGravityGroupByArgs} args - Group by arguments.
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
      T extends ProcessoGravityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoGravityGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoGravityGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoGravityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoGravityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoGravity model
   */
  readonly fields: ProcessoGravityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoGravity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoGravityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    etapas<T extends ProcessoGravity$etapasArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$etapasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findMany"> | Null>
    pedidos<T extends ProcessoGravity$pedidosArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$pedidosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findMany"> | Null>
    followUps<T extends ProcessoGravity$followUpsArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$followUpsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findMany"> | Null>
    documentos<T extends ProcessoGravity$documentosArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findMany"> | Null>
    estimativaCusto<T extends ProcessoGravity$estimativaCustoArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$estimativaCustoArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dadosTecnicos<T extends ProcessoGravity$dadosTecnicosArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravity$dadosTecnicosArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
   * Fields of the ProcessoGravity model
   */ 
  interface ProcessoGravityFieldRefs {
    readonly id: FieldRef<"ProcessoGravity", 'String'>
    readonly tenant_id: FieldRef<"ProcessoGravity", 'String'>
    readonly product_id: FieldRef<"ProcessoGravity", 'String'>
    readonly user_id: FieldRef<"ProcessoGravity", 'String'>
    readonly numero: FieldRef<"ProcessoGravity", 'String'>
    readonly referencia_interna: FieldRef<"ProcessoGravity", 'String'>
    readonly referencia_dati: FieldRef<"ProcessoGravity", 'String'>
    readonly status: FieldRef<"ProcessoGravity", 'String'>
    readonly tipo: FieldRef<"ProcessoGravity", 'String'>
    readonly responsavel_id: FieldRef<"ProcessoGravity", 'String'>
    readonly vendedor_id: FieldRef<"ProcessoGravity", 'String'>
    readonly setor_responsavel: FieldRef<"ProcessoGravity", 'String'>
    readonly created_at: FieldRef<"ProcessoGravity", 'DateTime'>
    readonly updated_at: FieldRef<"ProcessoGravity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoGravity findUnique
   */
  export type ProcessoGravityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoGravity to fetch.
     */
    where: ProcessoGravityWhereUniqueInput
  }

  /**
   * ProcessoGravity findUniqueOrThrow
   */
  export type ProcessoGravityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoGravity to fetch.
     */
    where: ProcessoGravityWhereUniqueInput
  }

  /**
   * ProcessoGravity findFirst
   */
  export type ProcessoGravityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoGravity to fetch.
     */
    where?: ProcessoGravityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoGravities to fetch.
     */
    orderBy?: ProcessoGravityOrderByWithRelationInput | ProcessoGravityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoGravities.
     */
    cursor?: ProcessoGravityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoGravities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoGravities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoGravities.
     */
    distinct?: ProcessoGravityScalarFieldEnum | ProcessoGravityScalarFieldEnum[]
  }

  /**
   * ProcessoGravity findFirstOrThrow
   */
  export type ProcessoGravityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoGravity to fetch.
     */
    where?: ProcessoGravityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoGravities to fetch.
     */
    orderBy?: ProcessoGravityOrderByWithRelationInput | ProcessoGravityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoGravities.
     */
    cursor?: ProcessoGravityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoGravities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoGravities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoGravities.
     */
    distinct?: ProcessoGravityScalarFieldEnum | ProcessoGravityScalarFieldEnum[]
  }

  /**
   * ProcessoGravity findMany
   */
  export type ProcessoGravityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoGravities to fetch.
     */
    where?: ProcessoGravityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoGravities to fetch.
     */
    orderBy?: ProcessoGravityOrderByWithRelationInput | ProcessoGravityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoGravities.
     */
    cursor?: ProcessoGravityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoGravities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoGravities.
     */
    skip?: number
    distinct?: ProcessoGravityScalarFieldEnum | ProcessoGravityScalarFieldEnum[]
  }

  /**
   * ProcessoGravity create
   */
  export type ProcessoGravityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoGravity.
     */
    data: XOR<ProcessoGravityCreateInput, ProcessoGravityUncheckedCreateInput>
  }

  /**
   * ProcessoGravity createMany
   */
  export type ProcessoGravityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoGravities.
     */
    data: ProcessoGravityCreateManyInput | ProcessoGravityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoGravity createManyAndReturn
   */
  export type ProcessoGravityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoGravities.
     */
    data: ProcessoGravityCreateManyInput | ProcessoGravityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoGravity update
   */
  export type ProcessoGravityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoGravity.
     */
    data: XOR<ProcessoGravityUpdateInput, ProcessoGravityUncheckedUpdateInput>
    /**
     * Choose, which ProcessoGravity to update.
     */
    where: ProcessoGravityWhereUniqueInput
  }

  /**
   * ProcessoGravity updateMany
   */
  export type ProcessoGravityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoGravities.
     */
    data: XOR<ProcessoGravityUpdateManyMutationInput, ProcessoGravityUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoGravities to update
     */
    where?: ProcessoGravityWhereInput
  }

  /**
   * ProcessoGravity upsert
   */
  export type ProcessoGravityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoGravity to update in case it exists.
     */
    where: ProcessoGravityWhereUniqueInput
    /**
     * In case the ProcessoGravity found by the `where` argument doesn't exist, create a new ProcessoGravity with this data.
     */
    create: XOR<ProcessoGravityCreateInput, ProcessoGravityUncheckedCreateInput>
    /**
     * In case the ProcessoGravity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoGravityUpdateInput, ProcessoGravityUncheckedUpdateInput>
  }

  /**
   * ProcessoGravity delete
   */
  export type ProcessoGravityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
    /**
     * Filter which ProcessoGravity to delete.
     */
    where: ProcessoGravityWhereUniqueInput
  }

  /**
   * ProcessoGravity deleteMany
   */
  export type ProcessoGravityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoGravities to delete
     */
    where?: ProcessoGravityWhereInput
  }

  /**
   * ProcessoGravity.etapas
   */
  export type ProcessoGravity$etapasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    where?: ProcessoEtapasWhereInput
    orderBy?: ProcessoEtapasOrderByWithRelationInput | ProcessoEtapasOrderByWithRelationInput[]
    cursor?: ProcessoEtapasWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoEtapasScalarFieldEnum | ProcessoEtapasScalarFieldEnum[]
  }

  /**
   * ProcessoGravity.pedidos
   */
  export type ProcessoGravity$pedidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    where?: ProcessoPedidoWhereInput
    orderBy?: ProcessoPedidoOrderByWithRelationInput | ProcessoPedidoOrderByWithRelationInput[]
    cursor?: ProcessoPedidoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoPedidoScalarFieldEnum | ProcessoPedidoScalarFieldEnum[]
  }

  /**
   * ProcessoGravity.followUps
   */
  export type ProcessoGravity$followUpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    where?: ProcessoFollowupWhereInput
    orderBy?: ProcessoFollowupOrderByWithRelationInput | ProcessoFollowupOrderByWithRelationInput[]
    cursor?: ProcessoFollowupWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoFollowupScalarFieldEnum | ProcessoFollowupScalarFieldEnum[]
  }

  /**
   * ProcessoGravity.documentos
   */
  export type ProcessoGravity$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    where?: ProcessoAnexosWhereInput
    orderBy?: ProcessoAnexosOrderByWithRelationInput | ProcessoAnexosOrderByWithRelationInput[]
    cursor?: ProcessoAnexosWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoAnexosScalarFieldEnum | ProcessoAnexosScalarFieldEnum[]
  }

  /**
   * ProcessoGravity.estimativaCusto
   */
  export type ProcessoGravity$estimativaCustoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    where?: ProcessoEstimativaCustoWhereInput
  }

  /**
   * ProcessoGravity.dadosTecnicos
   */
  export type ProcessoGravity$dadosTecnicosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    where?: ProcessoDadosTecnicosWhereInput
  }

  /**
   * ProcessoGravity without action
   */
  export type ProcessoGravityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoGravity
     */
    select?: ProcessoGravitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoGravityInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoEtapas
   */

  export type AggregateProcessoEtapas = {
    _count: ProcessoEtapasCountAggregateOutputType | null
    _min: ProcessoEtapasMinAggregateOutputType | null
    _max: ProcessoEtapasMaxAggregateOutputType | null
  }

  export type ProcessoEtapasMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    nome: string | null
    status: string | null
    data_prevista: Date | null
    data_realizada: Date | null
    observacao: string | null
  }

  export type ProcessoEtapasMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    nome: string | null
    status: string | null
    data_prevista: Date | null
    data_realizada: Date | null
    observacao: string | null
  }

  export type ProcessoEtapasCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    nome: number
    status: number
    data_prevista: number
    data_realizada: number
    observacao: number
    _all: number
  }


  export type ProcessoEtapasMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    status?: true
    data_prevista?: true
    data_realizada?: true
    observacao?: true
  }

  export type ProcessoEtapasMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    status?: true
    data_prevista?: true
    data_realizada?: true
    observacao?: true
  }

  export type ProcessoEtapasCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    status?: true
    data_prevista?: true
    data_realizada?: true
    observacao?: true
    _all?: true
  }

  export type ProcessoEtapasAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEtapas to aggregate.
     */
    where?: ProcessoEtapasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapasOrderByWithRelationInput | ProcessoEtapasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoEtapasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEtapas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEtapas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoEtapas
    **/
    _count?: true | ProcessoEtapasCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoEtapasMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoEtapasMaxAggregateInputType
  }

  export type GetProcessoEtapasAggregateType<T extends ProcessoEtapasAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoEtapas]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoEtapas[P]>
      : GetScalarType<T[P], AggregateProcessoEtapas[P]>
  }




  export type ProcessoEtapasGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoEtapasWhereInput
    orderBy?: ProcessoEtapasOrderByWithAggregationInput | ProcessoEtapasOrderByWithAggregationInput[]
    by: ProcessoEtapasScalarFieldEnum[] | ProcessoEtapasScalarFieldEnum
    having?: ProcessoEtapasScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoEtapasCountAggregateInputType | true
    _min?: ProcessoEtapasMinAggregateInputType
    _max?: ProcessoEtapasMaxAggregateInputType
  }

  export type ProcessoEtapasGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    nome: string
    status: string
    data_prevista: Date | null
    data_realizada: Date | null
    observacao: string | null
    _count: ProcessoEtapasCountAggregateOutputType | null
    _min: ProcessoEtapasMinAggregateOutputType | null
    _max: ProcessoEtapasMaxAggregateOutputType | null
  }

  type GetProcessoEtapasGroupByPayload<T extends ProcessoEtapasGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoEtapasGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoEtapasGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoEtapasGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoEtapasGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoEtapasSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    status?: boolean
    data_prevista?: boolean
    data_realizada?: boolean
    observacao?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEtapas"]>

  export type ProcessoEtapasSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    status?: boolean
    data_prevista?: boolean
    data_realizada?: boolean
    observacao?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEtapas"]>

  export type ProcessoEtapasSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    status?: boolean
    data_prevista?: boolean
    data_realizada?: boolean
    observacao?: boolean
  }

  export type ProcessoEtapasInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }
  export type ProcessoEtapasIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoEtapasPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoEtapas"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      nome: string
      status: string
      data_prevista: Date | null
      data_realizada: Date | null
      observacao: string | null
    }, ExtArgs["result"]["processoEtapas"]>
    composites: {}
  }

  type ProcessoEtapasGetPayload<S extends boolean | null | undefined | ProcessoEtapasDefaultArgs> = $Result.GetResult<Prisma.$ProcessoEtapasPayload, S>

  type ProcessoEtapasCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoEtapasFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoEtapasCountAggregateInputType | true
    }

  export interface ProcessoEtapasDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoEtapas'], meta: { name: 'ProcessoEtapas' } }
    /**
     * Find zero or one ProcessoEtapas that matches the filter.
     * @param {ProcessoEtapasFindUniqueArgs} args - Arguments to find a ProcessoEtapas
     * @example
     * // Get one ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoEtapasFindUniqueArgs>(args: SelectSubset<T, ProcessoEtapasFindUniqueArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoEtapas that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoEtapasFindUniqueOrThrowArgs} args - Arguments to find a ProcessoEtapas
     * @example
     * // Get one ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoEtapasFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoEtapasFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoEtapas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasFindFirstArgs} args - Arguments to find a ProcessoEtapas
     * @example
     * // Get one ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoEtapasFindFirstArgs>(args?: SelectSubset<T, ProcessoEtapasFindFirstArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoEtapas that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasFindFirstOrThrowArgs} args - Arguments to find a ProcessoEtapas
     * @example
     * // Get one ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoEtapasFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoEtapasFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoEtapas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findMany()
     * 
     * // Get first 10 ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoEtapasWithIdOnly = await prisma.processoEtapas.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoEtapasFindManyArgs>(args?: SelectSubset<T, ProcessoEtapasFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoEtapas.
     * @param {ProcessoEtapasCreateArgs} args - Arguments to create a ProcessoEtapas.
     * @example
     * // Create one ProcessoEtapas
     * const ProcessoEtapas = await prisma.processoEtapas.create({
     *   data: {
     *     // ... data to create a ProcessoEtapas
     *   }
     * })
     * 
     */
    create<T extends ProcessoEtapasCreateArgs>(args: SelectSubset<T, ProcessoEtapasCreateArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoEtapas.
     * @param {ProcessoEtapasCreateManyArgs} args - Arguments to create many ProcessoEtapas.
     * @example
     * // Create many ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoEtapasCreateManyArgs>(args?: SelectSubset<T, ProcessoEtapasCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoEtapas and returns the data saved in the database.
     * @param {ProcessoEtapasCreateManyAndReturnArgs} args - Arguments to create many ProcessoEtapas.
     * @example
     * // Create many ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoEtapas and only return the `id`
     * const processoEtapasWithIdOnly = await prisma.processoEtapas.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoEtapasCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoEtapasCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoEtapas.
     * @param {ProcessoEtapasDeleteArgs} args - Arguments to delete one ProcessoEtapas.
     * @example
     * // Delete one ProcessoEtapas
     * const ProcessoEtapas = await prisma.processoEtapas.delete({
     *   where: {
     *     // ... filter to delete one ProcessoEtapas
     *   }
     * })
     * 
     */
    delete<T extends ProcessoEtapasDeleteArgs>(args: SelectSubset<T, ProcessoEtapasDeleteArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoEtapas.
     * @param {ProcessoEtapasUpdateArgs} args - Arguments to update one ProcessoEtapas.
     * @example
     * // Update one ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoEtapasUpdateArgs>(args: SelectSubset<T, ProcessoEtapasUpdateArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoEtapas.
     * @param {ProcessoEtapasDeleteManyArgs} args - Arguments to filter ProcessoEtapas to delete.
     * @example
     * // Delete a few ProcessoEtapas
     * const { count } = await prisma.processoEtapas.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoEtapasDeleteManyArgs>(args?: SelectSubset<T, ProcessoEtapasDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoEtapasUpdateManyArgs>(args: SelectSubset<T, ProcessoEtapasUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoEtapas.
     * @param {ProcessoEtapasUpsertArgs} args - Arguments to update or create a ProcessoEtapas.
     * @example
     * // Update or create a ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapas.upsert({
     *   create: {
     *     // ... data to create a ProcessoEtapas
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoEtapas we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoEtapasUpsertArgs>(args: SelectSubset<T, ProcessoEtapasUpsertArgs<ExtArgs>>): Prisma__ProcessoEtapasClient<$Result.GetResult<Prisma.$ProcessoEtapasPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasCountArgs} args - Arguments to filter ProcessoEtapas to count.
     * @example
     * // Count the number of ProcessoEtapas
     * const count = await prisma.processoEtapas.count({
     *   where: {
     *     // ... the filter for the ProcessoEtapas we want to count
     *   }
     * })
    **/
    count<T extends ProcessoEtapasCountArgs>(
      args?: Subset<T, ProcessoEtapasCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoEtapasCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoEtapasAggregateArgs>(args: Subset<T, ProcessoEtapasAggregateArgs>): Prisma.PrismaPromise<GetProcessoEtapasAggregateType<T>>

    /**
     * Group by ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapasGroupByArgs} args - Group by arguments.
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
      T extends ProcessoEtapasGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoEtapasGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoEtapasGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoEtapasGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoEtapasGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoEtapas model
   */
  readonly fields: ProcessoEtapasFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoEtapas.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoEtapasClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoEtapas model
   */ 
  interface ProcessoEtapasFieldRefs {
    readonly id: FieldRef<"ProcessoEtapas", 'String'>
    readonly tenant_id: FieldRef<"ProcessoEtapas", 'String'>
    readonly product_id: FieldRef<"ProcessoEtapas", 'String'>
    readonly user_id: FieldRef<"ProcessoEtapas", 'String'>
    readonly processo_id: FieldRef<"ProcessoEtapas", 'String'>
    readonly nome: FieldRef<"ProcessoEtapas", 'String'>
    readonly status: FieldRef<"ProcessoEtapas", 'String'>
    readonly data_prevista: FieldRef<"ProcessoEtapas", 'DateTime'>
    readonly data_realizada: FieldRef<"ProcessoEtapas", 'DateTime'>
    readonly observacao: FieldRef<"ProcessoEtapas", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoEtapas findUnique
   */
  export type ProcessoEtapasFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where: ProcessoEtapasWhereUniqueInput
  }

  /**
   * ProcessoEtapas findUniqueOrThrow
   */
  export type ProcessoEtapasFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where: ProcessoEtapasWhereUniqueInput
  }

  /**
   * ProcessoEtapas findFirst
   */
  export type ProcessoEtapasFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where?: ProcessoEtapasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapasOrderByWithRelationInput | ProcessoEtapasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEtapas.
     */
    cursor?: ProcessoEtapasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEtapas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEtapas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoEtapas.
     */
    distinct?: ProcessoEtapasScalarFieldEnum | ProcessoEtapasScalarFieldEnum[]
  }

  /**
   * ProcessoEtapas findFirstOrThrow
   */
  export type ProcessoEtapasFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where?: ProcessoEtapasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapasOrderByWithRelationInput | ProcessoEtapasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEtapas.
     */
    cursor?: ProcessoEtapasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEtapas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEtapas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoEtapas.
     */
    distinct?: ProcessoEtapasScalarFieldEnum | ProcessoEtapasScalarFieldEnum[]
  }

  /**
   * ProcessoEtapas findMany
   */
  export type ProcessoEtapasFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where?: ProcessoEtapasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapasOrderByWithRelationInput | ProcessoEtapasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoEtapas.
     */
    cursor?: ProcessoEtapasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEtapas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEtapas.
     */
    skip?: number
    distinct?: ProcessoEtapasScalarFieldEnum | ProcessoEtapasScalarFieldEnum[]
  }

  /**
   * ProcessoEtapas create
   */
  export type ProcessoEtapasCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoEtapas.
     */
    data: XOR<ProcessoEtapasCreateInput, ProcessoEtapasUncheckedCreateInput>
  }

  /**
   * ProcessoEtapas createMany
   */
  export type ProcessoEtapasCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoEtapas.
     */
    data: ProcessoEtapasCreateManyInput | ProcessoEtapasCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoEtapas createManyAndReturn
   */
  export type ProcessoEtapasCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoEtapas.
     */
    data: ProcessoEtapasCreateManyInput | ProcessoEtapasCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoEtapas update
   */
  export type ProcessoEtapasUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoEtapas.
     */
    data: XOR<ProcessoEtapasUpdateInput, ProcessoEtapasUncheckedUpdateInput>
    /**
     * Choose, which ProcessoEtapas to update.
     */
    where: ProcessoEtapasWhereUniqueInput
  }

  /**
   * ProcessoEtapas updateMany
   */
  export type ProcessoEtapasUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoEtapas.
     */
    data: XOR<ProcessoEtapasUpdateManyMutationInput, ProcessoEtapasUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoEtapas to update
     */
    where?: ProcessoEtapasWhereInput
  }

  /**
   * ProcessoEtapas upsert
   */
  export type ProcessoEtapasUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoEtapas to update in case it exists.
     */
    where: ProcessoEtapasWhereUniqueInput
    /**
     * In case the ProcessoEtapas found by the `where` argument doesn't exist, create a new ProcessoEtapas with this data.
     */
    create: XOR<ProcessoEtapasCreateInput, ProcessoEtapasUncheckedCreateInput>
    /**
     * In case the ProcessoEtapas was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoEtapasUpdateInput, ProcessoEtapasUncheckedUpdateInput>
  }

  /**
   * ProcessoEtapas delete
   */
  export type ProcessoEtapasDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
    /**
     * Filter which ProcessoEtapas to delete.
     */
    where: ProcessoEtapasWhereUniqueInput
  }

  /**
   * ProcessoEtapas deleteMany
   */
  export type ProcessoEtapasDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEtapas to delete
     */
    where?: ProcessoEtapasWhereInput
  }

  /**
   * ProcessoEtapas without action
   */
  export type ProcessoEtapasDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapas
     */
    select?: ProcessoEtapasSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapasInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoPedido
   */

  export type AggregateProcessoPedido = {
    _count: ProcessoPedidoCountAggregateOutputType | null
    _avg: ProcessoPedidoAvgAggregateOutputType | null
    _sum: ProcessoPedidoSumAggregateOutputType | null
    _min: ProcessoPedidoMinAggregateOutputType | null
    _max: ProcessoPedidoMaxAggregateOutputType | null
  }

  export type ProcessoPedidoAvgAggregateOutputType = {
    valor_fob: Decimal | null
    peso_bruto: Decimal | null
  }

  export type ProcessoPedidoSumAggregateOutputType = {
    valor_fob: Decimal | null
    peso_bruto: Decimal | null
  }

  export type ProcessoPedidoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    numero: string | null
    exportador_nome: string | null
    exportador_pais: string | null
    valor_fob: Decimal | null
    moeda: string | null
    peso_bruto: Decimal | null
    status: string | null
    status_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoPedidoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    numero: string | null
    exportador_nome: string | null
    exportador_pais: string | null
    valor_fob: Decimal | null
    moeda: string | null
    peso_bruto: Decimal | null
    status: string | null
    status_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoPedidoCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    numero: number
    exportador_nome: number
    exportador_pais: number
    valor_fob: number
    moeda: number
    peso_bruto: number
    status: number
    status_id: number
    campos_custom: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProcessoPedidoAvgAggregateInputType = {
    valor_fob?: true
    peso_bruto?: true
  }

  export type ProcessoPedidoSumAggregateInputType = {
    valor_fob?: true
    peso_bruto?: true
  }

  export type ProcessoPedidoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    numero?: true
    exportador_nome?: true
    exportador_pais?: true
    valor_fob?: true
    moeda?: true
    peso_bruto?: true
    status?: true
    status_id?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoPedidoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    numero?: true
    exportador_nome?: true
    exportador_pais?: true
    valor_fob?: true
    moeda?: true
    peso_bruto?: true
    status?: true
    status_id?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoPedidoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    numero?: true
    exportador_nome?: true
    exportador_pais?: true
    valor_fob?: true
    moeda?: true
    peso_bruto?: true
    status?: true
    status_id?: true
    campos_custom?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessoPedidoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedido to aggregate.
     */
    where?: ProcessoPedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidos to fetch.
     */
    orderBy?: ProcessoPedidoOrderByWithRelationInput | ProcessoPedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoPedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoPedidos
    **/
    _count?: true | ProcessoPedidoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoPedidoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoPedidoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoPedidoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoPedidoMaxAggregateInputType
  }

  export type GetProcessoPedidoAggregateType<T extends ProcessoPedidoAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoPedido]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoPedido[P]>
      : GetScalarType<T[P], AggregateProcessoPedido[P]>
  }




  export type ProcessoPedidoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoPedidoWhereInput
    orderBy?: ProcessoPedidoOrderByWithAggregationInput | ProcessoPedidoOrderByWithAggregationInput[]
    by: ProcessoPedidoScalarFieldEnum[] | ProcessoPedidoScalarFieldEnum
    having?: ProcessoPedidoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoPedidoCountAggregateInputType | true
    _avg?: ProcessoPedidoAvgAggregateInputType
    _sum?: ProcessoPedidoSumAggregateInputType
    _min?: ProcessoPedidoMinAggregateInputType
    _max?: ProcessoPedidoMaxAggregateInputType
  }

  export type ProcessoPedidoGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    numero: string
    exportador_nome: string | null
    exportador_pais: string | null
    valor_fob: Decimal
    moeda: string
    peso_bruto: Decimal
    status: string
    status_id: string | null
    campos_custom: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: ProcessoPedidoCountAggregateOutputType | null
    _avg: ProcessoPedidoAvgAggregateOutputType | null
    _sum: ProcessoPedidoSumAggregateOutputType | null
    _min: ProcessoPedidoMinAggregateOutputType | null
    _max: ProcessoPedidoMaxAggregateOutputType | null
  }

  type GetProcessoPedidoGroupByPayload<T extends ProcessoPedidoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoPedidoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoPedidoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoPedidoGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoPedidoGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoPedidoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    numero?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    valor_fob?: boolean
    moeda?: boolean
    peso_bruto?: boolean
    status?: boolean
    status_id?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
    itens?: boolean | ProcessoPedido$itensArgs<ExtArgs>
    _count?: boolean | ProcessoPedidoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoPedido"]>

  export type ProcessoPedidoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    numero?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    valor_fob?: boolean
    moeda?: boolean
    peso_bruto?: boolean
    status?: boolean
    status_id?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoPedido"]>

  export type ProcessoPedidoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    numero?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    valor_fob?: boolean
    moeda?: boolean
    peso_bruto?: boolean
    status?: boolean
    status_id?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProcessoPedidoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
    itens?: boolean | ProcessoPedido$itensArgs<ExtArgs>
    _count?: boolean | ProcessoPedidoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoPedidoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoPedidoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoPedido"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
      itens: Prisma.$ProcessoPedidoItensPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      numero: string
      exportador_nome: string | null
      exportador_pais: string | null
      valor_fob: Prisma.Decimal
      moeda: string
      peso_bruto: Prisma.Decimal
      status: string
      status_id: string | null
      campos_custom: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["processoPedido"]>
    composites: {}
  }

  type ProcessoPedidoGetPayload<S extends boolean | null | undefined | ProcessoPedidoDefaultArgs> = $Result.GetResult<Prisma.$ProcessoPedidoPayload, S>

  type ProcessoPedidoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoPedidoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoPedidoCountAggregateInputType | true
    }

  export interface ProcessoPedidoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoPedido'], meta: { name: 'ProcessoPedido' } }
    /**
     * Find zero or one ProcessoPedido that matches the filter.
     * @param {ProcessoPedidoFindUniqueArgs} args - Arguments to find a ProcessoPedido
     * @example
     * // Get one ProcessoPedido
     * const processoPedido = await prisma.processoPedido.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoPedidoFindUniqueArgs>(args: SelectSubset<T, ProcessoPedidoFindUniqueArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoPedido that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoPedidoFindUniqueOrThrowArgs} args - Arguments to find a ProcessoPedido
     * @example
     * // Get one ProcessoPedido
     * const processoPedido = await prisma.processoPedido.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoPedidoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoPedidoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoPedido that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoFindFirstArgs} args - Arguments to find a ProcessoPedido
     * @example
     * // Get one ProcessoPedido
     * const processoPedido = await prisma.processoPedido.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoPedidoFindFirstArgs>(args?: SelectSubset<T, ProcessoPedidoFindFirstArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoPedido that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoFindFirstOrThrowArgs} args - Arguments to find a ProcessoPedido
     * @example
     * // Get one ProcessoPedido
     * const processoPedido = await prisma.processoPedido.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoPedidoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoPedidoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoPedidos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoPedidos
     * const processoPedidos = await prisma.processoPedido.findMany()
     * 
     * // Get first 10 ProcessoPedidos
     * const processoPedidos = await prisma.processoPedido.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoPedidoWithIdOnly = await prisma.processoPedido.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoPedidoFindManyArgs>(args?: SelectSubset<T, ProcessoPedidoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoPedido.
     * @param {ProcessoPedidoCreateArgs} args - Arguments to create a ProcessoPedido.
     * @example
     * // Create one ProcessoPedido
     * const ProcessoPedido = await prisma.processoPedido.create({
     *   data: {
     *     // ... data to create a ProcessoPedido
     *   }
     * })
     * 
     */
    create<T extends ProcessoPedidoCreateArgs>(args: SelectSubset<T, ProcessoPedidoCreateArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoPedidos.
     * @param {ProcessoPedidoCreateManyArgs} args - Arguments to create many ProcessoPedidos.
     * @example
     * // Create many ProcessoPedidos
     * const processoPedido = await prisma.processoPedido.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoPedidoCreateManyArgs>(args?: SelectSubset<T, ProcessoPedidoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoPedidos and returns the data saved in the database.
     * @param {ProcessoPedidoCreateManyAndReturnArgs} args - Arguments to create many ProcessoPedidos.
     * @example
     * // Create many ProcessoPedidos
     * const processoPedido = await prisma.processoPedido.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoPedidos and only return the `id`
     * const processoPedidoWithIdOnly = await prisma.processoPedido.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoPedidoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoPedidoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoPedido.
     * @param {ProcessoPedidoDeleteArgs} args - Arguments to delete one ProcessoPedido.
     * @example
     * // Delete one ProcessoPedido
     * const ProcessoPedido = await prisma.processoPedido.delete({
     *   where: {
     *     // ... filter to delete one ProcessoPedido
     *   }
     * })
     * 
     */
    delete<T extends ProcessoPedidoDeleteArgs>(args: SelectSubset<T, ProcessoPedidoDeleteArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoPedido.
     * @param {ProcessoPedidoUpdateArgs} args - Arguments to update one ProcessoPedido.
     * @example
     * // Update one ProcessoPedido
     * const processoPedido = await prisma.processoPedido.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoPedidoUpdateArgs>(args: SelectSubset<T, ProcessoPedidoUpdateArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoPedidos.
     * @param {ProcessoPedidoDeleteManyArgs} args - Arguments to filter ProcessoPedidos to delete.
     * @example
     * // Delete a few ProcessoPedidos
     * const { count } = await prisma.processoPedido.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoPedidoDeleteManyArgs>(args?: SelectSubset<T, ProcessoPedidoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoPedidos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoPedidos
     * const processoPedido = await prisma.processoPedido.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoPedidoUpdateManyArgs>(args: SelectSubset<T, ProcessoPedidoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoPedido.
     * @param {ProcessoPedidoUpsertArgs} args - Arguments to update or create a ProcessoPedido.
     * @example
     * // Update or create a ProcessoPedido
     * const processoPedido = await prisma.processoPedido.upsert({
     *   create: {
     *     // ... data to create a ProcessoPedido
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoPedido we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoPedidoUpsertArgs>(args: SelectSubset<T, ProcessoPedidoUpsertArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoPedidos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoCountArgs} args - Arguments to filter ProcessoPedidos to count.
     * @example
     * // Count the number of ProcessoPedidos
     * const count = await prisma.processoPedido.count({
     *   where: {
     *     // ... the filter for the ProcessoPedidos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoPedidoCountArgs>(
      args?: Subset<T, ProcessoPedidoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoPedidoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoPedido.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoPedidoAggregateArgs>(args: Subset<T, ProcessoPedidoAggregateArgs>): Prisma.PrismaPromise<GetProcessoPedidoAggregateType<T>>

    /**
     * Group by ProcessoPedido.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoGroupByArgs} args - Group by arguments.
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
      T extends ProcessoPedidoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoPedidoGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoPedidoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoPedidoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoPedidoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoPedido model
   */
  readonly fields: ProcessoPedidoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoPedido.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoPedidoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    itens<T extends ProcessoPedido$itensArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoPedido$itensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the ProcessoPedido model
   */ 
  interface ProcessoPedidoFieldRefs {
    readonly id: FieldRef<"ProcessoPedido", 'String'>
    readonly tenant_id: FieldRef<"ProcessoPedido", 'String'>
    readonly product_id: FieldRef<"ProcessoPedido", 'String'>
    readonly user_id: FieldRef<"ProcessoPedido", 'String'>
    readonly processo_id: FieldRef<"ProcessoPedido", 'String'>
    readonly numero: FieldRef<"ProcessoPedido", 'String'>
    readonly exportador_nome: FieldRef<"ProcessoPedido", 'String'>
    readonly exportador_pais: FieldRef<"ProcessoPedido", 'String'>
    readonly valor_fob: FieldRef<"ProcessoPedido", 'Decimal'>
    readonly moeda: FieldRef<"ProcessoPedido", 'String'>
    readonly peso_bruto: FieldRef<"ProcessoPedido", 'Decimal'>
    readonly status: FieldRef<"ProcessoPedido", 'String'>
    readonly status_id: FieldRef<"ProcessoPedido", 'String'>
    readonly campos_custom: FieldRef<"ProcessoPedido", 'Json'>
    readonly created_at: FieldRef<"ProcessoPedido", 'DateTime'>
    readonly updated_at: FieldRef<"ProcessoPedido", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoPedido findUnique
   */
  export type ProcessoPedidoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedido to fetch.
     */
    where: ProcessoPedidoWhereUniqueInput
  }

  /**
   * ProcessoPedido findUniqueOrThrow
   */
  export type ProcessoPedidoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedido to fetch.
     */
    where: ProcessoPedidoWhereUniqueInput
  }

  /**
   * ProcessoPedido findFirst
   */
  export type ProcessoPedidoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedido to fetch.
     */
    where?: ProcessoPedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidos to fetch.
     */
    orderBy?: ProcessoPedidoOrderByWithRelationInput | ProcessoPedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidos.
     */
    cursor?: ProcessoPedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidos.
     */
    distinct?: ProcessoPedidoScalarFieldEnum | ProcessoPedidoScalarFieldEnum[]
  }

  /**
   * ProcessoPedido findFirstOrThrow
   */
  export type ProcessoPedidoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedido to fetch.
     */
    where?: ProcessoPedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidos to fetch.
     */
    orderBy?: ProcessoPedidoOrderByWithRelationInput | ProcessoPedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidos.
     */
    cursor?: ProcessoPedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidos.
     */
    distinct?: ProcessoPedidoScalarFieldEnum | ProcessoPedidoScalarFieldEnum[]
  }

  /**
   * ProcessoPedido findMany
   */
  export type ProcessoPedidoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidos to fetch.
     */
    where?: ProcessoPedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidos to fetch.
     */
    orderBy?: ProcessoPedidoOrderByWithRelationInput | ProcessoPedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoPedidos.
     */
    cursor?: ProcessoPedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidos.
     */
    skip?: number
    distinct?: ProcessoPedidoScalarFieldEnum | ProcessoPedidoScalarFieldEnum[]
  }

  /**
   * ProcessoPedido create
   */
  export type ProcessoPedidoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoPedido.
     */
    data: XOR<ProcessoPedidoCreateInput, ProcessoPedidoUncheckedCreateInput>
  }

  /**
   * ProcessoPedido createMany
   */
  export type ProcessoPedidoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoPedidos.
     */
    data: ProcessoPedidoCreateManyInput | ProcessoPedidoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoPedido createManyAndReturn
   */
  export type ProcessoPedidoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoPedidos.
     */
    data: ProcessoPedidoCreateManyInput | ProcessoPedidoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoPedido update
   */
  export type ProcessoPedidoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoPedido.
     */
    data: XOR<ProcessoPedidoUpdateInput, ProcessoPedidoUncheckedUpdateInput>
    /**
     * Choose, which ProcessoPedido to update.
     */
    where: ProcessoPedidoWhereUniqueInput
  }

  /**
   * ProcessoPedido updateMany
   */
  export type ProcessoPedidoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoPedidos.
     */
    data: XOR<ProcessoPedidoUpdateManyMutationInput, ProcessoPedidoUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoPedidos to update
     */
    where?: ProcessoPedidoWhereInput
  }

  /**
   * ProcessoPedido upsert
   */
  export type ProcessoPedidoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoPedido to update in case it exists.
     */
    where: ProcessoPedidoWhereUniqueInput
    /**
     * In case the ProcessoPedido found by the `where` argument doesn't exist, create a new ProcessoPedido with this data.
     */
    create: XOR<ProcessoPedidoCreateInput, ProcessoPedidoUncheckedCreateInput>
    /**
     * In case the ProcessoPedido was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoPedidoUpdateInput, ProcessoPedidoUncheckedUpdateInput>
  }

  /**
   * ProcessoPedido delete
   */
  export type ProcessoPedidoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
    /**
     * Filter which ProcessoPedido to delete.
     */
    where: ProcessoPedidoWhereUniqueInput
  }

  /**
   * ProcessoPedido deleteMany
   */
  export type ProcessoPedidoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedidos to delete
     */
    where?: ProcessoPedidoWhereInput
  }

  /**
   * ProcessoPedido.itens
   */
  export type ProcessoPedido$itensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    where?: ProcessoPedidoItensWhereInput
    orderBy?: ProcessoPedidoItensOrderByWithRelationInput | ProcessoPedidoItensOrderByWithRelationInput[]
    cursor?: ProcessoPedidoItensWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoPedidoItensScalarFieldEnum | ProcessoPedidoItensScalarFieldEnum[]
  }

  /**
   * ProcessoPedido without action
   */
  export type ProcessoPedidoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedido
     */
    select?: ProcessoPedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoPedidoItens
   */

  export type AggregateProcessoPedidoItens = {
    _count: ProcessoPedidoItensCountAggregateOutputType | null
    _avg: ProcessoPedidoItensAvgAggregateOutputType | null
    _sum: ProcessoPedidoItensSumAggregateOutputType | null
    _min: ProcessoPedidoItensMinAggregateOutputType | null
    _max: ProcessoPedidoItensMaxAggregateOutputType | null
  }

  export type ProcessoPedidoItensAvgAggregateOutputType = {
    quantidade: Decimal | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
  }

  export type ProcessoPedidoItensSumAggregateOutputType = {
    quantidade: Decimal | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
  }

  export type ProcessoPedidoItensMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    pedido_id: string | null
    numero_item: string | null
    descricao: string | null
    ncm: string | null
    quantidade: Decimal | null
    unidade: string | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
    moeda: string | null
    status_li: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoPedidoItensMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    pedido_id: string | null
    numero_item: string | null
    descricao: string | null
    ncm: string | null
    quantidade: Decimal | null
    unidade: string | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
    moeda: string | null
    status_li: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoPedidoItensCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    pedido_id: number
    numero_item: number
    descricao: number
    ncm: number
    quantidade: number
    unidade: number
    valor_unitario: number
    valor_total: number
    moeda: number
    status_li: number
    campos_custom: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProcessoPedidoItensAvgAggregateInputType = {
    quantidade?: true
    valor_unitario?: true
    valor_total?: true
  }

  export type ProcessoPedidoItensSumAggregateInputType = {
    quantidade?: true
    valor_unitario?: true
    valor_total?: true
  }

  export type ProcessoPedidoItensMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    pedido_id?: true
    numero_item?: true
    descricao?: true
    ncm?: true
    quantidade?: true
    unidade?: true
    valor_unitario?: true
    valor_total?: true
    moeda?: true
    status_li?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoPedidoItensMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    pedido_id?: true
    numero_item?: true
    descricao?: true
    ncm?: true
    quantidade?: true
    unidade?: true
    valor_unitario?: true
    valor_total?: true
    moeda?: true
    status_li?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoPedidoItensCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    pedido_id?: true
    numero_item?: true
    descricao?: true
    ncm?: true
    quantidade?: true
    unidade?: true
    valor_unitario?: true
    valor_total?: true
    moeda?: true
    status_li?: true
    campos_custom?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessoPedidoItensAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedidoItens to aggregate.
     */
    where?: ProcessoPedidoItensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoItens to fetch.
     */
    orderBy?: ProcessoPedidoItensOrderByWithRelationInput | ProcessoPedidoItensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoPedidoItensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoItens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoItens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoPedidoItens
    **/
    _count?: true | ProcessoPedidoItensCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoPedidoItensAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoPedidoItensSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoPedidoItensMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoPedidoItensMaxAggregateInputType
  }

  export type GetProcessoPedidoItensAggregateType<T extends ProcessoPedidoItensAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoPedidoItens]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoPedidoItens[P]>
      : GetScalarType<T[P], AggregateProcessoPedidoItens[P]>
  }




  export type ProcessoPedidoItensGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoPedidoItensWhereInput
    orderBy?: ProcessoPedidoItensOrderByWithAggregationInput | ProcessoPedidoItensOrderByWithAggregationInput[]
    by: ProcessoPedidoItensScalarFieldEnum[] | ProcessoPedidoItensScalarFieldEnum
    having?: ProcessoPedidoItensScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoPedidoItensCountAggregateInputType | true
    _avg?: ProcessoPedidoItensAvgAggregateInputType
    _sum?: ProcessoPedidoItensSumAggregateInputType
    _min?: ProcessoPedidoItensMinAggregateInputType
    _max?: ProcessoPedidoItensMaxAggregateInputType
  }

  export type ProcessoPedidoItensGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    pedido_id: string
    numero_item: string
    descricao: string
    ncm: string | null
    quantidade: Decimal
    unidade: string
    valor_unitario: Decimal
    valor_total: Decimal
    moeda: string
    status_li: string
    campos_custom: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: ProcessoPedidoItensCountAggregateOutputType | null
    _avg: ProcessoPedidoItensAvgAggregateOutputType | null
    _sum: ProcessoPedidoItensSumAggregateOutputType | null
    _min: ProcessoPedidoItensMinAggregateOutputType | null
    _max: ProcessoPedidoItensMaxAggregateOutputType | null
  }

  type GetProcessoPedidoItensGroupByPayload<T extends ProcessoPedidoItensGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoPedidoItensGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoPedidoItensGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoPedidoItensGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoPedidoItensGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoPedidoItensSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    pedido_id?: boolean
    numero_item?: boolean
    descricao?: boolean
    ncm?: boolean
    quantidade?: boolean
    unidade?: boolean
    valor_unitario?: boolean
    valor_total?: boolean
    moeda?: boolean
    status_li?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
    pedido?: boolean | ProcessoPedidoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoPedidoItens"]>

  export type ProcessoPedidoItensSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    pedido_id?: boolean
    numero_item?: boolean
    descricao?: boolean
    ncm?: boolean
    quantidade?: boolean
    unidade?: boolean
    valor_unitario?: boolean
    valor_total?: boolean
    moeda?: boolean
    status_li?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
    pedido?: boolean | ProcessoPedidoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoPedidoItens"]>

  export type ProcessoPedidoItensSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    pedido_id?: boolean
    numero_item?: boolean
    descricao?: boolean
    ncm?: boolean
    quantidade?: boolean
    unidade?: boolean
    valor_unitario?: boolean
    valor_total?: boolean
    moeda?: boolean
    status_li?: boolean
    campos_custom?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProcessoPedidoItensInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pedido?: boolean | ProcessoPedidoDefaultArgs<ExtArgs>
  }
  export type ProcessoPedidoItensIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pedido?: boolean | ProcessoPedidoDefaultArgs<ExtArgs>
  }

  export type $ProcessoPedidoItensPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoPedidoItens"
    objects: {
      pedido: Prisma.$ProcessoPedidoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      pedido_id: string
      numero_item: string
      descricao: string
      ncm: string | null
      quantidade: Prisma.Decimal
      unidade: string
      valor_unitario: Prisma.Decimal
      valor_total: Prisma.Decimal
      moeda: string
      status_li: string
      campos_custom: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["processoPedidoItens"]>
    composites: {}
  }

  type ProcessoPedidoItensGetPayload<S extends boolean | null | undefined | ProcessoPedidoItensDefaultArgs> = $Result.GetResult<Prisma.$ProcessoPedidoItensPayload, S>

  type ProcessoPedidoItensCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoPedidoItensFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoPedidoItensCountAggregateInputType | true
    }

  export interface ProcessoPedidoItensDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoPedidoItens'], meta: { name: 'ProcessoPedidoItens' } }
    /**
     * Find zero or one ProcessoPedidoItens that matches the filter.
     * @param {ProcessoPedidoItensFindUniqueArgs} args - Arguments to find a ProcessoPedidoItens
     * @example
     * // Get one ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoPedidoItensFindUniqueArgs>(args: SelectSubset<T, ProcessoPedidoItensFindUniqueArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoPedidoItens that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoPedidoItensFindUniqueOrThrowArgs} args - Arguments to find a ProcessoPedidoItens
     * @example
     * // Get one ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoPedidoItensFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoPedidoItensFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoPedidoItens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensFindFirstArgs} args - Arguments to find a ProcessoPedidoItens
     * @example
     * // Get one ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoPedidoItensFindFirstArgs>(args?: SelectSubset<T, ProcessoPedidoItensFindFirstArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoPedidoItens that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensFindFirstOrThrowArgs} args - Arguments to find a ProcessoPedidoItens
     * @example
     * // Get one ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoPedidoItensFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoPedidoItensFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoPedidoItens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findMany()
     * 
     * // Get first 10 ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoPedidoItensWithIdOnly = await prisma.processoPedidoItens.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoPedidoItensFindManyArgs>(args?: SelectSubset<T, ProcessoPedidoItensFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoPedidoItens.
     * @param {ProcessoPedidoItensCreateArgs} args - Arguments to create a ProcessoPedidoItens.
     * @example
     * // Create one ProcessoPedidoItens
     * const ProcessoPedidoItens = await prisma.processoPedidoItens.create({
     *   data: {
     *     // ... data to create a ProcessoPedidoItens
     *   }
     * })
     * 
     */
    create<T extends ProcessoPedidoItensCreateArgs>(args: SelectSubset<T, ProcessoPedidoItensCreateArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoPedidoItens.
     * @param {ProcessoPedidoItensCreateManyArgs} args - Arguments to create many ProcessoPedidoItens.
     * @example
     * // Create many ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoPedidoItensCreateManyArgs>(args?: SelectSubset<T, ProcessoPedidoItensCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoPedidoItens and returns the data saved in the database.
     * @param {ProcessoPedidoItensCreateManyAndReturnArgs} args - Arguments to create many ProcessoPedidoItens.
     * @example
     * // Create many ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoPedidoItens and only return the `id`
     * const processoPedidoItensWithIdOnly = await prisma.processoPedidoItens.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoPedidoItensCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoPedidoItensCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoPedidoItens.
     * @param {ProcessoPedidoItensDeleteArgs} args - Arguments to delete one ProcessoPedidoItens.
     * @example
     * // Delete one ProcessoPedidoItens
     * const ProcessoPedidoItens = await prisma.processoPedidoItens.delete({
     *   where: {
     *     // ... filter to delete one ProcessoPedidoItens
     *   }
     * })
     * 
     */
    delete<T extends ProcessoPedidoItensDeleteArgs>(args: SelectSubset<T, ProcessoPedidoItensDeleteArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoPedidoItens.
     * @param {ProcessoPedidoItensUpdateArgs} args - Arguments to update one ProcessoPedidoItens.
     * @example
     * // Update one ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoPedidoItensUpdateArgs>(args: SelectSubset<T, ProcessoPedidoItensUpdateArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoPedidoItens.
     * @param {ProcessoPedidoItensDeleteManyArgs} args - Arguments to filter ProcessoPedidoItens to delete.
     * @example
     * // Delete a few ProcessoPedidoItens
     * const { count } = await prisma.processoPedidoItens.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoPedidoItensDeleteManyArgs>(args?: SelectSubset<T, ProcessoPedidoItensDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoPedidoItens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoPedidoItensUpdateManyArgs>(args: SelectSubset<T, ProcessoPedidoItensUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoPedidoItens.
     * @param {ProcessoPedidoItensUpsertArgs} args - Arguments to update or create a ProcessoPedidoItens.
     * @example
     * // Update or create a ProcessoPedidoItens
     * const processoPedidoItens = await prisma.processoPedidoItens.upsert({
     *   create: {
     *     // ... data to create a ProcessoPedidoItens
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoPedidoItens we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoPedidoItensUpsertArgs>(args: SelectSubset<T, ProcessoPedidoItensUpsertArgs<ExtArgs>>): Prisma__ProcessoPedidoItensClient<$Result.GetResult<Prisma.$ProcessoPedidoItensPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoPedidoItens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensCountArgs} args - Arguments to filter ProcessoPedidoItens to count.
     * @example
     * // Count the number of ProcessoPedidoItens
     * const count = await prisma.processoPedidoItens.count({
     *   where: {
     *     // ... the filter for the ProcessoPedidoItens we want to count
     *   }
     * })
    **/
    count<T extends ProcessoPedidoItensCountArgs>(
      args?: Subset<T, ProcessoPedidoItensCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoPedidoItensCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoPedidoItens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoPedidoItensAggregateArgs>(args: Subset<T, ProcessoPedidoItensAggregateArgs>): Prisma.PrismaPromise<GetProcessoPedidoItensAggregateType<T>>

    /**
     * Group by ProcessoPedidoItens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoItensGroupByArgs} args - Group by arguments.
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
      T extends ProcessoPedidoItensGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoPedidoItensGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoPedidoItensGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoPedidoItensGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoPedidoItensGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoPedidoItens model
   */
  readonly fields: ProcessoPedidoItensFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoPedidoItens.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoPedidoItensClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pedido<T extends ProcessoPedidoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoPedidoDefaultArgs<ExtArgs>>): Prisma__ProcessoPedidoClient<$Result.GetResult<Prisma.$ProcessoPedidoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoPedidoItens model
   */ 
  interface ProcessoPedidoItensFieldRefs {
    readonly id: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly tenant_id: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly product_id: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly user_id: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly pedido_id: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly numero_item: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly descricao: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly ncm: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly quantidade: FieldRef<"ProcessoPedidoItens", 'Decimal'>
    readonly unidade: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly valor_unitario: FieldRef<"ProcessoPedidoItens", 'Decimal'>
    readonly valor_total: FieldRef<"ProcessoPedidoItens", 'Decimal'>
    readonly moeda: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly status_li: FieldRef<"ProcessoPedidoItens", 'String'>
    readonly campos_custom: FieldRef<"ProcessoPedidoItens", 'Json'>
    readonly created_at: FieldRef<"ProcessoPedidoItens", 'DateTime'>
    readonly updated_at: FieldRef<"ProcessoPedidoItens", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoPedidoItens findUnique
   */
  export type ProcessoPedidoItensFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoItens to fetch.
     */
    where: ProcessoPedidoItensWhereUniqueInput
  }

  /**
   * ProcessoPedidoItens findUniqueOrThrow
   */
  export type ProcessoPedidoItensFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoItens to fetch.
     */
    where: ProcessoPedidoItensWhereUniqueInput
  }

  /**
   * ProcessoPedidoItens findFirst
   */
  export type ProcessoPedidoItensFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoItens to fetch.
     */
    where?: ProcessoPedidoItensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoItens to fetch.
     */
    orderBy?: ProcessoPedidoItensOrderByWithRelationInput | ProcessoPedidoItensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidoItens.
     */
    cursor?: ProcessoPedidoItensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoItens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoItens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidoItens.
     */
    distinct?: ProcessoPedidoItensScalarFieldEnum | ProcessoPedidoItensScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoItens findFirstOrThrow
   */
  export type ProcessoPedidoItensFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoItens to fetch.
     */
    where?: ProcessoPedidoItensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoItens to fetch.
     */
    orderBy?: ProcessoPedidoItensOrderByWithRelationInput | ProcessoPedidoItensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidoItens.
     */
    cursor?: ProcessoPedidoItensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoItens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoItens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidoItens.
     */
    distinct?: ProcessoPedidoItensScalarFieldEnum | ProcessoPedidoItensScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoItens findMany
   */
  export type ProcessoPedidoItensFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoItens to fetch.
     */
    where?: ProcessoPedidoItensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoItens to fetch.
     */
    orderBy?: ProcessoPedidoItensOrderByWithRelationInput | ProcessoPedidoItensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoPedidoItens.
     */
    cursor?: ProcessoPedidoItensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoItens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoItens.
     */
    skip?: number
    distinct?: ProcessoPedidoItensScalarFieldEnum | ProcessoPedidoItensScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoItens create
   */
  export type ProcessoPedidoItensCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoPedidoItens.
     */
    data: XOR<ProcessoPedidoItensCreateInput, ProcessoPedidoItensUncheckedCreateInput>
  }

  /**
   * ProcessoPedidoItens createMany
   */
  export type ProcessoPedidoItensCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoPedidoItens.
     */
    data: ProcessoPedidoItensCreateManyInput | ProcessoPedidoItensCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoPedidoItens createManyAndReturn
   */
  export type ProcessoPedidoItensCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoPedidoItens.
     */
    data: ProcessoPedidoItensCreateManyInput | ProcessoPedidoItensCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoPedidoItens update
   */
  export type ProcessoPedidoItensUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoPedidoItens.
     */
    data: XOR<ProcessoPedidoItensUpdateInput, ProcessoPedidoItensUncheckedUpdateInput>
    /**
     * Choose, which ProcessoPedidoItens to update.
     */
    where: ProcessoPedidoItensWhereUniqueInput
  }

  /**
   * ProcessoPedidoItens updateMany
   */
  export type ProcessoPedidoItensUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoPedidoItens.
     */
    data: XOR<ProcessoPedidoItensUpdateManyMutationInput, ProcessoPedidoItensUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoPedidoItens to update
     */
    where?: ProcessoPedidoItensWhereInput
  }

  /**
   * ProcessoPedidoItens upsert
   */
  export type ProcessoPedidoItensUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoPedidoItens to update in case it exists.
     */
    where: ProcessoPedidoItensWhereUniqueInput
    /**
     * In case the ProcessoPedidoItens found by the `where` argument doesn't exist, create a new ProcessoPedidoItens with this data.
     */
    create: XOR<ProcessoPedidoItensCreateInput, ProcessoPedidoItensUncheckedCreateInput>
    /**
     * In case the ProcessoPedidoItens was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoPedidoItensUpdateInput, ProcessoPedidoItensUncheckedUpdateInput>
  }

  /**
   * ProcessoPedidoItens delete
   */
  export type ProcessoPedidoItensDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
    /**
     * Filter which ProcessoPedidoItens to delete.
     */
    where: ProcessoPedidoItensWhereUniqueInput
  }

  /**
   * ProcessoPedidoItens deleteMany
   */
  export type ProcessoPedidoItensDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedidoItens to delete
     */
    where?: ProcessoPedidoItensWhereInput
  }

  /**
   * ProcessoPedidoItens without action
   */
  export type ProcessoPedidoItensDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoItens
     */
    select?: ProcessoPedidoItensSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoPedidoItensInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoFollowup
   */

  export type AggregateProcessoFollowup = {
    _count: ProcessoFollowupCountAggregateOutputType | null
    _min: ProcessoFollowupMinAggregateOutputType | null
    _max: ProcessoFollowupMaxAggregateOutputType | null
  }

  export type ProcessoFollowupMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    titulo: string | null
    descricao: string | null
    tipo: string | null
    categoria: string | null
    usuario_id: string | null
    usuario_nome: string | null
    created_at: Date | null
  }

  export type ProcessoFollowupMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    titulo: string | null
    descricao: string | null
    tipo: string | null
    categoria: string | null
    usuario_id: string | null
    usuario_nome: string | null
    created_at: Date | null
  }

  export type ProcessoFollowupCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    titulo: number
    descricao: number
    tipo: number
    categoria: number
    usuario_id: number
    usuario_nome: number
    created_at: number
    _all: number
  }


  export type ProcessoFollowupMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    titulo?: true
    descricao?: true
    tipo?: true
    categoria?: true
    usuario_id?: true
    usuario_nome?: true
    created_at?: true
  }

  export type ProcessoFollowupMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    titulo?: true
    descricao?: true
    tipo?: true
    categoria?: true
    usuario_id?: true
    usuario_nome?: true
    created_at?: true
  }

  export type ProcessoFollowupCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    titulo?: true
    descricao?: true
    tipo?: true
    categoria?: true
    usuario_id?: true
    usuario_nome?: true
    created_at?: true
    _all?: true
  }

  export type ProcessoFollowupAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoFollowup to aggregate.
     */
    where?: ProcessoFollowupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoFollowups to fetch.
     */
    orderBy?: ProcessoFollowupOrderByWithRelationInput | ProcessoFollowupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoFollowupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoFollowups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoFollowups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoFollowups
    **/
    _count?: true | ProcessoFollowupCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoFollowupMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoFollowupMaxAggregateInputType
  }

  export type GetProcessoFollowupAggregateType<T extends ProcessoFollowupAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoFollowup]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoFollowup[P]>
      : GetScalarType<T[P], AggregateProcessoFollowup[P]>
  }




  export type ProcessoFollowupGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoFollowupWhereInput
    orderBy?: ProcessoFollowupOrderByWithAggregationInput | ProcessoFollowupOrderByWithAggregationInput[]
    by: ProcessoFollowupScalarFieldEnum[] | ProcessoFollowupScalarFieldEnum
    having?: ProcessoFollowupScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoFollowupCountAggregateInputType | true
    _min?: ProcessoFollowupMinAggregateInputType
    _max?: ProcessoFollowupMaxAggregateInputType
  }

  export type ProcessoFollowupGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    titulo: string
    descricao: string | null
    tipo: string
    categoria: string
    usuario_id: string | null
    usuario_nome: string | null
    created_at: Date
    _count: ProcessoFollowupCountAggregateOutputType | null
    _min: ProcessoFollowupMinAggregateOutputType | null
    _max: ProcessoFollowupMaxAggregateOutputType | null
  }

  type GetProcessoFollowupGroupByPayload<T extends ProcessoFollowupGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoFollowupGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoFollowupGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoFollowupGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoFollowupGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoFollowupSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    titulo?: boolean
    descricao?: boolean
    tipo?: boolean
    categoria?: boolean
    usuario_id?: boolean
    usuario_nome?: boolean
    created_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoFollowup"]>

  export type ProcessoFollowupSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    titulo?: boolean
    descricao?: boolean
    tipo?: boolean
    categoria?: boolean
    usuario_id?: boolean
    usuario_nome?: boolean
    created_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoFollowup"]>

  export type ProcessoFollowupSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    titulo?: boolean
    descricao?: boolean
    tipo?: boolean
    categoria?: boolean
    usuario_id?: boolean
    usuario_nome?: boolean
    created_at?: boolean
  }

  export type ProcessoFollowupInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }
  export type ProcessoFollowupIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoFollowupPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoFollowup"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      titulo: string
      descricao: string | null
      tipo: string
      categoria: string
      usuario_id: string | null
      usuario_nome: string | null
      created_at: Date
    }, ExtArgs["result"]["processoFollowup"]>
    composites: {}
  }

  type ProcessoFollowupGetPayload<S extends boolean | null | undefined | ProcessoFollowupDefaultArgs> = $Result.GetResult<Prisma.$ProcessoFollowupPayload, S>

  type ProcessoFollowupCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoFollowupFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoFollowupCountAggregateInputType | true
    }

  export interface ProcessoFollowupDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoFollowup'], meta: { name: 'ProcessoFollowup' } }
    /**
     * Find zero or one ProcessoFollowup that matches the filter.
     * @param {ProcessoFollowupFindUniqueArgs} args - Arguments to find a ProcessoFollowup
     * @example
     * // Get one ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoFollowupFindUniqueArgs>(args: SelectSubset<T, ProcessoFollowupFindUniqueArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoFollowup that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoFollowupFindUniqueOrThrowArgs} args - Arguments to find a ProcessoFollowup
     * @example
     * // Get one ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoFollowupFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoFollowupFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoFollowup that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupFindFirstArgs} args - Arguments to find a ProcessoFollowup
     * @example
     * // Get one ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoFollowupFindFirstArgs>(args?: SelectSubset<T, ProcessoFollowupFindFirstArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoFollowup that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupFindFirstOrThrowArgs} args - Arguments to find a ProcessoFollowup
     * @example
     * // Get one ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoFollowupFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoFollowupFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoFollowups that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoFollowups
     * const processoFollowups = await prisma.processoFollowup.findMany()
     * 
     * // Get first 10 ProcessoFollowups
     * const processoFollowups = await prisma.processoFollowup.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoFollowupWithIdOnly = await prisma.processoFollowup.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoFollowupFindManyArgs>(args?: SelectSubset<T, ProcessoFollowupFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoFollowup.
     * @param {ProcessoFollowupCreateArgs} args - Arguments to create a ProcessoFollowup.
     * @example
     * // Create one ProcessoFollowup
     * const ProcessoFollowup = await prisma.processoFollowup.create({
     *   data: {
     *     // ... data to create a ProcessoFollowup
     *   }
     * })
     * 
     */
    create<T extends ProcessoFollowupCreateArgs>(args: SelectSubset<T, ProcessoFollowupCreateArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoFollowups.
     * @param {ProcessoFollowupCreateManyArgs} args - Arguments to create many ProcessoFollowups.
     * @example
     * // Create many ProcessoFollowups
     * const processoFollowup = await prisma.processoFollowup.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoFollowupCreateManyArgs>(args?: SelectSubset<T, ProcessoFollowupCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoFollowups and returns the data saved in the database.
     * @param {ProcessoFollowupCreateManyAndReturnArgs} args - Arguments to create many ProcessoFollowups.
     * @example
     * // Create many ProcessoFollowups
     * const processoFollowup = await prisma.processoFollowup.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoFollowups and only return the `id`
     * const processoFollowupWithIdOnly = await prisma.processoFollowup.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoFollowupCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoFollowupCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoFollowup.
     * @param {ProcessoFollowupDeleteArgs} args - Arguments to delete one ProcessoFollowup.
     * @example
     * // Delete one ProcessoFollowup
     * const ProcessoFollowup = await prisma.processoFollowup.delete({
     *   where: {
     *     // ... filter to delete one ProcessoFollowup
     *   }
     * })
     * 
     */
    delete<T extends ProcessoFollowupDeleteArgs>(args: SelectSubset<T, ProcessoFollowupDeleteArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoFollowup.
     * @param {ProcessoFollowupUpdateArgs} args - Arguments to update one ProcessoFollowup.
     * @example
     * // Update one ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoFollowupUpdateArgs>(args: SelectSubset<T, ProcessoFollowupUpdateArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoFollowups.
     * @param {ProcessoFollowupDeleteManyArgs} args - Arguments to filter ProcessoFollowups to delete.
     * @example
     * // Delete a few ProcessoFollowups
     * const { count } = await prisma.processoFollowup.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoFollowupDeleteManyArgs>(args?: SelectSubset<T, ProcessoFollowupDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoFollowups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoFollowups
     * const processoFollowup = await prisma.processoFollowup.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoFollowupUpdateManyArgs>(args: SelectSubset<T, ProcessoFollowupUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoFollowup.
     * @param {ProcessoFollowupUpsertArgs} args - Arguments to update or create a ProcessoFollowup.
     * @example
     * // Update or create a ProcessoFollowup
     * const processoFollowup = await prisma.processoFollowup.upsert({
     *   create: {
     *     // ... data to create a ProcessoFollowup
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoFollowup we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoFollowupUpsertArgs>(args: SelectSubset<T, ProcessoFollowupUpsertArgs<ExtArgs>>): Prisma__ProcessoFollowupClient<$Result.GetResult<Prisma.$ProcessoFollowupPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoFollowups.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupCountArgs} args - Arguments to filter ProcessoFollowups to count.
     * @example
     * // Count the number of ProcessoFollowups
     * const count = await prisma.processoFollowup.count({
     *   where: {
     *     // ... the filter for the ProcessoFollowups we want to count
     *   }
     * })
    **/
    count<T extends ProcessoFollowupCountArgs>(
      args?: Subset<T, ProcessoFollowupCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoFollowupCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoFollowup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoFollowupAggregateArgs>(args: Subset<T, ProcessoFollowupAggregateArgs>): Prisma.PrismaPromise<GetProcessoFollowupAggregateType<T>>

    /**
     * Group by ProcessoFollowup.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFollowupGroupByArgs} args - Group by arguments.
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
      T extends ProcessoFollowupGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoFollowupGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoFollowupGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoFollowupGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoFollowupGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoFollowup model
   */
  readonly fields: ProcessoFollowupFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoFollowup.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoFollowupClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoFollowup model
   */ 
  interface ProcessoFollowupFieldRefs {
    readonly id: FieldRef<"ProcessoFollowup", 'String'>
    readonly tenant_id: FieldRef<"ProcessoFollowup", 'String'>
    readonly product_id: FieldRef<"ProcessoFollowup", 'String'>
    readonly user_id: FieldRef<"ProcessoFollowup", 'String'>
    readonly processo_id: FieldRef<"ProcessoFollowup", 'String'>
    readonly titulo: FieldRef<"ProcessoFollowup", 'String'>
    readonly descricao: FieldRef<"ProcessoFollowup", 'String'>
    readonly tipo: FieldRef<"ProcessoFollowup", 'String'>
    readonly categoria: FieldRef<"ProcessoFollowup", 'String'>
    readonly usuario_id: FieldRef<"ProcessoFollowup", 'String'>
    readonly usuario_nome: FieldRef<"ProcessoFollowup", 'String'>
    readonly created_at: FieldRef<"ProcessoFollowup", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoFollowup findUnique
   */
  export type ProcessoFollowupFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoFollowup to fetch.
     */
    where: ProcessoFollowupWhereUniqueInput
  }

  /**
   * ProcessoFollowup findUniqueOrThrow
   */
  export type ProcessoFollowupFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoFollowup to fetch.
     */
    where: ProcessoFollowupWhereUniqueInput
  }

  /**
   * ProcessoFollowup findFirst
   */
  export type ProcessoFollowupFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoFollowup to fetch.
     */
    where?: ProcessoFollowupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoFollowups to fetch.
     */
    orderBy?: ProcessoFollowupOrderByWithRelationInput | ProcessoFollowupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoFollowups.
     */
    cursor?: ProcessoFollowupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoFollowups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoFollowups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoFollowups.
     */
    distinct?: ProcessoFollowupScalarFieldEnum | ProcessoFollowupScalarFieldEnum[]
  }

  /**
   * ProcessoFollowup findFirstOrThrow
   */
  export type ProcessoFollowupFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoFollowup to fetch.
     */
    where?: ProcessoFollowupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoFollowups to fetch.
     */
    orderBy?: ProcessoFollowupOrderByWithRelationInput | ProcessoFollowupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoFollowups.
     */
    cursor?: ProcessoFollowupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoFollowups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoFollowups.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoFollowups.
     */
    distinct?: ProcessoFollowupScalarFieldEnum | ProcessoFollowupScalarFieldEnum[]
  }

  /**
   * ProcessoFollowup findMany
   */
  export type ProcessoFollowupFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoFollowups to fetch.
     */
    where?: ProcessoFollowupWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoFollowups to fetch.
     */
    orderBy?: ProcessoFollowupOrderByWithRelationInput | ProcessoFollowupOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoFollowups.
     */
    cursor?: ProcessoFollowupWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoFollowups from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoFollowups.
     */
    skip?: number
    distinct?: ProcessoFollowupScalarFieldEnum | ProcessoFollowupScalarFieldEnum[]
  }

  /**
   * ProcessoFollowup create
   */
  export type ProcessoFollowupCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoFollowup.
     */
    data: XOR<ProcessoFollowupCreateInput, ProcessoFollowupUncheckedCreateInput>
  }

  /**
   * ProcessoFollowup createMany
   */
  export type ProcessoFollowupCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoFollowups.
     */
    data: ProcessoFollowupCreateManyInput | ProcessoFollowupCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoFollowup createManyAndReturn
   */
  export type ProcessoFollowupCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoFollowups.
     */
    data: ProcessoFollowupCreateManyInput | ProcessoFollowupCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoFollowup update
   */
  export type ProcessoFollowupUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoFollowup.
     */
    data: XOR<ProcessoFollowupUpdateInput, ProcessoFollowupUncheckedUpdateInput>
    /**
     * Choose, which ProcessoFollowup to update.
     */
    where: ProcessoFollowupWhereUniqueInput
  }

  /**
   * ProcessoFollowup updateMany
   */
  export type ProcessoFollowupUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoFollowups.
     */
    data: XOR<ProcessoFollowupUpdateManyMutationInput, ProcessoFollowupUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoFollowups to update
     */
    where?: ProcessoFollowupWhereInput
  }

  /**
   * ProcessoFollowup upsert
   */
  export type ProcessoFollowupUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoFollowup to update in case it exists.
     */
    where: ProcessoFollowupWhereUniqueInput
    /**
     * In case the ProcessoFollowup found by the `where` argument doesn't exist, create a new ProcessoFollowup with this data.
     */
    create: XOR<ProcessoFollowupCreateInput, ProcessoFollowupUncheckedCreateInput>
    /**
     * In case the ProcessoFollowup was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoFollowupUpdateInput, ProcessoFollowupUncheckedUpdateInput>
  }

  /**
   * ProcessoFollowup delete
   */
  export type ProcessoFollowupDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
    /**
     * Filter which ProcessoFollowup to delete.
     */
    where: ProcessoFollowupWhereUniqueInput
  }

  /**
   * ProcessoFollowup deleteMany
   */
  export type ProcessoFollowupDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoFollowups to delete
     */
    where?: ProcessoFollowupWhereInput
  }

  /**
   * ProcessoFollowup without action
   */
  export type ProcessoFollowupDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoFollowup
     */
    select?: ProcessoFollowupSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoFollowupInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoAnexos
   */

  export type AggregateProcessoAnexos = {
    _count: ProcessoAnexosCountAggregateOutputType | null
    _avg: ProcessoAnexosAvgAggregateOutputType | null
    _sum: ProcessoAnexosSumAggregateOutputType | null
    _min: ProcessoAnexosMinAggregateOutputType | null
    _max: ProcessoAnexosMaxAggregateOutputType | null
  }

  export type ProcessoAnexosAvgAggregateOutputType = {
    tamanho_bytes: number | null
  }

  export type ProcessoAnexosSumAggregateOutputType = {
    tamanho_bytes: number | null
  }

  export type ProcessoAnexosMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    nome: string | null
    tipo_arquivo: string | null
    tamanho_bytes: number | null
    url: string | null
    categoria: string | null
    created_at: Date | null
  }

  export type ProcessoAnexosMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    nome: string | null
    tipo_arquivo: string | null
    tamanho_bytes: number | null
    url: string | null
    categoria: string | null
    created_at: Date | null
  }

  export type ProcessoAnexosCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    nome: number
    tipo_arquivo: number
    tamanho_bytes: number
    url: number
    categoria: number
    created_at: number
    _all: number
  }


  export type ProcessoAnexosAvgAggregateInputType = {
    tamanho_bytes?: true
  }

  export type ProcessoAnexosSumAggregateInputType = {
    tamanho_bytes?: true
  }

  export type ProcessoAnexosMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    tipo_arquivo?: true
    tamanho_bytes?: true
    url?: true
    categoria?: true
    created_at?: true
  }

  export type ProcessoAnexosMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    tipo_arquivo?: true
    tamanho_bytes?: true
    url?: true
    categoria?: true
    created_at?: true
  }

  export type ProcessoAnexosCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    nome?: true
    tipo_arquivo?: true
    tamanho_bytes?: true
    url?: true
    categoria?: true
    created_at?: true
    _all?: true
  }

  export type ProcessoAnexosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoAnexos to aggregate.
     */
    where?: ProcessoAnexosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoAnexos to fetch.
     */
    orderBy?: ProcessoAnexosOrderByWithRelationInput | ProcessoAnexosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoAnexosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoAnexos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoAnexos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoAnexos
    **/
    _count?: true | ProcessoAnexosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoAnexosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoAnexosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoAnexosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoAnexosMaxAggregateInputType
  }

  export type GetProcessoAnexosAggregateType<T extends ProcessoAnexosAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoAnexos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoAnexos[P]>
      : GetScalarType<T[P], AggregateProcessoAnexos[P]>
  }




  export type ProcessoAnexosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoAnexosWhereInput
    orderBy?: ProcessoAnexosOrderByWithAggregationInput | ProcessoAnexosOrderByWithAggregationInput[]
    by: ProcessoAnexosScalarFieldEnum[] | ProcessoAnexosScalarFieldEnum
    having?: ProcessoAnexosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoAnexosCountAggregateInputType | true
    _avg?: ProcessoAnexosAvgAggregateInputType
    _sum?: ProcessoAnexosSumAggregateInputType
    _min?: ProcessoAnexosMinAggregateInputType
    _max?: ProcessoAnexosMaxAggregateInputType
  }

  export type ProcessoAnexosGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    nome: string
    tipo_arquivo: string
    tamanho_bytes: number
    url: string
    categoria: string
    created_at: Date
    _count: ProcessoAnexosCountAggregateOutputType | null
    _avg: ProcessoAnexosAvgAggregateOutputType | null
    _sum: ProcessoAnexosSumAggregateOutputType | null
    _min: ProcessoAnexosMinAggregateOutputType | null
    _max: ProcessoAnexosMaxAggregateOutputType | null
  }

  type GetProcessoAnexosGroupByPayload<T extends ProcessoAnexosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoAnexosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoAnexosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoAnexosGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoAnexosGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoAnexosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    tipo_arquivo?: boolean
    tamanho_bytes?: boolean
    url?: boolean
    categoria?: boolean
    created_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoAnexos"]>

  export type ProcessoAnexosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    tipo_arquivo?: boolean
    tamanho_bytes?: boolean
    url?: boolean
    categoria?: boolean
    created_at?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoAnexos"]>

  export type ProcessoAnexosSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    nome?: boolean
    tipo_arquivo?: boolean
    tamanho_bytes?: boolean
    url?: boolean
    categoria?: boolean
    created_at?: boolean
  }

  export type ProcessoAnexosInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }
  export type ProcessoAnexosIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoAnexosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoAnexos"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      nome: string
      tipo_arquivo: string
      tamanho_bytes: number
      url: string
      categoria: string
      created_at: Date
    }, ExtArgs["result"]["processoAnexos"]>
    composites: {}
  }

  type ProcessoAnexosGetPayload<S extends boolean | null | undefined | ProcessoAnexosDefaultArgs> = $Result.GetResult<Prisma.$ProcessoAnexosPayload, S>

  type ProcessoAnexosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoAnexosFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoAnexosCountAggregateInputType | true
    }

  export interface ProcessoAnexosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoAnexos'], meta: { name: 'ProcessoAnexos' } }
    /**
     * Find zero or one ProcessoAnexos that matches the filter.
     * @param {ProcessoAnexosFindUniqueArgs} args - Arguments to find a ProcessoAnexos
     * @example
     * // Get one ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoAnexosFindUniqueArgs>(args: SelectSubset<T, ProcessoAnexosFindUniqueArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoAnexos that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoAnexosFindUniqueOrThrowArgs} args - Arguments to find a ProcessoAnexos
     * @example
     * // Get one ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoAnexosFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoAnexosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoAnexos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosFindFirstArgs} args - Arguments to find a ProcessoAnexos
     * @example
     * // Get one ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoAnexosFindFirstArgs>(args?: SelectSubset<T, ProcessoAnexosFindFirstArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoAnexos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosFindFirstOrThrowArgs} args - Arguments to find a ProcessoAnexos
     * @example
     * // Get one ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoAnexosFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoAnexosFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoAnexos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findMany()
     * 
     * // Get first 10 ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoAnexosWithIdOnly = await prisma.processoAnexos.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoAnexosFindManyArgs>(args?: SelectSubset<T, ProcessoAnexosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoAnexos.
     * @param {ProcessoAnexosCreateArgs} args - Arguments to create a ProcessoAnexos.
     * @example
     * // Create one ProcessoAnexos
     * const ProcessoAnexos = await prisma.processoAnexos.create({
     *   data: {
     *     // ... data to create a ProcessoAnexos
     *   }
     * })
     * 
     */
    create<T extends ProcessoAnexosCreateArgs>(args: SelectSubset<T, ProcessoAnexosCreateArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoAnexos.
     * @param {ProcessoAnexosCreateManyArgs} args - Arguments to create many ProcessoAnexos.
     * @example
     * // Create many ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoAnexosCreateManyArgs>(args?: SelectSubset<T, ProcessoAnexosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoAnexos and returns the data saved in the database.
     * @param {ProcessoAnexosCreateManyAndReturnArgs} args - Arguments to create many ProcessoAnexos.
     * @example
     * // Create many ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoAnexos and only return the `id`
     * const processoAnexosWithIdOnly = await prisma.processoAnexos.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoAnexosCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoAnexosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoAnexos.
     * @param {ProcessoAnexosDeleteArgs} args - Arguments to delete one ProcessoAnexos.
     * @example
     * // Delete one ProcessoAnexos
     * const ProcessoAnexos = await prisma.processoAnexos.delete({
     *   where: {
     *     // ... filter to delete one ProcessoAnexos
     *   }
     * })
     * 
     */
    delete<T extends ProcessoAnexosDeleteArgs>(args: SelectSubset<T, ProcessoAnexosDeleteArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoAnexos.
     * @param {ProcessoAnexosUpdateArgs} args - Arguments to update one ProcessoAnexos.
     * @example
     * // Update one ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoAnexosUpdateArgs>(args: SelectSubset<T, ProcessoAnexosUpdateArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoAnexos.
     * @param {ProcessoAnexosDeleteManyArgs} args - Arguments to filter ProcessoAnexos to delete.
     * @example
     * // Delete a few ProcessoAnexos
     * const { count } = await prisma.processoAnexos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoAnexosDeleteManyArgs>(args?: SelectSubset<T, ProcessoAnexosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoAnexos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoAnexosUpdateManyArgs>(args: SelectSubset<T, ProcessoAnexosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoAnexos.
     * @param {ProcessoAnexosUpsertArgs} args - Arguments to update or create a ProcessoAnexos.
     * @example
     * // Update or create a ProcessoAnexos
     * const processoAnexos = await prisma.processoAnexos.upsert({
     *   create: {
     *     // ... data to create a ProcessoAnexos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoAnexos we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoAnexosUpsertArgs>(args: SelectSubset<T, ProcessoAnexosUpsertArgs<ExtArgs>>): Prisma__ProcessoAnexosClient<$Result.GetResult<Prisma.$ProcessoAnexosPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoAnexos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosCountArgs} args - Arguments to filter ProcessoAnexos to count.
     * @example
     * // Count the number of ProcessoAnexos
     * const count = await prisma.processoAnexos.count({
     *   where: {
     *     // ... the filter for the ProcessoAnexos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoAnexosCountArgs>(
      args?: Subset<T, ProcessoAnexosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoAnexosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoAnexos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoAnexosAggregateArgs>(args: Subset<T, ProcessoAnexosAggregateArgs>): Prisma.PrismaPromise<GetProcessoAnexosAggregateType<T>>

    /**
     * Group by ProcessoAnexos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAnexosGroupByArgs} args - Group by arguments.
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
      T extends ProcessoAnexosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoAnexosGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoAnexosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoAnexosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoAnexosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoAnexos model
   */
  readonly fields: ProcessoAnexosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoAnexos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoAnexosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoAnexos model
   */ 
  interface ProcessoAnexosFieldRefs {
    readonly id: FieldRef<"ProcessoAnexos", 'String'>
    readonly tenant_id: FieldRef<"ProcessoAnexos", 'String'>
    readonly product_id: FieldRef<"ProcessoAnexos", 'String'>
    readonly user_id: FieldRef<"ProcessoAnexos", 'String'>
    readonly processo_id: FieldRef<"ProcessoAnexos", 'String'>
    readonly nome: FieldRef<"ProcessoAnexos", 'String'>
    readonly tipo_arquivo: FieldRef<"ProcessoAnexos", 'String'>
    readonly tamanho_bytes: FieldRef<"ProcessoAnexos", 'Int'>
    readonly url: FieldRef<"ProcessoAnexos", 'String'>
    readonly categoria: FieldRef<"ProcessoAnexos", 'String'>
    readonly created_at: FieldRef<"ProcessoAnexos", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoAnexos findUnique
   */
  export type ProcessoAnexosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoAnexos to fetch.
     */
    where: ProcessoAnexosWhereUniqueInput
  }

  /**
   * ProcessoAnexos findUniqueOrThrow
   */
  export type ProcessoAnexosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoAnexos to fetch.
     */
    where: ProcessoAnexosWhereUniqueInput
  }

  /**
   * ProcessoAnexos findFirst
   */
  export type ProcessoAnexosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoAnexos to fetch.
     */
    where?: ProcessoAnexosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoAnexos to fetch.
     */
    orderBy?: ProcessoAnexosOrderByWithRelationInput | ProcessoAnexosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoAnexos.
     */
    cursor?: ProcessoAnexosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoAnexos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoAnexos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoAnexos.
     */
    distinct?: ProcessoAnexosScalarFieldEnum | ProcessoAnexosScalarFieldEnum[]
  }

  /**
   * ProcessoAnexos findFirstOrThrow
   */
  export type ProcessoAnexosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoAnexos to fetch.
     */
    where?: ProcessoAnexosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoAnexos to fetch.
     */
    orderBy?: ProcessoAnexosOrderByWithRelationInput | ProcessoAnexosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoAnexos.
     */
    cursor?: ProcessoAnexosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoAnexos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoAnexos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoAnexos.
     */
    distinct?: ProcessoAnexosScalarFieldEnum | ProcessoAnexosScalarFieldEnum[]
  }

  /**
   * ProcessoAnexos findMany
   */
  export type ProcessoAnexosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoAnexos to fetch.
     */
    where?: ProcessoAnexosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoAnexos to fetch.
     */
    orderBy?: ProcessoAnexosOrderByWithRelationInput | ProcessoAnexosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoAnexos.
     */
    cursor?: ProcessoAnexosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoAnexos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoAnexos.
     */
    skip?: number
    distinct?: ProcessoAnexosScalarFieldEnum | ProcessoAnexosScalarFieldEnum[]
  }

  /**
   * ProcessoAnexos create
   */
  export type ProcessoAnexosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoAnexos.
     */
    data: XOR<ProcessoAnexosCreateInput, ProcessoAnexosUncheckedCreateInput>
  }

  /**
   * ProcessoAnexos createMany
   */
  export type ProcessoAnexosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoAnexos.
     */
    data: ProcessoAnexosCreateManyInput | ProcessoAnexosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoAnexos createManyAndReturn
   */
  export type ProcessoAnexosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoAnexos.
     */
    data: ProcessoAnexosCreateManyInput | ProcessoAnexosCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoAnexos update
   */
  export type ProcessoAnexosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoAnexos.
     */
    data: XOR<ProcessoAnexosUpdateInput, ProcessoAnexosUncheckedUpdateInput>
    /**
     * Choose, which ProcessoAnexos to update.
     */
    where: ProcessoAnexosWhereUniqueInput
  }

  /**
   * ProcessoAnexos updateMany
   */
  export type ProcessoAnexosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoAnexos.
     */
    data: XOR<ProcessoAnexosUpdateManyMutationInput, ProcessoAnexosUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoAnexos to update
     */
    where?: ProcessoAnexosWhereInput
  }

  /**
   * ProcessoAnexos upsert
   */
  export type ProcessoAnexosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoAnexos to update in case it exists.
     */
    where: ProcessoAnexosWhereUniqueInput
    /**
     * In case the ProcessoAnexos found by the `where` argument doesn't exist, create a new ProcessoAnexos with this data.
     */
    create: XOR<ProcessoAnexosCreateInput, ProcessoAnexosUncheckedCreateInput>
    /**
     * In case the ProcessoAnexos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoAnexosUpdateInput, ProcessoAnexosUncheckedUpdateInput>
  }

  /**
   * ProcessoAnexos delete
   */
  export type ProcessoAnexosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
    /**
     * Filter which ProcessoAnexos to delete.
     */
    where: ProcessoAnexosWhereUniqueInput
  }

  /**
   * ProcessoAnexos deleteMany
   */
  export type ProcessoAnexosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoAnexos to delete
     */
    where?: ProcessoAnexosWhereInput
  }

  /**
   * ProcessoAnexos without action
   */
  export type ProcessoAnexosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoAnexos
     */
    select?: ProcessoAnexosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoAnexosInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoEstimativaCusto
   */

  export type AggregateProcessoEstimativaCusto = {
    _count: ProcessoEstimativaCustoCountAggregateOutputType | null
    _avg: ProcessoEstimativaCustoAvgAggregateOutputType | null
    _sum: ProcessoEstimativaCustoSumAggregateOutputType | null
    _min: ProcessoEstimativaCustoMinAggregateOutputType | null
    _max: ProcessoEstimativaCustoMaxAggregateOutputType | null
  }

  export type ProcessoEstimativaCustoAvgAggregateOutputType = {
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
  }

  export type ProcessoEstimativaCustoSumAggregateOutputType = {
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
  }

  export type ProcessoEstimativaCustoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
    moeda: string | null
  }

  export type ProcessoEstimativaCustoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
    moeda: string | null
  }

  export type ProcessoEstimativaCustoCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    impostos: number
    frete: number
    despacho: number
    outros: number
    total: number
    moeda: number
    _all: number
  }


  export type ProcessoEstimativaCustoAvgAggregateInputType = {
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
  }

  export type ProcessoEstimativaCustoSumAggregateInputType = {
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
  }

  export type ProcessoEstimativaCustoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
    moeda?: true
  }

  export type ProcessoEstimativaCustoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
    moeda?: true
  }

  export type ProcessoEstimativaCustoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
    moeda?: true
    _all?: true
  }

  export type ProcessoEstimativaCustoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEstimativaCusto to aggregate.
     */
    where?: ProcessoEstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEstimativaCustos to fetch.
     */
    orderBy?: ProcessoEstimativaCustoOrderByWithRelationInput | ProcessoEstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoEstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoEstimativaCustos
    **/
    _count?: true | ProcessoEstimativaCustoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoEstimativaCustoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoEstimativaCustoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoEstimativaCustoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoEstimativaCustoMaxAggregateInputType
  }

  export type GetProcessoEstimativaCustoAggregateType<T extends ProcessoEstimativaCustoAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoEstimativaCusto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoEstimativaCusto[P]>
      : GetScalarType<T[P], AggregateProcessoEstimativaCusto[P]>
  }




  export type ProcessoEstimativaCustoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoEstimativaCustoWhereInput
    orderBy?: ProcessoEstimativaCustoOrderByWithAggregationInput | ProcessoEstimativaCustoOrderByWithAggregationInput[]
    by: ProcessoEstimativaCustoScalarFieldEnum[] | ProcessoEstimativaCustoScalarFieldEnum
    having?: ProcessoEstimativaCustoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoEstimativaCustoCountAggregateInputType | true
    _avg?: ProcessoEstimativaCustoAvgAggregateInputType
    _sum?: ProcessoEstimativaCustoSumAggregateInputType
    _min?: ProcessoEstimativaCustoMinAggregateInputType
    _max?: ProcessoEstimativaCustoMaxAggregateInputType
  }

  export type ProcessoEstimativaCustoGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    impostos: number
    frete: number
    despacho: number
    outros: number
    total: number
    moeda: string
    _count: ProcessoEstimativaCustoCountAggregateOutputType | null
    _avg: ProcessoEstimativaCustoAvgAggregateOutputType | null
    _sum: ProcessoEstimativaCustoSumAggregateOutputType | null
    _min: ProcessoEstimativaCustoMinAggregateOutputType | null
    _max: ProcessoEstimativaCustoMaxAggregateOutputType | null
  }

  type GetProcessoEstimativaCustoGroupByPayload<T extends ProcessoEstimativaCustoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoEstimativaCustoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoEstimativaCustoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoEstimativaCustoGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoEstimativaCustoGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoEstimativaCustoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    impostos?: boolean
    frete?: boolean
    despacho?: boolean
    outros?: boolean
    total?: boolean
    moeda?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEstimativaCusto"]>

  export type ProcessoEstimativaCustoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    impostos?: boolean
    frete?: boolean
    despacho?: boolean
    outros?: boolean
    total?: boolean
    moeda?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEstimativaCusto"]>

  export type ProcessoEstimativaCustoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    impostos?: boolean
    frete?: boolean
    despacho?: boolean
    outros?: boolean
    total?: boolean
    moeda?: boolean
  }

  export type ProcessoEstimativaCustoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }
  export type ProcessoEstimativaCustoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoEstimativaCustoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoEstimativaCusto"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      impostos: number
      frete: number
      despacho: number
      outros: number
      total: number
      moeda: string
    }, ExtArgs["result"]["processoEstimativaCusto"]>
    composites: {}
  }

  type ProcessoEstimativaCustoGetPayload<S extends boolean | null | undefined | ProcessoEstimativaCustoDefaultArgs> = $Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload, S>

  type ProcessoEstimativaCustoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoEstimativaCustoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoEstimativaCustoCountAggregateInputType | true
    }

  export interface ProcessoEstimativaCustoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoEstimativaCusto'], meta: { name: 'ProcessoEstimativaCusto' } }
    /**
     * Find zero or one ProcessoEstimativaCusto that matches the filter.
     * @param {ProcessoEstimativaCustoFindUniqueArgs} args - Arguments to find a ProcessoEstimativaCusto
     * @example
     * // Get one ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoEstimativaCustoFindUniqueArgs>(args: SelectSubset<T, ProcessoEstimativaCustoFindUniqueArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoEstimativaCusto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoEstimativaCustoFindUniqueOrThrowArgs} args - Arguments to find a ProcessoEstimativaCusto
     * @example
     * // Get one ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoEstimativaCustoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoEstimativaCustoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoEstimativaCusto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoFindFirstArgs} args - Arguments to find a ProcessoEstimativaCusto
     * @example
     * // Get one ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoEstimativaCustoFindFirstArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoFindFirstArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoEstimativaCusto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoFindFirstOrThrowArgs} args - Arguments to find a ProcessoEstimativaCusto
     * @example
     * // Get one ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoEstimativaCustoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoEstimativaCustos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoEstimativaCustos
     * const processoEstimativaCustos = await prisma.processoEstimativaCusto.findMany()
     * 
     * // Get first 10 ProcessoEstimativaCustos
     * const processoEstimativaCustos = await prisma.processoEstimativaCusto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoEstimativaCustoWithIdOnly = await prisma.processoEstimativaCusto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoEstimativaCustoFindManyArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoEstimativaCusto.
     * @param {ProcessoEstimativaCustoCreateArgs} args - Arguments to create a ProcessoEstimativaCusto.
     * @example
     * // Create one ProcessoEstimativaCusto
     * const ProcessoEstimativaCusto = await prisma.processoEstimativaCusto.create({
     *   data: {
     *     // ... data to create a ProcessoEstimativaCusto
     *   }
     * })
     * 
     */
    create<T extends ProcessoEstimativaCustoCreateArgs>(args: SelectSubset<T, ProcessoEstimativaCustoCreateArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoEstimativaCustos.
     * @param {ProcessoEstimativaCustoCreateManyArgs} args - Arguments to create many ProcessoEstimativaCustos.
     * @example
     * // Create many ProcessoEstimativaCustos
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoEstimativaCustoCreateManyArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoEstimativaCustos and returns the data saved in the database.
     * @param {ProcessoEstimativaCustoCreateManyAndReturnArgs} args - Arguments to create many ProcessoEstimativaCustos.
     * @example
     * // Create many ProcessoEstimativaCustos
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoEstimativaCustos and only return the `id`
     * const processoEstimativaCustoWithIdOnly = await prisma.processoEstimativaCusto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoEstimativaCustoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoEstimativaCusto.
     * @param {ProcessoEstimativaCustoDeleteArgs} args - Arguments to delete one ProcessoEstimativaCusto.
     * @example
     * // Delete one ProcessoEstimativaCusto
     * const ProcessoEstimativaCusto = await prisma.processoEstimativaCusto.delete({
     *   where: {
     *     // ... filter to delete one ProcessoEstimativaCusto
     *   }
     * })
     * 
     */
    delete<T extends ProcessoEstimativaCustoDeleteArgs>(args: SelectSubset<T, ProcessoEstimativaCustoDeleteArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoEstimativaCusto.
     * @param {ProcessoEstimativaCustoUpdateArgs} args - Arguments to update one ProcessoEstimativaCusto.
     * @example
     * // Update one ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoEstimativaCustoUpdateArgs>(args: SelectSubset<T, ProcessoEstimativaCustoUpdateArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoEstimativaCustos.
     * @param {ProcessoEstimativaCustoDeleteManyArgs} args - Arguments to filter ProcessoEstimativaCustos to delete.
     * @example
     * // Delete a few ProcessoEstimativaCustos
     * const { count } = await prisma.processoEstimativaCusto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoEstimativaCustoDeleteManyArgs>(args?: SelectSubset<T, ProcessoEstimativaCustoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoEstimativaCustos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoEstimativaCustos
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoEstimativaCustoUpdateManyArgs>(args: SelectSubset<T, ProcessoEstimativaCustoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoEstimativaCusto.
     * @param {ProcessoEstimativaCustoUpsertArgs} args - Arguments to update or create a ProcessoEstimativaCusto.
     * @example
     * // Update or create a ProcessoEstimativaCusto
     * const processoEstimativaCusto = await prisma.processoEstimativaCusto.upsert({
     *   create: {
     *     // ... data to create a ProcessoEstimativaCusto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoEstimativaCusto we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoEstimativaCustoUpsertArgs>(args: SelectSubset<T, ProcessoEstimativaCustoUpsertArgs<ExtArgs>>): Prisma__ProcessoEstimativaCustoClient<$Result.GetResult<Prisma.$ProcessoEstimativaCustoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoEstimativaCustos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoCountArgs} args - Arguments to filter ProcessoEstimativaCustos to count.
     * @example
     * // Count the number of ProcessoEstimativaCustos
     * const count = await prisma.processoEstimativaCusto.count({
     *   where: {
     *     // ... the filter for the ProcessoEstimativaCustos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoEstimativaCustoCountArgs>(
      args?: Subset<T, ProcessoEstimativaCustoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoEstimativaCustoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoEstimativaCusto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoEstimativaCustoAggregateArgs>(args: Subset<T, ProcessoEstimativaCustoAggregateArgs>): Prisma.PrismaPromise<GetProcessoEstimativaCustoAggregateType<T>>

    /**
     * Group by ProcessoEstimativaCusto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEstimativaCustoGroupByArgs} args - Group by arguments.
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
      T extends ProcessoEstimativaCustoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoEstimativaCustoGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoEstimativaCustoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoEstimativaCustoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoEstimativaCustoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoEstimativaCusto model
   */
  readonly fields: ProcessoEstimativaCustoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoEstimativaCusto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoEstimativaCustoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoEstimativaCusto model
   */ 
  interface ProcessoEstimativaCustoFieldRefs {
    readonly id: FieldRef<"ProcessoEstimativaCusto", 'String'>
    readonly tenant_id: FieldRef<"ProcessoEstimativaCusto", 'String'>
    readonly product_id: FieldRef<"ProcessoEstimativaCusto", 'String'>
    readonly user_id: FieldRef<"ProcessoEstimativaCusto", 'String'>
    readonly processo_id: FieldRef<"ProcessoEstimativaCusto", 'String'>
    readonly impostos: FieldRef<"ProcessoEstimativaCusto", 'Float'>
    readonly frete: FieldRef<"ProcessoEstimativaCusto", 'Float'>
    readonly despacho: FieldRef<"ProcessoEstimativaCusto", 'Float'>
    readonly outros: FieldRef<"ProcessoEstimativaCusto", 'Float'>
    readonly total: FieldRef<"ProcessoEstimativaCusto", 'Float'>
    readonly moeda: FieldRef<"ProcessoEstimativaCusto", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoEstimativaCusto findUnique
   */
  export type ProcessoEstimativaCustoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEstimativaCusto to fetch.
     */
    where: ProcessoEstimativaCustoWhereUniqueInput
  }

  /**
   * ProcessoEstimativaCusto findUniqueOrThrow
   */
  export type ProcessoEstimativaCustoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEstimativaCusto to fetch.
     */
    where: ProcessoEstimativaCustoWhereUniqueInput
  }

  /**
   * ProcessoEstimativaCusto findFirst
   */
  export type ProcessoEstimativaCustoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEstimativaCusto to fetch.
     */
    where?: ProcessoEstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEstimativaCustos to fetch.
     */
    orderBy?: ProcessoEstimativaCustoOrderByWithRelationInput | ProcessoEstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEstimativaCustos.
     */
    cursor?: ProcessoEstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoEstimativaCustos.
     */
    distinct?: ProcessoEstimativaCustoScalarFieldEnum | ProcessoEstimativaCustoScalarFieldEnum[]
  }

  /**
   * ProcessoEstimativaCusto findFirstOrThrow
   */
  export type ProcessoEstimativaCustoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEstimativaCusto to fetch.
     */
    where?: ProcessoEstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEstimativaCustos to fetch.
     */
    orderBy?: ProcessoEstimativaCustoOrderByWithRelationInput | ProcessoEstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEstimativaCustos.
     */
    cursor?: ProcessoEstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoEstimativaCustos.
     */
    distinct?: ProcessoEstimativaCustoScalarFieldEnum | ProcessoEstimativaCustoScalarFieldEnum[]
  }

  /**
   * ProcessoEstimativaCusto findMany
   */
  export type ProcessoEstimativaCustoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEstimativaCustos to fetch.
     */
    where?: ProcessoEstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEstimativaCustos to fetch.
     */
    orderBy?: ProcessoEstimativaCustoOrderByWithRelationInput | ProcessoEstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoEstimativaCustos.
     */
    cursor?: ProcessoEstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoEstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoEstimativaCustos.
     */
    skip?: number
    distinct?: ProcessoEstimativaCustoScalarFieldEnum | ProcessoEstimativaCustoScalarFieldEnum[]
  }

  /**
   * ProcessoEstimativaCusto create
   */
  export type ProcessoEstimativaCustoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoEstimativaCusto.
     */
    data: XOR<ProcessoEstimativaCustoCreateInput, ProcessoEstimativaCustoUncheckedCreateInput>
  }

  /**
   * ProcessoEstimativaCusto createMany
   */
  export type ProcessoEstimativaCustoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoEstimativaCustos.
     */
    data: ProcessoEstimativaCustoCreateManyInput | ProcessoEstimativaCustoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoEstimativaCusto createManyAndReturn
   */
  export type ProcessoEstimativaCustoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoEstimativaCustos.
     */
    data: ProcessoEstimativaCustoCreateManyInput | ProcessoEstimativaCustoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoEstimativaCusto update
   */
  export type ProcessoEstimativaCustoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoEstimativaCusto.
     */
    data: XOR<ProcessoEstimativaCustoUpdateInput, ProcessoEstimativaCustoUncheckedUpdateInput>
    /**
     * Choose, which ProcessoEstimativaCusto to update.
     */
    where: ProcessoEstimativaCustoWhereUniqueInput
  }

  /**
   * ProcessoEstimativaCusto updateMany
   */
  export type ProcessoEstimativaCustoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoEstimativaCustos.
     */
    data: XOR<ProcessoEstimativaCustoUpdateManyMutationInput, ProcessoEstimativaCustoUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoEstimativaCustos to update
     */
    where?: ProcessoEstimativaCustoWhereInput
  }

  /**
   * ProcessoEstimativaCusto upsert
   */
  export type ProcessoEstimativaCustoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoEstimativaCusto to update in case it exists.
     */
    where: ProcessoEstimativaCustoWhereUniqueInput
    /**
     * In case the ProcessoEstimativaCusto found by the `where` argument doesn't exist, create a new ProcessoEstimativaCusto with this data.
     */
    create: XOR<ProcessoEstimativaCustoCreateInput, ProcessoEstimativaCustoUncheckedCreateInput>
    /**
     * In case the ProcessoEstimativaCusto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoEstimativaCustoUpdateInput, ProcessoEstimativaCustoUncheckedUpdateInput>
  }

  /**
   * ProcessoEstimativaCusto delete
   */
  export type ProcessoEstimativaCustoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter which ProcessoEstimativaCusto to delete.
     */
    where: ProcessoEstimativaCustoWhereUniqueInput
  }

  /**
   * ProcessoEstimativaCusto deleteMany
   */
  export type ProcessoEstimativaCustoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEstimativaCustos to delete
     */
    where?: ProcessoEstimativaCustoWhereInput
  }

  /**
   * ProcessoEstimativaCusto without action
   */
  export type ProcessoEstimativaCustoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEstimativaCusto
     */
    select?: ProcessoEstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEstimativaCustoInclude<ExtArgs> | null
  }


  /**
   * Model ProcessoDadosTecnicos
   */

  export type AggregateProcessoDadosTecnicos = {
    _count: ProcessoDadosTecnicosCountAggregateOutputType | null
    _avg: ProcessoDadosTecnicosAvgAggregateOutputType | null
    _sum: ProcessoDadosTecnicosSumAggregateOutputType | null
    _min: ProcessoDadosTecnicosMinAggregateOutputType | null
    _max: ProcessoDadosTecnicosMaxAggregateOutputType | null
  }

  export type ProcessoDadosTecnicosAvgAggregateOutputType = {
    seguro_valor: number | null
  }

  export type ProcessoDadosTecnicosSumAggregateOutputType = {
    seguro_valor: number | null
  }

  export type ProcessoDadosTecnicosMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    importador_nome: string | null
    importador_cnpj: string | null
    importador_endereco: string | null
    exportador_nome: string | null
    exportador_pais: string | null
    exportador_endereco: string | null
    modal: string | null
    porto_embarque: string | null
    porto_destino: string | null
    navio_voo: string | null
    data_embarque: Date | null
    data_chegada_prevista: Date | null
    data_chegada_real: Date | null
    bl_numero: string | null
    container_numero: string | null
    despachante_nome: string | null
    despachante_contato: string | null
    di_numero: string | null
    di_data: Date | null
    canal: string | null
    seguro_apolice: string | null
    seguro_valor: number | null
    seguro_moeda: string | null
  }

  export type ProcessoDadosTecnicosMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    processo_id: string | null
    importador_nome: string | null
    importador_cnpj: string | null
    importador_endereco: string | null
    exportador_nome: string | null
    exportador_pais: string | null
    exportador_endereco: string | null
    modal: string | null
    porto_embarque: string | null
    porto_destino: string | null
    navio_voo: string | null
    data_embarque: Date | null
    data_chegada_prevista: Date | null
    data_chegada_real: Date | null
    bl_numero: string | null
    container_numero: string | null
    despachante_nome: string | null
    despachante_contato: string | null
    di_numero: string | null
    di_data: Date | null
    canal: string | null
    seguro_apolice: string | null
    seguro_valor: number | null
    seguro_moeda: string | null
  }

  export type ProcessoDadosTecnicosCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    processo_id: number
    importador_nome: number
    importador_cnpj: number
    importador_endereco: number
    exportador_nome: number
    exportador_pais: number
    exportador_endereco: number
    modal: number
    porto_embarque: number
    porto_destino: number
    navio_voo: number
    data_embarque: number
    data_chegada_prevista: number
    data_chegada_real: number
    bl_numero: number
    container_numero: number
    despachante_nome: number
    despachante_contato: number
    di_numero: number
    di_data: number
    canal: number
    seguro_apolice: number
    seguro_valor: number
    seguro_moeda: number
    _all: number
  }


  export type ProcessoDadosTecnicosAvgAggregateInputType = {
    seguro_valor?: true
  }

  export type ProcessoDadosTecnicosSumAggregateInputType = {
    seguro_valor?: true
  }

  export type ProcessoDadosTecnicosMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    importador_nome?: true
    importador_cnpj?: true
    importador_endereco?: true
    exportador_nome?: true
    exportador_pais?: true
    exportador_endereco?: true
    modal?: true
    porto_embarque?: true
    porto_destino?: true
    navio_voo?: true
    data_embarque?: true
    data_chegada_prevista?: true
    data_chegada_real?: true
    bl_numero?: true
    container_numero?: true
    despachante_nome?: true
    despachante_contato?: true
    di_numero?: true
    di_data?: true
    canal?: true
    seguro_apolice?: true
    seguro_valor?: true
    seguro_moeda?: true
  }

  export type ProcessoDadosTecnicosMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    importador_nome?: true
    importador_cnpj?: true
    importador_endereco?: true
    exportador_nome?: true
    exportador_pais?: true
    exportador_endereco?: true
    modal?: true
    porto_embarque?: true
    porto_destino?: true
    navio_voo?: true
    data_embarque?: true
    data_chegada_prevista?: true
    data_chegada_real?: true
    bl_numero?: true
    container_numero?: true
    despachante_nome?: true
    despachante_contato?: true
    di_numero?: true
    di_data?: true
    canal?: true
    seguro_apolice?: true
    seguro_valor?: true
    seguro_moeda?: true
  }

  export type ProcessoDadosTecnicosCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    processo_id?: true
    importador_nome?: true
    importador_cnpj?: true
    importador_endereco?: true
    exportador_nome?: true
    exportador_pais?: true
    exportador_endereco?: true
    modal?: true
    porto_embarque?: true
    porto_destino?: true
    navio_voo?: true
    data_embarque?: true
    data_chegada_prevista?: true
    data_chegada_real?: true
    bl_numero?: true
    container_numero?: true
    despachante_nome?: true
    despachante_contato?: true
    di_numero?: true
    di_data?: true
    canal?: true
    seguro_apolice?: true
    seguro_valor?: true
    seguro_moeda?: true
    _all?: true
  }

  export type ProcessoDadosTecnicosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoDadosTecnicos to aggregate.
     */
    where?: ProcessoDadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoDadosTecnicos to fetch.
     */
    orderBy?: ProcessoDadosTecnicosOrderByWithRelationInput | ProcessoDadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoDadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoDadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoDadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoDadosTecnicos
    **/
    _count?: true | ProcessoDadosTecnicosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoDadosTecnicosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoDadosTecnicosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoDadosTecnicosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoDadosTecnicosMaxAggregateInputType
  }

  export type GetProcessoDadosTecnicosAggregateType<T extends ProcessoDadosTecnicosAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoDadosTecnicos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoDadosTecnicos[P]>
      : GetScalarType<T[P], AggregateProcessoDadosTecnicos[P]>
  }




  export type ProcessoDadosTecnicosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoDadosTecnicosWhereInput
    orderBy?: ProcessoDadosTecnicosOrderByWithAggregationInput | ProcessoDadosTecnicosOrderByWithAggregationInput[]
    by: ProcessoDadosTecnicosScalarFieldEnum[] | ProcessoDadosTecnicosScalarFieldEnum
    having?: ProcessoDadosTecnicosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoDadosTecnicosCountAggregateInputType | true
    _avg?: ProcessoDadosTecnicosAvgAggregateInputType
    _sum?: ProcessoDadosTecnicosSumAggregateInputType
    _min?: ProcessoDadosTecnicosMinAggregateInputType
    _max?: ProcessoDadosTecnicosMaxAggregateInputType
  }

  export type ProcessoDadosTecnicosGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string | null
    processo_id: string
    importador_nome: string | null
    importador_cnpj: string | null
    importador_endereco: string | null
    exportador_nome: string | null
    exportador_pais: string | null
    exportador_endereco: string | null
    modal: string | null
    porto_embarque: string | null
    porto_destino: string | null
    navio_voo: string | null
    data_embarque: Date | null
    data_chegada_prevista: Date | null
    data_chegada_real: Date | null
    bl_numero: string | null
    container_numero: string | null
    despachante_nome: string | null
    despachante_contato: string | null
    di_numero: string | null
    di_data: Date | null
    canal: string | null
    seguro_apolice: string | null
    seguro_valor: number | null
    seguro_moeda: string | null
    _count: ProcessoDadosTecnicosCountAggregateOutputType | null
    _avg: ProcessoDadosTecnicosAvgAggregateOutputType | null
    _sum: ProcessoDadosTecnicosSumAggregateOutputType | null
    _min: ProcessoDadosTecnicosMinAggregateOutputType | null
    _max: ProcessoDadosTecnicosMaxAggregateOutputType | null
  }

  type GetProcessoDadosTecnicosGroupByPayload<T extends ProcessoDadosTecnicosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoDadosTecnicosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoDadosTecnicosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoDadosTecnicosGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoDadosTecnicosGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoDadosTecnicosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    importador_nome?: boolean
    importador_cnpj?: boolean
    importador_endereco?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    exportador_endereco?: boolean
    modal?: boolean
    porto_embarque?: boolean
    porto_destino?: boolean
    navio_voo?: boolean
    data_embarque?: boolean
    data_chegada_prevista?: boolean
    data_chegada_real?: boolean
    bl_numero?: boolean
    container_numero?: boolean
    despachante_nome?: boolean
    despachante_contato?: boolean
    di_numero?: boolean
    di_data?: boolean
    canal?: boolean
    seguro_apolice?: boolean
    seguro_valor?: boolean
    seguro_moeda?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoDadosTecnicos"]>

  export type ProcessoDadosTecnicosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    importador_nome?: boolean
    importador_cnpj?: boolean
    importador_endereco?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    exportador_endereco?: boolean
    modal?: boolean
    porto_embarque?: boolean
    porto_destino?: boolean
    navio_voo?: boolean
    data_embarque?: boolean
    data_chegada_prevista?: boolean
    data_chegada_real?: boolean
    bl_numero?: boolean
    container_numero?: boolean
    despachante_nome?: boolean
    despachante_contato?: boolean
    di_numero?: boolean
    di_data?: boolean
    canal?: boolean
    seguro_apolice?: boolean
    seguro_valor?: boolean
    seguro_moeda?: boolean
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoDadosTecnicos"]>

  export type ProcessoDadosTecnicosSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    processo_id?: boolean
    importador_nome?: boolean
    importador_cnpj?: boolean
    importador_endereco?: boolean
    exportador_nome?: boolean
    exportador_pais?: boolean
    exportador_endereco?: boolean
    modal?: boolean
    porto_embarque?: boolean
    porto_destino?: boolean
    navio_voo?: boolean
    data_embarque?: boolean
    data_chegada_prevista?: boolean
    data_chegada_real?: boolean
    bl_numero?: boolean
    container_numero?: boolean
    despachante_nome?: boolean
    despachante_contato?: boolean
    di_numero?: boolean
    di_data?: boolean
    canal?: boolean
    seguro_apolice?: boolean
    seguro_valor?: boolean
    seguro_moeda?: boolean
  }

  export type ProcessoDadosTecnicosInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }
  export type ProcessoDadosTecnicosIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoGravityDefaultArgs<ExtArgs>
  }

  export type $ProcessoDadosTecnicosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoDadosTecnicos"
    objects: {
      processo: Prisma.$ProcessoGravityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string | null
      processo_id: string
      importador_nome: string | null
      importador_cnpj: string | null
      importador_endereco: string | null
      exportador_nome: string | null
      exportador_pais: string | null
      exportador_endereco: string | null
      modal: string | null
      porto_embarque: string | null
      porto_destino: string | null
      navio_voo: string | null
      data_embarque: Date | null
      data_chegada_prevista: Date | null
      data_chegada_real: Date | null
      bl_numero: string | null
      container_numero: string | null
      despachante_nome: string | null
      despachante_contato: string | null
      di_numero: string | null
      di_data: Date | null
      canal: string | null
      seguro_apolice: string | null
      seguro_valor: number | null
      seguro_moeda: string | null
    }, ExtArgs["result"]["processoDadosTecnicos"]>
    composites: {}
  }

  type ProcessoDadosTecnicosGetPayload<S extends boolean | null | undefined | ProcessoDadosTecnicosDefaultArgs> = $Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload, S>

  type ProcessoDadosTecnicosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoDadosTecnicosFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoDadosTecnicosCountAggregateInputType | true
    }

  export interface ProcessoDadosTecnicosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoDadosTecnicos'], meta: { name: 'ProcessoDadosTecnicos' } }
    /**
     * Find zero or one ProcessoDadosTecnicos that matches the filter.
     * @param {ProcessoDadosTecnicosFindUniqueArgs} args - Arguments to find a ProcessoDadosTecnicos
     * @example
     * // Get one ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoDadosTecnicosFindUniqueArgs>(args: SelectSubset<T, ProcessoDadosTecnicosFindUniqueArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoDadosTecnicos that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoDadosTecnicosFindUniqueOrThrowArgs} args - Arguments to find a ProcessoDadosTecnicos
     * @example
     * // Get one ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoDadosTecnicosFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoDadosTecnicosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoDadosTecnicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosFindFirstArgs} args - Arguments to find a ProcessoDadosTecnicos
     * @example
     * // Get one ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoDadosTecnicosFindFirstArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosFindFirstArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoDadosTecnicos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosFindFirstOrThrowArgs} args - Arguments to find a ProcessoDadosTecnicos
     * @example
     * // Get one ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoDadosTecnicosFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoDadosTecnicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findMany()
     * 
     * // Get first 10 ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoDadosTecnicosWithIdOnly = await prisma.processoDadosTecnicos.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoDadosTecnicosFindManyArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosCreateArgs} args - Arguments to create a ProcessoDadosTecnicos.
     * @example
     * // Create one ProcessoDadosTecnicos
     * const ProcessoDadosTecnicos = await prisma.processoDadosTecnicos.create({
     *   data: {
     *     // ... data to create a ProcessoDadosTecnicos
     *   }
     * })
     * 
     */
    create<T extends ProcessoDadosTecnicosCreateArgs>(args: SelectSubset<T, ProcessoDadosTecnicosCreateArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosCreateManyArgs} args - Arguments to create many ProcessoDadosTecnicos.
     * @example
     * // Create many ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoDadosTecnicosCreateManyArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoDadosTecnicos and returns the data saved in the database.
     * @param {ProcessoDadosTecnicosCreateManyAndReturnArgs} args - Arguments to create many ProcessoDadosTecnicos.
     * @example
     * // Create many ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoDadosTecnicos and only return the `id`
     * const processoDadosTecnicosWithIdOnly = await prisma.processoDadosTecnicos.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoDadosTecnicosCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosDeleteArgs} args - Arguments to delete one ProcessoDadosTecnicos.
     * @example
     * // Delete one ProcessoDadosTecnicos
     * const ProcessoDadosTecnicos = await prisma.processoDadosTecnicos.delete({
     *   where: {
     *     // ... filter to delete one ProcessoDadosTecnicos
     *   }
     * })
     * 
     */
    delete<T extends ProcessoDadosTecnicosDeleteArgs>(args: SelectSubset<T, ProcessoDadosTecnicosDeleteArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosUpdateArgs} args - Arguments to update one ProcessoDadosTecnicos.
     * @example
     * // Update one ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoDadosTecnicosUpdateArgs>(args: SelectSubset<T, ProcessoDadosTecnicosUpdateArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosDeleteManyArgs} args - Arguments to filter ProcessoDadosTecnicos to delete.
     * @example
     * // Delete a few ProcessoDadosTecnicos
     * const { count } = await prisma.processoDadosTecnicos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoDadosTecnicosDeleteManyArgs>(args?: SelectSubset<T, ProcessoDadosTecnicosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoDadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoDadosTecnicosUpdateManyArgs>(args: SelectSubset<T, ProcessoDadosTecnicosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoDadosTecnicos.
     * @param {ProcessoDadosTecnicosUpsertArgs} args - Arguments to update or create a ProcessoDadosTecnicos.
     * @example
     * // Update or create a ProcessoDadosTecnicos
     * const processoDadosTecnicos = await prisma.processoDadosTecnicos.upsert({
     *   create: {
     *     // ... data to create a ProcessoDadosTecnicos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoDadosTecnicos we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoDadosTecnicosUpsertArgs>(args: SelectSubset<T, ProcessoDadosTecnicosUpsertArgs<ExtArgs>>): Prisma__ProcessoDadosTecnicosClient<$Result.GetResult<Prisma.$ProcessoDadosTecnicosPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoDadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosCountArgs} args - Arguments to filter ProcessoDadosTecnicos to count.
     * @example
     * // Count the number of ProcessoDadosTecnicos
     * const count = await prisma.processoDadosTecnicos.count({
     *   where: {
     *     // ... the filter for the ProcessoDadosTecnicos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoDadosTecnicosCountArgs>(
      args?: Subset<T, ProcessoDadosTecnicosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoDadosTecnicosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoDadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoDadosTecnicosAggregateArgs>(args: Subset<T, ProcessoDadosTecnicosAggregateArgs>): Prisma.PrismaPromise<GetProcessoDadosTecnicosAggregateType<T>>

    /**
     * Group by ProcessoDadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoDadosTecnicosGroupByArgs} args - Group by arguments.
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
      T extends ProcessoDadosTecnicosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoDadosTecnicosGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoDadosTecnicosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoDadosTecnicosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoDadosTecnicosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoDadosTecnicos model
   */
  readonly fields: ProcessoDadosTecnicosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoDadosTecnicos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoDadosTecnicosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoGravityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoGravityDefaultArgs<ExtArgs>>): Prisma__ProcessoGravityClient<$Result.GetResult<Prisma.$ProcessoGravityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProcessoDadosTecnicos model
   */ 
  interface ProcessoDadosTecnicosFieldRefs {
    readonly id: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly tenant_id: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly product_id: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly user_id: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly processo_id: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly importador_nome: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly importador_cnpj: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly importador_endereco: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly exportador_nome: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly exportador_pais: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly exportador_endereco: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly modal: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly porto_embarque: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly porto_destino: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly navio_voo: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly data_embarque: FieldRef<"ProcessoDadosTecnicos", 'DateTime'>
    readonly data_chegada_prevista: FieldRef<"ProcessoDadosTecnicos", 'DateTime'>
    readonly data_chegada_real: FieldRef<"ProcessoDadosTecnicos", 'DateTime'>
    readonly bl_numero: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly container_numero: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly despachante_nome: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly despachante_contato: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly di_numero: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly di_data: FieldRef<"ProcessoDadosTecnicos", 'DateTime'>
    readonly canal: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly seguro_apolice: FieldRef<"ProcessoDadosTecnicos", 'String'>
    readonly seguro_valor: FieldRef<"ProcessoDadosTecnicos", 'Float'>
    readonly seguro_moeda: FieldRef<"ProcessoDadosTecnicos", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoDadosTecnicos findUnique
   */
  export type ProcessoDadosTecnicosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoDadosTecnicos to fetch.
     */
    where: ProcessoDadosTecnicosWhereUniqueInput
  }

  /**
   * ProcessoDadosTecnicos findUniqueOrThrow
   */
  export type ProcessoDadosTecnicosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoDadosTecnicos to fetch.
     */
    where: ProcessoDadosTecnicosWhereUniqueInput
  }

  /**
   * ProcessoDadosTecnicos findFirst
   */
  export type ProcessoDadosTecnicosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoDadosTecnicos to fetch.
     */
    where?: ProcessoDadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoDadosTecnicos to fetch.
     */
    orderBy?: ProcessoDadosTecnicosOrderByWithRelationInput | ProcessoDadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoDadosTecnicos.
     */
    cursor?: ProcessoDadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoDadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoDadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoDadosTecnicos.
     */
    distinct?: ProcessoDadosTecnicosScalarFieldEnum | ProcessoDadosTecnicosScalarFieldEnum[]
  }

  /**
   * ProcessoDadosTecnicos findFirstOrThrow
   */
  export type ProcessoDadosTecnicosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoDadosTecnicos to fetch.
     */
    where?: ProcessoDadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoDadosTecnicos to fetch.
     */
    orderBy?: ProcessoDadosTecnicosOrderByWithRelationInput | ProcessoDadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoDadosTecnicos.
     */
    cursor?: ProcessoDadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoDadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoDadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoDadosTecnicos.
     */
    distinct?: ProcessoDadosTecnicosScalarFieldEnum | ProcessoDadosTecnicosScalarFieldEnum[]
  }

  /**
   * ProcessoDadosTecnicos findMany
   */
  export type ProcessoDadosTecnicosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoDadosTecnicos to fetch.
     */
    where?: ProcessoDadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoDadosTecnicos to fetch.
     */
    orderBy?: ProcessoDadosTecnicosOrderByWithRelationInput | ProcessoDadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoDadosTecnicos.
     */
    cursor?: ProcessoDadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoDadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoDadosTecnicos.
     */
    skip?: number
    distinct?: ProcessoDadosTecnicosScalarFieldEnum | ProcessoDadosTecnicosScalarFieldEnum[]
  }

  /**
   * ProcessoDadosTecnicos create
   */
  export type ProcessoDadosTecnicosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoDadosTecnicos.
     */
    data: XOR<ProcessoDadosTecnicosCreateInput, ProcessoDadosTecnicosUncheckedCreateInput>
  }

  /**
   * ProcessoDadosTecnicos createMany
   */
  export type ProcessoDadosTecnicosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoDadosTecnicos.
     */
    data: ProcessoDadosTecnicosCreateManyInput | ProcessoDadosTecnicosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoDadosTecnicos createManyAndReturn
   */
  export type ProcessoDadosTecnicosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoDadosTecnicos.
     */
    data: ProcessoDadosTecnicosCreateManyInput | ProcessoDadosTecnicosCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoDadosTecnicos update
   */
  export type ProcessoDadosTecnicosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoDadosTecnicos.
     */
    data: XOR<ProcessoDadosTecnicosUpdateInput, ProcessoDadosTecnicosUncheckedUpdateInput>
    /**
     * Choose, which ProcessoDadosTecnicos to update.
     */
    where: ProcessoDadosTecnicosWhereUniqueInput
  }

  /**
   * ProcessoDadosTecnicos updateMany
   */
  export type ProcessoDadosTecnicosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoDadosTecnicos.
     */
    data: XOR<ProcessoDadosTecnicosUpdateManyMutationInput, ProcessoDadosTecnicosUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoDadosTecnicos to update
     */
    where?: ProcessoDadosTecnicosWhereInput
  }

  /**
   * ProcessoDadosTecnicos upsert
   */
  export type ProcessoDadosTecnicosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoDadosTecnicos to update in case it exists.
     */
    where: ProcessoDadosTecnicosWhereUniqueInput
    /**
     * In case the ProcessoDadosTecnicos found by the `where` argument doesn't exist, create a new ProcessoDadosTecnicos with this data.
     */
    create: XOR<ProcessoDadosTecnicosCreateInput, ProcessoDadosTecnicosUncheckedCreateInput>
    /**
     * In case the ProcessoDadosTecnicos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoDadosTecnicosUpdateInput, ProcessoDadosTecnicosUncheckedUpdateInput>
  }

  /**
   * ProcessoDadosTecnicos delete
   */
  export type ProcessoDadosTecnicosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter which ProcessoDadosTecnicos to delete.
     */
    where: ProcessoDadosTecnicosWhereUniqueInput
  }

  /**
   * ProcessoDadosTecnicos deleteMany
   */
  export type ProcessoDadosTecnicosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoDadosTecnicos to delete
     */
    where?: ProcessoDadosTecnicosWhereInput
  }

  /**
   * ProcessoDadosTecnicos without action
   */
  export type ProcessoDadosTecnicosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoDadosTecnicos
     */
    select?: ProcessoDadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoDadosTecnicosInclude<ExtArgs> | null
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
    ordem: number | null
  }

  export type ProcessoStatusSumAggregateOutputType = {
    ordem: number | null
  }

  export type ProcessoStatusMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    nome: string | null
    rotulo: string | null
    cor: string | null
    icone: string | null
    ordem: number | null
    is_padrao: boolean | null
    is_sistema: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoStatusMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    nome: string | null
    rotulo: string | null
    cor: string | null
    icone: string | null
    ordem: number | null
    is_padrao: boolean | null
    is_sistema: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoStatusCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    nome: number
    rotulo: number
    cor: number
    icone: number
    ordem: number
    is_padrao: number
    is_sistema: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProcessoStatusAvgAggregateInputType = {
    ordem?: true
  }

  export type ProcessoStatusSumAggregateInputType = {
    ordem?: true
  }

  export type ProcessoStatusMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    cor?: true
    icone?: true
    ordem?: true
    is_padrao?: true
    is_sistema?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoStatusMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    cor?: true
    icone?: true
    ordem?: true
    is_padrao?: true
    is_sistema?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoStatusCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    cor?: true
    icone?: true
    ordem?: true
    is_padrao?: true
    is_sistema?: true
    created_at?: true
    updated_at?: true
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
    id: string
    tenant_id: string
    product_id: string | null
    nome: string
    rotulo: string
    cor: string
    icone: string | null
    ordem: number
    is_padrao: boolean
    is_sistema: boolean
    created_at: Date
    updated_at: Date
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
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    cor?: boolean
    icone?: boolean
    ordem?: boolean
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoStatus"]>

  export type ProcessoStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    cor?: boolean
    icone?: boolean
    ordem?: boolean
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoStatus"]>

  export type ProcessoStatusSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    cor?: boolean
    icone?: boolean
    ordem?: boolean
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ProcessoStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoStatus"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      nome: string
      rotulo: string
      cor: string
      icone: string | null
      ordem: number
      is_padrao: boolean
      is_sistema: boolean
      created_at: Date
      updated_at: Date
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
     * // Only select the `id`
     * const processoStatusWithIdOnly = await prisma.processoStatus.findMany({ select: { id: true } })
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
     * // Create many ProcessoStatuses and only return the `id`
     * const processoStatusWithIdOnly = await prisma.processoStatus.createManyAndReturn({ 
     *   select: { id: true },
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
    readonly id: FieldRef<"ProcessoStatus", 'String'>
    readonly tenant_id: FieldRef<"ProcessoStatus", 'String'>
    readonly product_id: FieldRef<"ProcessoStatus", 'String'>
    readonly nome: FieldRef<"ProcessoStatus", 'String'>
    readonly rotulo: FieldRef<"ProcessoStatus", 'String'>
    readonly cor: FieldRef<"ProcessoStatus", 'String'>
    readonly icone: FieldRef<"ProcessoStatus", 'String'>
    readonly ordem: FieldRef<"ProcessoStatus", 'Int'>
    readonly is_padrao: FieldRef<"ProcessoStatus", 'Boolean'>
    readonly is_sistema: FieldRef<"ProcessoStatus", 'Boolean'>
    readonly created_at: FieldRef<"ProcessoStatus", 'DateTime'>
    readonly updated_at: FieldRef<"ProcessoStatus", 'DateTime'>
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
   * ProcessoStatus without action
   */
  export type ProcessoStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoStatus
     */
    select?: ProcessoStatusSelect<ExtArgs> | null
  }


  /**
   * Model ProcessoColunas
   */

  export type AggregateProcessoColunas = {
    _count: ProcessoColunasCountAggregateOutputType | null
    _avg: ProcessoColunasAvgAggregateOutputType | null
    _sum: ProcessoColunasSumAggregateOutputType | null
    _min: ProcessoColunasMinAggregateOutputType | null
    _max: ProcessoColunasMaxAggregateOutputType | null
  }

  export type ProcessoColunasAvgAggregateOutputType = {
    casas_decimais: number | null
    ordem: number | null
  }

  export type ProcessoColunasSumAggregateOutputType = {
    casas_decimais: number | null
    ordem: number | null
  }

  export type ProcessoColunasMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    nome: string | null
    rotulo: string | null
    tipo: string | null
    casas_decimais: number | null
    ordem: number | null
    filtravel: boolean | null
    exibida_padrao: boolean | null
    index_criado: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoColunasMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    nome: string | null
    rotulo: string | null
    tipo: string | null
    casas_decimais: number | null
    ordem: number | null
    filtravel: boolean | null
    exibida_padrao: boolean | null
    index_criado: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProcessoColunasCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    nome: number
    rotulo: number
    tipo: number
    casas_decimais: number
    opcoes: number
    ordem: number
    filtravel: number
    exibida_padrao: number
    index_criado: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProcessoColunasAvgAggregateInputType = {
    casas_decimais?: true
    ordem?: true
  }

  export type ProcessoColunasSumAggregateInputType = {
    casas_decimais?: true
    ordem?: true
  }

  export type ProcessoColunasMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    tipo?: true
    casas_decimais?: true
    ordem?: true
    filtravel?: true
    exibida_padrao?: true
    index_criado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoColunasMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    tipo?: true
    casas_decimais?: true
    ordem?: true
    filtravel?: true
    exibida_padrao?: true
    index_criado?: true
    created_at?: true
    updated_at?: true
  }

  export type ProcessoColunasCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    nome?: true
    rotulo?: true
    tipo?: true
    casas_decimais?: true
    opcoes?: true
    ordem?: true
    filtravel?: true
    exibida_padrao?: true
    index_criado?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessoColunasAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoColunas to aggregate.
     */
    where?: ProcessoColunasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoColunas to fetch.
     */
    orderBy?: ProcessoColunasOrderByWithRelationInput | ProcessoColunasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoColunasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoColunas
    **/
    _count?: true | ProcessoColunasCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProcessoColunasAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProcessoColunasSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoColunasMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoColunasMaxAggregateInputType
  }

  export type GetProcessoColunasAggregateType<T extends ProcessoColunasAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoColunas]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoColunas[P]>
      : GetScalarType<T[P], AggregateProcessoColunas[P]>
  }




  export type ProcessoColunasGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoColunasWhereInput
    orderBy?: ProcessoColunasOrderByWithAggregationInput | ProcessoColunasOrderByWithAggregationInput[]
    by: ProcessoColunasScalarFieldEnum[] | ProcessoColunasScalarFieldEnum
    having?: ProcessoColunasScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoColunasCountAggregateInputType | true
    _avg?: ProcessoColunasAvgAggregateInputType
    _sum?: ProcessoColunasSumAggregateInputType
    _min?: ProcessoColunasMinAggregateInputType
    _max?: ProcessoColunasMaxAggregateInputType
  }

  export type ProcessoColunasGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    nome: string
    rotulo: string
    tipo: string
    casas_decimais: number
    opcoes: JsonValue | null
    ordem: number
    filtravel: boolean
    exibida_padrao: boolean
    index_criado: boolean
    created_at: Date
    updated_at: Date
    _count: ProcessoColunasCountAggregateOutputType | null
    _avg: ProcessoColunasAvgAggregateOutputType | null
    _sum: ProcessoColunasSumAggregateOutputType | null
    _min: ProcessoColunasMinAggregateOutputType | null
    _max: ProcessoColunasMaxAggregateOutputType | null
  }

  type GetProcessoColunasGroupByPayload<T extends ProcessoColunasGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoColunasGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoColunasGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoColunasGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoColunasGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoColunasSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    tipo?: boolean
    casas_decimais?: boolean
    opcoes?: boolean
    ordem?: boolean
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoColunas"]>

  export type ProcessoColunasSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    tipo?: boolean
    casas_decimais?: boolean
    opcoes?: boolean
    ordem?: boolean
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoColunas"]>

  export type ProcessoColunasSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    nome?: boolean
    rotulo?: boolean
    tipo?: boolean
    casas_decimais?: boolean
    opcoes?: boolean
    ordem?: boolean
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $ProcessoColunasPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoColunas"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      nome: string
      rotulo: string
      tipo: string
      casas_decimais: number
      opcoes: Prisma.JsonValue | null
      ordem: number
      filtravel: boolean
      exibida_padrao: boolean
      index_criado: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["processoColunas"]>
    composites: {}
  }

  type ProcessoColunasGetPayload<S extends boolean | null | undefined | ProcessoColunasDefaultArgs> = $Result.GetResult<Prisma.$ProcessoColunasPayload, S>

  type ProcessoColunasCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoColunasFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoColunasCountAggregateInputType | true
    }

  export interface ProcessoColunasDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoColunas'], meta: { name: 'ProcessoColunas' } }
    /**
     * Find zero or one ProcessoColunas that matches the filter.
     * @param {ProcessoColunasFindUniqueArgs} args - Arguments to find a ProcessoColunas
     * @example
     * // Get one ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoColunasFindUniqueArgs>(args: SelectSubset<T, ProcessoColunasFindUniqueArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoColunas that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoColunasFindUniqueOrThrowArgs} args - Arguments to find a ProcessoColunas
     * @example
     * // Get one ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoColunasFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoColunasFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoColunas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasFindFirstArgs} args - Arguments to find a ProcessoColunas
     * @example
     * // Get one ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoColunasFindFirstArgs>(args?: SelectSubset<T, ProcessoColunasFindFirstArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoColunas that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasFindFirstOrThrowArgs} args - Arguments to find a ProcessoColunas
     * @example
     * // Get one ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoColunasFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoColunasFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoColunas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findMany()
     * 
     * // Get first 10 ProcessoColunas
     * const processoColunas = await prisma.processoColunas.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoColunasWithIdOnly = await prisma.processoColunas.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoColunasFindManyArgs>(args?: SelectSubset<T, ProcessoColunasFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoColunas.
     * @param {ProcessoColunasCreateArgs} args - Arguments to create a ProcessoColunas.
     * @example
     * // Create one ProcessoColunas
     * const ProcessoColunas = await prisma.processoColunas.create({
     *   data: {
     *     // ... data to create a ProcessoColunas
     *   }
     * })
     * 
     */
    create<T extends ProcessoColunasCreateArgs>(args: SelectSubset<T, ProcessoColunasCreateArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoColunas.
     * @param {ProcessoColunasCreateManyArgs} args - Arguments to create many ProcessoColunas.
     * @example
     * // Create many ProcessoColunas
     * const processoColunas = await prisma.processoColunas.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoColunasCreateManyArgs>(args?: SelectSubset<T, ProcessoColunasCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoColunas and returns the data saved in the database.
     * @param {ProcessoColunasCreateManyAndReturnArgs} args - Arguments to create many ProcessoColunas.
     * @example
     * // Create many ProcessoColunas
     * const processoColunas = await prisma.processoColunas.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoColunas and only return the `id`
     * const processoColunasWithIdOnly = await prisma.processoColunas.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoColunasCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoColunasCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoColunas.
     * @param {ProcessoColunasDeleteArgs} args - Arguments to delete one ProcessoColunas.
     * @example
     * // Delete one ProcessoColunas
     * const ProcessoColunas = await prisma.processoColunas.delete({
     *   where: {
     *     // ... filter to delete one ProcessoColunas
     *   }
     * })
     * 
     */
    delete<T extends ProcessoColunasDeleteArgs>(args: SelectSubset<T, ProcessoColunasDeleteArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoColunas.
     * @param {ProcessoColunasUpdateArgs} args - Arguments to update one ProcessoColunas.
     * @example
     * // Update one ProcessoColunas
     * const processoColunas = await prisma.processoColunas.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoColunasUpdateArgs>(args: SelectSubset<T, ProcessoColunasUpdateArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoColunas.
     * @param {ProcessoColunasDeleteManyArgs} args - Arguments to filter ProcessoColunas to delete.
     * @example
     * // Delete a few ProcessoColunas
     * const { count } = await prisma.processoColunas.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoColunasDeleteManyArgs>(args?: SelectSubset<T, ProcessoColunasDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoColunas
     * const processoColunas = await prisma.processoColunas.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoColunasUpdateManyArgs>(args: SelectSubset<T, ProcessoColunasUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoColunas.
     * @param {ProcessoColunasUpsertArgs} args - Arguments to update or create a ProcessoColunas.
     * @example
     * // Update or create a ProcessoColunas
     * const processoColunas = await prisma.processoColunas.upsert({
     *   create: {
     *     // ... data to create a ProcessoColunas
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoColunas we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoColunasUpsertArgs>(args: SelectSubset<T, ProcessoColunasUpsertArgs<ExtArgs>>): Prisma__ProcessoColunasClient<$Result.GetResult<Prisma.$ProcessoColunasPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasCountArgs} args - Arguments to filter ProcessoColunas to count.
     * @example
     * // Count the number of ProcessoColunas
     * const count = await prisma.processoColunas.count({
     *   where: {
     *     // ... the filter for the ProcessoColunas we want to count
     *   }
     * })
    **/
    count<T extends ProcessoColunasCountArgs>(
      args?: Subset<T, ProcessoColunasCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoColunasCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoColunasAggregateArgs>(args: Subset<T, ProcessoColunasAggregateArgs>): Prisma.PrismaPromise<GetProcessoColunasAggregateType<T>>

    /**
     * Group by ProcessoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoColunasGroupByArgs} args - Group by arguments.
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
      T extends ProcessoColunasGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoColunasGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoColunasGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoColunasGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoColunasGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoColunas model
   */
  readonly fields: ProcessoColunasFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoColunas.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoColunasClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProcessoColunas model
   */ 
  interface ProcessoColunasFieldRefs {
    readonly id: FieldRef<"ProcessoColunas", 'String'>
    readonly tenant_id: FieldRef<"ProcessoColunas", 'String'>
    readonly product_id: FieldRef<"ProcessoColunas", 'String'>
    readonly nome: FieldRef<"ProcessoColunas", 'String'>
    readonly rotulo: FieldRef<"ProcessoColunas", 'String'>
    readonly tipo: FieldRef<"ProcessoColunas", 'String'>
    readonly casas_decimais: FieldRef<"ProcessoColunas", 'Int'>
    readonly opcoes: FieldRef<"ProcessoColunas", 'Json'>
    readonly ordem: FieldRef<"ProcessoColunas", 'Int'>
    readonly filtravel: FieldRef<"ProcessoColunas", 'Boolean'>
    readonly exibida_padrao: FieldRef<"ProcessoColunas", 'Boolean'>
    readonly index_criado: FieldRef<"ProcessoColunas", 'Boolean'>
    readonly created_at: FieldRef<"ProcessoColunas", 'DateTime'>
    readonly updated_at: FieldRef<"ProcessoColunas", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoColunas findUnique
   */
  export type ProcessoColunasFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoColunas to fetch.
     */
    where: ProcessoColunasWhereUniqueInput
  }

  /**
   * ProcessoColunas findUniqueOrThrow
   */
  export type ProcessoColunasFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoColunas to fetch.
     */
    where: ProcessoColunasWhereUniqueInput
  }

  /**
   * ProcessoColunas findFirst
   */
  export type ProcessoColunasFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoColunas to fetch.
     */
    where?: ProcessoColunasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoColunas to fetch.
     */
    orderBy?: ProcessoColunasOrderByWithRelationInput | ProcessoColunasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoColunas.
     */
    cursor?: ProcessoColunasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoColunas.
     */
    distinct?: ProcessoColunasScalarFieldEnum | ProcessoColunasScalarFieldEnum[]
  }

  /**
   * ProcessoColunas findFirstOrThrow
   */
  export type ProcessoColunasFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoColunas to fetch.
     */
    where?: ProcessoColunasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoColunas to fetch.
     */
    orderBy?: ProcessoColunasOrderByWithRelationInput | ProcessoColunasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoColunas.
     */
    cursor?: ProcessoColunasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoColunas.
     */
    distinct?: ProcessoColunasScalarFieldEnum | ProcessoColunasScalarFieldEnum[]
  }

  /**
   * ProcessoColunas findMany
   */
  export type ProcessoColunasFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoColunas to fetch.
     */
    where?: ProcessoColunasWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoColunas to fetch.
     */
    orderBy?: ProcessoColunasOrderByWithRelationInput | ProcessoColunasOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoColunas.
     */
    cursor?: ProcessoColunasWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoColunas.
     */
    skip?: number
    distinct?: ProcessoColunasScalarFieldEnum | ProcessoColunasScalarFieldEnum[]
  }

  /**
   * ProcessoColunas create
   */
  export type ProcessoColunasCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * The data needed to create a ProcessoColunas.
     */
    data: XOR<ProcessoColunasCreateInput, ProcessoColunasUncheckedCreateInput>
  }

  /**
   * ProcessoColunas createMany
   */
  export type ProcessoColunasCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoColunas.
     */
    data: ProcessoColunasCreateManyInput | ProcessoColunasCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoColunas createManyAndReturn
   */
  export type ProcessoColunasCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoColunas.
     */
    data: ProcessoColunasCreateManyInput | ProcessoColunasCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoColunas update
   */
  export type ProcessoColunasUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * The data needed to update a ProcessoColunas.
     */
    data: XOR<ProcessoColunasUpdateInput, ProcessoColunasUncheckedUpdateInput>
    /**
     * Choose, which ProcessoColunas to update.
     */
    where: ProcessoColunasWhereUniqueInput
  }

  /**
   * ProcessoColunas updateMany
   */
  export type ProcessoColunasUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoColunas.
     */
    data: XOR<ProcessoColunasUpdateManyMutationInput, ProcessoColunasUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoColunas to update
     */
    where?: ProcessoColunasWhereInput
  }

  /**
   * ProcessoColunas upsert
   */
  export type ProcessoColunasUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * The filter to search for the ProcessoColunas to update in case it exists.
     */
    where: ProcessoColunasWhereUniqueInput
    /**
     * In case the ProcessoColunas found by the `where` argument doesn't exist, create a new ProcessoColunas with this data.
     */
    create: XOR<ProcessoColunasCreateInput, ProcessoColunasUncheckedCreateInput>
    /**
     * In case the ProcessoColunas was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoColunasUpdateInput, ProcessoColunasUncheckedUpdateInput>
  }

  /**
   * ProcessoColunas delete
   */
  export type ProcessoColunasDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
    /**
     * Filter which ProcessoColunas to delete.
     */
    where: ProcessoColunasWhereUniqueInput
  }

  /**
   * ProcessoColunas deleteMany
   */
  export type ProcessoColunasDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoColunas to delete
     */
    where?: ProcessoColunasWhereInput
  }

  /**
   * ProcessoColunas without action
   */
  export type ProcessoColunasDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoColunas
     */
    select?: ProcessoColunasSelect<ExtArgs> | null
  }


  /**
   * Model ProcessosPedidoPreferencia
   */

  export type AggregateProcessosPedidoPreferencia = {
    _count: ProcessosPedidoPreferenciaCountAggregateOutputType | null
    _min: ProcessosPedidoPreferenciaMinAggregateOutputType | null
    _max: ProcessosPedidoPreferenciaMaxAggregateOutputType | null
  }

  export type ProcessosPedidoPreferenciaMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    updated_at: Date | null
  }

  export type ProcessosPedidoPreferenciaMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    updated_at: Date | null
  }

  export type ProcessosPedidoPreferenciaCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    colunas_visiveis: number
    colunas_largura: number
    updated_at: number
    _all: number
  }


  export type ProcessosPedidoPreferenciaMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    updated_at?: true
  }

  export type ProcessosPedidoPreferenciaMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    updated_at?: true
  }

  export type ProcessosPedidoPreferenciaCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    colunas_visiveis?: true
    colunas_largura?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessosPedidoPreferenciaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessosPedidoPreferencia to aggregate.
     */
    where?: ProcessosPedidoPreferenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessosPedidoPreferencias to fetch.
     */
    orderBy?: ProcessosPedidoPreferenciaOrderByWithRelationInput | ProcessosPedidoPreferenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessosPedidoPreferenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessosPedidoPreferencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessosPedidoPreferencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessosPedidoPreferencias
    **/
    _count?: true | ProcessosPedidoPreferenciaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessosPedidoPreferenciaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessosPedidoPreferenciaMaxAggregateInputType
  }

  export type GetProcessosPedidoPreferenciaAggregateType<T extends ProcessosPedidoPreferenciaAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessosPedidoPreferencia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessosPedidoPreferencia[P]>
      : GetScalarType<T[P], AggregateProcessosPedidoPreferencia[P]>
  }




  export type ProcessosPedidoPreferenciaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessosPedidoPreferenciaWhereInput
    orderBy?: ProcessosPedidoPreferenciaOrderByWithAggregationInput | ProcessosPedidoPreferenciaOrderByWithAggregationInput[]
    by: ProcessosPedidoPreferenciaScalarFieldEnum[] | ProcessosPedidoPreferenciaScalarFieldEnum
    having?: ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessosPedidoPreferenciaCountAggregateInputType | true
    _min?: ProcessosPedidoPreferenciaMinAggregateInputType
    _max?: ProcessosPedidoPreferenciaMaxAggregateInputType
  }

  export type ProcessosPedidoPreferenciaGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string
    colunas_visiveis: string[]
    colunas_largura: JsonValue | null
    updated_at: Date
    _count: ProcessosPedidoPreferenciaCountAggregateOutputType | null
    _min: ProcessosPedidoPreferenciaMinAggregateOutputType | null
    _max: ProcessosPedidoPreferenciaMaxAggregateOutputType | null
  }

  type GetProcessosPedidoPreferenciaGroupByPayload<T extends ProcessosPedidoPreferenciaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessosPedidoPreferenciaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessosPedidoPreferenciaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessosPedidoPreferenciaGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessosPedidoPreferenciaGroupByOutputType[P]>
        }
      >
    >


  export type ProcessosPedidoPreferenciaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processosPedidoPreferencia"]>

  export type ProcessosPedidoPreferenciaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processosPedidoPreferencia"]>

  export type ProcessosPedidoPreferenciaSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }


  export type $ProcessosPedidoPreferenciaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessosPedidoPreferencia"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string
      colunas_visiveis: string[]
      colunas_largura: Prisma.JsonValue | null
      updated_at: Date
    }, ExtArgs["result"]["processosPedidoPreferencia"]>
    composites: {}
  }

  type ProcessosPedidoPreferenciaGetPayload<S extends boolean | null | undefined | ProcessosPedidoPreferenciaDefaultArgs> = $Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload, S>

  type ProcessosPedidoPreferenciaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessosPedidoPreferenciaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessosPedidoPreferenciaCountAggregateInputType | true
    }

  export interface ProcessosPedidoPreferenciaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessosPedidoPreferencia'], meta: { name: 'ProcessosPedidoPreferencia' } }
    /**
     * Find zero or one ProcessosPedidoPreferencia that matches the filter.
     * @param {ProcessosPedidoPreferenciaFindUniqueArgs} args - Arguments to find a ProcessosPedidoPreferencia
     * @example
     * // Get one ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessosPedidoPreferenciaFindUniqueArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaFindUniqueArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessosPedidoPreferencia that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessosPedidoPreferenciaFindUniqueOrThrowArgs} args - Arguments to find a ProcessosPedidoPreferencia
     * @example
     * // Get one ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessosPedidoPreferenciaFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessosPedidoPreferencia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaFindFirstArgs} args - Arguments to find a ProcessosPedidoPreferencia
     * @example
     * // Get one ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessosPedidoPreferenciaFindFirstArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaFindFirstArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessosPedidoPreferencia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaFindFirstOrThrowArgs} args - Arguments to find a ProcessosPedidoPreferencia
     * @example
     * // Get one ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessosPedidoPreferenciaFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessosPedidoPreferencias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessosPedidoPreferencias
     * const processosPedidoPreferencias = await prisma.processosPedidoPreferencia.findMany()
     * 
     * // Get first 10 ProcessosPedidoPreferencias
     * const processosPedidoPreferencias = await prisma.processosPedidoPreferencia.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processosPedidoPreferenciaWithIdOnly = await prisma.processosPedidoPreferencia.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessosPedidoPreferenciaFindManyArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessosPedidoPreferencia.
     * @param {ProcessosPedidoPreferenciaCreateArgs} args - Arguments to create a ProcessosPedidoPreferencia.
     * @example
     * // Create one ProcessosPedidoPreferencia
     * const ProcessosPedidoPreferencia = await prisma.processosPedidoPreferencia.create({
     *   data: {
     *     // ... data to create a ProcessosPedidoPreferencia
     *   }
     * })
     * 
     */
    create<T extends ProcessosPedidoPreferenciaCreateArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaCreateArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessosPedidoPreferencias.
     * @param {ProcessosPedidoPreferenciaCreateManyArgs} args - Arguments to create many ProcessosPedidoPreferencias.
     * @example
     * // Create many ProcessosPedidoPreferencias
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessosPedidoPreferenciaCreateManyArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessosPedidoPreferencias and returns the data saved in the database.
     * @param {ProcessosPedidoPreferenciaCreateManyAndReturnArgs} args - Arguments to create many ProcessosPedidoPreferencias.
     * @example
     * // Create many ProcessosPedidoPreferencias
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessosPedidoPreferencias and only return the `id`
     * const processosPedidoPreferenciaWithIdOnly = await prisma.processosPedidoPreferencia.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessosPedidoPreferenciaCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessosPedidoPreferencia.
     * @param {ProcessosPedidoPreferenciaDeleteArgs} args - Arguments to delete one ProcessosPedidoPreferencia.
     * @example
     * // Delete one ProcessosPedidoPreferencia
     * const ProcessosPedidoPreferencia = await prisma.processosPedidoPreferencia.delete({
     *   where: {
     *     // ... filter to delete one ProcessosPedidoPreferencia
     *   }
     * })
     * 
     */
    delete<T extends ProcessosPedidoPreferenciaDeleteArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaDeleteArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessosPedidoPreferencia.
     * @param {ProcessosPedidoPreferenciaUpdateArgs} args - Arguments to update one ProcessosPedidoPreferencia.
     * @example
     * // Update one ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessosPedidoPreferenciaUpdateArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaUpdateArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessosPedidoPreferencias.
     * @param {ProcessosPedidoPreferenciaDeleteManyArgs} args - Arguments to filter ProcessosPedidoPreferencias to delete.
     * @example
     * // Delete a few ProcessosPedidoPreferencias
     * const { count } = await prisma.processosPedidoPreferencia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessosPedidoPreferenciaDeleteManyArgs>(args?: SelectSubset<T, ProcessosPedidoPreferenciaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessosPedidoPreferencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessosPedidoPreferencias
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessosPedidoPreferenciaUpdateManyArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessosPedidoPreferencia.
     * @param {ProcessosPedidoPreferenciaUpsertArgs} args - Arguments to update or create a ProcessosPedidoPreferencia.
     * @example
     * // Update or create a ProcessosPedidoPreferencia
     * const processosPedidoPreferencia = await prisma.processosPedidoPreferencia.upsert({
     *   create: {
     *     // ... data to create a ProcessosPedidoPreferencia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessosPedidoPreferencia we want to update
     *   }
     * })
     */
    upsert<T extends ProcessosPedidoPreferenciaUpsertArgs>(args: SelectSubset<T, ProcessosPedidoPreferenciaUpsertArgs<ExtArgs>>): Prisma__ProcessosPedidoPreferenciaClient<$Result.GetResult<Prisma.$ProcessosPedidoPreferenciaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessosPedidoPreferencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaCountArgs} args - Arguments to filter ProcessosPedidoPreferencias to count.
     * @example
     * // Count the number of ProcessosPedidoPreferencias
     * const count = await prisma.processosPedidoPreferencia.count({
     *   where: {
     *     // ... the filter for the ProcessosPedidoPreferencias we want to count
     *   }
     * })
    **/
    count<T extends ProcessosPedidoPreferenciaCountArgs>(
      args?: Subset<T, ProcessosPedidoPreferenciaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessosPedidoPreferenciaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessosPedidoPreferencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessosPedidoPreferenciaAggregateArgs>(args: Subset<T, ProcessosPedidoPreferenciaAggregateArgs>): Prisma.PrismaPromise<GetProcessosPedidoPreferenciaAggregateType<T>>

    /**
     * Group by ProcessosPedidoPreferencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessosPedidoPreferenciaGroupByArgs} args - Group by arguments.
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
      T extends ProcessosPedidoPreferenciaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessosPedidoPreferenciaGroupByArgs['orderBy'] }
        : { orderBy?: ProcessosPedidoPreferenciaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessosPedidoPreferenciaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessosPedidoPreferenciaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessosPedidoPreferencia model
   */
  readonly fields: ProcessosPedidoPreferenciaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessosPedidoPreferencia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessosPedidoPreferenciaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProcessosPedidoPreferencia model
   */ 
  interface ProcessosPedidoPreferenciaFieldRefs {
    readonly id: FieldRef<"ProcessosPedidoPreferencia", 'String'>
    readonly tenant_id: FieldRef<"ProcessosPedidoPreferencia", 'String'>
    readonly product_id: FieldRef<"ProcessosPedidoPreferencia", 'String'>
    readonly user_id: FieldRef<"ProcessosPedidoPreferencia", 'String'>
    readonly colunas_visiveis: FieldRef<"ProcessosPedidoPreferencia", 'String[]'>
    readonly colunas_largura: FieldRef<"ProcessosPedidoPreferencia", 'Json'>
    readonly updated_at: FieldRef<"ProcessosPedidoPreferencia", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessosPedidoPreferencia findUnique
   */
  export type ProcessosPedidoPreferenciaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter, which ProcessosPedidoPreferencia to fetch.
     */
    where: ProcessosPedidoPreferenciaWhereUniqueInput
  }

  /**
   * ProcessosPedidoPreferencia findUniqueOrThrow
   */
  export type ProcessosPedidoPreferenciaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter, which ProcessosPedidoPreferencia to fetch.
     */
    where: ProcessosPedidoPreferenciaWhereUniqueInput
  }

  /**
   * ProcessosPedidoPreferencia findFirst
   */
  export type ProcessosPedidoPreferenciaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter, which ProcessosPedidoPreferencia to fetch.
     */
    where?: ProcessosPedidoPreferenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessosPedidoPreferencias to fetch.
     */
    orderBy?: ProcessosPedidoPreferenciaOrderByWithRelationInput | ProcessosPedidoPreferenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessosPedidoPreferencias.
     */
    cursor?: ProcessosPedidoPreferenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessosPedidoPreferencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessosPedidoPreferencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessosPedidoPreferencias.
     */
    distinct?: ProcessosPedidoPreferenciaScalarFieldEnum | ProcessosPedidoPreferenciaScalarFieldEnum[]
  }

  /**
   * ProcessosPedidoPreferencia findFirstOrThrow
   */
  export type ProcessosPedidoPreferenciaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter, which ProcessosPedidoPreferencia to fetch.
     */
    where?: ProcessosPedidoPreferenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessosPedidoPreferencias to fetch.
     */
    orderBy?: ProcessosPedidoPreferenciaOrderByWithRelationInput | ProcessosPedidoPreferenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessosPedidoPreferencias.
     */
    cursor?: ProcessosPedidoPreferenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessosPedidoPreferencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessosPedidoPreferencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessosPedidoPreferencias.
     */
    distinct?: ProcessosPedidoPreferenciaScalarFieldEnum | ProcessosPedidoPreferenciaScalarFieldEnum[]
  }

  /**
   * ProcessosPedidoPreferencia findMany
   */
  export type ProcessosPedidoPreferenciaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter, which ProcessosPedidoPreferencias to fetch.
     */
    where?: ProcessosPedidoPreferenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessosPedidoPreferencias to fetch.
     */
    orderBy?: ProcessosPedidoPreferenciaOrderByWithRelationInput | ProcessosPedidoPreferenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessosPedidoPreferencias.
     */
    cursor?: ProcessosPedidoPreferenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessosPedidoPreferencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessosPedidoPreferencias.
     */
    skip?: number
    distinct?: ProcessosPedidoPreferenciaScalarFieldEnum | ProcessosPedidoPreferenciaScalarFieldEnum[]
  }

  /**
   * ProcessosPedidoPreferencia create
   */
  export type ProcessosPedidoPreferenciaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * The data needed to create a ProcessosPedidoPreferencia.
     */
    data: XOR<ProcessosPedidoPreferenciaCreateInput, ProcessosPedidoPreferenciaUncheckedCreateInput>
  }

  /**
   * ProcessosPedidoPreferencia createMany
   */
  export type ProcessosPedidoPreferenciaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessosPedidoPreferencias.
     */
    data: ProcessosPedidoPreferenciaCreateManyInput | ProcessosPedidoPreferenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessosPedidoPreferencia createManyAndReturn
   */
  export type ProcessosPedidoPreferenciaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessosPedidoPreferencias.
     */
    data: ProcessosPedidoPreferenciaCreateManyInput | ProcessosPedidoPreferenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessosPedidoPreferencia update
   */
  export type ProcessosPedidoPreferenciaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * The data needed to update a ProcessosPedidoPreferencia.
     */
    data: XOR<ProcessosPedidoPreferenciaUpdateInput, ProcessosPedidoPreferenciaUncheckedUpdateInput>
    /**
     * Choose, which ProcessosPedidoPreferencia to update.
     */
    where: ProcessosPedidoPreferenciaWhereUniqueInput
  }

  /**
   * ProcessosPedidoPreferencia updateMany
   */
  export type ProcessosPedidoPreferenciaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessosPedidoPreferencias.
     */
    data: XOR<ProcessosPedidoPreferenciaUpdateManyMutationInput, ProcessosPedidoPreferenciaUncheckedUpdateManyInput>
    /**
     * Filter which ProcessosPedidoPreferencias to update
     */
    where?: ProcessosPedidoPreferenciaWhereInput
  }

  /**
   * ProcessosPedidoPreferencia upsert
   */
  export type ProcessosPedidoPreferenciaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * The filter to search for the ProcessosPedidoPreferencia to update in case it exists.
     */
    where: ProcessosPedidoPreferenciaWhereUniqueInput
    /**
     * In case the ProcessosPedidoPreferencia found by the `where` argument doesn't exist, create a new ProcessosPedidoPreferencia with this data.
     */
    create: XOR<ProcessosPedidoPreferenciaCreateInput, ProcessosPedidoPreferenciaUncheckedCreateInput>
    /**
     * In case the ProcessosPedidoPreferencia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessosPedidoPreferenciaUpdateInput, ProcessosPedidoPreferenciaUncheckedUpdateInput>
  }

  /**
   * ProcessosPedidoPreferencia delete
   */
  export type ProcessosPedidoPreferenciaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
    /**
     * Filter which ProcessosPedidoPreferencia to delete.
     */
    where: ProcessosPedidoPreferenciaWhereUniqueInput
  }

  /**
   * ProcessosPedidoPreferencia deleteMany
   */
  export type ProcessosPedidoPreferenciaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessosPedidoPreferencias to delete
     */
    where?: ProcessosPedidoPreferenciaWhereInput
  }

  /**
   * ProcessosPedidoPreferencia without action
   */
  export type ProcessosPedidoPreferenciaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessosPedidoPreferencia
     */
    select?: ProcessosPedidoPreferenciaSelect<ExtArgs> | null
  }


  /**
   * Model ProcessoPedidoPadrao
   */

  export type AggregateProcessoPedidoPadrao = {
    _count: ProcessoPedidoPadraoCountAggregateOutputType | null
    _min: ProcessoPedidoPadraoMinAggregateOutputType | null
    _max: ProcessoPedidoPadraoMaxAggregateOutputType | null
  }

  export type ProcessoPedidoPadraoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    updated_at: Date | null
  }

  export type ProcessoPedidoPadraoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    updated_at: Date | null
  }

  export type ProcessoPedidoPadraoCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    colunas_visiveis: number
    colunas_largura: number
    updated_at: number
    _all: number
  }


  export type ProcessoPedidoPadraoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    updated_at?: true
  }

  export type ProcessoPedidoPadraoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    updated_at?: true
  }

  export type ProcessoPedidoPadraoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    colunas_visiveis?: true
    colunas_largura?: true
    updated_at?: true
    _all?: true
  }

  export type ProcessoPedidoPadraoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedidoPadrao to aggregate.
     */
    where?: ProcessoPedidoPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoPadraos to fetch.
     */
    orderBy?: ProcessoPedidoPadraoOrderByWithRelationInput | ProcessoPedidoPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoPedidoPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProcessoPedidoPadraos
    **/
    _count?: true | ProcessoPedidoPadraoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoPedidoPadraoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoPedidoPadraoMaxAggregateInputType
  }

  export type GetProcessoPedidoPadraoAggregateType<T extends ProcessoPedidoPadraoAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoPedidoPadrao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoPedidoPadrao[P]>
      : GetScalarType<T[P], AggregateProcessoPedidoPadrao[P]>
  }




  export type ProcessoPedidoPadraoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoPedidoPadraoWhereInput
    orderBy?: ProcessoPedidoPadraoOrderByWithAggregationInput | ProcessoPedidoPadraoOrderByWithAggregationInput[]
    by: ProcessoPedidoPadraoScalarFieldEnum[] | ProcessoPedidoPadraoScalarFieldEnum
    having?: ProcessoPedidoPadraoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoPedidoPadraoCountAggregateInputType | true
    _min?: ProcessoPedidoPadraoMinAggregateInputType
    _max?: ProcessoPedidoPadraoMaxAggregateInputType
  }

  export type ProcessoPedidoPadraoGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    colunas_visiveis: string[]
    colunas_largura: JsonValue | null
    updated_at: Date
    _count: ProcessoPedidoPadraoCountAggregateOutputType | null
    _min: ProcessoPedidoPadraoMinAggregateOutputType | null
    _max: ProcessoPedidoPadraoMaxAggregateOutputType | null
  }

  type GetProcessoPedidoPadraoGroupByPayload<T extends ProcessoPedidoPadraoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoPedidoPadraoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoPedidoPadraoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoPedidoPadraoGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoPedidoPadraoGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoPedidoPadraoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoPedidoPadrao"]>

  export type ProcessoPedidoPadraoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["processoPedidoPadrao"]>

  export type ProcessoPedidoPadraoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }


  export type $ProcessoPedidoPadraoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoPedidoPadrao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      colunas_visiveis: string[]
      colunas_largura: Prisma.JsonValue | null
      updated_at: Date
    }, ExtArgs["result"]["processoPedidoPadrao"]>
    composites: {}
  }

  type ProcessoPedidoPadraoGetPayload<S extends boolean | null | undefined | ProcessoPedidoPadraoDefaultArgs> = $Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload, S>

  type ProcessoPedidoPadraoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoPedidoPadraoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoPedidoPadraoCountAggregateInputType | true
    }

  export interface ProcessoPedidoPadraoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoPedidoPadrao'], meta: { name: 'ProcessoPedidoPadrao' } }
    /**
     * Find zero or one ProcessoPedidoPadrao that matches the filter.
     * @param {ProcessoPedidoPadraoFindUniqueArgs} args - Arguments to find a ProcessoPedidoPadrao
     * @example
     * // Get one ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoPedidoPadraoFindUniqueArgs>(args: SelectSubset<T, ProcessoPedidoPadraoFindUniqueArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoPedidoPadrao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoPedidoPadraoFindUniqueOrThrowArgs} args - Arguments to find a ProcessoPedidoPadrao
     * @example
     * // Get one ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoPedidoPadraoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoPedidoPadraoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoPedidoPadrao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoFindFirstArgs} args - Arguments to find a ProcessoPedidoPadrao
     * @example
     * // Get one ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoPedidoPadraoFindFirstArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoFindFirstArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoPedidoPadrao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoFindFirstOrThrowArgs} args - Arguments to find a ProcessoPedidoPadrao
     * @example
     * // Get one ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoPedidoPadraoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoPedidoPadraos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoPedidoPadraos
     * const processoPedidoPadraos = await prisma.processoPedidoPadrao.findMany()
     * 
     * // Get first 10 ProcessoPedidoPadraos
     * const processoPedidoPadraos = await prisma.processoPedidoPadrao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoPedidoPadraoWithIdOnly = await prisma.processoPedidoPadrao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoPedidoPadraoFindManyArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoPedidoPadrao.
     * @param {ProcessoPedidoPadraoCreateArgs} args - Arguments to create a ProcessoPedidoPadrao.
     * @example
     * // Create one ProcessoPedidoPadrao
     * const ProcessoPedidoPadrao = await prisma.processoPedidoPadrao.create({
     *   data: {
     *     // ... data to create a ProcessoPedidoPadrao
     *   }
     * })
     * 
     */
    create<T extends ProcessoPedidoPadraoCreateArgs>(args: SelectSubset<T, ProcessoPedidoPadraoCreateArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoPedidoPadraos.
     * @param {ProcessoPedidoPadraoCreateManyArgs} args - Arguments to create many ProcessoPedidoPadraos.
     * @example
     * // Create many ProcessoPedidoPadraos
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoPedidoPadraoCreateManyArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoPedidoPadraos and returns the data saved in the database.
     * @param {ProcessoPedidoPadraoCreateManyAndReturnArgs} args - Arguments to create many ProcessoPedidoPadraos.
     * @example
     * // Create many ProcessoPedidoPadraos
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoPedidoPadraos and only return the `id`
     * const processoPedidoPadraoWithIdOnly = await prisma.processoPedidoPadrao.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoPedidoPadraoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoPedidoPadrao.
     * @param {ProcessoPedidoPadraoDeleteArgs} args - Arguments to delete one ProcessoPedidoPadrao.
     * @example
     * // Delete one ProcessoPedidoPadrao
     * const ProcessoPedidoPadrao = await prisma.processoPedidoPadrao.delete({
     *   where: {
     *     // ... filter to delete one ProcessoPedidoPadrao
     *   }
     * })
     * 
     */
    delete<T extends ProcessoPedidoPadraoDeleteArgs>(args: SelectSubset<T, ProcessoPedidoPadraoDeleteArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoPedidoPadrao.
     * @param {ProcessoPedidoPadraoUpdateArgs} args - Arguments to update one ProcessoPedidoPadrao.
     * @example
     * // Update one ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoPedidoPadraoUpdateArgs>(args: SelectSubset<T, ProcessoPedidoPadraoUpdateArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoPedidoPadraos.
     * @param {ProcessoPedidoPadraoDeleteManyArgs} args - Arguments to filter ProcessoPedidoPadraos to delete.
     * @example
     * // Delete a few ProcessoPedidoPadraos
     * const { count } = await prisma.processoPedidoPadrao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoPedidoPadraoDeleteManyArgs>(args?: SelectSubset<T, ProcessoPedidoPadraoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoPedidoPadraos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoPedidoPadraos
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoPedidoPadraoUpdateManyArgs>(args: SelectSubset<T, ProcessoPedidoPadraoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoPedidoPadrao.
     * @param {ProcessoPedidoPadraoUpsertArgs} args - Arguments to update or create a ProcessoPedidoPadrao.
     * @example
     * // Update or create a ProcessoPedidoPadrao
     * const processoPedidoPadrao = await prisma.processoPedidoPadrao.upsert({
     *   create: {
     *     // ... data to create a ProcessoPedidoPadrao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoPedidoPadrao we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoPedidoPadraoUpsertArgs>(args: SelectSubset<T, ProcessoPedidoPadraoUpsertArgs<ExtArgs>>): Prisma__ProcessoPedidoPadraoClient<$Result.GetResult<Prisma.$ProcessoPedidoPadraoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoPedidoPadraos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoCountArgs} args - Arguments to filter ProcessoPedidoPadraos to count.
     * @example
     * // Count the number of ProcessoPedidoPadraos
     * const count = await prisma.processoPedidoPadrao.count({
     *   where: {
     *     // ... the filter for the ProcessoPedidoPadraos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoPedidoPadraoCountArgs>(
      args?: Subset<T, ProcessoPedidoPadraoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoPedidoPadraoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoPedidoPadrao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoPedidoPadraoAggregateArgs>(args: Subset<T, ProcessoPedidoPadraoAggregateArgs>): Prisma.PrismaPromise<GetProcessoPedidoPadraoAggregateType<T>>

    /**
     * Group by ProcessoPedidoPadrao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoPedidoPadraoGroupByArgs} args - Group by arguments.
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
      T extends ProcessoPedidoPadraoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoPedidoPadraoGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoPedidoPadraoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoPedidoPadraoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoPedidoPadraoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoPedidoPadrao model
   */
  readonly fields: ProcessoPedidoPadraoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoPedidoPadrao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoPedidoPadraoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProcessoPedidoPadrao model
   */ 
  interface ProcessoPedidoPadraoFieldRefs {
    readonly id: FieldRef<"ProcessoPedidoPadrao", 'String'>
    readonly tenant_id: FieldRef<"ProcessoPedidoPadrao", 'String'>
    readonly product_id: FieldRef<"ProcessoPedidoPadrao", 'String'>
    readonly colunas_visiveis: FieldRef<"ProcessoPedidoPadrao", 'String[]'>
    readonly colunas_largura: FieldRef<"ProcessoPedidoPadrao", 'Json'>
    readonly updated_at: FieldRef<"ProcessoPedidoPadrao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoPedidoPadrao findUnique
   */
  export type ProcessoPedidoPadraoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoPadrao to fetch.
     */
    where: ProcessoPedidoPadraoWhereUniqueInput
  }

  /**
   * ProcessoPedidoPadrao findUniqueOrThrow
   */
  export type ProcessoPedidoPadraoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoPadrao to fetch.
     */
    where: ProcessoPedidoPadraoWhereUniqueInput
  }

  /**
   * ProcessoPedidoPadrao findFirst
   */
  export type ProcessoPedidoPadraoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoPadrao to fetch.
     */
    where?: ProcessoPedidoPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoPadraos to fetch.
     */
    orderBy?: ProcessoPedidoPadraoOrderByWithRelationInput | ProcessoPedidoPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidoPadraos.
     */
    cursor?: ProcessoPedidoPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidoPadraos.
     */
    distinct?: ProcessoPedidoPadraoScalarFieldEnum | ProcessoPedidoPadraoScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoPadrao findFirstOrThrow
   */
  export type ProcessoPedidoPadraoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoPadrao to fetch.
     */
    where?: ProcessoPedidoPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoPadraos to fetch.
     */
    orderBy?: ProcessoPedidoPadraoOrderByWithRelationInput | ProcessoPedidoPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoPedidoPadraos.
     */
    cursor?: ProcessoPedidoPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProcessoPedidoPadraos.
     */
    distinct?: ProcessoPedidoPadraoScalarFieldEnum | ProcessoPedidoPadraoScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoPadrao findMany
   */
  export type ProcessoPedidoPadraoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter, which ProcessoPedidoPadraos to fetch.
     */
    where?: ProcessoPedidoPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoPedidoPadraos to fetch.
     */
    orderBy?: ProcessoPedidoPadraoOrderByWithRelationInput | ProcessoPedidoPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoPedidoPadraos.
     */
    cursor?: ProcessoPedidoPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProcessoPedidoPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProcessoPedidoPadraos.
     */
    skip?: number
    distinct?: ProcessoPedidoPadraoScalarFieldEnum | ProcessoPedidoPadraoScalarFieldEnum[]
  }

  /**
   * ProcessoPedidoPadrao create
   */
  export type ProcessoPedidoPadraoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * The data needed to create a ProcessoPedidoPadrao.
     */
    data: XOR<ProcessoPedidoPadraoCreateInput, ProcessoPedidoPadraoUncheckedCreateInput>
  }

  /**
   * ProcessoPedidoPadrao createMany
   */
  export type ProcessoPedidoPadraoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoPedidoPadraos.
     */
    data: ProcessoPedidoPadraoCreateManyInput | ProcessoPedidoPadraoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoPedidoPadrao createManyAndReturn
   */
  export type ProcessoPedidoPadraoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoPedidoPadraos.
     */
    data: ProcessoPedidoPadraoCreateManyInput | ProcessoPedidoPadraoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoPedidoPadrao update
   */
  export type ProcessoPedidoPadraoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * The data needed to update a ProcessoPedidoPadrao.
     */
    data: XOR<ProcessoPedidoPadraoUpdateInput, ProcessoPedidoPadraoUncheckedUpdateInput>
    /**
     * Choose, which ProcessoPedidoPadrao to update.
     */
    where: ProcessoPedidoPadraoWhereUniqueInput
  }

  /**
   * ProcessoPedidoPadrao updateMany
   */
  export type ProcessoPedidoPadraoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoPedidoPadraos.
     */
    data: XOR<ProcessoPedidoPadraoUpdateManyMutationInput, ProcessoPedidoPadraoUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoPedidoPadraos to update
     */
    where?: ProcessoPedidoPadraoWhereInput
  }

  /**
   * ProcessoPedidoPadrao upsert
   */
  export type ProcessoPedidoPadraoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * The filter to search for the ProcessoPedidoPadrao to update in case it exists.
     */
    where: ProcessoPedidoPadraoWhereUniqueInput
    /**
     * In case the ProcessoPedidoPadrao found by the `where` argument doesn't exist, create a new ProcessoPedidoPadrao with this data.
     */
    create: XOR<ProcessoPedidoPadraoCreateInput, ProcessoPedidoPadraoUncheckedCreateInput>
    /**
     * In case the ProcessoPedidoPadrao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoPedidoPadraoUpdateInput, ProcessoPedidoPadraoUncheckedUpdateInput>
  }

  /**
   * ProcessoPedidoPadrao delete
   */
  export type ProcessoPedidoPadraoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
    /**
     * Filter which ProcessoPedidoPadrao to delete.
     */
    where: ProcessoPedidoPadraoWhereUniqueInput
  }

  /**
   * ProcessoPedidoPadrao deleteMany
   */
  export type ProcessoPedidoPadraoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoPedidoPadraos to delete
     */
    where?: ProcessoPedidoPadraoWhereInput
  }

  /**
   * ProcessoPedidoPadrao without action
   */
  export type ProcessoPedidoPadraoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoPedidoPadrao
     */
    select?: ProcessoPedidoPadraoSelect<ExtArgs> | null
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


  export const ProcessoGravityScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoGravityScalarFieldEnum = (typeof ProcessoGravityScalarFieldEnum)[keyof typeof ProcessoGravityScalarFieldEnum]


  export const ProcessoEtapasScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_id: 'product_id',
    user_id: 'user_id',
    processo_id: 'processo_id',
    nome: 'nome',
    status: 'status',
    data_prevista: 'data_prevista',
    data_realizada: 'data_realizada',
    observacao: 'observacao'
  };

  export type ProcessoEtapasScalarFieldEnum = (typeof ProcessoEtapasScalarFieldEnum)[keyof typeof ProcessoEtapasScalarFieldEnum]


  export const ProcessoPedidoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoPedidoScalarFieldEnum = (typeof ProcessoPedidoScalarFieldEnum)[keyof typeof ProcessoPedidoScalarFieldEnum]


  export const ProcessoPedidoItensScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoPedidoItensScalarFieldEnum = (typeof ProcessoPedidoItensScalarFieldEnum)[keyof typeof ProcessoPedidoItensScalarFieldEnum]


  export const ProcessoFollowupScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoFollowupScalarFieldEnum = (typeof ProcessoFollowupScalarFieldEnum)[keyof typeof ProcessoFollowupScalarFieldEnum]


  export const ProcessoAnexosScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoAnexosScalarFieldEnum = (typeof ProcessoAnexosScalarFieldEnum)[keyof typeof ProcessoAnexosScalarFieldEnum]


  export const ProcessoEstimativaCustoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoEstimativaCustoScalarFieldEnum = (typeof ProcessoEstimativaCustoScalarFieldEnum)[keyof typeof ProcessoEstimativaCustoScalarFieldEnum]


  export const ProcessoDadosTecnicosScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoDadosTecnicosScalarFieldEnum = (typeof ProcessoDadosTecnicosScalarFieldEnum)[keyof typeof ProcessoDadosTecnicosScalarFieldEnum]


  export const ProcessoStatusScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoStatusScalarFieldEnum = (typeof ProcessoStatusScalarFieldEnum)[keyof typeof ProcessoStatusScalarFieldEnum]


  export const ProcessoColunasScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
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

  export type ProcessoColunasScalarFieldEnum = (typeof ProcessoColunasScalarFieldEnum)[keyof typeof ProcessoColunasScalarFieldEnum]


  export const ProcessosPedidoPreferenciaScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_id: 'product_id',
    user_id: 'user_id',
    colunas_visiveis: 'colunas_visiveis',
    colunas_largura: 'colunas_largura',
    updated_at: 'updated_at'
  };

  export type ProcessosPedidoPreferenciaScalarFieldEnum = (typeof ProcessosPedidoPreferenciaScalarFieldEnum)[keyof typeof ProcessosPedidoPreferenciaScalarFieldEnum]


  export const ProcessoPedidoPadraoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_id: 'product_id',
    colunas_visiveis: 'colunas_visiveis',
    colunas_largura: 'colunas_largura',
    updated_at: 'updated_at'
  };

  export type ProcessoPedidoPadraoScalarFieldEnum = (typeof ProcessoPedidoPadraoScalarFieldEnum)[keyof typeof ProcessoPedidoPadraoScalarFieldEnum]


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
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type ProcessoGravityWhereInput = {
    AND?: ProcessoGravityWhereInput | ProcessoGravityWhereInput[]
    OR?: ProcessoGravityWhereInput[]
    NOT?: ProcessoGravityWhereInput | ProcessoGravityWhereInput[]
    id?: StringFilter<"ProcessoGravity"> | string
    tenant_id?: StringFilter<"ProcessoGravity"> | string
    product_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    user_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    numero?: StringFilter<"ProcessoGravity"> | string
    referencia_interna?: StringNullableFilter<"ProcessoGravity"> | string | null
    referencia_dati?: StringNullableFilter<"ProcessoGravity"> | string | null
    status?: StringFilter<"ProcessoGravity"> | string
    tipo?: StringFilter<"ProcessoGravity"> | string
    responsavel_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    vendedor_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    setor_responsavel?: StringNullableFilter<"ProcessoGravity"> | string | null
    created_at?: DateTimeFilter<"ProcessoGravity"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoGravity"> | Date | string
    etapas?: ProcessoEtapasListRelationFilter
    pedidos?: ProcessoPedidoListRelationFilter
    followUps?: ProcessoFollowupListRelationFilter
    documentos?: ProcessoAnexosListRelationFilter
    estimativaCusto?: XOR<ProcessoEstimativaCustoNullableRelationFilter, ProcessoEstimativaCustoWhereInput> | null
    dadosTecnicos?: XOR<ProcessoDadosTecnicosNullableRelationFilter, ProcessoDadosTecnicosWhereInput> | null
  }

  export type ProcessoGravityOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    numero?: SortOrder
    referencia_interna?: SortOrderInput | SortOrder
    referencia_dati?: SortOrderInput | SortOrder
    status?: SortOrder
    tipo?: SortOrder
    responsavel_id?: SortOrderInput | SortOrder
    vendedor_id?: SortOrderInput | SortOrder
    setor_responsavel?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    etapas?: ProcessoEtapasOrderByRelationAggregateInput
    pedidos?: ProcessoPedidoOrderByRelationAggregateInput
    followUps?: ProcessoFollowupOrderByRelationAggregateInput
    documentos?: ProcessoAnexosOrderByRelationAggregateInput
    estimativaCusto?: ProcessoEstimativaCustoOrderByWithRelationInput
    dadosTecnicos?: ProcessoDadosTecnicosOrderByWithRelationInput
  }

  export type ProcessoGravityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoGravityWhereInput | ProcessoGravityWhereInput[]
    OR?: ProcessoGravityWhereInput[]
    NOT?: ProcessoGravityWhereInput | ProcessoGravityWhereInput[]
    tenant_id?: StringFilter<"ProcessoGravity"> | string
    product_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    user_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    numero?: StringFilter<"ProcessoGravity"> | string
    referencia_interna?: StringNullableFilter<"ProcessoGravity"> | string | null
    referencia_dati?: StringNullableFilter<"ProcessoGravity"> | string | null
    status?: StringFilter<"ProcessoGravity"> | string
    tipo?: StringFilter<"ProcessoGravity"> | string
    responsavel_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    vendedor_id?: StringNullableFilter<"ProcessoGravity"> | string | null
    setor_responsavel?: StringNullableFilter<"ProcessoGravity"> | string | null
    created_at?: DateTimeFilter<"ProcessoGravity"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoGravity"> | Date | string
    etapas?: ProcessoEtapasListRelationFilter
    pedidos?: ProcessoPedidoListRelationFilter
    followUps?: ProcessoFollowupListRelationFilter
    documentos?: ProcessoAnexosListRelationFilter
    estimativaCusto?: XOR<ProcessoEstimativaCustoNullableRelationFilter, ProcessoEstimativaCustoWhereInput> | null
    dadosTecnicos?: XOR<ProcessoDadosTecnicosNullableRelationFilter, ProcessoDadosTecnicosWhereInput> | null
  }, "id">

  export type ProcessoGravityOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    numero?: SortOrder
    referencia_interna?: SortOrderInput | SortOrder
    referencia_dati?: SortOrderInput | SortOrder
    status?: SortOrder
    tipo?: SortOrder
    responsavel_id?: SortOrderInput | SortOrder
    vendedor_id?: SortOrderInput | SortOrder
    setor_responsavel?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProcessoGravityCountOrderByAggregateInput
    _max?: ProcessoGravityMaxOrderByAggregateInput
    _min?: ProcessoGravityMinOrderByAggregateInput
  }

  export type ProcessoGravityScalarWhereWithAggregatesInput = {
    AND?: ProcessoGravityScalarWhereWithAggregatesInput | ProcessoGravityScalarWhereWithAggregatesInput[]
    OR?: ProcessoGravityScalarWhereWithAggregatesInput[]
    NOT?: ProcessoGravityScalarWhereWithAggregatesInput | ProcessoGravityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoGravity"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoGravity"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    numero?: StringWithAggregatesFilter<"ProcessoGravity"> | string
    referencia_interna?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    referencia_dati?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    status?: StringWithAggregatesFilter<"ProcessoGravity"> | string
    tipo?: StringWithAggregatesFilter<"ProcessoGravity"> | string
    responsavel_id?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    vendedor_id?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    setor_responsavel?: StringNullableWithAggregatesFilter<"ProcessoGravity"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProcessoGravity"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoGravity"> | Date | string
  }

  export type ProcessoEtapasWhereInput = {
    AND?: ProcessoEtapasWhereInput | ProcessoEtapasWhereInput[]
    OR?: ProcessoEtapasWhereInput[]
    NOT?: ProcessoEtapasWhereInput | ProcessoEtapasWhereInput[]
    id?: StringFilter<"ProcessoEtapas"> | string
    tenant_id?: StringFilter<"ProcessoEtapas"> | string
    product_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    processo_id?: StringFilter<"ProcessoEtapas"> | string
    nome?: StringFilter<"ProcessoEtapas"> | string
    status?: StringFilter<"ProcessoEtapas"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapas"> | string | null
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }

  export type ProcessoEtapasOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    status?: SortOrder
    data_prevista?: SortOrderInput | SortOrder
    data_realizada?: SortOrderInput | SortOrder
    observacao?: SortOrderInput | SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
  }

  export type ProcessoEtapasWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoEtapasWhereInput | ProcessoEtapasWhereInput[]
    OR?: ProcessoEtapasWhereInput[]
    NOT?: ProcessoEtapasWhereInput | ProcessoEtapasWhereInput[]
    tenant_id?: StringFilter<"ProcessoEtapas"> | string
    product_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    processo_id?: StringFilter<"ProcessoEtapas"> | string
    nome?: StringFilter<"ProcessoEtapas"> | string
    status?: StringFilter<"ProcessoEtapas"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapas"> | string | null
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }, "id">

  export type ProcessoEtapasOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    status?: SortOrder
    data_prevista?: SortOrderInput | SortOrder
    data_realizada?: SortOrderInput | SortOrder
    observacao?: SortOrderInput | SortOrder
    _count?: ProcessoEtapasCountOrderByAggregateInput
    _max?: ProcessoEtapasMaxOrderByAggregateInput
    _min?: ProcessoEtapasMinOrderByAggregateInput
  }

  export type ProcessoEtapasScalarWhereWithAggregatesInput = {
    AND?: ProcessoEtapasScalarWhereWithAggregatesInput | ProcessoEtapasScalarWhereWithAggregatesInput[]
    OR?: ProcessoEtapasScalarWhereWithAggregatesInput[]
    NOT?: ProcessoEtapasScalarWhereWithAggregatesInput | ProcessoEtapasScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoEtapas"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoEtapas"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoEtapas"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoEtapas"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoEtapas"> | string
    nome?: StringWithAggregatesFilter<"ProcessoEtapas"> | string
    status?: StringWithAggregatesFilter<"ProcessoEtapas"> | string
    data_prevista?: DateTimeNullableWithAggregatesFilter<"ProcessoEtapas"> | Date | string | null
    data_realizada?: DateTimeNullableWithAggregatesFilter<"ProcessoEtapas"> | Date | string | null
    observacao?: StringNullableWithAggregatesFilter<"ProcessoEtapas"> | string | null
  }

  export type ProcessoPedidoWhereInput = {
    AND?: ProcessoPedidoWhereInput | ProcessoPedidoWhereInput[]
    OR?: ProcessoPedidoWhereInput[]
    NOT?: ProcessoPedidoWhereInput | ProcessoPedidoWhereInput[]
    id?: StringFilter<"ProcessoPedido"> | string
    tenant_id?: StringFilter<"ProcessoPedido"> | string
    product_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    processo_id?: StringFilter<"ProcessoPedido"> | string
    numero?: StringFilter<"ProcessoPedido"> | string
    exportador_nome?: StringNullableFilter<"ProcessoPedido"> | string | null
    exportador_pais?: StringNullableFilter<"ProcessoPedido"> | string | null
    valor_fob?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedido"> | string
    peso_bruto?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ProcessoPedido"> | string
    status_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    campos_custom?: JsonNullableFilter<"ProcessoPedido">
    created_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
    itens?: ProcessoPedidoItensListRelationFilter
  }

  export type ProcessoPedidoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    numero?: SortOrder
    exportador_nome?: SortOrderInput | SortOrder
    exportador_pais?: SortOrderInput | SortOrder
    valor_fob?: SortOrder
    moeda?: SortOrder
    peso_bruto?: SortOrder
    status?: SortOrder
    status_id?: SortOrderInput | SortOrder
    campos_custom?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
    itens?: ProcessoPedidoItensOrderByRelationAggregateInput
  }

  export type ProcessoPedidoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoPedidoWhereInput | ProcessoPedidoWhereInput[]
    OR?: ProcessoPedidoWhereInput[]
    NOT?: ProcessoPedidoWhereInput | ProcessoPedidoWhereInput[]
    tenant_id?: StringFilter<"ProcessoPedido"> | string
    product_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    processo_id?: StringFilter<"ProcessoPedido"> | string
    numero?: StringFilter<"ProcessoPedido"> | string
    exportador_nome?: StringNullableFilter<"ProcessoPedido"> | string | null
    exportador_pais?: StringNullableFilter<"ProcessoPedido"> | string | null
    valor_fob?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedido"> | string
    peso_bruto?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ProcessoPedido"> | string
    status_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    campos_custom?: JsonNullableFilter<"ProcessoPedido">
    created_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
    itens?: ProcessoPedidoItensListRelationFilter
  }, "id">

  export type ProcessoPedidoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    numero?: SortOrder
    exportador_nome?: SortOrderInput | SortOrder
    exportador_pais?: SortOrderInput | SortOrder
    valor_fob?: SortOrder
    moeda?: SortOrder
    peso_bruto?: SortOrder
    status?: SortOrder
    status_id?: SortOrderInput | SortOrder
    campos_custom?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProcessoPedidoCountOrderByAggregateInput
    _avg?: ProcessoPedidoAvgOrderByAggregateInput
    _max?: ProcessoPedidoMaxOrderByAggregateInput
    _min?: ProcessoPedidoMinOrderByAggregateInput
    _sum?: ProcessoPedidoSumOrderByAggregateInput
  }

  export type ProcessoPedidoScalarWhereWithAggregatesInput = {
    AND?: ProcessoPedidoScalarWhereWithAggregatesInput | ProcessoPedidoScalarWhereWithAggregatesInput[]
    OR?: ProcessoPedidoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoPedidoScalarWhereWithAggregatesInput | ProcessoPedidoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoPedido"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoPedido"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    numero?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    exportador_nome?: StringNullableWithAggregatesFilter<"ProcessoPedido"> | string | null
    exportador_pais?: StringNullableWithAggregatesFilter<"ProcessoPedido"> | string | null
    valor_fob?: DecimalWithAggregatesFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    peso_bruto?: DecimalWithAggregatesFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    status?: StringWithAggregatesFilter<"ProcessoPedido"> | string
    status_id?: StringNullableWithAggregatesFilter<"ProcessoPedido"> | string | null
    campos_custom?: JsonNullableWithAggregatesFilter<"ProcessoPedido">
    created_at?: DateTimeWithAggregatesFilter<"ProcessoPedido"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoPedido"> | Date | string
  }

  export type ProcessoPedidoItensWhereInput = {
    AND?: ProcessoPedidoItensWhereInput | ProcessoPedidoItensWhereInput[]
    OR?: ProcessoPedidoItensWhereInput[]
    NOT?: ProcessoPedidoItensWhereInput | ProcessoPedidoItensWhereInput[]
    id?: StringFilter<"ProcessoPedidoItens"> | string
    tenant_id?: StringFilter<"ProcessoPedidoItens"> | string
    product_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    pedido_id?: StringFilter<"ProcessoPedidoItens"> | string
    numero_item?: StringFilter<"ProcessoPedidoItens"> | string
    descricao?: StringFilter<"ProcessoPedidoItens"> | string
    ncm?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    quantidade?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"ProcessoPedidoItens"> | string
    valor_unitario?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedidoItens"> | string
    status_li?: StringFilter<"ProcessoPedidoItens"> | string
    campos_custom?: JsonNullableFilter<"ProcessoPedidoItens">
    created_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
    pedido?: XOR<ProcessoPedidoRelationFilter, ProcessoPedidoWhereInput>
  }

  export type ProcessoPedidoItensOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    pedido_id?: SortOrder
    numero_item?: SortOrder
    descricao?: SortOrder
    ncm?: SortOrderInput | SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
    moeda?: SortOrder
    status_li?: SortOrder
    campos_custom?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    pedido?: ProcessoPedidoOrderByWithRelationInput
  }

  export type ProcessoPedidoItensWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoPedidoItensWhereInput | ProcessoPedidoItensWhereInput[]
    OR?: ProcessoPedidoItensWhereInput[]
    NOT?: ProcessoPedidoItensWhereInput | ProcessoPedidoItensWhereInput[]
    tenant_id?: StringFilter<"ProcessoPedidoItens"> | string
    product_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    pedido_id?: StringFilter<"ProcessoPedidoItens"> | string
    numero_item?: StringFilter<"ProcessoPedidoItens"> | string
    descricao?: StringFilter<"ProcessoPedidoItens"> | string
    ncm?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    quantidade?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"ProcessoPedidoItens"> | string
    valor_unitario?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedidoItens"> | string
    status_li?: StringFilter<"ProcessoPedidoItens"> | string
    campos_custom?: JsonNullableFilter<"ProcessoPedidoItens">
    created_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
    pedido?: XOR<ProcessoPedidoRelationFilter, ProcessoPedidoWhereInput>
  }, "id">

  export type ProcessoPedidoItensOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    pedido_id?: SortOrder
    numero_item?: SortOrder
    descricao?: SortOrder
    ncm?: SortOrderInput | SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
    moeda?: SortOrder
    status_li?: SortOrder
    campos_custom?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProcessoPedidoItensCountOrderByAggregateInput
    _avg?: ProcessoPedidoItensAvgOrderByAggregateInput
    _max?: ProcessoPedidoItensMaxOrderByAggregateInput
    _min?: ProcessoPedidoItensMinOrderByAggregateInput
    _sum?: ProcessoPedidoItensSumOrderByAggregateInput
  }

  export type ProcessoPedidoItensScalarWhereWithAggregatesInput = {
    AND?: ProcessoPedidoItensScalarWhereWithAggregatesInput | ProcessoPedidoItensScalarWhereWithAggregatesInput[]
    OR?: ProcessoPedidoItensScalarWhereWithAggregatesInput[]
    NOT?: ProcessoPedidoItensScalarWhereWithAggregatesInput | ProcessoPedidoItensScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoPedidoItens"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoPedidoItens"> | string | null
    pedido_id?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    numero_item?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    descricao?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    ncm?: StringNullableWithAggregatesFilter<"ProcessoPedidoItens"> | string | null
    quantidade?: DecimalWithAggregatesFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    unidade?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    valor_unitario?: DecimalWithAggregatesFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalWithAggregatesFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    moeda?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    status_li?: StringWithAggregatesFilter<"ProcessoPedidoItens"> | string
    campos_custom?: JsonNullableWithAggregatesFilter<"ProcessoPedidoItens">
    created_at?: DateTimeWithAggregatesFilter<"ProcessoPedidoItens"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoPedidoItens"> | Date | string
  }

  export type ProcessoFollowupWhereInput = {
    AND?: ProcessoFollowupWhereInput | ProcessoFollowupWhereInput[]
    OR?: ProcessoFollowupWhereInput[]
    NOT?: ProcessoFollowupWhereInput | ProcessoFollowupWhereInput[]
    id?: StringFilter<"ProcessoFollowup"> | string
    tenant_id?: StringFilter<"ProcessoFollowup"> | string
    product_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    user_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    processo_id?: StringFilter<"ProcessoFollowup"> | string
    titulo?: StringFilter<"ProcessoFollowup"> | string
    descricao?: StringNullableFilter<"ProcessoFollowup"> | string | null
    tipo?: StringFilter<"ProcessoFollowup"> | string
    categoria?: StringFilter<"ProcessoFollowup"> | string
    usuario_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    usuario_nome?: StringNullableFilter<"ProcessoFollowup"> | string | null
    created_at?: DateTimeFilter<"ProcessoFollowup"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }

  export type ProcessoFollowupOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrderInput | SortOrder
    tipo?: SortOrder
    categoria?: SortOrder
    usuario_id?: SortOrderInput | SortOrder
    usuario_nome?: SortOrderInput | SortOrder
    created_at?: SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
  }

  export type ProcessoFollowupWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoFollowupWhereInput | ProcessoFollowupWhereInput[]
    OR?: ProcessoFollowupWhereInput[]
    NOT?: ProcessoFollowupWhereInput | ProcessoFollowupWhereInput[]
    tenant_id?: StringFilter<"ProcessoFollowup"> | string
    product_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    user_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    processo_id?: StringFilter<"ProcessoFollowup"> | string
    titulo?: StringFilter<"ProcessoFollowup"> | string
    descricao?: StringNullableFilter<"ProcessoFollowup"> | string | null
    tipo?: StringFilter<"ProcessoFollowup"> | string
    categoria?: StringFilter<"ProcessoFollowup"> | string
    usuario_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    usuario_nome?: StringNullableFilter<"ProcessoFollowup"> | string | null
    created_at?: DateTimeFilter<"ProcessoFollowup"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }, "id">

  export type ProcessoFollowupOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrderInput | SortOrder
    tipo?: SortOrder
    categoria?: SortOrder
    usuario_id?: SortOrderInput | SortOrder
    usuario_nome?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: ProcessoFollowupCountOrderByAggregateInput
    _max?: ProcessoFollowupMaxOrderByAggregateInput
    _min?: ProcessoFollowupMinOrderByAggregateInput
  }

  export type ProcessoFollowupScalarWhereWithAggregatesInput = {
    AND?: ProcessoFollowupScalarWhereWithAggregatesInput | ProcessoFollowupScalarWhereWithAggregatesInput[]
    OR?: ProcessoFollowupScalarWhereWithAggregatesInput[]
    NOT?: ProcessoFollowupScalarWhereWithAggregatesInput | ProcessoFollowupScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoFollowup"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoFollowup"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    titulo?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    descricao?: StringNullableWithAggregatesFilter<"ProcessoFollowup"> | string | null
    tipo?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    categoria?: StringWithAggregatesFilter<"ProcessoFollowup"> | string
    usuario_id?: StringNullableWithAggregatesFilter<"ProcessoFollowup"> | string | null
    usuario_nome?: StringNullableWithAggregatesFilter<"ProcessoFollowup"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"ProcessoFollowup"> | Date | string
  }

  export type ProcessoAnexosWhereInput = {
    AND?: ProcessoAnexosWhereInput | ProcessoAnexosWhereInput[]
    OR?: ProcessoAnexosWhereInput[]
    NOT?: ProcessoAnexosWhereInput | ProcessoAnexosWhereInput[]
    id?: StringFilter<"ProcessoAnexos"> | string
    tenant_id?: StringFilter<"ProcessoAnexos"> | string
    product_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    user_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    processo_id?: StringFilter<"ProcessoAnexos"> | string
    nome?: StringFilter<"ProcessoAnexos"> | string
    tipo_arquivo?: StringFilter<"ProcessoAnexos"> | string
    tamanho_bytes?: IntFilter<"ProcessoAnexos"> | number
    url?: StringFilter<"ProcessoAnexos"> | string
    categoria?: StringFilter<"ProcessoAnexos"> | string
    created_at?: DateTimeFilter<"ProcessoAnexos"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }

  export type ProcessoAnexosOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    tipo_arquivo?: SortOrder
    tamanho_bytes?: SortOrder
    url?: SortOrder
    categoria?: SortOrder
    created_at?: SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
  }

  export type ProcessoAnexosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoAnexosWhereInput | ProcessoAnexosWhereInput[]
    OR?: ProcessoAnexosWhereInput[]
    NOT?: ProcessoAnexosWhereInput | ProcessoAnexosWhereInput[]
    tenant_id?: StringFilter<"ProcessoAnexos"> | string
    product_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    user_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    processo_id?: StringFilter<"ProcessoAnexos"> | string
    nome?: StringFilter<"ProcessoAnexos"> | string
    tipo_arquivo?: StringFilter<"ProcessoAnexos"> | string
    tamanho_bytes?: IntFilter<"ProcessoAnexos"> | number
    url?: StringFilter<"ProcessoAnexos"> | string
    categoria?: StringFilter<"ProcessoAnexos"> | string
    created_at?: DateTimeFilter<"ProcessoAnexos"> | Date | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }, "id">

  export type ProcessoAnexosOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    tipo_arquivo?: SortOrder
    tamanho_bytes?: SortOrder
    url?: SortOrder
    categoria?: SortOrder
    created_at?: SortOrder
    _count?: ProcessoAnexosCountOrderByAggregateInput
    _avg?: ProcessoAnexosAvgOrderByAggregateInput
    _max?: ProcessoAnexosMaxOrderByAggregateInput
    _min?: ProcessoAnexosMinOrderByAggregateInput
    _sum?: ProcessoAnexosSumOrderByAggregateInput
  }

  export type ProcessoAnexosScalarWhereWithAggregatesInput = {
    AND?: ProcessoAnexosScalarWhereWithAggregatesInput | ProcessoAnexosScalarWhereWithAggregatesInput[]
    OR?: ProcessoAnexosScalarWhereWithAggregatesInput[]
    NOT?: ProcessoAnexosScalarWhereWithAggregatesInput | ProcessoAnexosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoAnexos"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoAnexos"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    nome?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    tipo_arquivo?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    tamanho_bytes?: IntWithAggregatesFilter<"ProcessoAnexos"> | number
    url?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    categoria?: StringWithAggregatesFilter<"ProcessoAnexos"> | string
    created_at?: DateTimeWithAggregatesFilter<"ProcessoAnexos"> | Date | string
  }

  export type ProcessoEstimativaCustoWhereInput = {
    AND?: ProcessoEstimativaCustoWhereInput | ProcessoEstimativaCustoWhereInput[]
    OR?: ProcessoEstimativaCustoWhereInput[]
    NOT?: ProcessoEstimativaCustoWhereInput | ProcessoEstimativaCustoWhereInput[]
    id?: StringFilter<"ProcessoEstimativaCusto"> | string
    tenant_id?: StringFilter<"ProcessoEstimativaCusto"> | string
    product_id?: StringNullableFilter<"ProcessoEstimativaCusto"> | string | null
    user_id?: StringNullableFilter<"ProcessoEstimativaCusto"> | string | null
    processo_id?: StringFilter<"ProcessoEstimativaCusto"> | string
    impostos?: FloatFilter<"ProcessoEstimativaCusto"> | number
    frete?: FloatFilter<"ProcessoEstimativaCusto"> | number
    despacho?: FloatFilter<"ProcessoEstimativaCusto"> | number
    outros?: FloatFilter<"ProcessoEstimativaCusto"> | number
    total?: FloatFilter<"ProcessoEstimativaCusto"> | number
    moeda?: StringFilter<"ProcessoEstimativaCusto"> | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }

  export type ProcessoEstimativaCustoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
    moeda?: SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
  }

  export type ProcessoEstimativaCustoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    processo_id?: string
    AND?: ProcessoEstimativaCustoWhereInput | ProcessoEstimativaCustoWhereInput[]
    OR?: ProcessoEstimativaCustoWhereInput[]
    NOT?: ProcessoEstimativaCustoWhereInput | ProcessoEstimativaCustoWhereInput[]
    tenant_id?: StringFilter<"ProcessoEstimativaCusto"> | string
    product_id?: StringNullableFilter<"ProcessoEstimativaCusto"> | string | null
    user_id?: StringNullableFilter<"ProcessoEstimativaCusto"> | string | null
    impostos?: FloatFilter<"ProcessoEstimativaCusto"> | number
    frete?: FloatFilter<"ProcessoEstimativaCusto"> | number
    despacho?: FloatFilter<"ProcessoEstimativaCusto"> | number
    outros?: FloatFilter<"ProcessoEstimativaCusto"> | number
    total?: FloatFilter<"ProcessoEstimativaCusto"> | number
    moeda?: StringFilter<"ProcessoEstimativaCusto"> | string
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }, "id" | "processo_id">

  export type ProcessoEstimativaCustoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
    moeda?: SortOrder
    _count?: ProcessoEstimativaCustoCountOrderByAggregateInput
    _avg?: ProcessoEstimativaCustoAvgOrderByAggregateInput
    _max?: ProcessoEstimativaCustoMaxOrderByAggregateInput
    _min?: ProcessoEstimativaCustoMinOrderByAggregateInput
    _sum?: ProcessoEstimativaCustoSumOrderByAggregateInput
  }

  export type ProcessoEstimativaCustoScalarWhereWithAggregatesInput = {
    AND?: ProcessoEstimativaCustoScalarWhereWithAggregatesInput | ProcessoEstimativaCustoScalarWhereWithAggregatesInput[]
    OR?: ProcessoEstimativaCustoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoEstimativaCustoScalarWhereWithAggregatesInput | ProcessoEstimativaCustoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoEstimativaCusto"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoEstimativaCusto"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoEstimativaCusto"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoEstimativaCusto"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoEstimativaCusto"> | string
    impostos?: FloatWithAggregatesFilter<"ProcessoEstimativaCusto"> | number
    frete?: FloatWithAggregatesFilter<"ProcessoEstimativaCusto"> | number
    despacho?: FloatWithAggregatesFilter<"ProcessoEstimativaCusto"> | number
    outros?: FloatWithAggregatesFilter<"ProcessoEstimativaCusto"> | number
    total?: FloatWithAggregatesFilter<"ProcessoEstimativaCusto"> | number
    moeda?: StringWithAggregatesFilter<"ProcessoEstimativaCusto"> | string
  }

  export type ProcessoDadosTecnicosWhereInput = {
    AND?: ProcessoDadosTecnicosWhereInput | ProcessoDadosTecnicosWhereInput[]
    OR?: ProcessoDadosTecnicosWhereInput[]
    NOT?: ProcessoDadosTecnicosWhereInput | ProcessoDadosTecnicosWhereInput[]
    id?: StringFilter<"ProcessoDadosTecnicos"> | string
    tenant_id?: StringFilter<"ProcessoDadosTecnicos"> | string
    product_id?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    user_id?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    processo_id?: StringFilter<"ProcessoDadosTecnicos"> | string
    importador_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    importador_cnpj?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    importador_endereco?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_pais?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_endereco?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    modal?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    porto_embarque?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    porto_destino?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    navio_voo?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    container_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_contato?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    di_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    di_data?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    canal?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_apolice?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_valor?: FloatNullableFilter<"ProcessoDadosTecnicos"> | number | null
    seguro_moeda?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }

  export type ProcessoDadosTecnicosOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    importador_nome?: SortOrderInput | SortOrder
    importador_cnpj?: SortOrderInput | SortOrder
    importador_endereco?: SortOrderInput | SortOrder
    exportador_nome?: SortOrderInput | SortOrder
    exportador_pais?: SortOrderInput | SortOrder
    exportador_endereco?: SortOrderInput | SortOrder
    modal?: SortOrderInput | SortOrder
    porto_embarque?: SortOrderInput | SortOrder
    porto_destino?: SortOrderInput | SortOrder
    navio_voo?: SortOrderInput | SortOrder
    data_embarque?: SortOrderInput | SortOrder
    data_chegada_prevista?: SortOrderInput | SortOrder
    data_chegada_real?: SortOrderInput | SortOrder
    bl_numero?: SortOrderInput | SortOrder
    container_numero?: SortOrderInput | SortOrder
    despachante_nome?: SortOrderInput | SortOrder
    despachante_contato?: SortOrderInput | SortOrder
    di_numero?: SortOrderInput | SortOrder
    di_data?: SortOrderInput | SortOrder
    canal?: SortOrderInput | SortOrder
    seguro_apolice?: SortOrderInput | SortOrder
    seguro_valor?: SortOrderInput | SortOrder
    seguro_moeda?: SortOrderInput | SortOrder
    processo?: ProcessoGravityOrderByWithRelationInput
  }

  export type ProcessoDadosTecnicosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    processo_id?: string
    AND?: ProcessoDadosTecnicosWhereInput | ProcessoDadosTecnicosWhereInput[]
    OR?: ProcessoDadosTecnicosWhereInput[]
    NOT?: ProcessoDadosTecnicosWhereInput | ProcessoDadosTecnicosWhereInput[]
    tenant_id?: StringFilter<"ProcessoDadosTecnicos"> | string
    product_id?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    user_id?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    importador_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    importador_cnpj?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    importador_endereco?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_pais?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_endereco?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    modal?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    porto_embarque?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    porto_destino?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    navio_voo?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    container_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_nome?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_contato?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    di_numero?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    di_data?: DateTimeNullableFilter<"ProcessoDadosTecnicos"> | Date | string | null
    canal?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_apolice?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_valor?: FloatNullableFilter<"ProcessoDadosTecnicos"> | number | null
    seguro_moeda?: StringNullableFilter<"ProcessoDadosTecnicos"> | string | null
    processo?: XOR<ProcessoGravityRelationFilter, ProcessoGravityWhereInput>
  }, "id" | "processo_id">

  export type ProcessoDadosTecnicosOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrderInput | SortOrder
    processo_id?: SortOrder
    importador_nome?: SortOrderInput | SortOrder
    importador_cnpj?: SortOrderInput | SortOrder
    importador_endereco?: SortOrderInput | SortOrder
    exportador_nome?: SortOrderInput | SortOrder
    exportador_pais?: SortOrderInput | SortOrder
    exportador_endereco?: SortOrderInput | SortOrder
    modal?: SortOrderInput | SortOrder
    porto_embarque?: SortOrderInput | SortOrder
    porto_destino?: SortOrderInput | SortOrder
    navio_voo?: SortOrderInput | SortOrder
    data_embarque?: SortOrderInput | SortOrder
    data_chegada_prevista?: SortOrderInput | SortOrder
    data_chegada_real?: SortOrderInput | SortOrder
    bl_numero?: SortOrderInput | SortOrder
    container_numero?: SortOrderInput | SortOrder
    despachante_nome?: SortOrderInput | SortOrder
    despachante_contato?: SortOrderInput | SortOrder
    di_numero?: SortOrderInput | SortOrder
    di_data?: SortOrderInput | SortOrder
    canal?: SortOrderInput | SortOrder
    seguro_apolice?: SortOrderInput | SortOrder
    seguro_valor?: SortOrderInput | SortOrder
    seguro_moeda?: SortOrderInput | SortOrder
    _count?: ProcessoDadosTecnicosCountOrderByAggregateInput
    _avg?: ProcessoDadosTecnicosAvgOrderByAggregateInput
    _max?: ProcessoDadosTecnicosMaxOrderByAggregateInput
    _min?: ProcessoDadosTecnicosMinOrderByAggregateInput
    _sum?: ProcessoDadosTecnicosSumOrderByAggregateInput
  }

  export type ProcessoDadosTecnicosScalarWhereWithAggregatesInput = {
    AND?: ProcessoDadosTecnicosScalarWhereWithAggregatesInput | ProcessoDadosTecnicosScalarWhereWithAggregatesInput[]
    OR?: ProcessoDadosTecnicosScalarWhereWithAggregatesInput[]
    NOT?: ProcessoDadosTecnicosScalarWhereWithAggregatesInput | ProcessoDadosTecnicosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoDadosTecnicos"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoDadosTecnicos"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoDadosTecnicos"> | string
    importador_nome?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    importador_cnpj?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    importador_endereco?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_nome?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_pais?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    exportador_endereco?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    modal?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    porto_embarque?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    porto_destino?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    navio_voo?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    container_numero?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_nome?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    despachante_contato?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    di_numero?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    di_data?: DateTimeNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | Date | string | null
    canal?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_apolice?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
    seguro_valor?: FloatNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | number | null
    seguro_moeda?: StringNullableWithAggregatesFilter<"ProcessoDadosTecnicos"> | string | null
  }

  export type ProcessoStatusWhereInput = {
    AND?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    OR?: ProcessoStatusWhereInput[]
    NOT?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    id?: StringFilter<"ProcessoStatus"> | string
    tenant_id?: StringFilter<"ProcessoStatus"> | string
    product_id?: StringNullableFilter<"ProcessoStatus"> | string | null
    nome?: StringFilter<"ProcessoStatus"> | string
    rotulo?: StringFilter<"ProcessoStatus"> | string
    cor?: StringFilter<"ProcessoStatus"> | string
    icone?: StringNullableFilter<"ProcessoStatus"> | string | null
    ordem?: IntFilter<"ProcessoStatus"> | number
    is_padrao?: BoolFilter<"ProcessoStatus"> | boolean
    is_sistema?: BoolFilter<"ProcessoStatus"> | boolean
    created_at?: DateTimeFilter<"ProcessoStatus"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoStatus"> | Date | string
  }

  export type ProcessoStatusOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    cor?: SortOrder
    icone?: SortOrderInput | SortOrder
    ordem?: SortOrder
    is_padrao?: SortOrder
    is_sistema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoStatusWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_nome?: ProcessoStatusTenant_idNomeCompoundUniqueInput
    AND?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    OR?: ProcessoStatusWhereInput[]
    NOT?: ProcessoStatusWhereInput | ProcessoStatusWhereInput[]
    tenant_id?: StringFilter<"ProcessoStatus"> | string
    product_id?: StringNullableFilter<"ProcessoStatus"> | string | null
    nome?: StringFilter<"ProcessoStatus"> | string
    rotulo?: StringFilter<"ProcessoStatus"> | string
    cor?: StringFilter<"ProcessoStatus"> | string
    icone?: StringNullableFilter<"ProcessoStatus"> | string | null
    ordem?: IntFilter<"ProcessoStatus"> | number
    is_padrao?: BoolFilter<"ProcessoStatus"> | boolean
    is_sistema?: BoolFilter<"ProcessoStatus"> | boolean
    created_at?: DateTimeFilter<"ProcessoStatus"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoStatus"> | Date | string
  }, "id" | "tenant_id_nome">

  export type ProcessoStatusOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    cor?: SortOrder
    icone?: SortOrderInput | SortOrder
    ordem?: SortOrder
    is_padrao?: SortOrder
    is_sistema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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
    id?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoStatus"> | string | null
    nome?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    rotulo?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    cor?: StringWithAggregatesFilter<"ProcessoStatus"> | string
    icone?: StringNullableWithAggregatesFilter<"ProcessoStatus"> | string | null
    ordem?: IntWithAggregatesFilter<"ProcessoStatus"> | number
    is_padrao?: BoolWithAggregatesFilter<"ProcessoStatus"> | boolean
    is_sistema?: BoolWithAggregatesFilter<"ProcessoStatus"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"ProcessoStatus"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoStatus"> | Date | string
  }

  export type ProcessoColunasWhereInput = {
    AND?: ProcessoColunasWhereInput | ProcessoColunasWhereInput[]
    OR?: ProcessoColunasWhereInput[]
    NOT?: ProcessoColunasWhereInput | ProcessoColunasWhereInput[]
    id?: StringFilter<"ProcessoColunas"> | string
    tenant_id?: StringFilter<"ProcessoColunas"> | string
    product_id?: StringNullableFilter<"ProcessoColunas"> | string | null
    nome?: StringFilter<"ProcessoColunas"> | string
    rotulo?: StringFilter<"ProcessoColunas"> | string
    tipo?: StringFilter<"ProcessoColunas"> | string
    casas_decimais?: IntFilter<"ProcessoColunas"> | number
    opcoes?: JsonNullableFilter<"ProcessoColunas">
    ordem?: IntFilter<"ProcessoColunas"> | number
    filtravel?: BoolFilter<"ProcessoColunas"> | boolean
    exibida_padrao?: BoolFilter<"ProcessoColunas"> | boolean
    index_criado?: BoolFilter<"ProcessoColunas"> | boolean
    created_at?: DateTimeFilter<"ProcessoColunas"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoColunas"> | Date | string
  }

  export type ProcessoColunasOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    tipo?: SortOrder
    casas_decimais?: SortOrder
    opcoes?: SortOrderInput | SortOrder
    ordem?: SortOrder
    filtravel?: SortOrder
    exibida_padrao?: SortOrder
    index_criado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoColunasWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_nome?: ProcessoColunasTenant_idNomeCompoundUniqueInput
    AND?: ProcessoColunasWhereInput | ProcessoColunasWhereInput[]
    OR?: ProcessoColunasWhereInput[]
    NOT?: ProcessoColunasWhereInput | ProcessoColunasWhereInput[]
    tenant_id?: StringFilter<"ProcessoColunas"> | string
    product_id?: StringNullableFilter<"ProcessoColunas"> | string | null
    nome?: StringFilter<"ProcessoColunas"> | string
    rotulo?: StringFilter<"ProcessoColunas"> | string
    tipo?: StringFilter<"ProcessoColunas"> | string
    casas_decimais?: IntFilter<"ProcessoColunas"> | number
    opcoes?: JsonNullableFilter<"ProcessoColunas">
    ordem?: IntFilter<"ProcessoColunas"> | number
    filtravel?: BoolFilter<"ProcessoColunas"> | boolean
    exibida_padrao?: BoolFilter<"ProcessoColunas"> | boolean
    index_criado?: BoolFilter<"ProcessoColunas"> | boolean
    created_at?: DateTimeFilter<"ProcessoColunas"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoColunas"> | Date | string
  }, "id" | "tenant_id_nome">

  export type ProcessoColunasOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    tipo?: SortOrder
    casas_decimais?: SortOrder
    opcoes?: SortOrderInput | SortOrder
    ordem?: SortOrder
    filtravel?: SortOrder
    exibida_padrao?: SortOrder
    index_criado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProcessoColunasCountOrderByAggregateInput
    _avg?: ProcessoColunasAvgOrderByAggregateInput
    _max?: ProcessoColunasMaxOrderByAggregateInput
    _min?: ProcessoColunasMinOrderByAggregateInput
    _sum?: ProcessoColunasSumOrderByAggregateInput
  }

  export type ProcessoColunasScalarWhereWithAggregatesInput = {
    AND?: ProcessoColunasScalarWhereWithAggregatesInput | ProcessoColunasScalarWhereWithAggregatesInput[]
    OR?: ProcessoColunasScalarWhereWithAggregatesInput[]
    NOT?: ProcessoColunasScalarWhereWithAggregatesInput | ProcessoColunasScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoColunas"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoColunas"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoColunas"> | string | null
    nome?: StringWithAggregatesFilter<"ProcessoColunas"> | string
    rotulo?: StringWithAggregatesFilter<"ProcessoColunas"> | string
    tipo?: StringWithAggregatesFilter<"ProcessoColunas"> | string
    casas_decimais?: IntWithAggregatesFilter<"ProcessoColunas"> | number
    opcoes?: JsonNullableWithAggregatesFilter<"ProcessoColunas">
    ordem?: IntWithAggregatesFilter<"ProcessoColunas"> | number
    filtravel?: BoolWithAggregatesFilter<"ProcessoColunas"> | boolean
    exibida_padrao?: BoolWithAggregatesFilter<"ProcessoColunas"> | boolean
    index_criado?: BoolWithAggregatesFilter<"ProcessoColunas"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"ProcessoColunas"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoColunas"> | Date | string
  }

  export type ProcessosPedidoPreferenciaWhereInput = {
    AND?: ProcessosPedidoPreferenciaWhereInput | ProcessosPedidoPreferenciaWhereInput[]
    OR?: ProcessosPedidoPreferenciaWhereInput[]
    NOT?: ProcessosPedidoPreferenciaWhereInput | ProcessosPedidoPreferenciaWhereInput[]
    id?: StringFilter<"ProcessosPedidoPreferencia"> | string
    tenant_id?: StringFilter<"ProcessosPedidoPreferencia"> | string
    product_id?: StringNullableFilter<"ProcessosPedidoPreferencia"> | string | null
    user_id?: StringFilter<"ProcessosPedidoPreferencia"> | string
    colunas_visiveis?: StringNullableListFilter<"ProcessosPedidoPreferencia">
    colunas_largura?: JsonNullableFilter<"ProcessosPedidoPreferencia">
    updated_at?: DateTimeFilter<"ProcessosPedidoPreferencia"> | Date | string
  }

  export type ProcessosPedidoPreferenciaOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
  }

  export type ProcessosPedidoPreferenciaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_user_id?: ProcessosPedidoPreferenciaTenant_idUser_idCompoundUniqueInput
    AND?: ProcessosPedidoPreferenciaWhereInput | ProcessosPedidoPreferenciaWhereInput[]
    OR?: ProcessosPedidoPreferenciaWhereInput[]
    NOT?: ProcessosPedidoPreferenciaWhereInput | ProcessosPedidoPreferenciaWhereInput[]
    tenant_id?: StringFilter<"ProcessosPedidoPreferencia"> | string
    product_id?: StringNullableFilter<"ProcessosPedidoPreferencia"> | string | null
    user_id?: StringFilter<"ProcessosPedidoPreferencia"> | string
    colunas_visiveis?: StringNullableListFilter<"ProcessosPedidoPreferencia">
    colunas_largura?: JsonNullableFilter<"ProcessosPedidoPreferencia">
    updated_at?: DateTimeFilter<"ProcessosPedidoPreferencia"> | Date | string
  }, "id" | "tenant_id_user_id">

  export type ProcessosPedidoPreferenciaOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
    _count?: ProcessosPedidoPreferenciaCountOrderByAggregateInput
    _max?: ProcessosPedidoPreferenciaMaxOrderByAggregateInput
    _min?: ProcessosPedidoPreferenciaMinOrderByAggregateInput
  }

  export type ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput = {
    AND?: ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput | ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput[]
    OR?: ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput[]
    NOT?: ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput | ProcessosPedidoPreferenciaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessosPedidoPreferencia"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessosPedidoPreferencia"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessosPedidoPreferencia"> | string | null
    user_id?: StringWithAggregatesFilter<"ProcessosPedidoPreferencia"> | string
    colunas_visiveis?: StringNullableListFilter<"ProcessosPedidoPreferencia">
    colunas_largura?: JsonNullableWithAggregatesFilter<"ProcessosPedidoPreferencia">
    updated_at?: DateTimeWithAggregatesFilter<"ProcessosPedidoPreferencia"> | Date | string
  }

  export type ProcessoPedidoPadraoWhereInput = {
    AND?: ProcessoPedidoPadraoWhereInput | ProcessoPedidoPadraoWhereInput[]
    OR?: ProcessoPedidoPadraoWhereInput[]
    NOT?: ProcessoPedidoPadraoWhereInput | ProcessoPedidoPadraoWhereInput[]
    id?: StringFilter<"ProcessoPedidoPadrao"> | string
    tenant_id?: StringFilter<"ProcessoPedidoPadrao"> | string
    product_id?: StringNullableFilter<"ProcessoPedidoPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"ProcessoPedidoPadrao">
    colunas_largura?: JsonNullableFilter<"ProcessoPedidoPadrao">
    updated_at?: DateTimeFilter<"ProcessoPedidoPadrao"> | Date | string
  }

  export type ProcessoPedidoPadraoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoPadraoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id?: string
    AND?: ProcessoPedidoPadraoWhereInput | ProcessoPedidoPadraoWhereInput[]
    OR?: ProcessoPedidoPadraoWhereInput[]
    NOT?: ProcessoPedidoPadraoWhereInput | ProcessoPedidoPadraoWhereInput[]
    product_id?: StringNullableFilter<"ProcessoPedidoPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"ProcessoPedidoPadrao">
    colunas_largura?: JsonNullableFilter<"ProcessoPedidoPadrao">
    updated_at?: DateTimeFilter<"ProcessoPedidoPadrao"> | Date | string
  }, "id" | "tenant_id">

  export type ProcessoPedidoPadraoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
    _count?: ProcessoPedidoPadraoCountOrderByAggregateInput
    _max?: ProcessoPedidoPadraoMaxOrderByAggregateInput
    _min?: ProcessoPedidoPadraoMinOrderByAggregateInput
  }

  export type ProcessoPedidoPadraoScalarWhereWithAggregatesInput = {
    AND?: ProcessoPedidoPadraoScalarWhereWithAggregatesInput | ProcessoPedidoPadraoScalarWhereWithAggregatesInput[]
    OR?: ProcessoPedidoPadraoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoPedidoPadraoScalarWhereWithAggregatesInput | ProcessoPedidoPadraoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoPedidoPadrao"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoPedidoPadrao"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoPedidoPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"ProcessoPedidoPadrao">
    colunas_largura?: JsonNullableWithAggregatesFilter<"ProcessoPedidoPadrao">
    updated_at?: DateTimeWithAggregatesFilter<"ProcessoPedidoPadrao"> | Date | string
  }

  export type ProcessoGravityCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoGravityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoGravityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoEtapasCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
    processo: ProcessoGravityCreateNestedOneWithoutEtapasInput
  }

  export type ProcessoEtapasUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
  }

  export type ProcessoEtapasUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoGravityUpdateOneRequiredWithoutEtapasNestedInput
  }

  export type ProcessoEtapasUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoEtapasCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
  }

  export type ProcessoEtapasUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoEtapasUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoPedidoCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    processo: ProcessoGravityCreateNestedOneWithoutPedidosInput
    itens?: ProcessoPedidoItensCreateNestedManyWithoutPedidoInput
  }

  export type ProcessoPedidoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    itens?: ProcessoPedidoItensUncheckedCreateNestedManyWithoutPedidoInput
  }

  export type ProcessoPedidoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoGravityUpdateOneRequiredWithoutPedidosNestedInput
    itens?: ProcessoPedidoItensUpdateManyWithoutPedidoNestedInput
  }

  export type ProcessoPedidoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: ProcessoPedidoItensUncheckedUpdateManyWithoutPedidoNestedInput
  }

  export type ProcessoPedidoCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    pedido: ProcessoPedidoCreateNestedOneWithoutItensInput
  }

  export type ProcessoPedidoItensUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    pedido_id: string
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoItensUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    pedido?: ProcessoPedidoUpdateOneRequiredWithoutItensNestedInput
  }

  export type ProcessoPedidoItensUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    pedido_id?: StringFieldUpdateOperationsInput | string
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    pedido_id: string
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoItensUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    pedido_id?: StringFieldUpdateOperationsInput | string
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
    processo: ProcessoGravityCreateNestedOneWithoutFollowUpsInput
  }

  export type ProcessoFollowupUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
  }

  export type ProcessoFollowupUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoGravityUpdateOneRequiredWithoutFollowUpsNestedInput
  }

  export type ProcessoFollowupUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
  }

  export type ProcessoFollowupUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
    processo: ProcessoGravityCreateNestedOneWithoutDocumentosInput
  }

  export type ProcessoAnexosUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
  }

  export type ProcessoAnexosUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoGravityUpdateOneRequiredWithoutDocumentosNestedInput
  }

  export type ProcessoAnexosUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
  }

  export type ProcessoAnexosUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoEstimativaCustoCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    impostos?: number
    frete?: number
    despacho?: number
    outros?: number
    total?: number
    moeda?: string
    processo: ProcessoGravityCreateNestedOneWithoutEstimativaCustoInput
  }

  export type ProcessoEstimativaCustoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    impostos?: number
    frete?: number
    despacho?: number
    outros?: number
    total?: number
    moeda?: string
  }

  export type ProcessoEstimativaCustoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
    processo?: ProcessoGravityUpdateOneRequiredWithoutEstimativaCustoNestedInput
  }

  export type ProcessoEstimativaCustoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoEstimativaCustoCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    impostos?: number
    frete?: number
    despacho?: number
    outros?: number
    total?: number
    moeda?: string
  }

  export type ProcessoEstimativaCustoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoEstimativaCustoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoDadosTecnicosCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    importador_nome?: string | null
    importador_cnpj?: string | null
    importador_endereco?: string | null
    exportador_nome?: string | null
    exportador_pais?: string | null
    exportador_endereco?: string | null
    modal?: string | null
    porto_embarque?: string | null
    porto_destino?: string | null
    navio_voo?: string | null
    data_embarque?: Date | string | null
    data_chegada_prevista?: Date | string | null
    data_chegada_real?: Date | string | null
    bl_numero?: string | null
    container_numero?: string | null
    despachante_nome?: string | null
    despachante_contato?: string | null
    di_numero?: string | null
    di_data?: Date | string | null
    canal?: string | null
    seguro_apolice?: string | null
    seguro_valor?: number | null
    seguro_moeda?: string | null
    processo: ProcessoGravityCreateNestedOneWithoutDadosTecnicosInput
  }

  export type ProcessoDadosTecnicosUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    importador_nome?: string | null
    importador_cnpj?: string | null
    importador_endereco?: string | null
    exportador_nome?: string | null
    exportador_pais?: string | null
    exportador_endereco?: string | null
    modal?: string | null
    porto_embarque?: string | null
    porto_destino?: string | null
    navio_voo?: string | null
    data_embarque?: Date | string | null
    data_chegada_prevista?: Date | string | null
    data_chegada_real?: Date | string | null
    bl_numero?: string | null
    container_numero?: string | null
    despachante_nome?: string | null
    despachante_contato?: string | null
    di_numero?: string | null
    di_data?: Date | string | null
    canal?: string | null
    seguro_apolice?: string | null
    seguro_valor?: number | null
    seguro_moeda?: string | null
  }

  export type ProcessoDadosTecnicosUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoGravityUpdateOneRequiredWithoutDadosTecnicosNestedInput
  }

  export type ProcessoDadosTecnicosUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoDadosTecnicosCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    importador_nome?: string | null
    importador_cnpj?: string | null
    importador_endereco?: string | null
    exportador_nome?: string | null
    exportador_pais?: string | null
    exportador_endereco?: string | null
    modal?: string | null
    porto_embarque?: string | null
    porto_destino?: string | null
    navio_voo?: string | null
    data_embarque?: Date | string | null
    data_chegada_prevista?: Date | string | null
    data_chegada_real?: Date | string | null
    bl_numero?: string | null
    container_numero?: string | null
    despachante_nome?: string | null
    despachante_contato?: string | null
    di_numero?: string | null
    di_data?: Date | string | null
    canal?: string | null
    seguro_apolice?: string | null
    seguro_valor?: number | null
    seguro_moeda?: string | null
  }

  export type ProcessoDadosTecnicosUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoDadosTecnicosUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoStatusCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    cor: string
    icone?: string | null
    ordem?: number
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoStatusUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    cor: string
    icone?: string | null
    ordem?: number
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoStatusUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    cor?: StringFieldUpdateOperationsInput | string
    icone?: NullableStringFieldUpdateOperationsInput | string | null
    ordem?: IntFieldUpdateOperationsInput | number
    is_padrao?: BoolFieldUpdateOperationsInput | boolean
    is_sistema?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoStatusUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    cor?: StringFieldUpdateOperationsInput | string
    icone?: NullableStringFieldUpdateOperationsInput | string | null
    ordem?: IntFieldUpdateOperationsInput | number
    is_padrao?: BoolFieldUpdateOperationsInput | boolean
    is_sistema?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoStatusCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    cor: string
    icone?: string | null
    ordem?: number
    is_padrao?: boolean
    is_sistema?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoStatusUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    cor?: StringFieldUpdateOperationsInput | string
    icone?: NullableStringFieldUpdateOperationsInput | string | null
    ordem?: IntFieldUpdateOperationsInput | number
    is_padrao?: BoolFieldUpdateOperationsInput | boolean
    is_sistema?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoStatusUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    cor?: StringFieldUpdateOperationsInput | string
    icone?: NullableStringFieldUpdateOperationsInput | string | null
    ordem?: IntFieldUpdateOperationsInput | number
    is_padrao?: BoolFieldUpdateOperationsInput | boolean
    is_sistema?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoColunasCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    tipo: string
    casas_decimais?: number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: number
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoColunasUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    tipo: string
    casas_decimais?: number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: number
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoColunasUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    casas_decimais?: IntFieldUpdateOperationsInput | number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: IntFieldUpdateOperationsInput | number
    filtravel?: BoolFieldUpdateOperationsInput | boolean
    exibida_padrao?: BoolFieldUpdateOperationsInput | boolean
    index_criado?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoColunasUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    casas_decimais?: IntFieldUpdateOperationsInput | number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: IntFieldUpdateOperationsInput | number
    filtravel?: BoolFieldUpdateOperationsInput | boolean
    exibida_padrao?: BoolFieldUpdateOperationsInput | boolean
    index_criado?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoColunasCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    nome: string
    rotulo: string
    tipo: string
    casas_decimais?: number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: number
    filtravel?: boolean
    exibida_padrao?: boolean
    index_criado?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoColunasUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    casas_decimais?: IntFieldUpdateOperationsInput | number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: IntFieldUpdateOperationsInput | number
    filtravel?: BoolFieldUpdateOperationsInput | boolean
    exibida_padrao?: BoolFieldUpdateOperationsInput | boolean
    index_criado?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoColunasUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    rotulo?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    casas_decimais?: IntFieldUpdateOperationsInput | number
    opcoes?: NullableJsonNullValueInput | InputJsonValue
    ordem?: IntFieldUpdateOperationsInput | number
    filtravel?: BoolFieldUpdateOperationsInput | boolean
    exibida_padrao?: BoolFieldUpdateOperationsInput | boolean
    index_criado?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessosPedidoPreferenciaCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: ProcessosPedidoPreferenciaCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessosPedidoPreferenciaUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: ProcessosPedidoPreferenciaCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessosPedidoPreferenciaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: ProcessosPedidoPreferenciaUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessosPedidoPreferenciaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: ProcessosPedidoPreferenciaUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessosPedidoPreferenciaCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: ProcessosPedidoPreferenciaCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessosPedidoPreferenciaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: ProcessosPedidoPreferenciaUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessosPedidoPreferenciaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: ProcessosPedidoPreferenciaUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoPadraoCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: ProcessoPedidoPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessoPedidoPadraoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: ProcessoPedidoPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessoPedidoPadraoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: ProcessoPedidoPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoPadraoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: ProcessoPedidoPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoPadraoCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: ProcessoPedidoPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type ProcessoPedidoPadraoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: ProcessoPedidoPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoPadraoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: ProcessoPedidoPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type ProcessoEtapasListRelationFilter = {
    every?: ProcessoEtapasWhereInput
    some?: ProcessoEtapasWhereInput
    none?: ProcessoEtapasWhereInput
  }

  export type ProcessoPedidoListRelationFilter = {
    every?: ProcessoPedidoWhereInput
    some?: ProcessoPedidoWhereInput
    none?: ProcessoPedidoWhereInput
  }

  export type ProcessoFollowupListRelationFilter = {
    every?: ProcessoFollowupWhereInput
    some?: ProcessoFollowupWhereInput
    none?: ProcessoFollowupWhereInput
  }

  export type ProcessoAnexosListRelationFilter = {
    every?: ProcessoAnexosWhereInput
    some?: ProcessoAnexosWhereInput
    none?: ProcessoAnexosWhereInput
  }

  export type ProcessoEstimativaCustoNullableRelationFilter = {
    is?: ProcessoEstimativaCustoWhereInput | null
    isNot?: ProcessoEstimativaCustoWhereInput | null
  }

  export type ProcessoDadosTecnicosNullableRelationFilter = {
    is?: ProcessoDadosTecnicosWhereInput | null
    isNot?: ProcessoDadosTecnicosWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProcessoEtapasOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoPedidoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoFollowupOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoAnexosOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoGravityCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    numero?: SortOrder
    referencia_interna?: SortOrder
    referencia_dati?: SortOrder
    status?: SortOrder
    tipo?: SortOrder
    responsavel_id?: SortOrder
    vendedor_id?: SortOrder
    setor_responsavel?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoGravityMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    numero?: SortOrder
    referencia_interna?: SortOrder
    referencia_dati?: SortOrder
    status?: SortOrder
    tipo?: SortOrder
    responsavel_id?: SortOrder
    vendedor_id?: SortOrder
    setor_responsavel?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoGravityMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    numero?: SortOrder
    referencia_interna?: SortOrder
    referencia_dati?: SortOrder
    status?: SortOrder
    tipo?: SortOrder
    responsavel_id?: SortOrder
    vendedor_id?: SortOrder
    setor_responsavel?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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

  export type ProcessoGravityRelationFilter = {
    is?: ProcessoGravityWhereInput
    isNot?: ProcessoGravityWhereInput
  }

  export type ProcessoEtapasCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    status?: SortOrder
    data_prevista?: SortOrder
    data_realizada?: SortOrder
    observacao?: SortOrder
  }

  export type ProcessoEtapasMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    status?: SortOrder
    data_prevista?: SortOrder
    data_realizada?: SortOrder
    observacao?: SortOrder
  }

  export type ProcessoEtapasMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    status?: SortOrder
    data_prevista?: SortOrder
    data_realizada?: SortOrder
    observacao?: SortOrder
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type ProcessoPedidoItensListRelationFilter = {
    every?: ProcessoPedidoItensWhereInput
    some?: ProcessoPedidoItensWhereInput
    none?: ProcessoPedidoItensWhereInput
  }

  export type ProcessoPedidoItensOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoPedidoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    numero?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    valor_fob?: SortOrder
    moeda?: SortOrder
    peso_bruto?: SortOrder
    status?: SortOrder
    status_id?: SortOrder
    campos_custom?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoAvgOrderByAggregateInput = {
    valor_fob?: SortOrder
    peso_bruto?: SortOrder
  }

  export type ProcessoPedidoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    numero?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    valor_fob?: SortOrder
    moeda?: SortOrder
    peso_bruto?: SortOrder
    status?: SortOrder
    status_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    numero?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    valor_fob?: SortOrder
    moeda?: SortOrder
    peso_bruto?: SortOrder
    status?: SortOrder
    status_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoSumOrderByAggregateInput = {
    valor_fob?: SortOrder
    peso_bruto?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type ProcessoPedidoRelationFilter = {
    is?: ProcessoPedidoWhereInput
    isNot?: ProcessoPedidoWhereInput
  }

  export type ProcessoPedidoItensCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    pedido_id?: SortOrder
    numero_item?: SortOrder
    descricao?: SortOrder
    ncm?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
    moeda?: SortOrder
    status_li?: SortOrder
    campos_custom?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoItensAvgOrderByAggregateInput = {
    quantidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
  }

  export type ProcessoPedidoItensMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    pedido_id?: SortOrder
    numero_item?: SortOrder
    descricao?: SortOrder
    ncm?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
    moeda?: SortOrder
    status_li?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoItensMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    pedido_id?: SortOrder
    numero_item?: SortOrder
    descricao?: SortOrder
    ncm?: SortOrder
    quantidade?: SortOrder
    unidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
    moeda?: SortOrder
    status_li?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoItensSumOrderByAggregateInput = {
    quantidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
  }

  export type ProcessoFollowupCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    tipo?: SortOrder
    categoria?: SortOrder
    usuario_id?: SortOrder
    usuario_nome?: SortOrder
    created_at?: SortOrder
  }

  export type ProcessoFollowupMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    tipo?: SortOrder
    categoria?: SortOrder
    usuario_id?: SortOrder
    usuario_nome?: SortOrder
    created_at?: SortOrder
  }

  export type ProcessoFollowupMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    tipo?: SortOrder
    categoria?: SortOrder
    usuario_id?: SortOrder
    usuario_nome?: SortOrder
    created_at?: SortOrder
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

  export type ProcessoAnexosCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    tipo_arquivo?: SortOrder
    tamanho_bytes?: SortOrder
    url?: SortOrder
    categoria?: SortOrder
    created_at?: SortOrder
  }

  export type ProcessoAnexosAvgOrderByAggregateInput = {
    tamanho_bytes?: SortOrder
  }

  export type ProcessoAnexosMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    tipo_arquivo?: SortOrder
    tamanho_bytes?: SortOrder
    url?: SortOrder
    categoria?: SortOrder
    created_at?: SortOrder
  }

  export type ProcessoAnexosMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    nome?: SortOrder
    tipo_arquivo?: SortOrder
    tamanho_bytes?: SortOrder
    url?: SortOrder
    categoria?: SortOrder
    created_at?: SortOrder
  }

  export type ProcessoAnexosSumOrderByAggregateInput = {
    tamanho_bytes?: SortOrder
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

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ProcessoEstimativaCustoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
    moeda?: SortOrder
  }

  export type ProcessoEstimativaCustoAvgOrderByAggregateInput = {
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
  }

  export type ProcessoEstimativaCustoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
    moeda?: SortOrder
  }

  export type ProcessoEstimativaCustoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
    moeda?: SortOrder
  }

  export type ProcessoEstimativaCustoSumOrderByAggregateInput = {
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type ProcessoDadosTecnicosCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    importador_nome?: SortOrder
    importador_cnpj?: SortOrder
    importador_endereco?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    exportador_endereco?: SortOrder
    modal?: SortOrder
    porto_embarque?: SortOrder
    porto_destino?: SortOrder
    navio_voo?: SortOrder
    data_embarque?: SortOrder
    data_chegada_prevista?: SortOrder
    data_chegada_real?: SortOrder
    bl_numero?: SortOrder
    container_numero?: SortOrder
    despachante_nome?: SortOrder
    despachante_contato?: SortOrder
    di_numero?: SortOrder
    di_data?: SortOrder
    canal?: SortOrder
    seguro_apolice?: SortOrder
    seguro_valor?: SortOrder
    seguro_moeda?: SortOrder
  }

  export type ProcessoDadosTecnicosAvgOrderByAggregateInput = {
    seguro_valor?: SortOrder
  }

  export type ProcessoDadosTecnicosMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    importador_nome?: SortOrder
    importador_cnpj?: SortOrder
    importador_endereco?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    exportador_endereco?: SortOrder
    modal?: SortOrder
    porto_embarque?: SortOrder
    porto_destino?: SortOrder
    navio_voo?: SortOrder
    data_embarque?: SortOrder
    data_chegada_prevista?: SortOrder
    data_chegada_real?: SortOrder
    bl_numero?: SortOrder
    container_numero?: SortOrder
    despachante_nome?: SortOrder
    despachante_contato?: SortOrder
    di_numero?: SortOrder
    di_data?: SortOrder
    canal?: SortOrder
    seguro_apolice?: SortOrder
    seguro_valor?: SortOrder
    seguro_moeda?: SortOrder
  }

  export type ProcessoDadosTecnicosMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    processo_id?: SortOrder
    importador_nome?: SortOrder
    importador_cnpj?: SortOrder
    importador_endereco?: SortOrder
    exportador_nome?: SortOrder
    exportador_pais?: SortOrder
    exportador_endereco?: SortOrder
    modal?: SortOrder
    porto_embarque?: SortOrder
    porto_destino?: SortOrder
    navio_voo?: SortOrder
    data_embarque?: SortOrder
    data_chegada_prevista?: SortOrder
    data_chegada_real?: SortOrder
    bl_numero?: SortOrder
    container_numero?: SortOrder
    despachante_nome?: SortOrder
    despachante_contato?: SortOrder
    di_numero?: SortOrder
    di_data?: SortOrder
    canal?: SortOrder
    seguro_apolice?: SortOrder
    seguro_valor?: SortOrder
    seguro_moeda?: SortOrder
  }

  export type ProcessoDadosTecnicosSumOrderByAggregateInput = {
    seguro_valor?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProcessoStatusTenant_idNomeCompoundUniqueInput = {
    tenant_id: string
    nome: string
  }

  export type ProcessoStatusCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    cor?: SortOrder
    icone?: SortOrder
    ordem?: SortOrder
    is_padrao?: SortOrder
    is_sistema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoStatusAvgOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type ProcessoStatusMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    cor?: SortOrder
    icone?: SortOrder
    ordem?: SortOrder
    is_padrao?: SortOrder
    is_sistema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoStatusMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    cor?: SortOrder
    icone?: SortOrder
    ordem?: SortOrder
    is_padrao?: SortOrder
    is_sistema?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoStatusSumOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProcessoColunasTenant_idNomeCompoundUniqueInput = {
    tenant_id: string
    nome: string
  }

  export type ProcessoColunasCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    tipo?: SortOrder
    casas_decimais?: SortOrder
    opcoes?: SortOrder
    ordem?: SortOrder
    filtravel?: SortOrder
    exibida_padrao?: SortOrder
    index_criado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoColunasAvgOrderByAggregateInput = {
    casas_decimais?: SortOrder
    ordem?: SortOrder
  }

  export type ProcessoColunasMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    tipo?: SortOrder
    casas_decimais?: SortOrder
    ordem?: SortOrder
    filtravel?: SortOrder
    exibida_padrao?: SortOrder
    index_criado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoColunasMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    nome?: SortOrder
    rotulo?: SortOrder
    tipo?: SortOrder
    casas_decimais?: SortOrder
    ordem?: SortOrder
    filtravel?: SortOrder
    exibida_padrao?: SortOrder
    index_criado?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoColunasSumOrderByAggregateInput = {
    casas_decimais?: SortOrder
    ordem?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ProcessosPedidoPreferenciaTenant_idUser_idCompoundUniqueInput = {
    tenant_id: string
    user_id: string
  }

  export type ProcessosPedidoPreferenciaCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessosPedidoPreferenciaMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessosPedidoPreferenciaMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoPadraoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoPadraoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoPedidoPadraoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoEtapasCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput> | ProcessoEtapasCreateWithoutProcessoInput[] | ProcessoEtapasUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapasCreateOrConnectWithoutProcessoInput | ProcessoEtapasCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoEtapasCreateManyProcessoInputEnvelope
    connect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
  }

  export type ProcessoPedidoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput> | ProcessoPedidoCreateWithoutProcessoInput[] | ProcessoPedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutProcessoInput | ProcessoPedidoCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoPedidoCreateManyProcessoInputEnvelope
    connect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
  }

  export type ProcessoFollowupCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput> | ProcessoFollowupCreateWithoutProcessoInput[] | ProcessoFollowupUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoFollowupCreateOrConnectWithoutProcessoInput | ProcessoFollowupCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoFollowupCreateManyProcessoInputEnvelope
    connect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
  }

  export type ProcessoAnexosCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput> | ProcessoAnexosCreateWithoutProcessoInput[] | ProcessoAnexosUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoAnexosCreateOrConnectWithoutProcessoInput | ProcessoAnexosCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoAnexosCreateManyProcessoInputEnvelope
    connect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
  }

  export type ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoEstimativaCustoCreateOrConnectWithoutProcessoInput
    connect?: ProcessoEstimativaCustoWhereUniqueInput
  }

  export type ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput = {
    create?: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoDadosTecnicosCreateOrConnectWithoutProcessoInput
    connect?: ProcessoDadosTecnicosWhereUniqueInput
  }

  export type ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput> | ProcessoEtapasCreateWithoutProcessoInput[] | ProcessoEtapasUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapasCreateOrConnectWithoutProcessoInput | ProcessoEtapasCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoEtapasCreateManyProcessoInputEnvelope
    connect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
  }

  export type ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput> | ProcessoPedidoCreateWithoutProcessoInput[] | ProcessoPedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutProcessoInput | ProcessoPedidoCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoPedidoCreateManyProcessoInputEnvelope
    connect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
  }

  export type ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput> | ProcessoFollowupCreateWithoutProcessoInput[] | ProcessoFollowupUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoFollowupCreateOrConnectWithoutProcessoInput | ProcessoFollowupCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoFollowupCreateManyProcessoInputEnvelope
    connect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
  }

  export type ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput> | ProcessoAnexosCreateWithoutProcessoInput[] | ProcessoAnexosUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoAnexosCreateOrConnectWithoutProcessoInput | ProcessoAnexosCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoAnexosCreateManyProcessoInputEnvelope
    connect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
  }

  export type ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoEstimativaCustoCreateOrConnectWithoutProcessoInput
    connect?: ProcessoEstimativaCustoWhereUniqueInput
  }

  export type ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoDadosTecnicosCreateOrConnectWithoutProcessoInput
    connect?: ProcessoDadosTecnicosWhereUniqueInput
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

  export type ProcessoEtapasUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput> | ProcessoEtapasCreateWithoutProcessoInput[] | ProcessoEtapasUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapasCreateOrConnectWithoutProcessoInput | ProcessoEtapasCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoEtapasUpsertWithWhereUniqueWithoutProcessoInput | ProcessoEtapasUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoEtapasCreateManyProcessoInputEnvelope
    set?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    disconnect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    delete?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    connect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    update?: ProcessoEtapasUpdateWithWhereUniqueWithoutProcessoInput | ProcessoEtapasUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoEtapasUpdateManyWithWhereWithoutProcessoInput | ProcessoEtapasUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoEtapasScalarWhereInput | ProcessoEtapasScalarWhereInput[]
  }

  export type ProcessoPedidoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput> | ProcessoPedidoCreateWithoutProcessoInput[] | ProcessoPedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutProcessoInput | ProcessoPedidoCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoPedidoUpsertWithWhereUniqueWithoutProcessoInput | ProcessoPedidoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoPedidoCreateManyProcessoInputEnvelope
    set?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    disconnect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    delete?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    connect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    update?: ProcessoPedidoUpdateWithWhereUniqueWithoutProcessoInput | ProcessoPedidoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoPedidoUpdateManyWithWhereWithoutProcessoInput | ProcessoPedidoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoPedidoScalarWhereInput | ProcessoPedidoScalarWhereInput[]
  }

  export type ProcessoFollowupUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput> | ProcessoFollowupCreateWithoutProcessoInput[] | ProcessoFollowupUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoFollowupCreateOrConnectWithoutProcessoInput | ProcessoFollowupCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoFollowupUpsertWithWhereUniqueWithoutProcessoInput | ProcessoFollowupUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoFollowupCreateManyProcessoInputEnvelope
    set?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    disconnect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    delete?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    connect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    update?: ProcessoFollowupUpdateWithWhereUniqueWithoutProcessoInput | ProcessoFollowupUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoFollowupUpdateManyWithWhereWithoutProcessoInput | ProcessoFollowupUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoFollowupScalarWhereInput | ProcessoFollowupScalarWhereInput[]
  }

  export type ProcessoAnexosUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput> | ProcessoAnexosCreateWithoutProcessoInput[] | ProcessoAnexosUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoAnexosCreateOrConnectWithoutProcessoInput | ProcessoAnexosCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoAnexosUpsertWithWhereUniqueWithoutProcessoInput | ProcessoAnexosUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoAnexosCreateManyProcessoInputEnvelope
    set?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    disconnect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    delete?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    connect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    update?: ProcessoAnexosUpdateWithWhereUniqueWithoutProcessoInput | ProcessoAnexosUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoAnexosUpdateManyWithWhereWithoutProcessoInput | ProcessoAnexosUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoAnexosScalarWhereInput | ProcessoAnexosScalarWhereInput[]
  }

  export type ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoEstimativaCustoCreateOrConnectWithoutProcessoInput
    upsert?: ProcessoEstimativaCustoUpsertWithoutProcessoInput
    disconnect?: ProcessoEstimativaCustoWhereInput | boolean
    delete?: ProcessoEstimativaCustoWhereInput | boolean
    connect?: ProcessoEstimativaCustoWhereUniqueInput
    update?: XOR<XOR<ProcessoEstimativaCustoUpdateToOneWithWhereWithoutProcessoInput, ProcessoEstimativaCustoUpdateWithoutProcessoInput>, ProcessoEstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoDadosTecnicosCreateOrConnectWithoutProcessoInput
    upsert?: ProcessoDadosTecnicosUpsertWithoutProcessoInput
    disconnect?: ProcessoDadosTecnicosWhereInput | boolean
    delete?: ProcessoDadosTecnicosWhereInput | boolean
    connect?: ProcessoDadosTecnicosWhereUniqueInput
    update?: XOR<XOR<ProcessoDadosTecnicosUpdateToOneWithWhereWithoutProcessoInput, ProcessoDadosTecnicosUpdateWithoutProcessoInput>, ProcessoDadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput> | ProcessoEtapasCreateWithoutProcessoInput[] | ProcessoEtapasUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapasCreateOrConnectWithoutProcessoInput | ProcessoEtapasCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoEtapasUpsertWithWhereUniqueWithoutProcessoInput | ProcessoEtapasUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoEtapasCreateManyProcessoInputEnvelope
    set?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    disconnect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    delete?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    connect?: ProcessoEtapasWhereUniqueInput | ProcessoEtapasWhereUniqueInput[]
    update?: ProcessoEtapasUpdateWithWhereUniqueWithoutProcessoInput | ProcessoEtapasUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoEtapasUpdateManyWithWhereWithoutProcessoInput | ProcessoEtapasUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoEtapasScalarWhereInput | ProcessoEtapasScalarWhereInput[]
  }

  export type ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput> | ProcessoPedidoCreateWithoutProcessoInput[] | ProcessoPedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutProcessoInput | ProcessoPedidoCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoPedidoUpsertWithWhereUniqueWithoutProcessoInput | ProcessoPedidoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoPedidoCreateManyProcessoInputEnvelope
    set?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    disconnect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    delete?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    connect?: ProcessoPedidoWhereUniqueInput | ProcessoPedidoWhereUniqueInput[]
    update?: ProcessoPedidoUpdateWithWhereUniqueWithoutProcessoInput | ProcessoPedidoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoPedidoUpdateManyWithWhereWithoutProcessoInput | ProcessoPedidoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoPedidoScalarWhereInput | ProcessoPedidoScalarWhereInput[]
  }

  export type ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput> | ProcessoFollowupCreateWithoutProcessoInput[] | ProcessoFollowupUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoFollowupCreateOrConnectWithoutProcessoInput | ProcessoFollowupCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoFollowupUpsertWithWhereUniqueWithoutProcessoInput | ProcessoFollowupUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoFollowupCreateManyProcessoInputEnvelope
    set?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    disconnect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    delete?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    connect?: ProcessoFollowupWhereUniqueInput | ProcessoFollowupWhereUniqueInput[]
    update?: ProcessoFollowupUpdateWithWhereUniqueWithoutProcessoInput | ProcessoFollowupUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoFollowupUpdateManyWithWhereWithoutProcessoInput | ProcessoFollowupUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoFollowupScalarWhereInput | ProcessoFollowupScalarWhereInput[]
  }

  export type ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput> | ProcessoAnexosCreateWithoutProcessoInput[] | ProcessoAnexosUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoAnexosCreateOrConnectWithoutProcessoInput | ProcessoAnexosCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoAnexosUpsertWithWhereUniqueWithoutProcessoInput | ProcessoAnexosUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoAnexosCreateManyProcessoInputEnvelope
    set?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    disconnect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    delete?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    connect?: ProcessoAnexosWhereUniqueInput | ProcessoAnexosWhereUniqueInput[]
    update?: ProcessoAnexosUpdateWithWhereUniqueWithoutProcessoInput | ProcessoAnexosUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoAnexosUpdateManyWithWhereWithoutProcessoInput | ProcessoAnexosUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoAnexosScalarWhereInput | ProcessoAnexosScalarWhereInput[]
  }

  export type ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoEstimativaCustoCreateOrConnectWithoutProcessoInput
    upsert?: ProcessoEstimativaCustoUpsertWithoutProcessoInput
    disconnect?: ProcessoEstimativaCustoWhereInput | boolean
    delete?: ProcessoEstimativaCustoWhereInput | boolean
    connect?: ProcessoEstimativaCustoWhereUniqueInput
    update?: XOR<XOR<ProcessoEstimativaCustoUpdateToOneWithWhereWithoutProcessoInput, ProcessoEstimativaCustoUpdateWithoutProcessoInput>, ProcessoEstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: ProcessoDadosTecnicosCreateOrConnectWithoutProcessoInput
    upsert?: ProcessoDadosTecnicosUpsertWithoutProcessoInput
    disconnect?: ProcessoDadosTecnicosWhereInput | boolean
    delete?: ProcessoDadosTecnicosWhereInput | boolean
    connect?: ProcessoDadosTecnicosWhereUniqueInput
    update?: XOR<XOR<ProcessoDadosTecnicosUpdateToOneWithWhereWithoutProcessoInput, ProcessoDadosTecnicosUpdateWithoutProcessoInput>, ProcessoDadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutEtapasInput = {
    create?: XOR<ProcessoGravityCreateWithoutEtapasInput, ProcessoGravityUncheckedCreateWithoutEtapasInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutEtapasInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ProcessoGravityUpdateOneRequiredWithoutEtapasNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutEtapasInput, ProcessoGravityUncheckedCreateWithoutEtapasInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutEtapasInput
    upsert?: ProcessoGravityUpsertWithoutEtapasInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutEtapasInput, ProcessoGravityUpdateWithoutEtapasInput>, ProcessoGravityUncheckedUpdateWithoutEtapasInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutPedidosInput = {
    create?: XOR<ProcessoGravityCreateWithoutPedidosInput, ProcessoGravityUncheckedCreateWithoutPedidosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutPedidosInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type ProcessoPedidoItensCreateNestedManyWithoutPedidoInput = {
    create?: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput> | ProcessoPedidoItensCreateWithoutPedidoInput[] | ProcessoPedidoItensUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: ProcessoPedidoItensCreateOrConnectWithoutPedidoInput | ProcessoPedidoItensCreateOrConnectWithoutPedidoInput[]
    createMany?: ProcessoPedidoItensCreateManyPedidoInputEnvelope
    connect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
  }

  export type ProcessoPedidoItensUncheckedCreateNestedManyWithoutPedidoInput = {
    create?: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput> | ProcessoPedidoItensCreateWithoutPedidoInput[] | ProcessoPedidoItensUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: ProcessoPedidoItensCreateOrConnectWithoutPedidoInput | ProcessoPedidoItensCreateOrConnectWithoutPedidoInput[]
    createMany?: ProcessoPedidoItensCreateManyPedidoInputEnvelope
    connect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ProcessoGravityUpdateOneRequiredWithoutPedidosNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutPedidosInput, ProcessoGravityUncheckedCreateWithoutPedidosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutPedidosInput
    upsert?: ProcessoGravityUpsertWithoutPedidosInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutPedidosInput, ProcessoGravityUpdateWithoutPedidosInput>, ProcessoGravityUncheckedUpdateWithoutPedidosInput>
  }

  export type ProcessoPedidoItensUpdateManyWithoutPedidoNestedInput = {
    create?: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput> | ProcessoPedidoItensCreateWithoutPedidoInput[] | ProcessoPedidoItensUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: ProcessoPedidoItensCreateOrConnectWithoutPedidoInput | ProcessoPedidoItensCreateOrConnectWithoutPedidoInput[]
    upsert?: ProcessoPedidoItensUpsertWithWhereUniqueWithoutPedidoInput | ProcessoPedidoItensUpsertWithWhereUniqueWithoutPedidoInput[]
    createMany?: ProcessoPedidoItensCreateManyPedidoInputEnvelope
    set?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    disconnect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    delete?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    connect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    update?: ProcessoPedidoItensUpdateWithWhereUniqueWithoutPedidoInput | ProcessoPedidoItensUpdateWithWhereUniqueWithoutPedidoInput[]
    updateMany?: ProcessoPedidoItensUpdateManyWithWhereWithoutPedidoInput | ProcessoPedidoItensUpdateManyWithWhereWithoutPedidoInput[]
    deleteMany?: ProcessoPedidoItensScalarWhereInput | ProcessoPedidoItensScalarWhereInput[]
  }

  export type ProcessoPedidoItensUncheckedUpdateManyWithoutPedidoNestedInput = {
    create?: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput> | ProcessoPedidoItensCreateWithoutPedidoInput[] | ProcessoPedidoItensUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: ProcessoPedidoItensCreateOrConnectWithoutPedidoInput | ProcessoPedidoItensCreateOrConnectWithoutPedidoInput[]
    upsert?: ProcessoPedidoItensUpsertWithWhereUniqueWithoutPedidoInput | ProcessoPedidoItensUpsertWithWhereUniqueWithoutPedidoInput[]
    createMany?: ProcessoPedidoItensCreateManyPedidoInputEnvelope
    set?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    disconnect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    delete?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    connect?: ProcessoPedidoItensWhereUniqueInput | ProcessoPedidoItensWhereUniqueInput[]
    update?: ProcessoPedidoItensUpdateWithWhereUniqueWithoutPedidoInput | ProcessoPedidoItensUpdateWithWhereUniqueWithoutPedidoInput[]
    updateMany?: ProcessoPedidoItensUpdateManyWithWhereWithoutPedidoInput | ProcessoPedidoItensUpdateManyWithWhereWithoutPedidoInput[]
    deleteMany?: ProcessoPedidoItensScalarWhereInput | ProcessoPedidoItensScalarWhereInput[]
  }

  export type ProcessoPedidoCreateNestedOneWithoutItensInput = {
    create?: XOR<ProcessoPedidoCreateWithoutItensInput, ProcessoPedidoUncheckedCreateWithoutItensInput>
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutItensInput
    connect?: ProcessoPedidoWhereUniqueInput
  }

  export type ProcessoPedidoUpdateOneRequiredWithoutItensNestedInput = {
    create?: XOR<ProcessoPedidoCreateWithoutItensInput, ProcessoPedidoUncheckedCreateWithoutItensInput>
    connectOrCreate?: ProcessoPedidoCreateOrConnectWithoutItensInput
    upsert?: ProcessoPedidoUpsertWithoutItensInput
    connect?: ProcessoPedidoWhereUniqueInput
    update?: XOR<XOR<ProcessoPedidoUpdateToOneWithWhereWithoutItensInput, ProcessoPedidoUpdateWithoutItensInput>, ProcessoPedidoUncheckedUpdateWithoutItensInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutFollowUpsInput = {
    create?: XOR<ProcessoGravityCreateWithoutFollowUpsInput, ProcessoGravityUncheckedCreateWithoutFollowUpsInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutFollowUpsInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type ProcessoGravityUpdateOneRequiredWithoutFollowUpsNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutFollowUpsInput, ProcessoGravityUncheckedCreateWithoutFollowUpsInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutFollowUpsInput
    upsert?: ProcessoGravityUpsertWithoutFollowUpsInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutFollowUpsInput, ProcessoGravityUpdateWithoutFollowUpsInput>, ProcessoGravityUncheckedUpdateWithoutFollowUpsInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<ProcessoGravityCreateWithoutDocumentosInput, ProcessoGravityUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutDocumentosInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoGravityUpdateOneRequiredWithoutDocumentosNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutDocumentosInput, ProcessoGravityUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutDocumentosInput
    upsert?: ProcessoGravityUpsertWithoutDocumentosInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutDocumentosInput, ProcessoGravityUpdateWithoutDocumentosInput>, ProcessoGravityUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutEstimativaCustoInput = {
    create?: XOR<ProcessoGravityCreateWithoutEstimativaCustoInput, ProcessoGravityUncheckedCreateWithoutEstimativaCustoInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutEstimativaCustoInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoGravityUpdateOneRequiredWithoutEstimativaCustoNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutEstimativaCustoInput, ProcessoGravityUncheckedCreateWithoutEstimativaCustoInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutEstimativaCustoInput
    upsert?: ProcessoGravityUpsertWithoutEstimativaCustoInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutEstimativaCustoInput, ProcessoGravityUpdateWithoutEstimativaCustoInput>, ProcessoGravityUncheckedUpdateWithoutEstimativaCustoInput>
  }

  export type ProcessoGravityCreateNestedOneWithoutDadosTecnicosInput = {
    create?: XOR<ProcessoGravityCreateWithoutDadosTecnicosInput, ProcessoGravityUncheckedCreateWithoutDadosTecnicosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutDadosTecnicosInput
    connect?: ProcessoGravityWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoGravityUpdateOneRequiredWithoutDadosTecnicosNestedInput = {
    create?: XOR<ProcessoGravityCreateWithoutDadosTecnicosInput, ProcessoGravityUncheckedCreateWithoutDadosTecnicosInput>
    connectOrCreate?: ProcessoGravityCreateOrConnectWithoutDadosTecnicosInput
    upsert?: ProcessoGravityUpsertWithoutDadosTecnicosInput
    connect?: ProcessoGravityWhereUniqueInput
    update?: XOR<XOR<ProcessoGravityUpdateToOneWithWhereWithoutDadosTecnicosInput, ProcessoGravityUpdateWithoutDadosTecnicosInput>, ProcessoGravityUncheckedUpdateWithoutDadosTecnicosInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProcessosPedidoPreferenciaCreatecolunas_visiveisInput = {
    set: string[]
  }

  export type ProcessosPedidoPreferenciaUpdatecolunas_visiveisInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ProcessoPedidoPadraoCreatecolunas_visiveisInput = {
    set: string[]
  }

  export type ProcessoPedidoPadraoUpdatecolunas_visiveisInput = {
    set?: string[]
    push?: string | string[]
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProcessoEtapasCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
  }

  export type ProcessoEtapasUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
  }

  export type ProcessoEtapasCreateOrConnectWithoutProcessoInput = {
    where: ProcessoEtapasWhereUniqueInput
    create: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapasCreateManyProcessoInputEnvelope = {
    data: ProcessoEtapasCreateManyProcessoInput | ProcessoEtapasCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoPedidoCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    itens?: ProcessoPedidoItensCreateNestedManyWithoutPedidoInput
  }

  export type ProcessoPedidoUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    itens?: ProcessoPedidoItensUncheckedCreateNestedManyWithoutPedidoInput
  }

  export type ProcessoPedidoCreateOrConnectWithoutProcessoInput = {
    where: ProcessoPedidoWhereUniqueInput
    create: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoPedidoCreateManyProcessoInputEnvelope = {
    data: ProcessoPedidoCreateManyProcessoInput | ProcessoPedidoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoFollowupCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
  }

  export type ProcessoFollowupUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
  }

  export type ProcessoFollowupCreateOrConnectWithoutProcessoInput = {
    where: ProcessoFollowupWhereUniqueInput
    create: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoFollowupCreateManyProcessoInputEnvelope = {
    data: ProcessoFollowupCreateManyProcessoInput | ProcessoFollowupCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoAnexosCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
  }

  export type ProcessoAnexosUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
  }

  export type ProcessoAnexosCreateOrConnectWithoutProcessoInput = {
    where: ProcessoAnexosWhereUniqueInput
    create: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoAnexosCreateManyProcessoInputEnvelope = {
    data: ProcessoAnexosCreateManyProcessoInput | ProcessoAnexosCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoEstimativaCustoCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    impostos?: number
    frete?: number
    despacho?: number
    outros?: number
    total?: number
    moeda?: string
  }

  export type ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    impostos?: number
    frete?: number
    despacho?: number
    outros?: number
    total?: number
    moeda?: string
  }

  export type ProcessoEstimativaCustoCreateOrConnectWithoutProcessoInput = {
    where: ProcessoEstimativaCustoWhereUniqueInput
    create: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoDadosTecnicosCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    importador_nome?: string | null
    importador_cnpj?: string | null
    importador_endereco?: string | null
    exportador_nome?: string | null
    exportador_pais?: string | null
    exportador_endereco?: string | null
    modal?: string | null
    porto_embarque?: string | null
    porto_destino?: string | null
    navio_voo?: string | null
    data_embarque?: Date | string | null
    data_chegada_prevista?: Date | string | null
    data_chegada_real?: Date | string | null
    bl_numero?: string | null
    container_numero?: string | null
    despachante_nome?: string | null
    despachante_contato?: string | null
    di_numero?: string | null
    di_data?: Date | string | null
    canal?: string | null
    seguro_apolice?: string | null
    seguro_valor?: number | null
    seguro_moeda?: string | null
  }

  export type ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    importador_nome?: string | null
    importador_cnpj?: string | null
    importador_endereco?: string | null
    exportador_nome?: string | null
    exportador_pais?: string | null
    exportador_endereco?: string | null
    modal?: string | null
    porto_embarque?: string | null
    porto_destino?: string | null
    navio_voo?: string | null
    data_embarque?: Date | string | null
    data_chegada_prevista?: Date | string | null
    data_chegada_real?: Date | string | null
    bl_numero?: string | null
    container_numero?: string | null
    despachante_nome?: string | null
    despachante_contato?: string | null
    di_numero?: string | null
    di_data?: Date | string | null
    canal?: string | null
    seguro_apolice?: string | null
    seguro_valor?: number | null
    seguro_moeda?: string | null
  }

  export type ProcessoDadosTecnicosCreateOrConnectWithoutProcessoInput = {
    where: ProcessoDadosTecnicosWhereUniqueInput
    create: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapasUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoEtapasWhereUniqueInput
    update: XOR<ProcessoEtapasUpdateWithoutProcessoInput, ProcessoEtapasUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoEtapasCreateWithoutProcessoInput, ProcessoEtapasUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapasUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoEtapasWhereUniqueInput
    data: XOR<ProcessoEtapasUpdateWithoutProcessoInput, ProcessoEtapasUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoEtapasUpdateManyWithWhereWithoutProcessoInput = {
    where: ProcessoEtapasScalarWhereInput
    data: XOR<ProcessoEtapasUpdateManyMutationInput, ProcessoEtapasUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ProcessoEtapasScalarWhereInput = {
    AND?: ProcessoEtapasScalarWhereInput | ProcessoEtapasScalarWhereInput[]
    OR?: ProcessoEtapasScalarWhereInput[]
    NOT?: ProcessoEtapasScalarWhereInput | ProcessoEtapasScalarWhereInput[]
    id?: StringFilter<"ProcessoEtapas"> | string
    tenant_id?: StringFilter<"ProcessoEtapas"> | string
    product_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapas"> | string | null
    processo_id?: StringFilter<"ProcessoEtapas"> | string
    nome?: StringFilter<"ProcessoEtapas"> | string
    status?: StringFilter<"ProcessoEtapas"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapas"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapas"> | string | null
  }

  export type ProcessoPedidoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoPedidoWhereUniqueInput
    update: XOR<ProcessoPedidoUpdateWithoutProcessoInput, ProcessoPedidoUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoPedidoCreateWithoutProcessoInput, ProcessoPedidoUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoPedidoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoPedidoWhereUniqueInput
    data: XOR<ProcessoPedidoUpdateWithoutProcessoInput, ProcessoPedidoUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoPedidoUpdateManyWithWhereWithoutProcessoInput = {
    where: ProcessoPedidoScalarWhereInput
    data: XOR<ProcessoPedidoUpdateManyMutationInput, ProcessoPedidoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ProcessoPedidoScalarWhereInput = {
    AND?: ProcessoPedidoScalarWhereInput | ProcessoPedidoScalarWhereInput[]
    OR?: ProcessoPedidoScalarWhereInput[]
    NOT?: ProcessoPedidoScalarWhereInput | ProcessoPedidoScalarWhereInput[]
    id?: StringFilter<"ProcessoPedido"> | string
    tenant_id?: StringFilter<"ProcessoPedido"> | string
    product_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    processo_id?: StringFilter<"ProcessoPedido"> | string
    numero?: StringFilter<"ProcessoPedido"> | string
    exportador_nome?: StringNullableFilter<"ProcessoPedido"> | string | null
    exportador_pais?: StringNullableFilter<"ProcessoPedido"> | string | null
    valor_fob?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedido"> | string
    peso_bruto?: DecimalFilter<"ProcessoPedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"ProcessoPedido"> | string
    status_id?: StringNullableFilter<"ProcessoPedido"> | string | null
    campos_custom?: JsonNullableFilter<"ProcessoPedido">
    created_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedido"> | Date | string
  }

  export type ProcessoFollowupUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoFollowupWhereUniqueInput
    update: XOR<ProcessoFollowupUpdateWithoutProcessoInput, ProcessoFollowupUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoFollowupCreateWithoutProcessoInput, ProcessoFollowupUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoFollowupUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoFollowupWhereUniqueInput
    data: XOR<ProcessoFollowupUpdateWithoutProcessoInput, ProcessoFollowupUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoFollowupUpdateManyWithWhereWithoutProcessoInput = {
    where: ProcessoFollowupScalarWhereInput
    data: XOR<ProcessoFollowupUpdateManyMutationInput, ProcessoFollowupUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ProcessoFollowupScalarWhereInput = {
    AND?: ProcessoFollowupScalarWhereInput | ProcessoFollowupScalarWhereInput[]
    OR?: ProcessoFollowupScalarWhereInput[]
    NOT?: ProcessoFollowupScalarWhereInput | ProcessoFollowupScalarWhereInput[]
    id?: StringFilter<"ProcessoFollowup"> | string
    tenant_id?: StringFilter<"ProcessoFollowup"> | string
    product_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    user_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    processo_id?: StringFilter<"ProcessoFollowup"> | string
    titulo?: StringFilter<"ProcessoFollowup"> | string
    descricao?: StringNullableFilter<"ProcessoFollowup"> | string | null
    tipo?: StringFilter<"ProcessoFollowup"> | string
    categoria?: StringFilter<"ProcessoFollowup"> | string
    usuario_id?: StringNullableFilter<"ProcessoFollowup"> | string | null
    usuario_nome?: StringNullableFilter<"ProcessoFollowup"> | string | null
    created_at?: DateTimeFilter<"ProcessoFollowup"> | Date | string
  }

  export type ProcessoAnexosUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoAnexosWhereUniqueInput
    update: XOR<ProcessoAnexosUpdateWithoutProcessoInput, ProcessoAnexosUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoAnexosCreateWithoutProcessoInput, ProcessoAnexosUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoAnexosUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoAnexosWhereUniqueInput
    data: XOR<ProcessoAnexosUpdateWithoutProcessoInput, ProcessoAnexosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoAnexosUpdateManyWithWhereWithoutProcessoInput = {
    where: ProcessoAnexosScalarWhereInput
    data: XOR<ProcessoAnexosUpdateManyMutationInput, ProcessoAnexosUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ProcessoAnexosScalarWhereInput = {
    AND?: ProcessoAnexosScalarWhereInput | ProcessoAnexosScalarWhereInput[]
    OR?: ProcessoAnexosScalarWhereInput[]
    NOT?: ProcessoAnexosScalarWhereInput | ProcessoAnexosScalarWhereInput[]
    id?: StringFilter<"ProcessoAnexos"> | string
    tenant_id?: StringFilter<"ProcessoAnexos"> | string
    product_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    user_id?: StringNullableFilter<"ProcessoAnexos"> | string | null
    processo_id?: StringFilter<"ProcessoAnexos"> | string
    nome?: StringFilter<"ProcessoAnexos"> | string
    tipo_arquivo?: StringFilter<"ProcessoAnexos"> | string
    tamanho_bytes?: IntFilter<"ProcessoAnexos"> | number
    url?: StringFilter<"ProcessoAnexos"> | string
    categoria?: StringFilter<"ProcessoAnexos"> | string
    created_at?: DateTimeFilter<"ProcessoAnexos"> | Date | string
  }

  export type ProcessoEstimativaCustoUpsertWithoutProcessoInput = {
    update: XOR<ProcessoEstimativaCustoUpdateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoEstimativaCustoCreateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedCreateWithoutProcessoInput>
    where?: ProcessoEstimativaCustoWhereInput
  }

  export type ProcessoEstimativaCustoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: ProcessoEstimativaCustoWhereInput
    data: XOR<ProcessoEstimativaCustoUpdateWithoutProcessoInput, ProcessoEstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoEstimativaCustoUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoEstimativaCustoUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    impostos?: FloatFieldUpdateOperationsInput | number
    frete?: FloatFieldUpdateOperationsInput | number
    despacho?: FloatFieldUpdateOperationsInput | number
    outros?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moeda?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoDadosTecnicosUpsertWithoutProcessoInput = {
    update: XOR<ProcessoDadosTecnicosUpdateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoDadosTecnicosCreateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedCreateWithoutProcessoInput>
    where?: ProcessoDadosTecnicosWhereInput
  }

  export type ProcessoDadosTecnicosUpdateToOneWithWhereWithoutProcessoInput = {
    where?: ProcessoDadosTecnicosWhereInput
    data: XOR<ProcessoDadosTecnicosUpdateWithoutProcessoInput, ProcessoDadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoDadosTecnicosUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoDadosTecnicosUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    importador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    importador_cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    importador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_endereco?: NullableStringFieldUpdateOperationsInput | string | null
    modal?: NullableStringFieldUpdateOperationsInput | string | null
    porto_embarque?: NullableStringFieldUpdateOperationsInput | string | null
    porto_destino?: NullableStringFieldUpdateOperationsInput | string | null
    navio_voo?: NullableStringFieldUpdateOperationsInput | string | null
    data_embarque?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_chegada_real?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    bl_numero?: NullableStringFieldUpdateOperationsInput | string | null
    container_numero?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_nome?: NullableStringFieldUpdateOperationsInput | string | null
    despachante_contato?: NullableStringFieldUpdateOperationsInput | string | null
    di_numero?: NullableStringFieldUpdateOperationsInput | string | null
    di_data?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    canal?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_apolice?: NullableStringFieldUpdateOperationsInput | string | null
    seguro_valor?: NullableFloatFieldUpdateOperationsInput | number | null
    seguro_moeda?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoGravityCreateWithoutEtapasInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutEtapasInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutEtapasInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutEtapasInput, ProcessoGravityUncheckedCreateWithoutEtapasInput>
  }

  export type ProcessoGravityUpsertWithoutEtapasInput = {
    update: XOR<ProcessoGravityUpdateWithoutEtapasInput, ProcessoGravityUncheckedUpdateWithoutEtapasInput>
    create: XOR<ProcessoGravityCreateWithoutEtapasInput, ProcessoGravityUncheckedCreateWithoutEtapasInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutEtapasInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutEtapasInput, ProcessoGravityUncheckedUpdateWithoutEtapasInput>
  }

  export type ProcessoGravityUpdateWithoutEtapasInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutEtapasInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityCreateWithoutPedidosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutPedidosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutPedidosInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutPedidosInput, ProcessoGravityUncheckedCreateWithoutPedidosInput>
  }

  export type ProcessoPedidoItensCreateWithoutPedidoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoItensUncheckedCreateWithoutPedidoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoItensCreateOrConnectWithoutPedidoInput = {
    where: ProcessoPedidoItensWhereUniqueInput
    create: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput>
  }

  export type ProcessoPedidoItensCreateManyPedidoInputEnvelope = {
    data: ProcessoPedidoItensCreateManyPedidoInput | ProcessoPedidoItensCreateManyPedidoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoGravityUpsertWithoutPedidosInput = {
    update: XOR<ProcessoGravityUpdateWithoutPedidosInput, ProcessoGravityUncheckedUpdateWithoutPedidosInput>
    create: XOR<ProcessoGravityCreateWithoutPedidosInput, ProcessoGravityUncheckedCreateWithoutPedidosInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutPedidosInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutPedidosInput, ProcessoGravityUncheckedUpdateWithoutPedidosInput>
  }

  export type ProcessoGravityUpdateWithoutPedidosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutPedidosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoPedidoItensUpsertWithWhereUniqueWithoutPedidoInput = {
    where: ProcessoPedidoItensWhereUniqueInput
    update: XOR<ProcessoPedidoItensUpdateWithoutPedidoInput, ProcessoPedidoItensUncheckedUpdateWithoutPedidoInput>
    create: XOR<ProcessoPedidoItensCreateWithoutPedidoInput, ProcessoPedidoItensUncheckedCreateWithoutPedidoInput>
  }

  export type ProcessoPedidoItensUpdateWithWhereUniqueWithoutPedidoInput = {
    where: ProcessoPedidoItensWhereUniqueInput
    data: XOR<ProcessoPedidoItensUpdateWithoutPedidoInput, ProcessoPedidoItensUncheckedUpdateWithoutPedidoInput>
  }

  export type ProcessoPedidoItensUpdateManyWithWhereWithoutPedidoInput = {
    where: ProcessoPedidoItensScalarWhereInput
    data: XOR<ProcessoPedidoItensUpdateManyMutationInput, ProcessoPedidoItensUncheckedUpdateManyWithoutPedidoInput>
  }

  export type ProcessoPedidoItensScalarWhereInput = {
    AND?: ProcessoPedidoItensScalarWhereInput | ProcessoPedidoItensScalarWhereInput[]
    OR?: ProcessoPedidoItensScalarWhereInput[]
    NOT?: ProcessoPedidoItensScalarWhereInput | ProcessoPedidoItensScalarWhereInput[]
    id?: StringFilter<"ProcessoPedidoItens"> | string
    tenant_id?: StringFilter<"ProcessoPedidoItens"> | string
    product_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    user_id?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    pedido_id?: StringFilter<"ProcessoPedidoItens"> | string
    numero_item?: StringFilter<"ProcessoPedidoItens"> | string
    descricao?: StringFilter<"ProcessoPedidoItens"> | string
    ncm?: StringNullableFilter<"ProcessoPedidoItens"> | string | null
    quantidade?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"ProcessoPedidoItens"> | string
    valor_unitario?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"ProcessoPedidoItens"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"ProcessoPedidoItens"> | string
    status_li?: StringFilter<"ProcessoPedidoItens"> | string
    campos_custom?: JsonNullableFilter<"ProcessoPedidoItens">
    created_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
    updated_at?: DateTimeFilter<"ProcessoPedidoItens"> | Date | string
  }

  export type ProcessoPedidoCreateWithoutItensInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    processo: ProcessoGravityCreateNestedOneWithoutPedidosInput
  }

  export type ProcessoPedidoUncheckedCreateWithoutItensInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    processo_id: string
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoCreateOrConnectWithoutItensInput = {
    where: ProcessoPedidoWhereUniqueInput
    create: XOR<ProcessoPedidoCreateWithoutItensInput, ProcessoPedidoUncheckedCreateWithoutItensInput>
  }

  export type ProcessoPedidoUpsertWithoutItensInput = {
    update: XOR<ProcessoPedidoUpdateWithoutItensInput, ProcessoPedidoUncheckedUpdateWithoutItensInput>
    create: XOR<ProcessoPedidoCreateWithoutItensInput, ProcessoPedidoUncheckedCreateWithoutItensInput>
    where?: ProcessoPedidoWhereInput
  }

  export type ProcessoPedidoUpdateToOneWithWhereWithoutItensInput = {
    where?: ProcessoPedidoWhereInput
    data: XOR<ProcessoPedidoUpdateWithoutItensInput, ProcessoPedidoUncheckedUpdateWithoutItensInput>
  }

  export type ProcessoPedidoUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoGravityUpdateOneRequiredWithoutPedidosNestedInput
  }

  export type ProcessoPedidoUncheckedUpdateWithoutItensInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    processo_id?: StringFieldUpdateOperationsInput | string
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoGravityCreateWithoutFollowUpsInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutFollowUpsInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutFollowUpsInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutFollowUpsInput, ProcessoGravityUncheckedCreateWithoutFollowUpsInput>
  }

  export type ProcessoGravityUpsertWithoutFollowUpsInput = {
    update: XOR<ProcessoGravityUpdateWithoutFollowUpsInput, ProcessoGravityUncheckedUpdateWithoutFollowUpsInput>
    create: XOR<ProcessoGravityCreateWithoutFollowUpsInput, ProcessoGravityUncheckedCreateWithoutFollowUpsInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutFollowUpsInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutFollowUpsInput, ProcessoGravityUncheckedUpdateWithoutFollowUpsInput>
  }

  export type ProcessoGravityUpdateWithoutFollowUpsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutFollowUpsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityCreateWithoutDocumentosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutDocumentosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutDocumentosInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutDocumentosInput, ProcessoGravityUncheckedCreateWithoutDocumentosInput>
  }

  export type ProcessoGravityUpsertWithoutDocumentosInput = {
    update: XOR<ProcessoGravityUpdateWithoutDocumentosInput, ProcessoGravityUncheckedUpdateWithoutDocumentosInput>
    create: XOR<ProcessoGravityCreateWithoutDocumentosInput, ProcessoGravityUncheckedCreateWithoutDocumentosInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutDocumentosInput, ProcessoGravityUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoGravityUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityCreateWithoutEstimativaCustoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutEstimativaCustoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutEstimativaCustoInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutEstimativaCustoInput, ProcessoGravityUncheckedCreateWithoutEstimativaCustoInput>
  }

  export type ProcessoGravityUpsertWithoutEstimativaCustoInput = {
    update: XOR<ProcessoGravityUpdateWithoutEstimativaCustoInput, ProcessoGravityUncheckedUpdateWithoutEstimativaCustoInput>
    create: XOR<ProcessoGravityCreateWithoutEstimativaCustoInput, ProcessoGravityUncheckedCreateWithoutEstimativaCustoInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutEstimativaCustoInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutEstimativaCustoInput, ProcessoGravityUncheckedUpdateWithoutEstimativaCustoInput>
  }

  export type ProcessoGravityUpdateWithoutEstimativaCustoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutEstimativaCustoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    dadosTecnicos?: ProcessoDadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityCreateWithoutDadosTecnicosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityUncheckedCreateWithoutDadosTecnicosInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    referencia_interna?: string | null
    referencia_dati?: string | null
    status?: string
    tipo: string
    responsavel_id?: string | null
    vendedor_id?: string | null
    setor_responsavel?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    etapas?: ProcessoEtapasUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: ProcessoPedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: ProcessoFollowupUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: ProcessoAnexosUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoGravityCreateOrConnectWithoutDadosTecnicosInput = {
    where: ProcessoGravityWhereUniqueInput
    create: XOR<ProcessoGravityCreateWithoutDadosTecnicosInput, ProcessoGravityUncheckedCreateWithoutDadosTecnicosInput>
  }

  export type ProcessoGravityUpsertWithoutDadosTecnicosInput = {
    update: XOR<ProcessoGravityUpdateWithoutDadosTecnicosInput, ProcessoGravityUncheckedUpdateWithoutDadosTecnicosInput>
    create: XOR<ProcessoGravityCreateWithoutDadosTecnicosInput, ProcessoGravityUncheckedCreateWithoutDadosTecnicosInput>
    where?: ProcessoGravityWhereInput
  }

  export type ProcessoGravityUpdateToOneWithWhereWithoutDadosTecnicosInput = {
    where?: ProcessoGravityWhereInput
    data: XOR<ProcessoGravityUpdateWithoutDadosTecnicosInput, ProcessoGravityUncheckedUpdateWithoutDadosTecnicosInput>
  }

  export type ProcessoGravityUpdateWithoutDadosTecnicosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoGravityUncheckedUpdateWithoutDadosTecnicosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    referencia_interna?: NullableStringFieldUpdateOperationsInput | string | null
    referencia_dati?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    responsavel_id?: NullableStringFieldUpdateOperationsInput | string | null
    vendedor_id?: NullableStringFieldUpdateOperationsInput | string | null
    setor_responsavel?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    etapas?: ProcessoEtapasUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: ProcessoPedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: ProcessoFollowupUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: ProcessoAnexosUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: ProcessoEstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoEtapasCreateManyProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
  }

  export type ProcessoPedidoCreateManyProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero: string
    exportador_nome?: string | null
    exportador_pais?: string | null
    valor_fob?: Decimal | DecimalJsLike | number | string
    moeda?: string
    peso_bruto?: Decimal | DecimalJsLike | number | string
    status?: string
    status_id?: string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoFollowupCreateManyProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    titulo: string
    descricao?: string | null
    tipo?: string
    categoria?: string
    usuario_id?: string | null
    usuario_nome?: string | null
    created_at?: Date | string
  }

  export type ProcessoAnexosCreateManyProcessoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    tipo_arquivo: string
    tamanho_bytes?: number
    url: string
    categoria?: string
    created_at?: Date | string
  }

  export type ProcessoEtapasUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoEtapasUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoEtapasUncheckedUpdateManyWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoPedidoUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: ProcessoPedidoItensUpdateManyWithoutPedidoNestedInput
  }

  export type ProcessoPedidoUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    itens?: ProcessoPedidoItensUncheckedUpdateManyWithoutPedidoNestedInput
  }

  export type ProcessoPedidoUncheckedUpdateManyWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero?: StringFieldUpdateOperationsInput | string
    exportador_nome?: NullableStringFieldUpdateOperationsInput | string | null
    exportador_pais?: NullableStringFieldUpdateOperationsInput | string | null
    valor_fob?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    peso_bruto?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: StringFieldUpdateOperationsInput | string
    status_id?: NullableStringFieldUpdateOperationsInput | string | null
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoFollowupUncheckedUpdateManyWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    usuario_id?: NullableStringFieldUpdateOperationsInput | string | null
    usuario_nome?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoAnexosUncheckedUpdateManyWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    tipo_arquivo?: StringFieldUpdateOperationsInput | string
    tamanho_bytes?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
    categoria?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensCreateManyPedidoInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    numero_item: string
    descricao: string
    ncm?: string | null
    quantidade?: Decimal | DecimalJsLike | number | string
    unidade?: string
    valor_unitario?: Decimal | DecimalJsLike | number | string
    valor_total?: Decimal | DecimalJsLike | number | string
    moeda?: string
    status_li?: string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProcessoPedidoItensUpdateWithoutPedidoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensUncheckedUpdateWithoutPedidoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProcessoPedidoItensUncheckedUpdateManyWithoutPedidoInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    numero_item?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    ncm?: NullableStringFieldUpdateOperationsInput | string | null
    quantidade?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unidade?: StringFieldUpdateOperationsInput | string
    valor_unitario?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    moeda?: StringFieldUpdateOperationsInput | string
    status_li?: StringFieldUpdateOperationsInput | string
    campos_custom?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ProcessoGravityCountOutputTypeDefaultArgs instead
     */
    export type ProcessoGravityCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoGravityCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoPedidoCountOutputTypeDefaultArgs instead
     */
    export type ProcessoPedidoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoPedidoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoGravityDefaultArgs instead
     */
    export type ProcessoGravityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoGravityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoEtapasDefaultArgs instead
     */
    export type ProcessoEtapasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoEtapasDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoPedidoDefaultArgs instead
     */
    export type ProcessoPedidoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoPedidoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoPedidoItensDefaultArgs instead
     */
    export type ProcessoPedidoItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoPedidoItensDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoFollowupDefaultArgs instead
     */
    export type ProcessoFollowupArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoFollowupDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoAnexosDefaultArgs instead
     */
    export type ProcessoAnexosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoAnexosDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoEstimativaCustoDefaultArgs instead
     */
    export type ProcessoEstimativaCustoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoEstimativaCustoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoDadosTecnicosDefaultArgs instead
     */
    export type ProcessoDadosTecnicosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoDadosTecnicosDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoStatusDefaultArgs instead
     */
    export type ProcessoStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoStatusDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoColunasDefaultArgs instead
     */
    export type ProcessoColunasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoColunasDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessosPedidoPreferenciaDefaultArgs instead
     */
    export type ProcessosPedidoPreferenciaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessosPedidoPreferenciaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoPedidoPadraoDefaultArgs instead
     */
    export type ProcessoPedidoPadraoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoPedidoPadraoDefaultArgs<ExtArgs>

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