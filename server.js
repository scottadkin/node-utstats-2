const { createServer } = require("http")
const { parse } = require("url");
const next = require("next");
const {websitePort, imageServerPort} = require("./config.json");

const express = require("express");

const eApp = express();

eApp.use(express.static("./public/images/"));

eApp.listen(imageServerPort);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ?? websitePort;

console.log(`port = ${port}`);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})