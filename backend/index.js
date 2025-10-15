import { app } from "./src/app.js";
import http from "http";
import dotenv from "dotenv";
import { initWebSocket } from "./src/websockets/index.js"; // PascalCase
import { connectKafka, setupKafkaTopics } from "./src/kafka/index.js";
import { runConsumer } from "./src/kafka/consumer.js";
import { client } from "./src/redis/client.js";
import { checkAndFlush } from "./src/kafka/producer.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const wsServer = new initWebSocket(server);

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await setupKafkaTopics();
  await connectKafka();
  await runConsumer();
  startPeriodicFlush();
});

function startPeriodicFlush() {
  setInterval(async () => {
    try {
      const chatKeys = await client.keys("chat:*:message");

      console.log(
        `🔄 Checking ${chatKeys.length} active conversations for flush...`
      );

      for (const key of chatKeys) {
        const conversationId = key.split(":")[1];
        await checkAndFlush(conversationId);
      }
    } catch (error) {
      console.error("❌ Error in periodic flush:", error);
    }
  }, 60 * 1000);
}
