
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
 * Model NCM
 * 
 */
export type NCM = $Result.DefaultSelection<Prisma.$NCMPayload>
/**
 * Model OPE
 * 
 */
export type OPE = $Result.DefaultSelection<Prisma.$OPEPayload>
/**
 * Model OpeHistoricoStatus
 * 
 */
export type OpeHistoricoStatus = $Result.DefaultSelection<Prisma.$OpeHistoricoStatusPayload>

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
   * `prisma.nCM`: Exposes CRUD operations for the **NCM** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NCMS
    * const nCMS = await prisma.nCM.findMany()
    * ```
    */
  get nCM(): Prisma.NCMDelegate<ExtArgs>;

  /**
   * `prisma.oPE`: Exposes CRUD operations for the **OPE** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OPES
    * const oPES = await prisma.oPE.findMany()
    * ```
    */
  get oPE(): Prisma.OPEDelegate<ExtArgs>;

  /**
   * `prisma.opeHistoricoStatus`: Exposes CRUD operations for the **OpeHistoricoStatus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OpeHistoricoStatuses
    * const opeHistoricoStatuses = await prisma.opeHistoricoStatus.findMany()
    * ```
    */
  get opeHistoricoStatus(): Prisma.OpeHistoricoStatusDelegate<ExtArgs>;
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
    Moeda: 'Moeda',
    Unidade: 'Unidade',
    NCM: 'NCM',
    OPE: 'OPE',
    OpeHistoricoStatus: 'OpeHistoricoStatus'
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
      modelProps: "empresa" | "moeda" | "unidade" | "nCM" | "oPE" | "opeHistoricoStatus"
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
      NCM: {
        payload: Prisma.$NCMPayload<ExtArgs>
        fields: Prisma.NCMFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NCMFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NCMFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          findFirst: {
            args: Prisma.NCMFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NCMFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          findMany: {
            args: Prisma.NCMFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>[]
          }
          create: {
            args: Prisma.NCMCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          createMany: {
            args: Prisma.NCMCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NCMCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>[]
          }
          delete: {
            args: Prisma.NCMDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          update: {
            args: Prisma.NCMUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          deleteMany: {
            args: Prisma.NCMDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NCMUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NCMUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NCMPayload>
          }
          aggregate: {
            args: Prisma.NCMAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNCM>
          }
          groupBy: {
            args: Prisma.NCMGroupByArgs<ExtArgs>
            result: $Utils.Optional<NCMGroupByOutputType>[]
          }
          count: {
            args: Prisma.NCMCountArgs<ExtArgs>
            result: $Utils.Optional<NCMCountAggregateOutputType> | number
          }
        }
      }
      OPE: {
        payload: Prisma.$OPEPayload<ExtArgs>
        fields: Prisma.OPEFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OPEFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OPEFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          findFirst: {
            args: Prisma.OPEFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OPEFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          findMany: {
            args: Prisma.OPEFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>[]
          }
          create: {
            args: Prisma.OPECreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          createMany: {
            args: Prisma.OPECreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OPECreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>[]
          }
          delete: {
            args: Prisma.OPEDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          update: {
            args: Prisma.OPEUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          deleteMany: {
            args: Prisma.OPEDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OPEUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OPEUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OPEPayload>
          }
          aggregate: {
            args: Prisma.OPEAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOPE>
          }
          groupBy: {
            args: Prisma.OPEGroupByArgs<ExtArgs>
            result: $Utils.Optional<OPEGroupByOutputType>[]
          }
          count: {
            args: Prisma.OPECountArgs<ExtArgs>
            result: $Utils.Optional<OPECountAggregateOutputType> | number
          }
        }
      }
      OpeHistoricoStatus: {
        payload: Prisma.$OpeHistoricoStatusPayload<ExtArgs>
        fields: Prisma.OpeHistoricoStatusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OpeHistoricoStatusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OpeHistoricoStatusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          findFirst: {
            args: Prisma.OpeHistoricoStatusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OpeHistoricoStatusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          findMany: {
            args: Prisma.OpeHistoricoStatusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>[]
          }
          create: {
            args: Prisma.OpeHistoricoStatusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          createMany: {
            args: Prisma.OpeHistoricoStatusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OpeHistoricoStatusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>[]
          }
          delete: {
            args: Prisma.OpeHistoricoStatusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          update: {
            args: Prisma.OpeHistoricoStatusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          deleteMany: {
            args: Prisma.OpeHistoricoStatusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OpeHistoricoStatusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OpeHistoricoStatusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpeHistoricoStatusPayload>
          }
          aggregate: {
            args: Prisma.OpeHistoricoStatusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOpeHistoricoStatus>
          }
          groupBy: {
            args: Prisma.OpeHistoricoStatusGroupByArgs<ExtArgs>
            result: $Utils.Optional<OpeHistoricoStatusGroupByOutputType>[]
          }
          count: {
            args: Prisma.OpeHistoricoStatusCountArgs<ExtArgs>
            result: $Utils.Optional<OpeHistoricoStatusCountAggregateOutputType> | number
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
    id_organizacao: string | null
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
    ativo_empresa: boolean | null
    criado_em_empresa: Date | null
    atualizado_em_empresa: Date | null
    pode_ser_armazem_alfandegado_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean | null
    pode_ser_cia_aerea_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean | null
    pode_ser_seguradora_internacional_empresa: boolean | null
    pode_ser_seguradora_corretora_cambio_empresa: boolean | null
    pode_ser_banco_empresa: boolean | null
    pode_ser_armazem_nacional_empresa: boolean | null
  }

  export type EmpresaMaxAggregateOutputType = {
    suid_empresa: string | null
    id_organizacao: string | null
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
    ativo_empresa: boolean | null
    criado_em_empresa: Date | null
    atualizado_em_empresa: Date | null
    pode_ser_armazem_alfandegado_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean | null
    pode_ser_cia_aerea_empresa: boolean | null
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean | null
    pode_ser_seguradora_internacional_empresa: boolean | null
    pode_ser_seguradora_corretora_cambio_empresa: boolean | null
    pode_ser_banco_empresa: boolean | null
    pode_ser_armazem_nacional_empresa: boolean | null
  }

  export type EmpresaCountAggregateOutputType = {
    suid_empresa: number
    id_organizacao: number
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
    ativo_empresa: number
    criado_em_empresa: number
    atualizado_em_empresa: number
    pode_ser_armazem_alfandegado_empresa: number
    pode_ser_transportadora_rodoviaria_nacional_empresa: number
    pode_ser_cia_aerea_empresa: number
    pode_ser_transportadora_rodoviaria_internacional_empresa: number
    pode_ser_seguradora_internacional_empresa: number
    pode_ser_seguradora_corretora_cambio_empresa: number
    pode_ser_banco_empresa: number
    pode_ser_armazem_nacional_empresa: number
    _all: number
  }


  export type EmpresaMinAggregateInputType = {
    suid_empresa?: true
    id_organizacao?: true
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
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
  }

  export type EmpresaMaxAggregateInputType = {
    suid_empresa?: true
    id_organizacao?: true
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
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
  }

  export type EmpresaCountAggregateInputType = {
    suid_empresa?: true
    id_organizacao?: true
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
    ativo_empresa?: true
    criado_em_empresa?: true
    atualizado_em_empresa?: true
    pode_ser_armazem_alfandegado_empresa?: true
    pode_ser_transportadora_rodoviaria_nacional_empresa?: true
    pode_ser_cia_aerea_empresa?: true
    pode_ser_transportadora_rodoviaria_internacional_empresa?: true
    pode_ser_seguradora_internacional_empresa?: true
    pode_ser_seguradora_corretora_cambio_empresa?: true
    pode_ser_banco_empresa?: true
    pode_ser_armazem_nacional_empresa?: true
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
    id_organizacao: string
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
    ativo_empresa: boolean
    criado_em_empresa: Date
    atualizado_em_empresa: Date
    pode_ser_armazem_alfandegado_empresa: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
    pode_ser_cia_aerea_empresa: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
    pode_ser_seguradora_internacional_empresa: boolean
    pode_ser_seguradora_corretora_cambio_empresa: boolean
    pode_ser_banco_empresa: boolean
    pode_ser_armazem_nacional_empresa: boolean
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
    id_organizacao?: boolean
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
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }, ExtArgs["result"]["empresa"]>

  export type EmpresaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_empresa?: boolean
    id_organizacao?: boolean
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
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }, ExtArgs["result"]["empresa"]>

  export type EmpresaSelectScalar = {
    suid_empresa?: boolean
    id_organizacao?: boolean
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
    ativo_empresa?: boolean
    criado_em_empresa?: boolean
    atualizado_em_empresa?: boolean
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }


  export type $EmpresaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Empresa"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      suid_empresa: string
      id_organizacao: string
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
      ativo_empresa: boolean
      criado_em_empresa: Date
      atualizado_em_empresa: Date
      pode_ser_armazem_alfandegado_empresa: boolean
      pode_ser_transportadora_rodoviaria_nacional_empresa: boolean
      pode_ser_cia_aerea_empresa: boolean
      pode_ser_transportadora_rodoviaria_internacional_empresa: boolean
      pode_ser_seguradora_internacional_empresa: boolean
      pode_ser_seguradora_corretora_cambio_empresa: boolean
      pode_ser_banco_empresa: boolean
      pode_ser_armazem_nacional_empresa: boolean
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
    readonly id_organizacao: FieldRef<"Empresa", 'String'>
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
    readonly ativo_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly criado_em_empresa: FieldRef<"Empresa", 'DateTime'>
    readonly atualizado_em_empresa: FieldRef<"Empresa", 'DateTime'>
    readonly pode_ser_armazem_alfandegado_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_nacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_cia_aerea_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_transportadora_rodoviaria_internacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_seguradora_internacional_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_seguradora_corretora_cambio_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_banco_empresa: FieldRef<"Empresa", 'Boolean'>
    readonly pode_ser_armazem_nacional_empresa: FieldRef<"Empresa", 'Boolean'>
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
   * Model Moeda
   */

  export type AggregateMoeda = {
    _count: MoedaCountAggregateOutputType | null
    _min: MoedaMinAggregateOutputType | null
    _max: MoedaMaxAggregateOutputType | null
  }

  export type MoedaMinAggregateOutputType = {
    codigo_moeda: string | null
    simbolo_moeda: string | null
    ativo_moeda: boolean | null
  }

  export type MoedaMaxAggregateOutputType = {
    codigo_moeda: string | null
    simbolo_moeda: string | null
    ativo_moeda: boolean | null
  }

  export type MoedaCountAggregateOutputType = {
    codigo_moeda: number
    simbolo_moeda: number
    ativo_moeda: number
    _all: number
  }


  export type MoedaMinAggregateInputType = {
    codigo_moeda?: true
    simbolo_moeda?: true
    ativo_moeda?: true
  }

  export type MoedaMaxAggregateInputType = {
    codigo_moeda?: true
    simbolo_moeda?: true
    ativo_moeda?: true
  }

  export type MoedaCountAggregateInputType = {
    codigo_moeda?: true
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
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }, ExtArgs["result"]["moeda"]>

  export type MoedaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_moeda?: boolean
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }, ExtArgs["result"]["moeda"]>

  export type MoedaSelectScalar = {
    codigo_moeda?: boolean
    simbolo_moeda?: boolean
    ativo_moeda?: boolean
  }


  export type $MoedaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Moeda"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_moeda: string
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
   * Model NCM
   */

  export type AggregateNCM = {
    _count: NCMCountAggregateOutputType | null
    _avg: NCMAvgAggregateOutputType | null
    _sum: NCMSumAggregateOutputType | null
    _min: NCMMinAggregateOutputType | null
    _max: NCMMaxAggregateOutputType | null
  }

  export type NCMAvgAggregateOutputType = {
    ipi_ncm: number | null
    ii_ncm: number | null
    pis_ncm: number | null
    cofins_ncm: number | null
  }

  export type NCMSumAggregateOutputType = {
    ipi_ncm: number | null
    ii_ncm: number | null
    pis_ncm: number | null
    cofins_ncm: number | null
  }

  export type NCMMinAggregateOutputType = {
    codigo_ncm: string | null
    descricao_ncm: string | null
    ipi_ncm: number | null
    ii_ncm: number | null
    ativo_ncm: boolean | null
    pis_ncm: number | null
    cofins_ncm: number | null
  }

  export type NCMMaxAggregateOutputType = {
    codigo_ncm: string | null
    descricao_ncm: string | null
    ipi_ncm: number | null
    ii_ncm: number | null
    ativo_ncm: boolean | null
    pis_ncm: number | null
    cofins_ncm: number | null
  }

  export type NCMCountAggregateOutputType = {
    codigo_ncm: number
    descricao_ncm: number
    ipi_ncm: number
    ii_ncm: number
    ativo_ncm: number
    pis_ncm: number
    cofins_ncm: number
    _all: number
  }


  export type NCMAvgAggregateInputType = {
    ipi_ncm?: true
    ii_ncm?: true
    pis_ncm?: true
    cofins_ncm?: true
  }

  export type NCMSumAggregateInputType = {
    ipi_ncm?: true
    ii_ncm?: true
    pis_ncm?: true
    cofins_ncm?: true
  }

  export type NCMMinAggregateInputType = {
    codigo_ncm?: true
    descricao_ncm?: true
    ipi_ncm?: true
    ii_ncm?: true
    ativo_ncm?: true
    pis_ncm?: true
    cofins_ncm?: true
  }

  export type NCMMaxAggregateInputType = {
    codigo_ncm?: true
    descricao_ncm?: true
    ipi_ncm?: true
    ii_ncm?: true
    ativo_ncm?: true
    pis_ncm?: true
    cofins_ncm?: true
  }

  export type NCMCountAggregateInputType = {
    codigo_ncm?: true
    descricao_ncm?: true
    ipi_ncm?: true
    ii_ncm?: true
    ativo_ncm?: true
    pis_ncm?: true
    cofins_ncm?: true
    _all?: true
  }

  export type NCMAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NCM to aggregate.
     */
    where?: NCMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NCMS to fetch.
     */
    orderBy?: NCMOrderByWithRelationInput | NCMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NCMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NCMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NCMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NCMS
    **/
    _count?: true | NCMCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NCMAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NCMSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NCMMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NCMMaxAggregateInputType
  }

  export type GetNCMAggregateType<T extends NCMAggregateArgs> = {
        [P in keyof T & keyof AggregateNCM]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNCM[P]>
      : GetScalarType<T[P], AggregateNCM[P]>
  }




  export type NCMGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NCMWhereInput
    orderBy?: NCMOrderByWithAggregationInput | NCMOrderByWithAggregationInput[]
    by: NCMScalarFieldEnum[] | NCMScalarFieldEnum
    having?: NCMScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NCMCountAggregateInputType | true
    _avg?: NCMAvgAggregateInputType
    _sum?: NCMSumAggregateInputType
    _min?: NCMMinAggregateInputType
    _max?: NCMMaxAggregateInputType
  }

  export type NCMGroupByOutputType = {
    codigo_ncm: string
    descricao_ncm: string
    ipi_ncm: number | null
    ii_ncm: number | null
    ativo_ncm: boolean
    pis_ncm: number | null
    cofins_ncm: number | null
    _count: NCMCountAggregateOutputType | null
    _avg: NCMAvgAggregateOutputType | null
    _sum: NCMSumAggregateOutputType | null
    _min: NCMMinAggregateOutputType | null
    _max: NCMMaxAggregateOutputType | null
  }

  type GetNCMGroupByPayload<T extends NCMGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NCMGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NCMGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NCMGroupByOutputType[P]>
            : GetScalarType<T[P], NCMGroupByOutputType[P]>
        }
      >
    >


  export type NCMSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_ncm?: boolean
    descricao_ncm?: boolean
    ipi_ncm?: boolean
    ii_ncm?: boolean
    ativo_ncm?: boolean
    pis_ncm?: boolean
    cofins_ncm?: boolean
  }, ExtArgs["result"]["nCM"]>

  export type NCMSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    codigo_ncm?: boolean
    descricao_ncm?: boolean
    ipi_ncm?: boolean
    ii_ncm?: boolean
    ativo_ncm?: boolean
    pis_ncm?: boolean
    cofins_ncm?: boolean
  }, ExtArgs["result"]["nCM"]>

  export type NCMSelectScalar = {
    codigo_ncm?: boolean
    descricao_ncm?: boolean
    ipi_ncm?: boolean
    ii_ncm?: boolean
    ativo_ncm?: boolean
    pis_ncm?: boolean
    cofins_ncm?: boolean
  }


  export type $NCMPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NCM"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      codigo_ncm: string
      descricao_ncm: string
      ipi_ncm: number | null
      ii_ncm: number | null
      ativo_ncm: boolean
      pis_ncm: number | null
      cofins_ncm: number | null
    }, ExtArgs["result"]["nCM"]>
    composites: {}
  }

  type NCMGetPayload<S extends boolean | null | undefined | NCMDefaultArgs> = $Result.GetResult<Prisma.$NCMPayload, S>

  type NCMCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NCMFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NCMCountAggregateInputType | true
    }

  export interface NCMDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NCM'], meta: { name: 'NCM' } }
    /**
     * Find zero or one NCM that matches the filter.
     * @param {NCMFindUniqueArgs} args - Arguments to find a NCM
     * @example
     * // Get one NCM
     * const nCM = await prisma.nCM.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NCMFindUniqueArgs>(args: SelectSubset<T, NCMFindUniqueArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one NCM that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NCMFindUniqueOrThrowArgs} args - Arguments to find a NCM
     * @example
     * // Get one NCM
     * const nCM = await prisma.nCM.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NCMFindUniqueOrThrowArgs>(args: SelectSubset<T, NCMFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first NCM that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMFindFirstArgs} args - Arguments to find a NCM
     * @example
     * // Get one NCM
     * const nCM = await prisma.nCM.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NCMFindFirstArgs>(args?: SelectSubset<T, NCMFindFirstArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first NCM that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMFindFirstOrThrowArgs} args - Arguments to find a NCM
     * @example
     * // Get one NCM
     * const nCM = await prisma.nCM.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NCMFindFirstOrThrowArgs>(args?: SelectSubset<T, NCMFindFirstOrThrowArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more NCMS that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NCMS
     * const nCMS = await prisma.nCM.findMany()
     * 
     * // Get first 10 NCMS
     * const nCMS = await prisma.nCM.findMany({ take: 10 })
     * 
     * // Only select the `codigo_ncm`
     * const nCMWithCodigo_ncmOnly = await prisma.nCM.findMany({ select: { codigo_ncm: true } })
     * 
     */
    findMany<T extends NCMFindManyArgs>(args?: SelectSubset<T, NCMFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a NCM.
     * @param {NCMCreateArgs} args - Arguments to create a NCM.
     * @example
     * // Create one NCM
     * const NCM = await prisma.nCM.create({
     *   data: {
     *     // ... data to create a NCM
     *   }
     * })
     * 
     */
    create<T extends NCMCreateArgs>(args: SelectSubset<T, NCMCreateArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many NCMS.
     * @param {NCMCreateManyArgs} args - Arguments to create many NCMS.
     * @example
     * // Create many NCMS
     * const nCM = await prisma.nCM.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NCMCreateManyArgs>(args?: SelectSubset<T, NCMCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NCMS and returns the data saved in the database.
     * @param {NCMCreateManyAndReturnArgs} args - Arguments to create many NCMS.
     * @example
     * // Create many NCMS
     * const nCM = await prisma.nCM.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NCMS and only return the `codigo_ncm`
     * const nCMWithCodigo_ncmOnly = await prisma.nCM.createManyAndReturn({ 
     *   select: { codigo_ncm: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NCMCreateManyAndReturnArgs>(args?: SelectSubset<T, NCMCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a NCM.
     * @param {NCMDeleteArgs} args - Arguments to delete one NCM.
     * @example
     * // Delete one NCM
     * const NCM = await prisma.nCM.delete({
     *   where: {
     *     // ... filter to delete one NCM
     *   }
     * })
     * 
     */
    delete<T extends NCMDeleteArgs>(args: SelectSubset<T, NCMDeleteArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one NCM.
     * @param {NCMUpdateArgs} args - Arguments to update one NCM.
     * @example
     * // Update one NCM
     * const nCM = await prisma.nCM.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NCMUpdateArgs>(args: SelectSubset<T, NCMUpdateArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more NCMS.
     * @param {NCMDeleteManyArgs} args - Arguments to filter NCMS to delete.
     * @example
     * // Delete a few NCMS
     * const { count } = await prisma.nCM.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NCMDeleteManyArgs>(args?: SelectSubset<T, NCMDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NCMS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NCMS
     * const nCM = await prisma.nCM.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NCMUpdateManyArgs>(args: SelectSubset<T, NCMUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NCM.
     * @param {NCMUpsertArgs} args - Arguments to update or create a NCM.
     * @example
     * // Update or create a NCM
     * const nCM = await prisma.nCM.upsert({
     *   create: {
     *     // ... data to create a NCM
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NCM we want to update
     *   }
     * })
     */
    upsert<T extends NCMUpsertArgs>(args: SelectSubset<T, NCMUpsertArgs<ExtArgs>>): Prisma__NCMClient<$Result.GetResult<Prisma.$NCMPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of NCMS.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMCountArgs} args - Arguments to filter NCMS to count.
     * @example
     * // Count the number of NCMS
     * const count = await prisma.nCM.count({
     *   where: {
     *     // ... the filter for the NCMS we want to count
     *   }
     * })
    **/
    count<T extends NCMCountArgs>(
      args?: Subset<T, NCMCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NCMCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NCM.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NCMAggregateArgs>(args: Subset<T, NCMAggregateArgs>): Prisma.PrismaPromise<GetNCMAggregateType<T>>

    /**
     * Group by NCM.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NCMGroupByArgs} args - Group by arguments.
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
      T extends NCMGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NCMGroupByArgs['orderBy'] }
        : { orderBy?: NCMGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NCMGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNCMGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NCM model
   */
  readonly fields: NCMFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NCM.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NCMClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the NCM model
   */ 
  interface NCMFieldRefs {
    readonly codigo_ncm: FieldRef<"NCM", 'String'>
    readonly descricao_ncm: FieldRef<"NCM", 'String'>
    readonly ipi_ncm: FieldRef<"NCM", 'Float'>
    readonly ii_ncm: FieldRef<"NCM", 'Float'>
    readonly ativo_ncm: FieldRef<"NCM", 'Boolean'>
    readonly pis_ncm: FieldRef<"NCM", 'Float'>
    readonly cofins_ncm: FieldRef<"NCM", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * NCM findUnique
   */
  export type NCMFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter, which NCM to fetch.
     */
    where: NCMWhereUniqueInput
  }

  /**
   * NCM findUniqueOrThrow
   */
  export type NCMFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter, which NCM to fetch.
     */
    where: NCMWhereUniqueInput
  }

  /**
   * NCM findFirst
   */
  export type NCMFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter, which NCM to fetch.
     */
    where?: NCMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NCMS to fetch.
     */
    orderBy?: NCMOrderByWithRelationInput | NCMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NCMS.
     */
    cursor?: NCMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NCMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NCMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NCMS.
     */
    distinct?: NCMScalarFieldEnum | NCMScalarFieldEnum[]
  }

  /**
   * NCM findFirstOrThrow
   */
  export type NCMFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter, which NCM to fetch.
     */
    where?: NCMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NCMS to fetch.
     */
    orderBy?: NCMOrderByWithRelationInput | NCMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NCMS.
     */
    cursor?: NCMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NCMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NCMS.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NCMS.
     */
    distinct?: NCMScalarFieldEnum | NCMScalarFieldEnum[]
  }

  /**
   * NCM findMany
   */
  export type NCMFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter, which NCMS to fetch.
     */
    where?: NCMWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NCMS to fetch.
     */
    orderBy?: NCMOrderByWithRelationInput | NCMOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NCMS.
     */
    cursor?: NCMWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NCMS from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NCMS.
     */
    skip?: number
    distinct?: NCMScalarFieldEnum | NCMScalarFieldEnum[]
  }

  /**
   * NCM create
   */
  export type NCMCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * The data needed to create a NCM.
     */
    data: XOR<NCMCreateInput, NCMUncheckedCreateInput>
  }

  /**
   * NCM createMany
   */
  export type NCMCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NCMS.
     */
    data: NCMCreateManyInput | NCMCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NCM createManyAndReturn
   */
  export type NCMCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many NCMS.
     */
    data: NCMCreateManyInput | NCMCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NCM update
   */
  export type NCMUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * The data needed to update a NCM.
     */
    data: XOR<NCMUpdateInput, NCMUncheckedUpdateInput>
    /**
     * Choose, which NCM to update.
     */
    where: NCMWhereUniqueInput
  }

  /**
   * NCM updateMany
   */
  export type NCMUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NCMS.
     */
    data: XOR<NCMUpdateManyMutationInput, NCMUncheckedUpdateManyInput>
    /**
     * Filter which NCMS to update
     */
    where?: NCMWhereInput
  }

  /**
   * NCM upsert
   */
  export type NCMUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * The filter to search for the NCM to update in case it exists.
     */
    where: NCMWhereUniqueInput
    /**
     * In case the NCM found by the `where` argument doesn't exist, create a new NCM with this data.
     */
    create: XOR<NCMCreateInput, NCMUncheckedCreateInput>
    /**
     * In case the NCM was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NCMUpdateInput, NCMUncheckedUpdateInput>
  }

  /**
   * NCM delete
   */
  export type NCMDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
    /**
     * Filter which NCM to delete.
     */
    where: NCMWhereUniqueInput
  }

  /**
   * NCM deleteMany
   */
  export type NCMDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NCMS to delete
     */
    where?: NCMWhereInput
  }

  /**
   * NCM without action
   */
  export type NCMDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NCM
     */
    select?: NCMSelect<ExtArgs> | null
  }


  /**
   * Model OPE
   */

  export type AggregateOPE = {
    _count: OPECountAggregateOutputType | null
    _min: OPEMinAggregateOutputType | null
    _max: OPEMaxAggregateOutputType | null
  }

  export type OPEMinAggregateOutputType = {
    suid_ope: string | null
    id_organizacao: string | null
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

  export type OPEMaxAggregateOutputType = {
    suid_ope: string | null
    id_organizacao: string | null
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

  export type OPECountAggregateOutputType = {
    suid_ope: number
    id_organizacao: number
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


  export type OPEMinAggregateInputType = {
    suid_ope?: true
    id_organizacao?: true
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

  export type OPEMaxAggregateInputType = {
    suid_ope?: true
    id_organizacao?: true
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

  export type OPECountAggregateInputType = {
    suid_ope?: true
    id_organizacao?: true
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

  export type OPEAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OPE to aggregate.
     */
    where?: OPEWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPES to fetch.
     */
    orderBy?: OPEOrderByWithRelationInput | OPEOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OPEWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPES from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPES.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OPES
    **/
    _count?: true | OPECountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OPEMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OPEMaxAggregateInputType
  }

  export type GetOPEAggregateType<T extends OPEAggregateArgs> = {
        [P in keyof T & keyof AggregateOPE]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOPE[P]>
      : GetScalarType<T[P], AggregateOPE[P]>
  }




  export type OPEGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OPEWhereInput
    orderBy?: OPEOrderByWithAggregationInput | OPEOrderByWithAggregationInput[]
    by: OPEScalarFieldEnum[] | OPEScalarFieldEnum
    having?: OPEScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OPECountAggregateInputType | true
    _min?: OPEMinAggregateInputType
    _max?: OPEMaxAggregateInputType
  }

  export type OPEGroupByOutputType = {
    suid_ope: string
    id_organizacao: string
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
    _count: OPECountAggregateOutputType | null
    _min: OPEMinAggregateOutputType | null
    _max: OPEMaxAggregateOutputType | null
  }

  type GetOPEGroupByPayload<T extends OPEGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OPEGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OPEGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OPEGroupByOutputType[P]>
            : GetScalarType<T[P], OPEGroupByOutputType[P]>
        }
      >
    >


  export type OPESelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_ope?: boolean
    id_organizacao?: boolean
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
  }, ExtArgs["result"]["oPE"]>

  export type OPESelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    suid_ope?: boolean
    id_organizacao?: boolean
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
  }, ExtArgs["result"]["oPE"]>

  export type OPESelectScalar = {
    suid_ope?: boolean
    id_organizacao?: boolean
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


  export type $OPEPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OPE"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      suid_ope: string
      id_organizacao: string
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
    }, ExtArgs["result"]["oPE"]>
    composites: {}
  }

  type OPEGetPayload<S extends boolean | null | undefined | OPEDefaultArgs> = $Result.GetResult<Prisma.$OPEPayload, S>

  type OPECountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OPEFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OPECountAggregateInputType | true
    }

  export interface OPEDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OPE'], meta: { name: 'OPE' } }
    /**
     * Find zero or one OPE that matches the filter.
     * @param {OPEFindUniqueArgs} args - Arguments to find a OPE
     * @example
     * // Get one OPE
     * const oPE = await prisma.oPE.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OPEFindUniqueArgs>(args: SelectSubset<T, OPEFindUniqueArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OPE that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OPEFindUniqueOrThrowArgs} args - Arguments to find a OPE
     * @example
     * // Get one OPE
     * const oPE = await prisma.oPE.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OPEFindUniqueOrThrowArgs>(args: SelectSubset<T, OPEFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OPE that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEFindFirstArgs} args - Arguments to find a OPE
     * @example
     * // Get one OPE
     * const oPE = await prisma.oPE.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OPEFindFirstArgs>(args?: SelectSubset<T, OPEFindFirstArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OPE that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEFindFirstOrThrowArgs} args - Arguments to find a OPE
     * @example
     * // Get one OPE
     * const oPE = await prisma.oPE.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OPEFindFirstOrThrowArgs>(args?: SelectSubset<T, OPEFindFirstOrThrowArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OPES that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OPES
     * const oPES = await prisma.oPE.findMany()
     * 
     * // Get first 10 OPES
     * const oPES = await prisma.oPE.findMany({ take: 10 })
     * 
     * // Only select the `suid_ope`
     * const oPEWithSuid_opeOnly = await prisma.oPE.findMany({ select: { suid_ope: true } })
     * 
     */
    findMany<T extends OPEFindManyArgs>(args?: SelectSubset<T, OPEFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OPE.
     * @param {OPECreateArgs} args - Arguments to create a OPE.
     * @example
     * // Create one OPE
     * const OPE = await prisma.oPE.create({
     *   data: {
     *     // ... data to create a OPE
     *   }
     * })
     * 
     */
    create<T extends OPECreateArgs>(args: SelectSubset<T, OPECreateArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OPES.
     * @param {OPECreateManyArgs} args - Arguments to create many OPES.
     * @example
     * // Create many OPES
     * const oPE = await prisma.oPE.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OPECreateManyArgs>(args?: SelectSubset<T, OPECreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OPES and returns the data saved in the database.
     * @param {OPECreateManyAndReturnArgs} args - Arguments to create many OPES.
     * @example
     * // Create many OPES
     * const oPE = await prisma.oPE.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OPES and only return the `suid_ope`
     * const oPEWithSuid_opeOnly = await prisma.oPE.createManyAndReturn({ 
     *   select: { suid_ope: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OPECreateManyAndReturnArgs>(args?: SelectSubset<T, OPECreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OPE.
     * @param {OPEDeleteArgs} args - Arguments to delete one OPE.
     * @example
     * // Delete one OPE
     * const OPE = await prisma.oPE.delete({
     *   where: {
     *     // ... filter to delete one OPE
     *   }
     * })
     * 
     */
    delete<T extends OPEDeleteArgs>(args: SelectSubset<T, OPEDeleteArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OPE.
     * @param {OPEUpdateArgs} args - Arguments to update one OPE.
     * @example
     * // Update one OPE
     * const oPE = await prisma.oPE.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OPEUpdateArgs>(args: SelectSubset<T, OPEUpdateArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OPES.
     * @param {OPEDeleteManyArgs} args - Arguments to filter OPES to delete.
     * @example
     * // Delete a few OPES
     * const { count } = await prisma.oPE.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OPEDeleteManyArgs>(args?: SelectSubset<T, OPEDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OPES.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OPES
     * const oPE = await prisma.oPE.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OPEUpdateManyArgs>(args: SelectSubset<T, OPEUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OPE.
     * @param {OPEUpsertArgs} args - Arguments to update or create a OPE.
     * @example
     * // Update or create a OPE
     * const oPE = await prisma.oPE.upsert({
     *   create: {
     *     // ... data to create a OPE
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OPE we want to update
     *   }
     * })
     */
    upsert<T extends OPEUpsertArgs>(args: SelectSubset<T, OPEUpsertArgs<ExtArgs>>): Prisma__OPEClient<$Result.GetResult<Prisma.$OPEPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OPES.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPECountArgs} args - Arguments to filter OPES to count.
     * @example
     * // Count the number of OPES
     * const count = await prisma.oPE.count({
     *   where: {
     *     // ... the filter for the OPES we want to count
     *   }
     * })
    **/
    count<T extends OPECountArgs>(
      args?: Subset<T, OPECountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OPECountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OPE.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OPEAggregateArgs>(args: Subset<T, OPEAggregateArgs>): Prisma.PrismaPromise<GetOPEAggregateType<T>>

    /**
     * Group by OPE.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OPEGroupByArgs} args - Group by arguments.
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
      T extends OPEGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OPEGroupByArgs['orderBy'] }
        : { orderBy?: OPEGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OPEGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOPEGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OPE model
   */
  readonly fields: OPEFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OPE.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OPEClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the OPE model
   */ 
  interface OPEFieldRefs {
    readonly suid_ope: FieldRef<"OPE", 'String'>
    readonly id_organizacao: FieldRef<"OPE", 'String'>
    readonly codigo_portal_unico_ope: FieldRef<"OPE", 'String'>
    readonly situacao_ope: FieldRef<"OPE", 'String'>
    readonly versao_ope: FieldRef<"OPE", 'String'>
    readonly nome_ope: FieldRef<"OPE", 'String'>
    readonly cnpj_raiz_empresa_ope: FieldRef<"OPE", 'String'>
    readonly pais_ope: FieldRef<"OPE", 'String'>
    readonly estado_ope: FieldRef<"OPE", 'String'>
    readonly cidade_ope: FieldRef<"OPE", 'String'>
    readonly endereco_ope: FieldRef<"OPE", 'String'>
    readonly zip_ope: FieldRef<"OPE", 'String'>
    readonly tin_ope: FieldRef<"OPE", 'String'>
    readonly email_ope: FieldRef<"OPE", 'String'>
    readonly ultima_sincronizacao_ope: FieldRef<"OPE", 'DateTime'>
    readonly origem_ope: FieldRef<"OPE", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OPE findUnique
   */
  export type OPEFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter, which OPE to fetch.
     */
    where: OPEWhereUniqueInput
  }

  /**
   * OPE findUniqueOrThrow
   */
  export type OPEFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter, which OPE to fetch.
     */
    where: OPEWhereUniqueInput
  }

  /**
   * OPE findFirst
   */
  export type OPEFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter, which OPE to fetch.
     */
    where?: OPEWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPES to fetch.
     */
    orderBy?: OPEOrderByWithRelationInput | OPEOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OPES.
     */
    cursor?: OPEWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPES from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPES.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OPES.
     */
    distinct?: OPEScalarFieldEnum | OPEScalarFieldEnum[]
  }

  /**
   * OPE findFirstOrThrow
   */
  export type OPEFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter, which OPE to fetch.
     */
    where?: OPEWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPES to fetch.
     */
    orderBy?: OPEOrderByWithRelationInput | OPEOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OPES.
     */
    cursor?: OPEWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPES from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPES.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OPES.
     */
    distinct?: OPEScalarFieldEnum | OPEScalarFieldEnum[]
  }

  /**
   * OPE findMany
   */
  export type OPEFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter, which OPES to fetch.
     */
    where?: OPEWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OPES to fetch.
     */
    orderBy?: OPEOrderByWithRelationInput | OPEOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OPES.
     */
    cursor?: OPEWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OPES from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OPES.
     */
    skip?: number
    distinct?: OPEScalarFieldEnum | OPEScalarFieldEnum[]
  }

  /**
   * OPE create
   */
  export type OPECreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * The data needed to create a OPE.
     */
    data: XOR<OPECreateInput, OPEUncheckedCreateInput>
  }

  /**
   * OPE createMany
   */
  export type OPECreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OPES.
     */
    data: OPECreateManyInput | OPECreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OPE createManyAndReturn
   */
  export type OPECreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OPES.
     */
    data: OPECreateManyInput | OPECreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OPE update
   */
  export type OPEUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * The data needed to update a OPE.
     */
    data: XOR<OPEUpdateInput, OPEUncheckedUpdateInput>
    /**
     * Choose, which OPE to update.
     */
    where: OPEWhereUniqueInput
  }

  /**
   * OPE updateMany
   */
  export type OPEUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OPES.
     */
    data: XOR<OPEUpdateManyMutationInput, OPEUncheckedUpdateManyInput>
    /**
     * Filter which OPES to update
     */
    where?: OPEWhereInput
  }

  /**
   * OPE upsert
   */
  export type OPEUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * The filter to search for the OPE to update in case it exists.
     */
    where: OPEWhereUniqueInput
    /**
     * In case the OPE found by the `where` argument doesn't exist, create a new OPE with this data.
     */
    create: XOR<OPECreateInput, OPEUncheckedCreateInput>
    /**
     * In case the OPE was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OPEUpdateInput, OPEUncheckedUpdateInput>
  }

  /**
   * OPE delete
   */
  export type OPEDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
    /**
     * Filter which OPE to delete.
     */
    where: OPEWhereUniqueInput
  }

  /**
   * OPE deleteMany
   */
  export type OPEDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OPES to delete
     */
    where?: OPEWhereInput
  }

  /**
   * OPE without action
   */
  export type OPEDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OPE
     */
    select?: OPESelect<ExtArgs> | null
  }


  /**
   * Model OpeHistoricoStatus
   */

  export type AggregateOpeHistoricoStatus = {
    _count: OpeHistoricoStatusCountAggregateOutputType | null
    _min: OpeHistoricoStatusMinAggregateOutputType | null
    _max: OpeHistoricoStatusMaxAggregateOutputType | null
  }

  export type OpeHistoricoStatusMinAggregateOutputType = {
    id_historico_status_ope: string | null
    suid_ope_historico_status_ope: string | null
    status_anterior_historico_status_ope: string | null
    status_novo_historico_status_ope: string | null
    origem_historico_status_ope: string | null
    registrado_em_historico_status_ope: Date | null
  }

  export type OpeHistoricoStatusMaxAggregateOutputType = {
    id_historico_status_ope: string | null
    suid_ope_historico_status_ope: string | null
    status_anterior_historico_status_ope: string | null
    status_novo_historico_status_ope: string | null
    origem_historico_status_ope: string | null
    registrado_em_historico_status_ope: Date | null
  }

  export type OpeHistoricoStatusCountAggregateOutputType = {
    id_historico_status_ope: number
    suid_ope_historico_status_ope: number
    status_anterior_historico_status_ope: number
    status_novo_historico_status_ope: number
    origem_historico_status_ope: number
    payload_historico_status_ope: number
    registrado_em_historico_status_ope: number
    _all: number
  }


  export type OpeHistoricoStatusMinAggregateInputType = {
    id_historico_status_ope?: true
    suid_ope_historico_status_ope?: true
    status_anterior_historico_status_ope?: true
    status_novo_historico_status_ope?: true
    origem_historico_status_ope?: true
    registrado_em_historico_status_ope?: true
  }

  export type OpeHistoricoStatusMaxAggregateInputType = {
    id_historico_status_ope?: true
    suid_ope_historico_status_ope?: true
    status_anterior_historico_status_ope?: true
    status_novo_historico_status_ope?: true
    origem_historico_status_ope?: true
    registrado_em_historico_status_ope?: true
  }

  export type OpeHistoricoStatusCountAggregateInputType = {
    id_historico_status_ope?: true
    suid_ope_historico_status_ope?: true
    status_anterior_historico_status_ope?: true
    status_novo_historico_status_ope?: true
    origem_historico_status_ope?: true
    payload_historico_status_ope?: true
    registrado_em_historico_status_ope?: true
    _all?: true
  }

  export type OpeHistoricoStatusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpeHistoricoStatus to aggregate.
     */
    where?: OpeHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpeHistoricoStatuses to fetch.
     */
    orderBy?: OpeHistoricoStatusOrderByWithRelationInput | OpeHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OpeHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpeHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpeHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OpeHistoricoStatuses
    **/
    _count?: true | OpeHistoricoStatusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OpeHistoricoStatusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OpeHistoricoStatusMaxAggregateInputType
  }

  export type GetOpeHistoricoStatusAggregateType<T extends OpeHistoricoStatusAggregateArgs> = {
        [P in keyof T & keyof AggregateOpeHistoricoStatus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOpeHistoricoStatus[P]>
      : GetScalarType<T[P], AggregateOpeHistoricoStatus[P]>
  }




  export type OpeHistoricoStatusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OpeHistoricoStatusWhereInput
    orderBy?: OpeHistoricoStatusOrderByWithAggregationInput | OpeHistoricoStatusOrderByWithAggregationInput[]
    by: OpeHistoricoStatusScalarFieldEnum[] | OpeHistoricoStatusScalarFieldEnum
    having?: OpeHistoricoStatusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OpeHistoricoStatusCountAggregateInputType | true
    _min?: OpeHistoricoStatusMinAggregateInputType
    _max?: OpeHistoricoStatusMaxAggregateInputType
  }

  export type OpeHistoricoStatusGroupByOutputType = {
    id_historico_status_ope: string
    suid_ope_historico_status_ope: string
    status_anterior_historico_status_ope: string | null
    status_novo_historico_status_ope: string
    origem_historico_status_ope: string
    payload_historico_status_ope: JsonValue
    registrado_em_historico_status_ope: Date
    _count: OpeHistoricoStatusCountAggregateOutputType | null
    _min: OpeHistoricoStatusMinAggregateOutputType | null
    _max: OpeHistoricoStatusMaxAggregateOutputType | null
  }

  type GetOpeHistoricoStatusGroupByPayload<T extends OpeHistoricoStatusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OpeHistoricoStatusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OpeHistoricoStatusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OpeHistoricoStatusGroupByOutputType[P]>
            : GetScalarType<T[P], OpeHistoricoStatusGroupByOutputType[P]>
        }
      >
    >


  export type OpeHistoricoStatusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_historico_status_ope?: boolean
    suid_ope_historico_status_ope?: boolean
    status_anterior_historico_status_ope?: boolean
    status_novo_historico_status_ope?: boolean
    origem_historico_status_ope?: boolean
    payload_historico_status_ope?: boolean
    registrado_em_historico_status_ope?: boolean
  }, ExtArgs["result"]["opeHistoricoStatus"]>

  export type OpeHistoricoStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_historico_status_ope?: boolean
    suid_ope_historico_status_ope?: boolean
    status_anterior_historico_status_ope?: boolean
    status_novo_historico_status_ope?: boolean
    origem_historico_status_ope?: boolean
    payload_historico_status_ope?: boolean
    registrado_em_historico_status_ope?: boolean
  }, ExtArgs["result"]["opeHistoricoStatus"]>

  export type OpeHistoricoStatusSelectScalar = {
    id_historico_status_ope?: boolean
    suid_ope_historico_status_ope?: boolean
    status_anterior_historico_status_ope?: boolean
    status_novo_historico_status_ope?: boolean
    origem_historico_status_ope?: boolean
    payload_historico_status_ope?: boolean
    registrado_em_historico_status_ope?: boolean
  }


  export type $OpeHistoricoStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OpeHistoricoStatus"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id_historico_status_ope: string
      suid_ope_historico_status_ope: string
      status_anterior_historico_status_ope: string | null
      status_novo_historico_status_ope: string
      origem_historico_status_ope: string
      payload_historico_status_ope: Prisma.JsonValue
      registrado_em_historico_status_ope: Date
    }, ExtArgs["result"]["opeHistoricoStatus"]>
    composites: {}
  }

  type OpeHistoricoStatusGetPayload<S extends boolean | null | undefined | OpeHistoricoStatusDefaultArgs> = $Result.GetResult<Prisma.$OpeHistoricoStatusPayload, S>

  type OpeHistoricoStatusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OpeHistoricoStatusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OpeHistoricoStatusCountAggregateInputType | true
    }

  export interface OpeHistoricoStatusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OpeHistoricoStatus'], meta: { name: 'OpeHistoricoStatus' } }
    /**
     * Find zero or one OpeHistoricoStatus that matches the filter.
     * @param {OpeHistoricoStatusFindUniqueArgs} args - Arguments to find a OpeHistoricoStatus
     * @example
     * // Get one OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OpeHistoricoStatusFindUniqueArgs>(args: SelectSubset<T, OpeHistoricoStatusFindUniqueArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OpeHistoricoStatus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OpeHistoricoStatusFindUniqueOrThrowArgs} args - Arguments to find a OpeHistoricoStatus
     * @example
     * // Get one OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OpeHistoricoStatusFindUniqueOrThrowArgs>(args: SelectSubset<T, OpeHistoricoStatusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OpeHistoricoStatus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusFindFirstArgs} args - Arguments to find a OpeHistoricoStatus
     * @example
     * // Get one OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OpeHistoricoStatusFindFirstArgs>(args?: SelectSubset<T, OpeHistoricoStatusFindFirstArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OpeHistoricoStatus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusFindFirstOrThrowArgs} args - Arguments to find a OpeHistoricoStatus
     * @example
     * // Get one OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OpeHistoricoStatusFindFirstOrThrowArgs>(args?: SelectSubset<T, OpeHistoricoStatusFindFirstOrThrowArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OpeHistoricoStatuses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OpeHistoricoStatuses
     * const opeHistoricoStatuses = await prisma.opeHistoricoStatus.findMany()
     * 
     * // Get first 10 OpeHistoricoStatuses
     * const opeHistoricoStatuses = await prisma.opeHistoricoStatus.findMany({ take: 10 })
     * 
     * // Only select the `id_historico_status_ope`
     * const opeHistoricoStatusWithId_historico_status_opeOnly = await prisma.opeHistoricoStatus.findMany({ select: { id_historico_status_ope: true } })
     * 
     */
    findMany<T extends OpeHistoricoStatusFindManyArgs>(args?: SelectSubset<T, OpeHistoricoStatusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OpeHistoricoStatus.
     * @param {OpeHistoricoStatusCreateArgs} args - Arguments to create a OpeHistoricoStatus.
     * @example
     * // Create one OpeHistoricoStatus
     * const OpeHistoricoStatus = await prisma.opeHistoricoStatus.create({
     *   data: {
     *     // ... data to create a OpeHistoricoStatus
     *   }
     * })
     * 
     */
    create<T extends OpeHistoricoStatusCreateArgs>(args: SelectSubset<T, OpeHistoricoStatusCreateArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OpeHistoricoStatuses.
     * @param {OpeHistoricoStatusCreateManyArgs} args - Arguments to create many OpeHistoricoStatuses.
     * @example
     * // Create many OpeHistoricoStatuses
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OpeHistoricoStatusCreateManyArgs>(args?: SelectSubset<T, OpeHistoricoStatusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OpeHistoricoStatuses and returns the data saved in the database.
     * @param {OpeHistoricoStatusCreateManyAndReturnArgs} args - Arguments to create many OpeHistoricoStatuses.
     * @example
     * // Create many OpeHistoricoStatuses
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OpeHistoricoStatuses and only return the `id_historico_status_ope`
     * const opeHistoricoStatusWithId_historico_status_opeOnly = await prisma.opeHistoricoStatus.createManyAndReturn({ 
     *   select: { id_historico_status_ope: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OpeHistoricoStatusCreateManyAndReturnArgs>(args?: SelectSubset<T, OpeHistoricoStatusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a OpeHistoricoStatus.
     * @param {OpeHistoricoStatusDeleteArgs} args - Arguments to delete one OpeHistoricoStatus.
     * @example
     * // Delete one OpeHistoricoStatus
     * const OpeHistoricoStatus = await prisma.opeHistoricoStatus.delete({
     *   where: {
     *     // ... filter to delete one OpeHistoricoStatus
     *   }
     * })
     * 
     */
    delete<T extends OpeHistoricoStatusDeleteArgs>(args: SelectSubset<T, OpeHistoricoStatusDeleteArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OpeHistoricoStatus.
     * @param {OpeHistoricoStatusUpdateArgs} args - Arguments to update one OpeHistoricoStatus.
     * @example
     * // Update one OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OpeHistoricoStatusUpdateArgs>(args: SelectSubset<T, OpeHistoricoStatusUpdateArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OpeHistoricoStatuses.
     * @param {OpeHistoricoStatusDeleteManyArgs} args - Arguments to filter OpeHistoricoStatuses to delete.
     * @example
     * // Delete a few OpeHistoricoStatuses
     * const { count } = await prisma.opeHistoricoStatus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OpeHistoricoStatusDeleteManyArgs>(args?: SelectSubset<T, OpeHistoricoStatusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OpeHistoricoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OpeHistoricoStatuses
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OpeHistoricoStatusUpdateManyArgs>(args: SelectSubset<T, OpeHistoricoStatusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OpeHistoricoStatus.
     * @param {OpeHistoricoStatusUpsertArgs} args - Arguments to update or create a OpeHistoricoStatus.
     * @example
     * // Update or create a OpeHistoricoStatus
     * const opeHistoricoStatus = await prisma.opeHistoricoStatus.upsert({
     *   create: {
     *     // ... data to create a OpeHistoricoStatus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OpeHistoricoStatus we want to update
     *   }
     * })
     */
    upsert<T extends OpeHistoricoStatusUpsertArgs>(args: SelectSubset<T, OpeHistoricoStatusUpsertArgs<ExtArgs>>): Prisma__OpeHistoricoStatusClient<$Result.GetResult<Prisma.$OpeHistoricoStatusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OpeHistoricoStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusCountArgs} args - Arguments to filter OpeHistoricoStatuses to count.
     * @example
     * // Count the number of OpeHistoricoStatuses
     * const count = await prisma.opeHistoricoStatus.count({
     *   where: {
     *     // ... the filter for the OpeHistoricoStatuses we want to count
     *   }
     * })
    **/
    count<T extends OpeHistoricoStatusCountArgs>(
      args?: Subset<T, OpeHistoricoStatusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OpeHistoricoStatusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OpeHistoricoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OpeHistoricoStatusAggregateArgs>(args: Subset<T, OpeHistoricoStatusAggregateArgs>): Prisma.PrismaPromise<GetOpeHistoricoStatusAggregateType<T>>

    /**
     * Group by OpeHistoricoStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpeHistoricoStatusGroupByArgs} args - Group by arguments.
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
      T extends OpeHistoricoStatusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OpeHistoricoStatusGroupByArgs['orderBy'] }
        : { orderBy?: OpeHistoricoStatusGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OpeHistoricoStatusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpeHistoricoStatusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OpeHistoricoStatus model
   */
  readonly fields: OpeHistoricoStatusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OpeHistoricoStatus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OpeHistoricoStatusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the OpeHistoricoStatus model
   */ 
  interface OpeHistoricoStatusFieldRefs {
    readonly id_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'String'>
    readonly suid_ope_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'String'>
    readonly status_anterior_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'String'>
    readonly status_novo_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'String'>
    readonly origem_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'String'>
    readonly payload_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'Json'>
    readonly registrado_em_historico_status_ope: FieldRef<"OpeHistoricoStatus", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OpeHistoricoStatus findUnique
   */
  export type OpeHistoricoStatusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OpeHistoricoStatus to fetch.
     */
    where: OpeHistoricoStatusWhereUniqueInput
  }

  /**
   * OpeHistoricoStatus findUniqueOrThrow
   */
  export type OpeHistoricoStatusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OpeHistoricoStatus to fetch.
     */
    where: OpeHistoricoStatusWhereUniqueInput
  }

  /**
   * OpeHistoricoStatus findFirst
   */
  export type OpeHistoricoStatusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OpeHistoricoStatus to fetch.
     */
    where?: OpeHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpeHistoricoStatuses to fetch.
     */
    orderBy?: OpeHistoricoStatusOrderByWithRelationInput | OpeHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpeHistoricoStatuses.
     */
    cursor?: OpeHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpeHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpeHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpeHistoricoStatuses.
     */
    distinct?: OpeHistoricoStatusScalarFieldEnum | OpeHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OpeHistoricoStatus findFirstOrThrow
   */
  export type OpeHistoricoStatusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OpeHistoricoStatus to fetch.
     */
    where?: OpeHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpeHistoricoStatuses to fetch.
     */
    orderBy?: OpeHistoricoStatusOrderByWithRelationInput | OpeHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpeHistoricoStatuses.
     */
    cursor?: OpeHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpeHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpeHistoricoStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpeHistoricoStatuses.
     */
    distinct?: OpeHistoricoStatusScalarFieldEnum | OpeHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OpeHistoricoStatus findMany
   */
  export type OpeHistoricoStatusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter, which OpeHistoricoStatuses to fetch.
     */
    where?: OpeHistoricoStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpeHistoricoStatuses to fetch.
     */
    orderBy?: OpeHistoricoStatusOrderByWithRelationInput | OpeHistoricoStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OpeHistoricoStatuses.
     */
    cursor?: OpeHistoricoStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpeHistoricoStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpeHistoricoStatuses.
     */
    skip?: number
    distinct?: OpeHistoricoStatusScalarFieldEnum | OpeHistoricoStatusScalarFieldEnum[]
  }

  /**
   * OpeHistoricoStatus create
   */
  export type OpeHistoricoStatusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * The data needed to create a OpeHistoricoStatus.
     */
    data: XOR<OpeHistoricoStatusCreateInput, OpeHistoricoStatusUncheckedCreateInput>
  }

  /**
   * OpeHistoricoStatus createMany
   */
  export type OpeHistoricoStatusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OpeHistoricoStatuses.
     */
    data: OpeHistoricoStatusCreateManyInput | OpeHistoricoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OpeHistoricoStatus createManyAndReturn
   */
  export type OpeHistoricoStatusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many OpeHistoricoStatuses.
     */
    data: OpeHistoricoStatusCreateManyInput | OpeHistoricoStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OpeHistoricoStatus update
   */
  export type OpeHistoricoStatusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * The data needed to update a OpeHistoricoStatus.
     */
    data: XOR<OpeHistoricoStatusUpdateInput, OpeHistoricoStatusUncheckedUpdateInput>
    /**
     * Choose, which OpeHistoricoStatus to update.
     */
    where: OpeHistoricoStatusWhereUniqueInput
  }

  /**
   * OpeHistoricoStatus updateMany
   */
  export type OpeHistoricoStatusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OpeHistoricoStatuses.
     */
    data: XOR<OpeHistoricoStatusUpdateManyMutationInput, OpeHistoricoStatusUncheckedUpdateManyInput>
    /**
     * Filter which OpeHistoricoStatuses to update
     */
    where?: OpeHistoricoStatusWhereInput
  }

  /**
   * OpeHistoricoStatus upsert
   */
  export type OpeHistoricoStatusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * The filter to search for the OpeHistoricoStatus to update in case it exists.
     */
    where: OpeHistoricoStatusWhereUniqueInput
    /**
     * In case the OpeHistoricoStatus found by the `where` argument doesn't exist, create a new OpeHistoricoStatus with this data.
     */
    create: XOR<OpeHistoricoStatusCreateInput, OpeHistoricoStatusUncheckedCreateInput>
    /**
     * In case the OpeHistoricoStatus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OpeHistoricoStatusUpdateInput, OpeHistoricoStatusUncheckedUpdateInput>
  }

  /**
   * OpeHistoricoStatus delete
   */
  export type OpeHistoricoStatusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
    /**
     * Filter which OpeHistoricoStatus to delete.
     */
    where: OpeHistoricoStatusWhereUniqueInput
  }

  /**
   * OpeHistoricoStatus deleteMany
   */
  export type OpeHistoricoStatusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpeHistoricoStatuses to delete
     */
    where?: OpeHistoricoStatusWhereInput
  }

  /**
   * OpeHistoricoStatus without action
   */
  export type OpeHistoricoStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpeHistoricoStatus
     */
    select?: OpeHistoricoStatusSelect<ExtArgs> | null
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
    id_organizacao: 'id_organizacao',
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
    ativo_empresa: 'ativo_empresa',
    criado_em_empresa: 'criado_em_empresa',
    atualizado_em_empresa: 'atualizado_em_empresa',
    pode_ser_armazem_alfandegado_empresa: 'pode_ser_armazem_alfandegado_empresa',
    pode_ser_transportadora_rodoviaria_nacional_empresa: 'pode_ser_transportadora_rodoviaria_nacional_empresa',
    pode_ser_cia_aerea_empresa: 'pode_ser_cia_aerea_empresa',
    pode_ser_transportadora_rodoviaria_internacional_empresa: 'pode_ser_transportadora_rodoviaria_internacional_empresa',
    pode_ser_seguradora_internacional_empresa: 'pode_ser_seguradora_internacional_empresa',
    pode_ser_seguradora_corretora_cambio_empresa: 'pode_ser_seguradora_corretora_cambio_empresa',
    pode_ser_banco_empresa: 'pode_ser_banco_empresa',
    pode_ser_armazem_nacional_empresa: 'pode_ser_armazem_nacional_empresa'
  };

  export type EmpresaScalarFieldEnum = (typeof EmpresaScalarFieldEnum)[keyof typeof EmpresaScalarFieldEnum]


  export const MoedaScalarFieldEnum: {
    codigo_moeda: 'codigo_moeda',
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


  export const NCMScalarFieldEnum: {
    codigo_ncm: 'codigo_ncm',
    descricao_ncm: 'descricao_ncm',
    ipi_ncm: 'ipi_ncm',
    ii_ncm: 'ii_ncm',
    ativo_ncm: 'ativo_ncm',
    pis_ncm: 'pis_ncm',
    cofins_ncm: 'cofins_ncm'
  };

  export type NCMScalarFieldEnum = (typeof NCMScalarFieldEnum)[keyof typeof NCMScalarFieldEnum]


  export const OPEScalarFieldEnum: {
    suid_ope: 'suid_ope',
    id_organizacao: 'id_organizacao',
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

  export type OPEScalarFieldEnum = (typeof OPEScalarFieldEnum)[keyof typeof OPEScalarFieldEnum]


  export const OpeHistoricoStatusScalarFieldEnum: {
    id_historico_status_ope: 'id_historico_status_ope',
    suid_ope_historico_status_ope: 'suid_ope_historico_status_ope',
    status_anterior_historico_status_ope: 'status_anterior_historico_status_ope',
    status_novo_historico_status_ope: 'status_novo_historico_status_ope',
    origem_historico_status_ope: 'origem_historico_status_ope',
    payload_historico_status_ope: 'payload_historico_status_ope',
    registrado_em_historico_status_ope: 'registrado_em_historico_status_ope'
  };

  export type OpeHistoricoStatusScalarFieldEnum = (typeof OpeHistoricoStatusScalarFieldEnum)[keyof typeof OpeHistoricoStatusScalarFieldEnum]


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
   * Deep Input Types
   */


  export type EmpresaWhereInput = {
    AND?: EmpresaWhereInput | EmpresaWhereInput[]
    OR?: EmpresaWhereInput[]
    NOT?: EmpresaWhereInput | EmpresaWhereInput[]
    suid_empresa?: StringFilter<"Empresa"> | string
    id_organizacao?: StringFilter<"Empresa"> | string
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
    ativo_empresa?: BoolFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolFilter<"Empresa"> | boolean
  }

  export type EmpresaOrderByWithRelationInput = {
    suid_empresa?: SortOrder
    id_organizacao?: SortOrder
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
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
  }

  export type EmpresaWhereUniqueInput = Prisma.AtLeast<{
    suid_empresa?: string
    id_organizacao_cnpj_empresa?: EmpresaId_organizacaoCnpj_empresaCompoundUniqueInput
    id_organizacao_tin_empresa_pais_empresa?: EmpresaId_organizacaoTin_empresaPais_empresaCompoundUniqueInput
    AND?: EmpresaWhereInput | EmpresaWhereInput[]
    OR?: EmpresaWhereInput[]
    NOT?: EmpresaWhereInput | EmpresaWhereInput[]
    id_organizacao?: StringFilter<"Empresa"> | string
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
    ativo_empresa?: BoolFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeFilter<"Empresa"> | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolFilter<"Empresa"> | boolean
  }, "suid_empresa" | "id_organizacao_cnpj_empresa" | "id_organizacao_tin_empresa_pais_empresa">

  export type EmpresaOrderByWithAggregationInput = {
    suid_empresa?: SortOrder
    id_organizacao?: SortOrder
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
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
    _count?: EmpresaCountOrderByAggregateInput
    _max?: EmpresaMaxOrderByAggregateInput
    _min?: EmpresaMinOrderByAggregateInput
  }

  export type EmpresaScalarWhereWithAggregatesInput = {
    AND?: EmpresaScalarWhereWithAggregatesInput | EmpresaScalarWhereWithAggregatesInput[]
    OR?: EmpresaScalarWhereWithAggregatesInput[]
    NOT?: EmpresaScalarWhereWithAggregatesInput | EmpresaScalarWhereWithAggregatesInput[]
    suid_empresa?: StringWithAggregatesFilter<"Empresa"> | string
    id_organizacao?: StringWithAggregatesFilter<"Empresa"> | string
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
    ativo_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    criado_em_empresa?: DateTimeWithAggregatesFilter<"Empresa"> | Date | string
    atualizado_em_empresa?: DateTimeWithAggregatesFilter<"Empresa"> | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_cia_aerea_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_seguradora_internacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_banco_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
    pode_ser_armazem_nacional_empresa?: BoolWithAggregatesFilter<"Empresa"> | boolean
  }

  export type MoedaWhereInput = {
    AND?: MoedaWhereInput | MoedaWhereInput[]
    OR?: MoedaWhereInput[]
    NOT?: MoedaWhereInput | MoedaWhereInput[]
    codigo_moeda?: StringFilter<"Moeda"> | string
    simbolo_moeda?: StringFilter<"Moeda"> | string
    ativo_moeda?: BoolFilter<"Moeda"> | boolean
  }

  export type MoedaOrderByWithRelationInput = {
    codigo_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaWhereUniqueInput = Prisma.AtLeast<{
    codigo_moeda?: string
    AND?: MoedaWhereInput | MoedaWhereInput[]
    OR?: MoedaWhereInput[]
    NOT?: MoedaWhereInput | MoedaWhereInput[]
    simbolo_moeda?: StringFilter<"Moeda"> | string
    ativo_moeda?: BoolFilter<"Moeda"> | boolean
  }, "codigo_moeda">

  export type MoedaOrderByWithAggregationInput = {
    codigo_moeda?: SortOrder
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

  export type NCMWhereInput = {
    AND?: NCMWhereInput | NCMWhereInput[]
    OR?: NCMWhereInput[]
    NOT?: NCMWhereInput | NCMWhereInput[]
    codigo_ncm?: StringFilter<"NCM"> | string
    descricao_ncm?: StringFilter<"NCM"> | string
    ipi_ncm?: FloatNullableFilter<"NCM"> | number | null
    ii_ncm?: FloatNullableFilter<"NCM"> | number | null
    ativo_ncm?: BoolFilter<"NCM"> | boolean
    pis_ncm?: FloatNullableFilter<"NCM"> | number | null
    cofins_ncm?: FloatNullableFilter<"NCM"> | number | null
  }

  export type NCMOrderByWithRelationInput = {
    codigo_ncm?: SortOrder
    descricao_ncm?: SortOrder
    ipi_ncm?: SortOrderInput | SortOrder
    ii_ncm?: SortOrderInput | SortOrder
    ativo_ncm?: SortOrder
    pis_ncm?: SortOrderInput | SortOrder
    cofins_ncm?: SortOrderInput | SortOrder
  }

  export type NCMWhereUniqueInput = Prisma.AtLeast<{
    codigo_ncm?: string
    AND?: NCMWhereInput | NCMWhereInput[]
    OR?: NCMWhereInput[]
    NOT?: NCMWhereInput | NCMWhereInput[]
    descricao_ncm?: StringFilter<"NCM"> | string
    ipi_ncm?: FloatNullableFilter<"NCM"> | number | null
    ii_ncm?: FloatNullableFilter<"NCM"> | number | null
    ativo_ncm?: BoolFilter<"NCM"> | boolean
    pis_ncm?: FloatNullableFilter<"NCM"> | number | null
    cofins_ncm?: FloatNullableFilter<"NCM"> | number | null
  }, "codigo_ncm">

  export type NCMOrderByWithAggregationInput = {
    codigo_ncm?: SortOrder
    descricao_ncm?: SortOrder
    ipi_ncm?: SortOrderInput | SortOrder
    ii_ncm?: SortOrderInput | SortOrder
    ativo_ncm?: SortOrder
    pis_ncm?: SortOrderInput | SortOrder
    cofins_ncm?: SortOrderInput | SortOrder
    _count?: NCMCountOrderByAggregateInput
    _avg?: NCMAvgOrderByAggregateInput
    _max?: NCMMaxOrderByAggregateInput
    _min?: NCMMinOrderByAggregateInput
    _sum?: NCMSumOrderByAggregateInput
  }

  export type NCMScalarWhereWithAggregatesInput = {
    AND?: NCMScalarWhereWithAggregatesInput | NCMScalarWhereWithAggregatesInput[]
    OR?: NCMScalarWhereWithAggregatesInput[]
    NOT?: NCMScalarWhereWithAggregatesInput | NCMScalarWhereWithAggregatesInput[]
    codigo_ncm?: StringWithAggregatesFilter<"NCM"> | string
    descricao_ncm?: StringWithAggregatesFilter<"NCM"> | string
    ipi_ncm?: FloatNullableWithAggregatesFilter<"NCM"> | number | null
    ii_ncm?: FloatNullableWithAggregatesFilter<"NCM"> | number | null
    ativo_ncm?: BoolWithAggregatesFilter<"NCM"> | boolean
    pis_ncm?: FloatNullableWithAggregatesFilter<"NCM"> | number | null
    cofins_ncm?: FloatNullableWithAggregatesFilter<"NCM"> | number | null
  }

  export type OPEWhereInput = {
    AND?: OPEWhereInput | OPEWhereInput[]
    OR?: OPEWhereInput[]
    NOT?: OPEWhereInput | OPEWhereInput[]
    suid_ope?: StringFilter<"OPE"> | string
    id_organizacao?: StringFilter<"OPE"> | string
    codigo_portal_unico_ope?: StringFilter<"OPE"> | string
    situacao_ope?: StringFilter<"OPE"> | string
    versao_ope?: StringFilter<"OPE"> | string
    nome_ope?: StringFilter<"OPE"> | string
    cnpj_raiz_empresa_ope?: StringFilter<"OPE"> | string
    pais_ope?: StringFilter<"OPE"> | string
    estado_ope?: StringNullableFilter<"OPE"> | string | null
    cidade_ope?: StringNullableFilter<"OPE"> | string | null
    endereco_ope?: StringNullableFilter<"OPE"> | string | null
    zip_ope?: StringNullableFilter<"OPE"> | string | null
    tin_ope?: StringNullableFilter<"OPE"> | string | null
    email_ope?: StringNullableFilter<"OPE"> | string | null
    ultima_sincronizacao_ope?: DateTimeFilter<"OPE"> | Date | string
    origem_ope?: StringFilter<"OPE"> | string
  }

  export type OPEOrderByWithRelationInput = {
    suid_ope?: SortOrder
    id_organizacao?: SortOrder
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

  export type OPEWhereUniqueInput = Prisma.AtLeast<{
    suid_ope?: string
    codigo_portal_unico_ope?: string
    AND?: OPEWhereInput | OPEWhereInput[]
    OR?: OPEWhereInput[]
    NOT?: OPEWhereInput | OPEWhereInput[]
    id_organizacao?: StringFilter<"OPE"> | string
    situacao_ope?: StringFilter<"OPE"> | string
    versao_ope?: StringFilter<"OPE"> | string
    nome_ope?: StringFilter<"OPE"> | string
    cnpj_raiz_empresa_ope?: StringFilter<"OPE"> | string
    pais_ope?: StringFilter<"OPE"> | string
    estado_ope?: StringNullableFilter<"OPE"> | string | null
    cidade_ope?: StringNullableFilter<"OPE"> | string | null
    endereco_ope?: StringNullableFilter<"OPE"> | string | null
    zip_ope?: StringNullableFilter<"OPE"> | string | null
    tin_ope?: StringNullableFilter<"OPE"> | string | null
    email_ope?: StringNullableFilter<"OPE"> | string | null
    ultima_sincronizacao_ope?: DateTimeFilter<"OPE"> | Date | string
    origem_ope?: StringFilter<"OPE"> | string
  }, "suid_ope" | "codigo_portal_unico_ope">

  export type OPEOrderByWithAggregationInput = {
    suid_ope?: SortOrder
    id_organizacao?: SortOrder
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
    _count?: OPECountOrderByAggregateInput
    _max?: OPEMaxOrderByAggregateInput
    _min?: OPEMinOrderByAggregateInput
  }

  export type OPEScalarWhereWithAggregatesInput = {
    AND?: OPEScalarWhereWithAggregatesInput | OPEScalarWhereWithAggregatesInput[]
    OR?: OPEScalarWhereWithAggregatesInput[]
    NOT?: OPEScalarWhereWithAggregatesInput | OPEScalarWhereWithAggregatesInput[]
    suid_ope?: StringWithAggregatesFilter<"OPE"> | string
    id_organizacao?: StringWithAggregatesFilter<"OPE"> | string
    codigo_portal_unico_ope?: StringWithAggregatesFilter<"OPE"> | string
    situacao_ope?: StringWithAggregatesFilter<"OPE"> | string
    versao_ope?: StringWithAggregatesFilter<"OPE"> | string
    nome_ope?: StringWithAggregatesFilter<"OPE"> | string
    cnpj_raiz_empresa_ope?: StringWithAggregatesFilter<"OPE"> | string
    pais_ope?: StringWithAggregatesFilter<"OPE"> | string
    estado_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    cidade_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    endereco_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    zip_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    tin_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    email_ope?: StringNullableWithAggregatesFilter<"OPE"> | string | null
    ultima_sincronizacao_ope?: DateTimeWithAggregatesFilter<"OPE"> | Date | string
    origem_ope?: StringWithAggregatesFilter<"OPE"> | string
  }

  export type OpeHistoricoStatusWhereInput = {
    AND?: OpeHistoricoStatusWhereInput | OpeHistoricoStatusWhereInput[]
    OR?: OpeHistoricoStatusWhereInput[]
    NOT?: OpeHistoricoStatusWhereInput | OpeHistoricoStatusWhereInput[]
    id_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    suid_ope_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    status_anterior_historico_status_ope?: StringNullableFilter<"OpeHistoricoStatus"> | string | null
    status_novo_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    origem_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    payload_historico_status_ope?: JsonFilter<"OpeHistoricoStatus">
    registrado_em_historico_status_ope?: DateTimeFilter<"OpeHistoricoStatus"> | Date | string
  }

  export type OpeHistoricoStatusOrderByWithRelationInput = {
    id_historico_status_ope?: SortOrder
    suid_ope_historico_status_ope?: SortOrder
    status_anterior_historico_status_ope?: SortOrderInput | SortOrder
    status_novo_historico_status_ope?: SortOrder
    origem_historico_status_ope?: SortOrder
    payload_historico_status_ope?: SortOrder
    registrado_em_historico_status_ope?: SortOrder
  }

  export type OpeHistoricoStatusWhereUniqueInput = Prisma.AtLeast<{
    id_historico_status_ope?: string
    AND?: OpeHistoricoStatusWhereInput | OpeHistoricoStatusWhereInput[]
    OR?: OpeHistoricoStatusWhereInput[]
    NOT?: OpeHistoricoStatusWhereInput | OpeHistoricoStatusWhereInput[]
    suid_ope_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    status_anterior_historico_status_ope?: StringNullableFilter<"OpeHistoricoStatus"> | string | null
    status_novo_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    origem_historico_status_ope?: StringFilter<"OpeHistoricoStatus"> | string
    payload_historico_status_ope?: JsonFilter<"OpeHistoricoStatus">
    registrado_em_historico_status_ope?: DateTimeFilter<"OpeHistoricoStatus"> | Date | string
  }, "id_historico_status_ope">

  export type OpeHistoricoStatusOrderByWithAggregationInput = {
    id_historico_status_ope?: SortOrder
    suid_ope_historico_status_ope?: SortOrder
    status_anterior_historico_status_ope?: SortOrderInput | SortOrder
    status_novo_historico_status_ope?: SortOrder
    origem_historico_status_ope?: SortOrder
    payload_historico_status_ope?: SortOrder
    registrado_em_historico_status_ope?: SortOrder
    _count?: OpeHistoricoStatusCountOrderByAggregateInput
    _max?: OpeHistoricoStatusMaxOrderByAggregateInput
    _min?: OpeHistoricoStatusMinOrderByAggregateInput
  }

  export type OpeHistoricoStatusScalarWhereWithAggregatesInput = {
    AND?: OpeHistoricoStatusScalarWhereWithAggregatesInput | OpeHistoricoStatusScalarWhereWithAggregatesInput[]
    OR?: OpeHistoricoStatusScalarWhereWithAggregatesInput[]
    NOT?: OpeHistoricoStatusScalarWhereWithAggregatesInput | OpeHistoricoStatusScalarWhereWithAggregatesInput[]
    id_historico_status_ope?: StringWithAggregatesFilter<"OpeHistoricoStatus"> | string
    suid_ope_historico_status_ope?: StringWithAggregatesFilter<"OpeHistoricoStatus"> | string
    status_anterior_historico_status_ope?: StringNullableWithAggregatesFilter<"OpeHistoricoStatus"> | string | null
    status_novo_historico_status_ope?: StringWithAggregatesFilter<"OpeHistoricoStatus"> | string
    origem_historico_status_ope?: StringWithAggregatesFilter<"OpeHistoricoStatus"> | string
    payload_historico_status_ope?: JsonWithAggregatesFilter<"OpeHistoricoStatus">
    registrado_em_historico_status_ope?: DateTimeWithAggregatesFilter<"OpeHistoricoStatus"> | Date | string
  }

  export type EmpresaCreateInput = {
    suid_empresa: string
    id_organizacao: string
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
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }

  export type EmpresaUncheckedCreateInput = {
    suid_empresa: string
    id_organizacao: string
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
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }

  export type EmpresaUpdateInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
  }

  export type EmpresaUncheckedUpdateInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
  }

  export type EmpresaCreateManyInput = {
    suid_empresa: string
    id_organizacao: string
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
    ativo_empresa?: boolean
    criado_em_empresa?: Date | string
    atualizado_em_empresa?: Date | string
    pode_ser_armazem_alfandegado_empresa?: boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: boolean
    pode_ser_cia_aerea_empresa?: boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: boolean
    pode_ser_seguradora_internacional_empresa?: boolean
    pode_ser_seguradora_corretora_cambio_empresa?: boolean
    pode_ser_banco_empresa?: boolean
    pode_ser_armazem_nacional_empresa?: boolean
  }

  export type EmpresaUpdateManyMutationInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
  }

  export type EmpresaUncheckedUpdateManyInput = {
    suid_empresa?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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
    ativo_empresa?: BoolFieldUpdateOperationsInput | boolean
    criado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado_em_empresa?: DateTimeFieldUpdateOperationsInput | Date | string
    pode_ser_armazem_alfandegado_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_cia_aerea_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_transportadora_rodoviaria_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_internacional_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_seguradora_corretora_cambio_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_banco_empresa?: BoolFieldUpdateOperationsInput | boolean
    pode_ser_armazem_nacional_empresa?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaCreateInput = {
    codigo_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUncheckedCreateInput = {
    codigo_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUpdateInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaUncheckedUpdateInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaCreateManyInput = {
    codigo_moeda: string
    simbolo_moeda: string
    ativo_moeda?: boolean
  }

  export type MoedaUpdateManyMutationInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
    simbolo_moeda?: StringFieldUpdateOperationsInput | string
    ativo_moeda?: BoolFieldUpdateOperationsInput | boolean
  }

  export type MoedaUncheckedUpdateManyInput = {
    codigo_moeda?: StringFieldUpdateOperationsInput | string
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

  export type NCMCreateInput = {
    codigo_ncm: string
    descricao_ncm: string
    ipi_ncm?: number | null
    ii_ncm?: number | null
    ativo_ncm?: boolean
    pis_ncm?: number | null
    cofins_ncm?: number | null
  }

  export type NCMUncheckedCreateInput = {
    codigo_ncm: string
    descricao_ncm: string
    ipi_ncm?: number | null
    ii_ncm?: number | null
    ativo_ncm?: boolean
    pis_ncm?: number | null
    cofins_ncm?: number | null
  }

  export type NCMUpdateInput = {
    codigo_ncm?: StringFieldUpdateOperationsInput | string
    descricao_ncm?: StringFieldUpdateOperationsInput | string
    ipi_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm?: BoolFieldUpdateOperationsInput | boolean
    pis_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type NCMUncheckedUpdateInput = {
    codigo_ncm?: StringFieldUpdateOperationsInput | string
    descricao_ncm?: StringFieldUpdateOperationsInput | string
    ipi_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm?: BoolFieldUpdateOperationsInput | boolean
    pis_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type NCMCreateManyInput = {
    codigo_ncm: string
    descricao_ncm: string
    ipi_ncm?: number | null
    ii_ncm?: number | null
    ativo_ncm?: boolean
    pis_ncm?: number | null
    cofins_ncm?: number | null
  }

  export type NCMUpdateManyMutationInput = {
    codigo_ncm?: StringFieldUpdateOperationsInput | string
    descricao_ncm?: StringFieldUpdateOperationsInput | string
    ipi_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm?: BoolFieldUpdateOperationsInput | boolean
    pis_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type NCMUncheckedUpdateManyInput = {
    codigo_ncm?: StringFieldUpdateOperationsInput | string
    descricao_ncm?: StringFieldUpdateOperationsInput | string
    ipi_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ii_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    ativo_ncm?: BoolFieldUpdateOperationsInput | boolean
    pis_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
    cofins_ncm?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type OPECreateInput = {
    suid_ope: string
    id_organizacao: string
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

  export type OPEUncheckedCreateInput = {
    suid_ope: string
    id_organizacao: string
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

  export type OPEUpdateInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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

  export type OPEUncheckedUpdateInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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

  export type OPECreateManyInput = {
    suid_ope: string
    id_organizacao: string
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

  export type OPEUpdateManyMutationInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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

  export type OPEUncheckedUpdateManyInput = {
    suid_ope?: StringFieldUpdateOperationsInput | string
    id_organizacao?: StringFieldUpdateOperationsInput | string
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

  export type OpeHistoricoStatusCreateInput = {
    id_historico_status_ope?: string
    suid_ope_historico_status_ope: string
    status_anterior_historico_status_ope?: string | null
    status_novo_historico_status_ope: string
    origem_historico_status_ope: string
    payload_historico_status_ope: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: Date | string
  }

  export type OpeHistoricoStatusUncheckedCreateInput = {
    id_historico_status_ope?: string
    suid_ope_historico_status_ope: string
    status_anterior_historico_status_ope?: string | null
    status_novo_historico_status_ope: string
    origem_historico_status_ope: string
    payload_historico_status_ope: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: Date | string
  }

  export type OpeHistoricoStatusUpdateInput = {
    id_historico_status_ope?: StringFieldUpdateOperationsInput | string
    suid_ope_historico_status_ope?: StringFieldUpdateOperationsInput | string
    status_anterior_historico_status_ope?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_historico_status_ope?: StringFieldUpdateOperationsInput | string
    origem_historico_status_ope?: StringFieldUpdateOperationsInput | string
    payload_historico_status_ope?: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpeHistoricoStatusUncheckedUpdateInput = {
    id_historico_status_ope?: StringFieldUpdateOperationsInput | string
    suid_ope_historico_status_ope?: StringFieldUpdateOperationsInput | string
    status_anterior_historico_status_ope?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_historico_status_ope?: StringFieldUpdateOperationsInput | string
    origem_historico_status_ope?: StringFieldUpdateOperationsInput | string
    payload_historico_status_ope?: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpeHistoricoStatusCreateManyInput = {
    id_historico_status_ope?: string
    suid_ope_historico_status_ope: string
    status_anterior_historico_status_ope?: string | null
    status_novo_historico_status_ope: string
    origem_historico_status_ope: string
    payload_historico_status_ope: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: Date | string
  }

  export type OpeHistoricoStatusUpdateManyMutationInput = {
    id_historico_status_ope?: StringFieldUpdateOperationsInput | string
    suid_ope_historico_status_ope?: StringFieldUpdateOperationsInput | string
    status_anterior_historico_status_ope?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_historico_status_ope?: StringFieldUpdateOperationsInput | string
    origem_historico_status_ope?: StringFieldUpdateOperationsInput | string
    payload_historico_status_ope?: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpeHistoricoStatusUncheckedUpdateManyInput = {
    id_historico_status_ope?: StringFieldUpdateOperationsInput | string
    suid_ope_historico_status_ope?: StringFieldUpdateOperationsInput | string
    status_anterior_historico_status_ope?: NullableStringFieldUpdateOperationsInput | string | null
    status_novo_historico_status_ope?: StringFieldUpdateOperationsInput | string
    origem_historico_status_ope?: StringFieldUpdateOperationsInput | string
    payload_historico_status_ope?: JsonNullValueInput | InputJsonValue
    registrado_em_historico_status_ope?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EmpresaId_organizacaoCnpj_empresaCompoundUniqueInput = {
    id_organizacao: string
    cnpj_empresa: string
  }

  export type EmpresaId_organizacaoTin_empresaPais_empresaCompoundUniqueInput = {
    id_organizacao: string
    tin_empresa: string
    pais_empresa: string
  }

  export type EmpresaCountOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao?: SortOrder
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
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
  }

  export type EmpresaMaxOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao?: SortOrder
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
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
  }

  export type EmpresaMinOrderByAggregateInput = {
    suid_empresa?: SortOrder
    id_organizacao?: SortOrder
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
    ativo_empresa?: SortOrder
    criado_em_empresa?: SortOrder
    atualizado_em_empresa?: SortOrder
    pode_ser_armazem_alfandegado_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_nacional_empresa?: SortOrder
    pode_ser_cia_aerea_empresa?: SortOrder
    pode_ser_transportadora_rodoviaria_internacional_empresa?: SortOrder
    pode_ser_seguradora_internacional_empresa?: SortOrder
    pode_ser_seguradora_corretora_cambio_empresa?: SortOrder
    pode_ser_banco_empresa?: SortOrder
    pode_ser_armazem_nacional_empresa?: SortOrder
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

  export type MoedaCountOrderByAggregateInput = {
    codigo_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaMaxOrderByAggregateInput = {
    codigo_moeda?: SortOrder
    simbolo_moeda?: SortOrder
    ativo_moeda?: SortOrder
  }

  export type MoedaMinOrderByAggregateInput = {
    codigo_moeda?: SortOrder
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

  export type NCMCountOrderByAggregateInput = {
    codigo_ncm?: SortOrder
    descricao_ncm?: SortOrder
    ipi_ncm?: SortOrder
    ii_ncm?: SortOrder
    ativo_ncm?: SortOrder
    pis_ncm?: SortOrder
    cofins_ncm?: SortOrder
  }

  export type NCMAvgOrderByAggregateInput = {
    ipi_ncm?: SortOrder
    ii_ncm?: SortOrder
    pis_ncm?: SortOrder
    cofins_ncm?: SortOrder
  }

  export type NCMMaxOrderByAggregateInput = {
    codigo_ncm?: SortOrder
    descricao_ncm?: SortOrder
    ipi_ncm?: SortOrder
    ii_ncm?: SortOrder
    ativo_ncm?: SortOrder
    pis_ncm?: SortOrder
    cofins_ncm?: SortOrder
  }

  export type NCMMinOrderByAggregateInput = {
    codigo_ncm?: SortOrder
    descricao_ncm?: SortOrder
    ipi_ncm?: SortOrder
    ii_ncm?: SortOrder
    ativo_ncm?: SortOrder
    pis_ncm?: SortOrder
    cofins_ncm?: SortOrder
  }

  export type NCMSumOrderByAggregateInput = {
    ipi_ncm?: SortOrder
    ii_ncm?: SortOrder
    pis_ncm?: SortOrder
    cofins_ncm?: SortOrder
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

  export type OPECountOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao?: SortOrder
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

  export type OPEMaxOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao?: SortOrder
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

  export type OPEMinOrderByAggregateInput = {
    suid_ope?: SortOrder
    id_organizacao?: SortOrder
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

  export type OpeHistoricoStatusCountOrderByAggregateInput = {
    id_historico_status_ope?: SortOrder
    suid_ope_historico_status_ope?: SortOrder
    status_anterior_historico_status_ope?: SortOrder
    status_novo_historico_status_ope?: SortOrder
    origem_historico_status_ope?: SortOrder
    payload_historico_status_ope?: SortOrder
    registrado_em_historico_status_ope?: SortOrder
  }

  export type OpeHistoricoStatusMaxOrderByAggregateInput = {
    id_historico_status_ope?: SortOrder
    suid_ope_historico_status_ope?: SortOrder
    status_anterior_historico_status_ope?: SortOrder
    status_novo_historico_status_ope?: SortOrder
    origem_historico_status_ope?: SortOrder
    registrado_em_historico_status_ope?: SortOrder
  }

  export type OpeHistoricoStatusMinOrderByAggregateInput = {
    id_historico_status_ope?: SortOrder
    suid_ope_historico_status_ope?: SortOrder
    status_anterior_historico_status_ope?: SortOrder
    status_novo_historico_status_ope?: SortOrder
    origem_historico_status_ope?: SortOrder
    registrado_em_historico_status_ope?: SortOrder
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
     * @deprecated Use MoedaDefaultArgs instead
     */
    export type MoedaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MoedaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UnidadeDefaultArgs instead
     */
    export type UnidadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UnidadeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NCMDefaultArgs instead
     */
    export type NCMArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NCMDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OPEDefaultArgs instead
     */
    export type OPEArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OPEDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OpeHistoricoStatusDefaultArgs instead
     */
    export type OpeHistoricoStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OpeHistoricoStatusDefaultArgs<ExtArgs>

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