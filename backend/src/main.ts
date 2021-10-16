import fastify from "fastify";

const server = fastify({ logger: true });

// Declare a route
server.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Run the server!
const start = async () => {
  try {
    await server.listen(3001);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
