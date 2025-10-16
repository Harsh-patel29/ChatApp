# ChatApp — Real-time Chat Platform

A full-stack chat application with real-time messaging, user authentication, and scalable message persistence. The project includes a Next.js frontend and an Express + Prisma backend. It uses Redis for in-memory message buffering, Kafka for batching and reliably persisting messages, and Prisma with a Postgres-compatible database for storage. Authentication is powered by Better-Auth and supports email/password plus Google social sign-in.

Key features

```markdown
# ChatApp

Short recruiter-focused summary.

Technologies used

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express, Prisma
- Realtime: Socket.io
- Buffering & persistence: Redis (in-memory), Kafka (batching)
- Database: Postgres (via Prisma)
- Auth: Better-Auth (email/password + Google OAuth)
- Other: Cloudinary (media), Multer (uploads), Nodemailer (emails)

Key features

- Real-time 1:1 chat with Socket.io
- Message buffering in Redis and batched persisted to DB via Kafka
- Email verification and session-based authentication

If you want a demo or the deployment/migration details, I can share the run steps and env list separately.
```
