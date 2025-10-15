import { Server } from "socket.io";
import { ConnectionManager } from "./connectionManager.js";
import { SendMessage } from "./handlers/messageHandler.js";
import { StausHandler } from "./handlers/statusHandler.js";

export class initWebSocket {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    this.connectionManager = new ConnectionManager();
    this.sendMessage = new SendMessage();
    this.statushandler = new StausHandler();
    this.#setupMiddleware();
    this.#setupEventHandler();
  }

  #setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication token missing"));
        }

        socket.userId = token.user.id;
        socket.username = token.user.name;

        next();
      } catch (error) {
        next(Error("Authentication Failed"));
      }
    });
  }

  #setupEventHandler() {
    this.io.on("connection", async (socket) => {
      const userId = socket.userId;
      const username = socket.username;

      await this.connectionManager.addConnection(userId, socket);

      console.log(`User Connected: ${username} (${userId})`);

      socket.on("addfriend", async ({ friendIds, userId }) => {
        await this.statushandler.addFriend(friendIds, userId);
        await this.statushandler.getStatus(userId, this.io);
      });

      socket.on("user:typing", async ({ recieverId }) => {
        await this.statushandler.typing(recieverId, this.io);
      });

      socket.on("newMessage", async (data) => {
        await this.sendMessage.SendMessage(socket, data);
      });

      socket.on("joinConversation", ({ conversationId }) => {
        socket.join(conversationId);
      });

      socket.on("leaveConversation", ({ conversationId }) => {
        socket.leave(conversationId);
      });

      socket.on("disconnect", async () => {
        await this.connectionManager.removeConnection(socket.id, this.io);
        await this.statushandler.notifyOffline(userId, this.io);
      });

      socket.on("error", async (error) => console.log(error));
    });
  }

  getIO() {
    return this.io;
  }

  getConnectionManager() {
    return this.connectionManager;
  }
}
