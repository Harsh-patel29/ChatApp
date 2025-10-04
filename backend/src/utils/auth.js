import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../libs/hashPassword.js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
      // TODO:- Create A sendEmail method
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.FRONTEND_URL}/api/auth/callback/google`,
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
