import { ConsumerConfig, Kafka, KafkaConfig } from 'kafkajs';
import { AppParams } from './types';
import { logInfo } from './utils';

export const getConsumer = async (params: AppParams) => {
  const brokers = params.KAFKA_BROKERS?.split(',');
  const clientId = params.KAFKA_CLIENT_ID;
  const topics = params.KAFKA_TOPICS?.split(',');
  const groupId = params.KAFKA_GROUP_ID;
  const connectionTimeout = parseInt(params.KAFKA_CONNECTION_TIMEOUT || '5000');
  const requestTimeout = parseInt(params.KAFKA_REQUEST_TIMEOUT || '30000');
  const sessionTimeout = parseInt(params.KAFKA_SESSION_TIMEOUT || '30000');

  if (!brokers || !clientId || !topics || !groupId) {
    logInfo(brokers, clientId, topics, groupId)
    throw new Error('Missing Kafka options fields');
  }

  const config: KafkaConfig = {
    brokers: [...brokers],
    clientId,
    connectionTimeout,
    requestTimeout,
  }

  const consumerConfig: ConsumerConfig = {
    groupId,
    sessionTimeout
  }

  const kafka = new Kafka(config);

  const consumer = kafka.consumer(consumerConfig);

  await consumer.connect();

  consumer.subscribe({ topics })

  return consumer;
}
