type UnionToIntersection<Union> = (Union extends any
? (argument: Union) => void
: never) extends (argument: infer Intersection) => void
  ? Intersection
  : never;

type IteratorToObjectResult<T> = UnionToIntersection<
  T extends [infer K, infer V]
    ? K extends PropertyKey
      ? Record<K, V>
      : IteratorToAnyObjectResult<T>
    : IteratorToAnyObjectResult<T>
>;

type IteratorToAnyObjectResult<T> = T extends [keyof any, infer V]
  ? Record<keyof any, V>
  : never;

type FlatIterator1<T> = T extends Iterable<infer U> ? Iterator<U> : never;

type FlatIterator2<T> = T extends Iterable<Iterable<infer U>>
  ? Iterator<U>
  : never;

type FlatIterator3<T> = T extends Iterable<Iterable<Iterable<infer U>>>
  ? Iterator<U>
  : never;

type ChainApplyReturn<R> = Iterator<R extends Iterable<infer U> ? U : never>;

type CollectTo<T, C> = T extends readonly [infer K, infer V]
  ? C extends Map<unknown, unknown>
    ? Map<K, V>
    : C
  : C;

export class Iterator<T> implements IterableIterator<T> {
  constructor(base: Iterable<T>);

  public [Symbol.iterator](): IterableIterator<T>;

  public next(): IteratorResult<T>;

  public count(): number;

  public each(fn: (arg: T) => void): void;

  public each<U>(fn: (this: U, arg: T) => void, thisArg: U): void;

  public forEach(fn: (arg: T) => void): void;

  public forEach<U>(fn: (this: U, arg: T) => void, thisArg: U): void;

  public every(fn: (arg: T) => boolean): boolean;
  public every<U>(fn: (this: U, arg: T) => boolean, thisArg: U): boolean;

  public find(fn: (arg: T) => boolean): T | undefined;
  public find<U>(fn: (this: U, arg: T) => boolean, thisArg: U): T | undefined;

  public includes(element: T): boolean;

  public reduce<U>(reducer: (acc: U, value: T) => U, initialValue: U): U;
  public reduce(reducer: (acc: T, value: T) => T): T;

  public some(fn: (arg: T) => boolean): boolean;
  public some<U>(fn: (this: U, arg: T) => boolean, thisArg: U): boolean;

  public someCount(fn: (arg: T) => boolean, count: number): boolean;
  public someCount<U>(
    fn: (this: U, arg: T) => boolean,
    count: number,
    thisArg: U
  ): boolean;
  public collectTo<C>(
    CollectionClass: new (iterable: Iterable<T>) => CollectTo<T, C>
  ): CollectTo<T, C>;
  public collectWith<U>(obj: U, collector: (acc: U, value: T) => void): U;

  public toArray(): T[];

  public toObject(): IteratorToObjectResult<T>;

  public map<U>(mapper: (arg: T) => U): Iterator<U>;
  public map<U, V>(mapper: (this: V, arg: T) => U, thisArg: V): Iterator<U>;
  public filter<S extends T>(predicate: (arg: T) => arg is S): Iterator<S>;
  public filter(predicate: (arg: T) => boolean): Iterator<T>;
  public filter<U, S extends T>(
    predicate: (arg: T) => arg is S,
    thisArg: U
  ): Iterator<S>;
  public filter<U>(
    predicate: (this: U, arg: T) => boolean,
    thisArg: U
  ): Iterator<T>;
  public filterMap<U, V, W>(
    mapper: (this: V, arg: T) => U | W,
    thisArg: V,
    filterValue: W
  ): Iterator<U>;
  public filterMap<U, V>(
    mapper: (this: V, arg: T) => U | undefined,
    thisArg: V
  ): Iterator<U>;
  public filterMap<U>(mapper: (arg: T) => U | undefined): Iterator<U>;
  public flat(depth: 0): Iterator<T>;
  public flat(depth?: 1): FlatIterator1<T>;
  public flat(depth: 2): FlatIterator2<T>;
  public flat(depth: 3): FlatIterator3<T>;
  public flat(depth: number): Iterator<any>;

  public flatMap<U>(mapper: (arg: T) => Iterable<U>): Iterator<U>;
  public flatMap<U, V>(
    mapper: (this: V, arg: T) => Iterable<U>,
    thisArg: V
  ): Iterator<U>;

  public zip<U>(iterator: Iterable<U>): Iterator<[T, U]>;
  public zip<U, V>(
    ...iterators: [Iterable<U>, Iterable<V>]
  ): Iterator<[T, U, V]>;
  public zip<U, V, W>(
    ...iterators: [Iterable<U>, Iterable<V>, Iterable<W>]
  ): Iterator<[T, U, V, W]>;
  public zip(...iterators: Array<Iterable<any>>): Iterator<any[]>;

  // Replace manual types with variadic tuple when TS 4.0 is released.
  // https://github.com/microsoft/TypeScript/pull/39094
  // public static zip<U extends Array<any>>(
  //   ...iterators: U
  // ): Iterator<[T, ...U]>;

  public chain<V>(it: Iterable<V>): Iterator<T | V>;
  public chain(...iterators: Array<Iterable<T>>): Iterator<T>;

  public take(amount: number): Iterator<T>;

  public takeWhile(predicate: (arg: T) => boolean): Iterator<T>;
  public takeWhile<U>(
    predicate: (this: U, arg: T) => boolean,
    thisArg: U
  ): Iterator<T>;

  public skip(amount: number): Iterator<T>;

  public skipWhile(predicate: (arg: T) => boolean): Iterator<T>;
  public skipWhile<U>(
    predicate: (this: U, arg: T) => boolean,
    thisArg: U
  ): Iterator<T>;

  public enumerate(): Iterator<[number, T]>;

  public min(): T | undefined;
  public min<K>(accessor: (arg: T) => K): T | undefined;
  public min<K, U>(accessor: (this: U, arg: T) => K, thisArg: U): T | undefined;

  public max(): T | undefined;
  public max<K>(accessor: (arg: T) => K): T | undefined;
  public max<K, U>(accessor: (this: U, arg: T) => K, thisArg: U): T | undefined;

  public findCompare<K, U>(
    comparator: (this: U, arg1: K, arg2: K) => boolean,
    accessor: (this: U, arg: T) => K,
    thisArg: U
  ): T | undefined;
  public findCompare<K>(
    comparator: (arg1: K, arg2: K) => boolean,
    accessor: (arg: T) => K
  ): T | undefined;
  public findCompare(comparator: (arg1: T, arg2: T) => boolean): T | undefined;

  public partition(predicate: (arg: T) => boolean): [T[], T[]];
  public partition<L extends T, R extends T>(
    predicate: (arg: T) => boolean
  ): [L[], R[]];
  public partition(predicate: (arg: T) => number): Array<T[]>;
  public partition<U>(
    predicate: (this: U, arg: T) => number,
    thisArg: U
  ): Array<T[]>;

  public groupBy<K>(classifier: (arg: T) => K): Map<K, T[]>;
  public groupBy<K, U>(
    classifier: (this: U, arg: T) => K,
    thisArg: U
  ): Map<K, T[]>;

  public join(sep?: string, prefix?: string, suffix?: string): string;

  public apply<R>(fn: (arg: Iterator<T>) => R): R;

  public chainApply<R>(fn: (arg: Iterator<T>) => R): ChainApplyReturn<R>;

  public static range(
    start: number,
    stop?: number,
    step?: number
  ): Iterator<number>;

  public static zip<T, U>(
    base: Iterable<T>,
    iterator: Iterable<U>
  ): Iterator<[T, U]>;
  public static zip<T, U, V>(
    ...iterators: [Iterable<T>, Iterable<U>, Iterable<V>]
  ): Iterator<[T, U, V]>;
  public static zip<T, U, V, W>(
    ...iterators: [Iterable<T>, Iterable<U>, Iterable<V>, Iterable<W>]
  ): Iterator<[T, U, V, W]>;

  // Replace manual types with variadic tuple when TS 4.0 is released.
  // https://github.com/microsoft/TypeScript/pull/39094
  // public static zip<T, U extends Array<any>>(
  //   base: Iterable<T>,
  //   ...iterators: U
  // ): Iterator<[T, ...U]>;
}

export function iter<T>(base: Iterable<T>): Iterator<T>;

export function iterEntries<T extends object>(
  obj: T
): Iterator<[keyof T, T[keyof T]]>;

export function iterKeys<T extends object>(obj: T): Iterator<keyof T>;

export function iterValues<T extends object>(obj: T): Iterator<T[keyof T]>;
