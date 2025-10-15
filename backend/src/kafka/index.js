import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-app-message-group" });

const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log("✅ Kaflka Producer & consumer Connected");
  } catch (error) {
    console.error("❌ Kafka Connection Error", error);
  }
};

const setupKafkaTopics = async () => {
  const admin = kafka.admin();

  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();

    if (existingTopics.includes("save-chat-message")) {
      console.log("✅ Kafka topic 'save-chat-message' already exists");
      return;
    }

    console.log("📋 Creating Kafka topics...");

    await admin.createTopics({
      topics: [
        {
          topic: "save-chat-message",
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: "retention.ms", value: "3600000" },
            { name: "segment.bytes", value: "104857600" },
            { name: "cleanup.policy", value: "delete" },
          ],
        },
      ],
    });
    console.log("✅ Kafka topics created successfully");
  } catch (error) {
    console.error("❌ Error setting up Kafka topics:", error.message);
  } finally {
    await admin.disconnect();
  }
};

export { kafka, producer, consumer, connectKafka, setupKafkaTopics };
