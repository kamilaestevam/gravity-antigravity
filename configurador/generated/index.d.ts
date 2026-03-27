
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
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Subscription
 * 
 */
export type Subscription = $Result.DefaultSelection<Prisma.$SubscriptionPayload>
/**
 * Model UserPermission
 * 
 */
export type UserPermission = $Result.DefaultSelection<Prisma.$UserPermissionPayload>
/**
 * Model GravityAdminPermission
 * 
 */
export type GravityAdminPermission = $Result.DefaultSelection<Prisma.$GravityAdminPermissionPayload>
/**
 * Model Company
 * 
 */
export type Company = $Result.DefaultSelection<Prisma.$CompanyPayload>
/**
 * Model UserMembership
 * 
 */
export type UserMembership = $Result.DefaultSelection<Prisma.$UserMembershipPayload>
/**
 * Model ProductConfig
 * 
 */
export type ProductConfig = $Result.DefaultSelection<Prisma.$ProductConfigPayload>
/**
 * Model StripeEvent
 * 
 */
export type StripeEvent = $Result.DefaultSelection<Prisma.$StripeEventPayload>
/**
 * Model SupplierTenantAccess
 * 
 */
export type SupplierTenantAccess = $Result.DefaultSelection<Prisma.$SupplierTenantAccessPayload>
/**
 * Model ServiceToken
 * 
 */
export type ServiceToken = $Result.DefaultSelection<Prisma.$ServiceTokenPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TenantStatus: {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  PENDING_SETUP: 'PENDING_SETUP'
};

export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus]


export const UserRole: {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MASTER: 'MASTER',
  STANDARD: 'STANDARD',
  SUPPLIER: 'SUPPLIER'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const SubscriptionPlan: {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE'
};

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan]


export const SubscriptionStatus: {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  TRIALING: 'TRIALING',
  INCOMPLETE: 'INCOMPLETE'
};

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]


export const CompanyStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export type CompanyStatus = (typeof CompanyStatus)[keyof typeof CompanyStatus]


export const UserMembershipRole: {
  MASTER: 'MASTER',
  STANDARD: 'STANDARD',
  SUPPLIER: 'SUPPLIER'
};

export type UserMembershipRole = (typeof UserMembershipRole)[keyof typeof UserMembershipRole]


export const ServiceTokenScope: {
  SERVICE: 'SERVICE',
  WEBHOOK: 'WEBHOOK',
  CRON: 'CRON'
};

export type ServiceTokenScope = (typeof ServiceTokenScope)[keyof typeof ServiceTokenScope]

}

export type TenantStatus = $Enums.TenantStatus

export const TenantStatus: typeof $Enums.TenantStatus

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type SubscriptionPlan = $Enums.SubscriptionPlan

export const SubscriptionPlan: typeof $Enums.SubscriptionPlan

export type SubscriptionStatus = $Enums.SubscriptionStatus

export const SubscriptionStatus: typeof $Enums.SubscriptionStatus

export type CompanyStatus = $Enums.CompanyStatus

export const CompanyStatus: typeof $Enums.CompanyStatus

export type UserMembershipRole = $Enums.UserMembershipRole

export const UserMembershipRole: typeof $Enums.UserMembershipRole

export type ServiceTokenScope = $Enums.ServiceTokenScope

export const ServiceTokenScope: typeof $Enums.ServiceTokenScope

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
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
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
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
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.subscription`: Exposes CRUD operations for the **Subscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subscriptions
    * const subscriptions = await prisma.subscription.findMany()
    * ```
    */
  get subscription(): Prisma.SubscriptionDelegate<ExtArgs>;

  /**
   * `prisma.userPermission`: Exposes CRUD operations for the **UserPermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPermissions
    * const userPermissions = await prisma.userPermission.findMany()
    * ```
    */
  get userPermission(): Prisma.UserPermissionDelegate<ExtArgs>;

  /**
   * `prisma.gravityAdminPermission`: Exposes CRUD operations for the **GravityAdminPermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GravityAdminPermissions
    * const gravityAdminPermissions = await prisma.gravityAdminPermission.findMany()
    * ```
    */
  get gravityAdminPermission(): Prisma.GravityAdminPermissionDelegate<ExtArgs>;

  /**
   * `prisma.company`: Exposes CRUD operations for the **Company** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Companies
    * const companies = await prisma.company.findMany()
    * ```
    */
  get company(): Prisma.CompanyDelegate<ExtArgs>;

  /**
   * `prisma.userMembership`: Exposes CRUD operations for the **UserMembership** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserMemberships
    * const userMemberships = await prisma.userMembership.findMany()
    * ```
    */
  get userMembership(): Prisma.UserMembershipDelegate<ExtArgs>;

  /**
   * `prisma.productConfig`: Exposes CRUD operations for the **ProductConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductConfigs
    * const productConfigs = await prisma.productConfig.findMany()
    * ```
    */
  get productConfig(): Prisma.ProductConfigDelegate<ExtArgs>;

  /**
   * `prisma.stripeEvent`: Exposes CRUD operations for the **StripeEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StripeEvents
    * const stripeEvents = await prisma.stripeEvent.findMany()
    * ```
    */
  get stripeEvent(): Prisma.StripeEventDelegate<ExtArgs>;

  /**
   * `prisma.supplierTenantAccess`: Exposes CRUD operations for the **SupplierTenantAccess** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SupplierTenantAccesses
    * const supplierTenantAccesses = await prisma.supplierTenantAccess.findMany()
    * ```
    */
  get supplierTenantAccess(): Prisma.SupplierTenantAccessDelegate<ExtArgs>;

  /**
   * `prisma.serviceToken`: Exposes CRUD operations for the **ServiceToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ServiceTokens
    * const serviceTokens = await prisma.serviceToken.findMany()
    * ```
    */
  get serviceToken(): Prisma.ServiceTokenDelegate<ExtArgs>;
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
    Tenant: 'Tenant',
    User: 'User',
    Subscription: 'Subscription',
    UserPermission: 'UserPermission',
    GravityAdminPermission: 'GravityAdminPermission',
    Company: 'Company',
    UserMembership: 'UserMembership',
    ProductConfig: 'ProductConfig',
    StripeEvent: 'StripeEvent',
    SupplierTenantAccess: 'SupplierTenantAccess',
    ServiceToken: 'ServiceToken'
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
      modelProps: "tenant" | "user" | "subscription" | "userPermission" | "gravityAdminPermission" | "company" | "userMembership" | "productConfig" | "stripeEvent" | "supplierTenantAccess" | "serviceToken"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Subscription: {
        payload: Prisma.$SubscriptionPayload<ExtArgs>
        fields: Prisma.SubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findFirst: {
            args: Prisma.SubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          findMany: {
            args: Prisma.SubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          create: {
            args: Prisma.SubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          createMany: {
            args: Prisma.SubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>[]
          }
          delete: {
            args: Prisma.SubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          update: {
            args: Prisma.SubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.SubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPayload>
          }
          aggregate: {
            args: Prisma.SubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscription>
          }
          groupBy: {
            args: Prisma.SubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionCountAggregateOutputType> | number
          }
        }
      }
      UserPermission: {
        payload: Prisma.$UserPermissionPayload<ExtArgs>
        fields: Prisma.UserPermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserPermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserPermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          findFirst: {
            args: Prisma.UserPermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserPermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          findMany: {
            args: Prisma.UserPermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>[]
          }
          create: {
            args: Prisma.UserPermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          createMany: {
            args: Prisma.UserPermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserPermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>[]
          }
          delete: {
            args: Prisma.UserPermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          update: {
            args: Prisma.UserPermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          deleteMany: {
            args: Prisma.UserPermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserPermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserPermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPermissionPayload>
          }
          aggregate: {
            args: Prisma.UserPermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPermission>
          }
          groupBy: {
            args: Prisma.UserPermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserPermissionCountArgs<ExtArgs>
            result: $Utils.Optional<UserPermissionCountAggregateOutputType> | number
          }
        }
      }
      GravityAdminPermission: {
        payload: Prisma.$GravityAdminPermissionPayload<ExtArgs>
        fields: Prisma.GravityAdminPermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GravityAdminPermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GravityAdminPermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          findFirst: {
            args: Prisma.GravityAdminPermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GravityAdminPermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          findMany: {
            args: Prisma.GravityAdminPermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>[]
          }
          create: {
            args: Prisma.GravityAdminPermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          createMany: {
            args: Prisma.GravityAdminPermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GravityAdminPermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>[]
          }
          delete: {
            args: Prisma.GravityAdminPermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          update: {
            args: Prisma.GravityAdminPermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          deleteMany: {
            args: Prisma.GravityAdminPermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GravityAdminPermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GravityAdminPermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GravityAdminPermissionPayload>
          }
          aggregate: {
            args: Prisma.GravityAdminPermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGravityAdminPermission>
          }
          groupBy: {
            args: Prisma.GravityAdminPermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<GravityAdminPermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.GravityAdminPermissionCountArgs<ExtArgs>
            result: $Utils.Optional<GravityAdminPermissionCountAggregateOutputType> | number
          }
        }
      }
      Company: {
        payload: Prisma.$CompanyPayload<ExtArgs>
        fields: Prisma.CompanyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CompanyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CompanyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findFirst: {
            args: Prisma.CompanyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CompanyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          findMany: {
            args: Prisma.CompanyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          create: {
            args: Prisma.CompanyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          createMany: {
            args: Prisma.CompanyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CompanyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>[]
          }
          delete: {
            args: Prisma.CompanyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          update: {
            args: Prisma.CompanyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          deleteMany: {
            args: Prisma.CompanyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CompanyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CompanyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CompanyPayload>
          }
          aggregate: {
            args: Prisma.CompanyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCompany>
          }
          groupBy: {
            args: Prisma.CompanyGroupByArgs<ExtArgs>
            result: $Utils.Optional<CompanyGroupByOutputType>[]
          }
          count: {
            args: Prisma.CompanyCountArgs<ExtArgs>
            result: $Utils.Optional<CompanyCountAggregateOutputType> | number
          }
        }
      }
      UserMembership: {
        payload: Prisma.$UserMembershipPayload<ExtArgs>
        fields: Prisma.UserMembershipFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserMembershipFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserMembershipFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          findFirst: {
            args: Prisma.UserMembershipFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserMembershipFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          findMany: {
            args: Prisma.UserMembershipFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>[]
          }
          create: {
            args: Prisma.UserMembershipCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          createMany: {
            args: Prisma.UserMembershipCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserMembershipCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>[]
          }
          delete: {
            args: Prisma.UserMembershipDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          update: {
            args: Prisma.UserMembershipUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          deleteMany: {
            args: Prisma.UserMembershipDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserMembershipUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserMembershipUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMembershipPayload>
          }
          aggregate: {
            args: Prisma.UserMembershipAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserMembership>
          }
          groupBy: {
            args: Prisma.UserMembershipGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserMembershipGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserMembershipCountArgs<ExtArgs>
            result: $Utils.Optional<UserMembershipCountAggregateOutputType> | number
          }
        }
      }
      ProductConfig: {
        payload: Prisma.$ProductConfigPayload<ExtArgs>
        fields: Prisma.ProductConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          findFirst: {
            args: Prisma.ProductConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          findMany: {
            args: Prisma.ProductConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>[]
          }
          create: {
            args: Prisma.ProductConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          createMany: {
            args: Prisma.ProductConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>[]
          }
          delete: {
            args: Prisma.ProductConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          update: {
            args: Prisma.ProductConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          deleteMany: {
            args: Prisma.ProductConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductConfigPayload>
          }
          aggregate: {
            args: Prisma.ProductConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductConfig>
          }
          groupBy: {
            args: Prisma.ProductConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductConfigCountArgs<ExtArgs>
            result: $Utils.Optional<ProductConfigCountAggregateOutputType> | number
          }
        }
      }
      StripeEvent: {
        payload: Prisma.$StripeEventPayload<ExtArgs>
        fields: Prisma.StripeEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StripeEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StripeEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          findFirst: {
            args: Prisma.StripeEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StripeEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          findMany: {
            args: Prisma.StripeEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>[]
          }
          create: {
            args: Prisma.StripeEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          createMany: {
            args: Prisma.StripeEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StripeEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>[]
          }
          delete: {
            args: Prisma.StripeEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          update: {
            args: Prisma.StripeEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          deleteMany: {
            args: Prisma.StripeEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StripeEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StripeEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripeEventPayload>
          }
          aggregate: {
            args: Prisma.StripeEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStripeEvent>
          }
          groupBy: {
            args: Prisma.StripeEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<StripeEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.StripeEventCountArgs<ExtArgs>
            result: $Utils.Optional<StripeEventCountAggregateOutputType> | number
          }
        }
      }
      SupplierTenantAccess: {
        payload: Prisma.$SupplierTenantAccessPayload<ExtArgs>
        fields: Prisma.SupplierTenantAccessFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SupplierTenantAccessFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SupplierTenantAccessFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          findFirst: {
            args: Prisma.SupplierTenantAccessFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SupplierTenantAccessFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          findMany: {
            args: Prisma.SupplierTenantAccessFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>[]
          }
          create: {
            args: Prisma.SupplierTenantAccessCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          createMany: {
            args: Prisma.SupplierTenantAccessCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SupplierTenantAccessCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>[]
          }
          delete: {
            args: Prisma.SupplierTenantAccessDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          update: {
            args: Prisma.SupplierTenantAccessUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          deleteMany: {
            args: Prisma.SupplierTenantAccessDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SupplierTenantAccessUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SupplierTenantAccessUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupplierTenantAccessPayload>
          }
          aggregate: {
            args: Prisma.SupplierTenantAccessAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSupplierTenantAccess>
          }
          groupBy: {
            args: Prisma.SupplierTenantAccessGroupByArgs<ExtArgs>
            result: $Utils.Optional<SupplierTenantAccessGroupByOutputType>[]
          }
          count: {
            args: Prisma.SupplierTenantAccessCountArgs<ExtArgs>
            result: $Utils.Optional<SupplierTenantAccessCountAggregateOutputType> | number
          }
        }
      }
      ServiceToken: {
        payload: Prisma.$ServiceTokenPayload<ExtArgs>
        fields: Prisma.ServiceTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServiceTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServiceTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          findFirst: {
            args: Prisma.ServiceTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServiceTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          findMany: {
            args: Prisma.ServiceTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>[]
          }
          create: {
            args: Prisma.ServiceTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          createMany: {
            args: Prisma.ServiceTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServiceTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>[]
          }
          delete: {
            args: Prisma.ServiceTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          update: {
            args: Prisma.ServiceTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          deleteMany: {
            args: Prisma.ServiceTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServiceTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ServiceTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServiceTokenPayload>
          }
          aggregate: {
            args: Prisma.ServiceTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServiceToken>
          }
          groupBy: {
            args: Prisma.ServiceTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServiceTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServiceTokenCountArgs<ExtArgs>
            result: $Utils.Optional<ServiceTokenCountAggregateOutputType> | number
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
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    users: number
    subscriptions: number
    user_permissions: number
    companies: number
    product_configs: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | TenantCountOutputTypeCountUsersArgs
    subscriptions?: boolean | TenantCountOutputTypeCountSubscriptionsArgs
    user_permissions?: boolean | TenantCountOutputTypeCountUser_permissionsArgs
    companies?: boolean | TenantCountOutputTypeCountCompaniesArgs
    product_configs?: boolean | TenantCountOutputTypeCountProduct_configsArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountSubscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUser_permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPermissionWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountCompaniesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompanyWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountProduct_configsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductConfigWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    user_permissions: number
    memberships: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user_permissions?: boolean | UserCountOutputTypeCountUser_permissionsArgs
    memberships?: boolean | UserCountOutputTypeCountMembershipsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUser_permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPermissionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMembershipWhereInput
  }


  /**
   * Count Type CompanyCountOutputType
   */

  export type CompanyCountOutputType = {
    memberships: number
  }

  export type CompanyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memberships?: boolean | CompanyCountOutputTypeCountMembershipsArgs
  }

  // Custom InputTypes
  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CompanyCountOutputType
     */
    select?: CompanyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CompanyCountOutputType without action
   */
  export type CompanyCountOutputTypeCountMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMembershipWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    status: $Enums.TenantStatus | null
    clerk_org_id: string | null
    stripe_customer_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    status: $Enums.TenantStatus | null
    clerk_org_id: string | null
    stripe_customer_id: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    status: number
    clerk_org_id: number
    stripe_customer_id: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    status?: true
    clerk_org_id?: true
    stripe_customer_id?: true
    created_at?: true
    updated_at?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    status?: true
    clerk_org_id?: true
    stripe_customer_id?: true
    created_at?: true
    updated_at?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    status?: true
    clerk_org_id?: true
    stripe_customer_id?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    slug: string
    status: $Enums.TenantStatus
    clerk_org_id: string | null
    stripe_customer_id: string | null
    created_at: Date
    updated_at: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    clerk_org_id?: boolean
    stripe_customer_id?: boolean
    created_at?: boolean
    updated_at?: boolean
    users?: boolean | Tenant$usersArgs<ExtArgs>
    subscriptions?: boolean | Tenant$subscriptionsArgs<ExtArgs>
    user_permissions?: boolean | Tenant$user_permissionsArgs<ExtArgs>
    companies?: boolean | Tenant$companiesArgs<ExtArgs>
    product_configs?: boolean | Tenant$product_configsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    clerk_org_id?: boolean
    stripe_customer_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    status?: boolean
    clerk_org_id?: boolean
    stripe_customer_id?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Tenant$usersArgs<ExtArgs>
    subscriptions?: boolean | Tenant$subscriptionsArgs<ExtArgs>
    user_permissions?: boolean | Tenant$user_permissionsArgs<ExtArgs>
    companies?: boolean | Tenant$companiesArgs<ExtArgs>
    product_configs?: boolean | Tenant$product_configsArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      subscriptions: Prisma.$SubscriptionPayload<ExtArgs>[]
      user_permissions: Prisma.$UserPermissionPayload<ExtArgs>[]
      companies: Prisma.$CompanyPayload<ExtArgs>[]
      product_configs: Prisma.$ProductConfigPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      status: $Enums.TenantStatus
      clerk_org_id: string | null
      stripe_customer_id: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
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
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Tenant$usersArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany"> | Null>
    subscriptions<T extends Tenant$subscriptionsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$subscriptionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany"> | Null>
    user_permissions<T extends Tenant$user_permissionsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$user_permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findMany"> | Null>
    companies<T extends Tenant$companiesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$companiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany"> | Null>
    product_configs<T extends Tenant$product_configsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$product_configsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Tenant model
   */ 
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly status: FieldRef<"Tenant", 'TenantStatus'>
    readonly clerk_org_id: FieldRef<"Tenant", 'String'>
    readonly stripe_customer_id: FieldRef<"Tenant", 'String'>
    readonly created_at: FieldRef<"Tenant", 'DateTime'>
    readonly updated_at: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
  }

  /**
   * Tenant.users
   */
  export type Tenant$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Tenant.subscriptions
   */
  export type Tenant$subscriptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    cursor?: SubscriptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Tenant.user_permissions
   */
  export type Tenant$user_permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    where?: UserPermissionWhereInput
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    cursor?: UserPermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPermissionScalarFieldEnum | UserPermissionScalarFieldEnum[]
  }

  /**
   * Tenant.companies
   */
  export type Tenant$companiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    where?: CompanyWhereInput
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    cursor?: CompanyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Tenant.product_configs
   */
  export type Tenant$product_configsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    where?: ProductConfigWhereInput
    orderBy?: ProductConfigOrderByWithRelationInput | ProductConfigOrderByWithRelationInput[]
    cursor?: ProductConfigWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductConfigScalarFieldEnum | ProductConfigScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    clerk_user_id: string | null
    email: string | null
    name: string | null
    role: $Enums.UserRole | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    clerk_user_id: string | null
    email: string | null
    name: string | null
    role: $Enums.UserRole | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    tenant_id: number
    clerk_user_id: number
    email: number
    name: number
    role: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    tenant_id?: true
    clerk_user_id?: true
    email?: true
    name?: true
    role?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    clerk_user_id?: true
    email?: true
    name?: true
    role?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    tenant_id?: true
    clerk_user_id?: true
    email?: true
    name?: true
    role?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    tenant_id: string
    clerk_user_id: string
    email: string
    name: string
    role: $Enums.UserRole
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    clerk_user_id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user_permissions?: boolean | User$user_permissionsArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    clerk_user_id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    clerk_user_id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user_permissions?: boolean | User$user_permissionsArgs<ExtArgs>
    memberships?: boolean | User$membershipsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      user_permissions: Prisma.$UserPermissionPayload<ExtArgs>[]
      memberships: Prisma.$UserMembershipPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      clerk_user_id: string
      email: string
      name: string
      role: $Enums.UserRole
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    user_permissions<T extends User$user_permissionsArgs<ExtArgs> = {}>(args?: Subset<T, User$user_permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findMany"> | Null>
    memberships<T extends User$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, User$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly tenant_id: FieldRef<"User", 'String'>
    readonly clerk_user_id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.user_permissions
   */
  export type User$user_permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    where?: UserPermissionWhereInput
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    cursor?: UserPermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserPermissionScalarFieldEnum | UserPermissionScalarFieldEnum[]
  }

  /**
   * User.memberships
   */
  export type User$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    where?: UserMembershipWhereInput
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    cursor?: UserMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMembershipScalarFieldEnum | UserMembershipScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Subscription
   */

  export type AggregateSubscription = {
    _count: SubscriptionCountAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  export type SubscriptionMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    plan: $Enums.SubscriptionPlan | null
    status: $Enums.SubscriptionStatus | null
    stripe_subscription_id: string | null
    stripe_price_id: string | null
    trial_ends_at: Date | null
    current_period_start: Date | null
    current_period_end: Date | null
    cancelled_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SubscriptionMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    plan: $Enums.SubscriptionPlan | null
    status: $Enums.SubscriptionStatus | null
    stripe_subscription_id: string | null
    stripe_price_id: string | null
    trial_ends_at: Date | null
    current_period_start: Date | null
    current_period_end: Date | null
    cancelled_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SubscriptionCountAggregateOutputType = {
    id: number
    tenant_id: number
    plan: number
    status: number
    stripe_subscription_id: number
    stripe_price_id: number
    trial_ends_at: number
    current_period_start: number
    current_period_end: number
    cancelled_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type SubscriptionMinAggregateInputType = {
    id?: true
    tenant_id?: true
    plan?: true
    status?: true
    stripe_subscription_id?: true
    stripe_price_id?: true
    trial_ends_at?: true
    current_period_start?: true
    current_period_end?: true
    cancelled_at?: true
    created_at?: true
    updated_at?: true
  }

  export type SubscriptionMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    plan?: true
    status?: true
    stripe_subscription_id?: true
    stripe_price_id?: true
    trial_ends_at?: true
    current_period_start?: true
    current_period_end?: true
    cancelled_at?: true
    created_at?: true
    updated_at?: true
  }

  export type SubscriptionCountAggregateInputType = {
    id?: true
    tenant_id?: true
    plan?: true
    status?: true
    stripe_subscription_id?: true
    stripe_price_id?: true
    trial_ends_at?: true
    current_period_start?: true
    current_period_end?: true
    cancelled_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type SubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscription to aggregate.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Subscriptions
    **/
    _count?: true | SubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubscriptionMaxAggregateInputType
  }

  export type GetSubscriptionAggregateType<T extends SubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscription[P]>
      : GetScalarType<T[P], AggregateSubscription[P]>
  }




  export type SubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionWhereInput
    orderBy?: SubscriptionOrderByWithAggregationInput | SubscriptionOrderByWithAggregationInput[]
    by: SubscriptionScalarFieldEnum[] | SubscriptionScalarFieldEnum
    having?: SubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubscriptionCountAggregateInputType | true
    _min?: SubscriptionMinAggregateInputType
    _max?: SubscriptionMaxAggregateInputType
  }

  export type SubscriptionGroupByOutputType = {
    id: string
    tenant_id: string
    plan: $Enums.SubscriptionPlan
    status: $Enums.SubscriptionStatus
    stripe_subscription_id: string | null
    stripe_price_id: string | null
    trial_ends_at: Date | null
    current_period_start: Date | null
    current_period_end: Date | null
    cancelled_at: Date | null
    created_at: Date
    updated_at: Date
    _count: SubscriptionCountAggregateOutputType | null
    _min: SubscriptionMinAggregateOutputType | null
    _max: SubscriptionMaxAggregateOutputType | null
  }

  type GetSubscriptionGroupByPayload<T extends SubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], SubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type SubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    plan?: boolean
    status?: boolean
    stripe_subscription_id?: boolean
    stripe_price_id?: boolean
    trial_ends_at?: boolean
    current_period_start?: boolean
    current_period_end?: boolean
    cancelled_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    plan?: boolean
    status?: boolean
    stripe_subscription_id?: boolean
    stripe_price_id?: boolean
    trial_ends_at?: boolean
    current_period_start?: boolean
    current_period_end?: boolean
    cancelled_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["subscription"]>

  export type SubscriptionSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    plan?: boolean
    status?: boolean
    stripe_subscription_id?: boolean
    stripe_price_id?: boolean
    trial_ends_at?: boolean
    current_period_start?: boolean
    current_period_end?: boolean
    cancelled_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type SubscriptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type SubscriptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $SubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Subscription"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      plan: $Enums.SubscriptionPlan
      status: $Enums.SubscriptionStatus
      stripe_subscription_id: string | null
      stripe_price_id: string | null
      trial_ends_at: Date | null
      current_period_start: Date | null
      current_period_end: Date | null
      cancelled_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["subscription"]>
    composites: {}
  }

  type SubscriptionGetPayload<S extends boolean | null | undefined | SubscriptionDefaultArgs> = $Result.GetResult<Prisma.$SubscriptionPayload, S>

  type SubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SubscriptionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SubscriptionCountAggregateInputType | true
    }

  export interface SubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Subscription'], meta: { name: 'Subscription' } }
    /**
     * Find zero or one Subscription that matches the filter.
     * @param {SubscriptionFindUniqueArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubscriptionFindUniqueArgs>(args: SelectSubset<T, SubscriptionFindUniqueArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Subscription that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SubscriptionFindUniqueOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, SubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Subscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubscriptionFindFirstArgs>(args?: SelectSubset<T, SubscriptionFindFirstArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Subscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindFirstOrThrowArgs} args - Arguments to find a Subscription
     * @example
     * // Get one Subscription
     * const subscription = await prisma.subscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, SubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Subscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subscriptions
     * const subscriptions = await prisma.subscription.findMany()
     * 
     * // Get first 10 Subscriptions
     * const subscriptions = await prisma.subscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubscriptionFindManyArgs>(args?: SelectSubset<T, SubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Subscription.
     * @param {SubscriptionCreateArgs} args - Arguments to create a Subscription.
     * @example
     * // Create one Subscription
     * const Subscription = await prisma.subscription.create({
     *   data: {
     *     // ... data to create a Subscription
     *   }
     * })
     * 
     */
    create<T extends SubscriptionCreateArgs>(args: SelectSubset<T, SubscriptionCreateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Subscriptions.
     * @param {SubscriptionCreateManyArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubscriptionCreateManyArgs>(args?: SelectSubset<T, SubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Subscriptions and returns the data saved in the database.
     * @param {SubscriptionCreateManyAndReturnArgs} args - Arguments to create many Subscriptions.
     * @example
     * // Create many Subscriptions
     * const subscription = await prisma.subscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Subscriptions and only return the `id`
     * const subscriptionWithIdOnly = await prisma.subscription.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, SubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Subscription.
     * @param {SubscriptionDeleteArgs} args - Arguments to delete one Subscription.
     * @example
     * // Delete one Subscription
     * const Subscription = await prisma.subscription.delete({
     *   where: {
     *     // ... filter to delete one Subscription
     *   }
     * })
     * 
     */
    delete<T extends SubscriptionDeleteArgs>(args: SelectSubset<T, SubscriptionDeleteArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Subscription.
     * @param {SubscriptionUpdateArgs} args - Arguments to update one Subscription.
     * @example
     * // Update one Subscription
     * const subscription = await prisma.subscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubscriptionUpdateArgs>(args: SelectSubset<T, SubscriptionUpdateArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Subscriptions.
     * @param {SubscriptionDeleteManyArgs} args - Arguments to filter Subscriptions to delete.
     * @example
     * // Delete a few Subscriptions
     * const { count } = await prisma.subscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubscriptionDeleteManyArgs>(args?: SelectSubset<T, SubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subscriptions
     * const subscription = await prisma.subscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubscriptionUpdateManyArgs>(args: SelectSubset<T, SubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Subscription.
     * @param {SubscriptionUpsertArgs} args - Arguments to update or create a Subscription.
     * @example
     * // Update or create a Subscription
     * const subscription = await prisma.subscription.upsert({
     *   create: {
     *     // ... data to create a Subscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Subscription we want to update
     *   }
     * })
     */
    upsert<T extends SubscriptionUpsertArgs>(args: SelectSubset<T, SubscriptionUpsertArgs<ExtArgs>>): Prisma__SubscriptionClient<$Result.GetResult<Prisma.$SubscriptionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Subscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionCountArgs} args - Arguments to filter Subscriptions to count.
     * @example
     * // Count the number of Subscriptions
     * const count = await prisma.subscription.count({
     *   where: {
     *     // ... the filter for the Subscriptions we want to count
     *   }
     * })
    **/
    count<T extends SubscriptionCountArgs>(
      args?: Subset<T, SubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SubscriptionAggregateArgs>(args: Subset<T, SubscriptionAggregateArgs>): Prisma.PrismaPromise<GetSubscriptionAggregateType<T>>

    /**
     * Group by Subscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionGroupByArgs} args - Group by arguments.
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
      T extends SubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: SubscriptionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Subscription model
   */
  readonly fields: SubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Subscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the Subscription model
   */ 
  interface SubscriptionFieldRefs {
    readonly id: FieldRef<"Subscription", 'String'>
    readonly tenant_id: FieldRef<"Subscription", 'String'>
    readonly plan: FieldRef<"Subscription", 'SubscriptionPlan'>
    readonly status: FieldRef<"Subscription", 'SubscriptionStatus'>
    readonly stripe_subscription_id: FieldRef<"Subscription", 'String'>
    readonly stripe_price_id: FieldRef<"Subscription", 'String'>
    readonly trial_ends_at: FieldRef<"Subscription", 'DateTime'>
    readonly current_period_start: FieldRef<"Subscription", 'DateTime'>
    readonly current_period_end: FieldRef<"Subscription", 'DateTime'>
    readonly cancelled_at: FieldRef<"Subscription", 'DateTime'>
    readonly created_at: FieldRef<"Subscription", 'DateTime'>
    readonly updated_at: FieldRef<"Subscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Subscription findUnique
   */
  export type SubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findUniqueOrThrow
   */
  export type SubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription findFirst
   */
  export type SubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findFirstOrThrow
   */
  export type SubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscription to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Subscriptions.
     */
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription findMany
   */
  export type SubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter, which Subscriptions to fetch.
     */
    where?: SubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Subscriptions to fetch.
     */
    orderBy?: SubscriptionOrderByWithRelationInput | SubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Subscriptions.
     */
    cursor?: SubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Subscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Subscriptions.
     */
    skip?: number
    distinct?: SubscriptionScalarFieldEnum | SubscriptionScalarFieldEnum[]
  }

  /**
   * Subscription create
   */
  export type SubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to create a Subscription.
     */
    data: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
  }

  /**
   * Subscription createMany
   */
  export type SubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Subscription createManyAndReturn
   */
  export type SubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Subscriptions.
     */
    data: SubscriptionCreateManyInput | SubscriptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Subscription update
   */
  export type SubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The data needed to update a Subscription.
     */
    data: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
    /**
     * Choose, which Subscription to update.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription updateMany
   */
  export type SubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Subscriptions.
     */
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which Subscriptions to update
     */
    where?: SubscriptionWhereInput
  }

  /**
   * Subscription upsert
   */
  export type SubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * The filter to search for the Subscription to update in case it exists.
     */
    where: SubscriptionWhereUniqueInput
    /**
     * In case the Subscription found by the `where` argument doesn't exist, create a new Subscription with this data.
     */
    create: XOR<SubscriptionCreateInput, SubscriptionUncheckedCreateInput>
    /**
     * In case the Subscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubscriptionUpdateInput, SubscriptionUncheckedUpdateInput>
  }

  /**
   * Subscription delete
   */
  export type SubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
    /**
     * Filter which Subscription to delete.
     */
    where: SubscriptionWhereUniqueInput
  }

  /**
   * Subscription deleteMany
   */
  export type SubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Subscriptions to delete
     */
    where?: SubscriptionWhereInput
  }

  /**
   * Subscription without action
   */
  export type SubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Subscription
     */
    select?: SubscriptionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubscriptionInclude<ExtArgs> | null
  }


  /**
   * Model UserPermission
   */

  export type AggregateUserPermission = {
    _count: UserPermissionCountAggregateOutputType | null
    _min: UserPermissionMinAggregateOutputType | null
    _max: UserPermissionMaxAggregateOutputType | null
  }

  export type UserPermissionMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    company_id: string | null
    user_id: string | null
    product_id: string | null
    permission: string | null
    granted_by: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserPermissionMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    company_id: string | null
    user_id: string | null
    product_id: string | null
    permission: string | null
    granted_by: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserPermissionCountAggregateOutputType = {
    id: number
    tenant_id: number
    company_id: number
    user_id: number
    product_id: number
    permission: number
    granted_by: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserPermissionMinAggregateInputType = {
    id?: true
    tenant_id?: true
    company_id?: true
    user_id?: true
    product_id?: true
    permission?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
  }

  export type UserPermissionMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    company_id?: true
    user_id?: true
    product_id?: true
    permission?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
  }

  export type UserPermissionCountAggregateInputType = {
    id?: true
    tenant_id?: true
    company_id?: true
    user_id?: true
    product_id?: true
    permission?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserPermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPermission to aggregate.
     */
    where?: UserPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPermissions to fetch.
     */
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserPermissions
    **/
    _count?: true | UserPermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserPermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserPermissionMaxAggregateInputType
  }

  export type GetUserPermissionAggregateType<T extends UserPermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateUserPermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserPermission[P]>
      : GetScalarType<T[P], AggregateUserPermission[P]>
  }




  export type UserPermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPermissionWhereInput
    orderBy?: UserPermissionOrderByWithAggregationInput | UserPermissionOrderByWithAggregationInput[]
    by: UserPermissionScalarFieldEnum[] | UserPermissionScalarFieldEnum
    having?: UserPermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserPermissionCountAggregateInputType | true
    _min?: UserPermissionMinAggregateInputType
    _max?: UserPermissionMaxAggregateInputType
  }

  export type UserPermissionGroupByOutputType = {
    id: string
    tenant_id: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at: Date
    updated_at: Date
    _count: UserPermissionCountAggregateOutputType | null
    _min: UserPermissionMinAggregateOutputType | null
    _max: UserPermissionMaxAggregateOutputType | null
  }

  type GetUserPermissionGroupByPayload<T extends UserPermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserPermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserPermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserPermissionGroupByOutputType[P]>
            : GetScalarType<T[P], UserPermissionGroupByOutputType[P]>
        }
      >
    >


  export type UserPermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    company_id?: boolean
    user_id?: boolean
    product_id?: boolean
    permission?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPermission"]>

  export type UserPermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    company_id?: boolean
    user_id?: boolean
    product_id?: boolean
    permission?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userPermission"]>

  export type UserPermissionSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    company_id?: boolean
    user_id?: boolean
    product_id?: boolean
    permission?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserPermissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserPermissionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserPermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserPermission"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      company_id: string
      user_id: string
      product_id: string
      permission: string
      granted_by: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["userPermission"]>
    composites: {}
  }

  type UserPermissionGetPayload<S extends boolean | null | undefined | UserPermissionDefaultArgs> = $Result.GetResult<Prisma.$UserPermissionPayload, S>

  type UserPermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserPermissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserPermissionCountAggregateInputType | true
    }

  export interface UserPermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserPermission'], meta: { name: 'UserPermission' } }
    /**
     * Find zero or one UserPermission that matches the filter.
     * @param {UserPermissionFindUniqueArgs} args - Arguments to find a UserPermission
     * @example
     * // Get one UserPermission
     * const userPermission = await prisma.userPermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserPermissionFindUniqueArgs>(args: SelectSubset<T, UserPermissionFindUniqueArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserPermission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserPermissionFindUniqueOrThrowArgs} args - Arguments to find a UserPermission
     * @example
     * // Get one UserPermission
     * const userPermission = await prisma.userPermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserPermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, UserPermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserPermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionFindFirstArgs} args - Arguments to find a UserPermission
     * @example
     * // Get one UserPermission
     * const userPermission = await prisma.userPermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserPermissionFindFirstArgs>(args?: SelectSubset<T, UserPermissionFindFirstArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserPermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionFindFirstOrThrowArgs} args - Arguments to find a UserPermission
     * @example
     * // Get one UserPermission
     * const userPermission = await prisma.userPermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserPermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, UserPermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserPermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserPermissions
     * const userPermissions = await prisma.userPermission.findMany()
     * 
     * // Get first 10 UserPermissions
     * const userPermissions = await prisma.userPermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userPermissionWithIdOnly = await prisma.userPermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserPermissionFindManyArgs>(args?: SelectSubset<T, UserPermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserPermission.
     * @param {UserPermissionCreateArgs} args - Arguments to create a UserPermission.
     * @example
     * // Create one UserPermission
     * const UserPermission = await prisma.userPermission.create({
     *   data: {
     *     // ... data to create a UserPermission
     *   }
     * })
     * 
     */
    create<T extends UserPermissionCreateArgs>(args: SelectSubset<T, UserPermissionCreateArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserPermissions.
     * @param {UserPermissionCreateManyArgs} args - Arguments to create many UserPermissions.
     * @example
     * // Create many UserPermissions
     * const userPermission = await prisma.userPermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserPermissionCreateManyArgs>(args?: SelectSubset<T, UserPermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserPermissions and returns the data saved in the database.
     * @param {UserPermissionCreateManyAndReturnArgs} args - Arguments to create many UserPermissions.
     * @example
     * // Create many UserPermissions
     * const userPermission = await prisma.userPermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserPermissions and only return the `id`
     * const userPermissionWithIdOnly = await prisma.userPermission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserPermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, UserPermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserPermission.
     * @param {UserPermissionDeleteArgs} args - Arguments to delete one UserPermission.
     * @example
     * // Delete one UserPermission
     * const UserPermission = await prisma.userPermission.delete({
     *   where: {
     *     // ... filter to delete one UserPermission
     *   }
     * })
     * 
     */
    delete<T extends UserPermissionDeleteArgs>(args: SelectSubset<T, UserPermissionDeleteArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserPermission.
     * @param {UserPermissionUpdateArgs} args - Arguments to update one UserPermission.
     * @example
     * // Update one UserPermission
     * const userPermission = await prisma.userPermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserPermissionUpdateArgs>(args: SelectSubset<T, UserPermissionUpdateArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserPermissions.
     * @param {UserPermissionDeleteManyArgs} args - Arguments to filter UserPermissions to delete.
     * @example
     * // Delete a few UserPermissions
     * const { count } = await prisma.userPermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserPermissionDeleteManyArgs>(args?: SelectSubset<T, UserPermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserPermissions
     * const userPermission = await prisma.userPermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserPermissionUpdateManyArgs>(args: SelectSubset<T, UserPermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserPermission.
     * @param {UserPermissionUpsertArgs} args - Arguments to update or create a UserPermission.
     * @example
     * // Update or create a UserPermission
     * const userPermission = await prisma.userPermission.upsert({
     *   create: {
     *     // ... data to create a UserPermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserPermission we want to update
     *   }
     * })
     */
    upsert<T extends UserPermissionUpsertArgs>(args: SelectSubset<T, UserPermissionUpsertArgs<ExtArgs>>): Prisma__UserPermissionClient<$Result.GetResult<Prisma.$UserPermissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionCountArgs} args - Arguments to filter UserPermissions to count.
     * @example
     * // Count the number of UserPermissions
     * const count = await prisma.userPermission.count({
     *   where: {
     *     // ... the filter for the UserPermissions we want to count
     *   }
     * })
    **/
    count<T extends UserPermissionCountArgs>(
      args?: Subset<T, UserPermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserPermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserPermissionAggregateArgs>(args: Subset<T, UserPermissionAggregateArgs>): Prisma.PrismaPromise<GetUserPermissionAggregateType<T>>

    /**
     * Group by UserPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPermissionGroupByArgs} args - Group by arguments.
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
      T extends UserPermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserPermissionGroupByArgs['orderBy'] }
        : { orderBy?: UserPermissionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserPermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserPermission model
   */
  readonly fields: UserPermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserPermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserPermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the UserPermission model
   */ 
  interface UserPermissionFieldRefs {
    readonly id: FieldRef<"UserPermission", 'String'>
    readonly tenant_id: FieldRef<"UserPermission", 'String'>
    readonly company_id: FieldRef<"UserPermission", 'String'>
    readonly user_id: FieldRef<"UserPermission", 'String'>
    readonly product_id: FieldRef<"UserPermission", 'String'>
    readonly permission: FieldRef<"UserPermission", 'String'>
    readonly granted_by: FieldRef<"UserPermission", 'String'>
    readonly created_at: FieldRef<"UserPermission", 'DateTime'>
    readonly updated_at: FieldRef<"UserPermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserPermission findUnique
   */
  export type UserPermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter, which UserPermission to fetch.
     */
    where: UserPermissionWhereUniqueInput
  }

  /**
   * UserPermission findUniqueOrThrow
   */
  export type UserPermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter, which UserPermission to fetch.
     */
    where: UserPermissionWhereUniqueInput
  }

  /**
   * UserPermission findFirst
   */
  export type UserPermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter, which UserPermission to fetch.
     */
    where?: UserPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPermissions to fetch.
     */
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPermissions.
     */
    cursor?: UserPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPermissions.
     */
    distinct?: UserPermissionScalarFieldEnum | UserPermissionScalarFieldEnum[]
  }

  /**
   * UserPermission findFirstOrThrow
   */
  export type UserPermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter, which UserPermission to fetch.
     */
    where?: UserPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPermissions to fetch.
     */
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPermissions.
     */
    cursor?: UserPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPermissions.
     */
    distinct?: UserPermissionScalarFieldEnum | UserPermissionScalarFieldEnum[]
  }

  /**
   * UserPermission findMany
   */
  export type UserPermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter, which UserPermissions to fetch.
     */
    where?: UserPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPermissions to fetch.
     */
    orderBy?: UserPermissionOrderByWithRelationInput | UserPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserPermissions.
     */
    cursor?: UserPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPermissions.
     */
    skip?: number
    distinct?: UserPermissionScalarFieldEnum | UserPermissionScalarFieldEnum[]
  }

  /**
   * UserPermission create
   */
  export type UserPermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * The data needed to create a UserPermission.
     */
    data: XOR<UserPermissionCreateInput, UserPermissionUncheckedCreateInput>
  }

  /**
   * UserPermission createMany
   */
  export type UserPermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserPermissions.
     */
    data: UserPermissionCreateManyInput | UserPermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserPermission createManyAndReturn
   */
  export type UserPermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserPermissions.
     */
    data: UserPermissionCreateManyInput | UserPermissionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserPermission update
   */
  export type UserPermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * The data needed to update a UserPermission.
     */
    data: XOR<UserPermissionUpdateInput, UserPermissionUncheckedUpdateInput>
    /**
     * Choose, which UserPermission to update.
     */
    where: UserPermissionWhereUniqueInput
  }

  /**
   * UserPermission updateMany
   */
  export type UserPermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserPermissions.
     */
    data: XOR<UserPermissionUpdateManyMutationInput, UserPermissionUncheckedUpdateManyInput>
    /**
     * Filter which UserPermissions to update
     */
    where?: UserPermissionWhereInput
  }

  /**
   * UserPermission upsert
   */
  export type UserPermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * The filter to search for the UserPermission to update in case it exists.
     */
    where: UserPermissionWhereUniqueInput
    /**
     * In case the UserPermission found by the `where` argument doesn't exist, create a new UserPermission with this data.
     */
    create: XOR<UserPermissionCreateInput, UserPermissionUncheckedCreateInput>
    /**
     * In case the UserPermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserPermissionUpdateInput, UserPermissionUncheckedUpdateInput>
  }

  /**
   * UserPermission delete
   */
  export type UserPermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
    /**
     * Filter which UserPermission to delete.
     */
    where: UserPermissionWhereUniqueInput
  }

  /**
   * UserPermission deleteMany
   */
  export type UserPermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPermissions to delete
     */
    where?: UserPermissionWhereInput
  }

  /**
   * UserPermission without action
   */
  export type UserPermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPermission
     */
    select?: UserPermissionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserPermissionInclude<ExtArgs> | null
  }


  /**
   * Model GravityAdminPermission
   */

  export type AggregateGravityAdminPermission = {
    _count: GravityAdminPermissionCountAggregateOutputType | null
    _min: GravityAdminPermissionMinAggregateOutputType | null
    _max: GravityAdminPermissionMaxAggregateOutputType | null
  }

  export type GravityAdminPermissionMinAggregateOutputType = {
    id: string | null
    admin_id: string | null
    resource: string | null
    action: string | null
    granted_by: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type GravityAdminPermissionMaxAggregateOutputType = {
    id: string | null
    admin_id: string | null
    resource: string | null
    action: string | null
    granted_by: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type GravityAdminPermissionCountAggregateOutputType = {
    id: number
    admin_id: number
    resource: number
    action: number
    granted_by: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type GravityAdminPermissionMinAggregateInputType = {
    id?: true
    admin_id?: true
    resource?: true
    action?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
  }

  export type GravityAdminPermissionMaxAggregateInputType = {
    id?: true
    admin_id?: true
    resource?: true
    action?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
  }

  export type GravityAdminPermissionCountAggregateInputType = {
    id?: true
    admin_id?: true
    resource?: true
    action?: true
    granted_by?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type GravityAdminPermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GravityAdminPermission to aggregate.
     */
    where?: GravityAdminPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GravityAdminPermissions to fetch.
     */
    orderBy?: GravityAdminPermissionOrderByWithRelationInput | GravityAdminPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GravityAdminPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GravityAdminPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GravityAdminPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GravityAdminPermissions
    **/
    _count?: true | GravityAdminPermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GravityAdminPermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GravityAdminPermissionMaxAggregateInputType
  }

  export type GetGravityAdminPermissionAggregateType<T extends GravityAdminPermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateGravityAdminPermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGravityAdminPermission[P]>
      : GetScalarType<T[P], AggregateGravityAdminPermission[P]>
  }




  export type GravityAdminPermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GravityAdminPermissionWhereInput
    orderBy?: GravityAdminPermissionOrderByWithAggregationInput | GravityAdminPermissionOrderByWithAggregationInput[]
    by: GravityAdminPermissionScalarFieldEnum[] | GravityAdminPermissionScalarFieldEnum
    having?: GravityAdminPermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GravityAdminPermissionCountAggregateInputType | true
    _min?: GravityAdminPermissionMinAggregateInputType
    _max?: GravityAdminPermissionMaxAggregateInputType
  }

  export type GravityAdminPermissionGroupByOutputType = {
    id: string
    admin_id: string
    resource: string
    action: string
    granted_by: string
    created_at: Date
    updated_at: Date
    _count: GravityAdminPermissionCountAggregateOutputType | null
    _min: GravityAdminPermissionMinAggregateOutputType | null
    _max: GravityAdminPermissionMaxAggregateOutputType | null
  }

  type GetGravityAdminPermissionGroupByPayload<T extends GravityAdminPermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GravityAdminPermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GravityAdminPermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GravityAdminPermissionGroupByOutputType[P]>
            : GetScalarType<T[P], GravityAdminPermissionGroupByOutputType[P]>
        }
      >
    >


  export type GravityAdminPermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    admin_id?: boolean
    resource?: boolean
    action?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["gravityAdminPermission"]>

  export type GravityAdminPermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    admin_id?: boolean
    resource?: boolean
    action?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["gravityAdminPermission"]>

  export type GravityAdminPermissionSelectScalar = {
    id?: boolean
    admin_id?: boolean
    resource?: boolean
    action?: boolean
    granted_by?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $GravityAdminPermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GravityAdminPermission"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      admin_id: string
      resource: string
      action: string
      granted_by: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["gravityAdminPermission"]>
    composites: {}
  }

  type GravityAdminPermissionGetPayload<S extends boolean | null | undefined | GravityAdminPermissionDefaultArgs> = $Result.GetResult<Prisma.$GravityAdminPermissionPayload, S>

  type GravityAdminPermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GravityAdminPermissionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GravityAdminPermissionCountAggregateInputType | true
    }

  export interface GravityAdminPermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GravityAdminPermission'], meta: { name: 'GravityAdminPermission' } }
    /**
     * Find zero or one GravityAdminPermission that matches the filter.
     * @param {GravityAdminPermissionFindUniqueArgs} args - Arguments to find a GravityAdminPermission
     * @example
     * // Get one GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GravityAdminPermissionFindUniqueArgs>(args: SelectSubset<T, GravityAdminPermissionFindUniqueArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GravityAdminPermission that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GravityAdminPermissionFindUniqueOrThrowArgs} args - Arguments to find a GravityAdminPermission
     * @example
     * // Get one GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GravityAdminPermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, GravityAdminPermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GravityAdminPermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionFindFirstArgs} args - Arguments to find a GravityAdminPermission
     * @example
     * // Get one GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GravityAdminPermissionFindFirstArgs>(args?: SelectSubset<T, GravityAdminPermissionFindFirstArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GravityAdminPermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionFindFirstOrThrowArgs} args - Arguments to find a GravityAdminPermission
     * @example
     * // Get one GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GravityAdminPermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, GravityAdminPermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GravityAdminPermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GravityAdminPermissions
     * const gravityAdminPermissions = await prisma.gravityAdminPermission.findMany()
     * 
     * // Get first 10 GravityAdminPermissions
     * const gravityAdminPermissions = await prisma.gravityAdminPermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gravityAdminPermissionWithIdOnly = await prisma.gravityAdminPermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GravityAdminPermissionFindManyArgs>(args?: SelectSubset<T, GravityAdminPermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GravityAdminPermission.
     * @param {GravityAdminPermissionCreateArgs} args - Arguments to create a GravityAdminPermission.
     * @example
     * // Create one GravityAdminPermission
     * const GravityAdminPermission = await prisma.gravityAdminPermission.create({
     *   data: {
     *     // ... data to create a GravityAdminPermission
     *   }
     * })
     * 
     */
    create<T extends GravityAdminPermissionCreateArgs>(args: SelectSubset<T, GravityAdminPermissionCreateArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GravityAdminPermissions.
     * @param {GravityAdminPermissionCreateManyArgs} args - Arguments to create many GravityAdminPermissions.
     * @example
     * // Create many GravityAdminPermissions
     * const gravityAdminPermission = await prisma.gravityAdminPermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GravityAdminPermissionCreateManyArgs>(args?: SelectSubset<T, GravityAdminPermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GravityAdminPermissions and returns the data saved in the database.
     * @param {GravityAdminPermissionCreateManyAndReturnArgs} args - Arguments to create many GravityAdminPermissions.
     * @example
     * // Create many GravityAdminPermissions
     * const gravityAdminPermission = await prisma.gravityAdminPermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GravityAdminPermissions and only return the `id`
     * const gravityAdminPermissionWithIdOnly = await prisma.gravityAdminPermission.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GravityAdminPermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, GravityAdminPermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GravityAdminPermission.
     * @param {GravityAdminPermissionDeleteArgs} args - Arguments to delete one GravityAdminPermission.
     * @example
     * // Delete one GravityAdminPermission
     * const GravityAdminPermission = await prisma.gravityAdminPermission.delete({
     *   where: {
     *     // ... filter to delete one GravityAdminPermission
     *   }
     * })
     * 
     */
    delete<T extends GravityAdminPermissionDeleteArgs>(args: SelectSubset<T, GravityAdminPermissionDeleteArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GravityAdminPermission.
     * @param {GravityAdminPermissionUpdateArgs} args - Arguments to update one GravityAdminPermission.
     * @example
     * // Update one GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GravityAdminPermissionUpdateArgs>(args: SelectSubset<T, GravityAdminPermissionUpdateArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GravityAdminPermissions.
     * @param {GravityAdminPermissionDeleteManyArgs} args - Arguments to filter GravityAdminPermissions to delete.
     * @example
     * // Delete a few GravityAdminPermissions
     * const { count } = await prisma.gravityAdminPermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GravityAdminPermissionDeleteManyArgs>(args?: SelectSubset<T, GravityAdminPermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GravityAdminPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GravityAdminPermissions
     * const gravityAdminPermission = await prisma.gravityAdminPermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GravityAdminPermissionUpdateManyArgs>(args: SelectSubset<T, GravityAdminPermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GravityAdminPermission.
     * @param {GravityAdminPermissionUpsertArgs} args - Arguments to update or create a GravityAdminPermission.
     * @example
     * // Update or create a GravityAdminPermission
     * const gravityAdminPermission = await prisma.gravityAdminPermission.upsert({
     *   create: {
     *     // ... data to create a GravityAdminPermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GravityAdminPermission we want to update
     *   }
     * })
     */
    upsert<T extends GravityAdminPermissionUpsertArgs>(args: SelectSubset<T, GravityAdminPermissionUpsertArgs<ExtArgs>>): Prisma__GravityAdminPermissionClient<$Result.GetResult<Prisma.$GravityAdminPermissionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GravityAdminPermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionCountArgs} args - Arguments to filter GravityAdminPermissions to count.
     * @example
     * // Count the number of GravityAdminPermissions
     * const count = await prisma.gravityAdminPermission.count({
     *   where: {
     *     // ... the filter for the GravityAdminPermissions we want to count
     *   }
     * })
    **/
    count<T extends GravityAdminPermissionCountArgs>(
      args?: Subset<T, GravityAdminPermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GravityAdminPermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GravityAdminPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GravityAdminPermissionAggregateArgs>(args: Subset<T, GravityAdminPermissionAggregateArgs>): Prisma.PrismaPromise<GetGravityAdminPermissionAggregateType<T>>

    /**
     * Group by GravityAdminPermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GravityAdminPermissionGroupByArgs} args - Group by arguments.
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
      T extends GravityAdminPermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GravityAdminPermissionGroupByArgs['orderBy'] }
        : { orderBy?: GravityAdminPermissionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, GravityAdminPermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGravityAdminPermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GravityAdminPermission model
   */
  readonly fields: GravityAdminPermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GravityAdminPermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GravityAdminPermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the GravityAdminPermission model
   */ 
  interface GravityAdminPermissionFieldRefs {
    readonly id: FieldRef<"GravityAdminPermission", 'String'>
    readonly admin_id: FieldRef<"GravityAdminPermission", 'String'>
    readonly resource: FieldRef<"GravityAdminPermission", 'String'>
    readonly action: FieldRef<"GravityAdminPermission", 'String'>
    readonly granted_by: FieldRef<"GravityAdminPermission", 'String'>
    readonly created_at: FieldRef<"GravityAdminPermission", 'DateTime'>
    readonly updated_at: FieldRef<"GravityAdminPermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GravityAdminPermission findUnique
   */
  export type GravityAdminPermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter, which GravityAdminPermission to fetch.
     */
    where: GravityAdminPermissionWhereUniqueInput
  }

  /**
   * GravityAdminPermission findUniqueOrThrow
   */
  export type GravityAdminPermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter, which GravityAdminPermission to fetch.
     */
    where: GravityAdminPermissionWhereUniqueInput
  }

  /**
   * GravityAdminPermission findFirst
   */
  export type GravityAdminPermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter, which GravityAdminPermission to fetch.
     */
    where?: GravityAdminPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GravityAdminPermissions to fetch.
     */
    orderBy?: GravityAdminPermissionOrderByWithRelationInput | GravityAdminPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GravityAdminPermissions.
     */
    cursor?: GravityAdminPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GravityAdminPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GravityAdminPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GravityAdminPermissions.
     */
    distinct?: GravityAdminPermissionScalarFieldEnum | GravityAdminPermissionScalarFieldEnum[]
  }

  /**
   * GravityAdminPermission findFirstOrThrow
   */
  export type GravityAdminPermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter, which GravityAdminPermission to fetch.
     */
    where?: GravityAdminPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GravityAdminPermissions to fetch.
     */
    orderBy?: GravityAdminPermissionOrderByWithRelationInput | GravityAdminPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GravityAdminPermissions.
     */
    cursor?: GravityAdminPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GravityAdminPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GravityAdminPermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GravityAdminPermissions.
     */
    distinct?: GravityAdminPermissionScalarFieldEnum | GravityAdminPermissionScalarFieldEnum[]
  }

  /**
   * GravityAdminPermission findMany
   */
  export type GravityAdminPermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter, which GravityAdminPermissions to fetch.
     */
    where?: GravityAdminPermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GravityAdminPermissions to fetch.
     */
    orderBy?: GravityAdminPermissionOrderByWithRelationInput | GravityAdminPermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GravityAdminPermissions.
     */
    cursor?: GravityAdminPermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GravityAdminPermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GravityAdminPermissions.
     */
    skip?: number
    distinct?: GravityAdminPermissionScalarFieldEnum | GravityAdminPermissionScalarFieldEnum[]
  }

  /**
   * GravityAdminPermission create
   */
  export type GravityAdminPermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * The data needed to create a GravityAdminPermission.
     */
    data: XOR<GravityAdminPermissionCreateInput, GravityAdminPermissionUncheckedCreateInput>
  }

  /**
   * GravityAdminPermission createMany
   */
  export type GravityAdminPermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GravityAdminPermissions.
     */
    data: GravityAdminPermissionCreateManyInput | GravityAdminPermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GravityAdminPermission createManyAndReturn
   */
  export type GravityAdminPermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GravityAdminPermissions.
     */
    data: GravityAdminPermissionCreateManyInput | GravityAdminPermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GravityAdminPermission update
   */
  export type GravityAdminPermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * The data needed to update a GravityAdminPermission.
     */
    data: XOR<GravityAdminPermissionUpdateInput, GravityAdminPermissionUncheckedUpdateInput>
    /**
     * Choose, which GravityAdminPermission to update.
     */
    where: GravityAdminPermissionWhereUniqueInput
  }

  /**
   * GravityAdminPermission updateMany
   */
  export type GravityAdminPermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GravityAdminPermissions.
     */
    data: XOR<GravityAdminPermissionUpdateManyMutationInput, GravityAdminPermissionUncheckedUpdateManyInput>
    /**
     * Filter which GravityAdminPermissions to update
     */
    where?: GravityAdminPermissionWhereInput
  }

  /**
   * GravityAdminPermission upsert
   */
  export type GravityAdminPermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * The filter to search for the GravityAdminPermission to update in case it exists.
     */
    where: GravityAdminPermissionWhereUniqueInput
    /**
     * In case the GravityAdminPermission found by the `where` argument doesn't exist, create a new GravityAdminPermission with this data.
     */
    create: XOR<GravityAdminPermissionCreateInput, GravityAdminPermissionUncheckedCreateInput>
    /**
     * In case the GravityAdminPermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GravityAdminPermissionUpdateInput, GravityAdminPermissionUncheckedUpdateInput>
  }

  /**
   * GravityAdminPermission delete
   */
  export type GravityAdminPermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
    /**
     * Filter which GravityAdminPermission to delete.
     */
    where: GravityAdminPermissionWhereUniqueInput
  }

  /**
   * GravityAdminPermission deleteMany
   */
  export type GravityAdminPermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GravityAdminPermissions to delete
     */
    where?: GravityAdminPermissionWhereInput
  }

  /**
   * GravityAdminPermission without action
   */
  export type GravityAdminPermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GravityAdminPermission
     */
    select?: GravityAdminPermissionSelect<ExtArgs> | null
  }


  /**
   * Model Company
   */

  export type AggregateCompany = {
    _count: CompanyCountAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  export type CompanyMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    name: string | null
    subdomain: string | null
    cnpj: string | null
    status: $Enums.CompanyStatus | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CompanyMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    name: string | null
    subdomain: string | null
    cnpj: string | null
    status: $Enums.CompanyStatus | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CompanyCountAggregateOutputType = {
    id: number
    tenant_id: number
    name: number
    subdomain: number
    cnpj: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CompanyMinAggregateInputType = {
    id?: true
    tenant_id?: true
    name?: true
    subdomain?: true
    cnpj?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type CompanyMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    name?: true
    subdomain?: true
    cnpj?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type CompanyCountAggregateInputType = {
    id?: true
    tenant_id?: true
    name?: true
    subdomain?: true
    cnpj?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CompanyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Company to aggregate.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Companies
    **/
    _count?: true | CompanyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CompanyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CompanyMaxAggregateInputType
  }

  export type GetCompanyAggregateType<T extends CompanyAggregateArgs> = {
        [P in keyof T & keyof AggregateCompany]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCompany[P]>
      : GetScalarType<T[P], AggregateCompany[P]>
  }




  export type CompanyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CompanyWhereInput
    orderBy?: CompanyOrderByWithAggregationInput | CompanyOrderByWithAggregationInput[]
    by: CompanyScalarFieldEnum[] | CompanyScalarFieldEnum
    having?: CompanyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CompanyCountAggregateInputType | true
    _min?: CompanyMinAggregateInputType
    _max?: CompanyMaxAggregateInputType
  }

  export type CompanyGroupByOutputType = {
    id: string
    tenant_id: string
    name: string
    subdomain: string | null
    cnpj: string | null
    status: $Enums.CompanyStatus
    created_at: Date
    updated_at: Date
    _count: CompanyCountAggregateOutputType | null
    _min: CompanyMinAggregateOutputType | null
    _max: CompanyMaxAggregateOutputType | null
  }

  type GetCompanyGroupByPayload<T extends CompanyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CompanyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CompanyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CompanyGroupByOutputType[P]>
            : GetScalarType<T[P], CompanyGroupByOutputType[P]>
        }
      >
    >


  export type CompanySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    name?: boolean
    subdomain?: boolean
    cnpj?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    memberships?: boolean | Company$membershipsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["company"]>

  export type CompanySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    name?: boolean
    subdomain?: boolean
    cnpj?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["company"]>

  export type CompanySelectScalar = {
    id?: boolean
    tenant_id?: boolean
    name?: boolean
    subdomain?: boolean
    cnpj?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type CompanyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    memberships?: boolean | Company$membershipsArgs<ExtArgs>
    _count?: boolean | CompanyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CompanyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $CompanyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Company"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      memberships: Prisma.$UserMembershipPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      name: string
      subdomain: string | null
      cnpj: string | null
      status: $Enums.CompanyStatus
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["company"]>
    composites: {}
  }

  type CompanyGetPayload<S extends boolean | null | undefined | CompanyDefaultArgs> = $Result.GetResult<Prisma.$CompanyPayload, S>

  type CompanyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CompanyFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CompanyCountAggregateInputType | true
    }

  export interface CompanyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Company'], meta: { name: 'Company' } }
    /**
     * Find zero or one Company that matches the filter.
     * @param {CompanyFindUniqueArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CompanyFindUniqueArgs>(args: SelectSubset<T, CompanyFindUniqueArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Company that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CompanyFindUniqueOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CompanyFindUniqueOrThrowArgs>(args: SelectSubset<T, CompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Company that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CompanyFindFirstArgs>(args?: SelectSubset<T, CompanyFindFirstArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Company that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindFirstOrThrowArgs} args - Arguments to find a Company
     * @example
     * // Get one Company
     * const company = await prisma.company.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CompanyFindFirstOrThrowArgs>(args?: SelectSubset<T, CompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Companies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Companies
     * const companies = await prisma.company.findMany()
     * 
     * // Get first 10 Companies
     * const companies = await prisma.company.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const companyWithIdOnly = await prisma.company.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CompanyFindManyArgs>(args?: SelectSubset<T, CompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Company.
     * @param {CompanyCreateArgs} args - Arguments to create a Company.
     * @example
     * // Create one Company
     * const Company = await prisma.company.create({
     *   data: {
     *     // ... data to create a Company
     *   }
     * })
     * 
     */
    create<T extends CompanyCreateArgs>(args: SelectSubset<T, CompanyCreateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Companies.
     * @param {CompanyCreateManyArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CompanyCreateManyArgs>(args?: SelectSubset<T, CompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Companies and returns the data saved in the database.
     * @param {CompanyCreateManyAndReturnArgs} args - Arguments to create many Companies.
     * @example
     * // Create many Companies
     * const company = await prisma.company.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Companies and only return the `id`
     * const companyWithIdOnly = await prisma.company.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CompanyCreateManyAndReturnArgs>(args?: SelectSubset<T, CompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Company.
     * @param {CompanyDeleteArgs} args - Arguments to delete one Company.
     * @example
     * // Delete one Company
     * const Company = await prisma.company.delete({
     *   where: {
     *     // ... filter to delete one Company
     *   }
     * })
     * 
     */
    delete<T extends CompanyDeleteArgs>(args: SelectSubset<T, CompanyDeleteArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Company.
     * @param {CompanyUpdateArgs} args - Arguments to update one Company.
     * @example
     * // Update one Company
     * const company = await prisma.company.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CompanyUpdateArgs>(args: SelectSubset<T, CompanyUpdateArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Companies.
     * @param {CompanyDeleteManyArgs} args - Arguments to filter Companies to delete.
     * @example
     * // Delete a few Companies
     * const { count } = await prisma.company.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CompanyDeleteManyArgs>(args?: SelectSubset<T, CompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Companies
     * const company = await prisma.company.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CompanyUpdateManyArgs>(args: SelectSubset<T, CompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Company.
     * @param {CompanyUpsertArgs} args - Arguments to update or create a Company.
     * @example
     * // Update or create a Company
     * const company = await prisma.company.upsert({
     *   create: {
     *     // ... data to create a Company
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Company we want to update
     *   }
     * })
     */
    upsert<T extends CompanyUpsertArgs>(args: SelectSubset<T, CompanyUpsertArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Companies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyCountArgs} args - Arguments to filter Companies to count.
     * @example
     * // Count the number of Companies
     * const count = await prisma.company.count({
     *   where: {
     *     // ... the filter for the Companies we want to count
     *   }
     * })
    **/
    count<T extends CompanyCountArgs>(
      args?: Subset<T, CompanyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CompanyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CompanyAggregateArgs>(args: Subset<T, CompanyAggregateArgs>): Prisma.PrismaPromise<GetCompanyAggregateType<T>>

    /**
     * Group by Company.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CompanyGroupByArgs} args - Group by arguments.
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
      T extends CompanyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CompanyGroupByArgs['orderBy'] }
        : { orderBy?: CompanyGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Company model
   */
  readonly fields: CompanyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Company.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CompanyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    memberships<T extends Company$membershipsArgs<ExtArgs> = {}>(args?: Subset<T, Company$membershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the Company model
   */ 
  interface CompanyFieldRefs {
    readonly id: FieldRef<"Company", 'String'>
    readonly tenant_id: FieldRef<"Company", 'String'>
    readonly name: FieldRef<"Company", 'String'>
    readonly subdomain: FieldRef<"Company", 'String'>
    readonly cnpj: FieldRef<"Company", 'String'>
    readonly status: FieldRef<"Company", 'CompanyStatus'>
    readonly created_at: FieldRef<"Company", 'DateTime'>
    readonly updated_at: FieldRef<"Company", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Company findUnique
   */
  export type CompanyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findUniqueOrThrow
   */
  export type CompanyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company findFirst
   */
  export type CompanyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findFirstOrThrow
   */
  export type CompanyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Company to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Companies.
     */
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company findMany
   */
  export type CompanyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter, which Companies to fetch.
     */
    where?: CompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Companies to fetch.
     */
    orderBy?: CompanyOrderByWithRelationInput | CompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Companies.
     */
    cursor?: CompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Companies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Companies.
     */
    skip?: number
    distinct?: CompanyScalarFieldEnum | CompanyScalarFieldEnum[]
  }

  /**
   * Company create
   */
  export type CompanyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to create a Company.
     */
    data: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
  }

  /**
   * Company createMany
   */
  export type CompanyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Company createManyAndReturn
   */
  export type CompanyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Companies.
     */
    data: CompanyCreateManyInput | CompanyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Company update
   */
  export type CompanyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The data needed to update a Company.
     */
    data: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
    /**
     * Choose, which Company to update.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company updateMany
   */
  export type CompanyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Companies.
     */
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyInput>
    /**
     * Filter which Companies to update
     */
    where?: CompanyWhereInput
  }

  /**
   * Company upsert
   */
  export type CompanyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * The filter to search for the Company to update in case it exists.
     */
    where: CompanyWhereUniqueInput
    /**
     * In case the Company found by the `where` argument doesn't exist, create a new Company with this data.
     */
    create: XOR<CompanyCreateInput, CompanyUncheckedCreateInput>
    /**
     * In case the Company was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CompanyUpdateInput, CompanyUncheckedUpdateInput>
  }

  /**
   * Company delete
   */
  export type CompanyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
    /**
     * Filter which Company to delete.
     */
    where: CompanyWhereUniqueInput
  }

  /**
   * Company deleteMany
   */
  export type CompanyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Companies to delete
     */
    where?: CompanyWhereInput
  }

  /**
   * Company.memberships
   */
  export type Company$membershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    where?: UserMembershipWhereInput
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    cursor?: UserMembershipWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMembershipScalarFieldEnum | UserMembershipScalarFieldEnum[]
  }

  /**
   * Company without action
   */
  export type CompanyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Company
     */
    select?: CompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CompanyInclude<ExtArgs> | null
  }


  /**
   * Model UserMembership
   */

  export type AggregateUserMembership = {
    _count: UserMembershipCountAggregateOutputType | null
    _min: UserMembershipMinAggregateOutputType | null
    _max: UserMembershipMaxAggregateOutputType | null
  }

  export type UserMembershipMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    company_id: string | null
    role: $Enums.UserMembershipRole | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMembershipMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    company_id: string | null
    role: $Enums.UserMembershipRole | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMembershipCountAggregateOutputType = {
    id: number
    tenant_id: number
    user_id: number
    company_id: number
    role: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserMembershipMinAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    company_id?: true
    role?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMembershipMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    company_id?: true
    role?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMembershipCountAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    company_id?: true
    role?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserMembershipAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMembership to aggregate.
     */
    where?: UserMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemberships to fetch.
     */
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserMemberships
    **/
    _count?: true | UserMembershipCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMembershipMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMembershipMaxAggregateInputType
  }

  export type GetUserMembershipAggregateType<T extends UserMembershipAggregateArgs> = {
        [P in keyof T & keyof AggregateUserMembership]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserMembership[P]>
      : GetScalarType<T[P], AggregateUserMembership[P]>
  }




  export type UserMembershipGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMembershipWhereInput
    orderBy?: UserMembershipOrderByWithAggregationInput | UserMembershipOrderByWithAggregationInput[]
    by: UserMembershipScalarFieldEnum[] | UserMembershipScalarFieldEnum
    having?: UserMembershipScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserMembershipCountAggregateInputType | true
    _min?: UserMembershipMinAggregateInputType
    _max?: UserMembershipMaxAggregateInputType
  }

  export type UserMembershipGroupByOutputType = {
    id: string
    tenant_id: string
    user_id: string
    company_id: string
    role: $Enums.UserMembershipRole
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: UserMembershipCountAggregateOutputType | null
    _min: UserMembershipMinAggregateOutputType | null
    _max: UserMembershipMaxAggregateOutputType | null
  }

  type GetUserMembershipGroupByPayload<T extends UserMembershipGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserMembershipGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserMembershipGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserMembershipGroupByOutputType[P]>
            : GetScalarType<T[P], UserMembershipGroupByOutputType[P]>
        }
      >
    >


  export type UserMembershipSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    company_id?: boolean
    role?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMembership"]>

  export type UserMembershipSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    company_id?: boolean
    role?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMembership"]>

  export type UserMembershipSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    company_id?: boolean
    role?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserMembershipInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }
  export type UserMembershipIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    company?: boolean | CompanyDefaultArgs<ExtArgs>
  }

  export type $UserMembershipPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserMembership"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      company: Prisma.$CompanyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      user_id: string
      company_id: string
      role: $Enums.UserMembershipRole
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["userMembership"]>
    composites: {}
  }

  type UserMembershipGetPayload<S extends boolean | null | undefined | UserMembershipDefaultArgs> = $Result.GetResult<Prisma.$UserMembershipPayload, S>

  type UserMembershipCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserMembershipFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserMembershipCountAggregateInputType | true
    }

  export interface UserMembershipDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserMembership'], meta: { name: 'UserMembership' } }
    /**
     * Find zero or one UserMembership that matches the filter.
     * @param {UserMembershipFindUniqueArgs} args - Arguments to find a UserMembership
     * @example
     * // Get one UserMembership
     * const userMembership = await prisma.userMembership.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserMembershipFindUniqueArgs>(args: SelectSubset<T, UserMembershipFindUniqueArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserMembership that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserMembershipFindUniqueOrThrowArgs} args - Arguments to find a UserMembership
     * @example
     * // Get one UserMembership
     * const userMembership = await prisma.userMembership.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserMembershipFindUniqueOrThrowArgs>(args: SelectSubset<T, UserMembershipFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserMembership that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipFindFirstArgs} args - Arguments to find a UserMembership
     * @example
     * // Get one UserMembership
     * const userMembership = await prisma.userMembership.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserMembershipFindFirstArgs>(args?: SelectSubset<T, UserMembershipFindFirstArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserMembership that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipFindFirstOrThrowArgs} args - Arguments to find a UserMembership
     * @example
     * // Get one UserMembership
     * const userMembership = await prisma.userMembership.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserMembershipFindFirstOrThrowArgs>(args?: SelectSubset<T, UserMembershipFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserMemberships that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserMemberships
     * const userMemberships = await prisma.userMembership.findMany()
     * 
     * // Get first 10 UserMemberships
     * const userMemberships = await prisma.userMembership.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userMembershipWithIdOnly = await prisma.userMembership.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserMembershipFindManyArgs>(args?: SelectSubset<T, UserMembershipFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserMembership.
     * @param {UserMembershipCreateArgs} args - Arguments to create a UserMembership.
     * @example
     * // Create one UserMembership
     * const UserMembership = await prisma.userMembership.create({
     *   data: {
     *     // ... data to create a UserMembership
     *   }
     * })
     * 
     */
    create<T extends UserMembershipCreateArgs>(args: SelectSubset<T, UserMembershipCreateArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserMemberships.
     * @param {UserMembershipCreateManyArgs} args - Arguments to create many UserMemberships.
     * @example
     * // Create many UserMemberships
     * const userMembership = await prisma.userMembership.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserMembershipCreateManyArgs>(args?: SelectSubset<T, UserMembershipCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserMemberships and returns the data saved in the database.
     * @param {UserMembershipCreateManyAndReturnArgs} args - Arguments to create many UserMemberships.
     * @example
     * // Create many UserMemberships
     * const userMembership = await prisma.userMembership.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserMemberships and only return the `id`
     * const userMembershipWithIdOnly = await prisma.userMembership.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserMembershipCreateManyAndReturnArgs>(args?: SelectSubset<T, UserMembershipCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserMembership.
     * @param {UserMembershipDeleteArgs} args - Arguments to delete one UserMembership.
     * @example
     * // Delete one UserMembership
     * const UserMembership = await prisma.userMembership.delete({
     *   where: {
     *     // ... filter to delete one UserMembership
     *   }
     * })
     * 
     */
    delete<T extends UserMembershipDeleteArgs>(args: SelectSubset<T, UserMembershipDeleteArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserMembership.
     * @param {UserMembershipUpdateArgs} args - Arguments to update one UserMembership.
     * @example
     * // Update one UserMembership
     * const userMembership = await prisma.userMembership.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserMembershipUpdateArgs>(args: SelectSubset<T, UserMembershipUpdateArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserMemberships.
     * @param {UserMembershipDeleteManyArgs} args - Arguments to filter UserMemberships to delete.
     * @example
     * // Delete a few UserMemberships
     * const { count } = await prisma.userMembership.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserMembershipDeleteManyArgs>(args?: SelectSubset<T, UserMembershipDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserMemberships
     * const userMembership = await prisma.userMembership.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserMembershipUpdateManyArgs>(args: SelectSubset<T, UserMembershipUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserMembership.
     * @param {UserMembershipUpsertArgs} args - Arguments to update or create a UserMembership.
     * @example
     * // Update or create a UserMembership
     * const userMembership = await prisma.userMembership.upsert({
     *   create: {
     *     // ... data to create a UserMembership
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserMembership we want to update
     *   }
     * })
     */
    upsert<T extends UserMembershipUpsertArgs>(args: SelectSubset<T, UserMembershipUpsertArgs<ExtArgs>>): Prisma__UserMembershipClient<$Result.GetResult<Prisma.$UserMembershipPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserMemberships.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipCountArgs} args - Arguments to filter UserMemberships to count.
     * @example
     * // Count the number of UserMemberships
     * const count = await prisma.userMembership.count({
     *   where: {
     *     // ... the filter for the UserMemberships we want to count
     *   }
     * })
    **/
    count<T extends UserMembershipCountArgs>(
      args?: Subset<T, UserMembershipCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserMembershipCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserMembershipAggregateArgs>(args: Subset<T, UserMembershipAggregateArgs>): Prisma.PrismaPromise<GetUserMembershipAggregateType<T>>

    /**
     * Group by UserMembership.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMembershipGroupByArgs} args - Group by arguments.
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
      T extends UserMembershipGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserMembershipGroupByArgs['orderBy'] }
        : { orderBy?: UserMembershipGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserMembershipGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserMembershipGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserMembership model
   */
  readonly fields: UserMembershipFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserMembership.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserMembershipClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    company<T extends CompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CompanyDefaultArgs<ExtArgs>>): Prisma__CompanyClient<$Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the UserMembership model
   */ 
  interface UserMembershipFieldRefs {
    readonly id: FieldRef<"UserMembership", 'String'>
    readonly tenant_id: FieldRef<"UserMembership", 'String'>
    readonly user_id: FieldRef<"UserMembership", 'String'>
    readonly company_id: FieldRef<"UserMembership", 'String'>
    readonly role: FieldRef<"UserMembership", 'UserMembershipRole'>
    readonly is_active: FieldRef<"UserMembership", 'Boolean'>
    readonly created_at: FieldRef<"UserMembership", 'DateTime'>
    readonly updated_at: FieldRef<"UserMembership", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserMembership findUnique
   */
  export type UserMembershipFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter, which UserMembership to fetch.
     */
    where: UserMembershipWhereUniqueInput
  }

  /**
   * UserMembership findUniqueOrThrow
   */
  export type UserMembershipFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter, which UserMembership to fetch.
     */
    where: UserMembershipWhereUniqueInput
  }

  /**
   * UserMembership findFirst
   */
  export type UserMembershipFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter, which UserMembership to fetch.
     */
    where?: UserMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemberships to fetch.
     */
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMemberships.
     */
    cursor?: UserMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMemberships.
     */
    distinct?: UserMembershipScalarFieldEnum | UserMembershipScalarFieldEnum[]
  }

  /**
   * UserMembership findFirstOrThrow
   */
  export type UserMembershipFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter, which UserMembership to fetch.
     */
    where?: UserMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemberships to fetch.
     */
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMemberships.
     */
    cursor?: UserMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemberships.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMemberships.
     */
    distinct?: UserMembershipScalarFieldEnum | UserMembershipScalarFieldEnum[]
  }

  /**
   * UserMembership findMany
   */
  export type UserMembershipFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter, which UserMemberships to fetch.
     */
    where?: UserMembershipWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemberships to fetch.
     */
    orderBy?: UserMembershipOrderByWithRelationInput | UserMembershipOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserMemberships.
     */
    cursor?: UserMembershipWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemberships from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemberships.
     */
    skip?: number
    distinct?: UserMembershipScalarFieldEnum | UserMembershipScalarFieldEnum[]
  }

  /**
   * UserMembership create
   */
  export type UserMembershipCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * The data needed to create a UserMembership.
     */
    data: XOR<UserMembershipCreateInput, UserMembershipUncheckedCreateInput>
  }

  /**
   * UserMembership createMany
   */
  export type UserMembershipCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserMemberships.
     */
    data: UserMembershipCreateManyInput | UserMembershipCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserMembership createManyAndReturn
   */
  export type UserMembershipCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserMemberships.
     */
    data: UserMembershipCreateManyInput | UserMembershipCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserMembership update
   */
  export type UserMembershipUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * The data needed to update a UserMembership.
     */
    data: XOR<UserMembershipUpdateInput, UserMembershipUncheckedUpdateInput>
    /**
     * Choose, which UserMembership to update.
     */
    where: UserMembershipWhereUniqueInput
  }

  /**
   * UserMembership updateMany
   */
  export type UserMembershipUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserMemberships.
     */
    data: XOR<UserMembershipUpdateManyMutationInput, UserMembershipUncheckedUpdateManyInput>
    /**
     * Filter which UserMemberships to update
     */
    where?: UserMembershipWhereInput
  }

  /**
   * UserMembership upsert
   */
  export type UserMembershipUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * The filter to search for the UserMembership to update in case it exists.
     */
    where: UserMembershipWhereUniqueInput
    /**
     * In case the UserMembership found by the `where` argument doesn't exist, create a new UserMembership with this data.
     */
    create: XOR<UserMembershipCreateInput, UserMembershipUncheckedCreateInput>
    /**
     * In case the UserMembership was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserMembershipUpdateInput, UserMembershipUncheckedUpdateInput>
  }

  /**
   * UserMembership delete
   */
  export type UserMembershipDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
    /**
     * Filter which UserMembership to delete.
     */
    where: UserMembershipWhereUniqueInput
  }

  /**
   * UserMembership deleteMany
   */
  export type UserMembershipDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMemberships to delete
     */
    where?: UserMembershipWhereInput
  }

  /**
   * UserMembership without action
   */
  export type UserMembershipDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMembership
     */
    select?: UserMembershipSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMembershipInclude<ExtArgs> | null
  }


  /**
   * Model ProductConfig
   */

  export type AggregateProductConfig = {
    _count: ProductConfigCountAggregateOutputType | null
    _min: ProductConfigMinAggregateOutputType | null
    _max: ProductConfigMaxAggregateOutputType | null
  }

  export type ProductConfigMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_key: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProductConfigMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    product_key: string | null
    is_active: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ProductConfigCountAggregateOutputType = {
    id: number
    tenant_id: number
    product_key: number
    config: number
    is_active: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ProductConfigMinAggregateInputType = {
    id?: true
    tenant_id?: true
    product_key?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type ProductConfigMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    product_key?: true
    is_active?: true
    created_at?: true
    updated_at?: true
  }

  export type ProductConfigCountAggregateInputType = {
    id?: true
    tenant_id?: true
    product_key?: true
    config?: true
    is_active?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ProductConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductConfig to aggregate.
     */
    where?: ProductConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductConfigs to fetch.
     */
    orderBy?: ProductConfigOrderByWithRelationInput | ProductConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductConfigs
    **/
    _count?: true | ProductConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductConfigMaxAggregateInputType
  }

  export type GetProductConfigAggregateType<T extends ProductConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateProductConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductConfig[P]>
      : GetScalarType<T[P], AggregateProductConfig[P]>
  }




  export type ProductConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductConfigWhereInput
    orderBy?: ProductConfigOrderByWithAggregationInput | ProductConfigOrderByWithAggregationInput[]
    by: ProductConfigScalarFieldEnum[] | ProductConfigScalarFieldEnum
    having?: ProductConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductConfigCountAggregateInputType | true
    _min?: ProductConfigMinAggregateInputType
    _max?: ProductConfigMaxAggregateInputType
  }

  export type ProductConfigGroupByOutputType = {
    id: string
    tenant_id: string
    product_key: string
    config: JsonValue
    is_active: boolean
    created_at: Date
    updated_at: Date
    _count: ProductConfigCountAggregateOutputType | null
    _min: ProductConfigMinAggregateOutputType | null
    _max: ProductConfigMaxAggregateOutputType | null
  }

  type GetProductConfigGroupByPayload<T extends ProductConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductConfigGroupByOutputType[P]>
            : GetScalarType<T[P], ProductConfigGroupByOutputType[P]>
        }
      >
    >


  export type ProductConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_key?: boolean
    config?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["productConfig"]>

  export type ProductConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    product_key?: boolean
    config?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["productConfig"]>

  export type ProductConfigSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    product_key?: boolean
    config?: boolean
    is_active?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ProductConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type ProductConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $ProductConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductConfig"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      product_key: string
      config: Prisma.JsonValue
      is_active: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["productConfig"]>
    composites: {}
  }

  type ProductConfigGetPayload<S extends boolean | null | undefined | ProductConfigDefaultArgs> = $Result.GetResult<Prisma.$ProductConfigPayload, S>

  type ProductConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductConfigFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductConfigCountAggregateInputType | true
    }

  export interface ProductConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductConfig'], meta: { name: 'ProductConfig' } }
    /**
     * Find zero or one ProductConfig that matches the filter.
     * @param {ProductConfigFindUniqueArgs} args - Arguments to find a ProductConfig
     * @example
     * // Get one ProductConfig
     * const productConfig = await prisma.productConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductConfigFindUniqueArgs>(args: SelectSubset<T, ProductConfigFindUniqueArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductConfig that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductConfigFindUniqueOrThrowArgs} args - Arguments to find a ProductConfig
     * @example
     * // Get one ProductConfig
     * const productConfig = await prisma.productConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigFindFirstArgs} args - Arguments to find a ProductConfig
     * @example
     * // Get one ProductConfig
     * const productConfig = await prisma.productConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductConfigFindFirstArgs>(args?: SelectSubset<T, ProductConfigFindFirstArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigFindFirstOrThrowArgs} args - Arguments to find a ProductConfig
     * @example
     * // Get one ProductConfig
     * const productConfig = await prisma.productConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductConfigs
     * const productConfigs = await prisma.productConfig.findMany()
     * 
     * // Get first 10 ProductConfigs
     * const productConfigs = await prisma.productConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productConfigWithIdOnly = await prisma.productConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductConfigFindManyArgs>(args?: SelectSubset<T, ProductConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductConfig.
     * @param {ProductConfigCreateArgs} args - Arguments to create a ProductConfig.
     * @example
     * // Create one ProductConfig
     * const ProductConfig = await prisma.productConfig.create({
     *   data: {
     *     // ... data to create a ProductConfig
     *   }
     * })
     * 
     */
    create<T extends ProductConfigCreateArgs>(args: SelectSubset<T, ProductConfigCreateArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductConfigs.
     * @param {ProductConfigCreateManyArgs} args - Arguments to create many ProductConfigs.
     * @example
     * // Create many ProductConfigs
     * const productConfig = await prisma.productConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductConfigCreateManyArgs>(args?: SelectSubset<T, ProductConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProductConfigs and returns the data saved in the database.
     * @param {ProductConfigCreateManyAndReturnArgs} args - Arguments to create many ProductConfigs.
     * @example
     * // Create many ProductConfigs
     * const productConfig = await prisma.productConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProductConfigs and only return the `id`
     * const productConfigWithIdOnly = await prisma.productConfig.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ProductConfig.
     * @param {ProductConfigDeleteArgs} args - Arguments to delete one ProductConfig.
     * @example
     * // Delete one ProductConfig
     * const ProductConfig = await prisma.productConfig.delete({
     *   where: {
     *     // ... filter to delete one ProductConfig
     *   }
     * })
     * 
     */
    delete<T extends ProductConfigDeleteArgs>(args: SelectSubset<T, ProductConfigDeleteArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductConfig.
     * @param {ProductConfigUpdateArgs} args - Arguments to update one ProductConfig.
     * @example
     * // Update one ProductConfig
     * const productConfig = await prisma.productConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductConfigUpdateArgs>(args: SelectSubset<T, ProductConfigUpdateArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductConfigs.
     * @param {ProductConfigDeleteManyArgs} args - Arguments to filter ProductConfigs to delete.
     * @example
     * // Delete a few ProductConfigs
     * const { count } = await prisma.productConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductConfigDeleteManyArgs>(args?: SelectSubset<T, ProductConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductConfigs
     * const productConfig = await prisma.productConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductConfigUpdateManyArgs>(args: SelectSubset<T, ProductConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductConfig.
     * @param {ProductConfigUpsertArgs} args - Arguments to update or create a ProductConfig.
     * @example
     * // Update or create a ProductConfig
     * const productConfig = await prisma.productConfig.upsert({
     *   create: {
     *     // ... data to create a ProductConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductConfig we want to update
     *   }
     * })
     */
    upsert<T extends ProductConfigUpsertArgs>(args: SelectSubset<T, ProductConfigUpsertArgs<ExtArgs>>): Prisma__ProductConfigClient<$Result.GetResult<Prisma.$ProductConfigPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigCountArgs} args - Arguments to filter ProductConfigs to count.
     * @example
     * // Count the number of ProductConfigs
     * const count = await prisma.productConfig.count({
     *   where: {
     *     // ... the filter for the ProductConfigs we want to count
     *   }
     * })
    **/
    count<T extends ProductConfigCountArgs>(
      args?: Subset<T, ProductConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductConfigAggregateArgs>(args: Subset<T, ProductConfigAggregateArgs>): Prisma.PrismaPromise<GetProductConfigAggregateType<T>>

    /**
     * Group by ProductConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductConfigGroupByArgs} args - Group by arguments.
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
      T extends ProductConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductConfigGroupByArgs['orderBy'] }
        : { orderBy?: ProductConfigGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductConfig model
   */
  readonly fields: ProductConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the ProductConfig model
   */ 
  interface ProductConfigFieldRefs {
    readonly id: FieldRef<"ProductConfig", 'String'>
    readonly tenant_id: FieldRef<"ProductConfig", 'String'>
    readonly product_key: FieldRef<"ProductConfig", 'String'>
    readonly config: FieldRef<"ProductConfig", 'Json'>
    readonly is_active: FieldRef<"ProductConfig", 'Boolean'>
    readonly created_at: FieldRef<"ProductConfig", 'DateTime'>
    readonly updated_at: FieldRef<"ProductConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductConfig findUnique
   */
  export type ProductConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter, which ProductConfig to fetch.
     */
    where: ProductConfigWhereUniqueInput
  }

  /**
   * ProductConfig findUniqueOrThrow
   */
  export type ProductConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter, which ProductConfig to fetch.
     */
    where: ProductConfigWhereUniqueInput
  }

  /**
   * ProductConfig findFirst
   */
  export type ProductConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter, which ProductConfig to fetch.
     */
    where?: ProductConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductConfigs to fetch.
     */
    orderBy?: ProductConfigOrderByWithRelationInput | ProductConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductConfigs.
     */
    cursor?: ProductConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductConfigs.
     */
    distinct?: ProductConfigScalarFieldEnum | ProductConfigScalarFieldEnum[]
  }

  /**
   * ProductConfig findFirstOrThrow
   */
  export type ProductConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter, which ProductConfig to fetch.
     */
    where?: ProductConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductConfigs to fetch.
     */
    orderBy?: ProductConfigOrderByWithRelationInput | ProductConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductConfigs.
     */
    cursor?: ProductConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductConfigs.
     */
    distinct?: ProductConfigScalarFieldEnum | ProductConfigScalarFieldEnum[]
  }

  /**
   * ProductConfig findMany
   */
  export type ProductConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter, which ProductConfigs to fetch.
     */
    where?: ProductConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductConfigs to fetch.
     */
    orderBy?: ProductConfigOrderByWithRelationInput | ProductConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductConfigs.
     */
    cursor?: ProductConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductConfigs.
     */
    skip?: number
    distinct?: ProductConfigScalarFieldEnum | ProductConfigScalarFieldEnum[]
  }

  /**
   * ProductConfig create
   */
  export type ProductConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a ProductConfig.
     */
    data: XOR<ProductConfigCreateInput, ProductConfigUncheckedCreateInput>
  }

  /**
   * ProductConfig createMany
   */
  export type ProductConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductConfigs.
     */
    data: ProductConfigCreateManyInput | ProductConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductConfig createManyAndReturn
   */
  export type ProductConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ProductConfigs.
     */
    data: ProductConfigCreateManyInput | ProductConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProductConfig update
   */
  export type ProductConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a ProductConfig.
     */
    data: XOR<ProductConfigUpdateInput, ProductConfigUncheckedUpdateInput>
    /**
     * Choose, which ProductConfig to update.
     */
    where: ProductConfigWhereUniqueInput
  }

  /**
   * ProductConfig updateMany
   */
  export type ProductConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductConfigs.
     */
    data: XOR<ProductConfigUpdateManyMutationInput, ProductConfigUncheckedUpdateManyInput>
    /**
     * Filter which ProductConfigs to update
     */
    where?: ProductConfigWhereInput
  }

  /**
   * ProductConfig upsert
   */
  export type ProductConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the ProductConfig to update in case it exists.
     */
    where: ProductConfigWhereUniqueInput
    /**
     * In case the ProductConfig found by the `where` argument doesn't exist, create a new ProductConfig with this data.
     */
    create: XOR<ProductConfigCreateInput, ProductConfigUncheckedCreateInput>
    /**
     * In case the ProductConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductConfigUpdateInput, ProductConfigUncheckedUpdateInput>
  }

  /**
   * ProductConfig delete
   */
  export type ProductConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
    /**
     * Filter which ProductConfig to delete.
     */
    where: ProductConfigWhereUniqueInput
  }

  /**
   * ProductConfig deleteMany
   */
  export type ProductConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductConfigs to delete
     */
    where?: ProductConfigWhereInput
  }

  /**
   * ProductConfig without action
   */
  export type ProductConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductConfig
     */
    select?: ProductConfigSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductConfigInclude<ExtArgs> | null
  }


  /**
   * Model StripeEvent
   */

  export type AggregateStripeEvent = {
    _count: StripeEventCountAggregateOutputType | null
    _min: StripeEventMinAggregateOutputType | null
    _max: StripeEventMaxAggregateOutputType | null
  }

  export type StripeEventMinAggregateOutputType = {
    id: string | null
    type: string | null
    processed_at: Date | null
  }

  export type StripeEventMaxAggregateOutputType = {
    id: string | null
    type: string | null
    processed_at: Date | null
  }

  export type StripeEventCountAggregateOutputType = {
    id: number
    type: number
    processed_at: number
    payload: number
    _all: number
  }


  export type StripeEventMinAggregateInputType = {
    id?: true
    type?: true
    processed_at?: true
  }

  export type StripeEventMaxAggregateInputType = {
    id?: true
    type?: true
    processed_at?: true
  }

  export type StripeEventCountAggregateInputType = {
    id?: true
    type?: true
    processed_at?: true
    payload?: true
    _all?: true
  }

  export type StripeEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeEvent to aggregate.
     */
    where?: StripeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeEvents to fetch.
     */
    orderBy?: StripeEventOrderByWithRelationInput | StripeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StripeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StripeEvents
    **/
    _count?: true | StripeEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StripeEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StripeEventMaxAggregateInputType
  }

  export type GetStripeEventAggregateType<T extends StripeEventAggregateArgs> = {
        [P in keyof T & keyof AggregateStripeEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStripeEvent[P]>
      : GetScalarType<T[P], AggregateStripeEvent[P]>
  }




  export type StripeEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StripeEventWhereInput
    orderBy?: StripeEventOrderByWithAggregationInput | StripeEventOrderByWithAggregationInput[]
    by: StripeEventScalarFieldEnum[] | StripeEventScalarFieldEnum
    having?: StripeEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StripeEventCountAggregateInputType | true
    _min?: StripeEventMinAggregateInputType
    _max?: StripeEventMaxAggregateInputType
  }

  export type StripeEventGroupByOutputType = {
    id: string
    type: string
    processed_at: Date
    payload: JsonValue
    _count: StripeEventCountAggregateOutputType | null
    _min: StripeEventMinAggregateOutputType | null
    _max: StripeEventMaxAggregateOutputType | null
  }

  type GetStripeEventGroupByPayload<T extends StripeEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StripeEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StripeEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StripeEventGroupByOutputType[P]>
            : GetScalarType<T[P], StripeEventGroupByOutputType[P]>
        }
      >
    >


  export type StripeEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    processed_at?: boolean
    payload?: boolean
  }, ExtArgs["result"]["stripeEvent"]>

  export type StripeEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    processed_at?: boolean
    payload?: boolean
  }, ExtArgs["result"]["stripeEvent"]>

  export type StripeEventSelectScalar = {
    id?: boolean
    type?: boolean
    processed_at?: boolean
    payload?: boolean
  }


  export type $StripeEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StripeEvent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: string
      processed_at: Date
      payload: Prisma.JsonValue
    }, ExtArgs["result"]["stripeEvent"]>
    composites: {}
  }

  type StripeEventGetPayload<S extends boolean | null | undefined | StripeEventDefaultArgs> = $Result.GetResult<Prisma.$StripeEventPayload, S>

  type StripeEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StripeEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StripeEventCountAggregateInputType | true
    }

  export interface StripeEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StripeEvent'], meta: { name: 'StripeEvent' } }
    /**
     * Find zero or one StripeEvent that matches the filter.
     * @param {StripeEventFindUniqueArgs} args - Arguments to find a StripeEvent
     * @example
     * // Get one StripeEvent
     * const stripeEvent = await prisma.stripeEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StripeEventFindUniqueArgs>(args: SelectSubset<T, StripeEventFindUniqueArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one StripeEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StripeEventFindUniqueOrThrowArgs} args - Arguments to find a StripeEvent
     * @example
     * // Get one StripeEvent
     * const stripeEvent = await prisma.stripeEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StripeEventFindUniqueOrThrowArgs>(args: SelectSubset<T, StripeEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first StripeEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventFindFirstArgs} args - Arguments to find a StripeEvent
     * @example
     * // Get one StripeEvent
     * const stripeEvent = await prisma.stripeEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StripeEventFindFirstArgs>(args?: SelectSubset<T, StripeEventFindFirstArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first StripeEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventFindFirstOrThrowArgs} args - Arguments to find a StripeEvent
     * @example
     * // Get one StripeEvent
     * const stripeEvent = await prisma.stripeEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StripeEventFindFirstOrThrowArgs>(args?: SelectSubset<T, StripeEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more StripeEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StripeEvents
     * const stripeEvents = await prisma.stripeEvent.findMany()
     * 
     * // Get first 10 StripeEvents
     * const stripeEvents = await prisma.stripeEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stripeEventWithIdOnly = await prisma.stripeEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StripeEventFindManyArgs>(args?: SelectSubset<T, StripeEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a StripeEvent.
     * @param {StripeEventCreateArgs} args - Arguments to create a StripeEvent.
     * @example
     * // Create one StripeEvent
     * const StripeEvent = await prisma.stripeEvent.create({
     *   data: {
     *     // ... data to create a StripeEvent
     *   }
     * })
     * 
     */
    create<T extends StripeEventCreateArgs>(args: SelectSubset<T, StripeEventCreateArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many StripeEvents.
     * @param {StripeEventCreateManyArgs} args - Arguments to create many StripeEvents.
     * @example
     * // Create many StripeEvents
     * const stripeEvent = await prisma.stripeEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StripeEventCreateManyArgs>(args?: SelectSubset<T, StripeEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StripeEvents and returns the data saved in the database.
     * @param {StripeEventCreateManyAndReturnArgs} args - Arguments to create many StripeEvents.
     * @example
     * // Create many StripeEvents
     * const stripeEvent = await prisma.stripeEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StripeEvents and only return the `id`
     * const stripeEventWithIdOnly = await prisma.stripeEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StripeEventCreateManyAndReturnArgs>(args?: SelectSubset<T, StripeEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a StripeEvent.
     * @param {StripeEventDeleteArgs} args - Arguments to delete one StripeEvent.
     * @example
     * // Delete one StripeEvent
     * const StripeEvent = await prisma.stripeEvent.delete({
     *   where: {
     *     // ... filter to delete one StripeEvent
     *   }
     * })
     * 
     */
    delete<T extends StripeEventDeleteArgs>(args: SelectSubset<T, StripeEventDeleteArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one StripeEvent.
     * @param {StripeEventUpdateArgs} args - Arguments to update one StripeEvent.
     * @example
     * // Update one StripeEvent
     * const stripeEvent = await prisma.stripeEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StripeEventUpdateArgs>(args: SelectSubset<T, StripeEventUpdateArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more StripeEvents.
     * @param {StripeEventDeleteManyArgs} args - Arguments to filter StripeEvents to delete.
     * @example
     * // Delete a few StripeEvents
     * const { count } = await prisma.stripeEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StripeEventDeleteManyArgs>(args?: SelectSubset<T, StripeEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripeEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StripeEvents
     * const stripeEvent = await prisma.stripeEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StripeEventUpdateManyArgs>(args: SelectSubset<T, StripeEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one StripeEvent.
     * @param {StripeEventUpsertArgs} args - Arguments to update or create a StripeEvent.
     * @example
     * // Update or create a StripeEvent
     * const stripeEvent = await prisma.stripeEvent.upsert({
     *   create: {
     *     // ... data to create a StripeEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StripeEvent we want to update
     *   }
     * })
     */
    upsert<T extends StripeEventUpsertArgs>(args: SelectSubset<T, StripeEventUpsertArgs<ExtArgs>>): Prisma__StripeEventClient<$Result.GetResult<Prisma.$StripeEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of StripeEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventCountArgs} args - Arguments to filter StripeEvents to count.
     * @example
     * // Count the number of StripeEvents
     * const count = await prisma.stripeEvent.count({
     *   where: {
     *     // ... the filter for the StripeEvents we want to count
     *   }
     * })
    **/
    count<T extends StripeEventCountArgs>(
      args?: Subset<T, StripeEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StripeEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StripeEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StripeEventAggregateArgs>(args: Subset<T, StripeEventAggregateArgs>): Prisma.PrismaPromise<GetStripeEventAggregateType<T>>

    /**
     * Group by StripeEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripeEventGroupByArgs} args - Group by arguments.
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
      T extends StripeEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StripeEventGroupByArgs['orderBy'] }
        : { orderBy?: StripeEventGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StripeEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStripeEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StripeEvent model
   */
  readonly fields: StripeEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StripeEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StripeEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StripeEvent model
   */ 
  interface StripeEventFieldRefs {
    readonly id: FieldRef<"StripeEvent", 'String'>
    readonly type: FieldRef<"StripeEvent", 'String'>
    readonly processed_at: FieldRef<"StripeEvent", 'DateTime'>
    readonly payload: FieldRef<"StripeEvent", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * StripeEvent findUnique
   */
  export type StripeEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter, which StripeEvent to fetch.
     */
    where: StripeEventWhereUniqueInput
  }

  /**
   * StripeEvent findUniqueOrThrow
   */
  export type StripeEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter, which StripeEvent to fetch.
     */
    where: StripeEventWhereUniqueInput
  }

  /**
   * StripeEvent findFirst
   */
  export type StripeEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter, which StripeEvent to fetch.
     */
    where?: StripeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeEvents to fetch.
     */
    orderBy?: StripeEventOrderByWithRelationInput | StripeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeEvents.
     */
    cursor?: StripeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeEvents.
     */
    distinct?: StripeEventScalarFieldEnum | StripeEventScalarFieldEnum[]
  }

  /**
   * StripeEvent findFirstOrThrow
   */
  export type StripeEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter, which StripeEvent to fetch.
     */
    where?: StripeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeEvents to fetch.
     */
    orderBy?: StripeEventOrderByWithRelationInput | StripeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripeEvents.
     */
    cursor?: StripeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripeEvents.
     */
    distinct?: StripeEventScalarFieldEnum | StripeEventScalarFieldEnum[]
  }

  /**
   * StripeEvent findMany
   */
  export type StripeEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter, which StripeEvents to fetch.
     */
    where?: StripeEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripeEvents to fetch.
     */
    orderBy?: StripeEventOrderByWithRelationInput | StripeEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StripeEvents.
     */
    cursor?: StripeEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripeEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripeEvents.
     */
    skip?: number
    distinct?: StripeEventScalarFieldEnum | StripeEventScalarFieldEnum[]
  }

  /**
   * StripeEvent create
   */
  export type StripeEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * The data needed to create a StripeEvent.
     */
    data: XOR<StripeEventCreateInput, StripeEventUncheckedCreateInput>
  }

  /**
   * StripeEvent createMany
   */
  export type StripeEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StripeEvents.
     */
    data: StripeEventCreateManyInput | StripeEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeEvent createManyAndReturn
   */
  export type StripeEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many StripeEvents.
     */
    data: StripeEventCreateManyInput | StripeEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripeEvent update
   */
  export type StripeEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * The data needed to update a StripeEvent.
     */
    data: XOR<StripeEventUpdateInput, StripeEventUncheckedUpdateInput>
    /**
     * Choose, which StripeEvent to update.
     */
    where: StripeEventWhereUniqueInput
  }

  /**
   * StripeEvent updateMany
   */
  export type StripeEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StripeEvents.
     */
    data: XOR<StripeEventUpdateManyMutationInput, StripeEventUncheckedUpdateManyInput>
    /**
     * Filter which StripeEvents to update
     */
    where?: StripeEventWhereInput
  }

  /**
   * StripeEvent upsert
   */
  export type StripeEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * The filter to search for the StripeEvent to update in case it exists.
     */
    where: StripeEventWhereUniqueInput
    /**
     * In case the StripeEvent found by the `where` argument doesn't exist, create a new StripeEvent with this data.
     */
    create: XOR<StripeEventCreateInput, StripeEventUncheckedCreateInput>
    /**
     * In case the StripeEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StripeEventUpdateInput, StripeEventUncheckedUpdateInput>
  }

  /**
   * StripeEvent delete
   */
  export type StripeEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
    /**
     * Filter which StripeEvent to delete.
     */
    where: StripeEventWhereUniqueInput
  }

  /**
   * StripeEvent deleteMany
   */
  export type StripeEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripeEvents to delete
     */
    where?: StripeEventWhereInput
  }

  /**
   * StripeEvent without action
   */
  export type StripeEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripeEvent
     */
    select?: StripeEventSelect<ExtArgs> | null
  }


  /**
   * Model SupplierTenantAccess
   */

  export type AggregateSupplierTenantAccess = {
    _count: SupplierTenantAccessCountAggregateOutputType | null
    _min: SupplierTenantAccessMinAggregateOutputType | null
    _max: SupplierTenantAccessMaxAggregateOutputType | null
  }

  export type SupplierTenantAccessMinAggregateOutputType = {
    id: string | null
    clerk_user_id: string | null
    tenant_id: string | null
    status: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SupplierTenantAccessMaxAggregateOutputType = {
    id: string | null
    clerk_user_id: string | null
    tenant_id: string | null
    status: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SupplierTenantAccessCountAggregateOutputType = {
    id: number
    clerk_user_id: number
    tenant_id: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type SupplierTenantAccessMinAggregateInputType = {
    id?: true
    clerk_user_id?: true
    tenant_id?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type SupplierTenantAccessMaxAggregateInputType = {
    id?: true
    clerk_user_id?: true
    tenant_id?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type SupplierTenantAccessCountAggregateInputType = {
    id?: true
    clerk_user_id?: true
    tenant_id?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type SupplierTenantAccessAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SupplierTenantAccess to aggregate.
     */
    where?: SupplierTenantAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupplierTenantAccesses to fetch.
     */
    orderBy?: SupplierTenantAccessOrderByWithRelationInput | SupplierTenantAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SupplierTenantAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupplierTenantAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupplierTenantAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SupplierTenantAccesses
    **/
    _count?: true | SupplierTenantAccessCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SupplierTenantAccessMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SupplierTenantAccessMaxAggregateInputType
  }

  export type GetSupplierTenantAccessAggregateType<T extends SupplierTenantAccessAggregateArgs> = {
        [P in keyof T & keyof AggregateSupplierTenantAccess]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSupplierTenantAccess[P]>
      : GetScalarType<T[P], AggregateSupplierTenantAccess[P]>
  }




  export type SupplierTenantAccessGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SupplierTenantAccessWhereInput
    orderBy?: SupplierTenantAccessOrderByWithAggregationInput | SupplierTenantAccessOrderByWithAggregationInput[]
    by: SupplierTenantAccessScalarFieldEnum[] | SupplierTenantAccessScalarFieldEnum
    having?: SupplierTenantAccessScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SupplierTenantAccessCountAggregateInputType | true
    _min?: SupplierTenantAccessMinAggregateInputType
    _max?: SupplierTenantAccessMaxAggregateInputType
  }

  export type SupplierTenantAccessGroupByOutputType = {
    id: string
    clerk_user_id: string
    tenant_id: string
    status: string
    created_at: Date
    updated_at: Date
    _count: SupplierTenantAccessCountAggregateOutputType | null
    _min: SupplierTenantAccessMinAggregateOutputType | null
    _max: SupplierTenantAccessMaxAggregateOutputType | null
  }

  type GetSupplierTenantAccessGroupByPayload<T extends SupplierTenantAccessGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SupplierTenantAccessGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SupplierTenantAccessGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SupplierTenantAccessGroupByOutputType[P]>
            : GetScalarType<T[P], SupplierTenantAccessGroupByOutputType[P]>
        }
      >
    >


  export type SupplierTenantAccessSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerk_user_id?: boolean
    tenant_id?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["supplierTenantAccess"]>

  export type SupplierTenantAccessSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clerk_user_id?: boolean
    tenant_id?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["supplierTenantAccess"]>

  export type SupplierTenantAccessSelectScalar = {
    id?: boolean
    clerk_user_id?: boolean
    tenant_id?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }


  export type $SupplierTenantAccessPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SupplierTenantAccess"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clerk_user_id: string
      tenant_id: string
      status: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["supplierTenantAccess"]>
    composites: {}
  }

  type SupplierTenantAccessGetPayload<S extends boolean | null | undefined | SupplierTenantAccessDefaultArgs> = $Result.GetResult<Prisma.$SupplierTenantAccessPayload, S>

  type SupplierTenantAccessCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SupplierTenantAccessFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SupplierTenantAccessCountAggregateInputType | true
    }

  export interface SupplierTenantAccessDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SupplierTenantAccess'], meta: { name: 'SupplierTenantAccess' } }
    /**
     * Find zero or one SupplierTenantAccess that matches the filter.
     * @param {SupplierTenantAccessFindUniqueArgs} args - Arguments to find a SupplierTenantAccess
     * @example
     * // Get one SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SupplierTenantAccessFindUniqueArgs>(args: SelectSubset<T, SupplierTenantAccessFindUniqueArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SupplierTenantAccess that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SupplierTenantAccessFindUniqueOrThrowArgs} args - Arguments to find a SupplierTenantAccess
     * @example
     * // Get one SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SupplierTenantAccessFindUniqueOrThrowArgs>(args: SelectSubset<T, SupplierTenantAccessFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SupplierTenantAccess that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessFindFirstArgs} args - Arguments to find a SupplierTenantAccess
     * @example
     * // Get one SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SupplierTenantAccessFindFirstArgs>(args?: SelectSubset<T, SupplierTenantAccessFindFirstArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SupplierTenantAccess that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessFindFirstOrThrowArgs} args - Arguments to find a SupplierTenantAccess
     * @example
     * // Get one SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SupplierTenantAccessFindFirstOrThrowArgs>(args?: SelectSubset<T, SupplierTenantAccessFindFirstOrThrowArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SupplierTenantAccesses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SupplierTenantAccesses
     * const supplierTenantAccesses = await prisma.supplierTenantAccess.findMany()
     * 
     * // Get first 10 SupplierTenantAccesses
     * const supplierTenantAccesses = await prisma.supplierTenantAccess.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const supplierTenantAccessWithIdOnly = await prisma.supplierTenantAccess.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SupplierTenantAccessFindManyArgs>(args?: SelectSubset<T, SupplierTenantAccessFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SupplierTenantAccess.
     * @param {SupplierTenantAccessCreateArgs} args - Arguments to create a SupplierTenantAccess.
     * @example
     * // Create one SupplierTenantAccess
     * const SupplierTenantAccess = await prisma.supplierTenantAccess.create({
     *   data: {
     *     // ... data to create a SupplierTenantAccess
     *   }
     * })
     * 
     */
    create<T extends SupplierTenantAccessCreateArgs>(args: SelectSubset<T, SupplierTenantAccessCreateArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SupplierTenantAccesses.
     * @param {SupplierTenantAccessCreateManyArgs} args - Arguments to create many SupplierTenantAccesses.
     * @example
     * // Create many SupplierTenantAccesses
     * const supplierTenantAccess = await prisma.supplierTenantAccess.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SupplierTenantAccessCreateManyArgs>(args?: SelectSubset<T, SupplierTenantAccessCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SupplierTenantAccesses and returns the data saved in the database.
     * @param {SupplierTenantAccessCreateManyAndReturnArgs} args - Arguments to create many SupplierTenantAccesses.
     * @example
     * // Create many SupplierTenantAccesses
     * const supplierTenantAccess = await prisma.supplierTenantAccess.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SupplierTenantAccesses and only return the `id`
     * const supplierTenantAccessWithIdOnly = await prisma.supplierTenantAccess.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SupplierTenantAccessCreateManyAndReturnArgs>(args?: SelectSubset<T, SupplierTenantAccessCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SupplierTenantAccess.
     * @param {SupplierTenantAccessDeleteArgs} args - Arguments to delete one SupplierTenantAccess.
     * @example
     * // Delete one SupplierTenantAccess
     * const SupplierTenantAccess = await prisma.supplierTenantAccess.delete({
     *   where: {
     *     // ... filter to delete one SupplierTenantAccess
     *   }
     * })
     * 
     */
    delete<T extends SupplierTenantAccessDeleteArgs>(args: SelectSubset<T, SupplierTenantAccessDeleteArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SupplierTenantAccess.
     * @param {SupplierTenantAccessUpdateArgs} args - Arguments to update one SupplierTenantAccess.
     * @example
     * // Update one SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SupplierTenantAccessUpdateArgs>(args: SelectSubset<T, SupplierTenantAccessUpdateArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SupplierTenantAccesses.
     * @param {SupplierTenantAccessDeleteManyArgs} args - Arguments to filter SupplierTenantAccesses to delete.
     * @example
     * // Delete a few SupplierTenantAccesses
     * const { count } = await prisma.supplierTenantAccess.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SupplierTenantAccessDeleteManyArgs>(args?: SelectSubset<T, SupplierTenantAccessDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SupplierTenantAccesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SupplierTenantAccesses
     * const supplierTenantAccess = await prisma.supplierTenantAccess.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SupplierTenantAccessUpdateManyArgs>(args: SelectSubset<T, SupplierTenantAccessUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SupplierTenantAccess.
     * @param {SupplierTenantAccessUpsertArgs} args - Arguments to update or create a SupplierTenantAccess.
     * @example
     * // Update or create a SupplierTenantAccess
     * const supplierTenantAccess = await prisma.supplierTenantAccess.upsert({
     *   create: {
     *     // ... data to create a SupplierTenantAccess
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SupplierTenantAccess we want to update
     *   }
     * })
     */
    upsert<T extends SupplierTenantAccessUpsertArgs>(args: SelectSubset<T, SupplierTenantAccessUpsertArgs<ExtArgs>>): Prisma__SupplierTenantAccessClient<$Result.GetResult<Prisma.$SupplierTenantAccessPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SupplierTenantAccesses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessCountArgs} args - Arguments to filter SupplierTenantAccesses to count.
     * @example
     * // Count the number of SupplierTenantAccesses
     * const count = await prisma.supplierTenantAccess.count({
     *   where: {
     *     // ... the filter for the SupplierTenantAccesses we want to count
     *   }
     * })
    **/
    count<T extends SupplierTenantAccessCountArgs>(
      args?: Subset<T, SupplierTenantAccessCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SupplierTenantAccessCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SupplierTenantAccess.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends SupplierTenantAccessAggregateArgs>(args: Subset<T, SupplierTenantAccessAggregateArgs>): Prisma.PrismaPromise<GetSupplierTenantAccessAggregateType<T>>

    /**
     * Group by SupplierTenantAccess.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupplierTenantAccessGroupByArgs} args - Group by arguments.
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
      T extends SupplierTenantAccessGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SupplierTenantAccessGroupByArgs['orderBy'] }
        : { orderBy?: SupplierTenantAccessGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, SupplierTenantAccessGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSupplierTenantAccessGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SupplierTenantAccess model
   */
  readonly fields: SupplierTenantAccessFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SupplierTenantAccess.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SupplierTenantAccessClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the SupplierTenantAccess model
   */ 
  interface SupplierTenantAccessFieldRefs {
    readonly id: FieldRef<"SupplierTenantAccess", 'String'>
    readonly clerk_user_id: FieldRef<"SupplierTenantAccess", 'String'>
    readonly tenant_id: FieldRef<"SupplierTenantAccess", 'String'>
    readonly status: FieldRef<"SupplierTenantAccess", 'String'>
    readonly created_at: FieldRef<"SupplierTenantAccess", 'DateTime'>
    readonly updated_at: FieldRef<"SupplierTenantAccess", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SupplierTenantAccess findUnique
   */
  export type SupplierTenantAccessFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter, which SupplierTenantAccess to fetch.
     */
    where: SupplierTenantAccessWhereUniqueInput
  }

  /**
   * SupplierTenantAccess findUniqueOrThrow
   */
  export type SupplierTenantAccessFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter, which SupplierTenantAccess to fetch.
     */
    where: SupplierTenantAccessWhereUniqueInput
  }

  /**
   * SupplierTenantAccess findFirst
   */
  export type SupplierTenantAccessFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter, which SupplierTenantAccess to fetch.
     */
    where?: SupplierTenantAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupplierTenantAccesses to fetch.
     */
    orderBy?: SupplierTenantAccessOrderByWithRelationInput | SupplierTenantAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SupplierTenantAccesses.
     */
    cursor?: SupplierTenantAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupplierTenantAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupplierTenantAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SupplierTenantAccesses.
     */
    distinct?: SupplierTenantAccessScalarFieldEnum | SupplierTenantAccessScalarFieldEnum[]
  }

  /**
   * SupplierTenantAccess findFirstOrThrow
   */
  export type SupplierTenantAccessFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter, which SupplierTenantAccess to fetch.
     */
    where?: SupplierTenantAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupplierTenantAccesses to fetch.
     */
    orderBy?: SupplierTenantAccessOrderByWithRelationInput | SupplierTenantAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SupplierTenantAccesses.
     */
    cursor?: SupplierTenantAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupplierTenantAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupplierTenantAccesses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SupplierTenantAccesses.
     */
    distinct?: SupplierTenantAccessScalarFieldEnum | SupplierTenantAccessScalarFieldEnum[]
  }

  /**
   * SupplierTenantAccess findMany
   */
  export type SupplierTenantAccessFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter, which SupplierTenantAccesses to fetch.
     */
    where?: SupplierTenantAccessWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupplierTenantAccesses to fetch.
     */
    orderBy?: SupplierTenantAccessOrderByWithRelationInput | SupplierTenantAccessOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SupplierTenantAccesses.
     */
    cursor?: SupplierTenantAccessWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupplierTenantAccesses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupplierTenantAccesses.
     */
    skip?: number
    distinct?: SupplierTenantAccessScalarFieldEnum | SupplierTenantAccessScalarFieldEnum[]
  }

  /**
   * SupplierTenantAccess create
   */
  export type SupplierTenantAccessCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * The data needed to create a SupplierTenantAccess.
     */
    data: XOR<SupplierTenantAccessCreateInput, SupplierTenantAccessUncheckedCreateInput>
  }

  /**
   * SupplierTenantAccess createMany
   */
  export type SupplierTenantAccessCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SupplierTenantAccesses.
     */
    data: SupplierTenantAccessCreateManyInput | SupplierTenantAccessCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SupplierTenantAccess createManyAndReturn
   */
  export type SupplierTenantAccessCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SupplierTenantAccesses.
     */
    data: SupplierTenantAccessCreateManyInput | SupplierTenantAccessCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SupplierTenantAccess update
   */
  export type SupplierTenantAccessUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * The data needed to update a SupplierTenantAccess.
     */
    data: XOR<SupplierTenantAccessUpdateInput, SupplierTenantAccessUncheckedUpdateInput>
    /**
     * Choose, which SupplierTenantAccess to update.
     */
    where: SupplierTenantAccessWhereUniqueInput
  }

  /**
   * SupplierTenantAccess updateMany
   */
  export type SupplierTenantAccessUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SupplierTenantAccesses.
     */
    data: XOR<SupplierTenantAccessUpdateManyMutationInput, SupplierTenantAccessUncheckedUpdateManyInput>
    /**
     * Filter which SupplierTenantAccesses to update
     */
    where?: SupplierTenantAccessWhereInput
  }

  /**
   * SupplierTenantAccess upsert
   */
  export type SupplierTenantAccessUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * The filter to search for the SupplierTenantAccess to update in case it exists.
     */
    where: SupplierTenantAccessWhereUniqueInput
    /**
     * In case the SupplierTenantAccess found by the `where` argument doesn't exist, create a new SupplierTenantAccess with this data.
     */
    create: XOR<SupplierTenantAccessCreateInput, SupplierTenantAccessUncheckedCreateInput>
    /**
     * In case the SupplierTenantAccess was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SupplierTenantAccessUpdateInput, SupplierTenantAccessUncheckedUpdateInput>
  }

  /**
   * SupplierTenantAccess delete
   */
  export type SupplierTenantAccessDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
    /**
     * Filter which SupplierTenantAccess to delete.
     */
    where: SupplierTenantAccessWhereUniqueInput
  }

  /**
   * SupplierTenantAccess deleteMany
   */
  export type SupplierTenantAccessDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SupplierTenantAccesses to delete
     */
    where?: SupplierTenantAccessWhereInput
  }

  /**
   * SupplierTenantAccess without action
   */
  export type SupplierTenantAccessDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupplierTenantAccess
     */
    select?: SupplierTenantAccessSelect<ExtArgs> | null
  }


  /**
   * Model ServiceToken
   */

  export type AggregateServiceToken = {
    _count: ServiceTokenCountAggregateOutputType | null
    _min: ServiceTokenMinAggregateOutputType | null
    _max: ServiceTokenMaxAggregateOutputType | null
  }

  export type ServiceTokenMinAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    token_hash: string | null
    scope: $Enums.ServiceTokenScope | null
    expires_at: Date | null
    revoked: boolean | null
    created_at: Date | null
  }

  export type ServiceTokenMaxAggregateOutputType = {
    id: string | null
    tenant_id: string | null
    user_id: string | null
    token_hash: string | null
    scope: $Enums.ServiceTokenScope | null
    expires_at: Date | null
    revoked: boolean | null
    created_at: Date | null
  }

  export type ServiceTokenCountAggregateOutputType = {
    id: number
    tenant_id: number
    user_id: number
    token_hash: number
    scope: number
    expires_at: number
    revoked: number
    created_at: number
    _all: number
  }


  export type ServiceTokenMinAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    token_hash?: true
    scope?: true
    expires_at?: true
    revoked?: true
    created_at?: true
  }

  export type ServiceTokenMaxAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    token_hash?: true
    scope?: true
    expires_at?: true
    revoked?: true
    created_at?: true
  }

  export type ServiceTokenCountAggregateInputType = {
    id?: true
    tenant_id?: true
    user_id?: true
    token_hash?: true
    scope?: true
    expires_at?: true
    revoked?: true
    created_at?: true
    _all?: true
  }

  export type ServiceTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceToken to aggregate.
     */
    where?: ServiceTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceTokens to fetch.
     */
    orderBy?: ServiceTokenOrderByWithRelationInput | ServiceTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServiceTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ServiceTokens
    **/
    _count?: true | ServiceTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServiceTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServiceTokenMaxAggregateInputType
  }

  export type GetServiceTokenAggregateType<T extends ServiceTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateServiceToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServiceToken[P]>
      : GetScalarType<T[P], AggregateServiceToken[P]>
  }




  export type ServiceTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServiceTokenWhereInput
    orderBy?: ServiceTokenOrderByWithAggregationInput | ServiceTokenOrderByWithAggregationInput[]
    by: ServiceTokenScalarFieldEnum[] | ServiceTokenScalarFieldEnum
    having?: ServiceTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServiceTokenCountAggregateInputType | true
    _min?: ServiceTokenMinAggregateInputType
    _max?: ServiceTokenMaxAggregateInputType
  }

  export type ServiceTokenGroupByOutputType = {
    id: string
    tenant_id: string
    user_id: string
    token_hash: string
    scope: $Enums.ServiceTokenScope
    expires_at: Date | null
    revoked: boolean
    created_at: Date
    _count: ServiceTokenCountAggregateOutputType | null
    _min: ServiceTokenMinAggregateOutputType | null
    _max: ServiceTokenMaxAggregateOutputType | null
  }

  type GetServiceTokenGroupByPayload<T extends ServiceTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServiceTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServiceTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServiceTokenGroupByOutputType[P]>
            : GetScalarType<T[P], ServiceTokenGroupByOutputType[P]>
        }
      >
    >


  export type ServiceTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    token_hash?: boolean
    scope?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["serviceToken"]>

  export type ServiceTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    token_hash?: boolean
    scope?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["serviceToken"]>

  export type ServiceTokenSelectScalar = {
    id?: boolean
    tenant_id?: boolean
    user_id?: boolean
    token_hash?: boolean
    scope?: boolean
    expires_at?: boolean
    revoked?: boolean
    created_at?: boolean
  }


  export type $ServiceTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ServiceToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenant_id: string
      user_id: string
      token_hash: string
      scope: $Enums.ServiceTokenScope
      expires_at: Date | null
      revoked: boolean
      created_at: Date
    }, ExtArgs["result"]["serviceToken"]>
    composites: {}
  }

  type ServiceTokenGetPayload<S extends boolean | null | undefined | ServiceTokenDefaultArgs> = $Result.GetResult<Prisma.$ServiceTokenPayload, S>

  type ServiceTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ServiceTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ServiceTokenCountAggregateInputType | true
    }

  export interface ServiceTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ServiceToken'], meta: { name: 'ServiceToken' } }
    /**
     * Find zero or one ServiceToken that matches the filter.
     * @param {ServiceTokenFindUniqueArgs} args - Arguments to find a ServiceToken
     * @example
     * // Get one ServiceToken
     * const serviceToken = await prisma.serviceToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServiceTokenFindUniqueArgs>(args: SelectSubset<T, ServiceTokenFindUniqueArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ServiceToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ServiceTokenFindUniqueOrThrowArgs} args - Arguments to find a ServiceToken
     * @example
     * // Get one ServiceToken
     * const serviceToken = await prisma.serviceToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServiceTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, ServiceTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ServiceToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenFindFirstArgs} args - Arguments to find a ServiceToken
     * @example
     * // Get one ServiceToken
     * const serviceToken = await prisma.serviceToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServiceTokenFindFirstArgs>(args?: SelectSubset<T, ServiceTokenFindFirstArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ServiceToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenFindFirstOrThrowArgs} args - Arguments to find a ServiceToken
     * @example
     * // Get one ServiceToken
     * const serviceToken = await prisma.serviceToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServiceTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, ServiceTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ServiceTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServiceTokens
     * const serviceTokens = await prisma.serviceToken.findMany()
     * 
     * // Get first 10 ServiceTokens
     * const serviceTokens = await prisma.serviceToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const serviceTokenWithIdOnly = await prisma.serviceToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServiceTokenFindManyArgs>(args?: SelectSubset<T, ServiceTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ServiceToken.
     * @param {ServiceTokenCreateArgs} args - Arguments to create a ServiceToken.
     * @example
     * // Create one ServiceToken
     * const ServiceToken = await prisma.serviceToken.create({
     *   data: {
     *     // ... data to create a ServiceToken
     *   }
     * })
     * 
     */
    create<T extends ServiceTokenCreateArgs>(args: SelectSubset<T, ServiceTokenCreateArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ServiceTokens.
     * @param {ServiceTokenCreateManyArgs} args - Arguments to create many ServiceTokens.
     * @example
     * // Create many ServiceTokens
     * const serviceToken = await prisma.serviceToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServiceTokenCreateManyArgs>(args?: SelectSubset<T, ServiceTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ServiceTokens and returns the data saved in the database.
     * @param {ServiceTokenCreateManyAndReturnArgs} args - Arguments to create many ServiceTokens.
     * @example
     * // Create many ServiceTokens
     * const serviceToken = await prisma.serviceToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ServiceTokens and only return the `id`
     * const serviceTokenWithIdOnly = await prisma.serviceToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServiceTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, ServiceTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ServiceToken.
     * @param {ServiceTokenDeleteArgs} args - Arguments to delete one ServiceToken.
     * @example
     * // Delete one ServiceToken
     * const ServiceToken = await prisma.serviceToken.delete({
     *   where: {
     *     // ... filter to delete one ServiceToken
     *   }
     * })
     * 
     */
    delete<T extends ServiceTokenDeleteArgs>(args: SelectSubset<T, ServiceTokenDeleteArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ServiceToken.
     * @param {ServiceTokenUpdateArgs} args - Arguments to update one ServiceToken.
     * @example
     * // Update one ServiceToken
     * const serviceToken = await prisma.serviceToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServiceTokenUpdateArgs>(args: SelectSubset<T, ServiceTokenUpdateArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ServiceTokens.
     * @param {ServiceTokenDeleteManyArgs} args - Arguments to filter ServiceTokens to delete.
     * @example
     * // Delete a few ServiceTokens
     * const { count } = await prisma.serviceToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServiceTokenDeleteManyArgs>(args?: SelectSubset<T, ServiceTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServiceTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServiceTokens
     * const serviceToken = await prisma.serviceToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServiceTokenUpdateManyArgs>(args: SelectSubset<T, ServiceTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ServiceToken.
     * @param {ServiceTokenUpsertArgs} args - Arguments to update or create a ServiceToken.
     * @example
     * // Update or create a ServiceToken
     * const serviceToken = await prisma.serviceToken.upsert({
     *   create: {
     *     // ... data to create a ServiceToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServiceToken we want to update
     *   }
     * })
     */
    upsert<T extends ServiceTokenUpsertArgs>(args: SelectSubset<T, ServiceTokenUpsertArgs<ExtArgs>>): Prisma__ServiceTokenClient<$Result.GetResult<Prisma.$ServiceTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ServiceTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenCountArgs} args - Arguments to filter ServiceTokens to count.
     * @example
     * // Count the number of ServiceTokens
     * const count = await prisma.serviceToken.count({
     *   where: {
     *     // ... the filter for the ServiceTokens we want to count
     *   }
     * })
    **/
    count<T extends ServiceTokenCountArgs>(
      args?: Subset<T, ServiceTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServiceTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ServiceToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ServiceTokenAggregateArgs>(args: Subset<T, ServiceTokenAggregateArgs>): Prisma.PrismaPromise<GetServiceTokenAggregateType<T>>

    /**
     * Group by ServiceToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServiceTokenGroupByArgs} args - Group by arguments.
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
      T extends ServiceTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServiceTokenGroupByArgs['orderBy'] }
        : { orderBy?: ServiceTokenGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ServiceTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServiceTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ServiceToken model
   */
  readonly fields: ServiceTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServiceToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServiceTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ServiceToken model
   */ 
  interface ServiceTokenFieldRefs {
    readonly id: FieldRef<"ServiceToken", 'String'>
    readonly tenant_id: FieldRef<"ServiceToken", 'String'>
    readonly user_id: FieldRef<"ServiceToken", 'String'>
    readonly token_hash: FieldRef<"ServiceToken", 'String'>
    readonly scope: FieldRef<"ServiceToken", 'ServiceTokenScope'>
    readonly expires_at: FieldRef<"ServiceToken", 'DateTime'>
    readonly revoked: FieldRef<"ServiceToken", 'Boolean'>
    readonly created_at: FieldRef<"ServiceToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ServiceToken findUnique
   */
  export type ServiceTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter, which ServiceToken to fetch.
     */
    where: ServiceTokenWhereUniqueInput
  }

  /**
   * ServiceToken findUniqueOrThrow
   */
  export type ServiceTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter, which ServiceToken to fetch.
     */
    where: ServiceTokenWhereUniqueInput
  }

  /**
   * ServiceToken findFirst
   */
  export type ServiceTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter, which ServiceToken to fetch.
     */
    where?: ServiceTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceTokens to fetch.
     */
    orderBy?: ServiceTokenOrderByWithRelationInput | ServiceTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceTokens.
     */
    cursor?: ServiceTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceTokens.
     */
    distinct?: ServiceTokenScalarFieldEnum | ServiceTokenScalarFieldEnum[]
  }

  /**
   * ServiceToken findFirstOrThrow
   */
  export type ServiceTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter, which ServiceToken to fetch.
     */
    where?: ServiceTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceTokens to fetch.
     */
    orderBy?: ServiceTokenOrderByWithRelationInput | ServiceTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServiceTokens.
     */
    cursor?: ServiceTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServiceTokens.
     */
    distinct?: ServiceTokenScalarFieldEnum | ServiceTokenScalarFieldEnum[]
  }

  /**
   * ServiceToken findMany
   */
  export type ServiceTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter, which ServiceTokens to fetch.
     */
    where?: ServiceTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServiceTokens to fetch.
     */
    orderBy?: ServiceTokenOrderByWithRelationInput | ServiceTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ServiceTokens.
     */
    cursor?: ServiceTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServiceTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServiceTokens.
     */
    skip?: number
    distinct?: ServiceTokenScalarFieldEnum | ServiceTokenScalarFieldEnum[]
  }

  /**
   * ServiceToken create
   */
  export type ServiceTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * The data needed to create a ServiceToken.
     */
    data: XOR<ServiceTokenCreateInput, ServiceTokenUncheckedCreateInput>
  }

  /**
   * ServiceToken createMany
   */
  export type ServiceTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ServiceTokens.
     */
    data: ServiceTokenCreateManyInput | ServiceTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServiceToken createManyAndReturn
   */
  export type ServiceTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ServiceTokens.
     */
    data: ServiceTokenCreateManyInput | ServiceTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServiceToken update
   */
  export type ServiceTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * The data needed to update a ServiceToken.
     */
    data: XOR<ServiceTokenUpdateInput, ServiceTokenUncheckedUpdateInput>
    /**
     * Choose, which ServiceToken to update.
     */
    where: ServiceTokenWhereUniqueInput
  }

  /**
   * ServiceToken updateMany
   */
  export type ServiceTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ServiceTokens.
     */
    data: XOR<ServiceTokenUpdateManyMutationInput, ServiceTokenUncheckedUpdateManyInput>
    /**
     * Filter which ServiceTokens to update
     */
    where?: ServiceTokenWhereInput
  }

  /**
   * ServiceToken upsert
   */
  export type ServiceTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * The filter to search for the ServiceToken to update in case it exists.
     */
    where: ServiceTokenWhereUniqueInput
    /**
     * In case the ServiceToken found by the `where` argument doesn't exist, create a new ServiceToken with this data.
     */
    create: XOR<ServiceTokenCreateInput, ServiceTokenUncheckedCreateInput>
    /**
     * In case the ServiceToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServiceTokenUpdateInput, ServiceTokenUncheckedUpdateInput>
  }

  /**
   * ServiceToken delete
   */
  export type ServiceTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
    /**
     * Filter which ServiceToken to delete.
     */
    where: ServiceTokenWhereUniqueInput
  }

  /**
   * ServiceToken deleteMany
   */
  export type ServiceTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServiceTokens to delete
     */
    where?: ServiceTokenWhereInput
  }

  /**
   * ServiceToken without action
   */
  export type ServiceTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServiceToken
     */
    select?: ServiceTokenSelect<ExtArgs> | null
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


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    status: 'status',
    clerk_org_id: 'clerk_org_id',
    stripe_customer_id: 'stripe_customer_id',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    clerk_user_id: 'clerk_user_id',
    email: 'email',
    name: 'name',
    role: 'role',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SubscriptionScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    plan: 'plan',
    status: 'status',
    stripe_subscription_id: 'stripe_subscription_id',
    stripe_price_id: 'stripe_price_id',
    trial_ends_at: 'trial_ends_at',
    current_period_start: 'current_period_start',
    current_period_end: 'current_period_end',
    cancelled_at: 'cancelled_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type SubscriptionScalarFieldEnum = (typeof SubscriptionScalarFieldEnum)[keyof typeof SubscriptionScalarFieldEnum]


  export const UserPermissionScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    company_id: 'company_id',
    user_id: 'user_id',
    product_id: 'product_id',
    permission: 'permission',
    granted_by: 'granted_by',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserPermissionScalarFieldEnum = (typeof UserPermissionScalarFieldEnum)[keyof typeof UserPermissionScalarFieldEnum]


  export const GravityAdminPermissionScalarFieldEnum: {
    id: 'id',
    admin_id: 'admin_id',
    resource: 'resource',
    action: 'action',
    granted_by: 'granted_by',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type GravityAdminPermissionScalarFieldEnum = (typeof GravityAdminPermissionScalarFieldEnum)[keyof typeof GravityAdminPermissionScalarFieldEnum]


  export const CompanyScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    name: 'name',
    subdomain: 'subdomain',
    cnpj: 'cnpj',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CompanyScalarFieldEnum = (typeof CompanyScalarFieldEnum)[keyof typeof CompanyScalarFieldEnum]


  export const UserMembershipScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    user_id: 'user_id',
    company_id: 'company_id',
    role: 'role',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserMembershipScalarFieldEnum = (typeof UserMembershipScalarFieldEnum)[keyof typeof UserMembershipScalarFieldEnum]


  export const ProductConfigScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    product_key: 'product_key',
    config: 'config',
    is_active: 'is_active',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ProductConfigScalarFieldEnum = (typeof ProductConfigScalarFieldEnum)[keyof typeof ProductConfigScalarFieldEnum]


  export const StripeEventScalarFieldEnum: {
    id: 'id',
    type: 'type',
    processed_at: 'processed_at',
    payload: 'payload'
  };

  export type StripeEventScalarFieldEnum = (typeof StripeEventScalarFieldEnum)[keyof typeof StripeEventScalarFieldEnum]


  export const SupplierTenantAccessScalarFieldEnum: {
    id: 'id',
    clerk_user_id: 'clerk_user_id',
    tenant_id: 'tenant_id',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type SupplierTenantAccessScalarFieldEnum = (typeof SupplierTenantAccessScalarFieldEnum)[keyof typeof SupplierTenantAccessScalarFieldEnum]


  export const ServiceTokenScalarFieldEnum: {
    id: 'id',
    tenant_id: 'tenant_id',
    user_id: 'user_id',
    token_hash: 'token_hash',
    scope: 'scope',
    expires_at: 'expires_at',
    revoked: 'revoked',
    created_at: 'created_at'
  };

  export type ServiceTokenScalarFieldEnum = (typeof ServiceTokenScalarFieldEnum)[keyof typeof ServiceTokenScalarFieldEnum]


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
   * Reference to a field of type 'TenantStatus'
   */
  export type EnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus'>
    


  /**
   * Reference to a field of type 'TenantStatus[]'
   */
  export type ListEnumTenantStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TenantStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'SubscriptionPlan'
   */
  export type EnumSubscriptionPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionPlan'>
    


  /**
   * Reference to a field of type 'SubscriptionPlan[]'
   */
  export type ListEnumSubscriptionPlanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionPlan[]'>
    


  /**
   * Reference to a field of type 'SubscriptionStatus'
   */
  export type EnumSubscriptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionStatus'>
    


  /**
   * Reference to a field of type 'SubscriptionStatus[]'
   */
  export type ListEnumSubscriptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SubscriptionStatus[]'>
    


  /**
   * Reference to a field of type 'CompanyStatus'
   */
  export type EnumCompanyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CompanyStatus'>
    


  /**
   * Reference to a field of type 'CompanyStatus[]'
   */
  export type ListEnumCompanyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CompanyStatus[]'>
    


  /**
   * Reference to a field of type 'UserMembershipRole'
   */
  export type EnumUserMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserMembershipRole'>
    


  /**
   * Reference to a field of type 'UserMembershipRole[]'
   */
  export type ListEnumUserMembershipRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserMembershipRole[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'ServiceTokenScope'
   */
  export type EnumServiceTokenScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceTokenScope'>
    


  /**
   * Reference to a field of type 'ServiceTokenScope[]'
   */
  export type ListEnumServiceTokenScopeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ServiceTokenScope[]'>
    


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


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    clerk_org_id?: StringNullableFilter<"Tenant"> | string | null
    stripe_customer_id?: StringNullableFilter<"Tenant"> | string | null
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    updated_at?: DateTimeFilter<"Tenant"> | Date | string
    users?: UserListRelationFilter
    subscriptions?: SubscriptionListRelationFilter
    user_permissions?: UserPermissionListRelationFilter
    companies?: CompanyListRelationFilter
    product_configs?: ProductConfigListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    clerk_org_id?: SortOrderInput | SortOrder
    stripe_customer_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    users?: UserOrderByRelationAggregateInput
    subscriptions?: SubscriptionOrderByRelationAggregateInput
    user_permissions?: UserPermissionOrderByRelationAggregateInput
    companies?: CompanyOrderByRelationAggregateInput
    product_configs?: ProductConfigOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    clerk_org_id?: string
    stripe_customer_id?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    status?: EnumTenantStatusFilter<"Tenant"> | $Enums.TenantStatus
    created_at?: DateTimeFilter<"Tenant"> | Date | string
    updated_at?: DateTimeFilter<"Tenant"> | Date | string
    users?: UserListRelationFilter
    subscriptions?: SubscriptionListRelationFilter
    user_permissions?: UserPermissionListRelationFilter
    companies?: CompanyListRelationFilter
    product_configs?: ProductConfigListRelationFilter
  }, "id" | "slug" | "clerk_org_id" | "stripe_customer_id">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    clerk_org_id?: SortOrderInput | SortOrder
    stripe_customer_id?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    status?: EnumTenantStatusWithAggregatesFilter<"Tenant"> | $Enums.TenantStatus
    clerk_org_id?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    stripe_customer_id?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    tenant_id?: StringFilter<"User"> | string
    clerk_user_id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    user_permissions?: UserPermissionListRelationFilter
    memberships?: UserMembershipListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clerk_user_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    user_permissions?: UserPermissionOrderByRelationAggregateInput
    memberships?: UserMembershipOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerk_user_id?: string
    tenant_id_email?: UserTenant_idEmailCompoundUniqueInput
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    tenant_id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    user_permissions?: UserPermissionListRelationFilter
    memberships?: UserMembershipListRelationFilter
  }, "id" | "clerk_user_id" | "tenant_id_email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clerk_user_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    tenant_id?: StringWithAggregatesFilter<"User"> | string
    clerk_user_id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type SubscriptionWhereInput = {
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    id?: StringFilter<"Subscription"> | string
    tenant_id?: StringFilter<"Subscription"> | string
    plan?: EnumSubscriptionPlanFilter<"Subscription"> | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFilter<"Subscription"> | $Enums.SubscriptionStatus
    stripe_subscription_id?: StringNullableFilter<"Subscription"> | string | null
    stripe_price_id?: StringNullableFilter<"Subscription"> | string | null
    trial_ends_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_start?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_end?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    cancelled_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    created_at?: DateTimeFilter<"Subscription"> | Date | string
    updated_at?: DateTimeFilter<"Subscription"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
  }

  export type SubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    stripe_subscription_id?: SortOrderInput | SortOrder
    stripe_price_id?: SortOrderInput | SortOrder
    trial_ends_at?: SortOrderInput | SortOrder
    current_period_start?: SortOrderInput | SortOrder
    current_period_end?: SortOrderInput | SortOrder
    cancelled_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type SubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    stripe_subscription_id?: string
    AND?: SubscriptionWhereInput | SubscriptionWhereInput[]
    OR?: SubscriptionWhereInput[]
    NOT?: SubscriptionWhereInput | SubscriptionWhereInput[]
    tenant_id?: StringFilter<"Subscription"> | string
    plan?: EnumSubscriptionPlanFilter<"Subscription"> | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFilter<"Subscription"> | $Enums.SubscriptionStatus
    stripe_price_id?: StringNullableFilter<"Subscription"> | string | null
    trial_ends_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_start?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_end?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    cancelled_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    created_at?: DateTimeFilter<"Subscription"> | Date | string
    updated_at?: DateTimeFilter<"Subscription"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
  }, "id" | "stripe_subscription_id">

  export type SubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    stripe_subscription_id?: SortOrderInput | SortOrder
    stripe_price_id?: SortOrderInput | SortOrder
    trial_ends_at?: SortOrderInput | SortOrder
    current_period_start?: SortOrderInput | SortOrder
    current_period_end?: SortOrderInput | SortOrder
    cancelled_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: SubscriptionCountOrderByAggregateInput
    _max?: SubscriptionMaxOrderByAggregateInput
    _min?: SubscriptionMinOrderByAggregateInput
  }

  export type SubscriptionScalarWhereWithAggregatesInput = {
    AND?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    OR?: SubscriptionScalarWhereWithAggregatesInput[]
    NOT?: SubscriptionScalarWhereWithAggregatesInput | SubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Subscription"> | string
    tenant_id?: StringWithAggregatesFilter<"Subscription"> | string
    plan?: EnumSubscriptionPlanWithAggregatesFilter<"Subscription"> | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusWithAggregatesFilter<"Subscription"> | $Enums.SubscriptionStatus
    stripe_subscription_id?: StringNullableWithAggregatesFilter<"Subscription"> | string | null
    stripe_price_id?: StringNullableWithAggregatesFilter<"Subscription"> | string | null
    trial_ends_at?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    current_period_start?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    current_period_end?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    cancelled_at?: DateTimeNullableWithAggregatesFilter<"Subscription"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Subscription"> | Date | string
  }

  export type UserPermissionWhereInput = {
    AND?: UserPermissionWhereInput | UserPermissionWhereInput[]
    OR?: UserPermissionWhereInput[]
    NOT?: UserPermissionWhereInput | UserPermissionWhereInput[]
    id?: StringFilter<"UserPermission"> | string
    tenant_id?: StringFilter<"UserPermission"> | string
    company_id?: StringFilter<"UserPermission"> | string
    user_id?: StringFilter<"UserPermission"> | string
    product_id?: StringFilter<"UserPermission"> | string
    permission?: StringFilter<"UserPermission"> | string
    granted_by?: StringFilter<"UserPermission"> | string
    created_at?: DateTimeFilter<"UserPermission"> | Date | string
    updated_at?: DateTimeFilter<"UserPermission"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type UserPermissionOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    company_id?: SortOrder
    user_id?: SortOrder
    product_id?: SortOrder
    permission?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type UserPermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_company_id_user_id_product_id_permission?: UserPermissionTenant_idCompany_idUser_idProduct_idPermissionCompoundUniqueInput
    AND?: UserPermissionWhereInput | UserPermissionWhereInput[]
    OR?: UserPermissionWhereInput[]
    NOT?: UserPermissionWhereInput | UserPermissionWhereInput[]
    tenant_id?: StringFilter<"UserPermission"> | string
    company_id?: StringFilter<"UserPermission"> | string
    user_id?: StringFilter<"UserPermission"> | string
    product_id?: StringFilter<"UserPermission"> | string
    permission?: StringFilter<"UserPermission"> | string
    granted_by?: StringFilter<"UserPermission"> | string
    created_at?: DateTimeFilter<"UserPermission"> | Date | string
    updated_at?: DateTimeFilter<"UserPermission"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "tenant_id_company_id_user_id_product_id_permission">

  export type UserPermissionOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    company_id?: SortOrder
    user_id?: SortOrder
    product_id?: SortOrder
    permission?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserPermissionCountOrderByAggregateInput
    _max?: UserPermissionMaxOrderByAggregateInput
    _min?: UserPermissionMinOrderByAggregateInput
  }

  export type UserPermissionScalarWhereWithAggregatesInput = {
    AND?: UserPermissionScalarWhereWithAggregatesInput | UserPermissionScalarWhereWithAggregatesInput[]
    OR?: UserPermissionScalarWhereWithAggregatesInput[]
    NOT?: UserPermissionScalarWhereWithAggregatesInput | UserPermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserPermission"> | string
    tenant_id?: StringWithAggregatesFilter<"UserPermission"> | string
    company_id?: StringWithAggregatesFilter<"UserPermission"> | string
    user_id?: StringWithAggregatesFilter<"UserPermission"> | string
    product_id?: StringWithAggregatesFilter<"UserPermission"> | string
    permission?: StringWithAggregatesFilter<"UserPermission"> | string
    granted_by?: StringWithAggregatesFilter<"UserPermission"> | string
    created_at?: DateTimeWithAggregatesFilter<"UserPermission"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"UserPermission"> | Date | string
  }

  export type GravityAdminPermissionWhereInput = {
    AND?: GravityAdminPermissionWhereInput | GravityAdminPermissionWhereInput[]
    OR?: GravityAdminPermissionWhereInput[]
    NOT?: GravityAdminPermissionWhereInput | GravityAdminPermissionWhereInput[]
    id?: StringFilter<"GravityAdminPermission"> | string
    admin_id?: StringFilter<"GravityAdminPermission"> | string
    resource?: StringFilter<"GravityAdminPermission"> | string
    action?: StringFilter<"GravityAdminPermission"> | string
    granted_by?: StringFilter<"GravityAdminPermission"> | string
    created_at?: DateTimeFilter<"GravityAdminPermission"> | Date | string
    updated_at?: DateTimeFilter<"GravityAdminPermission"> | Date | string
  }

  export type GravityAdminPermissionOrderByWithRelationInput = {
    id?: SortOrder
    admin_id?: SortOrder
    resource?: SortOrder
    action?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type GravityAdminPermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    admin_id_resource_action?: GravityAdminPermissionAdmin_idResourceActionCompoundUniqueInput
    AND?: GravityAdminPermissionWhereInput | GravityAdminPermissionWhereInput[]
    OR?: GravityAdminPermissionWhereInput[]
    NOT?: GravityAdminPermissionWhereInput | GravityAdminPermissionWhereInput[]
    admin_id?: StringFilter<"GravityAdminPermission"> | string
    resource?: StringFilter<"GravityAdminPermission"> | string
    action?: StringFilter<"GravityAdminPermission"> | string
    granted_by?: StringFilter<"GravityAdminPermission"> | string
    created_at?: DateTimeFilter<"GravityAdminPermission"> | Date | string
    updated_at?: DateTimeFilter<"GravityAdminPermission"> | Date | string
  }, "id" | "admin_id_resource_action">

  export type GravityAdminPermissionOrderByWithAggregationInput = {
    id?: SortOrder
    admin_id?: SortOrder
    resource?: SortOrder
    action?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: GravityAdminPermissionCountOrderByAggregateInput
    _max?: GravityAdminPermissionMaxOrderByAggregateInput
    _min?: GravityAdminPermissionMinOrderByAggregateInput
  }

  export type GravityAdminPermissionScalarWhereWithAggregatesInput = {
    AND?: GravityAdminPermissionScalarWhereWithAggregatesInput | GravityAdminPermissionScalarWhereWithAggregatesInput[]
    OR?: GravityAdminPermissionScalarWhereWithAggregatesInput[]
    NOT?: GravityAdminPermissionScalarWhereWithAggregatesInput | GravityAdminPermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GravityAdminPermission"> | string
    admin_id?: StringWithAggregatesFilter<"GravityAdminPermission"> | string
    resource?: StringWithAggregatesFilter<"GravityAdminPermission"> | string
    action?: StringWithAggregatesFilter<"GravityAdminPermission"> | string
    granted_by?: StringWithAggregatesFilter<"GravityAdminPermission"> | string
    created_at?: DateTimeWithAggregatesFilter<"GravityAdminPermission"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"GravityAdminPermission"> | Date | string
  }

  export type CompanyWhereInput = {
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    id?: StringFilter<"Company"> | string
    tenant_id?: StringFilter<"Company"> | string
    name?: StringFilter<"Company"> | string
    subdomain?: StringNullableFilter<"Company"> | string | null
    cnpj?: StringNullableFilter<"Company"> | string | null
    status?: EnumCompanyStatusFilter<"Company"> | $Enums.CompanyStatus
    created_at?: DateTimeFilter<"Company"> | Date | string
    updated_at?: DateTimeFilter<"Company"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    memberships?: UserMembershipListRelationFilter
  }

  export type CompanyOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    cnpj?: SortOrderInput | SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    memberships?: UserMembershipOrderByRelationAggregateInput
  }

  export type CompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    subdomain?: string
    AND?: CompanyWhereInput | CompanyWhereInput[]
    OR?: CompanyWhereInput[]
    NOT?: CompanyWhereInput | CompanyWhereInput[]
    tenant_id?: StringFilter<"Company"> | string
    name?: StringFilter<"Company"> | string
    cnpj?: StringNullableFilter<"Company"> | string | null
    status?: EnumCompanyStatusFilter<"Company"> | $Enums.CompanyStatus
    created_at?: DateTimeFilter<"Company"> | Date | string
    updated_at?: DateTimeFilter<"Company"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
    memberships?: UserMembershipListRelationFilter
  }, "id" | "subdomain">

  export type CompanyOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    cnpj?: SortOrderInput | SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CompanyCountOrderByAggregateInput
    _max?: CompanyMaxOrderByAggregateInput
    _min?: CompanyMinOrderByAggregateInput
  }

  export type CompanyScalarWhereWithAggregatesInput = {
    AND?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    OR?: CompanyScalarWhereWithAggregatesInput[]
    NOT?: CompanyScalarWhereWithAggregatesInput | CompanyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Company"> | string
    tenant_id?: StringWithAggregatesFilter<"Company"> | string
    name?: StringWithAggregatesFilter<"Company"> | string
    subdomain?: StringNullableWithAggregatesFilter<"Company"> | string | null
    cnpj?: StringNullableWithAggregatesFilter<"Company"> | string | null
    status?: EnumCompanyStatusWithAggregatesFilter<"Company"> | $Enums.CompanyStatus
    created_at?: DateTimeWithAggregatesFilter<"Company"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Company"> | Date | string
  }

  export type UserMembershipWhereInput = {
    AND?: UserMembershipWhereInput | UserMembershipWhereInput[]
    OR?: UserMembershipWhereInput[]
    NOT?: UserMembershipWhereInput | UserMembershipWhereInput[]
    id?: StringFilter<"UserMembership"> | string
    tenant_id?: StringFilter<"UserMembership"> | string
    user_id?: StringFilter<"UserMembership"> | string
    company_id?: StringFilter<"UserMembership"> | string
    role?: EnumUserMembershipRoleFilter<"UserMembership"> | $Enums.UserMembershipRole
    is_active?: BoolFilter<"UserMembership"> | boolean
    created_at?: DateTimeFilter<"UserMembership"> | Date | string
    updated_at?: DateTimeFilter<"UserMembership"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    company?: XOR<CompanyRelationFilter, CompanyWhereInput>
  }

  export type UserMembershipOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    company_id?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
    company?: CompanyOrderByWithRelationInput
  }

  export type UserMembershipWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_user_id_company_id?: UserMembershipTenant_idUser_idCompany_idCompoundUniqueInput
    AND?: UserMembershipWhereInput | UserMembershipWhereInput[]
    OR?: UserMembershipWhereInput[]
    NOT?: UserMembershipWhereInput | UserMembershipWhereInput[]
    tenant_id?: StringFilter<"UserMembership"> | string
    user_id?: StringFilter<"UserMembership"> | string
    company_id?: StringFilter<"UserMembership"> | string
    role?: EnumUserMembershipRoleFilter<"UserMembership"> | $Enums.UserMembershipRole
    is_active?: BoolFilter<"UserMembership"> | boolean
    created_at?: DateTimeFilter<"UserMembership"> | Date | string
    updated_at?: DateTimeFilter<"UserMembership"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    company?: XOR<CompanyRelationFilter, CompanyWhereInput>
  }, "id" | "tenant_id_user_id_company_id">

  export type UserMembershipOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    company_id?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserMembershipCountOrderByAggregateInput
    _max?: UserMembershipMaxOrderByAggregateInput
    _min?: UserMembershipMinOrderByAggregateInput
  }

  export type UserMembershipScalarWhereWithAggregatesInput = {
    AND?: UserMembershipScalarWhereWithAggregatesInput | UserMembershipScalarWhereWithAggregatesInput[]
    OR?: UserMembershipScalarWhereWithAggregatesInput[]
    NOT?: UserMembershipScalarWhereWithAggregatesInput | UserMembershipScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserMembership"> | string
    tenant_id?: StringWithAggregatesFilter<"UserMembership"> | string
    user_id?: StringWithAggregatesFilter<"UserMembership"> | string
    company_id?: StringWithAggregatesFilter<"UserMembership"> | string
    role?: EnumUserMembershipRoleWithAggregatesFilter<"UserMembership"> | $Enums.UserMembershipRole
    is_active?: BoolWithAggregatesFilter<"UserMembership"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"UserMembership"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"UserMembership"> | Date | string
  }

  export type ProductConfigWhereInput = {
    AND?: ProductConfigWhereInput | ProductConfigWhereInput[]
    OR?: ProductConfigWhereInput[]
    NOT?: ProductConfigWhereInput | ProductConfigWhereInput[]
    id?: StringFilter<"ProductConfig"> | string
    tenant_id?: StringFilter<"ProductConfig"> | string
    product_key?: StringFilter<"ProductConfig"> | string
    config?: JsonFilter<"ProductConfig">
    is_active?: BoolFilter<"ProductConfig"> | boolean
    created_at?: DateTimeFilter<"ProductConfig"> | Date | string
    updated_at?: DateTimeFilter<"ProductConfig"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
  }

  export type ProductConfigOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_key?: SortOrder
    config?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type ProductConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenant_id_product_key?: ProductConfigTenant_idProduct_keyCompoundUniqueInput
    AND?: ProductConfigWhereInput | ProductConfigWhereInput[]
    OR?: ProductConfigWhereInput[]
    NOT?: ProductConfigWhereInput | ProductConfigWhereInput[]
    tenant_id?: StringFilter<"ProductConfig"> | string
    product_key?: StringFilter<"ProductConfig"> | string
    config?: JsonFilter<"ProductConfig">
    is_active?: BoolFilter<"ProductConfig"> | boolean
    created_at?: DateTimeFilter<"ProductConfig"> | Date | string
    updated_at?: DateTimeFilter<"ProductConfig"> | Date | string
    tenant?: XOR<TenantRelationFilter, TenantWhereInput>
  }, "id" | "tenant_id_product_key">

  export type ProductConfigOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_key?: SortOrder
    config?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ProductConfigCountOrderByAggregateInput
    _max?: ProductConfigMaxOrderByAggregateInput
    _min?: ProductConfigMinOrderByAggregateInput
  }

  export type ProductConfigScalarWhereWithAggregatesInput = {
    AND?: ProductConfigScalarWhereWithAggregatesInput | ProductConfigScalarWhereWithAggregatesInput[]
    OR?: ProductConfigScalarWhereWithAggregatesInput[]
    NOT?: ProductConfigScalarWhereWithAggregatesInput | ProductConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProductConfig"> | string
    tenant_id?: StringWithAggregatesFilter<"ProductConfig"> | string
    product_key?: StringWithAggregatesFilter<"ProductConfig"> | string
    config?: JsonWithAggregatesFilter<"ProductConfig">
    is_active?: BoolWithAggregatesFilter<"ProductConfig"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"ProductConfig"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ProductConfig"> | Date | string
  }

  export type StripeEventWhereInput = {
    AND?: StripeEventWhereInput | StripeEventWhereInput[]
    OR?: StripeEventWhereInput[]
    NOT?: StripeEventWhereInput | StripeEventWhereInput[]
    id?: StringFilter<"StripeEvent"> | string
    type?: StringFilter<"StripeEvent"> | string
    processed_at?: DateTimeFilter<"StripeEvent"> | Date | string
    payload?: JsonFilter<"StripeEvent">
  }

  export type StripeEventOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    processed_at?: SortOrder
    payload?: SortOrder
  }

  export type StripeEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StripeEventWhereInput | StripeEventWhereInput[]
    OR?: StripeEventWhereInput[]
    NOT?: StripeEventWhereInput | StripeEventWhereInput[]
    type?: StringFilter<"StripeEvent"> | string
    processed_at?: DateTimeFilter<"StripeEvent"> | Date | string
    payload?: JsonFilter<"StripeEvent">
  }, "id">

  export type StripeEventOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    processed_at?: SortOrder
    payload?: SortOrder
    _count?: StripeEventCountOrderByAggregateInput
    _max?: StripeEventMaxOrderByAggregateInput
    _min?: StripeEventMinOrderByAggregateInput
  }

  export type StripeEventScalarWhereWithAggregatesInput = {
    AND?: StripeEventScalarWhereWithAggregatesInput | StripeEventScalarWhereWithAggregatesInput[]
    OR?: StripeEventScalarWhereWithAggregatesInput[]
    NOT?: StripeEventScalarWhereWithAggregatesInput | StripeEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StripeEvent"> | string
    type?: StringWithAggregatesFilter<"StripeEvent"> | string
    processed_at?: DateTimeWithAggregatesFilter<"StripeEvent"> | Date | string
    payload?: JsonWithAggregatesFilter<"StripeEvent">
  }

  export type SupplierTenantAccessWhereInput = {
    AND?: SupplierTenantAccessWhereInput | SupplierTenantAccessWhereInput[]
    OR?: SupplierTenantAccessWhereInput[]
    NOT?: SupplierTenantAccessWhereInput | SupplierTenantAccessWhereInput[]
    id?: StringFilter<"SupplierTenantAccess"> | string
    clerk_user_id?: StringFilter<"SupplierTenantAccess"> | string
    tenant_id?: StringFilter<"SupplierTenantAccess"> | string
    status?: StringFilter<"SupplierTenantAccess"> | string
    created_at?: DateTimeFilter<"SupplierTenantAccess"> | Date | string
    updated_at?: DateTimeFilter<"SupplierTenantAccess"> | Date | string
  }

  export type SupplierTenantAccessOrderByWithRelationInput = {
    id?: SortOrder
    clerk_user_id?: SortOrder
    tenant_id?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SupplierTenantAccessWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    clerk_user_id_tenant_id?: SupplierTenantAccessClerk_user_idTenant_idCompoundUniqueInput
    AND?: SupplierTenantAccessWhereInput | SupplierTenantAccessWhereInput[]
    OR?: SupplierTenantAccessWhereInput[]
    NOT?: SupplierTenantAccessWhereInput | SupplierTenantAccessWhereInput[]
    clerk_user_id?: StringFilter<"SupplierTenantAccess"> | string
    tenant_id?: StringFilter<"SupplierTenantAccess"> | string
    status?: StringFilter<"SupplierTenantAccess"> | string
    created_at?: DateTimeFilter<"SupplierTenantAccess"> | Date | string
    updated_at?: DateTimeFilter<"SupplierTenantAccess"> | Date | string
  }, "id" | "clerk_user_id_tenant_id">

  export type SupplierTenantAccessOrderByWithAggregationInput = {
    id?: SortOrder
    clerk_user_id?: SortOrder
    tenant_id?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: SupplierTenantAccessCountOrderByAggregateInput
    _max?: SupplierTenantAccessMaxOrderByAggregateInput
    _min?: SupplierTenantAccessMinOrderByAggregateInput
  }

  export type SupplierTenantAccessScalarWhereWithAggregatesInput = {
    AND?: SupplierTenantAccessScalarWhereWithAggregatesInput | SupplierTenantAccessScalarWhereWithAggregatesInput[]
    OR?: SupplierTenantAccessScalarWhereWithAggregatesInput[]
    NOT?: SupplierTenantAccessScalarWhereWithAggregatesInput | SupplierTenantAccessScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SupplierTenantAccess"> | string
    clerk_user_id?: StringWithAggregatesFilter<"SupplierTenantAccess"> | string
    tenant_id?: StringWithAggregatesFilter<"SupplierTenantAccess"> | string
    status?: StringWithAggregatesFilter<"SupplierTenantAccess"> | string
    created_at?: DateTimeWithAggregatesFilter<"SupplierTenantAccess"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"SupplierTenantAccess"> | Date | string
  }

  export type ServiceTokenWhereInput = {
    AND?: ServiceTokenWhereInput | ServiceTokenWhereInput[]
    OR?: ServiceTokenWhereInput[]
    NOT?: ServiceTokenWhereInput | ServiceTokenWhereInput[]
    id?: StringFilter<"ServiceToken"> | string
    tenant_id?: StringFilter<"ServiceToken"> | string
    user_id?: StringFilter<"ServiceToken"> | string
    token_hash?: StringFilter<"ServiceToken"> | string
    scope?: EnumServiceTokenScopeFilter<"ServiceToken"> | $Enums.ServiceTokenScope
    expires_at?: DateTimeNullableFilter<"ServiceToken"> | Date | string | null
    revoked?: BoolFilter<"ServiceToken"> | boolean
    created_at?: DateTimeFilter<"ServiceToken"> | Date | string
  }

  export type ServiceTokenOrderByWithRelationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    scope?: SortOrder
    expires_at?: SortOrderInput | SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
  }

  export type ServiceTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token_hash?: string
    AND?: ServiceTokenWhereInput | ServiceTokenWhereInput[]
    OR?: ServiceTokenWhereInput[]
    NOT?: ServiceTokenWhereInput | ServiceTokenWhereInput[]
    tenant_id?: StringFilter<"ServiceToken"> | string
    user_id?: StringFilter<"ServiceToken"> | string
    scope?: EnumServiceTokenScopeFilter<"ServiceToken"> | $Enums.ServiceTokenScope
    expires_at?: DateTimeNullableFilter<"ServiceToken"> | Date | string | null
    revoked?: BoolFilter<"ServiceToken"> | boolean
    created_at?: DateTimeFilter<"ServiceToken"> | Date | string
  }, "id" | "token_hash">

  export type ServiceTokenOrderByWithAggregationInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    scope?: SortOrder
    expires_at?: SortOrderInput | SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
    _count?: ServiceTokenCountOrderByAggregateInput
    _max?: ServiceTokenMaxOrderByAggregateInput
    _min?: ServiceTokenMinOrderByAggregateInput
  }

  export type ServiceTokenScalarWhereWithAggregatesInput = {
    AND?: ServiceTokenScalarWhereWithAggregatesInput | ServiceTokenScalarWhereWithAggregatesInput[]
    OR?: ServiceTokenScalarWhereWithAggregatesInput[]
    NOT?: ServiceTokenScalarWhereWithAggregatesInput | ServiceTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ServiceToken"> | string
    tenant_id?: StringWithAggregatesFilter<"ServiceToken"> | string
    user_id?: StringWithAggregatesFilter<"ServiceToken"> | string
    token_hash?: StringWithAggregatesFilter<"ServiceToken"> | string
    scope?: EnumServiceTokenScopeWithAggregatesFilter<"ServiceToken"> | $Enums.ServiceTokenScope
    expires_at?: DateTimeNullableWithAggregatesFilter<"ServiceToken"> | Date | string | null
    revoked?: BoolWithAggregatesFilter<"ServiceToken"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"ServiceToken"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionCreateNestedManyWithoutTenantInput
    companies?: CompanyCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutTenantInput
    companies?: CompanyUncheckedCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutTenantNestedInput
    companies?: CompanyUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutTenantNestedInput
    companies?: CompanyUncheckedUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    user_permissions?: UserPermissionCreateNestedManyWithoutUserInput
    memberships?: UserMembershipCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    tenant_id: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutUserInput
    memberships?: UserMembershipUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutUserNestedInput
    memberships?: UserMembershipUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutUserNestedInput
    memberships?: UserMembershipUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    tenant_id: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateInput = {
    id?: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutSubscriptionsInput
  }

  export type SubscriptionUncheckedCreateInput = {
    id?: string
    tenant_id: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutSubscriptionsNestedInput
  }

  export type SubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionCreateManyInput = {
    id?: string
    tenant_id: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionCreateInput = {
    id?: string
    company_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUser_permissionsInput
    user: UserCreateNestedOneWithoutUser_permissionsInput
  }

  export type UserPermissionUncheckedCreateInput = {
    id?: string
    tenant_id: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUser_permissionsNestedInput
    user?: UserUpdateOneRequiredWithoutUser_permissionsNestedInput
  }

  export type UserPermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionCreateManyInput = {
    id?: string
    tenant_id: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GravityAdminPermissionCreateInput = {
    id?: string
    admin_id: string
    resource: string
    action: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type GravityAdminPermissionUncheckedCreateInput = {
    id?: string
    admin_id: string
    resource: string
    action: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type GravityAdminPermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    admin_id?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GravityAdminPermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    admin_id?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GravityAdminPermissionCreateManyInput = {
    id?: string
    admin_id: string
    resource: string
    action: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type GravityAdminPermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    admin_id?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GravityAdminPermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    admin_id?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompanyCreateInput = {
    id?: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutCompaniesInput
    memberships?: UserMembershipCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateInput = {
    id?: string
    tenant_id: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
    memberships?: UserMembershipUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutCompaniesNestedInput
    memberships?: UserMembershipUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: UserMembershipUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyCreateManyInput = {
    id?: string
    tenant_id: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CompanyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompanyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipCreateInput = {
    id?: string
    tenant_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutMembershipsInput
    company: CompanyCreateNestedOneWithoutMembershipsInput
  }

  export type UserMembershipUncheckedCreateInput = {
    id?: string
    tenant_id: string
    user_id: string
    company_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
    company?: CompanyUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type UserMembershipUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipCreateManyInput = {
    id?: string
    tenant_id: string
    user_id: string
    company_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigCreateInput = {
    id?: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutProduct_configsInput
  }

  export type ProductConfigUncheckedCreateInput = {
    id?: string
    tenant_id: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutProduct_configsNestedInput
  }

  export type ProductConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigCreateManyInput = {
    id?: string
    tenant_id: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripeEventCreateInput = {
    id: string
    type: string
    processed_at?: Date | string
    payload: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventUncheckedCreateInput = {
    id: string
    type: string
    processed_at?: Date | string
    payload: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    processed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    payload?: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    processed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    payload?: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventCreateManyInput = {
    id: string
    type: string
    processed_at?: Date | string
    payload: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    processed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    payload?: JsonNullValueInput | InputJsonValue
  }

  export type StripeEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    processed_at?: DateTimeFieldUpdateOperationsInput | Date | string
    payload?: JsonNullValueInput | InputJsonValue
  }

  export type SupplierTenantAccessCreateInput = {
    id?: string
    clerk_user_id: string
    tenant_id: string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SupplierTenantAccessUncheckedCreateInput = {
    id?: string
    clerk_user_id: string
    tenant_id: string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SupplierTenantAccessUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SupplierTenantAccessUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SupplierTenantAccessCreateManyInput = {
    id?: string
    clerk_user_id: string
    tenant_id: string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SupplierTenantAccessUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SupplierTenantAccessUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceTokenCreateInput = {
    id?: string
    tenant_id: string
    user_id: string
    token_hash: string
    scope?: $Enums.ServiceTokenScope
    expires_at?: Date | string | null
    revoked?: boolean
    created_at?: Date | string
  }

  export type ServiceTokenUncheckedCreateInput = {
    id?: string
    tenant_id: string
    user_id: string
    token_hash: string
    scope?: $Enums.ServiceTokenScope
    expires_at?: Date | string | null
    revoked?: boolean
    created_at?: Date | string
  }

  export type ServiceTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    scope?: EnumServiceTokenScopeFieldUpdateOperationsInput | $Enums.ServiceTokenScope
    expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    scope?: EnumServiceTokenScopeFieldUpdateOperationsInput | $Enums.ServiceTokenScope
    expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceTokenCreateManyInput = {
    id?: string
    tenant_id: string
    user_id: string
    token_hash: string
    scope?: $Enums.ServiceTokenScope
    expires_at?: Date | string | null
    revoked?: boolean
    created_at?: Date | string
  }

  export type ServiceTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    scope?: EnumServiceTokenScopeFieldUpdateOperationsInput | $Enums.ServiceTokenScope
    expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServiceTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    token_hash?: StringFieldUpdateOperationsInput | string
    scope?: EnumServiceTokenScopeFieldUpdateOperationsInput | $Enums.ServiceTokenScope
    expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    revoked?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
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

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type SubscriptionListRelationFilter = {
    every?: SubscriptionWhereInput
    some?: SubscriptionWhereInput
    none?: SubscriptionWhereInput
  }

  export type UserPermissionListRelationFilter = {
    every?: UserPermissionWhereInput
    some?: UserPermissionWhereInput
    none?: UserPermissionWhereInput
  }

  export type CompanyListRelationFilter = {
    every?: CompanyWhereInput
    some?: CompanyWhereInput
    none?: CompanyWhereInput
  }

  export type ProductConfigListRelationFilter = {
    every?: ProductConfigWhereInput
    some?: ProductConfigWhereInput
    none?: ProductConfigWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SubscriptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserPermissionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CompanyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductConfigOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    clerk_org_id?: SortOrder
    stripe_customer_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    clerk_org_id?: SortOrder
    stripe_customer_id?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    clerk_org_id?: SortOrder
    stripe_customer_id?: SortOrder
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

  export type EnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
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

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type TenantRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type UserMembershipListRelationFilter = {
    every?: UserMembershipWhereInput
    some?: UserMembershipWhereInput
    none?: UserMembershipWhereInput
  }

  export type UserMembershipOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTenant_idEmailCompoundUniqueInput = {
    tenant_id: string
    email: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clerk_user_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clerk_user_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    clerk_user_id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type EnumSubscriptionPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanFilter<$PrismaModel> | $Enums.SubscriptionPlan
  }

  export type EnumSubscriptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusFilter<$PrismaModel> | $Enums.SubscriptionStatus
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

  export type SubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    stripe_subscription_id?: SortOrder
    stripe_price_id?: SortOrder
    trial_ends_at?: SortOrder
    current_period_start?: SortOrder
    current_period_end?: SortOrder
    cancelled_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    stripe_subscription_id?: SortOrder
    stripe_price_id?: SortOrder
    trial_ends_at?: SortOrder
    current_period_start?: SortOrder
    current_period_end?: SortOrder
    cancelled_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    plan?: SortOrder
    status?: SortOrder
    stripe_subscription_id?: SortOrder
    stripe_price_id?: SortOrder
    trial_ends_at?: SortOrder
    current_period_start?: SortOrder
    current_period_end?: SortOrder
    cancelled_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumSubscriptionPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
  }

  export type EnumSubscriptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
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

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserPermissionTenant_idCompany_idUser_idProduct_idPermissionCompoundUniqueInput = {
    tenant_id: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
  }

  export type UserPermissionCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    company_id?: SortOrder
    user_id?: SortOrder
    product_id?: SortOrder
    permission?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserPermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    company_id?: SortOrder
    user_id?: SortOrder
    product_id?: SortOrder
    permission?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserPermissionMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    company_id?: SortOrder
    user_id?: SortOrder
    product_id?: SortOrder
    permission?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type GravityAdminPermissionAdmin_idResourceActionCompoundUniqueInput = {
    admin_id: string
    resource: string
    action: string
  }

  export type GravityAdminPermissionCountOrderByAggregateInput = {
    id?: SortOrder
    admin_id?: SortOrder
    resource?: SortOrder
    action?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type GravityAdminPermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    admin_id?: SortOrder
    resource?: SortOrder
    action?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type GravityAdminPermissionMinOrderByAggregateInput = {
    id?: SortOrder
    admin_id?: SortOrder
    resource?: SortOrder
    action?: SortOrder
    granted_by?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumCompanyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | EnumCompanyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCompanyStatusFilter<$PrismaModel> | $Enums.CompanyStatus
  }

  export type CompanyCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    cnpj?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CompanyMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    cnpj?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CompanyMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    name?: SortOrder
    subdomain?: SortOrder
    cnpj?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumCompanyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | EnumCompanyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel> | $Enums.CompanyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCompanyStatusFilter<$PrismaModel>
    _max?: NestedEnumCompanyStatusFilter<$PrismaModel>
  }

  export type EnumUserMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserMembershipRole | EnumUserMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserMembershipRoleFilter<$PrismaModel> | $Enums.UserMembershipRole
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CompanyRelationFilter = {
    is?: CompanyWhereInput
    isNot?: CompanyWhereInput
  }

  export type UserMembershipTenant_idUser_idCompany_idCompoundUniqueInput = {
    tenant_id: string
    user_id: string
    company_id: string
  }

  export type UserMembershipCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    company_id?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMembershipMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    company_id?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMembershipMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    company_id?: SortOrder
    role?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumUserMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserMembershipRole | EnumUserMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserMembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumUserMembershipRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type ProductConfigTenant_idProduct_keyCompoundUniqueInput = {
    tenant_id: string
    product_key: string
  }

  export type ProductConfigCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_key?: SortOrder
    config?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProductConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_key?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ProductConfigMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    product_key?: SortOrder
    is_active?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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

  export type StripeEventCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    processed_at?: SortOrder
    payload?: SortOrder
  }

  export type StripeEventMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    processed_at?: SortOrder
  }

  export type StripeEventMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    processed_at?: SortOrder
  }

  export type SupplierTenantAccessClerk_user_idTenant_idCompoundUniqueInput = {
    clerk_user_id: string
    tenant_id: string
  }

  export type SupplierTenantAccessCountOrderByAggregateInput = {
    id?: SortOrder
    clerk_user_id?: SortOrder
    tenant_id?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SupplierTenantAccessMaxOrderByAggregateInput = {
    id?: SortOrder
    clerk_user_id?: SortOrder
    tenant_id?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type SupplierTenantAccessMinOrderByAggregateInput = {
    id?: SortOrder
    clerk_user_id?: SortOrder
    tenant_id?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type EnumServiceTokenScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceTokenScope | EnumServiceTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceTokenScopeFilter<$PrismaModel> | $Enums.ServiceTokenScope
  }

  export type ServiceTokenCountOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    scope?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
  }

  export type ServiceTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    scope?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
  }

  export type ServiceTokenMinOrderByAggregateInput = {
    id?: SortOrder
    tenant_id?: SortOrder
    user_id?: SortOrder
    token_hash?: SortOrder
    scope?: SortOrder
    expires_at?: SortOrder
    revoked?: SortOrder
    created_at?: SortOrder
  }

  export type EnumServiceTokenScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceTokenScope | EnumServiceTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceTokenScopeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceTokenScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceTokenScopeFilter<$PrismaModel>
    _max?: NestedEnumServiceTokenScopeFilter<$PrismaModel>
  }

  export type UserCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type SubscriptionCreateNestedManyWithoutTenantInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type UserPermissionCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput> | UserPermissionCreateWithoutTenantInput[] | UserPermissionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutTenantInput | UserPermissionCreateOrConnectWithoutTenantInput[]
    createMany?: UserPermissionCreateManyTenantInputEnvelope
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
  }

  export type CompanyCreateNestedManyWithoutTenantInput = {
    create?: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput> | CompanyCreateWithoutTenantInput[] | CompanyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: CompanyCreateOrConnectWithoutTenantInput | CompanyCreateOrConnectWithoutTenantInput[]
    createMany?: CompanyCreateManyTenantInputEnvelope
    connect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
  }

  export type ProductConfigCreateNestedManyWithoutTenantInput = {
    create?: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput> | ProductConfigCreateWithoutTenantInput[] | ProductConfigUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProductConfigCreateOrConnectWithoutTenantInput | ProductConfigCreateOrConnectWithoutTenantInput[]
    createMany?: ProductConfigCreateManyTenantInputEnvelope
    connect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type SubscriptionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
  }

  export type UserPermissionUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput> | UserPermissionCreateWithoutTenantInput[] | UserPermissionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutTenantInput | UserPermissionCreateOrConnectWithoutTenantInput[]
    createMany?: UserPermissionCreateManyTenantInputEnvelope
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
  }

  export type CompanyUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput> | CompanyCreateWithoutTenantInput[] | CompanyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: CompanyCreateOrConnectWithoutTenantInput | CompanyCreateOrConnectWithoutTenantInput[]
    createMany?: CompanyCreateManyTenantInputEnvelope
    connect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
  }

  export type ProductConfigUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput> | ProductConfigCreateWithoutTenantInput[] | ProductConfigUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProductConfigCreateOrConnectWithoutTenantInput | ProductConfigCreateOrConnectWithoutTenantInput[]
    createMany?: ProductConfigCreateManyTenantInputEnvelope
    connect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumTenantStatusFieldUpdateOperationsInput = {
    set?: $Enums.TenantStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type SubscriptionUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutTenantInput | SubscriptionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutTenantInput | SubscriptionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutTenantInput | SubscriptionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type UserPermissionUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput> | UserPermissionCreateWithoutTenantInput[] | UserPermissionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutTenantInput | UserPermissionCreateOrConnectWithoutTenantInput[]
    upsert?: UserPermissionUpsertWithWhereUniqueWithoutTenantInput | UserPermissionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserPermissionCreateManyTenantInputEnvelope
    set?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    disconnect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    delete?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    update?: UserPermissionUpdateWithWhereUniqueWithoutTenantInput | UserPermissionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserPermissionUpdateManyWithWhereWithoutTenantInput | UserPermissionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
  }

  export type CompanyUpdateManyWithoutTenantNestedInput = {
    create?: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput> | CompanyCreateWithoutTenantInput[] | CompanyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: CompanyCreateOrConnectWithoutTenantInput | CompanyCreateOrConnectWithoutTenantInput[]
    upsert?: CompanyUpsertWithWhereUniqueWithoutTenantInput | CompanyUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: CompanyCreateManyTenantInputEnvelope
    set?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    disconnect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    delete?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    connect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    update?: CompanyUpdateWithWhereUniqueWithoutTenantInput | CompanyUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: CompanyUpdateManyWithWhereWithoutTenantInput | CompanyUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: CompanyScalarWhereInput | CompanyScalarWhereInput[]
  }

  export type ProductConfigUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput> | ProductConfigCreateWithoutTenantInput[] | ProductConfigUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProductConfigCreateOrConnectWithoutTenantInput | ProductConfigCreateOrConnectWithoutTenantInput[]
    upsert?: ProductConfigUpsertWithWhereUniqueWithoutTenantInput | ProductConfigUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ProductConfigCreateManyTenantInputEnvelope
    set?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    disconnect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    delete?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    connect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    update?: ProductConfigUpdateWithWhereUniqueWithoutTenantInput | ProductConfigUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ProductConfigUpdateManyWithWhereWithoutTenantInput | ProductConfigUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ProductConfigScalarWhereInput | ProductConfigScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type SubscriptionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput> | SubscriptionCreateWithoutTenantInput[] | SubscriptionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: SubscriptionCreateOrConnectWithoutTenantInput | SubscriptionCreateOrConnectWithoutTenantInput[]
    upsert?: SubscriptionUpsertWithWhereUniqueWithoutTenantInput | SubscriptionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: SubscriptionCreateManyTenantInputEnvelope
    set?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    disconnect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    delete?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    connect?: SubscriptionWhereUniqueInput | SubscriptionWhereUniqueInput[]
    update?: SubscriptionUpdateWithWhereUniqueWithoutTenantInput | SubscriptionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: SubscriptionUpdateManyWithWhereWithoutTenantInput | SubscriptionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
  }

  export type UserPermissionUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput> | UserPermissionCreateWithoutTenantInput[] | UserPermissionUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutTenantInput | UserPermissionCreateOrConnectWithoutTenantInput[]
    upsert?: UserPermissionUpsertWithWhereUniqueWithoutTenantInput | UserPermissionUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserPermissionCreateManyTenantInputEnvelope
    set?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    disconnect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    delete?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    update?: UserPermissionUpdateWithWhereUniqueWithoutTenantInput | UserPermissionUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserPermissionUpdateManyWithWhereWithoutTenantInput | UserPermissionUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
  }

  export type CompanyUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput> | CompanyCreateWithoutTenantInput[] | CompanyUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: CompanyCreateOrConnectWithoutTenantInput | CompanyCreateOrConnectWithoutTenantInput[]
    upsert?: CompanyUpsertWithWhereUniqueWithoutTenantInput | CompanyUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: CompanyCreateManyTenantInputEnvelope
    set?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    disconnect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    delete?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    connect?: CompanyWhereUniqueInput | CompanyWhereUniqueInput[]
    update?: CompanyUpdateWithWhereUniqueWithoutTenantInput | CompanyUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: CompanyUpdateManyWithWhereWithoutTenantInput | CompanyUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: CompanyScalarWhereInput | CompanyScalarWhereInput[]
  }

  export type ProductConfigUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput> | ProductConfigCreateWithoutTenantInput[] | ProductConfigUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ProductConfigCreateOrConnectWithoutTenantInput | ProductConfigCreateOrConnectWithoutTenantInput[]
    upsert?: ProductConfigUpsertWithWhereUniqueWithoutTenantInput | ProductConfigUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ProductConfigCreateManyTenantInputEnvelope
    set?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    disconnect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    delete?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    connect?: ProductConfigWhereUniqueInput | ProductConfigWhereUniqueInput[]
    update?: ProductConfigUpdateWithWhereUniqueWithoutTenantInput | ProductConfigUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ProductConfigUpdateManyWithWhereWithoutTenantInput | ProductConfigUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ProductConfigScalarWhereInput | ProductConfigScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutUsersInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    connect?: TenantWhereUniqueInput
  }

  export type UserPermissionCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput> | UserPermissionCreateWithoutUserInput[] | UserPermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutUserInput | UserPermissionCreateOrConnectWithoutUserInput[]
    createMany?: UserPermissionCreateManyUserInputEnvelope
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
  }

  export type UserMembershipCreateNestedManyWithoutUserInput = {
    create?: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput> | UserMembershipCreateWithoutUserInput[] | UserMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutUserInput | UserMembershipCreateOrConnectWithoutUserInput[]
    createMany?: UserMembershipCreateManyUserInputEnvelope
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
  }

  export type UserPermissionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput> | UserPermissionCreateWithoutUserInput[] | UserPermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutUserInput | UserPermissionCreateOrConnectWithoutUserInput[]
    createMany?: UserPermissionCreateManyUserInputEnvelope
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
  }

  export type UserMembershipUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput> | UserMembershipCreateWithoutUserInput[] | UserMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutUserInput | UserMembershipCreateOrConnectWithoutUserInput[]
    createMany?: UserMembershipCreateManyUserInputEnvelope
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type TenantUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    upsert?: TenantUpsertWithoutUsersInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsersInput, TenantUpdateWithoutUsersInput>, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type UserPermissionUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput> | UserPermissionCreateWithoutUserInput[] | UserPermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutUserInput | UserPermissionCreateOrConnectWithoutUserInput[]
    upsert?: UserPermissionUpsertWithWhereUniqueWithoutUserInput | UserPermissionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPermissionCreateManyUserInputEnvelope
    set?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    disconnect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    delete?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    update?: UserPermissionUpdateWithWhereUniqueWithoutUserInput | UserPermissionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPermissionUpdateManyWithWhereWithoutUserInput | UserPermissionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
  }

  export type UserMembershipUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput> | UserMembershipCreateWithoutUserInput[] | UserMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutUserInput | UserMembershipCreateOrConnectWithoutUserInput[]
    upsert?: UserMembershipUpsertWithWhereUniqueWithoutUserInput | UserMembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserMembershipCreateManyUserInputEnvelope
    set?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    disconnect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    delete?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    update?: UserMembershipUpdateWithWhereUniqueWithoutUserInput | UserMembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserMembershipUpdateManyWithWhereWithoutUserInput | UserMembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
  }

  export type UserPermissionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput> | UserPermissionCreateWithoutUserInput[] | UserPermissionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserPermissionCreateOrConnectWithoutUserInput | UserPermissionCreateOrConnectWithoutUserInput[]
    upsert?: UserPermissionUpsertWithWhereUniqueWithoutUserInput | UserPermissionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserPermissionCreateManyUserInputEnvelope
    set?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    disconnect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    delete?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    connect?: UserPermissionWhereUniqueInput | UserPermissionWhereUniqueInput[]
    update?: UserPermissionUpdateWithWhereUniqueWithoutUserInput | UserPermissionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserPermissionUpdateManyWithWhereWithoutUserInput | UserPermissionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
  }

  export type UserMembershipUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput> | UserMembershipCreateWithoutUserInput[] | UserMembershipUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutUserInput | UserMembershipCreateOrConnectWithoutUserInput[]
    upsert?: UserMembershipUpsertWithWhereUniqueWithoutUserInput | UserMembershipUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserMembershipCreateManyUserInputEnvelope
    set?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    disconnect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    delete?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    update?: UserMembershipUpdateWithWhereUniqueWithoutUserInput | UserMembershipUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserMembershipUpdateManyWithWhereWithoutUserInput | UserMembershipUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutSubscriptionsInput = {
    create?: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSubscriptionsInput
    connect?: TenantWhereUniqueInput
  }

  export type EnumSubscriptionPlanFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionPlan
  }

  export type EnumSubscriptionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SubscriptionStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type TenantUpdateOneRequiredWithoutSubscriptionsNestedInput = {
    create?: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutSubscriptionsInput
    upsert?: TenantUpsertWithoutSubscriptionsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutSubscriptionsInput, TenantUpdateWithoutSubscriptionsInput>, TenantUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type TenantCreateNestedOneWithoutUser_permissionsInput = {
    create?: XOR<TenantCreateWithoutUser_permissionsInput, TenantUncheckedCreateWithoutUser_permissionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUser_permissionsInput
    connect?: TenantWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutUser_permissionsInput = {
    create?: XOR<UserCreateWithoutUser_permissionsInput, UserUncheckedCreateWithoutUser_permissionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUser_permissionsInput
    connect?: UserWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutUser_permissionsNestedInput = {
    create?: XOR<TenantCreateWithoutUser_permissionsInput, TenantUncheckedCreateWithoutUser_permissionsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUser_permissionsInput
    upsert?: TenantUpsertWithoutUser_permissionsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUser_permissionsInput, TenantUpdateWithoutUser_permissionsInput>, TenantUncheckedUpdateWithoutUser_permissionsInput>
  }

  export type UserUpdateOneRequiredWithoutUser_permissionsNestedInput = {
    create?: XOR<UserCreateWithoutUser_permissionsInput, UserUncheckedCreateWithoutUser_permissionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutUser_permissionsInput
    upsert?: UserUpsertWithoutUser_permissionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUser_permissionsInput, UserUpdateWithoutUser_permissionsInput>, UserUncheckedUpdateWithoutUser_permissionsInput>
  }

  export type TenantCreateNestedOneWithoutCompaniesInput = {
    create?: XOR<TenantCreateWithoutCompaniesInput, TenantUncheckedCreateWithoutCompaniesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutCompaniesInput
    connect?: TenantWhereUniqueInput
  }

  export type UserMembershipCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput> | UserMembershipCreateWithoutCompanyInput[] | UserMembershipUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutCompanyInput | UserMembershipCreateOrConnectWithoutCompanyInput[]
    createMany?: UserMembershipCreateManyCompanyInputEnvelope
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
  }

  export type UserMembershipUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput> | UserMembershipCreateWithoutCompanyInput[] | UserMembershipUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutCompanyInput | UserMembershipCreateOrConnectWithoutCompanyInput[]
    createMany?: UserMembershipCreateManyCompanyInputEnvelope
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
  }

  export type EnumCompanyStatusFieldUpdateOperationsInput = {
    set?: $Enums.CompanyStatus
  }

  export type TenantUpdateOneRequiredWithoutCompaniesNestedInput = {
    create?: XOR<TenantCreateWithoutCompaniesInput, TenantUncheckedCreateWithoutCompaniesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutCompaniesInput
    upsert?: TenantUpsertWithoutCompaniesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutCompaniesInput, TenantUpdateWithoutCompaniesInput>, TenantUncheckedUpdateWithoutCompaniesInput>
  }

  export type UserMembershipUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput> | UserMembershipCreateWithoutCompanyInput[] | UserMembershipUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutCompanyInput | UserMembershipCreateOrConnectWithoutCompanyInput[]
    upsert?: UserMembershipUpsertWithWhereUniqueWithoutCompanyInput | UserMembershipUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserMembershipCreateManyCompanyInputEnvelope
    set?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    disconnect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    delete?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    update?: UserMembershipUpdateWithWhereUniqueWithoutCompanyInput | UserMembershipUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserMembershipUpdateManyWithWhereWithoutCompanyInput | UserMembershipUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
  }

  export type UserMembershipUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput> | UserMembershipCreateWithoutCompanyInput[] | UserMembershipUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: UserMembershipCreateOrConnectWithoutCompanyInput | UserMembershipCreateOrConnectWithoutCompanyInput[]
    upsert?: UserMembershipUpsertWithWhereUniqueWithoutCompanyInput | UserMembershipUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: UserMembershipCreateManyCompanyInputEnvelope
    set?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    disconnect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    delete?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    connect?: UserMembershipWhereUniqueInput | UserMembershipWhereUniqueInput[]
    update?: UserMembershipUpdateWithWhereUniqueWithoutCompanyInput | UserMembershipUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: UserMembershipUpdateManyWithWhereWithoutCompanyInput | UserMembershipUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    connect?: UserWhereUniqueInput
  }

  export type CompanyCreateNestedOneWithoutMembershipsInput = {
    create?: XOR<CompanyCreateWithoutMembershipsInput, CompanyUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutMembershipsInput
    connect?: CompanyWhereUniqueInput
  }

  export type EnumUserMembershipRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserMembershipRole
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipsInput
    upsert?: UserUpsertWithoutMembershipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMembershipsInput, UserUpdateWithoutMembershipsInput>, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type CompanyUpdateOneRequiredWithoutMembershipsNestedInput = {
    create?: XOR<CompanyCreateWithoutMembershipsInput, CompanyUncheckedCreateWithoutMembershipsInput>
    connectOrCreate?: CompanyCreateOrConnectWithoutMembershipsInput
    upsert?: CompanyUpsertWithoutMembershipsInput
    connect?: CompanyWhereUniqueInput
    update?: XOR<XOR<CompanyUpdateToOneWithWhereWithoutMembershipsInput, CompanyUpdateWithoutMembershipsInput>, CompanyUncheckedUpdateWithoutMembershipsInput>
  }

  export type TenantCreateNestedOneWithoutProduct_configsInput = {
    create?: XOR<TenantCreateWithoutProduct_configsInput, TenantUncheckedCreateWithoutProduct_configsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutProduct_configsInput
    connect?: TenantWhereUniqueInput
  }

  export type TenantUpdateOneRequiredWithoutProduct_configsNestedInput = {
    create?: XOR<TenantCreateWithoutProduct_configsInput, TenantUncheckedCreateWithoutProduct_configsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutProduct_configsInput
    upsert?: TenantUpsertWithoutProduct_configsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutProduct_configsInput, TenantUpdateWithoutProduct_configsInput>, TenantUncheckedUpdateWithoutProduct_configsInput>
  }

  export type EnumServiceTokenScopeFieldUpdateOperationsInput = {
    set?: $Enums.ServiceTokenScope
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

  export type NestedEnumTenantStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusFilter<$PrismaModel> | $Enums.TenantStatus
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

  export type NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TenantStatus | EnumTenantStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TenantStatus[] | ListEnumTenantStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTenantStatusWithAggregatesFilter<$PrismaModel> | $Enums.TenantStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTenantStatusFilter<$PrismaModel>
    _max?: NestedEnumTenantStatusFilter<$PrismaModel>
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

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedEnumSubscriptionPlanFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanFilter<$PrismaModel> | $Enums.SubscriptionPlan
  }

  export type NestedEnumSubscriptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusFilter<$PrismaModel> | $Enums.SubscriptionStatus
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

  export type NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionPlan | EnumSubscriptionPlanFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionPlan[] | ListEnumSubscriptionPlanFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionPlanWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionPlan
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionPlanFilter<$PrismaModel>
  }

  export type NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SubscriptionStatus | EnumSubscriptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SubscriptionStatus[] | ListEnumSubscriptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSubscriptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.SubscriptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
    _max?: NestedEnumSubscriptionStatusFilter<$PrismaModel>
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

  export type NestedEnumCompanyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | EnumCompanyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCompanyStatusFilter<$PrismaModel> | $Enums.CompanyStatus
  }

  export type NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CompanyStatus | EnumCompanyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CompanyStatus[] | ListEnumCompanyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCompanyStatusWithAggregatesFilter<$PrismaModel> | $Enums.CompanyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCompanyStatusFilter<$PrismaModel>
    _max?: NestedEnumCompanyStatusFilter<$PrismaModel>
  }

  export type NestedEnumUserMembershipRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserMembershipRole | EnumUserMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserMembershipRoleFilter<$PrismaModel> | $Enums.UserMembershipRole
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumUserMembershipRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserMembershipRole | EnumUserMembershipRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserMembershipRole[] | ListEnumUserMembershipRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserMembershipRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserMembershipRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserMembershipRoleFilter<$PrismaModel>
    _max?: NestedEnumUserMembershipRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type NestedEnumServiceTokenScopeFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceTokenScope | EnumServiceTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceTokenScopeFilter<$PrismaModel> | $Enums.ServiceTokenScope
  }

  export type NestedEnumServiceTokenScopeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ServiceTokenScope | EnumServiceTokenScopeFieldRefInput<$PrismaModel>
    in?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ServiceTokenScope[] | ListEnumServiceTokenScopeFieldRefInput<$PrismaModel>
    not?: NestedEnumServiceTokenScopeWithAggregatesFilter<$PrismaModel> | $Enums.ServiceTokenScope
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumServiceTokenScopeFilter<$PrismaModel>
    _max?: NestedEnumServiceTokenScopeFilter<$PrismaModel>
  }

  export type UserCreateWithoutTenantInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    user_permissions?: UserPermissionCreateNestedManyWithoutUserInput
    memberships?: UserMembershipCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTenantInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutUserInput
    memberships?: UserMembershipUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTenantInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserCreateManyTenantInputEnvelope = {
    data: UserCreateManyTenantInput | UserCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type SubscriptionCreateWithoutTenantInput = {
    id?: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SubscriptionUncheckedCreateWithoutTenantInput = {
    id?: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SubscriptionCreateOrConnectWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    create: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput>
  }

  export type SubscriptionCreateManyTenantInputEnvelope = {
    data: SubscriptionCreateManyTenantInput | SubscriptionCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UserPermissionCreateWithoutTenantInput = {
    id?: string
    company_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutUser_permissionsInput
  }

  export type UserPermissionUncheckedCreateWithoutTenantInput = {
    id?: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionCreateOrConnectWithoutTenantInput = {
    where: UserPermissionWhereUniqueInput
    create: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput>
  }

  export type UserPermissionCreateManyTenantInputEnvelope = {
    data: UserPermissionCreateManyTenantInput | UserPermissionCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type CompanyCreateWithoutTenantInput = {
    id?: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
    memberships?: UserMembershipCreateNestedManyWithoutCompanyInput
  }

  export type CompanyUncheckedCreateWithoutTenantInput = {
    id?: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
    memberships?: UserMembershipUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type CompanyCreateOrConnectWithoutTenantInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput>
  }

  export type CompanyCreateManyTenantInputEnvelope = {
    data: CompanyCreateManyTenantInput | CompanyCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ProductConfigCreateWithoutTenantInput = {
    id?: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductConfigUncheckedCreateWithoutTenantInput = {
    id?: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductConfigCreateOrConnectWithoutTenantInput = {
    where: ProductConfigWhereUniqueInput
    create: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput>
  }

  export type ProductConfigCreateManyTenantInputEnvelope = {
    data: ProductConfigCreateManyTenantInput | ProductConfigCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
  }

  export type UserUpdateManyWithWhereWithoutTenantInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTenantInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    tenant_id?: StringFilter<"User"> | string
    clerk_user_id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
  }

  export type SubscriptionUpsertWithWhereUniqueWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    update: XOR<SubscriptionUpdateWithoutTenantInput, SubscriptionUncheckedUpdateWithoutTenantInput>
    create: XOR<SubscriptionCreateWithoutTenantInput, SubscriptionUncheckedCreateWithoutTenantInput>
  }

  export type SubscriptionUpdateWithWhereUniqueWithoutTenantInput = {
    where: SubscriptionWhereUniqueInput
    data: XOR<SubscriptionUpdateWithoutTenantInput, SubscriptionUncheckedUpdateWithoutTenantInput>
  }

  export type SubscriptionUpdateManyWithWhereWithoutTenantInput = {
    where: SubscriptionScalarWhereInput
    data: XOR<SubscriptionUpdateManyMutationInput, SubscriptionUncheckedUpdateManyWithoutTenantInput>
  }

  export type SubscriptionScalarWhereInput = {
    AND?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    OR?: SubscriptionScalarWhereInput[]
    NOT?: SubscriptionScalarWhereInput | SubscriptionScalarWhereInput[]
    id?: StringFilter<"Subscription"> | string
    tenant_id?: StringFilter<"Subscription"> | string
    plan?: EnumSubscriptionPlanFilter<"Subscription"> | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFilter<"Subscription"> | $Enums.SubscriptionStatus
    stripe_subscription_id?: StringNullableFilter<"Subscription"> | string | null
    stripe_price_id?: StringNullableFilter<"Subscription"> | string | null
    trial_ends_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_start?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    current_period_end?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    cancelled_at?: DateTimeNullableFilter<"Subscription"> | Date | string | null
    created_at?: DateTimeFilter<"Subscription"> | Date | string
    updated_at?: DateTimeFilter<"Subscription"> | Date | string
  }

  export type UserPermissionUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserPermissionWhereUniqueInput
    update: XOR<UserPermissionUpdateWithoutTenantInput, UserPermissionUncheckedUpdateWithoutTenantInput>
    create: XOR<UserPermissionCreateWithoutTenantInput, UserPermissionUncheckedCreateWithoutTenantInput>
  }

  export type UserPermissionUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserPermissionWhereUniqueInput
    data: XOR<UserPermissionUpdateWithoutTenantInput, UserPermissionUncheckedUpdateWithoutTenantInput>
  }

  export type UserPermissionUpdateManyWithWhereWithoutTenantInput = {
    where: UserPermissionScalarWhereInput
    data: XOR<UserPermissionUpdateManyMutationInput, UserPermissionUncheckedUpdateManyWithoutTenantInput>
  }

  export type UserPermissionScalarWhereInput = {
    AND?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
    OR?: UserPermissionScalarWhereInput[]
    NOT?: UserPermissionScalarWhereInput | UserPermissionScalarWhereInput[]
    id?: StringFilter<"UserPermission"> | string
    tenant_id?: StringFilter<"UserPermission"> | string
    company_id?: StringFilter<"UserPermission"> | string
    user_id?: StringFilter<"UserPermission"> | string
    product_id?: StringFilter<"UserPermission"> | string
    permission?: StringFilter<"UserPermission"> | string
    granted_by?: StringFilter<"UserPermission"> | string
    created_at?: DateTimeFilter<"UserPermission"> | Date | string
    updated_at?: DateTimeFilter<"UserPermission"> | Date | string
  }

  export type CompanyUpsertWithWhereUniqueWithoutTenantInput = {
    where: CompanyWhereUniqueInput
    update: XOR<CompanyUpdateWithoutTenantInput, CompanyUncheckedUpdateWithoutTenantInput>
    create: XOR<CompanyCreateWithoutTenantInput, CompanyUncheckedCreateWithoutTenantInput>
  }

  export type CompanyUpdateWithWhereUniqueWithoutTenantInput = {
    where: CompanyWhereUniqueInput
    data: XOR<CompanyUpdateWithoutTenantInput, CompanyUncheckedUpdateWithoutTenantInput>
  }

  export type CompanyUpdateManyWithWhereWithoutTenantInput = {
    where: CompanyScalarWhereInput
    data: XOR<CompanyUpdateManyMutationInput, CompanyUncheckedUpdateManyWithoutTenantInput>
  }

  export type CompanyScalarWhereInput = {
    AND?: CompanyScalarWhereInput | CompanyScalarWhereInput[]
    OR?: CompanyScalarWhereInput[]
    NOT?: CompanyScalarWhereInput | CompanyScalarWhereInput[]
    id?: StringFilter<"Company"> | string
    tenant_id?: StringFilter<"Company"> | string
    name?: StringFilter<"Company"> | string
    subdomain?: StringNullableFilter<"Company"> | string | null
    cnpj?: StringNullableFilter<"Company"> | string | null
    status?: EnumCompanyStatusFilter<"Company"> | $Enums.CompanyStatus
    created_at?: DateTimeFilter<"Company"> | Date | string
    updated_at?: DateTimeFilter<"Company"> | Date | string
  }

  export type ProductConfigUpsertWithWhereUniqueWithoutTenantInput = {
    where: ProductConfigWhereUniqueInput
    update: XOR<ProductConfigUpdateWithoutTenantInput, ProductConfigUncheckedUpdateWithoutTenantInput>
    create: XOR<ProductConfigCreateWithoutTenantInput, ProductConfigUncheckedCreateWithoutTenantInput>
  }

  export type ProductConfigUpdateWithWhereUniqueWithoutTenantInput = {
    where: ProductConfigWhereUniqueInput
    data: XOR<ProductConfigUpdateWithoutTenantInput, ProductConfigUncheckedUpdateWithoutTenantInput>
  }

  export type ProductConfigUpdateManyWithWhereWithoutTenantInput = {
    where: ProductConfigScalarWhereInput
    data: XOR<ProductConfigUpdateManyMutationInput, ProductConfigUncheckedUpdateManyWithoutTenantInput>
  }

  export type ProductConfigScalarWhereInput = {
    AND?: ProductConfigScalarWhereInput | ProductConfigScalarWhereInput[]
    OR?: ProductConfigScalarWhereInput[]
    NOT?: ProductConfigScalarWhereInput | ProductConfigScalarWhereInput[]
    id?: StringFilter<"ProductConfig"> | string
    tenant_id?: StringFilter<"ProductConfig"> | string
    product_key?: StringFilter<"ProductConfig"> | string
    config?: JsonFilter<"ProductConfig">
    is_active?: BoolFilter<"ProductConfig"> | boolean
    created_at?: DateTimeFilter<"ProductConfig"> | Date | string
    updated_at?: DateTimeFilter<"ProductConfig"> | Date | string
  }

  export type TenantCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionCreateNestedManyWithoutTenantInput
    companies?: CompanyCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutTenantInput
    companies?: CompanyUncheckedCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsersInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
  }

  export type UserPermissionCreateWithoutUserInput = {
    id?: string
    company_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUser_permissionsInput
  }

  export type UserPermissionUncheckedCreateWithoutUserInput = {
    id?: string
    tenant_id: string
    company_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionCreateOrConnectWithoutUserInput = {
    where: UserPermissionWhereUniqueInput
    create: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput>
  }

  export type UserPermissionCreateManyUserInputEnvelope = {
    data: UserPermissionCreateManyUserInput | UserPermissionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserMembershipCreateWithoutUserInput = {
    id?: string
    tenant_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    company: CompanyCreateNestedOneWithoutMembershipsInput
  }

  export type UserMembershipUncheckedCreateWithoutUserInput = {
    id?: string
    tenant_id: string
    company_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipCreateOrConnectWithoutUserInput = {
    where: UserMembershipWhereUniqueInput
    create: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput>
  }

  export type UserMembershipCreateManyUserInputEnvelope = {
    data: UserMembershipCreateManyUserInput | UserMembershipCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutUsersInput = {
    update: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsersInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type TenantUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutTenantNestedInput
    companies?: CompanyUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutTenantNestedInput
    companies?: CompanyUncheckedUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserPermissionUpsertWithWhereUniqueWithoutUserInput = {
    where: UserPermissionWhereUniqueInput
    update: XOR<UserPermissionUpdateWithoutUserInput, UserPermissionUncheckedUpdateWithoutUserInput>
    create: XOR<UserPermissionCreateWithoutUserInput, UserPermissionUncheckedCreateWithoutUserInput>
  }

  export type UserPermissionUpdateWithWhereUniqueWithoutUserInput = {
    where: UserPermissionWhereUniqueInput
    data: XOR<UserPermissionUpdateWithoutUserInput, UserPermissionUncheckedUpdateWithoutUserInput>
  }

  export type UserPermissionUpdateManyWithWhereWithoutUserInput = {
    where: UserPermissionScalarWhereInput
    data: XOR<UserPermissionUpdateManyMutationInput, UserPermissionUncheckedUpdateManyWithoutUserInput>
  }

  export type UserMembershipUpsertWithWhereUniqueWithoutUserInput = {
    where: UserMembershipWhereUniqueInput
    update: XOR<UserMembershipUpdateWithoutUserInput, UserMembershipUncheckedUpdateWithoutUserInput>
    create: XOR<UserMembershipCreateWithoutUserInput, UserMembershipUncheckedCreateWithoutUserInput>
  }

  export type UserMembershipUpdateWithWhereUniqueWithoutUserInput = {
    where: UserMembershipWhereUniqueInput
    data: XOR<UserMembershipUpdateWithoutUserInput, UserMembershipUncheckedUpdateWithoutUserInput>
  }

  export type UserMembershipUpdateManyWithWhereWithoutUserInput = {
    where: UserMembershipScalarWhereInput
    data: XOR<UserMembershipUpdateManyMutationInput, UserMembershipUncheckedUpdateManyWithoutUserInput>
  }

  export type UserMembershipScalarWhereInput = {
    AND?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
    OR?: UserMembershipScalarWhereInput[]
    NOT?: UserMembershipScalarWhereInput | UserMembershipScalarWhereInput[]
    id?: StringFilter<"UserMembership"> | string
    tenant_id?: StringFilter<"UserMembership"> | string
    user_id?: StringFilter<"UserMembership"> | string
    company_id?: StringFilter<"UserMembership"> | string
    role?: EnumUserMembershipRoleFilter<"UserMembership"> | $Enums.UserMembershipRole
    is_active?: BoolFilter<"UserMembership"> | boolean
    created_at?: DateTimeFilter<"UserMembership"> | Date | string
    updated_at?: DateTimeFilter<"UserMembership"> | Date | string
  }

  export type TenantCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionCreateNestedManyWithoutTenantInput
    companies?: CompanyCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutSubscriptionsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutTenantInput
    companies?: CompanyUncheckedCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutSubscriptionsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
  }

  export type TenantUpsertWithoutSubscriptionsInput = {
    update: XOR<TenantUpdateWithoutSubscriptionsInput, TenantUncheckedUpdateWithoutSubscriptionsInput>
    create: XOR<TenantCreateWithoutSubscriptionsInput, TenantUncheckedCreateWithoutSubscriptionsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutSubscriptionsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutSubscriptionsInput, TenantUncheckedUpdateWithoutSubscriptionsInput>
  }

  export type TenantUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutTenantNestedInput
    companies?: CompanyUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutSubscriptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutTenantNestedInput
    companies?: CompanyUncheckedUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateWithoutUser_permissionsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    companies?: CompanyCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUser_permissionsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    companies?: CompanyUncheckedCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUser_permissionsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUser_permissionsInput, TenantUncheckedCreateWithoutUser_permissionsInput>
  }

  export type UserCreateWithoutUser_permissionsInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    memberships?: UserMembershipCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutUser_permissionsInput = {
    id?: string
    tenant_id: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    memberships?: UserMembershipUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutUser_permissionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUser_permissionsInput, UserUncheckedCreateWithoutUser_permissionsInput>
  }

  export type TenantUpsertWithoutUser_permissionsInput = {
    update: XOR<TenantUpdateWithoutUser_permissionsInput, TenantUncheckedUpdateWithoutUser_permissionsInput>
    create: XOR<TenantCreateWithoutUser_permissionsInput, TenantUncheckedCreateWithoutUser_permissionsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUser_permissionsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUser_permissionsInput, TenantUncheckedUpdateWithoutUser_permissionsInput>
  }

  export type TenantUpdateWithoutUser_permissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    companies?: CompanyUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUser_permissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    companies?: CompanyUncheckedUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserUpsertWithoutUser_permissionsInput = {
    update: XOR<UserUpdateWithoutUser_permissionsInput, UserUncheckedUpdateWithoutUser_permissionsInput>
    create: XOR<UserCreateWithoutUser_permissionsInput, UserUncheckedCreateWithoutUser_permissionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUser_permissionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUser_permissionsInput, UserUncheckedUpdateWithoutUser_permissionsInput>
  }

  export type UserUpdateWithoutUser_permissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    memberships?: UserMembershipUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutUser_permissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: UserMembershipUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TenantCreateWithoutCompaniesInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutCompaniesInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutTenantInput
    product_configs?: ProductConfigUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutCompaniesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutCompaniesInput, TenantUncheckedCreateWithoutCompaniesInput>
  }

  export type UserMembershipCreateWithoutCompanyInput = {
    id?: string
    tenant_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutMembershipsInput
  }

  export type UserMembershipUncheckedCreateWithoutCompanyInput = {
    id?: string
    tenant_id: string
    user_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipCreateOrConnectWithoutCompanyInput = {
    where: UserMembershipWhereUniqueInput
    create: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput>
  }

  export type UserMembershipCreateManyCompanyInputEnvelope = {
    data: UserMembershipCreateManyCompanyInput | UserMembershipCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutCompaniesInput = {
    update: XOR<TenantUpdateWithoutCompaniesInput, TenantUncheckedUpdateWithoutCompaniesInput>
    create: XOR<TenantCreateWithoutCompaniesInput, TenantUncheckedCreateWithoutCompaniesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutCompaniesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutCompaniesInput, TenantUncheckedUpdateWithoutCompaniesInput>
  }

  export type TenantUpdateWithoutCompaniesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutCompaniesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutTenantNestedInput
    product_configs?: ProductConfigUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserMembershipUpsertWithWhereUniqueWithoutCompanyInput = {
    where: UserMembershipWhereUniqueInput
    update: XOR<UserMembershipUpdateWithoutCompanyInput, UserMembershipUncheckedUpdateWithoutCompanyInput>
    create: XOR<UserMembershipCreateWithoutCompanyInput, UserMembershipUncheckedCreateWithoutCompanyInput>
  }

  export type UserMembershipUpdateWithWhereUniqueWithoutCompanyInput = {
    where: UserMembershipWhereUniqueInput
    data: XOR<UserMembershipUpdateWithoutCompanyInput, UserMembershipUncheckedUpdateWithoutCompanyInput>
  }

  export type UserMembershipUpdateManyWithWhereWithoutCompanyInput = {
    where: UserMembershipScalarWhereInput
    data: XOR<UserMembershipUpdateManyMutationInput, UserMembershipUncheckedUpdateManyWithoutCompanyInput>
  }

  export type UserCreateWithoutMembershipsInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
    user_permissions?: UserPermissionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMembershipsInput = {
    id?: string
    tenant_id: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMembershipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
  }

  export type CompanyCreateWithoutMembershipsInput = {
    id?: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
    tenant: TenantCreateNestedOneWithoutCompaniesInput
  }

  export type CompanyUncheckedCreateWithoutMembershipsInput = {
    id?: string
    tenant_id: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CompanyCreateOrConnectWithoutMembershipsInput = {
    where: CompanyWhereUniqueInput
    create: XOR<CompanyCreateWithoutMembershipsInput, CompanyUncheckedCreateWithoutMembershipsInput>
  }

  export type UserUpsertWithoutMembershipsInput = {
    update: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
    create: XOR<UserCreateWithoutMembershipsInput, UserUncheckedCreateWithoutMembershipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMembershipsInput, UserUncheckedUpdateWithoutMembershipsInput>
  }

  export type UserUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CompanyUpsertWithoutMembershipsInput = {
    update: XOR<CompanyUpdateWithoutMembershipsInput, CompanyUncheckedUpdateWithoutMembershipsInput>
    create: XOR<CompanyCreateWithoutMembershipsInput, CompanyUncheckedCreateWithoutMembershipsInput>
    where?: CompanyWhereInput
  }

  export type CompanyUpdateToOneWithWhereWithoutMembershipsInput = {
    where?: CompanyWhereInput
    data: XOR<CompanyUpdateWithoutMembershipsInput, CompanyUncheckedUpdateWithoutMembershipsInput>
  }

  export type CompanyUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutCompaniesNestedInput
  }

  export type CompanyUncheckedUpdateWithoutMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutProduct_configsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionCreateNestedManyWithoutTenantInput
    companies?: CompanyCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutProduct_configsInput = {
    id?: string
    name: string
    slug: string
    status?: $Enums.TenantStatus
    clerk_org_id?: string | null
    stripe_customer_id?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    subscriptions?: SubscriptionUncheckedCreateNestedManyWithoutTenantInput
    user_permissions?: UserPermissionUncheckedCreateNestedManyWithoutTenantInput
    companies?: CompanyUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutProduct_configsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutProduct_configsInput, TenantUncheckedCreateWithoutProduct_configsInput>
  }

  export type TenantUpsertWithoutProduct_configsInput = {
    update: XOR<TenantUpdateWithoutProduct_configsInput, TenantUncheckedUpdateWithoutProduct_configsInput>
    create: XOR<TenantCreateWithoutProduct_configsInput, TenantUncheckedCreateWithoutProduct_configsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutProduct_configsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutProduct_configsInput, TenantUncheckedUpdateWithoutProduct_configsInput>
  }

  export type TenantUpdateWithoutProduct_configsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUpdateManyWithoutTenantNestedInput
    companies?: CompanyUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutProduct_configsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumTenantStatusFieldUpdateOperationsInput | $Enums.TenantStatus
    clerk_org_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    subscriptions?: SubscriptionUncheckedUpdateManyWithoutTenantNestedInput
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutTenantNestedInput
    companies?: CompanyUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type UserCreateManyTenantInput = {
    id?: string
    clerk_user_id: string
    email: string
    name: string
    role?: $Enums.UserRole
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type SubscriptionCreateManyTenantInput = {
    id?: string
    plan?: $Enums.SubscriptionPlan
    status?: $Enums.SubscriptionStatus
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    trial_ends_at?: Date | string | null
    current_period_start?: Date | string | null
    current_period_end?: Date | string | null
    cancelled_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionCreateManyTenantInput = {
    id?: string
    company_id: string
    user_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CompanyCreateManyTenantInput = {
    id?: string
    name: string
    subdomain?: string | null
    cnpj?: string | null
    status?: $Enums.CompanyStatus
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ProductConfigCreateManyTenantInput = {
    id?: string
    product_key: string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_permissions?: UserPermissionUpdateManyWithoutUserNestedInput
    memberships?: UserMembershipUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user_permissions?: UserPermissionUncheckedUpdateManyWithoutUserNestedInput
    memberships?: UserMembershipUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clerk_user_id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumSubscriptionPlanFieldUpdateOperationsInput | $Enums.SubscriptionPlan
    status?: EnumSubscriptionStatusFieldUpdateOperationsInput | $Enums.SubscriptionStatus
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_price_id?: NullableStringFieldUpdateOperationsInput | string | null
    trial_ends_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUser_permissionsNestedInput
  }

  export type UserPermissionUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CompanyUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: UserMembershipUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    memberships?: UserMembershipUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type CompanyUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    cnpj?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumCompanyStatusFieldUpdateOperationsInput | $Enums.CompanyStatus
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductConfigUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    product_key?: StringFieldUpdateOperationsInput | string
    config?: JsonNullValueInput | InputJsonValue
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionCreateManyUserInput = {
    id?: string
    tenant_id: string
    company_id: string
    product_id: string
    permission: string
    granted_by: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipCreateManyUserInput = {
    id?: string
    tenant_id: string
    company_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserPermissionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUser_permissionsNestedInput
  }

  export type UserPermissionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPermissionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    product_id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    granted_by?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: CompanyUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type UserMembershipUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    company_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipCreateManyCompanyInput = {
    id?: string
    tenant_id: string
    user_id: string
    role?: $Enums.UserMembershipRole
    is_active?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserMembershipUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMembershipsNestedInput
  }

  export type UserMembershipUncheckedUpdateWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMembershipUncheckedUpdateManyWithoutCompanyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenant_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    role?: EnumUserMembershipRoleFieldUpdateOperationsInput | $Enums.UserMembershipRole
    is_active?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TenantCountOutputTypeDefaultArgs instead
     */
    export type TenantCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CompanyCountOutputTypeDefaultArgs instead
     */
    export type CompanyCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CompanyCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TenantDefaultArgs instead
     */
    export type TenantArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TenantDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SubscriptionDefaultArgs instead
     */
    export type SubscriptionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SubscriptionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserPermissionDefaultArgs instead
     */
    export type UserPermissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserPermissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GravityAdminPermissionDefaultArgs instead
     */
    export type GravityAdminPermissionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GravityAdminPermissionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CompanyDefaultArgs instead
     */
    export type CompanyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CompanyDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserMembershipDefaultArgs instead
     */
    export type UserMembershipArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserMembershipDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductConfigDefaultArgs instead
     */
    export type ProductConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductConfigDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StripeEventDefaultArgs instead
     */
    export type StripeEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StripeEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SupplierTenantAccessDefaultArgs instead
     */
    export type SupplierTenantAccessArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SupplierTenantAccessDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ServiceTokenDefaultArgs instead
     */
    export type ServiceTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ServiceTokenDefaultArgs<ExtArgs>

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