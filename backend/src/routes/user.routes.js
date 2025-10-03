import { Router } from "express";
import { signInUser, signUpUser } from "../controller/user.controller.js";

const router = Router();

router.post("/sign-up/email", signUpUser);
router.post("/sign-in/email", signInUser);

export default router;
