import { createServer, IncomingMessage, ServerResponse } from "http";
import { handler } from "./index";

const port = process.env.PORT || 3333;

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { pathname: path, searchParams } = new URL(
        "http://example.com" + req.url ?? ""
      );
      const method = req.method ?? "GET";

      const x = await handler({
        body: await readBody(req),
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

      res.writeHead(x.statusCode, "", headersToString(x.headers ?? {}));
      res.write(x.body ?? "");
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
