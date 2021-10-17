//@ts-check

const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://node-1.hska.io:9200/" });

exports.handler = async (event) => {
  const count = await client.count(
    {
      index: "game-of-thrones"
    }
  );

  return count.body;
};
