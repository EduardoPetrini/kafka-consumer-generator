import EventEmitter from 'node:events';
import { setTimeout } from 'timers/promises';
import { AppParams } from '../types';

export const logInfo = (...args: any[]) => {
  console.log(new Date().toLocaleString(), '[INFO]', ...args);
}

export const checkParams = (params: AppParams) => {
  const missingKeys = Object.keys(params).reduce((acc: string[], paramKey: string): string[] => {
    if (!params[paramKey]) {
      acc.push(paramKey);
    }

    return acc;
  }, []);

  return missingKeys;
}

export const smoothShutdown = async (code: number = 0) => {
  logInfo('App is shuting down in 3 seconds');
  await setTimeout(3000);

  logInfo('Bye!')

  process.exit(code)

}

export const errorShutdown = async (error: Error) => {
  console.error(error);
  await smoothShutdown(1);
}

export const promisifyListener = (eventInstance: EventEmitter, event: string): [Promise<unknown>, () => void] => {
  const callback = (resolve: (value: unknown) => void, reject: (reason: any) => void) => (data: unknown) => {
    if (data instanceof Error) {
      return reject(data)
    }

    resolve(data)
  }

  return [new Promise((resolve, reject) => {
    eventInstance.once(event, callback(resolve, reject))
  }), eventInstance.removeAllListeners.bind(eventInstance, event)]
}
