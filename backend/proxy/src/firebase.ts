import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getAuth as _getAuth } from "firebase-admin/auth";

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

export const getAuth = () => _getAuth();

export const verifyIdToken = async (token: string) => {
  const { uid } = await _getAuth().verifyIdToken(token);
  return uid;
};

export const createUser = async (username: string, password: string) => {
  const auth = _getAuth();
  return await auth.createUser({
    // deck name must start with a letter in couch
    uid: `u${nanoid(21)}`,
    email: username,
    password: password,
  });
};
