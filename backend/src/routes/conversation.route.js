import { Router } from "express";
import {
  fetchConversation,
  fetchConversationParticipants,
} from "../controller/conversation.controller.js";
import { verifySession } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/messages", verifySession, fetchConversation);
router.get("/fetchConversation", verifySession, fetchConversationParticipants);

export default router;
