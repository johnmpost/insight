import { Result } from "../../../shared/utils/Result";

export type AsyncCrudAPI<T> = {
  create: (key: string, value: T) => Promise<Result<T>>;
  read: (key: string) => Promise<Result<T>>;
  update: (
    key: string,
    updateFn: (value: T) => Result<T>
  ) => Promise<Result<T>>;
  deleteKey: (key: string) => Promise<Result<T>>;
};

export type AsyncCrdAPI<T> = {
  create: (key: string, value: T) => Promise<Result<T>>;
  read: (key: string) => Promise<Result<T>>;
  deleteKey: (key: string) => Promise<Result<T>>;
};

export type AsyncUniqueValueStoreAPI<T> = {
  create: () => Promise<T>;
  release: (value: T) => Promise<Result<T>>;
};
