import { Batch, KafkaMessage } from 'kafkajs';

export type AppParams = {
  [key: string]: string | undefined;
}

export type TopicUnit = {
  topic: string;
}

export type BatchResult = MessageResult | Batch | Error | { done: boolean };

export type MessageResult = {
  message: KafkaMessage;
  topic: string;
  partition: string;
}
