import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const loadEnv = () => {
  const paths = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", ".env"),
  ];
  for (const envPath of paths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }
};
loadEnv();

const requiredEnv = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error("❌ Environment validation failed!");
  console.error(`Missing keys: ${missingEnv.join(", ")}`);
  process.exit(1);
}

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  encryptionKey: process.env.ENCRYPTION_KEY as string,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  // 🇮🇳 Hackathon BharatCode AI Integration (Qwen 3.8 27B - https://bharatcode.ai/api/model/v1)
  bharatcode: {
    apiKey: process.env.BHARATCODE_API_KEY || "",
    baseUrl: process.env.BHARATCODE_BASE_URL || "https://bharatcode.ai/api/model/v1",
    model: process.env.BHARATCODE_MODEL || "qwen-3.8-27b",
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "dualithjbsnap@gmail.com",
  },
};