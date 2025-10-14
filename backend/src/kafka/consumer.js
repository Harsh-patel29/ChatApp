import { consumer } from "./index.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const runConsumer = async () => {
  await consumer.subscribe({
    topic: "save-chat-message",
    fromBeginning: false,
  });

  console.log("✅ Consumer subscribed to save-chat-message topic");

  await consumer.run({
    eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
      console.log(
        `📦 Processing batch of ${batch.messages.length} kafka messages`
      );

      for (const kafkaMessage of batch.messages) {
        try {
          const data = JSON.parse(kafkaMessage.value.toString());
          const { conversationId, messages, count } = data;

          const messagesToInsert = messages.map((msg) => {
            const parsed = JSON.parse(msg);
            return {
              conversationId: parsed.conversationId,
              senderId: parsed.senderId,
              content: parsed.content,
              messageType: parsed.messageType || "TEXT",
              createdAt: new Date(parsed.timeStamp),
            };
          });

          const result = await prisma.message.createMany({
            data: messagesToInsert,
            skipDuplicates: true,
          });

          console.log(
            `✅ Inserted ${result.count} messages for conversation ${conversationId}`
          );

          resolveOffset(kafkaMessage.offset);
          await heartbeat();
        } catch (error) {
          console.error("❌ Error processing batch:", error);
        }
      }
    },
  });
};
