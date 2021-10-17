import fastify from "fastify";
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';

const server = fastify({ logger: true });
const client = new Client({ node: 'http://node-1.hska.io:9200' });
const SERVER_PORT = 3001;

// Declare a route for dummy call
server.get("/dummy", async(request, reply) => {
  const result = await client.search({
    index: 'game-of-thrones',
    body: {
      query: {
        match: {
          character: 'Ned Stark'
        }
      }
    }
  })
  return result.body;
});

// Declare a route
server.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Run the server!
const start = async () => {
  try {
    await server.listen(SERVER_PORT);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
