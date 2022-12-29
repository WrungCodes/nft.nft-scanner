interface FullRetrySettings {
    retry: number;
    sleep: number;
    failMessage: string;
    condition(value: any): Promise<boolean>;
}
  
export type RetrySettings = Partial<FullRetrySettings>;

export async function retryUntilSuccess(context: any, target: (...args: any[]) => Promise<any>, args: any[], retrySettings?: RetrySettings): Promise<any> {
    
    const DEFAULT_RETRY_SETTINGS: FullRetrySettings = {
      retry: 10,
      sleep: 30 * 1000,
      condition: async (value: any) => true,
      failMessage: `Function "${target.name}" called via retryUntilSuccess() failed`,
    };

    const settings: FullRetrySettings = { ...DEFAULT_RETRY_SETTINGS, ...retrySettings };

    let retryCount: number = settings.retry;

    while (true) {
      try {

        const result: any = await target.bind(context)(...args);

        if (!(await settings.condition(result))) {
          throw new Error(`Returned value ${result} does not meet the condition`);
        }

        return result;

      } catch (error) {

        console.error(`${settings.failMessage}. Sleep for ${settings.sleep}ms... Error:`, error);

        retryCount -= 1;

        if (retryCount <= 0) {
          throw error;
        }

        await sleep(settings.sleep);
      }
    }
}

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export const timeout = (time: number): Promise<Error> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      reject(new Error('REQUEST_TIMEOUT_ERROR'));
    }, time)
);
