export const timeout = (time: number): Promise<Error> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT_ERROR'));
    }, time)
);