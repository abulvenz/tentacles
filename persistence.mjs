import { createClient } from "redis";
const { keys } = Object;

const use_redis = true;

const dict = {};

const client = use_redis
  ? await createClient({
      url: "redis://localhost:6399",
      password: "dddeYVX7EwVmmxKPCDmwMdddaaatyKVge8oLd2t81",
    })
      .on("ready", () => console.info("Redis Client Connected"))
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect()
  : {
      hKeys: (id) => keys(dict[id] || {}),
      hGet: (key, id) => (dict[key] || {})[id],
      hSet: (key, id, value) => ((dict[key] = dict[key] || {})[id] = value),
    };

const persistence = {
  objects: {
    loadById: async (id) => {
      const obj = await client.hGet("objects", id);
      if (obj === undefined) {
        return undefined;
      }
      return obj;
    },
    loadAllKeys: async () => {
      const objects = await client.hKeys("objects");
      return objects;
    },
    save: async (obj, id) => {
      await client.hSet("objects", id, JSON.stringify(obj));
    },
  },
};

export default persistence;
