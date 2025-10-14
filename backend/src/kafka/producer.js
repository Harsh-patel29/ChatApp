import { producer } from "./index.js";
import { client } from "../redis/client.js";

const lastFlushTimes = new Map();

export const checkAndFlush = async (conversationId) => {
  try {
    const key = `chat:${conversationId}:message`;
    const chatMessages = await client.lrange(key, 0, -1);
    if (chatMessages.length === 0) return;

    const lastFlushTime = lastFlushTimes.get(conversationId) || 0;
    const timeSinceLastFlush = Date.now() - lastFlushTime;
    const threeMinutes = 3 * 60 * 1000;

    if (chatMessages.length >= 150 || timeSinceLastFlush >= threeMinutes) {
      console.log(
        `🚀 Flushing ${chatMessages.length} messages for conversation ${conversationId}`
      );

      await producer.send({
        topic: "save-chat-message",
        messages: [
          {
            key: conversationId,
            value: JSON.stringify({
              conversationId,
              messages: chatMessages,
              timestamp: Date.now(),
              count: chatMessages.length,
            }),
          },
        ],
      });

      await client.del(key);
      lastFlushTimes.set(conversationId, Date.now());

      console.log(
        `✅ Successfully flushed ${chatMessages.length} messages for conversation ${conversationId}`
      );
    }
  } catch (error) {
    console.error(
      `❌ Error flushing messages for conversation ${conversationId}:`,
      error
    );
  }
};
