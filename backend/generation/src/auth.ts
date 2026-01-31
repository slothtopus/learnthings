import type { FastifyReply, FastifyRequest } from "fastify";

import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth as _getAuth } from "firebase-admin/auth";

if (!!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  // When running the auth emulator in Docker, the CLI is unauthenticated so defaults to 'demo-no-project'
  initializeApp({ projectId: "demo-no-project" });
  console.log(
    `[firebase] Using Auth Emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
  );
} else {
  const decoded = Buffer.from(
    process.env.FIREBASE_CONFIG_JSON!,
    "base64",
  ).toString("utf-8");
  const creds = JSON.parse(decoded);
  initializeApp({
    credential: admin.credential.cert(creds),
    projectId: creds.project_id,
  });
}

export const getAuth = () => _getAuth();

export const verifyIdToken = async (token: string) => {
  const { uid } = await _getAuth().verifyIdToken(token);
  return uid;
};

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

function unauthorized(reply: FastifyReply) {
  return reply.code(401).send({ error: "Unauthorized" });
}

// ---- Auth preHandler hook ----
export async function requireFirebaseAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.method === "OPTIONS") return;
  
  const authHeader = request.headers.authorization;
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!idToken) return unauthorized(reply);

  try {
    const decoded = await verifyIdToken(idToken);
    if (!decoded) return unauthorized(reply);

    request.userId = decoded;
  } catch (err) {
    request.log.warn({ err }, "Invalid Firebase auth token");
    return unauthorized(reply);
  }
}
