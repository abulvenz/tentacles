import m from "mithril";
import tagl from "tagl-mithril";
import io from "socket.io/client-dist/socket.io";

const { div, h1, p, pre } = tagl(m);
const socket = io();

let code = "";
m.request("/some").then((res) => {
  code = res;
});


socket.on("connect", () => {
  const userID =
    localStorage.getItem("id") || localStorage.setItem("id", socket.id);
  socket.emit("i am", { id: userID });
});


m.mount(document.body, {
  view: (vnode) =>
    div([
      h1("Tentacle testbed"),
      p("This is a paragraph."),
      pre(m("code", code)),
    ]),
});
