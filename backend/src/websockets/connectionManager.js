import { ApiError } from "../utils/ApiError.js";
import { client } from "../redis/client.js";

export class ConnectionManager {
  #USER_SOCKET_KEY = "ws:user:sockets:";
  #SOCKET_USER_KEY = "ws:socket:user:";

  async addConnection(userId, socket) {
    try {
      const newConnection = await client.sadd(
        `${this.#USER_SOCKET_KEY}${userId}`,
        socket.id
      );
      await client.set(`${this.#SOCKET_USER_KEY}${socket.id}`, userId);

      console.log(`New connection Added`, newConnection);
    } catch (error) {
      console.error("Error", error);
      throw new ApiError(500, "Error adding connection:", error);
    }
  }

  async removeConnection(socketId, io) {
    try {
      const user = await client.get(`${this.#SOCKET_USER_KEY}${socketId}`);
      await client.srem(`${this.#USER_SOCKET_KEY}${user}`, socketId);
      await client.del(`${this.#SOCKET_USER_KEY}${socketId}`);

      console.log(`✓ Connection removed: User ${user} -> Socket ${socketId}`);
    } catch (error) {
      console.error("Error removing connection:", error);
    }
  }

  async getUserSocket(userId) {
    try {
      return await client.smembers(`${this.#USER_SOCKET_KEY}${userId}`);
    } catch (error) {
      console.error("Error getting user sockets", error);
      return [];
    }
  }

  async hasConnections(userId) {
    try {
      console.log(userId);
      const count = await client.scard(`${this.#USER_SOCKET_KEY}${userId}`);
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async getUserBySocket(socketId) {
    try {
      return await client.get(`${this.#SOCKET_USER_KEY}${socketId}`);
    } catch (error) {
      return null;
    }
  }
}
