import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../libs/hashPassword.js";
import { SendEmail, emailVerificationContent } from "./nodemailer.js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 900,
    password: {
      hash: async (password) => {
        const hashedPassword = await hashPassword(password);
        return hashedPassword;
      },
      verify: async ({ hash, password }) => {
        return await verifyPassword(hash, password);
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const template = emailVerificationContent(user.name, url);
      await SendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the button to verify your email: ${url}`,
        mailgenContent: template,
      });
    },
  },
  session: {
    expiresIn: 604800,
    updateAge: 86400,
    storeSessionInDatabase: true,
    preserveSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        //TODO:- Do some task before deleting
      },
      afterDelete: async (user) => {
        // TODO:- Perform cleanup after user deletion
      },
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "twitter", "email-password"],
      allowDifferentEmails: false,
    },
    updateAccountOnSignIn: true,
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      disableImplicitSignUp: true,
    },
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    modelName: "rateLimit",
  },
});
