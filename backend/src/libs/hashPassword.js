import bcrypjs from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const hashPassword = async (password) => {
  const salt = await bcrypjs.genSalt(10);
  const hashedPassword = await bcrypjs.hash(password, salt);
  return hashedPassword;
};

export const verifyPassword = async (hash, password) => {
  return await bcrypjs.compare(password, hash);
};
