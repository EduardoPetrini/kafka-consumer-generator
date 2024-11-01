import dotenv from 'dotenv';
dotenv.config();

import kafka, { Batch } from 'kafkajs';
import { checkParams, errorShutdown, logInfo, smoothShutdown } from './src/utils/utils';
import { getConsumer } from './src/kafka/consumer';
import { messageGenerator } from './src/core/consumingGenerator';
const { KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_TOPICS, KAFKA_GROUP_ID, COMPLETE_TIMEOUT } = process.env;

logInfo('Starting the app...');

const missingParams = checkParams({ KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_TOPICS, KAFKA_GROUP_ID });


(async () => {
  logInfo('Checking parameters...')
  if (missingParams.length > 0) {
    await errorShutdown(new Error('Missing parameters: ' + missingParams.toString()))
  }

  logInfo('Connecting the consumer to the', KAFKA_TOPICS);
  const consumer = await getConsumer({ KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_TOPICS, KAFKA_GROUP_ID });

  const topics = KAFKA_TOPICS?.split(',');
  if (!topics) {
    throw new Error('Missing Kafka topics field');
  }

  const completeTimeout = parseInt(COMPLETE_TIMEOUT || '10000')

  logInfo('Getting the generator')
  const gen = messageGenerator(consumer, topics, { completeTimeout });
  let count = 1;

  logInfo('Getting the', count, 'result')
  let result = await gen.next();
  if (result instanceof Error) {
    throw result;
  }

  if (!result.value) {
    logInfo('No more data to receive right now');
    await smoothShutdown();
  }

  const batchResult = result.value as unknown as Batch;
  logInfo(count, 'result', batchResult.lastOffset);

  while (!result.done) {
    result = await gen.next();
    if (result instanceof Error) {
      throw result;
    }

    if (!result.value) {
      logInfo('No more data to receive right now');
      await smoothShutdown();
    }

    const batchResult = result.value as unknown as Batch;
    logInfo(++count, 'result', batchResult.offsetLag(), batchResult.lastOffset(), batchResult.messages.length);
  }
})()
