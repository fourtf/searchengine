//@ts-check

const router = require('aws-lambda-router');
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://node-1.hska.io:9200/" });


exports.handler = router.handler({
  proxyIntegration: {
    removeBasePath: true,
    routes: [
      {
        path: '/dummy/{id}',
        method: 'GET',
        action: (request, context) => {
          return "Hello " + request.queryStringParameters.name + " for the " + request.paths.id + "th time.";
        }
      },
      {
        path: '/songs',
        method: 'GET',
        action: async (request, context) => {
          return JSON.stringify(await count());
        }
      },
      {
        // request-path-pattern with a path variable:
        path: '/article/:id',
        method: 'GET',
        // we can use the path param 'id' in the action call:
        action: (request, context) => {
            return "You called me with: " + request.paths.id;
        }
      }
    ]
  }
})

async function count() {
  const count = await client.count(
    {
      index: "songs"
    }
  );
  
  return count.body;
}

// exports.handler = async (event) => {
  // const count = await client.count(
    // {
      // index: "songs"
    // }
  // );
// 
  // return count.body;
// };
