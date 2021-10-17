//@ts-check

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://node-1.hska.io:9200/" });

async function count() {
  const count = await client.count(
    {
      index: "songs",
    },
  );

  return count.body;
}

exports.handler = async (event) => {
  const { requestContext: { http: { method, path } } } = event;

  if (path === "/songs" && method === "GET") {
    return await count();
  }

  return {event};
};
