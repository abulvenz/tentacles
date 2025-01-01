import m from "mithril";
import tagl from "tagl-mithril";
import io from "socket.io/client-dist/socket.io";
import tentacle from "../tentacle.js";

const { div, h1, p, pre, button, a } = tagl(m);
const socket = io();

const _state = {};

const sendPatch = (patch) => {
  socket.emit("patch", patch);
};
const state = tentacle(_state, sendPatch);

const cookieValue = decodeURIComponent(
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("session="))
    ?.split("=")[1]
);

socket.on("connect", () => {
  const userID =
    localStorage.getItem("id") || localStorage.setItem("id", socket.id);
  socket.emit("i am", { id: userID });
  socket.on("state", (newState) => {
    Object.assign(_state, newState);
    m.redraw();
  });
});

socket.on("disconnect", () => {
  setTimeout(() => location.reload(), 2000);
});

m.mount(document.body, {
  view: (vnode) =>
    div([
      h1("Tentacle testbed 2.0 " + cookieValue),
      p("This is a paragraph."),
      a({ href: "/logout" }, "Logout"),
    ]),
});
