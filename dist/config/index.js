import dotenv from "dotenv";
dotenv.config();
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
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
};
