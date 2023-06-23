import { Mutex } from "async-mutex";
import { Result, failure, success } from "../../../shared/utils/Result";
import { AsyncCrdAPI } from "./storage-apis";

type Store<T> = {
  data: Map<string, T>;
  mutex: Mutex;
};

export const createStore = <T>(): Store<T> => ({
  data: new Map(),
  mutex: new Mutex(),
});

export const create = async <T>(
  store: Store<T>,
  key: string,
  value: T
): Promise<Result<T>> => {
  const release = await store.mutex.acquire();
  try {
    if (store.data.has(key)) {
      return failure("Key already exists");
    }
    store.data.set(key, value);
    return success(value);
  } finally {
    release();
  }
};

export const read = async <T>(
  store: Store<T>,
  key: string
): Promise<Result<T>> => {
  const release = await store.mutex.acquire();
  try {
    if (!store.data.has(key)) {
      return failure("Key does not exist");
    }
    return success(store.data.get(key)!);
  } finally {
    release();
  }
};

export const deleteKey = async <T>(
  store: Store<T>,
  key: string
): Promise<Result<T>> => {
  const release = await store.mutex.acquire();
  try {
    if (!store.data.has(key)) {
      return failure("Key does not exist");
    }
    const value = store.data.get(key)!;
    store.data.delete(key);
    return success(value);
  } finally {
    release();
  }
};

export const createAPI = <T>(store: Store<T>): AsyncCrdAPI<T> => ({
  create: (key, value) => create(store, key, value),
  read: (key) => read(store, key),
  deleteKey: (key) => deleteKey(store, key),
});
