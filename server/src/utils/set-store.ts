import { Mutex } from "async-mutex";
import { Result, failure, success } from "../../../shared/utils/Result";
import { AsyncUniqueValueStoreAPI } from "./storage-apis";

type Store<T> = {
  data: Set<T>;
  mutex: Mutex;
};

export const createStore = <T>(): Store<T> => ({
  data: new Set(),
  mutex: new Mutex(),
});

export const create = async <T>(
  store: Store<T>,
  tryGenValue: () => T
): Promise<T> => {
  const release = await store.mutex.acquire();
  try {
    let value = tryGenValue();
    while (store.data.has(value)) {
      value = tryGenValue();
    }
    store.data.add(value);
    return value;
  } finally {
    release();
  }
};

export const release = async <T>(
  store: Store<T>,
  value: T
): Promise<Result<T>> => {
  const release = await store.mutex.acquire();
  try {
    if (!store.data.has(value)) {
      return failure("Value does not exist");
    }
    store.data.delete(value);
    return success(value);
  } finally {
    release();
  }
};

export const createAPI = <T>(
  store: Store<T>,
  tryGenValue: () => T
): AsyncUniqueValueStoreAPI<T> => ({
  create: () => create(store, tryGenValue),
  release: (value) => release(store, value),
});
