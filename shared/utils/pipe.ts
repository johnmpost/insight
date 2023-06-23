export const pipe =
  <T>(...fns: Array<(x: T) => T>): ((x: T) => T) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);
