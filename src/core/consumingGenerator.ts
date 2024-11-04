import EventEmitter from "node:events";
import { Consumer } from "kafkajs";
import { BatchResult, TopicUnit } from "../types";
import { logInfo, promisifyListener } from '../utils/utils';

export async function* messageGenerator(
  consumer: Consumer,
  topics: string[],
  options: { completeTimeout: number } = { completeTimeout: 600_000 },
) {
  let hasMessages = true;

  const consumerMessages = ConsumerMessages.init(consumer, topics, options);

  while (hasMessages) {
    consumerMessages.resume();

    const [data, destroyData] = promisifyListener(consumerMessages, 'data');
    const [done, destroyDone] = promisifyListener(consumerMessages, 'done');

    const result = (await Promise.race([data, done])) as BatchResult;

    [destroyData, destroyDone].forEach(fn => fn());

    if (result instanceof Error) {
      console.error(result);
      logInfo('Error when listening to data events');
      yield result;
    } else if ("done" in result) {
      hasMessages = false;
      yield null;
    } else {
      yield result;
    }
  }
}

class ConsumerMessages extends EventEmitter {
  private consumer: Consumer;
  private topics: TopicUnit[];
  private options: { completeTimeout: number };
  private timeout: NodeJS.Timeout | null;
  private isStarted: boolean;
  private isPaused: boolean;

  constructor(
    consumer: Consumer,
    topics: string[],
    options: { completeTimeout: number },
  ) {
    super();
    this.consumer = consumer;
    this.topics = topics.map((topic) => ({ topic }));
    this.options = options;
    this.timeout = null;
    this.isStarted = false;
    this.isPaused = false;
  }

  static init(
    consumer: Consumer,
    topics: string[],
    options: { completeTimeout: number },
  ) {
    logInfo('Initializing the consumer event')
    return new ConsumerMessages(consumer, topics, options);
  }

  start() {
    logInfo('Starting to pulling messages')
    this.initCounting();
    this.isStarted = true;
    this.consumer.run({
      eachBatchAutoResolve: true,
      eachMessage: async ({
        message,
        topic,
        partition,
      }) => {
        logInfo('Got batch message', message.offset)
        this.resetCounting();
        this.emit("data", { message, topic, partition });
        this.initCounting();
      },
    });
  }

  initCounting() {
    logInfo('counting...')
    this.resetCounting();
    this.timeout = setTimeout(
      () => this.emit("done", { done: true }),
      this.options.completeTimeout,
    );
  }

  resetCounting() {
    logInfo('reseting...')
    if (!this.timeout) {
      return;
    }

    clearTimeout(this.timeout);
  }

  pause() {
    logInfo('pausing...')
    this.consumer.pause(this.topics);
    this.isPaused = true;
  }

  resume() {
    logInfo('resuming...')
    if (!this.isStarted) {
      return this.start();
    }

    if (!this.isPaused) {
      return;
    }

    this.consumer.resume(this.topics);
    this.isPaused = false;
  }
}
