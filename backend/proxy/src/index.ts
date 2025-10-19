// src/index.ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "node-fetch";
import { createUser, verifyIdToken } from "./firebase";
import { FirebaseAuthError } from "firebase-admin/auth";

const COUCHDB_URL = process.env.COUCHDB_URL;
const couchDBAuthHeaders = {
  Authorization:
    "Basic " +
    btoa(`${process.env.COUCH_USER}:${process.env.COUCH_PASSWORD}`),
};

const app = express();
app.use(cors());
app.disable("x-powered-by");

const fakeAuthMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.header("x-user-id");
  console.log("fakeAuthMiddleware:", userId);

  // If there's no user ID, you could reject the request here.
  if (!userId) {
    res.status(401).json({ error: "Unauthorized: No x-user-id provided" });
    return;
  }

  // Attach userId to the request object so subsequent middleware can see it
  // (We'll attach it as a custom property, so we cast `req` as any)
  (req as any).userId = userId;
  next();
};

const firebaseAuthMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.header("Authorization")?.replace("Bearer ", "");

  //console.log(`firebaseAuthMiddleware: "${authToken}"`);

  if (!authToken) {
    res.status(401).json({ error: "Unauthorized: No Authorization provided" });
    return;
  }

  try {
    const userId = await verifyIdToken(authToken);
    (req as any).userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ error: `Unauthorized: ${err}` });
    return;
  }
};

app.post("/register", express.json(), async (req: Request, res: Response) => {
  const { username, password } = req.body;

  console.log("/register", username, password, req.body);

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({
      error: {
        code: "malformed",
        message: "Username and password must be strings.",
      },
    });
    return;
  }

  try {
    const user = await createUser(username, password);
    res.status(201).json({ userId: user.uid });
  } catch (err) {
    console.error("Error registering user:", err);
    if (err instanceof FirebaseAuthError) {
      res.status(500).json({ error: { code: err.code, message: err.message } });
    } else {
      res.status(500).json({
        error: { code: "unknown", message: "Failed to register user" },
      });
    }
  }
});

//app.use(fakeAuthMiddleware);
app.use(firebaseAuthMiddleware);

/**
 * 1) Handle the /_all_dbs route:
 *    - Fetch the full list of dbs from CouchDB
 *    - Filter out any databases not matching "<userId>_..."
 *    - Return only the filtered list
 */
app.get("/_all_dbs", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    //console.log("/_all_dbs:", userId, req.path);

    // Call CouchDB's /_all_dbs
    const response = await fetch(
      `${COUCHDB_URL}/_all_dbs?startkey="${userId}$"`,
      {
        method: "GET",
        headers: couchDBAuthHeaders,
      }
    );
    if (!response.ok) {
      res
        .status(response.status)
        .json({ error: "Unable to retrieve databases from CouchDB" });
      return;
    }

    // Full list of databases
    const allDbs = await response.json();
    //console.log("allDbs = ", allDbs);

    // Filter out any DB names not starting with "<userId>_"
    const filteredDbs = (allDbs as string[]).filter((db) =>
      db.startsWith(`${userId}$`)
    );

    res.json(filteredDbs);
  } catch (error) {
    console.error("Error fetching /_all_dbs from CouchDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 2) For all other routes (e.g., /<db_name>/_design/... etc.),
 *    - Determine the database name from the path
 *    - Check if it matches the user’s "<userId>_<something>"
 *    - If it does, allow the request to pass through to CouchDB
 *    - Otherwise, return 403 Forbidden
 *
 *    We’ll create a small middleware that checks the DB name in req.path
 *    before proxying the request.
 */
function dbAccessCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).userId;

  // req.path might look like: "/<dbName>/...".
  // The part before the second slash is the DB name (if any).
  // e.g. if req.path = "/alice_db1/_design/someDesignDoc"
  // then dbName = "alice_db1"
  const segments = req.path.split("/").filter(Boolean); // split and remove empty
  const dbName = segments[0]?.replace("%24", "$");
  //console.log("dbAccessCheckMiddleware:", userId, dbName, req.path);

  // If it's something like "/_session" or any other special route,
  // you might want to allow or handle separately. Adjust as needed.
  // e.g. you might want to pass /_session to CouchDB for authentication:
  if (dbName === undefined || dbName.startsWith("_")) {
    return next(); // let it pass or do something special
  }

  // If the user is trying to access a db name that doesn't match userId, deny
  if (dbName && !dbName.startsWith(`${userId}$`)) {
    res
      .status(403)
      .json({ error: "Forbidden: You do not have access to this database" });
    return;
  }

  // Otherwise all good, proceed to proxy
  next();
}

const addCouchAuthHeader = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  delete req.headers["authorization"];
  delete req.headers["Authorization"];
  req.headers["Authorization"] = couchDBAuthHeaders["Authorization"];
  next();
};

app.use(
  "/",
  dbAccessCheckMiddleware,
  addCouchAuthHeader,
  createProxyMiddleware({
    target: COUCHDB_URL,
    changeOrigin: true,
    pathRewrite: (path) => path,
    on: {
      /*proxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy req] ${req.method} ${req.originalUrl} ${req.url}`);
        console.log(req.headers);
      },*/
      proxyRes: (proxyRes, req, res) => {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      },
    },
  })
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CouchDB proxy listening on port ${PORT}`);
});
