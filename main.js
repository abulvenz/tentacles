import m from "mithril";
import tagl from "tagl-mithril";
import io from "socket.io/client-dist/socket.io";

const { div, h1, p, pre, button, a } = tagl(m);
const socket = io();

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

const state = {
  general: [],
  users: [],
};

socket.on("state", (msg) => {
  console.log("Received state", msg);

  state.general = msg.general;
  state.users = msg.users;
  m.redraw();
});

function createRecursiveProxy(target, basePath = "") {
  return new Proxy(target, {
    get(obj, prop) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      if (typeof obj[prop] === "object" && obj[prop] !== null) {
        return createRecursiveProxy(obj[prop], path);
      }
      return obj[prop];
    },
    set(obj, prop, value) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      const oldValue = obj[prop];
      if (oldValue !== value) {
        obj[prop] = value;
        sendPatch([{ op: "replace", path, value }]);
      }
      return true;
    },
    deleteProperty(obj, prop) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      if (prop in obj) {
        delete obj[prop];
        sendPatch([{ op: "remove", path }]);
      }
      return true;
    },
  });
}

function sendPatch(patch) {
  socket.emit("patch", patch);
}

const trackedState = createRecursiveProxy(state);

function view() {
  const rows = 3;
  const cols = Math.max(3, trackedState.users.length);

  const cells = [];
  const centerCell = Math.floor(rows / 2) * cols + Math.floor(cols / 2);

  for (let i = 0; i < rows * cols; i++) {
    if (i === centerCell) {
      cells.push(
        m("div.center-cell", [
          m("h2", "General TODOs"),
          m(
            "ul.general-list",
            {
              ondragover: (e) => e.preventDefault(),
              ondrop: (e) => onDrop(e, "general"),
              class: trackedState.general.length === 0 ? "empty-list" : "",
            },
            trackedState.general.map((todo) =>
              m(
                "li",
                {
                  key: todo.id,
                  draggable: true,
                  ondragstart: (e) => onDragStart(e, "general", todo.id),
                },
                todo.text
              )
            )
          ),
          m("div.add-todo", [
            m("input", {
              type: "text",
              placeholder: "Add new TODO",
              id: "new-todo-input",
            }),
            m("button", { onclick: addTodo }, "Add TODO"),
          ]),
        ])
      );
    } else {
      const userIndex = i < centerCell ? i : i - 1;
      const user = trackedState.users[userIndex];

      if (user) {
        cells.push(
          m("div.user-cell", [
            m("h3", user.name),
            m(
              "ul.user-list",
              {
                ondragover: (e) => e.preventDefault(),
                ondrop: (e) => onDrop(e, user.name),
                class: user.todos.length === 0 ? "empty-list" : "",
              },
              user.todos.map((todo) =>
                m(
                  "li",
                  {
                    key: todo.id,
                    draggable: true,
                    ondragstart: (e) => onDragStart(e, user.name, todo.id),
                  },
                  todo.text
                )
              )
            ),
          ])
        );
      } else {
        cells.push(m("div.empty-cell"));
      }
    }
  }

  return m("div.grid-container", { class: "grid" }, cells);
}

function addTodo() {
  const input = document.getElementById("new-todo-input");
  const text = input.value.trim();
  if (text) {
    trackedState.general.push({ id: Date.now(), text, completed: false });
    input.value = "";
    m.redraw();
  }
}

function onDragStart(e, fromList, todoId) {
  e.dataTransfer.setData("text/plain", JSON.stringify({ fromList, todoId }));
}

function onDrop(e, toList) {
  const { fromList, todoId } = JSON.parse(e.dataTransfer.getData("text/plain"));
  const fromArray =
    fromList === "general"
      ? trackedState.general
      : trackedState.users.find((u) => u.name === fromList).todos;
  const todo = fromArray.find((t) => t.id === todoId);
  const toArray =
    toList === "general"
      ? trackedState.general
      : trackedState.users.find((u) => u.name === toList).todos;

  if (todo) {
    fromArray.splice(fromArray.indexOf(todo), 1);
    toArray.push(todo);
    m.redraw();
  }
}

m.mount(document.body, { view });
