import { createServer, IncomingMessage, ServerResponse } from "http";
import { handler } from "./index";

const port = process.env.PORT || 3333;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { pathname: path, searchParams } = new URL(
        "http://example.com" + req.url ?? ""
      );
      const method = req.method ?? "GET";
      const body = await readBody(req);

      const x = await handler({
        body,
        headers: {},
        httpMethod: method,
        isBase64Encoded: false,
        path,
        pathParameters: {},
        multiValueHeaders: {},
        queryStringParameters: searchParamsToObject(searchParams),
        multiValueQueryStringParameters: null,
        stageVariables: null,
        resource: null,
        requestContext: {
          http: { method, path },
        } as any,
      });

      res.writeHead(
        x.statusCode,
        "",
        headersToString({ ...corsHeaders, ...(x.headers ?? {}) })
      );
      res.write(x.body ?? "");
      res.end();
    } catch (e) {
      console.log("error in serve.ts", e);
    }
  }
);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

function searchParamsToObject(searchParams: URLSearchParams) {
  const obj = {};

  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

function headersToString(headers: {
  [key: string]: string | number | boolean;
}): { [key: string]: string } {
  const obj = {};

  for (const key in headers) {
    obj[key] = headers[key].toString();
  }

  return obj;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (data) => {
      body += data;
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", (e) => {
      reject(e);
    });
  });
}
