import express from "express";
import { createServer } from "node:http";
import { auth } from "express-openid-connect";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import m from "mithril";
import { env } from "custom-env";
// import * as jsonpatch from "fast-json-patch/index.mjs";

import persistence from "./persistence.mjs";
env();

console.log(await persistence.objects.loadAllKeys());
const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(
  auth({
    authRequired: true,
    idpLogout: true,
    routes: {
      login: "/login",
      logout: "/logout",
      postLogoutRedirect: "http://localhost:4000",
    },
  })
);

app.get("/", (req, res) => {
  console.log(req.oidc.user)
  res.cookie("session", req.oidc.user.sub);

  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.get("/some", (req, res) => {
  res.send(
    JSON.stringify(
      m(
        "pre",
        [
          "console.log('Hello, world!');",
          "console.log('This is a paragraph.');",
        ].map((v) => m("div", m("code", v)))
      )
    )
  );
});

app.use(express.static("dist"));

const range = (N) => {
  const r = [];
  for (let i = 0; i < N; i++) {
    r.push(i);
  }
  return r;
};

const randomInt = (N) => Math.trunc(Math.random() * N);

const use = (v, f) => f(v);

const shuffle = (arr, r = []) =>
  use(
    arr.map((e) => e),
    (a) => range(arr.length).map((i) => a.splice(randomInt(a.length), 1)[0])
  );

const users = [];

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("i am", async (msg) => {
    console.log("i am", msg);
    if (!users.includes(msg.id)) users.push(msg.id);
    console.log("users", users);

  });

  socket.on("disconnect", () => {});

  socket.on("game", async (msg) => {});

  socket.on("select", async (msg) => {});

  socket.on("enter game", async (msg) => {});
});

server.listen(4000, () => {
  console.log("server running at http://localhost:4000");
});
