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

async function search(event) {
  const result = await client.search({
    index: 'songs',
    body: {
      query: {
        match: {
          artists: event.queryStringParameters?.q
        }
      }
    }
  });
  return result.body;
}

exports.handler = async (event) => {
  const { requestContext: { http: { method, path } } } = event;

  if (path === "/songs" && method === "GET") {
    return await count();
  }
  if (path == "/search" && method === "GET") {
    return await search(event);
  }
  if (path == "/typing" && method === "GET") {
    // todo: implement typing
  }

  return event;
};
