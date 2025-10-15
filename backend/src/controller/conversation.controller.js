import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PrismaClient } from "@prisma/client";
import { client } from "../redis/client.js";

const prisma = new PrismaClient();

export const fetchConversation = AsyncHandler(async (req, res) => {
  try {
    const limit = 10;
    const cursor = req.query.cursor || null;
    const conversationId = req.query.convId;
    const allMessages = await prisma.message.findMany({
      take: limit,
      ...(cursor &&
        cursor != "undefined" && { skip: 1, cursor: { id: cursor } }),
      where: {
        conversationId: conversationId,
        sender: {
          AND: {
            id: req.user.id,
          },
        },
      },
      orderBy: { id: "desc" },
    });
    const nextCursor =
      allMessages.length === limit
        ? allMessages[allMessages.length - 1].id
        : null;

    return res.status(200).json(
      new ApiResponse(200, "All Messages Fetched Successfuly", {
        allMessages,
        nextCursor,
      })
    );
  } catch (error) {
    throw new ApiError(500, "Failed to Fetch Messages", error);
  }
});

export const fetchConversationParticipants = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const cursor = req.query.cursor;
    const limit = 10;

    const allConversation = await prisma.conversation.findMany({
      take: limit,
      ...(cursor &&
        cursor !== "undefined" && { skip: 1, cursor: { id: cursor } }),
      where: {
        participants: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        participants: {
          where: {
            NOT: {
              userId: userId,
            },
          },
          include: {
            user: true,
          },
        },
      },
    });

    const nextCursor =
      allConversation.length === limit
        ? allConversation[allConversation.length - 1].id
        : null;

    return res.status(200).json(
      new ApiResponse(200, "All conversation Fetched Successfully", {
        allConversation,
        nextCursor,
      })
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching Conversations", error);
  }
});

export const getMessages = AsyncHandler(async (req, res) => {
  try {
    const cursor = req.query.cursor;
    const conversationId = req.query.conversationId;

    const key = `chat:${conversationId}:message`;

    const redisMessage = await client.lrange(key, 0, -1);
    const parsedRedisMessage = redisMessage.map((m) => JSON.parse(m));

    const limit = 10;

    const messages = await prisma.message.findMany({
      take: limit,
      where: { conversationId: conversationId },
      ...(cursor &&
        cursor != "undefined" && {
          skip: 1,
          cursor: { id: cursor },
        }),
      orderBy: { createdAt: "asc" },
    });

    const allMessages = [...messages, ...parsedRedisMessage].sort(
      (a, b) =>
        new Date(a.createdAt || a.timeStamp) -
        new Date(b.createdAt || b.timeStamp)
    );

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;
    return res.status(200).json(
      new ApiResponse(200, "Messages fetched Successfully", {
        allMessages,
        nextCursor,
      })
    );
  } catch (error) {
    throw new ApiError(500, "Error Fetching Messages", error);
  }
});
