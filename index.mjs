import express from "express";
import { createServer } from "node:http";
import { auth } from "express-openid-connect";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import m from "mithril";
import { env } from "custom-env";
import applyPatch  from "fast-json-patch";

import persistence from "./persistence.mjs";
env();

console.log(await persistence.objects.loadAllKeys());
const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

const USE_AUTH = false;

if (USE_AUTH)
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
  if (USE_AUTH) {
    console.log(req.oidc.user);
    res.cookie("session", req.oidc.user.sub);
  }
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
        ].map((v) => m("div", m("code", { onclick: (e) => console.log(e) }, v)))
      )
    )
  );
});

app.use(express.static("dist"));

const users = [];

const state = {
  general: [
    { id: 1, text: "Initial TODO", completed: false },
    { id: 2, text: "Another TODO", completed: false },
  ],
  users: [
    {
      name: "alice",
      todos: [{ id: 3, text: "Alice's TODO", completed: false }],
    },
    { name: "bob", todos: [] },
    { name: "Hans", todos: [] },
    { name: "Franz", todos: [] },
  ],
};



io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("i am", async (msg) => {
    console.log("i am", msg);
    if (!users.includes(msg.id)) users.push(msg.id);
    console.log("users", users);
  });

  socket.emit("state", state)

  socket.on("patch", msg => {
    console.log("patch", msg)
    applyPatch.applyPatch(state, msg, false, true)
    socket.emit("state", state)
  })

  socket.on("disconnect", () => {});
  socket.on("game", async (msg) => {});
  socket.on("select", async (msg) => {});
  socket.on("enter game", async (msg) => {});
});

server.listen(4000, () => {
  console.log("server running at http://localhost:4000");
});
