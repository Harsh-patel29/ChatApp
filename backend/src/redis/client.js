import { Redis } from "ioredis";

export const client = new Redis({ port: "6379", host: "redis" });
