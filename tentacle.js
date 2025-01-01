export const createRecursiveProxy = (target, addPatch, basePath = "") => {
  return new Proxy(target, {
    get(obj, prop) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      if (typeof obj[prop] === "object" && obj[prop] !== null) {
        return createRecursiveProxy(obj[prop], addPatch, path);
      }
      return obj[prop];
    },
    set(obj, prop, value) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      const oldValue = obj[prop];
      if (oldValue !== value) {
        obj[prop] = value;
        addPatch([{ op: "replace", path, value }]);
      }
      return true;
    },
    deleteProperty(obj, prop) {
      const path = `${basePath}/${prop}`.replace(/\/\/+/, "/");
      if (prop in obj) {
        delete obj[prop];
        addPatch([{ op: "remove", path }]);
      }
      return true;
    },
  });
};

const tentacle = (state, sendPatch) => {
  if (typeof state !== "object") {
    throw new Error("State must be an object");
  }
  if (typeof sendPatch !== "function") {
    throw new Error("sendPatch must be a function");
  }
  let transaction = [];
  const addPatch = (patch) => {
    patch.forEach(element => {
      transaction.push(element);
    });
  };
  const _start_transaction = () => {
    transaction = [];
    return transaction;
  };
  const _end_transaction = () => {
    const result = sendPatch(transaction);
    transaction = [];
    return { patch: result };
  };

  const proxy = createRecursiveProxy(state, addPatch);
  const handler = {
    get: (obj, prop) => {
      if (prop === "_start_transaction") {
        return _start_transaction;
      }
      if (prop === "_end_transaction") {
        return _end_transaction;
      }
      if (prop === "_transaction") {
        return transaction;
      }
      return proxy[prop];
    },
    set: (obj, prop, value) => {
      proxy[prop] = value;
      return true;
    },
    deleteProperty: (obj, prop) => {
      delete proxy[prop];
      return true;
    },
  };

  return new Proxy(state, handler);
};

export default tentacle;
