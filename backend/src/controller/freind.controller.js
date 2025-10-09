import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchUsers = AsyncHandler(async (req, res) => {
  try {
    const limit = 10;
    const cursor = req.query.cursor || null;

    const allUsers = await prisma.user.findMany({
      take: limit,
      ...(cursor &&
        cursor !== "undefined" && { skip: 1, cursor: { id: cursor } }),
      where: {
        id: {
          not: req.user.id,
        },
        conversations: {
          none: {
            conversation: {
              participants: {
                some: {
                  userId: req.user.id,
                },
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const nextCursor =
      allUsers.length === limit ? allUsers[allUsers.length - 1].id : null;
    return res.status(200).json(
      new ApiResponse(200, "User Fetched Successfully", {
        allUsers,
        nextCursor,
      })
    );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Something went wrong while fetching user", error);
  }
});

export const addUsers = AsyncHandler(async (req, res) => {
  const { IdtoAdd } = req.body;
  const currentUserId = req.user.id;

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        every: {
          OR: [{ userId: currentUserId }, { userId: IdtoAdd }],
        },
      },
    },
  });

  if (existingConversation) {
    return res.status(200).json(
      new ApiResponse(200, "Conversation already exists", {
        conversation: existingConversation,
      })
    );
  }

  const newConversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      createdBy: currentUserId,
      participants: {
        create: [
          { user: { connect: { id: currentUserId } } },
          { user: { connect: { id: IdtoAdd } } },
        ],
      },
    },
    include: {
      participants: { include: { user: true } },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, "New conversation Created Successfully", {
      conversation: newConversation,
    })
  );
});

export const FriendList = AsyncHandler(async (req, res) => {
  try {
    const friends = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        conversations: {
          some: {
            conversation: {
              participants: {
                some: {
                  userId: req.user.id,
                },
              },
            },
          },
        },
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Friends Fetched Successfully", friends));
  } catch (error) {
    throw new ApiError(500, "Unable to find Friends", error);
  }
});

export const removeFriend = AsyncHandler(async (req, res) => {
  const { IdtobeRemoved } = req.body;
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          some: {
            userId: IdtobeRemoved,
          },
        },
      },
      select: { id: true },
    });
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    await prisma.conversation.delete({
      where: { id: conversation.id },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Friend removed Successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went Wrong While Removing Friend");
  }
});
