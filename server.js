const http = require("http");

const port = Number(process.env.PORT) || 8080;
const host = "0.0.0.0";

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("not found");
});

server.listen(port, host, () => {
  console.log(`listening on http://${host}:${port}`);
});
