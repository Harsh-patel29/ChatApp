import { Router } from "express";
import {
  fetchUsers,
  addUsers,
  FriendList,
  removeFriend,
} from "../controller/freind.controller.js";
import { verifySession } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/getUsers", verifySession, fetchUsers);
router.post("/addFriend", verifySession, addUsers);
router.get("/getFriend", verifySession, FriendList);
router.post("/removeFriend", verifySession, removeFriend);

export default router;
