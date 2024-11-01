# Kafka Consumer Generator

A TypeScript Node.js application that demonstrates an efficient way to consume Kafka messages using a generator-based approach. This implementation provides better control over message processing flow and resource management.

## Features

- Generator-based message consumption
- Configurable timeout for batch processing
- Graceful shutdown handling
- Environment variables configuration
- TypeScript support
- Automated batch message handling with proper offset management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to a Kafka cluster
- TypeScript knowledge

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
KAFKA_BROKERS=localhost:9092      # Comma-separated list of Kafka brokers
KAFKA_CLIENT_ID=my-consumer       # Client identifier
KAFKA_TOPICS=my-topic            # Comma-separated list of topics to consume
KAFKA_GROUP_ID=my-group          # Consumer group identifier
KAFKA_CONNECTION_TIMEOUT=5000    # Connection timeout in milliseconds (optional)
KAFKA_REQUEST_TIMEOUT=30000      # Request timeout in milliseconds (optional)
KAFKA_SESSION_TIMEOUT=30000      # Session timeout in milliseconds (optional)
COMPLETE_TIMEOUT=10000          # Timeout for batch completion in milliseconds (optional)
```

## Usage

Start the consumer:

```bash
npm start
```

## Architecture

### Key Components

1. **Consumer Setup** (`consumer.ts`)
   - Handles Kafka client configuration
   - Establishes connection to Kafka cluster
   - Manages consumer group subscription

2. **Message Generator** (`consumingGenerator.ts`)
   - Implements generator pattern for message consumption
   - Manages message batch processing
   - Handles timeout and completion events

3. **Main Process** (`index.ts`)
   - Orchestrates the consumer lifecycle
   - Processes message batches
   - Implements shutdown logic

4. **Utilities** (`utils.ts`)
   - Provides logging functionality
   - Handles parameter validation
   - Manages graceful shutdown
   - Contains event emitter utilities

5. **Types** (`types.ts`)
   - Defines TypeScript interfaces and types
   - Provides type safety across the application

## Message Processing Flow

1. The consumer connects to Kafka and subscribes to specified topics
2. The generator yields message batches as they arrive
3. Each batch is processed and logged
4. If no messages arrive within the completion timeout, the process gracefully shuts down

## Error Handling

The application includes comprehensive error handling:
- Connection errors
- Message processing errors
- Missing configuration errors
- Graceful shutdown on errors

## Type Definitions

The application uses the following type definitions (from `types.ts`):

```typescript
import { Batch } from 'kafkajs';

// Type for application parameters
export type AppParams = {
  [key: string]: string | undefined;
}

// Type for topic configuration
export type TopicUnit = {
  topic: string;
}

// Type for batch processing results
export type BatchResult = Batch | Error | { done: boolean };
```

These types are used to:
- `AppParams`: Define configuration parameters with flexible string keys
- `TopicUnit`: Define the structure for Kafka topic configuration
- `BatchResult`: Handle different outcomes from batch processing (successful batch, error, or completion)

## Dependencies

- `kafkajs`: Kafka client for Node.js
- `dotenv`: Environment variable management
- `typescript`: TypeScript support
- Development tools:
  - ESLint
  - Prettier
  - ts-node

## Development

### Scripts

- `npm start`: Start the application
- `npm test`: Run tests (placeholder)

### Code Style

The project uses ESLint and Prettier for code formatting. Configuration files are included in the repository.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC License

## Notes

- The generator approach provides better control over message consumption compared to traditional event-based consumers
- The application includes configurable timeouts to handle scenarios where message flow might stop
- Proper shutdown handling ensures no messages are lost when the application stops

For more information about the KafkaJS library, visit [KafkaJS Documentation](https://kafka.js.org/).
