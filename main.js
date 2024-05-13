import m from "mithril";
import tagl from "tagl-mithril";
import io from "socket.io/client-dist/socket.io";

const { div, h1, p, pre, button ,a} = tagl(m);
const socket = io();

let code = "";
m.request("/some").then((res) => {
  code = res;
});

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
});

socket.on("disconnect", () => {
  setTimeout(() => location.reload(), 2000);
});

m.mount(document.body, {
  view: (vnode) =>
    div([
      h1("Tentacle testbed 2.0 " + cookieValue),
      p("This is a paragraph."),
      pre(m("code", code)),
     a({href:"/logout"},"Logout"),
    ]),
});
