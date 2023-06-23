import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { config } from "../../shared/config";
import {
  activateQuestion,
  checkActiveQuestion,
  checkSessionExists,
  closeQuestion,
  createSession,
  endSession,
  joinSession,
  respondToQuestion,
} from "./controllers/route-handlers";
import {
  createStore as createCrudStore,
  createAPI as createCrudAPI,
} from "./utils/key-value-store";
import { Session } from "../../shared/domain/Session";
import {
  createAPI as createUniqueValueStoreAPI,
  createStore as createUniqueValueStore,
} from "./utils/set-store";
import {
  createAPI as createCrdAPI,
  createStore as createCrdStore,
} from "./utils/mutable-key-value-store";
import { customHeaders, generateSessionCode } from "./utils/route-utils";

// server configuration
const port = 4000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.clientHostname,
  },
});
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", config.clientHostname);
  const allowedHeaders = [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    ...customHeaders,
  ];
  res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../client/build")));

const sessionsRepo = createCrudAPI(createCrudStore<Session>());
const sessionCodesRepo = createUniqueValueStoreAPI(
  createUniqueValueStore<string>(),
  generateSessionCode
);
const sessionTimersRepo = createCrdAPI(createCrdStore<NodeJS.Timer>());

// api routes
app.get("/api/test", (req, res) => {
  return res.send("Hello World!");
});
app.post("/api/session", createSession(sessionsRepo, io, sessionCodesRepo));
app.get("/api/sessionExists/:sessionCode", checkSessionExists(sessionsRepo));
app.delete(
  "/api/session/:sessionCode",
  endSession(sessionsRepo, io, sessionCodesRepo)
);
app.post(
  "/api/session/:sessionCode/participants",
  joinSession(sessionsRepo, io)
);
app.post(
  "/api/session/:sessionCode/activeQuestion",
  activateQuestion(sessionsRepo, io, sessionTimersRepo)
);
app.delete(
  "/api/session/:sessionCode/activeQuestion",
  closeQuestion(sessionsRepo, io, sessionTimersRepo)
);
app.put(
  "/api/session/:sessionCode/responses",
  respondToQuestion(sessionsRepo, io)
);
app.get(
  "/api/session/:sessionCode/checkActiveQuestion",
  checkActiveQuestion(sessionsRepo, io)
);

// client app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

// start server
server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
