import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';

export class TestEnvironment {
  private mongoServer: MongoMemoryServer;
  private redisContainer: StartedTestContainer;
  private kafkaContainer: StartedTestContainer;
  public redis: Redis;
  public kafka: Kafka;

  async setup() {
    // Start MongoDB Memory Server
    this.mongoServer = await MongoMemoryServer.create();
    const mongoUri = this.mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Start Redis Container
    this.redisContainer = await new GenericContainer('redis:6')
      .withExposedPorts(6379)
      .start();

    // Start Kafka Container
    this.kafkaContainer = await new GenericContainer('confluentinc/cp-kafka:latest')
      .withEnvironment({
        'KAFKA_ADVERTISED_LISTENERS': 'PLAINTEXT://localhost:9092',
        'KAFKA_LISTENER_SECURITY_PROTOCOL_MAP': 'PLAINTEXT:PLAINTEXT',
        'KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR': '1'
      })
      .withExposedPorts(9092)
      .start();

    // Initialize Redis client
    this.redis = new Redis({
      host: this.redisContainer.getHost(),
      port: this.redisContainer.getMappedPort(6379)
    });

    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: 'test-client',
      brokers: [`localhost:${this.kafkaContainer.getMappedPort(9092)}`]
    });

    return {
      mongoUri,
      redisUrl: `redis://${this.redisContainer.getHost()}:${this.redisContainer.getMappedPort(6379)}`,
      kafkaHost: `localhost:${this.kafkaContainer.getMappedPort(9092)}`
    };
  }

  async cleanup() {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    await this.redis.disconnect();
    await this.redisContainer.stop();
    await this.kafkaContainer.stop();
  }
}