import { Router } from "express";
import {
  signInSocial,
  signInUser,
  signOut,
  signUpUser,
} from "../controller/user.controller.js";

const router = Router();

router.post("/sign-up/email", signUpUser);
router.post("/sign-in/email", signInUser);
router.post("/sign-in/social", signInSocial);
router.post("/sign-out", signOut);

export default router;
