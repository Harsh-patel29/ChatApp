import { checkAndFlush } from "../../kafka/producer.js";
import { client } from "../../redis/client.js";

export class SendMessage {
  async SendMessage(socket, data) {
    try {
      const { conversationId, senderId, content, messageType } = data;
      const message = {
        conversationId,
        senderId,
        content,
        messageType,
        timeStamp: Date.now(),
      };
      console.log("📩 New Message:", message);

      const key = `chat:${conversationId}:message`;

      await client.rpush(key, JSON.stringify(message));

      socket.to(conversationId).emit("messageReceived", message);

      checkAndFlush(conversationId).catch((err) =>
        console.error("Error in checkAndFlush:", err)
      );
    } catch (error) {
      console.error("❌ Error saving message in redis:", err);
    }
  }
}
