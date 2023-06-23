export type Result<TSuccess> =
  | {
      kind: "success";
      value: TSuccess;
    }
  | {
      kind: "failure";
      msg: string;
    };

export const success = <TSuccess>(value: TSuccess): Result<TSuccess> => ({
  kind: "success",
  value,
});

export const failure = (error: string): Result<never> => ({
  kind: "failure",
  msg: error,
});

export const map =
  <TSuccess, TNewSuccess>(
    fn: (value: TSuccess) => TNewSuccess
  ): ((result: Result<TSuccess>) => Result<TNewSuccess>) =>
  (result) =>
    result.kind === "success" ? success(fn(result.value)) : result;

export const mapAsync =
  <TSuccess, TNewSuccess>(
    fn: (value: TSuccess) => Promise<TNewSuccess>
  ): ((result: Result<TSuccess>) => Promise<Result<TNewSuccess>>) =>
  async (result) =>
    result.kind === "success" ? success(await fn(result.value)) : result;

export const bind =
  <TSuccess, TNewSuccess>(
    fn: (value: TSuccess) => Result<TNewSuccess>
  ): ((result: Result<TSuccess>) => Result<TNewSuccess>) =>
  (result) =>
    result.kind === "success" ? fn(result.value) : result;

export const bindAsync =
  <TSuccess, TNewSuccess>(
    fn: (value: TSuccess) => Promise<Result<TNewSuccess>>
  ): ((result: Result<TSuccess>) => Promise<Result<TNewSuccess>>) =>
  async (result) =>
    result.kind === "success" ? await fn(result.value) : result;

export function combine<T1, T2>(
  result1: Result<T1>,
  result2: Result<T2>
): Result<[T1, T2]> {
  if (result1.kind === "failure") {
    return { kind: "failure", msg: result1.msg };
  }
  if (result2.kind === "failure") {
    return { kind: "failure", msg: result2.msg };
  }
  return { kind: "success", value: [result1.value, result2.value] };
}

export const combine3 = <T1, T2, T3>(
  result1: Result<T1>,
  result2: Result<T2>,
  result3: Result<T3>
): Result<[T1, T2, T3]> => {
  if (result1.kind === "failure") {
    return { kind: "failure", msg: result1.msg };
  }
  if (result2.kind === "failure") {
    return { kind: "failure", msg: result2.msg };
  }
  if (result3.kind === "failure") {
    return { kind: "failure", msg: result3.msg };
  }
  return {
    kind: "success",
    value: [result1.value, result2.value, result3.value],
  };
};

export const process = <TSuccess, TOnSuccess, TOnFailure>(
  result: Result<TSuccess>,
  onSuccess: (value: TSuccess) => TOnSuccess,
  onFailure: (msg: string) => TOnFailure
) =>
  result.kind === "success" ? onSuccess(result.value) : onFailure(result.msg);
