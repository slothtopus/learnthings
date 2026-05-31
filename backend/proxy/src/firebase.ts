import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { CreateRequest } from "firebase-admin/auth";

import { customAlphabet } from "nanoid";
// we restrict user ids to a smaller range in order to interpolate them into couch database names,
// since couch has restrictions on the allowed characters
const nanoid = customAlphabet("0123456789_abcdefghijklmnopqrstuvwxyz-");


if (!!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  // When running the auth emulator in Docker, the CLI is unauthenticated so defaults to 'demo-no-project'
  initializeApp({projectId: "demo-no-project"});
  console.log(
    `[firebase] Using Auth Emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`
  );
} else {
  const decoded = Buffer.from(
    process.env.FIREBASE_CONFIG_JSON!,
    "base64"
  ).toString("utf-8");
  const creds = JSON.parse(decoded);
  initializeApp({
    credential: admin.credential.cert(creds),
    projectId: creds.project_id,
  });
}


export const verifyIdToken = async (token: string) => {
  const decoded = await getAuth().verifyIdToken(token);
  const couchId = decoded["couchId"] as string | undefined;
  return { uid: decoded.uid, couchId };
};

export const provisionUser = async (uid: string): Promise<string> => {
  const auth = getAuth();
  const user = await auth.getUser(uid);
  const existing = user.customClaims?.["couchId"] as string | undefined;
  if (existing) return existing;
  const couchId = `u${nanoid(21)}`;
  await auth.setCustomUserClaims(uid, { couchId });
  return couchId;
};


export const createUser = async (username: string, password: string) => {
  const auth = getAuth();
  return await auth.createUser({
    email: username,
    password: password,
  });
};
