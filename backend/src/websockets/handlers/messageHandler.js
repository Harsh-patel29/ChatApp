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
      };
      console.log("📩 New Message:", message);
      const key = `chat:${conversationId}:messages`;
      await client.rpush(key, JSON.stringify(message));
      // Optional: emit message back to all clients in the room
      // socket.to(conversationId).emit("messageReceived", message);
      /*
       Todo:-
       Add the kafka producer and TTL in redis 
        */
    } catch (error) {
      console.error("❌ Error saving message in redis:", err);
    }
  }
}
