import { Mutex } from "async-mutex";
import { Result, failure, success } from "../../../shared/utils/Result";
import rfdc from "rfdc";
import { AsyncCrudAPI } from "./storage-apis";

const clone = rfdc();

type Store<T> = {
  data: Map<string, T>;
  mutex: Mutex;
};

export function createStore<T>(): Store<T> {
  return {
    data: new Map(),
    mutex: new Mutex(),
  };
}

export async function create<T>(
  store: Store<T>,
  key: string,
  value: T
): Promise<Result<T>> {
  const release = await store.mutex.acquire();
  try {
    if (store.data.has(key)) {
      return failure("Key already exists");
    }
    // this clone is to avoid accidents, theoretically we could remove it if we trust the caller
    store.data.set(key, clone(value));
    return success(clone(value));
  } finally {
    release();
  }
}

export async function read<T>(
  store: Store<T>,
  key: string
): Promise<Result<T>> {
  const release = await store.mutex.acquire();
  try {
    if (!store.data.has(key)) {
      return failure("Key does not exist");
    }
    return success(clone(store.data.get(key)!));
  } finally {
    release();
  }
}

export async function update<T>(
  store: Store<T>,
  key: string,
  updateFn: (value: T) => Result<T>
): Promise<Result<T>> {
  const release = await store.mutex.acquire();
  try {
    if (!store.data.has(key)) {
      return failure("Key does not exist");
    }
    const currentValue = store.data.get(key)!;
    // this clone is to avoid accidents, theoretically we could remove it if we trust the caller
    const updateResult = updateFn(clone(currentValue));
    if (updateResult.kind === "failure") {
      return updateResult;
    }
    store.data.set(key, updateResult.value);
    return success(clone(updateResult.value));
  } finally {
    release();
  }
}

export async function deleteKey<T>(
  store: Store<T>,
  key: string
): Promise<Result<T>> {
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
}

export function createAPI<T>(store: Store<T>): AsyncCrudAPI<T> {
  return {
    create: (key, value) => create(store, key, value),
    read: (key) => read(store, key),
    update: (key, updateFn) => update(store, key, updateFn),
    deleteKey: (key) => deleteKey(store, key),
  };
}
