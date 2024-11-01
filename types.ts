import { Batch } from 'kafkajs';

export type AppParams = {
  [key: string]: string | undefined;
}

export type TopicUnit = {
  topic: string;
}

export type BatchResult = Batch | Error | { done: boolean };
