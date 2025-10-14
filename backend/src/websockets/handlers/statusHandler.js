import { client } from "../../redis/client.js";

export class StausHandler {
  async addFriend(friendIds, userId) {
    for (const id of friendIds) {
      await client.sadd(`friends:${userId}`, id);
    }
  }

  async getStatus(userId, io) {
    const friends = await client.smembers(`friends:${userId}`);
    for (const friendId of friends) {
      const sockets = await client.smembers(`ws:user:sockets:${friendId}`);
      sockets.forEach((sid) => io.to(sid).emit("user:online", { userId }));
    }
  }

  async notifyOffline(userId, io) {
    const remainingSockets = await client.smembers(`ws:user:sockets:${userId}`);
    if (remainingSockets.length === 0) {
      const friends = await client.smembers(`friends:${userId}`);
      console.log(
        `User ${userId} went offline. Notifying ${friends.length} friends`
      );

      for (const friendId of friends) {
        const sockets = await client.smembers(`ws:user:sockets:${friendId}`);
        sockets.forEach((sid) => {
          io.to(sid).emit("user:offline", { userId });
        });
      }
    }
  }

  // for harsh patel to send typing i will need his socker id which will be get by ws:user:socket:userId

  async typing(recieverId, io) {
    const recieverSockets = await client.smembers(
      `ws:user:sockets:${recieverId}`
    );
    recieverSockets.forEach((sid) => {
      io.to(sid).emit("user:typing", { recieverId });
    });

    console.log("User typing sent to ", recieverSockets);
  }
}
