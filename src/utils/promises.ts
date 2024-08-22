export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const postpone = <T>(fn: () => T, ms: number): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(async () => {
      resolve(await fn());
    }, ms);
  });
