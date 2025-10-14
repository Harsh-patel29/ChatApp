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

export { kafka, producer, consumer, connectKafka };
