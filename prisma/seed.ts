import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to encrypt credentials token
function encryptToken(text: string): string {
  const encKey = process.env.ENCRYPTION_KEY || "0123456789bcfdab0123456789abcdef0123456789abcdef0123456789abcdef";
  const key = Buffer.from(encKey, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create SQL tables and dummy records in database
  console.log("🛠️ Setting up SQL tables...");
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    INSERT INTO products (name, stock, price)
    VALUES 
      ('iPhone 15 Pro', 100, 999.99),
      ('MacBook Pro 16', 50, 2499.99),
      ('AirPods Pro', 200, 249.99)
    ON CONFLICT (name) DO UPDATE 
    SET stock = EXCLUDED.stock, price = EXCLUDED.price;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(100) UNIQUE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO invoices (invoice_number, amount, status)
    VALUES 
      ('INV-2026-001', 999.99, 'paid'),
      ('INV-2026-002', 2499.99, 'pending'),
      ('INV-2026-003', 499.98, 'paid')
    ON CONFLICT (invoice_number) DO UPDATE 
    SET amount = EXCLUDED.amount, status = EXCLUDED.status;
  `);

  console.log("✅ SQL tables and data set up successfully!");

  // 2. Create Test User
  const email = "test@flowforge.com";
  const password = "password123";
  const username = "testuser";
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert user
  console.log(`👤 Upserting test user: ${email}...`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      passwordHash,
    },
    create: {
      username,
      email,
      passwordHash,
    },
  });

  // 3. Create Test Project
  console.log("📦 Creating test project...");
  
  // Let's delete any old seed projects to avoid accumulation
  const oldProjects = await prisma.project.findMany({
    where: { ownerId: user.id, name: "E-Commerce Core API Gateway" }
  });
  for (const op of oldProjects) {
    await prisma.project.delete({ where: { id: op.id } });
  }

  const project = await prisma.project.create({
    data: {
      name: "E-Commerce Core API Gateway",
      description: "Visual pipelines for payment processing, inventory status check, and logging audits",
      ownerId: user.id,
    },
  });

  // 4. Create Git Configuration
  console.log("🐙 Creating Git config...");
  const encryptedToken = encryptToken("ghp_dummytokentoenablelocalyzipdownload123");
  await prisma.gitConfiguration.create({
    data: {
      userId: user.id,
      provider: "GITHUB",
      accessToken: encryptedToken,
      repositoryName: "testowner/ecommerce-gateway",
      repositoryUrl: "https://github.com/testowner/ecommerce-gateway",
      isActive: true,
    },
  });

  // 5. Create Workflows
  console.log("⚡ Creating workflows...");

  // Workflow 1: Checkout Processing
  const checkoutNodes = [
    {
      id: "node_trigger",
      type: "triggerNode",
      position: { x: 100, y: 150 },
      data: { method: "POST", path: "/checkout" },
    },
    {
      id: "node_db",
      type: "databaseNode",
      position: { x: 400, y: 150 },
      data: { query: "SELECT stock, price FROM products WHERE name = $request.body.itemName LIMIT 1;" },
    },
    {
      id: "node_code",
      type: "customCodeNode",
      position: { x: 700, y: 150 },
      data: {
        code: "const dbResult = context.steps.node_db;\nconst requestBody = context.request.body;\n\nif (!dbResult || dbResult.length === 0) {\n  return { success: false, error: 'Product not found' };\n}\n\nconst product = dbResult[0];\nif (product.stock < requestBody.quantity) {\n  return { success: false, error: 'Insufficient inventory' };\n}\n\nreturn {\n  success: true,\n  totalPrice: Number(product.price) * requestBody.quantity,\n  itemName: requestBody.itemName,\n  quantity: requestBody.quantity\n};"
      },
    },
    {
      id: "node_response",
      type: "responseNode",
      position: { x: 1000, y: 150 },
      data: { statusCode: 200, body: "$steps.node_code" },
    },
  ];

  const checkoutEdges = [
    {
      id: "edge_1",
      source: "node_trigger",
      target: "node_db",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
    {
      id: "edge_2",
      source: "node_db",
      target: "node_code",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
    {
      id: "edge_3",
      source: "node_code",
      target: "node_response",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
  ];

  await prisma.workflow.create({
    data: {
      name: "Checkout Process",
      method: "POST",
      path: "/checkout",
      nodes: checkoutNodes,
      edges: checkoutEdges,
      isPublished: true,
      projectId: project.id,
    },
  });

  // Workflow 2: Get Invoices
  const invoicesNodes = [
    {
      id: "node_trigger",
      type: "triggerNode",
      position: { x: 100, y: 150 },
      data: { method: "GET", path: "/invoices" },
    },
    {
      id: "node_db",
      type: "databaseNode",
      position: { x: 450, y: 150 },
      data: { query: "SELECT * FROM invoices ORDER BY amount DESC;" },
    },
    {
      id: "node_response",
      type: "responseNode",
      position: { x: 800, y: 150 },
      data: { statusCode: 200, body: "$steps.node_db" },
    },
  ];

  const invoicesEdges = [
    {
      id: "edge_1",
      source: "node_trigger",
      target: "node_db",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
    {
      id: "edge_2",
      source: "node_db",
      target: "node_response",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
  ];

  await prisma.workflow.create({
    data: {
      name: "Get Invoices List",
      method: "GET",
      path: "/invoices",
      nodes: invoicesNodes,
      edges: invoicesEdges,
      isPublished: true,
      projectId: project.id,
    },
  });

  // Workflow 3: Diagnostics
  const diagNodes = [
    {
      id: "node_trigger",
      type: "triggerNode",
      position: { x: 100, y: 150 },
      data: { method: "GET", path: "/status" },
    },
    {
      id: "node_code",
      type: "customCodeNode",
      position: { x: 450, y: 150 },
      data: { code: "return {\n  status: 'operational',\n  timestamp: new Date().toISOString()\n};" },
    },
    {
      id: "node_response",
      type: "responseNode",
      position: { x: 800, y: 150 },
      data: { statusCode: 200, body: "$steps.node_code" },
    },
  ];

  const diagEdges = [
    {
      id: "edge_1",
      source: "node_trigger",
      target: "node_code",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
    {
      id: "edge_2",
      source: "node_code",
      target: "node_response",
      animated: true,
      style: { stroke: "#6366f1", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed", color: "#6366f1" },
    },
  ];

  await prisma.workflow.create({
    data: {
      name: "Diagnostics Status",
      method: "GET",
      path: "/status",
      nodes: diagNodes,
      edges: diagEdges,
      isPublished: true,
      projectId: project.id,
    },
  });

  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
