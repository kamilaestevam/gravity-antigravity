
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
 * Model ProcessoEtapa
 * 
 */
export type ProcessoEtapa = $Result.DefaultSelection<Prisma.$ProcessoEtapaPayload>
/**
 * Model Pedido
 * 
 */
export type Pedido = $Result.DefaultSelection<Prisma.$PedidoPayload>
/**
 * Model PedidoItem
 * 
 */
export type PedidoItem = $Result.DefaultSelection<Prisma.$PedidoItemPayload>
/**
 * Model FollowUp
 * 
 */
export type FollowUp = $Result.DefaultSelection<Prisma.$FollowUpPayload>
/**
 * Model Documento
 * 
 */
export type Documento = $Result.DefaultSelection<Prisma.$DocumentoPayload>
/**
 * Model EstimativaCusto
 * 
 */
export type EstimativaCusto = $Result.DefaultSelection<Prisma.$EstimativaCustoPayload>
/**
 * Model DadosTecnicos
 * 
 */
export type DadosTecnicos = $Result.DefaultSelection<Prisma.$DadosTecnicosPayload>
/**
 * Model PedidoStatus
 * 
 */
export type PedidoStatus = $Result.DefaultSelection<Prisma.$PedidoStatusPayload>
/**
 * Model PedidoColuna
 * 
 */
export type PedidoColuna = $Result.DefaultSelection<Prisma.$PedidoColunaPayload>
/**
 * Model PedidoPreferenciaUsuario
 * 
 */
export type PedidoPreferenciaUsuario = $Result.DefaultSelection<Prisma.$PedidoPreferenciaUsuarioPayload>
/**
 * Model PedidoPreferenciaPadrao
 * 
 */
export type PedidoPreferenciaPadrao = $Result.DefaultSelection<Prisma.$PedidoPreferenciaPadraoPayload>

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
   * `prisma.processoEtapa`: Exposes CRUD operations for the **ProcessoEtapa** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProcessoEtapas
    * const processoEtapas = await prisma.processoEtapa.findMany()
    * ```
    */
  get processoEtapa(): Prisma.ProcessoEtapaDelegate<ExtArgs>;

  /**
   * `prisma.pedido`: Exposes CRUD operations for the **Pedido** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pedidos
    * const pedidos = await prisma.pedido.findMany()
    * ```
    */
  get pedido(): Prisma.PedidoDelegate<ExtArgs>;

  /**
   * `prisma.pedidoItem`: Exposes CRUD operations for the **PedidoItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PedidoItems
    * const pedidoItems = await prisma.pedidoItem.findMany()
    * ```
    */
  get pedidoItem(): Prisma.PedidoItemDelegate<ExtArgs>;

  /**
   * `prisma.followUp`: Exposes CRUD operations for the **FollowUp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FollowUps
    * const followUps = await prisma.followUp.findMany()
    * ```
    */
  get followUp(): Prisma.FollowUpDelegate<ExtArgs>;

  /**
   * `prisma.documento`: Exposes CRUD operations for the **Documento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Documentos
    * const documentos = await prisma.documento.findMany()
    * ```
    */
  get documento(): Prisma.DocumentoDelegate<ExtArgs>;

  /**
   * `prisma.estimativaCusto`: Exposes CRUD operations for the **EstimativaCusto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EstimativaCustos
    * const estimativaCustos = await prisma.estimativaCusto.findMany()
    * ```
    */
  get estimativaCusto(): Prisma.EstimativaCustoDelegate<ExtArgs>;

  /**
   * `prisma.dadosTecnicos`: Exposes CRUD operations for the **DadosTecnicos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DadosTecnicos
    * const dadosTecnicos = await prisma.dadosTecnicos.findMany()
    * ```
    */
  get dadosTecnicos(): Prisma.DadosTecnicosDelegate<ExtArgs>;

  /**
   * `prisma.pedidoStatus`: Exposes CRUD operations for the **PedidoStatus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PedidoStatuses
    * const pedidoStatuses = await prisma.pedidoStatus.findMany()
    * ```
    */
  get pedidoStatus(): Prisma.PedidoStatusDelegate<ExtArgs>;

  /**
   * `prisma.pedidoColuna`: Exposes CRUD operations for the **PedidoColuna** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PedidoColunas
    * const pedidoColunas = await prisma.pedidoColuna.findMany()
    * ```
    */
  get pedidoColuna(): Prisma.PedidoColunaDelegate<ExtArgs>;

  /**
   * `prisma.pedidoPreferenciaUsuario`: Exposes CRUD operations for the **PedidoPreferenciaUsuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PedidoPreferenciaUsuarios
    * const pedidoPreferenciaUsuarios = await prisma.pedidoPreferenciaUsuario.findMany()
    * ```
    */
  get pedidoPreferenciaUsuario(): Prisma.PedidoPreferenciaUsuarioDelegate<ExtArgs>;

  /**
   * `prisma.pedidoPreferenciaPadrao`: Exposes CRUD operations for the **PedidoPreferenciaPadrao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PedidoPreferenciaPadraos
    * const pedidoPreferenciaPadraos = await prisma.pedidoPreferenciaPadrao.findMany()
    * ```
    */
  get pedidoPreferenciaPadrao(): Prisma.PedidoPreferenciaPadraoDelegate<ExtArgs>;
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
    ProcessoEtapa: 'ProcessoEtapa',
    Pedido: 'Pedido',
    PedidoItem: 'PedidoItem',
    FollowUp: 'FollowUp',
    Documento: 'Documento',
    EstimativaCusto: 'EstimativaCusto',
    DadosTecnicos: 'DadosTecnicos',
    PedidoStatus: 'PedidoStatus',
    PedidoColuna: 'PedidoColuna',
    PedidoPreferenciaUsuario: 'PedidoPreferenciaUsuario',
    PedidoPreferenciaPadrao: 'PedidoPreferenciaPadrao'
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
      modelProps: "processo" | "processoEtapa" | "pedido" | "pedidoItem" | "followUp" | "documento" | "estimativaCusto" | "dadosTecnicos" | "pedidoStatus" | "pedidoColuna" | "pedidoPreferenciaUsuario" | "pedidoPreferenciaPadrao"
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
      ProcessoEtapa: {
        payload: Prisma.$ProcessoEtapaPayload<ExtArgs>
        fields: Prisma.ProcessoEtapaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoEtapaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoEtapaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          findFirst: {
            args: Prisma.ProcessoEtapaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoEtapaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          findMany: {
            args: Prisma.ProcessoEtapaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>[]
          }
          create: {
            args: Prisma.ProcessoEtapaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          createMany: {
            args: Prisma.ProcessoEtapaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoEtapaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>[]
          }
          delete: {
            args: Prisma.ProcessoEtapaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          update: {
            args: Prisma.ProcessoEtapaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoEtapaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoEtapaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoEtapaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoEtapaPayload>
          }
          aggregate: {
            args: Prisma.ProcessoEtapaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcessoEtapa>
          }
          groupBy: {
            args: Prisma.ProcessoEtapaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEtapaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoEtapaCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoEtapaCountAggregateOutputType> | number
          }
        }
      }
      Pedido: {
        payload: Prisma.$PedidoPayload<ExtArgs>
        fields: Prisma.PedidoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          findFirst: {
            args: Prisma.PedidoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          findMany: {
            args: Prisma.PedidoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>[]
          }
          create: {
            args: Prisma.PedidoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          createMany: {
            args: Prisma.PedidoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>[]
          }
          delete: {
            args: Prisma.PedidoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          update: {
            args: Prisma.PedidoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          deleteMany: {
            args: Prisma.PedidoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPayload>
          }
          aggregate: {
            args: Prisma.PedidoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedido>
          }
          groupBy: {
            args: Prisma.PedidoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoCountAggregateOutputType> | number
          }
        }
      }
      PedidoItem: {
        payload: Prisma.$PedidoItemPayload<ExtArgs>
        fields: Prisma.PedidoItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          findFirst: {
            args: Prisma.PedidoItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          findMany: {
            args: Prisma.PedidoItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>[]
          }
          create: {
            args: Prisma.PedidoItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          createMany: {
            args: Prisma.PedidoItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>[]
          }
          delete: {
            args: Prisma.PedidoItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          update: {
            args: Prisma.PedidoItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          deleteMany: {
            args: Prisma.PedidoItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoItemPayload>
          }
          aggregate: {
            args: Prisma.PedidoItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedidoItem>
          }
          groupBy: {
            args: Prisma.PedidoItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoItemCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoItemCountAggregateOutputType> | number
          }
        }
      }
      FollowUp: {
        payload: Prisma.$FollowUpPayload<ExtArgs>
        fields: Prisma.FollowUpFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FollowUpFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FollowUpFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          findFirst: {
            args: Prisma.FollowUpFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FollowUpFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          findMany: {
            args: Prisma.FollowUpFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>[]
          }
          create: {
            args: Prisma.FollowUpCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          createMany: {
            args: Prisma.FollowUpCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FollowUpCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>[]
          }
          delete: {
            args: Prisma.FollowUpDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          update: {
            args: Prisma.FollowUpUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          deleteMany: {
            args: Prisma.FollowUpDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FollowUpUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FollowUpUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FollowUpPayload>
          }
          aggregate: {
            args: Prisma.FollowUpAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFollowUp>
          }
          groupBy: {
            args: Prisma.FollowUpGroupByArgs<ExtArgs>
            result: $Utils.Optional<FollowUpGroupByOutputType>[]
          }
          count: {
            args: Prisma.FollowUpCountArgs<ExtArgs>
            result: $Utils.Optional<FollowUpCountAggregateOutputType> | number
          }
        }
      }
      Documento: {
        payload: Prisma.$DocumentoPayload<ExtArgs>
        fields: Prisma.DocumentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findFirst: {
            args: Prisma.DocumentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findMany: {
            args: Prisma.DocumentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          create: {
            args: Prisma.DocumentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          createMany: {
            args: Prisma.DocumentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          delete: {
            args: Prisma.DocumentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          update: {
            args: Prisma.DocumentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          deleteMany: {
            args: Prisma.DocumentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          aggregate: {
            args: Prisma.DocumentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumento>
          }
          groupBy: {
            args: Prisma.DocumentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentoCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentoCountAggregateOutputType> | number
          }
        }
      }
      EstimativaCusto: {
        payload: Prisma.$EstimativaCustoPayload<ExtArgs>
        fields: Prisma.EstimativaCustoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EstimativaCustoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EstimativaCustoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          findFirst: {
            args: Prisma.EstimativaCustoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EstimativaCustoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          findMany: {
            args: Prisma.EstimativaCustoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>[]
          }
          create: {
            args: Prisma.EstimativaCustoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          createMany: {
            args: Prisma.EstimativaCustoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EstimativaCustoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>[]
          }
          delete: {
            args: Prisma.EstimativaCustoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          update: {
            args: Prisma.EstimativaCustoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          deleteMany: {
            args: Prisma.EstimativaCustoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EstimativaCustoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EstimativaCustoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EstimativaCustoPayload>
          }
          aggregate: {
            args: Prisma.EstimativaCustoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEstimativaCusto>
          }
          groupBy: {
            args: Prisma.EstimativaCustoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EstimativaCustoGroupByOutputType>[]
          }
          count: {
            args: Prisma.EstimativaCustoCountArgs<ExtArgs>
            result: $Utils.Optional<EstimativaCustoCountAggregateOutputType> | number
          }
        }
      }
      DadosTecnicos: {
        payload: Prisma.$DadosTecnicosPayload<ExtArgs>
        fields: Prisma.DadosTecnicosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DadosTecnicosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DadosTecnicosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          findFirst: {
            args: Prisma.DadosTecnicosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DadosTecnicosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          findMany: {
            args: Prisma.DadosTecnicosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>[]
          }
          create: {
            args: Prisma.DadosTecnicosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          createMany: {
            args: Prisma.DadosTecnicosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DadosTecnicosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>[]
          }
          delete: {
            args: Prisma.DadosTecnicosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          update: {
            args: Prisma.DadosTecnicosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          deleteMany: {
            args: Prisma.DadosTecnicosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DadosTecnicosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DadosTecnicosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DadosTecnicosPayload>
          }
          aggregate: {
            args: Prisma.DadosTecnicosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDadosTecnicos>
          }
          groupBy: {
            args: Prisma.DadosTecnicosGroupByArgs<ExtArgs>
            result: $Utils.Optional<DadosTecnicosGroupByOutputType>[]
          }
          count: {
            args: Prisma.DadosTecnicosCountArgs<ExtArgs>
            result: $Utils.Optional<DadosTecnicosCountAggregateOutputType> | number
          }
        }
      }
      PedidoStatus: {
        payload: Prisma.$PedidoStatusPayload<ExtArgs>
        fields: Prisma.PedidoStatusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoStatusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoStatusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          findFirst: {
            args: Prisma.PedidoStatusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoStatusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          findMany: {
            args: Prisma.PedidoStatusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>[]
          }
          create: {
            args: Prisma.PedidoStatusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          createMany: {
            args: Prisma.PedidoStatusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoStatusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>[]
          }
          delete: {
            args: Prisma.PedidoStatusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          update: {
            args: Prisma.PedidoStatusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          deleteMany: {
            args: Prisma.PedidoStatusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoStatusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoStatusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoStatusPayload>
          }
          aggregate: {
            args: Prisma.PedidoStatusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedidoStatus>
          }
          groupBy: {
            args: Prisma.PedidoStatusGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoStatusGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoStatusCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoStatusCountAggregateOutputType> | number
          }
        }
      }
      PedidoColuna: {
        payload: Prisma.$PedidoColunaPayload<ExtArgs>
        fields: Prisma.PedidoColunaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoColunaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoColunaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          findFirst: {
            args: Prisma.PedidoColunaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoColunaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          findMany: {
            args: Prisma.PedidoColunaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>[]
          }
          create: {
            args: Prisma.PedidoColunaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          createMany: {
            args: Prisma.PedidoColunaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoColunaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>[]
          }
          delete: {
            args: Prisma.PedidoColunaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          update: {
            args: Prisma.PedidoColunaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          deleteMany: {
            args: Prisma.PedidoColunaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoColunaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoColunaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoColunaPayload>
          }
          aggregate: {
            args: Prisma.PedidoColunaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedidoColuna>
          }
          groupBy: {
            args: Prisma.PedidoColunaGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoColunaGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoColunaCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoColunaCountAggregateOutputType> | number
          }
        }
      }
      PedidoPreferenciaUsuario: {
        payload: Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>
        fields: Prisma.PedidoPreferenciaUsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoPreferenciaUsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoPreferenciaUsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          findFirst: {
            args: Prisma.PedidoPreferenciaUsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoPreferenciaUsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          findMany: {
            args: Prisma.PedidoPreferenciaUsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>[]
          }
          create: {
            args: Prisma.PedidoPreferenciaUsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          createMany: {
            args: Prisma.PedidoPreferenciaUsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoPreferenciaUsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>[]
          }
          delete: {
            args: Prisma.PedidoPreferenciaUsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          update: {
            args: Prisma.PedidoPreferenciaUsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          deleteMany: {
            args: Prisma.PedidoPreferenciaUsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoPreferenciaUsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoPreferenciaUsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaUsuarioPayload>
          }
          aggregate: {
            args: Prisma.PedidoPreferenciaUsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedidoPreferenciaUsuario>
          }
          groupBy: {
            args: Prisma.PedidoPreferenciaUsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoPreferenciaUsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoPreferenciaUsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoPreferenciaUsuarioCountAggregateOutputType> | number
          }
        }
      }
      PedidoPreferenciaPadrao: {
        payload: Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>
        fields: Prisma.PedidoPreferenciaPadraoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PedidoPreferenciaPadraoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PedidoPreferenciaPadraoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          findFirst: {
            args: Prisma.PedidoPreferenciaPadraoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PedidoPreferenciaPadraoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          findMany: {
            args: Prisma.PedidoPreferenciaPadraoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>[]
          }
          create: {
            args: Prisma.PedidoPreferenciaPadraoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          createMany: {
            args: Prisma.PedidoPreferenciaPadraoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PedidoPreferenciaPadraoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>[]
          }
          delete: {
            args: Prisma.PedidoPreferenciaPadraoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          update: {
            args: Prisma.PedidoPreferenciaPadraoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          deleteMany: {
            args: Prisma.PedidoPreferenciaPadraoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PedidoPreferenciaPadraoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PedidoPreferenciaPadraoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PedidoPreferenciaPadraoPayload>
          }
          aggregate: {
            args: Prisma.PedidoPreferenciaPadraoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePedidoPreferenciaPadrao>
          }
          groupBy: {
            args: Prisma.PedidoPreferenciaPadraoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PedidoPreferenciaPadraoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PedidoPreferenciaPadraoCountArgs<ExtArgs>
            result: $Utils.Optional<PedidoPreferenciaPadraoCountAggregateOutputType> | number
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
    etapas: number
    pedidos: number
    followUps: number
    documentos: number
  }

  export type ProcessoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etapas?: boolean | ProcessoCountOutputTypeCountEtapasArgs
    pedidos?: boolean | ProcessoCountOutputTypeCountPedidosArgs
    followUps?: boolean | ProcessoCountOutputTypeCountFollowUpsArgs
    documentos?: boolean | ProcessoCountOutputTypeCountDocumentosArgs
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
  export type ProcessoCountOutputTypeCountEtapasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoEtapaWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountPedidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountFollowUpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowUpWhereInput
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
  }


  /**
   * Count Type PedidoCountOutputType
   */

  export type PedidoCountOutputType = {
    itens: number
  }

  export type PedidoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itens?: boolean | PedidoCountOutputTypeCountItensArgs
  }

  // Custom InputTypes
  /**
   * PedidoCountOutputType without action
   */
  export type PedidoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoCountOutputType
     */
    select?: PedidoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PedidoCountOutputType without action
   */
  export type PedidoCountOutputTypeCountItensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoItemWhereInput
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

  export type ProcessoMaxAggregateOutputType = {
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

  export type ProcessoCountAggregateOutputType = {
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


  export type ProcessoMinAggregateInputType = {
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

  export type ProcessoMaxAggregateInputType = {
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

  export type ProcessoCountAggregateInputType = {
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
    etapas?: boolean | Processo$etapasArgs<ExtArgs>
    pedidos?: boolean | Processo$pedidosArgs<ExtArgs>
    followUps?: boolean | Processo$followUpsArgs<ExtArgs>
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    estimativaCusto?: boolean | Processo$estimativaCustoArgs<ExtArgs>
    dadosTecnicos?: boolean | Processo$dadosTecnicosArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectScalar = {
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

  export type ProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etapas?: boolean | Processo$etapasArgs<ExtArgs>
    pedidos?: boolean | Processo$pedidosArgs<ExtArgs>
    followUps?: boolean | Processo$followUpsArgs<ExtArgs>
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    estimativaCusto?: boolean | Processo$estimativaCustoArgs<ExtArgs>
    dadosTecnicos?: boolean | Processo$dadosTecnicosArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Processo"
    objects: {
      etapas: Prisma.$ProcessoEtapaPayload<ExtArgs>[]
      pedidos: Prisma.$PedidoPayload<ExtArgs>[]
      followUps: Prisma.$FollowUpPayload<ExtArgs>[]
      documentos: Prisma.$DocumentoPayload<ExtArgs>[]
      estimativaCusto: Prisma.$EstimativaCustoPayload<ExtArgs> | null
      dadosTecnicos: Prisma.$DadosTecnicosPayload<ExtArgs> | null
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
     * // Only select the `id`
     * const processoWithIdOnly = await prisma.processo.findMany({ select: { id: true } })
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
     * // Create many Processos and only return the `id`
     * const processoWithIdOnly = await prisma.processo.createManyAndReturn({ 
     *   select: { id: true },
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
    etapas<T extends Processo$etapasArgs<ExtArgs> = {}>(args?: Subset<T, Processo$etapasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findMany"> | Null>
    pedidos<T extends Processo$pedidosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$pedidosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findMany"> | Null>
    followUps<T extends Processo$followUpsArgs<ExtArgs> = {}>(args?: Subset<T, Processo$followUpsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findMany"> | Null>
    documentos<T extends Processo$documentosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany"> | Null>
    estimativaCusto<T extends Processo$estimativaCustoArgs<ExtArgs> = {}>(args?: Subset<T, Processo$estimativaCustoArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dadosTecnicos<T extends Processo$dadosTecnicosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$dadosTecnicosArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
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
    readonly id: FieldRef<"Processo", 'String'>
    readonly tenant_id: FieldRef<"Processo", 'String'>
    readonly product_id: FieldRef<"Processo", 'String'>
    readonly user_id: FieldRef<"Processo", 'String'>
    readonly numero: FieldRef<"Processo", 'String'>
    readonly referencia_interna: FieldRef<"Processo", 'String'>
    readonly referencia_dati: FieldRef<"Processo", 'String'>
    readonly status: FieldRef<"Processo", 'String'>
    readonly tipo: FieldRef<"Processo", 'String'>
    readonly responsavel_id: FieldRef<"Processo", 'String'>
    readonly vendedor_id: FieldRef<"Processo", 'String'>
    readonly setor_responsavel: FieldRef<"Processo", 'String'>
    readonly created_at: FieldRef<"Processo", 'DateTime'>
    readonly updated_at: FieldRef<"Processo", 'DateTime'>
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
   * Processo.etapas
   */
  export type Processo$etapasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    where?: ProcessoEtapaWhereInput
    orderBy?: ProcessoEtapaOrderByWithRelationInput | ProcessoEtapaOrderByWithRelationInput[]
    cursor?: ProcessoEtapaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProcessoEtapaScalarFieldEnum | ProcessoEtapaScalarFieldEnum[]
  }

  /**
   * Processo.pedidos
   */
  export type Processo$pedidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    where?: PedidoWhereInput
    orderBy?: PedidoOrderByWithRelationInput | PedidoOrderByWithRelationInput[]
    cursor?: PedidoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PedidoScalarFieldEnum | PedidoScalarFieldEnum[]
  }

  /**
   * Processo.followUps
   */
  export type Processo$followUpsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    where?: FollowUpWhereInput
    orderBy?: FollowUpOrderByWithRelationInput | FollowUpOrderByWithRelationInput[]
    cursor?: FollowUpWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FollowUpScalarFieldEnum | FollowUpScalarFieldEnum[]
  }

  /**
   * Processo.documentos
   */
  export type Processo$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    cursor?: DocumentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Processo.estimativaCusto
   */
  export type Processo$estimativaCustoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    where?: EstimativaCustoWhereInput
  }

  /**
   * Processo.dadosTecnicos
   */
  export type Processo$dadosTecnicosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    where?: DadosTecnicosWhereInput
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
   * Model ProcessoEtapa
   */

  export type AggregateProcessoEtapa = {
    _count: ProcessoEtapaCountAggregateOutputType | null
    _min: ProcessoEtapaMinAggregateOutputType | null
    _max: ProcessoEtapaMaxAggregateOutputType | null
  }

  export type ProcessoEtapaMinAggregateOutputType = {
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

  export type ProcessoEtapaMaxAggregateOutputType = {
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

  export type ProcessoEtapaCountAggregateOutputType = {
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


  export type ProcessoEtapaMinAggregateInputType = {
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

  export type ProcessoEtapaMaxAggregateInputType = {
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

  export type ProcessoEtapaCountAggregateInputType = {
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

  export type ProcessoEtapaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEtapa to aggregate.
     */
    where?: ProcessoEtapaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapaOrderByWithRelationInput | ProcessoEtapaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoEtapaWhereUniqueInput
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
    _count?: true | ProcessoEtapaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoEtapaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoEtapaMaxAggregateInputType
  }

  export type GetProcessoEtapaAggregateType<T extends ProcessoEtapaAggregateArgs> = {
        [P in keyof T & keyof AggregateProcessoEtapa]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcessoEtapa[P]>
      : GetScalarType<T[P], AggregateProcessoEtapa[P]>
  }




  export type ProcessoEtapaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoEtapaWhereInput
    orderBy?: ProcessoEtapaOrderByWithAggregationInput | ProcessoEtapaOrderByWithAggregationInput[]
    by: ProcessoEtapaScalarFieldEnum[] | ProcessoEtapaScalarFieldEnum
    having?: ProcessoEtapaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoEtapaCountAggregateInputType | true
    _min?: ProcessoEtapaMinAggregateInputType
    _max?: ProcessoEtapaMaxAggregateInputType
  }

  export type ProcessoEtapaGroupByOutputType = {
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
    _count: ProcessoEtapaCountAggregateOutputType | null
    _min: ProcessoEtapaMinAggregateOutputType | null
    _max: ProcessoEtapaMaxAggregateOutputType | null
  }

  type GetProcessoEtapaGroupByPayload<T extends ProcessoEtapaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoEtapaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoEtapaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoEtapaGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoEtapaGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoEtapaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEtapa"]>

  export type ProcessoEtapaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processoEtapa"]>

  export type ProcessoEtapaSelectScalar = {
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

  export type ProcessoEtapaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type ProcessoEtapaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $ProcessoEtapaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProcessoEtapa"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
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
    }, ExtArgs["result"]["processoEtapa"]>
    composites: {}
  }

  type ProcessoEtapaGetPayload<S extends boolean | null | undefined | ProcessoEtapaDefaultArgs> = $Result.GetResult<Prisma.$ProcessoEtapaPayload, S>

  type ProcessoEtapaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoEtapaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoEtapaCountAggregateInputType | true
    }

  export interface ProcessoEtapaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProcessoEtapa'], meta: { name: 'ProcessoEtapa' } }
    /**
     * Find zero or one ProcessoEtapa that matches the filter.
     * @param {ProcessoEtapaFindUniqueArgs} args - Arguments to find a ProcessoEtapa
     * @example
     * // Get one ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoEtapaFindUniqueArgs>(args: SelectSubset<T, ProcessoEtapaFindUniqueArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProcessoEtapa that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoEtapaFindUniqueOrThrowArgs} args - Arguments to find a ProcessoEtapa
     * @example
     * // Get one ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoEtapaFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoEtapaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProcessoEtapa that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaFindFirstArgs} args - Arguments to find a ProcessoEtapa
     * @example
     * // Get one ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoEtapaFindFirstArgs>(args?: SelectSubset<T, ProcessoEtapaFindFirstArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProcessoEtapa that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaFindFirstOrThrowArgs} args - Arguments to find a ProcessoEtapa
     * @example
     * // Get one ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoEtapaFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoEtapaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProcessoEtapas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapa.findMany()
     * 
     * // Get first 10 ProcessoEtapas
     * const processoEtapas = await prisma.processoEtapa.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoEtapaWithIdOnly = await prisma.processoEtapa.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoEtapaFindManyArgs>(args?: SelectSubset<T, ProcessoEtapaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProcessoEtapa.
     * @param {ProcessoEtapaCreateArgs} args - Arguments to create a ProcessoEtapa.
     * @example
     * // Create one ProcessoEtapa
     * const ProcessoEtapa = await prisma.processoEtapa.create({
     *   data: {
     *     // ... data to create a ProcessoEtapa
     *   }
     * })
     * 
     */
    create<T extends ProcessoEtapaCreateArgs>(args: SelectSubset<T, ProcessoEtapaCreateArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProcessoEtapas.
     * @param {ProcessoEtapaCreateManyArgs} args - Arguments to create many ProcessoEtapas.
     * @example
     * // Create many ProcessoEtapas
     * const processoEtapa = await prisma.processoEtapa.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoEtapaCreateManyArgs>(args?: SelectSubset<T, ProcessoEtapaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProcessoEtapas and returns the data saved in the database.
     * @param {ProcessoEtapaCreateManyAndReturnArgs} args - Arguments to create many ProcessoEtapas.
     * @example
     * // Create many ProcessoEtapas
     * const processoEtapa = await prisma.processoEtapa.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProcessoEtapas and only return the `id`
     * const processoEtapaWithIdOnly = await prisma.processoEtapa.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoEtapaCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoEtapaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProcessoEtapa.
     * @param {ProcessoEtapaDeleteArgs} args - Arguments to delete one ProcessoEtapa.
     * @example
     * // Delete one ProcessoEtapa
     * const ProcessoEtapa = await prisma.processoEtapa.delete({
     *   where: {
     *     // ... filter to delete one ProcessoEtapa
     *   }
     * })
     * 
     */
    delete<T extends ProcessoEtapaDeleteArgs>(args: SelectSubset<T, ProcessoEtapaDeleteArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProcessoEtapa.
     * @param {ProcessoEtapaUpdateArgs} args - Arguments to update one ProcessoEtapa.
     * @example
     * // Update one ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoEtapaUpdateArgs>(args: SelectSubset<T, ProcessoEtapaUpdateArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProcessoEtapas.
     * @param {ProcessoEtapaDeleteManyArgs} args - Arguments to filter ProcessoEtapas to delete.
     * @example
     * // Delete a few ProcessoEtapas
     * const { count } = await prisma.processoEtapa.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoEtapaDeleteManyArgs>(args?: SelectSubset<T, ProcessoEtapaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProcessoEtapas
     * const processoEtapa = await prisma.processoEtapa.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoEtapaUpdateManyArgs>(args: SelectSubset<T, ProcessoEtapaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProcessoEtapa.
     * @param {ProcessoEtapaUpsertArgs} args - Arguments to update or create a ProcessoEtapa.
     * @example
     * // Update or create a ProcessoEtapa
     * const processoEtapa = await prisma.processoEtapa.upsert({
     *   create: {
     *     // ... data to create a ProcessoEtapa
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProcessoEtapa we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoEtapaUpsertArgs>(args: SelectSubset<T, ProcessoEtapaUpsertArgs<ExtArgs>>): Prisma__ProcessoEtapaClient<$Result.GetResult<Prisma.$ProcessoEtapaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProcessoEtapas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaCountArgs} args - Arguments to filter ProcessoEtapas to count.
     * @example
     * // Count the number of ProcessoEtapas
     * const count = await prisma.processoEtapa.count({
     *   where: {
     *     // ... the filter for the ProcessoEtapas we want to count
     *   }
     * })
    **/
    count<T extends ProcessoEtapaCountArgs>(
      args?: Subset<T, ProcessoEtapaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoEtapaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProcessoEtapa.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProcessoEtapaAggregateArgs>(args: Subset<T, ProcessoEtapaAggregateArgs>): Prisma.PrismaPromise<GetProcessoEtapaAggregateType<T>>

    /**
     * Group by ProcessoEtapa.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoEtapaGroupByArgs} args - Group by arguments.
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
      T extends ProcessoEtapaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoEtapaGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoEtapaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProcessoEtapaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoEtapaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProcessoEtapa model
   */
  readonly fields: ProcessoEtapaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProcessoEtapa.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoEtapaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ProcessoEtapa model
   */ 
  interface ProcessoEtapaFieldRefs {
    readonly id: FieldRef<"ProcessoEtapa", 'String'>
    readonly tenant_id: FieldRef<"ProcessoEtapa", 'String'>
    readonly product_id: FieldRef<"ProcessoEtapa", 'String'>
    readonly user_id: FieldRef<"ProcessoEtapa", 'String'>
    readonly processo_id: FieldRef<"ProcessoEtapa", 'String'>
    readonly nome: FieldRef<"ProcessoEtapa", 'String'>
    readonly status: FieldRef<"ProcessoEtapa", 'String'>
    readonly data_prevista: FieldRef<"ProcessoEtapa", 'DateTime'>
    readonly data_realizada: FieldRef<"ProcessoEtapa", 'DateTime'>
    readonly observacao: FieldRef<"ProcessoEtapa", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ProcessoEtapa findUnique
   */
  export type ProcessoEtapaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapa to fetch.
     */
    where: ProcessoEtapaWhereUniqueInput
  }

  /**
   * ProcessoEtapa findUniqueOrThrow
   */
  export type ProcessoEtapaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapa to fetch.
     */
    where: ProcessoEtapaWhereUniqueInput
  }

  /**
   * ProcessoEtapa findFirst
   */
  export type ProcessoEtapaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapa to fetch.
     */
    where?: ProcessoEtapaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapaOrderByWithRelationInput | ProcessoEtapaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEtapas.
     */
    cursor?: ProcessoEtapaWhereUniqueInput
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
    distinct?: ProcessoEtapaScalarFieldEnum | ProcessoEtapaScalarFieldEnum[]
  }

  /**
   * ProcessoEtapa findFirstOrThrow
   */
  export type ProcessoEtapaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapa to fetch.
     */
    where?: ProcessoEtapaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapaOrderByWithRelationInput | ProcessoEtapaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProcessoEtapas.
     */
    cursor?: ProcessoEtapaWhereUniqueInput
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
    distinct?: ProcessoEtapaScalarFieldEnum | ProcessoEtapaScalarFieldEnum[]
  }

  /**
   * ProcessoEtapa findMany
   */
  export type ProcessoEtapaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter, which ProcessoEtapas to fetch.
     */
    where?: ProcessoEtapaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProcessoEtapas to fetch.
     */
    orderBy?: ProcessoEtapaOrderByWithRelationInput | ProcessoEtapaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProcessoEtapas.
     */
    cursor?: ProcessoEtapaWhereUniqueInput
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
    distinct?: ProcessoEtapaScalarFieldEnum | ProcessoEtapaScalarFieldEnum[]
  }

  /**
   * ProcessoEtapa create
   */
  export type ProcessoEtapaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * The data needed to create a ProcessoEtapa.
     */
    data: XOR<ProcessoEtapaCreateInput, ProcessoEtapaUncheckedCreateInput>
  }

  /**
   * ProcessoEtapa createMany
   */
  export type ProcessoEtapaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProcessoEtapas.
     */
    data: ProcessoEtapaCreateManyInput | ProcessoEtapaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProcessoEtapa createManyAndReturn
   */
  export type ProcessoEtapaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProcessoEtapas.
     */
    data: ProcessoEtapaCreateManyInput | ProcessoEtapaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProcessoEtapa update
   */
  export type ProcessoEtapaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * The data needed to update a ProcessoEtapa.
     */
    data: XOR<ProcessoEtapaUpdateInput, ProcessoEtapaUncheckedUpdateInput>
    /**
     * Choose, which ProcessoEtapa to update.
     */
    where: ProcessoEtapaWhereUniqueInput
  }

  /**
   * ProcessoEtapa updateMany
   */
  export type ProcessoEtapaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProcessoEtapas.
     */
    data: XOR<ProcessoEtapaUpdateManyMutationInput, ProcessoEtapaUncheckedUpdateManyInput>
    /**
     * Filter which ProcessoEtapas to update
     */
    where?: ProcessoEtapaWhereInput
  }

  /**
   * ProcessoEtapa upsert
   */
  export type ProcessoEtapaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * The filter to search for the ProcessoEtapa to update in case it exists.
     */
    where: ProcessoEtapaWhereUniqueInput
    /**
     * In case the ProcessoEtapa found by the `where` argument doesn't exist, create a new ProcessoEtapa with this data.
     */
    create: XOR<ProcessoEtapaCreateInput, ProcessoEtapaUncheckedCreateInput>
    /**
     * In case the ProcessoEtapa was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoEtapaUpdateInput, ProcessoEtapaUncheckedUpdateInput>
  }

  /**
   * ProcessoEtapa delete
   */
  export type ProcessoEtapaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
    /**
     * Filter which ProcessoEtapa to delete.
     */
    where: ProcessoEtapaWhereUniqueInput
  }

  /**
   * ProcessoEtapa deleteMany
   */
  export type ProcessoEtapaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProcessoEtapas to delete
     */
    where?: ProcessoEtapaWhereInput
  }

  /**
   * ProcessoEtapa without action
   */
  export type ProcessoEtapaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoEtapa
     */
    select?: ProcessoEtapaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoEtapaInclude<ExtArgs> | null
  }


  /**
   * Model Pedido
   */

  export type AggregatePedido = {
    _count: PedidoCountAggregateOutputType | null
    _avg: PedidoAvgAggregateOutputType | null
    _sum: PedidoSumAggregateOutputType | null
    _min: PedidoMinAggregateOutputType | null
    _max: PedidoMaxAggregateOutputType | null
  }

  export type PedidoAvgAggregateOutputType = {
    valor_fob: Decimal | null
    peso_bruto: Decimal | null
  }

  export type PedidoSumAggregateOutputType = {
    valor_fob: Decimal | null
    peso_bruto: Decimal | null
  }

  export type PedidoMinAggregateOutputType = {
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

  export type PedidoMaxAggregateOutputType = {
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

  export type PedidoCountAggregateOutputType = {
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


  export type PedidoAvgAggregateInputType = {
    valor_fob?: true
    peso_bruto?: true
  }

  export type PedidoSumAggregateInputType = {
    valor_fob?: true
    peso_bruto?: true
  }

  export type PedidoMinAggregateInputType = {
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

  export type PedidoMaxAggregateInputType = {
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

  export type PedidoCountAggregateInputType = {
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

  export type PedidoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pedido to aggregate.
     */
    where?: PedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pedidos to fetch.
     */
    orderBy?: PedidoOrderByWithRelationInput | PedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pedidos
    **/
    _count?: true | PedidoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PedidoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PedidoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoMaxAggregateInputType
  }

  export type GetPedidoAggregateType<T extends PedidoAggregateArgs> = {
        [P in keyof T & keyof AggregatePedido]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedido[P]>
      : GetScalarType<T[P], AggregatePedido[P]>
  }




  export type PedidoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoWhereInput
    orderBy?: PedidoOrderByWithAggregationInput | PedidoOrderByWithAggregationInput[]
    by: PedidoScalarFieldEnum[] | PedidoScalarFieldEnum
    having?: PedidoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoCountAggregateInputType | true
    _avg?: PedidoAvgAggregateInputType
    _sum?: PedidoSumAggregateInputType
    _min?: PedidoMinAggregateInputType
    _max?: PedidoMaxAggregateInputType
  }

  export type PedidoGroupByOutputType = {
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
    _count: PedidoCountAggregateOutputType | null
    _avg: PedidoAvgAggregateOutputType | null
    _sum: PedidoSumAggregateOutputType | null
    _min: PedidoMinAggregateOutputType | null
    _max: PedidoMaxAggregateOutputType | null
  }

  type GetPedidoGroupByPayload<T extends PedidoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoGroupByOutputType[P]>
        }
      >
    >


  export type PedidoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    itens?: boolean | Pedido$itensArgs<ExtArgs>
    _count?: boolean | PedidoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pedido"]>

  export type PedidoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pedido"]>

  export type PedidoSelectScalar = {
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

  export type PedidoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
    itens?: boolean | Pedido$itensArgs<ExtArgs>
    _count?: boolean | PedidoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PedidoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $PedidoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pedido"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
      itens: Prisma.$PedidoItemPayload<ExtArgs>[]
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
    }, ExtArgs["result"]["pedido"]>
    composites: {}
  }

  type PedidoGetPayload<S extends boolean | null | undefined | PedidoDefaultArgs> = $Result.GetResult<Prisma.$PedidoPayload, S>

  type PedidoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoCountAggregateInputType | true
    }

  export interface PedidoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pedido'], meta: { name: 'Pedido' } }
    /**
     * Find zero or one Pedido that matches the filter.
     * @param {PedidoFindUniqueArgs} args - Arguments to find a Pedido
     * @example
     * // Get one Pedido
     * const pedido = await prisma.pedido.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoFindUniqueArgs>(args: SelectSubset<T, PedidoFindUniqueArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Pedido that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoFindUniqueOrThrowArgs} args - Arguments to find a Pedido
     * @example
     * // Get one Pedido
     * const pedido = await prisma.pedido.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Pedido that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoFindFirstArgs} args - Arguments to find a Pedido
     * @example
     * // Get one Pedido
     * const pedido = await prisma.pedido.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoFindFirstArgs>(args?: SelectSubset<T, PedidoFindFirstArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Pedido that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoFindFirstOrThrowArgs} args - Arguments to find a Pedido
     * @example
     * // Get one Pedido
     * const pedido = await prisma.pedido.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Pedidos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pedidos
     * const pedidos = await prisma.pedido.findMany()
     * 
     * // Get first 10 Pedidos
     * const pedidos = await prisma.pedido.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoWithIdOnly = await prisma.pedido.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoFindManyArgs>(args?: SelectSubset<T, PedidoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Pedido.
     * @param {PedidoCreateArgs} args - Arguments to create a Pedido.
     * @example
     * // Create one Pedido
     * const Pedido = await prisma.pedido.create({
     *   data: {
     *     // ... data to create a Pedido
     *   }
     * })
     * 
     */
    create<T extends PedidoCreateArgs>(args: SelectSubset<T, PedidoCreateArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Pedidos.
     * @param {PedidoCreateManyArgs} args - Arguments to create many Pedidos.
     * @example
     * // Create many Pedidos
     * const pedido = await prisma.pedido.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoCreateManyArgs>(args?: SelectSubset<T, PedidoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pedidos and returns the data saved in the database.
     * @param {PedidoCreateManyAndReturnArgs} args - Arguments to create many Pedidos.
     * @example
     * // Create many Pedidos
     * const pedido = await prisma.pedido.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pedidos and only return the `id`
     * const pedidoWithIdOnly = await prisma.pedido.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Pedido.
     * @param {PedidoDeleteArgs} args - Arguments to delete one Pedido.
     * @example
     * // Delete one Pedido
     * const Pedido = await prisma.pedido.delete({
     *   where: {
     *     // ... filter to delete one Pedido
     *   }
     * })
     * 
     */
    delete<T extends PedidoDeleteArgs>(args: SelectSubset<T, PedidoDeleteArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Pedido.
     * @param {PedidoUpdateArgs} args - Arguments to update one Pedido.
     * @example
     * // Update one Pedido
     * const pedido = await prisma.pedido.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoUpdateArgs>(args: SelectSubset<T, PedidoUpdateArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Pedidos.
     * @param {PedidoDeleteManyArgs} args - Arguments to filter Pedidos to delete.
     * @example
     * // Delete a few Pedidos
     * const { count } = await prisma.pedido.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoDeleteManyArgs>(args?: SelectSubset<T, PedidoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pedidos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pedidos
     * const pedido = await prisma.pedido.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoUpdateManyArgs>(args: SelectSubset<T, PedidoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Pedido.
     * @param {PedidoUpsertArgs} args - Arguments to update or create a Pedido.
     * @example
     * // Update or create a Pedido
     * const pedido = await prisma.pedido.upsert({
     *   create: {
     *     // ... data to create a Pedido
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pedido we want to update
     *   }
     * })
     */
    upsert<T extends PedidoUpsertArgs>(args: SelectSubset<T, PedidoUpsertArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Pedidos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoCountArgs} args - Arguments to filter Pedidos to count.
     * @example
     * // Count the number of Pedidos
     * const count = await prisma.pedido.count({
     *   where: {
     *     // ... the filter for the Pedidos we want to count
     *   }
     * })
    **/
    count<T extends PedidoCountArgs>(
      args?: Subset<T, PedidoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pedido.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoAggregateArgs>(args: Subset<T, PedidoAggregateArgs>): Prisma.PrismaPromise<GetPedidoAggregateType<T>>

    /**
     * Group by Pedido.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoGroupByArgs} args - Group by arguments.
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
      T extends PedidoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoGroupByArgs['orderBy'] }
        : { orderBy?: PedidoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pedido model
   */
  readonly fields: PedidoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pedido.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends ProcessoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProcessoDefaultArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    itens<T extends Pedido$itensArgs<ExtArgs> = {}>(args?: Subset<T, Pedido$itensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Pedido model
   */ 
  interface PedidoFieldRefs {
    readonly id: FieldRef<"Pedido", 'String'>
    readonly tenant_id: FieldRef<"Pedido", 'String'>
    readonly product_id: FieldRef<"Pedido", 'String'>
    readonly user_id: FieldRef<"Pedido", 'String'>
    readonly processo_id: FieldRef<"Pedido", 'String'>
    readonly numero: FieldRef<"Pedido", 'String'>
    readonly exportador_nome: FieldRef<"Pedido", 'String'>
    readonly exportador_pais: FieldRef<"Pedido", 'String'>
    readonly valor_fob: FieldRef<"Pedido", 'Decimal'>
    readonly moeda: FieldRef<"Pedido", 'String'>
    readonly peso_bruto: FieldRef<"Pedido", 'Decimal'>
    readonly status: FieldRef<"Pedido", 'String'>
    readonly status_id: FieldRef<"Pedido", 'String'>
    readonly campos_custom: FieldRef<"Pedido", 'Json'>
    readonly created_at: FieldRef<"Pedido", 'DateTime'>
    readonly updated_at: FieldRef<"Pedido", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pedido findUnique
   */
  export type PedidoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter, which Pedido to fetch.
     */
    where: PedidoWhereUniqueInput
  }

  /**
   * Pedido findUniqueOrThrow
   */
  export type PedidoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter, which Pedido to fetch.
     */
    where: PedidoWhereUniqueInput
  }

  /**
   * Pedido findFirst
   */
  export type PedidoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter, which Pedido to fetch.
     */
    where?: PedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pedidos to fetch.
     */
    orderBy?: PedidoOrderByWithRelationInput | PedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pedidos.
     */
    cursor?: PedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pedidos.
     */
    distinct?: PedidoScalarFieldEnum | PedidoScalarFieldEnum[]
  }

  /**
   * Pedido findFirstOrThrow
   */
  export type PedidoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter, which Pedido to fetch.
     */
    where?: PedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pedidos to fetch.
     */
    orderBy?: PedidoOrderByWithRelationInput | PedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pedidos.
     */
    cursor?: PedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pedidos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pedidos.
     */
    distinct?: PedidoScalarFieldEnum | PedidoScalarFieldEnum[]
  }

  /**
   * Pedido findMany
   */
  export type PedidoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter, which Pedidos to fetch.
     */
    where?: PedidoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pedidos to fetch.
     */
    orderBy?: PedidoOrderByWithRelationInput | PedidoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pedidos.
     */
    cursor?: PedidoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pedidos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pedidos.
     */
    skip?: number
    distinct?: PedidoScalarFieldEnum | PedidoScalarFieldEnum[]
  }

  /**
   * Pedido create
   */
  export type PedidoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * The data needed to create a Pedido.
     */
    data: XOR<PedidoCreateInput, PedidoUncheckedCreateInput>
  }

  /**
   * Pedido createMany
   */
  export type PedidoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pedidos.
     */
    data: PedidoCreateManyInput | PedidoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pedido createManyAndReturn
   */
  export type PedidoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Pedidos.
     */
    data: PedidoCreateManyInput | PedidoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pedido update
   */
  export type PedidoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * The data needed to update a Pedido.
     */
    data: XOR<PedidoUpdateInput, PedidoUncheckedUpdateInput>
    /**
     * Choose, which Pedido to update.
     */
    where: PedidoWhereUniqueInput
  }

  /**
   * Pedido updateMany
   */
  export type PedidoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pedidos.
     */
    data: XOR<PedidoUpdateManyMutationInput, PedidoUncheckedUpdateManyInput>
    /**
     * Filter which Pedidos to update
     */
    where?: PedidoWhereInput
  }

  /**
   * Pedido upsert
   */
  export type PedidoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * The filter to search for the Pedido to update in case it exists.
     */
    where: PedidoWhereUniqueInput
    /**
     * In case the Pedido found by the `where` argument doesn't exist, create a new Pedido with this data.
     */
    create: XOR<PedidoCreateInput, PedidoUncheckedCreateInput>
    /**
     * In case the Pedido was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoUpdateInput, PedidoUncheckedUpdateInput>
  }

  /**
   * Pedido delete
   */
  export type PedidoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
    /**
     * Filter which Pedido to delete.
     */
    where: PedidoWhereUniqueInput
  }

  /**
   * Pedido deleteMany
   */
  export type PedidoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pedidos to delete
     */
    where?: PedidoWhereInput
  }

  /**
   * Pedido.itens
   */
  export type Pedido$itensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    where?: PedidoItemWhereInput
    orderBy?: PedidoItemOrderByWithRelationInput | PedidoItemOrderByWithRelationInput[]
    cursor?: PedidoItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PedidoItemScalarFieldEnum | PedidoItemScalarFieldEnum[]
  }

  /**
   * Pedido without action
   */
  export type PedidoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pedido
     */
    select?: PedidoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoInclude<ExtArgs> | null
  }


  /**
   * Model PedidoItem
   */

  export type AggregatePedidoItem = {
    _count: PedidoItemCountAggregateOutputType | null
    _avg: PedidoItemAvgAggregateOutputType | null
    _sum: PedidoItemSumAggregateOutputType | null
    _min: PedidoItemMinAggregateOutputType | null
    _max: PedidoItemMaxAggregateOutputType | null
  }

  export type PedidoItemAvgAggregateOutputType = {
    quantidade: Decimal | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
  }

  export type PedidoItemSumAggregateOutputType = {
    quantidade: Decimal | null
    valor_unitario: Decimal | null
    valor_total: Decimal | null
  }

  export type PedidoItemMinAggregateOutputType = {
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

  export type PedidoItemMaxAggregateOutputType = {
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

  export type PedidoItemCountAggregateOutputType = {
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


  export type PedidoItemAvgAggregateInputType = {
    quantidade?: true
    valor_unitario?: true
    valor_total?: true
  }

  export type PedidoItemSumAggregateInputType = {
    quantidade?: true
    valor_unitario?: true
    valor_total?: true
  }

  export type PedidoItemMinAggregateInputType = {
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

  export type PedidoItemMaxAggregateInputType = {
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

  export type PedidoItemCountAggregateInputType = {
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

  export type PedidoItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoItem to aggregate.
     */
    where?: PedidoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoItems to fetch.
     */
    orderBy?: PedidoItemOrderByWithRelationInput | PedidoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PedidoItems
    **/
    _count?: true | PedidoItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PedidoItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PedidoItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoItemMaxAggregateInputType
  }

  export type GetPedidoItemAggregateType<T extends PedidoItemAggregateArgs> = {
        [P in keyof T & keyof AggregatePedidoItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedidoItem[P]>
      : GetScalarType<T[P], AggregatePedidoItem[P]>
  }




  export type PedidoItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoItemWhereInput
    orderBy?: PedidoItemOrderByWithAggregationInput | PedidoItemOrderByWithAggregationInput[]
    by: PedidoItemScalarFieldEnum[] | PedidoItemScalarFieldEnum
    having?: PedidoItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoItemCountAggregateInputType | true
    _avg?: PedidoItemAvgAggregateInputType
    _sum?: PedidoItemSumAggregateInputType
    _min?: PedidoItemMinAggregateInputType
    _max?: PedidoItemMaxAggregateInputType
  }

  export type PedidoItemGroupByOutputType = {
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
    _count: PedidoItemCountAggregateOutputType | null
    _avg: PedidoItemAvgAggregateOutputType | null
    _sum: PedidoItemSumAggregateOutputType | null
    _min: PedidoItemMinAggregateOutputType | null
    _max: PedidoItemMaxAggregateOutputType | null
  }

  type GetPedidoItemGroupByPayload<T extends PedidoItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoItemGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoItemGroupByOutputType[P]>
        }
      >
    >


  export type PedidoItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    pedido?: boolean | PedidoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pedidoItem"]>

  export type PedidoItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    pedido?: boolean | PedidoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pedidoItem"]>

  export type PedidoItemSelectScalar = {
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

  export type PedidoItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pedido?: boolean | PedidoDefaultArgs<ExtArgs>
  }
  export type PedidoItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pedido?: boolean | PedidoDefaultArgs<ExtArgs>
  }

  export type $PedidoItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PedidoItem"
    objects: {
      pedido: Prisma.$PedidoPayload<ExtArgs>
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
    }, ExtArgs["result"]["pedidoItem"]>
    composites: {}
  }

  type PedidoItemGetPayload<S extends boolean | null | undefined | PedidoItemDefaultArgs> = $Result.GetResult<Prisma.$PedidoItemPayload, S>

  type PedidoItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoItemCountAggregateInputType | true
    }

  export interface PedidoItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PedidoItem'], meta: { name: 'PedidoItem' } }
    /**
     * Find zero or one PedidoItem that matches the filter.
     * @param {PedidoItemFindUniqueArgs} args - Arguments to find a PedidoItem
     * @example
     * // Get one PedidoItem
     * const pedidoItem = await prisma.pedidoItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoItemFindUniqueArgs>(args: SelectSubset<T, PedidoItemFindUniqueArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PedidoItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoItemFindUniqueOrThrowArgs} args - Arguments to find a PedidoItem
     * @example
     * // Get one PedidoItem
     * const pedidoItem = await prisma.pedidoItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoItemFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PedidoItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemFindFirstArgs} args - Arguments to find a PedidoItem
     * @example
     * // Get one PedidoItem
     * const pedidoItem = await prisma.pedidoItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoItemFindFirstArgs>(args?: SelectSubset<T, PedidoItemFindFirstArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PedidoItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemFindFirstOrThrowArgs} args - Arguments to find a PedidoItem
     * @example
     * // Get one PedidoItem
     * const pedidoItem = await prisma.pedidoItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoItemFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PedidoItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PedidoItems
     * const pedidoItems = await prisma.pedidoItem.findMany()
     * 
     * // Get first 10 PedidoItems
     * const pedidoItems = await prisma.pedidoItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoItemWithIdOnly = await prisma.pedidoItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoItemFindManyArgs>(args?: SelectSubset<T, PedidoItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PedidoItem.
     * @param {PedidoItemCreateArgs} args - Arguments to create a PedidoItem.
     * @example
     * // Create one PedidoItem
     * const PedidoItem = await prisma.pedidoItem.create({
     *   data: {
     *     // ... data to create a PedidoItem
     *   }
     * })
     * 
     */
    create<T extends PedidoItemCreateArgs>(args: SelectSubset<T, PedidoItemCreateArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PedidoItems.
     * @param {PedidoItemCreateManyArgs} args - Arguments to create many PedidoItems.
     * @example
     * // Create many PedidoItems
     * const pedidoItem = await prisma.pedidoItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoItemCreateManyArgs>(args?: SelectSubset<T, PedidoItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PedidoItems and returns the data saved in the database.
     * @param {PedidoItemCreateManyAndReturnArgs} args - Arguments to create many PedidoItems.
     * @example
     * // Create many PedidoItems
     * const pedidoItem = await prisma.pedidoItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PedidoItems and only return the `id`
     * const pedidoItemWithIdOnly = await prisma.pedidoItem.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoItemCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PedidoItem.
     * @param {PedidoItemDeleteArgs} args - Arguments to delete one PedidoItem.
     * @example
     * // Delete one PedidoItem
     * const PedidoItem = await prisma.pedidoItem.delete({
     *   where: {
     *     // ... filter to delete one PedidoItem
     *   }
     * })
     * 
     */
    delete<T extends PedidoItemDeleteArgs>(args: SelectSubset<T, PedidoItemDeleteArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PedidoItem.
     * @param {PedidoItemUpdateArgs} args - Arguments to update one PedidoItem.
     * @example
     * // Update one PedidoItem
     * const pedidoItem = await prisma.pedidoItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoItemUpdateArgs>(args: SelectSubset<T, PedidoItemUpdateArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PedidoItems.
     * @param {PedidoItemDeleteManyArgs} args - Arguments to filter PedidoItems to delete.
     * @example
     * // Delete a few PedidoItems
     * const { count } = await prisma.pedidoItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoItemDeleteManyArgs>(args?: SelectSubset<T, PedidoItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PedidoItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PedidoItems
     * const pedidoItem = await prisma.pedidoItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoItemUpdateManyArgs>(args: SelectSubset<T, PedidoItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PedidoItem.
     * @param {PedidoItemUpsertArgs} args - Arguments to update or create a PedidoItem.
     * @example
     * // Update or create a PedidoItem
     * const pedidoItem = await prisma.pedidoItem.upsert({
     *   create: {
     *     // ... data to create a PedidoItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PedidoItem we want to update
     *   }
     * })
     */
    upsert<T extends PedidoItemUpsertArgs>(args: SelectSubset<T, PedidoItemUpsertArgs<ExtArgs>>): Prisma__PedidoItemClient<$Result.GetResult<Prisma.$PedidoItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PedidoItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemCountArgs} args - Arguments to filter PedidoItems to count.
     * @example
     * // Count the number of PedidoItems
     * const count = await prisma.pedidoItem.count({
     *   where: {
     *     // ... the filter for the PedidoItems we want to count
     *   }
     * })
    **/
    count<T extends PedidoItemCountArgs>(
      args?: Subset<T, PedidoItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PedidoItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoItemAggregateArgs>(args: Subset<T, PedidoItemAggregateArgs>): Prisma.PrismaPromise<GetPedidoItemAggregateType<T>>

    /**
     * Group by PedidoItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoItemGroupByArgs} args - Group by arguments.
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
      T extends PedidoItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoItemGroupByArgs['orderBy'] }
        : { orderBy?: PedidoItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PedidoItem model
   */
  readonly fields: PedidoItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PedidoItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pedido<T extends PedidoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PedidoDefaultArgs<ExtArgs>>): Prisma__PedidoClient<$Result.GetResult<Prisma.$PedidoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the PedidoItem model
   */ 
  interface PedidoItemFieldRefs {
    readonly id: FieldRef<"PedidoItem", 'String'>
    readonly tenant_id: FieldRef<"PedidoItem", 'String'>
    readonly product_id: FieldRef<"PedidoItem", 'String'>
    readonly user_id: FieldRef<"PedidoItem", 'String'>
    readonly pedido_id: FieldRef<"PedidoItem", 'String'>
    readonly numero_item: FieldRef<"PedidoItem", 'String'>
    readonly descricao: FieldRef<"PedidoItem", 'String'>
    readonly ncm: FieldRef<"PedidoItem", 'String'>
    readonly quantidade: FieldRef<"PedidoItem", 'Decimal'>
    readonly unidade: FieldRef<"PedidoItem", 'String'>
    readonly valor_unitario: FieldRef<"PedidoItem", 'Decimal'>
    readonly valor_total: FieldRef<"PedidoItem", 'Decimal'>
    readonly moeda: FieldRef<"PedidoItem", 'String'>
    readonly status_li: FieldRef<"PedidoItem", 'String'>
    readonly campos_custom: FieldRef<"PedidoItem", 'Json'>
    readonly created_at: FieldRef<"PedidoItem", 'DateTime'>
    readonly updated_at: FieldRef<"PedidoItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PedidoItem findUnique
   */
  export type PedidoItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter, which PedidoItem to fetch.
     */
    where: PedidoItemWhereUniqueInput
  }

  /**
   * PedidoItem findUniqueOrThrow
   */
  export type PedidoItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter, which PedidoItem to fetch.
     */
    where: PedidoItemWhereUniqueInput
  }

  /**
   * PedidoItem findFirst
   */
  export type PedidoItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter, which PedidoItem to fetch.
     */
    where?: PedidoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoItems to fetch.
     */
    orderBy?: PedidoItemOrderByWithRelationInput | PedidoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoItems.
     */
    cursor?: PedidoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoItems.
     */
    distinct?: PedidoItemScalarFieldEnum | PedidoItemScalarFieldEnum[]
  }

  /**
   * PedidoItem findFirstOrThrow
   */
  export type PedidoItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter, which PedidoItem to fetch.
     */
    where?: PedidoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoItems to fetch.
     */
    orderBy?: PedidoItemOrderByWithRelationInput | PedidoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoItems.
     */
    cursor?: PedidoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoItems.
     */
    distinct?: PedidoItemScalarFieldEnum | PedidoItemScalarFieldEnum[]
  }

  /**
   * PedidoItem findMany
   */
  export type PedidoItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter, which PedidoItems to fetch.
     */
    where?: PedidoItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoItems to fetch.
     */
    orderBy?: PedidoItemOrderByWithRelationInput | PedidoItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PedidoItems.
     */
    cursor?: PedidoItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoItems.
     */
    skip?: number
    distinct?: PedidoItemScalarFieldEnum | PedidoItemScalarFieldEnum[]
  }

  /**
   * PedidoItem create
   */
  export type PedidoItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * The data needed to create a PedidoItem.
     */
    data: XOR<PedidoItemCreateInput, PedidoItemUncheckedCreateInput>
  }

  /**
   * PedidoItem createMany
   */
  export type PedidoItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PedidoItems.
     */
    data: PedidoItemCreateManyInput | PedidoItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoItem createManyAndReturn
   */
  export type PedidoItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PedidoItems.
     */
    data: PedidoItemCreateManyInput | PedidoItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PedidoItem update
   */
  export type PedidoItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * The data needed to update a PedidoItem.
     */
    data: XOR<PedidoItemUpdateInput, PedidoItemUncheckedUpdateInput>
    /**
     * Choose, which PedidoItem to update.
     */
    where: PedidoItemWhereUniqueInput
  }

  /**
   * PedidoItem updateMany
   */
  export type PedidoItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PedidoItems.
     */
    data: XOR<PedidoItemUpdateManyMutationInput, PedidoItemUncheckedUpdateManyInput>
    /**
     * Filter which PedidoItems to update
     */
    where?: PedidoItemWhereInput
  }

  /**
   * PedidoItem upsert
   */
  export type PedidoItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * The filter to search for the PedidoItem to update in case it exists.
     */
    where: PedidoItemWhereUniqueInput
    /**
     * In case the PedidoItem found by the `where` argument doesn't exist, create a new PedidoItem with this data.
     */
    create: XOR<PedidoItemCreateInput, PedidoItemUncheckedCreateInput>
    /**
     * In case the PedidoItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoItemUpdateInput, PedidoItemUncheckedUpdateInput>
  }

  /**
   * PedidoItem delete
   */
  export type PedidoItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
    /**
     * Filter which PedidoItem to delete.
     */
    where: PedidoItemWhereUniqueInput
  }

  /**
   * PedidoItem deleteMany
   */
  export type PedidoItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoItems to delete
     */
    where?: PedidoItemWhereInput
  }

  /**
   * PedidoItem without action
   */
  export type PedidoItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoItem
     */
    select?: PedidoItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PedidoItemInclude<ExtArgs> | null
  }


  /**
   * Model FollowUp
   */

  export type AggregateFollowUp = {
    _count: FollowUpCountAggregateOutputType | null
    _min: FollowUpMinAggregateOutputType | null
    _max: FollowUpMaxAggregateOutputType | null
  }

  export type FollowUpMinAggregateOutputType = {
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

  export type FollowUpMaxAggregateOutputType = {
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

  export type FollowUpCountAggregateOutputType = {
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


  export type FollowUpMinAggregateInputType = {
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

  export type FollowUpMaxAggregateInputType = {
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

  export type FollowUpCountAggregateInputType = {
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

  export type FollowUpAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowUp to aggregate.
     */
    where?: FollowUpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUps to fetch.
     */
    orderBy?: FollowUpOrderByWithRelationInput | FollowUpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FollowUpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FollowUps
    **/
    _count?: true | FollowUpCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FollowUpMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FollowUpMaxAggregateInputType
  }

  export type GetFollowUpAggregateType<T extends FollowUpAggregateArgs> = {
        [P in keyof T & keyof AggregateFollowUp]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFollowUp[P]>
      : GetScalarType<T[P], AggregateFollowUp[P]>
  }




  export type FollowUpGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FollowUpWhereInput
    orderBy?: FollowUpOrderByWithAggregationInput | FollowUpOrderByWithAggregationInput[]
    by: FollowUpScalarFieldEnum[] | FollowUpScalarFieldEnum
    having?: FollowUpScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FollowUpCountAggregateInputType | true
    _min?: FollowUpMinAggregateInputType
    _max?: FollowUpMaxAggregateInputType
  }

  export type FollowUpGroupByOutputType = {
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
    _count: FollowUpCountAggregateOutputType | null
    _min: FollowUpMinAggregateOutputType | null
    _max: FollowUpMaxAggregateOutputType | null
  }

  type GetFollowUpGroupByPayload<T extends FollowUpGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FollowUpGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FollowUpGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FollowUpGroupByOutputType[P]>
            : GetScalarType<T[P], FollowUpGroupByOutputType[P]>
        }
      >
    >


  export type FollowUpSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followUp"]>

  export type FollowUpSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["followUp"]>

  export type FollowUpSelectScalar = {
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

  export type FollowUpInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type FollowUpIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $FollowUpPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FollowUp"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
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
    }, ExtArgs["result"]["followUp"]>
    composites: {}
  }

  type FollowUpGetPayload<S extends boolean | null | undefined | FollowUpDefaultArgs> = $Result.GetResult<Prisma.$FollowUpPayload, S>

  type FollowUpCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FollowUpFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FollowUpCountAggregateInputType | true
    }

  export interface FollowUpDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FollowUp'], meta: { name: 'FollowUp' } }
    /**
     * Find zero or one FollowUp that matches the filter.
     * @param {FollowUpFindUniqueArgs} args - Arguments to find a FollowUp
     * @example
     * // Get one FollowUp
     * const followUp = await prisma.followUp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FollowUpFindUniqueArgs>(args: SelectSubset<T, FollowUpFindUniqueArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FollowUp that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FollowUpFindUniqueOrThrowArgs} args - Arguments to find a FollowUp
     * @example
     * // Get one FollowUp
     * const followUp = await prisma.followUp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FollowUpFindUniqueOrThrowArgs>(args: SelectSubset<T, FollowUpFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FollowUp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpFindFirstArgs} args - Arguments to find a FollowUp
     * @example
     * // Get one FollowUp
     * const followUp = await prisma.followUp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FollowUpFindFirstArgs>(args?: SelectSubset<T, FollowUpFindFirstArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FollowUp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpFindFirstOrThrowArgs} args - Arguments to find a FollowUp
     * @example
     * // Get one FollowUp
     * const followUp = await prisma.followUp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FollowUpFindFirstOrThrowArgs>(args?: SelectSubset<T, FollowUpFindFirstOrThrowArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FollowUps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FollowUps
     * const followUps = await prisma.followUp.findMany()
     * 
     * // Get first 10 FollowUps
     * const followUps = await prisma.followUp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const followUpWithIdOnly = await prisma.followUp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FollowUpFindManyArgs>(args?: SelectSubset<T, FollowUpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FollowUp.
     * @param {FollowUpCreateArgs} args - Arguments to create a FollowUp.
     * @example
     * // Create one FollowUp
     * const FollowUp = await prisma.followUp.create({
     *   data: {
     *     // ... data to create a FollowUp
     *   }
     * })
     * 
     */
    create<T extends FollowUpCreateArgs>(args: SelectSubset<T, FollowUpCreateArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FollowUps.
     * @param {FollowUpCreateManyArgs} args - Arguments to create many FollowUps.
     * @example
     * // Create many FollowUps
     * const followUp = await prisma.followUp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FollowUpCreateManyArgs>(args?: SelectSubset<T, FollowUpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FollowUps and returns the data saved in the database.
     * @param {FollowUpCreateManyAndReturnArgs} args - Arguments to create many FollowUps.
     * @example
     * // Create many FollowUps
     * const followUp = await prisma.followUp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FollowUps and only return the `id`
     * const followUpWithIdOnly = await prisma.followUp.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FollowUpCreateManyAndReturnArgs>(args?: SelectSubset<T, FollowUpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FollowUp.
     * @param {FollowUpDeleteArgs} args - Arguments to delete one FollowUp.
     * @example
     * // Delete one FollowUp
     * const FollowUp = await prisma.followUp.delete({
     *   where: {
     *     // ... filter to delete one FollowUp
     *   }
     * })
     * 
     */
    delete<T extends FollowUpDeleteArgs>(args: SelectSubset<T, FollowUpDeleteArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FollowUp.
     * @param {FollowUpUpdateArgs} args - Arguments to update one FollowUp.
     * @example
     * // Update one FollowUp
     * const followUp = await prisma.followUp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FollowUpUpdateArgs>(args: SelectSubset<T, FollowUpUpdateArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FollowUps.
     * @param {FollowUpDeleteManyArgs} args - Arguments to filter FollowUps to delete.
     * @example
     * // Delete a few FollowUps
     * const { count } = await prisma.followUp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FollowUpDeleteManyArgs>(args?: SelectSubset<T, FollowUpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FollowUps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FollowUps
     * const followUp = await prisma.followUp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FollowUpUpdateManyArgs>(args: SelectSubset<T, FollowUpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FollowUp.
     * @param {FollowUpUpsertArgs} args - Arguments to update or create a FollowUp.
     * @example
     * // Update or create a FollowUp
     * const followUp = await prisma.followUp.upsert({
     *   create: {
     *     // ... data to create a FollowUp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FollowUp we want to update
     *   }
     * })
     */
    upsert<T extends FollowUpUpsertArgs>(args: SelectSubset<T, FollowUpUpsertArgs<ExtArgs>>): Prisma__FollowUpClient<$Result.GetResult<Prisma.$FollowUpPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FollowUps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpCountArgs} args - Arguments to filter FollowUps to count.
     * @example
     * // Count the number of FollowUps
     * const count = await prisma.followUp.count({
     *   where: {
     *     // ... the filter for the FollowUps we want to count
     *   }
     * })
    **/
    count<T extends FollowUpCountArgs>(
      args?: Subset<T, FollowUpCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FollowUpCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FollowUp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FollowUpAggregateArgs>(args: Subset<T, FollowUpAggregateArgs>): Prisma.PrismaPromise<GetFollowUpAggregateType<T>>

    /**
     * Group by FollowUp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FollowUpGroupByArgs} args - Group by arguments.
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
      T extends FollowUpGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FollowUpGroupByArgs['orderBy'] }
        : { orderBy?: FollowUpGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FollowUpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFollowUpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FollowUp model
   */
  readonly fields: FollowUpFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FollowUp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FollowUpClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FollowUp model
   */ 
  interface FollowUpFieldRefs {
    readonly id: FieldRef<"FollowUp", 'String'>
    readonly tenant_id: FieldRef<"FollowUp", 'String'>
    readonly product_id: FieldRef<"FollowUp", 'String'>
    readonly user_id: FieldRef<"FollowUp", 'String'>
    readonly processo_id: FieldRef<"FollowUp", 'String'>
    readonly titulo: FieldRef<"FollowUp", 'String'>
    readonly descricao: FieldRef<"FollowUp", 'String'>
    readonly tipo: FieldRef<"FollowUp", 'String'>
    readonly categoria: FieldRef<"FollowUp", 'String'>
    readonly usuario_id: FieldRef<"FollowUp", 'String'>
    readonly usuario_nome: FieldRef<"FollowUp", 'String'>
    readonly created_at: FieldRef<"FollowUp", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FollowUp findUnique
   */
  export type FollowUpFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter, which FollowUp to fetch.
     */
    where: FollowUpWhereUniqueInput
  }

  /**
   * FollowUp findUniqueOrThrow
   */
  export type FollowUpFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter, which FollowUp to fetch.
     */
    where: FollowUpWhereUniqueInput
  }

  /**
   * FollowUp findFirst
   */
  export type FollowUpFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter, which FollowUp to fetch.
     */
    where?: FollowUpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUps to fetch.
     */
    orderBy?: FollowUpOrderByWithRelationInput | FollowUpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowUps.
     */
    cursor?: FollowUpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowUps.
     */
    distinct?: FollowUpScalarFieldEnum | FollowUpScalarFieldEnum[]
  }

  /**
   * FollowUp findFirstOrThrow
   */
  export type FollowUpFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter, which FollowUp to fetch.
     */
    where?: FollowUpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUps to fetch.
     */
    orderBy?: FollowUpOrderByWithRelationInput | FollowUpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FollowUps.
     */
    cursor?: FollowUpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FollowUps.
     */
    distinct?: FollowUpScalarFieldEnum | FollowUpScalarFieldEnum[]
  }

  /**
   * FollowUp findMany
   */
  export type FollowUpFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter, which FollowUps to fetch.
     */
    where?: FollowUpWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FollowUps to fetch.
     */
    orderBy?: FollowUpOrderByWithRelationInput | FollowUpOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FollowUps.
     */
    cursor?: FollowUpWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FollowUps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FollowUps.
     */
    skip?: number
    distinct?: FollowUpScalarFieldEnum | FollowUpScalarFieldEnum[]
  }

  /**
   * FollowUp create
   */
  export type FollowUpCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * The data needed to create a FollowUp.
     */
    data: XOR<FollowUpCreateInput, FollowUpUncheckedCreateInput>
  }

  /**
   * FollowUp createMany
   */
  export type FollowUpCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FollowUps.
     */
    data: FollowUpCreateManyInput | FollowUpCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FollowUp createManyAndReturn
   */
  export type FollowUpCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FollowUps.
     */
    data: FollowUpCreateManyInput | FollowUpCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FollowUp update
   */
  export type FollowUpUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * The data needed to update a FollowUp.
     */
    data: XOR<FollowUpUpdateInput, FollowUpUncheckedUpdateInput>
    /**
     * Choose, which FollowUp to update.
     */
    where: FollowUpWhereUniqueInput
  }

  /**
   * FollowUp updateMany
   */
  export type FollowUpUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FollowUps.
     */
    data: XOR<FollowUpUpdateManyMutationInput, FollowUpUncheckedUpdateManyInput>
    /**
     * Filter which FollowUps to update
     */
    where?: FollowUpWhereInput
  }

  /**
   * FollowUp upsert
   */
  export type FollowUpUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * The filter to search for the FollowUp to update in case it exists.
     */
    where: FollowUpWhereUniqueInput
    /**
     * In case the FollowUp found by the `where` argument doesn't exist, create a new FollowUp with this data.
     */
    create: XOR<FollowUpCreateInput, FollowUpUncheckedCreateInput>
    /**
     * In case the FollowUp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FollowUpUpdateInput, FollowUpUncheckedUpdateInput>
  }

  /**
   * FollowUp delete
   */
  export type FollowUpDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
    /**
     * Filter which FollowUp to delete.
     */
    where: FollowUpWhereUniqueInput
  }

  /**
   * FollowUp deleteMany
   */
  export type FollowUpDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FollowUps to delete
     */
    where?: FollowUpWhereInput
  }

  /**
   * FollowUp without action
   */
  export type FollowUpDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FollowUp
     */
    select?: FollowUpSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FollowUpInclude<ExtArgs> | null
  }


  /**
   * Model Documento
   */

  export type AggregateDocumento = {
    _count: DocumentoCountAggregateOutputType | null
    _avg: DocumentoAvgAggregateOutputType | null
    _sum: DocumentoSumAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  export type DocumentoAvgAggregateOutputType = {
    tamanho_bytes: number | null
  }

  export type DocumentoSumAggregateOutputType = {
    tamanho_bytes: number | null
  }

  export type DocumentoMinAggregateOutputType = {
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

  export type DocumentoMaxAggregateOutputType = {
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

  export type DocumentoCountAggregateOutputType = {
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


  export type DocumentoAvgAggregateInputType = {
    tamanho_bytes?: true
  }

  export type DocumentoSumAggregateInputType = {
    tamanho_bytes?: true
  }

  export type DocumentoMinAggregateInputType = {
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

  export type DocumentoMaxAggregateInputType = {
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

  export type DocumentoCountAggregateInputType = {
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

  export type DocumentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documento to aggregate.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Documentos
    **/
    _count?: true | DocumentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentoMaxAggregateInputType
  }

  export type GetDocumentoAggregateType<T extends DocumentoAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumento[P]>
      : GetScalarType<T[P], AggregateDocumento[P]>
  }




  export type DocumentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithAggregationInput | DocumentoOrderByWithAggregationInput[]
    by: DocumentoScalarFieldEnum[] | DocumentoScalarFieldEnum
    having?: DocumentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentoCountAggregateInputType | true
    _avg?: DocumentoAvgAggregateInputType
    _sum?: DocumentoSumAggregateInputType
    _min?: DocumentoMinAggregateInputType
    _max?: DocumentoMaxAggregateInputType
  }

  export type DocumentoGroupByOutputType = {
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
    _count: DocumentoCountAggregateOutputType | null
    _avg: DocumentoAvgAggregateOutputType | null
    _sum: DocumentoSumAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  type GetDocumentoGroupByPayload<T extends DocumentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
        }
      >
    >


  export type DocumentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectScalar = {
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

  export type DocumentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type DocumentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $DocumentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Documento"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
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
    }, ExtArgs["result"]["documento"]>
    composites: {}
  }

  type DocumentoGetPayload<S extends boolean | null | undefined | DocumentoDefaultArgs> = $Result.GetResult<Prisma.$DocumentoPayload, S>

  type DocumentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DocumentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DocumentoCountAggregateInputType | true
    }

  export interface DocumentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Documento'], meta: { name: 'Documento' } }
    /**
     * Find zero or one Documento that matches the filter.
     * @param {DocumentoFindUniqueArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentoFindUniqueArgs>(args: SelectSubset<T, DocumentoFindUniqueArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Documento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DocumentoFindUniqueOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentoFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Documento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentoFindFirstArgs>(args?: SelectSubset<T, DocumentoFindFirstArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Documento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentoFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Documentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Documentos
     * const documentos = await prisma.documento.findMany()
     * 
     * // Get first 10 Documentos
     * const documentos = await prisma.documento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentoWithIdOnly = await prisma.documento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentoFindManyArgs>(args?: SelectSubset<T, DocumentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Documento.
     * @param {DocumentoCreateArgs} args - Arguments to create a Documento.
     * @example
     * // Create one Documento
     * const Documento = await prisma.documento.create({
     *   data: {
     *     // ... data to create a Documento
     *   }
     * })
     * 
     */
    create<T extends DocumentoCreateArgs>(args: SelectSubset<T, DocumentoCreateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Documentos.
     * @param {DocumentoCreateManyArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentoCreateManyArgs>(args?: SelectSubset<T, DocumentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Documentos and returns the data saved in the database.
     * @param {DocumentoCreateManyAndReturnArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Documentos and only return the `id`
     * const documentoWithIdOnly = await prisma.documento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentoCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Documento.
     * @param {DocumentoDeleteArgs} args - Arguments to delete one Documento.
     * @example
     * // Delete one Documento
     * const Documento = await prisma.documento.delete({
     *   where: {
     *     // ... filter to delete one Documento
     *   }
     * })
     * 
     */
    delete<T extends DocumentoDeleteArgs>(args: SelectSubset<T, DocumentoDeleteArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Documento.
     * @param {DocumentoUpdateArgs} args - Arguments to update one Documento.
     * @example
     * // Update one Documento
     * const documento = await prisma.documento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentoUpdateArgs>(args: SelectSubset<T, DocumentoUpdateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Documentos.
     * @param {DocumentoDeleteManyArgs} args - Arguments to filter Documentos to delete.
     * @example
     * // Delete a few Documentos
     * const { count } = await prisma.documento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentoDeleteManyArgs>(args?: SelectSubset<T, DocumentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Documentos
     * const documento = await prisma.documento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentoUpdateManyArgs>(args: SelectSubset<T, DocumentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Documento.
     * @param {DocumentoUpsertArgs} args - Arguments to update or create a Documento.
     * @example
     * // Update or create a Documento
     * const documento = await prisma.documento.upsert({
     *   create: {
     *     // ... data to create a Documento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Documento we want to update
     *   }
     * })
     */
    upsert<T extends DocumentoUpsertArgs>(args: SelectSubset<T, DocumentoUpsertArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoCountArgs} args - Arguments to filter Documentos to count.
     * @example
     * // Count the number of Documentos
     * const count = await prisma.documento.count({
     *   where: {
     *     // ... the filter for the Documentos we want to count
     *   }
     * })
    **/
    count<T extends DocumentoCountArgs>(
      args?: Subset<T, DocumentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DocumentoAggregateArgs>(args: Subset<T, DocumentoAggregateArgs>): Prisma.PrismaPromise<GetDocumentoAggregateType<T>>

    /**
     * Group by Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoGroupByArgs} args - Group by arguments.
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
      T extends DocumentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentoGroupByArgs['orderBy'] }
        : { orderBy?: DocumentoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DocumentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Documento model
   */
  readonly fields: DocumentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Documento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Documento model
   */ 
  interface DocumentoFieldRefs {
    readonly id: FieldRef<"Documento", 'String'>
    readonly tenant_id: FieldRef<"Documento", 'String'>
    readonly product_id: FieldRef<"Documento", 'String'>
    readonly user_id: FieldRef<"Documento", 'String'>
    readonly processo_id: FieldRef<"Documento", 'String'>
    readonly nome: FieldRef<"Documento", 'String'>
    readonly tipo_arquivo: FieldRef<"Documento", 'String'>
    readonly tamanho_bytes: FieldRef<"Documento", 'Int'>
    readonly url: FieldRef<"Documento", 'String'>
    readonly categoria: FieldRef<"Documento", 'String'>
    readonly created_at: FieldRef<"Documento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Documento findUnique
   */
  export type DocumentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findUniqueOrThrow
   */
  export type DocumentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findFirst
   */
  export type DocumentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findFirstOrThrow
   */
  export type DocumentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findMany
   */
  export type DocumentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documentos to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento create
   */
  export type DocumentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Documento.
     */
    data: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
  }

  /**
   * Documento createMany
   */
  export type DocumentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Documento createManyAndReturn
   */
  export type DocumentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Documento update
   */
  export type DocumentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Documento.
     */
    data: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
    /**
     * Choose, which Documento to update.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento updateMany
   */
  export type DocumentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Documentos.
     */
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyInput>
    /**
     * Filter which Documentos to update
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento upsert
   */
  export type DocumentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Documento to update in case it exists.
     */
    where: DocumentoWhereUniqueInput
    /**
     * In case the Documento found by the `where` argument doesn't exist, create a new Documento with this data.
     */
    create: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
    /**
     * In case the Documento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
  }

  /**
   * Documento delete
   */
  export type DocumentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter which Documento to delete.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento deleteMany
   */
  export type DocumentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documentos to delete
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento without action
   */
  export type DocumentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
  }


  /**
   * Model EstimativaCusto
   */

  export type AggregateEstimativaCusto = {
    _count: EstimativaCustoCountAggregateOutputType | null
    _avg: EstimativaCustoAvgAggregateOutputType | null
    _sum: EstimativaCustoSumAggregateOutputType | null
    _min: EstimativaCustoMinAggregateOutputType | null
    _max: EstimativaCustoMaxAggregateOutputType | null
  }

  export type EstimativaCustoAvgAggregateOutputType = {
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
  }

  export type EstimativaCustoSumAggregateOutputType = {
    impostos: number | null
    frete: number | null
    despacho: number | null
    outros: number | null
    total: number | null
  }

  export type EstimativaCustoMinAggregateOutputType = {
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

  export type EstimativaCustoMaxAggregateOutputType = {
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

  export type EstimativaCustoCountAggregateOutputType = {
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


  export type EstimativaCustoAvgAggregateInputType = {
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
  }

  export type EstimativaCustoSumAggregateInputType = {
    impostos?: true
    frete?: true
    despacho?: true
    outros?: true
    total?: true
  }

  export type EstimativaCustoMinAggregateInputType = {
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

  export type EstimativaCustoMaxAggregateInputType = {
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

  export type EstimativaCustoCountAggregateInputType = {
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

  export type EstimativaCustoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EstimativaCusto to aggregate.
     */
    where?: EstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaCustos to fetch.
     */
    orderBy?: EstimativaCustoOrderByWithRelationInput | EstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EstimativaCustos
    **/
    _count?: true | EstimativaCustoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EstimativaCustoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EstimativaCustoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EstimativaCustoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EstimativaCustoMaxAggregateInputType
  }

  export type GetEstimativaCustoAggregateType<T extends EstimativaCustoAggregateArgs> = {
        [P in keyof T & keyof AggregateEstimativaCusto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEstimativaCusto[P]>
      : GetScalarType<T[P], AggregateEstimativaCusto[P]>
  }




  export type EstimativaCustoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EstimativaCustoWhereInput
    orderBy?: EstimativaCustoOrderByWithAggregationInput | EstimativaCustoOrderByWithAggregationInput[]
    by: EstimativaCustoScalarFieldEnum[] | EstimativaCustoScalarFieldEnum
    having?: EstimativaCustoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EstimativaCustoCountAggregateInputType | true
    _avg?: EstimativaCustoAvgAggregateInputType
    _sum?: EstimativaCustoSumAggregateInputType
    _min?: EstimativaCustoMinAggregateInputType
    _max?: EstimativaCustoMaxAggregateInputType
  }

  export type EstimativaCustoGroupByOutputType = {
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
    _count: EstimativaCustoCountAggregateOutputType | null
    _avg: EstimativaCustoAvgAggregateOutputType | null
    _sum: EstimativaCustoSumAggregateOutputType | null
    _min: EstimativaCustoMinAggregateOutputType | null
    _max: EstimativaCustoMaxAggregateOutputType | null
  }

  type GetEstimativaCustoGroupByPayload<T extends EstimativaCustoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EstimativaCustoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EstimativaCustoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EstimativaCustoGroupByOutputType[P]>
            : GetScalarType<T[P], EstimativaCustoGroupByOutputType[P]>
        }
      >
    >


  export type EstimativaCustoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["estimativaCusto"]>

  export type EstimativaCustoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["estimativaCusto"]>

  export type EstimativaCustoSelectScalar = {
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

  export type EstimativaCustoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type EstimativaCustoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $EstimativaCustoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EstimativaCusto"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
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
    }, ExtArgs["result"]["estimativaCusto"]>
    composites: {}
  }

  type EstimativaCustoGetPayload<S extends boolean | null | undefined | EstimativaCustoDefaultArgs> = $Result.GetResult<Prisma.$EstimativaCustoPayload, S>

  type EstimativaCustoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EstimativaCustoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EstimativaCustoCountAggregateInputType | true
    }

  export interface EstimativaCustoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EstimativaCusto'], meta: { name: 'EstimativaCusto' } }
    /**
     * Find zero or one EstimativaCusto that matches the filter.
     * @param {EstimativaCustoFindUniqueArgs} args - Arguments to find a EstimativaCusto
     * @example
     * // Get one EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EstimativaCustoFindUniqueArgs>(args: SelectSubset<T, EstimativaCustoFindUniqueArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EstimativaCusto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EstimativaCustoFindUniqueOrThrowArgs} args - Arguments to find a EstimativaCusto
     * @example
     * // Get one EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EstimativaCustoFindUniqueOrThrowArgs>(args: SelectSubset<T, EstimativaCustoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EstimativaCusto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoFindFirstArgs} args - Arguments to find a EstimativaCusto
     * @example
     * // Get one EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EstimativaCustoFindFirstArgs>(args?: SelectSubset<T, EstimativaCustoFindFirstArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EstimativaCusto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoFindFirstOrThrowArgs} args - Arguments to find a EstimativaCusto
     * @example
     * // Get one EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EstimativaCustoFindFirstOrThrowArgs>(args?: SelectSubset<T, EstimativaCustoFindFirstOrThrowArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EstimativaCustos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EstimativaCustos
     * const estimativaCustos = await prisma.estimativaCusto.findMany()
     * 
     * // Get first 10 EstimativaCustos
     * const estimativaCustos = await prisma.estimativaCusto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const estimativaCustoWithIdOnly = await prisma.estimativaCusto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EstimativaCustoFindManyArgs>(args?: SelectSubset<T, EstimativaCustoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EstimativaCusto.
     * @param {EstimativaCustoCreateArgs} args - Arguments to create a EstimativaCusto.
     * @example
     * // Create one EstimativaCusto
     * const EstimativaCusto = await prisma.estimativaCusto.create({
     *   data: {
     *     // ... data to create a EstimativaCusto
     *   }
     * })
     * 
     */
    create<T extends EstimativaCustoCreateArgs>(args: SelectSubset<T, EstimativaCustoCreateArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EstimativaCustos.
     * @param {EstimativaCustoCreateManyArgs} args - Arguments to create many EstimativaCustos.
     * @example
     * // Create many EstimativaCustos
     * const estimativaCusto = await prisma.estimativaCusto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EstimativaCustoCreateManyArgs>(args?: SelectSubset<T, EstimativaCustoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EstimativaCustos and returns the data saved in the database.
     * @param {EstimativaCustoCreateManyAndReturnArgs} args - Arguments to create many EstimativaCustos.
     * @example
     * // Create many EstimativaCustos
     * const estimativaCusto = await prisma.estimativaCusto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EstimativaCustos and only return the `id`
     * const estimativaCustoWithIdOnly = await prisma.estimativaCusto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EstimativaCustoCreateManyAndReturnArgs>(args?: SelectSubset<T, EstimativaCustoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a EstimativaCusto.
     * @param {EstimativaCustoDeleteArgs} args - Arguments to delete one EstimativaCusto.
     * @example
     * // Delete one EstimativaCusto
     * const EstimativaCusto = await prisma.estimativaCusto.delete({
     *   where: {
     *     // ... filter to delete one EstimativaCusto
     *   }
     * })
     * 
     */
    delete<T extends EstimativaCustoDeleteArgs>(args: SelectSubset<T, EstimativaCustoDeleteArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EstimativaCusto.
     * @param {EstimativaCustoUpdateArgs} args - Arguments to update one EstimativaCusto.
     * @example
     * // Update one EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EstimativaCustoUpdateArgs>(args: SelectSubset<T, EstimativaCustoUpdateArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EstimativaCustos.
     * @param {EstimativaCustoDeleteManyArgs} args - Arguments to filter EstimativaCustos to delete.
     * @example
     * // Delete a few EstimativaCustos
     * const { count } = await prisma.estimativaCusto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EstimativaCustoDeleteManyArgs>(args?: SelectSubset<T, EstimativaCustoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EstimativaCustos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EstimativaCustos
     * const estimativaCusto = await prisma.estimativaCusto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EstimativaCustoUpdateManyArgs>(args: SelectSubset<T, EstimativaCustoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EstimativaCusto.
     * @param {EstimativaCustoUpsertArgs} args - Arguments to update or create a EstimativaCusto.
     * @example
     * // Update or create a EstimativaCusto
     * const estimativaCusto = await prisma.estimativaCusto.upsert({
     *   create: {
     *     // ... data to create a EstimativaCusto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EstimativaCusto we want to update
     *   }
     * })
     */
    upsert<T extends EstimativaCustoUpsertArgs>(args: SelectSubset<T, EstimativaCustoUpsertArgs<ExtArgs>>): Prisma__EstimativaCustoClient<$Result.GetResult<Prisma.$EstimativaCustoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of EstimativaCustos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoCountArgs} args - Arguments to filter EstimativaCustos to count.
     * @example
     * // Count the number of EstimativaCustos
     * const count = await prisma.estimativaCusto.count({
     *   where: {
     *     // ... the filter for the EstimativaCustos we want to count
     *   }
     * })
    **/
    count<T extends EstimativaCustoCountArgs>(
      args?: Subset<T, EstimativaCustoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EstimativaCustoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EstimativaCusto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EstimativaCustoAggregateArgs>(args: Subset<T, EstimativaCustoAggregateArgs>): Prisma.PrismaPromise<GetEstimativaCustoAggregateType<T>>

    /**
     * Group by EstimativaCusto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EstimativaCustoGroupByArgs} args - Group by arguments.
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
      T extends EstimativaCustoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EstimativaCustoGroupByArgs['orderBy'] }
        : { orderBy?: EstimativaCustoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EstimativaCustoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEstimativaCustoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EstimativaCusto model
   */
  readonly fields: EstimativaCustoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EstimativaCusto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EstimativaCustoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the EstimativaCusto model
   */ 
  interface EstimativaCustoFieldRefs {
    readonly id: FieldRef<"EstimativaCusto", 'String'>
    readonly tenant_id: FieldRef<"EstimativaCusto", 'String'>
    readonly product_id: FieldRef<"EstimativaCusto", 'String'>
    readonly user_id: FieldRef<"EstimativaCusto", 'String'>
    readonly processo_id: FieldRef<"EstimativaCusto", 'String'>
    readonly impostos: FieldRef<"EstimativaCusto", 'Float'>
    readonly frete: FieldRef<"EstimativaCusto", 'Float'>
    readonly despacho: FieldRef<"EstimativaCusto", 'Float'>
    readonly outros: FieldRef<"EstimativaCusto", 'Float'>
    readonly total: FieldRef<"EstimativaCusto", 'Float'>
    readonly moeda: FieldRef<"EstimativaCusto", 'String'>
  }
    

  // Custom InputTypes
  /**
   * EstimativaCusto findUnique
   */
  export type EstimativaCustoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaCusto to fetch.
     */
    where: EstimativaCustoWhereUniqueInput
  }

  /**
   * EstimativaCusto findUniqueOrThrow
   */
  export type EstimativaCustoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaCusto to fetch.
     */
    where: EstimativaCustoWhereUniqueInput
  }

  /**
   * EstimativaCusto findFirst
   */
  export type EstimativaCustoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaCusto to fetch.
     */
    where?: EstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaCustos to fetch.
     */
    orderBy?: EstimativaCustoOrderByWithRelationInput | EstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EstimativaCustos.
     */
    cursor?: EstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EstimativaCustos.
     */
    distinct?: EstimativaCustoScalarFieldEnum | EstimativaCustoScalarFieldEnum[]
  }

  /**
   * EstimativaCusto findFirstOrThrow
   */
  export type EstimativaCustoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaCusto to fetch.
     */
    where?: EstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaCustos to fetch.
     */
    orderBy?: EstimativaCustoOrderByWithRelationInput | EstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EstimativaCustos.
     */
    cursor?: EstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaCustos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EstimativaCustos.
     */
    distinct?: EstimativaCustoScalarFieldEnum | EstimativaCustoScalarFieldEnum[]
  }

  /**
   * EstimativaCusto findMany
   */
  export type EstimativaCustoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter, which EstimativaCustos to fetch.
     */
    where?: EstimativaCustoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EstimativaCustos to fetch.
     */
    orderBy?: EstimativaCustoOrderByWithRelationInput | EstimativaCustoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EstimativaCustos.
     */
    cursor?: EstimativaCustoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EstimativaCustos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EstimativaCustos.
     */
    skip?: number
    distinct?: EstimativaCustoScalarFieldEnum | EstimativaCustoScalarFieldEnum[]
  }

  /**
   * EstimativaCusto create
   */
  export type EstimativaCustoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * The data needed to create a EstimativaCusto.
     */
    data: XOR<EstimativaCustoCreateInput, EstimativaCustoUncheckedCreateInput>
  }

  /**
   * EstimativaCusto createMany
   */
  export type EstimativaCustoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EstimativaCustos.
     */
    data: EstimativaCustoCreateManyInput | EstimativaCustoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EstimativaCusto createManyAndReturn
   */
  export type EstimativaCustoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many EstimativaCustos.
     */
    data: EstimativaCustoCreateManyInput | EstimativaCustoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EstimativaCusto update
   */
  export type EstimativaCustoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * The data needed to update a EstimativaCusto.
     */
    data: XOR<EstimativaCustoUpdateInput, EstimativaCustoUncheckedUpdateInput>
    /**
     * Choose, which EstimativaCusto to update.
     */
    where: EstimativaCustoWhereUniqueInput
  }

  /**
   * EstimativaCusto updateMany
   */
  export type EstimativaCustoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EstimativaCustos.
     */
    data: XOR<EstimativaCustoUpdateManyMutationInput, EstimativaCustoUncheckedUpdateManyInput>
    /**
     * Filter which EstimativaCustos to update
     */
    where?: EstimativaCustoWhereInput
  }

  /**
   * EstimativaCusto upsert
   */
  export type EstimativaCustoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * The filter to search for the EstimativaCusto to update in case it exists.
     */
    where: EstimativaCustoWhereUniqueInput
    /**
     * In case the EstimativaCusto found by the `where` argument doesn't exist, create a new EstimativaCusto with this data.
     */
    create: XOR<EstimativaCustoCreateInput, EstimativaCustoUncheckedCreateInput>
    /**
     * In case the EstimativaCusto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EstimativaCustoUpdateInput, EstimativaCustoUncheckedUpdateInput>
  }

  /**
   * EstimativaCusto delete
   */
  export type EstimativaCustoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
    /**
     * Filter which EstimativaCusto to delete.
     */
    where: EstimativaCustoWhereUniqueInput
  }

  /**
   * EstimativaCusto deleteMany
   */
  export type EstimativaCustoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EstimativaCustos to delete
     */
    where?: EstimativaCustoWhereInput
  }

  /**
   * EstimativaCusto without action
   */
  export type EstimativaCustoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EstimativaCusto
     */
    select?: EstimativaCustoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EstimativaCustoInclude<ExtArgs> | null
  }


  /**
   * Model DadosTecnicos
   */

  export type AggregateDadosTecnicos = {
    _count: DadosTecnicosCountAggregateOutputType | null
    _avg: DadosTecnicosAvgAggregateOutputType | null
    _sum: DadosTecnicosSumAggregateOutputType | null
    _min: DadosTecnicosMinAggregateOutputType | null
    _max: DadosTecnicosMaxAggregateOutputType | null
  }

  export type DadosTecnicosAvgAggregateOutputType = {
    seguro_valor: number | null
  }

  export type DadosTecnicosSumAggregateOutputType = {
    seguro_valor: number | null
  }

  export type DadosTecnicosMinAggregateOutputType = {
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

  export type DadosTecnicosMaxAggregateOutputType = {
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

  export type DadosTecnicosCountAggregateOutputType = {
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


  export type DadosTecnicosAvgAggregateInputType = {
    seguro_valor?: true
  }

  export type DadosTecnicosSumAggregateInputType = {
    seguro_valor?: true
  }

  export type DadosTecnicosMinAggregateInputType = {
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

  export type DadosTecnicosMaxAggregateInputType = {
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

  export type DadosTecnicosCountAggregateInputType = {
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

  export type DadosTecnicosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DadosTecnicos to aggregate.
     */
    where?: DadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosTecnicos to fetch.
     */
    orderBy?: DadosTecnicosOrderByWithRelationInput | DadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DadosTecnicos
    **/
    _count?: true | DadosTecnicosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DadosTecnicosAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DadosTecnicosSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DadosTecnicosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DadosTecnicosMaxAggregateInputType
  }

  export type GetDadosTecnicosAggregateType<T extends DadosTecnicosAggregateArgs> = {
        [P in keyof T & keyof AggregateDadosTecnicos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDadosTecnicos[P]>
      : GetScalarType<T[P], AggregateDadosTecnicos[P]>
  }




  export type DadosTecnicosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DadosTecnicosWhereInput
    orderBy?: DadosTecnicosOrderByWithAggregationInput | DadosTecnicosOrderByWithAggregationInput[]
    by: DadosTecnicosScalarFieldEnum[] | DadosTecnicosScalarFieldEnum
    having?: DadosTecnicosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DadosTecnicosCountAggregateInputType | true
    _avg?: DadosTecnicosAvgAggregateInputType
    _sum?: DadosTecnicosSumAggregateInputType
    _min?: DadosTecnicosMinAggregateInputType
    _max?: DadosTecnicosMaxAggregateInputType
  }

  export type DadosTecnicosGroupByOutputType = {
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
    _count: DadosTecnicosCountAggregateOutputType | null
    _avg: DadosTecnicosAvgAggregateOutputType | null
    _sum: DadosTecnicosSumAggregateOutputType | null
    _min: DadosTecnicosMinAggregateOutputType | null
    _max: DadosTecnicosMaxAggregateOutputType | null
  }

  type GetDadosTecnicosGroupByPayload<T extends DadosTecnicosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DadosTecnicosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DadosTecnicosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DadosTecnicosGroupByOutputType[P]>
            : GetScalarType<T[P], DadosTecnicosGroupByOutputType[P]>
        }
      >
    >


  export type DadosTecnicosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dadosTecnicos"]>

  export type DadosTecnicosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dadosTecnicos"]>

  export type DadosTecnicosSelectScalar = {
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

  export type DadosTecnicosInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }
  export type DadosTecnicosIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | ProcessoDefaultArgs<ExtArgs>
  }

  export type $DadosTecnicosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DadosTecnicos"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs>
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
    }, ExtArgs["result"]["dadosTecnicos"]>
    composites: {}
  }

  type DadosTecnicosGetPayload<S extends boolean | null | undefined | DadosTecnicosDefaultArgs> = $Result.GetResult<Prisma.$DadosTecnicosPayload, S>

  type DadosTecnicosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DadosTecnicosFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DadosTecnicosCountAggregateInputType | true
    }

  export interface DadosTecnicosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DadosTecnicos'], meta: { name: 'DadosTecnicos' } }
    /**
     * Find zero or one DadosTecnicos that matches the filter.
     * @param {DadosTecnicosFindUniqueArgs} args - Arguments to find a DadosTecnicos
     * @example
     * // Get one DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DadosTecnicosFindUniqueArgs>(args: SelectSubset<T, DadosTecnicosFindUniqueArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DadosTecnicos that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DadosTecnicosFindUniqueOrThrowArgs} args - Arguments to find a DadosTecnicos
     * @example
     * // Get one DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DadosTecnicosFindUniqueOrThrowArgs>(args: SelectSubset<T, DadosTecnicosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DadosTecnicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosFindFirstArgs} args - Arguments to find a DadosTecnicos
     * @example
     * // Get one DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DadosTecnicosFindFirstArgs>(args?: SelectSubset<T, DadosTecnicosFindFirstArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DadosTecnicos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosFindFirstOrThrowArgs} args - Arguments to find a DadosTecnicos
     * @example
     * // Get one DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DadosTecnicosFindFirstOrThrowArgs>(args?: SelectSubset<T, DadosTecnicosFindFirstOrThrowArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DadosTecnicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findMany()
     * 
     * // Get first 10 DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dadosTecnicosWithIdOnly = await prisma.dadosTecnicos.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DadosTecnicosFindManyArgs>(args?: SelectSubset<T, DadosTecnicosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DadosTecnicos.
     * @param {DadosTecnicosCreateArgs} args - Arguments to create a DadosTecnicos.
     * @example
     * // Create one DadosTecnicos
     * const DadosTecnicos = await prisma.dadosTecnicos.create({
     *   data: {
     *     // ... data to create a DadosTecnicos
     *   }
     * })
     * 
     */
    create<T extends DadosTecnicosCreateArgs>(args: SelectSubset<T, DadosTecnicosCreateArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DadosTecnicos.
     * @param {DadosTecnicosCreateManyArgs} args - Arguments to create many DadosTecnicos.
     * @example
     * // Create many DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DadosTecnicosCreateManyArgs>(args?: SelectSubset<T, DadosTecnicosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DadosTecnicos and returns the data saved in the database.
     * @param {DadosTecnicosCreateManyAndReturnArgs} args - Arguments to create many DadosTecnicos.
     * @example
     * // Create many DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DadosTecnicos and only return the `id`
     * const dadosTecnicosWithIdOnly = await prisma.dadosTecnicos.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DadosTecnicosCreateManyAndReturnArgs>(args?: SelectSubset<T, DadosTecnicosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DadosTecnicos.
     * @param {DadosTecnicosDeleteArgs} args - Arguments to delete one DadosTecnicos.
     * @example
     * // Delete one DadosTecnicos
     * const DadosTecnicos = await prisma.dadosTecnicos.delete({
     *   where: {
     *     // ... filter to delete one DadosTecnicos
     *   }
     * })
     * 
     */
    delete<T extends DadosTecnicosDeleteArgs>(args: SelectSubset<T, DadosTecnicosDeleteArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DadosTecnicos.
     * @param {DadosTecnicosUpdateArgs} args - Arguments to update one DadosTecnicos.
     * @example
     * // Update one DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DadosTecnicosUpdateArgs>(args: SelectSubset<T, DadosTecnicosUpdateArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DadosTecnicos.
     * @param {DadosTecnicosDeleteManyArgs} args - Arguments to filter DadosTecnicos to delete.
     * @example
     * // Delete a few DadosTecnicos
     * const { count } = await prisma.dadosTecnicos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DadosTecnicosDeleteManyArgs>(args?: SelectSubset<T, DadosTecnicosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DadosTecnicosUpdateManyArgs>(args: SelectSubset<T, DadosTecnicosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DadosTecnicos.
     * @param {DadosTecnicosUpsertArgs} args - Arguments to update or create a DadosTecnicos.
     * @example
     * // Update or create a DadosTecnicos
     * const dadosTecnicos = await prisma.dadosTecnicos.upsert({
     *   create: {
     *     // ... data to create a DadosTecnicos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DadosTecnicos we want to update
     *   }
     * })
     */
    upsert<T extends DadosTecnicosUpsertArgs>(args: SelectSubset<T, DadosTecnicosUpsertArgs<ExtArgs>>): Prisma__DadosTecnicosClient<$Result.GetResult<Prisma.$DadosTecnicosPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosCountArgs} args - Arguments to filter DadosTecnicos to count.
     * @example
     * // Count the number of DadosTecnicos
     * const count = await prisma.dadosTecnicos.count({
     *   where: {
     *     // ... the filter for the DadosTecnicos we want to count
     *   }
     * })
    **/
    count<T extends DadosTecnicosCountArgs>(
      args?: Subset<T, DadosTecnicosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DadosTecnicosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DadosTecnicosAggregateArgs>(args: Subset<T, DadosTecnicosAggregateArgs>): Prisma.PrismaPromise<GetDadosTecnicosAggregateType<T>>

    /**
     * Group by DadosTecnicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DadosTecnicosGroupByArgs} args - Group by arguments.
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
      T extends DadosTecnicosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DadosTecnicosGroupByArgs['orderBy'] }
        : { orderBy?: DadosTecnicosGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DadosTecnicosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDadosTecnicosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DadosTecnicos model
   */
  readonly fields: DadosTecnicosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DadosTecnicos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DadosTecnicosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DadosTecnicos model
   */ 
  interface DadosTecnicosFieldRefs {
    readonly id: FieldRef<"DadosTecnicos", 'String'>
    readonly tenant_id: FieldRef<"DadosTecnicos", 'String'>
    readonly product_id: FieldRef<"DadosTecnicos", 'String'>
    readonly user_id: FieldRef<"DadosTecnicos", 'String'>
    readonly processo_id: FieldRef<"DadosTecnicos", 'String'>
    readonly importador_nome: FieldRef<"DadosTecnicos", 'String'>
    readonly importador_cnpj: FieldRef<"DadosTecnicos", 'String'>
    readonly importador_endereco: FieldRef<"DadosTecnicos", 'String'>
    readonly exportador_nome: FieldRef<"DadosTecnicos", 'String'>
    readonly exportador_pais: FieldRef<"DadosTecnicos", 'String'>
    readonly exportador_endereco: FieldRef<"DadosTecnicos", 'String'>
    readonly modal: FieldRef<"DadosTecnicos", 'String'>
    readonly porto_embarque: FieldRef<"DadosTecnicos", 'String'>
    readonly porto_destino: FieldRef<"DadosTecnicos", 'String'>
    readonly navio_voo: FieldRef<"DadosTecnicos", 'String'>
    readonly data_embarque: FieldRef<"DadosTecnicos", 'DateTime'>
    readonly data_chegada_prevista: FieldRef<"DadosTecnicos", 'DateTime'>
    readonly data_chegada_real: FieldRef<"DadosTecnicos", 'DateTime'>
    readonly bl_numero: FieldRef<"DadosTecnicos", 'String'>
    readonly container_numero: FieldRef<"DadosTecnicos", 'String'>
    readonly despachante_nome: FieldRef<"DadosTecnicos", 'String'>
    readonly despachante_contato: FieldRef<"DadosTecnicos", 'String'>
    readonly di_numero: FieldRef<"DadosTecnicos", 'String'>
    readonly di_data: FieldRef<"DadosTecnicos", 'DateTime'>
    readonly canal: FieldRef<"DadosTecnicos", 'String'>
    readonly seguro_apolice: FieldRef<"DadosTecnicos", 'String'>
    readonly seguro_valor: FieldRef<"DadosTecnicos", 'Float'>
    readonly seguro_moeda: FieldRef<"DadosTecnicos", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DadosTecnicos findUnique
   */
  export type DadosTecnicosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which DadosTecnicos to fetch.
     */
    where: DadosTecnicosWhereUniqueInput
  }

  /**
   * DadosTecnicos findUniqueOrThrow
   */
  export type DadosTecnicosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which DadosTecnicos to fetch.
     */
    where: DadosTecnicosWhereUniqueInput
  }

  /**
   * DadosTecnicos findFirst
   */
  export type DadosTecnicosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which DadosTecnicos to fetch.
     */
    where?: DadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosTecnicos to fetch.
     */
    orderBy?: DadosTecnicosOrderByWithRelationInput | DadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DadosTecnicos.
     */
    cursor?: DadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DadosTecnicos.
     */
    distinct?: DadosTecnicosScalarFieldEnum | DadosTecnicosScalarFieldEnum[]
  }

  /**
   * DadosTecnicos findFirstOrThrow
   */
  export type DadosTecnicosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which DadosTecnicos to fetch.
     */
    where?: DadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosTecnicos to fetch.
     */
    orderBy?: DadosTecnicosOrderByWithRelationInput | DadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DadosTecnicos.
     */
    cursor?: DadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosTecnicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DadosTecnicos.
     */
    distinct?: DadosTecnicosScalarFieldEnum | DadosTecnicosScalarFieldEnum[]
  }

  /**
   * DadosTecnicos findMany
   */
  export type DadosTecnicosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter, which DadosTecnicos to fetch.
     */
    where?: DadosTecnicosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DadosTecnicos to fetch.
     */
    orderBy?: DadosTecnicosOrderByWithRelationInput | DadosTecnicosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DadosTecnicos.
     */
    cursor?: DadosTecnicosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DadosTecnicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DadosTecnicos.
     */
    skip?: number
    distinct?: DadosTecnicosScalarFieldEnum | DadosTecnicosScalarFieldEnum[]
  }

  /**
   * DadosTecnicos create
   */
  export type DadosTecnicosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * The data needed to create a DadosTecnicos.
     */
    data: XOR<DadosTecnicosCreateInput, DadosTecnicosUncheckedCreateInput>
  }

  /**
   * DadosTecnicos createMany
   */
  export type DadosTecnicosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DadosTecnicos.
     */
    data: DadosTecnicosCreateManyInput | DadosTecnicosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DadosTecnicos createManyAndReturn
   */
  export type DadosTecnicosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DadosTecnicos.
     */
    data: DadosTecnicosCreateManyInput | DadosTecnicosCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DadosTecnicos update
   */
  export type DadosTecnicosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * The data needed to update a DadosTecnicos.
     */
    data: XOR<DadosTecnicosUpdateInput, DadosTecnicosUncheckedUpdateInput>
    /**
     * Choose, which DadosTecnicos to update.
     */
    where: DadosTecnicosWhereUniqueInput
  }

  /**
   * DadosTecnicos updateMany
   */
  export type DadosTecnicosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DadosTecnicos.
     */
    data: XOR<DadosTecnicosUpdateManyMutationInput, DadosTecnicosUncheckedUpdateManyInput>
    /**
     * Filter which DadosTecnicos to update
     */
    where?: DadosTecnicosWhereInput
  }

  /**
   * DadosTecnicos upsert
   */
  export type DadosTecnicosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * The filter to search for the DadosTecnicos to update in case it exists.
     */
    where: DadosTecnicosWhereUniqueInput
    /**
     * In case the DadosTecnicos found by the `where` argument doesn't exist, create a new DadosTecnicos with this data.
     */
    create: XOR<DadosTecnicosCreateInput, DadosTecnicosUncheckedCreateInput>
    /**
     * In case the DadosTecnicos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DadosTecnicosUpdateInput, DadosTecnicosUncheckedUpdateInput>
  }

  /**
   * DadosTecnicos delete
   */
  export type DadosTecnicosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
    /**
     * Filter which DadosTecnicos to delete.
     */
    where: DadosTecnicosWhereUniqueInput
  }

  /**
   * DadosTecnicos deleteMany
   */
  export type DadosTecnicosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DadosTecnicos to delete
     */
    where?: DadosTecnicosWhereInput
  }

  /**
   * DadosTecnicos without action
   */
  export type DadosTecnicosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DadosTecnicos
     */
    select?: DadosTecnicosSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DadosTecnicosInclude<ExtArgs> | null
  }


  /**
   * Model PedidoStatus
   */

  export type AggregatePedidoStatus = {
    _count: PedidoStatusCountAggregateOutputType | null
    _avg: PedidoStatusAvgAggregateOutputType | null
    _sum: PedidoStatusSumAggregateOutputType | null
    _min: PedidoStatusMinAggregateOutputType | null
    _max: PedidoStatusMaxAggregateOutputType | null
  }

  export type PedidoStatusAvgAggregateOutputType = {
    ordem: number | null
  }

  export type PedidoStatusSumAggregateOutputType = {
    ordem: number | null
  }

  export type PedidoStatusMinAggregateOutputType = {
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

  export type PedidoStatusMaxAggregateOutputType = {
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

  export type PedidoStatusCountAggregateOutputType = {
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


  export type PedidoStatusAvgAggregateInputType = {
    ordem?: true
  }

  export type PedidoStatusSumAggregateInputType = {
    ordem?: true
  }

  export type PedidoStatusMinAggregateInputType = {
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

  export type PedidoStatusMaxAggregateInputType = {
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

  export type PedidoStatusCountAggregateInputType = {
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

  export type PedidoStatusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoStatus to aggregate.
     */
    where?: PedidoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoStatuses to fetch.
     */
    orderBy?: PedidoStatusOrderByWithRelationInput | PedidoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PedidoStatuses
    **/
    _count?: true | PedidoStatusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PedidoStatusAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PedidoStatusSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoStatusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoStatusMaxAggregateInputType
  }

  export type GetPedidoStatusAggregateType<T extends PedidoStatusAggregateArgs> = {
        [P in keyof T & keyof AggregatePedidoStatus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedidoStatus[P]>
      : GetScalarType<T[P], AggregatePedidoStatus[P]>
  }




  export type PedidoStatusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoStatusWhereInput
    orderBy?: PedidoStatusOrderByWithAggregationInput | PedidoStatusOrderByWithAggregationInput[]
    by: PedidoStatusScalarFieldEnum[] | PedidoStatusScalarFieldEnum
    having?: PedidoStatusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoStatusCountAggregateInputType | true
    _avg?: PedidoStatusAvgAggregateInputType
    _sum?: PedidoStatusSumAggregateInputType
    _min?: PedidoStatusMinAggregateInputType
    _max?: PedidoStatusMaxAggregateInputType
  }

  export type PedidoStatusGroupByOutputType = {
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
    _count: PedidoStatusCountAggregateOutputType | null
    _avg: PedidoStatusAvgAggregateOutputType | null
    _sum: PedidoStatusSumAggregateOutputType | null
    _min: PedidoStatusMinAggregateOutputType | null
    _max: PedidoStatusMaxAggregateOutputType | null
  }

  type GetPedidoStatusGroupByPayload<T extends PedidoStatusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoStatusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoStatusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoStatusGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoStatusGroupByOutputType[P]>
        }
      >
    >


  export type PedidoStatusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["pedidoStatus"]>

  export type PedidoStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["pedidoStatus"]>

  export type PedidoStatusSelectScalar = {
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


  export type $PedidoStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PedidoStatus"
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
    }, ExtArgs["result"]["pedidoStatus"]>
    composites: {}
  }

  type PedidoStatusGetPayload<S extends boolean | null | undefined | PedidoStatusDefaultArgs> = $Result.GetResult<Prisma.$PedidoStatusPayload, S>

  type PedidoStatusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoStatusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoStatusCountAggregateInputType | true
    }

  export interface PedidoStatusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PedidoStatus'], meta: { name: 'PedidoStatus' } }
    /**
     * Find zero or one PedidoStatus that matches the filter.
     * @param {PedidoStatusFindUniqueArgs} args - Arguments to find a PedidoStatus
     * @example
     * // Get one PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoStatusFindUniqueArgs>(args: SelectSubset<T, PedidoStatusFindUniqueArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PedidoStatus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoStatusFindUniqueOrThrowArgs} args - Arguments to find a PedidoStatus
     * @example
     * // Get one PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoStatusFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoStatusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PedidoStatus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusFindFirstArgs} args - Arguments to find a PedidoStatus
     * @example
     * // Get one PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoStatusFindFirstArgs>(args?: SelectSubset<T, PedidoStatusFindFirstArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PedidoStatus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusFindFirstOrThrowArgs} args - Arguments to find a PedidoStatus
     * @example
     * // Get one PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoStatusFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoStatusFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PedidoStatuses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PedidoStatuses
     * const pedidoStatuses = await prisma.pedidoStatus.findMany()
     * 
     * // Get first 10 PedidoStatuses
     * const pedidoStatuses = await prisma.pedidoStatus.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoStatusWithIdOnly = await prisma.pedidoStatus.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoStatusFindManyArgs>(args?: SelectSubset<T, PedidoStatusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PedidoStatus.
     * @param {PedidoStatusCreateArgs} args - Arguments to create a PedidoStatus.
     * @example
     * // Create one PedidoStatus
     * const PedidoStatus = await prisma.pedidoStatus.create({
     *   data: {
     *     // ... data to create a PedidoStatus
     *   }
     * })
     * 
     */
    create<T extends PedidoStatusCreateArgs>(args: SelectSubset<T, PedidoStatusCreateArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PedidoStatuses.
     * @param {PedidoStatusCreateManyArgs} args - Arguments to create many PedidoStatuses.
     * @example
     * // Create many PedidoStatuses
     * const pedidoStatus = await prisma.pedidoStatus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoStatusCreateManyArgs>(args?: SelectSubset<T, PedidoStatusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PedidoStatuses and returns the data saved in the database.
     * @param {PedidoStatusCreateManyAndReturnArgs} args - Arguments to create many PedidoStatuses.
     * @example
     * // Create many PedidoStatuses
     * const pedidoStatus = await prisma.pedidoStatus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PedidoStatuses and only return the `id`
     * const pedidoStatusWithIdOnly = await prisma.pedidoStatus.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoStatusCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoStatusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PedidoStatus.
     * @param {PedidoStatusDeleteArgs} args - Arguments to delete one PedidoStatus.
     * @example
     * // Delete one PedidoStatus
     * const PedidoStatus = await prisma.pedidoStatus.delete({
     *   where: {
     *     // ... filter to delete one PedidoStatus
     *   }
     * })
     * 
     */
    delete<T extends PedidoStatusDeleteArgs>(args: SelectSubset<T, PedidoStatusDeleteArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PedidoStatus.
     * @param {PedidoStatusUpdateArgs} args - Arguments to update one PedidoStatus.
     * @example
     * // Update one PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoStatusUpdateArgs>(args: SelectSubset<T, PedidoStatusUpdateArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PedidoStatuses.
     * @param {PedidoStatusDeleteManyArgs} args - Arguments to filter PedidoStatuses to delete.
     * @example
     * // Delete a few PedidoStatuses
     * const { count } = await prisma.pedidoStatus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoStatusDeleteManyArgs>(args?: SelectSubset<T, PedidoStatusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PedidoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PedidoStatuses
     * const pedidoStatus = await prisma.pedidoStatus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoStatusUpdateManyArgs>(args: SelectSubset<T, PedidoStatusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PedidoStatus.
     * @param {PedidoStatusUpsertArgs} args - Arguments to update or create a PedidoStatus.
     * @example
     * // Update or create a PedidoStatus
     * const pedidoStatus = await prisma.pedidoStatus.upsert({
     *   create: {
     *     // ... data to create a PedidoStatus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PedidoStatus we want to update
     *   }
     * })
     */
    upsert<T extends PedidoStatusUpsertArgs>(args: SelectSubset<T, PedidoStatusUpsertArgs<ExtArgs>>): Prisma__PedidoStatusClient<$Result.GetResult<Prisma.$PedidoStatusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PedidoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusCountArgs} args - Arguments to filter PedidoStatuses to count.
     * @example
     * // Count the number of PedidoStatuses
     * const count = await prisma.pedidoStatus.count({
     *   where: {
     *     // ... the filter for the PedidoStatuses we want to count
     *   }
     * })
    **/
    count<T extends PedidoStatusCountArgs>(
      args?: Subset<T, PedidoStatusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoStatusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PedidoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoStatusAggregateArgs>(args: Subset<T, PedidoStatusAggregateArgs>): Prisma.PrismaPromise<GetPedidoStatusAggregateType<T>>

    /**
     * Group by PedidoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoStatusGroupByArgs} args - Group by arguments.
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
      T extends PedidoStatusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoStatusGroupByArgs['orderBy'] }
        : { orderBy?: PedidoStatusGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoStatusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoStatusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PedidoStatus model
   */
  readonly fields: PedidoStatusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PedidoStatus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoStatusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PedidoStatus model
   */ 
  interface PedidoStatusFieldRefs {
    readonly id: FieldRef<"PedidoStatus", 'String'>
    readonly tenant_id: FieldRef<"PedidoStatus", 'String'>
    readonly product_id: FieldRef<"PedidoStatus", 'String'>
    readonly nome: FieldRef<"PedidoStatus", 'String'>
    readonly rotulo: FieldRef<"PedidoStatus", 'String'>
    readonly cor: FieldRef<"PedidoStatus", 'String'>
    readonly icone: FieldRef<"PedidoStatus", 'String'>
    readonly ordem: FieldRef<"PedidoStatus", 'Int'>
    readonly is_padrao: FieldRef<"PedidoStatus", 'Boolean'>
    readonly is_sistema: FieldRef<"PedidoStatus", 'Boolean'>
    readonly created_at: FieldRef<"PedidoStatus", 'DateTime'>
    readonly updated_at: FieldRef<"PedidoStatus", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PedidoStatus findUnique
   */
  export type PedidoStatusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter, which PedidoStatus to fetch.
     */
    where: PedidoStatusWhereUniqueInput
  }

  /**
   * PedidoStatus findUniqueOrThrow
   */
  export type PedidoStatusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter, which PedidoStatus to fetch.
     */
    where: PedidoStatusWhereUniqueInput
  }

  /**
   * PedidoStatus findFirst
   */
  export type PedidoStatusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter, which PedidoStatus to fetch.
     */
    where?: PedidoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoStatuses to fetch.
     */
    orderBy?: PedidoStatusOrderByWithRelationInput | PedidoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoStatuses.
     */
    cursor?: PedidoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoStatuses.
     */
    distinct?: PedidoStatusScalarFieldEnum | PedidoStatusScalarFieldEnum[]
  }

  /**
   * PedidoStatus findFirstOrThrow
   */
  export type PedidoStatusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter, which PedidoStatus to fetch.
     */
    where?: PedidoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoStatuses to fetch.
     */
    orderBy?: PedidoStatusOrderByWithRelationInput | PedidoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoStatuses.
     */
    cursor?: PedidoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoStatuses.
     */
    distinct?: PedidoStatusScalarFieldEnum | PedidoStatusScalarFieldEnum[]
  }

  /**
   * PedidoStatus findMany
   */
  export type PedidoStatusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter, which PedidoStatuses to fetch.
     */
    where?: PedidoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoStatuses to fetch.
     */
    orderBy?: PedidoStatusOrderByWithRelationInput | PedidoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PedidoStatuses.
     */
    cursor?: PedidoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoStatuses.
     */
    skip?: number
    distinct?: PedidoStatusScalarFieldEnum | PedidoStatusScalarFieldEnum[]
  }

  /**
   * PedidoStatus create
   */
  export type PedidoStatusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * The data needed to create a PedidoStatus.
     */
    data: XOR<PedidoStatusCreateInput, PedidoStatusUncheckedCreateInput>
  }

  /**
   * PedidoStatus createMany
   */
  export type PedidoStatusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PedidoStatuses.
     */
    data: PedidoStatusCreateManyInput | PedidoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoStatus createManyAndReturn
   */
  export type PedidoStatusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PedidoStatuses.
     */
    data: PedidoStatusCreateManyInput | PedidoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoStatus update
   */
  export type PedidoStatusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * The data needed to update a PedidoStatus.
     */
    data: XOR<PedidoStatusUpdateInput, PedidoStatusUncheckedUpdateInput>
    /**
     * Choose, which PedidoStatus to update.
     */
    where: PedidoStatusWhereUniqueInput
  }

  /**
   * PedidoStatus updateMany
   */
  export type PedidoStatusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PedidoStatuses.
     */
    data: XOR<PedidoStatusUpdateManyMutationInput, PedidoStatusUncheckedUpdateManyInput>
    /**
     * Filter which PedidoStatuses to update
     */
    where?: PedidoStatusWhereInput
  }

  /**
   * PedidoStatus upsert
   */
  export type PedidoStatusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * The filter to search for the PedidoStatus to update in case it exists.
     */
    where: PedidoStatusWhereUniqueInput
    /**
     * In case the PedidoStatus found by the `where` argument doesn't exist, create a new PedidoStatus with this data.
     */
    create: XOR<PedidoStatusCreateInput, PedidoStatusUncheckedCreateInput>
    /**
     * In case the PedidoStatus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoStatusUpdateInput, PedidoStatusUncheckedUpdateInput>
  }

  /**
   * PedidoStatus delete
   */
  export type PedidoStatusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
    /**
     * Filter which PedidoStatus to delete.
     */
    where: PedidoStatusWhereUniqueInput
  }

  /**
   * PedidoStatus deleteMany
   */
  export type PedidoStatusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoStatuses to delete
     */
    where?: PedidoStatusWhereInput
  }

  /**
   * PedidoStatus without action
   */
  export type PedidoStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoStatus
     */
    select?: PedidoStatusSelect<ExtArgs> | null
  }


  /**
   * Model PedidoColuna
   */

  export type AggregatePedidoColuna = {
    _count: PedidoColunaCountAggregateOutputType | null
    _avg: PedidoColunaAvgAggregateOutputType | null
    _sum: PedidoColunaSumAggregateOutputType | null
    _min: PedidoColunaMinAggregateOutputType | null
    _max: PedidoColunaMaxAggregateOutputType | null
  }

  export type PedidoColunaAvgAggregateOutputType = {
    casas_decimais: number | null
    ordem: number | null
  }

  export type PedidoColunaSumAggregateOutputType = {
    casas_decimais: number | null
    ordem: number | null
  }

  export type PedidoColunaMinAggregateOutputType = {
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

  export type PedidoColunaMaxAggregateOutputType = {
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

  export type PedidoColunaCountAggregateOutputType = {
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


  export type PedidoColunaAvgAggregateInputType = {
    casas_decimais?: true
    ordem?: true
  }

  export type PedidoColunaSumAggregateInputType = {
    casas_decimais?: true
    ordem?: true
  }

  export type PedidoColunaMinAggregateInputType = {
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

  export type PedidoColunaMaxAggregateInputType = {
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

  export type PedidoColunaCountAggregateInputType = {
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

  export type PedidoColunaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoColuna to aggregate.
     */
    where?: PedidoColunaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoColunas to fetch.
     */
    orderBy?: PedidoColunaOrderByWithRelationInput | PedidoColunaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoColunaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PedidoColunas
    **/
    _count?: true | PedidoColunaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PedidoColunaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PedidoColunaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoColunaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoColunaMaxAggregateInputType
  }

  export type GetPedidoColunaAggregateType<T extends PedidoColunaAggregateArgs> = {
        [P in keyof T & keyof AggregatePedidoColuna]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedidoColuna[P]>
      : GetScalarType<T[P], AggregatePedidoColuna[P]>
  }




  export type PedidoColunaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoColunaWhereInput
    orderBy?: PedidoColunaOrderByWithAggregationInput | PedidoColunaOrderByWithAggregationInput[]
    by: PedidoColunaScalarFieldEnum[] | PedidoColunaScalarFieldEnum
    having?: PedidoColunaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoColunaCountAggregateInputType | true
    _avg?: PedidoColunaAvgAggregateInputType
    _sum?: PedidoColunaSumAggregateInputType
    _min?: PedidoColunaMinAggregateInputType
    _max?: PedidoColunaMaxAggregateInputType
  }

  export type PedidoColunaGroupByOutputType = {
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
    _count: PedidoColunaCountAggregateOutputType | null
    _avg: PedidoColunaAvgAggregateOutputType | null
    _sum: PedidoColunaSumAggregateOutputType | null
    _min: PedidoColunaMinAggregateOutputType | null
    _max: PedidoColunaMaxAggregateOutputType | null
  }

  type GetPedidoColunaGroupByPayload<T extends PedidoColunaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoColunaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoColunaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoColunaGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoColunaGroupByOutputType[P]>
        }
      >
    >


  export type PedidoColunaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["pedidoColuna"]>

  export type PedidoColunaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["pedidoColuna"]>

  export type PedidoColunaSelectScalar = {
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


  export type $PedidoColunaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PedidoColuna"
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
    }, ExtArgs["result"]["pedidoColuna"]>
    composites: {}
  }

  type PedidoColunaGetPayload<S extends boolean | null | undefined | PedidoColunaDefaultArgs> = $Result.GetResult<Prisma.$PedidoColunaPayload, S>

  type PedidoColunaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoColunaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoColunaCountAggregateInputType | true
    }

  export interface PedidoColunaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PedidoColuna'], meta: { name: 'PedidoColuna' } }
    /**
     * Find zero or one PedidoColuna that matches the filter.
     * @param {PedidoColunaFindUniqueArgs} args - Arguments to find a PedidoColuna
     * @example
     * // Get one PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoColunaFindUniqueArgs>(args: SelectSubset<T, PedidoColunaFindUniqueArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PedidoColuna that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoColunaFindUniqueOrThrowArgs} args - Arguments to find a PedidoColuna
     * @example
     * // Get one PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoColunaFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoColunaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PedidoColuna that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaFindFirstArgs} args - Arguments to find a PedidoColuna
     * @example
     * // Get one PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoColunaFindFirstArgs>(args?: SelectSubset<T, PedidoColunaFindFirstArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PedidoColuna that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaFindFirstOrThrowArgs} args - Arguments to find a PedidoColuna
     * @example
     * // Get one PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoColunaFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoColunaFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PedidoColunas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PedidoColunas
     * const pedidoColunas = await prisma.pedidoColuna.findMany()
     * 
     * // Get first 10 PedidoColunas
     * const pedidoColunas = await prisma.pedidoColuna.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoColunaWithIdOnly = await prisma.pedidoColuna.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoColunaFindManyArgs>(args?: SelectSubset<T, PedidoColunaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PedidoColuna.
     * @param {PedidoColunaCreateArgs} args - Arguments to create a PedidoColuna.
     * @example
     * // Create one PedidoColuna
     * const PedidoColuna = await prisma.pedidoColuna.create({
     *   data: {
     *     // ... data to create a PedidoColuna
     *   }
     * })
     * 
     */
    create<T extends PedidoColunaCreateArgs>(args: SelectSubset<T, PedidoColunaCreateArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PedidoColunas.
     * @param {PedidoColunaCreateManyArgs} args - Arguments to create many PedidoColunas.
     * @example
     * // Create many PedidoColunas
     * const pedidoColuna = await prisma.pedidoColuna.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoColunaCreateManyArgs>(args?: SelectSubset<T, PedidoColunaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PedidoColunas and returns the data saved in the database.
     * @param {PedidoColunaCreateManyAndReturnArgs} args - Arguments to create many PedidoColunas.
     * @example
     * // Create many PedidoColunas
     * const pedidoColuna = await prisma.pedidoColuna.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PedidoColunas and only return the `id`
     * const pedidoColunaWithIdOnly = await prisma.pedidoColuna.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoColunaCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoColunaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PedidoColuna.
     * @param {PedidoColunaDeleteArgs} args - Arguments to delete one PedidoColuna.
     * @example
     * // Delete one PedidoColuna
     * const PedidoColuna = await prisma.pedidoColuna.delete({
     *   where: {
     *     // ... filter to delete one PedidoColuna
     *   }
     * })
     * 
     */
    delete<T extends PedidoColunaDeleteArgs>(args: SelectSubset<T, PedidoColunaDeleteArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PedidoColuna.
     * @param {PedidoColunaUpdateArgs} args - Arguments to update one PedidoColuna.
     * @example
     * // Update one PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoColunaUpdateArgs>(args: SelectSubset<T, PedidoColunaUpdateArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PedidoColunas.
     * @param {PedidoColunaDeleteManyArgs} args - Arguments to filter PedidoColunas to delete.
     * @example
     * // Delete a few PedidoColunas
     * const { count } = await prisma.pedidoColuna.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoColunaDeleteManyArgs>(args?: SelectSubset<T, PedidoColunaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PedidoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PedidoColunas
     * const pedidoColuna = await prisma.pedidoColuna.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoColunaUpdateManyArgs>(args: SelectSubset<T, PedidoColunaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PedidoColuna.
     * @param {PedidoColunaUpsertArgs} args - Arguments to update or create a PedidoColuna.
     * @example
     * // Update or create a PedidoColuna
     * const pedidoColuna = await prisma.pedidoColuna.upsert({
     *   create: {
     *     // ... data to create a PedidoColuna
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PedidoColuna we want to update
     *   }
     * })
     */
    upsert<T extends PedidoColunaUpsertArgs>(args: SelectSubset<T, PedidoColunaUpsertArgs<ExtArgs>>): Prisma__PedidoColunaClient<$Result.GetResult<Prisma.$PedidoColunaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PedidoColunas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaCountArgs} args - Arguments to filter PedidoColunas to count.
     * @example
     * // Count the number of PedidoColunas
     * const count = await prisma.pedidoColuna.count({
     *   where: {
     *     // ... the filter for the PedidoColunas we want to count
     *   }
     * })
    **/
    count<T extends PedidoColunaCountArgs>(
      args?: Subset<T, PedidoColunaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoColunaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PedidoColuna.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoColunaAggregateArgs>(args: Subset<T, PedidoColunaAggregateArgs>): Prisma.PrismaPromise<GetPedidoColunaAggregateType<T>>

    /**
     * Group by PedidoColuna.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoColunaGroupByArgs} args - Group by arguments.
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
      T extends PedidoColunaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoColunaGroupByArgs['orderBy'] }
        : { orderBy?: PedidoColunaGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoColunaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoColunaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PedidoColuna model
   */
  readonly fields: PedidoColunaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PedidoColuna.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoColunaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PedidoColuna model
   */ 
  interface PedidoColunaFieldRefs {
    readonly id: FieldRef<"PedidoColuna", 'String'>
    readonly tenant_id: FieldRef<"PedidoColuna", 'String'>
    readonly product_id: FieldRef<"PedidoColuna", 'String'>
    readonly nome: FieldRef<"PedidoColuna", 'String'>
    readonly rotulo: FieldRef<"PedidoColuna", 'String'>
    readonly tipo: FieldRef<"PedidoColuna", 'String'>
    readonly casas_decimais: FieldRef<"PedidoColuna", 'Int'>
    readonly opcoes: FieldRef<"PedidoColuna", 'Json'>
    readonly ordem: FieldRef<"PedidoColuna", 'Int'>
    readonly filtravel: FieldRef<"PedidoColuna", 'Boolean'>
    readonly exibida_padrao: FieldRef<"PedidoColuna", 'Boolean'>
    readonly index_criado: FieldRef<"PedidoColuna", 'Boolean'>
    readonly created_at: FieldRef<"PedidoColuna", 'DateTime'>
    readonly updated_at: FieldRef<"PedidoColuna", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PedidoColuna findUnique
   */
  export type PedidoColunaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter, which PedidoColuna to fetch.
     */
    where: PedidoColunaWhereUniqueInput
  }

  /**
   * PedidoColuna findUniqueOrThrow
   */
  export type PedidoColunaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter, which PedidoColuna to fetch.
     */
    where: PedidoColunaWhereUniqueInput
  }

  /**
   * PedidoColuna findFirst
   */
  export type PedidoColunaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter, which PedidoColuna to fetch.
     */
    where?: PedidoColunaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoColunas to fetch.
     */
    orderBy?: PedidoColunaOrderByWithRelationInput | PedidoColunaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoColunas.
     */
    cursor?: PedidoColunaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoColunas.
     */
    distinct?: PedidoColunaScalarFieldEnum | PedidoColunaScalarFieldEnum[]
  }

  /**
   * PedidoColuna findFirstOrThrow
   */
  export type PedidoColunaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter, which PedidoColuna to fetch.
     */
    where?: PedidoColunaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoColunas to fetch.
     */
    orderBy?: PedidoColunaOrderByWithRelationInput | PedidoColunaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoColunas.
     */
    cursor?: PedidoColunaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoColunas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoColunas.
     */
    distinct?: PedidoColunaScalarFieldEnum | PedidoColunaScalarFieldEnum[]
  }

  /**
   * PedidoColuna findMany
   */
  export type PedidoColunaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter, which PedidoColunas to fetch.
     */
    where?: PedidoColunaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoColunas to fetch.
     */
    orderBy?: PedidoColunaOrderByWithRelationInput | PedidoColunaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PedidoColunas.
     */
    cursor?: PedidoColunaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoColunas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoColunas.
     */
    skip?: number
    distinct?: PedidoColunaScalarFieldEnum | PedidoColunaScalarFieldEnum[]
  }

  /**
   * PedidoColuna create
   */
  export type PedidoColunaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * The data needed to create a PedidoColuna.
     */
    data: XOR<PedidoColunaCreateInput, PedidoColunaUncheckedCreateInput>
  }

  /**
   * PedidoColuna createMany
   */
  export type PedidoColunaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PedidoColunas.
     */
    data: PedidoColunaCreateManyInput | PedidoColunaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoColuna createManyAndReturn
   */
  export type PedidoColunaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PedidoColunas.
     */
    data: PedidoColunaCreateManyInput | PedidoColunaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoColuna update
   */
  export type PedidoColunaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * The data needed to update a PedidoColuna.
     */
    data: XOR<PedidoColunaUpdateInput, PedidoColunaUncheckedUpdateInput>
    /**
     * Choose, which PedidoColuna to update.
     */
    where: PedidoColunaWhereUniqueInput
  }

  /**
   * PedidoColuna updateMany
   */
  export type PedidoColunaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PedidoColunas.
     */
    data: XOR<PedidoColunaUpdateManyMutationInput, PedidoColunaUncheckedUpdateManyInput>
    /**
     * Filter which PedidoColunas to update
     */
    where?: PedidoColunaWhereInput
  }

  /**
   * PedidoColuna upsert
   */
  export type PedidoColunaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * The filter to search for the PedidoColuna to update in case it exists.
     */
    where: PedidoColunaWhereUniqueInput
    /**
     * In case the PedidoColuna found by the `where` argument doesn't exist, create a new PedidoColuna with this data.
     */
    create: XOR<PedidoColunaCreateInput, PedidoColunaUncheckedCreateInput>
    /**
     * In case the PedidoColuna was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoColunaUpdateInput, PedidoColunaUncheckedUpdateInput>
  }

  /**
   * PedidoColuna delete
   */
  export type PedidoColunaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
    /**
     * Filter which PedidoColuna to delete.
     */
    where: PedidoColunaWhereUniqueInput
  }

  /**
   * PedidoColuna deleteMany
   */
  export type PedidoColunaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoColunas to delete
     */
    where?: PedidoColunaWhereInput
  }

  /**
   * PedidoColuna without action
   */
  export type PedidoColunaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoColuna
     */
    select?: PedidoColunaSelect<ExtArgs> | null
  }


  /**
   * Model PedidoPreferenciaUsuario
   */

  export type AggregatePedidoPreferenciaUsuario = {
    _count: PedidoPreferenciaUsuarioCountAggregateOutputType | null
    _min: PedidoPreferenciaUsuarioMinAggregateOutputType | null
    _max: PedidoPreferenciaUsuarioMaxAggregateOutputType | null
  }

  export type PedidoPreferenciaUsuarioMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    updated_at: Date | null
  }

  export type PedidoPreferenciaUsuarioMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    user_id: string | null
    updated_at: Date | null
  }

  export type PedidoPreferenciaUsuarioCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    user_id: number
    colunas_visiveis: number
    colunas_largura: number
    updated_at: number
    _all: number
  }


  export type PedidoPreferenciaUsuarioMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    updated_at?: true
  }

  export type PedidoPreferenciaUsuarioMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    updated_at?: true
  }

  export type PedidoPreferenciaUsuarioCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    user_id?: true
    colunas_visiveis?: true
    colunas_largura?: true
    updated_at?: true
    _all?: true
  }

  export type PedidoPreferenciaUsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoPreferenciaUsuario to aggregate.
     */
    where?: PedidoPreferenciaUsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaUsuarios to fetch.
     */
    orderBy?: PedidoPreferenciaUsuarioOrderByWithRelationInput | PedidoPreferenciaUsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoPreferenciaUsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaUsuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaUsuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PedidoPreferenciaUsuarios
    **/
    _count?: true | PedidoPreferenciaUsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoPreferenciaUsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoPreferenciaUsuarioMaxAggregateInputType
  }

  export type GetPedidoPreferenciaUsuarioAggregateType<T extends PedidoPreferenciaUsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregatePedidoPreferenciaUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedidoPreferenciaUsuario[P]>
      : GetScalarType<T[P], AggregatePedidoPreferenciaUsuario[P]>
  }




  export type PedidoPreferenciaUsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoPreferenciaUsuarioWhereInput
    orderBy?: PedidoPreferenciaUsuarioOrderByWithAggregationInput | PedidoPreferenciaUsuarioOrderByWithAggregationInput[]
    by: PedidoPreferenciaUsuarioScalarFieldEnum[] | PedidoPreferenciaUsuarioScalarFieldEnum
    having?: PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoPreferenciaUsuarioCountAggregateInputType | true
    _min?: PedidoPreferenciaUsuarioMinAggregateInputType
    _max?: PedidoPreferenciaUsuarioMaxAggregateInputType
  }

  export type PedidoPreferenciaUsuarioGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    user_id: string
    colunas_visiveis: string[]
    colunas_largura: JsonValue | null
    updated_at: Date
    _count: PedidoPreferenciaUsuarioCountAggregateOutputType | null
    _min: PedidoPreferenciaUsuarioMinAggregateOutputType | null
    _max: PedidoPreferenciaUsuarioMaxAggregateOutputType | null
  }

  type GetPedidoPreferenciaUsuarioGroupByPayload<T extends PedidoPreferenciaUsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoPreferenciaUsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoPreferenciaUsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoPreferenciaUsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoPreferenciaUsuarioGroupByOutputType[P]>
        }
      >
    >


  export type PedidoPreferenciaUsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["pedidoPreferenciaUsuario"]>

  export type PedidoPreferenciaUsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["pedidoPreferenciaUsuario"]>

  export type PedidoPreferenciaUsuarioSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    user_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }


  export type $PedidoPreferenciaUsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PedidoPreferenciaUsuario"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      user_id: string
      colunas_visiveis: string[]
      colunas_largura: Prisma.JsonValue | null
      updated_at: Date
    }, ExtArgs["result"]["pedidoPreferenciaUsuario"]>
    composites: {}
  }

  type PedidoPreferenciaUsuarioGetPayload<S extends boolean | null | undefined | PedidoPreferenciaUsuarioDefaultArgs> = $Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload, S>

  type PedidoPreferenciaUsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoPreferenciaUsuarioFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoPreferenciaUsuarioCountAggregateInputType | true
    }

  export interface PedidoPreferenciaUsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PedidoPreferenciaUsuario'], meta: { name: 'PedidoPreferenciaUsuario' } }
    /**
     * Find zero or one PedidoPreferenciaUsuario that matches the filter.
     * @param {PedidoPreferenciaUsuarioFindUniqueArgs} args - Arguments to find a PedidoPreferenciaUsuario
     * @example
     * // Get one PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoPreferenciaUsuarioFindUniqueArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioFindUniqueArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PedidoPreferenciaUsuario that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoPreferenciaUsuarioFindUniqueOrThrowArgs} args - Arguments to find a PedidoPreferenciaUsuario
     * @example
     * // Get one PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoPreferenciaUsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PedidoPreferenciaUsuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioFindFirstArgs} args - Arguments to find a PedidoPreferenciaUsuario
     * @example
     * // Get one PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoPreferenciaUsuarioFindFirstArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioFindFirstArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PedidoPreferenciaUsuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioFindFirstOrThrowArgs} args - Arguments to find a PedidoPreferenciaUsuario
     * @example
     * // Get one PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoPreferenciaUsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PedidoPreferenciaUsuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PedidoPreferenciaUsuarios
     * const pedidoPreferenciaUsuarios = await prisma.pedidoPreferenciaUsuario.findMany()
     * 
     * // Get first 10 PedidoPreferenciaUsuarios
     * const pedidoPreferenciaUsuarios = await prisma.pedidoPreferenciaUsuario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoPreferenciaUsuarioWithIdOnly = await prisma.pedidoPreferenciaUsuario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoPreferenciaUsuarioFindManyArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PedidoPreferenciaUsuario.
     * @param {PedidoPreferenciaUsuarioCreateArgs} args - Arguments to create a PedidoPreferenciaUsuario.
     * @example
     * // Create one PedidoPreferenciaUsuario
     * const PedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.create({
     *   data: {
     *     // ... data to create a PedidoPreferenciaUsuario
     *   }
     * })
     * 
     */
    create<T extends PedidoPreferenciaUsuarioCreateArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioCreateArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PedidoPreferenciaUsuarios.
     * @param {PedidoPreferenciaUsuarioCreateManyArgs} args - Arguments to create many PedidoPreferenciaUsuarios.
     * @example
     * // Create many PedidoPreferenciaUsuarios
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoPreferenciaUsuarioCreateManyArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PedidoPreferenciaUsuarios and returns the data saved in the database.
     * @param {PedidoPreferenciaUsuarioCreateManyAndReturnArgs} args - Arguments to create many PedidoPreferenciaUsuarios.
     * @example
     * // Create many PedidoPreferenciaUsuarios
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PedidoPreferenciaUsuarios and only return the `id`
     * const pedidoPreferenciaUsuarioWithIdOnly = await prisma.pedidoPreferenciaUsuario.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoPreferenciaUsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PedidoPreferenciaUsuario.
     * @param {PedidoPreferenciaUsuarioDeleteArgs} args - Arguments to delete one PedidoPreferenciaUsuario.
     * @example
     * // Delete one PedidoPreferenciaUsuario
     * const PedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.delete({
     *   where: {
     *     // ... filter to delete one PedidoPreferenciaUsuario
     *   }
     * })
     * 
     */
    delete<T extends PedidoPreferenciaUsuarioDeleteArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioDeleteArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PedidoPreferenciaUsuario.
     * @param {PedidoPreferenciaUsuarioUpdateArgs} args - Arguments to update one PedidoPreferenciaUsuario.
     * @example
     * // Update one PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoPreferenciaUsuarioUpdateArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioUpdateArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PedidoPreferenciaUsuarios.
     * @param {PedidoPreferenciaUsuarioDeleteManyArgs} args - Arguments to filter PedidoPreferenciaUsuarios to delete.
     * @example
     * // Delete a few PedidoPreferenciaUsuarios
     * const { count } = await prisma.pedidoPreferenciaUsuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoPreferenciaUsuarioDeleteManyArgs>(args?: SelectSubset<T, PedidoPreferenciaUsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PedidoPreferenciaUsuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PedidoPreferenciaUsuarios
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoPreferenciaUsuarioUpdateManyArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PedidoPreferenciaUsuario.
     * @param {PedidoPreferenciaUsuarioUpsertArgs} args - Arguments to update or create a PedidoPreferenciaUsuario.
     * @example
     * // Update or create a PedidoPreferenciaUsuario
     * const pedidoPreferenciaUsuario = await prisma.pedidoPreferenciaUsuario.upsert({
     *   create: {
     *     // ... data to create a PedidoPreferenciaUsuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PedidoPreferenciaUsuario we want to update
     *   }
     * })
     */
    upsert<T extends PedidoPreferenciaUsuarioUpsertArgs>(args: SelectSubset<T, PedidoPreferenciaUsuarioUpsertArgs<ExtArgs>>): Prisma__PedidoPreferenciaUsuarioClient<$Result.GetResult<Prisma.$PedidoPreferenciaUsuarioPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PedidoPreferenciaUsuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioCountArgs} args - Arguments to filter PedidoPreferenciaUsuarios to count.
     * @example
     * // Count the number of PedidoPreferenciaUsuarios
     * const count = await prisma.pedidoPreferenciaUsuario.count({
     *   where: {
     *     // ... the filter for the PedidoPreferenciaUsuarios we want to count
     *   }
     * })
    **/
    count<T extends PedidoPreferenciaUsuarioCountArgs>(
      args?: Subset<T, PedidoPreferenciaUsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoPreferenciaUsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PedidoPreferenciaUsuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoPreferenciaUsuarioAggregateArgs>(args: Subset<T, PedidoPreferenciaUsuarioAggregateArgs>): Prisma.PrismaPromise<GetPedidoPreferenciaUsuarioAggregateType<T>>

    /**
     * Group by PedidoPreferenciaUsuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaUsuarioGroupByArgs} args - Group by arguments.
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
      T extends PedidoPreferenciaUsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoPreferenciaUsuarioGroupByArgs['orderBy'] }
        : { orderBy?: PedidoPreferenciaUsuarioGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoPreferenciaUsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoPreferenciaUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PedidoPreferenciaUsuario model
   */
  readonly fields: PedidoPreferenciaUsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PedidoPreferenciaUsuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoPreferenciaUsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PedidoPreferenciaUsuario model
   */ 
  interface PedidoPreferenciaUsuarioFieldRefs {
    readonly id: FieldRef<"PedidoPreferenciaUsuario", 'String'>
    readonly tenant_id: FieldRef<"PedidoPreferenciaUsuario", 'String'>
    readonly product_id: FieldRef<"PedidoPreferenciaUsuario", 'String'>
    readonly user_id: FieldRef<"PedidoPreferenciaUsuario", 'String'>
    readonly colunas_visiveis: FieldRef<"PedidoPreferenciaUsuario", 'String[]'>
    readonly colunas_largura: FieldRef<"PedidoPreferenciaUsuario", 'Json'>
    readonly updated_at: FieldRef<"PedidoPreferenciaUsuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PedidoPreferenciaUsuario findUnique
   */
  export type PedidoPreferenciaUsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaUsuario to fetch.
     */
    where: PedidoPreferenciaUsuarioWhereUniqueInput
  }

  /**
   * PedidoPreferenciaUsuario findUniqueOrThrow
   */
  export type PedidoPreferenciaUsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaUsuario to fetch.
     */
    where: PedidoPreferenciaUsuarioWhereUniqueInput
  }

  /**
   * PedidoPreferenciaUsuario findFirst
   */
  export type PedidoPreferenciaUsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaUsuario to fetch.
     */
    where?: PedidoPreferenciaUsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaUsuarios to fetch.
     */
    orderBy?: PedidoPreferenciaUsuarioOrderByWithRelationInput | PedidoPreferenciaUsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoPreferenciaUsuarios.
     */
    cursor?: PedidoPreferenciaUsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaUsuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaUsuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoPreferenciaUsuarios.
     */
    distinct?: PedidoPreferenciaUsuarioScalarFieldEnum | PedidoPreferenciaUsuarioScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaUsuario findFirstOrThrow
   */
  export type PedidoPreferenciaUsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaUsuario to fetch.
     */
    where?: PedidoPreferenciaUsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaUsuarios to fetch.
     */
    orderBy?: PedidoPreferenciaUsuarioOrderByWithRelationInput | PedidoPreferenciaUsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoPreferenciaUsuarios.
     */
    cursor?: PedidoPreferenciaUsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaUsuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaUsuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoPreferenciaUsuarios.
     */
    distinct?: PedidoPreferenciaUsuarioScalarFieldEnum | PedidoPreferenciaUsuarioScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaUsuario findMany
   */
  export type PedidoPreferenciaUsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaUsuarios to fetch.
     */
    where?: PedidoPreferenciaUsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaUsuarios to fetch.
     */
    orderBy?: PedidoPreferenciaUsuarioOrderByWithRelationInput | PedidoPreferenciaUsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PedidoPreferenciaUsuarios.
     */
    cursor?: PedidoPreferenciaUsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaUsuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaUsuarios.
     */
    skip?: number
    distinct?: PedidoPreferenciaUsuarioScalarFieldEnum | PedidoPreferenciaUsuarioScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaUsuario create
   */
  export type PedidoPreferenciaUsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * The data needed to create a PedidoPreferenciaUsuario.
     */
    data: XOR<PedidoPreferenciaUsuarioCreateInput, PedidoPreferenciaUsuarioUncheckedCreateInput>
  }

  /**
   * PedidoPreferenciaUsuario createMany
   */
  export type PedidoPreferenciaUsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PedidoPreferenciaUsuarios.
     */
    data: PedidoPreferenciaUsuarioCreateManyInput | PedidoPreferenciaUsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoPreferenciaUsuario createManyAndReturn
   */
  export type PedidoPreferenciaUsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PedidoPreferenciaUsuarios.
     */
    data: PedidoPreferenciaUsuarioCreateManyInput | PedidoPreferenciaUsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoPreferenciaUsuario update
   */
  export type PedidoPreferenciaUsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * The data needed to update a PedidoPreferenciaUsuario.
     */
    data: XOR<PedidoPreferenciaUsuarioUpdateInput, PedidoPreferenciaUsuarioUncheckedUpdateInput>
    /**
     * Choose, which PedidoPreferenciaUsuario to update.
     */
    where: PedidoPreferenciaUsuarioWhereUniqueInput
  }

  /**
   * PedidoPreferenciaUsuario updateMany
   */
  export type PedidoPreferenciaUsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PedidoPreferenciaUsuarios.
     */
    data: XOR<PedidoPreferenciaUsuarioUpdateManyMutationInput, PedidoPreferenciaUsuarioUncheckedUpdateManyInput>
    /**
     * Filter which PedidoPreferenciaUsuarios to update
     */
    where?: PedidoPreferenciaUsuarioWhereInput
  }

  /**
   * PedidoPreferenciaUsuario upsert
   */
  export type PedidoPreferenciaUsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * The filter to search for the PedidoPreferenciaUsuario to update in case it exists.
     */
    where: PedidoPreferenciaUsuarioWhereUniqueInput
    /**
     * In case the PedidoPreferenciaUsuario found by the `where` argument doesn't exist, create a new PedidoPreferenciaUsuario with this data.
     */
    create: XOR<PedidoPreferenciaUsuarioCreateInput, PedidoPreferenciaUsuarioUncheckedCreateInput>
    /**
     * In case the PedidoPreferenciaUsuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoPreferenciaUsuarioUpdateInput, PedidoPreferenciaUsuarioUncheckedUpdateInput>
  }

  /**
   * PedidoPreferenciaUsuario delete
   */
  export type PedidoPreferenciaUsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
    /**
     * Filter which PedidoPreferenciaUsuario to delete.
     */
    where: PedidoPreferenciaUsuarioWhereUniqueInput
  }

  /**
   * PedidoPreferenciaUsuario deleteMany
   */
  export type PedidoPreferenciaUsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoPreferenciaUsuarios to delete
     */
    where?: PedidoPreferenciaUsuarioWhereInput
  }

  /**
   * PedidoPreferenciaUsuario without action
   */
  export type PedidoPreferenciaUsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaUsuario
     */
    select?: PedidoPreferenciaUsuarioSelect<ExtArgs> | null
  }


  /**
   * Model PedidoPreferenciaPadrao
   */

  export type AggregatePedidoPreferenciaPadrao = {
    _count: PedidoPreferenciaPadraoCountAggregateOutputType | null
    _min: PedidoPreferenciaPadraoMinAggregateOutputType | null
    _max: PedidoPreferenciaPadraoMaxAggregateOutputType | null
  }

  export type PedidoPreferenciaPadraoMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    updated_at: Date | null
  }

  export type PedidoPreferenciaPadraoMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_id: string | null
    updated_at: Date | null
  }

  export type PedidoPreferenciaPadraoCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_id: number
    colunas_visiveis: number
    colunas_largura: number
    updated_at: number
    _all: number
  }


  export type PedidoPreferenciaPadraoMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    updated_at?: true
  }

  export type PedidoPreferenciaPadraoMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    updated_at?: true
  }

  export type PedidoPreferenciaPadraoCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_id?: true
    colunas_visiveis?: true
    colunas_largura?: true
    updated_at?: true
    _all?: true
  }

  export type PedidoPreferenciaPadraoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoPreferenciaPadrao to aggregate.
     */
    where?: PedidoPreferenciaPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaPadraos to fetch.
     */
    orderBy?: PedidoPreferenciaPadraoOrderByWithRelationInput | PedidoPreferenciaPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PedidoPreferenciaPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PedidoPreferenciaPadraos
    **/
    _count?: true | PedidoPreferenciaPadraoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PedidoPreferenciaPadraoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PedidoPreferenciaPadraoMaxAggregateInputType
  }

  export type GetPedidoPreferenciaPadraoAggregateType<T extends PedidoPreferenciaPadraoAggregateArgs> = {
        [P in keyof T & keyof AggregatePedidoPreferenciaPadrao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePedidoPreferenciaPadrao[P]>
      : GetScalarType<T[P], AggregatePedidoPreferenciaPadrao[P]>
  }




  export type PedidoPreferenciaPadraoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PedidoPreferenciaPadraoWhereInput
    orderBy?: PedidoPreferenciaPadraoOrderByWithAggregationInput | PedidoPreferenciaPadraoOrderByWithAggregationInput[]
    by: PedidoPreferenciaPadraoScalarFieldEnum[] | PedidoPreferenciaPadraoScalarFieldEnum
    having?: PedidoPreferenciaPadraoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PedidoPreferenciaPadraoCountAggregateInputType | true
    _min?: PedidoPreferenciaPadraoMinAggregateInputType
    _max?: PedidoPreferenciaPadraoMaxAggregateInputType
  }

  export type PedidoPreferenciaPadraoGroupByOutputType = {
    id: string
    tenant_id: string
    product_id: string | null
    colunas_visiveis: string[]
    colunas_largura: JsonValue | null
    updated_at: Date
    _count: PedidoPreferenciaPadraoCountAggregateOutputType | null
    _min: PedidoPreferenciaPadraoMinAggregateOutputType | null
    _max: PedidoPreferenciaPadraoMaxAggregateOutputType | null
  }

  type GetPedidoPreferenciaPadraoGroupByPayload<T extends PedidoPreferenciaPadraoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PedidoPreferenciaPadraoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PedidoPreferenciaPadraoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PedidoPreferenciaPadraoGroupByOutputType[P]>
            : GetScalarType<T[P], PedidoPreferenciaPadraoGroupByOutputType[P]>
        }
      >
    >


  export type PedidoPreferenciaPadraoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["pedidoPreferenciaPadrao"]>

  export type PedidoPreferenciaPadraoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["pedidoPreferenciaPadrao"]>

  export type PedidoPreferenciaPadraoSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_id?: boolean
    colunas_visiveis?: boolean
    colunas_largura?: boolean
    updated_at?: boolean
  }


  export type $PedidoPreferenciaPadraoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PedidoPreferenciaPadrao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_id: string | null
      colunas_visiveis: string[]
      colunas_largura: Prisma.JsonValue | null
      updated_at: Date
    }, ExtArgs["result"]["pedidoPreferenciaPadrao"]>
    composites: {}
  }

  type PedidoPreferenciaPadraoGetPayload<S extends boolean | null | undefined | PedidoPreferenciaPadraoDefaultArgs> = $Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload, S>

  type PedidoPreferenciaPadraoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PedidoPreferenciaPadraoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PedidoPreferenciaPadraoCountAggregateInputType | true
    }

  export interface PedidoPreferenciaPadraoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PedidoPreferenciaPadrao'], meta: { name: 'PedidoPreferenciaPadrao' } }
    /**
     * Find zero or one PedidoPreferenciaPadrao that matches the filter.
     * @param {PedidoPreferenciaPadraoFindUniqueArgs} args - Arguments to find a PedidoPreferenciaPadrao
     * @example
     * // Get one PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PedidoPreferenciaPadraoFindUniqueArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoFindUniqueArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PedidoPreferenciaPadrao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PedidoPreferenciaPadraoFindUniqueOrThrowArgs} args - Arguments to find a PedidoPreferenciaPadrao
     * @example
     * // Get one PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PedidoPreferenciaPadraoFindUniqueOrThrowArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PedidoPreferenciaPadrao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoFindFirstArgs} args - Arguments to find a PedidoPreferenciaPadrao
     * @example
     * // Get one PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PedidoPreferenciaPadraoFindFirstArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoFindFirstArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PedidoPreferenciaPadrao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoFindFirstOrThrowArgs} args - Arguments to find a PedidoPreferenciaPadrao
     * @example
     * // Get one PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PedidoPreferenciaPadraoFindFirstOrThrowArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PedidoPreferenciaPadraos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PedidoPreferenciaPadraos
     * const pedidoPreferenciaPadraos = await prisma.pedidoPreferenciaPadrao.findMany()
     * 
     * // Get first 10 PedidoPreferenciaPadraos
     * const pedidoPreferenciaPadraos = await prisma.pedidoPreferenciaPadrao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pedidoPreferenciaPadraoWithIdOnly = await prisma.pedidoPreferenciaPadrao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PedidoPreferenciaPadraoFindManyArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PedidoPreferenciaPadrao.
     * @param {PedidoPreferenciaPadraoCreateArgs} args - Arguments to create a PedidoPreferenciaPadrao.
     * @example
     * // Create one PedidoPreferenciaPadrao
     * const PedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.create({
     *   data: {
     *     // ... data to create a PedidoPreferenciaPadrao
     *   }
     * })
     * 
     */
    create<T extends PedidoPreferenciaPadraoCreateArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoCreateArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PedidoPreferenciaPadraos.
     * @param {PedidoPreferenciaPadraoCreateManyArgs} args - Arguments to create many PedidoPreferenciaPadraos.
     * @example
     * // Create many PedidoPreferenciaPadraos
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PedidoPreferenciaPadraoCreateManyArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PedidoPreferenciaPadraos and returns the data saved in the database.
     * @param {PedidoPreferenciaPadraoCreateManyAndReturnArgs} args - Arguments to create many PedidoPreferenciaPadraos.
     * @example
     * // Create many PedidoPreferenciaPadraos
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PedidoPreferenciaPadraos and only return the `id`
     * const pedidoPreferenciaPadraoWithIdOnly = await prisma.pedidoPreferenciaPadrao.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PedidoPreferenciaPadraoCreateManyAndReturnArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PedidoPreferenciaPadrao.
     * @param {PedidoPreferenciaPadraoDeleteArgs} args - Arguments to delete one PedidoPreferenciaPadrao.
     * @example
     * // Delete one PedidoPreferenciaPadrao
     * const PedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.delete({
     *   where: {
     *     // ... filter to delete one PedidoPreferenciaPadrao
     *   }
     * })
     * 
     */
    delete<T extends PedidoPreferenciaPadraoDeleteArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoDeleteArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PedidoPreferenciaPadrao.
     * @param {PedidoPreferenciaPadraoUpdateArgs} args - Arguments to update one PedidoPreferenciaPadrao.
     * @example
     * // Update one PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PedidoPreferenciaPadraoUpdateArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoUpdateArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PedidoPreferenciaPadraos.
     * @param {PedidoPreferenciaPadraoDeleteManyArgs} args - Arguments to filter PedidoPreferenciaPadraos to delete.
     * @example
     * // Delete a few PedidoPreferenciaPadraos
     * const { count } = await prisma.pedidoPreferenciaPadrao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PedidoPreferenciaPadraoDeleteManyArgs>(args?: SelectSubset<T, PedidoPreferenciaPadraoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PedidoPreferenciaPadraos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PedidoPreferenciaPadraos
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PedidoPreferenciaPadraoUpdateManyArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PedidoPreferenciaPadrao.
     * @param {PedidoPreferenciaPadraoUpsertArgs} args - Arguments to update or create a PedidoPreferenciaPadrao.
     * @example
     * // Update or create a PedidoPreferenciaPadrao
     * const pedidoPreferenciaPadrao = await prisma.pedidoPreferenciaPadrao.upsert({
     *   create: {
     *     // ... data to create a PedidoPreferenciaPadrao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PedidoPreferenciaPadrao we want to update
     *   }
     * })
     */
    upsert<T extends PedidoPreferenciaPadraoUpsertArgs>(args: SelectSubset<T, PedidoPreferenciaPadraoUpsertArgs<ExtArgs>>): Prisma__PedidoPreferenciaPadraoClient<$Result.GetResult<Prisma.$PedidoPreferenciaPadraoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PedidoPreferenciaPadraos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoCountArgs} args - Arguments to filter PedidoPreferenciaPadraos to count.
     * @example
     * // Count the number of PedidoPreferenciaPadraos
     * const count = await prisma.pedidoPreferenciaPadrao.count({
     *   where: {
     *     // ... the filter for the PedidoPreferenciaPadraos we want to count
     *   }
     * })
    **/
    count<T extends PedidoPreferenciaPadraoCountArgs>(
      args?: Subset<T, PedidoPreferenciaPadraoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PedidoPreferenciaPadraoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PedidoPreferenciaPadrao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PedidoPreferenciaPadraoAggregateArgs>(args: Subset<T, PedidoPreferenciaPadraoAggregateArgs>): Prisma.PrismaPromise<GetPedidoPreferenciaPadraoAggregateType<T>>

    /**
     * Group by PedidoPreferenciaPadrao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PedidoPreferenciaPadraoGroupByArgs} args - Group by arguments.
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
      T extends PedidoPreferenciaPadraoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PedidoPreferenciaPadraoGroupByArgs['orderBy'] }
        : { orderBy?: PedidoPreferenciaPadraoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PedidoPreferenciaPadraoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPedidoPreferenciaPadraoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PedidoPreferenciaPadrao model
   */
  readonly fields: PedidoPreferenciaPadraoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PedidoPreferenciaPadrao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PedidoPreferenciaPadraoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PedidoPreferenciaPadrao model
   */ 
  interface PedidoPreferenciaPadraoFieldRefs {
    readonly id: FieldRef<"PedidoPreferenciaPadrao", 'String'>
    readonly tenant_id: FieldRef<"PedidoPreferenciaPadrao", 'String'>
    readonly product_id: FieldRef<"PedidoPreferenciaPadrao", 'String'>
    readonly colunas_visiveis: FieldRef<"PedidoPreferenciaPadrao", 'String[]'>
    readonly colunas_largura: FieldRef<"PedidoPreferenciaPadrao", 'Json'>
    readonly updated_at: FieldRef<"PedidoPreferenciaPadrao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PedidoPreferenciaPadrao findUnique
   */
  export type PedidoPreferenciaPadraoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaPadrao to fetch.
     */
    where: PedidoPreferenciaPadraoWhereUniqueInput
  }

  /**
   * PedidoPreferenciaPadrao findUniqueOrThrow
   */
  export type PedidoPreferenciaPadraoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaPadrao to fetch.
     */
    where: PedidoPreferenciaPadraoWhereUniqueInput
  }

  /**
   * PedidoPreferenciaPadrao findFirst
   */
  export type PedidoPreferenciaPadraoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaPadrao to fetch.
     */
    where?: PedidoPreferenciaPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaPadraos to fetch.
     */
    orderBy?: PedidoPreferenciaPadraoOrderByWithRelationInput | PedidoPreferenciaPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoPreferenciaPadraos.
     */
    cursor?: PedidoPreferenciaPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoPreferenciaPadraos.
     */
    distinct?: PedidoPreferenciaPadraoScalarFieldEnum | PedidoPreferenciaPadraoScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaPadrao findFirstOrThrow
   */
  export type PedidoPreferenciaPadraoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaPadrao to fetch.
     */
    where?: PedidoPreferenciaPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaPadraos to fetch.
     */
    orderBy?: PedidoPreferenciaPadraoOrderByWithRelationInput | PedidoPreferenciaPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PedidoPreferenciaPadraos.
     */
    cursor?: PedidoPreferenciaPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaPadraos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PedidoPreferenciaPadraos.
     */
    distinct?: PedidoPreferenciaPadraoScalarFieldEnum | PedidoPreferenciaPadraoScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaPadrao findMany
   */
  export type PedidoPreferenciaPadraoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter, which PedidoPreferenciaPadraos to fetch.
     */
    where?: PedidoPreferenciaPadraoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PedidoPreferenciaPadraos to fetch.
     */
    orderBy?: PedidoPreferenciaPadraoOrderByWithRelationInput | PedidoPreferenciaPadraoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PedidoPreferenciaPadraos.
     */
    cursor?: PedidoPreferenciaPadraoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PedidoPreferenciaPadraos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PedidoPreferenciaPadraos.
     */
    skip?: number
    distinct?: PedidoPreferenciaPadraoScalarFieldEnum | PedidoPreferenciaPadraoScalarFieldEnum[]
  }

  /**
   * PedidoPreferenciaPadrao create
   */
  export type PedidoPreferenciaPadraoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * The data needed to create a PedidoPreferenciaPadrao.
     */
    data: XOR<PedidoPreferenciaPadraoCreateInput, PedidoPreferenciaPadraoUncheckedCreateInput>
  }

  /**
   * PedidoPreferenciaPadrao createMany
   */
  export type PedidoPreferenciaPadraoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PedidoPreferenciaPadraos.
     */
    data: PedidoPreferenciaPadraoCreateManyInput | PedidoPreferenciaPadraoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoPreferenciaPadrao createManyAndReturn
   */
  export type PedidoPreferenciaPadraoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PedidoPreferenciaPadraos.
     */
    data: PedidoPreferenciaPadraoCreateManyInput | PedidoPreferenciaPadraoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PedidoPreferenciaPadrao update
   */
  export type PedidoPreferenciaPadraoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * The data needed to update a PedidoPreferenciaPadrao.
     */
    data: XOR<PedidoPreferenciaPadraoUpdateInput, PedidoPreferenciaPadraoUncheckedUpdateInput>
    /**
     * Choose, which PedidoPreferenciaPadrao to update.
     */
    where: PedidoPreferenciaPadraoWhereUniqueInput
  }

  /**
   * PedidoPreferenciaPadrao updateMany
   */
  export type PedidoPreferenciaPadraoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PedidoPreferenciaPadraos.
     */
    data: XOR<PedidoPreferenciaPadraoUpdateManyMutationInput, PedidoPreferenciaPadraoUncheckedUpdateManyInput>
    /**
     * Filter which PedidoPreferenciaPadraos to update
     */
    where?: PedidoPreferenciaPadraoWhereInput
  }

  /**
   * PedidoPreferenciaPadrao upsert
   */
  export type PedidoPreferenciaPadraoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * The filter to search for the PedidoPreferenciaPadrao to update in case it exists.
     */
    where: PedidoPreferenciaPadraoWhereUniqueInput
    /**
     * In case the PedidoPreferenciaPadrao found by the `where` argument doesn't exist, create a new PedidoPreferenciaPadrao with this data.
     */
    create: XOR<PedidoPreferenciaPadraoCreateInput, PedidoPreferenciaPadraoUncheckedCreateInput>
    /**
     * In case the PedidoPreferenciaPadrao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PedidoPreferenciaPadraoUpdateInput, PedidoPreferenciaPadraoUncheckedUpdateInput>
  }

  /**
   * PedidoPreferenciaPadrao delete
   */
  export type PedidoPreferenciaPadraoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
    /**
     * Filter which PedidoPreferenciaPadrao to delete.
     */
    where: PedidoPreferenciaPadraoWhereUniqueInput
  }

  /**
   * PedidoPreferenciaPadrao deleteMany
   */
  export type PedidoPreferenciaPadraoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PedidoPreferenciaPadraos to delete
     */
    where?: PedidoPreferenciaPadraoWhereInput
  }

  /**
   * PedidoPreferenciaPadrao without action
   */
  export type PedidoPreferenciaPadraoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PedidoPreferenciaPadrao
     */
    select?: PedidoPreferenciaPadraoSelect<ExtArgs> | null
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

  export type ProcessoScalarFieldEnum = (typeof ProcessoScalarFieldEnum)[keyof typeof ProcessoScalarFieldEnum]


  export const ProcessoEtapaScalarFieldEnum: {
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

  export type ProcessoEtapaScalarFieldEnum = (typeof ProcessoEtapaScalarFieldEnum)[keyof typeof ProcessoEtapaScalarFieldEnum]


  export const PedidoScalarFieldEnum: {
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

  export type PedidoScalarFieldEnum = (typeof PedidoScalarFieldEnum)[keyof typeof PedidoScalarFieldEnum]


  export const PedidoItemScalarFieldEnum: {
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

  export type PedidoItemScalarFieldEnum = (typeof PedidoItemScalarFieldEnum)[keyof typeof PedidoItemScalarFieldEnum]


  export const FollowUpScalarFieldEnum: {
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

  export type FollowUpScalarFieldEnum = (typeof FollowUpScalarFieldEnum)[keyof typeof FollowUpScalarFieldEnum]


  export const DocumentoScalarFieldEnum: {
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

  export type DocumentoScalarFieldEnum = (typeof DocumentoScalarFieldEnum)[keyof typeof DocumentoScalarFieldEnum]


  export const EstimativaCustoScalarFieldEnum: {
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

  export type EstimativaCustoScalarFieldEnum = (typeof EstimativaCustoScalarFieldEnum)[keyof typeof EstimativaCustoScalarFieldEnum]


  export const DadosTecnicosScalarFieldEnum: {
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

  export type DadosTecnicosScalarFieldEnum = (typeof DadosTecnicosScalarFieldEnum)[keyof typeof DadosTecnicosScalarFieldEnum]


  export const PedidoStatusScalarFieldEnum: {
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

  export type PedidoStatusScalarFieldEnum = (typeof PedidoStatusScalarFieldEnum)[keyof typeof PedidoStatusScalarFieldEnum]


  export const PedidoColunaScalarFieldEnum: {
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

  export type PedidoColunaScalarFieldEnum = (typeof PedidoColunaScalarFieldEnum)[keyof typeof PedidoColunaScalarFieldEnum]


  export const PedidoPreferenciaUsuarioScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_id: 'product_id',
    user_id: 'user_id',
    colunas_visiveis: 'colunas_visiveis',
    colunas_largura: 'colunas_largura',
    updated_at: 'updated_at'
  };

  export type PedidoPreferenciaUsuarioScalarFieldEnum = (typeof PedidoPreferenciaUsuarioScalarFieldEnum)[keyof typeof PedidoPreferenciaUsuarioScalarFieldEnum]


  export const PedidoPreferenciaPadraoScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_id: 'product_id',
    colunas_visiveis: 'colunas_visiveis',
    colunas_largura: 'colunas_largura',
    updated_at: 'updated_at'
  };

  export type PedidoPreferenciaPadraoScalarFieldEnum = (typeof PedidoPreferenciaPadraoScalarFieldEnum)[keyof typeof PedidoPreferenciaPadraoScalarFieldEnum]


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


  export type ProcessoWhereInput = {
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    id?: StringFilter<"Processo"> | string
    tenant_id?: StringFilter<"Processo"> | string
    product_id?: StringNullableFilter<"Processo"> | string | null
    user_id?: StringNullableFilter<"Processo"> | string | null
    numero?: StringFilter<"Processo"> | string
    referencia_interna?: StringNullableFilter<"Processo"> | string | null
    referencia_dati?: StringNullableFilter<"Processo"> | string | null
    status?: StringFilter<"Processo"> | string
    tipo?: StringFilter<"Processo"> | string
    responsavel_id?: StringNullableFilter<"Processo"> | string | null
    vendedor_id?: StringNullableFilter<"Processo"> | string | null
    setor_responsavel?: StringNullableFilter<"Processo"> | string | null
    created_at?: DateTimeFilter<"Processo"> | Date | string
    updated_at?: DateTimeFilter<"Processo"> | Date | string
    etapas?: ProcessoEtapaListRelationFilter
    pedidos?: PedidoListRelationFilter
    followUps?: FollowUpListRelationFilter
    documentos?: DocumentoListRelationFilter
    estimativaCusto?: XOR<EstimativaCustoNullableRelationFilter, EstimativaCustoWhereInput> | null
    dadosTecnicos?: XOR<DadosTecnicosNullableRelationFilter, DadosTecnicosWhereInput> | null
  }

  export type ProcessoOrderByWithRelationInput = {
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
    etapas?: ProcessoEtapaOrderByRelationAggregateInput
    pedidos?: PedidoOrderByRelationAggregateInput
    followUps?: FollowUpOrderByRelationAggregateInput
    documentos?: DocumentoOrderByRelationAggregateInput
    estimativaCusto?: EstimativaCustoOrderByWithRelationInput
    dadosTecnicos?: DadosTecnicosOrderByWithRelationInput
  }

  export type ProcessoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    tenant_id?: StringFilter<"Processo"> | string
    product_id?: StringNullableFilter<"Processo"> | string | null
    user_id?: StringNullableFilter<"Processo"> | string | null
    numero?: StringFilter<"Processo"> | string
    referencia_interna?: StringNullableFilter<"Processo"> | string | null
    referencia_dati?: StringNullableFilter<"Processo"> | string | null
    status?: StringFilter<"Processo"> | string
    tipo?: StringFilter<"Processo"> | string
    responsavel_id?: StringNullableFilter<"Processo"> | string | null
    vendedor_id?: StringNullableFilter<"Processo"> | string | null
    setor_responsavel?: StringNullableFilter<"Processo"> | string | null
    created_at?: DateTimeFilter<"Processo"> | Date | string
    updated_at?: DateTimeFilter<"Processo"> | Date | string
    etapas?: ProcessoEtapaListRelationFilter
    pedidos?: PedidoListRelationFilter
    followUps?: FollowUpListRelationFilter
    documentos?: DocumentoListRelationFilter
    estimativaCusto?: XOR<EstimativaCustoNullableRelationFilter, EstimativaCustoWhereInput> | null
    dadosTecnicos?: XOR<DadosTecnicosNullableRelationFilter, DadosTecnicosWhereInput> | null
  }, "id">

  export type ProcessoOrderByWithAggregationInput = {
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
    _count?: ProcessoCountOrderByAggregateInput
    _max?: ProcessoMaxOrderByAggregateInput
    _min?: ProcessoMinOrderByAggregateInput
  }

  export type ProcessoScalarWhereWithAggregatesInput = {
    AND?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    OR?: ProcessoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Processo"> | string
    tenant_id?: StringWithAggregatesFilter<"Processo"> | string
    product_id?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    numero?: StringWithAggregatesFilter<"Processo"> | string
    referencia_interna?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    referencia_dati?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    status?: StringWithAggregatesFilter<"Processo"> | string
    tipo?: StringWithAggregatesFilter<"Processo"> | string
    responsavel_id?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    vendedor_id?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    setor_responsavel?: StringNullableWithAggregatesFilter<"Processo"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Processo"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Processo"> | Date | string
  }

  export type ProcessoEtapaWhereInput = {
    AND?: ProcessoEtapaWhereInput | ProcessoEtapaWhereInput[]
    OR?: ProcessoEtapaWhereInput[]
    NOT?: ProcessoEtapaWhereInput | ProcessoEtapaWhereInput[]
    id?: StringFilter<"ProcessoEtapa"> | string
    tenant_id?: StringFilter<"ProcessoEtapa"> | string
    product_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    processo_id?: StringFilter<"ProcessoEtapa"> | string
    nome?: StringFilter<"ProcessoEtapa"> | string
    status?: StringFilter<"ProcessoEtapa"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapa"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type ProcessoEtapaOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
  }

  export type ProcessoEtapaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoEtapaWhereInput | ProcessoEtapaWhereInput[]
    OR?: ProcessoEtapaWhereInput[]
    NOT?: ProcessoEtapaWhereInput | ProcessoEtapaWhereInput[]
    tenant_id?: StringFilter<"ProcessoEtapa"> | string
    product_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    processo_id?: StringFilter<"ProcessoEtapa"> | string
    nome?: StringFilter<"ProcessoEtapa"> | string
    status?: StringFilter<"ProcessoEtapa"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapa"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id">

  export type ProcessoEtapaOrderByWithAggregationInput = {
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
    _count?: ProcessoEtapaCountOrderByAggregateInput
    _max?: ProcessoEtapaMaxOrderByAggregateInput
    _min?: ProcessoEtapaMinOrderByAggregateInput
  }

  export type ProcessoEtapaScalarWhereWithAggregatesInput = {
    AND?: ProcessoEtapaScalarWhereWithAggregatesInput | ProcessoEtapaScalarWhereWithAggregatesInput[]
    OR?: ProcessoEtapaScalarWhereWithAggregatesInput[]
    NOT?: ProcessoEtapaScalarWhereWithAggregatesInput | ProcessoEtapaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProcessoEtapa"> | string
    tenant_id?: StringWithAggregatesFilter<"ProcessoEtapa"> | string
    product_id?: StringNullableWithAggregatesFilter<"ProcessoEtapa"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"ProcessoEtapa"> | string | null
    processo_id?: StringWithAggregatesFilter<"ProcessoEtapa"> | string
    nome?: StringWithAggregatesFilter<"ProcessoEtapa"> | string
    status?: StringWithAggregatesFilter<"ProcessoEtapa"> | string
    data_prevista?: DateTimeNullableWithAggregatesFilter<"ProcessoEtapa"> | Date | string | null
    data_realizada?: DateTimeNullableWithAggregatesFilter<"ProcessoEtapa"> | Date | string | null
    observacao?: StringNullableWithAggregatesFilter<"ProcessoEtapa"> | string | null
  }

  export type PedidoWhereInput = {
    AND?: PedidoWhereInput | PedidoWhereInput[]
    OR?: PedidoWhereInput[]
    NOT?: PedidoWhereInput | PedidoWhereInput[]
    id?: StringFilter<"Pedido"> | string
    tenant_id?: StringFilter<"Pedido"> | string
    product_id?: StringNullableFilter<"Pedido"> | string | null
    user_id?: StringNullableFilter<"Pedido"> | string | null
    processo_id?: StringFilter<"Pedido"> | string
    numero?: StringFilter<"Pedido"> | string
    exportador_nome?: StringNullableFilter<"Pedido"> | string | null
    exportador_pais?: StringNullableFilter<"Pedido"> | string | null
    valor_fob?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"Pedido"> | string
    peso_bruto?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"Pedido"> | string
    status_id?: StringNullableFilter<"Pedido"> | string | null
    campos_custom?: JsonNullableFilter<"Pedido">
    created_at?: DateTimeFilter<"Pedido"> | Date | string
    updated_at?: DateTimeFilter<"Pedido"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
    itens?: PedidoItemListRelationFilter
  }

  export type PedidoOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
    itens?: PedidoItemOrderByRelationAggregateInput
  }

  export type PedidoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PedidoWhereInput | PedidoWhereInput[]
    OR?: PedidoWhereInput[]
    NOT?: PedidoWhereInput | PedidoWhereInput[]
    tenant_id?: StringFilter<"Pedido"> | string
    product_id?: StringNullableFilter<"Pedido"> | string | null
    user_id?: StringNullableFilter<"Pedido"> | string | null
    processo_id?: StringFilter<"Pedido"> | string
    numero?: StringFilter<"Pedido"> | string
    exportador_nome?: StringNullableFilter<"Pedido"> | string | null
    exportador_pais?: StringNullableFilter<"Pedido"> | string | null
    valor_fob?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"Pedido"> | string
    peso_bruto?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"Pedido"> | string
    status_id?: StringNullableFilter<"Pedido"> | string | null
    campos_custom?: JsonNullableFilter<"Pedido">
    created_at?: DateTimeFilter<"Pedido"> | Date | string
    updated_at?: DateTimeFilter<"Pedido"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
    itens?: PedidoItemListRelationFilter
  }, "id">

  export type PedidoOrderByWithAggregationInput = {
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
    _count?: PedidoCountOrderByAggregateInput
    _avg?: PedidoAvgOrderByAggregateInput
    _max?: PedidoMaxOrderByAggregateInput
    _min?: PedidoMinOrderByAggregateInput
    _sum?: PedidoSumOrderByAggregateInput
  }

  export type PedidoScalarWhereWithAggregatesInput = {
    AND?: PedidoScalarWhereWithAggregatesInput | PedidoScalarWhereWithAggregatesInput[]
    OR?: PedidoScalarWhereWithAggregatesInput[]
    NOT?: PedidoScalarWhereWithAggregatesInput | PedidoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pedido"> | string
    tenant_id?: StringWithAggregatesFilter<"Pedido"> | string
    product_id?: StringNullableWithAggregatesFilter<"Pedido"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"Pedido"> | string | null
    processo_id?: StringWithAggregatesFilter<"Pedido"> | string
    numero?: StringWithAggregatesFilter<"Pedido"> | string
    exportador_nome?: StringNullableWithAggregatesFilter<"Pedido"> | string | null
    exportador_pais?: StringNullableWithAggregatesFilter<"Pedido"> | string | null
    valor_fob?: DecimalWithAggregatesFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringWithAggregatesFilter<"Pedido"> | string
    peso_bruto?: DecimalWithAggregatesFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    status?: StringWithAggregatesFilter<"Pedido"> | string
    status_id?: StringNullableWithAggregatesFilter<"Pedido"> | string | null
    campos_custom?: JsonNullableWithAggregatesFilter<"Pedido">
    created_at?: DateTimeWithAggregatesFilter<"Pedido"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Pedido"> | Date | string
  }

  export type PedidoItemWhereInput = {
    AND?: PedidoItemWhereInput | PedidoItemWhereInput[]
    OR?: PedidoItemWhereInput[]
    NOT?: PedidoItemWhereInput | PedidoItemWhereInput[]
    id?: StringFilter<"PedidoItem"> | string
    tenant_id?: StringFilter<"PedidoItem"> | string
    product_id?: StringNullableFilter<"PedidoItem"> | string | null
    user_id?: StringNullableFilter<"PedidoItem"> | string | null
    pedido_id?: StringFilter<"PedidoItem"> | string
    numero_item?: StringFilter<"PedidoItem"> | string
    descricao?: StringFilter<"PedidoItem"> | string
    ncm?: StringNullableFilter<"PedidoItem"> | string | null
    quantidade?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"PedidoItem"> | string
    valor_unitario?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"PedidoItem"> | string
    status_li?: StringFilter<"PedidoItem"> | string
    campos_custom?: JsonNullableFilter<"PedidoItem">
    created_at?: DateTimeFilter<"PedidoItem"> | Date | string
    updated_at?: DateTimeFilter<"PedidoItem"> | Date | string
    pedido?: XOR<PedidoRelationFilter, PedidoWhereInput>
  }

  export type PedidoItemOrderByWithRelationInput = {
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
    pedido?: PedidoOrderByWithRelationInput
  }

  export type PedidoItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PedidoItemWhereInput | PedidoItemWhereInput[]
    OR?: PedidoItemWhereInput[]
    NOT?: PedidoItemWhereInput | PedidoItemWhereInput[]
    tenant_id?: StringFilter<"PedidoItem"> | string
    product_id?: StringNullableFilter<"PedidoItem"> | string | null
    user_id?: StringNullableFilter<"PedidoItem"> | string | null
    pedido_id?: StringFilter<"PedidoItem"> | string
    numero_item?: StringFilter<"PedidoItem"> | string
    descricao?: StringFilter<"PedidoItem"> | string
    ncm?: StringNullableFilter<"PedidoItem"> | string | null
    quantidade?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"PedidoItem"> | string
    valor_unitario?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"PedidoItem"> | string
    status_li?: StringFilter<"PedidoItem"> | string
    campos_custom?: JsonNullableFilter<"PedidoItem">
    created_at?: DateTimeFilter<"PedidoItem"> | Date | string
    updated_at?: DateTimeFilter<"PedidoItem"> | Date | string
    pedido?: XOR<PedidoRelationFilter, PedidoWhereInput>
  }, "id">

  export type PedidoItemOrderByWithAggregationInput = {
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
    _count?: PedidoItemCountOrderByAggregateInput
    _avg?: PedidoItemAvgOrderByAggregateInput
    _max?: PedidoItemMaxOrderByAggregateInput
    _min?: PedidoItemMinOrderByAggregateInput
    _sum?: PedidoItemSumOrderByAggregateInput
  }

  export type PedidoItemScalarWhereWithAggregatesInput = {
    AND?: PedidoItemScalarWhereWithAggregatesInput | PedidoItemScalarWhereWithAggregatesInput[]
    OR?: PedidoItemScalarWhereWithAggregatesInput[]
    NOT?: PedidoItemScalarWhereWithAggregatesInput | PedidoItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PedidoItem"> | string
    tenant_id?: StringWithAggregatesFilter<"PedidoItem"> | string
    product_id?: StringNullableWithAggregatesFilter<"PedidoItem"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"PedidoItem"> | string | null
    pedido_id?: StringWithAggregatesFilter<"PedidoItem"> | string
    numero_item?: StringWithAggregatesFilter<"PedidoItem"> | string
    descricao?: StringWithAggregatesFilter<"PedidoItem"> | string
    ncm?: StringNullableWithAggregatesFilter<"PedidoItem"> | string | null
    quantidade?: DecimalWithAggregatesFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    unidade?: StringWithAggregatesFilter<"PedidoItem"> | string
    valor_unitario?: DecimalWithAggregatesFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalWithAggregatesFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    moeda?: StringWithAggregatesFilter<"PedidoItem"> | string
    status_li?: StringWithAggregatesFilter<"PedidoItem"> | string
    campos_custom?: JsonNullableWithAggregatesFilter<"PedidoItem">
    created_at?: DateTimeWithAggregatesFilter<"PedidoItem"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PedidoItem"> | Date | string
  }

  export type FollowUpWhereInput = {
    AND?: FollowUpWhereInput | FollowUpWhereInput[]
    OR?: FollowUpWhereInput[]
    NOT?: FollowUpWhereInput | FollowUpWhereInput[]
    id?: StringFilter<"FollowUp"> | string
    tenant_id?: StringFilter<"FollowUp"> | string
    product_id?: StringNullableFilter<"FollowUp"> | string | null
    user_id?: StringNullableFilter<"FollowUp"> | string | null
    processo_id?: StringFilter<"FollowUp"> | string
    titulo?: StringFilter<"FollowUp"> | string
    descricao?: StringNullableFilter<"FollowUp"> | string | null
    tipo?: StringFilter<"FollowUp"> | string
    categoria?: StringFilter<"FollowUp"> | string
    usuario_id?: StringNullableFilter<"FollowUp"> | string | null
    usuario_nome?: StringNullableFilter<"FollowUp"> | string | null
    created_at?: DateTimeFilter<"FollowUp"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type FollowUpOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
  }

  export type FollowUpWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FollowUpWhereInput | FollowUpWhereInput[]
    OR?: FollowUpWhereInput[]
    NOT?: FollowUpWhereInput | FollowUpWhereInput[]
    tenant_id?: StringFilter<"FollowUp"> | string
    product_id?: StringNullableFilter<"FollowUp"> | string | null
    user_id?: StringNullableFilter<"FollowUp"> | string | null
    processo_id?: StringFilter<"FollowUp"> | string
    titulo?: StringFilter<"FollowUp"> | string
    descricao?: StringNullableFilter<"FollowUp"> | string | null
    tipo?: StringFilter<"FollowUp"> | string
    categoria?: StringFilter<"FollowUp"> | string
    usuario_id?: StringNullableFilter<"FollowUp"> | string | null
    usuario_nome?: StringNullableFilter<"FollowUp"> | string | null
    created_at?: DateTimeFilter<"FollowUp"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id">

  export type FollowUpOrderByWithAggregationInput = {
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
    _count?: FollowUpCountOrderByAggregateInput
    _max?: FollowUpMaxOrderByAggregateInput
    _min?: FollowUpMinOrderByAggregateInput
  }

  export type FollowUpScalarWhereWithAggregatesInput = {
    AND?: FollowUpScalarWhereWithAggregatesInput | FollowUpScalarWhereWithAggregatesInput[]
    OR?: FollowUpScalarWhereWithAggregatesInput[]
    NOT?: FollowUpScalarWhereWithAggregatesInput | FollowUpScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FollowUp"> | string
    tenant_id?: StringWithAggregatesFilter<"FollowUp"> | string
    product_id?: StringNullableWithAggregatesFilter<"FollowUp"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"FollowUp"> | string | null
    processo_id?: StringWithAggregatesFilter<"FollowUp"> | string
    titulo?: StringWithAggregatesFilter<"FollowUp"> | string
    descricao?: StringNullableWithAggregatesFilter<"FollowUp"> | string | null
    tipo?: StringWithAggregatesFilter<"FollowUp"> | string
    categoria?: StringWithAggregatesFilter<"FollowUp"> | string
    usuario_id?: StringNullableWithAggregatesFilter<"FollowUp"> | string | null
    usuario_nome?: StringNullableWithAggregatesFilter<"FollowUp"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"FollowUp"> | Date | string
  }

  export type DocumentoWhereInput = {
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    id?: StringFilter<"Documento"> | string
    tenant_id?: StringFilter<"Documento"> | string
    product_id?: StringNullableFilter<"Documento"> | string | null
    user_id?: StringNullableFilter<"Documento"> | string | null
    processo_id?: StringFilter<"Documento"> | string
    nome?: StringFilter<"Documento"> | string
    tipo_arquivo?: StringFilter<"Documento"> | string
    tamanho_bytes?: IntFilter<"Documento"> | number
    url?: StringFilter<"Documento"> | string
    categoria?: StringFilter<"Documento"> | string
    created_at?: DateTimeFilter<"Documento"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type DocumentoOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
  }

  export type DocumentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    tenant_id?: StringFilter<"Documento"> | string
    product_id?: StringNullableFilter<"Documento"> | string | null
    user_id?: StringNullableFilter<"Documento"> | string | null
    processo_id?: StringFilter<"Documento"> | string
    nome?: StringFilter<"Documento"> | string
    tipo_arquivo?: StringFilter<"Documento"> | string
    tamanho_bytes?: IntFilter<"Documento"> | number
    url?: StringFilter<"Documento"> | string
    categoria?: StringFilter<"Documento"> | string
    created_at?: DateTimeFilter<"Documento"> | Date | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id">

  export type DocumentoOrderByWithAggregationInput = {
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
    _count?: DocumentoCountOrderByAggregateInput
    _avg?: DocumentoAvgOrderByAggregateInput
    _max?: DocumentoMaxOrderByAggregateInput
    _min?: DocumentoMinOrderByAggregateInput
    _sum?: DocumentoSumOrderByAggregateInput
  }

  export type DocumentoScalarWhereWithAggregatesInput = {
    AND?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    OR?: DocumentoScalarWhereWithAggregatesInput[]
    NOT?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Documento"> | string
    tenant_id?: StringWithAggregatesFilter<"Documento"> | string
    product_id?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    processo_id?: StringWithAggregatesFilter<"Documento"> | string
    nome?: StringWithAggregatesFilter<"Documento"> | string
    tipo_arquivo?: StringWithAggregatesFilter<"Documento"> | string
    tamanho_bytes?: IntWithAggregatesFilter<"Documento"> | number
    url?: StringWithAggregatesFilter<"Documento"> | string
    categoria?: StringWithAggregatesFilter<"Documento"> | string
    created_at?: DateTimeWithAggregatesFilter<"Documento"> | Date | string
  }

  export type EstimativaCustoWhereInput = {
    AND?: EstimativaCustoWhereInput | EstimativaCustoWhereInput[]
    OR?: EstimativaCustoWhereInput[]
    NOT?: EstimativaCustoWhereInput | EstimativaCustoWhereInput[]
    id?: StringFilter<"EstimativaCusto"> | string
    tenant_id?: StringFilter<"EstimativaCusto"> | string
    product_id?: StringNullableFilter<"EstimativaCusto"> | string | null
    user_id?: StringNullableFilter<"EstimativaCusto"> | string | null
    processo_id?: StringFilter<"EstimativaCusto"> | string
    impostos?: FloatFilter<"EstimativaCusto"> | number
    frete?: FloatFilter<"EstimativaCusto"> | number
    despacho?: FloatFilter<"EstimativaCusto"> | number
    outros?: FloatFilter<"EstimativaCusto"> | number
    total?: FloatFilter<"EstimativaCusto"> | number
    moeda?: StringFilter<"EstimativaCusto"> | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type EstimativaCustoOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
  }

  export type EstimativaCustoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    processo_id?: string
    AND?: EstimativaCustoWhereInput | EstimativaCustoWhereInput[]
    OR?: EstimativaCustoWhereInput[]
    NOT?: EstimativaCustoWhereInput | EstimativaCustoWhereInput[]
    tenant_id?: StringFilter<"EstimativaCusto"> | string
    product_id?: StringNullableFilter<"EstimativaCusto"> | string | null
    user_id?: StringNullableFilter<"EstimativaCusto"> | string | null
    impostos?: FloatFilter<"EstimativaCusto"> | number
    frete?: FloatFilter<"EstimativaCusto"> | number
    despacho?: FloatFilter<"EstimativaCusto"> | number
    outros?: FloatFilter<"EstimativaCusto"> | number
    total?: FloatFilter<"EstimativaCusto"> | number
    moeda?: StringFilter<"EstimativaCusto"> | string
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id" | "processo_id">

  export type EstimativaCustoOrderByWithAggregationInput = {
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
    _count?: EstimativaCustoCountOrderByAggregateInput
    _avg?: EstimativaCustoAvgOrderByAggregateInput
    _max?: EstimativaCustoMaxOrderByAggregateInput
    _min?: EstimativaCustoMinOrderByAggregateInput
    _sum?: EstimativaCustoSumOrderByAggregateInput
  }

  export type EstimativaCustoScalarWhereWithAggregatesInput = {
    AND?: EstimativaCustoScalarWhereWithAggregatesInput | EstimativaCustoScalarWhereWithAggregatesInput[]
    OR?: EstimativaCustoScalarWhereWithAggregatesInput[]
    NOT?: EstimativaCustoScalarWhereWithAggregatesInput | EstimativaCustoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EstimativaCusto"> | string
    tenant_id?: StringWithAggregatesFilter<"EstimativaCusto"> | string
    product_id?: StringNullableWithAggregatesFilter<"EstimativaCusto"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"EstimativaCusto"> | string | null
    processo_id?: StringWithAggregatesFilter<"EstimativaCusto"> | string
    impostos?: FloatWithAggregatesFilter<"EstimativaCusto"> | number
    frete?: FloatWithAggregatesFilter<"EstimativaCusto"> | number
    despacho?: FloatWithAggregatesFilter<"EstimativaCusto"> | number
    outros?: FloatWithAggregatesFilter<"EstimativaCusto"> | number
    total?: FloatWithAggregatesFilter<"EstimativaCusto"> | number
    moeda?: StringWithAggregatesFilter<"EstimativaCusto"> | string
  }

  export type DadosTecnicosWhereInput = {
    AND?: DadosTecnicosWhereInput | DadosTecnicosWhereInput[]
    OR?: DadosTecnicosWhereInput[]
    NOT?: DadosTecnicosWhereInput | DadosTecnicosWhereInput[]
    id?: StringFilter<"DadosTecnicos"> | string
    tenant_id?: StringFilter<"DadosTecnicos"> | string
    product_id?: StringNullableFilter<"DadosTecnicos"> | string | null
    user_id?: StringNullableFilter<"DadosTecnicos"> | string | null
    processo_id?: StringFilter<"DadosTecnicos"> | string
    importador_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    importador_cnpj?: StringNullableFilter<"DadosTecnicos"> | string | null
    importador_endereco?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_pais?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_endereco?: StringNullableFilter<"DadosTecnicos"> | string | null
    modal?: StringNullableFilter<"DadosTecnicos"> | string | null
    porto_embarque?: StringNullableFilter<"DadosTecnicos"> | string | null
    porto_destino?: StringNullableFilter<"DadosTecnicos"> | string | null
    navio_voo?: StringNullableFilter<"DadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    container_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    despachante_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    despachante_contato?: StringNullableFilter<"DadosTecnicos"> | string | null
    di_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    di_data?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    canal?: StringNullableFilter<"DadosTecnicos"> | string | null
    seguro_apolice?: StringNullableFilter<"DadosTecnicos"> | string | null
    seguro_valor?: FloatNullableFilter<"DadosTecnicos"> | number | null
    seguro_moeda?: StringNullableFilter<"DadosTecnicos"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }

  export type DadosTecnicosOrderByWithRelationInput = {
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
    processo?: ProcessoOrderByWithRelationInput
  }

  export type DadosTecnicosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    processo_id?: string
    AND?: DadosTecnicosWhereInput | DadosTecnicosWhereInput[]
    OR?: DadosTecnicosWhereInput[]
    NOT?: DadosTecnicosWhereInput | DadosTecnicosWhereInput[]
    tenant_id?: StringFilter<"DadosTecnicos"> | string
    product_id?: StringNullableFilter<"DadosTecnicos"> | string | null
    user_id?: StringNullableFilter<"DadosTecnicos"> | string | null
    importador_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    importador_cnpj?: StringNullableFilter<"DadosTecnicos"> | string | null
    importador_endereco?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_pais?: StringNullableFilter<"DadosTecnicos"> | string | null
    exportador_endereco?: StringNullableFilter<"DadosTecnicos"> | string | null
    modal?: StringNullableFilter<"DadosTecnicos"> | string | null
    porto_embarque?: StringNullableFilter<"DadosTecnicos"> | string | null
    porto_destino?: StringNullableFilter<"DadosTecnicos"> | string | null
    navio_voo?: StringNullableFilter<"DadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    container_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    despachante_nome?: StringNullableFilter<"DadosTecnicos"> | string | null
    despachante_contato?: StringNullableFilter<"DadosTecnicos"> | string | null
    di_numero?: StringNullableFilter<"DadosTecnicos"> | string | null
    di_data?: DateTimeNullableFilter<"DadosTecnicos"> | Date | string | null
    canal?: StringNullableFilter<"DadosTecnicos"> | string | null
    seguro_apolice?: StringNullableFilter<"DadosTecnicos"> | string | null
    seguro_valor?: FloatNullableFilter<"DadosTecnicos"> | number | null
    seguro_moeda?: StringNullableFilter<"DadosTecnicos"> | string | null
    processo?: XOR<ProcessoRelationFilter, ProcessoWhereInput>
  }, "id" | "processo_id">

  export type DadosTecnicosOrderByWithAggregationInput = {
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
    _count?: DadosTecnicosCountOrderByAggregateInput
    _avg?: DadosTecnicosAvgOrderByAggregateInput
    _max?: DadosTecnicosMaxOrderByAggregateInput
    _min?: DadosTecnicosMinOrderByAggregateInput
    _sum?: DadosTecnicosSumOrderByAggregateInput
  }

  export type DadosTecnicosScalarWhereWithAggregatesInput = {
    AND?: DadosTecnicosScalarWhereWithAggregatesInput | DadosTecnicosScalarWhereWithAggregatesInput[]
    OR?: DadosTecnicosScalarWhereWithAggregatesInput[]
    NOT?: DadosTecnicosScalarWhereWithAggregatesInput | DadosTecnicosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DadosTecnicos"> | string
    tenant_id?: StringWithAggregatesFilter<"DadosTecnicos"> | string
    product_id?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    user_id?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    processo_id?: StringWithAggregatesFilter<"DadosTecnicos"> | string
    importador_nome?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    importador_cnpj?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    importador_endereco?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    exportador_nome?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    exportador_pais?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    exportador_endereco?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    modal?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    porto_embarque?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    porto_destino?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    navio_voo?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    data_embarque?: DateTimeNullableWithAggregatesFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_prevista?: DateTimeNullableWithAggregatesFilter<"DadosTecnicos"> | Date | string | null
    data_chegada_real?: DateTimeNullableWithAggregatesFilter<"DadosTecnicos"> | Date | string | null
    bl_numero?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    container_numero?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    despachante_nome?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    despachante_contato?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    di_numero?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    di_data?: DateTimeNullableWithAggregatesFilter<"DadosTecnicos"> | Date | string | null
    canal?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    seguro_apolice?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
    seguro_valor?: FloatNullableWithAggregatesFilter<"DadosTecnicos"> | number | null
    seguro_moeda?: StringNullableWithAggregatesFilter<"DadosTecnicos"> | string | null
  }

  export type PedidoStatusWhereInput = {
    AND?: PedidoStatusWhereInput | PedidoStatusWhereInput[]
    OR?: PedidoStatusWhereInput[]
    NOT?: PedidoStatusWhereInput | PedidoStatusWhereInput[]
    id?: StringFilter<"PedidoStatus"> | string
    tenant_id?: StringFilter<"PedidoStatus"> | string
    product_id?: StringNullableFilter<"PedidoStatus"> | string | null
    nome?: StringFilter<"PedidoStatus"> | string
    rotulo?: StringFilter<"PedidoStatus"> | string
    cor?: StringFilter<"PedidoStatus"> | string
    icone?: StringNullableFilter<"PedidoStatus"> | string | null
    ordem?: IntFilter<"PedidoStatus"> | number
    is_padrao?: BoolFilter<"PedidoStatus"> | boolean
    is_sistema?: BoolFilter<"PedidoStatus"> | boolean
    created_at?: DateTimeFilter<"PedidoStatus"> | Date | string
    updated_at?: DateTimeFilter<"PedidoStatus"> | Date | string
  }

  export type PedidoStatusOrderByWithRelationInput = {
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

  export type PedidoStatusWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_nome?: PedidoStatusTenant_idNomeCompoundUniqueInput
    AND?: PedidoStatusWhereInput | PedidoStatusWhereInput[]
    OR?: PedidoStatusWhereInput[]
    NOT?: PedidoStatusWhereInput | PedidoStatusWhereInput[]
    tenant_id?: StringFilter<"PedidoStatus"> | string
    product_id?: StringNullableFilter<"PedidoStatus"> | string | null
    nome?: StringFilter<"PedidoStatus"> | string
    rotulo?: StringFilter<"PedidoStatus"> | string
    cor?: StringFilter<"PedidoStatus"> | string
    icone?: StringNullableFilter<"PedidoStatus"> | string | null
    ordem?: IntFilter<"PedidoStatus"> | number
    is_padrao?: BoolFilter<"PedidoStatus"> | boolean
    is_sistema?: BoolFilter<"PedidoStatus"> | boolean
    created_at?: DateTimeFilter<"PedidoStatus"> | Date | string
    updated_at?: DateTimeFilter<"PedidoStatus"> | Date | string
  }, "id" | "tenant_id_nome">

  export type PedidoStatusOrderByWithAggregationInput = {
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
    _count?: PedidoStatusCountOrderByAggregateInput
    _avg?: PedidoStatusAvgOrderByAggregateInput
    _max?: PedidoStatusMaxOrderByAggregateInput
    _min?: PedidoStatusMinOrderByAggregateInput
    _sum?: PedidoStatusSumOrderByAggregateInput
  }

  export type PedidoStatusScalarWhereWithAggregatesInput = {
    AND?: PedidoStatusScalarWhereWithAggregatesInput | PedidoStatusScalarWhereWithAggregatesInput[]
    OR?: PedidoStatusScalarWhereWithAggregatesInput[]
    NOT?: PedidoStatusScalarWhereWithAggregatesInput | PedidoStatusScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PedidoStatus"> | string
    tenant_id?: StringWithAggregatesFilter<"PedidoStatus"> | string
    product_id?: StringNullableWithAggregatesFilter<"PedidoStatus"> | string | null
    nome?: StringWithAggregatesFilter<"PedidoStatus"> | string
    rotulo?: StringWithAggregatesFilter<"PedidoStatus"> | string
    cor?: StringWithAggregatesFilter<"PedidoStatus"> | string
    icone?: StringNullableWithAggregatesFilter<"PedidoStatus"> | string | null
    ordem?: IntWithAggregatesFilter<"PedidoStatus"> | number
    is_padrao?: BoolWithAggregatesFilter<"PedidoStatus"> | boolean
    is_sistema?: BoolWithAggregatesFilter<"PedidoStatus"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"PedidoStatus"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PedidoStatus"> | Date | string
  }

  export type PedidoColunaWhereInput = {
    AND?: PedidoColunaWhereInput | PedidoColunaWhereInput[]
    OR?: PedidoColunaWhereInput[]
    NOT?: PedidoColunaWhereInput | PedidoColunaWhereInput[]
    id?: StringFilter<"PedidoColuna"> | string
    tenant_id?: StringFilter<"PedidoColuna"> | string
    product_id?: StringNullableFilter<"PedidoColuna"> | string | null
    nome?: StringFilter<"PedidoColuna"> | string
    rotulo?: StringFilter<"PedidoColuna"> | string
    tipo?: StringFilter<"PedidoColuna"> | string
    casas_decimais?: IntFilter<"PedidoColuna"> | number
    opcoes?: JsonNullableFilter<"PedidoColuna">
    ordem?: IntFilter<"PedidoColuna"> | number
    filtravel?: BoolFilter<"PedidoColuna"> | boolean
    exibida_padrao?: BoolFilter<"PedidoColuna"> | boolean
    index_criado?: BoolFilter<"PedidoColuna"> | boolean
    created_at?: DateTimeFilter<"PedidoColuna"> | Date | string
    updated_at?: DateTimeFilter<"PedidoColuna"> | Date | string
  }

  export type PedidoColunaOrderByWithRelationInput = {
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

  export type PedidoColunaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_nome?: PedidoColunaTenant_idNomeCompoundUniqueInput
    AND?: PedidoColunaWhereInput | PedidoColunaWhereInput[]
    OR?: PedidoColunaWhereInput[]
    NOT?: PedidoColunaWhereInput | PedidoColunaWhereInput[]
    tenant_id?: StringFilter<"PedidoColuna"> | string
    product_id?: StringNullableFilter<"PedidoColuna"> | string | null
    nome?: StringFilter<"PedidoColuna"> | string
    rotulo?: StringFilter<"PedidoColuna"> | string
    tipo?: StringFilter<"PedidoColuna"> | string
    casas_decimais?: IntFilter<"PedidoColuna"> | number
    opcoes?: JsonNullableFilter<"PedidoColuna">
    ordem?: IntFilter<"PedidoColuna"> | number
    filtravel?: BoolFilter<"PedidoColuna"> | boolean
    exibida_padrao?: BoolFilter<"PedidoColuna"> | boolean
    index_criado?: BoolFilter<"PedidoColuna"> | boolean
    created_at?: DateTimeFilter<"PedidoColuna"> | Date | string
    updated_at?: DateTimeFilter<"PedidoColuna"> | Date | string
  }, "id" | "tenant_id_nome">

  export type PedidoColunaOrderByWithAggregationInput = {
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
    _count?: PedidoColunaCountOrderByAggregateInput
    _avg?: PedidoColunaAvgOrderByAggregateInput
    _max?: PedidoColunaMaxOrderByAggregateInput
    _min?: PedidoColunaMinOrderByAggregateInput
    _sum?: PedidoColunaSumOrderByAggregateInput
  }

  export type PedidoColunaScalarWhereWithAggregatesInput = {
    AND?: PedidoColunaScalarWhereWithAggregatesInput | PedidoColunaScalarWhereWithAggregatesInput[]
    OR?: PedidoColunaScalarWhereWithAggregatesInput[]
    NOT?: PedidoColunaScalarWhereWithAggregatesInput | PedidoColunaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PedidoColuna"> | string
    tenant_id?: StringWithAggregatesFilter<"PedidoColuna"> | string
    product_id?: StringNullableWithAggregatesFilter<"PedidoColuna"> | string | null
    nome?: StringWithAggregatesFilter<"PedidoColuna"> | string
    rotulo?: StringWithAggregatesFilter<"PedidoColuna"> | string
    tipo?: StringWithAggregatesFilter<"PedidoColuna"> | string
    casas_decimais?: IntWithAggregatesFilter<"PedidoColuna"> | number
    opcoes?: JsonNullableWithAggregatesFilter<"PedidoColuna">
    ordem?: IntWithAggregatesFilter<"PedidoColuna"> | number
    filtravel?: BoolWithAggregatesFilter<"PedidoColuna"> | boolean
    exibida_padrao?: BoolWithAggregatesFilter<"PedidoColuna"> | boolean
    index_criado?: BoolWithAggregatesFilter<"PedidoColuna"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"PedidoColuna"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"PedidoColuna"> | Date | string
  }

  export type PedidoPreferenciaUsuarioWhereInput = {
    AND?: PedidoPreferenciaUsuarioWhereInput | PedidoPreferenciaUsuarioWhereInput[]
    OR?: PedidoPreferenciaUsuarioWhereInput[]
    NOT?: PedidoPreferenciaUsuarioWhereInput | PedidoPreferenciaUsuarioWhereInput[]
    id?: StringFilter<"PedidoPreferenciaUsuario"> | string
    tenant_id?: StringFilter<"PedidoPreferenciaUsuario"> | string
    product_id?: StringNullableFilter<"PedidoPreferenciaUsuario"> | string | null
    user_id?: StringFilter<"PedidoPreferenciaUsuario"> | string
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaUsuario">
    colunas_largura?: JsonNullableFilter<"PedidoPreferenciaUsuario">
    updated_at?: DateTimeFilter<"PedidoPreferenciaUsuario"> | Date | string
  }

  export type PedidoPreferenciaUsuarioOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaUsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_user_id?: PedidoPreferenciaUsuarioTenant_idUser_idCompoundUniqueInput
    AND?: PedidoPreferenciaUsuarioWhereInput | PedidoPreferenciaUsuarioWhereInput[]
    OR?: PedidoPreferenciaUsuarioWhereInput[]
    NOT?: PedidoPreferenciaUsuarioWhereInput | PedidoPreferenciaUsuarioWhereInput[]
    tenant_id?: StringFilter<"PedidoPreferenciaUsuario"> | string
    product_id?: StringNullableFilter<"PedidoPreferenciaUsuario"> | string | null
    user_id?: StringFilter<"PedidoPreferenciaUsuario"> | string
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaUsuario">
    colunas_largura?: JsonNullableFilter<"PedidoPreferenciaUsuario">
    updated_at?: DateTimeFilter<"PedidoPreferenciaUsuario"> | Date | string
  }, "id" | "tenant_id_user_id">

  export type PedidoPreferenciaUsuarioOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
    _count?: PedidoPreferenciaUsuarioCountOrderByAggregateInput
    _max?: PedidoPreferenciaUsuarioMaxOrderByAggregateInput
    _min?: PedidoPreferenciaUsuarioMinOrderByAggregateInput
  }

  export type PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput = {
    AND?: PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput | PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput[]
    OR?: PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput[]
    NOT?: PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput | PedidoPreferenciaUsuarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PedidoPreferenciaUsuario"> | string
    tenant_id?: StringWithAggregatesFilter<"PedidoPreferenciaUsuario"> | string
    product_id?: StringNullableWithAggregatesFilter<"PedidoPreferenciaUsuario"> | string | null
    user_id?: StringWithAggregatesFilter<"PedidoPreferenciaUsuario"> | string
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaUsuario">
    colunas_largura?: JsonNullableWithAggregatesFilter<"PedidoPreferenciaUsuario">
    updated_at?: DateTimeWithAggregatesFilter<"PedidoPreferenciaUsuario"> | Date | string
  }

  export type PedidoPreferenciaPadraoWhereInput = {
    AND?: PedidoPreferenciaPadraoWhereInput | PedidoPreferenciaPadraoWhereInput[]
    OR?: PedidoPreferenciaPadraoWhereInput[]
    NOT?: PedidoPreferenciaPadraoWhereInput | PedidoPreferenciaPadraoWhereInput[]
    id?: StringFilter<"PedidoPreferenciaPadrao"> | string
    tenant_id?: StringFilter<"PedidoPreferenciaPadrao"> | string
    product_id?: StringNullableFilter<"PedidoPreferenciaPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaPadrao">
    colunas_largura?: JsonNullableFilter<"PedidoPreferenciaPadrao">
    updated_at?: DateTimeFilter<"PedidoPreferenciaPadrao"> | Date | string
  }

  export type PedidoPreferenciaPadraoOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaPadraoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id?: string
    AND?: PedidoPreferenciaPadraoWhereInput | PedidoPreferenciaPadraoWhereInput[]
    OR?: PedidoPreferenciaPadraoWhereInput[]
    NOT?: PedidoPreferenciaPadraoWhereInput | PedidoPreferenciaPadraoWhereInput[]
    product_id?: StringNullableFilter<"PedidoPreferenciaPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaPadrao">
    colunas_largura?: JsonNullableFilter<"PedidoPreferenciaPadrao">
    updated_at?: DateTimeFilter<"PedidoPreferenciaPadrao"> | Date | string
  }, "id" | "tenant_id">

  export type PedidoPreferenciaPadraoOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrderInput | SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrderInput | SortOrder
    updated_at?: SortOrder
    _count?: PedidoPreferenciaPadraoCountOrderByAggregateInput
    _max?: PedidoPreferenciaPadraoMaxOrderByAggregateInput
    _min?: PedidoPreferenciaPadraoMinOrderByAggregateInput
  }

  export type PedidoPreferenciaPadraoScalarWhereWithAggregatesInput = {
    AND?: PedidoPreferenciaPadraoScalarWhereWithAggregatesInput | PedidoPreferenciaPadraoScalarWhereWithAggregatesInput[]
    OR?: PedidoPreferenciaPadraoScalarWhereWithAggregatesInput[]
    NOT?: PedidoPreferenciaPadraoScalarWhereWithAggregatesInput | PedidoPreferenciaPadraoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PedidoPreferenciaPadrao"> | string
    tenant_id?: StringWithAggregatesFilter<"PedidoPreferenciaPadrao"> | string
    product_id?: StringNullableWithAggregatesFilter<"PedidoPreferenciaPadrao"> | string | null
    colunas_visiveis?: StringNullableListFilter<"PedidoPreferenciaPadrao">
    colunas_largura?: JsonNullableWithAggregatesFilter<"PedidoPreferenciaPadrao">
    updated_at?: DateTimeWithAggregatesFilter<"PedidoPreferenciaPadrao"> | Date | string
  }

  export type ProcessoCreateInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUpdateInput = {
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoCreateManyInput = {
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

  export type ProcessoUpdateManyMutationInput = {
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

  export type ProcessoUncheckedUpdateManyInput = {
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

  export type ProcessoEtapaCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id?: string | null
    nome: string
    status?: string
    data_prevista?: Date | string | null
    data_realizada?: Date | string | null
    observacao?: string | null
    processo: ProcessoCreateNestedOneWithoutEtapasInput
  }

  export type ProcessoEtapaUncheckedCreateInput = {
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

  export type ProcessoEtapaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: NullableStringFieldUpdateOperationsInput | string | null
    nome?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    data_prevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    data_realizada?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    observacao?: NullableStringFieldUpdateOperationsInput | string | null
    processo?: ProcessoUpdateOneRequiredWithoutEtapasNestedInput
  }

  export type ProcessoEtapaUncheckedUpdateInput = {
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

  export type ProcessoEtapaCreateManyInput = {
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

  export type ProcessoEtapaUpdateManyMutationInput = {
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

  export type ProcessoEtapaUncheckedUpdateManyInput = {
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

  export type PedidoCreateInput = {
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
    processo: ProcessoCreateNestedOneWithoutPedidosInput
    itens?: PedidoItemCreateNestedManyWithoutPedidoInput
  }

  export type PedidoUncheckedCreateInput = {
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
    itens?: PedidoItemUncheckedCreateNestedManyWithoutPedidoInput
  }

  export type PedidoUpdateInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutPedidosNestedInput
    itens?: PedidoItemUpdateManyWithoutPedidoNestedInput
  }

  export type PedidoUncheckedUpdateInput = {
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
    itens?: PedidoItemUncheckedUpdateManyWithoutPedidoNestedInput
  }

  export type PedidoCreateManyInput = {
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

  export type PedidoUpdateManyMutationInput = {
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

  export type PedidoUncheckedUpdateManyInput = {
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

  export type PedidoItemCreateInput = {
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
    pedido: PedidoCreateNestedOneWithoutItensInput
  }

  export type PedidoItemUncheckedCreateInput = {
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

  export type PedidoItemUpdateInput = {
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
    pedido?: PedidoUpdateOneRequiredWithoutItensNestedInput
  }

  export type PedidoItemUncheckedUpdateInput = {
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

  export type PedidoItemCreateManyInput = {
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

  export type PedidoItemUpdateManyMutationInput = {
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

  export type PedidoItemUncheckedUpdateManyInput = {
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

  export type FollowUpCreateInput = {
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
    processo: ProcessoCreateNestedOneWithoutFollowUpsInput
  }

  export type FollowUpUncheckedCreateInput = {
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

  export type FollowUpUpdateInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutFollowUpsNestedInput
  }

  export type FollowUpUncheckedUpdateInput = {
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

  export type FollowUpCreateManyInput = {
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

  export type FollowUpUpdateManyMutationInput = {
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

  export type FollowUpUncheckedUpdateManyInput = {
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

  export type DocumentoCreateInput = {
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
    processo: ProcessoCreateNestedOneWithoutDocumentosInput
  }

  export type DocumentoUncheckedCreateInput = {
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

  export type DocumentoUpdateInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutDocumentosNestedInput
  }

  export type DocumentoUncheckedUpdateInput = {
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

  export type DocumentoCreateManyInput = {
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

  export type DocumentoUpdateManyMutationInput = {
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

  export type DocumentoUncheckedUpdateManyInput = {
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

  export type EstimativaCustoCreateInput = {
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
    processo: ProcessoCreateNestedOneWithoutEstimativaCustoInput
  }

  export type EstimativaCustoUncheckedCreateInput = {
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

  export type EstimativaCustoUpdateInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutEstimativaCustoNestedInput
  }

  export type EstimativaCustoUncheckedUpdateInput = {
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

  export type EstimativaCustoCreateManyInput = {
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

  export type EstimativaCustoUpdateManyMutationInput = {
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

  export type EstimativaCustoUncheckedUpdateManyInput = {
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

  export type DadosTecnicosCreateInput = {
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
    processo: ProcessoCreateNestedOneWithoutDadosTecnicosInput
  }

  export type DadosTecnicosUncheckedCreateInput = {
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

  export type DadosTecnicosUpdateInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutDadosTecnicosNestedInput
  }

  export type DadosTecnicosUncheckedUpdateInput = {
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

  export type DadosTecnicosCreateManyInput = {
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

  export type DadosTecnicosUpdateManyMutationInput = {
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

  export type DadosTecnicosUncheckedUpdateManyInput = {
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

  export type PedidoStatusCreateInput = {
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

  export type PedidoStatusUncheckedCreateInput = {
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

  export type PedidoStatusUpdateInput = {
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

  export type PedidoStatusUncheckedUpdateInput = {
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

  export type PedidoStatusCreateManyInput = {
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

  export type PedidoStatusUpdateManyMutationInput = {
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

  export type PedidoStatusUncheckedUpdateManyInput = {
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

  export type PedidoColunaCreateInput = {
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

  export type PedidoColunaUncheckedCreateInput = {
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

  export type PedidoColunaUpdateInput = {
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

  export type PedidoColunaUncheckedUpdateInput = {
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

  export type PedidoColunaCreateManyInput = {
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

  export type PedidoColunaUpdateManyMutationInput = {
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

  export type PedidoColunaUncheckedUpdateManyInput = {
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

  export type PedidoPreferenciaUsuarioCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: PedidoPreferenciaUsuarioCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaUsuarioUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: PedidoPreferenciaUsuarioCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaUsuarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: PedidoPreferenciaUsuarioUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaUsuarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: PedidoPreferenciaUsuarioUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaUsuarioCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    user_id: string
    colunas_visiveis?: PedidoPreferenciaUsuarioCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaUsuarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: PedidoPreferenciaUsuarioUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaUsuarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    user_id?: StringFieldUpdateOperationsInput | string
    colunas_visiveis?: PedidoPreferenciaUsuarioUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaPadraoCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: PedidoPreferenciaPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaPadraoUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: PedidoPreferenciaPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaPadraoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: PedidoPreferenciaPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaPadraoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: PedidoPreferenciaPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaPadraoCreateManyInput = {
    id?: string
    tenant_id: string
    product_id?: string | null
    colunas_visiveis?: PedidoPreferenciaPadraoCreatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: Date | string
  }

  export type PedidoPreferenciaPadraoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: PedidoPreferenciaPadraoUpdatecolunas_visiveisInput | string[]
    colunas_largura?: NullableJsonNullValueInput | InputJsonValue
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PedidoPreferenciaPadraoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_id?: NullableStringFieldUpdateOperationsInput | string | null
    colunas_visiveis?: PedidoPreferenciaPadraoUpdatecolunas_visiveisInput | string[]
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

  export type ProcessoEtapaListRelationFilter = {
    every?: ProcessoEtapaWhereInput
    some?: ProcessoEtapaWhereInput
    none?: ProcessoEtapaWhereInput
  }

  export type PedidoListRelationFilter = {
    every?: PedidoWhereInput
    some?: PedidoWhereInput
    none?: PedidoWhereInput
  }

  export type FollowUpListRelationFilter = {
    every?: FollowUpWhereInput
    some?: FollowUpWhereInput
    none?: FollowUpWhereInput
  }

  export type DocumentoListRelationFilter = {
    every?: DocumentoWhereInput
    some?: DocumentoWhereInput
    none?: DocumentoWhereInput
  }

  export type EstimativaCustoNullableRelationFilter = {
    is?: EstimativaCustoWhereInput | null
    isNot?: EstimativaCustoWhereInput | null
  }

  export type DadosTecnicosNullableRelationFilter = {
    is?: DadosTecnicosWhereInput | null
    isNot?: DadosTecnicosWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProcessoEtapaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PedidoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FollowUpOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DocumentoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoCountOrderByAggregateInput = {
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

  export type ProcessoMaxOrderByAggregateInput = {
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

  export type ProcessoMinOrderByAggregateInput = {
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

  export type ProcessoRelationFilter = {
    is?: ProcessoWhereInput
    isNot?: ProcessoWhereInput
  }

  export type ProcessoEtapaCountOrderByAggregateInput = {
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

  export type ProcessoEtapaMaxOrderByAggregateInput = {
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

  export type ProcessoEtapaMinOrderByAggregateInput = {
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

  export type PedidoItemListRelationFilter = {
    every?: PedidoItemWhereInput
    some?: PedidoItemWhereInput
    none?: PedidoItemWhereInput
  }

  export type PedidoItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PedidoCountOrderByAggregateInput = {
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

  export type PedidoAvgOrderByAggregateInput = {
    valor_fob?: SortOrder
    peso_bruto?: SortOrder
  }

  export type PedidoMaxOrderByAggregateInput = {
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

  export type PedidoMinOrderByAggregateInput = {
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

  export type PedidoSumOrderByAggregateInput = {
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

  export type PedidoRelationFilter = {
    is?: PedidoWhereInput
    isNot?: PedidoWhereInput
  }

  export type PedidoItemCountOrderByAggregateInput = {
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

  export type PedidoItemAvgOrderByAggregateInput = {
    quantidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
  }

  export type PedidoItemMaxOrderByAggregateInput = {
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

  export type PedidoItemMinOrderByAggregateInput = {
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

  export type PedidoItemSumOrderByAggregateInput = {
    quantidade?: SortOrder
    valor_unitario?: SortOrder
    valor_total?: SortOrder
  }

  export type FollowUpCountOrderByAggregateInput = {
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

  export type FollowUpMaxOrderByAggregateInput = {
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

  export type FollowUpMinOrderByAggregateInput = {
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

  export type DocumentoCountOrderByAggregateInput = {
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

  export type DocumentoAvgOrderByAggregateInput = {
    tamanho_bytes?: SortOrder
  }

  export type DocumentoMaxOrderByAggregateInput = {
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

  export type DocumentoMinOrderByAggregateInput = {
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

  export type DocumentoSumOrderByAggregateInput = {
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

  export type EstimativaCustoCountOrderByAggregateInput = {
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

  export type EstimativaCustoAvgOrderByAggregateInput = {
    impostos?: SortOrder
    frete?: SortOrder
    despacho?: SortOrder
    outros?: SortOrder
    total?: SortOrder
  }

  export type EstimativaCustoMaxOrderByAggregateInput = {
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

  export type EstimativaCustoMinOrderByAggregateInput = {
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

  export type EstimativaCustoSumOrderByAggregateInput = {
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

  export type DadosTecnicosCountOrderByAggregateInput = {
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

  export type DadosTecnicosAvgOrderByAggregateInput = {
    seguro_valor?: SortOrder
  }

  export type DadosTecnicosMaxOrderByAggregateInput = {
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

  export type DadosTecnicosMinOrderByAggregateInput = {
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

  export type DadosTecnicosSumOrderByAggregateInput = {
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

  export type PedidoStatusTenant_idNomeCompoundUniqueInput = {
    tenant_id: string
    nome: string
  }

  export type PedidoStatusCountOrderByAggregateInput = {
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

  export type PedidoStatusAvgOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type PedidoStatusMaxOrderByAggregateInput = {
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

  export type PedidoStatusMinOrderByAggregateInput = {
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

  export type PedidoStatusSumOrderByAggregateInput = {
    ordem?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PedidoColunaTenant_idNomeCompoundUniqueInput = {
    tenant_id: string
    nome: string
  }

  export type PedidoColunaCountOrderByAggregateInput = {
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

  export type PedidoColunaAvgOrderByAggregateInput = {
    casas_decimais?: SortOrder
    ordem?: SortOrder
  }

  export type PedidoColunaMaxOrderByAggregateInput = {
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

  export type PedidoColunaMinOrderByAggregateInput = {
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

  export type PedidoColunaSumOrderByAggregateInput = {
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

  export type PedidoPreferenciaUsuarioTenant_idUser_idCompoundUniqueInput = {
    tenant_id: string
    user_id: string
  }

  export type PedidoPreferenciaUsuarioCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaUsuarioMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaUsuarioMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    user_id?: SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaPadraoCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    colunas_visiveis?: SortOrder
    colunas_largura?: SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaPadraoMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    updated_at?: SortOrder
  }

  export type PedidoPreferenciaPadraoMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_id?: SortOrder
    updated_at?: SortOrder
  }

  export type ProcessoEtapaCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput> | ProcessoEtapaCreateWithoutProcessoInput[] | ProcessoEtapaUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapaCreateOrConnectWithoutProcessoInput | ProcessoEtapaCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoEtapaCreateManyProcessoInputEnvelope
    connect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
  }

  export type PedidoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput> | PedidoCreateWithoutProcessoInput[] | PedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: PedidoCreateOrConnectWithoutProcessoInput | PedidoCreateOrConnectWithoutProcessoInput[]
    createMany?: PedidoCreateManyProcessoInputEnvelope
    connect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
  }

  export type FollowUpCreateNestedManyWithoutProcessoInput = {
    create?: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput> | FollowUpCreateWithoutProcessoInput[] | FollowUpUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpCreateOrConnectWithoutProcessoInput | FollowUpCreateOrConnectWithoutProcessoInput[]
    createMany?: FollowUpCreateManyProcessoInputEnvelope
    connect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
  }

  export type DocumentoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type EstimativaCustoCreateNestedOneWithoutProcessoInput = {
    create?: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaCustoCreateOrConnectWithoutProcessoInput
    connect?: EstimativaCustoWhereUniqueInput
  }

  export type DadosTecnicosCreateNestedOneWithoutProcessoInput = {
    create?: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosTecnicosCreateOrConnectWithoutProcessoInput
    connect?: DadosTecnicosWhereUniqueInput
  }

  export type ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput> | ProcessoEtapaCreateWithoutProcessoInput[] | ProcessoEtapaUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapaCreateOrConnectWithoutProcessoInput | ProcessoEtapaCreateOrConnectWithoutProcessoInput[]
    createMany?: ProcessoEtapaCreateManyProcessoInputEnvelope
    connect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
  }

  export type PedidoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput> | PedidoCreateWithoutProcessoInput[] | PedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: PedidoCreateOrConnectWithoutProcessoInput | PedidoCreateOrConnectWithoutProcessoInput[]
    createMany?: PedidoCreateManyProcessoInputEnvelope
    connect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
  }

  export type FollowUpUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput> | FollowUpCreateWithoutProcessoInput[] | FollowUpUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpCreateOrConnectWithoutProcessoInput | FollowUpCreateOrConnectWithoutProcessoInput[]
    createMany?: FollowUpCreateManyProcessoInputEnvelope
    connect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
  }

  export type DocumentoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaCustoCreateOrConnectWithoutProcessoInput
    connect?: EstimativaCustoWhereUniqueInput
  }

  export type DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput = {
    create?: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosTecnicosCreateOrConnectWithoutProcessoInput
    connect?: DadosTecnicosWhereUniqueInput
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

  export type ProcessoEtapaUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput> | ProcessoEtapaCreateWithoutProcessoInput[] | ProcessoEtapaUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapaCreateOrConnectWithoutProcessoInput | ProcessoEtapaCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoEtapaUpsertWithWhereUniqueWithoutProcessoInput | ProcessoEtapaUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoEtapaCreateManyProcessoInputEnvelope
    set?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    disconnect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    delete?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    connect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    update?: ProcessoEtapaUpdateWithWhereUniqueWithoutProcessoInput | ProcessoEtapaUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoEtapaUpdateManyWithWhereWithoutProcessoInput | ProcessoEtapaUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoEtapaScalarWhereInput | ProcessoEtapaScalarWhereInput[]
  }

  export type PedidoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput> | PedidoCreateWithoutProcessoInput[] | PedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: PedidoCreateOrConnectWithoutProcessoInput | PedidoCreateOrConnectWithoutProcessoInput[]
    upsert?: PedidoUpsertWithWhereUniqueWithoutProcessoInput | PedidoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: PedidoCreateManyProcessoInputEnvelope
    set?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    disconnect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    delete?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    connect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    update?: PedidoUpdateWithWhereUniqueWithoutProcessoInput | PedidoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: PedidoUpdateManyWithWhereWithoutProcessoInput | PedidoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: PedidoScalarWhereInput | PedidoScalarWhereInput[]
  }

  export type FollowUpUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput> | FollowUpCreateWithoutProcessoInput[] | FollowUpUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpCreateOrConnectWithoutProcessoInput | FollowUpCreateOrConnectWithoutProcessoInput[]
    upsert?: FollowUpUpsertWithWhereUniqueWithoutProcessoInput | FollowUpUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: FollowUpCreateManyProcessoInputEnvelope
    set?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    disconnect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    delete?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    connect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    update?: FollowUpUpdateWithWhereUniqueWithoutProcessoInput | FollowUpUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: FollowUpUpdateManyWithWhereWithoutProcessoInput | FollowUpUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: FollowUpScalarWhereInput | FollowUpScalarWhereInput[]
  }

  export type DocumentoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutProcessoInput | DocumentoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type EstimativaCustoUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaCustoCreateOrConnectWithoutProcessoInput
    upsert?: EstimativaCustoUpsertWithoutProcessoInput
    disconnect?: EstimativaCustoWhereInput | boolean
    delete?: EstimativaCustoWhereInput | boolean
    connect?: EstimativaCustoWhereUniqueInput
    update?: XOR<XOR<EstimativaCustoUpdateToOneWithWhereWithoutProcessoInput, EstimativaCustoUpdateWithoutProcessoInput>, EstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosTecnicosUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosTecnicosCreateOrConnectWithoutProcessoInput
    upsert?: DadosTecnicosUpsertWithoutProcessoInput
    disconnect?: DadosTecnicosWhereInput | boolean
    delete?: DadosTecnicosWhereInput | boolean
    connect?: DadosTecnicosWhereUniqueInput
    update?: XOR<XOR<DadosTecnicosUpdateToOneWithWhereWithoutProcessoInput, DadosTecnicosUpdateWithoutProcessoInput>, DadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput> | ProcessoEtapaCreateWithoutProcessoInput[] | ProcessoEtapaUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: ProcessoEtapaCreateOrConnectWithoutProcessoInput | ProcessoEtapaCreateOrConnectWithoutProcessoInput[]
    upsert?: ProcessoEtapaUpsertWithWhereUniqueWithoutProcessoInput | ProcessoEtapaUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: ProcessoEtapaCreateManyProcessoInputEnvelope
    set?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    disconnect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    delete?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    connect?: ProcessoEtapaWhereUniqueInput | ProcessoEtapaWhereUniqueInput[]
    update?: ProcessoEtapaUpdateWithWhereUniqueWithoutProcessoInput | ProcessoEtapaUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: ProcessoEtapaUpdateManyWithWhereWithoutProcessoInput | ProcessoEtapaUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: ProcessoEtapaScalarWhereInput | ProcessoEtapaScalarWhereInput[]
  }

  export type PedidoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput> | PedidoCreateWithoutProcessoInput[] | PedidoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: PedidoCreateOrConnectWithoutProcessoInput | PedidoCreateOrConnectWithoutProcessoInput[]
    upsert?: PedidoUpsertWithWhereUniqueWithoutProcessoInput | PedidoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: PedidoCreateManyProcessoInputEnvelope
    set?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    disconnect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    delete?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    connect?: PedidoWhereUniqueInput | PedidoWhereUniqueInput[]
    update?: PedidoUpdateWithWhereUniqueWithoutProcessoInput | PedidoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: PedidoUpdateManyWithWhereWithoutProcessoInput | PedidoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: PedidoScalarWhereInput | PedidoScalarWhereInput[]
  }

  export type FollowUpUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput> | FollowUpCreateWithoutProcessoInput[] | FollowUpUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: FollowUpCreateOrConnectWithoutProcessoInput | FollowUpCreateOrConnectWithoutProcessoInput[]
    upsert?: FollowUpUpsertWithWhereUniqueWithoutProcessoInput | FollowUpUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: FollowUpCreateManyProcessoInputEnvelope
    set?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    disconnect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    delete?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    connect?: FollowUpWhereUniqueInput | FollowUpWhereUniqueInput[]
    update?: FollowUpUpdateWithWhereUniqueWithoutProcessoInput | FollowUpUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: FollowUpUpdateManyWithWhereWithoutProcessoInput | FollowUpUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: FollowUpScalarWhereInput | FollowUpScalarWhereInput[]
  }

  export type DocumentoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutProcessoInput | DocumentoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: EstimativaCustoCreateOrConnectWithoutProcessoInput
    upsert?: EstimativaCustoUpsertWithoutProcessoInput
    disconnect?: EstimativaCustoWhereInput | boolean
    delete?: EstimativaCustoWhereInput | boolean
    connect?: EstimativaCustoWhereUniqueInput
    update?: XOR<XOR<EstimativaCustoUpdateToOneWithWhereWithoutProcessoInput, EstimativaCustoUpdateWithoutProcessoInput>, EstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput = {
    create?: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
    connectOrCreate?: DadosTecnicosCreateOrConnectWithoutProcessoInput
    upsert?: DadosTecnicosUpsertWithoutProcessoInput
    disconnect?: DadosTecnicosWhereInput | boolean
    delete?: DadosTecnicosWhereInput | boolean
    connect?: DadosTecnicosWhereUniqueInput
    update?: XOR<XOR<DadosTecnicosUpdateToOneWithWhereWithoutProcessoInput, DadosTecnicosUpdateWithoutProcessoInput>, DadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoCreateNestedOneWithoutEtapasInput = {
    create?: XOR<ProcessoCreateWithoutEtapasInput, ProcessoUncheckedCreateWithoutEtapasInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEtapasInput
    connect?: ProcessoWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ProcessoUpdateOneRequiredWithoutEtapasNestedInput = {
    create?: XOR<ProcessoCreateWithoutEtapasInput, ProcessoUncheckedCreateWithoutEtapasInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEtapasInput
    upsert?: ProcessoUpsertWithoutEtapasInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutEtapasInput, ProcessoUpdateWithoutEtapasInput>, ProcessoUncheckedUpdateWithoutEtapasInput>
  }

  export type ProcessoCreateNestedOneWithoutPedidosInput = {
    create?: XOR<ProcessoCreateWithoutPedidosInput, ProcessoUncheckedCreateWithoutPedidosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutPedidosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type PedidoItemCreateNestedManyWithoutPedidoInput = {
    create?: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput> | PedidoItemCreateWithoutPedidoInput[] | PedidoItemUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: PedidoItemCreateOrConnectWithoutPedidoInput | PedidoItemCreateOrConnectWithoutPedidoInput[]
    createMany?: PedidoItemCreateManyPedidoInputEnvelope
    connect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
  }

  export type PedidoItemUncheckedCreateNestedManyWithoutPedidoInput = {
    create?: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput> | PedidoItemCreateWithoutPedidoInput[] | PedidoItemUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: PedidoItemCreateOrConnectWithoutPedidoInput | PedidoItemCreateOrConnectWithoutPedidoInput[]
    createMany?: PedidoItemCreateManyPedidoInputEnvelope
    connect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ProcessoUpdateOneRequiredWithoutPedidosNestedInput = {
    create?: XOR<ProcessoCreateWithoutPedidosInput, ProcessoUncheckedCreateWithoutPedidosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutPedidosInput
    upsert?: ProcessoUpsertWithoutPedidosInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutPedidosInput, ProcessoUpdateWithoutPedidosInput>, ProcessoUncheckedUpdateWithoutPedidosInput>
  }

  export type PedidoItemUpdateManyWithoutPedidoNestedInput = {
    create?: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput> | PedidoItemCreateWithoutPedidoInput[] | PedidoItemUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: PedidoItemCreateOrConnectWithoutPedidoInput | PedidoItemCreateOrConnectWithoutPedidoInput[]
    upsert?: PedidoItemUpsertWithWhereUniqueWithoutPedidoInput | PedidoItemUpsertWithWhereUniqueWithoutPedidoInput[]
    createMany?: PedidoItemCreateManyPedidoInputEnvelope
    set?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    disconnect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    delete?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    connect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    update?: PedidoItemUpdateWithWhereUniqueWithoutPedidoInput | PedidoItemUpdateWithWhereUniqueWithoutPedidoInput[]
    updateMany?: PedidoItemUpdateManyWithWhereWithoutPedidoInput | PedidoItemUpdateManyWithWhereWithoutPedidoInput[]
    deleteMany?: PedidoItemScalarWhereInput | PedidoItemScalarWhereInput[]
  }

  export type PedidoItemUncheckedUpdateManyWithoutPedidoNestedInput = {
    create?: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput> | PedidoItemCreateWithoutPedidoInput[] | PedidoItemUncheckedCreateWithoutPedidoInput[]
    connectOrCreate?: PedidoItemCreateOrConnectWithoutPedidoInput | PedidoItemCreateOrConnectWithoutPedidoInput[]
    upsert?: PedidoItemUpsertWithWhereUniqueWithoutPedidoInput | PedidoItemUpsertWithWhereUniqueWithoutPedidoInput[]
    createMany?: PedidoItemCreateManyPedidoInputEnvelope
    set?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    disconnect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    delete?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    connect?: PedidoItemWhereUniqueInput | PedidoItemWhereUniqueInput[]
    update?: PedidoItemUpdateWithWhereUniqueWithoutPedidoInput | PedidoItemUpdateWithWhereUniqueWithoutPedidoInput[]
    updateMany?: PedidoItemUpdateManyWithWhereWithoutPedidoInput | PedidoItemUpdateManyWithWhereWithoutPedidoInput[]
    deleteMany?: PedidoItemScalarWhereInput | PedidoItemScalarWhereInput[]
  }

  export type PedidoCreateNestedOneWithoutItensInput = {
    create?: XOR<PedidoCreateWithoutItensInput, PedidoUncheckedCreateWithoutItensInput>
    connectOrCreate?: PedidoCreateOrConnectWithoutItensInput
    connect?: PedidoWhereUniqueInput
  }

  export type PedidoUpdateOneRequiredWithoutItensNestedInput = {
    create?: XOR<PedidoCreateWithoutItensInput, PedidoUncheckedCreateWithoutItensInput>
    connectOrCreate?: PedidoCreateOrConnectWithoutItensInput
    upsert?: PedidoUpsertWithoutItensInput
    connect?: PedidoWhereUniqueInput
    update?: XOR<XOR<PedidoUpdateToOneWithWhereWithoutItensInput, PedidoUpdateWithoutItensInput>, PedidoUncheckedUpdateWithoutItensInput>
  }

  export type ProcessoCreateNestedOneWithoutFollowUpsInput = {
    create?: XOR<ProcessoCreateWithoutFollowUpsInput, ProcessoUncheckedCreateWithoutFollowUpsInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutFollowUpsInput
    connect?: ProcessoWhereUniqueInput
  }

  export type ProcessoUpdateOneRequiredWithoutFollowUpsNestedInput = {
    create?: XOR<ProcessoCreateWithoutFollowUpsInput, ProcessoUncheckedCreateWithoutFollowUpsInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutFollowUpsInput
    upsert?: ProcessoUpsertWithoutFollowUpsInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutFollowUpsInput, ProcessoUpdateWithoutFollowUpsInput>, ProcessoUncheckedUpdateWithoutFollowUpsInput>
  }

  export type ProcessoCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoUpdateOneRequiredWithoutDocumentosNestedInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    upsert?: ProcessoUpsertWithoutDocumentosInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutDocumentosInput, ProcessoUpdateWithoutDocumentosInput>, ProcessoUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoCreateNestedOneWithoutEstimativaCustoInput = {
    create?: XOR<ProcessoCreateWithoutEstimativaCustoInput, ProcessoUncheckedCreateWithoutEstimativaCustoInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEstimativaCustoInput
    connect?: ProcessoWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoUpdateOneRequiredWithoutEstimativaCustoNestedInput = {
    create?: XOR<ProcessoCreateWithoutEstimativaCustoInput, ProcessoUncheckedCreateWithoutEstimativaCustoInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutEstimativaCustoInput
    upsert?: ProcessoUpsertWithoutEstimativaCustoInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutEstimativaCustoInput, ProcessoUpdateWithoutEstimativaCustoInput>, ProcessoUncheckedUpdateWithoutEstimativaCustoInput>
  }

  export type ProcessoCreateNestedOneWithoutDadosTecnicosInput = {
    create?: XOR<ProcessoCreateWithoutDadosTecnicosInput, ProcessoUncheckedCreateWithoutDadosTecnicosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDadosTecnicosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProcessoUpdateOneRequiredWithoutDadosTecnicosNestedInput = {
    create?: XOR<ProcessoCreateWithoutDadosTecnicosInput, ProcessoUncheckedCreateWithoutDadosTecnicosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDadosTecnicosInput
    upsert?: ProcessoUpsertWithoutDadosTecnicosInput
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutDadosTecnicosInput, ProcessoUpdateWithoutDadosTecnicosInput>, ProcessoUncheckedUpdateWithoutDadosTecnicosInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type PedidoPreferenciaUsuarioCreatecolunas_visiveisInput = {
    set: string[]
  }

  export type PedidoPreferenciaUsuarioUpdatecolunas_visiveisInput = {
    set?: string[]
    push?: string | string[]
  }

  export type PedidoPreferenciaPadraoCreatecolunas_visiveisInput = {
    set: string[]
  }

  export type PedidoPreferenciaPadraoUpdatecolunas_visiveisInput = {
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

  export type ProcessoEtapaCreateWithoutProcessoInput = {
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

  export type ProcessoEtapaUncheckedCreateWithoutProcessoInput = {
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

  export type ProcessoEtapaCreateOrConnectWithoutProcessoInput = {
    where: ProcessoEtapaWhereUniqueInput
    create: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapaCreateManyProcessoInputEnvelope = {
    data: ProcessoEtapaCreateManyProcessoInput | ProcessoEtapaCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type PedidoCreateWithoutProcessoInput = {
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
    itens?: PedidoItemCreateNestedManyWithoutPedidoInput
  }

  export type PedidoUncheckedCreateWithoutProcessoInput = {
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
    itens?: PedidoItemUncheckedCreateNestedManyWithoutPedidoInput
  }

  export type PedidoCreateOrConnectWithoutProcessoInput = {
    where: PedidoWhereUniqueInput
    create: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput>
  }

  export type PedidoCreateManyProcessoInputEnvelope = {
    data: PedidoCreateManyProcessoInput | PedidoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type FollowUpCreateWithoutProcessoInput = {
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

  export type FollowUpUncheckedCreateWithoutProcessoInput = {
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

  export type FollowUpCreateOrConnectWithoutProcessoInput = {
    where: FollowUpWhereUniqueInput
    create: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput>
  }

  export type FollowUpCreateManyProcessoInputEnvelope = {
    data: FollowUpCreateManyProcessoInput | FollowUpCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type DocumentoCreateWithoutProcessoInput = {
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

  export type DocumentoUncheckedCreateWithoutProcessoInput = {
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

  export type DocumentoCreateOrConnectWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoCreateManyProcessoInputEnvelope = {
    data: DocumentoCreateManyProcessoInput | DocumentoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type EstimativaCustoCreateWithoutProcessoInput = {
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

  export type EstimativaCustoUncheckedCreateWithoutProcessoInput = {
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

  export type EstimativaCustoCreateOrConnectWithoutProcessoInput = {
    where: EstimativaCustoWhereUniqueInput
    create: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
  }

  export type DadosTecnicosCreateWithoutProcessoInput = {
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

  export type DadosTecnicosUncheckedCreateWithoutProcessoInput = {
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

  export type DadosTecnicosCreateOrConnectWithoutProcessoInput = {
    where: DadosTecnicosWhereUniqueInput
    create: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapaUpsertWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoEtapaWhereUniqueInput
    update: XOR<ProcessoEtapaUpdateWithoutProcessoInput, ProcessoEtapaUncheckedUpdateWithoutProcessoInput>
    create: XOR<ProcessoEtapaCreateWithoutProcessoInput, ProcessoEtapaUncheckedCreateWithoutProcessoInput>
  }

  export type ProcessoEtapaUpdateWithWhereUniqueWithoutProcessoInput = {
    where: ProcessoEtapaWhereUniqueInput
    data: XOR<ProcessoEtapaUpdateWithoutProcessoInput, ProcessoEtapaUncheckedUpdateWithoutProcessoInput>
  }

  export type ProcessoEtapaUpdateManyWithWhereWithoutProcessoInput = {
    where: ProcessoEtapaScalarWhereInput
    data: XOR<ProcessoEtapaUpdateManyMutationInput, ProcessoEtapaUncheckedUpdateManyWithoutProcessoInput>
  }

  export type ProcessoEtapaScalarWhereInput = {
    AND?: ProcessoEtapaScalarWhereInput | ProcessoEtapaScalarWhereInput[]
    OR?: ProcessoEtapaScalarWhereInput[]
    NOT?: ProcessoEtapaScalarWhereInput | ProcessoEtapaScalarWhereInput[]
    id?: StringFilter<"ProcessoEtapa"> | string
    tenant_id?: StringFilter<"ProcessoEtapa"> | string
    product_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    user_id?: StringNullableFilter<"ProcessoEtapa"> | string | null
    processo_id?: StringFilter<"ProcessoEtapa"> | string
    nome?: StringFilter<"ProcessoEtapa"> | string
    status?: StringFilter<"ProcessoEtapa"> | string
    data_prevista?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    data_realizada?: DateTimeNullableFilter<"ProcessoEtapa"> | Date | string | null
    observacao?: StringNullableFilter<"ProcessoEtapa"> | string | null
  }

  export type PedidoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: PedidoWhereUniqueInput
    update: XOR<PedidoUpdateWithoutProcessoInput, PedidoUncheckedUpdateWithoutProcessoInput>
    create: XOR<PedidoCreateWithoutProcessoInput, PedidoUncheckedCreateWithoutProcessoInput>
  }

  export type PedidoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: PedidoWhereUniqueInput
    data: XOR<PedidoUpdateWithoutProcessoInput, PedidoUncheckedUpdateWithoutProcessoInput>
  }

  export type PedidoUpdateManyWithWhereWithoutProcessoInput = {
    where: PedidoScalarWhereInput
    data: XOR<PedidoUpdateManyMutationInput, PedidoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type PedidoScalarWhereInput = {
    AND?: PedidoScalarWhereInput | PedidoScalarWhereInput[]
    OR?: PedidoScalarWhereInput[]
    NOT?: PedidoScalarWhereInput | PedidoScalarWhereInput[]
    id?: StringFilter<"Pedido"> | string
    tenant_id?: StringFilter<"Pedido"> | string
    product_id?: StringNullableFilter<"Pedido"> | string | null
    user_id?: StringNullableFilter<"Pedido"> | string | null
    processo_id?: StringFilter<"Pedido"> | string
    numero?: StringFilter<"Pedido"> | string
    exportador_nome?: StringNullableFilter<"Pedido"> | string | null
    exportador_pais?: StringNullableFilter<"Pedido"> | string | null
    valor_fob?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"Pedido"> | string
    peso_bruto?: DecimalFilter<"Pedido"> | Decimal | DecimalJsLike | number | string
    status?: StringFilter<"Pedido"> | string
    status_id?: StringNullableFilter<"Pedido"> | string | null
    campos_custom?: JsonNullableFilter<"Pedido">
    created_at?: DateTimeFilter<"Pedido"> | Date | string
    updated_at?: DateTimeFilter<"Pedido"> | Date | string
  }

  export type FollowUpUpsertWithWhereUniqueWithoutProcessoInput = {
    where: FollowUpWhereUniqueInput
    update: XOR<FollowUpUpdateWithoutProcessoInput, FollowUpUncheckedUpdateWithoutProcessoInput>
    create: XOR<FollowUpCreateWithoutProcessoInput, FollowUpUncheckedCreateWithoutProcessoInput>
  }

  export type FollowUpUpdateWithWhereUniqueWithoutProcessoInput = {
    where: FollowUpWhereUniqueInput
    data: XOR<FollowUpUpdateWithoutProcessoInput, FollowUpUncheckedUpdateWithoutProcessoInput>
  }

  export type FollowUpUpdateManyWithWhereWithoutProcessoInput = {
    where: FollowUpScalarWhereInput
    data: XOR<FollowUpUpdateManyMutationInput, FollowUpUncheckedUpdateManyWithoutProcessoInput>
  }

  export type FollowUpScalarWhereInput = {
    AND?: FollowUpScalarWhereInput | FollowUpScalarWhereInput[]
    OR?: FollowUpScalarWhereInput[]
    NOT?: FollowUpScalarWhereInput | FollowUpScalarWhereInput[]
    id?: StringFilter<"FollowUp"> | string
    tenant_id?: StringFilter<"FollowUp"> | string
    product_id?: StringNullableFilter<"FollowUp"> | string | null
    user_id?: StringNullableFilter<"FollowUp"> | string | null
    processo_id?: StringFilter<"FollowUp"> | string
    titulo?: StringFilter<"FollowUp"> | string
    descricao?: StringNullableFilter<"FollowUp"> | string | null
    tipo?: StringFilter<"FollowUp"> | string
    categoria?: StringFilter<"FollowUp"> | string
    usuario_id?: StringNullableFilter<"FollowUp"> | string | null
    usuario_nome?: StringNullableFilter<"FollowUp"> | string | null
    created_at?: DateTimeFilter<"FollowUp"> | Date | string
  }

  export type DocumentoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    update: XOR<DocumentoUpdateWithoutProcessoInput, DocumentoUncheckedUpdateWithoutProcessoInput>
    create: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    data: XOR<DocumentoUpdateWithoutProcessoInput, DocumentoUncheckedUpdateWithoutProcessoInput>
  }

  export type DocumentoUpdateManyWithWhereWithoutProcessoInput = {
    where: DocumentoScalarWhereInput
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type DocumentoScalarWhereInput = {
    AND?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
    OR?: DocumentoScalarWhereInput[]
    NOT?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
    id?: StringFilter<"Documento"> | string
    tenant_id?: StringFilter<"Documento"> | string
    product_id?: StringNullableFilter<"Documento"> | string | null
    user_id?: StringNullableFilter<"Documento"> | string | null
    processo_id?: StringFilter<"Documento"> | string
    nome?: StringFilter<"Documento"> | string
    tipo_arquivo?: StringFilter<"Documento"> | string
    tamanho_bytes?: IntFilter<"Documento"> | number
    url?: StringFilter<"Documento"> | string
    categoria?: StringFilter<"Documento"> | string
    created_at?: DateTimeFilter<"Documento"> | Date | string
  }

  export type EstimativaCustoUpsertWithoutProcessoInput = {
    update: XOR<EstimativaCustoUpdateWithoutProcessoInput, EstimativaCustoUncheckedUpdateWithoutProcessoInput>
    create: XOR<EstimativaCustoCreateWithoutProcessoInput, EstimativaCustoUncheckedCreateWithoutProcessoInput>
    where?: EstimativaCustoWhereInput
  }

  export type EstimativaCustoUpdateToOneWithWhereWithoutProcessoInput = {
    where?: EstimativaCustoWhereInput
    data: XOR<EstimativaCustoUpdateWithoutProcessoInput, EstimativaCustoUncheckedUpdateWithoutProcessoInput>
  }

  export type EstimativaCustoUpdateWithoutProcessoInput = {
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

  export type EstimativaCustoUncheckedUpdateWithoutProcessoInput = {
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

  export type DadosTecnicosUpsertWithoutProcessoInput = {
    update: XOR<DadosTecnicosUpdateWithoutProcessoInput, DadosTecnicosUncheckedUpdateWithoutProcessoInput>
    create: XOR<DadosTecnicosCreateWithoutProcessoInput, DadosTecnicosUncheckedCreateWithoutProcessoInput>
    where?: DadosTecnicosWhereInput
  }

  export type DadosTecnicosUpdateToOneWithWhereWithoutProcessoInput = {
    where?: DadosTecnicosWhereInput
    data: XOR<DadosTecnicosUpdateWithoutProcessoInput, DadosTecnicosUncheckedUpdateWithoutProcessoInput>
  }

  export type DadosTecnicosUpdateWithoutProcessoInput = {
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

  export type DadosTecnicosUncheckedUpdateWithoutProcessoInput = {
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

  export type ProcessoCreateWithoutEtapasInput = {
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
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutEtapasInput = {
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
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutEtapasInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutEtapasInput, ProcessoUncheckedCreateWithoutEtapasInput>
  }

  export type ProcessoUpsertWithoutEtapasInput = {
    update: XOR<ProcessoUpdateWithoutEtapasInput, ProcessoUncheckedUpdateWithoutEtapasInput>
    create: XOR<ProcessoCreateWithoutEtapasInput, ProcessoUncheckedCreateWithoutEtapasInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutEtapasInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutEtapasInput, ProcessoUncheckedUpdateWithoutEtapasInput>
  }

  export type ProcessoUpdateWithoutEtapasInput = {
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
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutEtapasInput = {
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
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutPedidosInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutPedidosInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutPedidosInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutPedidosInput, ProcessoUncheckedCreateWithoutPedidosInput>
  }

  export type PedidoItemCreateWithoutPedidoInput = {
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

  export type PedidoItemUncheckedCreateWithoutPedidoInput = {
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

  export type PedidoItemCreateOrConnectWithoutPedidoInput = {
    where: PedidoItemWhereUniqueInput
    create: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput>
  }

  export type PedidoItemCreateManyPedidoInputEnvelope = {
    data: PedidoItemCreateManyPedidoInput | PedidoItemCreateManyPedidoInput[]
    skipDuplicates?: boolean
  }

  export type ProcessoUpsertWithoutPedidosInput = {
    update: XOR<ProcessoUpdateWithoutPedidosInput, ProcessoUncheckedUpdateWithoutPedidosInput>
    create: XOR<ProcessoCreateWithoutPedidosInput, ProcessoUncheckedCreateWithoutPedidosInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutPedidosInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutPedidosInput, ProcessoUncheckedUpdateWithoutPedidosInput>
  }

  export type ProcessoUpdateWithoutPedidosInput = {
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutPedidosInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type PedidoItemUpsertWithWhereUniqueWithoutPedidoInput = {
    where: PedidoItemWhereUniqueInput
    update: XOR<PedidoItemUpdateWithoutPedidoInput, PedidoItemUncheckedUpdateWithoutPedidoInput>
    create: XOR<PedidoItemCreateWithoutPedidoInput, PedidoItemUncheckedCreateWithoutPedidoInput>
  }

  export type PedidoItemUpdateWithWhereUniqueWithoutPedidoInput = {
    where: PedidoItemWhereUniqueInput
    data: XOR<PedidoItemUpdateWithoutPedidoInput, PedidoItemUncheckedUpdateWithoutPedidoInput>
  }

  export type PedidoItemUpdateManyWithWhereWithoutPedidoInput = {
    where: PedidoItemScalarWhereInput
    data: XOR<PedidoItemUpdateManyMutationInput, PedidoItemUncheckedUpdateManyWithoutPedidoInput>
  }

  export type PedidoItemScalarWhereInput = {
    AND?: PedidoItemScalarWhereInput | PedidoItemScalarWhereInput[]
    OR?: PedidoItemScalarWhereInput[]
    NOT?: PedidoItemScalarWhereInput | PedidoItemScalarWhereInput[]
    id?: StringFilter<"PedidoItem"> | string
    tenant_id?: StringFilter<"PedidoItem"> | string
    product_id?: StringNullableFilter<"PedidoItem"> | string | null
    user_id?: StringNullableFilter<"PedidoItem"> | string | null
    pedido_id?: StringFilter<"PedidoItem"> | string
    numero_item?: StringFilter<"PedidoItem"> | string
    descricao?: StringFilter<"PedidoItem"> | string
    ncm?: StringNullableFilter<"PedidoItem"> | string | null
    quantidade?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    unidade?: StringFilter<"PedidoItem"> | string
    valor_unitario?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    valor_total?: DecimalFilter<"PedidoItem"> | Decimal | DecimalJsLike | number | string
    moeda?: StringFilter<"PedidoItem"> | string
    status_li?: StringFilter<"PedidoItem"> | string
    campos_custom?: JsonNullableFilter<"PedidoItem">
    created_at?: DateTimeFilter<"PedidoItem"> | Date | string
    updated_at?: DateTimeFilter<"PedidoItem"> | Date | string
  }

  export type PedidoCreateWithoutItensInput = {
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
    processo: ProcessoCreateNestedOneWithoutPedidosInput
  }

  export type PedidoUncheckedCreateWithoutItensInput = {
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

  export type PedidoCreateOrConnectWithoutItensInput = {
    where: PedidoWhereUniqueInput
    create: XOR<PedidoCreateWithoutItensInput, PedidoUncheckedCreateWithoutItensInput>
  }

  export type PedidoUpsertWithoutItensInput = {
    update: XOR<PedidoUpdateWithoutItensInput, PedidoUncheckedUpdateWithoutItensInput>
    create: XOR<PedidoCreateWithoutItensInput, PedidoUncheckedCreateWithoutItensInput>
    where?: PedidoWhereInput
  }

  export type PedidoUpdateToOneWithWhereWithoutItensInput = {
    where?: PedidoWhereInput
    data: XOR<PedidoUpdateWithoutItensInput, PedidoUncheckedUpdateWithoutItensInput>
  }

  export type PedidoUpdateWithoutItensInput = {
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
    processo?: ProcessoUpdateOneRequiredWithoutPedidosNestedInput
  }

  export type PedidoUncheckedUpdateWithoutItensInput = {
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

  export type ProcessoCreateWithoutFollowUpsInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutFollowUpsInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutFollowUpsInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutFollowUpsInput, ProcessoUncheckedCreateWithoutFollowUpsInput>
  }

  export type ProcessoUpsertWithoutFollowUpsInput = {
    update: XOR<ProcessoUpdateWithoutFollowUpsInput, ProcessoUncheckedUpdateWithoutFollowUpsInput>
    create: XOR<ProcessoCreateWithoutFollowUpsInput, ProcessoUncheckedCreateWithoutFollowUpsInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutFollowUpsInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutFollowUpsInput, ProcessoUncheckedUpdateWithoutFollowUpsInput>
  }

  export type ProcessoUpdateWithoutFollowUpsInput = {
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutFollowUpsInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutDocumentosInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutDocumentosInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutDocumentosInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutEstimativaCustoInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutEstimativaCustoInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    dadosTecnicos?: DadosTecnicosUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutEstimativaCustoInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutEstimativaCustoInput, ProcessoUncheckedCreateWithoutEstimativaCustoInput>
  }

  export type ProcessoUpsertWithoutEstimativaCustoInput = {
    update: XOR<ProcessoUpdateWithoutEstimativaCustoInput, ProcessoUncheckedUpdateWithoutEstimativaCustoInput>
    create: XOR<ProcessoCreateWithoutEstimativaCustoInput, ProcessoUncheckedCreateWithoutEstimativaCustoInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutEstimativaCustoInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutEstimativaCustoInput, ProcessoUncheckedUpdateWithoutEstimativaCustoInput>
  }

  export type ProcessoUpdateWithoutEstimativaCustoInput = {
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutEstimativaCustoInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    dadosTecnicos?: DadosTecnicosUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoCreateWithoutDadosTecnicosInput = {
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
    etapas?: ProcessoEtapaCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateWithoutDadosTecnicosInput = {
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
    etapas?: ProcessoEtapaUncheckedCreateNestedManyWithoutProcessoInput
    pedidos?: PedidoUncheckedCreateNestedManyWithoutProcessoInput
    followUps?: FollowUpUncheckedCreateNestedManyWithoutProcessoInput
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
    estimativaCusto?: EstimativaCustoUncheckedCreateNestedOneWithoutProcessoInput
  }

  export type ProcessoCreateOrConnectWithoutDadosTecnicosInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutDadosTecnicosInput, ProcessoUncheckedCreateWithoutDadosTecnicosInput>
  }

  export type ProcessoUpsertWithoutDadosTecnicosInput = {
    update: XOR<ProcessoUpdateWithoutDadosTecnicosInput, ProcessoUncheckedUpdateWithoutDadosTecnicosInput>
    create: XOR<ProcessoCreateWithoutDadosTecnicosInput, ProcessoUncheckedCreateWithoutDadosTecnicosInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutDadosTecnicosInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutDadosTecnicosInput, ProcessoUncheckedUpdateWithoutDadosTecnicosInput>
  }

  export type ProcessoUpdateWithoutDadosTecnicosInput = {
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
    etapas?: ProcessoEtapaUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateWithoutDadosTecnicosInput = {
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
    etapas?: ProcessoEtapaUncheckedUpdateManyWithoutProcessoNestedInput
    pedidos?: PedidoUncheckedUpdateManyWithoutProcessoNestedInput
    followUps?: FollowUpUncheckedUpdateManyWithoutProcessoNestedInput
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
    estimativaCusto?: EstimativaCustoUncheckedUpdateOneWithoutProcessoNestedInput
  }

  export type ProcessoEtapaCreateManyProcessoInput = {
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

  export type PedidoCreateManyProcessoInput = {
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

  export type FollowUpCreateManyProcessoInput = {
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

  export type DocumentoCreateManyProcessoInput = {
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

  export type ProcessoEtapaUpdateWithoutProcessoInput = {
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

  export type ProcessoEtapaUncheckedUpdateWithoutProcessoInput = {
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

  export type ProcessoEtapaUncheckedUpdateManyWithoutProcessoInput = {
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

  export type PedidoUpdateWithoutProcessoInput = {
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
    itens?: PedidoItemUpdateManyWithoutPedidoNestedInput
  }

  export type PedidoUncheckedUpdateWithoutProcessoInput = {
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
    itens?: PedidoItemUncheckedUpdateManyWithoutPedidoNestedInput
  }

  export type PedidoUncheckedUpdateManyWithoutProcessoInput = {
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

  export type FollowUpUpdateWithoutProcessoInput = {
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

  export type FollowUpUncheckedUpdateWithoutProcessoInput = {
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

  export type FollowUpUncheckedUpdateManyWithoutProcessoInput = {
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

  export type DocumentoUpdateWithoutProcessoInput = {
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

  export type DocumentoUncheckedUpdateWithoutProcessoInput = {
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

  export type DocumentoUncheckedUpdateManyWithoutProcessoInput = {
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

  export type PedidoItemCreateManyPedidoInput = {
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

  export type PedidoItemUpdateWithoutPedidoInput = {
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

  export type PedidoItemUncheckedUpdateWithoutPedidoInput = {
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

  export type PedidoItemUncheckedUpdateManyWithoutPedidoInput = {
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
     * @deprecated Use ProcessoCountOutputTypeDefaultArgs instead
     */
    export type ProcessoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoCountOutputTypeDefaultArgs instead
     */
    export type PedidoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoDefaultArgs instead
     */
    export type ProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoEtapaDefaultArgs instead
     */
    export type ProcessoEtapaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoEtapaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoDefaultArgs instead
     */
    export type PedidoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoItemDefaultArgs instead
     */
    export type PedidoItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FollowUpDefaultArgs instead
     */
    export type FollowUpArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FollowUpDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DocumentoDefaultArgs instead
     */
    export type DocumentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DocumentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EstimativaCustoDefaultArgs instead
     */
    export type EstimativaCustoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EstimativaCustoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DadosTecnicosDefaultArgs instead
     */
    export type DadosTecnicosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DadosTecnicosDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoStatusDefaultArgs instead
     */
    export type PedidoStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoStatusDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoColunaDefaultArgs instead
     */
    export type PedidoColunaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoColunaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoPreferenciaUsuarioDefaultArgs instead
     */
    export type PedidoPreferenciaUsuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoPreferenciaUsuarioDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PedidoPreferenciaPadraoDefaultArgs instead
     */
    export type PedidoPreferenciaPadraoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PedidoPreferenciaPadraoDefaultArgs<ExtArgs>

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